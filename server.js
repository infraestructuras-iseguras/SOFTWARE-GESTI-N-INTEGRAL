const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN AZURE SQL - SUPER SIMPLE
// ═══════════════════════════════════════════════════════════════

const config = {
  user: 'infraes',
  password: 'Infraestructuras2024!',
  server: 'azure-iseguras.database.windows.net',
  database: 'PruebaAplicacion',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000,
    requestTimeout: 30000,
  }
};

let pool;

async function connect() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ CONECTADO A AZURE SQL');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// RUTAS
// ═══════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'SGRT v9 Server Running' });
});

app.get('/test-db', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ ok: false, error: 'Pool not connected' });
    }
    const result = await pool.request()
      .query('SELECT 1 as ok, GETDATE() as hora, DB_NAME() as db');
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/terceros', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`SELECT TOP 100 NIT, NombreTercero, ServicioContratado, SupervisorNombre, PromedioCriticidad, Zona_Riesgo 
              FROM dbo.Relacion_Terceros WHERE Activo = 1 ORDER BY NIT DESC`);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/contratos/:nit', async (req, res) => {
  try {
    const result = await pool.request()
      .input('nit', sql.VarChar, req.params.nit)
      .query(`SELECT TOP 50 NoContrato, Nombre, FechaInicio, FechaTerminacion, ValorContrato 
              FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE NIT = @nit ORDER BY FechaInicio DESC`);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/clasificacion', async (req, res) => {
  const { tercero, evaluaciones } = req.body;

  if (!tercero || !tercero.NIT) {
    return res.status(400).json({ ok: false, error: 'NIT requerido' });
  }

  try {
    const {
      NIT, NombreTercero, ServicioContratado, SupervisorNombre,
      PromedioCriticidad, Zona_Riesgo, Periodicidad, UsuarioRegistro
    } = tercero;

    // 1. Obtener RelacionGeneral
    let idRelGen = 1;
    try {
      const rg = await pool.request()
        .query(`SELECT TOP 1 ID_General FROM dbo.RELACION_GENERAL WHERE Activo = 1`);
      if (rg.recordset.length > 0) idRelGen = rg.recordset[0].ID_General;
    } catch (e) {}

    // 2. Verificar si tercero existe
    const exists = await pool.request()
      .input('nit', sql.VarChar, NIT)
      .query(`SELECT ID_RelacionTerceros FROM dbo.Relacion_Terceros WHERE NIT = @nit`);

    if (exists.recordset.length > 0) {
      // UPDATE
      await pool.request()
        .input('nit', sql.VarChar, NIT)
        .input('nombre', sql.VarChar(255), NombreTercero || '')
        .input('servicio', sql.VarChar(255), ServicioContratado || '')
        .input('supervisor', sql.VarChar(255), SupervisorNombre || '')
        .input('prom', sql.Decimal(5, 2), PromedioCriticidad || 0)
        .input('zona', sql.VarChar(50), Zona_Riesgo || 'BAJO')
        .input('per', sql.VarChar(50), Periodicidad || 'Anual')
        .query(`UPDATE dbo.Relacion_Terceros
                SET NombreTercero = @nombre, ServicioContratado = @servicio,
                    SupervisorNombre = @supervisor, PromedioCriticidad = @prom,
                    Zona_Riesgo = @zona, Periodicidad = @per
                WHERE NIT = @nit`);
    } else {
      // INSERT
      await pool.request()
        .input('nit', sql.VarChar, NIT)
        .input('nombre', sql.VarChar(255), NombreTercero || '')
        .input('servicio', sql.VarChar(255), ServicioContratado || '')
        .input('supervisor', sql.VarChar(255), SupervisorNombre || '')
        .input('prom', sql.Decimal(5, 2), PromedioCriticidad || 0)
        .input('zona', sql.VarChar(50), Zona_Riesgo || 'BAJO')
        .input('per', sql.VarChar(50), Periodicidad || 'Anual')
        .input('relgen', sql.Int, idRelGen)
        .query(`INSERT INTO dbo.Relacion_Terceros
                (NIT, NombreTercero, ServicioContratado, SupervisorNombre,
                 PromedioCriticidad, Zona_Riesgo, Periodicidad, RelacionGeneral,
                 FechaRegistro, Activo)
                VALUES (@nit, @nombre, @servicio, @supervisor, @prom, @zona, @per,
                        @relgen, GETDATE(), 1)`);
    }

    // 3. Guardar evaluaciones
    if (evaluaciones && Array.isArray(evaluaciones)) {
      for (const ev of evaluaciones) {
        const evalExists = await pool.request()
          .input('nit', sql.VarChar, NIT)
          .input('dom', sql.Int, ev.DominioID || 1)
          .query(`SELECT NIT FROM dbo.Matriz_Riesgos_Resultados WHERE NIT = @nit AND DominioID = @dom`);

        if (evalExists.recordset.length > 0) {
          await pool.request()
            .input('nit', sql.VarChar, NIT)
            .input('dom', sql.Int, ev.DominioID || 1)
            .input('val', sql.VarChar(10), ev.Valoracion || 'N/A')
            .input('zona', sql.VarChar(50), ev.Zona_Riesgo || 'BAJO')
            .input('per', sql.VarChar(50), ev.Periodicidad || 'Anual')
            .query(`UPDATE dbo.Matriz_Riesgos_Resultados
                    SET Valoracion = @val, Zona_Riesgo = @zona, Periodicidad = @per, FechaEvaluacion = GETDATE()
                    WHERE NIT = @nit AND DominioID = @dom`);
        } else {
          await pool.request()
            .input('nit', sql.VarChar, NIT)
            .input('dom', sql.Int, ev.DominioID || 1)
            .input('val', sql.VarChar(10), ev.Valoracion || 'N/A')
            .input('zona', sql.VarChar(50), ev.Zona_Riesgo || 'BAJO')
            .input('per', sql.VarChar(50), ev.Periodicidad || 'Anual')
            .query(`INSERT INTO dbo.Matriz_Riesgos_Resultados
                    (NIT, DominioID, Valoracion, Zona_Riesgo, Periodicidad, FechaEvaluacion, Activo)
                    VALUES (@nit, @dom, @val, @zona, @per, GETDATE(), 1)`);
        }
      }
    }

    res.json({ ok: true, message: 'Clasificación guardada en Azure SQL ✅' });
  } catch (err) {
    console.error('❌ ERROR POST:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// INICIAR
// ═══════════════════════════════════════════════════════════════

async function start() {
  const connected = await connect();
  if (!connected) {
    console.error('❌ No se pudo conectar. Reintentar en 5s...');
    setTimeout(start, 5000);
    return;
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  SGRT v9 SERVER — PUERTO ${PORT}        ║
║  ✅ Azure SQL Conectada               ║
║  🎯 Listo para SGRT                   ║
╚════════════════════════════════════════╝
    `);
  });
}

start();

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught:', err.message);
  process.exit(1);
});
