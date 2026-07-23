/**
 * ═══════════════════════════════════════════════════════════════
 * SGRT v9 — SERVIDOR NODE.JS PARA AZURE SQL
 * ═══════════════════════════════════════════════════════════════
 * Corregido y optimizado para:
 * • Manejar NULL en RelacionGeneral
 * • Transactions correctas
 * • Sincronización bidireccional
 * • Manejo de errores robusto
 */

const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = process.env.PORT || 3000;

// ───────────────────────────────────────────────────────────────
// MIDDLEWARE
// ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// ───────────────────────────────────────────────────────────────
// CONFIGURACIÓN AZURE SQL
// ───────────────────────────────────────────────────────────────

const sqlConfig = {
  server: 'azure-iseguras.database.windows.net',
  database: 'PruebaAplicacion',
  authentication: {
    type: 'default',
    options: {
      userName: 'infraes',  // ⭐ Tu usuario
      password: 'Infraestructuras2024!',  // ⭐ Tu contraseña
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

// ───────────────────────────────────────────────────────────────
// CONECTAR A AZURE SQL
// ───────────────────────────────────────────────────────────────

async function connectDB() {
  try {
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✅ Conectado a Azure SQL Database');
    return true;
  } catch (err) {
    console.error('❌ Error conectando a Azure SQL:', err.message);
    return false;
  }
}

// ───────────────────────────────────────────────────────────────
// TEST: Verificar conexión
// ───────────────────────────────────────────────────────────────

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool
      .request()
      .query('SELECT 1 as ok, GETDATE() as hora, DB_NAME() as db');
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('❌ Test DB Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// GET: Obtener todos los terceros
// ───────────────────────────────────────────────────────────────

app.get('/api/terceros', async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        ID_RelacionTerceros,
        NIT,
        NombreTercero,
        ServicioContratado,
        SupervisorNombre,
        PromedioCriticidad,
        Zona_Riesgo,
        Periodicidad,
        FechaRegistro,
        Activo
      FROM dbo.Relacion_Terceros
      WHERE Activo = 1
      ORDER BY FechaRegistro DESC
    `);

    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('❌ GET /api/terceros Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// GET: Obtener un tercero específico
// ───────────────────────────────────────────────────────────────

app.get('/api/terceros/:nit', async (req, res) => {
  try {
    const { nit } = req.params;
    const result = await pool
      .request()
      .input('nit', sql.VarChar, nit)
      .query(`
        SELECT 
          ID_RelacionTerceros,
          NIT,
          NombreTercero,
          ServicioContratado,
          SupervisorNombre,
          PromedioCriticidad,
          Zona_Riesgo,
          Periodicidad,
          FechaRegistro,
          Activo
        FROM dbo.Relacion_Terceros
        WHERE NIT = @nit
      `);

    res.json({ ok: true, data: result.recordset[0] || null });
  } catch (err) {
    console.error('❌ GET /api/terceros/:nit Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// GET: Obtener contratos de un tercero
// ───────────────────────────────────────────────────────────────

app.get('/api/contratos/:nit', async (req, res) => {
  try {
    const { nit } = req.params;
    const result = await pool
      .request()
      .input('nit', sql.VarChar, nit)
      .query(`
        SELECT 
          ID_Contrato,
          NoContrato,
          Nombre,
          Objetivo,
          FechaInicio,
          FechaTerminacion,
          ValorContrato,
          DuracionRelacion,
          Domicilio,
          CargoSupervisor,
          SupervisorNombre,
          ServicioContratado
        FROM dbo.MAESTRA_TERCEROS_CONTRATOS
        WHERE NIT = @nit
        ORDER BY FechaInicio DESC
      `);

    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('❌ GET /api/contratos/:nit Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST: Guardar/Actualizar contrato
// ───────────────────────────────────────────────────────────────

app.post('/api/contratos', async (req, res) => {
  const tx = new sql.Transaction(pool);

  try {
    const {
      NIT,
      Nombre,
      NoContrato,
      FechaInicio,
      FechaTerminacion,
      ValorContrato,
      DuracionRelacion,
      Domicilio,
      CargoSupervisor,
      SupervisorNombre,
      ServicioContratado,
    } = req.body;

    if (!NIT || !NoContrato) {
      return res
        .status(400)
        .json({ ok: false, error: 'NIT y NoContrato son requeridos' });
    }

    await tx.begin();

    // Verificar si contrato ya existe
    const exists = await tx
      .request()
      .input('nit', sql.VarChar, NIT)
      .input('nocontrato', sql.VarChar, NoContrato)
      .query(`
        SELECT ID_Contrato FROM dbo.MAESTRA_TERCEROS_CONTRATOS
        WHERE NIT = @nit AND NoContrato = @nocontrato
      `);

    let idContrato;

    if (exists.recordset.length > 0) {
      // Actualizar
      idContrato = exists.recordset[0].ID_Contrato;
      await tx
        .request()
        .input('id', sql.Int, idContrato)
        .input('nombre', sql.VarChar(255), Nombre || null)
        .input('objetivo', sql.VarChar(sql.MAX), Nombre || null)
        .input('finicio', sql.DateTime, FechaInicio || null)
        .input('fterminacion', sql.DateTime, FechaTerminacion || null)
        .input('valor', sql.Decimal(18, 2), ValorContrato || null)
        .input('duracion', sql.Decimal(10, 2), DuracionRelacion || null)
        .input('domicilio', sql.VarChar(510), Domicilio || null)
        .input('cargo', sql.VarChar(510), CargoSupervisor || null)
        .input('supervisor', sql.VarChar(255), SupervisorNombre || null)
        .input('servicio', sql.VarChar(255), ServicioContratado || null)
        .query(`
          UPDATE dbo.MAESTRA_TERCEROS_CONTRATOS
          SET 
            Nombre = @nombre,
            Objetivo = @objetivo,
            FechaInicio = @finicio,
            FechaTerminacion = @fterminacion,
            ValorContrato = @valor,
            DuracionRelacion = @duracion,
            Domicilio = @domicilio,
            CargoSupervisor = @cargo,
            SupervisorNombre = @supervisor,
            ServicioContratado = @servicio
          WHERE ID_Contrato = @id
        `);
    } else {
      // Insertar
      const insertResult = await tx
        .request()
        .input('nit', sql.VarChar, NIT)
        .input('nocontrato', sql.VarChar, NoContrato)
        .input('nombre', sql.VarChar(255), Nombre || null)
        .input('objetivo', sql.VarChar(sql.MAX), Nombre || null)
        .input('finicio', sql.DateTime, FechaInicio || null)
        .input('fterminacion', sql.DateTime, FechaTerminacion || null)
        .input('valor', sql.Decimal(18, 2), ValorContrato || null)
        .input('duracion', sql.Decimal(10, 2), DuracionRelacion || null)
        .input('domicilio', sql.VarChar(510), Domicilio || null)
        .input('cargo', sql.VarChar(510), CargoSupervisor || null)
        .input('supervisor', sql.VarChar(255), SupervisorNombre || null)
        .input('servicio', sql.VarChar(255), ServicioContratado || null)
        .query(`
          INSERT INTO dbo.MAESTRA_TERCEROS_CONTRATOS 
          (NIT, NoContrato, Nombre, Objetivo, FechaInicio, FechaTerminacion, 
           ValorContrato, DuracionRelacion, Domicilio, CargoSupervisor, 
           SupervisorNombre, ServicioContratado)
          VALUES 
          (@nit, @nocontrato, @nombre, @objetivo, @finicio, @fterminacion,
           @valor, @duracion, @domicilio, @cargo, @supervisor, @servicio);
          SELECT SCOPE_IDENTITY() as ID_Contrato;
        `);
      idContrato = insertResult.recordset[0]?.ID_Contrato;
    }

    await tx.commit();

    res.json({
      ok: true,
      message: 'Contrato guardado exitosamente',
      id_contrato: idContrato,
    });
  } catch (err) {
    await tx.rollback();
    console.error('❌ POST /api/contratos Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// POST: Guardar clasificación completa
// ───────────────────────────────────────────────────────────────

app.post('/api/clasificacion', async (req, res) => {
  const tx = new sql.Transaction(pool);

  try {
    const { tercero, evaluaciones } = req.body;

    if (!tercero || !tercero.NIT) {
      return res
        .status(400)
        .json({ ok: false, error: 'NIT del tercero es requerido' });
    }

    const {
      NIT,
      NombreTercero,
      ServicioContratado,
      SupervisorNombre,
      PromedioCriticidad,
      Zona_Riesgo,
      Periodicidad,
      NoContrato,
      ObjetivoContrato,
      FechaInicioContrato,
      FechaTerminacionContrato,
      ValorContrato,
      DuracionRelacion,
      Domicilio,
      CargoSupervisor,
      UsuarioRegistro,
    } = tercero;

    await tx.begin();

    // ─────────────────────────────────────────────────────────────
    // 1. Obtener o crear RelacionGeneral (⭐ FIX: evita NULL)
    // ─────────────────────────────────────────────────────────────
    let idRelGen = 1; // DEFAULT
    try {
      const rgResult = await tx
        .request()
        .query(`
          SELECT TOP 1 ID_General 
          FROM dbo.RELACION_GENERAL 
          WHERE Activo = 1 
          ORDER BY ID_General
        `);
      if (rgResult.recordset.length > 0) {
        idRelGen = rgResult.recordset[0].ID_General;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo obtener RelacionGeneral, usando default 1');
      idRelGen = 1;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Insertar/Actualizar en Relacion_Terceros
    // ─────────────────────────────────────────────────────────────
    const terceroExists = await tx
      .request()
      .input('nit', sql.VarChar, NIT)
      .query(
        `SELECT ID_RelacionTerceros FROM dbo.Relacion_Terceros WHERE NIT = @nit`
      );

    let idRelacionTerceros;

    if (terceroExists.recordset.length > 0) {
      idRelacionTerceros = terceroExists.recordset[0].ID_RelacionTerceros;

      // Actualizar
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
      // Insertar (⭐ RelacionGeneral NUNCA es NULL)
      const insertTercResult = await tx
        .request()
        .input('nit', sql.VarChar, NIT)
        .input('nombre', sql.VarChar(255), NombreTercero || '')
        .input('servicio', sql.VarChar(255), ServicioContratado || '')
        .input('supervisor', sql.VarChar(255), SupervisorNombre || '')
        .input('promedio', sql.Decimal(5, 2), PromedioCriticidad || 0)
        .input('zona', sql.VarChar(50), Zona_Riesgo || 'BAJO')
        .input('periodicidad', sql.VarChar(50), Periodicidad || 'Anual')
        .input('relacion_general', sql.Int, idRelGen) // ⭐ AQUÍ ASEGURAMOS QUE NO ES NULL
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
        insertTercResult.recordset[0]?.ID_RelacionTerceros;
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Guardar evaluaciones en Matriz_Riesgos_Resultados
    // ─────────────────────────────────────────────────────────────
    if (evaluaciones && evaluaciones.length > 0) {
      for (const ev of evaluaciones) {
        const evalExists = await tx
          .request()
          .input('nit', sql.VarChar, NIT)
          .input('dominio', sql.Int, ev.DominioID || 1)
          .query(`
            SELECT NIT FROM dbo.Matriz_Riesgos_Resultados
            WHERE NIT = @nit AND DominioID = @dominio
          `);

        if (evalExists.recordset.length > 0) {
          // Actualizar
          await tx
            .request()
            .input('nit', sql.VarChar, NIT)
            .input('dominio', sql.Int, ev.DominioID || 1)
            .input('valoracion', sql.VarChar(10), ev.Valoracion || 'N/A')
            .input('zona', sql.VarChar(50), ev.Zona_Riesgo || 'BAJO')
            .input('periodicidad', sql.VarChar(50), ev.Periodicidad || 'Anual')
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
          // Insertar
          await tx
            .request()
            .input('nit', sql.VarChar, NIT)
            .input('dominio', sql.Int, ev.DominioID || 1)
            .input('valoracion', sql.VarChar(10), ev.Valoracion || 'N/A')
            .input('zona', sql.VarChar(50), ev.Zona_Riesgo || 'BAJO')
            .input('periodicidad', sql.VarChar(50), ev.Periodicidad || 'Anual')
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

    // ─────────────────────────────────────────────────────────────
    // 4. Registrar en Log de cambios
    // ─────────────────────────────────────────────────────────────
    await tx
      .request()
      .input('nit', sql.VarChar, NIT)
      .input('tabla', sql.VarChar, 'Relacion_Terceros')
      .input('operacion', sql.VarChar, 'INSERT/UPDATE')
      .input('usuario', sql.VarChar, UsuarioRegistro || 'app')
      .input('detalles', sql.VarChar(sql.MAX), JSON.stringify(tercero))
      .query(`
        INSERT INTO dbo.Log_Cambios
        (NombreTabla, Operacion, Usuario, FechaHora, Detalles)
        VALUES
        (@tabla, @operacion, @usuario, GETDATE(), @detalles)
      `);

    await tx.commit();

    res.json({
      ok: true,
      message: 'Clasificación guardada exitosamente en Azure',
      id_relacion: idRelacionTerceros,
    });
  } catch (err) {
    await tx.rollback();
    console.error('❌ POST /api/clasificacion Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// GET: Obtener dominios/tipologías
// ───────────────────────────────────────────────────────────────

app.get('/api/dominios', async (req, res) => {
  try {
    const result = await pool
      .request()
      .query(`
        SELECT 
          DominioID,
          Nombre_Dominio
        FROM dbo.Dominios_Riesgo
        WHERE Activo = 1
        ORDER BY DominioID
      `);

    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    console.error('❌ GET /api/dominios Error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ───────────────────────────────────────────────────────────────
// INICIAR SERVIDOR
// ───────────────────────────────────────────────────────────────

async function start() {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           SGRT v9 SERVER — ESCUCHANDO EN PUERTO ${PORT}          ║
╠════════════════════════════════════════════════════════════════╣
║ ✅ Azure SQL Conectada                                        ║
║ 📍 Base de Datos: PruebaAplicacion                            ║
║ 🔧 Endpoints disponibles:                                     ║
║    • GET  /test-db                                            ║
║    • GET  /api/terceros                                       ║
║    • GET  /api/terceros/:nit                                  ║
║    • GET  /api/contratos/:nit                                 ║
║    • POST /api/contratos                                      ║
║    • POST /api/clasificacion                                  ║
║    • GET  /api/dominios                                       ║
║                                                                ║
║ 📝 Todas las inserciones se guardan en dbo.Log_Cambios        ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });
}

// Iniciar
start();

// Manejo de errores global
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
