/* SGRT — Power BI Embedded sin login Microsoft por cada usuario.
 * V10: solo interviene la tarjeta Power BI del Administrador de Riesgos.
 * Mantiene el iframe anterior como fallback si el backend aún no tiene
 * Service Principal / permisos de Power BI configurados.
 */
(function(){
  'use strict';

  var SDK_URL='https://cdn.jsdelivr.net/npm/powerbi-client@2.24.1/dist/powerbi.min.js';
  var LOCAL_URL_KEY='sgrt_powerbi_embed_url';
  var reportInstance=null;
  var refreshTimer=null;
  var sdkPromise=null;
  var mounting=false;
  var syncedLocalUrl='';
  var lastEmbedKey='';
  var retryAfter=0;

  function norm(v){return String(v==null?'':v).trim();}
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'http://localhost:3000').replace(/\/$/,'');}
  function role(){return norm((window.currentUser||{}).rol);}
  function isAdminRisk(){var r=role().toLowerCase();return r.indexOf('administrador')>=0&&r.indexOf('riesgo')>=0;}
  function headers(extra){var h={'Accept':'application/json','X-SGRT-Role':role()};Object.keys(extra||{}).forEach(function(k){h[k]=extra[k];});return h;}
  function toast(msg,type){try{window.showToast&&window.showToast(msg,type||'info',3000);}catch(e){}}

  function localEmbedUrl(){try{return norm(localStorage.getItem(LOCAL_URL_KEY)||'');}catch(e){return '';}}

  function parseIds(raw){
    var v=norm(raw);if(!v)return null;
    var m=v.match(/<iframe[^>]+src=["']([^"']+)["']/i);if(m&&m[1])v=m[1].replace(/&amp;/g,'&');
    try{
      var u=new URL(v,window.location.href),g=norm(u.searchParams.get('groupId')),r=norm(u.searchParams.get('reportId'));
      if(!g||!r){var p=u.pathname.match(/\/groups\/([^\/?#]+)\/reports\/([^\/?#]+)/i);if(p){g=p[1];r=p[2];}}
      return g&&r?{workspaceId:g,reportId:r,embedUrl:'https://app.powerbi.com/reportEmbed?reportId='+encodeURIComponent(r)+'&groupId='+encodeURIComponent(g)}:null;
    }catch(e){return null;}
  }

  async function syncLocalConnectionToServer(force){
    var url=localEmbedUrl();if(!url||(!force&&url===syncedLocalUrl))return false;
    var ids=parseIds(url);if(!ids)return false;
    try{
      var r=await fetch(apiBase()+'/api/powerbi/report-config',{
        method:'POST',headers:headers({'Content-Type':'application/json'}),body:JSON.stringify({embedUrl:url,workspaceId:ids.workspaceId,reportId:ids.reportId}),cache:'no-store'
      });
      if(!r.ok)return false;
      syncedLocalUrl=url;return true;
    }catch(e){return false;}
  }

  async function loadServerReportIntoLocal(){
    if(localEmbedUrl())return;
    try{
      var r=await fetch(apiBase()+'/api/powerbi/report-config',{headers:headers(),cache:'no-store'});if(!r.ok)return;
      var d=await r.json();if(!d||!d.ok||!d.embedUrl)return;
      try{localStorage.setItem(LOCAL_URL_KEY,d.embedUrl);}catch(e){}
    }catch(e){}
  }

  function loadSdk(){
    if(window.powerbi&&window['powerbi-client']&&window['powerbi-client'].models)return Promise.resolve(true);
    if(sdkPromise)return sdkPromise;
    sdkPromise=new Promise(function(resolve,reject){
      var old=document.querySelector('script[data-sgrt-powerbi-sdk="1"]');
      if(old){old.addEventListener('load',function(){resolve(!!(window.powerbi&&window['powerbi-client']));},{once:true});old.addEventListener('error',reject,{once:true});return;}
      var s=document.createElement('script');s.src=SDK_URL;s.async=true;s.defer=true;s.setAttribute('data-sgrt-powerbi-sdk','1');
      s.onload=function(){window.powerbi&&window['powerbi-client']?resolve(true):reject(new Error('SDK Power BI no disponible'));};s.onerror=function(){reject(new Error('No se pudo cargar SDK Power BI'));};
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function shell(){return document.getElementById('sgrt-powerbi-stable-shell');}

  function ensureHost(){
    var sh=shell();if(!sh)return null;
    var wrap=document.getElementById('sgrt-powerbi-frame-wrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='sgrt-powerbi-frame-wrap';wrap.style.cssText='height:680px;min-height:520px;position:relative;background:#f7f9fc;';sh.appendChild(wrap);
    }
    var oldFrame=document.getElementById('sgrt-powerbi-stable-frame');
    if(!oldFrame){
      oldFrame=document.createElement('iframe');oldFrame.id='sgrt-powerbi-stable-frame';oldFrame.title='Power BI fallback';oldFrame.style.cssText='display:none;width:0;height:0;border:0;';oldFrame.setAttribute('aria-hidden','true');wrap.appendChild(oldFrame);
    }else{
      oldFrame.style.display='none';oldFrame.style.width='0';oldFrame.style.height='0';oldFrame.setAttribute('aria-hidden','true');
      // Evita que el iframe seguro convencional mantenga abierta la pantalla de login.
      try{if(oldFrame.src&&oldFrame.src!=='about:blank')oldFrame.src='about:blank';}catch(e){}
    }
    var loader=document.getElementById('sgrt-powerbi-loader');if(loader)loader.style.display='none';
    var host=document.getElementById('sgrt-powerbi-embedded-host');
    if(!host){host=document.createElement('div');host.id='sgrt-powerbi-embedded-host';host.style.cssText='width:100%;height:100%;min-height:520px;background:#fff;';wrap.appendChild(host);}
    return host;
  }

  function showConnecting(){
    var host=ensureHost();if(!host)return;
    if(host.getAttribute('data-ready')==='1')return;
    host.innerHTML='<div style="height:100%;min-height:520px;display:flex;align-items:center;justify-content:center;color:#52606d;background:#f7f9fc;"><div style="text-align:center;"><div style="font-size:30px;margin-bottom:9px;">📊</div><b>Cargando reporte Power BI…</b><div style="font-size:11px;margin-top:5px;color:#8291a1;">Acceso integrado del SGRT</div></div></div>';
  }

  function restoreFallback(){
    var host=document.getElementById('sgrt-powerbi-embedded-host');if(host){try{if(window.powerbi)window.powerbi.reset(host);}catch(e){}host.remove();}
    var fr=document.getElementById('sgrt-powerbi-stable-frame');
    var url=localEmbedUrl();
    if(fr&&url){fr.style.cssText='width:100%;height:100%;border:0;display:block;background:#fff;';try{if(fr.src==='about:blank'||!fr.src)fr.src=url;}catch(e){}}
  }

  async function getEmbedConfig(){
    var r=await fetch(apiBase()+'/api/powerbi/embed-config',{headers:headers(),cache:'no-store'});
    var d={};try{d=await r.json();}catch(e){}
    if(!r.ok||!d.ok){var er=new Error(d.error||('HTTP '+r.status));er.code=d.code||'';er.status=r.status;throw er;}
    return d;
  }

  function scheduleTokenRefresh(expiration){
    if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=null;}
    var exp=Date.parse(expiration||'');if(!exp)return;
    var ms=Math.max(60000,exp-Date.now()-5*60*1000);
    refreshTimer=setTimeout(async function(){
      try{
        var d=await getEmbedConfig();
        if(reportInstance&&d.accessToken&&typeof reportInstance.setAccessToken==='function')await reportInstance.setAccessToken(d.accessToken);
        scheduleTokenRefresh(d.expiration);
      }catch(e){console.warn('Power BI: no se pudo renovar token',e.message);refreshTimer=setTimeout(function(){mountEmbedded(true);},60000);}
    },ms);
  }

  async function mountEmbedded(force){
    if(!isAdminRisk()||mounting)return false;
    if(!force&&Date.now()<retryAfter)return false;
    var sh=shell();if(!sh)return false;
    if(!force&&sh.getAttribute('data-sgrt-powerbi-embedded')==='1'&&document.getElementById('sgrt-powerbi-embedded-host'))return true;
    mounting=true;
    try{
      await loadServerReportIntoLocal();
      await syncLocalConnectionToServer(false);
      showConnecting();
      var d=await getEmbedConfig();
      await loadSdk();
      var host=ensureHost();if(!host)throw new Error('No se encontró el contenedor Power BI');
      var models=window['powerbi-client'].models;
      var key=String(d.workspaceId||'')+'|'+String(d.reportId||'');
      try{window.powerbi.reset(host);}catch(e){}
      host.innerHTML='';host.setAttribute('data-ready','0');
      reportInstance=window.powerbi.embed(host,{
        type:'report',
        id:d.reportId,
        embedUrl:d.embedUrl,
        accessToken:d.accessToken,
        tokenType:models.TokenType.Embed,
        permissions:models.Permissions.Read
      });
      lastEmbedKey=key;retryAfter=0;
      sh.setAttribute('data-sgrt-powerbi-embedded','1');
      if(reportInstance&&typeof reportInstance.on==='function'){
        reportInstance.on('loaded',function(){host.setAttribute('data-ready','1');});
        reportInstance.on('rendered',function(){host.setAttribute('data-ready','1');});
        reportInstance.on('error',function(ev){var msg=ev&&ev.detail&&ev.detail.message||'Error de Power BI';console.warn('Power BI Embedded:',msg);});
      }
      scheduleTokenRefresh(d.expiration);
      return true;
    }catch(e){
      console.warn('Power BI Embedded no disponible, se conserva fallback:',e.code||'',e.message);
      retryAfter=Date.now()+((e&&e.code==='POWERBI_SERVICE_PRINCIPAL_NOT_CONFIGURED')?5*60*1000:60*1000);
      restoreFallback();
      // No mostrar errores invasivos cada vez. Solo informar cuando falten credenciales.
      if(e&&e.code==='POWERBI_SERVICE_PRINCIPAL_NOT_CONFIGURED'&&!window._sgrtPbiWarned){window._sgrtPbiWarned=true;toast('Power BI requiere configurar una sola vez las credenciales Embedded en Azure.','warning');}
      return false;
    }finally{mounting=false;}
  }

  // Cuando el administrador pega/cambia el vínculo, se replica al servidor para
  // que los demás usuarios no dependan del localStorage de este navegador.
  var oldConfigure=window.sgrtConfigurarPowerBI;
  if(typeof oldConfigure==='function'&&!oldConfigure._sgrt38){
    var configured=function(){
      var r=oldConfigure.apply(this,arguments);
      setTimeout(async function(){await syncLocalConnectionToServer(true);var sh=shell();if(sh)sh.removeAttribute('data-sgrt-powerbi-embedded');mountEmbedded(true);},180);
      return r;
    };configured._sgrt38=true;window.sgrtConfigurarPowerBI=configured;
  }

  var oldReload=window.sgrtRecargarPowerBI;
  if(typeof oldReload==='function'&&!oldReload._sgrt38){
    var reload=function(){
      if(reportInstance&&typeof reportInstance.refresh==='function'){
        getEmbedConfig().then(function(d){if(reportInstance&&d.accessToken)return reportInstance.setAccessToken(d.accessToken).then(function(){scheduleTokenRefresh(d.expiration);return reportInstance.refresh();});}).catch(function(){mountEmbedded(true);});
        return;
      }
      var r=oldReload.apply(this,arguments);setTimeout(function(){mountEmbedded(true);},160);return r;
    };reload._sgrt38=true;window.sgrtRecargarPowerBI=reload;
  }

  var oldOpen=window.abrirReportesPowerBIAdmin;
  if(typeof oldOpen==='function'&&!oldOpen._sgrt38){
    var open=function(){var r=oldOpen.apply(this,arguments);setTimeout(function(){mountEmbedded(false);},180);return r;};open._sgrt38=true;window.abrirReportesPowerBIAdmin=open;
  }

  function boot(){
    setTimeout(async function(){
      if(!isAdminRisk())return;
      await loadServerReportIntoLocal();
      await syncLocalConnectionToServer(false);
      if(shell())mountEmbedded(false);
    },500);
  }

  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('pageshow',boot);

  // Si la tarjeta se reconstruye por una actualización del tablero, vuelve a
  // montar el mismo reporte sin cambiar ninguna otra sección del sistema.
  var observer=new MutationObserver(function(){
    if(!isAdminRisk())return;
    var sh=shell();if(!sh)return;
    if(!document.getElementById('sgrt-powerbi-embedded-host')||sh.getAttribute('data-sgrt-powerbi-embedded')!=='1')setTimeout(function(){mountEmbedded(false);},80);
  });
  try{observer.observe(document.body,{childList:true,subtree:true});}catch(e){}
})();
