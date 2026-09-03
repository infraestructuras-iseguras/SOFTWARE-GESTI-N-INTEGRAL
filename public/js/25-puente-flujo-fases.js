/*
 * SGRT — Módulo 25: puente definitivo entre fases.
 * Registro -> Clasificación por contrato -> Aprobación -> Configuración AC -> Evaluador.
 * Este módulo NO cambia pantallas ni catálogos; solo unifica el contexto tercero/contrato/tipologías.
 */
(function(){
  'use strict';

  var CTX_KEY='sgrt_flujo_contexto_v1';
  var lastPull=0;

  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function db(){ return window.TERCEROS_DB || {}; }
  function toast(m,t,ms){ try{ if(window.showToast) window.showToast(m,t||'info',ms||2800); }catch(e){} }
  function normKey(k){
    k=String(k||'').trim().toLowerCase();
    var a={fc:'fr',rf:'fi',pais:'pa','riesgo_pais':'pa'};
    return a[k]||k;
  }
  function contractNum(c){ return String((c&&(c.num||c.numero||c.NoContrato))||'').trim(); }
  function approved(t,num){
    if(!t||!num)return false;
    if(t.aprobadoPorContrato&&t.aprobadoPorContrato[num])return true;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===String(num);});
    return !!(c&&(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true));
  }
  function valueDim(d){
    var v=d&&(d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel));
    v=parseFloat(v); return isNaN(v)?null:v;
  }
  function dimsFor(t,num){
    if(!t)return [];
    num=String(num||'').trim();
    var arr=[];
    if(num&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num])&&t.dimsPorContrato[num].length){
      arr=t.dimsPorContrato[num];
    }else if(num&&String(t.contratoEval||'')===num&&Array.isArray(t.dims)&&t.dims.length){
      arr=t.dims;
    }else if(!num&&t.dimsPorContrato&&typeof t.dimsPorContrato==='object'){
      Object.keys(t.dimsPorContrato).forEach(function(k){
        (t.dimsPorContrato[k]||[]).forEach(function(d){
          if(d&&!arr.some(function(x){return normKey(x.key)===normKey(d.key);}))arr.push(d);
        });
      });
    }
    if(!arr.length&&Array.isArray(t.dims)&&t.dims.length)arr=t.dims;
    if(!arr.length&&Array.isArray(t.tipologias)&&t.tipologias.length)arr=t.tipologias;
    return arr.filter(function(d){return d&&normKey(d.key);}).map(function(d){
      var x=clone(d)||{}; x.key=normKey(x.key); return x;
    });
  }
  function promFor(t,num,dims){
    var pc=t&&t.promPorContrato&&t.promPorContrato[num];
    var p=parseFloat(pc&&pc.prom);
    if(!isNaN(p))return p;
    var vals=(dims||dimsFor(t,num)).map(valueDim).filter(function(v){return v!==null;});
    if(vals.length)return vals.reduce(function(a,b){return a+b;},0)/vals.length;
    p=parseFloat(t&&(t.prom!==undefined?t.prom:t.promedio));
    return isNaN(p)?0:p;
  }
  function zonaFor(p){ return p>=4?'EXTREMO':p>3?'ALTO':p>=2?'MODERADO':'BAJO'; }
  function setCtx(nit,num){
    var c={nit:String(nit||''),contrato:String(num||''),ts:Date.now()};
    window._sgrtFlowContext=c;
    try{localStorage.setItem(CTX_KEY,JSON.stringify(c));}catch(e){}
    return c;
  }
  function getCtx(){
    if(window._sgrtFlowContext&&window._sgrtFlowContext.nit)return window._sgrtFlowContext;
    try{var c=JSON.parse(localStorage.getItem(CTX_KEY)||'{}');if(c&&c.nit){window._sgrtFlowContext=c;return c;}}catch(e){}
    return {nit:'',contrato:''};
  }
  function directSave(){
    var d=db();
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));}catch(e){}
    try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');s.TERCEROS_DB=d;s.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM||s.TIPOLOGIAS_DB_CUSTOM||{};s.PERS_HIDDEN=window._persHiddenControls||s.PERS_HIDDEN||{};localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e2){}
  }
  function syncLegacy(t,num){
    if(!t)return [];
    var dims=dimsFor(t,num);
    if(num){
      t.contratoEval=String(num);
      if(!t.dimsPorContrato)t.dimsPorContrato={};
      if(dims.length)t.dimsPorContrato[num]=clone(dims);
    }
    if(dims.length){
      t.dims=clone(dims);
      t.tipologias=dims.map(function(d){return {key:normKey(d.key),nombre:d.nombre||d.tipologia||d.key,val:d.val};});
    }
    var p=promFor(t,num,dims);
    if(p){t.prom=Number(p.toFixed(2));t.zona=zonaFor(p);}
    return dims;
  }
  function persistThird(t,remote){
    if(!t||!t.nit)return;
    db()[t.nit]=t;
    directSave();
    try{if(window._lsSave)window._lsSave();}catch(e){}
    if(remote!==false&&window._sgrtUpsertEstadoCompleto){
      Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).catch(function(){});
    }
  }
  function mirrorConfigIntoThird(nit){
    nit=String(nit||''); var t=db()[nit]; if(!t)return;
    t._tipologiasDBCustom=clone(window.TIPOLOGIAS_DB_CUSTOM||{});
    t._persHiddenControls=clone(window._persHiddenControls||{});
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    db()[nit]=t; directSave();
    if(window._sgrtUpsertEstadoCompleto)Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).catch(function(){});
  }
  function restoreRemoteConfig(){
    var merged=false;
    Object.values(db()).forEach(function(t){
      if(t&&t._tipologiasDBCustom&&typeof t._tipologiasDBCustom==='object'){
        window.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM||{};
        Object.keys(t._tipologiasDBCustom).forEach(function(ent){
          window.TIPOLOGIAS_DB_CUSTOM[ent]=Object.assign(window.TIPOLOGIAS_DB_CUSTOM[ent]||{},clone(t._tipologiasDBCustom[ent]||{}));
        });
        merged=true;
      }
      if(t&&t._persHiddenControls&&typeof t._persHiddenControls==='object'){
        window._persHiddenControls=Object.assign(window._persHiddenControls||{},clone(t._persHiddenControls));
        merged=true;
      }
    });
    if(merged)directSave();
  }

  window._sgrtGetContractDims=dimsFor;
  window._sgrtGetContractProm=promFor;

  // ---------------------------------------------------------------------------
  // APROBACIÓN: idempotente. Un clic aprueba; nunca vuelve a desaprobar por error.
  // Promedio exigido: estrictamente > 3.
  // ---------------------------------------------------------------------------
  window._aprToggleContrato=function(nit,num){
    nit=String(nit||'').trim(); num=String(num||'').trim();
    var t=db()[nit];
    if(!t){toast('No se encontró el tercero '+nit,'error',3000);return false;}
    var dims=dimsFor(t,num);
    if(!num){toast('Selecciona un contrato para aprobar','warning',2800);return false;}
    if(!dims.length){toast('No se puede aprobar: este contrato todavía no tiene tipologías clasificadas.','warning',4000);return false;}
    if(dims.length>5){toast('No se puede aprobar: el contrato tiene más de 5 tipologías.','error',4000);return false;}
    var sin=dims.filter(function(d){return valueDim(d)===null;});
    if(sin.length){toast('No se puede aprobar: califica todas las tipologías del contrato.','warning',4000);return false;}
    var p=promFor(t,num,dims);
    if(!(p>3)){toast('No se puede aprobar: el promedio del contrato debe ser mayor de 3. Promedio actual: '+p.toFixed(2),'warning',4500);return false;}
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});
    if(!c){toast('No se puede aprobar: no se encontró el contrato '+num+'.','error',3500);return false;}

    t.aprobadoPorContrato=t.aprobadoPorContrato||{};
    t.aprobadoPorContrato[num]=true;
    c.num=num;c.numero=num;c.estado_aprobacion='APROBADO';c.aprobado=true;c.estado='Aprobado';c.clasificacion_lista=true;
    dims.forEach(function(d){d.estado_aprobacion='APROBADO';});
    t.dimsPorContrato=t.dimsPorContrato||{};t.dimsPorContrato[num]=clone(dims);
    t.promPorContrato=t.promPorContrato||{};t.promPorContrato[num]={prom:Number(p.toFixed(2)),zona:zonaFor(p)};
    t.aprobado_clasif=t.aprobado_clasif||new Date().toISOString();
    t.habilitado_ac=true;t.estado='Aprobado';t.clasificacion_lista=true;
    syncLegacy(t,num);
    t._tipologiasDBCustom=clone(window.TIPOLOGIAS_DB_CUSTOM||{});
    t._persHiddenControls=clone(window._persHiddenControls||{});
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    setCtx(nit,num);
    persistThird(t,true);

    // Verde visible antes del salto de pantalla.
    try{
      document.querySelectorAll('[data-sgrt-aprobar-nit][data-sgrt-aprobar-contrato]').forEach(function(btn){
        if(btn.getAttribute('data-sgrt-aprobar-nit')===nit&&btn.getAttribute('data-sgrt-aprobar-contrato')===num){
          btn.textContent='✓ Aprobado';btn.disabled=true;btn.style.background='#16a34a';btn.style.color='#fff';btn.style.borderColor='#15803d';btn.style.boxShadow='0 2px 7px rgba(22,163,74,.25)';btn.style.opacity='1';
        }
      });
    }catch(e){}
    toast('✅ Contrato '+num+' aprobado. Abriendo Ambiente de Control…','success',2600);

    setTimeout(function(){
      try{
        var nav=document.querySelector('.nav-item[onclick*="pg-ctrl-op"]');
        if(window.navTo)window.navTo(nav||null,'pg-ctrl-op');
        else if(window.goPage)window.goPage(nav||null,'pg-ctrl-op');
      }catch(e){}
      setTimeout(function(){
        try{if(window.renderCtrlOp)window.renderCtrlOp();}catch(e){}
        setTimeout(function(){activateControlContext(nit,num);},40);
      },60);
    },420);
    return true;
  };

  // ---------------------------------------------------------------------------
  // CONFIGURACIÓN AMBIENTE DE CONTROL: leer tipologías del contrato, no t.dims
  // global. Así 2 tipologías clasificadas => exactamente esas 2 en el desplegable.
  // ---------------------------------------------------------------------------
  function catalogTips(){
    try{return (window.getDBTips?window.getDBTips(window.getEntidad?window.getEntidad():'colpensiones'):[]).filter(function(t){return t&&t.activo!==false;});}catch(e){return [];}
  }
  function tipMatchesDim(tp,d){
    var tk=normKey(tp&&(tp.clave||tp.key)); var dk=normKey(d&&d.key);
    if(tk&&dk&&tk===dk)return true;
    var tn=String(tp&&(tp.nombre_tipologia||tp.nombre)||'').toLowerCase();
    var dn=String(d&&(d.nombre||d.tipologia)||'').toLowerCase();
    return !!(tn&&dn&&(tn===dn||tn.indexOf(dn)>=0||dn.indexOf(tn)>=0));
  }

  window._ctrlPoblarContratos=function(){
    var st=document.getElementById('ctrl-terc-sel'),sc=document.getElementById('ctrl-contrato-sel'),lb=document.getElementById('ctrl-contrato-label');
    if(!st||!sc||!lb)return;
    var nit=st.value||'',t=nit?db()[nit]:null,ctx=getCtx();
    var cons=(t&&t.contratos||[]).filter(function(c){var n=contractNum(c);return n&&dimsFor(t,n).length;});
    if(!cons.length){sc.innerHTML='<option value="">Sin contratos clasificados</option>';sc.value='';sc.style.display='none';lb.style.display='none';return;}
    var preferred=(ctx.nit===nit&&ctx.contrato)||t.contratoEval||contractNum(cons[0]);
    if(!cons.some(function(c){return contractNum(c)===preferred;}))preferred=contractNum(cons[0]);
    sc.innerHTML=cons.map(function(c){var n=contractNum(c);return '<option value="'+n.replace(/"/g,'&quot;')+'">'+n+(approved(t,n)?' · Aprobado':' · Clasificado')+'</option>';}).join('');
    sc.value=preferred;
    // Con un solo contrato se puede ocultar el selector, pero SU VALOR queda activo.
    sc.style.display=cons.length>1?'':'none';lb.style.display=cons.length>1?'':'none';
    syncLegacy(t,preferred);setCtx(nit,preferred);directSave();
  };

  window._ctrlFiltrarTipsPorTercero=function(){
    var st=document.getElementById('ctrl-terc-sel'),sp=document.getElementById('ctrl-tip-sel'),sc=document.getElementById('ctrl-contrato-sel');
    if(!sp)return;
    var nit=(st&&st.value)||'',t=nit?db()[nit]:null,ctx=getCtx();
    var num=(sc&&sc.value)||((ctx.nit===nit&&ctx.contrato)?ctx.contrato:'')||(t&&t.contratoEval)||'';
    var dims=t?dimsFor(t,num):[];
    if(t&&num)syncLegacy(t,num);
    var tips=catalogTips();
    if(nit){tips=tips.filter(function(tp){return dims.some(function(d){return tipMatchesDim(tp,d);});});}
    var old=sp.value;
    sp.innerHTML='<option value="">-- Selecciona una tipología --</option>'+tips.map(function(tp){return '<option value="'+tp.id_tipologia+'" data-key="'+normKey(tp.clave||tp.key)+'">'+(tp.nombre_tipologia||tp.nombre||tp.clave)+'</option>';}).join('');
    var keep=[].some.call(sp.options,function(o){return o.value===old&&o.value!=='';});
    if(keep)sp.value=old;else if(nit&&tips.length)sp.value=String(tips[0].id_tipologia);else sp.value='';
    var empty=document.getElementById('ctrl-empty');
    if(empty&&nit&&!tips.length){empty.style.display='block';empty.innerHTML='<div style="font-size:20px;margin-bottom:8px;">⚠</div><div>Este contrato no tiene tipologías clasificadas.</div>';}
    try{if(window.renderCtrlLista)window.renderCtrlLista();}catch(e){}
    try{if(window.renderCtrlTerceros)window.renderCtrlTerceros();}catch(e){}
    if(nit&&tips.length)toast('✓ '+tips.length+' tipología'+(tips.length!==1?'s':'')+' cargada'+(tips.length!==1?'s':'')+' para '+(num?'el contrato '+num:'este tercero'),'success',1400);
  };

  function activateControlContext(nit,num){
    var t=db()[nit];if(!t)return;
    syncLegacy(t,num);setCtx(nit,num);directSave();
    var st=document.getElementById('ctrl-terc-sel');
    if(st){
      if(![].some.call(st.options,function(o){return o.value===nit;})){
        var o=document.createElement('option');o.value=nit;o.textContent=(t.nombre||nit)+' ('+nit+')';st.appendChild(o);
      }
      st.value=nit;
    }
    try{window._ctrlPoblarContratos();}catch(e){}
    var sc=document.getElementById('ctrl-contrato-sel');
    if(sc&&[].some.call(sc.options,function(o){return o.value===num;}))sc.value=num;
    try{window._ctrlFiltrarTipsPorTercero();}catch(e){}
    try{if(window.renderCtrlLista)window.renderCtrlLista();}catch(e){}
    // Si el usuario cambia de contrato, refrescar también las tipologías.
    if(sc&&!sc.dataset.sgrtBridge){
      sc.dataset.sgrtBridge='1';
      sc.addEventListener('change',function(){
        var n=st&&st.value||'';var tt=db()[n];if(tt){syncLegacy(tt,this.value);setCtx(n,this.value);directSave();}
        window._ctrlFiltrarTipsPorTercero();
      });
    }
  }

  function wireControlPage(){
    var st=document.getElementById('ctrl-terc-sel'),sc=document.getElementById('ctrl-contrato-sel');
    if(st&&!st.dataset.sgrtBridge){
      st.dataset.sgrtBridge='1';
      st.addEventListener('change',function(){
        var nit=this.value||'';
        setTimeout(function(){
          try{window._ctrlPoblarContratos();}catch(e){}
          var csel=document.getElementById('ctrl-contrato-sel');
          var num=(csel&&csel.value)||((db()[nit]||{}).contratoEval)||'';
          if(nit&&db()[nit]&&num){syncLegacy(db()[nit],num);setCtx(nit,num);directSave();}
          try{window._ctrlFiltrarTipsPorTercero();}catch(e){}
        },0);
      });
    }
    if(sc&&!sc.dataset.sgrtBridge){
      sc.dataset.sgrtBridge='1';
      sc.addEventListener('change',function(){
        var n=st&&st.value||'',tt=n?db()[n]:null;
        if(tt&&this.value){syncLegacy(tt,this.value);setCtx(n,this.value);directSave();}
        try{window._ctrlFiltrarTipsPorTercero();}catch(e){}
      });
    }
  }

  var oldRenderCtrlOp=window.renderCtrlOp;
  if(typeof oldRenderCtrlOp==='function'){
    window.renderCtrlOp=function(){
      var r=oldRenderCtrlOp.apply(this,arguments);
      setTimeout(function(){
        wireControlPage();
        var c=getCtx();
        if(c.nit&&db()[c.nit])activateControlContext(c.nit,c.contrato||db()[c.nit].contratoEval||'');
        else {
          var st=document.getElementById('ctrl-terc-sel');
          if(st&&st.value){try{window._ctrlPoblarContratos();window._ctrlFiltrarTipsPorTercero();}catch(e){}}
        }
      },0);
      return r;
    };
  }

  // Mantener los controles configurados disponibles también cuando se cambia de rol/navegador.
  var oldSaveTip=window.saveTipCustom;
  if(typeof oldSaveTip==='function'){
    window.saveTipCustom=function(){
      var r=oldSaveTip.apply(this,arguments);
      var st=document.getElementById('ctrl-terc-sel'),ctx=getCtx(),nit=(st&&st.value)||ctx.nit;
      if(nit)mirrorConfigIntoThird(nit);
      else Object.values(db()).forEach(function(t){if(t&&t.nit&&(t.dims&&t.dims.length||(t.dimsPorContrato&&Object.keys(t.dimsPorContrato).length)))mirrorConfigIntoThird(t.nit);});
      return r;
    };
  }
  var oldCtrlTgl=window.ctrlTgl;
  if(typeof oldCtrlTgl==='function'){
    window.ctrlTgl=function(){var r=oldCtrlTgl.apply(this,arguments);var st=document.getElementById('ctrl-terc-sel'),c=getCtx(),nit=(st&&st.value)||c.nit;if(nit)mirrorConfigIntoThird(nit);else Object.values(db()).forEach(function(t){if(t&&t.nit&&(t.dims&&t.dims.length||(t.dimsPorContrato&&Object.keys(t.dimsPorContrato).length)))mirrorConfigIntoThird(t.nit);});return r;};
  }

  // ---------------------------------------------------------------------------
  // EVALUADOR: desplegable = terceros con por lo menos UN contrato aprobado.
  // Las tipologías son las aprobadas del contrato seleccionado.
  // ---------------------------------------------------------------------------
  var oldAcSelector=window.acPoblarSelectorTerceroInstruc;
  window.acPoblarSelectorTerceroInstruc=function(){
    try{if(oldAcSelector)oldAcSelector.apply(this,arguments);}catch(e){}
    var sel=document.getElementById('ac-tercero-instruc'),q=document.getElementById('q-tercero');if(!sel)return;
    var prev=sel.value||'',ctx=getCtx(),seen={};
    sel.innerHTML='<option value="">— Selecciona un tercero —</option>';
    if(q)q.innerHTML='<option value=""></option>';
    Object.values(db()).forEach(function(t){
      if(!t||!t.nit)return;
      var ok=(t.contratos||[]).some(function(c){return approved(t,contractNum(c));});
      if(!ok||seen[t.nit])return;seen[t.nit]=1;
      var o=document.createElement('option');o.value=t.nit;o.textContent=(t.nombre||t.nit)+' ('+t.nit+')';sel.appendChild(o);
      if(q){var o2=o.cloneNode(true);q.appendChild(o2);}
    });
    var wanted=(ctx.nit&&seen[ctx.nit])?ctx.nit:(seen[prev]?prev:'');
    if(wanted){sel.value=wanted;if(q)q.value=wanted;var tt=db()[wanted];var num=(ctx.nit===wanted&&ctx.contrato)||tt.contratoEval||'';if(num)syncLegacy(tt,num);}
    if(wanted){try{window.acPoblarContratos(wanted);}catch(e){}try{window.qPoblarContratos(wanted);}catch(e){}try{window.poblarSelectorACTipologia();}catch(e){}}
  };

  var oldAcChange=window.acCambiarTerceroInstruc;
  window.acCambiarTerceroInstruc=function(){
    var r;try{if(oldAcChange)r=oldAcChange.apply(this,arguments);}catch(e){}
    var sel=document.getElementById('ac-tercero-instruc'),nit=sel&&sel.value||'',t=nit?db()[nit]:null;
    if(t){
      var nums=(t.contratos||[]).map(contractNum).filter(function(n){return approved(t,n);});
      var num=(nums.indexOf(t.contratoEval)>=0?t.contratoEval:nums[0])||'';
      if(num){syncLegacy(t,num);setCtx(nit,num);directSave();}
      try{window.acPoblarContratos(nit);}catch(e){}
      var ac=document.getElementById('ac-contrato-sel');if(ac&&num&&[].some.call(ac.options,function(o){return o.value===num;}))ac.value=num;
      try{window.poblarSelectorACTipologia();}catch(e){}
    }
    return r;
  };

  // Al cambiar contrato en Evaluador, siempre reemplazar t.dims por las del contrato aprobado.
  var oldAcContract=window.acCambiarContrato;
  window.acCambiarContrato=function(val){
    var nit=(document.getElementById('ac-tercero-instruc')||{}).value||'';var t=nit?db()[nit]:null;
    if(t&&val){syncLegacy(t,val);setCtx(nit,val);directSave();}
    var r;try{if(oldAcContract)r=oldAcContract.apply(this,arguments);}catch(e){}
    try{window.poblarSelectorACTipologia();}catch(e){}return r;
  };
  var oldQContract=window.qCambiarContrato;
  window.qCambiarContrato=function(val){
    var nit=(document.getElementById('q-tercero')||{}).value||'';var t=nit?db()[nit]:null;
    if(t&&val){syncLegacy(t,val);setCtx(nit,val);directSave();}
    var r;try{if(oldQContract)r=oldQContract.apply(this,arguments);}catch(e){}
    try{window.poblarSelectorACTipologia();}catch(e){}return r;
  };

  // Estado/progreso de tipologías: usar el contrato activo, no una lista global vieja.
  var oldEstadoTips=window.acMostrarEstadoTipologias;
  if(typeof oldEstadoTips==='function')window.acMostrarEstadoTipologias=function(nit){var t=db()[nit],c=getCtx();if(t)syncLegacy(t,(c.nit===nit&&c.contrato)||t.contratoEval||'');return oldEstadoTips.apply(this,arguments);};
  window.getTipsTercero=function(nit){var t=db()[nit];if(!t)return[];var c=getCtx(),dims=dimsFor(t,(c.nit===nit&&c.contrato)||t.contratoEval||'');return dims.map(function(d){return window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key);}).filter(Boolean);};

  // Restaurar configuración compartida que venga del estado remoto.
  var oldServerLoad=window.sgrtCargarDesdeServidor;
  if(typeof oldServerLoad==='function'){
    window.sgrtCargarDesdeServidor=async function(){var r=await oldServerLoad.apply(this,arguments);restoreRemoteConfig();return r;};
  }

  // ---------------------------------------------------------------------------
  // BD -> Sistema: al volver a la ventana o entrar en una fase, refrescar desde Azure.
  // No tira cambios locales pendientes: si existe _changed, espera a que se sincronice.
  // ---------------------------------------------------------------------------
  function safePull(force){
    if(!window.sgrtCargarDesdeServidor)return;
    var dirty=Object.values(db()).some(function(t){return t&&t._changed;});
    if(dirty&&!force)return;
    var now=Date.now();if(!force&&now-lastPull<6000)return;lastPull=now;
    Promise.resolve(window.sgrtCargarDesdeServidor({selectNit:getCtx().nit||''})).then(function(){restoreRemoteConfig();}).catch(function(){});
  }
  var oldNav=window.navTo;
  if(typeof oldNav==='function'){
    window.navTo=function(el,page){var r=oldNav.apply(this,arguments);if(['pg-clasificacion','pg-aprobar-op','pg-ctrl-op','pg-cuestionario','pg-info-general'].indexOf(String(page||''))>=0)setTimeout(function(){safePull(false);},120);return r;};
  }
  window.addEventListener('focus',function(){safePull(false);});
  setInterval(function(){safePull(false);},20000);

  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(function(){restoreRemoteConfig();var c=getCtx();if(c.nit&&db()[c.nit])syncLegacy(db()[c.nit],c.contrato||db()[c.nit].contratoEval||'');directSave();},700);
  });

  // Pequeño API de prueba para validar el flujo sin depender de la UI.
  window._sgrtFlowBridgeTest={dimsFor:dimsFor,promFor:promFor,approved:approved,normKey:normKey};
})();
