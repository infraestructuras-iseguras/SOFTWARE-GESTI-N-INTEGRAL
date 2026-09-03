
// ── ADMIN DASHBOARD ────────────────────────────────
function adminDashYear(yr, btn){
  var btns = btn.parentElement.querySelectorAll('button');
  btns.forEach(function(b){
    b.style.fontWeight='400'; b.style.border='1px solid rgba(255,255,255,.35)';
    b.style.background='rgba(255,255,255,.1)'; b.style.color='white';
  });
  btn.style.fontWeight='700'; btn.style.border='1px solid white';
  btn.style.background='white'; btn.style.color='var(--navy)';
}
function initAdminDashboard(){
  var dh=document.getElementById('admin-dash-fecha-hoy');
  if(dh) dh.textContent=new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var wl=document.getElementById('admin-dash-welcome');
  if(wl && window.currentUser) wl.textContent='Bienvenido, '+currentUser.name;
  var terceros=Object.keys(window.TERCEROS_DB||{}).length;
  var tblEnt=document.getElementById('tbody-entidades');
  var entidades=tblEnt?tblEnt.querySelectorAll('tr').length:0;
  var tblMtz=document.getElementById('tbody-matriz');
  var riesgos=tblMtz?tblMtz.querySelectorAll('tr').length:0;
  var extremos=0;
  if(tblMtz) tblMtz.querySelectorAll('tr').forEach(function(tr){if(tr.textContent.includes('EXTREMO'))extremos++;});
  function s(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  s('admin-kpi-terceros',terceros); s('admin-kpi-extremos',extremos);
  s('admin-kpi-riesgos',riesgos); s('admin-kpi-entidades',entidades);
}
