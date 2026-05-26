const express  = require('express');
const sql      = require('mssql');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity'); // ✅ CAMBIO 1

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.method !== 'GET') console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ CAMBIO 2: ruta raíz para que Azure no muestre "Cannot GET /"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const credential = new DefaultAzureCredential(); // ✅ CAMBIO 1
let pool;

async function conectarDB() {
  try {
    if (pool) { try { await pool.close(); } catch(e) {} }
    const token = (await credential.getToken('https://database.windows.net/.default')).token;
    const DB_SERVER   = process.env.DB_SERVER   || 'azure-iseguras.database.windows.net';
    const DB_DATABASE = process.env.DB_DATABASE || 'PruebaAplicacion';
    pool = await sql.connect({
      server: DB_SERVER, database: DB_DATABASE,
      options: { encrypt: true, trustServerCertificate: false },
      authentication: { type: 'azure-active-directory-access-token', options: { token } },
      connectionTimeout: 30000, requestTimeout: 60000
    });
    console.log('✅ Conectado a:', DB_DATABASE);
    return true;
  } catch(err) { console.error('❌ Conexión:', err.message); pool = null; return false; }
}
async function getPool() { if (!pool) await conectarDB(); return pool; }
setInterval(() => conectarDB(), 45 * 60 * 1000);
conectarDB();

async function chk(res) {
  const p = await getPool();
  if (!p) { res.status(503).json({ ok: false, error: 'Sin conexion a BD' }); return false; }
  return true;
}

// ── TEST ──────────────────────────────────────────────────────
app.get('/test-db', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().query('SELECT 1 AS ok, GETDATE() AS hora, DB_NAME() AS db');
    res.json({ ok: true, data: r.recordset });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── DIAGNÓSTICO ───────────────────────────────────────────────
app.get('/api/diagnostico', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const tables = [
      'RELACION_GENERAL','MAESTRA_GENERAL_CLIENTES','MAESTRA_GENERAL_PROCESOS','MAESTRA_GENERAL_AAAA',
      'Relacion_Terceros','MAESTRA_TERCEROS_FUNCIONARIOS','MAESTRA_TERCEROS_CONTRATOS','MAESTRA_TERCEROS',
      'Formulario_Clasificacion_Terceros','Lista_Clasificacion','Matriz_Riesgos_Resultados',
      'Maestra_Tipologia_Riesgos','Dominios_Riesgo','Preguntas_Cuestionario',
      'Terceros','Usuarios','Roles','Lista_SiNo','Log_Cambios','ConfiguracionPregunta'
    ];
    const result = {};
    for (const t of tables) {
      try {
        const r = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${t}' AND TABLE_SCHEMA='dbo' ORDER BY ORDINAL_POSITION`);
        result[t] = { cols: r.recordset.map(c => c.COLUMN_NAME+':'+c.DATA_TYPE), count: r.recordset.length };
      } catch(e) { result[t] = { error: e.message }; }
    }
    res.json({ ok: true, data: result });
  } catch(e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// CATÁLOGOS
// ═══════════════════════════════════════════════════════════════
app.get('/api/dominios',    async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT DominioID, Nombre_Dominio FROM dbo.Dominios_Riesgo ORDER BY DominioID'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/tipologias',  async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_TipologiaRiesgo, Tipologia, Descripcion, Orden, AplicaN_A, DominioID FROM dbo.Maestra_Tipologia_Riesgos WHERE Activo=1 ORDER BY Orden'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/lista-sino',  async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_SiNo, Opciones FROM dbo.Lista_SiNo ORDER BY ID_SiNo'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/roles',       async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Rol, Nombre_Rol FROM dbo.Roles ORDER BY ID_Rol'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/aaaa',        async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_AAA AS ID_AAAA, AAAA FROM dbo.MAESTRA_GENERAL_AAAA ORDER BY ID_AAA'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/opciones/:tipologia', async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().input('T',sql.Int,req.params.tipologia).query('SELECT ID_Clasificacion, Opciones, Asignacion, OpcionesRespuesta FROM dbo.Lista_Clasificacion WHERE TipologiaRiesgo=@T ORDER BY Asignacion'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });

// ═══════════════════════════════════════════════════════════════
// MAESTRAS GENERALES
// ═══════════════════════════════════════════════════════════════
app.get('/api/clientes',        async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Cliente, RazonSocial, Direccion, NombreContacto, Correo FROM dbo.MAESTRA_GENERAL_CLIENTES ORDER BY RazonSocial'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/procesos',        async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Procesos, Nombre, Descripcion, Objetivo, Tipo FROM dbo.MAESTRA_GENERAL_PROCESOS ORDER BY Nombre'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/maestra-terceros',async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Tercero, NombreContacto, RazonSocial, Correo, Direccion FROM dbo.MAESTRA_TERCEROS ORDER BY ID_Tercero DESC'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });

app.get('/api/relacion-general', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().query(`
      SELECT rg.ID_General, rg.NombreEntidad, rg.NIT_Entidad, rg.Sector, rg.Activo,
             gc.RazonSocial AS NombreCliente, gc.ID_Cliente
      FROM dbo.RELACION_GENERAL rg
      LEFT JOIN dbo.MAESTRA_GENERAL_CLIENTES gc ON rg.Cliente = gc.ID_Cliente
      ORDER BY rg.ID_General`);
    res.json({ ok:true, data:r.recordset });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// USUARIOS — Usuarios: ID_Usuario, Nombre(100), Email(100), ID_Rol(FK), Estado(10)
// ═══════════════════════════════════════════════════════════════
app.get('/api/usuarios-sistema', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().query(`SELECT u.ID_Usuario, u.Nombre, u.Email, u.Estado, r.Nombre_Rol, u.ID_Rol FROM dbo.Usuarios u LEFT JOIN dbo.Roles r ON u.ID_Rol=r.ID_Rol ORDER BY u.Nombre`);
    res.json({ ok:true, data:r.recordset });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.post('/api/usuarios-sistema', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const u = req.body;
    if (!u.Nombre||!u.Email) return res.status(400).json({ ok:false, error:'Nombre y Email requeridos' });
    const ex = (await pool.request().input('EM',sql.VarChar(100),u.Email).query('SELECT TOP 1 ID_Usuario FROM dbo.Usuarios WHERE Email=@EM')).recordset;
    if (ex.length) {
      await pool.request().input('ID',sql.Int,ex[0].ID_Usuario).input('NOM',sql.VarChar(100),u.Nombre).input('ROL',sql.Int,u.ID_Rol||1).input('EST',sql.VarChar(10),u.Estado||'Activo').query('UPDATE dbo.Usuarios SET Nombre=@NOM,ID_Rol=@ROL,Estado=@EST WHERE ID_Usuario=@ID');
      return res.json({ ok:true, message:'Usuario actualizado', id:ex[0].ID_Usuario });
    }
    const r = await pool.request().input('NOM',sql.VarChar(100),u.Nombre).input('EM',sql.VarChar(100),u.Email).input('ROL',sql.Int,u.ID_Rol||1).input('EST',sql.VarChar(10),u.Estado||'Activo').query('INSERT INTO dbo.Usuarios(Nombre,Email,ID_Rol,Estado) VALUES(@NOM,@EM,@ROL,@EST); SELECT SCOPE_IDENTITY() AS ID;');
    res.json({ ok:true, message:'Usuario creado', id:r.recordset[0]?.ID });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// MAESTRA_TERCEROS_FUNCIONARIOS
// Columnas REALES: ID_Funcionario, Nombre(100), Direccion(255),
//                 Telefono(50), Correo(100), UsuarioModificador(100),
//                 SysStart, SysEnd, VersionNumber
// ═══════════════════════════════════════════════════════════════
app.get('/api/funcionarios', async (req, res) => {
  try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Funcionario, Nombre, Direccion, Telefono, Correo FROM dbo.MAESTRA_TERCEROS_FUNCIONARIOS ORDER BY Nombre'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/api/supervisores', async (req, res) => {
  try { if (!await chk(res)) return; const r = await pool.request().query('SELECT ID_Funcionario, Nombre, Direccion, Telefono, Correo FROM dbo.MAESTRA_TERCEROS_FUNCIONARIOS ORDER BY Nombre'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.post('/api/funcionarios', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const f = req.body;
    if (!f.Nombre) return res.status(400).json({ ok:false, error:'Nombre requerido' });
    const ex = (await pool.request().input('NOM',sql.VarChar(100),f.Nombre).query('SELECT TOP 1 ID_Funcionario FROM dbo.MAESTRA_TERCEROS_FUNCIONARIOS WHERE Nombre=@NOM')).recordset;
    if (ex.length) {
      const sets=[]; const rr=pool.request().input('ID',sql.Int,ex[0].ID_Funcionario);
      if(f.Direccion){sets.push('Direccion=@DIR');rr.input('DIR',sql.VarChar(255),f.Direccion);}
      if(f.Telefono){sets.push('Telefono=@TEL');rr.input('TEL',sql.VarChar(50),f.Telefono);}
      if(f.Correo){sets.push('Correo=@COR');rr.input('COR',sql.VarChar(100),f.Correo);}
      if(sets.length) await rr.query(`UPDATE dbo.MAESTRA_TERCEROS_FUNCIONARIOS SET ${sets.join(',')} WHERE ID_Funcionario=@ID`);
      return res.json({ ok:true, message:'Funcionario actualizado', id:ex[0].ID_Funcionario });
    }
    const r3 = await pool.request().input('NOM',sql.VarChar(100),f.Nombre||'').input('DIR',sql.VarChar(255),f.Direccion||'').input('TEL',sql.VarChar(50),f.Telefono||'').input('COR',sql.VarChar(100),f.Correo||'').query('INSERT INTO dbo.MAESTRA_TERCEROS_FUNCIONARIOS(Nombre,Direccion,Telefono,Correo) VALUES(@NOM,@DIR,@TEL,@COR); SELECT SCOPE_IDENTITY() AS ID;');
    res.json({ ok:true, message:'Funcionario creado', id:r3.recordset[0]?.ID });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// TERCEROS (Relacion_Terceros)
// ═══════════════════════════════════════════════════════════════
app.get('/api/terceros', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().query(`SELECT rt.*, rg.NombreEntidad FROM dbo.Relacion_Terceros rt LEFT JOIN dbo.RELACION_GENERAL rg ON rt.RelacionGeneral=rg.ID_General ORDER BY rt.ID_RelacionTerceros DESC`);
    res.json({ ok:true, data:r.recordset });
  } catch(e) {
    try { const r2 = await pool.request().query('SELECT * FROM dbo.Relacion_Terceros ORDER BY ID_RelacionTerceros DESC'); res.json({ ok:true, data:r2.recordset }); }
    catch(e2) { res.status(500).json({ ok:false, error:e2.message }); }
  }
});
app.get('/api/terceros/:nit', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().input('NIT',sql.NVarChar(50),req.params.nit).query(`
      SELECT rt.*, rg.NombreEntidad, rg.NIT_Entidad, mrr.Puntaje_Promedio, mrr.Zona_Riesgo, mrr.Periodicidad
      FROM dbo.Relacion_Terceros rt
      LEFT JOIN dbo.RELACION_GENERAL rg ON rt.RelacionGeneral=rg.ID_General
      LEFT JOIN dbo.Matriz_Riesgos_Resultados mrr ON rt.NIT=mrr.NIT
      WHERE rt.NIT=@NIT`);
    if (!r.recordset.length) return res.status(404).json({ ok:false, error:'No encontrado' });
    res.json({ ok:true, data:r.recordset[0] });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// CONTRATOS — MAESTRA_TERCEROS_CONTRATOS
// Columnas REALES: ID_Contrato, Nombre(255), Objetivo(max), NoContrato(200),
//   FechaInicio(date), FechaTerminacion(date), ValorContrato(18,2),
//   DuracionRelacion(10,2), Domicilio(510), CargoSupervisor(510),
//   SupervisorNombre(510), ServicioContratado(510), NIT(100), ID_RelacionTerceros(int)
// ═══════════════════════════════════════════════════════════════
app.get('/api/contratos',      async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().query('SELECT * FROM dbo.MAESTRA_TERCEROS_CONTRATOS ORDER BY ID_Contrato DESC'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.get('/api/contratos/:nit', async (req, res) => { try { if (!await chk(res)) return; const r = await pool.request().input('NIT',sql.NVarChar(100),req.params.nit).query('SELECT * FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE NIT=@NIT'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });
app.post('/api/contratos', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const c = req.body;
    if (!c.NIT) return res.status(400).json({ ok:false, error:'NIT requerido' });
    const ex = (await pool.request().input('NIT',sql.NVarChar(100),c.NIT).query('SELECT TOP 1 ID_Contrato FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE NIT=@NIT')).recordset;
    const q = pool.request()
      .input('NIT',sql.NVarChar(100),c.NIT).input('NOM',sql.VarChar(255),c.Nombre||'').input('OBJ',sql.VarChar(sql.MAX),c.Objetivo||'').input('CTR',sql.NVarChar(200),c.NoContrato||'')
      .input('FI',sql.Date,c.FechaInicio||null).input('FF',sql.Date,c.FechaTerminacion||null).input('VAL',sql.Decimal(18,2),c.ValorContrato||null).input('DUR',sql.Decimal(10,2),c.DuracionRelacion||null)
      .input('DOM',sql.NVarChar(510),c.Domicilio||'').input('CARG',sql.NVarChar(510),c.CargoSupervisor||'').input('SUP',sql.NVarChar(510),c.SupervisorNombre||'').input('SVC',sql.NVarChar(510),c.ServicioContratado||'').input('IDRT',sql.Int,c.ID_RelacionTerceros||null);
    if (ex.length) {
      await q.query('UPDATE dbo.MAESTRA_TERCEROS_CONTRATOS SET Nombre=@NOM,Objetivo=@OBJ,NoContrato=@CTR,FechaInicio=@FI,FechaTerminacion=@FF,ValorContrato=@VAL,DuracionRelacion=@DUR,Domicilio=@DOM,CargoSupervisor=@CARG,SupervisorNombre=@SUP,ServicioContratado=@SVC,ID_RelacionTerceros=@IDRT WHERE NIT=@NIT');
      res.json({ ok:true, message:'Contrato actualizado', nit:c.NIT });
    } else {
      const r2 = await q.query('INSERT INTO dbo.MAESTRA_TERCEROS_CONTRATOS(Nombre,Objetivo,NoContrato,NIT,FechaInicio,FechaTerminacion,ValorContrato,DuracionRelacion,Domicilio,CargoSupervisor,SupervisorNombre,ServicioContratado,ID_RelacionTerceros) VALUES(@NOM,@OBJ,@CTR,@NIT,@FI,@FF,@VAL,@DUR,@DOM,@CARG,@SUP,@SVC,@IDRT); SELECT SCOPE_IDENTITY() AS ID_Contrato;');
      res.json({ ok:true, message:'Contrato creado', nit:c.NIT, id_contrato:r2.recordset[0]?.ID_Contrato });
    }
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.delete('/api/contratos/:nit', async (req, res) => { try { if (!await chk(res)) return; await pool.request().input('NIT',sql.NVarChar(100),req.params.nit).query('DELETE FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE NIT=@NIT'); res.json({ ok:true }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); } });

// ═══════════════════════════════════════════════════════════════
// CLASIFICACIÓN COMPLETA — guarda en 6 tablas
// ═══════════════════════════════════════════════════════════════
const recentRequests = new Map();

// Mapeo key tipología → columna en Relacion_Terceros (columnas REALES confirmadas)
const KEY_COL = {
  op:   'ProcesosOperativo',
  cn:   'ImportanciaContinuidad',
  si:   'AccesoInformacion',
  cu:   'RegulacionCumplimiento',
  fr:   'FraudeCorrupcion',
  laft: 'LAFT',
};

app.post('/api/clasificacion', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { tercero, evaluaciones } = req.body;
    console.log('\n====== POST /api/clasificacion ======');
    console.log('NIT:', tercero?.NIT, '| Nombre:', tercero?.NombreTercero);

    if (!tercero?.NIT)         return res.status(400).json({ ok:false, error:'tercero.NIT requerido' });
    if (!evaluaciones?.length) return res.status(400).json({ ok:false, error:'evaluaciones[] vacio' });

    const now = Date.now();
    const last = recentRequests.get(tercero.NIT);
    if (last && (now-last)<5000) return res.json({ ok:true, message:'Ya procesado', duplicate:true });
    recentRequests.set(tercero.NIT, now);
    setTimeout(()=>recentRequests.delete(tercero.NIT), 10000);

    const tx = new sql.Transaction(pool);
    await tx.begin();
    const tablas = [];

    try {
      // ── 0. RELACION_GENERAL → idRelGen ──────────────────────
      let idRelGen = null;
      try {
        if (tercero.NombreEntidad) {
          const rg = await new sql.Request(tx).input('ENT',sql.NVarChar(255),'%'+tercero.NombreEntidad+'%').query('SELECT TOP 1 ID_General FROM dbo.RELACION_GENERAL WHERE NombreEntidad LIKE @ENT AND Activo=1');
          if (rg.recordset.length) idRelGen = rg.recordset[0].ID_General;
        }
        if (!idRelGen) {
          const rgF = await new sql.Request(tx).query('SELECT TOP 1 ID_General FROM dbo.RELACION_GENERAL WHERE Activo=1 ORDER BY ID_General');
          if (rgF.recordset.length) idRelGen = rgF.recordset[0].ID_General;
        }
        console.log('  idRelGen:', idRelGen);
      } catch(e) { console.warn('  RELACION_GENERAL skip:', e.message); }

      // ── 1. MAESTRA_TERCEROS_FUNCIONARIOS ────────────────────
      let idFuncionario = null;
      if (tercero.SupervisorNombre) {
        try {
          const fEx = (await new sql.Request(tx).input('NOM',sql.VarChar(100),tercero.SupervisorNombre).query('SELECT TOP 1 ID_Funcionario FROM dbo.MAESTRA_TERCEROS_FUNCIONARIOS WHERE Nombre=@NOM')).recordset;
          if (fEx.length) {
            idFuncionario = fEx[0].ID_Funcionario;
          } else {
            const fIns = await new sql.Request(tx).input('NOM',sql.VarChar(100),tercero.SupervisorNombre).input('DIR',sql.VarChar(255),'').input('TEL',sql.VarChar(50),'').input('COR',sql.VarChar(100),'').query('INSERT INTO dbo.MAESTRA_TERCEROS_FUNCIONARIOS(Nombre,Direccion,Telefono,Correo) VALUES(@NOM,@DIR,@TEL,@COR); SELECT SCOPE_IDENTITY() AS ID;');
            idFuncionario = fIns.recordset[0]?.ID;
            tablas.push('MAESTRA_TERCEROS_FUNCIONARIOS');
          }
          console.log('  Funcionario ID:', idFuncionario);
        } catch(e) { console.warn('  Funcionario skip:', e.message); }
      }

      // ── 2. Relacion_Terceros ─────────────────────────────────
      // Columnas REALES: ID_RelacionTerceros(PK), RelacionGeneral(FK), Funcionario(FK),
      // Contrato(FK), Tercero(FK), NIT, NombreTercero, ServicioContratado, NoContrato,
      // ObjetivoContrato, FechaInicioContrato, FechaTerminacionContrato, ValorContrato,
      // DuracionRelacion(5,1), Domicilio, CargoSupervisor, SupervisorNombre,
      // ProcesosOperativo, ImportanciaContinuidad, AccesoInformacion,
      // RegulacionCumplimiento, FraudeCorrupcion, LAFT,
      // PromedioCriticidad(5,2), EvaluacionAmbienteControl,
      // FechaRegistro(datetime NoNULL), Activo(bit NoNULL)

      // Construir map de valores por tipología key
      const evalByKey = {};
      for (const ev of evaluaciones) {
        const k = (ev.tipKey||'').toLowerCase();
        if (k) evalByKey[k] = ev.Valoracion;
      }

      const existeRT = (await new sql.Request(tx).input('NIT',sql.NVarChar(50),tercero.NIT).query('SELECT ID_RelacionTerceros FROM dbo.Relacion_Terceros WHERE NIT=@NIT')).recordset;
      let idRT;

      // Helper para agregar campo dinámico
      const mkDyn = () => { const sets=[]; let i=0; const req2=new sql.Request(tx); return { req:req2, sets, add(col,typ,val){ if(val!==null&&val!==undefined&&val!==''){sets.push(`${col}=@D${i}`);req2.input(`D${i}`,typ,val);i++;} } }; };

      if (existeRT.length > 0) {
        idRT = existeRT[0].ID_RelacionTerceros;
        const d = mkDyn();
        d.req.input('NIT', sql.NVarChar(50), tercero.NIT);
        d.add('NombreTercero',          sql.NVarChar(255),     tercero.NombreTercero||'');
        d.add('ServicioContratado',     sql.NVarChar(255),     tercero.ServicioContratado||'');
        d.add('NoContrato',             sql.NVarChar(100),     tercero.NoContrato||null);
        d.add('ObjetivoContrato',       sql.NVarChar(sql.MAX), tercero.ObjetivoContrato||null);
        d.add('FechaInicioContrato',    sql.Date,              tercero.FechaInicioContrato||null);
        d.add('FechaTerminacionContrato',sql.Date,             tercero.FechaTerminacionContrato||null);
        d.add('ValorContrato',          sql.Decimal(18,2),     tercero.ValorContrato||null);
        d.add('DuracionRelacion',       sql.Decimal(5,1),      tercero.DuracionRelacion||null);
        d.add('Domicilio',              sql.NVarChar(255),     tercero.Domicilio||null);
        d.add('CargoSupervisor',        sql.NVarChar(255),     tercero.CargoSupervisor||null);
        d.add('SupervisorNombre',       sql.NVarChar(255),     tercero.SupervisorNombre||null);
        d.add('PromedioCriticidad',     sql.Decimal(5,2),      tercero.PromedioCriticidad||null);
        for (const [key,col] of Object.entries(KEY_COL)) { if(evalByKey[key]!==undefined) d.add(col,sql.NVarChar(sql.MAX),String(evalByKey[key])); }
        if (idFuncionario) d.add('Funcionario', sql.Int, idFuncionario);
        if (d.sets.length) await d.req.query(`UPDATE dbo.Relacion_Terceros SET ${d.sets.join(',')} WHERE NIT=@NIT`);
        tablas.push('Relacion_Terceros (upd)');
        console.log('  UPDATE RT ID:', idRT);

      } else {
        const d = mkDyn();
        const iC=['NIT','NombreTercero','ServicioContratado','FechaRegistro','Activo'];
        const iV=['@NIT','@NOM','@SVC','GETDATE()','1'];
        d.req.input('NIT',sql.NVarChar(50),tercero.NIT).input('NOM',sql.NVarChar(255),tercero.NombreTercero||'').input('SVC',sql.NVarChar(255),tercero.ServicioContratado||'');
        // redefinir add para INSERT
        let ii=0;
        const iAdd=(col,typ,val)=>{ if(val!==null&&val!==undefined&&val!==''){iC.push(col);iV.push(`@I${ii}`);d.req.input(`I${ii}`,typ,val);ii++;} };
        iAdd('NoContrato',               sql.NVarChar(100),     tercero.NoContrato||null);
        iAdd('ObjetivoContrato',         sql.NVarChar(sql.MAX), tercero.ObjetivoContrato||null);
        iAdd('FechaInicioContrato',      sql.Date,              tercero.FechaInicioContrato||null);
        iAdd('FechaTerminacionContrato', sql.Date,              tercero.FechaTerminacionContrato||null);
        iAdd('ValorContrato',            sql.Decimal(18,2),     tercero.ValorContrato||null);
        iAdd('DuracionRelacion',         sql.Decimal(5,1),      tercero.DuracionRelacion||null);
        iAdd('Domicilio',                sql.NVarChar(255),     tercero.Domicilio||null);
        iAdd('CargoSupervisor',          sql.NVarChar(255),     tercero.CargoSupervisor||null);
        iAdd('SupervisorNombre',         sql.NVarChar(255),     tercero.SupervisorNombre||null);
        iAdd('PromedioCriticidad',       sql.Decimal(5,2),      tercero.PromedioCriticidad||null);
        for (const [key,col] of Object.entries(KEY_COL)) { if(evalByKey[key]!==undefined) iAdd(col,sql.NVarChar(sql.MAX),String(evalByKey[key])); }
        if (idRelGen)      iAdd('RelacionGeneral', sql.Int, idRelGen);
        if (idFuncionario) iAdd('Funcionario',     sql.Int, idFuncionario);
        await d.req.query(`INSERT INTO dbo.Relacion_Terceros(${iC.join(',')}) VALUES(${iV.join(',')})`);
        const nRT = await new sql.Request(tx).input('NIT',sql.NVarChar(50),tercero.NIT).query('SELECT TOP 1 ID_RelacionTerceros FROM dbo.Relacion_Terceros WHERE NIT=@NIT ORDER BY ID_RelacionTerceros DESC');
        idRT = nRT.recordset[0]?.ID_RelacionTerceros;
        tablas.push('Relacion_Terceros');
        console.log('  INSERT RT ID:', idRT, 'cols:', iC.join(', '));
      }

      // ── 3. dbo.Terceros — FK requerida por Matriz_Riesgos_Resultados ──
      // Columnas: NIT(PK), Nombre_Tercero, Servicio_Contratado, Domicilio, Fecha_Registro
      try {
        const exT = (await new sql.Request(tx).input('NIT',sql.NVarChar(50),tercero.NIT).query('SELECT TOP 1 NIT FROM dbo.Terceros WHERE NIT=@NIT')).recordset;
        if (!exT.length) {
          await new sql.Request(tx)
            .input('NIT',sql.NVarChar(50), tercero.NIT)
            .input('NOM',sql.NVarChar(255),tercero.NombreTercero      || '')
            .input('SVC',sql.NVarChar(255),tercero.ServicioContratado || '')
            .input('DOM',sql.NVarChar(255),tercero.Domicilio          || '')
            .query('INSERT INTO dbo.Terceros(NIT,Nombre_Tercero,Servicio_Contratado,Domicilio,Fecha_Registro) VALUES(@NIT,@NOM,@SVC,@DOM,GETDATE())');
          tablas.push('Terceros');
          console.log('  INSERT Terceros OK');
        }
      } catch(te) { console.warn('  Terceros skip:', te.message); }

      // ── 4. MAESTRA_TERCEROS_CONTRATOS ────────────────────────
      // NOTA: ID_Contrato NO es IDENTITY — se genera con MAX(ID_Contrato)+1
      try {
        const exC = (await new sql.Request(tx).input('NIT',sql.NVarChar(100),tercero.NIT).query('SELECT TOP 1 ID_Contrato FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE NIT=@NIT')).recordset;
        const cq = new sql.Request(tx)
          .input('NIT',sql.NVarChar(100),tercero.NIT).input('NOM',sql.VarChar(255),tercero.NombreTercero||'').input('OBJ',sql.VarChar(sql.MAX),tercero.ObjetivoContrato||'')
          .input('CTR',sql.NVarChar(200),tercero.NoContrato||'').input('FI',sql.Date,tercero.FechaInicioContrato||null).input('FF',sql.Date,tercero.FechaTerminacionContrato||null)
          .input('VAL',sql.Decimal(18,2),tercero.ValorContrato||null).input('DUR',sql.Decimal(10,2),tercero.DuracionRelacion||null)
          .input('DOM',sql.NVarChar(510),tercero.Domicilio||'').input('CARG',sql.NVarChar(510),tercero.CargoSupervisor||'').input('SUP',sql.NVarChar(510),tercero.SupervisorNombre||'')
          .input('SVC',sql.NVarChar(510),tercero.ServicioContratado||'').input('IDRT',sql.Int,idRT||null);
        if (exC.length) {
          await cq.query('UPDATE dbo.MAESTRA_TERCEROS_CONTRATOS SET Nombre=@NOM,Objetivo=@OBJ,NoContrato=@CTR,FechaInicio=@FI,FechaTerminacion=@FF,ValorContrato=@VAL,DuracionRelacion=@DUR,Domicilio=@DOM,CargoSupervisor=@CARG,SupervisorNombre=@SUP,ServicioContratado=@SVC,ID_RelacionTerceros=@IDRT WHERE NIT=@NIT');
          tablas.push('MAESTRA_TERCEROS_CONTRATOS (upd)');
        } else {
          // ID_Contrato no es IDENTITY: calcular siguiente valor
          const maxId = (await new sql.Request(tx).query('SELECT ISNULL(MAX(ID_Contrato),0)+1 AS NextID FROM dbo.MAESTRA_TERCEROS_CONTRATOS')).recordset[0].NextID;
          await cq.input('IDC',sql.Int,maxId).query('INSERT INTO dbo.MAESTRA_TERCEROS_CONTRATOS(ID_Contrato,Nombre,Objetivo,NoContrato,NIT,FechaInicio,FechaTerminacion,ValorContrato,DuracionRelacion,Domicilio,CargoSupervisor,SupervisorNombre,ServicioContratado,ID_RelacionTerceros) VALUES(@IDC,@NOM,@OBJ,@CTR,@NIT,@FI,@FF,@VAL,@DUR,@DOM,@CARG,@SUP,@SVC,@IDRT)');
          tablas.push('MAESTRA_TERCEROS_CONTRATOS');
        }
        console.log('  CONTRATOS OK');
      } catch(ce) { console.warn('  Contratos skip:', ce.message); }

      // ── 5. Matriz_Riesgos_Resultados ─────────────────────────
      // Columnas REALES: NIT(PK/FK), DominioID(PK/FK), Puntaje_Promedio(float),
      //   Zona_Riesgo(varchar50), Valoracion(varchar10), Periodicidad(varchar50), FechaEvaluacion(datetime)
      const domsValidos = (await new sql.Request(tx).query('SELECT DominioID FROM dbo.Dominios_Riesgo')).recordset.map(r=>r.DominioID);
      let mrrCount = 0;
      for (const ev of evaluaciones) {
        let domId = parseInt(ev.DominioID);
        if (!domId||isNaN(domId)||!domsValidos.includes(domId)) { console.warn('  DomID inválido:', ev.DominioID); continue; }
        const isNA   = String(ev.Valoracion)==='N/A';
        const valStr = isNA ? 'N/A' : String(ev.Valoracion||'');
        const valNum = isNA ? null  : (parseFloat(ev.Valoracion)||null);
        const prom   = (tercero.PromedioCriticidad!=null) ? tercero.PromedioCriticidad : valNum;
        const hasMRR = (await new sql.Request(tx).input('NIT',sql.NVarChar(50),tercero.NIT).input('DID',sql.Int,domId).query('SELECT 1 FROM dbo.Matriz_Riesgos_Resultados WHERE NIT=@NIT AND DominioID=@DID')).recordset.length>0;
        const mq = new sql.Request(tx).input('NIT',sql.NVarChar(50),tercero.NIT).input('DID',sql.Int,domId).input('VAL',sql.NVarChar(10),valStr).input('PROM',sql.Float,prom).input('ZONA',sql.NVarChar(50),ev.Zona_Riesgo||tercero.Zona_Riesgo||'').input('PER',sql.NVarChar(50),ev.Periodicidad||tercero.Periodicidad||'');
        if (hasMRR) { await mq.query('UPDATE dbo.Matriz_Riesgos_Resultados SET Valoracion=@VAL,Puntaje_Promedio=@PROM,Zona_Riesgo=@ZONA,Periodicidad=@PER,FechaEvaluacion=GETDATE() WHERE NIT=@NIT AND DominioID=@DID'); }
        else        { await mq.query('INSERT INTO dbo.Matriz_Riesgos_Resultados(NIT,DominioID,Valoracion,Puntaje_Promedio,Zona_Riesgo,Periodicidad,FechaEvaluacion) VALUES(@NIT,@DID,@VAL,@PROM,@ZONA,@PER,GETDATE())'); }
        mrrCount++;
        console.log(`  Matriz DomID:${domId} Val:${valStr}`);
      }
      if (mrrCount>0) tablas.push('Matriz_Riesgos_Resultados');

      // ── 6. Formulario_Clasificacion_Terceros ─────────────────
      // Columnas REALES: ID_ClasTerceros(PK), ID_RelacionTerceros(FK int NoNULL),
      //   ID_Clasificacion(FK int NoNULL), Valoracion(int), Asignacion(int)
      if (idRT) {
        let fctCount = 0;
        for (const ev of evaluaciones) {
          try {
            let domId = parseInt(ev.DominioID);
            if (!domId||isNaN(domId)) continue;
            const valNum = (String(ev.Valoracion)==='N/A') ? 1 : (parseInt(ev.Valoracion)||1);
            // Buscar ID_Clasificacion via Maestra_Tipologia_Riesgos → Lista_Clasificacion
            const clsQ = (await new sql.Request(tx).input('DID',sql.Int,domId).query(`
              SELECT TOP 1 lc.ID_Clasificacion, lc.Asignacion
              FROM dbo.Lista_Clasificacion lc
              INNER JOIN dbo.Maestra_Tipologia_Riesgos mtr ON lc.TipologiaRiesgo=mtr.ID_TipologiaRiesgo
              WHERE mtr.DominioID=@DID ORDER BY lc.Asignacion`)).recordset;
            let idClas = clsQ[0]?.ID_Clasificacion;
            let asig   = clsQ[0]?.Asignacion ?? 0;
            if (!idClas) {
              const fb = (await new sql.Request(tx).query('SELECT TOP 1 ID_Clasificacion, Asignacion FROM dbo.Lista_Clasificacion')).recordset;
              idClas=fb[0]?.ID_Clasificacion; asig=fb[0]?.Asignacion??0;
            }
            if (idClas) {
              await new sql.Request(tx).input('IRT',sql.Int,idRT).input('ICL',sql.Int,idClas).input('VALI',sql.Int,valNum).input('ASIG',sql.Int,asig).query('INSERT INTO dbo.Formulario_Clasificacion_Terceros(ID_RelacionTerceros,ID_Clasificacion,Valoracion,Asignacion) VALUES(@IRT,@ICL,@VALI,@ASIG)');
              fctCount++;
            }
          } catch(fE) { console.warn('  FCT skip:', fE.message); }
        }
        if (fctCount>0) tablas.push('Formulario_Clasificacion_Terceros');
      }

      // ── 7. Log_Cambios ───────────────────────────────────────
      // Columnas REALES: ID_Log(PK), NombreTabla(100), Operacion(10),
      //   Usuario(100), FechaHora(datetime), ID_RegistroAfectado(int), Detalles(max)
      try {
        await new sql.Request(tx)
          .input('TAB',sql.NVarChar(100),'Relacion_Terceros')
          .input('OPE',sql.NVarChar(10), existeRT.length>0?'UPDATE':'INSERT')
          .input('USR',sql.NVarChar(100),tercero.UsuarioRegistro||'Sistema')
          .input('IDR',sql.Int,          idRT||null)
          .input('DET',sql.NVarChar(sql.MAX),JSON.stringify({NIT:tercero.NIT,Nombre:tercero.NombreTercero,tablas}))
          .query('INSERT INTO dbo.Log_Cambios(NombreTabla,Operacion,Usuario,FechaHora,ID_RegistroAfectado,Detalles) VALUES(@TAB,@OPE,@USR,GETDATE(),@IDR,@DET)');
        tablas.push('Log_Cambios');
      } catch(le) { console.warn('  Log_Cambios skip:', le.message); }

      await tx.commit();
      console.log('✅ COMMIT NIT:', tercero.NIT, '| Tablas:', tablas.join(', '));
      res.json({ ok:true, message:`${tercero.NombreTercero} guardado`, nit:tercero.NIT, id_relacion:idRT, tablas });

    } catch(inner) {
      await tx.rollback();
      console.error('❌ ROLLBACK:', inner.message);
      throw inner;
    }
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// PREGUNTAS
// ═══════════════════════════════════════════════════════════════
app.get('/api/preguntas', async (req, res) => {
  try { if (!await chk(res)) return; const r = await pool.request().query('SELECT PreguntaID, DominioID, Nombre_Control, Descripcion_Requerimiento, ID_Pregunta, TextoPregunta, Dominio, Orden FROM dbo.Preguntas_Cuestionario WHERE Activo=1 ORDER BY Orden'); res.json({ ok:true, data:r.recordset }); } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/api/formulario-clasificacion', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { nit } = req.query;
    let q = 'SELECT fct.*, rt.NombreTercero, lc.Opciones AS DescripcionClasificacion FROM dbo.Formulario_Clasificacion_Terceros fct LEFT JOIN dbo.Relacion_Terceros rt ON fct.ID_RelacionTerceros=rt.ID_RelacionTerceros LEFT JOIN dbo.Lista_Clasificacion lc ON fct.ID_Clasificacion=lc.ID_Clasificacion';
    if (nit) q += ' WHERE rt.NIT=@NIT';
    q += ' ORDER BY fct.ID_ClasTerceros DESC';
    const r2 = pool.request(); if(nit) r2.input('NIT',sql.NVarChar(50),nit);
    const r = await r2.query(q); res.json({ ok:true, data:r.recordset });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// RESULTADOS / RESUMEN / ALERTAS
// ═══════════════════════════════════════════════════════════════
app.get('/api/resultados', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { anio } = req.query;
    let q = 'SELECT mrr.NIT, rt.NombreTercero, dr.Nombre_Dominio, mrr.DominioID, mrr.Valoracion, mrr.Puntaje_Promedio, mrr.Zona_Riesgo, mrr.Periodicidad, mrr.FechaEvaluacion FROM dbo.Matriz_Riesgos_Resultados mrr LEFT JOIN dbo.Relacion_Terceros rt ON mrr.NIT=rt.NIT LEFT JOIN dbo.Dominios_Riesgo dr ON mrr.DominioID=dr.DominioID WHERE 1=1';
    if (anio) q += ' AND YEAR(mrr.FechaEvaluacion)=@ANIO';
    q += ' ORDER BY mrr.FechaEvaluacion DESC';
    const r2 = pool.request(); if(anio) r2.input('ANIO',sql.Int,parseInt(anio));
    const r = await r2.query(q); res.json({ ok:true, data:r.recordset });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/api/resumen', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { anio } = req.query;
    let q = 'SELECT mrr.NIT, rt.NombreTercero, rt.ServicioContratado, AVG(CAST(mrr.Puntaje_Promedio AS float)) AS PromedioCriticidad, MAX(mrr.Zona_Riesgo) AS Zona_Riesgo, MAX(mrr.Periodicidad) AS Periodicidad, MAX(mrr.FechaEvaluacion) AS FechaEvaluacion, rt.ID_RelacionTerceros, YEAR(MAX(mrr.FechaEvaluacion)) AS Anio FROM dbo.Matriz_Riesgos_Resultados mrr LEFT JOIN dbo.Relacion_Terceros rt ON mrr.NIT=rt.NIT WHERE 1=1';
    if (anio) q += ' AND YEAR(mrr.FechaEvaluacion)=@ANIO';
    q += ' GROUP BY mrr.NIT, rt.NombreTercero, rt.ServicioContratado, rt.ID_RelacionTerceros ORDER BY MAX(mrr.FechaEvaluacion) DESC';
    const r2 = pool.request(); if(anio) r2.input('ANIO',sql.Int,parseInt(anio));
    const r = await r2.query(q); res.json({ ok:true, data:r.recordset });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/api/alertas', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const etapa2 = await pool.request().query('SELECT rt.NIT, rt.NombreTercero, rt.ServicioContratado, rt.PromedioCriticidad, mrr.Zona_Riesgo, mrr.FechaEvaluacion, rg.NombreEntidad FROM dbo.Relacion_Terceros rt INNER JOIN dbo.Matriz_Riesgos_Resultados mrr ON rt.NIT=mrr.NIT LEFT JOIN dbo.RELACION_GENERAL rg ON rt.RelacionGeneral=rg.ID_General WHERE rt.PromedioCriticidad>=3 ORDER BY rt.PromedioCriticidad DESC');
    let venc = { recordset:[] };
    try { venc = await pool.request().query('SELECT NIT,Nombre,FechaTerminacion,SupervisorNombre,ServicioContratado,DATEDIFF(day,GETDATE(),FechaTerminacion) AS DiasParaVencer FROM dbo.MAESTRA_TERCEROS_CONTRATOS WHERE FechaTerminacion BETWEEN DATEADD(day,-30,GETDATE()) AND DATEADD(day,30,GETDATE()) ORDER BY FechaTerminacion'); } catch(e){}
    res.json({ ok:true, data:{ etapa2:etapa2.recordset, vencimientos:venc.recordset, totalEtapa2:etapa2.recordset.length, totalVencimientos:venc.recordset.length } });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});

// ═══════════════════════════════════════════════════════════════
// LOGS / EXPORTAR / AÑOS
// ═══════════════════════════════════════════════════════════════
app.get('/api/logs', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { limite=100 } = req.query;
    const r = await pool.request().input('LIM',sql.Int,parseInt(limite)).query('SELECT TOP (@LIM) * FROM dbo.Log_Cambios ORDER BY FechaHora DESC');
    res.json({ ok:true, data:r.recordset });
  } catch(e) { res.json({ ok:true, data:[], warning:'Log_Cambios: '+e.message }); }
});
app.post('/api/logs', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { usuario, accion, modulo, detalle, nit } = req.body;
    await pool.request().input('TAB',sql.NVarChar(100),modulo||'Sistema').input('OPE',sql.NVarChar(10),accion||'INFO').input('USR',sql.NVarChar(100),usuario||'Sistema').input('DET',sql.NVarChar(sql.MAX),JSON.stringify({detalle,nit})).query('INSERT INTO dbo.Log_Cambios(NombreTabla,Operacion,Usuario,FechaHora,Detalles) VALUES(@TAB,@OPE,@USR,GETDATE(),@DET)');
    res.json({ ok:true });
  } catch(e) { res.json({ ok:true, warning:'Log no guardado: '+e.message }); }
});
app.get('/api/exportar/clasificacion', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const { anio } = req.query;
    let q = 'SELECT rt.NIT,rt.NombreTercero,rt.ServicioContratado,rt.SupervisorNombre,rt.CargoSupervisor,rt.Domicilio,rt.NoContrato,rt.FechaInicioContrato,rt.FechaTerminacionContrato,rt.ValorContrato,rt.PromedioCriticidad,mrr.Zona_Riesgo,mrr.Periodicidad,rg.NombreEntidad,mrr.FechaEvaluacion,YEAR(mrr.FechaEvaluacion) AS Anio FROM dbo.Relacion_Terceros rt LEFT JOIN dbo.RELACION_GENERAL rg ON rt.RelacionGeneral=rg.ID_General LEFT JOIN dbo.Matriz_Riesgos_Resultados mrr ON rt.NIT=mrr.NIT WHERE 1=1';
    if (anio) q += ` AND YEAR(mrr.FechaEvaluacion)=${parseInt(anio)}`;
    q += ' ORDER BY rt.NombreTercero';
    const r = await pool.request().query(q);
    res.setHeader('Content-Disposition',`attachment; filename="clasificacion_${anio||'todos'}.json"`);
    res.json({ ok:true, data:r.recordset, total:r.recordset.length, generado:new Date().toISOString() });
  } catch(e) { res.status(500).json({ ok:false, error:e.message }); }
});
app.get('/api/anios', async (req, res) => {
  try {
    if (!await chk(res)) return;
    const r = await pool.request().query('SELECT DISTINCT YEAR(FechaEvaluacion) AS Anio FROM dbo.Matriz_Riesgos_Resultados WHERE FechaEvaluacion IS NOT NULL ORDER BY Anio DESC');
    const anios = r.recordset.map(x=>x.Anio);
    const cur = new Date().getFullYear();
    [cur,cur+1,cur+2].forEach(y=>{ if(!anios.includes(y)) anios.unshift(y); });
    res.json({ ok:true, data:anios.sort().reverse() });
  } catch(e) { res.json({ ok:true, data:[new Date().getFullYear()] }); }
});

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 8080; // ✅ CAMBIO 3
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor en http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('POST /api/clasificacion  → guarda en:');
  console.log('  MAESTRA_TERCEROS_FUNCIONARIOS');
  console.log('  Relacion_Terceros (con cols tipología)');
  console.log('  MAESTRA_TERCEROS_CONTRATOS');
  console.log('  Matriz_Riesgos_Resultados');
  console.log('  Formulario_Clasificacion_Terceros');
  console.log('  Log_Cambios');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
