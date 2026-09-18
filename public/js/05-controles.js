
// ─── MODAL AGREGAR CONTROL ────────────────────────────
window.abrirModalAgregarControl = function(){
  var nit = window.nitActual || (document.getElementById('q-tercero')?document.getElementById('q-tercero').value:'') || '';
  if(!nit){
    // Try ac-tercero-instruc selector
    var acSel=document.getElementById('ac-tercero-instruc');
    if(acSel&&acSel.value) nit=acSel.value;
  }
  if(!nit){ try{showToast('Primero selecciona un tercero en el cuestionario','error',2500);}catch(e){} return; }
  window.nitActual=nit;
  var db = window.TERCEROS_DB||{};
  var t = db[nit];
  var sel = document.getElementById('ac-add-tip');
  if(sel){
    sel.innerHTML='<option value="">— Seleccionar tipología —</option>';
    var dims = (t&&t.dims)||[];
    dims.forEach(function(d){
      var nom = window._nombreTipologia(d);
      if(!nom) return;
      var o=document.createElement('option'); o.value=d.key; o.textContent=nom; sel.appendChild(o);
    });
    // Also add all CUESTIONARIO_CONTROLES keys as fallback
    if(!dims.length){
      Object.keys(window.CUESTIONARIO_CONTROLES||{}).forEach(function(k){
        var info=window.SECCIONES_INFO&&window.SECCIONES_INFO[k];
        var nom=info?info.label:k;
        var o=document.createElement('option'); o.value=k; o.textContent=nom; sel.appendChild(o);
      });
    }
  }
  // Prefill tip from current filter
  var filtro = document.getElementById('ac-tip-filtro');
  if(filtro&&filtro.value&&sel){
    var opt=sel.querySelector('option[value="'+filtro.getAttribute('data-key-last')+'"]');
    if(!opt) for(var i=0;i<sel.options.length;i++){ if(sel.options[i].textContent===filtro.value){sel.selectedIndex=i;break;} }
  }
  document.getElementById('ac-add-nombre').value='';
  document.getElementById('ac-add-req').value='';
  document.getElementById('ac-add-doc').value='';
  openM('m-agregar-control');
};

window.guardarControlPersonalizado = function(){
  var nit = window.nitActual||'';
  var tipKey = document.getElementById('ac-add-tip').value;
  var nombre = (document.getElementById('ac-add-nombre').value||'').trim();
  var req    = (document.getElementById('ac-add-req').value||'').trim();
  var doc    = (document.getElementById('ac-add-doc').value||'').trim();
  if(!nit||!tipKey||!nombre){
    try{showToast('Completa tipología y nombre del control','error',2500);}catch(e){} return;
  }
  if(!window.CUEST_CTRL_CUSTOM) window.CUEST_CTRL_CUSTOM={};
  if(!window.CUEST_CTRL_CUSTOM[nit]) window.CUEST_CTRL_CUSTOM[nit]={};
  if(!window.CUEST_CTRL_CUSTOM[nit][tipKey]) window.CUEST_CTRL_CUSTOM[nit][tipKey]=[];
  var baseN=(window.CUESTIONARIO_CONTROLES&&window.CUESTIONARIO_CONTROLES[tipKey]?window.CUESTIONARIO_CONTROLES[tipKey].length:0);
  var customN=window.CUEST_CTRL_CUSTOM[nit][tipKey].length;
  window.CUEST_CTRL_CUSTOM[nit][tipKey].push({
    n: baseN+customN+1,
    ctrl: nombre,
    req: req||nombre,
    doc: doc,
    esCustom:true
  });
  closeM('m-agregar-control');
  try{cargarCuestionarioTercero();}catch(e){}
  try{showToast('✅ Control "'+nombre+'" agregado a la tipología','success',2500);}catch(e){}
};
