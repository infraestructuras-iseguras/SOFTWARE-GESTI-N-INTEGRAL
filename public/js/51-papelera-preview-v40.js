/* SGRT 51 — V40. SOLO mejora visual de ISEGURAS > Papelera > Archivos activos.
   - Permite seleccionar/visualizar archivos activos antes de enviarlos a papelera.
   - Evita que nombres largos invadan otras columnas.
   No altera Evaluador, Ambiente de Control, Riesgos, sincronización ni otras funciones. */
(function(){
  'use strict';
  if(window.__SGRT51_FILE_PREVIEW__) return;
  window.__SGRT51_FILE_PREVIEW__=true;

  function s(v){return String(v==null?'':v).trim();}
  function low(v){return s(v).toLowerCase();}
  function esc(v){return s(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function user(){return window.currentUser||{};}
  function isIS(){var x=user(),r=low(x.rol||x.role),l=low(x.login||x.user||x.username);return r==='is'||r==='iseguras'||r.indexOf('superadmin')>=0||r.indexOf('infraestructuras seguras')>=0||l==='iseguras2026'||l==='is';}
  function headers(extra){var x=user(),h=Object.assign({},extra||{});h['X-SGRT-User']=s(x.login||x.user||x.username);h['X-SGRT-Name']=s(x.name||x.nombre);h['X-SGRT-Role']=s(x.rol||x.role);h['X-SGRT-Entity']=s(x.entidad||x.entityId);return h;}
  async function api(url,opt){opt=Object.assign({},opt||{});opt.headers=headers(opt.headers);var r=await fetch(url,opt),j={};try{j=await r.json();}catch(e){}if(!r.ok||j.ok===false)throw new Error(j.error||('HTTP '+r.status));return j;}
  function bytes(v){var n=Number(v||0);if(!n)return '—';if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB';}
  function fileTypeLabel(t){return t==='evidence_ac'?'Evidencia Ambiente de Control':t==='evidence_risk'?'Evidencia Análisis de Riesgos':t==='document'?'Documento generado':'Archivo';}
  function toast(m,t){try{if(window.showToast)return window.showToast(m,t||'info',4200);if(window.toast)return window.toast(m,t||'info');}catch(e){}alert(m);}

  function closePreview(){
    var m=document.getElementById('sgrt51-preview-modal');
    if(m){
      var url=m.getAttribute('data-blob-url');
      if(url){try{URL.revokeObjectURL(url);}catch(e){}}
      m.remove();
    }
  }

  function renderPreviewBody(blob,name,mime,url){
    var mt=low(mime), safeName=esc(name||'Archivo');
    if(mt.indexOf('image/')===0){
      return '<div style="display:flex;justify-content:center;align-items:center;min-height:280px;background:#f8fafc;border-radius:8px;padding:12px;"><img src="'+esc(url)+'" alt="'+safeName+'" style="max-width:100%;max-height:65vh;object-fit:contain;border-radius:6px;"></div>';
    }
    if(mt==='application/pdf'||/\.pdf$/i.test(name||'')){
      return '<iframe title="Vista previa '+safeName+'" src="'+esc(url)+'" style="width:100%;height:65vh;border:1px solid #e2e8f0;border-radius:8px;background:white;"></iframe>';
    }
    if(mt.indexOf('text/')===0||/\.(txt|csv|json|xml|log)$/i.test(name||'')){
      return '<iframe title="Vista previa '+safeName+'" src="'+esc(url)+'" style="width:100%;height:58vh;border:1px solid #e2e8f0;border-radius:8px;background:white;"></iframe>';
    }
    return '<div style="padding:30px;text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;color:#475569;line-height:1.6;"><div style="font-size:32px;margin-bottom:8px;">📄</div><b>'+safeName+'</b><br>Este tipo de archivo no tiene vista previa nativa en el navegador.<br><span style="font-size:11px;">Puedes descargarlo para revisarlo sin enviarlo a la papelera.</span></div>';
  }

  async function previewFile(nit,type,id,name,mime){
    if(!isIS())return;
    closePreview();
    var m=document.createElement('div');
    m.id='sgrt51-preview-modal';
    m.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;';
    m.innerHTML='<div style="background:white;border-radius:12px;width:min(980px,96vw);max-height:92vh;overflow:auto;box-shadow:0 18px 55px rgba(0,0,0,.28);"><div style="position:sticky;top:0;z-index:2;padding:13px 16px;background:#173b5f;color:white;display:flex;justify-content:space-between;gap:12px;align-items:center;"><div style="min-width:0;"><b style="display:block;overflow-wrap:anywhere;">'+esc(name||'Archivo')+'</b><span style="font-size:10px;opacity:.82;">'+esc(fileTypeLabel(type))+' · '+esc(nit||'—')+'</span></div><button type="button" id="sgrt51-close" aria-label="Cerrar" style="border:0;background:transparent;color:white;font-size:24px;cursor:pointer;line-height:1;">×</button></div><div id="sgrt51-preview-body" style="padding:16px;"><div style="padding:35px;text-align:center;color:#64748b;">Cargando vista previa…</div></div><div style="padding:0 16px 16px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;"><a id="sgrt51-download" class="btn btn-outline btn-sm" href="#" download="'+esc(name||'archivo')+'">Descargar</a><button type="button" id="sgrt51-close-bottom" class="btn btn-primary btn-sm">Cerrar</button></div></div>';
    document.body.appendChild(m);
    m.querySelector('#sgrt51-close').addEventListener('click',closePreview);
    m.querySelector('#sgrt51-close-bottom').addEventListener('click',closePreview);
    m.addEventListener('click',function(e){if(e.target===m)closePreview();});
    try{
      var url='/api/iseguras/files/'+encodeURIComponent(nit)+'/'+encodeURIComponent(type)+'/'+encodeURIComponent(id)+'/content';
      var r=await fetch(url,{headers:headers()});
      if(!r.ok)throw new Error(r.status===404?'No hay contenido disponible para vista previa.':'HTTP '+r.status);
      var blob=await r.blob(), obj=URL.createObjectURL(blob), mt=r.headers.get('content-type')||mime||blob.type||'';
      m.setAttribute('data-blob-url',obj);
      var dl=m.querySelector('#sgrt51-download');dl.href=obj;dl.download=name||'archivo';
      var body=m.querySelector('#sgrt51-preview-body');if(body)body.innerHTML=renderPreviewBody(blob,name,mt,obj);
    }catch(e){
      var body=m.querySelector('#sgrt51-preview-body');if(body)body.innerHTML='<div style="padding:24px;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;border-radius:8px;"><b>No se pudo mostrar la vista previa.</b><br>'+esc(e.message)+'</div>';
      var dl=m.querySelector('#sgrt51-download');if(dl)dl.style.display='none';
    }
  }

  async function loadFiles(){
    if(!isIS())return;
    var body=document.getElementById('sgrt47-files-body');if(!body)return;
    body.innerHTML='<div style="padding:28px;text-align:center;color:#64748b;">Buscando archivos activos en Azure…</div>';
    var q=s((document.getElementById('sgrt47-files-q')||{}).value);
    try{
      var j=await api('/api/iseguras/files?limit=800&q='+encodeURIComponent(q)),arr=j.data||[];
      if(!arr.length){body.innerHTML='<div style="padding:35px;text-align:center;color:#64748b;background:white;border:1px solid #e2e8f0;border-radius:9px;">No se encontraron archivos activos con este filtro.</div>';return;}
      body.innerHTML='<div style="overflow-x:auto;background:white;border:1px solid #e2e8f0;border-radius:9px;"><table style="width:100%;border-collapse:collapse;font-size:10.8px;table-layout:fixed;min-width:980px;"><colgroup><col style="width:30%"><col style="width:16%"><col style="width:18%"><col style="width:18%"><col style="width:8%"><col style="width:10%"></colgroup><thead><tr style="background:#f8fafc;color:#334155;"><th style="padding:9px;text-align:left;">Archivo</th><th style="padding:9px;text-align:left;">Tipo</th><th style="padding:9px;text-align:left;">Tercero / NIT</th><th style="padding:9px;text-align:left;">Contrato / carpeta</th><th style="padding:9px;text-align:left;">Tamaño</th><th style="padding:9px;text-align:right;">Acciones</th></tr></thead><tbody>'+arr.map(function(x){
        var args=[JSON.stringify(String(x.nit||'')),JSON.stringify(String(x.type||'')),JSON.stringify(String(x.id||'')),JSON.stringify(String(x.name||x.id||'Archivo')),JSON.stringify(String(x.mime||''))].join(',');
        return '<tr class="sgrt51-file-row" style="border-top:1px solid #eef2f7;vertical-align:top;">'+
          '<td style="padding:9px;min-width:0;"><button type="button" onclick="window.sgrt51PreviewFile('+args+')" title="Ver archivo" style="width:100%;text-align:left;border:1px solid #dbeafe;background:#f8fbff;border-radius:7px;padding:8px 9px;color:#0f3154;cursor:pointer;font:inherit;font-weight:700;overflow-wrap:anywhere;word-break:break-word;white-space:normal;line-height:1.35;">'+esc(x.name||x.id)+'</button></td>'+
          '<td style="padding:9px;overflow-wrap:anywhere;word-break:break-word;">'+esc(fileTypeLabel(x.type))+'</td>'+ 
          '<td style="padding:9px;overflow-wrap:anywhere;word-break:break-word;">'+esc(x.tercero||'—')+'<div style="font-size:9px;color:#64748b;margin-top:3px;">'+esc(x.nit||'—')+'</div></td>'+ 
          '<td style="padding:9px;overflow-wrap:anywhere;word-break:break-word;">'+(x.contractNo?'<b>Contrato '+esc(x.contractNo)+'</b><br>':'')+'<span style="font-size:9px;color:#64748b;">'+esc(x.folder||'—')+'</span></td>'+ 
          '<td style="padding:9px;white-space:nowrap;">'+esc(bytes(x.size))+'</td>'+ 
          '<td style="padding:9px;text-align:right;"><div style="display:flex;flex-direction:column;align-items:stretch;gap:6px;"><button type="button" class="btn btn-outline btn-sm" onclick="window.sgrt51PreviewFile('+args+')">👁 Ver archivo</button><button type="button" class="btn btn-outline btn-sm" style="color:#b91c1c;border-color:#fecaca;white-space:normal;" onclick="window.sgrt47TrashFile('+JSON.stringify(String(x.nit))+','+JSON.stringify(String(x.type))+','+JSON.stringify(String(x.id))+','+JSON.stringify(String(x.name||x.id))+')">Enviar a papelera</button></div></td></tr>';
      }).join('')+'</tbody></table></div>';
    }catch(e){body.innerHTML='<div style="padding:18px;border:1px solid #fecaca;background:#fff1f2;color:#991b1b;border-radius:8px;">No se pudieron cargar los archivos: '+esc(e.message)+'</div>';}
  }

  window.sgrt51PreviewFile=previewFile;
  window.sgrt47LoadFiles=loadFiles;

  // 47 se carga antes; reafirma la sobreescritura una vez por si su inicialización fue diferida.
  setTimeout(function(){window.sgrt47LoadFiles=loadFiles;},500);
})();
