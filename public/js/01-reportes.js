
// ══════════════════════════════════════════════════════════════
// REPORTES E INFORMES — Sistema tipo Drive
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// REPORTES E INFORMES — Sistema tipo OneDrive con persistencia
// Almacena en localStorage como árbol de nodos
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// HELPER: guardar evidencia en Informes automáticamente
// Se llama desde registrarEvidenciaCuest y registrarEvRiesgo
// ══════════════════════════════════════════════════════════════
function _rptGuardarEvidencia(file, dataURL, origen){
  // Esperar a que RPT_FS esté listo (puede llamarse antes de que el bloque RPT cargue)
  setTimeout(function(){
    if(typeof RPT_FS === 'undefined' || !RPT_FS) return;

    // Buscar o crear carpeta "Evidencias" en la raíz
    var evidFolder = RPT_FS.children && RPT_FS.children.find(function(c){ return c.type==='folder' && c.name==='Evidencias'; });
    if(!evidFolder){
      evidFolder = { type:'folder', name:'Evidencias', id:'f_evi', children:[], fecha:'' };
      RPT_FS.children.push(evidFolder);
    }

    // Subcarpeta por origen (Cuestionario AC / Matriz de Riesgos)
    var subFolder = evidFolder.children.find(function(c){ return c.type==='folder' && c.name===origen; });
    if(!subFolder){
      subFolder = { type:'folder', name:origen, id:'f_evi_'+origen.replace(/[^a-z0-9]/gi,'_').toLowerCase(), children:[], fecha:'' };
      evidFolder.children.push(subFolder);
    }

    // Evitar duplicados por nombre+tamaño
    var yaExiste = subFolder.children.find(function(c){ return c.name===file.name && c.size===file.size; });
    if(yaExiste) return;

    var fecha = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
    subFolder.children.push({
      type:     'file',
      name:     file.name,
      id:       'evid_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      size:     file.size,
      fecha:    fecha,
      mimeType: file.type,
      _dataURL: dataURL,
      _origen:  origen
    });

    if(typeof _saveRPT === 'function') _saveRPT();
  }, 100);
}


var RPT_FS = null;
(function(){
  try{ RPT_FS = JSON.parse(localStorage.getItem('rpt_fs_v2')||'null'); }catch(e){}
  if(!RPT_FS){
    RPT_FS = { type:'folder', name:'Inicio', id:'root', children:[
      { type:'folder', name:'Informes de Riesgo',          id:'f_inf',   children:[], fecha:'' },
      { type:'folder', name:'Contratos y Documentos',      id:'f_con',   children:[], fecha:'' },
      { type:'folder', name:'Matrices y Cuestionarios',    id:'f_mat',   children:[], fecha:'' },
      { type:'folder', name:'Evidencias',                  id:'f_evi',   children:[], fecha:'' }
    ]};
    _saveRPT();
  }
})();

var RPT_PATH = [];
var RPT_VIEW = 'grid';
var _rptMenuOpen = null; // id of item with open context menu

function _saveRPT(){
  try{ localStorage.setItem('rpt_fs_v2', JSON.stringify(RPT_FS)); }catch(e){}
}

function _currentFolder(){
  let cur = RPT_FS;
  for(const seg of RPT_PATH){
    const found = cur.children && cur.children.find(c=>c.id===seg);
    if(!found) break;
    cur = found;
  }
  return cur;
}

function _findById(id, node){
  if(!node) node = RPT_FS;
  if(node.id===id) return node;
  if(node.children) for(const ch of node.children){ const r=_findById(id,ch); if(r) return r; }
  return null;
}

function navReportes(id){
  if(id===null){ RPT_PATH=[]; }
  else{
    const idx = RPT_PATH.indexOf(id);
    if(idx>=0) RPT_PATH = RPT_PATH.slice(0,idx+1);
    else RPT_PATH.push(id);
  }
  _closeMenu();
  renderReportesInformes();
}

function setRptView(v){
  RPT_VIEW = v;
  ['grid','list'].forEach(k=>{
    const btn = document.getElementById('rpt-btn-'+k);
    if(btn){ btn.style.background = k===v?'#EFF6FF':'white'; btn.style.color = k===v?'var(--blue)':'var(--muted)'; }
  });
  renderReportesInformes();
}

function renderReportesInformes(){
  const folder = _currentFolder();
  if(!folder) return;
  const search = (document.getElementById('rpt-search')?.value||'').toLowerCase();
  const tipoFil = document.getElementById('rpt-filter-tipo')?.value||'';

  // ── Breadcrumb ──
  const bc = document.getElementById('rpt-breadcrumb');
  if(bc){
    let html = '<span onclick="navReportes(null)" style="cursor:pointer;color:var(--blue);font-weight:600;white-space:nowrap;">🏠 Inicio</span>';
    let cur = RPT_FS;
    for(const seg of RPT_PATH){
      const node = cur.children && cur.children.find(c=>c.id===seg);
      if(!node) break;
      cur = node;
      html += '<span style="color:var(--muted);margin:0 5px;">/</span>';
      html += `<span onclick="navReportes('${cur.id}')" style="cursor:pointer;color:var(--blue);font-weight:600;white-space:nowrap;">${cur.name}</span>`;
    }
    bc.innerHTML = html;
  }

  // ── Filter ──
  let items = (folder.children||[]).slice();
  // Folders first
  items.sort((a,b)=> a.type==='folder'&&b.type!=='folder'?-1: a.type!=='folder'&&b.type==='folder'?1: a.name.localeCompare(b.name));
  if(search) items = items.filter(i=>i.name.toLowerCase().includes(search));
  if(tipoFil==='folder') items = items.filter(i=>i.type==='folder');
  else if(tipoFil) items = items.filter(i=>i.type!=='folder'&&i.name.toLowerCase().endsWith('.'+tipoFil));

  // ── Stats ──
  const statsEl = document.getElementById('rpt-stats');
  if(statsEl){
    const all = folder.children||[];
    const nF = all.filter(c=>c.type==='folder').length;
    const nA = all.filter(c=>c.type!=='folder').length;
    const sz = all.filter(c=>c.size).reduce((a,b)=>a+(b.size||0),0);
    statsEl.innerHTML =
      `<div style="padding:7px 14px;background:white;border:1px solid var(--border);border-radius:var(--r);font-size:12px;display:flex;align-items:center;gap:6px;"><span>📂</span><b>${nF}</b> carpeta${nF!==1?'s':''}</div>`+
      `<div style="padding:7px 14px;background:white;border:1px solid var(--border);border-radius:var(--r);font-size:12px;display:flex;align-items:center;gap:6px;"><span>📄</span><b>${nA}</b> archivo${nA!==1?'s':''}</div>`+
      (sz?`<div style="padding:7px 14px;background:white;border:1px solid var(--border);border-radius:var(--r);font-size:12px;"><b>${_fmtSize(sz)}</b></div>`:'');
  }

  // ── Item count ──
  const cnt = document.getElementById('rpt-item-count');
  if(cnt) cnt.textContent = items.length+' elemento'+(items.length!==1?'s':'');

  // ── Content ──
  const wrap = document.getElementById('rpt-content');
  if(!wrap) return;

  if(!items.length){
    wrap.innerHTML = '<div style="text-align:center;padding:50px 20px;color:var(--muted);"><div style="font-size:48px;margin-bottom:12px;">📭</div><div style="font-size:13px;font-weight:600;">Carpeta vacía</div><div style="font-size:11.5px;margin-top:6px;">Usa los botones de arriba para crear carpetas o subir archivos</div></div>';
    return;
  }

  if(RPT_VIEW==='grid'){
    wrap.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">${items.map(i=>_rptCard(i)).join('')}</div>`;
  } else {
    wrap.innerHTML = `<table style="width:100%;border-collapse:collapse;">
      <thead><tr style="border-bottom:2px solid var(--border);">
        <th style="padding:7px 10px;font-size:11px;color:var(--muted);text-align:left;font-weight:600;">Nombre</th>
        <th style="padding:7px 10px;font-size:11px;color:var(--muted);text-align:left;font-weight:600;">Tipo</th>
        <th style="padding:7px 10px;font-size:11px;color:var(--muted);text-align:left;font-weight:600;">Tamaño</th>
        <th style="padding:7px 10px;font-size:11px;color:var(--muted);text-align:left;font-weight:600;">Fecha</th>
        <th style="padding:7px 10px;font-size:11px;color:var(--muted);text-align:left;font-weight:600;"></th>
      </tr></thead>
      <tbody>${items.map(i=>_rptRow(i)).join('')}</tbody>
    </table>`;
  }
}

// ── Icons & colors ──
function _rptIcon(item){
  if(item.type==='folder') return '📂';
  const ext=(item.name||'').split('.').pop().toLowerCase();
  return {pdf:'📕',xlsx:'📗',xls:'📗',docx:'📘',doc:'📘',pptx:'📙',ppt:'📙',csv:'📊',txt:'📄',zip:'🗜️',rar:'🗜️',png:'🖼️',jpg:'🖼️',jpeg:'🖼️',gif:'🖼️',mp4:'🎬',mp3:'🎵'}[ext]||'📄';
}
function _rptColor(item){
  if(item.type==='folder') return '#FEF9EC';
  const ext=(item.name||'').split('.').pop().toLowerCase();
  return {pdf:'#FEF2F2',xlsx:'#F0FDF4',xls:'#F0FDF4',docx:'#EFF6FF',doc:'#EFF6FF',pptx:'#FFF7ED',ppt:'#FFF7ED',csv:'#F0FDF4',png:'#FDF4FF',jpg:'#FDF4FF',jpeg:'#FDF4FF',gif:'#FDF4FF'}[ext]||'#F9FAFB';
}
function _fmtSize(b){
  if(!b) return '';
  if(b<1024) return b+'B';
  if(b<1048576) return (b/1024).toFixed(1)+'KB';
  return (b/1048576).toFixed(1)+'MB';
}

// ── Card (grid view) ──
function _rptCard(item){
  const icon=_rptIcon(item), bg=_rptColor(item);
  const click = item.type==='folder'?`navReportes('${item.id}')`:`_rptOpenFile('${item.id}')`;
  return `<div style="border:1px solid var(--border);border-radius:var(--r2);padding:12px 8px 10px;text-align:center;cursor:pointer;background:${bg};transition:.15s;position:relative;"
    onclick="${click}"
    onmouseover="this.querySelector('.rpt-dots-btn').style.opacity='1'"
    onmouseout="this.querySelector('.rpt-dots-btn').style.opacity='0'">
    <div style="font-size:34px;margin-bottom:7px;">${icon}</div>
    <div style="font-size:11px;font-weight:600;color:var(--dark);word-break:break-word;line-height:1.3;padding:0 4px;">${item.name}</div>
    ${item.size?`<div style="font-size:9.5px;color:var(--muted);margin-top:3px;">${_fmtSize(item.size)}</div>`:''}
    <button class="rpt-dots-btn" onclick="event.stopPropagation();_openRptMenu('${item.id}',this)"
      style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,.1);border:none;border-radius:50%;width:22px;height:22px;font-size:14px;cursor:pointer;color:var(--dark);display:flex;align-items:center;justify-content:center;opacity:0;transition:.15s;line-height:1;">⋮</button>
  </div>`;
}

// ── Row (list view) ──
function _rptRow(item){
  const icon=_rptIcon(item);
  const click = item.type==='folder'?`navReportes('${item.id}')`:`_rptOpenFile('${item.id}')`;
  return `<tr style="border-bottom:1px solid var(--border);cursor:pointer;"
    onclick="${click}"
    onmouseover="this.style.background='var(--gray3)';this.querySelector('.rpt-dots-btn').style.opacity='1'"
    onmouseout="this.style.background='';this.querySelector('.rpt-dots-btn').style.opacity='0'">
    <td style="padding:8px 10px;font-size:12.5px;"><span style="margin-right:8px;">${icon}</span><b>${item.name}</b></td>
    <td style="padding:8px 10px;font-size:11px;color:var(--muted);">${item.type==='folder'?'Carpeta':(item.name.split('.').pop().toUpperCase()||'—')}</td>
    <td style="padding:8px 10px;font-size:11px;color:var(--muted);">${_fmtSize(item.size)||'—'}</td>
    <td style="padding:8px 10px;font-size:11px;color:var(--muted);">${item.fecha||'—'}</td>
    <td style="padding:8px 10px;" onclick="event.stopPropagation();">
      <button class="rpt-dots-btn" onclick="_openRptMenu('${item.id}',this)"
        style="padding:2px 8px;background:#F3F4F6;border:1px solid var(--border);border-radius:4px;font-size:14px;cursor:pointer;opacity:0;transition:.15s;">⋮</button>
    </td>
  </tr>`;
}

// ── Three-dot context menu ──
function _openRptMenu(id, btn){
  _closeMenu();
  const item = _findById(id);
  if(!item) return;
  _rptMenuOpen = id;

  const menu = document.createElement('div');
  menu.id = 'rpt-ctx-menu';
  menu.style.cssText = 'position:fixed;z-index:9999;background:white;border:1px solid var(--border);border-radius:var(--r2);box-shadow:0 8px 24px rgba(0,0,0,.15);min-width:190px;padding:5px 0;font-size:13px;';

  const menuItems = [];

  if(item.type==='folder'){
    menuItems.push({ icon:'📂', label:'Abrir',       action:`navReportes('${id}')` });
  } else {
    menuItems.push({ icon:'👁', label:'Ver / Abrir', action:`_rptOpenFile('${id}')` });
    menuItems.push({ icon:'⬇️', label:'Descargar',   action:`_rptDownload('${id}')` });
  }

  menuItems.push({ icon:'✏️', label:'Renombrar',     action:`_rptRename('${id}')` });
  menuItems.push({ icon:'📋', label:'Copiar enlace', action:`_rptCopyLink('${id}')` });

  if(item.type!=='folder'){
    menuItems.push({ icon:'🔗', label:'Compartir',   action:`_rptShare('${id}')` });
  }

  menuItems.push({ divider: true });
  menuItems.push({ icon:'🗑', label:'Eliminar', action:`eliminarItemRPT('${id}')`, danger:true });

  menu.innerHTML = menuItems.map(m=>{
    if(m.divider) return '<div style="height:1px;background:var(--border);margin:4px 0;"></div>';
    return `<div onclick="_closeMenu();${m.action}" style="padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;color:${m.danger?'var(--red)':'var(--dark)'};font-weight:${m.danger?'600':'400'};"
      onmouseover="this.style.background='var(--gray3)'" onmouseout="this.style.background=''"
    ><span style="font-size:15px;">${m.icon}</span>${m.label}</div>`;
  }).join('');

  // Position near button
  const rect = btn.getBoundingClientRect();
  document.body.appendChild(menu);
  const mW = menu.offsetWidth, mH = menu.offsetHeight;
  let top = rect.bottom + 4, left = rect.right - mW;
  if(top+mH > window.innerHeight) top = rect.top - mH - 4;
  if(left < 8) left = 8;
  menu.style.top = top+'px';
  menu.style.left = left+'px';

  // Close on outside click
  setTimeout(()=>{ document.addEventListener('click', _closeMenuOnce, { once:true }); }, 10);
}

function _closeMenuOnce(){ _closeMenu(); }
function _closeMenu(){
  const m = document.getElementById('rpt-ctx-menu');
  if(m) m.remove();
  _rptMenuOpen = null;
}

// ── Actions ──
function _rptOpenFile(id){
  const item = _findById(id);
  if(!item || !item._dataURL){
    showToast('📄 Archivo registrado — usa Descargar para obtenerlo','info',2500);
    return;
  }
  const a = document.createElement('a');
  a.href = item._dataURL;
  a.target = '_blank';
  a.click();
}

function _rptDownload(id){
  const item = _findById(id);
  if(!item){ return; }
  if(item._dataURL){
    const a = document.createElement('a');
    a.href = item._dataURL;
    a.download = item.name;
    a.click();
    showToast('⬇️ Descargando "'+item.name+'"','success',2000);
  } else {
    showToast('⚠️ El archivo no tiene datos guardados — vuélvelo a subir para habilitar descarga','info',3500);
  }
}

function _rptRename(id){
  const item = _findById(id);
  if(!item) return;
  const nuevo = prompt('Nuevo nombre:', item.name);
  if(nuevo && nuevo.trim() && nuevo.trim()!==item.name){
    item.name = nuevo.trim();
    _saveRPT();
    renderReportesInformes();
    showToast('✅ Renombrado a "'+item.name+'"','success',2000);
  }
}

function _rptCopyLink(id){
  const item = _findById(id);
  if(!item) return;
  const pseudo = window.location.href.split('?')[0] + '?rpt=' + id;
  navigator.clipboard.writeText(pseudo).then(()=>{
    showToast('📋 Enlace copiado al portapapeles','success',2000);
  }).catch(()=>{
    showToast('📋 Enlace: '+pseudo,'info',4000);
  });
}

function _rptShare(id){
  const item = _findById(id);
  if(!item) return;
  if(navigator.share && item._dataURL){
    navigator.share({ title:item.name, url:window.location.href });
  } else {
    _rptCopyLink(id);
  }
}

function eliminarItemRPT(id){
  const item = _findById(id);
  const nombre = item ? item.name : id;
  if(!confirm('¿Eliminar "'+nombre+'"?')) return;
  function _del(folder){
    if(!folder.children) return false;
    const idx = folder.children.findIndex(c=>c.id===id);
    if(idx>=0){ folder.children.splice(idx,1); return true; }
    for(const c of folder.children){ if(_del(c)) return true; }
    return false;
  }
  _del(RPT_FS);
  _saveRPT();
  renderReportesInformes();
  showToast('"'+nombre+'" eliminado','info',1500);
}

function crearCarpetaReporte(){
  const m = document.getElementById('m-nueva-carpeta-rpt');
  if(m){ m.style.display='flex'; setTimeout(()=>document.getElementById('rpt-nueva-carpeta-nombre').focus(),50); }
}

function confirmarNuevaCarpeta(){
  const input = document.getElementById('rpt-nueva-carpeta-nombre');
  const nombre = (input?.value||'').trim();
  if(!nombre){ showToast('Escribe un nombre','error',2000); return; }
  const folder = _currentFolder();
  const newId = 'f_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
  folder.children.push({ type:'folder', name:nombre, id:newId, children:[], fecha:new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}) });
  _saveRPT();
  if(input) input.value='';
  document.getElementById('m-nueva-carpeta-rpt').style.display='none';
  renderReportesInformes();
  showToast('📂 Carpeta "'+nombre+'" creada','success',2000);
}

function subirArchivosReporte(input){
  const folder = _currentFolder();
  const fecha = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
  let count = 0;
  const files = Array.from(input.files);
  let done = 0;
  if(!files.length) return;

  function readNext(i){
    if(i>=files.length){ _saveRPT(); renderReportesInformes(); input.value=''; showToast(count+' archivo'+(count!==1?'s':'')+' subido'+(count!==1?'s':'')+' ✅','success',2500); return; }
    const file = files[i];
    const id = 'file_'+Date.now()+'_'+i;
    const node = { type:'file', name:file.name, id, size:file.size, fecha, mimeType:file.type };
    // Read as dataURL to enable download (cap at 10MB)
    if(file.size <= 10*1024*1024){
      const reader = new FileReader();
      reader.onload = function(e){ node._dataURL = e.target.result; folder.children.push(node); count++; readNext(i+1); };
      reader.onerror = function(){ folder.children.push(node); count++; readNext(i+1); };
      reader.readAsDataURL(file);
    } else {
      folder.children.push(node); count++; readNext(i+1);
    }
  }
  readNext(0);
}

function subirCarpetaReporte(input){
  const rootFolder = _currentFolder();
  const fecha = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
  const folderMap = {};
  const files = Array.from(input.files);
  let count = 0;

  function readAll(i){
    if(i>=files.length){ _saveRPT(); renderReportesInformes(); input.value=''; showToast('Carpeta subida: '+count+' archivos ✅','success',2500); return; }
    const file = files[i];
    const parts = file.webkitRelativePath.split('/');
    const fileName = parts[parts.length-1];
    let parent = rootFolder;
    for(let j=0;j<parts.length-1;j++){
      const key = parts.slice(0,j+1).join('/');
      if(!folderMap[key]){
        const nf = { type:'folder', name:parts[j], id:'f_'+Date.now()+'_'+j+'_'+Math.random().toString(36).slice(2,6), children:[], fecha };
        parent.children.push(nf);
        folderMap[key] = nf;
      }
      parent = folderMap[key];
    }
    const id = 'file_'+Date.now()+'_'+i;
    const node = { type:'file', name:fileName, id, size:file.size, fecha, mimeType:file.type };
    if(file.size<=10*1024*1024){
      const reader=new FileReader();
      reader.onload=function(e){ node._dataURL=e.target.result; parent.children.push(node); count++; readAll(i+1); };
      reader.onerror=function(){ parent.children.push(node); count++; readAll(i+1); };
      reader.readAsDataURL(file);
    } else { parent.children.push(node); count++; readAll(i+1); }
  }
  readAll(0);
}

// Close menu on scroll
document.addEventListener('scroll', _closeMenu, true);
