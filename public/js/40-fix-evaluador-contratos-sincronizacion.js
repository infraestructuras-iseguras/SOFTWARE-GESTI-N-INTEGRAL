/*
 * SGRT — Ajuste 40 v2 (2026-09-17)
 * SOLO ROL EVALUADOR.
 *
 * Correcciones:
 * 1) Contexto estricto Tercero + Contrato. Los selectores ocultos ya no mandan
 *    sobre el selector que el usuario está usando.
 * 2) Tipologías estrictamente por contrato. Nunca se usa t.dims global como
 *    fuente contractual.
 * 3) Progreso/respuestas estrictamente por contrato, incluyendo migración de
 *    respuestas antiguas (_respuestas) al contrato al que pertenecían.
 * 4) Sincronización multiusuario por delta (NIT + contrato + control).
 * 5) Registro de Terceros del Evaluador muestra todos los terceros cargados del
 *    servidor, sin perderlos por el filtro histórico de año.
 * 6) Copia opcional de respuestas entre contratos compatibles.
 */
(function(){
  'use strict';

  var POLL_MS=5000;
  var REGISTRY_POLL_MS=20000;
  var DELTA_DEBOUNCE_MS=450;
  var pendingDelta={};
  var pendingTimer={};
  var pollTimer=null;
  var registryTimer=null;
  var remoteBusy=false;
  var registryBusy=false;
  var lastRemoteVersion={};
  var lastLocalEditAt=0;
  var evalCtx={nit:'',contract:''};
  var activeResponseCtx={};

  var original={
    qPoblarContratos:window.qPoblarContratos,
    acPoblarContratos:window.acPoblarContratos,
    qCambiarContrato:window.qCambiarContrato,
    acCambiarContrato:window.acCambiarContrato,
    acCambiarTerceroInstruc:window.acCambiarTerceroInstruc,
    poblarSelectorACTipologia:window.poblarSelectorACTipologia,
    cargarCuestionarioTercero:window.cargarCuestionarioTercero,
    acActualizarFiltroDesc:window.acActualizarFiltroDesc,
    acIrADiligenciar:window.acIrADiligenciar,
    acIrATipologia:window.acIrATipologia,
    acMostrarEstadoTipologias:window.acMostrarEstadoTipologias,
    onChangeAtribCuest:window.onChangeAtribCuest,
    onChangeObsCuest:window.onChangeObsCuest,
    upsertCompleto:window._sgrtUpsertEstadoCompleto,
    getContractDims:window._sgrtGetContractDims,
    clsRender:window.clsRender,
    serverLoad:window.sgrtCargarDesdeServidor
  };

  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function esc(v){return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function responses(){if(!window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS={};return window.CUEST_RESPUESTAS;}
  function isEvaluator(){var r=low((window.currentUser||{}).rol);return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0;}
  function apiBase(){return norm(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function dimKey(d){return norm(d&&(d.key||d.clave||d.codigo||d.tipologia_key||d.tipologia)).toLowerCase();}
  function tipName(d){
    try{var x=window._nombreTipologia&&window._nombreTipologia(d);if(norm(x))return norm(x);}catch(e){}
    return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.label||d.key))||'Tipología';
  }
  function answered(r){var a=norm(r&&r.a1);return a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial';}
  function answerWeight(obj){
    var n=0;Object.keys(obj||{}).forEach(function(k){if(k.indexOf('__')===0)return;var tip=obj[k];if(!tip||typeof tip!=='object')return;Object.keys(tip).forEach(function(q){if(answered(tip[q]))n++;});});return n;
  }
  function mergeAnswers(target,source){
    target=target&&typeof target==='object'&&!Array.isArray(target)?target:{};
    if(!source||typeof source!=='object'||Array.isArray(source))return target;
    Object.keys(source).forEach(function(k){
      if(k.indexOf('__')===0){target[k]=clone(source[k]);return;}
      var src=source[k];if(!src||typeof src!=='object'||Array.isArray(src)){target[k]=clone(src);return;}
      if(!target[k]||typeof target[k]!=='object'||Array.isArray(target[k]))target[k]={};
      Object.keys(src).forEach(function(q){target[k][q]=clone(src[q]);});
    });
    return target;
  }
  function approved(t,n){
    n=norm(n);if(!t||!n)return false;
    if(t.aprobadoPorContrato&&t.aprobadoPorContrato[n])return true;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===n;});
    return !!(c&&(c.aprobado===true||norm(c.estado_aprobacion).toUpperCase()==='APROBADO'||low(c.estado)==='aprobado'));
  }
  function evaluatorContracts(t){
    var seen={};return (t&&t.contratos||[]).filter(function(c){var n=contractNum(c);if(!n||seen[n])return false;seen[n]=1;return approved(t,n)||strictDims(t,n).length>0;});
  }

  // Fuente contractual canónica: nunca t.dims global.
  function strictDims(t,contract){
    contract=norm(contract);if(!t||!contract)return [];
    var arr=null;
    if(t.dimsPorContrato&&Object.prototype.hasOwnProperty.call(t.dimsPorContrato,contract))arr=t.dimsPorContrato[contract];
    if(!Array.isArray(arr)&&t.tipologiasPorContrato&&Object.prototype.hasOwnProperty.call(t.tipologiasPorContrato,contract))arr=t.tipologiasPorContrato[contract];
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===contract;});
    if(!Array.isArray(arr)&&c){
      if(Array.isArray(c.dims))arr=c.dims;
      else if(Array.isArray(c.tipologias))arr=c.tipologias;
      else if(Array.isArray(c.clasificacion))arr=c.clasificacion;
    }
    if(!Array.isArray(arr))arr=[];
    var seen={};return arr.filter(Boolean).map(function(d){return clone(d);}).filter(function(d){var k=dimKey(d)||low(tipName(d));if(!k||seen[k])return false;seen[k]=1;return true;});
  }
  window._sgrtEvaluatorStrictDims=strictDims;

  // Evita que módulos antiguos vuelvan a copiar t.dims del contrato anterior.
  if(typeof original.getContractDims==='function'){
    window._sgrtGetContractDims=function(t,c){
      if(isEvaluator()&&norm(c))return strictDims(t,c);
      return original.getContractDims.apply(this,arguments);
    };
  }

  function acNit(){return norm((document.getElementById('ac-tercero-instruc')||{}).value);}
  function qNit(){return norm((document.getElementById('q-tercero')||{}).value);}
  function panelIsInstructions(){var p=document.getElementById('cq-panel-instruc');return !!(p&&p.style.display!=='none');}
  function currentNit(source){
    if(source==='ac')return acNit()||evalCtx.nit||qNit()||norm(window.nitActual);
    if(source==='q')return qNit()||evalCtx.nit||acNit()||norm(window.nitActual);
    return panelIsInstructions()?(acNit()||evalCtx.nit||qNit()):(qNit()||evalCtx.nit||acNit());
  }
  function contractFromSelect(id,t){var v=norm((document.getElementById(id)||{}).value);return v&&(approved(t,v)||strictDims(t,v).length)?v:'';}
  function currentContract(source,nit){
    nit=norm(nit)||currentNit(source);var t=db()[nit]||{};
    var v='';
    if(source==='ac')v=contractFromSelect('ac-contrato-sel',t);
    else if(source==='q')v=contractFromSelect('q-contrato-sel',t);
    else v=panelIsInstructions()?contractFromSelect('ac-contrato-sel',t):contractFromSelect('q-contrato-sel',t);
    if(v)return v;
    if(evalCtx.nit===nit&&evalCtx.contract&&(approved(t,evalCtx.contract)||strictDims(t,evalCtx.contract).length))return evalCtx.contract;
    var tc=norm(t.contratoEval);if(tc&&(approved(t,tc)||strictDims(t,tc).length))return tc;
    var cs=evaluatorContracts(t);return cs.length?contractNum(cs[0]):'';
  }

  function migrateLegacyResponses(t){
    if(!t||typeof t!=='object')return false;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    var changed=false;
    function absorb(c,src){c=norm(c);if(!c||!src||typeof src!=='object'||answerWeight(src)===0)return;if(!t.respuestasACPorContrato[c])t.respuestasACPorContrato[c]={};var before=answerWeight(t.respuestasACPorContrato[c]);mergeAnswers(t.respuestasACPorContrato[c],src);if(answerWeight(t.respuestasACPorContrato[c])!==before)changed=true;}
    Object.keys(t.acPorContrato||{}).forEach(function(c){absorb(c,t.acPorContrato[c]&&t.acPorContrato[c].respuestas);});
    Object.keys(t.borradoresACPorContrato||{}).forEach(function(c){absorb(c,t.borradoresACPorContrato[c]&&t.borradoresACPorContrato[c].respuestas);});
    Object.keys(t._respuestasPorContrato||{}).forEach(function(c){absorb(c,t._respuestasPorContrato[c]);});
    Object.keys(t.respuestasPorContrato||{}).forEach(function(c){absorb(c,t.respuestasPorContrato[c]);});
    var legacyContract=norm(t._respuestasContrato||t.contratoRespuestas||t.contratoEval);
    if(legacyContract&&t._respuestas)absorb(legacyContract,t._respuestas);
    return changed;
  }

  function exactResponses(t,contract){
    contract=norm(contract);if(!t||!contract)return {};
    migrateLegacyResponses(t);
    var out={};
    // Secundarios primero; el bloque contractual canónico gana al final.
    var sources=[
      t._respuestasPorContrato&&t._respuestasPorContrato[contract],
      t.respuestasPorContrato&&t.respuestasPorContrato[contract],
      t.borradoresACPorContrato&&t.borradoresACPorContrato[contract]&&t.borradoresACPorContrato[contract].respuestas,
      t.acPorContrato&&t.acPorContrato[contract]&&t.acPorContrato[contract].respuestas,
      t.respuestasACPorContrato&&t.respuestasACPorContrato[contract]
    ];
    sources.forEach(function(x){mergeAnswers(out,x);});
    return clone(out);
  }

  function saveLocal(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(responses()));}catch(e){}
    try{if(typeof window._lsSave==='function')window._lsSave();}catch(e){}
  }
  function setContext(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract)return false;
    evalCtx={nit:nit,contract:contract};t.contratoEval=contract;t.modoEval='contrato';t.dims=clone(strictDims(t,contract));return true;
  }
  function stashActive(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract||activeResponseCtx[nit]!==contract)return;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    t.respuestasACPorContrato[contract]=clone(responses()[nit]||{});t.savedAt=new Date().toISOString();saveLocal();
  }
  function activateExact(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract)return;
    setContext(nit,contract);if(!t.respuestasACPorContrato)t.respuestasACPorContrato={};
    var rr=exactResponses(t,contract);t.respuestasACPorContrato[contract]=clone(rr);responses()[nit]=clone(rr);activeResponseCtx[nit]=contract;
    try{var sh=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');sh[nit]=clone(rr);localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(sh));}catch(e){}
    try{var b=t.borradoresACPorContrato&&t.borradoresACPorContrato[contract];if(b)localStorage.setItem('cuest_borrador_'+nit,JSON.stringify(b));else localStorage.removeItem('cuest_borrador_'+nit);}catch(e2){}
  }

  function populateContractSelect(nit,kind,preferred){
    if(!isEvaluator()){
      var old=kind==='q'?original.qPoblarContratos:original.acPoblarContratos;return typeof old==='function'?old.apply(this,arguments):undefined;
    }
    nit=norm(nit);var t=db()[nit],sel=document.getElementById(kind==='q'?'q-contrato-sel':'ac-contrato-sel'),wrap=document.getElementById(kind==='q'?'q-contrato-wrap':'ac-contrato-wrap');
    if(!sel||!wrap)return;if(!t){sel.innerHTML='<option value="">Sin contratos</option>';wrap.style.display='none';return;}
    var cs=evaluatorContracts(t);if(!cs.length){sel.innerHTML='<option value="">Sin contratos disponibles</option>';wrap.style.display='none';return;}
    var valid=function(v){return cs.some(function(c){return contractNum(c)===norm(v);});};
    var wanted=valid(preferred)?norm(preferred):(valid(sel.value)?norm(sel.value):(evalCtx.nit===nit&&valid(evalCtx.contract)?evalCtx.contract:(valid(t.contratoEval)?norm(t.contratoEval):contractNum(cs[0]))));
    sel.innerHTML=cs.map(function(c){var n=contractNum(c);return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');sel.value=wanted;
    wrap.style.display=kind==='q'?'flex':'block';if(kind==='q'){try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){}}
    return wanted;
  }
  window.qPoblarContratos=function(nit){return populateContractSelect(norm(nit),'q');};
  window.acPoblarContratos=function(nit){return populateContractSelect(norm(nit),'ac');};

  function syncSelectors(nit,contract){
    populateContractSelect(nit,'ac',contract);populateContractSelect(nit,'q',contract);
    var a=document.getElementById('ac-contrato-sel'),q=document.getElementById('q-contrato-sel');if(a)a.value=contract;if(q)q.value=contract;
  }

  function activeControls(nit,key,contract){
    try{if(typeof window._ctrlsCuest==='function'){var a=window._ctrlsCuest(nit,key,contract);if(Array.isArray(a))return a.filter(function(q){return q&&q.activo!==false;});}}catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]).filter(function(q){return q&&q.activo!==false;});
  }

  function populateStrictTipologies(){
    if(!isEvaluator())return typeof original.poblarSelectorACTipologia==='function'?original.poblarSelectorACTipologia.apply(this,arguments):undefined;
    var sel=document.getElementById('ac-tip-filtro');if(!sel)return;
    var nit=currentNit('ac'),t=db()[nit],contract=currentContract('ac',nit),previousKey=norm((sel.options[sel.selectedIndex]||{}).getAttribute&&sel.options[sel.selectedIndex].getAttribute('data-key'));
    sel.innerHTML='<option value="">-- Seleccionar tipología --</option>';var desc=document.getElementById('ac-consultor-desc');
    if(!nit||!t||!contract){if(desc)desc.textContent='Selecciona un tercero y un contrato.';return;}
    setContext(nit,contract);var seen={};strictDims(t,contract).forEach(function(d){var key=dimKey(d),name=tipName(d),dedupe=key||low(name);if(!dedupe||seen[dedupe])return;seen[dedupe]=1;var o=document.createElement('option');o.value=name;o.textContent=name;o.setAttribute('data-key',key);sel.appendChild(o);});
    if(previousKey){for(var i=1;i<sel.options.length;i++){if(norm(sel.options[i].getAttribute('data-key'))===previousKey){sel.selectedIndex=i;break;}}}
    if(desc){var n=Math.max(0,sel.options.length-1);desc.innerHTML=n?'<b>'+n+' tipología(s)</b> asignada(s) al contrato <b>'+esc(contract)+'</b>. Selecciona una para ver sus preguntas.':'El contrato <b>'+esc(contract)+'</b> no tiene tipologías asignadas.';}
    var aw=document.getElementById('ac-contrato-wrap');if(aw)aw.style.display='block';removeEvaluatorIcons();
  }
  window.poblarSelectorACTipologia=populateStrictTipologies;

  function renderStrictProgress(nit){
    if(!isEvaluator())return typeof original.acMostrarEstadoTipologias==='function'?original.acMostrarEstadoTipologias.apply(this,arguments):undefined;
    var wrap=document.getElementById('ac-tips-estado');if(!wrap)return;nit=norm(nit)||currentNit('ac');var t=db()[nit],contract=currentContract('ac',nit);
    if(!t||!contract){wrap.style.display='none';wrap.innerHTML='';return;}
    var dims=strictDims(t,contract),rr=exactResponses(t,contract);if(!dims.length){wrap.style.display='none';wrap.innerHTML='';return;}
    var html='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:7px;"><div style="font-size:11.5px;font-weight:800;color:#374151;">Progreso — Contrato '+esc(contract)+'</div><div style="font-size:10px;color:#64748b;">Selecciona una tipología para revisar sus preguntas</div></div><div style="display:flex;flex-direction:column;gap:6px;">';
    dims.forEach(function(d){
      var key=dimKey(d),name=tipName(d),qs=activeControls(nit,key,contract),done=qs.filter(function(q){return answered(rr&&rr[key]&&rr[key][q.n]);}).length,total=qs.length,pct=total?Math.round(done/total*100):0,color=pct===100?'#16A34A':pct>0?'#EA580C':'#64748B',bg=pct===100?'#F0FDF4':pct>0?'#FFF7ED':'#F8FAFC';
      html+='<div role="button" tabindex="0" data-tip-key="'+esc(key)+'" style="display:grid;grid-template-columns:minmax(180px,1fr) 90px 72px;gap:9px;align-items:center;padding:9px 11px;background:'+bg+';border:1px solid '+(pct===100?'#BBF7D0':pct>0?'#FED7AA':'#E2E8F0')+';border-radius:7px;cursor:pointer;"><div style="min-width:0;"><div style="font-size:12px;font-weight:800;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div><div style="height:6px;background:#e5e7eb;border-radius:4px;margin-top:5px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;"></div></div></div><div style="text-align:right;"><div style="font-size:12px;font-weight:800;color:'+color+';">'+done+'/'+total+'</div><div style="font-size:9.5px;color:#64748b;">'+(pct===100?'Completo':pct>0?'En progreso':'Sin iniciar')+'</div></div><div style="text-align:center;padding:5px 6px;border-radius:12px;background:white;border:1px solid '+color+';font-size:11px;font-weight:900;color:'+color+';">'+pct+'%</div></div>';
    });
    wrap.innerHTML=html+'</div>';wrap.style.display='block';
    Array.from(wrap.querySelectorAll('[data-tip-key]')).forEach(function(card){card.onclick=function(){var key=card.getAttribute('data-tip-key'),sel=document.getElementById('ac-tip-filtro');if(sel){for(var i=1;i<sel.options.length;i++){if(norm(sel.options[i].getAttribute('data-key'))===key){sel.selectedIndex=i;break;}}}window.acActualizarFiltroDesc&&window.acActualizarFiltroDesc();};});
  }
  window.acMostrarEstadoTipologias=renderStrictProgress;

  window.acActualizarFiltroDesc=function(){
    if(!isEvaluator())return typeof original.acActualizarFiltroDesc==='function'?original.acActualizarFiltroDesc.apply(this,arguments):undefined;
    var nit=currentNit('ac'),contract=currentContract('ac',nit),sel=document.getElementById('ac-tip-filtro'),desc=document.getElementById('ac-consultor-desc');if(!sel||!desc)return;
    var op=sel.options[sel.selectedIndex]||{},key=norm(op.getAttribute&&op.getAttribute('data-key'));
    if(!key){desc.innerHTML='Selecciona una tipología asignada al contrato <b>'+esc(contract)+'</b>.';return;}
    var n=activeControls(nit,key,contract).length;desc.innerHTML='<b>'+esc(sel.value)+'</b> · '+n+' pregunta(s) activa(s) · Contrato <b>'+esc(contract)+'</b>.';
  };

  function switchEvaluatorContract(contract,source){
    contract=norm(contract);source=source==='ac'?'ac':'q';var nit=currentNit(source),t=db()[nit];if(!nit||!t||!contract||(!approved(t,contract)&&!strictDims(t,contract).length))return;
    var previous=evalCtx.nit===nit?evalCtx.contract:'';if(previous&&previous!==contract)stashActive(nit,previous);
    setContext(nit,contract);syncSelectors(nit,contract);
    if(source==='q')activateExact(nit,contract);
    saveLocal();
    if(source==='ac'){
      populateStrictTipologies();renderStrictProgress(nit);renderCopyBox();removeEvaluatorIcons();pullRemoteThird(nit,false);
    }else{
      try{if(typeof original.cargarCuestionarioTercero==='function')original.cargarCuestionarioTercero();}catch(e){}
      setTimeout(function(){renderCopyBox();removeEvaluatorIcons();},60);pullRemoteThird(nit,true);
    }
  }
  window.qCambiarContrato=function(v){if(!isEvaluator())return typeof original.qCambiarContrato==='function'?original.qCambiarContrato.apply(this,arguments):undefined;return switchEvaluatorContract(v,'q');};
  window.acCambiarContrato=function(v){if(!isEvaluator())return typeof original.acCambiarContrato==='function'?original.acCambiarContrato.apply(this,arguments):undefined;return switchEvaluatorContract(v,'ac');};

  if(typeof original.acCambiarTerceroInstruc==='function'){
    window.acCambiarTerceroInstruc=function(){
      if(!isEvaluator())return original.acCambiarTerceroInstruc.apply(this,arguments);
      var r=original.acCambiarTerceroInstruc.apply(this,arguments),nit=acNit();
      if(!nit)return r;var q=document.getElementById('q-tercero');if(q)q.value=nit;
      var c=populateContractSelect(nit,'ac');if(c){setContext(nit,c);populateContractSelect(nit,'q',c);populateStrictTipologies();renderStrictProgress(nit);pullRemoteThird(nit,true);}return r;
    };
  }

  if(typeof original.cargarCuestionarioTercero==='function'){
    window.cargarCuestionarioTercero=function(){
      if(!isEvaluator())return original.cargarCuestionarioTercero.apply(this,arguments);
      var nit=currentNit('q');if(!nit)return original.cargarCuestionarioTercero.apply(this,arguments);
      var c=populateContractSelect(nit,'q',currentContract('q',nit));if(c){setContext(nit,c);activateExact(nit,c);populateContractSelect(nit,'ac',c);}
      var r=original.cargarCuestionarioTercero.apply(this,arguments);setTimeout(function(){renderCopyBox();removeEvaluatorIcons();},60);return r;
    };
  }

  function openTipologyInQuestionnaire(key,name){
    var nit=currentNit('ac'),contract=currentContract('ac',nit),t=db()[nit];if(!nit||!contract||!t)return;
    setContext(nit,contract);var q=document.getElementById('q-tercero');if(q)q.value=nit;syncSelectors(nit,contract);activateExact(nit,contract);
    try{window.switchCuestTabExtended&&window.switchCuestTabExtended('cuest');}catch(e){try{switchCuestTabExtended('cuest');}catch(e2){}}
    try{if(typeof original.cargarCuestionarioTercero==='function')original.cargarCuestionarioTercero();}catch(e3){}
    setTimeout(function(){try{window._filtrarSeccionesPorTip&&window._filtrarSeccionesPorTip(name,key);}catch(e){}renderCopyBox();removeEvaluatorIcons();},220);
  }
  window.acIrADiligenciar=function(){
    if(!isEvaluator())return typeof original.acIrADiligenciar==='function'?original.acIrADiligenciar.apply(this,arguments):undefined;
    var sel=document.getElementById('ac-tip-filtro'),op=sel&&sel.options[sel.selectedIndex],key=norm(op&&op.getAttribute&&op.getAttribute('data-key')),name=norm(sel&&sel.value);if(!key||!name){try{window.showToast&&window.showToast('Selecciona una tipología primero','error',2200);}catch(e){}return;}openTipologyInQuestionnaire(key,name);
  };
  window.acIrATipologia=function(key,name){
    if(!isEvaluator())return typeof original.acIrATipologia==='function'?original.acIrATipologia.apply(this,arguments):undefined;
    var sel=document.getElementById('ac-tip-filtro');if(sel){for(var i=1;i<sel.options.length;i++){if(norm(sel.options[i].getAttribute('data-key'))===norm(key)){sel.selectedIndex=i;name=sel.options[i].value;break;}}}openTipologyInQuestionnaire(norm(key),norm(name));
  };

  function activeControlNumbers(nit,key,contract){return activeControls(nit,key,contract).map(function(q){return String(q.n);});}
  function copyResponses(sourceContract,targetContract){
    var nit=currentNit('q')||currentNit('ac'),t=db()[nit];if(!t)return 0;var src=exactResponses(t,sourceContract),dims=strictDims(t,targetContract),out={},copied=0;
    dims.forEach(function(d){var key=dimKey(d);if(!key||!src[key])return;var allowed=activeControlNumbers(nit,key,targetContract);out[key]={};allowed.forEach(function(n){if(src[key]&&src[key][n]){out[key][n]=clone(src[key][n]);copied++;}});if(!Object.keys(out[key]).length)delete out[key];});
    if(!t.respuestasACPorContrato)t.respuestasACPorContrato={};t.respuestasACPorContrato[targetContract]=clone(out);responses()[nit]=clone(out);activeResponseCtx[nit]=targetContract;setContext(nit,targetContract);saveLocal();return copied;
  }
  function sourceContracts(nit,target){var t=db()[nit];if(!t)return[];return evaluatorContracts(t).map(contractNum).filter(function(c){return c!==target&&answerWeight(exactResponses(t,c))>0;});}
  function renderCopyBox(){
    var old=document.getElementById('sgrt-eval-copy-box');if(old)old.remove();if(!isEvaluator())return;var nit=currentNit('q'),target=currentContract('q',nit);if(!nit||!target)return;var sources=sourceContracts(nit,target);if(!sources.length)return;
    var anchor=document.getElementById('q-tipologias-panel')||document.getElementById('q-secciones-wrap');if(!anchor||!anchor.parentNode)return;var box=document.createElement('div');box.id='sgrt-eval-copy-box';box.style.cssText='background:white;border:1px solid #dbe3ea;border-radius:8px;padding:11px 14px;margin-bottom:12px;font-size:11.5px;color:#334155;';
    box.innerHTML='<label style="display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer;"><input id="sgrt-eval-copy-check" type="checkbox"> Usar respuestas ya diligenciadas de otro contrato</label><div id="sgrt-eval-copy-options" style="display:none;margin-top:9px;gap:8px;align-items:center;flex-wrap:wrap;"><select id="sgrt-eval-copy-source" style="min-width:180px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;">'+sources.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('')+'</select><button type="button" id="sgrt-eval-copy-apply" style="padding:7px 12px;border:1px solid #1e6bb8;background:#1e6bb8;color:white;border-radius:6px;font-weight:700;cursor:pointer;">Rellenar respuestas</button><span style="color:#64748b;">Solo copia preguntas coincidentes del contrato actual.</span></div>';
    anchor.parentNode.insertBefore(box,anchor);var check=document.getElementById('sgrt-eval-copy-check'),opts=document.getElementById('sgrt-eval-copy-options'),btn=document.getElementById('sgrt-eval-copy-apply');check.onchange=function(){opts.style.display=check.checked?'flex':'none';};
    btn.onclick=async function(){var source=norm((document.getElementById('sgrt-eval-copy-source')||{}).value);if(!source)return;var existing=answerWeight(exactResponses(db()[nit],target)),msg='¿Rellenar el contrato '+target+' con las respuestas del contrato '+source+'?';if(existing)msg+=' Las respuestas existentes del contrato '+target+' se reemplazarán en las preguntas coincidentes.';if(!window.confirm(msg))return;var n=copyResponses(source,target);lastLocalEditAt=Date.now();await syncEvaluatorContract(nit,target,{replaceResponses:true,respuestas:clone((db()[nit].respuestasACPorContrato||{})[target]||{})});try{window.cargarCuestionarioTercero&&window.cargarCuestionarioTercero();}catch(e){}try{window.showToast&&window.showToast(n?'Se copiaron '+n+' respuesta(s) al contrato '+target+'.':'No había preguntas coincidentes para copiar.',n?'success':'warning',3200);}catch(e2){}};
  }

  function patchUrl(nit,contract){return apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit)+'/evaluador/'+encodeURIComponent(contract);}
  async function syncEvaluatorContract(nit,contract,extra){
    nit=norm(nit);contract=norm(contract);if(!nit||!contract)return false;var t=db()[nit]||{},baseBody={savedAt:new Date().toISOString(),actor:{login:norm((window.currentUser||{}).login||(window.currentUser||{}).user),name:norm((window.currentUser||{}).name||(window.currentUser||{}).nombre),rol:norm((window.currentUser||{}).rol)}};
    if(!(extra&&extra.respuestaDelta)){baseBody.respuestas=clone(t.respuestasACPorContrato&&t.respuestasACPorContrato[contract]||{});baseBody.borrador=clone(t.borradoresACPorContrato&&t.borradoresACPorContrato[contract]||null);baseBody.ac=clone(t.acPorContrato&&t.acPorContrato[contract]||null);baseBody.promContrato=clone(t.promPorContrato&&t.promPorContrato[contract]||null);}
    var body=Object.assign(baseBody,extra||{});try{var r=await fetch(patchUrl(nit,contract),{method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)}),x=await r.json().catch(function(){return{};});if(!r.ok||!x.ok)throw new Error(x.error||('HTTP '+r.status));var remote=x.data&&x.data.estado_sgrt;if(remote)mergeRemoteState(nit,remote,false);var live=db()[nit];if(live&&!pendingTimer[nit+'|'+contract]&&!pendingDelta[nit+'|'+contract]){live.sincronizado=true;live._changed=false;}saveLocal();return true;}catch(e){console.warn('[SGRT40v2] Sincronización pendiente:',e.message);return false;}
  }
  window._sgrtSyncEvaluatorContract=syncEvaluatorContract;

  function mergeRemoteState(nit,remote,rerender){
    nit=norm(nit);if(!remote||typeof remote!=='object')return false;remote=clone(remote);migrateLegacyResponses(remote);var t=db()[nit]||{};
    ['nombre','entidad','domicilio','servicio','servicio_contratado','contratos','dimsPorContrato','tipologiasPorContrato','aprobadoPorContrato','_persHiddenControls','_tipologiasDBCustom','_configPreguntas','promPorContrato'].forEach(function(k){if(remote[k]!==undefined)t[k]=clone(remote[k]);});
    migrateLegacyResponses(t);
    ['respuestasACPorContrato','borradoresACPorContrato','acPorContrato'].forEach(function(k){if(!remote[k]||typeof remote[k]!=='object')return;if(!t[k]||typeof t[k]!=='object')t[k]={};Object.keys(remote[k]).forEach(function(c){var id=nit+'|'+c,hasPending=!!pendingTimer[id]||!!pendingDelta[id];if(k==='respuestasACPorContrato'&&hasPending){var merged=clone(remote[k][c]||{});mergeAnswers(merged,t[k][c]||{});if(pendingDelta[id])mergeAnswers(merged,pendingDelta[id]);t[k][c]=merged;}else t[k][c]=clone(remote[k][c]);});});
    t.nit=t.nit||nit;db()[nit]=t;
    try{if(remote._persHiddenControls)window._persHiddenControls=Object.assign(window._persHiddenControls||{},clone(remote._persHiddenControls));if(remote._configPreguntas){window.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM||{};window.CUEST_CTRL_CUSTOM[nit]=clone(remote._configPreguntas);}}catch(e){}
    var c=currentContract(panelIsInstructions()?'ac':'q',nit),id=nit+'|'+c,blocked=!!pendingTimer[id]||!!pendingDelta[id];if(c&&!blocked&&activeResponseCtx[nit]===c)activateExact(nit,c);saveLocal();
    if(rerender&&!blocked&&Date.now()-lastLocalEditAt>700){if(panelIsInstructions()){populateContractSelect(nit,'ac',c);populateStrictTipologies();renderStrictProgress(nit);}else{populateContractSelect(nit,'q',c);try{window.cargarCuestionarioTercero&&window.cargarCuestionarioTercero();}catch(e2){}}renderCopyBox();removeEvaluatorIcons();}
    return true;
  }

  async function pullRemoteThird(nit,rerender){
    nit=norm(nit);if(!isEvaluator()||!nit||remoteBusy)return false;remoteBusy=true;try{var r=await fetch(apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit),{headers:{'Accept':'application/json'},cache:'no-store'});if(!r.ok)return false;var x=await r.json().catch(function(){return{}}),data=x&&x.data||{},remote=(data.estado_sgrt&&typeof data.estado_sgrt==='object')?data.estado_sgrt:data;if(!remote||typeof remote!=='object')return false;var version=norm(data.updatedAt||remote.savedAt||JSON.stringify(remote.respuestasACPorContrato||{}).length);if(lastRemoteVersion[nit]!==version){lastRemoteVersion[nit]=version;mergeRemoteState(nit,remote,rerender!==false);}return true;}catch(e){return false;}finally{remoteBusy=false;}
  }

  function enqueueDelta(nit,contract,key,ctrlN){
    nit=norm(nit);contract=norm(contract);key=norm(key);ctrlN=String(ctrlN);if(!nit||!contract||!key||!ctrlN)return;var id=nit+'|'+contract;if(!pendingDelta[id])pendingDelta[id]={};if(!pendingDelta[id][key])pendingDelta[id][key]={};pendingDelta[id][key][ctrlN]=clone(responses()[nit]&&responses()[nit][key]&&responses()[nit][key][ctrlN]||{});lastLocalEditAt=Date.now();clearTimeout(pendingTimer[id]);pendingTimer[id]=setTimeout(async function(){var delta=pendingDelta[id]||{};delete pendingDelta[id];delete pendingTimer[id];await syncEvaluatorContract(nit,contract,{respuestaDelta:delta});},DELTA_DEBOUNCE_MS);
  }
  async function flushPending(nit,contract){var id=norm(nit)+'|'+norm(contract);if(!pendingDelta[id])return true;clearTimeout(pendingTimer[id]);delete pendingTimer[id];var delta=pendingDelta[id];delete pendingDelta[id];return syncEvaluatorContract(nit,contract,{respuestaDelta:delta});}

  if(typeof original.onChangeAtribCuest==='function')window.onChangeAtribCuest=function(nit,key,ctrlN,ai){var r=original.onChangeAtribCuest.apply(this,arguments);if(isEvaluator()){var c=currentContract('q',norm(nit));stashActive(norm(nit),c);enqueueDelta(norm(nit),c,key,ctrlN);}return r;};
  if(typeof original.onChangeObsCuest==='function')window.onChangeObsCuest=function(nit,key,ctrlN,val){var r=original.onChangeObsCuest.apply(this,arguments);if(isEvaluator()){var c=currentContract('q',norm(nit));stashActive(norm(nit),c);enqueueDelta(norm(nit),c,key,ctrlN);}return r;};

  if(typeof original.upsertCompleto==='function')window._sgrtUpsertEstadoCompleto=async function(t){
    if(!isEvaluator())return original.upsertCompleto.apply(this,arguments);var nit=norm(t&&t.nit)||currentNit('q'),contract=currentContract('q',nit);if(!nit||!contract)return original.upsertCompleto.apply(this,arguments);await flushPending(nit,contract);var local=db()[nit]||t||{},extra={respuestas:clone(local.respuestasACPorContrato&&local.respuestasACPorContrato[contract]||responses()[nit]||{}),borrador:clone(local.borradoresACPorContrato&&local.borradoresACPorContrato[contract]||null),ac:clone(local.acPorContrato&&local.acPorContrato[contract]||null),promContrato:clone(local.promPorContrato&&local.promPorContrato[contract]||null)};if(t&&t._evidenciasAC)extra.evidenciasAC=clone(t._evidenciasAC);if(t&&t._evidenciasRiesgo)extra.evidenciasRiesgo=clone(t._evidenciasRiesgo);return syncEvaluatorContract(nit,contract,extra);
  };

  function unionContractDims(t){var out=[],seen={};Object.keys(t&&t.dimsPorContrato||{}).forEach(function(c){strictDims(t,c).forEach(function(d){var k=dimKey(d)||low(tipName(d));if(!seen[k]){seen[k]=1;out.push(clone(d));}});});if(!out.length&&Array.isArray(t&&t.dims))out=clone(t.dims);return out;}
  function ensureAllRegistryRows(){
    if(!isEvaluator()||!window.CLS_DB)return;var wrap=document.getElementById('cls-yr-btns'),yr=(wrap&&wrap.dataset.sel)||new Date().getFullYear().toString();if(!window.CLS_DB[yr])window.CLS_DB[yr]=[];var bucket=window.CLS_DB[yr];Object.keys(db()).forEach(function(nit){var t=db()[nit]||{},idx=bucket.findIndex(function(r){return norm(r&&r.nit)===nit;}),rec={nit:nit,nombre:t.nombre||nit,entidad:t.entidad||'',servicio:t.servicio||t.servicio_contratado||'',supervisor:t.supervisor||'',domicilio:t.domicilio||'',prom:t.prom,zona:t.zona,periodicidad:t.periodicidad,yr:yr,dims:unionContractDims(t),contratos:clone(t.contratos||[]),supervisores:clone(t.supervisores||[])};if(idx>=0)bucket[idx]=rec;else bucket.push(rec);});
  }
  if(typeof original.clsRender==='function')window.clsRender=function(){if(isEvaluator())ensureAllRegistryRows();return original.clsRender.apply(this,arguments);};

  if(typeof original.serverLoad==='function')window.sgrtCargarDesdeServidor=async function(){
    var r=await original.serverLoad.apply(this,arguments);if(isEvaluator()){Object.keys(db()).forEach(function(n){migrateLegacyResponses(db()[n]);});ensureAllRegistryRows();var nit=currentNit(panelIsInstructions()?'ac':'q'),c=currentContract(panelIsInstructions()?'ac':'q',nit);if(nit&&c&&activeResponseCtx[nit]===c)activateExact(nit,c);try{window.clsRender&&window.clsRender();}catch(e){}if(panelIsInstructions()&&nit){populateContractSelect(nit,'ac',c);populateStrictTipologies();renderStrictProgress(nit);}}return r;
  };

  async function refreshRegistry(){
    if(registryBusy||document.hidden||!isEvaluator())return;var p=document.getElementById('pg-clasificacion');if(!p||!p.classList.contains('active'))return;registryBusy=true;try{if(typeof window.sgrtCargarDesdeServidor==='function')await window.sgrtCargarDesdeServidor({forceServer:true});ensureAllRegistryRows();try{window.clsRender&&window.clsRender();}catch(e){}}catch(e2){}finally{registryBusy=false;}
  }

  function removeEvaluatorIcons(){
    if(!isEvaluator())return;var root=document.getElementById('pg-cuestionario');if(!root||typeof NodeFilter==='undefined')return;Array.from(root.querySelectorAll('svg')).forEach(function(x){x.style.display='none';});var re;try{re=/[\p{Extended_Pictographic}\uFE0F]/gu;}catch(e){re=/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]/g;}var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(function(n){if(n.parentElement&&['SCRIPT','STYLE','OPTION'].indexOf(n.parentElement.tagName)>=0)return;var v=n.nodeValue||'',nv=v.replace(re,'').replace(/\s{2,}/g,' ');if(nv!==v)n.nodeValue=nv;});
  }
  window._sgrtEvaluatorRemoveIcons=removeEvaluatorIcons;

  function pollCurrent(){if(document.hidden||!isEvaluator())return;var page=document.getElementById('pg-cuestionario');if(!page||!page.classList.contains('active'))return;var nit=currentNit(panelIsInstructions()?'ac':'q');if(nit)pullRemoteThird(nit,true);}
  function startTimers(){if(pollTimer)clearInterval(pollTimer);if(registryTimer)clearInterval(registryTimer);pollTimer=setInterval(pollCurrent,POLL_MS);registryTimer=setInterval(refreshRegistry,REGISTRY_POLL_MS);}
  window.addEventListener('focus',function(){setTimeout(function(){pollCurrent();refreshRegistry();},120);});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){startTimers();if(isEvaluator()){var nit=currentNit('ac')||currentNit('q');if(nit){migrateLegacyResponses(db()[nit]);var c=currentContract(panelIsInstructions()?'ac':'q',nit);if(panelIsInstructions()){populateContractSelect(nit,'ac',c);populateStrictTipologies();renderStrictProgress(nit);}else{populateContractSelect(nit,'q',c);if(c)activateExact(nit,c);}}ensureAllRegistryRows();renderCopyBox();removeEvaluatorIcons();pollCurrent();refreshRegistry();}},450);});
  if(document.readyState!=='loading')setTimeout(function(){startTimers();if(isEvaluator()){ensureAllRegistryRows();pollCurrent();refreshRegistry();}},300);

})();
