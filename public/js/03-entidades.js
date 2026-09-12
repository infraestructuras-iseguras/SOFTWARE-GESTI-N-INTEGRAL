
window.abrirModalNuevaEntidad = function(){
  ['ent-nombre','ent-id','ent-u1-user','ent-u1-pass','ent-u2-user','ent-u2-pass'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  openM('m-nueva-entidad');
};

window.guardarNuevaEntidad = function(){
  var nombre=(document.getElementById('ent-nombre').value||'').trim();
  var id=(document.getElementById('ent-id').value||'').trim().toLowerCase().replace(/\s+/g,'_');
  var u1user=(document.getElementById('ent-u1-user').value||'').trim();
  var u1pass=(document.getElementById('ent-u1-pass').value||'').trim();
  var u2user=(document.getElementById('ent-u2-user').value||'').trim();
  var u2pass=(document.getElementById('ent-u2-pass').value||'').trim();
  if(!nombre||!id){ try{showToast('Nombre e ID son obligatorios','error',2500);}catch(e){} return; }
  
  // Guardar entidad
  var ents=getISEntidades(); 
  if(ents.find(function(e){return e.id===id;})){ try{showToast('Ya existe una organización con ese ID','error',2500);}catch(e){} return; }
  ents.push({id:id, nombre:nombre, fecha:new Date().toLocaleDateString('es-CO')});
  saveISEntidades(ents);
  
  // Crear usuarios en USERS_EXTRA y USERS
  if(!window.USERS_EXTRA) window.USERS_EXTRA={};
  if(u1user && u1pass){
    var newU1={pass:u1pass, name:'Adm. '+nombre, rol:'Operativo', initials:(nombre.slice(0,2).toUpperCase()), entidad:id, tipologias:null};
    window.USERS_EXTRA[u1user]=newU1; window.USERS[u1user]=newU1;
  }
  if(u2user && u2pass){
    var newU2={pass:u2pass, name:'Eval. '+nombre, rol:'Cliente', initials:(nombre.slice(0,2).toUpperCase()), entidad:id, tipologias:null};
    window.USERS_EXTRA[u2user]=newU2; window.USERS[u2user]=newU2;
  }
  try{ window._lsSave && window._lsSave(); }catch(e){}
  
  closeM('m-nueva-entidad');
  try{ window.renderEntidadesIS && window.renderEntidadesIS(); }catch(e){}
  try{ showToast('✅ Organización "'+nombre+'" creada'+(u1user?' · '+u1user:'')+(u2user?' · '+u2user:''),'success',4000); }catch(e){}
};
