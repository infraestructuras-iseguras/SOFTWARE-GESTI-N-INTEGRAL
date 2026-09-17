
window._cargarDatosSimulados = function(){
  if(typeof TERCEROS_DB === 'undefined') window.TERCEROS_DB = {};
  
  // TERCERO 1: ABC Company
  TERCEROS_DB['900147789'] = {
    nit: '900147789',
    nombre: 'ABC Company SAS',
    entidad: 'colpensiones',
    domicilio: 'Carrera 7 #45-30, Piso 5, Bogotá D.C.',
    servicio: 'Soporte Técnico',
    supervisor: 'Carlos López García',
    prom: 4.5,
    zona: 'EXTREMO',
    periodicidad: 'Se evalúa',
    estado: 'Activo',
    dims: [
      {key: 'operacional', nombre: 'Riesgo Operacional', val: '5'},
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '4'}
    ],
    contratos: [
      {
        num: 'CON-2026-001',
        objeto: 'Soporte técnico infraestructura',
        valor: '1500000',
        fini: '2026-08-04',
        ffin: '2026-08-13',
        estado: 'En Ejecución',
        supervisor_asociado: 'Carlos López García'
      },
      {
        num: 'CON-2026-002',
        objeto: 'Mantenimiento preventivo',
        valor: '2500000',
        fini: '2026-08-15',
        ffin: '2026-12-31',
        estado: 'Por Iniciar',
        supervisor_asociado: 'Andrés Martínez'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Carlos López García', cargo: 'Gerente Técnico'},
      {nombre_supervisor: 'Andrés Martínez', cargo: 'Coordinador'}
    ]
  };
  
  // TERCERO 2: Energía Global
  TERCEROS_DB['800456123'] = {
    nit: '800456123',
    nombre: 'Energía Global Ltd',
    entidad: 'ecopetrol',
    domicilio: 'Avenida Paseo de la República 5555, Bogotá',
    servicio: 'Suministro Energético',
    supervisor: 'María Rodríguez',
    prom: 3.2,
    zona: 'ALTO',
    periodicidad: 'Se evalúa',
    estado: 'Activo',
    dims: [
      {key: 'continuidad', nombre: 'Continuidad del Negocio', val: '3'}
    ],
    contratos: [
      {
        num: 'CON-2026-003',
        objeto: 'Suministro de energía eléctrica',
        valor: '5000000',
        fini: '2026-01-01',
        ffin: '2026-12-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'María Rodríguez'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'María Rodríguez', cargo: 'Jefa de Proyecto'}
    ]
  };
  
  // TERCERO 3: Bancolombia
  TERCEROS_DB['860012345'] = {
    nit: '860012345',
    nombre: 'Bancolombia SA',
    entidad: 'bancolombia',
    domicilio: 'Carrera 48 #26-85, Medellín',
    servicio: 'Servicios Financieros',
    supervisor: 'Juan Pérez',
    prom: 3.8,
    zona: 'ALTO',
    periodicidad: 'Se evalúa',
    estado: 'Activo',
    dims: [
      {key: 'cumplimiento', nombre: 'Cumplimiento', val: '4'}
    ],
    contratos: [
      {
        num: 'CON-2026-004',
        objeto: 'Servicios de banca electrónica',
        valor: '8000000',
        fini: '2026-06-01',
        ffin: '2027-05-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Juan Pérez'
      },
      {
        num: 'CON-2026-005',
        objeto: 'Hosting y almacenamiento',
        valor: '3500000',
        fini: '2026-07-15',
        ffin: '2026-12-31',
        estado: 'En Ejecución',
        supervisor_asociado: 'Patricia Gómez'
      }
    ],
    supervisores: [
      {nombre_supervisor: 'Juan Pérez', cargo: 'Director de Operaciones'},
      {nombre_supervisor: 'Patricia Gómez', cargo: 'Analista Senior'}
    ]
  };
  
  try {
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(TERCEROS_DB));
    console.log('✅ Datos simulados cargados correctamente');
  } catch(e) {
    console.warn('⚠️ localStorage:', e);
  }
};

// Ejecutar función para editar supervisor de contrato
window.clsEditarSupervisorContrato = function(nit, idxContrato){
  var t = TERCEROS_DB[nit];
  if(!t || !t.contratos || !t.contratos[idxContrato]) return;
  
  var c = t.contratos[idxContrato];
  var selectEl = document.getElementById('sup-sel-'+nit+'-'+idxContrato);
  var nuevoSupervisor = selectEl ? selectEl.value : '';
  
  if(!nuevoSupervisor){
    showToast('Selecciona un supervisor', 'warning', 2000);
    return;
  }
  
  c.supervisor_asociado = nuevoSupervisor;
  TERCEROS_DB[nit].contratos[idxContrato] = c;
  
  try {
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(TERCEROS_DB));
    showToast('✅ Supervisor actualizado: ' + nuevoSupervisor, 'success', 2500);
    // Recargar tabla
    if(typeof clsInitDash === 'function') clsInitDash();
  } catch(e) {
    showToast('Error al guardar', 'error', 2000);
  }
};

// ⭐ DESACTIVADO: No cargar datos simulados
// Cargar datos
// if(document.readyState === 'loading'){
//   document.addEventListener('DOMContentLoaded', window._cargarDatosSimulados);
// } else {
//   window._cargarDatosSimulados();
// }
console.log('ℹ️ Datos simulados desactivados - usando localStorage vacío');

// ⭐ NUEVA FUNCIÓN: Ir a Clasificación con tercero cargado
window.irAClasificacionDesdeRegistros = function(nit){
  if(!nit) return;
  var t = TERCEROS_DB[nit];
  if(!t) return;
  
  console.log('🔄 Navegando a Clasificación con tercero:', nit);
  
  // Navegar a la página de Clasificación
  var pg = document.getElementById('pg-clasificacion');
  if(pg){
    // Cambiar a tab "Nuevo Registro"
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    pg.style.display = 'block';
    
    // Cambiar a tab Form
    if(typeof clsTab === 'function') clsTab('form');
    
    // Cargar datos del tercero en los campos
    setTimeout(function(){
      var nitField = document.getElementById('cf-nit');
      var nombreField = document.getElementById('cf-nombre');
      var domicilioField = document.getElementById('cf-domicilio');
      
      if(nitField) nitField.value = nit;
      if(nombreField) nombreField.value = t.nombre || '';
      if(domicilioField) domicilioField.value = t.domicilio || '';
      
      // Renderizar contratos
      if(typeof _clsContratosRender === 'function'){
        _clsContratosRender(nit);
      }
      
      console.log('✅ Tercero cargado en Clasificación:', nit);
    }, 100);
  }
};

// ✅ DEBUG: Función para ver y verificar qué hay en localStorage
window.debugLocalStorage = function(){
  console.clear();
  console.log('=== VERIFICACIÓN DE localStorage ===');
  console.log('Total keys:', localStorage.length);
  console.log('');
  
  // Mostrar cada key y su tamaño
  var totalSize = 0;
  for(var i=0; i<localStorage.length; i++){
    var key = localStorage.key(i);
    var value = localStorage.getItem(key);
    var size = new Blob([value]).size;
    totalSize += size;
    console.log(i+1 + '. ' + key + ' (' + size + ' bytes)');
  }
  
  console.log('');
  console.log('Tamaño total:', totalSize + ' bytes');
  console.log('');
  console.log('Keys principales a borrar:');
  console.log('- sgrt_terceros_db:', localStorage.getItem('sgrt_terceros_db_shared') ? 'EXISTE (' + new Blob([localStorage.getItem('sgrt_terceros_db_shared')]).size + ' bytes)' : 'NO existe');
  console.log('- sgrt_v8:', localStorage.getItem('sgrt_v8') ? 'EXISTE (' + new Blob([localStorage.getItem('sgrt_v8')]).size + ' bytes)' : 'NO existe');
  console.log('- TERCEROS_DB (en memoria):', Object.keys(window.TERCEROS_DB||{}).length + ' registros');
};

// ✅ FUNCIÓN AGRESIVA DE LIMPIEZA
window.limpiarCompletamente = function(){
  if(!confirm('⚠️ ¿BORRAR TODO COMPLETAMENTE?\n\nEsta es la opción MÁXIMA agresiva:\n- Borrará TODO de localStorage\n- Borrará TODO de sessionStorage\n- Resetará todas las variables\n- Limpiará cookies\n\nEsta acción NO se puede deshacer.')){
    return;
  }
  
  console.clear();
  console.log('🔴 INICIANDO LIMPIEZA TOTAL');
  console.log('='.repeat(60));
  
  try {
    // 1. PRIMER PASO: Capturar todas las keys ANTES de empezar
    var allKeys = [];
    for(var i=0; i<localStorage.length; i++){
      var key = localStorage.key(i);
      if(key) allKeys.push(key);
    }
    console.log('📋 Keys encontradas en localStorage:', allKeys);
    console.log('Total:', allKeys.length);
    
    // 2. SEGUNDO PASO: Borrar CADA key explícitamente
    console.log('');
    console.log('🗑️ Borrando keys una por una...');
    allKeys.forEach(function(key, idx){
      try {
        localStorage.removeItem(key);
        console.log('  [' + (idx+1) + '] ✅ Borrado:', key);
      } catch(e) {
        console.log('  [' + (idx+1) + '] ❌ Error borrando ' + key + ':', e.message);
      }
    });
    
    // 3. TERCERA VUELTA: Verificar que realmente se borraron
    console.log('');
    console.log('✓ Verificación post-borrado:');
    console.log('  localStorage.length:', localStorage.length);
    console.log('  localStorage keys restantes:', Object.keys(localStorage).length);
    
    // 4. CUARTA VUELTA: Si aún quedan, borrar nuevamente
    if(localStorage.length > 0){
      console.log('');
      console.log('⚠️ Aún hay items, haciendo limpieza adicional...');
      for(var i=0; i<100; i++){
        try {
          var key = localStorage.key(0);
          if(!key) break;
          localStorage.removeItem(key);
          console.log('  Removido (intento 2):', key);
        } catch(e){ break; }
      }
    }
    
    // 5. Limpiar sessionStorage
    console.log('');
    console.log('Limpiando sessionStorage...');
    sessionStorage.clear();
    console.log('  ✅ sessionStorage limpiado');
    
    // 6. Limpiar todas las variables globales posibles
    console.log('');
    console.log('Reseteando variables globales...');
    window.TERCEROS_DB = {};
    window.CLS_DB = {};
    window.CUEST_RESPUESTAS = {};
    window.MATRIZ_DB = [];
    window.RESULTADO_EVALUACION = {};
    window.TIPOLOGIAS_DB_CUSTOM = {};
    window.EVID_CUEST = {};
    window.CUEST_DB = {};
    window.AC_RESPUESTAS = {};
    window.CF_TERCEROS = {};
    window._cfContratosBuffer = [];
    console.log('  ✅ Variables globales reseteadas');
    
    // 7. Verificación final
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 ESTADO FINAL:');
    console.log('  localStorage.length:', localStorage.length);
    console.log('  TERCEROS_DB keys:', Object.keys(window.TERCEROS_DB).length);
    console.log('  ✅ LIMPIEZA COMPLETADA');
    console.log('='.repeat(60));
    console.log('');
    console.log('🔄 Recargando página en 2 segundos...');
    
    // 8. RELOAD FORZADO
    setTimeout(function(){
      // Usar diferentes métodos de reload para asegurar que funciona
      try {
        window.location.reload(true);
      } catch(e) {
        try {
          location.reload(true);
        } catch(e2) {
          window.location.href = window.location.href;
        }
      }
    }, 2000);
    
  } catch(e) {
    console.error('❌ ERROR FATAL:', e);
    console.log('Reintentando reload...');
    setTimeout(function(){ location.reload(true); }, 1000);
  }
};

