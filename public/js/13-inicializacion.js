
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    // Cargar TERCEROS_DB desde localStorage
    try{
      var saved = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      if(!window.TERCEROS_DB) window.TERCEROS_DB = saved;
      
      // ⭐ BASE DE DATOS LIMPIA - SIN DATOS DE EJEMPLO
      // window.TERCEROS_DB está vacío para pruebas limpias
    }catch(e){
      console.error('Error cargando datos de ejemplo:', e);
    }
  }, 1000);
});
