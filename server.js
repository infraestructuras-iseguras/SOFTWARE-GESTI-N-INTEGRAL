const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

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
// ESTADO EXTENDIDO SGRT
// ================================================================
// dbo.Terceros conserva el maestro real. Esta tabla auxiliar guarda en JSON
// contratos, supervisores, clasificación por contrato, aprobaciones y estado
// del flujo sin exigir cambios a la estructura original de dbo.Terceros.
let sgrtStateReady = false;

async function ensureSGRTStateTable() {
  if (!pool || !pool.connected) return false;
  try {
    const request = new sql.Request(pool);
    await request.query(`
      IF OBJECT_ID('dbo.SGRT_Tercero_Estado', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.SGRT_Tercero_Estado (
          NIT NVARCHAR(50) NOT NULL PRIMARY KEY,
          Payload NVARCHAR(MAX) NULL,
          UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_SGRT_Tercero_Estado_UpdatedAt DEFAULT SYSUTCDATETIME()
        );
      END
    `);
    sgrtStateReady = true;
    console.log('✅ Tabla de estado SGRT disponible: dbo.SGRT_Tercero_Estado');
    return true;
  } catch (error) {
    sgrtStateReady = false;
    console.warn('⚠️ No se pudo crear/verificar dbo.SGRT_Tercero_Estado:', error.message);
    console.warn('   Ejecuta backend/SQL_SETUP_SGRT_ESTADO.sql con un usuario con permisos DDL.');
    return false;
  }
}

async function upsertSGRTState(nit, payload) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) throw new Error('La tabla dbo.SGRT_Tercero_Estado no está disponible');
  const request = new sql.Request(pool);
  request.input('nit', sql.NVarChar(50), String(nit));
  request.input('payload', sql.NVarChar(sql.MAX), JSON.stringify(payload || {}));
  await request.query(`
    MERGE dbo.SGRT_Tercero_Estado AS target
    USING (SELECT @nit AS NIT) AS src
      ON target.NIT = src.NIT
    WHEN MATCHED THEN
      UPDATE SET Payload = @payload, UpdatedAt = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN
      INSERT (NIT, Payload, UpdatedAt) VALUES (@nit, @payload, SYSUTCDATETIME());
  `);
}

async function getSGRTState(nit) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) return null;
  const request = new sql.Request(pool);
  request.input('nit', sql.NVarChar(50), String(nit));
  const result = await request.query(`SELECT NIT, Payload, UpdatedAt FROM dbo.SGRT_Tercero_Estado WHERE NIT=@nit`);
  if (!result.recordset.length) return null;
  const row = result.recordset[0];
  let payload = {};
  try { payload = JSON.parse(row.Payload || '{}'); } catch (e) { payload = {}; }
  return { nit: row.NIT, estado_sgrt: payload, updatedAt: row.UpdatedAt };
}

// ================================================================
// MAESTRO DE ENTIDADES / ORGANIZACIONES SGRT
// ================================================================
let sgrtEntitiesReady = false;

async function ensureSGRTEntitiesTable() {
  if (!pool || !pool.connected) return false;
  try {
    await new sql.Request(pool).query(`
      IF OBJECT_ID('dbo.SGRT_Entidades', 'U') IS NULL
      BEGIN
        CREATE TABLE dbo.SGRT_Entidades (
          Entidad_ID NVARCHAR(120) NOT NULL PRIMARY KEY,
          Nombre NVARCHAR(250) NOT NULL,
          Acronimo NVARCHAR(50) NULL,
          Estado NVARCHAR(30) NOT NULL CONSTRAINT DF_SGRT_Entidades_Estado DEFAULT N'Activo',
          FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_SGRT_Entidades_Fecha DEFAULT SYSUTCDATETIME(),
          UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_SGRT_Entidades_Updated DEFAULT SYSUTCDATETIME()
        );
      END
    `);
    sgrtEntitiesReady = true;
    return true;
  } catch (e) {
    sgrtEntitiesReady = false;
    console.warn('⚠️ No se pudo crear/verificar dbo.SGRT_Entidades:', e.message);
    return false;
  }
}

async function upsertEntidadSGRT(ent) {
  if (!sgrtEntitiesReady) await ensureSGRTEntitiesTable();
  if (!sgrtEntitiesReady) throw new Error('dbo.SGRT_Entidades no disponible');
  const id = String(ent.id || ent.Entidad_ID || '').trim();
  const nombre = String(ent.nombre || ent.Nombre || id).trim();
  const acronimo = String(ent.acronimo || ent.Acronimo || '').trim();
  const estado = String(ent.estado || ent.Estado || 'Activo').trim() || 'Activo';
  if (!id || !nombre) throw new Error('Entidad_ID y Nombre son obligatorios');
  const rq = new sql.Request(pool);
  rq.input('id', sql.NVarChar(120), id);
  rq.input('nombre', sql.NVarChar(250), nombre);
  rq.input('acronimo', sql.NVarChar(50), acronimo || null);
  rq.input('estado', sql.NVarChar(30), estado);
  await rq.query(`
    MERGE dbo.SGRT_Entidades AS target
    USING (SELECT @id AS Entidad_ID) src ON target.Entidad_ID = src.Entidad_ID
    WHEN MATCHED THEN UPDATE SET Nombre=@nombre, Acronimo=@acronimo, Estado=@estado, UpdatedAt=SYSUTCDATETIME()
    WHEN NOT MATCHED THEN INSERT (Entidad_ID,Nombre,Acronimo,Estado,FechaCreacion,UpdatedAt)
      VALUES (@id,@nombre,@acronimo,@estado,SYSUTCDATETIME(),SYSUTCDATETIME());
  `);
}

// ================================================================
// CONEXIÓN
// ================================================================

async function initializeDatabase() {

  try {

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
    await ensureSGRTStateTable();
    await ensureSGRTEntitiesTable();

    console.log('');
    console.log('✅ CONEXIÓN EXITOSA');
    console.log(`📍 ${config.server}`);
    console.log(`🗄️ ${config.database}`);
    console.log('');

    return true;

  } catch (error) {

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

// ================================================================
// API ESTADO EXTENDIDO SGRT
// ================================================================
app.get('/api/sgrt-state', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    if (!sgrtStateReady) await ensureSGRTStateTable();
    if (!sgrtStateReady) return res.status(503).json({ok:false,error:'Tabla de estado SGRT no disponible'});
    const result = await new sql.Request(pool).query(`SELECT NIT, Payload, UpdatedAt FROM dbo.SGRT_Tercero_Estado ORDER BY UpdatedAt DESC`);
    const data = result.recordset.map(row => {
      let estado_sgrt = {};
      try { estado_sgrt = JSON.parse(row.Payload || '{}'); } catch (e) {}
      return {nit: row.NIT, estado_sgrt, updatedAt: row.UpdatedAt};
    });
    res.json({ok:true,count:data.length,data});
  } catch (error) {
    console.error('❌ GET /api/sgrt-state:', error.message);
    res.status(500).json({ok:false,error:error.message});
  }
});

app.get('/api/sgrt-state/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    const state = await getSGRTState(req.params.nit);
    if (!state) return res.status(404).json({ok:false,error:'Estado SGRT no encontrado',nit:req.params.nit});
    res.json({ok:true,data:state});
  } catch (error) {
    res.status(500).json({ok:false,error:error.message});
  }
});

app.post('/api/sgrt-state/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    const nit = String(req.params.nit || '').trim();
    if (!nit) return res.status(400).json({ok:false,error:'NIT obligatorio'});
    const payload = (req.body && req.body.estado_sgrt && typeof req.body.estado_sgrt === 'object') ? req.body.estado_sgrt : (req.body || {});
    payload.nit = payload.nit || nit;
    await upsertSGRTState(nit, payload);
    res.json({ok:true,message:'Estado SGRT persistido',nit});
  } catch (error) {
    console.error('❌ POST /api/sgrt-state:', error.message);
    res.status(500).json({ok:false,error:error.message});
  }
});

app.delete('/api/sgrt-state/:nit', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    if (!sgrtStateReady) await ensureSGRTStateTable();
    if (!sgrtStateReady) return res.status(503).json({ok:false,error:'Tabla de estado SGRT no disponible'});
    const request = new sql.Request(pool);
    request.input('nit', sql.NVarChar(50), String(req.params.nit));
    await request.query(`DELETE FROM dbo.SGRT_Tercero_Estado WHERE NIT=@nit`);
    res.json({ok:true,nit:req.params.nit});
  } catch (error) {
    res.status(500).json({ok:false,error:error.message});
  }
});

// ================================================================
// API ENTIDADES / ORGANIZACIONES
// ================================================================
app.get('/api/entidades', async (req,res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    if (!sgrtEntitiesReady) await ensureSGRTEntitiesTable();
    const result = await new sql.Request(pool).query(`
      SELECT Entidad_ID AS id, Nombre AS nombre, Acronimo AS acronimo, Estado AS estado,
             FechaCreacion AS fechaCreacion, UpdatedAt AS updatedAt
      FROM dbo.SGRT_Entidades
      WHERE Estado <> N'Inactivo'
      ORDER BY Nombre
    `);
    res.json({ok:true,count:result.recordset.length,data:result.recordset});
  } catch(e) { res.status(500).json({ok:false,error:e.message}); }
});

app.post('/api/entidades', async (req,res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    await upsertEntidadSGRT(req.body || {});
    res.json({ok:true});
  } catch(e) { res.status(400).json({ok:false,error:e.message}); }
});

app.post('/api/entidades/sync', async (req,res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    if (!sgrtEntitiesReady) await ensureSGRTEntitiesTable();
    const list = Array.isArray(req.body && req.body.entidades) ? req.body.entidades : [];
    const ids=[];
    for (const ent of list) {
      const id=String(ent.id || ent.Entidad_ID || '').trim();
      if(!id) continue;
      ids.push(id);
      await upsertEntidadSGRT(ent);
    }
    // Las entidades eliminadas en la app quedan inactivas, preservando histórico.
    const current = await new sql.Request(pool).query(`SELECT Entidad_ID FROM dbo.SGRT_Entidades WHERE Estado<>N'Inactivo'`);
    for(const row of current.recordset){
      if(ids.indexOf(String(row.Entidad_ID))<0){
        const rq=new sql.Request(pool);rq.input('id',sql.NVarChar(120),String(row.Entidad_ID));
        await rq.query(`UPDATE dbo.SGRT_Entidades SET Estado=N'Inactivo',UpdatedAt=SYSUTCDATETIME() WHERE Entidad_ID=@id`);
      }
    }
    res.json({ok:true,count:ids.length});
  } catch(e) { res.status(500).json({ok:false,error:e.message}); }
});

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

      // Borrado coherente e idempotente: elimina primero el estado extendido
      // y luego el registro maestro dentro de la misma transacción. Así un NIT
      // borrado no puede reaparecer en otras fases por quedar en SGRT_Tercero_Estado.
      const result =
        await request.query(`
          SET XACT_ABORT ON;
          BEGIN TRY
            BEGIN TRANSACTION;

            IF OBJECT_ID('dbo.SGRT_Tercero_Estado', 'U') IS NOT NULL
              DELETE FROM dbo.SGRT_Tercero_Estado WHERE NIT = @nit;

            DELETE FROM dbo.Terceros WHERE NIT = @nit;
            DECLARE @deleted INT = @@ROWCOUNT;

            COMMIT TRANSACTION;
            SELECT @deleted AS deleted;
          END TRY
          BEGIN CATCH
            IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
            THROW;
          END CATCH
        `);

      const deleted =
        Number((result.recordset && result.recordset[0] && result.recordset[0].deleted) || 0);

      console.log(
        deleted
          ? `🗑️ Tercero eliminado: ${nit}`
          : `ℹ️ Tercero ya estaba eliminado: ${nit}`
      );

      // Idempotente: si ya no existe, sigue siendo un borrado exitoso.
      res.json({

        ok: true,

        message:
          deleted
            ? 'Tercero eliminado'
            : 'Tercero ya estaba eliminado',

        nit,

        deleted:
          deleted > 0

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
// SHAREPOINT / MICROSOFT GRAPH — REPOSITORIO DOCUMENTAL SGRT
// ================================================================
// Ruta vinculada solicitada:
// https://iseguras.sharepoint.com/sites/Consultoria/Proyectos%20Actuales/Prueba%20-%20APP%20-%20SGRT
//
// Variables requeridas en Azure App Service:
// SHAREPOINT_TENANT_ID
// SHAREPOINT_CLIENT_ID
// SHAREPOINT_CLIENT_SECRET
// Opcionales (ya tienen valores por defecto para este proyecto):
// SHAREPOINT_HOST, SHAREPOINT_SITE_PATH, SHAREPOINT_ROOT_PATH, SHAREPOINT_ROOT_WEB_URL

const SP_CFG = {
  tenantId: process.env.SHAREPOINT_TENANT_ID || process.env.AZURE_TENANT_ID || '',
  clientId: process.env.SHAREPOINT_CLIENT_ID || '',
  clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
  host: process.env.SHAREPOINT_HOST || 'iseguras.sharepoint.com',
  sitePath: process.env.SHAREPOINT_SITE_PATH || '/sites/Consultoria',
  rootPath: process.env.SHAREPOINT_ROOT_PATH || '/Proyectos Actuales/Prueba - APP - SGRT',
  rootWebUrl: process.env.SHAREPOINT_ROOT_WEB_URL || 'https://iseguras.sharepoint.com/sites/Consultoria/Proyectos%20Actuales/Prueba%20-%20APP%20-%20SGRT'
};

let spTokenCache = { token: '', expiresAt: 0 };
let spContextCache = { value: null, expiresAt: 0 };

function spConfigured(){
  return !!(SP_CFG.tenantId && SP_CFG.clientId && SP_CFG.clientSecret);
}

function spHttp(url, method='GET', headers={}, body=null){
  return new Promise((resolve,reject)=>{
    const u = new URL(url);
    const opts = {
      protocol: u.protocol,
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method,
      headers: Object.assign({}, headers)
    };
    if(body && !Buffer.isBuffer(body)) body = Buffer.from(String(body));
    if(body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(opts, r=>{
      const chunks=[];
      r.on('data',c=>chunks.push(c));
      r.on('end',()=>{
        const buf=Buffer.concat(chunks);
        const txt=buf.toString('utf8');
        let data=txt;
        const ct=String(r.headers['content-type']||'');
        if(ct.includes('application/json') || (txt && /^[\[{]/.test(txt.trim()))){
          try{data=JSON.parse(txt);}catch(e){}
        }
        if(r.statusCode>=200 && r.statusCode<300) return resolve({status:r.statusCode,headers:r.headers,data,buffer:buf});
        const err=new Error((data&&data.error&&data.error.message)||txt||('HTTP '+r.statusCode));
        err.status=r.statusCode; err.data=data; reject(err);
      });
    });
    req.on('error',reject);
    if(body) req.write(body);
    req.end();
  });
}

async function spAccessToken(){
  if(!spConfigured()) throw new Error('SharePoint no está configurado en las variables de entorno');
  if(spTokenCache.token && Date.now() < spTokenCache.expiresAt-60000) return spTokenCache.token;
  const form = new URLSearchParams({
    client_id: SP_CFG.clientId,
    client_secret: SP_CFG.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  }).toString();
  const r = await spHttp(
    `https://login.microsoftonline.com/${encodeURIComponent(SP_CFG.tenantId)}/oauth2/v2.0/token`,
    'POST',
    {'Content-Type':'application/x-www-form-urlencoded'},
    form
  );
  if(!r.data || !r.data.access_token) throw new Error('Microsoft Entra no devolvió access_token');
  spTokenCache={token:r.data.access_token,expiresAt:Date.now()+Number(r.data.expires_in||3600)*1000};
  return spTokenCache.token;
}

async function spGraph(pathName, method='GET', body=null, contentType='application/json'){
  const token=await spAccessToken();
  let payload=body;
  const headers={Authorization:'Bearer '+token};
  if(body!==null && body!==undefined){
    if(contentType==='application/json' && !Buffer.isBuffer(body)) payload=JSON.stringify(body);
    headers['Content-Type']=contentType;
  }
  return spHttp('https://graph.microsoft.com/v1.0'+pathName,method,headers,payload);
}

function spSafeRel(v){
  return String(v||'').replace(/\\/g,'/').split('/').filter(Boolean).filter(x=>x!=='.'&&x!=='..').join('/');
}
function spEncodePath(v){
  return String(v||'').split('/').filter(Boolean).map(encodeURIComponent).join('/');
}
function spFullPath(rel){
  const root=spSafeRel(SP_CFG.rootPath), child=spSafeRel(rel);
  return child ? root+'/'+child : root;
}

async function spContext(force=false){
  if(!force && spContextCache.value && Date.now()<spContextCache.expiresAt) return spContextCache.value;
  const site = (await spGraph(`/sites/${SP_CFG.host}:${SP_CFG.sitePath}`)).data;
  const drive = (await spGraph(`/sites/${encodeURIComponent(site.id)}/drive`)).data;
  const full=spFullPath('');
  const root = (await spGraph(`/drives/${encodeURIComponent(drive.id)}/root:/${spEncodePath(full)}`)).data;
  const ctx={siteId:site.id,driveId:drive.id,rootItemId:root.id,rootWebUrl:root.webUrl||SP_CFG.rootWebUrl,rootName:root.name||'Prueba - APP - SGRT'};
  spContextCache={value:ctx,expiresAt:Date.now()+5*60*1000};
  return ctx;
}

async function spItemByRel(rel){
  const ctx=await spContext();
  const full=spFullPath(rel);
  return (await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/root:/${spEncodePath(full)}`)).data;
}

async function spEnsureFolder(rel){
  const ctx=await spContext();
  const segs=spSafeRel(rel).split('/').filter(Boolean);
  let built=''; let parent={id:ctx.rootItemId,name:ctx.rootName,webUrl:ctx.rootWebUrl,folder:{}};
  for(const seg of segs){
    built=built?built+'/'+seg:seg;
    try{ parent=await spItemByRel(built); continue; }
    catch(e){ if(e.status!==404) throw e; }
    const created=(await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(parent.id)}/children`,'POST',{
      name:seg, folder:{}, '@microsoft.graph.conflictBehavior':'fail'
    })).data;
    parent=created;
  }
  return parent;
}

app.get('/api/sharepoint/status', async (req,res)=>{
  const base={ok:true,configured:spConfigured(),rootWebUrl:SP_CFG.rootWebUrl,sitePath:SP_CFG.sitePath,rootPath:SP_CFG.rootPath};
  if(!spConfigured()) return res.json(base);
  try{const c=await spContext();return res.json(Object.assign(base,{connected:true,driveId:c.driveId,rootItemId:c.rootItemId,rootWebUrl:c.rootWebUrl}));}
  catch(e){return res.status(503).json(Object.assign(base,{connected:false,error:e.message}));}
});

app.get('/api/sharepoint/list', async (req,res)=>{
  try{
    const rel=spSafeRel(req.query.path||'');
    const ctx=await spContext();
    const current=rel?await spItemByRel(rel):await spItemByRel('');
    const r=await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(current.id)}/children?$select=id,name,size,webUrl,lastModifiedDateTime,folder,file,parentReference`);
    const items=(r.data&&r.data.value||[]).map(x=>({id:x.id,name:x.name,type:x.folder?'folder':'file',size:x.size||0,webUrl:x.webUrl||'',modified:x.lastModifiedDateTime||'',folder:!!x.folder,file:!!x.file}));
    res.json({ok:true,path:rel,current:{id:current.id,name:current.name,webUrl:current.webUrl||'',type:current.folder?'folder':'file'},items});
  }catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.post('/api/sharepoint/ensure-folder', async (req,res)=>{
  try{const rel=spSafeRel(req.body&&req.body.path||'');const item=await spEnsureFolder(rel);res.json({ok:true,item:{id:item.id,name:item.name,webUrl:item.webUrl||''}});}
  catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.post('/api/sharepoint/folder', async (req,res)=>{
  try{
    const rel=spSafeRel(req.body&&req.body.path||''); const name=String(req.body&&req.body.name||'').trim();
    if(!name) return res.status(400).json({ok:false,error:'Nombre requerido'});
    const ctx=await spContext(); const parent=rel?await spItemByRel(rel):await spItemByRel('');
    const item=(await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(parent.id)}/children`,'POST',{name,folder:{},'@microsoft.graph.conflictBehavior':'rename'})).data;
    res.json({ok:true,item:{id:item.id,name:item.name,webUrl:item.webUrl||''}});
  }catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.post('/api/sharepoint/upload', async (req,res)=>{
  try{
    const rel=spSafeRel(req.body&&req.body.path||''); const name=String(req.body&&req.body.name||'').trim();
    const b64=String(req.body&&req.body.contentBase64||''); const mime=String(req.body&&req.body.mimeType||'application/octet-stream');
    if(!name||!b64) return res.status(400).json({ok:false,error:'Archivo incompleto'});
    const ctx=await spContext(); const full=spFullPath((rel?rel+'/':'')+name); const buffer=Buffer.from(b64,'base64');
    const item=(await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/root:/${spEncodePath(full)}:/content`,'PUT',buffer,mime)).data;
    res.json({ok:true,item:{id:item.id,name:item.name,webUrl:item.webUrl||'',size:item.size||buffer.length}});
  }catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.patch('/api/sharepoint/item/:itemId', async (req,res)=>{
  try{const ctx=await spContext();const name=String(req.body&&req.body.name||'').trim();if(!name)return res.status(400).json({ok:false,error:'Nombre requerido'});const item=(await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(req.params.itemId)}`,'PATCH',{name})).data;res.json({ok:true,item:{id:item.id,name:item.name,webUrl:item.webUrl||''}});}
  catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.delete('/api/sharepoint/item/:itemId', async (req,res)=>{
  try{const ctx=await spContext();await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(req.params.itemId)}`,'DELETE');res.json({ok:true});}
  catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

function spRequireSuperadmin(req,res){ if(String(req.headers['x-sgrt-superadmin']||'')!=='1'){res.status(403).json({ok:false,error:'Solo el Superadministrador puede gestionar permisos'});return false;}return true;}

app.get('/api/sharepoint/permissions/:itemId', async (req,res)=>{
  if(!spRequireSuperadmin(req,res)) return;
  try{const ctx=await spContext();const r=await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(req.params.itemId)}/permissions`);const list=(r.data&&r.data.value||[]).map(p=>({id:p.id,roles:p.roles||[],grantedToV2:p.grantedToV2||null,grantedToIdentitiesV2:p.grantedToIdentitiesV2||null,link:p.link||null,invitation:p.invitation||null}));res.json({ok:true,permissions:list});}
  catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.post('/api/sharepoint/permissions/:itemId', async (req,res)=>{
  if(!spRequireSuperadmin(req,res)) return;
  try{
    const ctx=await spContext(); const email=String(req.body&&req.body.email||'').trim(); const role=String(req.body&&req.body.role||'read').toLowerCase()==='write'?'write':'read';
    if(!email) return res.status(400).json({ok:false,error:'Correo requerido'});
    const r=await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(req.params.itemId)}/invite`,'POST',{
      recipients:[{email}],message:'Acceso al repositorio documental SGRT',requireSignIn:true,sendInvitation:false,roles:[role]
    });
    res.json({ok:true,permissions:r.data&&r.data.value||[]});
  }catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
});

app.delete('/api/sharepoint/permissions/:itemId/:permissionId', async (req,res)=>{
  if(!spRequireSuperadmin(req,res)) return;
  try{const ctx=await spContext();await spGraph(`/drives/${encodeURIComponent(ctx.driveId)}/items/${encodeURIComponent(req.params.itemId)}/permissions/${encodeURIComponent(req.params.permissionId)}`,'DELETE');res.json({ok:true});}
  catch(e){res.status(e.status||500).json({ok:false,error:e.message});}
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

    const connected =
      await initializeDatabase();

    if (!connected) {

      console.error(
        '❌ Servidor detenido porque no existe conexión con Azure SQL.'
      );

      process.exit(1);

    }

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
            '✅ Azure SQL conectado correctamente'
          );

          console.log(
            '================================================'
          );

        }
      );

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
