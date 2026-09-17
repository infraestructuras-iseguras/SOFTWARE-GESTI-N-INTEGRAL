/* SGRT — Ajuste puntual V8
 * Evaluador / Ambiente de Control:
 * - Los contadores de sección y el progreso global usan SOLO los controles
 *   activos/configurados para el contrato actualmente seleccionado.
 * - No modifica preguntas, respuestas, valoración, diseño ni otros módulos.
 */
(function(){
  'use strict';

  function norm(v){ return String(v == null ? '' : v).trim(); }
  function getDB(){ return window.TERCEROS_DB || {}; }

  function contratoActivo(nit){
    var t = getDB()[nit] || {};
    var ids = ['ac-contrato-sel','q-contrato-sel'];
    for(var i=0;i<ids.length;i++){
      var el = document.getElementById(ids[i]);
      var v = norm(el && el.value);
      if(v) return v;
    }
    return norm(t.contratoEval);
  }

  function controlesActivos(nit,key){
    var c = contratoActivo(nit);
    try{
      if(typeof window._ctrlsCuest === 'function'){
        var arr = window._ctrlsCuest(nit,key,c);
        if(Array.isArray(arr)) return arr;
      }
    }catch(e){}
    return ((window.CUESTIONARIO_CONTROLES || {})[key] || []).slice();
  }

  function respuestasNit(nit){
    return (window.CUEST_RESPUESTAS || {})[nit] || {};
  }

  function respondido(resp){
    var a1 = norm(resp && resp.a1);
    return a1 === 'Si' || a1 === 'No' || a1 === 'No Aplica' || a1 === 'Parcial';
  }

  // Reemplaza únicamente el cálculo global de avance.
  window.actualizarProgressoCuest = function(nit, tipKeys){
    nit = norm(nit);
    tipKeys = Array.isArray(tipKeys) ? tipKeys.filter(Boolean) : [];

    var totalAll = 0;
    var respondidosAll = 0;
    var tipActivas = [];
    var completadas = [];
    var rNit = respuestasNit(nit);

    tipKeys.forEach(function(k){
      var ctrls = controlesActivos(nit,k);
      // Una tipología sin preguntas activas no entra en el denominador.
      if(!ctrls.length) return;
      tipActivas.push(k);
      totalAll += ctrls.length;
      var respTip = 0;
      ctrls.forEach(function(c){
        if(respondido(rNit[k] && rNit[k][c.n])){
          respTip++;
          respondidosAll++;
        }
      });
      if(respTip === ctrls.length) completadas.push(k);
    });

    var pct = totalAll > 0 ? Math.round((respondidosAll / totalAll) * 100) : 0;

    var el = document.getElementById('q-resumen-progreso');
    if(el) el.innerHTML = '<b>'+respondidosAll+'/'+totalAll+'</b> controles respondidos &nbsp;·&nbsp; <b>'+pct+'%</b> completado';

    var el2 = document.getElementById('qi-progreso');
    if(el2) el2.textContent = respondidosAll+'/'+totalAll+' ('+pct+'%)';

    var barWrap = document.getElementById('q-progreso-bar-wrap');
    var bar = document.getElementById('q-progreso-bar');
    var pctLbl = document.getElementById('q-progreso-pct-lbl');
    var cntLbl = document.getElementById('q-progreso-count-lbl');
    var tipLbl = document.getElementById('q-progreso-tip-lbl');

    if(barWrap) barWrap.style.display = 'block';
    if(bar){
      bar.style.width = pct + '%';
      if(pct < 30) bar.style.background = 'linear-gradient(90deg,#dc3545,#fd7e14)';
      else if(pct < 70) bar.style.background = 'linear-gradient(90deg,#fd7e14,#ffc107)';
      else bar.style.background = 'linear-gradient(90deg,#1e6bb8,#28a745)';
    }
    if(pctLbl){
      pctLbl.textContent = pct + '%';
      pctLbl.style.color = pct === 100 ? '#28a745' : '#1e6bb8';
    }
    if(cntLbl) cntLbl.textContent = respondidosAll + ' de ' + totalAll + ' controles respondidos';
    if(tipLbl){
      var totalTips = tipActivas.length;
      tipLbl.textContent = completadas.length + '/' + totalTips + ' tipologías completas';
      if(pct === 100 && totalAll > 0){
        tipLbl.innerHTML = completadas.length + '/' + totalTips
          + ' tipologías completas &nbsp;·&nbsp; <span style="color:#16A34A;font-weight:800;">✅ Cuestionario completo — guardado automáticamente</span>';
      }
    }

    // Mantener el indicador de borrador que ya existía.
    try{
      var bRaw = localStorage.getItem('cuest_borrador_' + nit);
      if(bRaw){
        var b = JSON.parse(bRaw);
        var infoEl = document.getElementById('q-borrador-info');
        var tsEl = document.getElementById('q-borrador-ts');
        if(infoEl && tsEl){
          infoEl.style.display = 'block';
          tsEl.textContent = 'Borrador guardado el ' + b.fecha;
        }
      }
    }catch(e){}
  };

  // Conserva todo lo que ya hacía la función original, pero corrige al final
  // el contador de la sección con el contrato actual (ej. 1/1, no 1/50).
  var badgeOriginal = window.actualizarBadgeSec;
  window.actualizarBadgeSec = function(nit,key){
    try{
      if(typeof badgeOriginal === 'function') badgeOriginal.apply(this,arguments);
    }catch(e){}

    nit = norm(nit); key = norm(key);
    var ctrls = controlesActivos(nit,key);
    var rNit = respuestasNit(nit);
    var respondidos = 0;
    var valoresMad = [];

    ctrls.forEach(function(c){
      var resp = (rNit[key] && rNit[key][c.n]) || {};
      if(respondido(resp)) respondidos++;
      try{
        if(typeof window._calcCtrlValoracion === 'function'){
          var v = window._calcCtrlValoracion(resp);
          if(v && v.valorMad !== null && respondido(resp)) valoresMad.push(v.valorMad);
        }
      }catch(e){}
    });

    var total = ctrls.length;
    var badge = document.getElementById('sc-badge-'+key);
    if(badge){
      var complete = total > 0 && respondidos === total;
      badge.style.color = complete ? '#16A34A' : 'var(--muted)';
      badge.style.fontWeight = complete ? '800' : '600';
      badge.style.background = complete ? '#F0FDF4' : 'white';
      badge.style.borderColor = complete ? '#86EFAC' : 'var(--border)';

      var extra = '';
      try{
        if(valoresMad.length && typeof window._calcMadurezTipologia === 'function'){
          var mad = window._calcMadurezTipologia(valoresMad);
          if(mad) extra = ' &nbsp;<span style="color:'+mad.color+';font-weight:800;">'+mad.pct+'% · '+mad.madurez+'</span>';
        }
      }catch(e){}
      badge.innerHTML = respondidos+'/'+total+' respondidos' + extra;
    }

    var tipKeys = Array.from(document.querySelectorAll('[id^="sc-badge-"]'))
      .map(function(el){ return el.id.replace('sc-badge-',''); })
      .filter(Boolean);
    window.actualizarProgressoCuest(nit,tipKeys);
  };

  // Reconciliar una vez después de renders asíncronos existentes.
  function reconciliar(){
    var tercero = document.getElementById('q-tercero') || document.getElementById('ac-tercero-instruc');
    var nit = norm(tercero && tercero.value);
    if(!nit) return;
    var keys = Array.from(document.querySelectorAll('[id^="sc-badge-"]'))
      .map(function(el){ return el.id.replace('sc-badge-',''); })
      .filter(Boolean);
    if(!keys.length) return;
    keys.forEach(function(k){ try{ window.actualizarBadgeSec(nit,k); }catch(e){} });
  }

  setTimeout(reconciliar,250);
  setTimeout(reconciliar,900);
})();
