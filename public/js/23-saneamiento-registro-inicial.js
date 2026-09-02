/*
 * SGRT — Módulo 23: inicio limpio y migración del registro demo.
 *
 * - Impide que los datos de demostración se carguen automáticamente.
 * - Elimina una sola vez el registro histórico IBM Colombia (NIT 830016840).
 * - Solicita el mismo borrado al servidor y luego carga dbo.Terceros.
 * - No vuelve a borrar un IBM que el usuario registre legítimamente en el futuro.
 */
(function(){
  'use strict';

  var IBM_NIT='830016840';
  var LOCAL_MIGRATION='sgrt_inicio_limpio_sin_ibm_v2';
  var REMOTE_MIGRATION='sgrt_ibm_remoto_eliminado_v2';

  // Esta bandera es leída por los módulos 02, 04 y 18 antes de sembrar demos.
  window.SGRT_DISABLE_AUTO_DEMO=true;
  if(localStorage.getItem(REMOTE_MIGRATION)!=='1')window.SGRT_EXCLUDED_REMOTE_NITS=[IBM_NIT];

  function nitOf(value){
    return String(value && (value.nit||value.NIT||value.terceroNit||value.tercero_nit||'') || '')
      .replace(/[^0-9]/g,'');
  }

  function withoutIBMObject(value){
    var out={};
    if(!value || typeof value!=='object' || Array.isArray(value)) return out;
    Object.keys(value).forEach(function(key){
      var item=value[key];
      if(String(key).replace(/[^0-9]/g,'')!==IBM_NIT && nitOf(item)!==IBM_NIT) out[key]=item;
    });
    return out;
  }

  function withoutIBMArray(value){
    return Array.isArray(value) ? value.filter(function(item){return nitOf(item)!==IBM_NIT;}) : [];
  }

  function readJSON(key,fallback){
    try{var value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value;}catch(e){return fallback;}
  }

  function writeJSON(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}
  }

  function cleanYearMap(value){
    var out=value&&typeof value==='object'?value:{};
    Object.keys(out).forEach(function(year){out[year]=withoutIBMArray(out[year]);});
    return out;
  }

  function cleanArrayMap(value){
    var out=value&&typeof value==='object'?value:{};
    Object.keys(out).forEach(function(key){if(Array.isArray(out[key]))out[key]=withoutIBMArray(out[key]);});
    return out;
  }

  function cleanLocalIBMOnce(){
    if(localStorage.getItem(LOCAL_MIGRATION)==='1') return;

    window.TERCEROS_DB=withoutIBMObject(window.TERCEROS_DB||{});
    writeJSON('sgrt_terceros_db_shared',withoutIBMObject(readJSON('sgrt_terceros_db_shared',{})));

    var snapshot=readJSON('sgrt_v8',{});
    snapshot.TERCEROS_DB=withoutIBMObject(snapshot.TERCEROS_DB||{});
    snapshot.CUEST_RESPUESTAS=withoutIBMObject(snapshot.CUEST_RESPUESTAS||{});
    snapshot.MATRIZ_DB=withoutIBMArray(snapshot.MATRIZ_DB||[]);
    if(snapshot.CLS_DB && typeof snapshot.CLS_DB==='object')snapshot.CLS_DB=cleanYearMap(snapshot.CLS_DB);
    writeJSON('sgrt_v8',snapshot);

    writeJSON('sgrt_cuest_respuestas',withoutIBMObject(readJSON('sgrt_cuest_respuestas',{})));
    writeJSON('sgrt_cls_db',cleanYearMap(readJSON('sgrt_cls_db',{})));
    writeJSON('sgrt_cls_db_auto',cleanYearMap(readJSON('sgrt_cls_db_auto',{})));
    writeJSON('sgrt_reportes_fases',cleanArrayMap(readJSON('sgrt_reportes_fases',{})));
    writeJSON('sgrt_reportes_fases_auto',cleanArrayMap(readJSON('sgrt_reportes_fases_auto',{})));
    localStorage.removeItem('sgrt_terceros_demo');
    localStorage.removeItem('sgrt_demo_seeded');
    localStorage.removeItem('sgrt_admin_colpensiones_demo_v1');
    localStorage.removeItem('sgrt_precarga_completada');
    localStorage.setItem(LOCAL_MIGRATION,'1');
  }

  function refresh(){
    ['clsRender','clsInitDash','loadIGTercerosFull','_isSuperAdminRefresh','sincronizarSelectorCuestionario']
      .forEach(function(name){try{if(typeof window[name]==='function')window[name]();}catch(e){}});
  }

  async function deleteRemoteIBMOnce(){
    if(localStorage.getItem(REMOTE_MIGRATION)==='1') return true;
    if(typeof window._remoteDeleteTercero!=='function') return false;
    try{
      await window._remoteDeleteTercero(IBM_NIT,{allowNotFound:true});
      localStorage.setItem(REMOTE_MIGRATION,'1');
      window.SGRT_EXCLUDED_REMOTE_NITS=[];
      return true;
    }catch(e){
      console.warn('El registro IBM quedó oculto localmente; el borrado remoto se reintentará:',e.message);
      return false;
    }
  }

  async function initialize(){
    cleanLocalIBMOnce();
    refresh();
    await deleteRemoteIBMOnce();
    if(typeof window._lsPullFromAzure==='function'){
      try{await window._lsPullFromAzure({excludeNits:[IBM_NIT],silent:true});}catch(e){}
    }
    refresh();
  }

  // Se conservan los nombres públicos antiguos para no romper botones, pero ya no crean demos.
  window.sgrtConservarSoloRegistroIBM=function(){return initialize();};
  window.sgrtInicializarSinRegistroDemo=initialize;
  window.cargarDatosDemo=function(){return {};};
  try{delete window.sgrtCargarDemoColpensiones;delete window.cargarDemoIS;delete window.completarDemoEntidadesIS;}catch(e){}

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(initialize,250);});
  }else{
    setTimeout(initialize,0);
  }
})();
