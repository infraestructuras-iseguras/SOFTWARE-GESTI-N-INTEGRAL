/*
 * SGRT — Ajuste 33 (2026-09-04)
 * Cambios puntuales solicitados, sin modificar backend/base de datos ni rediseñar el flujo:
 * 1) Evaluador: sin tipologías repetidas en listado, "Nivel de riesgo" y sin desplegable de edición.
 *    Ver detalle concentra Contrato + Objeto/servicio + Supervisor(es) + Tipologías/calificación.
 * 2) Admin Riesgos / Supervisión AC: conserva EXACTAMENTE la matriz original de 6 atributos
 *    y sus columnas de cálculo, agregando únicamente filtros Tercero > Contrato/Supervisor.
 * 3) Valor de contrato: lectura/visualización robusta para formatos COP (480.000.000,00, etc.).
 */
(function(){
  'use strict';

  var SEP='|||';
  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function role(){return low((window.currentUser||{}).rol);}
  function isEvaluator(){var r=role();return r==='evaluador'||r==='cliente';}
  function isRiskAdmin(){var r=role();return r==='admin_riesgos'||r==='operativo'||r.indexOf('administrador de riesgos')>=0;}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function contractService(c,t){return norm(c&&(c.objeto||c.servicio||c.servicio_contratado||c.Servicio_Contratado||c.descripcion))||norm(t&&(t.servicio_contratado||t.servicio||t.Servicio_Contratado))||'—';}

  function supervisorsFor(t,c){
    var num=contractNum(c);
    try{
      if(window.sgrtSupervisoresContrato&&t&&t.nit){
        var existing=window.sgrtSupervisoresContrato(t.nit,num);
        if(Array.isArray(existing)&&existing.length)return existing;
      }
    }catch(e){}
    var out=[],seen={};
    function add(s,forced){
      if(!s)return;if(typeof s==='string')s={nombre:s};
      var name=norm(s.nombre||s.name||s.supervisor||s.SupervisorNombre);if(!name)return;
      var cn=norm(s.contrato_asociado||s.contratoAsociado||s.contrato||s.numeroContrato||forced||num);
      if(cn&&num&&cn!==num)return;
      var k=low(name)+'|'+low(cn||num);if(seen[k])return;seen[k]=1;
      out.push({nombre:name,cargo:norm(s.cargo||s.supervisorCargo||s.cargo_supervisor),proceso:norm(s.proceso||s.procesoSupervision||s.proceso_supervision),contrato_asociado:cn||num});
    }
    (Array.isArray(c&&c.supervisores)?c.supervisores:[]).forEach(function(s){add(s,num);});
    if(c){
      add({nombre:c.supervisor_asociado||c.supervisor,cargo:c.supervisorCargo,proceso:c.procesoSupervision,contrato_asociado:num},num);
      add({nombre:c.supervisorAlt,cargo:c.supervisorAltCargo,proceso:c.procesoSupervisionAlt,contrato_asociado:num},num);
    }
    (Array.isArray(t&&t.supervisores)?t.supervisores:[]).forEach(function(s){add(s);});
    return out;
  }

  /* ================================================================
   * VALOR DE CONTRATO — SOPORTE FORMATO COLOMBIANO / INTERNACIONAL
   * ================================================================ */
  function parseMoney(raw){
    if(raw===null||raw===undefined||raw==='')return null;
    if(typeof raw==='number')return isFinite(raw)?raw:null;
    var s=norm(raw).replace(/\s+/g,'').replace(/COP/ig,'').replace(/\$/g,'');
    if(!s)return null;
    s=s.replace(/[^0-9,.-]/g,'');
    if(!s)return null;
    var lastDot=s.lastIndexOf('.'),lastComma=s.lastIndexOf(',');
    if(lastDot>=0&&lastComma>=0){
      // El último separador es el decimal; el otro se considera de miles.
      if(lastComma>lastDot)s=s.replace(/\./g,'').replace(',', '.');
      else s=s.replace(/,/g,'');
    }else if(lastComma>=0){
      var commas=(s.match(/,/g)||[]).length;
      var afterC=s.length-lastComma-1;
      if(commas===1&&afterC<=2)s=s.replace(',', '.');
      else s=s.replace(/,/g,'');
    }else if(lastDot>=0){
      var dots=(s.match(/\./g)||[]).length;
      var afterD=s.length-lastDot-1;
      // 500.000 o 480.000.000 = separador de miles. 1234.50 = decimal.
      if(dots>1||(dots===1&&afterD===3))s=s.replace(/\./g,'');
    }
    var n=Number(s);return isFinite(n)?n:null;
  }
  function formatMoney(raw){
    var n=parseMoney(raw);
    if(n===null)return norm(raw)||'—';
    var dec=Math.abs(n-Math.round(n))>0.000001?2:0;
    return '$ '+new Intl.NumberFormat('es-CO',{minimumFractionDigits:dec,maximumFractionDigits:2}).format(n);
  }
  window.sgrtParseContractValue=parseMoney;
  window.sgrtFormatContractValue=formatMoney;

  function findContractTitle(cell,num){
    var divs=cell?cell.querySelectorAll('div'):[];
    for(var i=0;i<divs.length;i++){
      var el=divs[i];if(el.children.length===0&&norm(el.textContent)===norm(num)&&String(el.style.fontWeight)==='700')return el;
    }
    return null;
  }
  function patchRegistryValues(){
    document.querySelectorAll('tr[id^="exp-"]').forEach(function(row){
      var nit=row.id.slice(4),t=db()[nit],cell=row.cells&&row.cells[0];if(!t||!cell)return;
      (t.contratos||[]).forEach(function(c){
        var num=contractNum(c),title=findContractTitle(cell,num);if(!num||!title)return;
        var header=title.parentElement&&title.parentElement.parentElement&&title.parentElement.parentElement.parentElement;
        var detail=header&&header.nextElementSibling;if(!detail)return;
        Array.from(detail.querySelectorAll('strong')).forEach(function(st){
          if(low(st.textContent).replace(':','')==='valor'){
            var parent=st.parentElement;if(parent)parent.innerHTML='<strong>Valor:</strong> '+esc(formatMoney(c.valor));
          }
        });
      });
    });
  }

  function patchApprovedContractsValues(){
    var cards=Array.from(document.querySelectorAll('.card'));
    cards.forEach(function(card){
      var h=card.querySelector('h3');if(!h||low(h.textContent).indexOf('contratos aprobados asociados')<0)return;
      var table=card.querySelector('table');if(!table)return;
      var heads=Array.from(table.querySelectorAll('thead th')).map(function(x){return low(x.textContent);});
      var iNit=heads.findIndex(function(x){return x.indexOf('nit')>=0;});
      var iCon=heads.findIndex(function(x){return x.indexOf('contrato')>=0;});
      var iVal=heads.findIndex(function(x){return x.indexOf('valor')>=0;});
      if(iNit<0||iCon<0||iVal<0)return;
      Array.from(table.querySelectorAll('tbody tr')).forEach(function(tr){
        if(!tr.cells||tr.cells.length<=Math.max(iNit,iCon,iVal))return;
        var nit=norm(tr.cells[iNit].textContent),num=norm(tr.cells[iCon].textContent),t=db()[nit];if(!t)return;
        var c=(t.contratos||[]).find(function(x){return contractNum(x)===num;});if(!c)return;
        tr.cells[iVal].textContent=formatMoney(c.valor);
        tr.cells[iVal].style.textAlign='right';
      });
    });
  }

  /* ================================================================
   * EVALUADOR — LISTADO SIN INFORMACIÓN REPETIDA
   * ================================================================ */
  function patchEvaluatorList(){
    if(!isEvaluator())return;
    var tbody=document.getElementById('cls-dash-tbody');if(!tbody)return;
    var table=tbody.closest('table'),ths=table?Array.from(table.querySelectorAll('thead th')):[];
    var tipIdx=-1;
    ths.forEach(function(th,i){
      var txt=low(th.textContent);
      if(th.id==='cls-th-tipologias'||txt.indexOf('tipologías')>=0||txt.indexOf('tipologias')>=0){tipIdx=i;th.style.display='none';}
      if(txt.indexOf('tipo de riesgo')>=0)th.textContent='Nivel de riesgo';
    });
    Array.from(tbody.children).forEach(function(row){
      if(/^exp-/.test(row.id||'')){
        // El Evaluador supervisa/consulta: el detalle se abre únicamente con "Ver detalle".
        row.style.display='none';row.dataset.sgrtEvaluatorNoExpand='1';return;
      }
      if(row.cells&&row.cells[0]){
        row.cells[0].textContent='';row.cells[0].onclick=null;row.cells[0].removeAttribute('onclick');row.cells[0].style.cursor='default';
      }
      if(row.cells&&row.cells[1]&&row.cells[2]){
        var nit=norm(row.cells[1].textContent),t=db()[nit];
        if(t){
          Array.from(row.cells[2].children).forEach(function(el){if(/^📋/.test(norm(el.textContent)))el.remove();});
          var oldCompact=row.cells[2].querySelector('[data-sgrt-eval-contracts-v4]');if(oldCompact)oldCompact.remove();
          var cons=(t.contratos||[]).filter(function(c){return contractNum(c);});
          if(cons.length){
            var compact=document.createElement('div');compact.dataset.sgrtEvalContractsV4='1';compact.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;';
            compact.innerHTML=cons.map(function(c){return '<span style="display:inline-block;padding:2px 7px;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:5px;font-size:9.5px;font-weight:700;">Contrato '+esc(contractNum(c))+'</span>';}).join('');
            row.cells[2].appendChild(compact);
          }
        }
      }
      if(tipIdx>=0&&row.cells&&row.cells[tipIdx])row.cells[tipIdx].style.display='none';
    });
  }

  function dimsFor(t,num){
    num=norm(num);
    if(t&&num&&t.dimsPorContrato&&Array.isArray(t.dimsPorContrato[num]))return t.dimsPorContrato[num];
    var c=(t&&t.contratos||[]).find(function(x){return contractNum(x)===num;});
    if(c&&Array.isArray(c.dims))return c.dims;
    if(t&&norm(t.contratoEval)===num&&Array.isArray(t.dims))return t.dims;
    return t&&Array.isArray(t.dims)?t.dims:[];
  }
  function promFor(t,num,dims){
    var pc=t&&t.promPorContrato&&t.promPorContrato[num];
    if(pc&&pc.prom!==undefined&&pc.prom!==null&&!isNaN(parseFloat(pc.prom)))return parseFloat(pc.prom);
    var vals=(dims||[]).map(function(d){return parseFloat(d&&((d.val!==undefined)?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel)));}).filter(function(v){return !isNaN(v);});
    return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:NaN;
  }
  function riskFor(t,num,p){
    var pc=t&&t.promPorContrato&&t.promPorContrato[num];
    return norm(pc&&(pc.zona||pc.nivel_riesgo))||norm(t&&(t.nivel_riesgo||t.zona||t.ZonaRiesgo))||(isNaN(p)?'SIN CLASIFICAR':p>=4?'EXTREMO':p>3?'ALTO':p>=2?'MODERADO':'BAJO');
  }
  function tipName(d){
    try{if(window._nombreTipologia)return window._nombreTipologia(d);}catch(e){}
    return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.key))||'Tipología';
  }
  function scoreMeta(v){
    var n=parseFloat(v);if(isNaN(n))return{score:'—',label:'Sin puntaje',color:'#6b7280'};
    return{score:n,label:n>=5?'CRÍTICO':n>=4?'ALTO':n>=3?'MEDIO':n>=2?'BAJO':'MUY BAJO',color:n>=5?'#dc2626':n>=4?'#ea580c':n>=3?'#d97706':n>=2?'#2563eb':'#16a34a'};
  }

  window.clsVerDetalleLectura=function(nit){
    var t=db()[norm(nit)];if(!t)return;
    var old=document.getElementById('_cls-det');if(old)old.remove();
    var contratos=(t.contratos||[]).filter(function(c){return contractNum(c);});
    if(!contratos.length)contratos=[{num:norm(t.nocontrato)||'Sin contrato',objeto:t.servicio||'',supervisores:[]}];
    var body=contratos.map(function(c){
      var num=contractNum(c)||norm(c.num)||'Sin contrato',dims=dimsFor(t,num),p=promFor(t,num,dims),risk=riskFor(t,num,p),ss=supervisorsFor(t,c);
      var supHtml=ss.length?ss.map(function(s){return '<div style="padding:6px 8px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:6px;"><b style="color:#6b21a8;">'+esc(s.nombre)+'</b>'+(s.cargo?'<span style="color:#64748b;"> · '+esc(s.cargo)+'</span>':'')+(s.proceso?'<div style="font-size:10.5px;color:#64748b;margin-top:2px;">'+esc(s.proceso)+'</div>':'')+'</div>';}).join(''):'<span style="color:#94a3b8;">Sin supervisor asociado</span>';
      var tips=dims.length?dims.map(function(d){var raw=d.val!==undefined?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel),m=scoreMeta(raw);return '<div style="display:grid;grid-template-columns:minmax(220px,1fr) 70px 100px;gap:8px;align-items:center;padding:8px 10px;border-bottom:1px solid #eef2f7;"><div style="font-size:11.5px;font-weight:700;color:#1a3a5c;">'+esc(tipName(d))+'</div><div style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:'+m.color+';text-align:center;">'+esc(m.score)+'</div><div style="font-size:9.5px;font-weight:800;color:'+m.color+';text-align:center;">'+esc(m.label)+'</div></div>';}).join(''):'<div style="padding:12px;color:#94a3b8;text-align:center;font-size:11px;">Sin tipologías clasificadas para este contrato.</div>';
      return '<div style="border:1px solid #dbe3ec;border-radius:9px;overflow:hidden;margin-bottom:13px;background:white;">'
        +'<div style="padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;">'
        +'<div><div style="font-size:13px;font-weight:800;color:#1a3a5c;">Contrato '+esc(num)+'</div><div style="font-size:10.5px;color:#64748b;margin-top:2px;">'+esc(contractService(c,t))+'</div></div>'
        +'<div style="display:flex;gap:8px;align-items:center;"><span style="padding:4px 9px;border-radius:12px;background:#eff6ff;color:#1e40af;font-size:10px;font-weight:800;">Promedio '+(isNaN(p)?'—':p.toFixed(2))+'</span><span style="padding:4px 9px;border-radius:12px;background:#fef2f2;color:#b91c1c;font-size:10px;font-weight:800;">Nivel de riesgo: '+esc(risk)+'</span></div></div>'
        +'<div style="padding:10px 12px;border-bottom:1px solid #eef2f7;"><div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Supervisor(es) relacionados</div><div style="display:flex;flex-direction:column;gap:5px;">'+supHtml+'</div></div>'
        +'<div><div style="padding:8px 10px;background:#f8fafc;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;display:grid;grid-template-columns:minmax(220px,1fr) 70px 100px;gap:8px;"><span>Tipología</span><span style="text-align:center;">Puntaje</span><span style="text-align:center;">Clasificación</span></div>'+tips+'</div></div>';
    }).join('');
    var ov=document.createElement('div');ov.id='_cls-det';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9990;display:flex;align-items:flex-start;justify-content:center;padding:34px 12px;overflow:auto;';ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="background:white;border-radius:12px;width:820px;max-width:98vw;max-height:calc(100vh - 68px);overflow:auto;box-shadow:0 12px 50px rgba(0,0,0,.25);"><div style="padding:15px 20px;background:linear-gradient(135deg,#0d2740,#1e6bb8);border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;gap:12px;"><div><div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:white;">Detalle de clasificación</div><div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:3px;">'+esc(t.nombre||nit)+' · NIT '+esc(t.nit||nit)+'</div></div><button onclick="document.getElementById(\'_cls-det\').remove()" style="background:none;border:none;color:rgba(255,255,255,.8);font-size:22px;cursor:pointer;padding:0;">&times;</button></div><div style="padding:16px 18px;">'+body+'<div style="display:flex;justify-content:flex-end;"><button onclick="document.getElementById(\'_cls-det\').remove()" class="btn btn-outline">Cerrar</button></div></div></div>';
    document.body.appendChild(ov);
  };

  /* ================================================================
   * ADMIN RIESGOS — MATRIZ ORIGINAL EXACTA + FILTROS
   * ================================================================ */
  function responseFor(t,nit,num){
    if(t&&t.respuestasACPorContrato&&t.respuestasACPorContrato[num])return t.respuestasACPorContrato[num];
    if(t&&norm(t.contratoEval)===norm(num))return (window.CUEST_RESPUESTAS||{})[nit]||{};
    return {};
  }
  function activeCtrls(nit,num,key){
    try{if(typeof window._ctrlsCuest==='function'){var a=window._ctrlsCuest(nit,key,num);if(Array.isArray(a))return a;}}catch(e){}
    return ((window.CUESTIONARIO_CONTROLES||{})[key]||[]).filter(function(q){return q&&q.activo!==false;});
  }
  function calcVal(r){
    try{if(typeof window._calcCtrlValoracion==='function')return window._calcCtrlValoracion(r);}catch(e){}
    r=r||{};var score={a1:.15,a2:.10,a3:.10,a4:.15,a5:.20,a6:.15},sum=0;
    Object.keys(score).forEach(function(k){var v=norm(r[k]);if(v==='Si')sum+=score[k];else if(v==='Parcial')sum+=Math.min(.05,score[k]);});
    var pct=Math.round(sum*100),m=pct>=91?['OPTIMIZADO',5,'#15803D','#DCFCE7']:pct>=71?['ADMINISTRADO',4,'#16A34A','#F0FDF4']:pct>=41?['DEFINIDO',3,'#CA8A04','#FEFCE8']:pct>=21?['REPETIBLE',2,'#EA580C','#FFF7ED']:pct>0?['INICIAL',1,'#DC2626','#FEF2F2']:['NO EXISTE',0,'#6B7280','#F3F4F6'];
    if(norm(r.a1)==='No Aplica')return{pct:0,nivelCumpl:'NO APLICA',madurez:'NO APLICA',valorMad:null,color:'#6B7280',bgColor:'#F3F4F6'};
    return{pct:pct,nivelCumpl:pct+'%',madurez:m[0],valorMad:m[1],color:m[2],bgColor:m[3]};
  }

  window.sgrtACMatrixThird=function(v){
    window._sgrtACMatrixThird=norm(v);window._sgrtACMatrixContract='';window._rptFiltroNit=norm(v);window._rptFiltroContrato='';
    try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
  };
  window.sgrtACMatrixContract=function(v){
    v=norm(v);
    if(v.indexOf(SEP)>=0){var p=v.split(SEP);window._sgrtACMatrixThird=p[0];window._sgrtACMatrixContract=p.slice(1).join(SEP);window._rptFiltroNit=p[0];window._rptFiltroContrato=window._sgrtACMatrixContract;}
    else{window._sgrtACMatrixContract=v;window._rptFiltroContrato=v;}
    try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
  };

  function ensureACFilters(card,third,contract,thirds){
    var opts=[];
    if(third&&db()[third]){
      (db()[third].contratos||[]).forEach(function(c){var n=contractNum(c);if(!n)return;var ss=supervisorsFor(db()[third],c);opts.push({v:n,l:'Contrato '+n+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});
    }else{
      thirds.forEach(function(t){(t.contratos||[]).forEach(function(c){var n=contractNum(c);if(!n)return;var ss=supervisorsFor(t,c);opts.push({v:norm(t.nit||t.NIT)+SEP+n,l:'Contrato '+n+' — '+(t.nombre||t.nit)+(ss.length?' — '+ss.map(function(s){return s.nombre;}).join(', '):' — Sin supervisor')});});});
    }
    var old=document.getElementById('sgrt-ac-matrix-filters');if(old)old.remove();
    var bar=document.createElement('div');bar.id='sgrt-ac-matrix-filters';bar.style.cssText='padding:10px 12px;background:#f8fbff;border:1px solid #dbeafe;border-radius:8px;margin:0 0 10px;display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;';
    bar.innerHTML='<div style="font-size:11px;font-weight:800;color:#1a3a5c;margin-right:4px;padding-bottom:8px;">Filtros de supervisión</div>'
      +'<label style="font-size:10px;font-weight:700;color:#475569;">Tercero<br><select onchange="window.sgrtACMatrixThird(this.value)" style="min-width:240px;padding:7px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los terceros</option>'+thirds.map(function(t){var n=norm(t.nit||t.NIT);return '<option value="'+esc(n)+'" '+(third===n?'selected':'')+'>'+esc((t.nombre||n)+' — '+n)+'</option>';}).join('')+'</select></label>'
      +'<label style="font-size:10px;font-weight:700;color:#475569;">Contrato / Supervisor<br><select onchange="window.sgrtACMatrixContract(this.value)" style="min-width:330px;max-width:520px;padding:7px;border:1px solid #93c5fd;border-radius:6px;background:white;font-size:11px;"><option value="">Todos los contratos</option>'+opts.map(function(o){var sel=third&&contract===o.v;return '<option value="'+esc(o.v)+'" '+(sel?'selected':'')+'>'+esc(o.l)+'</option>';}).join('')+'</select></label>'
      +'<div style="font-size:10px;color:#64748b;padding-bottom:7px;">Se conservan las columnas originales y solo aparecen las preguntas activadas para cada contrato.</div>';
    card.parentNode.insertBefore(bar,card);
  }

  window._sgrtObsDetalleV4=[];
  window.sgrtVerObsDetalleV4=function(i){
    var x=(window._sgrtObsDetalleV4||[])[Number(i)];if(!x)return;
    var old=document.getElementById('_sgrt-obs-v4');if(old)old.remove();
    var ov=document.createElement('div');ov.id='_sgrt-obs-v4';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10020;display:flex;align-items:center;justify-content:center;padding:16px;';ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="width:620px;max-width:96vw;background:white;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.25);overflow:hidden;"><div style="padding:13px 16px;background:#1a3a5c;color:white;display:flex;justify-content:space-between;gap:8px;"><div><b>'+esc(x.tercero)+'</b><div style="font-size:10.5px;opacity:.8;margin-top:2px;">'+esc(x.contrato)+'</div></div><button onclick="document.getElementById(\'_sgrt-obs-v4\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">×</button></div><div style="padding:15px 16px;"><div style="font-size:11px;color:#64748b;margin-bottom:5px;">'+esc(x.tip)+'</div><div style="font-size:12px;font-weight:700;color:#1a3a5c;margin-bottom:12px;">'+esc(x.ctrl)+'</div><div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:5px;">Observaciones</div><div style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;font-size:11.5px;line-height:1.5;">'+esc(x.obs||'Sin observaciones registradas.')+'</div></div></div>';
    document.body.appendChild(ov);
  };

  function renderACExact(){
    if(!isRiskAdmin())return;
    ['sgrt-ac-supervision-contract','sgrt-ac-supervision-v2'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
    var card=document.getElementById('rpt-tabla-wrap');if(!card)return;card.style.display='';
    var third=norm(window._sgrtACMatrixThird||window._rptFiltroNit||''),contract=norm(window._sgrtACMatrixContract||window._rptFiltroContrato||'');
    if(third&&!db()[third]){third='';contract='';}
    var thirds=Object.values(db()).filter(function(t){return t&&norm(t.nit||t.NIT)&&(t.contratos||[]).length;}).sort(function(a,b){return norm(a.nombre).localeCompare(norm(b.nombre),'es');});
    ensureACFilters(card,third,contract,thirds);

    var thead=card.querySelector('thead');
    if(thead)thead.innerHTML='<tr style="background:var(--navy);color:white;position:sticky;top:0;z-index:1;">'
      +'<th style="padding:9px 10px;text-align:left;min-width:110px;">Tercero</th>'
      +'<th style="padding:9px 10px;text-align:left;min-width:120px;">Contrato</th>'
      +'<th style="padding:9px 10px;text-align:left;min-width:80px;">Tipología</th>'
      +'<th style="padding:9px 10px;text-align:left;min-width:180px;"># Control</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">1.¿Impl?</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">2.¿Doc?</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">3.¿Asig?</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">4.¿Divul?</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">5.¿Evid?</th>'
      +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">6.¿Mon?</th>'
      +'<th style="padding:7px 9px;text-align:center;min-width:70px;background:rgba(255,193,7,.25);">Nivel Cumpl.</th>'
      +'<th style="padding:7px 9px;text-align:center;min-width:90px;background:rgba(255,193,7,.25);">Nivel Madurez</th>'
      +'<th style="padding:7px 9px;text-align:center;min-width:60px;background:rgba(255,193,7,.25);">Val. Mad.</th>'
      +'<th style="padding:9px 10px;text-align:left;min-width:110px;">Observaciones</th></tr>';

    var rows=[];
    thirds.forEach(function(t){
      var nit=norm(t.nit||t.NIT);if(third&&nit!==third)return;
      (t.contratos||[]).forEach(function(c){
        var num=contractNum(c);if(!num||contract&&num!==contract)return;
        var dims=dimsFor(t,num),resp=responseFor(t,nit,num);
        dims.forEach(function(d){
          var key=norm(d.key||d.clave||d.tipologia),ctrls=activeCtrls(nit,num,key);
          ctrls.forEach(function(q,qi){rows.push({t:t,nit:nit,c:c,num:num,d:d,q:q,qi:qi,r:(resp[key]&&resp[key][q.n])||{}});});
        });
      });
    });
    function answerCell(v){
      if(!v)return '<td style="padding:5px 8px;text-align:center;"><span style="color:#ccc;font-size:11px;">—</span></td>';
      var col=v==='Si'?'#16A34A':v==='No'?'#DC2626':v==='No Aplica'?'#9CA3AF':v==='Parcial'?'#D97706':'#64748b';
      var bg=v==='Si'?'#F0FDF4':v==='No'?'#FEF2F2':v==='Parcial'?'#FFF7ED':'#F9FAFB';
      var s=v==='Si'?'✓ Sí':v==='No'?'✗ No':v==='No Aplica'?'N/A':v;
      return '<td style="padding:5px 8px;text-align:center;"><span style="padding:2px 6px;border-radius:5px;background:'+bg+';color:'+col+';font-weight:700;font-size:10px;white-space:nowrap;">'+esc(s)+'</span></td>';
    }
    window._sgrtObsDetalleV4=[];
    var tbody=card.querySelector('tbody');if(!tbody)return;
    tbody.innerHTML=rows.length?rows.map(function(x,i){
      var v=calcVal(x.r),pc=v.pct>=80?'#16A34A':v.pct>=60?'#CA8A04':v.pct>=40?'#EA580C':v.pct>0?'#DC2626':'#9CA3AF',pb=v.pct>=80?'#F0FDF4':v.pct>=60?'#FEFCE8':v.pct>=40?'#FFF7ED':v.pct>0?'#FEF2F2':'#F9FAFB';
      var tip=tipName(x.d),obs=norm(x.r.obs),ss=supervisorsFor(x.t,x.c),sup=ss.map(function(s){return s.nombre;}).join(', ');
      var oi=window._sgrtObsDetalleV4.push({tercero:x.t.nombre||x.nit,contrato:'Contrato '+x.num+(sup?' — '+sup:''),tip:tip,ctrl:'#'+x.q.n+' '+norm(x.q.ctrl||x.q.req||x.q.texto||('Control '+x.q.n)),obs:obs})-1;
      return '<tr style="background:'+(i%2?'#FAFAFA':'white')+';border-bottom:1px solid #F3F4F6;">'
        +'<td style="padding:6px 10px;font-weight:600;font-size:11px;vertical-align:top;">'+esc(x.t.nombre||x.nit)+'</td>'
        +'<td style="padding:6px 8px;font-size:11px;vertical-align:top;"><span style="display:inline-block;padding:3px 8px;border-radius:6px;font-weight:700;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;white-space:nowrap;">'+esc(x.num)+'</span>'+(sup?'<div style="font-size:9.5px;color:#6d28d9;margin-top:4px;max-width:180px;">👤 '+esc(sup)+'</div>':'')+'</td>'
        +'<td style="padding:6px 8px;font-size:10.5px;color:var(--muted);vertical-align:top;max-width:140px;">'+(x.qi===0?'<span style="padding:2px 6px;background:#E8F0F8;color:var(--navy);border-radius:8px;font-weight:700;font-size:10px;display:inline-block;">'+esc(tip).toUpperCase()+'</span>':'')+'</td>'
        +'<td style="padding:6px 10px;max-width:200px;vertical-align:top;"><div style="display:flex;align-items:flex-start;gap:5px;"><span style="flex-shrink:0;font-size:9.5px;font-weight:700;background:var(--blue);color:white;padding:2px 6px;border-radius:8px;margin-top:1px;">#'+esc(x.q.n)+'</span><span style="font-size:11px;line-height:1.4;">'+esc(x.q.ctrl||x.q.req||x.q.texto||('Control '+x.q.n))+'</span></div></td>'
        +answerCell(x.r.a1)+answerCell(x.r.a2)+answerCell(x.r.a3)+answerCell(x.r.a4)+answerCell(x.r.a5)+answerCell(x.r.a6)
        +'<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);"><span style="padding:3px 7px;border-radius:10px;background:'+pb+';color:'+pc+';font-family:Montserrat,sans-serif;font-size:11.5px;font-weight:800;white-space:nowrap;">'+esc(v.nivelCumpl)+'</span><div style="height:3px;background:#E5E7EB;border-radius:2px;margin-top:3px;overflow:hidden;"><div style="height:100%;width:'+Math.max(0,Math.min(100,v.pct||0))+'%;background:'+pc+';border-radius:2px;"></div></div></td>'
        +'<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);"><span style="padding:3px 7px;border-radius:10px;background:'+v.bgColor+';color:'+v.color+';font-size:10px;font-weight:700;white-space:nowrap;border:1px solid '+v.color+'44;">'+esc(v.madurez)+'</span></td>'
        +'<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);">'+(v.valorMad>0?'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:'+v.color+';">'+v.valorMad+'.0</span>':'<span style="color:#9CA3AF;">—</span>')+'</td>'
        +'<td style="padding:5px 8px;font-size:10.5px;color:var(--muted);max-width:150px;">'+(obs?'<div style="font-style:italic;margin-bottom:3px;">'+esc(obs.length>40?obs.substring(0,40)+'…':obs)+'</div>':'')+'<button onclick="window.sgrtVerObsDetalleV4('+oi+')" style="padding:2px 8px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:5px;font-size:9.5px;font-weight:700;cursor:pointer;font-family:inherit;">Ver detalle</button></td>'
        +'</tr>';
    }).join(''):'<tr><td colspan="14" style="text-align:center;padding:24px;color:var(--muted);">No hay preguntas activas para el tercero/contrato seleccionado.</td></tr>';
  }

  function finalizeUI(){
    try{patchEvaluatorList();}catch(e){console.warn('[SGRT33] Evaluador:',e);}
    try{patchRegistryValues();}catch(e2){console.warn('[SGRT33] Valores:',e2);}
    try{patchApprovedContractsValues();}catch(e3){}
    try{renderACExact();}catch(e4){console.warn('[SGRT33] Matriz AC:',e4);}
  }

  var prevCls=window.clsRender;
  if(typeof prevCls==='function')window.clsRender=function(){var r=prevCls.apply(this,arguments);setTimeout(finalizeUI,100);setTimeout(finalizeUI,220);return r;};

  var prevToggle=window.clsToggleExpandir;
  if(typeof prevToggle==='function')window.clsToggleExpandir=function(){var r=prevToggle.apply(this,arguments);setTimeout(patchRegistryValues,30);setTimeout(function(){try{patchEvaluatorList();}catch(e){}},60);return r;};
  document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('[data-sgrt-contract-toggle]'))setTimeout(patchRegistryValues,40);});

  var prevReports=window.renderReportesAC;
  if(typeof prevReports==='function')window.renderReportesAC=function(){var r=prevReports.apply(this,arguments);setTimeout(finalizeUI,120);setTimeout(finalizeUI,240);return r;};

  var prevServer=window.sgrtCargarDesdeServidor;
  if(typeof prevServer==='function')window.sgrtCargarDesdeServidor=async function(){var r=await prevServer.apply(this,arguments);setTimeout(finalizeUI,150);return r;};

  document.addEventListener('DOMContentLoaded',function(){setTimeout(finalizeUI,250);setTimeout(finalizeUI,900);});
  if(document.readyState!=='loading'){setTimeout(finalizeUI,180);setTimeout(finalizeUI,700);}
})();
