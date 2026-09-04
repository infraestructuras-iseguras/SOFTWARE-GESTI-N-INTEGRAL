/*
 * SGRT — Ajuste 35 (2026-09-04)
 * Correcciones puntuales, sin alterar diseño/base de datos:
 * 1) Reportes AC (Administrador de Riesgos): "Tipologías evaluadas" se consulta
 *    mediante Ver detalle, agrupado por Contrato -> Supervisor(es) -> Tipologías.
 * 2) Evaluador / Ambiente de Control: el selector de tipologías se alimenta SIEMPRE
 *    de las tipologías aprobadas del contrato seleccionado y el cuestionario usa
 *    la configuración de preguntas activas de ese mismo contrato.
 */
(function(){
  'use strict';

  function norm(v){ return String(v==null?'':v).trim(); }
  function low(v){ return norm(v).toLowerCase(); }
  function esc(v){ return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function db(){ return window.TERCEROS_DB||{}; }
  function contractNum(c){ return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato)); }
  function role(){ return low((window.currentUser||{}).rol||''); }
  function isRiskAdmin(){ var r=role(); return r==='operativo'||r==='admin_riesgos'||r.indexOf('administrador de riesgos')>=0||r.indexOf('riesgos')>=0; }
  function isEvaluator(){ var r=role(); return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0; }

  function approved(t,num){
    num=norm(num); if(!t||!num) return false;
    if(t.aprobadoPorContrato&&t.aprobadoPorContrato[num]) return true;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});
    return !!(c&&(c.aprobado===true||c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'));
  }

  function approvedContracts(t){
    var seen={};
    return (t&&t.contratos||[]).filter(function(c){
      var n=contractNum(c); if(!n||seen[n]||!approved(t,n)) return false; seen[n]=1; return true;
    });
  }

  function dimsFor(t,num){
    if(!t) return [];
    num=norm(num);
    try{
      if(typeof window._sgrtGetContractDims==='function'){
        var z=window._sgrtGetContractDims(t,num);
        if(Array.isArray(z)&&z.length) return z;
      }
    }catch(e){}
    if(num&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num])&&t.dimsPorContrato[num].length) return t.dimsPorContrato[num];
    if(num&&t.tipologiasPorContrato&&Array.isArray(t.tipologiasPorContrato[num])&&t.tipologiasPorContrato[num].length) return t.tipologiasPorContrato[num];
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});
    if(c){
      if(Array.isArray(c.dims)&&c.dims.length) return c.dims;
      if(Array.isArray(c.tipologias)&&c.tipologias.length) return c.tipologias;
      if(Array.isArray(c.clasificacion)&&c.clasificacion.length) return c.clasificacion;
    }
    if(num&&norm(t.contratoEval)===num&&Array.isArray(t.dims)&&t.dims.length) return t.dims;
    return [];
  }

  function aliasKey(k){
    k=low(k).replace(/\s+/g,' ');
    var direct={fc:'fr',rf:'fi',pais:'pa','riesgo_pais':'pa'};
    if(direct[k]) return direct[k];
    var names={
      'riesgo operacional':'op','operacional':'op','procesos soportados por el tercero':'op',
      'continuidad de negocio':'cn','importancia en la continuidad de negocio':'cn',
      'seguridad de la información y ciberseguridad':'si','seguridad de la informacion y ciberseguridad':'si','seguridad de la información':'si','seguridad de la informacion':'si','acceso a la información':'si','acceso a la informacion':'si',
      'cumplimiento regulatorio':'cu','cumplimiento':'cu',
      'fraude y corrupción':'fr','fraude y corrupcion':'fr','fraude/corrupción':'fr','fraude/corrupcion':'fr',
      'laft':'laft','lavado de activos y financiacion del terrorismo':'laft','lavado de activos y financiación del terrorismo':'laft',
      'capacidad financiera':'fi','financiero':'fi','riesgo país':'pa','riesgo pais':'pa','reputacional':'reputacional'
    };
    if(names[k]) return names[k];
    var found=Object.keys(names).find(function(n){return k.indexOf(n)>=0||n.indexOf(k)>=0;});
    return found?names[found]:k.replace(/[^a-z0-9_]/g,'');
  }

  function dimKey(d){
    if(!d) return '';
    var k=norm(d.key||d.clave||d.codigo||d.tipologia_key);
    if(k) return aliasKey(k);
    var id=norm(d.id_tipologia||d.idTipologia||d.id);
    if(id){
      try{
        var tips=window.getDBTips?window.getDBTips(window.getEntidad?window.getEntidad():null):[];
        var tp=tips.find(function(x){return String(x.id_tipologia)===id;});
        if(tp) return aliasKey(tp.clave||tp.key||tp.nombre_tipologia);
      }catch(e){}
    }
    return aliasKey(d.nombre||d.nombre_tipologia||d.tipologia||d.label||'');
  }

  function tipName(d){
    if(!d) return '';
    try{
      if(typeof window._nombreTipologia==='function'){
        var n=norm(window._nombreTipologia(d));
        if(n) return n;
      }
    }catch(e){}
    var raw=norm(d.nombre||d.nombre_tipologia||d.tipologia||d.label);
    if(raw) return raw;
    var key=dimKey(d);
    try{
      var tips=window.getDBTips?window.getDBTips(window.getEntidad?window.getEntidad():null):[];
      var tp=tips.find(function(x){return aliasKey(x.clave||x.key||x.nombre_tipologia)===key;});
      if(tp) return norm(tp.nombre_tipologia||tp.nombre||key);
    }catch(e2){}
    return key||'Tipología';
  }

  function supervisorsFor(t,c){
    var num=contractNum(c),out=[],seen={};
    function add(s,forced){
      if(!s) return;
      if(typeof s==='string') s={nombre:s};
      var name=norm(s.nombre||s.name||s.supervisor||s.SupervisorNombre); if(!name) return;
      var cn=norm(s.contrato_asociado||s.contratoAsociado||s.contrato||s.numeroContrato||forced||num);
      if(cn&&num&&cn!==num) return;
      var key=low(name)+'|'+low(cn||num); if(seen[key]) return; seen[key]=1;
      out.push({nombre:name,cargo:norm(s.cargo||s.supervisorCargo||s.cargo_supervisor),proceso:norm(s.proceso||s.procesoSupervision||s.proceso_supervision)});
    }
    try{
      if(typeof window.sgrtSupervisoresContrato==='function'){
        var arr=window.sgrtSupervisoresContrato(t.nit||t.NIT,num);
        if(Array.isArray(arr)) arr.forEach(function(s){add(s,num);});
      }
    }catch(e){}
    (Array.isArray(c&&c.supervisores)?c.supervisores:[]).forEach(function(s){add(s,num);});
    if(c){
      add({nombre:c.supervisor_asociado||c.supervisor,cargo:c.supervisorCargo,proceso:c.procesoSupervision},num);
      add({nombre:c.supervisorAlt,cargo:c.supervisorAltCargo,proceso:c.procesoSupervisionAlt},num);
    }
    (Array.isArray(t&&t.supervisores)?t.supervisores:[]).forEach(function(s){add(s);});
    return out;
  }

  function activeContract(nit){
    var t=db()[nit]||{};
    var vals=[
      norm((document.getElementById('ac-contrato-sel')||{}).value),
      norm((document.getElementById('q-contrato-sel')||{}).value),
      norm(window._sgrtFlowContext&&window._sgrtFlowContext.nit===nit?window._sgrtFlowContext.contrato:''),
      norm(t.contratoEval)
    ].filter(Boolean);
    for(var i=0;i<vals.length;i++){
      if(approved(t,vals[i])||dimsFor(t,vals[i]).length) return vals[i];
    }
    var cs=approvedContracts(t);
    return cs.length?contractNum(cs[0]):'';
  }

  function mergeRemoteQuestionConfig(t){
    if(!t) return;
    try{
      if(t._persHiddenControls&&typeof t._persHiddenControls==='object'){
        window._persHiddenControls=Object.assign(window._persHiddenControls||{},clone(t._persHiddenControls));
      }
      if(t._tipologiasDBCustom&&typeof t._tipologiasDBCustom==='object'){
        window.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM||{};
        Object.keys(t._tipologiasDBCustom).forEach(function(ent){
          window.TIPOLOGIAS_DB_CUSTOM[ent]=Object.assign(window.TIPOLOGIAS_DB_CUSTOM[ent]||{},clone(t._tipologiasDBCustom[ent]||{}));
        });
      }
    }catch(e){}
  }

  /* ------------------------------------------------------------------
   * EVALUADOR: selector de tipologías por contrato (robusto)
   * ------------------------------------------------------------------ */
  function poblarTipologiasContrato(){
    var sel=document.getElementById('ac-tip-filtro'); if(!sel) return;
    var acThird=document.getElementById('ac-tercero-instruc');
    var qThird=document.getElementById('q-tercero');
    var nit=norm((acThird&&acThird.value)||(qThird&&qThird.value));
    var prevKey='';
    try{prevKey=norm((sel.options[sel.selectedIndex]||{}).getAttribute('data-key'));}catch(e){}
    var prevValue=norm(sel.value);

    sel.innerHTML='<option value="">-- Seleccionar tipología --</option>';
    var desc=document.getElementById('ac-consultor-desc');
    if(!nit||!db()[nit]){
      if(desc) desc.innerHTML='Selecciona un tercero aprobado.';
      return;
    }

    var t=db()[nit]; mergeRemoteQuestionConfig(t);
    var contrato=activeContract(nit);
    if(!contrato){
      if(desc) desc.innerHTML='<span style="color:#fd7e14;">⚠ Este tercero no tiene un contrato aprobado disponible.</span>';
      return;
    }

    // Fijar el contexto por contrato para que el render canónico aplique también
    // los controles desactivados específicamente en ese contrato.
    t.contratoEval=contrato;
    t.modoEval='contrato';
    var dims=dimsFor(t,contrato).filter(Boolean);
    if(dims.length) t.dims=clone(dims);

    ['ac-contrato-sel','q-contrato-sel'].forEach(function(id){
      var x=document.getElementById(id); if(!x) return;
      var ok=Array.prototype.some.call(x.options||[],function(o){return norm(o.value)===contrato;});
      if(ok) x.value=contrato;
    });

    var seen={};
    dims.forEach(function(d){
      var key=dimKey(d),name=tipName(d); if(!name) return;
      var dedupe=(key||low(name)); if(seen[dedupe]) return; seen[dedupe]=1;
      var o=document.createElement('option');
      o.value=name; o.textContent=name; o.setAttribute('data-key',key||'');
      sel.appendChild(o);
    });

    // Conservar la selección si sigue existiendo.
    var keep=-1;
    for(var i=1;i<sel.options.length;i++){
      var o=sel.options[i];
      if((prevKey&&norm(o.getAttribute('data-key'))===prevKey)||(!prevKey&&prevValue&&norm(o.value)===prevValue)){keep=i;break;}
    }
    if(keep>0) sel.selectedIndex=keep;

    if(desc){
      var n=Math.max(0,sel.options.length-1);
      desc.innerHTML=n
        ?'<span style="color:#28a745;font-weight:700;">✓ '+n+' tipología(s) aprobada(s)</span> disponibles para diligenciar en el contrato <b>'+esc(contrato)+'</b>.'
        :'<span style="color:#fd7e14;">⚠ El contrato '+esc(contrato)+' está aprobado, pero no tiene tipologías clasificadas disponibles.</span>';
    }

    // En este flujo todas las tipologías seleccionadas pertenecen al contrato:
    // no ocultar el contexto contractual al elegir una tipología.
    var cw=document.getElementById('ac-contrato-wrap'); if(cw) cw.style.display='block';
  }

  // Sustituir únicamente el poblador defectuoso. Todos los wrappers previos llaman
  // dinámicamente a window.poblarSelectorACTipologia, por lo que usarán esta versión.
  window.poblarSelectorACTipologia=poblarTipologiasContrato;

  function forceEvaluatorContractContext(){
    var acThird=document.getElementById('ac-tercero-instruc'),qThird=document.getElementById('q-tercero');
    var nit=norm((acThird&&acThird.value)||(qThird&&qThird.value)); if(!nit||!db()[nit]) return;
    var t=db()[nit],c=activeContract(nit); if(!c) return;
    mergeRemoteQuestionConfig(t); t.contratoEval=c; t.modoEval='contrato';
    var dims=dimsFor(t,c); if(dims.length)t.dims=clone(dims);
    ['ac-contrato-sel','q-contrato-sel'].forEach(function(id){var s=document.getElementById(id);if(s&&Array.prototype.some.call(s.options||[],function(o){return norm(o.value)===c;}))s.value=c;});
  }

  var oldAcThird=window.acCambiarTerceroInstruc;
  if(typeof oldAcThird==='function') window.acCambiarTerceroInstruc=function(){
    var r=oldAcThird.apply(this,arguments); forceEvaluatorContractContext();
    setTimeout(poblarTipologiasContrato,0);setTimeout(poblarTipologiasContrato,90);setTimeout(poblarTipologiasContrato,280); return r;
  };
  var oldAcContract=window.acCambiarContrato;
  if(typeof oldAcContract==='function') window.acCambiarContrato=function(v){
    var nit=norm((document.getElementById('ac-tercero-instruc')||{}).value),t=nit?db()[nit]:null;
    if(t&&v){t.contratoEval=norm(v);t.modoEval='contrato';var ds=dimsFor(t,v);if(ds.length)t.dims=clone(ds);mergeRemoteQuestionConfig(t);}
    var r=oldAcContract.apply(this,arguments); forceEvaluatorContractContext();
    setTimeout(poblarTipologiasContrato,0);setTimeout(poblarTipologiasContrato,100); return r;
  };
  var oldQContract=window.qCambiarContrato;
  if(typeof oldQContract==='function') window.qCambiarContrato=function(v){
    var nit=norm((document.getElementById('q-tercero')||{}).value),t=nit?db()[nit]:null;
    if(t&&v){t.contratoEval=norm(v);t.modoEval='contrato';var ds=dimsFor(t,v);if(ds.length)t.dims=clone(ds);mergeRemoteQuestionConfig(t);}
    var r=oldQContract.apply(this,arguments); forceEvaluatorContractContext(); setTimeout(poblarTipologiasContrato,40); return r;
  };

  // Antes de renderizar el cuestionario, garantizar que _ctrlsCuest reciba el contrato.
  var oldLoad=window.cargarCuestionarioTercero;
  if(typeof oldLoad==='function') window.cargarCuestionarioTercero=function(){
    forceEvaluatorContractContext();
    return oldLoad.apply(this,arguments);
  };

  // Mantener el selector de contrato visible y mostrar el número REAL de preguntas
  // activas para la tipología + contrato seleccionados.
  var oldDesc=window.acActualizarFiltroDesc;
  window.acActualizarFiltroDesc=function(){
    var r; try{if(typeof oldDesc==='function')r=oldDesc.apply(this,arguments);}catch(e){}
    var nit=norm((document.getElementById('ac-tercero-instruc')||{}).value||(document.getElementById('q-tercero')||{}).value),c=activeContract(nit);
    var sel=document.getElementById('ac-tip-filtro'),desc=document.getElementById('ac-consultor-desc'),cw=document.getElementById('ac-contrato-wrap');
    if(cw&&nit&&c)cw.style.display='block';
    if(sel&&sel.value&&desc&&nit&&c){
      var key=norm((sel.options[sel.selectedIndex]||{}).getAttribute('data-key'));
      var ctrls=[];try{ctrls=window._ctrlsCuest?window._ctrlsCuest(nit,key,c):[];}catch(e2){}
      desc.innerHTML='<span style="color:#28a745;font-weight:700;">✓ Tipología seleccionada:</span> <b>'+esc(sel.value)+'</b> — <span style="color:#1e6bb8;font-weight:700;">'+ctrls.length+' controles activos</span> a diligenciar en el contrato <b>'+esc(c)+'</b>.';
    }
    return r;
  };

  // Estado por tipología: mismo aspecto, pero cálculo por contrato y SOLO controles activos.
  window.acMostrarEstadoTipologias=function(nit){
    var wrap=document.getElementById('ac-tips-estado'); if(!wrap)return;
    nit=norm(nit); if(!nit||!db()[nit]){wrap.style.display='none';wrap.innerHTML='';return;}
    var t=db()[nit],c=activeContract(nit),dims=dimsFor(t,c); if(!c||!dims.length){wrap.style.display='none';wrap.innerHTML='';return;}
    mergeRemoteQuestionConfig(t);
    var resp=(t.respuestasACPorContrato&&t.respuestasACPorContrato[c])||((norm(t.contratoEval)===c&&(window.CUEST_RESPUESTAS||{})[nit])||{});
    var html='<div style="font-size:11.5px;font-weight:700;color:#374151;margin-bottom:6px;">Estado por tipología — Contrato '+esc(c)+':</div><div style="display:flex;flex-direction:column;gap:5px;">';
    dims.forEach(function(d){
      var key=dimKey(d),nom=tipName(d),controles=[];
      try{controles=window._ctrlsCuest?window._ctrlsCuest(nit,key,c):((window.CUESTIONARIO_CONTROLES||{})[key]||[]);}catch(e){controles=[];}
      var total=controles.length,respondidos=controles.filter(function(q){var a=norm(resp&&resp[key]&&resp[key][q.n]&&resp[key][q.n].a1);return a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial';}).length;
      var pct=total?Math.round(respondidos/total*100):0,color=pct===100?'#28a745':pct>0?'#fd7e14':'#adb5bd',icon=pct===100?'✅':pct>0?'🔄':'⭕',label=pct===100?'Completo':pct>0?(respondidos+'/'+total+' ('+pct+'%)'):'Sin iniciar';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;">'
        +'<span style="font-size:14px;">'+icon+'</span><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(nom)+'</div>'
        +'<div style="height:5px;background:#e9ecef;border-radius:3px;margin-top:3px;"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:3px;"></div></div></div>'
        +'<span style="font-size:11px;font-weight:700;color:'+color+';white-space:nowrap;">'+label+'</span>'
        +'<button onclick="window.acIrATipologia(\''+esc(key)+'\',\''+esc(nom).replace(/&#39;/g,"\\'")+'\')" style="padding:3px 10px;background:#1e6bb8;color:white;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;">Ir</button></div>';
    });
    wrap.innerHTML=html+'</div>';wrap.style.display='block';
  };

  /* ------------------------------------------------------------------
   * ADMIN RIESGOS: Tipologías evaluadas -> Ver detalle por contrato
   * ------------------------------------------------------------------ */
  function nitFromDetail(det){
    var safe=norm(det.id).replace(/^rpt-prog-det-/,'');
    var keys=Object.keys(db());
    for(var i=0;i<keys.length;i++){
      var k=keys[i],n=norm((db()[k]||{}).nit||k);
      if(k.replace(/[^a-z0-9]/gi,'_')===safe||n.replace(/[^a-z0-9]/gi,'_')===safe) return k;
    }
    return '';
  }

  function findTipsBlock(det){
    var kids=Array.from(det.children||[]);
    for(var i=0;i<kids.length;i++){
      var txt=low(kids[i].textContent).replace(/\s+/g,' ');
      if(txt.indexOf('tipologías evaluadas')===0||txt.indexOf('tipologias evaluadas')===0) return kids[i];
    }
    // Fallback: localizar el encabezado y subir al bloque que contiene las filas.
    var all=Array.from(det.querySelectorAll('div'));
    for(var j=0;j<all.length;j++){
      var tx=low(all[j].textContent).replace(/\s+/g,' ');
      if((tx==='tipologías evaluadas'||tx==='tipologias evaluadas')&&all[j].parentElement) return all[j].parentElement;
    }
    return null;
  }

  function patchAdminTipBlocks(){
    if(!isRiskAdmin()) return;
    Array.from(document.querySelectorAll('[id^="rpt-prog-det-"]')).forEach(function(det){
      var nit=nitFromDetail(det); if(!nit)return;
      var block=findTipsBlock(det); if(!block||block.dataset.sgrt35Tips==='1')return;
      var t=db()[nit]||{},cs=(t.contratos||[]).filter(function(c){return contractNum(c)&&dimsFor(t,contractNum(c)).length;});
      var total=cs.reduce(function(s,c){return s+dimsFor(t,contractNum(c)).length;},0);
      block.dataset.sgrt35Tips='1';
      block.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:2px 0;">'
        +'<div><div style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;">Tipologías evaluadas</div>'
        +'<div style="font-size:9.5px;color:#94a3b8;margin-top:2px;">'+cs.length+' contrato'+(cs.length===1?'':'s')+' · '+total+' tipología'+(total===1?'':'s')+'</div></div>'
        +'<button type="button" onclick="window.sgrt35VerDetalleTipologias(\''+esc(nit)+'\')" style="padding:5px 10px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;">👁 Ver detalle</button></div>';
    });
  }

  function responseMap(t,nit,c){
    if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[c])return t.respuestasACPorContrato[c];
    if(norm(t&&t.contratoEval)===norm(c))return (window.CUEST_RESPUESTAS||{})[nit]||{};
    return {};
  }
  function activeCtrls(nit,key,c){
    try{if(typeof window._ctrlsCuest==='function'){var a=window._ctrlsCuest(nit,key,c);if(Array.isArray(a))return a;}}catch(e){}
    return (window.CUESTIONARIO_CONTROLES||{})[key]||[];
  }
  function acPct(t,nit,c,d){
    var key=dimKey(d),qs=activeCtrls(nit,key,c),r=responseMap(t,nit,c),ok=0;
    qs.forEach(function(q){var a=norm(r&&r[key]&&r[key][q.n]&&r[key][q.n].a1);if(a==='Si'||a==='No'||a==='No Aplica'||a==='Parcial')ok++;});
    return qs.length?Math.round(ok/qs.length*100):0;
  }

  window.sgrt35VerDetalleTipologias=function(nit){
    nit=norm(nit);var t=db()[nit];if(!t)return;
    var old=document.getElementById('_sgrt35-tip-det');if(old)old.remove();
    var cs=(t.contratos||[]).filter(function(c){return contractNum(c)&&dimsFor(t,contractNum(c)).length;});
    var content=cs.length?cs.map(function(c){
      var num=contractNum(c),dims=dimsFor(t,num),ss=supervisorsFor(t,c),sup=ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado';
      var rows=dims.map(function(d){
        var raw=d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel);
        return '<div style="display:grid;grid-template-columns:minmax(180px,1fr) 58px 64px;gap:8px;align-items:center;padding:6px 9px;border-top:1px solid #eef2f7;font-size:10.5px;">'
          +'<span style="font-weight:700;color:#334155;">'+esc(tipName(d))+'</span><span style="text-align:center;font-weight:800;color:#1a3a5c;">'+esc(raw==null?'—':raw)+'</span>'
          +'<span style="text-align:center;color:#64748b;white-space:nowrap;">AC: '+acPct(t,nit,num,d)+'%</span></div>';
      }).join('');
      return '<div style="border:1px solid #dbe3ec;border-radius:8px;overflow:hidden;margin-bottom:9px;background:white;">'
        +'<div style="padding:8px 10px;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;"><span style="font-size:11.5px;font-weight:800;color:#1a3a5c;">Contrato '+esc(num)+'</span><span style="font-size:10px;color:#6d28d9;">👤 '+esc(sup)+'</span></div>'
        +'<div style="display:grid;grid-template-columns:minmax(180px,1fr) 58px 64px;gap:8px;padding:5px 9px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;"><span>Tipología</span><span style="text-align:center;">Puntaje</span><span style="text-align:center;">AC</span></div>'+rows+'</div>';
    }).join(''):'<div style="padding:18px;text-align:center;color:#94a3b8;">No hay tipologías clasificadas por contrato.</div>';
    var ov=document.createElement('div');ov.id='_sgrt35-tip-det';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10090;display:flex;align-items:flex-start;justify-content:center;padding:45px 12px;overflow:auto;';ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="width:650px;max-width:97vw;background:white;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.25);overflow:hidden;"><div style="padding:12px 15px;background:#1a3a5c;color:white;display:flex;justify-content:space-between;align-items:center;gap:10px;"><div><div style="font-size:13px;font-weight:800;">Tipologías evaluadas por contrato</div><div style="font-size:10px;opacity:.78;margin-top:2px;">'+esc(t.nombre||nit)+' · NIT '+esc(t.nit||nit)+'</div></div><button onclick="document.getElementById(\'_sgrt35-tip-det\').remove()" style="background:none;border:0;color:white;font-size:20px;cursor:pointer;">×</button></div><div style="padding:12px 14px;max-height:68vh;overflow:auto;">'+content+'</div></div>';
    document.body.appendChild(ov);
  };

  var oldRpt=window.renderReportesAC;
  if(typeof oldRpt==='function') window.renderReportesAC=function(){
    var r=oldRpt.apply(this,arguments);setTimeout(patchAdminTipBlocks,0);setTimeout(patchAdminTipBlocks,80);setTimeout(patchAdminTipBlocks,260);return r;
  };
  var oldToggle=window._rptProgToggle;
  if(typeof oldToggle==='function') window._rptProgToggle=function(){var r=oldToggle.apply(this,arguments);setTimeout(patchAdminTipBlocks,0);setTimeout(patchAdminTipBlocks,70);return r;};

  function observe(){
    var rp=document.getElementById('cq-reportes-body');
    if(rp&&!rp.dataset.sgrt35Obs){rp.dataset.sgrt35Obs='1';new MutationObserver(function(){setTimeout(patchAdminTipBlocks,0);}).observe(rp,{childList:true,subtree:true});}
  }

  document.addEventListener('change',function(ev){
    var id=ev.target&&ev.target.id||'';
    if(id==='ac-tercero-instruc'||id==='ac-contrato-sel'||id==='q-tercero'||id==='q-contrato-sel'){
      setTimeout(forceEvaluatorContractContext,0);setTimeout(poblarTipologiasContrato,20);setTimeout(poblarTipologiasContrato,180);
    }
  },true);

  function init(){
    observe();
    if(isEvaluator()){forceEvaluatorContractContext();poblarTipologiasContrato();}
    if(isRiskAdmin())patchAdminTipBlocks();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,220);setTimeout(init,900);});
  else{setTimeout(init,100);setTimeout(init,650);}
})();
