
(function(){
  if(window.API_BASE_URL)return;
  var h=window.location.hostname||'';
  var local=h==='localhost'||h==='127.0.0.1'||h.indexOf('192.168.')===0;
  window.API_BASE_URL=local?'http://'+h+':3000':(h&&h.indexOf('azurewebsites.net')>=0?window.location.origin:'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net');
})();

window._lsSyncWithAzure = async function(){
  if(!window.TERCEROS_DB) return;
  const db = window.TERCEROS_DB;
  
  for(const nit of Object.keys(db)){
    const t = db[nit];
    if(!t.sincronizado || t._changed){
      try{
        const payload = {
          tercero: {
            NIT: nit,
            NombreTercero: t.nombre || '',
            ServicioContratado: t.servicioContratado || '',
            SupervisorNombre: t.supervisor || '',
            PromedioCriticidad: parseFloat(t.prom) || 0,
            Zona_Riesgo: t.zona || 'BAJO',
            Periodicidad: t.periodicidad || 'Anual',
            UsuarioRegistro: window._usuarioActual || 'admin_riesgos',
          },
          evaluaciones: (t.dims || [])
            .filter(d => d.val !== '' && d.val != null)
            .map(d => ({
              DominioID: window._getDominioIDFromKey ? window._getDominioIDFromKey(d.key) : 1,
              Valoracion: d.val,
              Zona_Riesgo: d.zona || t.zona || 'BAJO',
              Periodicidad: d.periodicidad || 'Anual',
            })),
        };

        const r = await fetch(window.API_BASE_URL + '/api/clasificacion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await r.json();
        if(result.ok){
          t.sincronizado = true;
          t._changed = false;
          console.log('✅ Sincronizado con Azure:', nit);
        } else {
          console.error('❌ Error sincronizando:', result.error);
        }
      }catch(e){
        console.error('❌ Error sync Azure:', e.message);
      }
    }
  }
};

// Helper para mapear keys a dominios
window._getDominioIDFromKey = function(key){
  const map = {op:1, cn:2, si:3, cu:4, fr:5, laft:6};
  return map[(key||'').toLowerCase()] || 1;
};

// Verificar conexión al cargar
setTimeout(async () => {
  try{
    const r = await fetch(window.API_BASE_URL + '/test-db');
    if(r.ok){
      const data = await r.json();
      console.log('✅ Conexión a Azure BD:', data);
    }
  }catch(e){
    console.warn('⚠️ Servidor Azure no disponible:', e.message);
  }
}, 2000);

// ─── CONTROL DE BASE DE DATOS ───
window.bdLog = function(msg){
  // Silencio: no mostrar logs en el modal (mantener limpio)
};

window.bdActualizarEstado = function(){
  try{
    // localStorage
    var ls = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    var lsCount = Object.keys(ls).length;
    document.getElementById('bd-ls-count').textContent = lsCount + ' terceros';

    // Sincronizados
    var syncCount = Object.values(ls).filter(function(t){return t.sincronizado;}).length;
    document.getElementById('bd-sync-count').textContent = syncCount + '/' + lsCount;
  }catch(e){
    bdLog('❌ Error actualizando estado: '+e.message);
  }
};

window.bdSincronizarAhora = function(){
  bdLog('🚀 Sincronización local (localStorage)...');
  try{
    var db = window.TERCEROS_DB || (typeof TERCEROS_DB!=='undefined' ? TERCEROS_DB : {});
    var lista = Object.values(db);
    var count = 0;
    
    if(!lista || lista.length === 0){
      showToast('ℹ️ No hay registros para sincronizar','info',2500);
      bdLog('ℹ️ Base de datos vacía');
      bdActualizarEstado();
      return;
    }
    
    lista.forEach(function(t){
      if(t.nit){
        t.sincronizado = true;
        count++;
        bdLog('✅ Guardado: '+t.nombre+' ('+t.nit+')');
      }
    });
    
    // Guardar TODO en localStorage
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(db));
    console.log('✅ localStorage actualizado:', db);
    
    if(window._lsSave) window._lsSave();
    
    var msg = '✅ '+count+' terceros sincronizados';
    bdLog(msg);
    showToast(msg, 'success', 2500);
    
    setTimeout(function(){ bdActualizarEstado(); }, 500);
  }catch(e){
    console.error('Error en sincronización:', e);
    showToast('❌ Error al sincronizar: '+e.message, 'error', 3000);
    bdLog('❌ Error: '+e.message);
  }
};

window.bdVerificarConexion = function(){
  bdLog('🔗 Verificando almacenamiento local...');
  try{
    var ls = localStorage.getItem('sgrt_terceros_db_shared');
    if(ls){
      var db = JSON.parse(ls);
      var count = Object.keys(db).length;
      var msg = '✅ Almacenamiento OK: '+count+' registros';
      bdLog(msg);
      showToast(msg, 'success', 2500);
      document.getElementById('bd-azure-count').textContent = '✅ OK ('+count+' reg.)';
    } else {
      var msg2 = '⚠️ Almacenamiento vacío - No hay datos guardados';
      bdLog(msg2);
      showToast(msg2, 'warning', 2500);
      document.getElementById('bd-azure-count').textContent = '⚠️ Vacío';
    }
  }catch(e){
    console.error('Error verificando:', e);
    bdLog('❌ Error: '+e.message);
    showToast('❌ Error: '+e.message, 'error', 3000);
    document.getElementById('bd-azure-count').textContent = '❌ Error';
  }
};

window.bdLimpiarLocalStorage = function(){
  if(!confirm('⚠️ ¿Limpiar COMPLETAMENTE todo el localStorage?\n\nSe eliminará TODO caché local pero la BD Azure permanecerá intacta.')){
    return;
  }
  try{
    var keysToDelete = [];
    for(var i = 0; i < localStorage.length; i++){
      keysToDelete.push(localStorage.key(i));
    }
    keysToDelete.forEach(function(key){
      localStorage.removeItem(key);
    });
    bdLog('🗑️ ✅ localStorage COMPLETAMENTE LIMPIADO ('+keysToDelete.length+' keys eliminadas)');
    setTimeout(function(){ location.reload(); }, 1500);
  }catch(e){
    bdLog('❌ Error limpiando: '+e.message);
  }
};

// Función para abrir modal de BD desde el dashboard iseguras
window.openBDAzureModal = function(){
  var modal = document.getElementById('modal-bd-azure');
  if(modal) modal.style.display = 'flex';
  setTimeout(function(){ bdActualizarEstado(); bdVerificarConexion(); }, 100);
};

// ═══ GESTIÓN DINÁMMICA DE AÑOS ═══
window.inicializarAnosDashboard = function(){
  try{
    var anos = JSON.parse(localStorage.getItem('sgrt_anos_disponibles')) || [2026];
    var select = document.getElementById('admin-filtro-ano');
    if(select){
      select.innerHTML = '';
      anos.sort((a,b) => a-b).forEach(ano => {
        var opt = document.createElement('option');
        opt.value = ano;
        opt.text = ano;
        opt.style.background = '#1e6bb8';
        select.appendChild(opt);
      });
      select.value = anos[anos.length - 1]; // Seleccionar el más reciente
    }
  }catch(e){}
};

window.renderAnosDisponibles = function(){
  try{
    var anos = JSON.parse(localStorage.getItem('sgrt_anos_disponibles')) || [2026];
    var container = document.getElementById('anos-disponibles-list');
    if(container){
      container.innerHTML = '';
      anos.sort((a,b) => a-b).forEach(ano => {
        var badge = document.createElement('div');
        badge.style.cssText = 'background:#e0e7ff;border:1px solid #a5b4fc;color:#312e81;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:600;display:flex;align-items:center;gap:8px;';
        badge.innerHTML = '<span>'+ano+'</span><button onclick="window.eliminarAno('+ano+')" style="background:none;border:none;color:#7c3aed;cursor:pointer;font-size:14px;padding:0;margin:0;">×</button>';
        container.appendChild(badge);
      });
    }
  }catch(e){}
};

window.actualizarConfigBD = function(){
  try{
    // Mantener visibles los contadores reales del respaldo local.
    var raw=localStorage.getItem('sgrt_terceros_db_shared')||'{}',local=JSON.parse(raw),total=Object.keys(local||{}).length,sync=Object.values(local||{}).filter(function(t){return t&&t.sincronizado;}).length;
    var lc=document.getElementById('config-local-count');if(lc)lc.textContent=total;
    var sc=document.getElementById('config-sync-count');if(sc)sc.textContent=sync+'/'+total;
    var az=document.getElementById('config-azure-status');if(az&&(!az.textContent||az.textContent==='—'))az.textContent='Sin verificar';
    window.renderAnosDisponibles();
  }catch(e){}
};

window.inicializarAnosDashboard = function(){
  try{
    var anos = JSON.parse(localStorage.getItem('sgrt_anos_disponibles')) || [2026];
    var select = document.getElementById('admin-filtro-ano');
    if(select){
      select.innerHTML = '';
      anos.sort((a,b) => a-b).forEach(ano => {
        var opt = document.createElement('option');
        opt.value = ano;
        opt.text = ano;
        opt.style.background = '#1e6bb8';
        select.appendChild(opt);
      });
      select.value = anos[anos.length - 1]; // Seleccionar el más reciente
    }
  }catch(e){}
};

window.actualizarDashboardAno = function(){
  try{
    var anoSeleccionado = document.getElementById('admin-filtro-ano').value;
    localStorage.setItem('sgrt_ano_actual', anoSeleccionado);
    // Aquí se pueden agregar filtros posteriores por año
  }catch(e){}
};

window.agregarAno = function(){
  try{
    var nuevoAno = prompt('Ingrese el nuevo año (ej: 2027):');
    if(nuevoAno && /^\d{4}$/.test(nuevoAno)){
      var anos = JSON.parse(localStorage.getItem('sgrt_anos_disponibles')) || [2026];
      if(!anos.includes(parseInt(nuevoAno))){
        anos.push(parseInt(nuevoAno));
        localStorage.setItem('sgrt_anos_disponibles', JSON.stringify(anos));
        window.inicializarAnosDashboard();
        window.renderAnosDisponibles();
        bdLog('✅ Año '+nuevoAno+' agregado');
      } else {
        alert('El año ya existe');
      }
    }
  }catch(e){}
};

window.eliminarAno = function(ano){
  try{
    if(confirm('¿Eliminar año '+ano+'? Se perderán todos los datos de ese año.')){
      var anos = JSON.parse(localStorage.getItem('sgrt_anos_disponibles')) || [2026];
      anos = anos.filter(a => a !== parseInt(ano));
      if(anos.length === 0) anos = [2026];
      localStorage.setItem('sgrt_anos_disponibles', JSON.stringify(anos));
      window.inicializarAnosDashboard();
      window.renderAnosDisponibles();
      bdLog('✅ Año '+ano+' eliminado');
    }
  }catch(e){}
};

// ═══ FECHA REAL DEL DASHBOARD ═══
window.actualizarFechaReal = function(){
  try{
    var hoy = new Date();
    var diasSemana = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    var fechaFormato = diasSemana[hoy.getDay()]+', '+hoy.getDate()+' de '+meses[hoy.getMonth()]+' de '+hoy.getFullYear();
    
    var elem = document.getElementById('admin-dash-fecha');
    if(elem) elem.textContent = fechaFormato;
  }catch(e){}
};

// Inicializar al cargar dashboard
window.onDashboardLoad = function(){
  window.inicializarAnosDashboard();
  window.actualizarFechaReal();
};

window.mostrarBotonBDFlotante = function(){
  try{
    var btnFloatante = document.getElementById('btn-bd-iseguras-flotante');
    // Solo ISEGURAS ve el botón
    if(window.currentUser && window.currentUser.login === 'iseguras2026'){
      if(btnFloatante) btnFloatante.style.display = 'block';
    } else {
      if(btnFloatante) btnFloatante.style.display = 'none';
    }
  }catch(e){}
};

// Alternar desplegables en reportes por fase
window.toggleReporteFase = function(faseId){
  var el = document.getElementById('rpt-fase-'+faseId);
  if(el){
    var isOpen = el.style.display !== 'none';
    el.style.display = isOpen ? 'none' : 'block';
    var btn = document.getElementById('btn-toggle-'+faseId);
    if(btn) btn.innerHTML = isOpen ? '▶ Mostrar' : '▼ Ocultar';
  }
};

// Filtrar reportes por tercero/NIT dentro de cada fase
window.filtrarReportePorTercero = function(faseId){
  var input = document.getElementById('filtro-'+faseId);
  var tabla = document.getElementById('tabla-'+faseId);
  if(!input || !tabla) return;
  var filtro = input.value.toLowerCase();
  var filas = tabla.querySelectorAll('tbody tr');
  var visible = 0;
  filas.forEach(function(row){
    var nombreTercero = (row.querySelector('td')?.textContent || '').toLowerCase();
    var niTercero = (row.querySelectorAll('td')[1]?.textContent || '').toLowerCase();
    var coincide = nombreTercero.includes(filtro) || niTercero.includes(filtro);
    row.style.display = coincide ? '' : 'none';
    if(coincide) visible++;
  });
  var labelFiltro = document.getElementById('label-filtro-'+faseId);
  if(labelFiltro) labelFiltro.textContent = visible + ' registros mostrados';
};

window.bdLimpiarBD = function(){
  // Verificar que solo ISEGURAS puede limpiar
  if(window.currentUser && window.currentUser.login !== 'iseguras2026'){
    bdLog('❌ Error: Solo ISEGURAS puede limpiar la base de datos');
    alert('Solo el rol ISEGURAS (Configuración) puede limpiar la base de datos');
    return;
  }
  
  if(!confirm('⚠️ ¿LIMPIAR TODO EL ALMACENAMIENTO LOCAL?\n\nEsta acción NO se puede deshacer.')){
    return;
  }
  
  var confirmText = prompt('Escribe LIMPIAR para confirmar:');
  if(confirmText !== 'LIMPIAR'){
    bdLog('❌ Operación cancelada');
    return;
  }
  
  bdLog('🔴 Limpiando almacenamiento local...');
  try{
    // LIMPIAR TODAS LAS VARIABLES GLOBALES
    window._cfContratosBuffer = [];
    window.CLS_DB = {};
    window.TERCEROS_DB = {};
    window.CUEST_RESPUESTAS = {};
    window.MATRIZ_DB = [];
    window.RESULTADO_EVALUACION = {};
    window.TIPOLOGIAS_DB_CUSTOM = {};
    window.EVID_CUEST = {};
    window.CUEST_DB = {};
    window.AC_RESPUESTAS = {};
    window.CF_TERCEROS = {};
    
    // LIMPIAR LOCALSTORAGE - BORRAR KEYS ESPECÍFICAS PRIMERO
    localStorage.removeItem('sgrt_terceros_db_shared');
    localStorage.removeItem('sgrt_v8');
    localStorage.removeItem('sgrt_state');
    
    // LIMPIAR TODAS LAS DEMÁS KEYS
    var keysToDelete = [];
    for(var i=0; i<localStorage.length; i++){
      var key = localStorage.key(i);
      if(key){
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(function(key){
      localStorage.removeItem(key);
    });
    
    bdLog('🔴 ✅ Almacenamiento limpiado completamente ('+keysToDelete.length+' keys eliminadas)');
    bdLog('🔴 ✅ Buffers de contratos vaciados');
    bdLog('🔴 ✅ Todas las bases de datos limpiadas');
    
    setTimeout(function(){ 
      window.location.href = window.location.href;
    }, 1500);
  }catch(e){
    bdLog('❌ Error: '+e.message);
  }
};

window.bdExportarDatos = function(){
  var db = window.TERCEROS_DB || {};
  var data = {
    terceros: db,
    fecha: new Date().toISOString(),
    version: 'SGRT v9'
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sgrt_backup_'+new Date().getTime()+'.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  bdLog('⬇️ Datos exportados');
};

window.bdCargarDatos = function(){
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e){
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(event){
      try{
        var data = JSON.parse(event.target.result);
        if(data.terceros){
          localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(data.terceros));
          window.TERCEROS_DB = data.terceros;
          bdLog('⬆️ Datos cargados: '+Object.keys(data.terceros).length+' terceros');
          setTimeout(function(){ location.reload(); }, 1500);
        } else {
          bdLog('❌ Formato inválido');
        }
      }catch(e){
        bdLog('❌ Error parseando archivo: '+e.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// Actualizar estado al abrir modal
document.addEventListener('click', function(e){
  if(e.target.id === 'bd-open' || (e.target.closest && e.target.closest('#bd-open'))){
    document.getElementById('modal-control-bd').style.display = 'flex';
    setTimeout(function(){ bdActualizarEstado(); bdVerificarConexion(); }, 100);
  }
});

// Botón en el dashboard — SOLO para iseguras2026
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    var dash = document.getElementById('pg-dashboard');
    var usr = window.currentUser ? window.currentUser.rol : '';
    // Solo mostrar para el rol Admin (iseguras2026)
    if(dash && !document.getElementById('bd-open') && usr === 'Administrador'){
      var btn = document.createElement('button');
      btn.id = 'bd-open';
      btn.textContent = '🔧 BD';
      btn.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 16px;background:#1a3a5c;color:white;border:none;border-radius:50%;width:50px;height:50px;font-size:20px;cursor:pointer;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,.2);transition:.2s;font-weight:700;';
      btn.onmouseover = function(){this.style.background='#1e6bb8';this.style.transform='scale(1.1)';};
      btn.onmouseout = function(){this.style.background='#1a3a5c';this.style.transform='scale(1)';};
      document.body.appendChild(btn);
    }
  }, 500);
});


// ═══════════════════════════════════════════════════════════════
// PUENTE API SGRT: alta, actualización y borrado remoto
// Acepta el contrato de server.js y conserva localStorage como fallback.
// ═══════════════════════════════════════════════════════════════
(function(){
  function apiBase(){
    return String(window.API_BASE_URL || window.API_BASE || 'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');
  }
  function localDb(){
    return window.TERCEROS_DB || {};
  }
  function payloadFor(t){
    return {
      nit: t.nit || t.NIT || '',
      nombre: t.nombre || t.NombreTercero || t.Nombre_Tercero || t.Nombre || '',
      domicilio: t.domicilio || t.Domicilio || '',
      servicio_contratado: t.servicio_contratado || t.servicio || t.ServicioContratado || t.Servicio_Contratado || (Array.isArray(t.contratos) ? t.contratos.map(function(c){return c.objeto || c.servicio || c.numero || c.num || '';}).filter(Boolean).join(' | ') : ''),
      entidad: t.entidad || t.NombreEntidad || 'colpensiones',
      estado: t.estado || 'Activo',
      prom: t.prom || t.PromedioCriticidad || 0,
      zona: t.zona || t.Zona_Riesgo || 'BAJO',
      contratos: t.contratos || [],
      supervisores: t.supervisores || []
    };
  }
  window._lsSyncWithAzure = async function(){
    var db=localDb(), ok=0, fail=0;
    for(var nit of Object.keys(db)){
      var t=db[nit];
      if(!t || (t.sincronizado && !t._changed)) continue;
      try{
        var r=await fetch(apiBase()+'/api/terceros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payloadFor(t))});
        var d=await r.json().catch(function(){return {};});
        if(!r.ok || !d.ok) throw new Error(d.error || ('HTTP '+r.status));
        t.sincronizado=true;t._changed=false;ok++;
        if(Array.isArray(t.dims) && t.dims.length){
          try{await fetch(apiBase()+'/api/clasificacion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tercero:payloadFor(t),evaluaciones:t.dims})});}catch(e2){console.warn('Clasificación no sincronizada para '+nit,e2.message);}
        }
      }catch(e){fail++;console.warn('No se pudo sincronizar '+nit+': '+e.message);}
    }
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db));if(window._lsSave)window._lsSave();}catch(e3){}
    return {ok:ok,fail:fail,total:ok+fail};
  };
  window._remoteDeleteTercero = async function(nit){
    var r=await fetch(apiBase()+'/api/terceros/'+encodeURIComponent(String(nit)),{method:'DELETE',headers:{'Accept':'application/json'}});
    var d=await r.json().catch(function(){return {};});
    if(!r.ok || !d.ok) throw new Error(d.error || ('HTTP '+r.status));
    return d;
  };
  window.bdSincronizarAhora = async function(){
    try{
      var result=await window._lsSyncWithAzure();
      if(result.total===0)showToast('No hay registros locales nuevos para sincronizar','info',3000);
      else if(result.fail===0)showToast('Sincronizados en servidor: '+result.ok,'success',3000);
      else showToast('Guardados: '+result.ok+' · Fallidos: '+result.fail+' (revisa conexión/API)','warning',4000);
      if(window.bdActualizarEstado)window.bdActualizarEstado();
    }catch(e){showToast('No se pudo conectar al servidor: '+e.message,'error',4000);}
  };
})();

window.SGRT_API_CONTRATO='v3-bidireccional-terceros';

// ═══════════════════════════════════════════════════════════════
// SINCRONIZACIÓN BIDIRECCIONAL: Azure SQL ↔ interfaz SGRT
// ═══════════════════════════════════════════════════════════════
(function(){
  'use strict';
  var pulling=false;
  var lastRemoteCount=0;
  var lastRemoteSync=null;

  function apiBase(){
    return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');
  }

  async function fetchJSON(url,options){
    options=options||{};
    var controller=typeof AbortController!=='undefined'?new AbortController():null;
    var timer=controller?setTimeout(function(){controller.abort();},10000):null;
    if(controller)options.signal=controller.signal;
    try{
      var response=await fetch(url,options);
      var data=await response.json().catch(function(){return {};});
      if(!response.ok || data.ok===false){
        var error=new Error(data.error||data.message||('HTTP '+response.status));
        error.status=response.status;
        throw error;
      }
      return data;
    }finally{if(timer)clearTimeout(timer);}
  }

  function nitOf(value){return String(value&& (value.nit||value.NIT)||'').trim();}

  function remoteRecord(row){
    var nit=nitOf(row);
    return {
      nit:nit,
      NIT:nit,
      nombre:row.nombre||row.Nombre_Tercero||row.NombreTercero||'',
      nombre_tercero:row.nombre||row.Nombre_Tercero||row.NombreTercero||'',
      domicilio:row.domicilio||row.Domicilio||'',
      servicio:row.servicio_contratado||row.Servicio_Contratado||row.ServicioContratado||'',
      servicio_contratado:row.servicio_contratado||row.Servicio_Contratado||row.ServicioContratado||'',
      fecha_registro:row.Fecha_Registro||row.fecha_registro||null,
      entidad:row.entidad||row.NombreEntidad||'',
      estado:row.estado||'',
      sincronizado:true,
      _changed:false,
      localOnly:false,
      origen:'azure-sql'
    };
  }

  function localSnapshot(){
    var out={};
    try{Object.assign(out,JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}')||{});}catch(e){}
    try{Object.assign(out,window.TERCEROS_DB||{});}catch(e2){}
    return out;
  }

  function persist(db){
    window.TERCEROS_DB=db;
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db));}catch(e){}
    try{
      var snapshot=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
      snapshot.TERCEROS_DB=db;
      localStorage.setItem('sgrt_v8',JSON.stringify(snapshot));
    }catch(e2){}
  }

  function refresh(){
    ['clsInitDash','clsRender','loadIGTercerosFull','_poblarSelectorTerceroClasificar',
      'sincronizarSelectorCuestionario','acPoblarSelectorTerceroInstruc','renderMatriz',
      'renderSeguimiento','renderAprobarOp','renderCliRegistros','_isSuperAdminRefresh','updateDashboard']
      .forEach(function(name){try{if(typeof window[name]==='function')window[name]();}catch(e){}});
    try{if(window.SGRTThirdPartyFlow)window.SGRTThirdPartyFlow.refreshAll();}catch(e2){}
  }

  function payloadFor(t){
    return {
      nit:t.nit||t.NIT||'',
      nombre:t.nombre||t.NombreTercero||t.Nombre_Tercero||t.Nombre||'',
      domicilio:t.domicilio||t.Domicilio||'',
      servicio_contratado:t.servicio_contratado||t.servicio||t.ServicioContratado||t.Servicio_Contratado||
        (Array.isArray(t.contratos)?t.contratos.map(function(c){return c.objeto||c.servicio||c.numero||c.num||'';}).filter(Boolean).join(' | '):''),
      entidad:t.entidad||t.NombreEntidad||'colpensiones',
      estado:t.estado||'Activo'
    };
  }

  window._lsPullFromAzure=async function(options){
    options=options||{};
    // Mientras la limpieza V5 está pendiente no copiar de nuevo desde SQL
    // registros que todavía esperan su DELETE remoto.
    if(window.SGRT_BLOCK_REMOTE_PULL&&!options.allowDuringCleanup){
      return {ok:false,blocked:true,count:0,data:{}};
    }
    if(pulling)return {ok:true,count:lastRemoteCount,busy:true};
    pulling=true;
    try{
      var data=await fetchJSON(apiBase()+'/api/terceros',{headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
      var rows=Array.isArray(data.data)?data.data:[];
      var excluded={};
      (window.SGRT_EXCLUDED_REMOTE_NITS||[]).forEach(function(n){excluded[String(n)]=true;});
      (options.excludeNits||[]).forEach(function(n){excluded[String(n)]=true;});
      var previous=localSnapshot();
      var next={};

      rows.forEach(function(row){
        var remote=remoteRecord(row),nit=remote.nit;
        if(!nit||excluded[nit])return;
        // Los datos ricos del flujo (contratos, respuestas, clasificación) siguen locales;
        // SQL prevalece en los campos maestros.
        var prior=previous[nit]||{};
        next[nit]=Object.assign({},prior,remote);
        // La tabla SQL heredada no siempre almacena la organización. Conservar
        // la entidad del alta local; un INSERT SQL directo queda en Colpensiones.
        if(!remote.entidad)next[nit].entidad=prior.entidad||'colpensiones';
        // La tabla dbo.Terceros no guarda el estado de las fases. No permitir
        // que cada lectura remota convierta una aprobación local en "Activo".
        if(!remote.estado)next[nit].estado=prior.estado||'Activo';
      });

      // Si un alta local todavía no alcanzó el servidor, no se pierde durante un GET.
      Object.keys(previous).forEach(function(nit){
        var item=previous[nit];
        var pending=item && !item.demo && item.sincronizado!==true && item._changed!==false;
        if(!next[nit]&&!excluded[nit]&&pending)next[nit]=item;
      });

      persist(next);
      lastRemoteCount=rows.filter(function(row){return !excluded[nitOf(row)];}).length;
      lastRemoteSync=new Date();
      refresh();
      updateStatus(true);
      return {ok:true,count:lastRemoteCount,data:next};
    }catch(e){
      updateStatus(false,e.message);
      if(!options.silent)throw e;
      return {ok:false,error:e.message,count:lastRemoteCount};
    }finally{pulling=false;}
  };

  window._lsSyncWithAzure=async function(){
    var db=localSnapshot(),ok=0,fail=0;
    for(var nit of Object.keys(db)){
      var t=db[nit];
      if(!t||(t.sincronizado===true&&!t._changed))continue;
      try{
        await fetchJSON(apiBase()+'/api/terceros',{
          method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payloadFor(t))
        });
        t.sincronizado=true;t._changed=false;t.localOnly=false;ok++;
      }catch(e){fail++;console.warn('No se pudo sincronizar '+nit+': '+e.message);}
    }
    persist(db);
    if(ok>0)await window._lsPullFromAzure({silent:true});
    return {ok:ok,fail:fail,total:ok+fail};
  };

  window._remoteDeleteTercero=async function(nit,options){
    options=options||{};
    try{
      return await fetchJSON(apiBase()+'/api/terceros/'+encodeURIComponent(String(nit)),{method:'DELETE',headers:{'Accept':'application/json'}});
    }catch(e){
      if(options.allowNotFound&&e.status===404)return {ok:true,notFound:true,nit:String(nit)};
      throw e;
    }
  };

  function setText(id,text){var el=document.getElementById(id);if(el)el.textContent=text;}
  function updateStatus(connected,error){
    setText('bd-conexion-status',connected?'✅ Conectada':'❌ Sin conexión'+(error?' · '+error:''));
    setText('bd-registros-count',String(lastRemoteCount));
    setText('bd-ultima-sync',lastRemoteSync?lastRemoteSync.toLocaleString('es-CO'):'Nunca');
    setText('bd-azure-count',connected?'✅ '+lastRemoteCount+' registros':'❌ Sin conexión');
    setText('config-azure-status',connected?'Conectada · '+lastRemoteCount+' registros':'Sin conexión');
  }

  window.bdActualizarEstado=function(){
    var local=localSnapshot(),total=Object.keys(local).length;
    var synced=Object.values(local).filter(function(t){return t&&t.sincronizado===true;}).length;
    setText('bd-ls-count',total+' terceros');setText('bd-sync-count',synced+'/'+total);
    setText('config-local-count',String(total));setText('config-sync-count',synced+'/'+total);
    setText('bd-registros-count',String(lastRemoteCount));
  };

  window.bdVerificarConexion=async function(){
    try{
      await fetchJSON(apiBase()+'/test-db',{headers:{'Accept':'application/json','Cache-Control':'no-cache'}});
      var result=await window._lsPullFromAzure();
      if(typeof showToast==='function')showToast('Base de datos conectada: '+result.count+' registros','success',3000);
      return result;
    }catch(e){
      updateStatus(false,e.message);
      if(typeof showToast==='function')showToast('No se pudo conectar a la base de datos: '+e.message,'error',4000);
      throw e;
    }
  };

  window.bdSincronizarAhora=async function(){
    try{
      var pushed=await window._lsSyncWithAzure();
      var pulled=await window._lsPullFromAzure();
      var message='Servidor: '+pulled.count+' registros · enviados: '+pushed.ok;
      if(pushed.fail)message+=' · fallidos: '+pushed.fail;
      if(typeof showToast==='function')showToast(message,pushed.fail?'warning':'success',4000);
      window.bdActualizarEstado();
      return {push:pushed,pull:pulled};
    }catch(e){
      if(typeof showToast==='function')showToast('No se pudo sincronizar: '+e.message,'error',4000);
      throw e;
    }
  };

  function autoPull(){
    if(document.visibilityState==='hidden')return;
    window._lsPullFromAzure({silent:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(autoPull,1600);});
  else setTimeout(autoPull,1600);
  window._SGRT_REMOTE_REFRESH=setInterval(autoPull,15000);
})();
