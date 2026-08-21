// ═══════════════════════════════════════════════════════════════════
// SGRT v10 — Servidor Node.js con CONEXIÓN REAL a Azure SQL
// ✅ Sin warnings de deprecación
// ✅ Compatible con Node 18+
// ✅ Conexión real a Azure SQL Server
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Importar cliente SQL Server
let sql;
try {
  sql = require('mssql');
  console.log('✅ Módulo mssql importado correctamente');
} catch (e) {
  console.error('❌ Error importando mssql. Instala con: npm install mssql');
  process.exit(1);
}

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

// ═══ CONFIGURACIÓN DE BD ═══════════════════════════════════════════

const config = {
  server: process.env.DB_SERVER || 'azure-iseguras.database.windows.net',
  database: process.env.DB_NAME || 'sgrt_database',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000
    }
  }
};

// Pool de conexiones global
let pool = null;

// Crear conexión a BD
async function initializeDatabase() {
  try {
    pool = new sql.ConnectionPool(config);
    
    pool.on('error', err => {
      console.error('❌ Error en pool de conexiones:', err);
    });
    
    await pool.connect();
    console.log('✅ CONECTADO a Azure SQL Database exitosamente');
    console.log(`   Servidor: ${config.server}`);
    console.log(`   BD: ${config.database}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    return true;
  } catch (error) {
    console.error('❌ ERROR CRÍTICO conectando a Azure SQL:');
    console.error(`   ${error.message}`);
    console.error(`   Código: ${error.code}`);
    console.error(`   Verificar:`);
    console.error(`   - DB_SERVER=${process.env.DB_SERVER}`);
    console.error(`   - DB_NAME=${process.env.DB_NAME}`);
    console.error(`   - DB_USER=${process.env.DB_USER ? '✓ configurado' : '✗ FALTA'}`);
    console.error(`   - DB_PASSWORD=${process.env.DB_PASSWORD ? '✓ configurado' : '✗ FALTA'}`);
    console.error(`   - Firewall de Azure SQL permite el IP ${process.env.IP || 'desconocido'}`);
    return false;
  }
}

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
      version: '10.0.0',
      database: {
        connected: pool ? pool.connected : false,
        server: config.server,
        database: config.database
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// 2. Test de conexión a BD (REAL)
app.get('/test-db', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        database: config.database,
        server: config.server,
        connected: false,
        timestamp: new Date().toISOString(),
        error: '❌ No hay conexión a Azure SQL Database',
        message: 'La conexión al servidor se perdió o no se estableció'
      });
    }
    
    // Hacer un query simple para verificar conexión real
    const request = new sql.Request(pool);
    const result = await request.query('SELECT GETDATE() as current_time, @@SERVERNAME as server_name, DB_NAME() as database_name');
    
    res.status(200).json({
      ok: true,
      database: config.database,
      server: config.server,
      connected: true,
      timestamp: new Date().toISOString(),
      message: '✅ CONECTADO a Azure SQL Database - Conexión REAL y funcionando',
      server_info: {
        server_name: result.recordset[0]?.server_name,
        database_name: result.recordset[0]?.database_name,
        server_time: result.recordset[0]?.current_time
      }
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      connected: false,
      error: error.message,
      server: config.server,
      database: config.database
    });
  }
});

// 3. Status general
app.get('/api/status', async (req, res) => {
  try {
    const isConnected = pool && pool.connected;
    
    res.status(200).json({
      ok: true,
      service: 'SGRT v10',
      status: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '10.0.0',
      database: {
        server: config.server,
        name: config.database,
        connected: isConnected
      },
      endpoints: [
        'GET /health',
        'GET /test-db',
        'GET /api/status',
        'GET /api/terceros',
        'GET /api/terceros/:nit',
        'POST /api/terceros',
        'PUT /api/terceros/:nit',
        'DELETE /api/terceros/:nit',
        'POST /api/clasificacion',
        'DELETE /api/limpiar-bd'
      ]
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ═══ API ENDPOINTS — TERCEROS ══════════════════════════════════════

// GET todos los terceros (SELECT desde BD real)
app.get('/api/terceros', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const request = new sql.Request(pool);
    const result = await request.query(`
      SELECT 
        NIT,
        Nombre,
        Domicilio,
        Supervisor,
        Entidad,
        Estado,
        FechaCreacion,
        Clasificacion,
        PromedioCalificacion,
        ZonaRiesgo,
        NivelRiesgo
      FROM Terceros
      ORDER BY FechaCreacion DESC
    `);
    
    console.log(`✅ GET /api/terceros → ${result.recordset.length} terceros consultados`);
    
    res.status(200).json({
      ok: true,
      count: result.recordset.length,
      data: result.recordset,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en GET /api/terceros:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// GET tercero por NIT
app.get('/api/terceros/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const { nit } = req.params;
    const request = new sql.Request(pool);
    request.input('nit', sql.VarChar, nit);
    
    const result = await request.query(`
      SELECT * FROM Terceros WHERE NIT = @nit
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tercero no encontrado',
        nit: nit
      });
    }
    
    res.status(200).json({
      ok: true,
      data: result.recordset[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en GET /api/terceros/:nit:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// POST tercero - Guardar tercero (INSERT en BD real)
app.post('/api/terceros', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const { 
      nit, nombre, domicilio, supervisor, entidad, estado, 
      clasificacion, prom, zona, nivel_riesgo, contratos, supervisores, dims 
    } = req.body;
    
    // Validar datos mínimos
    if (!nit || !nombre) {
      return res.status(400).json({
        ok: false,
        error: 'NIT y Nombre son obligatorios'
      });
    }
    
    const request = new sql.Request(pool);
    request.input('nit', sql.VarChar, nit);
    request.input('nombre', sql.VarChar, nombre);
    request.input('domicilio', sql.VarChar, domicilio || null);
    request.input('supervisor', sql.VarChar, supervisor || null);
    request.input('entidad', sql.VarChar, entidad || 'colpensiones');
    request.input('estado', sql.VarChar, estado || 'Activo');
    request.input('clasificacion', sql.VarChar, clasificacion || 'MEDIO');
    request.input('prom', sql.Decimal(5, 2), prom || 0);
    request.input('zona', sql.VarChar, zona || 'MEDIO');
    request.input('nivel_riesgo', sql.VarChar, nivel_riesgo || 'MEDIO');
    request.input('contratos_json', sql.NVarCharMax, JSON.stringify(contratos || []));
    request.input('supervisores_json', sql.NVarCharMax, JSON.stringify(supervisores || []));
    request.input('dims_json', sql.NVarCharMax, JSON.stringify(dims || []));
    
    // Verificar si el tercero ya existe
    const checkRequest = new sql.Request(pool);
    checkRequest.input('nit', sql.VarChar, nit);
    const checkResult = await checkRequest.query('SELECT NIT FROM Terceros WHERE NIT = @nit');
    
    let result;
    if (checkResult.recordset.length > 0) {
      // UPDATE si existe
      const updateQuery = `
        UPDATE Terceros SET
          Nombre = @nombre,
          Domicilio = @domicilio,
          Supervisor = @supervisor,
          Entidad = @entidad,
          Estado = @estado,
          Clasificacion = @clasificacion,
          PromedioCalificacion = @prom,
          ZonaRiesgo = @zona,
          NivelRiesgo = @nivel_riesgo,
          Contratos = @contratos_json,
          Supervisores = @supervisores_json,
          Tipologias = @dims_json,
          FechaActualizacion = GETDATE()
        WHERE NIT = @nit
      `;
      result = await request.query(updateQuery);
      console.log(`✅ Tercero ACTUALIZADO: ${nombre} (${nit})`);
    } else {
      // INSERT si no existe
      const insertQuery = `
        INSERT INTO Terceros (
          NIT, Nombre, Domicilio, Supervisor, Entidad, Estado,
          Clasificacion, PromedioCalificacion, ZonaRiesgo, NivelRiesgo,
          Contratos, Supervisores, Tipologias, FechaCreacion
        ) VALUES (
          @nit, @nombre, @domicilio, @supervisor, @entidad, @estado,
          @clasificacion, @prom, @zona, @nivel_riesgo,
          @contratos_json, @supervisores_json, @dims_json, GETDATE()
        )
      `;
      result = await request.query(insertQuery);
      console.log(`✅ Tercero CREADO: ${nombre} (${nit})`);
    }
    
    res.status(201).json({
      ok: true,
      message: checkResult.recordset.length > 0 ? 'Tercero actualizado' : 'Tercero creado',
      nit: nit,
      nombre: nombre,
      timestamp: new Date().toISOString(),
      database: 'Azure SQL (REAL)'
    });
  } catch (error) {
    console.error('❌ Error en POST /api/terceros:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// PUT tercero - Actualizar tercero
app.put('/api/terceros/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const { nit } = req.params;
    const { nombre, domicilio, supervisor, estado, clasificacion, prom, zona } = req.body;
    
    const request = new sql.Request(pool);
    request.input('nit', sql.VarChar, nit);
    request.input('nombre', sql.VarChar, nombre);
    request.input('domicilio', sql.VarChar, domicilio);
    request.input('supervisor', sql.VarChar, supervisor);
    request.input('estado', sql.VarChar, estado);
    request.input('clasificacion', sql.VarChar, clasificacion);
    request.input('prom', sql.Decimal(5, 2), prom);
    request.input('zona', sql.VarChar, zona);
    
    const result = await request.query(`
      UPDATE Terceros SET
        Nombre = @nombre,
        Domicilio = @domicilio,
        Supervisor = @supervisor,
        Estado = @estado,
        Clasificacion = @clasificacion,
        PromedioCalificacion = @prom,
        ZonaRiesgo = @zona,
        FechaActualizacion = GETDATE()
      WHERE NIT = @nit
    `);
    
    console.log(`✅ Tercero ACTUALIZADO: ${nit}`);
    
    res.status(200).json({
      ok: true,
      message: 'Tercero actualizado',
      nit: nit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en PUT /api/terceros/:nit:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// DELETE tercero
app.delete('/api/terceros/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const { nit } = req.params;
    const request = new sql.Request(pool);
    request.input('nit', sql.VarChar, nit);
    
    const result = await request.query('DELETE FROM Terceros WHERE NIT = @nit');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tercero no encontrado'
      });
    }
    
    console.log(`✅ Tercero ELIMINADO: ${nit}`);
    
    res.status(200).json({
      ok: true,
      message: 'Tercero eliminado',
      nit: nit,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en DELETE /api/terceros/:nit:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ═══ CLASIFICACIÓN ═════════════════════════════════════════════════

app.post('/api/clasificacion', async (req, res) => {
  try {
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const { tercero, evaluaciones } = req.body;
    const nit = tercero?.nit || tercero?.NIT;
    const nombre = tercero?.nombre || tercero?.NombreTercero;
    
    if (!nit) {
      return res.status(400).json({
        ok: false,
        error: 'NIT del tercero es obligatorio'
      });
    }
    
    const request = new sql.Request(pool);
    request.input('nit', sql.VarChar, nit);
    request.input('evaluaciones', sql.NVarCharMax, JSON.stringify(evaluaciones || []));
    
    const result = await request.query(`
      UPDATE Terceros SET
        Evaluaciones = @evaluaciones,
        FechaActualizacion = GETDATE()
      WHERE NIT = @nit
    `);
    
    console.log(`✅ Clasificación GUARDADA: ${nombre} (${nit})`);
    
    res.status(200).json({
      ok: true,
      message: 'Clasificación sincronizada',
      nit: nit,
      timestamp: new Date().toISOString(),
      database: 'Azure SQL (REAL)'
    });
  } catch (error) {
    console.error('❌ Error en POST /api/clasificacion:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ═══ ADMINISTRACIÓN ════════════════════════════════════════════════

app.delete('/api/limpiar-bd', async (req, res) => {
  try {
    const adminPass = req.body?.pass || req.headers['x-admin-pass'];
    const expectedPass = process.env.ADMIN_PASS || 'admin123';
    
    if (adminPass !== expectedPass) {
      return res.status(403).json({
        ok: false,
        error: '❌ Contraseña de admin incorrecta'
      });
    }
    
    if (!pool || !pool.connected) {
      return res.status(503).json({
        ok: false,
        error: 'No hay conexión a base de datos'
      });
    }
    
    const request = new sql.Request(pool);
    
    // ADVERTENCIA: Esto ELIMINA TODOS los registros de Azure SQL
    await request.query('DELETE FROM Terceros');
    
    console.log('⚠️ BD LIMPIADA POR ADMIN en', new Date().toISOString());
    
    res.status(200).json({
      ok: true,
      message: '⚠️ BD de Azure SQL limpiada completamente',
      timestamp: new Date().toISOString(),
      database: 'Azure SQL'
    });
  } catch (error) {
    console.error('❌ Error limpiando BD:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ═══ SERVIR ARCHIVOS ESTÁTICOS ════════════════════════════════════
app.use(express.static(path.join(__dirname, 'public')));

// Buscar Index.html en múltiples ubicaciones
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
      // Ignorar errores
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
      message: 'Verifica que Index.html esté en la raíz o en /public'
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
      'GET /api/terceros/:nit',
      'POST /api/terceros',
      'PUT /api/terceros/:nit',
      'DELETE /api/terceros/:nit',
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
    message: err.message
  });
});

// ═══ INICIAR SERVIDOR ═════════════════════════════════════════════

async function startServer() {
  try {
    // Conectar a BD antes de iniciar servidor
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Revisar variables de entorno.');
      console.error('Variables requeridas:');
      console.error('  - DB_SERVER=azure-iseguras.database.windows.net');
      console.error('  - DB_NAME=sgrt_database');
      console.error('  - DB_USER=<usuario>');
      console.error('  - DB_PASSWORD=<contraseña>');
      process.exit(1);
    }
    
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║            SGRT v10 — Servidor con Azure SQL REAL               ║
║                  (Conexión REAL Verificada)                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  🌐 Puerto: ${PORT}
║  🗄️  BD: Azure SQL Database - CONECTADO ✅                       ║
║  📍 Servidor: ${config.server}
║  📦 Base de datos: ${config.database}
║  ✅ Health Check: http://localhost:${PORT}/health                ║
║  🔗 Test DB: http://localhost:${PORT}/test-db                    ║
║  📊 Status: http://localhost:${PORT}/api/status                  ║
║  📁 HTML: http://localhost:${PORT}/                              ║
║                                                                   ║
║  Endpoints API (CONECTADOS A AZURE SQL):                          ║
║  • GET /api/terceros — Listar terceros (SELECT)                  ║
║  • GET /api/terceros/:nit — Obtener tercero                      ║
║  • POST /api/terceros — Crear/actualizar (INSERT/UPDATE)         ║
║  • PUT /api/terceros/:nit — Actualizar tercero (UPDATE)          ║
║  • DELETE /api/terceros/:nit — Eliminar tercero (DELETE)         ║
║  • POST /api/clasificacion — Guardar evaluaciones                ║
║  • DELETE /api/limpiar-bd — Limpiar BD (requiere pass)           ║
║                                                                   ║
║  Variables de entorno (.env o Azure App Service):                 ║
║  ✅ DB_SERVER=${process.env.DB_SERVER ? 'configurado' : 'FALTA'}
║  ✅ DB_NAME=${process.env.DB_NAME ? 'configurado' : 'FALTA'}
║  ✅ DB_USER=${process.env.DB_USER ? 'configurado' : 'FALTA'}
║  ✅ DB_PASSWORD=${process.env.DB_PASSWORD ? 'configurado' : 'FALTA'}
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
      `);
      
      console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
      console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
      console.log(`✅ Conexión a Azure SQL verificada y funcionando`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recibido. Cerrando servidor gracefully...');
      if (pool) {
        pool.close().then(() => {
          console.log('✅ Conexión a BD cerrada');
          server.close(() => {
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
          });
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

// Manejo de uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

module.exports = app;
