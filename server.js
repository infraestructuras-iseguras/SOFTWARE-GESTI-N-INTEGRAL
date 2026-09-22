const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { DefaultAzureCredential } = require('@azure/identity');

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

// Compatibilidad con la configuración original del App Service:
// DB_DATABASE era el nombre usado originalmente; DB_NAME también se acepta.
const DB_SERVER =
  process.env.DB_SERVER ||
  'azure-iseguras.database.windows.net';

const DB_DATABASE =
  process.env.DB_DATABASE ||
  process.env.DB_NAME ||
  'PruebaAplicacion';

const DB_PORT =
  Number(process.env.DB_PORT || 1433);

const baseSqlConfig = {
  server: DB_SERVER,
  database: DB_DATABASE,
  port: DB_PORT,

  options: {
    encrypt: true,
    trustServerCertificate: false
  },

  pool: {
    min: 0,
    max: 10,
    idleTimeoutMillis: 30000
  },

  connectionTimeout: 30000,
  requestTimeout: 60000
};

// Se mantiene el nombre `config` porque el resto del servidor ya lo usa.
// Si existen credenciales SQL explícitas, se respetan. En Azure, el flujo
// original usa Managed Identity / Microsoft Entra ID mediante access token.
let config = { ...baseSqlConfig };

async function buildSqlConnectionConfig() {
  if (process.env.DB_USER && process.env.DB_PASSWORD) {
    return {
      ...baseSqlConfig,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    };
  }

  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(
    'https://database.windows.net/.default'
  );

  if (!token || !token.token) {
    throw new Error(
      'Microsoft Entra ID no devolvió un token para Azure SQL'
    );
  }

  return {
    ...baseSqlConfig,
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: token.token
      }
    }
  };
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

// Guarda cambios completos de otros roles sin destruir respuestas que un Evaluador
// pudo haber sincronizado segundos antes. La fila se bloquea durante la mezcla para
// que POST (otros roles) y PATCH (Evaluador) puedan convivir de forma segura.
async function upsertSGRTStatePreservingEvaluator(nit, incomingPayload) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) throw new Error('La tabla dbo.SGRT_Tercero_Estado no está disponible');
  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const readReq = new sql.Request(transaction);
    readReq.input('nit', sql.NVarChar(50), String(nit));
    const existingRs = await readReq.query(`SELECT Payload FROM dbo.SGRT_Tercero_Estado WITH (UPDLOCK, HOLDLOCK) WHERE NIT=@nit`);
    let existing = {};
    if (existingRs.recordset.length) {
      try { existing = JSON.parse(existingRs.recordset[0].Payload || '{}'); } catch (e) { existing = {}; }
    }
    existing = hydrateEvaluatorResponses(existing);
    let incoming = hydrateEvaluatorResponses(sgrtPlainClone(incomingPayload || {}));
    incoming.nit = incoming.nit || String(nit);

    // El estado entrante puede actualizar clasificación, contratos, tipologías,
    // configuración, etc. Para cuestionarios, el servidor conserva la versión más
    // reciente y solo incorpora contratos/preguntas que todavía no existan allí.
    const serverAnswers = existing.respuestasACPorContrato || {};
    const incomingAnswers = incoming.respuestasACPorContrato || {};
    const mergedAnswers = sgrtPlainClone(incomingAnswers) || {};
    Object.keys(serverAnswers).forEach((c) => {
      const incomingKey = sgrtContractMapKey(mergedAnswers, c) || c;
      const dst = mergedAnswers[incomingKey] && typeof mergedAnswers[incomingKey] === 'object' ? mergedAnswers[incomingKey] : {};
      mergeEvaluatorAnswers(dst, serverAnswers[c]); // servidor gana si la misma pregunta difiere
      mergedAnswers[incomingKey] = dst;
    });
    incoming.respuestasACPorContrato = mergedAnswers;

    ['borradoresACPorContrato','acPorContrato'].forEach((block) => {
      const a = incoming[block] && typeof incoming[block] === 'object' ? incoming[block] : {};
      const e = existing[block] && typeof existing[block] === 'object' ? existing[block] : {};
      Object.keys(e).forEach((c) => { if (!a[c]) a[c] = sgrtPlainClone(e[c]); });
      incoming[block] = a;
    });
    if (existing._ultimaEdicionEvaluador) incoming._ultimaEdicionEvaluador = sgrtPlainClone(existing._ultimaEdicionEvaluador);

    // Los bloques administrados por PATCH atómico conservan la versión del servidor
    // frente a un POST completo potencialmente desactualizado de otro navegador.
    ['dimsPorContrato','tipologiasPorContrato','promPorContrato','aprobadoPorContrato'].forEach((block) => {
      const a = incoming[block] && typeof incoming[block] === 'object' ? incoming[block] : {};
      const e = existing[block] && typeof existing[block] === 'object' ? existing[block] : {};
      Object.keys(e).forEach((c) => { a[c] = sgrtPlainClone(e[c]); });
      incoming[block] = a;
    });
    if (existing._ultimaEdicionClasificacion) incoming._ultimaEdicionClasificacion = sgrtPlainClone(existing._ultimaEdicionClasificacion);

    // Los riesgos también se administran de forma atómica. Un POST completo no puede
    // borrar riesgos guardados por otro usuario segundos antes.
    if (Array.isArray(existing._matrizRiesgos)) {
      const by = {};
      (Array.isArray(incoming._matrizRiesgos) ? incoming._matrizRiesgos : []).forEach((r) => {
        const k = String((r && r.id) || '') + '|' + sgrtContractCanon(r && r.contrato);
        if (k !== '|') by[k] = sgrtPlainClone(r);
      });
      existing._matrizRiesgos.forEach((r) => {
        const k = String((r && r.id) || '') + '|' + sgrtContractCanon(r && r.contrato);
        if (k !== '|') by[k] = sgrtPlainClone(r);
      });
      incoming._matrizRiesgos = Object.values(by);
    }

    const writeReq = new sql.Request(transaction);
    writeReq.input('nit', sql.NVarChar(50), String(nit));
    writeReq.input('payload', sql.NVarChar(sql.MAX), JSON.stringify(incoming));
    if (existingRs.recordset.length) {
      await writeReq.query(`UPDATE dbo.SGRT_Tercero_Estado SET Payload=@payload, UpdatedAt=SYSUTCDATETIME() WHERE NIT=@nit`);
    } else {
      await writeReq.query(`INSERT INTO dbo.SGRT_Tercero_Estado (NIT, Payload, UpdatedAt) VALUES (@nit, @payload, SYSUTCDATETIME())`);
    }
    await transaction.commit();
    return incoming;
  } catch (error) {
    try { await transaction.rollback(); } catch (e) {}
    throw error;
  }
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
  payload = hydrateEvaluatorResponses(payload);
  return { nit: row.NIT, estado_sgrt: payload, updatedAt: row.UpdatedAt };
}



// ================================================================
// ACTUALIZACIÓN ATÓMICA DEL EVALUADOR POR CONTRATO
// ================================================================
// Evita que dos Evaluadores que trabajan al mismo tiempo reemplacen el JSON
// completo del tercero. Solo se mezcla el bloque del contrato que se está
// diligenciando y se bloquea la fila mientras dura la actualización.
function sgrtPlainClone(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch (e) { return value; }
}

function sgrtContractCanon(value) {
  const s = String(value == null ? '' : value).trim();
  if (/^\d+$/.test(s)) return String(parseInt(s, 10));
  return s.toLowerCase();
}

function sgrtUsefulContractValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return !!value;
}

function sgrtContractMapKey(map, contract) {
  if (!map || typeof map !== 'object') return '';
  const raw = String(contract == null ? '' : contract).trim();
  const hasExact = Object.prototype.hasOwnProperty.call(map, raw);
  if (hasExact && sgrtUsefulContractValue(map[raw])) return raw;
  const canon = sgrtContractCanon(raw);
  let fallback = '';
  Object.keys(map).some((key) => {
    if (sgrtContractCanon(key) !== canon) return false;
    if (sgrtUsefulContractValue(map[key])) { fallback = key; return true; }
    if (!fallback) fallback = key;
    return false;
  });
  return fallback || (hasExact ? raw : '');
}

function sgrtContractMapValue(map, contract) {
  const key = sgrtContractMapKey(map, contract);
  return key ? map[key] : undefined;
}

function mergeEvaluatorAnswers(target, source) {
  target = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return target;
  Object.keys(source).forEach((tipKey) => {
    const srcTip = source[tipKey];
    if (!srcTip || typeof srcTip !== 'object' || Array.isArray(srcTip)) {
      target[tipKey] = sgrtPlainClone(srcTip);
      return;
    }
    if (!target[tipKey] || typeof target[tipKey] !== 'object' || Array.isArray(target[tipKey])) target[tipKey] = {};
    Object.keys(srcTip).forEach((controlKey) => {
      target[tipKey][controlKey] = sgrtPlainClone(srcTip[controlKey]);
    });
  });
  return target;
}

function mergeEvaluatorPack(target, source) {
  target = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return target;
  Object.keys(source).forEach((key) => { target[key] = sgrtPlainClone(source[key]); });
  return target;
}

// Normaliza respuestas históricas para que todos los navegadores vean el mismo
// progreso por contrato. Versiones antiguas guardaban el cuestionario en
// _respuestas + contratoEval; las versiones actuales usan respuestasACPorContrato.
function hydrateEvaluatorResponses(payload) {
  payload = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
  payload.respuestasACPorContrato = payload.respuestasACPorContrato && typeof payload.respuestasACPorContrato === 'object' ? payload.respuestasACPorContrato : {};

  const absorb = (contract, source) => {
    const c = String(contract || '').trim();
    if (!c || !source || typeof source !== 'object' || Array.isArray(source)) return;
    const dst = payload.respuestasACPorContrato[c] && typeof payload.respuestasACPorContrato[c] === 'object' ? payload.respuestasACPorContrato[c] : {};
    mergeEvaluatorAnswers(dst, source);
    payload.respuestasACPorContrato[c] = dst;
  };

  Object.keys(payload.acPorContrato || {}).forEach((c) => absorb(c, payload.acPorContrato[c] && payload.acPorContrato[c].respuestas));
  Object.keys(payload.borradoresACPorContrato || {}).forEach((c) => absorb(c, payload.borradoresACPorContrato[c] && payload.borradoresACPorContrato[c].respuestas));
  Object.keys(payload._respuestasPorContrato || {}).forEach((c) => absorb(c, payload._respuestasPorContrato[c]));
  Object.keys(payload.respuestasPorContrato || {}).forEach((c) => absorb(c, payload.respuestasPorContrato[c]));

  // _respuestas es un formato legado global. Si ya existen respuestas separadas por
  // contrato NO se vuelve a inferir su dueño desde contratoEval, porque contratoEval
  // cambia al navegar y eso duplicaba el mismo progreso en contratos distintos.
  const hasContractAnswers = Object.keys(payload.respuestasACPorContrato || {}).some((c) => {
    const block = payload.respuestasACPorContrato[c];
    return block && typeof block === 'object' && Object.keys(block).length > 0;
  });
  const legacyContract = String(
    payload._respuestasContrato ||
    payload.contratoRespuestas ||
    (payload._ultimaEdicionEvaluador && payload._ultimaEdicionEvaluador.contrato) ||
    ''
  ).trim();
  if (legacyContract && payload._respuestas && typeof payload._respuestas === 'object') absorb(legacyContract, payload._respuestas);
  return payload;
}

async function patchEvaluatorStateByContract(nit, contrato, patch) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) throw new Error('La tabla dbo.SGRT_Tercero_Estado no está disponible');

  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const readReq = new sql.Request(transaction);
    readReq.input('nit', sql.NVarChar(50), String(nit));
    const existing = await readReq.query(`
      SELECT NIT, Payload, UpdatedAt
      FROM dbo.SGRT_Tercero_Estado WITH (UPDLOCK, HOLDLOCK)
      WHERE NIT=@nit
    `);

    let payload = {};
    if (existing.recordset.length) {
      try { payload = JSON.parse(existing.recordset[0].Payload || '{}'); } catch (e) { payload = {}; }
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
    payload = hydrateEvaluatorResponses(payload);

    const c = String(contrato || '').trim();
    payload.nit = payload.nit || String(nit);
    payload.respuestasACPorContrato = payload.respuestasACPorContrato && typeof payload.respuestasACPorContrato === 'object' ? payload.respuestasACPorContrato : {};
    payload.borradoresACPorContrato = payload.borradoresACPorContrato && typeof payload.borradoresACPorContrato === 'object' ? payload.borradoresACPorContrato : {};
    payload.acPorContrato = payload.acPorContrato && typeof payload.acPorContrato === 'object' ? payload.acPorContrato : {};
    payload.promPorContrato = payload.promPorContrato && typeof payload.promPorContrato === 'object' ? payload.promPorContrato : {};

    const previousAnswerKey = sgrtContractMapKey(payload.respuestasACPorContrato, c);
    if (patch && patch.replaceResponses === true && patch.respuestas && typeof patch.respuestas === 'object') {
      payload.respuestasACPorContrato[c] = sgrtPlainClone(patch.respuestas);
    } else {
      const previousAnswers = sgrtContractMapValue(payload.respuestasACPorContrato, c);
      const currentAnswers = previousAnswers && typeof previousAnswers === 'object' ? sgrtPlainClone(previousAnswers) : {};
      if (patch && patch.respuestas && typeof patch.respuestas === 'object') mergeEvaluatorAnswers(currentAnswers, patch.respuestas);
      if (patch && patch.respuestaDelta && typeof patch.respuestaDelta === 'object') mergeEvaluatorAnswers(currentAnswers, patch.respuestaDelta);
      payload.respuestasACPorContrato[c] = currentAnswers;
    }
    // "04" y "4" son el mismo contrato histórico. Al guardar, consolidamos en la
    // etiqueta usada actualmente para que no queden dos bloques que luego compitan.
    if (previousAnswerKey && previousAnswerKey !== c && sgrtContractCanon(previousAnswerKey) === sgrtContractCanon(c)) {
      delete payload.respuestasACPorContrato[previousAnswerKey];
    }

    // Compatibilidad con módulos antiguos sin perder separación contractual: el bloque
    // global siempre apunta explícitamente al último contrato editado.
    payload._respuestasContrato = c;
    payload._respuestas = sgrtPlainClone(payload.respuestasACPorContrato[c] || {});

    if (patch && patch.borrador && typeof patch.borrador === 'object') {
      const b = sgrtPlainClone(patch.borrador);
      b.contrato = c;
      b.respuestas = sgrtPlainClone(payload.respuestasACPorContrato[c] || {});
      payload.borradoresACPorContrato[c] = b;
    }
    if (patch && patch.ac && typeof patch.ac === 'object') {
      const ac = sgrtPlainClone(patch.ac);
      ac.respuestas = sgrtPlainClone(payload.respuestasACPorContrato[c] || {});
      payload.acPorContrato[c] = ac;
    }
    if (patch && patch.promContrato && typeof patch.promContrato === 'object') {
      const oldPromKey = sgrtContractMapKey(payload.promPorContrato, c);
      payload.promPorContrato[c] = Object.assign({}, sgrtContractMapValue(payload.promPorContrato, c) || {}, sgrtPlainClone(patch.promContrato));
      if (oldPromKey && oldPromKey !== c && sgrtContractCanon(oldPromKey) === sgrtContractCanon(c)) delete payload.promPorContrato[oldPromKey];
    }
    if (patch && patch.evidenciasAC && typeof patch.evidenciasAC === 'object') {
      payload._evidenciasAC = mergeEvaluatorPack(payload._evidenciasAC, patch.evidenciasAC);
    }
    if (patch && patch.evidenciasRiesgo && typeof patch.evidenciasRiesgo === 'object') {
      payload._evidenciasRiesgo = mergeEvaluatorPack(payload._evidenciasRiesgo, patch.evidenciasRiesgo);
    }

    const actor = patch && patch.actor && typeof patch.actor === 'object' ? patch.actor : {};
    payload._ultimaEdicionEvaluador = {
      contrato: c,
      at: new Date().toISOString(),
      usuario: {
        login: String(actor.login || actor.user || '').slice(0, 120),
        nombre: String(actor.name || actor.nombre || '').slice(0, 180),
        rol: String(actor.rol || '').slice(0, 80)
      }
    };

    const writeReq = new sql.Request(transaction);
    writeReq.input('nit', sql.NVarChar(50), String(nit));
    writeReq.input('payload', sql.NVarChar(sql.MAX), JSON.stringify(payload));
    if (existing.recordset.length) {
      await writeReq.query(`UPDATE dbo.SGRT_Tercero_Estado SET Payload=@payload, UpdatedAt=SYSUTCDATETIME() WHERE NIT=@nit`);
    } else {
      await writeReq.query(`INSERT INTO dbo.SGRT_Tercero_Estado (NIT, Payload, UpdatedAt) VALUES (@nit, @payload, SYSUTCDATETIME())`);
    }
    await transaction.commit();
    return payload;
  } catch (error) {
    try { await transaction.rollback(); } catch (e) {}
    throw error;
  }
}


// PATCH específico del Administrador de Riesgos: actualiza únicamente la
// clasificación/tipologías del contrato indicado. Usa bloqueo de fila para
// evitar que dos usuarios trabajando al mismo tiempo se pisen otros contratos.
async function patchClassificationStateByContract(nit, contrato, patch) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) throw new Error('La tabla dbo.SGRT_Tercero_Estado no está disponible');

  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const readReq = new sql.Request(transaction);
    readReq.input('nit', sql.NVarChar(50), String(nit));
    const existing = await readReq.query(`
      SELECT NIT, Payload, UpdatedAt
      FROM dbo.SGRT_Tercero_Estado WITH (UPDLOCK, HOLDLOCK)
      WHERE NIT=@nit
    `);

    let payload = {};
    if (existing.recordset.length) {
      try { payload = JSON.parse(existing.recordset[0].Payload || '{}'); } catch (e) { payload = {}; }
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
    payload = hydrateEvaluatorResponses(payload);

    const c = String(contrato || '').trim();
    const consolidate = (map, value) => {
      map = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
      const oldKey = sgrtContractMapKey(map, c);
      map[c] = sgrtPlainClone(value);
      if (oldKey && oldKey !== c && sgrtContractCanon(oldKey) === sgrtContractCanon(c)) delete map[oldKey];
      return map;
    };

    payload.nit = payload.nit || String(nit);
    payload.dimsPorContrato = payload.dimsPorContrato && typeof payload.dimsPorContrato === 'object' ? payload.dimsPorContrato : {};
    payload.tipologiasPorContrato = payload.tipologiasPorContrato && typeof payload.tipologiasPorContrato === 'object' ? payload.tipologiasPorContrato : {};
    payload.promPorContrato = payload.promPorContrato && typeof payload.promPorContrato === 'object' ? payload.promPorContrato : {};
    payload.aprobadoPorContrato = payload.aprobadoPorContrato && typeof payload.aprobadoPorContrato === 'object' ? payload.aprobadoPorContrato : {};

    const dims = patch && Array.isArray(patch.dims) ? patch.dims : [];
    payload.dimsPorContrato = consolidate(payload.dimsPorContrato, dims);
    payload.tipologiasPorContrato = consolidate(payload.tipologiasPorContrato, dims);

    if (patch && Object.prototype.hasOwnProperty.call(patch, 'promContrato')) {
      const prom = patch.promContrato && typeof patch.promContrato === 'object'
        ? patch.promContrato
        : {prom:null,zona:'',sinPuntaje:true};
      payload.promPorContrato = consolidate(payload.promPorContrato, prom);
    }

    if (patch && Object.prototype.hasOwnProperty.call(patch, 'aprobado')) {
      const oldKey = sgrtContractMapKey(payload.aprobadoPorContrato, c);
      payload.aprobadoPorContrato[c] = !!patch.aprobado;
      if (oldKey && oldKey !== c && sgrtContractCanon(oldKey) === sgrtContractCanon(c)) delete payload.aprobadoPorContrato[oldKey];
    }

    if (!Array.isArray(payload.contratos)) payload.contratos = [];
    if (patch && patch.contratoMeta && typeof patch.contratoMeta === 'object') {
      const meta = sgrtPlainClone(patch.contratoMeta);
      meta.num = String(meta.num || meta.numero || meta.NoContrato || c).trim() || c;
      meta.numero = meta.num;
      const idx = payload.contratos.findIndex((x) =>
        sgrtContractCanon(x && (x.num || x.numero || x.NoContrato || x.noContrato || x.contrato)) === sgrtContractCanon(c)
      );
      if (idx >= 0) payload.contratos[idx] = Object.assign({}, payload.contratos[idx] || {}, meta);
      else payload.contratos.push(meta);
    }

    ['nombre','entidad','domicilio','servicio','servicio_contratado'].forEach((k) => {
      if (patch && patch[k] !== undefined && String(patch[k] == null ? '' : patch[k]).trim()) payload[k] = patch[k];
    });

    payload.modoEval = 'contrato';
    payload.contratoEval = c;
    payload.dims = sgrtPlainClone(dims);
    payload.savedAt = new Date().toISOString();
    payload._ultimaEdicionClasificacion = {
      contrato: c,
      at: new Date().toISOString(),
      usuario: patch && patch.actor && typeof patch.actor === 'object'
        ? {
            login: String(patch.actor.login || patch.actor.user || '').slice(0,120),
            nombre: String(patch.actor.name || patch.actor.nombre || '').slice(0,180),
            rol: String(patch.actor.rol || '').slice(0,80)
          }
        : {}
    };

    const writeReq = new sql.Request(transaction);
    writeReq.input('nit', sql.NVarChar(50), String(nit));
    writeReq.input('payload', sql.NVarChar(sql.MAX), JSON.stringify(payload));
    if (existing.recordset.length) {
      await writeReq.query(`UPDATE dbo.SGRT_Tercero_Estado SET Payload=@payload, UpdatedAt=SYSUTCDATETIME() WHERE NIT=@nit`);
    } else {
      await writeReq.query(`INSERT INTO dbo.SGRT_Tercero_Estado (NIT, Payload, UpdatedAt) VALUES (@nit, @payload, SYSUTCDATETIME())`);
    }
    await transaction.commit();
    return payload;
  } catch (error) {
    try { await transaction.rollback(); } catch (e) {}
    throw error;
  }
}


// Riesgos por tercero: mezcla altas/ediciones y bajas explícitas bajo el mismo
// bloqueo de fila. Así dos usuarios no reemplazan toda la matriz del otro.
async function patchRiskState(nit, patch) {
  if (!sgrtStateReady) await ensureSGRTStateTable();
  if (!sgrtStateReady) throw new Error('La tabla dbo.SGRT_Tercero_Estado no está disponible');
  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const readReq = new sql.Request(transaction);
    readReq.input('nit', sql.NVarChar(50), String(nit));
    const existing = await readReq.query(`SELECT Payload FROM dbo.SGRT_Tercero_Estado WITH (UPDLOCK, HOLDLOCK) WHERE NIT=@nit`);
    let payload = {};
    if (existing.recordset.length) {
      try { payload = JSON.parse(existing.recordset[0].Payload || '{}'); } catch (e) { payload = {}; }
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};
    payload = hydrateEvaluatorResponses(payload);

    const by = {};
    (Array.isArray(payload._matrizRiesgos) ? payload._matrizRiesgos : []).forEach((r) => {
      const k = String((r && r.id) || '') + '|' + sgrtContractCanon(r && r.contrato);
      if (k !== '|') by[k] = sgrtPlainClone(r);
    });
    (Array.isArray(patch && patch.upserts) ? patch.upserts : []).forEach((r) => {
      const x = sgrtPlainClone(r || {});
      x.nit = x.nit || String(nit);
      const k = String(x.id || '') + '|' + sgrtContractCanon(x.contrato);
      if (k !== '|') by[k] = x;
    });
    const deletes = Array.isArray(patch && patch.deleteIds) ? patch.deleteIds.map(String) : [];
    if (deletes.length) {
      Object.keys(by).forEach((k) => {
        if (deletes.indexOf(String((by[k] && by[k].id) || '')) >= 0) delete by[k];
      });
    }
    payload._matrizRiesgos = Object.values(by);
    payload.savedAt = new Date().toISOString();
    payload._ultimaEdicionRiesgos = {at:new Date().toISOString(), usuario:sgrtPlainClone((patch && patch.actor) || {})};

    const writeReq = new sql.Request(transaction);
    writeReq.input('nit', sql.NVarChar(50), String(nit));
    writeReq.input('payload', sql.NVarChar(sql.MAX), JSON.stringify(payload));
    if (existing.recordset.length) await writeReq.query(`UPDATE dbo.SGRT_Tercero_Estado SET Payload=@payload, UpdatedAt=SYSUTCDATETIME() WHERE NIT=@nit`);
    else await writeReq.query(`INSERT INTO dbo.SGRT_Tercero_Estado (NIT, Payload, UpdatedAt) VALUES (@nit, @payload, SYSUTCDATETIME())`);
    await transaction.commit();
    return payload;
  } catch (error) {
    try { await transaction.rollback(); } catch (e) {}
    throw error;
  }
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

    config = await buildSqlConnectionConfig();

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
      'DB_DATABASE / DB_NAME:',
      process.env.DB_DATABASE || process.env.DB_NAME || 'NO CONFIGURADO'
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
      estado_sgrt = hydrateEvaluatorResponses(estado_sgrt);
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
    const merged = await upsertSGRTStatePreservingEvaluator(nit, payload);
    res.json({ok:true,message:'Estado SGRT persistido sin perder cambios concurrentes del Evaluador',nit,data:{estado_sgrt:merged}});
  } catch (error) {
    console.error('❌ POST /api/sgrt-state:', error.message);
    res.status(500).json({ok:false,error:error.message});
  }
});




// PATCH específico del Administrador de Riesgos: guarda tipologías/valoración
// únicamente para el contrato activo, sin reemplazar otros contratos.
app.patch('/api/sgrt-state/:nit/clasificacion/:contrato', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    const nit = String(req.params.nit || '').trim();
    const contrato = String(req.params.contrato || '').trim();
    if (!nit || !contrato) return res.status(400).json({ok:false,error:'NIT y contrato son obligatorios'});
    const estado_sgrt = await patchClassificationStateByContract(nit, contrato, req.body || {});
    res.json({ok:true,message:'Clasificación sincronizada por contrato',data:{nit,estado_sgrt}});
  } catch (error) {
    console.error('❌ PATCH /api/sgrt-state/:nit/clasificacion/:contrato:', error.message);
    res.status(500).json({ok:false,error:error.message});
  }
});



// PATCH atómico de la matriz de riesgos del tercero.
app.patch('/api/sgrt-state/:nit/riesgos', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    const nit = String(req.params.nit || '').trim();
    if (!nit) return res.status(400).json({ok:false,error:'NIT obligatorio'});
    const estado_sgrt = await patchRiskState(nit, req.body || {});
    res.json({ok:true,message:'Riesgos sincronizados sin reemplazar cambios concurrentes',data:{nit,estado_sgrt}});
  } catch (error) {
    console.error('❌ PATCH /api/sgrt-state/:nit/riesgos:', error.message);
    res.status(500).json({ok:false,error:error.message});
  }
});


// PATCH específico del rol Evaluador: actualiza únicamente el contrato activo.
// No reemplaza el JSON completo del tercero y por eso es seguro para trabajo concurrente.
app.patch('/api/sgrt-state/:nit/evaluador/:contrato', async (req, res) => {
  try {
    if (!pool || !pool.connected) return res.status(503).json({ok:false,error:'No hay conexión a base de datos'});
    const nit = String(req.params.nit || '').trim();
    const contrato = String(req.params.contrato || '').trim();
    if (!nit || !contrato) return res.status(400).json({ok:false,error:'NIT y contrato son obligatorios'});
    const estado_sgrt = await patchEvaluatorStateByContract(nit, contrato, req.body || {});
    res.json({ok:true,message:'Estado del Evaluador sincronizado por contrato',data:{nit,estado_sgrt}});
  } catch (error) {
    console.error('❌ PATCH /api/sgrt-state/:nit/evaluador/:contrato:', error.message);
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
      'SGRT v11',

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

      // También incluir estados SGRT que todavía no tengan fila en dbo.Terceros.
      // Esto recupera registros creados por versiones anteriores y evita que el
      // Evaluador vea una lista incompleta de "Registro de Terceros y Clasificación".
      const terceros = Array.isArray(result.recordset) ? result.recordset.slice() : [];
      const seen = new Set(terceros.map(row => String(row.NIT || row.nit || '').trim()).filter(Boolean));

      if (!sgrtStateReady) await ensureSGRTStateTable();
      if (sgrtStateReady) {
        const stateRows = await new sql.Request(pool).query(`SELECT NIT, Payload, UpdatedAt FROM dbo.SGRT_Tercero_Estado ORDER BY UpdatedAt DESC`);
        stateRows.recordset.forEach(row => {
          const nit = String(row.NIT || '').trim();
          if (!nit || seen.has(nit)) return;
          let payload = {};
          try { payload = JSON.parse(row.Payload || '{}'); } catch (e) { payload = {}; }
          payload = hydrateEvaluatorResponses(payload);
          terceros.push({
            NIT: nit,
            nit,
            Nombre_Tercero: payload.nombre || payload.NombreTercero || payload.Nombre_Tercero || nit,
            nombre: payload.nombre || payload.NombreTercero || payload.Nombre_Tercero || nit,
            Servicio_Contratado: payload.servicio_contratado || payload.servicioContratado || payload.servicio || '',
            servicio_contratado: payload.servicio_contratado || payload.servicioContratado || payload.servicio || '',
            Domicilio: payload.domicilio || payload.Domicilio || '',
            domicilio: payload.domicilio || payload.Domicilio || '',
            Fecha_Registro: payload.fecha_registro || payload.fechaRegistro || payload.savedAt || row.UpdatedAt,
            _recuperado_desde_estado: true
          });
          seen.add(nit);
        });
      }

      terceros.sort((a,b) => {
        const da = new Date(a.Fecha_Registro || 0).getTime() || 0;
        const db = new Date(b.Fecha_Registro || 0).getTime() || 0;
        return db - da;
      });

      console.log(
        `✅ GET /api/terceros → ${terceros.length} registros`
      );

      res.status(200).json({

        ok: true,

        count:
          terceros.length,

        data:
          terceros,

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

// Sirve la estructura histórica sin obligar a mover carpetas.
// En algunos despliegues el frontend está en public/; en este paquete está en ../frontend.
const SGRT_STATIC_DIRS = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'frontend'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'frontend')
].filter((dir,index,arr)=>arr.indexOf(dir)===index && fs.existsSync(dir));
SGRT_STATIC_DIRS.forEach(dir=>app.use(express.static(dir)));

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

    path.join(__dirname, '..', 'frontend', 'index.html'),
    path.join(process.cwd(), 'frontend', 'index.html'),

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
// POWER BI EMBEDDED — REPORTE SGRT SIN LOGIN MICROSOFT POR USUARIO
// ================================================================
// Implementa el patrón "Embed for your customers / App owns data".
// Los secretos permanecen exclusivamente en el backend.
//
// Variables recomendadas en Azure App Service:
//   POWERBI_TENANT_ID
//   POWERBI_CLIENT_ID
//   POWERBI_CLIENT_SECRET
//   POWERBI_WORKSPACE_ID          (opcional: también puede sincronizarse desde el SGRT)
//   POWERBI_REPORT_ID             (opcional: también puede sincronizarse desde el SGRT)
//
// Si POWERBI_TENANT_ID / CLIENT_ID / CLIENT_SECRET no existen, se intentan
// reutilizar SHAREPOINT_TENANT_ID / SHAREPOINT_CLIENT_ID /
// SHAREPOINT_CLIENT_SECRET. Esa aplicación de Entra debe tener acceso a la
// API de Power BI y estar agregada al workspace correspondiente.

const PBI_CFG = {
  tenantId: process.env.POWERBI_TENANT_ID || process.env.SHAREPOINT_TENANT_ID || process.env.AZURE_TENANT_ID || '',
  clientId: process.env.POWERBI_CLIENT_ID || process.env.SHAREPOINT_CLIENT_ID || '',
  clientSecret: process.env.POWERBI_CLIENT_SECRET || process.env.SHAREPOINT_CLIENT_SECRET || '',
  workspaceId: process.env.POWERBI_WORKSPACE_ID || '',
  reportId: process.env.POWERBI_REPORT_ID || '',
  embedUrl: process.env.POWERBI_EMBED_URL || ''
};

const PBI_CONFIG_DIR = process.env.POWERBI_CONFIG_DIR || (process.env.HOME ? path.join(process.env.HOME, 'data') : path.join(__dirname, 'data'));
const PBI_CONFIG_FILE = path.join(PBI_CONFIG_DIR, 'sgrt-powerbi-report.json');
let pbiAadTokenCache = { token: '', expiresAt: 0 };
let pbiEmbedTokenCache = { key: '', token: '', expiration: '', expiresAt: 0 };

function pbiCleanId(v){
  const s=String(v||'').trim();
  return /^[0-9a-fA-F-]{20,80}$/.test(s) ? s : '';
}

function pbiParseEmbedUrl(raw){
  let v=String(raw||'').trim();
  if(!v) return null;
  const iframe=v.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if(iframe&&iframe[1]) v=iframe[1].replace(/&amp;/g,'&');
  try{
    const u=new URL(v);
    let workspaceId=pbiCleanId(u.searchParams.get('groupId'));
    let reportId=pbiCleanId(u.searchParams.get('reportId'));
    if(!workspaceId||!reportId){
      const m=u.pathname.match(/\/groups\/([^\/?#]+)\/reports\/([^\/?#]+)/i);
      if(m){workspaceId=pbiCleanId(m[1]);reportId=pbiCleanId(m[2]);}
    }
    if(!workspaceId||!reportId) return null;
    return {
      workspaceId,
      reportId,
      embedUrl:`https://app.powerbi.com/reportEmbed?reportId=${encodeURIComponent(reportId)}&groupId=${encodeURIComponent(workspaceId)}`
    };
  }catch(e){return null;}
}

function pbiReadSavedConfig(){
  try{
    if(!fs.existsSync(PBI_CONFIG_FILE)) return null;
    const data=JSON.parse(fs.readFileSync(PBI_CONFIG_FILE,'utf8'));
    const embedUrl=String(data.embedUrl||'').trim();
    const workspaceId=pbiCleanId(data.workspaceId), reportId=pbiCleanId(data.reportId);
    if(workspaceId&&reportId) return {workspaceId,reportId,embedUrl,updatedAt:data.updatedAt||'',public:false};
    // Permite conservar un vínculo "Publicar en web" (view?r=...) como fallback.
    // No genera embed token; se muestra directamente en iframe.
    if(/^https:\/\/app\.powerbi\.com\/view\?/i.test(embedUrl))
      return {workspaceId:'',reportId:'',embedUrl,updatedAt:data.updatedAt||'',public:true};
    return null;
  }catch(e){
    console.warn('⚠️ Power BI: no se pudo leer configuración persistida:',e.message);
    return null;
  }
}

function pbiResolveReportConfig(){
  const envUrl=pbiParseEmbedUrl(PBI_CFG.embedUrl);
  const envWorkspace=pbiCleanId(PBI_CFG.workspaceId), envReport=pbiCleanId(PBI_CFG.reportId);
  if(envWorkspace&&envReport){
    return {workspaceId:envWorkspace,reportId:envReport,embedUrl:(envUrl&&envUrl.embedUrl)||`https://app.powerbi.com/reportEmbed?reportId=${encodeURIComponent(envReport)}&groupId=${encodeURIComponent(envWorkspace)}`,source:'environment'};
  }
  if(envUrl) return Object.assign({},envUrl,{source:'environment'});
  const saved=pbiReadSavedConfig();
  return saved?Object.assign({},saved,{source:'server'}):null;
}

function pbiSaveReportConfig(cfg){
  const workspaceId=pbiCleanId(cfg&&cfg.workspaceId), reportId=pbiCleanId(cfg&&cfg.reportId);
  const embedUrl=String(cfg&&cfg.embedUrl||'').trim() || (workspaceId&&reportId?`https://app.powerbi.com/reportEmbed?reportId=${encodeURIComponent(reportId)}&groupId=${encodeURIComponent(workspaceId)}`:'');
  const isPublic=/^https:\/\/app\.powerbi\.com\/view\?/i.test(embedUrl);
  if((!workspaceId||!reportId)&&!isPublic) throw new Error('Enlace Power BI inválido: usa reportEmbed/workspace o view?r=');
  fs.mkdirSync(PBI_CONFIG_DIR,{recursive:true});
  const payload={workspaceId:workspaceId||'',reportId:reportId||'',embedUrl,public:isPublic,updatedAt:new Date().toISOString()};
  fs.writeFileSync(PBI_CONFIG_FILE,JSON.stringify(payload,null,2),'utf8');
  pbiEmbedTokenCache={key:'',token:'',expiration:'',expiresAt:0};
  return payload;
}

function pbiCredentialsConfigured(){
  return !!(PBI_CFG.tenantId&&PBI_CFG.clientId&&PBI_CFG.clientSecret);
}

async function pbiAadAccessToken(){
  if(!pbiCredentialsConfigured()) throw new Error('Power BI Embedded no tiene credenciales de Entra configuradas');
  if(pbiAadTokenCache.token && Date.now()<pbiAadTokenCache.expiresAt-60000) return pbiAadTokenCache.token;
  const form=new URLSearchParams({
    client_id:PBI_CFG.clientId,
    client_secret:PBI_CFG.clientSecret,
    scope:'https://analysis.windows.net/powerbi/api/.default',
    grant_type:'client_credentials'
  }).toString();
  const r=await spHttp(
    `https://login.microsoftonline.com/${encodeURIComponent(PBI_CFG.tenantId)}/oauth2/v2.0/token`,
    'POST',
    {'Content-Type':'application/x-www-form-urlencoded'},
    form
  );
  if(!r.data||!r.data.access_token) throw new Error('Microsoft Entra no devolvió token para Power BI');
  pbiAadTokenCache={token:r.data.access_token,expiresAt:Date.now()+Number(r.data.expires_in||3600)*1000};
  return pbiAadTokenCache.token;
}

async function pbiApi(pathName,method='GET',body=null){
  const token=await pbiAadAccessToken();
  const headers={Authorization:'Bearer '+token};
  let payload=null;
  if(body!==null&&body!==undefined){headers['Content-Type']='application/json';payload=JSON.stringify(body);}
  return spHttp('https://api.powerbi.com/v1.0/myorg'+pathName,method,headers,payload);
}

function pbiRoleAllowed(req){
  const role=String(req.headers['x-sgrt-role']||'').toLowerCase();
  return (role.includes('administrador') && role.includes('riesgo')) || role.includes('super');
}


app.get('/api/powerbi/status', async (req,res)=>{
  const report=pbiResolveReportConfig();
  res.json({
    ok:true,
    embeddedConfigured:pbiCredentialsConfigured(),
    reportConfigured:!!report,
    report:report?{workspaceId:report.workspaceId,reportId:report.reportId,embedUrl:report.embedUrl,source:report.source}:null,
    credentialsSource:(process.env.POWERBI_CLIENT_ID?'POWERBI_*':(process.env.SHAREPOINT_CLIENT_ID?'SHAREPOINT_*':'none'))
  });
});

app.get('/api/powerbi/report-config', (req,res)=>{
  const report=pbiResolveReportConfig();
  if(!report) return res.status(404).json({ok:false,code:'POWERBI_REPORT_NOT_CONFIGURED',error:'No hay reporte Power BI configurado en el servidor'});
  res.json({ok:true,workspaceId:report.workspaceId,reportId:report.reportId,embedUrl:report.embedUrl,source:report.source});
});

app.post('/api/powerbi/report-config', (req,res)=>{
  if(!pbiRoleAllowed(req)) return res.status(403).json({ok:false,error:'Rol no autorizado para configurar Power BI'});
  try{
    // Si Azure define IDs por variables de entorno, esa configuración es la autoridad.
    if(pbiCleanId(PBI_CFG.workspaceId)&&pbiCleanId(PBI_CFG.reportId)){
      const fixed=pbiResolveReportConfig();
      return res.json({ok:true,locked:true,workspaceId:fixed.workspaceId,reportId:fixed.reportId,embedUrl:fixed.embedUrl,source:'environment'});
    }
    const rawUrl=String(req.body&&req.body.embedUrl||'').trim();
    const parsed=pbiParseEmbedUrl(rawUrl);
    const workspaceId=pbiCleanId((req.body&&req.body.workspaceId)||(parsed&&parsed.workspaceId));
    const reportId=pbiCleanId((req.body&&req.body.reportId)||(parsed&&parsed.reportId));
    const saved=pbiSaveReportConfig({workspaceId,reportId,embedUrl:(parsed&&parsed.embedUrl)||rawUrl});
    res.json({ok:true,workspaceId:saved.workspaceId,reportId:saved.reportId,embedUrl:saved.embedUrl,public:!!saved.public,source:'server'});
  }catch(e){res.status(500).json({ok:false,error:e.message});}
});

app.get('/api/powerbi/embed-config', async (req,res)=>{
  if(!pbiRoleAllowed(req)) return res.status(403).json({ok:false,error:'Rol no autorizado para visualizar Power BI'});
  const cfg=pbiResolveReportConfig();
  if(!cfg) return res.status(409).json({ok:false,code:'POWERBI_REPORT_NOT_CONFIGURED',error:'Configura una vez el reporte Power BI desde el SGRT'});
  if(cfg.public) return res.json({ok:true,type:'public',embedUrl:cfg.embedUrl,public:true});
  if(!pbiCredentialsConfigured()) return res.status(503).json({ok:false,code:'POWERBI_SERVICE_PRINCIPAL_NOT_CONFIGURED',error:'Faltan credenciales de Power BI Embedded en Azure App Service'});
  try{
    const key=cfg.workspaceId+'|'+cfg.reportId;
    if(pbiEmbedTokenCache.key===key && pbiEmbedTokenCache.token && Date.now()<pbiEmbedTokenCache.expiresAt-5*60*1000){
      return res.json({ok:true,type:'report',reportId:cfg.reportId,workspaceId:cfg.workspaceId,embedUrl:cfg.embedUrl,accessToken:pbiEmbedTokenCache.token,expiration:pbiEmbedTokenCache.expiration,cached:true});
    }
    const reportResp=await pbiApi(`/groups/${encodeURIComponent(cfg.workspaceId)}/reports/${encodeURIComponent(cfg.reportId)}`);
    const report=reportResp.data||{};
    const tokenResp=await pbiApi(`/groups/${encodeURIComponent(cfg.workspaceId)}/reports/${encodeURIComponent(cfg.reportId)}/GenerateToken`,'POST',{accessLevel:'View'});
    const tokenData=tokenResp.data||{};
    if(!tokenData.token) throw new Error('Power BI no devolvió el embed token');
    const expiration=tokenData.expiration||new Date(Date.now()+50*60*1000).toISOString();
    const expiresAt=Date.parse(expiration)||Date.now()+50*60*1000;
    pbiEmbedTokenCache={key,token:tokenData.token,expiration,expiresAt};
    res.json({
      ok:true,
      type:'report',
      reportId:cfg.reportId,
      workspaceId:cfg.workspaceId,
      embedUrl:report.embedUrl||cfg.embedUrl,
      accessToken:tokenData.token,
      expiration,
      cached:false
    });
  }catch(e){
    console.error('❌ Power BI Embedded:',e.message);
    const detail=e&&e.data&&typeof e.data==='object'?e.data:undefined;
    res.status(e.status||502).json({ok:false,code:'POWERBI_EMBED_ERROR',error:e.message,detail});
  }
});



// ================================================================
// ASISTENTE SGRT / DOCUMENTOS / TRANSCRIPCION DE REUNIONES (OPCIONAL)
// ================================================================
// Las claves NUNCA se guardan en el frontend ni en GitHub.
// Proveedor recomendado para piloto: Gemini (puede tener nivel gratuito sujeto
// a los limites vigentes de Google AI Studio). Tambien se conserva OpenAI como
// proveedor opcional. Configura las variables en Azure App Service.
const AI_CFG = {
  provider: String(process.env.AI_PROVIDER || 'auto').trim().toLowerCase(),
  geminiApiKey: String(process.env.GEMINI_API_KEY || '').trim(),
  geminiModel: String(process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim(),
  openaiApiKey: String(process.env.OPENAI_API_KEY || '').trim(),
  openaiModel: String(process.env.OPENAI_MODEL || 'gpt-5').trim(),
  openaiTranscriptionModel: String(process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe').trim()
};

function aiProvider(){
  if(AI_CFG.provider === 'gemini') return AI_CFG.geminiApiKey ? 'gemini' : 'none';
  if(AI_CFG.provider === 'openai') return AI_CFG.openaiApiKey ? 'openai' : 'none';
  if(AI_CFG.geminiApiKey) return 'gemini';
  if(AI_CFG.openaiApiKey) return 'openai';
  return 'none';
}
function aiConfigured(){ return aiProvider() !== 'none'; }
function aiModel(){ return aiProvider()==='gemini' ? AI_CFG.geminiModel : (aiProvider()==='openai' ? AI_CFG.openaiModel : ''); }

async function aiFetchJson(url, options){
  if(typeof fetch!=='function') throw new Error('El servidor requiere Node 18+ para el asistente');
  const r=await fetch(url,options); let data={};
  try{ data=await r.json(); }catch(e){}
  if(!r.ok){
    const detail=data&&data.error&&(data.error.message||data.error)||data.message||('HTTP '+r.status);
    const er=new Error(String(detail)); er.status=r.status; throw er;
  }
  return data;
}

function aiHistoryText(history){
  if(!Array.isArray(history)) return '';
  return history.slice(-16).map(item=>{
    const role=String(item&&item.role||'user').toLowerCase()==='assistant'?'Asistente':'Usuario';
    const content=String(item&&item.content||'').trim();
    return content ? role+': '+content.slice(0,6000) : '';
  }).filter(Boolean).join('\n');
}

function aiInstruction(prompt,context,history){
  const previous=aiHistoryText(history);
  return [
    'Eres el Asistente Inteligente SGRT de Infraestructuras Seguras. Tu prioridad es ayudar dentro del Sistema de Gestion de Riesgos de Terceros (SGRT) y en conceptos directamente relacionados con gestion de riesgos, control interno, terceros, contratos, controles, evidencias, cumplimiento, continuidad, ciberseguridad y tecnologia cuando tenga relacion con riesgo.',
    'ALCANCE ESTRICTO: no respondas preguntas de cultura general, geografia, entretenimiento, deportes, politica, celebridades, recetas, ocio ni otros temas externos al SGRT o a la gestion de riesgos. Si la pregunta esta fuera de alcance, no la contestes: indica brevemente que estas especializado en SGRT y gestion de riesgos y ofrece ejemplos de preguntas que si puedes resolver.',
    'Conversacion natural: si el usuario saluda o pregunta como estas, responde como una conversacion normal, por ejemplo “Hola, muy bien, gracias por preguntar. ¿Como estas tu?” o una variante natural. En saludos no menciones de inmediato el rol, el modulo, porcentajes ni herramientas salvo que el usuario lo pida. Despues puedes ofrecer ayuda con el SGRT de forma breve y natural. Un saludo no abre el alcance a temas externos.',
    'Evita sonar como menu o robot. No conviertas cada turno en una lista de funciones. Si la pregunta es sencilla, responde en una o dos frases y deja que la conversacion avance. Usa secciones, botones conceptuales o pasos solo cuando realmente ayuden.',
    'Tono humano y cercano: si el usuario expresa tristeza, frustracion, cansancio, estres o sentirse abrumado, reconoce lo que dice con una o dos frases calidas, sin diagnosticar ni dramatizar. Luego ofrece reducir la carga dentro del SGRT: explicar una sola pantalla, ir paso a paso, usar flashcards, un quiz corto o un juego. No afirmes ser una persona real.',
    'Puedes usar frases naturales como “claro, te acompano con eso”, “podemos verlo paso a paso” o “si quieres, lo hacemos mas sencillo”, sin caer en exceso de afecto ni infantilizar al usuario.',
    'No conviertas una pregunta normal en un informe, documento, matriz o recomendacion corporativa salvo que el usuario lo solicite o sea claramente necesario para contestar.',
    'Cuando el usuario pregunte "que es" un concepto del dominio, explicalo primero en lenguaje sencillo y, solo si aporta valor, agrega un ejemplo corto o una relacion con SGRT.',
    'Para datos internos o actuales del SGRT (terceros, contratos, tipologias, respuestas, porcentajes, evidencias, riesgos, usuarios o resultados) usa exclusivamente el contexto y los archivos suministrados. Si el dato no esta en el contexto, di que no esta disponible en la informacion recibida.',
    'El contexto puede incluir moduloActual, catalogoModulos y resumenSistema. Usa esos campos para actuar como copiloto de navegacion: si preguntan donde encontrar algo, menciona el nombre exacto de un modulo existente y explica en una frase por que. Nunca inventes una pantalla o modulo que no aparezca en catalogoModulos.',
    'Si el usuario dice que no entiende el sistema, pide ayuda para usarlo, pregunta que hace aqui o cual es el siguiente paso, responde como guia por rol: empieza indicando en negrita su rol y el modulo actual, explica que se hace ahi, luego da una ruta de 3 a 7 pasos usando exclusivamente nombres reales de catalogoModulos y termina con una accion concreta para hacer ahora. No respondas de forma generica.',
    'En esas guias usa Markdown legible: titulo corto, palabras clave en **negrita**, pasos numerados y nombres exactos de modulos. Si un modulo no existe en catalogoModulos, no lo inventes.',
    'Si el usuario pregunta por hojas de vida, expedientes, soportes o archivos y no existe un modulo con ese nombre exacto, dilo con claridad y orienta al modulo real mas cercano segun catalogoModulos, normalmente Documentacion o Evidencia para archivos o Registro de Terceros y Clasificacion para datos del tercero.',
    'Si el usuario pide una vision del sistema completo, usa resumenSistema, dimensiones, riesgos y el modulo actual para decir que esta completo, que falta y donde revisarlo. No declares que todo esta terminado si el contexto muestra pendientes o datos incompletos.',
    'Nunca indiques que un podcast, video o narracion se esta reproduciendo automaticamente. La interfaz exige una accion explicita del usuario para reproducir audio o video.',
    'Nunca mezcles contratos ni atribuyas a un contrato tipologias, respuestas o progreso de otro. Una tipologia pertenece al contrato en el que fue configurada.',
    'Conceptos SGRT: una dimension o tipologia es un dominio/categoria de control o riesgo evaluado; el Administrador de Riesgos habilita tipologias por contrato; el Evaluador diligencia controles y evidencias; el Analisis de Riesgos utiliza terceros, contratos y tipologias configurados.',
    'En temas de riesgo, control interno, ciberseguridad, tecnologia, software, bases de datos, nube o sistemas de informacion, puedes explicar conceptos, ejemplos, buenas practicas y alternativas; diferencia siempre los conceptos generales de los datos reales del SGRT.',
    'Cuando se solicite un informe, acta, carta, minuta, procedimiento, plan, matriz, propuesta, correo, presentacion, guion o contenido para video, genera una salida completa y lista para usar, siguiendo exactamente el formato solicitado.',
    'Si el usuario pide un video, prepara contenido audiovisual breve y claro: titulo, objetivo, escenas o secciones, texto visible y narracion sugerida. La interfaz puede convertir tu respuesta en un video visual y en una presentacion narrada.',
    'Si el usuario pide un podcast, no hagas una simple lectura. Prepara un PODCAST EXPLICADO: el PRESENTADOR hace preguntas naturales para guiar a alguien que no conoce el tema y el EXPERTO explica paso a paso, aclara terminos, interpreta lo importante y resume aprendizajes. Usa apertura, desarrollo, ejemplos respaldados por la fuente y cierre. Cuando se base en SGRT o archivos, no agregues hechos no respaldados.',
    'Si el usuario pide una infografia, organiza el contenido en un titulo corto, una bajada, entre 3 y 6 bloques visuales con ideas clave y un cierre. Prioriza frases breves y datos verificables.',
    'Aprendizaje SGRT: si pide flashcards, quiz, juego, evaluacion, practica o capacitacion, conviertelo en una experiencia pedagogica sobre el SGRT. Usa exclusivamente modulos reales del catalogoModulos para navegacion y fases. Para conceptos de riesgo puedes explicar riesgo, control, evidencia, tercero, tipologia, riesgo inherente, riesgo residual, ambiente de control, analisis y seguimiento. Incluye preguntas claras, respuesta correcta y explicacion corta. No mezcles contratos ni inventes modulos.',
    'Flashcards personalizadas: si el superadministrador entrega sus propias preguntas o un banco de examen y pide convertirlo en flashcards, conserva el sentido de cada pregunta y genera una respuesta breve y correcta solo dentro del SGRT/gestion de riesgos. Si se solicita formato de importacion para el constructor, devuelve exclusivamente una tarjeta por linea con: TARJETA | pregunta | respuesta. Omite preguntas externas al alcance en vez de contestarlas.',
    'Si pide aprender todo el sistema, adapta el recorrido al rol detectado y al catalogoModulos recibido: explica para que sirve cada modulo, que fase representa, que hace normalmente el usuario alli y como se conecta con el siguiente paso.',
    'Si el usuario pide un reporte o informe, genera una pieza profesional lista para presentar: titulo, resumen ejecutivo, contexto/alcance, hallazgos, analisis e interpretacion, implicaciones o riesgos, recomendaciones/acciones y conclusion. Conserva exactamente cifras y referencias disponibles. Si falta informacion, indicalo expresamente en lugar de inventarla.',
    'Si el usuario pide un resumen o una explicacion de algo que esta viendo, y la respuesta necesita contexto, organiza de forma natural con secciones como: Que estas viendo, Resumen, Que significa, Puntos clave y Que hacer a continuacion. No fuerces esta estructura en saludos o preguntas simples.',
    'Modo Studio: cuando la solicitud diga que debes transformar una FUENTE en resumen, podcast, infografia o video, usa EXCLUSIVAMENTE esa FUENTE para los hechos. Puedes reorganizar, simplificar y explicar, pero no incorporar datos externos no presentes en la fuente.',
    'Si hay archivos adjuntos, leelos y basa el analisis en su contenido. Puedes resumirlos, explicar que contienen, detectar hallazgos, inconsistencias, riesgos, controles, faltantes y oportunidades de mejora, y sugerir como aprovecharlos dentro del SGRT. Si son varios, relaciona coincidencias, diferencias y pendientes sin inventar contenido ausente.',
    'Si un archivo adjunto contiene informacion que no corresponde al SGRT, analiza solamente lo que sea util desde la perspectiva de gestion de riesgos, controles, cumplimiento, terceros o documentacion del sistema; no uses el archivo como excusa para responder temas externos.',
    'Estilo: espanol claro, cercano y profesional. Evita sonar robotico, evita frases de relleno y no repitas la pregunta del usuario innecesariamente.',
    'Formato: para respuestas de mas de dos oraciones empieza con un titulo Markdown breve (### Titulo). Para saludos o respuestas muy cortas no hace falta titulo. Usa listas o tablas solo cuando ayuden.',
    'No uses emojis como decoracion. No menciones el proveedor del modelo ni digas que eres una IA salvo que el usuario lo pregunte expresamente.',
    'Mantiene continuidad con la conversacion previa: recuerda el tema y referencias recientes dentro del historial recibido, pero da prioridad absoluta a la solicitud actual.',
    'Contexto SGRT (JSON): '+JSON.stringify(context||{}),
    previous ? ('Conversacion previa:\n'+previous) : '',
    'Solicitud actual: '+String(prompt||'')
  ].filter(Boolean).join('\n');
}

function parseDataUrl(dataUrl){
  const raw=String(dataUrl||'');
  const m=raw.match(/^data:([^;,]+)?(?:;[^,]*)?;base64,(.+)$/s);
  if(!m) return null;
  return {mimeType:String(m[1]||'application/octet-stream'),base64:m[2]};
}

function openaiOutputText(data){
  if(data&&typeof data.output_text==='string'&&data.output_text.trim()) return data.output_text.trim();
  const out=[];
  (data&&data.output||[]).forEach(item=>{
    (item&&item.content||[]).forEach(c=>{ if(c&&typeof c.text==='string') out.push(c.text); });
  });
  return out.join('\n').trim();
}

function geminiOutputText(data){
  const out=[];
  (data&&data.candidates||[]).forEach(c=>{
    (c&&c.content&&c.content.parts||[]).forEach(p=>{ if(p&&typeof p.text==='string') out.push(p.text); });
  });
  return out.join('\n').trim();
}

async function geminiRespond(prompt,context,files,history){
  if(!AI_CFG.geminiApiKey) throw new Error('GEMINI_API_KEY no esta configurada en Azure');
  const parts=[{text:aiInstruction(prompt,context,history)}];
  const arr=(Array.isArray(files)?files:(files?[files]:[])).filter(Boolean).slice(0,4);
  let totalBytes=0;
  for(const file of arr){
    if(!file||!file.dataUrl) continue;
    const parsed=parseDataUrl(file.dataUrl);
    if(!parsed) throw new Error('Uno de los archivos adjuntos no tiene un formato valido');
    const bytes=Buffer.from(parsed.base64,'base64').length; totalBytes+=bytes;
    if(bytes>12*1024*1024) throw new Error('Cada archivo adjunto debe ser de hasta 12 MB');
    parts.push({inlineData:{mimeType:String(file.type||parsed.mimeType||'application/octet-stream'),data:parsed.base64}});
  }
  if(totalBytes>18*1024*1024) throw new Error('Los archivos adjuntos juntos deben ser de hasta 18 MB');
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(AI_CFG.geminiModel)+':generateContent';
  const data=await aiFetchJson(url,{
    method:'POST',
    headers:{'x-goog-api-key':AI_CFG.geminiApiKey,'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{temperature:0.25}})
  });
  return geminiOutputText(data)||'El asistente no devolvio texto.';
}

async function openaiRespond(prompt,context,files,history){
  if(!AI_CFG.openaiApiKey) throw new Error('OPENAI_API_KEY no esta configurada en Azure');
  const content=[{type:'input_text',text:aiInstruction(prompt,context,history)}];
  const arr=(Array.isArray(files)?files:(files?[files]:[])).filter(Boolean).slice(0,4);
  let totalBytes=0;
  for(const file of arr){
    if(!file||!file.dataUrl) continue;
    const parsed=parseDataUrl(file.dataUrl); if(parsed) totalBytes+=Buffer.from(parsed.base64,'base64').length;
    if(/^image\//i.test(String(file.type||''))) content.push({type:'input_image',image_url:String(file.dataUrl)});
    else if(parsed && (/^text\//i.test(String(file.type||parsed.mimeType||'')) || /(?:json|csv|xml|markdown)/i.test(String(file.type||parsed.mimeType||'')))) {
      const txt=Buffer.from(parsed.base64,'base64').toString('utf8').slice(0,180000);
      content.push({type:'input_text',text:'ARCHIVO ADJUNTO: '+String(file.name||'archivo')+'\n---\n'+txt+'\n--- FIN ARCHIVO ---'});
    } else content.push({type:'input_file',filename:String(file.name||'archivo'),file_data:parsed?('data:'+String(file.type||parsed.mimeType||'application/octet-stream')+';base64,'+parsed.base64):String(file.dataUrl||'')});
  }
  if(totalBytes>18*1024*1024) throw new Error('Los archivos adjuntos juntos deben ser de hasta 18 MB');
  const data=await aiFetchJson('https://api.openai.com/v1/responses',{
    method:'POST',headers:{'Authorization':'Bearer '+AI_CFG.openaiApiKey,'Content-Type':'application/json'},
    body:JSON.stringify({model:AI_CFG.openaiModel,input:[{role:'user',content}]})
  });
  return openaiOutputText(data)||'El asistente no devolvio texto.';
}

function aiProviderOrder(){
  if(AI_CFG.provider==='gemini') return AI_CFG.geminiApiKey?['gemini']:[];
  if(AI_CFG.provider==='openai') return AI_CFG.openaiApiKey?['openai']:[];
  const out=[];
  if(AI_CFG.geminiApiKey) out.push('gemini');
  if(AI_CFG.openaiApiKey) out.push('openai');
  return out;
}
function aiTransientError(e){
  const m=String(e&&e.message||e||'').toLowerCase();
  const st=Number(e&&e.status||0);
  return st===408||st===409||st===429||st===500||st===502||st===503||st===504||
    /high demand|temporar|overload|rate limit|resource exhausted|resource_exhausted|unavailable|try again|timeout|timed out|capacity/.test(m);
}
function aiSleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function aiRespondWithProvider(provider,prompt,context,files,history){
  if(provider==='gemini') return geminiRespond(prompt,context,files,history);
  if(provider==='openai') return openaiRespond(prompt,context,files,history);
  throw new Error('Proveedor de asistencia no reconocido');
}
async function aiRespond(prompt,context,files,history){
  const providers=aiProviderOrder();
  if(!providers.length) throw new Error('No hay un proveedor de asistencia configurado. Define GEMINI_API_KEY u OPENAI_API_KEY en Azure');
  let lastError=null;
  for(const provider of providers){
    for(let attempt=0;attempt<2;attempt++){
      try{
        return await aiRespondWithProvider(provider,prompt,context,files,history);
      }catch(e){
        lastError=e;
        console.warn('Assistant provider '+provider+' attempt '+(attempt+1)+':',e.message);
        if(!aiTransientError(e)||attempt===1) break;
        await aiSleep(attempt===0?650:1200);
      }
    }
  }
  if(lastError){
    lastError.code=aiTransientError(lastError)?'AI_TEMPORARY_UNAVAILABLE':(lastError.code||'AI_PROVIDER_ERROR');
    throw lastError;
  }
  throw new Error('No fue posible obtener respuesta del asistente');
}


function aiDomainDecision(prompt,files){
  const p=String(prompt||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const hasFiles=Array.isArray(files)&&files.length>0;
  if(hasFiles) return {allowed:true,reason:'files'};
  if(!p.trim()) return {allowed:true,reason:'empty'};
  if(/^(?:(?:hola|hello|buenas|buenos dias|buenas tardes|buenas noches)(?:[,.! ]+(?:como estas|que tal|como vas))?|como estas|que tal|como vas|bien|muy bien|todo bien|y tu|gracias|muchas gracias|listo|ok|vale)[\s,.!?¿¡]*$/.test(p.trim())) return {allowed:true,reason:'greeting'};
  if(/\b(me siento triste|estoy triste|me siento mal|estoy frustrad|me frustra|estoy cansad|me siento cansad|me abruma|estoy estresad|me siento estresad)\b/.test(p)) return {allowed:true,reason:'supportive'};
  const domain=/\b(sgrt|riesg|tercer|proveedor|contrat|tipolog|clasific|control|ambiente de control|evidenc|documentacion|cumplim|auditor|continuidad|ciberseg|seguridad de la informacion|matriz|probabilidad|impacto|inherente|residual|tratamiento|mitig|seguimiento|hallazgo|incidente|vulnerab|amenaza|activo|iso 27001|iso 31000|power bi|reporte|informe|evaluador|administrador de riesgos|usuario|rol|sharepoint|azure|base de datos|pregunta|cuestionario|no aplica|observacion|soporte|expediente|hoja de vida|politica de riesgo|apetito de riesgo|tolerancia de riesgo|kri|kpi)\b/.test(p);
  const navigation=/\b(donde|como uso|como se usa|no entiendo|ayudame|guia|siguiente paso|que hago aqui|mi rol|modulo|pantalla)\b/.test(p)||/no entiendo (?:este |el )?sistema|como se usa (?:este |el )?sistema|ayudame con (?:este |el )?sistema/.test(p);
  const creation=/\b(reporte|informe|presentacion|powerpoint|ppt|podcast|infografia|video|resumen|acta|matriz|plan de accion|flashcard|flashcards|tarjetas de estudio|quiz|juego|evaluacion|examen|practica|repaso|aprender|estudiar|capacitacion)\b/.test(p);
  return {allowed:domain||navigation||creation,reason:domain?'domain':navigation?'navigation':creation?'creation':'outside'};
}
function aiOutOfScopeText(){
  return '### Estoy especializado en SGRT\nMi alcance es el **Sistema de Gestion de Riesgos de Terceros** y temas directamente relacionados con **gestion de riesgos, controles, terceros, contratos, evidencias, cumplimiento, continuidad y ciberseguridad aplicada al riesgo**.\n\nNo respondo preguntas externas al sistema o de cultura general.\n\nPuedes preguntarme, por ejemplo: **“¿que es un riesgo?”**, **“¿donde veo las evidencias?”**, **“¿como clasifico un tercero?”**, **“analiza este documento”** o **“genera un reporte del contrato actual”**.';
}

app.get('/api/ai/status',(req,res)=>res.json({
  ok:true,
  configured:aiConfigured(),
  provider:aiConfigured()?aiProvider():'',
  model:aiConfigured()?aiModel():''
}));

app.post('/api/ai/assist',async(req,res)=>{
  try{
    if(!aiConfigured()) return res.status(503).json({ok:false,code:'AI_NOT_CONFIGURED',error:'Configura GEMINI_API_KEY u OPENAI_API_KEY en Azure App Service'});
    const body=req.body||{};
    const incomingFiles=Array.isArray(body.files)&&body.files.length?body.files:(body.file?[body.file]:[]);
    const scope=aiDomainDecision(body.prompt||'',incomingFiles);
    if(!scope.allowed) return res.json({ok:true,text:aiOutOfScopeText(),scope:'sgrt_only'});
    const text=await aiRespond(body.prompt||'',body.context||{},incomingFiles,body.history||[]);
    res.json({ok:true,text});
  }catch(e){
    console.error('Assistant:',e.message);
    const transient=aiTransientError(e);
    res.status(transient?503:(e.status||500)).json({
      ok:false,
      code:transient?'AI_TEMPORARY_UNAVAILABLE':(e.code||'AI_PROVIDER_ERROR'),
      transient,
      error:transient?'El servicio generativo está temporalmente ocupado. El asistente puede continuar con la guía local del SGRT.':e.message,
      detail:transient?String(e.message||''):''
    });
  }
});

app.post('/api/ai/transcribe',async(req,res)=>{
  try{
    if(!aiConfigured()) return res.status(503).json({ok:false,code:'AI_NOT_CONFIGURED',error:'Configura GEMINI_API_KEY u OPENAI_API_KEY en Azure App Service'});
    const body=req.body||{},dataUrl=String(body.dataUrl||''),parsed=parseDataUrl(dataUrl);
    if(!parsed) return res.status(400).json({ok:false,error:'Archivo de audio/video invalido'});
    const buffer=Buffer.from(parsed.base64,'base64'),provider=aiProvider();
    let transcript='';
    if(provider==='gemini'){
      if(buffer.length>18*1024*1024) return res.status(413).json({ok:false,error:'Para transcripcion directa con Gemini, el archivo debe ser de hasta 18 MB'});
      transcript=await geminiRespond(
        'Transcribe de forma fiel el contenido hablado de esta grabacion. Conserva nombres, cifras, fechas y compromisos cuando sean audibles. Entrega solo la transcripcion, sin inventar informacion.',
        body.context||{},
        [{name:String(body.fileName||'reunion'),type:String(body.mimeType||parsed.mimeType),dataUrl}],
        body.history||[]
      );
    }else{
      if(buffer.length>24*1024*1024) return res.status(413).json({ok:false,error:'Para transcripcion directa, el archivo debe ser de hasta 24 MB'});
      if(typeof FormData!=='function'||typeof Blob!=='function') throw new Error('El servidor requiere Node 18+ para transcribir archivos');
      const form=new FormData();
      form.append('file',new Blob([buffer],{type:String(body.mimeType||parsed.mimeType||'application/octet-stream')}),String(body.fileName||'reunion.mp4'));
      form.append('model',AI_CFG.openaiTranscriptionModel);
      const tr=await aiFetchJson('https://api.openai.com/v1/audio/transcriptions',{
        method:'POST',headers:{'Authorization':'Bearer '+AI_CFG.openaiApiKey},body:form
      });
      transcript=String(tr.text||'').trim();
    }
    const summary=await aiRespond([
      'Genera un acta o informe practico a partir de la siguiente transcripcion.',
      'Incluye: objetivo, temas tratados, decisiones, compromisos, responsable si se menciona, fechas si se mencionan, riesgos/hallazgos y proximos pasos.',
      'No inventes nombres, fechas ni compromisos.',
      body.prompt?('Instruccion adicional: '+body.prompt):'',
      'TRANSCRIPCION:',transcript
    ].join('\n'),body.context||{},null,body.history||[]);
    res.json({ok:true,transcript,summary});
  }catch(e){console.error('Transcribe:',e.message);res.status(e.status||500).json({ok:false,error:e.message});}
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
