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
  function remoteSave(t,delay){
    if(!t||!t.nit||typeof window._sgrtUpsertEstadoCompleto!=='function')return;
    var k=norm(t.nit);clearTimeout(syncTimers[k]);
    syncTimers[k]=setTimeout(function(){
      try{Promise.resolve(window._sgrtUpsertEstadoCompleto(t)).catch(function(err){console.warn('SGRT 42-A Azure:',err);});}catch(e){}
    },delay==null?350:delay);
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
    var vals=dims.map(function(d){var v=parseFloat(d.val);return isNaN(v)?null:v;}).filter(function(v){return v!==null;});
    var p=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0;
    t.promPorContrato[contract]={prom:Number(p.toFixed(2)),zona:zone(p)};
    t.prom=Number(p.toFixed(2));t.zona=zone(p);
    var c=(t.contratos||[]).find(function(x){return canonContract(contractNum(x))===canonContract(contract);});
    if(c){
      c.clasificacion_lista=dims.length>0;
      // Mantener también las copias contractuales legadas alineadas para que
      // ningún lector antiguo pueda rescatar tipologías de otro contrato.
      c.dims=clone(dims);c.tipologias=clone(dims);c.clasificacion=clone(dims);
    }
    t._changed=true;t.sincronizado=false;t.savedAt=new Date().toISOString();
    localSave();if(doRemote!==false)remoteSave(t,300);return true;
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
      if(previous&&previous!==num){t._changed=true;t.sincronizado=false;remoteSave(t,260);}
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
  ['agregarTipologiaSeleccionada','quitarDim','onDimDynChange','guardarValoracionTipologias'].forEach(wrapSaveAfter);

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
    if(isNaN(p))p=0;if(!z)z=p>=4?'EXTREMO':p>=3?'ALTO':p>=2?'MODERADO':'BAJO';return {p:p,z:z};
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
        localSave();lastLoad=Date.now();return {ok:true,count:Object.keys(db()).length};
      }catch(e){console.warn('[SGRT42] No se pudo refrescar Azure:',e.message);return {ok:false,error:e.message};}
      finally{loading=null;}
    })();return loading;
  }

  function renderAdminThirds(){
    if(!isRiskAdmin())return false;var body=document.getElementById('ig-tbody-terceros');if(!body)return false;
    var table=body.closest('table'),head=table&&table.querySelector('thead');if(head)head.innerHTML='<tr><th>NIT</th><th>Nombre</th><th>Organización</th><th>F. Inicio</th><th>F. Término</th><th>Criticidad</th><th>Exposición al Riesgo</th><th>Acciones</th></tr>';
    var entries=Object.values(db()).filter(function(t){return t&&norm(t.nit||t.NIT)&&entityAllowed(t);}).sort(function(a,b){return norm(a.nombre||a.Nombre_Tercero||a.nit).localeCompare(norm(b.nombre||b.Nombre_Tercero||b.nit),'es');});
    body.innerHTML=entries.length?entries.map(function(t){
      var nit=norm(t.nit||t.NIT),name=norm(t.nombre||t.Nombre_Tercero)||nit,ri=riskInfo(t),cc=ri.p>=4?'c-crit':ri.p>=3?'c-alto':'c-bajo';
      return '<tr data-nit="'+esc(nit)+'"><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+esc(nit)+'</td><td style="font-size:12.5px;font-weight:700;">'+esc(name)+'</td><td style="font-size:11px;">'+esc(displayEntity(t))+'</td><td style="font-size:11px;">'+esc(firstDate(t,'start'))+'</td><td style="font-size:11px;">'+esc(firstDate(t,'end'))+'</td><td><span class="chip '+cc+'" style="font-size:10px;">'+(ri.p?ri.p.toFixed(2):'—')+'</span></td><td><span class="chip '+cc+'" style="font-size:10px;">'+esc(ri.z)+'</span></td><td style="white-space:nowrap;"><button class="btn btn-outline btn-xs" onclick="verDetalleTercero(\''+esc(nit)+'\')">👁 Ver detalle</button> <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+esc(nit)+'\');},120)">📁 Documentos</button></td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">📋 No hay terceros registrados para esta entidad.</td></tr>';
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
  function promContract(t,c){var m=t&&t.promPorContrato,k=mapKey(m,c),v=k&&m[k];if(v&&typeof v==='object')v=v.prom;v=parseFloat(v);if(isNaN(v))v=parseFloat(t&&t.prom);return isNaN(v)?0:v;}
  function zoneContract(t,c){var m=t&&t.promPorContrato,k=mapKey(m,c),v=k&&m[k];return norm(v&&typeof v==='object'?v.zona:'')||norm(t&&t.zona);}

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
    if(useAI())try{narrative=await aiNarrative(data,(custom?('Solicitud específica del usuario: '+custom+'\n'):'')+'Redacta un resumen ejecutivo muy concreto para una presentación de avance: actividades realizadas, avance, riesgos/barreras y próximas actividades.');}catch(e){toast('La IA no respondió; se usará el resumen calculado por SGRT.','warning',3800);}
    try{
      await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js',function(){return !!(window.pptxgen||window.PptxGenJS);});
      var C=window.pptxgen||window.PptxGenJS,pptx=new C();pptx.layout='LAYOUT_WIDE';pptx.author='Infraestructuras Seguras S.A.S.';pptx.subject='SGRT';pptx.title='Informe Ejecutivo SGRT';
      var bg=await fetchDataUri(ASSET+'plantilla_slide.png'),colp=await fetchDataUri(ASSET+'logo_colpensiones.png').catch(function(){return null;});
      function base(title,sub){var s=pptx.addSlide();s.addImage({data:bg,x:0,y:0,w:13.333,h:7.5});s.addText(title,{x:3.75,y:.62,w:8.6,h:.45,fontFace:'Arial',fontSize:21,bold:true,color:'173B5F',margin:0});if(sub)s.addText(sub,{x:3.78,y:1.09,w:8.35,h:.35,fontFace:'Arial',fontSize:10.5,color:'64748B',margin:0});if(colp&&entityKey(data.entity)==='colpensiones')s.addImage({data:colp,x:10.8,y:6.75,w:1.65,h:.45,transparency:8});return s;}
      function card(s,x,y,w,label,value){s.addText(String(value),{x:x,y:y,w:w,h:.55,fontSize:24,bold:true,color:'173B5F',align:'center',fill:{color:'FFFFFF',transparency:8},line:{color:'C9D8E6',pt:1},margin:.04});s.addText(label,{x:x,y:y+.58,w:w,h:.28,fontSize:9.5,bold:true,color:'52677B',align:'center',margin:0});}
      var cover=base('Informe Ejecutivo · Riesgo de Terceros',entityName(data.entity)+' · '+data.generated.toLocaleDateString('es-CO'));
      cover.addText(data.third?((db()[data.third]||{}).nombre||data.third):'Consolidado de evaluación',{x:4.05,y:2.2,w:7.7,h:.8,fontSize:31,bold:true,color:'173B5F',margin:0});cover.addText(data.contract?'Contrato '+data.contract:'Ambiente de control · Análisis de riesgos · Evidencias',{x:4.08,y:3.18,w:7.2,h:.5,fontSize:15,color:'2B6FAE',bold:true,margin:0});
      var s2=base('Actividades realizadas y estado de avance','Indicadores del corte actual');card(s2,4.0,1.65,1.65,'Terceros',data.thirds.length);card(s2,5.85,1.65,1.65,'Contratos',data.contracts);card(s2,7.7,1.65,1.65,'Dimensiones',ds.length);card(s2,9.55,1.65,1.65,'Riesgos',data.risks.length);s2.addText(narrative,{x:4.0,y:3.05,w:7.7,h:2.6,fontSize:13.2,color:'334E68',valign:'top',margin:.07,breakLine:false});
      for(var i=0;i<ds.length;i+=6){var chunk=ds.slice(i,i+6),sd=base('Dimensiones de control','Avance, respuestas y nivel de exposición');var table=[['Tercero','Contrato','Dimensión','Avance','Sí','No','N/A']].concat(chunk.map(function(x){return [x.tercero,x.contrato,x.dimension,(x.total?Math.round(100*x.done/x.total):0)+'%',String(x.yes),String(x.no),String(x.na)];}));sd.addTable(table,{x:3.62,y:1.55,w:9.2,h:4.95,border:{type:'solid',color:'D7E2EC',pt:.55},fill:'FFFFFF',fontSize:8.7,color:'243B53',rowH:.42,margin:.04,bold:false});}
      for(var j=0;j<data.risks.length;j+=6){var rr=data.risks.slice(j,j+6),sr=base('Análisis de riesgos','Riesgo inherente, residual y tratamiento');var rt=[['ID','Tercero','Contrato','Riesgo','Inherente','Residual']].concat(rr.map(function(r){return [r.id||r.riesgoId||'—',r.tercero||r.nit||'—',r.contrato||'—',norm(r.desc||r.descripcion).slice(0,95),r.zonaInh||r.zonaInherente||'—',r.zonaRes||r.zonaResidual||'—'];}));sr.addTable(rt,{x:3.62,y:1.55,w:9.2,h:4.9,border:{type:'solid',color:'D7E2EC',pt:.55},fill:'FFFFFF',fontSize:8.4,color:'243B53',rowH:.48,margin:.04});}
      var recs=actions(data),sf=base('Próximas actividades · Riesgos y barreras','Acciones derivadas de los registros del SGRT');sf.addText((recs.length?recs:['Mantener seguimiento periódico de controles, evidencias y tratamientos.']).slice(0,10).map(function(x,n){return {text:(n+1)+'. '+x,options:{breakLine:true}};}),{x:4.0,y:1.62,w:7.8,h:4.7,fontSize:13,color:'334E68',margin:.05,paraSpaceAfterPt:7});
      var fn=(data.third?((db()[data.third]||{}).nombre||data.third):entityName(data.entity)).replace(/[^a-z0-9_-]+/gi,'_');await pptx.writeFile({fileName:'SGRT_Presentacion_'+fn+'_'+new Date().toISOString().slice(0,10)+'.pptx'});toast('PowerPoint ejecutivo generado con la plantilla corporativa.','success');
    }catch(e){console.error('[SGRT42 PPT]',e);toast('No se pudo generar PowerPoint: '+e.message,'error',6000);}
  };

  function entities(){var m={};Object.values(db()).forEach(function(t){var k=thirdEntity(t)||'colpensiones';m[k]=m[k]||entityName(t.entidad||t.entidadLabel||k);});try{(window.getISEntidades&&window.getISEntidades()||[]).forEach(function(e){var k=entityKey(e.id||e.nombre);if(k)m[k]=e.nombre||e.id;});}catch(e){}return Object.keys(m).map(function(k){return {id:k,name:m[k]};});}
  function fillFilters(){
    var es=document.getElementById('sgrt42-entity'),ts=document.getElementById('sgrt42-third'),cs=document.getElementById('sgrt42-contract');if(!ts||!cs)return;
    if(es){var cur=es.value;es.innerHTML='<option value="">Todas las organizaciones</option>'+entities().map(function(e){return '<option value="'+esc(e.id)+'">'+esc(e.name)+'</option>';}).join('');if(cur)es.value=cur;}
    var ent=chosenEntity(),curT=ts.value,ths=Object.values(db()).filter(function(t){var te=thirdEntity(t);return !ent||te===ent||(!te&&ent==='colpensiones');}).sort(function(a,b){return norm(a.nombre||a.nit).localeCompare(norm(b.nombre||b.nit),'es');});
    ts.innerHTML='<option value="">Todos los terceros</option>'+ths.map(function(t){return '<option value="'+esc(t.nit)+'">'+esc((t.nombre||t.nit)+' · '+t.nit)+'</option>';}).join('');if(curT&&ths.some(function(t){return t.nit===curT;}))ts.value=curT;
    var t=db()[ts.value]||null,curC=cs.value,cons=[];if(t){cons=(t.contratos||[]).map(contractNum).filter(Boolean);Object.keys(t.dimsPorContrato||{}).forEach(function(c){if(!cons.some(function(x){return canonContract(x)===canonContract(c);}))cons.push(c);});}
    cs.innerHTML='<option value="">Todos los contratos</option>'+cons.map(function(c){return '<option value="'+esc(c)+'">Contrato '+esc(c)+'</option>';}).join('');if(curC&&cons.some(function(c){return canonContract(c)===canonContract(curC);}))cs.value=curC;
  }
  function reportCard(pageId,anchorId){
    if(pageId==='admin-pg-reportes-entidad'&&!isIS())return;
    if(pageId==='pg-reportes-entidad'&&isIS())return;
    var page=document.getElementById(pageId),anchor=document.getElementById(anchorId);if(!page||!anchor||page.querySelector('.sgrt42-report-card'))return;
    var old=document.getElementById('sgrt41-report-actions');if(old)old.style.display='none';
    var c=document.createElement('div');c.className='card sgrt42-report-card';c.style.cssText='margin-bottom:14px;border:1px solid #b9d3e8;border-left:5px solid #1e6bb8;overflow:hidden;';
    c.innerHTML='<div style="background:#f5f9fd;padding:12px 15px;border-bottom:1px solid #dce8f2;"><div style="font-size:13px;font-weight:800;color:#173b5f;">📄 Informes corporativos SGRT</div><div style="font-size:10.5px;color:#64748b;margin-top:3px;">Genera Word y PowerPoint con membrete de ISEGURAS, resultados por dimensiones de control, hallazgos y riesgos reales del sistema.</div></div><div style="padding:12px 15px;"><div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px;">'+(isIS()?'<select id="sgrt42-entity" style="min-width:170px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select>':'')+'<select id="sgrt42-third" style="min-width:210px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select><select id="sgrt42-contract" style="min-width:150px;padding:7px;border:1px solid #ccd8e3;border-radius:6px;"></select><label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#334e68;padding:0 6px;"><input type="checkbox" id="sgrt42-use-ai" checked> Usar IA solo para redacción ejecutiva</label></div><div style="display:flex;gap:7px;flex-wrap:wrap;"><button class="btn btn-primary btn-sm" onclick="window.sgrtGenerarWordFinal()">📝 Generar Word</button><button class="btn btn-outline btn-sm" onclick="window.sgrtGenerarPowerPointFinal()">📊 Generar PowerPoint</button><button class="btn btn-outline btn-sm" onclick="window.abrirAsistente();setTimeout(function(){var i=document.getElementById(\'input-asistente\');if(i){i.value=\'Redacta un informe ejecutivo con los datos actuales del SGRT y dime qué debo corregir antes de presentarlo.\';i.focus();}},150)">🤖 Consultar a IA SGRT</button></div></div>';
    anchor.parentNode.insertBefore(c,anchor);fillFilters();
    var e=c.querySelector('#sgrt42-entity'),t=c.querySelector('#sgrt42-third');if(e)e.onchange=fillFilters;if(t)t.onchange=fillFilters;
  }

  function saveHistory(){try{sessionStorage.setItem('sgrt_ai_history',JSON.stringify(chatHistory.slice(-16)));}catch(e){}}
  function addChat(roleName,text){var chat=document.getElementById('mensajes-chat');if(!chat)return null;var div=document.createElement('div'),bot=roleName==='assistant';div.className='sgrt42-msg';div.style.cssText=(bot?'background:white;border-left:4px solid #1e6bb8;':'background:#eaf1f7;border-left:4px solid #90a4b8;')+'padding:10px 11px;border-radius:8px;font-size:11.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word;';div.textContent=(bot?'🤖 IA SGRT:\n':'👤 Tú: ')+text;chat.appendChild(div);chat.scrollTop=chat.scrollHeight;return div;}
  function fileToDataUrl(f){return new Promise(function(resolve,reject){var r=new FileReader();r.onload=function(){resolve(r.result);};r.onerror=reject;r.readAsDataURL(f);});}
  function aiContext(){var d=collectReport();return {rol:norm((window.currentUser||{}).rol),entidad:entityName(d.entity),tercero:d.third||'',contrato:d.contract||'',dimensiones:dimsSummary(d).slice(0,30),riesgos:d.risks.slice(0,25)};}
  function folder(parent,name,prefix){parent.children=parent.children||[];var f=parent.children.find(function(x){return x.type==='folder'&&x.name===name;});if(!f){f={type:'folder',name:name,id:(prefix||'f')+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),children:[],fecha:new Date().toLocaleDateString('es-CO')};parent.children.push(f);}return f;}
  function saveMeeting(file,dataUrl,summary,transcript){
    try{if(!window.RPT_FS||!Array.isArray(window.RPT_FS.children))return;var ctx=aiContext(),nit=ctx.tercero||'General',cont=ctx.contrato||'Sin contrato',r=folder(window.RPT_FS,'Reuniones','reun'),a=folder(r,nit,'terc'),b=folder(a,cont,'cont'),stamp=new Date().toLocaleDateString('es-CO');b.children.push({type:'file',name:file.name,id:'reunion_'+Date.now().toString(36),size:file.size,fecha:stamp,mimeType:file.type,_dataURL:dataUrl,_origen:'Reuniones'});if(summary)b.children.push({type:'file',name:'Acta_IA_'+new Date().toISOString().slice(0,10)+'.txt',id:'acta_'+Date.now().toString(36),size:summary.length,fecha:stamp,mimeType:'text/plain',_dataURL:'data:text/plain;charset=utf-8,'+encodeURIComponent(summary+(transcript?'\n\nTRANSCRIPCIÓN\n'+transcript:'')),_origen:'Reuniones'});if(window._saveRPT)window._saveRPT();}catch(e){console.warn('[SGRT42 reunión]',e);}
  }
  async function aiSend(prompt,file){
    var ctx=aiContext(),payload={prompt:prompt,context:ctx,history:chatHistory.slice(-10)};
    if(file){var dataUrl=await fileToDataUrl(file);if(/^(audio|video)\//i.test(file.type||'')){if(file.size>24*1024*1024)throw new Error('El audio/video debe pesar máximo 24 MB para transcripción directa.');var tr=await fetch(apiBase()+'/api/ai/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:file.name,mimeType:file.type,dataUrl:dataUrl,prompt:prompt,context:ctx,history:chatHistory.slice(-10)})}),tj=await tr.json().catch(function(){return{};});if(!tr.ok||!tj.ok)throw new Error(tj.error||('HTTP '+tr.status));saveMeeting(file,dataUrl,tj.summary||'',tj.transcript||'');return tj.summary||tj.transcript||'Transcripción completada.';}if(file.size>40*1024*1024)throw new Error('El archivo debe pesar máximo 40 MB para analizarlo desde el chat.');payload.file={name:file.name,type:file.type||'application/octet-stream',dataUrl:dataUrl};}
    var r=await fetch(apiBase()+'/api/ai/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),j=await r.json().catch(function(){return{};});if(!r.ok||!j.ok)throw new Error(j.error||('HTTP '+r.status));return j.text||'Sin respuesta.';
  }
  async function aiStatus(){var dot=document.getElementById('sgrt42-ai-status');if(!dot)return;try{var r=await fetch(apiBase()+'/api/ai/status',{cache:'no-store'}),j=await r.json();if(r.ok&&j.ok&&j.configured){dot.textContent='● IA conectada · '+j.model;dot.style.color='#bbf7d0';}else{dot.textContent='● IA pendiente de OPENAI_API_KEY';dot.style.color='#fde68a';}}catch(e){dot.textContent='● IA sin conexión al servidor';dot.style.color='#fecaca';}}
  function enhanceChat(){
    var panel=document.getElementById('chat-panel'),chat=document.getElementById('mensajes-chat'),inp=document.getElementById('input-asistente');if(!panel||!chat||!inp||panel.dataset.sgrt42)return;panel.dataset.sgrt42='1';panel.style.width='430px';panel.style.maxHeight='620px';
    var header=panel.firstElementChild;if(header){header.style.background='linear-gradient(135deg,#0d2740,#1e6bb8)';var title=header.firstElementChild;if(title)title.innerHTML='<span>🤖</span><span>IA SGRT · ChatGPT API<br><small id="sgrt42-ai-status" style="font-size:9px;font-weight:600;color:#fde68a;">● Verificando IA…</small></span>';}
    chat.innerHTML='<div style="background:white;padding:10px;border-radius:8px;border-left:4px solid #1e6bb8;font-size:11.5px;line-height:1.5;"><b>IA SGRT</b><br>Escribe tu solicitud con tus palabras. Puedo redactar objetos, analizar riesgos, revisar archivos, resumir reuniones y, si dices “genera un Word” o “genera un PowerPoint”, preparar la descarga con la plantilla corporativa.</div>';
    var quick=document.createElement('div');quick.id='sgrt42-quick';quick.style.cssText='display:flex;gap:5px;flex-wrap:wrap;padding:8px 10px;background:#f5f9fd;border-bottom:1px solid #e2e8f0;';[['📄 Informe','Redacta un informe ejecutivo práctico con los datos actuales del SGRT.'],['📝 Word','Genera y descarga un informe Word con los datos actuales del SGRT.'],['📊 PowerPoint','Genera y descarga una presentación PowerPoint ejecutiva con los datos actuales del SGRT.'],['⚠️ Riesgos','Analiza los riesgos actuales y prioriza acciones concretas.'],['🧾 Acta','Redacta un acta profesional. Si adjunto una grabación, usa únicamente su contenido.'],['✍️ Objeto','Ayúdame a redactar el objeto del informe o contrato con lenguaje técnico y claro.']].forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q[0];b.style.cssText='padding:5px 8px;border:1px solid #bdd2e5;border-radius:999px;background:white;color:#1e4f78;font-size:10px;font-weight:700;cursor:pointer;';b.onclick=function(){inp.value=q[1];inp.focus();};quick.appendChild(b);});chat.parentElement.insertBefore(quick,chat);
    inp.placeholder='Ej.: analiza este contrato, redacta el informe o revisa esta reunión…';
    window.enviarMensajeAsistente=async function(){var msg=norm(inp.value),fi=document.getElementById('sgrt41-ai-file'),file=fi&&fi.files&&fi.files[0];if(!msg&&!file)return;var shown=msg||(file?'Analiza el archivo adjunto: '+file.name:'');addChat('user',shown);chatHistory.push({role:'user',content:shown});saveHistory();inp.value='';var wait=addChat('assistant','Procesando…');try{var ans=await aiSend(msg||'Analiza el archivo adjunto y genera una salida práctica para SGRT.',file);if(wait)wait.remove();addChat('assistant',ans);chatHistory.push({role:'assistant',content:ans});saveHistory();var lm=low(msg);if(!file&&/(genera|generar|crea|crear|haz|descarga|descargar)/.test(lm)){if(/(powerpoint|ppt|presentaci[oó]n)/.test(lm)){addChat('assistant','Voy a generar la presentación con la plantilla corporativa y los datos actuales.');setTimeout(function(){window.sgrtGenerarPowerPointFinal&&window.sgrtGenerarPowerPointFinal(msg);},80);}else if(/(word|informe)/.test(lm)){addChat('assistant','Voy a generar el Word con la plantilla corporativa y los datos actuales.');setTimeout(function(){window.sgrtGenerarWordFinal&&window.sgrtGenerarWordFinal(msg);},80);}}}catch(e){if(wait)wait.remove();var txt='No fue posible usar la IA externa: '+e.message;if(String(e.message).indexOf('OPENAI_API_KEY')>=0)txt+='\n\nConfigura OPENAI_API_KEY en Azure App Service > Environment variables y reinicia la aplicación.';addChat('assistant',txt);}finally{if(fi)fi.value='';var lab=document.getElementById('sgrt41-ai-file-label');if(lab){lab.style.display='none';lab.textContent='';}}};
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
