/*
 * SGRT — Módulo 23: saneamiento único V5.
 *
 * Deja en cero el registro maestro y todas sus fases, tanto en el navegador
 * como en dbo.Terceros. La migración local se ejecuta una sola vez; si el
 * servidor no responde, el borrado remoto queda pendiente y se reintenta sin
 * permitir que una lectura SQL vuelva a insertar registros antiguos.
 */
(function(){
  'use strict';

  var LOCAL_MIGRATION='sgrt_cero_total_v5';
  var REMOTE_MIGRATION='sgrt_cero_total_remoto_v5';
  var PENDING_DELETE='sgrt_v5_nits_pendientes_borrado';

  window.SGRT_DISABLE_AUTO_DEMO=true;

  function readJSON(key,fallback){
    try{var value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value;}catch(e){return fallback;}
  }
  function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
  function rawNit(value){
    if(value==null)return '';
    if(typeof value==='string'||typeof value==='number')return String(value).trim();
    return String(value.nit||value.NIT||value.terceroNit||value.tercero_nit||'').trim();
  }
  function addNit(set,value){var nit=rawNit(value);if(nit)set[nit]=true;}
  function collectNits(value,set,depth){
    if(value==null||depth>7)return;
    if(Array.isArray(value)){value.forEach(function(item){collectNits(item,set,depth+1);});return;}
    if(typeof value!=='object')return;
    addNit(set,value);
    Object.keys(value).forEach(function(key){
      if(depth===0&&/^[0-9A-Za-z._-]+$/.test(key)){
        var item=value[key];
        if(item&&typeof item==='object'&&(item.nombre||item.Nombre_Tercero||item.NombreTercero||item.contratos))addNit(set,key);
      }
      collectNits(value[key],set,depth+1);
    });
  }
  function pendingNits(){return readJSON(PENDING_DELETE,[]).map(rawNit).filter(Boolean);}
  function setPending(ids){
    var seen={},clean=[];(ids||[]).forEach(function(id){id=rawNit(id);if(id&&!seen[id]){seen[id]=true;clean.push(id);}});
    writeJSON(PENDING_DELETE,clean);return clean;
  }
  function updateRemoteBlock(ids){
    ids=setPending(ids);
    var seen={},excluded=[];
    (window.SGRT_EXCLUDED_REMOTE_NITS||[]).concat(ids).forEach(function(id){id=rawNit(id);if(id&&!seen[id]){seen[id]=true;excluded.push(id);}});
    window.SGRT_EXCLUDED_REMOTE_NITS=excluded;
    window.SGRT_BLOCK_REMOTE_PULL=localStorage.getItem(REMOTE_MIGRATION)!=='1';
  }

  function collectLocalNits(){
    var set={};
    collectNits(window.TERCEROS_DB||{},set,0);
    ['sgrt_terceros_db_shared','sgrt_terceros_db','sgrt_terceros','sgrt_terceros_pending',
      'sgrt_terceros_aprobados','sgrt_cuest_respuestas','sgrt_cls_db','sgrt_cls_db_auto',
      'sgrt_reportes_fases','sgrt_reportes_fases_auto','sgrt_resumen_reportes','sgrt_v8',
      'od_sgrt_v8','rpt_fs_v2'].forEach(function(key){collectNits(readJSON(key,null),set,0);});
    return Object.keys(set);
  }

  function emptyRepository(){
    return {id:'root',type:'folder',children:[
      {id:'f_ac',name:'Ambiente de Control',type:'folder',children:[]},
      {id:'f_mat',name:'Matrices de Riesgo',type:'folder',children:[]},
      {id:'f_cont',name:'Contratos y Soportes',type:'folder',children:[]},
      {id:'f_ev',name:'Evidencias de Controles',type:'folder',children:[]},
      {id:'f_inf',name:'Informes y Reportes',type:'folder',children:[]}
    ]};
  }
  function emptyReports(){
    return {type:'folder',name:'Inicio',id:'root',children:[
      {type:'folder',name:'Informes de Riesgo',id:'f_inf',children:[],fecha:''},
      {type:'folder',name:'Contratos y Documentos',id:'f_con',children:[],fecha:''},
      {type:'folder',name:'Matrices y Cuestionarios',id:'f_mat',children:[],fecha:''},
      {type:'folder',name:'Evidencias',id:'f_evi',children:[],fecha:''}
    ]};
  }

  function cleanLocalAll(){
    var ids=collectLocalNits().concat(pendingNits());
    setPending(ids);

    var snapshot=readJSON('sgrt_v8',{});
    snapshot.TERCEROS_DB={};
    snapshot.tercerosPendientesCuestionario=[];
    snapshot.CUEST_RESPUESTAS={};
    snapshot.RESULTADO_EVALUACION={};
    snapshot.MATRIZ_DB=[];
    snapshot.CLS_DB={};
    snapshot.REPORTES_POR_FASE={};
    snapshot.INFORMES_DB={};
    snapshot.EVID_CUEST={};
    writeJSON('sgrt_v8',snapshot);

    ['sgrt_terceros_db_shared','sgrt_terceros_db','sgrt_terceros','sgrt_terceros_pending',
      'sgrt_terceros_aprobados','sgrt_cuest_respuestas','sgrt_cls_db','sgrt_cls_db_auto',
      'sgrt_reportes_fases','sgrt_reportes_fases_auto','sgrt_resumen_reportes']
      .forEach(function(key){writeJSON(key,{});});
    writeJSON('od_sgrt_v8',emptyRepository());
    writeJSON('rpt_fs_v2',emptyReports());

    for(var i=localStorage.length-1;i>=0;i--){
      var key=localStorage.key(i);
      if(key&&(key.indexOf('cuest_borrador_')===0||key.indexOf('sgrt_riesgo_')===0))localStorage.removeItem(key);
    }
    ['sgrt_terceros_demo','sgrt_demo_seeded','sgrt_admin_colpensiones_demo_v1','sgrt_precarga_completada']
      .forEach(function(key){localStorage.removeItem(key);});

    window.TERCEROS_DB={};
    window.CUEST_RESPUESTAS={};
    window.RESULTADO_EVALUACION={};
    window.MATRIZ_DB=[];
    window.CLS_DB={};
    window.CF_TERCEROS={};
    window.REPORTES_POR_FASE={};
    window.INFORMES_DB={};
    window.EVID_CUEST={};
    window.tercerosPendientesCuestionario=[];
    localStorage.setItem(LOCAL_MIGRATION,'1');
    updateRemoteBlock(pendingNits());
  }

  function refresh(){
    ['clsRender','clsInitDash','loadIGTercerosFull','renderAprobarOp','renderCliRegistros',
      'renderMatriz','renderSeguimiento','updateDashboard','_isSuperAdminRefresh','sincronizarSelectorCuestionario']
      .forEach(function(name){try{if(typeof window[name]==='function')window[name]();}catch(e){}});
    try{if(window.SGRTThirdPartyFlow)window.SGRTThirdPartyFlow.refreshAll();}catch(e2){}
  }

  function apiBase(){
    return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');
  }
  async function remoteNits(){
    var response=await fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
    var data=await response.json();
    if(!response.ok||!data.ok)throw new Error(data.error||('HTTP '+response.status));
    return (Array.isArray(data.data)?data.data:[]).map(rawNit).filter(Boolean);
  }
  async function deleteRemoteAllOnce(){
    if(localStorage.getItem(REMOTE_MIGRATION)==='1'){
      window.SGRT_BLOCK_REMOTE_PULL=false;window.SGRT_EXCLUDED_REMOTE_NITS=[];return true;
    }
    if(typeof window._remoteDeleteTercero!=='function')return false;
    var ids=pendingNits(),readSucceeded=false;
    try{ids=ids.concat(await remoteNits());readSucceeded=true;}catch(e){console.warn('El servidor no respondió al listar terceros; se reintentará el borrado total:',e.message);}
    ids=setPending(ids);
    updateRemoteBlock(ids);
    var failed=[];
    for(var i=0;i<ids.length;i++){
      try{await window._remoteDeleteTercero(ids[i],{allowNotFound:true});}catch(e2){failed.push(ids[i]);}
    }
    setPending(failed);
    if(readSucceeded&&!failed.length){
      localStorage.setItem(REMOTE_MIGRATION,'1');
      window.SGRT_BLOCK_REMOTE_PULL=false;
      window.SGRT_EXCLUDED_REMOTE_NITS=[];
      return true;
    }
    updateRemoteBlock(failed);
    return false;
  }

  async function initialize(){
    if(localStorage.getItem(LOCAL_MIGRATION)!=='1')cleanLocalAll();
    else updateRemoteBlock(pendingNits());
    refresh();
    var remoteClean=await deleteRemoteAllOnce();
    if(remoteClean&&typeof window._lsPullFromAzure==='function'){
      try{await window._lsPullFromAzure({allowDuringCleanup:true,silent:true});}catch(e){}
    }
    refresh();
    return {local:true,remote:remoteClean,pending:pendingNits().length};
  }

  window.sgrtConservarSoloRegistroIBM=function(){return initialize();};
  window.sgrtInicializarSinRegistroDemo=initialize;
  window.sgrtLimpiarTodoV5=initialize;
  window.cargarDatosDemo=function(){return {};};
  try{delete window.sgrtCargarDemoColpensiones;delete window.cargarDemoIS;delete window.completarDemoEntidadesIS;}catch(e){}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(initialize,250);});
  else setTimeout(initialize,0);
})();
