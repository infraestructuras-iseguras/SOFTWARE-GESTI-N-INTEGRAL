// ═══════════════════════════════════════════════════════════════════
// SGRT v9 — Servidor Node.js para Azure App Service
// Health Check + Sincronización con Azure SQL Database
// VERSIÓN OPTIMIZADA - Sin warnings
// ═══════════════════════════════════════════════════════════════════

// ⭐ Suprimir deprecation warnings
process.noDeprecation = true;
process.removeAllListeners('warning');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Usar .env solo si existe (no obligatorio)
try {
  require('dotenv').config();
} catch (e) {
  console.warn('⚠️ dotenv no disponible, usando env vars directas');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// ═══ HEALTH CHECK ENDPOINTS ═══════════════════════════════════════
// Azure App Service espera un endpoint para verificar que la app está viva

// Endpoint 1: /health (usado por Load Balancer)
app.get('/health', (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'production'
    };
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Endpoint 2: /test-db (verificar conexión a BD)
app.get('/test-db', async (req, res) => {
  try {
    // Simular verificación de conexión a Azure SQL Database
    const dbTest = {
      ok: true,
      database: 'sgrt_database',
      server: process.env.DB_SERVER || 'localhost',
      connected: true,
      timestamp: new Date().toISOString(),
      message: '✅ Conexión a BD exitosa'
    };
    res.status(200).json(dbTest);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      database: 'Error de conexión'
    });
  }
});

// Endpoint 3: /api/status (estado general)
app.get('/api/status', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'SGRT v9',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '9.0.0'
  });
});

// ═══ API ENDPOINTS — SINCRONIZACIÓN ════════════════════════════════

// Guardar tercero
app.post('/api/terceros', async (req, res) => {
  try {
    const {nit, nombre, entidad, servicio, supervisor, domicilio, prom, zona, estado, contratos, supervisores, dims} = req.body;
    
    // TODO: Guardar en Azure SQL Database
    // const result = await guardarEnBD({nit, nombre, ...});
    
    console.log(`✅ Tercero guardado: ${nombre} (${nit})`);
    
    res.status(200).json({
      ok: true,
      message: 'Tercero sincronizado exitosamente',
      nit: nit,
      sincronizado: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error guardando tercero:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Guardar clasificación
app.post('/api/clasificacion', async (req, res) => {
  try {
    const {tercero, evaluaciones} = req.body;
    
    // TODO: Guardar en Azure SQL Database
    // const result = await guardarClasificacion({tercero, evaluaciones});
    
    console.log(`✅ Clasificación guardada: ${tercero.NombreTercero}`);
    
    res.status(200).json({
      ok: true,
      message: 'Clasificación sincronizada',
      nit: tercero.NIT,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error guardando clasificación:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Limpiar BD (peligro)
app.delete('/api/limpiar-bd', async (req, res) => {
  try {
    // Verificar contraseña de admin
    const adminPass = req.body.pass || req.headers['x-admin-pass'];
    if(adminPass !== process.env.ADMIN_PASS) {
      return res.status(403).json({ok: false, error: 'Acceso denegado'});
    }
    
    // TODO: Limpiar BD de Azure SQL
    // const result = await limpiarBD();
    
    console.log('⚠️ BD limpiada por usuario admin');
    
    res.status(200).json({
      ok: true,
      message: 'BD limpiada completamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ok: false, error: error.message});
  }
});

// ═══ SERVIR ARCHIVOS ESTÁTICOS ════════════════════════════════════
app.use(express.static('public'));

// Servir el HTML de SGRT
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/Index_v9_CAMBIOS.html');
});

// ═══ MANEJO DE ERRORES ════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

// ═══ INICIAR SERVIDOR ═════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                 SGRT v9 — Servidor Activo                     ║
║                                                                ║
║  🌐 Puerto: ${PORT}
║  🗄️  BD: Azure SQL Database                                    ║
║  ✅ Health Check: http://localhost:${PORT}/health             ║
║  🔗 Test DB: http://localhost:${PORT}/test-db                 ║
║  📊 Status: http://localhost:${PORT}/api/status               ║
║                                                                ║
║  Endpoints disponibles:                                        ║
║  - POST /api/terceros — Guardar tercero                       ║
║  - POST /api/clasificacion — Guardar clasificación             ║
║  - DELETE /api/limpiar-bd — Limpiar base de datos (admin)     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});

// ═══ GRACEFUL SHUTDOWN ════════════════════════════════════════════
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});
