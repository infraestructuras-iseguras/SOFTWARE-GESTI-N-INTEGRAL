/*
 * SGRT — Ajuste 40 v5 (2026-09-18)
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
 * 7) Vista general real: todas las tipologías/preguntas del contrato y filtro individual.
 * 8) Refresco silencioso para evitar parpadeos al navegar entre módulos.
 * 9) No modifica t.dims de forma persistente: evita contaminar tipologías entre contratos.
 * 10) El check de reutilizar respuestas permanece visible si existe otro contrato.
 */
(function(){
  'use strict';

  var POLL_MS=5000;
  var REGISTRY_POLL_MS=20000;
  var DELTA_DEBOUNCE_MS=450;
  var pendingDelta={};
  var pendingTimer={};
  var inFlightSync={};
  var pollTimer=null;
  var registryTimer=null;
  var remoteBusy=false;
  var registryBusy=false;
  var lastRemoteVersion={};
  var lastLocalEditAt=0;
  var evalCtx={nit:'',contract:''};
  var activeResponseCtx={};
  var legacyOwner={};
  var canonicalDims={};
  var backgroundLoadBusy=false;

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
    serverLoad:window.sgrtCargarDesdeServidor,
    limpiarRespuestasCuestionario:window.limpiarRespuestasCuestionario
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
  function contractCanon(v){var s=norm(v);if(/^\d+$/.test(s)){var n=parseInt(s,10);return isNaN(n)?s:String(n);}return low(s);}
  function sameContract(a,b){a=norm(a);b=norm(b);return !!a&&!!b&&(a===b||contractCanon(a)===contractCanon(b));}
  function usefulContractValue(v){if(Array.isArray(v))return v.length>0;if(v&&typeof v==='object')return Object.keys(v).length>0;return !!v;}
  function contractMapKey(map,contract){
    if(!map||typeof map!=='object')return '';contract=norm(contract);var hasExact=Object.prototype.hasOwnProperty.call(map,contract);if(hasExact&&usefulContractValue(map[contract]))return contract;
    var canon=contractCanon(contract),keys=Object.keys(map),fallback='';
    for(var i=0;i<keys.length;i++){if(contractCanon(keys[i])===canon){if(usefulContractValue(map[keys[i]]))return keys[i];if(!fallback)fallback=keys[i];}}
    return hasExact?contract:fallback;
  }
  function contractMapValue(map,contract){var k=contractMapKey(map,contract);return k?map[k]:undefined;}
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
    var ak=contractMapKey(t.aprobadoPorContrato,n);if(ak&&t.aprobadoPorContrato[ak])return true;
    var c=(t.contratos||[]).find(function(x){return sameContract(contractNum(x),n);});
    return !!(c&&(c.aprobado===true||norm(c.estado_aprobacion).toUpperCase()==='APROBADO'||low(c.estado)==='aprobado'));
  }
  function evaluatorContracts(t){
    var seen={};return (t&&t.contratos||[]).filter(function(c){var n=contractNum(c),ck=contractCanon(n);if(!n||seen[ck])return false;seen[ck]=1;return approved(t,n)||strictDims(t,n).length>0;});
  }

  // Fuente contractual canónica: nunca t.dims global.
  // Se toma una copia estable del mapa por contrato para que scripts heredados no
  // puedan copiar accidentalmente las tipologías del contrato activo a otro.
  function rememberCanonicalDims(t,force){
    if(!t||!t.nit)return;var nit=norm(t.nit);if(!canonicalDims[nit])canonicalDims[nit]={};
    Object.keys(t.dimsPorContrato||{}).forEach(function(c){var k=norm(c);
      if(Array.isArray(t.dimsPorContrato[c])&&(force||!Object.prototype.hasOwnProperty.call(canonicalDims[nit],k)))canonicalDims[nit][k]=clone(t.dimsPorContrato[c]);
    });
  }
  function strictDims(t,contract){
    contract=norm(contract);if(!t||!contract)return [];
    var nit=norm(t.nit),arr=null;
    if(nit&&canonicalDims[nit])arr=contractMapValue(canonicalDims[nit],contract);
    if(!Array.isArray(arr)||!arr.length)arr=contractMapValue(t.dimsPorContrato,contract);
    if(!Array.isArray(arr)||!arr.length)arr=contractMapValue(t.tipologiasPorContrato,contract);
    var c=(t.contratos||[]).find(function(x){return sameContract(contractNum(x),contract);});
    if((!Array.isArray(arr)||!arr.length)&&c){
      if(Array.isArray(c.dims)&&c.dims.length)arr=c.dims;
      else if(Array.isArray(c.tipologias)&&c.tipologias.length)arr=c.tipologias;
      else if(Array.isArray(c.clasificacion)&&c.clasificacion.length)arr=c.clasificacion;
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
    var changed=false,nit=norm(t.nit);
    function absorb(c,src){c=norm(c);if(!c||!src||typeof src!=='object'||answerWeight(src)===0)return;if(!t.respuestasACPorContrato[c])t.respuestasACPorContrato[c]={};var before=answerWeight(t.respuestasACPorContrato[c]);mergeAnswers(t.respuestasACPorContrato[c],src);if(answerWeight(t.respuestasACPorContrato[c])!==before)changed=true;}
    Object.keys(t.acPorContrato||{}).forEach(function(c){absorb(c,t.acPorContrato[c]&&t.acPorContrato[c].respuestas);});
    Object.keys(t.borradoresACPorContrato||{}).forEach(function(c){absorb(c,t.borradoresACPorContrato[c]&&t.borradoresACPorContrato[c].respuestas);});
    Object.keys(t._respuestasPorContrato||{}).forEach(function(c){absorb(c,t._respuestasPorContrato[c]);});
    Object.keys(t.respuestasPorContrato||{}).forEach(function(c){absorb(c,t.respuestasPorContrato[c]);});

    // _respuestas es un formato legado GLOBAL. Se asigna una sola vez a un dueño
    // estable; nunca se vuelve a inferir a partir de contratoEval después de cambiar
    // de contrato, porque eso duplicaba el mismo progreso en 94, 8, etc.
    var hasContractAnswers=Object.keys(t.respuestasACPorContrato||{}).some(function(c){return answerWeight(t.respuestasACPorContrato[c])>0;});
    if(nit&&!legacyOwner[nit]){
      // Solo se confía en un dueño legado explícito. Nunca se infiere desde contratoEval
      // ni desde la última pantalla visitada, porque eso puede pegar respuestas a otro contrato.
      legacyOwner[nit]=norm(t._respuestasContrato||t.contratoRespuestas||'');
    }
    // El bloque global legado solo se migra cuando todavía NO existen respuestas
    // contractuales modernas. En estados actuales se ignora para evitar contaminación.
    if(!hasContractAnswers&&nit&&legacyOwner[nit]&&t._respuestas)absorb(legacyOwner[nit],t._respuestas);
    return changed;
  }

  function exactResponses(t,contract){
    contract=norm(contract);if(!t||!contract)return {};
    migrateLegacyResponses(t);
    var out={};
    // Secundarios primero; el bloque contractual canónico gana al final.
    var borr=contractMapValue(t.borradoresACPorContrato,contract),ac=contractMapValue(t.acPorContrato,contract);
    var sources=[
      contractMapValue(t._respuestasPorContrato,contract),
      contractMapValue(t.respuestasPorContrato,contract),
      borr&&borr.respuestas,
      ac&&ac.respuestas,
      contractMapValue(t.respuestasACPorContrato,contract)
    ];
    sources.forEach(function(x){mergeAnswers(out,x);});
    return clone(out);
  }
  window._sgrtEvaluatorExactResponses=exactResponses;
  window._sgrtEvaluatorSameContract=sameContract;

  function saveLocal(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(responses()));}catch(e){}
    try{if(typeof window._lsSave==='function')window._lsSave();}catch(e){}
  }
  function setContext(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract)return false;
    evalCtx={nit:nit,contract:contract};t.contratoEval=contract;t.modoEval='contrato';return true;
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
    var valid=function(v){return cs.some(function(c){return sameContract(contractNum(c),norm(v));});};
    var wanted=valid(preferred)?norm(preferred):(valid(sel.value)?norm(sel.value):(evalCtx.nit===nit&&valid(evalCtx.contract)?evalCtx.contract:(valid(t.contratoEval)?norm(t.contratoEval):contractNum(cs[0]))));
    sel.innerHTML=cs.map(function(c){var n=contractNum(c);return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join('');sel.value=wanted;
    wrap.style.display=kind==='q'?'flex':'block';if(kind==='q'){try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){}}
    return wanted;
  }
  window.qPoblarContratos=function(nit){return populateContractSelect(norm(nit),'q');};
  window.acPoblarContratos=function(nit){return populateContractSelect(norm(nit),'ac');};

  function setContractSelectValue(sel,contract){if(!sel)return;var hit='';Array.from(sel.options||[]).some(function(o){if(sameContract(o.value,contract)){hit=o.value;return true;}return false;});sel.value=hit||contract;}
  function syncSelectors(nit,contract){
    populateContractSelect(nit,'ac',contract);populateContractSelect(nit,'q',contract);
    setContractSelectValue(document.getElementById('ac-contrato-sel'),contract);setContractSelectValue(document.getElementById('q-contrato-sel'),contract);
  }

  function activeControls(nit,key,contract){
    try{if(typeof window._ctrlsCuest==='function'){var a=window._ctrlsCuest(nit,key,contract);if(Array.isArray(a))return a.filter(function(q){return q&&q.activo!==false;});}}catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]).filter(function(q){return q&&q.activo!==false;});
  }

  function renderEvaluatorQuestionnaire(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||typeof original.cargarCuestionarioTercero!=='function')return;
    var hadDims=Object.prototype.hasOwnProperty.call(t,'dims'),oldDims=clone(t.dims);
    var hadFilter=Object.prototype.hasOwnProperty.call(t,'_infDimsFilter'),hadNA=Object.prototype.hasOwnProperty.call(t,'_infDimsNA');
    var oldFilter=clone(t._infDimsFilter),oldNA=clone(t._infDimsNA);
    var dims=clone(strictDims(t,contract)),rr=exactResponses(t,contract);
    // Crear las tipologías vacías ANTES del renderer viejo. Ese renderer intenta
    // rellenar desde sgrt_cuest_respuestas/localStorage cuando no encuentra la clave;
    // con estas claves presentes, un contrato nuevo permanece realmente en blanco.
    dims.forEach(function(d){var k=dimKey(d);if(k&&!rr[k])rr[k]={};});
    responses()[nit]=clone(rr);activeResponseCtx[nit]=contract;
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    var answerKey=contractMapKey(t.respuestasACPorContrato,contract)||contract;t.respuestasACPorContrato[answerKey]=clone(rr);

    // El renderer heredado necesita t.dims, pero SOLO durante esta llamada. Además
    // se bloquea _lsLoad y su hidratación remota interna para que no borre el estado
    // recién traído del servidor ni vuelva a insertar respuestas de otro contrato.
    t.dims=dims;t._infDimsFilter=[];t._infDimsNA=[];
    var oldLsLoad=window._lsLoad,oldRemoteGuard=window._sgrtCargandoRemotoCuestionario;
    window._lsLoad=function(){};window._sgrtCargandoRemotoCuestionario=true;
    try{return original.cargarCuestionarioTercero();}
    finally{
      window._lsLoad=oldLsLoad;window._sgrtCargandoRemotoCuestionario=oldRemoteGuard;
      if(hadDims)t.dims=oldDims;else delete t.dims;
      if(hadFilter)t._infDimsFilter=oldFilter;else delete t._infDimsFilter;
      if(hadNA)t._infDimsNA=oldNA;else delete t._infDimsNA;
      responses()[nit]=clone(rr);activeResponseCtx[nit]=contract;
    }
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

  // Vista general del cuestionario: por defecto se muestran TODAS las preguntas
  // de TODAS las tipologías asignadas al contrato. El filtro individual solo se
  // activa cuando el usuario pulsa una tipología concreta.
  function showAllQuestionSections(){
    var wrap=document.getElementById('q-secciones-wrap');if(!wrap)return;
    Array.from(wrap.querySelectorAll('.card')).forEach(function(card){card.style.display='';});
    wrap.setAttribute('data-sgrt-tip-filter','all');
    var list=document.getElementById('q-tipologias-lista');
    if(list)Array.from(list.querySelectorAll('[data-sgrt-qtip]')).forEach(function(b){
      var all=b.getAttribute('data-sgrt-qtip')==='__all__';
      b.style.background=all?'#1e6bb8':'#f8fafc';b.style.color=all?'white':'#334155';b.style.borderColor=all?'#1e6bb8':'#cbd5e1';
    });
  }
  function filterQuestionSections(key,name){
    try{window._filtrarSeccionesPorTip&&window._filtrarSeccionesPorTip(name,key);}catch(e){}
    var wrap=document.getElementById('q-secciones-wrap');if(wrap)wrap.setAttribute('data-sgrt-tip-filter',norm(key));
    var list=document.getElementById('q-tipologias-lista');
    if(list)Array.from(list.querySelectorAll('[data-sgrt-qtip]')).forEach(function(b){
      var active=b.getAttribute('data-sgrt-qtip')===norm(key);
      b.style.background=active?'#1e6bb8':'#f8fafc';b.style.color=active?'white':'#334155';b.style.borderColor=active?'#1e6bb8':'#cbd5e1';
    });
  }
  function enhanceQuestionnaireTipologies(nit,contract,selectedKey){
    if(!isEvaluator())return;nit=norm(nit)||currentNit('q');contract=norm(contract)||currentContract('q',nit);var t=db()[nit];
    var panel=document.getElementById('q-tipologias-panel'),list=document.getElementById('q-tipologias-lista');if(!panel||!list||!t||!contract)return;
    var dims=strictDims(t,contract);if(!dims.length){panel.style.display='none';return;}
    panel.style.display='block';
    var html='<button type="button" data-sgrt-qtip="__all__" style="padding:7px 11px;border:1px solid #1e6bb8;border-radius:6px;background:#1e6bb8;color:white;font-size:11.5px;font-weight:800;cursor:pointer;">Todas las tipologías</button>';
    dims.forEach(function(d){var key=dimKey(d),name=tipName(d);html+='<button type="button" data-sgrt-qtip="'+esc(key)+'" data-sgrt-qname="'+esc(name)+'" style="padding:7px 11px;border:1px solid #cbd5e1;border-radius:6px;background:#f8fafc;color:#334155;font-size:11.5px;font-weight:700;cursor:pointer;">'+esc(name)+'</button>';});
    list.innerHTML=html;
    Array.from(list.querySelectorAll('[data-sgrt-qtip]')).forEach(function(btn){btn.onclick=function(){var key=norm(btn.getAttribute('data-sgrt-qtip'));if(key==='__all__'){showAllQuestionSections();return;}filterQuestionSections(key,norm(btn.getAttribute('data-sgrt-qname')));};});
    if(selectedKey){
      var hit=null;Array.from(list.querySelectorAll('[data-sgrt-qtip]')).some(function(btn){if(norm(btn.getAttribute('data-sgrt-qtip'))===norm(selectedKey)){hit=btn;return true;}return false;});
      if(hit)hit.click();else showAllQuestionSections();
    }else showAllQuestionSections();
  }
  window._sgrtEvaluatorShowAllQuestionSections=showAllQuestionSections;

  window.acVerTodoCuestionario=function(){
    if(!isEvaluator()){try{window.switchCuestTabExtended&&window.switchCuestTabExtended('cuest');}catch(e){}return;}
    var nit=currentNit('ac'),contract=currentContract('ac',nit),t=db()[nit];if(!nit||!contract||!t){try{window.showToast&&window.showToast('Selecciona primero un tercero y un contrato','error',2200);}catch(e){}return;}
    setContext(nit,contract);var q=document.getElementById('q-tercero');if(q)q.value=nit;syncSelectors(nit,contract);activateExact(nit,contract);
    try{window.switchCuestTabExtended&&window.switchCuestTabExtended('cuest');}catch(e){}
    try{renderEvaluatorQuestionnaire(nit,contract);}catch(e2){}
    setTimeout(function(){enhanceQuestionnaireTipologies(nit,contract,'');renderCopyBox();markDimsSignature(nit,contract);removeEvaluatorIcons();},120);
  };

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
      try{renderEvaluatorQuestionnaire(nit,contract);}catch(e){}
      setTimeout(function(){enhanceQuestionnaireTipologies(nit,contract,'');renderCopyBox();markDimsSignature(nit,contract);removeEvaluatorIcons();},60);pullRemoteThird(nit,false);
    }
  }
  window.qCambiarContrato=function(v){if(!isEvaluator())return typeof original.qCambiarContrato==='function'?original.qCambiarContrato.apply(this,arguments):undefined;return switchEvaluatorContract(v,'q');};
  window.acCambiarContrato=function(v){if(!isEvaluator())return typeof original.acCambiarContrato==='function'?original.acCambiarContrato.apply(this,arguments):undefined;return switchEvaluatorContract(v,'ac');};

  // Selector de tercero propio del Evaluador. No llama al wrapper heredado porque ese
  // wrapper ejecuta syncLegacy() y puede copiar t.dims al contrato equivocado.
  function populateEvaluatorThirds(){
    if(!isEvaluator())return;var ac=document.getElementById('ac-tercero-instruc'),q=document.getElementById('q-tercero');if(!ac)return;
    var prev=norm(ac.value),seen={};ac.innerHTML='<option value="">— Selecciona un tercero —</option>';if(q)q.innerHTML='<option value=""></option>';
    Object.keys(db()).forEach(function(nit){var t=db()[nit];if(!t)return;rememberCanonicalDims(t);var ok=evaluatorContracts(t).length>0;if(!ok||seen[nit])return;seen[nit]=1;var o=document.createElement('option');o.value=nit;o.textContent=(t.nombre||nit)+' ('+nit+')';ac.appendChild(o);if(q)q.appendChild(o.cloneNode(true));});
    if(prev&&seen[prev]){ac.value=prev;if(q)q.value=prev;}
  }
  var originalThirdPopulator=window.acPoblarSelectorTerceroInstruc;
  window.acPoblarSelectorTerceroInstruc=function(){if(!isEvaluator())return typeof originalThirdPopulator==='function'?originalThirdPopulator.apply(this,arguments):undefined;populateEvaluatorThirds();};
  window.acCambiarTerceroInstruc=function(){
    if(!isEvaluator())return typeof original.acCambiarTerceroInstruc==='function'?original.acCambiarTerceroInstruc.apply(this,arguments):undefined;
    var nit=acNit(),q=document.getElementById('q-tercero');if(q)q.value=nit;if(!nit||!db()[nit]){return;}
    rememberCanonicalDims(db()[nit]);var c=populateContractSelect(nit,'ac');if(c){populateContractSelect(nit,'q',c);setContext(nit,c);populateStrictTipologies();renderStrictProgress(nit);pullRemoteThird(nit,false);}removeEvaluatorIcons();
  };

  if(typeof original.cargarCuestionarioTercero==='function'){
    window.cargarCuestionarioTercero=function(){
      if(!isEvaluator())return original.cargarCuestionarioTercero.apply(this,arguments);
      var nit=currentNit('q');if(!nit)return original.cargarCuestionarioTercero.apply(this,arguments);
      var c=populateContractSelect(nit,'q',currentContract('q',nit));if(c){setContext(nit,c);activateExact(nit,c);populateContractSelect(nit,'ac',c);}
      var r=renderEvaluatorQuestionnaire(nit,c);setTimeout(function(){enhanceQuestionnaireTipologies(nit,c,'');renderCopyBox();markDimsSignature(nit,c);removeEvaluatorIcons();},60);return r;
    };
  }

  function openTipologyInQuestionnaire(key,name){
    var nit=currentNit('ac'),contract=currentContract('ac',nit),t=db()[nit];if(!nit||!contract||!t)return;
    setContext(nit,contract);var q=document.getElementById('q-tercero');if(q)q.value=nit;syncSelectors(nit,contract);activateExact(nit,contract);
    try{window.switchCuestTabExtended&&window.switchCuestTabExtended('cuest');}catch(e){try{switchCuestTabExtended('cuest');}catch(e2){}}
    try{renderEvaluatorQuestionnaire(nit,contract);}catch(e3){}
    setTimeout(function(){enhanceQuestionnaireTipologies(nit,contract,key);renderCopyBox();markDimsSignature(nit,contract);removeEvaluatorIcons();},220);
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
  function sharedCopyTipologies(nit,sourceContract,targetContract){
    var t=db()[nit];if(!t)return[];var srcDims=strictDims(t,sourceContract),srcKeys={};srcDims.forEach(function(d){srcKeys[dimKey(d)]=tipName(d);});
    var srcResp=exactResponses(t,sourceContract);return strictDims(t,targetContract).filter(function(d){var k=dimKey(d);return !!k&&!!srcKeys[k]&&!!(srcResp[k]&&Object.keys(srcResp[k]).length);}).map(function(d){return {key:dimKey(d),name:tipName(d)};});
  }
  function copyResponses(sourceContract,targetContract,tipKey){
    var nit=currentNit('q')||currentNit('ac'),t=db()[nit];if(!t)return 0;tipKey=norm(tipKey);var src=exactResponses(t,sourceContract),out=exactResponses(t,targetContract),copied=0;if(!tipKey||!src[tipKey])return 0;
    var allowed=activeControlNumbers(nit,tipKey,targetContract);if(!out[tipKey])out[tipKey]={};allowed.forEach(function(n){if(src[tipKey]&&src[tipKey][n]){out[tipKey][n]=clone(src[tipKey][n]);copied++;}});
    if(!t.respuestasACPorContrato)t.respuestasACPorContrato={};var tk=contractMapKey(t.respuestasACPorContrato,targetContract)||targetContract;t.respuestasACPorContrato[tk]=clone(out);responses()[nit]=clone(out);activeResponseCtx[nit]=targetContract;setContext(nit,targetContract);saveLocal();return copied;
  }
  function sourceContracts(nit,target){var t=db()[nit];if(!t)return[];return evaluatorContracts(t).map(contractNum).filter(function(c){return !sameContract(c,target);});}
  function renderCopyBox(){
    var old=document.getElementById('sgrt-eval-copy-box');if(!isEvaluator()){if(old)old.remove();return;}
    var nit=currentNit('q')||currentNit('ac'),target=currentContract(panelIsInstructions()?'ac':'q',nit);if(!nit||!target){if(old)old.remove();return;}
    // V22: si el asistente 42 ya convirtió este bloque en el panel avanzado y seguimos
    // en el mismo tercero/contrato, NO reconstruirlo durante el polling. Reconstruirlo
    // borraba el checkbox marcado y cerraba el selector justo cuando el usuario lo usaba.
    if(old&&old.dataset&&old.dataset.sgrt42extended==='1'&&norm(old.dataset.sgrt42Nit)===norm(nit)&&sameContract(old.dataset.sgrt42Contract,target))return;
    if(old)old.remove();
    var sources=sourceContracts(nit,target);if(!sources.length)return;
    var anchor=document.getElementById('q-tipologias-panel')||document.getElementById('q-secciones-wrap');
    var page=document.getElementById('pg-cuestionario'),cuest=document.getElementById('cq-panel-cuest');if(!anchor||!anchor.parentNode||!page||!page.classList.contains('active')||(cuest&&cuest.style.display==='none'))return;
    var box=document.createElement('div');box.id='sgrt-eval-copy-box';box.style.cssText='background:white;border:1px solid #dbe3ea;border-radius:8px;padding:11px 14px;margin-bottom:12px;font-size:11.5px;color:#334155;';
    box.innerHTML='<label style="display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer;"><input id="sgrt-eval-copy-check" type="checkbox"> Rellenar una tipología con respuestas de otro contrato</label><div id="sgrt-eval-copy-options" style="display:none;margin-top:9px;gap:8px;align-items:center;flex-wrap:wrap;"><select id="sgrt-eval-copy-source" style="min-width:160px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;">'+sources.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('')+'</select><select id="sgrt-eval-copy-tip" style="min-width:220px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;"></select><button type="button" id="sgrt-eval-copy-apply" style="padding:7px 12px;border:1px solid #1e6bb8;background:#1e6bb8;color:white;border-radius:6px;font-weight:700;cursor:pointer;">Rellenar esta tipología</button><span style="color:#64748b;">Las demás tipologías del contrato permanecen en blanco o con sus propias respuestas.</span></div>';
    anchor.parentNode.insertBefore(box,anchor);
    var check=document.getElementById('sgrt-eval-copy-check'),opts=document.getElementById('sgrt-eval-copy-options'),src=document.getElementById('sgrt-eval-copy-source'),tip=document.getElementById('sgrt-eval-copy-tip'),btn=document.getElementById('sgrt-eval-copy-apply');
    function fillTips(){var list=sharedCopyTipologies(nit,norm(src.value),target);tip.innerHTML=list.length?list.map(function(x){return '<option value="'+esc(x.key)+'">'+esc(x.name)+'</option>';}).join(''):'<option value="">Sin tipologías coincidentes con respuestas</option>';btn.disabled=!list.length;btn.style.opacity=list.length?'1':'.55';}
    check.onchange=function(){opts.style.display=check.checked?'flex':'none';if(check.checked)fillTips();};src.onchange=fillTips;
    btn.onclick=async function(){
      var source=norm(src.value),tipKey=norm(tip.value);if(!source||!tipKey)return;var targetResp=exactResponses(db()[nit],target),existing=targetResp[tipKey]&&answerWeight((function(){var o={};o[tipKey]=targetResp[tipKey];return o;})());
      var tipNameTxt=(tip.options[tip.selectedIndex]||{}).textContent||tipKey,msg='¿Rellenar solo la tipología "'+tipNameTxt+'" del contrato '+target+' usando las respuestas del contrato '+source+'?';if(existing)msg+=' Las respuestas actuales de esa tipología que coincidan serán reemplazadas.';if(!window.confirm(msg))return;
      var n=copyResponses(source,target,tipKey);lastLocalEditAt=Date.now();await syncEvaluatorContract(nit,target,{replaceResponses:true,respuestas:clone(exactResponses(db()[nit],target))});
      try{applyRemoteAnswersToVisible(nit,target);renderStrictProgress(nit);window.showToast&&window.showToast(n?'Se copiaron '+n+' respuesta(s) únicamente en '+tipNameTxt+'.':'No había preguntas coincidentes para copiar.',n?'success':'warning',3200);}catch(e2){}
    };
  }

  function deleteContractAliases(map,contract){
    if(!map||typeof map!=='object')return;
    Object.keys(map).forEach(function(k){if(sameContract(k,contract))delete map[k];});
  }

  async function clearEvaluatorContract(nit,contract){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract)return false;
    var id=syncId(nit,contract);
    clearTimeout(pendingTimer[id]);delete pendingTimer[id];delete pendingDelta[id];

    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    deleteContractAliases(t.respuestasACPorContrato,contract);
    // Dejamos un bloque vacío canónico para impedir cualquier fallback legado.
    t.respuestasACPorContrato[contract]={};
    deleteContractAliases(t.borradoresACPorContrato,contract);
    deleteContractAliases(t.acPorContrato,contract);
    deleteContractAliases(t.promPorContrato,contract);
    deleteContractAliases(t._respuestasPorContrato,contract);
    deleteContractAliases(t.respuestasPorContrato,contract);

    if(sameContract(t._respuestasContrato,contract)||sameContract(t.contratoRespuestas,contract)){
      t._respuestas={};t._respuestasContrato=contract;t.contratoRespuestas=contract;
    }
    responses()[nit]={};activeResponseCtx[nit]=contract;setContext(nit,contract);
    try{localStorage.removeItem('cuest_borrador_'+nit);}catch(e){}
    try{var sh=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');sh[nit]={};localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(sh));}catch(e2){}
    t.savedAt=new Date().toISOString();lastLocalEditAt=Date.now();saveLocal();

    var ok=await syncEvaluatorContract(nit,contract,{replaceResponses:true,respuestas:{},clearContract:true});
    try{renderEvaluatorQuestionnaire(nit,contract);}catch(e3){}
    setTimeout(function(){enhanceQuestionnaireTipologies(nit,contract,'');renderStrictProgress(nit);renderCopyBox();markDimsSignature(nit,contract);removeEvaluatorIcons();try{window.renderReportesAC&&window.renderReportesAC();}catch(e4){}},80);
    return ok;
  }

  window.limpiarRespuestasCuestionario=function(){
    if(!isEvaluator())return typeof original.limpiarRespuestasCuestionario==='function'?original.limpiarRespuestasCuestionario.apply(this,arguments):undefined;
    var nit=currentNit('q')||currentNit('ac'),contract=currentContract('q',nit)||currentContract('ac',nit);
    if(!nit||!contract){try{window.showToast&&window.showToast('Selecciona primero un tercero y un contrato','error',2200);}catch(e){}return;}
    if(!window.confirm('¿Limpiar TODAS las respuestas y cálculos del contrato '+contract+'? Las respuestas de los demás contratos no se modificarán.'))return;
    clearEvaluatorContract(nit,contract).then(function(ok){
      try{window.showToast&&window.showToast(ok?'Contrato '+contract+' limpiado y sincronizado.':'Se limpió localmente, pero quedó pendiente sincronizar con el servidor.',ok?'success':'warning',3500);}catch(e){}
    });
  };

  function patchUrl(nit,contract){return apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit)+'/evaluador/'+encodeURIComponent(contract);}
  function syncId(nit,contract){return norm(nit)+'|'+contractCanon(contract);}
  function contractBusy(nit,contract){var id=syncId(nit,contract);return !!pendingTimer[id]||!!pendingDelta[id]||!!inFlightSync[id];}
  async function syncEvaluatorContract(nit,contract,extra){
    nit=norm(nit);contract=norm(contract);if(!nit||!contract)return false;var id=syncId(nit,contract),t=db()[nit]||{},baseBody={savedAt:new Date().toISOString(),actor:{login:norm((window.currentUser||{}).login||(window.currentUser||{}).user),name:norm((window.currentUser||{}).name||(window.currentUser||{}).nombre),rol:norm((window.currentUser||{}).rol)}};
    if(!(extra&&extra.respuestaDelta)){baseBody.respuestas=clone(exactResponses(t,contract));var bk=contractMapValue(t.borradoresACPorContrato,contract),ak=contractMapValue(t.acPorContrato,contract),pk=contractMapValue(t.promPorContrato,contract);baseBody.borrador=clone(bk||null);baseBody.ac=clone(ak||null);baseBody.promContrato=clone(pk||null);}
    var body=Object.assign(baseBody,extra||{});inFlightSync[id]=(inFlightSync[id]||0)+1;
    try{var r=await fetch(patchUrl(nit,contract),{method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)}),x=await r.json().catch(function(){return{};});if(!r.ok||!x.ok)throw new Error(x.error||('HTTP '+r.status));var remote=x.data&&x.data.estado_sgrt;if(remote)mergeRemoteState(nit,remote,false);var live=db()[nit];if(live&&!pendingTimer[id]&&!pendingDelta[id]&&(inFlightSync[id]||0)<=1){live.sincronizado=true;live._changed=false;}saveLocal();return true;}catch(e){console.warn('[SGRT40v5] Sincronización pendiente:',e.message);return false;}
    finally{inFlightSync[id]=Math.max(0,(inFlightSync[id]||1)-1);if(!inFlightSync[id])delete inFlightSync[id];}
  }

  window._sgrtSyncEvaluatorContract=syncEvaluatorContract;


  function markDimsSignature(nit,contract){var wrap=document.getElementById('q-secciones-wrap');if(wrap)wrap.setAttribute('data-sgrt-dims-sig',JSON.stringify(strictDims(db()[nit]||{},contract).map(dimKey)));}
  function safeNit(nit){return norm(nit).replace(/[^a-z0-9]/gi,'_');}
  function applyRemoteAnswersToVisible(nit,contract){
    nit=norm(nit);contract=norm(contract);if(!nit||!contract||contractBusy(nit,contract))return;var rr=exactResponses(db()[nit]||{},contract);responses()[nit]=clone(rr);var nk=safeNit(nit);
    strictDims(db()[nit]||{},contract).forEach(function(d){var key=dimKey(d);activeControls(nit,key,contract).forEach(function(q){var a=rr&&rr[key]&&rr[key][q.n]||{};for(var i=1;i<=7;i++){var el=document.getElementById('qa_'+nk+'_'+key+'_'+q.n+'_a'+i);if(el&&document.activeElement!==el)el.value=norm(a['a'+i]);}var obs=document.getElementById('obs_'+nk+'_'+key+'_'+q.n);if(obs&&document.activeElement!==obs)obs.value=norm(a.obs);});try{window.actualizarBadgeSec&&window.actualizarBadgeSec(nit,key);}catch(e){} });
    try{window.actualizarProgressoCuest&&window.actualizarProgressoCuest(nit,strictDims(db()[nit]||{},contract).map(dimKey));}catch(e2){}
  }

  function mergeRemoteState(nit,remote,rerender){
    nit=norm(nit);if(!remote||typeof remote!=='object')return false;remote=clone(remote);remote.nit=remote.nit||nit;if(!legacyOwner[nit])legacyOwner[nit]=norm(remote._respuestasContrato||remote.contratoRespuestas||'');rememberCanonicalDims(remote,true);migrateLegacyResponses(remote);var t=db()[nit]||{};
    ['nombre','entidad','domicilio','servicio','servicio_contratado','contratos','dimsPorContrato','tipologiasPorContrato','aprobadoPorContrato','_persHiddenControls','_tipologiasDBCustom','_configPreguntas','promPorContrato'].forEach(function(k){if(remote[k]!==undefined)t[k]=clone(remote[k]);});
    migrateLegacyResponses(t);
    ['respuestasACPorContrato','borradoresACPorContrato','acPorContrato'].forEach(function(k){if(!remote[k]||typeof remote[k]!=='object')return;if(!t[k]||typeof t[k]!=='object')t[k]={};Object.keys(remote[k]).forEach(function(c){var id=syncId(nit,c),hasPending=contractBusy(nit,c);if(k==='respuestasACPorContrato'&&hasPending){var merged=clone(remote[k][c]||{});mergeAnswers(merged,t[k][c]||{});if(pendingDelta[id])mergeAnswers(merged,pendingDelta[id]);t[k][c]=merged;}else t[k][c]=clone(remote[k][c]);});});
    t.nit=t.nit||nit;db()[nit]=t;rememberCanonicalDims(t);
    try{if(remote._persHiddenControls)window._persHiddenControls=Object.assign(window._persHiddenControls||{},clone(remote._persHiddenControls));if(remote._configPreguntas){window.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM||{};window.CUEST_CTRL_CUSTOM[nit]=clone(remote._configPreguntas);}}catch(e){}
    var c=currentContract(panelIsInstructions()?'ac':'q',nit),blocked=contractBusy(nit,c);if(c&&!blocked&&activeResponseCtx[nit]===c)activateExact(nit,c);saveLocal();
    if(rerender&&!blocked&&Date.now()-lastLocalEditAt>700){if(panelIsInstructions()){populateContractSelect(nit,'ac',c);populateStrictTipologies();renderStrictProgress(nit);}else{populateContractSelect(nit,'q',c);var wrap=document.getElementById('q-secciones-wrap'),oldSig=wrap&&wrap.getAttribute('data-sgrt-dims-sig'),newSig=JSON.stringify(strictDims(t,c).map(dimKey));if(oldSig!==newSig){try{renderEvaluatorQuestionnaire(nit,c);}catch(e2){}setTimeout(function(){enhanceQuestionnaireTipologies(nit,c,'');markDimsSignature(nit,c);},70);}else applyRemoteAnswersToVisible(nit,c);}renderCopyBox();removeEvaluatorIcons();}
    return true;
  }

  async function pullRemoteThird(nit,rerender){
    nit=norm(nit);if(!isEvaluator()||!nit||remoteBusy)return false;remoteBusy=true;try{var r=await fetch(apiBase()+'/api/sgrt-state/'+encodeURIComponent(nit),{headers:{'Accept':'application/json'},cache:'no-store'});if(!r.ok)return false;var x=await r.json().catch(function(){return{}}),data=x&&x.data||{},remote=(data.estado_sgrt&&typeof data.estado_sgrt==='object')?data.estado_sgrt:data;if(!remote||typeof remote!=='object')return false;var version=norm(data.updatedAt||remote.savedAt||JSON.stringify(remote.respuestasACPorContrato||{}).length);if(lastRemoteVersion[nit]!==version){lastRemoteVersion[nit]=version;mergeRemoteState(nit,remote,rerender!==false);}return true;}catch(e){return false;}finally{remoteBusy=false;}
  }

  function enqueueDelta(nit,contract,key,ctrlN){
    nit=norm(nit);contract=norm(contract);key=norm(key);ctrlN=String(ctrlN);if(!nit||!contract||!key||!ctrlN)return;var id=syncId(nit,contract);if(!pendingDelta[id])pendingDelta[id]={};if(!pendingDelta[id][key])pendingDelta[id][key]={};pendingDelta[id][key][ctrlN]=clone(responses()[nit]&&responses()[nit][key]&&responses()[nit][key][ctrlN]||{});lastLocalEditAt=Date.now();clearTimeout(pendingTimer[id]);pendingTimer[id]=setTimeout(async function(){var delta=pendingDelta[id]||{};delete pendingDelta[id];delete pendingTimer[id];await syncEvaluatorContract(nit,contract,{respuestaDelta:delta});},DELTA_DEBOUNCE_MS);
  }
  async function flushPending(nit,contract){var id=syncId(nit,contract);if(!pendingDelta[id])return true;clearTimeout(pendingTimer[id]);delete pendingTimer[id];var delta=pendingDelta[id];delete pendingDelta[id];return syncEvaluatorContract(nit,contract,{respuestaDelta:delta});}

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

  async function lightweightServerLoad(opts){
    if(backgroundLoadBusy)return {ok:true,busy:true};backgroundLoadBusy=true;opts=opts||{};
    try{
      var pair=await Promise.all([fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json'},cache:'no-store'}),fetch(apiBase()+'/api/sgrt-state',{headers:{'Accept':'application/json'},cache:'no-store'})]);
      var masters=await pair[0].json().catch(function(){return{data:[]}}),states=await pair[1].json().catch(function(){return{data:[]}}),masterBy={};
      (masters.data||[]).forEach(function(r){var n=norm(r.nit||r.NIT);if(n)masterBy[n]=r;});
      var changed=[];
      (states.data||[]).forEach(function(row){var nit=norm(row.nit||row.NIT),remote=row.estado_sgrt&&typeof row.estado_sgrt==='object'?row.estado_sgrt:{};if(!nit)return;remote=clone(remote);remote.nit=remote.nit||nit;var before='';try{before=JSON.stringify({d:(db()[nit]||{}).dimsPorContrato||{},r:(db()[nit]||{}).respuestasACPorContrato||{},c:(db()[nit]||{}).contratos||[]});}catch(e){}mergeRemoteState(nit,remote,false);var t=db()[nit]||{};var m=masterBy[nit]||{};t.nombre=t.nombre||m.nombre||m.Nombre_Tercero||nit;t.domicilio=t.domicilio||m.domicilio||m.Domicilio||'';t.servicio_contratado=t.servicio_contratado||m.servicio_contratado||m.Servicio_Contratado||'';rememberCanonicalDims(t);var after='';try{after=JSON.stringify({d:t.dimsPorContrato||{},r:t.respuestasACPorContrato||{},c:t.contratos||[]});}catch(e2){}if(before!==after)changed.push(nit);});
      (masters.data||[]).forEach(function(m){var nit=norm(m.nit||m.NIT);if(!nit||db()[nit])return;db()[nit]={nit:nit,nombre:m.nombre||m.Nombre_Tercero||nit,domicilio:m.domicilio||m.Domicilio||'',servicio_contratado:m.servicio_contratado||m.Servicio_Contratado||'',contratos:[],dimsPorContrato:{}};changed.push(nit);});
      saveLocal();populateEvaluatorThirds();
      var active=document.querySelector('.page.active'),page=active&&active.id,nit=currentNit(panelIsInstructions()?'ac':'q'),contract=currentContract(panelIsInstructions()?'ac':'q',nit);
      if(nit&&changed.indexOf(nit)>=0){
        if(page==='pg-cuestionario'&&contract){var oldSig=(document.getElementById('q-secciones-wrap')||{}).getAttribute&&document.getElementById('q-secciones-wrap').getAttribute('data-sgrt-dims-sig'),newSig=JSON.stringify(strictDims(db()[nit],contract).map(dimKey));activateExact(nit,contract);if(oldSig!==newSig){renderEvaluatorQuestionnaire(nit,contract);setTimeout(function(){enhanceQuestionnaireTipologies(nit,contract,'');renderCopyBox();markDimsSignature(nit,contract);},40);}else{applyRemoteAnswersToVisible(nit,contract);renderStrictProgress(nit);renderCopyBox();}}
        else if(page==='pg-clasificacion'){try{window.clsRender&&window.clsRender();}catch(e3){}}
      }
      return {ok:true,count:Object.keys(db()).length,changed:changed};
    }catch(e){console.warn('[SGRT40v5] Refresco silencioso:',e.message);return {ok:false,error:e.message};}
    finally{backgroundLoadBusy=false;}
  }
  if(typeof original.serverLoad==='function')window.sgrtCargarDesdeServidor=async function(opts){
    opts=opts||{};if(!isEvaluator())return original.serverLoad.apply(this,arguments);
    // Una carga forzada explícita (inicio/cambio de sesión) conserva el comportamiento
    // existente. Los refrescos periódicos o al navegar son silenciosos y no reconstruyen la UI.
    if(opts.forceServer===true&&!opts.silentUi){var r=await original.serverLoad.apply(this,arguments);Object.keys(db()).forEach(function(n){rememberCanonicalDims(db()[n],true);migrateLegacyResponses(db()[n]);});populateEvaluatorThirds();return r;}
    return lightweightServerLoad(opts);
  };

  function registrySignature(){
    try{return JSON.stringify(Object.keys(db()).sort().map(function(n){var t=db()[n]||{};return [n,t.savedAt||'',t.updatedAt||'',t.contratos||[],t.dimsPorContrato||{},t.promPorContrato||{},t.aprobadoPorContrato||{}];}));}catch(e){return String(Date.now());}
  }
  async function refreshRegistry(){
    if(registryBusy||document.hidden||!isEvaluator())return;var p=document.getElementById('pg-clasificacion');if(!p||!p.classList.contains('active'))return;registryBusy=true;try{var before=registrySignature();if(typeof window.sgrtCargarDesdeServidor==='function')await window.sgrtCargarDesdeServidor({forceServer:true,silentUi:true});ensureAllRegistryRows();var after=registrySignature();if(before!==after){try{window.clsRender&&window.clsRender();}catch(e){}}}catch(e2){}finally{registryBusy=false;}
  }

  function removeEvaluatorIcons(){
    if(!isEvaluator())return;var root=document.getElementById('pg-cuestionario');if(!root||typeof NodeFilter==='undefined')return;Array.from(root.querySelectorAll('svg')).forEach(function(x){x.style.display='none';});var re;try{re=/[\p{Extended_Pictographic}\uFE0F]/gu;}catch(e){re=/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]/g;}var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(function(n){if(n.parentElement&&['SCRIPT','STYLE','OPTION'].indexOf(n.parentElement.tagName)>=0)return;var v=n.nodeValue||'',nv=v.replace(re,'').replace(/\s{2,}/g,' ');if(nv!==v)n.nodeValue=nv;});
  }
  window._sgrtEvaluatorRemoveIcons=removeEvaluatorIcons;

  async function pollCurrent(){
    if(document.hidden||!isEvaluator())return;var page=document.getElementById('pg-cuestionario');if(!page||!page.classList.contains('active'))return;
    var instructions=panelIsInstructions(),nit=currentNit(instructions?'ac':'q');if(!nit)return;await pullRemoteThird(nit,false);
    var contract=currentContract(instructions?'ac':'q',nit);if(!contract||contractBusy(nit,contract))return;
    if(instructions)renderStrictProgress(nit);else applyRemoteAnswersToVisible(nit,contract);
  }
  function startTimers(){if(pollTimer)clearInterval(pollTimer);if(registryTimer)clearInterval(registryTimer);pollTimer=setInterval(pollCurrent,POLL_MS);registryTimer=setInterval(refreshRegistry,REGISTRY_POLL_MS);}
  window.addEventListener('focus',function(){setTimeout(function(){pollCurrent();refreshRegistry();},120);});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){startTimers();if(isEvaluator()){Object.keys(db()).forEach(function(n){rememberCanonicalDims(db()[n]);});populateEvaluatorThirds();var nit=currentNit('ac')||currentNit('q');if(nit){migrateLegacyResponses(db()[nit]);var c=currentContract(panelIsInstructions()?'ac':'q',nit);if(panelIsInstructions()){populateContractSelect(nit,'ac',c);populateStrictTipologies();renderStrictProgress(nit);}else{populateContractSelect(nit,'q',c);if(c)activateExact(nit,c);}}ensureAllRegistryRows();renderCopyBox();removeEvaluatorIcons();pollCurrent();refreshRegistry();}},450);});
  if(document.readyState!=='loading')setTimeout(function(){startTimers();if(isEvaluator()){Object.keys(db()).forEach(function(n){rememberCanonicalDims(db()[n]);});populateEvaluatorThirds();ensureAllRegistryRows();pollCurrent();refreshRegistry();}},300);

})();
