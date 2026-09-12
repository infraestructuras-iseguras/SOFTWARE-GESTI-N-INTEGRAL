/*
 * SGRT — Hotfix 40 (2026-09-11)
 * Correcciones puntuales de Ambiente de Control:
 * - Guardar borrador / guardado completo persistente por tercero y contrato.
 * - "No" y "No aplica" cuentan como control respondido para el PROGRESO.
 * - La validación ignora atributos deshabilitados automáticamente.
 * - El Administrador de Riesgos ve contratos respondidos, progreso y nivel general.
 * - Hidratación remota no bloqueante para reflejar respuestas de otro navegador/rol.
 * - Observaciones más amplias para el Evaluador y correcciones ortográficas visuales.
 * No cambia tablas, backend ni la estructura base de las pantallas.
 */
(function(){
  'use strict';

  function norm(v){ return String(v == null ? '' : v).trim(); }
  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function db(){ if(!window.TERCEROS_DB) window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function responses(){ if(!window.CUEST_RESPUESTAS) window.CUEST_RESPUESTAS={}; return window.CUEST_RESPUESTAS; }
  function validAnswer(v){
    v=norm(v).toLowerCase();
    try{v=v.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
    return v==='si'||v==='no'||v==='no aplica'||v==='no_aplica'||v==='n/a'||v==='na'||v==='parcial'||v==='parcialmente';
  }
  function activeNit(){
    return norm(window.nitActual)||norm((document.getElementById('q-tercero')||{}).value)||norm((document.getElementById('ac-tercero-instruc')||{}).value);
  }
  function activeContract(nit){
    var t=db()[nit]||{};
    return norm((document.getElementById('q-contrato-sel')||{}).value)||norm((document.getElementById('ac-contrato-sel')||{}).value)||norm(t.contratoEval);
  }
  function dimsFor(t,contrato){
    if(!t)return [];
    if(contrato && t.dimsPorContrato && Array.isArray(t.dimsPorContrato[contrato]) && t.dimsPorContrato[contrato].length) return t.dimsPorContrato[contrato];
    if(typeof window._sgrtGetContractDims==='function'){
      try{var x=window._sgrtGetContractDims(t,contrato);if(Array.isArray(x)&&x.length)return x;}catch(e){}
    }
    return Array.isArray(t.dims)?t.dims:[];
  }
  function controlsFor(nit,key,contrato){
    try{
      if(typeof window._ctrlsCuest==='function') return window._ctrlsCuest(nit,key,contrato)||[];
    }catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]);
  }
  function responseSetFor(t,nit,contrato){
    if(contrato){
      if(t && t.respuestasACPorContrato && t.respuestasACPorContrato[contrato]) return t.respuestasACPorContrato[contrato]||{};
      var nums=contractNumbers(t||{});
      if(t && norm(t.contratoEval)===norm(contrato) && t.respuestasAC && typeof t.respuestasAC==='object') return t.respuestasAC;
      if(nums.length<=1){
        if(t && t.respuestasAC && typeof t.respuestasAC==='object') return t.respuestasAC;
        return responses()[nit]||{};
      }
      return {};
    }
    if(t && t.respuestasAC && typeof t.respuestasAC==='object') return t.respuestasAC;
    return responses()[nit]||{};
  }
  function calcContract(t,nit,contrato){
    var dims=dimsFor(t,contrato), rr=responseSetFor(t,nit,contrato);
    var total=0,answered=0,vals=[];
    dims.forEach(function(d){
      var key=d.key||d.clave||''; if(!key)return;
      controlsFor(nit,key,contrato).forEach(function(c){
        total++;
        var r=(rr[key]&&rr[key][c.n])||{};
        if(validAnswer(r.a1)){
          answered++;
          try{
            if(typeof window._calcCtrlValoracion==='function'){
              var v=window._calcCtrlValoracion(r);
              if(v && v.valorMad!==null && v.valorMad!==undefined && !isNaN(Number(v.valorMad))) vals.push(Number(v.valorMad));
            }
          }catch(e){}
        }
      });
    });
    var pct=total?Math.round(answered/total*100):0;
    var avg=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
    var maturity=null;
    try{if(vals.length && typeof window._calcMadurezTipologia==='function')maturity=window._calcMadurezTipologia(vals);}catch(e){}
    return {total:total,answered:answered,pct:pct,avg:avg,vals:vals,maturity:maturity,complete:total>0&&answered===total};
  }
  function contractNumbers(t){
    var arr=(t&&Array.isArray(t.contratos))?t.contratos:[];
    var out=[];
    arr.forEach(function(c){
      if(!c)return;
      var n=norm(c.num||c.numero||c.NoContrato);if(!n)return;
      var approved=(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true||(t.aprobadoPorContrato&&t.aprobadoPorContrato[n]));
      if(approved && out.indexOf(n)===-1)out.push(n);
    });
    if(!out.length && t&&t.dimsPorContrato){Object.keys(t.dimsPorContrato).forEach(function(n){if(out.indexOf(n)===-1)out.push(n);});}
    return out;
  }
  function calcThird(t,nit){
    var contracts=contractNumbers(t),answeredContracts=0,totalControls=0,answeredControls=0,vals=[];
    if(contracts.length){
      contracts.forEach(function(c){
        var s=calcContract(t,nit,c);totalControls+=s.total;answeredControls+=s.answered;if(s.complete)answeredContracts++;
        if(s.vals&&s.vals.length)vals=vals.concat(s.vals);
      });
    }else{
      var s=calcContract(t,nit,'');totalControls=s.total;answeredControls=s.answered;if(s.vals&&s.vals.length)vals=vals.concat(s.vals);
    }
    var pct=totalControls?Math.round(answeredControls/totalControls*100):0;
    var avg=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
    var maturity=null;
    if(avg!==null){
      try{if(typeof window._calcMadurezTipologia==='function')maturity=window._calcMadurezTipologia([avg]);}catch(e){}
    }
    return {contracts:contracts.length,answeredContracts:answeredContracts,totalControls:totalControls,answeredControls:answeredControls,pct:pct,avg:avg,maturity:maturity};
  }

  function syncVisible(nit){
    nit=norm(nit||activeNit()); if(!nit)return '';
    var r=responses();if(!r[nit])r[nit]={};
    var nk=nit.replace(/[^a-z0-9]/gi,'_');
    Array.prototype.forEach.call(document.querySelectorAll('select[id^="qa_'+nk+'_"]'),function(el){
      var oc=el.getAttribute('onchange')||'';
      var m=oc.match(/onChangeAtribCuest\('([^']*)','([^']*)',(\d+),(\d+)\)/);if(!m)return;
      var key=m[2],cn=parseInt(m[3],10),ai=parseInt(m[4],10);
      if(!r[nit][key])r[nit][key]={};if(!r[nit][key][cn])r[nit][key][cn]={};
      r[nit][key][cn]['a'+ai]=el.value||'';
    });
    Array.prototype.forEach.call(document.querySelectorAll('textarea[id^="obs_'+nk+'_"]'),function(el){
      var oc=el.getAttribute('onchange')||'';
      var m=oc.match(/onChangeObsCuest\('([^']*)','([^']*)',(\d+),/);if(!m)return;
      var key=m[2],cn=parseInt(m[3],10);if(!r[nit][key])r[nit][key]={};if(!r[nit][key][cn])r[nit][key][cn]={};r[nit][key][cn].obs=el.value||'';
    });
    var t=db()[nit];if(t){
      var c=activeContract(nit);t.respuestasAC=clone(r[nit]);
      if(c){t.respuestasACPorContrato=t.respuestasACPorContrato||{};t.respuestasACPorContrato[c]=clone(r[nit]);t.contratoEval=c;t.modoEval='contrato';}
      t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    }
    return nit;
  }
  function localSnapshot(nit){
    nit=norm(nit||activeNit());
    try{
      var r=responses(),d=db();
      localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(r));
      localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(d));
      var state={};try{state=JSON.parse(localStorage.getItem('sgrt_v8')||'{}')||{};}catch(e){state={};}
      state.CUEST_RESPUESTAS=r;state.TERCEROS_DB=d;
      if(window.CUEST_CTRL_CUSTOM)state.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM;
      if(window.TIPOLOGIAS_DB_CUSTOM)state.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM;
      if(window._persHiddenControls)state.PERS_HIDDEN=window._persHiddenControls;
      localStorage.setItem('sgrt_v8',JSON.stringify(state));
      return true;
    }catch(e){console.error('[SGRT40] snapshot:',e);return false;}
  }
  function remoteSave(nit){
    var t=db()[nit];if(!t)return Promise.resolve(false);
    if(typeof window._sgrtUpsertEstadoCompleto==='function'){
      try{return Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).then(function(){t._changed=false;t.sincronizado=true;localSnapshot(nit);return true;}).catch(function(e){console.warn('[SGRT40] remoto pendiente:',e);return false;});}catch(e){return Promise.resolve(false);}
    }
    return Promise.resolve(false);
  }

  /* Validación: solo bloquea campos VISIBLES y HABILITADOS que realmente faltan.
     Los atributos deshabilitados por "No" / "No aplica" NO son pendientes. */
  window.acAlertaNoContinuar=function(){
    var nit=activeNit();if(!nit){try{window.showToast&&window.showToast('Selecciona un tercero para evaluar','error',2500);}catch(e){}return false;}
    syncVisible(nit);
    var panel=document.getElementById('cq-panel-cuest')||document.getElementById('q-secciones-wrap');if(!panel)return true;
    var missing=[];
    Array.prototype.forEach.call(panel.querySelectorAll('select[id^="qa_"]'),function(s){
      if(s.disabled)return;
      if(s.offsetParent===null)return;
      if(!norm(s.value)||s.value==='0'){missing.push(s);s.style.borderColor='#dc3545';s.style.background='#fff7f7';}
      else{s.style.borderColor='';s.style.background='';}
    });
    if(missing.length){try{window.showToast&&window.showToast('Faltan '+missing.length+' respuesta(s) habilitada(s). Los campos deshabilitados por “No” o “No aplica” no cuentan como pendientes.','error',4200);}catch(e){}return false;}
    return true;
  };

  function recomputeSavedProgress(nit){
    var t=db()[nit];if(!t)return;
    var c=activeContract(nit),s=calcContract(t,nit,c);
    t.acAvance=s.pct;
    if(c){
      t.acAvancePorContrato=t.acAvancePorContrato||{};t.acAvancePorContrato[c]=s.pct;
      t.promACPorContrato=t.promACPorContrato||{};
      t.promACPorContrato[c]={avance:s.pct,prom:s.avg===null?0:Number(s.avg.toFixed(2)),fecha:new Date().toISOString()};
    }
    var g=calcThird(t,nit);t.acAvanceGeneral=g.pct;t.contratosACRespondidos=g.answeredContracts;t.contratosACTotal=g.contracts;t.acEstado=g.pct===100?'Completado':(g.answeredControls>0?'En progreso':'Sin iniciar');t.estado=g.pct===100?'Completado':((String(t.estado||'').toLowerCase().indexOf('aprob')>=0)?t.estado:'Aprobado');
    if(g.avg!==null)t.promAC=Number(g.avg.toFixed(2));
    t.savedAt=new Date().toISOString();t._changed=true;t.sincronizado=false;
  }

  function saveDraft(){
    var nit=syncVisible();if(!nit){try{window.showToast&&window.showToast('Selecciona un tercero primero','error',2500);}catch(e){}return false;}
    recomputeSavedProgress(nit);localSnapshot(nit);
    try{
      var fecha=new Date().toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
      localStorage.setItem('cuest_borrador_'+nit,JSON.stringify({nit:nit,fecha:fecha,contrato:activeContract(nit),respuestas:clone(responses()[nit]||{}),customCtrls:clone((window.CUEST_CTRL_CUSTOM||{})[nit]||{})}));
      var info=document.getElementById('q-borrador-info'),ts=document.getElementById('q-borrador-ts');if(info)info.style.display='block';if(ts)ts.textContent='Borrador guardado el '+fecha+'.';
      try{window.showToast&&window.showToast('💾 Borrador guardado en este equipo. Sincronizando...','success',1800);}catch(e){}
      remoteSave(nit).then(function(ok){try{window.showToast&&window.showToast(ok?'✅ Borrador guardado y sincronizado. Otro usuario podrá verlo.':'⚠️ Borrador guardado en este equipo, pero la sincronización con el servidor quedó pendiente.',ok?'success':'warning',3800);}catch(e){}});
      return true;
    }catch(e){console.error('[SGRT40] borrador:',e);try{window.showToast&&window.showToast('❌ Error al guardar el borrador. No actualices todavía.','error',3500);}catch(ex){}return false;}
  }

  function installSaves(){
    window.guardarBorradorCuestionario=saveDraft;
    if(typeof window.guardarCuestionarioCompleto==='function'&&!window.guardarCuestionarioCompleto.__sgrt40){
      var old=window.guardarCuestionarioCompleto;
      var wrap=function(){
        var nit=activeNit();if(!window.acAlertaNoContinuar())return false;
        syncVisible(nit);recomputeSavedProgress(nit);localSnapshot(nit);
        var ret=old.apply(this,arguments);
        syncVisible(nit);recomputeSavedProgress(nit);localSnapshot(nit);remoteSave(nit);
        try{window.showToast&&window.showToast('✅ Cuestionario guardado. Progreso: '+((db()[nit]||{}).acAvance||0)+'%.','success',3200);}catch(e){}
        return ret;
      };wrap.__sgrt40=true;window.guardarCuestionarioCompleto=wrap;
    }
  }

  function levelText(s){
    if(!s||s.avg===null)return 'Sin valoración';
    var m=s.maturity||{};var label=m.madurez||m.nivel||'';var pct=(m.pct!==undefined?m.pct:null);
    return s.avg.toFixed(2)+(label?' — '+label:'')+(pct!==null?' ('+pct+'%)':'');
  }
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function adminSummary(){
    // El consolidado 42 dibuja una sola vista para evitar duplicados y doble trabajo.
    if(window._sgrt42Active)return;
    var wrap=document.getElementById('cq-reportes-body');if(!wrap)return;
    var role=(window.currentUser||{}).rol||'';if(role!=='Operativo'&&role!=='admin_riesgos'&&role!=='Administrador de Riesgos')return;
    var old=document.getElementById('sgrt40-admin-ac-summary');if(old)old.remove();
    var list=Object.keys(db()).map(function(nit){return {nit:nit,t:db()[nit],s:calcThird(db()[nit],nit)};}).filter(function(x){return x.t&&!x.t.bloqueado;});
    var box=document.createElement('div');box.id='sgrt40-admin-ac-summary';box.className='card';box.style.cssText='margin-bottom:16px;border:1px solid #bfdbfe;overflow:hidden;';
    var rows=list.map(function(x,i){
      var s=x.s,totalContracts=s.contracts||0,responded=s.answeredContracts||0;
      var prog=s.pct,pc=prog===100?'#16a34a':prog>0?'#f97316':'#94a3b8';
      return '<tr style="background:'+(i%2?'#f8fbff':'white')+';border-bottom:1px solid #e5e7eb;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;">'+esc(x.t.nombre||'—')+'</div><div style="font-size:10px;color:#94a3b8;">'+esc(x.nit)+'</div></td>'
        +'<td style="padding:9px 12px;text-align:center;font-weight:800;color:#1a3a5c;">'+responded+' / '+totalContracts+'</td>'
        +'<td style="padding:9px 12px;min-width:155px;"><div style="display:flex;align-items:center;gap:7px;"><div style="flex:1;height:7px;background:#e5e7eb;border-radius:5px;overflow:hidden;"><div style="height:100%;width:'+prog+'%;background:'+pc+';"></div></div><b style="font-size:11px;color:'+pc+';">'+prog+'%</b></div><div style="font-size:9.5px;color:#64748b;margin-top:3px;">'+s.answeredControls+' / '+s.totalControls+' controles respondidos</div></td>'
        +'<td style="padding:9px 12px;font-size:11px;font-weight:700;color:#334155;">'+esc(levelText(s))+'</td>'
        +'</tr>';
    }).join('');
    box.innerHTML='<div style="padding:12px 14px;background:linear-gradient(90deg,#1a3a5c,#1e6bb8);color:white;"><div style="font-size:13px;font-weight:800;">Resumen general — Ambiente de Control</div><div style="font-size:10.5px;opacity:.85;margin-top:2px;">Información compartida con el Evaluador. “No” y “No aplica” cuentan como respuestas para completar el progreso.</div></div>'
      +'<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;min-width:720px;"><thead><tr style="background:#eff6ff;">'
      +'<th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Tercero / NIT</th><th style="padding:9px 12px;text-align:center;color:#1e3a5f;">Contratos respondidos</th><th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Progreso general</th><th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Nivel general</th></tr></thead><tbody>'
      +(rows||'<tr><td colspan="4" style="padding:18px;text-align:center;color:#94a3b8;">Sin datos de Ambiente de Control.</td></tr>')+'</tbody></table></div>';
    wrap.insertBefore(box,wrap.firstChild);
  }

  function installContractReportFilter(){
    window.filterContratoReport=function(terceroNit,contratoNum){
      window._rptFiltroContrato=contratoNum||'';
      var t=db()[terceroNit];
      if(t){
        t.contratoEval=contratoNum||t.contratoEval||'';
        if(contratoNum && t.respuestasACPorContrato && t.respuestasACPorContrato[contratoNum]) responses()[terceroNit]=clone(t.respuestasACPorContrato[contratoNum]);
        else if(!contratoNum && t.respuestasAC) responses()[terceroNit]=clone(t.respuestasAC);
      }
      try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
    };
  }

  /* Trae estado SGRT de otros navegadores/roles sin bloquear la interfaz.
     Máximo 3 solicitudes simultáneas y un refresco por ventana de 20 s. */
  var remoteBusy=false,lastRemote=0;
  function hydrateAdminRemote(){
    var role=(window.currentUser||{}).rol||'';if(role!=='Operativo'&&role!=='admin_riesgos'&&role!=='Administrador de Riesgos')return Promise.resolve(false);
    var api='';try{api=(typeof API_BASE!=='undefined'&&API_BASE)?API_BASE:(window.API_BASE||'');}catch(e){api=window.API_BASE||'';}
    if(remoteBusy||Date.now()-lastRemote<20000||!api)return Promise.resolve(false);
    var nits=Object.keys(db());if(!nits.length)return Promise.resolve(false);
    remoteBusy=true;lastRemote=Date.now();var base=String(api).replace(/\/$/,'');var idx=0,changed=false;
    function worker(){
      if(idx>=nits.length)return Promise.resolve();
      var nit=nits[idx++];
      return fetch(base+'/api/sgrt-state/'+encodeURIComponent(nit),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
        var sx=j&&j.ok&&j.data?j.data:null;if(!sx)return;
        var remote=(sx.estado_sgrt&&typeof sx.estado_sgrt==='object')?sx.estado_sgrt:sx;if(!remote||typeof remote!=='object')return;
        var local=db()[nit]||{};db()[nit]=Object.assign({},local,remote,{nit:nit});
        if(remote.respuestasAC&&typeof remote.respuestasAC==='object')responses()[nit]=clone(remote.respuestasAC);
        else if(remote.respuestasACPorContrato&&typeof remote.respuestasACPorContrato==='object'){var ce=norm(remote.contratoEval);if(ce&&remote.respuestasACPorContrato[ce])responses()[nit]=clone(remote.respuestasACPorContrato[ce]);}
        changed=true;
      }).catch(function(){}).then(worker);
    }
    var jobs=[];for(var i=0;i<Math.min(3,nits.length);i++)jobs.push(worker());
    return Promise.all(jobs).then(function(){remoteBusy=false;if(changed){localSnapshot('');if(window._sgrt42Active&&typeof window._sgrt42AdminSummary==='function')window._sgrt42AdminSummary();else adminSummary();}return changed;}).catch(function(){remoteBusy=false;return false;});
  }

  function installAdminRender(){
    if(typeof window.renderReportesAC==='function'&&!window.renderReportesAC.__sgrt40){
      var old=window.renderReportesAC;
      var wrap=function(){var r=old.apply(this,arguments);installContractReportFilter();setTimeout(function(){adminSummary();hydrateAdminRemote().then(function(ch){if(ch){if(window._sgrt42Active&&typeof window._sgrt42AdminSummary==='function')window._sgrt42AdminSummary();else adminSummary();installContractReportFilter();}});},0);return r;};
      wrap.__sgrt40=true;window.renderReportesAC=wrap;
    }
  }

  function visualPolish(){
    var panel=document.getElementById('cq-panel-cuest')||document.getElementById('q-secciones-wrap');if(!panel)return;
    Array.prototype.forEach.call(panel.querySelectorAll('textarea[id^="obs_"]'),function(el){
      el.rows=Math.max(parseInt(el.rows||0,10)||0,4);el.style.minHeight='96px';el.style.width='100%';el.style.resize='vertical';el.style.boxSizing='border-box';
      if(!el.placeholder||/observ/i.test(el.placeholder))el.placeholder='Escribe aquí las observaciones, hallazgos o comentarios del control...';
    });
    Array.prototype.forEach.call(panel.querySelectorAll('option'),function(op){
      if(op.value==='Si'&&norm(op.textContent)==='Si')op.textContent='Sí';
      if(op.value==='No Aplica')op.textContent='No aplica';
    });
    Array.prototype.forEach.call(panel.querySelectorAll('label,th,h3,h4,button,span'),function(el){
      if(el.children.length)return;var s=norm(el.textContent);var map={'Observacion':'Observación','Observaciones:':'Observaciones','Tipologia':'Tipología','Evaluacion':'Evaluación'};if(map[s])el.textContent=map[s];
    });
  }
  var polishTimer=null;
  function schedulePolish(){clearTimeout(polishTimer);polishTimer=setTimeout(visualPolish,80);}

  function flush(){if(window._sgrt42Active)return;try{var nit=syncVisible();if(nit){recomputeSavedProgress(nit);localSnapshot(nit);}}catch(e){}}
  window._sgrt40CalcThird=calcThird;
  window._sgrt40CalcContract=calcContract;

  function init(){
    if(!window._sgrt42Active)installSaves();installAdminRender();schedulePolish();
    setTimeout(function(){if(!window._sgrt42Active)installSaves();installAdminRender();schedulePolish();},700);
    document.addEventListener('change',function(e){var id=(e.target&&e.target.id)||'';if(!window._sgrt42Active&&id.indexOf('qa_')===0){var nit=activeNit();setTimeout(function(){syncVisible(nit);recomputeSavedProgress(nit);localSnapshot(nit);},40);}schedulePolish();},true);
    window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',flush);
    document.addEventListener('visibilitychange',function(){if(document.hidden)flush();});
    var panel=document.getElementById('cq-panel-cuest')||document.getElementById('q-secciones-wrap');
    if(panel&&window.MutationObserver&&!window._sgrt42Active){new MutationObserver(schedulePolish).observe(panel,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
