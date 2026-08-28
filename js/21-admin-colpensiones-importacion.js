/*
 * SGRT — Módulo 21: Administrador de Riesgos · Colpensiones
 *
 * Extensión aditiva y defensiva. No reemplaza los formularios existentes,
 * no cambia fórmulas de riesgo y no participa en las vistas del Superadministrador.
 *
 * Alcance:
 *  - Administrador de Riesgos: solo Colpensiones en tablas, Reportes y Power BI.
 *  - Importación local asistida de CSV, XLS/XLSX y PDF con texto seleccionable.
 *  - Previsualización, validación y confirmación explícita antes de escribir.
 *  - Demostración integral local, sin sobrescribir ni sincronizar a Azure.
 */
(function(){
  'use strict';

  // El paquete se inicia vacío; los demos solo se cargan mediante una acción explícita.
  window.SGRT_DISABLE_AUTO_DEMO = true;

  var ADMIN_ROLES = ['Operativo','admin_riesgos','Administrador de Riesgos'];
  var CLIENT_ROLES = ['Cliente','evaluador'];
  var DEMO_KEY = 'sgrt_admin_colpensiones_demo_v1';
  var IMPORT_SCHEMA = 'sgrt_importacion_asistida_v1';
  var state = window.SGRT_ADMIN_COLPENSIONES = window.SGRT_ADMIN_COLPENSIONES || {
    records: [], rejected: [], files: [], processing: false, sheetPromise: null, pdfPromise: null
  };

  function user(){ return window.currentUser || {}; }
  function role(){ return String(user().rol || ''); }
  function isAdmin(){ return ADMIN_ROLES.indexOf(role()) >= 0 || user().login === 'admin_riesgos'; }
  function isClient(){ return CLIENT_ROLES.indexOf(role()) >= 0; }
  function isIS(){ return ['IS','iseguras','Superadministrador','Super Administrador'].indexOf(role()) >= 0 || user().login === 'iseguras2026'; }
  function esc(v){ return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function norm(v){ var s=String(v == null ? '' : v).toLowerCase(); try{ s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(e){} return s.trim(); }
  function key(v){ return norm(v).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,''); }
  function toast(msg,type){ try{ if(window.showToast) window.showToast(msg,type || 'info',3200); }catch(e){} }
  function colpensiones(v){ var s=norm(v).replace(/[^a-z0-9]/g,''); return !s || s === 'cliente1' || s.indexOf('colpensiones') >= 0; }
  function entityLabel(){ return '🏛 Colpensiones'; }
  function localDB(){
    var out={};
    try{ Object.assign(out,window.TERCEROS_DB || {}); }catch(e){}
    try{ var x=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}'); if(x && typeof x === 'object') Object.assign(out,x); }catch(e2){}
    return out;
  }
  function localResponses(){
    var out={};
    try{ Object.assign(out,window.CUEST_RESPUESTAS || {}); }catch(e){}
    try{ var x=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas') || '{}'); if(x && typeof x === 'object') Object.assign(out,x); }catch(e2){}
    return out;
  }
  function localMatrix(){
    var out=[];
    try{ out=Array.isArray(window.MATRIZ_DB) ? window.MATRIZ_DB.slice() : []; }catch(e){}
    try{ var x=JSON.parse(localStorage.getItem('sgrt_v8') || '{}'); if(!out.length && Array.isArray(x.MATRIZ_DB)) out=x.MATRIZ_DB.slice(); }catch(e2){}
    return out;
  }
  function clone(v){ try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return v; } }

  /* Persistencia local explícita. No llama _lsSave porque ese helper histórico
     puede intentar sincronizar con Azure en segundo plano. */
  function persistLocalOnly(){
    var db=window.TERCEROS_DB || localDB(), resp=window.CUEST_RESPUESTAS || localResponses(), mx=window.MATRIZ_DB || localMatrix();
    try{ localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db)); }catch(e){}
    try{ localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(resp)); }catch(e2){}
    try{
      var snap=JSON.parse(localStorage.getItem('sgrt_v8') || '{}');
      snap.TERCEROS_DB=db; snap.CUEST_RESPUESTAS=resp; snap.MATRIZ_DB=mx;
      localStorage.setItem('sgrt_v8',JSON.stringify(snap));
    }catch(e3){}
  }
  function refreshViews(){
    try{ window.clsRender && window.clsRender(); }catch(e){}
    try{ window.clsInitDash && window.clsInitDash(); }catch(e2){}
    try{ window._poblarSelectorTerceroClasificar && window._poblarSelectorTerceroClasificar(); }catch(e3){}
    try{ window.renderReportesPorEntidadOp && window.renderReportesPorEntidadOp(); }catch(e4){}
    try{ window.odRenderTerceros && window.odRenderTerceros(); }catch(e5){}
    try{ window.odRenderInformes && window.odRenderInformes(); }catch(e6){}
    try{ window.odRenderReportesFases && window.odRenderReportesFases(); }catch(e7){}
  }

  /* ─────────────── Alcance por rol ─────────────── */
  function applyScope(){
    var admin=isAdmin(), client=isClient();
    var ent=document.getElementById('cf-entidad');
    if(ent){
      if(admin){
        if(!ent.dataset.sgrtOriginalOptions) ent.dataset.sgrtOriginalOptions=ent.innerHTML;
        ent.innerHTML='<option value="colpensiones">'+entityLabel()+'</option>';
        ent.value='colpensiones'; ent.disabled=true;
        ent.title='El Administrador de Riesgos trabaja exclusivamente con Colpensiones';
      }else if(ent.dataset.sgrtOriginalOptions){
        ent.innerHTML=ent.dataset.sgrtOriginalOptions; ent.disabled=false;
      }
    }
    var dashEnt=document.getElementById('cls-dash-ent');
    if(dashEnt){
      if(admin || (client && norm(user().entidad).replace(/[^a-z0-9]/g,'')==='colpensiones')){
        if(!dashEnt.dataset.sgrtOriginalOptions) dashEnt.dataset.sgrtOriginalOptions=dashEnt.innerHTML;
        dashEnt.innerHTML='<option value="colpensiones">Colpensiones</option>';
        dashEnt.value='colpensiones'; dashEnt.disabled=true;
      }else if(dashEnt.dataset.sgrtOriginalOptions){
        dashEnt.innerHTML=dashEnt.dataset.sgrtOriginalOptions; dashEnt.disabled=false;
      }
    }
    var tercEnt=document.getElementById('terc-filter-entidad');
    if(tercEnt && admin){
      if(!tercEnt.dataset.sgrtOriginalOptions) tercEnt.dataset.sgrtOriginalOptions=tercEnt.innerHTML;
      tercEnt.innerHTML='<option value="colpensiones">Colpensiones</option>';
      tercEnt.value='colpensiones'; tercEnt.disabled=true;
    }else if(tercEnt && tercEnt.dataset.sgrtOriginalOptions && !admin){
      tercEnt.innerHTML=tercEnt.dataset.sgrtOriginalOptions; tercEnt.disabled=false;
    }
    var rpeOp=document.getElementById('rpe-filtro-entidad-op');
    if(rpeOp && admin){ rpeOp.innerHTML='<option value="Colpensiones">Colpensiones</option>'; rpeOp.value='Colpensiones'; rpeOp.disabled=true; rpeOp.style.display='none'; rpeOp.setAttribute('aria-label','Alcance fijo: Colpensiones'); }
    var oldCsv=document.getElementById('csv-module-correcto');
    var oldCsvBar=document.getElementById('csv-buttons-bar-correcto');
    if(admin){ if(oldCsv) oldCsv.style.display='none'; if(oldCsvBar) oldCsvBar.style.display='none'; }
    var p=document.getElementById('sgrt-admin-bulk-panel');
    if(p) p.style.display=admin ? 'block' : 'none';
    var scope=document.getElementById('sgrt-admin-scope-note');
    if(scope) scope.textContent=admin ? 'Alcance fijo del rol: Colpensiones. Los registros del Evaluador de Colpensiones se leen de la misma tabla compartida.' : '';
  }
  function withAdminDB(fn){
    if(!isAdmin()) return fn();
    var original=window.TERCEROS_DB, source=localDB(), filtered={};
    Object.keys(source).forEach(function(n){ if(source[n] && colpensiones(source[n].entidad || source[n].entidadLabel)) filtered[n]=source[n]; });
    window.TERCEROS_DB=filtered;
    try{ return fn(); }finally{ window.TERCEROS_DB=original || source; }
  }
  function guardThird(nit){
    if(!isAdmin()) return true;
    var t=localDB()[nit];
    if(t && !colpensiones(t.entidad || t.entidadLabel)){ toast('Este tercero pertenece a otra entidad y no está disponible para Colpensiones','warning'); return false; }
    return true;
  }

  /* ─────────────── Panel de importación ─────────────── */
  function panel(){
    var page=document.getElementById('pg-clasificacion'); if(!page) return null;
    var p=document.getElementById('sgrt-admin-bulk-panel');
    if(!p){
      p=document.createElement('div'); p.id='sgrt-admin-bulk-panel';
      p.style.cssText='display:none;margin:0 0 16px;background:white;border:1px solid #bfdbfe;border-radius:10px;box-shadow:0 2px 8px rgba(30,107,184,.08);overflow:hidden;';
      p.innerHTML='<div style="padding:12px 16px;background:#f4f8ff;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">'
        +'<div><div style="font-size:13px;font-weight:800;color:#1a3a5c;">Importación asistida de terceros</div><div id="sgrt-admin-scope-note" style="font-size:11px;color:#64748b;margin-top:3px;"></div></div>'
        +'<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;">'
        +'<button type="button" id="sgrt-bulk-toggle" onclick="window.sgrtToggleImportacion()" style="padding:7px 11px;background:#1e6bb8;color:white;border:0;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">📥 Importar terceros</button>'
        +'<button type="button" onclick="window.sgrtCargarDemoColpensiones()" style="padding:7px 11px;background:white;color:#1e6bb8;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">🧪 Completar demo local</button>'
        +'</div></div>'
        +'<div id="sgrt-bulk-body" style="display:none;padding:14px 16px;">'
        +'<div style="padding:10px 12px;background:#fffaf0;border:1px solid #fed7aa;border-radius:7px;font-size:11px;line-height:1.5;color:#7c2d12;margin-bottom:10px;"><b>Campos autorizados:</b> Organización/Cliente, NIT, nombre del tercero, domicilio, contratos (número, inicio, fin, objeto, estado, valor, procesos y observaciones) y supervisores (nombre, cargo, proceso y contrato asociado). La organización se valida contra Colpensiones.</div>'
        +'<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">'
        +'<button type="button" onclick="document.getElementById(\'sgrt-bulk-input\').click()" style="padding:8px 12px;background:#eff6ff;border:1px solid #93c5fd;color:#1e40af;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">📁 Seleccionar Excel / CSV / PDF</button>'
        +'<input id="sgrt-bulk-input" type="file" multiple accept=".csv,.xlsx,.xls,.pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf" style="display:none;" onchange="window.sgrtProcesarArchivosImportacion(this.files)">'
        +'<span id="sgrt-bulk-file-label" style="font-size:11px;color:#64748b;">Puedes seleccionar varios archivos. La escritura se confirma después de revisar.</span></div>'
        +'<div id="sgrt-bulk-status" style="display:none;padding:8px 10px;border-radius:6px;font-size:11px;margin-bottom:10px;"></div>'
        +'<div id="sgrt-bulk-preview" style="display:none;max-height:330px;overflow:auto;border:1px solid #e2e8f0;border-radius:7px;margin-bottom:10px;"></div>'
        +'<div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;">'
        +'<button type="button" onclick="window.sgrtLimpiarImportacion()" style="padding:8px 12px;background:white;border:1px solid #cbd5e1;color:#475569;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Limpiar vista previa</button>'
        +'<button type="button" id="sgrt-bulk-confirm" disabled onclick="window.sgrtConfirmarImportacion()" style="padding:8px 12px;background:#16a34a;color:white;border:0;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;opacity:.45;">✅ Confirmar importación válida</button></div>'
        +'</div>';
      var first=page.firstElementChild; page.insertBefore(p,first || null);
    }
    applyScope(); return p;
  }
  function setStatus(msg,type){
    var el=document.getElementById('sgrt-bulk-status'); if(!el)return;
    el.style.display='block'; el.textContent=msg;
    el.style.background=type==='error'?'#fef2f2':type==='warning'?'#fff7ed':'#f0fdf4';
    el.style.color=type==='error'?'#b91c1c':type==='warning'?'#9a3412':'#166534';
  }
  window.sgrtToggleImportacion=function(){
    if(!isAdmin()) return;
    var p=panel(), b=document.getElementById('sgrt-bulk-body'); if(!p||!b)return;
    b.style.display=b.style.display==='none'?'block':'none';
  };

  /* ─────────────── Parsing y mapeo autorizado ─────────────── */
  function val(row,names){
    var ks=Object.keys(row||{}), aliases=(names||[]).map(key);
    for(var i=0;i<aliases.length;i++){ if(row[aliases[i]] != null && String(row[aliases[i]]).trim() !== '') return row[aliases[i]]; }
    for(var j=0;j<ks.length;j++){
      var k=ks[j];
      // Evitar que los campos numerados (contrato_1_*, supervisor_1_*)
      // caigan accidentalmente en el registro base sin sufijo.
      if(/(?:^|_)\\d+(?:_|$)/.test(k) && !aliases.some(function(a){return /(?:^|_)\\d+(?:_|$)/.test(a);})) continue;
      for(var a=0;a<aliases.length;a++) if(k.indexOf(aliases[a])>=0 && row[k] != null && String(row[k]).trim()!=='') return row[k];
    }
    return '';
  }
  function allIndexed(row,pattern,limit){
    var out=[],ks=Object.keys(row||{}),max=limit||8;
    for(var i=1;i<=max;i++){
      var got='';
      for(var j=0;j<ks.length;j++) if(new RegExp(pattern.replace('{i}',String(i)),'i').test(ks[j]) && String(row[ks[j]]||'').trim()){got=row[ks[j]];break;}
      out.push(got);
    }
    return out;
  }
  function dateVal(v){
    if(v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0,10);
    if(typeof v==='number' && v>20000 && v<80000){ var d=new Date(Date.UTC(1899,11,30)+v*86400000); return d.toISOString().slice(0,10); }
    var s=String(v==null?'':v).trim(); if(!s)return '';
    var m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/); if(m)return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
    var y=s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/); if(y)return y[1]+'-'+('0'+y[2]).slice(-2)+'-'+('0'+y[3]).slice(-2);
    return s;
  }
  function contractFrom(row,i){
    var suf=i ? '_'+i : '';
    return {
      num: String(val(row,i ? ['contrato'+suf+'_numero','contrato'+suf+'_num','numero_contrato'+suf,'no_contrato'+suf] : ['numero_contrato','no_contrato','contrato_numero','contrato']) || '').trim(),
      fini: dateVal(val(row,i ? ['contrato'+suf+'_inicio','contrato'+suf+'_fecha_inicio','inicio_contrato'+suf] : ['inicio_contrato','fecha_inicio_contrato','contrato_inicio','inicio'])),
      ffin: dateVal(val(row,i ? ['contrato'+suf+'_fin','contrato'+suf+'_fecha_fin','fin_contrato'+suf] : ['fin_contrato','fecha_fin_contrato','contrato_fin','fin'])),
      objeto: String(val(row,i ? ['contrato'+suf+'_objeto','objeto_contrato'+suf] : ['objeto_contrato','contrato_objeto','objeto']) || '').trim(),
      estado: String(val(row,i ? ['contrato'+suf+'_estado','estado_contrato'+suf] : ['estado_contrato','contrato_estado','estado']) || 'En Ejecucion').trim(),
      valor: String(val(row,i ? ['contrato'+suf+'_valor','valor_contrato'+suf] : ['valor_contrato','contrato_valor','valor']) || '').trim(),
      procesos: String(val(row,i ? ['contrato'+suf+'_procesos','procesos_contrato'+suf] : ['procesos_contrato','contrato_procesos','procesos']) || '').trim(),
      observaciones: String(val(row,i ? ['contrato'+suf+'_observaciones','observaciones_contrato'+suf] : ['observaciones_contrato','contrato_observaciones','observaciones']) || '').trim()
    };
  }
  function supervisorFrom(row,i){
    var suf=i ? '_'+i : '';
    return {
      nombre:String(val(row,i ? ['supervisor'+suf+'_nombre','nombre_supervisor'+suf] : ['nombre_supervisor','supervisor_nombre','supervisor']) || '').trim(),
      cargo:String(val(row,i ? ['supervisor'+suf+'_cargo','cargo_supervisor'+suf] : ['cargo_supervisor','supervisor_cargo','cargo']) || '').trim(),
      proceso:String(val(row,i ? ['supervisor'+suf+'_proceso','proceso_supervisor'+suf] : ['proceso_supervision','supervisor_proceso','proceso']) || '').trim(),
      contrato_asociado:String(val(row,i ? ['supervisor'+suf+'_contrato','contrato_supervisor'+suf,'contrato_asociado'+suf] : ['contrato_asociado','supervisor_contrato']) || '').trim()
    };
  }
  function rawToRecord(row,source){
    row=row||{};
    var contracts=[], first=contractFrom(row,0);
    if(first.num || first.objeto || first.fini || first.ffin || first.valor || first.procesos || first.observaciones) contracts.push(first);
    for(var i=1;i<=8;i++){ var c=contractFrom(row,i); if(c.num||c.objeto||c.fini||c.ffin||c.valor||c.procesos||c.observaciones) contracts.push(c); }
    var sups=[], s0=supervisorFrom(row,0); if(s0.nombre) sups.push(s0);
    for(var j=1;j<=8;j++){ var s=supervisorFrom(row,j); if(s.nombre) sups.push(s); }
    var entity=String(val(row,['organizacion_cliente','organizacion','cliente','entidad'])||'').trim();
    var nit=String(val(row,['nit','nit_tercero','identificacion_tributaria'])||'').trim();
    var nombre=String(val(row,['nombre_del_tercero','nombre_tercero','razon_social','razon','nombre'])||'').trim();
    var domicilio=String(val(row,['domicilio','ciudad_direccion','ciudad','direccion'])||'').trim();
    return { entidadRaw:entity, entidad:'colpensiones', nit:nit, nombre:nombre, domicilio:domicilio, contratos:contracts, supervisores:sups, source:source || 'archivo' };
  }
  function splitLine(line,delim){
    var out=[],cur='',quoted=false;
    for(var i=0;i<line.length;i++){ var ch=line[i]; if(ch==='"'){ if(quoted && line[i+1]==='"'){cur+='"';i++;}else quoted=!quoted; }else if(ch===delim && !quoted){out.push(cur);cur='';}else cur+=ch; }
    out.push(cur); return out;
  }
  function parseCSVText(text,source){
    var lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(function(x){return x.trim();});
    if(!lines.length)return [];
    var sample=lines[0], choices=[',',';','\t'], delim=',';
    choices.forEach(function(d){ if(splitLine(sample,d).length > splitLine(sample,delim).length) delim=d; });
    var headers=splitLine(lines[0],delim).map(function(h){return key(h);}), out=[];
    for(var i=1;i<lines.length;i++){ var cells=splitLine(lines[i],delim),row={}; headers.forEach(function(h,j){row[h]=cells[j] == null ? '' : cells[j].trim();}); if(Object.keys(row).some(function(k){return row[k];})) out.push(rawToRecord(row,source)); }
    return out;
  }
  function ensureScript(src,ready){
    return new Promise(function(resolve,reject){
      if(window[ready]){ resolve(window[ready]); return; }
      var s=document.createElement('script'); s.src=src; s.onload=function(){ if(window[ready])resolve(window[ready]); else reject(new Error('La librería no expuso '+ready)); }; s.onerror=function(){reject(new Error('No fue posible cargar la librería desde Internet'));}; document.head.appendChild(s);
    });
  }
  function sheetJS(){
    if(window.XLSX)return Promise.resolve(window.XLSX);
    if(state.sheetPromise)return state.sheetPromise;
    state.sheetPromise = (window._evidCargarLib ? window._evidCargarLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','XLSX') : ensureScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','XLSX'));
    return state.sheetPromise;
  }
  function readBuffer(file,asText){
    return new Promise(function(resolve,reject){ var r=new FileReader(); r.onload=function(){resolve(r.result);}; r.onerror=function(){reject(new Error('No se pudo leer '+file.name));}; asText?r.readAsText(file):r.readAsArrayBuffer(file); });
  }
  function parseExcelFile(file){ return sheetJS().then(function(XLSX){ return readBuffer(file,false).then(function(buf){ var wb=XLSX.read(buf,{type:'array',cellDates:true}); var out=[]; (wb.SheetNames||[]).forEach(function(name){ var rows=XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:'',raw:false}); rows.forEach(function(row){out.push(rawToRecord(row,file.name+' · '+name));}); }); return out; }); }); }
  function pdfJS(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    if(state.pdfPromise)return state.pdfPromise;
    state.pdfPromise=ensureScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','pdfjsLib').then(function(pdf){ try{pdf.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}catch(e){} return pdf; });
    return state.pdfPromise;
  }
  function parsePdfFile(file){
    return pdfJS().then(function(pdf){ return readBuffer(file,false).then(function(buf){ return pdf.getDocument({data:buf}).promise.then(function(doc){ var pages=[]; function next(i){ if(i>doc.numPages)return Promise.resolve(pages.join('\n')); return doc.getPage(i).then(function(pg){return pg.getTextContent().then(function(tc){pages.push(tc.items.map(function(x){return x.str;}).join(' ')); return next(i+1);});}); } return next(1); }).then(function(text){ return [pdfTextRecord(text,file.name)]; }); }); });
  }
  function pdfCanonical(text){
    var s=String(text||'').replace(/\u00a0/g,' ').replace(/\r/g,'\n');
    // PDF.js suele devolver cada elemento de una línea separado por espacios.
    // Insertamos saltos antes de etiquetas conocidas para que cada valor termine
    // en la siguiente etiqueta y no absorba el resto de la página.
    var marks=[
      'procesos\\s+que\\s+soporta(?:\\s+el\\s+contrato)?','observaciones\\s+del\\s+contrato','fecha\\s+de\\s+terminaci[oó]n','fecha\\s+de\\s+inicio','fecha\\s+de\\s+fin',
      'organizaci[oó]n\\s*[/ ]?\\s*cliente','nombre\\s+del\\s+tercero','raz[oó]n\\s+social','n[uú]mero\\s+de\\s+contrato','no\\.\\s*contrato','contrato\\s+asociado',
      'nombre\\s+supervisor','proceso\\s+de\\s+supervisi[oó]n','domicilio','direcci[oó]n','ciudad','inicio','terminaci[oó]n','fin','objeto','estado','valor','observaciones','supervisor','cargo','proceso','entidad','cliente','N\\.?I\\.?T\\.?','NIT'
    ];
    var re=new RegExp('(^|\\s)('+marks.join('|')+')\\s*[:#-]?\\s*','gi');
    return s.replace(re,function(full,pre,label){return pre+'\n'+label+': ';});
  }
  function labeled(text,labels){ var lines=String(text||'').split(/\n|\r/); for(var i=0;i<lines.length;i++){ for(var j=0;j<labels.length;j++){ var re=new RegExp(labels[j]+'\\s*[:#-]?\\s*(.+)$','i'),m=lines[i].match(re); if(m && m[1].trim())return m[1].trim(); } } return ''; }
  function pdfTextRecord(text,source){
    var normalized=pdfCanonical(text),row={};
    var nit=(normalized.match(/(?:NIT|N\.I\.T\.?)\s*[:#-]?\s*([0-9][0-9.\- ]{5,})/i)||[])[1]||labeled(normalized,['nit']);
    row.organizacion=labeled(normalized,['organizaci[oó]n\\s*[/ ]?\\s*cliente','entidad','cliente']);
    row.nit=nit; row.nombre_tercero=labeled(normalized,['nombre\\s+del\\s+tercero','raz[oó]n\\s+social','nombre\\s+del\\s+proveedor','nombre\\s+del\\s+contratista']); row.domicilio=labeled(normalized,['domicilio','ciudad[, ]+direcci[oó]n','direcci[oó]n']);
    row.numero_contrato=(normalized.match(/(?:contrato|no\.\s*contrato|n[uú]mero\\s*de\\s*contrato)\s*[:#-]?\s*([A-Z]{2,}[\-\/]\d{2,}[\-\/]\d{1,})/i)||[])[1]||labeled(normalized,['n[uú]mero\\s+de\\s+contrato','no\\.\\s*contrato','contrato']);
    row.inicio_contrato=labeled(normalized,['inicio','fecha\\s+de\\s+inicio']); row.fin_contrato=labeled(normalized,['fin','fecha\\s+de\\s+terminaci[oó]n','fecha\\s+de\\s+fin']); row.objeto_contrato=labeled(normalized,['objeto']); row.estado_contrato=labeled(normalized,['estado']); row.valor_contrato=labeled(normalized,['valor']); row.procesos_contrato=labeled(normalized,['procesos?\\s+que\\s+soporta','procesos']); row.observaciones_contrato=labeled(normalized,['observaciones']);
    row.nombre_supervisor=labeled(normalized,['nombre\\s+supervisor','supervisor']); row.cargo_supervisor=labeled(normalized,['cargo']); row.proceso_supervision=labeled(normalized,['proceso\\s+de\\s+supervisi[oó]n','proceso\\s+de\\s+supervisio']); row.contrato_asociado=labeled(normalized,['contrato\\s+asociado']);
    return rawToRecord(row,source+' · PDF texto');
  }
  function parseFile(file){
    var ext=String(file.name||'').toLowerCase().split('.').pop();
    if(ext==='csv') return readBuffer(file,true).then(function(txt){return parseCSVText(txt,file.name);});
    if(ext==='xlsx'||ext==='xls') return parseExcelFile(file);
    if(ext==='pdf') return parsePdfFile(file);
    return Promise.reject(new Error('Formato no permitido: '+file.name));
  }
  function normalizeRecord(r){
    r=clone(r)||{}; r.nit=String(r.nit||'').trim(); r.nombre=String(r.nombre||'').trim(); r.domicilio=String(r.domicilio||'').trim();
    r.contratos=(r.contratos||[]).map(function(c){return {num:String(c.num||'').trim(),fini:dateVal(c.fini),ffin:dateVal(c.ffin),objeto:String(c.objeto||'').trim(),estado:String(c.estado||'En Ejecucion').trim()||'En Ejecucion',valor:String(c.valor||'').trim(),procesos:String(c.procesos||'').trim(),observaciones:String(c.observaciones||'').trim()};}).filter(function(c){return c.num||c.objeto||c.fini||c.ffin||c.valor||c.procesos||c.observaciones;});
    r.supervisores=(r.supervisores||[]).map(function(s){return {nombre:String(s.nombre||'').trim(),cargo:String(s.cargo||'').trim(),proceso:String(s.proceso||'').trim(),contrato_asociado:String(s.contrato_asociado||'').trim()};}).filter(function(s){return s.nombre;});
    return r;
  }
  function validate(r,seen){
    var errors=[],warnings=[]; r=normalizeRecord(r);
    if(!r.nit) errors.push('Falta NIT');
    else if(!/^\d[\d.\-\s]{5,}$/.test(r.nit)) errors.push('NIT con formato no reconocido');
    if(!r.nombre) errors.push('Falta nombre del tercero');
    if(r.entidadRaw && !colpensiones(r.entidadRaw)) errors.push('La organización indicada no es Colpensiones');
    var nk=norm(r.nit).replace(/\s/g,'');
    if(seen[nk]) errors.push('NIT repetido dentro del lote'); else seen[nk]=true;
    if(r.contratos.length===0) warnings.push('Sin contrato detectado');
    if(r.supervisores.length===0) warnings.push('Sin supervisor detectado');
    if(r.supervisores.some(function(s){return !s.cargo||!s.proceso||!s.contrato_asociado;})) warnings.push('Algún supervisor está incompleto');
    r.errors=errors; r.warnings=warnings; r.valid=!errors.length; return r;
  }
  function renderPreview(){
    var wrap=document.getElementById('sgrt-bulk-preview'), btn=document.getElementById('sgrt-bulk-confirm'); if(!wrap)return;
    var rows=state.records||[], valid=rows.filter(function(r){return r.valid;}).length;
    wrap.style.display=rows.length?'block':'none';
    if(btn){btn.disabled=!valid;btn.style.opacity=valid?'1':'.45';}
    if(!rows.length){wrap.innerHTML='';return;}
    var h='<table style="width:100%;border-collapse:collapse;font-size:10.5px;min-width:780px;"><thead><tr style="background:#1a3a5c;color:white;"><th style="padding:7px;text-align:left;">Estado</th><th style="padding:7px;text-align:left;">NIT</th><th style="padding:7px;text-align:left;">Tercero</th><th style="padding:7px;text-align:left;">Domicilio</th><th style="padding:7px;text-align:left;">Contratos</th><th style="padding:7px;text-align:left;">Supervisores</th><th style="padding:7px;text-align:left;">Observaciones</th></tr></thead><tbody>';
    rows.forEach(function(r,i){ var err=(r.errors||[]).concat(r.warnings||[]), ok=r.valid; h+='<tr style="background:'+(ok?(i%2?'#f8fbff':'white'):'#fff1f2')+';border-bottom:1px solid #e2e8f0;"><td style="padding:7px;color:'+(ok?'#15803d':'#b91c1c')+';font-weight:800;">'+(ok?'Listo':'Revisar')+'</td><td style="padding:7px;font-weight:700;">'+esc(r.nit||'—')+'</td><td style="padding:7px;">'+esc(r.nombre||'—')+'</td><td style="padding:7px;">'+esc(r.domicilio||'—')+'</td><td style="padding:7px;">'+r.contratos.length+(r.contratos[0]&&r.contratos[0].num?' · '+esc(r.contratos[0].num):'')+'</td><td style="padding:7px;">'+r.supervisores.length+(r.supervisores[0]?' · '+esc(r.supervisores[0].nombre):'')+'</td><td style="padding:7px;color:#64748b;">'+esc(err.join(' · ')||'Campos autorizados detectados')+'</td></tr>'; });
    wrap.innerHTML=h+'</tbody></table><div style="padding:8px 10px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:10.5px;color:#475569;">'+valid+' registro(s) listo(s) para confirmar · '+(rows.length-valid)+' con observaciones o errores. Nada se guarda hasta pulsar “Confirmar importación válida”.</div>';
  }
  window.sgrtProcesarArchivosImportacion=function(files){
    if(!isAdmin()||!files||!files.length)return;
    state.processing=true; state.records=[]; state.rejected=[]; state.files=Array.from(files).map(function(f){return f.name;});
    var label=document.getElementById('sgrt-bulk-file-label'); if(label)label.textContent=state.files.length+' archivo(s) seleccionado(s). Extrayendo…';
    setStatus('Leyendo archivos localmente. Excel usa SheetJS; PDF usa extracción de texto seleccionable. Los PDF escaneados requieren OCR/backend seguro.','warning');
    Promise.all(Array.from(files).map(parseFile)).then(function(groups){
      var flat=[]; groups.forEach(function(g){flat=flat.concat(g||[]);}); var seen={},all=[];
      flat.forEach(function(r){all.push(validate(r,seen));}); state.records=all; state.processing=false; renderPreview();
      var ok=all.filter(function(r){return r.valid;}).length; if(label)label.textContent=state.files.length+' archivo(s) · '+all.length+' registro(s) detectado(s)';
      setStatus(ok+' registro(s) válido(s) para revisión. Confirma solo después de verificar la tabla.','success');
    }).catch(function(err){state.processing=false;state.records=[];renderPreview();setStatus('No se pudo extraer el lote: '+(err.message||err),'error');if(label)label.textContent='Error de lectura; revisa formato o conexión para cargar librerías.';});
  };
  window.sgrtLimpiarImportacion=function(){ state.records=[];state.rejected=[];state.files=[];renderPreview();var label=document.getElementById('sgrt-bulk-file-label');if(label)label.textContent='Puedes seleccionar varios archivos. La escritura se confirma después de revisar.';var st=document.getElementById('sgrt-bulk-status');if(st)st.style.display='none';var inp=document.getElementById('sgrt-bulk-input');if(inp)inp.value=''; };
  window.sgrtConfirmarImportacion=function(){
    if(!isAdmin()||state.processing)return;
    var db=window.TERCEROS_DB||localDB(),resp=window.CUEST_RESPUESTAS||localResponses(), added=0, skipped=0, errors=0;
    var existing={}; Object.keys(db).forEach(function(k){existing[norm(k).replace(/\s/g,'')]=true;});
    (state.records||[]).forEach(function(r){
      if(!r.valid){errors++;return;} var nk=norm(r.nit).replace(/\s/g,''); if(existing[nk]){skipped++;return;}
      var cons=r.contratos.map(function(c){return Object.assign({supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisor_asociado:''},c);});
      r.supervisores.forEach(function(s){ var c=cons.find(function(x){return x.num && x.num===s.contrato_asociado;}); if(c){c.supervisor=s.nombre;c.supervisorCargo=s.cargo;c.procesoSupervision=s.proceso;c.supervisor_asociado=s.nombre;} });
      var t={nit:r.nit,nombre:r.nombre,nombre_tercero:r.nombre,entidad:'colpensiones',entidadLabel:entityLabel(),domicilio:r.domicilio,servicio:cons[0] ? (cons[0].objeto||cons[0].procesos||'') : '',supervisor:r.supervisores[0] ? r.supervisores[0].nombre : '',supervisores:r.supervisores,contratos:cons,estado:'Activo',fecha_creacion:new Date().toISOString(),origen:'importacion_asistida',origenArchivo:r.source,demo:false,localOnly:true,sincronizado:false};
      db[r.nit]=t; existing[nk]=true; added++;
    });
    window.TERCEROS_DB=db;window.CUEST_RESPUESTAS=resp;window.MATRIZ_DB=window.MATRIZ_DB||localMatrix();persistLocalOnly();refreshViews();
    setStatus('Importación terminada: '+added+' agregado(s), '+skipped+' existente(s) omitido(s), '+errors+' registro(s) con errores. Datos guardados solo en localStorage; no se envió nada a Azure.','success');
    toast(added+' tercero(s) importado(s) para Colpensiones','success');
    var b=document.getElementById('sgrt-bulk-confirm');if(b){b.disabled=true;b.style.opacity='.45';} state.records=[];renderPreview();
  };

  /* ─────────────── Demostración integral local ─────────────── */
  function tipName(k){ try{ return window.SECCIONES_INFO && window.SECCIONES_INFO[k] ? window.SECCIONES_INFO[k].label : k; }catch(e){return k;} }
  function controlList(nit,k){
    try{ if(window._ctrlsCuest){ var a=window._ctrlsCuest(nit,k); if(Array.isArray(a)&&a.length)return a; } }catch(e){}
    try{ if(typeof CUESTIONARIO_CONTROLES!=='undefined' && CUESTIONARIO_CONTROLES[k])return CUESTIONARIO_CONTROLES[k]; }catch(e2){}
    return [];
  }
  function demoResponses(nit,dims,name){
    var out={__savedAt:new Date().toISOString(),__nombre:name};
    dims.forEach(function(d){ var rows={}; controlList(nit,d.key).forEach(function(c,idx){var n=c.n==null?idx+1:c.n;rows[n]={a1:'Si',a2:'Si',a3:'Si',a4:'Si',a5:'Si',a6:'Si',a7:'Si',obs:'Respuesta demostrativa local para validar el flujo SGRT.'};}); out[d.key]=rows; });
    return out;
  }
  function addEvidence(nit,name,origin,content){
    var root;try{root=JSON.parse(localStorage.getItem('od_sgrt_v8')||'null');}catch(e){}
    if(!root || typeof root!=='object') root={id:'root',type:'folder',children:[]}; root.children=root.children||[];
    function folder(parent,id,label){var f=(parent.children||[]).find(function(x){return x.id===id || (x.type==='folder'&&x.name===label);});if(!f){f={id:id,name:label,type:'folder',children:[]};parent.children.push(f);}f.children=f.children||[];return f;}
    var target=folder(root,'demo-tercero-'+nit,'Tercero '+nit), f1=folder(target,'demo-documentacion-'+nit,'Documentación'), f2=folder(target,'demo-informes-'+nit,'Informes');
    [f1,f2].forEach(function(f){ if(!(f.children||[]).some(function(x){return x.name===name;})){f.children.push({id:'demo-file-'+nit+'-'+key(name),name:name,type:'file',size:content.length,fecha:new Date().toLocaleDateString('es-CO'),dataURL:'data:text/plain;charset=utf-8,'+encodeURIComponent(content),tercero:nit,nit:nit,terceroNit:nit,entidad:'colpensiones',_origen:origin,localOnly:true});} });
    try{localStorage.setItem('od_sgrt_v8',JSON.stringify(root));}catch(e2){}
  }
  function demoThirds(){
    return [
      {nit:'901.900.001-1',nombre:'Servicios Archivísticos Andinos S.A.S. (DEMO)',domicilio:'Bogotá D.C. · Calle 72 # 10-45',prom:4.3,zona:'EXTREMO',contratos:[{num:'CON-DEMO-2026-001',fini:'2026-01-15',ffin:'2026-12-31',objeto:'Gestión y custodia demostrativa de expedientes pensionales',estado:'En Ejecucion',valor:'480.000.000,00',procesos:'P-01 Gestión Documental, P-03 Seguimiento y Monitoreo, P-05 Atención al Ciudadano',observaciones:'Contrato de demostración local; no representa una obligación contractual real.',supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisor_asociado:''},{num:'CON-DEMO-2026-002',fini:'2026-03-01',ffin:'2026-11-30',objeto:'Digitalización y control de calidad de archivos',estado:'En Ejecucion',valor:'125.000.000,00',procesos:'P-02 Tecnología, P-04 Calidad',observaciones:'Segundo contrato demostrativo asociado al mismo tercero.',supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisor_asociado:''}],supervisores:[{nombre:'Laura Marcela Gómez (DEMO)',cargo:'Gerente de Riesgos del Tercero',proceso:'P-01, P-03, Control Interno',contrato_asociado:'CON-DEMO-2026-001'},{nombre:'Andrés Felipe Rojas (DEMO)',cargo:'Líder de Continuidad',proceso:'P-02, P-04',contrato_asociado:'CON-DEMO-2026-002'}],risk:'Interrupción de la custodia documental y pérdida de trazabilidad',treatment:'REDUCIR (TRANSFERIR O MITIGAR)'},
      {nit:'901.900.002-8',nombre:'Tecnologías de Gestión Pensional S.A.S. (DEMO)',domicilio:'Medellín · Carrera 43A # 16-20',prom:3.6,zona:'ALTO',contratos:[{num:'CON-DEMO-2026-003',fini:'2026-02-01',ffin:'2026-10-31',objeto:'Soporte demostrativo para plataforma de gestión pensional',estado:'En Ejecucion',valor:'310.500.000,00',procesos:'P-02 Tecnología, P-03 Operación, P-05 Soporte',observaciones:'Registro local para probar clasificación, AC, matriz y seguimiento.',supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisor_asociado:''}],supervisores:[{nombre:'Natalia Pérez Salcedo (DEMO)',cargo:'Directora de Operaciones',proceso:'P-02 Tecnología y P-03 Operación',contrato_asociado:'CON-DEMO-2026-003'}],risk:'Falla de disponibilidad de la plataforma de gestión',treatment:'REDUCIR (TRANSFERIR O MITIGAR)'},
      {nit:'901.900.003-5',nombre:'Consultoría de Continuidad Operativa S.A.S. (DEMO)',domicilio:'Cali · Avenida 6N # 24-10',prom:2.8,zona:'BAJO',contratos:[{num:'CON-DEMO-2026-004',fini:'2026-04-01',ffin:'2026-09-30',objeto:'Acompañamiento demostrativo en continuidad y recuperación',estado:'Terminado',valor:'96.000.000,00',procesos:'P-03 Continuidad, P-04 Gestión de Incidentes',observaciones:'Demostración local con estado Terminado para validar seguimiento.',supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisor_asociado:''}],supervisores:[{nombre:'Camilo Torres Mejía (DEMO)',cargo:'Consultor Principal',proceso:'P-03 Continuidad y P-04 Incidentes',contrato_asociado:'CON-DEMO-2026-004'}],risk:'Demora en actualización de planes de recuperación',treatment:'ACEPTAR'}
    ];
  }
  function seedDemo(force){
    if(!isAdmin())return {added:0};
    var db=window.TERCEROS_DB||localDB(),resp=window.CUEST_RESPUESTAS||localResponses(),mx=window.MATRIZ_DB||localMatrix(),added=0;
    demoThirds().forEach(function(d,idx){
      if(db[d.nit])return;
      var dims=['op','cn','si','cu','fr','laft'].map(function(k,j){return {key:k,nombre:tipName(k),val:String(Math.max(1,Math.min(5,Math.round(d.prom-(j%2)*.3))))};});
      var cons=clone(d.contratos); d.supervisores.forEach(function(s){var c=cons.find(function(x){return x.num===s.contrato_asociado;});if(c){c.supervisor=s.nombre;c.supervisorCargo=s.cargo;c.procesoSupervision=s.proceso;c.supervisor_asociado=s.nombre;}});
      var t={nit:d.nit,nombre:d.nombre,nombre_tercero:d.nombre,entidad:'colpensiones',entidadLabel:entityLabel(),domicilio:d.domicilio,servicio:cons[0].objeto,supervisor:d.supervisores[0].nombre,supervisores:d.supervisores,contratos:cons,estado:'Activo',fecha_creacion:new Date().toISOString(),prom:d.prom,promAC:5,promAC_porTip:{},acAvance:100,clasificacion:d.zona,zona:d.zona,nivel_riesgo:d.zona,periodicidad:d.zona==='EXTREMO'?'Trimestral':d.zona==='ALTO'?'Semestral':'Anual',dims:dims,demo:true,localOnly:true,sincronizado:false,origen:'demo_integral_colpensiones'};
      dims.forEach(function(x){t.promAC_porTip[x.key]=5;}); db[d.nit]=t; resp[d.nit]=demoResponses(d.nit,dims,d.nombre);
      var r1={id:'R-DEMO-'+(idx+1),ref:'R-DEMO-'+(idx+1),nit:d.nit,tercero:d.nombre,nombreTercero:d.nombre,tipologia:'op',tipo:'Riesgo Operacional',riesgo:d.risk,desc:d.risk,factor:'Operación y tecnología',causa:'Dependencia de controles y disponibilidad del servicio',probInh:idx===0?'Alta':idx===1?'Alta':'Media',impInh:idx===0?'Alta':'Media',zonaInh:idx===0?'EXTREMO':idx===1?'ALTO':'MEDIO',inherente:idx===0?'EXTREMO':idx===1?'ALTO':'MEDIO',probRes:'Media',impRes:'Media',zonaRes:idx===0?'ALTO':idx===1?'MEDIO':'BAJO',residual:idx===0?'ALTO':idx===1?'MEDIO':'BAJO',control:'Control de continuidad y monitoreo periódico',tratamiento:d.treatment,accion:d.treatment,resp:'Responsable de Riesgo del Tercero',responsable:'Responsable de Riesgo del Tercero',plan:'Revisar controles, documentar evidencias y ejecutar prueba de seguimiento.',estado:idx===2?'Cerrado':'En Gestión',fechaSeg:idx===2?'2026-09-15':'2026-11-30',descSeg:'Seguimiento demostrativo registrado localmente.',observaciones:'Fila demo integral; no representa un riesgo contractual real.'};
      mx.push(r1); added++;
      addEvidence(d.nit,'Evidencia_AC_'+(idx+1)+'.txt','Ambiente de Control','Evidencia local demostrativa de respuestas de Ambiente de Control para '+d.nombre+'.');
      addEvidence(d.nit,'Matriz_Riesgos_'+(idx+1)+'.txt','Matriz de Riesgos','Registro local demostrativo: '+d.risk+' · Tratamiento: '+d.treatment+'.');
      addEvidence(d.nit,'Informe_SGRT_'+(idx+1)+'.txt','Informe automático','Informe local demostrativo preparado para validar el flujo compartido Evaluador / Administrador.');
    });
    window.TERCEROS_DB=db;window.CUEST_RESPUESTAS=resp;window.MATRIZ_DB=mx;
    if(added){persistLocalOnly();try{localStorage.setItem(DEMO_KEY,'1');}catch(e){}refreshViews();}
    return {added:added};
  }
  window.sgrtCargarDemoColpensiones=function(){ if(!isAdmin())return; var r=seedDemo(true); toast(r.added?'Se agregaron '+r.added+' terceros demo integrales de Colpensiones. Datos locales; Azure no fue modificado.':'Los demos ya existen; no se sobrescribieron registros.','success'); refreshViews(); };

  /* ─────────────── Snapshot operativo filtrado y Power BI ─────────────── */
  function baseSnapshot(){ try{ if(window._sgrtCierreSnapshot) return window._sgrtCierreSnapshot(); }catch(e){} return {terceros:Object.values(localDB()),entities:[],riskRows:[],respuestas:localResponses(),matriz:localMatrix(),documentos:{total:0,byNit:{}},classification:{EXTREMO:0,ALTO:0,MEDIO:0,BAJO:0},acTotal:0,total:0}; }
  function filteredSnapshot(){
    var s=baseSnapshot(); if(!isAdmin())return s;
    var ts=(s.terceros||[]).filter(function(t){return colpensiones(t.entidad||t.entidadLabel);}), nits={}; ts.forEach(function(t){nits[String(t.nit)]=true;});
    var mx=(s.matriz||[]).filter(function(r){return nits[String(r.nit||r.terceroNit)] || ts.some(function(t){return norm(t.nombre)===norm(r.tercero||r.nombreTercero);});});
    var rs={};Object.keys(s.respuestas||{}).forEach(function(k){if(nits[k])rs[k]=s.respuestas[k];});
    var risks=(s.riskRows||[]).filter(function(x){return x.t && nits[String(x.t.nit)];});
    var docs=s.documentos||{total:0,byNit:{}};var byNit={};ts.forEach(function(t){byNit[t.nit]=(docs.byNit||{})[t.nit]||0;});var totalDocs=Object.keys(byNit).reduce(function(a,k){return a+byNit[k];},0);
    var e=(s.entities||[]).find(function(x){return norm(x.id)==='colpensiones'||norm(x.nombre).indexOf('colpensiones')>=0;});
    var ent={id:'colpensiones',nombre:'Colpensiones',terceros:ts,riesgos:mx,conAC:ts.filter(function(t){return rs[t.nit]&&Object.keys(rs[t.nit]).length;}).length,clasificados:ts.filter(function(t){return parseFloat(t.prom||0)>0||t.zona;}).length,documentos:totalDocs,riskCounts:{EXTREMO:0,ALTO:0,MEDIO:0,BAJO:0}};
    mx.forEach(function(r){var l=String(r.zonaInh||r.inherente||'').toUpperCase();if(l.indexOf('EXTREMO')>=0||l.indexOf('CRITICO')>=0)ent.riskCounts.EXTREMO++;else if(l.indexOf('ALTO')>=0)ent.riskCounts.ALTO++;else if(l.indexOf('MEDIO')>=0)ent.riskCounts.MEDIO++;else ent.riskCounts.BAJO++;});
    var cls={EXTREMO:0,ALTO:0,MEDIO:0,BAJO:0};ts.forEach(function(t){var z=String(t.zona||t.exposicion||'').toUpperCase();if(z.indexOf('EXTREMO')>=0||z.indexOf('CRITICO')>=0)cls.EXTREMO++;else if(z.indexOf('ALTO')>=0)cls.ALTO++;else if(z.indexOf('MEDIO')>=0)cls.MEDIO++;else cls.BAJO++;});
    return {terceros:ts,respuestas:rs,matriz:mx,documentos:{total:totalDocs,byNit:byNit},entities:[ent],riskRows:risks,classification:cls,acTotal:ent.conAC,total:ts.length};
  }
  function download(name,content,mime){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:mime}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(a.href);},700);}
  function exportRows(s){
    var rows=[];(s.terceros||[]).forEach(function(t){var risks=(s.riskRows||[]).filter(function(x){return x.t&&x.t.nit===t.nit;});if(!risks.length)risks=[{r:{},t:t,inherente:'',residual:''}];risks.forEach(function(x){var r=x.r||{},resp=s.respuestas[t.nit]||{};rows.push({Entidad:'Colpensiones',NIT:t.nit,Tercero:t.nombre||'',Domicilio:t.domicilio||'',Estado:t.estado||'',Puntaje:t.prom!=null?Number(t.prom).toFixed(2):'',Exposicion:t.zona||t.exposicion||'',Respuestas_AC:Object.keys(resp).filter(function(k){return k.indexOf('__')!==0;}).length,Contratos:(t.contratos||[]).length,Supervisores:(t.supervisores||[]).length,Documentos:(s.documentos.byNit||{})[t.nit]||0,Tipologia:r.tipologia||r.tipo||'',Riesgo:r.riesgo||r.desc||'',Inherente:x.inherente||r.zonaInh||'',Residual:x.residual||r.zonaRes||'',Tratamiento:r.tratamiento||r.accion||''});});});return rows;
  }
  function csvCell(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}
  function adminHtml(s){var rows=exportRows(s),head=Object.keys(rows[0]||{Entidad:'',NIT:'',Tercero:''});return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>SGRT · Power BI · Colpensiones</title><style>body{font-family:Arial,Calibri,sans-serif;margin:28px;color:#243447;background:#f7fafc}h1{color:#1a3a5c}h2{color:#1e6bb8;border-bottom:2px solid #bfdbfe;padding-bottom:6px}table{width:100%;border-collapse:collapse;background:white;font-size:11px;margin:10px 0 22px}th{background:#1a3a5c;color:white;padding:8px;text-align:left}td{border:1px solid #dbe3ea;padding:7px}p{color:#64748b;font-size:12px}</style></head><body><h1>SGRT · Tablas para Power BI · Colpensiones</h1><p>Alcance fijo del Administrador de Riesgos. Generado localmente el '+new Date().toLocaleString('es-CO')+'.</p><h2>Indicadores</h2><p><b>Terceros:</b> '+s.total+' · <b>Riesgos:</b> '+s.riskRows.length+' · <b>Documentos:</b> '+s.documentos.total+' · <b>AC:</b> '+s.acTotal+'</p><h2>Detalle</h2><table><thead><tr>'+head.map(function(k){return'<th>'+esc(k)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return'<tr>'+head.map(function(k){return'<td>'+esc(r[k])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></body></html>';}
  function renderPowerBI(){
    if(!isAdmin())return; var w=document.getElementById('rpe-wrap-op'); if(!w)return; var old=document.getElementById('admin-powerbi-graficas');if(old)old.remove();var s=filteredSnapshot(),e=s.entities[0]||{nombre:'Colpensiones',riesgos:[],terceros:[]},rc=s.riskRows.length?{EXTREMO:0,ALTO:0,MEDIO:0,BAJO:0}:s.classification;
    if(s.riskRows.length)s.riskRows.forEach(function(x){var l=String(x.inherente||'').toUpperCase();if(l.indexOf('EXTREMO')>=0||l.indexOf('CRITICO')>=0)rc.EXTREMO++;else if(l.indexOf('ALTO')>=0)rc.ALTO++;else if(l.indexOf('MEDIO')>=0)rc.MEDIO++;else rc.BAJO++;});
    w.insertAdjacentHTML('afterbegin','<div id="admin-powerbi-graficas" class="card" style="margin-bottom:16px;border-left:4px solid #1e6bb8;"><div class="card-hdr" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;"><div><h3 style="margin:0;color:#1a3a5c;">📊 Gráficas Power BI · Colpensiones</h3><div class="sub">Datos consolidados del Evaluador y del Administrador de Riesgos. No incluye Ecopetrol ni otras entidades.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><button onclick="window.descargarDatosPowerBIAdmin(\'csv\')" class="btn btn-outline btn-sm">⬇ CSV para Power BI</button><button onclick="window.descargarDatosPowerBIAdmin(\'json\')" class="btn btn-outline btn-sm">⬇ JSON</button><button onclick="window.descargarDatosPowerBIAdmin(\'html\')" class="btn btn-outline btn-sm">⬇ Tablas HTML</button></div></div><div style="padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;"><div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:290px;"><div style="font-size:12px;font-weight:700;color:#1a3a5c;margin-bottom:8px;">Gráfica de torta · exposición</div><div style="height:245px;position:relative;"><canvas id="admin-chart-exposicion"></canvas></div></div><div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;min-height:290px;"><div style="font-size:12px;font-weight:700;color:#1a3a5c;margin-bottom:8px;">Terceros y riesgos · Colpensiones</div><div style="height:245px;position:relative;"><canvas id="admin-chart-entidades"></canvas></div></div></div><div style="font-size:11px;color:#64748b;padding:0 14px 13px;">La torta usa la calificación de matriz cuando existe y la clasificación del tercero cuando no existe matriz. El archivo exportado contiene únicamente Colpensiones.</div></div>');
    try{window._sgrtCharts=window._sgrtCharts||{};Object.keys(window._sgrtCharts).forEach(function(k){try{window._sgrtCharts[k].destroy();}catch(e2){}});if(window.Chart){var c1=document.getElementById('admin-chart-exposicion'),c2=document.getElementById('admin-chart-entidades');if(c1)window._sgrtCharts.pie=new Chart(c1.getContext('2d'),{type:'pie',data:{labels:['Extremo','Alto','Medio','Bajo'],datasets:[{data:[rc.EXTREMO,rc.ALTO,rc.MEDIO,rc.BAJO],backgroundColor:['#dc3545','#fd7e14','#fbbf24','#22c55e'],borderColor:'#fff',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});if(c2)window._sgrtCharts.bar=new Chart(c2.getContext('2d'),{type:'bar',data:{labels:['Colpensiones'],datasets:[{label:'Riesgos',data:[e.riesgos.length],backgroundColor:'#dc3545'},{label:'Terceros',data:[e.terceros.length],backgroundColor:'#1e6bb8'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,ticks:{precision:0}}},plugins:{legend:{position:'bottom'}}}});}}
    catch(err){console.warn('SGRT Power BI Colpensiones:',err);}
  }
  window.descargarDatosPowerBIAdmin=function(kind){ if(!isAdmin()){toast('Disponible solo para Administrador de Riesgos','info');return;} var s=filteredSnapshot(),rows=exportRows(s),today=new Date().toISOString().slice(0,10); if(kind==='json')download('SGRT_PowerBI_Colpensiones_'+today+'.json',JSON.stringify(rows,null,2),'application/json;charset=utf-8'); else if(kind==='html')download('SGRT_PowerBI_Colpensiones_'+today+'.html',adminHtml(s),'text/html;charset=utf-8'); else {var h=Object.keys(rows[0]||{Entidad:'',NIT:'',Tercero:''}),out='\ufeff'+h.map(csvCell).join(';')+'\n'+rows.map(function(r){return h.map(function(k){return csvCell(r[k]);}).join(';');}).join('\n');download('SGRT_PowerBI_Colpensiones_'+today+'.csv',out,'text/csv;charset=utf-8');}toast('Exportación preparada solo con datos de Colpensiones','success'); };

  /* ─────────────── Ganchos defensivos ─────────────── */
  function wrapOnce(name,fn,flag){ if(!window[name] || window[flag])return; var old=window[name]; window[name]=fn(old); window[flag]=true; }
  function hook(){
    panel();applyScope();
    wrapOnce('guardarClasif',function(old){return function(){if(isAdmin()){var e=document.getElementById('cf-entidad');if(e){e.value='colpensiones';e.disabled=false;} }var r=old.apply(this,arguments);applyScope();return r;};},'_sgrt21GuardarClasif');
    wrapOnce('renderReportesPorEntidadOp',function(old){return function(){applyScope();if(!isAdmin())return old.apply(this,arguments);var original=window.TERCEROS_DB,source=localDB(),filtered={};Object.keys(source).forEach(function(n){if(source[n]&&colpensiones(source[n].entidad||source[n].entidadLabel)){var t=clone(source[n]);t.entidad='Colpensiones';t.entidadLabel='Colpensiones';filtered[n]=t;}});window.TERCEROS_DB=filtered;var r;try{r=old.apply(this,arguments);}finally{window.TERCEROS_DB=original||source;}setTimeout(function(){applyScope();renderPowerBI();},100);return r;};},'_sgrt21ReportesOp');
    wrapOnce('renderReportes',function(old){return function(){return withAdminDB(function(){return old.apply(this,arguments);});};},'_sgrt21Reportes');
    wrapOnce('exportCSV',function(old){return function(){return withAdminDB(function(){return old.apply(this,arguments);});};},'_sgrt21ExportCSV');
    wrapOnce('odRenderTerceros',function(old){return function(){return withAdminDB(function(){return old.apply(this,arguments);});};},'_sgrt21OdTerceros');
    wrapOnce('odRenderInformes',function(old){return function(){return withAdminDB(function(){return old.apply(this,arguments);});};},'_sgrt21OdInformes');
    wrapOnce('odRenderReportesFases',function(old){return function(){return withAdminDB(function(){return old.apply(this,arguments);});};},'_sgrt21OdFases');
    wrapOnce('odAbrirTercero',function(old){return function(nit){if(!guardThird(nit))return;return old.apply(this,arguments);};},'_sgrt21OdOpen');
    wrapOnce('odDlInforme',function(old){return function(nit){if(!guardThird(nit))return;return old.apply(this,arguments);};},'_sgrt21OdDl');
    wrapOnce('goPageIS',function(old){return function(pg){var r=old.apply(this,arguments);setTimeout(function(){if(isIS())return;applyScope();},100);return r;};},'_sgrt21GoPageIS');
    wrapOnce('doLogin',function(old){return function(){var r=old.apply(this,arguments);setTimeout(function(){applyScope();if(isAdmin()){var demo=seedDemo(false);if(demo.added)toast('Se agregaron '+demo.added+' demos integrales locales de Colpensiones; Azure no fue modificado.','success');}refreshViews();},260);return r;};},'_sgrt21Login');
    wrapOnce('navTo',function(old){return function(el,pg){var r=old.apply(this,arguments);setTimeout(function(){applyScope();if(isAdmin()&&pg==='pg-reportes-entidad')renderPowerBI();},120);return r;};},'_sgrt21Nav');
    try{ if(window._sgrtCierreSnapshot && !window._sgrt21Snapshot){var orig=window._sgrtCierreSnapshot;window._sgrtCierreSnapshot=function(){var s=orig.apply(this,arguments);return isAdmin()?filteredSnapshotFrom(s):s;};window._sgrt21Snapshot=true;} }catch(e){}
  }
  function filteredSnapshotFrom(s){
    if(!isAdmin())return s; var ts=(s.terceros||[]).filter(function(t){return colpensiones(t.entidad||t.entidadLabel);}),n={};ts.forEach(function(t){n[t.nit]=true;});var out=clone(s)||{};out.terceros=ts;out.total=ts.length;out.riskRows=(s.riskRows||[]).filter(function(x){return x.t&&n[x.t.nit];});out.matriz=(s.matriz||[]).filter(function(r){return n[r.nit]||ts.some(function(t){return norm(t.nombre)===norm(r.tercero||r.nombreTercero);});});out.entities=(s.entities||[]).filter(function(e){return norm(e.id)==='colpensiones'||norm(e.nombre).indexOf('colpensiones')>=0;});if(!out.entities.length)out.entities=[{id:'colpensiones',nombre:'Colpensiones',terceros:ts,riesgos:out.riskRows,clasificados:ts.length,conAC:0,documentos:0}];out.respuestas={};Object.keys(s.respuestas||{}).forEach(function(k){if(n[k])out.respuestas[k]=s.respuestas[k];});return out;
  }
  function boot(){ panel();applyScope();hook();if(isAdmin()){var r=seedDemo(false);if(r.added)toast('Datos demo integrales locales de Colpensiones disponibles.','success');} }
  document.addEventListener('DOMContentLoaded',function(){[80,400,1000,1800].forEach(function(ms){setTimeout(boot,ms);});});
  [300,900,1600,2600].forEach(function(ms){setTimeout(boot,ms);});
})();
