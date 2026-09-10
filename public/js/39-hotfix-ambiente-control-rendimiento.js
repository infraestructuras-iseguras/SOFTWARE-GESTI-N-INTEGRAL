/*
 * SGRT — Hotfix 39 (2026-09-10)
 * Alcance estrictamente puntual:
 * 1) Ambiente de Control: 6 respuestas "Sí" = 100% / OPTIMIZADO / 5.0.
 *    La valoración se reconcilia con los 6 selectores visibles para evitar paneles
 *    desactualizados (ej. todos en Sí pero mostrando 30%).
 * 2) Se eliminan únicamente los botones pequeños "Ir" del bloque "Estado por
 *    tipología". Se conserva el selector "Tipología a diligenciar" y el botón
 *    principal "Ir a diligenciar esta tipología".
 * 3) El botón principal lleva al tercero/contrato/tipología seleccionados.
 * 4) Se reduce trabajo repetido durante el diligenciamiento: guardado local y
 *    sincronización remota se agrupan (debounce), se elimina la reconciliación global
 *    en cada click y los timers redundantes se espacian. No cambia backend, tablas, roles, diseño ni estructura de datos.
 */
(function(){
  'use strict';

  function norm(v){ return String(v == null ? '' : v).trim(); }
  function plain(v){
    var s=norm(v).toLowerCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
    return s;
  }
  function answer(v){
    var s=plain(v);
    if(s==='si'||s==='yes'||s==='true'||s==='1') return 'Si';
    if(s==='no') return 'No';
    if(s==='no aplica'||s==='n/a'||s==='na'||s==='no_aplica') return 'No Aplica';
    if(s==='parcial'||s==='parcialmente') return 'Parcial';
    return norm(v);
  }
  function getDB(){ if(!window.TERCEROS_DB) window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function getResponses(){ if(!window.CUEST_RESPUESTAS) window.CUEST_RESPUESTAS={}; return window.CUEST_RESPUESTAS; }
  function activeContract(nit){
    var t=getDB()[nit]||{};
    return norm((document.getElementById('q-contrato-sel')||{}).value)
      || norm((document.getElementById('ac-contrato-sel')||{}).value)
      || norm(t.contratoEval);
  }

  /* -------------------------------------------------------------
   * Fórmula canónica de 6 atributos. Mantiene los mismos pesos.
   * ------------------------------------------------------------- */
  function calcControl(resp){
    resp=resp||{};
    var a1=answer(resp.a1);
    if(a1==='No Aplica') return {pct:0,nivelCumpl:'NO APLICA',madurez:'NO APLICA',valorMad:null,color:'#6B7280',bgColor:'#F3F4F6',cumplRaw:0};
    if(!a1||a1==='No') return {pct:0,nivelCumpl:'0%',madurez:'NO EXISTE',valorMad:0,color:'#6B7280',bgColor:'#F3F4F6',cumplRaw:0};

    var weights={a1:.15,a2:.15,a3:.15,a4:.15,a5:.20,a6:.20};
    var sum=0;
    Object.keys(weights).forEach(function(k){
      var v=answer(resp[k]);
      if(v==='Si') sum+=weights[k];
      else if(k==='a1'&&v==='Parcial') sum+=.05;
    });
    // Evita residuos binarios como 0.999999999 y garantiza 6 Sí = 100.
    var raw=Math.round(sum*100)/100;
    var pct=Math.round(raw*100);
    var m;
    if(pct>=91) m=['OPTIMIZADO',5,'#15803D','#DCFCE7'];
    else if(pct>=71) m=['ADMINISTRADO',4,'#16A34A','#F0FDF4'];
    else if(pct>=41) m=['DEFINIDO',3,'#CA8A04','#FEFCE8'];
    else if(pct>=21) m=['REPETIBLE',2,'#EA580C','#FFF7ED'];
    else if(pct>0) m=['INICIAL',1,'#DC2626','#FEF2F2'];
    else m=['NO EXISTE',0,'#6B7280','#F3F4F6'];
    return {pct:pct,nivelCumpl:pct+'%',madurez:m[0],valorMad:m[1],color:m[2],bgColor:m[3],cumplRaw:raw};
  }
  window._calcCtrlValoracion=calcControl;

  function ensureResp(nit,key,ctrlN){
    var r=getResponses();
    if(!r[nit]) r[nit]={};
    if(!r[nit][key]) r[nit][key]={};
    if(!r[nit][key][ctrlN]) r[nit][key][ctrlN]={};
    return r[nit][key][ctrlN];
  }

  function updateInline(key,ctrlN,val){
    var pct=document.getElementById('vc-pct-'+key+'-'+ctrlN);
    var mad=document.getElementById('vc-mad-'+key+'-'+ctrlN);
    var score=document.getElementById('vc-val-'+key+'-'+ctrlN);
    var wrap=document.getElementById('valCtrl-'+key+'-'+ctrlN);
    if(pct){pct.textContent=val.nivelCumpl;pct.style.color=val.color;}
    if(mad){mad.textContent=val.madurez;mad.style.color=val.color;mad.style.background=val.bgColor;mad.style.padding='3px 8px';mad.style.borderRadius='8px';}
    if(score){score.textContent=val.valorMad!==null&&val.valorMad>0?val.valorMad+'.0':'—';score.style.color=val.color;}
    if(wrap){
      wrap.style.background=val.madurez==='NO APLICA'?'#F9FAFB':val.pct>=80?'linear-gradient(90deg,#F0FDF4,#DCFCE7)':val.pct>=60?'linear-gradient(90deg,#FEFCE8,#FEF9C3)':val.pct>=40?'linear-gradient(90deg,#FFF7ED,#FFEDD5)':val.pct>0?'linear-gradient(90deg,#FEF2F2,#FEE2E2)':'#F9FAFB';
      wrap.style.borderColor=val.color+'55';
    }
  }

  var persistTimer=null, remoteTimers={}, remoteRunning={}, lastSavedText={};
  function writeTextIfChanged(key,txt){
    try{
      if(lastSavedText[key]===txt)return;
      if(localStorage.getItem(key)!==txt)localStorage.setItem(key,txt);
      lastSavedText[key]=txt;
    }catch(e){}
  }
  function persistSoon(nit){
    clearTimeout(persistTimer);
    persistTimer=setTimeout(function(){
      try{
        var db=getDB(),r=getResponses();
        // Una sola instantánea por pausa del usuario, no por cada click/control.
        var rTxt=JSON.stringify(r),dbTxt=JSON.stringify(db);
        writeTextIfChanged('sgrt_cuest_respuestas',rTxt);
        writeTextIfChanged('sgrt_terceros_db_shared',dbTxt);

        // sgrt_v8 se conserva por compatibilidad, pero se actualiza solo después
        // de que el usuario deje de cambiar respuestas por un momento.
        var state={};
        try{state=JSON.parse(localStorage.getItem('sgrt_v8')||'{}')||{};}catch(e){state={};}
        state.CUEST_RESPUESTAS=r;
        state.TERCEROS_DB=db;
        writeTextIfChanged('sgrt_v8',JSON.stringify(state));
        localStorage.setItem('sgrt_last_change_v1',JSON.stringify({kind:'respuestas-ac',nit:nit||'',contrato:activeContract(nit||''),ts:Date.now()}));
      }catch(e){}
    },900);

    if(!nit) return;
    clearTimeout(remoteTimers[nit]);
    remoteTimers[nit]=setTimeout(function(){
      var t=getDB()[nit];
      if(!t||typeof window._sgrtUpsertEstadoCompleto!=='function') return;
      if(remoteRunning[nit]){remoteTimers[nit]=setTimeout(function(){persistSoon(nit);},4000);return;}
      remoteRunning[nit]=true;
      try{
        Promise.resolve(window._sgrtUpsertEstadoCompleto(t))
          .catch(function(){})
          .finally(function(){delete remoteRunning[nit];});
      }catch(e){delete remoteRunning[nit];}
    },4000);
  }

  function stashContract(nit){
    var t=getDB()[nit]; if(!t) return;
    var c=activeContract(nit); if(!c) return;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object') t.respuestasACPorContrato={};
    // Mantener referencia viva durante el diligenciamiento evita clonar todo el cuestionario
    // por cada selector. Al cambiar de contrato, los módulos existentes ya crean su copia.
    t.respuestasACPorContrato[c]=getResponses()[nit]||{};
    t.contratoEval=c;t.modoEval='contrato';t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
  }

  function readVisibleControl(nit,key,ctrlN){
    var nitKey=norm(nit).replace(/[^a-z0-9]/gi,'_');
    var resp=ensureResp(nit,key,ctrlN);
    for(var i=1;i<=6;i++){
      var el=document.getElementById('qa_'+nitKey+'_'+key+'_'+ctrlN+'_a'+i);
      if(el) resp['a'+i]=answer(el.value);
    }
    return resp;
  }

  function syncControl(nit,key,ctrlN,save){
    nit=norm(nit);key=norm(key);ctrlN=parseInt(ctrlN,10);
    if(!nit||!key||!ctrlN) return;
    var resp=readVisibleControl(nit,key,ctrlN);
    var val=calcControl(resp);
    updateInline(key,ctrlN,val);
    stashContract(nit);
    try{if(typeof window.actualizarBadgeSec==='function')window.actualizarBadgeSec(nit,key);}catch(e){}
    if(save!==false) persistSoon(nit);
  }

  /*
   * Reemplazamos SOLO los handlers de Ambiente de Control que estaban haciendo
   * varias serializaciones + renders completos por cada selector modificado.
   */
  window.onChangeAtribCuest=function(nit,key,ctrlN,ai){
    nit=norm(nit);key=norm(key);ctrlN=parseInt(ctrlN,10);ai=parseInt(ai,10);
    if(!nit||!key||!ctrlN||!ai) return;
    var nitKey=nit.replace(/[^a-z0-9]/gi,'_');
    var resp=ensureResp(nit,key,ctrlN);
    var changed=document.getElementById('qa_'+nitKey+'_'+key+'_'+ctrlN+'_a'+ai);
    if(changed) resp['a'+ai]=answer(changed.value);

    var a1=answer(resp.a1),a6=answer(resp.a6);
    for(var i=2;i<=6;i++){
      var el=document.getElementById('qa_'+nitKey+'_'+key+'_'+ctrlN+'_a'+i);
      if(!el) continue;
      if(a1==='No'||a1==='No Aplica'){
        el.value=a1==='No'?'No':'';el.disabled=true;el.style.opacity='0.4';resp['a'+i]=answer(el.value);
      }else{el.disabled=false;el.style.opacity='1';}
    }
    // Compatibilidad con un posible atributo 7 legado sin incluirlo en la fórmula.
    var a7=document.getElementById('qa_'+nitKey+'_'+key+'_'+ctrlN+'_a7');
    if(a7){
      if(a1==='No'||a1==='No Aplica'){a7.value=a1==='No'?'No':'';a7.disabled=true;a7.style.opacity='0.4';}
      else if(a6==='No'){a7.value='No';a7.disabled=true;a7.style.opacity='0.4';}
      else{a7.disabled=false;a7.style.opacity='1';}
      resp.a7=answer(a7.value);
    }

    // Leer los SEIS selectores tal como están visibles antes de calcular.
    syncControl(nit,key,ctrlN,true);
    try{if(typeof window._flashGuardadoCuest==='function')window._flashGuardadoCuest();}catch(e){}
    scheduleStatusRefresh(nit);
  };

  window.onChangeObsCuest=function(nit,key,ctrlN,val){
    nit=norm(nit);key=norm(key);ctrlN=parseInt(ctrlN,10);
    if(!nit||!key||!ctrlN)return;
    ensureResp(nit,key,ctrlN).obs=val;
    stashContract(nit);persistSoon(nit);
    try{if(typeof window._flashGuardadoCuest==='function')window._flashGuardadoCuest();}catch(e){}
  };

  function reconcileVisibleScores(){
    var first=document.querySelectorAll('select[id^="qa_"][id$="_a1"]');
    var anyNit='';
    Array.prototype.forEach.call(first,function(el){
      var oc=el.getAttribute('onchange')||'';
      var m=oc.match(/onChangeAtribCuest\('([^']*)','([^']*)',(\d+),1\)/);
      if(!m)return;
      anyNit=m[1];syncControl(m[1],m[2],parseInt(m[3],10),false);
    });
    if(anyNit)persistSoon(anyNit);
  }

  /* -------------------------------------------------------------
   * Estado por tipología: conservar la lista, quitar botones "Ir".
   * ------------------------------------------------------------- */
  function removeSmallGoButtons(){
    var wrap=document.getElementById('ac-tips-estado');if(!wrap)return;
    Array.prototype.forEach.call(wrap.querySelectorAll('button'),function(b){
      if(plain(b.textContent)==='ir') b.remove();
    });
  }
  var oldShowStatus=window.acMostrarEstadoTipologias;
  if(typeof oldShowStatus==='function'){
    window.acMostrarEstadoTipologias=function(){
      var r=oldShowStatus.apply(this,arguments);removeSmallGoButtons();return r;
    };
  }
  var statusTimer=null;
  function scheduleStatusRefresh(nit){
    clearTimeout(statusTimer);
    statusTimer=setTimeout(function(){
      try{if(typeof window.acMostrarEstadoTipologias==='function')window.acMostrarEstadoTipologias(nit);}catch(e){}
      removeSmallGoButtons();
    },180);
  }

  /* -------------------------------------------------------------
   * Botón principal: sincronizar tercero + contrato y filtrar por key.
   * ------------------------------------------------------------- */
  window.acIrADiligenciar=function(){
    var tipSel=document.getElementById('ac-tip-filtro');
    var tip=norm(tipSel&&tipSel.value);
    var opt=tipSel&&tipSel.selectedIndex>=0?tipSel.options[tipSel.selectedIndex]:null;
    var key=norm(opt&&opt.getAttribute&&opt.getAttribute('data-key'));
    var acThird=document.getElementById('ac-tercero-instruc');
    var nit=norm(acThird&&acThird.value);
    var contrato=activeContract(nit);
    if(!nit){try{window.showToast&&window.showToast('Selecciona un tercero primero','error',2000);}catch(e){}return;}
    if(!tip){try{window.showToast&&window.showToast('Selecciona una tipología primero','error',2000);}catch(e){}return;}

    var qThird=document.getElementById('q-tercero');
    if(qThird){
      var has=Array.prototype.some.call(qThird.options||[],function(o){return norm(o.value)===nit;});
      if(has)qThird.value=nit;
    }
    var t=getDB()[nit];if(t&&contrato){t.contratoEval=contrato;t.modoEval='contrato';}
    var qContract=document.getElementById('q-contrato-sel');
    if(qContract&&contrato){
      var hasC=Array.prototype.some.call(qContract.options||[],function(o){return norm(o.value)===contrato;});
      if(hasC)qContract.value=contrato;
    }

    try{if(typeof window.switchCuestTabExtended==='function')window.switchCuestTabExtended('cuest');}catch(e){}
    setTimeout(function(){
      try{if(typeof window.cargarCuestionarioTercero==='function')window.cargarCuestionarioTercero();}catch(e){}
      setTimeout(function(){
        try{if(typeof window._filtrarSeccionesPorTip==='function')window._filtrarSeccionesPorTip(tip,key);}catch(e){}
        reconcileVisibleScores();
      },180);
    },60);
  };

  /* -------------------------------------------------------------
   * Timers: dejar un solo refresco global espaciado por responsabilidad.
   * Los eventos/cambios siguen guardándose de inmediato mediante debounce.
   * ------------------------------------------------------------- */
  function tuneKnownTimers(){
    try{
      if(window._AUTOSAVE_INTERVALO){clearInterval(window._AUTOSAVE_INTERVALO);window._AUTOSAVE_INTERVALO=null;}
      if(typeof window.autoguardarTodo==='function')window._AUTOSAVE_INTERVALO=setInterval(function(){if(!document.hidden)try{window.autoguardarTodo(false);}catch(e){}},60000);
    }catch(e){}
    try{
      if(window._INTERVALO_SINCRO){clearInterval(window._INTERVALO_SINCRO);window._INTERVALO_SINCRO=null;}
      if(typeof window.sincronizarTercerosGlobal==='function')window._INTERVALO_SINCRO=setInterval(function(){if(!document.hidden)try{window.sincronizarTercerosGlobal();}catch(e){}},60000);
    }catch(e){}
    try{
      if(window._AUTOREFRESH_INTERVAL){clearInterval(window._AUTOREFRESH_INTERVAL);window._AUTOREFRESH_INTERVAL=null;}
      if(typeof window._sgrtRefreshCurrent==='function')window._AUTOREFRESH_INTERVAL=setInterval(function(){if(!document.hidden)try{window._sgrtRefreshCurrent();}catch(e){}},45000);
    }catch(e){}
    try{
      if(window._sgrtReportRealtimeTimer){clearInterval(window._sgrtReportRealtimeTimer);window._sgrtReportRealtimeTimer=null;}
    }catch(e){}
  }

  function init(){
    removeSmallGoButtons();
    setTimeout(reconcileVisibleScores,350);
    setTimeout(tuneKnownTimers,1200);
    setTimeout(tuneKnownTimers,3200); // después de los instaladores tardíos de módulos previos
  }

  document.addEventListener('change',function(ev){
    var id=(ev.target&&ev.target.id)||'';
    if(id==='ac-tercero-instruc'||id==='ac-contrato-sel'||id==='ac-tip-filtro'){
      setTimeout(removeSmallGoButtons,120);
      if(id!=='ac-tip-filtro')setTimeout(reconcileVisibleScores,220);
    }
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
