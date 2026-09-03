/* SGRT — Repositorio SharePoint integrado.
   No altera el flujo de terceros/riesgos. Sustituye únicamente el almacenamiento
   local del repositorio cuando Microsoft Graph está configurado en el backend. */
(function(){
  'use strict';
  var st={configured:false,connected:false,rootWebUrl:'',userPath:[],adminPath:[],userItems:[],adminItems:[],userCurrent:null,adminCurrent:null};
  var old={
    odInit:window.odInit,odRender:window.odRender,odTab:window.odTab,odNav:window.odNav,odNuevaCarpeta:window.odNuevaCarpeta,
    odSubirArchivos:window.odSubirArchivos,odDel:window.odDel,odRenombrar:window.odRenombrar,odDescargar:window.odDescargar,
    odSelTodo:window.odSelTodo,odDlSel:window.odDlSel,odDelSel:window.odDelSel,odAbrirTercero:window.odAbrirTercero,
    adminOdInit:window.adminOdInit,adminOdNuevaCarpeta:window.adminOdNuevaCarpeta,adminOdSubir:window.adminOdSubir,
    adminOdNav:window.adminOdNav,adminOdClick:window.adminOdClick
  };
  function base(){return String(window.API_BASE_URL||window.API_BASE||'').replace(/\/$/,'');}
  function isSuper(){var u=window.currentUser||{};return ['IS','iseguras','Superadministrador','Super Administrador'].indexOf(u.rol)>=0||u.login==='iseguras2026';}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function toast(t,type){try{showToast(t,type||'info',2800);}catch(e){}}
  async function api(path,opt){
    opt=opt||{};opt.headers=Object.assign({'Content-Type':'application/json'},opt.headers||{});if(isSuper())opt.headers['X-SGRT-Superadmin']='1';
    var r=await fetch(base()+path,opt);var d={};try{d=await r.json();}catch(e){}
    if(!r.ok||d.ok===false)throw new Error(d.error||('HTTP '+r.status));return d;
  }
  function rel(path){return (path||[]).map(function(x){return x.name||x;}).join('/');}
  function fmt(b){b=Number(b||0);if(b<1024)return b+' B';if(b<1048576)return Math.round(b/1024)+' KB';return(b/1048576).toFixed(1)+' MB';}
  function fileIcon(n){var e=String(n||'').split('.').pop().toLowerCase();return({pdf:'📄',doc:'📝',docx:'📝',xls:'📊',xlsx:'📊',ppt:'📑',pptx:'📑',png:'🖼️',jpg:'🖼️',jpeg:'🖼️',zip:'🗜️'}[e]||'📎');}
  function openOnline(url){if(!url)return toast('SharePoint no devolvió vínculo de apertura','warning');window.open(url,'_blank','noopener');}
  function downloadOnline(url){if(!url)return;var sep=url.indexOf('?')>=0?'&':'?';window.open(url+sep+'download=1','_blank','noopener');}
  function insertCloudBars(){
    var pg=document.getElementById('pg-evidencias-repo');
    if(pg&&!document.getElementById('sp-user-bar')){
      var head=pg.firstElementChild,b=document.createElement('div');b.id='sp-user-bar';b.style.cssText='margin:-3px 0 14px;padding:10px 14px;border:1px solid #b9d9f4;background:#eff8ff;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12px;';
      b.innerHTML='<div><b style="color:#135a8d;">☁ SharePoint</b> <span id="sp-user-status">verificando conexión…</span><div style="font-size:10.5px;color:#657786;margin-top:2px;">Los documentos se abren y editan en Office Online sin descargarlos.</div></div><button class="btn btn-outline btn-sm" onclick="window.spAbrirRaiz()">Abrir SharePoint</button>';
      if(head&&head.nextSibling)pg.insertBefore(b,head.nextSibling);else pg.appendChild(b);
    }
    var ap=document.getElementById('admin-pg-repo');
    if(ap&&!document.getElementById('sp-admin-bar')){
      var first=ap.firstElementChild,b2=document.createElement('div');b2.id='sp-admin-bar';b2.style.cssText='margin:0 0 14px;padding:10px 14px;border:1px solid #b9d9f4;background:#eff8ff;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12px;';
      b2.innerHTML='<div><b style="color:#135a8d;">☁ SharePoint empresarial</b> <span id="sp-admin-status">verificando conexión…</span><div style="font-size:10.5px;color:#657786;margin-top:2px;">Superadministrador: puede administrar lectura/edición de carpetas y documentos.</div></div><div style="display:flex;gap:7px;"><button class="btn btn-outline btn-sm" onclick="window.spAbrirRaiz()">Abrir SharePoint</button><button class="btn btn-primary btn-sm" onclick="window.spPermisosCarpetaActual()">🔐 Permisos</button></div>';
      if(first)ap.insertBefore(b2,first);else ap.appendChild(b2);
    }
  }
  function updateStatus(){
    var txt=st.connected?'✅ Vinculado a Prueba - APP - SGRT':(st.configured?'⚠ Conexión pendiente':'⚙ Pendiente de credenciales Microsoft Graph');
    ['sp-user-status','sp-admin-status'].forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=txt;});
    var lbl=document.getElementById('od-uso-lbl');if(lbl&&st.connected)lbl.textContent='SharePoint empresarial';
    var al=document.getElementById('admin-od-uso-lbl');if(al&&st.connected)al.textContent='SharePoint empresarial';
  }
  window.spAbrirRaiz=function(){if(st.rootWebUrl)openOnline(st.rootWebUrl);else toast('No hay URL de SharePoint configurada','warning');};

  async function status(){
    insertCloudBars();
    try{var d=await api('/api/sharepoint/status',{method:'GET',headers:{}});st.configured=!!d.configured;st.connected=!!d.connected;st.rootWebUrl=d.rootWebUrl||st.rootWebUrl;}
    catch(e){st.connected=false;console.warn('SharePoint status:',e.message);} updateStatus(); return st.connected;
  }

  function breadcrumb(path,target,admin){
    var el=document.getElementById(target);if(!el)return;
    var b='<span onclick="'+(admin?'spAdminNav(-1)':'spUserNav(-1)')+'" style="cursor:pointer;color:#1e6bb8;font-weight:700;padding:3px 8px;background:#eff6ff;border-radius:4px;">☁ Inicio SharePoint</span>';
    (path||[]).forEach(function(s,i){b+=' <span style="color:#aaa;">/</span> <span onclick="'+(admin?'spAdminNav('+i+')':'spUserNav('+i+')')+'" style="cursor:pointer;color:#1e6bb8;padding:3px 8px;background:#eff6ff;border-radius:4px;">'+esc(s.name)+'</span>';});el.innerHTML=b;
  }
  function itemById(list,id){return(list||[]).find(function(x){return String(x.id)===String(id);});}
  function card(it,admin){
    var folder=it.type==='folder',ico=folder?'📁':fileIcon(it.name);var name=esc(it.name),id=esc(it.id),web=esc(it.webUrl||'');
    var open=folder?(admin?'spAdminOpen(\''+id+'\')':'spUserOpen(\''+id+'\')'):'spOpenFile(\''+id+'\','+(admin?'true':'false')+')';
    return '<div style="background:white;border:1px solid #d9e2ea;border-radius:10px;padding:11px 8px;text-align:center;position:relative;box-shadow:0 2px 6px rgba(0,0,0,.03);">'
      +'<div ondblclick="'+open+'" style="cursor:pointer;"><div style="font-size:31px;margin-bottom:5px;">'+ico+'</div><div style="font-size:11.5px;font-weight:700;word-break:break-word;color:#334155;min-height:30px;">'+name+'</div>'+(folder?'':'<div style="font-size:9.5px;color:#94a3b8;margin-top:3px;">'+fmt(it.size)+'</div>')+'</div>'
      +'<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-top:8px;">'
      +(folder?'<button class="btn btn-outline btn-sm" style="font-size:10px;padding:4px 7px;" onclick="'+open+'">Abrir</button>':'<button class="btn btn-outline btn-sm" style="font-size:10px;padding:4px 7px;" onclick="spOpenFile(\''+id+'\','+(admin?'true':'false')+')">Abrir / Editar</button><button class="btn btn-outline btn-sm" style="font-size:10px;padding:4px 7px;" onclick="spDownloadFile(\''+id+'\','+(admin?'true':'false')+')">Descargar</button>')
      +(admin?'<button class="btn btn-outline btn-sm" style="font-size:10px;padding:4px 7px;" onclick="spAbrirPermisos(\''+id+'\',\''+name.replace(/'/g,'&#39;')+'\')">🔐</button>':'')
      +'<button class="btn btn-outline btn-sm" style="font-size:10px;padding:4px 7px;color:#b42318;" onclick="spDelete(\''+id+'\','+(admin?'true':'false')+')">✕</button></div></div>';
  }
  async function renderUser(){
    if(!st.connected)return old.odInit&&old.odInit();
    var grid=document.getElementById('od-grid');if(!grid)return;grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:35px;color:#64748b;">☁ Cargando SharePoint…</div>';breadcrumb(st.userPath,'od-bc',false);
    try{var d=await api('/api/sharepoint/list?path='+encodeURIComponent(rel(st.userPath)),{method:'GET',headers:{}});st.userItems=d.items||[];st.userCurrent=d.current||null;grid.innerHTML=st.userItems.length?st.userItems.map(function(x){return card(x,false);}).join(''):'<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;border:2px dashed #d9e2ea;border-radius:8px;">📂 Carpeta de SharePoint vacía</div>';}
    catch(e){grid.innerHTML='<div style="grid-column:1/-1;padding:25px;color:#b42318;background:#fff1f1;border:1px solid #fecaca;border-radius:8px;"><b>No se pudo cargar SharePoint</b><br>'+esc(e.message)+'</div>';}
  }
  async function renderAdmin(){
    if(!st.connected)return old.adminOdInit&&old.adminOdInit();
    var grid=document.getElementById('admin-od-grid');if(!grid)return;grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:35px;color:#64748b;">☁ Cargando SharePoint…</div>';breadcrumb(st.adminPath,'admin-od-bc',true);
    try{var d=await api('/api/sharepoint/list?path='+encodeURIComponent(rel(st.adminPath)),{method:'GET',headers:{}});st.adminItems=d.items||[];st.adminCurrent=d.current||null;grid.innerHTML=st.adminItems.length?st.adminItems.map(function(x){return card(x,true);}).join(''):'<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8;border:2px dashed #d9e2ea;border-radius:8px;">📂 Carpeta de SharePoint vacía</div>';}
    catch(e){grid.innerHTML='<div style="grid-column:1/-1;padding:25px;color:#b42318;background:#fff1f1;border:1px solid #fecaca;border-radius:8px;"><b>No se pudo cargar SharePoint</b><br>'+esc(e.message)+'</div>';}
  }
  window.spUserOpen=function(id){var it=itemById(st.userItems,id);if(it&&it.type==='folder'){st.userPath.push({id:it.id,name:it.name});renderUser();}};
  window.spAdminOpen=function(id){var it=itemById(st.adminItems,id);if(it&&it.type==='folder'){st.adminPath.push({id:it.id,name:it.name});renderAdmin();}};
  window.spUserNav=function(i){st.userPath=i<0?[]:st.userPath.slice(0,i+1);renderUser();};
  window.spAdminNav=function(i){st.adminPath=i<0?[]:st.adminPath.slice(0,i+1);renderAdmin();};
  window.spOpenFile=function(id,admin){var it=itemById(admin?st.adminItems:st.userItems,id);if(it)openOnline(it.webUrl);};
  window.spDownloadFile=function(id,admin){var it=itemById(admin?st.adminItems:st.userItems,id);if(it)downloadOnline(it.webUrl);};
  async function uploadFiles(files,admin){
    if(!files||!files.length)return;var path=rel(admin?st.adminPath:st.userPath),done=0;
    for(var i=0;i<files.length;i++){
      var f=files[i]; if(f.size>20*1024*1024){toast(f.name+' supera 20 MB','warning');continue;}
      var b64=await new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(String(r.result||'').split(',').pop());};r.onerror=reject;r.readAsDataURL(f);});
      await api('/api/sharepoint/upload',{method:'POST',body:JSON.stringify({path:path,name:f.name,mimeType:f.type||'application/octet-stream',contentBase64:b64})});done++;
    }
    toast('✅ '+done+' archivo(s) guardado(s) en SharePoint','success');admin?renderAdmin():renderUser();
  }
  async function newFolder(admin){var n=prompt('Nombre de la nueva carpeta:');if(!n||!n.trim())return;try{await api('/api/sharepoint/folder',{method:'POST',body:JSON.stringify({path:rel(admin?st.adminPath:st.userPath),name:n.trim()})});toast('Carpeta creada en SharePoint','success');admin?renderAdmin():renderUser();}catch(e){toast(e.message,'error');}}
  window.spDelete=async function(id,admin){if(!confirm('¿Eliminar este elemento de SharePoint?'))return;try{await api('/api/sharepoint/item/'+encodeURIComponent(id),{method:'DELETE'});toast('Eliminado de SharePoint','success');admin?renderAdmin():renderUser();}catch(e){toast(e.message,'error');}};
  async function rename(id,admin){var it=itemById(admin?st.adminItems:st.userItems,id);if(!it)return;var n=prompt('Nuevo nombre:',it.name);if(!n||!n.trim())return;try{await api('/api/sharepoint/item/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({name:n.trim()})});toast('Nombre actualizado','success');admin?renderAdmin():renderUser();}catch(e){toast(e.message,'error');}}

  // Reemplazo únicamente cuando SharePoint está conectado.
  window.odInit=function(){if(st.connected){st.userPath=[];return renderUser();}return old.odInit&&old.odInit.apply(this,arguments);};
  window.odRender=function(){if(st.connected)return renderUser();return old.odRender&&old.odRender.apply(this,arguments);};
  window.odNav=function(i){if(st.connected)return window.spUserNav(i);return old.odNav&&old.odNav.apply(this,arguments);};
  window.odNuevaCarpeta=function(){if(st.connected)return newFolder(false);return old.odNuevaCarpeta&&old.odNuevaCarpeta.apply(this,arguments);};
  window.odSubirArchivos=function(files){if(st.connected)return uploadFiles(files,false);return old.odSubirArchivos&&old.odSubirArchivos.apply(this,arguments);};
  window.odDel=function(id){if(st.connected)return window.spDelete(id,false);return old.odDel&&old.odDel.apply(this,arguments);};
  window.odRenombrar=function(id){if(st.connected)return rename(id,false);return old.odRenombrar&&old.odRenombrar.apply(this,arguments);};
  window.odDescargar=function(id){if(st.connected)return window.spDownloadFile(id,false);return old.odDescargar&&old.odDescargar.apply(this,arguments);};
  window.odSelTodo=function(){if(st.connected){toast('En SharePoint selecciona y administra cada elemento directamente','info');return;}return old.odSelTodo&&old.odSelTodo.apply(this,arguments);};
  window.odDlSel=function(){if(st.connected){toast('Usa Descargar en los archivos que necesites','info');return;}return old.odDlSel&&old.odDlSel.apply(this,arguments);};
  window.odDelSel=function(){if(st.connected){toast('Usa ✕ en cada elemento para evitar eliminaciones accidentales','info');return;}return old.odDelSel&&old.odDelSel.apply(this,arguments);};
  window.odAbrirTercero=async function(nit){
    if(!st.connected)return old.odAbrirTercero&&old.odAbrirTercero.apply(this,arguments);
    var db=window.TERCEROS_DB||{},t=db[nit]||{};var nom=String(t.nombre||nit).replace(/[\\/:*?"<>|]/g,'-');var folder='Terceros/'+String(nit)+' - '+nom;
    try{await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:folder})});st.userPath=[{name:'Terceros'},{name:String(nit)+' - '+nom}];if(old.odTab)old.odTab('repo');renderUser();}catch(e){toast(e.message,'error');}
  };
  var oldTab=window.odTab;window.odTab=function(tab){var r=oldTab&&oldTab.apply(this,arguments);if(st.connected&&tab==='repo')setTimeout(renderUser,30);return r;};

  window.adminOdInit=function(){if(st.connected){st.adminPath=[];return renderAdmin();}return old.adminOdInit&&old.adminOdInit.apply(this,arguments);};
  window.adminOdNav=function(i){if(st.connected)return window.spAdminNav(i);return old.adminOdNav&&old.adminOdNav.apply(this,arguments);};
  window.adminOdNuevaCarpeta=function(){if(st.connected)return newFolder(true);return old.adminOdNuevaCarpeta&&old.adminOdNuevaCarpeta.apply(this,arguments);};
  window.adminOdSubir=function(files){if(st.connected)return uploadFiles(files,true);return old.adminOdSubir&&old.adminOdSubir.apply(this,arguments);};
  window.adminOdClick=function(id){if(st.connected){var it=itemById(st.adminItems,id);if(!it)return;if(it.type==='folder')window.spAdminOpen(id);else openOnline(it.webUrl);return;}return old.adminOdClick&&old.adminOdClick.apply(this,arguments);};

  function permissionName(p){
    try{return (p.grantedToV2&&p.grantedToV2.user&&p.grantedToV2.user.displayName)||(p.grantedToV2&&p.grantedToV2.user&&p.grantedToV2.user.email)||(p.grantedToIdentitiesV2&&p.grantedToIdentitiesV2[0]&&p.grantedToIdentitiesV2[0].user&&p.grantedToIdentitiesV2[0].user.displayName)||(p.link&&('Vínculo '+(p.link.scope||'')))||'Permiso';}catch(e){return'Permiso';}
  }
  function ensurePermModal(){
    if(document.getElementById('sp-perm-modal'))return;
    var d=document.createElement('div');d.id='sp-perm-modal';d.className='overlay';d.style.cssText='display:none;z-index:10050;';
    d.innerHTML='<div class="modal" style="width:650px;max-width:96vw;"><div class="mh"><h3>🔐 Permisos SharePoint</h3><button class="mc-btn" onclick="document.getElementById(\'sp-perm-modal\').style.display=\'none\'">✕</button></div><div class="mb" style="padding:18px;"><div id="sp-perm-title" style="font-weight:800;color:#173b5f;margin-bottom:10px;"></div><div style="display:grid;grid-template-columns:1fr 150px auto;gap:8px;margin-bottom:14px;"><input id="sp-perm-email" type="email" placeholder="usuario@empresa.com" style="padding:9px;border:1px solid #d8e2ea;border-radius:6px;"><select id="sp-perm-role" style="padding:9px;border:1px solid #d8e2ea;border-radius:6px;"><option value="read">Solo lectura</option><option value="write">Edición</option></select><button class="btn btn-primary" onclick="spDarPermiso()">Agregar</button></div><div id="sp-perm-list">Cargando…</div></div></div>';
    document.body.appendChild(d);
  }
  window.spAbrirPermisos=async function(id,name){if(!isSuper())return toast('Solo el Superadministrador puede cambiar permisos','warning');ensurePermModal();var m=document.getElementById('sp-perm-modal');m.dataset.itemId=id;document.getElementById('sp-perm-title').textContent=name||'Elemento';m.style.display='flex';await loadPerms();};
  window.spPermisosCarpetaActual=function(){if(!isSuper())return;var c=st.adminCurrent;if(!c)return toast('Abre primero el repositorio de SharePoint','warning');window.spAbrirPermisos(c.id,c.name);};
  async function loadPerms(){var m=document.getElementById('sp-perm-modal'),id=m&&m.dataset.itemId;if(!id)return;var box=document.getElementById('sp-perm-list');box.innerHTML='Cargando permisos…';try{var d=await api('/api/sharepoint/permissions/'+encodeURIComponent(id),{method:'GET',headers:{}});box.innerHTML=(d.permissions||[]).length?(d.permissions||[]).map(function(p){return'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:6px;"><div><b>'+esc(permissionName(p))+'</b><div style="font-size:10.5px;color:#64748b;">'+esc((p.roles||[]).join(', '))+'</div></div><button class="btn btn-outline btn-sm" style="color:#b42318;" onclick="spQuitarPermiso(\''+esc(p.id)+'\')">Quitar</button></div>';}).join(''):'<div style="color:#64748b;">No se encontraron permisos explícitos.</div>';}catch(e){box.innerHTML='<div style="color:#b42318;">'+esc(e.message)+'</div>';}}
  window.spDarPermiso=async function(){var m=document.getElementById('sp-perm-modal'),id=m&&m.dataset.itemId,email=document.getElementById('sp-perm-email').value.trim(),role=document.getElementById('sp-perm-role').value;if(!email)return toast('Escribe el correo','warning');try{await api('/api/sharepoint/permissions/'+encodeURIComponent(id),{method:'POST',body:JSON.stringify({email:email,role:role})});document.getElementById('sp-perm-email').value='';toast(role==='write'?'Permiso de edición agregado':'Permiso de lectura agregado','success');loadPerms();}catch(e){toast(e.message,'error');}};
  window.spQuitarPermiso=async function(pid){var m=document.getElementById('sp-perm-modal'),id=m&&m.dataset.itemId;if(!confirm('¿Quitar este permiso?'))return;try{await api('/api/sharepoint/permissions/'+encodeURIComponent(id)+'/'+encodeURIComponent(pid),{method:'DELETE'});toast('Permiso retirado','success');loadPerms();}catch(e){toast(e.message,'error');}};

  // Inicialización y navegación: no toca ninguna otra fase.
  var oldNav=window.navTo;if(typeof oldNav==='function'&&!oldNav._sp29){var nn=function(el,pg){var r=oldNav.apply(this,arguments);if(pg==='pg-evidencias-repo')setTimeout(function(){insertCloudBars();if(st.connected)renderUser();},80);return r;};nn._sp29=true;window.navTo=nn;}
  var oldGo=window.goPageIS;if(typeof oldGo==='function'&&!oldGo._sp29){var gg=function(pg){var r=oldGo.apply(this,arguments);if(pg==='admin-pg-repo')setTimeout(function(){insertCloudBars();if(st.connected)renderAdmin();},80);return r;};gg._sp29=true;window.goPageIS=gg;}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(async function(){insertCloudBars();await status();if(st.connected){try{await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Ambiente de Control'})});await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Matrices de Riesgo'})});await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Contratos y Soportes'})});await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Evidencias de Controles'})});await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Informes y Reportes'})});await api('/api/sharepoint/ensure-folder',{method:'POST',body:JSON.stringify({path:'Terceros'})});}catch(e){console.warn('SharePoint carpetas base:',e.message);}}},650);});
})();
