/*
 * SGRT — Ajuste 34 (2026-09-04)
 * Cambios estrictamente puntuales solicitados:
 * 1) Rol Evaluador: retirar de la tabla principal la columna "Tipologías / Puntajes"
 *    porque esa información ya existe en "Ver detalle"; renombrar "Tipo de riesgo"
 *    a "Nivel de riesgo". No cambia datos, acciones, filtros ni flujo.
 * 2) Administrador de Riesgos / Supervisión AC: el bloque "Tipologías evaluadas"
 *    deja de mostrar tipologías sueltas y ofrece un "Ver detalle" compacto agrupado
 *    por Contrato -> Supervisor(es) -> Tipologías. No modifica la matriz de AC.
 */
(function(){
  'use strict';

  function norm(v){ return String(v==null?'':v).trim(); }
  function low(v){ return norm(v).toLowerCase(); }
  function esc(v){ return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function db(){ return window.TERCEROS_DB||{}; }
  function rol(){ return low((window.currentUser||{}).rol); }
  function esEvaluador(){ var r=rol(); return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0; }
  function esAdminRiesgos(){ var r=rol(); return r==='operativo'||r==='admin_riesgos'||r.indexOf('administrador de riesgos')>=0; }
  function numContrato(c){ return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato)); }

  /* ============================================================
   * EVALUADOR — NO REPETIR TIPOLOGÍAS EN LA TABLA PRINCIPAL
   * ============================================================ */
  function limpiarTablaEvaluador(){
    if(!esEvaluador()) return;

    // La captura corresponde al dashboard de Clasificación del Evaluador.
    var body=document.getElementById('cls-dash-tbody');
    var table=body&&body.closest('table');
    if(table){
      var headers=Array.from(table.querySelectorAll('thead th'));
      var idxTip=-1;
      headers.forEach(function(th,i){
        var txt=low(th.textContent);
        if(txt.indexOf('tipologías')>=0||txt.indexOf('tipologias')>=0){ idxTip=i; }
        if(txt.indexOf('tipo de riesgo')>=0){ th.textContent='Nivel de riesgo'; }
      });
      if(idxTip>=0){
        // Se elimina visualmente la columna completa sin alterar el modelo ni los datos.
        var th=headers[idxTip]; if(th) th.style.display='none';
        Array.from(table.querySelectorAll('tbody tr')).forEach(function(tr){
          if(tr.cells&&tr.cells[idxTip]) tr.cells[idxTip].style.display='none';
        });
      }
      // Por si un render posterior vuelve a escribir el encabezado.
      Array.from(table.querySelectorAll('thead th')).forEach(function(th){
        if(low(th.textContent).indexOf('tipo de riesgo')>=0) th.textContent='Nivel de riesgo';
      });
    }

    // También se protege la tabla de Información General si el flujo la reutiliza.
    var igBody=document.getElementById('ig-tbody-terceros');
    var igTable=igBody&&igBody.closest('table');
    if(igTable){
      var hs=Array.from(igTable.querySelectorAll('thead th'));
      var idx=-1;
      hs.forEach(function(th,i){
        var txt=low(th.textContent);
        if(txt.indexOf('tipologías')>=0||txt.indexOf('tipologias')>=0) idx=i;
        if(txt.indexOf('tipo de riesgo')>=0) th.textContent='Nivel de riesgo';
      });
      if(idx>=0){
        if(hs[idx]) hs[idx].style.display='none';
        Array.from(igTable.querySelectorAll('tbody tr')).forEach(function(tr){
          if(tr.cells&&tr.cells[idx]) tr.cells[idx].style.display='none';
        });
      }
    }
  }

  /* ============================================================
   * ADMIN RIESGOS — TIPOLOGÍAS EVALUADAS AGRUPADAS POR CONTRATO
   * ============================================================ */
  function supervisorsFor(t,c){
    var num=numContrato(c),out=[],seen={};
    try{
      if(window.sgrtSupervisoresContrato&&t){
        var arr=window.sgrtSupervisoresContrato(t.nit||t.NIT,num);
        if(Array.isArray(arr)&&arr.length) return arr;
      }
    }catch(e){}
    function add(s,forced){
      if(!s) return;
      if(typeof s==='string') s={nombre:s};
      var nombre=norm(s.nombre||s.name||s.supervisor||s.SupervisorNombre); if(!nombre) return;
      var cn=norm(s.contrato_asociado||s.contratoAsociado||s.contrato||s.numeroContrato||forced||num);
      if(cn&&num&&cn!==num) return;
      var key=low(nombre)+'|'+low(cn||num); if(seen[key]) return; seen[key]=1;
      out.push({nombre:nombre,cargo:norm(s.cargo||s.supervisorCargo||s.cargo_supervisor),proceso:norm(s.proceso||s.procesoSupervision||s.proceso_supervision)});
    }
    (Array.isArray(c&&c.supervisores)?c.supervisores:[]).forEach(function(s){add(s,num);});
    if(c){
      add({nombre:c.supervisor_asociado||c.supervisor,cargo:c.supervisorCargo,proceso:c.procesoSupervision},num);
      add({nombre:c.supervisorAlt,cargo:c.supervisorAltCargo,proceso:c.procesoSupervisionAlt},num);
    }
    (Array.isArray(t&&t.supervisores)?t.supervisores:[]).forEach(function(s){add(s);});
    return out;
  }

  function dimsFor(t,num){
    num=norm(num);
    if(t&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num])) return t.dimsPorContrato[num];
    var c=(t&&t.contratos||[]).find(function(x){return numContrato(x)===num;});
    if(c&&Array.isArray(c.dims)) return c.dims;
    if(t&&norm(t.contratoEval)===num&&Array.isArray(t.dims)) return t.dims;
    return [];
  }
  function tipName(d){
    try{ if(window._nombreTipologia) return window._nombreTipologia(d); }catch(e){}
    return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.label||d.key))||'Tipología';
  }
  function responseMap(t,nit,num){
    if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[num]) return t.respuestasACPorContrato[num];
    if(t&&norm(t.contratoEval)===norm(num)) return (window.CUEST_RESPUESTAS||{})[nit]||{};
    return {};
  }
  function activeCtrls(nit,num,key){
    try{
      if(typeof window._ctrlsCuest==='function'){
        var a=window._ctrlsCuest(nit,key,num);
        if(Array.isArray(a)) return a;
      }
    }catch(e){}
    return (((window.CUESTIONARIO_CONTROLES||{})[key])||[]).filter(function(q){return q&&q.activo!==false;});
  }
  function acPct(t,nit,num,d){
    var ctrls=activeCtrls(nit,num,d&&d.key),resp=responseMap(t,nit,num),answered=0;
    ctrls.forEach(function(q){
      var r=resp&&resp[d.key]&&resp[d.key][q.n];
      var a=norm(r&&r.a1);
      if(a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial') answered++;
    });
    return ctrls.length?Math.round(answered/ctrls.length*100):0;
  }

  function nitFromSafe(safe){
    var keys=Object.keys(db());
    for(var i=0;i<keys.length;i++){
      if(keys[i].replace(/[^a-z0-9]/gi,'_')===safe) return keys[i];
    }
    return '';
  }

  function patchTipologiasEvaluadas(){
    if(!esAdminRiesgos()) return;
    Array.from(document.querySelectorAll('[id^="rpt-prog-det-"]')).forEach(function(det){
      var safe=det.id.replace(/^rpt-prog-det-/,'');
      var nit=nitFromSafe(safe); if(!nit) return;
      var heading=null;
      Array.from(det.querySelectorAll('div')).some(function(el){
        if(el.children.length===0&&low(el.textContent)==='tipologías evaluadas'){ heading=el; return true; }
        return false;
      });
      if(!heading||!heading.parentElement) return;
      var block=heading.parentElement;
      if(block.dataset.sgrtContractTips==='1') return;
      var t=db()[nit]||{};
      var cons=(t.contratos||[]).filter(function(c){return numContrato(c);});
      var totalTips=cons.reduce(function(sum,c){return sum+dimsFor(t,numContrato(c)).length;},0);
      block.dataset.sgrtContractTips='1';
      block.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">'
        +'<div><div style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;">Tipologías evaluadas</div>'
        +'<div style="font-size:9.5px;color:#94a3b8;margin-top:2px;">'+cons.length+' contrato'+(cons.length===1?'':'s')+' · '+totalTips+' tipología'+(totalTips===1?'':'s')+'</div></div>'
        +'<button type="button" onclick="window.sgrtVerTipologiasPorContrato(\''+esc(nit)+'\')" style="padding:5px 10px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;">👁 Ver detalle</button>'
        +'</div>';
    });
  }

  window.sgrtVerTipologiasPorContrato=function(nit){
    nit=norm(nit); var t=db()[nit]; if(!t) return;
    var old=document.getElementById('_sgrt-tip-contrato'); if(old) old.remove();
    var cons=(t.contratos||[]).filter(function(c){return numContrato(c);});
    var html=cons.length?cons.map(function(c){
      var num=numContrato(c),dims=dimsFor(t,num),ss=supervisorsFor(t,c);
      var sup=ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado';
      var tips=dims.length?dims.map(function(d){
        var raw=d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel);
        return '<div style="display:grid;grid-template-columns:minmax(180px,1fr) 58px 62px;gap:7px;align-items:center;padding:6px 8px;border-top:1px solid #eef2f7;font-size:10.5px;">'
          +'<span style="font-weight:700;color:#334155;">'+esc(tipName(d))+'</span>'
          +'<span style="text-align:center;font-weight:800;color:#1a3a5c;">'+esc(raw==null?'—':raw)+'</span>'
          +'<span style="text-align:center;color:#64748b;white-space:nowrap;">AC: '+acPct(t,nit,num,d)+'%</span></div>';
      }).join(''):'<div style="padding:8px;color:#94a3b8;font-size:10.5px;">Sin tipologías clasificadas para este contrato.</div>';
      return '<div style="border:1px solid #dbe3ec;border-radius:8px;overflow:hidden;margin-bottom:9px;background:white;">'
        +'<div style="padding:8px 10px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">'
        +'<span style="font-size:11.5px;font-weight:800;color:#1a3a5c;">Contrato '+esc(num)+'</span>'
        +'<span style="font-size:10px;color:#6d28d9;">👤 '+esc(sup)+'</span></div>'
        +'<div style="display:grid;grid-template-columns:minmax(180px,1fr) 58px 62px;gap:7px;padding:5px 8px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;"><span>Tipología</span><span style="text-align:center;">Puntaje</span><span style="text-align:center;">AC</span></div>'
        +tips+'</div>';
    }).join(''):'<div style="padding:18px;text-align:center;color:#94a3b8;">No hay contratos clasificados.</div>';

    var ov=document.createElement('div'); ov.id='_sgrt-tip-contrato';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9995;display:flex;align-items:flex-start;justify-content:center;padding:45px 12px;overflow:auto;';
    ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="width:650px;max-width:97vw;background:white;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.25);overflow:hidden;">'
      +'<div style="padding:12px 15px;background:#1a3a5c;color:white;display:flex;justify-content:space-between;align-items:center;gap:10px;">'
      +'<div><div style="font-size:13px;font-weight:800;">Tipologías evaluadas por contrato</div><div style="font-size:10px;opacity:.78;margin-top:2px;">'+esc(t.nombre||nit)+' · NIT '+esc(t.nit||nit)+'</div></div>'
      +'<button onclick="document.getElementById(\'_sgrt-tip-contrato\').remove()" style="background:none;border:0;color:white;font-size:20px;cursor:pointer;">×</button></div>'
      +'<div style="padding:12px 14px;max-height:68vh;overflow:auto;">'+html+'</div></div>';
    document.body.appendChild(ov);
  };

  function aplicar(){
    try{ limpiarTablaEvaluador(); }catch(e){ console.warn('[SGRT34] Evaluador:',e); }
    try{ patchTipologiasEvaluadas(); }catch(e2){ console.warn('[SGRT34] Tipologías por contrato:',e2); }
  }

  // Proteger los renders existentes sin cambiar su lógica.
  var prevCls=window.clsRender;
  if(typeof prevCls==='function') window.clsRender=function(){
    var r=prevCls.apply(this,arguments); setTimeout(aplicar,50); setTimeout(aplicar,160); return r;
  };
  var prevRpt=window.renderReportesAC;
  if(typeof prevRpt==='function') window.renderReportesAC=function(){
    var r=prevRpt.apply(this,arguments); setTimeout(aplicar,80); setTimeout(aplicar,200); return r;
  };

  // MutationObserver ligero: solo observa las dos zonas que pueden repintarse.
  function observe(id){
    var el=document.getElementById(id); if(!el||el.dataset.sgrt34Observed==='1') return;
    el.dataset.sgrt34Observed='1';
    new MutationObserver(function(){ setTimeout(aplicar,0); }).observe(el,{childList:true,subtree:true});
  }
  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(function(){ observe('cls-dash-tbody'); observe('cq-reportes-body'); aplicar(); },250);
    setTimeout(aplicar,850);
  });
  if(document.readyState!=='loading') setTimeout(function(){observe('cls-dash-tbody');observe('cq-reportes-body');aplicar();},180);
})();
