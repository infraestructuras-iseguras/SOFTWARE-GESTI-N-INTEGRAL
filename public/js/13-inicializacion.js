
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    // Cargar TERCEROS_DB desde localStorage
    try{
      var raw = localStorage.getItem('sgrt_terceros_db_shared');
      var saved = JSON.parse(raw||'{}');
      if(raw!==null) window.TERCEROS_DB = saved;
      
      // ⭐ BASE DE DATOS LIMPIA - SIN DATOS DE EJEMPLO
      // window.TERCEROS_DB está vacío para pruebas limpias
    }catch(e){
      console.error('Error cargando datos de ejemplo:', e);
    }
  }, 1000);
});
