/*
 * SGRT — V37 · Evidencias múltiples compartidas / estabilidad
 * Ajustes puntuales solicitados el 08-10-2026.
 * - Evidencias de Ambiente de Control quedan en BD y son visibles entre sesiones/usuarios.
 * - "Ver" abre la evidencia dentro del SGRT usando el visor existente (PDF/Word/Excel/PPT/imagen).
 * - Documentación / Evidencia se reconstruye automáticamente con metadata remota.
 * - Refresco liviano en foco y cada 20 s, sin recargar toda la aplicación ni duplicar intervalos pesados.
 * - Sincroniza cambios de configuración del tercero actual (controles/tipologías) sin reemplazar respuestas locales pendientes.
 */
(function(){
  'use strict';
  var syncBusy=false, stateBusy=false, lastEvidenceSig='', lastStateVersion={}, lastInteractionAt=0, MAX_BYTES=20*1024*1024;
  function s(v){return String(v==null?'':v).trim();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function api(){return s(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function db(){return window.TERCEROS_DB||{};}
  function safe(v){return s(v).replace(/[^a-z0-9_-]/gi,'_');}
  function actor(){var u=window.currentUser||{};return {login:s(u.login||u.user),name:s(u.name||u.nombre),rol:s(u.rol)};}
  function toast(m,t,ms){try{window.showToast&&window.showToast(m,t||'info',ms||3000);}catch(e){}}
  function markInteraction(){lastInteractionAt=Date.now();}
  function userInteracting(){
    var a=document.activeElement,tag=a&&a.tagName;
    if(Date.now()-lastInteractionAt<1800)return true;
    if(tag==='SELECT'||tag==='INPUT'||tag==='TEXTAREA')return true;
    if(document.querySelector('details[open], [aria-expanded="true"], .dropdown-menu.show, .show.dropdown-menu'))return true;
    return false;
  }
  function acPageVisible(){
    var p=document.getElementById('pg-cuestionario');
    if(!p)return false;
    var cs=window.getComputedStyle?p&&getComputedStyle(p):null;
    return !!(p.offsetParent!==null && (!cs||cs.display!=='none'&&cs.visibility!=='hidden'));
  }
  function readFile(file){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error('No se pudo leer el archivo'));};r.readAsDataURL(file);});}
  function currentNit(){var ids=['q-tercero','q-tercero-sel','ac-tercero-instruc','ac-tercero-sel','ctrl-terc-sel'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&s(el.value))return s(el.value);}return '';}
  function currentContract(){var ids=['q-contrato-sel','ac-contrato-sel','ctrl-contrato-sel'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&s(el.value))return s(el.value);}return '';}
  function nitFromKey(nitKey){var nk=s(nitKey);if(db()[nk])return nk;var target=safe(nk).toLowerCase(),keys=Object.keys(db());for(var i=0;i<keys.length;i++){if(safe(keys[i]).toLowerCase()===target)return keys[i];}return currentNit()||nk;}
  function kindFrom(name,mime){var n=s(name).toLowerCase(),m=s(mime).toLowerCase();if(m.indexOf('pdf')>=0||/\.pdf$/.test(n))return 'pdf';if(m.indexOf('word')>=0||/\.docx?$/.test(n))return 'docx';if(m.indexOf('sheet')>=0||m.indexOf('excel')>=0||/\.xlsx?$/.test(n))return 'xlsx';if(m.indexOf('presentation')>=0||m.indexOf('powerpoint')>=0||/\.pptx?$/.test(n))return 'pptx';if(m.indexOf('image/')===0||/\.(png|jpe?g|gif|webp|bmp)$/i.test(n))return 'image';if(m.indexOf('text/')===0||/\.(txt|csv|json|xml)$/i.test(n))return 'text';return 'file';}

  function repo(){try{return JSON.parse(localStorage.getItem('od_sgrt_v8')||'null')||{id:'root',name:'Documentación',type:'folder',children:[]};}catch(e){return {id:'root',name:'Documentación',type:'folder',children:[]};}}
  function folder(parent,id,name){parent.children=parent.children||[];var f=parent.children.find(function(x){return x&&x.type==='folder'&&x.id===id;});if(!f){f={id:id,name:name,type:'folder',children:[]};parent.children.push(f);}else f.name=name;return f;}
  function saveRepo(root,render){try{localStorage.setItem('od_sgrt_v8',JSON.stringify(root));if(render!==false){window.odRender&&window.odRender();window.adminOdInit&&window.adminOdInit();}}catch(e){}}
  function upsertRepoEvidence(meta,root){
    root=root||repo();var ac=folder(root,'f_ac_server','Ambiente de Control'),t=db()[meta.nit]||{},tf=folder(ac,'f_ac_server_'+safe(meta.nit),(t.nombre||meta.nit)+' ('+meta.nit+')'),cf=folder(tf,'f_ac_server_'+safe(meta.nit)+'_'+safe(meta.contrato),'Contrato '+meta.contrato),tip=folder(cf,'f_ac_server_'+safe(meta.nit)+'_'+safe(meta.contrato)+'_'+safe(meta.tipologiaKey||meta.tipologia),meta.tipologia||meta.tipologiaKey||'Tipología');
    tip.children=tip.children||[];var rid='repo_'+meta.id,item=tip.children.find(function(x){return x&&x.id===rid;});
    var next={id:rid,name:meta.name||'Evidencia',type:'file',size:Number(meta.size||0),fecha:meta.fecha||meta.uploadedAt||'',mime:meta.type||meta.mime||'',_evidId:meta.id,_nit:meta.nit,_contrato:meta.contrato,_tip:meta.tipologiaKey||meta.tipologia,_ctrl:meta.control,_origen:'Ambiente de Control',_serverEvidence:true};
    if(item)Object.assign(item,next);else tip.children.push(next);return root;
  }
  function removeRepoEvidence(id){var root=repo(),rid='repo_'+id;function walk(n){if(!n||!n.children)return;n.children=n.children.filter(function(x){return x&&x.id!==rid;});n.children.forEach(walk);}walk(root);saveRepo(root);}

  function evidenceKey(meta){return safe(meta.nit)+'_'+s(meta.tipologiaKey||meta.tipologia)+'_'+s(meta.control);}
  function addLocalMeta(meta){window.EVID_CUEST=window.EVID_CUEST||{};var sk=evidenceKey(meta);if(!window.EVID_CUEST[sk])window.EVID_CUEST[sk]=[];var arr=window.EVID_CUEST[sk],old=arr.find(function(x){return x&&s(x.id)===s(meta.id);});var clean={id:meta.id,name:meta.name,size:Number(meta.size||0),type:meta.type||meta.mime||'',fecha:meta.fecha||meta.uploadedAt||'',nit:meta.nit,contrato:meta.contrato,tipologia:meta.tipologia||meta.tipologiaKey,tipologiaKey:meta.tipologiaKey||meta.tipologia,control:s(meta.control),subidoPor:meta.subidoPor||meta.uploadedBy||'',sincronizadaServidor:true,_serverEvidence:true};if(old)Object.assign(old,clean);else arr.push(clean);return sk;}

  async function fetchEvidenceList(){
    if(syncBusy||document.hidden)return false;syncBusy=true;
    try{
      var url=api()+'/api/ac-evidence?limit=1000',r=await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});if(!r.ok)return false;var j=await r.json(),items=Array.isArray(j.data)?j.data:[];
      var sig=items.map(function(x){return [x.id,x.updatedAt||x.fecha||'',x.size||0].join(':');}).join('|');
      if(sig===lastEvidenceSig)return true;lastEvidenceSig=sig;
      var root=repo();
      items.forEach(function(meta){addLocalMeta(meta);upsertRepoEvidence(meta,root);});
      saveRepo(root,true);
      try{window._lsSave&&window._lsSave();}catch(_ls){}
      rerenderVisibleEvidence();
      return true;
    }catch(e){console.warn('[SGRT50 evidencia sync]',e);return false;}finally{syncBusy=false;}
  }

  function visibleWraps(){return Array.from(document.querySelectorAll('[id^="evw_"]'));}
  function rerenderVisibleEvidence(){visibleWraps().forEach(function(w){var id=w.id.slice(4),parts=id.split('_');if(parts.length<3)return;var ctrl=parts.pop(),key=parts.pop(),nitKey=parts.join('_');try{window.renderEvCuest&&window.renderEvCuest(nitKey,key,ctrl);}catch(e){}});}

  window.sgrt50VerEvidencia=async function(id,name,mime){
    id=s(id);if(!id)return;try{
      toast('Abriendo evidencia…','info',1200);var r=await fetch(api()+'/api/ac-evidence/'+encodeURIComponent(id)+'/content',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);var blob=await r.blob(),fileName=s(name)||decodeURIComponent((r.headers.get('X-SGRT-Filename')||'Evidencia'));
      if(window.sgrt25OpenArtifactPreview){window.sgrt25OpenArtifactPreview(blob,fileName,{kind:kindFrom(fileName,mime||blob.type),title:fileName});return;}
      var u=URL.createObjectURL(blob),ov=document.getElementById('sgrt50-preview');if(ov)ov.remove();ov=document.createElement('div');ov.id='sgrt50-preview';ov.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:18px;';var box=document.createElement('div');box.style.cssText='width:min(1100px,96vw);height:min(780px,92vh);background:white;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 70px rgba(0,0,0,.35)';box.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:800;"><span>'+esc(fileName)+'</span><button type="button" id="sgrt50-close" style="border:0;background:#f1f5f9;border-radius:7px;padding:6px 10px;cursor:pointer;">Cerrar</button></div><iframe title="Vista previa" style="border:0;width:100%;flex:1;background:#f8fafc;"></iframe>';ov.appendChild(box);document.body.appendChild(ov);box.querySelector('iframe').src=u;box.querySelector('#sgrt50-close').onclick=function(){URL.revokeObjectURL(u);ov.remove();};ov.addEventListener('click',function(e){if(e.target===ov){URL.revokeObjectURL(u);ov.remove();}});
    }catch(e){toast('No se pudo abrir la evidencia: '+e.message,'error',4000);}
  };
  window.sgrt50DescargarEvidencia=function(id,name){var a=document.createElement('a');a.href=api()+'/api/ac-evidence/'+encodeURIComponent(id)+'/content?download=1';a.download=s(name)||'evidencia';document.body.appendChild(a);a.click();a.remove();};

  // Sobrescribe únicamente la carga de evidencias de Ambiente de Control.
  // No guarda binarios en localStorage: evita congelamientos y hace que el archivo sea compartido.
  function installUploader(){
    var fn=async function(nitKey,key,ctrlN,inputEl){
      var files=Array.from(inputEl&&inputEl.files||[]);if(!files.length)return;
      if(inputEl){inputEl.multiple=true;inputEl.disabled=true;}
      var nit=nitFromKey(nitKey),contract=currentContract()||'Sin contrato',ok=0,fail=0,who=actor();
      toast(files.length>1?'Cargando '+files.length+' evidencias…':'Cargando evidencia…','info',1800);
      for(var i=0;i<files.length;i++){
        var f=files[i];
        if(f.size>MAX_BYTES){fail++;toast(f.name+' supera 20 MB y no se cargó.','warning',3500);continue;}
        try{
          var id='ac_'+Date.now()+'_'+i+'_'+Math.random().toString(36).slice(2,9);
          var q=new URLSearchParams({id:id,nit:nit,contrato:contract,tipologiaKey:s(key),tipologia:s(key),control:s(ctrlN),name:f.name,type:f.type||'application/octet-stream',actorName:who.name||'',actorLogin:who.login||''});
          var r=await fetch(api()+'/api/ac-evidence-binary?'+q.toString(),{method:'POST',headers:{'Content-Type':'application/octet-stream','Accept':'application/json'},body:f});
          var j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));ok++;
          // Cede el hilo entre archivos para que la interfaz no se congele.
          await new Promise(function(resolve){setTimeout(resolve,25);});
        }catch(e){console.warn('[SGRT50 upload]',f&&f.name,e);fail++;}
      }
      if(inputEl){inputEl.value='';inputEl.disabled=false;}
      // Una sola sincronización/render al terminar todos los archivos.
      if(ok)await fetchEvidenceList();
      if(ok)toast(ok+' evidencia(s) guardada(s) y disponible(s) para todos los usuarios.','success',3800);
      if(fail)toast(fail+' evidencia(s) no se pudieron cargar.','warning',4200);
    };fn._sgrt50=true;window.registrarEvidenciaCuest=fn;
  }

  function installRenderer(){
    var fn=function(nitKey,key,ctrlN){var wrap=document.getElementById('evw_'+nitKey+'_'+key+'_'+ctrlN);if(!wrap)return;var nit=nitFromKey(nitKey),sk=safe(nit)+'_'+s(key)+'_'+s(ctrlN),items=(window.EVID_CUEST&&window.EVID_CUEST[sk])||[];items=items.filter(function(x){return !currentContract()||!x.contrato||s(x.contrato)===s(currentContract());});wrap.style.width='100%';wrap.innerHTML=items.length?items.map(function(x,i){return '<div data-evid-id="'+esc(x.id)+'" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px;margin-top:5px;background:#f8fffb;border:1px solid #bbf7d0;border-radius:7px;font-size:11px;min-width:300px;max-width:100%;"><div style="min-width:0;flex:1;"><div style="display:flex;gap:6px;align-items:center;"><span style="color:#15803d;font-weight:900;">✓ Evidencia</span><span style="font-weight:700;color:#1e6bb8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(x.name)+'</span></div><div style="font-size:9.5px;color:#64748b;margin-top:2px;">Contrato '+esc(x.contrato||'—')+' · '+esc(x.subidoPor||'Usuario')+' · disponible en Documentación / Evidencia</div></div><div style="display:flex;gap:4px;flex-shrink:0;"><button type="button" onclick="window.sgrt50VerEvidencia(\''+esc(x.id)+'\',\''+esc(x.name).replace(/&#39;/g,"\\'")+'\',\''+esc(x.type||'')+'\')" style="padding:4px 8px;border:1px solid #93c5fd;border-radius:5px;background:white;color:#1d4ed8;font-size:9.5px;font-weight:700;cursor:pointer;">Ver</button><button type="button" onclick="window.sgrt50DescargarEvidencia(\''+esc(x.id)+'\',\''+esc(x.name).replace(/&#39;/g,"\\'")+'\')" style="padding:4px 8px;border:1px solid #d7dee8;border-radius:5px;background:white;color:#475569;font-size:9.5px;font-weight:700;cursor:pointer;">Descargar</button><button type="button" data-id="'+esc(x.id)+'" data-sk="'+esc(sk)+'" data-idx="'+i+'" onclick="window.sgrt50EliminarEvidencia(this)" style="background:none;border:0;color:#dc2626;cursor:pointer;font-size:15px;">×</button></div></div>';}).join(''):'<div style="font-size:10px;color:#64748b;margin-top:5px;">Sin evidencias cargadas.</div>';};fn._sgrt50=true;window.renderEvCuest=fn;
  }
  window.sgrt50EliminarEvidencia=async function(btn){var id=s(btn&&btn.getAttribute('data-id')),sk=s(btn&&btn.getAttribute('data-sk'));if(!id)return;if(!window.confirm('¿Eliminar esta evidencia?'))return;try{var r=await fetch(api()+'/api/ac-evidence/'+encodeURIComponent(id),{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({actor:actor()})});if(!r.ok)throw new Error('HTTP '+r.status);if(window.EVID_CUEST&&window.EVID_CUEST[sk])window.EVID_CUEST[sk]=window.EVID_CUEST[sk].filter(function(x){return s(x.id)!==id;});removeRepoEvidence(id);rerenderVisibleEvidence();toast('Evidencia eliminada.','success');}catch(e){toast('No se pudo eliminar la evidencia.','error');}};

  // Abre evidencias remotas desde la carpeta de Documentación sin salir del SGRT.
  function installRepoOpen(){['odVer','sgrtVerEvidencia'].forEach(function(name){var old=window[name];if(typeof old!=='function'||old._sgrt50)return;var fn=function(id){var rid=s(id),eid=rid.indexOf('repo_')===0?rid.slice(5):rid;var all=window.EVID_CUEST||{},item=null;Object.keys(all).some(function(k){return (all[k]||[]).some(function(x){if(s(x.id)===eid){item=x;return true;}return false;});});if(item&&item._serverEvidence)return window.sgrt50VerEvidencia(item.id,item.name,item.type);return old.apply(this,arguments);};fn._sgrt50=true;window[name]=fn;});}

  // Refresco liviano del estado del tercero actual: solo configuración administrada por el jefe.
  async function refreshCurrentThirdConfig(){
    if(stateBusy||document.hidden||userInteracting())return;
    var nit=currentNit();if(!nit)return;stateBusy=true;
    try{
      var r=await fetch(api()+'/api/sgrt-state/'+encodeURIComponent(nit),{headers:{'Accept':'application/json'},cache:'no-store'});if(!r.ok)return;
      var j=await r.json(),d=j&&j.data||{},remote=d.estado_sgrt&&typeof d.estado_sgrt==='object'?d.estado_sgrt:d,version=s(d.updatedAt||remote.savedAt||remote._ultimaEdicionEvaluador&&remote._ultimaEdicionEvaluador.at);
      if(version&&lastStateVersion[nit]===version)return;
      lastStateVersion[nit]=version||String(Date.now());
      var t=db()[nit]||(db()[nit]={nit:nit}),changed=false;
      ['_persHiddenControls','_configPreguntas','_configPreguntasPorContrato','dimsPorContrato','tipologiasPorContrato','aprobadoPorContrato','contratos'].forEach(function(k){if(remote[k]!==undefined){try{var a=JSON.stringify(t[k]||null),b=JSON.stringify(remote[k]||null);if(a!==b){t[k]=JSON.parse(b);changed=true;}}catch(e){t[k]=remote[k];changed=true;}}});
      if(remote._persHiddenControls){var h=JSON.stringify(window._persHiddenControls||{}),rh=JSON.stringify(remote._persHiddenControls);if(h!==rh){window._persHiddenControls=JSON.parse(rh);changed=true;}}
      if(remote._configPreguntas){window.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM||{};var lc=JSON.stringify(window.CUEST_CTRL_CUSTOM[nit]||{}),rc=JSON.stringify(remote._configPreguntas);if(lc!==rc){window.CUEST_CTRL_CUSTOM[nit]=JSON.parse(rc);changed=true;}}
      if(changed){
        try{window._lsSave&&window._lsSave();}catch(_ls){}
        // No se redibuja el cuestionario mientras el usuario está dentro del módulo.
        // La configuración queda actualizada en memoria y se refleja al volver a abrir/cambiar el contexto, evitando pestañeos.
      }
    }catch(e){}finally{stateBusy=false;}
  }

  function fixRiskLabel(){Array.from(document.querySelectorAll('th,div,span,label')).forEach(function(el){var tx=s(el.textContent);if(/^NIVEL\s+DE\s+RIESGO$/i.test(tx)||/^NIVEL\s+RIESGO$/i.test(tx))el.textContent='EXPOSICIÓN DEL RIESGO';});}
  function ensureMultipleEvidenceInputs(){Array.from(document.querySelectorAll('input[type=\"file\"][onchange*=\"registrarEvidenciaCuest\"]')).forEach(function(el){el.multiple=true;});}
  function install(){installUploader();installRenderer();installRepoOpen();fixRiskLabel();ensureMultipleEvidenceInputs();}
  // V37: no se observa/re-renderiza todo el DOM. Esto elimina una fuente importante de pestañeos y bloqueos.
  window.sgrt50RefrescarEvidencias=fetchEvidenceList;
  ['pointerdown','mousedown','keydown','change','input'].forEach(function(ev){document.addEventListener(ev,markInteraction,true);});
  document.addEventListener('change',function(e){var el=e.target;if(el&&el.matches&&el.matches('input[type=\"file\"][onchange*=\"registrarEvidenciaCuest\"]'))el.multiple=true;},true);
  window.addEventListener('focus',function(){setTimeout(function(){if(!userInteracting()){fetchEvidenceList();refreshCurrentThirdConfig();}},900);});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(function(){if(!userInteracting()){fetchEvidenceList();refreshCurrentThirdConfig();}},900);});
  setTimeout(function(){install();fetchEvidenceList();refreshCurrentThirdConfig();},700);
  // Sincronización espaciada. No fuerza render completo del cuestionario.
  setInterval(function(){if(!document.hidden&&!userInteracting()){fetchEvidenceList();refreshCurrentThirdConfig();}},120000);
})();
