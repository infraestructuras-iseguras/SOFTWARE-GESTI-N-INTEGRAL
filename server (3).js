/**
 * SGRT v9 — SERVIDOR NODE.JS ULTRA SIMPLE Y FUNCIONANDO
 */

const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN AZURE SQL (VERIFICADA)
// ═══════════════════════════════════════════════════════════════

const sqlConfig = {
  server: 'azure-iseguras.database.windows.net',
  database: 'PruebaAplicacion',
  authentication: {
    type: 'default',
    options: {
      userName: 'infraes',
      password: 'Infraestructuras2024!',
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
};

let pool;

// ═══════════════════════════════════════════════════════════════
// CONECTAR A AZURE SQL
// ═══════════════════════════════════════════════════════════════

async function connectDB() {
  try {
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✅ CONECTADO A AZURE SQL');
    return true;
  } catch (err) {
    console.error('❌ ERROR CONECTANDO:', err.message);
    setTimeout(connectDB, 5000);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST: VERIFICAR CONEXIÓN
// ═══════════════════════════════════════════════════════════════

app.get('/test-db', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ ok: false, error: 'Pool not ready' });
    }
    const result = await pool
      .request()
      .query('SELECT 1 as ok, GETDATE() as hora, DB_NAME() as db');
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET: TODOS LOS TERCEROS
// ═══════════════════════════════════════════════════════════════

app.get('/api/terceros', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT TOP 100
        NIT,
        NombreTercero,
        ServicioContratado,
        SupervisorNombre,
        PromedioCriticidad,
        Zona_Riesgo,
        FechaRegistro
      FROM dbo.Relacion_Terceros
      WHERE Activo = 1
      ORDER BY FechaRegistro DESC
    `);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/terceros:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET: CONTRATOS DE UN TERCERO
// ═══════════════════════════════════════════════════════════════

app.get('/api/contratos/:nit', async (req, res) => {
  try {
    const { nit } = req.params;
    const result = await pool
      .request()
      .input('nit', sql.VarChar, nit)
      .query(`
        SELECT TOP 50
          NoContrato,
          Nombre,
          FechaInicio,
          FechaTerminacion,
          ValorContrato,
          SupervisorNombre,
          ServicioContratado
        FROM dbo.MAESTRA_TERCEROS_CONTRATOS
        WHERE NIT = @nit
        ORDER BY FechaInicio DESC
      `);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/contratos/:nit:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST: GUARDAR CLASIFICACIÓN (MAIN ENDPOINT)
// ═══════════════════════════════════════════════════════════════

app.post('/api/clasificacion', async (req, res) => {
  const tx = new sql.Transaction(pool);

  try {
    const { tercero, evaluaciones } = req.body;

    if (!tercero || !tercero.NIT) {
      return res.status(400).json({ ok: false, error: 'NIT requerido' });
    }

    const {
      NIT,
      NombreTercero,
      ServicioContratado,
      SupervisorNombre,
      PromedioCriticidad,
      Zona_Riesgo,
      Periodicidad,
      UsuarioRegistro,
    } = tercero;

    await tx.begin();

    // 1️⃣ OBTENER RelacionGeneral (para evitar NULL)
    let idRelGen = 1;
    try {
      const rgResult = await tx
        .request()
        .query(`
          SELECT TOP 1 ID_General FROM dbo.RELACION_GENERAL
          WHERE Activo = 1 ORDER BY ID_General
        `);
      if (rgResult.recordset.length > 0) {
        idRelGen = rgResult.recordset[0].ID_General;
      }
    } catch (e) {
      console.log('⚠️ RelacionGeneral default: 1');
    }

    // 2️⃣ VERIFICAR SI TERCERO EXISTE
    const existsResult = await tx
      .request()
      .input('nit', sql.VarChar, NIT)
      .query(`
        SELECT ID_RelacionTerceros FROM dbo.Relacion_Terceros WHERE NIT = @nit
      `);

    let idRelacionTerceros;

    if (existsResult.recordset.length > 0) {
      // UPDATE
      idRelacionTerceros = existsResult.recordset[0].ID_RelacionTerceros;
      await tx
        .request()
        .input('id', sql.Int, idRelacionTerceros)
        .input('nombre', sql.VarChar(255), NombreTercero || '')
        .input('servicio', sql.VarChar(255), ServicioContratado || '')
        .input('supervisor', sql.VarChar(255), SupervisorNombre || '')
        .input('promedio', sql.Decimal(5, 2), PromedioCriticidad || 0)
        .input('zona', sql.VarChar(50), Zona_Riesgo || 'BAJO')
        .input('periodicidad', sql.VarChar(50), Periodicidad || 'Anual')
        .query(`
          UPDATE dbo.Relacion_Terceros
          SET 
            NombreTercero = @nombre,
            ServicioContratado = @servicio,
            SupervisorNombre = @supervisor,
            PromedioCriticidad = @promedio,
            Zona_Riesgo = @zona,
            Periodicidad = @periodicidad
          WHERE ID_RelacionTerceros = @id
        `);
    } else {
      // INSERT
      const insertResult = await tx
        .request()
        .input('nit', sql.VarChar, NIT)
        .input('nombre', sql.VarChar(255), NombreTercero || '')
        .input('servicio', sql.VarChar(255), ServicioContratado || '')
        .input('supervisor', sql.VarChar(255), SupervisorNombre || '')
        .input('promedio', sql.Decimal(5, 2), PromedioCriticidad || 0)
        .input('zona', sql.VarChar(50), Zona_Riesgo || 'BAJO')
        .input('periodicidad', sql.VarChar(50), Periodicidad || 'Anual')
        .input('relacion_general', sql.Int, idRelGen)
        .query(`
          INSERT INTO dbo.Relacion_Terceros
          (NIT, NombreTercero, ServicioContratado, SupervisorNombre, 
           PromedioCriticidad, Zona_Riesgo, Periodicidad, RelacionGeneral, 
           FechaRegistro, Activo)
          VALUES
          (@nit, @nombre, @servicio, @supervisor, @promedio, @zona, 
           @periodicidad, @relacion_general, GETDATE(), 1);
          SELECT SCOPE_IDENTITY() as ID_RelacionTerceros;
        `);
      idRelacionTerceros =
        insertResult.recordset[0]?.ID_RelacionTerceros || 0;
    }

    // 3️⃣ GUARDAR EVALUACIONES
    if (evaluaciones && Array.isArray(evaluaciones) && evaluaciones.length > 0) {
      for (const ev of evaluaciones) {
        const dominio = ev.DominioID || 1;
        const valoracion = ev.Valoracion || 'N/A';
        const zona = ev.Zona_Riesgo || 'BAJO';
        const periodicidad = ev.Periodicidad || 'Anual';

        // Verificar si existe
        const evalExists = await tx
          .request()
          .input('nit', sql.VarChar, NIT)
          .input('dominio', sql.Int, dominio)
          .query(`
            SELECT NIT FROM dbo.Matriz_Riesgos_Resultados
            WHERE NIT = @nit AND DominioID = @dominio
          `);

        if (evalExists.recordset.length > 0) {
          // UPDATE
          await tx
            .request()
            .input('nit', sql.VarChar, NIT)
            .input('dominio', sql.Int, dominio)
            .input('valoracion', sql.VarChar(10), valoracion)
            .input('zona', sql.VarChar(50), zona)
            .input('periodicidad', sql.VarChar(50), periodicidad)
            .query(`
              UPDATE dbo.Matriz_Riesgos_Resultados
              SET 
                Valoracion = @valoracion,
                Zona_Riesgo = @zona,
                Periodicidad = @periodicidad,
                FechaEvaluacion = GETDATE()
              WHERE NIT = @nit AND DominioID = @dominio
            `);
        } else {
          // INSERT
          await tx
            .request()
            .input('nit', sql.VarChar, NIT)
            .input('dominio', sql.Int, dominio)
            .input('valoracion', sql.VarChar(10), valoracion)
            .input('zona', sql.VarChar(50), zona)
            .input('periodicidad', sql.VarChar(50), periodicidad)
            .query(`
              INSERT INTO dbo.Matriz_Riesgos_Resultados
              (NIT, DominioID, Valoracion, Zona_Riesgo, Periodicidad, 
               FechaEvaluacion, Activo)
              VALUES
              (@nit, @dominio, @valoracion, @zona, @periodicidad, 
               GETDATE(), 1)
            `);
        }
      }
    }

    // 4️⃣ REGISTRAR EN LOG
    try {
      await tx
        .request()
        .input('tabla', sql.VarChar, 'Relacion_Terceros')
        .input('operacion', sql.VarChar, 'CLASIFICACION')
        .input('usuario', sql.VarChar, UsuarioRegistro || 'app')
        .input('detalles', sql.VarChar(sql.MAX), JSON.stringify(tercero))
        .query(`
          INSERT INTO dbo.Log_Cambios
          (NombreTabla, Operacion, Usuario, FechaHora, Detalles)
          VALUES
          (@tabla, @operacion, @usuario, GETDATE(), @detalles)
        `);
    } catch (eLog) {
      console.log('⚠️ Log error (no crítico):', eLog.message);
    }

    // COMMIT
    await tx.commit();

    res.json({
      ok: true,
      message: 'Clasificación guardada en Azure SQL ✅',
      id_relacion: idRelacionTerceros,
    });
  } catch (err) {
    console.error('❌ POST /api/clasificacion ERROR:', err.message);
    try {
      await tx.rollback();
    } catch (eRb) {
      console.log('Rollback error:', eRb.message);
    }
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SGRT v9 Server Running',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ═══════════════════════════════════════════════════════════════

async function start() {
  try {
    const connected = await connectDB();

    if (!connected) {
      console.error('❌ No se pudo conectar a la BD. Reintentar...');
      setTimeout(start, 5000);
      return;
    }

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║   SGRT v9 SERVER — PUERTO ${PORT}                              ║
╠═══════════════════════════════════════════════════════════╣
║ ✅ Azure SQL Conectada                                   ║
║ 📍 Base de Datos: PruebaAplicacion                       ║
║                                                           ║
║ Endpoints:                                               ║
║   GET  /                    (Health Check)               ║
║   GET  /test-db             (Test BD)                    ║
║   GET  /api/terceros        (Obtener terceros)          ║
║   GET  /api/contratos/:nit  (Contratos)                 ║
║   POST /api/clasificacion   (Guardar clasificación)     ║
║                                                           ║
║ 🎯 Listo para recibir datos desde SGRT v9               ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ ERROR AL INICIAR:', err.message);
    process.exit(1);
  }
}

// Iniciar el servidor
start();

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});
