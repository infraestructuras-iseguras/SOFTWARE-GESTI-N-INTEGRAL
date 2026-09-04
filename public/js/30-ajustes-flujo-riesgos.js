/*
 * SGRT — Módulo 30: ajustes críticos de flujo por contrato.
 * Objetivo: no cambiar diseño/base de datos; corregir persistencia, contexto contrato,
 * supervisores, Ambiente de Control, sesión y refresco de vistas.
 */
(function(){
  'use strict';

  var SESSION_KEY='sgrt_session_persistente_v1';
  var CHANNEL_NAME='sgrt_estado_v1';
  var expandedNits=new Set();
  var remoteTimers={};
  var bc=null;
  try{ if('BroadcastChannel' in window) bc=new BroadcastChannel(CHANNEL_NAME); }catch(e){}

  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function db(){ if(!window.TERCEROS_DB)window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function responses(){ if(!window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS={}; return window.CUEST_RESPUESTAS; }
  function norm(v){ return String(v==null?'':v).trim(); }
  function contractNum(c){ return norm(c&&(c.num||c.numero||c.NoContrato)); }
  function role(){ return String((window.currentUser||{}).rol||''); }
  function isEvaluator(){ var r=role().toLowerCase(); return r==='cliente'||r==='evaluador'; }
  function isRiskAdmin(){ var r=role().toLowerCase(); return r==='operativo'||r==='admin_riesgos'; }
  function toast(m,t,ms){ try{ if(window.showToast)window.showToast(m,t||'info',ms||2500); }catch(e){} }
  function approved(t,num){
    if(!t||!num)return false;
    if(t.aprobadoPorContrato&&t.aprobadoPorContrato[num])return true;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===String(num);});
    return !!(c&&(c.aprobado===true||c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'));
  }
  function dimsFor(t,num){
    if(!t)return [];
    num=norm(num);
    if(num&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num]))return t.dimsPorContrato[num];
    if(num&&String(t.contratoEval||'')===num&&Array.isArray(t.dims))return t.dims;
    return Array.isArray(t.dims)?t.dims:[];
  }
  function zoneFor(p){ return p>=4?'EXTREMO':p>3?'ALTO':p>=2?'MODERADO':'BAJO'; }

  function persistLocal(){
    var d=db();
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));}catch(e){}
    try{
      var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
      s.TERCEROS_DB=d;
      s.CUEST_RESPUESTAS=responses();
      s.PERS_HIDDEN=window._persHiddenControls||s.PERS_HIDDEN||{};
      s.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM||s.TIPOLOGIAS_DB_CUSTOM||{};
      localStorage.setItem('sgrt_v8',JSON.stringify(s));
    }catch(e2){}
    try{localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(responses()));}catch(e3){}
  }
  function scheduleRemote(t){
    if(!t||!t.nit||typeof window._sgrtUpsertEstadoCompleto!=='function')return;
    clearTimeout(remoteTimers[t.nit]);
    remoteTimers[t.nit]=setTimeout(function(){
      try{ Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).catch(function(){}); }catch(e){}
    },650);
  }
  function broadcast(kind,nit,contrato){
    var msg={kind:kind||'state',nit:nit||'',contrato:contrato||'',ts:Date.now()};
    try{if(bc)bc.postMessage(msg);}catch(e){}
    try{localStorage.setItem('sgrt_last_change_v1',JSON.stringify(msg));}catch(e2){}
  }

  /* ------------------------------------------------------------------
   * 1) NORMALIZACIÓN CONTRATO ↔ SUPERVISOR
   * ------------------------------------------------------------------ */
  function supervisorsFor(t,c){
    var num=contractNum(c),out=[],seen={};
    function add(s){
      var name=typeof s==='string'?s:norm(s&&(s.nombre||s.name||s.supervisor));
      if(!name||seen[name.toLowerCase()])return;
      seen[name.toLowerCase()]=1;
      out.push(typeof s==='string'?{nombre:name}:{nombre:name,cargo:s.cargo||s.supervisorCargo||'',proceso:s.proceso||s.procesoSupervision||'',contrato_asociado:s.contrato_asociado||s.contrato||num});
    }
    (c&&Array.isArray(c.supervisores)?c.supervisores:[]).forEach(add);
    add(c&&(c.supervisor_asociado||c.supervisor));
    (t&&Array.isArray(t.supervisores)?t.supervisores:[]).forEach(function(s){
      var sc=norm(s&&(s.contrato_asociado||s.contrato||s.numeroContrato));
      if(sc&&sc===num)add(s);
    });
    // Compatibilidad: si solo existe un contrato, un supervisor legado sí puede asociarse sin ambigüedad.
    if(!out.length&&t&&(t.contratos||[]).length===1){
      (t.supervisores||[]).forEach(add); add(t.supervisor);
    }
    return out;
  }
  function normalizeThird(t){
    if(!t)return t;
    t.nit=norm(t.nit||t.NIT);
    if(!Array.isArray(t.contratos))t.contratos=[];
    if(!Array.isArray(t.supervisores))t.supervisores=[];
    if(!t.dimsPorContrato||typeof t.dimsPorContrato!=='object')t.dimsPorContrato={};
    if(!t.promPorContrato||typeof t.promPorContrato!=='object')t.promPorContrato={};
    if(!t.aprobadoPorContrato||typeof t.aprobadoPorContrato!=='object')t.aprobadoPorContrato={};
    if(!t.respuestasACPorContrato||typeof t.respuestasACPorContrato!=='object')t.respuestasACPorContrato={};
    if(!t.borradoresACPorContrato||typeof t.borradoresACPorContrato!=='object')t.borradoresACPorContrato={};
    t.contratos=t.contratos.filter(Boolean).map(function(c){
      c.num=contractNum(c); c.numero=c.num;
      var sups=supervisorsFor(t,c);
      if(sups.length){
        c.supervisores=sups;
        c.supervisor=c.supervisor||sups[0].nombre;
        c.supervisor_asociado=c.supervisor_asociado||sups[0].nombre;
      }
      if(c.num&&(c.aprobado===true||c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'))t.aprobadoPorContrato[c.num]=true;
      return c;
    });
    return t;
  }
  function normalizeAll(save){ Object.keys(db()).forEach(function(n){db()[n]=normalizeThird(db()[n]);}); if(save)persistLocal(); }

  /* ------------------------------------------------------------------
   * 2) TABLA REGISTRO: desplegable estable + relación contrato/supervisor
   * ------------------------------------------------------------------ */
  var oldToggle=window.clsToggleExpandir;
  window.clsToggleExpandir=function(nit){
    nit=String(nit||'');
    var row=document.getElementById('exp-'+nit);
    if(!row){ if(typeof oldToggle==='function')return oldToggle.apply(this,arguments); return; }
    var open=row.style.display==='none'||getComputedStyle(row).display==='none';
    row.style.display=open?'table-row':'none';
    if(open)expandedNits.add(nit);else expandedNits.delete(nit);
    var prev=row.previousElementSibling;
    if(prev&&prev.cells&&prev.cells[0]){
      var cell=prev.cells[0],txt=cell.textContent||'';
      if(txt==='▶'||txt==='▼')cell.textContent=open?'▼':'▶';
      else{
        var btn=cell.querySelector('button,[data-expand]');if(btn)btn.textContent=open?'▼':'▶';
      }
    }
  };
  function decorateRegister(){
    Object.keys(db()).forEach(function(nit){
      var row=document.getElementById('exp-'+nit); if(!row||!row.cells||!row.cells[0])return;
      var t=normalizeThird(db()[nit]);
      var cell=row.cells[0],old=cell.querySelector('[data-sgrt-contract-supervisors="1"]');if(old)old.remove();
      var cons=(t.contratos||[]).filter(function(c){return contractNum(c);});
      if(!cons.length)return;
      var box=document.createElement('div');box.setAttribute('data-sgrt-contract-supervisors','1');
      box.style.cssText='margin:8px 0 10px;padding:9px 12px;background:#f8fbff;border:1px solid #dbeafe;border-radius:7px;font-size:11px;color:#334155;';
      box.innerHTML='<div style="font-weight:800;color:#1a3a5c;margin-bottom:5px;">Contratos y supervisores relacionados</div>'+cons.map(function(c){
        var sups=supervisorsFor(t,c);return '<div style="padding:3px 0;border-bottom:1px solid #eef2f7;"><b>Contrato '+esc(contractNum(c))+'</b> — '+(sups.length?esc(sups.map(function(s){return s.nombre;}).join(', ')):'<span style="color:#94a3b8;">Sin supervisor asociado</span>')+'</div>';
      }).join('');
      cell.insertBefore(box,cell.firstChild);
    });
  }
  var oldClsRender=window.clsRender;
  if(typeof oldClsRender==='function'){
    window.clsRender=function(){
      document.querySelectorAll('tr[id^="exp-"]').forEach(function(r){if(r.style.display!=='none'&&getComputedStyle(r).display!=='none')expandedNits.add(r.id.slice(4));});
      normalizeAll(false);
      var r=oldClsRender.apply(this,arguments);
      expandedNits.forEach(function(nit){var row=document.getElementById('exp-'+nit);if(row){row.style.display='table-row';var p=row.previousElementSibling;if(p&&p.cells&&p.cells[0]&&(p.cells[0].textContent==='▶'||p.cells[0].textContent==='▼'))p.cells[0].textContent='▼';}});
      decorateRegister();
      return r;
    };
  }

  /* ------------------------------------------------------------------
   * 3) CLASIFICACIÓN ESTRICTAMENTE POR CONTRATO Y EDITABLE
   * ------------------------------------------------------------------ */
  function currentClassDims(){
    try{ if(typeof cfDimsAgregadas!=='undefined'&&Array.isArray(cfDimsAgregadas))return cfDimsAgregadas; }catch(e){}
    return Array.isArray(window.cfDimsAgregadas)?window.cfDimsAgregadas:[];
  }
  function persistClassification(nit,contrato){
    nit=norm(nit);contrato=norm(contrato);if(!nit||!contrato||!db()[nit])return;
    var t=normalizeThird(db()[nit]),dims=currentClassDims().map(function(d){return {key:d.key,nombre:d.nombre,val:d.val,estado_aprobacion:approved(t,contrato)?'APROBADO':'PENDIENTE'};});
    if(!dims.length)return;
    t.dimsPorContrato[contrato]=clone(dims);
    t.contratoEval=contrato;
    t.dims=clone(dims);
    var vals=dims.map(function(d){return parseFloat(d.val);}).filter(function(v){return !isNaN(v);});
    var p=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0;
    t.promPorContrato[contrato]={prom:Number(p.toFixed(2)),zona:zoneFor(p)};
    t.prom=Number(p.toFixed(2));t.zona=zoneFor(p);
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===contrato;});
    if(c){c.clasificacion_lista=true;if(approved(t,contrato)){c.aprobado=true;c.estado_aprobacion='APROBADO';c.estado='Aprobado';}}
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    db()[nit]=t;persistLocal();scheduleRemote(t);broadcast('clasificacion',nit,contrato);
  }
  var oldGuardarVal=window.guardarValoracionTipologias;
  if(typeof oldGuardarVal==='function'){
    window.guardarValoracionTipologias=function(){
      var nit=norm((document.getElementById('cf-nit')||{}).value),c=norm((document.getElementById('cls-contrato-actual')||{}).value);
      var r=oldGuardarVal.apply(this,arguments);
      if(nit&&c)setTimeout(function(){persistClassification(nit,c);try{window._ctrlPoblarContratos&&window._ctrlPoblarContratos();}catch(e){}},0);
      return r;
    };
  }
  var oldClassChange=window._clasifCambiarContratoActual;
  if(typeof oldClassChange==='function'){
    window._clasifCambiarContratoActual=function(num){
      var nit=norm((document.getElementById('cf-nit')||{}).value),t=nit?db()[nit]:null,prev=t&&norm(t.contratoEval);
      if(nit&&prev&&prev!==norm(num)&&currentClassDims().length)persistClassification(nit,prev);
      var r=oldClassChange.apply(this,arguments);
      if(nit&&t&&num){
        var dims=dimsFor(t,num);
        try{
          if(typeof cfDimsAgregadas!=='undefined'){
            cfDimsAgregadas.length=0;
            dims.forEach(function(d){cfDimsAgregadas.push({id:'d_'+d.key+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),key:d.key,nombre:d.nombre,val:d.val==null?'':String(d.val),hasNA:false,hints:null,soloImpar:false});});
            window.cfDimsAgregadas=cfDimsAgregadas;
            if(typeof renderDimsAgregadas==='function')renderDimsAgregadas();
            if(typeof calcCfProm==='function')calcCfProm();
          }
        }catch(e){}
      }
      return r;
    };
  }

  /* ------------------------------------------------------------------
   * 4) CONFIGURACIÓN AC: contrato visible, tipologías exactas, activar/quitar por contrato
   * ------------------------------------------------------------------ */
  var oldCtrlContracts=window._ctrlPoblarContratos;
  if(typeof oldCtrlContracts==='function'){
    window._ctrlPoblarContratos=function(){
      var r=oldCtrlContracts.apply(this,arguments),s=document.getElementById('ctrl-contrato-sel'),l=document.getElementById('ctrl-contrato-label');
      if(s&&s.options&&s.options.length&&s.options[0].value!==''){s.style.display='';if(l)l.style.display='';}
      return r;
    };
  }
  var oldCtrlTodas=window.ctrlTodas;
  window.ctrlTodas=function(act){
    var nit=norm((document.getElementById('ctrl-terc-sel')||{}).value),contrato=norm((document.getElementById('ctrl-contrato-sel')||{}).value),tipId=norm((document.getElementById('ctrl-tip-sel')||{}).value);
    if(!nit||!contrato||!tipId){return typeof oldCtrlTodas==='function'?oldCtrlTodas.apply(this,arguments):undefined;}
    if(!act&&!confirm('¿Desactivar todos los controles activos de este contrato y tipología?'))return;
    var tip=window.getTip?window.getTip(tipId):null,key=norm(tip&&(tip.clave||tip.key)||tipId).toLowerCase();
    var p=window.ctrlGetPregs?window.ctrlGetPregs(tipId):[];
    window._persHiddenControls=window._persHiddenControls||{};
    var hKey=nit+'_'+contrato+'_'+key;
    window._persHiddenControls[hKey]=act?[]:p.map(function(x,i){return x.n||(i+1);});
    var t=db()[nit];if(t){t._persHiddenControls=clone(window._persHiddenControls);t._changed=true;t.sincronizado=false;}
    persistLocal();if(t)scheduleRemote(t);broadcast('config-ac',nit,contrato);
    try{window.renderCtrlLista&&window.renderCtrlLista();}catch(e){}
    toast(act?'Controles activados para el contrato':'Controles desactivados para el contrato','success',1800);
  };

  // El botón individual «Quitar / Activar» ya era por contrato, pero no avisaba
  // al resto de pestañas/roles ni programaba sincronización remota. Se conserva
  // su comportamiento y únicamente se añade persistencia/sincronización.
  var oldCtrlTgl=window.ctrlTgl;
  if(typeof oldCtrlTgl==='function'){
    window.ctrlTgl=function(){
      var nit=norm((document.getElementById('ctrl-terc-sel')||{}).value),contrato=norm((document.getElementById('ctrl-contrato-sel')||{}).value),r=oldCtrlTgl.apply(this,arguments);
      if(nit&&contrato&&db()[nit]){
        var t=normalizeThird(db()[nit]);t._persHiddenControls=clone(window._persHiddenControls||{});t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
        persistLocal();scheduleRemote(t);broadcast('config-ac',nit,contrato);
      }
      return r;
    };
  }

  /* ------------------------------------------------------------------
   * 5) EVALUADOR: selectores de contrato únicos + respuestas/borradores por contrato
   * ------------------------------------------------------------------ */
  function approvedContracts(t){
    var seen={};return (t&&t.contratos||[]).filter(function(c){var n=contractNum(c);if(!n||seen[n]||!approved(t,n))return false;seen[n]=1;return true;});
  }
  function setQuestionContractOptions(nit,kind){
    var t=normalizeThird(db()[nit]);if(!t)return;
    var cons=approvedContracts(t),sel=document.getElementById(kind==='q'?'q-contrato-sel':'ac-contrato-sel'),wrap=document.getElementById(kind==='q'?'q-contrato-wrap':'ac-contrato-wrap');
    if(!sel||!wrap)return;
    if(!cons.length){wrap.style.display='none';sel.innerHTML='<option value="">Sin contratos aprobados</option>';return;}
    var prev=norm(sel.value),wanted=cons.some(function(c){return contractNum(c)===prev;})?prev:(cons.some(function(c){return contractNum(c)===norm(t.contratoEval);})?norm(t.contratoEval):contractNum(cons[0]));
    sel.innerHTML=cons.map(function(c){var n=contractNum(c),sups=supervisorsFor(t,c),lab=n+(sups.length?' — '+sups.map(function(s){return s.nombre;}).join(', '):'');return '<option value="'+esc(n)+'">'+esc(lab)+'</option>';}).join('');
    sel.value=wanted;t.contratoEval=wanted;
    wrap.style.display=kind==='q'?'flex':'block';
    if(kind==='q'){try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){}}
  }
  window.qPoblarContratos=function(nit){setQuestionContractOptions(norm(nit),'q');};
  window.acPoblarContratos=function(nit){setQuestionContractOptions(norm(nit),'ac');};

  function activeQuestionContract(nit){
    var t=db()[nit]||{},q=norm((document.getElementById('q-contrato-sel')||{}).value),a=norm((document.getElementById('ac-contrato-sel')||{}).value);
    if(q)return q;if(a)return a;if(t.contratoEval)return norm(t.contratoEval);
    var cs=approvedContracts(t);return cs.length?contractNum(cs[0]):'';
  }
  function hasAnswerData(x){ return x&&Object.keys(x).some(function(k){return String(k).indexOf('__')!==0;}); }
  function ensureResponseMigration(nit,contrato){
    var t=normalizeThird(db()[nit]);if(!t||!contrato)return;
    if(!t.respuestasACPorContrato[contrato]){
      var legacy=clone(responses()[nit]||{});
      if(String(t.contratoEval||'')===String(contrato)&&hasAnswerData(legacy))t.respuestasACPorContrato[contrato]=legacy;
      else t.respuestasACPorContrato[contrato]={};
    }
  }
  function activateResponses(nit,contrato){
    if(!nit||!contrato||!db()[nit])return;
    var t=normalizeThird(db()[nit]);ensureResponseMigration(nit,contrato);
    var rr=clone(t.respuestasACPorContrato[contrato]||{});
    responses()[nit]=rr;
    try{if(typeof CUEST_RESPUESTAS!=='undefined')CUEST_RESPUESTAS[nit]=rr;}catch(e){}
    try{
      var shared=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');shared[nit]=rr;localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(shared));
    }catch(e2){}
    // El render antiguo usa una clave de borrador por NIT. La alimentamos con el borrador del contrato activo.
    try{
      var b=t.borradoresACPorContrato&&t.borradoresACPorContrato[contrato];
      if(b)localStorage.setItem('cuest_borrador_'+nit,JSON.stringify(b));else localStorage.removeItem('cuest_borrador_'+nit);
    }catch(e3){}
  }
  function stashResponses(nit,contrato,remote){
    if(!nit||!contrato||!db()[nit])return;
    var t=normalizeThird(db()[nit]);
    t.respuestasACPorContrato[contrato]=clone(responses()[nit]||{});
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    db()[nit]=t;persistLocal();if(remote!==false)scheduleRemote(t);broadcast('respuestas-ac',nit,contrato);
  }

  var oldLoadQuestionnaire=window.cargarCuestionarioTercero;
  if(typeof oldLoadQuestionnaire==='function'){
    window.cargarCuestionarioTercero=function(){
      var nit=norm((document.getElementById('q-tercero')||{}).value),t=nit?db()[nit]:null;
      if(t){setQuestionContractOptions(nit,'q');var c=activeQuestionContract(nit);if(c){t.contratoEval=c;activateResponses(nit,c);}}
      var r=oldLoadQuestionnaire.apply(this,arguments);
      return r;
    };
  }

  function wrapAnswerFunction(name){
    var old=window[name];if(typeof old!=='function')return;
    window[name]=function(){var r=old.apply(this,arguments),nit=norm((document.getElementById('q-tercero')||{}).value),c=activeQuestionContract(nit);if(nit&&c)stashResponses(nit,c,true);return r;};
  }
  wrapAnswerFunction('onChangeAtribCuest');
  wrapAnswerFunction('onChangeObsCuest');

  var oldDraft=window.guardarBorradorCuestionario;
  if(typeof oldDraft==='function'){
    window.guardarBorradorCuestionario=function(){
      var nit=norm((document.getElementById('q-tercero')||{}).value),c=activeQuestionContract(nit),r=oldDraft.apply(this,arguments);
      if(nit&&c&&db()[nit]){
        var t=normalizeThird(db()[nit]),fecha=new Date().toLocaleString('es-CO');
        t.borradoresACPorContrato[c]={nit:nit,contrato:c,fecha:fecha,respuestas:clone(responses()[nit]||{}),customCtrls:clone((window.CUEST_CTRL_CUSTOM||{})[nit]||{})};
        stashResponses(nit,c,true);persistLocal();scheduleRemote(t);broadcast('borrador-ac',nit,c);
      }
      return r;
    };
  }
  var oldSaveQuestionnaire=window.guardarCuestionarioCompleto;
  if(typeof oldSaveQuestionnaire==='function'){
    window.guardarCuestionarioCompleto=function(){
      var nit=norm((document.getElementById('q-tercero')||{}).value),c=activeQuestionContract(nit),r=oldSaveQuestionnaire.apply(this,arguments);
      if(nit&&c&&db()[nit]){
        stashResponses(nit,c,true);
        var t=normalizeThird(db()[nit]);t.acPorContrato=t.acPorContrato||{};
        t.acPorContrato[c]={guardado:true,fecha:new Date().toISOString(),respuestas:clone(t.respuestasACPorContrato[c]||{})};
        persistLocal();scheduleRemote(t);broadcast('ac-completo',nit,c);
      }
      return r;
    };
  }
  var oldQChange=window.qCambiarContrato;
  if(typeof oldQChange==='function'){
    window.qCambiarContrato=function(val){
      var nit=norm((document.getElementById('q-tercero')||{}).value),t=nit?db()[nit]:null,oldC=t?norm(t.contratoEval):'';
      if(nit&&oldC)stashResponses(nit,oldC,true);
      if(nit&&val)activateResponses(nit,norm(val));
      var r=oldQChange.apply(this,arguments);
      if(nit&&val&&t){t.contratoEval=norm(val);activateResponses(nit,norm(val));persistLocal();}
      return r;
    };
  }

  /* ------------------------------------------------------------------
   * 6) INFORMACIÓN GENERAL DEL EVALUADOR: contratos/supervisores y detalle solo de clasificación
   * ------------------------------------------------------------------ */
  function riskLevel(t){return t.nivel_riesgo||t.zona||t.Zona_Riesgo||t.ZonaRiesgo||'—';}
  function contractSupervisorHtml(t){
    var cons=(t.contratos||[]).filter(function(c){return contractNum(c);});if(!cons.length)return '<span style="color:var(--muted);">Sin contratos</span>';
    return '<div style="display:flex;flex-direction:column;gap:4px;">'+cons.map(function(c){var ss=supervisorsFor(t,c);return '<div style="font-size:10.8px;line-height:1.3;"><b style="color:#1a3a5c;">'+esc(contractNum(c))+'</b><span style="color:#64748b;"> — '+(ss.length?esc(ss.map(function(s){return s.nombre;}).join(', ')):'Sin supervisor')+'</span></div>';}).join('')+'</div>';
  }
  window.sgrtVerDetalleClasificacion=function(nit){
    var t=normalizeThird(db()[nit]);if(!t)return;
    var old=document.getElementById('sgrt-detalle-clasificacion-modal');if(old)old.remove();
    var d=document.createElement('div');d.id='sgrt-detalle-clasificacion-modal';d.className='overlay';d.style.cssText='display:flex;z-index:10080;';
    var cons=(t.contratos||[]).filter(function(c){return contractNum(c);});
    d.innerHTML='<div class="modal" style="width:760px;max-width:96vw;max-height:88vh;overflow:auto;"><div class="mh"><h3>Clasificación por contrato</h3><button class="mc-btn" onclick="document.getElementById(\'sgrt-detalle-clasificacion-modal\').remove()">✕</button></div><div class="mb" style="padding:16px;">'
      +(cons.length?cons.map(function(c){var num=contractNum(c),dims=dimsFor(t,num),pc=(t.promPorContrato||{})[num]||{},ss=supervisorsFor(t,c);return '<div style="border:1px solid #dbe3ea;border-radius:8px;margin-bottom:10px;overflow:hidden;"><div style="padding:10px 12px;background:#f8fafc;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;"><div><b style="color:#1a3a5c;">Contrato '+esc(num)+'</b><div style="font-size:10.5px;color:#64748b;margin-top:2px;">Supervisor(es): '+(ss.length?esc(ss.map(function(s){return s.nombre;}).join(', ')):'Sin supervisor asociado')+'</div></div><div style="font-size:11px;"><b>Promedio:</b> '+esc(pc.prom!=null?pc.prom:'—')+' · <b>Nivel:</b> '+esc(pc.zona||'—')+'</div></div><div style="padding:10px 12px;">'+(dims.length?dims.map(function(x){return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;"><span>'+esc(x.nombre||x.key)+'</span><b>'+esc(x.val==null?'—':x.val)+'</b></div>';}).join(''):'<div style="color:#94a3b8;font-size:11px;">Sin tipologías clasificadas para este contrato.</div>')+'</div></div>';}).join(''):'<div style="color:#64748b;">Este tercero no tiene contratos registrados.</div>')
      +'</div></div>';
    document.body.appendChild(d);
  };
  function renderEvaluatorGeneral(){
    if(!isEvaluator())return false;
    var body=document.getElementById('ig-tbody-terceros');if(!body)return false;
    var table=body.closest('table'),head=table&&table.querySelector('thead');
    if(head)head.innerHTML='<tr><th>NIT</th><th>Nombre</th><th>Domicilio</th><th>Contratos / Supervisores</th><th>Promedio</th><th>Nivel de riesgo</th><th>Acciones</th></tr>';
    var ent=norm((window.currentUser||{}).entidad).toLowerCase();
    var entries=Object.values(db()).filter(function(t){if(!t||!norm(t.nit||t.NIT))return false;if(!ent)return true;var te=norm(t.entidad||t.entidadId||t.organizacion).toLowerCase();return !te||te===ent;});
    body.innerHTML=entries.length?entries.map(function(t){t=normalizeThird(t);var nit=t.nit||t.NIT,p=parseFloat(t.prom||0),z=riskLevel(t),cl=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';return '<tr><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+esc(nit)+'</td><td style="font-size:12.5px;font-weight:700;">'+esc(t.nombre||t.NombreTercero||'—')+'</td><td style="font-size:11px;max-width:180px;">'+esc(t.domicilio||t.Domicilio||'—')+'</td><td style="min-width:230px;">'+contractSupervisorHtml(t)+'</td><td><span class="chip '+cl+'" style="font-size:10px;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td><td><span class="chip '+cl+'" style="font-size:10px;">'+esc(z)+'</span></td><td style="white-space:nowrap;"><button class="btn btn-outline btn-xs" onclick="window.sgrtVerDetalleClasificacion(\''+esc(nit)+'\')">👁 Ver detalle</button> <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+esc(nit)+'\');},120)">📁 Documentos</button></td></tr>';}).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">No hay terceros registrados.</td></tr>';
    var c=document.getElementById('ig-terc-count')||document.getElementById('ig-terceros-count');if(c)c.textContent=entries.length+' registro'+(entries.length!==1?'s':'');
    try{if(typeof filterIGTerceros==='function')filterIGTerceros();}catch(e){}
    return true;
  }
  var oldIG=window.loadIGTercerosFull;
  window.loadIGTercerosFull=function(){if(renderEvaluatorGeneral())return;return typeof oldIG==='function'?oldIG.apply(this,arguments):undefined;};
  window.renderIGTerceros=function(){return window.loadIGTercerosFull();};

  /* ------------------------------------------------------------------
   * 7) SUPERVISIÓN AC DEL ADMIN: filtro por contrato + solo preguntas activas
   * ------------------------------------------------------------------ */
  function responseForContract(t,nit,c){
    if(t.respuestasACPorContrato&&t.respuestasACPorContrato[c])return t.respuestasACPorContrato[c];
    if(norm(t.contratoEval)===norm(c))return responses()[nit]||{};
    return {};
  }
  function answerSummary(r){
    if(!r)return '<span style="color:#94a3b8;">Sin respuesta</span>';
    var vals=[];for(var i=1;i<=7;i++){var v=r['a'+i];if(v)vals.push(i+': '+v);}return vals.length?esc(vals.join(' · ')):'<span style="color:#94a3b8;">Sin respuesta</span>';
  }
  window.sgrtACSupervisionSetContract=function(v){window._sgrtACSupervisionContract=norm(v);try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}};
  function injectACSupervision(){
    if(!isRiskAdmin())return;
    var anchor=document.getElementById('rpt-tabla-wrap'),panel=document.getElementById('cq-panel-reportes');if(!panel)return;
    var old=document.getElementById('sgrt-ac-supervision-contract');if(old)old.remove();
    if(anchor)anchor.style.display='none'; // sustituye la tabla vieja que mostraba preguntas inactivas y un solo contrato.
    var allContracts=[],seen={};Object.values(db()).forEach(function(t){(t.contratos||[]).forEach(function(c){var n=contractNum(c);if(n&&!seen[n]){seen[n]=1;allContracts.push(n);}});});
    allContracts.sort();var selected=norm(window._sgrtACSupervisionContract||'');
    if(selected&&allContracts.indexOf(selected)<0)selected='';
    var rows=[];
    Object.values(db()).forEach(function(t){
      if(!t||!t.nit)return;t=normalizeThird(t);var nit=t.nit;
      (t.contratos||[]).forEach(function(c){
        var num=contractNum(c);if(!num||selected&&num!==selected)return;
        var dims=dimsFor(t,num),resp=responseForContract(t,nit,num),sups=supervisorsFor(t,c);
        dims.forEach(function(d){
          var ctrls=[];try{ctrls=window._ctrlsCuest?window._ctrlsCuest(nit,d.key,num):[];}catch(e){}
          ctrls.forEach(function(q){var rr=resp&&resp[d.key]&&resp[d.key][q.n];rows.push({tercero:t.nombre||nit,nit:nit,contrato:num,supervisores:sups.map(function(s){return s.nombre;}).join(', ')||'—',tip:window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key),n:q.n,pregunta:q.ctrl||q.req||('Control '+q.n),respuesta:rr,obs:rr&&rr.obs||''});});
        });
      });
    });
    var card=document.createElement('div');card.id='sgrt-ac-supervision-contract';card.className='card';card.style.marginBottom='16px';
    card.innerHTML='<div class="card-hdr" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;"><div><h3 style="margin:0;">Supervisión de Ambiente de Control por contrato</h3><div style="font-size:10.5px;color:#64748b;margin-top:2px;">Solo se muestran las preguntas activas configuradas para cada contrato.</div></div><div style="display:flex;align-items:center;gap:7px;"><label style="font-size:11px;font-weight:700;color:#475569;">Contrato:</label><select onchange="window.sgrtACSupervisionSetContract(this.value)" style="padding:7px 10px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los contratos</option>'+allContracts.map(function(n){return '<option value="'+esc(n)+'" '+(selected===n?'selected':'')+'>'+esc(n)+'</option>';}).join('')+'</select></div></div><div style="overflow:auto;max-height:620px;"><table style="width:100%;border-collapse:collapse;font-size:10.8px;min-width:980px;"><thead><tr style="background:#1a3a5c;color:white;position:sticky;top:0;z-index:2;"><th style="padding:8px;text-align:left;">Tercero</th><th style="padding:8px;text-align:left;">Contrato</th><th style="padding:8px;text-align:left;">Supervisor(es)</th><th style="padding:8px;text-align:left;">Tipología</th><th style="padding:8px;text-align:left;">Pregunta activa</th><th style="padding:8px;text-align:left;">Respuesta</th><th style="padding:8px;text-align:left;">Observaciones</th></tr></thead><tbody>'+(rows.length?rows.map(function(x,i){return '<tr style="border-bottom:1px solid #eef2f7;background:'+(i%2?'#fbfdff':'white')+';"><td style="padding:7px;"><b>'+esc(x.tercero)+'</b><div style="font-size:9.5px;color:#64748b;">'+esc(x.nit)+'</div></td><td style="padding:7px;font-weight:800;color:#78350f;">'+esc(x.contrato)+'</td><td style="padding:7px;">'+esc(x.supervisores)+'</td><td style="padding:7px;">'+esc(x.tip)+'</td><td style="padding:7px;max-width:300px;"><b>#'+esc(x.n)+'</b> '+esc(x.pregunta)+'</td><td style="padding:7px;max-width:260px;">'+answerSummary(x.respuesta)+'</td><td style="padding:7px;max-width:220px;">'+(x.obs?esc(x.obs):'<span style="color:#94a3b8;">—</span>')+'</td></tr>';}).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b;">No hay preguntas activas para el filtro seleccionado.</td></tr>')+'</tbody></table></div>';
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(card,anchor);else panel.appendChild(card);
  }
  var oldReports=window.renderReportesAC;
  if(typeof oldReports==='function'){
    window.renderReportesAC=function(){var r=oldReports.apply(this,arguments);try{injectACSupervision();}catch(e){console.warn('[SGRT30] Supervisión AC:',e);}return r;};
  }

  /* ------------------------------------------------------------------
   * 8) ANÁLISIS DE RIESGOS: contexto contrato + supervisor y persistencia
   * ------------------------------------------------------------------ */
  var oldNrContracts=window.nrPoblarContratos;
  window.nrPoblarContratos=function(idOnombre){
    if(typeof oldNrContracts==='function')oldNrContracts.apply(this,arguments);
    var sel=document.getElementById('nr-contrato');if(!sel||!idOnombre)return;
    var t=Object.values(db()).find(function(x){return x&&(x.nit===idOnombre||x.nombre===idOnombre);});if(!t)return;
    var prev=sel.value,seen={};
    var cons=(t.contratos||[]).filter(function(c){var n=contractNum(c);if(!n||seen[n])return false;seen[n]=1;return true;});
    sel.innerHTML='<option value="">Todos los contratos</option>'+cons.map(function(c){var n=contractNum(c),ss=supervisorsFor(t,c);return '<option value="'+esc(n)+'">'+esc(n+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):''))+'</option>';}).join('');
    if(cons.some(function(c){return contractNum(c)===prev;}))sel.value=prev;
  };
  var oldSaveRisk=window.guardarRiesgo;
  if(typeof oldSaveRisk==='function'){
    window.guardarRiesgo=function(){
      var tercero=norm((document.getElementById('nr-tercero')||{}).value),contrato=norm((document.getElementById('nr-contrato')||{}).value),ref=norm((document.getElementById('nr-ref')||{}).value),r=oldSaveRisk.apply(this,arguments);
      var t=Object.values(db()).find(function(x){return x&&(x.nombre===tercero||x.nit===tercero);});
      var list=window.MATRIZ_DB||[];var row=(ref&&list.find(function(x){return String(x.id)===ref;}))||list[list.length-1];
      if(row&&t){row.nit=t.nit;row.contrato=contrato||row.contrato||'';var c=(t.contratos||[]).find(function(x){return contractNum(x)===row.contrato;});row.supervisorContrato=c?supervisorsFor(t,c).map(function(s){return s.nombre;}).join(', '):'';}
      try{window._lsSave&&window._lsSave();}catch(e){}persistLocal();broadcast('analisis-riesgo',t&&t.nit||'',contrato);
      return r;
    };
  }

  /* ------------------------------------------------------------------
   * 9) SESIÓN PERSISTENTE HASTA CERRAR SESIÓN EXPLÍCITAMENTE
   * ------------------------------------------------------------------ */
  var oldLogin=window.doLogin;
  if(typeof oldLogin==='function'){
    window.doLogin=function(){
      var login=norm((document.getElementById('li-user')||{}).value).toLowerCase(),r=oldLogin.apply(this,arguments);
      setTimeout(function(){
        if(window.currentUser&&login){try{localStorage.setItem(SESSION_KEY,JSON.stringify({login:login,ts:Date.now()}));}catch(e){}}
      },20);
      return r;
    };
  }
  var oldLogout=window.doLogout;
  window.doLogout=function(){try{localStorage.removeItem(SESSION_KEY);}catch(e){}return typeof oldLogout==='function'?oldLogout.apply(this,arguments):undefined;};
  function restoreSession(){
    if(window.currentUser)return;
    var s=null;try{s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');}catch(e){}
    if(!s||!s.login||!window.USERS||!window.USERS[s.login])return;
    var u=document.getElementById('li-user'),p=document.getElementById('li-pass');if(!u||!p||typeof window.doLogin!=='function')return;
    u.value=s.login;p.value=window.USERS[s.login].pass||'';
    try{window.doLogin();}catch(e){}
    p.value='';
  }

  /* ------------------------------------------------------------------
   * 10) REFRESCO / RENDIMIENTO + sincronización sin cerrar formularios
   * ------------------------------------------------------------------ */
  function targetedRefresh(msg){
    normalizeAll(false);
    var pg=document.querySelector('.page.active'),id=pg&&pg.id;
    if(id==='pg-clasificacion'){try{window.clsRender&&window.clsRender();}catch(e){}}
    if(id==='pg-info-general'&&isEvaluator()){try{renderEvaluatorGeneral();}catch(e){}}
    if(id==='pg-ctrl-op'){try{window.renderCtrlLista&&window.renderCtrlLista();}catch(e){}try{window._ctrlFiltrarTipsPorTercero&&window._ctrlFiltrarTipsPorTercero();}catch(e){}}
    if(id==='pg-cuestionario'){
      if(isRiskAdmin()){try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}}
      else if(isEvaluator()&&msg&&msg.kind==='config-ac'){
        var focused=document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);if(!focused){try{window.cargarCuestionarioTercero&&window.cargarCuestionarioTercero();}catch(e){}}
      }
    }
  }
  if(bc)bc.onmessage=function(ev){targetedRefresh(ev.data||{});};
  window.addEventListener('storage',function(ev){if(ev.key==='sgrt_last_change_v1'||ev.key==='sgrt_terceros_db_shared'||ev.key==='sgrt_cuest_respuestas'){var m={};try{m=JSON.parse(ev.newValue||'{}');}catch(e){}targetedRefresh(m);}});

  // El intervalo de 5 s reconstruía la tabla completa y hacía lenta la página.
  // Se conserva sincronización remota periódica, pero a 12 s; los cambios locales se propagan por BroadcastChannel/storage inmediatamente.
  function tuneAutoRefresh(){
    try{if(window._AUTOREFRESH_INTERVAL)clearInterval(window._AUTOREFRESH_INTERVAL);}catch(e){}
    if(typeof window._sgrtRefreshCurrent==='function')window._AUTOREFRESH_INTERVAL=setInterval(function(){try{window._sgrtRefreshCurrent();}catch(e){}},12000);
  }
  function optimizeFrames(){
    document.querySelectorAll('iframe[src*="powerbi.com"]').forEach(function(f){f.setAttribute('loading','lazy');f.setAttribute('allow','fullscreen; clipboard-write');});
  }

  function refreshSharePointWhenReady(){
    // El módulo de SharePoint consulta el backend unos milisegundos después de
    // cargar. Si el usuario entra antes al repositorio, puede haberse pintado el
    // repositorio local. Reintentamos la vista una vez que el estado Graph ya
    // tuvo tiempo de resolverse, sin tocar credenciales ni backend.
    try{
      var pg=document.getElementById('pg-evidencias-repo');
      if(pg&&pg.classList.contains('active')&&typeof window.odInit==='function')window.odInit();
      var ap=document.getElementById('admin-pg-repo');
      if(ap&&ap.classList.contains('active')&&typeof window.adminOdInit==='function')window.adminOdInit();
    }catch(e){}
  }

  /* ------------------------------------------------------------------
   * 11) Guardado/importación: normalizar después de altas manuales/lote
   * ------------------------------------------------------------------ */
  function wrapPostSave(name){
    var old=window[name];if(typeof old!=='function'||old._sgrt30)return;
    var fn=function(){var r=old.apply(this,arguments);Promise.resolve(r).finally(function(){normalizeAll(true);decorateRegister();broadcast('registro');});return r;};fn._sgrt30=true;window[name]=fn;
  }
  wrapPostSave('guardarClasif');
  wrapPostSave('guardarIGTercero');
  wrapPostSave('sgrtConfirmarImportacion');

  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(function(){normalizeAll(true);restoreSession();tuneAutoRefresh();optimizeFrames();try{decorateRegister();}catch(e){}},180);
    setTimeout(function(){try{if(isEvaluator())renderEvaluatorGeneral();}catch(e){}},650);
    setTimeout(refreshSharePointWhenReady,1800);
  });
  // Si el script carga después de DOMContentLoaded (por caché/hot reload), aplicar igualmente.
  if(document.readyState!=='loading'){
    setTimeout(function(){normalizeAll(true);restoreSession();tuneAutoRefresh();optimizeFrames();},80);
    setTimeout(refreshSharePointWhenReady,1800);
  }

})();
