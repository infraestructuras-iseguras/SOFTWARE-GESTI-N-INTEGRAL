/* SGRT 47 — Papelera y Recuperación ISEGURAS.
   Solo agrega recuperación; no cambia flujos de Evaluador, Riesgos, IA o Evidencias. */
(function(){
  'use strict';
  if(window.__SGRT47_RECOVERY__) return; window.__SGRT47_RECOVERY__=true;
  function s(v){return String(v==null?'':v).trim();}
  function low(v){return s(v).toLowerCase();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function u(){return window.currentUser||{};}
  function isIS(){var x=u(),r=low(x.rol||x.role),l=low(x.login||x.user||x.username);return r==='is'||r==='iseguras'||r.indexOf('superadmin')>=0||r.indexOf('infraestructuras seguras')>=0||l==='iseguras2026'||l==='is';}
  function headers(extra){var x=u(),h=Object.assign({},extra||{});h['X-SGRT-User']=s(x.login||x.user||x.username);h['X-SGRT-Name']=s(x.name||x.nombre);h['X-SGRT-Role']=s(x.rol||x.role);h['X-SGRT-Entity']=s(x.entidad||x.entityId);return h;}
  async function api(url,opt){opt=Object.assign({},opt||{});opt.headers=headers(opt.headers);var r=await fetch(url,opt),j={};try{j=await r.json();}catch(e){}if(!r.ok||j.ok===false)throw new Error(j.error||('HTTP '+r.status));return j;}
  function toast(m,t){try{if(window.showToast)return window.showToast(m,t||'info',4200);if(window.toast)return window.toast(m,t||'info');}catch(e){}alert(m);}
  function dt(v){try{return v?new Date(v).toLocaleString('es-CO'):'—';}catch(e){return s(v)||'—';}}
  function typeLabel(t){return ({tercero_full:'Tercero completo',state_full:'Estado SGRT',contract_evaluator:'Respuestas de contrato',evidence_ac:'Evidencia de Ambiente de Control',evidence_risk:'Evidencia de Riesgo',risk:'Riesgo',document:'Documento generado'})[t]||t||'Registro';}

  function ensureUI(){
    var side=document.getElementById('asb-IS'),main=document.getElementById('admin-main-content');if(!side||!main)return;
    if(!document.getElementById('sgrt47-recovery-nav')){
      var logs=Array.from(side.querySelectorAll('.nav-item')).find(function(n){return /logs de auditor/i.test(n.textContent);});
      var nav=document.createElement('div');nav.id='sgrt47-recovery-nav';nav.className='nav-item';nav.setAttribute('onclick',"goPageIS('admin-pg-recuperacion');setTimeout(function(){window.sgrt47LoadRecovery&&window.sgrt47LoadRecovery();},60)");nav.innerHTML='<span class="lbl">Papelera y Recuperación</span>';
      if(logs&&logs.nextSibling)side.insertBefore(nav,logs.nextSibling);else side.appendChild(nav);
    }
    if(!document.getElementById('admin-pg-recuperacion')){
      var p=document.createElement('div');p.id='admin-pg-recuperacion';p.className='page';p.innerHTML='\
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px;">\
          <div><h2 style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:var(--navy);margin:0;">Papelera y Recuperación</h2><div style="font-size:12px;color:var(--muted);margin-top:4px;max-width:800px;">Recupera información eliminada accidentalmente. Se conserva quién eliminó el elemento, fecha, tercero y contrato. La recuperación está disponible únicamente para ISEGURAS.</div></div>\
          <button class="btn btn-primary btn-sm" onclick="window.sgrt47LoadRecovery()">Actualizar</button>\
        </div>\
        <div style="padding:12px 14px;background:#eef7ff;border:1px solid #bfdbfe;border-radius:9px;margin-bottom:14px;font-size:11px;color:#334155;line-height:1.55;"><b>Qué se puede recuperar:</b> terceros completos, estado SGRT, respuestas eliminadas con <b>Limpiar</b>, evidencias, riesgos y documentos generados. <b>La limpieza masiva de telemetría antigua no entra en la papelera</b>, para evitar duplicar miles de registros.</div>\
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;">\
          <select id="sgrt47-status" onchange="window.sgrt47LoadRecovery()" style="padding:8px 10px;border:1px solid #cbd5e1;border-radius:7px;"><option value="Deleted">Pendientes de recuperar</option><option value="Restored">Ya recuperados</option></select>\
          <input id="sgrt47-q" placeholder="Buscar NIT, contrato, archivo, usuario…" style="padding:8px 10px;border:1px solid #cbd5e1;border-radius:7px;min-width:280px;" onkeydown="if(event.key===\'Enter\')window.sgrt47LoadRecovery()">\
          <button class="btn btn-outline btn-sm" onclick="window.sgrt47LoadRecovery()">Buscar</button>\
        </div>\
        <div id="sgrt47-body"><div style="padding:28px;text-align:center;color:#64748b;">Abre este módulo para consultar la papelera.</div></div>';
      main.appendChild(p);
    }
  }

  async function load(){ensureUI();if(!isIS())return;var body=document.getElementById('sgrt47-body');if(!body)return;body.innerHTML='<div style="padding:28px;text-align:center;color:#64748b;">Consultando papelera en Azure…</div>';
    var status=s((document.getElementById('sgrt47-status')||{}).value)||'Deleted',q=s((document.getElementById('sgrt47-q')||{}).value);
    try{var j=await api('/api/recycle-bin?status='+encodeURIComponent(status)+'&limit=300&q='+encodeURIComponent(q)),arr=j.data||[];
      if(!arr.length){body.innerHTML='<div style="padding:35px;text-align:center;color:#64748b;background:white;border:1px solid #e2e8f0;border-radius:9px;">'+(status==='Deleted'?'No hay elementos pendientes de recuperar.':'No hay elementos restaurados en este filtro.')+'</div>';return;}
      body.innerHTML='<div style="overflow:auto;background:white;border:1px solid #e2e8f0;border-radius:9px;"><table style="width:100%;border-collapse:collapse;font-size:10.8px;min-width:980px;"><thead><tr style="background:#f8fafc;color:#334155;"><th style="padding:9px;text-align:left;">Eliminado</th><th style="padding:9px;text-align:left;">Tipo</th><th style="padding:9px;text-align:left;">Tercero / contrato</th><th style="padding:9px;text-align:left;">Elemento</th><th style="padding:9px;text-align:left;">Eliminado por</th><th style="padding:9px;text-align:center;">Estado</th><th style="padding:9px;text-align:right;">Acciones</th></tr></thead><tbody>'+arr.map(function(x){var deleted=x.Status==='Deleted';return '<tr style="border-top:1px solid #eef2f7;"><td style="padding:9px;white-space:nowrap;">'+esc(dt(x.DeletedAt))+'</td><td style="padding:9px;font-weight:700;">'+esc(typeLabel(x.EntityType))+'</td><td style="padding:9px;"><b>'+esc(x.NIT||'—')+'</b><div style="font-size:9px;color:#64748b;">'+(x.ContractNo?'Contrato '+esc(x.ContractNo):'Sin contrato')+'</div></td><td style="padding:9px;max-width:330px;">'+esc(x.Label||x.ItemId||'Registro eliminado')+'</td><td style="padding:9px;">'+esc(x.DeletedByName||x.DeletedByLogin||'No identificado')+'<div style="font-size:9px;color:#94a3b8;">'+esc(x.DeletedByRole||'')+'</div></td><td style="padding:9px;text-align:center;"><span style="display:inline-block;padding:3px 8px;border-radius:12px;background:'+(deleted?'#fff7ed':'#ecfdf5')+';color:'+(deleted?'#9a3412':'#166534')+';font-weight:800;">'+(deleted?'Eliminado':'Recuperado')+'</span></td><td style="padding:9px;text-align:right;white-space:nowrap;"><button class="btn btn-outline btn-sm" onclick="window.sgrt47Detail('+Number(x.ID)+')">Ver detalle</button> '+(deleted?'<button class="btn btn-primary btn-sm" onclick="window.sgrt47Restore('+Number(x.ID)+')">Restaurar</button>':'')+'</td></tr>';}).join('')+'</tbody></table></div>';
    }catch(e){body.innerHTML='<div style="padding:18px;border:1px solid #fecaca;background:#fff1f2;color:#991b1b;border-radius:8px;">No se pudo consultar la papelera: '+esc(e.message)+'</div>';}
  }

  function payloadSummary(data){var p=data&&data.payload,t=data&&data.EntityType;if(!p)return 'No hay vista previa disponible.';
    if(t==='tercero_full'){var x=p.tercero||{};return '<b>Tercero:</b> '+esc(x.Nombre_Tercero||x.nombre||data.NIT)+'<br><b>NIT:</b> '+esc(data.NIT)+'<br><b>Incluye:</b> registro maestro + estado SGRT disponible al momento del borrado.';}
    if(t==='contract_evaluator'){var b=p.blocks||{};return '<b>Contrato:</b> '+esc(data.ContractNo)+'<br><b>Bloques recuperables:</b> '+esc(Object.keys(b).join(', ')||'Respuestas del contrato')+'.';}
    if(t==='evidence_ac'||t==='evidence_risk'){var it=p.item||{};return '<b>Archivo:</b> '+esc(it.name||it.nombre||data.Label)+'<br><b>Tipología / carpeta:</b> '+esc(it.tipologia||it.dimension||p.groupKey||'—')+'<br><b>Tamaño:</b> '+esc(it.size||'—');}
    if(t==='risk'){var r=p.item||{};return '<b>Riesgo:</b> '+esc(r.desc||r.riesgo||r.nombre||data.Label)+'<br><b>Contrato:</b> '+esc(r.contrato||data.ContractNo||'—')+'<br><b>Estado:</b> '+esc(r.estado||'—');}
    if(t==='document'){var d=p.item||{};return '<b>Documento:</b> '+esc(d.name||d.nombre||d.fileName||data.Label)+'<br><b>Tipo:</b> '+esc(d.type||d.mime||'—')+'<br><b>Contrato:</b> '+esc(d.contrato||data.ContractNo||'—');}
    return '<pre style="white-space:pre-wrap;font-size:10px;max-height:320px;overflow:auto;background:#f8fafc;padding:10px;border-radius:7px;">'+esc(JSON.stringify(p,null,2).slice(0,12000))+'</pre>';
  }
  async function detail(id){try{var j=await api('/api/recycle-bin/'+encodeURIComponent(id)),d=j.data||{};var old=document.getElementById('sgrt47-modal');if(old)old.remove();var m=document.createElement('div');m.id='sgrt47-modal';m.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';m.innerHTML='<div style="background:white;border-radius:12px;max-width:700px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 18px 55px rgba(0,0,0,.25);"><div style="padding:15px 18px;background:#173b5f;color:white;display:flex;justify-content:space-between;align-items:center;"><div><b>'+esc(typeLabel(d.EntityType))+'</b><div style="font-size:10px;opacity:.8;margin-top:2px;">Eliminado '+esc(dt(d.DeletedAt))+'</div></div><button onclick="document.getElementById(\'sgrt47-modal\').remove()" style="border:0;background:transparent;color:white;font-size:20px;cursor:pointer;">×</button></div><div style="padding:18px;font-size:11px;line-height:1.6;"><div style="margin-bottom:12px;"><b>Elemento:</b> '+esc(d.Label||d.ItemId||'—')+'<br><b>NIT:</b> '+esc(d.NIT||'—')+' &nbsp; <b>Contrato:</b> '+esc(d.ContractNo||'—')+'<br><b>Eliminado por:</b> '+esc(d.DeletedByName||d.DeletedByLogin||'No identificado')+'</div><div style="border-top:1px solid #e2e8f0;padding-top:12px;">'+payloadSummary(d)+'</div>'+(d.Status==='Deleted'?'<div style="margin-top:16px;text-align:right;"><button class="btn btn-primary" onclick="window.sgrt47Restore('+Number(d.ID)+');document.getElementById(\'sgrt47-modal\').remove()">Restaurar este elemento</button></div>':'')+'</div></div>';document.body.appendChild(m);}catch(e){toast('No se pudo abrir el detalle: '+e.message,'error');}}
  async function restore(id){if(!confirm('¿Restaurar este elemento? Se recuperará únicamente el registro seleccionado.'))return;try{var j=await api('/api/recycle-bin/'+encodeURIComponent(id)+'/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});toast(j.message||'Elemento restaurado','success');await load();try{if(typeof window.cargarTercerosDesdeAPI==='function')window.cargarTercerosDesdeAPI();else if(typeof window.loadTercerosFromAPI==='function')window.loadTercerosFromAPI();}catch(e){}}catch(e){toast('No se pudo restaurar: '+e.message,'error');}}

  window.sgrt47LoadRecovery=load;window.sgrt47Restore=restore;window.sgrt47Detail=detail;
  ensureUI();
  setTimeout(ensureUI,1000);setTimeout(ensureUI,3000);
})();
