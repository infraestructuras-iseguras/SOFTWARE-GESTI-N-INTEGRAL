/*
 * SGRT — Ajustes finales: limpieza del registro demo histórico,
 * tablero ejecutivo / Power BI y asistente contextual guiado.
 * Módulo aditivo: no modifica formularios ni reglas de negocio existentes.
 */
(function(){
  'use strict';

  var DEMO_NIT='830016840';
  var DEMO_NAME='ibm colombia';
  var DEMO_CONTRACT='ct-2024-ibm';
  var esc=function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');};
  var norm=function(v){var s=String(v==null?'':v).toLowerCase();try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.trim();};
  var arr=function(v){return Array.isArray(v)?v:[];};
  var obj=function(v){return v&&typeof v==='object'&&!Array.isArray(v);};
  var num=function(v){var n=parseFloat(v);return isNaN(n)?0:n;};

  // ─────────────────────────────────────────────────────────────
  // 1) LIMPIEZA DEFINITIVA DEL REGISTRO DEMO HISTÓRICO
  // ─────────────────────────────────────────────────────────────
  function isLegacyDemo(o){
    if(!o||typeof o!=='object')return false;
    var nit=String(o.nit||o.NIT||o.terceroNit||o.tercero_nit||o.nitTercero||'').replace(/\D/g,'');
    if(nit===DEMO_NIT)return true;
    var nm=norm(o.nombre||o.Nombre||o.NombreTercero||o.Nombre_Tercero||o.tercero||o.terceroNombre||o.nombreTercero||'');
    if(nm===DEMO_NAME)return true;
    var ct=norm(o.contrato||o.numeroContrato||o.numContrato||o.num||o.numero||'');
    if(ct.indexOf(DEMO_CONTRACT)===0)return true;
    return false;
  }
  function scrub(v){
    if(Array.isArray(v)){
      return v.filter(function(x){return !isLegacyDemo(x);}).map(scrub);
    }
    if(!obj(v))return v;
    if(isLegacyDemo(v))return undefined;
    var out={};
    Object.keys(v).forEach(function(k){
      if(String(k).replace(/\D/g,'')===DEMO_NIT)return;
      var sv=scrub(v[k]);
      if(typeof sv!=='undefined')out[k]=sv;
    });
    return out;
  }
  function scrubStorageKey(k){
    try{
      var raw=localStorage.getItem(k);if(!raw)return;
      var parsed=JSON.parse(raw),clean=scrub(parsed);
      localStorage.setItem(k,JSON.stringify(typeof clean==='undefined'?(Array.isArray(parsed)?[]:{}):clean));
    }catch(e){}
  }
  function cleanGlobals(){
    try{
      if(window.DATOS_DEMO_PRESENTACION&&window.DATOS_DEMO_PRESENTACION[DEMO_NIT])delete window.DATOS_DEMO_PRESENTACION[DEMO_NIT];
    }catch(e0){}
    try{
      var db=window.TERCEROS_DB||{};
      Object.keys(db).forEach(function(k){if(String(k).replace(/\D/g,'')===DEMO_NIT||isLegacyDemo(db[k]))delete db[k];});
      window.TERCEROS_DB=db;
    }catch(e1){}
    try{
      if(Array.isArray(window.MATRIZ_DB)){
        for(var i=window.MATRIZ_DB.length-1;i>=0;i--)if(isLegacyDemo(window.MATRIZ_DB[i]))window.MATRIZ_DB.splice(i,1);
      }
    }catch(e2){}
    try{
      if(window.CUEST_RESPUESTAS){
        Object.keys(window.CUEST_RESPUESTAS).forEach(function(k){if(String(k).replace(/\D/g,'')===DEMO_NIT||isLegacyDemo(window.CUEST_RESPUESTAS[k]))delete window.CUEST_RESPUESTAS[k];});
      }
    }catch(e3){}
    try{
      if(Array.isArray(window.tercerosPendientesCuestionario)){
        window.tercerosPendientesCuestionario=window.tercerosPendientesCuestionario.filter(function(x){return !isLegacyDemo(x);});
      }
    }catch(e4){}
  }
  function cleanLegacyDemo(){
    cleanGlobals();
    [
      'sgrt_v8','sgrt_terceros_db_shared','sgrt_terceros_db','sgrt_terceros','sgrt_terceros_demo',
      'sgrt_terceros_aprobados','sgrt_terceros_pending','sgrt_cuest_respuestas','sgrt_reportes_fases',
      'sgrt_reportes_fases_auto','sgrt_resumen_reportes','sgrt_cls_db','sgrt_cls_db_auto','od_sgrt_v8','rpt_fs_v2','sgrt_notificaciones_sistema','sgrt_sys_logs','sgrt_cli_logs'
    ].forEach(scrubStorageKey);
    cleanGlobals();
    try{localStorage.setItem('sgrt_legacy_demo_removed','1');}catch(e){}
  }
  window.sgrtEliminarDemoHistorico=cleanLegacyDemo;

  function wrapAsyncClean(name){
    var old=window[name];if(typeof old!=='function'||old._sgrt26Clean)return;
    var wrapped=function(){
      cleanLegacyDemo();
      var r=old.apply(this,arguments);
      if(r&&typeof r.then==='function')return r.then(function(x){cleanLegacyDemo();return x;},function(e){cleanLegacyDemo();throw e;});
      cleanLegacyDemo();return r;
    };
    wrapped._sgrt26Clean=true;window[name]=wrapped;
  }
  function wrapClean(name){
    var old=window[name];if(typeof old!=='function'||old._sgrt26Clean)return;
    var wrapped=function(){cleanLegacyDemo();var r=old.apply(this,arguments);cleanLegacyDemo();return r;};
    wrapped._sgrt26Clean=true;window[name]=wrapped;
  }

  // ─────────────────────────────────────────────────────────────
  // 2) DATOS DEL TABLERO
  // ─────────────────────────────────────────────────────────────
  function currentRole(){
    var u=window.currentUser||{},r=norm(u.rol||u.role||'');
    if(r==='operativo'||r==='admin_riesgos'||r.indexOf('administrador de riesgos')>=0)return 'Administrador de Riesgos';
    if(r==='cliente'||r==='evaluador')return 'Evaluador';
    if(r==='is'||r==='iseguras'||r.indexOf('super')>=0)return 'Superadministrador';
    return u.name||'Usuario';
  }
  function getSnapshot(){
    cleanLegacyDemo();
    var s=null;
    try{s=window._sgrtCierreSnapshot?window._sgrtCierreSnapshot():null;}catch(e){}
    if(!s){
      var ts=Object.values(window.TERCEROS_DB||{}).filter(function(t){return t&&t.nit&&!isLegacyDemo(t);});
      var mx=arr(window.MATRIZ_DB).filter(function(r){return !isLegacyDemo(r);});
      var rs=window.CUEST_RESPUESTAS||{};
      s={terceros:ts,matriz:mx,respuestas:rs,riskRows:mx.map(function(r){var t=ts.find(function(x){return String(x.nit||'')===String(r.nit||r.terceroNit||'')||norm(x.nombre)===norm(r.tercero);});return{r:r,t:t||null,inherente:r.zonaInh||r.inherente||'',residual:r.zonaRes||r.residual||''};}),documentos:{total:0,byNit:{}},total:ts.length,acTotal:0};
    }
    s=scrub(s)||{};
    s.terceros=arr(s.terceros).filter(function(t){return !isLegacyDemo(t);});
    s.riskRows=arr(s.riskRows).filter(function(x){return !isLegacyDemo(x.r||x)&&!(x.t&&isLegacyDemo(x.t));});
    s.matriz=arr(s.matriz).filter(function(r){return !isLegacyDemo(r);});
    s.respuestas=s.respuestas||{};s.documentos=s.documentos||{total:0,byNit:{}};
    return s;
  }
  function allDims(t){
    var out=[],seen={};
    function add(d){if(!d)return;var name=d.nombre||d.nombre_tipologia||d.tipologia||d.key||d.clave||String(d);var k=norm(name);if(!k||seen[k])return;seen[k]=1;out.push({nombre:name,val:d.val||d.nivel||d.calificacion||''});}
    arr(t&&t.dims).forEach(add);
    var pc=t&&t.dimsPorContrato||{};Object.keys(pc).forEach(function(k){arr(pc[k]).forEach(add);});
    return out;
  }
  function approvedContracts(t){return arr(t&&t.contratos).filter(function(c){return c&&((String(c.estado_aprobacion||'').toUpperCase()==='APROBADO')||c.aprobado===true||(t.aprobadoPorContrato&&t.aprobadoPorContrato[c.num||c.numero]));});}
  function riskLevel(v){
    var z=String(v||'').toUpperCase();
    if(z.indexOf('EXTREMO')>=0||z.indexOf('CRIT')>=0)return 'EXTREMO';
    if(z.indexOf('ALTO')>=0)return 'ALTO';
    if(z.indexOf('MODERADO')>=0||z.indexOf('MEDIO')>=0)return 'MODERADO';
    if(z.indexOf('BAJO')>=0)return 'BAJO';
    return 'NO DEFINIDO';
  }
  function severity(v){return{BAJO:1,MODERADO:2,MEDIO:2,ALTO:3,EXTREMO:4,'NO DEFINIDO':0}[riskLevel(v)]||0;}
  function responseCount(r){
    if(!r||typeof r!=='object')return 0;var n=0;
    (function walk(v){if(Array.isArray(v)){v.forEach(walk);return;}if(!v||typeof v!=='object')return;Object.keys(v).forEach(function(k){var x=v[k];if(x&&typeof x==='object')walk(x);else if(x!==''&&x!=null)n++;});})(r);
    return n;
  }
  function riskThird(x,s){
    if(x&&x.t)return x.t;var r=x&&x.r||x||{};return arr(s.terceros).find(function(t){return String(t.nit||'')===String(r.nit||r.terceroNit||'')||norm(t.nombre)===norm(r.tercero||r.nombreTercero);})||null;
  }
  function detailRows(s){
    return arr(s.riskRows).map(function(x,i){
      var r=x.r||x,t=riskThird(x,s)||{};
      return{
        Ref:r.id||r.ref||('R'+(i+1)),NIT:t.nit||r.nit||'',Tercero:t.nombre||r.tercero||'',
        Contrato:r.contrato||r.numeroContrato||r.numContrato||r.contratoNumero||'',
        Tipologia:(window.getNombreTipologia?window.getNombreTipologia(r.tipologia||r.tipo||''):(r.tipologia||r.tipo||'')),
        Riesgo:r.desc||r.descripcion||r.riesgo||r.factor||r.factorRiesgo||'',
        Probabilidad_Inherente:r.probInh||r.probabilidadInherente||'',Impacto_Inherente:r.impInh||r.impactoInherente||'',
        Zona_Inherente:riskLevel(x.inherente||r.zonaInh||r.inherente),Control:r.control||r.controles||'',
        Probabilidad_Residual:r.probRes||r.probabilidadResidual||'',Impacto_Residual:r.impRes||r.impactoResidual||'',
        Zona_Residual:riskLevel(x.residual||r.zonaRes||r.residual),Tratamiento:r.tratamiento||r.accion||r.plan||'Por definir',
        Responsable:r.resp||r.responsable||'',Estado:r.estado||r.estadoPlan||'Pendiente',Fecha_Seguimiento:r.fechaSeg||r.fechaSeguimiento||''
      };
    });
  }
  function thirdRows(s){
    return arr(s.terceros).map(function(t){
      var resp=s.respuestas&&s.respuestas[t.nit]||{},risks=detailRows(s).filter(function(r){return String(r.NIT)===String(t.nit);});
      return{NIT:t.nit||'',Tercero:t.nombre||'',Estado:t.estado||'',Contratos:arr(t.contratos).length,Contratos_Aprobados:approvedContracts(t).length,Tipologias:allDims(t).length,Puntaje:num(t.prom||0),Clasificacion:t.clasificacion||t.zona||t.nivel_riesgo||'',Respuestas_Ambiente_Control:responseCount(resp),Riesgos:risks.length,Riesgos_Extremos_Altos:risks.filter(function(r){return['EXTREMO','ALTO'].indexOf(r.Zona_Inherente)>=0;}).length};
    });
  }
  function acRows(s){
    return arr(s.terceros).map(function(t){var r=s.respuestas&&s.respuestas[t.nit]||{};return{NIT:t.nit||'',Tercero:t.nombre||'',Tipologias:allDims(t).length,Contratos_Aprobados:approvedContracts(t).length,Respuestas:responseCount(r),Estado:responseCount(r)>0?'En progreso / diligenciado':'Pendiente'};});
  }
  function summary(s){
    var trs=thirdRows(s),rr=detailRows(s),classified=trs.filter(function(x){return x.Tipologias>0||x.Puntaje>0;}).length,approved=trs.filter(function(x){return x.Contratos_Aprobados>0;}).length,withAC=trs.filter(function(x){return x.Respuestas_Ambiente_Control>0;}).length,withRisk=trs.filter(function(x){return x.Riesgos>0;}).length;
    var inh={EXTREMO:0,ALTO:0,MODERADO:0,BAJO:0,'NO DEFINIDO':0},res={EXTREMO:0,ALTO:0,MODERADO:0,BAJO:0,'NO DEFINIDO':0},improved=0;
    rr.forEach(function(r){inh[r.Zona_Inherente]=(inh[r.Zona_Inherente]||0)+1;res[r.Zona_Residual]=(res[r.Zona_Residual]||0)+1;if(severity(r.Zona_Residual)>0&&severity(r.Zona_Residual)<severity(r.Zona_Inherente))improved++;});
    var plans={PENDIENTE:0,'EN PROGRESO':0,COMPLETADO:0,OTRO:0};rr.forEach(function(r){var st=norm(r.Estado);if(st.indexOf('progreso')>=0)plans['EN PROGRESO']++;else if(st.indexOf('complet')>=0||st.indexOf('cerr')>=0)plans.COMPLETADO++;else if(!st||st.indexOf('pend')>=0)plans.PENDIENTE++;else plans.OTRO++;});
    var contracts=arr(s.terceros).reduce(function(n,t){return n+arr(t.contratos).length;},0),approvedC=arr(s.terceros).reduce(function(n,t){return n+approvedContracts(t).length;},0),tips=arr(s.terceros).reduce(function(n,t){return n+allDims(t).length;},0);
    return{thirds:trs,risks:rr,total:trs.length,contracts:contracts,approvedContracts:approvedC,typologies:tips,classified:classified,approved:approved,withAC:withAC,withRisk:withRisk,inh:inh,res:res,improved:improved,plans:plans,docs:(s.documentos&&s.documentos.total)||0};
  }

  // ─────────────────────────────────────────────────────────────
  // 3) EXPORTACIONES Y POWER BI
  // ─────────────────────────────────────────────────────────────
  function download(name,content,type){var b=new Blob([content],{type:type||'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){try{document.body.removeChild(a);URL.revokeObjectURL(a.href);}catch(e){}},500);}
  function csvCell(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}
  function toCSV(rows){var h=Object.keys(rows[0]||{});return '\ufeff'+h.map(csvCell).join(';')+'\n'+rows.map(function(r){return h.map(function(k){return csvCell(r[k]);}).join(';');}).join('\n');}
  function exportHTMLTable(title,rows){var h=Object.keys(rows[0]||{});return '<h2>'+esc(title)+'</h2><table><thead><tr>'+h.map(function(k){return'<th>'+esc(k)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return'<tr>'+h.map(function(k){return'<td>'+esc(r[k])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}
  function exportExcel(s,m){
    var css='body{font-family:Calibri,Arial;margin:24px;color:#243447}h1,h2{color:#173b5f}table{border-collapse:collapse;width:100%;margin:12px 0 28px;font-size:11px}th{background:#173b5f;color:#fff;padding:7px;text-align:left}td{border:1px solid #ccd6e0;padding:6px}';
    return '<html><head><meta charset="utf-8"><style>'+css+'</style></head><body><h1>SGRT · Dataset consolidado</h1><p>Generado '+new Date().toLocaleString('es-CO')+'.</p>'+exportHTMLTable('Terceros',m.thirds)+exportHTMLTable('Ambiente de Control',acRows(s))+exportHTMLTable('Riesgos',m.risks)+'</body></html>';
  }
  function printable(s,m){
    var css='body{font-family:Arial,Calibri;margin:28px;color:#263238}h1{color:#173b5f;border-bottom:3px solid #2b6fae;padding-bottom:8px}h2{color:#2b6fae}table{width:100%;border-collapse:collapse;font-size:10px;margin:12px 0 22px}th{background:#173b5f;color:white;padding:7px;text-align:left}td{border:1px solid #d6dee6;padding:6px}.k{display:inline-block;padding:12px;margin:4px;background:#f3f7fb;border:1px solid #cbd9e6;border-radius:6px;min-width:120px}.n{font-size:22px;font-weight:800;color:#173b5f}@media print{button{display:none}}';
    return '<!doctype html><html><head><meta charset="utf-8"><title>Reporte SGRT</title><style>'+css+'</style></head><body><button onclick="window.print()">Imprimir / Guardar PDF</button><h1>Reporte ejecutivo de Riesgos de Terceros</h1><p>Organización actual · '+new Date().toLocaleString('es-CO')+'</p><div class="k"><div class="n">'+m.total+'</div>Terceros</div><div class="k"><div class="n">'+m.contracts+'</div>Contratos</div><div class="k"><div class="n">'+m.approvedContracts+'</div>Contratos aprobados</div><div class="k"><div class="n">'+m.risks.length+'</div>Riesgos</div><div class="k"><div class="n">'+m.docs+'</div>Evidencias</div>'+exportHTMLTable('Resumen por tercero',m.thirds)+exportHTMLTable('Matriz de riesgos',m.risks)+'</body></html>';
  }
  window.sgrtExportarReporte=function(kind){
    cleanLegacyDemo();var s=getSnapshot(),m=summary(s),d=new Date().toISOString().slice(0,10),k=String(kind||'').toLowerCase();
    if(k==='terceros')download('SGRT_Terceros_'+d+'.csv',toCSV(m.thirds),'text/csv;charset=utf-8');
    else if(k==='ac')download('SGRT_Ambiente_Control_'+d+'.csv',toCSV(acRows(s)),'text/csv;charset=utf-8');
    else if(k==='riesgos'||k==='csv'||k==='powerbi')download('SGRT_Dataset_PowerBI_'+d+'.csv',toCSV(m.risks.length?m.risks:m.thirds),'text/csv;charset=utf-8');
    else if(k==='json')download('SGRT_Dataset_Completo_'+d+'.json',JSON.stringify({generado:new Date().toISOString(),terceros:m.thirds,ambiente_control:acRows(s),riesgos:m.risks},null,2),'application/json;charset=utf-8');
    else if(k==='excel'||k==='xls')download('SGRT_Dataset_Completo_'+d+'.xls',exportExcel(s,m),'application/vnd.ms-excel;charset=utf-8');
    else if(k==='html')download('SGRT_Reporte_Ejecutivo_'+d+'.html',printable(s,m),'text/html;charset=utf-8');
    else if(k==='pdf'){
      var w=window.open('','_blank');if(w){w.document.open();w.document.write(printable(s,m));w.document.close();setTimeout(function(){try{w.focus();w.print();}catch(e){}},450);}else try{showToast('Habilita ventanas emergentes para imprimir/guardar PDF','warning',3000);}catch(e){}
    }
    try{if(k!=='pdf')showToast('✅ Archivo generado con los datos actuales','success',2200);}catch(e2){}
  };
  // Compatibilidad con los botones antiguos.
  window.descargarDatosPowerBIAdmin=function(kind){return window.sgrtExportarReporte(kind==='html'?'html':kind==='json'?'json':'powerbi');};

  window.sgrtConfigurarPowerBI=function(){
    var old='';try{old=localStorage.getItem('sgrt_powerbi_embed_url')||'';}catch(e){}
    var url=prompt('Pega el enlace seguro/publicado de Power BI. Déjalo vacío para quitar la conexión:',old);
    if(url===null)return;
    url=String(url||'').trim();
    if(url&&url.indexOf('https://')!==0){try{showToast('El enlace debe comenzar por https://','warning',2600);}catch(e2){}return;}
    try{if(url)localStorage.setItem('sgrt_powerbi_embed_url',url);else localStorage.removeItem('sgrt_powerbi_embed_url');}catch(e3){}
    renderEnhancedReports();
  };

  function selectedFilters(){
    return{third:(document.getElementById('sgrt-rpt-third')||{}).value||'',contract:(document.getElementById('sgrt-rpt-contract')||{}).value||'',type:(document.getElementById('sgrt-rpt-type')||{}).value||'',state:(document.getElementById('sgrt-rpt-state')||{}).value||''};
  }
  function filterRows(rows,f){return rows.filter(function(r){return(!f.third||String(r.NIT)===f.third)&&(!f.contract||String(r.Contrato)===f.contract)&&(!f.type||norm(r.Tipologia)===norm(f.type))&&(!f.state||norm(r.Estado)===norm(f.state));});}
  function renderCharts(m,filtered){
    if(!window.Chart)return;window._sgrt26Charts=window._sgrt26Charts||{};Object.keys(window._sgrt26Charts).forEach(function(k){try{window._sgrt26Charts[k].destroy();}catch(e){}});window._sgrt26Charts={};
    var rows=filtered||m.risks,inh={EXTREMO:0,ALTO:0,MODERADO:0,BAJO:0,'NO DEFINIDO':0},res={EXTREMO:0,ALTO:0,MODERADO:0,BAJO:0,'NO DEFINIDO':0},tips={},states={Pendiente:0,'En progreso':0,Completado:0,Otro:0};
    rows.forEach(function(r){inh[r.Zona_Inherente]=(inh[r.Zona_Inherente]||0)+1;res[r.Zona_Residual]=(res[r.Zona_Residual]||0)+1;var tk=r.Tipologia||'Sin tipología';tips[tk]=(tips[tk]||0)+1;var st=norm(r.Estado);if(st.indexOf('progreso')>=0)states['En progreso']++;else if(st.indexOf('complet')>=0||st.indexOf('cerr')>=0)states.Completado++;else if(!st||st.indexOf('pend')>=0)states.Pendiente++;else states.Otro++;});
    var opts={responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}};
    function make(id,type,data,options){var c=document.getElementById(id);if(!c)return;try{window._sgrt26Charts[id]=new Chart(c.getContext('2d'),{type:type,data:data,options:options||opts});}catch(e){console.warn('SGRT chart',id,e);}}
    make('sgrt-rpt-chart-inh','doughnut',{labels:['Extremo','Alto','Moderado','Bajo'],datasets:[{data:[inh.EXTREMO,inh.ALTO,inh.MODERADO,inh.BAJO],backgroundColor:['#dc3545','#fd7e14','#fbbf24','#22c55e'],borderWidth:1}]});
    make('sgrt-rpt-chart-res','bar',{labels:['Extremo','Alto','Moderado','Bajo'],datasets:[{label:'Riesgo residual',data:[res.EXTREMO,res.ALTO,res.MODERADO,res.BAJO],backgroundColor:['#dc3545','#fd7e14','#fbbf24','#22c55e']}]},{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});
    var tk=Object.keys(tips).sort(function(a,b){return tips[b]-tips[a];}).slice(0,8);make('sgrt-rpt-chart-tip','bar',{labels:tk,datasets:[{label:'Riesgos',data:tk.map(function(k){return tips[k];}),backgroundColor:'#2b6fae'}]},{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{precision:0}}}});
    make('sgrt-rpt-chart-flow','bar',{labels:['Registrados','Clasificados','Aprobados','Con A. Control','Con Riesgos'],datasets:[{label:'Terceros',data:[m.total,m.classified,m.approved,m.withAC,m.withRisk],backgroundColor:['#78909c','#2b6fae','#22a447','#7c3aed','#dc3545']}]},{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});
  }
  function renderRiskTable(rows){
    if(!rows.length)return '<div style="padding:24px;text-align:center;color:#718096;">No hay riesgos para los filtros seleccionados.</div>';
    return '<div style="overflow:auto;max-height:420px;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#173b5f;color:#fff;position:sticky;top:0;z-index:1;"><th style="padding:8px;">Ref.</th><th style="padding:8px;">Tercero</th><th style="padding:8px;">Contrato</th><th style="padding:8px;">Tipología</th><th style="padding:8px;">Riesgo</th><th style="padding:8px;">Inherente</th><th style="padding:8px;">Residual</th><th style="padding:8px;">Tratamiento</th><th style="padding:8px;">Estado</th></tr></thead><tbody>'+rows.map(function(r,i){return'<tr style="border-bottom:1px solid #e5ebf1;background:'+(i%2?'#f8fafc':'#fff')+'"><td style="padding:8px;font-weight:800;">'+esc(r.Ref)+'</td><td style="padding:8px;"><b>'+esc(r.Tercero)+'</b><div style="font-size:9.5px;color:#8795a1;">'+esc(r.NIT)+'</div></td><td style="padding:8px;">'+esc(r.Contrato||'—')+'</td><td style="padding:8px;">'+esc(r.Tipologia||'—')+'</td><td style="padding:8px;min-width:220px;">'+esc(r.Riesgo||'—')+'</td><td style="padding:8px;font-weight:700;">'+esc(r.Zona_Inherente)+'</td><td style="padding:8px;font-weight:700;">'+esc(r.Zona_Residual)+'</td><td style="padding:8px;">'+esc(r.Tratamiento)+'</td><td style="padding:8px;">'+esc(r.Estado)+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  function renderEnhancedReports(){
    cleanLegacyDemo();var wrap=document.getElementById('rpe-wrap-op');if(!wrap)return;
    var s=getSnapshot(),m=summary(s),f=selectedFilters(),rows=filterRows(m.risks,f),thirds=m.thirds;
    var contracts={},types={},states={};m.risks.forEach(function(r){if(r.Contrato)contracts[r.Contrato]=1;if(r.Tipologia)types[r.Tipologia]=1;if(r.Estado)states[r.Estado]=1;});
    function opts(map,selected,blank){return'<option value="">'+blank+'</option>'+Object.keys(map).sort().map(function(k){return'<option value="'+esc(k)+'" '+(String(selected)===String(k)?'selected':'')+'>'+esc(k)+'</option>';}).join('');}
    var thirdOpts='<option value="">— Todos los terceros —</option>'+thirds.map(function(t){return'<option value="'+esc(t.NIT)+'" '+(String(f.third)===String(t.NIT)?'selected':'')+'>'+esc(t.Tercero)+'</option>';}).join('');
    var high=m.inh.EXTREMO+m.inh.ALTO,improve=m.risks.length?Math.round(m.improved/m.risks.length*100):0;
    var embed='';try{embed=localStorage.getItem('sgrt_powerbi_embed_url')||'';}catch(e){}
    var html=''
      +'<div id="sgrt-powerbi-pro" style="display:flex;flex-direction:column;gap:14px;">'
      +'<div class="card" style="border-left:4px solid #2b6fae;overflow:hidden;">'
      +'<div style="padding:15px 17px;background:linear-gradient(90deg,#173b5f,#2b6fae);color:white;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">'
      +'<div><div style="font-size:16px;font-weight:900;">📊 Tablero ejecutivo · Riesgos de Terceros</div><div style="font-size:11px;opacity:.8;margin-top:3px;">Vista dinámica de la organización actual · datos del flujo SGRT</div></div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;"><button class="btn btn-sm" style="background:white;color:#173b5f;" onclick="window.sgrtExportarReporte(\'powerbi\')">⬇ Power BI CSV</button><button class="btn btn-sm" style="background:white;color:#173b5f;" onclick="window.sgrtExportarReporte(\'excel\')">⬇ Excel</button><button class="btn btn-sm" style="background:white;color:#173b5f;" onclick="window.sgrtExportarReporte(\'json\')">⬇ JSON</button><button class="btn btn-sm" style="background:white;color:#173b5f;" onclick="window.sgrtExportarReporte(\'pdf\')">🖨 PDF</button></div></div>'
      +'<div style="padding:14px 16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;">'
      +[['Terceros',m.total,'#173b5f'],['Contratos',m.contracts,'#2b6fae'],['Aprobados',m.approvedContracts,'#22a447'],['Tipologías',m.typologies,'#7c3aed'],['Riesgos',m.risks.length,'#dc3545'],['Extremo / Alto',high,'#c2410c'],['Mejora residual',improve+'%','#15803d'],['Evidencias',m.docs,'#475569']].map(function(k){return'<div style="background:#fff;border:1px solid #dce5ed;border-radius:8px;padding:12px;box-shadow:0 2px 8px rgba(15,45,70,.05);"><div style="font-size:10px;text-transform:uppercase;font-weight:800;color:#64748b;">'+k[0]+'</div><div style="font-size:25px;font-weight:900;color:'+k[2]+';margin-top:4px;">'+k[1]+'</div></div>';}).join('')
      +'</div></div>'
      +'<div class="card"><div style="padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;"><div><b style="color:#173b5f;">🔎 Filtros interactivos</b><div style="font-size:10.5px;color:#718096;">Los gráficos y la matriz responden a estos filtros.</div></div><button class="btn btn-outline btn-sm" onclick="window.sgrtLimpiarFiltrosReporte()">Limpiar filtros</button></div><div style="padding:12px 14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px;"><select id="sgrt-rpt-third" onchange="window.sgrtRefrescarReporte()" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;">'+thirdOpts+'</select><select id="sgrt-rpt-contract" onchange="window.sgrtRefrescarReporte()" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;">'+opts(contracts,f.contract,'— Todos los contratos —')+'</select><select id="sgrt-rpt-type" onchange="window.sgrtRefrescarReporte()" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;">'+opts(types,f.type,'— Todas las tipologías —')+'</select><select id="sgrt-rpt-state" onchange="window.sgrtRefrescarReporte()" style="padding:8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;">'+opts(states,f.state,'— Todos los estados —')+'</select></div></div>'
      +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:14px;">'
      +[['sgrt-rpt-chart-inh','Riesgo inherente'],['sgrt-rpt-chart-res','Riesgo residual'],['sgrt-rpt-chart-tip','Riesgos por tipología'],['sgrt-rpt-chart-flow','Avance por fases']].map(function(c){return'<div class="card" style="padding:13px;"><div style="font-size:12px;font-weight:800;color:#173b5f;margin-bottom:7px;">'+c[1]+'</div><div style="height:245px;position:relative;"><canvas id="'+c[0]+'"></canvas></div></div>';}).join('')
      +'</div>'
      +'<div class="card"><div style="padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;"><div><b style="color:#173b5f;">📋 Matriz consolidada</b><div style="font-size:10.5px;color:#718096;">'+rows.length+' riesgo(s) con los filtros actuales.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><button class="btn btn-outline btn-sm" onclick="window.sgrtExportarReporte(\'riesgos\')">CSV riesgos</button><button class="btn btn-outline btn-sm" onclick="window.sgrtExportarReporte(\'terceros\')">CSV terceros</button><button class="btn btn-outline btn-sm" onclick="window.sgrtExportarReporte(\'ac\')">CSV A. Control</button><button class="btn btn-outline btn-sm" onclick="window.sgrtExportarReporte(\'html\')">Reporte HTML</button></div></div>'+renderRiskTable(rows)+'</div>'
      +'<div class="card"><div style="padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;"><div><b style="color:#173b5f;">🟨 Power BI</b><div style="font-size:10.5px;color:#718096;">El tablero superior funciona con los datos actuales. También puedes conectar un reporte publicado de Power BI.</div></div><button class="btn btn-outline btn-sm" onclick="window.sgrtConfigurarPowerBI()">'+(embed?'Cambiar conexión':'Conectar Power BI')+'</button></div>'
      +(embed?'<div style="height:520px;background:#f8fafc;"><iframe title="Power BI" src="'+esc(embed)+'" style="width:100%;height:100%;border:0;" allowfullscreen="true"></iframe></div>':'<div style="padding:22px;text-align:center;color:#718096;background:#f8fafc;"><div style="font-size:28px;margin-bottom:6px;">📈</div><b>Tablero local activo</b><div style="font-size:11px;margin-top:4px;">Usa “Conectar Power BI” únicamente si ya tienes un enlace de inserción publicado/seguro.</div></div>')
      +'</div></div>';
    wrap.innerHTML=html;
    setTimeout(function(){renderCharts(m,rows);},40);
  }
  window.sgrtRefrescarReporte=renderEnhancedReports;
  window.sgrtLimpiarFiltrosReporte=function(){['sgrt-rpt-third','sgrt-rpt-contract','sgrt-rpt-type','sgrt-rpt-state'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});renderEnhancedReports();};

  function installReports(){
    // Quitar referencias visibles a una entidad fija en esta página; el contenido sigue
    // respetando el alcance que ya trae el usuario autenticado.
    var pg=document.getElementById('pg-reportes-entidad');if(pg){var h=pg.querySelector('h2');if(h)h.textContent='Reportes y Power BI — Riesgos de Terceros';var sub=h&&h.parentElement?h.parentElement.querySelector('div[style*="font-size:12px"]'):null;if(sub)sub.textContent='Tablero ejecutivo, ambiente de control, riesgos inherentes/residuales y descargas para análisis.';}
    var sel=document.getElementById('rpe-filtro-entidad-op');if(sel){sel.style.display='none';}
    var btn=sel&&sel.parentElement?sel.parentElement.querySelector('button'):null;if(btn){btn.textContent='Actualizar tablero';btn.onclick=renderEnhancedReports;}
    // Reemplazar la función de reportes del operativo por el tablero completo.
    window.renderReportesPorEntidadOp=renderEnhancedReports;
    var oldOpen=window.abrirReportesPowerBIAdmin;if(typeof oldOpen==='function'&&!oldOpen._sgrt26){
      var n=function(el){var r=oldOpen.apply(this,arguments);setTimeout(renderEnhancedReports,100);return r;};n._sgrt26=true;window.abrirReportesPowerBIAdmin=n;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4) ASISTENTE INTELIGENTE Y CONTEXTUAL (sin nombres de entidades)
  // ─────────────────────────────────────────────────────────────
  var pageGuides={
    'pg-terceros':{name:'Registro de Terceros',next:'Clasificación de Terceros',text:'Registra o valida los datos generales del tercero, sus contratos y supervisores. Al guardar, el tercero debe quedar disponible inmediatamente para clasificación.'},
    'pg-clasificacion':{name:'Clasificación de Terceros',next:'Aprobación de Clasificación',text:'Selecciona tercero y contrato, elige hasta cinco tipologías, califícalas y finaliza el contrato. Cada contrato conserva su propia clasificación.'},
    'pg-aprobar-op':{name:'Aprobación de Clasificación',next:'Ambiente de Control',text:'Revisa la clasificación del contrato. Si cumple el criterio de aprobación, usa Aprobar; el estado debe quedar confirmado y el flujo continúa a Ambiente de Control.'},
    'pg-ctrl-op':{name:'Configuración de Ambiente de Control',next:'Evaluación de Ambiente de Control',text:'Configura los controles o preguntas de las tipologías que fueron clasificadas para el contrato. Lo configurado aquí será lo que verá el Evaluador.'},
    'pg-cuestionario':{name:'Evaluación de Ambiente de Control',next:'Análisis de Riesgos',text:'Selecciona el tercero, contrato y tipología aprobados; responde los controles configurados y guarda la evaluación.'},
    'pg-matriz':{name:'Análisis de Riesgos',next:'Seguimiento',text:'Registra los riesgos identificados, probabilidad e impacto inherente, controles, valoración residual, tratamiento y responsables.'},
    'pg-seguimiento':{name:'Seguimiento',next:'Reportes',text:'Actualiza planes de acción, responsables, fechas y estados. Las alertas muestran pendientes, criticidad y próximos vencimientos.'},
    'pg-reportes-entidad':{name:'Reportes y Power BI',next:'Revisión y cierre',text:'Consulta el tablero consolidado, filtra riesgos, compara inherente contra residual y descarga los datasets para Power BI, Excel, CSV o reporte imprimible.'},
    'pg-evidencias-repo':{name:'Documentación y Evidencia',next:'Reportes',text:'Consulta y organiza evidencias asociadas a evaluaciones y riesgos. Verifica que los soportes estén vinculados al tercero y contrato correctos.'},
    'admin-pg-config-bd':{name:'Control de Base de Datos',next:'Verificación del flujo',text:'Verifica conexión, sincroniza y revisa el número de registros. Los registros de la base deben reflejarse en el sistema sin crear datos demo.'}
  };
  function visiblePage(){
    var pages=[].slice.call(document.querySelectorAll('.page'));for(var i=0;i<pages.length;i++){var p=pages[i];if(p.offsetParent!==null&&getComputedStyle(p).display!=='none')return p.id;}return'';
  }
  function flowStatus(){var s=getSnapshot(),m=summary(s);return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:7px;"><span>🧾 Registrados: <b>'+m.total+'</b></span><span>📋 Clasificados: <b>'+m.classified+'</b></span><span>✅ Con aprobación: <b>'+m.approved+'</b></span><span>🛡️ Con A. Control: <b>'+m.withAC+'</b></span><span>⚠️ Con riesgos: <b>'+m.withRisk+'</b></span><span>📌 Riesgos totales: <b>'+m.risks.length+'</b></span></div>';}
  function roleGuide(){var r=currentRole();if(r==='Administrador de Riesgos')return '<b>Como Administrador de Riesgos</b> puedes registrar/revisar terceros, clasificar contratos, aprobar clasificaciones, configurar las preguntas de Ambiente de Control, supervisar las respuestas del Evaluador, revisar el análisis de riesgos, hacer seguimiento y consultar reportes.';if(r==='Evaluador')return '<b>Como Evaluador</b> trabajas con los terceros y contratos que ya fueron aprobados. Diligencias Ambiente de Control y continúas con el análisis que corresponda según el flujo habilitado.';if(r==='Superadministrador')return '<b>Como Superadministrador</b> administras usuarios y organizaciones, revisas la base de datos, sincronización y consistencia de registros, sin sustituir la evaluación de riesgos de los roles operativos.';return 'El asistente te guía según tu rol y la fase visible.';}
  function contextGuide(){var id=visiblePage(),g=pageGuides[id];if(!g)return roleGuide()+'<br><br>💡 Puedo indicarte el siguiente paso según la pantalla que abras.';return '<b>Estás en '+esc(g.name)+'.</b><br>'+g.text+'<br><br>➡️ <b>Siguiente fase sugerida:</b> '+esc(g.next)+'.';}
  function assistantAnswer(q){
    var n=norm(q),id=visiblePage(),g=pageGuides[id];
    if(n.indexOf('que hago')>=0||n.indexOf('esta pantalla')>=0||n.indexOf('aqui')>=0)return contextGuide();
    if(n.indexOf('siguiente')>=0||n.indexOf('continuar')>=0)return g?'<b>Siguiente paso:</b> '+esc(g.next)+'.<br>'+esc(g.text):contextGuide();
    if(n.indexOf('mi rol')>=0||n.indexOf('puedo hacer')>=0||n.indexOf('administrador')>=0||n.indexOf('evaluador')>=0)return roleGuide();
    if(n.indexOf('estado')>=0||n.indexOf('avance')>=0||n.indexOf('flujo')>=0)return '<b>Estado actual del flujo</b>'+flowStatus()+'<br><span style="color:#64748b;">Estos valores se calculan con los registros cargados en el sistema.</span>';
    if(n.indexOf('aprobar')>=0)return '<b>Aprobación:</b> revisa el contrato y su clasificación. Al aprobar, el contrato debe quedar marcado como aprobado y habilitar sus tipologías para Ambiente de Control y para el Evaluador.';
    if(n.indexOf('tipolog')>=0)return '<b>Tipologías:</b> pertenecen al contrato. Las tipologías calificadas deben conservarse durante Aprobación, Configuración de Ambiente de Control, Evaluación y Análisis de Riesgos.';
    if(n.indexOf('control')>=0||n.indexOf('pregunta')>=0)return '<b>Ambiente de Control:</b> el Administrador de Riesgos configura preguntas/controles para las tipologías clasificadas. Después, el Evaluador selecciona tercero, contrato y tipología y responde esas preguntas.';
    if(n.indexOf('riesgo')>=0||n.indexOf('matriz')>=0)return '<b>Análisis de Riesgos:</b> usa la información ya aprobada y evaluada para registrar riesgo inherente, controles, riesgo residual, tratamiento, responsable y seguimiento.';
    if(n.indexOf('reporte')>=0||n.indexOf('power bi')>=0||n.indexOf('descargar')>=0)return '<b>Reportes:</b> abre “Reportes y Power BI”. Allí puedes filtrar el tablero, revisar riesgo inherente/residual y descargar CSV para Power BI, Excel, JSON, CSV por fase o una versión imprimible/PDF.';
    if(n.indexOf('base')>=0||n.indexOf('sincron')>=0||n.indexOf('registro')>=0)return '<b>Datos y sincronización:</b> los registros reales deben mantenerse en una sola fuente lógica y reflejarse en las fases. El módulo de saneamiento evita que un registro demo histórico vuelva a aparecer en las vistas.';
    if(n.indexOf('ayuda')>=0||n.indexOf('guia')>=0||n.indexOf('que puedes')>=0)return roleGuide()+'<br><br>'+contextGuide()+'<br><br><b>Pregúntame:</b> “¿Qué hago aquí?”, “¿Cuál es el siguiente paso?”, “¿Cómo va el flujo?”, “¿Cómo configuro preguntas?” o “¿Cómo descargo reportes?”.';
    return contextGuide()+'<br><br>💡 Si quieres una guía más concreta, escribe <b>“¿Qué hago aquí?”</b> o <b>“Siguiente paso”</b>.';
  }
  function addAssistantMsg(html){var chat=document.getElementById('mensajes-chat');if(!chat)return;var d=document.createElement('div');d.style.cssText='background:white;padding:10px;border-left:4px solid #2b6fae;border-radius:8px;font-size:11.5px;line-height:1.5;word-wrap:break-word;';d.innerHTML='🤖 <b>Asistente:</b><br>'+html;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
  function quickAsk(q){addAssistantMsg(assistantAnswer(q));}
  window.preguntarAsistenteRapido=quickAsk;
  window.responderPreguntaAsistente=assistantAnswer;
  window.enviarMensajeAsistente=function(){
    var input=document.getElementById('input-asistente'),chat=document.getElementById('mensajes-chat');if(!input||!chat)return;var msg=input.value.trim();if(!msg)return;var u=document.createElement('div');u.style.cssText='background:#e9eef3;padding:9px 10px;border-radius:8px;font-size:11.5px;word-wrap:break-word;margin-bottom:2px;';u.textContent='👤 Tú: '+msg;chat.appendChild(u);input.value='';setTimeout(function(){addAssistantMsg(assistantAnswer(msg));},120);
  };
  function assistantWelcome(){
    var chat=document.getElementById('mensajes-chat');if(!chat)return;var id=visiblePage(),g=pageGuides[id],role=currentRole();
    chat.innerHTML='<div style="background:white;padding:11px;border-radius:8px;border-left:4px solid #2b6fae;font-size:11.5px;line-height:1.5;"><b>👋 Hola. Soy tu guía inteligente del SGRT.</b><br><span style="color:#64748b;">Rol detectado: '+esc(role)+'.</span><br><br>'+(g?'Ahora estás en <b>'+esc(g.name)+'</b>. Puedo guiarte paso a paso sin salir de esta pantalla.':'Puedo guiarte según la fase que estés usando.')+'</div>'
      +'<div style="display:flex;gap:5px;flex-wrap:wrap;"><button onclick="preguntarAsistenteRapido(\'¿Qué hago aquí?\')" style="border:1px solid #b9cce0;background:#fff;color:#245b8d;border-radius:14px;padding:5px 8px;font-size:10.5px;cursor:pointer;">¿Qué hago aquí?</button><button onclick="preguntarAsistenteRapido(\'Siguiente paso\')" style="border:1px solid #b9cce0;background:#fff;color:#245b8d;border-radius:14px;padding:5px 8px;font-size:10.5px;cursor:pointer;">Siguiente paso</button><button onclick="preguntarAsistenteRapido(\'Estado del flujo\')" style="border:1px solid #b9cce0;background:#fff;color:#245b8d;border-radius:14px;padding:5px 8px;font-size:10.5px;cursor:pointer;">Estado del flujo</button><button onclick="preguntarAsistenteRapido(\'Mi rol\')" style="border:1px solid #b9cce0;background:#fff;color:#245b8d;border-radius:14px;padding:5px 8px;font-size:10.5px;cursor:pointer;">Mi rol</button></div>';
  }
  function installAssistant(){
    var panel=document.getElementById('chat-panel');if(!panel)return;
    panel.style.width='390px';panel.style.maxHeight='570px';
    var header=panel.firstElementChild;if(header){var title=header.querySelector('div');if(title)title.innerHTML='<span>🤖</span> Asistente inteligente · Guía contextual';}
    var input=document.getElementById('input-asistente');if(input)input.placeholder='Ej: ¿Qué hago aquí? / ¿Cuál es el siguiente paso?';
    assistantWelcome();
    var oldOpen=window.abrirAsistente;if(typeof oldOpen==='function'&&!oldOpen._sgrt26){var w=function(){var r=oldOpen.apply(this,arguments);setTimeout(assistantWelcome,50);return r;};w._sgrt26=true;window.abrirAsistente=w;}
  }

  // ─────────────────────────────────────────────────────────────
  // INSTALACIÓN DEFENSIVA DESPUÉS DE LOS MÓDULOS ANTERIORES
  // ─────────────────────────────────────────────────────────────
  function install(){
    cleanLegacyDemo();
    wrapClean('_lsLoad');wrapAsyncClean('cargarTercerosDesdeAPI');wrapAsyncClean('_lsSyncWithAzure');wrapAsyncClean('bdSincronizarAhora');wrapClean('sgrtSanearRegistros');
    ['renderMatriz','renderSeguimiento','renderAprobarOp','acPoblarSelectorTerceroInstruc'].forEach(wrapClean);
    installReports();installAssistant();
    try{var vp=visiblePage();if(vp==='pg-matriz'&&typeof window.renderMatriz==='function')window.renderMatriz();else if(vp==='pg-seguimiento'&&typeof window.renderSeguimiento==='function')window.renderSeguimiento();else if(vp==='pg-reportes-entidad')renderEnhancedReports();else if(vp==='pg-aprobar-op'&&typeof window.renderAprobarOp==='function')window.renderAprobarOp();else if(vp==='pg-ctrl-op'&&typeof window.acPoblarSelectorTerceroInstruc==='function')window.acPoblarSelectorTerceroInstruc();}catch(eRefresh){}
    // Navegación: limpia el demo y actualiza guía/reportes sin alterar el destino original.
    if(typeof window.navTo==='function'&&!window.navTo._sgrt26){var oldNav=window.navTo;var nn=function(el,pg){cleanLegacyDemo();var r=oldNav.apply(this,arguments);setTimeout(function(){cleanLegacyDemo();if(pg==='pg-reportes-entidad')renderEnhancedReports();var panel=document.getElementById('chat-panel');if(panel&&panel.style.display!=='none')assistantWelcome();},120);return r;};nn._sgrt26=true;window.navTo=nn;}
  }
  cleanLegacyDemo();
  document.addEventListener('DOMContentLoaded',function(){setTimeout(install,30);setTimeout(install,700);setTimeout(install,2400);});
  setTimeout(install,2600);
})();
