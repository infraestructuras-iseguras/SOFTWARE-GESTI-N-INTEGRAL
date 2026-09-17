
// ════════════════════════════════════════════════════════════════════
// 🤖 ASISTENTE VIRTUAL
// ════════════════════════════════════════════════════════════════════

function abrirAsistente() {
  try {
    console.log('[SGRT] 🤖 Intentando abrir asistente...');
    
    const panel = document.getElementById('chat-panel');
    const btn = document.getElementById('btn-asistente');
    
    console.log('[SGRT] panel encontrado:', !!panel);
    console.log('[SGRT] btn encontrado:', !!btn);
    
    if(!panel) {
      console.error('[SGRT] ❌ chat-panel NO EXISTE en el DOM');
      alert('❌ El asistente no está disponible en esta página');
      return;
    }
    
    // FORZAR display flex
    panel.style.display = 'flex';
    panel.style.visibility = 'visible';
    panel.style.opacity = '1';
    panel.style.zIndex = '99999';
    
    if(btn) {
      btn.style.display = 'none';
      btn.style.visibility = 'hidden';
    }
    
    console.log('[SGRT] ✅ Asistente ABIERTO - panel visible');
    
    // Focus en input después de abrir
    setTimeout(() => {
      const input = document.getElementById('input-asistente');
      console.log('[SGRT] Input encontrado:', !!input);
      if(input) {
        input.focus();
        input.placeholder = 'Escribe tu pregunta aquí...';
        console.log('[SGRT] ✅ Input en foco');
      }
    }, 200);
    
  } catch(e) {
    console.error('[SGRT] ❌ ERROR en abrirAsistente:', e.message, e.stack);
    alert('❌ Error al abrir asistente: ' + e.message);
  }
}

function cerrarAsistente() {
  try {
    console.log('[SGRT] 🤖 Cerrando asistente...');
    
    const panel = document.getElementById('chat-panel');
    const btn = document.getElementById('btn-asistente');
    
    if(panel) {
      panel.style.display = 'none';
      panel.style.visibility = 'hidden';
    }
    
    if(btn) {
      btn.style.display = 'flex';
      btn.style.visibility = 'visible';
    }
    
    console.log('[SGRT] ✅ Asistente CERRADO');
  } catch(e) {
    console.error('[SGRT] ❌ ERROR en cerrarAsistente:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN: Verificar conexión real a Azure SQL
// ═══════════════════════════════════════════════════════════════════

window.verificarConexionBD = function() {
  console.log('[BD] 🔄 Verificando conexión a Azure SQL...');
  
  const indicador = document.getElementById('db-status-indicator');
  const textoStatus = document.getElementById('db-status-text');
  const btnVerificar = event?.target;
  
  if(btnVerificar) btnVerificar.disabled = true;
  if(btnVerificar) btnVerificar.textContent = '⏳ Verificando...';
  
  // Intentar conexión a /test-db (backend)
  fetch('/test-db')
    .then(response => response.json())
    .then(data => {
      console.log('[BD] ✅ Respuesta de BD:', data);
      
      if(data.ok && data.connected) {
        // ✅ Conectado
        indicador.style.background = '#22c55e';
        indicador.style.boxShadow = '0 0 8px rgba(34,197,94,.6)';
        textoStatus.textContent = '🟢 CONECTADA';
        textoStatus.style.color = '#15803d';
        
        showToast('✅ Conexión a Azure SQL verificada exitosamente', 'success', 3000);
        console.log('[BD] ✅ Servidor:', data.server);
        console.log('[BD] ✅ BD:', data.database);
      } else {
        // ❌ No conectado
        indicador.style.background = '#dc3545';
        indicador.style.boxShadow = '0 0 8px rgba(220,53,69,.6)';
        textoStatus.textContent = '🔴 DESCONECTADA';
        textoStatus.style.color = '#991b1b';
        
        showToast('❌ No hay conexión a Azure SQL', 'error', 3000);
        console.error('[BD] ❌ Error:', data.error || data.message);
      }
    })
    .catch(err => {
      console.error('[BD] ❌ Error conectando:', err);
      
      indicador.style.background = '#dc3545';
      indicador.style.boxShadow = '0 0 8px rgba(220,53,69,.6)';
      textoStatus.textContent = '🔴 DESCONECTADA';
      textoStatus.style.color = '#991b1b';
      
      showToast('❌ Error: ' + err.message, 'error', 3000);
    })
    .finally(() => {
      if(btnVerificar) {
        btnVerificar.disabled = false;
        btnVerificar.textContent = '🔄 Verificar Conexión';
      }
    });
};

// Verificar conexión automáticamente al cargar la página (solo ISEGURAS)
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    if(window.currentUser && window.currentUser.rol === 'iseguras'){
      console.log('[BD] 🚀 Auto-verificando conexión en carga inicial...');
      window.verificarConexionBD?.();
    }
  }, 2000);
});

function enviarMensajeAsistente() {
  try {
    console.log('[SGRT] 💬 Enviando mensaje...');
    
    const input = document.getElementById('input-asistente');
    if(!input) {
      console.error('[SGRT] ❌ input-asistente NO ENCONTRADO');
      return;
    }
    
    const msg = input.value.trim();
    console.log('[SGRT] Mensaje:', msg);
    
    if (!msg) {
      console.warn('[SGRT] ⚠️ Mensaje vacío');
      return;
    }
    
    const chat = document.getElementById('mensajes-chat');
    if(!chat) {
      console.error('[SGRT] ❌ mensajes-chat NO ENCONTRADO');
      return;
    }
    
    // Mostrar pregunta del usuario
    const divUser = document.createElement('div');
    divUser.style.cssText = 'background:#e9ecef;padding:10px;border-radius:8px;font-size:11px;word-wrap:break-word;margin-bottom:6px;';
    divUser.textContent = '👤 Tú: ' + msg;
    chat.appendChild(divUser);
    
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
    
    console.log('[SGRT] ✅ Mensaje usuario mostrado');
    
    // Respuesta del asistente
    setTimeout(() => {
      try {
        const respuesta = responderPreguntaAsistente(msg);
        const divBot = document.createElement('div');
        divBot.style.cssText = 'background:white;padding:10px;border-left:4px solid #667eea;border-radius:8px;font-size:11px;line-height:1.5;word-wrap:break-word;';
        divBot.innerHTML = '🤖 Asistente:<br>' + respuesta;
        chat.appendChild(divBot);
        chat.scrollTop = chat.scrollHeight;
        
        console.log('[SGRT] ✅ Respuesta generada');
      } catch(eResp) {
        console.error('[SGRT] ❌ Error generando respuesta:', eResp.message);
      }
    }, 300);
  } catch(e) {
    console.error('[SGRT] ❌ ERROR en enviarMensajeAsistente:', e.message, e.stack);
  }
}

function responderPreguntaAsistente(q) {
  q = q.toLowerCase();
  console.log('[SGRT] 💭 Pregunta del usuario:', q);
  
  // GRÁFICOS
  if (q.includes('gráfico') || q.includes('grafico') || q.includes('chart') || q.includes('torta')) {
    return '📊 <strong>Gráficos:</strong><br>' +
      '✅ Los gráficos se renderizan automáticamente<br>' +
      '• Ve a "Informes" para ver gráficos<br>' +
      '• Hay 3 gráficos: Riesgos, Evaluaciones, Tipologías<br>' +
      '• Se actualizan cada 5 segundos automáticamente<br>' +
      '💡 Debes tener terceros clasificados para ver datos<br>' +
      '✨ Los gráficos se cargan en segundo plano';
  }
  
  // EVALUACIÓN AMBIENTE DE CONTROL
  if (q.includes('evaluación') || q.includes('evaluacion') || q.includes('ambiente') || q.includes('control')) {
    return '🔍 <strong>Evaluación Ambiente de Control:</strong><br>' +
      '1. Ve a "Evaluación Ambiente de Control"<br>' +
      '2. Selecciona un tercero (ej: Sophos Group)<br>' +
      '3. Selecciona el contrato<br>' +
      '4. En "Tipología" elige una categoría<br>' +
      '5. Aparecen las preguntas debajo<br>' +
      '6. Responde cada pregunta<br>' +
      '7. Haz clic [Guardar Evaluación]<br>' +
      '✅ Se sincroniza automáticamente';
  }
  
  // SEGUIMIENTO Y PLAN DE ACCIÓN
  if (q.includes('seguimiento') || q.includes('plan de acción') || q.includes('plan')) {
    return '📌 <strong>Seguimiento y Plan de Acción:</strong><br>' +
      '1. Ve a "Seguimiento y Plan de Acción"<br>' +
      '2. Verás KPIs en tarjetas (Total, Extremo/Alto, Pendientes, En Progreso)<br>' +
      '3. ✅ Se actualizan automáticamente cada 5 segundos<br>' +
      '4. Tabla con cada riesgo y su estado<br>' +
      '5. Editá el estado con botón ✏️<br>' +
      '6. Los datos se guardan al instante';
  }
  
  // CSV
  if (q.includes('csv') || q.includes('importar') || q.includes('excel')) {
    return '📥 <strong>Para importar CSV/Excel:</strong><br>' +
      '1. Ve a "Registro de Terceros"<br>' +
      '2. Busca botón [📥 Importar CSV]<br>' +
      '3. Arrastra tu archivo o selecciona<br>' +
      '4. Verás preview con datos<br>' +
      '5. Haz clic [✅ Importar Terceros]<br>' +
      '6. ✅ Se sincroniza con Azure SQL automáticamente<br>' +
      '💡 Datos se cargan en <3 segundos';
  }
  
  // CLASIFICACIÓN
  if (q.includes('clasificar') || q.includes('clasificación')) {
    return '📋 <strong>Para clasificar un tercero:</strong><br>' +
      '1. Ve a "Clasificación de Terceros"<br>' +
      '2. Selecciona un tercero<br>' +
      '3. Selecciona contrato (si tiene múltiples)<br>' +
      '4. Elige una tipología<br>' +
      '5. Asigna puntuaciones (1-5) a preguntas<br>' +
      '6. Haz clic [Guardar Clasificación]<br>' +
      '7. ✅ Se guarda y sincroniza automáticamente';
  }
  
  // REPORTES
  if (q.includes('reportes') || q.includes('riesgos') || q.includes('informe')) {
    return '📊 <strong>Para ver reportes e informes:</strong><br>' +
      '1. Ve a "Informes"<br>' +
      '2. PRIMERO debes clasificar terceros<br>' +
      '3. Después aparecen 3 gráficos automáticamente<br>' +
      '4. Se actualizan cada 5 segundos<br>' +
      '5. Exportá CSV si necesitas datos<br>' +
      '💡 Los datos se cargan en tiempo real';
  }
  
  // SINCRONIZACIÓN
  if (q.includes('sincronización') || q.includes('sincronizar') || q.includes('guardar') || q.includes('azure')) {
    return '⚡ <strong>Sincronización automática:</strong><br>' +
      '✅ TODO se sincroniza automáticamente:<br>' +
      '• Importar CSV → se guarda en Azure SQL<br>' +
      '• Clasificar tercero → se actualiza automáticamente<br>' +
      '• Guardar evaluación → se sincroniza al instante<br>' +
      '• Cambiar estado → se guarda en segundo plano<br>' +
      '🔄 Recarga automática cada 5 segundos<br>' +
      '✨ Sin hacer nada extra, todo funciona';
  }
  
  // AYUDA GENERAL
  if (q.includes('ayuda') || q.includes('help') || q.includes('qué puedes') || q.includes('que puedes')) {
    return '💬 <strong>Soy tu asistente SGRT. Preguntame sobre:</strong><br>' +
      '📊 Gráficos y reportes<br>' +
      '🔍 Evaluación de Ambiente de Control<br>' +
      '📌 Seguimiento y Plan de Acción<br>' +
      '📥 Importar CSV/Excel<br>' +
      '📋 Clasificación de terceros<br>' +
      '📈 Informes y análisis<br>' +
      '⚡ Sincronización de datos<br>' +
      '<br>✨ ¡Pregunta lo que necesites!';
  }
  
  // RESPUESTA POR DEFECTO
  return '💬 <strong>No estoy seguro de tu pregunta.</strong><br>' +
    '✅ Intenta preguntar sobre:<br>' +
    '📊 "¿Cómo veo gráficos?"<br>' +
    '🔍 "¿Cómo evalúo ambiente de control?"<br>' +
    '📌 "¿Cómo uso seguimiento?"<br>' +
    '📥 "¿Cómo importo CSV?"<br>' +
    '📋 "¿Cómo clasifico?"<br>' +
    '<br>💡 ¡O escribe "ayuda" para ver todas mis opciones!';
}

// Mostrar asistente para admin_riesgos
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    var user = window.currentUser;
    if (user && (user.rol === 'admin_riesgos' || user.rol === 'Operativo')) {
      var btn = document.getElementById('btn-asistente');
      if (btn) btn.style.display = 'flex';
    }
  }, 800);

  // Azure no se consulta automáticamente en la versión local.
  // Un despliegue con backend verificado puede habilitar explícitamente:
  // window.SGRT_ENABLE_REMOTE_READ = true
  if(window.SGRT_ENABLE_REMOTE_READ === true && typeof cargarTercerosDesdeAPI === 'function'){
    console.log('[SGRT] ⏳ Lectura remota explícitamente habilitada; se conserva localStorage como respaldo.');
    setTimeout(() => {
      cargarTercerosDesdeAPI().catch(e => {
        console.warn('[SGRT] ⚠️ Lectura remota no disponible, usando localStorage:', e.message);
      });
    }, 1000);
  } else {
    console.log('[SGRT] ℹ️ Modo local: no se ejecuta lectura automática de Azure.');
  }
});

// ════════════════════════════════════════════════════════════════
// ARREGLO: Cargar supervisores y contratos del CSV en formulario
// ════════════════════════════════════════════════════════════════

window._cfCargarSupervisoresDelTercero = function(nit){
  // Obtener supervisores guardados en TERCEROS_DB (del CSV)
  var t = window.TERCEROS_DB[nit];
  if(!t || !t.supervisores || t.supervisores.length === 0) return;
  
  // Limpiar y cargar buffer
  window._cfSupervisoresBuffer = [];
  t.supervisores.forEach(function(sup){
    window._cfSupervisoresBuffer.push({
      nombre: sup.nombre || '',
      cargo: sup.cargo || '',
      proceso: sup.proceso || ''
    });
  });
  
  // Renderizar
  window._cfRenderSupervisoresTercero();
};

window._cfCargarContratosDelTercero = function(nit){
  // Obtener contratos guardados en TERCEROS_DB (del CSV)
  var t = window.TERCEROS_DB[nit];
  if(!t || !t.contratos || t.contratos.length === 0) return;
  
  // Limpiar y cargar buffer
  window._cfContratosBuffer = [];
  t.contratos.forEach(function(c){
    window._cfContratosBuffer.push({
      num: c.num || c.numero || '',
      objeto: c.objeto || '',
      fini: c.fini || '',
      ffin: c.ffin || '',
      estado: c.estado || 'En Ejecucion',
      valor: c.valor || '',
      supervisor: c.supervisor || ''
    });
  });
  
  // Renderizar
  window._cfCtrRender();
};

// ════════════════════════════════════════════════════════════════
// Interceptar cuando se abre Clasificación para cargar datos del CSV
// ════════════════════════════════════════════════════════════════

var originalNavTo = window.navTo;
window.navTo = function(el, pgId){
  originalNavTo.call(this, el, pgId);
  
  if(pgId === 'pg-clasificacion'){
    // Cuando se abre clasificación, cargar desde TERCEROS_DB
    setTimeout(function(){
      var nit = document.getElementById('cf-nit')?.value || 
                document.querySelector('[id*="nit"]')?.value ||
                Object.keys(window.TERCEROS_DB || {})[0];
      
      if(nit && window.TERCEROS_DB[nit]){
        window._cfCargarSupervisoresDelTercero(nit);
        window._cfCargarContratosDelTercero(nit);
      }
    }, 300);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 📋 MÓDULO DE GENERACIÓN AUTOMÁTICA DE INFORMES EN WORD (.HTML→DOCX)
// ═══════════════════════════════════════════════════════════════════════════

window.generarInformeAutomatico = function(terceroNit) {
  const db = window.TERCEROS_DB || {};
  const tercero = db[terceroNit];
  if (!tercero) {
    showToast('❌ Tercero no encontrado', 'error', 2000);
    return;
  }

  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe - ${tercero.nombre}</title><style>body{font-family:Calibri,Arial;margin:40px;line-height:1.6;}h1{color:#1a3a5c;border-bottom:3px solid #1e6bb8;padding-bottom:10px;font-size:24px;margin-top:30px;}h2{color:#1e6bb8;font-size:18px;margin-top:20px;}table{width:100%;border-collapse:collapse;margin:15px 0;font-size:12px;}table th{background:#1a3a5c;color:white;padding:10px;text-align:left;}table td{border:1px solid #ddd;padding:8px;}.box{background:#f0f4ff;padding:15px;border-radius:5px;margin:15px 0;border-left:4px solid #1e6bb8;}p{color:#333;}strong{font-weight:600;}</style></head><body>`;
  
  // PORTADA
  html += `<div style="text-align:center;page-break-after:always;padding:80px 0;"><h1 style="border:none;color:#1a3a5c;font-size:32px;">📋 INFORME DE EVALUACIÓN</h1><p style="font-size:20px;color:#666;margin:40px 0;font-weight:600;">${tercero.nombre}</p><p style="color:#999;"><strong>NIT:</strong> ${tercero.nit}</p><p style="color:#999;"><strong>Ubicación:</strong> ${tercero.domicilio || '—'}</p><p style="color:#999;margin-top:80px;font-size:12px;">Generado: ${new Date().toLocaleDateString('es-CO')}</p></div>`;
  
  // RESUMEN
  html += `<h1>RESUMEN EJECUTIVO</h1><div class="box"><p><strong>Tercero:</strong> ${tercero.nombre}</p><p><strong>NIT:</strong> ${tercero.nit}</p><p><strong>Clasificación:</strong> <span style="color:${tercero.clasificacion === 'EXTREMO' ? '#dc3545' : tercero.clasificacion === 'ALTO' ? '#fd7e14' : '#28a745'};font-weight:bold;">${tercero.clasificacion || 'Pendiente'}</span></p><p><strong>Total Contratos:</strong> ${(tercero.contratos || []).length}</p><p><strong>Supervisores:</strong> ${(tercero.supervisores || []).length}</p><p><strong>Puntaje Promedio:</strong> ${(tercero.prom || 0).toFixed(2)} / 5</p></div>`;
  
  // FASE 1
  html += `<div style="page-break-after:always;"><h1>FASE 1: CLASIFICACIÓN DE TERCEROS</h1><h2>Información General</h2><table><tr><th>Campo</th><th>Valor</th></tr><tr><td>Nombre</td><td>${tercero.nombre || '—'}</td></tr><tr><td>NIT</td><td>${tercero.nit || '—'}</td></tr><tr><td>Domicilio</td><td>${tercero.domicilio || '—'}</td></tr><tr><td>Organización Cliente</td><td>${tercero.entidad || 'Colpensiones'}</td></tr><tr><td>Clasificación</td><td style="color:${tercero.clasificacion === 'EXTREMO' ? '#dc3545' : tercero.clasificacion === 'ALTO' ? '#fd7e14' : '#28a745'};"><strong>${tercero.clasificacion || 'Pendiente'}</strong></td></tr><tr><td>Zona</td><td>${tercero.zona || '—'}</td></tr></table>`;
  if ((tercero.dims || []).length > 0) {
    html += `<h2>Tipologías y Puntajes</h2><table><tr><th>Tipología</th><th>Puntaje</th><th>Nivel</th></tr>`;
    (tercero.dims || []).forEach(d => {
      const val = parseFloat(d.val || 0);
      const nivel = val >= 4 ? 'Crítico' : val >= 3 ? 'Alto' : val >= 2 ? 'Medio' : 'Bajo';
      html += `<tr><td>${d.key || '—'}</td><td>${val}</td><td>${nivel}</td></tr>`;
    });
    html += `</table>`;
  }
  html += `</div>`;
  
  // FASE 2
  html += `<div style="page-break-after:always;"><h1>FASE 2: AMBIENTE DE CONTROL</h1><p>Estado: <strong>${tercero.cuestionario && Object.keys(tercero.cuestionario).length > 0 ? (tercero.cuestionarioCompleto ? 'COMPLETADA' : 'EN PROGRESO') : 'PENDIENTE'}</strong></p>${tercero.cuestionario && Object.keys(tercero.cuestionario).length > 0 ? '<p>Preguntas respondidas: <strong>' + Object.keys(tercero.cuestionario).length + '</strong></p>' : '<p>Evaluación aún no iniciada.</p>'}</div>`;
  
  // FASE 3
  html += `<div style="page-break-after:always;"><h1>FASE 3: ANÁLISIS DE RIESGOS</h1><p>Total de riesgos: <strong>${(tercero.matriz && Object.keys(tercero.matriz).length) || 0}</strong></p>${tercero.seguimiento && Object.keys(tercero.seguimiento).length > 0 ? '<p>Acciones en seguimiento: <strong>' + Object.keys(tercero.seguimiento).length + '</strong></p>' : ''}</div>`;
  
  // CONTRATOS Y SUPERVISORES
  html += `<div><h1>CONTRATOS Y SUPERVISORES</h1><h2>Contratos Asociados</h2>`;
  if ((tercero.contratos || []).length > 0) {
    html += `<table><tr><th>Número</th><th>Objeto</th><th>Supervisor</th><th>Vigencia</th></tr>`;
    (tercero.contratos || []).forEach(c => {
      html += `<tr><td>${c.num || '—'}</td><td>${c.objeto || '—'}</td><td>${c.supervisor_asociado || '—'}</td><td>${c.fini || '—'} a ${c.ffin || 'En ejecución'}</td></tr>`;
    });
    html += `</table>`;
  } else {
    html += `<p>Sin contratos registrados.</p>`;
  }
  html += `<h2>Supervisores del Tercero</h2><p>${(tercero.supervisores || []).length > 0 ? (tercero.supervisores || []).join(', ') : 'Sin supervisores registrados'}</p></div>`;
  
  html += `<p style="margin-top:60px;padding-top:20px;border-top:1px solid #ddd;color:#999;font-size:11px;">Informe generado automáticamente por SGRT | ${window.currentUser?.name || 'Sistema'} | ${new Date().toLocaleString('es-CO')}</p></body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Informe_${tercero.nombre.replace(/\\s+/g,'_')}_${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  showToast('✅ Informe generado y descargado (abrir con Word)', 'success', 3000);
};

// Informe General del Sistema
window.generarInformeGeneral = function() {
  const db = window.TERCEROS_DB || {};
  const terceros = Object.values(db).filter(t => t && t.nit);
  
  const extremo = terceros.filter(t => t.clasificacion === 'EXTREMO').length;
  const alto = terceros.filter(t => t.clasificacion === 'ALTO').length;
  const bajo = terceros.filter(t => t.clasificacion === 'BAJO').length;
  
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe General SGRT</title><style>body{font-family:Calibri,Arial;margin:40px;line-height:1.6;}h1{color:#1a3a5c;border-bottom:3px solid #1e6bb8;padding-bottom:10px;}table{width:100%;border-collapse:collapse;margin:20px 0;font-size:12px;}table th{background:#1a3a5c;color:white;padding:10px;}table td{border:1px solid #ddd;padding:8px;}.kpi{display:inline-block;width:23%;margin:1%;padding:20px;text-align:center;border-radius:8px;font-weight:bold;}</style></head><body>`;
  
  html += `<div style="text-align:center;margin:60px 0;"><h1 style="text-align:center;border:none;font-size:32px;">📋 INFORME GENERAL</h1><p style="color:#666;font-size:16px;margin:20px 0;">Sistema de Gestión Integral de Riesgos de Terceros (SGRT)</p><p style="color:#999;font-size:12px;">Generado: ${new Date().toLocaleDateString('es-CO')}</p></div>`;
  
  html += `<h1>RESUMEN DE RIESGOS</h1><div style="margin:20px 0;"><div class="kpi" style="background:#fee2e2;"><div style="font-size:36px;color:#dc3545;">${extremo}</div><div style="color:#666;font-size:12px;font-weight:normal;">Riesgo Extremo</div></div><div class="kpi" style="background:#fff5e6;"><div style="font-size:36px;color:#fd7e14;">${alto}</div><div style="color:#666;font-size:12px;font-weight:normal;">Riesgo Alto</div></div><div class="kpi" style="background:#f0fdf4;"><div style="font-size:36px;color:#28a745;">${bajo}</div><div style="color:#666;font-size:12px;font-weight:normal;">Riesgo Bajo</div></div><div class="kpi" style="background:#eff6ff;"><div style="font-size:36px;color:#1e6bb8;">${terceros.length}</div><div style="color:#666;font-size:12px;font-weight:normal;">Total Terceros</div></div></div>`;
  
  html += `<h1 style="page-break-before:always;">DETALLE DE TERCEROS</h1><table><tr><th>NIT</th><th>Nombre</th><th>Clasificación</th><th>Contratos</th><th>Puntaje</th></tr>`;
  terceros.forEach(t => {
    html += `<tr><td>${t.nit}</td><td>${t.nombre}</td><td style="color:${t.clasificacion === 'EXTREMO' ? '#dc3545' : t.clasificacion === 'ALTO' ? '#fd7e14' : '#28a745'};font-weight:bold;">${t.clasificacion || 'Pendiente'}</td><td>${(t.contratos || []).length}</td><td>${(t.prom || 0).toFixed(2)}</td></tr>`;
  });
  html += `</table><p style="margin-top:60px;color:#999;font-size:11px;">Informe generado automáticamente | ${window.currentUser?.name || 'Sistema'} | ${new Date().toLocaleString('es-CO')}</p></body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Informe_General_SGRT_${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  showToast('✅ Informe general generado (abrir con Word)', 'success', 3000);
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 PRECARGA COMPLETA Y FUNCIONAMIENTO CORRECTO DE ROLES
// ═══════════════════════════════════════════════════════════════════════════

/*
// ════════════════════════════════════════════════════════════════════════════
// 🔒 PRECARGA DESACTIVADA - Solo datos ingresados por usuarios
// ════════════════════════════════════════════════════════════════════════════

window._initSGRTCompleto = function() {
  if (!window.TERCEROS_DB) window.TERCEROS_DB = {};
  
  // TERCERO 1: APROBADO - XYZ Servicios Integrales
  window.TERCEROS_DB['900100001'] = {
    nit: '900100001',
    nombre: 'XYZ Servicios Integrales SAS',
    entidad: 'colpensiones',
    domicilio: 'Carrera 7 #45-30, Piso 5, Bogotá D.C.',
    servicio: 'Consultoría y Servicios',
    supervisor: 'Carlos López García',
    prom: 4.2,
    zona: 'ALTO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-10',
    clasificacion: 'ALTO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '4'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '4'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '4'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '3'},
      {key: 'laft', nombre: 'LAFT', val: '4'}
    ],
    contratos: [
      {
        num: 'CT-2026-001',
        objeto: 'Servicios de Consultoría Integral',
        valor: '350000000',
        fini: '2026-08-01',
        ffin: '2027-07-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Carlos López García',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-10'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Carlos López García', cargo: 'Gerente Técnico'},
      {nombre_supervisor: 'Andrés Martínez', cargo: 'Coordinador'}
    ],
    cuestionario: {
      'AC-001': { pregunta: '¿Existe política de seguridad?', respuesta: 'Si', fecha: '2026-08-15' },
      'AC-002': { pregunta: '¿Hay documentación?', respuesta: 'Si', fecha: '2026-08-15' },
      'AC-003': { pregunta: '¿Controles activos?', respuesta: 'Parcialmente', fecha: '2026-08-16' }
    },
    cuestionarioCompleto: true,
    matriz: {
      'MAT-001': { riesgo: 'Riesgo Operacional', probabilidad: 'Media', impacto: 'Alto', mitigacion: 'Control A' },
      'MAT-002': { riesgo: 'Riesgo Tecnológico', probabilidad: 'Baja', impacto: 'Medio', mitigacion: 'Control B' }
    },
    evaluaciones: [
      { id: 'e1', tipologia: 'Operativo', completada: true, calificacion: 4, fecha_inicio: '2026-08-15', fecha_fin: '2026-08-20' }
    ]
  };
  
  // TERCERO 2: APROBADO - Tecnología ABC
  window.TERCEROS_DB['900100002'] = {
    nit: '900100002',
    nombre: 'Tecnología ABC Innovación',
    entidad: 'colpensiones',
    domicilio: 'Avenida Paseo de la República 1234, Bogotá',
    servicio: 'Soluciones Tecnológicas',
    supervisor: 'María Rodríguez',
    prom: 3.8,
    zona: 'MEDIO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-12',
    clasificacion: 'MEDIO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '3'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '4'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '3'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '2'},
      {key: 'laft', nombre: 'LAFT', val: '3'}
    ],
    contratos: [
      {
        num: 'CT-2026-004',
        objeto: 'Desarrollo de Software Personalizado',
        valor: '280000000',
        fini: '2026-07-15',
        ffin: '2026-12-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'María Rodríguez',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-12'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'María Rodríguez', cargo: 'Jefa de Proyecto'}
    ],
    cuestionario: {
      'AC-001': { pregunta: '¿Existe política de seguridad?', respuesta: 'Si', fecha: '2026-08-16' },
      'AC-002': { pregunta: '¿Hay documentación?', respuesta: 'Parcialmente', fecha: '2026-08-16' }
    },
    cuestionarioCompleto: true,
    matriz: {
      'MAT-001': { riesgo: 'Riesgo de Datos', probabilidad: 'Media', impacto: 'Alto', mitigacion: 'Encriptación' }
    },
    evaluaciones: []
  };
  
  // TERCERO 3: APROBADO - Seguridad Empresarial
  window.TERCEROS_DB['900100003'] = {
    nit: '900100003',
    nombre: 'Seguridad Empresarial DEF',
    entidad: 'colpensiones',
    domicilio: 'Calle 80 #15-45, Bogotá',
    servicio: 'Servicios de Seguridad',
    supervisor: 'Juan Carlos Pérez',
    prom: 3.5,
    zona: 'MEDIO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-14',
    clasificacion: 'MEDIO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '3'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '3'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '4'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '3'},
      {key: 'laft', nombre: 'LAFT', val: '3'}
    ],
    contratos: [
      {
        num: 'CT-2026-007',
        objeto: 'Servicios de Vigilancia 24/7',
        valor: '150000000',
        fini: '2026-08-01',
        ffin: '2027-07-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Juan Carlos Pérez',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-14'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Juan Carlos Pérez', cargo: 'Director Operaciones'}
    ],
    cuestionario: {},
    evaluaciones: []
  };
  
  // TERCERO 4: NO APROBADO - Soluciones Nacionales
  window.TERCEROS_DB['900100004'] = {
    nit: '900100004',
    nombre: 'Soluciones Nacionales S.A.',
    entidad: 'colpensiones',
    domicilio: 'Carrera 11 #90-30, Bogotá',
    servicio: 'Consultoría General',
    supervisor: 'Patricia García',
    prom: 2.1,
    zona: 'BAJO',
    estado: 'Activo',
    estado_aprobacion: 'NO_APROBADO',
    fecha_aprobacion: '2026-08-15',
    clasificacion: 'BAJO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '2'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '2'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '2'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '2'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '1'},
      {key: 'laft', nombre: 'LAFT', val: '2'}
    ],
    contratos: [
      {
        num: 'CT-2026-009',
        objeto: 'Asesoría Administrativa',
        valor: '80000000',
        fini: '2026-09-01',
        ffin: '2026-12-31',
        estado: 'Por Iniciar',
        supervisor_asociado: 'Patricia García',
        estado_aprobacion: 'NO_APROBADO',
        fecha_aprobacion: '2026-08-15'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Patricia García', cargo: 'Coordinadora'}
    ],
    cuestionario: {},
    evaluaciones: []
  };
  
  // TERCERO 5: PENDIENTE - Proveedores Globales
  window.TERCEROS_DB['900100005'] = {
    nit: '900100005',
    nombre: 'Proveedores Globales Ltd',
    entidad: 'colpensiones',
    domicilio: 'Avenida Simón Bolívar 2500, Bogotá',
    servicio: 'Suministro de Bienes',
    supervisor: 'Felipe López',
    prom: 0,
    zona: 'PENDIENTE',
    estado: 'Activo',
    estado_aprobacion: 'PENDIENTE',
    fecha_aprobacion: null,
    clasificacion: 'PENDIENTE',
    dims: [],
    contratos: [
      {
        num: 'CT-2026-011',
        objeto: 'Suministro de Materiales Generales',
        valor: '120000000',
        fini: '2026-10-01',
        ffin: '2027-09-30',
        estado: 'Por Iniciar',
        supervisor_asociado: 'Felipe López',
        estado_aprobacion: 'PENDIENTE',
        fecha_aprobacion: null
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Felipe López', cargo: 'Jefe Logística'}
    ],
    cuestionario: {},
    evaluaciones: []
  };
  
  try {
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
    console.log('✅ PRECARGA: 5 terceros (3 APROBADOS, 1 NO_APROBADO, 1 PENDIENTE)');
  } catch(e) {
    console.warn('⚠️ localStorage:', e);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 📊 FUNCIÓN EXTENDIDA PARA LLENAR TODO CON DATOS REALES
// ════════════════════════════════════════════════════════════════════════════

window._precargaCompleta = function() {
  if (!window.TERCEROS_DB) window.TERCEROS_DB = {};
  
  // FUNCIÓN AUXILIAR: Generar cuestionario AC completo
  function generarCuestionarioAC(nit, nombre) {
    return {
      'AC-101': { pregunta: '¿Existe documentación de políticas de seguridad?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-15' },
      'AC-102': { pregunta: '¿Se realizan auditorías internas regularmente?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-15' },
      'AC-103': { pregunta: '¿Hay segregación de funciones?', respuesta: 'Parcialmente', calificacion: 3, fecha: '2026-08-16' },
      'AC-104': { pregunta: '¿Existen controles de acceso implementados?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-16' },
      'AC-105': { pregunta: '¿Se registran todas las transacciones?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-17' },
      'AC-106': { pregunta: '¿Hay procedimientos de conciliación?', respuesta: 'Parcialmente', calificacion: 3, fecha: '2026-08-17' },
      'AC-201': { pregunta: '¿Existe plan de continuidad de negocio?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-18' },
      'AC-202': { pregunta: '¿Se han realizado pruebas de recuperación?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-18' },
      'AC-203': { pregunta: '¿Hay redundancia en sistemas críticos?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-19' },
      'AC-301': { pregunta: '¿Se encriptan datos sensibles?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-19' },
      'AC-302': { pregunta: '¿Existe firewall perimetral?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-20' },
      'AC-303': { pregunta: '¿Se realizan escaneos de vulnerabilidad?', respuesta: 'Parcialmente', calificacion: 3, fecha: '2026-08-20' },
      'AC-401': { pregunta: '¿Cumple con leyes y regulaciones?', respuesta: 'Si', calificacion: 5, fecha: '2026-08-21' },
      'AC-402': { pregunta: '¿Hay programa de cumplimiento?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-21' },
      'AC-501': { pregunta: '¿Existen controles anti-fraude?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-22' },
      'AC-502': { pregunta: '¿Se monitorean transacciones sospechosas?', respuesta: 'Si', calificacion: 4, fecha: '2026-08-22' }
    };
  }
  
  // FUNCIÓN AUXILIAR: Generar matriz de riesgos completa
  function generarMatrizRiesgos(nit, nombre) {
    return {
      'MAT-OP-001': { 
        tipologia: 'Operativo', riesgo: 'Errores en procesos críticos', 
        probabilidad: 'Media', impacto: 'Alto', residual: 'Medio',
        causa: 'Falta de automatización', controles: 'Revisión manual diaria',
        estado: 'Monitoreo', fecha: '2026-08-20'
      },
      'MAT-OP-002': { 
        tipologia: 'Operativo', riesgo: 'Indisponibilidad de sistemas', 
        probabilidad: 'Baja', impacto: 'Crítico', residual: 'Medio',
        causa: 'Fallos de infraestructura', controles: 'Redundancia y backup',
        estado: 'Mitigando', fecha: '2026-08-20'
      },
      'MAT-CN-001': { 
        tipologia: 'Continuidad', riesgo: 'Pérdida de datos críticos', 
        probabilidad: 'Baja', impacto: 'Crítico', residual: 'Bajo',
        causa: 'Fallo de almacenamiento', controles: 'Replicación de datos',
        estado: 'Bajo control', fecha: '2026-08-21'
      },
      'MAT-CN-002': { 
        tipologia: 'Continuidad', riesgo: 'Interrupción del servicio', 
        probabilidad: 'Media', impacto: 'Alto', residual: 'Medio',
        causa: 'Mantenimiento no planificado', controles: 'Ventanas de mantenimiento',
        estado: 'Monitoreo', fecha: '2026-08-21'
      },
      'MAT-SI-001': { 
        tipologia: 'Seguridad Info', riesgo: 'Acceso no autorizado', 
        probabilidad: 'Baja', impacto: 'Alto', residual: 'Bajo',
        causa: 'Credenciales débiles', controles: 'Autenticación multi-factor',
        estado: 'Bajo control', fecha: '2026-08-22'
      },
      'MAT-SI-002': { 
        tipologia: 'Seguridad Info', riesgo: 'Malware e inyecciones', 
        probabilidad: 'Media', impacto: 'Alto', residual: 'Medio',
        causa: 'Falta de parches', controles: 'Antivirus y actualizaciones',
        estado: 'Mitigando', fecha: '2026-08-22'
      },
      'MAT-CP-001': { 
        tipologia: 'Cumplimiento', riesgo: 'Incumplimiento normativo', 
        probabilidad: 'Baja', impacto: 'Crítico', residual: 'Bajo',
        causa: 'Cambios regulatorios', controles: 'Monitoreo legal',
        estado: 'Bajo control', fecha: '2026-08-23'
      },
      'MAT-FR-001': { 
        tipologia: 'Fraude', riesgo: 'Fraude interno', 
        probabilidad: 'Media', impacto: 'Alto', residual: 'Medio',
        causa: 'Acceso a fondos', controles: 'Segregación de funciones',
        estado: 'Monitoreo', fecha: '2026-08-23'
      }
    };
  }
  
  // FUNCIÓN AUXILIAR: Generar seguimiento y planes de acción
  function generarSeguimiento(nit, nombre) {
    return {
      'SEG-001': { 
        riesgo: 'Errores en procesos', accion: 'Implementar automatización', 
        responsable: 'Carlos López', vencimiento: '2026-09-30', estado: 'En Ejecución',
        progreso: 45, fecha_inicio: '2026-08-20'
      },
      'SEG-002': { 
        riesgo: 'Pérdida de datos', accion: 'Implementar replicación geográfica', 
        responsable: 'Juan Martínez', vencimiento: '2026-10-15', estado: 'Pendiente',
        progreso: 20, fecha_inicio: '2026-08-21'
      },
      'SEG-003': { 
        riesgo: 'Acceso no autorizado', accion: 'Implementar MFA', 
        responsable: 'María García', vencimiento: '2026-09-15', estado: 'En Ejecución',
        progreso: 60, fecha_inicio: '2026-08-22'
      },
      'SEG-004': { 
        riesgo: 'Fraude interno', accion: 'Auditoría de accesos', 
        responsable: 'Patricia López', vencimiento: '2026-08-31', estado: 'En Ejecución',
        progreso: 80, fecha_inicio: '2026-08-15'
      },
      'SEG-005': { 
        riesgo: 'Incumplimiento', accion: 'Revisar políticas internas', 
        responsable: 'Felipe Rodríguez', vencimiento: '2026-09-30', estado: 'Completado',
        progreso: 100, fecha_inicio: '2026-08-01'
      }
    };
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // CREAR 5 TERCEROS CON DATOS COMPLETAMENTE LLENOS
  // ══════════════════════════════════════════════════════════════════════════
  
  window.TERCEROS_DB['900100001'] = {
    nit: '900100001',
    nombre: 'XYZ Servicios Integrales SAS',
    entidad: 'colpensiones',
    domicilio: 'Carrera 7 #45-30, Piso 5, Bogotá D.C.',
    servicio: 'Consultoría y Servicios',
    supervisor: 'Carlos López García',
    prom: 4.2,
    zona: 'ALTO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-10',
    clasificacion: 'ALTO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '4'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '4'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '4'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '3'},
      {key: 'laft', nombre: 'LAFT', val: '4'}
    ],
    contratos: [
      {
        num: 'CT-2026-001',
        objeto: 'Servicios de Consultoría Integral',
        valor: '350000000',
        fini: '2026-08-01',
        ffin: '2027-07-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Carlos López García',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-10'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Carlos López García', cargo: 'Gerente Técnico'},
      {nombre_supervisor: 'Andrés Martínez', cargo: 'Coordinador'}
    ],
    cuestionario: generarCuestionarioAC('900100001', 'XYZ Servicios'),
    cuestionarioCompleto: true,
    matriz: generarMatrizRiesgos('900100001', 'XYZ Servicios'),
    seguimiento: generarSeguimiento('900100001', 'XYZ Servicios'),
    evaluaciones: [
      { id: 'e1', tipologia: 'Operativo', completada: true, calificacion: 4, fecha_inicio: '2026-08-15', fecha_fin: '2026-08-20' },
      { id: 'e2', tipologia: 'Continuidad', completada: true, calificacion: 4, fecha_inicio: '2026-08-21', fecha_fin: '2026-08-25' },
      { id: 'e3', tipologia: 'Seguridad', completada: true, calificacion: 4, fecha_inicio: '2026-08-26', fecha_fin: '2026-08-30' }
    ]
  };
  
  window.TERCEROS_DB['900100002'] = {
    nit: '900100002',
    nombre: 'Tecnología ABC Innovación',
    entidad: 'colpensiones',
    domicilio: 'Avenida Paseo de la República 1234, Bogotá',
    servicio: 'Soluciones Tecnológicas',
    supervisor: 'María Rodríguez',
    prom: 3.8,
    zona: 'MEDIO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-12',
    clasificacion: 'MEDIO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '3'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '4'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '3'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '2'},
      {key: 'laft', nombre: 'LAFT', val: '3'}
    ],
    contratos: [
      {
        num: 'CT-2026-004',
        objeto: 'Desarrollo de Software Personalizado',
        valor: '280000000',
        fini: '2026-07-15',
        ffin: '2026-12-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'María Rodríguez',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-12'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'María Rodríguez', cargo: 'Jefa de Proyecto'}
    ],
    cuestionario: generarCuestionarioAC('900100002', 'Tecnología ABC'),
    cuestionarioCompleto: true,
    matriz: generarMatrizRiesgos('900100002', 'Tecnología ABC'),
    seguimiento: generarSeguimiento('900100002', 'Tecnología ABC'),
    evaluaciones: [
      { id: 'e4', tipologia: 'Operativo', completada: true, calificacion: 3, fecha_inicio: '2026-08-16', fecha_fin: '2026-08-21' },
      { id: 'e5', tipologia: 'Seguridad', completada: true, calificacion: 4, fecha_inicio: '2026-08-22', fecha_fin: '2026-08-28' }
    ]
  };
  
  window.TERCEROS_DB['900100003'] = {
    nit: '900100003',
    nombre: 'Seguridad Empresarial DEF',
    entidad: 'colpensiones',
    domicilio: 'Calle 80 #15-45, Bogotá',
    servicio: 'Servicios de Seguridad',
    supervisor: 'Juan Carlos Pérez',
    prom: 3.5,
    zona: 'MEDIO',
    estado: 'Activo',
    estado_aprobacion: 'APROBADO',
    fecha_aprobacion: '2026-08-14',
    clasificacion: 'MEDIO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '3'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '3'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '4'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '4'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '3'},
      {key: 'laft', nombre: 'LAFT', val: '3'}
    ],
    contratos: [
      {
        num: 'CT-2026-007',
        objeto: 'Servicios de Vigilancia 24/7',
        valor: '150000000',
        fini: '2026-08-01',
        ffin: '2027-07-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Juan Carlos Pérez',
        estado_aprobacion: 'APROBADO',
        fecha_aprobacion: '2026-08-14'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Juan Carlos Pérez', cargo: 'Director Operaciones'}
    ],
    cuestionario: generarCuestionarioAC('900100003', 'Seguridad Empresarial'),
    cuestionarioCompleto: true,
    matriz: generarMatrizRiesgos('900100003', 'Seguridad Empresarial'),
    seguimiento: generarSeguimiento('900100003', 'Seguridad Empresarial'),
    evaluaciones: [
      { id: 'e6', tipologia: 'Cumplimiento', completada: true, calificacion: 4, fecha_inicio: '2026-08-17', fecha_fin: '2026-08-23' }
    ]
  };
  
  window.TERCEROS_DB['900100004'] = {
    nit: '900100004',
    nombre: 'Soluciones Nacionales S.A.',
    entidad: 'colpensiones',
    domicilio: 'Carrera 11 #90-30, Bogotá',
    servicio: 'Consultoría General',
    supervisor: 'Patricia García',
    prom: 2.1,
    zona: 'BAJO',
    estado: 'Activo',
    estado_aprobacion: 'NO_APROBADO',
    fecha_aprobacion: '2026-08-15',
    clasificacion: 'BAJO',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '2'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '2'},
      {key: 'seguridad', nombre: 'Seguridad de Información', val: '2'},
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '2'},
      {key: 'fraude', nombre: 'Fraude y Corrupción', val: '1'},
      {key: 'laft', nombre: 'LAFT', val: '2'}
    ],
    contratos: [
      {
        num: 'CT-2026-009',
        objeto: 'Asesoría Administrativa',
        valor: '80000000',
        fini: '2026-09-01',
        ffin: '2026-12-31',
*/


// ── Unificación de salidas: todos los accesos heredados usan el informe Word común ──
(function(){
  var _informeTerceroLegacy = window.generarInformeAutomatico;
  var _informeGeneralLegacy = window.generarInformeGeneral;
  window.generarInformeAutomatico = function(terceroNit){
    if(typeof window.odDlInforme==='function'){ return window.odDlInforme(terceroNit); }
    return _informeTerceroLegacy && _informeTerceroLegacy(terceroNit);
  };
  window.generarInformeGeneral = function(){
    if(typeof window.odDlTodos==='function'){ return window.odDlTodos(); }
    return _informeGeneralLegacy && _informeGeneralLegacy();
  };
})();


// ════════════════════════════════════════════════════════════════
// ACTUALIZACIÓN SGRT — ayuda veraz para importación y alcance por rol
// ════════════════════════════════════════════════════════════════
(function(){
  function respuestaAsistenteActualizada(q){
    q=String(q||'').toLowerCase();
    var admin=(window.currentUser||{}).rol==='Operativo'||(window.currentUser||{}).rol==='admin_riesgos'||(window.currentUser||{}).login==='admin_riesgos';
    if(q.includes('pdf')||q.includes('escaneado')||q.includes('ocr')){
      return '<strong>Importación de PDF:</strong><br>El Administrador puede seleccionar PDF desde Registro de Terceros. El sistema extrae localmente texto seleccionable y busca etiquetas como NIT, nombre, domicilio, contrato, fechas, objeto, estado, valor, procesos, observaciones y supervisor.<br><br><strong>Importante:</strong> un PDF escaneado como imagen no se interpreta como texto por este módulo. Para OCR o IA de documentos escaneados se requiere un backend seguro autorizado; no se expone ninguna API key en el navegador.';
    }
    if(q.includes('import')||q.includes('excel')||q.includes('csv')||q.includes('lote')||q.includes('archivo')){
      return '<strong>Importación asistida de terceros:</strong><br>1. Entra como Administrador de Riesgos y abre <u>Registro de Terceros</u>.<br>2. Pulsa <u>Importar terceros</u> y selecciona uno o varios archivos Excel, CSV o PDF.<br>3. Revisa la tabla de previsualización: cada fila indica si está lista o requiere revisión.<br>4. Confirma únicamente las filas válidas.<br>5. El registro se incorpora a la tabla compartida local de Colpensiones y queda visible para el Evaluador de Colpensiones.<br><br><strong>Campos permitidos:</strong> organización/cliente, NIT, nombre del tercero, domicilio, contratos (número, inicio, fin, objeto, estado, valor, procesos y observaciones) y supervisores (nombre, cargo, proceso y contrato asociado). La importación no modifica fórmulas de riesgo ni sobrescribe NIT existentes.';
    }
    if(q.includes('colpensiones')||q.includes('ecopetrol')||q.includes('entidad')||q.includes('cliente')){
      return admin ? '<strong>Alcance del Administrador de Riesgos:</strong><br>Esta sesión está fijada en <u>Colpensiones</u>. Registro, clasificación, Ambiente de Control, matriz, seguimiento, evidencias, informes y Power BI consolidan los registros de Colpensiones provenientes del Evaluador y del Administrador. Ecopetrol y otras entidades no se muestran en este rol.<br><br>La comparación entre clientes pertenece exclusivamente a <u>ISeguras/Superadministrador</u>.' : '<strong>Alcance por entidad:</strong><br>El Evaluador consulta los registros de su organización. ISeguras/Superadministrador puede consultar el consolidado multiempresa y la comparación global.';
    }
    if(q.includes('ambiente')||q.includes('control')||q.includes('evaluación')||q.includes('evaluacion')){
      return '<strong>Ambiente de Control:</strong><br>1. Abre <u>Evaluación de Ambiente de Control</u>.<br>2. Selecciona el tercero y, si aplica, el contrato asociado.<br>3. Responde los atributos de cada control: implementado, documentado, asignado, divulgado, con evidencia y monitoreado.<br>4. Guarda la evaluación.<br>5. Consulta el porcentaje, madurez y avance por tipología en los reportes.<br><br>El módulo conserva la fórmula existente; los datos demo solamente llenan respuestas locales para comprobar el flujo.';
    }
    if(q.includes('clasific')||q.includes('tipolog')){
      return '<strong>Registro y clasificación:</strong><br>En <u>Registro de Terceros</u> puedes diligenciar individualmente organización, NIT, razón social, domicilio, contratos y supervisores. Luego, en <u>Clasificación de Terceros</u>, asigna las tipologías y sus niveles. En el Administrador la organización queda fijada en Colpensiones; el Evaluador conserva su flujo de consulta y evaluación.';
    }
    if(q.includes('seguimiento')||q.includes('plan')||q.includes('matriz')||q.includes('riesgo')){
      return '<strong>Matriz, riesgos y seguimiento:</strong><br>Después del Ambiente de Control, registra el riesgo, tipología, probabilidad e impacto inherentes, controles, calificación residual, tratamiento, responsable, plan de acción, estado y fecha de seguimiento. Los indicadores de Reportes y Power BI toman las filas de la matriz asociadas al NIT del tercero. No se recalculan ni se reemplazan las fórmulas existentes.';
    }
    if(q.includes('document')||q.includes('evidencia')||q.includes('informe')||q.includes('word')){
      return '<strong>Documentación e informes:</strong><br>En <u>Documentación / Evidencia</u> abre el tercero para revisar sus carpetas. Los documentos se guardan en el repositorio local por NIT. Desde Informes puedes generar el informe automático en Word con registro, contratos, clasificación, Ambiente de Control, riesgos, seguimiento y documentos detectados.';
    }
    if(q.includes('reporte')||q.includes('power bi')||q.includes('grafica')||q.includes('gráfico')||q.includes('chart')){
      return admin ? '<strong>Reportes y Power BI de Colpensiones:</strong><br>Abre <u>Reportes y Power BI</u>. Verás KPIs, gráfica de torta por exposición, gráfica de terceros/riesgos y el detalle por fases. La vista se limita a Colpensiones y reúne los datos compartidos con el Evaluador. Puedes descargar CSV para Power BI, JSON o tablas HTML.<br><br>No se incluye Ecopetrol en esta sesión.' : '<strong>Reportes:</strong><br>Los reportes disponibles dependen del rol. El Superadministrador ISeguras ve la comparación multiempresa; el Administrador de Riesgos ve únicamente Colpensiones.';
    }
    if(q.includes('azure')||q.includes('sincron')||q.includes('respaldo')||q.includes('backup')||q.includes('restaur')){
      return '<strong>Persistencia y Azure:</strong><br>En esta versión, la demostración y la importación se guardan localmente en localStorage y se marcan como datos locales/no sincronizados. El sistema no afirma una conexión Azure verificada, no expone credenciales y no envía automáticamente el lote a Azure. Para producción debe configurarse un backend seguro, verificar conectividad y ejecutar una migración controlada. ISeguras conserva sus controles de respaldo y restauración separados.';
    }
    if(q.includes('evaluador')||q.includes('rol')){
      return '<strong>Roles:</strong><br><u>Evaluador:</u> consulta y completa clasificación, Ambiente de Control, análisis, evidencias e informes de su entidad; no tiene Dashboard ni Seguimiento operativo.<br><u>Administrador de Riesgos:</u> registra, administra y reporta exclusivamente Colpensiones; puede importar lotes y generar reportes.<br><u>ISeguras/Superadministrador:</u> gestiona entidades, permisos, repositorio y comparación global multiempresa.';
    }
    if(q.includes('ayuda')||q.includes('help')||q.includes('qué puedes')||q.includes('que puedes')){
      return '<strong>Ayuda SGRT:</strong><br>Puedo orientarte sobre importación Excel/CSV/PDF, campos autorizados, Registro de Terceros, contratos y supervisores, clasificación, Ambiente de Control, matriz y seguimiento, documentos, informes Word, reportes Power BI, roles, respaldos y el alcance local/Azure.<br><br>Pregunta, por ejemplo: “¿Cómo importo un lote?”, “¿Qué campos permite el PDF?”, “¿Por qué el Administrador solo ve Colpensiones?” o “¿Cómo genero el informe Word?”.';
    }
    return '<strong>Asistente SGRT:</strong><br>Puedo ayudarte con Registro de Terceros, importación Excel/CSV/PDF, contratos, supervisores, clasificación, Ambiente de Control, matriz, seguimiento, evidencias, informes Word, Power BI, roles y respaldo local. Escribe <u>ayuda</u> para ver las opciones.';
  }
  // En scripts clásicos esta asignación sustituye la función global que usa enviarMensajeAsistente.
  window.responderPreguntaAsistente=respuestaAsistenteActualizada;
})();
