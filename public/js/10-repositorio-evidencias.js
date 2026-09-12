
// ─── REPOSITORIO DE EVIDENCIAS ────────────────────────────────
(function(){
  var REPO_KEY = 'sgrt_repositorio';
  var carpetaActual = null;
  var CARPETAS = {
    'ambient_control': 'Ambiente de Control',
    'matrices_riesgo': 'Matrices de Riesgo',
    'contratos_soportes': 'Contratos y Soportes',
    'informes_reportes': 'Informes y Reportes'
  };

  function getRepo(){ try{ return JSON.parse(localStorage.getItem(REPO_KEY)||'{}'); }catch(e){ return {}; } }
  function saveRepo(d){ try{ localStorage.setItem(REPO_KEY, JSON.stringify(d)); }catch(e){} }

  window.repoIrRaiz = function(){
    carpetaActual = null;
    var cc=document.getElementById('repo-carpetas-fijas'); if(cc) cc.style.display='grid';
    var rc=document.getElementById('repo-contenido'); if(rc) rc.style.display='none';
    var bc=document.getElementById('repo-breadcrumb');
    if(bc) bc.innerHTML='<span onclick="window.repoIrRaiz()" style="cursor:pointer;color:#1e6bb8;font-weight:600;">🏠 Inicio</span>';
    window.repoActualizarConteos();
  };

  window.repoAbrirCarpeta = function(key){
    carpetaActual = key;
    var cc=document.getElementById('repo-carpetas-fijas'); if(cc) cc.style.display='none';
    var rc=document.getElementById('repo-contenido'); if(rc) rc.style.display='block';
    var tit=document.getElementById('repo-carpeta-titulo'); if(tit) tit.textContent=CARPETAS[key]||key;
    var bc=document.getElementById('repo-breadcrumb');
    if(bc) bc.innerHTML='<span onclick="window.repoIrRaiz()" style="cursor:pointer;color:#1e6bb8;">🏠 Inicio</span> › <b>'+(CARPETAS[key]||key)+'</b>';
    window.repoRenderArchivos();
  };

  window.repoRenderArchivos = function(){
    var lista=document.getElementById('repo-archivos-lista'); if(!lista) return;
    var repo=getRepo();
    var filtro=(document.getElementById('repo-filtro-tercero')||{}).value||'';
    var archivos=(repo[carpetaActual]||[]).filter(function(a){ return !filtro||a.tercero===filtro||!a.tercero; });
    if(!archivos.length){
      lista.innerHTML='<div style="text-align:center;padding:32px;color:var(--muted);font-size:12px;">📄 Sin archivos en esta carpeta.<br>Usa <b>⬆ Subir archivo</b> para agregar.</div>';
      return;
    }
    lista.innerHTML=archivos.map(function(a,i){
      var ext=(a.nombre||'').split('.').pop().toUpperCase().slice(0,4)||'FILE';
      var colorExt={PDF:'#dc3545',DOC:'#1e6bb8',DOCX:'#1e6bb8',XLS:'#28a745',XLSX:'#28a745',JPG:'#fd7e14',PNG:'#fd7e14'}[ext]||'#6c757d';
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:white;border:1px solid #dee2e6;border-radius:7px;">'
        +'<div style="width:36px;height:36px;background:'+colorExt+';border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:800;flex-shrink:0;">'+ext+'</div>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="font-size:13px;font-weight:700;color:#1a3a5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+a.nombre+'</div>'
          +'<div style="font-size:10.5px;color:var(--muted);">'+(a.tercero||'General')+' · '+(a.fecha||'—')+(a.size?' · '+a.size:'')+'</div>'
        +'</div>'
        +(a.url?'<a href="'+a.url+'" download="'+a.nombre+'" style="padding:4px 10px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:5px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">⬇ Bajar</a>':'')
        +'<button onclick="window.repoEliminar(\\\''+carpetaActual+'\\\','+i+')" style="padding:4px 8px;background:#fef2f2;color:#dc3545;border:1px solid #fca5a5;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;">✕</button>'
        +'</div>';
    }).join('');
  };

  window.repoSubirArchivos = function(input){
    if(!input.files||!input.files.length) return;
    if(!carpetaActual){ try{showToast('Abre una carpeta primero','error',2000);}catch(e){} return; }
    var repo=getRepo();
    if(!repo[carpetaActual]) repo[carpetaActual]=[];
    var filtro=(document.getElementById('repo-filtro-tercero')||{}).value||'';
    Array.from(input.files).forEach(function(f){
      var sizeStr=f.size>1048576?(f.size/1048576).toFixed(1)+'MB':(f.size/1024).toFixed(0)+'KB';
      var url=URL.createObjectURL(f);
      repo[carpetaActual].push({nombre:f.name, tercero:filtro||'', fecha:new Date().toLocaleDateString('es-CO'), size:sizeStr, url:url});
    });
    saveRepo(repo);
    window.repoRenderArchivos();
    window.repoActualizarConteos();
    try{showToast('✅ '+input.files.length+' archivo(s) subido(s)','success',2500);}catch(e){}
    input.value='';
  };

  window.repoEliminar = function(carpeta, idx){
    var repo=getRepo();
    if(repo[carpeta]) repo[carpeta].splice(idx,1);
    saveRepo(repo);
    window.repoRenderArchivos();
    window.repoActualizarConteos();
  };

  window.repoNuevaCarpeta = function(){
    var nom=prompt('Nombre de la nueva subcarpeta:');
    if(!nom||!carpetaActual) return;
    try{showToast('Carpeta "'+nom+'" agregada (visual)','info',2000);}catch(e){}
  };

  window.repoActualizarConteos = function(){
    var repo=getRepo();
    Object.keys(CARPETAS).forEach(function(k){
      var el=document.getElementById('repo-cnt-'+k);
      var n=(repo[k]||[]).length;
      if(el) el.textContent=n+' archivo'+(n!==1?'s':'');
    });
  };

  window.repoFiltrar = function(){
    if(carpetaActual) window.repoRenderArchivos();
  };

  window.repoPoblarFiltroTerceros = function(){
    var sel=document.getElementById('repo-filtro-tercero'); if(!sel) return;
    var prev=sel.value;
    sel.innerHTML='<option value="">— Todos los terceros —</option>';
    var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
    try{ var sv=JSON.parse(localStorage.getItem('sgrt_v8')||'{}'); if(sv.TERCEROS_DB) Object.assign(db,sv.TERCEROS_DB); }catch(e){}
    Object.values(db).forEach(function(t){
      if(!t||!t.nombre) return;
      var o=document.createElement('option'); o.value=t.nombre; o.textContent=t.nombre; sel.appendChild(o);
    });
    if(prev) sel.value=prev;
  };

  // Hook navTo
  var _origNavTo = window.navTo;
  window.navTo = function(el, pgId){
    if(_origNavTo) _origNavTo.apply(this, arguments);
    if(pgId==='pg-repositorio'||pgId==='pg-evidencias'){
      setTimeout(function(){
        window.repoActualizarConteos();
        window.repoPoblarFiltroTerceros();
      }, 80);
    }
  };
})();
