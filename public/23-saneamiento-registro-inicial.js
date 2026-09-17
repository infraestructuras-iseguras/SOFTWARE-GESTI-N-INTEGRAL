/*
 * SGRT — Módulo 23: saneamiento seguro del almacenamiento.
 * CORREGIDO: jamás elimina terceros reales ni fuerza IBM como único registro.
 * Solo desactiva la precarga automática de demos y normaliza el estado existente.
 */
(function(){
  'use strict';
  window.SGRT_DISABLE_AUTO_DEMO = true;

  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function read(key, fallback){ try{return JSON.parse(localStorage.getItem(key)||'null') || fallback;}catch(e){return fallback;} }
  function normalizeContract(c){
    c=clone(c)||{};
    c.num=String(c.num||c.numero||c.NoContrato||'').trim();
    c.numero=c.num;
    c.objeto=c.objeto||c.servicio||c.Objeto||'';
    if(c.estado_aprobacion==='APROBADO') c.aprobado=true;
    return c;
  }
  function normalizeThird(t, key){
    t=clone(t)||{};
    t.nit=String(t.nit||t.NIT||key||'').trim();
    t.nombre=t.nombre||t.NombreTercero||t.Nombre_Tercero||t.Nombre||t.nit;
    t.contratos=Array.isArray(t.contratos)?t.contratos.map(normalizeContract):[];
    t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];
    if(!t.supervisor && t.supervisores[0]) t.supervisor=t.supervisores[0].nombre||'';
    if(!t.dimsPorContrato || typeof t.dimsPorContrato!=='object') t.dimsPorContrato={};
    if(!t.promPorContrato || typeof t.promPorContrato!=='object') t.promPorContrato={};
    if(!t.aprobadoPorContrato || typeof t.aprobadoPorContrato!=='object') t.aprobadoPorContrato={};
    t.contratos.forEach(function(c){
      if(c.num && (c.estado_aprobacion==='APROBADO' || c.estado==='Aprobado')){
        t.aprobadoPorContrato[c.num]=true;
        c.estado_aprobacion='APROBADO';
      }
    });
    return t;
  }
  function mergeAll(){
    var out={};
    var ls=read('sgrt_terceros_db_shared',{});
    var v8=read('sgrt_v8',{});
    [v8&&v8.TERCEROS_DB||{}, ls||{}, window.TERCEROS_DB||{}].forEach(function(src){
      Object.keys(src||{}).forEach(function(k){
        var t=normalizeThird(src[k],k); if(!t.nit)return;
        out[t.nit]=Object.assign({}, out[t.nit]||{}, t);
      });
    });
    return out;
  }
  function saveAll(db){
    window.TERCEROS_DB=db;
    try{ if(typeof TERCEROS_DB!=='undefined') TERCEROS_DB=db; }catch(e){}
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db));}catch(e){}
    try{var v8=read('sgrt_v8',{});v8.TERCEROS_DB=db;localStorage.setItem('sgrt_v8',JSON.stringify(v8));}catch(e){}
  }
  function refresh(){
    ['_poblarSelectorTerceroClasificar','sincronizarSelectorCuestionario','loadIGTercerosFull','renderAprobarOp','acPoblarSelectorTerceroInstruc','renderAdminDash','_isSuperAdminRefresh'].forEach(function(fn){
      try{if(typeof window[fn]==='function')window[fn]();}catch(e){}
    });
  }
  window.sgrtSanearRegistros=function(){var db=mergeAll();saveAll(db);refresh();return db;};
  // Compatibilidad: estas funciones antiguas ya NO borran registros.
  window.sgrtConservarSoloRegistroIBM=window.sgrtSanearRegistros;
  window.cargarDatosDemo=function(){
    try{showToast('Los datos demo automáticos están desactivados. Se conservan tus registros reales.','info',2600);}catch(e){}
    return window.sgrtSanearRegistros();
  };
  document.addEventListener('DOMContentLoaded',function(){setTimeout(window.sgrtSanearRegistros,180);});
})();
