
// ═══════════════════════════════════════════════════════════════
// SGRT — Fix Script v3 — 3 Roles: IS / Operativo / Cliente
// ═══════════════════════════════════════════════════════════════

// ── USUARIOS (3 roles) ──────────────────────────────────────────
window.USERS = {
  // ROL 1: Infraestructuras Seguras
  'iseguras2026': {pass:'ISEGURAS_2026', name:'Infraestructuras Seguras', rol:'IS',        initials:'IS', entidad:null,      tipologias:null},
  // ROL 2: Operativo (se agregan desde admin)
  'admin_riesgos': {pass:'Admin2026*',   name:'Administrador de Riesgos', rol:'Operativo', initials:'AR', entidad:'colpensiones',tipologias:null},
  // ROL 3: Cliente
  'evaluador':     {pass:'Eval2026*',         name:'Evaluador',                rol:'Cliente',   initials:'EV', entidad:'colpensiones',tipologias:null},
  'cliente2':     {pass:'cli2026b',      name:'Cliente B',                rol:'Cliente',   initials:'C2', entidad:'cliente2',tipologias:null},
};

// ── HELPERS ────────────────────────────────────────────────────
window.getUser     = function(){ return window.currentUser||null; };
window.getEntidad  = function(){ var u=getUser(); return u&&u.entidad||'cliente1'; };
window.getTipsFiltro = function(){ var u=getUser(); return u&&u.tipologias||null; };
window.puedeVerTip = function(nom){ var f=getTipsFiltro(); if(!f)return true; return f.some(function(t){return nom&&nom.toLowerCase().indexOf(t.toLowerCase().slice(0,12))>=0;}); };

// Recuperar contraseña
window.recPass = function(){
  var u=(document.getElementById('rec-u')||{value:''}).value.trim().toLowerCase();
  var res=document.getElementById('rec-res'); if(!res)return;
  if(!u){res.innerHTML='<span style="color:#dc3545;">Escribe tu usuario</span>';return;}
  var usr=window.USERS[u];
  if(!usr){res.innerHTML='<span style="color:#dc3545;">Usuario no encontrado</span>';return;}
  res.innerHTML='<div style="background:white;border:1px solid #dee2e6;border-radius:6px;padding:8px 12px;">'
    +'<div style="font-size:11.5px;">Usuario: <b>'+u+'</b></div>'
    +'<div style="font-size:11.5px;margin-top:4px;">Contraseña: <b style="font-family:monospace;background:#f0fdf4;padding:2px 8px;border-radius:4px;">'+usr.pass+'</b></div>'
    +'<div style="font-size:10.5px;color:#aaa;margin-top:3px;">Rol: '+usr.rol+'</div>'
    +'</div>';
};

// ── PERSISTENCIA + AZURE SYNC ────────────────────────────────────
var _LS='sgrt_v8';
window._lsSave = function(){
  try{
    var data={
      TERCEROS_DB: window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{},
      tercerosPendientesCuestionario: (typeof tercerosPendientesCuestionario!=='undefined'?tercerosPendientesCuestionario:[]),
      CUEST_RESPUESTAS: window.CUEST_RESPUESTAS||{},
      RESULTADO_EVALUACION: window.RESULTADO_EVALUACION||{},
      MATRIZ_DB: window.MATRIZ_DB||[],
      TIPOLOGIAS_DB_CUSTOM: window.TIPOLOGIAS_DB_CUSTOM||{},
      EVID_CUEST: (typeof EVID_CUEST!=='undefined'?EVID_CUEST:{}),
      TIP_NIVELES: window.TIP_NIVELES||{},
      LOGS_DATA: (window.LOGS_DATA||[]).slice(0,300),
      USERS_EXTRA: window.USERS_EXTRA||{},
      NOTIF_LOG: (window.NOTIF_LOG||[]).slice(0,80),
      INFORMES_DB: window.INFORMES_DB||{},
      CUEST_CTRL_CUSTOM: window.CUEST_CTRL_CUSTOM||{},
      PERS_HIDDEN: window._persHiddenControls||{},
    };
    localStorage.setItem(_LS, JSON.stringify(data));
    try{ localStorage.setItem('sgrt_cuest_respuestas', JSON.stringify(window.CUEST_RESPUESTAS||{})); }catch(e2){}
    try{ localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB||{})); }catch(e3){}
    
    // ⭐ AUTO-SINCRONIZAR VISTAS
    try{ if(typeof renderAprobarOp === 'function') renderAprobarOp(); }catch(e){}
    try{ if(typeof acPoblarSelectorTerceroInstruc === 'function') acPoblarSelectorTerceroInstruc(); }catch(e){}
    try{ if(typeof renderReportesAC === 'function') renderReportesAC(); }catch(e){}
    
    // ⭐ SINCRONIZAR CON AZURE (en background, no bloquea UI).
    // Cuando el propio puente remoto está guardando, se omite este disparo para
    // evitar bucles de sincronización POST → _lsSave → POST.
    if(window._lsSyncWithAzure && !window._SGRT_SKIP_AUTOSYNC) {
      setTimeout(function(){
        if(!window._SGRT_SKIP_AUTOSYNC && window._lsSyncWithAzure) window._lsSyncWithAzure();
      }, 300);
    }
  }catch(e){}
};
window._lsLoad = function(){
  try{
    var d=JSON.parse(localStorage.getItem(_LS)||'{}');
    if(d.TERCEROS_DB){ Object.keys(TERCEROS_DB).forEach(function(k){delete TERCEROS_DB[k];}); Object.assign(TERCEROS_DB,d.TERCEROS_DB); window.TERCEROS_DB=TERCEROS_DB; }
    if(d.CUEST_RESPUESTAS){ Object.keys(CUEST_RESPUESTAS).forEach(function(k){delete CUEST_RESPUESTAS[k];}); Object.assign(CUEST_RESPUESTAS,d.CUEST_RESPUESTAS); window.CUEST_RESPUESTAS=CUEST_RESPUESTAS; }
    if(d.RESULTADO_EVALUACION) window.RESULTADO_EVALUACION=d.RESULTADO_EVALUACION;
    if(d.MATRIZ_DB&&d.MATRIZ_DB.length){ MATRIZ_DB.length=0; d.MATRIZ_DB.forEach(function(r){MATRIZ_DB.push(r);}); window.MATRIZ_DB=MATRIZ_DB; }
    // Migración una-vez: IDs viejos (EJ_*, R_NIT_key_ts_idx) → R1, R2, R3
    try{
      var migro=false;
      MATRIZ_DB.forEach(function(r,idx){
        if(r && r.id && !/^R\d+$/.test(r.id)){ r.id='R'+(idx+1); migro=true; }
      });
      if(migro){ /* se persistirá con el próximo _lsSave */ }
    }catch(eMig){}
    if(d.TIPOLOGIAS_DB_CUSTOM) window.TIPOLOGIAS_DB_CUSTOM=d.TIPOLOGIAS_DB_CUSTOM;
    // Unificar entidad histórica cliente1 → colpensiones en TERCEROS_DB
    // (así el sidebar, tablas y filtros muestran UNA sola etiqueta)
    try{
      Object.values(window.TERCEROS_DB||{}).forEach(function(t){
        if(t && (t.entidad==='cliente1' || t.entidad==='CLIENTE1')) t.entidad='colpensiones';
      });
    }catch(eEnt){}
    if(d.EVID_CUEST && typeof EVID_CUEST!=='undefined'){ Object.keys(EVID_CUEST).forEach(function(k){delete EVID_CUEST[k];}); Object.assign(EVID_CUEST, d.EVID_CUEST); }
    // ── Migración única al catálogo oficial del Excel (V3) ──────────
    // Las configuraciones de controles guardadas antes de esta versión
    // contienen los textos VIEJOS y pisarían el catálogo nuevo (por eso
    // el Evaluador veía "otros controles"). Se limpian una sola vez.
    try{
      if(!localStorage.getItem('sgrt_ctrls_excel_v3')){
        if(window.TIPOLOGIAS_DB_CUSTOM){
          Object.keys(window.TIPOLOGIAS_DB_CUSTOM).forEach(function(ent){
            var cfg = window.TIPOLOGIAS_DB_CUSTOM[ent];
            if(cfg && typeof cfg==='object'){
              Object.keys(cfg).forEach(function(tid){
                if(cfg[tid] && cfg[tid].preguntas) delete cfg[tid].preguntas;
              });
            }
          });
        }
        localStorage.setItem('sgrt_ctrls_excel_v3','1');
      }
    }catch(eMig){}
    if(d.TIP_NIVELES) window.TIP_NIVELES=d.TIP_NIVELES;
    if(d.LOGS_DATA)   window.LOGS_DATA=d.LOGS_DATA;
    if(d.tercerosPendientesCuestionario&&d.tercerosPendientesCuestionario.length){
      if(typeof tercerosPendientesCuestionario!=='undefined'){
        d.tercerosPendientesCuestionario.forEach(function(t){
          if(!tercerosPendientesCuestionario.find(function(x){return x.nit===t.nit;}))
            tercerosPendientesCuestionario.push(t);
        });
      }
    }
    if(d.USERS_EXTRA) {
      window.USERS_EXTRA=d.USERS_EXTRA;
      Object.assign(window.USERS, d.USERS_EXTRA);
    }
    if(d.NOTIF_LOG) window.NOTIF_LOG = d.NOTIF_LOG;
    if(d.INFORMES_DB) window.INFORMES_DB = d.INFORMES_DB;
    // Config del cuestionario por tercero (controles personalizados y ocultos)
    if(d.CUEST_CTRL_CUSTOM){
      Object.keys(d.CUEST_CTRL_CUSTOM).forEach(function(k){
        if(!CUEST_CTRL_CUSTOM[k]||!Object.keys(CUEST_CTRL_CUSTOM[k]).length) CUEST_CTRL_CUSTOM[k]=d.CUEST_CTRL_CUSTOM[k];
      });
      window.CUEST_CTRL_CUSTOM=CUEST_CTRL_CUSTOM;
    }
    if(d.PERS_HIDDEN){
      if(window._persHiddenControls){
        Object.keys(window._persHiddenControls).forEach(function(k){ delete window._persHiddenControls[k]; });
        Object.assign(window._persHiddenControls, d.PERS_HIDDEN);
      } else { window._persHiddenControls = d.PERS_HIDDEN; }
    }
    // IMPORTANTE: además del snapshot 'sgrt_v8', varios módulos guardan directamente en
    // 'sgrt_terceros_db_shared' y 'sgrt_cuest_respuestas'. Si no se fusionan aquí también, al
    // volver a ingresar se puede ver información vieja o vacía aunque el cambio sí se
    // guardó. Se fusionan SIEMPRE encima, porque son las escrituras más recientes.
    try{
      var _td=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      if(_td && Object.keys(_td).length){ Object.assign(TERCEROS_DB,_td); window.TERCEROS_DB=TERCEROS_DB; }
    }catch(e2){}
    // Migración final: entidad cliente1 → colpensiones (después de fusionar
    // el snapshot compartido, para que ninguna entrada quede con el alias)
    try{
      Object.values(window.TERCEROS_DB||{}).forEach(function(t){
        if(t && (t.entidad==='cliente1' || t.entidad==='CLIENTE1')) t.entidad='colpensiones';
      });
    }catch(eEnt2){}
    try{
      var _cr=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
      if(_cr && Object.keys(_cr).length){ Object.assign(CUEST_RESPUESTAS,_cr); window.CUEST_RESPUESTAS=CUEST_RESPUESTAS; }
    }catch(e3){}
  }catch(e){}
};
document.addEventListener('DOMContentLoaded', function(){
  // ✅ CARGAR DATOS GUARDADOS - NUNCA SOBRESCRIBIR
  window._lsLoad();
  console.log('✅ _lsLoad() - Datos persistentes cargados desde localStorage');
  
  // 🔴 SI ESTÁ VACÍO, PRECARGAR DATOS DE EJEMPLO AUTOMÁTICAMENTE
  if(!window.SGRT_DISABLE_AUTO_DEMO && (!window.TERCEROS_DB || Object.keys(window.TERCEROS_DB||{}).length === 0)) {
    console.log('⚠️ TERCEROS_DB vacío - precargando datos de ejemplo');
    setTimeout(function(){
      window.cargarDatosDemo && window.cargarDatosDemo();
    }, 100);
  }
  
  window.odInit && window.odInit();
  try{ window.renderNotifPanel && window.renderNotifPanel(); }catch(e){}
});

// ── DATOS DE EJEMPLO (solo si la base está vacía; nunca pisa datos reales) ──
window._seedDatosEjemplo = function(force){
  try{
    var db = window.TERCEROS_DB || (typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{});

    function mkResp(nivelSi){ // nivelSi: cuántos de a1..a6 quedan en 'Si' (0 a 6)
      var atribs=['a1','a2','a3','a4','a5','a6'];
      var r={};
      atribs.forEach(function(a,i){ r[a] = (i < nivelSi) ? 'Si' : 'No'; });
      return r;
    }

    var EJEMPLOS = [].filter(function(e){ return force || !db[e.nit]; }); // nunca pisa un NIT que ya exista

    if(!EJEMPLOS.length) return; // los 3 ejemplos ya están — no hay nada que agregar

    var nuevoTERCEROS = {};
    var nuevoCUEST = window.CUEST_RESPUESTAS || (typeof CUEST_RESPUESTAS!=='undefined'?CUEST_RESPUESTAS:{}) || {};
    var matrizArr = window.MATRIZ_DB || (typeof MATRIZ_DB!=='undefined'?MATRIZ_DB:[]) || [];

    EJEMPLOS.forEach(function(e){
      var dims = e.dims.map(function(d){
        return {key:d.key, nombre:(window.SECCIONES_INFO&&window.SECCIONES_INFO[d.key]?window.SECCIONES_INFO[d.key].label:d.key), val:d.val};
      });
      var vals = dims.map(function(d){return d.val;});
      var prom = parseFloat((vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(2));
      var zona = prom>=4?'EXTREMO':prom>=3?'ALTO':'BAJO';
      var periodicidad = prom>=4?'Anual':prom>=3?'Bienal':'Sin evaluación';
      nuevoTERCEROS[e.nit] = {
        nit:e.nit, nombre:e.nombre, entidad:e.entidad, servicio:e.servicio, supervisor:e.supervisor,
        periodicidad:periodicidad, prom:prom, zona:zona, estado:'Activo', dims:dims, habilitado_ac:true, contratos:e.contratos||[]
      };
      var respPorTip={};
      dims.forEach(function(d){
        var ctrls=(window.CUESTIONARIO_CONTROLES||{})[d.key]||[];
        var nivel=e.nivelAC[d.key]||3;
        var respCtrl={};
        ctrls.slice(0,3).forEach(function(c,idx){
          respCtrl[c.n]=mkResp(Math.max(0,nivel-idx));
        });
        respPorTip[d.key]=respCtrl;
      });
      respPorTip.__savedAt=Date.now();
      nuevoCUEST[e.nit]=respPorTip;
      dims.forEach(function(d){
        var zonaR=d.val>=4?'EXTREMO':d.val>=3?'ALTO':d.val>=2?'MODERADO':'BAJO';
        // Nombre completo de la tipología (Riesgo Operacional, Continuidad del Negocio...)
        var nomFull = (window._nombreTipologia ? window._nombreTipologia({key:d.key,nombre:d.nombre}) : (d.nombre||d.key));
        // Ref R1, R2, R3... como en el Excel (numeración global consecutiva)
        var refNum = matrizArr.length + 1;
        matrizArr.push({
          id:'R'+refNum, nit:e.nit, tercero:e.nombre, entidad:e.entidad,
          tipo:nomFull, factor:'Ejemplo demostrativo', clasif:'Ejemplo', contrato:'',
          desc:'Riesgo identificado en '+nomFull+' · Valoración: '+d.val,
          causa:'Ejemplo', vuln:'Ejemplo',
          probInh:'0.6', impInh:'0.8', zonaInh:zonaR,
          control:'Controles según cuestionario AC', tipoCtrl:'PREVENTIVO',
          probRes:'0.4', impRes:'0.6', zonaRes:zonaR,
          tratamiento:'Seguimiento periódico',
          plan:'Seguimiento', resp:'Administrador de Riesgos',
          fechaImpl:'', fechaSeg:'', descSeg:'', estado:'Pendiente'
        });
      });
    });

    Object.assign(db, nuevoTERCEROS);
    window.TERCEROS_DB = db;
    window.CUEST_RESPUESTAS = nuevoCUEST;
    window.MATRIZ_DB = matrizArr;

    try{ localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB)); }catch(e){}
    try{ localStorage.setItem('sgrt_cuest_respuestas', JSON.stringify(window.CUEST_RESPUESTAS)); }catch(e){}
    try{ window._lsSave && window._lsSave(); }catch(e){}
  }catch(e){ console.warn('seed ejemplo error:', e); }
};
// ⭐ DESACTIVADO: No cargar datos de ejemplo
// document.addEventListener('DOMContentLoaded', function(){
//   setTimeout(function(){ try{ window._seedDatosEjemplo(); }catch(e){} }, 300);
// });
console.log('ℹ️ Datos de ejemplo desactivados');

// ── NAVTO ──────────────────────────────────────────────────────
window.navTo = function(el, pgId){
  // El Dashboard es exclusivo de ISEGURAS/Superadministrador. Si un enlace
  // antiguo intenta abrirlo para el Evaluador, llevarlo a Información General.
  if(pgId==='pg-dashboard' && (window.currentUser||{}).rol==='Cliente'){
    pgId='pg-info-general';
    el=document.querySelector('#sb-Cliente .nav-item[onclick*="pg-info-general"]')||el;
  }
  var appEl=document.getElementById('app');
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');p.style.display='';});
  document.getElementById('main-sidebar').querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  var pg=document.getElementById(pgId);
  if(pg){
    pg.classList.add('active');
    // Si la página está anidada dentro de otra página, mostrar los ancestros
    var parent=pg.parentElement;
    while(parent && parent!==appEl){
      if(parent.classList && parent.classList.contains('page')){
        parent.style.display='block';
      }
      parent=parent.parentElement;
    }
  }
  if(el)el.classList.add('active');
  var mc=appEl.querySelector('.main-content'); if(mc)mc.scrollTop=0;
  var map={
    'pg-tip-op':         function(){ try{ window._lsLoad && window._lsLoad(); }catch(e){} renderTipOp(); },
    'pg-ctrl-op':        function(){ try{ window._lsLoad && window._lsLoad(); }catch(e){} renderCtrlOp(); },
    'pg-config-riesgo':  function(){ try{ window._lsLoad && window._lsLoad(); }catch(e){} renderConfigRiesgo(); },
    'pg-aprobar-op':     function(){setTimeout(renderAprobarOp,50);},
    'pg-info-general':   function(){setTimeout(function(){
      try{window._lsLoad&&window._lsLoad();}catch(e){}
      try{window.switchIGTab('terceros');}catch(e){try{loadIGTercerosFull();}catch(e2){} }
    },100);},
    'pg-terceros':       function(){setTimeout(function(){
      try{window._lsLoad&&window._lsLoad();}catch(e){}
      try{refreshTercerosTable();}catch(e){}
      // La navegación base ya carga la API una vez para esta página.
    },50);},
    'pg-evidencias-repo':function(){
      odInit();
      setTimeout(function(){
        var role=(window.currentUser||{}).rol;
        var tab=document.getElementById('od-tab-terceros');
        if(tab) tab.style.display=(role==='Cliente'||role==='Operativo')?'inline-block':'none';
      },40);
    },
    'pg-reportes':       function(){ try{ renderReportesInformes(); }catch(e){ console.warn('navTo pg-reportes:', e); } },
    'pg-reportes-entidad': function(){
      try{ window._lsLoad && window._lsLoad(); }catch(e){}
      try{ window.renderReportesPorEntidadOp && window.renderReportesPorEntidadOp(); }catch(e){ console.warn('navTo pg-reportes-entidad:', e); }
    },
    'pg-dashboard':      function(){try{updateDashboard();}catch(e){}},
    'pg-clasificacion':  function(){
      try{ window._lsLoad && window._lsLoad(); }catch(e){}
      try{
        var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
        if(Object.keys(_sv).length){
          if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
          Object.assign(TERCEROS_DB,_sv);
        }
      }catch(e){}
      // ⭐ ELIMINAR DUPLICADOS AL CARGAR
      try{ window._limpiarDuplicados && window._limpiarDuplicados(); }catch(e){}
      try{fijarEntidadClasificacion();}catch(e){}
      setTimeout(refrescarSelectorTipCliente,150);
      // Refrescar tabla de lectura (terceros + promedio) con los datos más recientes
      setTimeout(function(){
        try{ window.clsInitDash && window.clsInitDash(); }catch(e){}
        try{ window.clsRender && window.clsRender(); }catch(e){}
      },50);
      // Reforzar restricciones de rol (el Evaluador solo debe ver la tabla en lectura)
      setTimeout(function(){
        try{ var _cu2=window.currentUser; if(_cu2 && _cu2.rol==='Cliente') applyRoleRestrictions(); }catch(e){}
      },60);
    },
    'pg-cuestionario':   function(){
      // Recargar siempre desde localStorage para que el Evaluador vea los cambios
      // que el Admin haya hecho en controles/tipologías sin necesidad de recargar la página
      try{ window._lsLoad && window._lsLoad(); }catch(e){}
      try{sincronizarSelectorCuestionario();}catch(e){}
      setTimeout(poblarSelectorACTipologia,200);
      // Administrador de Riesgos: solo supervisa (ve formularios diligenciados, puntaje
      // de controles y avance, con filtro por tercero/tipología) — no diligencia.
      try{
        var _cu3=window.currentUser;
        if(_cu3 && _cu3.rol==='Operativo'){
          var tInstr=document.getElementById('cq-tab-instruc'), tCuest=document.getElementById('cq-tab-cuest');
          if(tInstr) tInstr.style.display='none';
          if(tCuest) tCuest.style.display='none';
          setTimeout(function(){ try{switchCuestTabExtended('reportes');}catch(e){} },60);
        } else {
          var tInstr2=document.getElementById('cq-tab-instruc'), tCuest2=document.getElementById('cq-tab-cuest');
          if(tInstr2) tInstr2.style.display='';
          if(tCuest2) tCuest2.style.display='';
        }
      }catch(e){}
    },
    'pg-usuarios':       function(){renderGestionUsuarios();},
    'pg-matriz':         function(){
      try{
        var _sv=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
        if(_sv.TERCEROS_DB) Object.assign(TERCEROS_DB,_sv.TERCEROS_DB);
        if(_sv.MATRIZ_DB&&_sv.MATRIZ_DB.length){
          _sv.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
        }
        if(window.MATRIZ_DB&&window.MATRIZ_DB.length){
          window.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
        }
        window.MATRIZ_DB = MATRIZ_DB;
      }catch(e){ console.warn('navTo pg-matriz restaurar DB:', e); }
      try{
        var _ms=document.getElementById('mz-fil-tercero');
        if(_ms){
          _ms.innerHTML='<option value="">Todos</option>';
          var _sn=new Set();
          MATRIZ_DB.forEach(function(r){ if(r.tercero&&!_sn.has(r.tercero)){_sn.add(r.tercero);var o=document.createElement('option');o.value=r.tercero;o.textContent=r.tercero;_ms.appendChild(o);} });
          Object.values(TERCEROS_DB).forEach(function(t){ if(t.nombre&&!_sn.has(t.nombre)){_sn.add(t.nombre);var o=document.createElement('option');o.value=t.nombre;o.textContent=t.nombre;_ms.appendChild(o);} });
        }
      }catch(e){ console.warn('navTo pg-matriz selector tercero:', e); }
      try{ renderMatriz(); }catch(e){ console.warn('navTo pg-matriz renderMatriz:', e); }
      // Dashboard de supervisión (Administrador de Riesgos) — llamada directa e
      // independiente para que se pinte aunque algo arriba falle.
      try{
        if((window.currentUser||{}).rol==='Operativo'){
          window.renderMatrizDashSupervision && window.renderMatrizDashSupervision();
        }
      }catch(e){ console.warn('navTo pg-matriz renderMatrizDashSupervision:', e); }
      try{ actualizarTipoRiesgoTags(); }catch(e){}
    },
    'pg-seguimiento':    function(){
      try{
        var _sv=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
        if(_sv.MATRIZ_DB&&_sv.MATRIZ_DB.length){
          _sv.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
        }
        if(window.MATRIZ_DB&&window.MATRIZ_DB.length){
          window.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
        }
        window.MATRIZ_DB = MATRIZ_DB;
      }catch(e){ console.warn('navTo pg-seguimiento restaurar DB:', e); }
      try{ renderSeguimiento(); }catch(e){ console.warn('navTo pg-seguimiento renderSeguimiento:', e); }
    }
  };
  if(map[pgId]) setTimeout(map[pgId],80);
};

// ── DOLOGIN ────────────────────────────────────────────────────
window.doLogin = function(){
  var u=(document.getElementById('li-user').value||'').trim().toLowerCase();
  var pw=document.getElementById('li-pass').value||'';
  var err=document.getElementById('login-err');
  if(!window.USERS[u]||window.USERS[u].pass!==pw){
    if(err){err.style.display='block';err.textContent='Usuario o contraseña incorrectos';}
    document.getElementById('li-pass').value=''; return;
  }
  if(err)err.style.display='none';
  window.currentUser=window.USERS[u];
  var user=window.currentUser;
  document.getElementById('login-screen').style.display='none';
  window._lsLoad();
  
  // ✅ Si NO es iseguras (Super Admin), limpiar datos de Terceros en localStorage
  if(user.rol !== 'IS'){
    try{
      localStorage.removeItem('sgrt_terceros');
      console.log('✅ Datos de Terceros limpios para rol: ' + user.rol);
    }catch(e){console.error(e);}
  }
  
  // ✅ CARGAR TERCEROS_DB COMPARTIDA ENTRE ADMIN_RIESGOS Y CLIENTE/EVALUADOR
  try{
    var dbShared = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(dbShared).length > 0){
      window.TERCEROS_DB = dbShared;
      console.log('✅ TERCEROS_DB compartida cargada desde localStorage para rol: ' + user.rol);
    }
  }catch(e){ console.error('Error cargando TERCEROS_DB compartida:', e); }

  if(user.rol==='IS'){
    // Ocultar otros panels
    document.getElementById('cliente-app').style.display='none';
    document.getElementById('app').style.display='none';
    // Mostrar admin-app usando classList (el CSS usa !important, no funciona inline style)
    var adminEl=document.getElementById('admin-app');
    adminEl.classList.add('active');
    adminEl.style.removeProperty('display'); // quitar cualquier inline display que lo bloqueara
    // Topbar
    var ava=document.getElementById('admin-tb-ava'); if(ava)ava.textContent=user.initials||'IS';
    var un=document.getElementById('admin-tb-uname'); if(un)un.textContent=user.name;
    // Mostrar sidebar IS
    adminEl.querySelectorAll('[id^="asb-"]').forEach(function(s){s.style.display='none';});
    var asbIS = document.getElementById('asb-IS'); if(asbIS) asbIS.style.display='block';
    var sbNomIS = document.getElementById('sb-is-nombre'); if(sbNomIS) sbNomIS.textContent=user.name;
    // Activar main-content y primera página del admin IS
    var mc = document.getElementById('admin-main-content');
    if(mc) mc.style.cssText='flex:1;overflow-y:auto;padding:22px;background:#f4f6f9;';
    adminEl.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
    var dashPg = document.getElementById('admin-pg-dashboard'); if(dashPg) dashPg.classList.add('active');
    adminEl.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
    var fn = adminEl.querySelector('.nav-item'); if(fn) fn.classList.add('active');
    // Inicializar dashboard IS
    setTimeout(function(){
      try{window.initAdminDashboardIS();}catch(e){}
      try{window.renderISUsuarios();}catch(e){}
      try{window.mostrarBotonBDFlotante();}catch(e){}
    },150);
    try{showToast('Bienvenido, '+user.name+' — Admin IS','success',3000);}catch(e){}
    return;
  }

  // Operativo / Cliente
  document.getElementById('admin-app').style.cssText='display:none;';
  var clienteEl=document.getElementById('cliente-app');
  // cliente-app es wrapper transparente, NO debe ser flex-column (rompe el sidebar)
  clienteEl.style.cssText='display:block;';
  var appEl=document.getElementById('app');
  appEl.style.cssText='display:flex;flex-direction:column;height:100vh;overflow:hidden;';
  var appBody=appEl.querySelector('.app-body');
  if(appBody)appBody.style.cssText='display:flex;flex:1;min-height:0;overflow:hidden;';
  var sbEl=document.getElementById('main-sidebar');
  if(sbEl)sbEl.style.cssText='display:flex;flex-direction:column;width:220px;min-width:220px;background:white;border-right:1px solid var(--border);overflow-y:auto;flex-shrink:0;';
  var mc=appEl.querySelector('.main-content');
  if(mc)mc.style.cssText='flex:1;overflow-y:auto;padding:22px;background:#f4f6f9;min-height:0;';

  // Topbar
  var ava2=document.getElementById('tb-ava-txt'); if(ava2)ava2.textContent=user.initials||user.name.slice(0,2).toUpperCase();
  var un2=document.getElementById('tb-uname-txt'); if(un2)un2.textContent=getRolDisplay(user.rol);
  var badge=document.getElementById('tb-rol-badge');
  if(badge){badge.textContent=user.rol+(user.tipologias?' ['+user.tipologias[0].slice(0,18)+']':'');
    badge.style.cssText='display:inline-block;background:'+(user.rol==='Operativo'?'rgba(253,126,20,.2)':'rgba(30,107,184,.2)')+';color:'+(user.rol==='Operativo'?'#fd7e14':'#1e6bb8')+';padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;';}

  // Mostrar sidebar correcto
  ['sb-IS','sb-Operativo','sb-Cliente'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='none';});
  var sbId='sb-'+user.rol;
  var sbDiv=document.getElementById(sbId); if(sbDiv)sbDiv.style.display='block';
  var sbNom=document.getElementById('sb-cl-nombre'); if(sbNom)sbNom.textContent=user.name;
  var sbOpSub=document.getElementById('sb-op-sub');
  if(sbOpSub)sbOpSub.textContent='ADMINISTRADOR DE RIESGOS';

  // Entidad - Solo pre-rellenar si el usuario tiene entidad, pero NO deshabilitar
  if(user.entidad){
    ['cf-entidad','cfg-cliente-sel'].forEach(function(id){var el=document.getElementById(id);if(el){el.value=user.entidad;}});
  }

  // Aplicar restricciones de rol (Evaluador en modo lectura, ocultar Logs/Usuarios, etc.)
  try{ applyRoleRestrictions(); }catch(e){ console.error('applyRoleRestrictions error:', e); }

  // Páginas
  appEl.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var initPgId = user.rol==='Operativo' ? 'pg-clasificacion' : (user.rol==='Cliente' ? 'pg-info-general' : 'pg-dashboard');
  var initPg=document.getElementById(initPgId); if(initPg)initPg.classList.add('active');
  var initialNavSelector = user.rol==='Cliente' ? '#'+sbId+' .nav-item[onclick*="'+initPgId+'"]' : '#'+sbId+' .nav-item';
  var firstNav=document.querySelector(initialNavSelector)||document.querySelector('#'+sbId+' .nav-item'); if(firstNav)firstNav.classList.add('active');

  setTimeout(function(){
    if(user.rol==='Operativo'){
      try{ window._lsLoad && window._lsLoad(); }catch(e){}
      try{
        var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
        if(Object.keys(_sv).length){ if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={}; Object.assign(TERCEROS_DB,_sv); }
      }catch(e){}
      try{fijarEntidadClasificacion();}catch(e){}
      try{ window.clsInitDash && window.clsInitDash(); }catch(e){console.error(e);}
      try{ window.clsRender && window.clsRender(); }catch(e){console.error(e);}
      try{ window._setClasifViewMode && window._setClasifViewMode('registro'); }catch(e){}
    }
    else{
      // El Evaluador inicia en Información General; cargarla aquí evita que
      // aparezca el placeholder hasta que el usuario navegue manualmente.
      if(user.rol==='Cliente'){
        try{ window.loadIGTercerosFull && window.loadIGTercerosFull(); }catch(e){}
      }
      try{updateDashboard();}catch(e){}
      try{animateProgress();}catch(e){}
    }
  },150);
  try{showToast('Bienvenido, '+user.name,'success',3000);}catch(e){}
  try{window.mostrarBotonBDFlotante();}catch(e){}
};

// Alias para compatibilidad con el código original
window.function_doLogin_stub = function(){ window.doLogin(); };

// ── GESTIÓN DE USUARIOS desde IS ────────────────────────────────
window.renderGestionUsuarios = function(){
  var pg=document.getElementById('pg-usuarios'); if(!pg)return;
  var todos=Object.entries(window.USERS);
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">'
    +'<div><h2 style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Gestión de Usuarios</h2>'
    +'<div style="font-size:12px;color:#6c757d;">Administra los 3 roles del sistema</div></div>'
    +'<button onclick="window.abrirNuevoUsuario()" style="padding:8px 18px;background:#1e6bb8;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">+ Nuevo Usuario</button></div>';

  // Info de roles
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;">';
  [
    {rol:'IS',       color:'#1a3a5c',bg:'#eff6ff', desc:'Solo instalación, usuarios, entidades, logs, reportes'},
    {rol:'ADMINISTRADOR DE RIESGOS',color:'#fd7e14',bg:'#fff3e0', desc:'Configura tipologías, aprueba, supervisa AC y Matriz'},
    {rol:'EVALUADOR',color:'#28a745',bg:'#f0fdf4', desc:'Diligencia tipologías habilitadas por el Evaluador'},
  ].forEach(function(r){
    var count=todos.filter(function(e){return e[1].rol===r.rol;}).length;
    h+='<div style="padding:12px 14px;background:'+r.bg+';border-radius:8px;border-left:4px solid '+r.color+';">'
      +'<div style="font-size:12px;font-weight:700;color:'+r.color+';">ROL: '+r.rol+' ('+count+')</div>'
      +'<div style="font-size:11px;color:#555;margin-top:4px;">'+r.desc+'</div></div>';
  });
  h+='</div>';

  // Tabla
  h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">'
    +'<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#1a3a5c;">'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:left;">Usuario</th>'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:left;">Nombre</th>'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:left;">Rol</th>'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:left;">Organización</th>'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:left;">Especialidad</th>'
    +'<th style="padding:10px 12px;color:white;font-size:11px;text-align:center;">Acciones</th>'
    +'</tr></thead><tbody>';

  var rolColors={'IS':'#1a3a5c','ADMINISTRADOR DE RIESGOS':'#fd7e14','Evaluador':'#28a745'};
  todos.forEach(function(entry, i){
    var uname=entry[0], usr=entry[1];
    h+='<tr style="border-bottom:1px solid #dee2e6;background:'+(i%2?'#f8f9fa':'white')+'">'
      +'<td style="padding:9px 12px;font-weight:700;font-size:13px;color:#1a3a5c;">'+uname+'</td>'
      +'<td style="padding:9px 12px;font-size:12px;">'+usr.name+'</td>'
      +'<td style="padding:9px 12px;"><span style="padding:2px 10px;background:'+rolColors[usr.rol]+';color:white;border-radius:10px;font-size:11px;font-weight:700;">'+usr.rol+'</span></td>'
      +'<td style="padding:9px 12px;font-size:11.5px;color:#6c757d;">'+(usr.entidad||'—')+'</td>'
      +'<td style="padding:9px 12px;font-size:11px;color:#6c757d;">'+(usr.tipologias?usr.tipologias[0].slice(0,25):'Todas')+'</td>'
      +'<td style="padding:9px 12px;text-align:center;">'
      +'<button onclick="window.editarUsuario(\''+uname+'\')" style="padding:3px 10px;background:#eff6ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:4px;font-size:11px;cursor:pointer;margin-right:4px;">Editar</button>'
      +(uname!=='iseguras2026'?'<button onclick="window.eliminarUsuario(\''+uname+'\')" style="padding:3px 10px;background:#fef2f2;color:#dc3545;border:1px solid #fca5a5;border-radius:4px;font-size:11px;cursor:pointer;">Borrar</button>':'')
      +'</td></tr>';
  });
  h+='</tbody></table></div>';

  // Modal nuevo usuario (inline)
  h+='<div id="modal-nuevo-usuario" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:none;align-items:center;justify-content:center;">'
    +'<div style="background:white;border-radius:12px;padding:24px;width:500px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,.3);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
    +'<div style="font-size:15px;font-weight:800;color:#1a3a5c;" id="mnu-titulo">+ Nuevo Usuario</div>'
    +'<button onclick="document.getElementById(\'modal-nuevo-usuario\').style.display=\'none\'" style="background:none;border:none;font-size:20px;cursor:pointer;color:#aaa;">✕</button></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'
    +'<div><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Usuario (login) *</label><input id="mnu-user" type="text" placeholder="ej: cliente_empresa" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;font-family:inherit;"></div>'
    +'<div><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Contraseña *</label><input id="mnu-pass" type="text" placeholder="contraseña segura" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;font-family:inherit;"></div>'
    +'<div style="grid-column:1/-1;"><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Nombre completo *</label><input id="mnu-name" type="text" placeholder="Nombre del usuario" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;font-family:inherit;"></div>'
    +'<div><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Rol *</label><select id="mnu-rol" onchange="window.mnuActualizarRol()" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;"><option value="Cliente">ROL 3 — Cliente</option><option value="Operativo">ROL 2 — Operativo</option><option value="IS">ROL 1 — IS (Admin)</option></select></div>'
    +'<div><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Organización</label><input id="mnu-entidad" type="text" placeholder="ej: cliente1" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;font-family:inherit;"></div>'
    +'<div id="mnu-tip-wrap" style="grid-column:1/-1;display:none;"><label style="font-size:11px;font-weight:700;color:#333;display:block;margin-bottom:4px;">Tipología especializada (opcional)</label><input id="mnu-tip" type="text" placeholder="Dejar vacío = acceso a todas" style="width:100%;padding:8px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;font-family:inherit;"></div>'
    +'</div>'
    +'<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px;">'
    +'<button onclick="document.getElementById(\'modal-nuevo-usuario\').style.display=\'none\'" style="padding:8px 18px;background:white;border:1px solid #dee2e6;border-radius:6px;font-size:13px;cursor:pointer;">Cancelar</button>'
    +'<button onclick="window.guardarNuevoUsuario()" style="padding:8px 20px;background:#1e6bb8;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">Guardar Usuario</button>'
    +'</div></div></div>';

  pg.innerHTML=h;
};

window.mnuActualizarRol = function(){
  var rol=(document.getElementById('mnu-rol')||{}).value;
  var tw=document.getElementById('mnu-tip-wrap');
  if(tw)tw.style.display=(rol==='Operativo'?'block':'none');
};
window.abrirNuevoUsuario = function(){
  var m=document.getElementById('modal-nuevo-usuario');
  if(m){m.style.display='flex';}
};
window.guardarNuevoUsuario = function(){
  var uname=(document.getElementById('mnu-user').value||'').trim().toLowerCase();
  var pass=(document.getElementById('mnu-pass').value||'').trim();
  var name=(document.getElementById('mnu-name').value||'').trim();
  var rol=(document.getElementById('mnu-rol').value||'Cliente');
  var entidad=(document.getElementById('mnu-entidad').value||'').trim()||null;
  var tip=(document.getElementById('mnu-tip').value||'').trim();
  if(!uname||!pass||!name){try{showToast('Completa los campos obligatorios','error',3000);}catch(e){}return;}
  if(window.USERS[uname]){try{showToast('El usuario "'+uname+'" ya existe','error',3000);}catch(e){}return;}
  var newUser={pass:pass,name:name,rol:rol,initials:name.split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2),entidad:entidad,tipologias:tip?[tip]:null};
  window.USERS[uname]=newUser;
  if(!window.USERS_EXTRA)window.USERS_EXTRA={};
  window.USERS_EXTRA[uname]=newUser;
  window._lsSave();
  var m=document.getElementById('modal-nuevo-usuario'); if(m)m.style.display='none';
  renderGestionUsuarios();
  try{showToast('Usuario "'+uname+'" creado — Rol: '+rol,'success',3000);}catch(e){}
};
window.eliminarUsuario = function(uname){
  if(!confirm('¿Eliminar usuario "'+uname+'"?'))return;
  delete window.USERS[uname];
  if(window.USERS_EXTRA)delete window.USERS_EXTRA[uname];
  window._lsSave();
  renderGestionUsuarios();
  try{showToast('Usuario "'+uname+'" eliminado','success',2000);}catch(e){}
};
window.editarUsuario = function(uname){
  var usr=window.USERS[uname]; if(!usr)return;
  var m=document.getElementById('modal-nuevo-usuario'); if(!m){renderGestionUsuarios();m=document.getElementById('modal-nuevo-usuario');}
  var t=document.getElementById('mnu-titulo'); if(t)t.textContent='Editar: '+uname;
  var fu=document.getElementById('mnu-user'); if(fu){fu.value=uname;fu.disabled=true;}
  var fp=document.getElementById('mnu-pass'); if(fp)fp.value=usr.pass;
  var fn=document.getElementById('mnu-name'); if(fn)fn.value=usr.name;
  var fr=document.getElementById('mnu-rol'); if(fr)fr.value=usr.rol;
  var fe=document.getElementById('mnu-entidad'); if(fe)fe.value=usr.entidad||'';
  var ftip=document.getElementById('mnu-tip'); if(ftip)ftip.value=usr.tipologias?usr.tipologias[0]:'';
  window.mnuActualizarRol();
  if(m)m.style.display='flex';
  var btn=m&&m.querySelector('button[onclick*="guardarNuevo"]');
  if(btn){btn.onclick=function(){
    var p2=(document.getElementById('mnu-pass').value||'').trim();
    var n2=(document.getElementById('mnu-name').value||'').trim();
    var r2=(document.getElementById('mnu-rol').value||'Cliente');
    var e2=(document.getElementById('mnu-entidad').value||'').trim()||null;
    var t2=(document.getElementById('mnu-tip').value||'').trim();
    if(!p2||!n2){try{showToast('Completa los campos','error',2000);}catch(ex){}return;}
    window.USERS[uname].pass=p2; window.USERS[uname].name=n2; window.USERS[uname].rol=r2;
    window.USERS[uname].entidad=e2; window.USERS[uname].tipologias=t2?[t2]:null;
    if(window.USERS_EXTRA&&window.USERS_EXTRA[uname])window.USERS_EXTRA[uname]=window.USERS[uname];
    window._lsSave();
    m.style.display='none';
    document.getElementById('mnu-user').disabled=false;
    renderGestionUsuarios();
    try{showToast('Usuario "'+uname+'" actualizado','success',2000);}catch(ex){}
  };}
};

// ── TIPOLOGÍAS desde DB ─────────────────────────────────────────
window.getDBTips = function(ent){
  ent=ent||getEntidad();
  var db; try{db=window.TIPOLOGIAS_DB;}catch(e){} if(!db)try{db=TIPOLOGIAS_DB;}catch(e){} if(!db||typeof db!=='object')db={};
  var base=db[ent]||db['default']||db['cliente1'];
  if(!base){var vals=Object.values(db);base=vals.length?vals[0]:[];}
  if(!Array.isArray(base))base=[];
  // Leer config de la entidad propia; si no tiene, usar la config compartida del Admin
  var customProp = (window.TIPOLOGIAS_DB_CUSTOM||{})[ent]||{};
  var customAdmin= (window.TIPOLOGIAS_DB_CUSTOM||{})['_admin_config']||{};
  // Combinar: la config propia tiene prioridad, luego la del Admin
  var custom = Object.assign({}, customAdmin, customProp);
  var result=base.map(function(t){
    var over=custom[String(t.id_tipologia)]||{};
    var merged=Object.assign({},t,over);
    merged.preguntas=(over.preguntas&&over.preguntas.length>0)?over.preguntas:(t.preguntas||[]);
    return merged;
  });
  // Also load custom tipologías created by the user (from renderTipOp "Nueva tipología")
  try{
    var tipCustomStore=JSON.parse(localStorage.getItem('tip_custom_'+ent)||'{}');
    Object.values(tipCustomStore).forEach(function(ct){
      if(!result.find(function(r){return String(r.id_tipologia)===String(ct.id_tipologia);})){
        result.push(Object.assign({_custom:true,preguntas:[]},ct));
      }
    });
  }catch(e){}
  return result;
};
window.getTip=function(tipId,ent){return getDBTips(ent).find(function(t){return String(t.id_tipologia)===String(tipId);});};

// ── Bridge: convierte los controles configurados por el Admin (via getDBTips)
// al formato que espera el cuestionario del Evaluador (CUESTIONARIO_CONTROLES).
// Esto hace que si el Admin quita/agrega/reordena controles en "Controles AC",
// el Evaluador los vea reflejados automáticamente al recargar la página.
window._getControlesConf = function(key){
  try{
    // Alias de claves legadas (configs guardadas antes de unificar claves)
    var ALIAS = {'fc':'fr','rf':'fi','pais':'pa'};
    var k = String(key||'').toLowerCase(); k = ALIAS[k]||k;
    var tips = window.getDBTips ? window.getDBTips(window.getEntidad ? window.getEntidad() : null) : [];
    var tip = tips.find(function(t){ var c=String(t.clave||'').toLowerCase(); return c===k || (ALIAS[c]||c)===k; });
    if(tip && Array.isArray(tip.preguntas) && tip.preguntas.length > 0){
      // Solo devolver controles activos, conservando su número original
      // (numeración ESTABLE: si el Admin desactiva el control 3, los demás
      // conservan su n y las respuestas ya guardadas no se desalinean)
      var activos = [];
      tip.preguntas.forEach(function(p, idx){
        if(p.activo === false) return;
        activos.push({
          n: idx+1,
          id_pregunta: p.id_pregunta,
          ctrl: p.control || p.nombre_control || ('Control '+(idx+1)),
          nombre_control: p.control || p.nombre_control || ('Control '+(idx+1)),
          req:  p.texto || p.pregunta || '',
          doc:  p.evidencia || p.doc || ''
        });
      });
      if(activos.length > 0) return activos;
    }
  }catch(e){ console.warn('_getControlesConf:', e); }
  // Fallback: catálogo base estático
  return (window.CUESTIONARIO_CONTROLES || {})[key] || [];
};
// ── LISTA CANÓNICA DE CONTROLES por tercero + tipología ────────
// Combina: (1) configuración global del Admin (pantalla Controles AC),
// (2) controles ocultados para un tercero o globalmente (panel Personalizar),
// (3) controles personalizados agregados (por tercero y globales).
// TODAS las vistas del cuestionario (render, badges, progreso, CSV, reportes)
// usan esta función, así el total mostrado y el progreso SIEMPRE coinciden
// y al responder todos los controles el avance llega al 100%.
window._ctrlsCuest = function(nit, key, contrato){
  var base = window._getControlesConf ? window._getControlesConf(key) : ((window.CUESTIONARIO_CONTROLES||{})[key]||[]);
  var res = base.map(function(c){ return Object.assign({}, c); });
  // (2) Ocultos para este tercero o para todos (panel "Personalizar cuestionario")
  // Si viene un contrato, además se aplican los ocultos POR contrato.
  try{
    var ph = window._persHiddenControls || {};
    var offs = [].concat(ph[nit+'_'+key]||[], ph['__global___'+key]||[]);
    if(contrato){
      offs = offs.concat(ph[nit+'_'+contrato+'_'+key]||[]);
    }
    if(offs.length) res = res.filter(function(c){ return offs.indexOf(c.n) === -1; });
  }catch(e){}
  // (3) Controles personalizados: del tercero y globales
  var cc = window.CUEST_CTRL_CUSTOM || {};
  var customs = [].concat((cc[nit]&&cc[nit][key])||[], (cc['__global__']&&cc['__global__'][key])||[]);
  // Custom por contrato (si aplica): CUEST_CTRL_CUSTOM[nit+'|'+contrato][key]
  if(contrato){
    var ncKey = nit+'|'+contrato;
    if(cc[ncKey] && cc[ncKey][key]) customs = customs.concat(cc[ncKey][key]);
  }
  var maxN = res.reduce(function(m,c){ return Math.max(m, c.n||0); }, base.length);
  customs.forEach(function(c){
    var n = c.n;
    if(!n || res.some(function(x){ return x.n === n; })){ maxN++; n = maxN; }
    else if(n > maxN){ maxN = n; }
    res.push(Object.assign({}, c, {n: n, esCustom: true}));
  });
  return res;
};
window.saveTipCustom=function(tipId,changes){
  var ent=getEntidad();
  if(!window.TIPOLOGIAS_DB_CUSTOM)window.TIPOLOGIAS_DB_CUSTOM={};
  // Guardar en la entidad propia del Admin
  if(!window.TIPOLOGIAS_DB_CUSTOM[ent])window.TIPOLOGIAS_DB_CUSTOM[ent]={};
  window.TIPOLOGIAS_DB_CUSTOM[ent][tipId]=Object.assign(window.TIPOLOGIAS_DB_CUSTOM[ent][tipId]||{},changes);
  // Guardar también en clave compartida para que el Evaluador (otra entidad) lo vea
  if(!window.TIPOLOGIAS_DB_CUSTOM['_admin_config'])window.TIPOLOGIAS_DB_CUSTOM['_admin_config']={};
  window.TIPOLOGIAS_DB_CUSTOM['_admin_config'][tipId]=Object.assign(window.TIPOLOGIAS_DB_CUSTOM['_admin_config'][tipId]||{},changes);
  window._lsSave();
};
window.getTipsTercero=function(nit){
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var t=db[nit]; if(!t||!t.dims||!t.dims.length)return[];
  return t.dims.map(function(d){return window._nombreTipologia(d);}).filter(Boolean);
};

// ── ALERTAS CAMPOS OBLIGATORIOS ─────────────────────────────────
window.alertaCampos = function(camposIds, mensaje){
  var faltantes=[];
  camposIds.forEach(function(id){
    var el=document.getElementById(id); if(!el)return;
    if(!(el.value||'').trim()){
      faltantes.push(el.placeholder||id);
      el.style.borderColor='#dc3545'; el.style.background='#fef2f2';
      el.addEventListener('input',function(){el.style.borderColor='';el.style.background='';},{once:true});
    }
  });
  if(faltantes.length>0){
    try{showToast(mensaje||('Faltan campos: '+faltantes.slice(0,3).join(', ')),'error',4000);}catch(e){}
    return false;
  }
  return true;
};

// ── ALERTA AC NO PUEDE CONTINUAR ────────────────────────────────
window.acAlertaNoContinuar = function(){
  var panel=document.getElementById('cq-panel-cuest'); if(!panel)return false;
  var sel=document.getElementById('q-tercero'); if(!sel||!sel.value){
    try{showToast('Selecciona un tercero para evaluar','error',3000);}catch(e){} return false;
  }
  var selects=panel.querySelectorAll('select');
  var vacios=0;
  selects.forEach(function(s){if((!s.value||s.value==='0')&&s.closest('[style*="none"]')===null){vacios++;s.style.borderColor='#dc3545';}});
  if(vacios>0){
    try{showToast('No puedes continuar hasta diligenciar todos los controles ('+vacios+' pendientes)','error',4000);}catch(e){}
    return false;
  }
  return true;
};

// Override guardar cuestionario para incluir alerta
(function(){
  var _orig=window.guardarCuestionarioCompleto;
  window.guardarCuestionarioCompleto=function(){
    if(!window.acAlertaNoContinuar())return;
    if(_orig)_orig.apply(this,arguments);
    window._lsSave();
    try{showToast('✅ Cuestionario guardado — redirigiendo a Matriz de Riesgos...','success',3000);}catch(e){}
    // ── Navegar automáticamente a Matriz de Riesgos tras guardar ──
    setTimeout(function(){
      try{
        var navItem = document.querySelector('.nav-item[onclick*="pg-matriz"]');
        if(navItem){ navTo(navItem,'pg-matriz'); }
        else {
          // Fallback: mostrar banner de siguiente paso
          var banner = document.createElement('div');
          banner.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;background:#1a3a5c;color:white;padding:16px 28px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.3);font-size:14px;font-weight:700;display:flex;align-items:center;gap:14px;';
          var btnIr = document.createElement('button');
          btnIr.textContent = 'Ir a Análisis de Riesgos →';
          btnIr.style.cssText='padding:7px 18px;background:#28a745;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;';
          btnIr.onclick = function(){ var n=document.querySelector('.nav-item[onclick*=pg-matriz]'); if(n) navTo(n,'pg-matriz'); banner.remove(); };
          var btnX = document.createElement('button');
          btnX.textContent = '✕';
          btnX.style.cssText='background:rgba(255,255,255,.15);border:none;color:white;border-radius:50%;width:26px;height:26px;cursor:pointer;font-size:14px;';
          btnX.onclick = function(){ banner.remove(); };
          var txt = document.createElement('span');
          txt.innerHTML = '✅ Cuestionario completado &nbsp;→&nbsp;';
          banner.appendChild(txt);
          banner.appendChild(btnIr);
          banner.appendChild(btnX);
          document.body.appendChild(banner);
          setTimeout(function(){if(banner.parentElement)banner.remove();},8000);
        }
      }catch(e){}
    },1200);
  };
})();

// ── SELECTOR TIPOLOGÍAS DEL CLIENTE (desde operativo) ───────────
window.refrescarSelectorTipCliente = function(){
  var sel=document.getElementById('cf-tip-selector'); if(!sel)return;
  var tips=getDBTips(getEntidad()).filter(function(t){return t.activo!==false;});
  sel.innerHTML='<option value="">— Elegir tipología —</option>';
  tips.forEach(function(t){
    var opt=document.createElement('option');
    opt.value=t.clave||String(t.id_tipologia);
    opt.textContent=t.nombre_tipologia;
    sel.appendChild(opt);
  });
};

// ── BLOQUEO AC POR ESPECIALISTA ─────────────────────────────────
window.poblarSelectorACTipologia = function(){
  var sel=document.getElementById('ac-tip-filtro'); if(!sel)return;
  sel.innerHTML='<option value="">-- Seleccionar tipología --</option>';

  // Prioridad 1: tercero seleccionado en instruc o q-tercero
  var instrucSel=document.getElementById('ac-tercero-instruc');
  var qSel=document.getElementById('q-tercero');
  var nit=(instrucSel&&instrucSel.value)?instrucSel.value:(qSel?qSel.value:'');
  // Keep q-tercero in sync
  if(qSel && nit && qSel.value!==nit) qSel.value=nit;

  var dimsFromTercero=[];
  if(nit){
    var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
    var t=db[nit];
    if(t&&t.dims&&t.dims.length){
      dimsFromTercero=t.dims.filter(function(d){return d.key;});
    } else {
      var pend=(window.tercerosPendientesCuestionario||[]).find(function(x){return x.nit===nit;});
      if(pend&&pend.tipologias&&pend.tipologias.length){
        dimsFromTercero=pend.tipologias;
      }
    }
  }

  if(dimsFromTercero.length){
    dimsFromTercero.forEach(function(d){
      var nom=window._nombreTipologia(d);
      if(!nom) return;
      var o=document.createElement('option');
      o.value=nom; o.textContent=nom;
      o.setAttribute('data-key',d.key||'');
      sel.appendChild(o);
    });
    var desc=document.getElementById('ac-consultor-desc');
    if(desc){
      desc.innerHTML='<span style="color:#28a745;font-weight:700;">✓ '+dimsFromTercero.length+' tipología'+(dimsFromTercero.length!==1?'s':'')+'</span> registradas para este tercero. Selecciona una para diligenciar.';
      desc.style.cssText='font-size:12px;padding:8px 12px;background:#f0fdf4;border:1px solid #86efac;border-radius:6px;margin-bottom:12px;';
    }
  } else {
    var filtro=getTipsFiltro?getTipsFiltro():null;
    var tips=getDBTips?getDBTips(getEntidad()).filter(function(t){return t.activo!==false;}):[]; 
    if(filtro&&typeof puedeVerTip==='function') tips=tips.filter(function(t){return puedeVerTip(t.nombre_tipologia);});
    tips.forEach(function(t){
      var o=document.createElement('option'); o.value=t.nombre_tipologia; o.textContent=t.nombre_tipologia; sel.appendChild(o);
    });
    if(filtro&&filtro.length===1&&sel.options.length===2){sel.value=sel.options[1].value;}
    var desc=document.getElementById('ac-consultor-desc');
    if(desc){
      desc.innerHTML=nit?'<span style="color:#fd7e14;">⚠ Este tercero no tiene tipologías asignadas aún.</span>':'Selecciona un tercero arriba para ver sus tipologías.';
      desc.style.cssText='font-size:12px;color:#6c757d;margin-bottom:12px;';
    }
  }
};
window.acIrADiligenciar=function(){
  var sel=document.getElementById('ac-tip-filtro');
  var tip=sel?sel.value:'';
  // Obtener key de la tipología seleccionada
  var tipKey='';
  if(sel && sel.selectedIndex>=0){
    tipKey=(sel.options[sel.selectedIndex]||{}).getAttribute?
           (sel.options[sel.selectedIndex].getAttribute('data-key')||''):'';
  }
  if(!tip){try{showToast('Selecciona una tipología primero','error',2000);}catch(e){}return;}

  // 1. Cambiar al tab de cuestionario
  try{switchCuestTabExtended('cuest');}catch(e){}

  setTimeout(function(){
    // 2. Autoseleccionar tercero si no hay ninguno elegido
    var qSel=document.getElementById('q-tercero');
    var needsLoad=false;
    if(qSel && !qSel.value && qSel.options.length>1){
      qSel.value=qSel.options[1].value;
      needsLoad=true;
    }
    if(needsLoad){
      try{cargarCuestionarioTercero();}catch(e){}
    }

    // 3. Repoblar selector de tipologías con las del tercero seleccionado
    try{window.poblarSelectorACTipologia();}catch(e){}

    // 4. Esperar render y filtrar
    setTimeout(function(){
      var wrap=document.getElementById('q-secciones-wrap');
      if(!wrap) return;
      if(!wrap.innerHTML.trim() && qSel && qSel.value){
        try{cargarCuestionarioTercero();}catch(e){}
        setTimeout(function(){window._filtrarSeccionesPorTip(tip, tipKey);},600);
        return;
      }
      if(!wrap.innerHTML.trim()){
        try{showToast('Primero registra y clasifica un tercero (promedio ≥ 3)','error',3500);}catch(e){}
        return;
      }
      window._filtrarSeccionesPorTip(tip, tipKey);
    },450);
  },200);
};

window._filtrarSeccionesPorTip=function(tip, tipKey){
  var wrap=document.getElementById('q-secciones-wrap');
  if(!wrap||(!tip&&!tipKey)) return;
  var cards=wrap.querySelectorAll('.card');
  if(!cards.length){
    try{showToast('No hay preguntas cargadas. Selecciona un tercero.','error',2500);}catch(e){}
    return;
  }
  var tipLow=(tip||'').toLowerCase();
  var keyLow=(tipKey||'').toLowerCase();
  // La clave es lo más confiable: los ids de las cards son "acc-v3-<clave>"
  // (op, cn, si, cu, fr, laft, pa, fi). Filtramos DURO por esa clave.
  var encontrado=false;
  cards.forEach(function(card){
    var cardKey=(card.getAttribute('data-tipkey')||'').toLowerCase();
    var dataNom=(card.getAttribute('data-tipnom')||'').toLowerCase();
    var innerAcc=card.querySelector('[id^="acc-v3-"]');
    var accId=(innerAcc?innerAcc.id:'').toLowerCase();
    var match=false;
    if(keyLow && cardKey){ match = cardKey===keyLow; }
    if(!match && keyLow && accId){ match = accId==='acc-v3-'+keyLow; }
    if(!match && tipLow && dataNom){
      match = dataNom.indexOf(tipLow.substring(0,10))>=0;
    }
    card.style.display = match ? '' : 'none';
    if(match) encontrado=true;
  });
  if(!encontrado){
    cards.forEach(function(c){c.style.display='';});
    try{showToast('Mostrando todas las secciones','info',2000);}catch(e){}
  } else {
    try{showToast('Mostrando: '+(tip||keyLow),'success',1600);}catch(e){}
  }
  try{wrap.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
};

// ── ONEDRIVE REPOSITORIO ─────────────────────────────────────────
var _OD='od_sgrt_v8',_odFS=null,_odPath=[],_OD_MAX=20;
window.odInit=function(){
  try{var s=localStorage.getItem(_OD);_odFS=s?JSON.parse(s):null;}catch(e){_odFS=null;}
  if(!_odFS)_odFS={id:'root',type:'folder',children:[
    {id:'f_ac',   name:'Ambiente de Control',     type:'folder',children:[]},
    {id:'f_mat',  name:'Matrices de Riesgo',       type:'folder',children:[]},
    {id:'f_cont', name:'Contratos y Soportes',     type:'folder',children:[]},
    {id:'f_ev',   name:'Evidencias de Controles',  type:'folder',children:[]},
    {id:'f_inf',  name:'Informes y Reportes',      type:'folder',children:[]},
  ]};
  _odPath=[];
  window.odRender();
};
window.odSave=function(){
  try{var data=JSON.stringify(_odFS);localStorage.setItem(_OD,data);var kb=Math.round(data.length/1024);var lbl=document.getElementById('od-uso-lbl');if(lbl)lbl.textContent='Usando: '+(kb>1024?(kb/1024).toFixed(1)+'MB':kb+'KB')+' / ~5MB';}catch(e){try{showToast('Almacenamiento lleno','error',3000);}catch(e2){}}
};
window.odCF=function(){var n=_odFS;_odPath.forEach(function(s){n=(n.children||[]).find(function(c){return c.id===s.id;})||n;});return n;};
window.odRender=function(){
  var f=odCF(),grid=document.getElementById('od-grid'),bc=document.getElementById('od-bc');
  if(!grid||!bc)return;
  try{var s=localStorage.getItem(_OD)||'{}';var kb=Math.round(s.length/1024);var lbl=document.getElementById('od-uso-lbl');if(lbl)lbl.textContent='Usando: '+(kb>1024?(kb/1024).toFixed(1)+'MB':kb+'KB')+' / ~5MB';}catch(e){}
  var b='<span onclick="window.odNav(-1)" style="cursor:pointer;color:#1e6bb8;font-weight:700;padding:3px 8px;border-radius:4px;background:#eff6ff;">🏠 Inicio</span>';
  _odPath.forEach(function(s,i){b+=' <span style="color:#aaa;">/</span> <span onclick="window.odNav('+i+')" style="cursor:pointer;color:#1e6bb8;padding:3px 8px;border-radius:4px;background:#eff6ff;">'+s.name+'</span>';});
  bc.innerHTML=b;
  var kids=f.children||[];
  if(!kids.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:#aaa;border:2px dashed #dee2e6;border-radius:8px;"><div style="font-size:36px;">📂</div><div style="font-size:14px;font-weight:600;margin-top:8px;">Carpeta vacía</div><div style="font-size:12px;margin-top:4px;">Arrastra archivos aquí</div></div>';return;}
  var icoMap={pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📑',pptx:'📑',png:'🖼️',jpg:'🖼️',jpeg:'🖼️',gif:'🖼️',mp4:'🎬',zip:'🗜️',txt:'📃'};
  if(!window._odSel)window._odSel=new Set();
  grid.innerHTML=kids.map(function(item){
    var isF=item.type==='folder';
    var ext=(item.name||'').split('.').pop().toLowerCase();
    var ico=isF?'📁':(icoMap[ext]||'📎');
    var sel=window._odSel.has(item.id);
    var h='<div style="background:'+(sel?'#eff6ff':'white')+';border:2px solid '+(sel?'#1e6bb8':'#dee2e6')+';border-radius:10px;padding:10px 8px 8px;text-align:center;position:relative;">';
    h+='<input type="checkbox" '+(sel?'checked':'')+' onclick="event.stopPropagation();window.odTogSel(\''+item.id+'\')" style="position:absolute;top:6px;left:6px;cursor:pointer;width:14px;height:14px;">';
    // 3-dot menu button
    h+='<div style="position:absolute;top:5px;right:5px;" onclick="event.stopPropagation();">';
    h+='<button onclick="window._odMenu(this,\''+item.id+'\',\''+item.type+'\')" style="width:24px;height:24px;background:rgba(0,0,0,.06);border:none;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;padding:0;font-family:inherit;" title="Opciones">⋯</button>';
    h+='</div>';
    var clickAc=isF?'window._odPath.push({id:\''+item.id+'\',name:\''+item.name.replace(/\\/g,'\\\\').replace(/'/g,'\\\'')+'\'});window.odRender();':'window.odDescargar(\''+item.id+'\')';
    h+='<div onclick="'+clickAc+'" style="cursor:pointer;">';
    h+='<div style="font-size:30px;margin-bottom:5px;">'+ico+'</div>';
    h+='<div style="font-size:11px;font-weight:600;word-break:break-all;line-height:1.3;color:#374151;">'+item.name+'</div>';
    if(item.size)h+='<div style="font-size:10px;color:#aaa;margin-top:2px;">'+Math.round(item.size/1024)+'KB</div>';
    if(item.fecha)h+='<div style="font-size:9px;color:#aaa;">'+item.fecha+'</div>';
    h+='</div>';
    h+='</div>';
    return h;
  }).join('');
};
window.odTogSel=function(id){
  if(!window._odSel)window._odSel=new Set();
  if(window._odSel.has(id))window._odSel.delete(id);else window._odSel.add(id);
  var lbl=document.getElementById('od-sel-lbl');if(lbl)lbl.textContent=window._odSel.size>0?window._odSel.size+' sel.':'';
  window.odRender();
};
window.odSelTodo=function(){
  if(!window._odSel)window._odSel=new Set();
  (odCF().children||[]).forEach(function(it){window._odSel.add(it.id);});
  var lbl=document.getElementById('od-sel-lbl');if(lbl)lbl.textContent=window._odSel.size+' sel.';
  window.odRender();
};
window.odDlSel=function(){
  if(!window._odSel||!window._odSel.size){try{showToast('Selecciona archivos primero','error',2000);}catch(e){}return;}
  var files=(odCF().children||[]).filter(function(it){return window._odSel.has(it.id)&&it.type==='file';});
  if(!files.length){try{showToast('Solo se descargan archivos, no carpetas','error',2000);}catch(e){}return;}
  files.forEach(function(fi){if(fi.dataURL){var a=document.createElement('a');a.href=fi.dataURL;a.download=fi.name;a.click();}});
  try{showToast('Descargando '+files.length+' archivo(s)','success',2500);}catch(e){}
};
window.odDelSel=function(){
  if(!window._odSel||!window._odSel.size){try{showToast('Selecciona ítems primero','error',2000);}catch(e){}return;}
  if(!confirm('¿Eliminar '+window._odSel.size+' ítem(s)?'))return;
  var ids=window._odSel;
  function quitarDe(n){if(!n.children)return;n.children=n.children.filter(function(ch){if(ids.has(ch.id))return false;quitarDe(ch);return true;});}
  quitarDe(_odFS);window._odSel=new Set();
  var lbl=document.getElementById('od-sel-lbl');if(lbl)lbl.textContent='';
  window.odSave();window.odRender();try{showToast('Eliminado(s)','success',1500);}catch(e){}
};
window.odTab=function(tab){
  ['repo','terceros','informes'].forEach(function(t){
    var p=document.getElementById('od-panel-'+t),b=document.getElementById('od-tab-'+t);
    if(p)p.style.display=(t===tab?'block':'none');
    if(b){b.style.background=t===tab?'#1a3a5c':'#f1f3f5';b.style.color=t===tab?'white':'#495057';b.style.fontWeight=t===tab?'700':'600';}
  });
  if(tab==='terceros')window.odRenderTerceros();
  if(tab==='informes')window.odRenderInformes();
};
// ── INFORME WORD COMÚN: datos compartidos entre Evaluador y Administrador ──
function _odEsc(v){return String(v==null||v===''?'—':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function _odFecha(v){if(!v)return '—';var d=new Date(v);return isNaN(d.getTime())?String(v):d.toLocaleDateString('es-CO');}
function _odDb(){return window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};}
function _odGetTercero(nit){
  var db=_odDb(), t=Object.assign({},db[nit]||{}), yr=new Date().getFullYear().toString();
  var rowsRaw=(window.CLS_DB&&window.CLS_DB[yr])||[];
  var rows=Array.isArray(rowsRaw)?rowsRaw:Object.values(rowsRaw||{});
  var rec=rows.find(function(x){return String(x.nit)===String(nit);});
  if(rec) t=Object.assign({},rec,t);
  if(!t.nit)return null;
  return t;
}
function _odListaTerceros(){
  var byNit={},db=_odDb(),yr=new Date().getFullYear().toString();
  Object.values(db).forEach(function(t){if(t&&t.nit)byNit[String(t.nit)]=Object.assign({},t);});
  var clsRaw=(window.CLS_DB&&window.CLS_DB[yr])||[];
  (Array.isArray(clsRaw)?clsRaw:Object.values(clsRaw||{})).forEach(function(t){if(t&&t.nit)byNit[String(t.nit)]=Object.assign({},t,byNit[String(t.nit)]||{});});
  var list=Object.values(byNit),u=window.currentUser||{};
  if((u.rol==='Cliente'||u.rol==='evaluador')&&u.entidad){
    var ent=String(u.entidad).toLowerCase().replace(/\\s/g,'');
    list=list.filter(function(t){var te=String(t.entidad||'').toLowerCase().replace(/\\s/g,'');return !te||te===ent;});
  }
  return list.sort(function(a,b){return String(a.nombre||a.nit).localeCompare(String(b.nombre||b.nit));});
}
function _odRespuesta(r){if(!r)return 'Sin responder';var ks=['a1','a2','a3','a4','a5','a6'];var vals=ks.map(function(k){return r[k];}).filter(function(v){return v!==undefined&&v!==null&&v!=='';});return vals.length?vals.join(' / '):'Sin responder';}
function _odControlData(t){
  var total=0,respondidos=0,rows=[],dims=t.dims||[],respDb=window.CUEST_RESPUESTAS||{};
  if(t.contratoEval&&t.dimsPorContrato&&t.dimsPorContrato[t.contratoEval])dims=t.dimsPorContrato[t.contratoEval]||dims;
  dims.forEach(function(d){
    var ctrls=[];try{ctrls=window._ctrlsCuest?window._ctrlsCuest(t.nit,d.key,t.contratoEval):((window.CUESTIONARIO_CONTROLES||{})[d.key]||[]);}catch(e){ctrls=((window.CUESTIONARIO_CONTROLES||{})[d.key]||[]);}
    total+=ctrls.length;
    ctrls.forEach(function(c){
      var r=respDb[t.nit]&&respDb[t.nit][d.key]&&respDb[t.nit][d.key][c.n];
      var answered=!!(r&&['a1','a2','a3','a4','a5','a6'].some(function(k){return r[k]!==undefined&&r[k]!=='';}));
      if(answered)respondidos++;
      var val={pct:0,nivelCumpl:'—',valorMad:null,madurez:'—'};
      try{if(typeof _calcCtrlValoracion==='function')val=_calcCtrlValoracion(r||{});}catch(e){}
      rows.push({tip:(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key)),control:c.ctrl||c.req||('Control '+c.n),respuesta:_odRespuesta(r),pct:val.pct,valorMad:val.valorMad,madurez:val.madurez});
    });
  });
  return {total:total,respondidos:respondidos,pct:total?Math.round(respondidos/total*100):0,rows:rows};
}
function _odRiesgos(t){
  var arr=window.MATRIZ_DB||(typeof MATRIZ_DB!=='undefined'?MATRIZ_DB:[])||[];
  if(!Array.isArray(arr))arr=Object.values(arr);
  return arr.filter(function(r){return r&&(String(r.nit||'')===String(t.nit)||String(r.tercero||'')===String(t.nombre||''));});
}
function _odDocsTercero(nit){
  var out=[],target=String(nit),nombre=String((_odGetTercero(nit)||{}).nombre||'');
  function walk(n,owner){
    if(!n)return;
    var nextOwner=owner;
    // Las carpetas creadas desde Por Tercero usan el NIT como nombre; así
    // la asociación permanece aunque el archivo no tenga un campo tercero.
    if(n.type==='folder'&&String(n.name||'')===target)nextOwner=target;
    if(n.type==='file'&&(nextOwner===target||String(n.tercero||'')===target||String(n.tercero||'')===nombre))out.push(n);
    (n.children||[]).forEach(function(ch){walk(ch,nextOwner);});
  }
  try{walk(_odFS,'');}catch(e){}
  var inf=(window.INFORMES_DB&&window.INFORMES_DB[nit])||[];
  inf.forEach(function(x){out.push({name:x.name,size:x.size,fecha:x.fecha,_origen:'Informe adjunto'});});
  return out;
}

window.odRenderTerceros=function(){
  var cont=document.getElementById('od-terceros-grid');if(!cont)return;
  var list=_odListaTerceros();
  if(!list.length){cont.innerHTML='<div style="padding:40px;text-align:center;color:var(--muted);background:white;border-radius:10px;border:1px solid var(--border);">Sin terceros registrados en '+new Date().getFullYear()+'</div>';return;}
  cont.innerHTML=list.map(function(t){
    var p=parseFloat(t.prom||0),col=p>=4?'var(--red)':p>=3?'var(--orange)':'var(--green)';
    return '<div style="background:white;border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05);">'
      +'<div style="background:linear-gradient(135deg,#1a3a5c,#1e6bb8);padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">'
      +'<div style="color:white;font-weight:700;font-size:13px;">'+t.nombre+'</div>'
      +'<span style="background:rgba(255,255,255,.2);color:white;padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;">'+t.nit+'</span></div>'
      +'<div style="padding:12px 14px;">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11.5px;margin-bottom:10px;">'
      +'<div><span style="color:var(--muted);">Servicio:</span><br><b>'+(t.servicio||'-')+'</b></div>'
      +'<div><span style="color:var(--muted);">Supervisor:</span><br><b>'+(t.supervisor||'-')+'</b></div>'
      +'<div><span style="color:var(--muted);">Zona:</span><br><b style="color:'+col+';">'+(t.zona||'-')+'</b></div>'
      +'<div><span style="color:var(--muted);">Prom.:</span><br><b style="color:'+col+';">'+p.toFixed(2)+'</b></div>'
      +'<div><span style="color:var(--muted);">F.Inicio:</span><br><b>'+(t.finicio||'-')+'</b></div>'
      +'<div><span style="color:var(--muted);">F.Final:</span><br><b>'+(t.ffinal||'-')+'</b></div>'
      +'</div>'
      +'<div style="display:flex;gap:6px;border-top:1px solid var(--border);padding-top:9px;flex-wrap:wrap;">'
      +'<button onclick="odAbrirTercero(\''+t.nit+'\')" style="padding:5px 10px;background:#eff6ff;color:#1e6bb8;border:1px solid #bfdbfe;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">📁 Documentos</button>'
      +'<button onclick="odDlInforme(\''+t.nit+'\',\''+t.nombre.replace(/'/g,'')+'\')" style="padding:5px 10px;background:#f0fdf4;color:#166534;border:1px solid #a5d6a7;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;">⬇ Informe</button>'
      +'</div></div></div>';
  }).join('');
};
window.odAbrirTercero=function(nit){
  window.odTab('repo');
  if(!_odFS.children)_odFS.children=[];
  var car=_odFS.children.find(function(x){return x.name===nit&&x.type==='folder';});
  if(!car){car={id:'folder-'+nit,name:nit,type:'folder',children:[]};_odFS.children.push(car);window.odSave();}
  _odPath=[{id:car.id,name:car.name}];window.odRender();
};
window.odDlInforme=function(nit,nombre){
  var t=_odGetTercero(nit);
  if(!t){try{showToast('Tercero no encontrado','error',2000);}catch(e){}return;}
  var ahora=new Date(),p=parseFloat(t.prom||0),pTxt=isNaN(p)?'—':p.toFixed(2),risk=t.zona||t.nivel_riesgo||'—';
  var color=risk==='EXTREMO'||risk==='CRÍTICO'?'#c62828':risk==='ALTO'?'#e65100':'#2e7d32';
  var ac=_odControlData(t),riesgos=_odRiesgos(t),docs=_odDocsTercero(nit),dims=t.dims||[];
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe SGRT - '+_odEsc(t.nombre)+'</title>'
    +'<style>body{font-family:Calibri,Arial,sans-serif;margin:34px;color:#263238;line-height:1.45;}h1{color:#1a3a5c;border-bottom:3px solid #1e6bb8;padding-bottom:8px;margin-top:24px;font-size:22px;}h2{color:#2b5797;border-bottom:1px solid #9fbad0;padding-bottom:5px;margin-top:18px;font-size:16px;}h3{color:#1a3a5c;font-size:13px;margin:14px 0 6px;}table{width:100%;border-collapse:collapse;margin:10px 0 18px;font-size:10.5px;}th{background:#1a3a5c;color:white;padding:7px;text-align:left;border:1px solid #9fbad0;}td{padding:6px;border:1px solid #cfd8dc;vertical-align:top;}tr:nth-child(even){background:#f5f8fb;}.cover{text-align:center;padding:70px 0 90px;page-break-after:always;}.cover h1{border:0;font-size:30px;}.box{border-left:4px solid #1e6bb8;background:#eef5fb;padding:12px;margin:10px 0 16px;}.kpi{display:inline-block;border:1px solid #9fbad0;padding:10px 16px;margin:4px;text-align:center;min-width:110px;}.num{font-size:20px;font-weight:bold;color:#1a3a5c;}.muted{color:#607d8b;font-size:10px;}.phase{page-break-before:always;}.footer{border-top:1px solid #cfd8dc;margin-top:28px;padding-top:10px;color:#78909c;font-size:9px;text-align:center;}</style></head><body>'
    +'<div class="cover"><h1>INFORME DE RIESGOS DE TERCEROS</h1><p style="font-size:20px;font-weight:bold;color:#1a3a5c;">'+_odEsc(t.nombre)+'</p><p>NIT: <b>'+_odEsc(t.nit)+'</b></p><p>Generado automáticamente: '+_odFecha(ahora)+'</p><p class="muted">Datos compartidos entre Evaluador y Administrador de Riesgos</p></div>'
    +'<h1>Resumen ejecutivo</h1><div class="box"><p><b>Tercero:</b> '+_odEsc(t.nombre)+' &nbsp; <b>NIT:</b> '+_odEsc(t.nit)+'</p><p><b>Organización:</b> '+_odEsc(t.entidad||t.entidadLabel)+' &nbsp; <b>Estado:</b> '+_odEsc(t.estado)+'</p><p><b>Clasificación:</b> <span style="color:'+color+';font-weight:bold;">'+_odEsc(t.clasificacion||risk)+'</span> &nbsp; <b>Promedio:</b> '+pTxt+' / 5 &nbsp; <b>Zona:</b> '+_odEsc(risk)+'</p><p><b>Progreso Ambiente de Control:</b> '+ac.respondidos+'/'+ac.total+' ('+ac.pct+'%)</p></div>'
    +'<div class="kpi"><div class="num">'+dims.length+'</div><div class="muted">Tipologías asignadas</div></div><div class="kpi"><div class="num">'+ac.respondidos+'/'+ac.total+'</div><div class="muted">Controles respondidos</div></div><div class="kpi"><div class="num">'+riesgos.length+'</div><div class="muted">Riesgos registrados</div></div><div class="kpi"><div class="num">'+docs.length+'</div><div class="muted">Documentos/evidencias</div></div>'
    +'<h1 class="phase">Fase 1 — Registro y Clasificación</h1><h2>Información del tercero</h2><table><tr><th>Campo</th><th>Valor</th></tr><tr><td>Nombre</td><td>'+_odEsc(t.nombre)+'</td></tr><tr><td>NIT</td><td>'+_odEsc(t.nit)+'</td></tr><tr><td>Organización</td><td>'+_odEsc(t.entidad||t.entidadLabel)+'</td></tr><tr><td>Servicio</td><td>'+_odEsc(t.servicio)+'</td></tr><tr><td>Domicilio</td><td>'+_odEsc(t.domicilio)+'</td></tr><tr><td>Supervisor</td><td>'+_odEsc(t.supervisor)+'</td></tr><tr><td>Inicio / término</td><td>'+_odEsc(t.finicio||t.fini)+' / '+_odEsc(t.ffinal||t.ffin)+'</td></tr><tr><td>Estado</td><td>'+_odEsc(t.estado)+'</td></tr></table>'
    +'<h2>Clasificación y tipologías</h2><table><tr><th>Tipología</th><th>Puntaje</th><th>Clasificación</th></tr>'
    +(dims.length?dims.map(function(d){var v=parseFloat(d.val||d.calificacion||d.nivel||0);return '<tr><td>'+_odEsc(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.tipologia||d.key))+'</td><td>'+_odEsc(isNaN(v)?'—':v)+'</td><td>'+_odEsc(v>=4?'Crítico':v>=3?'Alto':v>=2?'Medio':'Bajo')+'</td></tr>';}).join(''):'<tr><td colspan="3">No hay tipologías asignadas.</td></tr>')+'</table>'
    +'<h1 class="phase">Fase 2 — Ambiente de Control</h1><p><b>Tipologías asignadas:</b> '+_odEsc(dims.map(function(d){return window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key);}).join(', '))+'</p><p><b>Progreso:</b> '+ac.respondidos+' de '+ac.total+' controles respondidos — <b>'+ac.pct+'%</b>.</p><table><tr><th>Tipología</th><th>Pregunta / control</th><th>Respuesta</th><th>Resultado</th><th>%</th></tr>'
    +(ac.rows.length?ac.rows.map(function(x){return '<tr><td>'+_odEsc(x.tip)+'</td><td>'+_odEsc(x.control)+'</td><td>'+_odEsc(x.respuesta)+'</td><td>'+_odEsc(x.madurez)+'</td><td>'+_odEsc(x.pct)+'%</td></tr>';}).join(''):'<tr><td colspan="5">No hay preguntas asignadas o configuradas para este tercero.</td></tr>')+'</table>'
    +'<h1 class="phase">Fase 3 — Análisis de Riesgos</h1><p>Resultados tomados de la matriz compartida del sistema.</p><table><tr><th>Riesgo / factor</th><th>Prob. inherente</th><th>Impacto</th><th>Riesgo inherente</th><th>Control</th><th>Prob. residual</th><th>Impacto residual</th><th>Riesgo residual</th></tr>'
    +(riesgos.length?riesgos.map(function(r){return '<tr><td>'+_odEsc(r.tipo||r.factor||r.desc)+'</td><td>'+_odEsc(r.probInh)+'</td><td>'+_odEsc(r.impInh)+'</td><td>'+_odEsc(r.zonaInh)+'</td><td>'+_odEsc(r.control)+'</td><td>'+_odEsc(r.probRes)+'</td><td>'+_odEsc(r.impRes)+'</td><td>'+_odEsc(r.zonaRes)+'</td></tr>';}).join(''):'<tr><td colspan="8">No hay riesgos registrados para este tercero.</td></tr>')+'</table>'
    +'<h1 class="phase">Fase 4 — Seguimiento</h1><table><tr><th>Riesgo</th><th>Responsable</th><th>Plan de acción</th><th>Estado</th><th>Fecha de seguimiento</th><th>Alerta / observación</th></tr>'
    +(riesgos.length?riesgos.map(function(r){return '<tr><td>'+_odEsc(r.tipo||r.factor||r.desc)+'</td><td>'+_odEsc(r.resp||r.responsable)+'</td><td>'+_odEsc(r.plan||r.tratamiento)+'</td><td>'+_odEsc(r.estado)+'</td><td>'+_odFecha(r.fechaSeg)+'</td><td>'+_odEsc(r.descSeg||r.observaciones)+'</td></tr>';}).join(''):'<tr><td colspan="6">No hay acciones de seguimiento registradas.</td></tr>')+'</table>'
    +'<h1 class="phase">Fase 5 — Documentación / Evidencias</h1><p>Archivos vinculados al tercero en el repositorio compartido y en los informes adjuntos.</p><table><tr><th>Documento</th><th>Origen</th><th>Fecha</th><th>Tamaño</th></tr>'
    +(docs.length?docs.map(function(d){return '<tr><td>'+_odEsc(d.name)+'</td><td>'+_odEsc(d._origen||'Repositorio de Evidencias')+'</td><td>'+_odFecha(d.fecha)+'</td><td>'+_odEsc(d.size?((d.size/1024).toFixed(1)+' KB'):'—')+'</td></tr>';}).join(''):'<tr><td colspan="4">No hay documentos o evidencias asociadas.</td></tr>')+'</table>'
    +'<div class="footer">Informe generado automáticamente por SGRT · Usuario actual: '+_odEsc((window.currentUser||{}).name||'Sistema')+' · '+_odFecha(ahora)+' '+ahora.toLocaleTimeString('es-CO')+'</div></body></html>';
  var b=new Blob(['\\ufeff',html],{type:'application/msword'}),a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='Informe_'+String(t.nombre||nombre||nit).replace(/[^a-z0-9áéíóúñü]+/gi,'_')+'_'+nit+'.doc';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  try{showToast('✅ Informe Word generado con las 5 fases','success',3000);}catch(e){}
};
window.odRenderInformes=function(){
  var cont=document.getElementById('od-informes-tabla');if(!cont)return;
  var list=_odListaTerceros();
  if(!list.length){cont.innerHTML='<div style="padding:30px;text-align:center;color:var(--muted);">Sin registros aún.</div>';return;}
  cont.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:12.5px;">'
    +'<thead><tr style="background:#f8f9fa;">'
    +'<th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);color:#1a3a5c;">Tercero</th><th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);color:#1a3a5c;">NIT</th><th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);color:#1a3a5c;">Zona</th><th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);color:#1a3a5c;">Prom.</th><th style="padding:10px 12px;text-align:left;border-bottom:2px solid var(--border);color:#1a3a5c;">Estado</th><th style="padding:10px 12px;text-align:center;border-bottom:2px solid var(--border);color:#1a3a5c;">Acciones</th>'
    +'</tr></thead><tbody>'+list.map(function(t,i){var p=parseFloat(t.prom||0),col=p>=4?'var(--red)':p>=3?'var(--orange)':'var(--green)';return '<tr style="border-bottom:1px solid var(--border);background:'+(i%2?'#fafafa':'white')+';"><td style="padding:9px 12px;font-weight:600;">'+_odEsc(t.nombre)+'</td><td style="padding:9px 12px;color:var(--muted);">'+_odEsc(t.nit)+'</td><td style="padding:9px 12px;"><b style="color:'+col+';">'+_odEsc(t.zona||t.nivel_riesgo)+'</b></td><td style="padding:9px 12px;"><b style="color:'+col+';">'+(isNaN(p)?'—':p.toFixed(2))+'</b></td><td style="padding:9px 12px;">'+_odEsc(t.estado)+'</td><td style="padding:9px 12px;text-align:center;display:flex;gap:5px;justify-content:center;flex-wrap:wrap;"><button onclick="odAbrirTercero(\''+String(t.nit).replace(/'/g,'')+'\')" style="padding:4px 9px;background:#eff6ff;color:#1e6bb8;border:1px solid #bfdbfe;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;">📁</button><button onclick="odDlInforme(\''+String(t.nit).replace(/'/g,'')+'\',\''+String(t.nombre||'').replace(/'/g,'')+'\')" style="padding:4px 9px;background:#1a3a5c;color:white;border:none;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;">⬇ Word</button></td></tr>';}).join('')+'</tbody></table>';
  try{window.odRenderReportesFases();}catch(e){console.warn('odRenderReportesFases:',e);}
};
window.odRenderReportesFases=function(){
  var cont=document.getElementById('od-reportes-fases');if(!cont)return;
  var list=_odListaTerceros();
  if(!list.length){cont.innerHTML='';return;}
  function td(v){return '<td style="padding:6px 8px;border:1px solid #dbe4ee;vertical-align:top;">'+_odEsc(v)+'</td>';}
  function fase(t,titulo,contenido,abierta){return '<details '+(abierta?'open ':'')+'style="border:1px solid #dbe4ee;border-radius:8px;margin:8px 0;background:white;overflow:hidden;"><summary style="cursor:pointer;padding:10px 12px;background:#f5f8fb;color:#1a3a5c;font-weight:800;font-size:12px;">'+titulo+'</summary><div style="padding:10px 12px;overflow-x:auto;">'+contenido+'</div></details>';}
  var h='<div style="margin-top:18px;border-top:2px solid #e5edf5;padding-top:16px;"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;"><div><div style="font-size:15px;font-weight:800;color:#1a3a5c;">📊 Reportes de Riesgos de Terceros</div><div style="font-size:11px;color:#6c757d;margin-top:3px;">Visualización por fases con información sincronizada para Evaluador y Administrador de Riesgos.</div></div></div>';
  list.forEach(function(t){
    var ac=_odControlData(t),rs=_odRiesgos(t),docs=_odDocsTercero(t.nit),dims=t.dims||[],p=parseFloat(t.prom||0),id='od-fases-'+String(t.nit).replace(/[^a-z0-9]/gi,'-');
    var dRows=dims.map(function(d){var v=parseFloat(d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel));return '<tr>'+td(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.tipologia||d.key))+td(isNaN(v)?'—':v)+td(v>=4?'Crítico':v>=3?'Alto':v>=2?'Medio':'Bajo')+'</tr>';}).join('');
    var f1='<table style="width:100%;border-collapse:collapse;font-size:10.5px;"><tr>'+td('Nombre')+td(t.nombre)+'</tr><tr>'+td('NIT')+td(t.nit)+'</tr><tr>'+td('Organización')+td(t.entidad||t.entidadLabel)+'</tr><tr>'+td('Servicio')+td(t.servicio)+'</tr><tr>'+td('Estado')+td(t.estado)+'</tr><tr>'+td('Calificación')+td(isNaN(p)?'—':p.toFixed(2))+'</tr></table><div style="font-size:11px;font-weight:800;color:#1a3a5c;margin:8px 0 4px;">Tipologías</div><table style="width:100%;border-collapse:collapse;font-size:10.5px;"><tr>'+td('Tipología')+td('Puntaje')+td('Nivel')+'</tr>'+(dRows||'<tr>'+td('Sin tipologías asignadas')+'<td></td><td></td></tr>')+'</table>';
    var f2='<div style="font-size:11px;margin-bottom:8px;"><b>Tipologías asignadas:</b> '+_odEsc(dims.map(function(d){return window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key);}).join(', ')||'—')+'<br><b>Progreso:</b> '+ac.respondidos+'/'+ac.total+' controles ('+ac.pct+'%)</div><table style="width:100%;border-collapse:collapse;font-size:10px;"><tr>'+td('Tipología')+td('Pregunta / control')+td('Respuesta')+td('Resultado')+td('%')+'</tr>'+(ac.rows.length?ac.rows.map(function(x){return '<tr>'+td(x.tip)+td(x.control)+td(x.respuesta)+td(x.madurez)+td(x.pct+'%')+'</tr>';}).join(''):'<tr>'+td('Sin preguntas asignadas')+'<td colspan="4"></td></tr>')+'</table>';
    var f3='<table style="width:100%;border-collapse:collapse;font-size:10px;"><tr>'+td('Riesgo')+td('Prob. inherente')+td('Impacto inherente')+td('Riesgo inherente')+td('Control')+td('Prob. residual')+td('Impacto residual')+td('Riesgo residual')+'</tr>'+(rs.length?rs.map(function(r){return '<tr>'+td(r.tipo||r.factor||r.desc)+td(r.probInh)+td(r.impInh)+td(r.zonaInh)+td(r.control)+td(r.probRes)+td(r.impRes)+td(r.zonaRes)+'</tr>';}).join(''):'<tr>'+td('Sin riesgos registrados')+'<td colspan="7"></td></tr>')+'</table>';
    var f4='<table style="width:100%;border-collapse:collapse;font-size:10px;"><tr>'+td('Riesgo')+td('Responsable')+td('Plan de acción')+td('Estado')+td('Fecha')+td('Alerta / observación')+'</tr>'+(rs.length?rs.map(function(r){return '<tr>'+td(r.tipo||r.factor||r.desc)+td(r.resp||r.responsable)+td(r.plan||r.tratamiento)+td(r.estado)+td(_odFecha(r.fechaSeg))+td(r.descSeg||r.observaciones)+'</tr>';}).join(''):'<tr>'+td('Sin acciones de seguimiento registradas')+'<td colspan="5"></td></tr>')+'</table>';
    var f5='<table style="width:100%;border-collapse:collapse;font-size:10.5px;"><tr>'+td('Documento')+td('Origen')+td('Fecha')+td('Tamaño')+'</tr>'+(docs.length?docs.map(function(d){return '<tr>'+td(d.name)+td(d._origen||'Repositorio de Evidencias')+td(_odFecha(d.fecha))+td(d.size?((d.size/1024).toFixed(1)+' KB'):'—')+'</tr>';}).join(''):'<tr>'+td('Sin documentos o evidencias asociadas')+'<td colspan="3"></td></tr>')+'</table>';
    h+='<details id="'+id+'" style="border:1px solid #bfd3e5;border-radius:10px;margin:12px 0;background:#fff;overflow:hidden;"><summary style="cursor:pointer;padding:12px 14px;background:linear-gradient(135deg,#eef5fb,#f8fbff);display:flex;align-items:center;gap:10px;list-style-position:inside;"><span style="font-weight:800;color:#1a3a5c;flex:1;">'+_odEsc(t.nombre)+' · NIT '+_odEsc(t.nit)+'</span><span style="font-size:10px;color:#607d8b;">AC '+ac.pct+'% · '+docs.length+' doc.</span><button onclick="event.preventDefault();odDlInforme(\''+String(t.nit).replace(/'/g,'')+'\',\''+String(t.nombre||'').replace(/'/g,'')+'\')" style="padding:5px 10px;background:#1a3a5c;color:white;border:0;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;">⬇ Word</button></summary><div style="padding:8px 12px 12px;">'+fase(t,'Fase 1 — Registro y Clasificación',f1,true)+fase(t,'Fase 2 — Ambiente de Control',f2,false)+fase(t,'Fase 3 — Análisis de Riesgos',f3,false)+fase(t,'Fase 4 — Seguimiento',f4,false)+fase(t,'Fase 5 — Documentación / Evidencias',f5,false)+'</div></details>';
  });
  cont.innerHTML=h+'</div>';
};
window.odDlTodos=function(){
  var list=_odListaTerceros();
  if(!list.length){try{showToast('Sin terceros','error',2000);}catch(e){}return;}
  list.forEach(function(t,i){setTimeout(function(){odDlInforme(t.nit,t.nombre);},i*180);});
  try{showToast('Generando '+list.length+' informe(s) Word','success',2500);}catch(e){}
};
window.odClick=function(id){var f=odCF();var item=(f.children||[]).find(function(c){return c.id===id;});if(!item)return;if(item.type==='folder'){_odPath.push({id:item.id,name:item.name});window.odRender();}else if(item.dataURL){var a=document.createElement('a');a.href=item.dataURL;a.download=item.name;a.click();}};
window.odNav=function(idx){_odPath=idx<0?[]:_odPath.slice(0,idx+1);window.odRender();};
window.odNuevaCarpeta=function(){var n=prompt('Nombre de la carpeta:');if(!n||!n.trim())return;var f=odCF();if(!f.children)f.children=[];f.children.push({id:'f_'+Date.now(),name:n.trim(),type:'folder',children:[],fecha:new Date().toLocaleDateString('es-CO')});window.odSave();window.odRender();try{showToast('Carpeta creada','success',2000);}catch(e){}};
window.odSubirArchivos=function(files){
  if(!files||!files.length)return;
  var f=odCF();if(!f.children)f.children=[];
  var done=0,total=files.length,rechazados=[];
  Array.from(files).forEach(function(file){
    if(file.size>_OD_MAX*1024*1024){rechazados.push(file.name);done++;if(done===total&&rechazados.length)try{showToast('Rechazados (>'+_OD_MAX+'MB): '+rechazados.join(', '),'error',5000);}catch(e){}return;}
    var r=new FileReader();
    r.onload=function(e){
      f.children.push({id:'file_'+Date.now()+'_'+Math.random().toString(36).slice(2),name:file.name,type:'file',size:file.size,dataURL:e.target.result,fecha:new Date().toLocaleDateString('es-CO')});
      done++;
      if(done===total){window.odSave();window.odRender();var ok=total-rechazados.length;if(ok>0)try{showToast(ok+' archivo(s) subido(s)','success',2500);}catch(e2){}}
    };
    r.readAsDataURL(file);
  });
};
window.odDel=function(id){if(!confirm('¿Eliminar?'))return;var f=odCF();f.children=(f.children||[]).filter(function(c){return c.id!==id;});window.odSave();window.odRender();};
window.odRenombrar=function(id){var f=odCF();var item=(f.children||[]).find(function(c){return c.id===id;});if(!item)return;var n=prompt('Nuevo nombre:',item.name);if(!n||!n.trim())return;item.name=n.trim();window.odSave();window.odRender();};

// 3-dot context menu for repo items
window._odMenu = function(btn, id, type){
  // Remove any existing menu
  var old = document.getElementById('_od_ctx_menu');
  if(old){ old.remove(); if(old._targetId===id) return; }
  var menu = document.createElement('div');
  menu.id = '_od_ctx_menu';
  menu._targetId = id;
  menu.style.cssText = 'position:fixed;z-index:9999;background:white;border:1px solid #dee2e6;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.15);min-width:160px;overflow:hidden;font-family:inherit;';
  var items = [
    {ico:'✏️', lbl:'Renombrar', fn:'window.odRenombrar(\''+id+'\');'},
  ];
  if(type==='file'){
    items.push({ico:'⬇', lbl:'Descargar', fn:'window.odDescargar(\''+id+'\');'});
  }
  items.push({ico:'🗑', lbl:'Eliminar', fn:'window.odDel(\''+id+'\');', red:true});
  menu.innerHTML = items.map(function(it){
    return '<div onclick="document.getElementById(\'_od_ctx_menu\').remove();'+it.fn+'" style="padding:9px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;'+(it.red?'color:#dc3545;':'')+'" onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'\'">'+it.ico+' '+it.lbl+'</div>';
  }).join('<hr style="margin:0;border:none;border-top:1px solid #f0f0f0;">');
  document.body.appendChild(menu);
  var rect = btn.getBoundingClientRect();
  menu.style.left = Math.min(rect.right, window.innerWidth-170)+'px';
  menu.style.top = (rect.bottom+4)+'px';
  var closeOnClick = function(e){ if(!menu.contains(e.target)){ menu.remove(); document.removeEventListener('click',closeOnClick); } };
  setTimeout(function(){ document.addEventListener('click',closeOnClick); },10);
};
window.odDescargar=function(id){var f=odCF();var item=(f.children||[]).find(function(c){return c.id===id;});if(!item||!item.dataURL)return;var a=document.createElement('a');a.href=item.dataURL;a.download=item.name;a.click();};
window.odFmt=function(b){if(b<1024)return b+'B';if(b<1048576)return Math.round(b/1024)+'KB';return(b/1048576).toFixed(1)+'MB';};

// ── RENDERREPORTES simple ────────────────────────────────────────
window.renderReportes=function(){
  var pg=document.getElementById('pg-reportes'); if(!pg)return;
  var user=getUser()||{};
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var rows=Object.values(db);
  if(user.rol==='Cliente'&&user.entidad)rows=rows.filter(function(t){return t.entidad===user.entidad;});
  var zc={'EXTREMO':'#dc3545','ALTO':'#fd7e14','BAJO':'#28a745'};
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;"><div><h2 style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Informes</h2><div style="font-size:12px;color:#6c757d;margin-top:2px;">Clasificación · Ambiente de Control · Matriz de Riesgos</div></div><button onclick="window.exportCSV()" style="padding:7px 14px;background:white;border:1px solid #dee2e6;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;">Exportar CSV</button></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;">';
  var crit=rows.filter(function(t){return parseFloat(t.prom||0)>=4;}).length;
  var conAC=rows.filter(function(t){return Object.keys((window.CUEST_RESPUESTAS||{})[t.nit]||{}).length>0;}).length;
  [['Terceros',rows.length,'#1e6bb8'],['Exposición Alta',crit,'#dc3545'],['AC Iniciado',conAC,'#28a745'],['Riesgos',(window.MATRIZ_DB||[]).length,'#fd7e14']].forEach(function(k){
    h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:14px;border-left:4px solid '+k[2]+';"><div style="font-size:10px;color:#aaa;font-weight:700;text-transform:uppercase;margin-bottom:4px;">'+k[0]+'</div><div style="font-size:28px;font-weight:800;color:'+k[2]+';font-family:Montserrat,sans-serif;">'+k[1]+'</div></div>';
  });
  h+='</div>';
  if(!rows.length){h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:40px;text-align:center;color:#aaa;"><div style="font-size:28px;margin-bottom:10px;">0</div><div>Sin terceros registrados. Ve a Clasificación de Terceros.</div></div>';
  }else{
    h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;overflow-x:auto;"><table style="width:100%;border-collapse:collapse;min-width:700px;"><thead><tr style="background:#1a3a5c;">';
    ['Tercero','Entidad','Tipologías','Clasif.','Exposición','Periodicidad','%AC','Estado'].forEach(function(col){h+='<th style="padding:10px 12px;font-size:11px;font-weight:700;color:white;text-align:left;">'+col+'</th>';});
    h+='</tr></thead><tbody>';
    rows.forEach(function(t,i){
      var nit=t.nit||'';var tips=(t.dims||[]).map(function(d){var key=d.key||''; return (window.SECCIONES_INFO&&window.SECCIONES_INFO[key])?window.SECCIONES_INFO[key].label:key;}).join(', ')||'—';
      var prom=parseFloat(t.prom||0);var cr=(window.CUEST_RESPUESTAS||{})[nit]||{};
      var tot=0,resp=0;Object.values(cr).forEach(function(tr){Object.values(tr).forEach(function(ctrl){if(ctrl&&typeof ctrl==='object'){tot++;if(ctrl.val&&ctrl.val>0)resp++;}});});
      var acPct=tot>0?Math.round(resp/tot*100)+'%':'—';
      var etapa=(prom>0?1:0)+(Object.keys(cr).length>0?1:0)+((window.MATRIZ_DB||[]).filter(function(r){return r.tercero===nit||r.tercero===t.nombre;}).length>0?1:0);
      var estLbl=['Sin iniciar','En proceso','Avanzado','Completo'][etapa]||'—';var estCol=['#aaa','#ffc107','#fd7e14','#28a745'][etapa]||'#aaa';
      h+='<tr style="border-bottom:1px solid #dee2e6;background:'+(i%2?'#f8f9fa':'white')+'">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;font-size:13px;">'+(t.nombre||'—')+'</div><div style="font-size:10.5px;color:#aaa;">'+nit+'</div></td>'
        +'<td style="padding:9px 12px;font-size:12px;color:#334155;font-weight:600;">'+((typeof ELABELS!=='undefined' && ELABELS[t.entidad]) || (t.entidad==='cliente1'?'🏛 Colpensiones':(t.entidad||'—')))+'</td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#6c757d;max-width:140px;">'+tips+'</td>'
        +'<td style="padding:9px 12px;text-align:center;font-weight:800;font-size:16px;color:#1a3a5c;">'+(prom>0?prom.toFixed(1):'—')+'</td>'
        +'<td style="padding:9px 12px;"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+(zc[t.zona||t.exposicion]||'#aaa')+';white-space:nowrap;">'+(t.zona||t.exposicion||'—')+'</span></td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#6c757d;">'+(t.periodicidad||'—')+'</td>'
        +'<td style="padding:9px 12px;text-align:center;font-weight:700;color:'+(acPct==='—'?'#aaa':parseInt(acPct)>=70?'#28a745':parseInt(acPct)>=40?'#fd7e14':'#dc3545')+';">'+acPct+'</td>'
        +'<td style="padding:9px 12px;"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+estCol+';">'+estLbl+'</span></td>'
        +'</tr>';
    });
    h+='</tbody></table></div>';
  }
  pg.innerHTML=h;
};
window.exportCSV=function(){
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var rows=Object.values(db); if(!rows.length){try{showToast('Sin datos','error',2000);}catch(e){}return;}
  var lines=['NIT,Nombre,Entidad,Tipologias,Promedio,Exposicion,Periodicidad,AC_Porcentaje,Estado'];
  rows.forEach(function(t){
    var tips=(t.dims||[]).map(function(d){return window._nombreTipologia(d);}).join(' | ');
    var prom=parseFloat(t.prom||0);var etapa=(prom>0?1:0)+(Object.keys((window.CUEST_RESPUESTAS||{})[t.nit]||{}).length>0?1:0);
    lines.push([t.nit,'"'+(t.nombre||'')+'"',t.entidad||'','"'+tips+'"',prom.toFixed(2),t.zona||t.exposicion||'',t.periodicidad||'','—',['Sin iniciar','En proceso','Avanzado','Completo'][etapa]||'Sin iniciar'].join(','));
  });
  var blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reporte_'+new Date().toISOString().slice(0,10)+'.csv';a.click();
  try{showToast('CSV exportado','success',2500);}catch(e){}
};

// ── OPERATIVO: Tipologías y Controles ───────────────────────────
window.renderTipOp=function(){
  var pg=document.getElementById('pg-tip-op'); if(!pg)return;
  var ent=getEntidad(),tips=getDBTips(ent),filtro=getTipsFiltro();
  if(filtro)tips=tips.filter(function(t){return puedeVerTip(t.nombre_tipologia);});
  var activas=tips.filter(function(t){return t.activo!==false;}).length;
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">'
    +'<div><h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Clasificación de Terceros — Tipologías y Escalas</h2>'
    +'<div style="font-size:12px;color:#6c757d;margin-top:2px;">Activa tipologías y personaliza la escala de valoración &nbsp;·&nbsp; <b>Paso 2 — Tipologías de Riesgo:</b> Selecciona las tipologías y asigna nivel 1–5. El promedio determina la periodicidad.</div></div>'
    +'<button onclick="window.abrirModalNuevaTip()" style="padding:8px 18px;background:#28a745;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">+ Nueva tipología</button>'
    +'</div>';
  h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;margin-bottom:16px;overflow:hidden;">';
  h+='<div style="padding:12px 16px;border-bottom:1px solid #dee2e6;background:#f8f9fa;display:flex;justify-content:space-between;align-items:center;">';
  h+='<b style="font-size:14px;color:#1a3a5c;">Tipologías disponibles ('+activas+' activas)</b>'
    +'<span style="font-size:11px;color:#6c757d;">Haz clic en ✏️ Escala para editar los criterios de valoración por nivel</span>'
    +'</div>';
  h+='<div style="padding:14px 16px;">';
  if(!tips.length)h+='<div style="text-align:center;padding:20px;color:#aaa;">Sin tipologías configuradas.</div>';
  else tips.forEach(function(t){
    var nP=(t.preguntas||[]).length,nA=(t.preguntas||[]).filter(function(p){return p.activo!==false;}).length;
    var act=t.activo!==false,tid=String(t.id_tipologia);
    var isCustom=t._custom||false;
    h+='<div style="display:flex;align-items:center;gap:12px;padding:11px 13px;background:'+(act?'white':'#f9fafb')+';border:1px solid '+(act?'#dee2e6':'#e9ecef')+';border-radius:6px;margin-bottom:8px;flex-wrap:wrap;">'
      +'<div style="width:36px;height:36px;border-radius:8px;background:'+(act?'#1e6bb8':'#adb5bd')+';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0;">'+tid+'</div>'
      +'<div style="flex:1;min-width:180px;"><div style="font-weight:700;font-size:13px;color:'+(act?'#1a3a5c':'#aaa')+';">'+t.nombre_tipologia+(isCustom?' <span style="font-size:9px;background:#e8f4ff;color:#1e6bb8;padding:1px 5px;border-radius:3px;font-weight:700;">CUSTOM</span>':'')+'</div>'
      +'</div><div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;">'
      +'<button onclick="window.abrirModalEscala(\''+tid+'\')" style="padding:5px 11px;background:#e8f4ff;border:1px solid #aac8f0;color:#1e6bb8;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">✏️ Escala</button>'
      +(isCustom?'<button onclick="window.eliminarTipCustom(\''+tid+'\')" style="padding:5px 9px;background:#fef2f2;border:1px solid #fca5a5;color:#dc3545;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">🗑</button>':'')
      +'<button onclick="window.tglTip(\''+tid+'\')" style="padding:5px 9px;background:'+(act?'#fef2f2':'#f0fdf4')+';border:1px solid '+(act?'#fca5a5':'#86efac')+';color:'+(act?'#dc3545':'#28a745')+';border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">'+(act?'Desactivar':'Activar')+'</button>'
      +'</div></div>';
  });
  h+='</div></div>';

  // Modal nueva tipología (inline)
  h+='<div id="modal-nueva-tip" style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">'
    +'<div style="background:white;border-radius:10px;padding:26px 28px;width:520px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.25);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">'
    +'<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:#1a3a5c;">➕ Nueva Tipología de Riesgo</div>'
    +'<button onclick="window.cerrarModalNuevaTip()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#aaa;">✕</button></div>'
    +'<div style="margin-bottom:12px;"><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Nombre de la tipología *</label>'
    +'<input id="nt-nombre" placeholder="Ej: Riesgo Ambiental" style="width:100%;padding:9px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;box-sizing:border-box;"></div>'
    +'<div style="margin-bottom:12px;"><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:4px;">Descripción</label>'
    +'<textarea id="nt-desc" rows="2" placeholder="Descripción breve..." style="width:100%;padding:9px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:12.5px;font-family:inherit;box-sizing:border-box;resize:vertical;"></textarea></div>'
    +'<div style="margin-bottom:16px;"><label style="font-size:12px;font-weight:700;color:#374151;display:block;margin-bottom:8px;">Escala de valoración (niveles 1 a 5)</label>'
    +'<div style="display:flex;flex-direction:column;gap:6px;">'
    +[['5','CRÍTICO','#dc3545'],['4','ALTO','#fd7e14'],['3','MEDIO','#856404'],['2','BAJO','#1e6bb8'],['1','MUY BAJO','#28a745']].map(function(nv){
      return '<div style="display:flex;align-items:center;gap:8px;">'
        +'<span style="width:28px;height:28px;border-radius:50%;background:'+nv[2]+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0;">'+nv[0]+'</span>'
        +'<span style="font-size:10px;font-weight:700;color:'+nv[2]+';width:58px;">'+nv[1]+'</span>'
        +'<input id="nt-nv'+nv[0]+'" placeholder="Criterio para nivel '+nv[0]+'..." style="flex:1;padding:7px 10px;border:1px solid #dee2e6;border-radius:5px;font-size:12px;font-family:inherit;">'
        +'</div>';
    }).join('')
    +'</div></div>'
    +'<div style="display:flex;justify-content:flex-end;gap:8px;">'
    +'<button onclick="window.cerrarModalNuevaTip()" style="padding:9px 20px;background:white;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Cancelar</button>'
    +'<button onclick="window.guardarNuevaTip()" style="padding:9px 22px;background:#28a745;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">✅ Crear tipología</button>'
    +'</div></div></div>';

  // Modal editar escala (inline)
  h+='<div id="modal-escala-tip" style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);align-items:center;justify-content:center;">'
    +'<div style="background:white;border-radius:10px;padding:26px 28px;width:540px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.25);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
    +'<div style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:#1a3a5c;">✏️ Editar Escala de Valoración</div>'
    +'<button onclick="window.cerrarModalEscala()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#aaa;">✕</button></div>'
    +'<div id="escala-tip-nombre" style="font-size:12px;color:#6c757d;margin-bottom:16px;"></div>'
    +'<div id="escala-niveles-wrap" style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;"></div>'
    +'<input type="hidden" id="escala-tip-id">'
    +'<div style="display:flex;justify-content:flex-end;gap:8px;">'
    +'<button onclick="window.cerrarModalEscala()" style="padding:9px 20px;background:white;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Cancelar</button>'
    +'<button onclick="window.guardarEscalaTip()" style="padding:9px 22px;background:#1e6bb8;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">💾 Guardar escala</button>'
    +'</div></div></div>';

  pg.innerHTML=h;
};

window.abrirModalNuevaTip=function(){
  var m=document.getElementById('modal-nueva-tip');
  if(m){m.style.display='flex';}
};
window.cerrarModalNuevaTip=function(){
  var m=document.getElementById('modal-nueva-tip');
  if(m)m.style.display='none';
};
window.guardarNuevaTip=function(){
  var nom=(document.getElementById('nt-nombre')||{}).value||'';
  if(!nom.trim()){try{showToast('El nombre es obligatorio','error',2000);}catch(e){}return;}
  var desc=(document.getElementById('nt-desc')||{}).value||'';
  var niveles={};
  [5,4,3,2,1].forEach(function(n){
    var v=(document.getElementById('nt-nv'+n)||{}).value||'';
    niveles[n]=v;
  });
  var ent=getEntidad();
  var allTips=getDBTips(ent);
  var newId=Date.now();
  var clave='custom_'+newId;
  var newTip={
    id_tipologia:newId,
    nombre_tipologia:nom.trim(),
    clave:clave,
    activo:true,
    descripcion:desc.trim(),
    _custom:true,
    _niveles:niveles,
    preguntas:[]
  };
  // Guardar en customizations
  try{
    var store=JSON.parse(localStorage.getItem('tip_custom_'+ent)||'{}');
    store[String(newId)]=newTip;
    localStorage.setItem('tip_custom_'+ent,JSON.stringify(store));
    // También en TIPOLOGIAS_DB
    if(window.TIPOLOGIAS_DB){
      var arr=window.TIPOLOGIAS_DB[ent]||window.TIPOLOGIAS_DB['default']||[];
      arr.push(newTip);
      window.TIPOLOGIAS_DB[ent]=arr;
    }
    window.cerrarModalNuevaTip();
    window.renderTipOp();
    try{showToast('✅ Tipología "'+nom.trim()+'" creada','success',3000);}catch(e){}
  }catch(e){try{showToast('Error al guardar','error',2000);}catch(ex){}}
};
window.eliminarTipCustom=function(tipId){
  if(!confirm('¿Eliminar esta tipología personalizada?')) return;
  var ent=getEntidad();
  try{
    var store=JSON.parse(localStorage.getItem('tip_custom_'+ent)||'{}');
    delete store[String(tipId)];
    localStorage.setItem('tip_custom_'+ent,JSON.stringify(store));
    if(window.TIPOLOGIAS_DB){
      var arr=window.TIPOLOGIAS_DB[ent]||window.TIPOLOGIAS_DB['default']||[];
      window.TIPOLOGIAS_DB[ent]=arr.filter(function(t){return String(t.id_tipologia)!==String(tipId);});
    }
    window.renderTipOp();
    try{showToast('Tipología eliminada','success',2000);}catch(e){}
  }catch(e){}
};

window.abrirModalEscala=function(tipId){
  var t=getTip(tipId);
  if(!t){try{showToast('Tipología no encontrada','error',2000);}catch(e){}return;}
  var m=document.getElementById('modal-escala-tip');
  if(!m)return;
  document.getElementById('escala-tip-id').value=tipId;
  document.getElementById('escala-tip-nombre').textContent='Tipología: '+t.nombre_tipologia;
  // Build niveles editor
  var ent=getEntidad();
  var customStore={};
  try{customStore=JSON.parse(localStorage.getItem('tip_custom_'+ent)||'{}');}catch(e){}
  var custom=customStore[String(tipId)]||t;
  var savedNiveles=custom._niveles||{};
  // Descripciones específicas POR TIPOLOGÍA (del Excel de Clasificación)
  var descPorTipologia={
    'op':{  // Operativo
      5:'El tercero opera directamente procesos misionales y es proveedor único de la organización',
      4:'El tercero soporta procesos misionales de la organización',
      3:'El tercero soporta procesos de apoyo de la organización y es proveedor único',
      2:'El tercero soporta procesos de apoyo',
      1:'El tercero soporta procesos estratégicos y de evaluación'
    },
    'cn':{  // Continuidad de Negocio
      5:'Sin la participación del tercero no se puede prestar el servicio',
      4:'El servicio prestado por el tercero puede esperar desde 1 día hasta 2 días',
      3:'El servicio prestado por el tercero puede esperar desde 3 días hasta 4 días',
      2:'El servicio prestado por el tercero puede esperar desde 1 semana hasta 4 semanas',
      1:'El servicio prestado por el tercero puede esperar por más de 4 semanas'
    },
    'si':{  // Seguridad de la Información
      5:'El tercero administra y procesa información clasificada o información reservada de clientes',
      4:'El tercero accede y/o almacena información clasificada o información reservada de negocio',
      3:'El tercero accede a información reservada',
      2:'El tercero accede a información clasificada',
      1:'El tercero accede a información de carácter público'
    },
    'cu':{  // Cumplimiento
      5:'El incumplimiento de requerimientos legales por parte de la tercera parte podría generar la intervención de un ente de control a la organización',
      3:'El incumplimiento de requerimientos legales por parte de la tercera parte podría generar sanciones (administrativas o financieras) de un ente de control a la organización',
      1:'El incumplimiento de requerimientos legales por parte de la tercera parte podría generar acciones preventivas o correctivas de un ente de control a la organización'
    },
    'fr':{  // Fraude y Corrupción
      5:'El proveedor desarrolla actividades core asociadas a los procesos misionales del negocio que pueden ser sujetas a hechos de corrupción o fraude',
      3:'El proveedor desarrolla actividades asociadas a los procesos de apoyo del negocio que pueden ser sujetas a hechos de corrupción o fraude',
      1:'El proveedor desarrolla actividades asociadas a los procesos estratégicos y de evaluación del negocio que pueden ser sujetas a hechos de corrupción o fraude'
    },
    'laft':{  // LAFT
      5:'El tercero representa un riesgo de contagio de LAFT para la organización y no está obligado a implementar controles de acuerdo con los lineamientos definidos en la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades',
      3:'El tercero representa un riesgo de contagio de LAFT para la organización y está obligado a implementar controles de acuerdo con los lineamientos definidos en la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades',
      1:'El proveedor prestará el servicio a través de subcontratistas de los cuales no se tiene trazabilidad de sus antecedentes'
    }
  };
  
  // Obtener descripciones específicas de la tipología actual
  var tipKey=t.id_tipologia||t.key||'op';  // Por defecto Operativo
  var tipoDesc=descPorTipologia[tipKey]||descPorTipologia['op'];
  
  var defaultDesc={
    5:tipoDesc[5]||'5 - CRÍTICO',
    4:tipoDesc[4]||'4 - ALTO',
    3:tipoDesc[3]||'3 - MEDIO',
    2:tipoDesc[2]||'2 - BAJO',
    1:tipoDesc[1]||'1 - MUY BAJO'
  };
  var wrap=document.getElementById('escala-niveles-wrap');
  var colors={5:'#dc3545',4:'#fd7e14',3:'#856404',2:'#1e6bb8',1:'#28a745'};
  var labels={5:'CRÍTICO',4:'ALTO',3:'MEDIO',2:'BAJO',1:'MUY BAJO'};
  var html='';
  [5,4,3,2,1].forEach(function(n){
    var val=savedNiveles[n]||(t._niveles&&t._niveles[n])||defaultDesc[n];
    html+='<div>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">'
      +'<span style="width:30px;height:30px;border-radius:50%;background:'+colors[n]+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0;">'+n+'</span>'
      +'<span style="font-size:11px;font-weight:800;color:'+colors[n]+';width:64px;">'+labels[n]+'</span>'
      +'<span style="font-size:10px;color:#aaa;">Criterio para asignar nivel '+n+' a este riesgo</span>'
      +'</div>'
      +'<textarea id="escala-nv'+n+'" rows="2" style="width:100%;padding:8px 12px;border:1px solid '+colors[n]+'55;border-radius:6px;font-size:12.5px;font-family:inherit;box-sizing:border-box;resize:vertical;">'+val+'</textarea>'
      +'</div>';
  });
  wrap.innerHTML=html;
  m.style.display='flex';
};
window.cerrarModalEscala=function(){
  var m=document.getElementById('modal-escala-tip');
  if(m)m.style.display='none';
};
window.guardarEscalaTip=function(){
  var tipId=document.getElementById('escala-tip-id').value;
  var ent=getEntidad();
  var niveles={};
  [5,4,3,2,1].forEach(function(n){
    var el=document.getElementById('escala-nv'+n);
    niveles[n]=el?el.value.trim():'';
  });
  try{
    var store=JSON.parse(localStorage.getItem('tip_custom_'+ent)||'{}');
    if(!store[String(tipId)]) store[String(tipId)]={};
    store[String(tipId)]._niveles=niveles;
    store[String(tipId)].id_tipologia=tipId;
    localStorage.setItem('tip_custom_'+ent,JSON.stringify(store));
    // Update in memory
    var t=getTip(tipId);
    if(t) t._niveles=niveles;
    window.cerrarModalEscala();
    window.renderTipOp();
    try{showToast('✅ Escala guardada correctamente','success',2500);}catch(e){}
  }catch(e){try{showToast('Error al guardar escala','error',2000);}catch(ex){}}
};
window.tglTip=function(tipId){var t=getTip(tipId);if(!t)return;saveTipCustom(tipId,{activo:!(t.activo!==false)});renderTipOp();try{showToast((t.activo!==false?'Desactivada: ':'Activada: ')+t.nombre_tipologia,'success',2000);}catch(e){}};
window.irCtrlTip=function(tipId){
  var nav=document.querySelector('#sb-Operativo .nav-item[onclick*="pg-ctrl-op"]');
  navTo(nav,'pg-ctrl-op');
  setTimeout(function(){renderCtrlOp();setTimeout(function(){var sel=document.getElementById('ctrl-tip-sel');if(sel){sel.value=String(tipId);renderCtrlLista();}},80);},80);
};

window.renderCtrlOp=function(){
  var pg=document.getElementById('pg-ctrl-op'); if(!pg)return;
  var tips=getDBTips(getEntidad()).filter(function(t){return t.activo!==false;});
  var opts=tips.map(function(t){return '<option value="'+t.id_tipologia+'">'+t.nombre_tipologia+'</option>';}).join('');
  // Obtener lista de terceros
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var tercerosList=Object.values(db).filter(function(t){return t&&t.nit;});
  var tercOpts=tercerosList.length
    ? '<option value="">— Todos los terceros —</option>'+tercerosList.map(function(t){return '<option value="'+t.nit+'">'+t.nombre+' ('+t.nit+')</option>';}).join('')
    : '<option value="">Sin terceros registrados</option>';
  pg.innerHTML='<div style="margin-bottom:14px;"><h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Evaluación Ambiente de Control — Controles</h2><div style="font-size:12px;color:#6c757d;margin-top:2px;">Selecciona una tipología para ver y editar controles · Los cambios se reflejan en la evaluación del Evaluador</div></div>'
    +'<div style="background:#e8f4ff;border:1px solid #aac8f0;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#1a3a5c;"><b>6 atributos por control (Sí/No/N.A.):</b> Implementado · Documentado · Asignado · Divulgado · Evidencia · Monitorea</div>'
    +'<div style="background:white;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">'
    +'<div style="padding:12px 16px;border-bottom:1px solid #dee2e6;background:#f8f9fa;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
    +'<label style="font-size:12px;font-weight:700;color:#1a3a5c;white-space:nowrap;">Tipología:</label>'
    +'<select id="ctrl-tip-sel" onchange="window.renderCtrlLista();window.renderCtrlTerceros();" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-weight:600;font-family:inherit;background:white;">'
    +'<option value="">-- Selecciona una tipología --</option>'+opts+'</select>'
    +'<label style="font-size:12px;font-weight:700;color:#1a3a5c;white-space:nowrap;margin-left:8px;">Tercero:</label>'
    +'<select id="ctrl-terc-sel" onchange="window._ctrlFiltrarTipsPorTercero();window._ctrlPoblarContratos();window.renderCtrlLista();" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;background:white;">'+tercOpts+'</select>'
    +'<label id="ctrl-contrato-label" style="display:none;font-size:12px;font-weight:700;color:#78350f;white-space:nowrap;margin-left:8px;">Contrato:</label>'
    +'<select id="ctrl-contrato-sel" onchange="window.renderCtrlLista();" style="display:none;flex:1;min-width:160px;padding:8px 12px;border:1px solid #fde68a;border-radius:6px;font-size:13px;font-family:inherit;background:#fef3c7;">'
    +'<option value="">Todos los contratos</option>'
    +'</select>'
    +'</div>'
    +'<div id="ctrl-stats" style="display:none;padding:8px 16px;background:#f0f4ff;border-bottom:1px solid #dee2e6;display:flex;gap:14px;align-items:center;flex-wrap:wrap;">Activos: <b id="ctrl-nA">0</b> | Total: <b id="ctrl-nT">0</b>'
    +'<button onclick="window.ctrlTodas(true)" style="margin-left:auto;padding:4px 12px;background:#e8f8f2;border:1px solid #82d9ae;color:#28a745;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Activar todos</button>'
    +'<button onclick="window.ctrlTodas(false)" style="padding:4px 12px;background:#fde8e8;border:1px solid #fca5a5;color:#dc3545;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Desactivar todos</button></div>'
    +'<div style="padding:14px 16px;"><div id="ctrl-terceros-info" style="margin-bottom:12px;"></div><div id="ctrl-lista" style="display:flex;flex-direction:column;gap:6px;max-height:420px;overflow-y:auto;margin-bottom:14px;"></div>'
    +'<div id="ctrl-empty" style="text-align:center;padding:24px;color:#aaa;"><div style="font-size:20px;margin-bottom:8px;">↑</div><div>Selecciona una tipología para ver y gestionar sus controles</div></div>'
    +'<div id="ctrl-form-add" style="display:none;border-top:1px solid #dee2e6;padding-top:14px;margin-top:4px;">'
    +'<div style="font-size:12px;font-weight:800;color:#1a3a5c;margin-bottom:10px;">＋ Nuevo control</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;">'
    +'<input id="ctrl-nnom" placeholder="Nombre del control *" style="padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:12.5px;font-family:inherit;width:100%;">'
    +'<textarea id="ctrl-nreq" rows="2" placeholder="Pregunta / Requisito" style="padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:12.5px;font-family:inherit;width:100%;resize:vertical;"></textarea>'
    +'<input id="ctrl-nev" placeholder="Evidencia esperada" style="padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:12.5px;font-family:inherit;width:100%;">'
    +'<div style="display:flex;gap:8px;">'
    +'<button onclick="window.ctrlAgregar()" style="padding:8px 18px;background:#1e6bb8;color:white;border:none;border-radius:6px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;">Guardar control</button>'
    +'<button onclick="document.getElementById(\"ctrl-form-add\").style.display=\"none\";" style="padding:8px 14px;background:white;color:#6c757d;border:1px solid #dee2e6;border-radius:6px;font-size:12.5px;cursor:pointer;font-family:inherit;">Cancelar</button>'
    +'</div></div></div>'
    +'<div id="ctrl-btn-add-wrap" style="margin-top:10px;">'
    +'<button onclick="if(!document.getElementById(\'ctrl-tip-sel\')||!document.getElementById(\'ctrl-tip-sel\').value){try{showToast(\'Selecciona una tipología primero\',\'error\',2000);}catch(e){}return;}document.getElementById(\'ctrl-form-add\').style.display=\'block\';this.parentNode.style.display=\'none\'" '
    +'style="padding:8px 18px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:6px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;">'
    +'＋ Agregar control a esta tipología</button></div>'
    +'</div></div>';
};

// ════ CONFIGURACIÓN DE ANÁLISIS DE RIESGOS (catálogos para la Matriz) ════
// Catálogos que usa el Evaluador al diligenciar la Matriz de Riesgos. No se
// eliminan elementos, solo se activan/desactivan — y solo se pisan con los
// valores por defecto si todavía no existe nada guardado.
(function(){
  var DEFAULT_CATALOGOS = {
    factor: ['Procesos','Talento Humano','Tecnología','Infraestructura','Evento Externo'],
    clasificacion: ['Ejecución y Administración de Procesos','Fraude Interno','Fraude Externo','Fallas Tecnológicas','Relaciones Laborales','Usuarios Productos y Prácticas','Daños a Activos Fijos','Capacidad Financiera','Pérdida de la Confidencialidad','Pérdida de la Integridad','Pérdida de la Disponibilidad','LAFT'],
    tipoControl: ['PREVENTIVO','DETECTIVO','CORRECTIVO'],
    tratamiento: ['REDUCIR (TRANSFERIR O MITIGAR)','ACEPTAR','EVITAR']
  };
  var LS_KEY='sgrt_catalogos_riesgo';

  function cargarCatalogos(){
    var saved=null;
    try{ saved=JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){}
    if(saved && typeof saved==='object'){ window.CATALOGOS_RIESGO=saved; return; }
    var base={};
    Object.keys(DEFAULT_CATALOGOS).forEach(function(k){
      base[k]=DEFAULT_CATALOGOS[k].map(function(nombre){ return {nombre:nombre, activo:true}; });
    });
    window.CATALOGOS_RIESGO=base;
    guardarCatalogos();
  }
  function guardarCatalogos(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(window.CATALOGOS_RIESGO)); }catch(e){}
  }
  if(!window.CATALOGOS_RIESGO) cargarCatalogos();

  var SECCIONES=[
    {key:'factor',        titulo:'Factor de Riesgo'},
    {key:'clasificacion', titulo:'Clasificación del Riesgo'},
    {key:'tipoControl',   titulo:'Tipo de Control'},
    {key:'tratamiento',   titulo:'Opción de Tratamiento'}
  ];

  window.renderConfigRiesgo=function(){
    var pg=document.getElementById('pg-config-riesgo'); if(!pg) return;
    try{ cargarCatalogos(); }catch(e){}
    var h='<div style="margin-bottom:14px;"><h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Análisis de Riesgos — Configuración</h2>'
      +'<div style="font-size:12px;color:#6c757d;margin-top:2px;">Administra los catálogos que usa el Evaluador al diligenciar la Matriz de Riesgos · Para desactivar un elemento no se elimina, solo se inhabilita.</div></div>'
      +'<div style="width:100%;max-height:calc(100vh - 350px);overflow-y:auto;">';
    SECCIONES.forEach(function(sec){
      var items=window.CATALOGOS_RIESGO[sec.key]||[];
      h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;margin-bottom:16px;overflow:hidden;">';
      h+='<div style="padding:12px 16px;border-bottom:1px solid #dee2e6;background:#f8f9fa;"><b style="font-size:14px;color:#1a3a5c;">'+sec.titulo+'</b></div>';
      h+='<div style="padding:12px 16px;">';
      items.forEach(function(it,idx){
        var act=it.activo!==false;
        h+='<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:'+(act?'white':'#f9fafb')+';border:1px solid '+(act?'#dee2e6':'#e9ecef')+';border-radius:6px;margin-bottom:6px;">'
          +'<span style="flex:1;font-size:12.5px;font-weight:600;color:'+(act?'#1a3a5c':'#aaa')+';">'+it.nombre+'</span>'
          +'<button onclick="window._tglCatalogoItem(\''+sec.key+'\','+idx+')" style="padding:5px 11px;background:'+(act?'#fef2f2':'#f0fdf4')+';border:1px solid '+(act?'#fca5a5':'#86efac')+';color:'+(act?'#dc3545':'#28a745')+';border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">'+(act?'Desactivar':'Activar')+'</button>'
          +'</div>';
      });
      h+='<button onclick="window._agregarCatalogoItem(\''+sec.key+'\')" style="margin-top:4px;padding:7px 16px;background:#e8f4ff;border:1px solid #93c5fd;color:#1e6bb8;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">＋ Agregar</button>';
      h+='</div></div>';
    });
    h+='</div>';
    pg.innerHTML=h;
  };

  window._tglCatalogoItem=function(key, idx){
    var arr=(window.CATALOGOS_RIESGO||{})[key]; if(!arr||!arr[idx]) return;
    arr[idx].activo = arr[idx].activo===false ? true : false;
    guardarCatalogos();
    window.renderConfigRiesgo();
    try{ showToast((arr[idx].activo?'Activado: ':'Desactivado: ')+arr[idx].nombre,'success',2000); }catch(e){}
  };

  window._agregarCatalogoItem=function(key){
    var nombre = (window.prompt('Nombre del nuevo elemento:')||'').trim();
    if(!nombre) return;
    var arr=(window.CATALOGOS_RIESGO||{})[key]; if(!arr) return;
    if(arr.some(function(it){return it.nombre.toLowerCase()===nombre.toLowerCase();})){
      try{ showToast('Ese elemento ya existe','error',2500); }catch(e){}
      return;
    }
    arr.push({nombre:nombre, activo:true});
    guardarCatalogos();
    window.renderConfigRiesgo();
    try{ showToast('✅ Agregado: '+nombre,'success',2000); }catch(e){}
  };

  // Items activos por catálogo, en formato simple para poblar un selector
  window._catalogoActivos=function(key){
    return ((window.CATALOGOS_RIESGO||{})[key]||[]).filter(function(it){return it.activo!==false;}).map(function(it){return it.nombre;});
  };

  // Poblar un selector con los elementos activos de un catálogo, conservando el
  // valor actual aunque ya no esté activo (para no romper riesgos existentes).
  function poblarSelectCatalogo(selId, key, valorActual){
    var sel=document.getElementById(selId); if(!sel) return;
    var activos=window._catalogoActivos(key);
    var opciones=['<option value="">— Seleccionar —</option>'];
    activos.forEach(function(n){ opciones.push('<option value="'+n+'">'+n+'</option>'); });
    if(valorActual && activos.indexOf(valorActual)<0){
      opciones.push('<option value="'+valorActual+'">'+valorActual+' (inactivo)</option>');
    }
    sel.innerHTML=opciones.join('');
    if(valorActual) sel.value=valorActual;
  }
  window._poblarSelectsCatalogoRiesgo=function(valores){
    valores = valores||{};
    poblarSelectCatalogo('nr-factor','factor', valores.factor);
    poblarSelectCatalogo('nr-clasificacion','clasificacion', valores.clasificacion);
    poblarSelectCatalogo('nr-tipo-ctrl','tipoControl', valores.tipoControl);
    poblarSelectCatalogo('nr-tratamiento','tratamiento', valores.tratamiento);
  };

  // Conectar con abrirNuevoRiesgo / editarRiesgo sin tocar sus definiciones originales
  var _origAbrirNR = window.abrirNuevoRiesgo;
  window.abrirNuevoRiesgo = function(){
    _origAbrirNR.apply(this, arguments);
    try{ window._poblarSelectsCatalogoRiesgo(); }catch(e){}
  };
  var _origEditarRiesgo = window.editarRiesgo;
  window.editarRiesgo = function(id){
    _origEditarRiesgo.apply(this, arguments);
    try{
      var r=(window.MATRIZ_DB||[]).find(function(x){return x.id===id;});
      if(r) window._poblarSelectsCatalogoRiesgo({factor:r.factor, clasificacion:r.clasif, tipoControl:r.tipoCtrl, tratamiento:r.tratamiento});
    }catch(e){}
  };
})();
window.renderCtrlTerceros=function(){
  var tipId=(document.getElementById('ctrl-tip-sel')||{}).value;
  var nitFil=(document.getElementById('ctrl-terc-sel')||{}).value||'';
  var wrap=document.getElementById('ctrl-terceros-info'); if(!wrap)return;
  if(!tipId){wrap.innerHTML='';return;}
  var tip=getTip(tipId); if(!tip){wrap.innerHTML='';return;}
  var tipKey=tip.clave; // clave string usada en t.dims (ej: 'op','cn','si'...)
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var terceros=Object.values(db).filter(function(t){
    if(!t||!t.nit) return false;
    if(nitFil&&t.nit!==nitFil) return false;
    // Coincide por la clave de la tipología (op, cn, si, cu, fc, laft, rf, pais)
    var dims=t.dims||[];
    return dims.some(function(d){return d.key===tipKey;});
  });
  if(!terceros.length){
    wrap.innerHTML='<div style="background:#fff9ec;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;font-size:12px;color:#92400e;margin-bottom:10px;">ℹ️ Ningún tercero tiene esta tipología asignada aún. Recuerda que las tipologías se asignan desde <b>Clasificación de Terceros</b> (Administrador).</div>';
    return;
  }
  var zc={'EXTREMO':'#dc3545','ALTO':'#fd7e14','BAJO':'#28a745'};
  wrap.innerHTML='<div style="background:#f0f4ff;border:1px solid #c7d8f5;border-radius:6px;padding:10px 14px;margin-bottom:10px;">'
    +'<div style="font-size:11px;font-weight:700;color:#1a3a5c;margin-bottom:6px;">Terceros con esta tipología ('+terceros.length+')</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'
    +terceros.map(function(t){
      var prom=parseFloat(t.prom||0);
      var zona=t.zona||'';
      var color=zc[zona]||'#aaa';
      var dimInfo=(t.dims||[]).find(function(d){return d.key===tipKey;})||{};
      var dimVal=parseFloat(dimInfo.val||0);
      var dimColor=dimVal>=4?'#dc3545':dimVal>=3?'#fd7e14':dimVal>=2?'#ffc107':'#28a745';
      var cr=(window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit]&&window.CUEST_RESPUESTAS[t.nit][tipKey])||{};
      // Lista canónica POR TERCERO: refleja config del Admin + ajustes por tercero
      var ctrlsRef=window._ctrlsCuest?window._ctrlsCuest(t.nit,tipKey):((window.CUESTIONARIO_CONTROLES&&window.CUESTIONARIO_CONTROLES[tipKey])||[]);
      var totalCtrl=ctrlsRef.length;
      var resp=0;
      ctrlsRef.forEach(function(c){
        var r=cr[c.n];
        if(r&&r.a1) resp++;
      });
      var pct=totalCtrl>0?Math.min(100,Math.round(resp/totalCtrl*100)):0;
      return '<div style="background:white;border:1px solid #dee2e6;border-radius:6px;padding:7px 12px;min-width:170px;">'
        +'<div style="font-weight:700;font-size:12px;color:#1a3a5c;">'+t.nombre+'</div>'
        +'<div style="font-size:10.5px;color:#6c757d;">NIT: '+t.nit+'</div>'
        +'<div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap;">'
        +'<span style="font-size:10.5px;color:#6c757d;">Prom. global:</span><span style="font-size:11px;font-weight:700;color:#1a3a5c;">'+prom.toFixed(1)+'</span>'
        +'<span style="padding:1px 6px;background:'+color+';color:white;border-radius:8px;font-size:9.5px;font-weight:700;">'+zona+'</span></div>'
        +'<div style="display:flex;align-items:center;gap:6px;margin-top:3px;">'
        +'<span style="font-size:10.5px;color:#6c757d;">Esta tipología:</span><span style="padding:1px 7px;background:'+dimColor+';color:white;border-radius:8px;font-size:10px;font-weight:700;">'+(dimVal||'—')+'</span></div>'
        +'<div style="margin-top:5px;"><div style="background:#e9ecef;border-radius:3px;height:5px;"><div style="background:'+(pct>=80?'#28a745':pct>=40?'#fd7e14':'#dc3545')+';height:5px;border-radius:3px;width:'+pct+'%;"></div></div>'
        +'<div style="font-size:9.5px;color:#6c757d;margin-top:1px;">AC: '+resp+'/'+totalCtrl+' controles respondidos ('+pct+'%)</div></div>'
        +'</div>';
    }).join('')
    +'</div></div>';
};
window.renderCtrlLista=function(){
  var tipId=(document.getElementById('ctrl-tip-sel')||{}).value;
  var lista=document.getElementById('ctrl-lista'),empty=document.getElementById('ctrl-empty'),stats=document.getElementById('ctrl-stats');
  if(!lista)return;
  if(!tipId){lista.innerHTML='';if(empty)empty.style.display='block';if(stats)stats.style.display='none';return;}
  var tip=getTip(tipId);if(!tip){lista.innerHTML='<div style="color:#aaa;padding:12px;">Tipología no encontrada.</div>';return;}
  if(empty)empty.style.display='none';
  var pregs=tip.preguntas||[];
  // Si hay contrato seleccionado, un control se considera activo cuando
  // NO está en el hidden POR contrato (independiente del tercero global).
  var contrato=(document.getElementById('ctrl-contrato-sel')||{}).value||'';
  var nit=(document.getElementById('ctrl-terc-sel')||{}).value||'';
  var hiddenPorContrato = [];
  if(contrato && nit){
    var tipReg = getTip(tipId);
    var claveCan = (tipReg && (tipReg.clave || tipReg.key)) || String(tipId);
    if(!/^(op|cn|si|cu|fr|laft|pa|fi)$/.test(claveCan) && tipReg){
      var nomR = tipReg.nombre_tipologia || tipReg.nombre || '';
      claveCan = Object.keys({op:1,cn:1,si:1,cu:1,fr:1,laft:1,pa:1,fi:1}).find(function(k){
        return (window._nombreTipologia && window._nombreTipologia({key:k,nombre:k})===nomR);
      }) || claveCan;
    }
    hiddenPorContrato = (window._persHiddenControls||{})[nit+'_'+contrato+'_'+claveCan] || [];
  }
  function estaActivo(p, i){
    if(contrato && nit){
      var n = p.n || (i+1);
      return hiddenPorContrato.indexOf(n) === -1;
    }
    return p.activo !== false;
  }
  var nA=pregs.filter(function(p,i){return estaActivo(p,i);}).length;
  if(document.getElementById('ctrl-nA'))document.getElementById('ctrl-nA').textContent=nA;
  if(document.getElementById('ctrl-nT'))document.getElementById('ctrl-nT').textContent=pregs.length;
  if(stats)stats.style.display=pregs.length?'flex':'none';
  if(!pregs.length){lista.innerHTML='<div style="text-align:center;padding:18px;color:#aaa;">Sin controles configurados para esta tipología.</div>';return;}
  lista.innerHTML=pregs.map(function(p,i){
    var act=estaActivo(p,i),nom=p.control||p.nombre_control||'Control '+(i+1),req=p.texto||p.pregunta||'',ev=p.evidencia||p.doc||'',tId=String(tipId);
    return '<div style="display:flex;align-items:flex-start;gap:10px;padding:11px 13px;background:'+(act?'white':'#f9fafb')+';border:1px solid '+(act?'#dee2e6':'#e9ecef')+';border-radius:6px;">'
      +'<div style="width:24px;height:24px;border-radius:50%;background:'+(act?'#1e6bb8':'#adb5bd')+';display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;flex-shrink:0;margin-top:2px;">'+(i+1)+'</div>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:10.5px;font-weight:800;color:#fd7e14;text-transform:uppercase;margin-bottom:2px;">'+nom+'</div>'
      +'<div style="font-size:12.5px;color:'+(act?'#222':'#aaa')+';line-height:1.5;">'+req+'</div>'
      +(ev?'<div style="font-size:10.5px;color:#6c757d;margin-top:3px;">Evidencia: '+ev+'</div>':'')+'</div>'
      +'<div style="display:flex;gap:4px;flex-shrink:0;">'
      +'<button onclick="window.ctrlTgl(\''+tId+'\','+i+')" style="padding:3px 8px;border-radius:4px;font-size:10.5px;font-weight:700;cursor:pointer;border:1px solid '+(act?'#fca5a5':'#86efac')+';background:'+(act?'#fef2f2':'#f0fdf4')+';color:'+(act?'#dc3545':'#28a745')+';font-family:inherit;">'+(act?'Quitar':'Activar')+'</button>'
      +'<button onclick="window.ctrlDel(\''+tId+'\','+i+')" style="padding:3px 7px;border-radius:4px;font-size:10.5px;cursor:pointer;border:1px solid #fca5a5;background:#fef2f2;color:#dc3545;font-family:inherit;">✕</button>'
      +'</div></div>';
  }).join('');
};
window.ctrlGetPregs=function(tipId){var tip=getTip(tipId);return tip?(tip.preguntas||[]):[];};
window.ctrlSetPregs=function(tipId,pregs){saveTipCustom(tipId,{preguntas:pregs});};
window.ctrlTgl=function(tipId,i){
  var contrato = (document.getElementById('ctrl-contrato-sel')||{}).value || '';
  var nit      = (document.getElementById('ctrl-terc-sel')||{}).value || '';
  var p = ctrlGetPregs(tipId);
  var control = p[i]; if(!control) return;
  // Cuando hay CONTRATO seleccionado, la activación/desactivación es POR contrato:
  // se guarda en _persHiddenControls con la CLAVE canónica (op/cn/si/...) — la
  // misma que usa _ctrlsCuest para leer al pintar el cuestionario del Evaluador.
  if(contrato && nit){
    if(!window._persHiddenControls) window._persHiddenControls = {};
    var tip = getTip(tipId);
    var claveCan = (tip && (tip.clave || tip.key)) || String(tipId);
    // Fallback: mapear por nombre si aún no tenemos clave canónica
    if(!/^(op|cn|si|cu|fr|laft|pa|fi)$/.test(claveCan) && tip){
      var nom = tip.nombre_tipologia || tip.nombre || '';
      claveCan = Object.keys({op:1,cn:1,si:1,cu:1,fr:1,laft:1,pa:1,fi:1}).find(function(k){
        return (window._nombreTipologia && window._nombreTipologia({key:k,nombre:k})===nom);
      }) || claveCan;
    }
    var hKey = nit+'_'+contrato+'_'+claveCan;
    if(!window._persHiddenControls[hKey]) window._persHiddenControls[hKey] = [];
    var arr = window._persHiddenControls[hKey];
    var n = control.n || (i+1);
    var idx = arr.indexOf(n);
    if(idx>=0) arr.splice(idx,1); else arr.push(n);
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast(idx>=0 ? '✓ Activo para este contrato' : '⊘ Oculto para este contrato', 'success', 1400); }catch(e){}
    renderCtrlLista();
    return;
  }
  // Comportamiento clásico: sin contrato, toggle a nivel de la tipología
  p[i].activo=(p[i].activo===false);
  ctrlSetPregs(tipId,p);
  renderCtrlLista();
};
window.ctrlDel=function(tipId,i){if(!confirm('¿Eliminar?'))return;var p=ctrlGetPregs(tipId);p.splice(i,1);ctrlSetPregs(tipId,p);renderCtrlLista();};
// ── Filtrar el selector de tipologías según el TERCERO elegido ────
// Si el tercero tiene 3 tipologías asignadas en Clasificación, el
// desplegable de Controles AC muestra SOLO esas 3 (no todas).
// ── Poblar selector de CONTRATO en Configuración de Ambiente de
// Control. Solo aparece si el tercero tiene 2+ contratos, para permitir
// configurar controles por contrato (op, cn, si aplican).
window._ctrlPoblarContratos = function(){
  var selTerc = document.getElementById('ctrl-terc-sel');
  var selCon  = document.getElementById('ctrl-contrato-sel');
  var lblCon  = document.getElementById('ctrl-contrato-label');
  if(!selTerc || !selCon || !lblCon) return;
  var nit = selTerc.value;
  var t = nit ? (window.TERCEROS_DB||{})[nit] : null;
  var cons = (t && t.contratos) || [];
  var prev = selCon.value;
  if(cons.length <= 1){
    // Sin contratos o uno solo → ocultar. La configuración va al tercero.
    selCon.style.display = 'none';
    lblCon.style.display = 'none';
    selCon.innerHTML = '<option value="">Todos los contratos</option>';
    return;
  }
  selCon.style.display = '';
  lblCon.style.display = '';
  selCon.innerHTML = '<option value="">Todos los contratos</option>' + cons.map(function(c,i){
    var lbl = 'Contrato '+(i+1)+' ('+(c.num||'s/n')+')';
    return '<option value="'+(c.num||'').replace(/"/g,'&quot;')+'">'+lbl+'</option>';
  }).join('');
  if(cons.some(function(c){return c.num===prev;})) selCon.value = prev;
};

window._ctrlFiltrarTipsPorTercero=function(){
  var tercSel=document.getElementById('ctrl-terc-sel');
  var tipSel=document.getElementById('ctrl-tip-sel');
  if(!tipSel) return;
  var nit=(tercSel&&tercSel.value)||'';
  var tips=getDBTips(getEntidad()).filter(function(t){return t.activo!==false;});
  var claves=null;
  if(nit){
    var db=window.TERCEROS_DB||{}; var t=db[nit];
    claves={};
    ((t&&t.dims)||[]).forEach(function(d){ claves[String(d.key||'').toLowerCase()]=true; });
    var ALIAS={'fc':'fr','rf':'fi','pais':'pa'};
    tips=tips.filter(function(tp){ var c=String(tp.clave||'').toLowerCase(); c=ALIAS[c]||c; return !!claves[c]; });
  }
  var actual=tipSel.value;
  tipSel.innerHTML='<option value="">-- Selecciona una tipología --</option>'+tips.map(function(t){
    var nA=(t.preguntas||[]).filter(function(p){return p.activo!==false;}).length;
    return '<option value="'+t.id_tipologia+'">'+t.nombre_tipologia+'</option>';
  }).join('');
  // Conservar la selección si sigue disponible; si no, tomar la primera del tercero
  var sigue=[].some.call(tipSel.options,function(o){return o.value===actual&&o.value!=='';});
  if(sigue){ tipSel.value=actual; }
  else if(nit && tips.length){ tipSel.value=String(tips[0].id_tipologia); }
  else { tipSel.value=''; }
  try{ renderCtrlLista(); }catch(e){}
  try{ renderCtrlTerceros(); }catch(e){}
  if(nit && !tips.length){ try{ showToast('Este tercero no tiene tipologías asignadas en Clasificación','error',3000); }catch(e){} }
};

window.ctrlTodas=function(act){var tipId=(document.getElementById('ctrl-tip-sel')||{}).value;if(!tipId)return;if(!act&&!confirm('¿Desactivar todos?'))return;var p=ctrlGetPregs(tipId);p.forEach(function(x){x.activo=act;});ctrlSetPregs(tipId,p);renderCtrlLista();};
window.ctrlAgregar=function(){
  var tipId=(document.getElementById('ctrl-tip-sel')||{}).value; if(!tipId){try{showToast('Selecciona una tipología','error',2000);}catch(e){}return;}
  var nom=(document.getElementById('ctrl-nnom')||{}).value||'',req=(document.getElementById('ctrl-nreq')||{}).value||'',ev=(document.getElementById('ctrl-nev')||{}).value||'';
  if(!nom.trim()){try{showToast('Escribe el nombre del control','error',2000);}catch(e){}return;}
  var p=ctrlGetPregs(tipId);
  p.push({id_pregunta:Date.now(),control:nom.trim(),nombre_control:nom.trim(),texto:req.trim()||nom.trim(),pregunta:req.trim()||nom.trim(),evidencia:ev.trim(),doc:ev.trim(),activo:true,tipo_valoracion:'ATRIBUTOS',orden:p.length+1});
  ctrlSetPregs(tipId,p);
  ['ctrl-nnom','ctrl-nreq','ctrl-nev'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';}); 
  var f=document.getElementById('ctrl-form-add');if(f)f.style.display='none';
  var b=document.getElementById('ctrl-btn-add-wrap');if(b)b.style.display='block';
  renderCtrlLista();
  try{showToast('Control agregado','success',2500);}catch(e){}
};

window.renderAprobarOp=function(){
  var pg=document.getElementById('pg-aprobar-op'); if(!pg)return;
  
  try{ window._lsLoad && window._lsLoad(); }catch(e){}
  try{
    var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(_sv).length){
      window.TERCEROS_DB = _sv;
    }
  }catch(e){}
  try{
    var _scr=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
    window.CUEST_RESPUESTAS = _scr;
  }catch(e){}
  
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var lista=Object.values(db).filter(function(t){return t&&t.nit;});
  
  // ⭐ GUARDAR LISTA ORIGINAL PARA FILTRADO
  window._aprobarListaOriginal = lista;
  
  var h='<div style="margin-bottom:14px;"><h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">Aprobación de Clasificación de Terceros</h2><div style="font-size:12px;color:#6c757d;margin-top:2px;">Terceros a aprobar para Ambiente de Control</div></div>';
  
  // ⭐ AGREGAR BUSCADOR
  h+='<div style="margin-bottom:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
  h+='<input type="text" id="aprobar-search-input" placeholder="🔎 Buscar por nombre o NIT..." style="flex:1;min-width:200px;padding:10px 14px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;font-family:inherit;" oninput="window._filtrarAprobarLista(this.value)">';
  h+='<div id="aprobar-search-info" style="font-size:11px;color:#6c757d;white-space:nowrap;">Mostrando '+lista.length+' tercero'+(lista.length!==1?'s':'')+' registrado'+(lista.length!==1?'s':'')+'</div>';
  h+='</div>';
  
  // ⭐ CONTENEDOR PARA FILTRADO DINÁMICO
  h+='<div id="aprobar-lista-terceros">';
  
  if(!lista.length){
    h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:40px;text-align:center;color:#aaa;"><div style="font-size:28px;margin-bottom:10px;">0</div><div style="font-size:14px;font-weight:600;">Sin terceros registrados</div></div>';
  } else {
    var aprobados=lista.filter(function(t){return parseFloat(t.prom||0)>3;});
    var pendientes=lista.filter(function(t){return parseFloat(t.prom||0)<=3;});
    
    // KPI Cards
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
    h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#1a3a5c;">'+lista.length+'</div><div style="font-size:11px;color:#6c757d;">Terceros totales</div></div>';
    h+='<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#28a745;">'+aprobados.length+'</div><div style="font-size:11px;color:#28a745;">Prom > 3 · Clasifican</div></div>';
    h+='<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#dc3545;">'+pendientes.length+'</div><div style="font-size:11px;color:#dc3545;">Prom ≤ 3 · No clasifican</div></div>';
    h+='</div>';
    
    // Tabla simplificada - SOLO TERCERO
    h+='<div style="background:white;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">';
    h+='<div style="padding:12px 16px;background:#1a3a5c;color:white;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Tercero</div>';
    h+='<div style="max-height:calc(100vh - 400px);overflow-y:auto;-webkit-overflow-scrolling:touch;">';
    
    lista.forEach(function(t,i){
      var nit=t.nit||'';
      var prom=parseFloat(t.prom||0);
      var pasaCorte=prom>3;
      var contratos = t.contratos || [];
      
      // Card por tercero
      h+='<div style="border-bottom:1px solid #dee2e6;padding:16px;background:'+(i%2?'#f8f9fa':'white')+';opacity:'+(pasaCorte?'1':'0.6')+'">';
      
      // Nombre y NIT (grande)
      h+='<div style="margin-bottom:12px;">';
      h+='<div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:2px;">'+(t.nombre||'—')+'</div>';
      h+='<div style="font-size:12px;color:#475569;font-weight:600;">NIT: '+nit+'</div>';
      h+='<div style="font-size:11px;color:#6c757d;margin-top:4px;">Promedio: <span style="font-weight:800;color:'+(prom>=4?'#dc3545':prom>3?'#fd7e14':'#28a745')+';">'+prom.toFixed(2)+'</span></div>';
      h+='</div>';
      
      // Contratos
      if(contratos.length){
        h+='<div style="margin-bottom:12px;padding:10px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:6px;">';
        h+='<div style="font-size:11px;font-weight:800;color:#1e40af;text-transform:uppercase;margin-bottom:8px;">'+contratos.length+' Contrato'+(contratos.length>1?'s':'')+'</div>';
        
        contratos.forEach(function(c, cidx){
          var habC = !!(t.aprobadoPorContrato||{})[c.num];
          h+='<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:'+(cidx<contratos.length-1?'1px solid #dbeafe':'none')+';font-size:11px;">';
          h+='<span style="flex:1;font-weight:600;color:#0f172a;">• '+(c.num||'s/n')+'</span>';
          h+= '<button data-sgrt-aprobar-nit="'+String(nit).replace(/"/g,'&quot;')+'" data-sgrt-aprobar-contrato="'+String(c.num||'').replace(/"/g,'&quot;')+'" onclick="window._aprToggleContrato(\''+nit+'\',\''+(c.num||'').replace(/\'/g,"\\\'")+'\')" style="padding:4px 12px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;border:1px solid '+(habC?'#15803d':'#fca5a5')+';background:'+(habC?'#16a34a':'#fef2f2')+';color:'+(habC?'#ffffff':'#991b1b')+';box-shadow:'+(habC?'0 2px 7px rgba(22,163,74,.25)':'none')+';font-family:inherit;white-space:nowrap;margin-right:6px;">'+(habC?'✓ Aprobado':'Aprobar')+'</button>';
          h+='<button onclick="window._verTipologiasContrato(\''+nit+'\',\''+(c.num||'').replace(/\'/g,"\\\\'")+'\')" style="padding:4px 12px;background:#f0f4f8;color:#0f4a8c;border:1px solid #bfdbfe;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Ver Tipologías</button>';
          h+='</div>';
        });
        h+='</div>';
      }
      
      h+='</div>';
    });
    
    h+='</div></div>';
  }
  
  h+='</div>'; // Cierre del contenedor aprobar-lista-terceros
  
  pg.innerHTML=h;
};

// ⭐ FUNCIÓN DE FILTRADO PARA LA BÚSQUEDA
window._filtrarAprobarLista = function(busqueda) {
  busqueda = (busqueda || '').toLowerCase().trim();
  
  var lista = window._aprobarListaOriginal || [];
  var listaFiltrada = lista;
  
  if(busqueda) {
    listaFiltrada = lista.filter(function(t) {
      var nombre = (t.nombre || '').toLowerCase();
      var nit = (t.nit || '').toLowerCase();
      return nombre.includes(busqueda) || nit.includes(busqueda);
    });
  }
  
  // Renderizar solo la tabla de terceros
  var h = '';
  
  if(!listaFiltrada.length){
    h = '<div style="padding:40px;text-align:center;color:#aaa;background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;">';
    h += '<div style="font-size:28px;margin-bottom:10px;">0</div>';
    h += '<div style="font-size:14px;font-weight:600;">No se encontraron terceros</div>';
    h += '</div>';
  } else {
    // KPI Cards
    var aprobados = listaFiltrada.filter(function(t){return parseFloat(t.prom||0)>3;});
    var pendientes = listaFiltrada.filter(function(t){return parseFloat(t.prom||0)<=3;});
    
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
    h += '<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#1a3a5c;">'+listaFiltrada.length+'</div><div style="font-size:11px;color:#6c757d;">Terceros encontrados</div></div>';
    h += '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#28a745;">'+aprobados.length+'</div><div style="font-size:11px;color:#28a745;">Prom > 3 · Clasifican</div></div>';
    h += '<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px 16px;text-align:center;"><div style="font-size:22px;font-weight:800;color:#dc3545;">'+pendientes.length+'</div><div style="font-size:11px;color:#dc3545;">Prom ≤ 3 · No clasifican</div></div>';
    h += '</div>';
    
    // Tabla
    h += '<div style="background:white;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;">';
    h += '<div style="max-height:calc(100vh - 500px);overflow-y:auto;-webkit-overflow-scrolling:touch;">';
    
    listaFiltrada.forEach(function(t,i){
      var nit=t.nit||'';
      var prom=parseFloat(t.prom||0);
      var pasaCorte=prom>3;
      var contratos = t.contratos || [];
      
      h += '<div style="border-bottom:1px solid #dee2e6;padding:16px;background:'+(i%2?'#f8f9fa':'white')+';opacity:'+(pasaCorte?'1':'0.6')+'">';
      
      h += '<div style="margin-bottom:12px;">';
      h += '<div style="font-size:16px;font-weight:800;color:#0f172a;margin-bottom:2px;">'+(t.nombre||'—')+'</div>';
      h += '<div style="font-size:12px;color:#475569;font-weight:600;">NIT: '+nit+'</div>';
      h += '<div style="font-size:11px;color:#6c757d;margin-top:4px;">Promedio: <span style="font-weight:800;color:'+(prom>=4?'#dc3545':prom>3?'#fd7e14':'#28a745')+';">'+prom.toFixed(2)+'</span></div>';
      h += '</div>';
      
      if(contratos.length){
        h += '<div style="margin-bottom:12px;padding:10px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:6px;">';
        h += '<div style="font-size:11px;font-weight:800;color:#1e40af;text-transform:uppercase;margin-bottom:8px;">'+contratos.length+' Contrato'+(contratos.length>1?'s':'')+'</div>';
        
        contratos.forEach(function(c, cidx){
          var habC = !!(t.aprobadoPorContrato||{})[c.num];
          h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:'+(cidx<contratos.length-1?'1px solid #dbeafe':'none')+';font-size:11px;">';
          h += '<span style="flex:1;font-weight:600;color:#0f172a;">• '+(c.num||'s/n')+'</span>';
          h += '<button data-sgrt-aprobar-nit="'+String(nit).replace(/"/g,'&quot;')+'" data-sgrt-aprobar-contrato="'+String(c.num||'').replace(/"/g,'&quot;')+'" onclick="window._aprToggleContrato(\''+nit+'\',\''+(c.num||'').replace(/\'/g,"\\\'")+'\')" style="padding:4px 12px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;border:1px solid '+(habC?'#15803d':'#fca5a5')+';background:'+(habC?'#16a34a':'#fef2f2')+';color:'+(habC?'#ffffff':'#991b1b')+';box-shadow:'+(habC?'0 2px 7px rgba(22,163,74,.25)':'none')+';font-family:inherit;white-space:nowrap;margin-right:6px;">'+(habC?'✓ Aprobado':'Aprobar')+'</button>';
          h += '<button onclick="window._verTipologiasContrato(\''+nit+'\',\''+(c.num||'').replace(/\'/g,"\\\\'")+'\')" style="padding:4px 12px;background:#f0f4f8;color:#0f4a8c;border:1px solid #bfdbfe;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Ver Tipologías</button>';
          h += '</div>';
        });
        h += '</div>';
      }
      
      h += '</div>';
    });
    
    h += '</div></div>';
  }
  
  // Actualizar contenedor
  var contenedor = document.getElementById('aprobar-lista-terceros');
  if(contenedor) {
    contenedor.innerHTML = h;
  }
  
  // Actualizar contador
  var info = document.getElementById('aprobar-search-info');
  if(info) {
    info.textContent = 'Mostrando ' + listaFiltrada.length + ' de ' + lista.length + ' tercero' + (lista.length!==1?'s':'');
  }
};

window.tglHab=function(nit){var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};var t=db[nit];if(!t)return;
  var activar=t.habilitado_ac!==true;
  if(activar){
    var valid=window._validarAprobacionSGRT(t,'');
    if(!valid.ok){try{showToast('⚠️ '+valid.msg,'warning',5000);}catch(e){}return;}
  }
  t.habilitado_ac=activar;
  // Sello de aprobación de la clasificación (habilitar = aprobar)
  if(t.habilitado_ac){ 
    t.aprobado_clasif=new Date().toISOString();
    // ⭐ ACTUALIZAR ESTADO A "Aprobado" para que aparezca en Ambiente de Control
    t.estado = 'Aprobado';
    // ⭐ MARCAR COMO HABILITADO PARA AC
    t.habilitado_ac = true;
  } else { 
    delete t.aprobado_clasif;
    // Al desaprobar, volver a "Sin iniciar"
    t.estado = 'Sin iniciar';
    t.habilitado_ac = false;
  }
  
  // ⭐ GUARDAR EN localStorage
  try{ window._lsSave && window._lsSave(); }catch(e){}
  
  // ⭐ AGREGAR LOG DE AUDITORÍA
  try{
    var usr = window.currentUser ? window.currentUser.nombre || window.currentUser.rol : 'Sistema';
    var accion = t.habilitado_ac ? 'APROBÓ CLASIFICACIÓN' : 'DESAPROBÓ CLASIFICACIÓN';
    var desc = t.habilitado_ac 
      ? `${t.nombre} (NIT ${t.nit}) fue habilitado para Ambiente de Control. Promedio: ${(t.prom || 0).toFixed(2)}`
      : `${t.nombre} (NIT ${t.nit}) fue deshabilitado`;
    addLog(usr, 'CLASIFICACION', accion, t.nit, desc, new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}), 'Aprobación');
  }catch(eLog){}
  
  try{ renderAprobarOp(); }catch(e){}
  try{ renderReportesAC && renderReportesAC(); }catch(e){}
  try{ acPoblarSelectorTerceroInstruc && acPoblarSelectorTerceroInstruc(); }catch(e){}
  try{ cargarCuestionarioTercero && cargarCuestionarioTercero(); }catch(e){}
  
  try{showToast((t.habilitado_ac?'Aprobado: ':'No aprobado: ')+t.nombre+' - Reflejado en todos los módulos','success',2500);}catch(e){}
  
  // Al HABILITAR: ventana de confirmación con el siguiente paso del flujo
  if(t.habilitado_ac){ try{ window._modalSiguientePasoAC(nit); }catch(e){} }
};

// ── Ventana "Siguiente paso" tras aprobar/habilitar un tercero ──
window._modalSiguientePasoAC=function(nit){
  var db=window.TERCEROS_DB||{}; var t=db[nit]; if(!t) return;
  var old=document.getElementById('modal-sig-paso-ac'); if(old) old.remove();
  var ov=document.createElement('div');
  ov.id='modal-sig-paso-ac';
  ov.style.cssText='position:fixed;inset:0;background:rgba(15,30,50,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.innerHTML='<div style="background:white;border-radius:12px;max-width:480px;width:100%;padding:22px 24px;box-shadow:0 20px 50px rgba(0,0,0,.3);">'
    +'<div style="font-size:34px;text-align:center;margin-bottom:8px;">✅</div>'
    +'<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:#1a3a5c;text-align:center;margin-bottom:4px;">Clasificación aprobada</div>'
    +'<div style="font-size:12.5px;color:#374151;text-align:center;margin-bottom:6px;"><b>'+t.nombre+'</b> quedó habilitado para la evaluación.</div>'
    +'<div style="font-size:12px;color:#6c757d;text-align:center;margin-bottom:16px;">Siguiente paso: <b>Evaluación Ambiente de Control</b>. También puedes establecer primero qué controles aplican.</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px;">'
    +'<button onclick="window._cerrarModalSigPaso();window._irCuestionarioNit(\''+nit+'\')" style="padding:10px;background:#28a745;color:white;border:none;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;">📋 Ir a Evaluación Ambiente de Control →</button>'
    +'<button onclick="window._cerrarModalSigPaso();window._irControlesAC()" style="padding:10px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:8px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;">⚙️ Establecer controles (Controles AC)</button>'
    +'<button onclick="window._cerrarModalSigPaso()" style="padding:8px;background:none;color:#6c757d;border:none;font-size:11.5px;cursor:pointer;font-family:inherit;">Cerrar y seguir aquí</button>'
    +'</div></div>';
  ov.addEventListener('click',function(ev){ if(ev.target===ov) window._cerrarModalSigPaso(); });
  document.body.appendChild(ov);
};
window._cerrarModalSigPaso=function(){ var m=document.getElementById('modal-sig-paso-ac'); if(m) m.remove(); };

// Navegar al cuestionario AC con el tercero preseleccionado
window._irCuestionarioNit=function(nit){
  var navQ=document.querySelector('.nav-item[onclick*="pg-cuestionario"]');
  if(navQ){ goPage(navQ,'pg-cuestionario'); }
  setTimeout(function(){
    try{ sincronizarSelectorCuestionario(); }catch(e){}
    try{ poblarSelectorACTipologia && poblarSelectorACTipologia(); }catch(e){}
    var sel=document.getElementById('q-tercero');
    if(sel && nit){ sel.value=nit; try{ cargarCuestionarioTercero(); }catch(e){} }
  }, 150);
};
// Navegar a la pantalla Controles AC del Admin
window._irControlesAC=function(){
  var navC=document.querySelector('.nav-item[onclick*="pg-ctrl-op"]');
  if(navC){ goPage(navC,'pg-ctrl-op'); }
  // goPage no ejecuta el mapa de renders de navTo → renderizar explícito
  setTimeout(function(){ try{ window._lsLoad && window._lsLoad(); }catch(e){} try{ renderCtrlOp(); }catch(e){} }, 80);
};

// ── GUARDAR CLASIFICACION con alerta ─────────────────────────────
window.irAlAC = function(){
  var navQ = document.querySelector('.nav-item[onclick*="pg-cuestionario"]');
  if(navQ) { goPage(navQ,'pg-cuestionario'); }
  else { try{showToast('Navegando a Ambiente de Control...','info',2000);}catch(e){} }
};

// ⭐ AUTOGUARDAR CLASIFICACIÓN POR CONTRATO
window._guardarClasifContrato = function(){
  try{
    var nit = (document.getElementById('cf-nit')||{}).value;
    if(!nit || !window.TERCEROS_DB || !window.TERCEROS_DB[nit]) return;
    
    var t = window.TERCEROS_DB[nit];
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    
    // Obtener contrato actual
    var contratoActual = (document.getElementById('cls-contrato-actual') || document.getElementById('cf-contrato-actual') || {}).value;
    if(!contratoActual) contratoActual = t.contratoEval || '';
    
    if(contratoActual) {
      // Recolectar dimensiones actuales
      var dimsCopia = [];
      var cfDimsDiv = document.getElementById('cf-dims-render');
      if(cfDimsDiv) {
        var inputs = cfDimsDiv.querySelectorAll('[data-dim-key]');
        inputs.forEach(function(inp){
          var key = inp.getAttribute('data-dim-key');
          var nombre = inp.getAttribute('data-dim-nombre') || key;
          var val = inp.value || '';
          dimsCopia.push({key:key, nombre:nombre, val:val});
        });
      }
      
      // Guardar las dimensiones de ESTE contrato
      t.dimsPorContrato[contratoActual] = dimsCopia;
      
      // Calcular promedio solo de este contrato
      var sum = 0, count = 0;
      dimsCopia.forEach(function(d){
        if(d.val && !isNaN(d.val)) { sum += parseFloat(d.val); count++; }
      });
      t.promedioPorContrato = t.promedioPorContrato || {};
      t.promedioPorContrato[contratoActual] = count > 0 ? (sum/count).toFixed(2) : '';
      
      // Guardar en localStorage
      try{
        var saved = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
        saved[nit] = t;
        localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(saved));
      }catch(e){}
    }
  }catch(e){console.error('Error autoguardando:', e);}
};

window.guardarClasif = async function(){
  // Validate required fields first
  var requiredFields=['cf-nit','cf-nombre','cf-entidad'];
  var missing=[];
  requiredFields.forEach(function(id){
    var el=document.getElementById(id);
    if(!el||!el.value.trim()) missing.push(el?el.previousElementSibling?.textContent||id:id);
  });
  if(missing.length){
    // try{showToast('⚠ Campos requeridos: '+missing.join(', '),'error',3500);}catch(e){}
    // Highlight missing fields
    requiredFields.forEach(function(id){
      var el=document.getElementById(id);
      if(el&&!el.value.trim()){el.style.borderColor='#dc3545';el.style.background='#fff5f5';}
    });
    return;
  }
  // Reset field styles
  requiredFields.forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.style.borderColor='';el.style.background='';}
  });
  
  // ⭐ AUTOGUARDAR ANTES DE PROCESAR
  window._guardarClasifContrato();
  
  // ⭐ FIX: AWAIT para que saveClasifForm complete ANTES de continuar
  try{await saveClasifForm();}catch(e){console.error('❌ Error en saveClasifForm:', e);}
  
  // ⭐ FIX: Guardar en localStorage DESPUÉS de que saveClasifForm() complete
  // Ahora TERCEROS_DB[nit0] tiene TODOS los campos correctos desde saveClasifForm()
  var nit0=(document.getElementById('cf-nit')||{}).value||'';
  var nom0=(document.getElementById('cf-nombre')||{}).value||'';
  
  if(nit0){
    if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
    
    // ✅ Asegurar que el objeto existe (saveClasifForm ya lo creó con todos los campos)
    if(!TERCEROS_DB[nit0]) {
      TERCEROS_DB[nit0] = {};
    }
    
    console.log('✅ TERCEROS_DB['+nit0+'] después de saveClasifForm:', TERCEROS_DB[nit0]);
    
    // ⭐ GUARDAR EN LOCALSTORAGE CON LA ESTRUCTURA COMPLETA DE saveClasifForm
    try{
      var savedTmp=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      savedTmp[nit0]=TERCEROS_DB[nit0]; // Usa la estructura completa desde saveClasifForm
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(savedTmp));
      console.log('✅ Tercero guardado en localStorage correctamente:', nit0, nom0);
      console.log('  ├─ Nombre:', TERCEROS_DB[nit0].nombre);
      console.log('  ├─ Dims:', TERCEROS_DB[nit0].dims);
      console.log('  └─ Prom:', TERCEROS_DB[nit0].prom);
    }catch(e3){console.error('❌ Error guardando en localStorage:', e3);}
    
    // ⭐ SINCRONIZACIÓN MEJORADA: Primero recarga desde localStorage, luego actualiza selectores
    console.log('🔄 Iniciando sincronización...');
    try{
      // Recargar TERCEROS_DB desde localStorage para asegurar coherencia
      var reloadedDB = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      if(Object.keys(reloadedDB).length > 0) {
        window.TERCEROS_DB = reloadedDB;
        console.log('✅ TERCEROS_DB recargada desde localStorage');
      }
    }catch(eReload){console.error('Error recargando de localStorage:', eReload);}
    
    // Sincronizar tabla de clasificación
    try{
      if(window.clsInitDash && typeof window.clsInitDash === 'function'){
        window.clsInitDash();
        console.log('✅ Tabla de Clasificación actualizada');
      }
      // 🔄 TAMBIÉN RENDERIZAR LA TABLA
      if(window.clsRender && typeof window.clsRender === 'function'){
        window.clsRender();
        console.log('✅ clsRender() ejecutada');
      }
    }catch(eSyncErr){console.error('Error sincronizando CLS_DB:', eSyncErr);}
    
    // Actualizar selector específicamente DESPUÉS de la sincronización
    try{
      if(window._poblarSelectorTerceroClasificar && typeof window._poblarSelectorTerceroClasificar === 'function'){
        window._poblarSelectorTerceroClasificar();
        console.log('✅ Selector de Clasificación poblado');
      }
    }catch(eSelErr){console.error('Error poblando selector:', eSelErr);}
    
    // ⭐ REFRESCO DOBLE: Asegurar que se vea el tercero recién guardado
    setTimeout(function(){
      try{
        console.log('🔄 REFRESCO DOBLE del selector...');
        if(window._poblarSelectorTerceroClasificar && typeof window._poblarSelectorTerceroClasificar === 'function'){
          window._poblarSelectorTerceroClasificar();
          console.log('✅ Selector refrescado una segunda vez');
        }
        // Seleccionar el tercero recién guardado
        var selTercero = document.getElementById('cls-tip-tercero-sel');
        if(selTercero && nit0){
          selTercero.value = nit0;
          console.log('✅ Tercero preseleccionado:', nit0);
        }
      }catch(e){console.error('Error en refresco doble:', e);}
    }, 300);
    
    // El contrato diligenciado en el registro pasa a la lista de contratos del tercero
    try{ window._clsImportarContratoRegistro && window._clsImportarContratoRegistro(nit0); }catch(e4){}
  }
  
  setTimeout(function(){
    window._lsSave();
    // Register this save in the client log
    try{
      if(nit0&&nom0){
        var logs=JSON.parse(localStorage.getItem('sgrt_cli_logs')||'[]');
        logs.push({ts:new Date().toISOString(),accion:'Clasificación guardada',tercero:nom0,nit:nit0,usuario:window.currentUser?.nombre||''});
        if(logs.length>200) logs=logs.slice(-200);
        localStorage.setItem('sgrt_cli_logs',JSON.stringify(logs));
      }
    }catch(e2){}

    var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
    var tiene=Object.values(db).some(function(t){return parseFloat(t.prom||0)>3;});
    var w=document.getElementById('cls-evaluar-wrap'); if(w)w.style.display='none'; // ⭐ Siempre oculto

    // Si no hay tipologías aún → guardar datos básicos y mostrar banner de siguiente paso
    if(!cfDimsAgregadas || !cfDimsAgregadas.length){
      try{showToast('✅ Guardado correctamente','success',800);}catch(e){}
      
      // ✅ El selector ya fue poblado en la sección de sincronización anterior
      try{ if(typeof clsRender==='function') clsRender(); }catch(e){}
      
      // Redireccionar a Clasificación de Terceros
      setTimeout(function(){ 
        try{ navTo(null,'pg-clasificacion'); }catch(e){}
        try{ window._setClasifViewMode('clasificar'); }catch(e){}
      }, 1200);
      // Scroll to the tipologias section
      setTimeout(function(){
        var tipSec = document.getElementById('cls-step2-section') || document.querySelector('.cls-tipologias-wrap') || document.querySelector('[class*=tipolog]');
        if(!tipSec){
          // Find by text content — look for the Paso 2 heading
          document.querySelectorAll('.card-hdr h3, .card-hdr h2, h3, h4').forEach(function(el){
            if(el.textContent.includes('Tipolog') && !tipSec) tipSec = el.closest('.card') || el.parentElement;
          });
        }
        if(tipSec) tipSec.scrollIntoView({behavior:'smooth', block:'start'});
        try{ clsWizardSetStep(2); }catch(e){}
      }, 600);
    } else {
      try{showToast('✅ Clasificación guardada correctamente','success',2500);}catch(e){}
      // Ocultar banner si existe
      var b2=document.getElementById('cf-banner-tipologias'); if(b2) b2.style.display='none';
      // Mostrar banner de siguiente paso → Ambiente de Control
      var bannerAC=document.getElementById('cf-banner-ac');
      if(!bannerAC){
        bannerAC=document.createElement('div'); bannerAC.id='cf-banner-ac';
        var formWrap2=document.querySelector('#pg-clasificacion .card')||document.getElementById('pg-clasificacion');
        if(formWrap2) formWrap2.insertBefore(bannerAC,formWrap2.firstChild);
      }
      bannerAC.style.cssText='background:linear-gradient(90deg,#0d6e3f,#28a745);color:white;padding:14px 20px;border-radius:8px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;';
      var nit2='', nombre2='';
      try{nit2=(document.getElementById('cf-nit')||{}).value||'';nombre2=(document.getElementById('cf-nombre')||{}).value||'';}catch(e){}
      bannerAC.innerHTML='<div style="font-weight:800;font-size:13px;">✅ Guardado · Siguiente paso: <u>Paso 2 — Clasificación de Terceros</u> — asigna las tipologías de riesgo del tercero.</div>'
        +'<button onclick="window._irPaso2Clasif()" style="padding:7px 16px;background:white;color:#0d6e3f;border:none;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;white-space:nowrap;">Ir al Paso 2 →</button>';
    }
    // Refrescar tablas de Información General
    try{ renderIGContratos && renderIGContratos(); }catch(e){}
    try{ loadIGTercerosFull && loadIGTercerosFull(); }catch(e){}
    try{ renderIGProcesos && renderIGProcesos(); }catch(e){}
    try{ filterIGFuncionarios && filterIGFuncionarios(); }catch(e){}
    // ✅ Refrescar tabla de Registros
    try{ clsRender && clsRender(); }catch(e){}
    // ✅ Mostrar banner de "Registrar otro tercero" (solo si no hay dims)
    if(!cfDimsAgregadas || !cfDimsAgregadas.length){
      var bannerOtro = document.getElementById('cls-banner-otro-tercero');
      if(bannerOtro) bannerOtro.style.display = 'block';
    }
  },500);
};

// ✅ NUEVO: Registrar otro tercero — limpiar formulario y volver a "Nuevo Registro"
window.registrarOtroTercero = function(){
  // Ocultar banner
  var bannerOtro = document.getElementById('cls-banner-otro-tercero');
  if(bannerOtro) bannerOtro.style.display = 'none';
  
  // Limpiar formulario completamente
  resetClasifForm(true);
  
  // Volver a tab "Nuevo Registro"
  clsTab('form');
  
  // Scroll al inicio del formulario
  var formEl = document.getElementById('clasif-form-body');
  if(formEl) formEl.scrollIntoView({behavior:'smooth', block:'start'});
};

// Actualizar descripción cuando cambia el selector de tipología en AC
window.acActualizarFiltroDesc = function(){
  var sel=document.getElementById('ac-tip-filtro');
  var tip=sel?sel.value:'';
  var desc=document.getElementById('ac-consultor-desc');
  if(desc){
    if(tip){
      var tips=window.getDBTips(window.getEntidad());
      var tipObj=tips.find(function(t){return t.nombre_tipologia===tip;});
      var nA=tipObj?(tipObj.preguntas||[]).filter(function(p){return p.activo!==false;}).length:0;
      desc.innerHTML='<span style="color:#28a745;font-weight:700;">✓ Tipología seleccionada:</span> <b>'+tip+'</b> — <span style="color:#1e6bb8;font-weight:700;">'+nA+' controles</span> a diligenciar.';
      desc.style.background='#f0fdf4';desc.style.border='1px solid #86efac';desc.style.borderRadius='6px';desc.style.padding='8px 12px';
      
      // ── MOSTRAR/OCULTAR SELECTOR DE CONTRATO según tipología ─────
      var esIndependiente = TIPOLOGIAS_INDEPENDIENTES_CONTRATO.some(function(t){
        return tip.includes(t) || t.includes(tip);
      });
      var wrapContrato = document.getElementById('ac-contrato-wrap');
      if(wrapContrato){
        wrapContrato.style.display = esIndependiente ? 'block' : 'none';
      }
    } else {
      desc.innerHTML='<span style="color:#fd7e14;">⚠ Selecciona una tipología para ver sus preguntas.</span>';
      desc.style.background='#fff7ed';desc.style.border='1px solid #fed7aa';desc.style.borderRadius='6px';desc.style.padding='8px 12px';
      
      // Ocultar selector de contrato si no hay tipología
      var wrapContrato = document.getElementById('ac-contrato-wrap');
      if(wrapContrato){
        wrapContrato.style.display = 'none';
      }
    }
  }
  // Filter sections in q-secciones-wrap by typology
  var wrap=document.getElementById('q-secciones-wrap');
  if(wrap){
    var sections=wrap.querySelectorAll('.card[data-tipnom]');
    if(sections.length>0){
      sections.forEach(function(sec){
        var nom=sec.getAttribute('data-tipnom')||'';
        sec.style.display=(!tip||nom===tip)?'':'none';
      });
    }
  }
};

// Sincronizar selector AC con tipologías activas del operativo
(function(){
  var _origSync=window.sincronizarSelectorCuestionario;
  window.sincronizarSelectorCuestionario=function(){
    if(_origSync)_origSync.apply(this,arguments);
    setTimeout(function(){
      window.poblarSelectorACTipologia && window.poblarSelectorACTipologia();
    },250);
  };
})();

// Override navTo para llamar poblar selector cuando va al cuestionario
(function(){
  var _origNav=window.navTo;
  window.navTo=function(el,pgId){
    _origNav.apply(this,arguments);
    if(pgId==='pg-clasificacion'){
      setTimeout(window.refrescarSelectorTipCliente,150);
    }
    if(pgId==='pg-dashboard'||pgId==='dashboard'){
      setTimeout(function(){try{window.renderCliRegistros&&window.renderCliRegistros();}catch(e){}},300);
    }
    if(pgId==='pg-cuestionario'){
      setTimeout(function(){
        window.poblarSelectorACTipologia && window.poblarSelectorACTipologia();
        try{sincronizarSelectorCuestionario();}catch(e){}
        try{window.acPoblarSelectorTerceroInstruc();}catch(e){}
      },200);
    }
  };
})();


// ── RENDER REGISTROS CLIENTE EN DASHBOARD ──────────────────────────
window.renderCliRegistros = function(){
  var body=document.getElementById('cli-registros-body');
  if(!body) return;
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var ent=window.getEntidad?window.getEntidad():'';
  var lista=Object.values(db).filter(function(t){
    return !ent || (t.entidad||'').toLowerCase().includes(ent.toLowerCase()) || ent.toLowerCase().includes((t.entidad||'').toLowerCase());
  });
  // Also check localStorage for any pending registrations
  try{
    var pendDB=JSON.parse(localStorage.getItem('sgrt_terceros_pending')||'{}');
    Object.values(pendDB).forEach(function(t){
      if(!db[t.nit]) lista.push(t);
    });
  }catch(e){}
  
  if(!lista.length){
    body.innerHTML='<div style="text-align:center;color:var(--muted);padding:30px;">'
      +'<div style="font-size:36px;margin-bottom:8px;">📭</div>'
      +'<div style="font-size:13px;font-weight:600;">Aún no has registrado terceros</div>'
      +'<div style="font-size:12px;margin-top:4px;">Ve a <b>Clasificación de Terceros</b> para registrar tu primer tercero.</div>'
      +'</div>';
    return;
  }
  var zc={'EXTREMO':'#dc3545','ALTO':'#fd7e14','BAJO':'#28a745'};
  var rows=lista.map(function(t,i){
    var prom=parseFloat(t.prom||0);
    var zona=t.zona||t.exposicion||'—';
    var color=zc[zona]||'#aaa';
    var tips=(t.dims||[]).map(function(d){var key=d.key||''; return (window.SECCIONES_INFO&&window.SECCIONES_INFO[key])?window.SECCIONES_INFO[key].label:key;}).join(', ')||'—';
    return '<tr style="border-bottom:1px solid #dee2e6;background:'+(i%2?'#f8f9fa':'white')+'">'
      +'<td style="padding:9px 12px;"><div style="font-weight:700;font-size:13px;color:#1a3a5c;">'+(t.nombre||'—')+'</div>'
      +'<div style="font-size:10.5px;color:#aaa;">'+(t.nit||'')+'</div></td>'
      +'<td style="padding:9px 12px;font-size:11.5px;color:#6c757d;max-width:120px;">'+tips+'</td>'
      +'<td style="padding:9px 12px;text-align:center;font-weight:800;font-size:16px;color:#1a3a5c;">'+(prom>0?prom.toFixed(1):'—')+'</td>'
      +'<td style="padding:9px 12px;"><span style="padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:700;color:white;background:'+color+';">'+zona+'</span></td>'
      +'</tr>';
  }).join('');
  body.innerHTML='<div style="overflow-x:auto;">'
    +'<table style="width:100%;border-collapse:collapse;">'
    +'<thead><tr style="background:#1a3a5c;">'
    +'<th style="padding:9px 12px;font-size:11px;font-weight:700;color:white;text-align:left;">Tercero</th>'
    +'<th style="padding:9px 12px;font-size:11px;font-weight:700;color:white;text-align:left;">Tipologías</th>'
    +'<th style="padding:9px 12px;font-size:11px;font-weight:700;color:white;text-align:center;">Promedio</th>'
    +'<th style="padding:9px 12px;font-size:11px;font-weight:700;color:white;text-align:left;">Exposición</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table></div>';
};

// ── VALIDACIÓN ANTES DE MATRIZ DE RIESGOS ───────────────────────────
window.validarAntesDeMatriz = function(){
  var nit=(document.getElementById('cf-nit')||{}).value||'';
  if(!nit){
    try{showToast('⚠ Primero guarda la clasificación del tercero','error',3000);}catch(e){}
    return false;
  }
  var cr=window.CUEST_RESPUESTAS||{};
  var respTercero=cr[nit]||{};
  if(!Object.keys(respTercero).length){
    // Show modal-like alert
    var msg='⚠️ ATENCIÓN: Debes diligenciar el Ambiente de Control (AC) antes de continuar a la Matriz de Riesgos.\n\n'
      +'Por favor:\n1. Ve a la sección "Ambiente de Control"\n2. Selecciona la tipología\n3. Responde todos los controles\n4. Guarda el cuestionario\n5. Luego regresa a continuar con la Matriz de Riesgos.';
    if(typeof showAlertModal === 'function'){
      showAlertModal(msg);
    } else {
      try{
        var alertBox=document.getElementById('alerta-matriz-aviso');
        if(!alertBox){
          alertBox=document.createElement('div');
          alertBox.id='alerta-matriz-aviso';
          alertBox.style.cssText='position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9999;background:white;border:2px solid #fd7e14;border-radius:12px;padding:24px 28px;max-width:480px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.25);';
          alertBox.innerHTML='<div style="font-size:20px;margin-bottom:8px;">⚠️</div>'
            +'<div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:#1a3a5c;margin-bottom:10px;">Ambiente de Control Pendiente</div>'
            +'<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:16px;">Antes de pasar a la <b>Matriz de Riesgos</b>, debes completar y guardar el <b>Ambiente de Control (AC)</b> para este tercero.</div>'
            +'<div style="font-size:12px;color:#6c757d;background:#f8f9fa;border-radius:6px;padding:10px;margin-bottom:16px;">'
            +'<b>Pasos:</b><br>1. Ir a Ambiente de Control<br>2. Seleccionar tipología<br>3. Responder controles<br>4. Guardar cuestionario</div>'
            +'<button onclick="document.getElementById(\'alerta-matriz-aviso\').remove()" style="width:100%;padding:10px;background:#1a3a5c;color:white;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">Entendido</button>';
          document.body.appendChild(alertBox);
        } else {
          alertBox.style.display='block';
        }
      }catch(e2){}
      try{showToast('⚠ Completa el Ambiente de Control antes de la Matriz','error',4000);}catch(e){}
    }
    return false;
  }
  return true;
};


// ════════════════════════════════════════════════════════════════════
// ADMIN IS — GESTIÓN DE USUARIOS OPERATIVO + CLIENTE
// ════════════════════════════════════════════════════════════════════

// Base de datos de usuarios del sistema (en localStorage)
function getISUsuarios(){
  try{
    var stored=localStorage.getItem('sgrt_is_usuarios');
    if(stored) return JSON.parse(stored);
  }catch(e){}
  // Default users para todas las organizaciones
  return [
    {id:'adm_col_001',nombre:'Admin Colpensiones',login:'admin_colpensiones',rol:'Operativo',entidad:'colpensiones',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes','editar']},
    {id:'eval_col_001',nombre:'Evaluador Colpensiones',login:'evaluador_colpensiones',rol:'Cliente',entidad:'colpensiones',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes']},
    {id:'adm_eco_001',nombre:'Admin Ecopetrol',login:'admin_ecopetrol',rol:'Operativo',entidad:'ecopetrol',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes','editar']},
    {id:'eval_eco_001',nombre:'Evaluador Ecopetrol',login:'evaluador_ecopetrol',rol:'Cliente',entidad:'ecopetrol',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes']},
    {id:'adm_ban_001',nombre:'Admin Bancolombia',login:'admin_bancolombia',rol:'Operativo',entidad:'bancolombia',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes','editar']},
    {id:'eval_ban_001',nombre:'Evaluador Bancolombia',login:'evaluador_bancolombia',rol:'Cliente',entidad:'bancolombia',estado:'Activo',creado:'2026-01-01',ultimo_acceso:null,permisos:['clasificar','cuestionario','reportes']}
  ];
}
function saveISUsuarios(users){
  try{localStorage.setItem('sgrt_is_usuarios',JSON.stringify(users));}catch(e){}
}

window.renderISUsuarios = function(){
  var tbody=document.getElementById('tbody-usuarios');
  var countLbl=document.getElementById('usr-count-lbl');
  if(!tbody) return;

  var users=getISUsuarios().filter(function(u){return u.rol==='Operativo'||u.rol==='Cliente';});
  
  // Mapeo de roles para mostrar
  var rolDisplay={'Operativo':'ADMINISTRADOR DE RIESGOS','Cliente':'EVALUADOR'};
  var rolColors={'Operativo':'#1e6bb8','Cliente':'#28a745'};
  var rolBg={'Operativo':'#eff6ff','Cliente':'#f0fdf4'};
  
  // Apply filters
  var filtEnt=(document.getElementById('usr-filter-entidad')||{}).value||'colpensiones';
  var filtRol=(document.getElementById('usr-filter-rol')||{}).value||'';
  var filtEst=(document.getElementById('usr-filter-estado')||{}).value||'';
  var search=(document.getElementById('usr-search')||{}).value||'';
  users=users.filter(function(u){return u.entidad===filtEnt||u.entidad==='cliente1';});
  if(filtRol) users=users.filter(function(u){return u.rol===filtRol;});
  if(filtEst) users=users.filter(function(u){return u.estado===filtEst;});
  if(search) users=users.filter(function(u){
    return (u.nombre+u.login+u.entidad).toLowerCase().includes(search.toLowerCase());
  });
  
  if(countLbl) countLbl.textContent=users.length+' usuario'+(users.length!==1?'s':'');
  
  if(!users.length){
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px;">No se encontraron usuarios con los filtros aplicados.</td></tr>';
    return;
  }
  
  var rolColors={'ADMINISTRADOR DE RIESGOS':'#1e6bb8','Evaluador':'#28a745'};
  var rolBg={'ADMINISTRADOR DE RIESGOS':'#eff6ff','Evaluador':'#f0fdf4'};
  
  tbody.innerHTML=users.map(function(u,i){
    var displayRol=rolDisplay[u.rol]||u.rol;
    var rolColor=rolColors[displayRol]||'#6c757d';
    var rolBgColor=rolBg[displayRol]||'#f8f9fa';
    var initials=(u.nombre||u.login).substring(0,2).toUpperCase();
    var estadoChip=u.estado==='Activo'
      ?'<span class="chip c-ok">Activo</span>'
      :'<span class="chip c-inac">Inactivo</span>';
    var lastAccess=u.ultimo_acceso
      ?new Date(u.ultimo_acceso).toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
      :'Nunca';
    return '<tr style="background:'+(i%2?'#f8f9fa':'white')+';">'
      +'<td><div style="display:flex;align-items:center;gap:9px;">'
      +'<div style="width:32px;height:32px;border-radius:50%;background:'+rolColor+';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0;">'+initials+'</div>'
      +'<div><div style="font-size:12.5px;font-weight:600;color:var(--navy);">'+u.nombre+'</div>'
      +'<div style="font-size:10.5px;color:var(--muted);">'+u.login+'</div></div></div></td>'
      +'<td><span style="padding:3px 10px;border-radius:12px;font-size:10.5px;font-weight:700;background:'+rolBgColor+';color:'+rolColor+';border:1px solid '+rolColor+'33;">'+displayRol+'</span></td>'
      +'<td style="font-family:monospace;font-size:12px;color:#374151;">'+u.login+'</td>'
      +'<td style="font-size:12px;color:var(--muted);">'+
      (u.entidad==='colpensiones'||u.entidad==='cliente1'?'🏛 Colpensiones':
       u.entidad==='ecopetrol'?'🛢 Ecopetrol':
       u.entidad==='bancolombia'?'🏦 Bancolombia':
       (u.entidad||'—'))+'</td>'
      +'<td>'+estadoChip+'</td>'
      +'<td style="font-size:11px;color:var(--muted);text-align:center;">'+lastAccess+'</td>'
      +'<td style="text-align:center;white-space:nowrap;">'
      +'<button class="btn btn-outline btn-xs" style="margin-right:3px;" onclick="editarISUsuario("+u.id+")">Editar</button>'
      +'<button class="btn btn-xs" style="background:'+(u.estado==='Activo'?'#FEF2F2':'#f0fdf4')+';color:'+(u.estado==='Activo'?'var(--red)':'var(--green)')+';border:1px solid '+(u.estado==='Activo'?'#FCA5A5':'#86efac')+';" onclick="toggleISUsuarioEstado("+u.id+")">'+(u.estado==='Activo'?'Desactivar':'Activar')+'</button>'
      +'<button class="btn btn-xs" style="background:#FEF2F2;color:var(--red);border:1px solid #FCA5A5;margin-left:3px;" onclick="eliminarISUsuario("+u.id+")">Borrar</button>'
      +'</td></tr>';
  }).join('');
};

window.abrirNuevoUsuarioIS = function(){
  var modal=document.getElementById('m-nuevo-usuario-is');
  if(!modal){
    modal=document.createElement('div');
    modal.id='m-nuevo-usuario-is';
    modal.className='overlay';
    var closeId = 'm-nuevo-usuario-is';
    modal.innerHTML=[
      '<div class="modal" style="width:520px;">',
        '<div class="mh">',
          '<h3>&#x2795; Nuevo Usuario</h3>',
          '<button class="mc-btn" onclick="document.getElementById(\'m-nuevo-usuario-is\').classList.remove(\'open\')">&#x2715;</button>',
        '</div>',
        '<div class="mb">',
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">',
            '<div class="field ffull" style="grid-column:span 2;"><label>Nombre completo <span class="req">*</span></label><input type="text" id="nu-nombre" placeholder="Nombre del usuario"></div>',
            '<div class="field"><label>Usuario (login) <span class="req">*</span></label><input type="text" id="nu-login" placeholder="usuario123"></div>',
            '<div class="field"><label>Contrase&ntilde;a <span class="req">*</span></label><input type="password" id="nu-pass" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"></div>',
            '<div class="field"><label>Rol <span class="req">*</span></label>',
              '<select id="nu-rol" onchange="window.nuRolChange()">',
                '<option value="">&#x2014; Seleccionar &#x2014;</option>',
                '<option value="Operativo">ADMINISTRADOR DE RIESGOS</option>',
                '<option value="Cliente">EVALUADOR</option>',
              '</select>',
            '</div>',
            '<div class="field" id="nu-entidad-wrap"><label>Organización <span class="req">*</span></label><input type="text" id="nu-entidad" placeholder="Nombre de la organización"></div>',
          '</div>',
          '<div style="margin-top:14px;padding:12px;background:#f0f9ff;border:1px solid #7dd3fc;border-radius:6px;">',
            '<div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">Permisos</div>',
            '<div id="nu-permisos-wrap" style="display:flex;flex-wrap:wrap;gap:8px;font-size:12px;">',
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="perm-clasificar" checked> Clasificar Terceros</label>',
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="perm-cuestionario" checked> Ambiente de Control</label>',
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="perm-repositorio" checked> Repositorio</label>',
              '<label style="display:flex;align-items:center;gap:5px;cursor:pointer;"><input type="checkbox" id="perm-reportes" checked> Reportes</label>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="mf">',
          '<button class="btn btn-outline" onclick="document.getElementById(\'m-nuevo-usuario-is\').classList.remove(\'open\')">Cancelar</button>',
          '<button class="btn btn-primary" onclick="window.guardarNuevoISUsuario()">Crear Usuario</button>',
        '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
  }
  // Clear form
  ['nu-nombre','nu-login','nu-pass','nu-entidad'].forEach(function(id){
    var el=document.getElementById(id);if(el){el.value='';el.disabled=false;}
  });
  var rolSel=document.getElementById('nu-rol');if(rolSel){rolSel.value='';rolSel.disabled=false;}
  // Reset save button
  var saveBtn=document.querySelector('#m-nuevo-usuario-is .mf .btn-primary');
  if(saveBtn){saveBtn.textContent='Crear Usuario';saveBtn.onclick=function(){window.guardarNuevoISUsuario();};}
  modal.classList.add('open');
};

window.nuRolChange = function(){
  var rol=(document.getElementById('nu-rol')||{}).value;
  var entWrap=document.getElementById('nu-entidad-wrap');
  if(entWrap) entWrap.style.display=(rol==='Cliente')?'block':'block'; // always show
  var permCuest=document.getElementById('perm-cuestionario');
  if(permCuest) permCuest.checked=(rol!=='Cliente'); // only operativo does cuestionario by default
};

window.guardarNuevoISUsuario = function(){
  var nombre=(document.getElementById('nu-nombre')||{}).value||'';
  var login=(document.getElementById('nu-login')||{}).value||'';
  var pass=(document.getElementById('nu-pass')||{}).value||'';
  var rol=(document.getElementById('nu-rol')||{}).value||'';
  var entidad=(document.getElementById('nu-entidad')||{}).value||'';
  if(!nombre||!login||!pass||!rol){
    try{showToast('⚠ Completa todos los campos requeridos','error',2500);}catch(e){} return;
  }
  var users=getISUsuarios();
  if(users.find(function(u){return u.login===login;})){
    try{showToast('⚠ El login ya existe','error',2500);}catch(e){} return;
  }
  var perms=[];
  ['clasificar','cuestionario','repositorio','reportes'].forEach(function(p){
    var el=document.getElementById('perm-'+p);
    if(el&&el.checked) perms.push(p);
  });
  var newUser={
    id:'u_'+Date.now(),
    nombre:nombre.trim(),
    login:login.trim(),
    password:pass,
    rol:rol,
    entidad:entidad.trim(),
    estado:'Activo',
    creado:new Date().toISOString().slice(0,10),
    ultimo_acceso:null,
    permisos:perms
  };
  users.push(newUser);
  saveISUsuarios(users);
  // Log the action
  try{
    var logs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');
    logs.push({ts:new Date().toISOString(),tipo:'usuario_creado',usuario:'admin-IS',detalle:'Nuevo '+rol+': '+nombre+' ('+login+')'});
    localStorage.setItem('sgrt_sys_logs',JSON.stringify(logs));
  }catch(e){}
  document.getElementById('m-nuevo-usuario-is').classList.remove('open');
  window.renderISUsuarios();
  try{showToast('✅ Usuario '+nombre+' creado ('+rol+')','success',3000);}catch(e){}
};

window.toggleISUsuarioEstado = function(id){
  var users=getISUsuarios();
  var u=users.find(function(x){return x.id===id;});
  if(!u)return;
  u.estado=(u.estado==='Activo')?'Inactivo':'Activo';
  saveISUsuarios(users);
  window.renderISUsuarios();
  try{showToast((u.estado==='Activo'?'✅ Activado: ':'⛔ Desactivado: ')+u.nombre,'success',2000);}catch(e){}
};

window.eliminarISUsuario = function(id){
  if(!confirm('¿Seguro que deseas eliminar este usuario?')) return;
  var users=getISUsuarios().filter(function(u){return u.id!==id;});
  saveISUsuarios(users);
  window.renderISUsuarios();
  try{showToast('Usuario eliminado','success',2000);}catch(e){}
};

window.editarISUsuario = function(id){
  var users=getISUsuarios();
  var u=users.find(function(x){return x.id===id;});
  if(!u){try{showToast('Usuario no encontrado','error',2000);}catch(e){}return;}
  // Reuse the new user modal for editing
  window.abrirNuevoUsuarioIS();
  setTimeout(function(){
    var el=document.getElementById('nu-nombre');if(el)el.value=u.nombre;
    el=document.getElementById('nu-login');if(el){el.value=u.login;el.disabled=true;}
    el=document.getElementById('nu-pass');if(el)el.placeholder='(sin cambios)';
    el=document.getElementById('nu-rol');if(el){el.value=u.rol;el.disabled=true;}
    el=document.getElementById('nu-entidad');if(el)el.value=u.entidad||'';
    (u.permisos||[]).forEach(function(p){
      var pEl=document.getElementById('perm-'+p);if(pEl)pEl.checked=true;
    });
    // Change save button to update
    var saveBtn=document.querySelector('#m-nuevo-usuario-is .mf .btn-primary');
    if(saveBtn){saveBtn.textContent='Actualizar';saveBtn.onclick=function(){
      var pass=(document.getElementById('nu-pass')||{}).value||'';
      var entidad=(document.getElementById('nu-entidad')||{}).value||u.entidad;
      u.entidad=entidad.trim();
      if(pass&&pass!=='(sin cambios)') u.password=pass;
      saveISUsuarios(users);
      document.getElementById('nu-login').disabled=false;
      document.getElementById('nu-rol').disabled=false;
      document.getElementById('m-nuevo-usuario-is').classList.remove('open');
      window.renderISUsuarios();
      try{showToast('✅ Usuario actualizado','success',2000);}catch(e){}
    };}
  },100);
};

// ── LOGS DEL SISTEMA IS ────────────────────────────────────────────
window.renderISLogs = function(){
  var pg=document.getElementById('admin-pg-logs');
  if(!pg) return;
  
  // Get logs from multiple sources
  var sysLogs=[];
  try{sysLogs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');}catch(e){}
  var cliLogs=[];
  try{cliLogs=JSON.parse(localStorage.getItem('sgrt_cli_logs')||'[]');}catch(e){}
  
  // Convert client logs to system log format
  cliLogs.forEach(function(l){
    sysLogs.push({ts:l.ts,tipo:'clasificacion',usuario:l.usuario||'cliente',rol:'Cliente',detalle:l.accion+' — '+l.tercero+' ('+l.nit+')'});
  });
  
  // Add some default system events if logs are empty
  if(!sysLogs.length){
    sysLogs=[
      {ts:new Date().toISOString(),tipo:'sistema',usuario:'Sistema',rol:'Sistema',detalle:'Sistema SGRT iniciado'},
      {ts:new Date(Date.now()-3600000).toISOString(),tipo:'login',usuario:'operativo',rol:'Operativo',detalle:'Inicio de sesión exitoso'},
      {ts:new Date(Date.now()-7200000).toISOString(),tipo:'login',usuario:'cliente1',rol:'Cliente',detalle:'Inicio de sesión exitoso'},
    ];
  }
  
  // Sort desc
  sysLogs.sort(function(a,b){return new Date(b.ts)-new Date(a.ts);});
  
  // Apply filters
  var filtTipo=(document.getElementById('log-filter-tipo')||{}).value||'';
  var filtRol=(document.getElementById('log-filter-rol')||{}).value||'';
  var search=(document.getElementById('log-search')||{}).value||'';
  
  var filtered=sysLogs;
  if(filtTipo) filtered=filtered.filter(function(l){return (l.tipo||'').includes(filtTipo);});
  if(filtRol) filtered=filtered.filter(function(l){return l.rol===filtRol;});
  if(search) filtered=filtered.filter(function(l){
    return (l.usuario+l.detalle+l.tipo).toLowerCase().includes(search.toLowerCase());
  });
  
  // Find logs table body in admin-pg-logs
  var logBody=pg.querySelector('#tbody-logs-is');
  if(!logBody){
    // Create the table if not exists
    var tableWrap=pg.querySelector('#admin-logs-body');
    if(tableWrap){
      tableWrap.innerHTML='<div style="overflow-x:auto;">'
        +'<table><thead><tr><th>Fecha/Hora</th><th>Tipo</th><th>Usuario</th><th>Rol</th><th>Detalle</th></tr></thead>'
        +'<tbody id="tbody-logs-is"></tbody></table></div>'
        +'<div id="log-count-is" style="font-size:11.5px;color:var(--muted);padding:8px 12px;border-top:1px solid var(--border);text-align:right;"></div>';
      logBody=pg.querySelector('#tbody-logs-is');
    }
  }
  
  var tipoColors={login:'#1e6bb8',clasificacion:'#28a745',cuestionario:'#fd7e14',matriz:'#dc3545',evidencia:'#17a2b8',sistema:'#6c757d',usuario_creado:'#7c3aed'};
  
  if(logBody){
    if(!filtered.length){
      logBody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:30px;">No hay logs con los filtros aplicados.</td></tr>';
    } else {
      logBody.innerHTML=filtered.slice(0,200).map(function(l,i){
        var dt=new Date(l.ts);
        var fecha=dt.toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'});
        var hora=dt.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        var tipo=l.tipo||'evento';
        var color=tipoColors[tipo]||'#6c757d';
        return '<tr style="background:'+(i%2?'#f8f9fa':'white')+'">'
          +'<td style="font-size:11px;white-space:nowrap;"><div>'+fecha+'</div><div style="color:var(--muted);">'+hora+'</div></td>'
          +'<td><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+color+';white-space:nowrap;">'+tipo+'</span></td>'
          +'<td style="font-size:12px;font-weight:600;color:var(--navy);">'+(l.usuario||'—')+'</td>'
          +'<td style="font-size:11.5px;color:var(--muted);">'+(l.rol||'—')+'</td>'
          +'<td style="font-size:12px;max-width:350px;">'+(l.detalle||'—')+'</td>'
          +'</tr>';
      }).join('');
    }
    var countEl=pg.querySelector('#log-count-is');
    if(countEl) countEl.textContent='Mostrando '+Math.min(filtered.length,200)+' de '+filtered.length+' registros';
  }
};

// Auto-call renderISUsuarios and renderISLogs when admin navigates to those pages
(function(){
  var origGoPage=window.goPage;
  window.goPage=function(el,pgId){
    if(origGoPage) origGoPage.apply(this,arguments);
    if(pgId==='pg-usuarios') setTimeout(window.renderISUsuarios,100);
    if(pgId==='pg-logs') setTimeout(window.renderISLogs,100);
  };
})();

console.log('SGRT v3 listo | 3 roles: IS/Operativo/Cliente | iseguras2026/ISEGURAS_2026 | admin_riesgos/Admin2026* | evaluador/Eval2026*');

// ── STUBS DE COMPATIBILIDAD ─────────────────────────────────────
if(typeof window.sendNotification === 'undefined'){
  window.sendNotification = function(tipo, titulo, desc, data){
    try{
      var logs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');
      logs.push({ts:new Date().toISOString(),tipo:tipo||'notif',usuario:(window.currentUser||{}).username||'sistema',rol:(window.currentUser||{}).rol||'—',detalle:titulo+(desc?' — '+desc:'')});
      if(logs.length>200)logs=logs.slice(-200);
      localStorage.setItem('sgrt_sys_logs',JSON.stringify(logs));
    }catch(e){}
    // Alimentar también el panel visual de notificaciones (🔔) — antes esto
    // solo quedaba en el log técnico que únicamente ve el Super Administrador.
    try{
      window.NOTIF_LOG = window.NOTIF_LOG || [];
      window.NOTIF_LOG.unshift({
        id: Date.now()+'_'+Math.random().toString(36).slice(2,7),
        tipo: tipo||'notif', titulo: titulo||'', desc: desc||'',
        data: data||{}, fecha: new Date().toISOString(), leida: false,
        usuario: (window.currentUser||{}).name||'—'
      });
      if(window.NOTIF_LOG.length>80) window.NOTIF_LOG.length=80;
      window.renderNotifPanel && window.renderNotifPanel();
      window._lsSave && window._lsSave();
    }catch(e){}
  };
}
// El botón 🔔 y su panel ya existían en el HTML pero nunca se habían implementado
// estas tres funciones — por eso no "servían" al diligenciar o modificar algo.
window.renderNotifPanel = function(){
  var lista = window.NOTIF_LOG || [];
  var badge = document.getElementById('notif-badge');
  if(badge){
    var noLeidas = lista.filter(function(n){return !n.leida;}).length;
    if(noLeidas>0){ badge.style.display='flex'; badge.textContent = noLeidas>9?'9+':noLeidas; }
    else { badge.style.display='none'; }
  }
  var panel = document.getElementById('notif-panel');
  if(!panel) return;
  if(!lista.length){
    panel.innerHTML='<div style="text-align:center;padding:30px;color:#6c757d;font-size:13px;">Sin notificaciones aún</div>';
    return;
  }
  var iconos={login:'🔑',riesgo:'⚠️',riesgo_critico:'🔴',seguimiento:'📋',cuestionario:'📝',clasificacion:'🏢',informe:'📎',alerta:'🔔'};
  panel.innerHTML = lista.slice(0,50).map(function(n){
    var icon = iconos[n.tipo]||'🔔';
    var f = new Date(n.fecha);
    var fechaStr = isNaN(f.getTime()) ? '' : f.toLocaleString('es-CO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
    return '<div style="padding:10px 16px;border-bottom:1px solid #f0f0f0;'+(n.leida?'':'background:#F0F7FF;')+'display:flex;gap:10px;align-items:flex-start;">'
      +'<div style="font-size:16px;flex-shrink:0;">'+icon+'</div>'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:12px;font-weight:700;color:#1a3a5c;">'+n.titulo+'</div>'
      +(n.desc?'<div style="font-size:11px;color:#6c757d;margin-top:1px;">'+n.desc+'</div>':'')
      +'<div style="font-size:10px;color:#aaa;margin-top:3px;">'+fechaStr+' · '+(n.usuario||'')+'</div>'
      +'</div></div>';
  }).join('');
};
window.toggleNotifDrawer = function(target){
  var drawer = document.getElementById('notif-drawer');
  if(!drawer) return;
  var abierto = drawer.style.display !== 'none';
  // Cerrar al hacer clic afuera
  document.querySelectorAll('.overlay.active').forEach(function(){});
  drawer.style.display = abierto ? 'none' : 'block';
  if(!abierto){
    (window.NOTIF_LOG||[]).forEach(function(n){ n.leida=true; });
    window.renderNotifPanel();
    try{ window._lsSave && window._lsSave(); }catch(e){}
  }
};
document.addEventListener('click', function(e){
  var drawer = document.getElementById('notif-drawer');
  var btn = document.getElementById('notif-btn');
  if(!drawer || drawer.style.display==='none') return;
  if(drawer.contains(e.target) || (btn && btn.contains(e.target))) return;
  drawer.style.display='none';
});
if(typeof window.cargarTercerosPendientesDesdeAPI === 'undefined'){
  window.cargarTercerosPendientesDesdeAPI = function(){ /* offline mode */ };
}
if(typeof window.cargarTercerosDesdeAPI === 'undefined'){
  window.cargarTercerosDesdeAPI = function(){ /* offline mode */ };
}

// ── NAVEGACIÓN ADMIN IS ────────────────────────────────────────
window.goPageIS = function(pgId){
  var adminEl = document.getElementById('admin-app');
  if(!adminEl) return;
  // Hide all pages in admin
  adminEl.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var pg = document.getElementById(pgId);
  if(pg) pg.classList.add('active');
  // Update nav active state
  adminEl.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  // Find the nav item that triggered this
  adminEl.querySelectorAll('.nav-item').forEach(function(n){
    if((n.getAttribute('onclick')||'').includes(pgId)) n.classList.add('active');
  });
  // Load data for the page
  var loaders = {
    'admin-pg-dashboard':          function(){try{window.onDashboardLoad();initAdminDashboardIS();}catch(e){}},
    'admin-pg-usuarios':           function(){try{window.renderISUsuarios();}catch(e){}},
    'admin-pg-logs':               function(){try{window.renderISLogs();}catch(e){}},
    'admin-pg-repo':               function(){try{adminOdInit();}catch(e){}},
    'admin-pg-entidades':          function(){try{window.renderEntidadesIS();}catch(e){}},
    'admin-pg-reportes-entidad':   function(){try{window.renderReportesPorEntidad();}catch(e){}},
    'admin-pg-config-bd':          function(){try{window.actualizarConfigBD();}catch(e){}},
    'pg-reportes-entidad':         function(){try{window.renderReportesPorEntidadOp();}catch(e){}}
  };
  if(loaders[pgId]) setTimeout(loaders[pgId], 80);
};

// ── ABRIDOR ROBUSTO: REPORTES Y POWER BI DEL ADMINISTRADOR ─────
// La página operativa se conserva con su mismo markup, pero el HTML histórico
// la dejó dentro del shell de IS. Al hacer clic como Administrador de Riesgos
// se garantiza que quede dentro del .main-content visible del shell operativo.
window.abrirReportesPowerBIAdmin = function(el){
  var rol = (window.currentUser||{}).rol || '';
  var esAdminRiesgos = rol==='Operativo' || rol==='admin_riesgos' || rol==='Administrador de Riesgos';
  if(!esAdminRiesgos) return;

  var appEl = document.getElementById('app');
  var mainEl = appEl ? appEl.querySelector('.main-content') : null;
  var page = document.getElementById('pg-reportes-entidad');
  if(page && mainEl && page.parentElement !== mainEl){
    mainEl.appendChild(page);
  }

  try{ window.navTo && window.navTo(el,'pg-reportes-entidad'); }catch(eNav){
    if(page){
      document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
      page.classList.add('active');
    }
  }

  // Reforzar tras la navegación y después de _lsLoad para cubrir el clic
  // normal, incluida la primera entrada después de iniciar sesión.
  [0,100,350,800].forEach(function(delay){
    setTimeout(function(){
      var currentRole = (window.currentUser||{}).rol || '';
      if(currentRole!=='Operativo' && currentRole!=='admin_riesgos' && currentRole!=='Administrador de Riesgos') return;
      var pg = document.getElementById('pg-reportes-entidad');
      var mc = document.getElementById('app')?.querySelector('.main-content');
      if(pg && mc && pg.parentElement !== mc) mc.appendChild(pg);
      if(pg){ pg.classList.add('active'); pg.style.display='block'; }
      try{ window._lsLoad && window._lsLoad(); }catch(eLoad){}
      try{ window.renderReportesPorEntidadOp && window.renderReportesPorEntidadOp(); }catch(eRender){ console.warn('Reportes Power BI Admin:',eRender); }
    },delay);
  });
};

window.initAdminDashboardIS = function(){
  var dh = document.getElementById('admin-dash-fecha-hoy');
  if(dh) dh.textContent = new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var wl = document.getElementById('admin-dash-welcome');
  if(wl && window.currentUser) wl.textContent = 'Bienvenido, ' + currentUser.name;
  // KPIs
  var users = window.getISUsuarios ? window.getISUsuarios() : [];
  var ops = users.filter(function(u){return u.rol==='Operativo'&&u.estado==='Activo';}).length;
  var cls = users.filter(function(u){return u.rol==='Cliente'&&u.estado==='Activo';}).length;
  var terceros = Object.keys(window.TERCEROS_DB||{}).length;
  var logs = [];
  try{logs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');}catch(e){}
  var hoy = new Date().toISOString().slice(0,10);
  var logsHoy = logs.filter(function(l){return l.ts&&l.ts.slice(0,10)===hoy;}).length;
  function s(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  s('kpi-op-activos',ops); s('kpi-cl-activos',cls);
  s('kpi-logs-hoy',logsHoy); s('admin-kpi-terceros',terceros);
  s('admin-kpi-terceros2',terceros); s('admin-kpi-usuarios',users.length);
  // Actividad reciente
  var body = document.getElementById('admin-dash-actividad');
  if(body){
    var recent = logs.slice(-8).reverse();
    if(!recent.length){body.innerHTML='<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px;">Sin actividad registrada aún.</div>';return;}
    body.innerHTML='<table style="width:100%;border-collapse:collapse;">'+
      '<thead><tr><th>Fecha/Hora</th><th>Tipo</th><th>Usuario</th><th>Detalle</th></tr></thead><tbody>'+
      recent.map(function(l,i){
        var dt=new Date(l.ts||Date.now());
        var col={login:'#1e6bb8',clasificacion:'#28a745',cuestionario:'#fd7e14',usuario_creado:'#7c3aed'}[l.tipo||'']||'#6c757d';
        return '<tr style="background:'+(i%2?'#f8f9fa':'white')+'">'+
          '<td style="font-size:11px;padding:8px 12px;white-space:nowrap;">'+dt.toLocaleDateString('es-CO')+' '+dt.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})+'</td>'+
          '<td style="padding:8px 12px;"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+col+';">'+(l.tipo||'—')+'</span></td>'+
          '<td style="padding:8px 12px;font-size:12px;font-weight:600;color:var(--navy);">'+(l.usuario||'—')+'</td>'+
          '<td style="padding:8px 12px;font-size:12px;max-width:300px;">'+(l.detalle||'—')+'</td>'+
          '</tr>';
      }).join('')+'</tbody></table>';
  }
};

window.exportISLogs = function(){
  var logs=[];
  try{logs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');}catch(e){}
  var cliLogs=[];
  try{cliLogs=JSON.parse(localStorage.getItem('sgrt_cli_logs')||'[]');}catch(e){}
  cliLogs.forEach(function(l){logs.push({ts:l.ts,tipo:'clasificacion',usuario:l.usuario||'cliente',rol:'Cliente',detalle:l.accion+' — '+l.tercero});});
  logs.sort(function(a,b){return new Date(b.ts)-new Date(a.ts);});
  var csv='Fecha,Tipo,Usuario,Rol,Detalle\n'+logs.map(function(l){
    return [l.ts,l.tipo||'',l.usuario||'',l.rol||'','"'+(l.detalle||'').replace(/"/g,"''")+'"'].join(',');
  }).join('\n');
  var a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='logs_sgrt_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
};

// Repositorio IS (usa la misma estructura odFS pero sin el widget cliente)
var _adminOdPath=[];
window.adminOdInit = function(){
  try{
    var s=localStorage.getItem('od_sgrt_v8');
    var fs=s?JSON.parse(s):null;
    if(!fs)fs={id:'root',type:'folder',children:[]};
    _adminOdPath=[];
    window.adminOdRender(fs);
  }catch(e){}
};
window.adminOdRender = function(fs){
  var grid=document.getElementById('admin-od-grid');
  var bc=document.getElementById('admin-od-bc');
  if(!grid||!bc) return;
  var s=localStorage.getItem('od_sgrt_v8')||'{}';
  var kb=Math.round(s.length/1024);
  var lbl=document.getElementById('admin-od-uso-lbl');
  if(lbl) lbl.textContent='Usando: '+(kb>1024?(kb/1024).toFixed(1)+'MB':kb+'KB');
  var fsObj=null;
  try{fsObj=JSON.parse(s);}catch(e){fsObj={id:'root',type:'folder',children:[]};}
  // Navigate to current path
  var cur=fsObj;
  _adminOdPath.forEach(function(seg){cur=(cur.children||[]).find(function(c){return c.id===seg.id;})||cur;});
  // Breadcrumb
  var b='<span onclick="window.adminOdNav(-1)" style="cursor:pointer;color:#1e6bb8;font-weight:700;padding:3px 8px;background:#eff6ff;border-radius:4px;">🏠 Inicio</span>';
  _adminOdPath.forEach(function(seg,i){b+=' / <span onclick="window.adminOdNav('+i+')" style="cursor:pointer;color:#1e6bb8;padding:3px 8px;background:#eff6ff;border-radius:4px;">'+seg.name+'</span>';});
  bc.innerHTML=b;
  var kids=cur.children||[];
  if(!kids.length){grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:#aaa;border:2px dashed #dee2e6;border-radius:8px;">Carpeta vacía</div>';return;}
  grid.innerHTML=kids.map(function(item){
    var isFolder=item.type==='folder';
    var eid=encodeURIComponent(item.id||'');
    return '<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:12px;cursor:pointer;text-align:center;" data-item-id="'+eid+'" ondblclick="window.adminOdClickId(this)">'+
      '<div style="font-size:32px;margin-bottom:6px;">'+(isFolder?'📁':'📄')+'</div>'+
      '<div style="font-size:11.5px;font-weight:600;word-break:break-word;">'+item.name+'</div>'+
      (item.size?'<div style="font-size:10px;color:#aaa;margin-top:3px;">'+Math.round(item.size/1024)+'KB</div>':'')+
      '</div>';
  }).join('');
};
window.adminOdNav=function(idx){_adminOdPath=idx<0?[]:_adminOdPath.slice(0,idx+1);window.adminOdInit();};
window.adminOdClickId=function(el){
  var id=decodeURIComponent(el.getAttribute('data-item-id')||'');
  window.adminOdClick(id);
};
window.adminOdClick=function(id){
  var s=localStorage.getItem('od_sgrt_v8')||'{}';
  try{var fs=JSON.parse(s);var cur=fs;_adminOdPath.forEach(function(seg){cur=(cur.children||[]).find(function(c){return c.id===seg.id;})||cur;});
  var item=(cur.children||[]).find(function(c){return c.id===id;});
  if(item&&item.type==='folder'){_adminOdPath.push({id:item.id,name:item.name});window.adminOdInit();}
  else if(item&&item.dataURL){var a=document.createElement('a');a.href=item.dataURL;a.download=item.name;a.click();}
  }catch(e){}
};
window.adminOdNuevaCarpeta=function(){var n=prompt('Nombre de la carpeta:');if(!n||!n.trim())return;
  var s=localStorage.getItem('od_sgrt_v8')||'{}';var fs=JSON.parse(s);
  var cur=fs;_adminOdPath.forEach(function(seg){cur=(cur.children||[]).find(function(c){return c.id===seg.id;})||cur;});
  cur.children=cur.children||[];cur.children.push({id:'af_'+Date.now(),name:n.trim(),type:'folder',children:[]});
  localStorage.setItem('od_sgrt_v8',JSON.stringify(fs));window.adminOdInit();
};
window.adminOdSubir=function(files){
  if(!files||!files.length)return;
  var s=localStorage.getItem('od_sgrt_v8')||'{}';var fs=JSON.parse(s);
  var cur=fs;_adminOdPath.forEach(function(seg){cur=(cur.children||[]).find(function(c){return c.id===seg.id;})||cur;});
  cur.children=cur.children||[];
  var count=0;
  Array.from(files).forEach(function(file){
    var reader=new FileReader();
    reader.onload=function(e){
      cur.children.push({id:'af_'+Date.now(),name:file.name,type:'file',size:file.size,fecha:new Date().toLocaleDateString('es-CO'),dataURL:e.target.result});
      count++;
      if(count===files.length){localStorage.setItem('od_sgrt_v8',JSON.stringify(fs));window.adminOdInit();try{showToast(count+' archivo(s) subido(s)','success',2000);}catch(e){}}
    };
    reader.readAsDataURL(file);
  });
};

// ══════════════════════════════════════════════════════════════════
// SELECTOR DE TERCERO EN INSTRUCCIONES + PROGRESO POR TIPOLOGÍA
// ══════════════════════════════════════════════════════════════════

window.acPoblarSelectorTerceroInstruc = function(){
  // ⭐ RECARGAR DATOS PRIMERO
  try{ window._lsLoad && window._lsLoad(); }catch(e){}
  try{
    var _sv2=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(_sv2).length) Object.assign(TERCEROS_DB, _sv2);
  }catch(e){}
  
  var sel = document.getElementById('ac-tercero-instruc');
  if(!sel) return;
  var currentVal = sel.value || '';

  sel.innerHTML = '<option value="">— Selecciona un tercero —</option>';

  // Build list from TERCEROS_DB + tercerosPendientesCuestionario
  var db = window.TERCEROS_DB || {};
  var pend = window.tercerosPendientesCuestionario || [];
  var seen = {};
  var lista = [];

  // ⭐ MOSTRAR TERCEROS APROBADOS (aprobado_clasif = true O habilitado_ac = true)
  Object.values(db).forEach(function(t){
    if(!t || !t.nit) return;
    // Mostrar si está aprobado en clasificación O si el estado es Aprobado
    if((t.aprobado_clasif || t.habilitado_ac || (t.estado && t.estado.toLowerCase().includes('aprobado'))) && !seen[t.nit]){
      seen[t.nit]=true;
      lista.push({nit:t.nit, nombre:t.nombre||t.nit, prom:t.prom||0, estado:t.estado});
    }
  });
  pend.forEach(function(t){
    if(!t || !t.nit) return;
    if((t.aprobado_clasif || t.habilitado_ac) && !seen[t.nit]){
      seen[t.nit]=true;
      lista.push({nit:t.nit, nombre:t.nombre||t.nit, prom:t.prom||0, estado:t.estado});
    }
  });

  // Also sync q-tercero hidden
  var qSel = document.getElementById('q-tercero');

  if(lista.length > 0){
    lista.forEach(function(t){
      var txt = t.nombre + ' (' + parseFloat(t.prom).toFixed(2) + ')';
      var o = document.createElement('option');
      o.value = t.nit; o.textContent = txt;
      sel.appendChild(o);
      if(qSel && !qSel.querySelector('option[value="'+t.nit+'"]')){
        var o2 = document.createElement('option');
        o2.value = t.nit; o2.textContent = txt;
        qSel.appendChild(o2);
      }
    });
  } else {
    // Fallback examples so the selector is never empty
    [].forEach(function(ex){
      var o = document.createElement('option');
      o.value = ex.v; o.textContent = ex.t; o.setAttribute('data-ejemplo','1');
      sel.appendChild(o);
    });
  }

  if(currentVal) sel.value = currentVal;
  
  // ⭐ NUEVO: Al cargar el selector, si hay un tercero seleccionado, cargar sus supervisores/contratos
  if(currentVal) {
    window.acCargarSupervisoresYContratos(currentVal);
  }
};

// ⭐ NUEVA FUNCIÓN: Cargar supervisores y contratos del tercero seleccionado
window.acCargarSupervisoresYContratos = function(nit) {
  console.log('[AC] 📋 Cargando supervisores y contratos para:', nit);
  
  var tercero = window.TERCEROS_DB[nit];
  if(!tercero) {
    console.warn('[AC] ⚠️ Tercero no encontrado:', nit);
    return;
  }
  
  // Contenedor de supervisores
  var supWrap = document.getElementById('ac-supervisores-wrap');
  if(!supWrap) {
    console.warn('[AC] ⚠️ Elemento ac-supervisores-wrap no encontrado');
    return;
  }
  
  // Contenedor de contratos
  var contWrap = document.getElementById('ac-contratos-wrap');
  if(!contWrap) {
    console.warn('[AC] ⚠️ Elemento ac-contratos-wrap no encontrado');
    return;
  }
  
  var html_sup = '';
  var html_cont = '';
  
  // SUPERVISORES
  var supervisores = tercero.supervisores || [];
  console.log('[AC] 👤 Supervisores encontrados:', supervisores.length);
  
  if(supervisores.length > 0) {
    supervisores.forEach(function(sup, idx) {
      html_sup += '<div style="padding:10px 12px;background:white;border:1px solid #d1fae5;border-radius:6px;margin-bottom:6px;">';
      html_sup += '<div style="font-weight:600;color:#0f172a;">👤 ' + (sup.nombre || '—') + '</div>';
      html_sup += '<div style="font-size:11px;color:#475569;margin-top:4px;">📌 Cargo: ' + (sup.cargo || '—') + '</div>';
      html_sup += '<div style="font-size:11px;color:#475569;margin-top:2px;">🔗 Proceso: ' + (sup.proceso || '—') + '</div>';
      html_sup += '</div>';
    });
  } else {
    html_sup = '<div style="padding:10px;color:#6c757d;font-size:12px;font-style:italic;">Sin supervisores asignados</div>';
  }
  
  // CONTRATOS
  var contratos = tercero.contratos || [];
  console.log('[AC] 📋 Contratos encontrados:', contratos.length);
  
  if(contratos.length > 0) {
    contratos.forEach(function(cont, idx) {
      html_cont += '<div style="padding:10px 12px;background:white;border:1px solid #bfdbfe;border-radius:6px;margin-bottom:6px;">';
      html_cont += '<div style="font-weight:600;color:#0f172a;">📋 ' + (cont.num || '—') + '</div>';
      html_cont += '<div style="font-size:11px;color:#475569;margin-top:4px;">Objeto: ' + (cont.objeto || '—') + '</div>';
      html_cont += '<div style="font-size:11px;color:#475569;margin-top:2px;">Período: ' + (cont.fini || '—') + ' a ' + (cont.ffin || '—') + '</div>';
      html_cont += '<div style="font-size:11px;color:#475569;margin-top:2px;">Estado: ' + (cont.estado || '—') + '</div>';
      html_cont += '</div>';
    });
  } else {
    html_cont = '<div style="padding:10px;color:#6c757d;font-size:12px;font-style:italic;">Sin contratos asociados</div>';
  }
  
  supWrap.innerHTML = html_sup;
  contWrap.innerHTML = html_cont;
  console.log('[AC] ✅ Datos cargados exitosamente');
};

// ⭐ Evento para cargar datos cuando selecciona tercero en Evaluador
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var selTercero = document.getElementById('ac-tercero-instruc');
    if(selTercero) {
      selTercero.removeEventListener('change', function(){});
      selTercero.addEventListener('change', function() {
        window.acCargarSupervisoresYContratos(this.value);
      });
      console.log('[AC] ✅ Event listener agregado para cargar supervisores/contratos');
    }
  }, 500);
});

// ── ADMIN: BORRAR TODOS LOS DATOS ────────────────────────────────
window.adminBorrarTodosDatos = function(){
  // First confirmation
  if(!confirm('⚠️ ¿Estás seguro de que quieres BORRAR TODOS LOS DATOS del sistema?\n\nEsto eliminará:\n• Todos los terceros registrados\n• Todos los cuestionarios y respuestas\n• Todos los borradores guardados\n• Repositorio de evidencias\n• Logs del sistema\n\nEsta acción NO se puede deshacer.')) return;
  // Second confirmation
  if(!confirm('🔴 ÚLTIMA CONFIRMACIÓN\n\n¿Confirmas el borrado total e irreversible de todos los datos?')) return;

  try{
    // Clear all known localStorage keys
    var keysToRemove = [];
    for(var i=0; i<localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && (
        k.startsWith('sgrt_') ||
        k.startsWith('cuest_') ||
        k.startsWith('tip_custom_') ||
        k.startsWith('od_') ||
        k === 'od_sgrt_v8' ||
        k === 'sgrt_sys_logs' ||
        k === 'sgrt_cli_logs' ||
        k === 'sgrt_terceros_pending'
      )) keysToRemove.push(k);
    }
    keysToRemove.forEach(function(k){ localStorage.removeItem(k); });

    // Reset in-memory data
    if(window.TERCEROS_DB) window.TERCEROS_DB = {};
    if(window.CUEST_RESPUESTAS) window.CUEST_RESPUESTAS = {};
    if(window.CUEST_CTRL_CUSTOM) window.CUEST_CTRL_CUSTOM = {};
    if(window.tercerosPendientesCuestionario) window.tercerosPendientesCuestionario = [];
    if(window.TIPOLOGIAS_DB_CUSTOM) window.TIPOLOGIAS_DB_CUSTOM = {};

    // Re-save empty state
    try{ window._lsSave && window._lsSave(); } catch(e){}

    // Refresh UI
    try{ window.renderAdminDash && window.renderAdminDash(); } catch(e){}
    try{ sincronizarSelectorCuestionario(); } catch(e){}
    try{ window.acPoblarSelectorTerceroInstruc(); } catch(e){}

    try{ showToast('✅ Todos los datos han sido eliminados','success',4000); } catch(e){}
    // Reload after short delay to fully reset
    setTimeout(function(){ location.reload(); }, 1500);
  }catch(err){
    alert('Error al borrar datos: '+err.message);
  }
};

window.acCambiarTerceroInstruc = function(){
  var sel = document.getElementById('ac-tercero-instruc');
  var nit = sel ? sel.value : '';
  // Sync with hidden q-tercero
  var qSel = document.getElementById('q-tercero');
  if(qSel){ qSel.value = nit; }
  if(nit){ try{ cargarCuestionarioTercero(); } catch(e){} }
  // Repoblar tipologías
  window.poblarSelectorACTipologia();
  // Poblar el selector de contratos con los del tercero
  window.acPoblarContratos(nit);
  // Mostrar estado de tipologías
  window.acMostrarEstadoTipologias(nit);
};

// ── Contrato a evaluar en el BANNER del cuestionario ─────────────
// El Evaluador ve un desplegable de contratos junto al nombre del
// tercero mientras diligencia. Elegir uno lo guarda como
// contratoEval y se refleja en toda la app.
window.qPoblarContratos = function(nit){
  var wrap = document.getElementById('q-contrato-wrap');
  var sel  = document.getElementById('q-contrato-sel');
  if(!wrap || !sel) return;
  if(!nit){ wrap.style.display='none'; return; }
  var t = (window.TERCEROS_DB||{})[nit];
  try{ window._clsContratosBackfill && window._clsContratosBackfill(t); }catch(e){}
  var cons = (t && t.contratos) || [];
  // 🔴 FILTRO: SOLO contratos APROBADOS en cuestionarios
  cons = cons.filter(function(c){ return c && (c.estado_aprobacion === 'APROBADO' || c.estado === 'Aprobado'); });
  // Ocultar si tiene 0 o 1 contrato (nada que elegir). Con 2+ contratos
  // sí aparece porque puede calificar por contrato.
  if(cons.length<=1){ wrap.style.display='none'; return; }
  sel.innerHTML = '<option value="">Todos los contratos</option>'
    + cons.map(function(c){
        var lbl=(c.num||'s/n');  // SOLO el número
        return '<option value="'+(c.num||'').replace(/"/g,'&quot;')+'"'+(t.contratoEval===c.num?' selected':'')+'>'+lbl+'</option>';
      }).join('');
  wrap.style.display='flex';
  
  // ── Renderizar tabla visible de contratos ──
  try{ window.qRenderizarContratosTabla && window.qRenderizarContratosTabla(nit); }catch(e){}
};
window.qCambiarContrato = function(val){
  var nit = ((document.getElementById('q-tercero')||{}).value)||'';
  if(!nit) return;
  var db=window.TERCEROS_DB||{}; var t=db[nit]; if(!t) return;
  
  // ⭐ GUARDAR tipologías del contrato ACTUAL antes de cambiar
  var contratoAnterior = t.contratoEval;
  if(contratoAnterior && typeof cfDimsAgregadas !== 'undefined'){
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    var dimsCopia = (cfDimsAgregadas||[]).map(function(d){ return { key:d.key, nombre:d.nombre, val:d.val, hints:d.hints }; });
    t.dimsPorContrato[contratoAnterior] = dimsCopia;
  }
  
  // CAMBIAR al nuevo contrato
  t.contratoEval = val||'';
  try{ window._lsSave && window._lsSave(); }catch(e){}
  
  // ⭐ CARGAR tipologías del nuevo contrato
  if(val && typeof cfDimsAgregadas !== 'undefined'){
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    var dimsDelNuevo = t.dimsPorContrato[val] || [];
    window.cfDimsAgregadas = dimsDelNuevo.map(function(d){ return { id:'d_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), key:d.key, nombre:d.nombre, val:d.val, hints:d.hints||null, hasNA:false, soloImpar:false }; });
  }
  
  // Sincronizar con el selector del panel Instrucciones (si está a la vista)
  try{
    var acSel=document.getElementById('ac-contrato-sel');
    if(acSel && acSel.value!==val) acSel.value=val;
  }catch(e){}
  if(val){ 
    try{ showToast('Cambiando a Contrato '+val+' · Cargando tipologías...','success',1600); }catch(e){} 
    // ⭐ RECARGAR CUESTIONARIO CON TIPOLOGÍAS DEL CONTRATO
    setTimeout(function(){
      try{ cargarCuestionarioTercero(); }catch(e){}
      // ⭐ ACTUALIZAR DASHBOARD AC
      try{ renderReportesAC && renderReportesAC(); }catch(e){}
    }, 200);
  }
};

// ── Renderizar tabla visible de contratos ──
window.qRenderizarContratosTabla = function(nit){
  var tablaWrap = document.getElementById('q-contratos-tabla-wrap');
  var tablaLista = document.getElementById('q-contratos-tabla-lista');
  var btnDetalles = document.getElementById('q-ver-det-contratos');
  if(!tablaWrap || !tablaLista || !btnDetalles) return;
  
  var t = (window.TERCEROS_DB||{})[nit];
  var cons = (t && t.contratos) || [];
  // 🔴 FILTRO: SOLO contratos APROBADOS en AC
  cons = cons.filter(function(c){ return c && (c.estado_aprobacion === 'APROBADO' || c.estado === 'Aprobado'); });
  
  if(!cons.length){ tablaWrap.style.display='none'; return; }
  
  // Mostrar tabla si hay al menos 1 contrato
  tablaWrap.style.display='block';
  
  // Si hay 5+ contratos, mostrar botón "Ver detalles"
  btnDetalles.style.display = cons.length >= 5 ? 'inline-block' : 'none';
  
  // Renderizar tabla HTML
  var h = '<table style="width:100%;border-collapse:collapse;font-size:11.5px;">'
    + '<tr style="background:#f0f4f8;border-bottom:2px solid #dee2e6;">'
    + '<th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">No. Contrato</th>'
    + '<th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Objeto</th>'
    + '<th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Vigencia</th>'
    + '<th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Supervisor</th>'
    + '<th style="padding:8px;text-align:center;font-weight:700;color:#1a3a5c;">Promedio AC</th>'
    + '<th style="padding:8px;text-align:right;font-weight:700;color:#1a3a5c;">Valor</th>'
    + '</tr>';
  
  cons.forEach(function(c,i){
    var vigencia = (c.fini||'—') + ' → ' + (c.ffin||'—');
    var esAlterno = c.supervisorAlt ? ' ('+c.supervisorAlt+')' : '';
    var supervisor = (c.supervisor||'—') + (esAlterno ? '<br><span style="font-size:10px;color:#6c757d;">Alterno: '+esAlterno.substring(1)+'</span>' : '');
    var valor = c.valor ? '$' + c.valor : '—';
    
    // ─── PROMEDIO POR CONTRATO ─────────────────────────────
    var promedioBadge = '—';
    if(t.promPorContrato && t.promPorContrato[c.num]){
      var pxc = t.promPorContrato[c.num];
      var pxcVal = parseFloat(pxc.prom);
      var pxcColor = pxcVal >= 3 ? '#10b981' : pxcVal >= 2 ? '#f59e0b' : '#ef4444';
      var pxcBg = pxcVal >= 3 ? '#ecfdf5' : pxcVal >= 2 ? '#fffbeb' : '#fef2f2';
      promedioBadge = '<span style="padding:3px 8px;border-radius:10px;font-size:10px;font-weight:800;color:'+pxcColor+';background:'+pxcBg+';border:1.5px solid '+pxcColor+';">'+pxcVal.toFixed(1)+'</span>';
    }
    
    h += '<tr style="border-bottom:1px solid #eee;'+(i%2?'background:#fafbfc;':'')+'"><td style="padding:8px;color:#1a3a5c;font-weight:600;">'+c.num+'</td><td style="padding:8px;color:#374151;">'+c.objeto+'</td><td style="padding:8px;color:#6c757d;">'+vigencia+'</td><td style="padding:8px;color:#1a3a5c;font-size:10px;">'+supervisor+'</td><td style="padding:8px;text-align:center;">'+promedioBadge+'</td><td style="padding:8px;text-align:right;color:#1a3a5c;">'+valor+'</td></tr>';
  });
  h += '</table>';
  tablaLista.innerHTML = h;
};

window.qMostrarDetallesContratos = function(){
  var nit = ((document.getElementById('q-tercero')||{}).value||'').trim();
  if(!nit) return;
  var t = (window.TERCEROS_DB||{})[nit];
  var cons = (t && t.contratos) || [];
  
  // Crear modal con todos los contratos
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
  
  var contenido = '<div style="background:white;border-radius:12px;max-width:700px;width:100%;max-height:80vh;overflow-y:auto;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
    +'<h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">📄 Contratos — '+t.nombre+'</h2>'
    +'<button onclick="this.closest(\'div\').closest(\'div\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#6c757d;">✕</button>'
    +'</div>'
    +'<div style="font-size:11.5px;color:#6c757d;margin-bottom:16px;">Total: <b>'+cons.length+' contrato(s)</b></div>';
  
  cons.forEach(function(c,i){
    contenido += '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:12px;">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:11px;">'
      +'<div><label style="font-weight:700;color:#1a3a5c;">No. Contrato</label><div style="color:#374151;">'+c.num+'</div></div>'
      +'<div><label style="font-weight:700;color:#1a3a5c;">Objeto</label><div style="color:#374151;">'+c.objeto+'</div></div>'
      +'<div><label style="font-weight:700;color:#1a3a5c;">Inicio</label><div style="color:#6c757d;">'+c.fini+'</div></div>'
      +'<div><label style="font-weight:700;color:#1a3a5c;">Fin</label><div style="color:#6c757d;">'+c.ffin+'</div></div>'
      +'<div><label style="font-weight:700;color:#1a3a5c;">Supervisor</label><div style="color:#374151;">'+c.supervisor+'</div></div>'
      +'<div><label style="font-weight:700;color:#1a3a5c;">Alterno</label><div style="color:#6c757d;">'+c.supervisorAlt+'</div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-weight:700;color:#1a3a5c;">Procesos</label><div style="color:#374151;font-size:10px;">'+c.procesos+'</div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-weight:700;color:#1a3a5c;">Observaciones</label><div style="color:#374151;font-size:10px;">'+c.observaciones+'</div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-weight:700;color:#1a3a5c;">Valor</label><div style="color:#1a3a5c;">$'+c.valor+'</div></div>'
      +'</div></div>';
  });
  
  contenido += '</div>';
  modal.innerHTML = contenido;
  document.body.appendChild(modal);
};

// ── Contrato a evaluar en Ambiente de Control ─────────────────────
// Los contratos del tercero se cargan desde t.contratos (registrados
// en Paso 1). Elegir uno lo marca en el tercero y aparece en la
// tabla de Aprobación y en Análisis de Riesgos.
// ── Validación única para aprobación de clasificación ───────────
window._validarAprobacionSGRT=function(t,contratoNum){
  var faltantes=[];
  if(!t||!String(t.nit||'').trim()) faltantes.push('NIT');
  if(!t||!String(t.nombre||'').trim()) faltantes.push('nombre del tercero');
  if(!t||!String(t.entidad||'').trim()) faltantes.push('organización');
  if(!t||!String(t.domicilio||'').trim()) faltantes.push('domicilio');
  if(!t||!String(t.servicio||'').trim()) faltantes.push('servicio contratado');
  var dims=(t&&contratoNum&&t.dimsPorContrato&&t.dimsPorContrato[contratoNum])||(t&&t.dims)||[];
  if(!Array.isArray(dims)||!dims.length) faltantes.push('al menos una tipología de riesgo');
  (Array.isArray(dims)?dims:[]).forEach(function(d){
    var v=parseFloat(d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel));
    if(isNaN(v)) faltantes.push('puntaje para '+(d.nombre||d.tipologia||d.key||'una tipología'));
    var controles=[];try{controles=window._ctrlsCuest?window._ctrlsCuest(t.nit,d.key,contratoNum):((window.CUESTIONARIO_CONTROLES||{})[d.key]||[]);}catch(e){controles=[];}
    if(!controles.length) faltantes.push('configuración de controles para '+(d.nombre||d.tipologia||d.key||'una tipología'));
  });
  var prom=parseFloat(t.prom!==undefined?t.prom:(t.promedio!==undefined?t.promedio:t.PromedioCriticidad));
  if(isNaN(prom)||prom<=3) faltantes.push('calificación promedio mayor que 3');
  if(contratoNum){
    var contrato=(t.contratos||[]).find(function(c){return String(c.num)===String(contratoNum);});
    if(!contrato) faltantes.push('contrato válido');
  }
  return {ok:!faltantes.length,msg:'No se puede aprobar: completa '+faltantes.join(', ')+'.'};
};

// ── Toggle aprobación de un contrato específico ────────────────
// Cada contrato tiene su propia aprobación, independiente del tercero.
// Se guarda en t.aprobadoPorContrato = { CON-1: true, CON-2: false }
window._aprToggleContrato = function(nit, num){
  try{
    var t=(window.TERCEROS_DB||{})[nit]; if(!t) return;
    if(!t.aprobadoPorContrato) t.aprobadoPorContrato={};
    var activar=!t.aprobadoPorContrato[num];
    if(activar){
      var valid=window._validarAprobacionSGRT(t,num);
      if(!valid.ok){try{showToast('⚠️ '+valid.msg,'warning',5000);}catch(e){}return;}
    }
    t.aprobadoPorContrato[num] = activar;
    
    // ⭐ CUANDO APRUEBAS UN CONTRATO, HABILITA TODO EL TERCERO EN AC
    if(t.aprobadoPorContrato[num]){
      t.habilitado_ac = true;
      t.aprobado_clasif = new Date().toISOString();
      t.estado = 'Aprobado';
    }
    
    window._lsSave && window._lsSave();
    
    if(t.aprobadoPorContrato[num]){
      try{ showToast('Contrato '+num+' aprobado · Tercero '+ (t.nombre||nit) +' habilitado en AC', 'success', 2000); }catch(e){}
    } else {
      try{ showToast('Contrato '+num+' no aprobado', 'success', 1800); }catch(e){}
    }
    
    // ⭐ SINCRONIZAR AC
    if(typeof renderAprobarOp==='function') renderAprobarOp();
    try{ acPoblarSelectorTerceroInstruc && acPoblarSelectorTerceroInstruc(); }catch(e){}
    try{ renderReportesAC && renderReportesAC(); }catch(e){}
  }catch(e){ console.warn('aprToggleContrato:',e); }
};

// ── Ver detalles completos de un contrato (modal) ──
window._verDetalleContrato = function(nit, numContrato){
  try{
    var t = (window.TERCEROS_DB||{})[nit];
    if(!t) { showToast('Tercero no encontrado','error',2000); return; }
    
    var contrato = (t.contratos||[]).find(function(c){ return c.num === numContrato; });
    if(!contrato) { showToast('Contrato no encontrado','error',2000); return; }
    
    var old = document.getElementById('modal-detalle-contrato');
    if(old) old.remove();
    
    var modal = document.createElement('div');
    modal.id = 'modal-detalle-contrato';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
    
    var html = '<div style="background:white;border-radius:12px;max-width:520px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,.3);">'
      +'<div style="padding:18px 20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;">'
      +'<div style="font-size:15px;font-weight:800;color:#1a3a5c;">Detalles del Contrato</div>'
      +'<button onclick="var m=document.getElementById(\'modal-detalle-contrato\'); if(m) m.remove();" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;">✕</button>'
      +'</div>'
      +'<div style="padding:20px;display:flex;flex-direction:column;gap:14px;">'
      +'<div>'
      +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Número de Contrato</label>'
      +'<div style="font-size:14px;font-weight:700;color:#1a3a5c;margin-top:4px;">'+(contrato.num||'—')+'</div>'
      +'</div>'
      +'<div>'
      +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Objeto</label>'
      +'<div style="font-size:14px;font-weight:600;color:#0f172a;margin-top:4px;line-height:1.5;">'+(contrato.objeto||'—')+'</div>'
      +'</div>';
    
    if(contrato.valor){
      html += '<div>'
        +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Valor</label>'
        +'<div style="font-size:14px;font-weight:700;color:#28a745;margin-top:4px;">$ '+(parseFloat(contrato.valor).toLocaleString('es-CO'))+'</div>'
        +'</div>';
    }
    
    if(contrato.fini || contrato.ffin){
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
      if(contrato.fini){
        html += '<div>'
          +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Fecha Inicio</label>'
          +'<div style="font-size:13px;font-weight:600;color:#0f172a;margin-top:4px;">'+(contrato.fini||'—')+'</div>'
          +'</div>';
      }
      if(contrato.ffin){
        html += '<div>'
          +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Fecha Fin</label>'
          +'<div style="font-size:13px;font-weight:600;color:#0f172a;margin-top:4px;">'+(contrato.ffin||'—')+'</div>'
          +'</div>';
      }
      html += '</div>';
    }
    
    if(contrato.proceso){
      html += '<div>'
        +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Proceso</label>'
        +'<div style="font-size:13px;font-weight:600;color:#0f172a;margin-top:4px;">'+(contrato.proceso||'—')+'</div>'
        +'</div>';
    }
    
    if(contrato.ciudad){
      html += '<div>'
        +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Ciudad</label>'
        +'<div style="font-size:13px;font-weight:600;color:#0f172a;margin-top:4px;">'+(contrato.ciudad||'—')+'</div>'
        +'</div>';
    }
    
    if(contrato.estado){
      html += '<div>'
        +'<label style="font-size:11px;font-weight:800;color:#6c757d;text-transform:uppercase;letter-spacing:.5px;">Estado</label>'
        +'<div style="font-size:13px;font-weight:600;color:#0f172a;margin-top:4px;">'+(contrato.estado||'—')+'</div>'
        +'</div>';
    }
    
    html += '</div>'
      +'<div style="padding:14px 20px;border-top:1px solid #e2e8f0;display:flex;gap:8px;justify-content:flex-end;">'
      +'<button onclick="var m=document.getElementById(\'modal-detalle-contrato\'); if(m) m.remove();" style="padding:8px 16px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">Cerrar</button>'
      +'</div>'
      +'</div>';
    
    modal.innerHTML = html;
    modal.addEventListener('click', function(ev){ if(ev.target === modal) { modal.remove(); } });
    document.body.appendChild(modal);
  }catch(e){ console.warn('verDetalleContrato:', e); }
};

// ── Ajustar la calificación de un contrato específico (modal Ajustar) ──
window._aprAjustarContrato = function(nit, num){
  try{
    var t=(window.TERCEROS_DB||{})[nit]; if(!t){ showToast('Tercero no encontrado','error',2000); return; }
    // Activar modo por contrato si aún no lo estaba
    t.modoEval = 'contrato';
    t.contratoEval = num;
    window._lsSave && window._lsSave();
    window.abrirAjusteCalif(nit, num);
  }catch(e){ console.warn('aprAjustarContrato:', e); }
};

// ── Ver tipologías y puntuación de un contrato específico ──
window._verTipologiasContrato = function(nit, numContrato){
  try{
    var t = (window.TERCEROS_DB||{})[nit];
    if(!t) { showToast('Tercero no encontrado','error',2000); return; }
    
    var contrato = (t.contratos||[]).find(function(c){ return c.num === numContrato; });
    if(!contrato) { showToast('Contrato no encontrado','error',2000); return; }
    
    var dims = (t.dimsPorContrato||{})[numContrato] || t.dims || [];
    var pxc = (t.promPorContrato||{})[numContrato] || {};
    
    // Crear modal
    var old = document.getElementById('modal-tipologias-contrato');
    if(old) old.remove();
    
    var modal = document.createElement('div');
    modal.id = 'modal-tipologias-contrato';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
    
    var tipologiasHtml = '';
    if(dims.length){
      tipologiasHtml = '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">';
      dims.forEach(function(d){
        var tieneVal = d.val !== '' && d.val != null;
        var dv = tieneVal ? parseFloat(d.val) : null;
        var dc = !tieneVal ? '#aaa' : dv >= 4 ? '#dc3545' : dv >= 3 ? '#fd7e14' : dv >= 2 ? '#ffc107' : '#28a745';
        var dn = window._nombreTipologia(d).replace('Riesgo ', '');
        tipologiasHtml += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">'
          + '<span style="flex:1;font-size:12px;font-weight:600;color:#0f172a;">'+dn+'</span>'
          + '<span style="padding:3px 10px;border-radius:6px;font-size:12px;font-weight:800;color:white;background:'+dc+';white-space:nowrap;min-width:50px;text-align:center;">'+(tieneVal?dv:'—')+'</span>'
          + '</div>';
      });
      tipologiasHtml += '</div>';
    } else {
      tipologiasHtml = '<div style="text-align:center;padding:20px;color:#9ca3af;font-style:italic;">Sin tipologías asignadas.</div>';
    }
    
    var contenido = '<div style="background:white;border-radius:12px;max-width:500px;width:100%;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);max-height:80vh;overflow-y:auto;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      + '<h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">📊 Tipologías</h2>'
      + '<button onclick="document.getElementById(\'modal-tipologias-contrato\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#6c757d;padding:0;cursor:pointer;">✕</button>'
      + '</div>'
      + '<div style="background:#f0f4f8;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-bottom:16px;">'
      + '<div style="font-size:11px;color:#1e40af;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Contrato</div>'
      + '<div style="font-size:13px;font-weight:600;color:#0f172a;">'+numContrato+'</div>'
      + '<div style="font-size:12px;color:#475569;margin-top:4px;">'+contrato.objeto+'</div>'
      + '</div>'
      + (pxc.prom ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">'
        + '<div style="background:#e8f5e9;border:1px solid #81c784;border-radius:8px;padding:12px;text-align:center;">'
        + '<div style="font-size:20px;font-weight:800;color:#2e7d32;">'+pxc.prom+'</div>'
        + '<div style="font-size:10px;color:#2e7d32;font-weight:700;text-transform:uppercase;">Promedio</div>'
        + '</div>'
        + '<div style="background:#fff3e0;border:1px solid #ffb74d;border-radius:8px;padding:12px;text-align:center;">'
        + '<div style="font-size:14px;font-weight:800;color:#f57c00;">'+pxc.zona+'</div>'
        + '<div style="font-size:10px;color:#f57c00;font-weight:700;text-transform:uppercase;">Exposición</div>'
        + '</div>'
        + '</div>' : '')
      + '<div style="font-size:12px;font-weight:700;color:#1a3a5c;margin-bottom:10px;">Calificaciones</div>'
      + tipologiasHtml
      + '</div>';
    
    modal.innerHTML = contenido;
    document.body.appendChild(modal);
  }catch(e){ console.warn('verTipologiasContrato:', e); }
};

// ── Ver detalle de los controles de un riesgo (matriz) ────────────
window._mtxVerCtrls = function(rid){
  try{
    var r = (window.MATRIZ_DB||[]).find(function(x){ return x.id===rid; });
    if(!r){ showToast('Riesgo no encontrado','error',2000); return; }
    var ctrls = r.controles || [];
    if(!ctrls.length && r.control) ctrls = [{desc:r.control, tipo:r.tipoCtrl||'PREVENTIVO', efec:0.5}];
    var old=document.getElementById('modal-ver-ctrls'); if(old) old.remove();
    var ov=document.createElement('div');
    ov.id='modal-ver-ctrls';
    ov.style.cssText='position:fixed;inset:0;background:rgba(15,30,50,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;';
    var listaHtml = ctrls.length
      ? '<div style="display:flex;flex-direction:column;gap:8px;">'
        + ctrls.map(function(c,i){
            var ef = Math.round((c.efec||0)*100);
            var tipoColor = c.tipo==='PREVENTIVO'?'#1e6bb8':c.tipo==='DETECTIVO'?'#f59e0b':'#dc2626';
            return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;">'
              +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
              +'<span style="font-size:12px;font-weight:800;color:#0f172a;">Control #'+(i+1)+'</span>'
              +'<span style="padding:2px 8px;background:'+tipoColor+';color:white;border-radius:10px;font-size:10px;font-weight:800;">'+(c.tipo||'—')+'</span>'
              +'<span style="margin-left:auto;font-size:11px;font-weight:700;color:#166534;">Efectividad: '+ef+'%</span>'
              +'</div>'
              +'<div style="font-size:12.5px;color:#374151;line-height:1.5;">'+(c.desc||'<i style="color:#9ca3af;">Sin descripción</i>')+'</div>'
              +'</div>';
          }).join('')
        + '</div>'
      : '<div style="text-align:center;padding:24px;color:#9ca3af;font-style:italic;">Este riesgo no tiene controles registrados.</div>';
    // Tratamiento y plan de acción
    var tratHtml = '';
    if(r.tratamiento || r.plan){
      tratHtml = '<div style="margin-top:14px;">'
        +'<button onclick="alert(\'PLAN DE ACCIÓN:\\n\\n'+(r.plan||r.tratamiento||'Sin plan definido').replace(/\n/g,'\\n').replace(/'/g,"\\\'")+'\');" style="width:100%;padding:10px 12px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.3px;cursor:pointer;font-family:inherit;">📋 Plan de Acción</button>'
        +'</div>';
    }
    // Obtener contratos del tercero
    var t = Object.values(window.TERCEROS_DB||{}).find(function(x){ return x.nombre===r.tercero; });
    var contratosHtml = '';
    if(t && t.contratos && t.contratos.length){
      var contratosStr = t.contratos.map(function(c){ return (c.num||'s/n'); }).join(', ');
      contratosHtml = '<button onclick="alert(\'CONTRATOS DEL TERCERO '+(r.tercero||'').toUpperCase()+':\\n\\n'+contratosStr+'\');" style="padding:4px 10px;background:#059669;color:white;border:none;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">📋 '+t.contratos.length+' Contratos</button>';
    }
    
    ov.innerHTML = '<div style="background:white;border-radius:10px;max-width:720px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35);">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #e5e7eb;">'
      +'<div>'
      +'<div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.3px;">Ref. '+r.id+'</div>'
      +'<div style="font-size:14px;font-weight:800;color:#1a3a5c;">Controles del riesgo — '+(r.tercero||'')+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:8px;align-items:center;">'
      +contratosHtml
      +'<button onclick="document.getElementById(\'modal-ver-ctrls\').remove()" style="background:none;border:none;font-size:18px;color:#6c757d;cursor:pointer;">✕</button>'
      +'</div>'
      +'</div>'
      +'<div style="flex:1;overflow-y:auto;padding:14px 18px;">'
      +'<div style="font-size:11px;color:#64748b;margin-bottom:10px;line-height:1.5;">'
      +(r.desc?'<b>Riesgo:</b> '+r.desc:'')
      +'</div>'
      + listaHtml
      + tratHtml
      +'</div>'
      +'</div>';
    ov.addEventListener('click',function(ev){ if(ev.target===ov) ov.remove(); });
    document.body.appendChild(ov);
  }catch(e){ console.warn('_mtxVerCtrls:',e); }
};

// ── Calificar/Ajustar un contrato específico desde Aprobación ──
// Lleva al Paso 2 con el tercero, activa el modo "por contrato" y
// preselecciona el contrato indicado.
window._aprCalificarContrato = function(nit, num){
  try{
    var t=(window.TERCEROS_DB||{})[nit]; if(!t){ showToast('Tercero no encontrado','error',2000); return; }
    t.modoEval = 'contrato';
    t.contratoEval = num;
    window._lsSave && window._lsSave();
    if(typeof _irPaso2Clasif==='function'){ _irPaso2Clasif(nit); }
    else if(typeof clsWizardSetStep==='function'){ clsWizardSetStep(2); }
    setTimeout(function(){
      var sel=document.getElementById('cls-tip-tercero-sel');
      if(sel){ sel.value=nit; window._clasifSeleccionarTercero(nit); }
      setTimeout(function(){
        var rd=document.querySelector('input[name="cls-modo"][value="contrato"]');
        if(rd){ rd.checked=true; window._clasifCambiarModo('contrato'); }
        var selCA=document.getElementById('cls-contrato-actual');
        if(selCA){ selCA.value=num; window._clasifCambiarContratoActual(num); }
      }, 200);
    }, 200);
  }catch(e){ console.warn('aprCalificarContrato:', e); }
};

window.acPoblarContratos = function(nit){
  var wrap = document.getElementById('ac-contrato-wrap');
  var sel  = document.getElementById('ac-contrato-sel');
  if(!wrap || !sel){ return; }
  if(!nit){ wrap.style.display='none'; return; }
  var t = (window.TERCEROS_DB||{})[nit];
  // Ejecutar backfill por si el tercero solo tiene el contrato en sus campos
  try{ window._clsContratosBackfill && window._clsContratosBackfill(t); }catch(e){}
  var cons = (t && t.contratos) || [];
  // 🔴 FILTRO: SOLO contratos APROBADOS en Ambiente de Control
  cons = cons.filter(function(c){ return c && (c.estado_aprobacion === 'APROBADO' || c.estado === 'Aprobado'); });
  if(!cons.length){ wrap.style.display='none'; return; }
  sel.innerHTML = '<option value="">Contratos Aprobados</option>'
    + cons.map(function(c){
        var lbl=(c.num||'s/n');  // SOLO el número
        return '<option value="'+(c.num||'').replace(/"/g,'&quot;')+'"'+(t.contratoEval===c.num?' selected':'')+'>'+lbl+'</option>';
      }).join('');
  wrap.style.display='block';
};
window.acCambiarContrato = function(val){
  var nit = (document.getElementById('ac-tercero-instruc')||{}).value||'';
  if(!nit) return;
  var db=window.TERCEROS_DB||{}; var t=db[nit]; if(!t) return;
  
  // ⭐ GUARDAR tipologías del contrato ACTUAL antes de cambiar
  var contratoAnterior = t.contratoEval;
  if(contratoAnterior && typeof cfDimsAgregadas !== 'undefined'){
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    var dimsCopia = (cfDimsAgregadas||[]).map(function(d){ return { key:d.key, nombre:d.nombre, val:d.val, hints:d.hints }; });
    t.dimsPorContrato[contratoAnterior] = dimsCopia;
  }
  
  // CAMBIAR al nuevo contrato
  t.contratoEval = val||'';
  try{ window._lsSave && window._lsSave(); }catch(e){}
  
  // ⭐ CARGAR tipologías del nuevo contrato
  if(val && typeof cfDimsAgregadas !== 'undefined'){
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    var dimsDelNuevo = t.dimsPorContrato[val] || [];
    window.cfDimsAgregadas = dimsDelNuevo.map(function(d){ return { id:'d_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), key:d.key, nombre:d.nombre, val:d.val, hints:d.hints||null, hasNA:false, soloImpar:false }; });
  }
  
  if(val){ try{ showToast('Calificando contrato '+val,'success',1600); }catch(e){} }
};

// ── Contrato en Nuevo Riesgo (Matriz / Análisis de Riesgos) ──────
window.nrPoblarContratos = function(idOnombre){
  var sel = document.getElementById('nr-contrato'); if(!sel) return;
  sel.innerHTML = '<option value="">Todos los contratos</option>';
  if(!idOnombre) return;
  var db = window.TERCEROS_DB||{};
  // El value del selector puede ser NIT o nombre — resolver a tercero:
  var t = Object.values(db).find(function(x){ return x.nit===idOnombre || x.nombre===idOnombre; });
  if(!t) return;
  try{ window._clsContratosBackfill && window._clsContratosBackfill(t); }catch(e){}
  (t.contratos||[]).forEach(function(c){
    var lbl=(c.num||'s/n');  // SOLO el número
    var opt=document.createElement('option'); opt.value=(c.num||''); opt.textContent=lbl;
    sel.appendChild(opt);
  });
};

window.acMostrarEstadoTipologias = function(nit){
  var wrap = document.getElementById('ac-tips-estado');
  if(!wrap) return;
  if(!nit){ wrap.style.display='none'; wrap.innerHTML=''; return; }

  var db = window.TERCEROS_DB || {};
  var t = db[nit];
  if(!t || !t.dims || !t.dims.length){ wrap.style.display='none'; return; }

  var resp = window.CUEST_RESPUESTAS && window.CUEST_RESPUESTAS[nit] ? window.CUEST_RESPUESTAS[nit] : {};
  var html = '<div style="font-size:11.5px;font-weight:700;color:#374151;margin-bottom:6px;">Estado por tipología:</div>';
  html += '<div style="display:flex;flex-direction:column;gap:5px;">';

  t.dims.forEach(function(d){
    var key = d.key;
    // Nombre completo (Continuidad del Negocio, Seguridad de la Información…),
    // no la abreviatura ("si", "fr"): usamos el resolvedor canónico.
    var nom = window._nombreTipologia(d) || d.nombre || key;
    var controles = window.CUESTIONARIO_CONTROLES && window.CUESTIONARIO_CONTROLES[key] ? window.CUESTIONARIO_CONTROLES[key] : [];
    var total = controles.length;
    var respondidos = controles.filter(function(c){ 
      var a1=(resp[key]&&resp[key][c.n]&&resp[key][c.n].a1)||'';
      return a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
    }).length;
    // Check borrador
    try{
      var bRaw = localStorage.getItem('cuest_borrador_'+nit);
      if(bRaw){
        var b = JSON.parse(bRaw);
        if(b.respuestas && b.respuestas[key]){
          var bResp = b.respuestas[key];
          var bCount = controles.filter(function(c){ return bResp[c.n] && bResp[c.n].a1; }).length;
          if(bCount > respondidos) respondidos = bCount;
        }
      }
    }catch(e){}
    var pct = total>0 ? Math.round(respondidos/total*100) : 0;
    var color = pct===100 ? '#28a745' : pct>0 ? '#fd7e14' : '#adb5bd';
    var icon  = pct===100 ? '✅' : pct>0 ? '🔄' : '⭕';
    var label = pct===100 ? 'Completo' : pct>0 ? respondidos+'/'+total+' ('+pct+'%)' : 'Sin iniciar';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;">'
          + '<span style="font-size:14px;">'+icon+'</span>'
          + '<div style="flex:1;min-width:0;">'
          + '<div style="font-size:12px;font-weight:700;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+nom+'</div>'
          + '<div style="height:5px;background:#e9ecef;border-radius:3px;margin-top:3px;"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:3px;transition:width .3s;"></div></div>'
          + '</div>'
          + '<span style="font-size:11px;font-weight:700;color:'+color+';white-space:nowrap;">'+label+'</span>'
          + '<button onclick="window.acIrATipologia(\''+key+'\',\''+nom.replace(/\'/g,"\\\\'")+'\')" style="padding:3px 10px;background:#1e6bb8;color:white;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Ir</button>'
          + '</div>';
  });
  html += '</div>';
  wrap.innerHTML = html;
  wrap.style.display = 'block';
};

window.acIrATipologia = function(key, nom){
  // Sync tercero
  var terceroSel = document.getElementById('ac-tercero-instruc');
  var nit = terceroSel ? terceroSel.value : '';
  if(nit){
    var qSel = document.getElementById('q-tercero');
    if(qSel) qSel.value = nit;
  }
  // Set the tipologia selector con data-key = key exacta
  var sel = document.getElementById('ac-tip-filtro');
  if(sel){
    for(var i=0;i<sel.options.length;i++){
      var op=sel.options[i];
      if((op.getAttribute('data-key')||'')===key){ sel.selectedIndex=i; break; }
    }
  }
  // Ir al cuestionario y filtrar por CLAVE (sin depender del nombre)
  try{ switchCuestTabExtended('cuest'); }catch(e){}
  setTimeout(function(){
    var wrap=document.getElementById('q-secciones-wrap');
    var qSel=document.getElementById('q-tercero');
    if(wrap && (!wrap.innerHTML.trim() || wrap.querySelectorAll('.card').length===0)){
      try{ cargarCuestionarioTercero(); }catch(e){}
      setTimeout(function(){ window._filtrarSeccionesPorTip(nom, key); }, 500);
    } else {
      window._filtrarSeccionesPorTip(nom, key);
    }
  }, 120);
};

// Auto-guardar evidencia en repositorio cuando se guarda cuestionario
(function(){
  var _origGuardar = window.guardarCuestionarioCompleto;
  window.guardarCuestionarioCompleto = function(){
    if(_origGuardar) _origGuardar.apply(this, arguments);
    // Guardar en repositorio: crear registro de evidencia en carpeta AC
    try{
      var nit = window.nitActual || '';
      var db = window.TERCEROS_DB || {};
      var t = db[nit];
      if(!nit || !t) return;
      var fecha = new Date().toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
      var nombre = 'AC_'+(t.nombre||nit).replace(/[^a-zA-Z0-9]/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.json';
      var contenido = JSON.stringify({
        nit: nit,
        tercero: t.nombre||nit,
        fecha: fecha,
        tipologias: (t.dims||[]).map(function(d){return window._nombreTipologia(d);}),
        respuestas: window.CUEST_RESPUESTAS && window.CUEST_RESPUESTAS[nit] ? window.CUEST_RESPUESTAS[nit] : {}
      }, null, 2);
      var dataURL = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(contenido)));
      // Guardar en carpeta AC del repositorio od_sgrt_v8
      var s = localStorage.getItem('od_sgrt_v8') || '{}';
      var fs = JSON.parse(s);
      var acFolder = (fs.children||[]).find(function(c){return c.id==='f_ac' || c.name==='Ambiente de Control';});
      if(!acFolder){
        acFolder = {id:'f_ac',name:'Ambiente de Control',type:'folder',children:[]};
        fs.children = fs.children||[];
        fs.children.push(acFolder);
      }
      // Create or update sub-folder for this tercero
      var terceroFolder = (acFolder.children||[]).find(function(c){return c.type==='folder' && c.name.includes(nit);});
      if(!terceroFolder){
        terceroFolder = {id:'f_ac_'+nit,name:(t.nombre||nit)+' ('+nit+')',type:'folder',children:[]};
        acFolder.children = acFolder.children||[];
        acFolder.children.push(terceroFolder);
      }
      // Remove old version of same file and add new
      terceroFolder.children = (terceroFolder.children||[]).filter(function(c){return c.name!==nombre;});
      terceroFolder.children.push({id:'ev_'+Date.now(),name:nombre,type:'file',size:contenido.length,fecha:fecha,dataURL:dataURL,nit:nit,tercero:t.nombre||nit});
      localStorage.setItem('od_sgrt_v8', JSON.stringify(fs));
      // Limpiar borrador ya que está guardado
      localStorage.removeItem('cuest_borrador_'+nit);
      var bInfo = document.getElementById('q-borrador-info');
      if(bInfo) bInfo.style.display='none';
    }catch(e){ console.warn('No se pudo guardar evidencia en repositorio:', e); }
  };
})();

// Poblar selector de tercero en instrucciones cuando se activa la pestaña
(function(){
  var _origSwitch = window._switchCuestTabExtendedImpl;
  window._switchCuestTabExtendedImpl = function(tab){
    if(_origSwitch) _origSwitch.apply(this, arguments);
    if(tab==='instruc'){
      setTimeout(function(){
        window.acPoblarSelectorTerceroInstruc && window.acPoblarSelectorTerceroInstruc();
        // Si ya hay un tercero seleccionado, mostrar estado
        var sel = document.getElementById('ac-tercero-instruc');
        if(sel && sel.value) window.acMostrarEstadoTipologias(sel.value);
      }, 100);
    }
  };
})();


// ── ANÁLISIS DE RIESGOS: poblar Tipo de Riesgo desde tipologías del tercero ──
window.poblarTipoRiesgoDesdeNrTercero = function(){
  var sel = document.getElementById('nr-tipo');
  var terceroSel = document.getElementById('nr-tercero');
  if(!sel) return;
  var currentVal = sel.value;
  sel.innerHTML = '<option value="">— Seleccionar —</option>';

  var nombreTercero = terceroSel ? terceroSel.value : '';
  var db = window.TERCEROS_DB || {};
  // Find by nombre
  var t = Object.values(db).find(function(x){ return x.nombre===nombreTercero || x.nit===nombreTercero; });
  var dims = t && t.dims && t.dims.length ? t.dims : null;

  if(dims){
    dims.forEach(function(d){
      // Usar SECCIONES_INFO para obtener el nombre COMPLETO, no la abreviación
      var key = d.key || d.nombre || '';
      var nom = (window.SECCIONES_INFO && window.SECCIONES_INFO[key]) ? window.SECCIONES_INFO[key].label : (d.nombre || key);
      if(!nom) return;
      var o = document.createElement('option');
      o.value = nom; o.textContent = nom;
      sel.appendChild(o);
    });
  } else {
    // Fallback: mostrar todas las tipologías activas con nombres completos
    var allKeys = ['op','cn','si','cu','fr','laft','fi','pa'];
    allKeys.forEach(function(k){
      if(window.SECCIONES_INFO && window.SECCIONES_INFO[k]){
        var nom = window.SECCIONES_INFO[k].label;
        var o = document.createElement('option');
        o.value = nom; o.textContent = nom;
        sel.appendChild(o);
      }
    });
  }
  if(currentVal) sel.value = currentVal;
};

// ── MOSTRAR/OCULTAR SELECTOR DE CONTRATO en Análisis de Riesgos ──
// Según si la tipología es independiente por contrato
window.manejarCambioFrecuencia = function(){
  // Mostrar/ocultar criterios según "Datos Históricos" vs "Por Frecuencia"
  var tipoImplVal = document.getElementById('nr-tipo-impl-val');
  var frecuenciaSel = document.getElementById('nr-frecuencia');
  if(!tipoImplVal || !frecuenciaSel) return;
  
  var esPorFrecuencia = tipoImplVal.value === 'frecuencia';
  var tieneFrequencia = frecuenciaSel.value !== '';
  
  // Mostrar/ocultar campos de criterios (solo si "Por Frecuencia")
  ['nr-criterio-prob-wrap', 'nr-criterio-imp-econ-wrap', 'nr-criterio-imp-reput-wrap'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.style.display = esPorFrecuencia ? 'block' : 'none';
  });
  
  // Mostrar/ocultar campos de Impacto (Económico/Reputacional) - solo si NO es "Por Frecuencia"
  // Si es "Por Frecuencia", se usan los criterios arriba
  ['nr-imp-econ-wrap', 'nr-imp-reput-wrap'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.style.display = (!esPorFrecuencia && tieneFrequencia) ? 'block' : 'none';
  });
  
  // Si está "Por Frecuencia" y se cambió frecuencia, recalcular Probabilidad Inherente
  if(esPorFrecuencia){
    try{ window.calcProbInherenteAuto(); }catch(e){}
  }
};

// Hook en los botones de frecuencia para llamar a esta función
(function(){
  setTimeout(function(){
    var btnsFrec = document.querySelectorAll('.btn-freq');
    btnsFrec.forEach(function(btn){
      var oldOnclick = btn.onclick;
      btn.onclick = function(){
        if(oldOnclick) oldOnclick.call(this);
        setTimeout(window.manejarCambioFrecuencia, 100);
      };
    });
  }, 300);
})();

// Hook para que se llame cuando cambia el tipo de riesgo
(function(){
  setTimeout(function(){
    var selTipo = document.getElementById('nr-tipo');
    if(selTipo){
      var oldOnchange = selTipo.onchange || function(){};
      selTipo.onchange = function(){
        oldOnchange.call(this);
        window.manejarCambioTipoRiesgo();
      };
    }
  }, 200);
})();

// Hook into nr-tercero onchange
(function(){
  var _origAbrirNuevoRiesgo = window.abrirNuevoRiesgo || function(){};
  window.abrirNuevoRiesgo = function(){
    _origAbrirNuevoRiesgo.apply(this, arguments);
    setTimeout(function(){
      // ── Poblar nr-tercero con TERCEROS_DB real ──
      var terceroSel = document.getElementById('nr-tercero');
      if(terceroSel){
        var prevVal = terceroSel.value;
        terceroSel.innerHTML = '<option value="">— Seleccionar —</option>';
        // Cargar de localStorage primero
        try{ var _sv=JSON.parse(localStorage.getItem('sgrt_v8')||'{}'); if(_sv.TERCEROS_DB) Object.assign(window.TERCEROS_DB||{},_sv.TERCEROS_DB); }catch(e){}
        var _db = window.TERCEROS_DB || {};
        Object.values(_db).forEach(function(t){
          if(!t||!t.nombre) return;
          var o = document.createElement('option');
          o.value = t.nombre; o.textContent = t.nombre + (t.prom?' ('+t.prom+')':'');
          terceroSel.appendChild(o);
        });
        if(prevVal) terceroSel.value = prevVal;
        if(!terceroSel._nrTipoListener){
          terceroSel._nrTipoListener = true;
          terceroSel.addEventListener('change', function(){
            window.poblarTipoRiesgoDesdeNrTercero();
          });
        }
        // Auto-select if only one tercero
        if(!terceroSel.value && terceroSel.options.length===2) terceroSel.selectedIndex=1;
      }
      window.poblarTipoRiesgoDesdeNrTercero();
    }, 80);
  };
})();


// ══════════════════════════════════════════════════════════════════
// ADMIN: ENTIDADES + REPORTES POR ENTIDAD
// ══════════════════════════════════════════════════════════════════

function getISEntidades(){
  try{ 
    var stored = JSON.parse(localStorage.getItem('sgrt_entidades')||'[]');
    if(stored.length > 0) return stored;
  }catch(e){}
  // Organizaciones precargadas por defecto
  return [
    {id:'colpensiones', nombre:'🏛 Colpensiones', fecha:'2026-01-01'},
    {id:'ecopetrol', nombre:'🛢 Ecopetrol', fecha:'2026-01-01'},
    {id:'bancolombia', nombre:'🏦 Bancolombia', fecha:'2026-01-01'}
  ];
}
function saveISEntidades(list){
  try{ localStorage.setItem('sgrt_entidades', JSON.stringify(list)); }catch(e){}
}

window.renderEntidadesIS = function(){
  var wrap = document.getElementById('admin-entidades-lista');
  if(!wrap) return;
  var entidades = getISEntidades();
  var users = window.getISUsuarios ? window.getISUsuarios() : [];

  if(!entidades.length){
    wrap.innerHTML = '<div style="text-align:center;padding:40px;background:white;border:1px solid #dee2e6;border-radius:8px;color:#aaa;">'
      +'<div style="font-size:32px;margin-bottom:10px;">🏢</div>'
      +'<div style="font-size:14px;font-weight:600;">Sin organizaciones registradas</div>'
      +'<div style="font-size:12px;margin-top:6px;">Crea una organización para poder asignar usuarios ADMINISTRADOR DE RIESGOS y EVALUADOR</div>'
      +'</div>';
    return;
  }

  wrap.innerHTML = entidades.map(function(ent){
    var ops = users.filter(function(u){ return u.entidad===ent.id && u.rol==='Operativo'; }).length;
    var cls = users.filter(function(u){ return u.entidad===ent.id && u.rol==='Cliente'; }).length;
    var db = window.TERCEROS_DB || {};
    var terceros = Object.values(db).filter(function(t){ return (t.entidad||'').toLowerCase().includes(ent.nombre.toLowerCase()) || ent.nombre.toLowerCase().includes((t.entidad||'').toLowerCase()); }).length;
    return '<div style="background:white;border:1px solid #dee2e6;border-radius:8px;padding:16px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
      +'<div style="width:44px;height:44px;border-radius:10px;background:#1a3a5c;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🏢</div>'
      +'<div style="flex:1;min-width:180px;">'
        +'<div style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:#1a3a5c;">'+ent.nombre+'</div>'
        +'<div style="font-size:11px;color:#6c757d;margin-top:2px;">ID: '+ent.id+' &nbsp;·&nbsp; Creada: '+(ent.fecha||'—')+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:16px;flex-wrap:wrap;">'
        +'<div style="text-align:center;"><div style="font-size:10px;color:#6c757d;text-transform:uppercase;font-weight:700;">Gestores</div><div style="font-size:20px;font-weight:800;color:#1e6bb8;">'+ops+'</div></div>'
        +'<div style="text-align:center;"><div style="font-size:10px;color:#6c757d;text-transform:uppercase;font-weight:700;">Clientes</div><div style="font-size:20px;font-weight:800;color:#28a745;">'+cls+'</div></div>'
        +'<div style="text-align:center;"><div style="font-size:10px;color:#6c757d;text-transform:uppercase;font-weight:700;">Terceros</div><div style="font-size:20px;font-weight:800;color:#fd7e14;">'+terceros+'</div></div>'
      +'</div>'
      +'<div style="display:flex;gap:6px;flex-shrink:0;">'
        +'<button data-entid="'+ent.id+'" onclick="window._verDetalleEntidad(this.getAttribute(\'data-entid\'))" style="padding:5px 12px;background:#e8f4ff;border:1px solid #aac8f0;color:#1e6bb8;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">📊 Ver detalle</button>'
        +'<button data-delid="'+ent.id+'" onclick="window.eliminarEntidadIS(this.getAttribute(\'data-delid\'))" style="padding:5px 9px;background:#fef2f2;border:1px solid #fca5a5;color:#dc3545;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;">🗑</button>'
      +'</div>'
    +'</div>';
  }).join('');
};

window.abrirNuevaEntidadIS = function(){
  var nombre = prompt('Nombre de la entidad (ej: Colpensiones, Ecopetrol):');
  if(!nombre || !nombre.trim()) return;
  var lista = getISEntidades();
  var id = nombre.trim().toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,20)+'_'+Date.now().toString().slice(-4);
  if(lista.find(function(e){ return e.nombre.toLowerCase()===nombre.trim().toLowerCase(); })){
    try{showToast('Ya existe una organización con ese nombre','error',2500);}catch(e){} return;
  }
  lista.push({id:id, nombre:nombre.trim(), fecha:new Date().toLocaleDateString('es-CO')});
  saveISEntidades(lista);
  // Also add to usr-entidad select options for new user modal
  window.renderEntidadesIS();
  try{showToast('✅ Organización "'+nombre.trim()+'" creada','success',2500);}catch(e){}
};

window.eliminarEntidadIS = function(id){
  if(!confirm('¿Eliminar esta entidad? Los usuarios asignados no se eliminarán.')) return;
  var lista = getISEntidades().filter(function(e){ return e.id!==id; });
  saveISEntidades(lista);
  window.renderEntidadesIS();
  try{showToast('Organización eliminada','success',2000);}catch(e){}
};

window.getNombreTipologia = function(key){
  var abrevMap = {
    'op': 'Riesgo Operacional',
    'cu': 'Cumplimiento Regulatorio',
    'si': 'Seguridad de la Información y Ciberseguridad',
    'fr': 'Fraude y Corrupción',
    'cn': 'Continuidad de Negocio',
    'laft': 'Lavado de Activos y Financiamiento del Terrorismo',
    'tf': 'Transferencia de Fondos',
    'rr': 'Riesgo de Reputación',
    'pc': 'Protección de Datos y Privacidad'
  };
  if(window.SECCIONES_INFO && window.SECCIONES_INFO[key]){
    return window.SECCIONES_INFO[key].label || key;
  }
  return abrevMap[key] || key;
};

function _reporteNivelRiesgo(r,residual){
  if(!r)return '';
  var v=residual?(r.zonaRes||r.residual||r.calificacion_residual||r.nivel_residual):(r.zonaInh||r.inherente||r.calificacion_inherente||r.nivel_inherente);
  return String(v||'').toUpperCase();
}

window.renderReportesPorEntidad = function(){
  var wrap=document.getElementById('admin-rpe-wrap');if(!wrap)return;
  var sel=document.getElementById('rpe-filtro-entidad');
  
  // SOLO Colpensiones
  if(sel){
    sel.innerHTML = '';
    var opt1 = document.createElement('option');
    opt1.value = 'Colpensiones';
    opt1.textContent = 'Colpensiones';
    sel.appendChild(opt1);
    sel.value = 'Colpensiones';
  }
  
  // Filtrar SOLO por Colpensiones
  var lista=Object.values(window.TERCEROS_DB||{}).filter(function(t){
    var entidad = t.entidad || 'Colpensiones';
    return entidad === 'Colpensiones' || entidad.toUpperCase().includes('COLPENSIONES');
  });
  if(!lista.length){wrap.innerHTML='<div style="text-align:center;padding:60px;background:white;border:1px solid #dee2e6;border-radius:10px;color:#aaa;"><div style="font-size:36px;">📊</div><div style="font-size:14px;font-weight:600;margin-top:10px;">Sin datos registrados</div><div style="font-size:12px;margin-top:4px;">Registra y guarda terceros en Clasificación para ver reportes aquí.</div></div>';return;}

  var total=lista.length;
  var clasificados=lista.filter(function(t){return parseFloat(t.prom||0)>0;}).length;
  var conAC=lista.filter(function(t){var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit];return r&&Object.keys(r).length>0;}).length;
  var conMatriz=lista.filter(function(t){return(window.MATRIZ_DB||[]).some(function(r){return r.tercero===t.nombre||r.nit===t.nit;});}).length;
  
  var h='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">'
    +'<div class="kpi kpi-b"><div class="kpi-lbl">Total Terceros</div><div class="kpi-val">'+total+'</div></div>'
    +'<div class="kpi kpi-g"><div class="kpi-lbl">Clasificados</div><div class="kpi-val">'+clasificados+'</div></div>'
    +'<div class="kpi kpi-y"><div class="kpi-lbl">Con AC</div><div class="kpi-val">'+conAC+'</div></div>'
    +'<div class="kpi kpi-t"><div class="kpi-lbl">En Análisis Riesgos</div><div class="kpi-val">'+conMatriz+'</div></div>'
    +'</div>';

  // ─ SECCIÓN 1: Clasificación de Terceros ─────────────────
  h+='<div class="card" style="margin-bottom:16px;">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#0d2740,#1e6bb8);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFase(\'clasif\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-clasif" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Clasificación de Terceros</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+clasificados+' de '+total+' clasificados</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-clasif" style="display:block;">'
    +'<div style="padding:14px;background:#f0f6ff;border-bottom:1px solid #bfdbfe;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Puntaje Promedio General</div><div style="font-size:18px;font-weight:800;color:#1e6bb8;margin-top:4px;">'+((lista.reduce(function(s,t){return s+parseFloat(t.prom||0);},0)/Math.max(clasificados,1)).toFixed(1))+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Extremo</div><div style="font-size:18px;font-weight:800;color:#dc3545;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('EXTREMO');}).length+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Alto</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('ALTO');}).length+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Bajo</div><div style="font-size:18px;font-weight:800;color:#28a745;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('BAJO');}).length+'</div></div>'
    +'</div>'
    +'<input type="text" id="filtro-clasif" placeholder="Filtrar por nombre o NIT..." onkeyup="window.filtrarReportePorTercero(\'clasif\')" style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;font-family:inherit;box-sizing:border-box;">'
    +'<div id="label-filtro-clasif" style="font-size:10px;color:#64748b;margin-top:4px;">'+lista.length+' registros mostrados</div>'
    +'</div>'
    +'<div style="overflow-x:auto;">'
    +'<table id="tabla-clasif" style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="background:#f0f6ff;border-bottom:2px solid #1e6bb8;">'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Tercero / NIT</th>'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Servicio</th>'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Supervisor</th>'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:center;">Puntaje</th>'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Nivel de Exposición</th>'
    +'<th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Tipologías Asignadas</th>'
    +'</tr></thead><tbody>'
    +lista.map(function(t,i){
      var p=parseFloat(t.prom||0),zona=t.zona||t.exposicion||'Pendiente';
      var tipologiasCompletas=(t.dims||[]).map(function(d){return window.getNombreTipologia(d.key||d);}).join(', ')||'Sin asignar';
      var pc=p>=4?'#dc3545':p>=3?'#fd7e14':p>0?'#28a745':'#aaa';
      return'<tr style="background:'+(i%2?'#f8faff':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;font-size:11.5px;color:#374151;">'+(t.servicio||'—')+'</td>'
        +'<td style="padding:9px 12px;font-size:11.5px;color:#374151;">'+(t.supervisor||'—')+'</td>'
        +'<td style="padding:9px 12px;text-align:center;"><span style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:'+pc+'">'+(p>0?p.toFixed(2):'—')+'</span></td>'
        +'<td style="padding:9px 12px;"><span style="padding:3px 11px;border-radius:10px;font-size:11px;font-weight:700;color:white;background:'+(zona.includes('EXTREMO')?'#dc3545':zona.includes('ALTO')?'#fd7e14':'#28a745')+';">'+zona+'</span></td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#374151;">'+tipologiasCompletas+'</td>'
        +'</tr>';
    }).join('')
    +'</tbody></table></div></div>'
    +'</div>';

  // ─ SECCIÓN 2: Ambiente de Control ───────────────────────
  var statsAC = {completadas: 0, enProgreso: 0, pendientes: 0};
  lista.forEach(function(t){
    var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit]?window.CUEST_RESPUESTAS[t.nit]:{};
    var nR=Object.keys(r).length;
    var nTips=(t.dims||[]).length;
    var pct=nTips>0?Math.min(100,Math.round(nR/Math.max(nTips*5,1)*100)):0;
    if(pct>=80) statsAC.completadas++;
    else if(nR>0) statsAC.enProgreso++;
    else statsAC.pendientes++;
  });
  
  h+='<div class="card" style="margin-bottom:16px;">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#14532d,#22c55e);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFase(\'ac\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-ac" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Evaluación Ambiente de Control</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+conAC+' de '+total+' con respuestas</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-ac" style="display:block;">'
    +'<div style="padding:14px;background:#f0fdf4;border-bottom:1px solid #dcfce7;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Completadas</div><div style="font-size:18px;font-weight:800;color:#22c55e;margin-top:4px;">'+statsAC.completadas+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">En Progreso</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+statsAC.enProgreso+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Pendientes</div><div style="font-size:18px;font-weight:800;color:#aaa;margin-top:4px;">'+statsAC.pendientes+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Tasa Cumplimiento</div><div style="font-size:18px;font-weight:800;color:#22c55e;margin-top:4px;">'+Math.round((statsAC.completadas/(total||1))*100)+'%</div></div>'
    +'</div>'
    +'<input type="text" id="filtro-ac" placeholder="Filtrar por nombre o NIT..." onkeyup="window.filtrarReportePorTercero(\'ac\')" style="width:100%;padding:8px 12px;border:1px solid #86efac;border-radius:6px;font-size:12px;font-family:inherit;box-sizing:border-box;">'
    +'<div id="label-filtro-ac" style="font-size:10px;color:#15803d;margin-top:4px;">'+lista.length+' registros mostrados</div>'
    +'</div>'
    +'<div style="overflow-x:auto;">'
    +'<table id="tabla-ac" style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="background:#f0fdf4;border-bottom:2px solid #22c55e;">'
    +'<th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;">Tercero / NIT</th>'
    +'<th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;">Tipologías a Evaluar</th>'
    +'<th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:center;">Respuestas</th>'
    +'<th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;min-width:130px;">Progreso Evaluación</th>'
    +'<th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:center;">Estado</th>'
    +'</tr></thead><tbody>'
    +lista.map(function(t,i){
      var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit]?window.CUEST_RESPUESTAS[t.nit]:{};
      var nR=Object.keys(r).length;
      var tipologiasCompletas=(t.dims||[]).map(function(d){return window.getNombreTipologia(d.key||d);}).join(', ')||'Sin asignar tipologías';
      var nTips=(t.dims||[]).length;
      var pct=nTips>0?Math.min(100,Math.round(nR/Math.max(nTips*5,1)*100)):0;
      var barC=nR===0?'#dee2e6':pct>=80?'#22c55e':'#fd7e14';
      var est=nR===0?'Pendiente':pct>=80?'Completado':'En progreso';
      var eC=nR===0?'#aaa':pct>=80?'#22c55e':'#fd7e14';
      return'<tr style="background:'+(i%2?'#f8fff8':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#374151;">'+tipologiasCompletas+'</td>'
        +'<td style="padding:9px 12px;text-align:center;font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:#14532d;">'+nR+'</td>'
        +'<td style="padding:9px 12px;">'
        +'<div style="background:#e9ecef;border-radius:4px;height:8px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+barC+';border-radius:4px;transition:width .4s;"></div></div>'
        +'<div style="font-size:10px;color:#6c757d;margin-top:2px;">'+pct+'% completado</div></td>'
        +'<td style="padding:9px 12px;text-align:center;"><span style="padding:2px 9px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+eC+';">'+est+'</span></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table></div></div>'
    +'</div>';

  // ─ SECCIÓN 3: Análisis de Riesgos ───────────────────────
  var riesgosDB = window.MATRIZ_DB||[];
  var riesgosFiltered = riesgosDB.filter(function(r){return lista.some(function(t){return t.nombre===r.tercero||t.nit===r.nit;});});
  var totalR=riesgosFiltered.length;
  var statsRiesgos = {extremo: 0, alto: 0, medio: 0, bajo: 0};
  riesgosFiltered.forEach(function(r){
    var nivel = _reporteNivelRiesgo(r,false)||'BAJO';
    if(nivel.includes('EXTREMO')) statsRiesgos.extremo++;
    else if(nivel.includes('ALTO')) statsRiesgos.alto++;
    else if(nivel.includes('MEDIO')) statsRiesgos.medio++;
    else statsRiesgos.bajo++;
  });
  
  h+='<div class="card">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#7c2d12,#dc3545);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFase(\'riesgos\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-riesgos" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Análisis de Riesgos y Tratamiento</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+totalR+' riesgos registrados</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-riesgos" style="display:block;">'
    +'<div style="padding:14px;background:#fff5f5;border-bottom:1px solid #fecaca;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Extremo</div><div style="font-size:18px;font-weight:800;color:#dc3545;margin-top:4px;">'+statsRiesgos.extremo+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Alto</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+statsRiesgos.alto+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Medio</div><div style="font-size:18px;font-weight:800;color:#fbbf24;margin-top:4px;">'+statsRiesgos.medio+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Bajo</div><div style="font-size:18px;font-weight:800;color:#28a745;margin-top:4px;">'+statsRiesgos.bajo+'</div></div>'
    +'</div>'
    +'<input type="text" id="filtro-riesgos" placeholder="Filtrar por nombre o NIT..." onkeyup="window.filtrarReportePorTercero(\'riesgos\')" style="width:100%;padding:8px 12px;border:1px solid #fca5a5;border-radius:6px;font-size:12px;font-family:inherit;box-sizing:border-box;">'
    +'<div id="label-filtro-riesgos" style="font-size:10px;color:#991b1b;margin-top:4px;">'+lista.length+' registros mostrados</div>'
    +'</div>'
    +'<div style="overflow-x:auto;">'
    +'<table id="tabla-riesgos" style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="background:#fff5f5;border-bottom:2px solid #dc3545;">'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Tercero / NIT</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Cantidad Riesgos</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Tipología de Riesgo</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Calificación Inherente</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Calificación Residual</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Plan de Mitigación</th>'
    +'</tr></thead><tbody>'
    +lista.map(function(t,i){
      var rgs=riesgosDB.filter(function(r){return r.tercero===t.nombre||r.nit===t.nit;});
      if(!rgs.length) return'<tr style="background:'+(i%2?'#fff8f8':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;text-align:center;color:#aaa;font-size:11px;" colspan="5">Sin riesgos registrados aún</td></tr>';
      return rgs.map(function(r,j){
        var inh=_reporteNivelRiesgo(r,false)||'No definido',res=_reporteNivelRiesgo(r,true)||'No definido',trat=r.tratamiento||r.accion||'Por definir';
        var tipologiaCompleta = window.getNombreTipologia(r.tipologia||r.tipo||'');
        var ic=inh==='ALTO'||inh==='CRITICO'||inh==='EXTREMO'?'#dc3545':inh==='MEDIO'?'#fd7e14':'#28a745';
        var rc=res==='ALTO'||res==='CRITICO'||res==='EXTREMO'?'#dc3545':res==='MEDIO'?'#fd7e14':'#28a745';
        return'<tr style="background:'+(i%2?'#fff8f8':'white')+';border-bottom:1px solid #f0f0f0;">'
          +(j===0?'<td style="padding:9px 12px;" rowspan="'+rgs.length+'"><div style="font-weight:700;color:#1a3a5c;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>':'')
          +(j===0?'<td style="padding:9px 12px;text-align:center;font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:#dc3545;" rowspan="'+rgs.length+'">'+rgs.length+'</td>':'')
          +'<td style="padding:9px 12px;font-size:11.5px;color:#374151;">'+tipologiaCompleta+'</td>'
          +'<td style="padding:9px 12px;text-align:center;"><span style="padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;color:white;background:'+ic+';">'+inh+'</span></td>'
          +'<td style="padding:9px 12px;text-align:center;"><span style="padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;color:white;background:'+rc+';">'+res+'</span></td>'
          +'<td style="padding:9px 12px;font-size:11px;color:#374151;">'+trat+'</td>'
          +'</tr>';
      }).join('');
    }).join('')
    +'</tbody></table></div></div>'
    +'</div>';

  wrap.innerHTML=h;
};

// ═══ FUNCIÓN REPORTES POR ENTIDAD PARA OPERATIVOS (Admin Riesgos, Evaluador) ═══
window.renderReportesPorEntidadOp = function(){
  var wrap=document.getElementById('rpe-wrap-op');if(!wrap)return;
  var sel=document.getElementById('rpe-filtro-entidad-op');
  
  // SOLO Colpensiones
  if(sel){
    sel.innerHTML = '';
    var opt1 = document.createElement('option');
    opt1.value = 'Colpensiones';
    opt1.textContent = 'Colpensiones';
    sel.appendChild(opt1);
    sel.value = 'Colpensiones';
  }
  
  // Filtrar SOLO por Colpensiones
  var lista=Object.values(window.TERCEROS_DB||{}).filter(function(t){
    var entidad = t.entidad || 'Colpensiones';
    return entidad === 'Colpensiones' || entidad.toUpperCase().includes('COLPENSIONES');
  });
  if(!lista.length){wrap.innerHTML='<div style="text-align:center;padding:60px;background:white;border:1px solid #dee2e6;border-radius:10px;color:#aaa;"><div style="font-size:36px;">📊</div><div style="font-size:14px;font-weight:600;margin-top:10px;">Sin datos registrados</div><div style="font-size:12px;margin-top:4px;">Registra y guarda terceros en Clasificación para ver reportes aquí.</div></div>';return;}

  var total=lista.length;
  var clasificados=lista.filter(function(t){return parseFloat(t.prom||0)>0;}).length;
  var conAC=lista.filter(function(t){var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit];return r&&Object.keys(r).length>0;}).length;
  var conMatriz=lista.filter(function(t){return(window.MATRIZ_DB||[]).some(function(r){return r.tercero===t.nombre||r.nit===t.nit;});}).length;
  
  var h='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">'
    +'<div class="kpi kpi-b"><div class="kpi-lbl">Total Terceros</div><div class="kpi-val">'+total+'</div></div>'
    +'<div class="kpi kpi-g"><div class="kpi-lbl">Clasificados</div><div class="kpi-val">'+clasificados+'</div></div>'
    +'<div class="kpi kpi-y"><div class="kpi-lbl">Con AC</div><div class="kpi-val">'+conAC+'</div></div>'
    +'<div class="kpi kpi-t"><div class="kpi-lbl">En Análisis Riesgos</div><div class="kpi-val">'+conMatriz+'</div></div>'
    +'</div>';

  // ─ SECCIÓN 1: Clasificación de Terceros ─────────────────
  h+='<div class="card" style="margin-bottom:16px;">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#0d2740,#1e6bb8);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFaseOp(\'clasif\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-clasif-op" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Clasificación de Terceros</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+clasificados+' de '+total+' clasificados</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-clasif-op" style="display:block;">'
    +'<div style="padding:14px;background:#f0f6ff;border-bottom:1px solid #bfdbfe;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Puntaje Promedio</div><div style="font-size:18px;font-weight:800;color:#1e6bb8;margin-top:4px;">'+((lista.reduce(function(s,t){return s+parseFloat(t.prom||0);},0)/Math.max(clasificados,1)).toFixed(1))+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Extremo</div><div style="font-size:18px;font-weight:800;color:#dc3545;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('EXTREMO');}).length+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Alto</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('ALTO');}).length+'</div></div>'
    +'<div style="background:white;border:1px solid #dbeafe;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;">Terceros Bajo</div><div style="font-size:18px;font-weight:800;color:#28a745;margin-top:4px;">'+lista.filter(function(t){return(t.zona||t.exposicion||'').includes('BAJO');}).length+'</div></div>'
    +'</div>'
    +'<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f0f6ff;border-bottom:2px solid #1e6bb8;"><th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Tercero / NIT</th><th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:center;">Puntaje</th><th style="padding:9px 12px;color:#1a3a5c;font-size:11px;text-align:left;">Nivel de Exposición</th></tr></thead><tbody>'
    +lista.map(function(t,i){
      var p=parseFloat(t.prom||0),zona=t.zona||t.exposicion||'Pendiente';
      var pc=p>=4?'#dc3545':p>=3?'#fd7e14':p>0?'#28a745':'#aaa';
      return'<tr style="background:'+(i%2?'#f8faff':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;text-align:center;"><span style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:'+pc+'">'+(p>0?p.toFixed(2):'—')+'</span></td>'
        +'<td style="padding:9px 12px;"><span style="padding:3px 11px;border-radius:10px;font-size:11px;font-weight:700;color:white;background:'+(zona.includes('EXTREMO')?'#dc3545':zona.includes('ALTO')?'#fd7e14':'#28a745')+';">'+zona+'</span></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table></div>'
    +'</div>'
    +'</div>';

  // ─ SECCIÓN 2: Ambiente de Control ───────────────────────
  var statsAC = {completadas: 0, enProgreso: 0, pendientes: 0};
  lista.forEach(function(t){
    var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit]?window.CUEST_RESPUESTAS[t.nit]:{};
    var nR=Object.keys(r).length;
    var nTips=(t.dims||[]).length;
    var pct=nTips>0?Math.min(100,Math.round(nR/Math.max(nTips*5,1)*100)):0;
    if(pct>=80) statsAC.completadas++;
    else if(nR>0) statsAC.enProgreso++;
    else statsAC.pendientes++;
  });
  
  h+='<div class="card" style="margin-bottom:16px;">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#14532d,#22c55e);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFaseOp(\'ac\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-ac-op" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Evaluación Ambiente de Control</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+conAC+' de '+total+' con respuestas</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-ac-op" style="display:block;">'
    +'<div style="padding:14px;background:#f0fdf4;border-bottom:1px solid #dcfce7;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Completadas</div><div style="font-size:18px;font-weight:800;color:#22c55e;margin-top:4px;">'+statsAC.completadas+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">En Progreso</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+statsAC.enProgreso+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Pendientes</div><div style="font-size:18px;font-weight:800;color:#aaa;margin-top:4px;">'+statsAC.pendientes+'</div></div>'
    +'<div style="background:white;border:1px solid #86efac;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;">Tasa Cumplimiento</div><div style="font-size:18px;font-weight:800;color:#22c55e;margin-top:4px;">'+Math.round((statsAC.completadas/(total||1))*100)+'%</div></div>'
    +'</div>'
    +'<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f0fdf4;border-bottom:2px solid #22c55e;"><th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;">Tercero / NIT</th><th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;">Tipologías a Evaluar</th><th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:center;">Respuestas</th><th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:left;min-width:130px;">Progreso</th><th style="padding:9px 12px;color:#14532d;font-size:11px;text-align:center;">Estado</th></tr></thead><tbody>'
    +lista.map(function(t,i){
      var r=window.CUEST_RESPUESTAS&&window.CUEST_RESPUESTAS[t.nit]?window.CUEST_RESPUESTAS[t.nit]:{};
      var nR=Object.keys(r).length;
      var nTips=(t.dims||[]).length;
      var pct=nTips>0?Math.min(100,Math.round(nR/Math.max(nTips*5,1)*100)):0;
      var est = pct>=80?'Completada':nR>0?'En Progreso':'Pendiente';
      var col = pct>=80?'#22c55e':nR>0?'#fd7e14':'#aaa';
      return'<tr style="background:'+(i%2?'#f0fdf4':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#14532d;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;font-size:11px;color:#374151;">'+nTips+'</td>'
        +'<td style="padding:9px 12px;text-align:center;font-weight:700;color:#374151;">'+nR+'</td>'
        +'<td style="padding:9px 12px;"><div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;"><div style="height:100%;background:'+col+';width:'+pct+'%;"></div></div><span style="font-size:11px;font-weight:700;color:#374151;">'+pct+'%</span></div></td>'
        +'<td style="padding:9px 12px;text-align:center;"><span style="padding:3px 11px;border-radius:10px;font-size:11px;font-weight:700;color:white;background:'+col+';">'+est+'</span></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table></div>'
    +'</div>'
    +'</div>';

  if((window.currentUser||{}).rol==='Operativo'){
  // ─ SECCIÓN 3: Análisis de Riesgos ───────────────────────
  var riesgosDB = window.MATRIZ_DB||[];
  var riesgosFiltered = riesgosDB.filter(function(r){return lista.some(function(t){return t.nombre===r.tercero||t.nit===r.nit;});});
  var totalR=riesgosFiltered.length;
  var statsRiesgos = {extremo: 0, alto: 0, medio: 0, bajo: 0};
  riesgosFiltered.forEach(function(r){
    var nivel = _reporteNivelRiesgo(r,false)||'BAJO';
    if(nivel.includes('EXTREMO')) statsRiesgos.extremo++;
    else if(nivel.includes('ALTO')) statsRiesgos.alto++;
    else if(nivel.includes('MEDIO')) statsRiesgos.medio++;
    else statsRiesgos.bajo++;
  });
  
  h+='<div class="card">'
    +'<div class="card-hdr" style="background:linear-gradient(90deg,#7c2d12,#dc3545);border-radius:var(--r2) var(--r2) 0 0;cursor:pointer;" onclick="window.toggleReporteFaseOp(\'riesgos\')">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;width:100%;">'
    +'<div style="display:flex;align-items:center;gap:10px;flex:1;">'
    +'<span id="btn-toggle-riesgos-op" style="color:white;font-size:14px;font-weight:bold;">▼ </span>'
    +'<h3 style="color:white;margin:0;font-size:14px;">Análisis de Riesgos y Tratamiento</h3>'
    +'<span style="color:rgba(255,255,255,.7);font-size:11px;">'+totalR+' riesgos registrados</span>'
    +'</div></div>'
    +'</div>'
    +'<div id="rpt-fase-riesgos-op" style="display:block;">'
    +'<div style="padding:14px;background:#fff5f5;border-bottom:1px solid #fecaca;"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;">'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Extremo</div><div style="font-size:18px;font-weight:800;color:#dc3545;margin-top:4px;">'+statsRiesgos.extremo+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Alto</div><div style="font-size:18px;font-weight:800;color:#fd7e14;margin-top:4px;">'+statsRiesgos.alto+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Medio</div><div style="font-size:18px;font-weight:800;color:#fbbf24;margin-top:4px;">'+statsRiesgos.medio+'</div></div>'
    +'<div style="background:white;border:1px solid #fca5a5;border-radius:6px;padding:10px;"><div style="font-size:10px;font-weight:700;color:#991b1b;text-transform:uppercase;">Nivel Bajo</div><div style="font-size:18px;font-weight:800;color:#28a745;margin-top:4px;">'+statsRiesgos.bajo+'</div></div>'
    +'</div>'
    +'<input type="text" id="filtro-riesgos" placeholder="Filtrar por nombre o NIT..." onkeyup="window.filtrarReportePorTercero(\'riesgos\')" style="width:100%;padding:8px 12px;border:1px solid #fca5a5;border-radius:6px;font-size:12px;font-family:inherit;box-sizing:border-box;">'
    +'<div id="label-filtro-riesgos" style="font-size:10px;color:#991b1b;margin-top:4px;">'+lista.length+' registros mostrados</div>'
    +'</div>'
    +'<div style="overflow-x:auto;">'
    +'<table id="tabla-riesgos" style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="background:#fff5f5;border-bottom:2px solid #dc3545;">'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Tercero / NIT</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Cantidad Riesgos</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Tipología de Riesgo</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Calificación Inherente</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:center;">Calificación Residual</th>'
    +'<th style="padding:9px 12px;color:#7c2d12;font-size:11px;text-align:left;">Plan de Mitigación</th>'
    +'</tr></thead><tbody>'
    +lista.map(function(t,i){
      var rgs=riesgosDB.filter(function(r){return r.tercero===t.nombre||r.nit===t.nit;});
      if(!rgs.length) return'<tr style="background:'+(i%2?'#fff8f8':'white')+';border-bottom:1px solid #f0f0f0;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>'
        +'<td style="padding:9px 12px;text-align:center;color:#aaa;font-size:11px;" colspan="5">Sin riesgos registrados aún</td></tr>';
      return rgs.map(function(r,j){
        var inh=_reporteNivelRiesgo(r,false)||'No definido',res=_reporteNivelRiesgo(r,true)||'No definido',trat=r.tratamiento||r.accion||'Por definir';
        var tipologiaCompleta = window.getNombreTipologia(r.tipologia||r.tipo||'');
        var ic=inh==='ALTO'||inh==='CRITICO'||inh==='EXTREMO'?'#dc3545':inh==='MEDIO'?'#fd7e14':'#28a745';
        var rc=res==='ALTO'||res==='CRITICO'||res==='EXTREMO'?'#dc3545':res==='MEDIO'?'#fd7e14':'#28a745';
        return'<tr style="background:'+(i%2?'#fff8f8':'white')+';border-bottom:1px solid #f0f0f0;">'
          +(j===0?'<td style="padding:9px 12px;" rowspan="'+rgs.length+'"><div style="font-weight:700;color:#1a3a5c;font-size:12.5px;">'+(t.nombre||'—')+'</div><div style="font-size:10px;color:#aaa;">'+(t.nit||'—')+'</div></td>':'')
          +(j===0?'<td style="padding:9px 12px;text-align:center;font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:#dc3545;" rowspan="'+rgs.length+'">'+rgs.length+'</td>':'')
          +'<td style="padding:9px 12px;font-size:11.5px;color:#374151;">'+tipologiaCompleta+'</td>'
          +'<td style="padding:9px 12px;text-align:center;"><span style="padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;color:white;background:'+ic+';">'+inh+'</span></td>'
          +'<td style="padding:9px 12px;text-align:center;"><span style="padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700;color:white;background:'+rc+';">'+res+'</span></td>'
          +'<td style="padding:9px 12px;font-size:11px;color:#374151;">'+trat+'</td>'
          +'</tr>';
      }).join('');
    }).join('')
    +'</tbody></table></div></div>'
    +'</div>';

  }

  wrap.innerHTML=h;
};

// Funciones auxiliares para toggle de secciones (operativos)
window.toggleReporteFaseOp = function(fase){
  var btn = document.getElementById('btn-toggle-' + fase + '-op');
  var div = document.getElementById('rpt-fase-' + fase + '-op');
  if(!btn || !div) return;
  var isOpen = div.style.display !== 'none';
  div.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '▶ ' : '▼ ';
};

// Populate nu-entidad with registered entities when opening new user modal
(function(){
  var _orig = window.abrirNuevoUsuarioIS;
  window.abrirNuevoUsuarioIS = function(){
    if(_orig) _orig.apply(this, arguments);
    setTimeout(function(){
      var entInput = document.getElementById('nu-entidad');
      if(entInput && entInput.tagName === 'INPUT'){
        // Replace input with a select
        var wrapper = entInput.parentElement;
        var sel = document.createElement('select');
        sel.id = 'nu-entidad';
        sel.style.cssText = entInput.style.cssText || 'width:100%;padding:9px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;';
        sel.innerHTML = '<option value="">— Seleccionar organización —</option>';
        // Add from registered entidades
        var entidades = getISEntidades();
        entidades.forEach(function(e){
          var o = document.createElement('option'); o.value=e.nombre; o.textContent=e.nombre; sel.appendChild(o);
        });
        // Add manual option
        var oManual = document.createElement('option'); oManual.value='__manual__'; oManual.textContent='+ Escribir nombre...'; sel.appendChild(oManual);
        sel.onchange = function(){
          if(sel.value==='__manual__'){
            var n=prompt('Nombre de la entidad:');
            if(n&&n.trim()) sel.value=n.trim();
            else sel.value='';
          }
        };
        wrapper.replaceChild(sel, entInput);
      }
    }, 100);
  };
})();


window._verDetalleEntidad = function(entId){
  window.goPageIS('admin-pg-reportes-entidad');
  setTimeout(function(){
    var s = document.getElementById('rpe-filtro-entidad');
    if(s){ s.value = entId; window.renderReportesPorEntidad(); }
  }, 200);
};

