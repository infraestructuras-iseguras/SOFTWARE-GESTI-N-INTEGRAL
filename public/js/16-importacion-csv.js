
// ════════════════════════════════════════════════════════════════════
// 📥 CSV IMPORT - SINCRONIZACIÓN CORRECTA CON window.TERCEROS_DB
// ════════════════════════════════════════════════════════════════════

var datosCSV_Correcto = null;

function procesarCSV_Correcto(e) {
  var file = e.target.files[0];
  if (!file) return;
  
  var reader = new FileReader();
  reader.onload = function(evt) {
    var lines = evt.target.result.split('\n').filter(l => l.trim());
    datosCSV_Correcto = [];
    
    lines.forEach((linea, idx) => {
      if (idx === 0) return; // skip header
      var parts = linea.split(',').map(s => s.trim());
      if (parts[0]) {
        datosCSV_Correcto.push({
          nit: parts[0].toUpperCase(),
          nombre: parts[1] || '(sin nombre)',
          domicilio: parts[2] || '',
          supervisor: parts[3] || '',
          contrato: parts[4] || ''
        });
      }
    });
    
    if (datosCSV_Correcto.length === 0) {
      mostrarEstadoCSV_Correcto('❌ CSV sin datos válidos', 'error');
      return;
    }
    
    mostrarPreviewCSV_Correcto();
  };
  reader.readAsText(file);
}

function mostrarPreviewCSV_Correcto() {
  var tbody = document.getElementById('csv-preview-tbody-correcto');
  if (!tbody) return;
  tbody.innerHTML = datosCSV_Correcto.map((d) => 
    `<tr><td style="padding:6px;border-bottom:1px solid #dee2e6;">${d.nit}</td><td style="padding:6px;border-bottom:1px solid #dee2e6;">${d.nombre}</td><td style="padding:6px;border-bottom:1px solid #dee2e6;">${d.supervisor}</td><td style="padding:6px;border-bottom:1px solid #dee2e6;">${d.contrato}</td></tr>`
  ).join('');
  
  var preview = document.getElementById('csv-preview-correcto');
  if (preview) preview.style.display = 'block';
  var btn = document.getElementById('btn-importar-csv-correcto');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
  }
}

function importarCSV_Correcto() {
  if (!datosCSV_Correcto || datosCSV_Correcto.length === 0) return;
  
  if (typeof window.TERCEROS_DB === 'undefined') {
    window.TERCEROS_DB = {};
  }
  
  var agregados = 0;
  
  datosCSV_Correcto.forEach((dato) => {
    var nit = dato.nit;
    
    // Crear tercero si no existe
    if (!window.TERCEROS_DB[nit]) {
      window.TERCEROS_DB[nit] = {
        nit: nit,
        nombre: dato.nombre,
        domicilio: dato.domicilio,
        supervisor: dato.supervisor || '',
        supervisores: [],
        contratos: [],
        estado: 'Activo',
        fecha_creacion: new Date().toISOString()
      };
    }
    
    // Guardar supervisor en lista (estructura correcta para SGRT)
    if (dato.supervisor && dato.supervisor.trim()) {
      var supExiste = window.TERCEROS_DB[nit].supervisores.some(s => s.nombre === dato.supervisor);
      if (!supExiste) {
        window.TERCEROS_DB[nit].supervisores.push({
          nombre: dato.supervisor,
          cargo: '',
          proceso: ''
        });
      }
    }
    
    // Guardar contrato en estructura CORRECTA que SGRT entiende
    if (dato.contrato && dato.contrato.trim()) {
      var contratoExiste = window.TERCEROS_DB[nit].contratos.some(c => (c.num || c.numero) === dato.contrato);
      if (!contratoExiste) {
        window.TERCEROS_DB[nit].contratos.push({
          num: dato.contrato,
          numero: dato.contrato,
          objeto: '',
          fini: '',
          ffin: '',
          estado: 'En Ejecucion',
          valor: '',
          procesos: '',
          supervisor: dato.supervisor || '',
          supervisorCargo: '',
          procesoSupervision: '',
          supervisorAlt: '',
          supervisorAltCargo: '',
          procesoSupervisionAlt: '',
          observaciones: '',
          dims: [],
          creadoAt: new Date().toISOString()
        });
      }
    }
    
    agregados++;
  });
  
  try {
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
  } catch(e) {}
  
  mostrarEstadoCSV_Correcto(`✅ ${agregados} tercero(s) importado(s) con contratos y supervisores`, 'success');
  
  // 🔄 SINCRONIZACIÓN INMEDIATA
  try { if(typeof window.clsRender === 'function') window.clsRender(); }catch(e){}
  
  setTimeout(() => {
    try {
      if (typeof renderClasificacion === 'function') {
        renderClasificacion();
      }
    } catch(e) {}
    
    try {
      if (typeof window._clasifRender === 'function') {
        window._clasifRender();
      }
    } catch(e) {}
    
    // 🔄 SINCRONIZACIÓN FINAL
    try { if(typeof window.clsRender === 'function') window.clsRender(); }catch(e){}
    
    cerrarCSV_Correcto();
    var input = document.getElementById('csv-file-correcto');
    if (input) input.value = '';
    datosCSV_Correcto = null;
  }, 500);
}

function mostrarEstadoCSV_Correcto(msg, tipo) {
  var statusDiv = document.getElementById('csv-status-correcto');
  if (!statusDiv) return;
  statusDiv.textContent = msg;
  statusDiv.style.display = 'block';
  statusDiv.style.background = tipo === 'error' ? '#fde8e8' : '#e8f8f2';
  statusDiv.style.color = tipo === 'error' ? '#c0392b' : '#1e8449';
}

function cerrarCSV_Correcto() {
  var sec = document.getElementById('csv-module-correcto');
  if (sec) sec.style.display = 'none';
  var preview = document.getElementById('csv-preview-correcto');
  if (preview) preview.style.display = 'none';
}

function toggleCSV_Correcto() {
  var sec = document.getElementById('csv-module-correcto');
  if (sec) sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
}

function exportarTerceros_Correcto() {
  try {
    if (typeof window.TERCEROS_DB === 'undefined') return;
    
    var csv = 'NIT,Nombre,Domicilio,Supervisor,Contrato\n';
    Object.values(window.TERCEROS_DB).forEach(t => {
      if (t.contratos && t.contratos.length > 0) {
        // Un registro por cada contrato
        t.contratos.forEach(c => {
          csv += `${t.nit},${t.nombre},${t.domicilio},${t.supervisor},${c.numero}\n`;
        });
      } else {
        // Sin contratos
        csv += `${t.nit},${t.nombre},${t.domicilio},${t.supervisor},\n`;
      }
    });
    
    var blob = new Blob([csv], {type: 'text/csv'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'terceros_export.csv';
    a.click();
  } catch(e) {
    alert('❌ Error al exportar');
  }
}

// ─────────────────────────────────────────────────────────────────
// 🎯 PANEL MANUAL DE SUPERVISORES Y CONTRATOS (sin CSV)
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// 📋 PANEL DE SUPERVISORES & CONTRATOS - LEE DE TERCEROS_DB EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────────

function toggleManualSupervisant() {
  var panel = document.getElementById('manual-sup-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
      renderSupervisoresDesdeDB();
      renderContratosDesdeDB();
    }
  }
}

function renderSupervisoresDesdeDB() {
  var wrap = document.getElementById('supervisores-list-manual');
  if (!wrap) return;
  
  var db = window.TERCEROS_DB || {};
  var supervisoresUnicos = {};
  
  // Recopilar supervisores únicos desde todos los terceros
  Object.values(db).forEach(function(tercero) {
    if (!tercero) return;
    
    // Supervisor principal
    if (tercero.supervisor && tercero.supervisor.trim()) {
      supervisoresUnicos[tercero.supervisor.trim()] = true;
    }
    
    // Array de supervisores
    if (tercero.supervisores && Array.isArray(tercero.supervisores)) {
      tercero.supervisores.forEach(function(sup) {
        if (sup && sup.trim()) {
          supervisoresUnicos[sup.trim()] = true;
        }
      });
    }
    
    // Supervisores en contratos
    if (tercero.contratos && Array.isArray(tercero.contratos)) {
      tercero.contratos.forEach(function(contrato) {
        if (contrato.supervisor_asociado && contrato.supervisor_asociado.trim()) {
          supervisoresUnicos[contrato.supervisor_asociado.trim()] = true;
        }
      });
    }
  });
  
  var supervisoresList = Object.keys(supervisoresUnicos).sort();
  
  if (!supervisoresList.length) {
    wrap.innerHTML = '<div style="color:#999;padding:8px;text-align:center;">Sin supervisores registrados</div>';
    return;
  }
  
  wrap.innerHTML = supervisoresList.map(function(sup) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #e0e7ff;margin-bottom:4px;background:white;border-radius:4px;border-left:3px solid #10b981;">'
      + '<div><span style="font-weight:600;color:#059669;">👤 ' + esc(sup) + '</span><div style="font-size:10px;color:#999;margin-top:2px;">Registrado en sistema</div></div>'
      + '</div>';
  }).join('');
}

function renderContratosDesdeDB() {
  var wrap = document.getElementById('contratos-list-manual');
  if (!wrap) return;
  
  var db = window.TERCEROS_DB || {};
  var contratosUnicos = {};
  
  // Recopilar contratos únicos desde todos los terceros
  Object.values(db).forEach(function(tercero) {
    if (!tercero || !tercero.contratos || !Array.isArray(tercero.contratos)) return;
    
    tercero.contratos.forEach(function(contrato) {
      if (contrato.num && contrato.num.trim()) {
        var key = contrato.num.trim();
        if (!contratosUnicos[key]) {
          contratosUnicos[key] = {
            num: contrato.num,
            objeto: contrato.objeto,
            tercero: tercero.nombre,
            supervisor: contrato.supervisor_asociado
          };
        }
      }
    });
  });
  
  var contratosList = Object.values(contratosUnicos).sort(function(a, b) {
    return (a.num || '').localeCompare(b.num || '');
  });
  
  if (!contratosList.length) {
    wrap.innerHTML = '<div style="color:#999;padding:8px;text-align:center;">Sin contratos registrados</div>';
    return;
  }
  
  wrap.innerHTML = contratosList.map(function(contrato) {
    return '<div style="padding:10px;border-bottom:1px solid #e0e7ff;margin-bottom:4px;background:white;border-radius:4px;border-left:3px solid #10b981;">'
      + '<div style="font-weight:600;color:#059669;margin-bottom:4px;">📝 ' + esc(contrato.num) + '</div>'
      + '<div style="font-size:11px;color:#666;margin-bottom:3px;"><strong>Tercero:</strong> ' + esc(contrato.tercero) + '</div>'
      + '<div style="font-size:11px;color:#666;margin-bottom:3px;"><strong>Objeto:</strong> ' + esc(contrato.objeto || '—') + '</div>'
      + '<div style="font-size:11px;color:#666;"><strong>Supervisor:</strong> ' + esc(contrato.supervisor || '—') + '</div>'
      + '</div>';
  }).join('');
}

// Inicializar renderizado al cargar página
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var user = window.currentUser;
    if (user && (user.rol === 'admin_riesgos' || user.rol === 'Operativo')) {
      var csvModule = document.getElementById('csv-module-correcto');
      if (csvModule) csvModule.style.display = 'block';
      
      var csvButtons = document.getElementById('csv-buttons-bar-correcto');
      if (csvButtons) csvButtons.style.display = 'flex';
      
      console.log('✅ CSV y Supervisores & Contratos disponibles para', user.rol);
    }
    // Renderizar datos desde TERCEROS_DB
    renderSupervisoresDesdeDB();
    renderContratosDesdeDB();
  }, 800);
});

