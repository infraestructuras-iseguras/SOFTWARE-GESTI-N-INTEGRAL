const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ================================================================
// SQL SERVER
// ================================================================

let sql;

try {
  sql = require('mssql');
  console.log('✅ Módulo mssql importado correctamente');
} catch (e) {
  console.error('❌ Error importando mssql.');
  console.error('Ejecuta: npm install mssql');
  process.exit(1);
}

// ================================================================
// VARIABLES DE ENTORNO
// ================================================================

try {
  require('dotenv').config();
} catch (e) {
  console.warn('⚠️ dotenv no disponible. Usando variables del sistema.');
}

// ================================================================
// APLICACIÓN
// ================================================================

const app = express();

const PORT = process.env.PORT || 3000;

// ================================================================
// MIDDLEWARE
// ================================================================

app.use(cors());

app.use(
  express.json({
    limit: '50mb'
  })
);

app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true
  })
);

// ================================================================
// CONFIGURACIÓN AZURE SQL
// ================================================================

const config = {

  server:
    process.env.DB_SERVER ||
    'azure-iseguras.database.windows.net',

  database:
    process.env.DB_NAME ||
    'PruebaAplicacion',

  options: {

    encrypt: true,

    trustServerCertificate: false,

    port: 1433,

    connectTimeout: 30000,

    requestTimeout: 30000,

    connectionTimeout: 30000

  },

  pool: {

    min: 0,

    max: 10,

    idleTimeoutMillis: 30000

  }

};

if(process.env.DB_USER && process.env.DB_PASSWORD){
  config.user=process.env.DB_USER;
  config.password=process.env.DB_PASSWORD;
} else {
  config.authentication={type:'azure-active-directory-default',options:{}};
}

// ================================================================
// POOL GLOBAL
// ================================================================

let pool = null;

// ================================================================
// CONEXIÓN
// ================================================================

async function initializeDatabase() {

  try {

    if (pool && pool.connected) {
      return true;
    }

    if (pool) {
      try { await pool.close(); } catch (closeError) {}
      pool = null;
    }

    console.log('');
    console.log('==============================================');
    console.log('🔄 CONECTANDO A AZURE SQL');
    console.log('==============================================');

    console.log(`Servidor: ${config.server}`);

    console.log(`Base de datos: ${config.database}`);

    console.log(
      'Autenticación: Microsoft Entra ID / Managed Identity'
    );

    pool = new sql.ConnectionPool(config);

    pool.on('error', error => {

      console.error(
        '❌ Error en pool SQL:',
        error.message
      );

    });

    await pool.connect();

    console.log('');
    console.log('✅ CONEXIÓN EXITOSA');
    console.log(`📍 ${config.server}`);
    console.log(`🗄️ ${config.database}`);
    console.log('');

    return true;

  } catch (error) {

    if (pool) {
      try { await pool.close(); } catch (closeError) {}
      pool = null;
    }

    console.error('');
    console.error('❌ ERROR DE CONEXIÓN A AZURE SQL');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code || 'N/A');

    console.error('');
    console.error('Verificar:');

    console.error(
      'DB_SERVER:',
      process.env.DB_SERVER || 'NO CONFIGURADO'
    );

    console.error(
      'DB_NAME:',
      process.env.DB_NAME || 'NO CONFIGURADO'
    );

    console.error(
      'Managed Identity del App Service'
    );

    console.error(
      'Permisos de la identidad en Azure SQL'
    );

    console.error(
      'Firewall de Azure SQL'
    );

    return false;
  }
}

let reconnectTimer = null;
let connectingDatabase = false;

async function connectDatabaseWithRetry() {
  if (connectingDatabase || (pool && pool.connected)) return;
  connectingDatabase = true;
  const connected = await initializeDatabase();
  connectingDatabase = false;

  if (!connected) {
    console.error('⚠️ La API sigue activa. Nuevo intento de conexión SQL en 15 segundos.');
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectDatabaseWithRetry, 15000);
  }
}

// ================================================================
// HEALTH CHECK
// ================================================================

app.get('/health', (req, res) => {

  const connected =
    pool !== null &&
    pool.connected === true;

  res.status(
    connected ? 200 : 503
  ).json({

    status:
      connected
        ? 'healthy'
        : 'unhealthy',

    timestamp:
      new Date().toISOString(),

    uptime:
      process.uptime(),

    environment:
      process.env.NODE_ENV ||
      'production',

    version:
      '10.0.0',

    database: {

      connected,

      server:
        config.server,

      database:
        config.database

    }

  });

});

// ================================================================
// TEST REAL DE AZURE SQL
// ================================================================

app.get('/test-db', async (req, res) => {

  try {

    if (!pool || !pool.connected) {

      return res.status(503).json({

        ok: false,

        connected: false,

        server: config.server,

        database: config.database,

        error:
          'No existe conexión con Azure SQL'

      });

    }

    const request =
      new sql.Request(pool);

    const result =
      await request.query(`

        SELECT

          GETDATE() AS server_time,

          @@SERVERNAME AS server_name,

          DB_NAME() AS database_name

      `);

    const row =
      result.recordset[0];

    res.status(200).json({

      ok: true,

      connected: true,

      message:
        'Conexión REAL con Azure SQL funcionando',

      server:
        config.server,

      database:
        config.database,

      server_info: {

        server_name:
          row.server_name,

        database_name:
          row.database_name,

        server_time:
          row.server_time

      },

      timestamp:
        new Date().toISOString()

    });

  } catch (error) {

    console.error(
      '❌ Error /test-db:',
      error
    );

    res.status(503).json({

      ok: false,

      connected: false,

      error:
        error.message

    });

  }

});

// ================================================================
// STATUS
// ================================================================

app.get('/api/status', (req, res) => {

  const connected =
    pool !== null &&
    pool.connected === true;

  res.status(200).json({

    ok: true,

    service:
      'SGRT v10',

    status:
      connected
        ? 'connected'
        : 'disconnected',

    version:
      '10.0.0',

    timestamp:
      new Date().toISOString(),

    database: {

      server:
        config.server,

      database:
        config.database,

      connected

    },

    endpoints: [

      'GET /api/terceros',

      'GET /api/terceros/:nit',

      'POST /api/terceros',

      'PUT /api/terceros/:nit',

      'DELETE /api/terceros/:nit',

      'POST /api/clasificacion',

      'GET /api/database/tables',

      'GET /api/database/schema'

    ]

  });

});

// ================================================================
// CONSULTAR TABLAS
// ================================================================

app.get(
  '/api/database/tables',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a Azure SQL'

        });

      }

      const request =
        new sql.Request(pool);

      const result =
        await request.query(`

          SELECT

            TABLE_SCHEMA,

            TABLE_NAME

          FROM INFORMATION_SCHEMA.TABLES

          WHERE TABLE_TYPE = 'BASE TABLE'

          ORDER BY
            TABLE_SCHEMA,
            TABLE_NAME

        `);

      res.json({

        ok: true,

        database:
          config.database,

        count:
          result.recordset.length,

        tables:
          result.recordset

      });

    } catch (error) {

      console.error(
        '❌ Error consultando tablas:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// ESQUEMA DE TERCEROS
// ================================================================

app.get(
  '/api/database/schema',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a Azure SQL'

        });

      }

      const request =
        new sql.Request(pool);

      const result =
        await request.query(`

          SELECT

            COLUMN_NAME,

            DATA_TYPE,

            CHARACTER_MAXIMUM_LENGTH,

            IS_NULLABLE

          FROM INFORMATION_SCHEMA.COLUMNS

          WHERE

            TABLE_SCHEMA = 'dbo'

            AND TABLE_NAME = 'Terceros'

          ORDER BY
            ORDINAL_POSITION

        `);

      res.json({

        ok: true,

        table:
          'dbo.Terceros',

        columns:
          result.recordset

      });

    } catch (error) {

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// GET TODOS LOS TERCEROS
// ================================================================

app.get(
  '/api/terceros',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const request =
        new sql.Request(pool);

      const result =
        await request.query(`

          SELECT

            NIT,
            NIT AS nit,
            Nombre_Tercero,
            Nombre_Tercero AS nombre,
            Servicio_Contratado,
            Servicio_Contratado AS servicio_contratado,
            Domicilio,
            Domicilio AS domicilio,
            Fecha_Registro

          FROM dbo.Terceros

          ORDER BY
            Fecha_Registro DESC

      `);

      console.log(
        `✅ GET /api/terceros → ${result.recordset.length} registros`
      );

      res.status(200).json({

        ok: true,

        count:
          result.recordset.length,

        data:
          result.recordset,

        timestamp:
          new Date().toISOString()

      });

    } catch (error) {

      console.error(
        '❌ GET /api/terceros:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// GET TERCERO POR NIT
// ================================================================

app.get(
  '/api/terceros/:nit',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const nit =
        req.params.nit;

      const request =
        new sql.Request(pool);

      request.input(
        'nit',
        sql.NVarChar(50),
        nit
      );

      const result =
        await request.query(`

          SELECT

            NIT,
            NIT AS nit,
            Nombre_Tercero,
            Nombre_Tercero AS nombre,
            Servicio_Contratado,
            Servicio_Contratado AS servicio_contratado,
            Domicilio,
            Domicilio AS domicilio,
            Fecha_Registro

          FROM dbo.Terceros

          WHERE NIT = @nit

        `);

      if (
        result.recordset.length === 0
      ) {

        return res.status(404).json({

          ok: false,

          error:
            'Tercero no encontrado',

          nit

        });

      }

      res.json({

        ok: true,

        data:
          result.recordset[0]

      });

    } catch (error) {

      console.error(
        '❌ GET tercero:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// CREAR TERCERO
// ================================================================

app.post(
  '/api/terceros',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const body = req.body || {};
      const source = body.tercero && typeof body.tercero === 'object' ? body.tercero : body;
      const nit = source.nit || source.NIT || body.nit || body.NIT;
      const nombre = source.nombre || source.NombreTercero || source.Nombre_Tercero || source.Nombre || body.nombre || body.Nombre;
      const domicilio = source.domicilio || source.Domicilio || body.domicilio || body.Domicilio || null;
      const servicio_contratado = source.servicio_contratado || source.servicio || source.ServicioContratado || source.Servicio_Contratado || body.servicio_contratado || body.servicio || null;

      if (!nit || !nombre) {

        return res.status(400).json({

          ok: false,

          error:
            'NIT y nombre son obligatorios'

        });

      }

      const request =
        new sql.Request(pool);

      request.input(
        'nit',
        sql.NVarChar(50),
        nit
      );

      request.input(
        'nombre',
        sql.NVarChar(255),
        nombre
      );

      request.input(
        'domicilio',
        sql.NVarChar(255),
        domicilio || null
      );

      request.input(
        'servicio',
        sql.NVarChar(255),
        servicio_contratado || null
      );

      // ------------------------------------------------------------
      // Verificar existencia
      // ------------------------------------------------------------

      const exists =
        await request.query(`

          SELECT NIT

          FROM dbo.Terceros

          WHERE NIT = @nit

        `);

      // ------------------------------------------------------------
      // ACTUALIZAR
      // ------------------------------------------------------------

      if (exists.recordset.length > 0) {

        await request.query(`

          UPDATE dbo.Terceros

          SET

            Nombre_Tercero =
              @nombre,

            Domicilio =
              @domicilio,

            Servicio_Contratado =
              @servicio

          WHERE NIT = @nit

        `);

        console.log(
          `✅ Tercero actualizado: ${nit}`
        );

        return res.status(200).json({

          ok: true,

          message:
            'Tercero actualizado',

          nit

        });

      }

      // ------------------------------------------------------------
      // INSERTAR
      // ------------------------------------------------------------

      await request.query(`

        INSERT INTO dbo.Terceros

        (

          NIT,

          Nombre_Tercero,

          Servicio_Contratado,

          Domicilio,

          Fecha_Registro

        )

        VALUES

        (

          @nit,

          @nombre,

          @servicio,

          @domicilio,

          GETDATE()

        )

      `);

      console.log(
        `✅ Tercero creado: ${nit}`
      );

      res.status(201).json({

        ok: true,

        message:
          'Tercero creado',

        nit,

        nombre,

        database:
          config.database

      });

    } catch (error) {

      console.error(
        '❌ POST /api/terceros:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// ACTUALIZAR TERCERO
// ================================================================

app.put(
  '/api/terceros/:nit',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const nit =
        req.params.nit;

      const {

        nombre,

        domicilio,

        servicio_contratado

      } = req.body;

      const request =
        new sql.Request(pool);

      request.input(
        'nit',
        sql.NVarChar(50),
        nit
      );

      request.input(
        'nombre',
        sql.NVarChar(255),
        nombre
      );

      request.input(
        'domicilio',
        sql.NVarChar(255),
        domicilio || null
      );

      request.input(
        'servicio',
        sql.NVarChar(255),
        servicio_contratado || null
      );

      const result =
        await request.query(`

          UPDATE dbo.Terceros

          SET

            Nombre_Tercero =
              @nombre,

            Domicilio =
              @domicilio,

            Servicio_Contratado =
              @servicio

          WHERE NIT = @nit

        `);

      if (
        result.rowsAffected[0] === 0
      ) {

        return res.status(404).json({

          ok: false,

          error:
            'Tercero no encontrado',

          nit

        });

      }

      console.log(
        `✅ Tercero actualizado: ${nit}`
      );

      res.json({

        ok: true,

        message:
          'Tercero actualizado',

        nit

      });

    } catch (error) {

      console.error(
        '❌ PUT /api/terceros:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// ELIMINAR TERCERO
// ================================================================

app.delete(
  '/api/terceros/:nit',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const nit =
        req.params.nit;

      const request =
        new sql.Request(pool);

      request.input(
        'nit',
        sql.NVarChar(50),
        nit
      );

      const result =
        await request.query(`

          DELETE FROM dbo.Terceros

          WHERE NIT = @nit

        `);

      if (
        result.rowsAffected[0] === 0
      ) {

        return res.status(404).json({

          ok: false,

          error:
            'Tercero no encontrado'

        });

      }

      console.log(
        `🗑️ Tercero eliminado: ${nit}`
      );

      res.json({

        ok: true,

        message:
          'Tercero eliminado',

        nit

      });

    } catch (error) {

      console.error(
        '❌ DELETE /api/terceros:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// CLASIFICACIÓN
// ================================================================
//
// IMPORTANTE:
// La tabla dbo.Terceros REAL que mostraste NO tiene una columna
// "Evaluaciones". Por eso no se debe ejecutar:
// UPDATE Terceros SET Evaluaciones = ...
//
// La clasificación debe persistirse posteriormente en:
// Relacion_Terceros
// Formulario_Clasificacion_Terceros
// Matriz_Riesgos_Resultados
//
// Por ahora verificamos que el tercero exista.
// ================================================================

app.post(
  '/api/clasificacion',
  async (req, res) => {

    try {

      if (!pool || !pool.connected) {

        return res.status(503).json({

          ok: false,

          error:
            'No hay conexión a base de datos'

        });

      }

      const tercero =
        req.body.tercero || {};

      const evaluaciones =
        req.body.evaluaciones || [];

      const nit =
        tercero.nit ||
        tercero.NIT;

      if (!nit) {

        return res.status(400).json({

          ok: false,

          error:
            'NIT del tercero es obligatorio'

        });

      }

      const request =
        new sql.Request(pool);

      request.input(
        'nit',
        sql.NVarChar(50),
        nit
      );

      const result =
        await request.query(`

          SELECT

            NIT,

            Nombre_Tercero

          FROM dbo.Terceros

          WHERE NIT = @nit

        `);

      if (
        result.recordset.length === 0
      ) {

        return res.status(404).json({

          ok: false,

          error:
            'El tercero no existe',

          nit

        });

      }

      console.log(
        `📊 Clasificación recibida para ${nit}`
      );

      console.log(
        `📊 Evaluaciones recibidas: ${evaluaciones.length}`
      );

      res.status(200).json({

        ok: true,

        message:
          'Tercero localizado. Evaluaciones recibidas.',

        nit,

        nombre:
          result.recordset[0]
            .Nombre_Tercero,

        evaluaciones_recibidas:
          evaluaciones.length,

        next_storage:
          'Relacion_Terceros / Formulario_Clasificacion_Terceros / Matriz_Riesgos_Resultados'

      });

    } catch (error) {

      console.error(
        '❌ POST /api/clasificacion:',
        error.message
      );

      res.status(500).json({

        ok: false,

        error:
          error.message

      });

    }

  }
);

// ================================================================
// ARCHIVOS ESTÁTICOS
// ================================================================

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

// ================================================================
// BUSCAR INDEX
// ================================================================

function findIndexHtml() {

  const possiblePaths = [

    path.join(
      __dirname,
      'public',
      'Index.html'
    ),

    path.join(
      __dirname,
      'public',
      'index.html'
    ),

    path.join(
      __dirname,
      'Index.html'
    ),

    path.join(
      __dirname,
      'index.html'
    ),

    '/home/site/wwwroot/Index.html',

    '/home/site/wwwroot/public/Index.html'

  ];

  for (
    const filePath of possiblePaths
  ) {

    try {

      if (
        fs.existsSync(filePath)
      ) {

        console.log(
          `✅ Index encontrado: ${filePath}`
        );

        return filePath;

      }

    } catch (error) {

      // continuar

    }

  }

  return null;

}

// ================================================================
// INICIO
// ================================================================

app.get('/', (req, res) => {

  const indexPath =
    findIndexHtml();

  if (!indexPath) {

    return res.status(500).json({

      ok: false,

      error:
        'No se encontró Index.html'

    });

  }

  res.sendFile(
    indexPath,
    error => {

      if (error) {

        console.error(
          '❌ Error sirviendo Index:',
          error.message
        );

      }

    }
  );

});

// ================================================================
// 404
// ================================================================

app.use(
  (req, res) => {

    res.status(404).json({

      ok: false,

      error:
        'Ruta no encontrada',

      path:
        req.path

    });

  }
);

// ================================================================
// ERROR GLOBAL
// ================================================================

app.use(
  (err, req, res, next) => {

    console.error(
      '❌ Error no manejado:',
      err
    );

    res.status(500).json({

      ok: false,

      error:
        'Error interno del servidor',

      message:
        err.message

    });

  }
);

// ================================================================
// INICIAR SERVIDOR
// ================================================================

async function startServer() {

  try {

    const server =
      app.listen(
        PORT,
        () => {

          console.log('');
          console.log(
            '================================================'
          );

          console.log(
            '🚀 SGRT v10 INICIADO'
          );

          console.log(
            '================================================'
          );

          console.log(
            `🌐 Puerto: ${PORT}`
          );

          console.log(
            `🗄️ Base de datos: ${config.database}`
          );

          console.log(
            `📍 Servidor: ${config.server}`
          );

          console.log(
            '🔐 Microsoft Entra ID / Managed Identity'
          );

          console.log('');
          console.log(
            'Health: /health'
          );

          console.log(
            'Test BD: /test-db'
          );

          console.log(
            'Status: /api/status'
          );

          console.log(
            'Tablas: /api/database/tables'
          );

          console.log(
            'Schema: /api/database/schema'
          );

          console.log(
            'Terceros: /api/terceros'
          );

          console.log('');
          console.log(
            '🔄 Conexión Azure SQL iniciada en segundo plano'
          );

          console.log(
            '================================================'
          );

        }
      );

    // El servidor HTTP debe permanecer disponible aunque Azure SQL tarde en
    // aceptar la identidad administrada. Evita el 502 del App Service y
    // reintenta la conexión sin bloquear el proceso.
    connectDatabaseWithRetry();

    // ------------------------------------------------------------
    // CIERRE LIMPIO
    // ------------------------------------------------------------

    process.on(
      'SIGTERM',
      async () => {

        console.log(
          '🛑 SIGTERM recibido'
        );

        try {

          clearTimeout(reconnectTimer);

          if (pool) {

            await pool.close();

            console.log(
              '✅ Pool SQL cerrado'
            );

          }

          server.close(
            () => {

              console.log(
                '✅ Servidor cerrado'
              );

              process.exit(0);

            }
          );

        } catch (error) {

          console.error(
            '❌ Error cerrando servidor:',
            error.message
          );

          process.exit(1);

        }

      }
    );

  } catch (error) {

    console.error(
      '❌ Error iniciando servidor:',
      error
    );

    process.exit(1);

  }

}

// ================================================================
// ERRORES DE NODE
// ================================================================

process.on(
  'uncaughtException',
  error => {

    console.error(
      '❌ Excepción no capturada:',
      error

    );

    process.exit(1);

  }
);

process.on(
  'unhandledRejection',
  reason => {

    console.error(
      '❌ Promesa rechazada:',
      reason

    );

  }
);

// ================================================================
// ARRANCAR
// ================================================================

startServer();

// ================================================================
// EXPORTAR
// ================================================================

module.exports = app;
