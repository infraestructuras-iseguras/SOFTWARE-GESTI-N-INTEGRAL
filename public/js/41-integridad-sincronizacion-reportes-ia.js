/*
 * SGRT — Ajuste 41 (2026-09-19)
 * Sin cambiar la estructura funcional existente:
 * - Verificación REAL contra /test-db y /api/terceros.
 * - Sincronización marcada como exitosa solo después de confirmar el NIT en Azure.
 * - Persistencia de MATRIZ_DB dentro del estado SGRT por tercero/contrato.
 * - Reportes Word/PPTX prácticos por dimensión de control con membrete ISEGURAS.
 * - Power BI acepta reportEmbed, vínculo de workspace e incluso view?r= como fallback.
 * - Asistente opcional conectado al backend /api/ai/* con adjuntos y reuniones.
 */
(function(){
  'use strict';

  var REPORT_ASSET_BASE='assets/reportes/';
  var assistantFile=null;
  var assistantDataUrl='';

  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function toast(msg,type,ms){try{window.showToast&&window.showToast(msg,type||'info',ms||3200);}catch(e){}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function apiBase(){
    var h=window.location.hostname||'';
    if(window.API_BASE_URL)return String(window.API_BASE_URL).replace(/\/$/,'');
    if(window.API_BASE)return String(window.API_BASE).replace(/\/$/,'');
    if(h==='localhost'||h==='127.0.0.1')return 'http://'+h+':3000';
    if(/azurewebsites\.net$/i.test(h))return window.location.origin;
    return 'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net';
  }
  window.API_BASE_URL=apiBase();

  function saveLocal(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{
      var s={};try{s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');}catch(e2){}
      s.TERCEROS_DB=db();s.MATRIZ_DB=window.MATRIZ_DB||[];
      localStorage.setItem('sgrt_v8',JSON.stringify(s));
    }catch(e3){}
  }

  function setText(id,text){var e=document.getElementById(id);if(e)e.textContent=text;}
  function paintDb(ok,data,count){
    var status=ok?'Conectado':'No disponible';
    setText('bd-conexion-status',ok?'Conectado'+(data&&data.database?' · '+data.database:''):'No disponible');
    setText('bd-registros-count',String(count==null?0:count));
    setText('bd-ultima-sync',new Date().toLocaleString('es-CO'));
    setText('config-azure-status',ok?'OK':'Error');
    setText('is-db-azure-status',ok?'Conectado':'No disponible');
    setText('is-db-last-sync',new Date().toLocaleString('es-CO'));
    var ind=document.getElementById('db-status-indicator'),txt=document.getElementById('db-status-text');
    if(ind){ind.style.background=ok?'#22c55e':'#dc3545';ind.style.boxShadow=ok?'0 0 8px rgba(34,197,94,.6)':'0 0 8px rgba(220,53,69,.6)';}
    if(txt){txt.textContent=ok?'🟢 CONECTADA':'🔴 DESCONECTADA';txt.style.color=ok?'#15803d':'#991b1b';}
    if(data&&data.server)setText('db-server',data.server);
    if(data&&data.database)setText('db-name',data.database);
    var localCount=Object.keys(db()).length,syncCount=Object.values(db()).filter(function(t){return t&&t.sincronizado===true&&!t._changed;}).length;
    setText('config-local-count',String(localCount));setText('config-sync-count',syncCount+'/'+localCount);
    setText('bd-ls-count',localCount+' terceros');setText('bd-sync-count',syncCount+'/'+localCount);
    return status;
  }

  async function verifyRemote(silent){
    paintDb(false,null,0);setText('bd-conexion-status','Verificando…');setText('config-azure-status','…');setText('is-db-azure-status','Verificando…');
    try{
      var pair=await Promise.all([
        fetch(apiBase()+'/test-db',{headers:{'Accept':'application/json'},cache:'no-store'}),
        fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json'},cache:'no-store'})
      ]);
      var health=await pair[0].json().catch(function(){return{};}), third=await pair[1].json().catch(function(){return{};});
      if(!pair[0].ok||!health.ok||health.connected===false)throw new Error(health.error||health.message||('HTTP '+pair[0].status));
      if(!pair[1].ok||!third.ok)throw new Error(third.error||('HTTP '+pair[1].status));
      paintDb(true,health,Number(third.count||((third.data||[]).length)||0));
      if(!silent)toast('Azure SQL verificada: '+(health.database||'base conectada'),'success');
      return {ok:true,db:health,terceros:third.data||[]};
    }catch(e){
      paintDb(false,null,0);if(!silent)toast('No se pudo verificar Azure: '+e.message,'error',4300);return {ok:false,error:e.message};
    }
  }

  window.verificarConexionBD=function(){return verifyRemote(false);};
  window.bdVerificarConexion=function(){return verifyRemote(false);};
  window.verificarAzureIS=function(){return verifyRemote(false);};

  // Riesgos: el código histórico guardaba MATRIZ_DB en localStorage, pero no viajaba
  // dentro de SGRT_Tercero_Estado. Este puente la adjunta por NIT/contrato.
  function risksForThird(t){
    var n=norm(t&&t.nit),name=norm(t&&t.nombre);
    return (window.MATRIZ_DB||[]).filter(function(r){return norm(r&&r.nit)===n||(!r.nit&&norm(r&&r.tercero)===name);}).map(function(r){var x={};Object.keys(r||{}).forEach(function(k){x[k]=r[k];});x.nit=x.nit||n;return x;});
  }
  function riskKey(r){return [norm(r&&r.nit),norm(r&&r.contrato),norm(r&&r.id),norm(r&&r.desc)].join('|');}
  function importRisksFromThirds(){
    var local=Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB:[],by={};local.forEach(function(r){by[riskKey(r)]=r;});
    Object.keys(db()).forEach(function(n){var t=db()[n]||{},arr=Array.isArray(t._matrizRiesgos)?t._matrizRiesgos:[];arr.forEach(function(r){var x=Object.assign({},r);x.nit=x.nit||n;by[riskKey(x)]=Object.assign({},by[riskKey(x)]||{},x);});});
    window.MATRIZ_DB=Object.keys(by).map(function(k){return by[k];});
    try{if(typeof MATRIZ_DB!=='undefined'){MATRIZ_DB.length=0;window.MATRIZ_DB.forEach(function(r){MATRIZ_DB.push(r);});window.MATRIZ_DB=MATRIZ_DB;}}catch(e){}
    saveLocal();
  }

  var originalUpsert=window._sgrtUpsertEstadoCompleto;
  if(typeof originalUpsert==='function')window._sgrtUpsertEstadoCompleto=async function(t){
    if(t&&t.nit)t._matrizRiesgos=risksForThird(t);
    return originalUpsert.apply(this,arguments);
  };
  var originalLoad=window.sgrtCargarDesdeServidor;
  if(typeof originalLoad==='function')window.sgrtCargarDesdeServidor=async function(){var r=await originalLoad.apply(this,arguments);importRisksFromThirds();return r;};

  async function syncConfirmed(){
    var before=Object.keys(db()),result={ok:0,fail:0,total:before.length};
    try{if(typeof window._lsSyncWithAzure==='function')result=await window._lsSyncWithAzure();}catch(e){result={ok:0,fail:before.length,total:before.length,error:e.message};}
    var v=await verifyRemote(true);if(!v.ok)throw new Error(v.error||'No fue posible verificar el servidor');
    var remote={};(v.terceros||[]).forEach(function(r){remote[norm(r.nit||r.NIT)]=1;});
    var confirmed=0,pending=0;
    before.forEach(function(n){var t=db()[n];if(!t)return;if(remote[n]){t.sincronizado=true;t._changed=false;confirmed++;}else{t.sincronizado=false;t._changed=true;pending++;}});
    saveLocal();paintDb(true,v.db,(v.terceros||[]).length);
    if(typeof window.sgrtCargarDesdeServidor==='function')try{await window.sgrtCargarDesdeServidor({silentUi:true});}catch(e2){}
    return {ok:confirmed,fail:pending,total:before.length};
  }
  window.bdSincronizarAhora=async function(){
    setText('bd-conexion-status','Sincronizando…');setText('is-db-azure-status','Sincronizando…');
    try{var r=await syncConfirmed();toast(r.fail?'Confirmados en Azure: '+r.ok+' · pendientes: '+r.fail:'✅ '+r.ok+' registro(s) confirmados en Azure',r.fail?'warning':'success',4200);return r;}catch(e){toast('Sincronización no confirmada: '+e.message,'error',4500);throw e;}
  };
  window.sincronizarAzureIS=window.bdSincronizarAhora;

  function syncRiskForName(name){
    var t=Object.values(db()).find(function(x){return x&&(norm(x.nombre)===norm(name)||norm(x.nit)===norm(name));});
    if(!t)return;t._matrizRiesgos=risksForThird(t);t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();saveLocal();
    setTimeout(function(){try{window._sgrtUpsertEstadoCompleto&&window._sgrtUpsertEstadoCompleto(t);}catch(e){}},100);
  }
  var oldGuardarRiesgo=window.guardarRiesgo;
  if(typeof oldGuardarRiesgo==='function')window.guardarRiesgo=function(){var name=norm((document.getElementById('nr-tercero')||{}).value);var r=oldGuardarRiesgo.apply(this,arguments);syncRiskForName(name);return r;};
  var oldEliminarRiesgo=window.eliminarRiesgo;
  if(typeof oldEliminarRiesgo==='function')window.eliminarRiesgo=function(id){var row=(window.MATRIZ_DB||[]).find(function(x){return norm(x&&x.id)===norm(id);});var name=row&&(row.nit||row.tercero);var r=oldEliminarRiesgo.apply(this,arguments);setTimeout(function(){if(name)syncRiskForName(name);},180);return r;};

  // ----------------------------- POWER BI -----------------------------
  function normalizePbi(raw){
    var v=norm(raw);if(!v)return '';
    var m=v.match(/<iframe[^>]+src=["']([^"']+)["']/i);if(m&&m[1])v=m[1].replace(/&amp;/g,'&');
    try{
      var u=new URL(v,window.location.href),p=u.pathname.match(/\/groups\/([^\/?#]+)\/reports\/([^\/?#]+)/i);
      if(p)return 'https://app.powerbi.com/reportEmbed?reportId='+encodeURIComponent(p[2])+'&groupId='+encodeURIComponent(p[1])+'&autoAuth=true';
      if(u.hostname==='app.powerbi.com')return u.href;
    }catch(e){}
    return '';
  }
  async function persistPbi(url){
    try{await fetch(apiBase()+'/api/powerbi/report-config',{method:'POST',headers:{'Content-Type':'application/json','X-SGRT-Role':norm((window.currentUser||{}).rol)},body:JSON.stringify({embedUrl:url}),cache:'no-store'});}catch(e){}
  }
  window.sgrtConfigurarPowerBI=function(){
    var old='';try{old=localStorage.getItem('sgrt_powerbi_embed_url')||'';}catch(e){}
    var raw=prompt('Pega el enlace de Power BI. Acepta reportEmbed, el vínculo del workspace o view?r= (Publicar en web):',old);if(raw===null)return;
    var url=normalizePbi(raw);if(raw&&!url){toast('El vínculo no parece ser de app.powerbi.com','warning');return;}
    try{if(url)localStorage.setItem('sgrt_powerbi_embed_url',url);else localStorage.removeItem('sgrt_powerbi_embed_url');}catch(e2){}
    if(url)persistPbi(url);
    var shell=document.getElementById('sgrt-powerbi-stable-shell');if(shell)shell.setAttribute('data-powerbi-url','');
    try{window.sgrtRecargarPowerBI&&window.sgrtRecargarPowerBI();}catch(e3){}
    toast(url?'Power BI vinculado.':'Conexión de Power BI eliminada.',url?'success':'info');
  };

  // ----------------------------- DATOS DE REPORTE -----------------------------
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato));}
  function dimName(d){return norm(d&&(d.nombre||d.name||d.tipologia||d.key))||'Dimensión';}
  function answerText(a){
    if(a==null)return 'Pendiente';if(typeof a==='string'||typeof a==='number'||typeof a==='boolean')return norm(a)||'Pendiente';
    return norm(a.respuesta||a.valor||a.value||a.estado||a.resp||a.seleccion||a.opcion)||((a.si===true)?'Sí':(a.no===true?'No':'Registrado'));
  }
  function collectReport(){
    var fThird=norm((document.getElementById('sgrt-rpt-third')||{}).value),fContract=norm((document.getElementById('sgrt-rpt-contract')||{}).value),out=[];
    Object.keys(db()).forEach(function(nit){
      var t=db()[nit]||{};if(fThird&&nit!==fThird)return;
      var cons=(t.contratos||[]).map(contractNum).filter(Boolean);if(!cons.length)cons=Object.keys(t.dimsPorContrato||{});if(!cons.length)cons=['SIN CONTRATO'];
      cons.forEach(function(c){if(fContract&&c!==fContract)return;
        var dims=(t.dimsPorContrato&&t.dimsPorContrato[c])||t.dims||[],resp=(t.respuestasACPorContrato&&t.respuestasACPorContrato[c])||{};
        dims.forEach(function(d){
          var key=norm(d.key||d.id||dimName(d)),qs=[];try{if(window._ctrlsCuest)qs=window._ctrlsCuest(nit,d.key,c)||[];}catch(e){}
          if(!qs.length){var rr=resp[key]||resp[d.key]||{};qs=Object.keys(rr||{}).map(function(k){return {n:k,ctrl:'Control '+k};});}
          if(!qs.length)qs=[{n:'—',ctrl:'Sin preguntas activas registradas'}];
          qs.forEach(function(q){var a=(resp[d.key]||resp[key]||{})[q.n]||{};out.push({nit:nit,tercero:t.nombre||nit,contrato:c,dimension:dimName(d),pregunta:q.ctrl||q.req||('Control '+q.n),respuesta:answerText(a),observacion:norm(a.obs||a.observacion||''),zona:norm(d.zona||t.zona||''),promedio:Number((t.promPorContrato&&t.promPorContrato[c])||t.prom||0)});});
        });
      });
    });
    var risks=(window.MATRIZ_DB||[]).filter(function(r){return (!fThird||norm(r.nit)===fThird||norm((db()[fThird]||{}).nombre)===norm(r.tercero))&&(!fContract||norm(r.contrato)===fContract);});
    return {rows:out,risks:risks,generated:new Date(),filterThird:fThird,filterContract:fContract};
  }
  function summaryByDimension(data){
    var m={};data.rows.forEach(function(r){var k=r.tercero+'|'+r.contrato+'|'+r.dimension;if(!m[k])m[k]={tercero:r.tercero,contrato:r.contrato,dimension:r.dimension,total:0,done:0,yes:0,no:0,na:0};var x=m[k];x.total++;var a=low(r.respuesta);if(a&&a!=='pendiente')x.done++;if(a==='sí'||a==='si'||a==='yes')x.yes++;else if(a==='no')x.no++;else if(a.indexOf('aplica')>=0)x.na++;});return Object.values(m);}
  function recommendations(data){
    var dims=summaryByDimension(data),list=[];dims.forEach(function(d){var pct=d.total?Math.round(100*d.done/d.total):0;if(pct<100)list.push(d.tercero+' · '+d.contrato+' · '+d.dimension+': completar '+(100-pct)+'% pendiente.');if(d.no>0)list.push(d.tercero+' · '+d.contrato+' · '+d.dimension+': revisar '+d.no+' respuesta(s) “No” y definir plan de acción.');});
    data.risks.forEach(function(r){if(['ALTO','EXTREMO'].indexOf(norm(r.zonaRes||r.zonaInh).toUpperCase())>=0)list.push((r.id||'Riesgo')+' · '+(r.tercero||r.nit||'')+': validar tratamiento, responsable y fecha de implementación.');});return list.slice(0,15);
  }

  function loadScript(src,test){return new Promise(function(resolve,reject){if(test())return resolve(true);var s=document.createElement('script');s.src=src;s.async=true;s.onload=function(){test()?resolve(true):reject(new Error('Librería no disponible'));};s.onerror=function(){reject(new Error('No se pudo cargar '+src));};document.head.appendChild(s);});}
  async function fetchBytes(path){var r=await fetch(path);if(!r.ok)throw new Error('No se pudo cargar '+path);return new Uint8Array(await r.arrayBuffer());}
  async function fetchDataUri(path){var r=await fetch(path);if(!r.ok)throw new Error('No se pudo cargar '+path);var b=await r.blob();return await new Promise(function(resolve,reject){var fr=new FileReader();fr.onload=function(){resolve(fr.result);};fr.onerror=reject;fr.readAsDataURL(b);});}

  window.sgrtGenerarWordPlantilla=async function(){
    var data=collectReport(),dims=summaryByDimension(data);if(!data.rows.length&&!data.risks.length){toast('No hay datos para el filtro seleccionado.','warning');return;}
    toast('Generando Word con membrete…','info');
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js',function(){return !!window.docx;});
      var d=window.docx,top=await fetchBytes(REPORT_ASSET_BASE+'membrete_superior.png'),bottom=await fetchBytes(REPORT_ASSET_BASE+'membrete_inferior.jpg');
      var rows=[new d.TableRow({children:['Tercero','Contrato','Dimensión','Avance','Sí','No'].map(function(x){return new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:x,bold:true})]})]});})})];
      dims.forEach(function(x){var pct=x.total?Math.round(100*x.done/x.total):0;rows.push(new d.TableRow({children:[x.tercero,x.contrato,x.dimension,pct+'%',String(x.yes),String(x.no)].map(function(v){return new d.TableCell({children:[new d.Paragraph({text:String(v)})]});})}));});
      var riskRows=[new d.TableRow({children:['ID','Tercero','Contrato','Riesgo','Inherente','Residual','Tratamiento'].map(function(x){return new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:x,bold:true})]})]});})})];
      data.risks.forEach(function(r){riskRows.push(new d.TableRow({children:[r.id||'',r.tercero||r.nit||'',r.contrato||'',r.desc||'',r.zonaInh||'',r.zonaRes||'',r.tratamiento||r.plan||''].map(function(v){return new d.TableCell({children:[new d.Paragraph(String(v||''))]});})}));});
      var recs=recommendations(data);
      var doc=new d.Document({sections:[{headers:{default:new d.Header({children:[new d.Paragraph({children:[new d.ImageRun({data:top,transformation:{width:600,height:109}})]})]})},footers:{default:new d.Footer({children:[new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.ImageRun({data:bottom,transformation:{width:560,height:63}})]})]})},children:[
        new d.Paragraph({alignment:d.AlignmentType.CENTER,spacing:{after:240},children:[new d.TextRun({text:'INFORME DE EVALUACIÓN Y GESTIÓN DE RIESGOS DE TERCEROS',bold:true,size:28})]}),
        new d.Paragraph({text:'Informe operativo generado con la información registrada en el SGRT. Presenta resultados por dimensiones de control, riesgos y acciones recomendadas.',spacing:{after:180}}),
        new d.Paragraph({text:'1. Resumen por dimensiones de control',heading:d.HeadingLevel.HEADING_1}),new d.Table({rows:rows,width:{size:100,type:d.WidthType.PERCENTAGE}}),
        new d.Paragraph({text:'2. Análisis de riesgos',heading:d.HeadingLevel.HEADING_1}),new d.Table({rows:riskRows,width:{size:100,type:d.WidthType.PERCENTAGE}}),
        new d.Paragraph({text:'3. Recomendaciones prácticas',heading:d.HeadingLevel.HEADING_1})
      ].concat((recs.length?recs:['No se identificaron acciones automáticas adicionales para el filtro actual.']).map(function(x){return new d.Paragraph({text:'• '+x});})).concat([new d.Paragraph({text:'Generado: '+data.generated.toLocaleString('es-CO'),spacing:{before:260}})])}]});
      var blob=await d.Packer.toBlob(doc),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='SGRT_Informe_Dimensiones_'+new Date().toISOString().slice(0,10)+'.docx';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1500);toast('Word generado correctamente.','success');
    }catch(e){console.error(e);toast('No se pudo generar Word: '+e.message,'error',5000);}
  };

  window.sgrtGenerarPowerPointPlantilla=async function(){
    var data=collectReport(),dims=summaryByDimension(data);if(!dims.length&&!data.risks.length){toast('No hay datos para generar la presentación.','warning');return;}
    toast('Generando PowerPoint con plantilla ISEGURAS…','info');
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js',function(){return !!(window.pptxgen||window.PptxGenJS);});
      var C=window.pptxgen||window.PptxGenJS,pptx=new C();pptx.layout='LAYOUT_WIDE';pptx.author='Infraestructuras Seguras S.A.S.';pptx.subject='SGRT';pptx.title='Informe Ejecutivo SGRT';
      var bg=await fetchDataUri(REPORT_ASSET_BASE+'plantilla_slide.png');
      function slideBase(title,sub){var s=pptx.addSlide();s.addImage({data:bg,x:0,y:0,w:13.333,h:7.5});s.addText(title,{x:.75,y:.55,w:11.7,h:.5,fontFace:'Arial',fontSize:22,bold:true,color:'173B5F',margin:0});if(sub)s.addText(sub,{x:.78,y:1.08,w:11.4,h:.3,fontSize:10,color:'64748B',margin:0});return s;}
      var s=slideBase('Informe Ejecutivo · Riesgo de Terceros','Resultados prácticos por dimensiones de control · '+data.generated.toLocaleDateString('es-CO'));
      s.addText('SGRT',{x:.8,y:2.5,w:4,h:.8,fontSize:38,bold:true,color:'173B5F',margin:0});s.addText('Infraestructuras Seguras S.A.S.',{x:.82,y:3.35,w:5.5,h:.4,fontSize:18,bold:true,color:'2B6FAE',margin:0});
      var sm=slideBase('Resumen por dimensiones de control','Avance de diligenciamiento y respuestas registradas');
      var top=dims.slice(0,10);var table=[['Tercero','Contrato','Dimensión','Avance','No']].concat(top.map(function(x){return [x.tercero,x.contrato,x.dimension,(x.total?Math.round(100*x.done/x.total):0)+'%',String(x.no)];}));sm.addTable(table,{x:.65,y:1.55,w:12,h:4.9,border:{type:'solid',color:'D7E2EC',pt:.7},fill:'FFFFFF',fontSize:9,color:'243B53',rowH:.36,margin:.05,bold:false});
      var groups={};data.risks.forEach(function(r){var k=norm(r.tercero||r.nit)||'Sin tercero';(groups[k]||(groups[k]=[])).push(r);});Object.keys(groups).slice(0,8).forEach(function(k){var sr=slideBase('Análisis de riesgos · '+k,'Riesgo inherente, residual y tratamiento');var rr=groups[k].slice(0,8),tb=[['ID','Contrato','Riesgo','Inherente','Residual','Tratamiento']].concat(rr.map(function(r){return [r.id||'',r.contrato||'',norm(r.desc).slice(0,80),r.zonaInh||'',r.zonaRes||'',norm(r.tratamiento||r.plan).slice(0,70)];}));sr.addTable(tb,{x:.55,y:1.48,w:12.2,h:5.15,border:{type:'solid',color:'D7E2EC',pt:.6},fill:'FFFFFF',fontSize:8.5,color:'243B53',rowH:.42,margin:.04});});
      var recs=recommendations(data),sf=slideBase('Conclusiones y acciones recomendadas','Acciones concretas derivadas de la información registrada');sf.addText((recs.length?recs:['No se identificaron acciones adicionales.']).map(function(x,i){return {text:(i+1)+'. '+x,options:{bullet:false,breakLine:true}};}),{x:.9,y:1.55,w:11.3,h:4.8,fontSize:15,color:'334E68',breakLine:true,margin:.04,paraSpaceAfterPt:9});
      await pptx.writeFile({fileName:'SGRT_Informe_Ejecutivo_'+new Date().toISOString().slice(0,10)+'.pptx'});toast('PowerPoint generado correctamente.','success');
    }catch(e){console.error(e);toast('No se pudo generar PowerPoint: '+e.message,'error',5000);}
  };

  function installReportButtons(){
    var pg=document.getElementById('pg-reportes-entidad'),wrap=document.getElementById('rpe-wrap-op');if(!pg||!wrap||document.getElementById('sgrt41-report-actions'))return;
    var box=document.createElement('div');box.id='sgrt41-report-actions';box.className='card';box.style.cssText='margin-bottom:14px;border-left:4px solid #1e6bb8;';box.innerHTML='<div class="card-body" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;"><div><b style="color:#173b5f;">📄 Informes con plantilla ISEGURAS</b><div style="font-size:10.5px;color:#64748b;margin-top:3px;">Generación práctica por dimensiones de control, riesgos y recomendaciones; usa el filtro actual del tablero.</div></div><div style="display:flex;gap:7px;flex-wrap:wrap;"><button class="btn btn-primary btn-sm" onclick="window.sgrtGenerarWordPlantilla()">📝 Descargar Word</button><button class="btn btn-outline btn-sm" onclick="window.sgrtGenerarPowerPointPlantilla()">📊 Descargar PowerPoint</button></div></div>';wrap.parentNode.insertBefore(box,wrap);
  }

  // ----------------------------- ASISTENTE + ADJUNTOS/REUNIONES -----------------------------
  function fileToDataUrl(file){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=reject;r.readAsDataURL(file);});}
  function currentAiContext(){var d=collectReport(),dims=summaryByDimension(d);return {role:norm((window.currentUser||{}).rol),third:d.filterThird||'',contract:d.filterContract||'',dimensions:dims.slice(0,25),risks:d.risks.slice(0,25)};}
  function addBot(text){var chat=document.getElementById('mensajes-chat');if(!chat)return;var x=document.createElement('div');x.style.cssText='background:white;padding:10px;border-left:4px solid #2b6fae;border-radius:8px;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word;';x.textContent='🤖 Asistente:\n'+text;chat.appendChild(x);chat.scrollTop=chat.scrollHeight;}
  function addUser(text){var chat=document.getElementById('mensajes-chat');if(!chat)return;var x=document.createElement('div');x.style.cssText='background:#e9eef3;padding:9px 10px;border-radius:8px;font-size:11.5px;word-break:break-word;';x.textContent='👤 Tú: '+text;chat.appendChild(x);chat.scrollTop=chat.scrollHeight;}
  function ensureMeetingFolder(file,dataUrl,summary,transcript){
    try{
      if(!window.RPT_FS||!Array.isArray(window.RPT_FS.children))return;
      var c=currentAiContext(),nit=c.third||'GENERAL',contract=c.contract||'SIN_CONTRATO';
      function folder(parent,name,id){var f=(parent.children||[]).find(function(x){return x.type==='folder'&&x.name===name;});if(!f){f={type:'folder',name:name,id:id+'_'+Date.now().toString(36),children:[],fecha:''};parent.children.push(f);}return f;}
      var r=folder(window.RPT_FS,'Reuniones','reun'),a=folder(r,nit,'terc'),b=folder(a,contract,'cont'),stamp=new Date().toLocaleDateString('es-CO');
      b.children.push({type:'file',name:file.name,id:'reunion_'+Date.now().toString(36),size:file.size,fecha:stamp,mimeType:file.type,_dataURL:dataUrl,_origen:'Reuniones'});
      if(summary)b.children.push({type:'file',name:'Informe_reunion_'+new Date().toISOString().slice(0,10)+'.txt',id:'acta_'+Date.now().toString(36),size:summary.length,fecha:stamp,mimeType:'text/plain',_dataURL:'data:text/plain;charset=utf-8,'+encodeURIComponent(summary+(transcript?'\n\nTRANSCRIPCIÓN\n'+transcript:''))});
      if(window._saveRPT)window._saveRPT();
    }catch(e){console.warn('Repositorio reunión:',e.message);}
  }
  async function askAi(prompt){
    var payload={prompt:prompt,context:currentAiContext()};
    if(assistantFile&&assistantDataUrl)payload.file={name:assistantFile.name,type:assistantFile.type,dataUrl:assistantDataUrl};
    if(assistantFile&&/^(audio|video)\//i.test(assistantFile.type||'')){
      var tr=await fetch(apiBase()+'/api/ai/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:assistantFile.name,mimeType:assistantFile.type,dataUrl:assistantDataUrl,prompt:prompt,context:payload.context})});var tj=await tr.json().catch(function(){return{};});if(!tr.ok||!tj.ok)throw new Error(tj.error||('HTTP '+tr.status));ensureMeetingFolder(assistantFile,assistantDataUrl,tj.summary||'',tj.transcript||'');return tj.summary||tj.transcript||'Transcripción completada.';
    }
    var r=await fetch(apiBase()+'/api/ai/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return j.text||'Sin respuesta.';
  }
  function installAssistantAttachments(){
    var input=document.getElementById('input-asistente');if(!input||document.getElementById('sgrt41-ai-file'))return;var row=input.parentElement;if(!row)return;
    var hidden=document.createElement('input');hidden.type='file';hidden.id='sgrt41-ai-file';hidden.style.display='none';hidden.accept='.pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.mp4,.webm,.mpeg';row.appendChild(hidden);
    var btn=document.createElement('button');btn.type='button';btn.textContent='📎';btn.title='Adjuntar documento, imagen, audio o video';btn.style.cssText='padding:8px 10px;background:#eef2ff;color:#4f46e5;border:1px solid #c7d2fe;border-radius:6px;cursor:pointer;font-weight:700;';btn.onclick=function(){hidden.click();};row.insertBefore(btn,input);
    var label=document.createElement('div');label.id='sgrt41-ai-file-label';label.style.cssText='font-size:9.5px;color:#64748b;padding:0 10px 6px;background:white;display:none;';row.parentElement.appendChild(label);
    hidden.onchange=async function(){var f=hidden.files&&hidden.files[0];if(!f)return;if(f.size>32*1024*1024){toast('Para análisis IA, usa archivos de hasta 32 MB.','warning');hidden.value='';return;}assistantFile=f;assistantDataUrl=await fileToDataUrl(f);label.style.display='block';label.textContent='📎 '+f.name+' · '+Math.round(f.size/1024)+' KB';};
    window.enviarMensajeAsistente=async function(){var inp=document.getElementById('input-asistente'),msg=norm(inp&&inp.value);if(!msg&& !assistantFile)return;addUser(msg||(assistantFile?'Analiza el archivo adjunto.':''));if(inp)inp.value='';addBot('Procesando…');var chat=document.getElementById('mensajes-chat'),wait=chat&&chat.lastElementChild;try{var ans=await askAi(msg||'Analiza el archivo y genera un informe práctico.');if(wait)wait.remove();addBot(ans);}catch(e){if(wait)wait.remove();var fallback='';try{fallback=window.responderPreguntaAsistente?String(window.responderPreguntaAsistente(msg||'ayuda')).replace(/<[^>]+>/g,' '):'';}catch(e2){}addBot((fallback?fallback+'\n\n':'')+'IA externa no disponible: '+e.message);}finally{assistantFile=null;assistantDataUrl='';hidden.value='';label.style.display='none';label.textContent='';}};
  }

  function install(){installReportButtons();installAssistantAttachments();importRisksFromThirds();setTimeout(function(){verifyRemote(true);},1000);}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(install,700);setTimeout(install,2600);});
  setTimeout(install,3200);
})();
