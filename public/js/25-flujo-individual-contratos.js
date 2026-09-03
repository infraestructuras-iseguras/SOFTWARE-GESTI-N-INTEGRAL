/* SGRT V11 — flujo individual por contrato
 * Clasificación -> Aprobación -> Ambiente de Control -> Análisis/Dashboard.
 */
(function(){
  'use strict';

  // Conservar la pantalla completa original de Aprobación; este módulo solo
  // corrige sus datos y validaciones, no reemplaza sus demás funcionalidades.
  var renderAprobarOriginal=window.renderAprobarOp;

  function db(){ return window.TERCEROS_DB || (window.TERCEROS_DB={}); }
  function cp(v){ try{return JSON.parse(JSON.stringify(v));}catch(e){return v;} }
  function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function jsq(v){ return String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
  function toast(m,t,d){ try{ window.showToast(m,t==='warning'?'warn':(t||'success'),d||2600); }catch(e){} }
  function alertaClasif(m,t){
    var lista=document.getElementById('cf-dims-lista');if(!lista||!lista.parentNode)return;
    var el=document.getElementById('sgrt-clasif-alerta');
    if(!el){el=document.createElement('div');el.id='sgrt-clasif-alerta';lista.parentNode.insertBefore(el,lista);}
    var error=t==='error'||t==='warning';
    el.style.cssText='display:block;margin:0 0 10px;padding:10px 12px;border-radius:7px;font-size:12px;font-weight:700;line-height:1.45;border:1px solid '+(error?'#fdba74':'#86efac')+';background:'+(error?'#fff7ed':'#f0fdf4')+';color:'+(error?'#9a3412':'#166534')+';';
    el.textContent=m;
  }
  function persist(){
    try{ localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db())); }catch(e){}
    try{ window._lsSave && window._lsSave(); }catch(e){}
  }
  function contratoNum(c){ return String((c&&c.num)||'').trim(); }
  function contratos(t){
    try{ window._clsContratosBackfill && window._clsContratosBackfill(t); }catch(e){}
    return (t&&Array.isArray(t.contratos)?t.contratos:[]).filter(function(c){return contratoNum(c);});
  }
  function dimsContrato(t,num){
    var a=(t&&t.dimsPorContrato&&t.dimsPorContrato[num])||[];
    // Compatibilidad con valoraciones realizadas antes de V8: si el contrato
    // activo quedó guardado en dims general, recupéralo para no ocultarlo.
    if((!a||!a.length)&&t&&String(t.contratoEval||'')===String(num||'')&&Array.isArray(t.dims))a=t.dims;
    return Array.isArray(a)?a:[];
  }
  function valor(d){ var v=parseFloat(d&&d.val); return isNaN(v)?null:v; }
  function resumenDims(a){
    var vals=(a||[]).map(valor).filter(function(v){return v!==null;});
    var p=vals.length?vals.reduce(function(x,y){return x+y;},0)/vals.length:0;
    var z=p>=4?'EXTREMO':p>3?'ALTO':p>=2?'MODERADO':p>0?'BAJO':'—';
    return {prom:Math.round(p*100)/100,zona:z,completo:!!a.length&&vals.length===a.length};
  }
  function promContrato(t,num){
    var x=t&&t.promPorContrato&&t.promPorContrato[num];
    var p=parseFloat(x&&typeof x==='object'?x.prom:x);
    return isNaN(p)?resumenDims(dimsContrato(t,num)).prom:p;
  }
  function unionDims(t){
    var out=[],seen={};
    contratos(t).forEach(function(c){ dimsContrato(t,contratoNum(c)).forEach(function(d){
      var k=String(d.key||d.nombre||'').toLowerCase();
      if(!seen[k]){seen[k]=1;out.push(cp(d));}
    }); });
    return out.length?out:((t&&t.dims)||[]);
  }
  function recalcularTercero(t){
    if(!t) return;
    t.dimsPorContrato=t.dimsPorContrato||{}; t.promPorContrato=t.promPorContrato||{};
    var ps=[];
    contratos(t).forEach(function(c){
      var n=contratoNum(c),r=resumenDims(dimsContrato(t,n));
      t.promPorContrato[n]={prom:r.prom.toFixed(2),zona:r.zona};
      if(r.completo) ps.push(r.prom);
    });
    t.dims=unionDims(t);
    t.prom=ps.length?(ps.reduce(function(a,b){return a+b;},0)/ps.length).toFixed(2):'0.00';
  }
  function trabajo(){ return window.cfDimsAgregadas||[]; }
  function catalogoTipologias(){
    var out={};
    try{
      if(typeof TIPOLOGIA_CATALOG!=='undefined' && TIPOLOGIA_CATALOG){Object.keys(TIPOLOGIA_CATALOG).forEach(function(k){out[k]=TIPOLOGIA_CATALOG[k];});}
    }catch(e){}
    try{
      (window.getDBTips?window.getDBTips(window.getEntidad?window.getEntidad():''):[]).forEach(function(t){
        var k=t.clave||String(t.id_tipologia),base=out[k]||{};
        out[k]={nombre:t.nombre_tipologia||t.nombre||base.nombre||k,hasNA:t.hasNA!=null?!!t.hasNA:!!base.hasNA,hints:Object.keys(t.hints||{}).length?t.hints:(base.hints||{}),soloImpar:t.soloImpar!=null?!!t.soloImpar:!!base.soloImpar};
      });
    }catch(e){}
    return out;
  }
  function refrescarSelectorRiesgos(){
    var sel=document.getElementById('cf-tip-selector');if(!sel)return;
    var actual=sel.value,agregadas={};trabajo().forEach(function(d){agregadas[String(d.key)]=true;});
    var cat=catalogoTipologias(),keys=Object.keys(cat);
    // Fallback garantizado: el catálogo operativo siempre debe exponer las
    // seis tipologías base aunque una configuración de entidad esté vacía.
    if(!keys.length){
      cat={op:{nombre:'Riesgo Operacional'},cn:{nombre:'Continuidad de Negocio'},si:{nombre:'Seguridad de la Información y Ciberseguridad'},cu:{nombre:'Cumplimiento Regulatorio'},fr:{nombre:'Fraude y Corrupción'},laft:{nombre:'Lavado de Activos y Financiación del Terrorismo (LAFT)'}};
      keys=Object.keys(cat);
    }
    sel.innerHTML='<option value="">— Elegir tipología —</option>';
    keys.forEach(function(k){var o=document.createElement('option'),c=cat[k]||{};o.value=k;o.textContent=(agregadas[k]?'✓ ':'')+(c.nombre||k)+(agregadas[k]?' (quitar)':'');sel.appendChild(o);});
    if(keys.indexOf(actual)>=0)sel.value=actual;
    sel.disabled=false;
  }
  function ponerTrabajo(a){
    var w=trabajo(); w.length=0;
    (a||[]).forEach(function(d){w.push({id:'d_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),key:d.key,nombre:d.nombre,val:d.val!=null?String(d.val):'',hints:d.hints||null,hasNA:!!d.hasNA,soloImpar:!!d.soloImpar});});
    window.cfDimsAgregadas=w;
    try{ window.renderDimsAgregadas && window.renderDimsAgregadas(); }catch(e){}
    try{ window.calcCfProm && window.calcCfProm(); }catch(e){}
    try{ window.actualizarOpcionesSelectorTipologias && window.actualizarOpcionesSelectorTipologias(); }catch(e){}
    refrescarSelectorRiesgos();
  }
  function terceroActual(){
    var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
    return {nit:nit,t:db()[nit]};
  }
  function guardarActual(contratoForzado){
    var x=terceroActual(),t=x.t;if(!t)return;
    // Al cambiar el desplegable, su valor ya corresponde al contrato nuevo.
    // Se debe guardar primero el contrato que estaba activo, no el nuevo.
    var sel=document.getElementById('cls-contrato-actual'),num=contratoForzado||t.contratoEval||(sel&&sel.value)||'';
    if(!num)return;
    t.modoEval='contrato';t.contratoEval=num;t.dimsPorContrato=t.dimsPorContrato||{};
    t.dimsPorContrato[num]=trabajo().map(function(d){return {key:d.key,nombre:d.nombre,val:d.val,hints:d.hints||null};});
    recalcularTercero(t);persist();
  }
  function aprobados(t){
    var mapa=(t&&t.aprobadoPorContrato)||{};
    return contratos(t).filter(function(c){return mapa[contratoNum(c)]===true||c.estado_aprobacion==='APROBADO'||c.estado==='Aprobado';});
  }
  function tieneClasificacion(t){
    if(!t)return false;
    return contratos(t).some(function(c){return dimsContrato(t,contratoNum(c)).length>0;})||((t.dims||[]).length>0);
  }

  /* 1. Clasificación: siempre individual y con autoguardado. */
  var seleccionar0=window._clasifSeleccionarTercero;
  window._clasifSeleccionarTercero=function(nit){
    if(seleccionar0) seleccionar0.apply(this,arguments);
    var t=db()[nit];if(!t)return;
    t.modoEval='contrato';t.dimsPorContrato=t.dimsPorContrato||{};t.promPorContrato=t.promPorContrato||{};
    var cons=contratos(t),sel=document.getElementById('cls-contrato-actual');
    if(sel&&cons.length){
      var existe=cons.some(function(c){return contratoNum(c)===String(t.contratoEval||'');});
      var n=existe?String(t.contratoEval):contratoNum(cons[0]);sel.value=n;window._clasifCambiarContratoActual(n);
    }
    refrescarSelectorRiesgos();persist();
  };
  window._clasifCambiarContratoActual=function(num){
    var x=terceroActual(),t=x.t;if(!t)return;
    var anterior=t.contratoEval;
    if(anterior&&anterior!==num) guardarActual(anterior);
    t.modoEval='contrato';t.contratoEval=num||'';t.dimsPorContrato=t.dimsPorContrato||{};t.promPorContrato=t.promPorContrato||{};
    ponerTrabajo(num?dimsContrato(t,num):[]);
    var r=num?resumenDims(dimsContrato(t,num)):{prom:0,zona:'—'};
    var pe=document.getElementById('cf-prom'),ze=document.getElementById('cf-zona');
    if(pe)pe.textContent=r.prom?r.prom.toFixed(2):'—';if(ze)ze.textContent=r.zona;
    refrescarSelectorRiesgos();persist();
  };
  // Agregar/quitar una tipología sin depender de los wrappers antiguos. La
  // selección se escribe inmediatamente en dimsPorContrato del contrato activo.
  window.sgrtAgregarTipologiaContrato=function(){
    var x=terceroActual(),t=x.t,sel=document.getElementById('cf-tip-selector'),csel=document.getElementById('cls-contrato-actual');
    var num=(csel&&csel.value)||(t&&t.contratoEval)||'',key=(sel&&sel.value)||'';
    if(!t){alertaClasif('Primero selecciona el tercero que vas a clasificar.','warning');toast('Primero selecciona el tercero que vas a clasificar','warning',3500);return;}
    if(!num){alertaClasif('Primero selecciona el contrato que vas a calificar.','warning');toast('Primero selecciona el contrato que vas a calificar','warning',3500);return;}
    if(!key){alertaClasif('Selecciona una tipología en el desplegable y después pulsa Agregar.','warning');toast('Selecciona una tipología en el desplegable','warning',3000);return;}
    t.modoEval='contrato';t.contratoEval=num;
    var arr=trabajo(),idx=-1;arr.forEach(function(d,i){if(String(d.key)===String(key))idx=i;});
    if(idx>=0){arr.splice(idx,1);alertaClasif('Tipología retirada del contrato '+num+'.','success');toast('Tipología retirada de este contrato','info',1800);}
    else{
      var cat=catalogoTipologias()[key]||{},nom=String(cat.nombre||key).replace(/\n/g,' ');
      arr.push({id:'dim_'+Date.now(),key:key,nombre:nom,val:'',hasNA:!!cat.hasNA,hints:cat.hints||{},soloImpar:!!cat.soloImpar});
      alertaClasif('Tipología agregada y guardada automáticamente en el contrato '+num+'. Ahora selecciona su calificación.','success');
      toast('Tipología agregada al contrato '+num,'success',1800);
    }
    window.cfDimsAgregadas=arr;if(sel)sel.value='';
    try{window.renderDimsAgregadas&&window.renderDimsAgregadas();}catch(e){}
    try{window.calcCfProm&&window.calcCfProm();}catch(e){}
    guardarActual();refrescarSelectorRiesgos();
  };
  ['agregarTipologiaSeleccionada','setDimVal','onDimDynChange','quitarDim'].forEach(function(n){
    var f=window[n];if(typeof f!=='function')return;
    window[n]=function(){var r=f.apply(this,arguments);setTimeout(guardarActual,0);return r;};
  });
  window.finalizarClasificacionContratos=function(){
    guardarActual();var x=terceroActual(),t=x.t;if(!t){alertaClasif('Selecciona un tercero antes de finalizar.','error');toast('Selecciona un tercero','error');return;}
    var cons=contratos(t),faltan=[];
    if(!cons.length){alertaClasif('El tercero debe tener al menos un contrato.','warning');toast('El tercero debe tener al menos un contrato','warning');return;}
    cons.forEach(function(c){var n=contratoNum(c),r=resumenDims(dimsContrato(t,n));if(!r.completo)faltan.push(n);});
    if(faltan.length){
      var n=faltan[0],sel=document.getElementById('cls-contrato-actual');if(sel)sel.value=n;window._clasifCambiarContratoActual(n);
      alertaClasif('No se puede finalizar todavía: falta seleccionar o calificar las tipologías del contrato '+n+'.','warning');
      toast('Falta seleccionar y calificar todas las tipologías del contrato '+n,'warning',5000);return;
    }
    var guardar0=window.guardarValoracionTipologias;
    if(typeof guardar0==='function') guardar0();
    guardarActual();recalcularTercero(t);t.clasificacionLista=true;t.fechaClasificacionLista=new Date().toISOString();persist();
    try{window.renderAprobarOp&&window.renderAprobarOp();}catch(e){}
    try{window.navTo&&window.navTo(null,'pg-aprobar-op');}catch(e){}
    alertaClasif('Clasificación completa y guardada por contrato.','success');
    toast('Clasificación guardada por contrato. Ya puede aprobar cada contrato.','success',4000);
  };

  /* 2. Aprobación: usa tipologías y promedio del contrato, no el global. */
  window._validarAprobacionSGRT=function(t,num){
    var f=[];if(!t||!String(t.nit||'').trim())f.push('NIT');if(!t||!String(t.nombre||'').trim())f.push('nombre');
    var c=contratos(t).filter(function(x){return contratoNum(x)===String(num);})[0];if(!c)f.push('contrato válido');
    var ds=dimsContrato(t,num);if(!ds.length)f.push('tipologías');
    ds.forEach(function(d){if(valor(d)===null)f.push('puntaje de '+(d.nombre||d.key));});
    var p=promContrato(t,num);if(!(p>3))f.push('promedio mayor que 3');
    return {ok:!f.length,msg:'No se puede aprobar: completa '+f.join(', ')+'.'};
  };
  function sincronizarMatriz(t){
    var m=window.MATRIZ_DB||[];
    for(var i=m.length-1;i>=0;i--){if(m[i]&&m[i]._origenClasificacionContrato&&m[i].nit===t.nit)m.splice(i,1);}
    aprobados(t).forEach(function(c){var n=contratoNum(c);dimsContrato(t,n).forEach(function(d,i){
      var v=valor(d)||0,z=v>=4?'EXTREMO':v>=3?'ALTO':v>=2?'MODERADO':'BAJO';
      m.push({id:'CLAS_'+t.nit+'_'+n+'_'+(d.key||i),nit:t.nit,tercero:t.nombre,contrato:n,_origenClasificacionContrato:true,tipo:(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key)),factor:'Por definir',clasif:'Por definir',desc:'Riesgo de '+(d.nombre||d.key)+' · Contrato '+n+' · Valoración '+v,causa:'Por definir',vuln:'Por definir',probInh:'0.6',impInh:'0.8',zonaInh:z,control:'Por definir',tipoCtrl:'PREVENTIVO',probRes:'0.4',impRes:'0.6',zonaRes:z,tratamiento:'Por definir',plan:'Por definir',resp:t.supervisor||'',fechaImpl:'',fechaSeg:'',descSeg:'',estado:'Pendiente de Ambiente de Control'});
    });});window.MATRIZ_DB=m;
  }
  window._aprToggleContrato=function(nit,num){
    var t=db()[nit];if(!t)return;t.aprobadoPorContrato=t.aprobadoPorContrato||{};
    var activar=t.aprobadoPorContrato[num]!==true;
    if(activar){var v=window._validarAprobacionSGRT(t,num);if(!v.ok){toast(v.msg,'warning',5000);return;}}
    t.aprobadoPorContrato[num]=activar;
    var c=contratos(t).filter(function(x){return contratoNum(x)===String(num);})[0];
    if(c){c.estado_aprobacion=activar?'APROBADO':'PENDIENTE';c.estado=activar?'Aprobado':'Clasificado';c.fecha_aprobacion=activar?new Date().toISOString():'';}
    var alguno=aprobados(t).length>0;t.habilitado_ac=alguno;t.estado=alguno?'Aprobado':'Clasificado';
    if(alguno)t.aprobado_clasif=new Date().toISOString();else delete t.aprobado_clasif;
    sincronizarMatriz(t);persist();
    try{window.renderAprobarOp&&window.renderAprobarOp();}catch(e){}
    try{window.sincronizarSelectorCuestionario&&window.sincronizarSelectorCuestionario();}catch(e){}
    try{window.acPoblarSelectorTerceroInstruc&&window.acPoblarSelectorTerceroInstruc();}catch(e){}
    try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
    toast(activar?'Contrato '+num+' aprobado y enviado a Ambiente de Control':'Contrato '+num+' retirado de Ambiente de Control','success',3500);
  };
  function htmlAprobacion(lista){
    var total=0,ok=0;lista.forEach(function(t){
      contratos(t).forEach(function(c){if(dimsContrato(t,contratoNum(c)).length)total++;});
      aprobados(t).forEach(function(c){if(dimsContrato(t,contratoNum(c)).length)ok++;});
    });
    var h='<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:16px;">'
      +'<div class="card" style="padding:14px;text-align:center"><b style="font-size:24px;color:#173d63">'+total+'</b><div style="font-size:11px;color:#64748b">Contratos clasificados</div></div>'
      +'<div class="card" style="padding:14px;text-align:center;border-color:#86efac"><b style="font-size:24px;color:#16a34a">'+ok+'</b><div style="font-size:11px;color:#16a34a">Aprobados</div></div>'
      +'<div class="card" style="padding:14px;text-align:center;border-color:#fdba74"><b style="font-size:24px;color:#ea580c">'+(total-ok)+'</b><div style="font-size:11px;color:#ea580c">Pendientes</div></div></div>';
    if(!lista.length)return h+'<div class="card" style="padding:35px;text-align:center;color:#64748b">Aún no hay tipologías calificadas por contrato. Ve a Clasificación de Terceros, selecciona el contrato, agrega una o varias tipologías y asigna sus notas.</div>';
    lista.forEach(function(t){
      h+='<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden"><div style="padding:13px 16px;background:#173d63;color:white"><b>'+esc(t.nombre||t.nit)+'</b><span style="margin-left:10px;font-size:11px;opacity:.8">NIT '+esc(t.nit)+'</span></div>';
      contratos(t).forEach(function(c){var n=contratoNum(c),ds=dimsContrato(t,n),p=promContrato(t,n),a=aprobados(t).some(function(x){return contratoNum(x)===n;}),v=window._validarAprobacionSGRT(t,n),completo=resumenDims(ds).completo;
        h+='<div style="padding:13px 16px;border-bottom:1px solid #e2e8f0"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><b style="min-width:140px">Contrato '+esc(n)+'</b><span style="font-size:12px">Promedio: <b>'+p.toFixed(2)+'</b></span><span style="font-size:11px;color:#64748b">'+ds.length+' tipología'+(ds.length===1?'':'s')+'</span><span style="flex:1"></span>';
        h+='<button onclick="window._verTipologiasContrato(\''+jsq(t.nit)+'\',\''+jsq(n)+'\')" class="btn btn-outline" style="font-size:11px"'+(!ds.length?' disabled':'')+'>Ver tipologías y puntajes</button>';
        h+='<button '+(v.ok||a?'onclick="window._aprToggleContrato(\''+jsq(t.nit)+'\',\''+jsq(n)+'\')"':'disabled')+' class="btn '+(a?'btn-success':'btn-primary')+'" style="font-size:11px;opacity:'+(v.ok||a?'1':'.45')+'">'+(a?'✓ Aprobado':'Aprobar')+'</button></div>';
        h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">'+(ds.length?ds.map(function(d){var cal=valor(d);return '<span style="padding:5px 9px;border-radius:12px;background:'+(cal===null?'#fff7ed':'#eff6ff')+';color:'+(cal===null?'#9a3412':'#1d4ed8')+';font-size:10px"><b>'+esc(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key))+'</b>: '+(cal===null?'Sin calificar':esc(cal))+'</span>';}).join(''):'<span style="font-size:11px;color:#9a3412">Sin tipologías asignadas a este contrato.</span>')+'</div>';
        if(ds.length&&!completo)h+='<div style="margin-top:7px;font-size:11px;color:#9a3412;font-weight:700">Falta calificar una o más tipologías.</div>';
        else if(ds.length&&!v.ok&&!a)h+='<div style="margin-top:7px;font-size:11px;color:#9a3412;font-weight:700">'+esc(v.msg)+'</div>';
        h+='</div>';
      });h+='</div>';
    });return h;
  }
  window.renderAprobarOp=function(){
    var pg=document.getElementById('pg-aprobar-op');if(!pg)return;
    var q=String(window._sgrtAprobacionBuscar||'').toLowerCase();
    var lista=Object.keys(db()).map(function(k){return db()[k];}).filter(function(t){return t&&tieneClasificacion(t)&&(!q||String(t.nombre||'').toLowerCase().indexOf(q)>=0||String(t.nit||'').toLowerCase().indexOf(q)>=0);});
    pg.innerHTML='<div style="margin-bottom:14px"><h2 style="margin:0;color:#173d63">Aprobación de Clasificación de Terceros</h2><div style="font-size:12px;color:#64748b">Aprobación individual antes de Ambiente de Control</div></div><input id="aprobar-search-input" placeholder="Buscar por nombre o NIT..." value="'+esc(window._sgrtAprobacionBuscar||'')+'" oninput="window._sgrtAprobacionBuscar=this.value;window.renderAprobarOp()" style="width:100%;padding:10px 13px;border:1px solid #cbd5e1;border-radius:7px;margin-bottom:14px">'+htmlAprobacion(lista);
  };

  /* 3. Evaluador: solo contratos aprobados y respuestas independientes. */
  function cambiarRespuestas(nit,num){
    var ctx=window._sgrtContextoRespuesta;
    if(ctx&&db()[ctx.nit]&&window.CUEST_RESPUESTAS){
      var ta=db()[ctx.nit];ta.respuestasACPorContrato=ta.respuestasACPorContrato||{};ta.respuestasACPorContrato[ctx.num]=cp(window.CUEST_RESPUESTAS[ctx.nit]||{});
    }
    var t=db()[nit];if(!t)return;t.respuestasACPorContrato=t.respuestasACPorContrato||{};window.CUEST_RESPUESTAS=window.CUEST_RESPUESTAS||{};
    window.CUEST_RESPUESTAS[nit]=cp(t.respuestasACPorContrato[num]||{});window._sgrtContextoRespuesta={nit:nit,num:num};
  }
  function poblarContrato(idWrap,idSel,nit){
    var w=document.getElementById(idWrap),s=document.getElementById(idSel);if(!w||!s)return;
    var t=db()[nit],cs=aprobados(t);if(!t||!cs.length){w.style.display='none';return;}
    var actual=cs.some(function(c){return contratoNum(c)===String(t.contratoEval||'');})?String(t.contratoEval):contratoNum(cs[0]);
    t.modoEval='contrato';t.contratoEval=actual;s.innerHTML=cs.map(function(c){var n=contratoNum(c);return '<option value="'+esc(n)+'"'+(n===actual?' selected':'')+'>'+esc(n)+'</option>';}).join('');w.style.display='flex';
  }
  window.qPoblarContratos=function(nit){poblarContrato('q-contrato-wrap','q-contrato-sel',nit);try{window.qRenderizarContratosTabla&&window.qRenderizarContratosTabla(nit);}catch(e){}};
  window.acPoblarContratos=function(nit){poblarContrato('ac-contrato-wrap','ac-contrato-sel',nit);};
  function cambiarContratoAC(nit,num){
    var t=db()[nit],ok=aprobados(t).some(function(c){return contratoNum(c)===String(num);});if(!t||!ok)return;
    t.modoEval='contrato';t.contratoEval=num;cambiarRespuestas(nit,num);persist();
    var q=document.getElementById('q-contrato-sel'),a=document.getElementById('ac-contrato-sel');if(q)q.value=num;if(a)a.value=num;
    try{window.cargarCuestionarioTercero&&window.cargarCuestionarioTercero();}catch(e){}
    try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}
  }
  window.qCambiarContrato=function(num){var nit=(document.getElementById('q-tercero')||{}).value||'';cambiarContratoAC(nit,num);};
  window.acCambiarContrato=function(num){var nit=(document.getElementById('ac-tercero-instruc')||{}).value||'';cambiarContratoAC(nit,num);};
  var cargarQ0=window.cargarCuestionarioTercero;
  window.cargarCuestionarioTercero=function(){
    var nit=(document.getElementById('q-tercero')||{}).value||'',t=db()[nit],cs=aprobados(t),restaurar;
    if(t&&cs.length){var n=cs.some(function(c){return contratoNum(c)===String(t.contratoEval||'');})?String(t.contratoEval):contratoNum(cs[0]);t.modoEval='contrato';t.contratoEval=n;cambiarRespuestas(nit,n);restaurar=t.dims;t.dims=cp(dimsContrato(t,n));}
    var r=cargarQ0&&cargarQ0.apply(this,arguments);if(t&&restaurar!==undefined)t.dims=restaurar;return r;
  };
  var guardarQ0=window.guardarCuestionarioCompleto;
  window.guardarCuestionarioCompleto=function(){
    var nit=window.nitActual||((document.getElementById('q-tercero')||{}).value||''),t=db()[nit],num=t&&t.contratoEval;
    if(!t||!num||!aprobados(t).some(function(c){return contratoNum(c)===String(num);}))return guardarQ0&&guardarQ0.apply(this,arguments);
    var dimsPrev=t.dims,promPrev=cp(t.promPorContrato||{});t.dims=cp(dimsContrato(t,num));
    var r=guardarQ0&&guardarQ0.apply(this,arguments);t.respuestasACPorContrato=t.respuestasACPorContrato||{};t.respuestasACPorContrato[num]=cp((window.CUEST_RESPUESTAS||{})[nit]||{});
    t.acPorContrato=t.acPorContrato||{};t.acPorContrato[num]={promAC:parseFloat(t.promAC)||0,avance:parseFloat(t.acAvance)||0,fecha:new Date().toISOString()};
    t.dims=dimsPrev;t.promPorContrato=promPrev;
    var cs=aprobados(t),acs=cs.map(function(c){return t.acPorContrato[contratoNum(c)]||{promAC:0,avance:0};});
    t.promAC=acs.length?acs.reduce(function(a,x){return a+(parseFloat(x.promAC)||0);},0)/acs.length:0;t.acAvance=acs.length?acs.reduce(function(a,x){return a+(parseFloat(x.avance)||0);},0)/acs.length:0;
    t.estado=acs.length&&acs.every(function(x){return (parseFloat(x.avance)||0)>=100;})?'Completado':'Aprobado';persist();try{window.renderReportesAC&&window.renderReportesAC();}catch(e){}return r;
  };

  /* 4. Configuración: tipologías reales del contrato y toggles por contrato. */
  window._ctrlPoblarContratos=function(){
    var ts=document.getElementById('ctrl-terc-sel'),s=document.getElementById('ctrl-contrato-sel'),l=document.getElementById('ctrl-contrato-label');if(!ts||!s||!l)return;
    var t=db()[ts.value],cs=contratos(t),prev=s.value;if(!cs.length){s.style.display='none';l.style.display='none';return;}
    s.innerHTML='<option value="">Todos los contratos</option>'+cs.map(function(c){var n=contratoNum(c);return '<option value="'+esc(n)+'">Contrato '+esc(n)+'</option>';}).join('');s.style.display='';l.style.display='';
    if(cs.some(function(c){return contratoNum(c)===prev;}))s.value=prev;
    s.setAttribute('onchange','window._ctrlFiltrarTipsPorTercero();window.renderCtrlLista();');
  };
  window._ctrlFiltrarTipsPorTercero=function(){
    var ts=document.getElementById('ctrl-terc-sel'),cs=document.getElementById('ctrl-contrato-sel'),ss=document.getElementById('ctrl-tip-sel');if(!ss)return;
    var t=db()[(ts&&ts.value)||''],num=(cs&&cs.value)||'',ds=t?(num?dimsContrato(t,num):unionDims(t)):[],keys={};ds.forEach(function(d){keys[String(d.key||'').toLowerCase()]=1;});
    var tips=(window.getDBTips?window.getDBTips(window.getEntidad?window.getEntidad():''):[]).filter(function(tp){return tp.activo!==false&&(!t||keys[String(tp.clave||tp.key||'').toLowerCase()]);});
    var prev=ss.value;ss.innerHTML='<option value="">-- Selecciona una tipología --</option>'+tips.map(function(tp){return '<option value="'+esc(tp.id_tipologia)+'">'+esc(tp.nombre_tipologia)+'</option>';}).join('');
    if(tips.some(function(tp){return String(tp.id_tipologia)===String(prev);}))ss.value=prev;else if(tips.length)ss.value=String(tips[0].id_tipologia);
    try{window.renderCtrlLista&&window.renderCtrlLista();}catch(e){}try{window.renderCtrlTerceros&&window.renderCtrlTerceros();}catch(e){}
  };
  var todas0=window.ctrlTodas;
  window.ctrlTodas=function(act){
    var nit=(document.getElementById('ctrl-terc-sel')||{}).value||'',num=(document.getElementById('ctrl-contrato-sel')||{}).value||'',id=(document.getElementById('ctrl-tip-sel')||{}).value||'';
    if(!nit||!num||!id)return todas0&&todas0.apply(this,arguments);if(!act&&!confirm('¿Desactivar todos para este contrato?'))return;
    var tip=window.getTip&&window.getTip(id),key=(tip&&(tip.clave||tip.key))||id,p=(window.ctrlGetPregs&&window.ctrlGetPregs(id))||[];window._persHiddenControls=window._persHiddenControls||{};
    window._persHiddenControls[nit+'_'+num+'_'+key]=act?[]:p.map(function(x,i){return x.n||(i+1);});persist();window.renderCtrlLista&&window.renderCtrlLista();toast(act?'Preguntas activadas para '+num:'Preguntas desactivadas para '+num,'success');
  };
  var renderCtrl0=window.renderCtrlOp;
  if(typeof renderCtrl0==='function')window.renderCtrlOp=function(){var r=renderCtrl0.apply(this,arguments);setTimeout(function(){try{window._ctrlPoblarContratos();window._ctrlFiltrarTipsPorTercero();}catch(e){}},0);return r;};

  /* 5. Dashboard: estado real de cada contrato aprobado. */
  var reporte0=window.renderReportesAC;
  if(typeof reporte0==='function')window.renderReportesAC=function(){
    var r=reporte0.apply(this,arguments),w=document.getElementById('cq-reportes-body');if(!w)return r;
    var filas=[];Object.keys(db()).forEach(function(nit){var t=db()[nit];aprobados(t).forEach(function(c){var n=contratoNum(c),ac=(t.acPorContrato||{})[n]||{};filas.push({t:t,n:n,p:parseFloat(ac.promAC)||0,a:parseFloat(ac.avance)||0});});});
    var box=document.createElement('div');box.id='sgrt-reporte-contratos';box.className='card';box.style.cssText='padding:14px 16px;margin-bottom:16px;';box.innerHTML='<div style="font-weight:800;color:#173d63;margin-bottom:10px">Seguimiento individual por contrato</div>'+(filas.length?'<div style="display:grid;gap:7px">'+filas.map(function(x){return '<div style="display:grid;grid-template-columns:minmax(140px,1fr) 130px 100px 90px;gap:8px;padding:8px;background:#f8fafc;border-radius:6px;font-size:11px"><b>'+esc(x.t.nombre||x.t.nit)+'</b><span>Contrato '+esc(x.n)+'</span><span>Avance <b>'+x.a.toFixed(0)+'%</b></span><span>AC <b>'+x.p.toFixed(2)+'</b></span></div>';}).join('')+'</div>':'<div style="font-size:12px;color:#64748b">Aún no hay contratos aprobados.</div>');w.insertBefore(box,w.firstChild);return r;
  };

  // Restaurar el render completo original. Los puntajes por contrato se
  // incorporan directamente en 08-fixes-aplicacion.js.
  if(typeof renderAprobarOriginal==='function')window.renderAprobarOp=function(){return renderAprobarOriginal.apply(this,arguments);};

  window.SGRTContractFlow={dimsContrato:dimsContrato,promContrato:promContrato,recalcular:recalcularTercero,aprobados:aprobados,guardarActual:guardarActual};
})();
