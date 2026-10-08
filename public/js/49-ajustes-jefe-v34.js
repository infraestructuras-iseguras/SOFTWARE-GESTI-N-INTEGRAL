/*
 * SGRT — Ajuste 49 / V34 (2026-10-08)
 * SOLO corrige los puntos reportados por revisión del jefe:
 * 1) Persistencia real de controles quitados/activados por tercero + contrato.
 * 2) Botón explícito "Guardar cambios" en configuración de controles.
 * 3) Refresco inmediato del color del control al cambiar una respuesta.
 * 4) Terminología "Exposición del riesgo" y escala BAJO / MEDIO / ALTO.
 * 5) Evidencias de Ambiente de Control visibles y organizadas automáticamente
 *    en Documentación / Evidencia por tercero > contrato > tipología.
 * No cambia el resto del flujo ni la estructura de módulos.
 */
(function(){
  'use strict';
  var saveBusy=false, lastConfigSig='';
  function s(v){return String(v==null?'':v).trim();}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){return window.TERCEROS_DB||{};}
  function api(){return s(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function toast(m,t,ms){try{window.showToast&&window.showToast(m,t||'info',ms||2600);}catch(e){}}
  function currentNit(){return s((document.getElementById('ctrl-terc-sel')||document.getElementById('q-tercero')||document.getElementById('ac-tercero-instruc')||{}).value);}
  function currentContract(){return s((document.getElementById('ctrl-contrato-sel')||document.getElementById('q-contrato-sel')||document.getElementById('ac-contrato-sel')||{}).value);}
  function actor(){var u=window.currentUser||{};return {login:s(u.login||u.user),name:s(u.name||u.nombre),rol:s(u.rol)};}

  // ─────────────────────────────────────────────────────────────
  // 1) Guardado explícito de configuración de controles
  // ─────────────────────────────────────────────────────────────
  function configPayload(nit){
    var t=db()[nit]||{};
    var hidden=clone(window._persHiddenControls||{});
    var allCustom=window.CUEST_CTRL_CUSTOM||{};
    var custom={};
    if(allCustom[nit]) custom[nit]=clone(allCustom[nit]);
    Object.keys(allCustom).forEach(function(k){if(k.indexOf(nit+'|')===0)custom[k]=clone(allCustom[k]);});
    t._persHiddenControls=hidden;
    t._configPreguntas=clone(allCustom[nit]||{});
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    return {persHiddenControls:hidden,configPreguntas:clone(allCustom[nit]||{}),customPorContrato:custom,actor:actor()};
  }
  function configSig(nit,contract){try{return JSON.stringify([nit,contract,window._persHiddenControls||{},(window.CUEST_CTRL_CUSTOM||{})[nit]||{},(window.CUEST_CTRL_CUSTOM||{})[nit+'|'+contract]||{}]);}catch(e){return String(Date.now());}}
  function markConfigDirty(){
    var nit=currentNit(),contract=currentContract();if(!nit||!contract)return;
    var btn=document.getElementById('sgrt49-save-controls');if(btn){btn.disabled=false;btn.textContent='Guardar cambios';btn.style.opacity='1';}
  }
  async function saveControlConfig(){
    var nit=currentNit(),contract=currentContract();
    if(!nit||!contract){toast('Selecciona un tercero y un contrato antes de guardar.','warning',3000);return false;}
    if(saveBusy)return false;saveBusy=true;
    var btn=document.getElementById('sgrt49-save-controls');if(btn){btn.disabled=true;btn.textContent='Guardando…';}
    var payload=configPayload(nit),ok=false;
    try{
      try{window._lsSave&&window._lsSave();}catch(_ls){}
      if(typeof window._sgrtSyncEvaluatorContract==='function'){
        ok=await Promise.resolve(window._sgrtSyncEvaluatorContract(nit,contract,payload));
      }else{
        var r=await fetch(api()+'/api/sgrt-state/'+encodeURIComponent(nit)+'/evaluador/'+encodeURIComponent(contract),{method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});
        var x=await r.json().catch(function(){return{};});ok=!!(r.ok&&x.ok);
      }
      if(ok){lastConfigSig=configSig(nit,contract);toast('Cambios de controles guardados en la base de datos.','success',3000);}
      else toast('No se pudo confirmar el guardado en la base de datos.','warning',3800);
    }catch(e){console.warn('[SGRT49 guardar controles]',e);toast('Ocurrió un error al guardar los cambios de controles.','error',3800);}
    finally{saveBusy=false;if(btn){btn.disabled=false;btn.textContent=ok?'✓ Cambios guardados':'Guardar cambios';btn.style.opacity='1';}}
    return ok;
  }
  window.sgrt49GuardarCambiosControles=saveControlConfig;

  function ensureSaveButton(){
    var list=document.getElementById('ctrl-lista')||document.getElementById('ctrl-list')||document.querySelector('[id*="ctrl-list"]');
    var page=document.getElementById('pg-ctrl-op')||document;
    if(document.getElementById('sgrt49-save-controls')||!page)return;
    var target=list&&list.parentNode?list.parentNode:(document.getElementById('ctrl-tip-sel')||{}).parentNode;
    if(!target)return;
    var wrap=document.createElement('div');wrap.id='sgrt49-save-controls-wrap';wrap.style.cssText='display:flex;justify-content:flex-end;gap:8px;margin:12px 0 6px;';
    var b=document.createElement('button');b.id='sgrt49-save-controls';b.type='button';b.className='btn btn-success';b.textContent='Guardar cambios';b.style.cssText='padding:8px 16px;font-weight:800;cursor:pointer;';b.onclick=saveControlConfig;wrap.appendChild(b);
    target.appendChild(wrap);
  }

  // Envolver los botones que cambian controles para que queden marcados como pendientes.
  function wrapControlActions(){
    ['ctrlTgl','ctrlTodas','ctrlDel','guardarControlPersonalizado','quitarCtrlCustomCuest'].forEach(function(name){
      var old=window[name];if(typeof old!=='function'||old._sgrt49)return;
      var fn=function(){var r=old.apply(this,arguments);setTimeout(function(){markConfigDirty();ensureSaveButton();},70);return r;};fn._sgrt49=true;window[name]=fn;
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 2) Color de controles en tiempo real
  // ─────────────────────────────────────────────────────────────
  function refreshRowColor(select){
    if(!select||!select.id||select.id.indexOf('_a1')<0)return;
    var row=select.closest('[id^="cr_"]');if(!row)return;
    var circle=row.querySelector('div[style*="border-radius:50%"],div[style*="border-radius: 50%"]');if(!circle)return;
    var v=s(select.value).toLowerCase();
    if(v==='si'||v==='sí'){circle.style.background='#16A34A';circle.style.color='white';}
    else if(v==='no'){circle.style.background='#DC2626';circle.style.color='white';}
    else if(v==='no aplica'||v==='n/a'){circle.style.background='#9CA3AF';circle.style.color='white';}
    else{circle.style.background='#E5E7EB';circle.style.color='#6B7280';}
  }
  document.addEventListener('change',function(e){var el=e.target;if(el&&el.tagName==='SELECT')setTimeout(function(){refreshRowColor(el);},0);},true);

  // ─────────────────────────────────────────────────────────────
  // 3) Exposición del riesgo: SOLO BAJO / MEDIO / ALTO
  // ─────────────────────────────────────────────────────────────
  function exposureValue(v){var x=s(v).toUpperCase();if(!x)return '—';if(x.indexOf('EXTREMO')>=0||x.indexOf('CRIT')>=0||x.indexOf('ALTO')>=0)return 'ALTO';if(x.indexOf('MODERADO')>=0||x.indexOf('MEDIO')>=0)return 'MEDIO';if(x.indexOf('BAJO')>=0)return 'BAJO';return x;}
  function fixRiskLabels(root){
    root=root||document;
    Array.from(root.querySelectorAll('th')).forEach(function(th){if(/^\s*NIVEL\s+DE\s+RIESGO\s*$/i.test(s(th.textContent))||/^\s*NIVEL\s+RIESGO\s*$/i.test(s(th.textContent)))th.textContent='EXPOSICIÓN DEL RIESGO';});
    Array.from(root.querySelectorAll('td,span')).forEach(function(el){var t=s(el.textContent);if(/^(EXTREMO|CR[IÍ]TICO|MODERADO)$/i.test(t)){el.textContent=exposureValue(t);}});
  }

  // ─────────────────────────────────────────────────────────────
  // 4) Evidencia AC: metadata + carpeta automática + sincronización
  // ─────────────────────────────────────────────────────────────
  function tipLabel(key){try{var i=window.SECCIONES_INFO&&window.SECCIONES_INFO[key];if(i&&i.label)return s(i.label);var c=window.TIPOLOGIA_CATALOG&&window.TIPOLOGIA_CATALOG[key];if(c&&(c.nombre||c.nombre_tipologia))return s(c.nombre||c.nombre_tipologia).replace(/\n/g,' ');}catch(e){}return s(key)||'Tipología';}
  function safeId(v){return s(v).replace(/[^a-z0-9_-]/gi,'_');}
  function ensureFolder(parent,id,name){parent.children=parent.children||[];var f=parent.children.find(function(x){return x&&x.type==='folder'&&(x.id===id||x.name===name);});if(!f){f={id:id,name:name,type:'folder',children:[]};parent.children.push(f);}return f;}
  function syncEvidenceFolders(nit,contract,key,ctrlN,items){
    if(!nit||!contract||!items||!items.length)return;
    try{
      var fs=JSON.parse(localStorage.getItem('od_sgrt_v8')||'null')||{id:'root',name:'Documentación',type:'folder',children:[]};
      var ac=ensureFolder(fs,'f_ac','Ambiente de Control');
      var t=db()[nit]||{},third=ensureFolder(ac,'f_ac_'+safeId(nit),(t.nombre||'Tercero')+' ('+nit+')');
      var cf=ensureFolder(third,'f_ac_'+safeId(nit)+'_'+safeId(contract),'Contrato '+contract);
      var tf=ensureFolder(cf,'f_ac_'+safeId(nit)+'_'+safeId(contract)+'_'+safeId(key),tipLabel(key));
      items.forEach(function(ev){if(!(tf.children||[]).some(function(x){return x&&((ev.id&&x._evidId===ev.id)||(x.name===ev.name&&Number(x.size||0)===Number(ev.size||0)));}))tf.children.push({id:'repo_'+ev.id,name:ev.name||'Evidencia',type:'file',size:ev.size||0,fecha:ev.fecha||new Date().toISOString(),mime:ev.type||'',dataURL:ev.dataUrl||ev.dataURL||'',_evidId:ev.id,_nit:nit,_contrato:contract,_tip:key,_ctrl:ctrlN,_origen:'Ambiente de Control'});});
      localStorage.setItem('od_sgrt_v8',JSON.stringify(fs));
      try{window.odRender&&window.odRender();window.adminOdInit&&window.adminOdInit();}catch(_r){}
    }catch(e){console.warn('[SGRT49 carpetas evidencia]',e);}
  }
  async function persistEvidence(nit,contract,key,ctrlN,items){
    if(!nit||!contract||!items.length)return false;
    var pack={};pack[nit+'_'+contract+'_'+key+'_'+ctrlN]=clone(items);
    try{if(typeof window._sgrtSyncEvaluatorContract==='function')return await Promise.resolve(window._sgrtSyncEvaluatorContract(nit,contract,{evidenciasAC:pack,actor:actor()}));}catch(e){}
    try{var r=await fetch(api()+'/api/sgrt-state/'+encodeURIComponent(nit)+'/evaluador/'+encodeURIComponent(contract),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({evidenciasAC:pack,actor:actor()})});return r.ok;}catch(e2){return false;}
  }
  function wrapEvidence(){
    var old=window.registrarEvidenciaCuest;if(typeof old!=='function'||old._sgrt49)return;
    var fn=function(nitKey,key,ctrlN,input){
      var nit=s((document.getElementById('q-tercero')||document.getElementById('ac-tercero-instruc')||{}).value),contract=s((document.getElementById('q-contrato-sel')||document.getElementById('ac-contrato-sel')||{}).value);
      var before={};try{Object.keys(window.EVID_CUEST||{}).forEach(function(k){before[k]=(window.EVID_CUEST[k]||[]).length;});}catch(e){}
      var r=old.apply(this,arguments);
      setTimeout(function(){
        try{
          var ev=window.EVID_CUEST||{},changed=[];
          Object.keys(ev).forEach(function(sk){var start=before[sk]||0,arr=ev[sk]||[];for(var i=start;i<arr.length;i++){var x=arr[i];if(!x)continue;x.id=x.id||('ac_'+Date.now()+'_'+Math.random().toString(36).slice(2,8));x.nit=x.nit||nit;x.contrato=x.contrato||contract;x.tipologia=x.tipologia||tipLabel(key);x.tipologiaKey=x.tipologiaKey||key;x.control=x.control||ctrlN;x.origen='Ambiente de Control';changed.push(x);}});
          if(!changed.length)return;
          try{window._lsSave&&window._lsSave();}catch(_ls){}
          syncEvidenceFolders(nit,contract,key,ctrlN,changed);
          persistEvidence(nit,contract,key,ctrlN,changed).then(function(ok){toast(ok?'Evidencia guardada y visible en Documentación / Evidencia.':'Evidencia guardada localmente; no se pudo confirmar la sincronización con la base de datos.',ok?'success':'warning',3600);});
          try{window.sgrt45RefrescarEvidencias&&window.sgrt45RefrescarEvidencias(false);}catch(_v){}
        }catch(e){console.warn('[SGRT49 evidencia]',e);}
      },450);
      return r;
    };fn._sgrt49=true;window.registrarEvidenciaCuest=fn;
  }

  function hydrateEvidenceFromThirds(){
    // Si el servidor ya trajo evidencias, incorporarlas al repositorio y a EVID_CUEST.
    try{
      window.EVID_CUEST=window.EVID_CUEST||{};
      Object.keys(db()).forEach(function(nit){var t=db()[nit]||{},pack=t._evidenciasAC||{};Object.keys(pack).forEach(function(g){var arr=Array.isArray(pack[g])?pack[g]:[];arr.forEach(function(ev){if(!ev)return;var c=s(ev.contrato),k=s(ev.tipologiaKey||ev.tipologia||'ac'),ctrl=s(ev.control||'');var sk=safeId(nit)+'_'+k+'_'+ctrl;if(!window.EVID_CUEST[sk])window.EVID_CUEST[sk]=[];if(!window.EVID_CUEST[sk].some(function(x){return x&&x.id===ev.id;}))window.EVID_CUEST[sk].push(clone(ev));syncEvidenceFolders(nit,c,k,ctrl,[ev]);});});});
    }catch(e){}
  }

  function tick(){
    ensureSaveButton();wrapControlActions();wrapEvidence();fixRiskLabels(document);hydrateEvidenceFromThirds();
    var nit=currentNit(),contract=currentContract();if(nit&&contract&&!lastConfigSig)lastConfigSig=configSig(nit,contract);
  }
  var mo=new MutationObserver(function(muts){var need=false;muts.forEach(function(m){if(m.addedNodes&&m.addedNodes.length)need=true;});if(need)setTimeout(function(){ensureSaveButton();fixRiskLabels(document);},40);});
  try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
  setTimeout(tick,300);setInterval(tick,2500);
})();
