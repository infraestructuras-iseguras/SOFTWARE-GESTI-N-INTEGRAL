
// ⭐ FIX PARA EVALUADOR: MOSTRAR EMPRESA + CONTRATO + PREGUNTAS
console.log('🔧 Iniciando fix para EVALUADOR...');

setTimeout(function(){
  // Verificar si es evaluador
  var esEvaluador = window.currentUser && window.currentUser.rol === 'evaluador';
  console.log('¿Es evaluador?', esEvaluador);
  
  if(!esEvaluador) return;
  // El flujo canónico ya respeta tipologías, controles y progreso asignados.
  if(typeof window.cargarCuestionarioTercero==='function' || typeof window._ctrlsCuest==='function') return;
  
  console.log('✅ Es EVALUADOR, cargando datos...');
  
  // Buscar elementos del Ambiente de Control
  var selTercero = document.getElementById('ac-tercero-instruc');
  var selTipologia = document.getElementById('ac-tip-filtro');
  var qWrap = document.getElementById('q-secciones-wrap');
  
  if(!selTercero || !selTipologia || !qWrap) {
    console.error('❌ Faltan elementos:', {selTercero, selTipologia, qWrap});
    return;
  }
  
  console.log('✅ Encontré todos los elementos');
  
  // Función para renderizar preguntas SOLO para el evaluador
  window._evaluadorMostrarPreguntas = function(){
    var nit = selTercero.value;
    var tipologia = selTipologia.value;
    
    console.log('📋 Evaluador - NIT:', nit, 'Tipología:', tipologia);
    
    // Si no hay tipología seleccionada
    if(!tipologia || tipologia === '') {
      qWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#999;font-size:14px;">👆 Selecciona una tipología para ver las preguntas</div>';
      return;
    }
    
    // Si no hay NIT
    if(!nit) {
      qWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#999;font-size:14px;">❌ Selecciona un tercero primero</div>';
      return;
    }
    
    // Obtener preguntas
    var pregs = window.PREGUNTAS_CUESTIONARIO || {};
    var pregList = pregs[tipologia] || [];
    
    console.log('Total preguntas de', tipologia + ':', pregList.length);
    
    // Filtrar SOLO preguntas ACTIVAS
    var pregActivas = pregList.filter(function(p){ return p && p.activa === true; });
    console.log('Preguntas ACTIVAS:', pregActivas.length);
    
    if(!pregActivas.length) {
      qWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#999;font-size:14px;">❌ No hay preguntas activas para esta tipología</div>';
      return;
    }
    
    // Renderizar HTML
    var html = '<div style="padding:16px;background:#f0f4f8;border-radius:8px;border:1px solid #1e6bb8;">';
    html += '<div style="font-weight:700;color:#1e6bb8;margin-bottom:16px;font-size:15px;">📋 ' + tipologia + ' (' + pregActivas.length + ' preguntas)</div>';
    
    pregActivas.forEach(function(preg, idx){
      html += '<div style="margin-bottom:16px;padding:14px;background:white;border-radius:6px;border-left:4px solid #1e6bb8;box-shadow:0 2px 4px rgba(0,0,0,0.05);">';
      html += '<div style="font-weight:600;color:#333;margin-bottom:8px;font-size:13px;line-height:1.5;">' + (idx+1) + '. ' + preg.pregunta + '</div>';
      
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;">';
      var respKey = 'resp_' + preg.id;
      ['Sí', 'No', 'Parcial', 'N.A.'].forEach(function(opt){
        html += '<label style="font-size:12px;cursor:pointer;"><input type="radio" name="' + respKey + '" value="' + opt + '" style="margin-right:5px;cursor:pointer;"/> ' + opt + '</label>';
      });
      html += '</div></div>';
    });
    
    html += '</div>';
    qWrap.innerHTML = html;
    console.log('✅ Preguntas renderizadas para Evaluador');
  };
  
  // Agregar evento a tipología
  selTipologia.removeEventListener('change', window._evaluadorMostrarPreguntas);
  selTipologia.addEventListener('change', window._evaluadorMostrarPreguntas);
  
  // Agregar evento a tercero (por si cambia)
  selTercero.removeEventListener('change', window._evaluadorMostrarPreguntas);
  selTercero.addEventListener('change', window._evaluadorMostrarPreguntas);
  
  console.log('✅ Eventos agregados para EVALUADOR');
  
  // Si ya hay algo seleccionado, renderizar
  if(tipologia && tipologia !== '') {
    window._evaluadorMostrarPreguntas();
  }
  
}, 1000);

console.log('✅ Script para EVALUADOR cargado');

// ═════════════════════════════════════════════════════════════════════════════
// 🔥 CARGAR 3 TERCEROS CON DATOS COMPLETOS AL INICIAR
// ═════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // La instalación productiva inicia vacía y obtiene los terceros desde la API.
    // No insertar registros de demostración cuando el saneamiento está activo.
    if (window.SGRT_DISABLE_AUTO_DEMO) return;
    console.log('[DATOS] 🔥 Inicializando 3 terceros con datos completos...');
    
    if (!window.TERCEROS_DB) window.TERCEROS_DB = {};
    // No sobrescribir datos reales o ya sincronizados. El seed queda como
    // respaldo visual únicamente para una instalación completamente vacía.
    if (Object.keys(window.TERCEROS_DB).length > 0) return;
    
    // TERCERO 1: Deloitte
    window.TERCEROS_DB['900100001'] = {
      nit: '900100001',
      nombre: 'Deloitte Colombia',
      domicilio: 'Bogotá, Carrera 7 #45-23',
      estado: 'Aprobado',
      aprobado_clasif: true,
      habilitado_ac: true,
      prom: 4.2,
      nivel_riesgo: 'BAJO',
      supervisores: [
        { nombre: 'Juan Carlos Pérez', cargo: 'Gerente de Riesgos', proceso: 'Control Interno' },
        { nombre: 'María García López', cargo: 'Jefe de Cumplimiento', proceso: 'SARLAFT' }
      ],
      contratos: [
        { num: 'CT-2024-001', objeto: 'Asesoría en Riesgos', fini: '2024-01-15', ffin: '2024-12-31', estado: 'En Ejecucion', valor: '150000000', supervisor: 'Juan Carlos Pérez' },
        { num: 'CT-2024-002', objeto: 'Auditoría Interna', fini: '2024-02-01', ffin: '2024-06-30', estado: 'En Ejecucion', valor: '80000000', supervisor: 'María García López' }
      ],
      evaluaciones: [
        { id: 'ev1', tercero: '900100001', contrato: 'CT-2024-001', tipologia: 'Financiera', completada: true, promedio: 4.3 },
        { id: 'ev2', tercero: '900100001', contrato: 'CT-2024-002', tipologia: 'Operacional', completada: true, promedio: 5.0 }
      ]
    };
    
    // TERCERO 2: Sophos Group
    window.TERCEROS_DB['900100002'] = {
      nit: '900100002',
      nombre: 'Sophos Group',
      domicilio: 'Bogotá, Avenida Paseo de los Libertadores #500',
      estado: 'Aprobado',
      aprobado_clasif: true,
      habilitado_ac: true,
      prom: 3.8,
      nivel_riesgo: 'MEDIO',
      supervisores: [
        { nombre: 'Carlos Rodríguez', cargo: 'Director de Seguridad', proceso: 'Ciberriesgos' }
      ],
      contratos: [
        { num: 'CT-2024-003', objeto: 'Servicios de Seguridad Informática', fini: '2024-01-01', ffin: '2024-12-31', estado: 'En Ejecucion', valor: '250000000', supervisor: 'Carlos Rodríguez' }
      ],
      evaluaciones: [
        { id: 'ev3', tercero: '900100002', contrato: 'CT-2024-003', tipologia: 'Tecnología', completada: true, promedio: 2.7 }
      ]
    };
    
    // TERCERO 3: Seguridad Empresarial
    window.TERCEROS_DB['900100003'] = {
      nit: '900100003',
      nombre: 'Seguridad Empresarial S.A.',
      domicilio: 'Medellín, Calle 50 #45-70',
      estado: 'Aprobado',
      aprobado_clasif: true,
      habilitado_ac: true,
      prom: 4.5,
      nivel_riesgo: 'BAJO',
      supervisores: [
        { nombre: 'Fernando Martínez', cargo: 'Jefe de Operaciones', proceso: 'Seguridad Física' }
      ],
      contratos: [
        { num: 'CT-2024-004', objeto: 'Servicios de Vigilancia', fini: '2024-03-01', ffin: '2025-02-28', estado: 'En Ejecucion', valor: '120000000', supervisor: 'Fernando Martínez' }
      ],
      evaluaciones: [
        { id: 'ev4', tercero: '900100003', contrato: 'CT-2024-004', tipologia: 'Operacional', completada: true, promedio: 5.0 }
      ]
    };
    
    // Guardar en localStorage
    try {
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
      localStorage.setItem('sgrt_terceros_db', JSON.stringify(window.TERCEROS_DB));
      console.log('[DATOS] ✅ 3 terceros con datos completos cargados automáticamente');
    } catch(e) {
      console.warn('[DATOS] ⚠️ Error guardando datos:', e.message);
    }
  }, 400);
});

// ═════════════════════════════════════════════════════════════════════════════
// 🔒 CONTROLAR VISIBILIDAD DE MÓDULO CSV - SOLO ADMIN RIESGOS
// ═════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const rol = (window.currentUser || {}).rol;
    const csvModule = document.getElementById('csv-module-correcto');
    const csvButtonsBar = document.getElementById('csv-buttons-bar-correcto');
    
    console.log('[CSV] 🔒 Rol actual:', rol);
    
    // Solo mostrar CSV si es Admin Riesgos
    if (rol === 'Admin Riesgos' || rol === 'Administrador de Riesgos') {
      if (csvModule) csvModule.style.display = 'block';
      console.log('[CSV] ✅ CSV visible para Admin Riesgos');
    } else {
      if (csvModule) csvModule.style.display = 'none';
      if (csvButtonsBar) csvButtonsBar.style.display = 'none';
      console.log('[CSV] ❌ CSV oculto para', rol);
    }
  }, 200);
});
// ==================== SISTEMA DE NOTIFICACIONES MEJORADO ====================
let notificaciones = [];

function toggleNotifDrawer(client) {
    const drawer = document.getElementById('notif-drawer');
    if (drawer) {
        drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
        if (drawer.style.display === 'block') {
            markAllAsRead();
        }
    }
}

function agregarNotificacion(mensaje, tipo = 'info', icono = '') {
    const ahora = new Date();
    notificaciones.unshift({
        id: Date.now(),
        mensaje: mensaje,
        tipo: tipo,
        icono: icono,
        fecha: ahora,
        leida: false
    });
    actualizarPanelNotificaciones();
}

function actualizarPanelNotificaciones() {
    const panel = document.getElementById('notif-panel');
    const badge = document.getElementById('notif-badge');
    if (!panel || !badge) return;
    
    const noLeidas = notificaciones.filter(n => !n.leida).length;
    badge.textContent = noLeidas;
    badge.style.display = noLeidas > 0 ? 'block' : 'none';
    
    if (notificaciones.length === 0) {
        panel.innerHTML = '<div style="text-align:center;padding:30px;color:#6c757d;font-size:13px;">Sin notificaciones aún</div>';
        return;
    }
    
    panel.innerHTML = notificaciones.map(notif => {
        const diff = new Date() - notif.fecha;
        const minutos = Math.floor(diff / 60000);
        const tiempo = minutos < 1 ? 'hace un momento' : minutos < 60 ? `hace ${minutos} min` : `hace ${Math.floor(minutos/60)} h`;
        
        return `<div onclick="marcarComoLeida(${notif.id})" style="padding:12px 16px;border-bottom:1px solid #f0f0f0;cursor:pointer;background:${notif.leida ? '#fff' : '#e3f2fd'};display:flex;align-items:flex-start;">
            <div style="font-size:20px;margin-right:10px;">${notif.icono}</div>
            <div style="flex:1;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#2c3e50;font-weight:${notif.leida ? '400' : '600'};">${notif.mensaje}</p>
                <span style="font-size:11px;color:#888;">${tiempo}</span>
            </div>
        </div>`;
    }).join('');
}

function marcarComoLeida(id) {
    const notif = notificaciones.find(n => n.id === id);
    if (notif) {
        notif.leida = true;
        actualizarPanelNotificaciones();
    }
}

function markAllAsRead() {
    notificaciones.forEach(n => n.leida = true);
    actualizarPanelNotificaciones();
}

function sendNotification(tipo, asunto, mensaje, datos) {
    agregarNotificacion(asunto, tipo, '📧');
}

function NOTIF_LOG() {
    renderNotifPanel();
}

function renderNotifPanel() {
    actualizarPanelNotificaciones();
}

function clearNotifications() {
    if (confirm('¿Eliminar todas las notificaciones?')) {
        notificaciones = [];
        actualizarPanelNotificaciones();
    }
}

function notificarNuevoTercero(nombre) {
    agregarNotificacion(`✅ Nuevo tercero registrado: ${nombre}`, 'tercero', '🏢');
}

document.addEventListener('click', function(e) {
    const drawer = document.getElementById('notif-drawer');
    const btn = document.getElementById('notif-btn');
    if (drawer && btn && !drawer.contains(e.target) && !btn.contains(e.target)) {
        drawer.style.display = 'none';
    }
});
