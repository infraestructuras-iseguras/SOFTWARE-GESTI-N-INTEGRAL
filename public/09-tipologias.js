
// ─── GUARDAR VALORACION TIPOLOGIAS (global) ───
window.guardarValoracionTipologias = function(){
  try{
  // Guarda SOLO las tipologias y valoracion — disponible para todos los roles
  var nit = ((document.getElementById('cf-nit')||{}).value||'').trim();
  // Si el NIT es el placeholder, usar el valor del pre-registro o generar uno temporal
  if(!nit || nit === '900.000.000-0') nit = '__temp__' + Date.now();
  // Asegurar que cfDimsAgregadas esté accesible
  var _dims = (typeof cfDimsAgregadas!=='undefined' ? cfDimsAgregadas : (window.cfDimsAgregadas||[]));
  // Permitir guardar sin tipologías — puede editarse después
  cfDimsAgregadas = _dims; window.cfDimsAgregadas = _dims;
  var prom  = ((document.getElementById('cf-prom')||{}).textContent||'').trim() || '—';
  var zona  = ((document.getElementById('cf-zona')||{}).textContent||'').trim() || '—';
  var freq  = ((document.getElementById('cf-freq')||{}).textContent||'').trim() || '—';
  var nombre= ((document.getElementById('cf-nombre')||{}).value||'').trim() || nit;
  
  // Guardar en TERCEROS_DB
  if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
  if(!TERCEROS_DB[nit]) TERCEROS_DB[nit] = { nit:nit, nombre:nombre };
  TERCEROS_DB[nit].nombre       = nombre;
  
  // ⭐ ARREGLO: Guardar tipologías INDEPENDIENTES por contrato
  var t = TERCEROS_DB[nit];
  // Buscar selector en CLASIFICACIÓN primero (cls-contrato-actual), luego REGISTRO (cf-contrato-actual)
  var contratoActual = (document.getElementById('cls-contrato-actual') || document.getElementById('cf-contrato-actual') || {}).value || '';
  
  if(contratoActual && contratoActual.trim().length > 0){
    // 🔴 CONTRATO ESPECÍFICO: Guardar en dimsPorContrato Y promPorContrato
    if(!t.dimsPorContrato) t.dimsPorContrato = {};
    if(!t.promPorContrato) t.promPorContrato = {};
    
    t.dimsPorContrato[contratoActual] = cfDimsAgregadas.map(function(d){ 
      return {key:d.key, nombre:d.nombre, val:d.val||''}; 
    });
    
    // ⭐ GUARDAR TAMBIÉN EL PROMEDIO Y ZONA POR CONTRATO (lo que faltaba)
    t.promPorContrato[contratoActual] = {
      prom: prom,
      zona: zona
    };
    
    console.log('✅ Tipologías guardadas para CONTRATO:', contratoActual, 'Cantidad:', cfDimsAgregadas.length);
    console.log('  ├─ Promedio:', prom);
    console.log('  └─ Zona:', zona);
  } else {
    // 📝 SIN CONTRATO: Guardar en dims general del tercero
    if(!t.dimsPorContrato) t.dimsPorContrato={}; t.dimsPorContrato[t.contratoEval] = cfDimsAgregadas.map(function(d){ 
      return {key:d.key, nombre:d.nombre, val:d.val||''}; 
    });
    console.log('✅ Tipologías guardadas para TERCERO:', nit, 'Cantidad:', cfDimsAgregadas.length);
  }
  
  TERCEROS_DB[nit].prom         = prom;
  TERCEROS_DB[nit].zona         = zona;
  TERCEROS_DB[nit].periodicidad = freq;
  TERCEROS_DB[nit].valoracionAt = new Date().toISOString();
  
  try{ var tipBadge=document.getElementById('cls-tip-prom-badge'); if(tipBadge&&prom!=='—') tipBadge.textContent=prom; }catch(e){}
  
  try{ addLog(nombre,'Clasificación_Riesgos','Valoración tipologías','—','Prom:'+prom+' · '+zona+' · '+cfDimsAgregadas.length+' tipologías',new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Clasificación'); }catch(e){}
  
  showToast('✅ Valoración guardada — Promedio: '+prom+' · '+zona, 'success', 3000);

  // ── Persistir en localStorage y sincronizar con Ambiente de Control ──
  var promNum = parseFloat(prom)||0;
  // Actualizar todos los campos del tercero en TERCEROS_DB
  var _entVal = '';
  try{ var _entSel=document.getElementById('cf-entidad'); _entVal=_entSel?(_entSel.options[_entSel.selectedIndex]?_entSel.options[_entSel.selectedIndex].value:''):'';}catch(e){}
  TERCEROS_DB[nit].entidad = TERCEROS_DB[nit].entidad || _entVal || 'colpensiones';
  TERCEROS_DB[nit].servicio    = TERCEROS_DB[nit].servicio    || (document.getElementById('cf-servicio')||{}).value||'';
  TERCEROS_DB[nit].supervisor  = TERCEROS_DB[nit].supervisor  || (document.getElementById('cf-supervisor')||{}).value||'';
  TERCEROS_DB[nit].nocontrato  = TERCEROS_DB[nit].nocontrato  || (document.getElementById('cf-nocontrato')||{}).value||'';
  TERCEROS_DB[nit].domicilio   = TERCEROS_DB[nit].domicilio   || (document.getElementById('cf-domicilio')||{}).value||'';
  
  // ⭐ GARANTIZAR GUARDADO EN localStorage INMEDIATAMENTE
  try{
    console.log('💾 Guardando en localStorage...');
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(TERCEROS_DB));
    console.log('✅ Guardado confirmado en localStorage');
    console.log('📊 dimsPorContrato:', TERCEROS_DB[nit].dimsPorContrato);
  }catch(e){
    console.error('❌ Error guardando en localStorage:', e);
  }
  
  // 🚀 SINCRONIZAR CON AZURE SQL
  if(typeof API_BASE !== 'undefined' && API_BASE){
    const terceroData = {
      nit: nit,
      nombre: nombre,
      clasificacion: JSON.stringify({
        dimsPorContrato: TERCEROS_DB[nit].dimsPorContrato,
        promPorContrato: TERCEROS_DB[nit].promPorContrato,
        prom: prom,
        zona: zona,
        periodicidad: freq
      }),
      promedioCalificacion: parseFloat(prom) || 0,
      zonaRiesgo: zona,
      nivelRiesgo: TERCEROS_DB[nit].nivelRiesgo || 'Medio',
      entidad: TERCEROS_DB[nit].entidad || '',
      supervisor: TERCEROS_DB[nit].supervisor || '',
      domicilio: TERCEROS_DB[nit].domicilio || ''
    };
    
    fetch(API_BASE + '/api/terceros', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(terceroData)
    })
    .then(r => r.json())
    .then(d => {
      if(d.ok){
        console.log('[SGRT] ✅ Clasificación sincronizada a Azure SQL:', nit);
      } else {
        console.warn('[SGRT] ⚠️ API respondió sin ok:', d);
      }
    })
    .catch(e => {
      console.warn('[SGRT] ⚠️ Sincronización a Azure SQL fallada (no crítico):', e.message);
    });
  }
  
  // El contrato del registro pasa a la lista de contratos del tercero (sin duplicar)
  try{ window._clsImportarContratoRegistro && window._clsImportarContratoRegistro(nit); }catch(eImp){}
  // Registrar como tercero pendiente para el cuestionario
  try{
    var dims4cuest = cfDimsAgregadas.map(function(d){return {key:d.key, nombre:d.nombre};});
    registrarTerceroPendiente(nit, nombre, TERCEROS_DB[nit].entidad, promNum, zona, freq, dims4cuest);
  }catch(e){}
  // Guardar en localStorage (clave sgrt_v8)
  try{ window._lsSave && window._lsSave(); }catch(e){}
  // También guardar en sgrt_terceros_db para cross-rol
  try{
    var savedDB=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    savedDB[nit]=TERCEROS_DB[nit];
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(savedDB));
  }catch(e){}
  // Refrescar selector del cuestionario AC
  try{ sincronizarSelectorCuestionario(); }catch(e){}
  // ── Crear entradas en MATRIZ_DB por cada tipología del tercero ──
  try{
    var _nit2=nit, _nombre2=nombre;
    var _dims2=cfDimsAgregadas||[];
    // Quitar entradas previas de este tercero — mutar el array en lugar de reasignar
    var _toRemove=MATRIZ_DB.filter(function(r){return r.tercero===_nombre2||r.nit===_nit2;});
    _toRemove.forEach(function(r){var idx=MATRIZ_DB.indexOf(r);if(idx>=0)MATRIZ_DB.splice(idx,1);});
    // Agregar una entrada por tipología
    _dims2.forEach(function(d,i){
      var valNum=parseInt(d.val)||0;
      var zona2=valNum>=4?'EXTREMO':valNum>=3?'ALTO':valNum>=2?'MODERADO':'BAJO';
      MATRIZ_DB.push({
        id:'R_'+_nit2+'_'+d.key+'_'+Date.now()+'_'+i,
        nit:_nit2, tercero:_nombre2,
        tipo:window._nombreTipologia(d),
        factor:'Por definir', clasif:'Por definir',
        desc:'Riesgo identificado en tipología '+d.nombre+' · Valoración: '+valNum,
        causa:'Por definir', vuln:'Por definir',
        probInh:'0.6', impInh:'0.8', zonaInh:zona2,
        control:'Por definir', tipoCtrl:'PREVENTIVO',
        probRes:'0.4', impRes:'0.6', zonaRes:zona2,
        tratamiento:'Por definir',
        plan:'Por definir', resp:(document.getElementById('cf-supervisor')||{}).value||'',
        fechaImpl:'', fechaSeg:'', descSeg:'', estado:'Pendiente'
      });
    });
    // Actualizar selector filtro de tercero en Análisis de Riesgos
    var mzSel=document.getElementById('mz-fil-tercero');
    if(mzSel&&!mzSel.querySelector('option[value="'+_nombre2+'"]')){
      var _opt=document.createElement('option'); _opt.value=_nombre2; _opt.textContent=_nombre2; mzSel.appendChild(_opt);
    }
    // Sincronizar window.MATRIZ_DB con el array local
    window.MATRIZ_DB = MATRIZ_DB;
  }catch(e){ console.warn('matriz:',e); }
  // Persistir y refrescar
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ calcMatrizPromedios && calcMatrizPromedios(); }catch(e){}
  try{ renderMatriz && renderMatriz(); }catch(e){}
  // ⭐ REFRESCAR TABLA DE APROBACIÓN
  try{ renderAprobarOp && renderAprobarOp(); }catch(e){}
  
  // Guardar en BD si hay NIT válido
  if(nit && nit !== '__temp__'){
    try{
      var KEY_TO_DOMINIO = {'op':1,'procesos':1,'cn':2,'continuidad':2,'si':3,'seguridad':3,'informacion':3,'rc':4,'cu':4,'regulatorio':4,'cumplimiento':4,'fc':5,'fr':5,'fraude':5,'laft':6,'lavado':6};
      var evaluaciones = cfDimsAgregadas.map(function(d){
        var keyLow=(d.key||'').toLowerCase();
        var domId=KEY_TO_DOMINIO[keyLow]||null;
        if(!domId){ for(var k in KEY_TO_DOMINIO){ if(keyLow.startsWith(k)){domId=KEY_TO_DOMINIO[k];break;} } }
        if(!domId) domId=1;
        var valStr=(d.val||'').toString(); var isNA=valStr.startsWith('na')||valStr==='N/A';
        return { DominioID:domId, Valoracion:isNA?'N/A':(parseInt(valStr)||null), Puntaje_Promedio:isNA?null:(parseFloat(valStr)||null), Zona_Riesgo:zona, Periodicidad:freq };
      }).filter(function(e){return e.DominioID;});
      var payload={
        tercero:{ NIT:nit, NombreTercero:nombre, ServicioContratado:(document.getElementById('cf-servicio')||{}).value||'', SupervisorNombre:(document.getElementById('cf-supervisor')||{}).value||'', Domicilio:(document.getElementById('cf-domicilio')||{}).value||'', NoContrato:(document.getElementById('cf-nocontrato')||{}).value||'', PromedioCriticidad:parseFloat(prom)||0, Zona_Riesgo:zona, Periodicidad:freq },
        evaluaciones:evaluaciones
      };
      fetch(API_BASE+'/api/clasificacion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.json();})
        .then(function(d){ if(d.ok){showToast('✅ Guardado en BD','success',2000);} else{console.error('BD error:', d.error);} })
        .catch(function(e){ console.error('Conexión BD:', e.message); });
    }catch(apiErr){ console.warn('API valoracion:',apiErr.message); }
  }
  
  // Mostrar banner wizard con siguiente paso
  try{ clsWizardTrasGuardar(nit, parseFloat(prom)||0, cfDimsAgregadas); }catch(e){}
  }catch(err){ console.error('guardarValoracion:',err); showToast('Error al guardar: '+err.message,'error',4000); }
}
