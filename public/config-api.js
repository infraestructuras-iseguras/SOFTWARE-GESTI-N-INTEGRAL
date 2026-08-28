// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN AUTOMÁTICA DE API
// Detecta si está en localhost o en servidor Azure
// ═══════════════════════════════════════════════════════════════

(function() {
  const hostname = window.location.hostname;
  const isLocalhost = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168');
  
  // Configurar URL de API según ambiente
  if (isLocalhost) {
    // DESARROLLO LOCAL
    window.API_BASE_URL = 'http://localhost:3000';
    console.log('🔧 MODO DESARROLLO: Conectando a localhost:3000');
  } else {
    // PRODUCCIÓN (Azure)
    // Usa el mismo hostname (Azure auto-servirá desde el mismo servidor)
    window.API_BASE_URL = `https://${hostname}`;
    console.log(`🌐 MODO PRODUCCIÓN: Conectando a ${window.API_BASE_URL}`);
  }
  
  console.log(`📍 API_BASE_URL configurada a: ${window.API_BASE_URL}`);
  console.log('✅ config-api.js cargado correctamente');
})();
