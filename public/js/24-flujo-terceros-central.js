/*
 * SGRT — Flujo maestro de terceros.
 * Unifica Registro, Evaluador, fases y Azure SQL sin cambiar la navegación.
 */
(function(){
  'use strict';

  var refreshing=false;
  function norm(v){var s=String(v==null?'':v).toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.replace(/[^a-z0-9]/g,'');}
  function entity(v){var n=norm(v);return n==='cliente1'?'colpensiones':n;}
  function nitOf(t){return String(t&&(t.nit||t.NIT)||'').trim();}
  function nameOf(t){return String(t&&(t.nombre||t.Nombre_Tercero||t.NombreTercero)||nitOf(t));}
  function role(){return String((window.currentUser||{}).rol||'');}
  function isIS(){var u=window.currentUser||{};return u.login==='iseguras2026'||['IS','iseguras','Superadministrador','Super Administrador'].indexOf(role())>=0;}
  function isEvaluator(){var u=window.currentUser||{};return u.login==='evaluador'||role()==='Cliente'||role()==='evaluador';}
  function toast(msg,type,time){try{if(window.showToast)window.showToast(msg,type||'info',time||3200);}catch(e){}}
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');}

  function normalizeRelations(t,key){
    if(!t||typeof t!=='object')return t;
    t.nit=nitOf(t)||key;if(!t.nombre)t.nombre=nameOf(t);
    var supervisors=Array.isArray(t.supervisores)?t.supervisores.slice():[];
    var contracts=Array.isArray(t.contratos)?t.contratos.map(function(c){return Object.assign({},c);}):[];
    if(!contracts.length&&t.nocontrato&&t.nocontrato!=='—')contracts.push({num:t.nocontrato,objeto:t.objetivo||'',fini:t.finicio||'',ffin:t.ffinal||t.fterm||'',estado:t.estadoContrato||'En Ejecucion',valor:t.valor||'',procesos:t.procesosSoporta||'',observaciones:t.observaciones||''});
    function addSupervisor(name,cargo,proceso,contract){
      name=String(name||'').trim();if(!name)return;
      var exists=supervisors.some(function(s){return norm(s.nombre)===norm(name)&&String(s.contrato_asociado||'')===String(contract||'');});
      if(!exists)supervisors.push({nombre:name,cargo:cargo||'',proceso:proceso||'',contrato_asociado:contract||''});
    }
    addSupervisor(t.supervisor,t.cargo,t.procesoSupervision,t.nocontrato&&t.nocontrato!=='—'?t.nocontrato:'');
    contracts.forEach(function(c){
      addSupervisor(c.supervisor,c.supervisorCargo,c.procesoSupervision,c.num);
      addSupervisor(c.supervisorAlt,c.supervisorAltCargo,c.procesoSupervisionAlt,c.num);
      Object.keys(c).forEach(function(k){var m=/^supervisor(\d+)$/.exec(k);if(m)addSupervisor(c[k],c['supervisorCargo'+m[1]],c['procesoSupervision'+m[1]],c.num);});
      var linked=supervisors.filter(function(s){return String(s.contrato_asociado||'')===String(c.num||'');});
      c.supervisor_asociado=c.supervisor_asociado||c.supervisor||(linked[0]&&linked[0].nombre)||t.supervisor||'';
      c.supervisores_asociados=Array.isArray(c.supervisores_asociados)&&c.supervisores_asociados.length?c.supervisores_asociados:linked;
    });
    t.supervisores=supervisors;t.contratos=contracts;
    return t;
  }

  function allRecords(){
    var out={};
    try{var snap=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');Object.assign(out,snap.TERCEROS_DB||{});}catch(e){}
    try{Object.assign(out,JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}')||{});}catch(e2){}
    try{Object.assign(out,window.TERCEROS_DB||{});}catch(e3){}
    Object.keys(out).forEach(function(k){if(out[k])out[k]=normalizeRelations(out[k],k);});
    // Los renderizadores históricos leen directamente window.TERCEROS_DB.
    window.TERCEROS_DB=out;
    return out;
  }

  function visibleRecords(){
    var list=Object.values(allRecords()).filter(function(t){return !!nitOf(t);});
    if(!isEvaluator())return list;
    var ue=entity((window.currentUser||{}).entidad||'');
    if(!ue)return list;
    return list.filter(function(t){var te=entity(t.entidad||t.entidadLabel||'');return !te||te===ue;});
  }

  // El registro existe desde el Paso 1, pero Ambiente de Control pertenece al
  // Paso 3: solo se habilita después de que el Administrador de Riesgos aprueba
  // la clasificación en el Paso 2.
  function approvedForControl(t){
    var status=norm(t&&t.estado||'');
    return !!(t&&(t.habilitado_ac===true||t.aprobado_clasif||status.indexOf('aprobado')>=0));
  }

  function persist(db){
    window.TERCEROS_DB=db;
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db));}catch(e){}
    try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');s.TERCEROS_DB=db;localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e2){}
    try{if(window._lsSave)window._lsSave();}catch(e3){}
  }

  function rebuildClassificationIndex(){
    var db=allRecords(),ids={};Object.keys(db).forEach(function(k){ids[nitOf(db[k])||k]=true;});
    if(!window.CLS_DB||typeof window.CLS_DB!=='object')window.CLS_DB={};
    Object.keys(window.CLS_DB).forEach(function(yr){
      if(!Array.isArray(window.CLS_DB[yr]))window.CLS_DB[yr]=[];
      window.CLS_DB[yr]=window.CLS_DB[yr].filter(function(r){return r&&ids[String(r.nit||'')];});
    });
    var current=String(new Date().getFullYear());
    Object.values(db).forEach(function(t){
      var nit=nitOf(t),yr=String(t.yr||current);if(!nit)return;
      if(!window.CLS_DB[yr])window.CLS_DB[yr]=[];
      var rec={nit:nit,nombre:nameOf(t),entidad:t.entidad||'colpensiones',servicio:t.servicio||t.servicio_contratado||'',supervisor:t.supervisor||'',domicilio:t.domicilio||'',prom:parseFloat(t.prom||0)||0,zona:t.zona||'BAJO',periodicidad:t.periodicidad||'Pendiente de clasificación',yr:yr,dims:Array.isArray(t.dims)?t.dims:[],contratos:Array.isArray(t.contratos)?t.contratos:[],supervisores:Array.isArray(t.supervisores)?t.supervisores:[]};
      var i=window.CLS_DB[yr].findIndex(function(x){return String(x.nit)===nit;});
      if(i>=0)window.CLS_DB[yr][i]=rec;else window.CLS_DB[yr].push(rec);
    });
  }

  function replaceOptions(id,placeholder,valueMode,predicate){
    var sel=document.getElementById(id);if(!sel)return;
    var previous=sel.value||'';sel.innerHTML='';
    var first=document.createElement('option');first.value='';first.textContent=placeholder;sel.appendChild(first);
    visibleRecords().filter(function(t){return !predicate||predicate(t);}).sort(function(a,b){return nameOf(a).localeCompare(nameOf(b),'es');}).forEach(function(t){
      var n=nitOf(t),name=nameOf(t),classified=Array.isArray(t.dims)&&t.dims.length>0;
      var opt=document.createElement('option');opt.value=valueMode==='name'?name:n;
      opt.textContent=name+' — '+n+(classified?'':' · Pendiente de clasificación');sel.appendChild(opt);
    });
    if([].slice.call(sel.options).some(function(o){return o.value===previous;}))sel.value=previous;
  }

  function refreshSelectors(){
    replaceOptions('ac-tercero-instruc','— Selecciona un tercero aprobado —','nit',approvedForControl);
    replaceOptions('q-tercero','— Selecciona un tercero aprobado —','nit',approvedForControl);
    replaceOptions('mz-filtro-tercero','— Todos los terceros —','name');
    replaceOptions('mz-fil-tercero','Todos','name');
    replaceOptions('seg-fil-tercero','Todos los terceros','name');
    replaceOptions('nr-tercero','— Seleccionar —','name');
    var count=document.getElementById('mz-count-terceros');if(count)count.textContent=visibleRecords().length;
  }

  function refreshAll(){
    if(refreshing)return;refreshing=true;
    try{
      rebuildClassificationIndex();
      ['clsInitDash','clsRender','loadIGTercerosFull','_poblarSelectorTerceroClasificar','renderCliRegistros','renderAprobarOp','renderMatriz','renderSeguimiento','updateDashboard','_isSuperAdminRefresh'].forEach(function(fn){try{if(typeof window[fn]==='function')window[fn]();}catch(e){}});
      refreshSelectors();
      setTimeout(refreshSelectors,180);
    }finally{setTimeout(function(){refreshing=false;},260);}
  }

  function formSnapshot(){
    function val(id){return String((document.getElementById(id)||{}).value||'').trim();}
    return {nit:val('cf-nit'),nombre:val('cf-nombre'),entidad:val('cf-entidad')||((window.currentUser||{}).entidad||'colpensiones'),servicio:val('cf-servicio'),servicio_contratado:val('cf-servicio'),supervisor:val('cf-supervisor'),nocontrato:val('cf-nocontrato'),domicilio:val('cf-domicilio'),estado:'Activo'};
  }

  function wrapRegistration(){
    var original=window.guardarClasif;if(typeof original!=='function'||original._sgrtMasterWrapped)return;
    var wrapped=async function(){
      var captured=formSnapshot();
      var result=await original.apply(this,arguments);
      if(!captured.nit||!captured.nombre)return result;
      var db=allRecords(),record=Object.assign({},captured,db[captured.nit]||{});
      record.nit=captured.nit;record.nombre=record.nombre||captured.nombre;record.entidad=record.entidad||captured.entidad;
      record.sincronizado=false;record._changed=true;record.localOnly=true;record.savedAt=record.savedAt||new Date().toISOString();
      db[captured.nit]=record;persist(db);refreshAll();
      try{window.dispatchEvent(new CustomEvent('sgrt:terceros-actualizados',{detail:{nit:captured.nit,source:'registro'}}));}catch(e){}
      if(typeof window._lsSyncWithAzure==='function'){
        Promise.resolve(window._lsSyncWithAzure()).then(function(sync){
          refreshAll();
          if(sync&&sync.fail)toast('El tercero quedó guardado localmente; la base de datos se reintentará automáticamente.','warning',4500);
        }).catch(function(){toast('El tercero quedó guardado localmente; la base de datos se reintentará automáticamente.','warning',4500);});
      }
      return result;
    };
    wrapped._sgrtMasterWrapped=true;window.guardarClasif=wrapped;
  }

  function entityOptions(){
    var list=[];try{list=(window.getISEntidades?window.getISEntidades():[])||[];}catch(e){}
    if(!list.length)list=[{id:'colpensiones',nombre:'Colpensiones'},{id:'ecopetrol',nombre:'Ecopetrol'},{id:'bancolombia',nombre:'Bancolombia'}];
    return list.map(function(x){var id=x.id||x.nombre||'colpensiones',name=x.nombre||x.id;return '<option value="'+String(id).replace(/"/g,'&quot;')+'">'+String(name).replace(/</g,'&lt;')+'</option>';}).join('');
  }

  function injectISRegistration(){
    if(!isIS())return;var page=document.getElementById('admin-pg-config-bd');if(!page||document.getElementById('sgrt-is-register-box'))return;
    var box=document.createElement('div');box.id='sgrt-is-register-box';box.style.cssText='margin-top:18px;background:white;border:1px solid #aac8f0;border-radius:8px;overflow:hidden;box-shadow:var(--shadow);';
    box.innerHTML='<div style="background:#f0f6ff;padding:13px 16px;border-bottom:1px solid #aac8f0;"><div style="font-size:13px;font-weight:800;color:#1a3a5c;">➕ Registrar tercero desde Superadministrador</div><div style="font-size:11px;color:#64748b;margin-top:3px;">El alta se guarda en SQL y aparece automáticamente en Registro, Evaluador y las fases.</div></div><div style="padding:14px 16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:9px;"><input id="is-reg-nit" placeholder="NIT *" style="padding:9px;border:1px solid #aac8f0;border-radius:6px;"><input id="is-reg-nombre" placeholder="Nombre del tercero *" style="padding:9px;border:1px solid #aac8f0;border-radius:6px;"><select id="is-reg-entidad" style="padding:9px;border:1px solid #aac8f0;border-radius:6px;background:white;">'+entityOptions()+'</select><input id="is-reg-domicilio" placeholder="Domicilio" style="padding:9px;border:1px solid #aac8f0;border-radius:6px;"><input id="is-reg-servicio" placeholder="Servicio contratado" style="padding:9px;border:1px solid #aac8f0;border-radius:6px;"><button type="button" onclick="window.guardarTerceroIS()" class="btn btn-primary">Guardar y sincronizar</button></div>';
    page.appendChild(box);
  }

  window.guardarTerceroIS=async function(){
    if(!isIS()){toast('Solo ISeguras/Superadministrador puede usar esta alta','error');return;}
    function val(id){return String((document.getElementById(id)||{}).value||'').trim();}
    var nit=val('is-reg-nit').replace(/[^0-9A-Za-z._-]/g,''),nombre=val('is-reg-nombre');
    if(!nit||!nombre){toast('NIT y nombre son obligatorios','warning');return;}
    var db=allRecords();db[nit]=Object.assign({},db[nit]||{},{nit:nit,nombre:nombre,entidad:val('is-reg-entidad')||'colpensiones',domicilio:val('is-reg-domicilio'),servicio:val('is-reg-servicio'),servicio_contratado:val('is-reg-servicio'),estado:'Activo',prom:0,zona:'BAJO',periodicidad:'Pendiente de clasificación',dims:(db[nit]&&db[nit].dims)||[],contratos:(db[nit]&&db[nit].contratos)||[],sincronizado:false,_changed:true,localOnly:true,savedAt:new Date().toISOString()});
    persist(db);refreshAll();
    try{
      var result=await window._lsSyncWithAzure();
      if(result&&result.fail)throw new Error('El servidor no confirmó el alta');
      toast('Tercero '+nombre+' registrado y sincronizado','success',3800);
      ['is-reg-nit','is-reg-nombre','is-reg-domicilio','is-reg-servicio'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
    }catch(e){toast('Guardado localmente. SQL se reintentará automáticamente: '+e.message,'warning',5000);}
  };

  async function rawRemoteNits(){
    try{var r=await fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json','Cache-Control':'no-cache'}});var d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||('HTTP '+r.status));return (d.data||[]).map(nitOf).filter(Boolean);}catch(e){return Object.keys(allRecords());}
  }
  function clearLocal(){
    for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k)localStorage.removeItem(k);}
    ['TERCEROS_DB','CUEST_RESPUESTAS','RESULTADO_EVALUACION','TIPOLOGIAS_DB_CUSTOM','EVID_CUEST','CUEST_DB','AC_RESPUESTAS','CF_TERCEROS','CLS_DB','REPORTES_POR_FASE','INFORMES_DB'].forEach(function(k){window[k]=Array.isArray(window[k])?[]:{};});
    window.MATRIZ_DB=[];
  }
  window.bdLimpiarBD=async function(){
    if(!isIS()){toast('Solo ISeguras/Superadministrador puede limpiar la base','error');return;}
    if(!confirm('¿Eliminar todos los terceros, fases y datos de prueba locales, y los registros de dbo.Terceros en el servidor?'))return;
    if(prompt('Escribe LIMPIAR para confirmar:')!=='LIMPIAR'){toast('Operación cancelada','warning');return;}
    var ids=await rawRemoteNits(),ok=0,fail=0;
    for(var i=0;i<ids.length;i++)try{await window._remoteDeleteTercero(ids[i],{allowNotFound:true});ok++;}catch(e){fail++;}
    clearLocal();refreshAll();
    toast('Datos locales eliminados · servidor: '+ok+' eliminados'+(fail?' · '+fail+' no confirmados':''),fail?'warning':'success',5000);
    setTimeout(function(){location.reload();},1200);
  };

  window.SGRTThirdPartyFlow={allRecords:allRecords,visibleRecords:visibleRecords,approvedForControl:approvedForControl,normalizeRelations:normalizeRelations,persist:persist,refreshAll:refreshAll,refreshSelectors:refreshSelectors};

  var oldGo=window.goPageIS;if(typeof oldGo==='function'){window.goPageIS=function(pg){var r=oldGo.apply(this,arguments);if(pg==='admin-pg-config-bd')setTimeout(injectISRegistration,160);return r;};}
  var oldLogin=window.doLogin;if(typeof oldLogin==='function'){window.doLogin=function(){var r=oldLogin.apply(this,arguments);setTimeout(function(){wrapRegistration();refreshAll();injectISRegistration();},450);return r;};}
  var oldPull=window._lsPullFromAzure;if(typeof oldPull==='function'){window._lsPullFromAzure=async function(){var r=await oldPull.apply(this,arguments);refreshAll();return r;};}
  window.addEventListener('storage',function(e){if(e.key==='sgrt_terceros_db_shared'||e.key==='sgrt_v8')refreshAll();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){wrapRegistration();setTimeout(function(){refreshAll();injectISRegistration();},500);});
  else{wrapRegistration();setTimeout(function(){refreshAll();injectISRegistration();},500);}
})();
