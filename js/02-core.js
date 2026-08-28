
/* ================================================================
   MÓDULO EXTERNO — script independiente del defer
   ================================================================ */

// Ensure globals are on window so inline onclick always finds them
(function() {

  // ✅ Función para escapar HTML especial
  window.esc = function(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  if (!window.CLS_DB) window.CLS_DB = {};

  /* ── clsTab ─────────────────────────────────────────────────── */
  window.clsTab = function(t) {
    var pf = document.getElementById('cls-panel-form');
    var pd = document.getElementById('cls-panel-dash');
    var tf = document.getElementById('cls-tab-form');
    var td = document.getElementById('cls-tab-dash');
    if (!pf || !pd) return;
    if (t === 'form') {
      pf.style.display = ''; pd.style.display = 'none';
      if (tf) tf.classList.add('active');
      if (td) td.classList.remove('active');
      // Inicializar buffer de supervisores si no existe
      if(!window._cfSupervisoresBuffer) window._cfSupervisoresBuffer = [];
      // Renderizar el bloque de contratos adicionales (aunque esté vacío)
      try{ window._cfCtrRender && window._cfCtrRender(); }catch(e){}
      // Renderizar supervisores (aunque esté vacío)
      try{ window._cfRenderSupervisoresTercero && window._cfRenderSupervisoresTercero(); }catch(e){}
    } else {
      pf.style.display = 'none'; pd.style.display = '';
      if (td) td.classList.add('active');
      if (tf) tf.classList.remove('active');
      window.clsInitDash();
    }
  };

  /* ── clsInitDash ─────────────────────────────────────────────── */
  window.clsInitDash = function() {
    var cur = new Date().getFullYear().toString();
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    // Ingest from TERCEROS_DB
    Object.values(db).forEach(function(t) {
      var yr = t.yr || cur;
      if (!window.CLS_DB[yr]) window.CLS_DB[yr] = [];
      var idx = window.CLS_DB[yr].findIndex(function(r){return r.nit===t.nit;});
      var rec = {nit:t.nit, nombre:t.nombre, entidad:t.entidad, servicio:t.servicio,
                 supervisor:t.supervisor, domicilio:t.domicilio, prom:t.prom, zona:t.zona,
                 periodicidad:t.periodicidad, yr:yr, dims:(t.dims||[]), contratos:(t.contratos||[]), supervisores:(t.supervisores||[])};
      if(idx>=0) window.CLS_DB[yr][idx]=rec; else window.CLS_DB[yr].push(rec);
    });
    if (!window.CLS_DB[cur]) window.CLS_DB[cur] = [];
    var years = Object.keys(window.CLS_DB).sort().reverse();
    if (years.indexOf(cur)<0) years.unshift(cur);
    var wrap = document.getElementById('cls-yr-btns'); if(!wrap) return;
    var sel = wrap.dataset.sel || cur; wrap.dataset.sel = sel;
    wrap.innerHTML = years.map(function(yr){
      var active = yr===sel;
      var count = (window.CLS_DB[yr]||[]).length;
      return '<button onclick="clsSelYear(\''+yr+'\')" style="padding:5px 16px;border-radius:20px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:'+(active?'700':(count?'600':'400'))+';border:2px solid '+(active?'var(--blue)':'var(--border2)')+';background:'+(active?'var(--blue)':'white')+';color:'+(active?'white':(count?'var(--text)':'var(--muted)'))+';">'+yr+(count&&!active?' ('+count+')':'')+'</button>';
    }).join('');
    window.clsRender();
  };

  window.clsSelYear = function(yr){
    var wrap=document.getElementById('cls-yr-btns'); if(wrap) wrap.dataset.sel=yr;
    window.clsInitDash();
  };

  // ✅ Toggle expandir/contraer fila de contratos y supervisores
  window.clsToggleExpandir = function(nit){
    var el = document.getElementById('exp-' + nit);
    if(!el) return;
    var isHidden = el.style.display === 'none';
    el.style.display = isHidden ? '' : 'none';
    
    // Rotar el icono ▼ ▶
    var btn = document.querySelector('[onclick*="clsToggleExpandir"]');
    if(btn){
      btn.textContent = isHidden ? '▼' : '▶';
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // SGRT v35 - CAMBIAR TEXTO: "Ver mis Riesgos" → "Ver mis Resultados"
  // ═══════════════════════════════════════════════════════════════════
  window.actualizarTextoBotonResultados = function(){
    let rolActual = window.ROLE_ACTUAL || sessionStorage.getItem('ROLE_ACTUAL') || localStorage.getItem('ROLE_ACTUAL') || '';
    let btnResultados = document.getElementById('texto-btn-resultados');
    if(!btnResultados) return;
    
    if(rolActual === 'admin_riesgos' || rolActual === 'Administrador de Riesgos'){
      btnResultados.textContent = '📊 Ver mis Reportes';
      console.log('✅ SGRT v35: Texto cambiado a "Ver mis Resultados" para Administrador de Riesgos');
    } else {
      btnResultados.textContent = '📊 Ver mis Riesgos';
    }
  };

  window.clsRender = function(){
    // 🔄 PRIMERO: Cargar desde localStorage (sincronización)
    try {
      const localDB = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}');
      if(Object.keys(localDB).length > 0 && typeof TERCEROS_DB === 'object') {
        Object.assign(TERCEROS_DB, localDB);
      }
    } catch(e) { console.warn('⚠️ clsRender - carga localStorage:', e); }
    
    // ⭐ Sincronizar CLS_DB desde TERCEROS_DB primero
    try{
      var cur = new Date().getFullYear().toString();
      var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
      Object.values(db).forEach(function(t) {
        var yr = t.yr || cur;
        if (!window.CLS_DB[yr]) window.CLS_DB[yr] = [];
        var idx = window.CLS_DB[yr].findIndex(function(r){return r.nit===t.nit;});
        var rec = {nit:t.nit, nombre:t.nombre, entidad:t.entidad, servicio:t.servicio,
                   supervisor:t.supervisor, domicilio:t.domicilio, prom:t.prom, zona:t.zona,
                   periodicidad:t.periodicidad, yr:yr, dims:(t.dims||[]), contratos:(t.contratos||[]), supervisores:(t.supervisores||[])};
        if(idx>=0) window.CLS_DB[yr][idx]=rec; else window.CLS_DB[yr].push(rec);
      });
    }catch(e){}
    
    var wrap=document.getElementById('cls-yr-btns');
    var yr=(wrap&&wrap.dataset.sel)||new Date().getFullYear().toString();
    var q=((document.getElementById('cls-dash-q')||{}).value||'').toLowerCase();
    var zona=(document.getElementById('cls-dash-zona')||{}).value||'';
    var ent=(document.getElementById('cls-dash-ent')||{}).value||'';
    var recs=(window.CLS_DB[yr]||[]).filter(function(r){
      if(q&&(r.nombre||'').toLowerCase().indexOf(q)<0&&(r.nit||'').toLowerCase().indexOf(q)<0) return false;
      if(zona&&r.zona!==zona) return false;
      if(ent&&(r.entidad||'').toLowerCase().replace(/ /g,'')!==ent) return false;
      return true;
    });
    var ext=0,med=0,bajo=0;
    recs.forEach(function(r){var p=parseFloat(r.prom||0);if(p>=4)ext++;else if(p>=3)med++;else bajo++;});
    function se(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
    se('cls-k-ext',ext);se('cls-k-med',med);se('cls-k-bajo',bajo);se('cls-k-tot',recs.length);
    var _titleRole=(window.currentUser&&window.currentUser.rol)||'';
    se('cls-dash-ttl',(_titleRole==='Cliente'||_titleRole==='evaluador')?'Registro de terceros y clasificación de terceros':'Registros de Terceros');
    se('cls-dash-sub',recs.length+' registro'+(recs.length!==1?'s':''));
    var EL={colpensiones:'Colpensiones',ecopetrol:'Ecopetrol',bancolombia:'Bancolombia'};
    var EB={colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',ecopetrol:'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',bancolombia:'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'};
    // Update banner organization text based on current filter
    var bannerOrgText = document.getElementById('banner-org-text');
    if(bannerOrgText) bannerOrgText.textContent = ent ? (EL[ent]||'Todas') : 'Colpensiones';
    var tbody=document.getElementById('cls-dash-tbody'); if(!tbody) return;
    
    // ✅ ARREGLO: Verificar rol correctamente
    // - evaluador (o Cliente): Solo VER (lectura)
    // - admin_riesgos: Puede editar/ver detalles
    var rolActual = (typeof window.currentUser !== 'undefined' && window.currentUser) 
      ? window.currentUser.rol 
      : 'desconocido';
    var esEvaluador = (rolActual === 'evaluador' || rolActual === 'Cliente');
    var esAdminRiesgos = (rolActual === 'admin_riesgos' || rolActual === 'Operativo');
    
    console.log('🔐 Rol actual:', rolActual, '| Es Evaluador:', esEvaluador, '| Es Admin:', esAdminRiesgos);

    // Solo el Administrador de Riesgos no muestra la columna Tipologías /
    // Puntajes en el listado; el Evaluador conserva su vista de lectura completa.
    var ocultarTipologias = esAdminRiesgos;
    var thTipologias = document.getElementById('cls-th-tipologias');
    if(thTipologias) thTipologias.style.display = ocultarTipologias ? 'none' : '';
    
    if(!recs.length){tbody.innerHTML='<tr><td colspan="'+(ocultarTipologias?7:8)+'" style="text-align:center;padding:30px;color:var(--muted);">Sin registros para '+yr+'.</td></tr>';return;}
    // Get current organization filter from selector - reflects active org context
    var orgFilterVal = (document.getElementById('cls-dash-ent') && document.getElementById('cls-dash-ent').value) || '';
    tbody.innerHTML=recs.map(function(r){
      var p=parseFloat(r.prom||0);
      var cc=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
      // Display organization: use filter if active, else stored entidad
      var displayOrg = orgFilterVal ? EL[orgFilterVal] : r.entidad;
      var ek=(displayOrg||'').toLowerCase().replace(/ /g,'');
      var eL=EL[ek]||displayOrg||'-';
      var eBg=EB[ek]||'';
      var zc=p>=4?'var(--red)':p>=3?'var(--orange)':'var(--green)';
      // Columna de tipologías: nombre + puntaje en color por cada dimensión
      var dims=r.dims||[];
      var tipsHtml=dims.length
        ? dims.map(function(d){
            var rawScore=d.val!=null?d.val:(d.calificacion!=null?d.calificacion:d.nivel);
            var dv=parseFloat(rawScore||0);
            var dc=dv>=4?'#dc3545':dv>=3?'#fd7e14':dv>=2?'#ffc107':'#28a745';
            var dn=window._nombreTipologia(d).replace('Riesgo ','');
            return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;white-space:nowrap;"><span style="overflow:hidden;text-overflow:ellipsis;max-width:120px;">'+dn+'</span><span style="padding:0 5px;border-radius:6px;font-size:9.5px;font-weight:700;color:white;background:'+dc+';flex-shrink:0;">'+(isNaN(dv)?'—':dv)+'</span></div>';
          }).join('')
        : '<span style="color:#aaa;font-size:11px;">—</span>';
      var tipsCell = ocultarTipologias ? '' : '<td>'+tipsHtml+'</td>';
      var contratosNum = (r.contratos||[]).length;
      var gestionContratosBtn = '';
      
      // ✅ ARREGLO: Control de permisos por rol
      if(esEvaluador){
        // Evaluador: SOLO LECTURA
        // No mostrar botón de "Ver/Editar" contratos
        gestionContratosBtn = '<span style="font-size:11px;color:var(--muted);">📋 '+contratosNum+' contrato'+(contratosNum!==1?'s':'')+' (gestión: Admin Riesgos)</span>';
      } else if(esAdminRiesgos){
        // Admin de Riesgos: PUEDE EDITAR
        gestionContratosBtn = '';
      } else {
        // Otros roles: Solo contador
        gestionContratosBtn = '<span style="font-size:11px;color:var(--muted);">📋 '+contratosNum+' contrato'+(contratosNum!==1?'s':'')+' </span>';
      }
      
      // ✅ ARREGLO: Botones de acciones según rol
      var accionBtn = '';
      if(esEvaluador){
        // Evaluador: SOLO PUEDE VER (lectura)
        accionBtn = '<button class="btn btn-outline btn-xs" style="background:#e8f0f8;color:var(--blue);border:1px solid #2563eb;font-weight:700;" onclick="clsVerDetalleLectura(\''+r.nit+'\',\''+yr+'\')">👁 Ver detalle</button>';
      } else if(esAdminRiesgos){
        // Admin Riesgos: Puede editar datos del tercero
        accionBtn = '<button class="btn btn-xs" style="background:#e8f0f8;color:var(--navy);border:1px solid #1a3a5c;" onclick="clsVerDetalle(\''+r.nit+'\',\''+yr+'\')">✏️ Editar</button>';
      } else {
        // Otros: Solo ver (fallback)
        accionBtn = '<button class="btn btn-outline btn-xs" onclick="clsVerDetalleLectura(\''+r.nit+'\',\''+yr+'\')">👁 Ver</button>';
      }
      
      // ⭐ FIX: Mostrar nombre o NIT si falta nombre, pero NUNCA vacío
      var displayNombre = r.nombre || ('(Sin nombre - '+r.nit+')');
      var displayDomicilio = r.domicilio || '—';
      
      // 📋 Mostrar supervisores y contratos con más detalles
      var supervisoresStr = (r.supervisores||[]).map(s => s.nombre).join(', ') || '—';
      
      // Mostrar contratos con objeto y estado
      var contratosDetalles = (r.contratos||[]).map(c => {
        const estado_badge = c.estado === 'En Ejecucion' ? '▶' : (c.estado === 'Terminado' ? '✓' : '⏳');
        return '<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 8px;background:#f0f4f8;border-radius:4px;font-size:9px;white-space:nowrap;">' + estado_badge + ' ' + c.num + ' (' + (c.objeto||'').substring(0,20) + '...)</span>';
      }).join('') || '—';
      
      var riesgoLabel = r.zona || (p>=4?'EXTREMO':p>=3?'ALTO':'BAJO');
      var riesgoColor = p>=4?'var(--red)':p>=3?'var(--orange)':'var(--green)';
      var rowHtml = '<tr><td style="text-align:center;cursor:pointer;font-weight:700;color:var(--blue);" onclick="clsToggleExpandir(\''+r.nit+'\')">▼</td><td>'+esc(r.nit)+'</td><td><b>'+esc(displayNombre)+'</b><br/><span style="font-size:10px;color:#666;margin-top:4px;display:block;">👤 '+esc(supervisoresStr)+'</span><span style="font-size:10px;color:#2563eb;margin-top:4px;display:block;line-height:1.4;">📋 '+contratosDetalles+'</span></td><td>'+esc(displayDomicilio)+'</td>'+tipsCell+'<td><span class="chip '+cc+'" style="font-weight:800;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td><td><span style="font-size:11px;font-weight:800;color:'+riesgoColor+';">'+esc(riesgoLabel)+'</span></td><td>'+accionBtn+'</td></tr>';
      
      // ✅ NUEVA: Fila oculta desplegable con contratos y supervisores
      rowHtml += '<tr id="exp-'+r.nit+'" style="display:none;"><td colspan="'+(ocultarTipologias?7:8)+'" style="padding:0;border-bottom:1px solid #e2e8f0;background:#f9fafb;">'
        +'<div style="padding:20px;">';
      
      // 📋 SECCIÓN: CONTRATOS
      if((r.contratos||[]).length > 0){
        rowHtml += '<div style="margin-bottom:24px;"><h4 style="color:#1e40af;margin:0 0 12px 0;font-size:13px;font-weight:700;">📋 CONTRATOS (' + r.contratos.length + ')</h4>';
        rowHtml += '<div style="display:flex;flex-direction:column;gap:10px;">';
        
        (r.contratos||[]).forEach(function(c, idx){
          const estado_color = c.estado === 'En Ejecucion' ? '#3b82f6' : (c.estado === 'Terminado' ? '#10b981' : '#f59e0b');
          const estado_badge = c.estado === 'En Ejecucion' ? '▶' : (c.estado === 'Terminado' ? '✓' : '⏳');
          
          rowHtml += '<div style="background:white;border:1px solid #e5e7eb;border-radius:6px;padding:12px;cursor:pointer;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'">'
            +'<div style="display:flex;justify-content:space-between;align-items:center;">'
            +'<div style="flex:1;">'
            +'<div style="font-weight:700;font-size:12px;color:#1e40af;">'+esc(c.num)+'</div>'
            +'<div style="font-size:11px;color:#666;margin-top:4px;">'+esc(c.objeto)+'</div>'
            +'</div>'
            +'<span style="background:'+estado_color+';color:white;padding:4px 10px;border-radius:4px;font-size:10px;font-weight:600;">'+estado_badge+' '+c.estado+'</span>'
            +'<span style="margin-left:8px;color:#999;">▶</span>'
            +'</div>'
            +'</div>'
            +'<div style="display:none;background:#f3f4f6;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;padding:12px;font-size:12px;">'
            +'<div style="margin-bottom:8px;"><strong>Supervisor:</strong> '+esc(c.supervisor_asociado||'—')+'</div>'
            +'<div style="margin-bottom:8px;"><strong>Fechas:</strong> '+esc(c.fini||'—')+' a '+esc(c.ffin||'—')+'</div>'
            +'<div style="margin-bottom:8px;"><strong>Valor:</strong> $'+new Intl.NumberFormat('es-CO').format(c.valor||0)+'</div>'
            +'<div style="margin-bottom:8px;"><strong>Procesos:</strong> '+esc(c.procesos||'—')+'</div>'
            +'<div style="margin-bottom:12px;"><strong>Observaciones:</strong> '+esc(c.observaciones||'—')+'</div>'
            +'<div style="display:flex;gap:8px;">'
            +(esEvaluador ? '' : '<button onclick="clsEditarContratoDesdeRegistros(\''+r.nit+'\','+idx+');event.stopPropagation();" style="flex:1;padding:6px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">✏️ Editar</button>'
            +'<button onclick="clsEliminarContratoDesdeRegistros(\''+r.nit+'\','+idx+');event.stopPropagation();" style="flex:1;padding:6px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">🗑️ Eliminar</button>')
            +'</div>'
            +'</div>';
        });
        
        rowHtml += '</div></div>';
      }
      
      // 👤 SECCIÓN: SUPERVISORES
      rowHtml += '<div style="margin-bottom:24px;"><h4 style="color:#7c3aed;margin:0 0 12px 0;font-size:13px;font-weight:700;">👤 SUPERVISORES (' + (r.supervisores||[]).length + ')</h4>';
      rowHtml += '<div style="display:flex;flex-direction:column;gap:10px;">';
      
      (r.supervisores||[]).forEach(function(s, idx){
        rowHtml += '<div style="background:white;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">'
          +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">'
          +'<div style="flex:1;">'
          +'<div style="font-weight:700;font-size:12px;color:#7c3aed;">'+esc(s.nombre)+'</div>'
          +'<div style="font-size:11px;color:#666;margin-top:2px;">'+esc(s.cargo)+' | '+esc(s.proceso)+'</div>'
          +'</div>'
          +(esEvaluador ? '' : '<button onclick="clsEditarSupervisorDesdeRegistros(\''+r.nit+'\','+idx+');" style="padding:4px 10px;background:#7c3aed;color:white;border:none;border-radius:4px;cursor:pointer;font-size:10px;font-weight:600;white-space:nowrap;">✏️ Editar</button>')
          +'</div>'
          +'</div>';
      });
      
      if(!esEvaluador) rowHtml += '<button onclick="clsAgregarSupervisorDesdeRegistros(\''+r.nit+'\');" style="width:100%;padding:8px;background:#7c3aed;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;margin-top:8px;">➕ Agregar Supervisor</button>';
      rowHtml += '</div></div>';
      
      // ➕ BOTÓN: Agregar Contrato
      if(!esEvaluador) rowHtml += '<div style="margin-top:12px;">'
        +'<button onclick="clsAgregarContratoDesdeRegistros(\''+r.nit+'\');" style="width:100%;padding:10px;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;">➕ Agregar Contrato</button>'
        +'</div>';
      
      rowHtml += '</div></td></tr>';
      
      // ⭐ REMOVIDO: Filas de contratos y supervisores ahora están en fila oculta (exp-NIT) que se expande arriba
      /*
      if(esAdminRiesgos && (r.contratos||[]).length > 0){
        // ... código viejo removido
      }
      if(esAdminRiesgos && (r.supervisores||[]).length > 0){
        // ... código viejo removido
      }
      */
      
      
      return rowHtml;
    }).join('');
  };

  // "Registro de Clasificación de Terceros": formulario donde se diligencia el
  // tercero (Paso 1) — incluye las pestañas "Nuevo Registro"/"Registros" para
  // poder ver también la tabla de registros ya guardados.
  // "Clasificación de Terceros": solo el Paso 2 (elegir tercero y tipologías).
  window._setClasifViewMode = function(mode){
    var elTipSection = document.getElementById('cls-tip-section');
    var elWizardBar = document.getElementById('cls-wizard-bar');
    var elPreRegistro = document.getElementById('pre-registro-card');
    var elPanelForm = document.getElementById('cls-panel-form');
    var elPanelDash = document.getElementById('cls-panel-dash');
    var tabForm = document.getElementById('cls-tab-form');
    var tabsBar = tabForm ? tabForm.closest('.tabs') : null;

    // El flujo SIEMPRE visible — solo cambia qué paso se resalta
    if(elWizardBar) elWizardBar.style.display='';

    // Actualizar qué paso está activo en el wizard
    function setStep(activeN){
      [1,2,3,4,5].forEach(function(n){
        var circle = document.getElementById('cls-step'+n+'-circle');
        var label  = circle ? circle.nextElementSibling : null;
        if(!circle) return;
        if(n < activeN){
          // Completado
          circle.style.background='var(--green)'; circle.style.border='3px solid var(--green)';
          circle.style.color='white';
          circle.innerHTML='<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          if(label){ label.style.color='var(--green)'; }
        } else if(n === activeN){
          // Activo
          circle.style.background='var(--blue)'; circle.style.border='3px solid var(--blue)';
          circle.style.color='white';
          circle.innerHTML = n === 5 ? '✓' : String(n);
          if(label){ label.style.color='var(--navy)'; label.style.fontWeight='800'; }
        } else {
          // Pendiente
          circle.style.background='white'; circle.style.border='3px solid var(--border2)';
          circle.style.color='var(--muted)';
          circle.innerHTML = n === 5 ? '✓' : String(n);
          if(label){ label.style.color='var(--muted)'; label.style.fontWeight='700'; }
        }
      });
      // Barra de progreso
      var pLine = document.getElementById('cls-prog-line');
      if(pLine){
        var pct = activeN<=1 ? 0 : activeN===2 ? 25 : activeN===3 ? 50 : activeN===4 ? 75 : 100;
        pLine.style.width = pct + '%';
      }
      // Mensaje contextual
      var msgs = ['','Paso 1 — Completa la información general del tercero',
        'Paso 2 — Asigna tipologías de riesgo al tercero',
        'Paso 3 — Evalúa el Ambiente de Control por tipología',
        'Paso 4 — Registra el Análisis de Riesgos del tercero',
        '¡Proceso completado!'];
      var msgEl = document.getElementById('cls-wizard-msg');
      if(msgEl) msgEl.textContent = msgs[activeN]||'';
    }

    if(mode==='clasificar'){
      setStep(2);
      if(elPreRegistro) elPreRegistro.style.display='none';
      if(tabsBar) tabsBar.style.display='none';
      if(elPanelForm) elPanelForm.style.display='none';
      if(elPanelDash) elPanelDash.style.display='none';
      if(elTipSection) elTipSection.style.display='';
      // ⭐ Recargar datos de localStorage y llenar selector
      try{
        var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
        if(Object.keys(_sv).length){
          window.TERCEROS_DB = _sv;
        }
      }catch(e){}
      try{ window._poblarSelectorTerceroClasificar && window._poblarSelectorTerceroClasificar(); }catch(e){}
      // Extra: Si ya hay un tercero seleccionado, recarga sus contratos
      setTimeout(function(){
        try{
          var sel = document.getElementById('cls-tip-tercero-sel');
          if(sel && sel.value){
            window._clasifSeleccionarTercero(sel.value);
          }
        }catch(e){}
      }, 100);
    } else { // 'registro'
      setStep(1);
      if(elPreRegistro) elPreRegistro.style.display='';
      if(tabsBar) tabsBar.style.display='';
      if(elTipSection) elTipSection.style.display='none';
      try{ window.clsTab && window.clsTab('form'); }catch(e){}
    }
  };

  // Llena el selector de tercero de la vista "Clasificación de Terceros" con los
  // terceros que ya existen en Registro.
  window._poblarSelectorTerceroClasificar = function(){
    var sel = document.getElementById('cls-tip-tercero-sel');
    if(!sel) return;
    
    // ⭐ PASO 1: Recargar desde localStorage (datos más recientes)
    try{
      var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      console.log('📥 localStorage sgrt_terceros_db has:', Object.keys(_sv));
      if(Object.keys(_sv).length > 0){
        window.TERCEROS_DB = _sv;
        console.log('✅ TERCEROS_DB actualizada desde localStorage');
      } else {
        console.log('⚠️ localStorage vacío, usando TERCEROS_DB en memoria');
      }
    }catch(e){console.error('Error cargando localStorage:', e);}
    
    // ⭐ PASO 2: Construir lista de terceros
    var prev = sel.value;
    var db = window.TERCEROS_DB || {};
    console.log('🔍 TERCEROS_DB keys:', Object.keys(db));
    
    var lista = Object.values(db).filter(function(t){
      var tieneNIT = t && t.nit && t.nit.toString().trim().length > 0;
      console.log('  ├─ Verificando tercero NIT:', t?.nit, '| Nombre:', t?.nombre, '| Válido:', tieneNIT);
      return tieneNIT;
    }).sort(function(a,b){
      return (a.nombre||a.nit||'').localeCompare(b.nombre||b.nit||'');
    });
    
    console.log('📋 Lista filtrada ('+lista.length+' terceros):', lista.map(t => ({nit:t.nit, nombre:t.nombre})));
    
    // ⭐ PASO 3: Llenar selector CON PRIORIDAD AL NOMBRE
    sel.innerHTML = '<option value="">— Selecciona un tercero registrado —</option>'
      + lista.map(function(t){
        var nit = t.nit || '';
        var nombre = (t.nombre||'').trim();
        
        // ⭐⭐⭐ REGLA: Mostrar NOMBRE si existe, si NO mostrar NIT, si NO mostrar "Sin nombre"
        var displayLabel = '';
        if(nombre && nombre.length > 0){
          displayLabel = nombre;  // PRIORIDAD 1: Nombre del tercero
        } else if(nit && nit.length > 0){
          displayLabel = nit;     // PRIORIDAD 2: NIT (fallback)
        } else {
          displayLabel = 'Sin nombre ('+nit+')';  // PRIORIDAD 3: Ambos vacíos
        }
        
        console.log('  ✓ Tercero: NIT='+nit+' → Mostrar como: "'+displayLabel+'"');
        return '<option value="'+nit+'">'+displayLabel+'</option>';
      }).join('');
    
    if(prev) sel.value = prev;
    console.log('✅ Selector poblado:', lista.length, 'terceros');
  };

  // Carga el tercero elegido en los campos (ocultos) del formulario y en las
  // tipologías ya valoradas, para que Guardar Valoración funcione sobre el
  // tercero correcto en lugar de crear uno temporal.
  window._clasifSeleccionarTercero = function(nit){
    // ⭐ Recargar desde localStorage
    try{
      var _sv=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      if(Object.keys(_sv).length){
        window.TERCEROS_DB = _sv;
      }
    }catch(e){}
    
    var db = window.TERCEROS_DB || (typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{}) || {};
    var t = db[nit] || {};
    
    function setVal(id,v){ var el=document.getElementById(id); if(el) el.value = v||''; }
    setVal('cf-nit', nit);
    setVal('cf-nombre', t.nombre);
    setVal('cf-servicio', t.servicio);
    setVal('cf-supervisor', t.supervisor);
    setVal('cf-nocontrato', t.nocontrato);
    setVal('cf-domicilio', t.domicilio);
    var entSel = document.getElementById('cf-entidad');
    if(entSel && t.entidad){ entSel.value = t.entidad; }
    
    try{
      cfDimsAgregadas.length = 0;
      (t.dims||[]).forEach(function(d){
        cfDimsAgregadas.push({ id:'d_'+d.key+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), key:d.key, nombre:d.nombre, val:(d.val!=null?String(d.val):''), hasNA:false, hints:null, soloImpar:false });
      });
      window.cfDimsAgregadas = cfDimsAgregadas;
      if(typeof renderDimsAgregadas==='function') renderDimsAgregadas();
      if(typeof calcCfProm==='function') calcCfProm();
      if(typeof actualizarOpcionesSelectorTipologias==='function') actualizarOpcionesSelectorTipologias();
    }catch(e){ console.warn('clasifSeleccionarTercero:', e); }
    
    try{ window._clsContratosRender(nit); }catch(e){}
    try{ window._cfCtrCargarDe && window._cfCtrCargarDe(nit); }catch(e){}
    
    // ⭐ LLENAR SELECTOR DE CONTRATOS (lo más importante)
    try{
      var selCA = document.getElementById('cls-contrato-actual');
      var cons = (t.contratos||[]);
      if(selCA){
        if(cons.length){
          selCA.innerHTML = '<option value="">— Seleccionar contrato —</option>' + cons.map(function(c){
            var num = (c.num||'').trim();
            
            // ✅ MOSTRAR SOLO EL NÚMERO
            var label = num ? num : 'Sin nombre';
            return '<option value="'+num.replace(/"/g,'&quot;')+'">'+label+'</option>';
          }).join('');
          // Si no hay ninguno seleccionado, selecciona el primero automáticamente
          if(!t.contratoEval && cons.length > 0){
            selCA.value = cons[0].num || '';
            window._clasifCambiarContratoActual(cons[0].num || '');
          }
        } else {
          selCA.innerHTML = '<option value="">— Sin contratos registrados —</option>';
        }
      }
    }catch(eC){ console.warn('Error llenando contratos:', eC); }
  };

  // Cambiar el MODO de clasificación del tercero (por tercero vs por contrato)
  window._clasifCambiarModo = function(modo){
    var nit=(document.getElementById('cf-nit')||{}).value||'';
    var t=(window.TERCEROS_DB||{})[nit]; if(!t) return;
    t.modoEval = modo;
    if(t.modoEval==='contrato' && !t.dimsPorContrato) t.dimsPorContrato = {};
    var wc = document.getElementById('cls-modo-contrato-sel');
    if(wc) wc.style.display = modo==='contrato' ? 'block' : 'none';
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast(modo==='contrato' ? 'Clasificación por contrato activada' : 'Clasificación por tercero','success',1600); }catch(e){}
  };

  // Al elegir un contrato específico, cargar sus dims (o partir del tercero)
  window._clasifCambiarContratoActual = function(num){
    console.log('🔄 CAMBIAR CONTRATO:', num);
    
    var nit=(document.getElementById('cf-nit')||{}).value||'';
    console.log('  NIT:', nit);
    
    if(!nit) {
      console.warn('❌ NIT vacío, no se puede cambiar contrato');
      return;
    }
    
    var t=(window.TERCEROS_DB||{})[nit]; 
    if(!t) {
      console.error('❌ Tercero no encontrado:', nit);
      return;
    }
    
    // ⭐ ANTES DE CAMBIAR: GUARDAR LAS TIPOLOGÍAS DEL CONTRATO ANTERIOR
    var contratoAnterior = t.contratoEval;
    if(contratoAnterior && contratoAnterior !== num){
      console.log('💾 Guardando tipologías del contrato anterior:', contratoAnterior);
      
      if(!t.dimsPorContrato) t.dimsPorContrato = {};
      
      // Guardar cfDimsAgregadas en el contrato anterior
      var _dims = (typeof cfDimsAgregadas!=='undefined' ? cfDimsAgregadas : (window.cfDimsAgregadas||[]));
      t.dimsPorContrato[contratoAnterior] = _dims.map(function(d){ 
        return {key:d.key, nombre:d.nombre, val:d.val||''}; 
      });
      
      console.log('  ├─ Tipologías guardadas:', _dims.length);
      
      // Guardar promedio y zona
      if(!t.promPorContrato) t.promPorContrato = {};
      var prom = ((document.getElementById('cf-prom')||{}).textContent||'').trim() || '—';
      var zona = ((document.getElementById('cf-zona')||{}).textContent||'').trim() || '—';
      t.promPorContrato[contratoAnterior] = {prom: prom, zona: zona};
      
      console.log('  └─ Promedio/Zona guardados');
      
      // ⭐ GUARDAR EN LOCALSTORAGE INMEDIATAMENTE
      try {
        localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(TERCEROS_DB));
        console.log('✅ Guardado en localStorage');
      } catch(e) {
        console.error('❌ Error guardando en localStorage:', e);
      }
    }
    
    // ⭐ AHORA SÍ: CAMBIAR AL NUEVO CONTRATO
    t.contratoEval = num || '';
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    if(!t.promPorContrato) t.promPorContrato = {};
    
    // ⭐ CADA CONTRATO TIENE SUS PROPIAS TIPOLOGÍAS
    var dims = num ? (t.dimsPorContrato[num] || [])
                   : (t.dims||[]);
    
    console.log('📋 Tipologías encontradas para', num, ':', dims.length);
    console.log('  └─ Datos:', dims);
    
    // ⭐ CARGAR PROMEDIO Y ZONA DEL NUEVO CONTRATO
    var promContrato = (t.promPorContrato||{})[num];
    if(promContrato){
      var promEl = document.getElementById('cf-prom');
      var zonaEl = document.getElementById('cf-zona');
      if(promEl) promEl.textContent = promContrato.prom;
      if(zonaEl) zonaEl.textContent = promContrato.zona;
      console.log('📊 Promedio/Zona cargados:', promContrato);
    }
    
    try{
      // ⭐ LIMPIAR Y RECARGAR cfDimsAgregadas
      if(typeof cfDimsAgregadas !== 'undefined'){
        cfDimsAgregadas.length = 0;
      } else {
        window.cfDimsAgregadas = [];
      }
      
      // ⭐ CARGAR TIPOLOGÍAS DEL NUEVO CONTRATO
      dims.forEach(function(d){
        cfDimsAgregadas.push({
          id:'d_'+d.key+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,6), 
          key:d.key, 
          nombre:d.nombre, 
          val:(d.val!=null?String(d.val):''), 
          hasNA:false, 
          hints:null, 
          soloImpar:false
        });
      });
      
      console.log('✅ cfDimsAgregadas actualizado:', cfDimsAgregadas.length, 'tipologías');
      
      // ⭐ RENDERIZAR
      if(typeof renderDimsAgregadas==='function') {
        console.log('  └─ Llamando renderDimsAgregadas()');
        renderDimsAgregadas();
      }
      if(typeof calcCfProm==='function') {
        console.log('  └─ Llamando calcCfProm()');
        calcCfProm();
      }
    }catch(e){
      console.error('❌ Error al cargar tipologías:', e);
    }
    
    try{ 
      window._lsSave && window._lsSave(); 
    }catch(e){
      console.warn('⚠️ Error al guardar:', e);
    }
  };

  // ── Contratos del tercero (Clasificación · Paso 2) ────────────
  // Se guardan en TERCEROS_DB[nit].contratos y persisten con _lsSave,
  // así quedan visibles también en la Aprobación de Clasificación.
  window._clsContratosRender = function(nit){
    var wrap = document.getElementById('cls-contratos-lista');
    if(!wrap) return;
    var db = window.TERCEROS_DB||{};
    var t = nit ? db[nit] : null;
    if(!t){ wrap.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic;">Selecciona un tercero para ver o agregar sus contratos.</div>'; return; }
    // Terceros registrados ANTES de esta función: su No. Contrato quedó en
    // los datos del tercero (t.nocontrato) pero no en la lista → migrarlo.
    try{ window._clsContratosBackfill(t); }catch(e){}
    var cons = t.contratos||[];
    if(!cons.length){ wrap.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic;">Sin contratos registrados para <b>'+(t.nombre||nit)+'</b>. Los del <b>Paso 1 — Registro</b> aparecen aquí automáticamente, o agrega uno arriba.</div>'; return; }
    var h='';
    // ── Desplegable: contrato bajo el cual se clasifica/evalúa ──
    h+='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">'
      +'<label style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;white-space:nowrap;">Contrato a evaluar</label>'
      +'<select id="cls-contrato-actual" onchange="window._clasifCambiarContratoActual(this.value)" style="flex:1;min-width:220px;padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12px;font-family:inherit;background:white;">'
      +'<option value="">— Seleccionar contrato —</option>'
      +cons.map(function(c,i){
        var num = (c.num||'').trim();
        
        // ✅ MOSTRAR SOLO EL NÚMERO
        var lbl = num ? num : ('Contrato '+(i+1));
        
        return '<option value="'+(c.num||('__idx__'+i)).replace(/"/g,'&quot;')+'"'+((t.contratoEval&&t.contratoEval===(c.num||('__idx__'+i)))?' selected':'')+'>'+lbl+'</option>';
      }).join('')
      +'</select></div>';
    h+=cons.map(function(c, i){
      var vig = (c.fini||c.ffin) ? ((c.fini||'—')+' → '+(c.ffin||'—')) : '';
      var idc = c.num||('__idx__'+i);
      var esEval = t.contratoEval===idc;
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:'+(esEval?'#f0fdf4':'#fafafa')+';border:1px solid '+(esEval?'#86efac':'#eee')+';border-radius:6px;margin-bottom:4px;">'
        +'<span style="font-size:14px;">📄</span>'
        +'<span style="font-size:11.5px;font-weight:700;color:var(--navy);white-space:nowrap;">'+(c.num||'Contrato '+(i+1))+'</span>'
        +(esEval?'<span style="padding:1px 7px;border-radius:10px;background:#28a745;color:white;font-size:9px;font-weight:700;">EVALUANDO</span>':'')
        +'<span style="flex:1;font-size:11.5px;color:#374151;">'+(c.objeto||'')+'</span>'
        +(c.estado?'<span style="font-size:9.5px;color:#166534;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:1px 6px;white-space:nowrap;">'+c.estado+'</span>':'')
        +(vig?'<span style="font-size:10px;color:var(--muted);white-space:nowrap;">🗓 '+vig+'</span>':'')
        +'<button onclick="window._clsContratoEliminar(\''+nit+'\','+i+')" style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:13px;" title="Eliminar contrato">✕</button>'
        +'</div>';
    }).join('');
    wrap.innerHTML=h;
  };
  // Migra el contrato guardado en los DATOS del tercero (registros viejos:
  // t.nocontrato, t.objetivo, t.finicio, t.fterm, t.valor) a la lista
  // t.contratos, para que aparezca al seleccionar el tercero en el Paso 2.
  window._clsContratosBackfill = function(t){
    try{
      if(!t) return;
      if(t.contratos && t.contratos.length) return; // ya tiene lista
      var num    = (t.nocontrato||'').toString().trim();
      if(num==='—') num='';
      var objeto = (t.objetivo||t.servicio||'').toString().trim();
      if(!num && !objeto) return; // no hay nada que migrar
      var esFecha = function(v){ return /\d{4}-\d{2}-\d{2}/.test(v||''); };
      var ffin   = esFecha(t.fterm) ? t.fterm : (t.ffinal||'');
      var estado = (!esFecha(t.fterm) && t.fterm) ? t.fterm : (t.estadoContrato||'');
      t.contratos = [{ num:num, objeto:objeto, fini:t.finicio||'', ffin:ffin, estado:estado, valor:t.valor||'', procesos:'', supervisor:t.supervisor||'', supervisorCargo:t.cargo||'', procesoSupervision:'', supervisorAlt:'', supervisorAltCargo:'', procesoSupervisionAlt:'', observaciones:'', origen:'registro', creadoAt:new Date().toISOString() }];
      if(num && !t.contratoEval) t.contratoEval = num;
      try{ window._lsSave && window._lsSave(); }catch(e2){}
    }catch(e){}
  };
  window._clsContratoSeleccionar = function(nit, val){
    var db = window.TERCEROS_DB||{}; var t = db[nit]; if(!t) return;
    t.contratoEval = val||'';
    try{ window._lsSave && window._lsSave(); }catch(e){}
    window._clsContratosRender(nit);
    if(val){ try{ showToast('Contrato a evaluar: '+val,'success',2000); }catch(e){} }
  };
  // Importa a la lista de contratos el contrato diligenciado en el
  // Paso 1 — Registro (No. Contrato, objeto, fechas, estado, valor).
  // Se actualiza si el número ya existe (no se duplica).
  window._clsImportarContratoRegistro = function(nit){
    try{
      if(!nit) return;
      var db=window.TERCEROS_DB||{}; var t=db[nit]; if(!t) return;
      if(!t.contratos) t.contratos=[];
      // 1) Contrato PRINCIPAL desde los campos del formulario
      var num    = ((document.getElementById('cf-nocontrato')||{}).value||'').trim();
      var objeto = ((document.getElementById('cf-objetivo')||{}).value||'').trim() || ((document.getElementById('cf-servicio')||{}).value||'').trim();
      var fini   = ((document.getElementById('cf-finicio')||{}).value||'').trim();
      var ffin   = ((document.getElementById('cf-ffinal')||{}).value||'').trim();
      var estado = ((document.getElementById('cf-fterm')||{}).value||'').trim();
      var valor  = (((document.getElementById('cf-valor')||{}).dataset||{}).raw)||((document.getElementById('cf-valor')||{}).value||'');
      function upsert(c){
        if(!c.num && !c.objeto) return;
        var ex = c.num ? t.contratos.find(function(x){ return (x.num||'')===c.num; }) : null;
        if(ex){ Object.keys(c).forEach(function(k){ if(c[k]) ex[k]=c[k]; }); }
        else t.contratos.push({ num:c.num, objeto:c.objeto, fini:c.fini, ffin:c.ffin, estado:c.estado, valor:c.valor, procesos:c.procesos||'', supervisor:c.supervisor||'', supervisorCargo:c.supervisorCargo||'', procesoSupervision:c.procesoSupervision||'', supervisorAlt:c.supervisorAlt||'', supervisorAltCargo:c.supervisorAltCargo||'', procesoSupervisionAlt:c.procesoSupervisionAlt||'', observaciones:c.observaciones||'', origen:c.origen||'registro', creadoAt:new Date().toISOString() });
      }
      upsert({num:num,objeto:objeto,fini:fini,ffin:ffin,estado:estado,valor:valor,origen:'registro'});
      // 2) Contratos ADICIONALES del buffer del Paso 1
      (window._cfContratosBuffer||[]).forEach(function(c){
        upsert({num:(c.num||'').trim(),objeto:(c.objeto||'').trim(),fini:c.fini||'',ffin:c.ffin||'',estado:c.estado||'En Ejecucion',valor:c.valor||'',procesos:c.procesos||'',supervisor:c.supervisor||'',supervisorCargo:c.supervisorCargo||'',procesoSupervision:c.procesoSupervision||'',supervisorAlt:c.supervisorAlt||'',supervisorAltCargo:c.supervisorAltCargo||'',procesoSupervisionAlt:c.procesoSupervisionAlt||'',observaciones:c.observaciones||'',origen:'registro-adic'});
      });
      if(!t.contratoEval && num) t.contratoEval = num;
      try{ window._clsContratosRender(nit); }catch(e2){}
    }catch(e){}
  };
  window._clsContratoAgregar = function(){
    var nit = ((document.getElementById('cls-tip-tercero-sel')||{}).value||'').trim();
    if(!nit){ try{ showToast('Primero selecciona el tercero a clasificar','error',2500); }catch(e){} return; }
    var num    = ((document.getElementById('cls-con-num')||{}).value||'').trim();
    var objeto = ((document.getElementById('cls-con-objeto')||{}).value||'').trim();
    var fini   = ((document.getElementById('cls-con-fini')||{}).value||'').trim();
    var ffin   = ((document.getElementById('cls-con-ffin')||{}).value||'').trim();
    if(!num && !objeto){ try{ showToast('Escribe al menos el número u objeto del contrato','error',2500); }catch(e){} return; }
    var db = window.TERCEROS_DB||{}; var t = db[nit];
    if(!t){ try{ showToast('Tercero no encontrado','error',2500); }catch(e){} return; }
    if(!t.contratos) t.contratos = [];
    t.contratos.push({ num:num, objeto:objeto, fini:fini, ffin:ffin, estado:'En Ejecucion', valor:'', procesos:'', supervisor:'', supervisorCargo:'', procesoSupervision:'', supervisorAlt:'', supervisorAltCargo:'', procesoSupervisionAlt:'', observaciones:'', creadoAt:new Date().toISOString() });
    ['cls-con-num','cls-con-objeto','cls-con-fini','cls-con-ffin'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    try{ window._lsSave && window._lsSave(); }catch(e){}
    window._clsContratosRender(nit);
    try{ showToast('📄 Contrato agregado a '+(t.nombre||nit),'success',2500); }catch(e){}
  };
  window._clsContratoEliminar = function(nit, idx){
    var db = window.TERCEROS_DB||{}; var t = db[nit];
    if(!t || !t.contratos) return;
    t.contratos.splice(idx, 1);
    try{ window._lsSave && window._lsSave(); }catch(e){}
    window._clsContratosRender(nit);
    try{ showToast('Contrato eliminado','success',2000); }catch(e){}
  };

  window.clsVerDetalleLectura = function(nit, yr) {
    // Detalle de solo lectura para el Evaluador. La explicación se obtiene del
    // catálogo de criterios existente y no se reemplaza por texto genérico.
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    var year=yr||new Date().getFullYear().toString();
    var rec=((window.CLS_DB&&window.CLS_DB[year])||[]).find(function(r){return r.nit===nit;})||{};
    var t=Object.assign({},db[nit]||{},rec);
    var esc=window.esc||function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');};
    var EL={colpensiones:'Colpensiones',ecopetrol:'Ecopetrol',bancolombia:'Bancolombia',cliente1:'Colpensiones'};
    var ek=String(t.entidad||'').toLowerCase().replace(/\s/g,'');
    var eL=EL[ek]||t.entidad||'-';
    var dims=Array.isArray(t.dims)?t.dims:[];
    var numeric=dims.map(function(d){var v=parseFloat(d&&d.val);return isNaN(v)?null:v;}).filter(function(v){return v!==null;});
    var p=parseFloat(t.prom); if(isNaN(p)&&numeric.length)p=numeric.reduce(function(a,b){return a+b;},0)/numeric.length;
    var pLabel=isNaN(p)?'Sin puntaje':p>=4?'CRÍTICO':p>=3?'ALTO':p>=2?'BAJO':'MUY BAJO';
    var pColor=isNaN(p)?'#6b7280':p>=4?'#dc2626':p>=3?'#ea580c':p>=2?'#2563eb':'#16a34a';
    var risk=String(t.zona||'').trim()||(isNaN(p)?'SIN CLASIFICAR':p>=4?'EXTREMO':p>=3?'ALTO':'BAJO');
    var old=document.getElementById('_cls-det'); if(old)old.remove();
    var ov=document.createElement('div'); ov.id='_cls-det';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9990;display:flex;align-items:flex-start;justify-content:center;padding:34px 12px;overflow:auto;';
    ov.onclick=function(e){if(e.target===ov)ov.remove();};
    function fld(lbl,val){return '<div><div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:3px;">'+esc(lbl)+'</div><div style="padding:7px 10px;background:var(--gray3);border-radius:var(--r);font-size:12.5px;min-height:15px;">'+(val?esc(val):'—')+'</div></div>';}
    function infoFor(d){
      var key=String((d&&d.key)||'').toLowerCase();
      if(!key && d && d.tipologia && window._nombreTipologia){
        var keyByName={'operativo':'op','continuidad de negocio':'cn','seguridad de la información':'si','cumplimiento':'cu','fraude y corrupción':'fr','laft':'laft'};
        var rn=String(d.tipologia).toLowerCase().replace(/\s+/g,' ').trim();
        key=keyByName[rn]||'';
      }
      var section=(typeof SECCIONES_INFO!=='undefined'&&SECCIONES_INFO[key])?SECCIONES_INFO[key]:null;
      var catalog=(typeof TIPOLOGIA_CATALOG!=='undefined'&&TIPOLOGIA_CATALOG[key])?TIPOLOGIA_CATALOG[key]:null;
      var hints=(d&&d.hints)||((catalog&&catalog.hints)||{});
      var val=String(d&&d.val!=null?d.val:(d&&d.calificacion!=null?d.calificacion:(d&&d.nivel!=null?d.nivel:'')));
      var label=window._nombreTipologia?window._nombreTipologia(d):(section&&section.label)||((d&&d.nombre)||key||'Tipología');
      var category={op:'Operacional',cn:'Continuidad de negocio',si:'Seguridad de la información',cu:'Cumplimiento',fr:'Fraude y corrupción',laft:'LAFT',fi:'Financiero',pa:'País',reputacional:'Reputacional'}[key]||label;
      var explanation=hints[val]||'';
      if(!explanation&&val)explanation='El catálogo no tiene una descripción adicional para este nivel; se registró el puntaje '+val+'.';
      if(!explanation)explanation='No se ha registrado un puntaje para este criterio.';
      var isNA=val.toLowerCase().indexOf('na')===0||val==='N/A';
      var score=isNA?'N/A':(val||'—');
      var n=parseFloat(val); var grade=isNA?'No aplica':isNaN(n)?'Sin puntaje':n>=5?'CRÍTICO':n>=4?'ALTO':n>=3?'MEDIO':n>=2?'BAJO':'MUY BAJO';
      var color=isNA?'#6b7280':isNaN(n)?'#6b7280':n>=5?'#dc2626':n>=4?'#ea580c':n>=3?'#d97706':n>=2?'#2563eb':'#16a34a';
      return {key:key,label:label,category:category,score:score,grade:grade,color:color,explanation:explanation};
    }
    var criteriaHtml=dims.length?dims.map(function(d,i){
      var x=infoFor(d);
      return '<div style="border:1px solid #dbe3ec;border-radius:9px;overflow:hidden;margin-bottom:10px;background:white;">'
        +'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;">'
        +'<div style="width:26px;height:26px;border-radius:50%;background:#e8f0f8;color:#1e6bb8;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">'+(i+1)+'</div>'
        +'<div style="flex:1;min-width:180px;"><div style="font-size:12px;font-weight:800;color:#1a3a5c;">'+esc(x.label)+'</div><div style="font-size:10.5px;color:#64748b;margin-top:2px;">Categoría: '+esc(x.category)+'</div></div>'
        +'<div style="display:flex;align-items:center;gap:7px;"><span style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:'+x.color+';">'+esc(x.score)+'</span><span style="font-size:10px;font-weight:800;color:'+x.color+';padding:3px 7px;border-radius:10px;background:'+x.color+'18;">'+esc(x.grade)+'</span></div>'
        +'</div>'
        +'<div style="padding:11px 14px;font-size:11.5px;line-height:1.55;color:#374151;"><b style="color:#1a3a5c;">Criterio y explicación:</b> '+esc(x.explanation)+'</div>'
        +'</div>';
    }).join(''):'<div style="padding:16px;border:1px dashed #cbd5e1;border-radius:8px;color:var(--muted);font-size:12px;text-align:center;">No hay criterios de clasificación registrados para este tercero.</div>';
    var contratos=Array.isArray(t.contratos)?t.contratos:[];
    var contratosHtml=contratos.length?'<div style="margin-top:12px;"><div style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:6px;">Contratos asociados</div>'+contratos.map(function(c){return '<div style="padding:7px 10px;background:var(--gray3);border-radius:6px;margin-bottom:5px;font-size:11.5px;"><b>'+esc(c.num||'Sin número')+'</b> · '+esc(c.objeto||c.servicio||'Sin objeto')+'</div>';}).join('')+'</div>':'';
    ov.innerHTML='<div style="background:white;border-radius:12px;width:760px;max-width:98vw;max-height:calc(100vh - 68px);overflow:auto;box-shadow:0 12px 50px rgba(0,0,0,.25);">'
      +'<div style="padding:15px 20px;background:linear-gradient(135deg,#0d2740,#1e6bb8);border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;gap:12px;">'
      +'<div><div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:white;">Detalle de clasificación</div><div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:3px;">'+esc(t.nombre||nit)+' · NIT '+esc(t.nit||nit)+'</div></div>'
      +'<button onclick="document.getElementById(\'_cls-det\').remove()" style="background:none;border:none;color:rgba(255,255,255,.8);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
      +'<div style="padding:18px 20px;">'
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">'
      +'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:800;">Puntaje final</div><div style="font-family:Montserrat,sans-serif;font-size:25px;font-weight:800;color:'+pColor+';margin-top:3px;">'+(isNaN(p)?'—':p.toFixed(2))+'</div></div>'
      +'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:800;">Calificación</div><div style="font-size:13px;font-weight:800;color:'+pColor+';margin-top:9px;">'+esc(pLabel)+'</div></div>'
      +'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:800;">Tipo de riesgo</div><div style="font-size:13px;font-weight:800;color:#1a3a5c;margin-top:9px;">'+esc(risk)+'</div></div>'
      +'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-weight:800;">Criterios</div><div style="font-size:13px;font-weight:800;color:#1a3a5c;margin-top:9px;">'+dims.length+'</div></div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">'+fld('Organización',eL)+fld('Periodicidad',t.periodicidad)+fld('Servicio',t.servicio)+fld('Supervisor',t.supervisor)+fld('Domicilio',t.domicilio)+fld('Contrato principal',t.nocontrato)+'</div>'
      +'<div style="font-size:11px;font-weight:800;color:#1a3a5c;text-transform:uppercase;margin-bottom:8px;border-bottom:2px solid #1e6bb8;padding-bottom:6px;">Tipologías, categorías y resultados individuales</div>'
      +criteriaHtml+contratosHtml
      +'<div style="display:flex;justify-content:flex-end;margin-top:16px;"><button onclick="document.getElementById(\'_cls-det\').remove()" class="btn btn-outline">Cerrar</button></div>'
      +'</div></div>';
    document.body.appendChild(ov);
  };

  // ═══════════════════════════════════════════════════════════════════
  // SGRT v35 - EDICIÓN DE TERCEROS: SOLO NIT, NOMBRE, DOMICILIO
  // ═══════════════════════════════════════════════════════════════════
  window.clsVerDetalle = function(nit, yr){
    if(!nit) return;
    let t = (window.TERCEROS_DB || {})[nit];
    if(!t) return;
    
    let modalHtml = '<div class="overlay" style="display:flex;align-items:center;justify-content:center;inset:0;z-index:10000;background:rgba(0,0,0,0.5);">'
      +'<div class="modal" style="width:500px;max-width:95vw;background:white;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.2);">'
      +'<div style="background:#1a3a5c;color:white;padding:16px 20px;border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<h3 style="margin:0;font-family:Montserrat;font-size:15px;font-weight:700;">✏️ Editar Tercero</h3>'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;">✕</button>'
      +'</div>'
      +'<div style="padding:20px;">'
      +'<div style="margin-bottom:16px;">'
      +'<label style="display:block;font-size:12px;font-weight:600;color:#2c3e50;margin-bottom:6px;">NIT *</label>'
      +'<input type="text" id="edit-nit" value="'+(t.nit||'')+'" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;" readonly />'
      +'</div>'
      +'<div style="margin-bottom:16px;">'
      +'<label style="display:block;font-size:12px;font-weight:600;color:#2c3e50;margin-bottom:6px;">Nombre del tercero *</label>'
      +'<input type="text" id="edit-nombre" value="'+(t.nombre_tercero || t.nombre || '')+'" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;" />'
      +'</div>'
      +'<div style="margin-bottom:20px;">'
      +'<label style="display:block;font-size:12px;font-weight:600;color:#2c3e50;margin-bottom:6px;">Domicilio *</label>'
      +'<input type="text" id="edit-domicilio" value="'+(t.domicilio || '')+'" style="width:100%;padding:10px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;box-sizing:border-box;" />'
      +'</div>'
      +'</div>'
      +'<div style="padding:16px 20px;border-top:1px solid #dee2e6;display:flex;gap:10px;justify-content:flex-end;">'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="padding:8px 16px;background:#e9ecef;color:#212529;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Cancelar</button>'
      +'<button onclick="window.guardarEditarTercero(\''+nit+'\')" style="padding:8px 16px;background:#28a745;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">💾 Guardar</button>'
      +'</div>'
      +'</div>'
      +'</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  // ═══════════════════════════════════════════════════════════════════
  // FUNCIÓN PARA GUARDAR EDICIÓN DE TERCERO
  // ═══════════════════════════════════════════════════════════════════
  window.guardarEditarTercero = function(nit){
    let nombre = document.getElementById('edit-nombre')?.value?.trim();
    let domicilio = document.getElementById('edit-domicilio')?.value?.trim();
    
    if(!nombre){
      showToast('⚠️ El nombre del tercero es obligatorio', 'warning', 2500);
      return;
    }
    if(!domicilio){
      showToast('⚠️ El domicilio es obligatorio', 'warning', 2500);
      return;
    }
    
    var db = window.TERCEROS_DB || {};
    if(!db[nit]){
      showToast('❌ Tercero no encontrado', 'error', 2500);
      return;
    }
    
    db[nit].nombre_tercero = nombre;
    db[nit].nombre = nombre;
    db[nit].domicilio = domicilio;
    
    // Guardar en localStorage
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(db));
    console.log('✅ Tercero actualizado:', nit, 'Nombre:', nombre, 'Domicilio:', domicilio);
    
    // Cerrar modal
    document.querySelector('[style*=inset]')?.remove();
    
    // Refrescar tabla
    if(window.clsRender) {
      console.log('🔄 Llamando clsRender()');
      window.clsRender();
    }
    if(window.clsInitDash) {
      console.log('🔄 Llamando clsInitDash()');
      window.clsInitDash();
    }
    
    showToast('✅ Tercero actualizado correctamente', 'success', 2500);
  };

  window.clsGuardarDetalle = function(nit, yr) {
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    function gv(id){var e=document.getElementById(id);return e?e.value:null;}
    var patch={nombre:gv('_d_nom'),servicio:gv('_d_srv'),nocontrato:gv('_d_con'),domicilio:gv('_d_dom'),finicio:gv('_d_fi'),fterm:gv('_d_ft'),valor:gv('_d_val'),periodicidad:gv('_d_per'),observaciones:gv('_d_obs')};
    if(window.CLS_DB[yr]){var idx=window.CLS_DB[yr].findIndex(function(r){return r.nit===nit;});if(idx>=0)Object.assign(window.CLS_DB[yr][idx],patch);}
    if(db[nit]) Object.assign(db[nit],patch);
    try{
      var saved=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      if(db[nit]){ saved[nit]=db[nit]; localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(saved)); }
    }catch(e){}
    try{ window._lsSave && window._lsSave(); }catch(e){}
    window.clsRender();
    var m=document.getElementById('_cls-det'); if(m) m.remove();
    if(typeof showToast==='function') showToast('Registro actualizado','success',2000);
  };

  // ─── AGREGAR SUPERVISOR ───
  window.clsAbrirAgregarSupervisor = function(nit) {
    var old = document.getElementById('_cls-add-sup'); 
    if(old) old.remove();
    var ov = document.createElement('div'); 
    ov.id = '_cls-add-sup';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9992;display:flex;align-items:center;justify-content:center;';
    ov.onclick = function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="background:white;border-radius:12px;width:400px;max-width:90vw;box-shadow:0 12px 50px rgba(0,0,0,.25);">'
      +'<div style="padding:14px 20px;background:#1a3a5c;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;color:white;">Agregar Supervisor</span>'
      +'<button onclick="document.getElementById(\'_cls-add-sup\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;padding:0;">&times;</button></div>'
      +'<div style="padding:20px;display:flex;flex-direction:column;gap:12px;">'
      +'<div><label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:5px;">Nombre</label><input id="_sup_nombre" type="text" placeholder="Nombre completo" style="width:100%;padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;box-sizing:border-box;"/></div>'
      +'<div><label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:5px;">Cargo</label><input id="_sup_cargo" type="text" placeholder="Ej: Gerente de Riesgos" style="width:100%;padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;box-sizing:border-box;"/></div>'
      +'<div><label style="font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:5px;">Proceso encargado de supervisión</label><input id="_sup_proceso" type="text" placeholder="Ej: Control Interno" style="width:100%;padding:8px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;box-sizing:border-box;"/></div>'
      +'</div>'
      +'<div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">'
      +'<button onclick="document.getElementById(\'_cls-add-sup\').remove()" class="btn btn-outline">Cancelar</button>'
      +'<button onclick="clsGuardarSupervisor(\''+nit+'\')" class="btn btn-success">Guardar</button>'
      +'</div></div>';
    document.body.appendChild(ov);
    document.getElementById('_sup_nombre').focus();
  };

  window.clsGuardarSupervisor = function(nit) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t) return;
    if(!t.supervisores) t.supervisores = [];
    var nombre = document.getElementById('_sup_nombre').value.trim();
    var cargo = document.getElementById('_sup_cargo').value.trim();
    var proceso = document.getElementById('_sup_proceso').value.trim();
    if(!nombre){
      if(typeof showToast==='function') showToast('Ingresa el nombre del supervisor','error',2000);
      return;
    }
    t.supervisores.push({nombre:nombre, cargo:cargo, proceso:proceso});
    try{ window._lsSave && window._lsSave(); }catch(e){}
    document.getElementById('_cls-add-sup').remove();
    abrirEditIGTercero(nit);
    if(typeof showToast==='function') showToast('Supervisor agregado','success',2000);
  };

  window.clsEliminarSupervisor = function(nit, idx) {
    if(!confirm('¿Eliminar este supervisor?')) return;
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(t && t.supervisores && t.supervisores[idx]){
      t.supervisores.splice(idx, 1);
      try{ window._lsSave && window._lsSave(); }catch(e){}
      abrirEditIGTercero(nit);
      if(typeof showToast==='function') showToast('Supervisor eliminado','success',2000);
    }
  };

  // ─── GESTIÓN DE CONTRATOS en Registro de Terceros ───
  window.clsAbrirGestionContratos = function(nit, nombre) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit] || {};
    var contratos = t.contratos || [];
    var old = document.getElementById('_cls-gcontratos'); 
    if(old) old.remove();
    var ov = document.createElement('div'); 
    ov.id = '_cls-gcontratos';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9991;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;';
    ov.onclick = function(e){if(e.target===ov)ov.remove();};
    
    var contratosHtml = '';
    if(contratos.length){
      contratosHtml = '<div style="overflow-x:auto;margin-bottom:14px;"><table style="width:100%;border-collapse:collapse;font-size:11.5px;"><thead><tr style="background:#f0f0f0;"><th style="padding:8px;text-align:left;">Nº Contrato</th><th style="padding:8px;text-align:left;">Objeto</th><th style="padding:8px;text-align:left;">Servicio</th><th style="padding:8px;text-align:left;">Inicio</th><th style="padding:8px;text-align:left;">Término</th><th style="padding:8px;text-align:center;">Acciones</th></tr></thead><tbody>';
      contratos.forEach(function(c, i){
        contratosHtml += '<tr style="border-bottom:1px solid #eee;background:'+(i%2?'white':'#f9f9f9')+';">'
          +'<td style="padding:8px;"><b>'+(c.num||'—')+'</b></td>'
          +'<td style="padding:8px;">'+(c.objeto||'—')+'</td>'
          +'<td style="padding:8px;">'+(c.servicio||'—')+'</td>'
          +'<td style="padding:8px;">'+(c.finicio||'—')+'</td>'
          +'<td style="padding:8px;">'+(c.fterm||'En Ejecución')+'</td>'
          +'<td style="padding:8px;text-align:center;">'
          +'<button class="btn btn-sm" style="background:#e0e0e0;color:#333;border:none;border-radius:4px;padding:3px 10px;cursor:pointer;margin-right:4px;font-size:10px;" onclick="clsEditarContrato(\''+nit+'\','+i+')">Editar</button>'
          +'<button class="btn btn-sm" style="background:#fcc;color:#933;border:none;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:10px;" onclick="clsEliminarContrato(\''+nit+'\','+i+')">Eliminar</button>'
          +'</td></tr>';
      });
      contratosHtml += '</tbody></table></div>';
    } else {
      contratosHtml = '<div style="padding:16px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;text-align:center;color:#1e40af;font-size:12px;">Sin contratos registrados</div>';
    }
    
    ov.innerHTML='<div style="background:white;border-radius:12px;width:680px;max-width:96vw;max-height:80vh;overflow:auto;box-shadow:0 12px 50px rgba(0,0,0,.25);">'
      +'<div style="padding:14px 20px;background:var(--navy);border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<div style="flex:1;"><span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">Gestión de Contratos — '+nombre+'</span><div style="font-size:11px;color:rgba(255,255,255,0.8);margin-top:3px;">📋 '+contratos.length+' contrato'+(contratos.length!==1?'s':'')+' registrado'+(contratos.length!==1?'s':'')+' · Edita, elimina o agrega nuevos</div></div>'
      +'<button type="button" onclick="document.getElementById(\'_cls-gcontratos\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">&times;</button></div>'
      +'<div style="padding:20px;">'
      +contratosHtml
      +'<button type="button" class="btn btn-primary" style="width:100%;padding:12px;margin-top:14px;font-weight:800;cursor:pointer;border:none;border-radius:6px;font-family:inherit;font-size:13px;background:#1e6bb8;color:white;transition:all 0.2s ease;" onmouseover="this.style.background=\'#1554a3\';this.style.boxShadow=\'0 4px 12px rgba(30,107,184,0.4)\';" onmouseout="this.style.background=\'#1e6bb8\';this.style.boxShadow=\'none\';" onclick="clsAgregarContrato(\''+nit+'\')">+ Agregar nuevo contrato</button>'
      +'</div>'
      +'<div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">'
      +'<button type="button" onclick="document.getElementById(\'_cls-gcontratos\').remove()" class="btn btn-outline">Cerrar</button>'
      +'</div></div>';
    document.body.appendChild(ov);
  };

  window.clsEditarContrato = function(nit, idx) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t) return;
    
    var isNuevo = (idx === -1);
    var c = isNuevo ? {num:'',objeto:'',fini:'',ffin:'',estado:'En Ejecucion',valor:'',procesos:'',observaciones:''} : (t.contratos && t.contratos[idx]);
    if(!isNuevo && !c) return;
    
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9992;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;overflow-y:auto;';
    ov.onclick = function(e){if(e.target===ov)ov.remove();};
    
    ov.innerHTML = '<div style="background:white;border-radius:10px;width:650px;max-width:96vw;box-shadow:0 12px 50px rgba(0,0,0,.25);margin-bottom:40px;">'
      +'<div style="padding:14px 20px;background:var(--navy);border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">📋 '+(isNuevo?'Nuevo Contrato':'Editar Contrato Nº '+esc(c.num))+'</span>'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
      +'<div style="padding:20px;max-height:60vh;overflow-y:auto;">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Nº Contrato</label><input id="cls-edit-num" value="'+esc(c.num)+'" placeholder="CON-2026-001" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Estado</label><select id="cls-edit-estado" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"><option value="En Ejecucion" '+(c.estado==='En Ejecucion'?'selected':'')+'>En Ejecución</option><option value="Suspendido" '+(c.estado==='Suspendido'?'selected':'')+'>Suspendido</option><option value="Terminado" '+(c.estado==='Terminado'?'selected':'')+'>Terminado</option></select></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Inicio</label><input id="cls-edit-fini" type="date" value="'+esc(c.fini)+'" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Fin</label><input id="cls-edit-ffin" type="date" value="'+esc(c.ffin)+'" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Objeto del Contrato</label><textarea id="cls-edit-objeto" rows="2" placeholder="Objeto del contrato" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;">'+esc(c.objeto)+'</textarea></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Procesos que soporta</label><textarea id="cls-edit-procesos" rows="2" placeholder="Ej: P-01, P-03" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;">'+esc(c.procesos)+'</textarea></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Valor Contrato</label><div style="display:flex;align-items:center;gap:4px;"><span style="font-weight:700;">$</span><input id="cls-edit-valor" value="'+esc(c.valor)+'" placeholder="Ej: 500.000.000" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Observaciones</label><textarea id="cls-edit-obs" rows="2" placeholder="Observaciones del contrato" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;">'+esc(c.observaciones)+'</textarea></div>'
      +'</div>'
      +'</div>'
      +'<div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" class="btn btn-outline">Cerrar</button>'
      +'</div></div>';
    
    document.body.appendChild(ov);
    
    // ✅ AUTOSAVE: Guardar automáticamente cuando pierda el foco cualquier campo
    ['cls-edit-num','cls-edit-objeto','cls-edit-fini','cls-edit-ffin','cls-edit-estado','cls-edit-valor','cls-edit-procesos','cls-edit-obs'].forEach(id => {
      var el = document.getElementById(id);
      if(el){
        el.addEventListener('blur', function(){
          window.clsGuardarEditoContrato(''+nit+'','+idx+');
        });
      }
    });
  };
  
  window.clsGuardarEditoContrato = function(nit, idx) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t || !t.contratos || (idx >= 0 && !t.contratos[idx])) return;
    
    // Si idx es -1, crear nuevo contrato
    if(idx === -1){
      var c = {
        num: document.getElementById('cls-edit-num')?.value || '',
        objeto: document.getElementById('cls-edit-objeto')?.value || '',
        fini: document.getElementById('cls-edit-fini')?.value || '',
        ffin: document.getElementById('cls-edit-ffin')?.value || '',
        estado: document.getElementById('cls-edit-estado')?.value || 'En Ejecucion',
        valor: document.getElementById('cls-edit-valor')?.value || '',
        procesos: document.getElementById('cls-edit-procesos')?.value || '',
        observaciones: document.getElementById('cls-edit-obs')?.value || ''
      };
      if(!t.contratos) t.contratos = [];
      t.contratos.push(c);
    } else {
      var c = t.contratos[idx];
      c.num = document.getElementById('cls-edit-num')?.value || '';
      c.objeto = document.getElementById('cls-edit-objeto')?.value || '';
      c.fini = document.getElementById('cls-edit-fini')?.value || '';
      c.ffin = document.getElementById('cls-edit-ffin')?.value || '';
      c.estado = document.getElementById('cls-edit-estado')?.value || 'En Ejecucion';
      c.valor = document.getElementById('cls-edit-valor')?.value || '';
      c.procesos = document.getElementById('cls-edit-procesos')?.value || '';
      c.observaciones = document.getElementById('cls-edit-obs')?.value || '';
    }
    
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast('✅ Contrato '+(idx===-1?'creado':'actualizado'),'success',2000); }catch(e){}
    
    // Refrescar modal si está abierto
    var modalAbiertoIGEditar = document.getElementById('m-ig-editar-tercero')?.style.display !== 'none';
    if(modalAbiertoIGEditar){
      try{ mostrarContratosDelTercero(nit); }catch(e){}
    } else {
      try{ clsAbrirGestionContratos(nit, t.nombre); }catch(e){}
    }
    try{ clsRender(); }catch(e){}
  };

  window.clsEliminarContrato = function(nit, idx) {
    if(!confirm('¿Eliminar este contrato?')) return;
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(t && t.contratos && t.contratos[idx]){
      t.contratos.splice(idx, 1);
      try{ window._lsSave && window._lsSave(); }catch(e){}
      clsAbrirGestionContratos(nit, t.nombre);
      clsRender();
    }
  };

  // ✅ NUEVO: Editar contrato desde la vista de Registros
  // ═══════════════════════════════════════════════════════════════════
  // SGRT v35 - EDITAR CONTRATO DESDE REGISTROS
  // SOLO se edita: Organización/Cliente + Supervisor Asociado
  // ═══════════════════════════════════════════════════════════════════
  window.clsEditarContratoDesdeRegistros = function(nit, idx) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t || !t.contratos || !t.contratos[idx]) return;
    var c = t.contratos[idx];
    
    // Obtener las organizaciones disponibles
    var orgs = {
      'colpensiones': '🏛 Colpensiones',
      'ecopetrol': '🛢 Ecopetrol',
      'bancolombia': '🏦 Bancolombia'
    };
    
    // Obtener los supervisores del tercero
    var supervisoresOptions = '<option value="">-- Seleccionar Supervisor --</option>';
    if(t.supervisores && t.supervisores.length > 0){
      t.supervisores.forEach(function(sup, i){
        var selected = (c.supervisor_asociado === sup.nombre_supervisor) ? 'selected' : '';
        supervisoresOptions += '<option value="'+esc(sup.nombre_supervisor)+'" '+selected+'>👤 '+esc(sup.nombre_supervisor)+' ('+esc(sup.cargo||'')+')</option>';
      });
    } else {
      supervisoresOptions += '<option value="">❌ Sin supervisores registrados</option>';
    }
    
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9992;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;overflow-y:auto;';
    ov.onclick = function(e){if(e.target===ov)ov.remove();};
    
    ov.innerHTML = '<div style="background:white;border-radius:10px;width:700px;max-width:96vw;box-shadow:0 12px 50px rgba(0,0,0,.25);margin-bottom:40px;">'
      +'<div style="padding:14px 20px;background:var(--navy);border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">✏️ Editar Contrato Nº '+esc(c.num)+'</span>'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
      +'<div style="padding:20px;max-height:60vh;overflow-y:auto;">'
      
      // INFORMACIÓN GENERAL
      +'<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--blue);">📋 Información del Contrato</div>'
      
      // Nº CONTRATO
      +'<div style="margin-bottom:14px;">'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Nº Contrato *</label>'
      +'<input type="text" id="cls-edit-reg-num" value="'+esc(c.num||'')+'" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      
      // OBJETO
      +'<div style="margin-bottom:14px;">'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Objeto del Contrato *</label>'
      +'<textarea id="cls-edit-reg-objeto" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;resize:vertical;min-height:60px;">'+esc(c.objeto||'')+'</textarea>'
      +'</div>'
      
      // INICIO Y FIN
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">'
      +'<div>'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Fecha Inicio</label>'
      +'<input type="date" id="cls-edit-reg-fini" value="'+esc(c.fini||'')+'" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      +'<div>'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Fecha Fin</label>'
      +'<input type="date" id="cls-edit-reg-ffin" value="'+esc(c.ffin||'')+'" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      +'</div>'
      
      // ESTADO
      +'<div style="margin-bottom:14px;">'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Estado</label>'
      +'<select id="cls-edit-reg-estado" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;cursor:pointer;box-sizing:border-box;">'
      +'<option value="En Ejecucion" '+(c.estado==='En Ejecucion'?'selected':'')+'>▶️ En Ejecución</option>'
      +'<option value="Suspendido" '+(c.estado==='Suspendido'?'selected':'')+'>⏸️ Suspendido</option>'
      +'<option value="Terminado" '+(c.estado==='Terminado'?'selected':'')+'>✅ Terminado</option>'
      +'<option value="Por Iniciar" '+(c.estado==='Por Iniciar'?'selected':'')+'>⏳ Por Iniciar</option>'
      +'</select>'
      +'</div>'
      
      // VALOR Y PROCESOS
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">'
      +'<div>'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Valor ($)</label>'
      +'<input type="number" id="cls-edit-reg-valor" value="'+esc(c.valor||'')+'" placeholder="0" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      +'<div>'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Procesos</label>'
      +'<input type="text" id="cls-edit-reg-procesos" value="'+esc(c.procesos||'')+'" placeholder="P-01, P-02, P-03..." style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      +'</div>'
      
      // OBSERVACIONES
      +'<div style="margin-bottom:16px;">'
      +'<label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;text-transform:uppercase;">Observaciones</label>'
      +'<textarea id="cls-edit-reg-observaciones" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;box-sizing:border-box;resize:vertical;min-height:50px;">'+esc(c.observaciones||'')+'</textarea>'
      +'</div>'
      
      // SEPARADOR
      +'<div style="height:1px;background:#e2e8f0;margin-bottom:16px;"></div>'
      
      +'</div>'
      +'<div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">'
      +'<button type="button" onclick="this.closest(\'[style*=inset]\').remove()" class="btn btn-outline" style="padding:8px 16px;border:1px solid #e2e8f0;background:white;color:#475569;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      +'<button type="button" onclick="window.clsGuardarEditoContratoDesdeRegistros(\''+nit+'\','+idx+');this.closest(\'[style*=inset]\').remove();" class="btn btn-primary" style="padding:8px 16px;background:#28a745;color:white;border:none;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">💾 Guardar</button>'
      +'</div></div>';
    
    document.body.appendChild(ov);
  };

  // ✅ GUARDAR CAMBIOS: TODOS LOS CAMPOS DEL CONTRATO
  window.clsGuardarEditoContratoDesdeRegistros = function(nit, idx) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t || !t.contratos || !t.contratos[idx]) return;
    
    var c = t.contratos[idx];
    
    // Obtener valores de todos los campos
    var numValue = (document.getElementById('cls-edit-reg-num')?.value || '').trim();
    var objetoValue = (document.getElementById('cls-edit-reg-objeto')?.value || '').trim();
    var finiValue = document.getElementById('cls-edit-reg-fini')?.value || '';
    var ffinValue = document.getElementById('cls-edit-reg-ffin')?.value || '';
    var estadoValue = document.getElementById('cls-edit-reg-estado')?.value || '';
    var valorValue = document.getElementById('cls-edit-reg-valor')?.value || '';
    var procesosValue = (document.getElementById('cls-edit-reg-procesos')?.value || '').trim();
    var observacionesValue = (document.getElementById('cls-edit-reg-observaciones')?.value || '').trim();
    
    // Validar campos obligatorios
    if(!numValue){
      alert('⚠️ El Nº Contrato es obligatorio');
      return;
    }
    if(!objetoValue){
      alert('⚠️ El Objeto del Contrato es obligatorio');
      return;
    }
    
    // Guardar TODOS los campos
    c.num = numValue;
    c.objeto = objetoValue;
    c.fini = finiValue;
    c.ffin = ffinValue;
    c.estado = estadoValue || 'En Ejecucion';
    c.valor = valorValue;
    c.procesos = procesosValue;
    c.observaciones = observacionesValue;
    
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast('✅ Contrato actualizado','success',2000); }catch(e){}
    try{ clsRender(); }catch(e){}
  };

  // ✅ NUEVO: Actualizar supervisor desde el cuadro de contrato
  window.clsActualizarSupervisor = function(nit, idx, valor) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t || !t.contratos || !t.contratos[idx]) return;
    
    var c = t.contratos[idx];
    c.supervisor_asociado = valor;
    
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast('✅ Supervisor guardado','success',1500); }catch(e){}
  };

  // ✅ NUEVO: Borrar contrato desde la vista de Registros
  window.clsEliminarContratoDesdeRegistros = function(nit, idx) {
    if(!confirm('¿Eliminar este contrato?')) return;
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(t && t.contratos && t.contratos[idx]){
      t.contratos.splice(idx, 1);
      try{ window._lsSave && window._lsSave(); }catch(e){}
      try{ showToast('✅ Contrato eliminado','success',2000); }catch(e){}
      try{ clsRender(); }catch(e){}
    }
  };

  // Alias para llamar desde registros
  window.clsAgregarContratoDesdeRegistros = function(nit) {
    window.clsAgregarContrato(nit);
  };

  window.clsAgregarContrato = function(nit) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t) return;
    
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9992;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;overflow-y:auto;';
    ov.onclick = function(e){if(e.target===ov)ov.remove();};
    
    ov.innerHTML = '<div style="background:white;border-radius:10px;width:650px;max-width:96vw;box-shadow:0 12px 50px rgba(0,0,0,.25);margin-bottom:40px;">'
      +'<div style="padding:14px 20px;background:var(--navy);border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
      +'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">➕ Nuevo Contrato</span>'
      +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
      +'<div style="padding:20px;max-height:60vh;overflow-y:auto;">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Nº Contrato</label><input id="cls-new-num" placeholder="CON-2026-001" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Estado</label><select id="cls-new-estado" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"><option value="En Ejecucion">En Ejecución</option><option value="Suspendido">Suspendido</option><option value="Terminado">Terminado</option></select></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Inicio</label><input id="cls-new-fini" type="date" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Fin</label><input id="cls-new-ffin" type="date" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Objeto del Contrato</label><textarea id="cls-new-objeto" rows="2" placeholder="Objeto del contrato" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;"></textarea></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Procesos que soporta</label><textarea id="cls-new-procesos" rows="2" placeholder="Ej: P-01, P-03" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;"></textarea></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Valor Contrato</label><div style="display:flex;align-items:center;gap:4px;"><span style="font-weight:700;">$</span><input id="cls-new-valor" placeholder="Ej: 500.000.000" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Observaciones</label><textarea id="cls-new-obs" rows="2" placeholder="Observaciones del contrato" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;"></textarea></div>'
      +'</div>'
      +'<div style="padding:0 20px 20px;display:flex;justify-content:flex-end;gap:8px;">'
      +'<button type="button" onclick="this.closest(\'[style*=inset]\').remove()" class="btn btn-outline">Cancelar</button>'
      +'<button type="button" onclick="window.clsGuardarNuevoContrato(\''+nit+'\');setTimeout(function(){var m=document.querySelector(\'[style*=inset]\');if(m)m.remove();},200);" class="btn btn-primary">✅ Crear Contrato</button>'
      +'</div></div>';
    
    document.body.appendChild(ov);
  };
  
  window.clsGuardarNuevoContrato = function(nit) {
    var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
    var t = db[nit];
    if(!t){
      showToast('⚠️ Tercero no encontrado','error',2000);
      return;
    }
    if(!t.contratos){
      t.contratos = [];
    }
    
    var num = (document.getElementById('cls-new-num')?.value || '').trim();
    var objeto = (document.getElementById('cls-new-objeto')?.value || '').trim();
    var procesos = (document.getElementById('cls-new-procesos')?.value || '').trim();
    
    if(!num){
      showToast('⚠️ El número de contrato es obligatorio','error',2000);
      return;
    }
    
    // Verificar si el contrato ya existe
    if(t.contratos.some(function(c){return c.num === num;})){
      showToast('⚠️ Este número de contrato ya existe','warning',2000);
      return;
    }
    
    var nuevoContrato = {
      num: num,
      objeto: objeto,
      fini: document.getElementById('cls-new-fini')?.value || '',
      ffin: document.getElementById('cls-new-ffin')?.value || '',
      estado: document.getElementById('cls-new-estado')?.value || 'En Ejecucion',
      valor: document.getElementById('cls-new-valor')?.value || '',
      procesos: procesos,
      observaciones: document.getElementById('cls-new-obs')?.value || '',
      supervisor: '',
      supervisorCargo: '',
      procesoSupervision: '',
      supervisorAlt: '',
      supervisorAltCargo: '',
      procesoSupervisionAlt: '',
      creadoAt: new Date().toISOString(),
      origen: 'registro',
      dims: []
    };
    
    // Guardar en la base de datos
    t.contratos.push(nuevoContrato);
    
    // Persistir en localStorage
    try{
      window._lsSave && window._lsSave();
    }catch(e){
      console.error('Error al guardar en localStorage:', e);
    }
    
    // Log de auditoría
    try{
      addLog(t.nombre, 'RELACION_TERCEROS_CONTRATOS', 'Creación', '—',
        'Contrato ' + num + ' creado · Objeto: ' + objeto,
        new Date().toLocaleDateString('es-CO', {day:'2-digit', month:'short', year:'numeric'}),
        'Contratos');
    }catch(e){}
    
    // Mostrar notificación
    try{
      showToast('✅ Contrato "'+num+'" creado correctamente','success',2500);
    }catch(e){}
    
    // Actualizar UI
    try{
      clsAbrirGestionContratos(nit, t.nombre);
    }catch(e){
      console.error('Error al abrir gestión de contratos:', e);
    }
    
    try{
      clsRender && clsRender();
    }catch(e){}
  };

  window.clsBorrarRegistro = function(nit, yr, nombre) {
    if(!confirm('¿Estás seguro de que deseas BORRAR el registro de "'+nombre+'" ('+nit+')?')) return;
    // Borrar de CLS_DB
    if(window.CLS_DB && window.CLS_DB[yr]){
      var idx = window.CLS_DB[yr].findIndex(function(r){return r.nit===nit;});
      if(idx>=0) window.CLS_DB[yr].splice(idx,1);
    }
    // Borrar del localStorage
    try{
      var saved = JSON.parse(localStorage.getItem('sgrt_cls_db')||'{}');
      if(saved[yr]){
        var idx2 = saved[yr].findIndex(function(r){return r.nit===nit;});
        if(idx2>=0) saved[yr].splice(idx2,1);
        localStorage.setItem('sgrt_cls_db', JSON.stringify(saved));
      }
    }catch(e){}
    // Renderizar tabla y mostrar confirmación
    window.clsRender();
    if(typeof showToast==='function') showToast('Registro eliminado: '+nombre,'success',2000);
  };

  window.clsNuevoAno = function(){
    var yr=prompt('Nuevo año (ej: 2027):',(new Date().getFullYear()+1).toString());
    if(!yr||yr.trim().length!==4){if(typeof showToast==='function')showToast('Año inválido','error',2000);return;}
    yr=yr.trim();
    if(!window.CLS_DB[yr]) window.CLS_DB[yr]=[];
    var wrap=document.getElementById('cls-yr-btns'); if(wrap) wrap.dataset.sel=yr;
    window.clsInitDash();
    if(typeof showToast==='function') showToast('Año '+yr+' creado','success',2500);
  };

  window.clsLimpiarAno = function(){
    var wrap=document.getElementById('cls-yr-btns');
    var yr=(wrap&&wrap.dataset.sel)||new Date().getFullYear().toString();
    if(!confirm('¿Limpiar todos los registros del año '+yr+'?')) return;
    window.CLS_DB[yr]=[];
    window.clsRender();
    if(typeof showToast==='function') showToast('Año '+yr+' limpiado','success',2500);
  };

  /* ── LUPAS ────────────────────────────────────────────────────── */
  function _lupaModal(titulo, items) {
    var old=document.getElementById('_lupmod'); if(old) old.remove();
    var ov=document.createElement('div'); ov.id='_lupmod';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:80px;';
    ov.onclick=function(e){if(e.target===ov)ov.remove();};
    var box=document.createElement('div');
    box.style.cssText='background:white;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.25);width:500px;max-width:95vw;max-height:72vh;display:flex;flex-direction:column;overflow:hidden;';
    var hdr=document.createElement('div');
    hdr.style.cssText='padding:13px 18px;background:var(--navy);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
    var ht=document.createElement('span');ht.style.cssText='font-family:Montserrat,sans-serif;font-size:14px;font-weight:700;color:white;';ht.textContent=titulo;
    var hc=document.createElement('button');hc.style.cssText='background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;line-height:1;padding:0;';hc.innerHTML='&times;';hc.onclick=function(){ov.remove();};
    hdr.appendChild(ht);hdr.appendChild(hc);
    var sw=document.createElement('div');sw.style.cssText='padding:10px 14px;border-bottom:1px solid var(--border);flex-shrink:0;';
    var si=document.createElement('input');si.type='text';si.placeholder='Buscar...';
    si.style.cssText='width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;';
    si.oninput=function(){
      var q=si.value.toLowerCase();
      list.querySelectorAll('._li').forEach(function(el){
        el.style.display=(!q||el.dataset.label.toLowerCase().indexOf(q)>=0)?'':'none';
      });
    };
    sw.appendChild(si);
    var list=document.createElement('div');list.style.cssText='overflow-y:auto;flex:1;';
    if(!items.length){
      var em=document.createElement('div');em.style.cssText='padding:24px;text-align:center;color:var(--muted);font-style:italic;font-size:13px;';
      em.textContent='Sin elementos registrados aun. Guarda el primer registro en Clasificacion.';
      list.appendChild(em);
    } else {
      items.forEach(function(item){
        var row=document.createElement('div');row.className='_li';row.setAttribute('data-label',item.label);
        row.style.cssText='padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;';
        row.onmouseover=function(){this.style.background='var(--gray3)';};
        row.onmouseout=function(){this.style.background='';};
        var info=document.createElement('div');info.style.cssText='flex:1;cursor:pointer;min-width:0;';
        info.onclick=function(){item.action();ov.remove();};
        var lbl=document.createElement('div');lbl.style.cssText='font-size:13px;font-weight:600;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';lbl.textContent=item.label;info.appendChild(lbl);
        if(item.sub){var sub=document.createElement('div');sub.style.cssText='font-size:11px;color:var(--muted);margin-top:2px;';sub.textContent=item.sub;info.appendChild(sub);}
        row.appendChild(info);
        if(item.onEdit){
          var btnEdit=document.createElement('button');
          btnEdit.textContent='\u270F\uFE0F Editar';
          btnEdit.style.cssText='flex-shrink:0;padding:4px 10px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:5px;font-size:11.5px;font-weight:600;color:#15803D;cursor:pointer;font-family:inherit;white-space:nowrap;';
          btnEdit.onmouseover=function(){this.style.background='#DCFCE7';};
          btnEdit.onmouseout=function(){this.style.background='#F0FDF4';};
          btnEdit.onclick=function(e){e.stopPropagation();ov.remove();item.onEdit();};
          row.appendChild(btnEdit);
        }
        list.appendChild(row);
      });
    }
    box.appendChild(hdr);box.appendChild(sw);box.appendChild(list);ov.appendChild(box);document.body.appendChild(ov);
    setTimeout(function(){si.focus();},80);
  }

  window.lupaAbrirTercero = function(){
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    var clsDB=window.CLS_DB||{};
    var todos={};
    Object.values(db).forEach(function(t){if(t.nit)todos[t.nit]=t;});
    Object.values(clsDB).forEach(function(arr){arr.forEach(function(r){if(r.nit&&!todos[r.nit])todos[r.nit]=r;});});
    var items=Object.values(todos).map(function(t){
      var p=t.prom!=null?parseFloat(t.prom).toFixed(2):'-';
      var EL={colpensiones:'Colpensiones',ecopetrol:'Ecopetrol',bancolombia:'Bancolombia'};
      var ek=(t.entidad||'').toLowerCase().replace(/\s+/g,'');
      var entLabel=EL[ek]||t.entidad||'-';
      return {
        label:(t.nombre||'-')+'  |  NIT: '+(t.nit||''),
        sub:'Supervisor: '+(t.supervisor||'-')+'  |  Entidad: '+entLabel+'  |  Prom: '+p,
        action:function(){ window._lupaCargarTercero(t); },
        onEdit:function(){ window._lupaEditarDetalle(t); }
      };
    });
    _lupaModal('Buscar Tercero', items);
  };

  // Cargar tercero en el formulario sin abrir modal de edicion
  window._lupaCargarTercero = function(t){
    var sets=[
      ['cf-nombre',    t.nombre||t.NombreTercero],
      ['cf-nit',       t.nit||t.NIT],
      ['cf-servicio',  t.servicio||t.ServicioContratado],
      ['cf-domicilio', t.domicilio||t.Domicilio],
      ['cf-cargo',     t.cargo||t.CargoSupervisor],
      ['cf-objetivo',  t.objetivo||t.ObjetivoContrato],
      ['cf-nocontrato',t.nocontrato||t.NoContrato],
      ['cf-supervisor',t.supervisor||t.SupervisorNombre]
    ];
    sets.forEach(function(p){var e=document.getElementById(p[0]);if(e&&p[1])e.value=p[1];});
    var fe=document.getElementById('cf-entidad');
    if(fe&&(t.entidad||t.NombreEntidad)){
      fe.disabled=false;
      fe.value=t.entidad||t.NombreEntidad;
    }
    if(typeof showToast==='function') showToast('Tercero cargado: '+(t.nombre||t.nit),'success',2000);
  };

  // Modal para editar supervisor, nombre, servicio de un tercero
  window._lupaEditarDetalle = function(tOrig){
    var nit=tOrig.nit||tOrig.NIT||'';
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    var t=Object.assign({},tOrig, db[nit]||{});
    var EL={colpensiones:'Colpensiones',ecopetrol:'Ecopetrol',bancolombia:'Bancolombia'};
    var ek=(t.entidad||'').toLowerCase().replace(/\s+/g,'');
    var entLabel=EL[ek]||t.entidad||'-';
    var p=parseFloat(t.prom||0); var cc=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';

    var old=document.getElementById('_edit-tercero-modal'); if(old) old.remove();
    var ov=document.createElement('div'); ov.id='_edit-tercero-modal';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding-top:70px;';
    ov.onclick=function(e){if(e.target===ov)ov.remove();};

    var box=document.createElement('div');
    box.style.cssText='background:white;border-radius:12px;width:580px;max-width:96vw;max-height:85vh;overflow:auto;box-shadow:0 12px 50px rgba(0,0,0,.25);';

    // Header
    var hdr=document.createElement('div');
    hdr.style.cssText='padding:14px 20px;background:var(--navy);border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;';
    var htitle=document.createElement('div');
    htitle.innerHTML='<div style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">'+(t.nombre||nit)+'</div>'
      +'<div style="font-size:11px;color:rgba(255,255,255,.6);margin-top:2px;">NIT: '+(t.nit||'-')+'  |  '+entLabel+'</div>';
    var hclose=document.createElement('button');
    hclose.innerHTML='&times;';
    hclose.style.cssText='background:none;border:none;color:rgba(255,255,255,.7);font-size:24px;cursor:pointer;padding:0;line-height:1;';
    hclose.onclick=function(){ov.remove();};
    hdr.appendChild(htitle); hdr.appendChild(hclose);

    // Prom badge
    var promDiv=document.createElement('div');
    promDiv.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 20px;background:var(--gray3);border-bottom:1px solid var(--border);';
    promDiv.innerHTML='<span style="font-size:12px;font-weight:600;color:var(--text);">Promedio:</span>'
      +'<span class="chip '+cc+'" style="font-size:14px;font-weight:800;">'+(isNaN(p)?'-':p.toFixed(2))+'</span>'
      +'<span style="font-size:12px;color:var(--muted);">'+(t.zona||'-')+'</span>'
      +'<span style="font-size:11px;color:var(--muted);margin-left:4px;">'+(t.periodicidad||'')+'</span>';

    // Fields grid
    var body=document.createElement('div');
    body.style.cssText='padding:20px;';
    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;';

    function mkF(lbl, id, val, readonly){
      var w=document.createElement('div');
      var lb=document.createElement('div');
      lb.style.cssText='font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:3px;letter-spacing:.04em;';
      lb.textContent=lbl;
      var inp;
      if(readonly){
        inp=document.createElement('div');
        inp.style.cssText='padding:7px 10px;background:var(--gray3);border-radius:var(--r);font-size:12.5px;min-height:32px;color:var(--text);';
        inp.textContent=val||'-';
      } else {
        inp=document.createElement('input');
        inp.id=id; inp.type='text'; inp.value=val||'';
        inp.style.cssText='width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;box-sizing:border-box;';
      }
      w.appendChild(lb); w.appendChild(inp);
      return w;
    }
    function mkFSel(lbl, id, val){
      var w=document.createElement('div');
      var lb=document.createElement('div');
      lb.style.cssText='font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:3px;letter-spacing:.04em;';
      lb.textContent=lbl;
      var sel=document.createElement('select');
      sel.id=id;
      sel.style.cssText='width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;';
      [['','-- Seleccionar --'],['colpensiones','Colpensiones'],['ecopetrol','Ecopetrol'],['bancolombia','Bancolombia']].forEach(function(opt){
        var o=document.createElement('option'); o.value=opt[0]; o.textContent=opt[1];
        if(val===opt[0]) o.selected=true;
        sel.appendChild(o);
      });
      w.appendChild(lb); w.appendChild(sel);
      return w;
    }

    grid.appendChild(mkF('Nombre del Tercero', '_et_nom', t.nombre, false));
    grid.appendChild(mkF('NIT', '_et_nit', t.nit, true));
    grid.appendChild(mkFSel('Entidad', '_et_ent', ek));
    grid.appendChild(mkF('Servicio Contratado', '_et_srv', t.servicio, false));
    grid.appendChild(mkF('Supervisor', '_et_sup', t.supervisor, false));
    grid.appendChild(mkF('Cargo Supervisor', '_et_car', t.cargo, false));
    grid.appendChild(mkF('No. Contrato', '_et_con', t.nocontrato, false));
    grid.appendChild(mkF('Domicilio', '_et_dom', t.domicilio, false));
    grid.appendChild(mkF('F. Inicio', '_et_fi', t.finicio, false));
    grid.appendChild(mkF('F. Termino', '_et_ft', t.fterm, false));
    grid.appendChild(mkF('Valor', '_et_val', t.valor, false));
    grid.appendChild(mkF('Periodicidad', '_et_per', t.periodicidad, false));

    // Footer buttons
    var foot=document.createElement('div');
    foot.style.cssText='display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:14px;';

    var btnClose=document.createElement('button');
    btnClose.className='btn btn-outline'; btnClose.textContent='Cancelar';
    btnClose.onclick=function(){ov.remove();};

    var btnLoad=document.createElement('button');
    btnLoad.className='btn btn-outline';
    btnLoad.style.cssText='border-color:var(--blue);color:var(--blue);';
    btnLoad.textContent='Cargar en formulario';
    btnLoad.onclick=function(){
      window._lupaGuardarYCargar(nit);
    };

    var btnSave=document.createElement('button');
    btnSave.className='btn btn-success'; btnSave.textContent='Guardar cambios';
    btnSave.onclick=function(){
      window._lupaGuardarYCargar(nit);
    };

    foot.appendChild(btnClose); foot.appendChild(btnLoad); foot.appendChild(btnSave);

    body.appendChild(grid); body.appendChild(foot);
    box.appendChild(hdr); box.appendChild(promDiv); box.appendChild(body);
    ov.appendChild(box); document.body.appendChild(ov);
  };

  window._lupaGuardarYCargar = function(nit){
    function gv(id){var e=document.getElementById(id);return e?e.value:null;}
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    var patch={
      nombre:     gv('_et_nom'),
      entidad:    gv('_et_ent'),
      servicio:   gv('_et_srv'),
      supervisor: gv('_et_sup'),
      cargo:      gv('_et_car'),
      nocontrato: gv('_et_con'),
      domicilio:  gv('_et_dom'),
      finicio:    gv('_et_fi'),
      fterm:      gv('_et_ft'),
      valor:      gv('_et_val'),
      periodicidad: gv('_et_per')
    };
    // Update TERCEROS_DB
    if(db[nit]) Object.assign(db[nit], patch);
    // Update CLS_DB all years
    Object.values(window.CLS_DB||{}).forEach(function(arr){
      arr.forEach(function(r){if(r.nit===nit) Object.assign(r,patch);});
    });
    // Load into form
    var sets=[
      ['cf-nombre',    patch.nombre],
      ['cf-nit',       nit],
      ['cf-servicio',  patch.servicio],
      ['cf-domicilio', patch.domicilio],
      ['cf-cargo',     patch.cargo],
      ['cf-nocontrato',patch.nocontrato],
      ['cf-supervisor',patch.supervisor]
    ];
    sets.forEach(function(p){var e=document.getElementById(p[0]);if(e&&p[1])e.value=p[1];});
    var fe=document.getElementById('cf-entidad');
    if(fe&&patch.entidad){fe.disabled=false; fe.value=patch.entidad;}
    // Re-render cls dashboard if open
    var pd=document.getElementById('cls-panel-dash');
    if(pd&&pd.style.display!=='none') window.clsRender();
    var m=document.getElementById('_edit-tercero-modal'); if(m) m.remove();
    if(typeof showToast==='function') showToast('Datos actualizados y cargados en el formulario','success',2500);
  };
  window.lupaAbrirSupervisor = function(){
    var seen={};
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    Object.values(db).forEach(function(t){if(t.supervisor)seen[t.supervisor]=true;if(t.SupervisorNombre)seen[t.SupervisorNombre]=true;});
    // Also check CLS_DB
    Object.values(window.CLS_DB||{}).forEach(function(arr){arr.forEach(function(r){if(r.supervisor)seen[r.supervisor]=true;});});
    ['Carolina V.','Andres M.','Luis T.','J. Ramirez','M. Torres','A. Gomez','C. Molina','P. Vargas'].forEach(function(s){seen[s]=true;});
    var items=Object.keys(seen).sort().map(function(s){
      return{label:s,sub:'Supervisor registrado',action:function(){var e=document.getElementById('cf-supervisor');if(e)e.value=s;}};
    });
    _lupaModal('Buscar Supervisor', items);
  };

  window.lupaAbrirProceso = function(){
    var procs=['P-01 Gestion de Riesgos de Terceros','P-02 Evaluacion y Clasificacion','P-03 Seguimiento y Monitoreo','Control Interno','Gestion de Riesgos','Auditoria Interna','Cumplimiento y Normatividad','TI y Seguridad de la Informacion','Juridica y Contratos','Operaciones'];
    // Also try to load from API
    try{fetch((typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000')+'/api/procesos').then(function(r){return r.json();}).then(function(d){if(d.ok&&d.data.length){var extra=d.data.map(function(p){return p.Nombre;});extra.forEach(function(n){if(procs.indexOf(n)<0)procs.unshift(n);});}}).catch(function(){});}catch(e){}
    var items=procs.map(function(p){return{label:p,sub:'',action:function(){var e=document.getElementById('cf-proceso-supervision');if(e)e.value=p;}};});
    _lupaModal('Buscar Proceso de Supervision', items);
  };

  /* ── PERSONALIZAR CUESTIONARIO AC ────────────────────────────── */
  window.PC_CAMPOS = [
    {id:'pc_sup', n:'Nombre del Supervisor',  t:'text',     a:true,  f:false},
    {id:'pc_fec', n:'Fecha de Evaluacion',    t:'date',     a:true,  f:true},
    {id:'pc_ent', n:'Entidad / Cliente',       t:'text',     a:true,  f:true},
    {id:'pc_car', n:'Cargo del Supervisor',   t:'text',     a:false, f:false},
    {id:'pc_con', n:'No. Contrato',           t:'text',     a:false, f:false},
    {id:'pc_obj', n:'Objetivo del Contrato',  t:'textarea', a:false, f:false},
    {id:'pc_nit', n:'NIT del Tercero',        t:'text',     a:false, f:false},
    {id:'pc_not', n:'Notas adicionales',      t:'textarea', a:false, f:false},
  ];

  window.togglePersonalizar = function(){
    var b=document.getElementById('personalizar-body');
    var a=document.getElementById('personalizar-arr');
    if(!b) return;
    var open=b.style.display!=='none'&&b.style.display!=='';
    b.style.display=open?'none':'block';
    if(a) a.textContent=open?'▼':'▲';
    if(!open) window.renderPC();
  };

  window.renderPC = function(){
    var wrap=document.getElementById('personalizar-campos');
    if(!wrap) return;
    var tipos={text:'Texto',select:'Si/No',date:'Fecha',textarea:'Parrafo'};
    wrap.innerHTML=window.PC_CAMPOS.map(function(c){
      return '<label style="display:flex;align-items:center;gap:8px;padding:9px 13px;background:var(--gray3);border-radius:var(--r);cursor:pointer;font-size:12.5px;min-height:40px;">'
        +'<input type="checkbox"'+(c.a?' checked':'')+' onchange="pcToggle(\''+c.id+'\',this.checked)" style="width:16px;height:16px;accent-color:var(--teal);cursor:pointer;flex-shrink:0;"/>'
        +'<span style="flex:1;font-weight:500;">'+c.n+'</span>'
        +'<span style="font-size:10px;color:var(--muted);background:var(--gray2);padding:2px 7px;border-radius:8px;white-space:nowrap;">'+(tipos[c.t]||c.t)+'</span>'
        +(c.f?'':'<button type="button" onclick="pcElim(\''+c.id+'\');event.preventDefault();event.stopPropagation();" style="padding:2px 8px;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);border-radius:4px;font-size:10px;cursor:pointer;flex-shrink:0;">✕</button>')
        +'</label>';
    }).join('');
    // Also render the active fields in the cuestionario area
    window.renderCamposAC();
  };

  window.pcToggle = function(id,v){
    var c=window.PC_CAMPOS.find(function(x){return x.id===id;});
    if(c){c.a=v; window.renderPC();}
  };
  window.pcElim = function(id){
    window.PC_CAMPOS=window.PC_CAMPOS.filter(function(c){return c.id!==id;});
    window.renderPC();
  };
  window.pcAgregarCampo = function(){
    var n=(document.getElementById('pc-nuevo-nombre')||{}).value||'';
    var t=(document.getElementById('pc-nuevo-tipo')||{}).value||'text';
    if(!n.trim()){if(typeof showToast==='function')showToast('Escribe el nombre del campo','error',2000);return;}
    window.PC_CAMPOS.push({id:'pc_x_'+Date.now(),n:n.trim(),t:t,a:true,f:false});
    document.getElementById('pc-nuevo-nombre').value='';
    window.renderPC();
    if(typeof showToast==='function') showToast('Campo "'+n+'" agregado','success',2000);
  };

  // Render active AC fields in the cuestionario form area
  window.renderCamposAC = function(){
    var wrap=document.getElementById('ac-campos-extra');
    if(!wrap) return;
    var activos=window.PC_CAMPOS.filter(function(c){return c.a;});
    if(!activos.length){wrap.style.display='none';return;}
    wrap.style.display='block';
    var tipos={text:'text',date:'date',select:'select',textarea:'textarea'};
    wrap.innerHTML='<div style="font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;color:var(--navy);margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em;">Campos del Formulario AC</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'
      +activos.map(function(c){
        var isWide=c.t==='textarea';
        var style=isWide?'grid-column:span 2;':'';
        var ipt;
        if(c.t==='select') ipt='<select id="qe_'+c.id+'" style="padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;width:100%;"><option value="">—</option><option>Si</option><option>No</option><option>N/A</option></select>';
        else if(c.t==='textarea') ipt='<textarea id="qe_'+c.id+'" rows="2" placeholder="'+c.n+'..." style="padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;resize:vertical;width:100%;box-sizing:border-box;"></textarea>';
        else ipt='<input type="'+c.t+'" id="qe_'+c.id+'" placeholder="'+c.n+'..." style="padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;width:100%;box-sizing:border-box;"/>';
        return '<div class="field" style="margin:0;'+style+'"><label style="font-size:11.5px;font-weight:600;color:var(--text);">'+c.n+'</label>'+ipt+'</div>';
      }).join('')+'</div>';
  };

  /* ── DASHBOARD PRINCIPAL — año ───────────────────────────────── */
  window.DASH_YR = new Date().getFullYear().toString();

  window.dashInitYears = function(){
    var yrs={};
    yrs[window.DASH_YR]=true;
    if(window.CLS_DB) Object.keys(window.CLS_DB).forEach(function(y){if((window.CLS_DB[y]||[]).length)yrs[y]=true;});
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    Object.values(db).forEach(function(t){var y=t.yr||window.DASH_YR;yrs[y]=true;});
    // Always include 2026, 2027, 2028
    ['2026','2027','2028'].forEach(function(y){yrs[y]=true;});
    var sorted=Object.keys(yrs).sort().reverse();
    var wrap=document.getElementById('dash-yr-btns'); if(!wrap) return;
    wrap.innerHTML=sorted.map(function(yr){
      var active=yr===window.DASH_YR;
      return '<button data-yr="'+yr+'" onclick="dashSelYear(this.dataset.yr)" style="padding:4px 14px;border-radius:20px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:'+(active?'700':'400')+';border:1px solid '+(active?'white':'rgba(255,255,255,.35)')+';background:'+(active?'white':'rgba(255,255,255,.1)')+';color:'+(active?'var(--navy)':'white')+';">'+yr+'</button>';
    }).join('');
  };

  window.dashSelYear = function(yr){
    window.DASH_YR=yr;
    window.dashInitYears();
    window.dashUpdateKPIs();
  };

  window.dashUpdateKPIs = function(){
    var yr=window.DASH_YR;
    var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
    var cls=(window.CLS_DB&&window.CLS_DB[yr])?window.CLS_DB[yr]:[];
    var recs=cls.slice();
    Object.values(db).forEach(function(t){
      var ty=t.yr||window.DASH_YR;
      if(ty===yr&&!recs.find(function(r){return r.nit===t.nit;})) recs.push(t);
    });
    if(!recs.length) recs=Object.values(db);
    var ext=0,alto=0,med=0,bajo=0;
    recs.forEach(function(r){var p=parseFloat(r.prom||0);if(p>=4)ext++;else if(p>=3.5)alto++;else if(p>=3)med++;else bajo++;});
    function se(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
    se('kpi-terceros',recs.length);se('kpi-extremos',ext);
    se('dash-ext',ext);se('dash-alto',alto);se('dash-med',med);se('dash-bajo',bajo);
    // Alerta 2da etapa
    var etapa2=recs.filter(function(r){return parseFloat(r.prom||0)>=3;});
    var al=document.getElementById('dash-alerta-etapa2');
    var li=document.getElementById('dash-etapa2-lista');
    if(al){
      al.style.display=etapa2.length?'block':'none';
      if(li&&etapa2.length) li.textContent=etapa2.length+' tercero'+(etapa2.length!==1?'s':'')+' pasan a Cuestionario AC: '+etapa2.slice(0,5).map(function(r){return r.nombre||r.nit;}).join(', ')+(etapa2.length>5?'...':'');
    }
  };

  window.filterIGFuncionarios = function(){
    var q=((document.getElementById('ig-func-search')||{}).value||'').toLowerCase();
    document.querySelectorAll('#ig-tbody-funcionarios tr').forEach(function(tr){
      tr.style.display=(!q||tr.textContent.toLowerCase().indexOf(q)>=0)?'':'none';
    });
  };

  /* ── API helper ──────────────────────────────────────────────── */
  var _AB = (typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000');
  window.apiGet = function(url, cb){
    var full = url.startsWith('http') ? url : _AB + url;
    fetch(full).then(function(r){return r.json();}).then(function(d){if(d.ok)cb(null,d.data);else cb(d.error,null);}).catch(function(e){console.warn('API no disponible:',full);cb(null,null);});
  };

  window.cargarTercerosDesdeAPI = async function(){
    // ⭐ ACTIVADO: Cargar desde Azure SQL via GET /api/terceros
    try {
      const apiUrl = (typeof API_BASE!=='undefined'?API_BASE:'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net') + '/api/terceros';
      
      console.log('📥 Cargando terceros desde API: ' + apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
      });
      
      if(!response.ok) {
        console.warn('⚠️ GET /api/terceros devolvió ' + response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Recibidos ' + (data.recordset?.length || 0) + ' terceros de Azure SQL');
      
      if(!data.recordset || data.recordset.length === 0) {
        console.warn('⚠️ No hay terceros en Azure SQL');
        return;
      }
      
      var db = typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
      
      // Mapear campos de Azure SQL a TERCEROS_DB
      data.recordset.forEach(function(t){
        var nit = t.NIT || t.nit || ''; 
        if(!nit) return;
        
        // Mergear con datos existentes pero preferir datos de SQL
        var existing = db[nit] || {};
        db[nit] = Object.assign(existing, {
          nit: nit,
          nombre: t.Nombre || t.nombre || '',
          entidad: t.Entidad || t.entidad || 'colpensiones',
          domicilio: t.Domicilio || t.domicilio || '',
          servicio: t.ServicioContratado || t.servicio || '',
          supervisor: t.Supervisor || t.supervisor || '',
          prom: parseFloat(t.PromedioCalificacion || t.prom || 0),
          zona: t.ZonaRiesgo || t.zona || 'MEDIO',
          estado: t.Estado || t.estado || 'Activo',
          clasificacion: t.Clasificacion || t.clasificacion || 'MEDIO',
          nivel_riesgo: t.NivelRiesgo || t.nivel_riesgo || 'MEDIO',
          contratos: t.Contratos ? JSON.parse(t.Contratos) : [],
          supervisores: t.Supervisores ? JSON.parse(t.Supervisores) : [],
          dims: t.Tipologias ? JSON.parse(t.Tipologias) : [],
          periodicidad: t.ZonaRiesgo && t.ZonaRiesgo !== 'BAJO' ? 'Se evalúa' : 'Sin evaluación',
          yr: new Date().getFullYear().toString()
        });
      });
      
      // Actualizar TERCEROS_DB global
      if(typeof TERCEROS_DB !== 'undefined') {
        Object.assign(TERCEROS_DB, db);
      }
      
      console.log('✅ TERCEROS_DB actualizada desde Azure SQL con ' + Object.keys(db).length + ' registros');
      
      // Actualizar vistas
      if(typeof renderTercerosTable==='function') renderTercerosTable();
      if(typeof renderIGTerceros==='function') renderIGTerceros();
      if(typeof renderIGContratos==='function') renderIGContratos();
      if(typeof window.dashInitYears==='function') window.dashInitYears();
      if(typeof window.dashUpdateKPIs==='function') window.dashUpdateKPIs();
      
    } catch(e) {
      console.error('❌ Error cargando terceros desde API:', e);
    }
  };

  /* ── INIT ────────────────────────────────────────────────────── */
  
// ════════════════════════════════════════════════════════════════════
// FUNCIÓN DE PRECARGA DE DATOS - Integrada
// ════════════════════════════════════════════════════════════════════

window.precargaDatosSimulados = function() {
  if(localStorage.getItem('sgrt_precarga_completada')) return;
  
  const terceros = [
    {nit:'901739299', nombre:'UT PROCESO LOGÍSTICO', supervisor:'Liliana Gutierrez', criticidad:5, tipologiasAprobadas:true},
    {nit:'901226600', nombre:'WISS CONSULTORÍA JURÍDICA', supervisor:'Diego Mauricio Cifuentes', criticidad:4, tipologiasAprobadas:true},
    {nit:'901046359', nombre:'VENCE SALAMANCA LAWYERS', supervisor:'OSCAR CARDENAS MORA', criticidad:4, tipologiasAprobadas:true},
    {nit:'830016840', nombre:'CROMASOFT S.A.S', supervisor:'Jaime Adelmo Garzon', criticidad:5, tipologiasAprobadas:false},
    {nit:'830026811', nombre:'XOREX DE COLOMBIA', supervisor:'Alexander Ramirez', criticidad:5, tipologiasAprobadas:false}
  ];
  
  try {
    localStorage.setItem('sgrt_terceros_demo', JSON.stringify(terceros));
    localStorage.setItem('sgrt_precarga_completada', 'true');
  } catch(e) {
    console.warn('No se pudo guardar precarga:', e);
  }
}

// ════════════════════════════════════════════════════════════════════
// FUNCIONES DE SINCRONIZACIÓN
// ════════════════════════════════════════════════════════════════════

window.sincronizarDatos = function() {
  try {
    const tercerosStr = localStorage.getItem('sgrt_terceros_demo');
    if(tercerosStr) {
      const terceros = JSON.parse(tercerosStr);
      const aprobados = terceros.filter(t => t.tipologiasAprobadas);
      localStorage.setItem('sgrt_terceros_aprobados', JSON.stringify(aprobados));
    }
  } catch(e) { console.warn('Sincronización error:', e); }
}



// ════════════════════════════════════════════════════════════════════════
// CONTROL DE ACCESO MEJORADO POR ROL - ESPECÍFICO PARA SGRT
// ════════════════════════════════════════════════════════════════════════

window.ocultarElementosEvaluador = function() {
  const rolActual = localStorage.getItem('ROLE_ACTUAL') || '';
  
  if(rolActual.toLowerCase() === 'evaluador') {
    console.log('🔒 EVALUADOR: Ocultando elementos administrativos...');
    
    // 1. OCULTAR PREGUNTAS DE CLASIFICACIÓN/TIPOLOGÍA
    const selectoresOcultar = [
      '[id*="pregunta"]',           // Cualquier elemento con "pregunta"
      '[id*="clasificacion"]',      // Cualquier clasificación
      '[id*="tipologia"]',          // Cualquier tipología
      '[id*="calificar"]',          // Calificación
      '[id*="aprobar"]',            // Aprobación
      '[class*="pregunta-"]',       // Clases con pregunta
      '.preguntas-clasificacion',   // Clase específica
      '#cuestionario-ac',           // Cuestionario AC (clasificación)
      '[name*="clasificacion"]',    // Inputs de clasificación
      '.btn-editar',                // Botones editar
      '.btn-quitar',                // Botones quitar
      '[onclick*="editar"]',        // OnClick editar
      '[onclick*="quitar"]',        // OnClick quitar
      '.editar-btn',                // Clase editar
      '.quitar-btn'                 // Clase quitar
    ];
    
    selectoresOcultar.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(elem => {
          if(elem && !elem.classList.contains('evaluador-visible')) {
            elem.style.display = 'none !important';
            elem.style.visibility = 'hidden';
          }
        });
      } catch(e) {
        // Selector inválido, ignorar
      }
    });
    
    // 2. OCULTAR COLUMNAS DE ACCIONES EN TABLAS
    const tablas = document.querySelectorAll('table, [role="table"]');
    tablas.forEach(tabla => {
      // Buscar columnas de acciones
      const encabezados = tabla.querySelectorAll('th');
      encabezados.forEach((encabezado, idx) => {
        if(encabezado.textContent.toUpperCase().includes('ACCIONES') || 
           encabezado.textContent.toUpperCase().includes('EDITAR') ||
           encabezado.textContent.toUpperCase().includes('ACCIÓN')) {
          // Ocultar columna completa
          const celdas = tabla.querySelectorAll(`td:nth-child(${idx + 1})`);
          celdas.forEach(celda => {
            celda.style.display = 'none';
          });
          encabezado.style.display = 'none';
        }
      });
    });
    
    // 3. OCULTAR BOTONES DE EDICIÓN
    const botonesEditar = document.querySelectorAll('[class*="editar"], [id*="editar"], [title*="editar"], [aria-label*="editar"]');
    botonesEditar.forEach(btn => {
      if(!btn.classList.contains('evaluador-visible')) {
        btn.style.display = 'none !important';
      }
    });
    
    // 4. OCULTAR PANELES ADMINISTRATIVOS
    const panelAdmin = document.querySelectorAll('[id*="admin"], [class*="admin-panel"], [class*="clasificacion-panel"]');
    panelAdmin.forEach(panel => {
      if(!panel.classList.contains('evaluador-visible')) {
        panel.style.display = 'none';
      }
    });
    
    console.log('✓ Elementos administrativos ocultados correctamente');
  }
};

// Ejecutar al cargar y cada vez que cambie el rol
window.addEventListener('load', function() {
  window.ocultarElementosEvaluador();
  
  // Observar cambios en localStorage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.call(localStorage, key, value);
    if(key === 'ROLE_ACTUAL') {
      setTimeout(() => window.ocultarElementosEvaluador(), 100);
    }
  };
});

// También ejecutar inmediatamente
window.ocultarElementosEvaluador();


// Ejecutar al cargar
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.aplicarControlAccesoPorRol();
  });
} else {
  window.aplicarControlAccesoPorRol();
}
;

window.alimentarReportesConDatos = function() {
  try {
    const terceros = JSON.parse(localStorage.getItem('sgrt_terceros_demo') || '[]');
    const resumen = {
      totalTerceros: terceros.length,
      aprobados: terceros.filter(t => t.tipologiasAprobadas).length,
      pendientes: terceros.filter(t => !t.tipologiasAprobadas).length,
      riesgos: 12
    };
    localStorage.setItem('sgrt_resumen_reportes', JSON.stringify(resumen));
  } catch(e) { console.warn('Reportes error:', e); }
};
;


document.addEventListener('DOMContentLoaded', function(){
    window.precargaDatosSimulados(); // PRECARGA DE DATOS
    window.sincronizarDatos();
    window.alimentarReportesConDatos();
    // Init cls panels
    var pf=document.getElementById('cls-panel-form');
    var pd=document.getElementById('cls-panel-dash');
    if(pf) pf.style.display='';
    if(pd) pd.style.display='none';

    // Inject ac-campos-extra container before the cuestionario question list
    var qList=document.getElementById('q-lista-preguntas')||document.getElementById('q-panel-cuest');
    if(qList && !document.getElementById('ac-campos-extra')){
      var div=document.createElement('div');
      div.id='ac-campos-extra';
      div.style.cssText='display:none;background:white;border:1px solid var(--border);border-radius:var(--r2);padding:16px 18px;margin-bottom:14px;';
      qList.parentNode.insertBefore(div, qList);
    }

    // Init years and KPIs after a short delay (let defer script run first)
    setTimeout(function(){
      window.dashInitYears();
      window.dashUpdateKPIs();
      window.cargarTercerosDesdeAPI();
      window.actualizarTextoBotonResultados();
      window.actualizarDesplegableContratos();
    }, 600);
  });

  // Re-init dash on navigation
  document.addEventListener('click', function(e){
    var nav=e.target.closest('[onclick*="pg-dashboard"]');
    if(nav) setTimeout(function(){window.dashInitYears();window.dashUpdateKPIs();},150);
  });

  /* ── Fijar entidad en formulario de Clasificación ──────────── */
  var ENTIDAD_LABELS = {
    colpensiones: '🏛 Colpensiones',
    ecopetrol:    '🛢 Ecopetrol',
    bancolombia:  '🏦 Bancolombia'
  };
  window.fijarEntidadClasificacion = function(){
    // ⭐ ELIMINAR DUPLICADOS AL CARGAR CLASIFICACIÓN
    if(typeof window._limpiarDuplicados==='function') window._limpiarDuplicados();
    
    var cu = typeof currentUser!=='undefined' ? currentUser : null;
    var ent = (cu && cu.entidad) ? cu.entidad.toLowerCase().replace(/\s+/g,'') : 'colpensiones';
    if(!ent) ent = 'colpensiones'; // siempre Colpensiones por defecto
    var sel = document.getElementById('cf-entidad');
    if(!sel) return;
    sel.value    = ent;
    sel.disabled = true;
    sel.style.cssText = 'background:#F0F7FF;border:1.5px solid #93C5FD;color:var(--navy);font-weight:700;pointer-events:none;cursor:default;';
    Array.from(sel.options).forEach(function(o){ o.selected = (o.value===ent); });
  };

  /* ── PRE-REGISTRO (Paso 1 antes de Clasificación) ──────────── */
  var _AB2 = typeof API_BASE!=='undefined' ? API_BASE : 'http://localhost:3000';

  window.togglePreRegistro = function(){
    var b = document.getElementById('pre-registro-body');
    var c = document.getElementById('pre-reg-chevron');
    if(!b) return;
    var open = b.style.display !== 'none';
    b.style.display = open ? 'none' : '';
    if(c) c.textContent = open ? '▶' : '▼';
  };

  function _preListItem(texto, onUsar){
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:white;border:1px solid var(--border);border-radius:5px;margin-bottom:4px;font-size:11.5px;';
    var s = document.createElement('span');
    s.textContent = texto;
    s.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    var btn = document.createElement('button');
    btn.textContent = 'Usar ↗';
    btn.style.cssText = 'flex-shrink:0;margin-left:6px;padding:2px 7px;background:#EFF6FF;border:1px solid #93C5FD;border-radius:4px;font-size:10.5px;cursor:pointer;color:var(--navy);font-weight:600;';
    btn.onclick = onUsar;
    d.appendChild(s); d.appendChild(btn);
    return d;
  }

  // ── Registrar Tercero ──
  window.preRegistrarTercero = function(){
    var nom = (document.getElementById('pre-terc-nombre')||{}).value||'';
    var nit = (document.getElementById('pre-terc-nit')||{}).value||'';
    var svc = ''; // El servicio contratado ahora solo se pide en la segunda parte (Datos del Tercero)
    if(!nom){ showToast('Escribe el nombre del tercero','error',2000); return; }

    // Guardar en API (silencioso si falla)
    fetch(_AB2+'/api/funcionarios', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({Nombre:nom, Correo:'', Telefono:''})
    }).catch(function(){});

    // Agregar a TERCEROS_DB para que aparezca en lupa
    if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
    var key = nit || nom;
    TERCEROS_DB[key] = TERCEROS_DB[key] || {};
    Object.assign(TERCEROS_DB[key], { nit:nit||key, nombre:nom, servicio:svc,
      entidad: _igCurrentEntity(), prom:0, zona:'', yr: new Date().getFullYear().toString() });

    // Mostrar en lista - DESHABILITADO: los datos solo aparecen en la lupa
    // var lista = document.getElementById('pre-terc-lista');
    // if(lista) lista.insertBefore(_preListItem(nom + (nit?' ('+nit+')':''), function(){
    //   var n=document.getElementById('cf-nombre'); if(n) n.value=nom;
    //   var ni=document.getElementById('cf-nit'); if(ni) ni.value=nit;
    //   showToast('Datos copiados al formulario','success',1500);
    // }), lista.firstChild);

    // Limpiar
    ['pre-terc-nombre','pre-terc-nit'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    showToast('✅ Tercero "'+nom+'" registrado en lupa 🔍','success',3000);
    // Persistir y refrescar IG
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{
      var _tb=document.getElementById('ig-tbody-terceros');
      if(_tb) window.loadIGTercerosFull && window.loadIGTercerosFull();
    }catch(e){}
  };

  // ── Registrar Supervisor ──
  window.preRegistrarSupervisor = function(){
    var nom    = (document.getElementById('pre-sup-nombre')||{}).value||'';
    var cargo  = (document.getElementById('pre-sup-cargo')||{}).value||'';
    var correo = (document.getElementById('pre-sup-correo')||{}).value||'';
    if(!nom){ showToast('Escribe el nombre del supervisor','error',2000); return; }

    // Guardar en API
    fetch(_AB2+'/api/funcionarios', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({Nombre:nom, Correo:correo, Telefono:''})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.ok) showToast('✅ Supervisor guardado en BD','success',2000);
    }).catch(function(){ showToast('✅ Supervisor registrado localmente','success',2000); });

    // Agregar a lista local para lupa
    if(typeof window._supervisoresList==='undefined') window._supervisoresList=[];
    window._supervisoresList.push({ nombre:nom, cargo:cargo, correo:correo });

    // Mostrar en lista - DESHABILITADO: los datos solo aparecen en la lupa
    // var lista = document.getElementById('pre-sup-lista');
    // if(lista) lista.insertBefore(_preListItem(nom + (cargo?' — '+cargo:''), function(){
    //   var s=document.getElementById('cf-supervisor'); if(s) s.value=nom;
    //   var c=document.getElementById('cf-cargo'); if(c) c.value=cargo;
    //   showToast('Supervisor copiado al formulario','success',1500);
    // }), lista.firstChild);

    ['pre-sup-nombre','pre-sup-cargo','pre-sup-correo'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    showToast('✅ Supervisor "'+nom+'" registrado en lupa 🔍','success',3000);
  };

  window.preRegistrarProceso = function(){
    var nom  = (document.getElementById('pre-proc-nombre')||{}).value||'';
    var desc = (document.getElementById('pre-proc-desc')||{}).value||'';
    if(!nom){ showToast('Escribe el código y nombre del proceso','error',2000); return; }

    fetch(_AB2+'/api/procesos', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({Nombre:nom, Tipo:'Apoyo', Descripcion:desc, Objetivo:''})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.ok) showToast('✅ Proceso guardado en BD','success',2000);
    }).catch(function(){ showToast('✅ Proceso registrado localmente','success',2000); });

    if(typeof window._procesosList==='undefined') window._procesosList=[];
    window._procesosList.push({ nombre:nom, desc:desc });

    // Mostrar en lista - DESHABILITADO: los datos solo aparecen en la lupa
    // var lista = document.getElementById('pre-proc-lista');
    // if(lista) lista.insertBefore(_preListItem(nom, function(){
    //   var p=document.getElementById('cf-proceso-supervision'); if(p) p.value=nom;
    //   showToast('Proceso copiado al formulario','success',1500);
    // }), lista.firstChild);

    ['pre-proc-nombre','pre-proc-desc'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    showToast('✅ Proceso "'+nom+'" registrado en lupa 🔍','success',3000);
  };

})(); // end IIFE
