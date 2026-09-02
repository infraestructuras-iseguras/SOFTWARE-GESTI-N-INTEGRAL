/*
 * SGRT — Módulo 23: saneamiento del registro inicial.
 * Conserva únicamente IBM Colombia (NIT 830016840) y evita que los datos demo vuelvan a aparecer.
 * No cambia estilos, menús ni cálculos de riesgo.
 */
(function(){
  'use strict';
  var KEEP_NIT='830016840';
  var KEEP_NAME='IBM Colombia';
  var KEEP_ENTITY='colpensiones';
  window.SGRT_DISABLE_AUTO_DEMO=true;

  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function norm(v){var s=String(v==null?'':v).toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.replace(/[^a-z0-9]/g,'');}
  function isKeep(v){var n=String(v&& (v.nit||v.NIT||'')).replace(/[^0-9]/g,'');var name=norm(v&& (v.nombre||v.NombreTercero||v.Nombre||''));return n===KEEP_NIT || name===norm(KEEP_NAME) || name.indexOf('ibmcolombia')>=0;}
  function source(){
    try{var canonical=window.DATOS_DEMO_PRESENTACION&&window.DATOS_DEMO_PRESENTACION[KEEP_NIT];if(canonical)return clone(canonical);}catch(e0){}
    var candidates=[];
    try{if(window.TERCEROS_DB)Object.keys(window.TERCEROS_DB).forEach(function(k){if(isKeep(window.TERCEROS_DB[k]))candidates.push(window.TERCEROS_DB[k]);});}catch(e){}
    try{var x=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');Object.keys(x||{}).forEach(function(k){if(isKeep(x[k]))candidates.push(x[k]);});}catch(e2){}
    try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');Object.keys((s&&s.TERCEROS_DB)||{}).forEach(function(k){if(isKeep(s.TERCEROS_DB[k]))candidates.push(s.TERCEROS_DB[k]);});}catch(e3){}
    var t=candidates[0];
    if(!t){try{var p=window.DATOS_DEMO_PRESENTACION&&window.DATOS_DEMO_PRESENTACION[KEEP_NIT];if(p)t=clone(p);}catch(e4){}}
    return t||{nit:KEEP_NIT,nombre:KEEP_NAME,entidad:KEEP_ENTITY,domicilio:'Calle 72 #13-45, Bogotá',estado:'Activo',supervisor:'Carlos Mendoza Flores',supervisores:[{nombre:'Carlos Mendoza Flores',cargo:'Jefe de Seguridad Informática',proceso:'Infraestructura Tecnológica'}],contratos:[{num:'CT-2024-IBM-001',objeto:'Servicios de Infraestructura y Cloud Computing',fini:'2024-01-10',ffin:'2025-01-09',estado:'En Ejecucion'}],dims:[],prom:4.5,zona:'EXTREMO',nivel_riesgo:'EXTREMO'};
  }
  function normalize(t){
    t=clone(t)||{};t.nit=KEEP_NIT;t.nombre=KEEP_NAME;t.nombre_tercero=KEEP_NAME;t.entidad=KEEP_ENTITY;t.entidadLabel='🏛 Colpensiones';t.localOnly=true;t.sincronizado=false;t.demo=false;
    t.domicilio=t.domicilio||t.Domicilio||'Calle 72 #13-45, Bogotá';t.estado=t.estado||'Activo';
    t.dims=(Array.isArray(t.dims)?t.dims:[]).map(function(d){d=clone(d)||{};d.key=d.key||norm(d.tipologia||d.nombre||'tipologia');d.nombre=d.nombre||d.tipologia||d.nombre_tipologia||d.key;d.val=d.val==null?(d.calificacion==null?(d.nivel==null?'—':d.nivel):d.calificacion):d.val;return d;});
    t.contratos=Array.isArray(t.contratos)?t.contratos:[];t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];
    if(!t.supervisor&&t.supervisores[0])t.supervisor=t.supervisores[0].nombre;
    if(!t.prom&&t.dims.length){var vals=t.dims.map(function(d){return parseFloat(d.val);}).filter(function(x){return !isNaN(x);});if(vals.length)t.prom=parseFloat((vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(2));}
    t.prom=t.prom||4.5;t.zona=t.zona||t.nivel_riesgo||'EXTREMO';t.nivel_riesgo=t.nivel_riesgo||t.zona;t.clasificacion=t.clasificacion||t.zona;
    return t;
  }
  function allDB(){var out={};try{Object.assign(out,window.TERCEROS_DB||{});}catch(e){}try{var x=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');Object.assign(out,x||{});}catch(e2){}try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');Object.assign(out,(s&&s.TERCEROS_DB)||{});}catch(e3){}return out;}
  function onlyKeepObject(o){var out={};var t=normalize(source());out[KEEP_NIT]=t;return out;}
  function onlyKeepResponses(){var src={};try{Object.assign(src,window.CUEST_RESPUESTAS||{});}catch(e){}try{Object.assign(src,JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}'));}catch(e2){}var out={};if(src[KEEP_NIT])out[KEEP_NIT]=src[KEEP_NIT];return out;}
  function onlyKeepMatrix(){var src=[];try{src=Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB.slice():[];}catch(e){}try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');if(Array.isArray(s.MATRIZ_DB))src=src.concat(s.MATRIZ_DB);}catch(e2){}var seen={};return src.filter(function(r){var n=String(r&& (r.nit||r.NIT||r.terceroNit||'')).replace(/[^0-9]/g,'');var ok=n===KEEP_NIT||norm(r&& (r.tercero||r.nombreTercero||'' )).indexOf('ibmcolombia')>=0;if(ok){var k=JSON.stringify(r);if(seen[k])return false;seen[k]=1;}return ok;});}
  function onlyKeepRepo(){
    var root={id:'root',name:'SGRT',type:'folder',children:[]};
    try{
      var old=JSON.parse(localStorage.getItem('od_sgrt_v8')||'null');
      if(old&&typeof old==='object'){
        root=clone(old)||root;root.children=Array.isArray(root.children)?root.children:[];
        function keepNode(n){var s=norm((n&&n.id||'')+' '+(n&&n.name||'')+' '+(n&&n.nit||''));var direct=s.indexOf(KEEP_NIT)>=0||s.indexOf('ibmcolombia')>=0;if(n&&Array.isArray(n.children)){n.children=n.children.filter(keepNode);if(n.children.length)direct=true;}return direct;}
        root.children=root.children.filter(keepNode);
      }
    }catch(e){}
    return root;
  }
  function save(t,resp,mx){
    window.TERCEROS_DB=t;window.CUEST_RESPUESTAS=resp;window.MATRIZ_DB=mx;window.DATOS_DEMO_PRESENTACION={};window.DATOS_DEMO_PRESENTACION[KEEP_NIT]=t[KEEP_NIT];
    var year=new Date().getFullYear().toString();
    var clsRec={nit:KEEP_NIT,nombre:KEEP_NAME,entidad:KEEP_ENTITY,servicio:(t[KEEP_NIT].servicio||''),supervisor:(t[KEEP_NIT].supervisor||''),domicilio:(t[KEEP_NIT].domicilio||''),prom:(t[KEEP_NIT].prom||4.5),zona:(t[KEEP_NIT].zona||'EXTREMO'),yr:year,dims:t[KEEP_NIT].dims||[],contratos:t[KEEP_NIT].contratos||[],supervisores:t[KEEP_NIT].supervisores||[]};
    window.CLS_DB={};window.CLS_DB[year]=[clsRec];
    if(window.REPORTES_POR_FASE&&typeof window.REPORTES_POR_FASE==='object') Object.keys(window.REPORTES_POR_FASE).forEach(function(k){if(Array.isArray(window.REPORTES_POR_FASE[k]))window.REPORTES_POR_FASE[k]=window.REPORTES_POR_FASE[k].filter(function(x){var n=String(x&&(x.nit||x.NIT||x.terceroNit||'')).replace(/[^0-9]/g,'');var nm=norm(x&&(x.tercero||x.nombreTercero||x.nombre||''));return n===KEEP_NIT||nm.indexOf('ibmcolombia')>=0;});});
    window.CUEST_CTRL_CUSTOM=(window.CUEST_CTRL_CUSTOM&&window.CUEST_CTRL_CUSTOM[KEEP_NIT])?{[KEEP_NIT]:window.CUEST_CTRL_CUSTOM[KEEP_NIT]}:{};
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(t));}catch(e){}
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(resp));}catch(e2){}
    try{var s={};try{s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');}catch(e3){}s.TERCEROS_DB=t;s.CUEST_RESPUESTAS=resp;s.MATRIZ_DB=mx;s.CLS_DB=window.CLS_DB;localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e4){}
    try{localStorage.setItem('sgrt_terceros_demo',JSON.stringify([t[KEEP_NIT]]));}catch(e5){}
    try{localStorage.setItem('sgrt_cls_db',JSON.stringify(window.CLS_DB));localStorage.setItem('sgrt_cls_db_auto',JSON.stringify(window.CLS_DB));}catch(e5b){}
    try{localStorage.setItem('sgrt_reportes_fases',JSON.stringify(window.REPORTES_POR_FASE||{}));localStorage.setItem('sgrt_reportes_fases_auto',JSON.stringify(window.REPORTES_POR_FASE||{}));}catch(e5c){}
    try{var cc=window.CUEST_CTRL_CUSTOM&&window.CUEST_CTRL_CUSTOM[KEEP_NIT]?{[KEEP_NIT]:window.CUEST_CTRL_CUSTOM[KEEP_NIT]}:{};localStorage.setItem('sgrt_cuest_custom',JSON.stringify(cc));}catch(e5d){}
    ['sgrt_demo_seeded','sgrt_admin_colpensiones_demo_v1','sgrt_precarga_completada'].forEach(function(k){try{localStorage.removeItem(k);}catch(e6){}});
    try{localStorage.setItem('od_sgrt_v8',JSON.stringify(onlyKeepRepo()));}catch(e7){}
  }
  function clean(){var t=onlyKeepObject(),r=onlyKeepResponses(),m=onlyKeepMatrix();save(t,r,m);return t[KEEP_NIT];}
  function refresh(){try{if(window.clsRender)window.clsRender();}catch(e){}try{if(window.clsInitDash)window.clsInitDash();}catch(e2){}try{if(window.loadIGTercerosFull)window.loadIGTercerosFull();}catch(e3){}try{if(window._isSuperAdminRefresh)window._isSuperAdminRefresh();}catch(e4){}}
  window.sgrtConservarSoloRegistroIBM=function(){var t=clean();refresh();return t;};
  window.cargarDatosDemo=function(){var t=clean();refresh();return t;};
  try{delete window.sgrtCargarDemoColpensiones;}catch(e5){}
  try{delete window.cargarDemoIS;delete window.completarDemoEntidadesIS;}catch(e6){}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){clean();refresh();},250);});
})();
