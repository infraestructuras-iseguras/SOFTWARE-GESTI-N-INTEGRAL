/*
 * SGRT — Ajuste 40 (2026-09-17)
 * SOLO ROL EVALUADOR.
 *
 * Corrige sin cambiar la estructura base:
 * 1) Tipologías estrictamente por contrato (sin heredar las del contrato anterior).
 * 2) Respuestas estrictamente por contrato.
 * 3) Opción para copiar respuestas de otro contrato del mismo tercero.
 * 4) Sincronización multiusuario liviana por NIT + contrato.
 * 5) Menos iconografía decorativa dentro de la vista del Evaluador.
 */
(function(){
  'use strict';

  var POLL_MS = 12000;
  var DELTA_DEBOUNCE_MS = 550;
  var pendingDelta = {};
  var pendingTimer = {};
  var pollTimer = null;
  var remoteBusy = false;
  var lastRemoteHash = {};
  var lastLocalEditAt = 0;
  var original = {
    qPoblarContratos: window.qPoblarContratos,
    acPoblarContratos: window.acPoblarContratos,
    qCambiarContrato: window.qCambiarContrato,
    acCambiarContrato: window.acCambiarContrato,
    poblarSelectorACTipologia: window.poblarSelectorACTipologia,
    cargarCuestionarioTercero: window.cargarCuestionarioTercero,
    onChangeAtribCuest: window.onChangeAtribCuest,
    onChangeObsCuest: window.onChangeObsCuest,
    upsertCompleto: window._sgrtUpsertEstadoCompleto
  };

  function norm(v){ return String(v == null ? '' : v).trim(); }
  function low(v){ return norm(v).toLowerCase(); }
  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function esc(v){ return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function db(){ if(!window.TERCEROS_DB)window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function responses(){ if(!window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS={}; return window.CUEST_RESPUESTAS; }
  function isEvaluator(){ var r=low((window.currentUser||{}).rol); return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0; }
  function apiBase(){ return norm(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,''); }
  function contractNum(c){ return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato)); }
  function dimKey(d){ return norm(d&&(d.key||d.clave||d.codigo||d.tipologia_key||d.tipologia)).toLowerCase(); }
  function tipName(d){
    try{ var x=window._nombreTipologia&&window._nombreTipologia(d); if(norm(x))return norm(x); }catch(e){}
    return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.label||d.key))||'Tipología';
  }
  function approved(t,n){
    n=norm(n); if(!t||!n)return false;
    if(t.aprobadoPorContrato&&t.aprobadoPorContrato[n])return true;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===n;});
    return !!(c&&(c.aprobado===true||norm(c.estado_aprobacion).toUpperCase()==='APROBADO'||low(c.estado)==='aprobado'));
  }
  function approvedContracts(t){
    var seen={};
    return (t&&t.contratos||[]).filter(function(c){
      var n=contractNum(c); if(!n||seen[n]||!approved(t,n))return false; seen[n]=1; return true;
    });
  }

  // IMPORTANTE: cuando se especifica contrato, nunca se usa t.dims como fallback.
  // Ese fallback era el que dejaba pegadas las tipologías del contrato anterior.
  function strictDims(t,contract){
    contract=norm(contract); if(!t||!contract)return [];
    if(t.dimsPorContrato && Object.prototype.hasOwnProperty.call(t.dimsPorContrato,contract)){
      return Array.isArray(t.dimsPorContrato[contract]) ? t.dimsPorContrato[contract] : [];
    }
    if(t.tipologiasPorContrato && Object.prototype.hasOwnProperty.call(t.tipologiasPorContrato,contract)){
      return Array.isArray(t.tipologiasPorContrato[contract]) ? t.tipologiasPorContrato[contract] : [];
    }
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===contract;});
    if(c){
      if(Array.isArray(c.dims))return c.dims;
      if(Array.isArray(c.tipologias))return c.tipologias;
      if(Array.isArray(c.clasificacion))return c.clasificacion;
    }
    return [];
  }
  window._sgrtEvaluatorStrictDims = strictDims;

  function currentNit(){
    return norm((document.getElementById('q-tercero')||{}).value || (document.getElementById('ac-tercero-instruc')||{}).value || window.nitActual);
  }
  function currentContract(nit){
    nit=norm(nit); var t=db()[nit]||{};
    var q=norm((document.getElementById('q-contrato-sel')||{}).value);
    var a=norm((document.getElementById('ac-contrato-sel')||{}).value);
    if(q && approved(t,q))return q;
    if(a && approved(t,a))return a;
    if(norm(t.contratoEval) && approved(t,norm(t.contratoEval)))return norm(t.contratoEval);
    var cs=approvedContracts(t); return cs.length?contractNum(cs[0]):'';
  }
  function answerWeight(obj){
    var n=0;
    Object.keys(obj||{}).forEach(function(k){
      if(k.indexOf('__')===0)return;
      var tip=obj[k]; if(!tip||typeof tip!=='object')return;
      Object.keys(tip).forEach(function(q){
        var a=norm(tip[q]&&tip[q].a1); if(a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial')n++;
      });
    });
    return n;
  }
  function exactResponses(t,contract){
    contract=norm(contract); if(!t||!contract)return {};
    var options=[
      t.respuestasACPorContrato&&t.respuestasACPorContrato[contract],
      t.acPorContrato&&t.acPorContrato[contract]&&t.acPorContrato[contract].respuestas,
      t.borradoresACPorContrato&&t.borradoresACPorContrato[contract]&&t.borradoresACPorContrato[contract].respuestas,
      t._respuestasPorContrato&&t._respuestasPorContrato[contract],
      t.respuestasPorContrato&&t.respuestasPorContrato[contract]
    ];
    var best={},weight=-1;
    options.forEach(function(x){ if(x&&typeof x==='object'){var w=answerWeight(x);if(w>weight){best=x;weight=w;}} });
    return clone(best||{});
  }
  function saveLocal(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(responses()));}catch(e){}
    try{if(typeof window._lsSave==='function')window._lsSave();}catch(e){}
  }
  function stashActive(nit,contract){
    var t=db()[nit]; if(!t||!contract)return;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    t.respuestasACPorContrato[contract]=clone(responses()[nit]||{});
    t.savedAt=new Date().toISOString();
    saveLocal();
  }
  function activateExact(nit,contract){
    var t=db()[nit]; if(!t||!contract)return;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    var rr=exactResponses(t,contract);
    t.respuestasACPorContrato[contract]=clone(rr);
    responses()[nit]=clone(rr);
    t.contratoEval=contract;
    t.modoEval='contrato';
    // Compatibilidad con renders antiguos, pero siempre usando SOLO las dims del contrato activo.
    t.dims=clone(strictDims(t,contract));
    try{
      var shared=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
      shared[nit]=clone(rr); localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(shared));
    }catch(e){}
    try{
      var b=t.borradoresACPorContrato&&t.borradoresACPorContrato[contract];
      if(b)localStorage.setItem('cuest_borrador_'+nit,JSON.stringify(b));
      else localStorage.removeItem('cuest_borrador_'+nit);
    }catch(e2){}
  }

  function populateContractSelect(nit,kind){
    if(!isEvaluator()){
      var old=kind==='q'?original.qPoblarContratos:original.acPoblarContratos;
      return typeof old==='function'?old.apply(this,arguments):undefined;
    }
    nit=norm(nit); var t=db()[nit], sel=document.getElementById(kind==='q'?'q-contrato-sel':'ac-contrato-sel'), wrap=document.getElementById(kind==='q'?'q-contrato-wrap':'ac-contrato-wrap');
    if(!sel||!wrap)return; if(!t){sel.innerHTML='<option value="">Sin contratos</option>';wrap.style.display='none';return;}
    var cs=approvedContracts(t);
    if(!cs.length){sel.innerHTML='<option value="">Sin contratos aprobados</option>';wrap.style.display='none';return;}
    var prev=norm(sel.value), wanted=cs.some(function(c){return contractNum(c)===prev;})?prev:(cs.some(function(c){return contractNum(c)===norm(t.contratoEval);})?norm(t.contratoEval):contractNum(cs[0]));
    sel.innerHTML=cs.map(function(c){var n=contractNum(c);return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');
    sel.value=wanted; t.contratoEval=wanted; t.dims=clone(strictDims(t,wanted));
    wrap.style.display=kind==='q'?'flex':'block';
    if(kind==='q'){ try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){} }
  }
  window.qPoblarContratos=function(nit){ return populateContractSelect(norm(nit),'q'); };
  window.acPoblarContratos=function(nit){ return populateContractSelect(norm(nit),'ac'); };

  function populateStrictTipologies(){
    if(!isEvaluator())return typeof original.poblarSelectorACTipologia==='function'?original.poblarSelectorACTipologia.apply(this,arguments):undefined;
    var sel=document.getElementById('ac-tip-filtro'); if(!sel)return;
    var nit=currentNit(), t=db()[nit], contract=currentContract(nit);
    sel.innerHTML='<option value="">-- Seleccionar tipología --</option>';
    var desc=document.getElementById('ac-consultor-desc');
    if(!nit||!t||!contract){ if(desc)desc.textContent='Selecciona un tercero y un contrato aprobado.'; return; }
    t.contratoEval=contract; t.modoEval='contrato'; t.dims=clone(strictDims(t,contract));
    var seen={};
    strictDims(t,contract).forEach(function(d){
      var key=dimKey(d),name=tipName(d),dedupe=key||low(name); if(!dedupe||seen[dedupe])return; seen[dedupe]=1;
      var o=document.createElement('option'); o.value=name; o.textContent=name; o.setAttribute('data-key',key); sel.appendChild(o);
    });
    if(desc){
      var n=Math.max(0,sel.options.length-1);
      desc.innerHTML=n?'<b>'+n+' tipología(s)</b> configurada(s) para el contrato <b>'+esc(contract)+'</b>.':'El contrato <b>'+esc(contract)+'</b> no tiene tipologías clasificadas.';
    }
    var aw=document.getElementById('ac-contrato-wrap'); if(aw)aw.style.display='block';
    removeEvaluatorIcons();
  }
  window.poblarSelectorACTipologia=populateStrictTipologies;

  function syncSelectors(contract){
    ['q-contrato-sel','ac-contrato-sel'].forEach(function(id){
      var s=document.getElementById(id); if(!s)return;
      var ok=Array.prototype.some.call(s.options||[],function(o){return norm(o.value)===contract;}); if(ok)s.value=contract;
    });
  }
  function switchEvaluatorContract(contract,source){
    contract=norm(contract); var nit=currentNit(),t=db()[nit]; if(!nit||!t||!contract||!approved(t,contract))return;
    var old=norm(t.contratoEval); if(old&&old!==contract)stashActive(nit,old);
    t.contratoEval=contract; t.modoEval='contrato'; t.dims=clone(strictDims(t,contract));
    syncSelectors(contract); activateExact(nit,contract); saveLocal();
    try{populateStrictTipologies();}catch(e){}
    try{if(typeof original.cargarCuestionarioTercero==='function')original.cargarCuestionarioTercero();}catch(e2){}
    setTimeout(function(){
      try{populateStrictTipologies();}catch(e){}
      try{window.acMostrarEstadoTipologias&&window.acMostrarEstadoTipologias(nit);}catch(e2){}
      renderCopyBox(); removeEvaluatorIcons();
    },70);
  }
  window.qCambiarContrato=function(v){
    if(!isEvaluator())return typeof original.qCambiarContrato==='function'?original.qCambiarContrato.apply(this,arguments):undefined;
    return switchEvaluatorContract(v,'q');
  };
  window.acCambiarContrato=function(v){
    if(!isEvaluator())return typeof original.acCambiarContrato==='function'?original.acCambiarContrato.apply(this,arguments):undefined;
    return switchEvaluatorContract(v,'ac');
  };

  // El render base sigue siendo el mismo, pero antes de ejecutarlo fijamos el contrato
  // y vaciamos cualquier respuesta que pertenezca a otro contrato.
  if(typeof original.cargarCuestionarioTercero==='function'){
    window.cargarCuestionarioTercero=function(){
      if(isEvaluator()){
        var nit=currentNit(),contract=currentContract(nit),t=db()[nit];
        if(t&&contract){t.contratoEval=contract;t.modoEval='contrato';t.dims=clone(strictDims(t,contract));activateExact(nit,contract);syncSelectors(contract);}
      }
      var r=original.cargarCuestionarioTercero.apply(this,arguments);
      if(isEvaluator())setTimeout(function(){populateStrictTipologies();renderCopyBox();removeEvaluatorIcons();},60);
      return r;
    };
  }

  function activeControlNumbers(nit,key,contract){
    try{
      if(typeof window._ctrlsCuest==='function'){
        var a=window._ctrlsCuest(nit,key,contract); if(Array.isArray(a))return a.filter(function(q){return q&&q.activo!==false;}).map(function(q){return String(q.n);});
      }
    }catch(e){}
    return Object.keys(((window.CUESTIONARIO_CONTROLES||{})[key]||[]).reduce(function(m,q){if(q&&q.activo!==false)m[String(q.n)]=1;return m;},{}));
  }
  function copyResponses(sourceContract,targetContract){
    var nit=currentNit(),t=db()[nit]; if(!t)return 0;
    var src=exactResponses(t,sourceContract),dims=strictDims(t,targetContract),out={},copied=0;
    dims.forEach(function(d){
      var key=dimKey(d); if(!key||!src[key])return;
      var allowed=activeControlNumbers(nit,key,targetContract); out[key]={};
      allowed.forEach(function(n){ if(src[key]&&src[key][n]){out[key][n]=clone(src[key][n]);copied++;} });
      if(!Object.keys(out[key]).length)delete out[key];
    });
    if(!t.respuestasACPorContrato)t.respuestasACPorContrato={};
    t.respuestasACPorContrato[targetContract]=clone(out); responses()[nit]=clone(out); t.contratoEval=targetContract; t.dims=clone(strictDims(t,targetContract));
    saveLocal(); return copied;
  }
  function sourceContracts(nit,target){
    var t=db()[nit]; if(!t)return [];
    return approvedContracts(t).map(function(c){return contractNum(c);}).filter(function(c){return c!==target&&answerWeight(exactResponses(t,c))>0;});
  }
  function renderCopyBox(){
    var old=document.getElementById('sgrt-eval-copy-box'); if(old)old.remove();
    if(!isEvaluator())return;
    var nit=currentNit(),target=currentContract(nit); if(!nit||!target)return;
    var sources=sourceContracts(nit,target); if(!sources.length)return;
    var anchor=document.getElementById('q-tipologias-panel')||document.getElementById('q-secciones-wrap'); if(!anchor||!anchor.parentNode)return;
    var box=document.createElement('div'); box.id='sgrt-eval-copy-box';
    box.style.cssText='background:white;border:1px solid #dbe3ea;border-radius:8px;padding:11px 14px;margin-bottom:12px;font-size:11.5px;color:#334155;';
    box.innerHTML='<label style="display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer;"><input id="sgrt-eval-copy-check" type="checkbox"> Usar respuestas ya diligenciadas de otro contrato</label>'+
      '<div id="sgrt-eval-copy-options" style="display:none;margin-top:9px;gap:8px;align-items:center;flex-wrap:wrap;">'+
      '<select id="sgrt-eval-copy-source" style="min-width:180px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;">'+sources.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('')+'</select>'+
      '<button type="button" id="sgrt-eval-copy-apply" style="padding:7px 12px;border:1px solid #1e6bb8;background:#1e6bb8;color:white;border-radius:6px;font-weight:700;cursor:pointer;">Rellenar respuestas</button>'+
      '<span style="color:#64748b;">Solo copia preguntas coincidentes del contrato actual.</span></div>';
    anchor.parentNode.insertBefore(box,anchor);
    var check=document.getElementById('sgrt-eval-copy-check'),opts=document.getElementById('sgrt-eval-copy-options'),btn=document.getElementById('sgrt-eval-copy-apply');
    check.onchange=function(){opts.style.display=check.checked?'flex':'none';};
    btn.onclick=async function(){
      var source=norm((document.getElementById('sgrt-eval-copy-source')||{}).value); if(!source)return;
      var existing=answerWeight(exactResponses(db()[nit],target));
      var msg='¿Rellenar el contrato '+target+' con las respuestas del contrato '+source+'?';
      if(existing)msg+=' Las respuestas existentes del contrato '+target+' se reemplazarán en las preguntas coincidentes.';
      if(!window.confirm(msg))return;
      var n=copyResponses(source,target); lastLocalEditAt=Date.now();
      await syncEvaluatorContract(nit,target,{replaceResponses:true,respuestas:clone((db()[nit].respuestasACPorContrato||{})[target]||{})});
      try{if(typeof window.cargarCuestionarioTercero==='function')window.cargarCuestionarioTercero();}catch(e){}
      try{window.showToast&&window.showToast(n?'Se copiaron '+n+' respuesta(s) al contrato '+target+'.':'No había preguntas coincidentes para copiar.',n?'success':'warning',3200);}catch(e2){}
    };
  }

  function patchUrl(nit,contract){return apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit)+'/evaluador/'+encodeURIComponent(contract);}
  async function syncEvaluatorContract(nit,contract,extra){
    nit=norm(nit);contract=norm(contract);if(!nit||!contract)return false;
    var t=db()[nit]||{},baseBody={
      savedAt:new Date().toISOString(),
      actor:{login:norm((window.currentUser||{}).login||(window.currentUser||{}).user),name:norm((window.currentUser||{}).name||(window.currentUser||{}).nombre),rol:norm((window.currentUser||{}).rol)}
    };
    // Los cambios de una sola pregunta envían únicamente el delta. El estado completo
    // del contrato se envía al copiar respuestas o al usar Guardar/Borrador.
    if(!(extra&&extra.respuestaDelta)){
      baseBody.respuestas=clone(t.respuestasACPorContrato&&t.respuestasACPorContrato[contract]||{});
      baseBody.borrador=clone(t.borradoresACPorContrato&&t.borradoresACPorContrato[contract]||null);
      baseBody.ac=clone(t.acPorContrato&&t.acPorContrato[contract]||null);
      baseBody.promContrato=clone(t.promPorContrato&&t.promPorContrato[contract]||null);
    }
    var body=Object.assign(baseBody,extra||{});
    try{
      var r=await fetch(patchUrl(nit,contract),{method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
      var x=await r.json().catch(function(){return{};});
      if(!r.ok||!x.ok)throw new Error(x.error||('HTTP '+r.status));
      if(x.data&&x.data.estado_sgrt)mergeRemoteState(nit,x.data.estado_sgrt,false);
      var live=db()[nit];
      if(live && !pendingTimer[nit+'|'+contract] && !pendingDelta[nit+'|'+contract]){live.sincronizado=true;live._changed=false;}
      saveLocal();
      return true;
    }catch(e){ console.warn('[SGRT40] Sincronización evaluador pendiente:',e.message); return false; }
  }
  window._sgrtSyncEvaluatorContract=syncEvaluatorContract;

  function mergeObjects(dst,src){
    if(!src||typeof src!=='object')return dst;
    Object.keys(src).forEach(function(k){
      if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k])){if(!dst[k]||typeof dst[k]!=='object'||Array.isArray(dst[k]))dst[k]={};mergeObjects(dst[k],src[k]);}
      else dst[k]=clone(src[k]);
    }); return dst;
  }
  function mergeRemoteState(nit,remote,rerender){
    var t=db()[nit]||{}; if(!remote||typeof remote!=='object')return false;
    var current=currentContract(nit),localPending=!!pendingTimer[nit+'|'+current];
    ['contratos','dimsPorContrato','tipologiasPorContrato','aprobadoPorContrato','_persHiddenControls','_tipologiasDBCustom','_configPreguntas','promPorContrato'].forEach(function(k){
      if(remote[k]!==undefined)t[k]=clone(remote[k]);
    });
    try{
      if(remote._persHiddenControls&&typeof remote._persHiddenControls==='object')window._persHiddenControls=Object.assign(window._persHiddenControls||{},clone(remote._persHiddenControls));
      if(remote._configPreguntas&&typeof remote._configPreguntas==='object'){
        window.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM||{};window.CUEST_CTRL_CUSTOM[nit]=clone(remote._configPreguntas);
      }
      if(remote._tipologiasDBCustom&&typeof remote._tipologiasDBCustom==='object'){
        window.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM||{};
        Object.keys(remote._tipologiasDBCustom).forEach(function(ent){window.TIPOLOGIAS_DB_CUSTOM[ent]=Object.assign(window.TIPOLOGIAS_DB_CUSTOM[ent]||{},clone(remote._tipologiasDBCustom[ent]||{}));});
      }
    }catch(e){}
    ['respuestasACPorContrato','borradoresACPorContrato','acPorContrato'].forEach(function(k){
      if(!remote[k]||typeof remote[k]!=='object')return;
      if(!t[k]||typeof t[k]!=='object')t[k]={};
      Object.keys(remote[k]).forEach(function(c){
        if(c===current&&localPending)return;
        t[k][c]=clone(remote[k][c]);
      });
    });
    t.nit=t.nit||nit; t.nombre=t.nombre||remote.nombre||nit; db()[nit]=t;
    if(current&&!localPending){activateExact(nit,current);t.dims=clone(strictDims(t,current));}
    saveLocal();
    if(rerender&&current&&!localPending){
      var focus=document.activeElement,editing=focus&&/^(INPUT|TEXTAREA|SELECT)$/.test(focus.tagName)&&focus.closest&&focus.closest('#pg-cuestionario');
      if(!editing&&Date.now()-lastLocalEditAt>1200){
        try{if(typeof window.cargarCuestionarioTercero==='function')window.cargarCuestionarioTercero();}catch(e){}
      }
    }
    return true;
  }
  async function pollCurrentEvaluator(){
    if(remoteBusy||document.hidden||!isEvaluator())return;
    var page=document.getElementById('pg-cuestionario'); if(!page||!page.classList.contains('active'))return;
    var nit=currentNit(); if(!nit)return; remoteBusy=true;
    try{
      var r=await fetch(apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit),{headers:{'Accept':'application/json'},cache:'no-store'}); if(!r.ok)return;
      var x=await r.json().catch(function(){return{};}),data=x&&x.data||{},remote=(data.estado_sgrt&&typeof data.estado_sgrt==='object')?data.estado_sgrt:data;
      if(!remote||typeof remote!=='object')return;
      var contract=currentContract(nit),hash=JSON.stringify({d:strictDims(remote,contract),r:remote.respuestasACPorContrato&&remote.respuestasACPorContrato[contract],a:remote.aprobadoPorContrato,c:remote.contratos});
      if(lastRemoteHash[nit]!==hash){lastRemoteHash[nit]=hash;mergeRemoteState(nit,remote,true);populateContractSelect(nit,'q');populateContractSelect(nit,'ac');populateStrictTipologies();renderCopyBox();removeEvaluatorIcons();}
    }catch(e){}finally{remoteBusy=false;}
  }

  function enqueueDelta(nit,contract,key,ctrlN){
    nit=norm(nit);contract=norm(contract);key=norm(key);ctrlN=String(ctrlN);if(!nit||!contract||!key||!ctrlN)return;
    var id=nit+'|'+contract; if(!pendingDelta[id])pendingDelta[id]={}; if(!pendingDelta[id][key])pendingDelta[id][key]={};
    pendingDelta[id][key][ctrlN]=clone(responses()[nit]&&responses()[nit][key]&&responses()[nit][key][ctrlN]||{}); lastLocalEditAt=Date.now();
    clearTimeout(pendingTimer[id]); pendingTimer[id]=setTimeout(async function(){
      var delta=pendingDelta[id]||{}; delete pendingDelta[id]; delete pendingTimer[id];
      await syncEvaluatorContract(nit,contract,{respuestaDelta:delta,respuestas:undefined});
    },DELTA_DEBOUNCE_MS);
  }
  async function flushPending(nit,contract){
    var id=norm(nit)+'|'+norm(contract); if(!pendingDelta[id])return true;
    clearTimeout(pendingTimer[id]); delete pendingTimer[id]; var delta=pendingDelta[id]; delete pendingDelta[id];
    return syncEvaluatorContract(nit,contract,{respuestaDelta:delta,respuestas:undefined});
  }

  if(typeof original.onChangeAtribCuest==='function')window.onChangeAtribCuest=function(nit,key,ctrlN,ai){
    var r=original.onChangeAtribCuest.apply(this,arguments); if(isEvaluator()){var c=currentContract(norm(nit));stashActive(norm(nit),c);enqueueDelta(norm(nit),c,key,ctrlN);} return r;
  };
  if(typeof original.onChangeObsCuest==='function')window.onChangeObsCuest=function(nit,key,ctrlN,val){
    var r=original.onChangeObsCuest.apply(this,arguments); if(isEvaluator()){var c=currentContract(norm(nit));stashActive(norm(nit),c);enqueueDelta(norm(nit),c,key,ctrlN);} return r;
  };

  // Evita que el Evaluador vuelva a sobrescribir el JSON completo del tercero.
  // Los demás roles mantienen exactamente el flujo anterior.
  if(typeof original.upsertCompleto==='function')window._sgrtUpsertEstadoCompleto=async function(t){
    if(!isEvaluator())return original.upsertCompleto.apply(this,arguments);
    var nit=norm(t&&t.nit)||currentNit(),contract=currentContract(nit); if(!nit||!contract)return original.upsertCompleto.apply(this,arguments);
    await flushPending(nit,contract);
    var local=db()[nit]||t||{};
    var extra={
      respuestas:clone(local.respuestasACPorContrato&&local.respuestasACPorContrato[contract]||responses()[nit]||{}),
      borrador:clone(local.borradoresACPorContrato&&local.borradoresACPorContrato[contract]||null),
      ac:clone(local.acPorContrato&&local.acPorContrato[contract]||null),
      promContrato:clone(local.promPorContrato&&local.promPorContrato[contract]||null)
    };
    if(t&&t._evidenciasAC)extra.evidenciasAC=clone(t._evidenciasAC);
    if(t&&t._evidenciasRiesgo)extra.evidenciasRiesgo=clone(t._evidenciasRiesgo);
    return syncEvaluatorContract(nit,contract,extra);
  };

  function removeEvaluatorIcons(){
    if(!isEvaluator())return; var root=document.getElementById('pg-cuestionario'); if(!root||typeof NodeFilter==='undefined')return;
    // Iconos SVG del flujo: ocultarlos solo para el Evaluador, conservando números/estructura.
    Array.from(root.querySelectorAll('svg')).forEach(function(x){x.style.display='none';});
    var re; try{re=/[\p{Extended_Pictographic}\uFE0F]/gu;}catch(e){re=/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]/g;}
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null); var nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(n){
      if(n.parentElement&&['SCRIPT','STYLE','OPTION'].indexOf(n.parentElement.tagName)>=0)return;
      var v=n.nodeValue||'',nv=v.replace(re,'').replace(/\s{2,}/g,' '); if(nv!==v)n.nodeValue=nv;
    });
    // La lista de tipologías trae un span independiente para el icono.
    Array.from(root.querySelectorAll('#q-tipologias-lista > div > span:first-child')).forEach(function(s){if(!norm(s.textContent))s.remove();});
  }
  window._sgrtEvaluatorRemoveIcons=removeEvaluatorIcons;

  function startPolling(){
    if(pollTimer)clearInterval(pollTimer); pollTimer=setInterval(pollCurrentEvaluator,POLL_MS);
    window.addEventListener('focus',function(){setTimeout(pollCurrentEvaluator,120);});
  }
  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(function(){startPolling(); if(isEvaluator()){var nit=currentNit();if(nit){populateContractSelect(nit,'q');populateContractSelect(nit,'ac');populateStrictTipologies();}renderCopyBox();removeEvaluatorIcons();pollCurrentEvaluator();}},500);
  });
  if(document.readyState!=='loading')setTimeout(function(){startPolling();if(isEvaluator()){renderCopyBox();removeEvaluatorIcons();pollCurrentEvaluator();}},350);

})();
