(function(){
  var azure='https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net';
  var h=window.location.hostname||'';
  var local=h==='localhost'||h==='127.0.0.1'||h.indexOf('192.168.')===0;
  window.API_BASE_URL=local?'http://'+h+':3000':(h.indexOf('azurewebsites.net')>=0?window.location.origin:azure);
  console.log('SGRT API_BASE_URL:',window.API_BASE_URL);
})();
