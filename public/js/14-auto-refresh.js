/*
 * SGRT — Auto-refresh seguro.
 * Actualiza desde la fuente central sin duplicar peticiones ni reiniciar formularios
 * mientras el usuario está diligenciando información.
 */
(function(){
  'use strict';

  try{if(window._AUTOREFRESH_INTERVAL)clearInterval(window._AUTOREFRESH_INTERVAL);}catch(e){}
  var running=false;

  async function refreshCurrent(){
    if(running)return;
    running=true;
    try{
      // Primero reconciliar el estado central. No muestra skeleton/spinner.
      if(typeof window.sgrtCargarDesdeServidor==='function'){
        await window.sgrtCargarDesdeServidor();
      }

      var activePage=document.querySelector('.page.active');
      if(!activePage)return;
      var pgId=activePage.id;

      // Registro: una sola petición y en modo silencioso para no dejar la tabla
      // parpadeando/cargando cada cinco segundos.
      if(pgId==='pg-terceros'&&typeof window.cargarTercerosDesdeAPI==='function'){
        await window.cargarTercerosDesdeAPI({silent:true});
      }

      // Clasificación / supervisión del Evaluador: renderizar la tabla ya reconciliada,
      // sin forzar la vista antigua de formulario/procesos.
      if(pgId==='pg-clasificacion'){
        try{if(typeof window.clsInitDash==='function')window.clsInitDash();}catch(e){}
        try{if(typeof window.clsRender==='function')window.clsRender();}catch(e){}
        var rol=String((window.currentUser||{}).rol||'').toLowerCase();
        if((rol==='cliente'||rol==='evaluador')&&typeof window.applyRoleRestrictions==='function'){
          try{window.applyRoleRestrictions();}catch(e){}
        }
      }

      // Solo refrescar vistas de lectura. Ambiente de Control no se recarga aquí para
      // no borrar/alterar respuestas que el usuario esté diligenciando.
      if(pgId==='pg-informes'&&typeof window.cargarInformes==='function'){
        try{window.cargarInformes();}catch(e){}
      }
      if(pgId==='pg-seguimiento'&&typeof window.renderSeguimiento==='function'){
        try{window.renderSeguimiento();}catch(e){}
      }
    }catch(e){
      console.warn('[SGRT] Auto-refresh no disponible:',e&&e.message?e.message:e);
    }finally{
      running=false;
    }
  }

  window._sgrtRefreshCurrent=refreshCurrent;
  window._AUTOREFRESH_INTERVAL=setInterval(refreshCurrent,5000);
})();
