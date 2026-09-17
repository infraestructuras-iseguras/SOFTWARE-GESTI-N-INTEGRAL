/*
 * SGRT — Módulo 31: correcciones finales solicitadas.
 * Alcance: UI/persistencia local solamente. No modifica backend ni base de datos.
 * - Registro: desplegable estable y supervisores dentro de cada contrato.
 * - Supervisión AC: filtros Tercero + Contrato y solo preguntas activas.
 * - Evaluador: contrato + servicio + supervisor(es), Nivel de riesgo y detalle mínimo.
 * - Sesión persistente hasta Cerrar sesión explícitamente.
 */
(function(){
  'use strict';

  var EXP_KEY='sgrt_registro_expandidos_v2';
  var SESSION_KEY='sgrt_session_activa_v2';
  var LEGACY_SESSION_KEY='sgrt_session_persistente_v1';
  var LOGOUT_KEY='sgrt_session_cerrada_v2';
  var SEP='|||';
  var renderBusy=false;

  function norm(v){return String(v==null?'':v).trim();}
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function role(){return norm((window.currentUser||{}).rol).toLowerCase();}
  function isEvaluator(){var r=role();return r==='cliente'||r==='evaluador';}
  function isRiskAdmin(){var r=role();return r==='operativo'||r==='admin_riesgos';}
  function toast(m,t,ms){try{window.showToast&&window.showToast(m,t||'info',ms||2200);}catch(e){}}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function contractService(c,t){return norm(c&&(c.objeto||c.servicio||c.servicio_contratado||c.descripcion)||t&&(t.servicio_contratado||t.servicio))||'—';}
  function riskLevel(t,num){
    var pc=t&&t.promPorContrato&&num?t.promPorContrato[num]:null;
    return norm(pc&&(pc.zona||pc.nivel_riesgo)||t&&(t.nivel_riesgo||t.zona||t.Zona_Riesgo||t.ZonaRiesgo))||'—';
  }
  function dimsFor(t,num){
    num=norm(num);
    if(t&&num&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num]))return t.dimsPorContrato[num];
    if(t&&num&&norm(t.contratoEval)===num&&Array.isArray(t.dims))return t.dims;
    return t&&Array.isArray(t.dims)?t.dims:[];
  }
  function responseFor(t,nit,num){
    if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[num])return t.respuestasACPorContrato[num];
    if(t&&norm(t.contratoEval)===norm(num))return (window.CUEST_RESPUESTAS||{})[nit]||{};
    return {};
  }
  function saveState(t){
    if(t){t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();}
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{window._lsSave&&window._lsSave();}catch(e2){}
    try{
      var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
      s.TERCEROS_DB=db();
      s.PERS_HIDDEN=window._persHiddenControls||s.PERS_HIDDEN||{};
      localStorage.setItem('sgrt_v8',JSON.stringify(s));
    }catch(e3){}
    try{if(t&&typeof window._sgrtUpsertEstadoCompleto==='function')Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).catch(function(){});}catch(e4){}
  }

  /* ================================================================
   * CONTRATO -> SUPERVISOR(ES)
   * ================================================================ */
  function supervisorsFor(t,c){
    var num=contractNum(c),out=[],seen={};
    function add(s,forcedContract){
      if(!s)return;
      var obj=typeof s==='string'?{nombre:s}:s;
      var name=norm(obj.nombre||obj.name||obj.supervisor);
      if(!name)return;
      var sc=norm(obj.contrato_asociado||obj.contrato||obj.numeroContrato||forcedContract||num);
      if(sc&&num&&sc!==num)return;
      var k=name.toLowerCase()+'|'+(sc||num);
      if(seen[k])return;seen[k]=1;
      out.push({
        nombre:name,
        cargo:norm(obj.cargo||obj.supervisorCargo||obj.cargo_supervisor),
        proceso:norm(obj.proceso||obj.procesoSupervision||obj.proceso_supervision),
        contrato_asociado:sc||num
      });
    }
    (c&&Array.isArray(c.supervisores)?c.supervisores:[]).forEach(function(s){add(s,num);});
    if(c){
      if(c.supervisor||c.supervisor_asociado){
        add({nombre:c.supervisor_asociado||c.supervisor,cargo:c.supervisorCargo||'',proceso:c.procesoSupervision||'',contrato_asociado:num},num);
      }
    }
    (t&&Array.isArray(t.supervisores)?t.supervisores:[]).forEach(function(s){add(s);});
    if(!out.length&&t&&(t.contratos||[]).length===1){
      (t.supervisores||[]).forEach(function(s){add(Object.assign({},s,{contrato_asociado:num}),num);});
      if(t.supervisor)add({nombre:t.supervisor,contrato_asociado:num},num);
    }
    return out;
  }
  window.sgrtSupervisoresContrato=function(nit,num){
    var t=db()[norm(nit)];if(!t)return[];
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===norm(num);});
    return c?supervisorsFor(t,c):[];
  };

  function updateSupervisorRecord(t,c,oldName,newData){
    var num=contractNum(c),oldLow=norm(oldName).toLowerCase();
    c.supervisores=Array.isArray(c.supervisores)?c.supervisores:[];
    var ci=c.supervisores.findIndex(function(s){return norm((s&&s.nombre)||s).toLowerCase()===oldLow;});
    if(ci>=0)c.supervisores[ci]=Object.assign({},c.supervisores[ci],newData,{contrato_asociado:num});
    else c.supervisores.push(Object.assign({},newData,{contrato_asociado:num}));
    if(norm(c.supervisor_asociado||c.supervisor).toLowerCase()===oldLow||!c.supervisor_asociado){
      c.supervisor_asociado=newData.nombre;c.supervisor=newData.nombre;c.supervisorCargo=newData.cargo;c.procesoSupervision=newData.proceso;
    }
    t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];
    var ti=t.supervisores.findIndex(function(s){
      var nm=norm((s&&s.nombre)||s).toLowerCase();
      var sc=norm(s&&(s.contrato_asociado||s.contrato||s.numeroContrato));
      return nm===oldLow&&(!sc||sc===num);
    });
    if(ti>=0)t.supervisores[ti]=Object.assign({},t.supervisores[ti],newData,{contrato_asociado:num});
    else t.supervisores.push(Object.assign({},newData,{contrato_asociado:num}));
    if(norm(t.supervisor).toLowerCase()===oldLow)t.supervisor=newData.nombre;
  }
  window.sgrtEditarSupervisorContrato=function(nit,num,idx){
    nit=norm(nit);num=norm(num);var t=db()[nit];if(!t)return;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});if(!c)return;
    var sups=supervisorsFor(t,c),s=sups[Number(idx)];if(!s)return;
    var nombre=prompt('Nombre del supervisor:',s.nombre);if(nombre===null)return;nombre=norm(nombre);if(!nombre){toast('El nombre del supervisor es obligatorio','warning');return;}
    var cargo=prompt('Cargo del supervisor:',s.cargo||'');if(cargo===null)return;
    var proceso=prompt('Proceso / área de supervisión:',s.proceso||'');if(proceso===null)return;
    updateSupervisorRecord(t,c,s.nombre,{nombre:nombre,cargo:norm(cargo),proceso:norm(proceso)});
    saveState(t);ensureExpanded(nit,true);try{window.clsRender&&window.clsRender();}catch(e){}toast('Supervisor actualizado dentro del contrato','success');
  };
  window.sgrtAgregarSupervisorContrato=function(nit,num){
    nit=norm(nit);num=norm(num);var t=db()[nit];if(!t)return;
    var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});if(!c)return;
    var nombre=prompt('Nombre del nuevo supervisor:','');if(nombre===null)return;nombre=norm(nombre);if(!nombre){toast('El nombre del supervisor es obligatorio','warning');return;}
    var cargo=prompt('Cargo del supervisor:','');if(cargo===null)return;
    var proceso=prompt('Proceso / área de supervisión:','');if(proceso===null)return;
    var data={nombre:nombre,cargo:norm(cargo),proceso:norm(proceso),contrato_asociado:num};
    c.supervisores=Array.isArray(c.supervisores)?c.supervisores:[];c.supervisores.push(clone(data));
    if(!c.supervisor_asociado){c.supervisor_asociado=nombre;c.supervisor=nombre;c.supervisorCargo=data.cargo;c.procesoSupervision=data.proceso;}
    t.supervisores=Array.isArray(t.supervisores)?t.supervisores:[];t.supervisores.push(clone(data));
    if(!t.supervisor)t.supervisor=nombre;
    saveState(t);ensureExpanded(nit,true);try{window.clsRender&&window.clsRender();}catch(e){}toast('Supervisor agregado al contrato '+num,'success');
  };

  /* ================================================================
   * REGISTRO — DESPLEGABLE QUE NO SE CIERRA SOLO
   * ================================================================ */
  function loadExpanded(){
    try{return new Set(JSON.parse(localStorage.getItem(EXP_KEY)||'[]').map(String));}catch(e){return new Set();}
  }
  var expanded=loadExpanded();
  function saveExpanded(){try{localStorage.setItem(EXP_KEY,JSON.stringify(Array.from(expanded)));}catch(e){}}
  function ensureExpanded(nit,open){nit=norm(nit);if(!nit)return;if(open)expanded.add(nit);else expanded.delete(nit);saveExpanded();}
  function captureExpanded(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){
      var nit=row.id.slice(4),isOpen=row.style.display!=='none'&&getComputedStyle(row).display!=='none';
      if(isOpen)expanded.add(nit);
    });saveExpanded();
  }
  function restoreExpanded(){
    expanded.forEach(function(nit){
      var row=document.getElementById('exp-'+nit);if(!row)return;
      row.style.display='table-row';
      var main=row.previousElementSibling;if(main&&main.cells&&main.cells[0])main.cells[0].textContent='▼';
    });
  }
  window.clsToggleExpandir=function(nit){
    nit=norm(nit);var row=document.getElementById('exp-'+nit);if(!row)return;
    var open=row.style.display==='none'||getComputedStyle(row).display==='none';
    row.style.display=open?'table-row':'none';ensureExpanded(nit,open);
    var main=row.previousElementSibling;if(main&&main.cells&&main.cells[0])main.cells[0].textContent=open?'▼':'▶';
  };

  function supervisorCardsHtml(t,c,editable){
    var num=contractNum(c),sups=supervisorsFor(t,c);
    if(!sups.length)return '<div style="padding:10px;border:1px dashed #cbd5e1;border-radius:6px;color:#94a3b8;font-size:11px;">Sin supervisor asociado a este contrato.</div>';
    return sups.map(function(s,i){
      return '<div style="background:white;border:1px solid #ddd6fe;border-left:3px solid #7c3aed;border-radius:6px;padding:9px 10px;">'
        +'<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">'
        +'<div><div style="font-size:11.5px;font-weight:800;color:#6b21a8;">'+esc(s.nombre)+'</div>'
        +'<div style="font-size:10.5px;color:#64748b;margin-top:3px;"><b>Cargo:</b> '+esc(s.cargo||'—')+'</div>'
        +'<div style="font-size:10.5px;color:#64748b;margin-top:2px;"><b>Proceso / área:</b> '+esc(s.proceso||'—')+'</div></div>'
        +(editable?'<button onclick="event.stopPropagation();window.sgrtEditarSupervisorContrato(\''+esc(t.nit)+'\',\''+esc(num)+'\','+i+')" style="padding:4px 9px;border:1px solid #c4b5fd;background:#f5f3ff;color:#6d28d9;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;">✏️ Editar</button>':'')
        +'</div></div>';
    }).join('');
  }
  function findContractTitle(cell,num){
    var all=cell.querySelectorAll('div');
    for(var i=0;i<all.length;i++){
      var el=all[i];
      if(el.children.length===0&&norm(el.textContent)===norm(num)&&norm(el.style.fontWeight)==='700')return el;
    }
    return null;
  }
  function enhanceRegistry(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(expRow){
      var nit=expRow.id.slice(4),t=db()[nit];if(!t||!expRow.cells||!expRow.cells[0])return;
      var main=expRow.previousElementSibling;
      // Quitar el bloque duplicado "Contratos y supervisores relacionados" del módulo anterior.
      expRow.querySelectorAll('[data-sgrt-contract-supervisors="1"]').forEach(function(x){x.remove();});
      // Quitar "Supervisores" como bloque independiente: ahora viven dentro de cada contrato.
      Array.from(expRow.querySelectorAll('h4')).forEach(function(h){if(/SUPERVISORES/i.test(norm(h.textContent))){var sec=h.parentElement;if(sec)sec.remove();}});
      // Quitar resumen suelto de supervisores en la fila principal.
      if(main&&main.cells&&main.cells[2]){
        Array.from(main.cells[2].querySelectorAll('span')).forEach(function(sp){if(/^👤/.test(norm(sp.textContent)))sp.remove();});
      }
      var editable=!isEvaluator(),cell=expRow.cells[0];
      (t.contratos||[]).forEach(function(c,idx){
        var num=contractNum(c);if(!num)return;
        var title=findContractTitle(cell,num);if(!title)return;
        var info=title.parentElement;
        if(info){
          var oldInline=info.querySelector('[data-sgrt-inline-sup="1"]');if(oldInline)oldInline.remove();
          var ss=supervisorsFor(t,c),inline=document.createElement('div');inline.setAttribute('data-sgrt-inline-sup','1');
          inline.style.cssText='font-size:10.5px;color:#6d28d9;margin-top:4px;font-weight:600;';
          inline.textContent='👤 '+(ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado');info.appendChild(inline);
        }
        var headerCard=title.parentElement&&title.parentElement.parentElement&&title.parentElement.parentElement.parentElement;
        var detail=headerCard&&headerCard.nextElementSibling;if(!detail)return;
        var sups=supervisorCardsHtml(t,c,editable);
        detail.innerHTML='<div style="margin-bottom:11px;"><strong>Servicio / objeto:</strong> '+esc(contractService(c,t))+'</div>'
          +'<div style="margin-bottom:11px;"><strong>Supervisor(es) relacionados:</strong><div style="display:flex;flex-direction:column;gap:7px;margin-top:7px;">'+sups+'</div>'
          +(editable?'<button onclick="event.stopPropagation();window.sgrtAgregarSupervisorContrato(\''+esc(nit)+'\',\''+esc(num)+'\')" style="width:100%;margin-top:7px;padding:6px 8px;background:#f5f3ff;color:#6d28d9;border:1px solid #c4b5fd;border-radius:5px;font-size:10.5px;font-weight:700;cursor:pointer;">➕ Agregar supervisor a este contrato</button>':'')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Fechas:</strong> '+esc(c.fini||'—')+' a '+esc(c.ffin||'—')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Valor:</strong> '+(c.valor?('$ '+new Intl.NumberFormat('es-CO').format(Number(String(c.valor).replace(/[^0-9.-]/g,''))||0)):'—')+'</div>'
          +'<div style="margin-bottom:8px;"><strong>Procesos:</strong> '+esc(c.procesos||'—')+'</div>'
          +'<div style="margin-bottom:12px;"><strong>Observaciones:</strong> '+esc(c.observaciones||'—')+'</div>'
          +(editable?'<div style="display:flex;gap:8px;"><button onclick="event.stopPropagation();clsEditarContratoDesdeRegistros(\''+esc(nit)+'\','+idx+')" style="flex:1;padding:6px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">✏️ Editar contrato</button><button onclick="event.stopPropagation();clsEliminarContratoDesdeRegistros(\''+esc(nit)+'\','+idx+')" style="flex:1;padding:6px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">🗑️ Eliminar contrato</button></div>':'');
      });
      if(expanded.has(nit)){expRow.style.display='table-row';if(main&&main.cells&&main.cells[0])main.cells[0].textContent='▼';}
    });
  }
  var prevClsRender=window.clsRender;
  if(typeof prevClsRender==='function'){
    window.clsRender=function(){
      captureExpanded();var r=prevClsRender.apply(this,arguments);
      try{enhanceRegistry();restoreExpanded();}catch(e){console.warn('[SGRT31] Registro:',e);}
      setTimeout(function(){try{enhanceRegistry();restoreExpanded();}catch(e){}},0);
      return r;
    };
  }

  /* ================================================================
   * AUTO-REFRESCO: sincroniza datos pero NO repinta Registro/Clasificación
   * mientras el usuario está trabajando allí.
   * ================================================================ */
  var prevRefresh=window._sgrtRefreshCurrent;
  window._sgrtRefreshCurrent=async function(){
    if(renderBusy)return;renderBusy=true;
    try{
      var active=document.querySelector('.page.active'),id=active&&active.id;
      if(id==='pg-clasificacion'){
        // No ejecutar el refresco periódico en esta vista: sgrtCargarDesdeServidor
        // está envuelto por módulos antiguos que vuelven a llamar clsRender().
        // Los guardados y la navegación siguen sincronizando normalmente.
        return;
      }
      if(typeof prevRefresh==='function')return await prevRefresh.apply(this,arguments);
    }finally{renderBusy=false;}
  };

  /* ================================================================
   * SUPERVISIÓN DE AMBIENTE DE CONTROL — TERCERO + CONTRATO
   * ================================================================ */
  function answerSummary(r){
    if(!r)return '<span style="color:#94a3b8;">Sin respuesta</span>';
    var vals=[];for(var i=1;i<=7;i++){var v=r['a'+i];if(v)vals.push(i+': '+v);}return vals.length?esc(vals.join(' · ')):'<span style="color:#94a3b8;">Sin respuesta</span>';
  }
  window.sgrtACSetThird=function(v){window._sgrtACFilterThird=norm(v);window._sgrtACFilterContract='';try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}};
  window.sgrtACSetContract=function(v){
    v=norm(v);if(v.indexOf(SEP)>=0){var p=v.split(SEP);window._sgrtACFilterThird=p[0];window._sgrtACFilterContract=p.slice(1).join(SEP);}else window._sgrtACFilterContract=v;
    try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
  };
  function addSupervisorsToApprovedContractTable(){
    var panel=document.getElementById('cq-panel-reportes');if(!panel)return;
    var cards=panel.querySelectorAll('.card');
    Array.from(cards).forEach(function(card){
      var h=card.querySelector('h3');if(!h||!/Contratos Aprobados Asociados/i.test(norm(h.textContent)))return;
      var table=card.querySelector('table');if(!table)return;
      var hr=table.querySelector('thead tr');if(hr&&!Array.from(hr.children).some(function(x){return /Supervisor/i.test(x.textContent);})){var th=document.createElement('th');th.style.cssText='padding:10px;text-align:left;border:1px solid #ddd;';th.textContent='Supervisor(es)';hr.insertBefore(th,hr.children[3]||null);}
      Array.from(table.querySelectorAll('tbody tr')).forEach(function(tr){
        if(tr.querySelector('[data-sgrt-approved-sups="1"]'))return;
        var cells=tr.children;if(cells.length<3)return;var nit=norm(cells[0].textContent),num=norm(cells[2].textContent),t=db()[nit];if(!t)return;
        var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;}),ss=c?supervisorsFor(t,c):[];
        var td=document.createElement('td');td.setAttribute('data-sgrt-approved-sups','1');td.style.cssText='padding:8px 10px;border:1px solid #ddd;font-size:10.5px;';td.textContent=ss.length?ss.map(function(s){return s.nombre;}).join(', '):'—';tr.insertBefore(td,cells[3]||null);
      });
    });
  }
  function injectSupervisionV2(){
    if(!isRiskAdmin())return;
    var panel=document.getElementById('cq-panel-reportes');if(!panel)return;
    var old=document.getElementById('sgrt-ac-supervision-contract');if(old)old.remove();
    var old2=document.getElementById('sgrt-ac-supervision-v2');if(old2)old2.remove();
    var anchor=document.getElementById('rpt-tabla-wrap');if(anchor)anchor.style.display='none';

    var third=norm(window._sgrtACFilterThird||''),contract=norm(window._sgrtACFilterContract||'');
    if(third&&!db()[third]){third='';contract='';window._sgrtACFilterThird='';window._sgrtACFilterContract='';}
    var thirds=Object.values(db()).filter(function(t){return t&&norm(t.nit||t.NIT)&&(t.contratos||[]).some(function(c){return contractNum(c);});}).sort(function(a,b){return norm(a.nombre).localeCompare(norm(b.nombre),'es');});
    var contractOptions=[];
    if(third){
      var tt=db()[third];(tt&&tt.contratos||[]).forEach(function(c){var n=contractNum(c);if(n)contractOptions.push({value:n,label:n+(supervisorsFor(tt,c).length?' — '+supervisorsFor(tt,c).map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});
    }else{
      thirds.forEach(function(t){(t.contratos||[]).forEach(function(c){var n=contractNum(c);if(!n)return;var ss=supervisorsFor(t,c);contractOptions.push({value:t.nit+SEP+n,label:n+' — '+(t.nombre||t.nit)+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});});
    }
    if(third&&contract&&!contractOptions.some(function(x){return x.value===contract;})){contract='';window._sgrtACFilterContract='';}

    var rows=[];
    thirds.forEach(function(t){
      var nit=norm(t.nit||t.NIT);if(third&&nit!==third)return;
      (t.contratos||[]).forEach(function(c){
        var num=contractNum(c);if(!num||contract&&num!==contract)return;
        var ss=supervisorsFor(t,c),resp=responseFor(t,nit,num),dims=dimsFor(t,num);
        dims.forEach(function(d){
          var ctrls=[];try{ctrls=window._ctrlsCuest?window._ctrlsCuest(nit,d.key,num):[];}catch(e){}
          // _ctrlsCuest ya devuelve solamente los controles activos después de aplicar
          // la configuración por tercero + contrato.
          ctrls.forEach(function(q){
            var rr=resp&&resp[d.key]&&resp[d.key][q.n];
            rows.push({tercero:t.nombre||nit,nit:nit,contrato:num,servicio:contractService(c,t),supervisores:ss.map(function(s){return s.nombre;}).join(', ')||'—',tip:window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key),n:q.n,pregunta:q.ctrl||q.req||q.texto||('Control '+q.n),respuesta:rr,obs:rr&&rr.obs||''});
          });
        });
      });
    });

    var card=document.createElement('div');card.id='sgrt-ac-supervision-v2';card.className='card';card.style.marginBottom='16px';
    card.innerHTML='<div class="card-hdr" style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap;">'
      +'<div><h3 style="margin:0;">Supervisión de Ambiente de Control</h3><div style="font-size:10.5px;color:#64748b;margin-top:3px;">Filtra por tercero y contrato. Solo aparecen las preguntas que quedaron activas en Configuración.</div></div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">'
      +'<label style="font-size:10.5px;font-weight:700;color:#475569;">Tercero<div><select onchange="window.sgrtACSetThird(this.value)" style="min-width:230px;max-width:320px;padding:7px 9px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los terceros</option>'+thirds.map(function(t){return '<option value="'+esc(t.nit)+'" '+(third===norm(t.nit)?'selected':'')+'>'+esc((t.nombre||t.nit)+' — '+t.nit)+'</option>';}).join('')+'</select></div></label>'
      +'<label style="font-size:10.5px;font-weight:700;color:#475569;">Contrato / Supervisor<div><select onchange="window.sgrtACSetContract(this.value)" style="min-width:260px;max-width:420px;padding:7px 9px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los contratos</option>'+contractOptions.map(function(o){var selected=third?(contract===o.value):false;return '<option value="'+esc(o.value)+'" '+(selected?'selected':'')+'>'+esc(o.label)+'</option>';}).join('')+'</select></div></label>'
      +'</div></div>'
      +'<div style="overflow:auto;max-height:620px;"><table style="width:100%;border-collapse:collapse;font-size:10.7px;min-width:1120px;"><thead><tr style="background:#1a3a5c;color:white;position:sticky;top:0;z-index:2;"><th style="padding:8px;text-align:left;">Tercero</th><th style="padding:8px;text-align:left;">Contrato</th><th style="padding:8px;text-align:left;">Servicio</th><th style="padding:8px;text-align:left;">Supervisor(es)</th><th style="padding:8px;text-align:left;">Tipología</th><th style="padding:8px;text-align:left;">Pregunta activa</th><th style="padding:8px;text-align:left;">Respuesta</th><th style="padding:8px;text-align:left;">Observaciones</th></tr></thead><tbody>'
      +(rows.length?rows.map(function(x,i){return '<tr style="border-bottom:1px solid #eef2f7;background:'+(i%2?'#fbfdff':'white')+';"><td style="padding:7px;"><b>'+esc(x.tercero)+'</b><div style="font-size:9.5px;color:#64748b;">'+esc(x.nit)+'</div></td><td style="padding:7px;font-weight:800;color:#78350f;">'+esc(x.contrato)+'</td><td style="padding:7px;max-width:190px;">'+esc(x.servicio)+'</td><td style="padding:7px;max-width:180px;">'+esc(x.supervisores)+'</td><td style="padding:7px;">'+esc(x.tip)+'</td><td style="padding:7px;max-width:300px;"><b>#'+esc(x.n)+'</b> '+esc(x.pregunta)+'</td><td style="padding:7px;max-width:260px;">'+answerSummary(x.respuesta)+'</td><td style="padding:7px;max-width:220px;">'+(x.obs?esc(x.obs):'<span style="color:#94a3b8;">—</span>')+'</td></tr>';}).join(''):'<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">No hay preguntas activas para el tercero/contrato seleccionado.</td></tr>')
      +'</tbody></table></div>';
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(card,anchor);else panel.appendChild(card);
    addSupervisorsToApprovedContractTable();
  }
  var prevReports=window.renderReportesAC;
  if(typeof prevReports==='function'){
    window.renderReportesAC=function(){var r=prevReports.apply(this,arguments);try{injectSupervisionV2();}catch(e){console.warn('[SGRT31] Supervisión AC:',e);}return r;};
  }

  /* ================================================================
   * EVALUADOR — CONTRATO + SERVICIO + SUPERVISORES + NIVEL DE RIESGO
   * ================================================================ */
  function contractsRichHtml(t){
    var cs=(t.contratos||[]).filter(function(c){return contractNum(c);});if(!cs.length)return '<span style="color:#94a3b8;">Sin contratos</span>';
    return '<div style="display:flex;flex-direction:column;gap:7px;">'+cs.map(function(c){var ss=supervisorsFor(t,c);return '<div style="padding:7px 8px;border:1px solid #e2e8f0;border-radius:6px;background:#fbfdff;"><div style="font-size:10.8px;font-weight:800;color:#1a3a5c;">Contrato '+esc(contractNum(c))+'</div><div style="font-size:10px;color:#475569;margin-top:2px;"><b>Servicio:</b> '+esc(contractService(c,t))+'</div><div style="font-size:10px;color:#6d28d9;margin-top:2px;"><b>Supervisor(es):</b> '+esc(ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado')+'</div></div>';}).join('')+'</div>';
  }
  function enhanceEvaluatorGeneral(){
    if(!isEvaluator())return;
    var body=document.getElementById('ig-tbody-terceros');if(!body)return;var table=body.closest('table');if(!table)return;
    var ths=table.querySelectorAll('thead th');Array.from(ths).forEach(function(th){if(/Contratos/i.test(th.textContent))th.textContent='Contratos / Servicio / Supervisor(es)';if(/Tipo de riesgo/i.test(th.textContent))th.textContent='Nivel de riesgo';});
    Array.from(body.querySelectorAll('tr')).forEach(function(tr){
      var cells=tr.cells;if(!cells||cells.length<4)return;var nit=norm(cells[0].textContent),t=db()[nit];if(!t)return;cells[3].innerHTML=contractsRichHtml(t);
    });
    // Solo en Información General: corregir cualquier etiqueta residual "Tipo de riesgo".
    var pg=document.getElementById('pg-info-general');if(pg){Array.from(pg.querySelectorAll('th,label,strong,span,div')).forEach(function(el){if(el.children.length===0&&/tipo de riesgo/i.test(norm(el.textContent)))el.textContent=el.textContent.replace(/tipo de riesgo/ig,'Nivel de riesgo');});}
  }
  window.sgrtVerDetalleClasificacion=function(nit){
    nit=norm(nit);var t=db()[nit];if(!t)return;
    var old=document.getElementById('sgrt-detalle-clasificacion-modal');if(old)old.remove();
    var cs=(t.contratos||[]).filter(function(c){return contractNum(c);});
    var modal=document.createElement('div');modal.id='sgrt-detalle-clasificacion-modal';modal.className='overlay';modal.style.cssText='display:flex;z-index:10080;';
    modal.innerHTML='<div class="modal" style="width:760px;max-width:96vw;max-height:88vh;overflow:auto;"><div class="mh"><h3>Tipologías y clasificación por contrato</h3><button class="mc-btn" onclick="document.getElementById(\'sgrt-detalle-clasificacion-modal\').remove()">✕</button></div><div class="mb" style="padding:16px;">'
      +(cs.length?cs.map(function(c){var num=contractNum(c),dims=dimsFor(t,num),pc=(t.promPorContrato||{})[num]||{},ss=supervisorsFor(t,c);return '<div style="border:1px solid #dbe3ea;border-radius:8px;margin-bottom:11px;overflow:hidden;"><div style="padding:10px 12px;background:#f8fafc;"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;"><b style="color:#1a3a5c;">Contrato '+esc(num)+'</b><span style="font-size:11px;"><b>Promedio:</b> '+esc(pc.prom!=null?pc.prom:'—')+' · <b>Nivel de riesgo:</b> '+esc(pc.zona||riskLevel(t,num))+'</span></div><div style="font-size:10.5px;color:#475569;margin-top:4px;"><b>Servicio:</b> '+esc(contractService(c,t))+'</div><div style="font-size:10.5px;color:#6d28d9;margin-top:3px;"><b>Supervisor(es):</b> '+esc(ss.length?ss.map(function(s){return s.nombre;}).join(', '):'Sin supervisor asociado')+'</div></div><div style="padding:10px 12px;">'+(dims.length?dims.map(function(d){return '<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:11.5px;"><span>'+esc(d.nombre||d.key)+'</span><b>'+esc(d.val==null?'—':d.val)+'</b></div>';}).join(''):'<div style="color:#94a3b8;font-size:11px;">Sin tipologías clasificadas para este contrato.</div>')+'</div></div>';}).join(''):'<div style="color:#64748b;">Este tercero no tiene contratos registrados.</div>')
      +'</div></div>';
    document.body.appendChild(modal);
  };
  // Si alguna vista antigua del Evaluador sigue llamando a clsVerDetalleLectura,
  // usar el mismo detalle reducido y coherente por contrato.
  var prevReadDetail=window.clsVerDetalleLectura;
  window.clsVerDetalleLectura=function(nit){if(isEvaluator())return window.sgrtVerDetalleClasificacion(nit);return typeof prevReadDetail==='function'?prevReadDetail.apply(this,arguments):undefined;};
  var prevIG=window.loadIGTercerosFull;
  if(typeof prevIG==='function'){
    window.loadIGTercerosFull=function(){var r=prevIG.apply(this,arguments);setTimeout(enhanceEvaluatorGeneral,0);return r;};
  }

  function enhanceEvaluatorContractSelectors(){
    if(!isEvaluator())return;
    [['q-tercero','q-contrato-sel'],['ac-tercero-instruc','ac-contrato-sel']].forEach(function(pair){
      var nit=norm((document.getElementById(pair[0])||{}).value),sel=document.getElementById(pair[1]);if(!nit||!sel||!db()[nit])return;
      var t=db()[nit];Array.from(sel.options).forEach(function(o){var c=(t.contratos||[]).find(function(x){return contractNum(x)===norm(o.value);});if(!c)return;var ss=supervisorsFor(t,c);o.textContent=contractNum(c)+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor');});
    });
  }

  /* ================================================================
   * SESIÓN: PERSISTE HASTA QUE EL USUARIO PULSE CERRAR SESIÓN
   * ================================================================ */
  function loginKeyForCurrent(){
    var fromInput=norm((document.getElementById('li-user')||{}).value).toLowerCase();if(fromInput)return fromInput;
    var cur=window.currentUser||null;if(!cur||!window.USERS)return'';
    var keys=Object.keys(window.USERS);for(var i=0;i<keys.length;i++){if(window.USERS[keys[i]]===cur)return keys[i];}
    for(var j=0;j<keys.length;j++){var u=window.USERS[keys[j]];if(u&&cur&&u.name===cur.name&&u.rol===cur.rol)return keys[j];}
    return'';
  }
  function persistSession(login){
    login=norm(login||loginKeyForCurrent()).toLowerCase();if(!login||!window.currentUser)return;
    try{localStorage.setItem(SESSION_KEY,JSON.stringify({login:login,active:true,ts:Date.now()}));localStorage.setItem(LEGACY_SESSION_KEY,JSON.stringify({login:login,ts:Date.now()}));localStorage.removeItem(LOGOUT_KEY);}catch(e){}
  }
  var prevLogin=window.doLogin;
  if(typeof prevLogin==='function'){
    window.doLogin=function(){
      var login=norm((document.getElementById('li-user')||{}).value).toLowerCase();var r=prevLogin.apply(this,arguments);
      if(window.currentUser)persistSession(login);
      setTimeout(function(){if(window.currentUser)persistSession(login);},0);
      return r;
    };
  }
  var prevLogout=window.doLogout;
  window.doLogout=function(){
    try{localStorage.removeItem(SESSION_KEY);localStorage.removeItem(LEGACY_SESSION_KEY);localStorage.setItem(LOGOUT_KEY,'1');}catch(e){}
    var r=typeof prevLogout==='function'?prevLogout.apply(this,arguments):undefined;
    try{window.currentUser=null;}catch(e2){}
    return r;
  };
  function readSession(){
    try{if(localStorage.getItem(LOGOUT_KEY)==='1')return null;var s=JSON.parse(localStorage.getItem(SESSION_KEY)||localStorage.getItem(LEGACY_SESSION_KEY)||'null');return s&&s.login?s:null;}catch(e){return null;}
  }
  function restoreSession(){
    if(window.currentUser)return true;var s=readSession();if(!s||!s.login||!window.USERS||!window.USERS[s.login]||typeof window.doLogin!=='function')return false;
    var user=document.getElementById('li-user'),pass=document.getElementById('li-pass');if(!user||!pass)return false;
    var oldPass=pass.value;user.value=s.login;pass.value=window.USERS[s.login].pass||'';
    try{window.doLogin();}catch(e){pass.value=oldPass;return false;}
    pass.value='';if(window.currentUser){persistSession(s.login);return true;}return false;
  }
  function startSessionRestore(){
    if(restoreSession())return;var tries=0,tm=setInterval(function(){tries++;if(restoreSession()||tries>=30)clearInterval(tm);},100);
  }
  window.addEventListener('pageshow',function(){setTimeout(startSessionRestore,0);});

  /* ================================================================
   * POST-RENDER / INICIALIZACIÓN
   * ================================================================ */
  function postRender(){
    try{enhanceRegistry();restoreExpanded();}catch(e){}
    try{enhanceEvaluatorGeneral();enhanceEvaluatorContractSelectors();}catch(e2){}
    try{addSupervisorsToApprovedContractTable();}catch(e3){}
  }
  document.addEventListener('DOMContentLoaded',function(){
    startSessionRestore();
    setTimeout(postRender,120);
    setTimeout(postRender,600);
  });
  if(document.readyState!=='loading'){
    startSessionRestore();setTimeout(postRender,80);setTimeout(postRender,500);
  }

  // Cambios de select / navegación: reforzar etiquetas contrato-supervisor sin repintar toda la página.
  document.addEventListener('change',function(ev){var id=ev.target&&ev.target.id||'';if(id==='q-tercero'||id==='ac-tercero-instruc'||id==='q-contrato-sel'||id==='ac-contrato-sel')setTimeout(enhanceEvaluatorContractSelectors,0);});

})();
