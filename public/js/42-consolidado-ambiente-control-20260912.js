/*
 * SGRT — Consolidado Ambiente de Control (2026-09-12)
 * Alcance: correcciones solicitadas sin cambiar estructura, tablas ni backend.
 * - Guardado estable de borrador/completo por tercero + contrato.
 * - Progreso real: No / No aplica / No implementado cuentan como control respondido.
 * - Si el control está implementado/parcial, solo cuenta cuando sus atributos habilitados están diligenciados.
 * - Resumen del Administrador con contratos respondidos, progreso y nivel de madurez general + por contrato.
 * - Filtro único por tercero/contrato en el detalle; elimina botones repetidos “Todos / Ver todos”.
 * - Ortografía visual y nombres puntuales solicitados.
 * - Throttle de guardado/sincronización para evitar picos de CPU/memoria.
 */
(function(){
  'use strict';
  // Desactiva el resumen anterior del parche 40 para evitar doble renderizado y consumo innecesario.
  window._sgrt42Active=true;

  function norm(v){ return String(v == null ? '' : v).trim(); }
  function plain(v){
    var s=norm(v).toLowerCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
    return s;
  }
  function clone(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function esc(v){return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function db(){ if(!window.TERCEROS_DB) window.TERCEROS_DB={}; return window.TERCEROS_DB; }
  function responses(){ if(!window.CUEST_RESPUESTAS) window.CUEST_RESPUESTAS={}; return window.CUEST_RESPUESTAS; }

  function canon(v){
    var p=plain(v);
    if(p==='si'||p==='yes'||p==='true'||p==='1')return 'Si';
    if(p==='no'||p==='no implementado'||p==='no implementada'||p==='no existe')return 'No';
    if(p==='no aplica'||p==='no_aplica'||p==='n/a'||p==='na')return 'No Aplica';
    if(p==='parcial'||p==='parcialmente')return 'Parcial';
    return norm(v);
  }
  function isAnsweredValue(v){ return ['Si','No','No Aplica','Parcial'].indexOf(canon(v))>=0; }
  function controlAnswered(r){
    r=r||{};
    var a1=canon(r.a1);
    // No y No aplica cierran el control: los demás atributos quedan deshabilitados/N.A.
    if(a1==='No'||a1==='No Aplica')return true;
    if(a1!=='Si'&&a1!=='Parcial')return false;
    // Si está implementado/parcial, los otros cinco atributos habilitados sí deben estar diligenciados.
    for(var i=2;i<=6;i++) if(!isAnsweredValue(r['a'+i])) return false;
    return true;
  }
  function normalizedResp(r){
    r=clone(r||{});
    for(var i=1;i<=6;i++) if(r['a'+i]!==undefined) r['a'+i]=canon(r['a'+i]);
    return r;
  }

  function activeNit(){
    return norm(window.nitActual)||norm((document.getElementById('q-tercero')||{}).value)||norm((document.getElementById('ac-tercero-instruc')||{}).value);
  }
  function activeContract(nit){
    var t=db()[nit]||{};
    return norm((document.getElementById('q-contrato-sel')||{}).value)||norm((document.getElementById('ac-contrato-sel')||{}).value)||norm(t.contratoEval);
  }
  function contractNumbers(t){
    var out=[];
    ((t&&Array.isArray(t.contratos))?t.contratos:[]).forEach(function(c){
      if(!c)return;var n=norm(c.num||c.numero||c.NoContrato);if(!n)return;
      var approved=(c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado'||c.aprobado===true||(t.aprobadoPorContrato&&t.aprobadoPorContrato[n]));
      if(approved&&out.indexOf(n)<0)out.push(n);
    });
    if(!out.length&&t&&t.dimsPorContrato)Object.keys(t.dimsPorContrato).forEach(function(n){if(out.indexOf(n)<0)out.push(n);});
    return out;
  }
  function dimsFor(t,c){
    if(!t)return [];
    if(c&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[c])&&t.dimsPorContrato[c].length)return t.dimsPorContrato[c];
    try{if(typeof window._sgrtGetContractDims==='function'){var x=window._sgrtGetContractDims(t,c);if(Array.isArray(x)&&x.length)return x;}}catch(e){}
    return Array.isArray(t.dims)?t.dims:[];
  }
  function controlsFor(nit,key,c){
    try{if(typeof window._ctrlsCuest==='function')return window._ctrlsCuest(nit,key,c)||[];}catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]);
  }
  function responseSetFor(t,nit,c){
    if(c&&t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[c])return t.respuestasACPorContrato[c]||{};
    if(c&&t&&norm(t.contratoEval)===c&&t.respuestasAC)return t.respuestasAC||{};
    if(!c&&t&&t.respuestasAC)return t.respuestasAC||{};
    return responses()[nit]||{};
  }
  function valuation(r){
    try{if(typeof window._calcCtrlValoracion==='function')return window._calcCtrlValoracion(normalizedResp(r));}catch(e){}
    return {pct:0,valorMad:null,madurez:'NO APLICA'};
  }
  function maturity(vals){
    try{if(typeof window._calcMadurezTipologia==='function')return window._calcMadurezTipologia(vals);}catch(e){}
    var v=(vals||[]).filter(function(x){return x!==null&&!isNaN(Number(x));}).map(Number);
    if(!v.length)return {promedio:0,pct:0,madurez:'NO APLICA'};
    var avg=Math.round((v.reduce(function(a,b){return a+b;},0)/v.length)*10)/10;
    return {promedio:avg,pct:Math.round(avg/5*100),madurez:avg===5?'OPTIMIZADO':avg>=4?'ADMINISTRADO':avg>=3?'DEFINIDO':avg>=2?'REPETIBLE':avg>=.1?'INICIAL':'NO EXISTE'};
  }
  function calcContract(t,nit,c){
    var rr=responseSetFor(t,nit,c),total=0,answered=0,vals=[];
    dimsFor(t,c).forEach(function(d){
      var key=d.key||d.clave||'';if(!key)return;
      controlsFor(nit,key,c).forEach(function(ctrl){
        total++;
        var r=(rr[key]&&rr[key][ctrl.n])||{};
        if(controlAnswered(r))answered++;
        if(isAnsweredValue(r.a1)){
          var v=valuation(r);if(v&&v.valorMad!==null&&v.valorMad!==undefined&&!isNaN(Number(v.valorMad)))vals.push(Number(v.valorMad));
        }
      });
    });
    var m=maturity(vals),pct=total?Math.round(answered/total*100):0;
    return {total:total,answered:answered,pct:pct,vals:vals,maturity:m,complete:total>0&&answered===total};
  }
  function calcThird(t,nit){
    var cons=contractNumbers(t),total=0,answered=0,answeredContracts=0,vals=[];
    if(cons.length){cons.forEach(function(c){var s=calcContract(t,nit,c);total+=s.total;answered+=s.answered;if(s.complete)answeredContracts++;vals=vals.concat(s.vals||[]);});}
    else{var s=calcContract(t,nit,'');total=s.total;answered=s.answered;vals=vals.concat(s.vals||[]);}
    return {contracts:cons.length,answeredContracts:answeredContracts,totalControls:total,answeredControls:answered,pct:total?Math.round(answered/total*100):0,maturity:maturity(vals),vals:vals};
  }
  window._sgrt42CalcContract=calcContract;
  window._sgrt42CalcThird=calcThird;

  function syncVisible(nit){
    nit=norm(nit||activeNit());if(!nit)return '';
    var r=responses();if(!r[nit])r[nit]={};var nk=nit.replace(/[^a-z0-9]/gi,'_');
    Array.prototype.forEach.call(document.querySelectorAll('select[id^="qa_'+nk+'_"]'),function(el){
      var oc=el.getAttribute('onchange')||'',m=oc.match(/onChangeAtribCuest\('([^']*)','([^']*)',(\d+),(\d+)\)/);if(!m)return;
      var key=m[2],cn=parseInt(m[3],10),ai=parseInt(m[4],10);if(!r[nit][key])r[nit][key]={};if(!r[nit][key][cn])r[nit][key][cn]={};r[nit][key][cn]['a'+ai]=canon(el.value);
    });
    Array.prototype.forEach.call(document.querySelectorAll('textarea[id^="obs_'+nk+'_"]'),function(el){
      var oc=el.getAttribute('onchange')||'',m=oc.match(/onChangeObsCuest\('([^']*)','([^']*)',(\d+),/);if(!m)return;
      var key=m[2],cn=parseInt(m[3],10);if(!r[nit][key])r[nit][key]={};if(!r[nit][key][cn])r[nit][key][cn]={};r[nit][key][cn].obs=el.value||'';
    });
    var t=db()[nit];if(t){
      var c=activeContract(nit);t.respuestasAC=clone(r[nit]);
      if(c){t.respuestasACPorContrato=t.respuestasACPorContrato||{};t.respuestasACPorContrato[c]=clone(r[nit]);t.contratoEval=c;t.modoEval='contrato';}
      t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    }
    return nit;
  }

  var lastWrite={};
  function writeIfChanged(k,v){
    try{var s=typeof v==='string'?v:JSON.stringify(v);if(lastWrite[k]===s)return true;if(localStorage.getItem(k)!==s)localStorage.setItem(k,s);lastWrite[k]=s;return true;}catch(e){console.warn('[SGRT42] localStorage',k,e);return false;}
  }
  function lightSnapshot(nit){
    nit=norm(nit||activeNit());
    try{
      // Las respuestas son mucho más pequeñas que TERCEROS_DB (que puede contener evidencias en base64).
      // Esto protege contra picos de memoria mientras se diligencia control por control.
      writeIfChanged('sgrt_cuest_respuestas',responses());
      writeIfChanged('sgrt_last_change_v1',JSON.stringify({kind:'respuestas-ac',nit:nit,contrato:activeContract(nit),ts:Date.now()}));
      return true;
    }catch(e){return false;}
  }
  window._sgrt42LightSnapshot=lightSnapshot;

  function localSnapshot(nit){
    nit=norm(nit||activeNit());
    try{
      var r=responses(),d=db();writeIfChanged('sgrt_cuest_respuestas',r);writeIfChanged('sgrt_terceros_db_shared',d);
      var st={};try{st=JSON.parse(localStorage.getItem('sgrt_v8')||'{}')||{};}catch(e){st={};}
      st.CUEST_RESPUESTAS=r;st.TERCEROS_DB=d;if(window.CUEST_CTRL_CUSTOM)st.CUEST_CTRL_CUSTOM=window.CUEST_CTRL_CUSTOM;if(window.TIPOLOGIAS_DB_CUSTOM)st.TIPOLOGIAS_DB_CUSTOM=window.TIPOLOGIAS_DB_CUSTOM;if(window._persHiddenControls)st.PERS_HIDDEN=window._persHiddenControls;
      writeIfChanged('sgrt_v8',st);writeIfChanged('sgrt_last_change_v1',JSON.stringify({kind:'ambiente-control',nit:nit,contrato:activeContract(nit),ts:Date.now()}));return true;
    }catch(e){return false;}
  }
  function recompute(nit){
    var t=db()[nit];if(!t)return null;var c=activeContract(nit),s=calcContract(t,nit,c),g=calcThird(t,nit),now=new Date().toISOString();
    t.acAvance=s.pct;t.acAvanceGeneral=g.pct;t.contratosACRespondidos=g.answeredContracts;t.contratosACTotal=g.contracts;
    if(c){t.acAvancePorContrato=t.acAvancePorContrato||{};t.acAvancePorContrato[c]=s.pct;t.promACPorContrato=t.promACPorContrato||{};t.promACPorContrato[c]={avance:s.pct,prom:s.maturity.promedio||0,madurez:s.maturity.madurez||'NO APLICA',pctMadurez:s.maturity.pct||0,fecha:now};}
    t.promAC=g.maturity.promedio||0;t.nivelMadurezAC=g.maturity.madurez||'NO APLICA';t.pctMadurezAC=g.maturity.pct||0;
    t.acEstado=g.pct===100?'Completado':(g.answeredControls>0?'En progreso':'Sin iniciar');
    if(g.pct===100)t.estado='Completado';else if(!/aprob/i.test(norm(t.estado)))t.estado='Aprobado';
    t.savedAt=now;t._changed=true;t.sincronizado=false;return {current:s,general:g,contract:c};
  }

  var remoteBusy={},remoteQueued={};
  function remoteSave(nit){
    nit=norm(nit);var t=db()[nit];if(!nit||!t||typeof window._sgrtUpsertEstadoCompleto!=='function')return Promise.resolve(false);
    if(remoteBusy[nit]){remoteQueued[nit]=true;return Promise.resolve(false);}
    remoteBusy[nit]=true;
    var p;try{p=Promise.resolve(window._sgrtUpsertEstadoCompleto(t));}catch(e){p=Promise.reject(e);}
    return p.then(function(res){if(res===false||(res&&res.ok===false))throw new Error('Servidor no confirmó');t._changed=false;t.sincronizado=true;localSnapshot(nit);return true;}).catch(function(e){t._changed=true;t.sincronizado=false;console.warn('[SGRT42] sincronización pendiente',e);return false;}).finally(function(){remoteBusy[nit]=false;if(remoteQueued[nit]){remoteQueued[nit]=false;setTimeout(function(){remoteSave(nit);},800);}});
  }

  function validateCurrent(){
    var nit=activeNit();if(!nit){try{window.showToast&&window.showToast('Selecciona un tercero para evaluar.','error',2600);}catch(e){}return false;}
    syncVisible(nit);
    var t=db()[nit]||{},c=activeContract(nit),rr=responseSetFor(t,nit,c),missingControls=[];
    dimsFor(t,c).forEach(function(d){
      var key=d.key||d.clave||'';if(!key)return;
      controlsFor(nit,key,c).forEach(function(ctrl){var r=(rr[key]&&rr[key][ctrl.n])||{};if(!controlAnswered(r))missingControls.push({key:key,n:ctrl.n});});
    });
    // Marcar únicamente los selectores visibles asociados a controles pendientes.
    var panel=document.getElementById('q-secciones-wrap')||document.getElementById('cq-panel-cuest');
    if(panel)Array.prototype.forEach.call(panel.querySelectorAll('select[id^="qa_"]'),function(el){el.style.borderColor='';el.style.background='';});
    missingControls.forEach(function(m){
      if(!panel)return;var nk=nit.replace(/[^a-z0-9]/gi,'_');
      Array.prototype.forEach.call(panel.querySelectorAll('select[id^="qa_'+nk+'_'+m.key+'_'+m.n+'_"]'),function(el){if(!el.disabled){el.style.borderColor='#dc3545';el.style.background='#fff7f7';}});
    });
    if(missingControls.length){try{window.showToast&&window.showToast('Faltan '+missingControls.length+' control(es) por completar. “No”, “No aplica” y “No implementado” sí cuentan como controles respondidos.','error',4600);}catch(e){}return false;}
    return true;
  }
  window.acAlertaNoContinuar=validateCurrent;

  function stampDraft(nit){
    var fecha=new Date().toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    try{localStorage.setItem('cuest_borrador_'+nit,JSON.stringify({nit:nit,fecha:fecha,contrato:activeContract(nit),respuestas:clone(responses()[nit]||{}),customCtrls:clone((window.CUEST_CTRL_CUSTOM||{})[nit]||{})}));}catch(e){}
    var info=document.getElementById('q-borrador-info'),ts=document.getElementById('q-borrador-ts');if(info)info.style.display='block';if(ts)ts.textContent='Borrador guardado el '+fecha+'. Puedes actualizar sin perder estas respuestas en este equipo.';
  }
  function saveDraft(){
    var nit=syncVisible();if(!nit){try{window.showToast&&window.showToast('Selecciona un tercero primero.','error',2500);}catch(e){}return false;}
    var s=recompute(nit);localSnapshot(nit);stampDraft(nit);
    try{window.showToast&&window.showToast('💾 Borrador guardado. Sincronizando…','success',1800);}catch(e){}
    remoteSave(nit).then(function(ok){try{window.showToast&&window.showToast(ok?'✅ Borrador guardado y sincronizado. Ya puede verlo el otro rol.':'⚠️ Borrador guardado localmente; la sincronización con el servidor está pendiente.',ok?'success':'warning',3900);}catch(e){}});
    updateProgressUI(nit,s);return true;
  }
  function saveFull(){
    if(!validateCurrent())return false;var nit=syncVisible(),s=recompute(nit);if(!s)return false;
    localSnapshot(nit);
    try{responses()[nit].__savedAt=new Date().toISOString();responses()[nit].__nombre=(db()[nit]||{}).nombre||nit;}catch(e){}
    try{localStorage.removeItem('cuest_borrador_'+nit);}catch(e){}var bi=document.getElementById('q-borrador-info');if(bi)bi.style.display='none';
    try{if(typeof window.addLog==='function')window.addLog((db()[nit]||{}).nombre||nit,'CUESTIONARIO_AC','Guardado','—','Cuestionario AC guardado. Progreso del contrato: '+s.current.pct+'%. Progreso general: '+s.general.pct+'%.',new Date().toLocaleDateString('es-CO'),'Datos Maestros');}catch(e){}
    updateProgressUI(nit,s);
    remoteSave(nit).then(function(ok){try{window.showToast&&window.showToast((ok?'✅ Guardado y sincronizado. ':'⚠️ Guardado localmente; sincronización pendiente. ')+(s.contract?'Contrato '+s.contract+': ':'')+s.current.pct+'% · General: '+s.general.pct+'%.',ok?'success':'warning',4300);}catch(e){}});
    try{setTimeout(function(){window.renderReportesAC&&window.renderReportesAC();},80);}catch(e){}
    return true;
  }
  function installSaveFinal(){window.guardarBorradorCuestionario=saveDraft;window.guardarCuestionarioCompleto=saveFull;}

  function updateProgressUI(nit,s){
    s=s||recompute(nit);if(!s)return;var pct=s.current.pct,count=s.current.answered+'/'+s.current.total;
    var p=document.getElementById('q-progreso-pct-lbl'),c=document.getElementById('q-progreso-count-lbl'),b=document.getElementById('q-progreso-bar'),r=document.getElementById('q-resumen-progreso'),qi=document.getElementById('qi-progreso'),tl=document.getElementById('q-progreso-tip-lbl');
    if(p){p.textContent=pct+'%';p.style.color=pct===100?'#28a745':'#1e6bb8';}
    if(c)c.textContent=s.current.answered+' de '+s.current.total+' controles respondidos';
    if(b){b.style.width=pct+'%';b.style.background=pct<30?'linear-gradient(90deg,#dc3545,#fd7e14)':pct<70?'linear-gradient(90deg,#fd7e14,#ffc107)':'linear-gradient(90deg,#1e6bb8,#28a745)';}
    if(r)r.innerHTML='<b>'+s.current.answered+'/'+s.current.total+'</b> controles respondidos &nbsp;·&nbsp; <b>'+pct+'%</b> completado';
    if(qi)qi.textContent=s.current.answered+'/'+s.current.total+' ('+pct+'%)';
    if(tl){
      var t=db()[nit]||{},cc=s.contract||activeContract(nit),rr=responseSetFor(t,nit,cc),dims=dimsFor(t,cc),done=0,totalTips=0;
      dims.forEach(function(d){var key=d.key||d.clave||'',ctrls=controlsFor(nit,key,cc);if(!key||!ctrls.length)return;totalTips++;if(ctrls.every(function(ctrl){return controlAnswered((rr[key]&&rr[key][ctrl.n])||{});}))done++;});
      tl.textContent=done+'/'+totalTips+' tipologías completas';
      if(pct===100&&s.current.total>0)tl.innerHTML=done+'/'+totalTips+' tipologías completas &nbsp;·&nbsp; <span style="color:#16A34A;font-weight:800;">✅ Cuestionario completo — guardado automáticamente</span>';
    }
  }
  function installProgressFinal(){
    // Sustituye el contador antiguo para que “No”, “No aplica” y “No implementado” cuenten y el 100% sea coherente.
    window.actualizarProgressoCuest=function(nit){
      nit=norm(nit||activeNit());if(!nit)return;var t=db()[nit];if(!t)return;
      var c=activeContract(nit),s={current:calcContract(t,nit,c),general:calcThird(t,nit),contract:c};
      updateProgressUI(nit,s);return s.current.pct;
    };
  }

  function levelText(s){
    var m=(s&&s.maturity)||{};if(!s||!s.vals||!s.vals.length)return 'Sin valoración';
    return (m.promedio!==undefined?Number(m.promedio).toFixed(1):'—')+' — '+(m.madurez||'Sin nivel')+' ('+(m.pct||0)+'%)';
  }
  function detailRows(t,nit){
    var cons=contractNumbers(t),rows='';
    if(cons.length)cons.forEach(function(c){var s=calcContract(t,nit,c);rows+='<tr><td style="padding:7px 9px;font-weight:700;color:#1a3a5c;">'+esc(c)+'</td><td style="padding:7px 9px;text-align:center;">'+s.answered+' / '+s.total+'</td><td style="padding:7px 9px;text-align:center;font-weight:800;">'+s.pct+'%</td><td style="padding:7px 9px;">'+esc(levelText(s))+'</td></tr>';});
    else{var s=calcContract(t,nit,'');rows='<tr><td style="padding:7px 9px;font-weight:700;color:#1a3a5c;">Sin contrato</td><td style="padding:7px 9px;text-align:center;">'+s.answered+' / '+s.total+'</td><td style="padding:7px 9px;text-align:center;font-weight:800;">'+s.pct+'%</td><td style="padding:7px 9px;">'+esc(levelText(s))+'</td></tr>';}
    return rows;
  }
  window._sgrt42ToggleDetail=function(id){var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'table-row':'none';};

  function adminSummary(){
    var wrap=document.getElementById('cq-reportes-body');if(!wrap)return;var role=norm((window.currentUser||{}).rol);if(['Operativo','admin_riesgos','Administrador de Riesgos'].indexOf(role)<0)return;
    var old=document.getElementById('sgrt40-admin-ac-summary');if(old)old.remove();old=document.getElementById('sgrt42-admin-ac-summary');if(old)old.remove();
    var all=Object.keys(db()).map(function(k){var t=db()[k]||{};return {nit:norm(t.nit||k),key:k,t:t,s:calcThird(t,norm(t.nit||k))};}).filter(function(x){return x.t&&!x.t.bloqueado;});
    var fNit=norm(window._rptFiltroNit||''),fCon=norm(window._rptFiltroContrato||'');
    var thirdOpts='<option value="">Todos los terceros</option>'+all.map(function(x){return '<option value="'+esc(x.key)+'"'+((fNit===x.key||fNit===x.nit)?' selected':'')+'>'+esc((x.t.nombre||x.nit)+' — '+x.nit)+'</option>';}).join('');
    var cOpts='<option value="">Todos los contratos</option>';
    if(fNit){var hit=all.find(function(x){return x.key===fNit||x.nit===fNit;});if(hit)contractNumbers(hit.t).forEach(function(c){cOpts+='<option value="'+esc(c)+'"'+(fCon===c?' selected':'')+'>'+esc(c)+'</option>';});}
    var list=all.filter(function(x){return !fNit||x.key===fNit||x.nit===fNit;});
    var rows='';list.forEach(function(x,i){
      var s=x.s,prog=s.pct,id='sgrt42-det-'+i+'-'+x.nit.replace(/[^a-z0-9]/gi,'_');
      // Si hay filtro de contrato, el resumen de esta fila refleja ese contrato.
      var shown=fCon&&(x.key===fNit||x.nit===fNit)?calcContract(x.t,x.nit,fCon):null;
      var pShown=shown?shown.pct:prog,pc=pShown===100?'#16a34a':pShown>0?'#f97316':'#94a3b8',respShown=shown?(shown.complete?1:0):s.answeredContracts,totalShown=shown?1:s.contracts,lvl=shown?levelText(shown):levelText({vals:s.vals,maturity:s.maturity});
      rows+='<tr style="background:'+(i%2?'#f8fbff':'white')+';border-bottom:1px solid #e5e7eb;">'
        +'<td style="padding:9px 12px;"><div style="font-weight:700;color:#1a3a5c;">'+esc(x.t.nombre||'—')+'</div><div style="font-size:10px;color:#94a3b8;">'+esc(x.nit)+'</div></td>'
        +'<td style="padding:9px 12px;text-align:center;font-weight:800;color:#1a3a5c;">'+respShown+' / '+totalShown+'</td>'
        +'<td style="padding:9px 12px;min-width:155px;"><div style="display:flex;align-items:center;gap:7px;"><div style="flex:1;height:7px;background:#e5e7eb;border-radius:5px;overflow:hidden;"><div style="height:100%;width:'+pShown+'%;background:'+pc+';"></div></div><b style="font-size:11px;color:'+pc+';">'+pShown+'%</b></div><div style="font-size:9.5px;color:#64748b;margin-top:3px;">'+(shown?(shown.answered+' / '+shown.total):s.answeredControls+' / '+s.totalControls)+' controles respondidos</div></td>'
        +'<td style="padding:9px 12px;font-size:11px;font-weight:700;color:#334155;">'+esc(lvl)+'</td>'
        +'<td style="padding:9px 12px;text-align:center;"><button type="button" onclick="window._sgrt42ToggleDetail(\''+id+'\')" style="padding:5px 10px;border:1px solid #93c5fd;background:#eff6ff;color:#1e6bb8;border-radius:6px;font-size:10.5px;font-weight:700;cursor:pointer;">Ver detalle</button></td></tr>'
        +'<tr id="'+id+'" style="display:none;background:#fbfdff;"><td colspan="5" style="padding:10px 16px 14px;"><div style="font-size:10.5px;font-weight:800;color:#1a3a5c;margin-bottom:6px;">Nivel de madurez por contrato</div><div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#eef5fb;"><th style="padding:6px 9px;text-align:left;">Contrato</th><th style="padding:6px 9px;">Respondidos</th><th style="padding:6px 9px;">Progreso</th><th style="padding:6px 9px;text-align:left;">Nivel de madurez</th></tr></thead><tbody>'+detailRows(x.t,x.nit)+'</tbody></table></div></td></tr>';
    });
    var box=document.createElement('div');box.id='sgrt42-admin-ac-summary';box.className='card';box.style.cssText='margin-bottom:16px;border:1px solid #bfdbfe;overflow:hidden;';
    box.innerHTML='<div style="padding:12px 14px;background:linear-gradient(90deg,#1a3a5c,#1e6bb8);color:white;"><div style="font-size:13px;font-weight:800;">Resumen general — Ambiente de Control</div><div style="font-size:10.5px;opacity:.88;margin-top:2px;">El progreso mide controles diligenciados; el nivel de madurez se calcula por separado.</div></div>'
      +'<div style="display:grid;grid-template-columns:minmax(220px,1fr) minmax(190px,.7fr);gap:8px;padding:10px 12px;background:#f8fbff;border-bottom:1px solid #dbeafe;"><select onchange="window._rptFiltroNit=this.value;window._rptFiltroContrato=\'\';window.renderReportesAC&&window.renderReportesAC();" style="padding:8px 10px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11.5px;">'+thirdOpts+'</select><select '+(!fNit?'disabled':'')+' onchange="window._rptFiltroContrato=this.value;window.renderReportesAC&&window.renderReportesAC();" style="padding:8px 10px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11.5px;">'+cOpts+'</select></div>'
      +'<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;min-width:790px;"><thead><tr style="background:#eff6ff;"><th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Tercero / NIT</th><th style="padding:9px 12px;text-align:center;color:#1e3a5f;">Contratos respondidos</th><th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Progreso general</th><th style="padding:9px 12px;text-align:left;color:#1e3a5f;">Nivel general de madurez</th><th style="padding:9px 12px;color:#1e3a5f;">Detalle</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" style="padding:18px;text-align:center;color:#94a3b8;">Sin datos de Ambiente de Control.</td></tr>')+'</tbody></table></div>';
    wrap.insertBefore(box,wrap.firstChild);
    cleanupDuplicateAdminButtons();applyOrthography(wrap);
  }
  window._sgrt42AdminSummary=adminSummary;

  function cleanupDuplicateAdminButtons(){
    var h=document.querySelector('#rpt-tabla-wrap .card-hdr');if(!h)return;
    Array.prototype.forEach.call(h.querySelectorAll('button'),function(b){var t=norm(b.textContent);if(t==='Ver todos'||t==='Todos'||/^Contrato\s+\d+/i.test(t))b.remove();});
    Array.prototype.forEach.call(h.querySelectorAll('div'),function(d){if(!norm(d.textContent)&&d.children.length===0)d.remove();});
  }

  var oldRender=null,renderBusy=false,renderAgain=false;
  function installReport(){
    if(typeof window.renderReportesAC!=='function'||window.renderReportesAC.__sgrt42)return;
    oldRender=window.renderReportesAC;
    var wrap=function(){
      if(renderBusy){renderAgain=true;return;}
      renderBusy=true;var r;try{r=oldRender.apply(this,arguments);}finally{renderBusy=false;}
      setTimeout(function(){adminSummary();if(renderAgain){renderAgain=false;setTimeout(function(){try{window.renderReportesAC();}catch(e){}},120);}},0);return r;
    };wrap.__sgrt42=true;window.renderReportesAC=wrap;
  }

  function applyControlNames(){
    // Los números de control se repiten entre tipologías; por eso el renombrado es clave+numero.
    var maps={
      'op:6':'Protocolo de comunicación por eventos de riesgo',
      'si:23':'Restricción de acceso a áreas de procesamiento de información',
      'si:29':'Seguridad de la red – Firewall',
      'si:30':'Seguridad de la red – pruebas de penetración',
      'si:45':'Gestión de vulnerabilidades – parches de seguridad'
    };
    try{Object.keys(window.CUESTIONARIO_CONTROLES||{}).forEach(function(k){(window.CUESTIONARIO_CONTROLES[k]||[]).forEach(function(c){var name=maps[k+':'+c.n];if(name)c.ctrl=name;});});}catch(e){}
  }
  var textFixes=[
    [/\bEvaluacion\b/g,'Evaluación'],[/\bevaluacion\b/g,'evaluación'],
    [/\bClasificacion\b/g,'Clasificación'],[/\bclasificacion\b/g,'clasificación'],
    [/\bTipologia\b/g,'Tipología'],[/\btipologia\b/g,'tipología'],[/\bTipologias\b/g,'Tipologías'],[/\btipologias\b/g,'tipologías'],
    [/\bDocumentacion\b/g,'Documentación'],[/\bdocumentacion\b/g,'documentación'],
    [/\bInformacion\b/g,'Información'],[/\binformacion\b/g,'información'],
    [/\bConfiguracion\b/g,'Configuración'],[/\bconfiguracion\b/g,'configuración'],
    [/\bOrganizacion\b/g,'Organización'],[/\borganizacion\b/g,'organización'],
    [/\bEjecucion\b/g,'Ejecución'],[/\bejecucion\b/g,'ejecución'],
    [/\bFinanciacion\b/g,'Financiación'],[/\bfinanciacion\b/g,'financiación'],
    [/\bPrevencion\b/g,'Prevención'],[/\bprevencion\b/g,'prevención'],
    [/\bGestion\b/g,'Gestión'],[/\bgestion\b/g,'gestión'],
    [/\bAdministracion\b/g,'Administración'],[/\badministracion\b/g,'administración'],
    [/\bAutenticacion\b/g,'Autenticación'],[/\bautenticacion\b/g,'autenticación'],
    [/\bRestriccion\b/g,'Restricción'],[/\brestriccion\b/g,'restricción'],
    [/\bProteccion\b/g,'Protección'],[/\bproteccion\b/g,'protección'],
    [/\bNotificacion\b/g,'Notificación'],[/\bnotificacion\b/g,'notificación'],
    [/\bIdentificacion\b/g,'Identificación'],[/\bidentificacion\b/g,'identificación'],
    [/\bMedicion\b/g,'Medición'],[/\bmedicion\b/g,'medición'],
    [/\bCapacitacion\b/g,'Capacitación'],[/\bcapacitacion\b/g,'capacitación'],
    [/\bTerminacion\b/g,'Terminación'],[/\bterminacion\b/g,'terminación'],
    [/\bEliminacion\b/g,'Eliminación'],[/\beliminacion\b/g,'eliminación'],
    [/\bAsignacion\b/g,'Asignación'],[/\basignacion\b/g,'asignación'],
    [/\bComunicacion\b/g,'Comunicación'],[/\bcomunicacion\b/g,'comunicación'],
    [/\bImplementacion\b/g,'Implementación'],[/\bimplementacion\b/g,'implementación'],
    [/\bValidacion\b/g,'Validación'],[/\bvalidacion\b/g,'validación'],
    [/\bAprobacion\b/g,'Aprobación'],[/\baprobacion\b/g,'aprobación'],
    [/\bRevision\b/g,'Revisión'],[/\brevision\b/g,'revisión'],
    [/\bOperacion\b/g,'Operación'],[/\boperacion\b/g,'operación'],
    [/\bTecnologia\b/g,'Tecnología'],[/\btecnologia\b/g,'tecnología'],
    [/\bAnalisis\b/g,'Análisis'],[/\banalisis\b/g,'análisis'],
    [/\bPais\b/g,'País'],[/\bpais\b/g,'país'],
    [/\brecuperacion\b/g,'recuperación'],[/\bperiodicamente\b/g,'periódicamente'],[/\btecnologica\b/g,'tecnológica'],[/\btecnologico\b/g,'tecnológico'],
    [/\bClausulas\b/g,'Cláusulas'],[/\bclausulas\b/g,'cláusulas'],[/\bBitacora\b/g,'Bitácora'],[/\bbitacora\b/g,'bitácora'],
    [/\bMonitorea\b/g,'Monitoreado']
  ];
  function fixText(s){var out=s;textFixes.forEach(function(x){out=out.replace(x[0],x[1]);});return out;}
  function applyOrthography(root){
    root=root||document.body;if(!root||!document.createTreeWalker)return;
    try{
      var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}}),n;
      while((n=w.nextNode())){var v=n.nodeValue,nv=fixText(v);if(nv!==v)n.nodeValue=nv;}
      Array.prototype.forEach.call(root.querySelectorAll('option'),function(o){var t=norm(o.textContent);if(t==='Si')o.textContent='Sí';else if(t==='No Aplica')o.textContent='No aplica';else{var x=fixText(o.textContent);if(x!==o.textContent)o.textContent=x;}});
      Array.prototype.forEach.call(root.querySelectorAll('textarea[id^="obs_"]'),function(el){el.rows=Math.max(parseInt(el.rows||0,10)||0,5);el.style.minHeight='120px';el.style.width='100%';el.style.resize='vertical';el.style.boxSizing='border-box';el.placeholder='Escribe aquí las observaciones, hallazgos o comentarios del control...';});
    }catch(e){}
  }

  function removeRepeatedQuestionnaireButton(){
    Array.prototype.forEach.call(document.querySelectorAll('#cq-panel-instruc button'),function(b){if(plain(b.textContent)==='ver todo el cuestionario')b.remove();});
  }

  var changeTimer=null;
  function onChange(ev){
    var id=(ev.target&&ev.target.id)||'';
    if(id.indexOf('qa_')===0||id.indexOf('obs_')===0){
      clearTimeout(changeTimer);changeTimer=setTimeout(function(){var nit=syncVisible();if(nit){var s=recompute(nit);lightSnapshot(nit);updateProgressUI(nit,s);}},900);
    }
    if(id==='q-tercero'||id==='q-contrato-sel'||id==='ac-tercero-instruc'||id==='ac-contrato-sel')setTimeout(function(){var nit=activeNit();if(nit)updateProgressUI(nit,recompute(nit));},180);
  }
  function flush(){try{var nit=syncVisible();if(nit){recompute(nit);localSnapshot(nit);}}catch(e){}}

  function recoverEvidence(){
    try{if(typeof window._sgrt41RecoverEvidencias==='function')Promise.resolve(window._sgrt41RecoverEvidencias()).then(function(){try{window._sgrt41SyncEvidenciasRepo&&window._sgrt41SyncEvidenciasRepo();}catch(e){}});else{window._sgrt41HydrateEvidencias&&window._sgrt41HydrateEvidencias(true).then(function(){window._sgrt41SyncEvidenciasRepo&&window._sgrt41SyncEvidenciasRepo();});}}catch(e){}
  }

  function init(){
    applyControlNames();installSaveFinal();installProgressFinal();installReport();removeRepeatedQuestionnaireButton();applyOrthography(document.body);recoverEvidence();
    setTimeout(function(){applyControlNames();installSaveFinal();installProgressFinal();installReport();removeRepeatedQuestionnaireButton();applyOrthography(document.querySelector('.page.active')||document.body);},900);
    document.addEventListener('change',onChange,true);
    document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.nav-item,.tab'))setTimeout(function(){applyOrthography(document.querySelector('.page.active')||document.body);cleanupDuplicateAdminButtons();},120);},true);
    window.addEventListener('pagehide',flush);window.addEventListener('beforeunload',flush);document.addEventListener('visibilitychange',function(){if(document.hidden)flush();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
