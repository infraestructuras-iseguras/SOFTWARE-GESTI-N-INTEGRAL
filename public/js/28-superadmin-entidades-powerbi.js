/* SGRT — Superadministrador: entidades Azure + Power BI multi-entidad. */
(function(){
  'use strict';
  var KEY='sgrt_powerbi_superadmin_url';
  function isIS(){var u=window.currentUser||{};return ['IS','iseguras','Superadministrador','Super Administrador'].indexOf(u.rol)>=0||u.login==='iseguras2026';}
  function base(){return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');}
  function toast(t,type){try{showToast(t,type||'info',2600);}catch(e){}}
  function cleanName(v){return String(v||'').replace(/[🏛🏭🏦🛢]/g,'').trim();}
  async function sync(list){
    try{var r=await fetch(base()+'/api/entidades/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entidades:(list||[]).map(function(e){return{id:e.id,nombre:cleanName(e.nombre||e.id),acronimo:e.acronimo||'',estado:e.estado||'Activo'};})})});if(!r.ok)throw new Error('HTTP '+r.status);return true;}catch(e){console.warn('Entidades: sincronización Azure pendiente',e.message);return false;}
  }
  async function pull(){
    if(!isIS())return;
    try{var r=await fetch(base()+'/api/entidades',{cache:'no-store'});if(!r.ok)return;var d=await r.json();if(!d.ok||!Array.isArray(d.data))return;var local=window.getISEntidades?window.getISEntidades():[],map={};local.forEach(function(e){map[e.id]=e;});d.data.forEach(function(e){map[e.id]={id:e.id,nombre:e.nombre,acronimo:e.acronimo||'',fecha:e.fechaCreacion?new Date(e.fechaCreacion).toLocaleDateString('es-CO'):(map[e.id]&&map[e.id].fecha)||''};});var merged=Object.keys(map).map(function(k){return map[k];});if(window._sgrt28OldSave)window._sgrt28OldSave(merged);try{window.renderEntidadesIS&&window.renderEntidadesIS();}catch(_e){} }catch(e){}
  }
  if(typeof window.saveISEntidades==='function'&&!window._sgrt28OldSave){
    window._sgrt28OldSave=window.saveISEntidades;
    window.saveISEntidades=function(list){var r=window._sgrt28OldSave.apply(this,arguments);sync(list);return r;};
  }
  function normalizeEmbed(v){
    v=String(v||'').trim();if(!v)return'';
    var m=v.match(/src=["']([^"']+)["']/i);if(m)v=m[1];
    if(v.indexOf('/groups/')>=0&&v.indexOf('/reports/')>=0&&!/reportEmbed/i.test(v)){
      var a=v.match(/\/groups\/([^\/]+)\/reports\/([^\/?#]+)/i);if(a)v='https://app.powerbi.com/reportEmbed?reportId='+encodeURIComponent(a[2])+'&groupId='+encodeURIComponent(a[1])+'&autoAuth=true';
    }
    return v;
  }
  window.configurarPowerBISuperadmin=function(){
    if(!isIS())return;var old=localStorage.getItem(KEY)||'';var x=prompt('Pega el vínculo seguro reportEmbed del Power BI Multi-Entidad:',old);if(x===null)return;x=normalizeEmbed(x);if(x)localStorage.setItem(KEY,x);else localStorage.removeItem(KEY);renderBI(true);
  };
  window.recargarPowerBISuperadmin=function(){renderBI(true);};
  function renderBI(force){
    if(!isIS())return;var page=document.getElementById('admin-pg-reportes-entidad');if(!page)return;
    var host=document.getElementById('sgrt-superadmin-powerbi');
    if(!host){host=document.createElement('div');host.id='sgrt-superadmin-powerbi';host.style.marginBottom='18px';var anchor=page.querySelector('#admin-rpe-wrap');if(anchor)page.insertBefore(host,anchor);else page.appendChild(host);}
    var url=normalizeEmbed(localStorage.getItem(KEY)||'');
    var current=host.getAttribute('data-url')||'';
    if(url&&current===url&&!force&&host.querySelector('iframe'))return; // NO reconstruir iframe.
    host.setAttribute('data-url',url);
    host.innerHTML='<div style="background:white;border:1px solid #dbe3ea;border-radius:10px;box-shadow:0 3px 12px rgba(15,42,67,.08);overflow:hidden;">'
      +'<div style="padding:14px 16px;background:linear-gradient(135deg,#0d2740,#1e6bb8);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">'
      +'<div><div style="font-size:15px;font-weight:800;color:white;">📊 Power BI Multi-Entidad · Superadministrador</div><div style="font-size:11px;color:rgba(255,255,255,.72);margin-top:2px;">Portafolio completo de organizaciones, terceros, fases, controles y riesgos.</div></div>'
      +'<div style="display:flex;gap:7px;"><button class="btn btn-sm" style="background:white;color:#173b5f;font-weight:800;" onclick="window.configurarPowerBISuperadmin()">'+(url?'Cambiar conexión':'Conectar Power BI')+'</button>'+(url?'<button class="btn btn-sm" style="background:#e8f4ff;color:#173b5f;font-weight:800;" onclick="window.recargarPowerBISuperadmin()">↻ Recargar</button>':'')+'</div></div>'
      +(url?'<div style="height:610px;background:#f8fafc;"><iframe title="Power BI Superadmin Multi-Entidad" src="'+url.replace(/"/g,'&quot;')+'" style="width:100%;height:100%;border:0;" allowfullscreen="true"></iframe></div>':'<div style="padding:38px;text-align:center;color:#64748b;"><div style="font-size:34px;">🏢📊</div><b>Power BI de Superadministrador listo para conectar</b><div style="font-size:11px;margin-top:6px;">Publica SGRT_SUPERADMIN_ENTIDADES y pega aquí el vínculo reportEmbed.</div></div>')
      +'</div>';
  }
  var oldGo=window.goPageIS;
  if(typeof oldGo==='function'&&!oldGo._sgrt28){var n=function(pg){var r=oldGo.apply(this,arguments);if(pg==='admin-pg-reportes-entidad')setTimeout(function(){renderBI(false);pull();},120);return r;};n._sgrt28=true;window.goPageIS=n;}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){if(isIS()){pull().then(function(){try{sync(window.getISEntidades?window.getISEntidades():[]);}catch(e){}});renderBI(false);}},700);});
})();
