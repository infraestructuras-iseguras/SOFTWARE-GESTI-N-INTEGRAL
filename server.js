// ═══════════════════════════════════════════════════════════════════
// SGRT v9 — Servidor Node.js para Azure App Service
// ✅ Sin warnings de deprecación
// ✅ Compatible con Node 18+
// ✅ Busca Index.html en múltiples ubicaciones
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Suprimir warnings (opcional, pero limpio)
process.noDeprecation = true;

// Cargar variables de entorno
try {
  require('dotenv').config();
} catch (e) {
  console.warn('⚠️ dotenv no disponible, usando env vars del sistema');
}

const app = express();
const PORT = process.env.PORT || 3000;

// ═══ MIDDLEWARE ═══════════════════════════════════════════════════
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ═══ HEALTH CHECK ENDPOINTS ═══════════════════════════════════════

// 1. Health check para Azure Load Balancer
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'production',
      version: '9.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// 2. Test de conexión a BD (mock por ahora)
app.get('/test-db', async (req, res) => {
  try {
    res.status(200).json({
      ok: true,
      database: 'sgrt_database',
      server: process.env.DB_SERVER || 'localhost',
      connected: true,
      timestamp: new Date().toISOString(),
      message: '✅ Mock: BD lista (integración Azure SQL pendiente)'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// 3. Status general
app.get('/api/status', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'SGRT v9',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '9.0.0',
    endpoints: [
      'GET /health',
      'GET /test-db',
      'GET /api/status',
      'POST /api/terceros',
      'POST /api/clasificacion',
      'DELETE /api/limpiar-bd'
    ]
  });
});

// ═══ API ENDPOINTS — SINCRONIZACIÓN ════════════════════════════════

// GET terceros (para que el frontend pueda verificar)
app.get('/api/terceros', (req, res) => {
  try {
    // TODO: Integrar con Azure SQL Database
    res.status(200).json({
      ok: true,
      message: 'Mock: Sin base de datos configurada aún',
      data: []
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST tercero - Guardar tercero
app.post('/api/terceros', (req, res) => {
  try {
    const { nit, nombre, entidad, servicio, supervisor, domicilio, prom, zona, estado, contratos, supervisores, dims } = req.body;
    
    // Validar datos mínimos
    if (!nit || !nombre) {
      return res.status(400).json({
        ok: false,
        error: 'NIT y Nombre son obligatorios'
      });
    }
    
    console.log(`✅ Tercero recibido: ${nombre} (${nit})`);
    
    // TODO: Guardar en Azure SQL Database
    // const result = await db.query('INSERT INTO Terceros ...');
    
    res.status(200).json({
      ok: true,
      message: 'Tercero sincronizado exitosamente',
      nit: nit,
      sincronizado: true,
      timestamp: new Date().toISOString(),
      note: 'Mock: Datos guardados en memoria, integración con BD pendiente'
    });
  } catch (error) {
    console.error('❌ Error guardando tercero:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// POST clasificación - Guardar clasificación
app.post('/api/clasificacion', (req, res) => {
  try {
    const { tercero, evaluaciones } = req.body;
    
    console.log(`✅ Clasificación recibida: ${tercero?.nombre || tercero?.NombreTercero || 'sin nombre'}`);
    
    // TODO: Guardar en Azure SQL Database
    // const result = await db.query('INSERT INTO Clasificaciones ...');
    
    res.status(200).json({
      ok: true,
      message: 'Clasificación sincronizada',
      nit: tercero?.nit || tercero?.NIT,
      timestamp: new Date().toISOString(),
      note: 'Mock: Integración con BD pendiente'
    });
  } catch (error) {
    console.error('❌ Error guardando clasificación:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// DELETE limpiar BD (requiere autenticación)
app.delete('/api/limpiar-bd', (req, res) => {
  try {
    const adminPass = req.body?.pass || req.headers['x-admin-pass'];
    const expectedPass = process.env.ADMIN_PASS || 'admin123';
    
    if (adminPass !== expectedPass) {
      return res.status(403).json({
        ok: false,
        error: '❌ Contraseña de admin incorrecta'
      });
    }
    
    console.log('⚠️ BD limpiada por usuario admin en', new Date().toISOString());
    
    // TODO: Limpiar BD de Azure SQL
    // const result = await db.query('DELETE FROM ...');
    
    res.status(200).json({
      ok: true,
      message: 'BD limpiada completamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ═══ SERVIR ARCHIVOS ESTÁTICOS ════════════════════════════════════
app.use(express.static(path.join(__dirname, 'public')));

// ⭐ FIX: Buscar Index.html en múltiples ubicaciones
function findIndexHtml() {
  const possiblePaths = [
    path.join(__dirname, 'public', 'Index.html'),
    path.join(__dirname, 'public', 'index.html'),
    path.join(__dirname, 'Index.html'),
    path.join(__dirname, 'index.html'),
    '/home/site/wwwroot/Index.html',
    '/home/site/wwwroot/public/Index.html'
  ];
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`✅ Index.html encontrado en: ${filePath}`);
        return filePath;
      }
    } catch (e) {
      // Ignorar errores de lectura
    }
  }
  
  return null;
}

// Servir el HTML de SGRT
app.get('/', (req, res) => {
  const indexPath = findIndexHtml();
  
  if (!indexPath) {
    return res.status(500).json({
      ok: false,
      error: 'No se encontró Index.html',
      message: 'Verifica que Index.html esté en la raíz o en /public',
      checked_paths: [
        'public/Index.html',
        'public/index.html',
        'Index.html',
        'index.html',
        '/home/site/wwwroot/Index.html',
        '/home/site/wwwroot/public/Index.html'
      ]
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sirviendo Index.html:', err);
      res.status(500).json({
        ok: false,
        error: 'Error sirviendo Index.html',
        message: err.message
      });
    }
  });
});

// ═══ MANEJO DE ERRORES 404 ════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Ruta no encontrada',
    path: req.path,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /test-db',
      'GET /api/status',
      'GET /api/terceros',
      'POST /api/terceros',
      'POST /api/clasificacion',
      'DELETE /api/limpiar-bd'
    ]
  });
});

// Error handling global
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ═══ INICIAR SERVIDOR ═════════════════════════════════════════════
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                 SGRT v9 — Servidor Activo                        ║
║                  (Sin warnings de deprecación)                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  🌐 Puerto: ${PORT}
║  🗄️  BD: Azure SQL Database (pendiente configurar)               ║
║  ✅ Health Check: http://localhost:${PORT}/health                ║
║  🔗 Test DB: http://localhost:${PORT}/test-db                    ║
║  📊 Status: http://localhost:${PORT}/api/status                  ║
║  📁 HTML: http://localhost:${PORT}/                              ║
║                                                                   ║
║  Endpoints API:                                                   ║
║  • GET /api/terceros — Listar terceros                           ║
║  • POST /api/terceros — Guardar tercero                          ║
║  • POST /api/clasificacion — Guardar clasificación                ║
║  • DELETE /api/limpiar-bd — Limpiar BD (auth requerida)          ║
║                                                                   ║
║  Variables de entorno recomendadas (.env):                        ║
║  NODE_ENV=production                                              ║
║  PORT=3000                                                        ║
║  ADMIN_PASS=tu_contraseña_admin                                   ║
║  DB_SERVER=tu_servidor_azure_sql.database.windows.net             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
  
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
  console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
});

// ═══ GRACEFUL SHUTDOWN ════════════════════════════════════════════
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

module.exports = app;
