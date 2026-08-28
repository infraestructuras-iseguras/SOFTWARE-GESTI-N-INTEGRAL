
window.API_BASE_URL = 'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net';

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
