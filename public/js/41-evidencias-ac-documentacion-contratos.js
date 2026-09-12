/*
 * SGRT — Hotfix 41 v2 (2026-09-11)
 * Evidencias de Ambiente de Control — persistencia y visibilidad entre roles.
 *
 * Objetivos:
 * - NO borrar ni reemplazar evidencias locales cuando llega un estado remoto más antiguo.
 * - Recuperar evidencias ya adjuntadas (EVID_CUEST / sgrt_v8 / repositorio histórico).
 * - Guardar una copia resistente en IndexedDB para evitar pérdidas por límite de localStorage.
 * - Sincronizar evidencias dentro del estado extendido del tercero para compartirlas entre roles.
 * - Mostrar la misma carpeta en Evaluador y Administrador de Riesgos:
 *   Documentación y Evidencias -> Evidencias de Ambiente de Control
 *   -> Tercero/NIT -> Contrato <número> -> archivos.
 * - Mantener las evidencias visibles también en el control donde fueron adjuntadas.
 * - No mostrar la tarjeta duplicada de evidencias dentro del reporte del Administrador de Riesgos.
 */
(function(){
  'use strict';

  var ROOT_ID='f_ev_ac_virtual';
  var ROOT_NAME='Evidencias de Ambiente de Control';
  var HIST='Sin contrato / histórico';
  var META_KEY='sgrt_evidencias_ac_meta_v2';
  var IDB_NAME='SGRT_EVIDENCIAS_AC';
  var IDB_STORE='evidencias';
  var remoteBusy=false, remoteLast=0;
  var remoteTimers={}, remoteRunning={};
  var recoveryRunning=false;

  function norm(v){ return String(v==null?'':v).trim(); }
  function escId(v){ return norm(v).replace(/[^a-z0-9_-]/gi,'_'); }
  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function db(){ if(!window.TERCEROS_DB)window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function role(){ return norm((window.currentUser||{}).rol); }
  function isAdminRiesgos(){ var r=role(); return r==='Operativo'||r==='admin_riesgos'||r==='Administrador de Riesgos'; }
  function apiBase(){
    try{return norm((typeof API_BASE!=='undefined'&&API_BASE)?API_BASE:(window.API_BASE||''));}
    catch(e){return norm(window.API_BASE||'');}
  }
  function hashText(s){
    s=String(s||'');var h=2166136261;
    for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}
    return (h>>>0).toString(36);
  }
  function allContracts(t){
    var out=[];
    ((t&&t.contratos)||[]).forEach(function(c){
      var n=norm(c&&(c.num||c.numero||c.NoContrato));
      if(n&&out.indexOf(n)<0)out.push(n);
    });
    if(t&&t.dimsPorContrato)Object.keys(t.dimsPorContrato).forEach(function(n){n=norm(n);if(n&&out.indexOf(n)<0)out.push(n);});
    return out;
  }
  function contractForRecord(t,rec,allowDom){
    var c=norm(rec&&rec.contrato);
    if(c)return c;
    var nums=allContracts(t||{});
    var ce=norm(t&&t.contratoEval);
    if(ce&&(nums.indexOf(ce)>=0||!nums.length))return ce;
    if(nums.length===1)return nums[0];
    if(allowDom){
      c=norm((document.getElementById('q-contrato-sel')||{}).value)||norm((document.getElementById('ac-contrato-sel')||{}).value);
      if(c)return c;
    }
    return HIST;
  }
  function activeContract(t){ return contractForRecord(t,null,true); }

  function resolveByNitKey(nitKey){
    nitKey=norm(nitKey);var found=null;
    Object.keys(db()).some(function(nit){
      var t=db()[nit]||{},raw=norm(t.nit||nit),k=raw.replace(/[^a-z0-9]/gi,'_');
      if(k===nitKey||raw===nitKey){found={nit:raw,t:t,key:nit};return true;}return false;
    });
    if(found)return found;
    var selected=norm((document.getElementById('q-tercero')||{}).value)||norm(window.nitActual);
    if(selected&&db()[selected])return {nit:selected,t:db()[selected],key:selected};
    return null;
  }
  function resolveNit(nit){
    nit=norm(nit);if(!nit)return null;
    if(db()[nit])return {nit:nit,t:db()[nit],key:nit};
    return resolveByNitKey(nit.replace(/[^a-z0-9]/gi,'_'));
  }

  function evidenceMap(t){
    if(!t.evidenciasACPorContrato||typeof t.evidenciasACPorContrato!=='object'||Array.isArray(t.evidenciasACPorContrato))t.evidenciasACPorContrato={};
    return t.evidenciasACPorContrato;
  }
  function recFingerprint(rec){
    return [norm(rec.name||rec.nombre),Number(rec.size||0),norm(rec.tipologia),norm(rec.control),norm(rec.fecha).slice(0,19)].join('|');
  }
  function normalizeRec(rec,nit,contrato){
    rec=rec||{};nit=norm(rec.nit||nit);contrato=norm(rec.contrato||contrato)||HIST;
    var name=norm(rec.name||rec.nombre)||'evidencia';
    var fecha=norm(rec.fecha)||new Date().toISOString();
    var out={
      id:norm(rec.id),name:name,size:Number(rec.size||0),type:norm(rec.type||rec.tipo),
      dataUrl:rec.dataUrl||rec.dataURL||'',fecha:fecha,nit:nit,tercero:norm(rec.tercero),
      contrato:contrato,tipologia:norm(rec.tipologia||rec.key),control:norm(rec.control||rec.ctrlN),
      cargadoPor:norm(rec.cargadoPor||rec.subidoPor)||'Evaluador',
      origen:norm(rec.origen)||'Cuestionario Ambiente de Control'
    };
    if(!out.id)out.id='evac_'+hashText([nit,contrato,recFingerprint(out)].join('|'));
    return out;
  }
  function sameRec(a,b){
    if(!a||!b)return false;
    if(norm(a.id)&&norm(b.id)&&norm(a.id)===norm(b.id))return true;
    var sameBasic=norm(a.name||a.nombre)===norm(b.name||b.nombre)&&Number(a.size||0)===Number(b.size||0);
    if(!sameBasic)return false;
    var at=norm(a.tipologia),bt=norm(b.tipologia),ac=norm(a.control),bc=norm(b.control);
    if((!at&&!ac)||(!bt&&!bc))return true;
    return at===bt&&ac===bc;
  }
  function mergeRec(arr,rec){
    if(!Array.isArray(arr))return false;
    var idx=-1;
    for(var i=0;i<arr.length;i++){if(sameRec(arr[i],rec)){idx=i;break;}}
    if(idx<0){arr.push(rec);return true;}
    var old=arr[idx]||{},merged=Object.assign({},old,rec);
    if(old.dataUrl&&!rec.dataUrl)merged.dataUrl=old.dataUrl;
    if(old.dataURL&&!rec.dataUrl&&!rec.dataURL)merged.dataUrl=old.dataURL;
    if(!merged.id)merged.id=old.id||rec.id;
    arr[idx]=merged;
    return JSON.stringify(old)!==JSON.stringify(merged);
  }
  function mergeMapInto(t,incoming){
    if(!incoming||typeof incoming!=='object')return false;
    var map=evidenceMap(t),changed=false;
    Object.keys(incoming).forEach(function(c){
      var contrato=norm(c)||HIST;if(!Array.isArray(map[contrato]))map[contrato]=[];
      (incoming[c]||[]).forEach(function(r){
        var rec=normalizeRec(r,norm(t.nit),contrato);if(mergeRec(map[contrato],rec))changed=true;
      });
    });
    return changed;
  }
  function mapSignature(map){
    var out=[];Object.keys(map||{}).sort().forEach(function(c){(map[c]||[]).forEach(function(r){out.push(c+'|'+norm(r.id)+'|'+recFingerprint(r)+'|'+(r.dataUrl||r.dataURL?'1':'0'));});});
    return out.sort().join('~');
  }

  /* ---------- Copia resistente de archivos (IndexedDB) ---------- */
  function openIDB(){
    return new Promise(function(resolve,reject){
      if(!window.indexedDB){reject(new Error('IndexedDB no disponible'));return;}
      var req=indexedDB.open(IDB_NAME,1);
      req.onupgradeneeded=function(){var d=req.result;if(!d.objectStoreNames.contains(IDB_STORE))d.createObjectStore(IDB_STORE,{keyPath:'id'});};
      req.onsuccess=function(){resolve(req.result);};req.onerror=function(){reject(req.error||new Error('Error IndexedDB'));};
    });
  }
  function idbPut(rec){
    return openIDB().then(function(d){return new Promise(function(resolve){
      try{var tx=d.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).put(clone(rec));tx.oncomplete=function(){d.close();resolve(true);};tx.onerror=function(){d.close();resolve(false);};}
      catch(e){try{d.close();}catch(ex){}resolve(false);}
    });}).catch(function(){return false;});
  }
  function idbDelete(id){
    id=norm(id);if(!id)return Promise.resolve(false);
    return openIDB().then(function(d){return new Promise(function(resolve){
      try{var tx=d.transaction(IDB_STORE,'readwrite');tx.objectStore(IDB_STORE).delete(id);tx.oncomplete=function(){d.close();resolve(true);};tx.onerror=function(){d.close();resolve(false);};}
      catch(e){try{d.close();}catch(ex){}resolve(false);}
    });}).catch(function(){return false;});
  }
  function idbAll(){
    return openIDB().then(function(d){return new Promise(function(resolve){
      try{var tx=d.transaction(IDB_STORE,'readonly'),rq=tx.objectStore(IDB_STORE).getAll();rq.onsuccess=function(){var x=rq.result||[];d.close();resolve(x);};rq.onerror=function(){d.close();resolve([]);};}
      catch(e){try{d.close();}catch(ex){}resolve([]);}
    });}).catch(function(){return [];});
  }

  function metadataSnapshot(){
    var snap={version:2,updatedAt:new Date().toISOString(),byNit:{}};
    Object.keys(db()).forEach(function(k){
      var t=db()[k]||{},nit=norm(t.nit||k),map=t.evidenciasACPorContrato||{},clean={};
      Object.keys(map).forEach(function(c){clean[c]=(map[c]||[]).map(function(r){var x=normalizeRec(r,nit,c);delete x.dataUrl;return x;});});
      if(Object.keys(clean).length)snap.byNit[nit]=clean;
    });
    return snap;
  }
  function persistMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(metadataSnapshot()));}catch(e){}}
  function loadMeta(){
    try{
      var m=JSON.parse(localStorage.getItem(META_KEY)||'{}');
      Object.keys((m&&m.byNit)||{}).forEach(function(nit){var rt=resolveNit(nit);if(rt)mergeMapInto(rt.t,m.byNit[nit]);});
    }catch(e){}
  }
  function persistLocal(){
    persistMeta();
    try{if(window._lsSave)window._lsSave();}catch(e){}
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
  }

  /* ---------- Rehidratar la lista inline del Evaluador ---------- */
  function legacyStore(){
    try{if(window.EVID_CUEST&&typeof window.EVID_CUEST==='object')return window.EVID_CUEST;}catch(e){}
    try{if(typeof EVID_CUEST!=='undefined'&&EVID_CUEST)return EVID_CUEST;}catch(e){}
    return null;
  }
  function legacyKey(nit,key,control){return norm(nit).replace(/[^a-z0-9]/gi,'_')+'_'+norm(key)+'_'+norm(control);}
  function materializeSharedIntoLegacy(){
    var EV=legacyStore();if(!EV)return;
    var touched={};
    Object.keys(db()).forEach(function(k){
      var t=db()[k]||{},nit=norm(t.nit||k),map=t.evidenciasACPorContrato||{};
      Object.keys(map).forEach(function(c){(map[c]||[]).forEach(function(raw){
        var rec=normalizeRec(raw,nit,c);if(!rec.tipologia||!rec.control)return;
        var sk=legacyKey(nit,rec.tipologia,rec.control);if(!Array.isArray(EV[sk]))EV[sk]=[];
        var item={id:rec.id,name:rec.name,size:rec.size,type:rec.type,dataUrl:rec.dataUrl,fecha:rec.fecha,contrato:rec.contrato,tipologia:rec.tipologia,control:rec.control,origen:rec.origen};
        if(mergeRec(EV[sk],item))touched[sk]=true;
      });});
    });
    Object.keys(touched).forEach(function(sk){
      try{var p=sk.split('_'),ctrl=p.pop(),key=p.pop(),nk=p.join('_');if(typeof window.renderEvCuest==='function')window.renderEvCuest(nk,key,ctrl);else if(typeof renderEvCuest==='function')renderEvCuest(nk,key,ctrl);}catch(e){}
    });
  }

  /* ---------- Recuperación de evidencias ya existentes ---------- */
  function migrateLegacyEvidCuest(){
    var EV=legacyStore(),changedNits={};if(!EV)return changedNits;
    Object.keys(EV).forEach(function(sk){
      var parts=sk.split('_');if(parts.length<3)return;
      var ctrl=parts.pop(),key=parts.pop(),nitKey=parts.join('_'),rt=resolveByNitKey(nitKey);if(!rt)return;
      var t=rt.t,nit=rt.nit;
      (EV[sk]||[]).forEach(function(raw){
        var c=contractForRecord(t,raw,false),rec=normalizeRec(Object.assign({},raw,{tipologia:key,control:ctrl}),nit,c),map=evidenceMap(t);
        if(!Array.isArray(map[c]))map[c]=[];
        if(mergeRec(map[c],rec))changedNits[nit]=t;
        idbPut(rec);
      });
    });
    return changedNits;
  }
  function migrateSavedV8(){
    try{
      var st=JSON.parse(localStorage.getItem('sgrt_v8')||'{}'),saved=st&&st.EVID_CUEST;
      if(!saved||typeof saved!=='object')return;
      var EV=legacyStore();if(!EV)return;
      Object.keys(saved).forEach(function(sk){if(!Array.isArray(EV[sk]))EV[sk]=[];(saved[sk]||[]).forEach(function(r){mergeRec(EV[sk],r);});});
    }catch(e){}
  }
  function findNitFromContext(node,ctx){
    var n=norm(node&&(node.nit||node.tercero));if(n){var rt=resolveNit(n);if(rt)return rt.nit;}
    if(ctx&&ctx.nit)return ctx.nit;
    var name=norm(node&&node.name),m=name.match(/\(([^()]+)\)\s*$/);if(m&&resolveNit(m[1]))return resolveNit(m[1]).nit;
    if(resolveNit(name))return resolveNit(name).nit;
    return '';
  }
  function migrateHistoricalRepo(){
    var fs=null;try{fs=JSON.parse(localStorage.getItem('od_sgrt_v8')||'null');}catch(e){}if(!fs)return {};
    var changedNits={};
    function walk(n,ctx){
      if(!n)return;ctx=Object.assign({},ctx||{});
      if(n.type==='folder'){
        var nn=norm(n.name);ctx.nit=findNitFromContext(n,ctx)||ctx.nit||'';
        var cm=nn.match(/^Contrato\s+(.+)$/i);if(cm)ctx.contrato=norm(cm[1]);
        if(/evidencias?\s*(de\s*)?(ambiente\s*de\s*control|ambiente|ac|controles?)/i.test(nn))ctx.inEvidence=true;
      }
      if(n.type==='file'&&ctx.inEvidence&&(n.dataURL||n.dataUrl)){
        var nit=findNitFromContext(n,ctx),rt=resolveNit(nit);if(rt){
          var ext=norm(n.name).toLowerCase();
          if(!/^ac_.*\.json$/i.test(ext)){
            var c=norm(n.contrato||ctx.contrato)||contractForRecord(rt.t,n,false);
            var rec=normalizeRec({id:n.id,name:n.name,size:n.size,type:n.typeFile||n.mime||'',dataUrl:n.dataUrl||n.dataURL,fecha:n.fecha,contrato:c,tipologia:n.tipologia||n._tip,control:n.control||n._ctrl,origen:'Repositorio histórico'},rt.nit,c);
            var map=evidenceMap(rt.t);if(!Array.isArray(map[c]))map[c]=[];if(mergeRec(map[c],rec))changedNits[rt.nit]=rt.t;idbPut(rec);
          }
        }
      }
      (n.children||[]).forEach(function(ch){walk(ch,ctx);});
    }
    walk(fs,{});return changedNits;
  }
  function recoverAllLocal(){
    if(recoveryRunning)return Promise.resolve(false);recoveryRunning=true;
    migrateSavedV8();loadMeta();
    var a=migrateLegacyEvidCuest(),b=migrateHistoricalRepo(),changed=Object.assign({},a,b);
    return idbAll().then(function(items){
      (items||[]).forEach(function(raw){var rt=resolveNit(raw.nit);if(!rt)return;var c=norm(raw.contrato)||contractForRecord(rt.t,raw,false),rec=normalizeRec(raw,rt.nit,c),map=evidenceMap(rt.t);if(!Array.isArray(map[c]))map[c]=[];if(mergeRec(map[c],rec))changed[rt.nit]=rt.t;});
      materializeSharedIntoLegacy();persistLocal();syncVirtualRepo();
      Object.keys(changed).forEach(function(nit){queueRemote(changed[nit],nit,false);});
      recoveryRunning=false;return Object.keys(changed).length>0;
    }).catch(function(){materializeSharedIntoLegacy();persistLocal();syncVirtualRepo();recoveryRunning=false;return Object.keys(changed).length>0;});
  }

  // Expuesto para que el consolidado final pueda forzar una recuperación al entrar a Documentación y Evidencias.
  window._sgrt41RecoverEvidencias=recoverAllLocal;

  /* ---------- Alta / eliminación desde el cuestionario ---------- */
  window._sgrt41RegistrarEvidenciaAC=function(file,dataUrl,nitKey,key,ctrlN){
    try{
      var rt=resolveByNitKey(nitKey);if(!rt||!rt.t)return false;
      var t=rt.t,nit=rt.nit,contrato=activeContract(t),map=evidenceMap(t);if(!Array.isArray(map[contrato]))map[contrato]=[];
      var rec=normalizeRec({
        id:'evac_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),name:(file&&file.name)||'evidencia',size:Number((file&&file.size)||0),type:(file&&file.type)||'',
        dataUrl:dataUrl||'',fecha:new Date().toISOString(),nit:nit,tercero:t.nombre||nit,contrato:contrato,tipologia:key||'',control:String(ctrlN==null?'':ctrlN),
        cargadoPor:(window.currentUser||{}).name||'Evaluador',origen:'Cuestionario Ambiente de Control'
      },nit,contrato);
      mergeRec(map[contrato],rec);t.evidenciasACPorContrato=map;t.evidenciasACActualizadas=new Date().toISOString();t._changed=true;t.sincronizado=false;
      idbPut(rec);persistLocal();syncVirtualRepo();queueRemote(t,nit,true);return rec;
    }catch(e){console.warn('[SGRT41] registrar evidencia:',e);return false;}
  };

  window._sgrt41EliminarEvidenciaAC=function(raw,nitKey,key,ctrlN){
    try{
      var rt=resolveByNitKey(nitKey);if(!rt||!rt.t)return false;var t=rt.t,nit=rt.nit,map=evidenceMap(t),removed=[];
      var targetContract=norm(raw&&raw.contrato)||activeContract(t);
      Object.keys(map).forEach(function(c){
        if(targetContract&&targetContract!==HIST&&norm(c)!==targetContract)return;
        map[c]=(map[c]||[]).filter(function(x){
          var match=(raw&&norm(raw.id)&&norm(x.id)===norm(raw.id))||
            (norm(x.name)===norm(raw&&raw.name)&&Number(x.size||0)===Number(raw&&raw.size||0)&&norm(x.tipologia||key)===norm(key)&&norm(x.control||ctrlN)===norm(ctrlN));
          if(match)removed.push(x);return !match;
        });
      });
      removed.forEach(function(x){idbDelete(x.id);});t.evidenciasACActualizadas=new Date().toISOString();t._changed=true;t.sincronizado=false;
      persistLocal();syncVirtualRepo();queueRemote(t,nit,false);return removed.length>0;
    }catch(e){return false;}
  };

  /* El botón X original solo quitaba EVID_CUEST. Ahora también elimina la copia compartida. */
  function installDeleteHook(){
    var old=window.elimEvCuest;if(typeof old!=='function'||old.__sgrt41)return;
    var wrap=function(btn){
      try{
        var sk=btn&&btn.getAttribute&&btn.getAttribute('data-sk'),idx=parseInt(btn&&btn.getAttribute&&btn.getAttribute('data-idx'),10),EV=legacyStore(),raw=EV&&EV[sk]&&EV[sk][idx];
        if(sk){var p=sk.split('_'),ctrl=p.pop(),key=p.pop(),nk=p.join('_');window._sgrt41EliminarEvidenciaAC(raw||{},nk,key,ctrl);}
      }catch(e){}
      return old.apply(this,arguments);
    };wrap.__sgrt41=true;window.elimEvCuest=wrap;
  }

  /* ---------- Sincronización remota, siempre por MERGE ---------- */
  function queueRemote(t,nit,notify){
    nit=norm(nit||(t&&t.nit));if(!nit||!t)return;clearTimeout(remoteTimers[nit]);
    remoteTimers[nit]=setTimeout(function run(){
      if(typeof window._sgrtUpsertEstadoCompleto!=='function')return;
      if(remoteRunning[nit]){remoteTimers[nit]=setTimeout(run,1800);return;}
      remoteRunning[nit]=true;
      try{
        Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).then(function(res){
          if(res===false||(res&&res.ok===false))throw new Error('El servidor no confirmó el guardado');
          t._changed=false;t.sincronizado=true;persistLocal();
          if(notify)try{window.showToast&&window.showToast('✅ Evidencia guardada y sincronizada. Ya puede verla el otro rol.','success',2800);}catch(e){}
        }).catch(function(e){
          t._changed=true;t.sincronizado=false;persistLocal();console.warn('[SGRT41] Evidencia pendiente de sincronización:',e);
          if(notify)try{window.showToast&&window.showToast('⚠️ La evidencia quedó protegida en este equipo, pero falta sincronizarla con el servidor.','warning',4200);}catch(ex){}
        }).finally(function(){delete remoteRunning[nit];});
      }catch(e){delete remoteRunning[nit];}
    },450);
  }

  function visibleNits(){
    var u=window.currentUser||{},ent=norm(u.entidad).toLowerCase(),out=[];
    Object.keys(db()).forEach(function(k){var t=db()[k]||{},te=norm(t.entidad).toLowerCase();if((u.rol==='Cliente'||u.rol==='evaluador')&&ent&&te&&te!==ent)return;out.push(k);});
    return out;
  }
  function hydrateRemoteEvidence(force){
    var api=apiBase();if(!api||remoteBusy||(!force&&Date.now()-remoteLast<12000))return Promise.resolve(false);
    var nits=visibleNits();if(!nits.length)return Promise.resolve(false);
    remoteBusy=true;remoteLast=Date.now();var idx=0,changed=false,base=api.replace(/\/$/,'');
    function worker(){
      if(idx>=nits.length)return Promise.resolve();var key=nits[idx++],local=db()[key]||{},nit=norm(local.nit||key),before=mapSignature(local.evidenciasACPorContrato||{});
      return fetch(base+'/api/sgrt-state/'+encodeURIComponent(nit),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
        var sx=j&&j.ok&&j.data?j.data:null;if(!sx)return;var remote=(sx.estado_sgrt&&typeof sx.estado_sgrt==='object')?sx.estado_sgrt:sx;if(!remote||typeof remote!=='object')return;
        var remoteMap=remote.evidenciasACPorContrato&&typeof remote.evidenciasACPorContrato==='object'?remote.evidenciasACPorContrato:{};
        var remoteSig=mapSignature(remoteMap);mergeMapInto(local,remoteMap);
        if(remote.evidenciasACActualizadas)local.evidenciasACActualizadas=remote.evidenciasACActualizadas;
        if(!local.nombre&&remote.nombre)local.nombre=remote.nombre;db()[key]=local;
        var after=mapSignature(local.evidenciasACPorContrato||{});if(after!==before)changed=true;
        // Si local contiene algo que el remoto aún no tiene, volver a subirlo; nunca se borra local por hidratar.
        if(after&&after!==remoteSig)queueRemote(local,nit,false);
      }).catch(function(){}).then(worker);
    }
    var jobs=[];for(var i=0;i<Math.min(2,nits.length);i++)jobs.push(worker());
    return Promise.all(jobs).then(function(){remoteBusy=false;materializeSharedIntoLegacy();persistLocal();syncVirtualRepo();return changed;}).catch(function(){remoteBusy=false;return false;});
  }
  window._sgrt41HydrateEvidencias=hydrateRemoteEvidence;

  /* ---------- Carpeta virtual común para ambos roles ---------- */
  function addVirtualEvidence(root,t,nit,contrato,raw){
    var rec=normalizeRec(raw,nit,contrato),tName=norm(t.nombre)||nit,thirdId='evac_t_'+escId(nit),third=(root.children||[]).find(function(x){return x.id===thirdId;});
    if(!third){third={id:thirdId,name:tName+' ('+nit+')',type:'folder',children:[],__sgrt41Virtual:true,_nit:nit};root.children.push(third);}
    var cLabel=contrato===HIST?HIST:'Contrato '+contrato,contractId=thirdId+'_c_'+escId(contrato),folder=(third.children||[]).find(function(x){return x.id===contractId;});
    if(!folder){folder={id:contractId,name:cLabel,type:'folder',children:[],__sgrt41Virtual:true,_contrato:contrato};third.children.push(folder);}
    var fid='evac_file_'+escId(rec.id),exists=(folder.children||[]).find(function(x){return x.id===fid||sameRec(x,rec);});
    if(!exists)folder.children.push({id:fid,name:rec.name,type:'file',size:rec.size,fecha:rec.fecha,dataURL:rec.dataUrl,__sgrt41Virtual:true,tercero:nit,contrato:contrato,_tip:rec.tipologia,_ctrl:rec.control,_origen:'Evaluador · Ambiente de Control'});
    else if(!exists.dataURL&&rec.dataUrl)exists.dataURL=rec.dataUrl;
  }
  function syncVirtualRepo(){
    try{
      var fs=window._odFS;if(!fs){try{fs=JSON.parse(localStorage.getItem('od_sgrt_v8')||'{}');}catch(e){fs=null;}if(!fs||typeof fs!=='object')return;window._odFS=fs;}
      fs.children=fs.children||[];
      fs.children=fs.children.filter(function(x){var n=norm(x&&x.name).toLowerCase();return x.id!==ROOT_ID&&n!=='evidencias ambiente de control'&&n!=='evidencias de ambiente de control';});
      var root={id:ROOT_ID,name:ROOT_NAME,type:'folder',children:[],__sgrt41Virtual:true};
      Object.keys(db()).forEach(function(k){var t=db()[k]||{},nit=norm(t.nit||k),map=t.evidenciasACPorContrato||{};Object.keys(map).sort(function(a,b){return String(a).localeCompare(String(b),'es',{numeric:true});}).forEach(function(c){(map[c]||[]).forEach(function(rec){addVirtualEvidence(root,t,nit,c,rec);});});});
      root.children.sort(function(a,b){return a.name.localeCompare(b.name,'es',{numeric:true});});
      root.children.forEach(function(tf){(tf.children||[]).sort(function(a,b){return a.name.localeCompare(b.name,'es',{numeric:true});});(tf.children||[]).forEach(function(cf){(cf.children||[]).sort(function(a,b){return a.name.localeCompare(b.name,'es',{numeric:true});});});});
      fs.children.unshift(root);window._odFS=fs;try{if(window.odRender)window.odRender();}catch(e){}
    }catch(e){console.warn('[SGRT41] repositorio virtual:',e);}
  }
  window._sgrt41SyncEvidenciasRepo=syncVirtualRepo;
  function insideVirtual(){try{return (window._odPath||[]).some(function(p){return p&&p.id===ROOT_ID;});}catch(e){return false;}}

  function installRepoHooks(){
    if(typeof window.odInit==='function'&&!window.odInit.__sgrt41){
      var oldInit=window.odInit,init=function(){var r=oldInit.apply(this,arguments);recoverAllLocal().then(function(){syncVirtualRepo();hydrateRemoteEvidence(false);});return r;};init.__sgrt41=true;window.odInit=init;
    }
    if(typeof window.odSave==='function'&&!window.odSave.__sgrt41){
      var oldSave=window.odSave,save=function(){
        // La carpeta automática se reconstruye desde el estado compartido. No se duplica base64 en od_sgrt_v8.
        var fs=window._odFS,virt=null,idx=-1;try{if(fs&&fs.children){idx=fs.children.findIndex(function(x){return x.id===ROOT_ID;});if(idx>=0)virt=fs.children.splice(idx,1)[0];}}catch(e){}
        var r=oldSave.apply(this,arguments);try{if(fs&&virt){fs.children.splice(idx<0?0:idx,0,virt);window._odFS=fs;}}catch(e){}return r;
      };save.__sgrt41=true;window.odSave=save;
    }
    if(typeof window.odRender==='function'&&!window.odRender.__sgrt41){
      var oldRender=window.odRender,render=function(){
        var fs=window._odFS,hidden=[],isRoot=!((window._odPath||[]).length);
        if(isRoot&&fs&&fs.children){for(var i=fs.children.length-1;i>=0;i--){var x=fs.children[i],n=norm(x&&x.name).toLowerCase();if(x&&(x.id==='f_ac'||x.id==='f_ev'||n==='ambiente de control'||n==='evidencias de controles'))hidden.unshift({i:i,x:fs.children.splice(i,1)[0]});}}
        var r=oldRender.apply(this,arguments);if(fs&&hidden.length){hidden.forEach(function(h){fs.children.splice(h.i,0,h.x);});window._odFS=fs;}return r;
      };render.__sgrt41=true;window.odRender=render;
    }
    if(typeof window.odSubirArchivos==='function'&&!window.odSubirArchivos.__sgrt41){
      var oldUp=window.odSubirArchivos,up=function(){if(insideVirtual()){try{window.showToast&&window.showToast('Esta carpeta se alimenta automáticamente con las evidencias adjuntadas por el Evaluador en Ambiente de Control.','info',3800);}catch(e){}return false;}return oldUp.apply(this,arguments);};up.__sgrt41=true;window.odSubirArchivos=up;
    }
    ['odDel','odRenombrar','odDelSel'].forEach(function(fn){var old=window[fn];if(typeof old!=='function'||old.__sgrt41)return;var wrap=function(){if(insideVirtual()){try{window.showToast&&window.showToast('Las evidencias de Ambiente de Control se administran desde el cuestionario del Evaluador.','info',3000);}catch(e){}return false;}return old.apply(this,arguments);};wrap.__sgrt41=true;window[fn]=wrap;});
  }

  function hideEvidenceFromAdminReports(){
    if(typeof window._rptEvidenciasCard==='function'&&!window._rptEvidenciasCard.__sgrt41){var old=window._rptEvidenciasCard,card=function(){if(isAdminRiesgos())return '';return old.apply(this,arguments);};card.__sgrt41=true;window._rptEvidenciasCard=card;}
  }
  function polishLabels(){
    try{
      document.querySelectorAll('.nav-item[onclick*="pg-evidencias-repo"] .lbl').forEach(function(el){el.textContent='Documentación y Evidencias';});
      document.querySelectorAll('.nav-sec').forEach(function(el){if(/documentaci[oó]n\s*(\/|y|o)?\s*evidencias?/i.test(norm(el.textContent)))el.textContent='Documentación y Evidencias';});
      var pg=document.getElementById('pg-evidencias-repo');if(pg){var title=pg.querySelector('div[style*="font-size:20px"]');if(title)title.textContent='Documentación y Evidencias';}
    }catch(e){}
  }

  /* Cuando el cuestionario se vuelve a renderizar, reconstruir las fichas de archivos compartidos. */
  function installQuestionnaireObserver(){
    var root=document.getElementById('q-secciones-wrap')||document.getElementById('cq-panel-cuest');if(!root||!window.MutationObserver)return;
    var timer=null;new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(function(){materializeSharedIntoLegacy();},120);}).observe(root,{childList:true,subtree:true});
  }

  function init(){
    installRepoHooks();installDeleteHook();hideEvidenceFromAdminReports();polishLabels();installQuestionnaireObserver();
    recoverAllLocal().then(function(){syncVirtualRepo();hydrateRemoteEvidence(false);});
    setTimeout(function(){installRepoHooks();installDeleteHook();hideEvidenceFromAdminReports();polishLabels();recoverAllLocal();},700);
    setTimeout(function(){installRepoHooks();installDeleteHook();hideEvidenceFromAdminReports();polishLabels();materializeSharedIntoLegacy();},1800);
    document.addEventListener('click',function(e){
      setTimeout(polishLabels,30);
      var el=e.target&&e.target.closest?e.target.closest('.nav-item[onclick*="pg-evidencias-repo"]'):null;
      if(el)setTimeout(function(){recoverAllLocal().then(function(){hydrateRemoteEvidence(true).then(syncVirtualRepo);});},80);
    },true);
    document.addEventListener('change',function(e){var id=(e.target&&e.target.id)||'';if(id==='q-tercero'||id==='q-contrato-sel')setTimeout(function(){recoverAllLocal().then(materializeSharedIntoLegacy);},120);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
