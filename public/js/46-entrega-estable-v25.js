/* SGRT v25 — cierre funcional de entrega
 * 1) Rellenar respuestas: copia explícita y atómica desde Azure (tercero/contrato origen -> destino).
 * 2) Visor de artefactos: PDF real en pestaña; Word/PPTX/Excel en vista previa web + descarga.
 * 3) Refresca Análisis de Riesgos/Seguimiento después de cambios del Evaluador.
 */
(function(){
  'use strict';
  if(window.__SGRT46_LOADED__) return; window.__SGRT46_LOADED__=true;
  function s(v){return String(v==null?'':v).trim();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function canon(v){var x=s(v);if(/^\d+$/.test(x)){var n=parseInt(x,10);return isNaN(n)?x:String(n);}return x.toLowerCase();}
  function api(){return s(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');}
  function db(){return window.TERCEROS_DB||{};}
  function toast(m,t,ms){try{window.showToast&&window.showToast(m,t||'info',ms||3200);}catch(e){}}
  function notify(title,msg,meta){try{window.sendNotification&&window.sendNotification('cambio',title,msg,meta||{});}catch(e){}}
  function mapKey(map,c){if(!map||typeof map!=='object')return'';var cc=canon(c),ks=Object.keys(map);for(var i=0;i<ks.length;i++)if(canon(ks[i])===cc)return ks[i];return'';}
  function dims(t,c){var k=mapKey(t&&t.dimsPorContrato,c),a=k&&t.dimsPorContrato[k];if(!Array.isArray(a)){k=mapKey(t&&t.tipologiasPorContrato,c);a=k&&t.tipologiasPorContrato[k];}return Array.isArray(a)?a:[];}
  function dimKey(d){return s(d&&(d.key||d.id||d.codigo||d.nombre||d.tipologia));}
  function dimName(d){return s(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.name||d.key))||'Tipología';}
  function currentTargetNit(){var box=document.getElementById('sgrt-eval-copy-box');return s(box&&box.dataset&&box.dataset.sgrt42Nit)||s((document.getElementById('q-tercero')||document.getElementById('q-tercero-sel')||document.getElementById('ac-tercero-instruc')||{}).value);}
  async function refreshAll(){try{if(window.sgrtCargarDesdeServidor)await window.sgrtCargarDesdeServidor({forceServer:true,silentUi:true});}catch(e){}try{window.sgrt43HydrateRisks&&await window.sgrt43HydrateRisks();}catch(e2){}try{window.sgrt45RenderAnalysisBridge&&window.sgrt45RenderAnalysisBridge();window.sgrt45RenderFollowBridge&&window.sgrt45RenderFollowBridge();}catch(e3){}}

  // Mantener el selector utilizable incluso cuando una capa antigua no detecta coincidencias locales.
  function repairCopyPanel(){
    var box=document.getElementById('sgrt-eval-copy-box'),tip=document.getElementById('sgrt42-copy-tip'),btn=document.getElementById('sgrt42-copy-apply'),target=document.getElementById('sgrt42-copy-target-contract');
    if(!box||!tip||!btn||!target)return;
    var nit=currentTargetNit(),t=db()[nit]||{},c=s(target.value),ds=dims(t,c);
    var hasUseful=Array.from(tip.options||[]).some(function(o){return s(o.value);});
    if(!hasUseful&&ds.length){
      tip.innerHTML='<option value="__all__">Todas las tipologías compatibles ('+ds.length+')</option>'+ds.map(function(d){return '<option value="'+esc(dimKey(d))+'">'+esc(dimName(d))+'</option>';}).join('');
    }
    var src=document.getElementById('sgrt42-copy-third'),sc=document.getElementById('sgrt42-copy-contract');
    btn.disabled=!(src&&s(src.value)&&sc&&s(sc.value)&&target&&s(target.value));btn.style.opacity=btn.disabled?'.55':'1';
  }
  var mo=new MutationObserver(function(){setTimeout(repairCopyPanel,40);});
  try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
  document.addEventListener('change',function(e){if(e.target&&['sgrt42-copy-third','sgrt42-copy-contract','sgrt42-copy-target-contract','sgrt-eval-copy-check'].indexOf(e.target.id)>=0)setTimeout(repairCopyPanel,80);},true);

  // Captura antes de handlers antiguos para que la copia sea única y atómica.
  document.addEventListener('click',async function(ev){
    var b=ev.target&&ev.target.closest&&ev.target.closest('#sgrt42-copy-apply');if(!b)return;
    ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
    var sourceNit=s((document.getElementById('sgrt42-copy-third')||{}).value),sourceContract=s((document.getElementById('sgrt42-copy-contract')||{}).value),targetNit=currentTargetNit(),targetContract=s((document.getElementById('sgrt42-copy-target-contract')||{}).value),tip=s((document.getElementById('sgrt42-copy-tip')||{}).value)||'__all__';
    if(!sourceNit||!sourceContract||!targetNit||!targetContract){toast('Selecciona tercero, contrato origen y contrato destino.','warning');return;}
    var srcName=(db()[sourceNit]||{}).nombre||sourceNit,dstName=(db()[targetNit]||{}).nombre||targetNit;
    if(!confirm('¿Rellenar '+(tip==='__all__'?'las tipologías compatibles':'la tipología seleccionada')+' de '+dstName+' · contrato '+targetContract+' usando '+srcName+' · contrato '+sourceContract+'? Nada se copiará fuera de esta acción.'))return;
    var oldText=b.textContent;b.disabled=true;b.textContent='Rellenando…';
    try{
      var r=await fetch(api()+'/api/sgrt-state/copy-evaluator',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({sourceNit:sourceNit,sourceContract:sourceContract,targetNit:targetNit,targetContract:targetContract,tipologia:tip})});
      var j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));
      var n=Number(j.data&&j.data.copied||0);await refreshAll();
      try{var q=document.getElementById('q-tercero');if(q)q.value=targetNit;var qc=document.getElementById('q-contrato-sel');if(qc)qc.value=targetContract;var ac=document.getElementById('ac-contrato-sel');if(ac)ac.value=targetContract;if(window.qCambiarContrato)window.qCambiarContrato(targetContract);}catch(_e){}
      setTimeout(function(){try{window.sgrt45RenderAnalysisBridge&&window.sgrt45RenderAnalysisBridge();window.sgrt45RenderFollowBridge&&window.sgrt45RenderFollowBridge();}catch(e){}},250);
      if(n){toast('Listo: se copiaron '+n+' control(es) al contrato '+targetContract+'.','success',4200);notify('Respuestas rellenadas por decisión del usuario',srcName+' · contrato '+sourceContract+' → '+dstName+' · contrato '+targetContract+' · '+n+' control(es).',{'Módulo':'Ambiente de Control','Contrato origen':sourceContract,'Contrato destino':targetContract});}
      else toast('El contrato origen no tiene respuestas compatibles con las tipologías del destino.','warning',4500);
    }catch(e){console.error('[SGRT46 copy]',e);toast('No se pudo rellenar: '+e.message,'error',5200);}
    finally{b.disabled=false;b.textContent=oldText||'Rellenar respuestas';repairCopyPanel();}
  },true);

  function reportData(){try{return window.sgrt42CollectReport?window.sgrt42CollectReport():null;}catch(e){return null;}}
  function summaryHTML(data){
    data=data||reportData()||{};var rows=data.rows||[],risks=data.risks||[],thirds=data.thirds||[];
    var answered=rows.filter(function(r){var x=s(r.respuesta).toLowerCase();return x&&x!=='pendiente'&&x!=='sin respuesta';}).length,pct=rows.length?Math.round(answered/rows.length*100):0;
    return '<div class="v25-kpis"><div><b>'+thirds.length+'</b><span>Terceros</span></div><div><b>'+(data.contracts||0)+'</b><span>Contratos</span></div><div><b>'+pct+'%</b><span>Avance AC</span></div><div><b>'+risks.length+'</b><span>Riesgos</span></div></div>'+
      '<h2>Resumen del corte</h2><p>Vista previa construida con los registros actuales del SGRT. El archivo descargable conserva el formato corporativo correspondiente.</p>'+
      '<h2>Ambiente de Control</h2><div class="tbl"><table><thead><tr><th>Tercero</th><th>Contrato</th><th>Tipología</th><th>Control</th><th>Respuesta</th></tr></thead><tbody>'+rows.slice(0,30).map(function(r){return '<tr><td>'+esc(r.tercero)+'</td><td>'+esc(r.contrato)+'</td><td>'+esc(r.dimension)+'</td><td>'+esc(r.pregunta)+'</td><td>'+esc(r.respuesta)+'</td></tr>';}).join('')+'</tbody></table></div>'+
      '<h2>Análisis de Riesgos</h2><div class="tbl"><table><thead><tr><th>ID</th><th>Tercero</th><th>Contrato</th><th>Riesgo</th><th>Inherente</th><th>Residual</th></tr></thead><tbody>'+risks.slice(0,25).map(function(r){return '<tr><td>'+esc(r.id||r.riesgoId||'—')+'</td><td>'+esc(r.tercero||r.nit||'—')+'</td><td>'+esc(r.contrato||'—')+'</td><td>'+esc(r.desc||r.descripcion||'—')+'</td><td>'+esc(r.zonaInh||r.zonaInherente||'—')+'</td><td>'+esc(r.zonaRes||r.zonaResidual||'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  function previewDocHTML(name,meta){
    var body='';if(meta&&meta.kind==='xlsx'&&meta.workbook&&window.XLSX){var wb=meta.workbook;body=wb.SheetNames.slice(0,5).map(function(n){return '<h2>'+esc(n)+'</h2><div class="tbl">'+window.XLSX.utils.sheet_to_html(wb.Sheets[n],{id:'v25_'+n.replace(/\W/g,'_')})+'</div>';}).join('');}
    else body=summaryHTML(meta&&meta.data);
    return '<!doctype html><html><head><meta charset="utf-8"><title>'+esc(name)+'</title><style>body{font-family:Arial,sans-serif;margin:0;background:#eef2f7;color:#111827}.top{position:sticky;top:0;background:#0d2740;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px}.top a{background:#fff;color:#0d2740;text-decoration:none;font-weight:800;padding:8px 13px;border-radius:6px}.page{max-width:1180px;margin:18px auto;background:#fff;padding:28px 34px;box-shadow:0 4px 18px rgba(0,0,0,.08);min-height:75vh}h1{font-size:20px}h2{font-size:15px;margin-top:24px;border-bottom:1px solid #dbe3ea;padding-bottom:6px}.v25-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.v25-kpis div{border:1px solid #dbe3ea;border-radius:8px;padding:12px}.v25-kpis b{display:block;font-size:24px;color:#173b5f}.v25-kpis span{font-size:11px;color:#64748b}.tbl{overflow:auto}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #dbe3ea;padding:7px;text-align:left;vertical-align:top}th{background:#f1f5f9} @media(max-width:700px){.page{margin:0;padding:16px}.v25-kpis{grid-template-columns:1fr 1fr}}</style></head><body><div class="top"><div><b>Vista previa</b><div style="font-size:11px;opacity:.8">'+esc(name)+'</div></div><a href="__DOWNLOAD_URL__" download="'+esc(name)+'">Descargar archivo original</a></div><div class="page"><h1>'+esc(meta&&meta.title||name)+'</h1>'+body+'</div></body></html>';
  }
  window.sgrt25OpenArtifactPreview=function(blob,name,meta){
    meta=meta||{};var actual=URL.createObjectURL(blob);if(meta.kind==='pdf'||blob.type==='application/pdf'){var a=document.createElement('a');a.href=actual;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(actual);},30*60*1000);return actual;}
    var html=previewDocHTML(name,meta).replace('__DOWNLOAD_URL__',actual),hb=new Blob([html],{type:'text/html;charset=utf-8'}),hu=URL.createObjectURL(hb),a2=document.createElement('a');a2.href=hu;a2.target='_blank';a2.rel='noopener';document.body.appendChild(a2);a2.click();a2.remove();setTimeout(function(){URL.revokeObjectURL(hu);URL.revokeObjectURL(actual);},30*60*1000);return hu;
  };
  window.sgrt25PreviewBlobDocument=window.sgrt25OpenArtifactPreview;

  // Estado de IA coherente con la prioridad real del backend.
  async function refreshAIStatus(){try{var r=await fetch(api()+'/api/ai/status',{cache:'no-store'}),j=await r.json();var badge=document.getElementById('sgrt42-ai-status')||document.querySelector('[data-sgrt-ai-status]');if(!badge)return;if(!j.configured){badge.textContent='IA no configurada';return;}var both=j.providers&&j.providers.openai&&j.providers.gemini;if(both&&String(j.providerMode||'auto')==='auto')badge.textContent='OpenAI principal · Gemini respaldo';else badge.textContent=(j.provider==='openai'?'OpenAI':'Gemini')+' conectado · '+(j.model||'');}catch(e){}}
  setTimeout(refreshAIStatus,900);setInterval(refreshAIStatus,60000);

  // Refresca puentes de riesgo al entrar a la matriz/seguimiento y después de limpiar.
  var oldNav=window.navTo;if(typeof oldNav==='function'&&!oldNav._sgrt46){var nv=function(el,pg){var r=oldNav.apply(this,arguments);if(pg==='pg-matriz'||pg==='pg-seguimiento')setTimeout(async function(){await refreshAll();try{if(pg==='pg-matriz'&&window.renderMatriz)window.renderMatriz();if(pg==='pg-seguimiento'&&window.renderSeguimiento)window.renderSeguimiento();}catch(e){}},120);return r;};nv._sgrt46=true;window.navTo=nv;}
  setTimeout(function(){repairCopyPanel();refreshAIStatus();},1200);
})();
