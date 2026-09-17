/*
 * SGRT — Ajuste 37 (2026-09-05)
 * Corrección puntual: el rol Evaluador debe iniciar SIEMPRE en la vista
 * "Registro de Terceros y Clasificación" (#pg-clasificacion), no en la vista
 * antigua de "Información General" (#pg-info-general).
 * No modifica datos, tablas, filtros, cálculos ni flujo de los demás roles.
 */
(function(){
  'use strict';

  function role(){
    return String((window.currentUser||{}).rol||'').trim().toLowerCase();
  }
  function isEvaluator(){
    var r=role();
    return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0;
  }
  function evaluatorNav(){
    return document.querySelector('#sb-Cliente .nav-item[onclick*="pg-clasificacion"]') ||
           document.querySelector('#asb-Cliente .nav-item[onclick*="pg-clasificacion"]');
  }
  function refreshEvaluatorClassification(){
    if(!isEvaluator()) return;
    try{ if(typeof window.applyRoleRestrictions==='function') window.applyRoleRestrictions(); }catch(e){}
    try{ if(typeof window.clsInitDash==='function') window.clsInitDash(); }catch(e){}
    try{ if(typeof window.clsRender==='function') window.clsRender(); }catch(e){}
  }
  function forceCorrectEvaluatorPage(){
    if(!isEvaluator()) return false;
    var pg=document.querySelector('#app .page.active');
    var id=pg&&pg.id;
    if(id==='pg-clasificacion'){
      refreshEvaluatorClassification();
      return true;
    }
    var nav=evaluatorNav();
    if(typeof window.navTo==='function'){
      try{ window.navTo(nav,'pg-clasificacion'); }catch(e){}
    }else{
      document.querySelectorAll('#app .page').forEach(function(p){p.classList.remove('active');});
      var cls=document.getElementById('pg-clasificacion');
      if(cls) cls.classList.add('active');
      document.querySelectorAll('#sb-Cliente .nav-item').forEach(function(n){n.classList.remove('active');});
      if(nav) nav.classList.add('active');
    }
    refreshEvaluatorClassification();
    return true;
  }

  /* Cualquier enlace antiguo a Información General/Dashboard del Evaluador
     se redirige a la única vista válida de lectura: Clasificación. */
  var oldNav=window.navTo;
  if(typeof oldNav==='function' && !oldNav._sgrt37){
    var patchedNav=function(el,pgId){
      if(isEvaluator() && (pgId==='pg-info-general'||pgId==='pg-dashboard')){
        pgId='pg-clasificacion';
        el=evaluatorNav()||el;
      }
      var r=oldNav.call(this,el,pgId);
      if(isEvaluator()&&pgId==='pg-clasificacion'){
        setTimeout(refreshEvaluatorClassification,30);
      }
      return r;
    };
    patchedNav._sgrt37=true;
    window.navTo=patchedNav;
  }

  /* El login original todavía marcaba pg-info-general como página inicial.
     Se corrige inmediatamente en la misma ejecución para evitar que esa vista
     quede visible o "pegada" antes de la tabla correcta. */
  var oldLogin=window.doLogin;
  if(typeof oldLogin==='function' && !oldLogin._sgrt37){
    var patchedLogin=function(){
      var r=oldLogin.apply(this,arguments);
      if(isEvaluator()) forceCorrectEvaluatorPage();
      return r;
    };
    patchedLogin._sgrt37=true;
    window.doLogin=patchedLogin;
  }

  /* Protección para sesión restaurada / recarga. */
  function repairIfNeeded(){
    if(!isEvaluator()) return;
    var active=document.querySelector('#app .page.active');
    if(!active || active.id==='pg-info-general' || active.id==='pg-dashboard'){
      forceCorrectEvaluatorPage();
    }
  }
  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(repairIfNeeded,220);
    setTimeout(repairIfNeeded,750);
  });
  if(document.readyState!=='loading'){
    setTimeout(repairIfNeeded,80);
  }
})();
