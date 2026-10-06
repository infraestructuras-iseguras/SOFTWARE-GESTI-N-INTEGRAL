/*
 * SGRT — Ajuste 48 / V32 (2026-10-06)
 * Correcciones solicitadas para Evaluador / Ambiente de Control:
 * - Registro de terceros: tipologías completas por contrato, sin columna redundante de detalle.
 * - "Nivel de riesgo" pasa a "Exposición del riesgo" (BAJO / MEDIO / ALTO).
 * - Promedio AC se calcula SOLO con respuestas de Ambiente de Control; sin respuestas muestra "—".
 * - Refuerzo de carga del cuestionario para evitar pantalla en blanco.
 * - Terminología visible del flujo de copia: "Completar" en lugar de "Rellenar".
 */
(function(){
  'use strict';

  function s(v){return String(v==null?'':v).trim();}
  function low(v){return s(v).toLowerCase();}
  function esc(v){return s(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function db(){return window.TERCEROS_DB||{};}
  function isEvaluator(){var r=low((window.currentUser||{}).rol);return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0;}
  function cnum(c){return s(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function canon(v){v=s(v);if(/^\d+$/.test(v))return String(parseInt(v,10));return low(v);}
  function mapVal(map,contract){if(!map||typeof map!=='object')return undefined;var cc=canon(contract),keys=Object.keys(map);for(var i=0;i<keys.length;i++)if(canon(keys[i])===cc)return map[keys[i]];}
  function dimKey(d){return low(d&&(d.key||d.clave||d.codigo||d.tipologia_key||d.tipologia||d.nombre||d.nombre_tipologia));}
  function dimName(d){try{var n=window._nombreTipologia&&window._nombreTipologia(d);if(s(n))return s(n);}catch(e){}return s(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.label||d.key))||'Tipología';}
  function dimsFor(t,contract){
    if(!t||!contract)return [];
    var a=mapVal(t.dimsPorContrato,contract);if(!Array.isArray(a)||!a.length)a=mapVal(t.tipologiasPorContrato,contract);
    var c=(t.contratos||[]).find(function(x){return canon(cnum(x))===canon(contract);});
    if((!Array.isArray(a)||!a.length)&&c){a=(Array.isArray(c.dims)&&c.dims.length?c.dims:(Array.isArray(c.tipologias)&&c.tipologias.length?c.tipologias:c.clasificacion));}
    if(!Array.isArray(a))a=[];var seen={};return a.filter(Boolean).filter(function(d){var k=dimKey(d)||low(dimName(d));if(!k||seen[k])return false;seen[k]=1;return true;});
  }
  function responseMap(t,contract){var r=mapVal(t&&t.respuestasACPorContrato,contract);return r&&typeof r==='object'?r:{};}
  function answered(r){var a=s(r&&r.a1);return a==='Si'||a==='Sí'||a==='No'||a==='No Aplica'||a==='Parcial';}
  function acStats(t,contract){
    var rr=responseMap(t,contract),values=[],answeredCount=0,total=0;
    dimsFor(t,contract).forEach(function(d){var k=dimKey(d),controls=[];try{controls=window._ctrlsCuest?window._ctrlsCuest(t.nit,k,contract):((window.CUESTIONARIO_CONTROLES||{})[k]||[]);}catch(e){controls=((window.CUESTIONARIO_CONTROLES||{})[k]||[]);}controls=(controls||[]).filter(function(q){return q&&q.activo!==false;});
      controls.forEach(function(q){total++;var r=rr&&rr[k]&&rr[k][q.n];if(!answered(r))return;answeredCount++;try{var calc=window._calcCtrlValoracion?window._calcCtrlValoracion(r):(typeof _calcCtrlValoracion==='function'?_calcCtrlValoracion(r):null);if(calc&&calc.valorMad!==null&&calc.valorMad!==undefined)values.push(Number(calc.valorMad));}catch(e2){}}
      );
    });
    var avg=null;if(values.length){avg=values.reduce(function(a,b){return a+b;},0)/values.length;avg=Math.round(avg*10)/10;}
    return {answered:answeredCount,total:total,avg:avg,pct:total?Math.round(answeredCount/total*100):0};
  }
  function exposure(t){
    var raw=low(t&& (t.nivel_riesgo||t.zona||t.Zona_Riesgo||t.ZonaRiesgo));
    if(raw.indexOf('extrem')>=0||raw.indexOf('critic')>=0||raw.indexOf('alto')>=0)return 'ALTO';
    if(raw.indexOf('moder')>=0||raw.indexOf('medio')>=0)return 'MEDIO';
    if(raw.indexOf('bajo')>=0)return 'BAJO';
    var nums=[];(t&&t.contratos||[]).forEach(function(c){dimsFor(t,cnum(c)).forEach(function(d){var v=parseFloat(d&&d.val);if(!isNaN(v))nums.push(v);});});
    if(nums.length){var p=nums.reduce(function(a,b){return a+b;},0)/nums.length;return p>=4?'ALTO':p>=3?'MEDIO':'BAJO';}
    return '—';
  }
  function expChip(x){var style=x==='ALTO'?'color:#b91c1c;background:#fef2f2;border-color:#fecaca;':x==='MEDIO'?'color:#b45309;background:#fffbeb;border-color:#fde68a;':'color:#15803d;background:#f0fdf4;border-color:#bbf7d0;';return '<span style="display:inline-block;padding:3px 9px;border:1px solid;border-radius:11px;font-size:10px;font-weight:800;'+style+'">'+esc(x)+'</span>';}
  function tipsHtml(t){
    var cs=(t.contratos||[]).filter(function(c){return cnum(c);});if(!cs.length)return '<span style="color:#94a3b8;">Sin contratos</span>';
    return '<div style="display:flex;flex-direction:column;gap:7px;">'+cs.map(function(c){var n=cnum(c),ds=dimsFor(t,n);return '<div style="padding:6px 8px;border:1px solid #e5e7eb;border-radius:7px;background:#fafcff;"><div style="font-size:10px;font-weight:800;color:#1a3a5c;margin-bottom:4px;">Contrato '+esc(n)+'</div>'+(ds.length?ds.map(function(d){var v=(d&&d.val!==undefined&&d.val!==null&&s(d.val)!=='')?' · '+esc(d.val):'';return '<div style="font-size:10.5px;color:#475569;line-height:1.45;">• '+esc(dimName(d))+v+'</div>';}).join(''):'<div style="font-size:10px;color:#94a3b8;">Sin tipologías asignadas</div>')+'</div>';}).join('')+'</div>';
  }

  // Registro del Evaluador: toda la clasificación contractual visible en la tabla.
  var oldLoad=window.loadIGTercerosFull;
  window.loadIGTercerosFull=function(){
    if(!isEvaluator())return typeof oldLoad==='function'?oldLoad.apply(this,arguments):undefined;
    var body=document.getElementById('ig-tbody-terceros');if(!body)return typeof oldLoad==='function'?oldLoad.apply(this,arguments):undefined;
    var table=body.closest('table'),head=table&&table.querySelector('thead');
    if(head)head.innerHTML='<tr><th>NIT</th><th>Nombre</th><th>Domicilio</th><th>Tipologías por contrato</th><th>Exposición del riesgo</th></tr>';
    var ent=low((window.currentUser||{}).entidad),entries=Object.values(db()).filter(function(t){if(!t||!s(t.nit||t.NIT))return false;if(!ent)return true;var te=low(t.entidad||t.entidadId||t.organizacion);return !te||te===ent;});
    body.innerHTML=entries.length?entries.map(function(t){var nit=s(t.nit||t.NIT);return '<tr><td style="font-size:11.5px;font-weight:700;color:var(--navy);">'+esc(nit)+'</td><td style="font-size:12px;font-weight:700;">'+esc(t.nombre||t.NombreTercero||'—')+'</td><td style="font-size:11px;max-width:180px;">'+esc(t.domicilio||t.Domicilio||'—')+'</td><td style="min-width:300px;">'+tipsHtml(t)+'</td><td style="text-align:center;">'+expChip(exposure(t))+'</td></tr>';}).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">No hay terceros registrados.</td></tr>';
    var count=document.getElementById('ig-terc-count')||document.getElementById('ig-terceros-count');if(count)count.textContent=entries.length+' registro'+(entries.length!==1?'s':'');
    try{window.filterIGTerceros&&window.filterIGTerceros();}catch(e){}return true;
  };
  window.renderIGTerceros=function(){return window.loadIGTercerosFull();};

  // Tabla de contratos del cuestionario: no reutilizar el promedio de clasificación como Promedio AC.
  window.qRenderizarContratosTabla=function(nit){
    var wrap=document.getElementById('q-contratos-tabla-wrap'),list=document.getElementById('q-contratos-tabla-lista'),btn=document.getElementById('q-ver-det-contratos');if(!wrap||!list||!btn)return;
    var t=db()[nit],cons=(t&&t.contratos||[]).filter(function(c){return c&&(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true||dimsFor(t,cnum(c)).length);});if(!cons.length){wrap.style.display='none';return;}wrap.style.display='block';btn.style.display='none';
    var h='<table style="width:100%;border-collapse:collapse;font-size:11.5px;"><tr style="background:#f0f4f8;border-bottom:2px solid #dee2e6;"><th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">No. Contrato</th><th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Objeto</th><th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Vigencia</th><th style="padding:8px;text-align:left;font-weight:700;color:#1a3a5c;">Supervisor</th><th style="padding:8px;text-align:center;font-weight:700;color:#1a3a5c;">Avance</th><th style="padding:8px;text-align:right;font-weight:700;color:#1a3a5c;">Valor</th></tr>';
    cons.forEach(function(c,i){var n=cnum(c),st=acStats(t,n),vig=(c.fini||'—')+' → '+(c.ffin||'—'),sup=(c.supervisor||'—'),valor=c.valor?'$'+c.valor:'—';h+='<tr style="border-bottom:1px solid #eee;'+(i%2?'background:#fafbfc;':'')+'"><td style="padding:8px;color:#1a3a5c;font-weight:600;">'+esc(n)+'</td><td style="padding:8px;color:#374151;">'+esc(c.objeto||'—')+'</td><td style="padding:8px;color:#6c757d;">'+esc(vig)+'</td><td style="padding:8px;color:#1a3a5c;font-size:10px;">'+esc(sup)+'</td><td style="padding:8px;text-align:center;font-weight:800;color:#1e6bb8;">'+st.pct+'%</td><td style="padding:8px;text-align:right;color:#1a3a5c;">'+esc(valor)+'</td></tr>';});h+='</table>';list.innerHTML=h;
  };


  // Detalle de tipologías por contrato: usa las fuentes contractuales reales y claves equivalentes.
  // Esto evita que un tercero (por ejemplo, Manejo Técnico de Información) aparezca sin datos
  // cuando la información sí existe en dimsPorContrato/tipologiasPorContrato o dentro del contrato.
  function allContractDims(t,contract){
    var out=[],seen={};
    function add(arr){if(!Array.isArray(arr))return;arr.forEach(function(d){if(!d)return;var k=dimKey(d)||low(dimName(d));if(!k||seen[k])return;seen[k]=1;out.push(d);});}
    add(mapVal(t&&t.dimsPorContrato,contract));
    add(mapVal(t&&t.tipologiasPorContrato,contract));
    var c=(t&&t.contratos||[]).find(function(x){return canon(cnum(x))===canon(contract);});
    if(c){add(c.dims);add(c.tipologias);add(c.clasificacion);}
    // Solo tomar t.dims globales cuando estén etiquetadas para este contrato o no exista
    // ninguna fuente contractual y el tercero tenga un único contrato.
    var tagged=(t&&Array.isArray(t.dims)?t.dims:[]).filter(function(d){var dc=s(d&& (d.contrato||d.numContrato||d.numeroContrato||d.NoContrato));return dc&&canon(dc)===canon(contract);});
    add(tagged);
    if(!out.length&&(t&&t.contratos||[]).filter(function(x){return cnum(x);}).length===1)add(t.dims);
    return out;
  }
  window._verTipologiasContrato=function(nit,numContrato){
    try{
      var t=db()[nit]||db()[s(nit)];if(!t){window.showToast&&window.showToast('Tercero no encontrado','error',2000);return;}
      var contrato=(t.contratos||[]).find(function(c){return canon(cnum(c))===canon(numContrato);});
      if(!contrato){window.showToast&&window.showToast('Contrato no encontrado','error',2000);return;}
      var realNum=cnum(contrato)||s(numContrato),dims=allContractDims(t,realNum),pxc=mapVal(t.promPorContrato,realNum)||{};
      var old=document.getElementById('modal-tipologias-contrato');if(old)old.remove();
      var modal=document.createElement('div');modal.id='modal-tipologias-contrato';modal.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
      var tips=dims.length?'<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">'+dims.map(function(d){var raw=d&&d.val!==undefined?d.val:(d&&d.calificacion!==undefined?d.calificacion:d&&d.nivel),has=s(raw)!=='',dv=parseFloat(raw),dc=!has||isNaN(dv)?'#94a3b8':dv>=4?'#dc3545':dv>=3?'#fd7e14':dv>=2?'#ffc107':'#28a745';return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;"><span style="flex:1;font-size:12px;font-weight:600;color:#0f172a;">'+esc(dimName(d).replace(/^Riesgo\s+/i,''))+'</span><span style="padding:3px 10px;border-radius:6px;font-size:12px;font-weight:800;color:white;background:'+dc+';white-space:nowrap;min-width:50px;text-align:center;">'+esc(has?raw:'—')+'</span></div>';}).join('')+'</div>':'<div style="text-align:center;padding:20px;color:#9ca3af;font-style:italic;">Sin tipologías asignadas para este contrato.</div>';
      var prom=pxc&&pxc.prom!=null&&s(pxc.prom)!==''?pxc.prom:null,zona=s(pxc&& (pxc.zona||pxc.nivel_riesgo));
      modal.innerHTML='<div style="background:white;border-radius:12px;max-width:500px;width:100%;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);max-height:80vh;overflow-y:auto;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h2 style="font-size:18px;font-weight:800;color:#1a3a5c;margin:0;">📊 Tipologías</h2><button onclick="document.getElementById(\'modal-tipologias-contrato\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#6c757d;padding:0;">✕</button></div><div style="background:#f0f4f8;border:1px solid #bfdbfe;border-radius:8px;padding:12px 14px;margin-bottom:16px;"><div style="font-size:11px;color:#1e40af;font-weight:700;text-transform:uppercase;margin-bottom:6px;">Contrato</div><div style="font-size:13px;font-weight:600;color:#0f172a;">'+esc(realNum)+'</div><div style="font-size:12px;color:#475569;margin-top:4px;">'+esc(contrato.objeto||contrato.descripcion||'')+'</div></div>'+((prom!==null||zona)?'<div style="display:grid;grid-template-columns:'+(prom!==null&&zona?'1fr 1fr':'1fr')+';gap:8px;margin-bottom:16px;">'+(prom!==null?'<div style="background:#e8f5e9;border:1px solid #81c784;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#2e7d32;">'+esc(prom)+'</div><div style="font-size:10px;color:#2e7d32;font-weight:700;text-transform:uppercase;">Promedio clasificación</div></div>':'')+(zona?'<div style="background:#fff3e0;border:1px solid #ffb74d;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:14px;font-weight:800;color:#f57c00;">'+esc(zona)+'</div><div style="font-size:10px;color:#f57c00;font-weight:700;text-transform:uppercase;">Exposición</div></div>':'')+'</div>':'')+'<div style="font-size:12px;font-weight:700;color:#1a3a5c;margin-bottom:10px;">Calificaciones</div>'+tips+'</div>';
      document.body.appendChild(modal);
    }catch(e){console.warn('[SGRT48] verTipologiasContrato:',e);}
  };

  // Evita que el cuestionario quede visualmente en blanco durante una recarga lenta.
  function loading(on){var wrap=document.getElementById('q-secciones-wrap');if(!wrap)return;var id='sgrt48-q-loading',x=document.getElementById(id);if(on){if(!x){x=document.createElement('div');x.id=id;x.style.cssText='padding:18px;text-align:center;color:#64748b;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:8px 0;';x.textContent='Cargando preguntas del Ambiente de Control…';wrap.parentNode&&wrap.parentNode.insertBefore(x,wrap);}wrap.style.minHeight='80px';}else{if(x)x.remove();wrap.style.minHeight='';}}
  var oldQChange=window.qCambiarContrato;if(typeof oldQChange==='function'){window.qCambiarContrato=function(){loading(true);try{return oldQChange.apply(this,arguments);}finally{setTimeout(function(){loading(false);},180);}};}
  var oldAcGo=window.acIrADiligenciar;if(typeof oldAcGo==='function'){window.acIrADiligenciar=function(){loading(true);try{return oldAcGo.apply(this,arguments);}finally{setTimeout(function(){loading(false);},260);}};}
  var oldAcTip=window.acIrATipologia;if(typeof oldAcTip==='function'){window.acIrATipologia=function(){loading(true);try{return oldAcTip.apply(this,arguments);}finally{setTimeout(function(){loading(false);},260);}};}

  // Limpiar Ambiente de Control: borra únicamente el contrato activo y confirma la persistencia en Azure.
  var oldClear=window.limpiarRespuestasCuestionario;
  window.limpiarRespuestasCuestionario=function(){
    if(!isEvaluator())return typeof oldClear==='function'?oldClear.apply(this,arguments):undefined;
    var nit=s((document.getElementById('q-tercero')||document.getElementById('ac-tercero-instruc')||{}).value),
        contract=s((document.getElementById('q-contrato-sel')||document.getElementById('ac-contrato-sel')||{}).value),t=db()[nit];
    if(!nit||!contract||!t){try{window.showToast&&window.showToast('Selecciona primero un tercero y un contrato','error',2200);}catch(e){}return;}
    if(!window.confirm('¿Limpiar TODAS las respuestas del Ambiente de Control del contrato '+contract+'? Los demás contratos no se modificarán.'))return;
    function delAliases(map){if(!map||typeof map!=='object')return;Object.keys(map).forEach(function(k){if(canon(k)===canon(contract))delete map[k];});}
    t.respuestasACPorContrato=t.respuestasACPorContrato||{};t.borradoresACPorContrato=t.borradoresACPorContrato||{};t.acPorContrato=t.acPorContrato||{};
    delAliases(t.respuestasACPorContrato);delAliases(t.borradoresACPorContrato);delAliases(t.acPorContrato);
    t.respuestasACPorContrato[contract]={};t.borradoresACPorContrato[contract]={};t.acPorContrato[contract]={};
    if(window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS[nit]={};
    try{window._lsSave&&window._lsSave();}catch(e){}
    var sync=window._sgrtSyncEvaluatorContract;
    var pr=typeof sync==='function'?Promise.resolve(sync(nit,contract,{replaceResponses:true,respuestas:{},clearContract:true})):Promise.resolve(false);
    pr.then(function(ok){
      try{window.cargarCuestionarioTercero&&window.cargarCuestionarioTercero();}catch(e){}
      setTimeout(function(){try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){}},120);
      try{window.showToast&&window.showToast(ok?'Ambiente de Control limpiado y sincronizado con la base de datos.':'Se limpió localmente, pero no se pudo confirmar la sincronización con la base de datos.',ok?'success':'warning',4200);}catch(e){}
    }).catch(function(){try{window.showToast&&window.showToast('Se limpió localmente, pero ocurrió un error al sincronizar con la base de datos.','warning',4200);}catch(e){}});
  };

  // Cambio de terminología visible sin tocar IDs, endpoints ni estructura de datos.
  function renameDiligenciar(root){root=root||document;Array.from(root.querySelectorAll('button,option,label,span,div')).forEach(function(el){if(el.children&&el.children.length>0&&el.tagName!=='BUTTON'&&el.tagName!=='OPTION'&&el.tagName!=='LABEL')return;var tx=s(el.textContent);if(!tx)return;var n=tx.replace(/Rellenando/gi,'Completando').replace(/Rellenar/gi,'Completar').replace(/rellenadas/gi,'completadas').replace(/rellenados/gi,'completados').replace(/QUÉ QUIERES RELLENAR/gi,'QUÉ QUIERES COMPLETAR');if(n!==tx)el.textContent=n;});}
  var _termTimer=null;try{new MutationObserver(function(muts){clearTimeout(_termTimer);_termTimer=setTimeout(function(){muts.forEach(function(m){if(m.target&&m.target.nodeType===1)renameDiligenciar(m.target.closest?m.target.closest('body')||m.target:m.target);});},40);}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch(e){}
  setTimeout(function(){renameDiligenciar();try{if(isEvaluator())window.loadIGTercerosFull();}catch(e){}},700);
  document.addEventListener('click',function(){setTimeout(function(){renameDiligenciar();},80);},true);
})();
