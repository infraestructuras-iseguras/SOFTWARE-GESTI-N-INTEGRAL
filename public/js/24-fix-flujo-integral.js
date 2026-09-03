/*
 * SGRT — Módulo 24: flujo integral Registro → Clasificación → Aprobación → AC/Evaluador.
 * Mantiene una única fuente de verdad en TERCEROS_DB/localStorage y sincroniza el estado completo con API.
 */
(function(){
  'use strict';
  var MAX_TIPOLOGIAS=5;
  var syncTimer=null;

  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function saveDb(){
    var d=db();
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));}catch(e){}
    try{var s={};try{s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');}catch(e2){}s.TERCEROS_DB=d;localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e3){}
    try{if(window._lsSave)window._lsSave();}catch(e4){}
  }
  function normContract(c){
    c=clone(c)||{};
    c.num=String(c.num||c.numero||c.NoContrato||'').trim();c.numero=c.num;
    c.objeto=c.objeto||c.servicio||'';
    if(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'){c.estado_aprobacion='APROBADO';c.aprobado=true;}
    return c;
  }
  function normalizeThird(t){
    t=t||{};
    t.nit=String(t.nit||t.NIT||'').trim();
    t.nombre=t.nombre||t.NombreTercero||t.Nombre_Tercero||t.Nombre||t.nit;
    t.contratos=Array.isArray(t.contratos)?t.contratos.map(normContract):[];
    t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];
    if(!t.supervisor&&t.supervisores[0])t.supervisor=t.supervisores[0].nombre||'';
    if(!t.dimsPorContrato||typeof t.dimsPorContrato!=='object')t.dimsPorContrato={};
    if(!t.promPorContrato||typeof t.promPorContrato!=='object')t.promPorContrato={};
    if(!t.aprobadoPorContrato||typeof t.aprobadoPorContrato!=='object')t.aprobadoPorContrato={};
    t.contratos.forEach(function(c){
      if(!c||!c.num)return;
      if(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true)t.aprobadoPorContrato[c.num]=true;
      // Compatibilidad inversa: si la aprobación quedó guardada en el mapa por contrato,
      // reflejarla también en el objeto contrato que consumen Control/Evaluador.
      if(t.aprobadoPorContrato[c.num]){c.estado_aprobacion='APROBADO';c.aprobado=true;c.estado='Aprobado';}
    });
    return t;
  }
  function currentDims(){try{return (typeof cfDimsAgregadas!=='undefined'?cfDimsAgregadas:(window.cfDimsAgregadas||[]))||[];}catch(e){return window.cfDimsAgregadas||[];}}
  function refreshAll(nit){
    try{if(window._poblarSelectorTerceroClasificar)window._poblarSelectorTerceroClasificar();}catch(e){}
    try{if(window.sincronizarSelectorCuestionario)window.sincronizarSelectorCuestionario();}catch(e){}
    try{if(window.loadIGTercerosFull)window.loadIGTercerosFull();}catch(e){}
    try{if(window.renderAprobarOp)window.renderAprobarOp();}catch(e){}
    try{if(window.acPoblarSelectorTerceroInstruc)window.acPoblarSelectorTerceroInstruc();}catch(e){}
    try{if(window.renderAdminDash)window.renderAdminDash();}catch(e){}
    try{if(window._isSuperAdminRefresh)window._isSuperAdminRefresh();}catch(e){}
    if(nit){
      try{var s=document.getElementById('cls-tip-tercero-sel');if(s){s.value=nit;}}catch(e){}
      // Si el tercero ya está aprobado, dejarlo visible y seleccionado inmediatamente
      // en Ambiente de Control/Evaluador para continuar el flujo sin recargar.
      try{
        var ac=document.getElementById('ac-tercero-instruc');
        var existeEnAC=ac&&Array.prototype.some.call(ac.options||[],function(o){return String(o.value)===String(nit);});
        if(existeEnAC){
          ac.value=String(nit);
          var q=document.getElementById('q-tercero');if(q)q.value=String(nit);
          if(window.acPoblarContratos)window.acPoblarContratos(String(nit));
          if(window.qPoblarContratos)window.qPoblarContratos(String(nit));
          if(window.acCargarSupervisoresYContratos)window.acCargarSupervisoresYContratos(String(nit));
          if(window.poblarSelectorACTipologia)window.poblarSelectorACTipologia();
        }
      }catch(e){}
    }
  }
  function payload(t){
    t=normalizeThird(clone(t)||{});
    // Adjuntar configuración/respuestas del tercero para que el estado pueda viajar entre roles/navegadores.
    try{if(window.CUEST_CTRL_CUSTOM&&window.CUEST_CTRL_CUSTOM[t.nit])t._configPreguntas=clone(window.CUEST_CTRL_CUSTOM[t.nit]);}catch(e){}
    try{if(window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit])t._respuestas=clone(window.CUEST_RESPUESTAS[t.nit]);}catch(e){}
    return Object.assign({},t,{
      nit:t.nit,nombre:t.nombre,
      domicilio:t.domicilio||'',
      servicio_contratado:t.servicio_contratado||t.servicio||'',
      estado_sgrt:t
    });
  }
  async function upsertRemote(t){
    if(!t||!t.nit)return false;
    try{
      var full=payload(t);
      var r=await fetch(apiBase()+'/api/terceros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(full)});
      var x=await r.json().catch(function(){return{};});
      if(!r.ok||!x.ok)throw new Error(x.error||('HTTP '+r.status));
      var rs=await fetch(apiBase()+'/api/sgrt-state/'+encodeURIComponent(String(t.nit)),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({estado_sgrt:full.estado_sgrt})});
      var xs=await rs.json().catch(function(){return{};});
      if(!rs.ok||!xs.ok)throw new Error(xs.error||('HTTP '+rs.status));
      t.sincronizado=true;t._changed=false;saveDb();return true;
    }catch(e){t.sincronizado=false;t._changed=true;saveDb();console.warn('[SGRT] sync pendiente '+t.nit+':',e.message);return false;}
  }
  function scheduleRemote(t){clearTimeout(syncTimer);syncTimer=setTimeout(function(){upsertRemote(t);},250);}
  window._sgrtUpsertEstadoCompleto=upsertRemote;

  // ── Cargar el estado persistido en servidor y mezclarlo con el local ──
  window.sgrtCargarDesdeServidor=async function(opts){
    opts=opts||{};
    try{
      var pair=await Promise.all([
        fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json'},cache:'no-store'}),
        fetch(apiBase()+'/api/sgrt-state',{headers:{'Accept':'application/json'},cache:'no-store'})
      ]);
      var x=await pair[0].json().catch(function(){return{};});
      var sx=await pair[1].json().catch(function(){return{ok:false,data:[]};});
      if(!pair[0].ok||!x.ok||!Array.isArray(x.data))throw new Error(x.error||('HTTP '+pair[0].status));
      var states={};
      if(pair[1].ok&&sx.ok&&Array.isArray(sx.data))sx.data.forEach(function(r){var n=String(r.nit||'').trim();if(n)states[n]=r.estado_sgrt||{};});
      var d=db();
      x.data.forEach(function(row){
        var rn=String(row.nit||row.NIT||'').trim();
        var state=(states[rn]&&typeof states[rn]==='object')?states[rn]:row;
        var nit=String((state&&state.nit)||rn).trim();if(!nit)return;
        var local=d[nit]||{};
        d[nit]=normalizeThird(Object.assign({},local,state,{nit:nit,nombre:(state&&state.nombre)||row.nombre||row.Nombre_Tercero||local.nombre||nit}));
        try{if(d[nit]._configPreguntas){window.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM||{};window.CUEST_CTRL_CUSTOM[nit]=clone(d[nit]._configPreguntas);localStorage.setItem('sgrt_cuest_custom',JSON.stringify(window.CUEST_CTRL_CUSTOM));}}catch(e){}
        try{if(d[nit]._respuestas){window.CUEST_RESPUESTAS=window.CUEST_RESPUESTAS||{};window.CUEST_RESPUESTAS[nit]=clone(d[nit]._respuestas);localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(window.CUEST_RESPUESTAS));}}catch(e){}
      });
      saveDb();refreshAll(opts.selectNit||'');return {ok:true,count:x.data.length};
    }catch(e){console.warn('[SGRT] carga servidor no disponible:',e.message);return {ok:false,error:e.message};}
  };

  // ── Registro: conservar NIT antes del reset, contratos y supervisores ──
  var oldGuardar=window.guardarClasif;
  if(typeof oldGuardar==='function'){
    window.guardarClasif=async function(){
      var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
      var nombre=((document.getElementById('cf-nombre')||{}).value||'').trim();
      var before=clone(db()[nit]||{});
      var contratos=clone(window._cfContratosBuffer||[]).filter(function(c){return String(c.num||c.numero||'').trim();}).map(normContract);
      var supervisores=clone(window._cfSupervisoresBuffer||[]).filter(function(s){return s&&String(s.nombre||'').trim();});
      var supervisorFormulario=((document.getElementById('cf-supervisor')||{}).value||'').trim();
      try{await oldGuardar.apply(this,arguments);}catch(e){console.error('[SGRT] guardarClasif:',e);try{showToast('No se pudo guardar: '+e.message,'error',3500);}catch(e2){}return;}
      if(!nit)return;
      var after=db()[nit]||{};
      var t=normalizeThird(Object.assign({},before,after,{nit:nit,nombre:after.nombre||nombre||before.nombre||nit}));
      if(contratos.length)t.contratos=contratos;
      if(supervisores.length)t.supervisores=supervisores;
      if(!t.supervisor)t.supervisor=(supervisores[0]&&supervisores[0].nombre)||supervisorFormulario||'';
      // Asociar supervisores a los contratos sin destruir los ya diligenciados.
      t.contratos.forEach(function(c){
        var sups=t.supervisores.filter(function(s){return !s.contrato_asociado||String(s.contrato_asociado)===String(c.num);});
        if(!c.supervisor&&sups[0])c.supervisor=sups[0].nombre||'';
        c.supervisores=sups;
      });
      t.nocontrato=t.nocontrato||(t.contratos[0]&&t.contratos[0].num)||'';
      t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
      db()[nit]=t;saveDb();refreshAll(nit);scheduleRemote(t);
      try{showToast('✅ Tercero guardado y disponible para clasificación','success',2600);}catch(e){}
    };
  }

  // ── Paso 1/2: al editar/seleccionar, NO descartar el primer contrato ──
  window._cfCtrCargarDe=function(nit){
    var t=normalizeThird((db()||{})[nit]||{});
    window._cfContratosBuffer=clone(t.contratos||[]).map(normContract);
    window._cfSupervisoresBuffer=clone(t.supervisores||[]);
    try{if(window._cfCtrRender)window._cfCtrRender();}catch(e){}
    try{if(window._cfRenderSupervisores)window._cfRenderSupervisores();}catch(e){}
    try{if(window._cfRenderSupervisoresTercero)window._cfRenderSupervisoresTercero();}catch(e){}
    return window._cfContratosBuffer;
  };

  // ── Máximo cinco tipologías por contrato ──
  var oldAgregarTip=window.agregarTipologiaSeleccionada;
  if(typeof oldAgregarTip==='function'){
    window.agregarTipologiaSeleccionada=function(){
      var sel=document.getElementById('cf-tip-selector');var key=sel&&sel.value;
      var dims=currentDims();var existe=key&&dims.some(function(d){return d.key===key&&key!=='custom';});
      if(key&&!existe&&dims.length>=MAX_TIPOLOGIAS){try{showToast('Puedes seleccionar máximo 5 tipologías por contrato','warning',3000);}catch(e){}return;}
      return oldAgregarTip.apply(this,arguments);
    };
  }

  // ── Listo: validar tipologías del contrato y persistir su estado independiente ──
  var oldGuardarValoracion=window.guardarValoracionTipologias;
  if(typeof oldGuardarValoracion==='function'){
    window.guardarValoracionTipologias=function(){
      var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
      var contrato=((document.getElementById('cls-contrato-actual')||{}).value||'').trim();
      var dims=currentDims();
      if(!nit){try{showToast('Selecciona un tercero antes de guardar','error',2500);}catch(e){}return false;}
      if(!contrato){try{showToast('Selecciona el contrato que estás clasificando','error',2500);}catch(e){}return false;}
      if(!dims.length){try{showToast('Agrega al menos una tipología al contrato','warning',2500);}catch(e){}return false;}
      if(dims.length>MAX_TIPOLOGIAS){try{showToast('Solo se permiten 5 tipologías por contrato','error',3000);}catch(e){}return false;}
      var sinCalificar=dims.filter(function(d){var v=String(d.val==null?'':d.val).trim();return !v;});
      if(sinCalificar.length){try{showToast('Califica todas las tipologías antes de pulsar Listo','warning',3200);}catch(e){}return false;}
      var result=oldGuardarValoracion.apply(this,arguments);
      var t=normalizeThird(db()[nit]||{});t.contratoEval=contrato;
      t.dimsPorContrato[contrato]=dims.map(function(d){return {key:d.key,nombre:d.nombre,val:d.val,estado_aprobacion:'PENDIENTE'};});
      var vals=dims.map(function(d){return parseFloat(d.val);}).filter(function(v){return !isNaN(v);});
      var prom=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0;
      var zona=prom>=4?'EXTREMO':prom>=3?'ALTO':prom>=2?'MODERADO':'BAJO';
      t.promPorContrato[contrato]={prom:Number(prom.toFixed(2)),zona:zona};
      var c=t.contratos.find(function(x){return String(x.num)===String(contrato);});if(c){c.clasificacion_lista=true;if(c.estado_aprobacion!=='APROBADO')c.estado_aprobacion='PENDIENTE';}
      t.clasificacion_lista=true;t._changed=true;t.sincronizado=false;db()[nit]=t;saveDb();refreshAll(nit);scheduleRemote(t);return result;
    };
  }

  // ── Validación de aprobación: no exige preguntas de AC antes de aprobar clasificación ──
  window._validarAprobacionSGRT=function(t,contratoNum){
    var falt=[];t=normalizeThird(t||{});
    if(!t.nit)falt.push('NIT');if(!t.nombre)falt.push('nombre');
    if(!contratoNum)falt.push('contrato');
    var c=t.contratos.find(function(x){return String(x.num)===String(contratoNum);});if(!c)falt.push('contrato válido');
    var dims=(t.dimsPorContrato&&t.dimsPorContrato[contratoNum])||[];
    if(!dims.length)falt.push('tipologías clasificadas');
    if(dims.length>MAX_TIPOLOGIAS)falt.push('máximo 5 tipologías');
    dims.forEach(function(d){if(String(d.val==null?'':d.val).trim()==='')falt.push('calificación de '+(d.nombre||d.key||'tipología'));});
    var pc=t.promPorContrato&&t.promPorContrato[contratoNum];var prom=parseFloat(pc&&pc.prom);
    if(isNaN(prom)){var vals=dims.map(function(d){return parseFloat(d.val);}).filter(function(v){return !isNaN(v);});prom=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0;}
    if(prom<=3)falt.push('promedio del contrato mayor que 3');
    return {ok:!falt.length,msg:'No se puede aprobar: completa '+falt.join(', ')+'.'};
  };

  // ── Aprobación: usar la misma bandera que consume el Evaluador ──
  var oldApr=window._aprToggleContrato;
  if(typeof oldApr==='function'){
    window._aprToggleContrato=function(nit,num){
      var t=db()[nit];if(!t)return;
      var previo=!!(t.aprobadoPorContrato||{})[num];
      oldApr.apply(this,arguments);
      t=normalizeThird(db()[nit]||t);
      var ahora=!!(t.aprobadoPorContrato||{})[num];
      if(ahora===previo)return; // la validación pudo impedir el cambio
      var c=t.contratos.find(function(x){return String(x.num)===String(num);});
      if(c){c.estado_aprobacion=ahora?'APROBADO':'PENDIENTE';c.aprobado=ahora;c.estado=ahora?'Aprobado':(c.estado==='Aprobado'?'En Ejecucion':c.estado);}
      var dims=(t.dimsPorContrato&&t.dimsPorContrato[num])||[];dims.forEach(function(d){d.estado_aprobacion=ahora?'APROBADO':'PENDIENTE';});
      if(ahora){
        t.aprobado_clasif=t.aprobado_clasif||new Date().toISOString();
        t.habilitado_ac=true;
        t.estado='Aprobado';
        // El contrato recién aprobado queda activo para AC/Evaluador. Esto evita que
        // contratoEval siga apuntando al último contrato clasificado pero NO aprobado.
        t.contratoEval=String(num);
        // Mantener también la vista global de tipologías alineada con el contrato activo.
        t.dims=clone(dims);
      }
      else if(!Object.keys(t.aprobadoPorContrato||{}).some(function(k){return !!t.aprobadoPorContrato[k];})){delete t.aprobado_clasif;t.habilitado_ac=false;}
      t._changed=true;t.sincronizado=false;db()[nit]=t;saveDb();refreshAll(nit);scheduleRemote(t);
      try{if(window.acPoblarContratos)window.acPoblarContratos(nit);if(window.qPoblarContratos)window.qPoblarContratos(nit);if(window.poblarSelectorACTipologia)window.poblarSelectorACTipologia();}catch(e){}
      if(ahora){
        // Confirmación visual inequívoca: botón verde sólido + mensaje visible.
        try{
          document.querySelectorAll('[data-sgrt-aprobar-nit][data-sgrt-aprobar-contrato]').forEach(function(btn){
            if(btn.getAttribute('data-sgrt-aprobar-nit')===String(nit)&&btn.getAttribute('data-sgrt-aprobar-contrato')===String(num)){
              btn.textContent='✓ Aprobado';btn.style.background='#16a34a';btn.style.color='#fff';btn.style.borderColor='#15803d';btn.style.boxShadow='0 2px 7px rgba(22,163,74,.25)';
            }
          });
        }catch(e){}
        try{showToast('✅ Contrato '+num+' aprobado. Ya está disponible en Ambiente de Control y Evaluador.','success',3200);}catch(e){}
      }
    };
  }

  // ── AC/Evaluador: nunca dejar contratoEval apuntando a uno no aprobado ──
  function asegurarContratoAprobado(nit){
    var t=nit?normalizeThird(db()[nit]||{}):null;if(!t)return null;
    var aprobados=(t.contratos||[]).filter(function(c){return c&&c.num&&(t.aprobadoPorContrato[c.num]||c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true);});
    if(aprobados.length&&!aprobados.some(function(c){return String(c.num)===String(t.contratoEval||'');})){
      t.contratoEval=String(aprobados[0].num);db()[nit]=t;saveDb();
    }
    return t;
  }
  var oldAcPoblarContratos=window.acPoblarContratos;
  if(typeof oldAcPoblarContratos==='function')window.acPoblarContratos=function(nit){asegurarContratoAprobado(nit);return oldAcPoblarContratos.apply(this,arguments);};
  var oldQPoblarContratos=window.qPoblarContratos;
  if(typeof oldQPoblarContratos==='function')window.qPoblarContratos=function(nit){asegurarContratoAprobado(nit);return oldQPoblarContratos.apply(this,arguments);};

  // ── Evaluador: solo contratos aprobados y tipologías aprobadas del contrato seleccionado ──
  window.poblarSelectorACTipologia=function(){
    var sel=document.getElementById('ac-tip-filtro');if(!sel)return;
    sel.innerHTML='<option value="">-- Seleccionar tipología --</option>';
    var nit=((document.getElementById('ac-tercero-instruc')||{}).value||(document.getElementById('q-tercero')||{}).value||'').trim();
    var t=nit?normalizeThird(db()[nit]||{}):null;var contrato='';
    if(t){contrato=((document.getElementById('ac-contrato-sel')||{}).value||(document.getElementById('q-contrato-sel')||{}).value||t.contratoEval||'').trim();}
    var dims=[];
    if(t&&contrato&&t.aprobadoPorContrato[contrato])dims=(t.dimsPorContrato[contrato]||[]).filter(function(d){return d.estado_aprobacion==='APROBADO'||t.aprobadoPorContrato[contrato];});
    else if(t){
      Object.keys(t.aprobadoPorContrato||{}).filter(function(k){return t.aprobadoPorContrato[k];}).forEach(function(k){(t.dimsPorContrato[k]||[]).forEach(function(d){if(!dims.some(function(x){return x.key===d.key;}))dims.push(d);});});
    }
    dims.forEach(function(d){var o=document.createElement('option');o.value=(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key));o.textContent=o.value;o.setAttribute('data-key',d.key||'');sel.appendChild(o);});
    var desc=document.getElementById('ac-consultor-desc');if(desc){desc.innerHTML=dims.length?'<span style="color:#28a745;font-weight:700;">✓ '+dims.length+' tipología(s) aprobada(s)</span> disponibles para diligenciar.':(nit?'⚠ Selecciona un contrato aprobado con tipologías.':'Selecciona un tercero aprobado.');}
  };

  // Cambio de contrato en AC debe refrescar inmediatamente tipologías.
  var oldAcCambiar=window.acCambiarContrato;
  if(typeof oldAcCambiar==='function')window.acCambiarContrato=function(v){var r=oldAcCambiar.apply(this,arguments);try{window.poblarSelectorACTipologia();}catch(e){}return r;};
  var oldQCambiar=window.qCambiarContrato;
  if(typeof oldQCambiar==='function')window.qCambiarContrato=function(v){var r=oldQCambiar.apply(this,arguments);try{window.poblarSelectorACTipologia();}catch(e){}return r;};

  // Borrado remoto coherente: maestro + estado extendido.
  window._remoteDeleteTercero=async function(nit){
    var errs=[];
    try{var rs=await fetch(apiBase()+'/api/sgrt-state/'+encodeURIComponent(String(nit)),{method:'DELETE'});if(!rs.ok&&rs.status!==404)errs.push('estado HTTP '+rs.status);}catch(e){errs.push(e.message);}
    var r=await fetch(apiBase()+'/api/terceros/'+encodeURIComponent(String(nit)),{method:'DELETE',headers:{'Accept':'application/json'}});
    var x=await r.json().catch(function(){return{};});
    if(!r.ok&&r.status!==404)throw new Error(x.error||('HTTP '+r.status));
    if(errs.length)console.warn('[SGRT] borrado parcial:',errs.join(', '));
    try{delete db()[nit];saveDb();refreshAll();}catch(e){}
    return {ok:true,nit:nit};
  };

  // ── Sincronización manual: subir TODO y después bajar el estado de servidor ──
  window._lsSyncWithAzure=async function(){
    var d=db(),ok=0,fail=0;
    for(var nit of Object.keys(d)){var done=await upsertRemote(d[nit]);if(done)ok++;else fail++;}
    await window.sgrtCargarDesdeServidor();return {ok:ok,fail:fail,total:ok+fail};
  };
  window.bdSincronizarAhora=async function(){
    try{var r=await window._lsSyncWithAzure();try{showToast(r.fail?'Sincronizados: '+r.ok+' · pendientes: '+r.fail:'✅ '+r.ok+' terceros sincronizados con la BD',r.fail?'warning':'success',3500);}catch(e){}if(window.bdActualizarEstado)window.bdActualizarEstado();}catch(e){try{showToast('No se pudo sincronizar: '+e.message,'error',3500);}catch(e2){}}
  };

  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){window.sgrtCargarDesdeServidor();},500);});
})();
