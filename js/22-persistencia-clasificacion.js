/*
 * SGRT — Módulo 22: persistencia completa y vista detallada del Evaluador.
 * Mantiene el paquete local sin precarga automática y no modifica el alcance multiempresa de ISeguras.
 */
(function(){
  'use strict';

  var BACKUP_FORMAT='SGRT_BACKUP_COMPLETO_V2';
  function user(){return window.currentUser||{};}
  function isIS(){var u=user();return u.login==='iseguras2026'||['IS','iseguras','Superadministrador','Super Administrador'].indexOf(String(u.rol||''))>=0;}
  function isClient(){var u=user();return u.login==='evaluador'||['Cliente','evaluador'].indexOf(String(u.rol||''))>=0;}
  function norm(v){var s=String(v==null?'':v).toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.replace(/[^a-z0-9]/g,'');}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function toast(msg,type){try{if(window.showToast)window.showToast(msg,type||'info',3000);}catch(e){}}
  function db(){var out={};try{Object.assign(out,window.TERCEROS_DB||{});}catch(e){}try{var x=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');if(x&&typeof x==='object')Object.assign(out,x);}catch(e2){}try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');if(s.TERCEROS_DB)Object.assign(out,s.TERCEROS_DB);}catch(e3){}return out;}
  function isColp(t){var v=t&&(t.entidad||t.entidadLabel||t.NombreEntidad||'');var n=norm(v);return !n||n==='cliente1'||n.indexOf('colpensiones')>=0;}

  /* Guarda las estructuras críticas sin iniciar ninguna conexión remota. */
  window.sgrtGuardarTodoLocal=function(){
    try{
      var d=window.TERCEROS_DB||{};
      var r=window.CUEST_RESPUESTAS||{};
      var m=Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB:[];
      localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));
      localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(r));
      var s={};try{s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');}catch(e){}
      s.TERCEROS_DB=d;s.CUEST_RESPUESTAS=r;s.MATRIZ_DB=m;
      if(window.RESULTADO_EVALUACION)s.RESULTADO_EVALUACION=window.RESULTADO_EVALUACION;
      if(window.INFORMES_DB)s.INFORMES_DB=window.INFORMES_DB;
      localStorage.setItem('sgrt_v8',JSON.stringify(s));
      return true;
    }catch(e){return false;}
  };

  function clearMemory(){
    ['TERCEROS_DB','CUEST_RESPUESTAS','RESULTADO_EVALUACION','TIPOLOGIAS_DB_CUSTOM','EVID_CUEST','CUEST_DB','AC_RESPUESTAS','CF_TERCEROS','CLS_DB','REPORTES_POR_FASE','INFORMES_DB','USERS_EXTRA','NOTIF_LOG','LOGS_DATA'].forEach(function(k){if(Array.isArray(window[k]))window[k]=[];else if(window[k]&&typeof window[k]==='object')window[k]={};});
    try{if(window.MATRIZ_DB){window.MATRIZ_DB.length=0;}else window.MATRIZ_DB=[];}catch(e){}
  }
  function clearEverything(){
    clearMemory();
    var n=0;for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k){localStorage.removeItem(k);n++;}}
    return n;
  }
  function requireIS(){if(!isIS()){toast('Solo ISeguras/Superadministrador puede limpiar o restaurar la base local','error');return false;}return true;}

  /* Respaldo completo, no solo terceros: incluye todas las claves locales necesarias para el flujo. */
  window.bdExportarDatos=function(){
    if(!requireIS())return;
    var all={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k)all[k]=localStorage.getItem(k);}
    var payload={formato:BACKUP_FORMAT,fecha:new Date().toISOString(),localStorage:all,terceros:db()};
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='sgrt_backup_completo_'+Date.now()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(a.href);},600);toast('Respaldo completo local exportado','success');
  };
  window.bdCargarDatos=function(){
    if(!requireIS())return;
    var input=document.createElement('input');input.type='file';input.accept='.json';input.onchange=function(ev){var f=ev.target.files&&ev.target.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{var p=JSON.parse(rd.result);if(p.formato!==BACKUP_FORMAT&&(!p.terceros||typeof p.terceros!=='object'))throw new Error('Formato no reconocido');if(p.localStorage&&typeof p.localStorage==='object'){Object.keys(p.localStorage).forEach(function(k){localStorage.setItem(k,String(p.localStorage[k]));});}else{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(p.terceros));}toast('Respaldo cargado. Se recargará la aplicación','success');setTimeout(function(){location.reload();},700);}catch(e){toast('Respaldo inválido: '+e.message,'error');}};rd.readAsText(f);};input.click();
  };
  window.bdLimpiarBD=function(){
    if(!requireIS())return;
    if(!confirm('¿Limpiar completamente los registros y el almacenamiento local? Esta acción no se puede deshacer.'))return;
    var word=prompt('Escribe LIMPIAR para confirmar:');if(word!=='LIMPIAR'){toast('Operación cancelada','warning');return;}
    var n=clearEverything();toast('Almacenamiento local limpiado: '+n+' claves eliminadas','success');setTimeout(function(){location.reload();},800);
  };
  window.bdLimpiarLocalStorage=function(){
    if(!requireIS())return;
    if(!confirm('¿Limpiar todo el localStorage para iniciar pruebas nuevas?'))return;
    var n=clearEverything();toast('localStorage limpiado: '+n+' claves eliminadas','success');setTimeout(function(){location.reload();},800);
  };

  /* Vista solicitada: tabla completa de Registro de Terceros y Clasificación del Evaluador. */
  function dims(t){
    var a=(t&&Array.isArray(t.dims)?t.dims:[]);
    if(!a.length&&t&&t.dimsPorContrato&&t.contratoEval&&Array.isArray(t.dimsPorContrato[t.contratoEval]))a=t.dimsPorContrato[t.contratoEval];
    if(!a.length&&t&&Array.isArray(t.tipologias))a=t.tipologias;
    return a;
  }
  function tipologias(t){
    var a=dims(t);if(!a.length)return '<span style="color:var(--muted);font-size:11px;">Sin clasificación</span>';
    return '<div style="display:flex;flex-direction:column;gap:3px;">'+a.map(function(d){var label=d.nombre||d.nombre_tipologia||d.tipologia||d.label||d.key||'Tipología';var v=d.val==null?(d.valor==null?(d.puntaje==null?'—':d.puntaje):d.valor):d.val;return '<div style="font-size:11px;line-height:1.25;"><span style="font-weight:700;color:var(--navy);">'+esc(label)+'</span><br><span style="color:var(--muted);">Puntaje: </span><b>'+esc(v)+'</b></div>';}).join('')+'</div>';
  }
  function renderEvaluatorTable(){
    if(!isClient())return false;
    var body=document.getElementById('ig-tbody-terceros');if(!body)return false;
    var table=body.closest('table');if(table){var th=table.querySelector('thead');if(th)th.innerHTML='<tr><th>NIT</th><th>Nombre</th><th>Domicilio</th><th>Tipologías / Puntajes</th><th>Promedio</th><th>Tipo de riesgo</th><th>Acciones</th></tr>';}
    var entries=Object.values(db()).filter(function(t){return t&&String(t.nit||t.NIT||'').trim()&&isColp(t);});
    body.innerHTML=entries.length?entries.map(function(t){var nit=t.nit||t.NIT||'—';var nombre=t.nombre||t.NombreTercero||'—';var domicilio=t.domicilio||t.Domicilio||'—';var p=parseFloat(t.prom||t.PromedioCriticidad||t.PromedioCalificacion||0);var zona=t.zona||t.Zona_Riesgo||t.ZonaRiesgo||'—';var c=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';var actions='<button class="btn btn-outline btn-xs" onclick="verDetalleTercero(\''+esc(nit)+'\')">👁 Ver detalle</button> <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+esc(nit)+'\');},120)">📁 Documentos</button>';return '<tr><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+esc(nit)+'</td><td style="font-size:12.5px;font-weight:700;">'+esc(nombre)+'</td><td style="font-size:11px;max-width:180px;">'+esc(domicilio)+'</td><td style="min-width:210px;">'+tipologias(t)+'</td><td><span class="chip '+c+'" style="font-size:10px;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td><td><span class="chip '+c+'" style="font-size:10px;">'+esc(zona)+'</span></td><td style="white-space:nowrap;">'+actions+'</td></tr>';}).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">📋 No hay terceros registrados aún. Guarda un tercero en el formulario.</td></tr>';
    var count=document.getElementById('ig-terc-count')||document.getElementById('ig-terceros-count');if(count)count.textContent=entries.length+' registro'+(entries.length!==1?'s':'');
    return true;
  }
  var originalLoad=window.loadIGTercerosFull;
  window.loadIGTercerosFull=function(){if(isClient()&&renderEvaluatorTable())return;try{if(originalLoad)originalLoad.apply(this,arguments);}catch(e){}};
  window.renderIGTerceros=function(){return window.loadIGTercerosFull();};

  document.addEventListener('DOMContentLoaded',function(){
    window.sgrtGuardarTodoLocal();
    setTimeout(function(){try{if(isClient())renderEvaluatorTable();}catch(e){}},350);
  });
  window.addEventListener('pagehide',function(){try{window.sgrtGuardarTodoLocal();}catch(e){}});
  window.addEventListener('beforeunload',function(){try{window.sgrtGuardarTodoLocal();}catch(e){}});
})();
