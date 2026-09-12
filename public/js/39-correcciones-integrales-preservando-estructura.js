/*
 * SGRT - Correcciones integrales 2026-09-12
 *
 * Este archivo conserva la estructura visual y funcional existente. Solo corrige:
 * - guardado local y sincronizacion por tercero/contrato;
 * - progreso (Si, No y No aplica cuentan como respuesta);
 * - nivel de madurez y resumen por contrato en Administrador de Riesgos;
 * - evidencias organizadas en Documentacion y Evidencias;
 * - textos indicados en Comentarios herramienta_6;
 * - intervalos y duplicaciones que elevaban CPU y memoria.
 */
(function(){
  'use strict';

  var SNAPSHOT_KEY='sgrt_v8';
  var RISK_EVIDENCE_KEY='sgrt_evid_riesgo_meta_v2';
  var EVIDENCE_DB='sgrt_evidencias_archivos_v1';
  var EVIDENCE_STORE='archivos';
  var snapshotTimer=null;
  var reportTimer=null;
  var sharePointStatus={checkedAt:0,connected:false,pending:null};

  function norm(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function responses(){if(!window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS={};return window.CUEST_RESPUESTAS;}
  function evidence(){
    try{if(typeof EVID_CUEST!=='undefined')return EVID_CUEST;}catch(e){}
    if(!window.EVID_CUEST)window.EVID_CUEST={};
    return window.EVID_CUEST;
  }
  function riskEvidence(){
    if(!window.EVID_RIESGO||typeof window.EVID_RIESGO!=='object')window.EVID_RIESGO={};
    return window.EVID_RIESGO;
  }
  function customControls(){if(!window.CUEST_CTRL_CUSTOM)window.CUEST_CTRL_CUSTOM={};return window.CUEST_CTRL_CUSTOM;}
  function safeNit(nit){return norm(nit).replace(/[^a-z0-9]/gi,'_');}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato));}
  function dimKey(d){return norm(d&&(d.key||d.clave||d.tipologia)).toLowerCase();}
  function tipologyName(d){try{var n=window._nombreTipologia&&window._nombreTipologia(d);if(norm(n))return norm(n);}catch(e){}return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.key))||'Tipología';}
  function answered(r){var a=norm(r&&r.a1);return a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial';}
  function currentNit(){return norm((document.getElementById('q-tercero')||{}).value||window.nitActual);}
  function currentContract(nit){
    var t=db()[nit]||{};
    return norm((document.getElementById('q-contrato-sel')||{}).value||(document.getElementById('ac-contrato-sel')||{}).value||t.contratoEval);
  }
  function dimsFor(t,contract){
    if(t&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[contract]))return t.dimsPorContrato[contract];
    var c=(t&&t.contratos||[]).find(function(x){return contractNum(x)===norm(contract);});
    if(c&&Array.isArray(c.dims))return c.dims;
    return Array.isArray(t&&t.dims)?t.dims:[];
  }
  function activeControls(nit,key,contract){
    try{
      if(typeof window._ctrlsCuest==='function'){
        var a=window._ctrlsCuest(nit,key,contract);
        if(Array.isArray(a))return a.filter(function(q){return q&&q.activo!==false;});
      }
    }catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]).filter(function(q){return q&&q.activo!==false;});
  }
  function responseForContract(t,nit,contract){
    if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[contract])return t.respuestasACPorContrato[contract];
    if(norm(t&&t.contratoEval)===norm(contract))return responses()[nit]||{};
    return {};
  }
  function maturity(values,answeredCount,total){
    if(answeredCount===0){return {promedio:0,pct:0,madurez:'PENDIENTE',color:'#64748B',bgColor:'#F1F5F9'};}
    if(!values.length&&answeredCount>0&&answeredCount===total){
      return {promedio:0,pct:0,madurez:'NO APLICA',color:'#6B7280',bgColor:'#F3F4F6'};
    }
    try{
      if(typeof window._calcMadurezTipologia==='function')return window._calcMadurezTipologia(values);
    }catch(e){}
    var avg=values.length?values.reduce(function(a,b){return a+b;},0)/values.length:0;
    var label=avg>=4.5?'OPTIMIZADO':avg>=3.5?'ADMINISTRADO':avg>=2.5?'DEFINIDO':avg>=1.5?'REPETIBLE':avg>0?'INICIAL':'NO EXISTE';
    var color=avg>=4.5?'#15803D':avg>=3.5?'#16A34A':avg>=2.5?'#CA8A04':avg>=1.5?'#EA580C':avg>0?'#DC2626':'#6B7280';
    return {promedio:Math.round(avg*100)/100,pct:Math.round(avg/5*100),madurez:label,color:color,bgColor:'#F3F4F6'};
  }
  function statsForContract(t,nit,contract){
    var rr=responseForContract(t,nit,contract),total=0,done=0,values=[],byTip={};
    dimsFor(t,contract).forEach(function(d){
      var key=dimKey(d),qs=activeControls(nit,key,contract),tipDone=0,tipValues=[];
      qs.forEach(function(q){
        var r=(rr[key]&&rr[key][q.n])||{};
        total++;
        if(answered(r)){
          done++;tipDone++;
          try{
            var v=window._calcCtrlValoracion&&window._calcCtrlValoracion(r);
            if(v&&v.valorMad!==null&&v.valorMad!==undefined){values.push(Number(v.valorMad));tipValues.push(Number(v.valorMad));}
          }catch(e){}
        }
      });
      byTip[key]={total:qs.length,respondidos:tipDone,pct:qs.length?Math.round(tipDone/qs.length*100):0,madurez:maturity(tipValues,tipDone,qs.length)};
    });
    return {total:total,respondidos:done,pct:total?Math.round(done/total*100):0,madurez:maturity(values,done,total),byTip:byTip};
  }
  function contractsFor(t){
    var seen={};
    return (t&&t.contratos||[]).filter(function(c){
      var n=contractNum(c);if(!n||seen[n])return false;seen[n]=1;
      var approved=(t.aprobadoPorContrato&&t.aprobadoPorContrato[n])||c.aprobado===true||norm(c.estado_aprobacion).toUpperCase()==='APROBADO'||norm(c.estado).toLowerCase()==='aprobado';
      return approved||dimsFor(t,n).length>0;
    });
  }
  function supervisorsForContract(t,c){
    var num=contractNum(c),out=[],seen={};
    function add(x){if(!x)return;if(typeof x==='string')x={nombre:x};var name=norm(x.nombre||x.name||x.supervisor||x.SupervisorNombre);if(!name)return;var linked=norm(x.contrato_asociado||x.contratoAsociado||x.contrato||x.numeroContrato),links=Array.isArray(x.contratos_asociados)?x.contratos_asociados.map(norm):[];if(linked&&num&&linked!==num)return;if(links.length&&num&&links.indexOf(num)<0)return;var k=name.toLowerCase();if(seen[k])return;seen[k]=1;out.push({nombre:name,cargo:norm(x.cargo||x.supervisorCargo),proceso:norm(x.proceso||x.procesoSupervision)});}
    try{var api=window.sgrtSupervisoresContrato&&window.sgrtSupervisoresContrato(t.nit||t.NIT,num);if(Array.isArray(api))api.forEach(add);}catch(e){}
    (Array.isArray(c&&c.supervisores)?c.supervisores:[]).forEach(add);(Array.isArray(t&&t.supervisores)?t.supervisores:[]).forEach(add);
    add({nombre:c&&(c.supervisor_asociado||c.supervisor),cargo:c&&c.supervisorCargo,proceso:c&&c.procesoSupervision});
    return out;
  }
  function overallStats(t,nit){
    var cs=contractsFor(t),total=0,done=0,completed=0,values=[];
    cs.forEach(function(c){var s=statsForContract(t,nit,contractNum(c));total+=s.total;done+=s.respondidos;if(s.total>0&&s.pct===100)completed++;if(s.madurez&&s.madurez.madurez!=='NO APLICA'&&s.madurez.promedio>0)values.push(s.madurez.promedio);});
    return {contracts:cs.length,contractsDone:completed,total:total,respondidos:done,pct:total?Math.round(done/total*100):0,madurez:maturity(values,done,total)};
  }

  /* Progreso del Evaluador: la tarjeta completa es accionable y ya no muestra
     botones repetidos "Ir". El porcentaje se calcula por contrato y preguntas activas. */
  window.acMostrarEstadoTipologias=function(nit){
    var wrap=document.getElementById('ac-tips-estado');if(!wrap)return;nit=norm(nit);var t=db()[nit];if(!nit||!t){wrap.style.display='none';wrap.innerHTML='';return;}
    var contract=norm((document.getElementById('ac-contrato-sel')||{}).value)||currentContract(nit),dims=dimsFor(t,contract),rr=responseForContract(t,nit,contract);if(!contract||!dims.length){wrap.style.display='none';wrap.innerHTML='';return;}
    var html='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px;"><div style="font-size:11.5px;font-weight:800;color:#374151;">Progreso de cuestionarios — Contrato '+esc(contract)+'</div><div style="font-size:10px;color:#64748b;">Haz clic en una tipología para abrirla o revisarla</div></div><div style="display:flex;flex-direction:column;gap:6px;">';
    dims.forEach(function(d){
      var key=dimKey(d),name=tipologyName(d),qs=activeControls(nit,key,contract),done=qs.filter(function(q){return answered(rr&&rr[key]&&rr[key][q.n]);}).length,total=qs.length,pct=total?Math.round(done/total*100):0,color=pct===100?'#16A34A':pct>0?'#EA580C':'#64748B',bg=pct===100?'#F0FDF4':pct>0?'#FFF7ED':'#F8FAFC',status=pct===100?'Completo':pct>0?'En progreso':'Sin iniciar',actionName=esc(name).replace(/&#39;/g,"\\'");
      html+='<div role="button" tabindex="0" onclick="window.acIrATipologia(\''+esc(key)+'\',\''+actionName+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click();}" style="display:grid;grid-template-columns:minmax(180px,1fr) 90px 72px;gap:9px;align-items:center;padding:9px 11px;background:'+bg+';border:1px solid '+(pct===100?'#BBF7D0':pct>0?'#FED7AA':'#E2E8F0')+';border-radius:7px;cursor:pointer;" title="Abrir cuestionario de '+esc(name)+'"><div style="min-width:0;"><div style="font-size:12px;font-weight:800;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div><div style="height:6px;background:#e5e7eb;border-radius:4px;margin-top:5px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;transition:width .2s;"></div></div></div><div style="text-align:right;"><div style="font-size:12px;font-weight:800;color:'+color+';">'+done+'/'+total+'</div><div style="font-size:9.5px;color:#64748b;">'+status+'</div></div><div style="text-align:center;padding:5px 6px;border-radius:12px;background:white;border:1px solid '+color+';font-size:11px;font-weight:900;color:'+color+';">'+pct+'%</div></div>';
    });
    wrap.innerHTML=html+'</div>';wrap.style.display='block';
  };
  var previousAcIr=window.acIrATipologia;
  if(typeof previousAcIr==='function')window.acIrATipologia=function(key,name){
    var nit=norm((document.getElementById('ac-tercero-instruc')||{}).value||(document.getElementById('q-tercero')||{}).value),contract=norm((document.getElementById('ac-contrato-sel')||{}).value)||currentContract(nit),t=db()[nit];
    if(t&&contract){t.contratoEval=contract;t.modoEval='contrato';}
    var q=document.getElementById('q-tercero');if(q)q.value=nit;try{window.qPoblarContratos&&window.qPoblarContratos(nit);}catch(e){}
    var r=previousAcIr.apply(this,arguments);setTimeout(function(){var c=document.getElementById('q-contrato-sel');if(c&&contract){c.value=contract;try{window.qCambiarContrato&&window.qCambiarContrato(contract);}catch(e){}}},40);return r;
  };

  /* ---------------------- Correcciones de textos ---------------------- */
  var CONTROL_NAMES={
    op:{6:'Protocolo de comunicación por eventos de riesgo'},
    si:{23:'Restricción de acceso a áreas de procesamiento de información',29:'Seguridad de la red – Firewall',30:'Seguridad de la red – Pruebas de penetración',45:'Gestión de vulnerabilidades – Parches de seguridad'}
  };
  function correctControls(list,key){
    (list||[]).forEach(function(q,i){
      var n=Number(q&&q.n)||i+1;
      if(CONTROL_NAMES[key]&&CONTROL_NAMES[key][n]){
        if(q.ctrl!==undefined)q.ctrl=CONTROL_NAMES[key][n];
        if(q.control!==undefined)q.control=CONTROL_NAMES[key][n];
      }
    });
    return list;
  }
  function applyTextCorrections(){
    var all=window.CUESTIONARIO_CONTROLES||{};
    Object.keys(CONTROL_NAMES).forEach(function(k){correctControls(all[k],k);});
    try{
      if(typeof TIPOLOGIAS_DB!=='undefined'){
        Object.keys(TIPOLOGIAS_DB||{}).forEach(function(ent){
          (TIPOLOGIAS_DB[ent]||[]).forEach(function(t){var k=norm(t.clave||t.key).toLowerCase();if(CONTROL_NAMES[k])correctControls(t.preguntas,k);});
        });
      }
    }catch(e){}
    try{
      var cfg=window.TIPOLOGIAS_DB_CUSTOM||{};
      Object.keys(cfg).forEach(function(ent){Object.keys(cfg[ent]||{}).forEach(function(k){var x=cfg[ent][k]||{};var kk=norm(x.clave||x.key||k).toLowerCase();if(CONTROL_NAMES[kk])correctControls(x.preguntas,kk);});});
    }catch(e){}
  }
  applyTextCorrections();
  var previousGetControls=window._getControlesConf;
  if(typeof previousGetControls==='function')window._getControlesConf=function(key){var r=previousGetControls.apply(this,arguments);return correctControls(r,norm(key).toLowerCase());};

  /* -------------------- Persistencia local optimizada -------------------- */
  function sanitizedThirds(){
    var out={};
    Object.keys(db()).forEach(function(nit){var t=db()[nit];if(!t)return;var c=Object.assign({},t);delete c._evidenciasAC;delete c._evidenciasRiesgo;out[nit]=c;});
    return out;
  }
  function sanitizedRiskEvidence(){
    var out={};
    Object.keys(riskEvidence()).forEach(function(riskId){
      out[riskId]=(riskEvidence()[riskId]||[]).map(function(item){var x=Object.assign({},item);delete x.dataUrl;delete x.dataURL;delete x._dataURL;return x;});
    });
    return out;
  }
  function buildSnapshot(){
    var old={};try{old=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'{}');}catch(e){}
    return Object.assign(old,{
      TERCEROS_DB:sanitizedThirds(),
      tercerosPendientesCuestionario:window.tercerosPendientesCuestionario||[],
      CUEST_RESPUESTAS:responses(),
      RESULTADO_EVALUACION:window.RESULTADO_EVALUACION||{},
      MATRIZ_DB:window.MATRIZ_DB||[],
      EVID_RIESGO:sanitizedRiskEvidence(),
      TIPOLOGIAS_DB_CUSTOM:window.TIPOLOGIAS_DB_CUSTOM||{},
      EVID_CUEST:evidence(),
      TIP_NIVELES:window.TIP_NIVELES||{},
      LOGS_DATA:(window.LOGS_DATA||[]).slice(0,300),
      USERS_EXTRA:window.USERS_EXTRA||{},
      NOTIF_LOG:(window.NOTIF_LOG||[]).slice(0,80),
      INFORMES_DB:window.INFORMES_DB||{},
      CUEST_CTRL_CUSTOM:customControls(),
      PERS_HIDDEN:window._persHiddenControls||{}
    });
  }
  function flushLocal(){
    if(snapshotTimer){clearTimeout(snapshotTimer);snapshotTimer=null;}
    try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(buildSnapshot()));return true;}
    catch(e){try{if(window.showToast)window.showToast('No fue posible guardar: el almacenamiento local está lleno.','error',4000);}catch(x){}return false;}
  }
  function persistRiskEvidence(){try{localStorage.setItem(RISK_EVIDENCE_KEY,JSON.stringify(sanitizedRiskEvidence()));}catch(e){} }
  function saveLocalSoon(){
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(responses()));}catch(e){}
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(sanitizedThirds()));}catch(e){}
    if(snapshotTimer)clearTimeout(snapshotTimer);
    snapshotTimer=setTimeout(flushLocal,450);
  }
  window._sgrtFlushLocal=flushLocal;
  window._lsSave=saveLocalSoon;

  // Desactivar los tres ciclos que reescribían toda la aplicación cada 1, 2 y 12 segundos.
  ['_AUTOSAVE_INTERVALO','_INTERVALO_SINCRO','_AUTOREFRESH_INTERVAL','_sgrtReportRealtimeTimer'].forEach(function(k){try{if(window[k])clearInterval(window[k]);}catch(e){}window[k]=null;});
  window.SINCRONIZACION_ACTIVA=false;
  // Refresco remoto liviano: nunca reconstruye el formulario mientras se diligencia.
  window._AUTOREFRESH_INTERVAL=setInterval(function(){
    if(document.hidden)return;
    var p=document.querySelector('.page.active'),id=p&&p.id;
    if(!id||id==='pg-cuestionario'||id==='pg-ctrl-op'||id==='pg-clasificacion')return;
    try{if(typeof window.sgrtCargarDesdeServidor==='function')window.sgrtCargarDesdeServidor();}catch(e){}
  },60000);

  /* ---------------------- Archivos de evidencia ---------------------- */
  function openFileDb(){
    return new Promise(function(resolve,reject){
      if(!window.indexedDB){reject(new Error('IndexedDB no disponible'));return;}
      var req=indexedDB.open(EVIDENCE_DB,1);
      req.onupgradeneeded=function(){var x=req.result;if(!x.objectStoreNames.contains(EVIDENCE_STORE))x.createObjectStore(EVIDENCE_STORE,{keyPath:'id'});};
      req.onsuccess=function(){resolve(req.result);};req.onerror=function(){reject(req.error||new Error('No se pudo abrir el repositorio'));};
    });
  }
  async function putFile(id,dataUrl){var x=await openFileDb();return new Promise(function(resolve,reject){var tx=x.transaction(EVIDENCE_STORE,'readwrite');tx.objectStore(EVIDENCE_STORE).put({id:id,dataUrl:dataUrl});tx.oncomplete=function(){x.close();resolve(true);};tx.onerror=function(){x.close();reject(tx.error);};});}
  async function getFile(id){try{var x=await openFileDb();return await new Promise(function(resolve,reject){var tx=x.transaction(EVIDENCE_STORE,'readonly'),q=tx.objectStore(EVIDENCE_STORE).get(id);q.onsuccess=function(){x.close();resolve(q.result&&q.result.dataUrl||'');};q.onerror=function(){x.close();reject(q.error);};});}catch(e){return '';}}
  async function deleteFile(id){try{var x=await openFileDb();await new Promise(function(resolve){var tx=x.transaction(EVIDENCE_STORE,'readwrite');tx.objectStore(EVIDENCE_STORE).delete(id);tx.oncomplete=function(){x.close();resolve();};tx.onerror=function(){x.close();resolve();};});}catch(e){}}
  function evidenceId(){return 'evac_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
  function riskEvidenceId(){return 'evar_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
  function hydrateRiskEvidence(){
    var sources=[];
    try{sources.push(JSON.parse(localStorage.getItem(RISK_EVIDENCE_KEY)||'{}'));}catch(e){}
    try{var snap=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'{}');sources.push(snap.EVID_RIESGO||{});}catch(e2){}
    sources.forEach(function(src){Object.keys(src||{}).forEach(function(riskId){
      if(!riskEvidence()[riskId])riskEvidence()[riskId]=[];
      (src[riskId]||[]).forEach(function(item){var arr=riskEvidence()[riskId],known=arr.some(function(x){return (x.id&&x.id===item.id)||(x.name===item.name&&Number(x.size||0)===Number(item.size||0));});if(!known)arr.push(item);});
    });});
    persistRiskEvidence();
  }
  function findNitFromSafe(nitKey){var keys=Object.keys(db());for(var i=0;i<keys.length;i++){if(safeNit(keys[i])===nitKey||safeNit((db()[keys[i]]||{}).nit)===nitKey)return keys[i];}return nitKey;}
  function evidenceKeyFor(nit,key,ctrl){return safeNit(nit)+'_'+key+'_'+ctrl;}
  function inferEvidenceContext(sk,item){
    var nit=norm(item&&item.nit),contract=norm(item&&item.contrato),key=norm(item&&item.tipologia),ctrl=norm(item&&item.control);
    var parts=norm(sk).split('_');if(!ctrl&&parts.length)ctrl=parts.pop();if(!key&&parts.length)key=parts.pop();
    if(!nit)nit=findNitFromSafe(parts.join('_'));
    var t=db()[nit]||{};if(!contract)contract=norm(t.contratoEval)||((t.contratos||[]).length===1?contractNum(t.contratos[0]):'Sin contrato');
    return {nit:nit,contract:contract||'Sin contrato',key:key||'general',ctrl:ctrl||'—'};
  }
  function thirdNitByName(name){
    name=norm(name).toLowerCase();var found='';Object.keys(db()).some(function(nit){var t=db()[nit]||{};if(norm(t.nombre).toLowerCase()===name){found=nit;return true;}return false;});return found;
  }
  function riskContext(riskId,item){
    var risks=window.MATRIZ_DB||[],risk=risks.find(function(r){return norm(r&&r.id)===norm(riskId);})||{};
    var nit=norm(item&&item.nit)||norm(risk.nit)||thirdNitByName(risk.tercero),t=db()[nit]||{};
    var contract=norm(item&&item.contrato)||norm(risk.contrato)||norm(t.contratoEval)||((t.contratos||[]).length===1?contractNum(t.contratos[0]):'Sin contrato');
    return {nit:nit||'sin_tercero',contract:contract||'Sin contrato',risk:risk,thirdName:norm(t.nombre)||norm(risk.tercero)||nit||'Sin tercero'};
  }
  async function migrateInlineFiles(){
    var ev=evidence(),jobs=[];
    Object.keys(ev).forEach(function(sk){(ev[sk]||[]).forEach(function(item){
      if(!item.id)item.id=evidenceId();var c=inferEvidenceContext(sk,item);item.nit=c.nit;item.contrato=c.contract;item.tipologia=c.key;item.control=c.ctrl;
      if(item.dataUrl){var data=item.dataUrl;jobs.push(putFile(item.id,data).then(function(){delete item.dataUrl;}).catch(function(){}));}
    });});
    await Promise.all(jobs);flushLocal();
  }
  function readFile(file){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=function(){reject(r.error||new Error('No se pudo leer el archivo'));};r.readAsDataURL(file);});}
  function pathName(v){return norm(v).replace(/[\\/:*?"<>|]/g,'-')||'Sin identificar';}
  function sharePointFolder(origin,nit,contract,riskId){
    var t=db()[nit]||{},third=pathName(nit+' - '+(t.nombre||nit)),folder='Evidencias/'+pathName(origin)+'/'+third+'/Contrato '+pathName(contract||'Sin contrato');
    return riskId?folder+'/Riesgo '+pathName(riskId):folder;
  }
  async function isSharePointReady(base){
    if(Date.now()-sharePointStatus.checkedAt<60000)return sharePointStatus.connected;
    if(sharePointStatus.pending)return sharePointStatus.pending;
    sharePointStatus.pending=fetch(base+'/api/sharepoint/status',{method:'GET'}).then(function(r){return r.json().then(function(d){sharePointStatus.checkedAt=Date.now();sharePointStatus.connected=!!(r.ok&&d.connected);return sharePointStatus.connected;});}).catch(function(){sharePointStatus.checkedAt=Date.now();sharePointStatus.connected=false;return false;}).finally(function(){sharePointStatus.pending=null;});
    return sharePointStatus.pending;
  }
  async function storeInSharePoint(dataUrl,folder,file){
    var base=norm(window.API_BASE_URL||window.API_BASE).replace(/\/$/,'');if(!base||typeof fetch!=='function'||!dataUrl)return false;
    try{
      if(!await isSharePointReady(base))return false;
      var headers={'Content-Type':'application/json'},u=window.currentUser||{};if(['IS','iseguras','Superadministrador','Super Administrador'].indexOf(u.rol)>=0||u.login==='iseguras2026')headers['X-SGRT-Superadmin']='1';
      var ef=await fetch(base+'/api/sharepoint/ensure-folder',{method:'POST',headers:headers,body:JSON.stringify({path:folder})});if(!ef.ok)return false;
      var up=await fetch(base+'/api/sharepoint/upload',{method:'POST',headers:headers,body:JSON.stringify({path:folder,name:file.name,mimeType:file.type||'application/octet-stream',contentBase64:String(dataUrl).split(',').pop()})});return up.ok;
    }catch(e){return false;}
  }
  async function downloadEvidence(id,name,fallback){var data=fallback||await getFile(id);if(!data){try{window.showToast&&window.showToast('No se encontró el contenido del archivo.','error',2500);}catch(e){}return;}var a=document.createElement('a');a.href=data;a.download=name||'evidencia';document.body.appendChild(a);a.click();a.remove();}
  window.sgrtDescargarEvidencia=function(id,name){downloadEvidence(id,name,'');};

  function ensureFolder(parent,id,name){parent.children=parent.children||[];var f=parent.children.find(function(x){return x&&x.type==='folder'&&(x.id===id||x.name===name);});if(!f){f={id:id,name:name,type:'folder',children:[]};parent.children.push(f);}else{f.id=id;f.name=name;f.type='folder';f.children=f.children||[];}return f;}
  function parseRepo(){var fs=null;try{fs=JSON.parse(localStorage.getItem('od_sgrt_v8')||'null');}catch(e){}if(!fs)fs={id:'root',type:'folder',children:[]};fs.children=fs.children||[];return fs;}
  function collectLegacyRepoFiles(node,path,out){
    (node&&node.children||[]).forEach(function(x){if(x.type==='folder')collectLegacyRepoFiles(x,path.concat([x.name||'']),out);else if(x&&x.name)out.push({file:x,path:path});});
  }
  function importLegacyRepo(fs){
    var roots=(fs.children||[]).filter(function(x){return x&&x.type==='folder'&&(x.id==='f_ac'||x.id==='f_ev'||/ambiente de control|evidencias de controles/i.test(x.name||''));});
    var found=[];roots.forEach(function(r){collectLegacyRepoFiles(r,[r.name||''],found);});
    var ev=evidence();
    found.forEach(function(x){
      var f=x.file,known=false;Object.keys(ev).some(function(sk){return (ev[sk]||[]).some(function(z){if((z.id&&z.id===f._evidId)||(z.name===f.name&&Number(z.size||0)===Number(f.size||0))){known=true;return true;}return false;});});
      if(known)return;
      var text=x.path.join(' '),nit='';Object.keys(db()).some(function(n){if(text.indexOf(n)>=0||text.indexOf(safeNit(n))>=0){nit=n;return true;}return false;});
      nit=nit||norm(f.nit)||'sin_tercero';var t=db()[nit]||{},contract=norm(f._contrato);
      if(!contract){var m=text.match(/Contrato\s+([^/]+)/i);contract=m?norm(m[1]):norm(t.contratoEval)||((t.contratos||[]).length===1?contractNum(t.contratos[0]):'Sin contrato');}
      var key=norm(f._tip)||'general',ctrl=norm(f._ctrl)||'—',id=f._evidId||evidenceId(),sk=evidenceKeyFor(nit,key,ctrl),item={id:id,name:f.name,size:f.size||0,type:f.mime||'',fecha:f.fecha||new Date().toISOString(),nit:nit,contrato:contract||'Sin contrato',tipologia:key,control:ctrl};
      if(!ev[sk])ev[sk]=[];ev[sk].push(item);if(f.dataURL)putFile(id,f.dataURL).catch(function(){});
    });
  }
  function rebuildEvidenceRepository(){
    var fs=parseRepo();importLegacyRepo(fs);
    var root=(fs.children||[]).find(function(x){return x&&x.type==='folder'&&(x.id==='f_evidencias_sgrt'||/^Evidencias$/i.test(x.name||''));});
    if(!root){root={id:'f_evidencias_sgrt',name:'Evidencias',type:'folder',children:[]};fs.children.unshift(root);}root.id='f_evidencias_sgrt';root.name='Evidencias';root.children=root.children||[];
    var ac=ensureFolder(root,'f_ac','Evidencias Ambiente de Control');
    var ar=ensureFolder(root,'f_ar_evid','Evidencias Análisis de Riesgos');
    ac.children=[];ar.children=[];
    // Las carpetas tecnicas antiguas se migran al nuevo arbol; no se borran archivos.
    fs.children=fs.children.filter(function(x){return x===root||!(x&&x.type==='folder'&&(x.id==='f_ac'||x.id==='f_ev'||/^Evidencias (de Controles|Ambiente de Control)$/i.test(x.name||'')));});
    var ev=evidence();Object.keys(ev).forEach(function(sk){(ev[sk]||[]).forEach(function(item){
      var c=inferEvidenceContext(sk,item),t=db()[c.nit]||{},thirdName=(t.nombre||c.nit)+' ('+c.nit+')';
      var tf=ensureFolder(ac,'f_ac_'+safeNit(c.nit),thirdName),cf=ensureFolder(tf,'f_ac_'+safeNit(c.nit)+'_'+safeNit(c.contract),'Contrato '+c.contract);
      var duplicate=(cf.children||[]).find(function(x){return x._evidId===item.id||(x.name===item.name&&Number(x.size||0)===Number(item.size||0)&&norm(x._ctrl)===norm(c.ctrl));});
      if(!duplicate)cf.children.push({id:'repo_'+item.id,name:item.name,type:'file',size:item.size||0,fecha:item.fecha||'',mime:item.type||'',_evidId:item.id,_origen:'Ambiente de Control',_contrato:c.contract,_tip:c.key,_ctrl:c.ctrl});
    });});
    Object.keys(riskEvidence()).forEach(function(riskId){(riskEvidence()[riskId]||[]).forEach(function(item){
      var c=riskContext(riskId,item),thirdName=c.thirdName+' ('+c.nit+')';item.nit=c.nit;item.contrato=c.contract;item.riesgoId=riskId;
      var tf=ensureFolder(ar,'f_ar_'+safeNit(c.nit),thirdName),cf=ensureFolder(tf,'f_ar_'+safeNit(c.nit)+'_'+safeNit(c.contract),'Contrato '+c.contract),rf=ensureFolder(cf,'f_ar_'+safeNit(c.nit)+'_'+safeNit(c.contract)+'_'+safeNit(riskId),'Riesgo '+riskId);
      var duplicate=(rf.children||[]).find(function(x){return x._evidId===item.id||(x.name===item.name&&Number(x.size||0)===Number(item.size||0));});
      if(!duplicate)rf.children.push({id:'repo_'+item.id,name:item.name,type:'file',size:item.size||0,fecha:item.fecha||'',mime:item.type||'',_evidId:item.id,_origen:'Análisis de Riesgos',_contrato:c.contract,_riesgo:riskId});
    });});
    persistRiskEvidence();
    try{localStorage.setItem('od_sgrt_v8',JSON.stringify(fs));}catch(e){}
    try{if(typeof window.odInit==='function'&&document.getElementById('pg-evidencias-repo')&&document.getElementById('pg-evidencias-repo').classList.contains('active'))window.odInit();}catch(e){}
    try{if(typeof window.adminOdInit==='function'&&document.getElementById('admin-pg-repo')&&document.getElementById('admin-pg-repo').classList.contains('active'))window.adminOdInit();}catch(e){}
  }
  function findRepoItem(node,id){if(!node)return null;if(node.id===id)return node;var kids=node.children||[];for(var i=0;i<kids.length;i++){var r=findRepoItem(kids[i],id);if(r)return r;}return null;}
  async function previewEvidence(item){
    if(!item)return;var data=item.dataUrl||item.dataURL||item._dataURL||await getFile(item._evidId||item.id);
    if(!data){try{window.showToast&&window.showToast('No se encontró el contenido del archivo.','error',2500);}catch(e){}return;}
    var ev={name:item.name||'evidencia',size:item.size||0,type:item.mime||item.mimeType||item.type||'',dataUrl:data};
    if(typeof window.mostrarEvidenciaEnModal==='function'){window.mostrarEvidenciaEnModal(ev,(item._origen||'Evidencia')+(item._riesgo?' · Riesgo '+item._riesgo:''));return;}
    downloadEvidence(item._evidId||item.id,ev.name,data);
  }
  window.sgrtVerEvidencia=function(id){previewEvidence(findRepoItem(parseRepo(),id));};
  window.odVer=function(id){previewEvidence(findRepoItem(parseRepo(),id));};
  var previousOdDescargar=window.odDescargar;
  window.odDescargar=function(id){var item=findRepoItem(parseRepo(),id);if(item&&item._evidId)return downloadEvidence(item._evidId,item.name,item.dataURL||'');if(typeof previousOdDescargar==='function')return previousOdDescargar.apply(this,arguments);};
  var previousOdRender=window.odRender;
  if(typeof previousOdRender==='function')window.odRender=function(){
    var r=previousOdRender.apply(this,arguments),grid=document.getElementById('od-grid');if(!grid)return r;
    Array.from(grid.querySelectorAll('[onclick*="window.odDescargar"]')).forEach(function(clickArea){
      var raw=clickArea.getAttribute('onclick')||'',m=raw.match(/odDescargar\('([^']+)'\)/),id=m&&m[1],item=id&&findRepoItem(parseRepo(),id);if(!item||!item._evidId)return;
      clickArea.setAttribute('onclick',"window.odVer('"+id+"')");clickArea.title='Ver evidencia';
      var card=clickArea.parentElement;if(!card||card.querySelector('.sgrt-evidence-actions'))return;
      var actions=document.createElement('div');actions.className='sgrt-evidence-actions';actions.style.cssText='display:flex;justify-content:center;gap:5px;margin-top:7px;';
      actions.innerHTML='<button type="button" onclick="event.stopPropagation();window.odVer(\''+id+'\')" style="padding:3px 7px;border:1px solid #1e6bb8;border-radius:5px;background:#eff6ff;color:#1e6bb8;font-size:9.5px;font-weight:700;cursor:pointer;">Ver</button><button type="button" onclick="event.stopPropagation();window.odDescargar(\''+id+'\')" style="padding:3px 7px;border:1px solid #d7dee8;border-radius:5px;background:white;color:#475569;font-size:9.5px;font-weight:700;cursor:pointer;">Descargar</button>';
      card.appendChild(actions);
    });return r;
  };
  function sharePointConnected(){var a=document.getElementById('sp-admin-status'),u=document.getElementById('sp-user-status'),x=norm((a&&a.textContent)||(u&&u.textContent));return /Vinculado|Conectado/i.test(x);}
  var previousAdminOdInit=window.adminOdInit,previousAdminOdClick=window.adminOdClick;
  // El init local anterior reiniciaba la ruta en cada doble clic y no permitia abrir carpetas en Administrador.
  window.adminOdInit=function(){if(sharePointConnected()&&typeof previousAdminOdInit==='function')return previousAdminOdInit.apply(this,arguments);try{var fs=parseRepo();if(!Array.isArray(window._adminOdPath))window._adminOdPath=[];window.adminOdRender&&window.adminOdRender(fs);}catch(e){}};
  window.adminOdClick=function(id){
    if(sharePointConnected()&&typeof previousAdminOdClick==='function')return previousAdminOdClick.apply(this,arguments);
    var fs=parseRepo(),cur=fs,path=window._adminOdPath||[];path.forEach(function(seg){cur=(cur.children||[]).find(function(c){return c.id===seg.id;})||cur;});
    var item=(cur.children||[]).find(function(c){return c.id===id;});if(!item)return;
    if(item.type==='folder'){path.push({id:item.id,name:item.name});window._adminOdPath=path;window.adminOdRender&&window.adminOdRender(fs);}else previewEvidence(item);
  };
  var previousAdminOdRender=window.adminOdRender;
  if(typeof previousAdminOdRender==='function')window.adminOdRender=function(){
    var r=previousAdminOdRender.apply(this,arguments),grid=document.getElementById('admin-od-grid');if(!grid)return r;
    Array.from(grid.querySelectorAll('[data-item-id]')).forEach(function(card){
      var id='';try{id=decodeURIComponent(card.getAttribute('data-item-id')||'');}catch(e){}var item=findRepoItem(parseRepo(),id);if(!item||item.type==='folder'||!item._evidId||card.querySelector('.sgrt-evidence-actions'))return;
      var actions=document.createElement('div');actions.className='sgrt-evidence-actions';actions.style.cssText='display:flex;justify-content:center;gap:5px;margin-top:7px;';
      actions.innerHTML='<button type="button" onclick="event.stopPropagation();window.sgrtVerEvidencia(\''+id+'\')" style="padding:3px 7px;border:1px solid #1e6bb8;border-radius:5px;background:#eff6ff;color:#1e6bb8;font-size:9.5px;font-weight:700;cursor:pointer;">Ver</button><button type="button" onclick="event.stopPropagation();window.odDescargar(\''+id+'\')" style="padding:3px 7px;border:1px solid #d7dee8;border-radius:5px;background:white;color:#475569;font-size:9.5px;font-weight:700;cursor:pointer;">Descargar</button>';
      card.appendChild(actions);
    });return r;
  };

  window.registrarEvidenciaCuest=async function(nitKey,key,ctrlN,inputEl){
    var files=Array.from(inputEl&&inputEl.files||[]);if(inputEl)inputEl.value='';if(!files.length)return;
    var tooLarge=files.filter(function(f){return f.size>4*1024*1024;});files=files.filter(function(f){return f.size<=4*1024*1024;});
    var nit=findNitFromSafe(nitKey),contract=currentContract(nit)||'Sin contrato',sk=evidenceKeyFor(nit,key,ctrlN),ev=evidence();if(!ev[sk])ev[sk]=[];
    var saved=0;
    for(var i=0;i<files.length;i++){
      var f=files[i],dup=ev[sk].find(function(x){return x.name===f.name&&Number(x.size||0)===Number(f.size||0)&&norm(x.contrato)===contract;});if(dup)continue;
      try{var data=await readFile(f),id=evidenceId();await putFile(id,data);ev[sk].push({id:id,name:f.name,size:f.size,type:f.type,fecha:new Date().toISOString(),nit:nit,contrato:contract,tipologia:key,control:ctrlN,subidoPor:(window.currentUser||{}).name||'—'});storeInSharePoint(data,sharePointFolder('Evidencias Ambiente de Control',nit,contract),f);saved++;}catch(e){}
    }
    rebuildEvidenceRepository();flushLocal();try{window.renderEvCuest&&window.renderEvCuest(nitKey,key,ctrlN);}catch(e){}
    if(saved)await syncOneThird(nit);
    try{window.showToast&&window.showToast((saved?saved+' evidencia(s) guardada(s) en Documentación y Evidencias. ':'')+(tooLarge.length?'Se omitieron '+tooLarge.length+' archivo(s) mayores de 4 MB.':''),saved?'success':'warning',3500);}catch(e){}
  };
  window.renderEvCuest=function(nitKey,key,ctrlN){
    var wrap=document.getElementById('evw_'+nitKey+'_'+key+'_'+ctrlN);if(!wrap)return;var sk=nitKey+'_'+key+'_'+ctrlN,items=evidence()[sk]||[];
    wrap.innerHTML=items.map(function(x,i){return '<div style="display:flex;align-items:center;gap:5px;padding:4px 8px;background:white;border:1px solid var(--border2);border-radius:6px;font-size:11px;"><button type="button" onclick="window.sgrtDescargarEvidencia(\''+esc(x.id)+'\',\''+esc(x.name).replace(/&#39;/g,"\\'")+'\')" style="background:none;border:0;color:#1e6bb8;cursor:pointer;font:inherit;font-weight:700;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📄 '+esc(x.name)+'</button><span style="color:var(--muted);font-size:10px;">'+Math.max(1,Math.round((x.size||0)/1024))+' KB</span><button type="button" data-sk="'+esc(sk)+'" data-idx="'+i+'" onclick="window.elimEvCuest(this)" style="background:none;border:0;color:var(--red);cursor:pointer;">×</button></div>';}).join('');
  };
  window.elimEvCuest=function(btn){var sk=btn.getAttribute('data-sk'),idx=Number(btn.getAttribute('data-idx')),arr=evidence()[sk]||[],item=arr[idx];if(item)deleteFile(item.id);arr.splice(idx,1);window.renderEvCuest(safeNit(currentNit()),norm(sk.split('_').slice(-2,-1)[0]),norm(sk.split('_').slice(-1)[0]));rebuildEvidenceRepository();flushLocal();};

  // Evidencias cargadas desde Análisis de Riesgos: se conservan por riesgo,
  // tercero y contrato y se publican en el mismo módulo documental.
  window.registrarEvRiesgo=function(inputEl){
    var files=Array.from(inputEl&&inputEl.files||[]);if(inputEl)inputEl.value='';if(!files.length)return;
    var thirdName=norm((document.getElementById('nr-tercero')||{}).value),contract=norm((document.getElementById('nr-contrato')||{}).value)||'Sin contrato',nit=thirdNitByName(thirdName)||norm((db()[thirdName]||{}).nit)||thirdName||'sin_tercero',saved=0,rejected=0;
    files.forEach(function(file){
      if(file.size>4*1024*1024){rejected++;return;}
      var reader=new FileReader();reader.onload=function(e){
        var id=riskEvidenceId(),item={id:id,name:file.name,size:file.size,type:file.type,fecha:new Date().toISOString(),nit:nit,contrato:contract,tercero:thirdName,subidoPor:(window.currentUser||{}).name||'—',dataUrl:e.target.result};
        putFile(id,e.target.result).catch(function(){});if(!window._tmpEvRiesgo)window._tmpEvRiesgo=[];window._tmpEvRiesgo.push(item);saved++;
        try{window.renderEvRiesgoTmp&&window.renderEvRiesgoTmp();}catch(x){}
        if(saved+rejected===files.length)try{window.showToast&&window.showToast(saved+' evidencia(s) preparadas para el riesgo'+(rejected?' · '+rejected+' omitida(s) por superar 4 MB':''),'success',3000);}catch(x2){}
      };reader.onerror=function(){rejected++;};reader.readAsDataURL(file);
    });
    if(!saved&&rejected===files.length)try{window.showToast&&window.showToast('Los archivos superan el máximo permitido de 4 MB.','error',3000);}catch(e){}
  };
  window._saveEvRiesgoOnGuardar=function(riskId){
    riskId=norm(riskId);var pending=Array.from(window._tmpEvRiesgo||[]);if(!riskId||!pending.length)return;
    var arr=riskEvidence()[riskId]||(riskEvidence()[riskId]=[]),ctx=riskContext(riskId,pending[0]),writes=[];
    pending.forEach(function(item){
      var known=arr.some(function(x){return (x.id&&x.id===item.id)||(x.name===item.name&&Number(x.size||0)===Number(item.size||0)&&norm(x.contrato)===norm(item.contrato));});if(known)return;
      var meta=Object.assign({},item,{nit:norm(item.nit)||ctx.nit,contrato:norm(item.contrato)||ctx.contract,riesgoId:riskId});var inline=meta.dataUrl||meta.dataURL;if(inline){writes.push(putFile(meta.id,inline).catch(function(){}));writes.push(storeInSharePoint(inline,sharePointFolder('Evidencias Análisis de Riesgos',meta.nit,meta.contrato,riskId),meta));}arr.push(meta);
    });
    window._tmpEvRiesgo.length=0;try{window.renderEvRiesgoTmp&&window.renderEvRiesgoTmp();}catch(e){}
    persistRiskEvidence();rebuildEvidenceRepository();flushLocal();
    Promise.all(writes).then(function(){return ctx.nit&&ctx.nit!=='sin_tercero'?syncOneThird(ctx.nit):false;}).finally(function(){arr.forEach(function(x){delete x.dataUrl;delete x.dataURL;});persistRiskEvidence();flushLocal();});
  };

  async function exportEvidenceForNit(nit){
    var out={},ev=evidence(),sn=safeNit(nit);
    for(var sk of Object.keys(ev)){
      var items=(ev[sk]||[]).filter(function(x){return norm(x.nit)===norm(nit)||sk.indexOf(sn+'_')===0;});if(!items.length)continue;out[sk]=[];
      for(var item of items){var x=clone(item),data=x.dataUrl||await getFile(x.id);if(data)x.dataUrl=data;out[sk].push(x);}
    }
    return out;
  }
  async function exportRiskEvidenceForNit(nit){
    var out={};
    for(var riskId of Object.keys(riskEvidence())){
      var selected=(riskEvidence()[riskId]||[]).filter(function(item){return norm(riskContext(riskId,item).nit)===norm(nit);});if(!selected.length)continue;out[riskId]=[];
      for(var item of selected){var x=Object.assign({},item),data=x.dataUrl||await getFile(x.id);if(data)x.dataUrl=data;out[riskId].push(x);}
    }
    return out;
  }
  async function importRemoteEvidence(){
    var ev=evidence(),jobs=[];
    Object.keys(db()).forEach(function(nit){var t=db()[nit]||{},pack=t._evidenciasAC;if(!pack||typeof pack!=='object')return;Object.keys(pack).forEach(function(sk){if(!ev[sk])ev[sk]=[];(pack[sk]||[]).forEach(function(remote){var found=ev[sk].find(function(x){return (x.id&&x.id===remote.id)||(x.name===remote.name&&Number(x.size||0)===Number(remote.size||0)&&norm(x.contrato)===norm(remote.contrato));});var item=found||clone(remote);if(!found)ev[sk].push(item);if(remote.dataUrl){if(!item.id)item.id=evidenceId();jobs.push(putFile(item.id,remote.dataUrl).then(function(){delete item.dataUrl;}).catch(function(){}));}});});delete t._evidenciasAC;});
    Object.keys(db()).forEach(function(nit){var t=db()[nit]||{},pack=t._evidenciasRiesgo;if(!pack||typeof pack!=='object')return;Object.keys(pack).forEach(function(riskId){if(!riskEvidence()[riskId])riskEvidence()[riskId]=[];(pack[riskId]||[]).forEach(function(remote){var arr=riskEvidence()[riskId],found=arr.find(function(x){return (x.id&&x.id===remote.id)||(x.name===remote.name&&Number(x.size||0)===Number(remote.size||0)&&norm(x.contrato)===norm(remote.contrato));}),item=found||clone(remote);if(!found)arr.push(item);if(remote.dataUrl){if(!item.id)item.id=riskEvidenceId();jobs.push(putFile(item.id,remote.dataUrl).then(function(){delete item.dataUrl;}).catch(function(){}));}});});delete t._evidenciasRiesgo;});
    await Promise.all(jobs);persistRiskEvidence();rebuildEvidenceRepository();flushLocal();
  }
  async function syncOneThird(nit){
    var t=db()[nit];if(!t)return false;t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    var pack=await exportEvidenceForNit(nit);if(Object.keys(pack).length)t._evidenciasAC=pack;
    var riskPack=await exportRiskEvidenceForNit(nit);if(Object.keys(riskPack).length)t._evidenciasRiesgo=riskPack;
    try{if(typeof window._sgrtUpsertEstadoCompleto!=='function')return false;var ok=await window._sgrtUpsertEstadoCompleto(t);return ok!==false;}catch(e){return false;}finally{delete t._evidenciasAC;delete t._evidenciasRiesgo;flushLocal();}
  }

  /* ---------------- Respuestas, borrador y guardado completo ---------------- */
  var acUpdateChannel=null;try{if(typeof BroadcastChannel!=='undefined')acUpdateChannel=new BroadcastChannel('sgrt_ac_updates_v1');}catch(e){}
  function refreshEvaluatorProgress(nit,contract){
    var t=db()[nit]||{};try{window.actualizarProgressoCuest&&window.actualizarProgressoCuest(nit,dimsFor(t,contract).map(dimKey));}catch(e){}
    try{window.acMostrarEstadoTipologias&&window.acMostrarEstadoTipologias(nit);}catch(e2){}
  }
  function reloadAdminFromLocal(){
    if(!isRiskAdmin())return;try{var fresh=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');Object.keys(fresh).forEach(function(n){if(!(db()[n]&&db()[n]._changed))db()[n]=fresh[n];});}catch(e){}
    try{if(typeof window.renderReportesAC==='function')window.renderReportesAC();}catch(e2){}scheduleReportPostProcess(false);
  }
  function publishACUpdate(nit,contract){try{if(acUpdateChannel)acUpdateChannel.postMessage({type:'ac-updated',nit:nit,contrato:contract,at:Date.now()});}catch(e){} }
  if(acUpdateChannel)acUpdateChannel.onmessage=function(e){if(e&&e.data&&e.data.type==='ac-updated')reloadAdminFromLocal();};
  window.addEventListener('storage',function(e){if(e&&e.key==='sgrt_terceros_db_shared')reloadAdminFromLocal();});
  function writeSaveStatus(msg){var info=document.getElementById('q-borrador-info'),ts=document.getElementById('q-borrador-ts');if(info&&ts){info.style.display='block';ts.textContent=msg+' · '+new Date().toLocaleString('es-CO');}}
  function saveButtonsBusy(busy){try{Array.from(document.querySelectorAll('button[onclick*="guardarBorradorCuestionario"],button[onclick*="guardarCuestionarioCompleto"]')).forEach(function(b){b.disabled=!!busy;b.style.opacity=busy?'.65':'1';});}catch(e){}}
  async function withTimeout(promise,ms){return Promise.race([Promise.resolve(promise),new Promise(function(resolve){setTimeout(function(){resolve(false);},ms);})]);}
  function stashCurrent(nit,contract){
    var t=db()[nit];if(!t||!contract)return null;if(!t.respuestasACPorContrato)t.respuestasACPorContrato={};
    t.respuestasACPorContrato[contract]=clone(responses()[nit]||{});t.contratoEval=contract;t.modoEval='contrato';t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();saveLocalSoon();return statsForContract(t,nit,contract);
  }
  window.onChangeAtribCuest=function(nit,key,ctrlN,ai){
    nit=norm(nit);var rr=responses();if(!rr[nit])rr[nit]={};if(!rr[nit][key])rr[nit][key]={};if(!rr[nit][key][ctrlN])rr[nit][key][ctrlN]={};
    var nk=safeNit(nit),el=document.getElementById('qa_'+nk+'_'+key+'_'+ctrlN+'_a'+ai),val=norm(el&&el.value);rr[nit][key][ctrlN]['a'+ai]=val;var a1=norm(rr[nit][key][ctrlN].a1),a6=norm(rr[nit][key][ctrlN].a6);
    for(var i=2;i<=7;i++){var x=document.getElementById('qa_'+nk+'_'+key+'_'+ctrlN+'_a'+i);if(!x)continue;if(a1==='No'||a1==='No Aplica'){x.value=a1;x.disabled=true;x.style.opacity='.5';rr[nit][key][ctrlN]['a'+i]=a1;}else{x.disabled=false;x.style.opacity='1';}}
    var a7=document.getElementById('qa_'+nk+'_'+key+'_'+ctrlN+'_a7');if(a7&&a6==='No'&&a1!=='No'&&a1!=='No Aplica'){a7.value='No';a7.disabled=true;rr[nit][key][ctrlN].a7='No';}
    var row=document.getElementById('cr_'+nk+'_'+key+'_'+ctrlN),circle=row&&row.querySelector('div > div[style*="border-radius:50%"]');if(circle){circle.style.background=a1==='Si'?'#16A34A':a1==='No'?'#DC2626':a1==='No Aplica'?'#9CA3AF':'#E5E7EB';circle.style.color=answered(rr[nit][key][ctrlN])?'white':'#6B7280';}
    try{window.actualizarBadgeSec&&window.actualizarBadgeSec(nit,key);}catch(e){}var contract=currentContract(nit);stashCurrent(nit,contract);refreshEvaluatorProgress(nit,contract);try{window._flashGuardadoCuest&&window._flashGuardadoCuest();}catch(e){}
  };
  window.onChangeObsCuest=function(nit,key,ctrlN,val){nit=norm(nit);var rr=responses();if(!rr[nit])rr[nit]={};if(!rr[nit][key])rr[nit][key]={};if(!rr[nit][key][ctrlN])rr[nit][key][ctrlN]={};rr[nit][key][ctrlN].obs=val;var contract=currentContract(nit);stashCurrent(nit,contract);refreshEvaluatorProgress(nit,contract);try{window._flashGuardadoCuest&&window._flashGuardadoCuest();}catch(e){}};

  function applySavedStats(t,nit,contract,complete){
    var s=stashCurrent(nit,contract);if(!s)return null;if(!t.acPorContrato)t.acPorContrato={};
    t.acPorContrato[contract]={guardado:!!complete&&s.pct===100,fecha:new Date().toISOString(),respuestas:clone(t.respuestasACPorContrato[contract]||{}),avance:s.pct,respondidos:s.respondidos,total:s.total,nivelMadurez:s.madurez.madurez,valorMadurez:s.madurez.promedio};
    if(!t.promPorContrato)t.promPorContrato={};t.promPorContrato[contract]=Object.assign({},t.promPorContrato[contract]||{},{prom:s.madurez.promedio,nivelMadurez:s.madurez.madurez,avance:s.pct,fecha:new Date().toISOString().slice(0,10)});
    var all=overallStats(t,nit);t.acAvance=all.pct;t.promAC=all.madurez.promedio;t.nivelMadurezAC=all.madurez.madurez;if(all.contracts>0&&all.contractsDone===all.contracts)t.estado='Completado';
    return s;
  }
  async function saveQuestionnaire(kind){
    var nit=currentNit(),contract=currentContract(nit);if(!nit||!contract){try{window.showToast&&window.showToast('Selecciona un tercero y un contrato primero.','error',2800);}catch(e){}return false;}
    var t=db()[nit]||{},rr=responses();if(!rr[nit])rr[nit]={};rr[nit].__savedAt=new Date().toISOString();rr[nit].__nombre=t.nombre||nit;
    var s=applySavedStats(t,nit,contract,kind==='complete');if(!s)return false;
    var fecha=new Date().toLocaleString('es-CO');if(!t.borradoresACPorContrato)t.borradoresACPorContrato={};t.borradoresACPorContrato[contract]={nit:nit,contrato:contract,fecha:fecha,respuestas:clone(rr[nit]),customCtrls:clone(customControls()[nit]||{})};
    try{localStorage.setItem('cuest_borrador_'+nit,JSON.stringify(t.borradoresACPorContrato[contract]));}catch(e){}flushLocal();
    var localMsg=kind==='complete'?(s.pct===100?'Cuestionario guardado al 100% en este equipo. Sincronizando…':'Cuestionario guardado. Faltan '+(s.total-s.respondidos)+' control(es) activo(s) por responder.'):'Borrador guardado en este equipo. Sincronizando…';
    writeSaveStatus(localMsg);try{window.showToast&&window.showToast('✅ '+localMsg,'success',3000);}catch(e){}refreshEvaluatorProgress(nit,contract);publishACUpdate(nit,contract);saveButtonsBusy(true);
    var ok=false;try{ok=await withTimeout(syncOneThird(nit),8000);}catch(e){ok=false;}saveButtonsBusy(false);
    var msg;if(kind==='complete')msg=s.pct===100?(ok?'Cuestionario guardado y sincronizado al 100%. Otro usuario podrá verlo.':'Cuestionario guardado al 100% en este equipo. La sincronización con el servidor quedó pendiente.'):'Cuestionario guardado. Faltan '+(s.total-s.respondidos)+' control(es) activo(s) por responder.';
    else msg=ok?'Borrador guardado y sincronizado. Otro usuario podrá verlo.':'Borrador guardado en este equipo. La sincronización con el servidor quedó pendiente.';
    writeSaveStatus(msg);try{window.showToast&&window.showToast((ok?'✅ ':'⚠️ ')+msg,ok||s.pct===100?'success':'warning',4500);}catch(e){}
    refreshEvaluatorProgress(nit,contract);publishACUpdate(nit,contract);scheduleReportPostProcess(true);return true;
  }
  window.guardarBorradorCuestionario=function(){return saveQuestionnaire('draft');};
  window.guardarCuestionarioCompleto=function(){return saveQuestionnaire('complete');};

  /* ---------------------- Administrador de Riesgos ---------------------- */
  function isRiskAdmin(){var r=norm((window.currentUser||{}).rol).toLowerCase();return r==='operativo'||r.indexOf('administrador')>=0;}
  function statCard(label,value,color){return '<div style="text-align:center;padding:7px;background:var(--gray3);border-radius:6px;"><div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:700;">'+esc(label)+'</div><div style="font-size:14px;font-weight:800;color:'+(color||'var(--navy)')+';">'+esc(value)+'</div></div>';}
  function nitFromDetailId(id){var safe=norm(id).replace(/^rpt-prog-det-/,'');return Object.keys(db()).find(function(n){return safeNit(n)===safe||safeNit((db()[n]||{}).nit)===safe;})||'';}
  function removeEvidenceFromAC(wrap){
    Array.from(wrap.querySelectorAll('.card')).forEach(function(card){var h=card.querySelector('.card-hdr h3');if(h&&/^Evidencias$/i.test(norm(h.textContent)))card.remove();});
    Array.from(wrap.querySelectorAll('span')).forEach(function(x){if(/^📎?\s*Informes\s*\(/i.test(norm(x.textContent))){var block=x.parentElement&&x.parentElement.parentElement;if(block&&block.closest('[id^="rpt-prog-det-"]'))block.remove();}});
  }
  function patchAdminCards(){
    if(!isRiskAdmin())return;var wrap=document.getElementById('cq-reportes-body');if(!wrap)return;
    ['sgrt-ac-supervision-contract','sgrt-ac-supervision-v2'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
    var table=document.getElementById('rpt-tabla-wrap');if(table)table.style.display='';removeEvidenceFromAC(wrap);
    if(table){var head=table.querySelector('.card-hdr');if(head)Array.from(head.querySelectorAll('button')).forEach(function(b){var tx=norm(b.textContent);if(tx==='Todos'||tx==='Ver todos'||/^Contrato\s+\d+/i.test(tx))b.remove();});}
    Array.from(wrap.querySelectorAll('[id^="rpt-prog-det-"]')).forEach(function(det){
      var nit=nitFromDetailId(det.id),t=db()[nit];if(!t)return;var all=overallStats(t,nit),grid=det.firstElementChild;if(!grid)return;grid.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';
      grid.innerHTML=statCard('Contratos respondidos',all.contractsDone+'/'+all.contracts)+statCard('Controles respondidos',all.respondidos+'/'+all.total)+statCard('Progreso general',all.pct+'%',all.pct===100?'#16A34A':'#1e6bb8')+statCard('Nivel general',(all.respondidos?all.madurez.promedio+' · ':'')+all.madurez.madurez,all.madurez.color);
    });
  }
  function scheduleReportPostProcess(render){if(reportTimer)clearTimeout(reportTimer);reportTimer=setTimeout(function(){if(render&&isRiskAdmin()){try{var p=document.getElementById('cq-panel-reportes');if(p&&p.style.display!=='none'&&typeof window.renderReportesAC==='function')window.renderReportesAC();}catch(e){}}setTimeout(patchAdminCards,120);},render?80:300);}
  var oldReports=window.renderReportesAC;
  if(typeof oldReports==='function')window.renderReportesAC=function(){var r=oldReports.apply(this,arguments);scheduleReportPostProcess(false);return r;};

  window.sgrt35VerDetalleTipologias=function(nit){
    nit=norm(nit);var t=db()[nit];if(!t)return;var old=document.getElementById('_sgrt35-tip-det');if(old)old.remove();
    var cs=contractsFor(t),content=cs.length?cs.map(function(c){
      var num=contractNum(c),s=statsForContract(t,nit,num),dims=dimsFor(t,num),sup=supervisorsForContract(t,c),maturityLabel=(s.respondidos?s.madurez.promedio+' · ':'')+s.madurez.madurez;
      var supervisorText=sup.length?sup.map(function(x){return esc(x.nombre)+(x.cargo?' — '+esc(x.cargo):'')+(x.proceso?' · '+esc(x.proceso):'');}).join('<br>'):'Sin supervisor asociado';
      var rows=dims.map(function(d){var key=dimKey(d),ts=s.byTip[key]||{pct:0,respondidos:0,total:0,madurez:maturity([],0,0)};return '<div style="display:grid;grid-template-columns:minmax(180px,1fr) 86px 105px;gap:8px;align-items:center;padding:8px 10px;border-top:1px solid #eef2f7;font-size:10.5px;"><span style="font-weight:700;color:#334155;">'+esc(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||key))+'</span><span style="text-align:center;color:#64748b;">'+ts.respondidos+'/'+ts.total+' · '+ts.pct+'%</span><span style="text-align:center;font-weight:800;color:'+ts.madurez.color+';">'+esc((ts.respondidos?ts.madurez.promedio+' · ':'')+ts.madurez.madurez)+'</span></div>';}).join('');
      if(!rows)rows='<div style="padding:14px;text-align:center;color:#94a3b8;font-size:11px;">Este contrato no tiene tipologías aprobadas.</div>';
      return '<div style="border:1px solid #dbe3ec;border-radius:10px;overflow:hidden;margin-bottom:12px;background:white;box-shadow:0 2px 8px rgba(15,23,42,.05);"><div style="padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;"><b style="color:#1a3a5c;font-size:12px;">Contrato '+esc(num)+'</b><span style="font-size:10px;color:#64748b;">'+esc(c.objeto||c.descripcion||'')+'</span></div><div style="margin-top:6px;font-size:10px;color:#475569;"><b>Supervisor(es):</b> '+supervisorText+'</div></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:10px 11px;background:white;">'+statCard('Controles respondidos',s.respondidos+'/'+s.total)+statCard('Progreso',s.pct+'%',s.pct===100?'#16A34A':'#1e6bb8')+statCard('Nivel de madurez',maturityLabel,s.madurez.color)+'</div><div style="display:grid;grid-template-columns:minmax(180px,1fr) 86px 105px;gap:8px;padding:6px 10px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;"><span>Tipología</span><span style="text-align:center;">Progreso</span><span style="text-align:center;">Madurez</span></div>'+rows+'</div>';
    }).join(''):'<div style="padding:18px;text-align:center;color:#94a3b8;">No hay contratos clasificados.</div>';
    var ov=document.createElement('div');ov.id='_sgrt35-tip-det';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10090;display:flex;align-items:flex-start;justify-content:center;padding:45px 12px;overflow:auto;';ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="width:720px;max-width:97vw;background:white;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.25);overflow:hidden;"><div style="padding:12px 15px;background:#1a3a5c;color:white;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:13px;font-weight:800;">Detalle por contrato</div><div style="font-size:10px;opacity:.8;margin-top:2px;">'+esc(t.nombre||nit)+' · NIT '+esc(nit)+'</div></div><button onclick="document.getElementById(\'_sgrt35-tip-det\').remove()" style="background:none;border:0;color:white;font-size:20px;cursor:pointer;">×</button></div><div style="padding:12px 14px;max-height:70vh;overflow:auto;">'+content+'</div></div>';document.body.appendChild(ov);
  };

  /* ---------------------- Sincronizacion de entrada ---------------------- */
  var oldServerLoad=window.sgrtCargarDesdeServidor;
  if(typeof oldServerLoad==='function')window.sgrtCargarDesdeServidor=async function(){var r=await oldServerLoad.apply(this,arguments);await importRemoteEvidence();scheduleReportPostProcess(false);return r;};

  function init(){
    applyTextCorrections();hydrateRiskEvidence();migrateInlineFiles().then(function(){rebuildEvidenceRepository();});
    var css=document.getElementById('sgrt39-style');if(!css){css=document.createElement('style');css.id='sgrt39-style';css.textContent='#q-secciones-wrap textarea[id^="qo_"],#q-secciones-wrap textarea[id*="_obs"]{min-height:88px!important;resize:vertical!important;line-height:1.45!important;}';document.head.appendChild(css);}
    scheduleReportPostProcess(false);
  }
  window.addEventListener('pagehide',flushLocal);
  document.addEventListener('visibilitychange',function(){if(document.hidden)flushLocal();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,250);});else setTimeout(init,80);
})();
