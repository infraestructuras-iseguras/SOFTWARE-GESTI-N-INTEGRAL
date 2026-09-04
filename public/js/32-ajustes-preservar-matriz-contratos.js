/*
 * SGRT — Ajuste 32 (2026-09-04)
 * Cambios aditivos y aislados:
 * 1) Registro: mantiene abiertos tercero/contrato aun con sincronización remota.
 * 2) Supervisores: se muestran/editan dentro de cada contrato; se elimina el bloque independiente.
 * 3) Supervisión AC Admin Riesgos: conserva la matriz original de 6 atributos + cálculo Excel,
 *    agregando filtros Tercero > Contrato/Supervisor y usando preguntas activas por contrato.
 */
(function(){
  'use strict';

  var LS_OPEN='sgrt_registro_contratos_abiertos_v3';
  var SEP='|||';
  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function contractService(c,t){return norm(c&&(c.objeto||c.servicio||c.Servicio_Contratado))||norm(t&&(t.servicio_contratado||t.servicio||t.Servicio_Contratado))||'—';}
  function isRiskAdmin(){var r=low((window.currentUser||{}).rol);return r==='admin_riesgos'||r==='operativo'||r.indexOf('administrador de riesgos')>=0;}
  function isEvaluator(){var r=low((window.currentUser||{}).rol);return r==='evaluador'||r==='cliente';}

  function supervisorsFor(t,c){
    var num=contractNum(c),out=[],seen={};
    function add(s,forced){
      if(!s)return; if(typeof s==='string')s={nombre:s};
      var name=norm(s.nombre||s.name||s.supervisor||s.SupervisorNombre); if(!name)return;
      var cn=norm(s.contrato_asociado||s.contratoAsociado||s.contrato||s.numeroContrato||forced||num);
      if(cn&&num&&cn!==num)return;
      var key=low(name)+'|'+low(cn||num); if(seen[key])return; seen[key]=1;
      out.push({nombre:name,cargo:norm(s.cargo||s.supervisorCargo||s.cargo_supervisor),proceso:norm(s.proceso||s.procesoSupervision||s.proceso_supervision),contrato_asociado:cn||num});
    }
    (Array.isArray(c&&c.supervisores)?c.supervisores:[]).forEach(function(s){add(s,num);});
    if(c){
      add({nombre:c.supervisor_asociado||c.supervisor,cargo:c.supervisorCargo,proceso:c.procesoSupervision,contrato_asociado:num},num);
      add({nombre:c.supervisorAlt,cargo:c.supervisorAltCargo,proceso:c.procesoSupervisionAlt,contrato_asociado:num},num);
      Object.keys(c).forEach(function(k){var m=k.match(/^supervisor(\d+)$/i);if(m)add({nombre:c[k],cargo:c['supervisorCargo'+m[1]]||c['supervisor'+m[1]+'Cargo'],proceso:c['procesoSupervision'+m[1]],contrato_asociado:num},num);});
    }
    (Array.isArray(t&&t.supervisores)?t.supervisores:[]).forEach(function(s){add(s);});
    return out;
  }
  window.sgrtSupervisoresContrato=function(nit,num){var t=db()[norm(nit)];if(!t)return[];var c=(t.contratos||[]).find(function(x){return contractNum(x)===norm(num);});return c?supervisorsFor(t,c):[];};

  /* -------------------------------------------------------------
   * REGISTRO: ESTADO DE DESPLEGABLES
   * ------------------------------------------------------------- */
  var openState={thirds:{},contracts:{}};
  try{openState=Object.assign(openState,JSON.parse(localStorage.getItem(LS_OPEN)||'{}')||{});openState.thirds=openState.thirds||{};openState.contracts=openState.contracts||{};}catch(e){}
  function saveOpen(){try{localStorage.setItem(LS_OPEN,JSON.stringify(openState));}catch(e){}}
  function visible(el){return !!el&&el.style.display!=='none'&&getComputedStyle(el).display!=='none';}
  function findContractTitle(cell,num){
    var divs=cell?cell.querySelectorAll('div'):[];
    for(var i=0;i<divs.length;i++){
      var el=divs[i]; if(el.children.length===0&&norm(el.textContent)===norm(num)&&String(el.style.fontWeight)==='700')return el;
    }
    return null;
  }
  function tagContractCards(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){
      var nit=row.id.slice(4),t=db()[nit],cell=row.cells&&row.cells[0]; if(!t||!cell)return;
      (t.contratos||[]).forEach(function(c){
        var num=contractNum(c);if(!num)return;var title=findContractTitle(cell,num);if(!title)return;
        var header=title.parentElement&&title.parentElement.parentElement&&title.parentElement.parentElement.parentElement;
        var detail=header&&header.nextElementSibling;if(!header||!detail)return;
        var key=nit+SEP+num;header.dataset.sgrtContractToggle=key;detail.dataset.sgrtContractDetail=key;
        if(Object.prototype.hasOwnProperty.call(openState.contracts,key))detail.style.display=openState.contracts[key]?'block':'none';
        var arrow=header.querySelector('span:last-child');if(arrow&&/^[▶▼]$/.test(norm(arrow.textContent)))arrow.textContent=visible(detail)?'▼':'▶';
      });
    });
  }
  function removeSeparateSupervisors(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){
      var main=row.previousElementSibling;
      if(main&&main.cells&&main.cells[2])Array.from(main.cells[2].querySelectorAll('span')).forEach(function(sp){if(/^👤/.test(norm(sp.textContent)))sp.remove();});
      Array.from(row.querySelectorAll('h4')).forEach(function(h){if(/supervisores/i.test(norm(h.textContent))){var sec=h.parentElement;if(sec)sec.remove();}});
    });
  }
  function decorateContractSupervisors(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){
      var nit=row.id.slice(4),t=db()[nit],cell=row.cells&&row.cells[0];if(!t||!cell)return;
      (t.contratos||[]).forEach(function(c,idx){
        var num=contractNum(c);if(!num)return;var title=findContractTitle(cell,num);if(!title)return;
        var info=title.parentElement,ss=supervisorsFor(t,c);
        if(info){var old=info.querySelector('[data-sgrt-inline-sup32]');if(old)old.remove();var x=document.createElement('div');x.dataset.sgrtInlineSup32='1';x.style.cssText='font-size:10.5px;color:#6d28d9;margin-top:4px;font-weight:700;';x.textContent='👤 '+(ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado');info.appendChild(x);}
        var header=title.parentElement&&title.parentElement.parentElement&&title.parentElement.parentElement.parentElement,detail=header&&header.nextElementSibling;if(!detail)return;
        var supHtml=ss.length?ss.map(function(s,si){return '<div style="display:grid;grid-template-columns:minmax(150px,1.2fr) minmax(120px,1fr) minmax(140px,1fr) auto;gap:6px;align-items:center;padding:7px;border:1px solid #e9d5ff;border-radius:6px;background:#faf5ff;"><div><b>'+esc(s.nombre)+'</b></div><div style="font-size:10.5px;color:#475569;">'+esc(s.cargo||'Sin cargo')+'</div><div style="font-size:10.5px;color:#475569;">'+esc(s.proceso||'Sin proceso')+'</div>'+(!isEvaluator()?'<button onclick="event.stopPropagation();window.sgrtEditarSupervisorContrato(\''+esc(nit)+'\',\''+esc(num)+'\','+si+')" style="padding:4px 8px;border:1px solid #c4b5fd;background:white;color:#6d28d9;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;">Editar</button>':'')+'</div>';}).join(''):'<div style="padding:8px;border:1px dashed #cbd5e1;border-radius:6px;color:#94a3b8;font-size:10.5px;">Sin supervisor asociado a este contrato.</div>';
        detail.innerHTML='<div style="margin-bottom:9px;"><strong>Servicio / objeto:</strong> '+esc(contractService(c,t))+'</div>'
          +'<div style="margin-bottom:11px;"><strong>Supervisor(es) relacionados al contrato:</strong><div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">'+supHtml+'</div>'
          +(!isEvaluator()?'<button onclick="event.stopPropagation();window.sgrtAgregarSupervisorContrato(\''+esc(nit)+'\',\''+esc(num)+'\')" style="width:100%;margin-top:7px;padding:6px 8px;background:#f5f3ff;color:#6d28d9;border:1px solid #c4b5fd;border-radius:5px;font-size:10.5px;font-weight:700;cursor:pointer;">+ Agregar supervisor a este contrato</button>':'')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Fechas:</strong> '+esc(c.fini||'—')+' a '+esc(c.ffin||'—')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Valor:</strong> '+(c.valor?('$ '+new Intl.NumberFormat('es-CO').format(Number(String(c.valor).replace(/[^0-9.-]/g,''))||0)):'—')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Procesos:</strong> '+esc(c.procesos||'—')+'</div>'
          +'<div style="margin-bottom:12px;"><strong>Observaciones:</strong> '+esc(c.observaciones||'—')+'</div>'
          +(!isEvaluator()?'<div style="display:flex;gap:8px;"><button onclick="event.stopPropagation();clsEditarContratoDesdeRegistros(\''+esc(nit)+'\','+idx+')" style="flex:1;padding:6px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">Editar contrato</button><button onclick="event.stopPropagation();clsEliminarContratoDesdeRegistros(\''+esc(nit)+'\','+idx+')" style="flex:1;padding:6px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">Eliminar contrato</button></div>':'');
      });
    });
  }
  function restoreRegistryOpen(){
    Object.keys(openState.thirds).forEach(function(nit){var row=document.getElementById('exp-'+nit);if(row&&openState.thirds[nit]){row.style.display='table-row';var p=row.previousElementSibling;if(p&&p.cells&&p.cells[0])p.cells[0].textContent='▼';}});
    tagContractCards();
  }
  function captureRegistryOpen(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){openState.thirds[row.id.slice(4)]=visible(row);});
    document.querySelectorAll('[data-sgrt-contract-detail]').forEach(function(d){openState.contracts[d.dataset.sgrtContractDetail]=visible(d);});
    saveOpen();
  }
  function applyRegistry(){removeSeparateSupervisors();decorateContractSupervisors();tagContractCards();restoreRegistryOpen();}

  var oldToggle=window.clsToggleExpandir;
  window.clsToggleExpandir=function(nit){
    var r=typeof oldToggle==='function'?oldToggle.apply(this,arguments):undefined;
    setTimeout(function(){var row=document.getElementById('exp-'+nit);openState.thirds[nit]=visible(row);saveOpen();applyRegistry();},0);return r;
  };
  document.addEventListener('click',function(ev){
    var h=ev.target&&ev.target.closest&&ev.target.closest('[data-sgrt-contract-toggle]');if(!h)return;
    setTimeout(function(){var d=h.nextElementSibling,key=h.dataset.sgrtContractToggle;if(d&&key){openState.contracts[key]=visible(d);saveOpen();var a=h.querySelector('span:last-child');if(a&&/^[▶▼]$/.test(norm(a.textContent)))a.textContent=visible(d)?'▼':'▶';}},0);
  });
  var oldRender=window.clsRender;
  if(typeof oldRender==='function')window.clsRender=function(){captureRegistryOpen();var r=oldRender.apply(this,arguments);setTimeout(applyRegistry,0);setTimeout(applyRegistry,80);return r;};
  var oldServer=window.sgrtCargarDesdeServidor;
  if(typeof oldServer==='function')window.sgrtCargarDesdeServidor=async function(){captureRegistryOpen();var r=await oldServer.apply(this,arguments);setTimeout(applyRegistry,0);setTimeout(applyRegistry,120);return r;};

  /* -------------------------------------------------------------
   * FORMULARIO: SUPERVISORES DENTRO DEL CONTRATO
   * ------------------------------------------------------------- */
  function hideStandaloneSupervisorForm(){
    var list=document.getElementById('cf-supervisores-lista');if(list){var card=list.parentElement;if(card)card.style.display='none';}
    var legacy=document.getElementById('cf-supervisor-fields');if(legacy)legacy.style.display='none';
  }
  function normalizeBufferSup(c){
    c.supervisores=Array.isArray(c.supervisores)?c.supervisores:[];
    if(!c.supervisores.length){
      var temp=supervisorsFor({supervisores:[]},c);c.supervisores=temp.map(function(s){return clone(s);});
    }
    return c.supervisores;
  }
  function syncLegacySup(c){
    var ss=normalizeBufferSup(c),s=ss[0]||{};c.supervisor=s.nombre||'';c.supervisor_asociado=s.nombre||'';c.supervisorCargo=s.cargo||'';c.procesoSupervision=s.proceso||'';
  }
  window.sgrtCtrAddSupervisor=function(ci){var c=(window._cfContratosBuffer||[])[ci];if(!c)return;normalizeBufferSup(c).push({nombre:'',cargo:'',proceso:'',contrato_asociado:contractNum(c)});syncLegacySup(c);try{window._cfCtrRender();window._cfCtrPersistir();}catch(e){}};
  window.sgrtCtrRemoveSupervisor=function(ci,si){var c=(window._cfContratosBuffer||[])[ci];if(!c)return;normalizeBufferSup(c).splice(si,1);syncLegacySup(c);try{window._cfCtrRender();window._cfCtrPersistir();}catch(e){}};
  window.sgrtCtrSetSupervisor=function(ci,si,k,v){var c=(window._cfContratosBuffer||[])[ci];if(!c)return;var ss=normalizeBufferSup(c);if(!ss[si])return;ss[si][k]=norm(v);ss[si].contrato_asociado=contractNum(c);syncLegacySup(c);try{window._cfCtrPersistir();}catch(e){}};
  function enhanceContractForm(){
    hideStandaloneSupervisorForm();var wrap=document.getElementById('cf-contratos-adic');if(!wrap)return;
    var cards=Array.from(wrap.children),arr=window._cfContratosBuffer||[];
    cards.forEach(function(card,ci){var c=arr[ci];if(!c||card.querySelector('[data-sgrt-contract-supervisor-editor]'))return;var ss=normalizeBufferSup(c);var sec=document.createElement('div');sec.dataset.sgrtContractSupervisorEditor='1';sec.style.cssText='margin-top:10px;padding-top:10px;border-top:1px solid #e9d5ff;';
      sec.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;"><div style="font-size:10.5px;font-weight:800;color:#6b21a8;">Supervisor(es) de este contrato</div><button type="button" onclick="window.sgrtCtrAddSupervisor('+ci+')" style="padding:4px 8px;background:#f5f3ff;color:#6d28d9;border:1px solid #c4b5fd;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;">+ Supervisor</button></div>'
       +(ss.length?ss.map(function(s,si){return '<div style="display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:6px;margin-bottom:6px;"><input value="'+esc(s.nombre)+'" oninput="window.sgrtCtrSetSupervisor('+ci+','+si+',\'nombre\',this.value)" placeholder="Nombre" style="padding:6px;border:1px solid #e9d5ff;border-radius:5px;font-size:11px;"><input value="'+esc(s.cargo)+'" oninput="window.sgrtCtrSetSupervisor('+ci+','+si+',\'cargo\',this.value)" placeholder="Cargo" style="padding:6px;border:1px solid #e9d5ff;border-radius:5px;font-size:11px;"><input value="'+esc(s.proceso)+'" oninput="window.sgrtCtrSetSupervisor('+ci+','+si+',\'proceso\',this.value)" placeholder="Proceso" style="padding:6px;border:1px solid #e9d5ff;border-radius:5px;font-size:11px;"><button type="button" onclick="window.sgrtCtrRemoveSupervisor('+ci+','+si+')" style="padding:5px 7px;background:white;color:#dc2626;border:1px solid #fecaca;border-radius:5px;cursor:pointer;">✕</button></div>';}).join(''):'<div style="font-size:10.5px;color:#94a3b8;padding:6px 0;">Sin supervisores. Agrégalos aquí y quedarán asociados únicamente a este contrato.</div>');
      card.appendChild(sec);
    });
  }
  var oldCtrRender=window._cfCtrRender;
  if(typeof oldCtrRender==='function')window._cfCtrRender=function(){var r=oldCtrRender.apply(this,arguments);setTimeout(enhanceContractForm,0);return r;};
  var oldCtrLoad=window._cfCtrCargarDe;
  if(typeof oldCtrLoad==='function')window._cfCtrCargarDe=function(nit){var original=(db()[norm(nit)]&&db()[norm(nit)].contratos)||[];var r=oldCtrLoad.apply(this,arguments);(window._cfContratosBuffer||[]).forEach(function(c){var src=original.find(function(x){return contractNum(x)===contractNum(c);});if(src)c.supervisores=supervisorsFor(db()[norm(nit)],src).map(function(s){return clone(s);});syncLegacySup(c);});setTimeout(function(){try{window._cfCtrRender();}catch(e){}},0);return r;};

  /* -------------------------------------------------------------
   * AMBIENTE DE CONTROL — RESTAURAR MATRIZ ORIGINAL + FILTROS
   * ------------------------------------------------------------- */
  function dimsFor(t,num){if(t&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num]))return t.dimsPorContrato[num];if(t&&norm(t.contratoEval)===norm(num)&&Array.isArray(t.dims))return t.dims;var c=(t&&t.contratos||[]).find(function(x){return contractNum(x)===norm(num);});return c&&Array.isArray(c.dims)?c.dims:[];}
  function responseFor(t,nit,num){if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[num])return t.respuestasACPorContrato[num];if(t&&norm(t.contratoEval)===norm(num))return (window.CUEST_RESPUESTAS||{})[nit]||{};return {};}
  function activeCtrls(nit,num,key){
    try{if(typeof window._ctrlsCuest==='function'){var a=window._ctrlsCuest(nit,key,num);if(Array.isArray(a))return a;}}catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]).filter(function(q){return q&&q.activo!==false;});
  }
  function calcVal(r){try{if(typeof window._calcCtrlValoracion==='function')return window._calcCtrlValoracion(r);}catch(e){}var yes=function(v){return norm(v)==='Si';};var sum=(yes(r.a1)?0.15:(norm(r.a1)==='Parcial'?0.05:0))+(yes(r.a2)?0.10:0)+(yes(r.a3)?0.10:0)+(yes(r.a4)?0.15:0)+(yes(r.a5)?0.20:0)+(yes(r.a6)?0.15:0);var pct=Math.round(sum/0.85*100);var m=pct>=91?['OPTIMIZADO',5,'#15803D','#DCFCE7']:pct>=71?['ADMINISTRADO',4,'#16A34A','#F0FDF4']:pct>=41?['DEFINIDO',3,'#CA8A04','#FEFCE8']:pct>=21?['REPETIBLE',2,'#EA580C','#FFF7ED']:pct>0?['INICIAL',1,'#DC2626','#FEF2F2']:['NO EXISTE',0,'#6B7280','#F3F4F6'];if(norm(r.a1)==='No Aplica')return{pct:0,nivelCumpl:'NO APLICA',madurez:'NO APLICA',valorMad:null,color:'#6B7280',bgColor:'#F3F4F6'};return{pct:pct,nivelCumpl:pct+'%',madurez:m[0],valorMad:m[1],color:m[2],bgColor:m[3]};}
  window.sgrtACMatrixThird=function(v){window._sgrtACMatrixThird=norm(v);window._sgrtACMatrixContract='';window._rptFiltroNit=norm(v);window._rptFiltroContrato='';try{window.renderReportesAC();}catch(e){}};
  window.sgrtACMatrixContract=function(v){v=norm(v);if(v.indexOf(SEP)>=0){var p=v.split(SEP);window._sgrtACMatrixThird=p[0];window._sgrtACMatrixContract=p.slice(1).join(SEP);window._rptFiltroNit=p[0];window._rptFiltroContrato=window._sgrtACMatrixContract;}else{window._sgrtACMatrixContract=v;window._rptFiltroContrato=v;}try{window.renderReportesAC();}catch(e){}};
  function restoreOriginalMatrix(){
    if(!isRiskAdmin())return;
    ['sgrt-ac-supervision-contract','sgrt-ac-supervision-v2'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
    var card=document.getElementById('rpt-tabla-wrap');if(!card)return;card.style.display='';
    var third=norm(window._sgrtACMatrixThird||window._rptFiltroNit||''),contract=norm(window._sgrtACMatrixContract||window._rptFiltroContrato||'');
    if(third&&!db()[third]){third='';contract='';}
    var thirds=Object.values(db()).filter(function(t){return t&&norm(t.nit||t.NIT)&&(t.contratos||[]).length;}).sort(function(a,b){return norm(a.nombre).localeCompare(norm(b.nombre),'es');});
    var opts=[];
    if(third){var t0=db()[third];(t0.contratos||[]).forEach(function(c){var n=contractNum(c);if(!n)return;var ss=supervisorsFor(t0,c);opts.push({v:n,l:'Contrato '+n+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});}
    else thirds.forEach(function(t){(t.contratos||[]).forEach(function(c){var n=contractNum(c);if(!n)return;var ss=supervisorsFor(t,c);opts.push({v:norm(t.nit||t.NIT)+SEP+n,l:'Contrato '+n+' — '+(t.nombre||t.nit)+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});});
    var oldBar=document.getElementById('sgrt-ac-matrix-filters');if(oldBar)oldBar.remove();var bar=document.createElement('div');bar.id='sgrt-ac-matrix-filters';bar.style.cssText='padding:10px 12px;background:#f8fbff;border:1px solid #dbeafe;border-radius:8px;margin:0 0 10px;display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;';
    bar.innerHTML='<div style="font-size:11px;font-weight:800;color:#1a3a5c;margin-right:4px;padding-bottom:8px;">Filtros de supervisión</div><label style="font-size:10px;font-weight:700;color:#475569;">Tercero<br><select onchange="window.sgrtACMatrixThird(this.value)" style="min-width:240px;padding:7px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los terceros</option>'+thirds.map(function(t){var n=norm(t.nit||t.NIT);return '<option value="'+esc(n)+'" '+(third===n?'selected':'')+'>'+esc((t.nombre||n)+' — '+n)+'</option>';}).join('')+'</select></label><label style="font-size:10px;font-weight:700;color:#475569;">Contrato / Supervisor<br><select onchange="window.sgrtACMatrixContract(this.value)" style="min-width:300px;max-width:480px;padding:7px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los contratos</option>'+opts.map(function(o){var sel=third&&contract===o.v;return '<option value="'+esc(o.v)+'" '+(sel?'selected':'')+'>'+esc(o.l)+'</option>';}).join('')+'</select></label><div style="font-size:10px;color:#64748b;padding-bottom:7px;">Solo se muestran las preguntas activadas en Configuración para cada contrato.</div>';
    card.parentNode.insertBefore(bar,card);

    var tbody=card.querySelector('tbody');if(!tbody)return;var rows=[];
    thirds.forEach(function(t){var nit=norm(t.nit||t.NIT);if(third&&nit!==third)return;(t.contratos||[]).forEach(function(c){var num=contractNum(c);if(!num||contract&&num!==contract)return;var dims=dimsFor(t,num),resp=responseFor(t,nit,num);dims.forEach(function(d){var key=norm(d.key||d.clave||d.tipologia);activeCtrls(nit,num,key).forEach(function(q){rows.push({t:t,nit:nit,c:c,num:num,d:d,q:q,r:(resp[key]&&resp[key][q.n])||{}});});});});});
    function cell(v){if(!v)return '<td style="padding:5px 8px;text-align:center;"><span style="color:#ccc;font-size:11px;">—</span></td>';var col=v==='Si'?'#16A34A':v==='No'?'#DC2626':v==='No Aplica'?'#9CA3AF':v==='Parcial'?'#D97706':'#64748b',bg=v==='Si'?'#F0FDF4':v==='No'?'#FEF2F2':v==='Parcial'?'#FFF7ED':'#F9FAFB',s=v==='Si'?'✓ Sí':v==='No'?'✗ No':v==='No Aplica'?'N/A':v;return '<td style="padding:5px 8px;text-align:center;"><span style="padding:2px 6px;border-radius:5px;background:'+bg+';color:'+col+';font-weight:700;font-size:10px;white-space:nowrap;">'+esc(s)+'</span></td>';}
    tbody.innerHTML=rows.length?rows.map(function(x,i){var v=calcVal(x.r),pc=v.pct>=80?'#16A34A':v.pct>=60?'#CA8A04':v.pct>=40?'#EA580C':v.pct>0?'#DC2626':'#9CA3AF',pb=v.pct>=80?'#F0FDF4':v.pct>=60?'#FEFCE8':v.pct>=40?'#FFF7ED':v.pct>0?'#FEF2F2':'#F9FAFB',tip=window._nombreTipologia?window._nombreTipologia(x.d):(x.d.nombre||x.d.key),obs=norm(x.r.obs);return '<tr style="background:'+(i%2?'#FAFAFA':'white')+';border-bottom:1px solid #F3F4F6;"><td style="padding:6px 10px;font-weight:600;font-size:11px;vertical-align:top;">'+esc(x.t.nombre||x.nit)+'</td><td style="padding:6px 8px;font-size:11px;vertical-align:top;"><span style="display:inline-block;padding:3px 8px;border-radius:6px;font-weight:700;background:#fef3c7;color:#78350f;border:1px solid #fde68a;white-space:nowrap;" title="'+esc(contractService(x.c,x.t))+'">'+esc(x.num)+'</span></td><td style="padding:6px 8px;font-size:10.5px;color:#64748b;vertical-align:top;max-width:140px;"><span style="padding:2px 6px;background:#E8F0F8;color:#1a3a5c;border-radius:8px;font-weight:700;font-size:10px;display:inline-block;">'+esc(tip).toUpperCase()+'</span></td><td style="padding:6px 10px;max-width:220px;vertical-align:top;"><div style="display:flex;align-items:flex-start;gap:5px;"><span style="flex-shrink:0;font-size:9.5px;font-weight:700;background:#1e6bb8;color:white;padding:2px 6px;border-radius:8px;">#'+esc(x.q.n)+'</span><span style="font-size:11px;line-height:1.4;">'+esc(x.q.ctrl||x.q.req||x.q.texto||('Control '+x.q.n))+'</span></div></td>'+cell(x.r.a1)+cell(x.r.a2)+cell(x.r.a3)+cell(x.r.a4)+cell(x.r.a5)+cell(x.r.a6)+'<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);"><span style="padding:3px 7px;border-radius:10px;background:'+pb+';color:'+pc+';font-size:11px;font-weight:800;">'+esc(v.nivelCumpl)+'</span><div style="height:3px;background:#E5E7EB;border-radius:2px;margin-top:3px;overflow:hidden;"><div style="height:100%;width:'+Math.max(0,Math.min(100,v.pct||0))+'%;background:'+pc+';"></div></div></td><td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);"><span style="padding:3px 7px;border-radius:10px;background:'+v.bgColor+';color:'+v.color+';font-size:10px;font-weight:700;border:1px solid '+v.color+'44;">'+esc(v.madurez)+'</span></td><td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);">'+(v.valorMad>0?'<span style="font-size:14px;font-weight:800;color:'+v.color+';">'+v.valorMad+'.0</span>':'<span style="color:#9CA3AF;">—</span>')+'</td><td style="padding:5px 8px;font-size:10.5px;color:#64748b;max-width:160px;">'+(obs?esc(obs):'<span style="color:#bbb;">—</span>')+'</td></tr>';}).join(''):'<tr><td colspan="13" style="text-align:center;padding:24px;color:#64748b;">No hay preguntas activas para el tercero/contrato seleccionado.</td></tr>';
  }
  var oldReports=window.renderReportesAC;
  if(typeof oldReports==='function')window.renderReportesAC=function(){var r=oldReports.apply(this,arguments);setTimeout(restoreOriginalMatrix,0);setTimeout(restoreOriginalMatrix,80);return r;};

  function init(){hideStandaloneSupervisorForm();enhanceContractForm();applyRegistry();if(isRiskAdmin())try{restoreOriginalMatrix();}catch(e){}}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(init,80);setTimeout(init,700);});
  if(document.readyState!=='loading'){setTimeout(init,40);setTimeout(init,500);}
})();
