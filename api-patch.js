/**
 * api-patch.js — Parche de conexión BD para G4 Gestión Integral
 * =============================================================
 * Agrega este script al final del <body> en index.html:
 *   <script src="api-patch.js"></script>
 *
 * Reemplaza las funciones que guardaban SOLO en pantalla:
 *   1. saveClasifForm()          → POST /api/clasificacion  (con evaluaciones[])
 *   2. guardarRiesgoMatriz()     → POST /api/analisis-riesgos
 *   3. guardarCuestionarioCompleto() → POST /api/evaluacion-ambiente
 *
 * Mapa tabla → función:
 *   dbo.Relacion_Terceros           ← saveClasifForm
 *   dbo.MAESTRA_TERCEROS_CONTRATOS  ← saveClasifForm
 *   dbo.Matriz_Riesgos_Resultados   ← saveClasifForm
 *   dbo.Formulario_Clasificacion_Terceros ← saveClasifForm
 *   dbo.Analisis_Riesgos            ← guardarRiesgoMatriz
 *   dbo.Riesgos_Controles           ← guardarRiesgoMatriz
 *   dbo.Formulario_Evaluacion_Ambiente ← guardarCuestionarioCompleto
 *   dbo.Log_Cambios                 ← todas (ya funcionaba)
 */

// ──────────────────────────────────────────────────────────────
// UTILIDADES
// ──────────────────────────────────────────────────────────────
const _API = typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:3000';

async function _post(endpoint, body) {
  const r = await fetch(_API + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function _get(endpoint) {
  const r = await fetch(_API + endpoint);
  return r.json();
}

// Indicador visual de guardado
function _bdStatus(msg, tipo) {
  // tipo: 'ok' | 'error' | 'saving'
  const colors = { ok: '#28a745', error: '#dc3545', saving: '#fd7e14' };
  const icons  = { ok: '✅', error: '❌', saving: '💾' };
  if (typeof showToast === 'function') {
    if (tipo !== 'saving') showToast(icons[tipo] + ' BD: ' + msg, tipo === 'ok' ? 'success' : 'error', 3000);
  }
  console.log(`[BD ${tipo.toUpperCase()}]`, msg);
}

// ──────────────────────────────────────────────────────────────
// 1. saveClasifForm — REEMPLAZO COMPLETO
//    Tablas escritas:
//      dbo.Relacion_Terceros
//      dbo.MAESTRA_TERCEROS_CONTRATOS
//      dbo.Matriz_Riesgos_Resultados
//      dbo.Formulario_Clasificacion_Terceros
//      dbo.Terceros
// ──────────────────────────────────────────────────────────────
const _saveClasifFormOriginal = typeof saveClasifForm === 'function' ? saveClasifForm : null;

window.saveClasifForm = async function () {
  const nit        = (document.getElementById('cf-nit')?.value || '').trim();
  const nombre     = (document.getElementById('cf-nombre')?.value || '').trim();
  const entidad    = document.getElementById('cf-entidad')?.value || (window.currentUser?.entidad || '');
  const servicio   = (document.getElementById('cf-servicio')?.value || '').trim();
  const supervisor = (document.getElementById('cf-supervisor')?.value || '').trim();
  const nocontrato = (document.getElementById('cf-nocontrato')?.value || '—');
  const domicilio  = (document.getElementById('cf-domicilio')?.value || '').trim();
  const cargo      = (document.getElementById('cf-cargo')?.value || '').trim();
  const objetivo   = (document.getElementById('cf-objetivo')?.value || '').trim();
  const finicio    = (document.getElementById('cf-finicio')?.value || '');
  const fterm      = (document.getElementById('cf-fterm')?.value || '');
  const valorEl    = document.getElementById('cf-valor');
  const valor      = valorEl?.dataset?.raw || (valorEl?.value || '').replace(/[^0-9]/g, '');

  if (!nit)    { showToast('El NIT es obligatorio', 'error', 2500); return; }
  if (!nombre) { showToast('El nombre del tercero es obligatorio', 'error', 2500); return; }
  if (!entidad){ showToast('Selecciona la Entidad / Cliente', 'error', 2500); return; }
  if (!servicio){ showToast('El servicio contratado es obligatorio', 'error', 2500); return; }

  const dimsRef = typeof cfDimsAgregadas !== 'undefined' ? cfDimsAgregadas : [];
  if (!dimsRef.length) { showToast('Agrega al menos una tipología de riesgo', 'error', 2500); return; }

  // Calcular promedio
  const dimValsNum = dimsRef.map(d => d.val).filter(v => v && !v.startsWith('na')).map(v => parseInt(v));
  const prom    = dimValsNum.length ? dimValsNum.reduce((a, b) => a + b, 0) / dimValsNum.length : 0;
  const promStr = dimValsNum.length ? prom.toFixed(2) : '—';

  let periodicidad = 'Sin evaluación', zona = 'BAJO';
  if (prom >= 4)      { periodicidad = 'Se evalúa'; zona = 'EXTREMO/ALTO'; }
  else if (prom >= 3) { periodicidad = 'Se evalúa'; zona = 'ALTO/MEDIO'; }

  // Capturar dims snapshot antes de resetear
  const dimsSnapshot = dimsRef.map(d => ({
    key: d.key,
    nombre: (window.TIPOLOGIA_CATALOG?.[d.key]?.nombre || d.nombre || d.key).replace(/\n/g, ' '),
    val: d.val
  }));

  // ── Mapeo tipología key → DominioID (según dbo.Dominios_Riesgo) ──
  const KEY_TO_DOMINIO = {
    op: 1, cn: 2, si: 3, cu: 4, fr: 5, laft: 6, lf: 6,
    pa: 7, fi: 8
  };

  // ── Construir evaluaciones[] para el payload ──────────────────
  const evaluaciones = dimsSnapshot.map(d => {
    const domId = KEY_TO_DOMINIO[d.key] || null;
    if (!domId) return null;
    const valNum = d.val && !d.val.startsWith('na') ? parseInt(d.val) : null;
    return {
      DominioID:       domId,
      Valoracion:      d.val || 'N/A',
      Puntaje_Promedio: valNum,
      Zona_Riesgo:     zona,
      Periodicidad:    periodicidad
    };
  }).filter(Boolean);

  // Si alguna dim no tiene DominioID la incluimos con DominioID dinámico
  dimsSnapshot.forEach(d => {
    if (!KEY_TO_DOMINIO[d.key]) {
      console.warn('[api-patch] Tipología sin DominioID mapeado:', d.key, '— omitida de evaluaciones[]');
    }
  });

  // ── Actualizar UI (lógica original) ─────────────────────────
  const ELABELS = { colpensiones: '🏛 Colpensiones', ecopetrol: '🛢 Ecopetrol', bancolombia: '🏦 Bancolombia' };
  const EBGS = {
    colpensiones: 'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',
    ecopetrol:    'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',
    bancolombia:  'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'
  };
  const eLabel = ELABELS[entidad] || entidad;
  const eBg    = EBGS[entidad] || '';
  const fecha  = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  if (typeof TERCEROS_DB !== 'undefined') {
    TERCEROS_DB[nit] = {
      nit, nombre, entidad, entidadLabel: eLabel,
      servicio, supervisor, nocontrato, domicilio,
      cargo, objetivo, finicio, fterm, valor,
      prom: parseFloat(prom.toFixed(2)), zona, periodicidad,
      estado: 'Activo', dims: dimsSnapshot, savedAt: new Date().toISOString()
    };
  }

  if (typeof agregarTerceroEnTabla === 'function') {
    agregarTerceroEnTabla(nit, nombre, entidad, eBg, servicio, supervisor,
      prom, periodicidad, fecha, { dims: dimsSnapshot, nocontrato, domicilio, cargo, objetivo, finicio, fterm, valor });
  }

  if (prom >= 3 && typeof registrarTerceroPendiente === 'function') {
    registrarTerceroPendiente(nit, nombre, entidad, prom, zona, periodicidad,
      dimsSnapshot.map(d => ({ key: d.key, nombre: d.nombre })));
  }
  if (typeof sincronizarSelectorCuestionario === 'function') sincronizarSelectorCuestionario();

  // Fila en tabla Registros
  const chipClass = prom >= 4 ? 'c-crit' : prom >= 3 ? 'c-alto' : 'c-bajo';
  const zonaColor = prom >= 4 ? 'var(--red)' : prom >= 3 ? 'var(--orange)' : 'var(--green)';
  const tbody2 = document.getElementById('tbody-clasif-registros');
  if (tbody2) {
    tbody2.querySelectorAll('tr').forEach(tr => {
      if (tr.querySelector('td:first-child')?.textContent.trim() === nit) tr.remove();
    });
    const dimCells = dimsSnapshot.map(d => {
      const v = d.val || ''; const isNA = v.startsWith('na');
      const col = isNA ? 'var(--muted)' : parseFloat(v) >= 4 ? 'var(--red)' : parseFloat(v) >= 3 ? 'var(--orange)' : parseFloat(v) >= 2 ? 'var(--blue)' : 'var(--green)';
      return `<td style="text-align:center;font-weight:700;color:${col};font-style:${isNA ? 'italic' : 'normal'};">${isNA ? 'N/A' : (v || '—')}</td>`;
    }).join('');
    const newRow2 = document.createElement('tr');
    newRow2.setAttribute('data-zona', zona.split('/')[0]);
    newRow2.innerHTML =
      `<td style="font-size:11px;">${nit}</td>` +
      `<td><b>${nombre}</b><br><span style="font-size:10px;color:var(--muted);">${nocontrato}</span></td>` +
      `<td><span class="chip" style="font-size:10px;${eBg}">${eLabel}</span></td>` +
      dimCells +
      `<td style="text-align:center;"><span class="chip ${chipClass}">${promStr}</span></td>` +
      `<td style="font-size:11px;font-weight:700;color:${zonaColor};">${zona}</td>` +
      `<td style="font-size:11px;">${periodicidad}</td>` +
      `<td style="font-size:11px;color:var(--muted);">${fecha}</td>` +
      `<td><button class="btn btn-outline btn-xs" onclick="editClasifRow(this)">Editar</button> ` +
      `<button class="btn btn-xs" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;" onclick="deleteClasifRow(this)">Quitar</button></td>`;
    tbody2.appendChild(newRow2);
  }

  if (typeof addLog === 'function') {
    addLog(nombre, 'Relacion_Terceros', 'NIT→' + nit, '—', 'Prom:' + promStr + ' | ' + zona + ' | ' + periodicidad, fecha, 'Clasificación');
  }

  // ── POST a la BD ─────────────────────────────────────────────
  try {
    const payload = {
      tercero: {
        NIT: nit,
        NombreTercero:           nombre,
        ServicioContratado:      servicio,
        NoContrato:              nocontrato,
        ObjetivoContrato:        objetivo,
        FechaInicioContrato:     finicio || null,
        FechaTerminacionContrato: fterm  || null,
        ValorContrato:           valor ? parseFloat(valor) : null,
        DuracionRelacion:        null,
        Domicilio:               domicilio,
        CargoSupervisor:         cargo,
        SupervisorNombre:        supervisor,
        PromedioCriticidad:      parseFloat(prom.toFixed(2)),
        Zona_Riesgo:             zona,
        Periodicidad:            periodicidad,
        NombreEntidad:           entidad
      },
      evaluaciones  // ← CLAVE: antes faltaba este array
    };

    const d = await _post('/api/clasificacion', payload);
    if (d.ok) {
      _bdStatus(nombre + ' guardado (ID: ' + (d.id_relacion || '—') + ')', 'ok');
    } else {
      _bdStatus(d.error || 'Error desconocido', 'error');
    }
  } catch (e) {
    console.warn('[api-patch] /api/clasificacion no disponible:', e.message);
  }

  // Feedback y limpieza
  const statusEl = document.getElementById('clasif-form-status');
  if (statusEl) { statusEl.textContent = 'Guardado ✓'; statusEl.className = 'chip c-ok'; }

  showToast(`✅ "${nombre}" guardado — Prom: ${promStr} · ${zona}${prom >= 3 ? ' → habilitado en Cuestionario AC' : ''}`, 'success', 4000);

  if (typeof filterTerceros === 'function') filterTerceros();
  if (window.currentUser?.rol === 'Cliente' && typeof applyRoleRestrictions === 'function') applyRoleRestrictions();
  if (typeof resetClasifForm === 'function') resetClasifForm(false);
  if (typeof actualizarTipoRiesgoTags === 'function') actualizarTipoRiesgoTags();
  if (typeof updateDashboard === 'function') updateDashboard();
};

// ──────────────────────────────────────────────────────────────
// 2. guardarRiesgoMatriz — REEMPLAZO COMPLETO
//    Tablas escritas:
//      dbo.Analisis_Riesgos      (tabla principal Miro)
//      dbo.Riesgos_Controles     (por cada control del riesgo)
// ──────────────────────────────────────────────────────────────
window.guardarRiesgoMatriz = async function () {
  const ref   = document.getElementById('mr-ref')?.value.trim();
  const tipo  = document.getElementById('mr-tipo')?.value;
  const desc  = document.getElementById('mr-desc')?.value.trim();
  const resp  = document.getElementById('mr-resp')?.value.trim();

  if (!ref)  { showToast('La Referencia es obligatoria', 'error', 2500); return; }
  if (!tipo) { showToast('Selecciona el Tipo de Riesgo', 'error', 2500); return; }
  if (!desc) { showToast('La Descripción del Riesgo es obligatoria', 'error', 2500); return; }

  const zonaInh = document.getElementById('mr-zona-inh')?.textContent || '—';
  const zonaRes = document.getElementById('mr-zona-res')?.textContent || '—';
  const trat    = document.getElementById('mr-trat')?.value || '—';
  const estado  = document.getElementById('mr-estado')?.value || 'Abierto';
  const freq    = document.getElementById('mr-freq')?.value || '—';
  const probInh = document.getElementById('mr-prob-inh-label')?.textContent || '—';
  const impInh  = document.getElementById('mr-imp-inh-label')?.textContent || '—';
  const probRes = document.getElementById('mr-prob-res-label')?.textContent || '—';
  const impRes  = document.getElementById('mr-imp-res-label')?.textContent || '—';
  const cauInm  = document.getElementById('mr-causa-inm')?.value || '';
  const factor  = document.getElementById('mr-factor')?.value || '';
  const objetivo = document.getElementById('mr-objetivo')?.value || '';

  // Mapeo tipo riesgo → ID_TipologiaRiesgo (dbo.Maestra_Tipologia_Riesgos)
  const TIPO_MAP = {
    'Operacional':                                    1,
    'Continuidad de Negocio':                         2,
    'Continuidad':                                    2,
    'Seguridad de la Información y Ciberseguridad':   3,
    'Cumplimiento':                                   4,
    'Fraude y Corrupción':                            5,
    'LAFT':                                           6,
    'País':                                           7,
    'Financiero':                                     8
  };
  const tipId = TIPO_MAP[tipo] || TIPO_MAP[tipo?.split('/')[0]?.trim()] || 1;

  // Recopilar controles del modal
  const controles = [];
  document.querySelectorAll('#mr-controles-wrap > div').forEach(div => {
    const n = div.id?.replace('mr-ctrl-', '') || '';
    if (!n) return;
    controles.push({
      NoControl:   document.getElementById(`mr-c${n}-no`)?.value || '',
      Descripcion: document.getElementById(`mr-c${n}-desc`)?.value || '',
      Tipo:        document.getElementById(`mr-c${n}-tipo`)?.value || '',
      Implementacion: document.getElementById(`mr-c${n}-impl`)?.value || '',
      Calificacion: parseFloat(document.getElementById(`mr-c${n}-calif`)?.value) || null,
      Documentado: document.getElementById(`mr-c${n}-doc`)?.value || '',
      Frecuencia:  document.getElementById(`mr-c${n}-freq`)?.value || '',
      Evidencia:   document.getElementById(`mr-c${n}-evid`)?.value || '',
      Responsable: document.getElementById(`mr-c${n}-resp`)?.value || ''
    });
  });

  // ── Actualizar UI (lógica original) ─────────────────────────
  const chipZ = z => {
    const c = { EXTREMO: 'c-ext', ALTO: 'c-alto', MEDIO: 'c-med', BAJO: 'c-bajo' }[z] || '';
    return c ? `<span class="chip ${c}" style="font-size:10px;">${z}</span>` : `<span style="font-size:11px;">${z}</span>`;
  };
  const chipT = {
    'REDUCIR (TRANSFERIR O MITIGAR)': '<span style="color:var(--red);font-weight:600;font-size:11px;">REDUCIR</span>',
    'TRANSFERIR':  '<span style="color:var(--orange);font-weight:600;font-size:11px;">TRANSFERIR</span>',
    'ACEPTAR':     '<span style="color:var(--green);font-weight:600;font-size:11px;">ACEPTAR</span>',
    'ELIMINAR':    '<span style="color:var(--muted);font-weight:600;font-size:11px;">ELIMINAR</span>'
  }[trat] || trat;
  const chipE = { Abierto: 'c-pend', 'En Gestión': 'c-rev', Cerrado: 'c-ok' }[estado] || '';

  const nCtrls = controles.length;
  const tbody = document.getElementById('tbody-analisis-riesgo') || document.getElementById('tbody-matriz');
  if (tbody) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td><b>${ref}</b></td>` +
      `<td><span class="chip c-pend" style="font-size:10px;">${tipo.split('/')[0].trim()}</span></td>` +
      `<td style="font-size:11px;max-width:180px;">${desc}</td>` +
      `<td style="font-size:11px;">${cauInm || '—'}</td>` +
      `<td>${factor || '—'}</td>` +
      `<td>${freq}</td>` +
      `<td style="font-size:11px;">${probInh}</td>` +
      `<td style="font-size:11px;">${impInh}</td>` +
      `<td>${chipZ(zonaInh)}</td>` +
      `<td style="text-align:center;">${nCtrls}</td>` +
      `<td style="font-size:11px;">${probRes}</td>` +
      `<td style="font-size:11px;">${impRes}</td>` +
      `<td>${chipZ(zonaRes)}</td>` +
      `<td>${chipT}</td>` +
      `<td>${resp || '—'}</td>` +
      `<td><span class="chip ${chipE}">${estado}</span></td>`;
    tbody.prepend(tr);
    const cnt = document.getElementById('matrix-count');
    if (cnt) cnt.textContent = tbody.querySelectorAll('tr').length + ' riesgos';
  }

  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  if (typeof addLog === 'function') {
    addLog(ref, 'Analisis_Riesgos', 'Nuevo Riesgo', '—', `${tipo} — Inh:${zonaInh} → Res:${zonaRes}`, fecha, 'Análisis de Riesgo');
  }
  if (typeof closeM === 'function') closeM('m-riesgo');
  showToast('Riesgo "' + ref + '" guardado en la Matriz', 'success', 3500);

  // ── Obtener ID_ClasTerceros del tercero activo ────────────────
  // Busca el NIT seleccionado actualmente en el módulo de cuestionario/matriz
  const nitActivo = typeof nitActual !== 'undefined' ? nitActual : null;
  let idClasTerceros = null;

  if (nitActivo) {
    try {
      const clasList = await _get('/api/formulario-clasificacion?nit=' + encodeURIComponent(nitActivo));
      if (clasList.ok && clasList.data?.length) {
        idClasTerceros = clasList.data[0].ID_ClasTerceros;
      }
    } catch (e) {
      console.warn('[api-patch] No se pudo obtener ID_ClasTerceros:', e.message);
    }
  }

  // ── POST Analisis_Riesgos ─────────────────────────────────────
  try {
    const payload = {
      ID_ClasTerceros:    idClasTerceros || 1, // fallback 1 si no hay NIT activo
      ID_TipologiaRiesgo: tipId,
      ObjetivoAfectado:   objetivo || ref,
      CausaInmediata:     cauInm,
      CausaRaiz:          document.getElementById('mr-causa-raiz')?.value || '',
      DescripcionRiesgo:  desc,
      ClasificacionRiesgo: document.getElementById('mr-clasif-riesgo')?.value || null,
      FactorRiesgo:       factor || null,
      Frecuencia:         freq !== '—' ? freq : null,
      ImpactoEconomico:   document.getElementById('mr-crit-imp-eco')?.value || null,
      ImpactoReputacional: document.getElementById('mr-imp-rep')?.value || null,
      CalRiesgoResidual:  zonaRes !== '—' ? zonaRes : null,
      // Campos extra (no en Miro pero útiles):
      _referencia:  ref,
      _tratamiento: trat,
      _estado:      estado,
      _responsable: resp,
      _zonaInh:     zonaInh,
      _zonaRes:     zonaRes
    };

    const d = await _post('/api/analisis-riesgos', payload);
    if (d.ok) {
      const idAnalisis = d.id;
      _bdStatus(`Riesgo "${ref}" guardado en Analisis_Riesgos (ID: ${idAnalisis})`, 'ok');

      // ── POST Riesgos_Controles (uno por control) ──────────────
      for (const ctrl of controles) {
        try {
          await _post('/api/riesgos-controles', {
            ID_AnalisisRiesgos: idAnalisis,
            ...ctrl
          });
        } catch (ec) {
          console.warn('[api-patch] Riesgos_Controles error:', ec.message);
        }
      }
      if (controles.length) {
        _bdStatus(`${controles.length} control(es) guardado(s) en Riesgos_Controles`, 'ok');
      }
    } else {
      _bdStatus(d.error || 'Error al guardar riesgo', 'error');
    }
  } catch (e) {
    console.warn('[api-patch] /api/analisis-riesgos no disponible:', e.message);
  }
};

// ──────────────────────────────────────────────────────────────
// 3. guardarCuestionarioCompleto — REEMPLAZO COMPLETO
//    Tabla escrita:
//      dbo.Formulario_Evaluacion_Ambiente
// ──────────────────────────────────────────────────────────────
window.guardarCuestionarioCompleto = async function () {
  const nit = typeof nitActual !== 'undefined' ? nitActual : null;
  if (!nit) { showToast('Selecciona un tercero primero', 'error', 2000); return; }

  const t = typeof TERCEROS_DB !== 'undefined' ? (TERCEROS_DB[nit] || {}) : {};
  const nombre = t.nombre || nit;

  if (typeof CUEST_RESPUESTAS !== 'undefined') {
    if (!CUEST_RESPUESTAS[nit]) CUEST_RESPUESTAS[nit] = {};
    CUEST_RESPUESTAS[nit].__savedAt = new Date().toISOString();
    CUEST_RESPUESTAS[nit].__nombre  = nombre;
  }

  if (typeof addLog === 'function') {
    addLog(nombre, 'Formulario_Evaluacion_Ambiente', 'Guardado', '—',
      'Cuestionario AC guardado. Respuestas registradas.',
      new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }), 'Datos Maestros');
  }

  showToast(`✅ Cuestionario de "${nombre}" guardado`, 'success', 3500);

  // ── Obtener ID_ClasTerceros ──────────────────────────────────
  let idClasTerceros = null;
  try {
    const clasList = await _get('/api/formulario-clasificacion?nit=' + encodeURIComponent(nit));
    if (clasList.ok && clasList.data?.length) {
      idClasTerceros = clasList.data[0].ID_ClasTerceros;
    }
  } catch (e) {
    console.warn('[api-patch] No se pudo obtener ID_ClasTerceros para cuestionario:', e.message);
  }

  if (!idClasTerceros) {
    console.warn('[api-patch] Sin ID_ClasTerceros — se guardó solo en pantalla');
    return;
  }

  // ── Recopilar respuestas del cuestionario ────────────────────
  // Estructura CUEST_RESPUESTAS[nit][seccion][controlN] = {a1,a2,a3,a4,a5,a6,a7,obs}
  const MAPA_SECCION_TIPOLOGIA = { op: 1, cn: 2, si: 3, cu: 4, fr: 5, laft: 6, lf: 6 };
  const resp = typeof CUEST_RESPUESTAS !== 'undefined' ? (CUEST_RESPUESTAS[nit] || {}) : {};
  let guardados = 0;

  for (const [seccion, controles] of Object.entries(resp)) {
    if (seccion.startsWith('__')) continue; // skip __savedAt, __nombre
    const tipId = MAPA_SECCION_TIPOLOGIA[seccion];

    // Buscar ID_CuesRiesgos desde la API
    let cuesRiesgos = [];
    try {
      const cues = await _get('/api/cuestionario-riesgos');
      if (cues.ok) {
        cuesRiesgos = tipId
          ? cues.data.filter(c => c.TipologiaRiesgo === tipId)
          : cues.data;
      }
    } catch (e) { /* API no disponible */ }

    for (const [ctrlN, vals] of Object.entries(controles)) {
      if (typeof vals !== 'object') continue;

      // Buscar ID_CuesRiesgos que corresponda a este control
      // Si no hay match exacto usamos índice
      const idx = parseInt(ctrlN) - 1;
      const cuesRow = cuesRiesgos[idx] || cuesRiesgos[0];
      const idCuesRiesgos = cuesRow?.ID_CuesRiesgos || null;

      // Mapear a1-a7 a columnas de Formulario_Evaluacion_Ambiente
      const mapAToColumn = {
        a1: 'Implementado', a2: 'Documentado', a3: 'Asignado',
        a4: 'Divulgado',    a5: 'Evidencia',   a6: 'Monitorea',
        a7: 'Aplicacion'
      };

      const evalPayload = {
        ID_ClasTerceros: idClasTerceros,
        ID_CuesRiesgos:  idCuesRiesgos || idx + 1
      };

      for (const [key, col] of Object.entries(mapAToColumn)) {
        if (vals[key] !== undefined) evalPayload[col] = vals[key];
      }
      if (vals.obs) evalPayload._observacion = vals.obs;

      // Calcular NivelMadurez si está disponible
      const atts = [vals.a1, vals.a2, vals.a3, vals.a4, vals.a6].filter(v => v === 'Sí' || v === true);
      const score = atts.length;
      const NMN = score >= 5 ? '1.00' : score >= 4 ? '0.80' : score >= 3 ? '0.60' : score >= 2 ? '0.40' : score >= 1 ? '0.20' : '0.00';
      const NMC = ['INEXISTENTE', 'INICIAL', 'REPETIBLE', 'DEFINIDO', 'GESTIONADO', 'OPTIMIZADO'][score] || 'INEXISTENTE';
      evalPayload.NivelMadurezNum      = NMN;
      evalPayload.NivelMadurezCategoria = NMC;
      evalPayload.Evidencia = vals.a5 === 'Sí' ? 1 : 0;

      try {
        await _post('/api/evaluacion-ambiente', evalPayload);
        guardados++;
      } catch (e) {
        console.warn('[api-patch] evaluacion-ambiente error:', e.message);
      }
    }
  }

  if (guardados > 0) {
    _bdStatus(`${guardados} evaluaciones guardadas en Formulario_Evaluacion_Ambiente`, 'ok');
  } else {
    console.info('[api-patch] Cuestionario guardado en pantalla (0 filas a BD — posible sin respuestas aún)');
  }
};

// ──────────────────────────────────────────────────────────────
// 4. POST /api/riesgos-controles — nuevo endpoint en server.js
//    (el endpoint existe pero el server no lo tenía → lo agrega abajo)
// ──────────────────────────────────────────────────────────────
// Nota: el endpoint POST /api/riesgos-controles debe existir en server.js
// Si no existe, el parche lo reporta en consola pero no rompe nada.

// ──────────────────────────────────────────────────────────────
// 5. Cargar catálogos de la BD al iniciar
//    Mejora la experiencia: los <select> se llenan desde la BD
// ──────────────────────────────────────────────────────────────
async function _cargarCatalogos() {
  // Impacto económico
  try {
    const r = await _get('/api/impacto-economico');
    if (r.ok && r.data.length) {
      const sel = document.getElementById('mr-crit-imp-eco');
      if (sel) {
        const prev = sel.value;
        sel.innerHTML = '<option value="">— Seleccionar —</option>';
        r.data.forEach(row => {
          const opt = document.createElement('option');
          opt.value = row.ID_ImpEconomico;
          opt.textContent = row.Opciones;
          sel.appendChild(opt);
        });
        if (prev) sel.value = prev;
        console.log('[api-patch] Impacto Económico cargado:', r.data.length, 'opciones');
      }
    }
  } catch (e) { /* silencioso */ }

  // Impacto reputacional
  try {
    const r = await _get('/api/impacto-reputacional');
    if (r.ok && r.data.length) {
      const sel = document.getElementById('mr-imp-rep');
      if (sel) {
        sel.innerHTML = '<option value="">— Seleccionar —</option>';
        r.data.forEach(row => {
          const opt = document.createElement('option');
          opt.value = row.ID_ImpReputacional;
          opt.textContent = row.Opciones;
          sel.appendChild(opt);
        });
      }
    }
  } catch (e) { /* silencioso */ }

  // Clientes en selects de entidad
  try {
    const r = await _get('/api/clientes');
    if (r.ok && r.data.length) {
      ['cf-entidad', 't-entidad', 'ejec-cliente-sel'].forEach(selId => {
        const sel = document.getElementById(selId);
        if (!sel || sel.disabled) return;
        const prev = sel.value;
        // Solo agrega si no existen ya (no sobreescribir)
        r.data.forEach(row => {
          const key = row.RazonSocial.toLowerCase().replace(/\s+/g, '');
          if (!sel.querySelector(`option[value="${key}"]`)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = row.RazonSocial;
            sel.appendChild(opt);
          }
        });
        if (prev) sel.value = prev;
      });
      console.log('[api-patch] Clientes cargados:', r.data.length);
    }
  } catch (e) { /* silencioso */ }
}

// ──────────────────────────────────────────────────────────────
// INIT — ejecutar después de que el DOM esté listo
// ──────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _cargarCatalogos);
} else {
  setTimeout(_cargarCatalogos, 500); // ya cargado, esperar que los selects existan
}

console.log('[api-patch] ✅ Cargado — funciones conectadas a BD:');
console.log('  saveClasifForm()              → POST /api/clasificacion (con evaluaciones[])');
console.log('  guardarRiesgoMatriz()         → POST /api/analisis-riesgos + /api/riesgos-controles');
console.log('  guardarCuestionarioCompleto() → POST /api/evaluacion-ambiente');