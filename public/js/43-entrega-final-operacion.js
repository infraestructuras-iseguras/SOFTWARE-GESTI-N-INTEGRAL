/* SGRT 43 — Entrega final: telemetría, operación multiusuario, Excel, BD segura y demo controlada.
   Extiende el sistema existente; no reemplaza flujos de clasificación/evaluación/riesgos. */
(function(){
  'use strict';
  if(window.__SGRT43_INSTALLED__) return; window.__SGRT43_INSTALLED__=true;

  var rawFetch=window.fetch.bind(window), sessionKey='sgrt43_session_id';
  function s(v){return String(v==null?'':v).trim();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function low(v){return s(v).toLowerCase();}
  function uid(){try{return crypto.randomUUID();}catch(e){return 'sg-'+Date.now()+'-'+Math.random().toString(36).slice(2);}}
  function sessionId(){var x='';try{x=sessionStorage.getItem(sessionKey)||'';}catch(e){} if(!x){x=uid();try{sessionStorage.setItem(sessionKey,x);}catch(e){}}return x;}
  function user(){return window.currentUser||{};}
  function login(){var u=user();return s(u.login||u.usuario||u.user||u.username||u.email||'');}
  function uname(){var u=user();return s(u.nombre||u.name||u.fullName||u.login||u.usuario||'');}
  function urole(){var u=user();return s(u.rol||u.role||'');}
  function entity(){var u=user();return s(u.entidad||u.entidadId||u.entityId||u.organizacion||'');}
  function isIS(){var r=low(urole()),l=low(login());return r==='is'||r.indexOf('infraestructuras seguras')>=0||r.indexOf('superadmin')>=0||l.indexOf('iseguras')>=0||l==='is';}
  function isAdminRisk(){var r=low(urole()),l=low(login());return r==='operativo'||r==='admin_riesgos'||r.indexOf('administrador de riesgos')>=0||l==='admin_riesgos';}
  function activeModule(){var id='';try{Array.from(document.querySelectorAll('.page.active')).some(function(p){if(getComputedStyle(p).display!=='none'){id=p.id||'';return true;}return false;});}catch(e){}return id;}
  function headersObj(init){var h=new Headers(init&&init.headers||{});h.set('X-SGRT-User',login());h.set('X-SGRT-Name',uname());h.set('X-SGRT-Role',urole());h.set('X-SGRT-Entity',entity());h.set('X-SGRT-Session',sessionId());h.set('X-SGRT-Module',activeModule());return h;}

  // Añade identidad operacional a las llamadas API sin cambiar el body ni Content-Type.
  window.fetch=function(input,init){
    var url=typeof input==='string'?input:(input&&input.url)||'',sameApi=/^\/api\//.test(url)||url.indexOf(location.origin+'/api/')===0;
    if(!sameApi) return rawFetch(input,init);
    var next=Object.assign({},init||{});next.headers=headersObj(init||{});return rawFetch(input,next);
  };

  async function api(url,opt){var r=await window.fetch(url,opt||{}),j=null;try{j=await r.json();}catch(e){j={ok:false,error:'Respuesta no JSON'};}if(!r.ok||j&&j.ok===false)throw new Error((j&&j.error)||('HTTP '+r.status));return j;}
  async function event(type,message,extra){extra=extra||{};try{return await rawFetch('/api/telemetry/event',{method:'POST',headers:{'Content-Type':'application/json','X-SGRT-User':login(),'X-SGRT-Name':uname(),'X-SGRT-Role':urole(),'X-SGRT-Entity':entity(),'X-SGRT-Session':sessionId(),'X-SGRT-Module':activeModule()},body:JSON.stringify({eventType:type,moduleId:activeModule(),message:s(message),nit:s(extra.nit),contractNo:s(extra.contractNo||extra.contrato),meta:extra.meta||null,actor:{userLogin:login(),userName:uname(),userRole:urole(),entityId:entity(),sessionId:sessionId()}})});}catch(e){return null;}}
  window.sgrt43Event=event;

  function toast(msg,type){try{if(window.showToast)return window.showToast(msg,type||'info',4000);if(window.toast)return window.toast(msg,type||'info');}catch(e){}console.log('[SGRT]',msg);}

  // Eventos de cambios ya existentes: se reflejan en Azure sin alterar el comportamiento original.
  function wrapEvents(){
    if(typeof window.sendNotification==='function'&&!window.sendNotification._sgrt43){var old=window.sendNotification,fn=function(tipo,asunto,mensaje,datos){var r=old.apply(this,arguments);event('notification',s(asunto)+(mensaje?' — '+s(mensaje):''),{meta:{tipo:tipo,datos:datos||{}}});return r;};fn._sgrt43=true;window.sendNotification=fn;}
    if(typeof window.addLog==='function'&&!window.addLog._sgrt43){var al=window.addLog,lf=function(tercero,tabla,campo,ant,nuevo,fecha,tipo){var r=al.apply(this,arguments);event('change',(tipo||'Cambio')+' · '+(tabla||'SGRT')+' · '+(campo||''),{nit:s(tercero),meta:{tabla:tabla,campo:campo,anterior:ant,nuevo:nuevo,fecha:fecha}});return r;};lf._sgrt43=true;window.addLog=lf;}
  }

  // ─────────────────────────────────────────────────────────────
  // PANEL ISEGURAS: USO Y RECURSOS
  // ─────────────────────────────────────────────────────────────
  function usagePage(){
    if(!isIS())return null;
    var main=document.getElementById('admin-main-content'),side=document.getElementById('asb-IS');if(!main||!side)return null;
    var sec=Array.from(side.querySelectorAll('.nav-sec')).find(function(x){return /configuraci[oó]n/i.test(x.textContent);})||null;
    if(!document.getElementById('sgrt43-usage-nav')){
      var n=document.createElement('div');n.id='sgrt43-usage-nav';n.className='nav-item';n.setAttribute('onclick',"goPageIS('admin-pg-uso-recursos')");n.innerHTML='<span class="lbl">Uso y Recursos</span>';
      if(sec)side.insertBefore(n,sec);else side.appendChild(n);
    }
    if(!document.getElementById('sgrt43-tests-nav')){
      var tn=document.createElement('div');tn.id='sgrt43-tests-nav';tn.className='nav-item';tn.setAttribute('onclick',"goPageIS('admin-pg-set-pruebas')");tn.innerHTML='<span class="lbl">Set de Pruebas</span>';
      if(sec)side.insertBefore(tn,sec);else side.appendChild(tn);
    }
    var p=document.getElementById('admin-pg-uso-recursos');if(p)return p;
    p=document.createElement('div');p.id='admin-pg-uso-recursos';p.className='page';p.innerHTML='\
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:18px;">\
        <div><h2 style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:var(--navy);margin:0;">Uso y Recursos</h2><div style="font-size:12px;color:var(--muted);margin-top:4px;">Usuarios, sesiones, solicitudes, tráfico estimado y salud global del servidor.</div></div>\
        <div style="display:flex;gap:7px;align-items:center;"><select id="sgrt43-days" style="padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;"><option value="1">Hoy</option><option value="7" selected>7 días</option><option value="30">30 días</option><option value="90">90 días</option></select><button class="btn btn-primary btn-sm" onclick="window.sgrt43LoadUsage()">Actualizar</button></div>\
      </div>\
      <div id="sgrt43-usage-body"><div style="padding:30px;text-align:center;color:#64748b;">Cargando telemetría…</div></div>\
      <div class="card" style="margin-top:16px;border-left:4px solid #7c3aed;"><div style="padding:13px 16px;"><div style="font-weight:800;color:#4c1d95;margin-bottom:5px;">Ejemplo para demostración</div><div style="font-size:11px;color:#64748b;margin-bottom:9px;">Completa un riesgo y seguimiento de <b>Aportes en Línea</b> solo si ese tercero existe y aún no tiene riesgos registrados. Nunca reemplaza datos reales.</div><button class="btn btn-outline btn-sm" onclick="window.sgrt43SeedAportesDemo(true)">Preparar / verificar ejemplo Aportes en Línea</button><span id="sgrt43-demo-status" style="font-size:11px;color:#64748b;margin-left:8px;"></span></div></div>';
    main.appendChild(p);return p;
  }
  function mb(n){n=Number(n||0);return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB';}
  function dt(v){try{return v?new Date(v).toLocaleString('es-CO'): '—';}catch(e){return s(v)||'—';}}
  async function loadUsage(){
    var body=document.getElementById('sgrt43-usage-body');if(!body)return;body.innerHTML='<div style="padding:25px;text-align:center;color:#64748b;">Actualizando…</div>';
    var days=s((document.getElementById('sgrt43-days')||{}).value)||'7';
    try{var j=await api('/api/telemetry/summary?days='+encodeURIComponent(days)),t=j.totals||{},sv=j.server||{},users=j.users||[];
      // Mostrar TODOS los usuarios configurados aunque todavía no tengan consumo registrado.
      var byLogin={};users.forEach(function(u){byLogin[low(u.UserLogin)]=u;});
      Object.keys(window.USERS||{}).forEach(function(k){var cfg=(window.USERS||{})[k]||{},id=low(k),u=byLogin[id];if(!u){u={UserLogin:k,UserName:cfg.name||cfg.nombre||k,UserRole:cfg.rol||cfg.role||'Sin rol',EntityId:cfg.entidad||cfg.entidadId||'',Sessions:0,ApiRequests:0,Actions:0,BytesIn:0,BytesOut:0,LastSeen:null};users.push(u);byLogin[id]=u;}else{u.UserName=u.UserName||cfg.name||cfg.nombre||k;u.UserRole=u.UserRole||cfg.rol||cfg.role||'Sin rol';u.EntityId=u.EntityId||cfg.entidad||cfg.entidadId||'';}});
      users.sort(function(a,b){return (Number(b.ApiRequests||0)+Number(b.Actions||0))-(Number(a.ApiRequests||0)+Number(a.Actions||0))||s(a.UserName||a.UserLogin).localeCompare(s(b.UserName||b.UserLogin),'es');});
      body.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px;margin-bottom:14px;">'+[
        ['Usuarios únicos',t.UniqueUsers||0],['Activos 24h',t.Active24h||0],['Sesiones',t.Sessions||0],['Solicitudes API',t.ApiRequests||0],['Acciones',t.Actions||0],['Pruebas ejecutadas',t.UserTests||0],['Tráfico',mb(Number(t.BytesIn||0)+Number(t.BytesOut||0))]
      ].map(function(x){return '<div style="background:white;border:1px solid #dbe5ee;border-radius:8px;padding:13px;"><div style="font-size:9.5px;color:#64748b;text-transform:uppercase;font-weight:800;">'+esc(x[0])+'</div><div style="font-family:Montserrat,sans-serif;font-size:23px;font-weight:900;color:#173b5f;margin-top:5px;">'+esc(x[1])+'</div></div>';}).join('')+'</div>\
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;align-items:start;">\
        <div class="card"><div style="padding:11px 14px;border-bottom:1px solid #e2e8f0;font-weight:800;color:#173b5f;">Consumo estimado por usuario <span style="font-size:9px;font-weight:600;color:#64748b;">(incluye usuarios configurados sin actividad)</span></div><div style="overflow:auto;max-height:430px;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#f8fafc;position:sticky;top:0;"><th style="padding:8px;text-align:left;">Usuario</th><th>Rol</th><th>Entidad</th><th>Sesiones</th><th>API</th><th>Acciones</th><th>Tráfico</th><th>Última actividad</th></tr></thead><tbody>'+users.map(function(u){return '<tr style="border-top:1px solid #eef2f7;"><td style="padding:8px;"><b>'+esc(u.UserName||u.UserLogin)+'</b><div style="font-size:9px;color:#94a3b8;">'+esc(u.UserLogin)+'</div></td><td style="padding:8px;text-align:center;">'+esc(u.UserRole||'—')+'</td><td style="padding:8px;text-align:center;">'+esc(u.EntityId||'—')+'</td><td style="padding:8px;text-align:center;">'+Number(u.Sessions||0)+'</td><td style="padding:8px;text-align:center;">'+Number(u.ApiRequests||0)+'</td><td style="padding:8px;text-align:center;">'+Number(u.Actions||0)+'</td><td style="padding:8px;text-align:center;">'+mb(Number(u.BytesIn||0)+Number(u.BytesOut||0))+'</td><td style="padding:8px;white-space:nowrap;">'+esc(dt(u.LastSeen))+'</td></tr>';}).join('')+'</tbody></table></div></div>\
        <div class="card"><div style="padding:11px 14px;border-bottom:1px solid #e2e8f0;font-weight:800;color:#173b5f;">Servidor</div><div style="padding:13px;font-size:11px;line-height:1.8;"><b>RAM proceso:</b> '+esc(sv.rssMB||0)+' MB<br><b>Heap usado:</b> '+esc(sv.heapUsedMB||0)+' MB<br><b>Heap total:</b> '+esc(sv.heapTotalMB||0)+' MB<br><b>Uptime:</b> '+Math.round(Number(sv.uptimeSeconds||0)/60)+' min<br><b>Node:</b> '+esc(sv.node||'—')+'<div style="margin-top:9px;padding:8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;color:#9a3412;">'+esc(j.note||'El uso por usuario es una estimación operacional.')+'</div></div></div>\
      </div>';
    }catch(e){body.innerHTML='<div style="padding:18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:#9a3412;"><b>Telemetría no disponible.</b><br>'+esc(e.message)+'<br><span style="font-size:10px;">Si es el primer despliegue, verifica permisos de creación de tabla en Azure SQL.</span></div>';}
  }
  window.sgrt43LoadUsage=loadUsage;

  // ─────────────────────────────────────────────────────────────
  // SET DE PRUEBAS DE USUARIOS — ISEGURAS
  // ─────────────────────────────────────────────────────────────
  function testPage(){
    if(!isIS())return null;
    var main=document.getElementById('admin-main-content');if(!main)return null;
    var p=document.getElementById('admin-pg-set-pruebas');
    if(!p){
      p=document.createElement('div');p.id='admin-pg-set-pruebas';p.className='page';
      p.innerHTML='\
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:18px;">\
          <div><h2 style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:var(--navy);margin:0;">Set de Pruebas de Usuarios</h2><div style="font-size:12px;color:var(--muted);margin-top:4px;">Validación no destructiva de usuarios, roles, módulos, conexión, datos compartidos y concurrencia ligera.</div></div>\
          <button class="btn btn-outline btn-sm" onclick="goPageIS(\'admin-pg-uso-recursos\')">Ver Uso y Recursos</button>\
        </div>\
        <div class="card" style="margin-bottom:14px;border-left:4px solid #1e6bb8;"><div style="padding:14px;">\
          <div style="display:grid;grid-template-columns:2fr 1.4fr 1fr auto;gap:9px;align-items:end;">\
            <div><label style="display:block;font-size:10px;font-weight:800;color:#475569;margin-bottom:5px;">Usuario a validar</label><select id="sgrt43-test-user" onchange="window.sgrt43ShowTestUser&&window.sgrt43ShowTestUser()" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;"></select></div>\
            <div><label style="display:block;font-size:10px;font-weight:800;color:#475569;margin-bottom:5px;">Set de prueba</label><select id="sgrt43-test-set" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;"><option value="full">Completo</option><option value="access">Rol y módulos</option><option value="data">Datos compartidos / Azure</option><option value="concurrency">Concurrencia ligera</option></select></div>\
            <div><label style="display:block;font-size:10px;font-weight:800;color:#475569;margin-bottom:5px;">Usuarios virtuales</label><select id="sgrt43-test-vu" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;"><option value="1">1</option><option value="5" selected>5</option><option value="10">10</option><option value="20">20</option></select></div>\
            <button id="sgrt43-test-run" class="btn btn-primary" onclick="window.sgrt43RunUserTests()">Ejecutar set</button>\
          </div>\
          <div id="sgrt43-test-user-detail" style="margin-top:10px;padding:9px 11px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;font-size:10.5px;color:#334155;"></div><div style="font-size:10px;color:#64748b;margin-top:9px;line-height:1.5;"><b>Importante:</b> no inicia sesión como el usuario seleccionado, no usa su contraseña y no modifica sus datos. La prueba de concurrencia solo realiza lecturas seguras para medir respuesta y errores; no es una prueba de estrés.</div>\
        </div></div>\
        <div id="sgrt43-test-summary" style="margin-bottom:12px;"></div>\
        <div id="sgrt43-test-results" class="card"><div style="padding:28px;text-align:center;color:#64748b;">Selecciona un usuario y ejecuta un set de pruebas.</div></div>\
        <div class="card" style="margin-top:14px;"><div style="padding:11px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;"><b style="color:#173b5f;">Historial de pruebas</b><button class="btn btn-outline btn-sm" onclick="window.sgrt43LoadTestHistory()">Actualizar</button></div><div id="sgrt43-test-history" style="padding:12px 14px;color:#64748b;font-size:11px;">Cargando…</div></div>';
      main.appendChild(p);
    }
    populateTestUsers();return p;
  }
  function populateTestUsers(){
    var el=document.getElementById('sgrt43-test-user');if(!el)return;
    var prev=el.value,users=window.USERS||{},rows=Object.keys(users).sort().map(function(k){return {login:k,u:users[k]||{}};});
    el.innerHTML=rows.map(function(x){return '<option value="'+esc(x.login)+'">'+esc(x.u.name||x.u.nombre||x.login)+' · '+esc(x.u.rol||x.u.role||'Sin rol')+(x.u.entidad?' · '+esc(x.u.entidad):'')+'</option>';}).join('');
    if(prev&&users[prev])el.value=prev;else if(rows.length)el.value=rows[0].login;showTestUser();
  }
  function showTestUser(){var el=document.getElementById('sgrt43-test-user'),box=document.getElementById('sgrt43-test-user-detail');if(!el||!box)return;var k=s(el.value),u=(window.USERS||{})[k]||{},mods=expectedModulesFor(u);box.innerHTML='<b>'+esc(u.name||u.nombre||k||'Usuario')+'</b> · Rol: <b>'+esc(u.rol||u.role||'Sin rol')+'</b>'+(u.entidad?' · Entidad: <b>'+esc(u.entidad)+'</b>':'')+'<br><span style="color:#64748b;">Módulos esperados: '+esc(String(mods.length))+' · '+esc(mods.join(' · '))+'</span>'; }
  window.sgrt43ShowTestUser=showTestUser;
  function expectedModulesFor(u){
    var r=low(u&&u.rol),mods=[];
    if(r==='is'||r.indexOf('superadmin')>=0||r.indexOf('infraestructuras seguras')>=0){mods=['admin-pg-dashboard','admin-pg-usuarios','admin-pg-entidades','admin-pg-reportes-entidad','admin-pg-repo','admin-pg-logs','admin-pg-config-bd','admin-pg-uso-recursos','admin-pg-set-pruebas'];}
    else if(r==='operativo'||r.indexOf('administrador de riesgos')>=0||r==='admin_riesgos'){mods=['pg-clasificacion','pg-aprobar-op','pg-cuestionario','pg-matriz','pg-seguimiento','pg-tip-op','pg-ctrl-op','pg-config-riesgo','pg-evidencias-repo'];}
    else {mods=['pg-info-general','pg-clasificacion','pg-cuestionario','pg-matriz','pg-evidencias-repo','pg-reportes-entidad'];}
    return mods;
  }
  async function check(label,fn){var st=performance.now();try{var detail=await fn(),ms=Math.round(performance.now()-st);return {label:label,status:'ok',detail:s(detail)||'Correcto',ms:ms};}catch(e){return {label:label,status:'fail',detail:e.message||String(e),ms:Math.round(performance.now()-st)};}}
  function roleCheck(target,u){
    if(!u)throw new Error('El usuario no existe en la configuración cargada.');
    if(!s(u.rol))throw new Error('El usuario no tiene rol configurado.');
    var mods=expectedModulesFor(u),missing=mods.filter(function(id){return !document.getElementById(id);});
    if(missing.length)throw new Error('Faltan módulos esperados en la interfaz: '+missing.join(', '));
    return 'Rol '+u.rol+' · '+mods.length+' módulos esperados disponibles'+(u.entidad?' · Entidad '+u.entidad:'');
  }
  async function concurrencyCheck(count){
    count=Math.max(1,Math.min(20,Number(count)||5));var start=performance.now(),jobs=[];
    for(var i=0;i<count;i++)jobs.push((async function(){var t=performance.now(),r=await rawFetch('/api/status?probe='+Date.now()+'-'+Math.random(),{cache:'no-store'}),j=await r.json().catch(function(){return{};});if(!r.ok||j.ok===false)throw new Error('HTTP '+r.status);return Math.round(performance.now()-t);})());
    var vals=await Promise.all(jobs),total=Math.round(performance.now()-start),avg=Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length),max=Math.max.apply(Math,vals);
    return count+' lecturas simultáneas · promedio '+avg+' ms · máxima '+max+' ms · lote '+total+' ms';
  }
  function renderTestRows(rows){
    var box=document.getElementById('sgrt43-test-results');if(!box)return;
    box.innerHTML='<div style="overflow:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#f8fafc;"><th style="padding:9px;text-align:left;">Prueba</th><th style="padding:9px;text-align:center;">Estado</th><th style="padding:9px;text-align:left;">Resultado</th><th style="padding:9px;text-align:center;">Tiempo</th></tr></thead><tbody>'+rows.map(function(x){var ok=x.status==='ok';return '<tr style="border-top:1px solid #eef2f7;"><td style="padding:9px;font-weight:700;color:#173b5f;">'+esc(x.label)+'</td><td style="padding:9px;text-align:center;"><span style="padding:3px 8px;border-radius:999px;background:'+(ok?'#dcfce7':'#fee2e2')+';color:'+(ok?'#166534':'#991b1b')+';font-weight:800;">'+(ok?'OK':'FALLA')+'</span></td><td style="padding:9px;">'+esc(x.detail)+'</td><td style="padding:9px;text-align:center;white-space:nowrap;">'+Number(x.ms||0)+' ms</td></tr>';}).join('')+'</tbody></table></div>';
  }
  async function runUserTests(){
    var target=s((document.getElementById('sgrt43-test-user')||{}).value),set=s((document.getElementById('sgrt43-test-set')||{}).value)||'full',vu=s((document.getElementById('sgrt43-test-vu')||{}).value)||'5',u=(window.USERS||{})[target],btn=document.getElementById('sgrt43-test-run'),rows=[],started=Date.now();
    if(btn){btn.disabled=true;btn.textContent='Ejecutando…';}var box=document.getElementById('sgrt43-test-results');if(box)box.innerHTML='<div style="padding:28px;text-align:center;color:#64748b;">Ejecutando pruebas no destructivas…</div>';
    try{
      if(set==='full'||set==='access'){
        rows.push(await check('Configuración del usuario',async function(){if(!u)throw new Error('Usuario no encontrado');return 'Usuario '+target+' configurado sin exponer credenciales.';}));
        rows.push(await check('Rol y módulos habilitados',async function(){return roleCheck(target,u);}));
      }
      if(set==='full'||set==='data'){
        rows.push(await check('Backend SGRT',async function(){var j=await api('/api/status');if(!(j.database&&j.database.connected))throw new Error('Backend responde, pero Azure SQL figura desconectado.');return 'Servicio '+(j.service||'SGRT')+' · Azure SQL conectado';}));
        rows.push(await check('Maestro de terceros compartido',async function(){var j=await api('/api/terceros'),arr=j.data||j.terceros||j.rows||[];return arr.length+' tercero(s) disponibles desde el servidor';}));
        rows.push(await check('Estado SGRT compartido',async function(){var j=await api('/api/sgrt-state'),arr=j.data||[];return arr.length+' estado(s) SGRT disponibles para otros enlaces/equipos';}));
        rows.push(await check('Telemetría operacional',async function(){var j=await api('/api/telemetry/summary?days=1');return Number((j.totals||{}).UniqueUsers||0)+' usuario(s) únicos registrados hoy';}));
      }
      if(set==='full'||set==='concurrency')rows.push(await check('Concurrencia ligera',async function(){return concurrencyCheck(vu);}));
      var ok=rows.filter(function(x){return x.status==='ok';}).length,fail=rows.length-ok,pct=rows.length?Math.round(ok/rows.length*100):0,duration=Date.now()-started;
      renderTestRows(rows);var sm=document.getElementById('sgrt43-test-summary');if(sm)sm.innerHTML='<div style="display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px;"><div style="padding:11px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:7px;"><div style="font-size:9px;font-weight:800;color:#1e40af;text-transform:uppercase;">Resultado</div><div style="font-size:22px;font-weight:900;color:#173b5f;">'+pct+'%</div></div><div style="padding:11px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;"><div style="font-size:9px;font-weight:800;color:#166534;text-transform:uppercase;">Correctas</div><div style="font-size:22px;font-weight:900;color:#166534;">'+ok+'</div></div><div style="padding:11px;background:#fef2f2;border:1px solid #fecaca;border-radius:7px;"><div style="font-size:9px;font-weight:800;color:#991b1b;text-transform:uppercase;">Fallos</div><div style="font-size:22px;font-weight:900;color:#991b1b;">'+fail+'</div></div><div style="padding:11px;background:white;border:1px solid #e2e8f0;border-radius:7px;"><div style="font-size:9px;font-weight:800;color:#475569;text-transform:uppercase;">Duración</div><div style="font-size:22px;font-weight:900;color:#334155;">'+duration+' ms</div></div></div>';
      await event('user_test','Set de pruebas '+set+' · '+target+' · '+pct+'%',{meta:{targetUser:target,targetName:u&&u.name||'',targetRole:u&&u.rol||'',targetEntity:u&&u.entidad||'',testSet:set,virtualUsers:Number(vu),score:pct,passed:ok,failed:fail,durationMs:duration,results:rows}});
      toast('Set de pruebas finalizado: '+pct+'%','success');loadTestHistory();loadUsage();
    }catch(e){toast('No se pudo completar el set: '+e.message,'error');}
    finally{if(btn){btn.disabled=false;btn.textContent='Ejecutar set';}}
  }
  async function loadTestHistory(){var el=document.getElementById('sgrt43-test-history');if(!el)return;el.innerHTML='Actualizando…';try{var j=await api('/api/telemetry/user-tests?limit=30'),arr=j.data||[];if(!arr.length){el.innerHTML='Todavía no hay sets de prueba registrados.';return;}el.innerHTML='<div style="overflow:auto;max-height:330px;"><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#f8fafc;"><th style="padding:7px;text-align:left;">Fecha</th><th style="padding:7px;text-align:left;">Ejecutó</th><th style="padding:7px;text-align:left;">Usuario probado</th><th style="padding:7px;text-align:center;">Set</th><th style="padding:7px;text-align:center;">Resultado</th></tr></thead><tbody>'+arr.map(function(x){var m=x.meta||{};return '<tr style="border-top:1px solid #eef2f7;"><td style="padding:7px;white-space:nowrap;">'+esc(dt(x.CreatedAt))+'</td><td style="padding:7px;">'+esc(x.UserName||x.UserLogin||'—')+'</td><td style="padding:7px;"><b>'+esc(m.targetName||m.targetUser||'—')+'</b><div style="font-size:9px;color:#94a3b8;">'+esc(m.targetRole||'')+'</div></td><td style="padding:7px;text-align:center;">'+esc(m.testSet||'—')+'</td><td style="padding:7px;text-align:center;font-weight:900;color:'+(Number(m.score||0)>=80?'#166534':'#b45309')+';">'+esc(m.score==null?'—':m.score+'%')+'</td></tr>';}).join('')+'</tbody></table></div>';}catch(e){el.innerHTML='<span style="color:#b91c1c;">'+esc(e.message)+'</span>';}}
  window.sgrt43RunUserTests=runUserTests;window.sgrt43LoadTestHistory=loadTestHistory;

  // ─────────────────────────────────────────────────────────────
  // BORRADO SELECTIVO EN CONTROL BD
  // ─────────────────────────────────────────────────────────────
  function injectDbSafe(){
    if(!isIS())return;var page=document.getElementById('admin-pg-config-bd');if(!page||document.getElementById('sgrt43-db-safe'))return;
    var box=document.createElement('div');box.id='sgrt43-db-safe';box.className='card';box.style.cssText='margin-top:18px;border-left:4px solid #dc3545;';box.innerHTML='<div style="padding:12px 15px;border-bottom:1px solid #e2e8f0;"><div style="font-weight:900;color:#7f1d1d;">Borrado selectivo seguro</div><div style="font-size:10.5px;color:#64748b;margin-top:3px;">Solo permite operaciones explícitas. Configuración, credenciales y estructura SQL quedan protegidas.</div></div><div id="sgrt43-db-summary" style="padding:12px 15px;">Cargando…</div><div style="padding:0 15px 15px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;"><select id="sgrt43-delete-action" style="padding:7px;border:1px solid #cbd5e1;border-radius:6px;"><option value="activity_before">Limpiar actividad antigua</option><option value="state_by_nit">Borrar solo estado SGRT de un NIT</option><option value="third_full">Borrar tercero + estado (alto impacto)</option></select><input id="sgrt43-delete-value" placeholder="90 días o NIT" style="padding:7px;border:1px solid #cbd5e1;border-radius:6px;min-width:160px;"><input id="sgrt43-delete-confirm" placeholder="Confirmación (solo alto impacto)" style="padding:7px;border:1px solid #cbd5e1;border-radius:6px;min-width:230px;"><button class="btn btn-danger btn-sm" onclick="window.sgrt43DeleteSelected()">Ejecutar</button></div>';
    page.appendChild(box);loadDbSummary();
  }
  async function loadDbSummary(){var el=document.getElementById('sgrt43-db-summary');if(!el)return;try{var j=await api('/api/database/control-summary');el.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">'+(j.items||[]).map(function(x){return '<div style="padding:9px;border:1px solid #e2e8f0;border-radius:7px;background:#fafcff;"><div style="font-size:10px;font-weight:800;color:#334155;">'+esc(x.label)+'</div><div style="font-size:20px;font-weight:900;color:#173b5f;margin-top:3px;">'+(x.count==null?'—':x.count)+'</div><div style="font-size:9px;color:'+(x.deletable?'#15803d':'#b45309')+';">'+(x.deletable?'Borrado selectivo permitido':'Protegido')+'</div></div>';}).join('')+'</div><div style="font-size:9.5px;color:#64748b;margin-top:8px;"><b>Siempre protegido:</b> '+esc((j.protected||[]).join(' · '))+'</div>';}catch(e){el.innerHTML='<span style="color:#b91c1c;">'+esc(e.message)+'</span>';}}
  async function deleteSelected(){var a=s((document.getElementById('sgrt43-delete-action')||{}).value),v=s((document.getElementById('sgrt43-delete-value')||{}).value),c=s((document.getElementById('sgrt43-delete-confirm')||{}).value),payload={action:a};if(a==='activity_before')payload.days=Math.max(1,Number(v||90)||90);else payload.nit=v;if(a==='third_full')payload.confirm=c;if(a!=='activity_before'&&!v){toast('Escribe el NIT','warning');return;}if(!confirm('Esta operación modifica la base de datos. ¿Deseas continuar?'))return;try{var j=await api('/api/database/selective-delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});toast(j.message||'Operación realizada','success');event('database_delete',j.message||'Borrado selectivo',{nit:payload.nit||'',meta:{action:a}});loadDbSummary();}catch(e){toast('No se realizó: '+e.message,'error');}}
  window.sgrt43DeleteSelected=deleteSelected;

  // ─────────────────────────────────────────────────────────────
  // EXCEL CORPORATIVO REAL
  // ─────────────────────────────────────────────────────────────
  function ensureXLSX(){return new Promise(function(resolve,reject){if(window.XLSX)return resolve(window.XLSX);var sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';sc.onload=function(){resolve(window.XLSX);};sc.onerror=function(){reject(new Error('No se pudo cargar el generador Excel'));};document.head.appendChild(sc);});}
  function thirdDb(){return window.TERCEROS_DB||{};}
  function selectedReport(){var t=s((document.getElementById('sgrt42-third')||{}).value),c=s((document.getElementById('sgrt42-contract')||{}).value),e=s((document.getElementById('sgrt42-entity')||{}).value);return {nit:t,contract:c,entity:e};}
  function contracts(t){var a=[];(t&&Array.isArray(t.contratos)?t.contratos:[]).forEach(function(x){var n=s(typeof x==='object'?(x.numero||x.contrato||x.id):x);if(n&&a.indexOf(n)<0)a.push(n);});return a;}
  function risksFor(nit,third,contract){var arr=Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB:[];return arr.filter(function(r){var ok=!nit||s(r.nit)===nit||low(r.tercero)===low(third&&third.nombre);if(contract)ok=ok&&s(r.contrato)===contract;return ok;});}
  async function genExcel(){try{var X=await ensureXLSX(),sel=selectedReport(),db=thirdDb(),t=sel.nit?db[sel.nit]:null,all=sel.nit&&t?[[sel.nit,t]]:Object.entries(db),wb=X.utils.book_new(),now=new Date();
      var cover=[['GESTIÓN INTEGRAL — Infraestructuras Seguras'],['Reporte SGRT'],['Generado',now.toLocaleString('es-CO')],['Usuario',uname()||login()],['Rol',urole()],['Tercero',t&&t.nombre||'Todos'],['NIT',sel.nit||'Todos'],['Contrato',sel.contract||'Todos'],[],['Fuente','Datos registrados actualmente en SGRT / Azure sincronizado']];X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(cover),'Portada');
      var thirds=all.map(function(kv){var n=kv[0],x=kv[1]||{};return {NIT:n,Tercero:x.nombre||x.razonSocial||'',Entidad:x.entidad||x.entidadId||'',Contratos:contracts(x).join(', '),Estado:x.estado||'',Supervisor:x.supervisor||''};});X.utils.book_append_sheet(wb,X.utils.json_to_sheet(thirds),'Terceros');
      var cr=[];all.forEach(function(kv){contracts(kv[1]).forEach(function(c){if(!sel.contract||c===sel.contract)cr.push({NIT:kv[0],Tercero:(kv[1]||{}).nombre||'',Contrato:c,Supervisor:(kv[1]||{}).supervisor||''});});});X.utils.book_append_sheet(wb,X.utils.json_to_sheet(cr),'Contratos');
      var rr=[];all.forEach(function(kv){risksFor(kv[0],kv[1],sel.contract).forEach(function(r){rr.push({NIT:kv[0],Tercero:r.tercero||kv[1].nombre||'',Contrato:r.contrato||'',Riesgo:r.desc||r.riesgo||'',Tipo:r.tipo||'',Causa:r.causa||'',Vulnerabilidad:r.vuln||'',Probabilidad_Inherente:r.probInh||'',Impacto_Inherente:r.impInh||'',Zona_Inherente:r.zonaInh||'',Control:r.control||'',Probabilidad_Residual:r.probRes||'',Impacto_Residual:r.impRes||'',Zona_Residual:r.zonaRes||'',Tratamiento:r.tratamiento||'',Responsable:r.resp||'',Estado:r.estado||''});});});X.utils.book_append_sheet(wb,X.utils.json_to_sheet(rr),'Riesgos');
      var seg=[];all.forEach(function(kv){risksFor(kv[0],kv[1],sel.contract).forEach(function(r){if(r.plan||r.fechaSeg||r.descSeg||r.estado)seg.push({NIT:kv[0],Tercero:r.tercero||kv[1].nombre||'',Contrato:r.contrato||'',Riesgo:r.desc||'',Plan:r.plan||'',Responsable:r.resp||'',Fecha_Implementacion:r.fechaImpl||'',Fecha_Seguimiento:r.fechaSeg||'',Seguimiento:r.descSeg||'',Estado:r.estado||''});});});X.utils.book_append_sheet(wb,X.utils.json_to_sheet(seg),'Seguimiento');
      wb.SheetNames.forEach(function(n){var ws=wb.Sheets[n];ws['!cols']=Array.from({length:18},function(_,i){return {wch:i===0?22:i<4?26:34};});});var name='SGRT_Informe_'+(sel.nit||'General')+'_'+now.toISOString().slice(0,10)+'.xlsx';X.writeFile(wb,name);toast('Excel SGRT generado','success');event('report_export','Excel SGRT generado',{nit:sel.nit,contractNo:sel.contract,meta:{archivo:name}});
    }catch(e){toast('No se pudo generar Excel: '+e.message,'error');}}
  window.sgrtGenerarExcelFinal=genExcel;

  // ─────────────────────────────────────────────────────────────
  // SINCRONIZA RIESGOS ENTRE EQUIPOS / LINKS
  // ─────────────────────────────────────────────────────────────
  async function hydrateRisks(){try{var j=await api('/api/sgrt-state'),map={};(Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB:[]).forEach(function(r){map[s(r.nit)+'|'+s(r.contrato)+'|'+s(r.id||r.desc)]=r;});(j.data||[]).forEach(function(row){var nit=s(row.nit),st=row.estado_sgrt||{};(st._matrizRiesgos||[]).forEach(function(r){var x=Object.assign({},r);if(!x.nit)x.nit=nit;map[nit+'|'+s(x.contrato)+'|'+s(x.id||x.desc)]=x;});});window.MATRIZ_DB=Object.values(map);return window.MATRIZ_DB;}catch(e){return window.MATRIZ_DB||[];}}
  window.sgrt43HydrateRisks=hydrateRisks;

  // ─────────────────────────────────────────────────────────────
  // EJEMPLO APORTES EN LÍNEA — SOLO SI NO HAY RIESGOS REALES
  // ─────────────────────────────────────────────────────────────
  function supervisorOf(t){return s(t&&((Array.isArray(t.supervisores)&&t.supervisores[0])||t.supervisor||t.responsable))||'Responsable del contrato';}
  async function seedAportes(force){var status=document.getElementById('sgrt43-demo-status');if(status)status.textContent='Verificando…';try{var tj=await api('/api/terceros'),rows=tj.data||tj.terceros||tj.rows||[],found=rows.find(function(x){return low(x.nombre||x.razonSocial||x.tercero).indexOf('aportes')>=0;});
      if(!found){
        var demoNit='999999999-9',demoThird={nit:demoNit,nombre:'Aportes en Línea (Ejemplo SGRT)',domicilio:'Bogotá',servicio_contratado:'Servicios tecnológicos de recaudo y procesamiento de aportes'};
        await api('/api/terceros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tercero:demoThird})});
        var demoState={nit:demoNit,nombre:demoThird.nombre,entidad:'colpensiones',entidadLabel:'Colpensiones',domicilio:'Bogotá',servicio:'Servicios tecnológicos de recaudo y procesamiento de aportes',contratos:[{num:'94',objeto:'Servicio demostrativo para evaluación SGRT',estado:'En Ejecución'}],supervisores:[{nombre:'Supervisor de Ejemplo',cargo:'Supervisor de Contrato',proceso:'Gestión de terceros',contrato_asociado:'94'}],_demoEmpresa:true};
        await api('/api/sgrt-state/'+encodeURIComponent(demoNit),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({estado_sgrt:demoState})});
        found=demoThird;if(status)status.textContent='Se creó el tercero de ejemplo Aportes en Línea.';
      }
      var nit=s(found.nit||found.NIT),sj=null,st={};try{sj=await api('/api/sgrt-state/'+encodeURIComponent(nit));st=(sj.data&&sj.data.estado_sgrt)||sj.estado_sgrt||{};}catch(_stateMissing){st={};}var existing=Array.isArray(st._matrizRiesgos)?st._matrizRiesgos:[];if(existing.length){if(status)status.textContent='Ya tiene '+existing.length+' riesgo(s); no se reemplazó nada.';if(force)toast('Aportes en Línea ya tiene análisis real. No se modificó.','info');return true;}
      var dbt=thirdDb()[nit]||found||{},cs=contracts(Object.assign({},dbt,st)),contract=cs[0]||s(found.contrato||found.numeroContrato)||'SIN-CONTRATO',risk={id:'DEMO-APORTES-001',nit:nit,tercero:s(found.nombre||found.razonSocial||'Aportes en Línea'),entidad:s(found.entidad||found.entidadId||''),contrato:contract,tipo:'Riesgo Operativo',factor:'Disponibilidad del servicio',clasif:'Operativo / Continuidad',desc:'Interrupción del servicio de recaudo, consulta o procesamiento de aportes',causa:'Falla de infraestructura, integración o indisponibilidad de componentes críticos',vuln:'Dependencia de servicios tecnológicos y de la recuperación ante contingencias',frecuencia:'Mensual',impReput:'4',impEcon:'4',probInh:'4',impInh:'4',zonaInh:'EXTREMO',controles:[{desc:'Monitoreo de disponibilidad y plan de continuidad probado',tipo:'PREVENTIVO',automatizacion:'SEMIAUTOMÁTICO',documentacion:'DOCUMENTADO',frecuencia:'CONTINUA',registro:'CON REGISTRO',responsable:'Operación / Continuidad',efec:0.75}],control:'Monitoreo de disponibilidad y plan de continuidad probado',tipoCtrl:'PREVENTIVO',probRes:'2',impRes:'3',zonaRes:'MODERADO',tratamiento:'MITIGAR',plan:'Ejecutar prueba de recuperación, validar tiempos RTO/RPO y cerrar evidencias del plan de continuidad.',resp:supervisorOf(dbt),fechaImpl:'2026-10-15',fechaSeg:'2026-10-30',descSeg:'Prueba de continuidad programada; pendiente adjuntar evidencia final del resultado.',estado:'En Progreso',_demoEmpresa:true};
      await api('/api/sgrt-state/'+encodeURIComponent(nit)+'/riesgos',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({upserts:[risk],deleteIds:[],actor:{login:login(),nombre:uname(),rol:urole()}})});window.MATRIZ_DB=Array.isArray(window.MATRIZ_DB)?window.MATRIZ_DB:[];window.MATRIZ_DB.push(risk);if(status)status.textContent='Ejemplo listo · contrato '+contract;toast('Ejemplo Aportes en Línea preparado','success');event('risk_demo','Ejemplo de análisis y seguimiento preparado',{nit:nit,contractNo:contract,meta:{riskId:risk.id}});try{window.sendNotification&&window.sendNotification('riesgo','Ejemplo Aportes en Línea preparado','Se registró un riesgo demostrativo con seguimiento en el contrato '+contract,{NIT:nit,Contrato:contract});}catch(e){}return true;
    }catch(e){if(status)status.textContent='No se pudo preparar: '+e.message;if(force)toast('No se pudo preparar el ejemplo: '+e.message,'error');return false;}}
  window.sgrt43SeedAportesDemo=seedAportes;

  // ─────────────────────────────────────────────────────────────
  // NOTIFICACIONES MULTIUSUARIO DESDE ACTIVIDAD AZURE
  // ─────────────────────────────────────────────────────────────
  var pollBusy=false;
  async function pollActivity(){if(pollBusy||!login())return;pollBusy=true;try{var last=Number(sessionStorage.getItem('sgrt43_last_activity')||0),j=await api('/api/activity?limit=100&afterId='+last),mine=sessionId();(j.data||[]).forEach(function(x){var id=Number(x.ID||0);if(id>last)last=id;if(s(x.SessionId)===mine)return;if(['change','data_change','notification','importacion','database_delete','risk_demo','report_export'].indexOf(s(x.EventType))<0)return;var txt=s(x.Message)||s(x.EventType),who=s(x.UserName||x.UserLogin||'Otro usuario');try{if(typeof window.agregarNotificacion==='function')window.agregarNotificacion(who+': '+txt,'info','🔄');else if(typeof window.showToast==='function')window.showToast(who+': '+txt,'info',3500);}catch(e){};});sessionStorage.setItem('sgrt43_last_activity',String(j.lastId||last));}catch(e){}finally{pollBusy=false;}}

  function wrapNav(){
    var gp=window.goPageIS;if(typeof gp==='function'&&!gp._sgrt43){var ng=function(pg){var r=gp.apply(this,arguments);event('page_view','Abrió '+pg,{meta:{page:pg}});if(pg==='admin-pg-uso-recursos')setTimeout(loadUsage,90);if(pg==='admin-pg-set-pruebas')setTimeout(function(){testPage();populateTestUsers();loadTestHistory();},90);if(pg==='admin-pg-config-bd')setTimeout(function(){injectDbSafe();loadDbSummary();},90);return r;};ng._sgrt43=true;window.goPageIS=ng;}
    var nav=window.navTo;if(typeof nav==='function'&&!nav._sgrt43){var nn=function(el,pg){var r=nav.apply(this,arguments);event('page_view','Abrió '+pg,{meta:{page:pg}});if(pg==='pg-matriz'||pg==='pg-seguimiento')setTimeout(async function(){await hydrateRisks();try{if(pg==='pg-matriz'&&typeof window.renderMatriz==='function')window.renderMatriz();if(pg==='pg-seguimiento'&&typeof window.renderSeguimiento==='function')window.renderSeguimiento();if(pg==='pg-seguimiento'&&typeof window.sgrt42RenderTrackingPending==='function')window.sgrt42RenderTrackingPending();}catch(e){}},130);return r;};nn._sgrt43=true;window.navTo=nn;}
    var dl=window.doLogin;if(typeof dl==='function'&&!dl._sgrt43){var nd=function(){var r=dl.apply(this,arguments);setTimeout(function(){wrapEvents();usagePage();testPage();injectDbSafe();event('login','Inicio de sesión');hydrateRisks();pollActivity();if(isIS()||isAdminRisk())seedAportes(false);},700);return r;};nd._sgrt43=true;window.doLogin=nd;}
  }

  function init(){wrapEvents();wrapNav();usagePage();testPage();injectDbSafe();if(login()){event('session_start','Sesión de interfaz activa');hydrateRisks();pollActivity();if(isIS()||isAdminRisk())seedAportes(false);}setInterval(function(){wrapEvents();if(login()){hydrateRisks();pollActivity();}},60000);setInterval(pollActivity,25000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,800);});else setTimeout(init,800);
})();
