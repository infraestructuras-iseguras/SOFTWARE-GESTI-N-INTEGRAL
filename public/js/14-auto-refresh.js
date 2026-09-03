
window._AUTOREFRESH_INTERVAL = setInterval(() => {
  try {
    console.log('[SGRT] 🔄 AUTO-REFRESH: recargando todos los campos...');
    
    // Recargar terceros desde API
    if(typeof cargarTercerosDesdeAPI === 'function') {
      cargarTercerosDesdeAPI().catch(e => console.warn('[SGRT] ⚠️ Recarga de terceros fallida:', e.message));
    }
    
    // Recargar página actual si existe
    const activePage = document.querySelector('.page.active');
    if(activePage) {
      const pgId = activePage.id;
      console.log('[SGRT] 🔄 Refrescando página:', pgId);
      
      // Ejecutar función de recarga específica por página
      if(pgId === 'pg-terceros' && typeof cargarTercerosDesdeAPI === 'function') {
        cargarTercerosDesdeAPI();
      }
      if(pgId === 'pg-clasificacion' && typeof renderClasificacion === 'function') {
        renderClasificacion();
      }
      if(pgId === 'pg-evaluacion' && typeof cargarCuestionarioTercero === 'function') {
        cargarCuestionarioTercero();
      }
      if(pgId === 'pg-informes' && typeof cargarInformes === 'function') {
        cargarInformes();
      }
      if(pgId === 'pg-seguimiento' && typeof renderSeguimiento === 'function') {
        renderSeguimiento();
      }
    }
    
    // Forzar que los gráficos se rendericen
    if(typeof Chart !== 'undefined') {
      const canvas1 = document.getElementById('chart-riesgo-torta');
      const canvas2 = document.getElementById('chart-evaluaciones-torta');
      const canvas3 = document.getElementById('chart-tipologias-torta');
      
      if(canvas1 || canvas2 || canvas3) {
        console.log('[SGRT] 📊 Gráficos detectados, verificando renderizado...');
      }
    }
    
    console.log('[SGRT] ✅ AUTO-REFRESH completado');
  } catch(e) {
    console.error('[SGRT] ❌ ERROR en AUTO-REFRESH:', e.message);
  }
}, 5000); // 5 segundos

console.log('[SGRT] 🔄 AUTO-REFRESH iniciado (intervalo de 5 segundos)');
