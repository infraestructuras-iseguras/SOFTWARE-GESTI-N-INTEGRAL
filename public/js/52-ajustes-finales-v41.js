/*
 * SGRT — V41 · Correcciones puntuales 2026-10-14
 * SOLO: títulos Fraude, promedio por contrato del Evaluador, evidencias robustas y alivio de bloqueos.
 */
(function(){
  'use strict';
  function s(v){return String(v==null?'':v).trim();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function low(v){return s(v).toLowerCase();}
  function safe(v){return s(v).replace(/[^a-z0-9_-]/gi,'_');}
  function canon(v){v=s(v);return /^\d+$/.test(v)?String(parseInt(v,10)):low(v);}
  function db(){return window.TERCEROS_DB||{};}
  function isEvaluator(){var r=low((window.currentUser||{}).rol);return r==='cliente'||r==='evaluador'||r.indexOf('evaluador')>=0;}
  function api(){return s(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function toast(m,t,ms){try{window.showToast&&window.showToast(m,t||'info',ms||3000);}catch(e){}}
  function actor(){var u=window.currentUser||{};return {login:s(u.login||u.user),name:s(u.name||u.nombre),rol:s(u.rol)};}
  function cnum(c){return s(c&&(c.num||c.numero||c.NoContrato||c.noContrato||c.contrato));}
  function mapVal(map,contract){if(!map||typeof map!=='object')return undefined;var cc=canon(contract),ks=Object.keys(map);for(var i=0;i<ks.length;i++)if(canon(ks[i])===cc)return map[ks[i]];}
  function rawScore(d){var v=d&&(d.val!=null?d.val:(d.calificacion!=null?d.calificacion:d.nivel));v=parseFloat(v);return isNaN(v)?null:v;}
  function contractAverage(t,contract){
    var pc=mapVal(t&&t.promPorContrato,contract),p=parseFloat(pc&&pc.prom);
    if(!isNaN(p))return p;
    var dims=mapVal(t&&t.dimsPorContrato,contract)||mapVal(t&&t.tipologiasPorContrato,contract)||[];
    var c=(t&&t.contratos||[]).find(function(x){return canon(cnum(x))===canon(contract);});
    if((!Array.isArray(dims)||!dims.length)&&c)dims=c.dims||c.tipologias||c.clasificacion||[];
    var vals=(Array.isArray(dims)?dims:[]).map(rawScore).filter(function(x){return x!==null;});
    return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
  }
  function averageHtml(t){
    var cs=(t&&t.contratos||[]).filter(function(c){return cnum(c);});
    if(!cs.length)return '<span class="chip" style="font-size:10px;color:#64748b;">—</span>';
    return '<div style="display:flex;flex-direction:column;gap:5px;align-items:flex-start;">'+cs.map(function(c){var n=cnum(c),p=contractAverage(t,n);return '<span style="display:inline-flex;gap:5px;align-items:center;padding:3px 7px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font-size:9.5px;white-space:nowrap;"><b>Contrato '+esc(n)+':</b> '+(p===null?'—':p.toFixed(2))+'</span>';}).join('')+'</div>';
  }
  function fixEvaluatorAverages(){
    if(!isEvaluator())return;
    var body=document.getElementById('cls-dash-tbody');if(!body)return;
    var head=body.closest('table')&&body.closest('table').querySelector('thead tr');
    if(head&&head.cells&&head.cells.length>=7){head.cells[5].textContent='Promedio por contrato';head.cells[6].textContent='Exposición del riesgo';}
    Array.from(body.querySelectorAll('tr')).forEach(function(tr){if(/^exp-/.test(tr.id||''))return;var cells=tr.cells;if(!cells||cells.length<7)return;var nit=s(cells[1].textContent),t=db()[nit];if(!t)return;cells[5].innerHTML=averageHtml(t);});
  }
  var oldCls=window.clsRender;
  if(typeof oldCls==='function'&&!oldCls._sgrtV41){var wrapped=function(){var r=oldCls.apply(this,arguments);fixEvaluatorAverages();return r;};wrapped._sgrtV41=true;window.clsRender=wrapped;}

  // Asegura que los títulos de Fraude sean específicos aunque una copia antigua del catálogo quede en memoria.
  function fixFraudTitles(){
    try{
      var arr=(typeof CUESTIONARIO_CONTROLES!=='undefined'&&CUESTIONARIO_CONTROLES.fr)||[];
      var names={2:'Código de conducta y ética',3:'Regalos, atenciones y gratificaciones',4:'Donaciones, contribuciones y patrocinios',5:'Compras y adquisiciones transparentes',6:'Gestión de conflictos de interés',7:'Reporte de eventos de fraude y corrupción',8:'Monitoreo de eventos de fraude y corrupción',9:'Programa de Transparencia y Ética Empresarial'};
      arr.forEach(function(c){if(names[c.n])c.ctrl=names[c.n];});
    }catch(e){}
  }

  function currentNit(){var ids=['q-tercero','q-tercero-sel','ac-tercero-instruc','ac-tercero-sel','ctrl-terc-sel'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&s(el.value))return s(el.value);}return '';}
  function currentContract(){var ids=['q-contrato-sel','ac-contrato-sel','ctrl-contrato-sel'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&s(el.value))return s(el.value);}return '';}
  function nitFromKey(nitKey){var nk=s(nitKey);if(db()[nk])return nk;var target=safe(nk).toLowerCase(),keys=Object.keys(db());for(var i=0;i<keys.length;i++)if(safe(keys[i]).toLowerCase()===target)return keys[i];return currentNit()||nk;}
  function mergeEvidence(meta){
    if(!meta||!meta.id)return;
    window.EVID_CUEST=window.EVID_CUEST||{};
    var key=safe(meta.nit)+'_'+s(meta.tipologiaKey||meta.tipologia)+'_'+s(meta.control),arr=window.EVID_CUEST[key]||(window.EVID_CUEST[key]=[]);
    var old=arr.find(function(x){return s(x&&x.id)===s(meta.id);});
    var item={id:meta.id,name:meta.name,size:Number(meta.size||0),type:meta.type||meta.mime||'',fecha:meta.fecha||meta.uploadedAt||'',nit:s(meta.nit),contrato:s(meta.contrato),tipologia:meta.tipologia||meta.tipologiaKey,tipologiaKey:meta.tipologiaKey||meta.tipologia,control:s(meta.control),subidoPor:meta.subidoPor||meta.uploadedBy||'',sincronizadaServidor:true,_serverEvidence:true};
    if(old)Object.assign(old,item);else arr.push(item);return item;
  }
  async function uploadOne(file,ctx,attempt){
    attempt=attempt||1;var who=actor(),id='ac_'+Date.now()+'_'+Math.random().toString(36).slice(2,10),q=new URLSearchParams({id:id,nit:ctx.nit,contrato:ctx.contract,tipologiaKey:ctx.key,tipologia:ctx.key,control:String(ctx.ctrlN),name:file.name,type:file.type||'application/octet-stream',actorName:who.name||'',actorLogin:who.login||'',actorRole:who.rol||''});
    var ac=typeof AbortController!=='undefined'?new AbortController():null,timer=ac?setTimeout(function(){try{ac.abort();}catch(e){}},90000):null;
    try{
      var r=await fetch(api()+'/api/ac-evidence-binary?'+q.toString(),{method:'POST',headers:{'Content-Type':'application/octet-stream','Accept':'application/json','X-SGRT-User':who.login||'','X-SGRT-Name':who.name||'','X-SGRT-Role':who.rol||''},body:file,signal:ac?ac.signal:undefined});
      var j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return j.data||{id:id,nit:ctx.nit,contrato:ctx.contract,tipologiaKey:ctx.key,tipologia:ctx.key,control:String(ctx.ctrlN),name:file.name,type:file.type,size:file.size,uploadedBy:who.name};
    }catch(e){if(attempt<2){await new Promise(function(res){setTimeout(res,700);});return uploadOne(file,ctx,attempt+1);}throw e;}finally{if(timer)clearTimeout(timer);}
  }
  var uploadQueue=Promise.resolve();
  window.registrarEvidenciaCuest=function(nitKey,key,ctrlN,inputEl){
    var files=Array.from(inputEl&&inputEl.files||[]);if(!files.length)return Promise.resolve(false);
    if(inputEl)inputEl.multiple=true;
    var task=async function(){
      var nit=nitFromKey(nitKey),contract=currentContract();
      if(!nit||!contract){toast('Selecciona primero el tercero y el contrato antes de subir evidencias.','warning',4200);if(inputEl)inputEl.value='';return false;}
      var max=20*1024*1024,valid=files.filter(function(f){return f&&f.size<=max;}),rejected=files.length-valid.length,ok=0,fail=0;
      window.__SGRT_REPO_UPLOAD_BUSY__=true;if(inputEl)inputEl.disabled=true;
      toast('Subiendo '+valid.length+' evidencia(s)…','info',1800);
      try{
        for(var i=0;i<valid.length;i++){
          var f=valid[i];try{var meta=await uploadOne(f,{nit:nit,contract:contract,key:s(key),ctrlN:s(ctrlN)});mergeEvidence(meta);ok++;try{window.renderEvCuest&&window.renderEvCuest(nitKey,key,ctrlN);}catch(_e){}await new Promise(function(res){setTimeout(res,80);});}catch(e){fail++;console.warn('[SGRT V41 evidencia]',f.name,e);toast('No se pudo subir '+f.name+': '+e.message,'warning',4000);}
        }
        if(typeof window.sgrt50RefrescarEvidencias==='function')try{await window.sgrt50RefrescarEvidencias(false);}catch(_r){}
        if(ok)toast(ok+' evidencia(s) cargada(s) y verificadas en la base de datos.','success',3800);
        if(rejected)toast(rejected+' archivo(s) superan 20 MB y no se cargaron.','warning',4200);
        if(fail)toast(fail+' archivo(s) fallaron después de reintentar.','warning',4200);
        return ok>0;
      }finally{window.__SGRT_REPO_UPLOAD_BUSY__=false;if(inputEl){inputEl.value='';inputEl.disabled=false;inputEl.multiple=true;}}
    };
    uploadQueue=uploadQueue.then(task,task);return uploadQueue;
  };
  function ensureEvidenceInputs(){Array.from(document.querySelectorAll('input[type="file"][onchange*="registrarEvidenciaCuest"]')).forEach(function(el){el.multiple=true;el.setAttribute('multiple','multiple');});}

  // No repintar ni sincronizar mientras el usuario está trabajando o se cargan archivos.
  function busy(){var a=document.activeElement,t=a&&a.tagName;return !!window.__SGRT_REPO_UPLOAD_BUSY__||t==='INPUT'||t==='SELECT'||t==='TEXTAREA'||!!document.querySelector('details[open],[aria-expanded="true"],.dropdown-menu.show,.show.dropdown-menu');}
  window.__SGRT_V41_BUSY__=busy;
  document.addEventListener('change',function(e){if(e.target&&e.target.matches&&e.target.matches('input[type="file"][onchange*="registrarEvidenciaCuest"]'))e.target.multiple=true;},true);

  var oldNav=window.navTo;if(typeof oldNav==='function'&&!oldNav._sgrtV41){var nav=function(el,pg){var r=oldNav.apply(this,arguments);setTimeout(function(){fixFraudTitles();ensureEvidenceInputs();if(pg==='pg-clasificacion')fixEvaluatorAverages();},250);return r;};nav._sgrtV41=true;window.navTo=nav;}
  fixFraudTitles();ensureEvidenceInputs();setTimeout(function(){fixFraudTitles();ensureEvidenceInputs();fixEvaluatorAverages();},700);
})();
