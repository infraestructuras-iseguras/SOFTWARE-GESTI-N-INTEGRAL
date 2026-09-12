
// ─── EDITAR USUARIO: cambiar username, password y nombre ─────
window.editarUsuarioAdmin = function(key){
  var u = window.USERS[key]; if(!u) return;
  // Solo Operativo y Cliente son editables en usuario/pass
  var editable = (u.rol==='Operativo'||u.rol==='Cliente');
  var rolDisplay = u.rol==='Operativo'?'ADMINISTRADOR DE RIESGOS':u.rol==='Cliente'?'EVALUADOR':u.rol;

  // Crear/reusar modal
  var m = document.getElementById('m-edit-user-sgrt');
  if(!m){
    m = document.createElement('div');
    m.id = 'm-edit-user-sgrt';
    m.className = 'overlay';
    document.body.appendChild(m);
  }
  m.innerHTML =
    '<div class="modal" style="width:420px;max-width:98vw;">'
    +'<div class="mh"><h3>✏ Editar — '+rolDisplay+'</h3>'
    +'<button class="mc-btn" onclick="closeM(\'m-edit-user-sgrt\')">✕</button></div>'
    +'<div class="mb" style="padding:18px 20px;display:flex;flex-direction:column;gap:12px;">'
    +(editable
      ? '<div class="field"><label style="font-size:12px;font-weight:700;">Usuario (login)</label>'
        +'<input id="eu-user" value="'+key+'" style="width:100%;padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;"></div>'
        +'<div class="field"><label style="font-size:12px;font-weight:700;">Nueva contraseña</label>'
        +'<input id="eu-pass" type="text" placeholder="Dejar vacío para no cambiar" style="width:100%;padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;"></div>'
        +'<div class="field"><label style="font-size:12px;font-weight:700;">Nombre visible</label>'
        +'<input id="eu-name" value="'+(u.name||key)+'" style="width:100%;padding:8px 11px;border:1px solid #dee2e6;border-radius:6px;font-size:13px;font-family:inherit;"></div>'
      : '<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;padding:12px;font-size:12.5px;color:#6c757d;">El usuario <b>'+key+'</b> ('+rolDisplay+') no es editable desde aquí.</div>'
    )
    +'</div>'
    +'<div class="mf">'
    +'<button class="btn btn-outline" onclick="closeM(\'m-edit-user-sgrt\')">Cancelar</button>'
    +(editable ? '<button class="btn btn-success" onclick="window.guardarEdicionUsuario(\''+key+'\')">💾 Guardar</button>' : '')
    +'</div></div>';
  openM('m-edit-user-sgrt');
};

window.guardarEdicionUsuario = function(oldKey){
  var newUser = (document.getElementById('eu-user').value||'').trim();
  var newPass = (document.getElementById('eu-pass').value||'').trim();
  var newName = (document.getElementById('eu-name').value||'').trim();
  if(!newUser){ try{showToast('El usuario no puede estar vacío','error',2500);}catch(e){} return; }

  var u = window.USERS[oldKey]; if(!u) return;

  // Si cambió el username → renombrar la clave
  if(newUser !== oldKey){
    if(window.USERS[newUser]){ try{showToast('Ese nombre de usuario ya existe','error',2500);}catch(e){} return; }
    window.USERS[newUser] = Object.assign({}, u);
    delete window.USERS[oldKey];
    if(window.USERS_EXTRA && window.USERS_EXTRA[oldKey]){
      window.USERS_EXTRA[newUser] = window.USERS_EXTRA[oldKey];
      delete window.USERS_EXTRA[oldKey];
    }
    u = window.USERS[newUser];
  }

  // Actualizar contraseña y nombre
  if(newPass) u.pass = newPass;
  if(newName) u.name = newName;

  // Persistir
  try{ window._lsSave && window._lsSave(); }catch(e){}

  closeM('m-edit-user-sgrt');
  try{ renderTablaUsuarios(); }catch(e){}
  try{ window.renderEntidadesIS && window.renderEntidadesIS(); }catch(e){}

  var msg = '✅ Usuario actualizado';
  if(newUser!==oldKey) msg += ' · nuevo login: '+newUser;
  try{showToast(msg,'success',3500);}catch(e){}
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATOS COLPENSIONES - CARGA AUTOMÁTICA (sin duplicados)
// ═══════════════════════════════════════════════════════════════════════════════
const DATOS_COLPENSIONES={terceros:{},contratos:[]};// ⭐ Base de datos limpia - sin datos de ejemplo
window._limpiarDuplicados = function(){
  Object.keys(TERCEROS_DB||{}).forEach(function(nit){
    var t = TERCEROS_DB[nit];
    if(t && t.contratos && Array.isArray(t.contratos)){
      var vistos = {};
      t.contratos = t.contratos.filter(function(c){
        var key = (c.nit||'') + '_' + (c.num||'');
        if(vistos[key]) return false;
        vistos[key] = true;
        return true;
      });
    }
  });
};

function cargarDatosColpensiones(){
  // ⭐ COMPLETAMENTE DESACTIVADO - Causa conflictos con sincronización
  console.log('⚠️ cargarDatosColpensiones DESACTIVADA - usando solo localStorage');
}
// setTimeout desactivado - NO ejecutar cargarDatosColpensiones
// setTimeout(()=>{...},2000);

// ⭐⭐⭐ NUEVA FUNCIÓN: SINCRONIZACIÓN LIMPIA AL CARGAR LA PÁGINA ⭐⭐⭐
window._inicializarSincronizacion = function(){
  console.log('🔄 INICIANDO SINCRONIZACIÓN LIMPIA...');
  
  try{
    // 1️⃣ Cargar TERCEROS_DB desde localStorage (SI EXISTE)
    var db_guardada = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(db_guardada).length > 0){
      window.TERCEROS_DB = db_guardada;
      console.log('✅ TERCEROS_DB cargada desde localStorage:', Object.keys(db_guardada).length, 'terceros');
      Object.keys(db_guardada).forEach(nit => {
        var t = db_guardada[nit];
        console.log('  ├─', nit, ':', t.nombre, '(', (t.contratos||[]).length, 'contratos)');
      });
    } else {
      console.log('⚠️ localStorage vacío - iniciando con TERCEROS_DB vacío');
      window.TERCEROS_DB = {};
    }
  }catch(e){
    console.error('❌ Error cargando de localStorage:', e);
    window.TERCEROS_DB = {};
  }
  
  console.log('✅ SINCRONIZACIÓN COMPLETADA');
};

// Ejecutar sincronización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    window._inicializarSincronizacion();
  }, 100);
});
