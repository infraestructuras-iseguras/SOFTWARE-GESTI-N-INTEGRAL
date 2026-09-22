/*
 * SGRT — MÓDULO 42 · CORRECCIONES SOLICITADAS (2026-09-19)
 *
 * Este módulo se carga DESPUÉS del 41 y no modifica la estructura existente.
 * Solo corrige/agrega:
 * 1) Tipologías estrictamente independientes por tercero + contrato y guardado en Azure.
 * 2) Registros del Administrador de Riesgos hidratados desde /api/terceros + /api/sgrt-state.
 * 3) Alcance por entidad: Admin/Evaluador solo su entidad; ISEGURAS conserva multi-entidad.
 * 4) Informes Word/PowerPoint corporativos guiados por las plantillas ISEGURAS.
 * 5) IA SGRT conversacional, con adjuntos y reuniones, usando backend /api/ai/*.
 *
 * NO elimina Evidencias, Reportes, Documentación ni cambia carpetas originales.
 */

/* ============================================================================
 * SGRT 42-A — CORRECCIÓN QUIRÚRGICA 2026-09-19
 * - Tipologías 100% independientes por contrato (sin fallback a t.dims).
 * - Guardado inmediato local + Azure al agregar/quitar/valorar tipologías.
 * - Configuración AC del Administrador lee las tipologías del contrato elegido.
 * - Repositorio: Admin/Evaluador ven SOLO su entidad, sin carpetas "Empresa ·".
 *   ISEGURAS conserva la vista multi-entidad.
 * NO modifica la estructura de carpetas ni elimina datos existentes.
 * ============================================================================ */
(function(){
  'use strict';

  var syncTimers={};
  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato));}
  function canonContract(v){var s=norm(v);if(/^\d+$/.test(s)){var n=parseInt(s,10);return isNaN(n)?s:String(n);}return low(s);}
  function mapKey(map,contract){
    if(!map||typeof map!=='object')return '';
    contract=norm(contract);if(Object.prototype.hasOwnProperty.call(map,contract))return contract;
    var cc=canonContract(contract),keys=Object.keys(map);
    for(var i=0;i<keys.length;i++)if(canonContract(keys[i])===cc)return keys[i];
    return '';
  }
  function strictDims(t,contract){
    if(!t||!contract)return [];
    var k=mapKey(t.dimsPorContrato,contract),arr=k&&t.dimsPorContrato[k];
    if(!Array.isArray(arr)){k=mapKey(t.tipologiasPorContrato,contract);arr=k&&t.tipologiasPorContrato[k];}
    return Array.isArray(arr)?clone(arr):[];
  }
  function uiDims(){
    try{if(typeof cfDimsAgregadas!=='undefined'&&Array.isArray(cfDimsAgregadas))return cfDimsAgregadas;}catch(e){}
    return Array.isArray(window.cfDimsAgregadas)?window.cfDimsAgregadas:[];
  }
  function serialDims(arr){
    return (arr||[]).map(function(d){return {
      key:d.key, nombre:d.nombre, val:d.val==null?'':String(d.val),
      hints:d.hints||null, hasNA:!!d.hasNA, soloImpar:!!d.soloImpar,
      estado_aprobacion:d.estado_aprobacion||undefined
    };}).filter(function(d){return !!norm(d.key)||!!norm(d.nombre);});
  }
  function setUiDims(arr){
    arr=Array.isArray(arr)?arr:[];
    try{
      var target=uiDims();target.length=0;
      arr.forEach(function(d){target.push({
        id:'d_'+(d.key||'custom')+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
        key:d.key,nombre:d.nombre,val:d.val==null?'':String(d.val),
        hasNA:!!d.hasNA,hints:d.hints||null,soloImpar:!!d.soloImpar
      });});
      window.cfDimsAgregadas=target;
      try{if(typeof renderDimsAgregadas==='function')renderDimsAgregadas();}catch(e1){}
      try{if(typeof actualizarOpcionesSelectorTipologias==='function')actualizarOpcionesSelectorTipologias();}catch(e2){}
      try{if(typeof calcCfProm==='function')calcCfProm();}catch(e3){}
    }catch(e){console.warn('SGRT 42-A setUiDims:',e);}
  }
  function currentNit(){return norm((document.getElementById('cf-nit')||{}).value||(document.getElementById('cls-tip-tercero-sel')||{}).value);}
  function currentContract(t){return norm((document.getElementById('cls-contrato-actual')||{}).value||(t&&t.contratoEval));}
  function zone(p){return p>=4?'EXTREMO':p>=3?'ALTO':p>=2?'MODERADO':'BAJO';}
  function localSave(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');s.TERCEROS_DB=db();localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e2){}
    try{if(window._lsSave)window._lsSave();}catch(e3){}
  }
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'').replace(/\/$/,'');}
  function remoteSaveContract(t,contract,dims,promContrato,delay){
    if(!t||!t.nit||!contract)return;
    var id=norm(t.nit)+'|'+canonContract(contract);clearTimeout(syncTimers[id]);
    syncTimers[id]=setTimeout(async function(){
      var base=apiBase(),meta=(t.contratos||[]).find(function(x){return canonContract(contractNum(x))===canonContract(contract);})||{};
      var actor=window.currentUser||{};
      var body={
        dims:clone(dims||[]),
        promContrato:clone(promContrato||{prom:null,zona:'',sinPuntaje:true}),
        aprobado:!!(t.aprobadoPorContrato&&t.aprobadoPorContrato[mapKey(t.aprobadoPorContrato,contract)||contract]),
        contratoMeta:clone(meta),
        nombre:t.nombre||'',entidad:t.entidad||'',domicilio:t.domicilio||'',
        servicio:t.servicio||'',servicio_contratado:t.servicio_contratado||'',
        actor:{login:actor.login||'',name:actor.name||actor.nombre||'',rol:actor.rol||''}
      };
      try{
        if(!base)throw new Error('API_BASE no configurado');
        var r=await fetch(base+'/api/sgrt-state/'+encodeURIComponent(t.nit)+'/clasificacion/'+encodeURIComponent(contract),{
          method:'PATCH',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)
        });
        var x=await r.json().catch(function(){return{};});
        if(!r.ok||!x.ok)throw new Error(x.error||('HTTP '+r.status));
        t.sincronizado=true;t._changed=false;
      }catch(err){
        // Compatibilidad con un backend aún no desplegado: si el endpoint nuevo no
        // existe, se usa el guardado completo anterior sin detener el trabajo local.
        console.warn('SGRT 42-A sincronización contractual:',err.message||err);
        if(typeof window._sgrtUpsertEstadoCompleto==='function'){
          try{await Promise.resolve(window._sgrtUpsertEstadoCompleto(t));}catch(e2){console.warn('SGRT 42-A Azure fallback:',e2.message||e2);}
        }
      }
    },delay==null?300:delay);
  }
  function saveExact(nit,contract,doRemote){
    nit=norm(nit);contract=norm(contract);var t=db()[nit];if(!t||!contract)return false;
    var dims=serialDims(uiDims());
    t.dimsPorContrato=t.dimsPorContrato&&typeof t.dimsPorContrato==='object'?t.dimsPorContrato:{};
    // Unificar un posible alias del mismo número de contrato sin tocar otros contratos.
    var oldKey=mapKey(t.dimsPorContrato,contract);if(oldKey&&oldKey!==contract)delete t.dimsPorContrato[oldKey];
    t.dimsPorContrato[contract]=clone(dims);
    t.tipologiasPorContrato=t.tipologiasPorContrato&&typeof t.tipologiasPorContrato==='object'?t.tipologiasPorContrato:{};
    var oldTipKey=mapKey(t.tipologiasPorContrato,contract);if(oldTipKey&&oldTipKey!==contract)delete t.tipologiasPorContrato[oldTipKey];
    t.tipologiasPorContrato[contract]=clone(dims);
    t.modoEval='contrato';t.contratoEval=contract;
    // t.dims queda SOLO como espejo de compatibilidad del contrato activo.
    t.dims=clone(dims);
    t.promPorContrato=t.promPorContrato&&typeof t.promPorContrato==='object'?t.promPorContrato:{};
    var vals=dims.map(function(d){var raw=(d&&d.val!==undefined&&d.val!==null)?String(d.val).trim():'';if(!raw)return null;var v=parseFloat(raw);return isNaN(v)?null:v;}).filter(function(v){return v!==null;});
    var promContrato={prom:null,zona:'',sinPuntaje:true};
    if(vals.length){
      var p=vals.reduce(function(a,b){return a+b;},0)/vals.length;
      promContrato={prom:Number(p.toFixed(2)),zona:zone(p)};
      t.prom=Number(p.toFixed(2));t.zona=zone(p);
    }
    t.promPorContrato[contract]=clone(promContrato);
    var c=(t.contratos||[]).find(function(x){return canonContract(contractNum(x))===canonContract(contract);});
    if(c){
      c.clasificacion_lista=dims.length>0;
      // Mantener también las copias contractuales legadas alineadas para que
      // ningún lector antiguo pueda rescatar tipologías de otro contrato.
      c.dims=clone(dims);c.tipologias=clone(dims);c.clasificacion=clone(dims);
    }
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    localSave();if(doRemote!==false)remoteSaveContract(t,contract,dims,promContrato,260);return true;
  }

  // 1) Cambio de contrato: snapshot del mapa ANTES de ejecutar wrappers antiguos,
  //    luego se restaura y se pinta EXCLUSIVAMENTE el contrato nuevo.
  var prevSwitch=window._clasifCambiarContratoActual;
  if(typeof prevSwitch==='function'&&!prevSwitch._sgrt42tip){
    var wrappedSwitch=function(num){
      num=norm(num);var nit=currentNit(),t=nit?db()[nit]:null;
      if(!t)return prevSwitch.apply(this,arguments);
      var previous=norm(t.contratoEval),snapshot=clone(t.dimsPorContrato||{}),tipSnapshot=clone(t.tipologiasPorContrato||{});
      // Captura la pantalla actual únicamente para el contrato que se abandona.
      if(previous&&previous!==num){snapshot[previous]=serialDims(uiDims());tipSnapshot[previous]=clone(snapshot[previous]);}
      var r=prevSwitch.apply(this,arguments);
      // Neutraliza cualquier fallback legado que haya copiado t.dims al contrato nuevo.
      t.dimsPorContrato=snapshot;t.tipologiasPorContrato=tipSnapshot;t.modoEval='contrato';t.contratoEval=num;
      var exact=num?strictDims(t,num):[];t.dims=clone(exact);setUiDims(exact);localSave();
      if(previous&&previous!==num){t._changed=true;t.sincronizado=false;
        var prevDims=clone(snapshot[previous]||[]),prevVals=prevDims.map(function(d){var v=parseFloat(d&&d.val);return isNaN(v)?null:v;}).filter(function(v){return v!==null;});
        var prevProm=prevVals.length?{prom:Number((prevVals.reduce(function(a,b){return a+b;},0)/prevVals.length).toFixed(2)),zona:zone(prevVals.reduce(function(a,b){return a+b;},0)/prevVals.length)}:{prom:null,zona:'',sinPuntaje:true};
        remoteSaveContract(t,previous,prevDims,prevProm,180);
      }
      return r;
    };
    wrappedSwitch._sgrt42tip=true;window._clasifCambiarContratoActual=wrappedSwitch;
  }

  // 2) Al seleccionar tercero, si ya tiene contrato activo, no cargar t.dims global:
  //    se vuelve a pintar su mapa contractual exacto.
  var prevThird=window._clasifSeleccionarTercero;
  if(typeof prevThird==='function'&&!prevThird._sgrt42tip){
    var wrappedThird=function(nit){
      var r=prevThird.apply(this,arguments),t=db()[norm(nit)];
      setTimeout(function(){
        if(!t)return;var sel=document.getElementById('cls-contrato-actual'),c=norm((sel&&sel.value)||t.contratoEval);
        if(!c&&(t.contratos||[]).length)c=contractNum(t.contratos[0]);
        if(c){if(sel)sel.value=c;t.modoEval='contrato';t.contratoEval=c;t.dims=clone(strictDims(t,c));setUiDims(strictDims(t,c));}
      },0);return r;
    };
    wrappedThird._sgrt42tip=true;window._clasifSeleccionarTercero=wrappedThird;
  }

  // 3) Reemplaza el autoguardado contractual por uno estricto y sincronizado a Azure.
  var prevAuto=window._clsAutoGuardarDims;
  window._clsAutoGuardarDims=function(){
    var nit=currentNit(),t=nit?db()[nit]:null,c=currentContract(t);
    if(t&&c)return saveExact(nit,c,true);
    return typeof prevAuto==='function'?prevAuto.apply(this,arguments):undefined;
  };

  function wrapSaveAfter(name){
    var old=window[name];if(typeof old!=='function'||old._sgrt42tip)return;
    var fn=function(){var r=old.apply(this,arguments);setTimeout(function(){var nit=currentNit(),t=nit?db()[nit]:null,c=currentContract(t);if(t&&c)saveExact(nit,c,true);},0);return r;};
    fn._sgrt42tip=true;window[name]=fn;
  }
  ['agregarTipologiaSeleccionada','quitarDim','onDimDynChange'].forEach(wrapSaveAfter);

  // La función heredada guardarValoracionTipologias reconstruía MATRIZ_DB y
  // eliminaba riesgos manuales del tercero. Se conserva su guardado de clasificación,
  // pero se restaura exactamente la matriz de riesgos que el usuario tenía.
  var oldGuardarValoracion=window.guardarValoracionTipologias;
  if(typeof oldGuardarValoracion==='function'&&!oldGuardarValoracion._sgrt42tip){
    var gv=function(){
      var before=clone(window.MATRIZ_DB||[]);
      var r=oldGuardarValoracion.apply(this,arguments);
      try{
        if(Array.isArray(window.MATRIZ_DB)){
          window.MATRIZ_DB.length=0;before.forEach(function(x){window.MATRIZ_DB.push(clone(x));});
        }
      }catch(e){}
      setTimeout(function(){var nit=currentNit(),t=nit?db()[nit]:null,c=currentContract(t);if(t&&c)saveExact(nit,c,true);try{window.renderMatriz&&window.renderMatriz();}catch(e2){}},0);
      return r;
    };
    gv._sgrt42tip=true;window.guardarValoracionTipologias=gv;
  }

  // 4) Administrador de Riesgos: selector de tipologías según TERCERO + CONTRATO.
  function catalogTips(){
    try{if(typeof getDBTips==='function')return getDBTips(typeof getEntidad==='function'?getEntidad():undefined).filter(function(x){return x.activo!==false;});}catch(e){}
    return [];
  }
  function canonDimKey(v){var k=low(v),a={fc:'fr',rf:'fi',pais:'pa'};return a[k]||k;}
  window._ctrlFiltrarTipsPorTercero=function(){
    var ts=document.getElementById('ctrl-terc-sel'),cs=document.getElementById('ctrl-contrato-sel'),sel=document.getElementById('ctrl-tip-sel');if(!sel)return;
    var nit=norm(ts&&ts.value),t=nit?db()[nit]:null,contract=norm(cs&&cs.value),dims=[];
    if(t){
      if(!contract&&(t.contratos||[]).length===1){contract=contractNum(t.contratos[0]);if(cs)cs.value=contract;}
      if(contract)dims=strictDims(t,contract);
      else{ // Sin contrato elegido: solo unión de mapas contractuales, NUNCA t.dims.
        var seen={};Object.keys(t.dimsPorContrato||{}).forEach(function(c){strictDims(t,c).forEach(function(d){var k=canonDimKey(d.key);if(k&&!seen[k]){seen[k]=1;dims.push(d);}});});
      }
    }
    var allowed={};dims.forEach(function(d){allowed[canonDimKey(d.key)]=true;});
    var tips=catalogTips().filter(function(tp){return !nit||!!allowed[canonDimKey(tp.clave||tp.key)];}),actual=sel.value;
    sel.innerHTML='<option value="">-- Selecciona una tipología --</option>'+tips.map(function(tp){return '<option value="'+tp.id_tipologia+'">'+tp.nombre_tipologia+'</option>';}).join('');
    var exists=[].some.call(sel.options,function(o){return o.value===actual&&o.value!=='';});
    if(exists)sel.value=actual;else if(nit&&tips.length)sel.value=String(tips[0].id_tipologia);else sel.value='';
    try{window.renderCtrlLista&&window.renderCtrlLista();}catch(e1){}
    try{window.renderCtrlTerceros&&window.renderCtrlTerceros();}catch(e2){}
  };
  var prevCtrlContracts=window._ctrlPoblarContratos;
  if(typeof prevCtrlContracts==='function'&&!prevCtrlContracts._sgrt42tip){
    var wrappedCtrlContracts=function(){
      var r=prevCtrlContracts.apply(this,arguments),ts=document.getElementById('ctrl-terc-sel'),cs=document.getElementById('ctrl-contrato-sel'),t=ts&&db()[norm(ts.value)];
      if(t&&cs&&(t.contratos||[]).length){
        var valid=(t.contratos||[]).map(contractNum).filter(Boolean),cur=norm(cs.value);
        if(!cur||valid.indexOf(cur)<0)cs.value=valid[0];
      }
      setTimeout(function(){try{window._ctrlFiltrarTipsPorTercero();}catch(e){}},0);return r;
    };
    wrappedCtrlContracts._sgrt42tip=true;window._ctrlPoblarContratos=wrappedCtrlContracts;
  }
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='ctrl-contrato-sel')setTimeout(function(){try{window._ctrlFiltrarTipsPorTercero();}catch(x){}},0);});

  // 5) Alcance documental por rol. NO se borra ninguna carpeta: durante el render
  //    solamente se oculta lo que no corresponde a la entidad del usuario.
  function isIS(){var u=window.currentUser||{},r=low(u.rol);return r==='is'||r==='iseguras'||r==='superadministrador'||r==='super administrador'||u.login==='iseguras2026';}
  function entityKey(v){var s=low(v).replace(/[^a-z0-9]/g,'');if(!s)return '';if(s==='cliente1'||s.indexOf('colpensiones')>=0)return 'colpensiones';return s;}
  function userEntity(){var u=window.currentUser||{},e=entityKey(u.entidad||u.entidadId||u.organizacion);var r=low(u.rol);if(!e&&(r==='admin_riesgos'||r==='operativo'||r==='evaluador'))e='colpensiones';return e;}
  function allowedNit(nit){var t=db()[norm(nit)];if(!t)return true;var ue=userEntity();if(!ue)return true;return entityKey(t.entidad||t.entidadLabel)===ue||(!entityKey(t.entidad||t.entidadLabel)&&ue==='colpensiones');}
  function itemNit(item){
    var direct=norm(item&&(item.nit||item.terceroNit||(item.meta&&item.meta.nit)));if(direct)return direct;
    var name=norm(item&&item.name),id=norm(item&&item.id),keys=Object.keys(db());
    for(var i=0;i<keys.length;i++){var n=keys[i],safe=n.replace(/[^a-z0-9]/gi,'_');if(name.indexOf('('+n+')')>=0||id.indexOf(safe)>=0||id.indexOf(n)>=0)return n;}
    return '';
  }
  function visibleRepoItem(item,isRoot){
    if(!item)return false;if(isIS())return true;
    var id=low(item.id),kind=low(item.meta&&item.meta.kind);
    if(isRoot&&(id.indexOf('entidad-')===0||kind==='entity'||id==='comparativos-ejecutivos'||kind==='comparative-root'))return false;
    if(item.meta&&item.meta.entityId){var ie=entityKey(item.meta.entityId);if(ie&&userEntity()&&ie!==userEntity())return false;}
    var nit=itemNit(item);if(nit&&!allowedNit(nit))return false;
    return true;
  }
  // Para Administrador/Evaluador no se muestra la capa "Empresa · ...".
  // Se crea una VISTA virtual del repositorio: conserva las carpetas originales
  // (Ambiente de Control, Evidencias, Informes, etc.) y expone directamente las
  // carpetas de SU entidad. No modifica ni borra el árbol real guardado.
  var prevOdCF411=window.odCF;
  if(typeof prevOdCF411==='function'&&!prevOdCF411._sgrt42scope){
    var scopedOdCF=function(){
      if(isIS())return prevOdCF411.apply(this,arguments);
      try{
        var root=window._odFS;
        if(!root||!Array.isArray(root.children))return prevOdCF411.apply(this,arguments);
        var path=window._odPath||[],ue=userEntity();
        var base=(root.children||[]).filter(function(x){
          var id=low(x&&x.id),kind=low(x&&x.meta&&x.meta.kind);
          return !(id.indexOf('entidad-')===0||kind==='entity'||id==='comparativos-ejecutivos'||kind==='comparative-root');
        });
        var ef=(root.children||[]).find(function(x){
          if(!x)return false;var id=low(x.id),kind=low(x.meta&&x.meta.kind),ie=entityKey((x.meta&&x.meta.entityId)||x.name||'');
          return (id.indexOf('entidad-')===0||kind==='entity')&&ue&&ie===ue;
        });
        var entityKids=ef&&Array.isArray(ef.children)?ef.children.filter(function(x){
          var kind=low(x&&x.meta&&x.meta.kind),id=low(x&&x.id);
          // Comparativos entre entidades pertenecen exclusivamente a ISEGURAS.
          return kind!=='comparative'&&kind!=='comparative-root'&&id.indexOf('comparativos-')!==0;
        }):[];
        var virtualRoot=Object.assign({},root,{children:base.concat(entityKids)});
        var node=virtualRoot;
        for(var i=0;i<path.length;i++){
          var next=(node.children||[]).find(function(c){return c&&String(c.id)===String(path[i].id);});
          if(!next)break;node=next;
        }
        return node;
      }catch(e){return prevOdCF411.apply(this,arguments);}
    };
    scopedOdCF._sgrt42scope=true;window.odCF=scopedOdCF;
  }

  var prevOdRender411=window.odRender;
  if(typeof prevOdRender411==='function'&&!prevOdRender411._sgrt42tip){
    var scopedOdRender=function(){
      if(isIS())return prevOdRender411.apply(this,arguments);
      try{
        // Si una versión anterior dejó al usuario dentro de Empresa · X, volver a inicio.
        var path=window._odPath||[];
        if(path.some(function(x){return low(x.id).indexOf('entidad-')===0;})){window._odPath=[];}
        var cur=window.odCF&&window.odCF();if(!cur||!Array.isArray(cur.children))return prevOdRender411.apply(this,arguments);
        var original=cur.children,isRoot=!(window._odPath||[]).length;
        cur.children=original.filter(function(x){return visibleRepoItem(x,isRoot);});
        try{return prevOdRender411.apply(this,arguments);}finally{cur.children=original;}
      }catch(e){return prevOdRender411.apply(this,arguments);}
    };
    scopedOdRender._sgrt42tip=true;window.odRender=scopedOdRender;
  }

  // Refuerzo al iniciar páginas: nunca migrar/duplicar tipologías entre contratos.
  function refreshCurrent(){
    var nit=currentNit(),t=nit?db()[nit]:null,c=currentContract(t);if(t&&c){t.dims=clone(strictDims(t,c));setUiDims(strictDims(t,c));}
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(refreshCurrent,900);});
})();


/*
 * SGRT — Ajuste 42-B (2026-09-19)
 * Corrección puntual de visibilidad de registros en Administrador de Riesgos.
 * - Une /api/terceros + /api/sgrt-state antes de pintar "Terceros Registrados".
 * - No borra ni reemplaza contratos, tipologías, respuestas o evidencias existentes.
 * - Administrador de Riesgos/Evaluador quedan limitados a su entidad (Colpensiones).
 * - ISeguras/Superadministrador conserva el alcance multi-entidad existente.
 */
(function(){
  'use strict';

  var loading=null,lastLoad=0;
  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');}
  function role(){return low((window.currentUser||{}).rol);}
  function isIS(){var u=window.currentUser||{},r=role();return u.login==='iseguras2026'||r==='is'||r==='iseguras'||r==='superadministrador'||r==='super administrador';}
  function isRiskAdmin(){var r=role(),u=window.currentUser||{};return u.login==='admin_riesgos'||r==='operativo'||r==='admin_riesgos'||r.indexOf('administrador de riesgos')>=0||r==='admin riesgos';}
  function isEvaluator(){var r=role(),u=window.currentUser||{};return u.login==='evaluador'||u.login==='evaluador_colpensiones'||r==='evaluador'||r==='cliente';}
  function entityKey(v){var s=low(v).replace(/[^a-z0-9]/g,'');if(!s)return '';if(s==='cliente1'||s.indexOf('colpensiones')>=0)return 'colpensiones';return s;}
  function userEntity(){var u=window.currentUser||{},e=entityKey(u.entidad||u.entidadId||u.organizacion);if(!e&&(isRiskAdmin()||isEvaluator()))e='colpensiones';return e;}
  function entityAllowed(t){if(isIS())return true;var ue=userEntity();if(!ue)return true;var te=entityKey(t&&(t.entidad||t.entidadId||t.entidadLabel||t.NombreEntidad||t.organizacion));return !te?(ue==='colpensiones'):te===ue;}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato||c.contrato));}
  function contracts(t){return Array.isArray(t&&t.contratos)?t.contratos:[];}
  function firstDate(t,key){
    var direct=key==='start'?(t.finicio||t.fechaInicio||t.FechaInicioContrato):(t.fterm||t.fechaFin||t.FechaTerminacionContrato);if(direct)return norm(direct).slice(0,10);
    var c=contracts(t)[0]||{};var v=key==='start'?(c.inicio||c.fechaInicio||c.finicio||c.FechaInicio):(c.fin||c.fechaFin||c.fterm||c.FechaTerminacion);return v?norm(v).slice(0,10):'—';
  }
  function displayEntity(t){var e=entityKey(t&&(t.entidad||t.entidadLabel||t.NombreEntidad));if(e==='colpensiones'||(!e&&!isIS()))return 'Colpensiones';return norm(t&&(t.entidadLabel||t.NombreEntidad||t.entidad))||'—';}
  function riskInfo(t){
    var p=parseFloat(t&&t.prom);var z=norm(t&&(t.zona||t.nivel_riesgo||t.Zona_Riesgo));
    if((isNaN(p)||!z)&&t&&t.promPorContrato&&typeof t.promPorContrato==='object'){
      var vals=Object.values(t.promPorContrato).filter(Boolean),best=null;
      vals.forEach(function(x){var xp=parseFloat(x.prom);if(!isNaN(xp)&&(!best||xp>best.p))best={p:xp,z:norm(x.zona)};});
      if(best){if(isNaN(p))p=best.p;if(!z)z=best.z;}
    }
    if(isNaN(p))return {p:null,z:z||'Sin clasificar'};
    if(!z)z=p>=4?'EXTREMO':p>=3?'ALTO':p>=2?'MODERADO':'BAJO';return {p:p,z:z};
  }
  function localSave(){
    try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}
    try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');s.TERCEROS_DB=db();localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e2){}
  }
  function mergeBasic(row){
    var nit=norm(row&&(row.nit||row.NIT));if(!nit)return null;var t=db()[nit]||{};
    t.nit=nit;var name=norm(row.nombre||row.Nombre_Tercero||row.NombreTercero);if(name)t.nombre=name;
    var dom=row.domicilio!=null?row.domicilio:row.Domicilio;if(dom!=null&&norm(dom))t.domicilio=dom;
    var serv=norm(row.servicio_contratado||row.Servicio_Contratado||row.ServicioContratado||row.servicio);if(serv){t.servicio_contratado=serv;if(!t.servicio)t.servicio=serv;}
    if(row.entidad||row.NombreEntidad)t.entidad=row.entidad||row.NombreEntidad;
    db()[nit]=t;return t;
  }
  function mergeState(row){
    var nit=norm(row&&(row.nit||row.NIT));if(!nit)return null;var st=row&&row.estado_sgrt&&typeof row.estado_sgrt==='object'?clone(row.estado_sgrt):{};var old=db()[nit]||{};
    // El estado extendido manda, pero conservamos campos básicos que el payload antiguo pudiera no traer.
    var t=Object.assign({},old,st);t.nit=nit;t.nombre=t.nombre||old.nombre||nit;t.domicilio=t.domicilio||old.domicilio||'';t.servicio=t.servicio||old.servicio||t.servicio_contratado||old.servicio_contratado||'';
    if(!t.entidad&&!isIS())t.entidad=userEntity()||'colpensiones';db()[nit]=t;return t;
  }
  async function hydrate(force){
    var now=Date.now();if(!force&&now-lastLoad<2500)return {ok:true,cached:true};if(loading)return loading;
    loading=(async function(){
      try{
        var pair=await Promise.all([
          fetch(apiBase()+'/api/terceros',{headers:{'Accept':'application/json'},cache:'no-store'}),
          fetch(apiBase()+'/api/sgrt-state',{headers:{'Accept':'application/json'},cache:'no-store'})
        ]);
        var basic=await pair[0].json().catch(function(){return{data:[]};}),state=await pair[1].json().catch(function(){return{data:[]};});
        if(pair[0].ok&&basic.ok&&Array.isArray(basic.data))basic.data.forEach(mergeBasic);
        if(pair[1].ok&&state.ok&&Array.isArray(state.data))state.data.forEach(mergeState);
        // Reaplicar el maestro al final: domicilio/nombre/servicio registrados en SQL
        // no deben desaparecer por un estado extendido antiguo.
        if(pair[0].ok&&basic.ok&&Array.isArray(basic.data))basic.data.forEach(mergeBasic);
        localSave();lastLoad=Date.now();return {ok:true,count:Object.keys(db()).length};
      }catch(e){console.warn('[SGRT42] No se pudo refrescar Azure:',e.message);return {ok:false,error:e.message};}
      finally{loading=null;}
    })();return loading;
  }

  function renderAdminThirds(){
    if(!isRiskAdmin())return false;var body=document.getElementById('ig-tbody-terceros');if(!body)return false;
    var table=body.closest('table'),head=table&&table.querySelector('thead');if(head)head.innerHTML='<tr><th>NIT</th><th>Nombre</th><th>Domicilio</th><th>Organización</th><th>F. Inicio</th><th>F. Término</th><th>Criticidad</th><th>Exposición al Riesgo</th><th>Acciones</th></tr>';
    var entries=Object.values(db()).filter(function(t){return t&&norm(t.nit||t.NIT)&&entityAllowed(t);}).sort(function(a,b){return norm(a.nombre||a.Nombre_Tercero||a.nit).localeCompare(norm(b.nombre||b.Nombre_Tercero||b.nit),'es');});
    body.innerHTML=entries.length?entries.map(function(t){
      var nit=norm(t.nit||t.NIT),name=norm(t.nombre||t.Nombre_Tercero)||nit,ri=riskInfo(t),cc=ri.p===null?'':(ri.p>=4?'c-crit':ri.p>=3?'c-alto':'c-bajo');
      return '<tr data-nit="'+esc(nit)+'"><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+esc(nit)+'</td><td style="font-size:12.5px;font-weight:700;">'+esc(name)+'</td><td style="font-size:11px;">'+esc(norm(t.domicilio||t.Domicilio)||'—')+'</td><td style="font-size:11px;">'+esc(displayEntity(t))+'</td><td style="font-size:11px;">'+esc(firstDate(t,'start'))+'</td><td style="font-size:11px;">'+esc(firstDate(t,'end'))+'</td><td><span class="chip '+cc+'" style="font-size:10px;">'+(ri.p===null?'—':ri.p.toFixed(2))+'</span></td><td><span class="chip '+cc+'" style="font-size:10px;">'+esc(ri.z)+'</span></td><td style="white-space:nowrap;"><button class="btn btn-outline btn-xs" onclick="verDetalleTercero(\''+esc(nit)+'\')">Ver detalle</button> <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+esc(nit)+'\');},120)">Documentos</button></td></tr>';
    }).join(''):'<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">No hay terceros registrados para esta entidad.</td></tr>';
    try{if(typeof window.filterIGTerceros==='function')window.filterIGTerceros();}catch(e){}
    return true;
  }
  function scopeThirdSelect(id){
    if(isIS())return;var sel=document.getElementById(id);if(!sel||!sel.options)return;
    Array.from(sel.options).forEach(function(o){var nit=norm(o.value),t=nit&&db()[nit];if(t&&!entityAllowed(t))o.remove();});
  }
  function refreshSelectors(){
    try{window._poblarSelectorTerceroClasificar&&window._poblarSelectorTerceroClasificar();}catch(e){}
    try{window.renderCtrlTerceros&&window.renderCtrlTerceros();}catch(e2){}
    try{window.acPoblarSelectorTerceroInstruc&&window.acPoblarSelectorTerceroInstruc();}catch(e3){}
    try{window.renderAprobarOp&&window.renderAprobarOp();}catch(e4){}
    ['ctrl-terc-sel','cls-tip-tercero-sel','ac-tercero-instruc','q-tercero','mz-fil-tercero','ev-fil-tercero'].forEach(scopeThirdSelect);
  }
  async function refreshAdmin(force){await hydrate(force);renderAdminThirds();refreshSelectors();}
  window.sgrt42RefrescarRegistrosAdmin=function(){return refreshAdmin(true);};

  var oldIG=window.loadIGTercerosFull;
  window.loadIGTercerosFull=function(){
    if(isRiskAdmin()){
      // Pinta lo disponible inmediatamente y luego confirma/refresca desde Azure.
      renderAdminThirds();refreshAdmin(false);return;
    }
    var r=typeof oldIG==='function'?oldIG.apply(this,arguments):undefined;
    if(isEvaluator())hydrate(false).then(function(){try{typeof oldIG==='function'&&oldIG();}catch(e){}});
    return r;
  };
  window.renderIGTerceros=function(){return window.loadIGTercerosFull();};

  // Cuando el estado remoto termina de cargarse, repintar la tabla del Administrador.
  var oldServerLoad=window.sgrtCargarDesdeServidor;
  if(typeof oldServerLoad==='function')window.sgrtCargarDesdeServidor=async function(){var r=await oldServerLoad.apply(this,arguments);if(isRiskAdmin()){renderAdminThirds();refreshSelectors();}return r;};

  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){if(isRiskAdmin())refreshAdmin(true);},850);setTimeout(function(){if(isRiskAdmin())refreshAdmin(false);},3000);});
  window.addEventListener('focus',function(){if(isRiskAdmin())setTimeout(function(){refreshAdmin(false);},120);});
})();


/*
 * SGRT — Ajuste 42-C (2026-09-19)
 * SOLO añade/corrige:
 * 1) Informes Word/PPT prácticos con membrete y datos reales del SGRT.
 * 2) IA SGRT tipo chat, multi-turno, con archivos y reuniones vía backend /api/ai/*.
 * 3) Refuerzo de refresco de Terceros Registrados desde Azure al entrar al módulo.
 * Mantiene intactos los demás módulos, estructura, carpetas, evidencias y flujos.
 */
(function(){
  'use strict';

  var ASSET='assets/reportes/';
  var chatHistory=[];
  try{chatHistory=JSON.parse(sessionStorage.getItem('sgrt_ai_history')||'[]');if(!Array.isArray(chatHistory))chatHistory=[];}catch(e){chatHistory=[];}

  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function apiBase(){return String(window.API_BASE_URL||window.API_BASE||'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net').replace(/\/$/,'');}
  function toast(t,type,ms){try{window.showToast&&window.showToast(t,type||'info',ms||2800);}catch(e){}}
  function role(){return low((window.currentUser||{}).rol);}
  function isIS(){var u=window.currentUser||{},r=role();return u.login==='iseguras2026'||r==='is'||r==='iseguras'||r==='superadministrador'||r==='super administrador';}
  function entityKey(v){var s=low(v).normalize?low(v).normalize('NFD').replace(/[\u0300-\u036f]/g,''):low(v);s=s.replace(/[^a-z0-9]/g,'');if(!s)return '';if(s==='cliente1'||s.indexOf('colpensiones')>=0)return 'colpensiones';return s;}
  function userEntity(){var u=window.currentUser||{},e=entityKey(u.entidad||u.entidadId||u.organizacion);if(!e&&!isIS())e='colpensiones';return e;}
  function thirdEntity(t){return entityKey(t&&(t.entidad||t.entidadId||t.entidadLabel||t.NombreEntidad||t.organizacion));}
  function entityName(v){var k=entityKey(v);if(k==='colpensiones')return 'Colpensiones';return norm(v)||'Entidad';}
  function canonContract(v){var s=norm(v);if(/^\d+$/.test(s)){var n=parseInt(s,10);return isNaN(n)?s:String(n);}return low(s);}
  function contractNum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato||c.contrato));}
  function mapKey(map,c){if(!map||typeof map!=='object')return '';var cc=canonContract(c),ks=Object.keys(map);for(var i=0;i<ks.length;i++)if(canonContract(ks[i])===cc)return ks[i];return '';}
  function exactDims(t,c){
    if(!t||!c)return [];
    var k=mapKey(t.dimsPorContrato,c),arr=k&&t.dimsPorContrato[k];
    if(!Array.isArray(arr)){k=mapKey(t.tipologiasPorContrato,c);arr=k&&t.tipologiasPorContrato[k];}
    // Compatibilidad SOLO si históricamente existe un único contrato.
    if(!Array.isArray(arr)&&(t.contratos||[]).length<=1&&Array.isArray(t.dims))arr=t.dims;
    return Array.isArray(arr)?clone(arr):[];
  }
  function exactResponses(t,c){
    var maps=[t&&t.respuestasACPorContrato,t&&t.respuestasPorContrato,t&&t._respuestasACPorContrato,t&&t.respuestasCuestionarioPorContrato];
    for(var i=0;i<maps.length;i++){var m=maps[i],k=mapKey(m,c);if(k&&m[k]&&typeof m[k]==='object')return m[k];}
    return {};
  }
  function answerText(a){
    if(a==null)return 'Pendiente';
    if(typeof a==='string'||typeof a==='number'||typeof a==='boolean')return norm(a)||'Pendiente';
    var x=norm(a.respuesta||a.valor||a.value||a.estado||a.resp||a.seleccion||a.opcion||a.answer);
    if(x)return x;if(a.si===true)return 'Sí';if(a.no===true)return 'No';if(a.na===true||a.noAplica===true)return 'No aplica';return 'Pendiente';
  }
  function dimName(d){return norm(d&&(d.nombre||d.name||d.tipologia||d.key))||'Dimensión';}
  function promContract(t,c){var dims=exactDims(t,c),vals=dims.map(function(d){var v=parseFloat(d&&((d.val!==undefined)?d.val:(d.calificacion!==undefined?d.calificacion:d.nivel)));return isNaN(v)?null:v;}).filter(function(v){return v!==null;});if(!vals.length)return null;return vals.reduce(function(a,b){return a+b;},0)/vals.length;}
  function zoneContract(t,c){var p=promContract(t,c);if(p===null||isNaN(p))return '';return p>=4?'EXTREMO':p>=3?'ALTO':p>=2?'MODERADO':'BAJO';}

  function chosenEntity(){
    if(!isIS())return userEntity();
    var x=document.getElementById('sgrt42-entity');return entityKey(x&&x.value)||'';
  }
  function chosenThird(){var x=document.getElementById('sgrt42-third');return norm(x&&x.value);}
  function chosenContract(){var x=document.getElementById('sgrt42-contract');return norm(x&&x.value);}

  function allowedThird(t){var e=chosenEntity();if(!e)return true;var te=thirdEntity(t);return te?te===e:(e==='colpensiones');}
  function collectReport(){
    var third=chosenThird(),contract=chosenContract(),rows=[],thirds=[],contractsSeen={};
    Object.keys(db()).forEach(function(nit){
      var t=db()[nit]||{};if(!allowedThird(t))return;if(third&&nit!==third)return;
      thirds.push(t);
      var cons=(t.contratos||[]).map(contractNum).filter(Boolean);
      Object.keys(t.dimsPorContrato||{}).forEach(function(c){if(!cons.some(function(x){return canonContract(x)===canonContract(c);}))cons.push(c);});
      Object.keys(t.tipologiasPorContrato||{}).forEach(function(c){if(!cons.some(function(x){return canonContract(x)===canonContract(c);}))cons.push(c);});
      if(!cons.length&&Array.isArray(t.dims)&&t.dims.length)cons=['Sin contrato'];
      cons.forEach(function(c){
        if(contract&&canonContract(c)!==canonContract(contract))return;
        contractsSeen[nit+'|'+c]=1;
        var dims=exactDims(t,c),resp=exactResponses(t,c),p=promContract(t,c),z=zoneContract(t,c);
        dims.forEach(function(d){
          var key=norm(d.key||d.id||dimName(d)),qs=[];
          try{if(typeof window._ctrlsCuest==='function')qs=window._ctrlsCuest(nit,d.key,c)||[];}catch(e){}
          if(!qs.length){var rr=resp[d.key]||resp[key]||{};qs=Object.keys(rr||{}).map(function(k){return {n:k,ctrl:'Control '+k};});}
          if(!qs.length){rows.push({nit:nit,tercero:t.nombre||nit,contrato:c,dimension:dimName(d),pregunta:'Sin preguntas activas registradas',respuesta:'Pendiente',observacion:'',promedio:p,zona:z});return;}
          qs.forEach(function(q){var rr=resp[d.key]||resp[key]||{},a=rr[q.n]||rr[String(q.n)]||{};rows.push({nit:nit,tercero:t.nombre||nit,contrato:c,dimension:dimName(d),pregunta:q.ctrl||q.req||q.pregunta||('Control '+q.n),respuesta:answerText(a),observacion:norm(a.obs||a.observacion||a.comentario||''),promedio:p,zona:z});});
        });
      });
    });
    var risks=(window.MATRIZ_DB||[]).filter(function(r){
      var nit=norm(r&&r.nit),t=db()[nit]||{};if(nit&&t&&!allowedThird(t))return false;
      if(third&&nit!==third&&norm(r.tercero)!==norm((db()[third]||{}).nombre))return false;
      if(contract&&canonContract(r.contrato)!==canonContract(contract))return false;
      return true;
    }).map(clone);
    return {rows:rows,risks:risks,thirds:thirds,contracts:Object.keys(contractsSeen).length,generated:new Date(),entity:chosenEntity()||userEntity()||'',third:third,contract:contract};
  }
  window.sgrt42CollectReport=collectReport;

  function dimsSummary(data){
    var m={};data.rows.forEach(function(r){var k=r.nit+'|'+r.contrato+'|'+r.dimension;if(!m[k])m[k]={nit:r.nit,tercero:r.tercero,contrato:r.contrato,dimension:r.dimension,total:0,done:0,yes:0,no:0,na:0,obs:[],promedio:r.promedio,zona:r.zona};var x=m[k],a=low(r.respuesta);x.total++;if(a&&a!=='pendiente'&&a!=='sin respuesta')x.done++;if(a==='sí'||a==='si'||a==='yes')x.yes++;else if(a==='no')x.no++;else if(a.indexOf('no aplica')>=0||a==='na'||a==='n/a')x.na++;if(r.observacion&&x.obs.length<4)x.obs.push(r.observacion);});return Object.values(m);
  }
  function actions(data){
    var out=[];dimsSummary(data).forEach(function(d){var pct=d.total?Math.round(100*d.done/d.total):0;if(pct<100)out.push(d.tercero+' · contrato '+d.contrato+' · '+d.dimension+': completar '+(100-pct)+'% pendiente.');if(d.no)out.push(d.tercero+' · '+d.dimension+': analizar '+d.no+' respuesta(s) No y formalizar acción correctiva/mitigación.');});
    data.risks.forEach(function(r){var z=norm(r.zonaRes||r.zonaResidual||r.zonaInh||r.zonaInherente).toUpperCase();if(z.indexOf('ALTO')>=0||z.indexOf('EXTREMO')>=0||z.indexOf('CRIT')>=0)out.push((r.id||r.riesgoId||'Riesgo')+' · '+(r.tercero||r.nit||'')+': revisar tratamiento, responsable, fecha objetivo y evidencia de cierre.');});
    return Array.from(new Set(out)).slice(0,18);
  }
  window.sgrt42PendingActions=actions;

  function deterministicNarrative(data){
    var ds=dimsSummary(data),done=ds.reduce(function(a,x){return a+x.done;},0),total=ds.reduce(function(a,x){return a+x.total;},0),no=ds.reduce(function(a,x){return a+x.no;},0),pct=total?Math.round(100*done/total):0;
    return 'El corte presenta '+data.thirds.length+' tercero(s), '+data.contracts+' contrato(s) y '+ds.length+' dimensión(es) de control con información disponible. El avance global de diligenciamiento es '+pct+'%. Se registran '+no+' respuesta(s) "No" y '+data.risks.length+' riesgo(s) en la matriz. La priorización debe concentrarse en completar pendientes, documentar soportes y cerrar los tratamientos asociados a hallazgos y riesgos de mayor exposición.';
  }
  async function aiNarrative(data,what){
    var compact={entidad:entityName(data.entity),terceros:data.thirds.map(function(t){return {nit:t.nit,nombre:t.nombre};}).slice(0,25),dimensiones:dimsSummary(data).slice(0,40),riesgos:data.risks.slice(0,30).map(function(r){return {id:r.id||r.riesgoId,tercero:r.tercero||r.nit,contrato:r.contrato,descripcion:r.desc||r.descripcion,zonaInherente:r.zonaInh||r.zonaInherente,zonaResidual:r.zonaRes||r.zonaResidual,tratamiento:r.tratamiento||r.plan};})};
    var prompt=(what||'Redacta el resumen ejecutivo y conclusiones del informe.')+'\nMáximo 650 palabras. Mantén un tono de informe corporativo y práctico. No digas que eres una IA. No inventes datos. Separa en: RESUMEN EJECUTIVO, HALLAZGOS PRINCIPALES, CONCLUSIONES Y RECOMENDACIONES.';
    var r=await fetch(apiBase()+'/api/ai/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:prompt,context:compact,history:[]})}),j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return norm(j.text);
  }

  function loadScript(src,test){return new Promise(function(resolve,reject){if(test())return resolve(true);var s=document.createElement('script');s.src=src;s.async=true;s.onload=function(){test()?resolve(true):reject(new Error('Librería no disponible'));};s.onerror=function(){reject(new Error('No se pudo cargar '+src));};document.head.appendChild(s);});}
  async function fetchBytes(path){var r=await fetch(path);if(!r.ok)throw new Error('No se pudo cargar '+path);return new Uint8Array(await r.arrayBuffer());}
  async function fetchDataUri(path){var r=await fetch(path);if(!r.ok)throw new Error('No se pudo cargar '+path);var b=await r.blob();return await new Promise(function(resolve,reject){var fr=new FileReader();fr.onload=function(){resolve(fr.result);};fr.onerror=reject;fr.readAsDataURL(b);});}
  function useAI(){var x=document.getElementById('sgrt42-use-ai');return !!(x&&x.checked);}

  function docCell(d,text,bold,fill){return new d.TableCell({shading:fill?{fill:fill}:undefined,children:[new d.Paragraph({children:[new d.TextRun({text:String(text==null?'':text),bold:!!bold,size:18})]})]});}
  function docTable(d,headers,rows){var rr=[new d.TableRow({children:headers.map(function(h){return docCell(d,h,true,'D9EAF7');})})];rows.forEach(function(row){rr.push(new d.TableRow({children:row.map(function(v){return docCell(d,v,false);})}));});return new d.Table({rows:rr,width:{size:100,type:d.WidthType.PERCENTAGE}});}

  async function refreshReportSource(){
    try{
      if(typeof window.sgrt42RefrescarRegistrosAdmin==='function'&&/admin_riesgos|operativo|administrador de riesgos/i.test(role())){await window.sgrt42RefrescarRegistrosAdmin();return;}
      if(typeof window.sgrtCargarDesdeServidor==='function')await window.sgrtCargarDesdeServidor({forceServer:true,silentUi:true});
    }catch(e){console.warn('[SGRT42 report refresh]',e.message);}
  }

  window.sgrtGenerarWordFinal=async function(customInstruction){
    await refreshReportSource();
    var data=collectReport(),ds=dimsSummary(data);if(!ds.length&&!data.risks.length){toast('No hay información registrada para generar el informe.','warning');return;}
    toast('Preparando informe Word…','info');var narrative=deterministicNarrative(data),custom=norm(customInstruction);
    if(useAI())try{narrative=await aiNarrative(data,(custom?('Solicitud específica del usuario: '+custom+'\n'):'')+'Redacta el contenido ejecutivo para un informe mensual/ejecutivo de evaluación del ambiente de control y análisis de riesgos. Usa un estilo práctico similar a un informe de seguimiento contractual: objetivo, actividades/resultados, riesgos y barreras, conclusiones y recomendaciones.');}catch(e){toast('La IA no respondió; el Word se generará con análisis automático del sistema.','warning',4200);}
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js',function(){return !!window.docx;});
      var d=window.docx,top=await fetchBytes(ASSET+'membrete_superior.png'),bottom=await fetchBytes(ASSET+'membrete_inferior.jpg'),colp=await fetchBytes(ASSET+'logo_colpensiones.png').catch(function(){return null;});
      var ent=entityName(data.entity),today=data.generated.toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'}),title='INFORME DE EVALUACIÓN DEL AMBIENTE DE CONTROL Y GESTIÓN DE RIESGOS DE TERCEROS';
      var dimRows=ds.map(function(x){return [x.tercero,x.contrato,x.dimension,(x.total?Math.round(100*x.done/x.total):0)+'%',x.yes,x.no,x.na,x.zona||'—'];});
      var riskRows=data.risks.map(function(r){return [r.id||r.riesgoId||'—',r.tercero||r.nit||'—',r.contrato||'—',norm(r.desc||r.descripcion).slice(0,220),r.zonaInh||r.zonaInherente||'—',r.zonaRes||r.zonaResidual||'—',norm(r.tratamiento||r.plan||'').slice(0,180)||'—'];});
      var pending=data.rows.filter(function(r){var a=low(r.respuesta);return a==='no'||a==='pendiente'||a==='sin respuesta';}).slice(0,80).map(function(r){return [r.tercero,r.contrato,r.dimension,r.pregunta,r.respuesta,r.observacion||'—'];});
      var recs=actions(data);
      var children=[
        new d.Paragraph({alignment:d.AlignmentType.CENTER,spacing:{before:900,after:240},children:[new d.TextRun({text:title,bold:true,size:30,color:'173B5F'})]}),
        new d.Paragraph({alignment:d.AlignmentType.CENTER,spacing:{after:180},children:[new d.TextRun({text:ent.toUpperCase(),bold:true,size:24})]}),
        data.third?new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:'Tercero: '+((db()[data.third]||{}).nombre||data.third),size:22})]}):new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:'Consolidado de terceros',size:22})]}),
        data.contract?new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:'Contrato: '+data.contract,size:21})]}):new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.TextRun({text:'Contratos incluidos: '+data.contracts,size:21})]}),
        new d.Paragraph({alignment:d.AlignmentType.CENTER,spacing:{before:500},children:[new d.TextRun({text:'Infraestructuras Seguras S.A.S. · '+today,size:20})]}),
        new d.Paragraph({children:[new d.PageBreak()]}),
        new d.Paragraph({text:'1. OBJETIVO',heading:d.HeadingLevel.HEADING_1}),
        new d.Paragraph({text:'Presentar de forma consolidada y verificable los resultados registrados en el SGRT sobre las dimensiones de control, respuestas de evaluación, hallazgos y riesgos asociados a los terceros y contratos incluidos en el corte.'}),
        new d.Paragraph({text:'2. RESUMEN EJECUTIVO',heading:d.HeadingLevel.HEADING_1}),
        new d.Paragraph({text:narrative}),
        new d.Paragraph({text:'3. ACTIVIDADES REALIZADAS Y RESULTADOS DEL AMBIENTE DE CONTROL',heading:d.HeadingLevel.HEADING_1}),
        docTable(d,['Tercero','Contrato','Dimensión','Avance','Sí','No','N/A','Exposición'],dimRows),
        new d.Paragraph({text:'4. RIESGOS Y BARRERAS / PENDIENTES DE CONTROL',heading:d.HeadingLevel.HEADING_1}),
        pending.length?docTable(d,['Tercero','Contrato','Dimensión','Control / pregunta','Estado','Observación'],pending):new d.Paragraph({text:'No se identificaron respuestas No o pendientes en el filtro actual.'}),
        new d.Paragraph({text:'5. ANÁLISIS DE RIESGOS',heading:d.HeadingLevel.HEADING_1}),
        riskRows.length?docTable(d,['ID','Tercero','Contrato','Riesgo','Inherente','Residual','Tratamiento'],riskRows):new d.Paragraph({text:'No existen riesgos registrados para el filtro actual.'}),
        new d.Paragraph({text:'6. PRÓXIMAS ACTIVIDADES, CONCLUSIONES Y RECOMENDACIONES',heading:d.HeadingLevel.HEADING_1})
      ];
      (recs.length?recs:['Mantener el seguimiento periódico de controles, evidencias y tratamientos registrados.']).forEach(function(x){children.push(new d.Paragraph({text:'• '+x}));});
      children.push(new d.Paragraph({text:'7. CONTROL DEL INFORME',heading:d.HeadingLevel.HEADING_1}));
      children.push(docTable(d,['Campo','Valor'],[['Entidad',ent],['Fecha de corte',today],['Terceros incluidos',data.thirds.length],['Contratos incluidos',data.contracts],['Dimensiones evaluadas',ds.length],['Riesgos registrados',data.risks.length],['Fuente','SGRT · registros persistidos y sincronizados']]));
      var doc=new d.Document({sections:[{properties:{page:{margin:{top:1050,right:850,bottom:900,left:850}}},headers:{default:new d.Header({children:[new d.Paragraph({children:[new d.ImageRun({data:top,transformation:{width:650,height:102}})]})]})},footers:{default:new d.Footer({children:[new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.ImageRun({data:bottom,transformation:{width:600,height:67}})]})]})},children:children}]});
      var blob=await d.Packer.toBlob(doc),a=document.createElement('a');a.href=URL.createObjectURL(blob);var name=(data.third?((db()[data.third]||{}).nombre||data.third):ent).replace(/[^a-z0-9_-]+/gi,'_');a.download='SGRT_Informe_'+name+'_'+new Date().toISOString().slice(0,10)+'.docx';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},2000);toast('Informe Word generado con la plantilla corporativa.','success');
    }catch(e){console.error('[SGRT42 Word]',e);toast('No se pudo generar el Word: '+e.message,'error',6000);}
  };

  window.sgrtGenerarPowerPointFinal=async function(customInstruction){
    await refreshReportSource();
    var data=collectReport(),ds=dimsSummary(data);if(!ds.length&&!data.risks.length){toast('No hay información registrada para generar la presentación.','warning');return;}
    toast('Preparando presentación ejecutiva…','info');var narrative=deterministicNarrative(data),custom=norm(customInstruction);
    if(useAI())try{narrative=await aiNarrative(data,(custom?('Solicitud específica del usuario: '+custom+'\n'):'')+'Redacta un resumen ejecutivo muy concreto para una presentación de seguimiento contractual. Organiza en actividades realizadas, avance, riesgos y barreras y próximas actividades. No uses frases promocionales ni menciones IA.');}catch(e){toast('El servicio de redacción no respondió; se usará el resumen calculado por SGRT.','warning',3800);}
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js',function(){return !!(window.pptxgen||window.PptxGenJS);});
      var C=window.pptxgen||window.PptxGenJS,pptx=new C();pptx.layout='LAYOUT_WIDE';pptx.author='Infraestructuras Seguras S.A.S.';pptx.subject='SGRT';pptx.title='Informe Ejecutivo SGRT';
      var coverBg=await fetchDataUri(ASSET+'ppt_portada_original.png'),contentBg=await fetchDataUri(ASSET+'ppt_contenido_original.png');
      function contentSlide(title,sub){var s=pptx.addSlide();s.addImage({data:contentBg,x:0,y:0,w:13.333,h:7.5});s.addText(title,{x:3.72,y:.72,w:8.35,h:.45,fontFace:'Arial',fontSize:21,bold:true,color:'173B5F',margin:0});if(sub)s.addText(sub,{x:3.74,y:1.15,w:8.2,h:.3,fontFace:'Arial',fontSize:10.5,color:'64748B',margin:0});return s;}
      var ent=entityName(data.entity),thirdName=data.third?((db()[data.third]||{}).nombre||data.third):'Consolidado de terceros',date=data.generated.toLocaleDateString('es-CO');
      var cover=pptx.addSlide();cover.addImage({data:coverBg,x:0,y:0,w:13.333,h:7.5});cover.addText('SERVICIOS ESPECIALIZADOS PARA LA EVALUACIÓN DEL AMBIENTE DE CONTROL DE TERCEROS',{x:1.05,y:1.35,w:11.2,h:1.0,fontFace:'Arial',fontSize:24,bold:true,color:'FFFFFF',align:'center',valign:'mid',margin:.04});cover.addText(thirdName,{x:1.35,y:3.05,w:10.6,h:.72,fontFace:'Arial',fontSize:28,bold:true,color:'FFFFFF',align:'center',margin:0});cover.addText((data.contract?'Contrato '+data.contract+' · ':'')+ent+' · '+date,{x:1.55,y:4.15,w:10.2,h:.45,fontFace:'Arial',fontSize:14,color:'E5F5FF',align:'center',margin:0});cover.addText('Infraestructuras Seguras S.A.S.',{x:1.6,y:6.25,w:10.1,h:.35,fontFace:'Arial',fontSize:12,bold:true,color:'FFFFFF',align:'center',margin:0});
      var sc=contentSlide('Contenidos','Informe generado a partir de los registros del SGRT');sc.addText(['Actividades realizadas','Estado de avance','Evaluación del ambiente de control','Análisis de riesgos','Próximas actividades','Riesgos y barreras'].map(function(x,i){return {text:(i+1)+'. '+x,options:{breakLine:true}};}),{x:4.1,y:1.8,w:7.1,h:3.8,fontFace:'Arial',fontSize:18,color:'173B5F',margin:.05,paraSpaceAfterPt:12});
      var sa=contentSlide('Actividades realizadas','Resumen del corte actual');sa.addText(narrative,{x:3.9,y:1.7,w:8.0,h:4.6,fontFace:'Arial',fontSize:13,color:'334E68',valign:'top',margin:.08,breakLine:false});
      var sv=contentSlide('Estado de avance','Terceros, contratos y dimensiones con información registrada');
      var done=ds.reduce(function(a,x){return a+x.done;},0),total=ds.reduce(function(a,x){return a+x.total;},0),pct=total?Math.round(done*100/total):0;
      sv.addTable([['Indicador','Resultado'],['Terceros incluidos',String(data.thirds.length)],['Contratos incluidos',String(data.contracts)],['Dimensiones habilitadas',String(ds.length)],['Avance de diligenciamiento',pct+'%'],['Riesgos registrados',String(data.risks.length)]],{x:4.0,y:1.7,w:7.7,h:3.7,border:{type:'solid',color:'C9D8E6',pt:.7},fill:'FFFFFF',fontFace:'Arial',fontSize:13,color:'243B53',rowH:.52,margin:.07});
      for(var i=0;i<ds.length;i+=6){var chunk=ds.slice(i,i+6),sd=contentSlide('Evaluación del ambiente de control','Resultados por dimensión de control');var table=[['Tercero','Contrato','Dimensión','Avance','Sí','No','N/A']].concat(chunk.map(function(x){return [x.tercero,x.contrato,x.dimension,(x.total?Math.round(100*x.done/x.total):0)+'%',String(x.yes),String(x.no),String(x.na)];}));sd.addTable(table,{x:3.62,y:1.55,w:9.25,h:4.9,border:{type:'solid',color:'D7E2EC',pt:.55},fill:'FFFFFF',fontFace:'Arial',fontSize:8.7,color:'243B53',rowH:.43,margin:.04,bold:false});}
      if(data.risks.length){for(var j=0;j<data.risks.length;j+=6){var rr=data.risks.slice(j,j+6),sr=contentSlide('Análisis de riesgos','Riesgo inherente, residual y tratamiento');var rt=[['ID','Tercero','Contrato','Riesgo','Inherente','Residual']].concat(rr.map(function(r){return [r.id||r.riesgoId||'—',r.tercero||r.nit||'—',r.contrato||'—',norm(r.desc||r.descripcion).slice(0,100),r.zonaInh||r.zonaInherente||'—',r.zonaRes||r.zonaResidual||'—'];}));sr.addTable(rt,{x:3.62,y:1.55,w:9.25,h:4.9,border:{type:'solid',color:'D7E2EC',pt:.55},fill:'FFFFFF',fontFace:'Arial',fontSize:8.4,color:'243B53',rowH:.48,margin:.04});}}else{var sr0=contentSlide('Análisis de riesgos','Estado del filtro actual');sr0.addText('No existen riesgos registrados para el tercero/contrato seleccionado.',{x:4.1,y:2.15,w:7.2,h:.8,fontFace:'Arial',fontSize:17,color:'52677B',margin:0});}
      var recs=actions(data),sp=contentSlide('Próximas actividades','Acciones derivadas de los registros del SGRT');sp.addText((recs.length?recs:['Mantener el seguimiento periódico de controles, evidencias y tratamientos.']).slice(0,9).map(function(x,n){return {text:(n+1)+'. '+x,options:{breakLine:true}};}),{x:4.0,y:1.65,w:7.8,h:4.65,fontFace:'Arial',fontSize:13,color:'334E68',margin:.05,paraSpaceAfterPt:7});
      var barriers=dimsSummary(data).filter(function(x){return x.no>0||x.done<x.total;}).slice(0,8),sb=contentSlide('Riesgos y barreras','Pendientes que requieren seguimiento');if(barriers.length){sb.addTable([['Tercero','Contrato','Dimensión','Pendiente']].concat(barriers.map(function(x){return [x.tercero,x.contrato,x.dimension,(x.no?x.no+' respuesta(s) No. ':'')+(x.done<x.total?(x.total-x.done)+' control(es) pendiente(s).':'')];})),{x:3.8,y:1.65,w:8.6,h:4.55,border:{type:'solid',color:'D7E2EC',pt:.55},fill:'FFFFFF',fontFace:'Arial',fontSize:9.5,color:'243B53',rowH:.48,margin:.04});}else sb.addText('No se identificaron barreras o controles pendientes en el filtro actual.',{x:4.05,y:2.1,w:7.5,h:.7,fontFace:'Arial',fontSize:16,color:'52677B',margin:0});
      var fn=(data.third?((db()[data.third]||{}).nombre||data.third):entityName(data.entity)).replace(/[^a-z0-9_-]+/gi,'_');await pptx.writeFile({fileName:'SGRT_Presentacion_'+fn+'_'+new Date().toISOString().slice(0,10)+'.pptx'});toast('PowerPoint generado con la plantilla corporativa suministrada.','success');
    }catch(e){console.error('[SGRT42 PPT]',e);toast('No se pudo generar PowerPoint: '+e.message,'error',6000);}
  };

  function entities(){var m={};Object.values(db()).forEach(function(t){var k=thirdEntity(t)||'colpensiones';m[k]=m[k]||entityName(t.entidad||t.entidadLabel||k);});try{(window.getISEntidades&&window.getISEntidades()||[]).forEach(function(e){var k=entityKey(e.id||e.nombre);if(k)m[k]=e.nombre||e.id;});}catch(e){}return Object.keys(m).map(function(k){return {id:k,name:m[k]};});}
  function fillFilters(){
    var es=document.getElementById('sgrt42-entity'),ts=document.getElementById('sgrt42-third'),cs=document.getElementById('sgrt42-contract');if(!ts||!cs)return;
    if(es){var cur=es.value;es.innerHTML='<option value="">Todas las organizaciones</option>'+entities().map(function(e){return '<option value="'+esc(e.id)+'">'+esc(e.name)+'</option>';}).join('');if(cur)es.value=cur;}
    var ent=chosenEntity(),curT=ts.value,ths=Object.values(db()).filter(function(t){var te=thirdEntity(t);return !ent||te===ent||(!te&&ent==='colpensiones');}).sort(function(a,b){return norm(a.nombre||a.nit).localeCompare(norm(b.nombre||b.nit),'es');});
    ts.innerHTML='<option value="">Todos los terceros</option>'+ths.map(function(t){return '<option value="'+esc(t.nit)+'">'+esc((t.nombre||t.nit)+' · '+t.nit)+'</option>';}).join('');if(curT&&ths.some(function(t){return t.nit===curT;}))ts.value=curT;
    var t=db()[ts.value]||null,curC=cs.value,cons=[];if(t){cons=(t.contratos||[]).map(contractNum).filter(Boolean);[t.dimsPorContrato,t.tipologiasPorContrato,t.respuestasACPorContrato,t.promPorContrato].forEach(function(m){Object.keys(m||{}).forEach(function(c){if(!cons.some(function(x){return canonContract(x)===canonContract(c);}))cons.push(c);});});}
    cs.innerHTML='<option value="">Todos los contratos</option>'+cons.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('');if(curC&&cons.some(function(c){return canonContract(c)===canonContract(curC);}))cs.value=curC;
    renderPendingTasks();
  }
  function renderPendingTasks(){
    var wrap=document.getElementById('sgrt42-pendientes');if(!wrap)return;var data=collectReport(),list=actions(data);
    wrap.innerHTML='<div style="font-size:11px;font-weight:800;color:#173b5f;margin-bottom:6px;">Pendientes de seguimiento</div>'+(list.length?'<div style="display:flex;flex-direction:column;gap:5px;">'+list.slice(0,10).map(function(x){return '<div style="padding:7px 9px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;font-size:10.5px;color:#334155;">'+esc(x)+'</div>';}).join('')+'</div>':'<div style="font-size:10.5px;color:#64748b;">No hay pendientes calculados para el filtro actual.</div>');
  }
  function reportCard(pageId,anchorId){
    if(pageId==='admin-pg-reportes-entidad'&&!isIS())return;
    if(pageId==='pg-reportes-entidad'&&isIS())return;
    var page=document.getElementById(pageId),anchor=document.getElementById(anchorId);if(!page||!anchor||page.querySelector('.sgrt42-report-card'))return;
    var old=document.getElementById('sgrt41-report-actions');if(old)old.style.display='none';
    var c=document.createElement('div');c.className='card sgrt42-report-card';c.style.cssText='margin-bottom:14px;border:1px solid #b9d3e8;border-left:5px solid #1e6bb8;overflow:hidden;';
    c.innerHTML='<div style="background:#f5f9fd;padding:12px 15px;border-bottom:1px solid #dce8f2;"><div style="font-size:13px;font-weight:800;color:#173b5f;">Informes corporativos SGRT</div><div style="font-size:10.5px;color:#64748b;margin-top:3px;">Genera Word y PowerPoint con las plantillas corporativas suministradas y los registros reales del sistema.</div></div><div style="padding:12px 15px;"><div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px;">'+(isIS()?'<select id="sgrt42-entity" style="min-width:170px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select>':'')+'<select id="sgrt42-third" style="min-width:210px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select><select id="sgrt42-contract" style="min-width:150px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#334e68;padding:0 6px;"><input type="checkbox" id="sgrt42-use-ai" checked> Mejorar redacción con el asistente</label></div><div style="display:flex;gap:7px;flex-wrap:wrap;"><button class="btn btn-primary btn-sm" onclick="window.sgrtMostrarInformeDocumento()">Ver informe</button><button class="btn btn-outline btn-sm" onclick="window.sgrtGenerarWordFinal()">Generar Word</button><button class="btn btn-outline btn-sm" onclick="window.sgrtGenerarPowerPointFinal()">Generar PowerPoint</button><button class="btn btn-outline btn-sm" onclick="window.abrirAsistente();setTimeout(function(){var i=document.getElementById(\'input-asistente\');if(i){i.value=\'Redacta un informe ejecutivo con los datos actuales del SGRT y dime qué debo corregir antes de presentarlo.\';i.focus();}},150)">Abrir asistente</button></div><div id="sgrt42-pendientes" style="margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;"></div></div>';
    anchor.parentNode.insertBefore(c,anchor);fillFilters();renderPendingTasks();
    var e=c.querySelector('#sgrt42-entity'),t=c.querySelector('#sgrt42-third'),cc=c.querySelector('#sgrt42-contract');if(e)e.onchange=fillFilters;if(t)t.onchange=fillFilters;if(cc)cc.onchange=renderPendingTasks;
  }

  function saveHistory(){try{sessionStorage.setItem('sgrt_ai_history',JSON.stringify(chatHistory.slice(-16)));}catch(e){}}

  // Renderizado seguro de formato enriquecido. El asistente puede responder con
  // títulos, negritas, listas y tablas sin mostrar los asteriscos de Markdown.
  function richInline(v){
    var x=esc(v);
    x=x.replace(/`([^`]+)`/g,'<code style="background:#eef2f6;padding:1px 4px;border-radius:4px;font-size:.95em;">$1</code>');
    x=x.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    x=x.replace(/__([^_]+)__/g,'<strong>$1</strong>');
    x=x.replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
    return x;
  }
  function richTextHTML(text){
    var lines=String(text==null?'':text).replace(/\r/g,'').split('\n'),out=[],i=0,list=null;
    function closeList(){if(list){out.push(list==='ol'?'</ol>':'</ul>');list=null;}}
    function isSep(l){return /^\s*\|?\s*:?-{3,}/.test(l)&&l.indexOf('|')>=0;}
    while(i<lines.length){
      var raw=lines[i],t=raw.trim();
      if(!t){closeList();i++;continue;}
      if(t.indexOf('|')>=0 && i+1<lines.length && isSep(lines[i+1])){
        closeList();var rows=[],j=i;
        while(j<lines.length&&lines[j].trim()&&lines[j].indexOf('|')>=0){
          if(!isSep(lines[j]))rows.push(lines[j].trim().replace(/^\||\|$/g,'').split('|').map(function(c){return richInline(c.trim());}));
          j++;
        }
        if(rows.length){var head=rows.shift();out.push('<div style="overflow-x:auto;margin:8px 0;"><table style="width:100%;border-collapse:collapse;font-size:10.5px;"><thead><tr>'+head.map(function(c){return '<th style="text-align:left;background:#eaf3f9;color:#173b5f;border:1px solid #d4e0e9;padding:6px 7px;">'+c+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td style="vertical-align:top;border:1px solid #e1e8ee;padding:6px 7px;color:#334155;">'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');}
        i=j;continue;
      }
      var h=t.match(/^(#{1,4})\s+(.+)$/);
      if(h){closeList();var sz=h[1].length===1?'15px':h[1].length===2?'13.5px':'12.5px';out.push('<div style="font-weight:800;color:#173b5f;font-size:'+sz+';margin:10px 0 5px;">'+richInline(h[2])+'</div>');i++;continue;}
      var ul=t.match(/^[-*•]\s+(.+)$/),ol=t.match(/^\d+[.)]\s+(.+)$/);
      if(ul||ol){var kind=ol?'ol':'ul';if(list!==kind){closeList();list=kind;out.push(kind==='ol'?'<ol style="margin:5px 0 7px 19px;padding:0;">':'<ul style="margin:5px 0 7px 19px;padding:0;">');}out.push('<li style="margin:3px 0;">'+richInline((ol||ul)[1])+'</li>');i++;continue;}
      if(/^>\s*/.test(t)){closeList();out.push('<div style="border-left:3px solid #9db9cf;background:#f7fafc;padding:7px 9px;margin:6px 0;color:#475569;">'+richInline(t.replace(/^>\s*/,''))+'</div>');i++;continue;}
      closeList();
      // Una línea en mayúsculas suele ser un encabezado generado por el modelo.
      if(t.length<90&&t===t.toUpperCase()&&/[A-ZÁÉÍÓÚÑ]/.test(t)){out.push('<div style="font-weight:800;color:#173b5f;margin:9px 0 4px;font-size:12.5px;">'+richInline(t.replace(/:+$/,''))+'</div>');i++;continue;}
      var para=[t],k=i+1;
      while(k<lines.length){var nt=lines[k].trim();if(!nt||/^(#{1,4})\s+/.test(nt)||/^[-*•]\s+/.test(nt)||/^\d+[.)]\s+/.test(nt)||/^>\s*/.test(nt)||(nt.indexOf('|')>=0&&k+1<lines.length&&isSep(lines[k+1])))break;para.push(nt);k++;}
      out.push('<p style="margin:5px 0 8px;">'+richInline(para.join(' '))+'</p>');i=k;
    }
    closeList();return out.join('');
  }
  window.sgrt42RichTextHTML=richTextHTML;

  function addChat(roleName,text){
    var chat=document.getElementById('mensajes-chat');if(!chat)return null;
    var div=document.createElement('div'),bot=roleName==='assistant';div.className='sgrt42-msg';
    div.style.cssText=(bot?'background:white;border-left:4px solid #1e6bb8;':'background:#eaf1f7;border-left:4px solid #90a4b8;')+'padding:10px 11px;border-radius:8px;font-size:11.5px;line-height:1.5;word-break:break-word;';
    if(bot)div.innerHTML='<div style="font-size:9.5px;font-weight:800;color:#64748b;margin-bottom:5px;text-transform:uppercase;letter-spacing:.35px;">Asistente</div><div class="sgrt42-rich">'+richTextHTML(text)+'</div>';
    else{var lab=document.createElement('div');lab.style.cssText='font-size:9.5px;font-weight:800;color:#64748b;margin-bottom:4px;text-transform:uppercase;letter-spacing:.35px;';lab.textContent='Tú';var body=document.createElement('div');body.style.whiteSpace='pre-wrap';body.textContent=text;div.appendChild(lab);div.appendChild(body);}
    chat.appendChild(div);chat.scrollTop=chat.scrollHeight;return div;
  }
  function fileToDataUrl(f){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=reject;r.readAsDataURL(f);});}
  function aiContext(){var d=collectReport();return {rol:norm((window.currentUser||{}).rol),entidad:entityName(d.entity),tercero:d.third||'',contrato:d.contract||'',dimensiones:dimsSummary(d).slice(0,30),riesgos:d.risks.slice(0,25),modulos:['Registro de terceros y clasificación','Ambiente de Control','Análisis de Riesgos','Documentación y Evidencias','Reportes','Seguimiento'],conceptos:{dimension:'Área o dominio de control evaluado dentro de una tipología de riesgo.',tipologia:'Categoría de riesgo habilitada por contrato para orientar la evaluación.',ambienteControl:'Conjunto de controles, evidencias, respuestas y observaciones evaluadas por tercero y contrato.'}};}
  function folder(parent,name,prefix){parent.children=parent.children||[];var f=parent.children.find(function(x){return x.type==='folder'&&x.name===name;});if(!f){f={type:'folder',name:name,id:(prefix||'f')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),children:[],fecha:new Date().toLocaleDateString('es-CO')};parent.children.push(f);}return f;}
  function saveMeeting(file,dataUrl,summary,transcript){
    try{if(!window.RPT_FS||!Array.isArray(window.RPT_FS.children))return;var ctx=aiContext(),nit=ctx.tercero||'General',cont=ctx.contrato||'Sin contrato',r=folder(window.RPT_FS,'Reuniones','reun'),a=folder(r,nit,'terc'),b=folder(a,cont,'cont'),stamp=new Date().toLocaleDateString('es-CO');b.children.push({type:'file',name:file.name,id:'reunion_'+Date.now().toString(36),size:file.size,fecha:stamp,mimeType:file.type,_dataURL:dataUrl,_origen:'Reuniones'});if(summary)b.children.push({type:'file',name:'Acta_Reunion_'+new Date().toISOString().slice(0,10)+'.txt',id:'acta_'+Date.now().toString(36),size:summary.length,fecha:stamp,mimeType:'text/plain',_dataURL:'data:text/plain;charset=utf-8,'+encodeURIComponent(summary+(transcript?'\n\nTRANSCRIPCIÓN\n'+transcript:'')),_origen:'Reuniones'});if(window._saveRPT)window._saveRPT();}catch(e){console.warn('[SGRT42 reunión]',e);}
  }
  async function aiSend(prompt,files){
    var ctx=aiContext(),arr=[];
    if(files){if(Array.isArray(files))arr=files;else if(typeof FileList!=='undefined'&&files instanceof FileList)arr=Array.from(files);else arr=[files];}
    arr=arr.filter(Boolean).slice(0,4);
    var payload={prompt:prompt,context:ctx,history:chatHistory.slice(-16),files:[]},total=0;
    for(var i=0;i<arr.length;i++){
      var f=arr[i];total+=Number(f.size||0);if(f.size>12*1024*1024)throw new Error('Cada archivo debe pesar máximo 12 MB.');
      var dataUrl=await fileToDataUrl(f);payload.files.push({name:f.name,type:f.type||'application/octet-stream',dataUrl:dataUrl});
    }
    if(total>18*1024*1024)throw new Error('Los archivos adjuntos juntos deben pesar máximo 18 MB.');
    // Para una sola grabación se conserva el flujo de transcripción + acta/reunión.
    if(arr.length===1&&/^(audio|video)\//i.test(arr[0].type||'')){
      var mf=arr[0],md=payload.files[0];
      var tr=await fetch(apiBase()+'/api/ai/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:mf.name,mimeType:mf.type,dataUrl:md.dataUrl,prompt:prompt,context:ctx,history:chatHistory.slice(-16)})});
      var tj=await tr.json().catch(function(){return{};});if(!tr.ok||!tj.ok)throw new Error(tj.error||('HTTP '+tr.status));saveMeeting(mf,md.dataUrl,tj.summary||'',tj.transcript||'');return tj.summary||tj.transcript||'Transcripción completada.';
    }
    if(payload.files.length===1)payload.file=payload.files[0];
    var r=await fetch(apiBase()+'/api/ai/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return j.text||'Sin respuesta.';
  }
  async function aiStatus(){var dot=document.getElementById('sgrt42-ai-status');if(!dot)return;try{var r=await fetch(apiBase()+'/api/ai/status',{cache:'no-store'}),j=await r.json();if(r.ok&&j.ok&&j.configured){dot.textContent='Servicio conectado · '+(j.model||'modelo configurado');dot.style.color='#bbf7d0';}else{dot.textContent='Servicio pendiente de configuración';dot.style.color='#fde68a';}}catch(e){dot.textContent='Servicio sin conexión al servidor';dot.style.color='#fecaca';}}

  function documentSummary(data){
    var ds=dimsSummary(data),done=ds.reduce(function(a,x){return a+x.done;},0),total=ds.reduce(function(a,x){return a+x.total;},0),nos=ds.reduce(function(a,x){return a+x.no;},0);
    return {dims:ds,progress:total?Math.round(done*100/total):0,no:nos,risks:(data.risks||[]).length,pending:actions(data)};
  }
  function documentTable(headers,rows){
    if(!rows.length)return '<div style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;color:#64748b;background:#fafcfe;">No hay registros para esta sección.</div>';
    return '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr>'+headers.map(function(h){return '<th style="background:#e9f3f9;color:#173b5f;border:1px solid #d5e2eb;padding:7px;text-align:left;">'+esc(h)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(v){return '<td style="border:1px solid #e3e9ee;padding:7px;vertical-align:top;color:#334155;">'+esc(v==null?'':v)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  }
  function makeDocumentBody(data,narrative,title){
    var sum=documentSummary(data),third=data.third?((db()[data.third]||{}).nombre||data.third):'Consolidado de terceros',ent=entityName(data.entity),today=data.generated.toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'});
    var dimRows=sum.dims.slice(0,60).map(function(x){return [x.tercero,'Contrato '+x.contrato,x.dimension,(x.total?Math.round(100*x.done/x.total):0)+'%',x.yes,x.no,x.na,x.zona||'Sin puntaje'];});
    var riskRows=(data.risks||[]).slice(0,40).map(function(r){return [r.id||r.riesgoId||'—',r.tercero||r.nit||'—',r.contrato||'—',norm(r.desc||r.descripcion).slice(0,180)||'—',r.zonaRes||r.zonaResidual||r.zonaInh||r.zonaInherente||'—',norm(r.tratamiento||r.plan||'').slice(0,150)||'—'];});
    var cards='<div style="display:grid;grid-template-columns:repeat(4,minmax(110px,1fr));gap:9px;margin:15px 0 18px;">'+[
      ['Dimensiones',sum.dims.length],['Avance',sum.progress+'%'],['Respuestas No',sum.no],['Riesgos',sum.risks]
    ].map(function(c){return '<div style="border:1px solid #dce6ee;border-radius:9px;padding:10px 12px;background:#f8fbfd;"><div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.35px;">'+esc(c[0])+'</div><div style="font-size:20px;font-weight:800;color:#173b5f;margin-top:3px;">'+esc(c[1])+'</div></div>';}).join('')+'</div>';
    return '<div class="sgrt42-document" style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;background:white;max-width:960px;margin:0 auto;box-shadow:0 8px 28px rgba(15,23,42,.14);">'+
      '<img src="'+ASSET+'membrete_superior.png" alt="" style="display:block;width:100%;max-height:105px;object-fit:cover;object-position:top;">'+
      '<div style="padding:30px 42px 24px;">'+
      '<div style="text-align:center;margin:8px 0 22px;"><div style="font-size:20px;font-weight:800;color:#173b5f;line-height:1.25;">'+esc(title||'INFORME EJECUTIVO SGRT')+'</div><div style="font-size:12px;color:#475569;margin-top:8px;">'+esc(ent)+' · '+esc(third)+(data.contract?' · Contrato '+esc(data.contract):'')+'</div><div style="font-size:11px;color:#64748b;margin-top:4px;">'+esc(today)+'</div></div>'+cards+
      '<section style="margin-top:18px;"><h2 style="font-size:15px;color:#173b5f;border-bottom:2px solid #1e6bb8;padding-bottom:6px;">Resumen ejecutivo</h2><div id="sgrt42-doc-narrative" contenteditable="true" spellcheck="true" style="outline:none;min-height:60px;line-height:1.58;font-size:12px;">'+richTextHTML(narrative||deterministicNarrative(data))+'</div><div style="font-size:9.5px;color:#94a3b8;margin-top:5px;">Puedes hacer clic en el texto anterior para ajustarlo antes de imprimir o guardar en PDF.</div></section>'+
      '<section style="margin-top:22px;"><h2 style="font-size:15px;color:#173b5f;border-bottom:2px solid #1e6bb8;padding-bottom:6px;">Resultados por dimensión de control</h2>'+documentTable(['Tercero','Contrato','Dimensión','Avance','Sí','No','N/A','Clasificación'],dimRows)+'</section>'+
      '<section style="margin-top:22px;"><h2 style="font-size:15px;color:#173b5f;border-bottom:2px solid #1e6bb8;padding-bottom:6px;">Análisis de riesgos</h2>'+documentTable(['ID','Tercero','Contrato','Riesgo','Clasificación','Tratamiento'],riskRows)+'</section>'+
      '<section style="margin-top:22px;"><h2 style="font-size:15px;color:#173b5f;border-bottom:2px solid #1e6bb8;padding-bottom:6px;">Pendientes y próximas acciones</h2>'+(sum.pending.length?'<div style="display:flex;flex-direction:column;gap:7px;">'+sum.pending.map(function(x,i){return '<div style="display:flex;gap:9px;align-items:flex-start;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;background:#fbfdff;"><div style="min-width:22px;height:22px;border-radius:50%;background:#e9f3f9;color:#173b5f;font-weight:800;text-align:center;line-height:22px;font-size:10px;">'+(i+1)+'</div><div style="font-size:11px;line-height:1.45;">'+esc(x)+'</div></div>';}).join('')+'</div>':'<div style="color:#64748b;font-size:11px;">No se calcularon pendientes para el filtro actual.</div>')+'</section>'+
      '</div><img src="'+ASSET+'membrete_inferior.jpg" alt="" style="display:block;width:100%;max-height:80px;object-fit:cover;object-position:bottom;"></div>';
  }
  function printDocumentPreview(){
    var doc=document.querySelector('#sgrt42-doc-overlay .sgrt42-document');if(!doc)return;var w=window.open('','_blank');if(!w){toast('Permite ventanas emergentes para imprimir o guardar PDF.','warning');return;}w.document.open();w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Informe SGRT</title><style>@page{size:A4;margin:10mm}body{margin:0;background:white}.sgrt42-document{box-shadow:none!important;max-width:none!important}button{display:none!important}table{page-break-inside:auto}tr{page-break-inside:avoid;page-break-after:auto}img{max-width:100%}</style></head><body>'+doc.outerHTML+'</body></html>');w.document.close();setTimeout(function(){w.focus();w.print();},450);
  }
  function openDocumentPreview(narrative,title){
    var data=collectReport();if(!data.rows.length&&!data.risks.length){toast('No hay información registrada para construir el documento.','warning');return;}
    var old=document.getElementById('sgrt42-doc-overlay');if(old)old.remove();
    var ov=document.createElement('div');ov.id='sgrt42-doc-overlay';ov.style.cssText='position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.64);display:flex;flex-direction:column;';
    ov.innerHTML='<div style="background:#0d2740;color:white;padding:10px 14px;display:flex;gap:8px;align-items:center;justify-content:space-between;box-shadow:0 2px 10px rgba(0,0,0,.18);"><div><div style="font-size:13px;font-weight:800;">Documento SGRT</div><div style="font-size:9.5px;color:#cbd5e1;margin-top:2px;">Vista previa del informe. Puedes editar el texto, imprimirlo o guardarlo en PDF.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;"><button id="sgrt42-doc-print" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:white;color:#173b5f;font-weight:700;cursor:pointer;">Imprimir / PDF</button><button id="sgrt42-doc-word" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:white;color:#173b5f;font-weight:700;cursor:pointer;">Word</button><button id="sgrt42-doc-ppt" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:white;color:#173b5f;font-weight:700;cursor:pointer;">PowerPoint</button><button id="sgrt42-doc-close" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:#173b5f;color:white;font-weight:700;cursor:pointer;">Cerrar</button></div></div><div style="flex:1;overflow:auto;padding:24px;">'+makeDocumentBody(data,narrative,title)+'</div>';
    document.body.appendChild(ov);
    ov.querySelector('#sgrt42-doc-close').onclick=function(){ov.remove();};
    ov.querySelector('#sgrt42-doc-print').onclick=printDocumentPreview;
    ov.querySelector('#sgrt42-doc-word').onclick=function(){window.sgrtGenerarWordFinal&&window.sgrtGenerarWordFinal('Usa el contenido y enfoque de la vista previa actual.');};
    ov.querySelector('#sgrt42-doc-ppt').onclick=function(){window.sgrtGenerarPowerPointFinal&&window.sgrtGenerarPowerPointFinal('Usa el contenido y enfoque de la vista previa actual.');};
    ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
  }
  window.sgrt42AbrirDocumento=openDocumentPreview;
  window.sgrtMostrarInformeDocumento=async function(customInstruction,existingText){
    await refreshReportSource();var data=collectReport(),narrative=norm(existingText)||deterministicNarrative(data),custom=norm(customInstruction);
    if(!existingText&&useAI())try{narrative=await aiNarrative(data,(custom?('Solicitud específica del usuario: '+custom+'\n'):'')+'Redacta un informe ejecutivo listo para mostrar dentro del SGRT. Usa títulos claros, párrafos breves, listas y tablas solo cuando ayuden. No uses emojis. No menciones inteligencia artificial.');}catch(e){toast('El servicio de redacción no respondió; se mostrará el análisis calculado por SGRT.','warning',3500);}
    openDocumentPreview(narrative,'INFORME EJECUTIVO DE EVALUACIÓN DEL AMBIENTE DE CONTROL Y GESTIÓN DE RIESGOS');
  };

  async function downloadAssistantWord(textValue,titleValue){
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js',function(){return !!window.docx;});
      var d=window.docx,top=await fetchBytes(ASSET+'membrete_superior.png'),bottom=await fetchBytes(ASSET+'membrete_inferior.jpg');
      var clean=norm(textValue),lines=clean.split(/\n+/).map(function(x){return x.replace(/^#{1,6}\s*/, '').replace(/^[-*•]\s*/, '• ').replace(/\*\*/g,'').trim();}).filter(Boolean);
      var children=[new d.Paragraph({alignment:d.AlignmentType.CENTER,spacing:{before:500,after:260},children:[new d.TextRun({text:norm(titleValue)||'DOCUMENTO SGRT',bold:true,size:28,color:'173B5F'})]})];
      lines.forEach(function(line){var bullet=line.indexOf('• ')===0;children.push(new d.Paragraph({text:bullet?line.slice(2):line,bullet:bullet?{level:0}:undefined,spacing:{after:120}}));});
      var doc=new d.Document({sections:[{properties:{page:{margin:{top:1050,right:850,bottom:900,left:850}}},headers:{default:new d.Header({children:[new d.Paragraph({children:[new d.ImageRun({data:top,transformation:{width:650,height:102}})]})]})},footers:{default:new d.Footer({children:[new d.Paragraph({alignment:d.AlignmentType.CENTER,children:[new d.ImageRun({data:bottom,transformation:{width:600,height:67}})]})]})},children:children}]});
      var blob=await d.Packer.toBlob(doc),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(norm(titleValue)||'Documento_SGRT').replace(/[^a-z0-9_-]+/gi,'_')+'_'+new Date().toISOString().slice(0,10)+'.docx';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1800);
    }catch(e){toast('No se pudo generar el Word: '+e.message,'error',5000);}
  }
  function openAssistantDocument(textValue,titleValue){
    var old=document.getElementById('sgrt42-free-doc-overlay');if(old)old.remove();
    var ov=document.createElement('div');ov.id='sgrt42-free-doc-overlay';ov.style.cssText='position:fixed;inset:0;z-index:10060;background:rgba(15,23,42,.64);display:flex;flex-direction:column;';
    var title=norm(titleValue)||'DOCUMENTO SGRT';
    ov.innerHTML='<div style="background:#0d2740;color:white;padding:10px 14px;display:flex;gap:8px;align-items:center;justify-content:space-between;"><div><div style="font-size:13px;font-weight:800;">Documento SGRT</div><div style="font-size:9.5px;color:#cbd5e1;margin-top:2px;">Puedes editar el contenido antes de guardarlo.</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;"><button id="sgrt42-free-print" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:white;color:#173b5f;font-weight:700;cursor:pointer;">Imprimir / PDF</button><button id="sgrt42-free-word" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:white;color:#173b5f;font-weight:700;cursor:pointer;">Word</button><button id="sgrt42-free-close" style="padding:7px 10px;border:1px solid #8bb3d1;border-radius:6px;background:#173b5f;color:white;font-weight:700;cursor:pointer;">Cerrar</button></div></div><div style="flex:1;overflow:auto;padding:24px;"><div class="sgrt42-free-document" style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;background:white;max-width:900px;margin:0 auto;box-shadow:0 8px 28px rgba(15,23,42,.14);"><img src="'+ASSET+'membrete_superior.png" alt="" style="display:block;width:100%;max-height:105px;object-fit:cover;object-position:top;"><div style="padding:32px 44px;"><div style="text-align:center;font-size:20px;font-weight:800;color:#173b5f;margin:8px 0 24px;">'+esc(title)+'</div><div id="sgrt42-free-doc-body" contenteditable="true" spellcheck="true" style="outline:none;min-height:420px;font-size:12px;line-height:1.65;">'+richTextHTML(textValue)+'</div></div><img src="'+ASSET+'membrete_inferior.jpg" alt="" style="display:block;width:100%;max-height:80px;object-fit:cover;object-position:bottom;"></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#sgrt42-free-close').onclick=function(){ov.remove();};
    ov.querySelector('#sgrt42-free-word').onclick=function(){var body=ov.querySelector('#sgrt42-free-doc-body');downloadAssistantWord(body?body.innerText:textValue,title);};
    ov.querySelector('#sgrt42-free-print').onclick=function(){var doc=ov.querySelector('.sgrt42-free-document'),w=window.open('','_blank');if(!w){toast('Permite ventanas emergentes para imprimir o guardar PDF.','warning');return;}w.document.open();w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>@page{size:A4;margin:10mm}body{margin:0;background:white}.sgrt42-free-document{box-shadow:none!important;max-width:none!important}img{max-width:100%}</style></head><body>'+doc.outerHTML+'</body></html>');w.document.close();setTimeout(function(){w.focus();w.print();},450);};
  }
  window.sgrt42AbrirDocumentoLibre=openAssistantDocument;
  function assistantAnswerTitle(text){
    var raw=norm(text),m=raw.match(/^\s*#{1,4}\s+(.+)$/m);if(m)return norm(m[1]).replace(/[*_`]/g,'').slice(0,90);
    var first=raw.split(/\n+/).map(function(x){return x.replace(/^[#>*\-\s]+/,'').trim();}).filter(Boolean)[0]||'Respuesta del asistente';
    return first.length>72?'Respuesta del asistente':first.replace(/[*_`]/g,'').slice(0,90);
  }
  function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines){
    var words=String(text||'').split(/\s+/),line='',lines=[];
    for(var n=0;n<words.length;n++){var test=line+(line?' ':'')+words[n];if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=words[n];if(lines.length>=maxLines-1)break;}else line=test;}
    if(line&&lines.length<maxLines)lines.push(line);if(words.length&&lines.length===maxLines){var last=lines[maxLines-1];if(last.length>3)lines[maxLines-1]=last.replace(/[.,;:]?$/,'')+'…';}
    lines.forEach(function(l,i){ctx.fillText(l,x,y+i*lineHeight);});return lines.length;
  }
  function studioSource(text){return norm(text).slice(0,18000);}
  function studioPrompt(mode,text){
    var src=studioSource(text),head='MODO STUDIO SGRT. Trabaja EXCLUSIVAMENTE con la FUENTE incluida al final. No agregues hechos externos. Si la fuente no contiene un dato, no lo inventes. ';
    var inst={
      summary:'Convierte la fuente en una explicación visual y clara. Devuelve Markdown con: ### Qué estás viendo, ### Resumen, ### Qué significa, ### Puntos clave y, solo si aplica, ### Qué hacer a continuación. Sé concreto y pedagógico.',
      podcast:'Convierte la fuente en un podcast conversacional de 3 a 5 minutos. Devuelve primero ### Podcast y una línea TÍTULO:. Luego escribe intervenciones alternadas exactamente con los prefijos PRESENTADOR: y EXPERTO:. Incluye apertura, explicación, ejemplos que estén respaldados por la fuente, síntesis y cierre. No uses tablas.',
      infographic:'Convierte la fuente en una infografía breve. Devuelve Markdown con un título corto, una bajada de una frase y entre 4 y 6 secciones con encabezados ###. Cada sección debe tener máximo 3 viñetas cortas. Termina con ### En una frase y una conclusión de una sola oración.',
      video:'Convierte la fuente en un video resumen de 60 a 120 segundos. Devuelve: ### Título, una frase de apertura y luego entre 4 y 6 bloques con encabezados ### Escena 1, ### Escena 2, etc. En cada escena escribe primero TEXTO EN PANTALLA: y después NARRACIÓN:. Cierra con ### Cierre. Mantén cada escena breve.'
    };
    return head+(inst[mode]||inst.summary)+'\n\nFUENTE:\n---\n'+src+'\n---';
  }
  async function transformStudio(mode,text){
    var source=studioSource(text);if(!source)return '';
    return await aiSend(studioPrompt(mode,source),[]);
  }
  function studioOverlay(title,subtitle){
    var old=document.getElementById('sgrt42-studio-overlay');if(old)old.remove();try{speechSynthesis.cancel();}catch(e){}
    var ov=document.createElement('div');ov.id='sgrt42-studio-overlay';ov.style.cssText='position:fixed;inset:0;z-index:10080;background:rgba(8,22,38,.72);display:flex;flex-direction:column;backdrop-filter:blur(3px);';
    ov.innerHTML='<div style="background:linear-gradient(135deg,#0d2740,#1e6bb8);color:white;padding:13px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 2px 14px rgba(0,0,0,.2);"><div><div style="font-size:15px;font-weight:900;letter-spacing:.15px;">'+esc(title)+'</div><div style="font-size:9.5px;color:#dbeafe;margin-top:3px;">'+esc(subtitle||'Studio del Asistente Inteligente SGRT')+'</div></div><button id="sgrt42-studio-close" style="border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:white;border-radius:8px;padding:7px 11px;font-weight:800;cursor:pointer;">Cerrar</button></div><div id="sgrt42-studio-body" style="flex:1;overflow:auto;padding:22px;background:linear-gradient(180deg,#eef5fb,#f8fbfd);"></div>';
    document.body.appendChild(ov);ov.querySelector('#sgrt42-studio-close').onclick=function(){try{speechSynthesis.cancel();}catch(e){}ov.remove();};return {ov:ov,body:ov.querySelector('#sgrt42-studio-body')};
  }
  function studioLoading(box,label){box.innerHTML='<div style="max-width:780px;margin:50px auto;background:white;border:1px solid #d9e6f0;border-radius:16px;padding:30px;text-align:center;box-shadow:0 10px 30px rgba(15,39,64,.08);"><div style="width:36px;height:36px;border:4px solid #dbeafe;border-top-color:#1e6bb8;border-radius:50%;margin:0 auto 14px;animation:sgrt42spin .8s linear infinite;"></div><div style="font-size:13px;font-weight:800;color:#173b5f;">'+esc(label||'Preparando contenido…')+'</div><div style="font-size:10.5px;color:#64748b;margin-top:6px;">El asistente está reorganizando únicamente la respuesta seleccionada.</div></div>';if(!document.getElementById('sgrt42-studio-style')){var st=document.createElement('style');st.id='sgrt42-studio-style';st.textContent='@keyframes sgrt42spin{to{transform:rotate(360deg)}}';document.head.appendChild(st);}}
  function downloadTextFile(text,name){var b=new Blob([String(text||'')],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(name||'contenido').replace(/[^a-z0-9_-]+/gi,'_')+'.txt';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1800);}
  async function openSummaryStudio(source){
    var ui=studioOverlay('Resumen inteligente','Qué estás viendo · resumen · significado · puntos clave');studioLoading(ui.body,'Construyendo el resumen…');
    try{var out=await transformStudio('summary',source);ui.body.innerHTML='<div style="max-width:900px;margin:0 auto;background:white;border:1px solid #d9e6f0;border-radius:16px;padding:28px 32px;box-shadow:0 10px 32px rgba(15,39,64,.08);"><div style="font-size:10px;font-weight:900;color:#1e6bb8;text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Resumen de la respuesta</div><div class="sgrt42-rich" style="font-size:13px;line-height:1.75;color:#243b53;">'+richTextHTML(out)+'</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px;padding-top:15px;border-top:1px solid #e6eef5;"><button id="sgrt42-summary-doc" class="btn btn-primary btn-sm">Abrir como documento</button><button id="sgrt42-summary-copy" class="btn btn-outline btn-sm">Copiar</button></div></div>';ui.body.querySelector('#sgrt42-summary-doc').onclick=function(){openAssistantDocument(out,assistantAnswerTitle(out));};ui.body.querySelector('#sgrt42-summary-copy').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(out);toast('Resumen copiado.','success');};}catch(e){ui.body.innerHTML='<div style="max-width:760px;margin:40px auto;background:white;padding:24px;border-radius:14px;color:#b91c1c;">No se pudo preparar el resumen: '+esc(e.message)+'</div>';}
  }
  function podcastParts(script){
    var lines=norm(script).split(/\n+/).map(function(x){return x.trim();}).filter(Boolean),parts=[];
    lines.forEach(function(line){var m=line.match(/^(PRESENTADOR|EXPERTO)\s*:\s*(.+)$/i);if(m)parts.push({role:m[1].toUpperCase(),text:m[2]});});
    if(!parts.length){var blocks=norm(script).replace(/^#{1,4}\s+.*$/gm,'').split(/\n\s*\n+/).filter(Boolean);blocks.forEach(function(b,i){parts.push({role:i%2?'EXPERTO':'PRESENTADOR',text:b.replace(/^[-*•]\s+/gm,'')});});}
    return parts.slice(0,28);
  }
  function speakPodcast(script,statusEl){
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){toast('Este navegador no ofrece narración de voz. El guion sí está disponible.','warning');return;}
    var parts=podcastParts(script),voices=speechSynthesis.getVoices().filter(function(v){return /^es/i.test(v.lang||'');}),idx=0;speechSynthesis.cancel();
    function next(){if(idx>=parts.length){if(statusEl)statusEl.textContent='Finalizado';return;}var p=parts[idx++],u=new SpeechSynthesisUtterance(p.text);u.lang='es-ES';u.rate=p.role==='PRESENTADOR'?1.02:.96;u.pitch=p.role==='PRESENTADOR'?1.03:.94;if(voices.length)u.voice=voices[(p.role==='PRESENTADOR'?0:Math.min(1,voices.length-1))];if(statusEl)statusEl.textContent=p.role+' · '+idx+' de '+parts.length;u.onend=next;u.onerror=next;speechSynthesis.speak(u);}next();
  }
  async function openPodcastStudio(source){
    var ui=studioOverlay('Podcast IA','Conversación narrada basada únicamente en la respuesta seleccionada');studioLoading(ui.body,'Preparando el podcast…');
    try{var out=await transformStudio('podcast',source),title=assistantAnswerTitle(out);ui.body.innerHTML='<div style="max-width:940px;margin:0 auto;display:grid;grid-template-columns:minmax(250px,.8fr) minmax(380px,1.4fr);gap:16px;"><div style="background:linear-gradient(145deg,#0d2740,#1e6bb8);color:white;border-radius:18px;padding:26px;box-shadow:0 12px 34px rgba(15,39,64,.16);"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#bfdbfe;font-weight:900;">Podcast generado</div><div style="font-size:22px;font-weight:900;line-height:1.2;margin-top:9px;">'+esc(title)+'</div><div style="font-size:11px;color:#dbeafe;line-height:1.6;margin-top:12px;">Escucha el contenido como una conversación entre presentador y experto. La voz se reproduce localmente en el navegador.</div><div id="sgrt42-podcast-status" style="margin-top:22px;padding:9px 11px;background:rgba(255,255,255,.1);border-radius:9px;font-size:10px;">Listo para reproducir</div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;"><button id="sgrt42-podcast-play" style="padding:8px 12px;border:0;border-radius:8px;background:white;color:#173b5f;font-weight:900;cursor:pointer;">Reproducir</button><button id="sgrt42-podcast-pause" style="padding:8px 12px;border:1px solid rgba(255,255,255,.35);border-radius:8px;background:transparent;color:white;font-weight:800;cursor:pointer;">Pausar / seguir</button><button id="sgrt42-podcast-stop" style="padding:8px 12px;border:1px solid rgba(255,255,255,.35);border-radius:8px;background:transparent;color:white;font-weight:800;cursor:pointer;">Detener</button></div></div><div style="background:white;border:1px solid #d9e6f0;border-radius:18px;padding:24px;box-shadow:0 10px 30px rgba(15,39,64,.07);"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px;"><div style="font-size:12px;font-weight:900;color:#173b5f;">Guion del podcast</div><button id="sgrt42-podcast-download" class="btn btn-outline btn-sm">Descargar guion</button></div><div class="sgrt42-rich" style="font-size:12px;line-height:1.7;max-height:520px;overflow:auto;padding-right:6px;">'+richTextHTML(out)+'</div></div></div>';
      var st=ui.body.querySelector('#sgrt42-podcast-status');ui.body.querySelector('#sgrt42-podcast-play').onclick=function(){speakPodcast(out,st);};ui.body.querySelector('#sgrt42-podcast-pause').onclick=function(){if(!speechSynthesis)return;if(speechSynthesis.paused){speechSynthesis.resume();st.textContent='Reproduciendo';}else{speechSynthesis.pause();st.textContent='Pausado';}};ui.body.querySelector('#sgrt42-podcast-stop').onclick=function(){speechSynthesis&&speechSynthesis.cancel();st.textContent='Detenido';};ui.body.querySelector('#sgrt42-podcast-download').onclick=function(){downloadTextFile(out,'Podcast_'+title);};
    }catch(e){ui.body.innerHTML='<div style="max-width:760px;margin:40px auto;background:white;padding:24px;border-radius:14px;color:#b91c1c;">No se pudo preparar el podcast: '+esc(e.message)+'</div>';}
  }
  function infographicBlocks(text){
    var raw=norm(text),title=assistantAnswerTitle(raw),parts=raw.split(/\n(?=###\s+)/).map(function(x){return x.trim();}).filter(Boolean),blocks=[];
    parts.forEach(function(p){var m=p.match(/^###\s+([^\n]+)\n?([\s\S]*)$/);if(m&&low(m[1]).indexOf('infograf')<0)blocks.push({title:norm(m[1]),body:norm(m[2]).replace(/^[-*•]\s+/gm,'• ')});});
    if(!blocks.length){raw.replace(/^###?\s+.*$/gm,'');var ps=raw.split(/\n\s*\n+/).filter(Boolean);ps.slice(0,6).forEach(function(x,i){blocks.push({title:'Idea '+(i+1),body:x});});}
    return {title:title||'Infografía SGRT',blocks:blocks.slice(0,6)};
  }
  function drawInfographic(text){
    var data=infographicBlocks(text),w=1200,pad=70,cardGap=22,cardH=205,h=Math.max(1500,280+data.blocks.length*(cardH+cardGap)+140),c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#0d2740');g.addColorStop(.42,'#1e6bb8');g.addColorStop(1,'#e7f2fa');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.09)';x.beginPath();x.arc(1060,120,250,0,Math.PI*2);x.fill();
    x.fillStyle='#ffffff';x.font='800 50px Arial';wrapText(x,data.title,pad,105,w-pad*2,58,2);x.fillStyle='#dbeafe';x.font='600 22px Arial';x.fillText('Resumen visual · Asistente Inteligente SGRT',pad,225);
    var y=285;data.blocks.forEach(function(b,i){x.fillStyle='rgba(255,255,255,.96)';x.beginPath();if(x.roundRect)x.roundRect(pad,y,w-pad*2,cardH,24);else x.rect(pad,y,w-pad*2,cardH);x.fill();x.fillStyle='#1e6bb8';x.font='800 24px Arial';x.fillText(String(i+1).padStart(2,'0'),pad+30,y+42);x.fillStyle='#173b5f';x.font='800 28px Arial';wrapText(x,b.title,pad+85,y+43,w-pad*2-120,34,2);x.fillStyle='#334e68';x.font='400 22px Arial';wrapText(x,b.body.replace(/\n+/g,' · '),pad+34,y+105,w-pad*2-68,31,3);y+=cardH+cardGap;});
    x.fillStyle='#173b5f';x.font='700 18px Arial';x.fillText('GESTIÓN INTEGRAL · Infraestructuras Seguras',pad,h-60);return {canvas:c,data:data};
  }
  async function openInfographicStudio(source){
    var ui=studioOverlay('Infografía IA','Resumen visual listo para revisar y descargar');studioLoading(ui.body,'Diseñando la infografía…');
    try{var out=await transformStudio('infographic',source),drawn=drawInfographic(out),url=drawn.canvas.toDataURL('image/png');ui.body.innerHTML='<div style="max-width:980px;margin:0 auto;"><div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:10px;"><a id="sgrt42-info-download" class="btn btn-primary btn-sm" download="Infografia_SGRT.png">Descargar PNG</a><button id="sgrt42-info-text" class="btn btn-outline btn-sm">Ver contenido</button></div><div style="background:white;border:1px solid #d9e6f0;border-radius:16px;padding:12px;box-shadow:0 12px 34px rgba(15,39,64,.1);"><img src="'+url+'" alt="Infografía generada" style="width:100%;display:block;border-radius:10px;"></div><div id="sgrt42-info-raw" style="display:none;background:white;border:1px solid #d9e6f0;border-radius:14px;padding:22px;margin-top:12px;"><div class="sgrt42-rich">'+richTextHTML(out)+'</div></div></div>';ui.body.querySelector('#sgrt42-info-download').href=url;ui.body.querySelector('#sgrt42-info-text').onclick=function(){var r=ui.body.querySelector('#sgrt42-info-raw');r.style.display=r.style.display==='none'?'block':'none';};}catch(e){ui.body.innerHTML='<div style="max-width:760px;margin:40px auto;background:white;padding:24px;border-radius:14px;color:#b91c1c;">No se pudo preparar la infografía: '+esc(e.message)+'</div>';}
  }
  function videoSlidesFromText(text){
    var raw=norm(text).replace(/\r/g,''),title=assistantAnswerTitle(raw),blocks=[],re=/^###\s+(?:Escena\s*\d+|Cierre)\s*\n([\s\S]*?)(?=^###\s+|$)/gmi,m;
    while((m=re.exec(raw))){var body=norm(m[1]).replace(/^TEXTO EN PANTALLA\s*:\s*/gmi,'').replace(/^NARRACI[ÓO]N\s*:\s*/gmi,'');if(body)blocks.push(body);}
    if(!blocks.length){var clean=raw.replace(/^\s*#{1,4}\s+.*$/m,'').trim();blocks=clean.split(/\n\s*\n+/).map(function(x){return x.replace(/^#{1,4}\s+/gm,'').replace(/^[-*•]\s+/gm,'• ').trim();}).filter(Boolean);}
    if(blocks.length<2){var sentences=raw.split(/(?<=[.!?])\s+/).filter(Boolean);blocks=[];for(var i=0;i<sentences.length;i+=2)blocks.push(sentences.slice(i,i+2).join(' '));}
    blocks=blocks.slice(0,7);if(!blocks.length)blocks=['Resumen generado por el Asistente SGRT.'];return {title:title||'Video SGRT',slides:blocks};
  }
  async function generateVideoBlob(text,titleValue,onProgress){
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw new Error('Este navegador no permite exportar video WebM. Puedes usar la reproducción narrada.');
    var parsed=videoSlidesFromText(text),title=norm(titleValue)||parsed.title||'Video SGRT',slides=parsed.slides,canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;var ctx=canvas.getContext('2d'),stream=canvas.captureStream(30),mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm;codecs=vp8';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';var rec=new MediaRecorder(stream,{mimeType:mime}),chunks=[];rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
    function bg(){var g=ctx.createLinearGradient(0,0,1280,720);g.addColorStop(0,'#0d2740');g.addColorStop(1,'#1e6bb8');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(70,70,1140,580);ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=2;ctx.strokeRect(70,70,1140,580);}
    function draw(idx,progress){bg();ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='700 22px Arial';ctx.fillText('GESTIÓN INTEGRAL · SGRT',110,125);ctx.fillStyle='#ffffff';ctx.font='800 46px Arial';wrapText(ctx,idx===0?title:('Idea '+idx),110,205,1030,54,2);ctx.fillStyle='#e8f2fb';ctx.font='400 28px Arial';wrapText(ctx,slides[Math.max(0,idx-1)]||slides[0],110,340,1030,42,6);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(110,595,1060,8);ctx.fillStyle='#ffffff';ctx.fillRect(110,595,1060*Math.max(0,Math.min(1,progress)),8);ctx.font='600 18px Arial';ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillText((idx===0?'Introducción':('Escena '+idx+' de '+slides.length)),110,635);}
    var totalScenes=slides.length+1,duration=2200,totalMs=totalScenes*duration;rec.start(250);var started=performance.now();await new Promise(function(resolve){function frame(now){var elapsed=now-started,scene=Math.min(totalScenes-1,Math.floor(elapsed/duration));draw(scene,elapsed/totalMs);if(onProgress)onProgress(Math.round(Math.min(1,elapsed/totalMs)*100));if(elapsed<totalMs)requestAnimationFrame(frame);else{draw(totalScenes-1,1);setTimeout(resolve,140);}}requestAnimationFrame(frame);});var stopped=new Promise(function(resolve){rec.onstop=resolve;});rec.stop();await stopped;return {blob:new Blob(chunks,{type:mime}),title:title,slides:slides};
  }
  function playNarratedVideo(text,preview,status){
    var parsed=videoSlidesFromText(text),slides=parsed.slides,idx=0;if(!window.speechSynthesis){toast('Este navegador no ofrece narración de voz.','warning');return;}speechSynthesis.cancel();
    function next(){if(idx>=slides.length){if(status)status.textContent='Finalizado';return;}var body=slides[idx],n=idx+1;if(preview)preview.innerHTML='<div style="font-size:10px;color:#93c5fd;font-weight:900;text-transform:uppercase;letter-spacing:.6px;">Escena '+n+' de '+slides.length+'</div><div style="font-size:23px;font-weight:900;color:white;line-height:1.25;margin-top:10px;">'+esc(parsed.title)+'</div><div style="font-size:13px;color:#e0efff;line-height:1.7;margin-top:16px;">'+esc(body)+'</div>';if(status)status.textContent='Narrando escena '+n+' de '+slides.length;var u=new SpeechSynthesisUtterance(body);u.lang='es-ES';u.rate=.97;u.onend=function(){idx++;next();};u.onerror=function(){idx++;next();};speechSynthesis.speak(u);}next();
  }
  async function openVideoStudio(source){
    var ui=studioOverlay('Video resumen IA','Storyboard · reproducción narrada · exportación WebM');studioLoading(ui.body,'Preparando el storyboard…');
    try{var out=await transformStudio('video',source),parsed=videoSlidesFromText(out),cards=parsed.slides.map(function(x,i){return '<div style="background:white;border:1px solid #d9e6f0;border-radius:12px;padding:13px 14px;"><div style="font-size:9.5px;color:#1e6bb8;font-weight:900;text-transform:uppercase;">Escena '+(i+1)+'</div><div style="font-size:11.5px;color:#334e68;line-height:1.55;margin-top:5px;">'+esc(x)+'</div></div>';}).join('');ui.body.innerHTML='<div style="max-width:1000px;margin:0 auto;"><div style="display:grid;grid-template-columns:1.15fr .85fr;gap:16px;"><div><div id="sgrt42-video-preview" style="min-height:300px;background:linear-gradient(135deg,#0d2740,#1e6bb8);border-radius:18px;padding:34px;box-shadow:0 12px 34px rgba(15,39,64,.18);display:flex;flex-direction:column;justify-content:center;"><div style="font-size:10px;color:#93c5fd;font-weight:900;text-transform:uppercase;letter-spacing:.6px;">Video resumen</div><div style="font-size:26px;font-weight:900;color:white;line-height:1.2;margin-top:10px;">'+esc(parsed.title)+'</div><div style="font-size:13px;color:#dbeafe;line-height:1.7;margin-top:16px;">Pulsa “Reproducir narrado” para ver y escuchar las escenas, o genera el archivo WebM.</div></div><div id="sgrt42-video-result" style="margin-top:12px;"></div><div id="sgrt42-video-status" style="font-size:10.5px;color:#64748b;margin-top:8px;">Storyboard listo</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;"><button id="sgrt42-video-play" class="btn btn-primary btn-sm">Reproducir narrado</button><button id="sgrt42-video-stop" class="btn btn-outline btn-sm">Detener</button><button id="sgrt42-video-export" class="btn btn-outline btn-sm">Generar video .webm</button><button id="sgrt42-video-script" class="btn btn-outline btn-sm">Descargar guion</button></div></div><div><div style="font-size:11px;font-weight:900;color:#173b5f;margin-bottom:8px;">Escenas</div><div style="display:flex;flex-direction:column;gap:8px;max-height:560px;overflow:auto;">'+cards+'</div></div></div></div>';
      var preview=ui.body.querySelector('#sgrt42-video-preview'),status=ui.body.querySelector('#sgrt42-video-status'),result=ui.body.querySelector('#sgrt42-video-result');ui.body.querySelector('#sgrt42-video-play').onclick=function(){playNarratedVideo(out,preview,status);};ui.body.querySelector('#sgrt42-video-stop').onclick=function(){speechSynthesis&&speechSynthesis.cancel();status.textContent='Detenido';};ui.body.querySelector('#sgrt42-video-script').onclick=function(){downloadTextFile(out,'Guion_video_'+parsed.title);};ui.body.querySelector('#sgrt42-video-export').onclick=async function(){var b=this;b.disabled=true;b.textContent='Generando…';status.textContent='Generando video visual… 0%';try{var made=await generateVideoBlob(out,parsed.title,function(p){status.textContent='Generando video visual… '+p+'%';}),url=URL.createObjectURL(made.blob);result.innerHTML='<video controls style="width:100%;border-radius:12px;background:#0d2740;" src="'+url+'"></video><div style="margin-top:7px;"><a class="btn btn-primary btn-sm" download="'+esc(parsed.title.replace(/[^a-z0-9_-]+/gi,'_'))+'.webm" href="'+url+'">Descargar video</a></div>';status.textContent='Video listo. Puedes reproducirlo antes de descargarlo.';}catch(e){status.textContent=e.message;toast(e.message,'warning',5000);}finally{b.disabled=false;b.textContent='Generar video .webm';}};
    }catch(e){ui.body.innerHTML='<div style="max-width:760px;margin:40px auto;background:white;padding:24px;border-radius:14px;color:#b91c1c;">No se pudo preparar el video: '+esc(e.message)+'</div>';}
  }
  window.sgrt42CrearVideoIA=openVideoStudio;
  window.sgrt42CrearPodcastIA=openPodcastStudio;
  window.sgrt42CrearInfografiaIA=openInfographicStudio;
  window.sgrt42CrearResumenIA=openSummaryStudio;
  function enhanceAssistantMessageTools(div,text){
    if(!div||!text)return;var tools=document.createElement('div');tools.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;padding-top:8px;border-top:1px solid #edf2f7;';
    [['Resumen',function(){openSummaryStudio(text);}],['Podcast',function(){openPodcastStudio(text);}],['Infografía',function(){openInfographicStudio(text);}],['Video',function(){openVideoStudio(text);}],['Documento',function(){openAssistantDocument(text,assistantAnswerTitle(text));}],['Copiar',function(){navigator.clipboard&&navigator.clipboard.writeText(text).then(function(){toast('Respuesta copiada.','success');}).catch(function(){});}]].forEach(function(it){var b=document.createElement('button');b.type='button';b.textContent=it[0];b.style.cssText='padding:5px 9px;border:1px solid #c8d7e5;border-radius:999px;background:#f8fbfd;color:#1e4f78;font-size:9.5px;font-weight:800;cursor:pointer;';b.onclick=it[1];tools.appendChild(b);});div.appendChild(tools);
  }
  function enhanceChat(){
    var panel=document.getElementById('chat-panel'),chat=document.getElementById('mensajes-chat'),inp=document.getElementById('input-asistente');if(!panel||!chat||!inp||panel.dataset.sgrt42)return;panel.dataset.sgrt42='1';panel.style.width='470px';panel.style.maxHeight='690px';panel.style.border='1px solid #cbd9e5';panel.style.borderRadius='16px';
    var floatBtn=document.getElementById('btn-asistente');if(floatBtn){floatBtn.textContent='AI';floatBtn.title='Abrir Asistente Inteligente SGRT';floatBtn.style.fontSize='14px';floatBtn.style.fontWeight='900';floatBtn.style.letterSpacing='.6px';floatBtn.style.animation='none';floatBtn.style.background='linear-gradient(135deg,#0d2740,#1e6bb8)';}
    var header=panel.firstElementChild;if(header){header.style.background='linear-gradient(135deg,#0d2740 0%,#173b5f 55%,#1e6bb8 100%)';header.style.padding='14px 16px';var title=header.firstElementChild;if(title)title.innerHTML='<span style="font-size:14px;letter-spacing:.1px;">Asistente Inteligente SGRT<br><small style="font-size:9.5px;font-weight:500;color:#dbeafe;">Chat · resumen · podcast · infografía · video · documentos</small><br><small id="sgrt42-ai-status" style="font-size:9px;font-weight:600;color:#fde68a;">Verificando servicio…</small></span>';}
    chat.style.maxHeight='390px';chat.style.background='linear-gradient(180deg,#f5f9fc,#eef5fa)';
    chat.innerHTML='<div style="background:white;padding:13px 14px;border-radius:10px;border:1px solid #dce8f2;border-left:4px solid #1e6bb8;font-size:11.5px;line-height:1.6;box-shadow:0 2px 8px rgba(15,39,64,.04);"><div style="font-size:9.5px;font-weight:800;color:#1e6bb8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;">Asistente Inteligente SGRT</div><b>Hola, ¿cómo estás?</b><br>Pregúntame lo que quieras. Puedo conversar, resolver curiosidades, explicar conceptos, ayudarte con SGRT, analizar archivos y transformar cualquier respuesta en resumen, podcast, infografía, video o documento.<br><span style="color:#64748b;">Cuando preguntes por datos reales del sistema, usaré únicamente la información disponible en SGRT.</span></div>';
    var oldQuick=document.getElementById('sgrt42-quick');if(oldQuick)oldQuick.remove();var quick=document.createElement('div');quick.id='sgrt42-quick';quick.style.cssText='display:flex;gap:5px;flex-wrap:wrap;padding:9px 10px;background:#f8fbfd;border-bottom:1px solid #e2e8f0;';
    [['Pregunta libre','Tengo una pregunta: '],['Resumen','Explícame lo que estoy viendo y dame un resumen claro de: '],['Podcast','Crea un podcast conversacional sobre: '],['Infografía','Crea una infografía clara sobre: '],['Video resumen','Crea un video resumen explicativo sobre: '],['SGRT','Explícame de forma sencilla: '],['Informe','Genera un informe ejecutivo con los datos actuales del SGRT y muéstralo como documento editable.'],['Adjuntos','Voy a adjuntar archivos. Analiza únicamente su contenido y dime hallazgos, diferencias y acciones.']].forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q[0];b.style.cssText='padding:5px 9px;border:1px solid #bdd2e5;border-radius:999px;background:white;color:#1e4f78;font-size:10px;font-weight:700;cursor:pointer;';b.onclick=function(){inp.value=q[1];inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);};quick.appendChild(b);});chat.parentElement.insertBefore(quick,chat);
    var attach=document.getElementById('sgrt41-ai-file');if(attach){attach.multiple=true;attach.setAttribute('multiple','multiple');if(attach.previousElementSibling&&attach.previousElementSibling.tagName==='BUTTON')attach.previousElementSibling.textContent='Adjuntar';}
    var sendBtn=inp.parentElement&&Array.from(inp.parentElement.querySelectorAll('button')).find(function(b){return b!==attach&&b.textContent!=='Adjuntar';});if(sendBtn){sendBtn.textContent='Enviar';sendBtn.style.background='#1e6bb8';}
    inp.placeholder='Escribe cualquier pregunta o solicitud…';inp.style.fontSize='12px';
    if(attach){attach.onchange=function(){var fs=Array.from(attach.files||[]).slice(0,4),lab=document.getElementById('sgrt41-ai-file-label');if(lab){lab.style.display=fs.length?'block':'none';lab.textContent=fs.length?(fs.length===1?fs[0].name:(fs.length+' archivos adjuntos')):'';}};}
    window.enviarMensajeAsistente=async function(){
      var msg=norm(inp.value),fi=document.getElementById('sgrt41-ai-file'),files=fi?Array.from(fi.files||[]).slice(0,4):[];if(!msg&&!files.length)return;
      var shown=msg||(files.length?('Analiza '+files.length+' archivo(s) adjunto(s): '+files.map(function(f){return f.name;}).join(', ')):'');addChat('user',shown);chatHistory.push({role:'user',content:shown});saveHistory();inp.value='';
      var wait=addChat('assistant','Estoy revisando tu solicitud…');
      try{
        var sendPrompt=msg||'Analiza los archivos adjuntos y responde exactamente a lo que contienen, sin inventar información.';
        var ans=await aiSend(sendPrompt,files);if(wait)wait.remove();var answerDiv=addChat('assistant',ans);enhanceAssistantMessageTools(answerDiv,ans);chatHistory.push({role:'assistant',content:ans});saveHistory();
        var lm=low(msg),action=/(genera|generar|crea|crear|haz|redacta|redactar|prepara|preparar|descarga|descargar|elabora|elaborar|convierte|convertir)/.test(lm),ppt=/(powerpoint|\bpptx?\b|presentaci[oó]n)/.test(lm),word=/(\bword\b|\bdocx\b)/.test(lm),report=/(informe|reporte|resumen ejecutivo)/.test(lm),video=/(\bvideo\b|\bvídeo\b|video resumen|vídeo resumen)/.test(lm),podcast=/(podcast|audio resumen|resumen de audio)/.test(lm),infografia=/(infograf[ií]a|resumen visual)/.test(lm),studioSummary=/(resumen inteligente|expl[ií]came lo que estoy viendo)/.test(lm),freeDoc=/(documento|acta|carta|minuta|concepto|procedimiento|plan de acci[oó]n|\bplan\b|propuesta|correo|memorando|checklist|lista de chequeo)/.test(lm);
        if(action){
          if(podcast){addChat('assistant','Te lo abro también en el Studio como podcast narrado.');setTimeout(function(){openPodcastStudio(ans);},120);}
          else if(infografia){addChat('assistant','Te lo abro también como infografía visual.');setTimeout(function(){openInfographicStudio(ans);},120);}
          else if(video){addChat('assistant','Te lo abro en el Studio como video resumen con storyboard y narración.');setTimeout(function(){openVideoStudio(ans);},120);}
          else if(studioSummary){addChat('assistant','Te lo organizo también en una vista de resumen inteligente.');setTimeout(function(){openSummaryStudio(ans);},120);}
          else if(ppt&&!files.length){addChat('assistant','Prepararé la presentación con la plantilla corporativa y los datos actuales del SGRT.');setTimeout(function(){window.sgrtGenerarPowerPointFinal&&window.sgrtGenerarPowerPointFinal(msg);},80);}
          else if(word&&report&&!files.length){addChat('assistant','Prepararé el informe Word con la plantilla corporativa y los datos actuales del SGRT.');setTimeout(function(){window.sgrtGenerarWordFinal&&window.sgrtGenerarWordFinal(msg);},80);}
          else if(report&&!files.length){addChat('assistant','Te lo dejo también como documento editable dentro del SGRT.');setTimeout(function(){window.sgrt42AbrirDocumento&&window.sgrt42AbrirDocumento(ans,'INFORME EJECUTIVO SGRT');},100);}
          else if(word||freeDoc){addChat('assistant','Te lo dejo también como documento editable para que puedas revisarlo antes de guardarlo.');setTimeout(function(){var ttl=/(acta)/.test(lm)?'ACTA':/(carta)/.test(lm)?'CARTA':/(procedimiento)/.test(lm)?'PROCEDIMIENTO':/(plan)/.test(lm)?'PLAN / DOCUMENTO DE TRABAJO':'DOCUMENTO SGRT';openAssistantDocument(ans,ttl);},100);}
        }
      }catch(e){
        if(wait)wait.remove();var txt='No fue posible usar el servicio de asistencia: '+e.message;if(/GEMINI_API_KEY|OPENAI_API_KEY|AI_NOT_CONFIGURED/.test(String(e.message)))txt+='\n\nConfigura GEMINI_API_KEY (o OPENAI_API_KEY) en Azure App Service > Environment variables y reinicia la aplicación.';addChat('assistant',txt);
      }finally{if(fi)fi.value='';var lab=document.getElementById('sgrt41-ai-file-label');if(lab){lab.style.display='none';lab.textContent='';}}
    };
    aiStatus();
  }
  // Refuerzo para el problema de "Terceros Registrados" del Administrador de Riesgos:
  // al entrar al panel o cambiar a la pestaña Terceros se vuelve a hidratar /api/terceros + /api/sgrt-state.
  function refreshAdminRecords(){try{window.sgrt42RefrescarRegistrosAdmin&&window.sgrt42RefrescarRegistrosAdmin();}catch(e){}}
  var oldSwitch=window.switchIGTab;if(typeof oldSwitch==='function'&&!oldSwitch._sgrt42final){var sw=function(tab){var r=oldSwitch.apply(this,arguments);if(tab==='terceros')setTimeout(refreshAdminRecords,50);return r;};sw._sgrt42final=true;window.switchIGTab=sw;}
  var oldNav=window.navTo;if(typeof oldNav==='function'&&!oldNav._sgrt42final){var nv=function(el,pg){var r=oldNav.apply(this,arguments);if(pg==='pg-info-general')setTimeout(refreshAdminRecords,120);if(pg==='pg-reportes-entidad')setTimeout(function(){reportCard('pg-reportes-entidad','rpe-wrap-op');fillFilters();},120);return r;};nv._sgrt42final=true;window.navTo=nv;}
  var oldGo=window.goPageIS;if(typeof oldGo==='function'&&!oldGo._sgrt42final){var go=function(pg){var r=oldGo.apply(this,arguments);if(pg==='admin-pg-reportes-entidad')setTimeout(function(){reportCard('admin-pg-reportes-entidad','admin-rpe-wrap');fillFilters();},120);return r;};go._sgrt42final=true;window.goPageIS=go;}

  function install(){if(isIS())reportCard('admin-pg-reportes-entidad','admin-rpe-wrap');else reportCard('pg-reportes-entidad','rpe-wrap-op');enhanceChat();if(document.getElementById('ig-tbody-terceros'))refreshAdminRecords();}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(install,900);setTimeout(install,2600);});
  setTimeout(install,3400);
})();

/* ============================================================================
 * SGRT 42-D — EVALUADOR: DETALLE REAL POR CONTRATO + COPIA ENTRE CONTRATOS
 * 2026-09-19
 * - No usa promedios globales ni inventa 0/BAJO cuando no hay puntaje.
 * - Lee exclusivamente tipologías configuradas para cada tercero + contrato.
 * - Amplía "Rellenar" para listar TODOS los contratos conocidos y, opcionalmente,
 *   otro tercero de la misma entidad. Solo copia la tipología seleccionada.
 * - Mantiene el módulo 42; no agrega ningún módulo nuevo.
 * ============================================================================ */
(function(){
  'use strict';
  function norm(v){return String(v==null?'':v).trim();}
  function low(v){return norm(v).toLowerCase();}
  function esc(v){return norm(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function db(){if(!window.TERCEROS_DB)window.TERCEROS_DB={};return window.TERCEROS_DB;}
  function role(){return low((window.currentUser||{}).rol);}
  function isEvaluator(){var u=window.currentUser||{},r=role();return u.login==='evaluador'||u.login==='evaluador_colpensiones'||r==='evaluador'||r==='cliente';}
  function isIS(){var u=window.currentUser||{},r=role();return u.login==='iseguras2026'||r==='is'||r==='iseguras'||r==='superadministrador'||r==='super administrador';}
  function entityKey(v){var s=low(v);try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}s=s.replace(/[^a-z0-9]/g,'');if(!s)return '';if(s==='cliente1'||s.indexOf('colpensiones')>=0)return 'colpensiones';return s;}
  function userEntity(){var u=window.currentUser||{},e=entityKey(u.entidad||u.entidadId||u.organizacion);if(!e&&!isIS())e='colpensiones';return e;}
  function thirdEntity(t){return entityKey(t&&(t.entidad||t.entidadId||t.entidadLabel||t.NombreEntidad||t.organizacion))||'colpensiones';}
  function sameEntity(t){return isIS()||thirdEntity(t)===userEntity();}
  function canon(v){var s=norm(v);if(/^\d+$/.test(s)){var n=parseInt(s,10);return isNaN(n)?s:String(n);}return low(s);}
  function cnum(c){return norm(c&&(c.num||c.numero||c.NoContrato||c.noContrato||c.contrato));}
  function mapKey(map,c){if(!map||typeof map!=='object')return '';var cc=canon(c),ks=Object.keys(map);for(var i=0;i<ks.length;i++)if(canon(ks[i])===cc)return ks[i];return '';}
  function dimKey(d){return norm(d&&(d.key||d.id||d.codigo||d.nombre||d.tipologia));}
  function dimName(d){return norm(d&&(d.nombre||d.nombre_tipologia||d.tipologia||d.name||d.key))||'Tipología';}
  function dimCanon(d){return low(dimKey(d)||dimName(d)).replace(/[^a-z0-9áéíóúüñ]/g,'');}
  function exactDims(t,c){
    if(!t||!c)return [];
    var k=mapKey(t.dimsPorContrato,c),a=k&&t.dimsPorContrato[k];
    if(!Array.isArray(a)){k=mapKey(t.tipologiasPorContrato,c);a=k&&t.tipologiasPorContrato[k];}
    return Array.isArray(a)?clone(a):[];
  }
  function exactResponses(t,c){
    if(!t||!c)return {};
    try{if(typeof window._sgrtEvaluatorExactResponses==='function')return clone(window._sgrtEvaluatorExactResponses(t,c)||{});}catch(e){}
    var maps=[t.respuestasACPorContrato,t.respuestasPorContrato,t._respuestasACPorContrato,t._respuestasPorContrato];
    for(var i=0;i<maps.length;i++){var k=mapKey(maps[i],c);if(k&&maps[i][k]&&typeof maps[i][k]==='object')return clone(maps[i][k]);}
    return {};
  }
  function allContracts(t){
    var out=[],seen={};function add(v){v=norm(v);if(!v)return;var k=canon(v);if(seen[k])return;seen[k]=1;out.push(v);}
    (t&&t.contratos||[]).forEach(function(c){add(cnum(c));});
    add(t&&t.contratoEval);add(t&&t.nocontrato);add(t&&t.NoContrato);add(t&&t.numeroContrato);
    [t&&t.dimsPorContrato,t&&t.tipologiasPorContrato,t&&t.respuestasACPorContrato,t&&t.respuestasPorContrato,t&&t._respuestasACPorContrato,t&&t._respuestasPorContrato,t&&t.promPorContrato,t&&t.acPorContrato,t&&t.borradoresACPorContrato,t&&t.aprobadoPorContrato].forEach(function(m){Object.keys(m||{}).forEach(add);});
    return out.sort(function(a,b){var na=parseFloat(a),nb=parseFloat(b);if(!isNaN(na)&&!isNaN(nb))return na-nb;return a.localeCompare(b,'es');});
  }
  function contractMeta(t,num){return (t&&t.contratos||[]).find(function(c){return canon(cnum(c))===canon(num);})||{};}
  function service(c,t){return norm(c&&(c.objeto||c.servicio||c.servicio_contratado||c.descripcion||c.Objeto))||norm(t&&(t.servicio||t.servicio_contratado))||'Sin objeto/servicio registrado';}
  function supervisors(c,t){
    var a=[];function add(x){if(!x)return;if(typeof x==='string'){if(norm(x))a.push({nombre:norm(x)});return;}var n=norm(x.nombre||x.name||x.supervisor||x.Nombre);if(n)a.push({nombre:n,cargo:norm(x.cargo||x.rol||x.Cargo),proceso:norm(x.proceso||x.area||x.Proceso)});}
    if(Array.isArray(c&&c.supervisores))c.supervisores.forEach(add);else add(c&&c.supervisor);
    if(!a.length&&Array.isArray(t&&t.supervisores))t.supervisores.forEach(add);else if(!a.length)add(t&&t.supervisor);
    var seen={};return a.filter(function(x){var k=low(x.nombre);if(!k||seen[k])return false;seen[k]=1;return true;});
  }
  function rawScore(d){var raw=d&&d.val!==undefined?d.val:(d&&d.calificacion!==undefined?d.calificacion:(d&&d.nivel!==undefined?d.nivel:''));if(raw===null||raw===undefined||norm(raw)==='')return null;var n=parseFloat(raw);return isNaN(n)?null:n;}
  function scoreMeta(v){if(v===null||isNaN(v))return {score:'—',label:'Sin puntaje',color:'#6b7280'};return {score:Number(v).toFixed(2).replace(/\.00$/,''),label:v>=5?'CRÍTICO':v>=4?'ALTO':v>=3?'MEDIO':v>=2?'BAJO':'MUY BAJO',color:v>=5?'#dc2626':v>=4?'#ea580c':v>=3?'#d97706':v>=2?'#2563eb':'#16a34a'};}
  function contractAverage(t,c){var vals=exactDims(t,c).map(rawScore).filter(function(v){return v!==null;});return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;}
  function riskLabel(p){return p===null?'Sin clasificar':(p>=4?'EXTREMO':p>=3?'ALTO':p>=2?'MODERADO':'BAJO');}
  async function refreshFromServer(){try{if(typeof window.sgrtCargarDesdeServidor==='function')await window.sgrtCargarDesdeServidor({forceServer:true,silentUi:true});}catch(e){console.warn('[SGRT42-D refresh]',e.message);}}

  async function showRealDetail(nit){
    nit=norm(nit);if(!nit)return;await refreshFromServer();var t=db()[nit];if(!t)return;
    ['_cls-det','sgrt-detalle-clasificacion-modal'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
    var cons=allContracts(t),body=cons.map(function(num){var c=contractMeta(t,num),dims=exactDims(t,num),p=contractAverage(t,num),ss=supervisors(c,t),pm=p===null?'—':p.toFixed(2),rz=riskLabel(p);
      var sup=ss.length?ss.map(function(x){return '<div style="padding:6px 8px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:6px;"><b style="color:#6b21a8;">'+esc(x.nombre)+'</b>'+(x.cargo?'<span style="color:#64748b;"> · '+esc(x.cargo)+'</span>':'')+(x.proceso?'<div style="font-size:10.5px;color:#64748b;margin-top:2px;">'+esc(x.proceso)+'</div>':'')+'</div>';}).join(''):'<span style="color:#94a3b8;">Sin supervisor asociado</span>';
      var tips=dims.length?dims.map(function(d){var m=scoreMeta(rawScore(d));return '<div style="display:grid;grid-template-columns:minmax(220px,1fr) 70px 105px;gap:8px;align-items:center;padding:8px 10px;border-bottom:1px solid #eef2f7;"><div style="font-size:11.5px;font-weight:700;color:#1a3a5c;">'+esc(dimName(d))+'</div><div style="font-family:Montserrat,sans-serif;font-size:17px;font-weight:800;color:'+m.color+';text-align:center;">'+esc(m.score)+'</div><div style="font-size:9.5px;font-weight:800;color:'+m.color+';text-align:center;">'+esc(m.label)+'</div></div>';}).join(''):'<div style="padding:12px;color:#94a3b8;text-align:center;font-size:11px;">Sin tipologías habilitadas para este contrato por el Administrador de Riesgos.</div>';
      return '<div style="border:1px solid #dbe3ec;border-radius:9px;overflow:hidden;margin-bottom:13px;background:white;"><div style="padding:10px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;"><div style="font-size:13px;font-weight:800;color:#1a3a5c;">Contrato '+esc(num)+'</div><div style="display:flex;gap:8px;align-items:center;"><span style="padding:4px 9px;border-radius:12px;background:#eff6ff;color:#1e40af;font-size:10px;font-weight:800;">Promedio '+esc(pm)+'</span><span style="padding:4px 9px;border-radius:12px;background:'+(p===null?'#f8fafc':'#fef2f2')+';color:'+(p===null?'#64748b':'#b91c1c')+';font-size:10px;font-weight:800;">Nivel de riesgo: '+esc(rz)+'</span></div></div><div style="font-size:10.5px;color:#475569;margin-top:5px;">'+esc(service(c,t))+'</div></div><div style="padding:10px 12px;border-bottom:1px solid #eef2f7;"><div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Supervisor(es) relacionados</div><div style="display:flex;flex-direction:column;gap:5px;">'+sup+'</div></div><div><div style="padding:8px 10px;background:#f8fafc;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;display:grid;grid-template-columns:minmax(220px,1fr) 70px 105px;gap:8px;"><span>Tipología</span><span style="text-align:center;">Puntaje</span><span style="text-align:center;">Clasificación</span></div>'+tips+'</div></div>';
    }).join('');
    var ov=document.createElement('div');ov.id='_cls-det';ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10080;display:flex;align-items:flex-start;justify-content:center;padding:34px 12px;overflow:auto;';ov.onclick=function(e){if(e.target===ov)ov.remove();};
    ov.innerHTML='<div style="background:white;border-radius:12px;width:840px;max-width:98vw;max-height:calc(100vh - 68px);overflow:auto;box-shadow:0 12px 50px rgba(0,0,0,.25);"><div style="padding:15px 20px;background:linear-gradient(135deg,#0d2740,#1e6bb8);border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;gap:12px;"><div><div style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:white;">Detalle de clasificación</div><div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:3px;">'+esc(t.nombre||nit)+' · NIT '+esc(t.nit||nit)+'</div></div><button onclick="document.getElementById(\'_cls-det\').remove()" style="background:none;border:none;color:rgba(255,255,255,.8);font-size:22px;cursor:pointer;padding:0;">&times;</button></div><div style="padding:16px 18px;">'+(body||'<div style="color:#64748b;">Este tercero no tiene contratos registrados.</div>')+'<div style="display:flex;justify-content:flex-end;"><button onclick="document.getElementById(\'_cls-det\').remove()" class="btn btn-outline">Cerrar</button></div></div></div>';
    document.body.appendChild(ov);
  }
  window.sgrtVerDetalleClasificacion=function(nit){return showRealDetail(nit);};
  var priorRead=window.clsVerDetalleLectura;window.clsVerDetalleLectura=function(nit){if(isEvaluator())return showRealDetail(nit);return typeof priorRead==='function'?priorRead.apply(this,arguments):undefined;};

  // ANÁLISIS DE RIESGOS: contrato y tipologías vienen de la clasificación real.
  // No crea riesgos ficticios; solo limita el formulario a lo que el Administrador
  // de Riesgos habilitó para ese tercero + contrato.
  function findThird(v){
    v=norm(v);if(!v)return null;
    if(db()[v])return db()[v];
    var vals=Object.values(db());
    return vals.find(function(t){return t&&(norm(t.nit||t.NIT)===v||norm(t.nombre||t.Nombre_Tercero)===v);})||null;
  }
  function riskTipologies(t,contract){
    var out=[],seen={};
    function add(d){var k=textCanon(dimKey(d)||dimName(d));if(!k||seen[k])return;seen[k]=1;out.push(d);}
    if(contract)exactDims(t,contract).forEach(add);
    else allContracts(t).forEach(function(c){exactDims(t,c).forEach(add);});
    return out;
  }
  function populateRiskTipologies(t,contract,preferred){
    var sel=document.getElementById('nr-tipo');if(!sel)return;
    var dims=t?riskTipologies(t,contract):[],want=norm(preferred||sel.value);
    sel.innerHTML='<option value="">— Seleccionar —</option>'+dims.map(function(d){
      var n=dimName(d),v=n||dimKey(d);return '<option value="'+esc(v)+'">'+esc(n)+'</option>';
    }).join('');
    if(want&&Array.from(sel.options).some(function(o){return o.value===want;}))sel.value=want;
    if(!dims.length){
      var o=document.createElement('option');o.value='';o.textContent=contract?'Sin tipologías habilitadas para este contrato':'Selecciona un contrato con tipologías';o.disabled=true;sel.appendChild(o);
    }
  }
  function populateRiskContracts(idOrName,preferredContract,preferredTip){
    var t=findThird(idOrName),sel=document.getElementById('nr-contrato');if(!sel)return;
    var want=norm(preferredContract||sel.value),cs=t?allContracts(t):[];
    sel.innerHTML='<option value="">— Seleccionar contrato —</option>'+cs.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('');
    if(want&&cs.some(function(c){return canon(c)===canon(want);})) {
      var real=cs.find(function(c){return canon(c)===canon(want);});sel.value=real||want;
    } else if(cs.length===1) sel.value=cs[0];
    populateRiskTipologies(t,norm(sel.value),preferredTip);
  }
  window.sgrt42PoblarRiesgoContratoTipologia=populateRiskContracts;
  var priorNr=window.nrPoblarContratos;
  window.nrPoblarContratos=function(idOrName){
    // El wrapper 42 es la fuente final para evitar que un módulo viejo vuelva a
    // dejar únicamente t.contratos y omita contratos presentes en Azure.
    try{populateRiskContracts(idOrName,'','');}catch(e){console.warn('[SGRT42 riesgo]',e);}
  };
  document.addEventListener('change',function(e){
    if(e&&e.target&&e.target.id==='nr-contrato'){
      var third=(document.getElementById('nr-tercero')||{}).value,t=findThird(third);
      populateRiskTipologies(t,norm(e.target.value),'');
    }
  });
  var priorAbrirRiesgo=window.abrirNuevoRiesgo;
  if(typeof priorAbrirRiesgo==='function'&&!priorAbrirRiesgo._sgrt42contract){
    var ar=function(){var r=priorAbrirRiesgo.apply(this,arguments);setTimeout(async function(){
      await refreshFromServer();
      var ts=document.getElementById('nr-tercero');if(ts&&ts.value)populateRiskContracts(ts.value,'','');
    },40);return r;};ar._sgrt42contract=true;window.abrirNuevoRiesgo=ar;
  }
  var priorEditarRiesgo=window.editarRiesgo;
  if(typeof priorEditarRiesgo==='function'&&!priorEditarRiesgo._sgrt42contract){
    var er=function(id){var row=(window.MATRIZ_DB||[]).find(function(x){return norm(x&&x.id)===norm(id);});var r=priorEditarRiesgo.apply(this,arguments);setTimeout(function(){
      var ts=document.getElementById('nr-tercero'),third=ts&&ts.value;if(third)populateRiskContracts(third,row&&row.contrato,row&&row.tipo);
    },20);return r;};er._sgrt42contract=true;window.editarRiesgo=er;
  }

  function currentTarget(){var nit=norm((document.getElementById('q-tercero')||{}).value||(document.getElementById('ac-tercero-instruc')||{}).value),t=db()[nit]||{},c=norm((document.getElementById('q-contrato-sel')||{}).value||(document.getElementById('ac-contrato-sel')||{}).value||t.contratoEval);return {nit:nit,t:t,contract:c};}
  function sourceThirds(targetNit){return Object.keys(db()).filter(function(n){var t=db()[n];return t&&sameEntity(t)&&allContracts(t).length;}).sort(function(a,b){return norm((db()[a]||{}).nombre||a).localeCompare(norm((db()[b]||{}).nombre||b),'es');});}
  function textCanon(v){var z=low(v);try{z=z.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return z.replace(/[^a-z0-9]/g,'');}
  function dimAliases(d){
    var vals=[d&&d.key,d&&d.id,d&&d.codigo,d&&d.nombre,d&&d.nombre_tipologia,d&&d.tipologia,d&&d.name];
    try{if(typeof window._nombreTipologia==='function')vals.push(window._nombreTipologia(d));}catch(e){}
    var out=[],seen={};vals.forEach(function(v){v=norm(v);if(!v)return;var k=textCanon(v);if(!k||seen[k])return;seen[k]=1;out.push({raw:v,canon:k});});return out;
  }
  function responseKeyFor(srcR,d){
    if(!srcR||typeof srcR!=='object')return '';
    var aliases=dimAliases(d),keys=Object.keys(srcR);
    for(var i=0;i<aliases.length;i++)if(Object.prototype.hasOwnProperty.call(srcR,aliases[i].raw))return aliases[i].raw;
    for(var j=0;j<keys.length;j++){var kc=textCanon(keys[j]);if(aliases.some(function(a){return a.canon===kc;}))return keys[j];}
    return '';
  }
  function bucketHasAnswers(bucket){
    if(!bucket||typeof bucket!=='object')return false;
    return Object.keys(bucket).some(function(k){
      var v=bucket[k];if(v===null||v===undefined)return false;
      if(typeof v!=='object')return norm(v)!=='';
      return Object.keys(v).some(function(q){var x=v[q];return x!==null&&x!==undefined&&(typeof x!=='string'||norm(x)!=='');});
    });
  }
  function tipMatchList(srcT,srcC,targetT,targetC){
    var srcD=exactDims(srcT,srcC),tarD=exactDims(targetT,targetC),srcR=exactResponses(srcT,srcC),out=[];
    tarD.forEach(function(td){
      var ta=dimAliases(td),sd=srcD.find(function(x){var xa=dimAliases(x);return xa.some(function(a){return ta.some(function(b){return a.canon===b.canon;});});});
      var sourceKey=sd?responseKeyFor(srcR,sd):responseKeyFor(srcR,td);
      var bucket=sourceKey?srcR[sourceKey]:null;
      if(sourceKey&&bucketHasAnswers(bucket))out.push({targetKey:dimKey(td),sourceKey:sourceKey,name:dimName(td)});
    });
    return out;
  }
  function persistLocal(){try{localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(db()));}catch(e){}try{var s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');s.TERCEROS_DB=db();localStorage.setItem('sgrt_v8',JSON.stringify(s));}catch(e2){}try{window._lsSave&&window._lsSave();}catch(e3){}}
  async function copyTipology(srcNit,srcC,targetNit,targetC,sourceKey,targetKey){
    var srcT=db()[srcNit],tarT=db()[targetNit];if(!srcT||!tarT)return 0;var src=exactResponses(srcT,srcC),out=exactResponses(tarT,targetC),source=src[sourceKey]||{},allowed=[];
    try{if(typeof window._ctrlsCuest==='function')allowed=(window._ctrlsCuest(targetNit,targetKey,targetC)||[]).map(function(q){return String(q.n);});}catch(e){}
    if(!allowed.length)allowed=Object.keys(source||{});if(!out[targetKey])out[targetKey]={};var n=0;allowed.forEach(function(q){if(source&&source[q]!==undefined){out[targetKey][q]=clone(source[q]);n++;}});
    tarT.respuestasACPorContrato=tarT.respuestasACPorContrato&&typeof tarT.respuestasACPorContrato==='object'?tarT.respuestasACPorContrato:{};var k=mapKey(tarT.respuestasACPorContrato,targetC)||targetC;tarT.respuestasACPorContrato[k]=clone(out);tarT.savedAt=new Date().toISOString();tarT._changed=true;tarT.sincronizado=false;if(!window.CUEST_RESPUESTAS)window.CUEST_RESPUESTAS={};window.CUEST_RESPUESTAS[targetNit]=clone(out);persistLocal();
    if(typeof window._sgrtSyncEvaluatorContract==='function')await window._sgrtSyncEvaluatorContract(targetNit,targetC,{replaceResponses:true,respuestas:clone(out)});
    try{var q=document.getElementById('q-contrato-sel');if(q)q.value=targetC;if(typeof window.qCambiarContrato==='function')window.qCambiarContrato(targetC);}catch(e2){}
    return n;
  }
  function enhanceCopyBox(){
    if(!isEvaluator())return;var target=currentTarget();if(!target.nit||!target.contract)return;var old=document.getElementById('sgrt-eval-copy-box');
    if(!old){var anchor=document.getElementById('q-tipologias-panel')||document.getElementById('q-secciones-wrap');var page=document.getElementById('pg-cuestionario'),cuest=document.getElementById('cq-panel-cuest');if(!anchor||!anchor.parentNode||!page||!page.classList.contains('active')||(cuest&&cuest.style.display==='none'))return;old=document.createElement('div');old.id='sgrt-eval-copy-box';old.style.cssText='background:white;border:1px solid #dbe3ea;border-radius:8px;padding:11px 14px;margin-bottom:12px;font-size:11.5px;color:#334155;';anchor.parentNode.insertBefore(old,anchor);}
    if(old.dataset.sgrt42extended)return;old.dataset.sgrt42extended='1';
    var thirds=sourceThirds(target.nit);if(!thirds.length){old.style.display='none';return;}
    old.innerHTML='<label style="display:flex;align-items:center;gap:8px;font-weight:700;cursor:pointer;"><input id="sgrt-eval-copy-check" type="checkbox"> Rellenar una tipología con respuestas ya diligenciadas</label><div id="sgrt-eval-copy-options" style="display:none;margin-top:9px;gap:8px;align-items:center;flex-wrap:wrap;"><select id="sgrt42-copy-third" style="min-width:210px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;"></select><select id="sgrt42-copy-contract" style="min-width:160px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;"></select><select id="sgrt42-copy-tip" style="min-width:230px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;background:white;"></select><button type="button" id="sgrt42-copy-apply" style="padding:7px 12px;border:1px solid #1e6bb8;background:#1e6bb8;color:white;border-radius:6px;font-weight:700;cursor:pointer;">Rellenar esta tipología</button><span style="color:#64748b;">Solo se copia la tipología elegida. Las demás conservan sus propias respuestas.</span></div>';
    var check=old.querySelector('#sgrt-eval-copy-check'),opts=old.querySelector('#sgrt-eval-copy-options'),thirdSel=old.querySelector('#sgrt42-copy-third'),contractSel=old.querySelector('#sgrt42-copy-contract'),tipSel=old.querySelector('#sgrt42-copy-tip'),btn=old.querySelector('#sgrt42-copy-apply');
    thirdSel.innerHTML=thirds.map(function(n){var t=db()[n]||{};return '<option value="'+esc(n)+'"'+(n===target.nit?' selected':'')+'>'+esc((t.nombre||n)+' · '+n)+'</option>';}).join('');
    function fillContracts(){var sn=norm(thirdSel.value),st=db()[sn]||{},cs=allContracts(st).filter(function(c){return sn!==target.nit||canon(c)!==canon(target.contract);});contractSel.innerHTML=cs.length?cs.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join(''):'<option value="">Sin otros contratos con información</option>';fillTips();}
    function fillTips(){var sn=norm(thirdSel.value),sc=norm(contractSel.value),list=sc?tipMatchList(db()[sn]||{},sc,target.t,target.contract):[];tipSel.innerHTML=list.length?list.map(function(x){return '<option value="'+esc(x.targetKey)+'" data-source-key="'+esc(x.sourceKey)+'">'+esc(x.name)+'</option>';}).join(''):'<option value="">Sin tipologías coincidentes con respuestas</option>';btn.disabled=!list.length;btn.style.opacity=list.length?'1':'.55';}
    check.onchange=async function(){
      opts.style.display=check.checked?'flex':'none';if(!check.checked)return;
      check.disabled=true;
      try{
        await refreshFromServer();
        var refreshed=sourceThirds(target.nit);
        thirdSel.innerHTML=refreshed.map(function(n){var t=db()[n]||{};return '<option value="'+esc(n)+'"'+(n===target.nit?' selected':'')+'>'+esc((t.nombre||n)+' · '+n)+'</option>';}).join('');
        fillContracts();
      }finally{check.disabled=false;}
    };thirdSel.onchange=fillContracts;contractSel.onchange=fillTips;
    btn.onclick=async function(){var sn=norm(thirdSel.value),sc=norm(contractSel.value),op=tipSel.options[tipSel.selectedIndex],tk=norm(tipSel.value),sk=norm(op&&op.getAttribute('data-source-key'));if(!sn||!sc||!tk||!sk)return;var label=norm(op&&op.textContent)||tk,srcName=(db()[sn]||{}).nombre||sn,msg='¿Rellenar únicamente la tipología "'+label+'" del contrato '+target.contract+' usando las respuestas de '+srcName+', contrato '+sc+'?';if(!window.confirm(msg))return;btn.disabled=true;try{var n=await copyTipology(sn,sc,target.nit,target.contract,sk,tk);try{window.showToast&&window.showToast(n?'Se copiaron '+n+' respuesta(s) únicamente en '+label+'.':'No había controles coincidentes para copiar.',n?'success':'warning',3300);}catch(e){}setTimeout(enhanceCopyBox,180);}finally{btn.disabled=false;}};
  }
  var copyObsTimer=null;
  var observer=new MutationObserver(function(){
    if(!isEvaluator())return;
    var pg=document.getElementById('pg-cuestionario');if(!pg||!pg.classList.contains('active'))return;
    clearTimeout(copyObsTimer);copyObsTimer=setTimeout(enhanceCopyBox,120);
  });observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(enhanceCopyBox,900);});setTimeout(enhanceCopyBox,1600);

  function fixEvaluatorRegistryScores(){
    if(!isEvaluator())return;var body=document.getElementById('ig-tbody-terceros');if(!body)return;
    Array.from(body.querySelectorAll('tr')).forEach(function(tr){var cells=tr.cells;if(!cells||cells.length<5)return;var nit=norm(cells[0].textContent),t=db()[nit];if(!t)return;var vals=[];allContracts(t).forEach(function(c){exactDims(t,c).forEach(function(d){var v=rawScore(d);if(v!==null)vals.push(v);});});var p=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;
      if(cells.length>=6){cells[3].innerHTML=p===null?'<span class="chip" style="font-size:10px;color:#64748b;">—</span>':'<span class="chip" style="font-size:10px;">'+p.toFixed(2)+'</span>';cells[4].innerHTML='<span class="chip" style="font-size:10px;">'+esc(riskLabel(p))+'</span>';}
    });
  }
  var oldClsRender=window.clsRender;if(typeof oldClsRender==='function'&&!oldClsRender._sgrt42scores){var cr=function(){var r=oldClsRender.apply(this,arguments);if(isEvaluator())setTimeout(fixEvaluatorRegistryScores,0);return r;};cr._sgrt42scores=true;window.clsRender=cr;}

  function renderTrackingPending(){
    var page=document.getElementById('pg-seguimiento');if(!page)return;var card=document.getElementById('sgrt42-seguimiento-pendientes');if(!card){card=document.createElement('div');card.id='sgrt42-seguimiento-pendientes';card.className='card';card.style.cssText='margin-bottom:12px;border-left:4px solid #1e6bb8;';var target=page.querySelector('.card')||page.firstElementChild;if(target&&target.parentNode)target.parentNode.insertBefore(card,target);else page.insertBefore(card,page.firstChild);}
    var data=typeof window.sgrt42CollectReport==='function'?window.sgrt42CollectReport():null,list=data&&typeof window.sgrt42PendingActions==='function'?window.sgrt42PendingActions(data):[];card.innerHTML='<div style="padding:11px 14px;border-bottom:1px solid #e2e8f0;font-weight:800;color:#173b5f;">Pendientes derivados del SGRT</div><div style="padding:10px 14px;">'+(list&&list.length?list.slice(0,10).map(function(x){return '<div style="padding:6px 0;border-bottom:1px solid #eef2f7;font-size:10.8px;color:#334155;">'+esc(x)+'</div>';}).join(''):'<div style="font-size:10.8px;color:#64748b;">No hay pendientes automáticos para los filtros actuales.</div>')+'</div>';
  }
  window.sgrt42RenderTrackingPending=renderTrackingPending;

  // Al entrar al flujo del Evaluador se refresca Azure para reflejar inmediatamente
  // las tipologías habilitadas por el Administrador de Riesgos.
  var oldNav=window.navTo;if(typeof oldNav==='function'&&!oldNav._sgrt42evalrefresh){var nv=function(el,pg){var r=oldNav.apply(this,arguments);if(pg==='pg-seguimiento')setTimeout(renderTrackingPending,100);if(isEvaluator()&&(pg==='pg-cuestionario'||pg==='pg-clasificacion'))setTimeout(async function(){await refreshFromServer();try{window.acPoblarSelectorTerceroInstruc&&window.acPoblarSelectorTerceroInstruc();window.clsRender&&pg==='pg-clasificacion'&&window.clsRender();}catch(e){}setTimeout(enhanceCopyBox,120);},80);return r;};nv._sgrt42evalrefresh=true;window.navTo=nv;}
})();
