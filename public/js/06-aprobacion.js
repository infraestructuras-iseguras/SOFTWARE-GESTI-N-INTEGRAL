
// ─── VER DETALLE Y AJUSTAR CALIFICACIÓN DESDE APROBAR ────
window.abrirDetalleTerceroAprobar = function(nit){
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var t=db[nit]; if(!t){try{showToast('Tercero no encontrado','error',2000);}catch(e){}return;}
  var prom=parseFloat(t.prom||0);
  var cr=(window.CUEST_RESPUESTAS||{})[nit]||{};
  var resp=Object.keys(cr).length;
  var tipHtml=(t.dims||[]).map(function(d){
    var nom=window._nombreTipologia(d);
    var n=(window.CUESTIONARIO_CONTROLES&&window.CUESTIONARIO_CONTROLES[d.key]?window.CUESTIONARIO_CONTROLES[d.key].length:0);
    var tieneVal=d.val!==''&&d.val!=null;
    var valNum=tieneVal?parseFloat(d.val):null;
    var valColor=!tieneVal?'#aaa':valNum>=4?'#dc3545':valNum>=3?'#fd7e14':valNum>=2?'#ffc107':'#28a745';
    var valLabel=!tieneVal?'Sin calificar':valNum>=5?'Cr\u00edtico':valNum>=4?'Alto':valNum>=3?'Medio':valNum>=2?'Bajo':'Muy bajo';
    var escalaHtml=[1,2,3,4,5].map(function(en){
      var active=tieneVal&&Math.round(valNum)===en;
      var bg=active?valColor:'#f0f0f0';
      var cl=active?'white':'#aaa';
      var bd=active?valColor:'#e0e0e0';
      return '<div style="width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;background:'+bg+';color:'+cl+';border:2px solid '+bd+';">'+en+'</div>';
    }).join('');
    return '<div style="padding:8px 12px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;margin-bottom:6px;">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
      +'<span style="flex:1;font-weight:700;font-size:12.5px;color:#1a3a5c;">'+nom+'</span>'
      +'<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;color:white;background:'+valColor+';">'+(tieneVal?valNum:'—')+' — '+valLabel+'</span>'
      +'</div>'
      +'<div style="display:flex;gap:4px;align-items:center;">'+escalaHtml+'<span style="font-size:10px;color:#aaa;margin-left:4px;">Escala 1–5</span></div>'
      +'</div>';
  }).join('');
  document.getElementById('m-det-terc-body').innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">'
    +'<div><div style="font-size:17px;font-weight:800;color:#1a3a5c;">'+(t.nombre||nit)+'</div>'
    +'<div style="font-size:11.5px;color:#6c757d;">NIT: '+nit+' · '+( t.servicio||'')+'</div></div>'
    +'<div style="text-align:right;"><div style="font-size:28px;font-weight:800;color:'+(prom>=4?'#dc3545':prom>=3?'#fd7e14':'#28a745')+';">'+prom.toFixed(2)+'</div>'
    +'<div style="font-size:10px;color:#6c757d;">'+(prom>=3?'✓ Califica para AC':'✗ No califica (prom < 3)')+'</div></div></div>'
    // ─── WIDGET: PROMEDIOS POR CONTRATO Y POR TERCERO ─────────────────
    +(function(){
      if(!t.contratos || t.contratos.length===0) return '';
      var html='<div style="background:linear-gradient(135deg,#f8fafc 0%,#ecf0f5 100%);border:1px solid #cbd5e1;border-radius:8px;padding:14px 16px;margin-bottom:16px;">';
      html+='<div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:12px;">📊 Promedios por Contrato</div>';
      html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px;border-bottom:1.5px solid #cbd5e1;padding-bottom:14px;">';
      
      // Mostrar promedio por contrato
      var tienePromediosContrato=false;
      t.contratos.forEach(function(c){
        var pxc=(t.promPorContrato||{})[c.num];
        if(pxc && pxc.prom !== null && pxc.prom !== undefined && pxc.prom !== ''){
          tienePromediosContrato=true;
          var pxcVal=parseFloat(pxc.prom);
          var pxcColor=pxcVal>=3?'#10b981':pxcVal>=2?'#f59e0b':'#ef4444';
          var pxcBg=pxcVal>=3?'#ecfdf5':pxcVal>=2?'#fffbeb':'#fef2f2';
          html+='<div style="background:white;border:2px solid '+pxcColor+';border-radius:6px;padding:10px 12px;text-align:center;">';
          html+='<div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:6px;">'+c.num+'</div>';
          html+='<div style="font-size:18px;font-weight:800;color:'+pxcColor+';">'+pxcVal.toFixed(1)+'</div>';
          html+='<div style="font-size:9px;color:#6c757d;margin-top:4px;">'+pxc.zona+'</div>';
          html+='</div>';
        }
      });
      
      if(!tienePromediosContrato){
        html+='<div style="grid-column:1/-1;text-align:center;color:#aaa;font-size:11px;padding:8px;">Sin evaluaciones por contrato</div>';
      }
      
      html+='</div>';
      html+='<div style="font-size:11px;font-weight:700;color:#0f172a;">📈 Promedio General del Tercero: <span style="color:'+(prom>=3?'#10b981':'#f59e0b')+';font-size:13px;">'+prom.toFixed(2)+'</span></div>';
      html+='</div>';
      return html;
    })()
    +'<div style="font-size:11px;font-weight:700;color:#1a3a5c;text-transform:uppercase;margin-bottom:8px;">Tipologías de riesgo</div>'
    +(tipHtml||'<div style="color:#aaa;font-size:12px;">Sin tipologías asignadas</div>');
  openM('m-det-terc-aprobar');
};

window.abrirAjusteCalif = function(nit, contratoNum){
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var t=db[nit]; if(!t){try{showToast('Tercero no encontrado','error',2000);}catch(e){}return;}
  // Determinar contexto: si el tercero está en modo por contrato,
  // permitir elegir el contrato en el modal (o usar el que llega por parámetro)
  var esModoContrato = t.modoEval==='contrato' && (t.contratos||[]).length>0;
  var contratoActivo = contratoNum || (esModoContrato ? (t.contratoEval || (t.contratos||[])[0].num) : '');
  // Elegir dims a mostrar: del contrato si aplica, o del tercero
  var dims;
  if(esModoContrato && contratoActivo){
    var dpc = (t.dimsPorContrato||{})[contratoActivo];
    // Si el contrato aún no tiene dims propias, partir de las globales (o vacío)
    dims = dpc || (t.dims||[]).map(function(d){return{key:d.key,nombre:d.nombre,val:''};});
  } else {
    dims = t.dims || [];
  }
  var dimRows=(dims||[]).map(function(d,i){
    var nom=window._nombreTipologia(d);
    var tieneVal=d.val!==''&&d.val!=null;
    return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f0f0f0;">'
      +'<span style="flex:1;font-size:12.5px;font-weight:600;">'+nom+'</span>'
      +'<select data-dimidx="'+i+'" style="padding:5px 10px;border:1px solid #dee2e6;border-radius:5px;font-size:12px;font-family:inherit;background:white;">'
      +(tieneVal?'':'<option value="" selected disabled>Sin calificar</option>')
      +'<option value="1"'+(tieneVal&&d.val==1?' selected':'')+'>1 — Muy bajo</option>'
      +'<option value="2"'+(tieneVal&&d.val==2?' selected':'')+'>2 — Bajo</option>'
      +'<option value="3"'+(tieneVal&&d.val==3?' selected':'')+'>3 — Medio</option>'
      +'<option value="4"'+(tieneVal&&d.val==4?' selected':'')+'>4 — Alto</option>'
      +'<option value="5"'+(tieneVal&&d.val==5?' selected':'')+'>5 — Crítico</option>'
      +'</select></div>';
  }).join('');
  if(!dimRows) dimRows='<div style="color:#aaa;font-size:12px;padding:12px 0;">Sin tipologías asignadas. Clasifica el tercero primero.</div>';
  // Cabecera con modo (por tercero / por contrato) y selector si aplica
  var cabecera = '<div style="font-size:14px;font-weight:800;color:#1a3a5c;margin-bottom:6px;">'+(t.nombre||nit)+'</div>';
  
  // ─── AGREGAR PROMEDIO POR CONTRATO SI APLICA ─────────────────────────
  var promContratoBadge = '';
  if(contratoActivo && t.promPorContrato && t.promPorContrato[contratoActivo]){
    var pxc = t.promPorContrato[contratoActivo];
    var pxcVal = parseFloat(pxc.prom);
    var pxcColor = pxcVal >= 3 ? '#10b981' : pxcVal >= 2 ? '#f59e0b' : '#ef4444';
    var pxcBg = pxcVal >= 3 ? '#ecfdf5' : pxcVal >= 2 ? '#fffbeb' : '#fef2f2';
    promContratoBadge = '<div style="background:'+pxcBg+';border:2px solid '+pxcColor+';border-radius:8px;padding:12px 16px;margin-bottom:12px;text-align:center;">'
      +'<div style="font-size:11px;font-weight:700;color:#475569;margin-bottom:4px;">📊 Promedio AC — Contrato '+contratoActivo+'</div>'
      +'<div style="font-size:32px;font-weight:900;color:'+pxcColor+';">'+pxcVal.toFixed(1)+'</div>'
      +'<div style="font-size:10px;color:#6c757d;margin-top:4px;">Zona: '+pxc.zona+'</div>'
      +'</div>';
  }
  
  if(esModoContrato){
    cabecera += '<div style="padding:8px 10px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;margin-bottom:12px;">'
      +'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
      +'<span style="font-size:10.5px;font-weight:800;color:#78350f;text-transform:uppercase;letter-spacing:.3px;">Calificando contrato:</span>'
      +'<select onchange="window.abrirAjusteCalif(\''+nit+'\',this.value)" style="flex:1;min-width:200px;padding:5px 10px;border:1px solid #fde68a;border-radius:5px;font-size:12px;font-family:inherit;background:white;">'
      +(t.contratos||[]).map(function(c){
        return '<option value="'+(c.num||'').replace(/"/g,'&quot;')+'"'+(c.num===contratoActivo?' selected':'')+'>'+(c.num||'s/n')+(c.objeto?' — '+c.objeto:'')+'</option>';
      }).join('')
      +'</select>'
      +'</div>'
      +'<div style="font-size:10.5px;color:#78350f;margin-top:4px;">Cada contrato del tercero tiene su propia calificación. Cambia el contrato en el selector para ajustar las de otro contrato.</div>'
      +'</div>'
      +promContratoBadge;
  } else {
    cabecera += '<div style="font-size:11px;color:#6c757d;margin-bottom:10px;">Ajusta la calificación (1–5) de cada tipología. Si ya hay una calificación guardada aparece preseleccionada; el nuevo promedio se recalcula automáticamente.</div>';
  }
  document.getElementById('m-ajuste-body').innerHTML = cabecera + dimRows;
  document.getElementById('m-ajuste-body').setAttribute('data-nit', nit);
  document.getElementById('m-ajuste-body').setAttribute('data-contrato', contratoActivo||'');
  openM('m-ajuste-calif');
};

window.guardarAjusteCalif = function(){
  var body=document.getElementById('m-ajuste-body');
  var nit=body.getAttribute('data-nit');
  var contratoActivo = body.getAttribute('data-contrato')||'';
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{};
  var t=db[nit]; if(!t)return;
  var esModoContrato = t.modoEval==='contrato' && contratoActivo;
  var sels=body.querySelectorAll('select[data-dimidx]');
  var vals=[];
  // Colección de dims que estamos editando (contrato o tercero)
  var dimsRef;
  if(esModoContrato){
    if(!t.dimsPorContrato) t.dimsPorContrato={};
    // Asegurar que exista la copia para este contrato
    if(!t.dimsPorContrato[contratoActivo]){
      t.dimsPorContrato[contratoActivo] = (t.dims||[]).map(function(d){return{key:d.key,nombre:d.nombre,val:''};});
    }
    dimsRef = t.dimsPorContrato[contratoActivo];
  } else {
    dimsRef = t.dims || [];
  }
  sels.forEach(function(s){
    var idx=parseInt(s.getAttribute('data-dimidx'));
    if(!s.value) return; // "Sin calificar"
    var v=parseInt(s.value)||1;
    if(dimsRef[idx]){ dimsRef[idx].val=v; vals.push(v); }
  });
  if(vals.length){
    var newProm=vals.reduce(function(a,b){return a+b;},0)/vals.length;
    var newZona = newProm>=4?'EXTREMO':newProm>=3?'ALTO':'BAJO';
    if(esModoContrato){
      if(!t.promPorContrato) t.promPorContrato={};
      t.promPorContrato[contratoActivo] = { prom: newProm.toFixed(2), zona: newZona };
      // Promedio "resumen" del tercero: promedio simple de los contratos con dato
      var promsCont = Object.values(t.promPorContrato).map(function(x){return parseFloat(x.prom);}).filter(function(v){return !isNaN(v);});
      if(promsCont.length){
        var pAgg = promsCont.reduce(function(a,b){return a+b;},0)/promsCont.length;
        t.prom = parseFloat(pAgg.toFixed(2));
        t.zona = t.prom>=4?'EXTREMO':t.prom>=3?'ALTO':'BAJO';
      }
    } else {
      t.prom=parseFloat(newProm.toFixed(2));
      t.zona = newZona;
    }
    // Persist en ambas capas de almacenamiento para que no se desincronice
    try{
      var saved=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      saved[nit]=t; localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(saved));
    }catch(e){}
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{sincronizarSelectorCuestionario();}catch(e){}
    // ⭐ SINCRONIZAR AMBIENTE DE CONTROL TAMBIÉN
    try{ acPoblarSelectorTerceroInstruc && acPoblarSelectorTerceroInstruc(); }catch(e){}
    // ⭐ ACTUALIZAR DASHBOARD AC
    try{ renderReportesAC && renderReportesAC(); }catch(e){}
  }
  closeM('m-ajuste-calif');
  setTimeout(renderAprobarOp, 80);
  // ⭐ SINCRONIZAR DE NUEVO después de renderizar
  setTimeout(function(){
    try{ acPoblarSelectorTerceroInstruc && acPoblarSelectorTerceroInstruc(); }catch(e){}
    try{ renderReportesAC && renderReportesAC(); }catch(e){}
  }, 150);
  try{showToast('Calificación actualizada · Prom: '+t.prom + ' · Reflejado en Ambiente de Control','success',2500);}catch(e){}
};

