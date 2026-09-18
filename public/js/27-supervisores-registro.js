/*
 * SGRT — Módulo 27: visibilidad y persistencia de supervisores en Registro de Terceros.
 * Ajuste aditivo: no cambia clasificación, aprobación, ambiente de control ni análisis.
 */
(function(){
  'use strict';

  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function norm(v){var s=String(v==null?'':v).trim().toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s;}
  function text(v){return String(v==null?'':v).trim();}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}

  function addSupervisor(out,s){
    if(!s)return;
    var item={
      nombre:text(s.nombre||s.Nombre||s.nombre_supervisor||s.NombreSupervisor||s.supervisor||s.SupervisorNombre),
      cargo:text(s.cargo||s.Cargo||s.cargo_supervisor||s.supervisorCargo||s.CargoSupervisor),
      proceso:text(s.proceso||s.Proceso||s.proceso_supervision||s.procesoSupervision||s.ProcesoSupervision),
      contrato_asociado:text(s.contrato_asociado||s.contratoAsociado||s.contrato||s.numeroContrato||s.numContrato)
    };
    if(!item.nombre)return;
    var nn=norm(item.nombre),nc=norm(item.contrato_asociado);
    var ex=out.find(function(x){
      if(norm(x.nombre)!==nn)return false;
      var xc=norm(x.contrato_asociado);
      return xc===nc || !xc || !nc;
    });
    if(ex){
      if(!ex.cargo&&item.cargo)ex.cargo=item.cargo;
      if(!ex.proceso&&item.proceso)ex.proceso=item.proceso;
      if(!ex.contrato_asociado&&item.contrato_asociado)ex.contrato_asociado=item.contrato_asociado;
      return;
    }
    out.push(item);
  }

  function addFromContract(out,c){
    if(!c||typeof c!=='object')return;
    var cn=text(c.num||c.numero||c.NoContrato);
    (Array.isArray(c.supervisores)?c.supervisores:[]).forEach(function(s){addSupervisor(out,Object.assign({},s,{contrato_asociado:s.contrato_asociado||cn}));});

    var candidates=[];
    function push(name,cargo,proceso){if(text(name))candidates.push({nombre:name,cargo:cargo||'',proceso:proceso||'',contrato_asociado:cn});}
    push(c.supervisor_asociado||c.supervisor||c.SupervisorNombre,
         c.supervisorCargo||c.cargoSupervisor||c.CargoSupervisor,
         c.procesoSupervision||c.proceso_supervision||c.ProcesoSupervision);
    push(c.supervisorAlt||c.supervisor_alterno,
         c.supervisorAltCargo||c.cargoSupervisorAlt,
         c.procesoSupervisionAlt||c.proceso_supervision_alt);

    Object.keys(c).forEach(function(k){
      var m=k.match(/^supervisor(\d+)$/i);if(!m)return;
      var n=m[1],name=c[k];
      push(name,c['supervisor'+n+'Cargo']||c['supervisorCargo'+n]||c['cargoSupervisor'+n],c['procesoSupervision'+n]||c['proceso_supervision'+n]);
    });
    candidates.forEach(function(s){addSupervisor(out,s);});
  }

  function normalizeThird(t){
    if(!t||typeof t!=='object')return false;
    var before=JSON.stringify(Array.isArray(t.supervisores)?t.supervisores:[]);
    var out=[];
    (Array.isArray(t.supervisores)?t.supervisores:[]).forEach(function(s){addSupervisor(out,s);});
    addSupervisor(out,{
      nombre:t.supervisor||t.SupervisorNombre||t.nombre_supervisor||t.NombreSupervisor,
      cargo:t.cargo||t.CargoSupervisor||t.cargo_supervisor,
      proceso:t.procesoSupervision||t.proceso_supervision||t.ProcesoSupervision,
      contrato_asociado:t.nocontrato||t.NoContrato
    });
    (Array.isArray(t.contratos)?t.contratos:[]).forEach(function(c){addFromContract(out,c);});
    t.supervisores=out;
    if(!t.supervisor&&out[0])t.supervisor=out[0].nombre;

    // Reflejar el supervisor también dentro de su contrato para que todas las vistas lo muestren.
    (Array.isArray(t.contratos)?t.contratos:[]).forEach(function(c){
      var cn=text(c.num||c.numero||c.NoContrato);
      var rel=out.filter(function(s){return !s.contrato_asociado||text(s.contrato_asociado)===cn;});
      if(rel.length){
        c.supervisores=clone(rel);
        if(!c.supervisor)c.supervisor=rel[0].nombre;
        if(!c.supervisor_asociado)c.supervisor_asociado=rel[0].nombre;
        if(!c.supervisorCargo)c.supervisorCargo=rel[0].cargo||'';
        if(!c.procesoSupervision)c.procesoSupervision=rel[0].proceso||'';
      }
    });
    return before!==JSON.stringify(t.supervisores);
  }

  function persistAll(syncNit){
    var d=db(),changed=false;
    Object.keys(d).forEach(function(k){if(normalizeThird(d[k]))changed=true;});
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));}catch(e){}
    try{var s={};try{s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');}catch(e2){}s.TERCEROS_DB=d;localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e3){}
    if(changed){try{if(window._lsSave)window._lsSave();}catch(e4){}}
    if(syncNit&&d[syncNit]&&typeof window._sgrtUpsertEstadoCompleto==='function'){
      try{window._sgrtUpsertEstadoCompleto(d[syncNit]);}catch(e5){}
    }
    return changed;
  }
  window.sgrtNormalizarSupervisoresRegistro=persistAll;

  function wrapRender(){
    var old=window.clsRender;if(typeof old!=='function'||old._sgrt27)return;
    var fn=function(){persistAll();return old.apply(this,arguments);};fn._sgrt27=true;window.clsRender=fn;
  }
  function wrapServer(){
    var old=window.sgrtCargarDesdeServidor;if(typeof old!=='function'||old._sgrt27)return;
    var fn=async function(){var r=await old.apply(this,arguments);persistAll();try{if(window.clsRender)window.clsRender();}catch(e){}return r;};fn._sgrt27=true;window.sgrtCargarDesdeServidor=fn;
  }
  function wrapGuardar(){
    var old=window.guardarClasif;if(typeof old!=='function'||old._sgrt27)return;
    var fn=async function(){
      var nit=text((document.getElementById('cf-nit')||{}).value);
      function field(){for(var i=0;i<arguments.length;i++){var el=document.getElementById(arguments[i]);var v=text(el&&el.value);if(v)return v;}return '';}
      // La tarjeta actual usa cf-sup-*; se mantienen los IDs antiguos como compatibilidad.
      var formSup={nombre:field('cf-sup-nombre','cf-supervisor'),cargo:field('cf-sup-cargo','cf-cargo'),proceso:field('cf-sup-proceso','cf-proceso-supervision'),contrato_asociado:field('cf-sup-contrato','cf-nocontrato')};
      var buffer=clone(window._cfSupervisoresBuffer||[]);
      var r=await old.apply(this,arguments);
      if(nit&&db()[nit]){
        var t=db()[nit];t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];
        buffer.forEach(function(s){addSupervisor(t.supervisores,s);});
        addSupervisor(t.supervisores,formSup);
        normalizeThird(t);persistAll(nit);
        try{if(window.clsRender)window.clsRender();}catch(e){}
      }
      return r;
    };fn._sgrt27=true;window.guardarClasif=fn;
  }
  function wrapSupervisorAction(name){
    var old=window[name];if(typeof old!=='function'||old._sgrt27)return;
    var fn=function(){var nit=text(arguments[0]);var r=old.apply(this,arguments);persistAll(nit);setTimeout(function(){try{if(window.clsRender)window.clsRender();}catch(e){}},20);return r;};fn._sgrt27=true;window[name]=fn;
  }

  function install(){
    persistAll();wrapRender();wrapServer();wrapGuardar();
    ['clsGuardarSupervisorDesdeRegistros','clsGuardarEditarSupervisor','clsEliminarSupervisorDesdeRegistros','clsActualizarSupervisor'].forEach(wrapSupervisorAction);
    try{if(window.clsRender)window.clsRender();}catch(e){}
  }

  document.addEventListener('DOMContentLoaded',function(){setTimeout(install,40);setTimeout(install,900);});
  setTimeout(install,2800);
})();
