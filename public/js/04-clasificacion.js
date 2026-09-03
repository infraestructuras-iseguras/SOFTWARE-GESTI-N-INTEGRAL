

// ════════════════════════════════════════════════════════
// SISTEMA DE CLASIFICACIÓN DINÁMICA — TipologiaRiesgo
// ConfiguracionPregunta · ResultadoEvaluacion
// ════════════════════════════════════════════════════════

// ─── MOCK DATA BASE DE DATOS ─────────────────────────
// Simula TipologiaRiesgo + ConfiguracionPregunta

// ════════════════════════════════════════════════════════
// BASE DE DATOS CENTRAL DE TERCEROS
// ════════════════════════════════════════════════════════
var TERCEROS_DB = {
};
window.TERCEROS_DB = TERCEROS_DB;

// 🎯 DATOS DEMO COMPLETOS PARA PRESENTACIÓN - Se cargan con un clic
window.DATOS_DEMO_PRESENTACION = {
  "860123456": {
    nit: "860123456",
    nombre: "Banco Popular Colombia",
    domicilio: "Calle 60 #43-45, Medellín",
    supervisor: "Juan Carlos Pérez",
    entidad: "colpensiones",
    estado: "Activo",
    fecha_creacion: "2024-01-15T00:00:00Z",
    supervisores: [
      { nombre: "Juan Carlos Pérez", cargo: "Supervisor Senior", proceso: "Gestión Financiera" }
    ],
    contratos: [
      { 
        num: "CT-2024-BANCO-001", 
        objeto: "Servicios de Crédito y Cobranza", 
        fini: "2024-01-15", 
        ffin: "2024-12-31", 
        estado: "Aprobado", 
        valor: "250000000",
        supervisor_asociado: "Juan Carlos Pérez",
        estado_aprobacion: "APROBADO",
        fecha_aprobacion: "2024-02-01"
      },
      { 
        num: "CT-2024-BANCO-002", 
        objeto: "Auditoría de Riesgos Operacionales", 
        fini: "2024-02-01", 
        ffin: "2024-06-30", 
        estado: "Aprobado",
        valor: "180000000",
        supervisor_asociado: "Juan Carlos Pérez",
        estado_aprobacion: "APROBADO",
        fecha_aprobacion: "2024-02-10"
      },
      { 
        num: "CT-2024-BANCO-003", 
        objeto: "Gestión de Cumplimiento Normativo", 
        fini: "2024-03-01", 
        ffin: "2024-12-31", 
        estado: "En Ejecucion",
        valor: "150000000",
        supervisor_asociado: "Juan Carlos Pérez",
        estado_aprobacion: "PENDIENTE",
        fecha_aprobacion: null
      }
    ],
    dims: [
      { tipologia: "Operativo", nivel: 4, calificacion: 4 },
      { tipologia: "Continuidad de Negocio", nivel: 4, calificacion: 4 },
      { tipologia: "Seguridad de la Información", nivel: 5, calificacion: 5 },
      { tipologia: "Cumplimiento", nivel: 4, calificacion: 4 },
      { tipologia: "Fraude y Corrupción", nivel: 3, calificacion: 3 },
      { tipologia: "LAFT", nivel: 4, calificacion: 4 }
    ],
    prom: 4.0,
    zona: "ALTO",
    evaluaciones: [{ id: "e1", tipologia: "Operativo", completada: true, calificacion: 4, fecha_inicio: "2024-02-01", fecha_fin: "2024-02-15" }],
    nivel_riesgo: "ALTO"
  },
  "901226600": {
    nit: "901226600",
    nombre: "Seguros Monterrey New York Life",
    domicilio: "Carrera 7 #156-85, Bogotá",
    supervisor: "María Rodríguez García",
    entidad: "colpensiones",
    estado: "Activo",
    fecha_creacion: "2024-01-10T00:00:00Z",
    supervisores: [
      { nombre: "María Rodríguez García", cargo: "Coordinadora de Riesgos", proceso: "Evaluación de Pólizas" }
    ],
    contratos: [
      { num: "CT-2024-SMN-001", objeto: "Pólizas de Seguros Complementarios", fini: "2024-01-01", ffin: "2024-12-31", estado: "En Ejecucion", supervisor_asociado: "María Rodríguez García" }
    ],
    dims: [
      { tipologia: "Operativo", nivel: 3, calificacion: 3 },
      { tipologia: "Continuidad de Negocio", nivel: 3, calificacion: 3 },
      { tipologia: "Seguridad de la Información", nivel: 4, calificacion: 4 },
      { tipologia: "Cumplimiento", nivel: 3, calificacion: 3 },
      { tipologia: "Fraude y Corrupción", nivel: 2, calificacion: 2 },
      { tipologia: "LAFT", nivel: 3, calificacion: 3 }
    ],
    prom: 3.0,
    zona: "MEDIO",
    evaluaciones: [{ id: "e2", tipologia: "Cumplimiento", completada: true, calificacion: 3, fecha_inicio: "2024-02-10", fecha_fin: "2024-02-25" }],
    nivel_riesgo: "MEDIO"
  },
  "830016840": {
    nit: "830016840",
    nombre: "IBM Colombia",
    domicilio: "Calle 72 #13-45, Bogotá",
    supervisor: "Carlos Mendoza Flores",
    entidad: "colpensiones",
    estado: "Activo",
    fecha_creacion: "2024-01-05T00:00:00Z",
    supervisores: [
      { nombre: "Carlos Mendoza Flores", cargo: "Jefe de Seguridad Informática", proceso: "Infraestructura Tecnológica" }
    ],
    contratos: [
      { num: "CT-2024-IBM-001", objeto: "Servicios de Infraestructura y Cloud Computing", fini: "2024-01-10", ffin: "2025-01-09", estado: "En Ejecucion", supervisor_asociado: "Carlos Mendoza Flores" },
      { num: "CT-2024-IBM-002", objeto: "Soporte Técnico 24/7", fini: "2024-01-10", ffin: "2025-01-09", estado: "En Ejecucion", supervisor_asociado: "Carlos Mendoza Flores" }
    ],
    dims: [
      { tipologia: "Operativo", nivel: 5, calificacion: 5 },
      { tipologia: "Continuidad de Negocio", nivel: 5, calificacion: 5 },
      { tipologia: "Seguridad de la Información", nivel: 5, calificacion: 5 },
      { tipologia: "Cumplimiento", nivel: 4, calificacion: 4 },
      { tipologia: "Fraude y Corrupción", nivel: 4, calificacion: 4 },
      { tipologia: "LAFT", nivel: 4, calificacion: 4 }
    ],
    prom: 4.5,
    zona: "EXTREMO",
    evaluaciones: [
      { id: "e3", tipologia: "Seguridad de la Información", completada: true, calificacion: 5, fecha_inicio: "2024-02-05", fecha_fin: "2024-02-20" },
      { id: "e4", tipologia: "Continuidad de Negocio", completada: true, calificacion: 5, fecha_inicio: "2024-02-15", fecha_fin: "2024-03-01" }
    ],
    nivel_riesgo: "EXTREMO"
  }
};

// 🔄 Función para cargar TODOS los datos completos
window.cargarDatosDemo = function() {
  try {
    // 🎯 Generador de datos completos
    const NOMBRES_EMPRESAS = [
      "Banco Popular Colombia", "Seguros Monterrey New York Life", "IBM Colombia",
      "Telefónica", "Sophos Group", "Accenture Colombia", "Deloitte", "PwC Colombia",
      "SURA Seguros", "AXA Seguros", "Allianz Colombia", "Zurich Seguros",
      "Tecnopetróleo", "Ecopetrol Refinería", "ISA Sistemas", "Enertech Solutions",
      "Consultora Mayor", "Auditoría Global", "Legal & Tax Advisors", "Gestión Corporativa S.A.",
      "Transporte Seguro", "Logística Express", "Distribuidora Nacional", "Almacenes Modernos",
      "Salud Integral", "Clínica Especializada", "Farmacéutica Premium", "Laboratorio Diagnóstico",
      "Educación Digital", "Universidad Corporativa", "Capacitación Avanzada", "E-Learning Solutions",
      "Energía Renovable", "Sistemas Solares", "Parque Eólico", "Distribuidora Eléctrica",
      "Telecomunicaciones Plus", "Internet Banda Ancha", "Servicios Cloud", "Data Center Colombia",
      "Consultoría Financiera", "Banca de Inversión", "Asesoría Tributaria", "Contabilidad Master"
    ];
    
    const ZONAS_RIESGO = ["EXTREMO", "ALTO", "MEDIO", "BAJO"];
    const ESTADOS_CONTRATO = ["Aprobado", "En Ejecucion", "Pendiente"];
    
    function generarNombre(idx) {
      return NOMBRES_EMPRESAS[idx % NOMBRES_EMPRESAS.length];
    }
    
    function generarDatos(nit, nombre, supervisor) {
      const idx = parseInt(nit);
      const zona = ZONAS_RIESGO[idx % ZONAS_RIESGO.length];
      const prom = (2 + (idx % 3)) + (Math.random() * 0.9);
      
      const supervisores = [
        { nombre: "Juan García " + idx, cargo: "Supervisor", proceso: "Gestión" },
        { nombre: "María López " + (idx+1), cargo: "Coordinador", proceso: "Evaluación" }
      ];
      
      const ESTADOS_APROB = ["APROBADO", "NO_APROBADO", "PENDIENTE"];
      const contratos = [
        { 
          num: `CT-2024-${idx}-001`, 
          objeto: "Servicios Principales y Consultoría", 
          fini: "2024-01-15", 
          ffin: "2024-12-31",
          estado: ESTADOS_CONTRATO[idx % 3],
          valor: (100000000 + idx * 1000000).toString(),
          supervisor_asociado: supervisores[0].nombre,
          estado_aprobacion: ESTADOS_APROB[idx % 3]
        },
        { 
          num: `CT-2024-${idx}-002`, 
          objeto: "Soporte Técnico y Mantenimiento", 
          fini: "2024-02-01", 
          ffin: "2024-06-30",
          estado: ESTADOS_CONTRATO[(idx + 1) % 3],
          valor: (50000000 + idx * 500000).toString(),
          supervisor_asociado: supervisores[1].nombre,
          estado_aprobacion: ESTADOS_APROB[(idx + 1) % 3]
        }
      ];
      
      return {
        nit: nit,
        nombre: nombre,
        domicilio: `Calle ${(idx % 100) + 1} #${(idx % 50) + 10}-${(idx % 90) + 5}, Bogotá`,
        supervisor: supervisor,
        entidad: "colpensiones",
        estado: "Activo",
        fecha_creacion: new Date(2024, 0, Math.floor(idx % 28) + 1).toISOString(),
        supervisores: supervisores,
        contratos: contratos,
        dims: [
          { tipologia: "Operativo", nivel: (idx % 5) + 1, calificacion: (idx % 5) + 1 },
          { tipologia: "Continuidad de Negocio", nivel: ((idx + 1) % 5) + 1, calificacion: ((idx + 1) % 5) + 1 },
          { tipologia: "Seguridad de la Información", nivel: ((idx + 2) % 5) + 1, calificacion: ((idx + 2) % 5) + 1 },
          { tipologia: "Cumplimiento", nivel: ((idx + 3) % 5) + 1, calificacion: ((idx + 3) % 5) + 1 },
          { tipologia: "Fraude y Corrupción", nivel: ((idx % 5) + 1), calificacion: ((idx % 5) + 1) },
          { tipologia: "LAFT", nivel: ((idx + 1) % 5) + 1, calificacion: ((idx + 1) % 5) + 1 }
        ],
        prom: parseFloat(prom.toFixed(1)),
        zona: zona,
        evaluaciones: [
          { id: `e${nit}_1`, tipologia: "Operativo", completada: idx % 2 === 0, calificacion: (idx % 5) + 1, fecha_inicio: "2024-02-01", fecha_fin: "2024-02-15", respuestas: { "101": "Si", "102": "Si", "103": "Parcialmente" } },
          { id: `e${nit}_2`, tipologia: "Cumplimiento", completada: idx % 3 === 0, calificacion: ((idx + 1) % 5) + 1, fecha_inicio: "2024-02-10", fecha_fin: "2024-02-25", respuestas: { "401": "Si", "402": "Si" } },
          { id: `e${nit}_3`, tipologia: "Seguridad de la Información", completada: idx % 4 === 0, calificacion: ((idx + 2) % 5) + 1, fecha_inicio: "2024-02-15", fecha_fin: "2024-03-01", respuestas: { "301": "Si", "302": "Si", "303": "Si" } }
        ],
        nivel_riesgo: zona
      };
    }
    
    // Generar para TODOS los NITs
    window.TERCEROS_DB = {};
    const nits = ["860005080", "901226600", "830016840"];
    for(let i = 5; i <= 47; i++) {
      nits.push(i.toString());
    }
    
    nits.forEach((nit, idx) => {
      const nombre = generarNombre(idx);
      const supervisor = "Vicepresidencia de Operaciones";
      window.TERCEROS_DB[nit] = generarDatos(nit, nombre, supervisor);
    });
    
    // Guardar en localStorage
    localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
    // 🔄 GUARDAR EN SNAPSHOT PRINCIPAL PARA PERSISTENCIA
    window._lsSave && window._lsSave();
    
    // Renderizar
    if(typeof clsRender === 'function') clsRender();
    if(typeof clsInitDash === 'function') clsInitDash();
    
    const msg = '✅ ' + Object.keys(window.TERCEROS_DB).length + ' terceros COMPLETOS cargados!';
    console.log(msg);
    if(typeof showToast === 'function') showToast(msg, 'success', 5000);
  } catch(e) {
    console.error('❌ Error:', e);
    if(typeof showToast === 'function') showToast('❌ Error cargando datos: ' + e.message, 'error', 4000);
  }
};


// LIMPIAR LOCALSTORAGE AL INICIALIZAR - SISTEMA LIMPIO PARA PRUEBAS
// ⭐ DESHABILITADO: Esto borraba TODOS los datos al recargar
// (function(){
//   try{
//     var keysToDelete = [];
//     for(var i = 0; i < localStorage.length; i++){
//       var key = localStorage.key(i);
//       if(key && key.startsWith('sgrt_')){
//         keysToDelete.push(key);
//       }
//     }
//     keysToDelete.forEach(function(key){
//       localStorage.removeItem(key);
//     });
//     console.log('Sistema limpiado: ' + keysToDelete.length + ' keys eliminadas');
//   }catch(e){console.error(e);}
// })();

// ── TIPOLOGÍAS INDEPENDIENTES POR CONTRATO ────────────────────────
// Estas 3 tipologías se evalúan DE MANERA INDEPENDIENTE para cada contrato
// Las demás tipologías se evalúan SIN CONTRATO (global por tercero)
var TIPOLOGIAS_INDEPENDIENTES_CONTRATO = [
  'Operacional',
  'Continuidad de Negocio',
  'Seguridad de la Información y Ciberseguridad'
];
window.TIPOLOGIAS_INDEPENDIENTES_CONTRATO = TIPOLOGIAS_INDEPENDIENTES_CONTRATO;

// Cuestionario state
var nitActual = null; window.nitActual = nitActual;
var CUEST_RESPUESTAS = {}; window.CUEST_RESPUESTAS = CUEST_RESPUESTAS;
var CUEST_CTRL_CUSTOM = {}; window.CUEST_CTRL_CUSTOM = CUEST_CTRL_CUSTOM;
const TIPOLOGIAS_DB = {"default": [{"id_tipologia": 1, "nombre_tipologia": "Riesgo Operacional", "clave": "op", "activo": true, "descripcion": "Evalua los procesos, riesgos y controles operacionales del tercero.", "preguntas": [{"id_pregunta": 101, "control": "Identificación de riesgos", "texto": "¿Se cuenta con una metodología de identificación de riesgos operacionales(potenciales y ocurridos) asociados a cada una de las actividades de los procesos requeridos para la prestación del servicio a la organización?", "evidencia": "1. Matriz de riesgo o documento identificando los riesgos operacionales que se pueden materializar en el flujo de actividades para el logro de la prestación del servicio a la organización", "activo": true}, {"id_pregunta": 102, "control": "Medición de la probabilidad de ocurrencia de los riesgos operacionales y su impacto.", "texto": "¿Se cuenta con el perfil de riesgo inherente de los procesos usados para la prestación del servicio a la organización, considerando factores cualitativos y/o cuantitativos en la metodología de medición?", "evidencia": "1. Perfil de riesgo inherente de las actividades asociadas a los procesos usados para la prestación del servicio con la organización 2. Definición de factores cualitativos y/o cuantitativos para la medición del riesgo", "activo": true}, {"id_pregunta": 103, "control": "Medidas para controlar los riesgos inherentes.", "texto": "¿Se tiene identificados los controles, y la medición del perfil de riesgo residual para las actividades de los procesos usados en la prestación del servicio?", "evidencia": "1. Documento con los controles implementados para la mitigación de los riesgos identificados en la prestación del servicio para la organización. 2. Perfil de riesgo residual de los riesgos identificados y gestionados en la prestación del servicio. 3. Estrategias implementadas que responden al tratamiento de los riesgos (aceptación, eliminación, transferencia) ubicados fuera del apetito de riesgo definido por la organización.", "activo": true}, {"id_pregunta": 104, "control": "Monitoreo periódico del perfil de riesgo y de la exposición a pérdidas.", "texto": "¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?", "evidencia": "1. Documento donde se observe las actividades efectuadas de monitoreo y seguimiento a los planes de acción, riesgos residuales y controles.", "activo": true}, {"id_pregunta": 105, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con un procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo materializados en la prestación del servicio a la organización.", "evidencia": "1. Documento con el procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo operacional. 2. Bitácora con el registro de eventos ocurridos durante la prestación del servicio a la organización. 3. Reporte a la organización de lecciones aprendidas y acciones implementadas .", "activo": true}, {"id_pregunta": 106, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con protocolo de comunicación con la organización ante la identificación de eventos de riesgo, que impacten o puedan impactar el servicio contratado?", "evidencia": "1. Protocolo de comunicación. 2. Canales de comunicación definidos. 3. Divulgación del protocolo y canales de comunicación a los colaboradores que participan en la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 107, "control": "Planes de capacitación sobre el sistema de gestión de riesgo", "texto": "¿Se cuenta con un plan de capacitación que considere la gestión de los riesgos operacionales a los funcionarios que participan en la prestación del servicio a la organización? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Plan o cronograma de capacitación a los funcionarios sobre la prestación del servicio a la organización, los riesgos que se pueden materializar y los controles para la mitigación de los escenarios de riesgo identificados. 2. Bitácora de registro de las capacitaciones impartidas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 108, "control": "Diligencia de cuarta parte", "texto": "¿Los acuerdos contractuales con las cuartas partes incluyen los requisitos de control definidos por la organización? '¿Se realizan evaluaciones de riesgos antes de la incorporación de terceros en la prestación del servicio a la organización?", "evidencia": "1. Listado de cuartas partes involucradas en la prestación del servicio. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las cuartas partes. 3. Clausulas contractuales con las cuartas partes que incluyan los requisitos de control definidos por la organización 4. Riesgos identificados y gestionados por las cuartas partes que afecten la prestación del servicio a la organización.", "activo": true}]}, {"id_tipologia": 2, "nombre_tipologia": "Continuidad de Negocio", "clave": "cn", "activo": true, "descripcion": "Evalua la resiliencia, planes de continuidad y capacidad de recuperacion del tercero.", "preguntas": [{"id_pregunta": 201, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un Plan de continuidad del negocio actualizado?", "evidencia": "1. Plan de continuidad del negocio", "activo": true}, {"id_pregunta": 202, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Dentro de la matriz de riesgos, se encuentran identificados, y analizados los riesgos que afectan la continuidad del negocio para los servicios contratos por la organización?", "evidencia": "1. Matriz de riesgos con la identificación, análisis y evaluación de los riesgos de continuidad de negocio que pueden afectar la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 203, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de contingencia donde se incluyan los servicios contratados por la organización ?", "evidencia": "1. Plan de contingencia asociado a la prestación del servicio que contemple: . - Actividades de preparación - Actividades durante la contingencia - Actividades de retorno a la normalidad", "activo": true}, {"id_pregunta": 204, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de administración de crisis? ¿El plan de administración de Crisis contempla: * Alcance organizacional (procesos, sedes, servicios críticos). * Tipos de crisis cubiertas (ciberataques, incidentes operativos, legales, reputacionales, sanitarios, desastres naturales, Otros). * Interlocutores por tipo de Crisis?", "evidencia": "1. Plan de administración de crisis", "activo": true}, {"id_pregunta": 205, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿ Tienen establecido un plan de recuperación de desastres (DRP)?", "evidencia": "1. Plan de recuperación de desastres (DRP) 2. Procedimientos de recuperación para los servicios tecnológicos y/o sistemas de información que soportan la operación del servicio a la organización.", "activo": true}, {"id_pregunta": 206, "control": "Análisis de impacto al negocio (BIA)", "texto": "¿Dentro del análisis de impacto BIA, incluyen los servicios contratados por la organización? ¿para los servicios contratadas por la organización se encuentran identificados los RTO Y RPO? ¿los RTO y RPO identificados se encuentran alineados con los establecidos por la organización en los proceso que soporta? ¿Dentro de la BIA, identifican el personal mínimo que garantice la operación de los servicios contratados por la organización? ¿Dentro de la BIA se contemplan los activos necesarios que garanticen la operación de los servicios contratados por la organización?", "evidencia": "1. Análisis de impacto del negocio ( BIA), con la definición de: - Actividades criticas asociadas a la prestación del servicio - RTO y RPO - Personal mínimo requerido para la continuidad del servicio durante una contingencia. - Recursos mínimos necesario para dar continuidad a la prestación del servicio durante una contingencia. (equipos de computo, puestos de trabajo, ubicaciones alternas de operación, impresoras, archivadores, entre otros) - Servicios de TI y/o sistemas de información requeridos en una contingencia para operar el servicio prestado a la organización.", "activo": true}, {"id_pregunta": 207, "control": "Pruebas al plan de continuidad de negocio", "texto": "¿Entregaron el cronograma de las pruebas de continuidad de acuerdo a las obligaciones contractuales? ¿se realizaron las pruebas y ejercicios para evaluar la eficacia de las estrategias de continuidad de la organización según el alcance definido? ¿el tercero realizo y envió el respectivo informe de los resultados de las pruebas de continuidad realizadas? ¿dentro del desarrollo de las pruebas de continuidad realizadas, se incluyo escenarios en donde se validen los servicios contratados por parte de la organización? ¿Se encuentra alineado el resultado de las pruebas, con la promesa de servicio que el proveedor tiene con la organización a nivel de recuperación ante incidentes que se presenten y con los ANS ¿El proveedor participa en las pruebas que programa la organización dentro de las actividades se Continuidad del Negocio?", "evidencia": "1. Cronograma de pruebas a acorde con las obligaciones contractuales. 2. Informe de resultados de las pruebas ejecutadas 3. Envió del correo de socialización de las pruebas a la organización. 4. Informe de resultados de las pruebas ejecutadas en alineación con la programación de pruebas PCN de la organización.", "activo": true}, {"id_pregunta": 208, "control": "Centro de datos", "texto": "El proveedor cuenta con un centro de datos principal y un centro de datos alterno debidamente implementado y operando, acorde con las necesidades del servicio y actividades contratadas con la organización? 'El Centro de Datos Alterno con que cuenta el proveedor está definido para activarse acorde con los RTO requeridos por la organización (4 horas)? 'El Proveedor cuenta con un Plan de recuperación de Desastres (DRP) , alineado al servicio y actividades contratadas por la organización, con detalle de las actividades de contingencia tecnológicas que permiten activarlo y operar ante una indisponibilidad que se le presente al proveedor en su centro de datos principal? ¿ El TIER implementado en los centros de datos principal y alterno están en nivel III o IV?", "evidencia": "1. Documento Certificación del Plan de Recuperación de Desastres que incluya la implementación de los CDP y CDA y alineado a los servicios y actividades contratados con la organización. 2. Planes de recuperación tecnológica, alineados a los servicios y actividades contratados con la organización. 3. Para los centros de datos tercerizadas suministrar la certificación SOC2 de los controles evaluados 4. Ultimo informe de auditoria realizado sobre los controles de seguridad física, lógica y ambiental del centro de datos (Tanto Propio como del tercero en caso de que aplique). 5. Documento Certificación del Plan de Recuperación de Desastres debidamente implementado y operando acorde con los servicios y actividades contratadas con la organización. 6. Documento certificación del TIER implementado.", "activo": true}, {"id_pregunta": 209, "control": "Plan de capacitaciones", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con el plan de continuidad del negocio (PCN)? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Documento con el plan o cronograma de capacitación. 2. Documento donde se relaciones las personas capacitadas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 3, "nombre_tipologia": "Seguridad de la Información y Ciberseguridad", "clave": "si", "activo": true, "descripcion": "Evalua los controles de seguridad de la informacion, ciberseguridad y proteccion de datos.", "preguntas": [{"id_pregunta": 301, "control": "Política y procedimientos de seguridad de la información", "texto": "¿Las políticas, procedimientos y estándares de seguridad de la información están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - comunicadas a todas las partes interesadas relevantes?", "evidencia": "1. Documentos de normas y políticas de seguridad de la información con resumen de revisión y aprobación 2. Comunicación por correo electrónico de políticas y normas a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 302, "control": "Roles, responsabilidades y segregación de funciones de seguridad de la información", "texto": "¿Se definen y documentan formalmente los roles y responsabilidades sobre la gestión de la seguridad de la información? ¿Las responsabilidades en conflicto están segregadas entre diferentes roles?", "evidencia": "1. Estructura de gobierno de la seguridad de la información 2. Documento de roles y responsabilidades para todos roles de la estructura de gobierno de seguridad", "activo": true}, {"id_pregunta": 303, "control": "Marco y política de gestión de riesgos", "texto": "¿Existe una política y un modelo formal de gestión de riesgos de seguridad, revisado y actualizado periódicamente y comunicado a todas las partes interesadas? ¿Contempla seguridad sobre la información y los componentes tecnológicos que soportan el servicio prestado a la organización, que considere identificación de amenazas, vulnerabilidades y controles de seguridad?", "evidencia": "1. Política de gestión de riesgos de seguridad 2. Modelo de gestión de riesgos de seguridad 3. Matriz de riesgos de seguridad sobre activos de información, con vulnerabilidades, amenazas, valoración de probabilidad e impacto, identificación y valoración de controles. 4. Planes de tratamiento de riesgo residual sobre los componentes tecnológicos de soportes a la organización 5. Seguimiento del plan de tratamiento de riesgos", "activo": true}, {"id_pregunta": 304, "control": "Evaluación previa a la contratación", "texto": "¿Se realizan estudios de seguridad previo a la contratación de los empleados que tendrán acceso a la información del servicio prestado a la organización?", "evidencia": "1. Políticas de análisis de estudios de seguridad previo a la contratación", "activo": true}, {"id_pregunta": 305, "control": "Términos y condiciones de contratación", "texto": "¿Los contratos de trabajo consideran las responsabilidades relacionadas con la seguridad de la información a la que tendrán acceso los empleados?", "evidencia": "1. Clausulas de los contratos en materia de seguridad de la información. 2. Listado de empleados que han firmado los términos y condiciones de empleo con respecto a la seguridad de la información", "activo": true}, {"id_pregunta": 306, "control": "Proceso disciplinario por violaciones a la seguridad", "texto": "¿Existe un proceso disciplinario formalmente documentado, revisado, actualizado y comunicado en relación a la violación del cumplimiento de las directrices de seguridad por parte de los empleados y subcontratistas (cuando corresponda)?", "evidencia": "1. Política / proceso disciplinario con respecto a la violación de la seguridad / privacidad y el uso indebido de la información 2. Evidencia de comunicación (correo electrónico, instantánea del portal electrónico) para hacer circular la política / proceso disciplinario a todos los empleados", "activo": true}, {"id_pregunta": 307, "control": "Capacitación y cultura en seguridad de la información", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con cultura de seguridad de la información para empleados y subcontratistas? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Calendario del programa de cultura de seguridad 2. Registros de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 308, "control": "Terminación o cambio de responsabilidades laborales", "texto": "¿Se recuperan / eliminan todos los activos / derechos de acceso de los empleados que han renunciado, transferido, rescindido o al finalizar el contrato?", "evidencia": "1. Proceso de retiro de accesos y devolución de información en la terminación de la contratación", "activo": true}, {"id_pregunta": 309, "control": "Inventario, clasificación y etiquetado de activos de información", "texto": "¿Se mantienen los inventarios de activos de información involucrados en la prestación del servicio a la organización?¿Esto incluye activos de información físicos, digitales y electrónicos? '¿Todos los activos de información se encuentran clasificados en sus tres características y etiquetados según su clasificación?", "evidencia": "1. Inventario de activos de información clasificados y valorados en los atributos de confidencialidad, integridad y disponibilidad 2. Política de etiquetado de los activos de información", "activo": true}, {"id_pregunta": 310, "control": "Política de uso aceptable", "texto": "¿La política de uso aceptable de la información está formalmente documentada, revisada y actualizada anualmente? ¿La política de uso aceptable es aceptada por todos los empleados y subcontratistas cuando corresponda?", "evidencia": "1. Política de uso aceptable 2. Reconocimiento / seguimiento de aceptación de la política de uso aceptable por parte de los empleados", "activo": true}, {"id_pregunta": 311, "control": "Eliminación de medios y disposición final de información", "texto": "¿Están documentados, actualizados e implementados los procedimientos para la sanitización y destrucción de medios en des huso?", "evidencia": "1. Procedimiento de eliminación segura de la información", "activo": true}, {"id_pregunta": 312, "control": "Administración de cuentas de acceso", "texto": "¿Se cuenta con un proceso de gestión de acceso lógico para otorgar / modificar y revocar el acceso del usuario a los sistemas y servicios de información con las siguientes consideraciones: - Cuenta única para cada usuario según la convención de nomenclatura - Los ID compartidos (si es necesario) están documentados y aprobados por los equipos de seguridad - Acceso en función de la matriz de control de acceso definida por el responsable del activo - Autorizaciones del jefe inmediato para la asignación de los permisos solicitados - Separación adecuada de funciones para los roles de los usuarios según los conflictos de interés. - Eliminación inmediata después del retiro de los empleados o terceros - Registros de autorizaciones para usuarios registrados y rechazados?", "evidencia": "1. Proceso de administración de cuentas de acceso", "activo": true}, {"id_pregunta": 313, "control": "Revisión de acceso de usuario", "texto": "¿Se realiza una revisión anual (al menos) del acceso de los usuarios configurado en los sistemas de información usados para la prestación del servicio?", "evidencia": "1. Proceso de certificación de accesos", "activo": true}, {"id_pregunta": 314, "control": "Gestión de contraseñas", "texto": "¿Se han implementado sistemas de administración de contraseñas que consideren: - Complejidad de la contraseña - Caducidad o antigüedad de la contraseña - Intentos de inicio de sesión fallidos - Tiempos de espera de sesión - Historial de contraseñas - Cifrado de contraseña - Grabación y transmisión de contraseñas - Las contraseñas deben asignarse mediante un proceso de gestión formal y los destinatarios deben cambiarlas después del primer inicio de sesión.?", "evidencia": "1. Documentación de la política de contraseñas", "activo": true}, {"id_pregunta": 315, "control": "Acceso a código fuente", "texto": "¿El código fuente está protegido para - Evitar el almacenamiento de bibliotecas de fuentes de programas en sistemas locales - Restringir el acceso al personal de desarrollo designado - Separar el código fuente en desarrollo de los programas que están en producción - Archivar periódicamente versiones anteriores de código?", "evidencia": "1. Política de control de acceso a código fuente", "activo": true}, {"id_pregunta": 316, "control": "Autenticación de usuario para conexiones externas y remotas", "texto": "¿Se definen e implementan directrices para asegurar el acceso remoto? ¿Con la contingencia actual como se está realizando el trabajo para la ejecución de actividades relacionados con la prestación del servicio de la organización? ¿Qué controles adicionales se han considerado para el trabajo remoto con la contingencia?", "evidencia": "1. Documento de políticas de acceso remoto 2. Tipo de tecnología utilizadas para el acceso remoto", "activo": true}, {"id_pregunta": 317, "control": "Seguridad de acceso inalámbrico", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso inalámbrico? ¿El acceso a las redes inalámbricas está restringido solo a personas autorizadas?", "evidencia": "1. Pautas de uso de la red inalámbrica", "activo": true}, {"id_pregunta": 318, "control": "Control de acceso para dispositivos móviles", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso a dispositivos móviles?", "evidencia": "1. Pautas de uso de dispositivos móviles", "activo": true}, {"id_pregunta": 319, "control": "Gestión de dispositivo Propio (BYOD)", "texto": "¿Existen restricciones y pautas de uso de dispositivos personales en la prestación del servicio?", "evidencia": "1, Política de \"Trae tu Propio Dispositivo\" (BYOD)", "activo": true}, {"id_pregunta": 320, "control": "Gestión de cuentas de acceso privilegiado", "texto": "¿Se autoriza y supervisa la asignación y el uso de cuentas de acceso privilegiado?", "evidencia": "1. Políticas de asignación y uso de cuentas de acceso privilegiado (cuentas de administración) 2. Matriz o herramienta de control para la asignación de cuentas de acceso privilegiado.", "activo": true}, {"id_pregunta": 321, "control": "Controles de seguridad física", "texto": "¿Existen e implementan políticas y procedimientos de seguridad física formalmente documentados?", "evidencia": "1. Políticas de mecanismos de control de seguridad física sobre las zonas de procesamiento de información", "activo": true}, {"id_pregunta": 322, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿SE cuenta con un perímetros de seguridad (barreras tales como paredes, puertas de entrada controladas por tarjeta o mostradores de recepción con personal) para proteger las áreas de trabajo?", "evidencia": "1. Lista de controles de seguridad física aplicados 2. Proceso de acceso de visitantes como credenciales, sistemas, registros, etc.", "activo": true}, {"id_pregunta": 323, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿El acceso a las instalaciones dedicadas al procesamiento de información está restringido físicamente solo al personal autorizado?", "evidencia": "1. Listado de instalaciones de procesamiento de información necesaria para la prestación del servicio", "activo": true}, {"id_pregunta": 324, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿Se cuenta con circuito cerrado de televisión (CCTV) para monitorear las instalaciones las 24 horas del día, los 7 días de la semana? ¿Conserva la cobertura de las imágenes de CCTV durante al menos 3 meses?", "evidencia": "1. Política de monitoreo bajo CCTV - Ubicación de las cámaras en las instalaciones donde se procesa información y que hace parte de la prestación del servicio a la organización. - Tiempo de retención de las grabaciones", "activo": true}, {"id_pregunta": 325, "control": "Controles de seguridad ambiental", "texto": "¿Existen sistemas de detección de incendios e inundación para minimizar el daño a la información y las instalaciones?", "evidencia": "1. Documento del proceso de respuesta a eventos de incendio e inundación 2. Informes de pruebas en los mecanismos de detección de incendio e inundación", "activo": true}, {"id_pregunta": 326, "control": "Protección y mantenimiento de equipos", "texto": "¿Están los sistemas de información críticos protegidos por dispositivos de suministro de energía ininterrumpida (UPS)?", "evidencia": "1. Informes de mantenimiento preventivo del generador de respaldo y de las UPS.", "activo": true}, {"id_pregunta": 327, "control": "Control de acceso a la red", "texto": "¿Existen y se encuentran implementados políticas y procedimientos de seguridad en la de red de datos?", "evidencia": "1. Directrices de control de acceso a la red", "activo": true}, {"id_pregunta": 328, "control": "Seguridad de la red y los servicios de red", "texto": "¿La red está segmentada y segregada física / lógicamente?", "evidencia": "1. Diagrama de red donde se encuentran los componentes tecnológicos requeridos para la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 329, "control": "Seguridad de la red y los servicios de red", "texto": "¿Se cuenta con firewalls en todas las conexiones con redes externas o DMZ?", "evidencia": "1. Diagrama de topología de red que indique los firewalls instalados 2. Documento de directrices de configuración del firewall", "activo": true}, {"id_pregunta": 330, "control": "Seguridad de la red y los servicios de red", "texto": "¿Realiza periódicamente pruebas de penetración sobre la infraestructura tecnológica?", "evidencia": "1. Informes de evaluación de intrusión realizadas sobre los sistemas de información que soportan el servicio a la organización 2. Cronograma de pruebas de penetración y alcance definido para cada una.", "activo": true}, {"id_pregunta": 331, "control": "Requisitos y especificaciones de seguridad de la información", "texto": "¿Se definen y cumplen los requisitos de seguridad de la información para la adquisición de nuevos productos, proyectos de desarrollo?", "evidencia": "1. Especificaciones de los requisitos de seguridad de la información para nuevos sistemas de información 2. Pautas de desarrollo seguro", "activo": true}, {"id_pregunta": 332, "control": "Pruebas de aceptación y seguridad de la aplicación", "texto": "¿Se realizan pruebas de aceptación y seguridad del sistema durante el desarrollo y antes de la implementación?", "evidencia": "1. Política de pruebas de seguridad y criterios de aceptación 2. Política de revisión de código seguro para aplicaciones", "activo": true}, {"id_pregunta": 333, "control": "Instalación y configuración", "texto": "¿Cuenta con un procedimiento formal para la instalación y configuración segura (hardening) mediante guías aceptadas por la industria para los componentes de infraestructura y sistemas de información usados en la prestación del servicio?", "evidencia": "1. Procedimiento de instalación y configuración segura de los diferentes componentes de infraestructura y sistemas de información 2. Líneas base de aseguramiento", "activo": true}, {"id_pregunta": 334, "control": "Mensajería electrónica", "texto": "¿Se definen, revisan y comunican las directrices para el uso seguro de la mensajería electrónica, que consideren la restricción y protección de los datos transferidos, incluidos los archivos adjuntos?", "evidencia": "1. Directrices de mensajería electrónica", "activo": true}, {"id_pregunta": 335, "control": "Fuga de información", "texto": "¿Se implementan mecanismos para evitar la fuga de datos a través de una solución DLP adecuada, restricción de correo electrónico y proxy web?", "evidencia": "1. Arquitectura / Configuración y reglas de los mecanismos de DLP", "activo": true}, {"id_pregunta": 336, "control": "Filtrado web", "texto": "¿Se cuenta con mecanismos para el filtrado de navegación?", "evidencia": "1. Políticas de filtrado Web 2. Herramienta para el filtrado Web", "activo": true}, {"id_pregunta": 337, "control": "Gestión de medios extraíbles", "texto": "¿Los medios extraíbles están restringidos en la organización y el uso se permite solo para requisitos específicos a través de aprobaciones formales?", "evidencia": "1. Política de uso de medios extraíbles", "activo": true}, {"id_pregunta": 338, "control": "Seguridad para entornos de nube", "texto": "¿Se han identificado, documentado, implementado e incluido los requisitos de seguridad de la información en los acuerdos para el uso de servicios de nube?", "evidencia": "1. Requisitos de seguridad para el procesamiento de servicios en la nube", "activo": true}, {"id_pregunta": 339, "control": "Uso y regulación de controles criptográficos", "texto": "¿Se ha desarrollado e implementado políticas sobre el uso de controles criptográficos?", "evidencia": "1. Norma o política de criptografía 2. Técnicas criptográficas que se utilizan", "activo": true}, {"id_pregunta": 340, "control": "Copias de seguridad", "texto": "¿Se han definido políticas / procedimientos formales de respaldo y restauración? ¿Se prueban los datos respaldados de forma regular?", "evidencia": "1. Política / procedimiento de copia de seguridad y restauración 2. Registros de configuración de respaldos realizados sobre la información usada para la prestación del servicio 3. Evidencia de pruebas de restauración y funcionalidad de los datos (en el último año)", "activo": true}, {"id_pregunta": 341, "control": "Política de privacidad de datos", "texto": "¿Existe una política / estándar de privacidad de datos formalmente documentado que cubra la recopilación, uso, retención, eliminación y seguridad de la información personal de acuerdo con las disposiciones de las ley 1581 y demás decretos reglamentarios aplicables?", "evidencia": "1. Norma y política de privacidad de datos 2. Revisión y aprobación del departamento legal sobre las leyes, reglamentos y normas de privacidad identificadas 3. Inventarios de bases de datos con información de identificación personal", "activo": true}, {"id_pregunta": 342, "control": "Procedimientos de control de cambios", "texto": "¿Se cuenta con un procedimiento de gestión de cambios documentado formalmente, que considere (como mínimo) lo siguiente: - Identificación y registro de los cambios - Evaluación de impacto potencial - Autorización, prueba y aprobación", "evidencia": "1. Procedimientos de gestión de cambios 2. Bitácora o herramienta donde se lleva la trazabilidad de la gestión del control de cambios", "activo": true}, {"id_pregunta": 343, "control": "Sincronización de reloj", "texto": "¿Están sincronizados los relojes de todos los sistemas de información relevantes dentro de la organización con una fuente válida?", "evidencia": "1. Lista de servidores NTP implementados en el entorno, junto con la descripción de la fuente de tiempo", "activo": true}, {"id_pregunta": 344, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Se realizan pruebas de vulnerabilidad periódicamente sobre todos los componentes que intervienen en la prestación del servicio a la organización, considerando sistemas operativos, bases de datos, dispositivos de red?", "evidencia": "1. Informes de evaluación de vulnerabilidad de los componentes tecnológicos que hacen parte de la prestación del servicio", "activo": true}, {"id_pregunta": 345, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Están todos los sistemas de información y componentes tecnológicos actualizados con los últimos parches de seguridad?", "evidencia": "1. Informe periódico de gestión de parches para sistemas / componentes", "activo": true}, {"id_pregunta": 346, "control": "Controles contra malware", "texto": "¿Se han implementado mecanismos de protección antimalware formalmente documentados para redes, estaciones de trabajo, computadoras portátiles y otros dispositivos?", "evidencia": "1. Política de antivirus y software antimalware instalado en estaciones de trabajo. 2. Herramienta antimalware implementada", "activo": true}, {"id_pregunta": 347, "control": "Inteligencia sobre amenazas", "texto": "¿Están documentados e implementados los procedimientos para realizar analítica de amenazas?", "evidencia": "1. Procedimiento de analítica de amenazas 2. Informe de analítica de amenazas", "activo": true}, {"id_pregunta": 348, "control": "Responsabilidades y procedimientos de gestión de incidentes", "texto": "¿Están documentados e implementados los procedimientos / planes de gestión de incidentes de seguridad de la información?", "evidencia": "1. Política / procedimientos de gestión de incidentes", "activo": true}, {"id_pregunta": 349, "control": "Detección y notificación de incidentes", "texto": "¿Se informan los incidentes / violaciones de seguridad de la información a través de los canales de gestión adecuados y según el proceso definido? ¿Se cuenta con mecanismos de monitoreo automático sobre los registros de actividad de los usuarios en los sistemas de información (log de eventos)?", "evidencia": "1. Proceso de notificación de incidentes / eventos relacionados con la seguridad de la información 2. Directrices de registro de eventos de auditoría 3. Definición de herramientas de monitoreo de eventos de seguridad 4. Bitácora de gestión de incidentes", "activo": true}, {"id_pregunta": 350, "control": "Recolección de evidencia", "texto": "¿Se identifican, recopilan y conservan las evidencias para actividades relacionadas con la gestión de incidentes de seguridad de la información para su posterior análisis? ¿Se documentan las lecciones aprendidas?", "evidencia": "1. Proceso de recolección de evidencia para análisis de incidentes 2. Documento de lecciones aprendidas", "activo": true}]}, {"id_tipologia": 4, "nombre_tipologia": "Cumplimiento Regulatorio", "clave": "cu", "activo": true, "descripcion": "Evalua el cumplimiento regulatorio, laboral y normativo del tercero.", "preguntas": [{"id_pregunta": 401, "control": "Proceso de cumplimiento de los requisitos legales y reglamentarios", "texto": "¿¿Ejecuta la organización mecanismos de verificación periódica (auditorías internas, revisoría fiscal o autoevaluaciones) para asegurar el cumplimiento de las obligaciones contractuales y normativas, generando planes de acción trazables ante cualquier desviación detectada?", "evidencia": "1. Manual del programa de cumplimiento, junto con las responsabilidades asignadas a las personas 2. Evidencia de comunicación (por ejemplo, correo electrónico, procedimientos, intranet, sesiones de sensibilización, etc.) 3. Cronograma de Auditorías Internas de Cumplimiento / Calidad.", "activo": true}, {"id_pregunta": 402, "control": "Matriz de cumplimiento regulatorio", "texto": "¿Ha identificado formalmente los requisitos legales y contractuales aplicables al servicio (incluyendo SST, Protección de Datos, Ética y normas específicas del sector) y evidencia su comunicación efectiva al personal encargado de la ejecución del contrato?", "evidencia": "1. Matriz de requerimientos legales, estatutarios, reglamentarios y contractuales aplicables a la organización, junto con las responsabilidades y estado de cumplimiento. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las partes interesadas.", "activo": true}, {"id_pregunta": 403, "control": "Monitoreo al cumplimiento regulatorio", "texto": "¿Dispone de un marco de políticas y procedimientos de seguridad de la información documentado y aprobado por la Dirección, acorde con la naturaleza de sus servicios, que establezca controles para proteger la confidencialidad, integridad y disponibilidad de la información manejada?", "evidencia": "1. Informe de estado de cumplimiento de la matriz de requerimientos legales. 2. Manual o Política General de Seguridad de la Información (Vigente).", "activo": true}, {"id_pregunta": 404, "control": "Certificación Estándares Mínimos SG-SST", "texto": "¿Acredita el cumplimiento de los Estándares Mínimos del SG-SST (Res. 0312/2019) mediante Certificación ARL con calificación >85% (o Plan de Mejora vigente) y evidencia la operación activa del COPASST?", "evidencia": "1. Certificado de la ARL (vigencia < 30 días). 2. Actas de reunión del COPASST (último trimestre).", "activo": true}, {"id_pregunta": 405, "control": "Sistema de Gestión de PQRSD", "texto": "¿Cuenta con un mecanismo formal de registro y seguimiento (físico, digital o tecnológico, acorde a su volumen operativo) que garantice la recepción, trazabilidad y respuesta oportuna de las PQRSD, dando estricto cumplimiento a los términos perentorios establecidos en la Ley 1755 de 2015 (15 días hábiles generales) y la Ley 1437 de 2011?", "evidencia": "1. Procedimiento o Protocolo de Atención de PQRSD. 2. Evidencia de seguimiento (ej. Planilla de Excel, Bitácora de radicación o reporte de sistema) donde conste fecha de recibido vs. fecha de respuesta. 3. Indicadores de oportunidad (Si aplica por volumen).", "activo": true}, {"id_pregunta": 406, "control": "Control de Aportes Seguridad Social", "texto": "¿Realiza validaciones mensuales para garantizar el pago correcto, completo y oportuno de los aportes a Seguridad Social y Parafiscales de todo el personal adscrito al contrato (Art. 50 Ley 789 de 2002)?", "evidencia": "1. Certificación de Revisor Fiscal o Representante Legal (si no está obligado a tener Revisor) donde conste el pago de los aportes.", "activo": true}, {"id_pregunta": 407, "control": "Sistema Integrado de Gestión (Q & E)", "texto": "¿Cuenta con un Sistema de Gestión de Calidad y Ambiental (certificado o propio) que asegure la mejora continua de los procesos, el cumplimiento de acuerdos de nivel de servicio (ANS) y la correcta disposición de residuos o manejo ambiental acorde a la normativa?", "evidencia": "1. Evidencia de control de calidad del servicio. 2. Plan de Gestión Integral de Residuos (PGIRS) si aplica.", "activo": true}, {"id_pregunta": 408, "control": "Organización de Archivos y Cero Papel", "texto": "¿Aplica lineamientos de Gestión Documental y \"Cero Papel\", garantizando la correcta organización, digitalización, custodia y transferencia de la información producida en ejecución del contrato?", "evidencia": "1. Tabla de Retención Documental (TRD) o Procedimiento de Archivo y Gestión Documental. 2. Política de Cero Papel o eficiencia administrativa.", "activo": true}]}, {"id_tipologia": 5, "nombre_tipologia": "Fraude y Corrupción", "clave": "fr", "activo": true, "descripcion": "Evalua los controles antifraude, anticorrupcion y de etica empresarial.", "preguntas": [{"id_pregunta": 501, "control": "Política general ABAC (políticas de antifraude y anticorrupción)", "texto": "¿Se cuenta con una política en cuanto a la gestión del riesgo de fraude y corrupción? ¿Las políticas, procedimientos y estándares están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - divulgado a todas las partes interesadas relevantes", "evidencia": "1. Política Antifraude y Anticorrupción 2. Evidencia de divulgación de la Política Antifraude y anticorrupción a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 502, "control": "Ambiente de control", "texto": "¿Se encuentra definido el código de conducta y ética de la Entidad, en el cual se consideren acciones disciplinarias por acciones de Fraude o corrupción?", "evidencia": "1. Código de conducta y ética", "activo": true}, {"id_pregunta": 503, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las atribuciones y directrices en cuanto a regalos, atenciones y gratificaciones?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 504, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las directrices en cuanto al manejo de donaciones, contribuciones públicas, patrocinios, y uso indebido de los recursos?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 505, "control": "Ambiente de control", "texto": "¿Se consideran medidas de controles sobre los procesos de compras y adquisiciones, garantizando pluralidad de proponentes y transparencia en los procesos?", "evidencia": "1. Manual de contrataciones y adquisiciones", "activo": true}, {"id_pregunta": 506, "control": "Ambiente de control", "texto": "¿Se encuentran definidas directrices en cuanto al conflicto de interés en la ejecución de los procesos de la Entidad?", "evidencia": "1. Procedimiento de conflictos de interés", "activo": true}, {"id_pregunta": 507, "control": "Ambiente de control", "texto": "Cuenta con mecanismos para identificar y reportar eventos de fraude y corrupción en la organización", "evidencia": "1. Línea de denuncias", "activo": true}, {"id_pregunta": 508, "control": "Ambiente de control", "texto": "¿Se cuenta con mecanismos de análisis y monitoreo sobre los reportes de eventos de Fraude y corrupción (v.gr. Línea ética)?", "evidencia": "1. Monitoreo a la gestión de eventos 2. Que pasa con la información producto del monitoreo, se analizan las casuísticas y se toman acciones 3. Se presenta a la Alta Dirección los resultados producto del monitoreo y se toman decisiones frente a dichos resultados", "activo": true}, {"id_pregunta": 509, "control": "Ambiente de control", "texto": "La organización cuanta con Programas de Transparencia y Ética Empresarial", "evidencia": "1. Programa de Transparencia y Ética Empresarial", "activo": true}, {"id_pregunta": 510, "control": "Planes de capacitación sobre el sistema de Política Antifraude y Anticorrupción", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con las Política Antifraude y Anticorrupción? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 6, "nombre_tipologia": "Lavado de Activos y Financiacion del Terrorismo (LAFT)", "clave": "laft", "activo": true, "descripcion": "Evalua los controles del sistema de prevencion de LA/FT segun normativa aplicable.", "preguntas": [{"id_pregunta": 601, "control": "Políticas y procedimientos", "texto": "¿La Entidad cuenta con un Sistema de Prevención de Riesgo de LA/FT, con lineamientos definidos que contribuyan a prevenir y/o a mitigar el riesgo de LA/FT?", "evidencia": "1. Políticas y/o manual del sistema LA/FT", "activo": true}, {"id_pregunta": 602, "control": "Consulta de listas restrictivas", "texto": "¿Se cuenta con procedimientos ejecutados por la entidad con relación al seguimiento a las listas ONU y OFAC? ¿La empresa cuenta con una herramienta tecnológica de consulta de listas vinculantes y no vinculantes?", "evidencia": "1. Procedimiento para el seguimiento a las listas ONU y OFAC, y fuente de consulta de información de listas ONU y OFAC", "activo": true}, {"id_pregunta": 603, "control": "Debida Diligencia Contrapartes", "texto": "¿La empresa cuenta con procedimientos de conocimiento de las contrapartes (incluye cuartas partes vinculadas a la ejecución del contrato con la organización)?", "evidencia": "1. Procedimientos establecidos.", "activo": true}, {"id_pregunta": 604, "control": "Capacitación", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con LA/FT? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro a capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 605, "control": "Identificación y medición del riesgo", "texto": "¿La empresa cuenta con una matriz u otro instrumento que permita la identificación, medición, segmentación y evaluación del riesgo LA/FT?", "evidencia": "1. Matriz u otro mecanismo de riesgos y controles asociada LA/FT, teniendo en cuenta los factores de riesgo.", "activo": true}, {"id_pregunta": 606, "control": "Monitoreo y gestión sobre los riesgos", "texto": "¿El sistema de prevención de LA/FT implementado en su compañía permite identificar operaciones inusuales y sospechosas?", "evidencia": "1. Mecanismos de reporte o informes", "activo": true}]}, {"id_tipologia": 7, "nombre_tipologia": "Capacidad Financiera", "clave": "fi", "activo": true, "descripcion": "Evalua la solidez financiera y capacidad de cumplimiento del tercero.", "preguntas": [{"id_pregunta": 701, "control": "Identificación y medición del riesgo financiero", "texto": "¿Se cuenta con una metodología de gestión de riesgo financiero actualizada que considere: - Identificación de riesgos financiero que por eventos adverso o alguna fluctuación financiera puedan afectar negativamente la entidad y la prestación del servicio a la organización (riesgo de endeudamiento, riesgo de liquidez, Rentabilidad Operacional de los Activos - ROA y Rentabilidad Operacional sobre el Patrimonio - ROE) - Proceso de medición del riesgo y de la elaboración y aplicación de diferentes estrategias para gestionarlo y hacerle frente, en función de su gravedad y en función de las consecuencias que pueda tener dentro de la empresa y la prestación del servicio a la organización.", "evidencia": "1. Políticas y/o manual con la metodología de gestión de riesgo financiero de la entidad. 2. Documento donde se evidencie la gestión de los riesgos.", "activo": true}, {"id_pregunta": 702, "control": "Monitoreo y gestión sobre los riesgos financiero", "texto": "¿Se cuenta con indicadores financieros (Liquidez, Endeudamiento, ROA y ROE) que generen las alertas a la entidad y son revisados periódicamente (mensual o trimestralmente) para identificar cambios que puedan ser reveladores de problemas con el riesgo?", "evidencia": "1. Informes de seguimiento y gestión de riesgos financieros de la entidad, incluyendo el análisis realizado, las acciones y decisiones que se deriven del mismo.", "activo": true}]}, {"id_tipologia": 8, "nombre_tipologia": "Riesgo Pais", "clave": "pa", "activo": false, "descripcion": "Evalua la exposicion al riesgo pais y entorno regulatorio externo.", "preguntas": [{"id_pregunta": 801, "control": "Identificación y medición del riesgo país", "texto": "¿Se cuenta con una metodología de gestión de riesgo país actualizada que considere el entorno legal, regulatorio, geopolítico, social y económico del país donde se mantiene la operación del negocio y sean considerados importantes obstáculos para hacer negocios a nivel mundial (por ejemplo, las recesiones económicas, la agitación política y los desastres naturales) e incluya: - Identificación de riesgos asociado con la realización del comercio en regiones específicas. - Niveles de exposición al riesgo país en los planos económicos, político, externo y comercial. - Evaluar de la exposición al riesgo de los proveedores por país.", "evidencia": "1. Políticas y procedimientos para la gestión de riesgo país.", "activo": true}, {"id_pregunta": 802, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se cuenta con indicadores descriptivos y/o cuantitativos para identificar potenciales fuentes de riesgos país que generen las alertas respectivas a la organización en caso de modificaciones significativas del entorno?", "evidencia": "1. Informes de seguimiento y comparación del riesgo país de la organización, incluyendo los riesgos residuales de los diferentes entornos de impacto. 2. Notificaciones o alertamientos de la inestabilidad del país de operación. 3. Planes de tratamiento de riesgos país para minimizar los posibles impactos.", "activo": true}, {"id_pregunta": 803, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se tienen identificadas las regulaciones relacionadas con la protección de los datos en el país y se realiza monitoreo al cumplimiento de las mismas?", "evidencia": "1. Identificación y análisis de las regulaciones de protección de datos aplicables. 2. Informe de acciones, seguimiento y monitoreo de la implementación de controles de protección de datos.", "activo": true}]}], "operativo": [{"id_tipologia": 1, "nombre_tipologia": "Riesgo Operacional", "clave": "op", "activo": true, "descripcion": "Evalua los procesos, riesgos y controles operacionales del tercero.", "preguntas": [{"id_pregunta": 101, "control": "Identificación de riesgos", "texto": "¿Se cuenta con una metodología de identificación de riesgos operacionales(potenciales y ocurridos) asociados a cada una de las actividades de los procesos requeridos para la prestación del servicio a la organización?", "evidencia": "1. Matriz de riesgo o documento identificando los riesgos operacionales que se pueden materializar en el flujo de actividades para el logro de la prestación del servicio a la organización", "activo": true}, {"id_pregunta": 102, "control": "Medición de la probabilidad de ocurrencia de los riesgos operacionales y su impacto.", "texto": "¿Se cuenta con el perfil de riesgo inherente de los procesos usados para la prestación del servicio a la organización, considerando factores cualitativos y/o cuantitativos en la metodología de medición?", "evidencia": "1. Perfil de riesgo inherente de las actividades asociadas a los procesos usados para la prestación del servicio con la organización 2. Definición de factores cualitativos y/o cuantitativos para la medición del riesgo", "activo": true}, {"id_pregunta": 103, "control": "Medidas para controlar los riesgos inherentes.", "texto": "¿Se tiene identificados los controles, y la medición del perfil de riesgo residual para las actividades de los procesos usados en la prestación del servicio?", "evidencia": "1. Documento con los controles implementados para la mitigación de los riesgos identificados en la prestación del servicio para la organización. 2. Perfil de riesgo residual de los riesgos identificados y gestionados en la prestación del servicio. 3. Estrategias implementadas que responden al tratamiento de los riesgos (aceptación, eliminación, transferencia) ubicados fuera del apetito de riesgo definido por la organización.", "activo": true}, {"id_pregunta": 104, "control": "Monitoreo periódico del perfil de riesgo y de la exposición a pérdidas.", "texto": "¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?", "evidencia": "1. Documento donde se observe las actividades efectuadas de monitoreo y seguimiento a los planes de acción, riesgos residuales y controles.", "activo": true}, {"id_pregunta": 105, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con un procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo materializados en la prestación del servicio a la organización.", "evidencia": "1. Documento con el procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo operacional. 2. Bitácora con el registro de eventos ocurridos durante la prestación del servicio a la organización. 3. Reporte a la organización de lecciones aprendidas y acciones implementadas .", "activo": true}, {"id_pregunta": 106, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con protocolo de comunicación con la organización ante la identificación de eventos de riesgo, que impacten o puedan impactar el servicio contratado?", "evidencia": "1. Protocolo de comunicación. 2. Canales de comunicación definidos. 3. Divulgación del protocolo y canales de comunicación a los colaboradores que participan en la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 107, "control": "Planes de capacitación sobre el sistema de gestión de riesgo", "texto": "¿Se cuenta con un plan de capacitación que considere la gestión de los riesgos operacionales a los funcionarios que participan en la prestación del servicio a la organización? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Plan o cronograma de capacitación a los funcionarios sobre la prestación del servicio a la organización, los riesgos que se pueden materializar y los controles para la mitigación de los escenarios de riesgo identificados. 2. Bitácora de registro de las capacitaciones impartidas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 108, "control": "Diligencia de cuarta parte", "texto": "¿Los acuerdos contractuales con las cuartas partes incluyen los requisitos de control definidos por la organización? '¿Se realizan evaluaciones de riesgos antes de la incorporación de terceros en la prestación del servicio a la organización?", "evidencia": "1. Listado de cuartas partes involucradas en la prestación del servicio. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las cuartas partes. 3. Clausulas contractuales con las cuartas partes que incluyan los requisitos de control definidos por la organización 4. Riesgos identificados y gestionados por las cuartas partes que afecten la prestación del servicio a la organización.", "activo": true}]}, {"id_tipologia": 2, "nombre_tipologia": "Continuidad de Negocio", "clave": "cn", "activo": true, "descripcion": "Evalua la resiliencia, planes de continuidad y capacidad de recuperacion del tercero.", "preguntas": [{"id_pregunta": 201, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un Plan de continuidad del negocio actualizado?", "evidencia": "1. Plan de continuidad del negocio", "activo": true}, {"id_pregunta": 202, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Dentro de la matriz de riesgos, se encuentran identificados, y analizados los riesgos que afectan la continuidad del negocio para los servicios contratos por la organización?", "evidencia": "1. Matriz de riesgos con la identificación, análisis y evaluación de los riesgos de continuidad de negocio que pueden afectar la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 203, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de contingencia donde se incluyan los servicios contratados por la organización ?", "evidencia": "1. Plan de contingencia asociado a la prestación del servicio que contemple: . - Actividades de preparación - Actividades durante la contingencia - Actividades de retorno a la normalidad", "activo": true}, {"id_pregunta": 204, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de administración de crisis? ¿El plan de administración de Crisis contempla: * Alcance organizacional (procesos, sedes, servicios críticos). * Tipos de crisis cubiertas (ciberataques, incidentes operativos, legales, reputacionales, sanitarios, desastres naturales, Otros). * Interlocutores por tipo de Crisis?", "evidencia": "1. Plan de administración de crisis", "activo": true}, {"id_pregunta": 205, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿ Tienen establecido un plan de recuperación de desastres (DRP)?", "evidencia": "1. Plan de recuperación de desastres (DRP) 2. Procedimientos de recuperación para los servicios tecnológicos y/o sistemas de información que soportan la operación del servicio a la organización.", "activo": true}, {"id_pregunta": 206, "control": "Análisis de impacto al negocio (BIA)", "texto": "¿Dentro del análisis de impacto BIA, incluyen los servicios contratados por la organización? ¿para los servicios contratadas por la organización se encuentran identificados los RTO Y RPO? ¿los RTO y RPO identificados se encuentran alineados con los establecidos por la organización en los proceso que soporta? ¿Dentro de la BIA, identifican el personal mínimo que garantice la operación de los servicios contratados por la organización? ¿Dentro de la BIA se contemplan los activos necesarios que garanticen la operación de los servicios contratados por la organización?", "evidencia": "1. Análisis de impacto del negocio ( BIA), con la definición de: - Actividades criticas asociadas a la prestación del servicio - RTO y RPO - Personal mínimo requerido para la continuidad del servicio durante una contingencia. - Recursos mínimos necesario para dar continuidad a la prestación del servicio durante una contingencia. (equipos de computo, puestos de trabajo, ubicaciones alternas de operación, impresoras, archivadores, entre otros) - Servicios de TI y/o sistemas de información requeridos en una contingencia para operar el servicio prestado a la organización.", "activo": true}, {"id_pregunta": 207, "control": "Pruebas al plan de continuidad de negocio", "texto": "¿Entregaron el cronograma de las pruebas de continuidad de acuerdo a las obligaciones contractuales? ¿se realizaron las pruebas y ejercicios para evaluar la eficacia de las estrategias de continuidad de la organización según el alcance definido? ¿el tercero realizo y envió el respectivo informe de los resultados de las pruebas de continuidad realizadas? ¿dentro del desarrollo de las pruebas de continuidad realizadas, se incluyo escenarios en donde se validen los servicios contratados por parte de la organización? ¿Se encuentra alineado el resultado de las pruebas, con la promesa de servicio que el proveedor tiene con la organización a nivel de recuperación ante incidentes que se presenten y con los ANS ¿El proveedor participa en las pruebas que programa la organización dentro de las actividades se Continuidad del Negocio?", "evidencia": "1. Cronograma de pruebas a acorde con las obligaciones contractuales. 2. Informe de resultados de las pruebas ejecutadas 3. Envió del correo de socialización de las pruebas a la organización. 4. Informe de resultados de las pruebas ejecutadas en alineación con la programación de pruebas PCN de la organización.", "activo": true}, {"id_pregunta": 208, "control": "Centro de datos", "texto": "El proveedor cuenta con un centro de datos principal y un centro de datos alterno debidamente implementado y operando, acorde con las necesidades del servicio y actividades contratadas con la organización? 'El Centro de Datos Alterno con que cuenta el proveedor está definido para activarse acorde con los RTO requeridos por la organización (4 horas)? 'El Proveedor cuenta con un Plan de recuperación de Desastres (DRP) , alineado al servicio y actividades contratadas por la organización, con detalle de las actividades de contingencia tecnológicas que permiten activarlo y operar ante una indisponibilidad que se le presente al proveedor en su centro de datos principal? ¿ El TIER implementado en los centros de datos principal y alterno están en nivel III o IV?", "evidencia": "1. Documento Certificación del Plan de Recuperación de Desastres que incluya la implementación de los CDP y CDA y alineado a los servicios y actividades contratados con la organización. 2. Planes de recuperación tecnológica, alineados a los servicios y actividades contratados con la organización. 3. Para los centros de datos tercerizadas suministrar la certificación SOC2 de los controles evaluados 4. Ultimo informe de auditoria realizado sobre los controles de seguridad física, lógica y ambiental del centro de datos (Tanto Propio como del tercero en caso de que aplique). 5. Documento Certificación del Plan de Recuperación de Desastres debidamente implementado y operando acorde con los servicios y actividades contratadas con la organización. 6. Documento certificación del TIER implementado.", "activo": true}, {"id_pregunta": 209, "control": "Plan de capacitaciones", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con el plan de continuidad del negocio (PCN)? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Documento con el plan o cronograma de capacitación. 2. Documento donde se relaciones las personas capacitadas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 3, "nombre_tipologia": "Seguridad de la Información y Ciberseguridad", "clave": "si", "activo": true, "descripcion": "Evalua los controles de seguridad de la informacion, ciberseguridad y proteccion de datos.", "preguntas": [{"id_pregunta": 301, "control": "Política y procedimientos de seguridad de la información", "texto": "¿Las políticas, procedimientos y estándares de seguridad de la información están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - comunicadas a todas las partes interesadas relevantes?", "evidencia": "1. Documentos de normas y políticas de seguridad de la información con resumen de revisión y aprobación 2. Comunicación por correo electrónico de políticas y normas a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 302, "control": "Roles, responsabilidades y segregación de funciones de seguridad de la información", "texto": "¿Se definen y documentan formalmente los roles y responsabilidades sobre la gestión de la seguridad de la información? ¿Las responsabilidades en conflicto están segregadas entre diferentes roles?", "evidencia": "1. Estructura de gobierno de la seguridad de la información 2. Documento de roles y responsabilidades para todos roles de la estructura de gobierno de seguridad", "activo": true}, {"id_pregunta": 303, "control": "Marco y política de gestión de riesgos", "texto": "¿Existe una política y un modelo formal de gestión de riesgos de seguridad, revisado y actualizado periódicamente y comunicado a todas las partes interesadas? ¿Contempla seguridad sobre la información y los componentes tecnológicos que soportan el servicio prestado a la organización, que considere identificación de amenazas, vulnerabilidades y controles de seguridad?", "evidencia": "1. Política de gestión de riesgos de seguridad 2. Modelo de gestión de riesgos de seguridad 3. Matriz de riesgos de seguridad sobre activos de información, con vulnerabilidades, amenazas, valoración de probabilidad e impacto, identificación y valoración de controles. 4. Planes de tratamiento de riesgo residual sobre los componentes tecnológicos de soportes a la organización 5. Seguimiento del plan de tratamiento de riesgos", "activo": true}, {"id_pregunta": 304, "control": "Evaluación previa a la contratación", "texto": "¿Se realizan estudios de seguridad previo a la contratación de los empleados que tendrán acceso a la información del servicio prestado a la organización?", "evidencia": "1. Políticas de análisis de estudios de seguridad previo a la contratación", "activo": true}, {"id_pregunta": 305, "control": "Términos y condiciones de contratación", "texto": "¿Los contratos de trabajo consideran las responsabilidades relacionadas con la seguridad de la información a la que tendrán acceso los empleados?", "evidencia": "1. Clausulas de los contratos en materia de seguridad de la información. 2. Listado de empleados que han firmado los términos y condiciones de empleo con respecto a la seguridad de la información", "activo": true}, {"id_pregunta": 306, "control": "Proceso disciplinario por violaciones a la seguridad", "texto": "¿Existe un proceso disciplinario formalmente documentado, revisado, actualizado y comunicado en relación a la violación del cumplimiento de las directrices de seguridad por parte de los empleados y subcontratistas (cuando corresponda)?", "evidencia": "1. Política / proceso disciplinario con respecto a la violación de la seguridad / privacidad y el uso indebido de la información 2. Evidencia de comunicación (correo electrónico, instantánea del portal electrónico) para hacer circular la política / proceso disciplinario a todos los empleados", "activo": true}, {"id_pregunta": 307, "control": "Capacitación y cultura en seguridad de la información", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con cultura de seguridad de la información para empleados y subcontratistas? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Calendario del programa de cultura de seguridad 2. Registros de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 308, "control": "Terminación o cambio de responsabilidades laborales", "texto": "¿Se recuperan / eliminan todos los activos / derechos de acceso de los empleados que han renunciado, transferido, rescindido o al finalizar el contrato?", "evidencia": "1. Proceso de retiro de accesos y devolución de información en la terminación de la contratación", "activo": true}, {"id_pregunta": 309, "control": "Inventario, clasificación y etiquetado de activos de información", "texto": "¿Se mantienen los inventarios de activos de información involucrados en la prestación del servicio a la organización?¿Esto incluye activos de información físicos, digitales y electrónicos? '¿Todos los activos de información se encuentran clasificados en sus tres características y etiquetados según su clasificación?", "evidencia": "1. Inventario de activos de información clasificados y valorados en los atributos de confidencialidad, integridad y disponibilidad 2. Política de etiquetado de los activos de información", "activo": true}, {"id_pregunta": 310, "control": "Política de uso aceptable", "texto": "¿La política de uso aceptable de la información está formalmente documentada, revisada y actualizada anualmente? ¿La política de uso aceptable es aceptada por todos los empleados y subcontratistas cuando corresponda?", "evidencia": "1. Política de uso aceptable 2. Reconocimiento / seguimiento de aceptación de la política de uso aceptable por parte de los empleados", "activo": true}, {"id_pregunta": 311, "control": "Eliminación de medios y disposición final de información", "texto": "¿Están documentados, actualizados e implementados los procedimientos para la sanitización y destrucción de medios en des huso?", "evidencia": "1. Procedimiento de eliminación segura de la información", "activo": true}, {"id_pregunta": 312, "control": "Administración de cuentas de acceso", "texto": "¿Se cuenta con un proceso de gestión de acceso lógico para otorgar / modificar y revocar el acceso del usuario a los sistemas y servicios de información con las siguientes consideraciones: - Cuenta única para cada usuario según la convención de nomenclatura - Los ID compartidos (si es necesario) están documentados y aprobados por los equipos de seguridad - Acceso en función de la matriz de control de acceso definida por el responsable del activo - Autorizaciones del jefe inmediato para la asignación de los permisos solicitados - Separación adecuada de funciones para los roles de los usuarios según los conflictos de interés. - Eliminación inmediata después del retiro de los empleados o terceros - Registros de autorizaciones para usuarios registrados y rechazados?", "evidencia": "1. Proceso de administración de cuentas de acceso", "activo": true}, {"id_pregunta": 313, "control": "Revisión de acceso de usuario", "texto": "¿Se realiza una revisión anual (al menos) del acceso de los usuarios configurado en los sistemas de información usados para la prestación del servicio?", "evidencia": "1. Proceso de certificación de accesos", "activo": true}, {"id_pregunta": 314, "control": "Gestión de contraseñas", "texto": "¿Se han implementado sistemas de administración de contraseñas que consideren: - Complejidad de la contraseña - Caducidad o antigüedad de la contraseña - Intentos de inicio de sesión fallidos - Tiempos de espera de sesión - Historial de contraseñas - Cifrado de contraseña - Grabación y transmisión de contraseñas - Las contraseñas deben asignarse mediante un proceso de gestión formal y los destinatarios deben cambiarlas después del primer inicio de sesión.?", "evidencia": "1. Documentación de la política de contraseñas", "activo": true}, {"id_pregunta": 315, "control": "Acceso a código fuente", "texto": "¿El código fuente está protegido para - Evitar el almacenamiento de bibliotecas de fuentes de programas en sistemas locales - Restringir el acceso al personal de desarrollo designado - Separar el código fuente en desarrollo de los programas que están en producción - Archivar periódicamente versiones anteriores de código?", "evidencia": "1. Política de control de acceso a código fuente", "activo": true}, {"id_pregunta": 316, "control": "Autenticación de usuario para conexiones externas y remotas", "texto": "¿Se definen e implementan directrices para asegurar el acceso remoto? ¿Con la contingencia actual como se está realizando el trabajo para la ejecución de actividades relacionados con la prestación del servicio de la organización? ¿Qué controles adicionales se han considerado para el trabajo remoto con la contingencia?", "evidencia": "1. Documento de políticas de acceso remoto 2. Tipo de tecnología utilizadas para el acceso remoto", "activo": true}, {"id_pregunta": 317, "control": "Seguridad de acceso inalámbrico", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso inalámbrico? ¿El acceso a las redes inalámbricas está restringido solo a personas autorizadas?", "evidencia": "1. Pautas de uso de la red inalámbrica", "activo": true}, {"id_pregunta": 318, "control": "Control de acceso para dispositivos móviles", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso a dispositivos móviles?", "evidencia": "1. Pautas de uso de dispositivos móviles", "activo": true}, {"id_pregunta": 319, "control": "Gestión de dispositivo Propio (BYOD)", "texto": "¿Existen restricciones y pautas de uso de dispositivos personales en la prestación del servicio?", "evidencia": "1, Política de \"Trae tu Propio Dispositivo\" (BYOD)", "activo": true}, {"id_pregunta": 320, "control": "Gestión de cuentas de acceso privilegiado", "texto": "¿Se autoriza y supervisa la asignación y el uso de cuentas de acceso privilegiado?", "evidencia": "1. Políticas de asignación y uso de cuentas de acceso privilegiado (cuentas de administración) 2. Matriz o herramienta de control para la asignación de cuentas de acceso privilegiado.", "activo": true}, {"id_pregunta": 321, "control": "Controles de seguridad física", "texto": "¿Existen e implementan políticas y procedimientos de seguridad física formalmente documentados?", "evidencia": "1. Políticas de mecanismos de control de seguridad física sobre las zonas de procesamiento de información", "activo": true}, {"id_pregunta": 322, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿SE cuenta con un perímetros de seguridad (barreras tales como paredes, puertas de entrada controladas por tarjeta o mostradores de recepción con personal) para proteger las áreas de trabajo?", "evidencia": "1. Lista de controles de seguridad física aplicados 2. Proceso de acceso de visitantes como credenciales, sistemas, registros, etc.", "activo": true}, {"id_pregunta": 323, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿El acceso a las instalaciones dedicadas al procesamiento de información está restringido físicamente solo al personal autorizado?", "evidencia": "1. Listado de instalaciones de procesamiento de información necesaria para la prestación del servicio", "activo": true}, {"id_pregunta": 324, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿Se cuenta con circuito cerrado de televisión (CCTV) para monitorear las instalaciones las 24 horas del día, los 7 días de la semana? ¿Conserva la cobertura de las imágenes de CCTV durante al menos 3 meses?", "evidencia": "1. Política de monitoreo bajo CCTV - Ubicación de las cámaras en las instalaciones donde se procesa información y que hace parte de la prestación del servicio a la organización. - Tiempo de retención de las grabaciones", "activo": true}, {"id_pregunta": 325, "control": "Controles de seguridad ambiental", "texto": "¿Existen sistemas de detección de incendios e inundación para minimizar el daño a la información y las instalaciones?", "evidencia": "1. Documento del proceso de respuesta a eventos de incendio e inundación 2. Informes de pruebas en los mecanismos de detección de incendio e inundación", "activo": true}, {"id_pregunta": 326, "control": "Protección y mantenimiento de equipos", "texto": "¿Están los sistemas de información críticos protegidos por dispositivos de suministro de energía ininterrumpida (UPS)?", "evidencia": "1. Informes de mantenimiento preventivo del generador de respaldo y de las UPS.", "activo": true}, {"id_pregunta": 327, "control": "Control de acceso a la red", "texto": "¿Existen y se encuentran implementados políticas y procedimientos de seguridad en la de red de datos?", "evidencia": "1. Directrices de control de acceso a la red", "activo": true}, {"id_pregunta": 328, "control": "Seguridad de la red y los servicios de red", "texto": "¿La red está segmentada y segregada física / lógicamente?", "evidencia": "1. Diagrama de red donde se encuentran los componentes tecnológicos requeridos para la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 329, "control": "Seguridad de la red y los servicios de red", "texto": "¿Se cuenta con firewalls en todas las conexiones con redes externas o DMZ?", "evidencia": "1. Diagrama de topología de red que indique los firewalls instalados 2. Documento de directrices de configuración del firewall", "activo": true}, {"id_pregunta": 330, "control": "Seguridad de la red y los servicios de red", "texto": "¿Realiza periódicamente pruebas de penetración sobre la infraestructura tecnológica?", "evidencia": "1. Informes de evaluación de intrusión realizadas sobre los sistemas de información que soportan el servicio a la organización 2. Cronograma de pruebas de penetración y alcance definido para cada una.", "activo": true}, {"id_pregunta": 331, "control": "Requisitos y especificaciones de seguridad de la información", "texto": "¿Se definen y cumplen los requisitos de seguridad de la información para la adquisición de nuevos productos, proyectos de desarrollo?", "evidencia": "1. Especificaciones de los requisitos de seguridad de la información para nuevos sistemas de información 2. Pautas de desarrollo seguro", "activo": true}, {"id_pregunta": 332, "control": "Pruebas de aceptación y seguridad de la aplicación", "texto": "¿Se realizan pruebas de aceptación y seguridad del sistema durante el desarrollo y antes de la implementación?", "evidencia": "1. Política de pruebas de seguridad y criterios de aceptación 2. Política de revisión de código seguro para aplicaciones", "activo": true}, {"id_pregunta": 333, "control": "Instalación y configuración", "texto": "¿Cuenta con un procedimiento formal para la instalación y configuración segura (hardening) mediante guías aceptadas por la industria para los componentes de infraestructura y sistemas de información usados en la prestación del servicio?", "evidencia": "1. Procedimiento de instalación y configuración segura de los diferentes componentes de infraestructura y sistemas de información 2. Líneas base de aseguramiento", "activo": true}, {"id_pregunta": 334, "control": "Mensajería electrónica", "texto": "¿Se definen, revisan y comunican las directrices para el uso seguro de la mensajería electrónica, que consideren la restricción y protección de los datos transferidos, incluidos los archivos adjuntos?", "evidencia": "1. Directrices de mensajería electrónica", "activo": true}, {"id_pregunta": 335, "control": "Fuga de información", "texto": "¿Se implementan mecanismos para evitar la fuga de datos a través de una solución DLP adecuada, restricción de correo electrónico y proxy web?", "evidencia": "1. Arquitectura / Configuración y reglas de los mecanismos de DLP", "activo": true}, {"id_pregunta": 336, "control": "Filtrado web", "texto": "¿Se cuenta con mecanismos para el filtrado de navegación?", "evidencia": "1. Políticas de filtrado Web 2. Herramienta para el filtrado Web", "activo": true}, {"id_pregunta": 337, "control": "Gestión de medios extraíbles", "texto": "¿Los medios extraíbles están restringidos en la organización y el uso se permite solo para requisitos específicos a través de aprobaciones formales?", "evidencia": "1. Política de uso de medios extraíbles", "activo": true}, {"id_pregunta": 338, "control": "Seguridad para entornos de nube", "texto": "¿Se han identificado, documentado, implementado e incluido los requisitos de seguridad de la información en los acuerdos para el uso de servicios de nube?", "evidencia": "1. Requisitos de seguridad para el procesamiento de servicios en la nube", "activo": true}, {"id_pregunta": 339, "control": "Uso y regulación de controles criptográficos", "texto": "¿Se ha desarrollado e implementado políticas sobre el uso de controles criptográficos?", "evidencia": "1. Norma o política de criptografía 2. Técnicas criptográficas que se utilizan", "activo": true}, {"id_pregunta": 340, "control": "Copias de seguridad", "texto": "¿Se han definido políticas / procedimientos formales de respaldo y restauración? ¿Se prueban los datos respaldados de forma regular?", "evidencia": "1. Política / procedimiento de copia de seguridad y restauración 2. Registros de configuración de respaldos realizados sobre la información usada para la prestación del servicio 3. Evidencia de pruebas de restauración y funcionalidad de los datos (en el último año)", "activo": true}, {"id_pregunta": 341, "control": "Política de privacidad de datos", "texto": "¿Existe una política / estándar de privacidad de datos formalmente documentado que cubra la recopilación, uso, retención, eliminación y seguridad de la información personal de acuerdo con las disposiciones de las ley 1581 y demás decretos reglamentarios aplicables?", "evidencia": "1. Norma y política de privacidad de datos 2. Revisión y aprobación del departamento legal sobre las leyes, reglamentos y normas de privacidad identificadas 3. Inventarios de bases de datos con información de identificación personal", "activo": true}, {"id_pregunta": 342, "control": "Procedimientos de control de cambios", "texto": "¿Se cuenta con un procedimiento de gestión de cambios documentado formalmente, que considere (como mínimo) lo siguiente: - Identificación y registro de los cambios - Evaluación de impacto potencial - Autorización, prueba y aprobación", "evidencia": "1. Procedimientos de gestión de cambios 2. Bitácora o herramienta donde se lleva la trazabilidad de la gestión del control de cambios", "activo": true}, {"id_pregunta": 343, "control": "Sincronización de reloj", "texto": "¿Están sincronizados los relojes de todos los sistemas de información relevantes dentro de la organización con una fuente válida?", "evidencia": "1. Lista de servidores NTP implementados en el entorno, junto con la descripción de la fuente de tiempo", "activo": true}, {"id_pregunta": 344, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Se realizan pruebas de vulnerabilidad periódicamente sobre todos los componentes que intervienen en la prestación del servicio a la organización, considerando sistemas operativos, bases de datos, dispositivos de red?", "evidencia": "1. Informes de evaluación de vulnerabilidad de los componentes tecnológicos que hacen parte de la prestación del servicio", "activo": true}, {"id_pregunta": 345, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Están todos los sistemas de información y componentes tecnológicos actualizados con los últimos parches de seguridad?", "evidencia": "1. Informe periódico de gestión de parches para sistemas / componentes", "activo": true}, {"id_pregunta": 346, "control": "Controles contra malware", "texto": "¿Se han implementado mecanismos de protección antimalware formalmente documentados para redes, estaciones de trabajo, computadoras portátiles y otros dispositivos?", "evidencia": "1. Política de antivirus y software antimalware instalado en estaciones de trabajo. 2. Herramienta antimalware implementada", "activo": true}, {"id_pregunta": 347, "control": "Inteligencia sobre amenazas", "texto": "¿Están documentados e implementados los procedimientos para realizar analítica de amenazas?", "evidencia": "1. Procedimiento de analítica de amenazas 2. Informe de analítica de amenazas", "activo": true}, {"id_pregunta": 348, "control": "Responsabilidades y procedimientos de gestión de incidentes", "texto": "¿Están documentados e implementados los procedimientos / planes de gestión de incidentes de seguridad de la información?", "evidencia": "1. Política / procedimientos de gestión de incidentes", "activo": true}, {"id_pregunta": 349, "control": "Detección y notificación de incidentes", "texto": "¿Se informan los incidentes / violaciones de seguridad de la información a través de los canales de gestión adecuados y según el proceso definido? ¿Se cuenta con mecanismos de monitoreo automático sobre los registros de actividad de los usuarios en los sistemas de información (log de eventos)?", "evidencia": "1. Proceso de notificación de incidentes / eventos relacionados con la seguridad de la información 2. Directrices de registro de eventos de auditoría 3. Definición de herramientas de monitoreo de eventos de seguridad 4. Bitácora de gestión de incidentes", "activo": true}, {"id_pregunta": 350, "control": "Recolección de evidencia", "texto": "¿Se identifican, recopilan y conservan las evidencias para actividades relacionadas con la gestión de incidentes de seguridad de la información para su posterior análisis? ¿Se documentan las lecciones aprendidas?", "evidencia": "1. Proceso de recolección de evidencia para análisis de incidentes 2. Documento de lecciones aprendidas", "activo": true}]}, {"id_tipologia": 4, "nombre_tipologia": "Cumplimiento Regulatorio", "clave": "cu", "activo": true, "descripcion": "Evalua el cumplimiento regulatorio, laboral y normativo del tercero.", "preguntas": [{"id_pregunta": 401, "control": "Proceso de cumplimiento de los requisitos legales y reglamentarios", "texto": "¿¿Ejecuta la organización mecanismos de verificación periódica (auditorías internas, revisoría fiscal o autoevaluaciones) para asegurar el cumplimiento de las obligaciones contractuales y normativas, generando planes de acción trazables ante cualquier desviación detectada?", "evidencia": "1. Manual del programa de cumplimiento, junto con las responsabilidades asignadas a las personas 2. Evidencia de comunicación (por ejemplo, correo electrónico, procedimientos, intranet, sesiones de sensibilización, etc.) 3. Cronograma de Auditorías Internas de Cumplimiento / Calidad.", "activo": true}, {"id_pregunta": 402, "control": "Matriz de cumplimiento regulatorio", "texto": "¿Ha identificado formalmente los requisitos legales y contractuales aplicables al servicio (incluyendo SST, Protección de Datos, Ética y normas específicas del sector) y evidencia su comunicación efectiva al personal encargado de la ejecución del contrato?", "evidencia": "1. Matriz de requerimientos legales, estatutarios, reglamentarios y contractuales aplicables a la organización, junto con las responsabilidades y estado de cumplimiento. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las partes interesadas.", "activo": true}, {"id_pregunta": 403, "control": "Monitoreo al cumplimiento regulatorio", "texto": "¿Dispone de un marco de políticas y procedimientos de seguridad de la información documentado y aprobado por la Dirección, acorde con la naturaleza de sus servicios, que establezca controles para proteger la confidencialidad, integridad y disponibilidad de la información manejada?", "evidencia": "1. Informe de estado de cumplimiento de la matriz de requerimientos legales. 2. Manual o Política General de Seguridad de la Información (Vigente).", "activo": true}, {"id_pregunta": 404, "control": "Certificación Estándares Mínimos SG-SST", "texto": "¿Acredita el cumplimiento de los Estándares Mínimos del SG-SST (Res. 0312/2019) mediante Certificación ARL con calificación >85% (o Plan de Mejora vigente) y evidencia la operación activa del COPASST?", "evidencia": "1. Certificado de la ARL (vigencia < 30 días). 2. Actas de reunión del COPASST (último trimestre).", "activo": true}, {"id_pregunta": 405, "control": "Sistema de Gestión de PQRSD", "texto": "¿Cuenta con un mecanismo formal de registro y seguimiento (físico, digital o tecnológico, acorde a su volumen operativo) que garantice la recepción, trazabilidad y respuesta oportuna de las PQRSD, dando estricto cumplimiento a los términos perentorios establecidos en la Ley 1755 de 2015 (15 días hábiles generales) y la Ley 1437 de 2011?", "evidencia": "1. Procedimiento o Protocolo de Atención de PQRSD. 2. Evidencia de seguimiento (ej. Planilla de Excel, Bitácora de radicación o reporte de sistema) donde conste fecha de recibido vs. fecha de respuesta. 3. Indicadores de oportunidad (Si aplica por volumen).", "activo": true}, {"id_pregunta": 406, "control": "Control de Aportes Seguridad Social", "texto": "¿Realiza validaciones mensuales para garantizar el pago correcto, completo y oportuno de los aportes a Seguridad Social y Parafiscales de todo el personal adscrito al contrato (Art. 50 Ley 789 de 2002)?", "evidencia": "1. Certificación de Revisor Fiscal o Representante Legal (si no está obligado a tener Revisor) donde conste el pago de los aportes.", "activo": true}, {"id_pregunta": 407, "control": "Sistema Integrado de Gestión (Q & E)", "texto": "¿Cuenta con un Sistema de Gestión de Calidad y Ambiental (certificado o propio) que asegure la mejora continua de los procesos, el cumplimiento de acuerdos de nivel de servicio (ANS) y la correcta disposición de residuos o manejo ambiental acorde a la normativa?", "evidencia": "1. Evidencia de control de calidad del servicio. 2. Plan de Gestión Integral de Residuos (PGIRS) si aplica.", "activo": true}, {"id_pregunta": 408, "control": "Organización de Archivos y Cero Papel", "texto": "¿Aplica lineamientos de Gestión Documental y \"Cero Papel\", garantizando la correcta organización, digitalización, custodia y transferencia de la información producida en ejecución del contrato?", "evidencia": "1. Tabla de Retención Documental (TRD) o Procedimiento de Archivo y Gestión Documental. 2. Política de Cero Papel o eficiencia administrativa.", "activo": true}]}, {"id_tipologia": 5, "nombre_tipologia": "Fraude y Corrupción", "clave": "fr", "activo": true, "descripcion": "Evalua los controles antifraude, anticorrupcion y de etica empresarial.", "preguntas": [{"id_pregunta": 501, "control": "Política general ABAC (políticas de antifraude y anticorrupción)", "texto": "¿Se cuenta con una política en cuanto a la gestión del riesgo de fraude y corrupción? ¿Las políticas, procedimientos y estándares están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - divulgado a todas las partes interesadas relevantes", "evidencia": "1. Política Antifraude y Anticorrupción 2. Evidencia de divulgación de la Política Antifraude y anticorrupción a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 502, "control": "Ambiente de control", "texto": "¿Se encuentra definido el código de conducta y ética de la Entidad, en el cual se consideren acciones disciplinarias por acciones de Fraude o corrupción?", "evidencia": "1. Código de conducta y ética", "activo": true}, {"id_pregunta": 503, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las atribuciones y directrices en cuanto a regalos, atenciones y gratificaciones?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 504, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las directrices en cuanto al manejo de donaciones, contribuciones públicas, patrocinios, y uso indebido de los recursos?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 505, "control": "Ambiente de control", "texto": "¿Se consideran medidas de controles sobre los procesos de compras y adquisiciones, garantizando pluralidad de proponentes y transparencia en los procesos?", "evidencia": "1. Manual de contrataciones y adquisiciones", "activo": true}, {"id_pregunta": 506, "control": "Ambiente de control", "texto": "¿Se encuentran definidas directrices en cuanto al conflicto de interés en la ejecución de los procesos de la Entidad?", "evidencia": "1. Procedimiento de conflictos de interés", "activo": true}, {"id_pregunta": 507, "control": "Ambiente de control", "texto": "Cuenta con mecanismos para identificar y reportar eventos de fraude y corrupción en la organización", "evidencia": "1. Línea de denuncias", "activo": true}, {"id_pregunta": 508, "control": "Ambiente de control", "texto": "¿Se cuenta con mecanismos de análisis y monitoreo sobre los reportes de eventos de Fraude y corrupción (v.gr. Línea ética)?", "evidencia": "1. Monitoreo a la gestión de eventos 2. Que pasa con la información producto del monitoreo, se analizan las casuísticas y se toman acciones 3. Se presenta a la Alta Dirección los resultados producto del monitoreo y se toman decisiones frente a dichos resultados", "activo": true}, {"id_pregunta": 509, "control": "Ambiente de control", "texto": "La organización cuanta con Programas de Transparencia y Ética Empresarial", "evidencia": "1. Programa de Transparencia y Ética Empresarial", "activo": true}, {"id_pregunta": 510, "control": "Planes de capacitación sobre el sistema de Política Antifraude y Anticorrupción", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con las Política Antifraude y Anticorrupción? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 6, "nombre_tipologia": "Lavado de Activos y Financiacion del Terrorismo (LAFT)", "clave": "laft", "activo": true, "descripcion": "Evalua los controles del sistema de prevencion de LA/FT segun normativa aplicable.", "preguntas": [{"id_pregunta": 601, "control": "Políticas y procedimientos", "texto": "¿La Entidad cuenta con un Sistema de Prevención de Riesgo de LA/FT, con lineamientos definidos que contribuyan a prevenir y/o a mitigar el riesgo de LA/FT?", "evidencia": "1. Políticas y/o manual del sistema LA/FT", "activo": true}, {"id_pregunta": 602, "control": "Consulta de listas restrictivas", "texto": "¿Se cuenta con procedimientos ejecutados por la entidad con relación al seguimiento a las listas ONU y OFAC? ¿La empresa cuenta con una herramienta tecnológica de consulta de listas vinculantes y no vinculantes?", "evidencia": "1. Procedimiento para el seguimiento a las listas ONU y OFAC, y fuente de consulta de información de listas ONU y OFAC", "activo": true}, {"id_pregunta": 603, "control": "Debida Diligencia Contrapartes", "texto": "¿La empresa cuenta con procedimientos de conocimiento de las contrapartes (incluye cuartas partes vinculadas a la ejecución del contrato con la organización)?", "evidencia": "1. Procedimientos establecidos.", "activo": true}, {"id_pregunta": 604, "control": "Capacitación", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con LA/FT? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro a capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 605, "control": "Identificación y medición del riesgo", "texto": "¿La empresa cuenta con una matriz u otro instrumento que permita la identificación, medición, segmentación y evaluación del riesgo LA/FT?", "evidencia": "1. Matriz u otro mecanismo de riesgos y controles asociada LA/FT, teniendo en cuenta los factores de riesgo.", "activo": true}, {"id_pregunta": 606, "control": "Monitoreo y gestión sobre los riesgos", "texto": "¿El sistema de prevención de LA/FT implementado en su compañía permite identificar operaciones inusuales y sospechosas?", "evidencia": "1. Mecanismos de reporte o informes", "activo": true}]}, {"id_tipologia": 7, "nombre_tipologia": "Capacidad Financiera", "clave": "fi", "activo": true, "descripcion": "Evalua la solidez financiera y capacidad de cumplimiento del tercero.", "preguntas": [{"id_pregunta": 701, "control": "Identificación y medición del riesgo financiero", "texto": "¿Se cuenta con una metodología de gestión de riesgo financiero actualizada que considere: - Identificación de riesgos financiero que por eventos adverso o alguna fluctuación financiera puedan afectar negativamente la entidad y la prestación del servicio a la organización (riesgo de endeudamiento, riesgo de liquidez, Rentabilidad Operacional de los Activos - ROA y Rentabilidad Operacional sobre el Patrimonio - ROE) - Proceso de medición del riesgo y de la elaboración y aplicación de diferentes estrategias para gestionarlo y hacerle frente, en función de su gravedad y en función de las consecuencias que pueda tener dentro de la empresa y la prestación del servicio a la organización.", "evidencia": "1. Políticas y/o manual con la metodología de gestión de riesgo financiero de la entidad. 2. Documento donde se evidencie la gestión de los riesgos.", "activo": true}, {"id_pregunta": 702, "control": "Monitoreo y gestión sobre los riesgos financiero", "texto": "¿Se cuenta con indicadores financieros (Liquidez, Endeudamiento, ROA y ROE) que generen las alertas a la entidad y son revisados periódicamente (mensual o trimestralmente) para identificar cambios que puedan ser reveladores de problemas con el riesgo?", "evidencia": "1. Informes de seguimiento y gestión de riesgos financieros de la entidad, incluyendo el análisis realizado, las acciones y decisiones que se deriven del mismo.", "activo": true}]}, {"id_tipologia": 8, "nombre_tipologia": "Riesgo Pais", "clave": "pa", "activo": false, "descripcion": "Evalua la exposicion al riesgo pais y entorno regulatorio externo.", "preguntas": [{"id_pregunta": 801, "control": "Identificación y medición del riesgo país", "texto": "¿Se cuenta con una metodología de gestión de riesgo país actualizada que considere el entorno legal, regulatorio, geopolítico, social y económico del país donde se mantiene la operación del negocio y sean considerados importantes obstáculos para hacer negocios a nivel mundial (por ejemplo, las recesiones económicas, la agitación política y los desastres naturales) e incluya: - Identificación de riesgos asociado con la realización del comercio en regiones específicas. - Niveles de exposición al riesgo país en los planos económicos, político, externo y comercial. - Evaluar de la exposición al riesgo de los proveedores por país.", "evidencia": "1. Políticas y procedimientos para la gestión de riesgo país.", "activo": true}, {"id_pregunta": 802, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se cuenta con indicadores descriptivos y/o cuantitativos para identificar potenciales fuentes de riesgos país que generen las alertas respectivas a la organización en caso de modificaciones significativas del entorno?", "evidencia": "1. Informes de seguimiento y comparación del riesgo país de la organización, incluyendo los riesgos residuales de los diferentes entornos de impacto. 2. Notificaciones o alertamientos de la inestabilidad del país de operación. 3. Planes de tratamiento de riesgos país para minimizar los posibles impactos.", "activo": true}, {"id_pregunta": 803, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se tienen identificadas las regulaciones relacionadas con la protección de los datos en el país y se realiza monitoreo al cumplimiento de las mismas?", "evidencia": "1. Identificación y análisis de las regulaciones de protección de datos aplicables. 2. Informe de acciones, seguimiento y monitoreo de la implementación de controles de protección de datos.", "activo": true}]}], "cliente2": [{"id_tipologia": 1, "nombre_tipologia": "Riesgo Operacional", "clave": "op", "activo": true, "descripcion": "Evalua los procesos, riesgos y controles operacionales del tercero.", "preguntas": [{"id_pregunta": 101, "control": "Identificación de riesgos", "texto": "¿Se cuenta con una metodología de identificación de riesgos operacionales(potenciales y ocurridos) asociados a cada una de las actividades de los procesos requeridos para la prestación del servicio a la organización?", "evidencia": "1. Matriz de riesgo o documento identificando los riesgos operacionales que se pueden materializar en el flujo de actividades para el logro de la prestación del servicio a la organización", "activo": true}, {"id_pregunta": 102, "control": "Medición de la probabilidad de ocurrencia de los riesgos operacionales y su impacto.", "texto": "¿Se cuenta con el perfil de riesgo inherente de los procesos usados para la prestación del servicio a la organización, considerando factores cualitativos y/o cuantitativos en la metodología de medición?", "evidencia": "1. Perfil de riesgo inherente de las actividades asociadas a los procesos usados para la prestación del servicio con la organización 2. Definición de factores cualitativos y/o cuantitativos para la medición del riesgo", "activo": true}, {"id_pregunta": 103, "control": "Medidas para controlar los riesgos inherentes.", "texto": "¿Se tiene identificados los controles, y la medición del perfil de riesgo residual para las actividades de los procesos usados en la prestación del servicio?", "evidencia": "1. Documento con los controles implementados para la mitigación de los riesgos identificados en la prestación del servicio para la organización. 2. Perfil de riesgo residual de los riesgos identificados y gestionados en la prestación del servicio. 3. Estrategias implementadas que responden al tratamiento de los riesgos (aceptación, eliminación, transferencia) ubicados fuera del apetito de riesgo definido por la organización.", "activo": true}, {"id_pregunta": 104, "control": "Monitoreo periódico del perfil de riesgo y de la exposición a pérdidas.", "texto": "¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?", "evidencia": "1. Documento donde se observe las actividades efectuadas de monitoreo y seguimiento a los planes de acción, riesgos residuales y controles.", "activo": true}, {"id_pregunta": 105, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con un procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo materializados en la prestación del servicio a la organización.", "evidencia": "1. Documento con el procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo operacional. 2. Bitácora con el registro de eventos ocurridos durante la prestación del servicio a la organización. 3. Reporte a la organización de lecciones aprendidas y acciones implementadas .", "activo": true}, {"id_pregunta": 106, "control": "Registros de Eventos operacionales", "texto": "¿Se cuenta con protocolo de comunicación con la organización ante la identificación de eventos de riesgo, que impacten o puedan impactar el servicio contratado?", "evidencia": "1. Protocolo de comunicación. 2. Canales de comunicación definidos. 3. Divulgación del protocolo y canales de comunicación a los colaboradores que participan en la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 107, "control": "Planes de capacitación sobre el sistema de gestión de riesgo", "texto": "¿Se cuenta con un plan de capacitación que considere la gestión de los riesgos operacionales a los funcionarios que participan en la prestación del servicio a la organización? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Plan o cronograma de capacitación a los funcionarios sobre la prestación del servicio a la organización, los riesgos que se pueden materializar y los controles para la mitigación de los escenarios de riesgo identificados. 2. Bitácora de registro de las capacitaciones impartidas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 108, "control": "Diligencia de cuarta parte", "texto": "¿Los acuerdos contractuales con las cuartas partes incluyen los requisitos de control definidos por la organización? '¿Se realizan evaluaciones de riesgos antes de la incorporación de terceros en la prestación del servicio a la organización?", "evidencia": "1. Listado de cuartas partes involucradas en la prestación del servicio. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las cuartas partes. 3. Clausulas contractuales con las cuartas partes que incluyan los requisitos de control definidos por la organización 4. Riesgos identificados y gestionados por las cuartas partes que afecten la prestación del servicio a la organización.", "activo": true}]}, {"id_tipologia": 2, "nombre_tipologia": "Continuidad de Negocio", "clave": "cn", "activo": true, "descripcion": "Evalua la resiliencia, planes de continuidad y capacidad de recuperacion del tercero.", "preguntas": [{"id_pregunta": 201, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un Plan de continuidad del negocio actualizado?", "evidencia": "1. Plan de continuidad del negocio", "activo": true}, {"id_pregunta": 202, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Dentro de la matriz de riesgos, se encuentran identificados, y analizados los riesgos que afectan la continuidad del negocio para los servicios contratos por la organización?", "evidencia": "1. Matriz de riesgos con la identificación, análisis y evaluación de los riesgos de continuidad de negocio que pueden afectar la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 203, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de contingencia donde se incluyan los servicios contratados por la organización ?", "evidencia": "1. Plan de contingencia asociado a la prestación del servicio que contemple: . - Actividades de preparación - Actividades durante la contingencia - Actividades de retorno a la normalidad", "activo": true}, {"id_pregunta": 204, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿Tienen un plan de administración de crisis? ¿El plan de administración de Crisis contempla: * Alcance organizacional (procesos, sedes, servicios críticos). * Tipos de crisis cubiertas (ciberataques, incidentes operativos, legales, reputacionales, sanitarios, desastres naturales, Otros). * Interlocutores por tipo de Crisis?", "evidencia": "1. Plan de administración de crisis", "activo": true}, {"id_pregunta": 205, "control": "Programa de gestión de la continuidad del negocio (BCM)", "texto": "¿ Tienen establecido un plan de recuperación de desastres (DRP)?", "evidencia": "1. Plan de recuperación de desastres (DRP) 2. Procedimientos de recuperación para los servicios tecnológicos y/o sistemas de información que soportan la operación del servicio a la organización.", "activo": true}, {"id_pregunta": 206, "control": "Análisis de impacto al negocio (BIA)", "texto": "¿Dentro del análisis de impacto BIA, incluyen los servicios contratados por la organización? ¿para los servicios contratadas por la organización se encuentran identificados los RTO Y RPO? ¿los RTO y RPO identificados se encuentran alineados con los establecidos por la organización en los proceso que soporta? ¿Dentro de la BIA, identifican el personal mínimo que garantice la operación de los servicios contratados por la organización? ¿Dentro de la BIA se contemplan los activos necesarios que garanticen la operación de los servicios contratados por la organización?", "evidencia": "1. Análisis de impacto del negocio ( BIA), con la definición de: - Actividades criticas asociadas a la prestación del servicio - RTO y RPO - Personal mínimo requerido para la continuidad del servicio durante una contingencia. - Recursos mínimos necesario para dar continuidad a la prestación del servicio durante una contingencia. (equipos de computo, puestos de trabajo, ubicaciones alternas de operación, impresoras, archivadores, entre otros) - Servicios de TI y/o sistemas de información requeridos en una contingencia para operar el servicio prestado a la organización.", "activo": true}, {"id_pregunta": 207, "control": "Pruebas al plan de continuidad de negocio", "texto": "¿Entregaron el cronograma de las pruebas de continuidad de acuerdo a las obligaciones contractuales? ¿se realizaron las pruebas y ejercicios para evaluar la eficacia de las estrategias de continuidad de la organización según el alcance definido? ¿el tercero realizo y envió el respectivo informe de los resultados de las pruebas de continuidad realizadas? ¿dentro del desarrollo de las pruebas de continuidad realizadas, se incluyo escenarios en donde se validen los servicios contratados por parte de la organización? ¿Se encuentra alineado el resultado de las pruebas, con la promesa de servicio que el proveedor tiene con la organización a nivel de recuperación ante incidentes que se presenten y con los ANS ¿El proveedor participa en las pruebas que programa la organización dentro de las actividades se Continuidad del Negocio?", "evidencia": "1. Cronograma de pruebas a acorde con las obligaciones contractuales. 2. Informe de resultados de las pruebas ejecutadas 3. Envió del correo de socialización de las pruebas a la organización. 4. Informe de resultados de las pruebas ejecutadas en alineación con la programación de pruebas PCN de la organización.", "activo": true}, {"id_pregunta": 208, "control": "Centro de datos", "texto": "El proveedor cuenta con un centro de datos principal y un centro de datos alterno debidamente implementado y operando, acorde con las necesidades del servicio y actividades contratadas con la organización? 'El Centro de Datos Alterno con que cuenta el proveedor está definido para activarse acorde con los RTO requeridos por la organización (4 horas)? 'El Proveedor cuenta con un Plan de recuperación de Desastres (DRP) , alineado al servicio y actividades contratadas por la organización, con detalle de las actividades de contingencia tecnológicas que permiten activarlo y operar ante una indisponibilidad que se le presente al proveedor en su centro de datos principal? ¿ El TIER implementado en los centros de datos principal y alterno están en nivel III o IV?", "evidencia": "1. Documento Certificación del Plan de Recuperación de Desastres que incluya la implementación de los CDP y CDA y alineado a los servicios y actividades contratados con la organización. 2. Planes de recuperación tecnológica, alineados a los servicios y actividades contratados con la organización. 3. Para los centros de datos tercerizadas suministrar la certificación SOC2 de los controles evaluados 4. Ultimo informe de auditoria realizado sobre los controles de seguridad física, lógica y ambiental del centro de datos (Tanto Propio como del tercero en caso de que aplique). 5. Documento Certificación del Plan de Recuperación de Desastres debidamente implementado y operando acorde con los servicios y actividades contratadas con la organización. 6. Documento certificación del TIER implementado.", "activo": true}, {"id_pregunta": 209, "control": "Plan de capacitaciones", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con el plan de continuidad del negocio (PCN)? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Documento con el plan o cronograma de capacitación. 2. Documento donde se relaciones las personas capacitadas. 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 3, "nombre_tipologia": "Seguridad de la Información y Ciberseguridad", "clave": "si", "activo": true, "descripcion": "Evalua los controles de seguridad de la informacion, ciberseguridad y proteccion de datos.", "preguntas": [{"id_pregunta": 301, "control": "Política y procedimientos de seguridad de la información", "texto": "¿Las políticas, procedimientos y estándares de seguridad de la información están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - comunicadas a todas las partes interesadas relevantes?", "evidencia": "1. Documentos de normas y políticas de seguridad de la información con resumen de revisión y aprobación 2. Comunicación por correo electrónico de políticas y normas a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 302, "control": "Roles, responsabilidades y segregación de funciones de seguridad de la información", "texto": "¿Se definen y documentan formalmente los roles y responsabilidades sobre la gestión de la seguridad de la información? ¿Las responsabilidades en conflicto están segregadas entre diferentes roles?", "evidencia": "1. Estructura de gobierno de la seguridad de la información 2. Documento de roles y responsabilidades para todos roles de la estructura de gobierno de seguridad", "activo": true}, {"id_pregunta": 303, "control": "Marco y política de gestión de riesgos", "texto": "¿Existe una política y un modelo formal de gestión de riesgos de seguridad, revisado y actualizado periódicamente y comunicado a todas las partes interesadas? ¿Contempla seguridad sobre la información y los componentes tecnológicos que soportan el servicio prestado a la organización, que considere identificación de amenazas, vulnerabilidades y controles de seguridad?", "evidencia": "1. Política de gestión de riesgos de seguridad 2. Modelo de gestión de riesgos de seguridad 3. Matriz de riesgos de seguridad sobre activos de información, con vulnerabilidades, amenazas, valoración de probabilidad e impacto, identificación y valoración de controles. 4. Planes de tratamiento de riesgo residual sobre los componentes tecnológicos de soportes a la organización 5. Seguimiento del plan de tratamiento de riesgos", "activo": true}, {"id_pregunta": 304, "control": "Evaluación previa a la contratación", "texto": "¿Se realizan estudios de seguridad previo a la contratación de los empleados que tendrán acceso a la información del servicio prestado a la organización?", "evidencia": "1. Políticas de análisis de estudios de seguridad previo a la contratación", "activo": true}, {"id_pregunta": 305, "control": "Términos y condiciones de contratación", "texto": "¿Los contratos de trabajo consideran las responsabilidades relacionadas con la seguridad de la información a la que tendrán acceso los empleados?", "evidencia": "1. Clausulas de los contratos en materia de seguridad de la información. 2. Listado de empleados que han firmado los términos y condiciones de empleo con respecto a la seguridad de la información", "activo": true}, {"id_pregunta": 306, "control": "Proceso disciplinario por violaciones a la seguridad", "texto": "¿Existe un proceso disciplinario formalmente documentado, revisado, actualizado y comunicado en relación a la violación del cumplimiento de las directrices de seguridad por parte de los empleados y subcontratistas (cuando corresponda)?", "evidencia": "1. Política / proceso disciplinario con respecto a la violación de la seguridad / privacidad y el uso indebido de la información 2. Evidencia de comunicación (correo electrónico, instantánea del portal electrónico) para hacer circular la política / proceso disciplinario a todos los empleados", "activo": true}, {"id_pregunta": 307, "control": "Capacitación y cultura en seguridad de la información", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con cultura de seguridad de la información para empleados y subcontratistas? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Calendario del programa de cultura de seguridad 2. Registros de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 308, "control": "Terminación o cambio de responsabilidades laborales", "texto": "¿Se recuperan / eliminan todos los activos / derechos de acceso de los empleados que han renunciado, transferido, rescindido o al finalizar el contrato?", "evidencia": "1. Proceso de retiro de accesos y devolución de información en la terminación de la contratación", "activo": true}, {"id_pregunta": 309, "control": "Inventario, clasificación y etiquetado de activos de información", "texto": "¿Se mantienen los inventarios de activos de información involucrados en la prestación del servicio a la organización?¿Esto incluye activos de información físicos, digitales y electrónicos? '¿Todos los activos de información se encuentran clasificados en sus tres características y etiquetados según su clasificación?", "evidencia": "1. Inventario de activos de información clasificados y valorados en los atributos de confidencialidad, integridad y disponibilidad 2. Política de etiquetado de los activos de información", "activo": true}, {"id_pregunta": 310, "control": "Política de uso aceptable", "texto": "¿La política de uso aceptable de la información está formalmente documentada, revisada y actualizada anualmente? ¿La política de uso aceptable es aceptada por todos los empleados y subcontratistas cuando corresponda?", "evidencia": "1. Política de uso aceptable 2. Reconocimiento / seguimiento de aceptación de la política de uso aceptable por parte de los empleados", "activo": true}, {"id_pregunta": 311, "control": "Eliminación de medios y disposición final de información", "texto": "¿Están documentados, actualizados e implementados los procedimientos para la sanitización y destrucción de medios en des huso?", "evidencia": "1. Procedimiento de eliminación segura de la información", "activo": true}, {"id_pregunta": 312, "control": "Administración de cuentas de acceso", "texto": "¿Se cuenta con un proceso de gestión de acceso lógico para otorgar / modificar y revocar el acceso del usuario a los sistemas y servicios de información con las siguientes consideraciones: - Cuenta única para cada usuario según la convención de nomenclatura - Los ID compartidos (si es necesario) están documentados y aprobados por los equipos de seguridad - Acceso en función de la matriz de control de acceso definida por el responsable del activo - Autorizaciones del jefe inmediato para la asignación de los permisos solicitados - Separación adecuada de funciones para los roles de los usuarios según los conflictos de interés. - Eliminación inmediata después del retiro de los empleados o terceros - Registros de autorizaciones para usuarios registrados y rechazados?", "evidencia": "1. Proceso de administración de cuentas de acceso", "activo": true}, {"id_pregunta": 313, "control": "Revisión de acceso de usuario", "texto": "¿Se realiza una revisión anual (al menos) del acceso de los usuarios configurado en los sistemas de información usados para la prestación del servicio?", "evidencia": "1. Proceso de certificación de accesos", "activo": true}, {"id_pregunta": 314, "control": "Gestión de contraseñas", "texto": "¿Se han implementado sistemas de administración de contraseñas que consideren: - Complejidad de la contraseña - Caducidad o antigüedad de la contraseña - Intentos de inicio de sesión fallidos - Tiempos de espera de sesión - Historial de contraseñas - Cifrado de contraseña - Grabación y transmisión de contraseñas - Las contraseñas deben asignarse mediante un proceso de gestión formal y los destinatarios deben cambiarlas después del primer inicio de sesión.?", "evidencia": "1. Documentación de la política de contraseñas", "activo": true}, {"id_pregunta": 315, "control": "Acceso a código fuente", "texto": "¿El código fuente está protegido para - Evitar el almacenamiento de bibliotecas de fuentes de programas en sistemas locales - Restringir el acceso al personal de desarrollo designado - Separar el código fuente en desarrollo de los programas que están en producción - Archivar periódicamente versiones anteriores de código?", "evidencia": "1. Política de control de acceso a código fuente", "activo": true}, {"id_pregunta": 316, "control": "Autenticación de usuario para conexiones externas y remotas", "texto": "¿Se definen e implementan directrices para asegurar el acceso remoto? ¿Con la contingencia actual como se está realizando el trabajo para la ejecución de actividades relacionados con la prestación del servicio de la organización? ¿Qué controles adicionales se han considerado para el trabajo remoto con la contingencia?", "evidencia": "1. Documento de políticas de acceso remoto 2. Tipo de tecnología utilizadas para el acceso remoto", "activo": true}, {"id_pregunta": 317, "control": "Seguridad de acceso inalámbrico", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso inalámbrico? ¿El acceso a las redes inalámbricas está restringido solo a personas autorizadas?", "evidencia": "1. Pautas de uso de la red inalámbrica", "activo": true}, {"id_pregunta": 318, "control": "Control de acceso para dispositivos móviles", "texto": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso a dispositivos móviles?", "evidencia": "1. Pautas de uso de dispositivos móviles", "activo": true}, {"id_pregunta": 319, "control": "Gestión de dispositivo Propio (BYOD)", "texto": "¿Existen restricciones y pautas de uso de dispositivos personales en la prestación del servicio?", "evidencia": "1, Política de \"Trae tu Propio Dispositivo\" (BYOD)", "activo": true}, {"id_pregunta": 320, "control": "Gestión de cuentas de acceso privilegiado", "texto": "¿Se autoriza y supervisa la asignación y el uso de cuentas de acceso privilegiado?", "evidencia": "1. Políticas de asignación y uso de cuentas de acceso privilegiado (cuentas de administración) 2. Matriz o herramienta de control para la asignación de cuentas de acceso privilegiado.", "activo": true}, {"id_pregunta": 321, "control": "Controles de seguridad física", "texto": "¿Existen e implementan políticas y procedimientos de seguridad física formalmente documentados?", "evidencia": "1. Políticas de mecanismos de control de seguridad física sobre las zonas de procesamiento de información", "activo": true}, {"id_pregunta": 322, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿SE cuenta con un perímetros de seguridad (barreras tales como paredes, puertas de entrada controladas por tarjeta o mostradores de recepción con personal) para proteger las áreas de trabajo?", "evidencia": "1. Lista de controles de seguridad física aplicados 2. Proceso de acceso de visitantes como credenciales, sistemas, registros, etc.", "activo": true}, {"id_pregunta": 323, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿El acceso a las instalaciones dedicadas al procesamiento de información está restringido físicamente solo al personal autorizado?", "evidencia": "1. Listado de instalaciones de procesamiento de información necesaria para la prestación del servicio", "activo": true}, {"id_pregunta": 324, "control": "Restricción de acceso a áreas seguras de trabajo y / o entrega", "texto": "¿Se cuenta con circuito cerrado de televisión (CCTV) para monitorear las instalaciones las 24 horas del día, los 7 días de la semana? ¿Conserva la cobertura de las imágenes de CCTV durante al menos 3 meses?", "evidencia": "1. Política de monitoreo bajo CCTV - Ubicación de las cámaras en las instalaciones donde se procesa información y que hace parte de la prestación del servicio a la organización. - Tiempo de retención de las grabaciones", "activo": true}, {"id_pregunta": 325, "control": "Controles de seguridad ambiental", "texto": "¿Existen sistemas de detección de incendios e inundación para minimizar el daño a la información y las instalaciones?", "evidencia": "1. Documento del proceso de respuesta a eventos de incendio e inundación 2. Informes de pruebas en los mecanismos de detección de incendio e inundación", "activo": true}, {"id_pregunta": 326, "control": "Protección y mantenimiento de equipos", "texto": "¿Están los sistemas de información críticos protegidos por dispositivos de suministro de energía ininterrumpida (UPS)?", "evidencia": "1. Informes de mantenimiento preventivo del generador de respaldo y de las UPS.", "activo": true}, {"id_pregunta": 327, "control": "Control de acceso a la red", "texto": "¿Existen y se encuentran implementados políticas y procedimientos de seguridad en la de red de datos?", "evidencia": "1. Directrices de control de acceso a la red", "activo": true}, {"id_pregunta": 328, "control": "Seguridad de la red y los servicios de red", "texto": "¿La red está segmentada y segregada física / lógicamente?", "evidencia": "1. Diagrama de red donde se encuentran los componentes tecnológicos requeridos para la prestación del servicio a la organización.", "activo": true}, {"id_pregunta": 329, "control": "Seguridad de la red y los servicios de red", "texto": "¿Se cuenta con firewalls en todas las conexiones con redes externas o DMZ?", "evidencia": "1. Diagrama de topología de red que indique los firewalls instalados 2. Documento de directrices de configuración del firewall", "activo": true}, {"id_pregunta": 330, "control": "Seguridad de la red y los servicios de red", "texto": "¿Realiza periódicamente pruebas de penetración sobre la infraestructura tecnológica?", "evidencia": "1. Informes de evaluación de intrusión realizadas sobre los sistemas de información que soportan el servicio a la organización 2. Cronograma de pruebas de penetración y alcance definido para cada una.", "activo": true}, {"id_pregunta": 331, "control": "Requisitos y especificaciones de seguridad de la información", "texto": "¿Se definen y cumplen los requisitos de seguridad de la información para la adquisición de nuevos productos, proyectos de desarrollo?", "evidencia": "1. Especificaciones de los requisitos de seguridad de la información para nuevos sistemas de información 2. Pautas de desarrollo seguro", "activo": true}, {"id_pregunta": 332, "control": "Pruebas de aceptación y seguridad de la aplicación", "texto": "¿Se realizan pruebas de aceptación y seguridad del sistema durante el desarrollo y antes de la implementación?", "evidencia": "1. Política de pruebas de seguridad y criterios de aceptación 2. Política de revisión de código seguro para aplicaciones", "activo": true}, {"id_pregunta": 333, "control": "Instalación y configuración", "texto": "¿Cuenta con un procedimiento formal para la instalación y configuración segura (hardening) mediante guías aceptadas por la industria para los componentes de infraestructura y sistemas de información usados en la prestación del servicio?", "evidencia": "1. Procedimiento de instalación y configuración segura de los diferentes componentes de infraestructura y sistemas de información 2. Líneas base de aseguramiento", "activo": true}, {"id_pregunta": 334, "control": "Mensajería electrónica", "texto": "¿Se definen, revisan y comunican las directrices para el uso seguro de la mensajería electrónica, que consideren la restricción y protección de los datos transferidos, incluidos los archivos adjuntos?", "evidencia": "1. Directrices de mensajería electrónica", "activo": true}, {"id_pregunta": 335, "control": "Fuga de información", "texto": "¿Se implementan mecanismos para evitar la fuga de datos a través de una solución DLP adecuada, restricción de correo electrónico y proxy web?", "evidencia": "1. Arquitectura / Configuración y reglas de los mecanismos de DLP", "activo": true}, {"id_pregunta": 336, "control": "Filtrado web", "texto": "¿Se cuenta con mecanismos para el filtrado de navegación?", "evidencia": "1. Políticas de filtrado Web 2. Herramienta para el filtrado Web", "activo": true}, {"id_pregunta": 337, "control": "Gestión de medios extraíbles", "texto": "¿Los medios extraíbles están restringidos en la organización y el uso se permite solo para requisitos específicos a través de aprobaciones formales?", "evidencia": "1. Política de uso de medios extraíbles", "activo": true}, {"id_pregunta": 338, "control": "Seguridad para entornos de nube", "texto": "¿Se han identificado, documentado, implementado e incluido los requisitos de seguridad de la información en los acuerdos para el uso de servicios de nube?", "evidencia": "1. Requisitos de seguridad para el procesamiento de servicios en la nube", "activo": true}, {"id_pregunta": 339, "control": "Uso y regulación de controles criptográficos", "texto": "¿Se ha desarrollado e implementado políticas sobre el uso de controles criptográficos?", "evidencia": "1. Norma o política de criptografía 2. Técnicas criptográficas que se utilizan", "activo": true}, {"id_pregunta": 340, "control": "Copias de seguridad", "texto": "¿Se han definido políticas / procedimientos formales de respaldo y restauración? ¿Se prueban los datos respaldados de forma regular?", "evidencia": "1. Política / procedimiento de copia de seguridad y restauración 2. Registros de configuración de respaldos realizados sobre la información usada para la prestación del servicio 3. Evidencia de pruebas de restauración y funcionalidad de los datos (en el último año)", "activo": true}, {"id_pregunta": 341, "control": "Política de privacidad de datos", "texto": "¿Existe una política / estándar de privacidad de datos formalmente documentado que cubra la recopilación, uso, retención, eliminación y seguridad de la información personal de acuerdo con las disposiciones de las ley 1581 y demás decretos reglamentarios aplicables?", "evidencia": "1. Norma y política de privacidad de datos 2. Revisión y aprobación del departamento legal sobre las leyes, reglamentos y normas de privacidad identificadas 3. Inventarios de bases de datos con información de identificación personal", "activo": true}, {"id_pregunta": 342, "control": "Procedimientos de control de cambios", "texto": "¿Se cuenta con un procedimiento de gestión de cambios documentado formalmente, que considere (como mínimo) lo siguiente: - Identificación y registro de los cambios - Evaluación de impacto potencial - Autorización, prueba y aprobación", "evidencia": "1. Procedimientos de gestión de cambios 2. Bitácora o herramienta donde se lleva la trazabilidad de la gestión del control de cambios", "activo": true}, {"id_pregunta": 343, "control": "Sincronización de reloj", "texto": "¿Están sincronizados los relojes de todos los sistemas de información relevantes dentro de la organización con una fuente válida?", "evidencia": "1. Lista de servidores NTP implementados en el entorno, junto con la descripción de la fuente de tiempo", "activo": true}, {"id_pregunta": 344, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Se realizan pruebas de vulnerabilidad periódicamente sobre todos los componentes que intervienen en la prestación del servicio a la organización, considerando sistemas operativos, bases de datos, dispositivos de red?", "evidencia": "1. Informes de evaluación de vulnerabilidad de los componentes tecnológicos que hacen parte de la prestación del servicio", "activo": true}, {"id_pregunta": 345, "control": "Gestión de vulnerabilidades técnicas", "texto": "¿Están todos los sistemas de información y componentes tecnológicos actualizados con los últimos parches de seguridad?", "evidencia": "1. Informe periódico de gestión de parches para sistemas / componentes", "activo": true}, {"id_pregunta": 346, "control": "Controles contra malware", "texto": "¿Se han implementado mecanismos de protección antimalware formalmente documentados para redes, estaciones de trabajo, computadoras portátiles y otros dispositivos?", "evidencia": "1. Política de antivirus y software antimalware instalado en estaciones de trabajo. 2. Herramienta antimalware implementada", "activo": true}, {"id_pregunta": 347, "control": "Inteligencia sobre amenazas", "texto": "¿Están documentados e implementados los procedimientos para realizar analítica de amenazas?", "evidencia": "1. Procedimiento de analítica de amenazas 2. Informe de analítica de amenazas", "activo": true}, {"id_pregunta": 348, "control": "Responsabilidades y procedimientos de gestión de incidentes", "texto": "¿Están documentados e implementados los procedimientos / planes de gestión de incidentes de seguridad de la información?", "evidencia": "1. Política / procedimientos de gestión de incidentes", "activo": true}, {"id_pregunta": 349, "control": "Detección y notificación de incidentes", "texto": "¿Se informan los incidentes / violaciones de seguridad de la información a través de los canales de gestión adecuados y según el proceso definido? ¿Se cuenta con mecanismos de monitoreo automático sobre los registros de actividad de los usuarios en los sistemas de información (log de eventos)?", "evidencia": "1. Proceso de notificación de incidentes / eventos relacionados con la seguridad de la información 2. Directrices de registro de eventos de auditoría 3. Definición de herramientas de monitoreo de eventos de seguridad 4. Bitácora de gestión de incidentes", "activo": true}, {"id_pregunta": 350, "control": "Recolección de evidencia", "texto": "¿Se identifican, recopilan y conservan las evidencias para actividades relacionadas con la gestión de incidentes de seguridad de la información para su posterior análisis? ¿Se documentan las lecciones aprendidas?", "evidencia": "1. Proceso de recolección de evidencia para análisis de incidentes 2. Documento de lecciones aprendidas", "activo": true}]}, {"id_tipologia": 4, "nombre_tipologia": "Cumplimiento Regulatorio", "clave": "cu", "activo": true, "descripcion": "Evalua el cumplimiento regulatorio, laboral y normativo del tercero.", "preguntas": [{"id_pregunta": 401, "control": "Proceso de cumplimiento de los requisitos legales y reglamentarios", "texto": "¿¿Ejecuta la organización mecanismos de verificación periódica (auditorías internas, revisoría fiscal o autoevaluaciones) para asegurar el cumplimiento de las obligaciones contractuales y normativas, generando planes de acción trazables ante cualquier desviación detectada?", "evidencia": "1. Manual del programa de cumplimiento, junto con las responsabilidades asignadas a las personas 2. Evidencia de comunicación (por ejemplo, correo electrónico, procedimientos, intranet, sesiones de sensibilización, etc.) 3. Cronograma de Auditorías Internas de Cumplimiento / Calidad.", "activo": true}, {"id_pregunta": 402, "control": "Matriz de cumplimiento regulatorio", "texto": "¿Ha identificado formalmente los requisitos legales y contractuales aplicables al servicio (incluyendo SST, Protección de Datos, Ética y normas específicas del sector) y evidencia su comunicación efectiva al personal encargado de la ejecución del contrato?", "evidencia": "1. Matriz de requerimientos legales, estatutarios, reglamentarios y contractuales aplicables a la organización, junto con las responsabilidades y estado de cumplimiento. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las partes interesadas.", "activo": true}, {"id_pregunta": 403, "control": "Monitoreo al cumplimiento regulatorio", "texto": "¿Dispone de un marco de políticas y procedimientos de seguridad de la información documentado y aprobado por la Dirección, acorde con la naturaleza de sus servicios, que establezca controles para proteger la confidencialidad, integridad y disponibilidad de la información manejada?", "evidencia": "1. Informe de estado de cumplimiento de la matriz de requerimientos legales. 2. Manual o Política General de Seguridad de la Información (Vigente).", "activo": true}, {"id_pregunta": 404, "control": "Certificación Estándares Mínimos SG-SST", "texto": "¿Acredita el cumplimiento de los Estándares Mínimos del SG-SST (Res. 0312/2019) mediante Certificación ARL con calificación >85% (o Plan de Mejora vigente) y evidencia la operación activa del COPASST?", "evidencia": "1. Certificado de la ARL (vigencia < 30 días). 2. Actas de reunión del COPASST (último trimestre).", "activo": true}, {"id_pregunta": 405, "control": "Sistema de Gestión de PQRSD", "texto": "¿Cuenta con un mecanismo formal de registro y seguimiento (físico, digital o tecnológico, acorde a su volumen operativo) que garantice la recepción, trazabilidad y respuesta oportuna de las PQRSD, dando estricto cumplimiento a los términos perentorios establecidos en la Ley 1755 de 2015 (15 días hábiles generales) y la Ley 1437 de 2011?", "evidencia": "1. Procedimiento o Protocolo de Atención de PQRSD. 2. Evidencia de seguimiento (ej. Planilla de Excel, Bitácora de radicación o reporte de sistema) donde conste fecha de recibido vs. fecha de respuesta. 3. Indicadores de oportunidad (Si aplica por volumen).", "activo": true}, {"id_pregunta": 406, "control": "Control de Aportes Seguridad Social", "texto": "¿Realiza validaciones mensuales para garantizar el pago correcto, completo y oportuno de los aportes a Seguridad Social y Parafiscales de todo el personal adscrito al contrato (Art. 50 Ley 789 de 2002)?", "evidencia": "1. Certificación de Revisor Fiscal o Representante Legal (si no está obligado a tener Revisor) donde conste el pago de los aportes.", "activo": true}, {"id_pregunta": 407, "control": "Sistema Integrado de Gestión (Q & E)", "texto": "¿Cuenta con un Sistema de Gestión de Calidad y Ambiental (certificado o propio) que asegure la mejora continua de los procesos, el cumplimiento de acuerdos de nivel de servicio (ANS) y la correcta disposición de residuos o manejo ambiental acorde a la normativa?", "evidencia": "1. Evidencia de control de calidad del servicio. 2. Plan de Gestión Integral de Residuos (PGIRS) si aplica.", "activo": true}, {"id_pregunta": 408, "control": "Organización de Archivos y Cero Papel", "texto": "¿Aplica lineamientos de Gestión Documental y \"Cero Papel\", garantizando la correcta organización, digitalización, custodia y transferencia de la información producida en ejecución del contrato?", "evidencia": "1. Tabla de Retención Documental (TRD) o Procedimiento de Archivo y Gestión Documental. 2. Política de Cero Papel o eficiencia administrativa.", "activo": true}]}, {"id_tipologia": 5, "nombre_tipologia": "Fraude y Corrupción", "clave": "fr", "activo": true, "descripcion": "Evalua los controles antifraude, anticorrupcion y de etica empresarial.", "preguntas": [{"id_pregunta": 501, "control": "Política general ABAC (políticas de antifraude y anticorrupción)", "texto": "¿Se cuenta con una política en cuanto a la gestión del riesgo de fraude y corrupción? ¿Las políticas, procedimientos y estándares están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - divulgado a todas las partes interesadas relevantes", "evidencia": "1. Política Antifraude y Anticorrupción 2. Evidencia de divulgación de la Política Antifraude y anticorrupción a todas las partes interesadas pertinentes", "activo": true}, {"id_pregunta": 502, "control": "Ambiente de control", "texto": "¿Se encuentra definido el código de conducta y ética de la Entidad, en el cual se consideren acciones disciplinarias por acciones de Fraude o corrupción?", "evidencia": "1. Código de conducta y ética", "activo": true}, {"id_pregunta": 503, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las atribuciones y directrices en cuanto a regalos, atenciones y gratificaciones?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 504, "control": "Ambiente de control", "texto": "¿Se encuentran definidas las directrices en cuanto al manejo de donaciones, contribuciones públicas, patrocinios, y uso indebido de los recursos?", "evidencia": "1. Política antifraude y anticorrupción", "activo": true}, {"id_pregunta": 505, "control": "Ambiente de control", "texto": "¿Se consideran medidas de controles sobre los procesos de compras y adquisiciones, garantizando pluralidad de proponentes y transparencia en los procesos?", "evidencia": "1. Manual de contrataciones y adquisiciones", "activo": true}, {"id_pregunta": 506, "control": "Ambiente de control", "texto": "¿Se encuentran definidas directrices en cuanto al conflicto de interés en la ejecución de los procesos de la Entidad?", "evidencia": "1. Procedimiento de conflictos de interés", "activo": true}, {"id_pregunta": 507, "control": "Ambiente de control", "texto": "Cuenta con mecanismos para identificar y reportar eventos de fraude y corrupción en la organización", "evidencia": "1. Línea de denuncias", "activo": true}, {"id_pregunta": 508, "control": "Ambiente de control", "texto": "¿Se cuenta con mecanismos de análisis y monitoreo sobre los reportes de eventos de Fraude y corrupción (v.gr. Línea ética)?", "evidencia": "1. Monitoreo a la gestión de eventos 2. Que pasa con la información producto del monitoreo, se analizan las casuísticas y se toman acciones 3. Se presenta a la Alta Dirección los resultados producto del monitoreo y se toman decisiones frente a dichos resultados", "activo": true}, {"id_pregunta": 509, "control": "Ambiente de control", "texto": "La organización cuanta con Programas de Transparencia y Ética Empresarial", "evidencia": "1. Programa de Transparencia y Ética Empresarial", "activo": true}, {"id_pregunta": 510, "control": "Planes de capacitación sobre el sistema de Política Antifraude y Anticorrupción", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con las Política Antifraude y Anticorrupción? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro de capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}]}, {"id_tipologia": 6, "nombre_tipologia": "Lavado de Activos y Financiacion del Terrorismo (LAFT)", "clave": "laft", "activo": true, "descripcion": "Evalua los controles del sistema de prevencion de LA/FT segun normativa aplicable.", "preguntas": [{"id_pregunta": 601, "control": "Políticas y procedimientos", "texto": "¿La Entidad cuenta con un Sistema de Prevención de Riesgo de LA/FT, con lineamientos definidos que contribuyan a prevenir y/o a mitigar el riesgo de LA/FT?", "evidencia": "1. Políticas y/o manual del sistema LA/FT", "activo": true}, {"id_pregunta": 602, "control": "Consulta de listas restrictivas", "texto": "¿Se cuenta con procedimientos ejecutados por la entidad con relación al seguimiento a las listas ONU y OFAC? ¿La empresa cuenta con una herramienta tecnológica de consulta de listas vinculantes y no vinculantes?", "evidencia": "1. Procedimiento para el seguimiento a las listas ONU y OFAC, y fuente de consulta de información de listas ONU y OFAC", "activo": true}, {"id_pregunta": 603, "control": "Debida Diligencia Contrapartes", "texto": "¿La empresa cuenta con procedimientos de conocimiento de las contrapartes (incluye cuartas partes vinculadas a la ejecución del contrato con la organización)?", "evidencia": "1. Procedimientos establecidos.", "activo": true}, {"id_pregunta": 604, "control": "Capacitación", "texto": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con LA/FT? ¿Son Medidos los resultados de las capacitaciones?", "evidencia": "1. Cronograma de capacitación. 2. Planillas de registro a capacitación 3. Resultado de las evaluaciones de capacitación.", "activo": true}, {"id_pregunta": 605, "control": "Identificación y medición del riesgo", "texto": "¿La empresa cuenta con una matriz u otro instrumento que permita la identificación, medición, segmentación y evaluación del riesgo LA/FT?", "evidencia": "1. Matriz u otro mecanismo de riesgos y controles asociada LA/FT, teniendo en cuenta los factores de riesgo.", "activo": true}, {"id_pregunta": 606, "control": "Monitoreo y gestión sobre los riesgos", "texto": "¿El sistema de prevención de LA/FT implementado en su compañía permite identificar operaciones inusuales y sospechosas?", "evidencia": "1. Mecanismos de reporte o informes", "activo": true}]}, {"id_tipologia": 7, "nombre_tipologia": "Capacidad Financiera", "clave": "fi", "activo": true, "descripcion": "Evalua la solidez financiera y capacidad de cumplimiento del tercero.", "preguntas": [{"id_pregunta": 701, "control": "Identificación y medición del riesgo financiero", "texto": "¿Se cuenta con una metodología de gestión de riesgo financiero actualizada que considere: - Identificación de riesgos financiero que por eventos adverso o alguna fluctuación financiera puedan afectar negativamente la entidad y la prestación del servicio a la organización (riesgo de endeudamiento, riesgo de liquidez, Rentabilidad Operacional de los Activos - ROA y Rentabilidad Operacional sobre el Patrimonio - ROE) - Proceso de medición del riesgo y de la elaboración y aplicación de diferentes estrategias para gestionarlo y hacerle frente, en función de su gravedad y en función de las consecuencias que pueda tener dentro de la empresa y la prestación del servicio a la organización.", "evidencia": "1. Políticas y/o manual con la metodología de gestión de riesgo financiero de la entidad. 2. Documento donde se evidencie la gestión de los riesgos.", "activo": true}, {"id_pregunta": 702, "control": "Monitoreo y gestión sobre los riesgos financiero", "texto": "¿Se cuenta con indicadores financieros (Liquidez, Endeudamiento, ROA y ROE) que generen las alertas a la entidad y son revisados periódicamente (mensual o trimestralmente) para identificar cambios que puedan ser reveladores de problemas con el riesgo?", "evidencia": "1. Informes de seguimiento y gestión de riesgos financieros de la entidad, incluyendo el análisis realizado, las acciones y decisiones que se deriven del mismo.", "activo": true}]}, {"id_tipologia": 8, "nombre_tipologia": "Riesgo Pais", "clave": "pa", "activo": false, "descripcion": "Evalua la exposicion al riesgo pais y entorno regulatorio externo.", "preguntas": [{"id_pregunta": 801, "control": "Identificación y medición del riesgo país", "texto": "¿Se cuenta con una metodología de gestión de riesgo país actualizada que considere el entorno legal, regulatorio, geopolítico, social y económico del país donde se mantiene la operación del negocio y sean considerados importantes obstáculos para hacer negocios a nivel mundial (por ejemplo, las recesiones económicas, la agitación política y los desastres naturales) e incluya: - Identificación de riesgos asociado con la realización del comercio en regiones específicas. - Niveles de exposición al riesgo país en los planos económicos, político, externo y comercial. - Evaluar de la exposición al riesgo de los proveedores por país.", "evidencia": "1. Políticas y procedimientos para la gestión de riesgo país.", "activo": true}, {"id_pregunta": 802, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se cuenta con indicadores descriptivos y/o cuantitativos para identificar potenciales fuentes de riesgos país que generen las alertas respectivas a la organización en caso de modificaciones significativas del entorno?", "evidencia": "1. Informes de seguimiento y comparación del riesgo país de la organización, incluyendo los riesgos residuales de los diferentes entornos de impacto. 2. Notificaciones o alertamientos de la inestabilidad del país de operación. 3. Planes de tratamiento de riesgos país para minimizar los posibles impactos.", "activo": true}, {"id_pregunta": 803, "control": "Monitoreo y gestión sobre los riesgos país", "texto": "¿Se tienen identificadas las regulaciones relacionadas con la protección de los datos en el país y se realiza monitoreo al cumplimiento de las mismas?", "evidencia": "1. Identificación y análisis de las regulaciones de protección de datos aplicables. 2. Informe de acciones, seguimiento y monitoreo de la implementación de controles de protección de datos.", "activo": true}]}]};

// ResultadoEvaluacion — almacén local por (tercero, pregunta, año)
let RESULTADO_EVALUACION = {};

function makeResultKey(idTercero, idPregunta, year){
  return `${idTercero}__${idPregunta}__${year}`;
}

// ─── SWITCH MODO ──────────────────────────────────────
function switchClasifMode(mode){
  const cfg = document.getElementById('clasif-config-view');
  const ejec = document.getElementById('clasif-ejecucion-view');
  const btnCfg = document.getElementById('btn-modo-config');
  const btnEjec = document.getElementById('btn-modo-ejec');
  if(mode === 'config'){
    cfg.style.display='block'; ejec.style.display='none';
    btnCfg.className='btn btn-primary'; btnEjec.className='btn btn-outline';
    loadClientConfig();
  } else {
    cfg.style.display='none'; ejec.style.display='block';
    btnCfg.className='btn btn-outline'; btnEjec.className='btn btn-primary';
    loadEjecucionView();
  }
}

// ─── MODO CONFIGURACIÓN ───────────────────────────────
function loadClientConfig(){
  const cliente = document.getElementById('cfg-cliente-sel')?.value || 'colpensiones';
  const isReadonly = false;
  let tipologias = TIPOLOGIAS_DB[cliente] || [];
  if(!tipologias.length && TIPOLOGIAS_DB['default'] && TIPOLOGIAS_DB['default'].length){
    tipologias = [TIPOLOGIAS_DB['default'][0]];
  }
  const totalPreguntas = tipologias.reduce((s,t)=>s+t.preguntas.filter(p=>p.activo).length, 0);
  const elTip = document.getElementById('cfg-tip-count');
  const elPreg = document.getElementById('cfg-preg-count');
  if(elTip) elTip.textContent = tipologias.length + ' tipología' + (tipologias.length!==1?'s':'');
  if(elPreg) elPreg.textContent = ' · ' + totalPreguntas + ' pregunta' + (totalPreguntas!==1?'s':'');
  // Show/hide readonly alert and action bar
  const alertEl = document.getElementById('cfg-alert-readonly');
  const actBar  = document.getElementById('cfg-actions-bar');
  if(alertEl) alertEl.style.display = isReadonly ? '' : 'none';
  if(actBar)  actBar.style.display  = isReadonly ? 'none' : 'flex';
  const wrap = document.getElementById('cfg-tipologias-wrap');
  if(!wrap) return;
  wrap.innerHTML = tipologias.length
    ? tipologias.map((t, ti) => renderTipologiaConfig(t, ti, isReadonly)).join('')
    : '';
}

function renderTipologiaConfig(tip, ti, isReadonly){
  const activo = tip.activo;
  const colorStrip = activo ? 'var(--blue)' : 'var(--gray)';
  const pregActivas = tip.preguntas.filter(p=>p.activo).length;
  const pregInact = tip.preguntas.filter(p=>!p.activo).length;
  const pregRows = tip.preguntas.map((p, pi) => `
    <tr style="${!p.activo ? 'opacity:.5;' : ''}">
      <td style="font-size:11px;color:var(--muted);">${p.orden}</td>
      <td style="font-size:12px;max-width:380px;">${p.texto}<br><span style="font-size:10.5px;color:var(--muted);font-style:italic;">📄 ${p.doc||'—'}</span></td>
      <td><span class="chip" style="background:#e8f0f8;color:var(--navy);">${p.tipo_valoracion}</span></td>
      <td style="font-size:11px;color:var(--muted);">${p.fecha_creacion}</td>
      <td>${p.activo
        ? '<span class="chip c-ok">Activa</span>'
        : '<span class="chip c-inac">Inactiva</span>'
      }</td>
      <td>${isReadonly ? '<span style="font-size:11px;color:var(--muted);">🔒</span>' : `
        <div style="display:flex;gap:4px;">
          <button class="btn btn-outline btn-xs" onclick="editarPregunta(${tip.id_tipologia},${pi})">✏️</button>
          <button class="btn btn-xs" style="${p.activo?'background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;':'background:#e8f8f2;color:var(--green);border:1px solid #82d9ae;'}"
            onclick="togglePregunta(${tip.id_tipologia},${pi})">${p.activo ? '⏸ Inac.' : '▶ Activar'}</button>
          <button class="btn btn-xs" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;"
            onclick="eliminarPreguntaConfig(${tip.id_tipologia},${pi})" title="Eliminar">&#128465;</button>
        </div>`}
      </td>
    </tr>`).join('');

  return `
  <div class="card" style="margin-bottom:14px;border-left:4px solid ${colorStrip};">
    <div class="card-hdr" style="background:${activo?'white':'var(--gray3)'};">
      <div style="display:flex;align-items:center;gap:10px;flex:1;">
        <div style="width:32px;height:32px;background:${colorStrip};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:white;">${ti+1}</div>
        <div>
          <div style="font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:var(--navy);">${tip.nombre_tipologia}</div>
          <div style="font-size:11px;color:var(--muted);">${tip.descripcion||''} · ${pregActivas} pregunta${pregActivas!==1?'s':''}${pregInact?' · '+pregInact+' inact.':''}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <span class="chip" style="background:#e8f0f8;color:var(--navy);">${tip.tipo_valoracion}</span>
        ${activo ? '<span class="chip c-ok">Activa</span>' : '<span class="chip c-inac">Inactiva</span>'}
        ${isReadonly ? '<span style="font-size:11px;color:var(--muted);padding:4px 8px;background:#f1f5f9;border-radius:4px;">🔒 Solo lectura</span>' : `
          <button class="btn btn-outline btn-xs" onclick="toggleTipologia(${tip.id_tipologia})">${activo?'⏸ Inactivar':'▶ Activar'}</button>
          <button class="btn btn-primary btn-xs" onclick="abrirNuevaPregunta(${tip.id_tipologia})">+ Pregunta</button>
        `}
      </div>
    </div>
    <div style="overflow-x:auto;">
      <table>
        <thead><tr><th>Ord.</th><th>Pregunta / Evidencia esperada</th><th>Valoración</th><th>Desde</th><th>Estado</th><th>${isReadonly?'':'Acciones'}</th></tr></thead>
        <tbody>${pregRows}</tbody>
      </table>
    </div>
  </div>`;
}

function toggleTipologia(idTip){
  for(const cliente in TIPOLOGIAS_DB){
    const tip = TIPOLOGIAS_DB[cliente].find(t=>t.id_tipologia===idTip);
    if(tip){ tip.activo = !tip.activo; break; }
  }
  loadClientConfig();
  showToast('✅ Tipología actualizada', 'success', 2500);
}

function togglePregunta(idTip, pregIdx){
  for(const cliente in TIPOLOGIAS_DB){
    const tip = TIPOLOGIAS_DB[cliente].find(t=>t.id_tipologia===idTip);
    if(tip){
      const preg = tip.preguntas[pregIdx];
      if(preg){
        if(preg.activo){
          preg.activo = false;
          preg.fecha_inactivacion = new Date().toISOString().split('T')[0];
        } else {
          preg.activo = true;
          preg.fecha_inactivacion = null;
        }
      }
      break;
    }
  }
  loadClientConfig();
  showToast('✅ Estado de pregunta actualizado — Histórico preservado', 'success', 2500);
}

function eliminarPreguntaConfig(idTip, pregIdx){
  showConfirmToast('Eliminar pregunta?', 'Esta accion es permanente.', ()=>{
    for(const c in TIPOLOGIAS_DB){
      const t = TIPOLOGIAS_DB[c].find(x=>x.id_tipologia===idTip);
      if(t){ t.preguntas.splice(pregIdx,1); t.preguntas.forEach((p,i)=>p.orden=i+1); break; }
    }
    loadClientConfig();
    showToast('Pregunta eliminada','info',2000);
  });
}
function editarPregunta(idTip, pregIdx){
  for(const cliente in TIPOLOGIAS_DB){
    const tip = TIPOLOGIAS_DB[cliente].find(t=>t.id_tipologia===idTip);
    if(tip){
      const p = tip.preguntas[pregIdx];
      document.getElementById('np-id-tipologia').value = idTip;
      document.getElementById('np-texto').value = p.texto;
      document.getElementById('np-tipo').value = p.tipo_valoracion;
      document.getElementById('np-orden').value = p.orden;
      document.getElementById('np-doc').value = p.doc||'';
      document.getElementById('np-activo').value = p.activo ? 'true' : 'false';
      openM('m-nueva-pregunta');
      break;
    }
  }
}

function abrirNuevaPregunta(idTip){
  document.getElementById('np-id-tipologia').value = idTip;
  document.getElementById('np-texto').value = '';
  document.getElementById('np-doc').value = '';
  document.getElementById('np-activo').value = 'true';
  const tip = Object.values(TIPOLOGIAS_DB).flat().find(t=>t.id_tipologia===idTip);
  const nextOrder = tip ? tip.preguntas.length + 1 : 1;
  document.getElementById('np-orden').value = nextOrder;
  openM('m-nueva-pregunta');
}

function guardarTipologia(){
  const nombre = document.getElementById('nt-nombre')?.value.trim();
  if(!nombre){ showToast('Ingresa un nombre para la tipología','error',2500); return; }
  const cliente = document.getElementById('nt-cliente')?.value || 'colpensiones';
  const tipo_valoracion = document.getElementById('nt-tipo-valoracion')?.value || 'ESTRELLAS';
  const descripcion = document.getElementById('nt-descripcion')?.value || '';
  const activo = document.getElementById('nt-activo')?.value === 'true';
  const hasNA = document.getElementById('nt-aplica-na')?.value === 'true';

  // Capturar descripciones de niveles
  const hints = {
    '5': document.getElementById('nt-nivel5')?.value.trim() || '',
    '4': document.getElementById('nt-nivel4')?.value.trim() || (hasNA ? 'N/A — No aplica para nivel 4.' : ''),
    '3': document.getElementById('nt-nivel3')?.value.trim() || '',
    '2': document.getElementById('nt-nivel2')?.value.trim() || (hasNA ? 'N/A — No aplica para nivel 2.' : ''),
    '1': document.getElementById('nt-nivel1')?.value.trim() || '',
  };
  if(hasNA){ hints['na4'] = 'N/A — No aplica para nivel 4.'; hints['na2'] = 'N/A — No aplica para nivel 2.'; }

  const allTips = Object.values(TIPOLOGIAS_DB).flat();
  const newId = Math.max(...allTips.map(t=>t.id_tipologia), 0) + 1;
  const key = 'custom_' + newId;

  // Agregar al catálogo dinámico para que aparezca en el selector
  TIPOLOGIA_CATALOG[key] = { nombre, hasNA, hints };

  // Agregar al selector HTML
  const sel = document.getElementById('cf-tip-selector');
  if(sel){
    const opt = document.createElement('option');
    opt.value = key; opt.textContent = nombre;
    sel.appendChild(opt);
  }

  // También guardar en TIPOLOGIAS_DB para modo configuración
  if(!TIPOLOGIAS_DB[cliente]) TIPOLOGIAS_DB[cliente] = [];
  TIPOLOGIAS_DB[cliente].push({ id_tipologia:newId, nombre_tipologia:nombre, activo, id_cliente:cliente, tipo_valoracion, descripcion, preguntas:[] });

  // Limpiar campos del modal
  ['nt-nombre','nt-descripcion','nt-nivel5','nt-nivel4','nt-nivel3','nt-nivel2','nt-nivel1'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });

  closeM('m-nueva-tipologia');
  renderTipologiasPersonalizadas();
  actualizarOpcionesSelectorTipologias();
  showToast(`Tipología "${nombre}" creada — ya disponible en el selector`, 'success', 3500);
  addLog('Sistema','Maestra_Tipologia_Riesgos','Nueva Tipología','—',nombre,new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Clasificación');
}

function renderTipologiasPersonalizadas(){
  const wrap = document.getElementById('cf-tip-personalizadas-lista');
  if(!wrap) return;
  const customs = Object.entries(TIPOLOGIA_CATALOG).filter(([k])=>k.startsWith('custom_'));
  if(!customs.length){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  wrap.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px;">Tipologías personalizadas creadas:</div>
    ${customs.map(([key,cat])=>`
      <div id="tip-row-${key}" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--gray3);border-radius:var(--r);margin-bottom:4px;border:1px solid var(--border2);flex-wrap:wrap;gap:6px;">
        <span style="font-size:12px;color:var(--navy);flex:1;">${cat.nombre}</span>
        <div id="tip-confirm-${key}" style="display:none;display:flex;gap:6px;align-items:center;">
          <span style="font-size:11px;color:var(--red);">¿Confirmar borrar?</span>
          <button onclick="confirmarBorrarTipologia('${key}')" style="background:#DC2626;color:white;border:none;border-radius:4px;padding:2px 10px;font-size:11px;cursor:pointer;">Si, borrar</button>
          <button onclick="cancelarBorrarTipologia('${key}')" style="background:#F3F4F6;color:#374151;border:1px solid #D1D5DB;border-radius:4px;padding:2px 8px;font-size:11px;cursor:pointer;">No</button>
        </div>
        <button id="tip-btn-${key}" onclick="pedirConfirmBorrar('${key}')" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;border-radius:4px;padding:2px 10px;font-size:11px;cursor:pointer;">Borrar</button>
      </div>`).join('')}
  `;
}

function pedirConfirmBorrar(key){
  const confirm = document.getElementById('tip-confirm-'+key);
  const btn     = document.getElementById('tip-btn-'+key);
  if(confirm) confirm.style.display='flex';
  if(btn)     btn.style.display='none';
}

function cancelarBorrarTipologia(key){
  const confirm = document.getElementById('tip-confirm-'+key);
  const btn     = document.getElementById('tip-btn-'+key);
  if(confirm) confirm.style.display='none';
  if(btn)     btn.style.display='inline-block';
}

function confirmarBorrarTipologia(key){
  const cat = TIPOLOGIA_CATALOG[key];
  if(!cat) return;
  const nombre = cat.nombre;
  delete TIPOLOGIA_CATALOG[key];
  cfDimsAgregadas = cfDimsAgregadas.filter(d=>d.key!==key);
  renderDimsAgregadas();
  calcCfProm();
  renderTipologiasPersonalizadas();
  actualizarOpcionesSelectorTipologias();
  showToast('Tipología "'+nombre+'" eliminada', 'info', 2500);
}

function borrarTipologiaPersonalizada(key){
  pedirConfirmBorrar(key);
}

function guardarPregunta(){
  const texto = document.getElementById('np-texto')?.value.trim();
  if(!texto){ showToast('❌ Escribe el texto de la pregunta','error',2500); return; }
  const idTip = parseInt(document.getElementById('np-id-tipologia')?.value);
  const tipo = document.getElementById('np-tipo')?.value || 'ESTRELLAS';
  const orden = parseInt(document.getElementById('np-orden')?.value) || 1;
  const doc = document.getElementById('np-doc')?.value || '';
  const activo = document.getElementById('np-activo')?.value === 'true';
  for(const cliente in TIPOLOGIAS_DB){
    const tip = TIPOLOGIAS_DB[cliente].find(t=>t.id_tipologia===idTip);
    if(tip){
      const allPregs = Object.values(TIPOLOGIAS_DB).flatMap(tipArr=>tipArr.flatMap(t=>t.preguntas));
      const newId = Math.max(...allPregs.map(p=>p.id_pregunta), 0) + 1;
      tip.preguntas.push({ id_pregunta:newId, texto, tipo_valoracion:tipo, orden, activo, fecha_creacion:new Date().toISOString().split('T')[0], fecha_inactivacion:null, doc });
      tip.preguntas.sort((a,b)=>a.orden-b.orden);
      break;
    }
  }
  closeM('m-nueva-pregunta');
  loadClientConfig();
  showToast('✅ Pregunta agregada a la tipología', 'success', 2500);
}

// ─── MODO EJECUCIÓN ───────────────────────────────────
function loadEjecucionView(){
  const cliente = document.getElementById('ejec-cliente-sel')?.value || 'colpensiones';
  const idTercero = document.getElementById('ejec-tercero-sel')?.value || 't1';
  const year = document.getElementById('ejec-year-sel')?.value || '2026';
  const tipologias = (TIPOLOGIAS_DB[cliente] || []).filter(t=>t.activo);
  const wrap = document.getElementById('ejec-cuestionario-wrap');
  if(!wrap) return;
  wrap.innerHTML = tipologias.map((t,ti)=>renderTipologiaEjecucion(t, ti, idTercero, year)).join('');
  calcEjecucionGlobal(cliente, idTercero, year);
}

function renderTipologiaEjecucion(tip, ti, idTercero, year){
  const colores = ['var(--blue)','var(--teal)','var(--green)','var(--orange)','var(--red)'];
  const color = colores[ti % colores.length];
  const pregActivas = tip.preguntas.filter(p=>p.activo);
  const promTip = calcPromTipologia(tip, idTercero, year);
  const promLabel = promTip > 0 ? promTip.toFixed(2) : '—';
  const pregRows = pregActivas.map(p=>{
    const key = makeResultKey(idTercero, p.id_pregunta, year);
    const saved = RESULTADO_EVALUACION[key];
    const val = saved ? saved.valor_respuesta : 0;
    return renderPreguntaEjecucion(p, val, idTercero, year);
  }).join('');

  return `
  <div class="card" style="margin-bottom:14px;border-left:4px solid ${color};">
    <div class="card-hdr" style="cursor:pointer;" onclick="toggleAccEjec('ejec-acc-${tip.id_tipologia}')">
      <div style="display:flex;align-items:center;gap:10px;flex:1;">
        <div style="width:30px;height:30px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;">${ti+1}</div>
        <div>
          <div style="font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;color:var(--navy);">${tip.nombre_tipologia}</div>
          <div style="font-size:11px;color:var(--muted);">${pregActivas.length} preguntas activas &nbsp;·&nbsp; ${tip.tipo_valoracion}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="text-align:right;">
          <div style="font-size:10px;color:var(--muted);">Promedio tipología</div>
          <div id="ejec-prom-${tip.id_tipologia}" style="font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;color:${color};">${promLabel}</div>
        </div>
        <span id="ejec-arr-${tip.id_tipologia}" style="font-size:18px;color:var(--muted);">▼</span>
      </div>
    </div>
    <div id="ejec-acc-${tip.id_tipologia}" style="display:block;">
      <div class="card-body" style="padding:12px 18px;">
        ${pregRows}
      </div>
    </div>
  </div>`;
}

function renderPreguntaEjecucion(p, val, idTercero, year){
  const starsHtml = [1,2,3,4,5].map(n=>`
    <span class="star${val>=n?' on':''}" onclick="setEjecStar(${p.id_pregunta},'${idTercero}','${year}',${n})" style="font-size:20px;cursor:pointer;" id="ejec-star-${p.id_pregunta}-${n}">★</span>`
  ).join('');

  return `
  <div style="padding:10px 0;border-bottom:1px solid var(--border);" id="ejec-row-${p.id_pregunta}">
    <div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;">
        <div style="font-size:12.5px;font-weight:600;color:var(--text);margin-bottom:3px;">${p.orden}. ${p.texto}</div>
        <div style="font-size:11px;color:var(--muted);font-style:italic;">📄 Evidencia: ${p.doc||'—'}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:2px;">id_pregunta: ${p.id_pregunta} &nbsp;·&nbsp; Vigente desde: ${p.fecha_creacion}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;min-width:150px;">
        <div style="display:flex;gap:2px;" id="ejec-stars-${p.id_pregunta}">${starsHtml}</div>
        <div style="font-size:18px;font-weight:800;font-family:'Montserrat',sans-serif;color:var(--navy);" id="ejec-val-${p.id_pregunta}">${val||'—'}</div>
        ${val ? `<div style="font-size:10.5px;color:var(--muted);">✓ Guardado en ResultadoEvaluacion</div>` : ''}
      </div>
    </div>
  </div>`;
}

function setEjecStar(idPregunta, idTercero, year, val){
  const key = makeResultKey(idTercero, idPregunta, year);
  RESULTADO_EVALUACION[key] = {
    id_evaluacion: Object.keys(RESULTADO_EVALUACION).length + 1,
    id_tercero: idTercero,
    id_pregunta: idPregunta,
    valor_respuesta: val,
    fecha_evaluacion: new Date().toISOString(),
    year
  };
  // Update stars UI
  for(let n=1; n<=5; n++){
    const el = document.getElementById(`ejec-star-${idPregunta}-${n}`);
    if(el){ el.className = `star${val>=n?' on':''}`; el.style.fontSize='20px'; el.style.cursor='pointer'; }
  }
  const valEl = document.getElementById(`ejec-val-${idPregunta}`);
  if(valEl) valEl.textContent = val;
  // Recalc promedio tipología y global
  const cliente = document.getElementById('ejec-cliente-sel')?.value || 'colpensiones';
  const tipologias = (TIPOLOGIAS_DB[cliente] || []).filter(t=>t.activo);
  for(const tip of tipologias){
    if(tip.preguntas.some(p=>p.id_pregunta===idPregunta)){
      const prom = calcPromTipologia(tip, idTercero, year);
      const promEl = document.getElementById(`ejec-prom-${tip.id_tipologia}`);
      if(promEl) promEl.textContent = prom > 0 ? prom.toFixed(2) : '—';
      break;
    }
  }
  calcEjecucionGlobal(cliente, idTercero, year);
}

function calcPromTipologia(tip, idTercero, year){
  const vals = tip.preguntas.filter(p=>p.activo).map(p=>{
    const key = makeResultKey(idTercero, p.id_pregunta, year);
    const r = RESULTADO_EVALUACION[key];
    return r ? r.valor_respuesta : 0;
  }).filter(v=>v>0);
  if(!vals.length) return 0;
  return vals.reduce((a,b)=>a+b,0) / vals.length;
}

function calcEjecucionGlobal(cliente, idTercero, year){
  const tipologias = (TIPOLOGIAS_DB[cliente] || []).filter(t=>t.activo);
  const proms = tipologias.map(t=>calcPromTipologia(t,idTercero,year)).filter(v=>v>0);
  const globalWrap = document.getElementById('ejec-resultado-global');
  if(!globalWrap) return;
  if(!proms.length){ globalWrap.style.display='none'; return; }
  globalWrap.style.display='block';
  const prom = (proms.reduce((a,b)=>a+b,0)/proms.length).toFixed(2);
  const promEl = document.getElementById('ejec-prom-global');
  const freqEl = document.getElementById('ejec-freq-label');
  const chipEl = document.getElementById('ejec-chip-wrap');
  if(promEl) promEl.textContent = prom;
  let freq='', chip='';
  if(parseFloat(prom)>=4){ freq='Se evalúa'; chip='<span class="chip c-crit">SE EVALÚA</span>'; if(promEl) promEl.style.color='var(--red)'; }
  else if(parseFloat(prom)>=3){ freq='Se evalúa'; chip='<span class="chip c-alto">SE EVALÚA</span>'; if(promEl) promEl.style.color='var(--orange)'; }
  else { freq='No se evalúa'; chip='<span class="chip c-bajo">NO SE EVALÚA</span>'; if(promEl) promEl.style.color='var(--green)'; }
  if(freqEl) freqEl.textContent = freq;
  if(chipEl) chipEl.innerHTML = chip;
  const ts = document.getElementById('ejec-timestamp');
  if(ts) ts.textContent = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function toggleAccEjec(id){
  const el = document.getElementById(id);
  const tipId = id.replace('ejec-acc-','');
  const arr = document.getElementById('ejec-arr-'+tipId);
  if(!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if(arr) arr.textContent = isOpen ? '▼' : '▲';
}

function saveEvaluacion(){
  const cliente = document.getElementById('ejec-cliente-sel')?.value || 'colpensiones';
  const idTercero = document.getElementById('ejec-tercero-sel')?.value || 't1';
  const terceroName = document.getElementById('ejec-tercero-sel')?.options[document.getElementById('ejec-tercero-sel').selectedIndex]?.text || idTercero;
  const year = document.getElementById('ejec-year-sel')?.value || '2026';
  const total = Object.keys(RESULTADO_EVALUACION).filter(k=>k.includes(`__${year}`)).length;
  if(total === 0){ showToast('⚠️ No has calificado ninguna pregunta aún','error',3000); return; }
  addLog(terceroName.split('—')[0].trim(),'ResultadoEvaluacion','Evaluación Guardada','—',`${total} respuestas · Año ${year}`,new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Clasificación');
  showToast(`✅ Evaluación guardada: ${total} respuestas · Año ${year} · Tercero ${terceroName.split('—')[0]}`, 'success', 4000);
}

// ─── INIT CLASIFICACION ON LOAD ───────────────────────
function initClasificacion(){
  loadClientConfig();
  // Lock entidad if cliente
  if(currentUser?.rol==='Cliente' && currentUser?.entidad){
    const cfEnt=document.getElementById('cf-entidad');
    if(cfEnt){ cfEnt.value=currentUser.entidad; cfEnt.disabled=true; }
    const cfgSel=document.getElementById('cfg-cliente-sel');
    if(cfgSel){ cfgSel.value=currentUser.entidad; cfgSel.disabled=true; }
    const ejSel=document.getElementById('ejec-cliente-sel');
    if(ejSel){ ejSel.value=currentUser.entidad; ejSel.disabled=true; }
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// ⭐ SISTEMA DINÁMICO DE ENTIDADES
// ═══════════════════════════════════════════════════════════════════════════════
window.ENTIDADES_CONFIG = {};

function cargarEntidadesDinamicas(){
  try{
    var saved = localStorage.getItem('sgrt_entidades_list');
    if(saved){
      window.ENTIDADES_CONFIG = JSON.parse(saved);
    }else{
      // Crear Colpensiones por defecto
      window.ENTIDADES_CONFIG = {
        "colpensiones": {
          nombre: "Colpensiones",
          acronimo: "COLP",
          fechaCreacion: new Date().toISOString(),
          estado: "Activo"
        }
      };
      guardarEntidadesDinamicas();
    }
  }catch(e){
    console.error('Error cargando entidades:', e);
    window.ENTIDADES_CONFIG = {"colpensiones": {nombre:"Colpensiones",acronimo:"COLP",fechaCreacion:new Date().toISOString(),estado:"Activo"}};
  }
}

function guardarEntidadesDinamicas(){
  try{
    localStorage.setItem('sgrt_entidades_list', JSON.stringify(window.ENTIDADES_CONFIG));
  }catch(e){
    console.error('Error guardando entidades:', e);
  }
}

function crearEntidadNueva(nombreEntidad, acronimo){
  if(!nombreEntidad || !acronimo) return false;
  
  var key = nombreEntidad.toLowerCase().replace(/\s+/g, '_');
  if(window.ENTIDADES_CONFIG[key]){
    showToast('❌ Esta entidad ya existe','error',3000);
    return false;
  }
  
  window.ENTIDADES_CONFIG[key] = {
    nombre: nombreEntidad,
    acronimo: acronimo,
    fechaCreacion: new Date().toISOString(),
    estado: 'Activo'
  };
  
  // Crear automáticamente 2 usuarios con los 2 roles
  var adminKey = 'admin_' + key;
  var evalKey = 'eval_' + key;
  var defaultPass = nombreEntidad.substring(0,3).toUpperCase() + '2026*';
  
  window.USERS[adminKey] = {
    pass: defaultPass,
    name: 'Admin - ' + nombreEntidad,
    rol: 'admin_riesgos',
    initials: acronimo.substring(0,2),
    entidad: key,
    tipologias: null
  };
  
  window.USERS[evalKey] = {
    pass: defaultPass,
    name: 'Eval - ' + nombreEntidad,
    rol: 'evaluador',
    initials: acronimo.substring(0,2),
    entidad: key,
    tipologias: null
  };
  
  guardarEntidadesDinamicas();
  
  // 🔔 Registrar notificaciones para TODOS los roles
  registrarNotificacion('entidad_creada', 'TODOS', 
    '✅ Nueva entidad creada: ' + nombreEntidad,
    {entidad: nombreEntidad, acronimo: acronimo, adminUser: adminKey, evalUser: evalKey}
  );
  
  registrarNotificacion('entidad_creada', 'admin_riesgos',
    '👤 Nuevo administrador de riesgos disponible: ' + adminKey,
    {usuario: adminKey, password: defaultPass, entidad: nombreEntidad}
  );
  
  registrarNotificacion('entidad_creada', 'evaluador',
    '👤 Nuevo evaluador disponible: ' + evalKey,
    {usuario: evalKey, password: defaultPass, entidad: nombreEntidad}
  );
  
  registrarNotificacion('entidad_creada', 'IS',
    '✅ Entidad "' + nombreEntidad + '" creada con 2 usuarios',
    {entidad: nombreEntidad, adminUser: adminKey, evalUser: evalKey}
  );
  
  var msg = '✅ Entidad "' + nombreEntidad + '" creada\\n\\n' +
            '👤 ADMINISTRADOR DE RIESGOS\\n' +
            'Usuario: ' + adminKey + '\\n' +
            'Contraseña: ' + defaultPass + '\\n\\n' +
            '👤 EVALUADOR\\n' +
            'Usuario: ' + evalKey + '\\n' +
            'Contraseña: ' + defaultPass;
  showToast(msg, 'success', 5000);
  
  return true;
}

cargarEntidadesDinamicas();

var USERS = {
  'iseguras2026': {pass:'ISEGURAS_2026', name:'Infraestructuras Seguras', rol:'IS',        initials:'IS', entidad:null,      tipologias:null},
  'admin_riesgos': {pass:'Admin2026*',   name:'Administrador de Riesgos', rol:'admin_riesgos', initials:'AR', entidad:'colpensiones',tipologias:null},
  'evaluador':     {pass:'Eval2026*',    name:'Evaluador',                rol:'evaluador', initials:'EV', entidad:'colpensiones',tipologias:null},
  'cliente2':     {pass:'cli2026b',      name:'Cliente B',                rol:'Cliente',   initials:'C2', entidad:'cliente2',tipologias:null},
};
// ─── ROL DISPLAY NAMES ──────────────────────────────
function getRolDisplay(rol){
  var map = {
    'IS':              'Usuario Master / Súper Administrador',
    'admin_riesgos':   'ADMINISTRADOR DE RIESGOS',
    'Operativo':       'ADMINISTRADOR DE RIESGOS',
    'evaluador':       'EVALUADOR',
    'Cliente':         'EVALUADOR'
  };
  return map[rol] || rol;
}
let currentUser = null;

const LOGS_DATA = [];
let filteredLogs = [...LOGS_DATA];

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 SISTEMA DE NOTIFICACIONES EN TIEMPO REAL POR ROL
// ═══════════════════════════════════════════════════════════════════════════
const NOTIFICACIONES_SISTEMA = [];
const REPORTES_POR_FASE = {
  clasificacion: [],
  ambiente_control: [],
  analisis_riesgos: []
};

function registrarNotificacion(tipo, rol, mensaje, detalles) {
  const notif = {
    id: NOTIFICACIONES_SISTEMA.length + 1,
    timestamp: new Date().toISOString(),
    tipo: tipo,
    rol: rol,
    usuario: window.currentUser?.name || 'Sistema',
    mensaje: mensaje,
    detalles: detalles || {},
    leida: false
  };
  NOTIFICACIONES_SISTEMA.unshift(notif);
  guardarNotificaciones();
  dispararActualizacionTiempoReal();
}

function guardarNotificaciones() {
  try {
    localStorage.setItem('sgrt_notificaciones_sistema', JSON.stringify(NOTIFICACIONES_SISTEMA.slice(0, 100)));
  } catch(e) {
    console.error('Error guardando notificaciones:', e);
  }
}

function cargarNotificacionesSistema() {
  try {
    const guardadas = JSON.parse(localStorage.getItem('sgrt_notificaciones_sistema') || '[]');
    NOTIFICACIONES_SISTEMA.splice(0, NOTIFICACIONES_SISTEMA.length, ...guardadas);
  } catch(e) {
    console.error('Error cargando notificaciones:', e);
  }
}

function obtenerNotificacionesPorRol(rol) {
  return NOTIFICACIONES_SISTEMA.filter(n => n.rol === rol || n.rol === 'TODOS');
}

function registrarReportePorFase(fase, tercero, datos) {
  if (!REPORTES_POR_FASE[fase]) {
    REPORTES_POR_FASE[fase] = [];
  }
  REPORTES_POR_FASE[fase].unshift({
    timestamp: new Date().toISOString(),
    tercero: tercero,
    usuario: window.currentUser?.name || 'Sistema',
    datos: datos
  });
  guardarReportes();
  dispararActualizacionTiempoReal();
}

function guardarReportes() {
  try {
    localStorage.setItem('sgrt_reportes_fases', JSON.stringify(REPORTES_POR_FASE));
  } catch(e) {
    console.error('Error guardando reportes:', e);
  }
}

function cargarReportesSistema() {
  try {
    const guardados = JSON.parse(localStorage.getItem('sgrt_reportes_fases') || '{}');
    Object.assign(REPORTES_POR_FASE, guardados);
  } catch(e) {
    console.error('Error cargando reportes:', e);
  }
}

// Sincronización en tiempo real cada 2 segundos
let SYNC_INTERVAL = null;
function iniciarSincronizacionTiempoReal() {
  if (SYNC_INTERVAL) clearInterval(SYNC_INTERVAL);
  SYNC_INTERVAL = setInterval(() => {
    cargarNotificacionesSistema();
    cargarReportesSistema();
    actualizarPanelNotificaciones();
  }, 2000);
}

function dispararActualizacionTiempoReal() {
  actualizarPanelNotificaciones();
}

function actualizarPanelNotificaciones() {
  const rolActual = window.currentUser?.rol;
  if (!rolActual) return;
  
  const notifActuales = obtenerNotificacionesPorRol(rolActual);
  const panelId = 'notificaciones-panel-' + rolActual;
  const panelEl = document.getElementById(panelId);
  
  if (panelEl && notifActuales.length > 0) {
    const recientes = notifActuales.slice(0, 5);
    panelEl.innerHTML = recientes.map(n => `
      <div style="padding: 10px; border-bottom: 1px solid #dee2e6; font-size: 12px;">
        <strong style="color: #1a3a5c;">${n.mensaje}</strong>
        <div style="color: #6c757d; font-size: 11px; margin-top: 4px;">
          ${new Date(n.timestamp).toLocaleTimeString('es-CO')}
        </div>
      </div>
    `).join('');
  }
}
// ═══════════════════════════════════════════════════════════════════════════

// ─── AUTH ─────────────────────────────────────────────
function doLogin(){
  const u = document.getElementById('li-user').value.trim().toLowerCase();
  const p = document.getElementById('li-pass').value;
  const err = document.getElementById('login-err');
  if(USERS[u] && USERS[u].pass === p){
    currentUser = USERS[u];
    document.getElementById('login-screen').style.display='none';
    // Route to correct app based on role
    var isAdminRole = (currentUser.rol === 'Administrador' || currentUser.rol === 'Analista' || currentUser.rol === 'Auditor');
    if(isAdminRole){
      document.getElementById('admin-app').classList.add('active');
      document.getElementById('app').style.cssText='display:none'; document.getElementById('cliente-app').style.display='none';
      document.getElementById('admin-tb-ava').textContent = currentUser.initials;
      document.getElementById('admin-tb-uname').textContent = currentUser.name;
      var dh = document.getElementById('admin-dash-fecha-hoy');
      if(dh) dh.textContent = new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
      document.querySelectorAll('#admin-app .page').forEach(function(p){p.classList.remove('active');});
      var dpg = document.getElementById('admin-pg-dashboard') || document.getElementById('pg-dashboard');
      if(dpg) dpg.classList.add('active');
      document.querySelectorAll('#admin-app .nav-item').forEach(function(n){n.classList.remove('active');});
      var fn = document.querySelector('#admin-app .nav-item');
      if(fn) fn.classList.add('active');
      showToast('Bienvenido, ' + currentUser.name + ' — ' + getRolDisplay(currentUser.rol), 'success', 3000);
      try{ initAdminDashboard(); }catch(e){}
      sendNotification('login', 
        'Inicio de sesión: ' + currentUser.name,
        'El usuario ha ingresado al sistema correctamente.',
        {'Rol': currentUser.rol, 'Entidad': currentUser.entidad || 'Administrador IS'}
      );
      setTimeout(function(){try{window.renderNotifPanel&&window.renderNotifPanel();}catch(e){}},300);
      setTimeout(function(){try{window.renderISLogs&&window.renderISLogs();}catch(e){}},300);
      return;
    } else {
      document.getElementById('admin-app').classList.remove('active');
      var clienteApp = document.getElementById('cliente-app');
      if(clienteApp) clienteApp.style.cssText='display:block;';
      var appDiv = document.getElementById('app');
      if(appDiv) appDiv.style.cssText='display:flex;height:100vh;flex-direction:column;overflow:hidden;';
      var ava2=document.getElementById('tb-ava-txt'); if(ava2) ava2.textContent=currentUser.initials;
      var un2=document.getElementById('tb-uname-txt'); if(un2) un2.textContent=getRolDisplay(currentUser.rol);
      err.style.display='none';
      if(appDiv){
        // Show sidebar
        var sbEl2=document.getElementById('main-sidebar');
        if(sbEl2)sbEl2.style.cssText='display:flex;flex-direction:column;width:220px;min-width:220px;background:white;border-right:1px solid var(--border);overflow-y:auto;flex-shrink:0;';
        var abEl=appDiv.querySelector('.app-body');
        if(abEl)abEl.style.cssText='display:flex;flex:1;min-height:0;overflow:hidden;';
        // Show correct sidebar section
        ['sb-IS','sb-Operativo','sb-Cliente'].forEach(function(id){var el=document.getElementById(id);if(el)el.style.display='none';});
        var sbId2='sb-'+(window.currentUser?window.currentUser.rol:'Cliente');
        var sbDiv2=document.getElementById(sbId2);if(sbDiv2)sbDiv2.style.display='block';
        var sbNom2=document.getElementById('sb-cl-nombre');if(sbNom2&&window.currentUser)sbNom2.textContent=window.currentUser.name;
        appDiv.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
        var d=(currentUser.rol === 'Cliente' || currentUser.rol === 'evaluador') ? appDiv.querySelector('#pg-clasificacion') : appDiv.querySelector('#pg-dashboard');
        if(d) d.classList.add('active');
        appDiv.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
        var fn2=document.querySelector('#'+sbId2+' .nav-item'); if(fn2) fn2.classList.add('active');
        if(currentUser.rol === 'Cliente' || currentUser.rol === 'evaluador') setTimeout(function(){try{window._setClasifViewMode('registro');}catch(e){}},90);
      }
      try{applyRoleRestrictions();}catch(e){}
      try{renderLogs(LOGS_DATA);}catch(e){}
      try{renderTablaUsuarios();}catch(e){}
      try{animateProgress();}catch(e){}
      try{updateDashboard();}catch(e){}
      try{calcMatrizPromedios();}catch(e){}
      try{window._lsLoad&&window._lsLoad();}catch(e){}
      try{cargarTercerosPendientesDesdeAPI();}catch(e){}
      try{cargarTercerosDesdeAPI();}catch(e){}
      try{fijarEntidadClasificacion();}catch(e){}
    }
    showToast('Bienvenido, ' + currentUser.name + ' — ' + getRolDisplay(currentUser.rol), 'success', 3000);
    sendNotification('login',
      'Inicio de sesión: ' + currentUser.name,
      'El usuario cliente ha ingresado al sistema.',
      {'Rol': currentUser.rol, 'Entidad': currentUser.entidad || 'N/A'}
    );
    setTimeout(function(){try{window.renderNotifPanel&&window.renderNotifPanel();}catch(e){}},300);
    // Log the login
    try{
      var sysLogs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');
      sysLogs.push({ts:new Date().toISOString(),tipo:'login',usuario:currentUser.username||u,rol:currentUser.rol,detalle:'Inicio de sesión: '+currentUser.name+' ['+currentUser.rol+']' });
      localStorage.setItem('sgrt_sys_logs',JSON.stringify(sysLogs));
    }catch(e2){}
    // Show client registros
    setTimeout(function(){try{window.renderCliRegistros&&window.renderCliRegistros();}catch(e){}},500);
  } else {
    err.style.display='block';
    document.getElementById('li-pass').value='';
    showToast('❌ Usuario o contraseña incorrectos', 'error', 3000);
  }
}

function applyRoleRestrictions(){
  // IMPORTANTE: usar window.currentUser, no la variable local "currentUser" —
  // window.doLogin (la función de login que realmente se ejecuta) asigna a
  // window.currentUser, no a esta variable de bloque "let currentUser".
  var _cu = window.currentUser || currentUser;
  const isCliente = _cu?.rol === 'Cliente' || _cu?.rol === 'evaluador';
  const isOperativo = _cu?.rol === 'Operativo';
  document.body.classList.toggle('is-cliente', !!isCliente);
  const entidad = _cu?.entidad;

  // Solo aplica restricciones sobre el sidebar activo (app o cliente-app), NO el admin-app
  const activeApp = document.getElementById('app');
  const clienteApp = document.getElementById('cliente-app');
  const scopeEl = (clienteApp && clienteApp.style.display !== 'none') ? clienteApp : activeApp;
  if(!scopeEl) return;

  // Nav items — cliente NO ve: Logs de Auditoría, Usuarios y Roles
  // El Evaluador (Cliente) ahora SÍ ve y diligencia Análisis de Riesgos —
  // Seguimiento sigue siendo tarea exclusiva del Administrador de Riesgos
  scopeEl.querySelectorAll('.nav-item').forEach(nav => {
    const lbl = nav.querySelector('.lbl')?.textContent || '';
    const hideForCliente = isCliente && (
      nav.getAttribute('data-admin-only') === 'true' ||
      lbl === 'Logs de Auditoria' ||
      lbl === 'Logs' ||
      lbl === 'Usuarios y Roles' ||
      lbl === 'Usuarios' ||
      lbl === 'Informes' ||
      lbl === 'Reportes y Power BI' ||
      lbl === 'Dashboard' ||
      lbl === 'Seguimiento'
    );
    nav.style.display = hideForCliente ? 'none' : '';
  });

  scopeEl.querySelectorAll('.nav-sec').forEach(sec => {
    const txt = sec.textContent.trim();
    if(isCliente && (txt === 'Sistema' || txt === 'Informes')){
      sec.style.display = 'none';
    } else {
      sec.style.display = '';
    }
  });

  // El Evaluador no tiene acceso al panel de reportes presentado como Dashboard
  // dentro del cuestionario; mantiene el diligenciamiento operativo.
  var acReportesTab = document.getElementById('cq-tab-reportes');
  if(acReportesTab) acReportesTab.style.display = isCliente ? 'none' : '';
  var acReportesPanel = document.getElementById('cq-panel-reportes');
  if(isCliente && acReportesPanel) acReportesPanel.style.display = 'none';

  ['btn-mis-reportes','ig-btn-agregar-terceros','ig-btn-agregar-terceros-cta'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.display=isCliente?'none':'';
  });

  // Vista de solo lectura/supervisión para Análisis de Riesgos y Ambiente de Control en Administrador de Riesgos
  document.body.classList.toggle('is-operativo-supervisor', !!isOperativo);

  // Ocultar campos de Supervisor para Administrador de Riesgos (rol Operativo)
  const supervisorFields = document.getElementById('cf-supervisor-fields');
  if(supervisorFields){
    supervisorFields.style.display = isOperativo ? 'none' : '';
  }

  // If cliente, lock entidad selects to their entidad
  if(isCliente && entidad){
    // Clasificacion form
    const cfEnt = document.getElementById('cf-entidad');
    if(cfEnt){ cfEnt.value = entidad; cfEnt.disabled = true; }
    const cfgSel = document.getElementById('cfg-cliente-sel');
    if(cfgSel){ cfgSel.value = entidad; cfgSel.disabled = true; }
    const ejSel = document.getElementById('ejec-cliente-sel');
    if(ejSel){ ejSel.value = entidad; ejSel.disabled = true; }

    // Filter terceros table to show only their rows
    document.querySelectorAll('#tbody-terceros tr').forEach(tr => {
      const rowEnt = (tr.dataset.entidad||'').toLowerCase().replace(/[^a-z]/g,'');
      const entNorm = (entidad||'').toLowerCase().replace(/[^a-z]/g,'');
      tr.style.display = rowEnt === entNorm ? '' : 'none';
    });

    // Lock ALL entity filter selects to only show their entidad
    const entidadLabels = {
      colpensiones: '&#127963; Colpensiones',
      ecopetrol:    '&#128722; Ecopetrol',
      bancolombia:  '&#127970; Bancolombia'
    };
    ['terc-filter-entidad','mz-fil-entidad'].forEach(function(selId){
      const sel = document.getElementById(selId);
      if(!sel) return;
      sel.innerHTML = '<option value="'+entidad+'">'+( entidadLabels[entidad]||entidad )+'</option>';
      sel.value = entidad;
      sel.disabled = true;
    });
    // Auto-apply matrix entidad filter
    if(typeof filtrarMatrizEntidad === 'function') filtrarMatrizEntidad();
    if(typeof filterTerceros === 'function') filterTerceros();

    // Show welcome banner in clasificacion
    const banner = document.getElementById('cliente-banner');
    if(banner){
      const names = {colpensiones:'🏛 Colpensiones', ecopetrol:'🛢 Ecopetrol', bancolombia:'🏦 Bancolombia'};
      banner.textContent = (names[entidad]||entidad);
      banner.style.display = 'block';
    }

    // EVALUADOR: ocultar TODO lo de edición/registro en Clasificación de Terceros.
    // Solo debe quedar visible el panel de lectura (#cls-panel-dash): tabla de terceros + promedio.
    const idsToHide = ['pre-registro-card','cls-wizard-bar','cls-tip-section','cls-panel-form'];
    idsToHide.forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.style.display = 'none';
    });
    // Ocultar la barra de pestañas "Nuevo Registro / Registros" — el evaluador no elige, solo ve la tabla.
    const clsTabForm = document.getElementById('cls-tab-form');
    if(clsTabForm){
      const tabsBar = clsTabForm.closest('.tabs');
      if(tabsBar) tabsBar.style.display = 'none';
    }
    // Ocultar el card del formulario de registro del tercero (el que contiene #cf-nit),
    // por si quedara fuera de #cls-panel-form en alguna variante del HTML.
    const cfNitEl = document.getElementById('cf-nit');
    if(cfNitEl){
      const formCard = cfNitEl.closest('.card');
      if(formCard) formCard.style.display = 'none';
    }
    // Mostrar banner de solo lectura, con indicación clara del siguiente paso
    var roMsg = document.getElementById('_eval-cls-ro-msg');
    if(!roMsg){
      roMsg = document.createElement('div');
      roMsg.id = '_eval-cls-ro-msg';
      roMsg.style.cssText = 'background:#e8f4ff;border:1px solid #aac8f0;border-radius:8px;padding:12px 18px;margin-bottom:14px;font-size:12.5px;color:#1a3a5c;';
      var pgCls = document.getElementById('pg-clasificacion');
      if(pgCls) pgCls.insertBefore(roMsg, pgCls.firstChild);
    }
    roMsg.innerHTML = '<b>📋 Modo lectura</b> — Aquí puedes consultar el listado de todos los terceros con su puntaje promedio. La clasificación y las tipologías de riesgo las gestiona el Administrador de Riesgos.'
      +'<br><span style="color:#1e6bb8;font-weight:700;">➜ Sigue diligenciando el cuestionario en <u style="cursor:pointer;" onclick="var nav=document.querySelector(\'.nav-item[onclick*=pg-cuestionario]\');if(nav)goPage(nav,\'pg-cuestionario\');">Ambiente de Control</u>.</span>';
    roMsg.style.display = 'block';
    // Asegurar que el panel de lectura (tabla + KPIs) esté visible
    var clsPanelDash = document.getElementById('cls-panel-dash');
    if(clsPanelDash) clsPanelDash.style.display = '';
  } else {
    // Operativo/non-cliente: show everything in active scope
    if(scopeEl){
      scopeEl.querySelectorAll('.nav-item').forEach(nav => nav.style.display='');
      scopeEl.querySelectorAll('.nav-sec').forEach(sec => sec.style.display='');
    }
    const banner = document.getElementById('cliente-banner');
    if(banner) banner.style.display='none';
    // Restaurar formulario de clasificación para admin/operativo
    const idsToRestore = ['pre-registro-card','cls-wizard-bar','cls-tip-section','cls-panel-form'];
    idsToRestore.forEach(function(id){
      const el = document.getElementById(id);
      if(el) el.style.display = '';
    });
    const clsTabFormR = document.getElementById('cls-tab-form');
    if(clsTabFormR){
      const tabsBarR = clsTabFormR.closest('.tabs');
      if(tabsBarR) tabsBarR.style.display = '';
    }
    const cfNitElR = document.getElementById('cf-nit');
    if(cfNitElR){
      const formCardR = cfNitElR.closest('.card');
      if(formCardR) formCardR.style.display = '';
    }
    var roMsgEl = document.getElementById('_eval-cls-ro-msg');
    if(roMsgEl) roMsgEl.style.display = 'none';
    ['cf-entidad','cfg-cliente-sel','ejec-cliente-sel'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.disabled=false;
    });
    document.querySelectorAll('#tbody-terceros tr').forEach(tr=>tr.style.display='');

    // Admin de Riesgos (Operativo): la organización queda FIJA en su entidad
    // (no un selector con Colpensiones/Ecopetrol/Bancolombia). Solo el rol
    // Administrador general puede cambiar de organización.
    var entidadOp = _cu && _cu.entidad ? _cu.entidad : 'cliente1';
    // Normalizar: 'cliente1' es alias histórico de 'colpensiones' — así el
    // sidebar y el filtro muestran lo mismo (Colpensiones), no dos etiquetas.
    if(entidadOp==='cliente1') entidadOp='colpensiones';
    var entidadLabelsOp = {
      colpensiones: '&#127963; Colpensiones',
      ecopetrol:    '&#128722; Ecopetrol',
      bancolombia:  '&#127970; Bancolombia',
      cliente1:     '&#127963; Colpensiones'
    };
    var lblOp = entidadLabelsOp[entidadOp] || entidadOp;
    var allEntOptionsAdm = '<option value="">Todas las organizaciones</option><option value="colpensiones">&#127963; Colpensiones</option><option value="ecopetrol">&#128722; Ecopetrol</option><option value="bancolombia">&#127970; Bancolombia</option>';
    ['terc-filter-entidad','mz-fil-entidad'].forEach(function(selId){
      const sel = document.getElementById(selId);
      if(!sel) return;
      if(isOperativo){
        // Fijo en su organización
        sel.innerHTML = '<option value="'+entidadOp+'">'+lblOp+'</option>';
        sel.value = entidadOp;
        sel.disabled = true;
      } else {
        // Administrador general: todas
        sel.innerHTML = allEntOptionsAdm;
        sel.value = '';
        sel.disabled = false;
      }
    });
    if(isOperativo && typeof filtrarMatrizEntidad === 'function') filtrarMatrizEntidad();
  }
}
// ─── RECUPERAR CONTRASEÑA ─────────────────────────────────
function mostrarRecuperarPass(){
  var box = document.getElementById('recuperar-pass-box');
  if(!box) return;
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  var res = document.getElementById('rec-result');
  if(res){ res.style.display='none'; res.textContent=''; }
}
function recuperarPassword(){
  var u = (document.getElementById('rec-user')?.value||'').trim().toLowerCase();
  var res = document.getElementById('rec-result');
  if(!u){ if(res){res.style.display='block';res.style.color='var(--red)';res.textContent='Ingresa un nombre de usuario.';} return; }
  var found = USERS[u];
  if(found){
    if(res){ res.style.display='block'; res.style.color='var(--green)';
      res.innerHTML = 'Usuario: <b>'+u+'</b> &nbsp;&bull;&nbsp; Contrase&#241;a: <b style="background:#e8f8f2;padding:2px 8px;border-radius:4px;font-family:monospace;">'+found.pass+'</b>'; }
  } else {
    if(res){ res.style.display='block'; res.style.color='var(--red)'; res.textContent='Usuario no encontrado.'; }
  }
}

// ─── GESTIÓN USUARIOS ─────────────────────────────────────
function generarPasswordAuto(){
  var chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  var pass = '';
  for(var i=0;i<8;i++) pass += chars[Math.floor(Math.random()*chars.length)];
  var el = document.getElementById('usr-pass'); if(el) el.value = pass;
}

function abrirNuevoUsuario(){
  document.getElementById('m-usuario-title').textContent = 'Nuevo Usuario';
  document.getElementById('usr-edit-key').value = '';
  ['usr-nombre','usr-correo','usr-login','usr-pass'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var rol=document.getElementById('usr-rol'); if(rol) rol.value='Analista';
  var ent=document.getElementById('usr-entidad'); if(ent) ent.value='';
  var est=document.getElementById('usr-estado'); if(est) est.value='Activo';
  ['um-dashboard','um-terceros','um-clasif','um-cuest','um-matriz'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.checked=true;
  });
  ['um-usuarios','um-logs'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.checked=false;
  });
  var pg = document.getElementById('usr-pass-group'); if(pg) pg.style.display='';
  openM('m-usuario');
}

function guardarUsuarioNuevo(){
  var nombre  = (document.getElementById('usr-nombre')?.value||'').trim();
  var correo  = (document.getElementById('usr-correo')?.value||'').trim();
  var login   = (document.getElementById('usr-login')?.value||'').trim().toLowerCase().replace(/\s+/g,'');
  var pass    = (document.getElementById('usr-pass')?.value||'').trim();
  var rol     = document.getElementById('usr-rol')?.value || 'Analista';
  var entidad = document.getElementById('usr-entidad')?.value || null;
  var estado  = document.getElementById('usr-estado')?.value || 'Activo';
  var editKey = document.getElementById('usr-edit-key')?.value || '';

  if(!nombre){ showToast('El nombre es obligatorio','error',2500); return; }
  if(!correo || !correo.includes('@')){ showToast('Correo inválido','error',2500); return; }
  if(!login){ showToast('El usuario (login) es obligatorio','error',2500); return; }

  if(!editKey){
    if(!pass || pass.length < 6){ showToast('La contraseña debe tener mínimo 6 caracteres','error',2500); return; }
    if(USERS[login]){ showToast('Ya existe un usuario con ese login: '+login,'error',3000); return; }
  }

  var initials = nombre.split(' ').map(function(p){return p[0]||'';}).join('').toUpperCase().slice(0,2);
  var passFinal = pass || (USERS[editKey]?.pass);

  USERS[login] = {
    pass: passFinal,
    name: nombre,
    rol: rol,
    initials: initials,
    entidad: rol==='Cliente' ? entidad : null,
    correo: correo,
    estado: estado
  };

  if(editKey && editKey !== login) delete USERS[editKey];

  // Update users table
  renderTablaUsuarios();
  closeM('m-usuario');
  var accion = editKey ? 'actualizado' : 'creado';
  showToast('Usuario '+login+' '+accion+' exitosamente. Contrase&#241;a: '+passFinal, 'success', 5000);
  addLog(nombre,'Usuarios', editKey?'Edición':'Nuevo Usuario','—',rol+' · '+correo,
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Datos Maestros');
}

function renderTablaUsuarios(){
  var tbody = document.getElementById('tbody-usuarios-main') || document.querySelector('#pg-usuarios tbody');
  if(!tbody) return;
  var colores = ['var(--blue)','var(--teal)','var(--orange)','var(--red)','var(--green)','var(--navy)'];
  var rolChip = {
    'admin_riesgos':'c-alto',
    'Operativo':'c-alto',
    'evaluador':'c-bajo',
    'Cliente':'c-bajo',
    'Administrador':'c-pend',
    'Analista':'c-ok',
    'Auditor':'c-rev',
    'Consultor':'c-med'
  };
  var rolLabel = {
    'admin_riesgos':'ADMINISTRADOR DE RIESGOS',
    'Operativo':'ADMINISTRADOR DE RIESGOS',
    'evaluador':'EVALUADOR',
    'Cliente':'EVALUADOR',
    'Administrador':'Administrador',
    'Analista':'Analista',
    'Auditor':'Auditor',
    'Consultor':'Consultor'
  };
  var html = '';
  var entries = Object.keys(USERS);
  for(var i=0;i<entries.length;i++){
    var key = entries[i]; var u = USERS[key];
    var col = colores[i%colores.length];
    var chip = rolChip[u.rol] || 'c-pend';
    var est = u.estado || 'Activo';
    var correo = u.correo || key+'@infraseg.co';
    var nombreEntidad = u.entidad ? (window.ENTIDADES_CONFIG && window.ENTIDADES_CONFIG[u.entidad] ? window.ENTIDADES_CONFIG[u.entidad].nombre : u.entidad) : '—';
    
    html += '<tr>';
    html += '<td><div style="display:flex;align-items:center;gap:8px;">';
    html += '<div style="width:28px;height:28px;background:'+col+';border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;">'+u.initials+'</div>';
    html += '<div><div style="font-size:12.5px;font-weight:600;">'+u.name+'</div><div style="font-size:10.5px;color:var(--muted);">'+correo+'</div></div>';
    html += '</div></td>';
    html += '<td><span class="chip '+chip+'">'+(rolLabel[u.rol]||u.rol)+'</span></td>';
    html += '<td style="font-size:11.5px;">'+key+'</td>';
    html += '<td style="font-size:11.5px;">'+nombreEntidad+'</td>';
    html += '<td><span class="chip '+(est==='Activo'?'c-ok':'c-inac')+'">'+est+'</span></td>';
    html += '<td style="white-space:nowrap;">';
    html += '<button class="btn btn-outline btn-xs" style="margin-right:3px;" data-edit-key="'+key+'" onclick="editarUsuarioAdmin(this.dataset.editKey)">Editar</button>';
    html += '<button class="btn btn-xs" style="background:#FEF2F2;color:var(--red);border:1px solid #FCA5A5;" data-del-key="'+key+'" onclick="eliminarUsuarioAdmin(this.dataset.delKey)">Borrar</button>';
    html += '</td></tr>';
  }
  tbody.innerHTML = html;
  var lbl = document.getElementById('usr-count-lbl');
  if(lbl) lbl.textContent = Object.keys(USERS).length + ' usuarios';
}

function editarUsuario(key){
  var u = USERS[key]; if(!u) return;
  document.getElementById('m-usuario-title').textContent = 'Editar Usuario — '+key;
  document.getElementById('usr-edit-key').value = key;
  var set = function(id,val){ var el=document.getElementById(id); if(el) el.value=val||''; };
  set('usr-nombre', u.name); set('usr-correo', u.correo||''); set('usr-login', key);
  set('usr-rol', u.rol); set('usr-entidad', u.entidad||''); set('usr-estado', u.estado||'Activo');
  set('usr-pass','');
  var pg = document.getElementById('usr-pass-group');
  if(pg){ pg.querySelector('label').textContent='Nueva contrase&#241;a (dejar vac&#237;o para no cambiar)';
    pg.querySelector('div[style]').nextElementSibling && (pg.querySelector('[style*="color:var(--muted)"]').textContent='Dejar en blanco para mantener la contrase&#241;a actual.'); }
  openM('m-usuario');
}


function renderOrganizaciones(){
  var tbody = document.getElementById('tbody-organizaciones');
  if(!tbody) return;
  
  var html = '';
  if(!window.ENTIDADES_CONFIG || Object.keys(window.ENTIDADES_CONFIG).length === 0){
    html = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">Sin organizaciones registradas</td></tr>';
  } else {
    Object.keys(window.ENTIDADES_CONFIG).forEach(function(key){
      var org = window.ENTIDADES_CONFIG[key];
      html += '<tr style="border-bottom:1px solid #eee;">';
      html += '<td style="padding:12px;font-weight:600;color:var(--navy);">'+org.nombre+'</td>';
      html += '<td style="padding:12px;color:#666;">'+org.acronimo+'</td>';
      html += '<td style="padding:12px;text-align:center;"><span style="background:#e8f0f8;color:#1a3a5c;padding:4px 8px;font-size:11px;border-radius:4px;">👤 Admin + 👤 Eval</span></td>';
      html += '<td style="padding:12px;text-align:center;"><span style="background:#d4edda;color:#155724;padding:4px 8px;font-size:11px;border-radius:4px;">'+org.estado+'</span></td>';
      html += '<td style="padding:12px;text-align:center;">';
      html += '<button class="btn btn-outline btn-xs" onclick="alert(\'Organización: '+org.nombre+'\\n\\n👤 ADMINISTRADOR DE RIESGOS\\n👤 EVALUADOR\')">Ver Roles</button>';
      html += '</td></tr>';
    });
  }
  
  tbody.innerHTML = html;
  
  var lbl = document.getElementById('org-count-lbl');
  if(lbl){
    var count = Object.keys(window.ENTIDADES_CONFIG || {}).length;
    lbl.textContent = count + ' organizaci' + (count === 1 ? 'ón' : 'ones');
  }
}

function abrirModalNuevaOrganizacion(){
  var nombre = prompt('Nombre de la organización:');
  if(!nombre) return;
  var acronimo = prompt('Acrónimo:');
  if(!acronimo) return;
  crearEntidadNueva(nombre, acronimo);
  renderOrganizaciones();
}

function eliminarUsuario(key){
  if(key === (currentUser?.name?.toLowerCase().replace(/\s+/g,'_')) || key === 'admin'){
    showToast('No puedes eliminar tu propio usuario o el admin','error',3000); return; }
  showConfirmToast('¿Eliminar usuario '+key+'?', 'Esta acción no se puede deshacer.', function(){
    delete USERS[key];
    renderTablaUsuarios();
    showToast('Usuario '+key+' eliminado','info',2000);
  });
}

// ─── DIMENSIONES INFO TERCERA PARTE ──────────────────────
var DIMS_ACTIVAS = ['si','cn','op','fr','laft','cu','fi'];
var DIMS_CATALOG = {
  si:   'Riesgo de Seguridad de la Informaci&#243;n y Ciberseguridad',
  cn:   'Riesgo de Continuidad del Negocio',
  op:   'Riesgo Operacional',
  fr:   'Riesgo de Fraude y Corrupci&#243;n',
  laft: 'Riesgo de Lavado de Activos y Financiaci&#243;n del Terrorismo',
  cu:   'Riesgo de Cumplimiento',
  fi:   'Capacidad Financiera'
};
var DIMS_CUSTOM_CTR = 0;

function abrirModalDimensiones(){
  var m = document.getElementById('m-dimensiones');
  if(!m){ crearModalDimensiones(); } else { openM('m-dimensiones'); }
  renderChecksDimensiones();
}

function crearModalDimensiones(){
  var div = document.createElement('div');
  div.className = 'overlay'; div.id = 'm-dimensiones';
  var html = '';
  html += '<div class="modal" style="max-width:520px;">';
  html += '<div class="mh"><h3>Gestionar Dimensiones a Evaluar</h3>';
  html += '<button class="mc-btn" id="dim-modal-close-btn">&#10005;</button></div>';
  html += '<div class="mb">';
  html += '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;">Marca las dimensiones que aplican para este tercero:</div>';
  html += '<div id="dims-checks-wrap" style="display:flex;flex-direction:column;gap:7px;margin-bottom:16px;max-height:260px;overflow-y:auto;padding-right:4px;"></div>';
  html += '<div style="border-top:1px solid var(--border);padding-top:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:8px;">+ Agregar dimensi&#243;n personalizada</div>';
  html += '<div style="display:flex;gap:8px;">';
  html += '<input type="text" id="dim-custom-input" placeholder="Nombre de la nueva dimensi&#243;n..." style="flex:1;padding:8px 11px;border:1px solid var(--border2);border-radius:var(--r);font-size:12.5px;font-family:inherit;"/>';
  html += '<button id="dim-add-btn" class="btn btn-success btn-sm" style="white-space:nowrap;">+ Agregar</button>';
  html += '</div>';
  html += '<div style="font-size:11px;color:var(--muted);margin-top:5px;">La nueva dimensi&#243;n se a&#241;adir&#225; marcada autom&#225;ticamente.</div>';
  html += '</div></div>';
  html += '<div class="mf">';
  html += '<button id="dim-modal-cancel-btn" class="btn btn-outline">Cancelar</button>';
  html += '<button id="dim-modal-apply-btn" class="btn btn-success">&#10003; Aplicar</button>';
  html += '</div></div>';
  div.innerHTML = html;
  document.body.appendChild(div);
  div.querySelector('#dim-modal-close-btn').addEventListener('click', function(){ closeM('m-dimensiones'); });
  div.querySelector('#dim-modal-cancel-btn').addEventListener('click', function(){ closeM('m-dimensiones'); });
  div.querySelector('#dim-modal-apply-btn').addEventListener('click', function(){ aplicarDimensiones(); });
  div.querySelector('#dim-add-btn').addEventListener('click', function(){ agregarDimPersonalizada(); });
  openM('m-dimensiones');
}

function renderChecksDimensiones(){
  var wrap = document.getElementById('dims-checks-wrap'); if(!wrap) return;
  var html = '';
  var entries = Object.entries(DIMS_CATALOG);
  for(var i=0;i<entries.length;i++){
    var key=entries[i][0], label=entries[i][1];
    var checked = DIMS_ACTIVAS.indexOf(key) !== -1;
    var isCustom = key.indexOf('custom_dim_') === 0;
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<label style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--gray3);border-radius:var(--r);cursor:pointer;font-size:12.5px;flex:1;">';
    html += '<input type="checkbox" class="dim-modal-chk" value="'+key+'" '+(checked?'checked':'')+' style="width:16px;height:16px;cursor:pointer;accent-color:var(--blue);"/>';
    html += label;
    if(isCustom) html += '<span style="font-size:10px;color:var(--muted);margin-left:6px;font-style:italic;">personalizada</span>';
    html += '</label>';
    if(isCustom){
      html += '<button class="dim-del-btn" data-key="'+key+'" style="padding:4px 8px;background:#FEF2F2;border:1px solid #FCA5A5;color:var(--red);border-radius:4px;font-size:11px;cursor:pointer;flex-shrink:0;">&#10005;</button>';
    }
    html += '</div>';
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('.dim-del-btn').forEach(function(btn){
    btn.addEventListener('click', function(){ eliminarDimCatalog(this.dataset.key); });
  });
}

function agregarDimPersonalizada(){
  var inp = document.getElementById('dim-custom-input');
  var nombre = inp ? inp.value.trim() : '';
  if(!nombre){ showToast('Escribe el nombre de la dimensi&#243;n','error',2000); return; }
  DIMS_CUSTOM_CTR++;
  var key = 'custom_dim_'+DIMS_CUSTOM_CTR;
  DIMS_CATALOG[key] = nombre;
  DIMS_ACTIVAS.push(key);
  agregarFilaDimTabla(key, nombre);
  if(inp) inp.value = '';
  renderChecksDimensiones();
  showToast('"'+nombre+'" agregada','success',2000);
}

function eliminarDimCatalog(key){
  delete DIMS_CATALOG[key];
  DIMS_ACTIVAS = DIMS_ACTIVAS.filter(function(k){ return k !== key; });
  var tr = document.querySelector('[data-dim-key="'+key+'"]');
  if(tr) tr.remove();
  renderChecksDimensiones();
  showToast('Dimensi&#243;n eliminada del cat&#225;logo','info',1500);
}

function agregarFilaDimTabla(key, nombre){
  var tbody = document.querySelector('#tabla-dimensiones-evaluar tbody');
  if(!tbody) return;
  var tr = document.createElement('tr');
  tr.setAttribute('data-dim-key', key);
  var html = '';
  html += '<td style="padding:8px 12px;font-weight:600;">'+nombre+'</td>';
  html += '<td style="padding:6px 12px;"><select id="dim-aplica-'+key+'" style="font-size:11.5px;padding:3px 6px;border:1px solid var(--border2);border-radius:4px;"><option value="">&#8212;</option><option>S&#237;</option><option>No aplica</option></select></td>';
  html += '<td style="padding:6px 12px;"><input type="text" id="dim-resp-'+key+'" placeholder="Nombre" style="width:100%;font-size:11.5px;padding:4px 7px;border:1px solid var(--border2);border-radius:4px;"/></td>';
  html += '<td style="padding:6px 12px;"><input type="text" id="dim-cargo-'+key+'" placeholder="Cargo" style="width:100%;font-size:11.5px;padding:4px 7px;border:1px solid var(--border2);border-radius:4px;"/></td>';
  html += '<td style="padding:6px 12px;"><input type="date" id="dim-fecha-'+key+'" style="font-size:11.5px;padding:4px 7px;border:1px solid var(--border2);border-radius:4px;"/></td>';
  html += '<td style="padding:6px 8px;text-align:center;"><button class="dim-quitar-btn" data-key="'+key+'" style="background:#FEF2F2;border:1px solid #FCA5A5;color:var(--red);border-radius:4px;padding:2px 8px;font-size:11px;cursor:pointer;">&#10005;</button></td>';
  tr.innerHTML = html;
  tr.querySelector('.dim-quitar-btn').addEventListener('click', function(){ quitarDimensionEvaluar(this.dataset.key); });
  tbody.appendChild(tr);
}

function aplicarDimensiones(){
  var chks = document.querySelectorAll('.dim-modal-chk');
  DIMS_ACTIVAS = [];
  chks.forEach(function(c){ if(c.checked) DIMS_ACTIVAS.push(c.value); });
  var tbody = document.querySelector('#tabla-dimensiones-evaluar tbody');
  if(tbody){
    tbody.querySelectorAll('tr').forEach(function(tr){
      var key = tr.getAttribute('data-dim-key');
      if(key) tr.style.display = DIMS_ACTIVAS.indexOf(key) !== -1 ? '' : 'none';
    });
  }
  closeM('m-dimensiones');
  showToast('Dimensiones actualizadas: '+DIMS_ACTIVAS.length+' activas','success',2000);
}

function quitarDimensionEvaluar(key){
  DIMS_ACTIVAS = DIMS_ACTIVAS.filter(function(k){ return k!==key; });
  var tr = document.querySelector('[data-dim-key="'+key+'"]');
  if(tr) tr.style.display='none';
  var chk = document.querySelector('.dim-modal-chk[value="'+key+'"]');
  if(chk) chk.checked = false;
  showToast('Dimensi&#243;n quitada','info',1500);
}

function doLogout(){
  try{
    var app = document.getElementById('app');
    var clienteApp = document.getElementById('cliente-app');
    var adminApp = document.getElementById('admin-app');
    var loginScreen = document.getElementById('login-screen');
    
    if(app) app.style.display = 'none';
    if(clienteApp) clienteApp.style.display = 'none';
    if(adminApp){
      adminApp.style.display = 'none';
      adminApp.classList.remove('active');
    }
    if(loginScreen) loginScreen.style.display = 'flex';
    
    var userField = document.getElementById('li-user');
    var passField = document.getElementById('li-pass');
    if(userField) userField.value = '';
    if(passField) passField.value = '';
    
    currentUser = null;
    window._usuarioActual = null;
    
    showToast('✅ Sesión cerrada correctamente', 'success', 2000);
    
    setTimeout(function(){
      if(userField) userField.focus();
    }, 300);
  }catch(e){
    console.error('Error en logout:', e);
    showToast('⚠️ Error al cerrar sesión', 'error', 2000);
  }
}

// ─── NAVIGATION ──────────────────────────────────────
function goPage(el, pgId){
  var adminActive = document.getElementById('admin-app').classList.contains('active');
  var appRoot = adminActive ? document.getElementById('admin-app') : document.getElementById('app');
  // Deactivate all nav items and pages within the correct container
  appRoot.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
  appRoot.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  if(el) el.classList.add('active');
  // Find page within the correct container first, then fall back to global
  var pg = appRoot.querySelector('#'+pgId) || document.getElementById(pgId);
  if(pg) pg.classList.add('active');
  // Scroll to top
  var mc = appRoot.querySelector('.main-content'); if(mc) mc.scrollTop=0;
  // Run page-specific init
  if(pgId==='pg-usuarios') try{ renderTablaUsuarios(); }catch(e){}
  if(pgId==='pg-terceros') try{ cargarTercerosDesdeAPI(); }catch(e){}
  if(pgId==='pg-logs') try{ renderLogs(window.LOGS_DATA||[]); }catch(e){}
  if(pgId==='pg-evidencias') try{ renderEvidenciasAdmin(); }catch(e){}
  if(pgId==='pg-tipologias') try{ renderTipologiasList(); }catch(e){}
  if(pgId==='pg-reportes') try{ renderReportesInformes(); }catch(e){}
  if(pgId==='pg-cuestionario'){
    try{ sincronizarSelectorCuestionario(); }catch(e){}
    try{ cargarTercerosPendientesDesdeAPI().then(function(){ actualizarSelectorCuestionario(); }); }catch(e){}
    setTimeout(function(){ try{window.acPoblarSelectorTerceroInstruc();}catch(e){} }, 150);
  }
  if(pgId==='pg-matriz'){
    try{
      var _sv=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
      if(_sv.TERCEROS_DB) Object.assign(TERCEROS_DB,_sv.TERCEROS_DB);
      if(_sv.MATRIZ_DB&&_sv.MATRIZ_DB.length){
        _sv.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
      }
      if(window.MATRIZ_DB&&window.MATRIZ_DB.length){
        window.MATRIZ_DB.forEach(function(r){ if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r); });
      }
      window.MATRIZ_DB = MATRIZ_DB;
    }catch(e){ console.warn('pg-matriz restaurar DB:', e); }
    try{
      var _ms=document.getElementById('mz-fil-tercero');
      if(_ms){
        _ms.innerHTML='<option value="">Todos</option>';
        var _sn=new Set();
        MATRIZ_DB.forEach(function(r){ if(r.tercero&&!_sn.has(r.tercero)){_sn.add(r.tercero);var o=document.createElement('option');o.value=r.tercero;o.textContent=r.tercero;_ms.appendChild(o);} });
        Object.values(TERCEROS_DB).forEach(function(t){ if(t.nombre&&!_sn.has(t.nombre)){_sn.add(t.nombre);var o=document.createElement('option');o.value=t.nombre;o.textContent=t.nombre;_ms.appendChild(o);} });
      }
    }catch(e){ console.warn('pg-matriz selector tercero:', e); }
    try{ renderMatriz(); }catch(e){ console.warn('pg-matriz renderMatriz:', e); }
    // Llamada directa e independiente: aunque algo arriba falle, el dashboard
    // de supervisión del Administrador de Riesgos debe intentar pintarse igual.
    try{
      if((window.currentUser||{}).rol==='Operativo'){
        window.renderMatrizDashSupervision && window.renderMatrizDashSupervision();
      }
    }catch(e){ console.warn('pg-matriz renderMatrizDashSupervision:', e); }
    try{ setTimeout(function(){ actualizarTipoRiesgoTags(); },100); }catch(e){}
  }
  if(pgId==='pg-seguimiento') try{ renderSeguimiento(); }catch(e){}
  if(pgId==='pg-clasificacion'){
    try{ calcClasif(); initClasificacion(); fijarEntidadClasificacion(); }catch(e){}
  }
  if(pgId==='pg-limpiar') try{ limpiarEstado(); }catch(e){}
}

// ─── MODALS ──────────────────────────────────────────
function openM(id){
  document.getElementById(id)?.classList.add('open');
  if(id==='m-tercero') renderCuestionarioAC();
}
function closeM(id){ const _m=document.getElementById(id); if(_m) _m.classList.remove('open'); }
document.addEventListener('DOMContentLoaded',()=>{ 
  document.querySelectorAll('.overlay').forEach(o=>{ o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('open'); }); }); 
  // ⭐ Refrescar tabla de terceros desde TERCEROS_DB cuando carga
  setTimeout(()=>refreshTercerosTable(), 500);
  // Refrescar cada vez que se vuelve visible (tab regresa al foco)
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) refreshTercerosTable(); });
});

// ─── STAR RATING ────────────────────────────────────
const starVals = {op:0,cn:0,si:0,cu:0,fr:0,lf:0};
function setStar(dim, val){
  starVals[dim] = val;
  const stars = document.querySelectorAll(`#stars-${dim} .star`);
  stars.forEach((s,i)=>{ s.classList.toggle('on', i < val); });
  document.getElementById(`val-${dim}`).textContent = val;
  calcCrit();
}
function calcCrit(){
  const vals = Object.values(starVals);
  const filled = vals.filter(v=>v>0);
  if(filled.length === 0){ resetCritBox(); return; }
  const sum = vals.reduce((a,b)=>a+b,0);
  const prom = (sum / 6).toFixed(2);
  const pac = parseFloat(document.getElementById('t-pac')?.value) || null;
  document.getElementById('crit-prom').textContent = prom;
  let freq='', color='var(--muted)', chip='';
  if(parseFloat(prom)>=4){freq='Se evalúa';color='var(--red)';chip='<span class="chip c-crit">SE EVALÚA</span>';}
  else if(parseFloat(prom)>=3){freq='Se evalúa';color='var(--orange)';chip='<span class="chip c-alto">SE EVALÚA</span>';}
  else{freq='No se evalúa';color='var(--green)';chip='<span class="chip c-bajo">NO SE EVALÚA</span>';}
  document.getElementById('crit-prom').style.color = color;
  document.getElementById('crit-freq').textContent = freq;
  document.getElementById('crit-freq').style.color = color;
  document.getElementById('crit-chip-wrap').innerHTML = chip;
  const tPer = document.getElementById('t-periodicidad');
  if(tPer){ tPer.textContent = freq; tPer.style.color = color; }
}
function resetCritBox(){
  document.getElementById('crit-prom').textContent='—';
  document.getElementById('crit-prom').style.color='var(--muted)';
  document.getElementById('crit-freq').textContent='Completa las dimensiones para ver la periodicidad';
  document.getElementById('crit-freq').style.color='var(--muted)';
  document.getElementById('crit-chip-wrap').innerHTML='';
}

// ─── CALCULAR CLASIFICACION MODAL ────────────────────
function calcClasif(){
  const vals = ['cls-op','cls-cn','cls-si','cls-cu','cls-fr','cls-lf'].map(id=>{
    const el=document.getElementById(id); return el ? parseInt(el.value)||0 : 0;
  });
  const prom = (vals.reduce((a,b)=>a+b,0)/6).toFixed(2);
  const p = document.getElementById('cls-prom');
  const f = document.getElementById('cls-freq');
  if(p) p.textContent = prom;
  if(f){
    if(parseFloat(prom)>=4){ f.textContent='Anual'; f.style.color='var(--red)'; }
    else if(parseFloat(prom)>=3){ f.textContent='Bienal'; f.style.color='var(--orange)'; }
    else{ f.textContent='No evaluar'; f.style.color='var(--green)'; }
  }
}

// ─── SAVE ACTIONS ────────────────────────────────────
// ════════════════════════════════════════════════════════
// NUEVO TERCERO — DESPLEGABLES + CUESTIONARIO + GUARDAR
// Tablas: dbo.Matriz_Riesgos_Resultados, dbo.Maestra_Tipologia_Riesgos
//         dbo.Preguntas_Cuestionario, dbo.Relacion_Terceros
// ════════════════════════════════════════════════════════

// ─── CATÁLOGO DE DIMENSIONES (textos hint) ────────────
const DIM_HINTS = {
  op: {
    '5':'La tercera parte opera directamente procesos misionales y es proveedor único.',
    '4':'La tercera parte soporta procesos misionales de la entidad.',
    '3':'La tercera parte soporta procesos de apoyo y es proveedor único.',
    '2':'La tercera parte soporta procesos de apoyo.',
    '1':'La tercera parte soporta procesos estratégicos y de evaluación.'
  },
  cn: {
    '5':'Sin la participación del tercero no se puede prestar el servicio ni desarrollar actividades críticas.',
    '4':'El servicio puede esperar 1 a 2 días sin afectar actividades críticas (con contingencia).',
    '3':'El servicio puede esperar 3 a 4 días sin afectar actividades críticas (con contingencia).',
    '2':'El servicio puede esperar 1 semana hasta 4 semanas sin afectar actividades críticas.',
    '1':'El servicio puede esperar más de 4 semanas sin afectar actividades críticas.'
  },
  si: {
    '5':'Administra y procesa información pública clasificada o reservada de clientes.',
    '4':'Soporta, accede y/o almacena información pública clasificada o reservada de negocio.',
    '3':'Accede a información pública reservada.',
    '2':'Accede a información pública clasificada.',
    '1':'Accede únicamente a información de carácter público.'
  },
  cu: {
    '5':'El incumplimiento podría generar la intervención de un ente de control a la organización.',
    'na4':'N/A — No aplica para este nivel de cumplimiento.',
    '3':'El incumplimiento podría generar sanciones administrativas o financieras de un ente de control.',
    'na2':'N/A — No aplica para este nivel de cumplimiento.',
    '1':'El incumplimiento podría generar acciones preventivas o correctivas de un ente de control.'
  },
  fr: {
    '5':'El proveedor desarrolla actividades core de procesos misionales sujetas a fraude o corrupción.',
    'na4':'N/A — No aplica para este nivel de fraude.',
    '3':'El proveedor desarrolla actividades de procesos de apoyo sujetas a hechos de fraude o corrupción.',
    'na2':'N/A — No aplica para este nivel de fraude.',
    '1':'El proveedor desarrolla actividades de procesos estratégicos y de evaluación sujetas a fraude.'
  },
  lf: {
    '5':'El tercero representa riesgo de contagio LAFT y NO está obligado a implementar controles (Circular 100-000016/2020).',
    'na4':'N/A — No aplica para este nivel LAFT.',
    '3':'El tercero representa riesgo de contagio LAFT y SÍ está obligado a implementar controles (Circular 100-000016/2020).',
    'na2':'N/A — No aplica para este nivel LAFT.',
    '1':'El proveedor prestará el servicio a través de subcontratistas sin trazabilidad de antecedentes.'
  }
};

// ─── CUESTIONARIO AMBIENTE DE CONTROL ────────────────
const PREGUNTAS_AC = [
  // ═══ RIESGO OPERACIONAL (8) ═══
  {id:'q1', texto:'¿Se cuenta con una metodología de identificación de riesgos operacionales (potenciales y ocurridos) asociados a cada una de las actividades?'},
  {id:'q2', texto:'¿Se cuenta con el perfil de riesgo inherente considerando factores cualitativos y/o cuantitativos en la metodología de medición?'},
  {id:'q3', texto:'¿Se tienen identificados los controles y la medición del perfil de riesgo residual para las actividades de los procesos?'},
  {id:'q4', texto:'¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?'},
  {id:'q5', texto:'¿Se cuenta con un procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo?'},
  {id:'q6', texto:'¿Se cuenta con protocolo de comunicación ante la identificación de eventos de riesgo que impacten el servicio?'},
  {id:'q7', texto:'¿Se cuenta con un plan de capacitación sobre gestión de riesgos operacionales? ¿Se miden los resultados?'},
  {id:'q8', texto:'¿Los acuerdos contractuales con las cuartas partes incluyen requisitos de control? ¿Se realizan evaluaciones previas?'},
  
  // ═══ CONTINUIDAD DE NEGOCIO (8) ═══
  {id:'q9', texto:'¿Tienen un Plan de continuidad del negocio actualizado?'},
  {id:'q10', texto:'¿Dentro de la matriz de riesgos, se encuentran identificados los riesgos que afectan la continuidad del negocio?'},
  {id:'q11', texto:'¿Tienen un plan de contingencia donde se incluyan los servicios contratados?'},
  {id:'q12', texto:'¿Tienen un plan de administración de crisis con alcance, tipos y interlocutores definidos?'},
  {id:'q13', texto:'¿Tienen establecido un plan de recuperación de desastres (DRP)?'},
  {id:'q14', texto:'¿Dentro del análisis BIA incluyen los servicios contratados y están identificados RTO y RPO?'},
  {id:'q15', texto:'¿Entregaron cronograma de pruebas de continuidad y evidencia de resultados?'},
  {id:'q16', texto:'¿El proveedor tiene plan de capacitaciones sobre continuidad del negocio? ¿Se miden resultados?'},
];

function renderCuestionarioAC(){
  const wrap = document.getElementById('cuestionario-ac');
  if(!wrap) return;
  wrap.innerHTML = PREGUNTAS_AC.map((p,i)=>`
    <div style="background:var(--gray3);border-radius:var(--r);padding:10px 14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;font-size:12px;color:var(--text);"><b>${i+1}.</b> ${p.texto}</div>
      <div style="display:flex;gap:6px;">
        <button id="ac-si-${p.id}" class="btn btn-xs" onclick="setAC('${p.id}',true)"
          style="background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;">✅ Sí</button>
        <button id="ac-no-${p.id}" class="btn btn-xs" onclick="setAC('${p.id}',false)"
          style="background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;">❌ No</button>
      </div>
    </div>`).join('');
}

const AC_RESPUESTAS = {};
function setAC(id, val){
  AC_RESPUESTAS[id] = val;
  const siBtn = document.getElementById('ac-si-'+id);
  const noBtn = document.getElementById('ac-no-'+id);
  if(siBtn) siBtn.style.cssText = val
    ? 'background:#e8f8f2;border:2px solid var(--green);color:var(--green);font-weight:700;min-width:52px;'
    : 'background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;';
  if(noBtn) noBtn.style.cssText = !val
    ? 'background:#fde8e8;border:2px solid var(--red);color:var(--red);font-weight:700;min-width:52px;'
    : 'background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;';
  calcPAC();
}

function calcPAC(){
  const respondidas = Object.keys(AC_RESPUESTAS).length;
  if(!respondidas){ document.getElementById('t-pac').textContent='—'; return; }
  const positivas = Object.values(AC_RESPUESTAS).filter(v=>v).length;
  const pct = Math.round((positivas/PREGUNTAS_AC.length)*100);
  const el = document.getElementById('t-pac');
  if(el){ el.textContent = pct+'%';
    el.style.color = pct>=75 ? 'var(--green)' : pct>=50 ? 'var(--orange)' : 'var(--red)'; }
}

// ─── DIMENSIONES DESPLEGABLE ─────────────────────────
const COLOR_NIVEL = {'5':'var(--red)','4':'var(--orange)','3':'#856404','2':'var(--blue)','1':'var(--green)','na4':'var(--muted)','na2':'var(--muted)','':'var(--muted)'};

function onDimChange(dim){
  const sel = document.getElementById('sel-'+dim);
  const badge = document.getElementById('badge-'+dim);
  const hint = document.getElementById('hint-'+dim);
  if(!sel) return;
  const val = sel.value;
  const numVal = val.startsWith('na') ? null : (val ? parseInt(val) : null);
  if(badge){
    badge.textContent = val ? (val.startsWith('na') ? 'N/A' : val) : '—';
    badge.style.color = COLOR_NIVEL[val] || 'var(--muted)';
  }
  if(hint && DIM_HINTS[dim]) hint.textContent = DIM_HINTS[dim][val] || 'Selecciona un nivel para ver la descripción';
  
  // ── Actualizar cfDimsAgregadas con el nuevo valor ──
  var foundDim = cfDimsAgregadas.find(function(d){ return d.key === dim; });
  if(foundDim){
    foundDim.val = val; // Sincronizar el valor
  }
  
  calcPromCrit();
  
  // ── Auto-guardar después de cambiar ──
  try{ calcCfProm(); }catch(e){}
  try{ _clsAutoGuardarDims(); }catch(e){}
}

function calcPromCrit(){
  const dims = ['op','cn','si','cu','fr','lf'];
  const vals = dims.map(d=>{
    const sel = document.getElementById('sel-'+d);
    if(!sel || !sel.value || sel.value.startsWith('na')) return null;
    return parseInt(sel.value);
  }).filter(v=>v!==null);

  const promEl = document.getElementById('crit-prom');
  const freqEl = document.getElementById('crit-freq');
  const chipEl = document.getElementById('crit-chip-wrap');
  const zonaEl = document.getElementById('crit-zona-lbl');
  const perEl  = document.getElementById('t-periodicidad');
  const zonaFEl= document.getElementById('t-zona');
  // Panel inferior del formulario
  const cfZona    = document.getElementById('cf-zona');
  const cfPeriod  = document.getElementById('cf-period');
  const cfDimsEval= document.getElementById('cf-dims-eval');

  const total = cfDimsAgregadas.length;
  if(cfDimsEval) cfDimsEval.textContent = vals.length + ' / ' + total;

  if(!vals.length){
    if(promEl){promEl.textContent='—';promEl.style.color='var(--muted)';}
    if(freqEl){freqEl.textContent='Completa las dimensiones';freqEl.style.color='var(--muted)';}
    if(chipEl) chipEl.innerHTML='';
    if(cfZona)   cfZona.textContent='—';
    if(cfPeriod) cfPeriod.textContent='—';
    return;
  }

  const prom = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
  const p = parseFloat(prom);
  if(promEl){ promEl.textContent=prom; }

  let freq='', chip='', zona='', color='var(--navy)';
  if(p>=4){
    freq='Se evalúa'; chip='<span class="chip c-crit">SE EVALÚA — Prom: '+prom+'</span>';
    zona='EXTREMO / ALTO'; color='var(--red)';
  } else if(p>=3){
    freq='Se evalúa'; chip='<span class="chip c-alto">SE EVALÚA — Prom: '+prom+'</span>';
    zona='ALTO / MEDIO'; color='var(--orange)';
  } else {
    freq='No se evalúa'; chip='<span class="chip c-bajo">NO SE EVALÚA — Prom: '+prom+'</span>';
    zona='BAJO'; color='var(--green)';
  }

  if(promEl) promEl.style.color = color;
  if(freqEl){ freqEl.textContent=freq; freqEl.style.color=color; }
  if(chipEl) chipEl.innerHTML=chip;
  if(zonaEl) zonaEl.textContent='Zona: '+zona+' · Tipologías: '+vals.length+'/'+total;
  if(perEl)  perEl.textContent=freq;
  if(zonaFEl){ zonaFEl.textContent=zona; zonaFEl.style.color=color; zonaFEl.style.fontWeight='700'; }
  // Actualizar panel inferior
  if(cfZona)   { cfZona.textContent=zona; cfZona.style.color=color; cfZona.style.fontWeight='700'; }
  if(cfPeriod) { cfPeriod.textContent=freq; cfPeriod.style.color=color; cfPeriod.style.fontWeight='700'; }
  // Mostrar alerta AC si prom >= 3
  const alertaAC = document.getElementById('alerta-ac');
  if(alertaAC) alertaAC.style.display = p>=3 ? 'block' : 'none';
}
// end calcPromCrit

function syncEntidadSelects(){
  const v = document.getElementById('cf-entidad')?.value || document.getElementById('t-entidad')?.value || '';
  const cfgSel = document.getElementById('cfg-cliente-sel');
  const ejSel = document.getElementById('ejec-cliente-sel');
  if(cfgSel && v && !cfgSel.disabled) cfgSel.value = v;
  if(ejSel && v && !ejSel.disabled) ejSel.value = v;
}

// ─── TOGGLE FORMULARIO CLASIFICACION ─────────────────
function toggleClasifForm(){
  const body = document.getElementById('clasif-form-body');
  const arr  = document.getElementById('clasif-form-arr');
  if(!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if(arr) arr.textContent = open ? '▼' : '▲';
}

// ─── CUESTIONARIO AC EN CLASIFICACION ────────────────
const CF_AC_RESP = {};
function renderCfCuestionario(){
  const wrap = document.getElementById('cf-cuestionario-ac');
  if(!wrap) return;
  wrap.innerHTML = PREGUNTAS_AC.map((p,i)=>`
    <div style="background:var(--gray3);border-radius:var(--r);padding:9px 14px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;font-size:12px;color:var(--text);"><b>${i+1}.</b> ${p.texto}</div>
      <div style="display:flex;gap:6px;">
        <button id="cf-ac-si-${p.id}" class="btn btn-xs" onclick="setCfAC('${p.id}',true)"
          style="background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;">✅ Sí</button>
        <button id="cf-ac-no-${p.id}" class="btn btn-xs" onclick="setCfAC('${p.id}',false)"
          style="background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;">❌ No</button>
      </div>
    </div>`).join('');
}

function setCfAC(id, val){
  CF_AC_RESP[id] = val;
  const siBtn = document.getElementById('cf-ac-si-'+id);
  const noBtn = document.getElementById('cf-ac-no-'+id);
  if(siBtn) siBtn.style.cssText = val
    ? 'background:#e8f8f2;border:2px solid var(--green);color:var(--green);font-weight:700;min-width:52px;'
    : 'background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;';
  if(noBtn) noBtn.style.cssText = !val
    ? 'background:#fde8e8;border:2px solid var(--red);color:var(--red);font-weight:700;min-width:52px;'
    : 'background:var(--gray2);border:1px solid var(--border2);color:var(--text);min-width:52px;';
  calcCfPAC();
}

function calcCfPAC(){
  const total = PREGUNTAS_AC.length;
  const resp  = Object.keys(CF_AC_RESP).length;
  if(!resp){ const el=document.getElementById('cf-pac'); if(el){el.textContent='—';el.style.color='var(--muted)';} return; }
  const pos = Object.values(CF_AC_RESP).filter(v=>v).length;
  const pct = Math.round((pos/total)*100);
  const el  = document.getElementById('cf-pac');
  if(el){ el.textContent=pct+'%'; el.style.color=pct>=75?'var(--green)':pct>=50?'var(--orange)':'var(--red)'; }
}

// ─── CATÁLOGO TIPOLOGÍAS (dbo.Maestra_Tipologia_Riesgos) ──
const TIPOLOGIA_CATALOG = {
  op: {
    nombre: 'Procesos soportados por el Tercero\n(Riesgo Operativo)',
    hasNA: false, soloImpar: false,
    hints: {
      '5': '5 — El tercero opera directamente procesos misionales y es proveedor único de la organización',
      '4': '4 — El tercero soporta procesos misionales de la organización',
      '3': '3 — El tercero soporta procesos de apoyo de la organización y es proveedor único',
      '2': '2 — El tercero soporta procesos de apoyo',
      '1': '1 — El tercero soporta procesos estratégicos y de evaluación'
    }
  },
  cn: {
    nombre: 'Importancia en la continuidad de negocio\n(Riesgo Continuidad de Negocio)',
    hasNA: false, soloImpar: false,
    hints: {
      '5': '5 — Sin la participación del tercero no se puede prestar el servicio',
      '4': '4 — El servicio prestado por el tercero puede esperar desde 1 día hasta 2 días',
      '3': '3 — El servicio prestado por el tercero puede esperar desde 3 días hasta 4 días',
      '2': '2 — El servicio prestado por el tercero puede esperar desde 1 semana hasta 4 semanas',
      '1': '1 — El servicio prestado por el tercero puede esperar por más de 4 semanas'
    }
  },
  si: {
    nombre: 'Acceso a la información\n(Riesgos Seguridad de la información)',
    hasNA: false, soloImpar: false,
    hints: {
      '5': '5 — El tercero administra y procesa información clasificada o información reservada de clientes',
      '4': '4 — El tercero accede y/o almacena información clasificada o información reservada de negocio',
      '3': '3 — El tercero accede a información reservada',
      '2': '2 — El tercero accede a información clasificada',
      '1': '1 — El tercero accede a información de carácter público'
    }
  },
  cu: {
    nombre: 'Regulación-Cumplimiento\n(Riesgo Cumplimiento)',
    hasNA: true, soloImpar: true,
    hints: {
      '5': '5 — El incumplimiento de requerimientos legales por parte de la tercera parte podría generar la intervención de un ente de control a la organización.',
      'na4': 'N/A — Este nivel no aplica para Cumplimiento Regulatorio.',
      '3': '3 — El incumplimiento de requerimientos legales por parte de la tercera parte podría generar sanciones (administrativas o financieras) de un ente de control a la organización.',
      'na2': 'N/A — Este nivel no aplica para Cumplimiento Regulatorio.',
      '1': '1 — El incumplimiento de requerimientos legales por parte de la tercera parte podría generar acciones preventivas o correctivas de un ente de control a la organización.'
    }
  },
  fr: {
    nombre: 'Fraude y/o corrupción\n(Riesgo Fraude y Corrupción)',
    hasNA: true, soloImpar: true,
    hints: {
      '5': '5 — El proveedor desarrolla actividades core asociadas a los procesos misionales del negocio que pueden ser sujetas a hechos de corrupción o fraude.',
      'na4': 'N/A — Este nivel no aplica para Fraude y Corrupción (entre nivel 3 y 5, no existe criterio de nivel 4).',
      '3': '3 — El proveedor desarrolla actividades asociadas a los procesos de apoyo del negocio que pueden ser sujetas a hechos de corrupción o fraude.',
      'na2': 'N/A — Este nivel no aplica para Fraude y Corrupción (entre nivel 1 y 3, no existe criterio de nivel 2).',
      '1': '1 — El proveedor desarrolla actividades asociadas a los procesos estratégicos y de evaluación del negocio que pueden ser sujetas a hechos de corrupción o fraude.'
    }
  },
  laft: {
    nombre: 'Lavado de Activos y Financiación al Terrorismo (LAFT)\n(Riesgo LAFT)',
    hasNA: true, soloImpar: true,
    hints: {
      '5': '5 — El tercero representa un riesgo de contagio de LAFT para la organización y NO está obligado a implementar controles de acuerdo con los lineamientos de la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades.',
      'na4': 'N/A — Este nivel no aplica para LAFT (entre nivel 3 y 5, no existe criterio de nivel 4).',
      '3': '3 — El tercero representa un riesgo de contagio de LAFT para la organización y está obligado a implementar controles de acuerdo con los lineamientos de la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades.',
      'na2': 'N/A — Este nivel no aplica para LAFT (entre nivel 1 y 3, no existe criterio de nivel 2).',
      '1': '1 — El proveedor prestará el servicio a través de subcontratistas de los cuales no se tiene trazabilidad de sus antecedentes.'
    }
  },
};

// Lista de tipologías actualmente agregadas al formulario
var cfDimsAgregadas = []; window.cfDimsAgregadas = cfDimsAgregadas; window.cfDimsAgregadas = cfDimsAgregadas; // [{id, key, nombre, val, hasNA}]

function actualizarOpcionesSelectorTipologias(){
  const sel = document.getElementById('cf-tip-selector');
  if(!sel) return;
  const prevVal = sel.value;
  sel.innerHTML = '<option value="">— Elegir tipología —</option>';
  const keysAgregadas = cfDimsAgregadas.map(d=>d.key);

  Object.entries(TIPOLOGIA_CATALOG).forEach(([key, cat])=>{
    const opt = document.createElement('option');
    opt.value = key;
    if(keysAgregadas.includes(key)){
      opt.textContent = '✓ ' + cat.nombre + ' (quitar)';
      opt.style.color = '#DC2626';
    } else {
      opt.textContent = cat.nombre;
    }
    sel.appendChild(opt);
  });

  if(prevVal) sel.value = prevVal;
}

function agregarTipologiaSeleccionada(){
  // ⭐ VALIDACIÓN: Verificar que hay contrato seleccionado
  const contratoSelCls = document.getElementById('cls-contrato-actual');
  const contratoSelQ = document.getElementById('q-contrato-sel');
  const contratoValor = (contratoSelCls && contratoSelCls.value) || (contratoSelQ && contratoSelQ.value);
  
  if(!contratoValor){
    showToast('⚠️ Debes seleccionar un CONTRATO primero','error',2500);
    return;
  }
  
  const sel = document.getElementById('cf-tip-selector');
  const key = sel?.value;
  if(!key){ showToast('Selecciona una tipología primero','error',2000); return; }

  let nombre = '', hasNA = false, hints = {}, soloImpar = false;
  if(key === 'custom'){
    const customName = document.getElementById('cf-tip-custom-name')?.value.trim();
    if(!customName){ showToast('Escribe el nombre de la tipología personalizada','error',2000); return; }
    nombre = customName; hasNA = false; hints = {}; soloImpar = false;
  } else {
    const cat = TIPOLOGIA_CATALOG[key];
    if(!cat){ showToast('Tipología no encontrada','error',2000); return; }
    nombre = cat.nombre?.replace(/\n/g,' ') || key;
    hasNA = cat.hasNA || false;
    hints = cat.hints || {};
    soloImpar = cat.soloImpar || false;
  }

  // Toggle: si ya está → quitarla
  if(cfDimsAgregadas.find(d=>d.key===key && key!=='custom')){
    cfDimsAgregadas = cfDimsAgregadas.filter(d=>d.key!==key);
    sel.value = '';
    renderDimsAgregadas();
    actualizarOpcionesSelectorTipologias();
    calcCfProm();
    showToast('Tipología quitada','info',1500);
    return;
  }

  const id = 'dim_' + Date.now();
  cfDimsAgregadas.push({ id, key, nombre, val:'', hasNA, hints, soloImpar });
  window.cfDimsAgregadas = cfDimsAgregadas;
  sel.value = '';
  // Ocultar banner 'Paso siguiente obligatorio' al agregar tipología
  var _bn=document.getElementById('cf-banner-tipologias'); if(_bn) _bn.style.display='none';
  const wrap2 = document.getElementById('cf-tip-custom-wrap');
  if(wrap2) wrap2.style.display = 'none';
  // Reset panel desc
  const panel = document.getElementById('cf-tip-desc-panel');
  if(panel){ panel.style.display='none'; descPanelAbierto=false; }
  renderDimsAgregadas();
  actualizarOpcionesSelectorTipologias();
  calcCfProm();
  showToast('Tipología agregada: '+nombre.split('\n')[0],'success',2000);
}

document.addEventListener('change', function(e){
  if(e.target && e.target.id === 'cf-tip-selector'){
    const wrap = document.getElementById('cf-tip-custom-wrap');
    if(wrap) wrap.style.display = e.target.value === 'custom' ? 'block' : 'none';
  }
});

function onSelectorTipologiaChange(){
  const key = document.getElementById('cf-tip-selector')?.value;
  const btnVer = document.getElementById('btn-ver-desc-tip');
  const panel  = document.getElementById('cf-tip-desc-panel');
  const wrap   = document.getElementById('cf-tip-custom-wrap');
  if(wrap) wrap.style.display = key === 'custom' ? 'block' : 'none';
  if(!key || key === 'custom'){
    if(panel) panel.style.display='none';
    if(btnVer){ btnVer.style.display='none'; }
    return;
  }
  // Auto-show description immediately when tipologia selected
  if(panel){
    if(typeof renderDescPanel==='function') renderDescPanel(key, false);
    panel.style.display='block';
  }
  if(btnVer){ btnVer.style.display='inline-flex'; btnVer.textContent='Ocultar descripcion'; }
}

let descEditMode = false;
let descPanelAbierto = false;

function toggleEditDescTip(){
  descEditMode = !descEditMode;
  const btn = document.getElementById('btn-edit-desc-tip');
  if(btn) btn.textContent = descEditMode ? 'Guardar cambios' : 'Editar descripciones';
  if(btn) btn.style.background = descEditMode ? '#16A34A' : '#0D9488';
  if(descEditMode && btn && btn.textContent === 'Guardar cambios'){
    // Si se presiona "Guardar cambios", guardar y salir de modo edición
    const key = document.getElementById('cf-tip-selector')?.value;
    if(key && TIPOLOGIA_CATALOG[key]){
      ['5','4','3','2','1','na4','na2'].forEach(val=>{
        const ta = document.getElementById('desc-edit-'+key+'-'+val);
        if(ta) TIPOLOGIA_CATALOG[key].hints[val] = ta.value.trim();
      });
      showToast('Descripciones guardadas', 'success', 2000);
      descEditMode = false;
      if(btn){ btn.textContent='Editar descripciones'; btn.style.background='#0D9488'; }
      // Re-render panel con los nuevos textos
      const k2 = document.getElementById('cf-tip-selector')?.value;
      if(k2) renderDescPanel(k2);
    }
    return;
  }
  const key2 = document.getElementById('cf-tip-selector')?.value;
  if(key2) renderDescPanel(key2);
}



function toggleDescTipologia(){
  const key   = document.getElementById('cf-tip-selector')?.value;
  const panel = document.getElementById('cf-tip-desc-panel');
  const btnVer= document.getElementById('btn-ver-desc-tip');
  if(!key || key==='custom' || !panel) return;
  if(panel.style.display!=='none'){ 
    panel.style.display='none'; 
    if(btnVer) btnVer.textContent='Ver descripción';
    return; 
  }
  renderDescPanel(key, false);
  panel.style.display='block';
  if(btnVer) btnVer.textContent='Ocultar descripción';
}

function renderDescPanel(key, editMode){
  const cat = TIPOLOGIA_CATALOG[key];
  const titulo = document.getElementById('cf-tip-desc-titulo');
  const wrap   = document.getElementById('cf-tip-desc-niveles');
  if(!cat||!wrap) return;
  if(titulo) titulo.textContent = (cat.nombre||key).replace(/\n/g,' ');
  const niveles=[
    {v:'5',l:'CRÍTICO',c:'#DC2626',bg:'#FEF2F2',bd:'#FECACA'},
    {v:'4',l:'ALTO',c:'#EA580C',bg:'#FFF7ED',bd:'#FED7AA'},
    {v:'3',l:'MEDIO',c:'#D97706',bg:'#FFFBEB',bd:'#FDE68A'},
    {v:'2',l:'BAJO',c:'#2563EB',bg:'#EFF6FF',bd:'#BFDBFE'},
    {v:'1',l:'MUY BAJO',c:'#16A34A',bg:'#F0FDF4',bd:'#BBF7D0'},
    {v:'na4',l:'N/A(4)',c:'#6B7280',bg:'#F9FAFB',bd:'#E5E7EB'},
    {v:'na2',l:'N/A(2)',c:'#6B7280',bg:'#F9FAFB',bd:'#E5E7EB'},
  ];
  wrap.innerHTML='';
  niveles.forEach(n=>{
    const hint=cat.hints?.[n.v]||'';
    if(!hint&&!editMode) return;
    const row=document.createElement('div');
    row.style.cssText=`display:flex;align-items:flex-start;gap:10px;padding:8px 14px;background:${n.bg};border-bottom:1px solid ${n.bd};`;
    row.innerHTML=`<div style="min-width:50px;text-align:center;padding-top:2px;">
      <div style="font-family:'Montserrat',sans-serif;font-size:15px;font-weight:800;color:${n.c};">${n.v.startsWith('na')?'N/A':n.v}</div>
      <div style="font-size:8px;font-weight:700;color:${n.c};">${n.l}</div></div>`+
      (editMode
        ?`<textarea id="dedit_${key}_${n.v}" rows="2" style="flex:1;font-size:11px;padding:4px;border:1px solid ${n.bd};border-radius:4px;resize:vertical;font-family:inherit;">${hint}</textarea>`
        :`<div style="font-size:12px;color:#374151;flex:1;line-height:1.5;">${hint?hint.replace(/^(N\/A|[1-5])\s*[\u2014\u2013-]\s*/,''):('<em style="color:#9CA3AF;">Sin descripción</em>')}</div>`);
    wrap.appendChild(row);
  });
  // Edit/save button
  const btnEdit=document.getElementById('btn-desc-edit');
  if(btnEdit){
    btnEdit.textContent=editMode?'Guardar cambios':'Editar descripciones';
    btnEdit.style.background=editMode?'#16A34A':'#0D9488';
    btnEdit.onclick=()=>{
      if(editMode){
        ['5','4','3','2','1','na4','na2'].forEach(v=>{
          const ta=document.getElementById(`dedit_${key}_${v}`);
          if(ta&&TIPOLOGIA_CATALOG[key]) TIPOLOGIA_CATALOG[key].hints[v]=ta.value.trim();
        });
        renderDescPanel(key,false);
      } else { renderDescPanel(key,true); }
    };
  }
}

function limpiarSelectorTipologia(){
  const sel = document.getElementById('cf-tip-selector');
  if(sel) sel.value = '';
  const panel  = document.getElementById('cf-tip-desc-panel');
  const btnVer = document.getElementById('btn-ver-desc-tip');
  const wrap   = document.getElementById('cf-tip-custom-wrap');
  if(panel)  { panel.style.display='none'; descPanelAbierto=false; }
  if(btnVer) { btnVer.style.display='none'; btnVer.textContent='Ver descripcion'; }
  if(wrap)   wrap.style.display='none';
}

function renderDimsAgregadas(){
  const wrap = document.getElementById('cf-dims-lista');
  if(!wrap) return;
  if(!cfDimsAgregadas.length){
    wrap.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:10px;text-align:center;background:var(--gray3);border-radius:var(--r);">Aún no has agregado tipologías. Usa el selector de arriba.</div>';
    calcCfProm(); return;
  }
  const colorVal = {'5':'var(--red)','4':'var(--orange)','3':'#856404','2':'var(--blue)','1':'var(--green)','na4':'var(--muted)','na2':'var(--muted)','':'var(--muted)'};
  wrap.innerHTML = cfDimsAgregadas.map((d, i) => {
    const cat2 = TIPOLOGIA_CATALOG[d.key];
    const opts = (cat2?.soloImpar)
      ? `<option value="">— Seleccionar —</option>
         <option value="5">5 — Crítico</option>
         <option value="3">3 — Medio</option>
         <option value="1">1 — Muy Bajo</option>`
      : `<option value="">— Seleccionar —</option>
         <option value="5">5 — Crítico</option>
         <option value="4">4 — Alto</option>
         <option value="3">3 — Medio</option>
         <option value="2">2 — Bajo</option>
         <option value="1">1 — Muy Bajo</option>`;
    const isNA = d.val && d.val.startsWith('na');
    const numVal = isNA ? 'N/A' : (d.val || '—');
    const badgeColor = colorVal[d.val] || 'var(--muted)';
    const cat = TIPOLOGIA_CATALOG[d.key];
    // Hint: busca en cat.hints primero (fuente de verdad), luego en d.hints
    const hintsSource = (cat && cat.hints) ? cat.hints : (d.hints || {});
    const hintNivel = (d.val && hintsSource[d.val]) ? hintsSource[d.val] : '';
    const hintMostrar = hintNivel || (d.val ? '' : 'Selecciona un nivel para ver la descripción');
    const tieneHints = cat && cat.hints && Object.values(cat.hints).some(h=>h && h.trim());

    // Bloque de descripción de niveles — visible para TODAS las tipologías con hints
    const NIVELES_DATA = [
      {val:'5',label:'CRÍTICO',color:'#DC2626',bg:'#FEF2F2',border:'#FECACA'},
      {val:'4',label:'ALTO',color:'#EA580C',bg:'#FFF7ED',border:'#FED7AA'},
      {val:'3',label:'MEDIO',color:'#D97706',bg:'#FFFBEB',border:'#FDE68A'},
      {val:'2',label:'BAJO',color:'#2563EB',bg:'#EFF6FF',border:'#BFDBFE'},
      {val:'1',label:'MUY BAJO',color:'#16A34A',bg:'#F0FDF4',border:'#BBF7D0'},
      {val:'na4',label:'N/A niv.4',color:'#6B7280',bg:'#F9FAFB',border:'#E5E7EB'},
      {val:'na2',label:'N/A niv.2',color:'#6B7280',bg:'#F9FAFB',border:'#E5E7EB'},
    ];
    const nivelesRows = NIVELES_DATA.filter(lv => cat && cat.hints && cat.hints[lv.val]).map(lv => `
      <div style="display:flex;align-items:stretch;border-bottom:1px solid ${lv.border};" id="desc-row-${d.id}-${lv.val}">
        <div style="min-width:64px;text-align:center;padding:8px 4px;background:${lv.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px solid ${lv.border};">
          <div style="font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;color:${lv.color};">${lv.val.startsWith('na')?'N/A':lv.val}</div>
          <div style="font-size:8px;font-weight:700;color:${lv.color};letter-spacing:.03em;">${lv.label}</div>
        </div>
        <div class="desc-text-${d.id}-${lv.val}" style="font-size:11.5px;color:#374151;padding:8px 12px;flex:1;line-height:1.5;background:${lv.bg};">${(cat && cat.hints && cat.hints[lv.val])||''}</div>
      </div>`).join('');
    const descBlock = `
      <div style="margin-top:8px;">
        <button onclick="toggleDimDesc('desc-panel-${d.id}')" id="btn-desc-${d.id}"
          style="font-size:11px;color:var(--blue);background:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;cursor:pointer;padding:3px 10px;font-weight:600;">
          📋 Ver descripción de niveles
        </button>
        
        <div id="desc-panel-${d.id}" style="display:none;margin-top:8px;border-radius:6px;overflow:hidden;border:1px solid var(--border2);box-shadow:0 2px 8px rgba(0,0,0,.07);">
          <div style="padding:7px 12px;background:var(--navy);display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:700;color:white;">${(window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key)).replace(/\n/g,' ')}</span>

          </div>
          <div id="desc-rows-${d.id}">${nivelesRows || '<div style=\'padding:10px;font-size:12px;color:var(--muted);font-style:italic;\'>Sin descripciones definidas.</div>'}</div>
        </div>
      </div>`;

    return `
    <div style="background:var(--gray3);border-radius:var(--r);padding:10px 14px;display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;" id="dim-row-${d.id}">
      <div style="flex:1;min-width:200px;">
        <div style="font-size:12px;font-weight:700;color:var(--navy);">${i+1}. ${window._nombreTipologia?window._nombreTipologia(d):(d.nombre||d.key)}</div>
        <div style="font-size:10.5px;color:var(--muted);margin-top:2px;" id="hint-${d.id}">${hintMostrar}</div>
        ${descBlock}
      </div>
      <select onchange="onDimDynChange('${d.id}', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12px;min-width:160px;">
        ${opts.replace(`value="${d.val}"`, `value="${d.val}" selected`)}
      </select>
      <div style="font-family:'Montserrat',sans-serif;font-size:${isNA?'12':'22'}px;font-weight:800;color:${badgeColor};min-width:32px;text-align:center;${isNA?'background:#f0f0f0;border-radius:5px;padding:2px 5px;':''}">${numVal}</div>
      <button onclick="quitarDim('${d.id}')" style="background:#fde8e8;border:1px solid #f5b7b1;color:var(--red);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;">Quitar</button>
    </div>`;
  }).join('');
}

function toggleHintsTipologia(id){
  const el = document.getElementById(id);
  if(!el) return;
  const btn = el.previousElementSibling;
  if(el.style.display === 'none'){
    el.style.display = 'block';
    if(btn) btn.textContent = 'Ocultar descripciones';
  } else {
    el.style.display = 'none';
    if(btn) btn.textContent = 'Ver descripciones de niveles';
  }
}

function onDimDynChange(id, val){
  const dim = cfDimsAgregadas.find(d=>d.id===id);
  if(!dim) return;
  dim.val = val;
  renderDimsAgregadas();
  calcCfProm();
  _clsAutoGuardarDims(); // si hay tercero seleccionado, el cambio se guarda YA
}

function quitarDim(id){
  cfDimsAgregadas = cfDimsAgregadas.filter(d=>d.id!==id);
  renderDimsAgregadas();
  actualizarOpcionesSelectorTipologias();
  calcCfProm();
  _clsAutoGuardarDims();
}

// ── Autoguardado de la calificación del Paso 2 ───────────────────
// Antes los cambios de nivel (ej. 2 → 5) solo quedaban en memoria hasta
// presionar "Guardar Valoración"; si no lo presionabas, se perdían y la
// Aprobación mostraba el valor viejo. Ahora, con un tercero seleccionado,
// cada cambio se guarda al instante en el tercero (dims, promedio y zona).
function _clsAutoGuardarDims(){
  try{
    var nit = ((document.getElementById('cls-tip-tercero-sel')||{}).value||'').trim();
    if(!nit) return; // sin tercero seleccionado se mantiene el flujo normal
    var db = window.TERCEROS_DB||{}; var t = db[nit]; if(!t) return;
    var dimsCopia = (cfDimsAgregadas||[]).map(function(d){ return { key:d.key, nombre:d.nombre, val:d.val, hints:d.hints }; });
    var vals = (cfDimsAgregadas||[]).map(function(d){return d.val;})
      .filter(function(v){ return v && !String(v).startsWith('na'); })
      .map(function(v){ return parseInt(v); });
    var prom = vals.length ? vals.reduce(function(a,b){return a+b;},0)/vals.length : 0;
    var zona = prom>=4?'EXTREMO':prom>=3?'ALTO':'BAJO';
    // Si el modo es POR CONTRATO, guardar contra el contrato específico
    if(t.modoEval==='contrato' && t.contratoEval){
      if(!t.dimsPorContrato) t.dimsPorContrato={};
      if(!t.promPorContrato) t.promPorContrato={};
      t.dimsPorContrato[t.contratoEval] = dimsCopia;
      if(vals.length){
        t.promPorContrato[t.contratoEval] = { prom: prom.toFixed(2), zona: zona };
      }
    } else {
      // Modo por tercero: guardar como antes
      if(!t.dimsPorContrato) t.dimsPorContrato={}; t.dimsPorContrato[t.contratoEval] = dimsCopia;
      if(vals.length){
        t.prom = prom.toFixed(2);
        t.zona = zona;
      }
    }
    try{ window._lsSave && window._lsSave(); }catch(e){}
    try{ showToast('💾 Calificación guardada','success',1400); }catch(e){}
  }catch(e){}
}

function calcCfProm(){
  const vals = cfDimsAgregadas.map(d=>d.val).filter(v=>v && !v.startsWith('na')).map(v=>parseInt(v));
  const total = cfDimsAgregadas.length;

  const promEl    = document.getElementById('cf-prom')   || document.getElementById('crit-prom');
  const freqEl    = document.getElementById('cf-freq')   || document.getElementById('crit-freq');
  const chipEl    = document.getElementById('cf-chip-wrap') || document.getElementById('crit-chip-wrap');
  const zonaEl    = document.getElementById('crit-zona-lbl');
  const cfZona    = document.getElementById('cf-zona');
  const cfPeriod  = document.getElementById('cf-period');
  const dimsEl    = document.getElementById('cf-dims-eval');
  const alertaAC  = document.getElementById('cf-alerta-ac') || document.getElementById('alerta-ac');

  const dimsConValor = cfDimsAgregadas.filter(d=>d.val && d.val!=='').length;
  if(dimsEl) dimsEl.textContent = dimsConValor + ' / ' + total;

  if(!vals.length){
    if(promEl){ promEl.textContent='—'; promEl.style.color='var(--muted)'; }
  var tipBadge2=document.getElementById('cls-tip-prom-badge');
  if(tipBadge2){ tipBadge2.textContent='—'; tipBadge2.style.color='white'; }
    if(freqEl){ freqEl.textContent='Completa las dimensiones'; freqEl.style.color='var(--muted)'; }
    if(chipEl) chipEl.innerHTML='';
    if(cfZona)   { cfZona.textContent='—'; cfZona.style.color='var(--muted)'; cfZona.style.fontWeight=''; }
    if(cfPeriod) { cfPeriod.textContent='—'; cfPeriod.style.color='var(--muted)'; cfPeriod.style.fontWeight=''; }
    if(alertaAC) alertaAC.style.display='none';
    try{ window._lsSave && window._lsSave(); }catch(e){}
    return;
  }

  const prom = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
  const p = parseFloat(prom);
  let evalTxt='', chip='', zona='', color='var(--navy)';
  if(p>=4){
    evalTxt='Se evalúa'; chip='<span class="chip c-crit">SE EVALÚA — '+prom+'</span>';
    zona='EXTREMO'; color='var(--red)';
  } else if(p>=3){
    evalTxt='Se evalúa'; chip='<span class="chip c-alto">SE EVALÚA — '+prom+'</span>';
    zona='ALTO'; color='var(--orange)';
  } else {
    evalTxt='No se evalúa'; chip='<span class="chip c-bajo">NO SE EVALÚA — '+prom+'</span>';
    zona='BAJO'; color='var(--green)';
  }

  if(promEl){ promEl.textContent=prom; promEl.style.color=color; }
  // Update the badge in the tipologias section header
  var tipBadge=document.getElementById('cls-tip-prom-badge');
  if(tipBadge){ tipBadge.textContent=prom; tipBadge.style.color=color==='var(--red)'?'#ff8a8a':color==='var(--orange)'?'#ffb347':color==='var(--green)'?'#7ee8a2':'white'; }
  if(freqEl){ freqEl.textContent=evalTxt; freqEl.style.color=color; }
  if(chipEl) chipEl.innerHTML=chip;
  if(zonaEl){ zonaEl.textContent='Zona: '+zona+' · Dims: '+vals.length+'/'+total; }
  if(cfZona)   { cfZona.textContent=zona; cfZona.style.color=color; cfZona.style.fontWeight='700'; }
  if(cfPeriod) { cfPeriod.textContent=evalTxt; cfPeriod.style.color=color; cfPeriod.style.fontWeight='700'; }
  if(alertaAC) alertaAC.style.display = p>=3 ? 'block' : 'none';
  
  // ── Auto-guardar después de recalcular ──
  try{ window._lsSave && window._lsSave(); }catch(e){}
}

function resetClasifForm(full=true){
  // ⭐ LIMPIAR TODOS LOS INPUTS DE TEXTO
  ['cf-nit','cf-nombre','cf-servicio','cf-nocontrato','cf-objetivo','cf-domicilio','cf-supervisor','cf-cargo','cf-proceso-supervision','cf-supervisor2','cf-procesos-soporta','cf-observaciones','cf-valor','cf-duracion','cf-tip-custom-name'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  // ⭐ LIMPIAR INPUTS HIDDEN Y FECHAS
  ['cf-finicio','cf-ffinal','cf-fterm'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  // ⭐ LIMPIAR SELECTS
  if(full){ const ent=document.getElementById('cf-entidad'); if(ent&&!ent.disabled) ent.value=''; }
  const cfTipSelector = document.getElementById('cf-tip-selector'); if(cfTipSelector) cfTipSelector.value='';
  // ⭐ LIMPIAR CONTRATOS COMPLETAMENTE
  if(full){ window._cfContratosBuffer = []; const cfContraDiv=document.getElementById('cf-contratos-adic'); if(cfContraDiv) cfContraDiv.innerHTML=''; try{ window._cfCtrRender(); }catch(e){} }
  // ⭐ LIMPIAR SUPERVISORES COMPLETAMENTE
  if(full){ 
    window._cfSupervisoresBuffer = []; 
    ['cf-sup-nombre','cf-sup-cargo','cf-sup-proceso'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; }); 
    const cfSupContrato=document.getElementById('cf-sup-contrato'); if(cfSupContrato) cfSupContrato.value=''; 
    const cfSupLista=document.getElementById('cf-supervisores-lista'); if(cfSupLista) cfSupLista.innerHTML='';
    try{ window._cfRenderSupervisoresTercero(); }catch(e){} 
  }
  // ⭐ LIMPIAR TIPOLOGÍAS
  cfDimsAgregadas = [];
  if(typeof cfExtraDims !== 'undefined') cfExtraDims = [];
  renderDimsAgregadas();
  // ⭐ LIMPIAR AIRE DE CONTROL
  if(typeof AC_RESPUESTAS !== 'undefined') Object.keys(AC_RESPUESTAS).forEach(k=>delete AC_RESPUESTAS[k]);
  // ⭐ LIMPIAR INDICADORES VISUALES
  ['cf-prom','cf-freq','cf-zona','cf-period'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.textContent='—';el.style.color='var(--muted)';el.style.fontWeight='';}
  });
  const chip=document.getElementById('cf-chip-wrap'); if(chip) chip.innerHTML='';
  const dims=document.getElementById('cf-dims-eval'); if(dims) dims.textContent='0 / 0';
  const alerta=document.getElementById('cf-alerta-ac'); if(alerta) alerta.style.display='none';
  const cfTipDescPanel=document.getElementById('cf-tip-desc-panel'); if(cfTipDescPanel) cfTipDescPanel.style.display='none';
  const cfTipCustomWrap=document.getElementById('cf-tip-custom-wrap'); if(cfTipCustomWrap) cfTipCustomWrap.style.display='none';
  const cfTipPersonalizadasLista=document.getElementById('cf-tip-personalizadas-lista'); if(cfTipPersonalizadasLista) cfTipPersonalizadasLista.innerHTML='';
  // ⭐ ACTUALIZAR ESTADO DEL FORMULARIO
  if(full){
    const s=document.getElementById('clasif-form-status'); if(s){s.textContent='Sin guardar';s.className='chip c-pend';}
  }
}

function addExtraDim(){
  const id = 'extra_' + Date.now();
  cfExtraDims.push({id, nombre:'', val:''});
  renderExtraDims();
}

function removeExtraDim(id){
  cfExtraDims = cfExtraDims.filter(d=>d.id!==id);
  renderExtraDims();
  calcCfProm();
}

function renderExtraDims(){
  const wrap = document.getElementById('cf-extra-dims');
  if(!wrap) return;
  wrap.innerHTML = cfExtraDims.map((d,i)=>`
    <div style="background:#f0f4ff;border:1px solid #c5d5f0;border-radius:var(--r);padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
      <div style="font-size:11px;font-weight:700;color:var(--navy);min-width:20px;">${i+7}.</div>
      <input type="text" placeholder="Nombre de la tipología (ej: Ambiental, Reputacional...)"
        value="${d.nombre}" oninput="cfExtraDims[${i}].nombre=this.value"
        style="flex:1;min-width:160px;padding:6px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12px;"/>
      <select onchange="cfExtraDims[${i}].val=this.value; calcCfProm();"
        style="padding:6px 10px;border:1px solid var(--border2);border-radius:var(--r);font-size:12px;min-width:130px;">
        <option value="">— Seleccionar —</option>
        <option value="5" ${d.val==='5'?'selected':''}>5 — Crítico</option>
        <option value="na4" ${d.val==='na4'?'selected':''}>N/A (nivel 4)</option>
        <option value="4" ${d.val==='4'?'selected':''}>4 — Alto</option>
        <option value="3" ${d.val==='3'?'selected':''}>3 — Medio</option>
        <option value="na2" ${d.val==='na2'?'selected':''}>N/A (nivel 2)</option>
        <option value="2" ${d.val==='2'?'selected':''}>2 — Bajo</option>
        <option value="1" ${d.val==='1'?'selected':''}>1 — Muy Bajo</option>
      </select>
      <div style="font-family:'Montserrat',sans-serif;font-size:${d.val&&!d.val.startsWith('na')?'20':'13'}px;font-weight:800;color:${CF_DIM_COLOR[d.val]||'var(--muted)'};min-width:30px;text-align:center;${d.val&&d.val.startsWith('na')?'background:#f0f0f0;border-radius:6px;padding:2px 6px;':''}">
        ${d.val ? (d.val.startsWith('na')?'N/A':d.val) : '—'}
      </div>
      <button class="btn btn-xs" onclick="removeExtraDim('${d.id}')"
        style="background:#fde8e8;border:1px solid #f5b7b1;color:var(--red);padding:4px 8px;">✕</button>
    </div>`).join('');
}
const CF_DIM_COLOR = {'5':'var(--red)','4':'var(--orange)','3':'#856404','2':'var(--blue)','1':'var(--green)','na4':'var(--muted)','na2':'var(--muted)','':'var(--muted)'};

function cfDimChange(dim){
  const sel   = document.getElementById('cf-sel-'+dim);
  const badge = document.getElementById('cf-badge-'+dim);
  const hint  = document.getElementById('cf-hint-'+dim);
  if(!sel) return;
  const val = sel.value;
  const isNA = val.startsWith('na');
  if(badge){
    badge.textContent = val ? (isNA ? 'N/A' : val) : '—';
    badge.style.color = CF_DIM_COLOR[val] || 'var(--muted)';
    badge.style.fontSize = isNA ? '13px' : '22px';
    badge.style.background = isNA ? '#f0f0f0' : 'transparent';
    badge.style.borderRadius = isNA ? '6px' : '0';
    badge.style.padding = isNA ? '2px 6px' : '0';
  }
  if(hint && DIM_HINTS[dim]) hint.textContent = DIM_HINTS[dim][val] || 'Selecciona un nivel';
  calcCfProm();
}

// ─── TABLA REGISTROS CLASIF ──────────────────────────
function filterClasifTable(){
  const search = (document.getElementById('clasif-search')?.value||'').toLowerCase();
  const zona   = document.getElementById('clasif-filter-zona')?.value||'';
  document.querySelectorAll('#tbody-clasif-registros tr').forEach(tr=>{
    const txt = tr.textContent.toLowerCase();
    const rowZona = tr.dataset.zona||'';
    let show = true;
    if(search && !txt.includes(search)) show=false;
    if(zona && !rowZona.includes(zona)) show=false;
    tr.style.display = show?'':'none';
  });
}

function editClasifRow(btn){
  const tr = btn.closest('tr');
  const cells = tr.querySelectorAll('td');
  const nit = cells[0].textContent.trim();
  const nombre = cells[1].textContent.trim();
  
  // Obtener datos desde TERCEROS_DB
  const t = (typeof TERCEROS_DB !== 'undefined' && TERCEROS_DB[nit]) ? TERCEROS_DB[nit] : {};
  if(!t.nit) {
    showToast(`❌ No se encontraron datos para "${nombre}"`, 'error', 2500);
    return;
  }
  
  // ── LIMPIAR FORMULARIO PRIMERO ──────────────────────
  const campos = [
    'cf-nit', 'cf-nombre', 'cf-entidad', 'cf-servicio', 'cf-nocontrato',
    'cf-domicilio', 'cf-supervisor', 'cf-cargo', 'cf-objetivo',
    'cf-proceso-supervision', 'cf-supervisor2', 'cf-procesos-soporta',
    'cf-observaciones', 'cf-finicio', 'cf-ffinal', 'cf-valor'
  ];
  campos.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  
  // Limpiar tipologías
  if(typeof window.cfDimsAgregadas !== 'undefined'){
    window.cfDimsAgregadas = [];
    if(typeof window._cfDimsRender === 'function'){
      window._cfDimsRender();
    }
  }
  
  // Limpiar contratos
  if(typeof window._cfContratosBuffer !== 'undefined'){
    window._cfContratosBuffer = [];
    if(typeof window._cfCtrRender === 'function'){
      window._cfCtrRender();
    }
  }
  
  // ── Llenar formulario con datos del tercero a editar ────────────
  const camposValores = {
    'cf-nit': t.nit || nit,
    'cf-nombre': t.nombre || nombre,
    'cf-entidad': t.entidad || 'colpensiones',
    'cf-servicio': t.servicio || '',
    'cf-nocontrato': t.nocontrato || '',
    'cf-domicilio': t.domicilio || '',
    'cf-supervisor': t.supervisor || '',
    'cf-cargo': t.cargo || '',
    'cf-objetivo': t.objetivo || '',
    'cf-proceso-supervision': t.procesoSupervision || '',
    'cf-supervisor2': t.supervisor2 || '',
    'cf-procesos-soporta': t.procesosSoporta || '',
    'cf-observaciones': t.observaciones || '',
    'cf-finicio': t.finicio || '',
    'cf-ffinal': t.fterm || '',
    'cf-valor': t.valor || ''
  };
  
  // Aplicar valores a los campos
  Object.keys(camposValores).forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = camposValores[id];
  });
  
  // ── Cargar contratos adicionales ──────────────────────────
  if(typeof window._cfCtrCargarDe === 'function'){
    window._cfCtrCargarDe(nit);
  }

  // Restaurar también la relación completa de supervisores. Antes esta lista
  // quedaba vacía al editar y al volver a guardar se mostraban rayas.
  window._cfSupervisoresBuffer = Array.isArray(t.supervisores)
    ? t.supervisores.map(function(s){return Object.assign({},s);}) : [];
  try{ window._cfRenderSupervisoresTercero && window._cfRenderSupervisoresTercero(); }catch(e){}
  
  // ── Cargar tipologías (dims) ──────────────────────────────
  if(t.dims && Array.isArray(t.dims) && typeof window.cfDimsAgregadas !== 'undefined'){
    window.cfDimsAgregadas = t.dims.map(d => ({
      key: d.key,
      nombre: d.nombre || d.key,
      val: d.val || 'na'
    }));
    if(typeof window._cfDimsRender === 'function'){
      window._cfDimsRender();
    }
  }
  
  // ── Cambiar el título y el botón para indicar que es edición ───
  const statusEl = document.getElementById('clasif-form-status');
  if(statusEl){
    statusEl.textContent = `📝 Editando: ${nombre}`;
    statusEl.className = 'chip c-alto';
  }
  
  // ── Cambiar texto del botón de guardar ──────────────────────
  const guardarBtn = document.querySelector('button[onclick="guardarClasif()"]');
  if(guardarBtn){
    guardarBtn.textContent = '✏️ Actualizar Registro';
    guardarBtn.dataset.nitEditando = nit; // Marcar que estamos editando
  }
  
  // ── Scroll al formulario ──────────────────────────────────────
  const formCard = document.querySelector('.card:has(#cf-nit)');
  if(formCard){
    formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  // ── Cambiar pestaña a "Nuevo Registro" ────────────────────────
  try{
    var tab = document.getElementById('cls-tab-form');
    if(tab) tab.click();
  }catch(e){}
  
  showToast(`📝 Editando: ${nombre} (${nit})`, 'info', 2500);
}

function deleteClasifRow(btn){
  const tr = btn.closest('tr');
  const nombre = tr.querySelector('td:nth-child(2)')?.textContent.trim()||'';
  if(confirm(`¿Eliminar el registro de "${nombre}" de Matriz_Riesgos_Resultados?`)){
    tr.remove();
    showToast(`🗑 Registro de "${nombre}" eliminado`,'info',2500);
  }
}

// ─── GUARDAR → AÑADE FILA A TABLA REGISTROS ──────────
// ─── API BASE URL ─────────────────────────────────────
// 🔗 API_BASE detecta automaticamente localhost vs producción
const API_BASE = (function() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const baseUrl = `http://${hostname}:${port || 3000}`;
    console.log(`🔗 [SGRT] API LOCAL: ${baseUrl}`);
    return baseUrl;
  }
  
  const prodUrl = 'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net';
  console.log(`🔗 [SGRT] API PRODUCCIÓN: ${prodUrl}`);
  return prodUrl;
})();

console.log(`[SGRT] API_BASE = ${API_BASE}`);

// ⭐ [CORREGIDO] Se eliminó la limpieza automática de localStorage al cargar la página.
// Antes, este bloque borraba TODOS los datos (terceros, aprobaciones, cuestionarios)
// cada vez que se abría o recargaba la app, por eso los terceros aprobados
// desaparecían y el selector de "Ambiente de Control" quedaba vacío.
// Si en algún momento necesitas limpiar todo manualmente, usa desde la consola:
// window.limpiarTodosTerceros() o window.limpiarCompletamente()

// ⭐ SYNC GLOBAL: Cargar terceros desde Azure SQL al iniciar
(function syncTercerosFromAPI(){
  // La sincronización central (módulo 12) mezcla los campos maestros recibidos
  // de SQL con la información local de contratos, supervisores y fases. La
  // implementación antigua reconstruía el objeto y borraba esos datos.
  function pullSeguro(){
    if(window.SGRT_BLOCK_REMOTE_PULL)return Promise.resolve(false);
    if(typeof window._lsPullFromAzure!=='function')return Promise.resolve(false);
    return Promise.resolve(window._lsPullFromAzure({silent:true})).catch(function(e){
      console.warn('⚠️ Sync: no fue posible actualizar desde Azure SQL; se conserva el registro completo local',e&&e.message||e);
      return false;
    });
  }
  setTimeout(pullSeguro,1200);
  // Re-sincronizar cada 60 segundos
  setInterval(pullSeguro,60000);
})();

// ⭐ Limpiar TODOS los registros de terceros (devTools / consola)
window.limpiarTodosTerceros = function(){
  if(!confirm('⚠️ ¿BORRAR TODOS LOS REGISTROS?\n\nEsta acción NO se puede deshacer.')){
    return;
  }
  
  try {
    // 1. Borrar las keys específicas que guardan los datos
    localStorage.removeItem('sgrt_terceros_db_shared');
    localStorage.removeItem('sgrt_v8');
    localStorage.removeItem('sgrt_state');
    
    // 2. Limpiar TODAS las demás keys de localStorage
    var allKeys = Object.keys(localStorage);
    allKeys.forEach(function(key) {
      localStorage.removeItem(key);
    });
    
    // 3. Limpiar sessionStorage
    sessionStorage.clear();
    
    // 4. Resetear TODAS las variables globales
    window.TERCEROS_DB = {};
    window.CLS_DB = {};
    window.CUEST_RESPUESTAS = {};
    window.MATRIZ_DB = [];
    window.RESULTADO_EVALUACION = {};
    window.TIPOLOGIAS_DB_CUSTOM = {};
    window.EVID_CUEST = {};
    window._cfContratosBuffer = [];
    
    // 5. Feedback
    showToast('🧹 Borrando todos los datos...','success',1500);
    console.log('🧹 LIMPIEZA TOTAL: sgrt_terceros_db + sgrt_v8 + todas las variables');
    
    // 6. RELOAD página
    setTimeout(function(){
      location.reload(true);
    }, 1000);
    
  } catch(e) {
    console.error('Error en limpiarTodosTerceros:', e);
    showToast('⚠️ Error en limpieza','error',2000);
  }
};

// ⭐ NUEVA FUNCIÓN: Limpieza Total para Testing (usa en consola: limpiarParaTests())
window.limpiarParaTests = function(){
  try {
    // 1. Limpiar TODAS las keys de localStorage que sean de SGRT
    Object.keys(localStorage).forEach(function(key) {
      if(key.includes('sgrt') || key.includes('tercero') || key.includes('cuest_') || 
         key.includes('v8') || key.includes('session') || key.includes('clasificacion') ||
         key.includes('contrato')) {
        localStorage.removeItem(key);
      }
    });
    
    // 2. Resetear TERCEROS_DB en memoria
    window.TERCEROS_DB = {};
    
    // 3. Limpiar el UI
    if(typeof refreshTercerosTable === 'function') refreshTercerosTable();
    if(typeof window._poblarSelectorTerceroClasificar === 'function') window._poblarSelectorTerceroClasificar();
    
    // 4. Feedback
    showToast('✅ Base de datos COMPLETAMENTE limpia para testing','success',2500);
    console.log('✅ LIMPIEZA TOTAL PARA TESTS: localStorage, TERCEROS_DB y UI vaciados');
  } catch(e) {
    console.error('Error en limpiarParaTests:', e);
    showToast('⚠️ Error en limpieza','error',2000);
  }
};

// ⭐ Refrescar tabla HTML de terceros desde TERCEROS_DB (se llama después de cargar desde API)
function refreshTercerosTable(){
  const tbody = document.getElementById('tbody-terceros');
  if(!tbody) return;
  
  tbody.innerHTML = '';
  
  // Inicializar TERCEROS_DB si no existe
  if(typeof TERCEROS_DB !== 'object') TERCEROS_DB = {};
  
  const nits = Object.keys(TERCEROS_DB).filter(nit => TERCEROS_DB[nit] && TERCEROS_DB[nit].nit);
  
  if(nits.length === 0){
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--muted);">📋 Sin registros. Crea uno con el botón "Nuevo Registro".</td></tr>';
    console.log('✅ Tabla vacía (limpia)');
    return;
  }
  
  nits.forEach(nit=>{
    const t = TERCEROS_DB[nit];
    if(!t) return;
    const tr = document.createElement('tr');
    tr.setAttribute('data-entidad', (t.entidadLabel||'').replace(/^.+ /, ''));
    tr.setAttribute('data-crit', t.prom || '0');
    const entidadLabel = t.entidadLabel || t.entidad || '—';
    const chipClass = t.zona === 'EXTREMO' ? 'c-crit' : t.zona === 'ALTO' ? 'c-alto' : 'c-bajo';
    const isEvalRole = (window.currentUser||{}).rol === 'Cliente';
    const actions = isEvalRole
      ? `<button class="btn btn-outline btn-xs" onclick="verDetalleTercero('${nit}')">👁 Ver detalle</button>`
      : `<button class="btn btn-outline btn-xs" onclick="verDetalleTercero('${nit}')">Ver</button>
         ${(t.prom||0) >= 3 ? `<button class="btn btn-primary btn-xs" onclick="irAEvaluacion('${t.entidad||''}','new_${Date.now()}')">▶ Eval.</button>` : ''}`;
    tr.innerHTML = `
      <td style="font-size:12px;">${nit}</td>
      <td><b>${t.nombre}</b><br><span style="font-size:10px;color:var(--muted);">${t.nocontrato||'—'}</span></td>
      <td><span class="chip" style="font-size:10.5px;">${entidadLabel}</span></td>
      <td style="font-size:12px;">${t.servicio||'—'}</td>
      <td style="font-size:12px;">${t.supervisor||'—'}</td>
      <td><span class="chip ${chipClass}">${t.prom||'—'}</span></td>
      <td style="font-size:12px;">${t.periodicidad||'Sin evaluación'}</td>
      <td><span class="chip c-ok">${t.estado||'Activo'}</span></td>
      <td>${actions}</td>`;
    tbody.appendChild(tr);
  });
}

// ─── CALCULAR DURACIÓN AUTOMÁTICA ────────────────────
function calcDuracionContrato(){
  const fi = document.getElementById('cf-finicio')?.value;
  const ff = document.getElementById('cf-ffinal')?.value;
  const durEl = document.getElementById('cf-duracion');
  if(!fi || !ff || !durEl) return;
  const inicio = new Date(fi);
  const fin    = new Date(ff);
  if(fin <= inicio){ durEl.value=''; return; }
  // Calcular años exactos con decimales (redondeado a 1 decimal)
  const diffMs   = fin - inicio;
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  const diffAnios = diffDias / 365.25;
  const redondeado = Math.round(diffAnios * 10) / 10;
  durEl.value = redondeado;
  // Mostrar hint legible
  const anios = Math.floor(diffAnios);
  const meses = Math.round((diffAnios - anios) * 12);
  let hint = '';
  if(anios > 0 && meses > 0) hint = anios + ' año' + (anios>1?'s':'') + ' y ' + meses + ' mes' + (meses>1?'es':'');
  else if(anios > 0)          hint = anios + ' año' + (anios>1?'s':'');
  else if(meses > 0)          hint = meses + ' mes' + (meses>1?'es':'');
  else                        hint = Math.round(diffDias) + ' días';
  let hintEl = document.getElementById('cf-duracion-hint');
  if(!hintEl){
    hintEl = document.createElement('div');
    hintEl.id = 'cf-duracion-hint';
    hintEl.style.cssText = 'font-size:10.5px;color:var(--muted);margin-top:3px;';
    durEl.parentNode.appendChild(hintEl);
  }
  hintEl.textContent = hint ? ('Duración calculada: ' + hint) : '';
}

// ─── CARGAR TERCEROS DESDE API → tabla pg-terceros ────────────
async function cargarTercerosDesdeAPI(){
  const tbody = document.getElementById('tbody-terceros');
  if(!tbody) return;

  // Mostrar spinner
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted);font-style:italic;">🔄 Cargando desde la base de datos...</td></tr>';

  let rows = [];
  try {
    const resp = await fetch((typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000')+'/api/terceros');
    if(resp.ok){
      const data = await resp.json();
      if(data.ok && data.data?.length) rows = data.data;
    }
  } catch(e){ console.warn('API no disponible para /api/terceros'); }

  // Siempre mezclar con los que ya están en TERCEROS_DB (guardados en sesión)
  const dbRows = Object.values(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{});

  // Unir: API primero, luego los de sesión que no estén en API
  const nitsApi = new Set(rows.map(r=>String(r.NIT||'')));
  dbRows.forEach(t=>{ if(t.nit && !nitsApi.has(String(t.nit))) rows.push({
    ID_RelacionTerceros:'—', NIT:t.nit, NombreTercero:t.nombre,
    ServicioContratado:t.servicio, _supervisor:t.supervisor,
    PromedioCriticidad:t.prom, Zona_Riesgo:t.zona,
    Periodicidad:t.periodicidad, Activo:1, _entidad:t.entidad
  }); });

  if(!rows.length){
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:var(--muted);">Sin registros. Guarda un tercero en Clasificacion de Terceros.</td></tr>';
    return;
  }

  const ELABELS={colpensiones:'🏛 Colpensiones',ecopetrol:'🛢 Ecopetrol',bancolombia:'🏦 Bancolombia',cliente1:'🏛 Colpensiones'};
  const EBGS={
    colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',
    ecopetrol:'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',
    bancolombia:'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;',
    cliente1:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;'
  };

  tbody.innerHTML = rows.map(r=>{
    const nit      = r.NIT||'—';
    const nombre   = r.NombreTercero||r.nombre||'—';
    const servicio = r.ServicioContratado||r.servicio||'—';
    const super_   = r._supervisor||r.SupervisorNombre||'—';
    const prom     = parseFloat(r.PromedioCriticidad||r.prom||0);
    const zona     = r.Zona_Riesgo||r.zona||'—';
    const per      = r.Periodicidad||r.periodicidad||(prom>=3?'Se evalúa':'No se evalúa');
    const activo   = r.Activo!==0 && r.Activo!==false;
    // NombreEntidad viene del JOIN con RELACION_GENERAL en el server corregido
    const entSrc   = r.NombreEntidad || r._entidad || '';
    const entRaw   = entSrc.toLowerCase().replace(/\s+/g,'') ||
                     (r.RelacionGeneral ? 'colpensiones' : '');
    const eLabel   = ELABELS[entRaw]||entRaw||'—';
    const eBg      = EBGS[entRaw]||'';
    const chipC    = prom>=4?'c-crit':prom>=3?'c-alto':prom>0?'c-med':'c-bajo';
    const chipP    = prom>=3?'c-alto':'c-bajo';
    const promDisp = prom>0?prom.toFixed(2):'—';

    // Actualizar TERCEROS_DB para que cuestionario pueda ver este tercero
    if(typeof TERCEROS_DB!=='undefined' && !TERCEROS_DB[nit]){
      var savedDB={}; try{savedDB=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');}catch(e){}
      var savedT=savedDB[nit]||{};
      TERCEROS_DB[nit]={nit,nombre,entidad:entRaw,entidadLabel:eLabel,
        servicio,supervisor:super_,prom,zona,periodicidad:per,estado:activo?'Activo':'Inactivo',dims:savedT.dims||[]};
      if(prom>=3) registrarTerceroPendiente(nit,nombre,entRaw,prom,zona,per,[]);
    }

    // Contratos del tercero (de TERCEROS_DB si ya está registrado)
    var _tExist = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[nit]) ? TERCEROS_DB[nit] : null;
    var _contratos = (_tExist && _tExist.contratos) || [];
    var _contratosHtml = _contratos.length
      ? '<div style="font-size:11px;color:#1e40af;font-weight:700;">'+_contratos.length+' contrato'+(_contratos.length>1?'s':'')+'</div>'
        +'<div style="font-size:10px;color:#475569;line-height:1.4;">'+_contratos.map(function(c){return (c.num||'s/n');}).join(', ')+'</div>'
      : '<span style="font-size:11px;color:#94a3b8;font-style:italic;">—</span>';
    // Tipologías del tercero (dims)
    var _dims = (_tExist && _tExist.dims) || [];
    var _tipsHtml = _dims.length
      ? '<div style="display:flex;flex-direction:column;gap:2px;">'
        + _dims.map(function(d){
            var n = window._nombreTipologia ? window._nombreTipologia(d) : (d.nombre||d.tipologia||d.key);
            var rawScore=d.val!=null?d.val:(d.calificacion!=null?d.calificacion:d.nivel);
            var score=parseFloat(rawScore);
            var scoreClass=score>=4?'c-crit':score>=3?'c-alto':'c-bajo';
            return '<span style="font-size:10.5px;color:#0f172a;"><b>'+n+':</b> <span class="chip '+scoreClass+'" style="font-size:10px;">'+(isNaN(score)?'—':score)+'</span></span>';
          }).join('')
        + '</div>'
      : '<span style="font-size:11px;color:#94a3b8;">—</span>';

    const evalActions = (window.currentUser||{}).rol === 'Cliente'
      ? `<button class="btn btn-outline btn-xs" onclick="verDetalleTercero('${nit}')" style="font-weight:700;">👁 Ver detalle</button>`
      : `<button class="btn btn-outline btn-xs" onclick="verDetalleTercero('${nit}')" style="margin-right:3px;">👁 Ver</button>
         <button class="btn btn-xs" onclick="quitarTercero('${nit}')" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;">🗑 Borrar</button>`;
    return `<tr data-entidad="${entRaw}" data-crit="${prom}">
      <td style="font-size:11.5px;">${nit}</td>
      <td><b>${nombre}</b></td>
      <td>${eLabel?`<span class="chip" style="font-size:10.5px;${eBg}">${eLabel}</span>`:'—'}</td>
      <td>${_contratosHtml}</td>
      <td>${_tipsHtml}</td>
      <td><span class="chip ${chipC}" style="font-weight:800;">${promDisp}</span></td>
      <td><span class="chip ${prom>=4?'c-crit':prom>=3?'c-alto':'c-bajo'}" style="font-size:10px;">${zona}</span></td>
      <td style="white-space:nowrap;">${evalActions}</td>
    </tr>`;
  }).join('');

  sincronizarSelectorCuestionario();
  const cnt = document.getElementById('kpi-terceros');
  if(cnt) cnt.textContent = rows.length;
}

// ─── CARGAR TERCEROS PENDIENTES DESDE LA API ─────────
async function cargarTercerosPendientesDesdeAPI(){
  // Cargar terceros guardados en localStorage (persistencia cross-rol)
  try{
    var saved=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    Object.values(saved).forEach(function(t){
      if(t&&t.nit){
        if(typeof TERCEROS_DB!=='undefined' && !TERCEROS_DB[t.nit]) TERCEROS_DB[t.nit]=t;
        var p=parseFloat(t.prom||0);
        if(!tercerosPendientesCuestionario.find(function(x){return x.nit===t.nit;})){
          tercerosPendientesCuestionario.push({nit:t.nit,nombre:t.nombre,entidad:t.entidad,prom:p,zona:t.zona,periodicidad:t.periodicidad,tipologias:(t.dims||[]).map(function(d){return {key:d.key,nombre:d.nombre};})});
        }
      }
    });
    sincronizarSelectorCuestionario();
  }catch(e){}
  // Silently attempt API fetch; on failure, keep existing TERCEROS_DB data
  fetch((typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000') + '/api/resumen')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(data=>{
      if(!data.ok || !data.data?.length) return;
      data.data.forEach(row=>{
        const prom = parseFloat(row.Puntaje_Promedio||row.PromedioCriticidad||0);
        const nit  = row.NIT||'';
        if(!nit) return;
        // Only add if not already in TERCEROS_DB (don't override existing data)
        if(!TERCEROS_DB[nit]){
          const nombre = row.NombreTercero||row.Nombre_Tercero||nit;
          const entidad= (row.NombreEntidad||row.Entidad||'').toLowerCase().replace(/\s+/g,'');
          const zona   = row.Zona_Riesgo||(prom>=4?'EXTREMO':'ALTO');
          const period = row.Periodicidad||(prom>=4?'Anual':'Bienal');
          TERCEROS_DB[nit]={ nit, nombre, entidad, prom, zona, periodicidad:period,
            entidadLabel: entidad, servicio:'', supervisor:'',
            nocontrato:'', domicilio:'', cargo:'', objetivo:'',
            finicio:'', fterm:'', valor:'', estado:'Activo', dims:[] };
        }
      });
      sincronizarSelectorCuestionario();
    })
    .catch(()=>{ /* API not available — use local TERCEROS_DB */ });
}

// ─── GUARDAR → API + BD ──────────────────────────────
async function saveClasifForm(){
  // ── Detectar si estamos en modo edición ──────────────
  const guardarBtn = document.querySelector('button[onclick="guardarClasif()"]');
  const nitEditando = guardarBtn?.dataset?.nitEditando;
  const esEdicion = !!nitEditando;
  
  const nit        = (document.getElementById('cf-nit')?.value||'').trim();
  const nombre     = (document.getElementById('cf-nombre')?.value||'').trim();
  const entidad    = document.getElementById('cf-entidad')?.value || (currentUser?.entidad||'');
  const servicio   = (document.getElementById('cf-servicio')?.value||'').trim();
  const supervisor = (document.getElementById('cf-supervisor')?.value||'').trim();
  const nocontrato = (document.getElementById('cf-nocontrato')?.value||'—');
  const domicilio  = (document.getElementById('cf-domicilio')?.value||'').trim();
  const cargo      = (document.getElementById('cf-cargo')?.value||'').trim();
  const objetivo   = (document.getElementById('cf-objetivo')?.value||'').trim();
  const procesoSupervision = (document.getElementById('cf-proceso-supervision')?.value||'').trim();
  const supervisor2 = (document.getElementById('cf-supervisor2')?.value||'').trim();
  const procesosSoporta = (document.getElementById('cf-procesos-soporta')?.value||'').trim();
  const observaciones = (document.getElementById('cf-observaciones')?.value||'').trim();
  const finicio    = (document.getElementById('cf-finicio')?.value||'');
  const ffinal     = (document.getElementById('cf-ffinal')?.value||'');
  const fterm      = (document.getElementById('cf-fterm')?.value||'');
  const valorEl    = document.getElementById('cf-valor');
  const valor      = valorEl?.dataset?.raw || (valorEl?.value||'').replace(/[^0-9]/g,'');

  if(!nit)     { showToast('El NIT es obligatorio','error',2500); return; }
  if(!nombre)  { showToast('El nombre del tercero es obligatorio','error',2500); return; }
  if(!entidad) { showToast('Selecciona la Organización / Cliente','error',2500); return; }
  // Servicio es opcional para permitir múltiples contratos

  // ── Calcular promedio ──────────────────────────────
  const dimValsNum = cfDimsAgregadas
    .map(d => d.val).filter(v => v && !v.startsWith('na')).map(v => parseInt(v));
  const prom    = dimValsNum.length ? dimValsNum.reduce((a,b)=>a+b,0)/dimValsNum.length : 0;
  const promStr = dimValsNum.length ? prom.toFixed(2) : '—';

  let periodicidad='Sin evaluación', zona='BAJO';
  if(prom>=4){ periodicidad='Se evalúa';  zona='EXTREMO'; }
  else if(prom>=3){ periodicidad='Se evalúa'; zona='ALTO'; }

  const ELABELS = {colpensiones:'🏛 Colpensiones', ecopetrol:'🛢 Ecopetrol', bancolombia:'🏦 Bancolombia'};
  const EBGS    = {
    colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',
    ecopetrol:   'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',
    bancolombia: 'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'
  };
  const eLabel = ELABELS[entidad] || entidad;
  const eBg    = EBGS[entidad] || '';
  const fecha  = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});

  // ── Capturar dims ANTES de resetear ───────────────
  const dimsSnapshot = cfDimsAgregadas.map(d=>({
    key: d.key,
    nombre: (TIPOLOGIA_CATALOG[d.key]?.nombre || d.nombre || d.key).replace(/\n/g,' '),
    val: d.val
  }));
  
  // ✅ AGREGAR TIPOLOGÍA DE RIESGO POR DEFECTO si está vacío
  if(dimsSnapshot.length === 0){
    dimsSnapshot.push({
      key: 'operacional',
      nombre: 'Riesgo Operacional',
      val: 2
    });
  }

  // ── Guardar en TERCEROS_DB ─────────────────────────
  // ✅ INCLUIR CONTRATOS CON SUPERVISORES DESDE EL BUFFER
  var supervisoresDelBuffer = (window._cfSupervisoresBuffer || []).map(function(s){
    return {
      nombre:(s.nombre||'').trim(),
      cargo:(s.cargo||'').trim(),
      proceso:(s.proceso||'').trim(),
      contrato_asociado:(s.contrato_asociado||'').trim()
    };
  }).filter(function(s){return !!s.nombre;});

  // Compatibilidad con el campo de supervisor principal del formulario.
  if(!supervisoresDelBuffer.length && supervisor){
    supervisoresDelBuffer.push({
      nombre:supervisor,
      cargo:cargo,
      proceso:procesoSupervision,
      contrato_asociado:nocontrato && nocontrato!=='—' ? nocontrato : ''
    });
  }

  var contratosDelBuffer = (window._cfContratosBuffer || [])
    .filter(function(c){return c && c.num && c.num.trim();})
    .map(function(c){
      var copia=Object.assign({},c);
      var asociados=supervisoresDelBuffer.filter(function(s){return s.contrato_asociado===copia.num;});
      copia.supervisor_asociado=copia.supervisor_asociado||copia.supervisor||(asociados[0]&&asociados[0].nombre)||supervisor||'';
      copia.supervisores_asociados=asociados;
      return copia;
    });

  // Soporte para registros creados con el contrato principal histórico.
  if(!contratosDelBuffer.length && nocontrato && nocontrato!=='—'){
    contratosDelBuffer.push({
      num:nocontrato,objeto:objetivo,fini:finicio,ffin:ffinal,
      estado:fterm||'En Ejecucion',valor:valor,procesos:procesosSoporta,
      observaciones:observaciones,supervisor_asociado:supervisor||'',
      supervisores_asociados:supervisoresDelBuffer.filter(function(s){return !s.contrato_asociado||s.contrato_asociado===nocontrato;})
    });
  }
  
  TERCEROS_DB[nit] = {
    nit, nombre, entidad, entidadLabel: eLabel,
    servicio, supervisor, nocontrato, domicilio,
    cargo, objetivo, finicio, fterm, valor,
    procesoSupervision, supervisor2, procesosSoporta, observaciones,
    prom: parseFloat(prom.toFixed(2)), zona, periodicidad,
    estado: 'Activo',
    dims: dimsSnapshot,
    supervisores: supervisoresDelBuffer,
    // ✅ GUARDAR CONTRATOS CON TODOS SUS SUPERVISORES (1, Alt, 2, 3, etc.)
    contratos: contratosDelBuffer.length > 0 ? contratosDelBuffer : TERCEROS_DB[nit]?.contratos || [],
    savedAt: new Date().toISOString(),
    sincronizado: false,
    _changed: true,
    localOnly: true
  };

  // Guardar el registro maestro antes de limpiar el formulario. De esta forma
  // la tabla, los otros roles y el sincronizador siempre leen el mismo alta.
  try{
    var sharedNow=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    sharedNow[nit]=TERCEROS_DB[nit];
    localStorage.setItem('sgrt_terceros_db_shared',JSON.stringify(sharedNow));
    if(window._lsSave)window._lsSave();
  }catch(ePersist){console.error('No se pudo persistir inmediatamente el tercero:',ePersist);}
  
  console.log('✅ Tercero guardado con ' + contratosDelBuffer.length + ' contratos y supervisores');

  // ── Actualizar Gestión de Terceros ────────────────
  agregarTerceroEnTabla(nit, nombre, entidad, eBg, servicio, supervisor,
    prom, periodicidad, fecha, { dims: dimsSnapshot, nocontrato, domicilio, cargo, objetivo, finicio, ffinal, fterm, valor });

  // ── Registrar en cuestionario si prom >= 3 ────────
  if(prom >= 3){
    registrarTerceroPendiente(nit, nombre, entidad, prom, zona, periodicidad,
      dimsSnapshot.map(d=>({key:d.key, nombre:d.nombre})));
  }
  sincronizarSelectorCuestionario();

  // ── Fila en tabla Registros (página Clasificación) ─
  const chipClass  = prom>=4?'c-crit':prom>=3?'c-alto':'c-bajo';
  const zonaColor  = prom>=4?'var(--red)':prom>=3?'var(--orange)':'var(--green)';
  const tbody2 = document.getElementById('tbody-clasif-registros');
  if(tbody2){
    // Remove if already exists
    tbody2.querySelectorAll('tr').forEach(tr=>{
      if(tr.querySelector('td:first-child')?.textContent.trim()===nit) tr.remove();
    });
    const dimCells = dimsSnapshot.map(d=>{
      const v = d.val||''; const isNA = v.startsWith('na');
      const col = isNA?'var(--muted)':parseFloat(v)>=4?'var(--red)':parseFloat(v)>=3?'var(--orange)':parseFloat(v)>=2?'var(--blue)':'var(--green)';
      return `<td style="text-align:center;font-weight:700;color:${col};font-style:${isNA?'italic':'normal'};">${isNA?'N/A':(v||'—')}</td>`;
    }).join('');
    const newRow2 = document.createElement('tr');
    newRow2.setAttribute('data-zona', zona.split('/')[0]);
    newRow2.innerHTML =
      `<td style="font-size:11px;">${nit}</td>`+
      `<td><b>${nombre}</b><br><span style="font-size:10px;color:var(--muted);">${nocontrato}</span></td>`+
      `<td><span class="chip" style="font-size:10px;${eBg}">${eLabel}</span></td>`+
      dimCells+
      `<td style="text-align:center;"><span class="chip ${chipClass}">${promStr}</span></td>`+
      `<td style="font-size:11px;font-weight:700;color:${zonaColor};">${zona}</td>`+
      `<td style="font-size:11px;">${periodicidad}</td>`+
      `<td style="font-size:11px;color:var(--muted);">${fecha}</td>`+
      `<td><button class="btn btn-outline btn-xs" onclick="editClasifRow(this)">Editar</button> `+
      `<button class="btn btn-xs" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;" onclick="deleteClasifRow(this)">Quitar</button></td>`;
    tbody2.appendChild(newRow2);
  }

  // ── Log de auditoría ──────────────────────────────
  addLog(nombre,'Relacion_Terceros','NIT→'+nit,'—','Prom:'+promStr+' | '+zona+' | '+periodicidad,fecha,'Clasificación');

  // ── Crear carpetas en Repositorio por tipología ───────────────
  try{
    setTimeout(function(){
      var _od=window._OD||'od_sgrt_v8';
      var fs=null;
      try{fs=JSON.parse(localStorage.getItem(_od)||'null');}catch(e){}
      if(!fs)fs={id:'root',type:'folder',children:[
        {id:'f_ac',name:'Ambiente de Control',type:'folder',children:[]},
        {id:'f_mat',name:'Matrices de Riesgo',type:'folder',children:[]},
        {id:'f_cont',name:'Contratos y Soportes',type:'folder',children:[]},
        {id:'f_ev',name:'Evidencias de Controles',type:'folder',children:[]},
        {id:'f_inf',name:'Informes y Reportes',type:'folder',children:[]},
      ]};
      // Crear carpeta del tercero si no existe
      var terceroFolder=fs.children.find(function(c){return c.name===nombre&&c.type==='folder';});
      if(!terceroFolder){
        terceroFolder={id:'t_'+nit.replace(/[^a-z0-9]/gi,'_'),name:nombre,type:'folder',children:[],nit:nit};
        fs.children.push(terceroFolder);
      }
      // Crear subcarpeta por cada tipología
      dimsSnapshot.forEach(function(d){
        var nomTip=window._nombreTipologia(d);
        if(!nomTip) return;
        var tipFolder=terceroFolder.children.find(function(c){return c.name===nomTip;});
        if(!tipFolder){
          terceroFolder.children.push({id:'tip_'+d.key+'_'+Date.now(),name:nomTip,type:'folder',children:[]});
        }
      });
      // También agregar subcarpeta Evidencias AC y Matriz
      ['Evidencias AC','Análisis de Riesgos','Contratos'].forEach(function(fn){
        if(!terceroFolder.children.find(function(c){return c.name===fn;})){
          terceroFolder.children.push({id:'sub_'+fn.replace(/\s/g,'_')+'_'+Date.now(),name:fn,type:'folder',children:[]});
        }
      });
      try{localStorage.setItem(_od,JSON.stringify(fs));}catch(e){}
      // Re-render si está en vista repositorio
      try{if(window.odRender)window.odRender();}catch(e){}
    },500);
  }catch(e){}

  // ── API (DESACTIVADA - Solo guardar localmente) ────
  // El guardado local en TERCEROS_DB + localStorage es suficiente
  // El API es opcional y no bloquea ni muestra errores
  /*
  try {
    // Mapeo key → DominioID (según dbo.Dominios_Riesgo)
    const KEY_TO_DOMINIO = {
      'op':1,'procesos':1,'cliente':1,
      'con':2,'continuidad':2,
      'si':3,'seguridad':3,'informacion':3,
      'rc':4,'regulatorio':4,'cumplimiento':4,
      'fc':5,'fraude':5,'corrupcion':5,
      'laft':6,'lavado':6
    };
    const evaluaciones = cfDimsAgregadas.map(d => {
      const keyLow = (d.key||'').toLowerCase();
      let dominioID = KEY_TO_DOMINIO[keyLow] || null;
      // Si no matchea por key exacto, buscar por prefijo
      if(!dominioID){
        for(const [k,v] of Object.entries(KEY_TO_DOMINIO)){
          if(keyLow.startsWith(k)){ dominioID=v; break; }
        }
      }
      // Fallback: usar el id numérico si existe, o 1
      if(!dominioID) dominioID = (typeof d.id==='number' ? d.id : parseInt(d.id)) || 1;
      const valStr = (d.val||'').toString();
      const isNA   = valStr.startsWith('na') || valStr==='N/A';
      return {
        DominioID:        dominioID,
        Valoracion:       isNA ? 'N/A' : (parseInt(valStr)||null),
        Puntaje_Promedio: isNA ? null  : (parseFloat(valStr)||null),
        Zona_Riesgo:      zona,
        Periodicidad:     periodicidad
      };
    }).filter(e => e.DominioID);

    console.log('📤 Payload evaluaciones:', JSON.stringify(evaluaciones));

    const payload = {
      tercero: {
        NIT:nit, NombreTercero:nombre, ServicioContratado:servicio,
        NoContrato:nocontrato, Domicilio:domicilio, CargoSupervisor:cargo,
        SupervisorNombre:supervisor, PromedioCriticidad:parseFloat(prom.toFixed(2)),
        Zona_Riesgo:zona, Periodicidad:periodicidad, NombreEntidad:entidad,
        ProcesoSupervision:procesoSupervision, SupervisorSecundario:supervisor2,
        ProcesosSoporta:procesosSoporta, Observaciones:observaciones
      },
      evaluaciones
    };
    const resp = await fetch((typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000')+'/api/clasificacion',
      { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    if(resp.ok){ const d=await resp.json(); if(d.ok) console.log('✅ BD:',d.message,d); else console.warn('⚠ BD error:',d.error); }
    else { const t=await resp.text(); console.warn('⚠ BD HTTP',resp.status,t); }
  } catch(e){
    console.warn('API error (ignorado):', e.message);
  }
  */

  // ── Feedback y limpieza ───────────────────────────
  const statusEl = document.getElementById('clasif-form-status');
  if(statusEl){ 
    statusEl.textContent = esEdicion ? '✏️ Actualizado ✓' : 'Guardado ✓'; 
    statusEl.className = 'chip c-ok'; 
  }

  const mensajeToast = esEdicion 
    ? `✏️ "${nombre}" actualizado — Prom: ${promStr} · ${zona}${prom>=3?' → habilitado en Cuestionario AC':''}`
    : `✅ "${nombre}" guardado — Prom: ${promStr} · ${zona}${prom>=3?' → habilitado en Cuestionario AC':''}`;
  showToast(mensajeToast, 'success', 4000);
  
  // Limpiar modo edición después de guardar
  if(esEdicion && guardarBtn){
    delete guardarBtn.dataset.nitEditando;
    guardarBtn.textContent = '💾 Guardar Registro';
    if(statusEl) statusEl.textContent = '';
  }

  // Re-aplicar filtros y restricciones para que la fila nueva sea visible
  filterTerceros();
  if(currentUser?.rol==='Cliente') applyRoleRestrictions();
  // Refrescar tabla Información General desde BD
  setTimeout(function(){ try{ loadIGTercerosFull(); }catch(e){} }, 1500);
  var _yr=new Date().getFullYear().toString();
  if(!window.CLS_DB) window.CLS_DB={};
  if(!window.CLS_DB[_yr]) window.CLS_DB[_yr]=[];
  var _idx=window.CLS_DB[_yr].findIndex(function(r){return r.nit===nit;});
  var _rec={nit:nit,nombre:nombre,entidad:entidad,servicio:servicio,supervisor:supervisor,nocontrato:nocontrato,domicilio:domicilio,cargo:cargo,objetivo:objetivo,finicio:finicio,fterm:fterm,valor:valor,prom:parseFloat(prom.toFixed(2)),zona:zona,periodicidad:periodicidad,yr:_yr};
  if(_idx>=0) window.CLS_DB[_yr][_idx]=_rec; else window.CLS_DB[_yr].push(_rec);
  
  // ✅ GUARDAR CONTRATOS ADICIONALES
  var contratosGuardados = contratosDelBuffer;
  if(contratosGuardados.length > 0){
    if(!TERCEROS_DB[nit]) TERCEROS_DB[nit] = {};
    // Reutilizar la copia ya normalizada para no perder supervisor_asociado ni
    // supervisores_asociados en esta segunda etapa de persistencia.
    TERCEROS_DB[nit].contratos = contratosDelBuffer;
    TERCEROS_DB[nit].supervisores = supervisoresDelBuffer;
    window._lsSave && window._lsSave();
  }
  
  // 🔄 ⭐ SINCRONIZAR INMEDIATAMENTE CON CLASIFICACIÓN
  setTimeout(function(){
    try{
      // 1️⃣ Asegurar que TERCEROS_DB tiene el nombre guardado correctamente
      if(!TERCEROS_DB[nit]) TERCEROS_DB[nit] = {};
      TERCEROS_DB[nit].nombre = nombre;  // ⭐ Forzar que el nombre esté aquí
      TERCEROS_DB[nit].nit = nit;
      TERCEROS_DB[nit].domicilio = domicilio; // ⭐ TAMBIÉN ASEGURAR DOMICILIO
      console.log('✅ TERCEROS_DB['+nit+']:', TERCEROS_DB[nit].nombre);
      
      // 2️⃣ Guardar en localStorage bajo AMBAS claves para máxima compatibilidad
      var savedDB = {};
      try{
        savedDB = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      }catch(e){}
      savedDB[nit] = TERCEROS_DB[nit];
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(savedDB));
      console.log('✅ localStorage sgrt_terceros_db actualizado con:', nit, nombre, domicilio);
      
      // 3️⃣ Llamar a _lsSave() para sincronizar con sgrt_v8 también
      if(window._lsSave) window._lsSave();
      
      // 4️⃣ ⭐ REFRESCAR LA TABLA DE REGISTROS INMEDIATAMENTE
      if(typeof clsRender === 'function'){
        console.log('🔄 Llamando clsRender() para mostrar tabla actualizada...');
        clsRender();
      }
      if(typeof clsInitDash === 'function'){
        console.log('🔄 Llamando clsInitDash() para sincronizar datos...');
        clsInitDash();
      }
      
      // 5️⃣ Refrescar el selector de terceros en Clasificación (con pequeño delay)
      setTimeout(function(){
        if(typeof window._poblarSelectorTerceroClasificar === 'function'){
          window._poblarSelectorTerceroClasificar();
          console.log('✅ Selector de Clasificación refrescado - debería mostrar:', nombre);
        }
      }, 100);
      
      // 5️⃣ Refrescar el selector de contratos en Clasificación si hay contratos
      if(contratosGuardados.length > 0){
        setTimeout(function(){
          try{
            var selContratos = document.getElementById('cls-contrato-actual');
            if(selContratos){
              selContratos.innerHTML = '<option value="">— Seleccionar contrato —</option>' + 
                contratosGuardados.map(function(c){
                  var num = (c.num||'').trim();
                  var obj = (c.objeto||'').trim();
                  
                  // ⭐ NUEVO: Mostrar solo "Número - Nombre corto"
                  var nombreCorto = obj;
                  if(obj.length > 35){
                    var palabras = obj.split(/\s+/).slice(0, 3).join(' ');
                    nombreCorto = palabras.length > 35 ? palabras.substring(0, 32)+'...' : palabras;
                  }
                  
                  var lbl = num ? (nombreCorto ? num + ' - ' + nombreCorto : num) : ('Contrato');
                  return '<option value="'+c.num.replace(/"/g,'&quot;')+'">'+lbl+'</option>';
                }).join('');
              console.log('✅ Selector de contratos sincronizado:', contratosGuardados.length, 'contratos');
            }
          }catch(eContr){ console.log('ℹ️ Selector de contratos no visible aún (está en otra página)'); }
        }, 200);
      }
    }catch(eSyncErr){
      console.error('Error en sincronización:', eSyncErr);
    }
  }, 300);
  
  resetClasifForm(false);
  actualizarTipoRiesgoTags();
  updateDashboard();
}



// ─── FILTRO TABLA TERCEROS ────────────────────────────
function filterTerceros(){
  const search = (document.getElementById('terc-search')?.value||'').toLowerCase();
  const entidad = document.getElementById('terc-filter-entidad')?.value||'';
  const crit = document.getElementById('terc-filter-crit')?.value||'';
  document.querySelectorAll('#tbody-terceros tr').forEach(tr=>{
    const text = tr.textContent.toLowerCase();
    const rowEntidad = (tr.dataset.entidad||'').toLowerCase().replace(/[^a-z]/g,'');
    const filterEnt  = (entidad||'').toLowerCase().replace(/[^a-z]/g,'');
    const rowCrit = parseFloat(tr.dataset.crit||0);
    let show = true;
    if(search && !text.includes(search)) show=false;
    if(filterEnt && rowEntidad !== filterEnt) show=false;
    if(crit==='crit' && rowCrit<4) show=false;
    if(crit==='med' && (rowCrit<3||rowCrit>=4)) show=false;
    if(crit==='bajo' && rowCrit>=3) show=false;
    tr.style.display = show ? '' : 'none';
  });
}

// ─── IR A EVALUACIÓN DESDE TABLA TERCEROS ────────────
function irAEvaluacion(clienteId, terceroId){
  const ejCliente = document.getElementById('ejec-cliente-sel');
  const ejTercero = document.getElementById('ejec-tercero-sel');
  if(ejCliente) ejCliente.value = clienteId;
  if(ejTercero) ejTercero.value = terceroId;
  goPage('pg-clasificacion');
  setTimeout(()=>{ switchClasifMode('ejecucion'); }, 100);
}

// ─── GUARDAR TERCERO → dbo.Matriz_Riesgos_Resultados ─
function saveTercero(){
  const nit     = document.getElementById('t-nit')?.value.trim();
  const nombre  = document.getElementById('t-nombre')?.value.trim();
  const entidad = document.getElementById('t-entidad')?.value;
  const servicio= document.getElementById('t-servicio')?.value.trim();
  const supervisor = document.getElementById('t-supervisor')?.value.trim();

  if(!nit)     { showToast('❌ El NIT es obligatorio','error',2500); return; }
  if(!nombre)  { showToast('❌ El nombre del tercero es obligatorio','error',2500); return; }
  if(!entidad) { showToast('❌ Selecciona la Organización / Cliente','error',2500); return; }
  // Servicio es opcional para permitir múltiples contratos

  // Calcular promedio criticidad
  const dims = ['op','cn','si','cu','fr','lf'];
  const vals = dims.map(d=>{
    const sel = document.getElementById('sel-'+d);
    if(!sel || !sel.value || sel.value.startsWith('na')) return null;
    return parseInt(sel.value);
  }).filter(v=>v!==null);

  const prom = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  const promStr = vals.length ? prom.toFixed(2) : '—';

  // Periodicidad y zona
  let periodicidad='Sin evaluación', zona='BAJO', chipClass='c-bajo';
  if(prom>=4){ periodicidad='Se evalúa'; zona='EXTREMO'; chipClass='c-crit'; }
  else if(prom>=3){ periodicidad='Se evalúa'; zona='ALTO'; chipClass='c-alto'; }

  // PAC (ambiente de control)
  const respondidas = Object.keys(AC_RESPUESTAS).length;
  const positivas = Object.values(AC_RESPUESTAS).filter(v=>v).length;
  const pacStr = respondidas ? Math.round((positivas/PREGUNTAS_AC.length)*100)+'%' : '—';

  // Entidad display
  const entidadLabels = {colpensiones:'🏛 Colpensiones', ecopetrol:'🛢 Ecopetrol', bancolombia:'🏦 Bancolombia'};
  const entidadLabel = entidadLabels[entidad] || entidad;
  const entidadChipBg = {colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',
    ecopetrol:'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',
    bancolombia:'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'}[entidad]||'';

  // Agregar fila a la tabla de terceros (dbo.Matriz_Riesgos_Resultados mock)
  const tbody = document.getElementById('tbody-terceros');
  if(tbody){
    const nocontrato = document.getElementById('t-nocontrato')?.value||'—';
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-entidad', entidadLabels[entidad]?.replace(/^.+ /,'')||entidad);
    newRow.setAttribute('data-crit', promStr);
    newRow.innerHTML = `
      <td style="font-size:12px;">${nit}</td>
      <td><b>${nombre}</b><br><span style="font-size:10px;color:var(--muted);">${nocontrato}</span></td>
      <td><span class="chip" style="font-size:10.5px;${entidadChipBg}">${entidadLabel}</span></td>
      <td style="font-size:12px;">${servicio}</td>
      <td style="font-size:12px;">${supervisor||'—'}</td>
      <td><span class="chip ${chipClass}">${promStr}</span></td>
      <td style="font-size:12px;">${periodicidad}</td>
      <td><span class="chip c-ok">Activo</span></td>
      <td>
        <button class="btn btn-outline btn-xs" onclick="openM('m-ver-tercero')">Ver</button>
        ${prom>=3 ? `<button class="btn btn-primary btn-xs" onclick="irAEvaluacion('${entidad}','new_${Date.now()}')">▶ Eval.</button>` : ''}
      </td>`;
    tbody.appendChild(newRow);
  }

  // ─ Guardar en TERCEROS_DB para que cuestionario y AC lo vean ─
  const dimsGuardadas = ['op','cn','si','cu','fr','lf'].map(d=>{
    const sel=document.getElementById('sel-'+d);
    const v = sel?sel.value:'';
    if(!v || v.startsWith('na')) return null;
    return {key: d==='lf'?'laft':d, nombre:(window.SECCIONES_INFO&&window.SECCIONES_INFO[d==='lf'?'laft':d]?window.SECCIONES_INFO[d==='lf'?'laft':d].label:''), val:parseInt(v)||0};
  }).filter(Boolean);
  if(typeof TERCEROS_DB!=='undefined'){
    TERCEROS_DB[nit]={
      nit, nombre, entidad, entidadLabel,
      servicio, supervisor, prom, zona,
      periodicidad, estado:'Activo', dims: dimsGuardadas
    };
    // Persistir en localStorage como caché local
    try{
      var saved=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
      saved[nit]=TERCEROS_DB[nit];
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(saved));
    }catch(e){}
    try{ window._lsSave && window._lsSave(); }catch(e){}
    
    // ⭐ CORRECCIÓN: Enviar EXACTAMENTE los campos que el server.js espera
    const domicilio = document.getElementById('t-domicilio')?.value.trim() || '';
    const clasificacion = 'MEDIO'; // Por ahora default, puede sacarse del formulario si existe
    const nivel_riesgo = zona==='EXTREMO'?'CRÍTICO':'ALTO'; // Derivado de la zona
    
    // Contratos y supervisores como arrays (ahora como objetos con la info del t-nocontrato y t-supervisor)
    const contratos = document.getElementById('t-nocontrato')?.value.trim() ? [{numero: document.getElementById('t-nocontrato').value.trim(), servicio: servicio}] : [];
    const supervisores = supervisor ? [{nombre: supervisor}] : [];
    
    const terceroData = {
      nit,
      nombre,
      domicilio,           // ✅ Ahora sí lo incluye
      supervisor,
      entidad,             // ✅ Sin entidadLabel, solo el código
      estado: 'Activo',
      clasificacion,       // ✅ Ahora incluido
      prom,
      zona,
      nivel_riesgo,        // ✅ Ahora incluido
      contratos,           // ✅ Como array
      supervisores,        // ✅ Como array
      dims: dimsGuardadas
      // ❌ ELIMINADOS: entidadLabel, servicio, periodicidad, nocontrato, timestamp (el server usa GETDATE())
    };
    
    const apiUrl = (typeof API_BASE!=='undefined'?API_BASE:'https://infraestructuras-iseguras-btdphkfahja4c0bh.canadacentral-01.azurewebsites.net') + '/api/terceros';
    
    console.log('📤 Enviando a POST /api/terceros:', terceroData); // Debug
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(terceroData)
    }).then(r=>{
      console.log('📥 Respuesta HTTP:', r.status);
      return r.json();
    }).then(d=>{
      if(d.ok){
        console.log('✅ Tercero sincronizado con Azure SQL:', d);
        showToast('✅ Datos guardados en Azure SQL','success',2000);
      } else {
        console.error('❌ Error en respuesta API:', d.error);
        showToast('❌ Error: '+d.error,'error',2000);
      }
    }).catch(e=>{
      console.error('❌ Error en fetch a /api/terceros:', e);
      showToast('❌ No se pudo conectar al servidor','error',2000);
    });
  }
  if(prom>=3 && typeof registrarTerceroPendiente!=='undefined'){
    registrarTerceroPendiente(nit,nombre,entidad,prom,zona,periodicidad,dimsGuardadas);
  }
  sincronizarSelectorCuestionario();

  // Log en dbo.Relacion_Terceros / RELACION_GENERAL
  const fecha = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
  addLog(nombre,'Matriz_Riesgos_Resultados','NIT',nit,'Nuevo registro · '+zona,fecha,'Datos Maestros');
  addLog(nombre,'Relacion_Terceros','Puntaje_Promedio','—',promStr+' · '+periodicidad,fecha,'Clasificación');

  // ✅ MOSTRAR ÉXITO
  showToast('✅ Tercero guardado: '+nombre,'success',2500);
  
  // ✅ AUTO-SINCRONIZAR
  setTimeout(function(){
    try{
      if(window.bdSincronizarAhora){
        window.bdSincronizarAhora();
      }
    }catch(e){console.error('Auto-sync error:', e);}
  }, 600);

  // Reset form
  ['t-nit','t-nombre','t-servicio','t-nocontrato','t-objetivo','t-domicilio','t-supervisor','t-cargo','t-valor','t-duracion'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  ['t-finicio','t-fterm'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  ['op','cn','si','cu','fr','lf'].forEach(d=>{
    const sel=document.getElementById('sel-'+d); if(sel) sel.value='';
    const badge=document.getElementById('badge-'+d); if(badge){badge.textContent='—';badge.style.color='var(--muted)';}
    const hint=document.getElementById('hint-'+d); if(hint) hint.textContent='Selecciona un nivel para ver la descripción';
  });
  const entidadSel=document.getElementById('t-entidad'); if(entidadSel) entidadSel.value='';
  Object.keys(AC_RESPUESTAS).forEach(k=>delete AC_RESPUESTAS[k]);
  renderCuestionarioAC();
  const promEl=document.getElementById('crit-prom'); if(promEl){promEl.textContent='—';promEl.style.color='var(--muted)';}
  const freqEl=document.getElementById('crit-freq'); if(freqEl){freqEl.textContent='Completa las dimensiones para ver la periodicidad';freqEl.style.color='var(--muted)';}
  const chipEl=document.getElementById('crit-chip-wrap'); if(chipEl) chipEl.innerHTML='';
  const pacEl=document.getElementById('t-pac'); if(pacEl){pacEl.textContent='—';pacEl.style.color='';}
  const perEl=document.getElementById('t-periodicidad'); if(perEl) perEl.textContent='—';
  const zonaFEl=document.getElementById('t-zona'); if(zonaFEl){zonaFEl.textContent='—';zonaFEl.style.color='';}

  closeM('m-tercero');
  showToast(`✅ "${nombre}" guardado · NIT: ${nit} · Prom: ${promStr} · PAC: ${pacStr} · ${periodicidad}`, 'success', 5000);
  sendNotification(
    parseFloat(promStr)>=4 ? 'riesgo_critico' : 'clasificacion',
    (parseFloat(promStr)>=4 ? '🔴 Tercero CRÍTICO: ' : 'Clasificación guardada: ') + nombre,
    'NIT: '+nit+' · Promedio: '+promStr+' · Zona: '+zona+' · '+periodicidad,
    {'Tercero': nombre, 'NIT': nit, 'Promedio': promStr, 'Zona': zona, 'Periodicidad': periodicidad}
  );
}
function saveClasif(){
  calcClasif();
  const prom = document.getElementById('cls-prom')?.textContent;
  closeM('m-clasificar');
  alert('✅ Clasificación actualizada\nPromedio: ' + prom);
}
function addLog(tercero,tabla,campo,ant,nuevo,fecha,tipo){
  const newId = LOGS_DATA.length + 1;
  LOGS_DATA.unshift({id:newId,tercero,tabla,campo,ant,nuevo,fecha,user:currentUser?.name||window.currentUser?.name||'—',tipo});
  filteredLogs = [...LOGS_DATA];
  
  // Guardar en localStorage para Super Admin (iseguras)
  if(window.currentUser && (window.currentUser.rol === 'Administrador' || window.currentUser.username === 'iseguras')){
    try{
      var sysLogs=JSON.parse(localStorage.getItem('sgrt_sys_logs')||'[]');
      sysLogs.push({ts:new Date().toISOString(),tipo:tipo||'evento',usuario:window.currentUser.name||'—',rol:window.currentUser.rol,detalle:tercero+' — '+tabla+':'+campo+' = '+nuevo});
      localStorage.setItem('sgrt_sys_logs',JSON.stringify(sysLogs));
    }catch(e){}
  }
}

// ─── LOGS TABLE ───────────────────────────────────────
function renderLogs(data){
  const tbody = document.getElementById('logs-body');
  if(!tbody) return;
  const tipoClass = {Riesgo:'log-riesgo','Clasificación':'log-clasif','Datos Maestros':'log-datos'};
  tbody.innerHTML = data.map(l=>`
    <tr>
      <td style="color:var(--muted);font-size:11px;">${l.id}</td>
      <td><b>${l.tercero}</b></td>
      <td style="font-size:11px;color:var(--muted);">${l.tabla}</td>
      <td><span class="log-action ${tipoClass[l.tipo]||''}">${l.campo}</span></td>
      <td style="font-size:12px;color:var(--red);text-decoration:line-through;">${l.ant}</td>
      <td style="font-size:12px;color:var(--green);font-weight:600;">${l.nuevo}</td>
      <td style="font-size:11.5px;color:var(--muted);">${l.fecha}</td>
      <td><div style="display:flex;align-items:center;gap:5px;"><div style="width:22px;height:22px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:white;">${l.user.split(' ').map(w=>w[0]).join('').slice(0,2)}</div><span style="font-size:12px;">${l.user}</span></div></td>
    </tr>`).join('');
}
function filterLogs(){
  const tipo = document.getElementById('log-filter-tipo')?.value||'';
  const user = document.getElementById('log-filter-user')?.value||'';
  filteredLogs = LOGS_DATA.filter(l=>{
    if(tipo && l.tipo !== tipo) return false;
    if(user && l.user !== user) return false;
    return true;
  });
  renderLogs(filteredLogs);
}
function resetFilters(){
  document.getElementById('log-filter-tipo').value='';
  document.getElementById('log-filter-user').value='';
  document.getElementById('log-filter-fecha').value='';
  renderLogs(LOGS_DATA);
}
function exportLogs(){
  const headers = ['#','Tercero','Tabla','Campo','Valor Anterior','Valor Nuevo','Fecha','Usuario'];
  const rows = filteredLogs.map(l=>[l.id,l.tercero,l.tabla,l.campo,l.ant,l.nuevo,l.fecha,l.user]);
  const csv = [headers, ...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF'+csv);
  a.download = 'logs_auditoria_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}

// ─── ANIMATE BARS ────────────────────────────────────
function animateProgress(){
  document.querySelectorAll('.prog-fill').forEach(b=>{
    const w=b.style.width; b.style.width='0';
    setTimeout(()=>{ b.style.width=w; },300);
  });
}

// (init moved to end)

// ─── TOAST ───────────────────────────────────────────
// ─── DASHBOARD DINAMICO ──────────────────────────────
function updateDashboard(){
  const isCliente = currentUser?.rol === 'Cliente';
  const iseguras = currentUser?.login === 'iseguras2026';
  const adminV  = document.getElementById('dash-admin-view');
  const clientV = document.getElementById('dash-cliente-view');

  if(adminV)  adminV.style.display  = isCliente ? 'none' : 'block';
  if(clientV) clientV.style.display = isCliente ? 'block' : 'none';

  // Mostrar/ocultar secciones según rol
  var evalEstado = document.getElementById('eval-estado-org');
  var isegAportes = document.getElementById('iseg-aportes-org');
  if(evalEstado) evalEstado.style.display = (isCliente || iseguras) ? 'none' : 'block';
  if(isegAportes) isegAportes.style.display = iseguras ? 'block' : 'none';

  if(isCliente){
    _updateDashCliente();
  } else {
    _updateDashAdmin();
  }
  setTimeout(animateProgress, 100);
}

function _updateDashAdmin(){
  const pi=[20,30,48,20,24,20,20,24,30,20,80,48,50,40,48,8,12,24,8,8,20,20,24,24,20,24,20,20,12,8];
  let ext=0,alto=0,med=0,bajo=0;
  pi.forEach(v=>{ if(v>=16)ext++; else if(v>=9)alto++; else if(v>=4)med++; else bajo++; });
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('kpi-extremos', ext); s('kpi-total-riesgos', pi.length);
  const ctrlRows = document.querySelectorAll('#tbody-controles tr');
  s('kpi-controles', ctrlRows.length);
  s('kpi-controles-sub', ctrlRows.length + ' en catálogo');
  const tercRows = document.querySelectorAll('#tbody-terceros tr');
  s('kpi-terceros', tercRows.length||5);
  s('dash-ext', ext); s('dash-alto', alto); s('dash-med', med); s('dash-bajo', bajo);
  let crit=0, medT=0, bajoT=0;
  tercRows.forEach(tr=>{
    const chip = tr.querySelector('.chip');
    if(!chip) return;
    const v = parseFloat(chip.textContent);
    if(v>=4) crit++; else if(v>=3) medT++; else bajoT++;
  });
  if(!crit&&!medT&&!bajoT){ crit=2; medT=1; bajoT=2; }
  s('cnt-crit', crit); s('cnt-med', medT); s('cnt-bajo', bajoT);
  s('cnt-total-terceros', crit+medT+bajoT); s('cnt-pendientes', crit);
  const wEl = document.getElementById('dash-welcome');
  if(wEl && currentUser) wEl.textContent = 'Bienvenido, ' + currentUser.name + ' · ' + new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

function _updateDashCliente(){
  var entidad = currentUser ? currentUser.entidad || '' : '';
  var ENTIDAD_INFO = {
    colpensiones: { nombre:'Colpensiones', icon:'🏛', grad:'135deg, #1a3a5c 0%, #1e6bb8 100%', chipBg:'#e8f0f8', chipC:'var(--navy)', chipBd:'#aac8f0' },
    ecopetrol:    { nombre:'Ecopetrol',    icon:'🛢', grad:'135deg, #1a3a1a 0%, #2d7a2d 100%', chipBg:'#e8f4e8', chipC:'#1a5c1a', chipBd:'#82d982' },
    bancolombia:  { nombre:'Bancolombia',  icon:'🏦', grad:'135deg, #7c4a00 0%, #e65100 100%', chipBg:'#fff3e0', chipC:'#7c4a00', chipBd:'#ffb74d' },
  };
  var info = ENTIDAD_INFO[entidad] || { nombre:entidad||'Cliente', icon:'🏢', grad:'135deg, var(--navy) 0%, #1e4a7a 100%', chipBg:'#f0f0f0', chipC:'#333', chipBd:'#ccc' };

  // Header gradient
  var header = document.querySelector('#dash-cliente-view > div:first-child');
  if(header) header.style.background = 'linear-gradient(' + info.grad + ')';

  var el = function(id){ return document.getElementById(id); };
  var set = function(id,v){ var e=el(id); if(e) e.textContent=v; };

  // no badge icon
  set('cli-welcome-title', 'Bienvenido, ' + (currentUser ? currentUser.name : info.nombre));
  set('cli-entidad-nombre', 'Portal de Gestión de Riesgos');
  set('cli-fecha-hoy', new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long',year:'numeric'}));

  var chipEl = el('cli-entidad-chip');
  if(chipEl){
    chipEl.textContent = info.nombre;
    chipEl.style.background = info.chipBg;
    chipEl.style.color = info.chipC;
    chipEl.style.border = '1px solid ' + info.chipBd;
  }

  // Mis terceros
  var db = (typeof TERCEROS_DB !== 'undefined') ? TERCEROS_DB : {};
  var misTerceros = Object.values(db).filter(function(t){
    return (t.entidad||'').toLowerCase().replace(/\s+/g,'') === entidad;
  });
  set('cli-kpi-terceros', misTerceros.length || 4);

  var ZONA_CONF = {
    'EXTREMO': { bg:'#fde8e8', border:'var(--red)',    color:'var(--red)',    chip:'c-crit', icon:'🔴' },
    'ALTO':    { bg:'#fef0e6', border:'var(--orange)',  color:'var(--orange)', chip:'c-alto', icon:'🟠' },
    'MEDIO':   { bg:'#fef9e7', border:'var(--yellow)',  color:'#856404',      chip:'c-med',  icon:'🟡' },
    'BAJO':    { bg:'#e8f8f2', border:'var(--green)',   color:'var(--green)', chip:'c-bajo', icon:'🟢' },
  };

  var lista = misTerceros.length ? misTerceros : [];

  var cardsWrap = el('cli-terceros-cards');
  if(cardsWrap){
    var html2 = '';
    lista.forEach(function(t){
      var zonaKey = (t.zona||'BAJO').split('/')[0].trim().toUpperCase();
      var zc = ZONA_CONF[zonaKey] || ZONA_CONF['BAJO'];
      var p = parseFloat(t.prom||0);
      var pasos = [
        {label:'Clasificación', done:true},
        {label:'Cuestionario',  done: p>=3},
        {label:'Análisis',      done: p>=4},
        {label:'Seguimiento',   done: false},
      ];
      var pasosHtml = pasos.map(function(ps){
        var col = ps.done ? 'var(--green)' : 'var(--muted)';
        return '<div style="display:flex;align-items:center;gap:4px;font-size:10px;">' +
          '<span style="color:' + col + ';">' + (ps.done ? '✓' : '○') + '</span>' +
          '<span style="color:' + col + ';">' + ps.label + '</span>' +
          '</div>';
      }).join('');

      var btnCuest = p>=3
        ? '<button class="btn btn-primary btn-xs" style="flex:1;" onclick="irAlCuestionario(\'' + t.nit + '\')">📋 Cuestionario</button>'
        : '';

      html2 +=
        '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;box-shadow:var(--shadow);display:flex;flex-direction:column;">' +
          '<div style="background:' + zc.bg + ';border-left:4px solid ' + zc.border + ';padding:12px 14px;display:flex;align-items:center;gap:10px;">' +
            '<div style="font-size:20px;">' + zc.icon + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:13px;font-weight:700;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.nombre + '</div>' +
              '<div style="font-size:10.5px;color:var(--muted);">' + (t.servicio||'—') + '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<div style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:' + zc.color + ';">' + p.toFixed(2) + '</div>' +
              '<span class="chip ' + zc.chip + '" style="font-size:9.5px;">' + zonaKey + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="padding:10px 14px;">' +
            '<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">Progreso del proceso</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">' + pasosHtml + '</div>' +
          '</div>' +
          '<div style="padding:0 14px 12px;display:flex;gap:6px;">' +
            '<button class="btn btn-outline btn-xs" style="flex:1;" onclick="verDetalleTercero(\'' + t.nit + '\')">👁 Ver detalle</button>' +
            btnCuest +
          '</div>' +
        '</div>';
    });
    cardsWrap.innerHTML = html2;
  }
}

function showToast(msg, type='info', duration=3500){
  const wrap = document.getElementById('toast-wrap');
  if(!wrap) return;
  if(type==='warning') type='warn';
  const t = document.createElement('div');
  t.className = 'toast t-'+type;
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add('show')));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); }, duration);
}
function switchMatrizTab(el, tab){
  document.querySelectorAll('#matriz-tabs .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const inh = document.getElementById('mat-tab-inh');
  const res = document.getElementById('mat-tab-res');
  const comp= document.getElementById('mat-tab-comp');
  if(inh) inh.style.display  = tab==='inh'  ? 'block':'none';
  if(res) res.style.display  = tab==='res'  ? 'block':'none';
  if(comp) comp.style.display = tab==='comp' ? 'block':'none';
}

// Aplicar filtros de contratos en Análisis de Riesgos
window.aplicarFiltroMatriz = function(){
  var terceroFiltro = document.getElementById('mz-filtro-tercero')?.value || '';
  var contratoFiltro = document.getElementById('mz-filtro-contrato')?.value || '';
  var estadoFiltro = document.getElementById('mz-filtro-estado')?.value || '';
  
  var matrizDb = window.MATRIZ_DB || [];
  var terceros = new Set();
  var contratos = new Set();
  var filtrada = [];
  
  matrizDb.forEach(function(r){
    if(terceroFiltro && r.tercero !== terceroFiltro) return;
    if(contratoFiltro && r.contrato !== contratoFiltro) return;
    if(estadoFiltro && r.estado !== estadoFiltro) return;
    filtrada.push(r);
    if(r.tercero) terceros.add(r.tercero);
    if(r.contrato) contratos.add(r.contrato);
  });
  
  // Actualizar dropdowns
  var selTercero = document.getElementById('mz-filtro-tercero');
  var selContrato = document.getElementById('mz-filtro-contrato');
  if(selTercero){
    terceros.forEach(function(t){
      if(![].slice.call(selTercero.options).find(function(o){return o.value===t;})){
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        selTercero.appendChild(opt);
      }
    });
  }
  if(selContrato){
    contratos.forEach(function(c){
      if(![].slice.call(selContrato.options).find(function(o){return o.value===c;})){
        var opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        selContrato.appendChild(opt);
      }
    });
  }
  
  // Actualizar contadores
  try{
    document.getElementById('mz-count-terceros').textContent = terceros.size;
    document.getElementById('mz-count-contratos').textContent = contratos.size;
    document.getElementById('mz-count-riesgos').textContent = filtrada.length;
  }catch(e){}
};

// Actualizar datos de Aportes por Organización
window.actualizarAportes = function(){
  var selOrg = document.getElementById('iseg-filtro-aportes')?.value || 'colpensiones';
  var totalTerceros = (window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length) || 0;
  var aprob = Math.floor(totalTerceros * 0.65);
  var pend = Math.floor(totalTerceros * 0.25);
  var rech = totalTerceros - aprob - pend;
  
  try{
    document.getElementById('aportes-total').textContent = totalTerceros;
    document.getElementById('aportes-aprob').textContent = aprob;
    document.getElementById('aportes-pend').textContent = pend;
    document.getElementById('aportes-rech').textContent = rech;
  }catch(e){}
};

// Generar reporte de aportes
window.generarReporteAportes = function(){
  var selOrg = document.getElementById('iseg-filtro-aportes')?.value || 'colpensiones';
  var fecha = new Date().toLocaleDateString('es-CO');
  var csv = 'Reporte de Aportes por Organización\n';
  csv += 'Fecha: ' + fecha + '\n';
  csv += 'Organización: Colpensiones\n\n';
  csv += 'Total Terceros,Aprobados,Pendientes,Rechazados\n';
  var totalTerceros = (window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length) || 0;
  var aprob = Math.floor(totalTerceros * 0.65);
  var pend = Math.floor(totalTerceros * 0.25);
  var rech = totalTerceros - aprob - pend;
  csv += totalTerceros + ',' + aprob + ',' + pend + ',' + rech + '\n';
  
  var blob = new Blob([csv], {type:'text/csv'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'aportes_colpensiones_' + new Date().getTime() + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  showToast('Reporte de aportes descargado', 'success', 2000);
};

// Actualizar página de Configuración BD
window.actualizarConfigBD = function(){
  var totalTerceros = (window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length) || 0;
  
  try{
    document.getElementById('config-local-count').textContent = totalTerceros;
    document.getElementById('config-azure-status').textContent = 'Verificar...';
    document.getElementById('config-sync-count').textContent = '0/' + totalTerceros;
  }catch(e){}
};

// ─── CALC PROMEDIOS MATRIZ ────────────────────────────
function calcMatrizPromedios(){
  const piValues=[20,30,48,20,24,20,20,24,30,20,80,48,50,40,48,8,12,24,8,8,20,20,24,24,20,24,20,20,12,8];
  let ext=0,alto=0,med=0,bajo=0;
  piValues.forEach(v=>{
    if(v>=16) ext++;
    else if(v>=9) alto++;
    else if(v>=4) med++;
    else bajo++;
  });
  const s=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val;};
  s('ms-ext',ext); s('ms-alto',alto); s('ms-med',med); s('ms-bajo',bajo);
  s('ms-total',piValues.length);
  s('matrix-count',piValues.length+' riesgos registrados');
}

// ─── MODAL NUEVO CONTROL ─────────────────────────────
function saveControl(){
  const no = document.getElementById('ctrl-no')?.value;
  const nombre = document.getElementById('ctrl-nombre')?.value;
  if(!no||!nombre){ alert('Completa el número y nombre del control'); return; }
  const impl = document.getElementById('ctrl-impl')?.value||'No';
  const doc  = document.getElementById('ctrl-doc')?.value||'No';
  const calif = parseFloat(document.getElementById('ctrl-calif')?.value)||0;
  const madurez = document.getElementById('ctrl-madurez')?.value||'INICIAL';
  const dominio = document.getElementById('ctrl-dominio')?.value||'—';
  const tipo = document.getElementById('ctrl-tipo')?.value||'—';
  const implHtml = impl==='Sí'?`<span style="color:var(--green)">✓ Sí</span>`:(impl==='No'?`<span style="color:var(--red)">✗ No</span>`:`<span style="color:var(--yellow)">⚠ Parcial</span>`);
  const docHtml  = doc==='Sí' ?`<span style="color:var(--green)">✓ Sí</span>` :(doc==='No' ?`<span style="color:var(--red)">✗ No</span>` :`<span style="color:var(--yellow)">⚠ Parcial</span>`);
  const madClass = madurez==='OPTIMIZADO'?'c-ok':madurez==='DEFINIDO'?'c-ok':madurez==='GESTIONADO'?'c-ok':madurez==='INICIAL'?'c-med':'c-crit';
  const tbody = document.getElementById('tbody-controles');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${no}</td><td>${nombre}</td><td>${dominio}</td><td>${tipo}</td><td>${implHtml}</td><td>${docHtml}</td><td><b>${calif.toFixed(2)}</b></td><td><span class="chip ${madClass}">${madurez}</span></td><td><button class="btn btn-outline btn-xs">Editar</button></td>`;
  tbody.appendChild(tr);
  const cnt = document.getElementById('ctrl-count');
  if(cnt) cnt.textContent = tbody.querySelectorAll('tr').length + ' controles';
  addLog(nombre,'Controles','Nuevo Control','—',no+' - '+nombre,new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Datos Maestros');
  closeM('m-control');
  alert('✅ Control guardado: ' + no + ' — ' + nombre);
}

// ─── ACCORDION CUESTIONARIOS ─────────────────────────
function toggleAcc(id){
  const el = document.getElementById(id);
  const arrow = document.getElementById(id.replace('acc-','arr-'));
  if(!el) return;
  el.style.display = el.style.display==='none' ? 'block' : 'none';
  if(arrow) arrow.textContent = el.style.display==='none' ? '▼' : '▲';
}

// Build cuestionario controls dynamically
const CUEST_DATA = {
  op: [
    {id:'op1',ctrl:'Identificación de riesgos',q:'¿Se cuenta con una metodología de identificación de riesgos operacionales asociados a cada actividad de los procesos para la prestación del servicio?',doc:'Matriz de riesgo o documento identificando riesgos operacionales'},
    {id:'op2',ctrl:'Medición de probabilidad e impacto',q:'¿Se cuenta con el perfil de riesgo inherente de los procesos considerando factores cualitativos y/o cuantitativos?',doc:'Perfil de riesgo inherente; factores cualitativos/cuantitativos'},
    {id:'op3',ctrl:'Controles y riesgo residual',q:'¿Se tienen identificados los controles y la medición del perfil de riesgo residual para los procesos de prestación del servicio?',doc:'Documento con controles implementados; perfil de riesgo residual'},
    {id:'op4',ctrl:'Monitoreo del perfil de riesgo',q:'¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?',doc:'Actividades de monitoreo y seguimiento a planes de acción'},
    {id:'op5',ctrl:'Registro de eventos operacionales',q:'¿Se cuenta con procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo materializados?',doc:'Procedimiento reporte eventos; bitácora eventos; reporte Colpensiones'},
    {id:'op6',ctrl:'Protocolo de comunicación',q:'¿Se cuenta con protocolo de comunicación con Colpensiones ante la identificación de eventos de riesgo?',doc:'Protocolo de comunicación; canales definidos; divulgación'},
    {id:'op7',ctrl:'Plan de capacitación',q:'¿Se cuenta con un plan de capacitación sobre gestión de riesgos operacionales para funcionarios que participan en la prestación del servicio?',doc:'Plan/cronograma de capacitación; bitácora; resultado evaluaciones'},
    {id:'op8',ctrl:'Gestión de cuartas partes',q:'¿Los acuerdos contractuales con cuartas partes incluyen los requisitos de control definidos por Colpensiones?',doc:'Listado cuartas partes; cláusulas contractuales; riesgos gestionados'},
  ],
  cn: [
    {id:'cn1',ctrl:'Plan de Continuidad (PCN)',q:'¿Tienen un Plan de Continuidad del Negocio actualizado?',doc:'Plan de continuidad del negocio'},
    {id:'cn2',ctrl:'Identificación riesgos continuidad',q:'¿Dentro de la matriz de riesgos se encuentran identificados y analizados los riesgos que afectan la continuidad del negocio para los servicios contratados?',doc:'Matriz de riesgos con continuidad de negocio para Colpensiones'},
    {id:'cn3',ctrl:'Plan de contingencia',q:'¿Tienen un plan de contingencia donde se incluyan los servicios contratados por Colpensiones?',doc:'Plan de contingencia: preparación, durante, retorno a normalidad'},
    {id:'cn4',ctrl:'Plan de administración de crisis',q:'¿Tienen un plan de administración de crisis que contemple alcance organizacional, tipos de crisis y responsables?',doc:'Plan de administración de crisis'},
    {id:'cn5',ctrl:'Plan de recuperación DRP',q:'¿Tienen establecido un Plan de Recuperación de Desastres (DRP)?',doc:'DRP; procedimientos recuperación tecnológica'},
    {id:'cn6',ctrl:'Análisis de impacto BIA',q:'¿Dentro del BIA se incluyen los servicios de Colpensiones con RTO, RPO, personal mínimo y activos necesarios?',doc:'BIA con actividades críticas, RTO/RPO, personal mínimo, recursos'},
    {id:'cn7',ctrl:'Pruebas al PCN',q:'¿Entregaron cronograma de pruebas de continuidad? ¿Se realizaron pruebas y enviaron informe de resultados?',doc:'Cronograma pruebas; informe resultados; correo de socialización'},
    {id:'cn8',ctrl:'Centro de datos principal y alterno',q:'¿El proveedor cuenta con CDP principal y alterno debidamente implementado? ¿Están certificados TIER III o IV?',doc:'Certificación DRP; planes recuperación tecnológica; certificación TIER'},
    {id:'cn9',ctrl:'Plan de capacitación PCN',q:'¿El proveedor tiene plan de capacitaciones donde se incluyan temas de PCN y se miden los resultados?',doc:'Plan/cronograma capacitación; registro personas; evaluaciones'},
  ],
  si: [
    {id:'si1',ctrl:'Política y procedimientos SI',q:'¿Las políticas, procedimientos y estándares de SI están documentados, revisados, actualizados anualmente y comunicados?',doc:'Documentos políticas SI; comunicación partes interesadas'},
    {id:'si2',ctrl:'Roles y responsabilidades SI',q:'¿Se definen y documentan formalmente los roles y responsabilidades sobre la gestión de SI? ¿Las responsabilidades en conflicto están segregadas?',doc:'Gobierno SI; documento roles y responsabilidades'},
    {id:'si3',ctrl:'Marco de gestión de riesgos SI',q:'¿Existe política y modelo formal de gestión de riesgos de seguridad, actualizado y comunicado?',doc:'Política gestión riesgos SI; matriz riesgos SI; planes tratamiento'},
    {id:'si4',ctrl:'Evaluación previa contratación',q:'¿Se realizan estudios de seguridad previo a la contratación de empleados con acceso a información de Colpensiones?',doc:'Políticas de estudios de seguridad previo contratación'},
    {id:'si5',ctrl:'Términos y condiciones laborales',q:'¿Los contratos de trabajo contemplan responsabilidades relacionadas con la SI?',doc:'Cláusulas contratos SI; listado empleados que firmaron'},
    {id:'si6',ctrl:'Proceso disciplinario SI',q:'¿Existe proceso disciplinario formalmente documentado por violación de cumplimiento de directrices de seguridad?',doc:'Política/proceso disciplinario; evidencia comunicación'},
    {id:'si7',ctrl:'Capacitación y cultura SI',q:'¿El proveedor tiene plan de capacitaciones de cultura de SI para empleados y subcontratistas? ¿Se miden resultados?',doc:'Calendario programa cultura SI; registros capacitación'},
    {id:'si8',ctrl:'Terminación responsabilidades laborales',q:'¿Se recuperan/eliminan todos los activos/derechos de acceso de empleados al finalizar contrato?',doc:'Proceso retiro accesos y devolución de información'},
    {id:'si9',ctrl:'Inventario y clasificación activos',q:'¿Se mantienen inventarios de activos de información clasificados en confidencialidad, integridad y disponibilidad?',doc:'Inventario activos clasificados; política etiquetado'},
    {id:'si10',ctrl:'Política uso aceptable',q:'¿La política de uso aceptable está documentada y aceptada por todos los empleados anualmente?',doc:'Política uso aceptable; seguimiento aceptación empleados'},
    {id:'si11',ctrl:'Eliminación de medios',q:'¿Están documentados e implementados los procedimientos para sanitización y destrucción de medios en desuso?',doc:'Procedimiento eliminación segura de información'},
    {id:'si12',ctrl:'Administración de cuentas de acceso',q:'¿Se cuenta con proceso de gestión de acceso lógico para otorgar/modificar/revocar accesos con separación de funciones?',doc:'Proceso administración cuentas de acceso'},
    {id:'si13',ctrl:'Revisión de acceso de usuario',q:'¿Se realiza revisión anual del acceso de usuarios en sistemas de información usados para el servicio?',doc:'Proceso certificación de accesos'},
    {id:'si14',ctrl:'Gestión de contraseñas',q:'¿Se han implementado sistemas de administración de contraseñas con complejidad, caducidad, historial, cifrado?',doc:'Documentación política de contraseñas'},
    {id:'si15',ctrl:'Acceso a código fuente',q:'¿El código fuente está protegido con restricciones de almacenamiento, acceso y separación desarrollo/producción?',doc:'Política control acceso a código fuente'},
    {id:'si16',ctrl:'Autenticación y acceso remoto',q:'¿Se definen e implementan directrices para asegurar el acceso remoto? ¿Qué controles adicionales para trabajo remoto?',doc:'Política acceso remoto; tecnologías utilizadas'},
    {id:'si17',ctrl:'Seguridad acceso inalámbrico',q:'¿Existen restricciones y pautas documentadas para el acceso inalámbrico, restringido solo a autorizados?',doc:'Pautas uso red inalámbrica'},
    {id:'si18',ctrl:'Control dispositivos móviles',q:'¿Existen restricciones y pautas documentadas para el acceso a dispositivos móviles?',doc:'Pautas uso dispositivos móviles'},
    {id:'si19',ctrl:'Gestión BYOD',q:'¿Existen restricciones y pautas de uso de dispositivos personales en la prestación del servicio?',doc:'Política BYOD'},
    {id:'si20',ctrl:'Cuentas de acceso privilegiado',q:'¿Se autoriza y supervisa la asignación y uso de cuentas de acceso privilegiado?',doc:'Políticas cuentas privilegiadas; matriz de control'},
    {id:'si21',ctrl:'Controles de seguridad física',q:'¿Existen e implementan políticas y procedimientos de seguridad física formalmente documentados?',doc:'Políticas mecanismos control seguridad física'},
    {id:'si22',ctrl:'Restricción acceso áreas seguras',q:'¿Se cuenta con perímetros de seguridad para proteger las áreas de trabajo?',doc:'Lista controles seguridad física; proceso acceso visitantes'},
    {id:'si23',ctrl:'Acceso instalaciones procesamiento',q:'¿El acceso a instalaciones de procesamiento de información está restringido físicamente?',doc:'Listado instalaciones de procesamiento'},
    {id:'si24',ctrl:'CCTV monitoreo 24/7',q:'¿Se cuenta con CCTV para monitorear instalaciones 24/7? ¿Se conservan imágenes al menos 3 meses?',doc:'Política CCTV; ubicación cámaras; tiempo retención'},
    {id:'si25',ctrl:'Controles ambientales',q:'¿Existen sistemas de detección de incendios e inundación para minimizar daño a información e instalaciones?',doc:'Proceso respuesta incendio/inundación; pruebas mecanismos'},
    {id:'si26',ctrl:'Protección equipos críticos (UPS)',q:'¿Están los sistemas críticos protegidos por UPS?',doc:'Informes mantenimiento preventivo generador y UPS'},
    {id:'si27',ctrl:'Control acceso a la red',q:'¿Existen y están implementadas políticas y procedimientos de seguridad en la red de datos?',doc:'Directrices control acceso red'},
    {id:'si28',ctrl:'Segmentación de red',q:'¿La red está segmentada y segregada física/lógicamente?',doc:'Diagrama de red con componentes tecnológicos para el servicio'},
    {id:'si29',ctrl:'Firewalls y DMZ',q:'¿Se cuenta con firewalls en todas las conexiones con redes externas o DMZ?',doc:'Diagrama topología red con firewalls; directrices configuración'},
    {id:'si30',ctrl:'Pruebas de penetración',q:'¿Se realizan periódicamente pruebas de penetración sobre la infraestructura tecnológica?',doc:'Informes evaluación intrusión; cronograma pruebas'},
    {id:'si40',ctrl:'Copias de seguridad',q:'¿Se han definido políticas/procedimientos formales de respaldo y restauración? ¿Se prueban los datos respaldados regularmente?',doc:'Política/procedimiento backup; configuración respaldos; pruebas restauración'},
    {id:'si41',ctrl:'Privacidad de datos personales (Ley 1581)',q:'¿Existe política de privacidad de datos formalmente documentada conforme a la Ley 1581 y decretos?',doc:'Norma política privacidad datos; inventario bases datos personales'},
    {id:'si42',ctrl:'Gestión de cambios',q:'¿Se cuenta con procedimiento de gestión de cambios con identificación, evaluación de impacto, autorización y prueba?',doc:'Procedimientos gestión cambios; bitácora trazabilidad'},
    {id:'si44',ctrl:'Gestión de vulnerabilidades técnicas',q:'¿Se realizan pruebas de vulnerabilidad periódicamente sobre todos los componentes del servicio?',doc:'Informes evaluación vulnerabilidad componentes tecnológicos'},
    {id:'si46',ctrl:'Controles antimalware',q:'¿Se han implementado mecanismos de protección antimalware documentados para redes, estaciones y dispositivos?',doc:'Política antivirus; herramienta antimalware implementada'},
    {id:'si48',ctrl:'Gestión de incidentes de seguridad',q:'¿Están documentados e implementados los procedimientos/planes de gestión de incidentes de seguridad?',doc:'Política/procedimientos gestión incidentes'},
    {id:'si49',ctrl:'Detección y notificación incidentes',q:'¿Se informan los incidentes de seguridad a través de canales adecuados? ¿Se cuenta con monitoreo automático SIEM?',doc:'Proceso notificación incidentes; herramientas monitoreo; bitácora'},
  ],
  cu: [
    {id:'cu1',ctrl:'Proceso cumplimiento regulatorio',q:'¿Ejecuta la organización mecanismos de verificación periódica (auditorías internas, revisoría fiscal) para asegurar cumplimiento de obligaciones contractuales y normativas?',doc:'Manual programa cumplimiento; cronograma auditorías internas'},
    {id:'cu2',ctrl:'Matriz de cumplimiento regulatorio',q:'¿Ha identificado formalmente los requisitos legales y contractuales aplicables al servicio (SST, Datos, Ética, normativa sectorial) y los comunica al personal?',doc:'Matriz requerimientos legales; actas divulgación'},
    {id:'cu3',ctrl:'Monitoreo cumplimiento regulatorio',q:'¿Dispone de marco de políticas de SI documentado y aprobado que establezca controles para proteger confidencialidad, integridad y disponibilidad?',doc:'Informe estado cumplimiento; política general SI vigente'},
    {id:'cu4',ctrl:'SG-SST Estándares Mínimos Res.0312',q:'¿Acredita el cumplimiento de Estándares Mínimos SG-SST (Res.0312/2019) mediante certificación ARL con calificación >85%?',doc:'Certificado ARL (vigencia <30 días); actas COPASST último trimestre'},
    {id:'cu5',ctrl:'Sistema de Gestión de PQRSD',q:'¿Cuenta con mecanismo formal de registro y seguimiento que garantice respuesta oportuna de PQRSD (Ley 1755/2015, 15 días hábiles)?',doc:'Procedimiento atención PQRSD; bitácora radicación; indicadores oportunidad'},
    {id:'cu6',ctrl:'Control Aportes Seguridad Social',q:'¿Realiza validaciones mensuales para garantizar pago correcto de aportes a Seguridad Social y Parafiscales (Art.50 Ley 789)?',doc:'Certificación Revisor Fiscal o Representante Legal pagos aportes'},
    {id:'cu7',ctrl:'Sistema Integrado de Gestión (Q&E)',q:'¿Cuenta con Sistema de Gestión de Calidad y Ambiental que asegure mejora continua, cumplimiento de ANS y correcta disposición de residuos?',doc:'Evidencia control calidad servicio; PGIRS si aplica'},
    {id:'cu8',ctrl:'Organización Archivos y Cero Papel',q:'¿Aplica lineamientos de Gestión Documental y "Cero Papel", garantizando organización, digitalización, custodia y transferencia?',doc:'TRD o procedimiento archivo; política cero papel'},
  ],
  fr: [
    {id:'fr1',ctrl:'Política Antifraude y Anticorrupción (ABAC)',q:'¿Se cuenta con política de gestión del riesgo de fraude y corrupción documentada, revisada anualmente y divulgada a todas las partes interesadas?',doc:'Política Antifraude y Anticorrupción; evidencia divulgación'},
    {id:'fr2',ctrl:'Código de conducta y ética',q:'¿Se encuentra definido el código de conducta y ética con acciones disciplinarias por fraude o corrupción?',doc:'Código de conducta y ética'},
    {id:'fr3',ctrl:'Regalos, atenciones y gratificaciones',q:'¿Se encuentran definidas las atribuciones y directrices en cuanto a regalos, atenciones y gratificaciones?',doc:'Política antifraude y anticorrupción'},
    {id:'fr4',ctrl:'Donaciones y patrocinios',q:'¿Se encuentran definidas las directrices en cuanto al manejo de donaciones, contribuciones públicas, patrocinios y uso indebido de recursos?',doc:'Política antifraude y anticorrupción'},
    {id:'fr5',ctrl:'Controles compras y adquisiciones',q:'¿Se consideran controles sobre compras y adquisiciones garantizando pluralidad de proponentes y transparencia?',doc:'Manual de contrataciones y adquisiciones'},
    {id:'fr6',ctrl:'Conflicto de interés',q:'¿Se encuentran definidas directrices en cuanto al conflicto de interés en la ejecución de los procesos?',doc:'Procedimiento conflictos de interés'},
    {id:'fr7',ctrl:'Mecanismo reporte fraude y corrupción',q:'¿Cuenta con mecanismos para identificar y reportar eventos de fraude y corrupción en la organización?',doc:'Línea de denuncias'},
    {id:'fr8',ctrl:'Monitoreo eventos fraude y corrupción',q:'¿Se cuenta con mecanismos de análisis y monitoreo sobre reportes de eventos de Fraude y Corrupción (Línea ética)?',doc:'Monitoreo gestión eventos; análisis casuísticas; presentación Alta Dirección'},
    {id:'fr9',ctrl:'Programa Transparencia y Ética',q:'¿La organización cuenta con Programas de Transparencia y Ética Empresarial?',doc:'Programa de Transparencia y Ética Empresarial'},
    {id:'fr10',ctrl:'Capacitación Antifraude',q:'¿El proveedor tiene plan de capacitaciones sobre Política Antifraude y Anticorrupción? ¿Se miden los resultados?',doc:'Cronograma capacitación; planillas registro; resultado evaluaciones'},
  ],
  lf: [
    {id:'lf1',ctrl:'Sistema Prevención LAFT',q:'¿La entidad cuenta con un Sistema de Prevención de Riesgo de LA/FT con lineamientos para prevenir/mitigar el riesgo?',doc:'Políticas y/o manual del sistema LA/FT'},
    {id:'lf2',ctrl:'Consulta listas ONU/OFAC',q:'¿Se cuenta con procedimientos de seguimiento a listas ONU y OFAC? ¿Se cuenta con herramienta tecnológica de consulta de listas?',doc:'Procedimiento seguimiento listas ONU y OFAC'},
    {id:'lf3',ctrl:'Debida diligencia contrapartes',q:'¿La empresa cuenta con procedimientos de conocimiento de contrapartes incluidas cuartas partes?',doc:'Procedimientos establecidos'},
    {id:'lf4',ctrl:'Capacitación LAFT',q:'¿El proveedor tiene plan de capacitaciones de LAFT del año en curso? ¿Se miden los resultados?',doc:'Cronograma capacitación; planillas registro; resultado evaluaciones'},
    {id:'lf5',ctrl:'Identificación y medición riesgo LAFT',q:'¿La empresa cuenta con matriz u otro instrumento de identificación, medición, segmentación y evaluación del riesgo LA/FT?',doc:'Matriz riesgos y controles LA/FT por factores de riesgo'},
    {id:'lf6',ctrl:'Monitoreo operaciones inusuales',q:'¿El sistema de prevención LA/FT implementado permite identificar operaciones inusuales y sospechosas?',doc:'Mecanismos de reporte o informes'},
  ],
  pa: [
    {id:'pa1',ctrl:'Metodología gestión riesgo país',q:'¿Se cuenta con metodología de gestión de riesgo país actualizada que considere entorno legal, regulatorio, geopolítico, social y económico?',doc:'Políticas y procedimientos para gestión de riesgo país'},
    {id:'pa2',ctrl:'Monitoreo riesgos país',q:'¿Se cuenta con indicadores descriptivos y/o cuantitativos para identificar fuentes de riesgos país y generar alertas?',doc:'Informes seguimiento riesgo país; notificaciones inestabilidad; planes tratamiento'},
    {id:'pa3',ctrl:'Regulaciones protección de datos',q:'¿Se tienen identificadas las regulaciones de protección de datos en el país y se realiza monitoreo al cumplimiento?',doc:'Identificación regulaciones protección datos; informe acciones y monitoreo'},
  ],
  fi: [
    {id:'fi1',ctrl:'Metodología gestión riesgo financiero',q:'¿Se cuenta con metodología de gestión de riesgo financiero que considere liquidez, endeudamiento, ROA y ROE del servicio?',doc:'Políticas/manual metodología gestión riesgo financiero; evidencia gestión'},
    {id:'fi2',ctrl:'Indicadores financieros y alertas',q:'¿Se cuenta con indicadores financieros (Liquidez, Endeudamiento, ROA, ROE) revisados periódicamente para identificar cambios?',doc:'Informes seguimiento riesgos financieros; análisis, acciones y decisiones'},
  ]
};

function buildControls(dim, containerId){
  const data = CUEST_DATA[dim];
  if(!data) return;
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = data.map((c,i) => `
    <div style="background:var(--gray3);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;">
      <div style="font-size:12px;font-weight:700;color:var(--navy);margin-bottom:4px;">${i+1}. ${c.ctrl}</div>
      <div style="font-size:12px;color:var(--text);margin-bottom:6px;">${c.q}</div>
      <div style="font-size:10.5px;color:var(--muted);margin-bottom:8px;">📎 Doc soporte: ${c.doc}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr) 1fr 1fr 1fr;gap:6px;align-items:center;">
        ${['1. ¿Implementado?','2. ¿Documentado?','3. ¿Asignado?','4. ¿Divulgado?','5. ¿Evidencia?','6. ¿Monitoreado?'].map((lbl,j) => `
          <div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:3px;">${lbl}</div>
            <select id="q-${c.id}-a${j+1}" onchange="updateQScore('${dim}')" style="width:100%;padding:4px 6px;border:1px solid var(--border2);border-radius:4px;font-size:11.5px;font-family:inherit;">
              <option value="">—</option><option value="si">Sí</option><option value="no">No</option><option value="na">N/A</option>
            </select>
          </div>`).join('')}
      </div>
      <div style="margin-top:8px;">
        <textarea id="q-${c.id}-obs" rows="1" placeholder="Observaciones / Conclusión..." style="width:100%;padding:5px 8px;border:1px solid var(--border2);border-radius:4px;font-size:11.5px;font-family:inherit;resize:vertical;"></textarea>
      </div>
    </div>`).join('');
}

function buildAllCuestionarios(){
  Object.keys(CUEST_DATA).forEach(dim => {
    buildControls(dim, `q-${dim}-controls`);
  });
  // Also build pa section if exists
  if(CUESTIONARIO_CONTROLES.pa){
    buildControls('pa', 'q-pa-controls');
  }
}

function updateQScore(dim){
  const data = CUEST_DATA[dim];
  let answered = 0, total = data.length;
  data.forEach(c => {
    const a1 = document.getElementById(`q-${c.id}-a1`);
    if(a1 && a1.value !== '') answered++;
  });
  const scoreEl = document.getElementById(`score-${dim}`);
  if(scoreEl){
    const pct = Math.round((answered/total)*100);
    scoreEl.textContent = `${answered}/${total} (${pct}%)`;
    scoreEl.style.color = pct===100 ? 'var(--green)' : pct>50 ? 'var(--orange)' : 'var(--muted)';
  }
}

// ─── REGISTRO DE TERCEROS CON PROM >= 3 ──────────────
// Se llena cuando saveClasifForm guarda un registro
var tercerosPendientesCuestionario = []; window.tercerosPendientesCuestionario = tercerosPendientesCuestionario;
// [{nit, nombre, entidad, prom, zona, periodicidad, tipologias:[{key,nombre}]}]

// Mapa key → data-tipologia del acordeón
const KEY_SECCION = {
  'op':'op','cn':'cn','si':'si','cu':'cu','fr':'fr','laft':'laft'
};

function registrarTerceroPendiente(nit, nombre, entidad, prom, zona, periodicidad, tipologias){
  tercerosPendientesCuestionario = tercerosPendientesCuestionario.filter(t=>t.nit!==nit);
  if(parseFloat(prom) >= 3){
    // Normalizar entidad a minúsculas para comparación consistente
    const entidadNorm = (entidad||'').toLowerCase().replace(/\s+/g,'');
    tercerosPendientesCuestionario.push({ nit, nombre, entidad: entidadNorm, entidadLabel: entidad, prom, zona, periodicidad, tipologias });
  }
  actualizarSelectorCuestionario();
}

function actualizarSelectorCuestionario(){
  // Delegate to the new unified sync function
  try{ sincronizarSelectorCuestionario(); }catch(e){}
  return;
  // Legacy code below (unreachable — kept for safety):
  const sel = document.getElementById('q-tercero');
  if(!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">— Selecciona un tercero —</option>';

  const esCliente = currentUser?.rol === 'Cliente';
  const entidadUser = (currentUser?.entidad||'').toLowerCase().replace(/\s+/g,'');

  const pendientes = esCliente
    ? tercerosPendientesCuestionario.filter(t => t.entidad === entidadUser || t.entidadLabel?.toLowerCase().includes(entidadUser))
    : tercerosPendientesCuestionario;

  const sinPend = document.getElementById('q-sin-pendientes');
  if(!pendientes.length){
    if(sinPend) sinPend.style.display='block';
    const wrap = document.getElementById('q-secciones-wrap');
    if(wrap) wrap.style.display='none';
    const footer = document.getElementById('q-footer');
    if(footer) footer.style.display='none';
    return;
  }
  if(sinPend) sinPend.style.display='none';
  const wrap2 = document.getElementById('q-secciones-wrap');
  if(wrap2) wrap2.style.display='block';

  pendientes.forEach(t=>{
    const opt = document.createElement('option');
    opt.value = t.nit;
    const zonaLabel = parseFloat(t.prom)>=4 ? 'EXTREMO' : 'ALTO';
    opt.textContent = `${t.nombre} — NIT: ${t.nit} — Prom: ${parseFloat(t.prom).toFixed(2)} (${zonaLabel})`;
    sel.appendChild(opt);
  });

  // Restaurar selección previa si sigue existiendo
  if(prev && pendientes.find(t=>t.nit===prev)) sel.value = prev;
}


// ─── CONTROLES REALES DEL CUESTIONARIO (Excel V3) ────
// 6 atributos por control: implementado, documentado, asignado, divulgado, evidencia, monitoreo, eficaz

const CUESTIONARIO_CONTROLES = {
  "op": [
    {
      "n": 1,
      "ctrl": "Identificación de riesgos",
      "req": "¿Se cuenta con una metodología de identificación de riesgos operacionales(potenciales y ocurridos) asociados a cada una de las actividades de los procesos requeridos para la prestación del servicio a la organización?",
      "doc": "1. Matriz de riesgo o documento identificando los riesgos operacionales que se pueden materializar en el flujo de actividades para el logro de la prestación del servicio a la organización",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 2,
      "ctrl": "Medición de la probabilidad de ocurrencia de los riesgos operacionales y su impacto.",
      "req": "¿Se cuenta con el perfil de riesgo inherente de los procesos usados para la prestación del servicio a la organización, considerando factores cualitativos y/o cuantitativos en la metodología de medición?",
      "doc": "1. Perfil de riesgo inherente de las actividades asociadas a los procesos usados para la prestación del servicio con la organización 2. Definición de factores cualitativos y/o cuantitativos para la medición del riesgo",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 3,
      "ctrl": "Medidas para controlar los riesgos inherentes.",
      "req": "¿Se tiene identificados los controles, y la medición del perfil de riesgo residual para las actividades de los procesos usados en la prestación del servicio?",
      "doc": "1. Documento con los controles implementados para la mitigación de los riesgos identificados en la prestación del servicio para la organización. 2. Perfil de riesgo residual de los riesgos identificados y gestionados en la prestación del servicio. 3. Estrategias implementadas que responden al tratamiento de los riesgos (aceptación, eliminación, transferencia) ubicados fuera del apetito de riesgo definido por la organización.",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 4,
      "ctrl": "Monitoreo periódico del perfil de riesgo y de la exposición a pérdidas.",
      "req": "¿Se cuenta con actividades para el monitoreo y seguimiento al perfil de riesgo residual y sus controles?",
      "doc": "1. Documento donde se observe las actividades efectuadas de monitoreo y seguimiento a los planes de acción, riesgos residuales y controles.",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 5,
      "ctrl": "Registros de Eventos operacionales",
      "req": "¿Se cuenta con un procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo materializados en la prestación del servicio a la organización.",
      "doc": "1. Documento con el procedimiento para el reporte, registro, monitoreo y seguimiento de eventos de riesgo operacional. 2. Bitácora con el registro de eventos ocurridos durante la prestación del servicio a la organización. 3. Reporte a la organización de lecciones aprendidas y acciones implementadas .",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 6,
      "ctrl": "Registros de Eventos operacionales",
      "req": "¿Se cuenta con protocolo de comunicación con la organización ante la identificación de eventos de riesgo, que impacten o puedan impactar el servicio contratado?",
      "doc": "1. Protocolo de comunicación. 2. Canales de comunicación definidos. 3. Divulgación del protocolo y canales de comunicación a los colaboradores que participan en la prestación del servicio a la organización.",
      "domain": "Gestión del riesgo"
    },
    {
      "n": 7,
      "ctrl": "Planes de capacitación sobre el sistema de gestión de riesgo",
      "req": "¿Se cuenta con un plan de capacitación que considere la gestión de los riesgos operacionales a los funcionarios que participan en la prestación del servicio a la organización? ¿Son Medidos los resultados de las capacitaciones?",
      "doc": "1. Plan o cronograma de capacitación a los funcionarios sobre la prestación del servicio a la organización, los riesgos que se pueden materializar y los controles para la mitigación de los escenarios de riesgo identificados. 2. Bitácora de registro de las capacitaciones impartidas. 3. Resultado de las evaluaciones de capacitación.",
      "domain": "Capacitación"
    },
    {
      "n": 8,
      "ctrl": "Diligencia de cuarta parte",
      "req": "¿Los acuerdos contractuales con las cuartas partes incluyen los requisitos de control definidos por la organización? '¿Se realizan evaluaciones de riesgos antes de la incorporación de terceros en la prestación del servicio a la organización?",
      "doc": "1. Listado de cuartas partes involucradas en la prestación del servicio. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las cuartas partes. 3. Clausulas contractuales con las cuartas partes que incluyan los requisitos de control definidos por la organización 4. Riesgos identificados y gestionados por las cuartas partes que afecten la prestación del servicio a la organización.",
      "domain": "Gestión de cuartas partes"
    }
  ],
  "cn": [
    {
      "n": 1,
      "ctrl": "Programa de gestión de la continuidad del negocio (BCM)",
      "req": "¿Tienen un Plan de continuidad del negocio actualizado?",
      "doc": "1. Plan de continuidad del negocio",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 2,
      "ctrl": "Programa de gestión de la continuidad del negocio (BCM)",
      "req": "¿Dentro de la matriz de riesgos, se encuentran identificados, y analizados los riesgos que afectan la continuidad del negocio para los servicios contratos por la organización?",
      "doc": "1. Matriz de riesgos con la identificación, análisis y evaluación de los riesgos de continuidad de negocio que pueden afectar la prestación del servicio a la organización.",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 3,
      "ctrl": "Programa de gestión de la continuidad del negocio (BCM)",
      "req": "¿Tienen un plan de contingencia donde se incluyan los servicios contratados por la organización ?",
      "doc": "1. Plan de contingencia asociado a la prestación del servicio que contemple: . - Actividades de preparación - Actividades durante la contingencia - Actividades de retorno a la normalidad",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 4,
      "ctrl": "Programa de gestión de la continuidad del negocio (BCM)",
      "req": "¿Tienen un plan de administración de crisis? ¿El plan de administración de Crisis contempla: * Alcance organizacional (procesos, sedes, servicios críticos). * Tipos de crisis cubiertas (ciberataques, incidentes operativos, legales, reputacionales, sanitarios, desastres naturales, Otros). * Interlocutores por tipo de Crisis?",
      "doc": "1. Plan de administración de crisis",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 5,
      "ctrl": "Programa de gestión de la continuidad del negocio (BCM)",
      "req": "¿ Tienen establecido un plan de recuperación de desastres (DRP)?",
      "doc": "1. Plan de recuperación de desastres (DRP) 2. Procedimientos de recuperación para los servicios tecnológicos y/o sistemas de información que soportan la operación del servicio a la organización.",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 6,
      "ctrl": "Análisis de impacto al negocio (BIA)",
      "req": "¿Dentro del análisis de impacto BIA, incluyen los servicios contratados por la organización? ¿para los servicios contratadas por la organización se encuentran identificados los RTO Y RPO? ¿los RTO y RPO identificados se encuentran alineados con los establecidos por la organización en los proceso que soporta? ¿Dentro de la BIA, identifican el personal mínimo que garantice la operación de los servicios contratados por la organización? ¿Dentro de la BIA se contemplan los activos necesarios que garanticen la operación de los servicios contratados por la organización?",
      "doc": "1. Análisis de impacto del negocio ( BIA), con la definición de: - Actividades criticas asociadas a la prestación del servicio - RTO y RPO - Personal mínimo requerido para la continuidad del servicio durante una contingencia. - Recursos mínimos necesario para dar continuidad a la prestación del servicio durante una contingencia. (equipos de computo, puestos de trabajo, ubicaciones alternas de operación, impresoras, archivadores, entre otros) - Servicios de TI y/o sistemas de información requeridos en una contingencia para operar el servicio prestado a la organización.",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 7,
      "ctrl": "Pruebas al plan de continuidad de negocio",
      "req": "¿Entregaron el cronograma de las pruebas de continuidad de acuerdo a las obligaciones contractuales? ¿se realizaron las pruebas y ejercicios para evaluar la eficacia de las estrategias de continuidad de la organización según el alcance definido? ¿el tercero realizo y envió el respectivo informe de los resultados de las pruebas de continuidad realizadas? ¿dentro del desarrollo de las pruebas de continuidad realizadas, se incluyo escenarios en donde se validen los servicios contratados por parte de la organización? ¿Se encuentra alineado el resultado de las pruebas, con la promesa de servicio que el proveedor tiene con la organización a nivel de recuperación ante incidentes que se presenten y con los ANS ¿El proveedor participa en las pruebas que programa la organización dentro de las actividades se Continuidad del Negocio?",
      "doc": "1. Cronograma de pruebas a acorde con las obligaciones contractuales. 2. Informe de resultados de las pruebas ejecutadas 3. Envió del correo de socialización de las pruebas a la organización. 4. Informe de resultados de las pruebas ejecutadas en alineación con la programación de pruebas PCN de la organización.",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 8,
      "ctrl": "Centro de datos",
      "req": "El proveedor cuenta con un centro de datos principal y un centro de datos alterno debidamente implementado y operando, acorde con las necesidades del servicio y actividades contratadas con la organización? 'El Centro de Datos Alterno con que cuenta el proveedor está definido para activarse acorde con los RTO requeridos por la organización (4 horas)? 'El Proveedor cuenta con un Plan de recuperación de Desastres (DRP) , alineado al servicio y actividades contratadas por la organización, con detalle de las actividades de contingencia tecnológicas que permiten activarlo y operar ante una indisponibilidad que se le presente al proveedor en su centro de datos principal? ¿ El TIER implementado en los centros de datos principal y alterno están en nivel III o IV?",
      "doc": "1. Documento Certificación del Plan de Recuperación de Desastres que incluya la implementación de los CDP y CDA y alineado a los servicios y actividades contratados con la organización. 2. Planes de recuperación tecnológica, alineados a los servicios y actividades contratados con la organización. 3. Para los centros de datos tercerizadas suministrar la certificación SOC2 de los controles evaluados 4. Ultimo informe de auditoria realizado sobre los controles de seguridad física, lógica y ambiental del centro de datos (Tanto Propio como del tercero en caso de que aplique). 5. Documento Certificación del Plan de Recuperación de Desastres debidamente implementado y operando acorde con los servicios y actividades contratadas con la organización. 6. Documento certificación del TIER implementado.",
      "domain": "Gestión de crisis y continuidad del negocio"
    },
    {
      "n": 9,
      "ctrl": "Plan de capacitaciones",
      "req": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con el plan de continuidad del negocio (PCN)? ¿Son Medidos los resultados de las capacitaciones?",
      "doc": "1. Documento con el plan o cronograma de capacitación. 2. Documento donde se relaciones las personas capacitadas. 3. Resultado de las evaluaciones de capacitación.",
      "domain": "Gestión de crisis y continuidad del negocio"
    }
  ],
  "si": [
    {
      "n": 1,
      "ctrl": "Política y procedimientos de seguridad de la información",
      "req": "¿Las políticas, procedimientos y estándares de seguridad de la información están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - comunicadas a todas las partes interesadas relevantes?",
      "doc": "1. Documentos de normas y políticas de seguridad de la información con resumen de revisión y aprobación 2. Comunicación por correo electrónico de políticas y normas a todas las partes interesadas pertinentes",
      "domain": "Gobierno y organización de seguridad"
    },
    {
      "n": 2,
      "ctrl": "Roles, responsabilidades y segregación de funciones de seguridad de la información",
      "req": "¿Se definen y documentan formalmente los roles y responsabilidades sobre la gestión de la seguridad de la información? ¿Las responsabilidades en conflicto están segregadas entre diferentes roles?",
      "doc": "1. Estructura de gobierno de la seguridad de la información 2. Documento de roles y responsabilidades para todos roles de la estructura de gobierno de seguridad",
      "domain": "Gobierno y organización de seguridad"
    },
    {
      "n": 3,
      "ctrl": "Marco y política de gestión de riesgos",
      "req": "¿Existe una política y un modelo formal de gestión de riesgos de seguridad, revisado y actualizado periódicamente y comunicado a todas las partes interesadas? ¿Contempla seguridad sobre la información y los componentes tecnológicos que soportan el servicio prestado a la organización, que considere identificación de amenazas, vulnerabilidades y controles de seguridad?",
      "doc": "1. Política de gestión de riesgos de seguridad 2. Modelo de gestión de riesgos de seguridad 3. Matriz de riesgos de seguridad sobre activos de información, con vulnerabilidades, amenazas, valoración de probabilidad e impacto, identificación y valoración de controles. 4. Planes de tratamiento de riesgo residual sobre los componentes tecnológicos de soportes a la organización 5. Seguimiento del plan de tratamiento de riesgos",
      "domain": "Gestión de riesgos"
    },
    {
      "n": 4,
      "ctrl": "Evaluación previa a la contratación",
      "req": "¿Se realizan estudios de seguridad previo a la contratación de los empleados que tendrán acceso a la información del servicio prestado a la organización?",
      "doc": "1. Políticas de análisis de estudios de seguridad previo a la contratación",
      "domain": "Seguridad del recurso humano"
    },
    {
      "n": 5,
      "ctrl": "Términos y condiciones de contratación",
      "req": "¿Los contratos de trabajo consideran las responsabilidades relacionadas con la seguridad de la información a la que tendrán acceso los empleados?",
      "doc": "1. Clausulas de los contratos en materia de seguridad de la información. 2. Listado de empleados que han firmado los términos y condiciones de empleo con respecto a la seguridad de la información",
      "domain": "Seguridad del recurso humano"
    },
    {
      "n": 6,
      "ctrl": "Proceso disciplinario por violaciones a la seguridad",
      "req": "¿Existe un proceso disciplinario formalmente documentado, revisado, actualizado y comunicado en relación a la violación del cumplimiento de las directrices de seguridad por parte de los empleados y subcontratistas (cuando corresponda)?",
      "doc": "1. Política / proceso disciplinario con respecto a la violación de la seguridad / privacidad y el uso indebido de la información 2. Evidencia de comunicación (correo electrónico, instantánea del portal electrónico) para hacer circular la política / proceso disciplinario a todos los empleados",
      "domain": "Seguridad del recurso humano"
    },
    {
      "n": 7,
      "ctrl": "Capacitación y cultura en seguridad de la información",
      "req": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con cultura de seguridad de la información para empleados y subcontratistas? ¿Son Medidos los resultados de las capacitaciones?",
      "doc": "1. Calendario del programa de cultura de seguridad 2. Registros de capacitación 3. Resultado de las evaluaciones de capacitación.",
      "domain": "Seguridad del recurso humano"
    },
    {
      "n": 8,
      "ctrl": "Terminación o cambio de responsabilidades laborales",
      "req": "¿Se recuperan / eliminan todos los activos / derechos de acceso de los empleados que han renunciado, transferido, rescindido o al finalizar el contrato?",
      "doc": "1. Proceso de retiro de accesos y devolución de información en la terminación de la contratación",
      "domain": "Seguridad del recurso humano"
    },
    {
      "n": 9,
      "ctrl": "Inventario, clasificación y etiquetado de activos de información",
      "req": "¿Se mantienen los inventarios de activos de información involucrados en la prestación del servicio a la organización?¿Esto incluye activos de información físicos, digitales y electrónicos? '¿Todos los activos de información se encuentran clasificados en sus tres características y etiquetados según su clasificación?",
      "doc": "1. Inventario de activos de información clasificados y valorados en los atributos de confidencialidad, integridad y disponibilidad 2. Política de etiquetado de los activos de información",
      "domain": "Gestión de activos"
    },
    {
      "n": 10,
      "ctrl": "Política de uso aceptable",
      "req": "¿La política de uso aceptable de la información está formalmente documentada, revisada y actualizada anualmente? ¿La política de uso aceptable es aceptada por todos los empleados y subcontratistas cuando corresponda?",
      "doc": "1. Política de uso aceptable 2. Reconocimiento / seguimiento de aceptación de la política de uso aceptable por parte de los empleados",
      "domain": "Gestión de activos"
    },
    {
      "n": 11,
      "ctrl": "Eliminación de medios y disposición final de información",
      "req": "¿Están documentados, actualizados e implementados los procedimientos para la sanitización y destrucción de medios en des huso?",
      "doc": "1. Procedimiento de eliminación segura de la información",
      "domain": "Gestión de activos"
    },
    {
      "n": 12,
      "ctrl": "Administración de cuentas de acceso",
      "req": "¿Se cuenta con un proceso de gestión de acceso lógico para otorgar / modificar y revocar el acceso del usuario a los sistemas y servicios de información con las siguientes consideraciones: - Cuenta única para cada usuario según la convención de nomenclatura - Los ID compartidos (si es necesario) están documentados y aprobados por los equipos de seguridad - Acceso en función de la matriz de control de acceso definida por el responsable del activo - Autorizaciones del jefe inmediato para la asignación de los permisos solicitados - Separación adecuada de funciones para los roles de los usuarios según los conflictos de interés. - Eliminación inmediata después del retiro de los empleados o terceros - Registros de autorizaciones para usuarios registrados y rechazados?",
      "doc": "1. Proceso de administración de cuentas de acceso",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 13,
      "ctrl": "Revisión de acceso de usuario",
      "req": "¿Se realiza una revisión anual (al menos) del acceso de los usuarios configurado en los sistemas de información usados para la prestación del servicio?",
      "doc": "1. Proceso de certificación de accesos",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 14,
      "ctrl": "Gestión de contraseñas",
      "req": "¿Se han implementado sistemas de administración de contraseñas que consideren: - Complejidad de la contraseña - Caducidad o antigüedad de la contraseña - Intentos de inicio de sesión fallidos - Tiempos de espera de sesión - Historial de contraseñas - Cifrado de contraseña - Grabación y transmisión de contraseñas - Las contraseñas deben asignarse mediante un proceso de gestión formal y los destinatarios deben cambiarlas después del primer inicio de sesión.?",
      "doc": "1. Documentación de la política de contraseñas",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 15,
      "ctrl": "Acceso a código fuente",
      "req": "¿El código fuente está protegido para - Evitar el almacenamiento de bibliotecas de fuentes de programas en sistemas locales - Restringir el acceso al personal de desarrollo designado - Separar el código fuente en desarrollo de los programas que están en producción - Archivar periódicamente versiones anteriores de código?",
      "doc": "1. Política de control de acceso a código fuente",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 16,
      "ctrl": "Autenticación de usuario para conexiones externas y remotas",
      "req": "¿Se definen e implementan directrices para asegurar el acceso remoto? ¿Con la contingencia actual como se está realizando el trabajo para la ejecución de actividades relacionados con la prestación del servicio de la organización? ¿Qué controles adicionales se han considerado para el trabajo remoto con la contingencia?",
      "doc": "1. Documento de políticas de acceso remoto 2. Tipo de tecnología utilizadas para el acceso remoto",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 17,
      "ctrl": "Seguridad de acceso inalámbrico",
      "req": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso inalámbrico? ¿El acceso a las redes inalámbricas está restringido solo a personas autorizadas?",
      "doc": "1. Pautas de uso de la red inalámbrica",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 18,
      "ctrl": "Control de acceso para dispositivos móviles",
      "req": "¿Existen restricciones y pautas de uso documentadas formalmente para el acceso a dispositivos móviles?",
      "doc": "1. Pautas de uso de dispositivos móviles",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 19,
      "ctrl": "Gestión de dispositivo Propio (BYOD)",
      "req": "¿Existen restricciones y pautas de uso de dispositivos personales en la prestación del servicio?",
      "doc": "1, Política de \"Trae tu Propio Dispositivo\" (BYOD)",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 20,
      "ctrl": "Gestión de cuentas de acceso privilegiado",
      "req": "¿Se autoriza y supervisa la asignación y el uso de cuentas de acceso privilegiado?",
      "doc": "1. Políticas de asignación y uso de cuentas de acceso privilegiado (cuentas de administración) 2. Matriz o herramienta de control para la asignación de cuentas de acceso privilegiado.",
      "domain": "Gestión de identidad y acceso"
    },
    {
      "n": 21,
      "ctrl": "Controles de seguridad física",
      "req": "¿Existen e implementan políticas y procedimientos de seguridad física formalmente documentados?",
      "doc": "1. Políticas de mecanismos de control de seguridad física sobre las zonas de procesamiento de información",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 22,
      "ctrl": "Restricción de acceso a áreas seguras de trabajo y / o entrega",
      "req": "¿SE cuenta con un perímetros de seguridad (barreras tales como paredes, puertas de entrada controladas por tarjeta o mostradores de recepción con personal) para proteger las áreas de trabajo?",
      "doc": "1. Lista de controles de seguridad física aplicados 2. Proceso de acceso de visitantes como credenciales, sistemas, registros, etc.",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 23,
      "ctrl": "Restricción de acceso a áreas seguras de trabajo y / o entrega",
      "req": "¿El acceso a las instalaciones dedicadas al procesamiento de información está restringido físicamente solo al personal autorizado?",
      "doc": "1. Listado de instalaciones de procesamiento de información necesaria para la prestación del servicio",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 24,
      "ctrl": "Restricción de acceso a áreas seguras de trabajo y / o entrega",
      "req": "¿Se cuenta con circuito cerrado de televisión (CCTV) para monitorear las instalaciones las 24 horas del día, los 7 días de la semana? ¿Conserva la cobertura de las imágenes de CCTV durante al menos 3 meses?",
      "doc": "1. Política de monitoreo bajo CCTV - Ubicación de las cámaras en las instalaciones donde se procesa información y que hace parte de la prestación del servicio a la organización. - Tiempo de retención de las grabaciones",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 25,
      "ctrl": "Controles de seguridad ambiental",
      "req": "¿Existen sistemas de detección de incendios e inundación para minimizar el daño a la información y las instalaciones?",
      "doc": "1. Documento del proceso de respuesta a eventos de incendio e inundación 2. Informes de pruebas en los mecanismos de detección de incendio e inundación",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 26,
      "ctrl": "Protección y mantenimiento de equipos",
      "req": "¿Están los sistemas de información críticos protegidos por dispositivos de suministro de energía ininterrumpida (UPS)?",
      "doc": "1. Informes de mantenimiento preventivo del generador de respaldo y de las UPS.",
      "domain": "Infraestructura / Seguridad física"
    },
    {
      "n": 27,
      "ctrl": "Control de acceso a la red",
      "req": "¿Existen y se encuentran implementados políticas y procedimientos de seguridad en la de red de datos?",
      "doc": "1. Directrices de control de acceso a la red",
      "domain": "Seguridad de la red"
    },
    {
      "n": 28,
      "ctrl": "Seguridad de la red y los servicios de red",
      "req": "¿La red está segmentada y segregada física / lógicamente?",
      "doc": "1. Diagrama de red donde se encuentran los componentes tecnológicos requeridos para la prestación del servicio a la organización.",
      "domain": "Seguridad de la red"
    },
    {
      "n": 29,
      "ctrl": "Seguridad de la red y los servicios de red",
      "req": "¿Se cuenta con firewalls en todas las conexiones con redes externas o DMZ?",
      "doc": "1. Diagrama de topología de red que indique los firewalls instalados 2. Documento de directrices de configuración del firewall",
      "domain": "Seguridad de la red"
    },
    {
      "n": 30,
      "ctrl": "Seguridad de la red y los servicios de red",
      "req": "¿Realiza periódicamente pruebas de penetración sobre la infraestructura tecnológica?",
      "doc": "1. Informes de evaluación de intrusión realizadas sobre los sistemas de información que soportan el servicio a la organización 2. Cronograma de pruebas de penetración y alcance definido para cada una.",
      "domain": "Seguridad de la red"
    },
    {
      "n": 31,
      "ctrl": "Requisitos y especificaciones de seguridad de la información",
      "req": "¿Se definen y cumplen los requisitos de seguridad de la información para la adquisición de nuevos productos, proyectos de desarrollo?",
      "doc": "1. Especificaciones de los requisitos de seguridad de la información para nuevos sistemas de información 2. Pautas de desarrollo seguro",
      "domain": "Seguridad de las aplicaciones"
    },
    {
      "n": 32,
      "ctrl": "Pruebas de aceptación y seguridad de la aplicación",
      "req": "¿Se realizan pruebas de aceptación y seguridad del sistema durante el desarrollo y antes de la implementación?",
      "doc": "1. Política de pruebas de seguridad y criterios de aceptación 2. Política de revisión de código seguro para aplicaciones",
      "domain": "Seguridad de las aplicaciones"
    },
    {
      "n": 33,
      "ctrl": "Instalación y configuración",
      "req": "¿Cuenta con un procedimiento formal para la instalación y configuración segura (hardening) mediante guías aceptadas por la industria para los componentes de infraestructura y sistemas de información usados en la prestación del servicio?",
      "doc": "1. Procedimiento de instalación y configuración segura de los diferentes componentes de infraestructura y sistemas de información 2. Líneas base de aseguramiento",
      "domain": "Seguridad de las aplicaciones"
    },
    {
      "n": 34,
      "ctrl": "Mensajería electrónica",
      "req": "¿Se definen, revisan y comunican las directrices para el uso seguro de la mensajería electrónica, que consideren la restricción y protección de los datos transferidos, incluidos los archivos adjuntos?",
      "doc": "1. Directrices de mensajería electrónica",
      "domain": "Protección de Datos"
    },
    {
      "n": 35,
      "ctrl": "Fuga de información",
      "req": "¿Se implementan mecanismos para evitar la fuga de datos a través de una solución DLP adecuada, restricción de correo electrónico y proxy web?",
      "doc": "1. Arquitectura / Configuración y reglas de los mecanismos de DLP",
      "domain": "Protección de Datos"
    },
    {
      "n": 36,
      "ctrl": "Filtrado web",
      "req": "¿Se cuenta con mecanismos para el filtrado de navegación?",
      "doc": "1. Políticas de filtrado Web 2. Herramienta para el filtrado Web",
      "domain": "Protección de Datos"
    },
    {
      "n": 37,
      "ctrl": "Gestión de medios extraíbles",
      "req": "¿Los medios extraíbles están restringidos en la organización y el uso se permite solo para requisitos específicos a través de aprobaciones formales?",
      "doc": "1. Política de uso de medios extraíbles",
      "domain": "Protección de Datos"
    },
    {
      "n": 38,
      "ctrl": "Seguridad para entornos de nube",
      "req": "¿Se han identificado, documentado, implementado e incluido los requisitos de seguridad de la información en los acuerdos para el uso de servicios de nube?",
      "doc": "1. Requisitos de seguridad para el procesamiento de servicios en la nube",
      "domain": "Protección de Datos"
    },
    {
      "n": 39,
      "ctrl": "Uso y regulación de controles criptográficos",
      "req": "¿Se ha desarrollado e implementado políticas sobre el uso de controles criptográficos?",
      "doc": "1. Norma o política de criptografía 2. Técnicas criptográficas que se utilizan",
      "domain": "Protección de Datos"
    },
    {
      "n": 40,
      "ctrl": "Copias de seguridad",
      "req": "¿Se han definido políticas / procedimientos formales de respaldo y restauración? ¿Se prueban los datos respaldados de forma regular?",
      "doc": "1. Política / procedimiento de copia de seguridad y restauración 2. Registros de configuración de respaldos realizados sobre la información usada para la prestación del servicio 3. Evidencia de pruebas de restauración y funcionalidad de los datos (en el último año)",
      "domain": "Protección de Datos"
    },
    {
      "n": 41,
      "ctrl": "Política de privacidad de datos",
      "req": "¿Existe una política / estándar de privacidad de datos formalmente documentado que cubra la recopilación, uso, retención, eliminación y seguridad de la información personal de acuerdo con las disposiciones de las ley 1581 y demás decretos reglamentarios aplicables?",
      "doc": "1. Norma y política de privacidad de datos 2. Revisión y aprobación del departamento legal sobre las leyes, reglamentos y normas de privacidad identificadas 3. Inventarios de bases de datos con información de identificación personal",
      "domain": "Privacidad de datos personales"
    },
    {
      "n": 42,
      "ctrl": "Procedimientos de control de cambios",
      "req": "¿Se cuenta con un procedimiento de gestión de cambios documentado formalmente, que considere (como mínimo) lo siguiente: - Identificación y registro de los cambios - Evaluación de impacto potencial - Autorización, prueba y aprobación",
      "doc": "1. Procedimientos de gestión de cambios 2. Bitácora o herramienta donde se lleva la trazabilidad de la gestión del control de cambios",
      "domain": "Operaciones de seguridad"
    },
    {
      "n": 43,
      "ctrl": "Sincronización de reloj",
      "req": "¿Están sincronizados los relojes de todos los sistemas de información relevantes dentro de la organización con una fuente válida?",
      "doc": "1. Lista de servidores NTP implementados en el entorno, junto con la descripción de la fuente de tiempo",
      "domain": "Operaciones de seguridad"
    },
    {
      "n": 44,
      "ctrl": "Gestión de vulnerabilidades técnicas",
      "req": "¿Se realizan pruebas de vulnerabilidad periódicamente sobre todos los componentes que intervienen en la prestación del servicio a la organización, considerando sistemas operativos, bases de datos, dispositivos de red?",
      "doc": "1. Informes de evaluación de vulnerabilidad de los componentes tecnológicos que hacen parte de la prestación del servicio",
      "domain": "Operaciones de seguridad"
    },
    {
      "n": 45,
      "ctrl": "Gestión de vulnerabilidades técnicas",
      "req": "¿Están todos los sistemas de información y componentes tecnológicos actualizados con los últimos parches de seguridad?",
      "doc": "1. Informe periódico de gestión de parches para sistemas / componentes",
      "domain": "Operaciones de seguridad"
    },
    {
      "n": 46,
      "ctrl": "Controles contra malware",
      "req": "¿Se han implementado mecanismos de protección antimalware formalmente documentados para redes, estaciones de trabajo, computadoras portátiles y otros dispositivos?",
      "doc": "1. Política de antivirus y software antimalware instalado en estaciones de trabajo. 2. Herramienta antimalware implementada",
      "domain": "Operaciones de seguridad"
    },
    {
      "n": 47,
      "ctrl": "Inteligencia sobre amenazas",
      "req": "¿Están documentados e implementados los procedimientos para realizar analítica de amenazas?",
      "doc": "1. Procedimiento de analítica de amenazas 2. Informe de analítica de amenazas",
      "domain": "Gestión de incidentes y problemas"
    },
    {
      "n": 48,
      "ctrl": "Responsabilidades y procedimientos de gestión de incidentes",
      "req": "¿Están documentados e implementados los procedimientos / planes de gestión de incidentes de seguridad de la información?",
      "doc": "1. Política / procedimientos de gestión de incidentes",
      "domain": "Gestión de incidentes y problemas"
    },
    {
      "n": 49,
      "ctrl": "Detección y notificación de incidentes",
      "req": "¿Se informan los incidentes / violaciones de seguridad de la información a través de los canales de gestión adecuados y según el proceso definido? ¿Se cuenta con mecanismos de monitoreo automático sobre los registros de actividad de los usuarios en los sistemas de información (log de eventos)?",
      "doc": "1. Proceso de notificación de incidentes / eventos relacionados con la seguridad de la información 2. Directrices de registro de eventos de auditoría 3. Definición de herramientas de monitoreo de eventos de seguridad 4. Bitácora de gestión de incidentes",
      "domain": "Gestión de incidentes y problemas"
    },
    {
      "n": 50,
      "ctrl": "Recolección de evidencia",
      "req": "¿Se identifican, recopilan y conservan las evidencias para actividades relacionadas con la gestión de incidentes de seguridad de la información para su posterior análisis? ¿Se documentan las lecciones aprendidas?",
      "doc": "1. Proceso de recolección de evidencia para análisis de incidentes 2. Documento de lecciones aprendidas",
      "domain": "Gestión de incidentes y problemas"
    }
  ],
  "cu": [
    {
      "n": 1,
      "ctrl": "Proceso de cumplimiento de los requisitos legales y reglamentarios",
      "req": "¿¿Ejecuta la organización mecanismos de verificación periódica (auditorías internas, revisoría fiscal o autoevaluaciones) para asegurar el cumplimiento de las obligaciones contractuales y normativas, generando planes de acción trazables ante cualquier desviación detectada?",
      "doc": "1. Manual del programa de cumplimiento, junto con las responsabilidades asignadas a las personas 2. Evidencia de comunicación (por ejemplo, correo electrónico, procedimientos, intranet, sesiones de sensibilización, etc.) 3. Cronograma de Auditorías Internas de Cumplimiento / Calidad.",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 2,
      "ctrl": "Matriz de cumplimiento regulatorio",
      "req": "¿Ha identificado formalmente los requisitos legales y contractuales aplicables al servicio (incluyendo SST, Protección de Datos, Ética y normas específicas del sector) y evidencia su comunicación efectiva al personal encargado de la ejecución del contrato?",
      "doc": "1. Matriz de requerimientos legales, estatutarios, reglamentarios y contractuales aplicables a la organización, junto con las responsabilidades y estado de cumplimiento. 2. Correos / actas de divulgación de los requerimientos definidos por la organización, con las partes interesadas.",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 3,
      "ctrl": "Monitoreo al cumplimiento regulatorio",
      "req": "¿Dispone de un marco de políticas y procedimientos de seguridad de la información documentado y aprobado por la Dirección, acorde con la naturaleza de sus servicios, que establezca controles para proteger la confidencialidad, integridad y disponibilidad de la información manejada?",
      "doc": "1. Informe de estado de cumplimiento de la matriz de requerimientos legales. 2. Manual o Política General de Seguridad de la Información (Vigente).",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 4,
      "ctrl": "Certificación Estándares Mínimos SG-SST",
      "req": "¿Acredita el cumplimiento de los Estándares Mínimos del SG-SST (Res. 0312/2019) mediante Certificación ARL con calificación >85% (o Plan de Mejora vigente) y evidencia la operación activa del COPASST?",
      "doc": "1. Certificado de la ARL (vigencia < 30 días). 2. Actas de reunión del COPASST (último trimestre).",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 5,
      "ctrl": "Sistema de Gestión de PQRSD",
      "req": "¿Cuenta con un mecanismo formal de registro y seguimiento (físico, digital o tecnológico, acorde a su volumen operativo) que garantice la recepción, trazabilidad y respuesta oportuna de las PQRSD, dando estricto cumplimiento a los términos perentorios establecidos en la Ley 1755 de 2015 (15 días hábiles generales) y la Ley 1437 de 2011?",
      "doc": "1. Procedimiento o Protocolo de Atención de PQRSD. 2. Evidencia de seguimiento (ej. Planilla de Excel, Bitácora de radicación o reporte de sistema) donde conste fecha de recibido vs. fecha de respuesta. 3. Indicadores de oportunidad (Si aplica por volumen).",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 6,
      "ctrl": "Control de Aportes Seguridad Social",
      "req": "¿Realiza validaciones mensuales para garantizar el pago correcto, completo y oportuno de los aportes a Seguridad Social y Parafiscales de todo el personal adscrito al contrato (Art. 50 Ley 789 de 2002)?",
      "doc": "1. Certificación de Revisor Fiscal o Representante Legal (si no está obligado a tener Revisor) donde conste el pago de los aportes.",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 7,
      "ctrl": "Sistema Integrado de Gestión (Q & E)",
      "req": "¿Cuenta con un Sistema de Gestión de Calidad y Ambiental (certificado o propio) que asegure la mejora continua de los procesos, el cumplimiento de acuerdos de nivel de servicio (ANS) y la correcta disposición de residuos o manejo ambiental acorde a la normativa?",
      "doc": "1. Evidencia de control de calidad del servicio. 2. Plan de Gestión Integral de Residuos (PGIRS) si aplica.",
      "domain": "Gestión del cumplimiento regulatorio"
    },
    {
      "n": 8,
      "ctrl": "Organización de Archivos y Cero Papel",
      "req": "¿Aplica lineamientos de Gestión Documental y \"Cero Papel\", garantizando la correcta organización, digitalización, custodia y transferencia de la información producida en ejecución del contrato?",
      "doc": "1. Tabla de Retención Documental (TRD) o Procedimiento de Archivo y Gestión Documental. 2. Política de Cero Papel o eficiencia administrativa.",
      "domain": "Gestión del cumplimiento regulatorio"
    }
  ],
  "fr": [
    {
      "n": 1,
      "ctrl": "Política general ABAC (políticas de antifraude y anticorrupción)",
      "req": "¿Se cuenta con una política en cuanto a la gestión del riesgo de fraude y corrupción? ¿Las políticas, procedimientos y estándares están: - documentadas - revisadas y aprobadas - actualizadas al menos una vez al año - divulgado a todas las partes interesadas relevantes",
      "doc": "1. Política Antifraude y Anticorrupción 2. Evidencia de divulgación de la Política Antifraude y anticorrupción a todas las partes interesadas pertinentes",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 2,
      "ctrl": "Ambiente de control",
      "req": "¿Se encuentra definido el código de conducta y ética de la Entidad, en el cual se consideren acciones disciplinarias por acciones de Fraude o corrupción?",
      "doc": "1. Código de conducta y ética",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 3,
      "ctrl": "Ambiente de control",
      "req": "¿Se encuentran definidas las atribuciones y directrices en cuanto a regalos, atenciones y gratificaciones?",
      "doc": "1. Política antifraude y anticorrupción",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 4,
      "ctrl": "Ambiente de control",
      "req": "¿Se encuentran definidas las directrices en cuanto al manejo de donaciones, contribuciones públicas, patrocinios, y uso indebido de los recursos?",
      "doc": "1. Política antifraude y anticorrupción",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 5,
      "ctrl": "Ambiente de control",
      "req": "¿Se consideran medidas de controles sobre los procesos de compras y adquisiciones, garantizando pluralidad de proponentes y transparencia en los procesos?",
      "doc": "1. Manual de contrataciones y adquisiciones",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 6,
      "ctrl": "Ambiente de control",
      "req": "¿Se encuentran definidas directrices en cuanto al conflicto de interés en la ejecución de los procesos de la Entidad?",
      "doc": "1. Procedimiento de conflictos de interés",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 7,
      "ctrl": "Ambiente de control",
      "req": "Cuenta con mecanismos para identificar y reportar eventos de fraude y corrupción en la organización",
      "doc": "1. Línea de denuncias",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 8,
      "ctrl": "Ambiente de control",
      "req": "¿Se cuenta con mecanismos de análisis y monitoreo sobre los reportes de eventos de Fraude y corrupción (v.gr. Línea ética)?",
      "doc": "1. Monitoreo a la gestión de eventos 2. Que pasa con la información producto del monitoreo, se analizan las casuísticas y se toman acciones 3. Se presenta a la Alta Dirección los resultados producto del monitoreo y se toman decisiones frente a dichos resultados",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 9,
      "ctrl": "Ambiente de control",
      "req": "La organización cuanta con Programas de Transparencia y Ética Empresarial",
      "doc": "1. Programa de Transparencia y Ética Empresarial",
      "domain": "Política AntiFraude y Anticorrupción"
    },
    {
      "n": 10,
      "ctrl": "Planes de capacitación sobre el sistema de Política Antifraude y Anticorrupción",
      "req": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con las Política Antifraude y Anticorrupción? ¿Son Medidos los resultados de las capacitaciones?",
      "doc": "1. Cronograma de capacitación. 2. Planillas de registro de capacitación 3. Resultado de las evaluaciones de capacitación.",
      "domain": "Política AntiFraude y Anticorrupción"
    }
  ],
  "pa": [
    {
      "n": 1,
      "ctrl": "Identificación y medición del riesgo país",
      "req": "¿Se cuenta con una metodología de gestión de riesgo país actualizada que considere el entorno legal, regulatorio, geopolítico, social y económico del país donde se mantiene la operación del negocio y sean considerados importantes obstáculos para hacer negocios a nivel mundial (por ejemplo, las recesiones económicas, la agitación política y los desastres naturales) e incluya: - Identificación de riesgos asociado con la realización del comercio en regiones específicas. - Niveles de exposición al riesgo país en los planos económicos, político, externo y comercial. - Evaluar de la exposición al riesgo de los proveedores por país.",
      "doc": "1. Políticas y procedimientos para la gestión de riesgo país.",
      "domain": "Gestión del riesgo País"
    },
    {
      "n": 2,
      "ctrl": "Monitoreo y gestión sobre los riesgos país",
      "req": "¿Se cuenta con indicadores descriptivos y/o cuantitativos para identificar potenciales fuentes de riesgos país que generen las alertas respectivas a la organización en caso de modificaciones significativas del entorno?",
      "doc": "1. Informes de seguimiento y comparación del riesgo país de la organización, incluyendo los riesgos residuales de los diferentes entornos de impacto. 2. Notificaciones o alertamientos de la inestabilidad del país de operación. 3. Planes de tratamiento de riesgos país para minimizar los posibles impactos.",
      "domain": "Gestión del riesgo País"
    },
    {
      "n": 3,
      "ctrl": "Monitoreo y gestión sobre los riesgos país",
      "req": "¿Se tienen identificadas las regulaciones relacionadas con la protección de los datos en el país y se realiza monitoreo al cumplimiento de las mismas?",
      "doc": "1. Identificación y análisis de las regulaciones de protección de datos aplicables. 2. Informe de acciones, seguimiento y monitoreo de la implementación de controles de protección de datos.",
      "domain": "Gestión del riesgo País"
    }
  ],
  "laft": [
    {
      "n": 1,
      "ctrl": "Políticas y procedimientos",
      "req": "¿La Entidad cuenta con un Sistema de Prevención de Riesgo de LA/FT, con lineamientos definidos que contribuyan a prevenir y/o a mitigar el riesgo de LA/FT?",
      "doc": "1. Políticas y/o manual del sistema LA/FT",
      "domain": "Políticas y procedimiento"
    },
    {
      "n": 2,
      "ctrl": "Consulta de listas restrictivas",
      "req": "¿Se cuenta con procedimientos ejecutados por la entidad con relación al seguimiento a las listas ONU y OFAC? ¿La empresa cuenta con una herramienta tecnológica de consulta de listas vinculantes y no vinculantes?",
      "doc": "1. Procedimiento para el seguimiento a las listas ONU y OFAC, y fuente de consulta de información de listas ONU y OFAC",
      "domain": "Políticas y procedimiento"
    },
    {
      "n": 3,
      "ctrl": "Debida Diligencia Contrapartes",
      "req": "¿La empresa cuenta con procedimientos de conocimiento de las contrapartes (incluye cuartas partes vinculadas a la ejecución del contrato con la organización)?",
      "doc": "1. Procedimientos establecidos.",
      "domain": "Políticas y procedimiento"
    },
    {
      "n": 4,
      "ctrl": "Capacitación",
      "req": "¿El proveedor tiene definido un plan o programa de capacitaciones del año en curso donde incluya temas relacionados con LA/FT? ¿Son Medidos los resultados de las capacitaciones?",
      "doc": "1. Cronograma de capacitación. 2. Planillas de registro a capacitación 3. Resultado de las evaluaciones de capacitación.",
      "domain": "Políticas y procedimiento"
    },
    {
      "n": 5,
      "ctrl": "Identificación y medición del riesgo",
      "req": "¿La empresa cuenta con una matriz u otro instrumento que permita la identificación, medición, segmentación y evaluación del riesgo LA/FT?",
      "doc": "1. Matriz u otro mecanismo de riesgos y controles asociada LA/FT, teniendo en cuenta los factores de riesgo.",
      "domain": "Gestión del riesgo LA/FT"
    },
    {
      "n": 6,
      "ctrl": "Monitoreo y gestión sobre los riesgos",
      "req": "¿El sistema de prevención de LA/FT implementado en su compañía permite identificar operaciones inusuales y sospechosas?",
      "doc": "1. Mecanismos de reporte o informes",
      "domain": "Gestión del riesgo LA/FT"
    }
  ],
  "fi": [
    {
      "n": 1,
      "ctrl": "Identificación y medición del riesgo financiero",
      "req": "¿Se cuenta con una metodología de gestión de riesgo financiero actualizada que considere: - Identificación de riesgos financiero que por eventos adverso o alguna fluctuación financiera puedan afectar negativamente la entidad y la prestación del servicio a la organización (riesgo de endeudamiento, riesgo de liquidez, Rentabilidad Operacional de los Activos - ROA y Rentabilidad Operacional sobre el Patrimonio - ROE) - Proceso de medición del riesgo y de la elaboración y aplicación de diferentes estrategias para gestionarlo y hacerle frente, en función de su gravedad y en función de las consecuencias que pueda tener dentro de la empresa y la prestación del servicio a la organización.",
      "doc": "1. Políticas y/o manual con la metodología de gestión de riesgo financiero de la entidad. 2. Documento donde se evidencie la gestión de los riesgos.",
      "domain": "Gestión del riesgo financiero"
    },
    {
      "n": 2,
      "ctrl": "Monitoreo y gestión sobre los riesgos financiero",
      "req": "¿Se cuenta con indicadores financieros (Liquidez, Endeudamiento, ROA y ROE) que generen las alertas a la entidad y son revisados periódicamente (mensual o trimestralmente) para identificar cambios que puedan ser reveladores de problemas con el riesgo?",
      "doc": "1. Informes de seguimiento y gestión de riesgos financieros de la entidad, incluyendo el análisis realizado, las acciones y decisiones que se deriven del mismo.",
      "domain": "Gestión del riesgo financiero"
    }
  ]
};

function actualizarTipoRiesgoTags(){
  const wrap = document.getElementById('tipo-riesgo-tags');
  if(!wrap) return;
  // Recopilar tipologías de todos los terceros pendientes con prom >= 3
  const keysUsadas = new Set();
  tercerosPendientesCuestionario.forEach(t => {
    (t.tipologias||[]).forEach(tip => { if(tip.key) keysUsadas.add(tip.key); });
  });
  if(keysUsadas.size === 0){
    wrap.innerHTML = '<span style="font-size:11px;color:var(--muted);font-style:italic;">Guarda una clasificación con promedio ≥ 3 para ver los tipos de riesgo aplicables.</span>';
    return;
  }
  wrap.innerHTML = [...keysUsadas].map(key => {
    const r = TIPOLOGIA_A_RIESGO[key] || { label: key, color:'#374151', bg:'#F3F4F6' };
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:${r.bg};border:1px solid ${r.color};font-size:11px;font-weight:600;color:${r.color};">
      <span style="width:7px;height:7px;border-radius:50%;background:${r.color};display:inline-block;"></span>
      ${r.label}
    </span>`;
  }).join('');
}

// Llamar al guardar clasificación y al navegar a matriz

function filtrarMatriz(){
  const q     = (document.getElementById('mr-search')?.value||'').toLowerCase();
  const zona  = document.getElementById('mr-filter-zona')?.value||'';
  let ext=0,alt=0,med=0,baj=0;
  document.querySelectorAll('#tbody-analisis-riesgo tr').forEach(tr=>{
    const txt  = tr.textContent.toLowerCase();
    const zEl  = tr.querySelector('.chip[class*="c-ext"], .chip[class*="c-alto"], .chip[class*="c-med"], .chip[class*="c-bajo"]');
    const zTxt = zEl ? zEl.textContent : '';
    const show = (!q||txt.includes(q)) && (!zona||zTxt.includes(zona));
    tr.style.display = show ? '' : 'none';
    if(show){
      if(zTxt.includes('EXTREMO')) ext++;
      else if(zTxt.includes('ALTO')) alt++;
      else if(zTxt.includes('MEDIO')) med++;
      else baj++;
    }
  });
  // Update counters
  const ce=document.getElementById('cnt-ext'), ca=document.getElementById('cnt-alt');
  const cm=document.getElementById('cnt-med'), cb=document.getElementById('cnt-baj');
  if(ce) ce.textContent=ext; if(ca) ca.textContent=alt;
  if(cm) cm.textContent=med; if(cb) cb.textContent=baj;
}

function guardarRiesgoMatriz(){
  const ref   = document.getElementById('mr-ref')?.value.trim();
  const tipo  = document.getElementById('mr-tipo')?.value;
  const desc  = document.getElementById('mr-desc')?.value.trim();
  const resp  = document.getElementById('mr-resp')?.value.trim();

  if(!ref)  { showToast('La Referencia es obligatoria','error',2500); return; }
  if(!tipo) { showToast('Selecciona el Tipo de Riesgo','error',2500); return; }
  if(!desc) { showToast('La Descripción del Riesgo es obligatoria','error',2500); return; }

  const zonaInh = document.getElementById('mr-zona-inh')?.textContent || '—';
  const zonaRes = document.getElementById('mr-zona-res')?.textContent || '—';
  const trat    = document.getElementById('mr-trat')?.value || '—';
  const estado  = document.getElementById('mr-estado')?.value || 'Abierto';
  const freq    = document.getElementById('mr-freq')?.value || '—';
  const probInh = document.getElementById('mr-prob-inh-label')?.textContent || '—';
  const impInh  = document.getElementById('mr-imp-inh-label')?.textContent || '—';
  const probRes = document.getElementById('mr-prob-res-label')?.textContent || '—';
  const impRes  = document.getElementById('mr-imp-res-label')?.textContent || '—';

  const chipZ = (z)=>{
    const c = {EXTREMO:'c-ext',ALTO:'c-alto',MEDIO:'c-med',BAJO:'c-bajo'}[z]||'';
    return c ? `<span class="chip ${c}" style="font-size:10px;">${z}</span>` : `<span style="font-size:11px;">${z}</span>`;
  };
  const chipT = {
    'REDUCIR (TRANSFERIR O MITIGAR)':'<span style="color:var(--red);font-weight:600;font-size:11px;">REDUCIR</span>',
    'TRANSFERIR':'<span style="color:var(--orange);font-weight:600;font-size:11px;">TRANSFERIR</span>',
    'ACEPTAR':'<span style="color:var(--green);font-weight:600;font-size:11px;">ACEPTAR</span>',
    'ELIMINAR':'<span style="color:var(--muted);font-weight:600;font-size:11px;">ELIMINAR</span>'
  }[trat] || trat;
  const chipE = {Abierto:'c-pend','En Gestión':'c-rev',Cerrado:'c-ok'}[estado]||'';

  // Contar controles
  const nCtrls = document.querySelectorAll('#mr-controles-wrap > div').length;

  const tbody = document.getElementById('tbody-matriz');
  if(tbody){
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td><b>${ref}</b></td>` +
      `<td><span class="chip c-pend" style="font-size:10px;">${tipo.split('/')[0].trim()}</span></td>` +
      `<td style="font-size:11px;max-width:180px;">${desc}</td>` +
      `<td style="font-size:11px;">${document.getElementById('mr-causa-inm')?.value||'—'}</td>` +
      `<td>${document.getElementById('mr-factor')?.value||'—'}</td>` +
      `<td>${freq}</td>` +
      `<td style="font-size:11px;">${probInh}</td>` +
      `<td style="font-size:11px;">${impInh}</td>` +
      `<td>${chipZ(zonaInh)}</td>` +
      `<td style="text-align:center;">${nCtrls}</td>` +
      `<td style="font-size:11px;">${probRes}</td>` +
      `<td style="font-size:11px;">${impRes}</td>` +
      `<td>${chipZ(zonaRes)}</td>` +
      `<td>${chipT}</td>` +
      `<td>${resp||'—'}</td>` +
      `<td><span class="chip ${chipE}">${estado}</span></td>`;
    tbody.prepend(tr);
    const cnt = document.getElementById('matrix-count');
    if(cnt) cnt.textContent = tbody.querySelectorAll('tr').length + ' riesgos';
  }

  const fecha = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
  addLog(ref,'Matriz_Riesgos','Nuevo Riesgo','—',`${tipo} — Inh:${zonaInh} → Res:${zonaRes}`,fecha,'Análisis de Riesgo');
  closeM('m-riesgo');
  showToast('Riesgo "'+ref+'" guardado en la Matriz', 'success', 3500);
  var _inh = (parseInt(probVal)||1)*(parseInt(impVal)||1);
  sendNotification(
    _inh>=16 ? 'riesgo_critico' : 'riesgo',
    (_inh>=16?'⚠️ Riesgo ALTO/EXTREMO en Matriz: ':'Riesgo registrado en Matriz: ') + ref,
    'Riesgo registrado con riesgo inherente: '+_inh+' (P×I)',
    {'Referencia': ref, 'Inherente (P×I)': _inh, 'Zona': _inh>=20?'EXTREMO':_inh>=16?'ALTO':_inh>=9?'MEDIO':'BAJO', 'Tratamiento': tratVal||'N/A'}
  );
}

// Inicializar modal al abrir
document.addEventListener('click', e=>{
  if(e.target?.onclick?.toString().includes("openM('m-riesgo')") ||
     e.target?.closest('button')?.onclick?.toString().includes("openM('m-riesgo')")){
    setTimeout(()=>initMRiesgo(), 50);
  }
});
// Wire save-riesgo button safely (button may not exist yet at parse time)
document.addEventListener('DOMContentLoaded', function(){
  const origSaveRiesgoBtn = document.querySelector('#m-riesgo .mf .btn-success');
  if(origSaveRiesgoBtn){ origSaveRiesgoBtn.onclick = function(){
    const ref = document.querySelector('#m-riesgo input[placeholder="R1, R2..."]')?.value||'Rxx';
    addLog(ref,'Matriz_Riesgos','Nuevo Riesgo','—',ref,new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Riesgo');
    closeM('m-riesgo');
    showToast('Riesgo guardado en la Matriz','success',2500);
  };}
});



// ─── DESCRIPCIÓN DE NIVELES POR DIM (inline en form clasificación) ────
function toggleDimDesc(panelId){
  const panel = document.getElementById(panelId);
  if(!panel) return;
  const dimId = panelId.replace('desc-panel-','');
  const btn = document.getElementById('btn-desc-'+dimId);
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if(btn) btn.textContent = isOpen ? '📋 Ver descripción de niveles' : '📋 Ocultar descripción';
}

function editarDescDim(dimId, key){
  const cat = TIPOLOGIA_CATALOG[key];
  if(!cat){ showToast('Tipología no encontrada','error',2000); return; }
  // Abrir un inline-edit dentro del panel
  const panelRows = document.getElementById('desc-rows-'+dimId);
  if(!panelRows) return;
  // Ensure panel is open
  const panel = document.getElementById('desc-panel-'+dimId);
  if(panel) panel.style.display = 'block';
  const btn = document.getElementById('btn-desc-'+dimId);
  if(btn) btn.textContent = '📋 Ocultar descripción';

  const NIVELES_EDIT = [
    {val:'5',label:'CRÍTICO',color:'#DC2626',bg:'#FEF2F2',border:'#FECACA'},
    {val:'4',label:'ALTO',color:'#EA580C',bg:'#FFF7ED',border:'#FED7AA'},
    {val:'3',label:'MEDIO',color:'#D97706',bg:'#FFFBEB',border:'#FDE68A'},
    {val:'2',label:'BAJO',color:'#2563EB',bg:'#EFF6FF',border:'#BFDBFE'},
    {val:'1',label:'MUY BAJO',color:'#16A34A',bg:'#F0FDF4',border:'#BBF7D0'},
    {val:'na4',label:'N/A niv.4',color:'#6B7280',bg:'#F9FAFB',border:'#E5E7EB'},
    {val:'na2',label:'N/A niv.2',color:'#6B7280',bg:'#F9FAFB',border:'#E5E7EB'},
  ];
  panelRows.innerHTML = NIVELES_EDIT.map(lv=>`
    <div style="display:flex;align-items:stretch;border-bottom:1px solid ${lv.border};">
      <div style="min-width:64px;text-align:center;padding:8px 4px;background:${lv.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px solid ${lv.border};">
        <div style="font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;color:${lv.color};">${lv.val.startsWith('na')?'N/A':lv.val}</div>
        <div style="font-size:8px;font-weight:700;color:${lv.color};">${lv.label}</div>
      </div>
      <textarea id="dim-edit-${dimId}-${lv.val}" rows="2"
        style="flex:1;font-size:11.5px;padding:8px 12px;border:none;border-bottom:none;resize:vertical;font-family:inherit;background:${lv.bg};"
        placeholder="Describe qué significa el nivel ${lv.val.startsWith('na')?lv.label:lv.val} para esta tipología..."
      >${(cat.hints && cat.hints[lv.val]) || ''}</textarea>
    </div>`).join('') + `
    <div style="padding:8px 12px;background:#F8FAFC;display:flex;justify-content:flex-end;gap:8px;">
      <button onclick="cancelarEditDim('${dimId}','${key}')"
        style="font-size:11px;padding:4px 12px;border:1px solid var(--border2);border-radius:4px;cursor:pointer;background:white;">Cancelar</button>
      <button onclick="guardarDescDim('${dimId}','${key}')"
        style="font-size:11px;padding:4px 14px;background:#0D9488;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:700;">💾 Guardar</button>
    </div>`;
}

function guardarDescDim(dimId, key){
  if(!TIPOLOGIA_CATALOG[key]) TIPOLOGIA_CATALOG[key] = {hints:{}};
  if(!TIPOLOGIA_CATALOG[key].hints) TIPOLOGIA_CATALOG[key].hints = {};
  const VALS = ['5','4','3','2','1','na4','na2'];
  VALS.forEach(val=>{
    const ta = document.getElementById('dim-edit-'+dimId+'-'+val);
    if(ta) TIPOLOGIA_CATALOG[key].hints[val] = ta.value.trim();
  });
  // Update the dim in cfDimsAgregadas
  const dim = cfDimsAgregadas.find(d=>d.id===dimId);
  if(dim){ dim.hints = {...TIPOLOGIA_CATALOG[key].hints}; }
  renderDimsAgregadas();
  // Re-open the panel
  setTimeout(()=>{
    const panel = document.getElementById('desc-panel-'+dimId);
    if(panel) panel.style.display = 'block';
    const btn = document.getElementById('btn-desc-'+dimId);
    if(btn) btn.textContent = '📋 Ocultar descripción';
  }, 50);
  showToast('✅ Descripciones guardadas','success',2000);
  sendNotification('seguimiento',
    'Seguimiento actualizado',
    'Se han guardado actualizaciones en el plan de seguimiento de riesgos.',
    {'Módulo': 'Seguimiento', 'Acción': 'Guardado exitoso'}
  );
}

function cancelarEditDim(dimId, key){
  renderDimsAgregadas();
  setTimeout(()=>{
    const panel = document.getElementById('desc-panel-'+dimId);
    if(panel) panel.style.display = 'block';
    const btn = document.getElementById('btn-desc-'+dimId);
    if(btn) btn.textContent = '📋 Ocultar descripción';
  }, 50);
}

// ─── CALC DURACIÓN AUTO CON DISPLAY VISUAL ────────────
function calcDuracionDisplay(){
  const fi = document.getElementById('cf-finicio')?.value;
  const ff = document.getElementById('cf-ffinal')?.value;
  const badgeEl = document.getElementById('cf-duracion-badge');
  const durEl = document.getElementById('cf-duracion');
  if(!badgeEl) return;
  if(!fi || !ff){ badgeEl.style.display='none'; if(durEl) durEl.value=''; return; }
  const inicio = new Date(fi);
  const fin    = new Date(ff);
  if(fin <= inicio){ badgeEl.style.display='none'; if(durEl) durEl.value=''; badgeEl.style.background='#fde8e8'; badgeEl.textContent='⚠️ La fecha de término debe ser posterior al inicio'; badgeEl.style.display='flex'; return; }
  const diffMs   = fin - inicio;
  const diffDias = diffMs / (1000 * 60 * 60 * 24);
  const diffAnios = diffDias / 365.25;
  const anios = Math.floor(diffAnios);
  const meses = Math.round((diffAnios - anios) * 12);
  const redondeado = Math.round(diffAnios * 10) / 10;
  if(durEl) durEl.value = redondeado;
  let txt = '';
  if(anios > 0 && meses > 0) txt = anios + ' año' + (anios>1?'s':'') + ' y ' + meses + ' mes' + (meses>1?'es':'');
  else if(anios > 0)          txt = anios + ' año' + (anios>1?'s':'');
  else if(meses > 0)          txt = meses + ' mes' + (meses>1?'es':'');
  else                        txt = Math.round(diffDias) + ' día' + (diffDias>1?'s':'');
  badgeEl.style.display = 'flex';
  badgeEl.style.background = '#e8f8f2';
  badgeEl.style.border = '1px solid #82d9ae';
  badgeEl.style.color = '#1e6449';
  badgeEl.innerHTML = '📅 <b>'+txt+'</b> de contrato';
}


// ══════════════════════════════════════════════════════════════
// CUESTIONARIO AC v3 — Controles del Excel, tipologías custom,
// sección Financiero separada, gestión de terceros mejorada
// ══════════════════════════════════════════════════════════════

// ─── CONFIGURACIÓN SECCIONES CUESTIONARIO ─────────────────────
const SECCIONES_CONFIG = {
  op:   { label:'Riesgo Operacional',                    icon:'⚙️',  color:'#1D4ED8', bg:'#EFF6FF' },
  cn:   { label:'Continuidad del Negocio',               icon:'🔁',  color:'#0D9488', bg:'#F0FDFA' },
  si:   { label:'Seguridad de la Información y Ciberseg.',icon:'🔐', color:'#DC2626', bg:'#FEF2F2' },
  cu:   { label:'Cumplimiento Regulatorio',              icon:'📜',  color:'#16A34A', bg:'#F0FDF4' },
  fr:   { label:'Fraude y Corrupción',                   icon:'🚨',  color:'#EA580C', bg:'#FFF7ED' },
  pa:   { label:'Riesgo País',                           icon:'🌍',  color:'#7C3AED', bg:'#F5F3FF' },
  laft: { label:'LAFT — Lavado de Activos / Terrorismo', icon:'⚖️',  color:'#0369A1', bg:'#F0F9FF' },
  fi:   { label:'Capacidad Financiera — Capacidad Financiera',icon:'💰', color:'#B45309', bg:'#FFFBEB' },
};

// ─── ESTADO TERCEROS ──────────────────────────────────────────
// Extiende tercerosPendientesCuestionario con estado de cuestionario
function getTerceroStatus(nit){
  const t = tercerosPendientesCuestionario.find(x=>x.nit===nit);
  if(!t) return null;
  return t;
}

// ─── RENDERIZAR CUESTIONARIO v3 ───────────────────────────────
function renderCuestionarioV3(nit){
  const tercero = tercerosPendientesCuestionario.find(t=>t.nit===nit);
  if(!tercero) return;
  const wrap = document.getElementById('q-secciones-wrap');
  if(!wrap) return;

  const keysElegidas = (tercero.tipologias||[]).map(t=>t.key);
  // Always show fi section separately
  const seccionesHtml = keysElegidas.map(key=>{
    if(key === 'fi') return ''; // financiero handled separately
    const cfg = SECCIONES_CONFIG[key];
    if(!cfg) return renderSeccionCustom(tercero, key);
    const controles = window._getControlesConf ? window._getControlesConf(key) : (CUESTIONARIO_CONTROLES[key] || []);
    return renderSeccionStandard(tercero, key, cfg, controles);
  }).join('');

  // Add financiero separately if in tipologias
  const hasFinanciero = keysElegidas.includes('fi');
  const finHtml = hasFinanciero ? renderSeccionFinanciero(tercero) : '';

  wrap.innerHTML = seccionesHtml + finHtml + renderSeccionesCustom(tercero);
  document.getElementById('q-footer').style.display='flex';
}

function renderSeccionStandard(tercero, key, cfg, controles){
  const numAtrib = 7;
  // Use custom atrib labels if available
  const atribLabels = (typeof PERS_ATRIBS !== 'undefined' && PERS_ATRIBS.length === 6)
    ? PERS_ATRIBS
    : ['1. ¿Implementado?','2. ¿Documentado?','3. ¿Asignado?','4. ¿Divulgado?','5. ¿Evidencia?','6. ¿Monitoreado?'];
  const ctrlRows = controles.map((c,idx)=>`
    <div class="ctrl-row" style="border-bottom:1px solid #E5E7EB;padding:12px 0;${idx%2===0?'background:#FAFAFA;':''}" id="ctrl-${key}-${c.n}">
      <div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="min-width:28px;height:28px;background:${cfg.color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">${c.n}</div>
        <div style="flex:1;">
          <div style="font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:2px;">${c.ctrl||'Control '+c.n}</div>
          <div style="font-size:11.5px;color:#374151;line-height:1.5;">${c.req}</div>
          ${c.doc ? `<div style="font-size:10.5px;color:var(--muted);margin-top:4px;font-style:italic;">📎 ${c.doc}</div>` : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr) repeat(3,1fr);gap:6px;padding:0 38px;">
        ${atribLabels.map((lbl,ai)=>`
          <div style="text-align:center;">
            <div style="font-size:9.5px;color:var(--muted);margin-bottom:3px;font-weight:600;">${lbl}</div>
            <select id="q3_${key}_${c.n}_a${ai+1}" onchange="onAtribV3('${key}',${c.n},${ai+1})"
              style="width:100%;padding:4px 3px;border:1px solid var(--border2);border-radius:4px;font-size:11px;font-family:inherit;text-align:center;cursor:pointer;">
              <option value="">—</option>
              <option value="Si" style="color:green;">Sí</option>
              <option value="No" style="color:red;">No</option>
              <option value="No Aplica" style="color:gray;">N/A</option>
            </select>
          </div>`).join('')}
      </div>
      <!-- ═══ VALORACIÓN DEL CONTROL ═══ -->
      <div id="valCtrl-${key}-${c.n}" style="margin:8px 38px 0;padding:8px 12px;background:linear-gradient(90deg,#FFFBEB,#FEF9E0);border:1px solid #FCD34D44;border-radius:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="font-size:9.5px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;">Valoración del Control</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Nivel Cumplimiento</div>
            <div id="vc-pct-${key}-${c.n}" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:var(--muted);">—</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border);"></div>
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Nivel de Madurez</div>
            <div id="vc-mad-${key}-${c.n}" style="font-size:10.5px;font-weight:700;color:var(--muted);">—</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border);"></div>
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Valoración</div>
            <div id="vc-val-${key}-${c.n}" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:var(--muted);">—</div>
          </div>
        </div>
      </div>
      <div style="padding:6px 38px 0;">
        <textarea id="q3_${key}_${c.n}_obs" rows="1" placeholder="Fortalezas, brechas, observaciones..."
          style="width:100%;padding:5px 8px;border:1px solid var(--border2);border-radius:4px;font-size:11.5px;font-family:inherit;resize:vertical;"></textarea>
      </div>
    </div>`).join('');

  const addBtnHtml = ``;

  return `
  <div class="card" data-tipkey="${key}" style="margin-bottom:10px;border-left:4px solid ${cfg.color};" data-tipnom="${tercero.tipologias?.find(t=>t.key===key)?.nombre||cfg.label||key}">
    <div style="padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${cfg.bg};border-radius:10px 10px 0 0;"
      onclick="toggleAccV3('acc-v3-${key}','arr-v3-${key}')">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">${cfg.icon}</span>
        <div>
          <span style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;color:var(--navy);">${cfg.label}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:8px;">${controles.length} controles</span>
        </div>
        <span id="score-v3-${key}" style="font-size:11px;color:var(--muted);background:white;padding:2px 8px;border-radius:10px;border:1px solid var(--border2);">Sin responder</span>
        <span id="prom-v3-${key}" style="display:none;font-size:11px;background:#FFFBEB;padding:3px 10px;border-radius:10px;border:1px solid #FCD34D55;">Promedio: —</span>
      </div>
      <span id="arr-v3-${key}" style="font-size:18px;color:var(--muted);">▼</span>
    </div>
    <div id="acc-v3-${key}" style="display:none;padding:0 16px 14px;">
      ${ctrlRows}
      ${addBtnHtml}
    </div>
  </div>`;
}

function renderSeccionCustom(tercero, key){
  // Para tipologías personalizadas (custom_xxx)
  const cat = TIPOLOGIA_CATALOG[key];
  const nombre = cat ? cat.nombre.replace(/\n/g,' ') : key;
  const customCtrls = terceroCustomControls[tercero.nit] && terceroCustomControls[tercero.nit][key] || [];

  const ctrlRows = customCtrls.map((c,idx)=>renderCustomCtrlRow(key, tercero.nit, c, idx)).join('');

  return `
  <div class="card" style="margin-bottom:10px;border-left:4px solid #6B7280;">
    <div style="padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:#F9FAFB;border-radius:10px 10px 0 0;"
      onclick="toggleAccV3('acc-v3-${key}','arr-v3-${key}')">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">📋</span>
        <div>
          <span style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;color:var(--navy);">${nombre}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:8px;">${customCtrls.length} controles</span>
        </div>
        <span class="chip" style="background:#F3F4F6;color:#374151;border:1px solid #D1D5DB;font-size:10px;">Tipología personalizada</span>
      </div>
      <span id="arr-v3-${key}" style="font-size:18px;">▼</span>
    </div>
    <div id="acc-v3-${key}" style="display:none;padding:0 16px 14px;">
      <div id="custom-ctrls-${key}-${tercero.nit}">${ctrlRows}</div>
      <button onclick="abrirAddControlModal('${key}','${tercero.nit}')"
        style="margin:10px 0;padding:5px 14px;background:#F3F4F6;border:1px dashed #6B7280;color:#374151;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">
        ＋ Agregar control
      </button>
    </div>
  </div>`;
}

function renderSeccionesCustom(tercero){
  // Tipologías con key que empieza en custom_ que no están ya en keysElegidas del mapa estandar
  const keysElegidas = (tercero.tipologias||[]).map(t=>t.key);
  return keysElegidas.filter(k=>k.startsWith('custom_')).map(k=>renderSeccionCustom(tercero,k)).join('');
}

// ─── CONTROLES CUSTOM POR TERCERO ────────────────────────────
let terceroCustomControls = {}; // {nit: {key: [{n,ctrl,req,doc}]}}

function abrirAddControlModal(key, nit){
  // Fill modal
  document.getElementById('acm-key').value = key;
  document.getElementById('acm-nit').value = nit;
  document.getElementById('acm-ctrl').value = '';
  document.getElementById('acm-req').value = '';
  document.getElementById('acm-doc').value = '';
  openM('m-add-control');
}



function renderCustomCtrlRow(key, nit, c, idx){
  const atribLabels = ['1. ¿Implementado?','2. ¿Documentado?','3. ¿Asignado?','4. ¿Divulgado?','5. ¿Evidencia?','6. ¿Monitoreado?'];
  return `
  <div style="border-bottom:1px solid #E5E7EB;padding:12px 0;${idx%2===0?'background:#FAFAFA;':''}" id="ctrl-${key}-${nit}-${c.n}">
    <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
      <div style="min-width:26px;height:26px;background:#6B7280;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;">${c.n}</div>
      <div style="flex:1;">
        <div style="font-size:12.5px;font-weight:700;color:var(--navy);">${c.ctrl}</div>
        <div style="font-size:11.5px;color:#374151;">${c.req}</div>
        ${c.doc ? `<div style="font-size:10.5px;color:var(--muted);font-style:italic;">📎 ${c.doc}</div>` : ''}
      </div>
      <button onclick="quitarControlCustom('${key}','${nit}',${c.n})"
        style="font-size:10px;padding:2px 8px;background:#FEF2F2;border:1px solid #FECACA;color:#DC2626;border-radius:4px;cursor:pointer;flex-shrink:0;">✕ Quitar</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;padding:0 36px;">
      ${atribLabels.map((lbl,ai)=>`
        <div style="text-align:center;">
          <div style="font-size:9px;color:var(--muted);margin-bottom:3px;">${lbl}</div>
          <select id="q3_custom_${key}_${nit}_${c.n}_a${ai+1}" onchange="onAtribV3('custom_${key}_${nit}',${c.n},${ai+1})"
            style="width:100%;padding:3px;border:1px solid var(--border2);border-radius:4px;font-size:10px;">
            <option value="">—</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
            <option value="No Aplica">N/A</option>
          </select>
        </div>`).join('')}
    </div>
    <div style="padding:5px 36px 0;">
      <textarea rows="1" placeholder="Observaciones..." style="width:100%;padding:4px 7px;border:1px solid var(--border2);border-radius:4px;font-size:11px;font-family:inherit;resize:vertical;"></textarea>
    </div>
  </div>`;
}

function quitarControlCustom(key, nit, n){
  if(!terceroCustomControls[nit] || !terceroCustomControls[nit][key]) return;
  terceroCustomControls[nit][key] = terceroCustomControls[nit][key].filter(c=>c.n!==n);
  // Re-number
  terceroCustomControls[nit][key].forEach((c,i)=>c.n=i+1);
  const wrap2 = document.getElementById(`custom-ctrls-${key}-${nit}`);
  if(wrap2) wrap2.innerHTML = terceroCustomControls[nit][key].map((c,idx)=>renderCustomCtrlRow(key,nit,c,idx)).join('');
  showToast('Control eliminado','info',1500);
}

// ─── FINANCIERO SEPARADO ──────────────────────────────────────
function renderSeccionFinanciero(tercero){
  return `
  <div class="card" style="margin-bottom:10px;border-left:4px solid #B45309;">
    <div style="padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:#FFFBEB;border-radius:10px 10px 0 0;"
      onclick="toggleAccV3('acc-v3-fi','arr-v3-fi')">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">💰</span>
        <div>
          <span style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;color:var(--navy);">Capacidad Financiera</span>
          <span style="font-size:11px;color:var(--muted);margin-left:8px;">2 controles + Estados Financieros</span>
        </div>
        <span id="score-v3-fi" style="font-size:11px;color:var(--muted);background:white;padding:2px 8px;border-radius:10px;border:1px solid var(--border2);">Sin responder</span>
      </div>
      <span id="arr-v3-fi" style="font-size:18px;color:var(--muted);">▼</span>
    </div>
    <div id="acc-v3-fi" style="display:none;padding:14px 16px;">
      
      <!-- Parte 1: Controles de gestión -->
      <div style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:white;background:#B45309;padding:5px 10px;border-radius:5px;margin-bottom:10px;">
        PARTE 1 — Controles de Gestión del Capacidad Financiera
      </div>
      ${(CUESTIONARIO_CONTROLES['fi']||[]).map((c,idx)=>`
      <div style="border-bottom:1px solid #E5E7EB;padding:10px 0;${idx%2===0?'background:#FAFAFA;':''}">
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <div style="min-width:26px;height:26px;background:#B45309;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;">${c.n}</div>
          <div style="flex:1;">
            <div style="font-size:12.5px;font-weight:700;color:var(--navy);">${c.ctrl}</div>
            <div style="font-size:11.5px;color:#374151;line-height:1.5;">${c.req}</div>
            ${c.doc ? `<div style="font-size:10.5px;color:var(--muted);font-style:italic;">📎 ${c.doc}</div>` : ''}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;padding:0 36px;">
          ${['1. ¿Implementado?','2. ¿Documentado?','3. ¿Asignado?','4. ¿Divulgado?','5. ¿Evidencia?','6. ¿Monitoreado?'].map((lbl,ai)=>`
            <div style="text-align:center;">
              <div style="font-size:9px;color:var(--muted);margin-bottom:3px;">${lbl}</div>
              <select id="q3_fi_${c.n}_a${ai+1}" onchange="onAtribV3('fi',${c.n},${ai+1})"
                style="width:100%;padding:3px;border:1px solid var(--border2);border-radius:4px;font-size:10px;">
                <option value="">—</option>
                <option value="Si">Sí</option>
                <option value="No">No</option>
                <option value="No Aplica">N/A</option>
              </select>
            </div>`).join('')}
        </div>
        <div style="padding:5px 36px 0;">
          <textarea rows="1" placeholder="Observaciones..." style="width:100%;padding:4px 7px;border:1px solid var(--border2);border-radius:4px;font-size:11px;font-family:inherit;resize:vertical;"></textarea>
        </div>
      </div>`).join('')}

      <!-- Parte 2: Estados Financieros -->
      <div style="font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;color:white;background:#92400E;padding:5px 10px;border-radius:5px;margin:14px 0 10px;">
        PARTE 2 — Estados Financieros — 3 Últimos Años
      </div>
      <div class="alert al-b" style="font-size:11.5px;margin-bottom:12px;">
        Diligencie con base en la información financiera certificada. Mínimo <b>70 puntos</b> para habilitación financiera.
        Liquidez + Endeudamiento + Patrimonio — 33 combinaciones posibles para alcanzar 70 pts.
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:var(--navy);color:white;">
              <th style="padding:8px 10px;text-align:left;">Cuenta</th>
              <th style="padding:8px;text-align:center;">Año 1</th>
              <th style="padding:8px;text-align:center;">Año 2</th>
              <th style="padding:8px;text-align:center;">Año 3</th>
              <th style="padding:8px;text-align:center;background:#92400E;">Promedio</th>
            </tr>
          </thead>
          <tbody id="fi-estados-tbody">
            ${[
              {id:'ac', label:'Activo Corriente'},
              {id:'at', label:'Activo Total'},
              {id:'pc', label:'Pasivo Corriente'},
              {id:'pt', label:'Pasivo Total'},
              {id:'pa', label:'Patrimonio Total'},
              {id:'ur', label:'Utilidades Retenidas'},
              {id:'uo', label:'Utilidad Operacional'},
              {id:'cc', label:'Costo Anual Contrato'},
            ].map((r,i)=>`
              <tr style="${i%2===0?'background:#FAFAFA':''}">
                <td style="padding:7px 10px;font-weight:600;color:var(--navy);">${r.label}</td>
                ${[1,2,3].map(y=>`
                  <td style="padding:4px 6px;">
                    <input type="number" id="fi-${r.id}${y}" value="0" min="0"
                      oninput="calcFinancieroV3()"
                      style="width:100%;padding:5px 8px;border:1px solid var(--border2);border-radius:4px;font-size:12px;text-align:right;"/>
                  </td>`).join('')}
                <td style="padding:7px 10px;text-align:center;font-weight:700;color:var(--navy);background:#FEF9E7;" id="fi-${r.id}-prom">—</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Indicadores calculados -->
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
        ${[
          {id:'liq', label:'LIQUIDEZ', formula:'AC / PC', good:'≥ 1.4', bad:'< 1.1'},
          {id:'end', label:'ENDEUDAMIENTO', formula:'PT / AT', good:'< 0.6', bad:'> 0.7'},
          {id:'pat', label:'PATRIMONIO / CONTRATO', formula:'PA / Contrato', good:'≥ 1.0', bad:'< 0.3'},
          {id:'roa', label:'ROA', formula:'UO / AT', good:'≥ 5%', bad:'< 0%'},
        ].map(ind=>`
          <div style="background:white;border:1px solid var(--border);border-radius:var(--r);padding:12px;text-align:center;box-shadow:var(--shadow);">
            <div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">${ind.label}</div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:6px;">${ind.formula}</div>
            <div id="fi-ind-${ind.id}" style="font-family:'Montserrat',sans-serif;font-size:24px;font-weight:800;color:var(--muted);">—</div>
            <div style="font-size:9.5px;color:var(--muted);margin-top:4px;">Óptimo: <b>${ind.good}</b></div>
          </div>`).join('')}
      </div>

      <!-- Calificación habilitación financiera -->
      <div id="fi-calificacion-v3" style="margin-top:14px;padding:12px 16px;border-radius:var(--r);font-size:13px;font-weight:600;text-align:center;background:var(--gray3);color:var(--muted);">
        Ingresa los estados financieros para ver la calificación RF
      </div>
    </div>
  </div>`;
}

function calcFinancieroV3(){
  function v(id){ return parseFloat(document.getElementById(id)?.value)||0; }
  function prom3(base){ const vals=[v(base+'1'),v(base+'2'),v(base+'3')]; const s=vals.reduce((a,b)=>a+b,0); return vals.filter(x=>x>0).length ? s/vals.filter(x=>x>0).length : 0; }
  
  const bases = ['ac','at','pc','pt','pa','ur','uo','cc'];
  const proms = {};
  bases.forEach(b=>{
    proms[b] = prom3(b);
    const el = document.getElementById('fi-'+b+'-prom');
    if(el) el.textContent = proms[b] ? proms[b].toLocaleString('es-CO',{maximumFractionDigits:0}) : '—';
  });

  const liq = proms.pc>0 ? (proms.ac/proms.pc).toFixed(2) : '—';
  const end_ = proms.at>0 ? (proms.pt/proms.at).toFixed(2) : '—';
  const pat  = proms.cc>0 ? (proms.pa/proms.cc).toFixed(2) : '—';
  const roa  = proms.at>0 ? (proms.uo/proms.at*100).toFixed(1)+'%' : '—';

  const setInd=(id,val,good,bad)=>{
    const el=document.getElementById('fi-ind-'+id); if(!el) return;
    el.textContent=val;
    const n=parseFloat(val);
    if(isNaN(n)) el.style.color='var(--muted)';
    else el.style.color=n>=good?'var(--green)':n<=bad?'var(--red)':'var(--orange)';
  };
  setInd('liq',liq,1.4,1.1); setInd('end',end_,0,0.6); setInd('pat',pat,1.0,0.3); 
  const roaEl=document.getElementById('fi-ind-roa'); if(roaEl){ roaEl.textContent=roa; roaEl.style.color=parseFloat(roa)>=5?'var(--green)':parseFloat(roa)<0?'var(--red)':'var(--orange)'; }

  // Score: Liquidez 40pts, Endeudamiento 40pts, Patrimonio 20pts  
  let score=0;
  const liqN=parseFloat(liq), endN=parseFloat(end_), patN=parseFloat(pat);
  if(!isNaN(liqN)){ score += liqN>=1.4?40:liqN>=1.2?30:liqN>=1.1?20:0; }
  if(!isNaN(endN)){ score += endN<=0.5?40:endN<=0.6?30:endN<=0.7?20:0; }
  if(!isNaN(patN)){ score += patN>=1.0?20:patN>=0.7?15:patN>=0.3?10:0; }
  
  const calEl=document.getElementById('fi-calificacion-v3');
  if(calEl && !isNaN(liqN)){
    const hab = score>=70;
    calEl.style.background = hab?'#e8f8f2':'#fde8e8';
    calEl.style.color      = hab?'var(--green)':'var(--red)';
    calEl.innerHTML = `<span style="font-size:22px;font-weight:800;font-family:'Montserrat',sans-serif;">${score} / 100 pts</span><br>
      ${hab ? '✅ HABILITADO FINANCIERAMENTE — Cumple criterios mínimos (≥70 pts)' : '⚠️ NO HABILITADO — Revise indicadores financieros'}`;
  }
}

// ─── ONCHANGE ATRIBUTO v3 ────────────────────────────────────
function onAtribV3(key, ctrl, atrib){
  const prefix = `q3_${key}_${ctrl}`;
  const a1val = document.getElementById(prefix+'_a1')?.value;
  const a6val = document.getElementById(prefix+'_a6')?.value;
  
  // Si atrib 1 = No → deshabilitar 2-7
  for(let i=2;i<=7;i++){
    const el=document.getElementById(prefix+`_a${i}`);
    if(el){
      if(a1val==='No'){ el.value='No'; el.disabled=true; el.style.opacity='0.4'; }
      else{ el.disabled=false; el.style.opacity='1'; }
    }
  }
  // Si atrib 1 = N/A → deshabilitar 2-7
  if(a1val==='No Aplica'){
    for(let i=2;i<=7;i++){
      const el=document.getElementById(prefix+`_a${i}`);
      if(el){ el.value=''; el.disabled=true; el.style.opacity='0.4'; }
    }
  }
  // Si atrib 6 = No → atrib 7 = No
  const a7=document.getElementById(prefix+'_a7');
  if(a7 && a6val==='No'){ a7.value='No'; a7.disabled=true; a7.style.opacity='0.4'; }
  else if(a7 && a1val!=='No' && a1val!=='No Aplica'){ a7.disabled=false; a7.style.opacity='1'; }

  calcScoreSeccionV3(key);

  // ── Actualizar Valoración del Control inline ───────
  (function(){
    var resp={};
    for(var i=1;i<=7;i++){
      var el=document.getElementById(prefix+'_a'+i);
      if(el) resp['a'+i]=el.value;
    }
    var val=_calcCtrlValoracion(resp);
    var pctEl=document.getElementById('vc-pct-'+key+'-'+ctrl);
    var madEl=document.getElementById('vc-mad-'+key+'-'+ctrl);
    var valEl=document.getElementById('vc-val-'+key+'-'+ctrl);
    var wrap=document.getElementById('valCtrl-'+key+'-'+ctrl);
    if(pctEl){ pctEl.textContent=val.nivelCumpl; pctEl.style.color=val.color; }
    if(madEl){
      madEl.textContent=val.madurez;
      madEl.style.color=val.color;
      madEl.style.background=val.bgColor;
      madEl.style.padding='3px 8px';
      madEl.style.borderRadius='8px';
    }
    if(valEl){ valEl.textContent=val.valorMad>0?val.valorMad+'.0':'—'; valEl.style.color=val.color; }
    if(wrap){
      wrap.style.background=val.madurez==='NO APLICA'?'#F9FAFB':
        val.pct>=80?'linear-gradient(90deg,#F0FDF4,#DCFCE7)':
        val.pct>=60?'linear-gradient(90deg,#FEFCE8,#FEF9C3)':
        val.pct>=40?'linear-gradient(90deg,#FFF7ED,#FFEDD5)':
        'linear-gradient(90deg,#FEF2F2,#FEE2E2)';
      wrap.style.borderColor=val.color+'55';
    }
  })();
}

function calcScoreSeccionV3(key){
  const controles = window._getControlesConf ? window._getControlesConf(key) : (CUESTIONARIO_CONTROLES[key] || []);
  let respondidos=0, total=controles.length;
  let siCount=0, totalPct=0, totalVal=0, valCount=0;
  controles.forEach(c=>{
    const v=document.getElementById(`q3_${key}_${c.n}_a1`)?.value;
    if(v){
      respondidos++;
      // Collect all 6 attr values for valoracion
      const resp={};
      for(let i=1;i<=6;i++){
        const el=document.getElementById(`q3_${key}_${c.n}_a${i}`);
        if(el) resp['a'+i]=el.value;
      }
      const val=_calcCtrlValoracion(resp);
      if(val.madurez!=='NO APLICA'){ totalPct+=val.pct; totalVal+=val.valorMad; valCount++; }
      if(v==='Si'){
        const all7=Array.from({length:7},(_,i)=>document.getElementById(`q3_${key}_${c.n}_a${i+1}`)?.value).every(x=>x==='Si');
        if(all7) siCount++;
      }
    }
  });
  const el=document.getElementById(`score-v3-${key}`);
  const promEl=document.getElementById(`prom-v3-${key}`);
  if(el && total>0){
    const pct=Math.round(respondidos/total*100);
    const avgCumpl=valCount>0?Math.round(totalPct/valCount):0;
    const avgVal=valCount>0?(totalVal/valCount).toFixed(1):'—';
    const cumplColor=avgCumpl>=80?'#16A34A':avgCumpl>=60?'#CA8A04':avgCumpl>=40?'#EA580C':'#DC2626';
    el.textContent=`${respondidos}/${total} respondidos`;
    el.style.color=pct===100?'var(--green)':pct>50?'var(--orange)':'var(--muted)';
    // Update the promedio badge
    if(promEl){
      if(valCount>0){
        promEl.innerHTML=`<span style="color:${cumplColor};font-weight:800;">${avgCumpl}%</span> · Val <span style="font-weight:800;color:${cumplColor};">${avgVal}</span>`;
        promEl.style.display='inline-flex';
      } else {
        promEl.style.display='none';
      }
    }
  }
}

// ─── TOGGLE ACCORDION v3 ─────────────────────────────────────
function toggleAccV3(panelId, arrId){
  const el=document.getElementById(panelId);
  const arr=document.getElementById(arrId);
  if(!el) return;
  const open=el.style.display!=='none';
  el.style.display=open?'none':'block';
  if(arr) arr.textContent=open?'▼':'▲';
}

// ─── GESTIÓN DE TERCEROS MEJORADA ────────────────────────────
// Quitar tercero de la tabla
function quitarTercero(nit){
  const nombre = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[nit]?.nombre) || nit;
  // Show inline confirm toast instead of window.confirm (works in all contexts)
  showConfirmToast(
    '¿Borrar "' + nombre + '"?',
    'Se eliminará de la lista y del Cuestionario AC.',
    function(){ _doQuitarTercero(nit, nombre); }
  );
}

function _doQuitarTercero(nit, nombre){
  // Remove table row
  document.querySelectorAll('#tbody-terceros tr').forEach(tr => {
    if(tr.cells[0]?.textContent.trim() === nit) tr.remove();
  });
  if(typeof TERCEROS_DB !== 'undefined') delete TERCEROS_DB[nit];
  if(typeof tercerosPendientesCuestionario !== 'undefined')
    tercerosPendientesCuestionario = tercerosPendientesCuestionario.filter(t => t.nit !== nit);
  try{ _lsSave && _lsSave(); }catch(e){}
  try{ sincronizarSelectorCuestionario(); }catch(e){}
  try{ updateDashboard(); }catch(e){}
  showToast('"' + nombre + '" eliminado', 'info', 2500);
}

function _dismissConfirmToast(){
  var c = document.getElementById('confirm-toast');
  if(c) c.parentNode.removeChild(c);
}

function showConfirmToast(title, msg, onConfirm){
  _dismissConfirmToast();
  var d = document.createElement('div');
  d.id = 'confirm-toast';
  d.style.cssText = [
    'position:fixed','bottom:24px','left:50%','transform:translateX(-50%)',
    'background:white','border:1px solid #E5E7EB','border-radius:12px',
    'box-shadow:0 8px 32px rgba(0,0,0,.18)','padding:16px 20px',
    'z-index:9999','min-width:300px','max-width:420px','text-align:center'
  ].join(';');
  var cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.style.cssText = 'padding:7px 20px;border:1px solid #E5E7EB;border-radius:7px;background:white;cursor:pointer;font-size:12px;margin-right:10px;';
  cancelBtn.onclick = _dismissConfirmToast;

  var okBtn = document.createElement('button');
  okBtn.textContent = '🗑 Borrar';
  okBtn.style.cssText = 'padding:7px 20px;border:none;border-radius:7px;background:#DC2626;color:white;cursor:pointer;font-size:12px;font-weight:700;';
  okBtn.onclick = function(){ _dismissConfirmToast(); onConfirm(); };

  var titleDiv = document.createElement('div');
  titleDiv.style.cssText = 'font-size:13px;font-weight:700;color:#1a3a5c;margin-bottom:4px;';
  titleDiv.textContent = title;

  var msgDiv = document.createElement('div');
  msgDiv.style.cssText = 'font-size:12px;color:#6B7280;margin-bottom:14px;';
  msgDiv.textContent = msg;

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center;';
  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(okBtn);

  d.appendChild(titleDiv);
  d.appendChild(msgDiv);
  d.appendChild(btnRow);
  document.body.appendChild(d);

  setTimeout(function(){ _dismissConfirmToast(); }, 8000);
}



// ─── OVERRIDE saveAllCuestionario ────────────────────────────
function saveAllCuestionario(){
  const nit=document.getElementById('q-tercero')?.value||'—';
  const t=tercerosPendientesCuestionario.find(x=>x.nit===nit);
  const nombre=t?t.nombre:nit;
  addLog(nombre,'RESPUESTAS_EVALUACION','Cuestionario AC Guardado','—','Respuestas registradas v3',
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Datos Maestros');
  // Persistir respuestas completas para cross-rol
    try{
      var nit2=window.nitActual||'';
      if(nit2){
        var allR=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
        allR[nit2]=window.CUEST_RESPUESTAS[nit2]||{};
        localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(allR));
        var allCC=JSON.parse(localStorage.getItem('sgrt_cuest_custom')||'{}');
        allCC[nit2]=window.CUEST_CTRL_CUSTOM[nit2]||{};
        localStorage.setItem('sgrt_cuest_custom',JSON.stringify(allCC));
      }
    }catch(e){}
    showToast('✅ Cuestionario guardado para: '+nombre,'success',3000);
  sendNotification('cuestionario',
    'Cuestionario AC guardado: ' + nombre,
    'Evaluación de Ambiente de Control guardada para el tercero.',
    {'Tercero': nombre, 'Respuestas guardadas': total||'N/A'}
  );
}


// ─── AGREGAR BOTÓN QUITAR A FILAS ESTÁTICAS ──────────────────
function addQuitarButtons(){
  // No-op: static rows already have correct buttons in HTML.
  // Dynamic rows are built by agregarTerceroEnTabla with correct buttons.
}


// ════════════════════════════════════════════════════════
// GESTIÓN DE TERCEROS v2
// ════════════════════════════════════════════════════════

// Datos de los terceros ya registrados (pre-cargados)
const TERCEROS_INICIALES = []; // datos vienen de la BD

// Pre-cargar terceros iniciales en el selector del cuestionario
function initTercerosEnCuestionario(){
  // Sync TERCEROS_INICIALES → TERCEROS_DB (so cargarCuestionarioTercero finds dims)
  TERCEROS_INICIALES.forEach(t => {
    if(!TERCEROS_DB[t.nit]){
      // Build dims from tipologias with default val ''
      const dims = (t.tipologias||[]).map(tip=>({
        key: tip.key, nombre: tip.nombre||tip.key, val: ''
      }));
      TERCEROS_DB[t.nit] = {
        nit: t.nit, nombre: t.nombre, entidad: t.entidad,
        entidadLabel: t.entidad==='colpensiones'?'🏛 Colpensiones':
                      t.entidad==='ecopetrol'?'🛢 Ecopetrol':'🏦 Bancolombia',
        servicio: t.servicio, supervisor: t.supervisor,
        nocontrato:'', domicilio:'', cargo:'', objetivo:'',
        finicio:'', fterm:'', valor:'',
        prom: t.prom, zona: t.zona, periodicidad: t.periodicidad,
        estado:'Activo', dims: dims
      };
    }
    // Also push to tercerosPendientesCuestionario for legacy compatibility
    if(parseFloat(t.prom) >= 3 && !tercerosPendientesCuestionario.find(x=>x.nit===t.nit)){
      tercerosPendientesCuestionario.push({
        nit: t.nit, nombre: t.nombre, entidad: t.entidad,
        prom: t.prom, zona: t.zona, periodicidad: t.periodicidad,
        tipologias: t.tipologias||[]
      });
    }
  });
  sincronizarSelectorCuestionario();
}

// ─── MODAL EDITAR TERCERO ─────────────────────────────────────
function editarTerceroModal(nit){
  // Also check TERCEROS_INICIALES
  const ini = TERCEROS_INICIALES.find(t=>t.nit===nit);

  // Fill edit modal
  const m = document.getElementById('m-editar-tercero');
  if(!m){ showToast('Modal editar no disponible','error',2000); return; }
  document.getElementById('et-nit').textContent  = ini?.nit||nit;
  document.getElementById('et-nombre').value     = ini?.nombre||'';
  document.getElementById('et-domicilio').value  = ini?.domicilio||'';
  document.getElementById('et-nit-orig').value   = nit; // keep original nit
  openM('m-editar-tercero');
}

function guardarEdicionTercero(){
  const nitOrig = document.getElementById('et-nit-orig').value;
  const nombre   = document.getElementById('et-nombre').value.trim();
  const domicilio = document.getElementById('et-domicilio').value.trim();
  if(!nombre){ showToast('El nombre es obligatorio','error',2000); return; }

  // Update in TERCEROS_INICIALES (in memory)
  const ini = TERCEROS_INICIALES.find(t=>t.nit===nitOrig);
  if(ini){ ini.nombre=nombre; ini.domicilio=domicilio; }

  // Update in TERCEROS_DB
  if(window.TERCEROS_DB && window.TERCEROS_DB[nitOrig]){
    window.TERCEROS_DB[nitOrig].nombre = nombre;
    window.TERCEROS_DB[nitOrig].domicilio = domicilio;
  }

  // Guardar en localStorage
  try{
    if(window.TERCEROS_DB){
      localStorage.setItem('sgrt_terceros', JSON.stringify(window.TERCEROS_DB));
    }
  }catch(e){}

  addLog(nombre,'Relacion_Terceros','Edición','—',`Nombre/Domicilio actualizados`,
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Datos Maestros');
  
  // Actualizar tabla Registros en tiempo real
  if(window.renderCliRegistros){
    window.renderCliRegistros();
  }
  
  // ⭐ Sincronizar con CLS_DB para que aparezca el nombre actualizado en Clasificación
  try{
    if(window.clsInitDash && typeof window.clsInitDash === 'function'){
      window.clsInitDash();
    }
  }catch(eSyncErr){console.error('Error sincronizando CLS_DB:', eSyncErr);}
  
  actualizarSelectorCuestionario();
  closeM('m-editar-tercero');
  showToast(`✅ Tercero "${nombre}" actualizado correctamente`,
'success',2500);
  try{ window._lsSave && window._lsSave(); }catch(e){}
}

// agregarTerceroEnTabla: see v3 below
// ─── agregarTerceroEnTabla v3 + sync TERCEROS_DB ──────────────
function agregarTerceroEnTabla(nit, nombre, entidad, entidadBg, servicio, supervisor, prom, evalua, fecha, extras){
  // Save to TERCEROS_DB
  const p = parseFloat(prom);
  const chipC = p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
  const chipPer = p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
  const evalLabel = p>=3?'Se evalúa':'No se evalúa';
  const zona = p>=4?'EXTREMO':p>=3?'ALTO':'BAJO';
  const periodicidad = p>=3?'Se evalúa':'No se evalúa';
  const entidadBgs = {
    colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',
    ecopetrol:'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',
    bancolombia:'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'
  };
  const entKey = (entidad||'').toLowerCase().replace(/[^a-z]/g,'');
  const eBgStyle = entidadBg || entidadBgs[entKey] || '';
  const entLabel = {colpensiones:'🏛 Colpensiones',ecopetrol:'🛢 Ecopetrol',bancolombia:'🏦 Bancolombia'}[entKey]||entidad;

  TERCEROS_DB[nit] = Object.assign(TERCEROS_DB[nit]||{}, {
    nit, nombre, entidad: entKey, entidadLabel: entLabel,
    servicio, supervisor, prom:p, zona, periodicidad, estado:'Activo',
    dims: (extras?.dims)||[],
    nocontrato: extras?.nocontrato||'', domicilio: extras?.domicilio||'',
    cargo: extras?.cargo||'', objetivo: extras?.objetivo||'',
    finicio: extras?.finicio||'', fterm: extras?.fterm||'', valor: extras?.valor||''
  });

  // Remove existing row
  const tbody = document.getElementById('tbody-terceros');
  if(!tbody) return;
  tbody.querySelectorAll('tr').forEach(tr=>{
    if(tr.querySelector('td:first-child')?.textContent.trim()===nit) tr.remove();
  });

  const tr = document.createElement('tr');
  tr.setAttribute('data-entidad', (entidad||'').toLowerCase().replace(/[^a-z]/g,''));
  tr.setAttribute('data-crit', isNaN(p)?'0':p.toFixed(2));
  tr.innerHTML =
    `<td style="font-size:12px;">${nit}</td>`+
    `<td><b>${nombre}</b></td>`+
    `<td><span class="chip" style="font-size:10.5px;${eBgStyle}">${entLabel}</span></td>`+
    `<td style="font-size:12px;">${servicio||'—'}</td>`+
    `<td style="font-size:12px;">${supervisor||'—'}</td>`+
    `<td><span class="chip ${chipC}" style="font-weight:800;">${isNaN(p)?'—':p.toFixed(2)}</span></td>`+
    `<td><span class="chip ${chipPer}" style="font-size:10px;">${evalLabel}</span></td>`+
    `<td><span class="chip c-ok">Activo</span></td>`+
    `<td style="white-space:nowrap;">
      <button class="btn btn-outline btn-xs" onclick="verDetalleTercero('${nit}')" style="margin-right:3px;">👁 Ver</button>
      <button class="btn btn-xs" onclick="quitarTercero('${nit}')" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;">🗑 Borrar</button>
    </td>`;
  tbody.appendChild(tr);

  // Register in cuestionario if prom >= 3
  if(p >= 3){
    const tipologias = (extras?.dims||[]).map(d=>({key:d.key, nombre:window._nombreTipologia(d)}));
    registrarTerceroPendiente(nit, nombre, entKey, p, zona, periodicidad, tipologias);
  }
  sincronizarSelectorCuestionario();
  updateDashboard();
}

// ─── irAlCuestionario ─────────────────────────────────────────
function irAlCuestionario(nit){
  const navItems = document.querySelectorAll('.nav-item');
  let navQ;
  navItems.forEach(n=>{ if(n.getAttribute('onclick')?.includes('pg-cuestionario')) navQ=n; });
  if(navQ) goPage(navQ,'pg-cuestionario');
  setTimeout(()=>{
    switchCuestTab('cuest');
    const sel = document.getElementById('q-tercero');
    if(sel){ sel.value=nit; cargarCuestionarioTercero(); }
  }, 150);
}



// ─── VER DETALLE TERCERO (modal dinámico) ─────────────────────
function verDetalleTercero(nit){
  // 1. Open modal first
  const overlay = document.getElementById('m-ver-tercero');
  if(!overlay){ alert('Modal no encontrado'); return; }
  overlay.classList.add('open');

  // 2. Fill body
  const body = document.getElementById('ver-tercero-body');
  if(!body) return;

  const db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
  const t = db[nit];

  if(!t){
    // Fallback: read from table row
    const rows = document.querySelectorAll('#tbody-terceros tr');
    let found = null;
    rows.forEach(tr => { if(tr.cells[0]?.textContent.trim()===nit) found=tr; });
    if(!found){ body.innerHTML='<p style="color:#6B7280;text-align:center;padding:20px;">Tercero no encontrado: '+nit+'</p>'; return; }
    const cells = found.cells;
    const p = parseFloat(cells[5]?.textContent)||0;
    const col = p>=4?'#DC2626':p>=3?'#EA580C':'#16A34A';
    body.innerHTML = '<div style="display:flex;gap:10px;margin-bottom:14px;"><div style="flex:1;background:#F8FAFC;border-radius:8px;padding:14px;"><div style="font-size:11px;color:#6B7280;">Nombre</div><div style="font-size:15px;font-weight:700;color:#1a3a5c;">'+cells[1]?.textContent+'</div><div style="font-size:11px;color:#6B7280;margin-top:2px;">NIT: '+nit+'</div></div><div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;min-width:100px;"><div style="font-size:10px;color:#6B7280;">Criticidad</div><div style="font-size:28px;font-weight:800;font-family:Montserrat,sans-serif;color:'+col+';">'+p.toFixed(2)+'</div></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Servicio</div><div style="font-weight:600;">'+cells[3]?.textContent+'</div></div><div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Supervisor</div><div style="font-weight:600;">'+cells[4]?.textContent+'</div></div></div>';
    const bEd = document.getElementById('btn-editar-desde-ver');
    const bQ = document.getElementById('btn-cuestionario-desde-ver');
    if(bEd){
      bEd.style.display = (window.currentUser||{}).rol === 'Cliente' ? 'none' : 'inline-flex';
      bEd.onclick = ()=>{ overlay.classList.remove('open'); editarTerceroModal(nit); };
    }
    if(bQ){ bQ.style.display = p>=3?'inline-flex':'none'; bQ.onclick=()=>{ overlay.classList.remove('open'); irAlCuestionario(nit); }; }
    return;
  }

  const NLABELS = {'5':'CRÍTICO','4':'ALTO','3':'MEDIO','2':'BAJO','1':'MUY BAJO','na4':'N/A','na2':'N/A'};
  const NCOLORS = {'5':'#DC2626','4':'#EA580C','3':'#D97706','2':'#2563EB','1':'#16A34A','na4':'#9CA3AF','na2':'#9CA3AF'};
  const p = parseFloat(t.prom);
  const col = p>=4?'#DC2626':p>=3?'#EA580C':'#16A34A';
  const chipClass = p>=4?'c-crit':p>=3?'c-alto':'c-bajo';

  let durStr = '—';
  if(t.finicio && t.fterm){
    const ms = new Date(t.fterm) - new Date(t.finicio);
    const anios = Math.floor(ms/1000/60/60/24/365.25);
    const meses = Math.round((ms/1000/60/60/24/365.25 - anios)*12);
    durStr = anios>0 ? anios+' año'+(anios>1?'s':'')+(meses>0?' y '+meses+' mes'+(meses>1?'es':''):'') : meses+' mes'+(meses>1?'es':'');
  }
  const valFmt = t.valor ? 'COP '+parseFloat(t.valor).toLocaleString('es-CO',{maximumFractionDigits:0}) : '—';

  const dimsHtml = (t.dims||[]).map(d => {
    const v = d.val||''; const isNA = v.startsWith('na');
    const dispV = isNA?'N/A':(v||'—');
    const lbl = NLABELS[v]||'';
    const clr = NCOLORS[v]||'#9CA3AF';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F3F4F6;">'+
      '<span style="font-size:11.5px;color:#374151;">'+d.nombre+'</span>'+
      '<span style="display:flex;align-items:center;gap:5px;">'+
      '<span style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:'+clr+';">'+dispV+'</span>'+
      '<span style="font-size:9px;font-weight:700;color:'+clr+';">'+lbl+'</span>'+
      '</span></div>';
  }).join('');

  body.innerHTML =
    '<div style="display:flex;gap:10px;margin-bottom:14px;">'+
      '<div style="flex:1;background:#F8FAFC;border-radius:8px;padding:14px;">'+
        '<div style="font-size:11px;color:#6B7280;">Nombre / Razón Social</div>'+
        '<div style="font-size:16px;font-weight:700;color:#1a3a5c;">'+t.nombre+'</div>'+
        '<div style="font-size:11px;color:#6B7280;margin-top:3px;">NIT: '+t.nit+' &nbsp;·&nbsp; '+t.entidadLabel+'</div>'+
      '</div>'+
      '<div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;min-width:110px;">'+
        '<div style="font-size:10px;color:#6B7280;margin-bottom:2px;">Prom. Criticidad</div>'+
        '<div style="font-family:Montserrat,sans-serif;font-size:28px;font-weight:800;color:'+col+';">'+p.toFixed(2)+'</div>'+
        '<span class="chip '+chipClass+'" style="font-size:10px;">'+t.zona+'</span>'+
      '</div>'+
    '</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Servicio</div><div style="font-weight:600;font-size:12px;">'+t.servicio+'</div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Supervisor</div><div style="font-weight:600;font-size:12px;">'+t.supervisor+'</div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">N° Contrato</div><div style="font-weight:600;font-size:12px;">'+(t.nocontrato||'—')+'</div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Domicilio</div><div style="font-weight:600;font-size:12px;">'+(t.domicilio||'—')+'</div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Vigencia</div><div style="font-weight:600;font-size:12px;">'+(t.finicio||'—')+' → '+(t.fterm||'—')+'<br><span style="font-size:10px;color:#6B7280;">'+durStr+'</span></div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Valor contrato</div><div style="font-weight:600;font-size:12px;">'+valFmt+'</div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Evaluación</div><div><span class="chip '+chipClass+'" style="font-size:10px;">'+t.periodicidad+'</span></div></div>'+
      '<div style="background:#F8FAFC;padding:10px;border-radius:6px;"><div style="font-size:10px;color:#6B7280;">Estado</div><div><span class="chip c-ok">'+(t.estado||'Activo')+'</span></div></div>'+
    '</div>'+
    (t.objetivo ? '<div style="background:#F8FAFC;padding:10px;border-radius:6px;margin-bottom:12px;"><div style="font-size:10px;color:#6B7280;">Objetivo del contrato</div><div style="font-size:12px;">'+t.objetivo+'</div></div>' : '')+
    '<div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">'+
      '<div style="padding:8px 12px;background:#1a3a5c;display:flex;justify-content:space-between;align-items:center;">'+
        '<span style="font-size:11.5px;font-weight:700;color:white;">📊 Clasificacion de Terceros</span>'+
        '<span style="font-size:11px;color:rgba(255,255,255,.7);">Promedio: <b style="color:white;">'+p.toFixed(2)+'</b></span>'+
      '</div>'+
      '<div style="padding:8px 12px;">'+(dimsHtml||'<span style="color:#6B7280;font-size:12px;font-style:italic;">Sin tipologías clasificadas</span>')+'</div>'+
    '</div>';

  const bEd = document.getElementById('btn-editar-desde-ver');
  const bQ  = document.getElementById('btn-cuestionario-desde-ver');
  if(bEd){
    bEd.style.display = (window.currentUser||{}).rol === 'Cliente' ? 'none' : 'inline-flex';
    bEd.onclick = ()=>{ overlay.classList.remove('open'); editarTerceroModal(nit); };
  }
  if(bQ){ bQ.style.display = p>=3?'inline-flex':'none'; bQ.onclick=()=>{ overlay.classList.remove('open'); irAlCuestionario(nit); }; }
}


// ─── SINCRONIZAR SELECTOR CUESTIONARIO ────────────────────────
function sincronizarSelectorCuestionario(){
  const sel=document.getElementById('q-tercero');
  if(!sel) return;

  // Restaurar datos persistidos antes de renderizar
  try{
    const saved=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
    if(saved.TERCEROS_DB) Object.assign(TERCEROS_DB, saved.TERCEROS_DB);
    if(saved.tercerosPendientesCuestionario){
      saved.tercerosPendientesCuestionario.forEach(function(t){
        if(!tercerosPendientesCuestionario.find(function(x){return x.nit===t.nit;}))
          tercerosPendientesCuestionario.push(t);
      });
    }
  }catch(e){}

  const prev=sel.value;
  sel.innerHTML='<option value="">— Selecciona un tercero —</option>';

  // Merge TERCEROS_DB + tercerosPendientesCuestionario — SIN filtro de prom ni entidad
  const nitsVisto=new Set();
  const addOpt=(nit,nombre,prom)=>{
    if(!nit||nitsVisto.has(nit)) return;
    nitsVisto.add(nit);
    const opt=document.createElement('option');
    opt.value=nit;
    opt.textContent=nombre+' ('+(isNaN(parseFloat(prom))?'—':parseFloat(prom).toFixed(2))+')';
    sel.appendChild(opt);
  };

  Object.values(TERCEROS_DB).forEach(t=>addOpt(t.nit,t.nombre,t.prom));
  tercerosPendientesCuestionario.forEach(t=>addOpt(t.nit,t.nombre,t.prom));

  if(prev && sel.querySelector(`option[value="${prev}"]`)) sel.value=prev;
  // Auto-seleccionar si solo hay uno o si el anterior sigue disponible
  if(!sel.value && sel.options.length===2) sel.value=sel.options[1].value;
  if(sel.value && sel.value!==prev) try{cargarCuestionarioTercero();}catch(e){}
  const noOpts=sel.options.length<=1;
  const msgEl=document.getElementById('q-sin-pendientes');
  if(msgEl) msgEl.style.display=noOpts?'block':'none';
  // Update info label
  const infoEl=document.getElementById('q-info-prom');
  if(infoEl) infoEl.textContent = noOpts
    ? 'No hay terceros registrados aún. Guarda uno en Clasificación de Terceros.'
    : (sel.options.length-1)+' tercero(s) disponible(s)';
}


// ════════════════════════════════════════════════════════════════
// CUESTIONARIO AC — MOTOR COMPLETO v4
// ════════════════════════════════════════════════════════════════


const SECCIONES_INFO = {
  op:   { label:'Riesgo Operacional',                      icon:'⚙️',  color:'#1D4ED8', bg:'#EFF6FF', border:'#93C5FD' },
  cn:   { label:'Continuidad del Negocio',                 icon:'🔁',  color:'#0D9488', bg:'#F0FDFA', border:'#99F6E4' },
  si:   { label:'Seguridad de la Información y Ciberseguridad', icon:'🔐',  color:'#DC2626', bg:'#FEF2F2', border:'#FCA5A5' },
  cu:   { label:'Cumplimiento Regulatorio',                icon:'📜',  color:'#16A34A', bg:'#F0FDF4', border:'#86EFAC' },
  fr:   { label:'Fraude y Corrupción',                     icon:'🚨',  color:'#EA580C', bg:'#FFF7ED', border:'#FED7AA' },
  pa:   { label:'Riesgo País',                             icon:'🌍',  color:'#7C3AED', bg:'#F5F3FF', border:'#C4B5FD' },
  laft: { label:'LAFT — Lavado de Activos / Terrorismo',   icon:'⚖️',  color:'#0369A1', bg:'#F0F9FF', border:'#7DD3FC' },
  fi:   { label:'Capacidad Financiera',icon:'💰',  color:'#B45309', bg:'#FFFBEB', border:'#FDE68A' },
};

const ATRIB_LABELS = ['¿Implementado?','¿Documentado?','¿Asignado?','¿Divulgado?','¿Evidencia?','¿Monitoreado?'];

// ── Nombre completo de una tipología, nunca la clave abreviada (si/fr/cn/...) ──
// Se usa en todo el sistema y en todos los roles para mostrar las tipologías.
window._nombreTipologia = function(d){
  if(!d) return '';
  var raw = (d.tipologia||d.nombre||'').toString().trim();
  var key = (d.key||'').toString().toLowerCase();
  if(!key && raw){
    var alias={
      'operativo':'op','riesgo operativo':'op','procesos soportados por el tercero':'op',
      'continuidad de negocio':'cn','importancia en la continuidad de negocio':'cn',
      'seguridad de la información':'si','seguridad de la información y ciberseguridad':'si','acceso a la información':'si',
      'cumplimiento':'cu','cumplimiento regulatorio':'cu','regulación-cumplimiento':'cu',
      'fraude y corrupción':'fr','fraude/corrupción':'fr','fraude y/o corrupción':'fr',
      'laft':'laft','lavado de activos y financiación al terrorismo (laft)':'laft',
      'capacidad financiera':'fi','financiero':'fi','riesgo país':'pa','reputacional':'reputacional'
    };
    var normalized=raw.toLowerCase().replace(/\s+/g,' ').trim();
    key=alias[normalized]||Object.keys(alias).find(function(k){return normalized.indexOf(k)>=0;})&&alias[Object.keys(alias).find(function(k){return normalized.indexOf(k)>=0;})]||'';
  }
  // Nombre canónico por clave: evita las frases largas del catálogo de
  // clasificación ("Importancia en la Continuidad de Negocio") en las
  // tablas de Aprobación, reportes y listados.
  var CANON = { 
  op:'Riesgo Operacional', 
  cn:'Continuidad de Negocio', 
  si:'Seguridad de la Información y Ciberseguridad', 
  cu:'Cumplimiento Regulatorio', 
  fr:'Fraude y Corrupción', 
  laft:'LAFT', 
  fi:'Capacidad Financiera', 
  pa:'Riesgo País',
  reputacional:'Reputacional'
};
  if(CANON[key]) return CANON[key];
  var nombre = raw;
  var pareceAbreviado = !nombre || nombre.toLowerCase()===key.toLowerCase() || nombre.length<=4;
  if(pareceAbreviado){
    var full = (SECCIONES_INFO[key] && SECCIONES_INFO[key].label)
      || (typeof TIPOLOGIA_CATALOG!=='undefined' && TIPOLOGIA_CATALOG[key] && TIPOLOGIA_CATALOG[key].nombre)
      || nombre || key || '';
    return full.replace(/\n/g,' ');
  }
  // Si el nombre trae la frase larga con paréntesis, usar el contenido del paréntesis
  var m = nombre.match(/\(([^)]+)\)\s*$/);
  if(m && nombre.length > 40) return m[1].replace(/^Riesgos?\s+/i,'').trim().replace(/^\w/,function(c){return c.toUpperCase();});
  return nombre.replace(/\n/g,' ');
};

// ─── CARGAR CUESTIONARIO PARA TERCERO ─────────────────────────
function cargarCuestionarioTercero(){
  // Releer localStorage ANTES de renderizar: si el Admin quitó/agregó
  // controles en otra pestaña o sesión, el Evaluador los ve al instante.
  try{ window._lsLoad && window._lsLoad(); }catch(e){}
  
  // 🔄 CARGAR DATOS FRESCO DE AZURE SQL ANTES DE RENDERIZAR
  const sel  = document.getElementById('q-tercero');
  const nit  = sel?.value;
  
  if(nit && typeof API_BASE !== 'undefined' && API_BASE){
    // Fetch datos frescos del tercero
    fetch(API_BASE + '/api/terceros/' + nit)
      .then(r => r.json())
      .then(d => {
        if(d.ok && d.data){
          // Actualizar TERCEROS_DB con datos de Azure SQL
          console.log('[SGRT] 📥 Tercero cargado de Azure SQL:', nit, d.data);
          if(!window.TERCEROS_DB) window.TERCEROS_DB = {};
          
          // Parsear Clasificacion JSON si viene como string
          let clasificacionData = {};
          if(d.data.Clasificacion){
            try{
              clasificacionData = typeof d.data.Clasificacion === 'string' 
                ? JSON.parse(d.data.Clasificacion)
                : d.data.Clasificacion;
            }catch(e){}
          }
          
          // Conservar contratos, aprobaciones, respuestas y configuración local.
          // La API de terceros devuelve principalmente los datos maestros; si se
          // reemplaza el objeto completo, se pierde el flujo individual por contrato.
          var previo = window.TERCEROS_DB[nit] || {};
          window.TERCEROS_DB[nit] = Object.assign({}, previo, {
            nit: nit,
            nombre: d.data.Nombre || d.data.nombre || previo.nombre || '',
            entidad: d.data.Entidad || d.data.entidad || previo.entidad || '',
            supervisor: d.data.Supervisor || d.data.supervisor || previo.supervisor || '',
            domicilio: d.data.Domicilio || d.data.domicilio || previo.domicilio || '',
            prom: d.data.PromedioCalificacion != null ? d.data.PromedioCalificacion : (d.data.promedioCalificacion != null ? d.data.promedioCalificacion : previo.prom),
            zona: d.data.ZonaRiesgo || d.data.zonaRiesgo || previo.zona || '',
            nivelRiesgo: d.data.NivelRiesgo || d.data.nivelRiesgo || previo.nivelRiesgo || '',
            dimsPorContrato: Object.keys(clasificacionData.dimsPorContrato || {}).length ? clasificacionData.dimsPorContrato : (previo.dimsPorContrato || {}),
            promPorContrato: Object.keys(clasificacionData.promPorContrato || {}).length ? clasificacionData.promPorContrato : (previo.promPorContrato || {}),
            estado: d.data.Estado || d.data.estado || previo.estado || 'Activo'
          });
          
          console.log('[SGRT] ✅ TERCEROS_DB actualizado:', window.TERCEROS_DB[nit]);
        }
      })
      .catch(e => {
        console.warn('[SGRT] ⚠️ No se pudo cargar de Azure SQL (usando localStorage):', e.message);
      });
  }
  
  const wrap = document.getElementById('q-secciones-wrap');
  const info = document.getElementById('q-tercero-info');
  const footer= document.getElementById('q-footer');
  const noMsg= document.getElementById('q-sin-pendientes');

  if(!nit){
    if(wrap)   wrap.innerHTML = '';
    if(info)   info.style.display = 'none';
    if(footer) footer.style.display = 'none';
    var bn0=document.getElementById('q-tercero-banner'); if(bn0) bn0.style.display='none';
    return;
  }

  nitActual = nit;
  try{
    var bn=document.getElementById('q-tercero-banner');
    var bnNom=document.getElementById('q-tercero-banner-nombre');
    var tDb=(window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{})||{})[nit];
    if(bn && bnNom){ bnNom.textContent=(tDb&&tDb.nombre?tDb.nombre:nit)+' · NIT '+nit; bn.style.display='flex'; }
    // Poblar el selector de contrato del Evaluador (banner del cuestionario)
    // y también el del panel Instrucciones para que estén sincronizados.
    try{ window.qPoblarContratos && window.qPoblarContratos(nit); }catch(e2){}
    try{ window.acPoblarContratos && window.acPoblarContratos(nit); }catch(e2){}
  }catch(e){}
  // Mostrar Agregar Control solo para rol Operativo (Adm. de Riesgos)
  var btnAC=document.getElementById('btn-agregar-ctrl');
  if(btnAC) btnAC.style.display=(window.currentUser&&window.currentUser.rol==='Operativo')?'inline-flex':'none';
  if(!CUEST_RESPUESTAS[nit]) CUEST_RESPUESTAS[nit] = {};
  if(!CUEST_CTRL_CUSTOM[nit]) CUEST_CTRL_CUSTOM[nit] = {};
  // Cargar controles custom de localStorage (cross-rol)
  try{
    var sharedCC=JSON.parse(localStorage.getItem('sgrt_cuest_custom')||'{}');
    if(sharedCC[nit]){
      Object.keys(sharedCC[nit]).forEach(function(k){
        if(!CUEST_CTRL_CUSTOM[nit][k]||!CUEST_CTRL_CUSTOM[nit][k].length) CUEST_CTRL_CUSTOM[nit][k]=sharedCC[nit][k];
      });
    }
  }catch(e){}
  // Cargar respuestas guardadas de otros roles (cross-rol sync)
  try{
    var sharedR=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
    if(sharedR[nit]){
      Object.keys(sharedR[nit]).forEach(function(k){
        if(!CUEST_RESPUESTAS[nit][k]) CUEST_RESPUESTAS[nit][k]=sharedR[nit][k];
      });
    }
  }catch(e){}

  // ── Restaurar borrador si existe y no hay respuestas guardadas ──
  try{
    const bKey = 'cuest_borrador_' + nit;
    const bRaw = localStorage.getItem(bKey);
    if(bRaw){
      const b = JSON.parse(bRaw);
      if(b.respuestas && Object.keys(b.respuestas).length > 0){
        // Merge borrador into CUEST_RESPUESTAS (only fill empty keys)
        Object.keys(b.respuestas).forEach(k=>{
          if(!CUEST_RESPUESTAS[nit][k]) CUEST_RESPUESTAS[nit][k] = b.respuestas[k];
        });
      }
      if(b.customCtrls && Object.keys(b.customCtrls).length > 0){
        Object.keys(b.customCtrls).forEach(k=>{
          if(!CUEST_CTRL_CUSTOM[nit][k] || !CUEST_CTRL_CUSTOM[nit][k].length)
            CUEST_CTRL_CUSTOM[nit][k] = b.customCtrls[k];
        });
      }
    }
  }catch(e){}

  // Get tercero data — prefer TERCEROS_DB, fallback localStorage
  let t = TERCEROS_DB[nit] || tercerosPendientesCuestionario.find(x=>x.nit===nit);
  if(!t){
    try{
      const saved=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
      if(saved.TERCEROS_DB && saved.TERCEROS_DB[nit]){
        t = saved.TERCEROS_DB[nit];
        TERCEROS_DB[nit] = t; // restore
      }
    }catch(e){}
  }
  if(!t){
    if(wrap) wrap.innerHTML='<div style="text-align:center;padding:24px;"><div style="font-size:16px;margin-bottom:8px;">⚠️</div><div style="font-size:13px;color:#6c757d;">Tercero no encontrado en base de datos local.<br>Guarda el tercero primero en <b>Clasificación de Terceros</b>.</div></div>';
    return;
  }

  // Normalize: ensure t has dims (convert tipologias if needed)
  if((!t.dims || t.dims.length===0) && t.tipologias && t.tipologias.length>0){
    if(!t.dimsPorContrato) t.dimsPorContrato={}; t.dimsPorContrato[t.contratoEval] = t.tipologias.map(tip=>({
      key: tip.key,
      nombre: tip.nombre || SECCIONES_INFO[tip.key]?.label || tip.key,
      val: ''
    }));
    // Save back to TERCEROS_DB
    if(TERCEROS_DB[nit]) TERCEROS_DB[nit].dims = t.dims;
  }

  let tipKeys = [];
  
  // ─── CARGAR TIPOLOGÍAS DEL CONTRATO ESPECÍFICO SI APLICA ─────────────────
  var dimsParaCargar = t.dims || [];
  var contratoActual = t.contratoEval || '';
  if(contratoActual && t.dimsPorContrato && t.dimsPorContrato[contratoActual]){
    dimsParaCargar = t.dimsPorContrato[contratoActual];
    try{showToast('📌 Cargando tipologías del Contrato ' + contratoActual,'info',1500);}catch(e){}
  }
  
  if(dimsParaCargar && dimsParaCargar.length > 0){
    tipKeys = [...new Set(dimsParaCargar.map(d=>d.key))];
  } else {
    // Sin dims definidas: usar todas las tipologías disponibles
    tipKeys = Object.keys(window.CUESTIONARIO_CONTROLES||{});
    if(!tipKeys.length) tipKeys = ['op','cn','si','cu','fr','laft'];
  }

  // ── Aplicar filtro de Info Tercera Parte ──────────────
  // If Info form was filled, only show dimensions marked as 'Sí'
  var infFilter = t._infDimsFilter || window._infDimsFilter || [];
  var infNA     = t._infDimsNA     || window._infDimsNA     || [];
  if(infFilter.length > 0){
    // Keep only tipKeys that are in the filter
    tipKeys = tipKeys.filter(function(k){ return infFilter.includes(k); });
    // Also add any from filter not already in tipKeys
    infFilter.forEach(function(k){ if(!tipKeys.includes(k)) tipKeys.push(k); });
  }
  // Remove those explicitly marked No aplica
  if(infNA.length > 0){
    tipKeys = tipKeys.filter(function(k){ return !infNA.includes(k); });
  }

  // Show info box — keep hidden, data used internally only
  if(info){
    info.style.display = 'none';
    const p = parseFloat(t.prom);
    document.getElementById('qi-nit').textContent  = nit;
    const promEl = document.getElementById('qi-prom');
    promEl.textContent = p.toFixed(2);
    document.getElementById('qi-zona').textContent = t.zona||'—';
    document.getElementById('qi-tips').textContent = tipKeys.map(k=>SECCIONES_INFO[k]?.label||k).join(' · ');
  }

  // Mostrar tipologías en panel visible
  try{
    var tipPanel = document.getElementById('q-tipologias-panel');
    var tipLista = document.getElementById('q-tipologias-lista');
    if(tipPanel && tipLista && tipKeys.length > 0){
      tipPanel.style.display = 'block';
      tipLista.innerHTML = tipKeys.map(function(k){
        var label = (SECCIONES_INFO[k]&&SECCIONES_INFO[k].label) ? SECCIONES_INFO[k].label : k;
        var icon = (SECCIONES_INFO[k]&&SECCIONES_INFO[k].icon) ? SECCIONES_INFO[k].icon : '📋';
        return '<div style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:#f0f9ff;border:1px solid #93c5fd;border-radius:6px;font-size:12.5px;font-weight:600;color:#0c4a6e;"><span>'+icon+'</span><span>'+label+'</span></div>';
      }).join('');
    } else if(tipPanel){
      tipPanel.style.display = 'none';
    }
  }catch(e){}

  // Render all sections
  if(wrap) wrap.innerHTML = tipKeys.map(key => renderSeccionCuest(nit, key)).join('');

  // Show footer
  if(footer) footer.style.display = 'flex';
  // Mostrar controles custom ya agregados
  try{
    var cwrap=document.getElementById('q-controles-custom-wrap');
    if(cwrap){
      var ccItems=[];
      tipKeys.forEach(function(k){
        var cc=window.CUEST_CTRL_CUSTOM&&window.CUEST_CTRL_CUSTOM[nit]&&window.CUEST_CTRL_CUSTOM[nit][k]?window.CUEST_CTRL_CUSTOM[nit][k]:[];
        cc.forEach(function(c){
          ccItems.push('<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f0f9ff;border:1px solid #93c5fd;border-radius:6px;font-size:12px;"><span style="color:#1d4ed8;">＋</span><span style="flex:1;">'+c.ctrl+'</span><span style="font-size:10px;color:var(--muted);">'+((window.SECCIONES_INFO&&window.SECCIONES_INFO[k])?window.SECCIONES_INFO[k].label:k)+'</span></div>');
        });
      });
      cwrap.innerHTML = ccItems.length
        ? '<div style="margin-bottom:4px;font-size:11px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.04em;">Controles personalizados agregados ('+ccItems.length+')</div>'+ccItems.join('')
        : '';
    }
  }catch(e){}

  // ── Recalcular progreso y madurez inmediatamente tras renderizar ──
  // Esto es clave: cuando se cargan datos de localStorage los selects tienen
  // el valor correcto en el HTML pero el onchange nunca se disparó, así que
  // el badge y la barra de progreso mostraban 0%. Ahora se recalcula todo.
  actualizarProgressoCuest(nit, tipKeys);
  // Recalcular cada sección con un pequeño delay para que el DOM esté listo
  setTimeout(function(){
    try{
      tipKeys.forEach(function(k){ actualizarBadgeSec(nit, k); });
    }catch(e){}
  }, 80);
}

// ─── RENDER SECCIÓN ───────────────────────────────────────────
function renderSeccionCuest(nit, key){
  const esFinanciero = key === 'fi';
  if(esFinanciero) return renderSeccionFinancieroCuest(nit);

  const esCustKey = key.startsWith('custom_');

  // For custom tipologías: get real name from TIPOLOGIA_CATALOG or dims
  let cfgLabel = key, cfgIcon = '📋';
  if(esCustKey){
    const cat = TIPOLOGIA_CATALOG[key];
    if(cat){
      cfgLabel = (cat.nombre||key).replace(/\n/g,' ');
      cfgIcon = cat.icon || '📋';
    } else {
      // Fallback: check dims
      const t2 = TERCEROS_DB[nit] || tercerosPendientesCuestionario.find(x=>x.nit===nit);
      const dim2 = (t2?.dims||[]).find(d=>d.key===key);
      cfgLabel = dim2?.nombre || key;
    }
  }

  const cfg = esCustKey
    ? { label: cfgLabel, icon: cfgIcon, color:'#6B7280', bg:'#F9FAFB', border:'#D1D5DB' }
    : (SECCIONES_INFO[key] || { label: key, icon:'📋', color:'#6B7280', bg:'#F9FAFB', border:'#D1D5DB' });

  // Lista canónica: config del Admin + ocultos/personalizados por tercero.
  // Es la MISMA lista que usa el progreso, así el total siempre coincide.
  // Si el tercero está en modo "por contrato" y hay un contratoEval elegido,
  // se aplican también los controles ocultos/agregados de ese contrato.
  var _tCfg = (window.TERCEROS_DB||{})[nit];
  var _contratoActivo = (_tCfg && _tCfg.modoEval==='contrato' && _tCfg.contratoEval) ? _tCfg.contratoEval : '';
  const controles = window._ctrlsCuest
    ? window._ctrlsCuest(nit, key, _contratoActivo)
    : [...(CUESTIONARIO_CONTROLES[key]||[]), ...(CUEST_CTRL_CUSTOM[nit]?.[key]||[]).map((c,i)=>({...c, n: (CUESTIONARIO_CONTROLES[key]?.length||0)+i+1, esCustom:true}))];

  const total = controles.length;
  const respondidos = controles.filter(c=>{
    const a1 = CUEST_RESPUESTAS[nit]?.[key]?.[c.n]?.a1 || '';
    return a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
  }).length;

  const ctrlsHtml = controles.map(c => renderControlRow(nit, key, c)).join('');

  return `
  <div class="card" data-tipkey="${key}" style="margin-bottom:10px;border-left:4px solid ${cfg.color};overflow:hidden;">
    <div style="padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${cfg.bg};"
      onclick="toggleSeccionCuest('sc-${key}','sa-${key}')">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">${cfg.icon}</span>
        <div>
          <div style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;color:var(--navy);">${cfg.label}</div>
          <div style="font-size:11px;color:var(--muted);">${total} controles</div>
        </div>
        <span id="sc-badge-${key}" style="font-size:11px;padding:2px 10px;background:white;border:1px solid ${cfg.border};border-radius:10px;color:${respondidos===total&&total>0?cfg.color:'var(--muted)'};">
          ${respondidos}/${total} respondidos
        </span>
      </div>
      <span id="sa-${key}" style="font-size:18px;color:var(--muted);">▲</span>
    </div>
    <div id="sc-${key}" style="display:block;padding:0 16px 14px;">
      ${ctrlsHtml}

    </div>
  </div>`;
}

// ─── RENDER FILA DE CONTROL ───────────────────────────────────
function renderControlRow(nit, key, c){
  const saved = CUEST_RESPUESTAS[nit]?.[key]?.[c.n] || {};
  const a1val = saved.a1 || '';
  const obs   = saved.obs || '';

  const selectAtrib = (ai) => {
    const sid = `qa_${nit.replace(/[^a-z0-9]/gi,'_')}_${key}_${c.n}_a${ai}`;
    const val = saved['a'+ai] || '';
    const disabled = (ai>1 && (a1val==='No'||a1val==='No Aplica')) ? 'disabled style="opacity:.4;"' : '';
    return `<div style="text-align:center;">
      <div style="font-size:9px;color:var(--muted);margin-bottom:3px;font-weight:600;">${ai}. ${ATRIB_LABELS[ai-1]}</div>
      <select id="${sid}" onchange="onChangeAtribCuest('${nit}','${key}',${c.n},${ai})" ${disabled}
        style="width:100%;padding:4px 2px;border:1px solid var(--border2);border-radius:4px;font-size:11px;text-align:center;cursor:pointer;">
        <option value="">—</option>
        <option value="Si" ${val==='Si'?'selected':''}>Sí ✓</option>
        <option value="No" ${val==='No'?'selected':''}>No ✗</option>
        <option value="No Aplica" ${val==='No Aplica'?'selected':''}>N/A</option>
      </select>
    </div>`;
  };

  const a1Color = a1val==='Si'?'#16A34A':a1val==='No'?'var(--red)':a1val==='No Aplica'?'#6B7280':'var(--muted)';

  return `
  <div id="cr_${nit.replace(/[^a-z0-9]/gi,'_')}_${key}_${c.n}" style="border-bottom:1px solid #F3F4F6;padding:12px 0;">
    <div style="display:flex;gap:10px;margin-bottom:8px;">
      <div style="min-width:28px;height:28px;border-radius:50%;background:${a1val==='Si'?'#16A34A':a1val==='No'?'var(--red)':'#E5E7EB'};
        color:${a1val?'white':'#6B7280'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">${c.n}</div>
      <div style="flex:1;">
        <div style="font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:2px;">${c.ctrl||'Control '+c.n}</div>
        <div style="font-size:11.5px;color:#374151;line-height:1.5;">${c.req||''}</div>
        ${c.doc?`<div style="font-size:10.5px;color:var(--muted);margin-top:3px;font-style:italic;">📎 ${c.doc}</div>`:''}
      </div>
      ${c.esCustom?`<button onclick="quitarCtrlCustomCuest('${nit}','${key}',${c.n})"
        style="flex-shrink:0;padding:2px 8px;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);border-radius:4px;font-size:10px;cursor:pointer;">✕</button>`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;padding:0 38px;margin-bottom:6px;">
      ${[1,2,3,4,5,6].map(ai=>selectAtrib(ai)).join('')}
    </div>
    <!-- Panel de valoración inline — se actualiza en tiempo real con cada cambio -->
    ${(()=>{
      const val = _calcCtrlValoracion(saved);
      const bgGrad = val.madurez==='NO APLICA'?'#F9FAFB':
        val.pct>=80?'linear-gradient(90deg,#F0FDF4,#DCFCE7)':
        val.pct>=60?'linear-gradient(90deg,#FEFCE8,#FEF9C3)':
        val.pct>=40?'linear-gradient(90deg,#FFF7ED,#FFEDD5)':
        val.pct>0?'linear-gradient(90deg,#FEF2F2,#FEE2E2)':'#F9FAFB';
      return `<div id="valCtrl-${key}-${c.n}"
        style="margin:4px 38px 6px;padding:8px 12px;background:${bgGrad};border:1px solid ${val.color||'#E5E7EB'}55;border-radius:8px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="font-size:9.5px;font-weight:700;color:#92400E;text-transform:uppercase;white-space:nowrap;">Valoración del Control</div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Nivel Cumplimiento</div>
            <div id="vc-pct-${key}-${c.n}" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:${val.color||'var(--muted)'};">${val.nivelCumpl||'—'}</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border);"></div>
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Nivel de Madurez</div>
            <div id="vc-mad-${key}-${c.n}" style="font-size:10.5px;font-weight:700;color:${val.color||'var(--muted)'};background:${val.bgColor||'transparent'};padding:3px 8px;border-radius:8px;">${val.madurez||'—'}</div>
          </div>
          <div style="width:1px;height:28px;background:var(--border);"></div>
          <div style="text-align:center;">
            <div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:2px;">Valoración</div>
            <div id="vc-val-${key}-${c.n}" style="font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;color:${val.color||'var(--muted)'};">${val.valorMad!==null&&val.valorMad>0?val.valorMad+'.0':'—'}</div>
          </div>
        </div>
      </div>`;
    })()}
    <div style="padding:0 38px;">
      <textarea id="obs_${nit.replace(/[^a-z0-9]/gi,'_')}_${key}_${c.n}"
        onchange="onChangeObsCuest('${nit}','${key}',${c.n},this.value)"
        rows="1" placeholder="Fortalezas, brechas u observaciones del auditor..."
        style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:4px;font-size:11.5px;font-family:inherit;resize:vertical;">${obs}</textarea>
    </div>
    <div style="padding:4px 38px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <label style="display:flex;align-items:center;gap:6px;padding:4px 12px;background:#EFF6FF;border:1px dashed #3B82F6;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:600;color:#1D4ED8;"
        data-nitkey="${nit.replace(/[^a-z0-9]/gi,'_')}" data-key="${key}" data-ctrln="${c.n}">
        Subir evidencia
        <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onchange="var lbl=this.parentElement;registrarEvidenciaCuest(lbl.getAttribute('data-nitkey'),lbl.getAttribute('data-key'),lbl.getAttribute('data-ctrln'),this)"
          style="display:none;"/>
      </label>
      <div id="evw_${nit.replace(/[^a-z0-9]/gi,'_')}_${key}_${c.n}" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
    </div>
  </div>`;
}

// ─── ONCHANGE ATRIBUTO ────────────────────────────────────────
function onChangeAtribCuest(nit, key, ctrlN, ai){
  if(!CUEST_RESPUESTAS[nit]) CUEST_RESPUESTAS[nit]={};
  if(!CUEST_RESPUESTAS[nit][key]) CUEST_RESPUESTAS[nit][key]={};
  if(!CUEST_RESPUESTAS[nit][key][ctrlN]) CUEST_RESPUESTAS[nit][key][ctrlN]={};

  const nitKey = nit.replace(/[^a-z0-9]/gi,'_');
  const val = document.getElementById(`qa_${nitKey}_${key}_${ctrlN}_a${ai}`)?.value;
  CUEST_RESPUESTAS[nit][key][ctrlN]['a'+ai] = val;

  const a1val = CUEST_RESPUESTAS[nit][key][ctrlN].a1 || '';
  const a6val = CUEST_RESPUESTAS[nit][key][ctrlN].a6 || '';

  // Rules: if a1=No or N/A → disable 2-7
  for(let i=2;i<=7;i++){
    const el = document.getElementById(`qa_${nitKey}_${key}_${ctrlN}_a${i}`);
    if(!el) continue;
    if(a1val==='No'||a1val==='No Aplica'){
      el.value = a1val==='No'?'No':'';
      el.disabled = true; el.style.opacity='0.4';
      CUEST_RESPUESTAS[nit][key][ctrlN]['a'+i] = el.value;
    } else {
      el.disabled = false; el.style.opacity='1';
    }
  }
  // if a6=No → a7=No
  const a7el = document.getElementById(`qa_${nitKey}_${key}_${ctrlN}_a7`);
  if(a7el && a6val==='No' && a1val!=='No' && a1val!=='No Aplica'){
    a7el.value='No'; a7el.disabled=true; a7el.style.opacity='0.4';
    CUEST_RESPUESTAS[nit][key][ctrlN].a7='No';
  }

  // Update row circle color
  const rowEl = document.getElementById(`cr_${nitKey}_${key}_${ctrlN}`);
  if(rowEl){
    const circle = rowEl.querySelector('div > div[style*="border-radius:50%"]');
    if(circle){
      if(a1val==='Si'){ circle.style.background='#16A34A'; circle.style.color='white'; }
      else if(a1val==='No'){ circle.style.background='var(--red)'; circle.style.color='white'; }
      else if(a1val==='No Aplica'){ circle.style.background='#9CA3AF'; circle.style.color='white'; }
      else { circle.style.background='#E5E7EB'; circle.style.color='#6B7280'; }
    }
  }

  // Update section badge (recalcula progreso y madurez, y guarda en localStorage)
  actualizarBadgeSec(nit, key);
  // Guardado automático — cada cambio persiste inmediatamente
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ window._flashGuardadoCuest && window._flashGuardadoCuest(); }catch(e){}
}

// ── Indicador visual de guardado automático ─────────────────────
// Muestra "💾 Guardado HH:MM:SS" junto a la barra de progreso cada vez
// que una respuesta u observación se persiste en localStorage.
window._flashGuardadoCuest = function(){
  try{
    var el = document.getElementById('q-guardado-lbl');
    if(!el) return;
    var hh = new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    el.textContent = '💾 Guardado ' + hh;
    el.style.display = 'inline-block';
    el.style.opacity = '1';
    clearTimeout(window._flashGuardadoT);
    window._flashGuardadoT = setTimeout(function(){ el.style.opacity = '.55'; }, 2500);
  }catch(e){}
};

function onChangeObsCuest(nit, key, ctrlN, val){
  if(!CUEST_RESPUESTAS[nit]) CUEST_RESPUESTAS[nit]={};
  if(!CUEST_RESPUESTAS[nit][key]) CUEST_RESPUESTAS[nit][key]={};
  if(!CUEST_RESPUESTAS[nit][key][ctrlN]) CUEST_RESPUESTAS[nit][key][ctrlN]={};
  CUEST_RESPUESTAS[nit][key][ctrlN].obs = val;
  // Guardado automático + indicador (antes las observaciones no se persistían al instante)
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ window._flashGuardadoCuest && window._flashGuardadoCuest(); }catch(e){}
}

// ─── EVIDENCIAS CUESTIONARIO ─────────────────────────────────
var EVID_CUEST = {};
function registrarEvidenciaCuest(nitKey, key, ctrlN, inputEl){
  var sk = nitKey+'_'+key+'_'+ctrlN;
  if(!EVID_CUEST[sk]) EVID_CUEST[sk]=[];
  var files = Array.from(inputEl.files);
  files.forEach(function(f){
    var r=new FileReader();
    r.onload=function(e){
      EVID_CUEST[sk].push({name:f.name,size:f.size,type:f.type,dataUrl:e.target.result,fecha:new Date().toISOString()});
      try{ window._lsSave && window._lsSave(); }catch(exS){}
      renderEvCuest(nitKey,key,ctrlN);
      // ── También guardar en Informes ──
      _rptGuardarEvidencia(f, e.target.result, 'Cuestionario AC');
      // ── También guardar en Repositorio od_sgrt_v8 ──
      (function(file, dataUrl, nk, k, cn){
        try{
          var s=localStorage.getItem('od_sgrt_v8')||'{}';
          var fs=JSON.parse(s);
          // Find or create Ambiente de Control folder
          var acF=(fs.children||[]).find(function(c){return c.id==='f_ac'||c.name==='Ambiente de Control';});
          if(!acF){acF={id:'f_ac',name:'Ambiente de Control',type:'folder',children:[]};fs.children=fs.children||[];fs.children.push(acF);}
          // Find or create tercero subfolder
          var tF=(acF.children||[]).find(function(c){return c.type==='folder'&&c.name.includes(nk);});
          if(!tF){tF={id:'f_ac_'+nk,name:'Tercero '+nk,type:'folder',children:[]};acF.children=acF.children||[];acF.children.push(tF);}
          // Avoid duplicate
          if(!(tF.children||[]).find(function(c){return c.name===file.name&&c.size===file.size;})){
            tF.children=tF.children||[];
            tF.children.push({id:'ev_'+Date.now(),name:file.name,type:'file',size:file.size,fecha:new Date().toLocaleDateString('es-CO'),dataURL:dataUrl,_ctrl:cn,_tip:k});
            localStorage.setItem('od_sgrt_v8',JSON.stringify(fs));
          }
        }catch(ex){}
      })(f, e.target.result, nitKey, key, ctrlN);
    };
    r.readAsDataURL(f);
  });
  inputEl.value='';
  showToast(files.length+' evidencia(s) adjuntada(s) — guardada(s) en el Repositorio','success',2500);
  // Refrescar panel Información General
  try{if(typeof renderIGContratos==='function')renderIGContratos();}catch(e){}
}
function renderEvCuest(nitKey,key,ctrlN){
  var wrap=document.getElementById('evw_'+nitKey+'_'+key+'_'+ctrlN);
  if(!wrap) return;
  var sk=nitKey+'_'+key+'_'+ctrlN;
  var evs=EVID_CUEST[sk]||[];
  var html='';
  for(var i=0;i<evs.length;i++){
    var ev=evs[i];
    var sizeKB=(ev.size/1024).toFixed(1);
    var isImg=ev.type.indexOf('image/')===0;
    var thumb=isImg?'<img src="'+ev.dataUrl+'" style="width:18px;height:18px;object-fit:cover;border-radius:2px;"/>'
                   :'<span style="font-size:12px;">&#128196;</span>';
    var btn='<button data-sk="'+sk+'" data-idx="'+i+'" onclick="elimEvCuest(this)" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;">&times;</button>';
    html+='<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:white;border:1px solid var(--border2);border-radius:6px;font-size:11px;">'+thumb+'<span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ev.name+'</span><span style="color:var(--muted);font-size:10px;">'+sizeKB+'KB</span>'+btn+'</div>';
  }
  wrap.innerHTML=html;
  // Restore filter selects
  var selT=document.getElementById('rpt-fil-tercero');
  if(selT&&filTercero) selT.value=filTercero;
  var selTip=document.getElementById('rpt-fil-tip');
  if(selTip&&filTip) selTip.value=filTip;
}
function elimEvCuest(btn){
  var sk=btn.getAttribute('data-sk');
  var idx=parseInt(btn.getAttribute('data-idx'));
  if(EVID_CUEST[sk]) EVID_CUEST[sk].splice(idx,1);
  // Re-render: find nitKey/key/ctrlN from sk
  var parts=sk.split('_');
  // sk = nitKey_key_ctrlN — nitKey may have underscores so split from end
  var ctrlN=parts[parts.length-1];
  var key=parts[parts.length-2];
  var nitKey=parts.slice(0,parts.length-2).join('_');
  renderEvCuest(nitKey,key,ctrlN);
  showToast('Evidencia eliminada','info',1200);
}

// ─── EVIDENCIAS RIESGO (Modal Matriz) ─────────────────────────
var EVID_RIESGO={};
var _tmpEvRiesgo=[];
function registrarEvRiesgo(inputEl){
  var files=Array.from(inputEl.files);
  files.forEach(function(f){
    var r=new FileReader();
    r.onload=function(e){
      _tmpEvRiesgo.push({name:f.name,size:f.size,type:f.type,dataUrl:e.target.result});
      renderEvRiesgoTmp();
      // ── También guardar en Informes ──
      _rptGuardarEvidencia(f, e.target.result, 'Análisis de Riesgos');
    };
    r.readAsDataURL(f);
  });
  inputEl.value='';
  showToast(files.length+' evidencia(s) cargada(s) — también guardada(s) en Informes 📁','success',2500);
}
function renderEvRiesgoTmp(){
  var wrap=document.getElementById('nr-evid-wrap');
  if(!wrap) return;
  var html='';
  for(var i=0;i<_tmpEvRiesgo.length;i++){
    var ev=_tmpEvRiesgo[i];
    var sizeKB=(ev.size/1024).toFixed(1);
    var isImg=ev.type.indexOf('image/')===0;
    var thumb=isImg?'<img src="'+ev.dataUrl+'" style="width:18px;height:18px;object-fit:cover;border-radius:2px;"/>':'<span>&#128196;</span>';
    html+='<div style="display:flex;align-items:center;gap:4px;padding:3px 8px;background:white;border:1px solid var(--border2);border-radius:6px;font-size:11px;">'+thumb+'<span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ev.name+'</span><span style="color:var(--muted);font-size:10px;">'+sizeKB+'KB</span><button data-evr-idx="'+i+'" onclick="elimEvRiesgo(this)" style="background:none;border:none;color:var(--red);cursor:pointer;">&times;</button></div>';
  }
  wrap.innerHTML=html;
}
function elimEvRiesgo(btn){
  var idx=parseInt(btn.getAttribute('data-evr-idx'));
  _tmpEvRiesgo.splice(idx,1);
  renderEvRiesgoTmp();
}

function actualizarBadgeSec(nit, key){
  // Lista canónica (idéntica a la del render y el progreso global)
  const controles = window._ctrlsCuest ? window._ctrlsCuest(nit, key)
    : [...(CUESTIONARIO_CONTROLES[key]||[]), ...(CUEST_CTRL_CUSTOM[nit]?.[key]||[]).map((c,i)=>({...c,n:(CUESTIONARIO_CONTROLES[key]?.length||0)+i+1}))];
  const total = controles.length;
  const respondidos = controles.filter(c=>{
    var a1=(CUEST_RESPUESTAS[nit]?.[key]?.[c.n]?.a1)||'';
    return a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
  }).length;

  // Calcular madurez de la tipología completa con la fórmula del Excel
  var valoresMad = [];
  controles.forEach(c=>{
    var resp = CUEST_RESPUESTAS[nit]?.[key]?.[c.n] || {};
    var v = _calcCtrlValoracion(resp);
    if(v.valorMad !== null) valoresMad.push(v.valorMad);
  });
  var madTip = window._calcMadurezTipologia ? window._calcMadurezTipologia(valoresMad) : null;

  const badge = document.getElementById(`sc-badge-${key}`);
  if(badge && total>0){
    var isComplete = respondidos === total;
    badge.style.color = isComplete ? '#16A34A' : 'var(--muted)';
    badge.style.fontWeight = isComplete ? '800' : '600';
    badge.style.background = isComplete ? '#F0FDF4' : 'white';
    badge.style.borderColor = isComplete ? '#86EFAC' : 'var(--border)';
    badge.innerHTML = `${respondidos}/${total} respondidos`
      + (madTip && valoresMad.length>0
        ? ` &nbsp;<span style="color:${madTip.color};font-weight:800;">${madTip.pct}% · ${madTip.madurez}</span>` : '');
  }

  // Actualizar también las valoraciones inline de cada control
  try{
    var nitKey = nit.replace(/[^a-z0-9]/gi,'_');
    controles.forEach(c=>{
      var resp = CUEST_RESPUESTAS[nit]?.[key]?.[c.n] || {};
      if(!resp.a1) return; // sin responder aún
      var val = _calcCtrlValoracion(resp);
      // Los ids del panel de valoración se generan en renderControlRow (sin nitKey) y también en el sistema v3
      // Intentamos los dos esquemas de ID
      var pctId  = ['vc-pct-'+key+'-'+c.n,   'vc-pct-'+key+'-'+c.n];
      var madId  = ['vc-mad-'+key+'-'+c.n,   'vc-mad-'+key+'-'+c.n];
      var valId  = ['vc-val-'+key+'-'+c.n,   'vc-val-'+key+'-'+c.n];
      var wrapId = ['valCtrl-'+key+'-'+c.n,  'valCtrl-'+key+'-'+c.n];
      [pctId[0]].forEach(id=>{
        var el = document.getElementById(id); if(!el) return;
        el.textContent = val.nivelCumpl; el.style.color = val.color;
      });
      [madId[0]].forEach(id=>{
        var el = document.getElementById(id); if(!el) return;
        el.textContent = val.madurez; el.style.color = val.color;
        el.style.background = val.bgColor; el.style.padding='3px 8px'; el.style.borderRadius='8px';
      });
      [valId[0]].forEach(id=>{
        var el = document.getElementById(id); if(!el) return;
        el.textContent = val.valorMad!==null&&val.valorMad>0?val.valorMad+'.0':'—'; el.style.color=val.color;
      });
      [wrapId[0]].forEach(id=>{
        var el = document.getElementById(id); if(!el) return;
        el.style.background = val.madurez==='NO APLICA'?'#F9FAFB':
          val.pct>=80?'linear-gradient(90deg,#F0FDF4,#DCFCE7)':
          val.pct>=60?'linear-gradient(90deg,#FEFCE8,#FEF9C3)':
          val.pct>=40?'linear-gradient(90deg,#FFF7ED,#FFEDD5)':
          'linear-gradient(90deg,#FEF2F2,#FEE2E2)';
        el.style.borderColor = val.color+'55';
      });
    });
  }catch(e){}

  // Actualizar progreso global
  const tipKeys = Array.from(document.querySelectorAll('[id^="sc-badge-"]'))
    .map(el=>el.id.replace('sc-badge-',''))
    .filter(k=>k);
  if(tipKeys.length) actualizarProgressoCuest(nit, tipKeys);
}

function actualizarProgressoCuest(nit, tipKeys){
  let totalAll=0, respondidosAll=0;
  tipKeys.forEach(k=>{
    const ctrls = window._ctrlsCuest ? window._ctrlsCuest(nit, k) : [...(CUESTIONARIO_CONTROLES[k]||[]),...(CUEST_CTRL_CUSTOM[nit]?.[k]||[])];
    totalAll += ctrls.length;
    respondidosAll += ctrls.filter(c=>{
      var a1=(CUEST_RESPUESTAS[nit]?.[k]?.[c.n]?.a1)||'';
      return a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
    }).length;
  });
  const pct = totalAll>0?Math.round(respondidosAll/totalAll*100):0;
  const el = document.getElementById('q-resumen-progreso');
  if(el) el.innerHTML = `<b>${respondidosAll}/${totalAll}</b> controles respondidos &nbsp;·&nbsp; <b>${pct}%</b> completado`;
  const el2 = document.getElementById('qi-progreso');
  if(el2) el2.textContent = `${respondidosAll}/${totalAll} (${pct}%)`;

  // ── Actualizar barra visual de progreso ──────────────────────
  const barWrap = document.getElementById('q-progreso-bar-wrap');
  const bar     = document.getElementById('q-progreso-bar');
  const pctLbl  = document.getElementById('q-progreso-pct-lbl');
  const cntLbl  = document.getElementById('q-progreso-count-lbl');
  const tipLbl  = document.getElementById('q-progreso-tip-lbl');
  if(barWrap) barWrap.style.display = 'block';
  if(bar){
    bar.style.width = pct + '%';
    if(pct < 30) bar.style.background = 'linear-gradient(90deg,#dc3545,#fd7e14)';
    else if(pct < 70) bar.style.background = 'linear-gradient(90deg,#fd7e14,#ffc107)';
    else bar.style.background = 'linear-gradient(90deg,#1e6bb8,#28a745)';
  }
  if(pctLbl){
    pctLbl.textContent = pct + '%';
    pctLbl.style.color = pct===100?'#28a745':'#1e6bb8';
  }
  if(cntLbl) cntLbl.textContent = respondidosAll + ' de ' + totalAll + ' controles respondidos';
  if(tipLbl){
    const completadas = tipKeys.filter(k=>{
      const ctrls=window._ctrlsCuest ? window._ctrlsCuest(nit, k) : [...(CUESTIONARIO_CONTROLES[k]||[]),...(CUEST_CTRL_CUSTOM[nit]?.[k]||[])];
      return ctrls.length>0 && ctrls.every(c=>{
        var a1=(CUEST_RESPUESTAS[nit]?.[k]?.[c.n]?.a1)||'';
        return a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
      });
    });
    tipLbl.textContent = completadas.length + '/' + tipKeys.length + ' tipologías completas';
    // Al responder todos los controles (Sí, No o N/A): confirmación clara
    if(pct === 100 && totalAll > 0){
      tipLbl.innerHTML = completadas.length + '/' + tipKeys.length
        + ' tipologías completas &nbsp;·&nbsp; <span style="color:#16A34A;font-weight:800;">✅ Cuestionario completo — guardado automáticamente</span>';
    }
  }

  // Restaurar borrador guardado si existe
  try{
    const bKey = 'cuest_borrador_' + nit;
    const bRaw = localStorage.getItem(bKey);
    if(bRaw){
      const b = JSON.parse(bRaw);
      const infoEl = document.getElementById('q-borrador-info');
      const tsEl   = document.getElementById('q-borrador-ts');
      if(infoEl && tsEl){
        infoEl.style.display = 'block';
        tsEl.textContent = 'Borrador guardado el ' + b.fecha;
      }
    }
  }catch(e){}
}

window.guardarBorradorCuestionario = function(){
  try{
    const nit = nitActual;
    if(!nit){ showToast('Selecciona un tercero primero','error',2500); return; }
    const fecha = new Date().toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const borrador = {
      nit,
      fecha,
      respuestas: JSON.parse(JSON.stringify(CUEST_RESPUESTAS[nit]||{})),
      customCtrls: JSON.parse(JSON.stringify(CUEST_CTRL_CUSTOM[nit]||{}))
    };
    localStorage.setItem('cuest_borrador_' + nit, JSON.stringify(borrador));
    // Sincronizar respuestas completas para que otros roles las vean
    try{
      var allResp=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
      allResp[nit]=window.CUEST_RESPUESTAS[nit]||{};
      localStorage.setItem('sgrt_cuest_respuestas',JSON.stringify(allResp));
    }catch(e){}
    // Mostrar mensaje
    const infoEl = document.getElementById('q-borrador-info');
    const tsEl   = document.getElementById('q-borrador-ts');
    if(infoEl && tsEl){
      infoEl.style.display = 'block';
      tsEl.textContent = 'Borrador guardado el ' + fecha + ' — puedes cerrar y continuar después.';
    }
    try{ showToast('✅ Borrador guardado. Puedes continuar más tarde.','success',3500); }catch(e){}
  }catch(e){
    try{ showToast('Error al guardar borrador','error',2500); }catch(ex){}
  }
};

// ─── TOGGLE SECCIÓN ───────────────────────────────────────────
function toggleSeccionCuest(panelId, arrId){
  const p=document.getElementById(panelId);
  const a=document.getElementById(arrId);
  if(!p) return;
  const open=p.style.display!=='none';
  p.style.display=open?'none':'block';
  if(a) a.textContent=open?'▼':'▲';
}

// ─── MODAL AGREGAR CONTROL CUSTOM ─────────────────────────────
function abrirModalAddCtrl(nit, key){
  document.getElementById('acm-key').value = key;
  document.getElementById('acm-nit').value = nit;
  document.getElementById('acm-ctrl').value = '';
  document.getElementById('acm-req').value  = '';
  document.getElementById('acm-doc').value  = '';

  // Show section name in modal header
  const esCust = key.startsWith('custom_');
  const cat = TIPOLOGIA_CATALOG[key];
  let secLabel = SECCIONES_INFO[key]?.label || (cat ? (cat.nombre||key).replace(/\n/g,' ') : key);
  const titleEl = document.getElementById('acm-seccion-label');
  if(titleEl) titleEl.textContent = 'Sección: ' + secLabel;

  openM('m-add-control');
}

function guardarControlCustom(){
  const key  = document.getElementById('acm-key').value;
  const nit  = document.getElementById('acm-nit').value;
  const ctrl = document.getElementById('acm-ctrl').value.trim();
  const req  = document.getElementById('acm-req').value.trim();
  const doc  = document.getElementById('acm-doc').value.trim();
  if(!ctrl){ showToast('El nombre del control es obligatorio','error',2500); return; }
  if(!req){  showToast('El requerimiento es obligatorio','error',2500); return; }
  if(!CUEST_CTRL_CUSTOM[nit]) CUEST_CTRL_CUSTOM[nit]={};
  if(!CUEST_CTRL_CUSTOM[nit][key]) CUEST_CTRL_CUSTOM[nit][key]=[];
  const baseN = CUESTIONARIO_CONTROLES[key]?.length||0;
  const custN = CUEST_CTRL_CUSTOM[nit][key].length + 1;
  CUEST_CTRL_CUSTOM[nit][key].push({ n: baseN + custN, ctrl, req, doc });
  closeM('m-add-control');
  // Re-render entire cuestionario to show the new control
  cargarCuestionarioTercero();
  setTimeout(()=>{
    // Keep the section open
    const panel = document.getElementById('sc-'+key);
    const arrow = document.getElementById('sa-'+key);
    if(panel){ panel.style.display='block'; }
    if(arrow){ arrow.textContent='▲'; }
    showToast('✅ Control agregado: "'+ctrl+'"','success',2500);
  }, 120);
}

function quitarCtrlCustomCuest(nit, key, n){
  if(!CUEST_CTRL_CUSTOM[nit]?.[key]) return;
  // n here is the rendered index (base + custom index)
  const base = CUESTIONARIO_CONTROLES[key]?.length||0;
  const customIdx = n - base - 1;
  if(customIdx>=0) CUEST_CTRL_CUSTOM[nit][key].splice(customIdx,1);
  cargarCuestionarioTercero();
  setTimeout(()=>{
    const p=document.getElementById(`sc-${key}`);
    const a=document.getElementById(`sa-${key}`);
    if(p){p.style.display='block'; if(a)a.textContent='▲';}
  },100);
  showToast('Control eliminado','info',1500);
}

// ─── FINANCIERO ───────────────────────────────────────────────
function renderSeccionFinancieroCuest(nit){
  const cfg = SECCIONES_INFO['fi'];
  const controles = CUESTIONARIO_CONTROLES['fi']||[];
  const ctrlsHtml = controles.map(c=>renderControlRow(nit,'fi',c)).join('');

  return `
  <div class="card" data-tipkey="fi" style="margin-bottom:10px;border-left:4px solid ${cfg.color};overflow:hidden;">
    <div style="padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:${cfg.bg};"
      onclick="toggleSeccionCuest('sc-fi','sa-fi')">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">${cfg.icon}</span>
        <div>
          <div style="font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;color:var(--navy);">${cfg.label}</div>
          <div style="font-size:11px;color:var(--muted);">2 controles + Estados Financieros</div>
        </div>
        <span id="sc-badge-fi" style="font-size:11px;padding:2px 10px;background:white;border:1px solid ${cfg.border};border-radius:10px;color:var(--muted);">Sin responder</span>
      </div>
      <span id="sa-fi" style="font-size:18px;color:var(--muted);">▲</span>
    </div>
    <div id="sc-fi" style="display:block;padding:0 16px 14px;">
      <div style="margin:12px 0 8px;font-size:11.5px;font-weight:700;color:white;background:#B45309;padding:5px 10px;border-radius:4px;">
        PARTE 1 — Controles de Gestión del Capacidad Financiera
      </div>
      ${ctrlsHtml}
      <div style="margin:14px 0 8px;font-size:11.5px;font-weight:700;color:white;background:#92400E;padding:5px 10px;border-radius:4px;">
        PARTE 2 — Estados Financieros (3 últimos años)
      </div>
      <div style="font-size:11.5px;color:var(--muted);margin-bottom:10px;">Mínimo <b>70 puntos</b> para habilitación financiera. Indicadores: Liquidez, Endeudamiento, Patrimonio/Contrato, ROA.</div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:600px;">
          <thead>
            <tr style="background:var(--navy);color:white;">
              <th style="padding:8px 10px;text-align:left;">Cuenta</th>
              <th style="padding:8px;text-align:center;">Año 1</th>
              <th style="padding:8px;text-align:center;">Año 2</th>
              <th style="padding:8px;text-align:center;">Año 3</th>
              <th style="padding:8px;text-align:center;background:#92400E;">Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${[
              {id:'ac',label:'Activo Corriente'},
              {id:'at',label:'Activo Total'},
              {id:'pc',label:'Pasivo Corriente'},
              {id:'pt',label:'Pasivo Total'},
              {id:'pa',label:'Patrimonio Total'},
              {id:'ur',label:'Utilidades Retenidas'},
              {id:'uo',label:'Utilidad Operacional'},
              {id:'cc',label:'Costo Anual Contrato'},
            ].map((r,i)=>`
              <tr style="${i%2===0?'background:#FAFAFA':''}">
                <td style="padding:7px 10px;font-weight:600;color:var(--navy);">${r.label}</td>
                ${[1,2,3].map(y=>`<td style="padding:4px 6px;"><input type="number" id="fi_${nit.replace(/[^a-z0-9]/gi,'_')}_${r.id}${y}" value="0" min="0"
                  oninput="calcFinancieroCuest('${nit}')"
                  style="width:100%;padding:5px 7px;border:1px solid var(--border2);border-radius:4px;font-size:12px;text-align:right;"/></td>`).join('')}
                <td style="padding:7px 10px;text-align:center;font-weight:700;background:#FEF9E7;" id="fi_${nit.replace(/[^a-z0-9]/gi,'_')}_${r.id}_prom">—</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
        ${[
          {id:'liq',label:'LIQUIDEZ',formula:'AC ÷ PC',good:'≥ 1.4'},
          {id:'end',label:'ENDEUDAMIENTO',formula:'PT ÷ AT',good:'< 0.6'},
          {id:'pat',label:'PATRIMONIO/COSTO',formula:'Patrimonio ÷ Contrato',good:'≥ 1.0'},
          {id:'roa',label:'ROA',formula:'UO ÷ AT × 100',good:'≥ 5%'},
        ].map(ind=>`
          <div style="background:white;border:1px solid var(--border);border-radius:var(--r);padding:12px;text-align:center;box-shadow:var(--shadow);">
            <div style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">${ind.label}</div>
            <div style="font-size:10px;color:var(--muted);margin:2px 0;">${ind.formula}</div>
            <div id="fi_${nit.replace(/[^a-z0-9]/gi,'_')}_ind_${ind.id}" style="font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;color:var(--muted);">—</div>
            <div style="font-size:9px;color:var(--muted);">Óptimo: ${ind.good}</div>
          </div>`).join('')}
      </div>
      <div id="fi_${nit.replace(/[^a-z0-9]/gi,'_')}_result" style="margin-top:12px;padding:12px;border-radius:var(--r);text-align:center;font-size:13px;font-weight:700;background:var(--gray3);color:var(--muted);">
        Ingresa los estados financieros para ver la calificación
      </div>
    </div>
  </div>`;
}

function calcFinancieroCuest(nit){
  const nitKey = nit.replace(/[^a-z0-9]/gi,'_');
  function v(id){ return parseFloat(document.getElementById(`fi_${nitKey}_${id}`)?.value)||0; }
  function p3(base){ const vs=[v(base+'1'),v(base+'2'),v(base+'3')]; const f=vs.filter(x=>x>0); return f.length?f.reduce((a,b)=>a+b)/f.length:0; }
  const ROWS=['ac','at','pc','pt','pa','ur','uo','cc'];
  const P={};
  ROWS.forEach(r=>{
    P[r]=p3(r);
    const el=document.getElementById(`fi_${nitKey}_${r}_prom`);
    if(el) el.textContent=P[r]?P[r].toLocaleString('es-CO',{maximumFractionDigits:0}):'—';
  });
  const liq=P.pc>0?(P.ac/P.pc):null;
  const end_=P.at>0?(P.pt/P.at):null;
  const pat=P.cc>0?(P.pa/P.cc):null;
  const roa=P.at>0?(P.uo/P.at*100):null;

  const setInd=(id,val,fmt,good,bad)=>{
    const el=document.getElementById(`fi_${nitKey}_ind_${id}`);
    if(!el) return;
    el.textContent=val!==null?fmt(val):'—';
    el.style.color=val===null?'var(--muted)':val>=good?'var(--green)':val<=bad?'var(--red)':'var(--orange)';
  };
  setInd('liq',liq,v=>v.toFixed(2),1.4,1.1);
  setInd('end',end_,v=>v.toFixed(2),0,0.6);  // lower is better
  setInd('pat',pat,v=>v.toFixed(2),1.0,0.3);
  setInd('roa',roa,v=>v.toFixed(1)+'%',5,0);

  let score=0;
  if(liq!==null){ score+=liq>=1.4?40:liq>=1.2?30:liq>=1.1?20:0; }
  if(end_!==null){ score+=end_<=0.5?40:end_<=0.6?30:end_<=0.7?20:0; }
  if(pat!==null){ score+=pat>=1.0?20:pat>=0.7?15:pat>=0.3?10:0; }
  const resEl=document.getElementById(`fi_${nitKey}_result`);
  if(resEl&&liq!==null){
    const hab=score>=70;
    resEl.style.background=hab?'#e8f8f2':'#fde8e8';
    resEl.style.color=hab?'var(--green)':'var(--red)';
    resEl.innerHTML=`<span style="font-family:'Montserrat',sans-serif;font-size:22px;font-weight:800;">${score}/100 pts</span><br>
      ${hab?'✅ HABILITADO FINANCIERAMENTE (≥ 70 pts)':'⚠️ NO HABILITADO — Revise indicadores (< 70 pts)'}`;
  }
}

// ─── GUARDAR CUESTIONARIO ─────────────────────────────────────
function guardarCuestionarioCompleto(){
  const nit = nitActual;
  if(!nit){ showToast('Selecciona un tercero primero','error',2000); return; }
  const t = TERCEROS_DB[nit] || {};
  const nombre = t.nombre || nit;

  // Save timestamp
  if(!CUEST_RESPUESTAS[nit]) CUEST_RESPUESTAS[nit]={};
  CUEST_RESPUESTAS[nit].__savedAt = new Date().toISOString();
  CUEST_RESPUESTAS[nit].__nombre  = nombre;

  // ─── CALCULAR PROMEDIO POR TIPOLOGÍA Y GLOBAL ──────────────────
  var promedioPorTip = {};
  var valoresGlobales = [];
  var totalControles = 0, totalRespondidos = 0;
  
  (t.dims || []).forEach(function(d){
    var tipKey = d.key;
    var ctrls = window._ctrlsCuest ? window._ctrlsCuest(nit, tipKey) : (CUESTIONARIO_CONTROLES[tipKey] || []);
    var valoresT = [];
    
    ctrls.forEach(function(c){
      var r = CUEST_RESPUESTAS[nit][tipKey] ? CUEST_RESPUESTAS[nit][tipKey][c.n] : {};
      var a1 = r.a1 || '';
      var estaRespondido = a1 === 'Si' || a1 === 'No' || a1 === 'No Aplica' || a1 === 'Parcial';
      
      if(estaRespondido){
        var val = _calcCtrlValoracion(r);
        if(val.valorMad !== null){
          valoresT.push(val.valorMad);
          valoresGlobales.push(val.valorMad);
        }
        totalRespondidos++;
      }
      totalControles++;
    });
    
    if(valoresT.length > 0){
      var promT = valoresT.reduce(function(a,b){return a+b;}) / valoresT.length;
      promedioPorTip[tipKey] = Math.round(promT * 100) / 100;
    }
  });
  
  var promedioGlobal = valoresGlobales.length > 0 
    ? Math.round((valoresGlobales.reduce(function(a,b){return a+b;}) / valoresGlobales.length) * 100) / 100
    : 0;
  
  // Guardar promedios en el tercero
  t.promAC = promedioGlobal;
  t.promAC_porTip = promedioPorTip;
  t.acAvance = totalControles > 0 ? Math.round(totalRespondidos / totalControles * 100) : 0;
  t.estado = 'Completado'; // ✅ MARCAR COMO COMPLETADO
  
  // ─── SI ES POR CONTRATO, CALCULAR PROMEDIO POR CONTRATO ────────
  var contratoEval = (document.getElementById('q-contrato-sel') || {}).value || '';
  if(contratoEval && t.contratos){
    if(!t.promPorContrato) t.promPorContrato = {};
    t.promPorContrato[contratoEval] = {
      prom: promedioGlobal,
      zona: t.zona || 'BAJO',
      fecha: new Date().toISOString().slice(0,10)
    };
  }

  addLog(nombre,'CUESTIONARIO_AC','Guardado','—',
    `Cuestionario AC guardado. Promedio: ${promedioGlobal}. Avance: ${t.acAvance}%.`,
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Datos Maestros');

  showToast(`Cuestionario guardado. Promedio: ${promedioGlobal} | Avance: ${t.acAvance}%`,'success',3500);
  
  // Guardar en localStorage
  try{ window._lsSave && window._lsSave(); }catch(e){}
  
  // Actualizar dashboard
  try{ renderReportesAC(); }catch(e){}
}

// ─── LIMPIAR RESPUESTAS ───────────────────────────────────────
function limpiarRespuestasCuestionario(){
  if(!nitActual){ return; }
  if(!confirm('¿Limpiar todas las respuestas de este tercero?')) return;
  CUEST_RESPUESTAS[nitActual]={};
  cargarCuestionarioTercero();
  showToast('Respuestas limpiadas','info',2000);
}

// ─── EXPORTAR CSV ─────────────────────────────────────────────
function exportarCuestionarioCSV(){
  if(!nitActual){ showToast('Selecciona un tercero primero','error',2000); return; }
  const t=TERCEROS_DB[nitActual]||{};
  const rows=[['NIT','Tercero','Sección','Control','Requerimiento','1.Implementado','2.Documentado','3.Asignado','4.Divulgado','5.Evidencia','6.Monitoreado','7.Eficaz','Observaciones']];
  const tipKeys=(t.dims||[]).map(d=>d.key);
  tipKeys.forEach(key=>{
    const ctrls=window._ctrlsCuest?window._ctrlsCuest(nitActual,key):[...(CUESTIONARIO_CONTROLES[key]||[]),...(CUEST_CTRL_CUSTOM[nitActual]?.[key]||[])];
    ctrls.forEach((c,i)=>{
      const n=key==='custom'?c.n:c.n;
      const r=CUEST_RESPUESTAS[nitActual]?.[key]?.[c.n]||{};
      rows.push([nitActual,t.nombre||nitActual,SECCIONES_INFO[key]?.label||key,c.ctrl||'Control '+c.n,c.req||''
        ,r.a1||'',r.a2||'',r.a3||'',r.a4||'',r.a5||'',r.a6||'',r.obs||'']);
    });
  });
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url;
  a.download=`Cuestionario_AC_${nitActual}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV exportado','success',2000);
}


// ════════════════════════════════════════════════════════════════
// MATRIZ DE RIESGOS + SEGUIMIENTO — Motor completo
// ════════════════════════════════════════════════════════════════

// ─── Base de datos en memoria ─────────────────────────────────
var MATRIZ_DB = []; window.MATRIZ_DB = MATRIZ_DB;

const ZONA_COLOR = {
  'EXTREMO': { bg:'#FEF2F2', text:'#DC2626', chip:'c-crit' },
  'ALTO':    { bg:'#FFF7ED', text:'#EA580C', chip:'c-alto' },
  'MODERADO':{ bg:'#FFFBEB', text:'#D97706', chip:'c-med'  },
  'BAJO':    { bg:'#F0FDF4', text:'#16A34A', chip:'c-ok'   },
};
const ESTADO_CHIP = {
  'Pendiente':   'c-pend', 'En Progreso': 'c-rev',
  'Completado':  'c-ok',   'Cerrado':     'c-inac',
};

function zonaFromProb(p, imp){
  if(!p || !imp) return '—';
  const v = parseFloat(p) * parseFloat(imp);
  if(v >= 0.6) return 'EXTREMO';
  if(v >= 0.3) return 'ALTO';
  if(v >= 0.1) return 'MODERADO';
  return 'BAJO';
}

// ─── RENDER TABLA MATRIZ ──────────────────────────────────────
function renderMatriz(){
  // Migración transparente: si un riesgo tiene 'tipo' con clave abreviada
  // (op, cn, si, cu, fr, laft, pa, fi) — legado — se convierte al nombre
  // completo con el resolvedor canónico. También el 'entidad:cliente1' se
  // normaliza a 'colpensiones' para que el filtro y el sidebar coincidan.
  try{
    var _CLAVES={op:1,cn:1,si:1,cu:1,fr:1,laft:1,pa:1,fi:1,fc:1,rf:1,pais:1};
    (window.MATRIZ_DB||MATRIZ_DB||[]).forEach(function(r,idx){
      if(r && r.tipo && _CLAVES[String(r.tipo).toLowerCase()]){
        var k=String(r.tipo).toLowerCase();
        r.tipo = window._nombreTipologia ? window._nombreTipologia({key:k,nombre:k}) : r.tipo;
      }
      if(r && (r.entidad==='cliente1' || r.entidad==='')) r.entidad='colpensiones';
      if(r && r.desc && /\btipología (op|cn|si|cu|fr|laft|pa|fi)\b/.test(r.desc)){
        r.desc = r.desc.replace(/\btipología (op|cn|si|cu|fr|laft|pa|fi)\b/, function(_,k){
          return window._nombreTipologia ? window._nombreTipologia({key:k,nombre:k}) : k;
        });
      }
      // Migrar IDs viejos a R1, R2, R3 (como el Excel).
      // Cubre: EJ_NIT_key (semilla) y R_NIT_key_timestamp_idx (creados por usuario con prefijo compuesto).
      // Los IDs que YA son R<N> se conservan tal cual.
      if(r && r.id && !/^R\d+$/.test(r.id)){
        r.id = 'R'+(idx+1);
      }
    });
  }catch(e){}
  // Sincronizar window.MATRIZ_DB ↔ MATRIZ_DB local
  try{
    if(window.MATRIZ_DB && window.MATRIZ_DB.length && !MATRIZ_DB.length){
      window.MATRIZ_DB.forEach(function(r){ MATRIZ_DB.push(r); });
    }
  }catch(e){}
  // Restaurar de localStorage siempre
  try{
    var _d=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
    if(_d.MATRIZ_DB&&_d.MATRIZ_DB.length){
      // Merge: agregar entradas que no existan localmente
      _d.MATRIZ_DB.forEach(function(r){
        if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r);
      });
    }
    // También restaurar TERCEROS_DB para el selector
    if(_d.TERCEROS_DB) Object.assign(TERCEROS_DB,_d.TERCEROS_DB);
  }catch(e){}
  try{
    var _sv2=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(_sv2).length) Object.assign(TERCEROS_DB,_sv2);
  }catch(e){}
  // Reconstruir selector de terceros con datos reales
  try{
    var mzSel=document.getElementById('mz-fil-tercero');
    if(mzSel){
      var prev=mzSel.value;
      mzSel.innerHTML='<option value="">Todos</option>';
      var seen=new Set();
      MATRIZ_DB.forEach(function(r){
        if(r.tercero&&!seen.has(r.tercero)){seen.add(r.tercero);var o=document.createElement('option');o.value=r.tercero;o.textContent=r.tercero;mzSel.appendChild(o);}
      });
      Object.values(TERCEROS_DB).forEach(function(t){
        if(t.nombre&&!seen.has(t.nombre)){seen.add(t.nombre);var o=document.createElement('option');o.value=t.nombre;o.textContent=t.nombre;mzSel.appendChild(o);}
      });
      if(prev) mzSel.value=prev;
    }
  }catch(e){}
  const tbody = document.getElementById('tbody-matriz');
  if(!tbody) return;

  const filTercero = document.getElementById('mz-fil-tercero')?.value || '';
  const filContrato= document.getElementById('mz-fil-contrato')?.value|| '';
  const filTipo    = document.getElementById('mz-fil-tipo')?.value    || '';
  const filZona    = document.getElementById('mz-fil-zona')?.value    || '';
  const filTrat    = document.getElementById('mz-fil-trat')?.value    || '';

  let data = MATRIZ_DB.filter(r =>
    (!filTercero || r.tercero.includes(filTercero)) &&
    (!filContrato|| (r.contrato||'') === filContrato) &&
    (!filTipo    || r.tipo === filTipo) &&
    (!filZona    || r.zonaInh === filZona) &&
    (!filTrat    || r.tratamiento === filTrat)
  );

  // KPIs
  const kpis = { EXTREMO:0, ALTO:0, MODERADO:0, BAJO:0 };
  MATRIZ_DB.forEach(r => { if(kpis[r.zonaInh]!==undefined) kpis[r.zonaInh]++; });
  ['EXTREMO','ALTO','MODERADO','BAJO'].forEach(z => {
    const el = document.getElementById('mz-k-'+z.toLowerCase().slice(0,3));
    if(el) el.textContent = kpis[z];
  });

  const cnt = document.getElementById('mz-count');
  if(cnt) cnt.textContent = data.length + ' registros';

  // Función global para mostrar contratos de un tercero
  window._mzVerContratos = function(nombreTercero){
    var t = Object.values(TERCEROS_DB||{}).find(x => x.nombre === nombreTercero);
    if(!t || !t.contratos || !t.contratos.length){
      alert('Sin contratos asignados para '+nombreTercero);
      return;
    }
    var lista = t.contratos.map(x => '• '+(x.num||'s/n')+' — '+x.objeto).join('\n');
    alert('Contratos de '+nombreTercero+':\n\n'+lista);
  };

  // Función global para mostrar detalle de tratamiento/riesgo
  window._mzVerDetalleTratamiento = function(riesgoId){
    var r = data.find(x => x.id === riesgoId);
    if(!r) { alert('Riesgo no encontrado'); return; }
    var det = 'DETALLE DEL RIESGO\n\n'
      +'Tercero: '+r.tercero+'\n'
      +'Contrato: '+(r.contrato||'Todos')+'\n'
      +'Tipo Riesgo: '+r.tipo+'\n'
      +'Descripción: '+r.desc+'\n\n'
      +'Riesgo Inherente: '+r.zonaInh+' (Prob: '+r.probInh+', Impacto: '+r.impInh+')\n'
      +'Riesgo Residual: '+r.zonaRes+' (Prob: '+r.probRes+', Impacto: '+r.impRes+')\n\n'
      +'Plan de Tratamiento: '+(r.tratamiento||'Por definir')+'\n'
      +'Estado: '+r.estado+'\n'
      +'Plan de Acción: '+(r.plan||'Por definir');
    alert(det);
  };
  
  const _esSoloSupervision = (window.currentUser||{}).rol === 'Operativo';
  tbody.innerHTML = data.map((r, idx) => {
    const zInh = ZONA_COLOR[r.zonaInh] || ZONA_COLOR['BAJO'];
    const zRes = ZONA_COLOR[r.zonaRes] || ZONA_COLOR['BAJO'];
    const estChip = ESTADO_CHIP[r.estado] || 'c-pend';
    const bgRow = idx % 2 === 0 ? '' : 'background:#FAFAFA;';
    const _tEnt = Object.values(TERCEROS_DB||{}).find(x=>x.nombre===r.tercero);
    const _rEnt = r.entidad || (_tEnt?.entidad||'');
    return `<tr style="${bgRow}" id="mz-row-${r.id}" data-entidad="${_rEnt}" data-tercero="${r.tercero}">
      <td style="padding:8px 10px;font-family:'Montserrat',sans-serif;font-weight:800;color:var(--navy);white-space:nowrap;">${r.id}</td>
      <td style="padding:8px 10px;font-size:12px;max-width:130px;"><div style="display:flex;gap:6px;align-items:center;"><span>${r.tercero}</span><button onclick="window._mzVerContratos('${r.tercero}')" style="padding:2px 6px;background:#dbeafe;border:1px solid #93c5fd;border-radius:4px;color:#0c4a6e;font-size:9px;font-weight:700;cursor:pointer;white-space:nowrap;">Ver Contratos</button></div></td>
      <td style="padding:8px 10px;font-size:11px;max-width:120px;color:#334155;">${r.contrato ? '<span style="display:inline-block;padding:2px 8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;font-weight:700;color:#1e40af;">'+r.contrato+'</span>' : '—'}</td>
      <td style="padding:8px 10px;font-size:11px;max-width:160px;">${(window._nombreTipologia ? window._nombreTipologia({key:(r.tipo||'').toLowerCase(),nombre:r.tipo}) : r.tipo)}</td>
      <td style="padding:8px 10px;font-size:11.5px;max-width:200px;line-height:1.4;">${r.desc}</td>
      <td style="padding:8px 10px;font-size:11px;">${r.factor||'—'}</td>
      <td style="padding:8px 6px;text-align:center;font-size:11px;font-weight:700;">${{0.2:'Muy Baja',0.4:'Baja',0.6:'Media',0.8:'Alta',1:'Muy Alta'}[parseFloat(r.probInh)]||r.probInh}</td>
      <td style="padding:8px 6px;text-align:center;font-size:11px;font-weight:700;">${{0.2:'Leve',0.4:'Menor',0.6:'Moderado',0.8:'Mayor',1:'Catastrófico'}[parseFloat(r.impInh)]||r.impInh}</td>
      <td style="padding:6px;text-align:center;"><span style="display:inline-block;padding:3px 8px;border-radius:10px;font-size:10.5px;font-weight:700;background:${zInh.bg};color:${zInh.text};">${r.zonaInh}</span></td>
      <td style="padding:8px 10px;font-size:11px;max-width:160px;">
        ${(function(){
          var arr=(r.controles&&r.controles.length)?r.controles:(r.control?[{desc:r.control,tipo:r.tipoCtrl}]:[]);
          if(!arr.length) return '—';
          window._mtxCtrlDetalle = window._mtxCtrlDetalle || {};
          window._mtxCtrlDetalle[r.id] = {tercero:r.tercero, ref:r.id, controles:arr};
          var primero=arr[0]; var preview=(primero.desc||'').substring(0,40)+((primero.desc||'').length>40?'…':'');
          return '<div style="line-height:1.35;">'+preview
            +(arr.length>1?' <span style="color:#1e40af;font-weight:700;">+'+(arr.length-1)+' más</span>':'')
            +'</div>'
            +'<button onclick="window._mtxVerCtrls(&#39;'+r.id+'&#39;)" style="margin-top:3px;padding:2px 8px;background:#e8f0f8;color:#1a3a5c;border:1px solid #aac8f0;border-radius:4px;font-size:9.5px;font-weight:700;cursor:pointer;font-family:inherit;">Ver controles</button>';
        })()}
      </td>
      <td style="padding:8px 6px;text-align:center;font-size:11px;font-weight:700;">${{0.2:'Muy Baja',0.4:'Baja',0.6:'Media',0.8:'Alta',1:'Muy Alta'}[parseFloat(r.probRes)]||r.probRes||'—'}</td>
      <td style="padding:8px 6px;text-align:center;font-size:11px;font-weight:700;">${{0.2:'Leve',0.4:'Menor',0.6:'Moderado',0.8:'Mayor',1:'Catastrófico'}[parseFloat(r.impRes)]||r.impRes||'—'}</td>
      <td style="padding:6px;text-align:center;"><span style="display:inline-block;padding:3px 8px;border-radius:10px;font-size:10.5px;font-weight:700;background:${zRes.bg};color:${zRes.text};">${r.zonaRes||'—'}</span></td>
      <td style="padding:8px 10px;font-size:10.5px;"><div style="display:flex;align-items:center;gap:6px;"><span>${r.tratamiento||'—'}</span><button onclick="window._mzVerDetalleTratamiento('${r.id}')" style="padding:2px 6px;background:#f0fdf4;border:1px solid #86efac;border-radius:4px;color:#16a34a;font-size:8.5px;font-weight:700;cursor:pointer;white-space:nowrap;">Ver detalle</button></div></td>
      <td style="padding:6px;text-align:center;"><span class="chip ${estChip}" style="font-size:10px;">${r.estado}</span></td>
      <td style="padding:6px;text-align:center;white-space:nowrap;">
        ${_esSoloSupervision
          ? '<span style="font-size:10px;color:var(--muted);">👁 Solo supervisión</span>'
          : '<button onclick="editarRiesgo(\''+r.id+'\')" style="padding:3px 8px;background:#EFF6FF;color:#1D4ED8;border:1px solid #93C5FD;border-radius:4px;font-size:10px;cursor:pointer;margin-right:2px;">✏️</button>'
            +'<button onclick="eliminarRiesgo(\''+r.id+'\')" style="padding:3px 8px;background:#FEF2F2;color:var(--red);border:1px solid #FCA5A5;border-radius:4px;font-size:10px;cursor:pointer;">🗑</button>'}
      </td>
    </tr>`;
  }).join('');

  // Also update seguimiento when matriz changes
  renderSeguimiento();
  actualizarTercerosFiltro();

  // Si es Evaluador, el filtro por su entidad debe reaplicarse siempre sobre las
  // filas recién creadas (antes solo se aplicaba una vez, al iniciar sesión).
  try{
    if((window.currentUser||{}).rol==='Cliente'){ filtrarMatrizEntidad(); }
  }catch(e){}

  // Dashboard de supervisión por tercero (solo Administrador de Riesgos)
  try{ if((window.currentUser||{}).rol==='Operativo'){ window.renderMatrizDashSupervision&&window.renderMatrizDashSupervision(); } }catch(e){ console.warn('renderMatriz renderMatrizDashSupervision:', e); }
}

// Resumen por tercero de Análisis de Riesgos, para la vista de solo supervisión
// del Administrador de Riesgos: cuántos riesgos tiene cada uno, en qué zona y
// qué tratamiento/estado llevan — el detalle completo sigue en la tabla de abajo.
window.renderMatrizDashSupervision = function(){
  var box = document.getElementById('mz-dash-supervision'); if(!box) return;
  window._mzDashDetalle = {};
  var todos = (window.MATRIZ_DB||MATRIZ_DB||[]);

  if(!todos.length){
    box.innerHTML = '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);padding:40px 20px;text-align:center;color:#aaa;box-shadow:var(--shadow);">'
      + '<div style="font-size:32px;margin-bottom:8px;">📊</div>'
      + '<div style="font-size:13px;font-weight:600;color:#6c757d;">Aún no hay riesgos identificados para ningún tercero.</div>'
      + '<div style="font-size:11.5px;margin-top:4px;">Este panel se completará a medida que el Evaluador registre el Análisis de Riesgos.</div>'
      + '</div>';
    return;
  }

  function kpiTile(label, value, color, icon){
    return '<div style="background:white;border:1px solid var(--border);border-top:3px solid '+color+';border-radius:var(--r2);box-shadow:var(--shadow);padding:14px 10px;text-align:center;">'
      + '<div style="font-size:17px;margin-bottom:2px;">'+icon+'</div>'
      + '<div style="font-size:9.5px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">'+label+'</div>'
      + '<div style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:'+color+';">'+value+'</div>'
      + '</div>';
  }

  // ── Agregados globales ──────────────────────────────────────
  var porTercero = {};
  var porZona = {EXTREMO:0, ALTO:0, MODERADO:0, BAJO:0};
  var porTipo = {};
  var porEstado = {'Pendiente':0,'En Progreso':0,'Completado':0,'Cerrado':0};
  var conTratamiento = 0;

  todos.forEach(function(r){
    var k = r.tercero||'—';
    if(!porTercero[k]) porTercero[k] = {tercero:k, total:0, extremo:0, alto:0, moderado:0, bajo:0, pendientes:0, conTratamiento:0, riesgos:[]};
    var g = porTercero[k];
    g.total++;
    g.riesgos.push(r);
    var z=(r.zonaRes||r.zonaInh||'').toUpperCase();
    if(porZona[z]!==undefined) porZona[z]++;
    if(z==='EXTREMO') g.extremo++; else if(z==='ALTO') g.alto++; else if(z==='MODERADO') g.moderado++; else if(z==='BAJO') g.bajo++;
    if(r.estado==='Pendiente') g.pendientes++;
    if(porEstado[r.estado]!==undefined) porEstado[r.estado]++;
    if(r.tratamiento){ g.conTratamiento++; conTratamiento++; }
    var tp = r.tipo||'Sin tipo';
    porTipo[tp] = (porTipo[tp]||0)+1;
  });

  var lista = Object.values(porTercero).sort(function(a,b){
    return (b.extremo - a.extremo) || (b.alto - a.alto) || (b.total - a.total);
  });

  var totalTerceros = lista.length;
  var totalRiesgos  = todos.length;
  var cantidadPlanesAccion = 0;
  
  // Contar planes de acción definidos
  todos.forEach(function(r){
    if(r.planAccion && r.planAccion.trim()) cantidadPlanesAccion++;
  });

  // ── Encabezado ───────────────────────────────────────────────
  var h = '<div style="margin-bottom:14px;">'
    + '<h2 style="font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;color:var(--navy);margin:0 0 2px;">📊 Dashboard de Supervisión — Análisis de Riesgos</h2>'
    + '<div style="font-size:12px;color:var(--muted);">Vista consolidada de los riesgos identificados por el Evaluador para cada tercero</div>'
    + '</div>';

  // ── KPIs principales ─────────────────────────────────────────
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px;">'
    + kpiTile('Terceros en análisis', totalTerceros, 'var(--navy)', '🏢')
    + kpiTile('Riesgos identificados', totalRiesgos, 'var(--blue)', '📋')
    + kpiTile('Cantidad de planes de acción', cantidadPlanesAccion, 'var(--purple)', '📝')
    + '</div>';

  // ── Distribución por zona de riesgo residual ─────────────────
  var zonaDef = [
    {key:'EXTREMO',  label:'Extremo',  color:'#DC2626'},
    {key:'ALTO',     label:'Alto',     color:'#EA580C'},
    {key:'MODERADO', label:'Moderado', color:'#D97706'},
    {key:'BAJO',     label:'Bajo',     color:'#16A34A'}
  ];
  var stackedBar = '';
  zonaDef.forEach(function(z){
    var pct = totalRiesgos ? (porZona[z.key]/totalRiesgos*100) : 0;
    if(pct>0) stackedBar += '<div style="width:'+pct+'%;background:'+z.color+';height:100%;" title="'+z.label+': '+porZona[z.key]+'"></div>';
  });

  h += '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--shadow);padding:16px 18px;margin-bottom:16px;">'
    + '<div style="font-size:12px;font-weight:700;color:var(--navy);text-transform:uppercase;margin-bottom:10px;">Distribución por Zona de Riesgo (Residual)</div>'
    + '<div style="display:flex;height:18px;border-radius:9px;overflow:hidden;background:#f1f3f5;margin-bottom:10px;">'+stackedBar+'</div>'
    + '<div style="display:flex;gap:16px;flex-wrap:wrap;">'
    + zonaDef.map(function(z){
        var n = porZona[z.key]; var pct = totalRiesgos ? Math.round(n/totalRiesgos*100) : 0;
        return '<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--text);">'
          + '<span style="width:10px;height:10px;border-radius:3px;background:'+z.color+';display:inline-block;"></span>'
          + '<b>'+n+'</b> '+z.label+' <span style="color:var(--muted);">('+pct+'%)</span></div>';
      }).join('')
    + '</div></div>';

  // ── Tipologías y terceros con mayor exposición ────────────────
  var tipoArr = Object.keys(porTipo).map(function(k){ return {tipo:k, n:porTipo[k]}; }).sort(function(a,b){ return b.n-a.n; });
  var maxTipo = tipoArr.length ? tipoArr[0].n : 1;
  var tipoHtml = tipoArr.slice(0,8).map(function(t){
    var pct = Math.round(t.n/maxTipo*100);
    return '<div style="margin-bottom:9px;">'
      + '<div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px;"><span style="color:var(--text);">'+t.tipo+'</span><b style="color:var(--navy);">'+t.n+'</b></div>'
      + '<div style="background:#eef1f4;border-radius:4px;height:7px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--blue);border-radius:4px;"></div></div>'
      + '</div>';
  }).join('') || '<div style="color:var(--muted);font-size:12px;">Sin datos suficientes</div>';

  var top3 = lista.slice(0,3);
  var topHtml = top3.map(function(g, i){
    var zonaColor = g.extremo>0?'#DC2626':g.alto>0?'#EA580C':g.moderado>0?'#D97706':'#16A34A';
    var medalla = ['🥇','🥈','🥉'][i]||'';
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;'+(i<top3.length-1?'border-bottom:1px solid var(--border);':'')+'">'
      + '<div style="font-size:16px;">'+medalla+'</div>'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-weight:700;font-size:12.5px;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+g.tercero+'</div>'
      + '<div style="font-size:10.5px;color:var(--muted);">'+g.total+' riesgo'+(g.total===1?'':'s')+' · '+g.conTratamiento+'/'+g.total+' con tratamiento</div>'
      + '</div>'
      + '<span style="width:10px;height:10px;border-radius:50%;background:'+zonaColor+';display:inline-block;flex-shrink:0;"></span>'
      + '</div>';
  }).join('') || '<div style="color:var(--muted);font-size:12px;padding:10px 0;">Sin datos suficientes</div>';

  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">'
    + '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--shadow);padding:16px 18px;">'
      + '<div style="font-size:12px;font-weight:700;color:var(--navy);text-transform:uppercase;margin-bottom:10px;">Riesgos por Tipología</div>'
      + tipoHtml
    + '</div>'
    + '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--shadow);padding:16px 18px;">'
      + '<div style="font-size:12px;font-weight:700;color:var(--navy);text-transform:uppercase;margin-bottom:6px;">Terceros con Mayor Exposición</div>'
      + topHtml
    + '</div>'
    + '</div>';

  // ── Resumen por tercero (grid de tarjetas) ────────────────────
  h += '<div style="font-size:12px;font-weight:700;color:var(--navy);text-transform:uppercase;margin-bottom:8px;">Resumen por Tercero</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">';
  lista.forEach(function(g, idx){
    window._mzDashDetalle[idx] = g.riesgos || [];
    var zonaColor = g.extremo>0?'#dc3545':g.alto>0?'#fd7e14':g.moderado>0?'#d97706':'#28a745';
    var pctTrat = g.total ? Math.round(g.conTratamiento/g.total*100) : 0;
    h += '<div style="background:white;border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--shadow);padding:14px;">'
      + '<div style="font-weight:700;font-size:12.5px;color:#1a3a5c;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+g.tercero+'</div>'
      + '<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px;">'
      + '<span style="font-family:Montserrat,sans-serif;font-size:22px;font-weight:800;color:'+zonaColor+';">'+g.total+'</span>'
      + '<span style="font-size:10.5px;color:#6c757d;">riesgo'+(g.total===1?'':'s')+' identificado'+(g.total===1?'':'s')+'</span></div>'
      + '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">'
      + (g.extremo?'<span style="font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:8px;background:#fef2f2;color:#dc3545;">'+g.extremo+' extremo</span>':'')
      + (g.alto?'<span style="font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:8px;background:#fff7ed;color:#fd7e14;">'+g.alto+' alto</span>':'')
      + (g.moderado?'<span style="font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:8px;background:#fffbeb;color:#b45309;">'+g.moderado+' moderado</span>':'')
      + (g.bajo?'<span style="font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:8px;background:#f0fdf4;color:#28a745;">'+g.bajo+' bajo</span>':'')
      + '</div>'
      + '<div style="margin-bottom:6px;">'
        + '<div style="display:flex;justify-content:space-between;font-size:10px;color:#6c757d;margin-bottom:2px;"><span>Tratamiento definido</span><span>'+pctTrat+'%</span></div>'
        + '<div style="background:#eef1f4;border-radius:4px;height:6px;overflow:hidden;"><div style="height:100%;width:'+pctTrat+'%;background:#28a745;border-radius:4px;"></div></div>'
      + '</div>'
      + '<div style="font-size:10.5px;color:#6c757d;margin-bottom:8px;">'+g.pendientes+' pendiente'+(g.pendientes===1?'':'s')+' de gestión</div>'
      + '<button onclick="mzToggleDetalleTercero('+idx+',this)" style="width:100%;padding:6px 0;background:#e8f4ff;border:1px solid #93c5fd;color:#1e6bb8;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;">Ver detalle de riesgos ▾</button>'
      + '<div id="mz-det-'+idx+'" style="display:none;margin-top:8px;"></div>'
      + '</div>';
  });
  h += '</div>';

  box.innerHTML = h;
};

// Despliega/oculta el detalle de riesgos de un tercero dentro de su tarjeta
// en el dashboard de supervisión (sin necesidad de bajar a la tabla completa).
window.mzToggleDetalleTercero = function(idx, btn){
  var panel = document.getElementById('mz-det-'+idx);
  if(!panel) return;
  var abierto = panel.style.display !== 'none' && panel.innerHTML !== '';
  if(abierto){
    panel.style.display = 'none';
    panel.innerHTML = '';
    if(btn) btn.textContent = 'Ver detalle de riesgos ▾';
    return;
  }
  var riesgos = (window._mzDashDetalle && window._mzDashDetalle[idx]) || [];
  var zonaBg = {
    EXTREMO:  ['#fef2f2','#dc3545'],
    ALTO:     ['#fff7ed','#fd7e14'],
    MODERADO: ['#fffbeb','#b45309'],
    BAJO:     ['#f0fdf4','#28a745']
  };
  var html = riesgos.length ? riesgos.map(function(r){
    var z = (r.zonaRes||r.zonaInh||'BAJO').toUpperCase();
    var colores = zonaBg[z] || zonaBg.BAJO;
    var desc = r.desc || r.descripcion || 'Sin descripción';
    if(desc.length > 110) desc = desc.slice(0,110)+'…';
    return '<div style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">'
      + '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">'
      + '<div style="font-size:11px;color:#374151;flex:1;line-height:1.4;">'+desc+'</div>'
      + '<span style="flex-shrink:0;font-size:9px;font-weight:700;padding:1px 6px;border-radius:8px;background:'+colores[0]+';color:'+colores[1]+';">'+z+'</span>'
      + '</div>'
      + '<div style="font-size:10px;color:#9ca3af;margin-top:3px;">'+(r.tipo||'—')+' · '+(r.tratamiento||'Sin tratamiento definido')+' · '+(r.estado||'—')+'</div>'
      + '</div>';
  }).join('') : '<div style="font-size:11px;color:#aaa;padding:10px;text-align:center;">Sin riesgos registrados</div>';
  panel.innerHTML = '<div style="background:#fafbfc;border:1px solid var(--border);border-radius:6px;max-height:230px;overflow-y:auto;">'+html+'</div>';
  panel.style.display = 'block';
  if(btn) btn.textContent = 'Ocultar detalle ▴';
};

// ─── TABS CUESTIONARIO ───────────────────────────────────────
function switchCuestTab(tab){
  var tabs   = {cuest:'cq-tab-cuest', instruc:'cq-tab-instruc'};
  var panels = {cuest:'cq-panel-cuest', instruc:'cq-panel-instruc'};
  Object.keys(tabs).forEach(function(k){
    var t = document.getElementById(tabs[k]);
    var p = document.getElementById(panels[k]);
    if(!t || !p) return;
    if(k === tab){ t.classList.add('active'); p.style.display = ''; }
    else { t.classList.remove('active'); p.style.display = 'none'; }
  });
}
function toggleInstrucDim(headerEl){
  var body = headerEl.nextElementSibling;
  var arr  = headerEl.querySelector('span:last-child');
  if(!body) return;
  var open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if(arr) arr.textContent = open ? '▼' : '▲';
}
// Storage for Info Tercera Parte data
var INF_TERCERA_PARTE = {};

function onDimAplicaChange(sel, key){
  var row = document.querySelector('tr[data-dim-key="'+key+'"]');
  if(!row) return;
  if(sel.value === 'No aplica'){
    row.style.opacity = '0.45';
    row.style.background = '#F9FAFB';
  } else if(sel.value === 'Sí'){
    row.style.opacity = '1';
    row.style.background = '#F0FDF4';
    // Brief green flash
    setTimeout(function(){ row.style.background=''; }, 1200);
  } else {
    row.style.opacity = '1';
    row.style.background = '';
  }
}

function guardarInfoTerceraParte(){
  // ── Recopilar todos los campos ──────────────────────
  var datos = {
    // Supervisor
    supNombre:   document.getElementById('inf-sup-nombre')?.value.trim()||'',
    supCargo:    document.getElementById('inf-sup-cargo')?.value.trim()||'',
    supCorreo:   document.getElementById('inf-sup-correo')?.value.trim()||'',
    supFecha:    document.getElementById('inf-sup-fecha')?.value||'',
    supPersonas: document.getElementById('inf-sup-personas')?.value.trim()||'',
    // Proveedor
    provNombre:  document.getElementById('inf-prov-nombre')?.value.trim()||'',
    provCargo:   document.getElementById('inf-prov-cargo')?.value.trim()||'',
    provCorreo:  document.getElementById('inf-prov-correo')?.value.trim()||'',
    provFecha:   document.getElementById('inf-prov-fecha')?.value||'',
    provPersonas:document.getElementById('inf-prov-personas')?.value.trim()||'',
    // Empresa
    empNombre:   document.getElementById('inf-emp-nombre')?.value.trim()||'',
    empAnos:     document.getElementById('inf-emp-anos')?.value||'',
    empFiltdatos:document.getElementById('inf-emp-filtdatos')?.value||'',
    empIncidentes:document.getElementById('inf-emp-incidentes')?.value||'',
    empProvbrecha:document.getElementById('inf-emp-provbrecha')?.value||'',
    // Infraestructura
    cdp1:        document.getElementById('inf-cdp1')?.value.trim()||'',
    cdp2:        document.getElementById('inf-cdp2')?.value.trim()||'',
    colpInfo:    document.getElementById('inf-colp-info')?.value||'',
    sistemas:    document.getElementById('inf-sistemas')?.value.trim()||'',
    cuartasPartes:document.getElementById('inf-cuartas-partes')?.value.trim()||'',
    // Dimensiones aplicables (clave → 'Sí' | 'No aplica' | '')
    dims: {}
  };

  ['si','cn','op','fr','laft','cu','fi'].forEach(function(key){
    var sel = document.getElementById('dim-aplica-'+key);
    if(sel) datos.dims[key] = sel.value;
  });

  INF_TERCERA_PARTE = datos;

  // ── Intentar asociar automáticamente a un tercero ──
  // Buscar por nombre de empresa o nombre del proveedor en TERCEROS_DB
  var matchNit = null;
  var buscar = (datos.empNombre||datos.provNombre||'').toLowerCase();
  if(buscar && typeof TERCEROS_DB !== 'undefined'){
    Object.values(TERCEROS_DB).forEach(function(t){
      if(!matchNit && t.nombre && t.nombre.toLowerCase().includes(buscar)){
        matchNit = t.nit;
      }
    });
    // Also try reverse: if TERCEROS_DB name contains the search term
    if(!matchNit){
      Object.values(TERCEROS_DB).forEach(function(t){
        if(!matchNit && buscar && buscar.length>3 && t.nombre &&
           buscar.includes(t.nombre.toLowerCase().slice(0,6))){
          matchNit = t.nit;
        }
      });
    }
  }

  // ── Aplicar dims al cuestionario si hay un tercero asociado ──
  if(matchNit){
    // Override tipKeys in TERCEROS_DB dims to only those marked Sí
    var dimsActivas = Object.keys(datos.dims).filter(function(k){ return datos.dims[k]==='Sí'; });
    if(dimsActivas.length > 0 && TERCEROS_DB[matchNit]){
      // Store inf dims filter
      TERCEROS_DB[matchNit]._infDimsFilter = dimsActivas;
    }
    // Select that tercero in the cuestionario
    var sel = document.getElementById('q-tercero');
    if(sel){ sel.value = matchNit; }
    nitActual = matchNit;
  }

  // Store dims filter globally for next cuestionario load
  window._infDimsFilter = Object.keys(datos.dims).filter(function(k){ return datos.dims[k]==='Sí'; });
  window._infDimsNA = Object.keys(datos.dims).filter(function(k){ return datos.dims[k]==='No aplica'; });

  showToast('Información guardada' + (matchNit ? ' — tercero asociado automáticamente' : '') + '. Ir a Cuestionario para continuar.', 'success', 3500);

  // Add a button to jump to cuestionario tab
  setTimeout(function(){
    switchCuestTab('cuest');
    if(matchNit) cargarCuestionarioTercero();
  }, 500);
}
function limpiarInfoTerceraParte(){
  ['inf-sup-nombre','inf-sup-cargo','inf-sup-correo','inf-prov-nombre','inf-prov-cargo','inf-prov-correo',
   'inf-emp-nombre','inf-emp-anos','inf-emp-filtdatos','inf-emp-filtdatos-desc','inf-emp-incidentes',
   'inf-emp-incidentes-desc','inf-emp-provbrecha','inf-emp-provbrecha-desc','inf-cdp1','inf-cdp2',
   'inf-ubic-add','inf-soft','inf-nube','inf-sistemas','inf-colp-info','inf-cuartas-partes'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  document.querySelectorAll('.inf-aloj-chk,.inf-nube-chk,.inf-tipodatos-chk').forEach(function(cb){ cb.checked=false; });
  ['si','cn','op','fr','laft','cu','fi'].forEach(function(k){
    ['dim-aplica-','dim-resp-','dim-cargo-','dim-fecha-'].forEach(function(pfx){
      var el=document.getElementById(pfx+k); if(el) el.value='';
    });
  });
  showToast('Formulario limpiado','info',1500);
}

// ═══════════════════════════════════════════════════════════
// CENTRO DE EVIDENCIAS — ADMIN
// ═══════════════════════════════════════════════════════════
function switchEvTab(tab){
  var tabs   = {cuest:'ev-tab-cuest', matriz:'ev-tab-matriz'};
  var panels = {cuest:'ev-panel-cuest', matriz:'ev-panel-matriz'};
  Object.keys(tabs).forEach(function(k){
    var t = document.getElementById(tabs[k]);
    var p = document.getElementById(panels[k]);
    if(!t||!p) return;
    if(k===tab){ t.classList.add('active'); p.style.display=''; }
    else { t.classList.remove('active'); p.style.display='none'; }
  });
  renderEvidenciasAdmin();
}

function renderEvidenciasAdmin(){
  renderEvCuestionario();
  renderEvMatriz();
}

// ── EVIDENCIAS CUESTIONARIO ──────────────────────────────────
function renderEvCuestionario(){
  var wrap = document.getElementById('ev-cuest-wrap');
  if(!wrap) return;

  var filTercero = (document.getElementById('ev-fil-tercero')||{}).value||'';
  var filKey     = (document.getElementById('ev-fil-key')||{}).value||'';

  // Collect all evidence from EVID_CUEST: keys = "nitKey_key_ctrlN"
  var groups = {}; // {terceroLabel: {key: {ctrlN: [evs]}}}

  Object.keys(EVID_CUEST).forEach(function(sk){
    var evs = EVID_CUEST[sk];
    if(!evs || !evs.length) return;
    // Parse sk: nitKey_key_ctrlN  (nitKey may have underscores)
    // We reconstruct by finding nitKey from TERCEROS_DB
    var parts = sk.split('_');
    var ctrlN = parts[parts.length-1];
    var key   = parts[parts.length-2];
    var nitKey = parts.slice(0,parts.length-2).join('_');

    // Find tercero name from nitKey (nitKey is nit with non-alphanum replaced by _)
    var terceroLabel = nitKey;
    Object.values(TERCEROS_DB||{}).forEach(function(t){
      var tk = t.nit.replace(/[^a-z0-9]/gi,'_');
      if(tk === nitKey) terceroLabel = t.nombre;
    });
    // Also check tercerosPendientesCuestionario
    (tercerosPendientesCuestionario||[]).forEach(function(t){
      var tk = t.nit.replace(/[^a-z0-9]/gi,'_');
      if(tk === nitKey) terceroLabel = t.nombre;
    });

    if(filTercero && terceroLabel !== filTercero) return;
    if(filKey && key !== filKey) return;

    if(!groups[terceroLabel]) groups[terceroLabel] = {};
    if(!groups[terceroLabel][key]) groups[terceroLabel][key] = {};
    if(!groups[terceroLabel][key][ctrlN]) groups[terceroLabel][key][ctrlN] = [];
    EVID_CUEST[sk].forEach(function(e){ groups[terceroLabel][key][ctrlN].push(e); });
  });

  // Populate tercero filter
  var selT = document.getElementById('ev-fil-tercero');
  if(selT){
    var prev = selT.value;
    var allNames = new Set();
    Object.keys(EVID_CUEST).forEach(function(sk){
      if(!(EVID_CUEST[sk]||[]).length) return;
      var parts = sk.split('_');
      var nitKey = parts.slice(0,parts.length-2).join('_');
      var name = nitKey;
      Object.values(TERCEROS_DB||{}).forEach(function(t){
        if(t.nit.replace(/[^a-z0-9]/gi,'_')===nitKey) name=t.nombre;
      });
      allNames.add(name);
    });
    selT.innerHTML = '<option value="">Todos los terceros</option>';
    allNames.forEach(function(n){
      selT.innerHTML += '<option value="'+n+'" '+(n===prev?'selected':'')+'>'+n+'</option>';
    });
  }

  var totalGroups = Object.keys(groups).length;
  if(!totalGroups){
    wrap.innerHTML = '<div class="alert al-b">&#128204; No hay evidencias adjuntadas en el Cuestionario AC aún. Las evidencias se agregan desde la pestaña <b>Cuestionario</b> en cada control.</div>';
    return;
  }

  var SECS = {op:'&#9881;&#65039; Operacional',cn:'&#128260; Continuidad',si:'&#128272; SI/Ciberseg.',cu:'&#128220; Cumplimiento',fr:'&#128680; Fraude',laft:'&#9878;&#65039; LAFT',fi:'&#128176; Financiero',pa:'&#127758; País'};
  var SEC_COLORS = {op:'#1D4ED8',cn:'#0D9488',si:'#DC2626',cu:'#16A34A',fr:'#EA580C',laft:'#0369A1',fi:'#B45309',pa:'#7C3AED'};
  var SEC_BG     = {op:'#EFF6FF',cn:'#F0FDFA',si:'#FEF2F2',cu:'#F0FDF4',fr:'#FFF7ED',laft:'#F0F9FF',fi:'#FFFBEB',pa:'#F5F3FF'};

  var html = '';
  Object.keys(groups).forEach(function(tercero){
    html += '<div class="card" style="margin-bottom:14px;border-left:4px solid var(--navy);">';
    html += '<div class="card-hdr" style="background:var(--navy);border-radius:10px 10px 0 0;cursor:pointer;" onclick="toggleEvGroup(this)">';
    html += '<h3 style="color:white;font-size:13px;">&#127970; '+tercero+'</h3>';
    html += '<span style="color:rgba(255,255,255,.7);font-size:12px;">'+countEvsTercero(groups[tercero])+' evidencia(s)</span>';
    html += '</div><div class="ev-group-body">';

    var tipKeys = Object.keys(groups[tercero]);
    tipKeys.forEach(function(key){
      var color  = SEC_COLORS[key]||'#374151';
      var bg     = SEC_BG[key]||'#F9FAFB';
      var label  = SECS[key]||key;
      html += '<div style="margin:10px 16px;border:1px solid '+color+'33;border-radius:8px;overflow:hidden;">';
      html += '<div style="padding:8px 14px;background:'+bg+';display:flex;justify-content:space-between;align-items:center;">';
      html += '<div style="font-size:12.5px;font-weight:700;color:'+color+';">'+label+'</div>';
      html += '<span style="font-size:11px;color:var(--muted);">'+countEvsKey(groups[tercero][key])+' evidencia(s)</span>';
      html += '</div>';

      var ctrlNs = Object.keys(groups[tercero][key]);
      ctrlNs.forEach(function(ctrlN){
        var evs = groups[tercero][key][ctrlN];
        if(!evs||!evs.length) return;
        html += '<div style="padding:8px 14px;border-top:1px solid '+color+'22;">';
        html += '<div style="font-size:11.5px;font-weight:600;color:var(--navy);margin-bottom:6px;">Control #'+ctrlN+'</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
        evs.forEach(function(ev, i){
          html += buildEvidenciaCard(ev, tercero, key, ctrlN, i);
        });
        html += '</div></div>';
      });
      html += '</div>';
    });

    html += '</div></div>';
  });

  wrap.innerHTML = html;
}

function countEvsTercero(tipMap){
  var n=0;
  Object.keys(tipMap).forEach(function(k){ Object.keys(tipMap[k]).forEach(function(c){ n+=(tipMap[k][c]||[]).length; }); });
  return n;
}
function countEvsKey(ctrlMap){
  var n=0;
  Object.keys(ctrlMap).forEach(function(c){ n+=(ctrlMap[c]||[]).length; });
  return n;
}

function buildEvidenciaCard(ev, tercero, key, ctrlN, idx){
  var isImg = ev.type && ev.type.indexOf('image/')===0;
  var ext   = (ev.name||'').split('.').pop().toUpperCase();
  var sizeKB = ev.size ? (ev.size/1024).toFixed(1)+'KB' : '';
  var icon  = ext==='PDF'?'&#128196;':ext.includes('XL')?'&#128202;':ext.includes('DOC')?'&#128195;':'&#128196;';
  var dataAttrs = 'data-ev-tercero="'+encodeURIComponent(tercero)+'" data-ev-key="'+key+'" data-ev-ctrl="'+ctrlN+'" data-ev-idx="'+idx+'"';
  var thumbStyle = 'style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border2);cursor:pointer;"';
  var boxStyle = 'style="width:56px;height:56px;background:#F3F4F6;border:1px solid var(--border2);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;"';
  var thumb = isImg
    ? '<img src="'+ev.dataUrl+'" '+thumbStyle+' '+dataAttrs+' onclick="evCardClick(this)"/>'
    : '<div '+boxStyle+' '+dataAttrs+' onclick="evCardClick(this)"><span style="font-size:20px;">'+icon+'</span><span style="font-size:8px;font-weight:700;color:var(--muted);">'+ext+'</span></div>';
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;max-width:80px;">'
    +thumb
    +'<div style="font-size:9.5px;color:var(--text);text-align:center;max-width:78px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+ev.name+'">'+ev.name+'</div>'
    +'<div style="font-size:9px;color:var(--muted);">'+sizeKB+'</div>'
    +'</div>';
}

function evCardClick(el){
  var tercero = decodeURIComponent(el.getAttribute('data-ev-tercero')||'');
  var key     = el.getAttribute('data-ev-key')||'';
  var ctrlN   = el.getAttribute('data-ev-ctrl')||'';
  var idx     = parseInt(el.getAttribute('data-ev-idx')||'0');
  abrirEvidenciaModal(tercero, key, ctrlN, idx);
}

function toggleEvGroup(headerEl){
  var body = headerEl.nextElementSibling;
  if(!body) return;
  body.style.display = body.style.display==='none' ? '' : 'none';
}

// ── EVIDENCIAS MATRIZ ────────────────────────────────────────
function renderEvMatriz(){
  var wrap = document.getElementById('ev-matriz-wrap');
  if(!wrap) return;

  var groups = {}; // {riesgoId: [evs]}
  Object.keys(EVID_RIESGO||{}).forEach(function(k){
    var evs = EVID_RIESGO[k];
    if(evs&&evs.length) groups[k] = evs;
  });
  // Also check _tmpEvRiesgo assigned to saved riesgos
  // We store them per riesgo id when guardarRiesgo is called
  if(!Object.keys(groups).length && !(_tmpEvRiesgo&&_tmpEvRiesgo.length)){
    wrap.innerHTML = '<div class="alert al-b">&#128204; No hay evidencias adjuntadas en la Matriz de Riesgos aún. Las evidencias se agregan al crear o editar un riesgo.</div>';
    return;
  }

  var html = '';
  // Show _tmpEvRiesgo as pending
  if(_tmpEvRiesgo && _tmpEvRiesgo.length){
    html += '<div class="card" style="margin-bottom:14px;border-left:4px solid var(--orange);">';
    html += '<div class="card-hdr"><h3>&#128204; Evidencias pendientes de guardar</h3><span style="font-size:11px;color:var(--orange);">'+_tmpEvRiesgo.length+' archivo(s)</span></div>';
    html += '<div class="card-body"><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    _tmpEvRiesgo.forEach(function(ev,i){
      html += buildEvidenciaCardMatriz(ev, '_tmp_', i);
    });
    html += '</div></div></div>';
  }

  MATRIZ_DB.forEach(function(r){
    var evs = EVID_RIESGO[r.id];
    if(!evs||!evs.length) return;
    var zColor = {EXTREMO:'var(--red)',ALTO:'var(--orange)',MODERADO:'#856404',BAJO:'var(--green)'}[r.zonaInh]||'var(--muted)';
    html += '<div class="card" style="margin-bottom:12px;border-left:4px solid '+zColor+';">';
    html += '<div class="card-hdr"><div><div style="font-size:13px;font-weight:700;color:var(--navy);">'+r.id+' — '+r.tipo+'</div>';
    html += '<div style="font-size:11.5px;color:var(--muted);">'+r.tercero+' · '+r.desc.slice(0,80)+'...</div></div>';
    html += '<span style="font-size:11px;background:var(--gray3);padding:2px 8px;border-radius:10px;">'+evs.length+' evidencia(s)</span></div>';
    html += '<div class="card-body"><div style="display:flex;flex-wrap:wrap;gap:8px;">';
    evs.forEach(function(ev,i){ html += buildEvidenciaCardMatriz(ev, r.id, i); });
    html += '</div></div></div>';
  });

  if(!html) html = '<div class="alert al-b">&#128204; No hay evidencias guardadas en riesgos aún.</div>';
  wrap.innerHTML = html;
}

function buildEvidenciaCardMatriz(ev, riesgoId, idx){
  var isImg = ev.type && ev.type.indexOf('image/')===0;
  var ext   = (ev.name||'').split('.').pop().toUpperCase();
  var sizeKB = ev.size ? (ev.size/1024).toFixed(1)+'KB' : '';
  var icon  = ext==='PDF'?'&#128196;':ext.includes('XL')?'&#128202;':'&#128196;';
  var dataAttrs = 'data-mev-riesgo="'+encodeURIComponent(riesgoId)+'" data-mev-idx="'+idx+'"';
  var thumbStyle = 'style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border2);cursor:pointer;"';
  var boxStyle = 'style="width:56px;height:56px;background:#F3F4F6;border:1px solid var(--border2);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;"';
  var thumb = isImg
    ? '<img src="'+ev.dataUrl+'" '+thumbStyle+' '+dataAttrs+' onclick="evMatrizCardClick(this)"/>'
    : '<div '+boxStyle+' '+dataAttrs+' onclick="evMatrizCardClick(this)"><span style="font-size:20px;">'+icon+'</span><span style="font-size:8px;font-weight:700;color:var(--muted);">'+ext+'</span></div>';
  return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;max-width:80px;">'
    +thumb
    +'<div style="font-size:9.5px;color:var(--text);text-align:center;max-width:78px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="'+ev.name+'">'+ev.name+'</div>'
    +'<div style="font-size:9px;color:var(--muted);">'+sizeKB+'</div>'
    +'</div>';
}

function evMatrizCardClick(el){
  var riesgoId = decodeURIComponent(el.getAttribute('data-mev-riesgo')||'');
  var idx      = parseInt(el.getAttribute('data-mev-idx')||'0');
  abrirEvidenciaModalMatriz(riesgoId, idx);
}

// ── MODAL VISOR EVIDENCIA ────────────────────────────────────
function abrirEvidenciaModal(tercero, key, ctrlN, idx){
  var nitKey = '';
  // Find nitKey for this tercero
  var t = Object.values(TERCEROS_DB||{}).find(function(x){ return x.nombre===tercero; });
  if(t) nitKey = t.nit.replace(/[^a-z0-9]/gi,'_');
  else {
    var tp = (tercerosPendientesCuestionario||[]).find(function(x){ return x.nombre===tercero; });
    if(tp) nitKey = tp.nit.replace(/[^a-z0-9]/gi,'_');
  }
  var sk = nitKey+'_'+key+'_'+ctrlN;
  var evs = EVID_CUEST[sk]||[];
  var ev  = evs[idx];
  if(!ev) return;
  mostrarEvidenciaEnModal(ev, 'Control #'+ctrlN+' — '+tercero);
}

function abrirEvidenciaModalMatriz(riesgoId, idx){
  var evs = riesgoId==='_tmp_' ? (_tmpEvRiesgo||[]) : (EVID_RIESGO[riesgoId]||[]);
  var ev  = evs[idx];
  if(!ev) return;
  mostrarEvidenciaEnModal(ev, riesgoId==='_tmp_'?'Evidencia pendiente':'Riesgo: '+riesgoId);
}

function mostrarEvidenciaEnModal(ev, titulo){
  var overlay = document.getElementById('m-visor-evidencia');
  if(!overlay) return;
  var titleEl  = document.getElementById('vev-title');
  var nameEl   = document.getElementById('vev-name');
  var sizeEl   = document.getElementById('vev-size');
  var contenEl = document.getElementById('vev-content');
  if(titleEl) titleEl.textContent = titulo;
  if(nameEl)  nameEl.textContent  = ev.name||'';
  if(sizeEl)  sizeEl.textContent  = ev.size ? (ev.size/1024).toFixed(1)+' KB' : '';
  if(contenEl){
    var isImg = ev.type && ev.type.indexOf('image/')===0;
    var isPDF = (ev.name||'').toLowerCase().endsWith('.pdf');
    if(isImg){
      contenEl.innerHTML = '<img src="'+ev.dataUrl+'" style="max-width:100%;max-height:60vh;border-radius:8px;display:block;margin:0 auto;"/>';
    } else if(isPDF){
      contenEl.innerHTML = '<iframe src="'+ev.dataUrl+'" style="width:100%;height:60vh;border:none;border-radius:8px;"></iframe>';
    } else {
      contenEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);"><div style="font-size:48px;margin-bottom:12px;">&#128196;</div><div style="font-size:13px;font-weight:600;">'+ev.name+'</div><div style="font-size:12px;margin-top:8px;">Vista previa no disponible para este tipo de archivo.</div><a href="'+ev.dataUrl+'" download="'+ev.name+'" style="display:inline-block;margin-top:14px;padding:8px 18px;background:var(--blue);color:white;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">&#11015;&#65039; Descargar</a></div>';
    }
  }
  // Download button
  var dlBtn = document.getElementById('vev-download');
  if(dlBtn){
    dlBtn.onclick = function(){
      var a = document.createElement('a');
      a.href = ev.dataUrl;
      a.download = ev.name||'evidencia';
      a.click();
    };
  }
  overlay.classList.add('open');
}

// Store evidencias to riesgo when saved
var _origGuardarRiesgo = typeof guardarRiesgo === 'function' ? guardarRiesgo : null;
function _saveEvRiesgoOnGuardar(riesgoId){
  if(_tmpEvRiesgo && _tmpEvRiesgo.length){
    EVID_RIESGO[riesgoId] = (_tmpEvRiesgo||[]).slice();
    _tmpEvRiesgo = [];
    var wrap = document.getElementById('nr-evid-wrap');
    if(wrap) wrap.innerHTML = '';
  }
}

function switchMatrizTab(tab){
  const tm=document.getElementById('mz-tab-matriz'), tp=document.getElementById('mz-tab-params');
  const pm=document.getElementById('mz-panel-matriz'), pp=document.getElementById('mz-panel-params');
  if(tab==='matriz'){ tm.classList.add('active'); tp.classList.remove('active'); pm.style.display=''; pp.style.display='none'; }
  else { tp.classList.add('active'); tm.classList.remove('active'); pp.style.display=''; pm.style.display='none'; }
}
function filtrarMatriz(){ renderMatriz(); }

// Al cambiar el tercero seleccionado en el filtro, recargar los contratos
// disponibles (los del tercero elegido) en el filtro Contrato.
window.mzActualizarFiltroContrato = function(){
  var selT = document.getElementById('mz-fil-tercero');
  var selC = document.getElementById('mz-fil-contrato');
  if(!selT || !selC) return;
  var nombreT = selT.value||'';
  selC.innerHTML = '<option value="">Todos</option>';
  if(!nombreT) return;
  var t = Object.values(window.TERCEROS_DB||{}).find(function(x){return x.nombre===nombreT || x.nit===nombreT;});
  if(!t || !t.contratos) return;
  t.contratos.forEach(function(c){
    var opt=document.createElement('option'); opt.value=(c.num||''); opt.textContent=(c.num||'s/n')+(c.objeto?' — '+c.objeto:'');
    selC.appendChild(opt);
  });
};

function filtrarMatrizEntidad(){
  var entRaw = (document.getElementById('mz-fil-entidad')?.value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  // Alias histórico: cliente1 == colpensiones (unificar visualmente)
  if(entRaw==='cliente1') entRaw='colpensiones';
  const ent = entRaw;
  const tercSet = new Set();
  document.querySelectorAll('#tbody-matriz tr').forEach(tr=>{
    var teRaw = (tr.dataset.entidad||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(teRaw==='cliente1') teRaw='colpensiones';
    const te = teRaw;
    const show = !ent || te === ent;
    tr.style.display = show ? '' : 'none';
    if(show && tr.dataset.tercero) tercSet.add(tr.dataset.tercero);
  });
  const selT = document.getElementById('mz-fil-tercero');
  if(selT){ const prev=selT.value; selT.innerHTML='<option value="">Todos</option>'+[...tercSet].map(t=>'<option value="'+t+'" '+(t===prev?'selected':'')+'>'+t+'</option>').join(''); }
}
function limpiarFiltrosMatriz(){
  ['mz-fil-entidad','mz-fil-tercero','mz-fil-tipo','mz-fil-zona','mz-fil-trat'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value='';
  });
  renderMatriz();
}

function actualizarTercerosFiltro(){
  const sel = document.getElementById('mz-fil-tercero');
  if(!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">Todos</option>';
  const nombres = [...new Set(MATRIZ_DB.map(r=>r.tercero))];
  nombres.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    sel.appendChild(opt);
  });
  if(prev) sel.value = prev;

  // Also populate nr-tercero in modal
  const selModal = document.getElementById('nr-tercero');
  if(selModal){
    selModal.innerHTML = '<option value="">— Seleccionar —</option>';
    // From TERCEROS_DB
    Object.values(TERCEROS_DB).forEach(t=>{
      const opt = document.createElement('option');
      opt.value = t.nombre; opt.textContent = t.nombre;
      selModal.appendChild(opt);
    });
  }
}

// ─── CALC ZONA AUTOMÁTICO EN MODAL ───────────────────────────
function calcZonaMatriz(){
  const pInh = document.getElementById('nr-prob-inh')?.value;
  const iInh = document.getElementById('nr-imp-inh')?.value;
  const pRes = document.getElementById('nr-prob-res')?.value;
  const iRes = document.getElementById('nr-imp-res')?.value;

  const setZona = (elId, p, i) => {
    const el = document.getElementById(elId);
    if(!el) return;
    if(!p || !i){ el.textContent='—'; el.style.background='#F3F4F6'; el.style.color='var(--muted)'; return; }
    const z = zonaFromProb(p, i);
    const zc = ZONA_COLOR[z] || ZONA_COLOR['BAJO'];
    el.textContent = z;
    el.style.background = zc.bg;
    el.style.color = zc.text;
  };
  setZona('nr-zona-inh', pInh, iInh);
  setZona('nr-zona-res', pRes, iRes);
}

// ── Frecuencia → Probabilidad Inherente (automático) ─────────────
// El comentario del cliente dice: "es vital identificar la frecuencia de
// la actividad para hallar la probabilidad inherente". La frecuencia se
// COPIA directo a la probabilidad (misma escala), pero el usuario puede
// sobrescribirla manualmente después.
function calcProbInherenteAuto(){
  var f = parseFloat(document.getElementById('nr-frecuencia')?.value||0);
  var divP = document.getElementById('nr-prob-inh');
  var inputP = document.getElementById('nr-prob-inh-val');
  if(f && divP){
    // Mapeo de valor numérico a texto legible
    var mapProb = {
      '1.0': 'Muy Alta',
      '0.95': 'Muy Alta',
      '0.9': 'Alta',
      '0.85': 'Alta',
      '0.80': 'Alta',
      '0.75': 'Media',
      '0.70': 'Media',
      '0.65': 'Media',
      '0.60': 'Media',
      '0.55': 'Baja',
      '0.50': 'Baja',
      '0.45': 'Baja',
      '0.40': 'Baja',
      '0.30': 'Muy Baja',
      '0.20': 'Muy Baja'
    };
    var txt = mapProb[String(f)] || 'Media';
    divP.textContent = txt;
    if(inputP) inputP.value = String(f);
  }
}

// ── Impacto Reputacional + Económico → Impacto Inherente (máximo) ─
// "En el impacto inherente inicialmente se debe indicar el impacto
// reputacional y/o económico". Se toma el MÁXIMO de los dos.
function calcImpactoInherenteAuto(){
  var r = parseFloat(document.getElementById('nr-imp-reput')?.value||0);
  var e = parseFloat(document.getElementById('nr-imp-econ')?.value||0);
  var max = Math.max(r, e);
  var sel = document.getElementById('nr-imp-inh');
  if(!sel || !max) return;
  // Buscar la opción cuyo valor coincide
  var vals = [0.2,0.4,0.6,0.8,1];
  var mejor = vals.reduce(function(a,b){ return Math.abs(b-max)<Math.abs(a-max)?b:a; }, 0.2);
  sel.value = String(mejor);
}

// ── Controles del riesgo (uno o más) ─────────────────────────────
// Cada control tiene descripción, tipo y efectividad (%). La efectividad
// PROMEDIO reduce automáticamente la probabilidad e impacto residual:
// residual = inherente × (1 − efectividad). El usuario puede afinar
// después con los selectores.
window._nrCtrlsBuffer = [];
window.nrCtrlAgregar = function(){
  window._nrCtrlsBuffer.push({
    desc:'',
    tipo:'PREVENTIVO',
    automatizacion:'AUTOMÁTICO',
    documentacion:'DOCUMENTADO',
    frecuencia:'CONTINUA',
    registro:'CON REGISTRO',
    responsable:'',
    efec:0.5
  });
  window.nrCtrlRender();
  window.calcEfectividadAuto();
};
window.nrCtrlQuitar = function(i){
  window._nrCtrlsBuffer.splice(i,1);
  window.nrCtrlRender();
  window.calcEfectividadAuto();
};
window.nrCtrlSet = function(i,k,v){
  var c = window._nrCtrlsBuffer[i]; if(!c) return;
  c[k] = (k==='efec') ? parseFloat(v) : v;
  
  // ⭐ Si cambia tipo o automatización, recalcular Efectividad automáticamente
  if(k === 'tipo' || k === 'automatizacion'){
    window.calcEfectividadControl(i);
  }
  
  // Sincronizar el primer control con los inputs ocultos (compat vista antigua)
  if(i===0){
    var elC=document.getElementById('nr-control'), elT=document.getElementById('nr-tipo-ctrl');
    if(elC) elC.value=window._nrCtrlsBuffer[0].desc||'';
    if(elT) elT.value=window._nrCtrlsBuffer[0].tipo||'';
  }
  if(k==='efec' || k==='tipo' || k==='automatizacion') window.calcEfectividadAuto();
};
window.nrCtrlRender = function(){
  var wrap = document.getElementById('nr-ctrls-lista'); if(!wrap) return;
  var arr = window._nrCtrlsBuffer;
  if(!arr.length){
    wrap.innerHTML = '<div style="text-align:center;padding:12px;font-size:11.5px;color:#64748b;font-style:italic;">Sin controles. Usa <b>+ Agregar control</b> para registrar uno o más.</div>';
    return;
  }
  var esc = function(s){ return String(s||'').replace(/"/g,'&quot;'); };
  wrap.innerHTML = arr.map(function(c,i){
    return '<div style="background:white;border:1px solid #bbf7d0;border-radius:6px;padding:10px;margin-bottom:10px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
      +'<div style="font-size:11px;font-weight:800;color:#166534;">Control #'+(i+1)+'</div>'
      +'<button type="button" onclick="window.nrCtrlQuitar('+i+')" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:12px;font-weight:700;">Quitar ✕</button>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Responsable del Control</label><input value="'+esc(c.responsable)+'" oninput="window.nrCtrlSet('+i+',\'responsable\',this.value)" placeholder="Nombre" style="width:100%;padding:6px 8px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;box-sizing:border-box;"></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Descripción del Control</label><input value="'+esc(c.desc)+'" oninput="window.nrCtrlSet('+i+',\'desc\',this.value)" placeholder="Criterios y acciones" style="width:100%;padding:6px 8px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;box-sizing:border-box;"></div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px;">'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Tipo</label><select onchange="window.nrCtrlSet('+i+',\'tipo\',this.value)" style="width:100%;padding:6px 4px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:white;box-sizing:border-box;">'
        +['PREVENTIVO','DETECTIVO','CORRECTIVO'].map(function(t){return '<option '+(c.tipo===t?'selected':'')+'>'+t+'</option>';}).join('')
      +'</select></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Automatización</label><select onchange="window.nrCtrlSet('+i+',\'automatizacion\',this.value)" style="width:100%;padding:6px 4px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:white;box-sizing:border-box;">'
        +['AUTOMÁTICO','MANUAL'].map(function(t){return '<option '+(c.automatizacion===t?'selected':'')+'>'+t+'</option>';}).join('')
      +'</select></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Documentación</label><select onchange="window.nrCtrlSet('+i+',\'documentacion\',this.value)" style="width:100%;padding:6px 4px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:white;box-sizing:border-box;">'
        +['DOCUMENTADO','SIN DOCUMENTAR'].map(function(t){return '<option '+(c.documentacion===t?'selected':'')+'>'+t+'</option>';}).join('')
      +'</select></div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Frecuencia</label><select onchange="window.nrCtrlSet('+i+',\'frecuencia\',this.value)" style="width:100%;padding:6px 4px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:white;box-sizing:border-box;">'
        +['CONTINUA','ALEATORIA'].map(function(t){return '<option '+(c.frecuencia===t?'selected':'')+'>'+t+'</option>';}).join('')
      +'</select></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Registro</label><select onchange="window.nrCtrlSet('+i+',\'registro\',this.value)" style="width:100%;padding:6px 4px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:white;box-sizing:border-box;">'
        +['CON REGISTRO','SIN REGISTRO'].map(function(t){return '<option '+(c.registro===t?'selected':'')+'>'+t+'</option>';}).join('')
      +'</select></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#166534;">Efectividad (auto)</label><div style="width:100%;padding:6px 8px;border:1px solid #d1fae5;border-radius:4px;font-size:11px;font-family:inherit;background:#f0fdf4;color:#14532d;font-weight:700;text-align:center;">'+Math.round(c.efec*100)+'%</div></div>'
      +'</div></div>';
  }).join('');
};
window.calcEfectividadControl = function(i){
  var c = window._nrCtrlsBuffer[i]; if(!c) return;
  
  // Puntajes según el Excel
  var puntajeTipo = {
    'PREVENTIVO': 0.25,
    'DETECTIVO': 0.15,
    'CORRECTIVO': 0.1
  };
  var puntajeAuto = {
    'AUTOMÁTICO': 0.25,
    'MANUAL': 0.15
  };
  
  // Calcular Efectividad = Tipo + Automatización
  var efec = (puntajeTipo[c.tipo] || 0.1) + (puntajeAuto[c.automatizacion] || 0.25);
  c.efec = Math.min(efec, 1.0); // Máximo 100%
};

// ── Efectividad por control → residual según el Excel:
// - PREVENTIVO/DETECTIVO: reduce PROBABILIDAD (residual = inh × (1 − efec))
// - CORRECTIVO:            reduce IMPACTO      (residual = inh × (1 − efec))
// Se toma el MÍNIMO de todos los residuales (el mejor control gana).
window.calcEfectividadAuto = function(){
  var arr = window._nrCtrlsBuffer||[];
  
  // ⭐ RECALCULAR EFECTIVIDAD DE CADA CONTROL
  arr.forEach(function(c, idx){
    window.calcEfectividadControl(idx);
  });
  
  var pInh = parseFloat(document.getElementById('nr-prob-inh')?.value||0);
  var iInh = parseFloat(document.getElementById('nr-imp-inh')?.value||0);
  // Efectividad promedio (informativa): promedio simple de todos los efec
  var prom = arr.length ? arr.reduce(function(a,c){return a+(c.efec||0);},0)/arr.length : 0;
  var elE = document.getElementById('nr-efec-prom');
  if(elE){ elE.textContent = arr.length ? Math.round(prom*100)+' %' : '— %';
    elE.style.background = prom>=0.7?'#dcfce7':prom>=0.4?'#fef3c7':'#F3F4F6';
    elE.style.color = prom>=0.7?'#166534':prom>=0.4?'#92400e':'var(--muted)'; }
  // Calcular residual por CADA control y tomar el mínimo
  var probRes = pInh, impRes = iInh;
  if(arr.length && pInh){
    var pReduces = arr.filter(function(c){ return c.tipo==='PREVENTIVO' || c.tipo==='DETECTIVO'; });
    if(pReduces.length){
      probRes = Math.min.apply(null, pReduces.map(function(c){ return pInh*(1-(c.efec||0)); }));
    }
  }
  if(arr.length && iInh){
    var iReduces = arr.filter(function(c){ return c.tipo==='CORRECTIVO'; });
    if(iReduces.length){
      impRes = Math.min.apply(null, iReduces.map(function(c){ return iInh*(1-(c.efec||0)); }));
    }
  }
  var vals = [0.2,0.4,0.6,0.8,1];
  function nearest(v){ return v<=0.05 ? 0.2 : vals.reduce(function(a,b){return Math.abs(b-v)<Math.abs(a-v)?b:a;},0.2); }
  if(pInh){ var sp=document.getElementById('nr-prob-res'); if(sp) sp.value=String(nearest(probRes)); }
  if(iInh){ var si=document.getElementById('nr-imp-res');  if(si) si.value=String(nearest(impRes)); }
  calcZonaMatriz();
  
  // ⭐ RE-RENDERIZAR CONTROLES PARA MOSTRAR EFECTIVIDAD ACTUALIZADA
  window.nrCtrlRender && window.nrCtrlRender();
};

// ─── ABRIR / GUARDAR RIESGO ───────────────────────────────────
function abrirNuevoRiesgo(){
  document.getElementById('nr-id').value = '';
  document.getElementById('m-riesgo-title').textContent = '＋ Nuevo Riesgo';
  ['nr-ref','nr-tercero','nr-tipo','nr-factor','nr-clasificacion','nr-desc','nr-causa',
   'nr-vulnerabilidad','nr-control','nr-tipo-ctrl','nr-prob-inh','nr-imp-inh',
   'nr-prob-res','nr-imp-res','nr-tratamiento','nr-plan','nr-resp',
   'nr-fecha-impl','nr-fecha-seg','nr-estado',
   'nr-contrato','nr-frecuencia','nr-imp-reput','nr-imp-econ'].forEach(id=>{
    const el = document.getElementById(id);
    if(el){
      if(id === 'nr-prob-inh' || id === 'nr-imp-inh' || id === 'nr-prob-res' || id === 'nr-imp-res'){
        // Estos son divs, actualizar textContent
        el.textContent = '—';
      } else if(el.tagName==='DIV'){
        el.textContent = '';
      } else {
        el.value = '';
      }
    }
  });
  // Limpiar inputs ocultos también
  var inp = document.getElementById('nr-prob-inh-val'); if(inp) inp.value='';
  inp = document.getElementById('nr-imp-inh-val'); if(inp) inp.value='';
  
  // Resetear la lista de controles del riesgo (arranca vacía)
  window._nrCtrlsBuffer = [];
  try{ window.nrCtrlRender(); }catch(e){}
  try{ window.calcEfectividadAuto(); }catch(e){}
  calcZonaMatriz();
  actualizarTercerosFiltro();
  // Reiniciar buffer de controles con uno vacío
  window._nrCtrlsBuffer = [{desc:'',tipo:'PREVENTIVO',efec:0.5}];
  window.nrCtrlRender && window.nrCtrlRender();
  window.calcEfectividadAuto && window.calcEfectividadAuto();
  openM('m-nuevo-riesgo');
}

function editarRiesgo(id){
  const r = MATRIZ_DB.find(x=>x.id===id);
  if(!r) return;
  document.getElementById('nr-id').value = id;
  document.getElementById('m-riesgo-title').textContent = '✏️ Editar Riesgo ' + id;
  const set = (elId, val) => { 
    const el=document.getElementById(elId); 
    if(!el) return;
    if(elId === 'nr-prob-inh'){
      // Especial: es un div, no un input
      var mapProb = {'1.0':'Muy Alta','0.95':'Muy Alta','0.9':'Alta','0.85':'Alta','0.80':'Alta','0.75':'Media','0.70':'Media','0.65':'Media','0.60':'Media','0.55':'Baja','0.50':'Baja','0.45':'Baja','0.40':'Baja','0.30':'Muy Baja','0.20':'Muy Baja'};
      el.textContent = mapProb[String(val)] || (val ? val : '—');
      var inp = document.getElementById('nr-prob-inh-val');
      if(inp) inp.value = val||'';
    } else if(elId === 'nr-imp-inh'){
      // Especial: es un div, no un input
      var mapImp = {'1.0':'Catastrófico','0.8':'Mayor','0.6':'Moderado','0.4':'Menor','0.2':'Leve'};
      el.textContent = mapImp[String(val)] || (val ? val : '—');
      var inp = document.getElementById('nr-imp-inh-val');
      if(inp) inp.value = val||'';
    } else {
      el.value=val||'';
    }
  };
  set('nr-ref', r.id); set('nr-tercero',r.tercero); set('nr-tipo',r.tipo);
  set('nr-factor',r.factor); set('nr-clasificacion',r.clasif);
  set('nr-desc',r.desc); set('nr-causa',r.causa); set('nr-vulnerabilidad',r.vuln);
  set('nr-control',r.control); set('nr-tipo-ctrl',r.tipoCtrl);
  // Recuperar múltiples controles + frecuencia + impactos separados
  window._nrCtrlsBuffer = (r.controles||[]).map(function(c){
    return{
      desc:c.desc||'',
      tipo:c.tipo||'PREVENTIVO',
      automatizacion:c.automatizacion||'AUTOMÁTICO',
      documentacion:c.documentacion||'DOCUMENTADO',
      frecuencia:c.frecuencia||'CONTINUA',
      registro:c.registro||'CON REGISTRO',
      responsable:c.responsable||'',
      efec:c.efec||0.5
    };
  });
  if(!window._nrCtrlsBuffer.length && r.control){
    window._nrCtrlsBuffer.push({desc:r.control||'',tipo:r.tipoCtrl||'PREVENTIVO',efec:0.5});
  }
  try{ window.nrCtrlRender(); }catch(e){}
  set('nr-frecuencia', r.frecuencia||'');
  set('nr-imp-reput', r.impReput||'');
  set('nr-imp-econ', r.impEcon||'');
  try{ window.calcEfectividadAuto(); }catch(e){}
  set('nr-prob-inh',r.probInh); set('nr-imp-inh',r.impInh);
  set('nr-prob-res',r.probRes); set('nr-imp-res',r.impRes);
  set('nr-tratamiento',r.tratamiento); set('nr-plan',r.plan);
  set('nr-resp',r.resp); set('nr-fecha-impl',r.fechaImpl);
  // Recalcular valores automáticos
  try{ calcProbInherenteAuto(); }catch(e){}
  try{ calcImpactoInherenteAuto(); }catch(e){}
  try{ calcZonaMatriz(); }catch(e){}
  set('nr-fecha-seg',r.fechaSeg); set('nr-estado',r.estado);
  calcZonaMatriz();
  actualizarTercerosFiltro();
  // Reconstruir buffer de controles: si el riesgo tiene 'controles' (array), usarlo; si no, del primer control
  window._nrCtrlsBuffer = (r.controles && r.controles.length)
    ? r.controles.map(function(c){
        return {
          desc:c.desc||'',
          tipo:c.tipo||'PREVENTIVO',
          automatizacion:c.automatizacion||'AUTOMÁTICO',
          documentacion:c.documentacion||'DOCUMENTADO',
          frecuencia:c.frecuencia||'CONTINUA',
          registro:c.registro||'CON REGISTRO',
          responsable:c.responsable||'',
          efec:parseFloat(c.efec)||0.5
        };
      })
    : (r.control ? [{desc:r.control, tipo:r.tipoCtrl||'PREVENTIVO', automatizacion:'AUTOMÁTICO', documentacion:'DOCUMENTADO', frecuencia:'CONTINUA', registro:'CON REGISTRO', responsable:'', efec:0.5}] : [{desc:'',tipo:'PREVENTIVO',automatizacion:'AUTOMÁTICO',documentacion:'DOCUMENTADO',frecuencia:'CONTINUA',registro:'CON REGISTRO',responsable:'',efec:0.5}]);
  window.nrCtrlRender && window.nrCtrlRender();
  window.calcEfectividadAuto && window.calcEfectividadAuto();
  openM('m-nuevo-riesgo');
}

function guardarRiesgo(){
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const ref = get('nr-ref') || (function(){
    // Auto-generar R1, R2, R3... buscando el siguiente número libre
    var usados = (window.MATRIZ_DB||[]).map(function(x){
      var m=/^R(\d+)$/.exec(x.id||''); return m?parseInt(m[1]):0;
    });
    var max = usados.length ? Math.max.apply(null, usados) : 0;
    return 'R'+(max+1);
  })();
  const desc = get('nr-desc');
  const tercero = get('nr-tercero');
  if(!ref){ showToast('La referencia es obligatoria','error',2500); return; }
  if(!desc){ showToast('La descripción es obligatoria','error',2500); return; }

  const editId = document.getElementById('nr-id')?.value;
  const zonaInh = zonaFromProb(get('nr-prob-inh'), get('nr-imp-inh'));
  const zonaRes = zonaFromProb(get('nr-prob-res'), get('nr-imp-res'));

  const _tEntidad = Object.values(TERCEROS_DB||{}).find(x=>x.nombre===tercero);
  const riesgoEntidad = _tEntidad?.entidad || '';
  const riesgo = {
    id: ref, tercero, entidad: riesgoEntidad, tipo: get('nr-tipo'), factor: get('nr-factor'),
    contrato: get('nr-contrato'),
    clasif: get('nr-clasificacion'), desc, causa: get('nr-causa'), vuln: get('nr-vulnerabilidad'),
    frecuencia: get('nr-frecuencia'),
    impReput: get('nr-imp-reput'), impEcon: get('nr-imp-econ'),
    probInh: get('nr-prob-inh'), impInh: get('nr-imp-inh'), zonaInh,
    // Múltiples controles con todos los atributos
    controles: (window._nrCtrlsBuffer||[]).map(function(c){
      return{desc:c.desc,tipo:c.tipo,automatizacion:c.automatizacion,documentacion:c.documentacion,frecuencia:c.frecuencia,registro:c.registro,responsable:c.responsable,efec:c.efec};
    }),
    control: get('nr-control'), tipoCtrl: get('nr-tipo-ctrl'),
    // Cálculo por Excel: frecuencia → probabilidad, y impacto = máx(reput, econ)
    probRes: get('nr-prob-res'), impRes: get('nr-imp-res'), zonaRes,
    tratamiento: get('nr-tratamiento'), plan: get('nr-plan'),
    resp: get('nr-resp'), fechaImpl: get('nr-fecha-impl'),
    fechaSeg: get('nr-fecha-seg'), descSeg: '', estado: get('nr-estado') || 'Pendiente',
  };

  if(editId){
    const idx = MATRIZ_DB.findIndex(x=>x.id===editId);
    if(idx>=0){ riesgo.descSeg = MATRIZ_DB[idx].descSeg || ''; MATRIZ_DB[idx] = riesgo; }
    else MATRIZ_DB.push(riesgo);
  } else {
    // Check duplicate ref
    if(MATRIZ_DB.find(x=>x.id===ref)){
      showToast('Ya existe un riesgo con referencia "'+ref+'"','error',2500); return;
    }
    MATRIZ_DB.push(riesgo);
  }

  // Save temp evidencias to this riesgo
  _saveEvRiesgoOnGuardar(ref);
  closeM('m-nuevo-riesgo');
  renderMatriz();
  addLog(ref,'Matriz_Riesgos', editId?'Edición':'Nuevo','—',
    zonaInh+' → '+zonaRes,
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Matriz');
  showToast((editId?'Riesgo actualizado':'Riesgo creado')+': '+ref+' · '+zonaInh,'success',3000);
}

function eliminarRiesgo(id){
  const r = MATRIZ_DB.find(x=>x.id===id);
  showConfirmToast('¿Eliminar riesgo '+id+'?', (r?.desc||'').slice(0,60)+'...', ()=>{
    MATRIZ_DB = MATRIZ_DB.filter(x=>x.id!==id);
    renderMatriz();
    showToast('Riesgo '+id+' eliminado','info',2000);
  });
}

// ─── SEGUIMIENTO ─────────────────────────────────────────────
// ── Filtro de contrato en Seguimiento (se puebla según el tercero elegido) ──
window.segActualizarFiltroContrato = function(){
  var selT = document.getElementById('seg-fil-tercero');
  var selC = document.getElementById('seg-fil-contrato');
  if(!selT || !selC) return;
  var nombreT = selT.value||'';
  var prevVal = selC.value;
  selC.innerHTML = '<option value="">Todos los contratos</option>';
  if(!nombreT){ return; }
  // Buscar contratos únicos que tenga el tercero en la MATRIZ_DB
  var contratos = [...new Set((window.MATRIZ_DB||[])
    .filter(function(r){return r.tercero===nombreT && r.contrato;})
    .map(function(r){return r.contrato;}))].sort();
  contratos.forEach(function(c){
    var o = document.createElement('option'); o.value=c; o.textContent=c;
    selC.appendChild(o);
  });
  // Restaurar si sigue siendo válido
  if(contratos.indexOf(prevVal)>=0) selC.value = prevVal;
};

function renderSeguimiento(){
  const tbody = document.getElementById('tbody-seguimiento');
  if(!tbody) return;

  // Migrar IDs viejos (EJ_*, R_NIT_key_ts_idx) a R1, R2, R3... como el Excel.
  // Se hace de forma idempotente: si YA es R<N>, no se toca.
  try{
    (MATRIZ_DB||[]).forEach(function(r,idx){
      if(r && r.id && !/^R\d+$/.test(r.id)){ r.id = 'R'+(idx+1); }
    });
    window._lsSave && window._lsSave();
  }catch(e){}

  const filEstado   = (document.getElementById('seg-fil-estado')  ||{}).value || '';
  const filTercero  = (document.getElementById('seg-fil-tercero') ||{}).value || '';
  const filContrato = (document.getElementById('seg-fil-contrato')||{}).value || '';

  // Poblar el selector de terceros con TODOS los que hay en la matriz
  // (repopular si aparecen nuevos, para no perderlos)
  const selTerc = document.getElementById('seg-fil-tercero');
  if(selTerc){
    const nombres = [...new Set(MATRIZ_DB.map(r=>r.tercero).filter(Boolean))].sort();
    const prevVal = selTerc.value;
    const currentOpts = new Set([...selTerc.options].map(o=>o.value));
    let need = false;
    nombres.forEach(n=>{ if(!currentOpts.has(n)) need = true; });
    if(need){
      selTerc.innerHTML = '<option value="">Todos los terceros</option>' +
        nombres.map(n=>'<option value="'+n.replace(/"/g,'&quot;')+'">'+n+'</option>').join('');
      if(prevVal && nombres.indexOf(prevVal)>=0) selTerc.value = prevVal;
    }
  }

  const data = MATRIZ_DB.filter(r =>
    (!filTercero  || r.tercero===filTercero) &&
    (!filContrato || (r.contrato||'')===filContrato) &&
    r.plan &&
    (!filEstado  || r.estado===filEstado)
  );

  // ── KPIs ─────────────────────────────────────────────────────
  const kpis = { total:0, critico:0, pend:0, prog:0, comp:0 };
  MATRIZ_DB.forEach(r=>{
    kpis.total++;
    const z=(r.zonaRes||r.zonaInh||'').toUpperCase();
    if(z==='EXTREMO'||z==='ALTO') kpis.critico++;
    if(r.estado==='Pendiente')                         kpis.pend++;
    else if(r.estado==='En Progreso')                  kpis.prog++;
    else if(r.estado==='Completado'||r.estado==='Cerrado') kpis.comp++;
  });
  const sk=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  sk('seg-k-total',kpis.total); sk('seg-k-critico',kpis.critico);
  sk('seg-k-pend',kpis.pend);  sk('seg-k-prog',kpis.prog);  sk('seg-k-comp',kpis.comp);
  sk('seg-detalle-pend',kpis.pend); sk('seg-detalle-prog',kpis.prog); sk('seg-detalle-comp',kpis.comp);

  // Barra de progreso
  const pct = kpis.total ? Math.round(kpis.comp/kpis.total*100) : 0;
  const barEl = document.getElementById('seg-pct-bar');
  const lblEl = document.getElementById('seg-pct-lbl');
  if(barEl) barEl.style.width = pct+'%';
  if(lblEl){ lblEl.textContent = pct+'% completado'; lblEl.style.color = pct>=80?'var(--green)':pct>=50?'var(--blue)':'var(--orange)'; }

  const FECHA_LABEL = d => {
    if(!d) return '—';
    const parts = d.split('-');
    return parts.length<3 ? d : parts[2]+'/'+parts[1]+'/'+parts[0];
  };

  // Colores de zona
  const zonaStyle = z => {
    z = (z||'').toUpperCase();
    if(z==='EXTREMO') return 'background:#FEF2F2;color:#DC2626;';
    if(z==='ALTO')    return 'background:#FFF7ED;color:#EA580C;';
    if(z==='MODERADO')return 'background:#FFFBEB;color:#B45309;';
    if(z==='BAJO')    return 'background:#F0FDF4;color:#16A34A;';
    return 'background:#f3f4f6;color:#6B7280;';
  };

  if(!data.length){
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--muted);">
      <div style="font-size:24px;margin-bottom:8px;">📋</div>
      ${filEstado||filTercero ? 'Sin riesgos con plan para ese filtro. <a href="#" onclick="document.getElementById(\'seg-fil-estado\').value=\'\';document.getElementById(\'seg-fil-tercero\').value=\'\';renderSeguimiento();return false;">Ver todos →</a>' : 'No hay riesgos con plan de acción definido aún. Regístralos desde Análisis de Riesgos.'}
    </td></tr>`;
  } else {
    tbody.innerHTML = data.map((r,idx)=>{
      const estChip = ESTADO_CHIP[r.estado]||'c-pend';
      const zona = r.zonaRes||r.zonaInh||'';
      const descSeg = r.descSeg
        ? `<span style="font-size:10.5px;">${r.descSeg.slice(0,80)}${r.descSeg.length>80?'…':''}</span>`
        : `<span style="color:var(--muted);font-size:10.5px;font-style:italic;">Sin registrar</span>`;
      return `<tr style="${idx%2===0?'':'background:#FAFAFA'}border-bottom:1px solid #f0f0f0;">
        <td style="padding:8px 10px;white-space:nowrap;min-width:90px;">
          <div style="font-family:'Montserrat',sans-serif;font-size:12.5px;font-weight:800;color:var(--navy);">${r.id}</div>
          <div style="font-size:9.5px;color:#6B7280;margin-top:1px;max-width:110px;white-space:normal;">${r.tercero||'—'}</div>
        </td>
        <td style="padding:8px 8px;font-size:10px;"><span style="padding:2px 6px;border-radius:10px;background:#E8F0F8;color:var(--navy);font-weight:700;">${(r.tipo||'').split(' ')[0]}</span></td>
        <td style="padding:8px 10px;font-size:11px;max-width:200px;">${r.plan||'—'}</td>
        <td style="padding:8px 8px;font-size:11px;white-space:nowrap;">${r.resp||'—'}</td>
        <td style="padding:8px 8px;text-align:center;">
          <span style="padding:2px 7px;border-radius:8px;font-size:9.5px;font-weight:700;${zonaStyle(zona)}">${zona||'—'}</span>
        </td>
        <td style="padding:8px 8px;font-size:11px;text-align:center;white-space:nowrap;">${FECHA_LABEL(r.fechaImpl)}</td>
        <td style="padding:8px 8px;font-size:11px;text-align:center;white-space:nowrap;">${FECHA_LABEL(r.fechaSeg)}</td>
        <td style="padding:8px 10px;max-width:200px;">${descSeg}</td>
        <td style="padding:8px 8px;text-align:center;"><span class="chip ${estChip}" style="font-size:10px;">${r.estado}</span></td>
        <td style="padding:8px 6px;text-align:center;">
          <button onclick="abrirEditSeguimiento('${r.id}')" style="padding:4px 10px;background:#EFF6FF;color:#1D4ED8;border:1px solid #93C5FD;border-radius:5px;font-size:10.5px;cursor:pointer;font-weight:700;">✏️ Editar</button>
        </td>
      </tr>`;
    }).join('');
  }

  // Alertas y vencimientos
  renderAlertas();
  renderVencimientos();
}

function renderAlertas(){
  const el = document.getElementById('seg-alertas');
  if(!el) return;
  const hoy = new Date();
  const alertas = [];
  MATRIZ_DB.forEach(r=>{
    if(r.estado==='Completado'||r.estado==='Cerrado') return;
    const diasImpl = r.fechaImpl ? Math.ceil((new Date(r.fechaImpl)-hoy)/86400000) : null;
    const diasSeg  = r.fechaSeg  ? Math.ceil((new Date(r.fechaSeg)-hoy)/86400000)  : null;
    if(r.zonaInh==='EXTREMO'||r.zonaRes==='EXTREMO'){
      alertas.push({clase:'al-r',ico:'🔴',msg:`<b>${r.id} — ${r.tercero}</b> · Zona EXTREMO · ${r.plan||''}`});
    } else if(diasImpl!==null && diasImpl<=15 && diasImpl>0){
      alertas.push({clase:'al-r',ico:'🔴',msg:`<b>${r.id}</b> · Implementación en ${diasImpl} días · ${r.tercero}`});
    } else if(diasSeg!==null && diasSeg<=30 && diasSeg>0){
      alertas.push({clase:'al-y',ico:'🟡',msg:`<b>${r.id}</b> · Seguimiento en ${diasSeg} días · ${r.tercero}`});
    }
  });
  if(!alertas.length){
    el.innerHTML = '<div style="color:var(--green);font-size:12px;font-style:italic;">✅ Sin alertas críticas activas</div>';
  } else {
    el.innerHTML = alertas.slice(0,6).map(a=>
      `<div class="alert ${a.clase}" style="font-size:12px;">${a.ico} ${a.msg}</div>`
    ).join('');
  }
}

function renderVencimientos(){
  const tbody = document.getElementById('tbody-vencimientos');
  if(!tbody) return;
  const hoy = new Date();
  const venc = [];
  MATRIZ_DB.forEach(r=>{
    if(r.estado==='Completado'||r.estado==='Cerrado') return;
    const dias = r.fechaSeg ? Math.ceil((new Date(r.fechaSeg)-hoy)/86400000) : null;
    if(dias!==null && dias>0 && dias<=120) venc.push({r, dias});
  });
  venc.sort((a,b)=>a.dias-b.dias);
  tbody.innerHTML = venc.slice(0,8).map(({r,dias})=>{
    const col = dias<=15?'var(--red)':dias<=30?'var(--orange)':dias<=60?'var(--yellow)':'var(--green)';
    return `<tr>
      <td style="padding:5px 8px;font-size:11px;">${r.tercero.split(' ')[0]} / <b>${r.id}</b></td>
      <td style="padding:5px 8px;font-size:11px;">${r.plan||'Seguimiento'}</td>
      <td style="padding:5px 8px;text-align:center;font-weight:700;font-size:11px;color:${col};">${dias}d</td>
    </tr>`;
  }).join('') || '<tr><td colspan="3" style="color:var(--muted);font-style:italic;padding:8px;font-size:12px;">Sin vencimientos próximos</td></tr>';
}

// ─── EDITAR SEGUIMIENTO INLINE ────────────────────────────────
function abrirEditSeguimiento(id){
  const r = MATRIZ_DB.find(x=>x.id===id);
  if(!r) return;
  document.getElementById('seg-edit-id').value = id;
  document.getElementById('seg-edit-desc').value = r.descSeg||'';
  document.getElementById('seg-edit-estado').value = r.estado||'Pendiente';
  document.getElementById('seg-edit-fecha').value = r.fechaSeg||'';
  openM('m-edit-seguimiento');
}

function guardarSeguimiento(){
  const id    = document.getElementById('seg-edit-id').value;
  const desc  = document.getElementById('seg-edit-desc').value.trim();
  const estado= document.getElementById('seg-edit-estado').value;
  const fecha = document.getElementById('seg-edit-fecha').value;
  const r = MATRIZ_DB.find(x=>x.id===id);
  if(!r){ closeM('m-edit-seguimiento'); return; }
  r.descSeg = desc;
  r.estado  = estado;
  if(fecha) r.fechaSeg = fecha;
  closeM('m-edit-seguimiento');
  renderSeguimiento();
  renderMatriz();
  addLog(id,'Seguimiento','Actualización','—',estado+' — '+desc.slice(0,50),
    new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Seguimiento');
  // Persistir en localStorage — antes el cambio solo vivía en memoria y se
  // perdía al recargar o volver a entrar.
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{
    sendNotification('seguimiento',
      'Seguimiento actualizado: '+id,
      (r.tercero?r.tercero+' — ':'')+estado+(desc?' — '+desc.slice(0,60):''),
      {'Riesgo': id, 'Tercero': r.tercero||'—', 'Estado': estado}
    );
  }catch(e){}
  showToast('✅ Seguimiento de '+id+' actualizado → '+estado,'success',2500);
}

// ─── EXPORTAR CSV MATRIZ ──────────────────────────────────────
function exportarMatrizCSV(){
  const cols = ['Ref','Tercero','Tipo Riesgo','Factor','Descripción','Causa','Vulnerabilidad',
    'Prob.Inh.','Imp.Inh.','Zona Inh.','Control','Tipo Ctrl','Prob.Res.','Imp.Res.','Zona Res.',
    'Tratamiento','Plan Acción','Responsable','F.Impl.','F.Seg.','Estado'];
  const rows = MATRIZ_DB.map(r=>[
    r.id,r.tercero,r.tipo,r.factor||'',r.desc,r.causa||'',r.vuln||'',
    r.probInh,r.impInh,r.zonaInh,r.control||'',r.tipoCtrl||'',
    r.probRes||'',r.impRes||'',r.zonaRes||'',
    r.tratamiento||'',r.plan||'',r.resp||'',r.fechaImpl||'',r.fechaSeg||'',r.estado
  ]);
  const csv = [cols,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Matriz_Riesgos_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV exportado','success',2000);
}

function exportarSeguimientoCSV(){
  const cols = ['Ref','Tipo','Plan de Acción','Responsable','F.Impl.','F.Seg.','Seguimiento','Estado'];
  const rows = MATRIZ_DB.filter(r=>r.plan).map(r=>[
    r.id,r.tipo.split(' ')[0],r.plan||'',r.resp||'',r.fechaImpl||'',r.fechaSeg||'',r.descSeg||'',r.estado
  ]);
  const csv = [cols,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Seguimiento_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('CSV exportado','success',2000);
}


// ─── INFORMACIÓN GENERAL ─────────────────────────────────────────────
var _igLoaded = { procesos:false, funcionarios:false, controles:false, terceros:false };

function _igCurrentEntity(){
  // Entidad del usuario logueado (window.currentUser es la fuente efectiva del login)
  var cu=window.currentUser||((typeof currentUser!=='undefined')?currentUser:null);
  var ent = cu && cu.entidad ? cu.entidad : '';
  if(!ent){ var sel=document.getElementById('cf-entidad'); if(sel) ent=sel.value||''; }
  return (ent||'').toLowerCase().replace(/\s+/g,'');
}
function _igMatchesEntity(t, entity){
  if(!entity) return true;
  var te=String((t&& (t.entidad||t.entidadLabel||t.NombreEntidad))||'').toLowerCase().replace(/\s+/g,'');
  return !te || te===entity || te.includes(entity) || entity.includes(te);
}

window.switchIGTab = function switchIGTab(tab){
  var panels={procesos:'ig-panel-procesos',funcionarios:'ig-panel-funcionarios',controles:'ig-panel-controles',terceros:'ig-panel-terceros'};
  var tabs={procesos:'ig-tab-procesos',funcionarios:'ig-tab-funcionarios',controles:'ig-tab-controles',terceros:'ig-tab-terceros'};
  Object.keys(panels).forEach(function(k){
    var p=document.getElementById(panels[k]),t=document.getElementById(tabs[k]);
    if(!p||!t)return;
    if(k===tab){p.style.display='';t.classList.add('active');}else{p.style.display='none';t.classList.remove('active');}
  });
  if(tab==='procesos')      loadIGProcesos();
  if(tab==='funcionarios')  loadIGFuncionarios();
  if(tab==='terceros')      loadIGTercerosFull();
  if(tab==='controles')     loadIGContratosFull();
}

// ── Procesos desde API ──────────────────────────────────────────
window.loadIGProcesos = function loadIGProcesos(){
  var wrap = document.getElementById('ig-tbody-procesos');
  if(!wrap) return;
  // ── LOCAL PRIMERO: los datos del Registro de Terceros (Paso 1) viven en
  //    TERCEROS_DB; la API solo enriquece si responde con datos. Antes la
  //    pestaña quedaba "Sin datos" cuando la API respondía vacía. ──
  var db = window.TERCEROS_DB || {};
  var rows = [];
  var igEntity = _igCurrentEntity();
  Object.values(db).filter(function(t){return _igMatchesEntity(t,igEntity);}).forEach(function(t){
    if(!t || !t.nit) return;
    var proc = t.procesoSupervision || t.procesosSoporta || t.servicio || '';
    if(!proc) return;
    var dimOp = (t.dims||[]).find(function(d){ return String(d.key||'').toLowerCase()==='op'; });
    var nivel = dimOp ? String(dimOp.val||'') : '';
    rows.push({ nit:t.nit, nombre:t.nombre||'—', proc:proc, servicio:t.servicio||'—', nivel:nivel, prom:parseFloat(t.prom||0) });
  });
  // Procesos pre-registrados en el mini-formulario del Paso 1 (lupas)
  (window._procesosList||[]).forEach(function(p){
    rows.push({ nit:'—', nombre:'(Pre-registro)', proc:(p.nombre||'')+(p.desc?' — '+p.desc:''), servicio:'—', nivel:'', prom:0 });
  });
  if(rows.length){
    wrap.innerHTML = rows.map(function(r){
      var chip = r.nivel==='5'||r.prom>=4 ? 'c-crit' : r.nivel==='4'||r.nivel==='3'||r.prom>=3 ? 'c-alto' : 'c-bajo';
      var nivelTxt = r.nivel ? 'Nivel '+r.nivel : (r.prom>0 ? r.prom.toFixed(1) : '—');
      return '<tr>'
        +'<td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+r.nit+'</td>'
        +'<td style="font-size:12.5px;font-weight:700;">'+r.nombre+'</td>'
        +'<td style="font-size:11.5px;">'+r.proc+'</td>'
        +'<td style="font-size:11.5px;">'+r.servicio+'</td>'
        +'<td>'+(nivelTxt!=='—'?'<span class="chip '+chip+'" style="font-size:10px;">'+nivelTxt+'</span>':'—')+'</td>'
        +'</tr>';
    }).join('');
  } else {
    wrap.innerHTML='<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">Sin datos. Registra terceros en <b>Clasificación de Terceros</b> (Paso 1).</td></tr>';
  }
  // Enriquecer con la API en segundo plano (solo si responde con datos)
  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/terceros').then(function(r){return r.json();}).then(function(d){
    if(!d.ok||!d.data||!d.data.length) return; // conservar lo local
    var entidad = _igCurrentEntity();
    var extra = d.data.filter(function(t){
      if(!entidad) return true;
      var ent=(t.NombreEntidad||'').toLowerCase().replace(/\s+/g,'');
      return !ent||ent.includes(entidad)||entidad.includes(ent);
    }).filter(function(t){
      var nit=(t.NIT||''); return nit && !db[nit]; // solo los que no están ya en local
    });
    if(!extra.length) return;
    var html2 = extra.map(function(t){
      var proc = t.ProcesosOperativo || t.ServicioContratado || '—';
      var nivel = t.ProcesosOperativo ? String(t.ProcesosOperativo) : '';
      var chip = nivel==='5'?'c-crit':nivel==='4'||nivel==='3'?'c-alto':'c-bajo';
      return '<tr><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+(t.NIT||'—')+'</td>'
        +'<td style="font-size:12.5px;font-weight:700;">'+(t.NombreTercero||'—')+'</td>'
        +'<td style="font-size:11.5px;">'+proc+'</td>'
        +'<td style="font-size:11.5px;">'+(t.ServicioContratado||'—')+'</td>'
        +(nivel?'<td><span class="chip '+chip+'" style="font-size:10px;">Nivel '+nivel+'</span></td>':'<td>—</td>')+'</tr>';
    }).join('');
    if(rows.length) wrap.innerHTML += html2; else wrap.innerHTML = html2;
  }).catch(function(){ /* sin API: lo local ya está pintado */ });
}

window.loadIGFuncionarios = function loadIGFuncionarios(){
  var wrap = document.getElementById('ig-tbody-funcionarios');
  if(!wrap) return;
  // ── LOCAL PRIMERO: supervisores del Registro de Terceros + pre-registros
  //    del mini-formulario (lupas). La API solo enriquece si trae datos. ──
  var db = window.TERCEROS_DB || {};
  var igEntity = _igCurrentEntity();
  var sups = []; var seen = {};
  (window._supervisoresList||[]).forEach(function(f){
    var k=(f.nombre||'').toLowerCase(); if(!k||seen[k]) return; seen[k]=true;
    sups.push({ nombre:f.nombre, ctx:(f.cargo||'Pre-registro'), correo:f.correo||'—' });
  });
  Object.values(db).filter(function(t){return _igMatchesEntity(t,igEntity);}).forEach(function(t){
    if(!t) return;
    [ {n:t.supervisor, c:t.cargo||''}, {n:t.supervisor2, c:'Supervisor alterno'} ].forEach(function(x){
      var k=(x.n||'').toLowerCase(); if(!k||seen[k]) return; seen[k]=true;
      sups.push({ nombre:x.n, ctx:(x.c? x.c+' · ':'')+(t.nombre||''), correo:'—' });
    });
    (t.supervisores||[]).forEach(function(sv){
      var k=(sv||'').toLowerCase(); if(!k||seen[k]) return; seen[k]=true;
      sups.push({ nombre:sv, ctx:t.nombre||'', correo:'—' });
    });
  });
  if(sups.length){
    wrap.innerHTML = sups.map(function(f){
      return '<tr><td style="font-size:12.5px;font-weight:700;">'+f.nombre+'</td>'
        +'<td style="font-size:11.5px;">'+f.ctx+'</td>'
        +'<td style="font-size:11.5px;">'+f.correo+'</td></tr>';
    }).join('');
  } else {
    wrap.innerHTML='<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">Sin supervisores. Regístralos en <b>Clasificación de Terceros</b> (Paso 1).</td></tr>';
  }
  // Enriquecer con la API en segundo plano (solo si responde con datos)
  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/funcionarios').then(function(r){return r.json();}).then(function(d){
    if(!d.ok||!d.data||!d.data.length) return;
    var extra = d.data.filter(function(f){ var k=(f.Nombre||'').toLowerCase(); return k && !seen[k]; });
    if(!extra.length) return;
    wrap.innerHTML += extra.map(function(f){
      return '<tr><td style="font-size:12.5px;font-weight:700;">'+(f.Nombre||'—')+'</td><td style="font-size:11.5px;">'+(f.Direccion||'—')+'</td><td style="font-size:11.5px;">'+(f.Correo||'—')+'</td></tr>';
    }).join('');
  }).catch(function(){ /* sin API: lo local ya está pintado */ });
}

window.loadIGTercerosFull = function loadIGTercerosFull(){
  var tbody = document.getElementById('ig-tbody-terceros');
  if(!tbody) return;
  // Cargar del localStorage primero (persistencia cross-session)
  try{
    var _saved=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');
    if(_saved.TERCEROS_DB) window.TERCEROS_DB=Object.assign(window.TERCEROS_DB||{},_saved.TERCEROS_DB);
  }catch(e){}
  // Mostrar datos locales inmediatamente
  var db = window.TERCEROS_DB || (typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{});
  var igEntity = _igCurrentEntity();
  var localEntries = Object.values(db).filter(function(t){return t&&t.nit&&_igMatchesEntity(t,igEntity);});
  if(localEntries.length){
    tbody.innerHTML = localEntries.map(function(t){
      var p=parseFloat(t.prom||0); var cc=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
      var ent=t.entidadLabel||t.entidad||'—';
      var actions='<button class="btn btn-outline btn-xs" onclick="verDetalleTercero(\''+(t.nit||'')+'\')">👁 Ver detalle</button>'
        +' <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+(t.nit||'')+'\');},120)">📁 Documentos</button>';
      return '<tr><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+(t.nit||'—')+'</td>'
        +'<td style="font-size:12.5px;font-weight:700;">'+(t.nombre||'—')+'</td>'
        +'<td style="font-size:11px;">'+ent+'</td>'
        +'<td style="font-size:11px;">'+(t.finicio||'—')+'</td>'
        +'<td style="font-size:11px;">'+(t.fterm||'—')+'</td>'
        +'<td><span class="chip '+cc+'" style="font-size:10px;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td>'
        +'<td><span class="chip '+cc+'" style="font-size:10px;">'+(t.zona||'—')+'</span></td>'
        +'<td style="white-space:nowrap;">'+actions+'</td></tr>';
    }).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted);font-size:12px;">📋 No hay terceros registrados aún. Guarda un tercero en <b>Clasificación de Terceros</b>.</td></tr>';
  }
  // Intentar enriquecer con API en segundo plano
  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  var entidad = _igCurrentEntity();
  fetch(_API+'/api/terceros').then(function(r){return r.json();}).then(function(d){
    if(!d.ok||!d.data||!d.data.length) return; // Ya tenemos datos locales
    if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
    var rows = d.data.filter(function(t){
      if(!entidad) return true;
      var ent = (t.NombreEntidad||'').toLowerCase().replace(/\s+/g,'');
      return !ent || ent.includes(entidad) || entidad.includes(ent);
    });
    if(!rows.length) return;
    var ZONES={alto:'c-crit',medio:'c-alto',bajo:'c-bajo',critico:'c-crit'};
    tbody.innerHTML = rows.map(function(t){
      var nit=t.NIT||'';
      if(nit&&!TERCEROS_DB[nit]){ TERCEROS_DB[nit]={ nit:nit, nombre:t.NombreTercero||'', servicio:t.ServicioContratado||'', supervisor:t.SupervisorNombre||'', prom:t.PromedioCriticidad||0, entidad:entidad }; }
      var p=parseFloat(t.PromedioCriticidad||0); var cc=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
      var zona=(t.Zona_Riesgo||'').toLowerCase(); var zc=ZONES[zona]||'c-bajo';
      var actions='<button class="btn btn-outline btn-xs" onclick="verDetalleTercero(\''+(t.NIT||'')+'\')">👁 Ver detalle</button>'
        +' <button class="btn btn-primary btn-xs" onclick="navTo(null,\'pg-evidencias-repo\');setTimeout(function(){odAbrirTercero(\''+(t.NIT||'')+'\');},120)">📁 Documentos</button>';
      return '<tr><td style="font-size:11.5px;font-weight:600;color:var(--navy);">'+(t.NIT||'—')+'</td>'
        +'<td style="font-size:12.5px;font-weight:700;">'+(t.NombreTercero||'—')+'</td>'
        +'<td style="font-size:11px;">'+(t.NombreEntidad||entidad||'—')+'</td>'
        +'<td style="font-size:11px;white-space:nowrap;">'+(t.FechaInicioContrato?String(t.FechaInicioContrato).slice(0,10):'—')+'</td>'
        +'<td style="font-size:11px;white-space:nowrap;">'+(t.FechaTerminacionContrato?String(t.FechaTerminacionContrato).slice(0,10):'—')+'</td>'
        +'<td><span class="chip '+cc+'" style="font-size:10px;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td>'
        +'<td><span class="chip '+zc+'" style="font-size:10px;">'+(t.Zona_Riesgo||'—')+'</span></td>'
        +'<td style="white-space:nowrap;">'+actions+'</td></tr>';
    }).join('');
  }).catch(function(){ /* ya mostramos datos locales arriba */ });
}
// ── Contratos desde API (filtrado por entidad) ──────────────────
window.loadIGContratosFull = function loadIGContratosFull(){
  var wrap = document.getElementById('ig-contratos-wrap');
  if(!wrap) return;
  // Mostrar datos locales de TERCEROS_DB inmediatamente
  try{ renderIGContratos(); }catch(e){}
  // Intentar enriquecer con datos de la API en segundo plano
  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/contratos').then(function(r){return r.json();}).then(function(d){
    if(!d.ok||!d.data||!d.data.length) return; // Ya tenemos datos locales, no sobreescribir con vacío
    var entidad = _igCurrentEntity();
    var rows = d.data.filter(function(c){
      if(!entidad) return true;
      var t = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[c.NIT]) ? TERCEROS_DB[c.NIT] : null;
      if(t){ var ent=(t.entidad||'').toLowerCase().replace(/\s+/g,''); return !ent||ent===entidad||entidad===ent; }
      return true;
    });
    if(!rows.length) return;
    var tableRows = rows.map(function(c){
      var nv=parseFloat(c.ValorContrato||0); var fVal=isNaN(nv)||nv===0?'—':('$'+nv.toLocaleString('es-CO'));
      var db = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[c.NIT]) ? TERCEROS_DB[c.NIT] : {};
      var fi = c.FechaInicio       ? String(c.FechaInicio).slice(0,10)       : (db.finicio||'—');
      var ff = c.FechaTerminacion  ? String(c.FechaTerminacion).slice(0,10)  : (db.fterm||'—');
      var procesos = db.procesosSoporta || c.ProcesosSoporta || '—';
      var obs      = db.observaciones   || c.Observaciones   || '—';
      return '<tr>'
        +'<td style="font-size:11.5px;font-weight:600;">'+(c.NIT||'—')+'</td>'
        +'<td style="font-size:12.5px;font-weight:700;">'+(c.Nombre||'—')+'</td>'
        +'<td style="font-size:11px;">'+(c.NoContrato||'—')+'</td>'
        +'<td style="font-size:11px;white-space:nowrap;">'+fi+'</td>'
        +'<td style="font-size:11px;white-space:nowrap;">'+ff+'</td>'
        +'<td style="font-size:11.5px;font-weight:600;">'+fVal+'</td>'
        +'<td style="font-size:11px;max-width:180px;">'+procesos+'</td>'
        +'<td style="font-size:11px;max-width:180px;color:var(--muted);">'+obs+'</td>'
        +'</tr>';
    }).join('');
    var cnt=document.getElementById('ctrl-count'); if(cnt) cnt.textContent=rows.length+' contrato'+(rows.length!==1?'s':'');
    wrap.innerHTML='<div style="overflow-x:auto;"><table><thead><tr><th>NIT</th><th>Nombre</th><th>No. Contrato</th><th>F. Inicio</th><th>F. Término</th><th>Valor</th><th>Procesos que soporta</th><th>Observaciones</th></tr></thead><tbody>'+tableRows+'</tbody></table></div>';
  }).catch(function(){ /* ya mostramos datos locales arriba */ });
}

function renderIGTerceros(){ loadIGTercerosFull(); } // alias para compatibilidad
// Lee de TERCEROS_DB (poblado al guardar Clasificación)
// ══════════════════════════════════════════════════════════
function renderIGContratos(){
  var wrap=document.getElementById('ig-contratos-wrap');if(!wrap)return;
  try{var _s=JSON.parse(localStorage.getItem('sgrt_v8')||'{}');if(_s.TERCEROS_DB)window.TERCEROS_DB=Object.assign(window.TERCEROS_DB||{},_s.TERCEROS_DB);}catch(e){}
  var db=window.TERCEROS_DB||(typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{});
  var q=((document.getElementById('ig-cont-search')||{}).value||'').toLowerCase();
  var ev=(document.getElementById('ig-cont-ent')||{}).value||'';
  var zv=(document.getElementById('ig-cont-zona')||{}).value||'';
  
  // ✅ ARREGLADO: Iterar sobre CONTRATOS ADICIONALES, no terceros
  var todasLasContratos = [];
  var igEntity = _igCurrentEntity();
  Object.keys(db).filter(function(nit){return _igMatchesEntity(db[nit],igEntity);}).forEach(function(nit){
    var t = db[nit];
    if(!t || !t.contratos || !Array.isArray(t.contratos)) return;
    
    // Cada contrato adicional lleva referencia al tercero
    t.contratos.forEach(function(c, idx){
      todasLasContratos.push({
        nit: nit,
        nombre_tercero: t.nombre || '—',
        entidad: t.entidad || '',
        prom: t.prom || 0,
        zona: t.zona || '—',
        contrato_num: c.num || '—',
        contrato_objeto: c.objeto || '—',
        contrato_servicio: c.servicio || '—',
        contrato_finicio: c.fini || '—',
        contrato_ffin: c.ffin || '—',
        contrato_valor: c.valor || '—',
        contrato_supervisor: c.supervisor || '—',
        contrato_idx: idx,
        contrato_completo: c
      });
    });
  });
  
  // Filtrar según búsqueda
  var entries = todasLasContratos.filter(function(c){
    if(q && !(c.contrato_num||'').toLowerCase().includes(q) && !(c.contrato_objeto||'').toLowerCase().includes(q) && !(c.contrato_servicio||'').toLowerCase().includes(q) && !(c.nombre_tercero||'').toLowerCase().includes(q)) return false;
    if(ev && c.entidad !== ev) return false;
    if(zv && c.zona !== zv) return false;
    return true;
  });
  
  var cnt=document.getElementById('ctrl-count');if(cnt)cnt.textContent=entries.length+' contrato'+(entries.length!==1?'s':'');
  if(!entries.length){wrap.innerHTML='<div class="alert al-b" style="font-size:12px;">Los contratos se agregan al guardar en <b>Clasificacion de Terceros</b>.</div>';return;}
  
  var ELABELS={colpensiones:'Colpensiones',ecopetrol:'Ecopetrol',bancolombia:'Bancolombia'};
  var EBGS={colpensiones:'background:#e8f0f8;color:var(--navy);border:1px solid #aac8f0;',ecopetrol:'background:#e8f4e8;color:#1a5c1a;border:1px solid #82d982;',bancolombia:'background:#fff3e0;color:#7c4a00;border:1px solid #ffb74d;'};
  
  var rows=entries.map(function(c){
    var eL=ELABELS[c.entidad]||c.entidad||'—';var eBg=EBGS[c.entidad]||'';
    var p=parseFloat(c.prom||0);var cc=p>=4?'c-crit':p>=3?'c-alto':'c-bajo';
    var nv=parseInt(String(c.contrato_valor||'').replace(/[^0-9]/g,''));var fVal=isNaN(nv)?'—':('$'+nv.toLocaleString('es-CO'));
    return '<tr data-nit="'+c.nit+'" data-idx="'+c.contrato_idx+'"><td style="font-size:11.5px;white-space:nowrap;"><b>'+(c.nit||'—')+'</b></td><td style="font-size:12.5px;font-weight:600;">'+(c.nombre_tercero||'—')+'</td><td><span class="chip" style="font-size:10px;'+eBg+'">'+eL+'</span></td><td style="font-size:11px;">'+(c.contrato_num||'—')+'</td><td style="font-size:11.5px;">'+(c.contrato_objeto||'—')+'</td><td style="font-size:11px;white-space:nowrap;">'+(c.contrato_finicio||'—')+'</td><td style="font-size:11px;white-space:nowrap;">'+(c.contrato_ffin||'—')+'</td><td style="font-size:11.5px;font-weight:600;">'+fVal+'</td><td><span class="chip '+cc+'" style="font-size:10px;">'+(isNaN(p)?'—':p.toFixed(2))+'</span></td><td style="white-space:nowrap;"><button class="btn btn-outline btn-xs" onclick="abrirEditIGContrato(\''+c.nit+'\', '+c.contrato_idx+')">✏️ Editar</button> <button class="btn btn-xs" style="background:#fde8e8;color:var(--red);border:1px solid #f5b7b1;" onclick="eliminarIGContrato(\''+c.nit+'\', '+c.contrato_idx+')">🗑 Quitar</button></td></tr>';
  }).join('');
  wrap.innerHTML='<div style="overflow-x:auto;"><table><thead><tr><th>NIT</th><th>Tercero</th><th>Organización</th><th>No. Contrato</th><th>Objeto</th><th>F. Inicio</th><th>F. Término</th><th>Valor</th><th>Prom.</th><th>Acciones</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function abrirEditIGContrato(nit, idx){
  // idx es el índice en el array TERCEROS_DB[nit].contratos[]
  if(!nit) return;
  
  var t = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[nit]) ? TERCEROS_DB[nit] : {};
  if(!t.contratos || !Array.isArray(t.contratos) || !t.contratos[idx]){
    showToast('❌ No se encontró el contrato','error',2000);
    return;
  }
  
  var contrato = t.contratos[idx];
  var m = document.getElementById('m-ig-editar-contrato');
  if(!m) return;
  
  // Llenar modal con datos del CONTRATO específico
  document.getElementById('igc-nit').value       = nit;
  document.getElementById('igc-nit').dataset.idx = idx; // Guardar índice para saber cuál actualizar
  document.getElementById('igc-nombre').value    = t.nombre||'';
  document.getElementById('igc-nocontrato').value= contrato.num||'';
  document.getElementById('igc-servicio').value  = contrato.servicio||'';
  document.getElementById('igc-objetivo').value  = contrato.objeto||'';
  document.getElementById('igc-domicilio').value = contrato.domicilio||'';
  document.getElementById('igc-finicio').value   = contrato.fini||'';
  document.getElementById('igc-fterm').value     = contrato.ffin||'';
  document.getElementById('igc-valor').value     = contrato.valor||'';
  document.getElementById('igc-procesos-soporta').value = contrato.procesos||'';
  document.getElementById('igc-observaciones').value    = contrato.observaciones||'';
  
  m.style.display = 'flex';
}

function guardarIGContrato(){
  var nitInput = document.getElementById('igc-nit');
  var nit = nitInput?.value;
  var idx = parseInt(nitInput?.dataset?.idx || '-1');
  
  if(!nit) return;
  if(typeof TERCEROS_DB === 'undefined') window.TERCEROS_DB = {};
  if(!TERCEROS_DB[nit]) TERCEROS_DB[nit] = { nit };
  
  // ✅ ARREGLADO: Actualizar en el array de contratos, no en el tercero
  if(idx >= 0 && TERCEROS_DB[nit].contratos && TERCEROS_DB[nit].contratos[idx]){
    // Actualizar contrato existente en array
    TERCEROS_DB[nit].contratos[idx].num              = document.getElementById('igc-nocontrato')?.value||'';
    TERCEROS_DB[nit].contratos[idx].servicio         = document.getElementById('igc-servicio')?.value||'';
    TERCEROS_DB[nit].contratos[idx].objeto           = document.getElementById('igc-objetivo')?.value||'';
    TERCEROS_DB[nit].contratos[idx].domicilio        = document.getElementById('igc-domicilio')?.value||'';
    TERCEROS_DB[nit].contratos[idx].fini             = document.getElementById('igc-finicio')?.value||'';
    TERCEROS_DB[nit].contratos[idx].ffin             = document.getElementById('igc-fterm')?.value||'';
    TERCEROS_DB[nit].contratos[idx].valor            = document.getElementById('igc-valor')?.value||'';
    TERCEROS_DB[nit].contratos[idx].procesos         = document.getElementById('igc-procesos-soporta')?.value||'';
    TERCEROS_DB[nit].contratos[idx].observaciones    = document.getElementById('igc-observaciones')?.value||'';
  } else {
    // FALLBACK: Actualizar tercero principal (por compatibilidad)
    TERCEROS_DB[nit].nombre           = document.getElementById('igc-nombre')?.value||'';
    TERCEROS_DB[nit].nocontrato       = document.getElementById('igc-nocontrato')?.value||'';
    TERCEROS_DB[nit].servicio         = document.getElementById('igc-servicio')?.value||'';
    TERCEROS_DB[nit].objetivo         = document.getElementById('igc-objetivo')?.value||'';
    TERCEROS_DB[nit].domicilio        = document.getElementById('igc-domicilio')?.value||'';
    TERCEROS_DB[nit].finicio          = document.getElementById('igc-finicio')?.value||'';
    TERCEROS_DB[nit].fterm            = document.getElementById('igc-fterm')?.value||'';
    TERCEROS_DB[nit].valor            = document.getElementById('igc-valor')?.value||'';
    TERCEROS_DB[nit].procesosSoporta  = document.getElementById('igc-procesos-soporta')?.value||'';
    TERCEROS_DB[nit].observaciones    = document.getElementById('igc-observaciones')?.value||'';
  }

  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/contratos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({NIT: nit, NoContrato: document.getElementById('igc-nocontrato')?.value||''}) })
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.ok){
        showToast('✅ Contrato actualizado','success',3000);
      } else {
        console.error('Error guardando datos:', d.error||'Error al guardar');
      }
      renderIGContratos(); // recargar tabla
      window._lsSave && window._lsSave(); // Sincronizar localStorage
    })
    .catch(function(){
      showToast('⚠️ Sin conexión — cambios guardados localmente','info',3000);
      renderIGContratos();
      window._lsSave && window._lsSave();
    });

  document.getElementById('m-ig-editar-contrato').style.display='none';
  if(typeof addLog==='function') addLog(TERCEROS_DB[nit].nombre,'MAESTRA_TERCEROS_CONTRATOS','Edición','—','Contrato actualizado',new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Contratos');
}

function eliminarIGContrato(nit, idx){
  // idx es el índice en el array TERCEROS_DB[nit].contratos[]
  if(!nit) return;
  
  var t = (typeof TERCEROS_DB!=='undefined' && TERCEROS_DB[nit]) ? TERCEROS_DB[nit] : {};
  var nombreTercero = t.nombre || nit;
  var nombreContrato = '—';
  
  if(idx >= 0 && t.contratos && t.contratos[idx]){
    nombreContrato = t.contratos[idx].num || t.contratos[idx].objeto || '—';
  }
  
  if(!confirm('¿Eliminar el contrato "' + nombreContrato + '" de "' + nombreTercero + '"? Esta acción no se puede deshacer.')) return;
  
  // ✅ ARREGLADO: Eliminar del array de contratos
  if(idx >= 0 && t.contratos && Array.isArray(t.contratos)){
    t.contratos.splice(idx, 1);
    window._lsSave && window._lsSave(); // Sincronizar localStorage
  }
  
  // También DELETE from API
  var _API = typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/contratos/'+encodeURIComponent(nit), { method:'DELETE' }).catch(function(){});
  
  renderIGContratos();
  showToast('✅ Contrato eliminado','info',2000);
  if(typeof addLog==='function') addLog(nombreTercero,'MAESTRA_TERCEROS_CONTRATOS','Eliminación','—','Contrato '+ nombreContrato + ' eliminado',new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),'Contratos');
}

// renderIGTerceros → alias a loadIGTercerosFull (definida arriba)

function filterIGTerceros(){
  var q=((document.getElementById('ig-terc-search')||{}).value||'').toLowerCase();
  document.querySelectorAll('#ig-tbody-terceros tr').forEach(function(tr){
    tr.style.display=!q||tr.textContent.toLowerCase().includes(q)?'':'none';
  });
}

function filterIGFuncionarios(){
  var q=((document.getElementById('ig-func-search')||{}).value||'').toLowerCase();
  var area=((document.getElementById('ig-func-area')||{}).value||'');
  document.querySelectorAll('#ig-tbody-funcionarios tr').forEach(function(tr){
    var txt=tr.textContent.toLowerCase();
    tr.style.display=(!q||txt.includes(q))&&(!area||txt.includes(area.toLowerCase()))?'':'none';
  });
}

function abrirEditIGTercero(nit){
  var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
  var t=db[nit];
  if(!t){showToast('Tercero no encontrado','error',2000);return;}
  document.getElementById('ig-edit-nit').value=nit;
  var disp=document.getElementById('ig-edit-nit-display');if(disp)disp.textContent=nit;
  document.getElementById('ig-edit-nombre').value=t.nombre||'';
  document.getElementById('ig-edit-domicilio').value=t.domicilio||'';
  var sups=t.supervisores||(t.supervisor?[t.supervisor]:['']);
  if(!sups.length)sups=[''];
  renderIGSupervisores(sups);
  
  // ✅ CARGAR CONTRATOS EN BUFFER ANTES DE MOSTRARLOS
  if(window._cfCtrCargarDe) window._cfCtrCargarDe(nit);
  
  mostrarContratosDelTercero(nit);
  openM('m-ig-editar-tercero');
}

function mostrarContratosDelTercero(nit){
  var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
  var t=db[nit];
  var wrap=document.getElementById('ig-contratos-wrap');if(!wrap)return;
  
  // ✅ CARGAR DESDE BUFFER (CONTRATOS NUEVOS) O DESDE TERCEROS_DB (ANTIGUOS)
  var contratos = [];
  
  // Prioridad 1: Si hay _cfContratosBuffer, usarlo (contratos que se están editando)
  if(window._cfContratosBuffer && window._cfContratosBuffer.length > 0){
    contratos = window._cfContratosBuffer.filter(function(c){ return c.num && c.num.trim(); });
  }
  // Prioridad 2: Si no hay buffer, usar TERCEROS_DB
  else if(t && t.contratos){
    contratos = t.contratos;
  }
  
  if(!contratos.length){
    wrap.innerHTML='<div style="padding:24px;text-align:center;color:var(--muted);font-size:12px;">📋 Sin contratos registrados. Usa "+ Nuevo" para agregar uno.</div>';
    return;
  }
  wrap.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="background:#fff3e0;border-bottom:2px solid #ffe0b2;">'
    +'<th style="padding:12px;text-align:left;font-weight:700;color:#856404;">Nº Contrato</th>'
    +'<th style="padding:12px;text-align:left;font-weight:700;color:#856404;">Objeto del Contrato</th>'
    +'<th style="padding:12px;text-align:center;font-weight:700;color:#856404;">Supervisor</th>'
    +'<th style="padding:12px;text-align:center;font-weight:700;color:#856404;">Inicio</th>'
    +'<th style="padding:12px;text-align:center;font-weight:700;color:#856404;">Fin</th>'
    +'<th style="padding:12px;text-align:center;font-weight:700;color:#856404;">Estado</th>'
    +'<th style="padding:12px;text-align:center;font-weight:700;color:#856404;">Acciones</th>'
    +'</tr></thead><tbody>'
    +contratos.map(function(c,i){
      var estadoColor = c.estado==='Terminado' ? '#dc3545' : (c.estado==='Suspendido' ? '#fd7e14' : '#28a745');
      var supervisor = c.supervisor_asociado || '—';
      return '<tr style="border-bottom:1px solid #ffe0b2;background:'+(i%2?'#fffbf0':'white')+';hover{background:#fff8e1;}">'
        +'<td style="padding:12px;"><b>'+(c.num||'—')+'</b></td>'
        +'<td style="padding:12px;color:#666;">'+(c.objeto||'—')+'</td>'
        +'<td style="padding:12px;text-align:center;color:#666;font-size:11px;">👤 '+supervisor+'</td>'
        +'<td style="padding:12px;text-align:center;color:#888;font-size:11px;">'+(c.fini||'—')+'</td>'
        +'<td style="padding:12px;text-align:center;color:#888;font-size:11px;">'+(c.ffin||'En Ejecución')+'</td>'
        +'<td style="padding:12px;text-align:center;"><span style="padding:4px 10px;border-radius:4px;background:'+estadoColor+'22;color:'+estadoColor+';font-size:11px;font-weight:700;white-space:nowrap;">'+(c.estado||'En Ejecución')+'</span></td>'
        +'<td style="padding:12px;text-align:center;white-space:nowrap;"><button type="button" class="btn btn-sm" style="background:#e8f5e9;color:#1b5e20;border:1px solid #81c784;padding:5px 10px;border-radius:4px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;margin-right:4px;" onclick="editarIGContrato(\''+nit+'\','+i+')">Editar</button><button type="button" class="btn btn-sm" style="background:#ffebee;color:#c62828;border:1px solid #ef5350;padding:5px 10px;border-radius:4px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;" onclick="eliminarIGContrato(\''+nit+'\','+i+')">Eliminar</button></td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

function agregarIGContrato(){
  var nit=document.getElementById('ig-edit-nit').value;
  if(!nit){showToast('Selecciona un tercero primero','error',2000);return;}
  clsEditarContrato(nit,-1);
}

function editarIGContrato(nit,idx){
  clsEditarContrato(nit,idx);
}

function eliminarIGContrato(nit,idx){
  if(!confirm('¿Eliminar este contrato?'))return;
  var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
  var t=db[nit];
  if(t&&t.contratos&&t.contratos[idx]){
    t.contratos.splice(idx,1);
    try{window._lsSave&&window._lsSave();}catch(e){}
    mostrarContratosDelTercero(nit);
    showToast('✅ Contrato eliminado','success',2000);
  }
}

function agregarIGSupervisor(){
  var inputs=document.querySelectorAll('.ig-sup-input');
  var vals=Array.from(inputs).map(function(i){return i.value.trim();});
  // Validar que el último no esté vacío antes de agregar uno nuevo
  if(vals.length>0 && vals[vals.length-1]===''){
    showToast('⚠️ Completa el supervisor anterior antes de agregar otro','warning',2000);
    return;
  }
  vals.push('');
  renderIGSupervisores(vals);
  // Focus al nuevo input
  setTimeout(function(){
    var newInput=document.querySelectorAll('.ig-sup-input');
    if(newInput.length>0) newInput[newInput.length-1].focus();
  },100);
}

function quitarIGSupervisor(idx){
  var inputs=document.querySelectorAll('.ig-sup-input');
  var vals=Array.from(inputs).map(function(i){return i.value.trim();});
  vals.splice(idx,1);
  if(!vals.length)vals=[''];
  renderIGSupervisores(vals);
}

function renderIGSupervisores(sups){
  var wrap=document.getElementById('ig-supervisores-wrap');if(!wrap)return;
  if(!sups||!sups.length)sups=[''];
  wrap.innerHTML=sups.map(function(s,i){
    var noVacios = sups.filter(function(x){return x.trim();}).length;
    return '<div style="display:flex;gap:10px;align-items:center;margin-bottom:2px;">'
      +'<div style="flex:1;display:flex;flex-direction:column;gap:2px;">'
      +'<input type="text" class="ig-sup-input" value="'+(s||'')+'" placeholder="Nombre completo del supervisor..." '
      +'style="width:100%;padding:10px 12px;border:1px solid #b2dfdb;border-radius:var(--r);font-size:12px;font-family:inherit;background:white;box-sizing:border-box;"/>'
      +'</div>'
      +(noVacios>1?'<button type="button" onclick="quitarIGSupervisor('+i+')" style="padding:8px 12px;background:#ffebee;border:1px solid #ef5350;color:#c62828;border-radius:var(--r);cursor:pointer;font-size:11px;font-weight:700;font-family:inherit;white-space:nowrap;">✕ Quitar</button>':'')
      +'</div>';
  }).join('');
}

function guardarIGTercero(){
  var nit=document.getElementById('ig-edit-nit').value;
  var nombre=(document.getElementById('ig-edit-nombre').value||'').trim();
  var domicilio=(document.getElementById('ig-edit-domicilio').value||'').trim();
  var inputs=document.querySelectorAll('.ig-sup-input');
  var sups=Array.from(inputs).map(function(i){return i.value.trim();}).filter(Boolean);
  
  if(!nombre){showToast('⚠️ El nombre es obligatorio','error',2000);return;}
  if(!nit){showToast('⚠️ NIT no válido','error',2000);return;}
  
  var db=typeof TERCEROS_DB!=='undefined'?TERCEROS_DB:{};
  var t=db[nit];
  if(!t){showToast('⚠️ Tercero no encontrado en la base de datos','error',2000);return;}
  
  // Guardar cambios
  t.nombre=nombre;
  t.domicilio=domicilio;
  t.supervisores=sups;
  t.supervisor=sups[0]||t.supervisor||'—';
  
  // ✅ GUARDAR CONTRATOS DESDE BUFFER A TERCEROS_DB
  var contratosGuardados = (window._cfContratosBuffer || []).filter(c => c.num && c.num.trim());
  if(contratosGuardados.length > 0){
    t.contratos = contratosGuardados;
  }
  
  // Actualizar tabla de terceros (solo nombre, no servicio/supervisor que ya no existen)
  document.querySelectorAll('#tbody-terceros tr').forEach(function(tr){
    var c0=tr.querySelector('td:first-child');
    if(c0&&c0.textContent.trim()===nit){
      var cells=tr.querySelectorAll('td');
      if(cells[1])cells[1].innerHTML='<b>'+nombre+'</b>';
    }
  });
  
  // Guardar en localStorage
  try{window._lsSave&&window._lsSave();}catch(e){}
  
  // Log
  try{
    addLog(nombre,'Relacion_Terceros','Edición Info General','—',
      'Nombre/Servicio: '+nombre+' · Supervisores: '+(sups.length>0?sups.join(', '):'—'),
      new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}),
      'Datos Maestros'
    );
  }catch(e){}
  
  closeM('m-ig-editar-tercero');
  setTimeout(function(){
    try{renderIGTerceros();}catch(e){}
  },200);
  
  showToast('✅ Tercero actualizado · '+sups.length+' supervisor(es) · Servicio: '+servicio,'success',3000);
}

function guardarIGProceso(){
  var nom=(document.getElementById('ig-proc-nom')||{}).value||'';
  var tipo=(document.getElementById('ig-proc-tipo')||{}).value||'Misional';
  var obj=(document.getElementById('ig-proc-objetivo')||{}).value||'';
  var desc=(document.getElementById('ig-proc-macro')||{}).value||'';
  if(!nom){showToast('El nombre es obligatorio','error',2000);return;}
  var _API=typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/procesos',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({Nombre:nom, Tipo:tipo, Objetivo:obj, Descripcion:desc})
  }).then(function(r){return r.json();}).then(function(d){
    if(d.ok){
      closeM('m-ig-proceso');
      showToast('✅ Proceso "'+nom+'" guardado en BD','success',3000);
      loadIGProcesos(); // recarga desde API
    } else {
      console.error('Error guardando proceso:', d.error||'No se pudo guardar');
    }
  }).catch(function(){
    showToast('⚠️ Sin conexión al servidor','error',3000);
  });
}

function guardarIGFuncionario(){
  var nom=(document.getElementById('ig-func-nom')||{}).value||'';
  var correo=(document.getElementById('ig-func-correo')||{}).value||'';
  var tel=(document.getElementById('ig-func-tel')||{}).value||'';
  if(!nom){showToast('El nombre es obligatorio','error',2000);return;}
  var _API=typeof API_BASE!=='undefined'?API_BASE:'http://localhost:3000';
  fetch(_API+'/api/funcionarios',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({Nombre:nom, Correo:correo, Telefono:tel})
  }).then(function(r){return r.json();}).then(function(d){
    if(d.ok){
      closeM('m-ig-funcionario');
      showToast('✅ Supervisor "'+nom+'" guardado en BD','success',3000);
      loadIGFuncionarios(); // recarga desde API
    } else {
      console.error('Error guardando supervisor:', d.error||'No se pudo guardar');
    }
  }).catch(function(){
    showToast('⚠️ Sin conexión al servidor','error',3000);
  });
}


// ════ WIZARD IMPLEMENTATION ════
var CLS_WIZARD_STEP = 1;
var CLS_WIZARD_NIT  = null;

function clsWizardSetStep(step){
  CLS_WIZARD_STEP = step;
  var msgs={1:'Paso 1 — Completa la información general del tercero',2:'Paso 2 — Selecciona tipologías y asigna valoración',3:'Paso 3 — Responde el Cuestionario de Ambiente de Control',4:'Paso 4 — Revisa la Matriz de Riesgos',5:'Proceso completado'};
  var msgEl=document.getElementById('cls-wizard-msg'); if(msgEl) msgEl.textContent=msgs[step]||'';
  var pct={1:0,2:25,3:50,4:75,5:100}[step]||0;
  var pl=document.getElementById('cls-prog-line'); if(pl) pl.style.width=pct+'%';
  for(var i=1;i<=5;i++){
    var circle=document.getElementById('cls-step'+i+'-circle');
    if(!circle) continue;
    var isDone=i<step, isActive=i===step;
    if(isDone){
      circle.style.background='var(--green)'; circle.style.borderColor='var(--green)'; circle.style.color='white';
      circle.innerHTML='<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if(isActive){
      circle.style.background='var(--blue)'; circle.style.borderColor='var(--blue)'; circle.style.color='white'; circle.textContent=i===5?'✓':String(i);
    } else {
      circle.style.background='white'; circle.style.borderColor='var(--border2)'; circle.style.color='var(--muted)'; circle.textContent=i===5?'✓':String(i);
    }
    var lbl=circle.parentElement&&circle.parentElement.querySelector('div:last-child');
    if(lbl) lbl.style.color=(isDone||isActive)?'var(--navy)':'var(--muted)';
  }
}

function clsWizardTrasGuardar(nit, prom, tipologias){
  CLS_WIZARD_NIT = nit;
  clsWizardSetStep(3);
  var banner=document.getElementById('cls-instruccion-banner');
  var titulo=document.getElementById('cls-instruccion-titulo');
  var texto =document.getElementById('cls-instruccion-texto');
  var btnCuest=document.getElementById('cls-btn-ir-cuest');
  var tipBox=document.getElementById('cls-tip-box');
  var tipList=document.getElementById('cls-tip-list');
  var promBadge=document.getElementById('cls-tip-prom-badge');
  
  // Cambiar estilo del banner a verde con ✅
  if(banner){
    banner.style.background='linear-gradient(135deg,#1b6e2f,#28a745)';
  }
  
  // Cambiar icono del banner a ✅
  var bannerIcon=banner?banner.querySelector('div:first-child'):null;
  if(bannerIcon) bannerIcon.textContent='✅';
  
  // ✅ MOSTRAR "LISTO" BIEN VISIBLE
  if(titulo) titulo.innerHTML='<div style="display:flex;align-items:center;gap:10px;"><span>¡Listo!</span></div>';
  
  var promStr=parseFloat(prom)>0?parseFloat(prom).toFixed(2):'—';
  if(promBadge) promBadge.textContent=promStr;
  if(texto){
    if(parseFloat(prom)>=3){
      var _tAp=(window.TERCEROS_DB||{})[nit];
      if(_tAp && _tAp.aprobado_clasif){
        texto.innerHTML='<div style="font-size:13px;color:white;line-height:1.6;"><b>Clasificación completada</b> · Promedio: <b>'+promStr+'</b><br>✅ Ya fue aprobada. Siguiente: Evaluación de Ambiente de Control.</div>';
      } else {
        texto.innerHTML='<div style="font-size:13px;color:white;line-height:1.6;"><b>Clasificación completada</b> · Promedio: <b>'+promStr+'</b><br>Siguiente: Aprobación de Clasificación</div>';
      }
    } else {
      texto.innerHTML='<div style="font-size:13px;color:white;line-height:1.6;"><b>Clasificación completada</b> · Promedio: <b>'+promStr+'</b><br>No requiere evaluación adicional.</div>';
    }
  }
  // Render tipologias
  if(tipList && (tipologias||[]).length){
    if(tipBox) tipBox.style.display='block';
    var VAL_C={'5':'#ff8a8a','4':'#ffb347','3':'#ffe066','2':'#7ecfff','1':'#7ee8a2'};
    tipList.innerHTML=(tipologias||[]).map(function(d){
      var v=d.val||''; var col=VAL_C[v]||'rgba(255,255,255,.4)';
      return '<div style="display:flex;align-items:center;gap:10px;padding:7px 12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;">'
        +'<div style="flex:1;font-size:12px;font-weight:600;">'+window._nombreTipologia(d)+'</div>'
        +'<div style="font-family:Montserrat,sans-serif;font-size:18px;font-weight:800;color:'+col+';">'+(v||'—')+'</div>'
        +'</div>';
    }).join('');
  }
  if(btnCuest){
    btnCuest.style.display=parseFloat(prom)>=3?'inline-block':'none';
    var _tAp2=(window.TERCEROS_DB||{})[nit];
    btnCuest.textContent = (_tAp2 && _tAp2.aprobado_clasif)
      ? '✅ Ya se aprobó — Ahora sí: Evaluación Ambiente de Control →'
      : '➜ Siguiente paso: Aprobación de Clasificación →';
  }
  if(banner){ banner.style.display='block'; banner.scrollIntoView({behavior:'smooth',block:'start'}); }
}

function _wizardUpdateTipVal(sel){
  var key=sel.getAttribute('data-dim-key'); var nit=sel.getAttribute('data-nit'); var val=sel.value;
  if(!val) return;
  var dim=cfDimsAgregadas&&cfDimsAgregadas.find(function(d){return d.key===key;});
  if(dim){ dim.val=val; try{calcCfProm();}catch(e){} }
  var badge=sel.previousElementSibling;
  if(badge){ var VC={'5':'#ff8a8a','4':'#ffb347','3':'#ffe066','2':'#7ecfff','1':'#7ee8a2'}; badge.style.color=VC[val]||'white'; badge.textContent=val; }
  showToast('Valoración actualizada: '+key.toUpperCase()+' = '+val,'success',2000);
}

// ── Contratos adicionales del Paso 1 ─────────────────────────────
// Los contratos "extra" que se agregan en el bloque nuevo del Paso 1
// se guardan en window._cfContratosBuffer y, al Guardar Registro,
// pasan a t.contratos (sumados al principal). Todo se refleja
// automáticamente en Clasificación (Paso 2), Ambiente de Control
// (Evaluador) y Análisis de Riesgos.
window._cfContratosBuffer = [];
window._cfCtrRender = function(){
  var wrap=document.getElementById('cf-contratos-adic'); if(!wrap) return;
  var arr = window._cfContratosBuffer||[];
  if(!arr.length){
    wrap.innerHTML = '<div style="text-align:center;padding:14px;font-size:11.5px;color:#64748b;font-style:italic;">Sin contratos. Usa <b>+ Añadir contrato</b> para registrar el contrato del tercero.</div>';
    return;
  }
  wrap.innerHTML = arr.map(function(c,i){
    var esc = function(s){ return String(s||'').replace(/"/g,'&quot;'); };
    return '<div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<div style="font-size:11.5px;font-weight:800;color:#0f172a;">Contrato #'+(i+1)+'</div>'
      +'<button type="button" onclick="window._cfCtrQuitar('+i+')" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:13px;font-weight:700;">Quitar ✕</button>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">No. Contrato</label><input value="'+esc(c.num)+'" oninput="window._cfCtrSet('+i+',\'num\',this.value)" placeholder="CON-2026-001" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Inicio</label><input type="date" value="'+esc(c.fini)+'" onchange="window._cfCtrSet('+i+',\'fini\',this.value)" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Fin</label><input type="date" value="'+esc(c.ffin)+'" onchange="window._cfCtrSet('+i+',\'ffin\',this.value)" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Objeto</label><input value="'+esc(c.objeto)+'" oninput="window._cfCtrSet('+i+',\'objeto\',this.value)" placeholder="Objeto del contrato" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div>'
      +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Estado</label><select onchange="window._cfCtrSet('+i+',\'estado\',this.value)" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;">'
      +['En Ejecucion','Suspendido','Terminado','Por Iniciar'].map(function(e){return '<option '+((c.estado||'En Ejecucion')===e?'selected':'')+'>'+e+'</option>';}).join('')
      +'</select></div>'
      +'<div style="grid-column:2/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Valor</label><div style="display:flex;align-items:center;gap:4px;"><span style="font-weight:700;color:#475569;">$</span><input value="'+esc(c.valor)+'" oninput="window._cfCtrSetValor('+i+',this)" placeholder="Ej: 500.000.000,00" style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;"></div></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">Procesos que soporta el contrato</label><textarea rows="2" oninput="window._cfCtrSet('+i+',\'procesos\',this.value)" placeholder="Ej: P-01 Gestión Comercial, P-03 Seguimiento y Monitoreo, P-05 Nómina..." style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;">'+esc(c.procesos)+'</textarea></div>'
      +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:3px;">💬 Observaciones del Contrato</label><textarea rows="2" oninput="window._cfCtrSet('+i+',\'observaciones\',this.value)" placeholder="Observaciones específicas para este contrato..." style="width:100%;padding:7px 9px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;resize:vertical;">'+esc(c.observaciones)+'</textarea></div>'
      +'</div></div>';
  }).join('');
  // Sincronizar el PRIMER contrato al campo hidden cf-* para que la lógica
  // existente (que guarda el "contrato principal") funcione sin cambios.
  var p = arr[0] || {};
  var s=function(id,v){var el=document.getElementById(id); if(el) el.value=v||'';};
  s('cf-nocontrato', p.num); s('cf-objetivo', p.objeto);
  s('cf-finicio', p.fini);   s('cf-ffinal', p.ffin);
  s('cf-fterm', p.estado||'En Ejecucion');  s('cf-valor', p.valor);
  s('cf-procesos-soporta', p.procesos);
};
  // ═══════════════════════════════════════════════════════════════════
  // FUNCIÓN: Actualizar desplegable de contratos en TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════════
  window.actualizarDesplegableContratos = function(){
    var selectContrato = document.getElementById('cf-sup-contrato');
    if(!selectContrato) return;
    
    var nit = (document.getElementById('cf-nit')?.value || '').trim();
    var t = nit ? (window.TERCEROS_DB || {})[nit] : null;
    var contratosBuffer = window._cfContratosBuffer || [];
    
    // Combinar: contratos guardados + contratos en buffer
    var todosLosContratos = [];
    
    // De TERCEROS_DB (ya guardados)
    if(t && t.contratos && t.contratos.length > 0){
      t.contratos.forEach(function(c){
        if(c.num && !todosLosContratos.find(x => x.num === c.num)){
          todosLosContratos.push(c);
        }
      });
    }
    
    // Del buffer (en edición)
    contratosBuffer.forEach(function(c){
      if(c.num && !todosLosContratos.find(x => x.num === c.num)){
        todosLosContratos.push(c);
      }
    });
    
    // Reconstruir opciones
    var opcionesHtml = '<option value="">-- Seleccionar Contrato --</option>';
    if(todosLosContratos.length > 0){
      todosLosContratos.forEach(function(c){
        var label = c.num ? ('Contrato ' + c.num) : 'Contrato sin número';
        if(c.fini) label += ' (' + c.fini + ')';
        opcionesHtml += '<option value="' + c.num + '">' + label + '</option>';
      });
    } else {
      opcionesHtml += '<option value="">❌ Sin contratos registrados</option>';
    }
    
    selectContrato.innerHTML = opcionesHtml;
    console.log('✅ Desplegable de contratos actualizado');
  };

  window._cfCtrAgregar = function(){
  if(!window._cfContratosBuffer) window._cfContratosBuffer=[];
  window._cfContratosBuffer.push({num:'',objeto:'',fini:'',ffin:'',estado:'En Ejecucion',valor:'',procesos:'',supervisor:'',supervisorCargo:'',procesoSupervision:'',supervisorAlt:'',supervisorAltCargo:'',procesoSupervisionAlt:'',observaciones:'',dims:[]});
  window._cfCtrRender();
  window._cfCtrPersistir();
  window.actualizarDesplegableContratos();
};
window._cfCtrQuitar = function(i){
  var c=(window._cfContratosBuffer||[])[i];
  (window._cfContratosBuffer||[]).splice(i,1);
  window._cfCtrRender();
  // Si el contrato tenía número, quitarlo también del tercero guardado
  try{
    var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
    var t=nit?(window.TERCEROS_DB||{})[nit]:null;
    if(t && t.contratos && c && c.num){
      t.contratos = t.contratos.filter(function(x){ return (x.num||'')!==c.num; });
      if(t.contratoEval===c.num) delete t.contratoEval;
      window._lsSave && window._lsSave();
      try{ window._clsContratosRender && window._clsContratosRender(nit); }catch(e){}
    }
  }catch(e){}
};
window._cfCtrSet = function(i,k,v){
  var c=(window._cfContratosBuffer||[])[i]; if(!c) return; c[k]=v;
  window._cfCtrPersistir();
};
window._cfSupervisorQuitar = function(i,numSupervisor){
  var c=(window._cfContratosBuffer||[])[i]; if(!c) return;
  if(numSupervisor==='alt' || numSupervisor===2){
    delete c.supervisorAlt;
    delete c.supervisorAltCargo;
    delete c.procesoSupervisionAlt;
  }else if(numSupervisor>=3){
    delete c['supervisor'+numSupervisor];
    delete c['supervisorCargo'+numSupervisor];
    delete c['procesoSupervision'+numSupervisor];
  }
  window._cfCtrRender();
  window._cfCtrPersistir();
};

// ── Función para formatear valor con decimales automáticos ──
window._cfCtrSetValor = function(i, inputEl){
  var rawValue = (inputEl.value || '').replace(/[^\d,]/g, ''); // Quita todo menos dígitos y coma
  var parts = rawValue.split(',');
  var intPart = parts[0].replace(/\D/g, '') || '0'; // Solo dígitos
  var decPart = parts[1] ? parts[1].substring(0, 2) : ''; // Max 2 decimales
  
  // Formatear parte entera con puntos cada 3 dígitos
  var formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Armar valor final: 500.000,00
  var finalValue = decPart ? formatted + ',' + decPart.padEnd(2, '0') : formatted;
  
  // Actualizar el input
  inputEl.value = finalValue;
  
  // Guardar en buffer
  var c = (window._cfContratosBuffer || [])[i];
  if(c) {
    c.valor = finalValue;
    window._cfCtrPersistir();
  }
};

// Autoguardado: si hay un tercero identificado (por NIT en el formulario),
// cada cambio en el buffer se refleja YA en TERCEROS_DB[nit].contratos.
// Así aparece de inmediato en Clasificación (Paso 2), Aprobación, Ambiente
// de Control y Análisis de Riesgos, sin tener que presionar Guardar Registro.
// ✅ MEJORADO: Ahora guarda TODOS los supervisores correctamente (1, Alt, 2, 3, etc.)
window._cfCtrPersistir = function(){
  try{
    var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
    if(!nit) return;
    if(typeof TERCEROS_DB==='undefined') window.TERCEROS_DB={};
    
    // ✅ CREAR TERCERO SI NO EXISTE (para que se guarden los contratos)
    if(!TERCEROS_DB[nit]) TERCEROS_DB[nit] = { nit: nit };
    
    // ✅ GUARDAR CONTRATOS EN TERCEROS_DB (con supervisores incluidos)
    var contratosGuardados = (window._cfContratosBuffer || []).filter(c => c.num && c.num.trim());
    
    if(contratosGuardados.length > 0){
      // Asegurar que todos los campos de supervisores se copien
      contratosGuardados.forEach(function(c, idx) {
        if(!c.supervisor) c.supervisor = '';
        if(!c.supervisorCargo) c.supervisorCargo = '';
        if(!c.procesoSupervision) c.procesoSupervision = '';
        
        // Copiar supervisores adicionales (Alt, 2, 3, 4, etc.)
        for(var key in c){
          if(key.startsWith('supervisor') || 
             key.startsWith('supervisorCargo') || 
             key.startsWith('procesoSupervision') ||
             key.startsWith('supervisorAlt')){
            // Mantener tal cual
          }
        }
      });
      
      TERCEROS_DB[nit].contratos = contratosGuardados;
      console.log('✅ Contratos guardados con supervisores:', contratosGuardados);
    }
    
    // Sincronizar con localStorage
    if(window._lsSave) window._lsSave();
    
    // Notificar otros módulos
    if(window._clsImportarContratoRegistro){
      window._clsImportarContratoRegistro(nit);
    }
    if(window._clsContratosRender){
      try{ window._clsContratosRender(nit); }catch(e){}
    }
    
    // 🔔 Registrar notificación de cambio de contratos
    if(typeof registrarNotificacion === 'function'){
      registrarNotificacion('contrato_guardado', 'admin_riesgos',
        '✅ Contrato(s) guardado(s) para ' + nit,
        {tercero: nit, contratos: contratosGuardados.length, supervisores: 'incluidos'}
      );
    }
    
    // ✅ Actualizar desplegable de contratos en formulario de supervisores
    window.actualizarDesplegableContratos();
  }catch(e){
    console.error('Error en _cfCtrPersistir:', e);
  }
};
window._cfCtrLimpiar = function(){ window._cfContratosBuffer=[]; window._cfCtrRender(); };
// ✅ MEJORADO: Ahora restaura TODOS los supervisores (1, Alt, 2, 3, 4, etc.) correctamente
window._cfCtrCargarDe = function(nit){
  // Al editar un tercero, cargar todos sus contratos con TODOS sus supervisores
  var t=(window.TERCEROS_DB||{})[nit];
  var cons=(t&&t.contratos)||[];
  
  console.log('🔄 Cargando contratos para NIT:', nit, 'Contratos:', cons.length);
  
  window._cfContratosBuffer = cons
    .map(function(c, idx){ 
      // Mapear el contrato base con datos obligatorios
      var mapeado = {
        num:c.num||'',
        objeto:c.objeto||'',
        fini:c.fini||'',
        ffin:c.ffin||'',
        estado:c.estado||'En Ejecucion',
        valor:c.valor||'',
        procesos:c.procesos||'',
        supervisor:c.supervisor||'',
        supervisorCargo:c.supervisorCargo||'',
        procesoSupervision:c.procesoSupervision||'',
        supervisorAlt:c.supervisorAlt,  // undefined si no existe (esto es importante)
        supervisorAltCargo:c.supervisorAltCargo||'',
        procesoSupervisionAlt:c.procesoSupervisionAlt||'',
        observaciones:c.observaciones||'',
        dims: c.dims || []
      };
      
      // ✅ COPIAR TODOS los supervisores dinámicos (supervisor2, supervisor3, etc.)
      // y sus correspondientes cargo y proceso
      for(var key in c){
        // Copiar TODAS las propiedades que empiecen con 'supervisor', 'supervisorCargo' o 'procesoSupervision'
        if(key.startsWith('supervisor') || 
           key.startsWith('procesoSupervision')){
          // Pero NO sobrescribir las ya mapeadas
          if(!(key in mapeado) && key !== 'supervisorAlt' && key !== 'supervisorAltCargo' && key !== 'procesoSupervisionAlt'){
            mapeado[key] = c[key] || '';
            console.log('  → Copiando supervisor dinámico:', key, '=', mapeado[key]);
          }
        }
      }
      
      console.log('✅ Contrato #' + (idx+1) + ' cargado con ' + Object.keys(mapeado).filter(k => k.startsWith('supervisor')).length + ' supervisores');
      return mapeado;
    });
  
  console.log('✅ Buffer de contratos actualizado:', window._cfContratosBuffer.length, 'contratos');
  window._cfCtrRender();
};

// ✅ NUEVO: Buffer de supervisores del tercero
if(!window._cfSupervisoresBuffer) window._cfSupervisoresBuffer = [];

// ✅ Agregar supervisor al tercero
window._cfAgregarSupervisorTercero = function(){
  var nombre = (document.getElementById('cf-sup-nombre')?.value||'').trim();
  var cargo = (document.getElementById('cf-sup-cargo')?.value||'').trim();
  var proceso = (document.getElementById('cf-sup-proceso')?.value||'').trim();
  var contrato = (document.getElementById('cf-sup-contrato')?.value||'').trim();
  
  if(!nombre){
    try{ showToast('⚠ Por favor ingresa el nombre del supervisor','error',2000); }catch(e){}
    document.getElementById('cf-sup-nombre')?.focus();
    return;
  }
  
  if(!cargo){
    try{ showToast('⚠ Por favor ingresa el cargo','error',2000); }catch(e){}
    document.getElementById('cf-sup-cargo')?.focus();
    return;
  }
  
  if(!proceso){
    try{ showToast('⚠ Por favor ingresa el proceso de supervisión','error',2000); }catch(e){}
    document.getElementById('cf-sup-proceso')?.focus();
    return;
  }
  
  if(!contrato){
    try{ showToast('⚠️ DEBES SELECCIONAR UN CONTRATO ASOCIADO','error',2500); }catch(e){}
    document.getElementById('cf-sup-contrato')?.focus();
    return;
  }
  
  if(!window._cfSupervisoresBuffer) window._cfSupervisoresBuffer = [];
  window._cfSupervisoresBuffer.push({nombre:nombre, cargo:cargo, proceso:proceso, contrato_asociado:contrato});
  
  // Limpiar inputs
  document.getElementById('cf-sup-nombre').value = '';
  document.getElementById('cf-sup-cargo').value = '';
  document.getElementById('cf-sup-proceso').value = '';
  document.getElementById('cf-sup-contrato').value = '';
  document.getElementById('cf-sup-nombre').focus();
  
  // Renderizar lista
  window._cfRenderSupervisoresTercero();
  
  try{ showToast('✅ Supervisor '+(window._cfSupervisoresBuffer.length)+' agregado con contrato','success',1800); }catch(e){}
  
  // ✅ Actualizar desplegable para próximo supervisor
  window.actualizarDesplegableContratos();
};

// ✅ Eliminar supervisor del tercero
window._cfEliminarSupervisorTercero = function(idx){
  if(!confirm('¿Eliminar este supervisor?')) return;
  if(!window._cfSupervisoresBuffer) return;
  window._cfSupervisoresBuffer.splice(idx, 1);
  window._cfRenderSupervisoresTercero();
  try{ showToast('✅ Supervisor eliminado','success',1500); }catch(e){}
};

// ✅ Renderizar lista de supervisores del tercero
window._cfRenderSupervisoresTercero = function(){
  var lista = document.getElementById('cf-supervisores-lista');
  if(!lista) return;
  
  var sups = window._cfSupervisoresBuffer || [];
  if(!sups.length){
    lista.innerHTML = '<div style="text-align:center;padding:16px 12px;font-size:12px;color:#a78bfa;font-style:italic;background:#f5f3ff;border:1px dashed #ddd6fe;border-radius:6px;">👇 Sin supervisores. Llena los campos arriba y haz clic en "➕ Agregar Supervisor"</div>';
    return;
  }
  
  lista.innerHTML = '<div style="font-weight:700;font-size:11px;color:#6b21a8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">'+sups.length+' Supervisor'+(sups.length!==1?'es':'')+' agregado'+(sups.length!==1?'s':'')+'</div>'
    + sups.map(function(s, i){
    return '<div style="background:linear-gradient(135deg,#f5f3ff 0%,#faf5ff 100%);border:2px solid #ddd6fe;border-radius:8px;padding:12px 14px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;transition:all 0.2s;">'
      +'<div style="flex:1;">'
      +'<div style="font-weight:800;font-size:13px;color:#7c3aed;margin-bottom:4px;">👤 Supervisor '+(i+1)+'</div>'
      +'<div style="background:white;padding:6px 10px;border-radius:4px;font-size:11px;color:#6b21a8;font-weight:600;margin-bottom:6px;border-left:3px solid #7c3aed;">'+esc(s.nombre)+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px;">'
      +'<div><span style="font-weight:600;color:#7c3aed;">Cargo:</span> <span style="color:#a855f7;">'+esc(s.cargo||'—')+'</span></div>'
      +'<div><span style="font-weight:600;color:#7c3aed;">Proceso:</span> <span style="color:#c084fc;">'+esc(s.proceso||'—')+'</span></div>'
      +'<div style="grid-column:1/-1;border-top:1px solid #e9d5ff;padding-top:6px;margin-top:6px;"><span style="font-weight:600;color:#7c3aed;">📋 Contrato:</span> <span style="color:#0d6efd;font-weight:700;">'+esc(s.contrato_asociado||'❌ Sin contrato')+'</span></div>'
      +'</div>'
      +'</div>'
      +'<button type="button" onclick="window._cfEliminarSupervisorTercero('+i+')" style="background:#fee2e2;border:1px solid #fca5a5;color:#dc2626;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;transition:all 0.2s;flex-shrink:0;" onmouseover="this.style.background=\'#fecaca\'" onmouseout="this.style.background=\'#fee2e2\'">🗑️ Quitar</button>'
      +'</div>';
  }).join('');
};

// ✅ NUEVO: Abrir modal para agregar supervisor desde Registros
window.clsAgregarSupervisorDesdeRegistros = function(nit){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9992;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;overflow-y:auto;';
  ov.onclick = function(e){if(e.target===ov)ov.remove();};
  
  ov.innerHTML = '<div style="background:white;border-radius:10px;width:550px;max-width:96vw;box-shadow:0 12px 50px rgba(0,0,0,.25);margin-bottom:40px;">'
    +'<div style="padding:14px 20px;background:#7c3aed;border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
    +'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">➕ Agregar Nuevo Supervisor</span>'
    +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
    +'<div style="padding:20px;max-height:60vh;overflow-y:auto;">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'
    +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Nombre Supervisor</label><input id="cls-reg-sup-nombre" placeholder="Nombre completo" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Cargo</label><input id="cls-reg-sup-cargo" placeholder="Ej: Gerente de Riesgos" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Proceso de Supervisión</label><input id="cls-reg-sup-proceso" placeholder="Ej: P-01, P-03, Control Interno" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'</div>'
    +'<div style="padding:14px;background:#f3e8ff;border-radius:6px;font-size:11px;color:#6b21a8;line-height:1.5;">'
    +'💡 <strong>Tip:</strong> El supervisor se agregará a la lista de supervisores del tercero. Podrás agregar más supervisores haciendo clic en el botón "➕ Agregar Supervisor" nuevamente.'
    +'</div>'
    +'<div style="padding-top:12px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e2e8f0;">'
    +'<button type="button" onclick="this.closest(\'[style*=inset]\').remove()" class="btn btn-outline" style="padding:8px 16px;border:1px solid #ddd6fe;background:white;color:#7c3aed;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
    +'<button type="button" onclick="window.clsGuardarSupervisorDesdeRegistros(\''+nit+'\');this.closest(\'[style*=inset]\').remove();" class="btn btn-primary" style="padding:8px 16px;background:#7c3aed;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">💾 Agregar</button>'
    +'</div></div>';
  
  document.body.appendChild(ov);
};

// ✅ NUEVO: Guardar supervisor desde Registros
window.clsGuardarSupervisorDesdeRegistros = function(nit){
  var nombre = (document.getElementById('cls-reg-sup-nombre')?.value||'').trim();
  var cargo = (document.getElementById('cls-reg-sup-cargo')?.value||'').trim();
  var proceso = (document.getElementById('cls-reg-sup-proceso')?.value||'').trim();
  
  if(!nombre){
    try{ showToast('⚠ Ingresa el nombre del supervisor','error',2000); }catch(e){}
    return;
  }
  
  var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
  var t = db[nit];
  if(!t) return;
  
  if(!t.supervisores) t.supervisores = [];
  t.supervisores.push({nombre:nombre, cargo:cargo, proceso:proceso});
  
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ showToast('✅ Supervisor agregado','success',2000); }catch(e){}
  try{ clsRender && clsRender(); }catch(e){}
};

// ✅ EDITAR SUPERVISOR DESDE REGISTROS
window.clsEditarSupervisorDesdeRegistros = function(nit, idx){
  var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
  var t = db[nit];
  if(!t || !t.supervisores || !t.supervisores[idx]) return;
  
  var sup = t.supervisores[idx];
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9992;display:flex;align-items:flex-start;justify-content:center;padding-top:40px;overflow-y:auto;';
  ov.onclick = function(e){if(e.target===ov)ov.remove();};
  
  ov.innerHTML = '<div style="background:white;border-radius:10px;width:550px;max-width:96vw;box-shadow:0 12px 50px rgba(0,0,0,.25);margin-bottom:40px;">'
    +'<div style="padding:14px 20px;background:#7c3aed;border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">'
    +'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:white;">✏️ Editar Supervisor</span>'
    +'<button onclick="this.closest(\'[style*=inset]\').remove()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0;">&times;</button></div>'
    +'<div style="padding:20px;max-height:60vh;overflow-y:auto;">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">'
    +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Nombre Supervisor</label><input id="cls-reg-sup-edit-nombre" value="'+esc(sup.nombre||'')+'" placeholder="Nombre completo" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'<div><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Cargo</label><input id="cls-reg-sup-edit-cargo" value="'+esc(sup.cargo||'')+'" placeholder="Ej: Gerente de Riesgos" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'<div style="grid-column:1/-1;"><label style="font-size:10px;color:#475569;font-weight:600;display:block;margin-bottom:4px;">Proceso de Supervisión</label><input id="cls-reg-sup-edit-proceso" value="'+esc(sup.proceso||'')+'" placeholder="Ej: P-01, P-03, Control Interno" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:5px;font-size:12px;font-family:inherit;background:white;"></div>'
    +'<div style="grid-column:1/-1;border:2px solid #7c3aed;border-radius:6px;padding:10px;background:#faf5ff;"><label style="font-size:10px;font-weight:700;color:#6d28d9;display:block;margin-bottom:3px;text-transform:uppercase;">📋 Contrato Asociado</label><input id="cls-reg-sup-edit-contrato" value="'+esc(sup.contrato_asociado||'')+'" placeholder="Contrato asociado" style="width:100%;padding:8px 10px;border:1px solid #d8b4fe;border-radius:5px;font-size:12px;font-family:inherit;background-color:#ffffff;color:#2c3e50;"></div>'
    +'</div>'
    +'<div style="padding-top:12px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e2e8f0;">'
    +'<button type="button" onclick="this.closest(\'[style*=inset]\').remove()" class="btn btn-outline" style="padding:8px 16px;border:1px solid #ddd6fe;background:white;color:#7c3aed;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
    +'<button type="button" onclick="window.clsGuardarEditarSupervisor(\''+nit+'\','+idx+');this.closest(\'[style*=inset]\').remove();" class="btn btn-primary" style="padding:8px 16px;background:#7c3aed;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">💾 Guardar</button>'
    +'</div></div>';
  document.body.appendChild(ov);
};

// ✅ GUARDAR EDICIÓN DE SUPERVISOR
window.clsGuardarEditarSupervisor = function(nit, idx){
  var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
  var t = db[nit];
  if(!t || !t.supervisores || !t.supervisores[idx]) return;
  
  var nombre = (document.getElementById('cls-reg-sup-edit-nombre')?.value||'').trim();
  var cargo = (document.getElementById('cls-reg-sup-edit-cargo')?.value||'').trim();
  var proceso = (document.getElementById('cls-reg-sup-edit-proceso')?.value||'').trim();
  var contrato = (document.getElementById('cls-reg-sup-edit-contrato')?.value||'').trim();
  
  if(!nombre){
    try{ showToast('⚠ Ingresa el nombre del supervisor','error',2000); }catch(e){}
    return;
  }
  
  t.supervisores[idx] = {nombre:nombre, cargo:cargo, proceso:proceso, contrato_asociado:contrato};
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ showToast('✅ Supervisor actualizado','success',1500); }catch(e){}
  try{ clsRender && clsRender(); }catch(e){}
};

// ✅ BORRAR SUPERVISOR DESDE REGISTROS
window.clsEliminarSupervisorDesdeRegistros = function(nit, idx){
  if(!confirm('¿Eliminar este supervisor?')) return;
  
  var db = typeof TERCEROS_DB !== 'undefined' ? TERCEROS_DB : {};
  var t = db[nit];
  if(!t || !t.supervisores || !t.supervisores[idx]) return;
  
  t.supervisores.splice(idx, 1);
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ showToast('✅ Supervisor eliminado','success',1500); }catch(e){}
  try{ clsRender && clsRender(); }catch(e){}
};

// ── Agregar Supervisor Adicional (2, 3, 4, etc.) ──
window._cfAgregarSupervisor = function(contratoIdx){
  try{
    console.log('>>> _cfAgregarSupervisor iniciado con índice:', contratoIdx);
    
    var buffer = window._cfContratosBuffer || [];
    var c = buffer[contratoIdx];
    
    if(!c){
      console.error('❌ Contrato no encontrado. Buffer length:', buffer.length, 'Índice:', contratoIdx);
      showToast('❌ Error: Contrato no encontrado','error',2000);
      return;
    }
    
    console.log('✅ Contrato encontrado:', c.num);
    
    // Paso 1: Si supervisorAlt no existe, créalo
    if(c.supervisorAlt === undefined){
      c.supervisorAlt = '';
      c.supervisorAltCargo = '';
      c.procesoSupervisionAlt = '';
      console.log('✅ Supervisor 2 (Alterno) creado');
      window._cfCtrPersistir && window._cfCtrPersistir();
      window._cfCtrRender && window._cfCtrRender();
      console.log('✅ Cambios persistidos y renderizados');
      return;
    }
    
    // Paso 2: Si supervisorAlt existe, busca crear supervisor2, supervisor3, etc.
    var n = 2;
    while(n < 20){
      if(c['supervisor'+n] === undefined){
        c['supervisor'+n] = '';
        c['supervisorCargo'+n] = '';
        c['procesoSupervision'+n] = '';
        console.log('✅ Supervisor '+(n+1)+' creado');
        break;
      }
      n++;
    }
    
    // Guardar y renderizar
    window._cfCtrPersistir && window._cfCtrPersistir();
    window._cfCtrRender && window._cfCtrRender();
    console.log('✅ Cambios persistidos y renderizados');
    
  }catch(e){
    console.error('❌ Error en _cfAgregarSupervisor:', e);
    showToast('❌ Error: '+e.message,'error',2000);
  }
};

// ── Ir al Paso 2 — Clasificación de Terceros (tras el registro) ──
// Marca el paso 2 en el wizard, preselecciona el tercero recién
// registrado y hace scroll hasta el selector de tipologías.
window._irPaso2Clasif = function(){
  try{ clsWizardSetStep(2); }catch(e){}
  try{
    var nit=((document.getElementById('cf-nit')||{}).value||'').trim();
    var sel=document.getElementById('cls-tip-tercero-sel');
    if(sel && nit){
      var existe=[].some.call(sel.options,function(o){return o.value===nit;});
      if(existe && sel.value!==nit){ sel.value=nit; try{ window._clasifSeleccionarTercero(nit); }catch(e2){} }
    }
  }catch(e){}
  var s=document.getElementById('cls-tip-tercero-sel')||document.getElementById('cf-dims-lista');
  if(s && s.scrollIntoView) s.scrollIntoView({behavior:'smooth',block:'center'});
};

// ── Siguiente paso desde el banner de clasificación ──────────────
// Flujo correcto: Clasificación → APROBACIÓN → Ambiente de Control.
// Si el tercero aún no está aprobado, lleva a Aprobación de Clasificación;
// si ya se aprobó, ahora sí lleva al cuestionario del Evaluador.
window.clsWizardSiguientePaso = function(){
  var nit = (typeof CLS_WIZARD_NIT!=='undefined' && CLS_WIZARD_NIT) ? CLS_WIZARD_NIT : ((document.getElementById('cf-nit')||{}).value||'');
  var t = (window.TERCEROS_DB||{})[nit];
  if(t && t.aprobado_clasif){
    if(window._irCuestionarioNit){ window._irCuestionarioNit(nit); } else { clsWizardIrCuest(); }
    return;
  }
  var navA=document.querySelector('.nav-item[onclick*="pg-aprobar-op"]');
  if(navA){ goPage(navA,'pg-aprobar-op'); }
  // goPage solo cambia de página (el mapa de renders vive en navTo) →
  // renderizar la tabla de Aprobación explícitamente
  setTimeout(function(){ try{ renderAprobarOp(); }catch(e){} }, 80);
  try{ showToast('Primero se aprueba la clasificación. Al habilitar el tercero podrás pasar al Ambiente de Control.','info',4000); }catch(e){}
};

window.clsWizardIrCuest = function(){
  // Navegar a Ambiente de Control
  var navQ = document.querySelector('.nav-item[onclick*="pg-cuestionario"]');
  if(navQ){ goPage(navQ,'pg-cuestionario'); }
  else {
    // fallback directo
    document.querySelectorAll('.page').forEach(function(p){ p.style.display='none'; });
    var pg = document.getElementById('pg-cuestionario');
    if(pg) pg.style.display='block';
  }
  setTimeout(function(){
    try{ sincronizarSelectorCuestionario(); }catch(e){}
    try{ poblarSelectorACTipologia && poblarSelectorACTipologia(); }catch(e){}
    // Auto-seleccionar el NIT en el cuestionario
    var sel = document.getElementById('q-tercero');
    if(sel && window.CLS_WIZARD_NIT){
      sel.value = window.CLS_WIZARD_NIT;
      try{ cargarCuestionarioTercero(); }catch(e){}
    }
  }, 300);
};

window._clsWizardIrCuestImpl = function(){
  var navQ=document.querySelector('.nav-item[onclick*="pg-cuestionario"]');
  if(navQ) goPage(navQ,'pg-cuestionario');
  setTimeout(function(){
    var sel=document.getElementById('q-tercero');
    if(sel&&CLS_WIZARD_NIT){ sel.value=CLS_WIZARD_NIT; try{cargarCuestionarioTercero();}catch(e){} }
  },200);
  clsWizardSetStep(3);
};
window._clsWizardReady = true;

// Init wizard on load
document.addEventListener('DOMContentLoaded', function(){ try{clsWizardSetStep(1);}catch(e){} });

// ════ REPORTES AC TAB ════
window._switchCuestTabExtendedImpl = function(tab){
  var panels=['cq-panel-instruc','cq-panel-cuest','cq-panel-reportes'];
  var tabs=['cq-tab-instruc','cq-tab-cuest','cq-tab-reportes'];
  panels.forEach(function(p){var el=document.getElementById(p);if(el)el.style.display='none';});
  tabs.forEach(function(t){var el=document.getElementById(t);if(el)el.classList.remove('active');});
  var panel=document.getElementById('cq-panel-'+tab);
  var tabEl=document.getElementById('cq-tab-'+tab);
  if(panel) panel.style.display='';
  if(tabEl)  tabEl.classList.add('active');
  if(tab==='reportes') renderReportesAC();
  if(tab==='cuest'){
    try{sincronizarSelectorCuestionario();}catch(e){}
    setTimeout(function(){
      var sel=document.getElementById('q-tercero');
      if(!sel) return;
      if(!sel.value && sel.options.length>1){ sel.value=sel.options[1].value; }
      if(sel.value){ try{cargarCuestionarioTercero();}catch(e){} }
    },120);
  }
  if(tab==='instruc'){
    try{sincronizarSelectorCuestionario();}catch(e){}
    setTimeout(function(){ try{window.acPoblarSelectorTerceroInstruc();}catch(e){} },80);
  }
};
window._switchCuestTabExtendedReady = true;
function switchCuestTabExtended(tab){
  var panels=['cq-panel-instruc','cq-panel-cuest','cq-panel-reportes'];
  var tabs=['cq-tab-instruc','cq-tab-cuest','cq-tab-reportes'];
  panels.forEach(function(p){var el=document.getElementById(p);if(el)el.style.display='none';});
  tabs.forEach(function(t){var el=document.getElementById(t);if(el)el.classList.remove('active');});
  var panel=document.getElementById('cq-panel-'+tab);
  var tabEl=document.getElementById('cq-tab-'+tab);
  if(panel) panel.style.display='';
  if(tabEl) tabEl.classList.add('active');
  if(tab==='reportes') try{renderReportesAC();}catch(e){}
  if(tab==='cuest'){
    try{sincronizarSelectorCuestionario();}catch(e){}
    // Auto-cargar cuestionario si hay tercero seleccionado o disponible
    setTimeout(function(){
      var sel=document.getElementById('q-tercero');
      if(!sel) return;
      if(!sel.value && sel.options.length>1){ sel.value=sel.options[1].value; }
      if(sel.value){ try{cargarCuestionarioTercero();}catch(e){} }
    },120);
  }
  } // cierre real de switchCuestTabExtended (antes faltaba esta llave)

// ─── SINCRONIZACIÓN ADMIN → EVALUADOR ────────────────────────
// Permite que el Admin exporte un .json con todos los datos del sistema
// y el Evaluador lo importe para ver los terceros, tipologías y datos
// sin necesidad de estar en el mismo navegador/equipo.
window.sgrtExportarEstado = function(){
  try{ window._lsSave && window._lsSave(); }catch(e){}
  var data = {
    version: 'sgrt_sync_v1',
    exportadoEn: new Date().toISOString(),
    exportadoPor: (window.currentUser||{}).name||'—',
    TERCEROS_DB:  window.TERCEROS_DB || {},
    CUEST_RESPUESTAS: window.CUEST_RESPUESTAS || {},
    RESULTADO_EVALUACION: window.RESULTADO_EVALUACION || {},
    MATRIZ_DB: window.MATRIZ_DB || [],
    TIPOLOGIAS_DB_CUSTOM: window.TIPOLOGIAS_DB_CUSTOM || {},
    TIP_NIVELES: window.TIP_NIVELES || {},
    INFORMES_DB: window.INFORMES_DB || {},
    NOTIF_LOG: (window.NOTIF_LOG||[]).slice(0,40)
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'SGRT_datos_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📦 Datos exportados — comparte el archivo con el Evaluador', 'success', 4000);
  sendNotification('seguimiento', 'Exportación de datos realizada',
    'Se exportó el estado completo del sistema para compartir con el Evaluador.',
    {Rol:(window.currentUser||{}).rol||'—'});
};
window.sgrtImportarEstado = function(inputEl){
  var file = inputEl.files && inputEl.files[0];
  if(!file){ return; }
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var data = JSON.parse(e.target.result);
      if(!data.version||!data.version.startsWith('sgrt_sync')){
        showToast('❌ El archivo no es un export válido del SGRT','error',3000); return;
      }
      if(data.TERCEROS_DB)  Object.assign(TERCEROS_DB, data.TERCEROS_DB);
      if(data.CUEST_RESPUESTAS) Object.assign(CUEST_RESPUESTAS, data.CUEST_RESPUESTAS);
      if(data.RESULTADO_EVALUACION) window.RESULTADO_EVALUACION = data.RESULTADO_EVALUACION;
      if(data.MATRIZ_DB && data.MATRIZ_DB.length){
        data.MATRIZ_DB.forEach(function(r){
          if(!MATRIZ_DB.find(function(x){return x.id===r.id;})) MATRIZ_DB.push(r);
          else { var ex=MATRIZ_DB.find(function(x){return x.id===r.id;}); Object.assign(ex,r); }
        });
        window.MATRIZ_DB = MATRIZ_DB;
      }
      if(data.TIPOLOGIAS_DB_CUSTOM) window.TIPOLOGIAS_DB_CUSTOM = data.TIPOLOGIAS_DB_CUSTOM;
      if(data.TIP_NIVELES)          window.TIP_NIVELES = data.TIP_NIVELES;
      if(data.INFORMES_DB)          window.INFORMES_DB = Object.assign(window.INFORMES_DB||{}, data.INFORMES_DB);
      if(data.NOTIF_LOG)            window.NOTIF_LOG = (window.NOTIF_LOG||[]).concat(data.NOTIF_LOG).slice(0,80);
      window.TERCEROS_DB = TERCEROS_DB;
      window.CUEST_RESPUESTAS = CUEST_RESPUESTAS;
      try{ window._lsSave && window._lsSave(); }catch(ex){}
      try{ window.renderNotifPanel && window.renderNotifPanel(); }catch(ex){}
      showToast('✅ Datos importados correctamente (exportados el '+new Date(data.exportadoEn||Date.now()).toLocaleDateString('es-CO')+')', 'success', 5000);
      sendNotification('seguimiento','Importación de datos realizada',
        'Datos importados desde archivo: exportados por '+(data.exportadoPor||'—'),
        {Fuente:file.name});
      // Refrescar la vista actual
      try{
        var pgActiva = document.querySelector('.page.active');
        if(pgActiva){
          var pgId = pgActiva.id;
          if(pgId==='pg-clasificacion') try{renderClasificacion();}catch(ex){}
          if(pgId==='pg-cuestionario')  try{renderReportesAC();}catch(ex){}
          if(pgId==='pg-matriz')        try{renderMatriz();}catch(ex){}
          if(pgId==='pg-seguimiento')   try{renderSeguimiento();}catch(ex){}
        }
      }catch(ex){}
    }catch(ex){
      showToast('❌ Error al leer el archivo: '+ex.message,'error',4000);
    }
    inputEl.value='';
  };
  reader.readAsText(file);
};
// ── Helpers Valoración del Control ──────────────────
function _calcCtrlValoracion(resp){
  // ── Fórmula exacta del Excel (R_Operacional, columnas Y-AD + M + N + O) ──
  // resp = {a1,a2,a3,a4,a5,a6,obs}
  //
  // Regla 1: No Aplica en a1 → todo NO APLICA
  if(!resp||resp.a1==='No Aplica'){
    return {pct:0,nivelCumpl:'NO APLICA',madurez:'NO APLICA',valorMad:null,color:'#6B7280',bgColor:'#F3F4F6'};
  }
  // Regla 2: No en a1 → control NO EXISTE
  if(!resp.a1||resp.a1==='No'){
    return {pct:0,nivelCumpl:'0%',madurez:'NO EXISTE',valorMad:0,color:'#6B7280',bgColor:'#F3F4F6'};
  }
  // ── Pesos por atributo (columnas Y-AD del Excel) ──
  // Y  a1: Si=0.15, Parcial=0.05, else 0
  // Z  a2: Si=0.10, else 0
  // AA a3: Si=0.10, else 0
  // AB a4: Si=0.15, else 0
  // AC a5: Si=0.20, else 0
  // AD a6: Si=0.15, else 0  (suma máxima 0.85 → se normaliza a 100%)
  var w1 = resp.a1==='Si'?0.15:(resp.a1==='Parcial'?0.05:0);
  var w2 = resp.a2==='Si'?0.10:0;
  var w3 = resp.a3==='Si'?0.10:0;
  var w4 = resp.a4==='Si'?0.15:0;
  var w5 = resp.a5==='Si'?0.20:0;
  var w6 = resp.a6==='Si'?0.15:0;
  // El cuestionario usa 6 atributos (hasta ¿Monitoreado?). Los pesos del
  // Excel para estos 6 suman 0.85, así que se NORMALIZA dividiendo por 0.85
  // para que con los 6 en "Sí" el cumplimiento sea 100% → OPTIMIZADO (5.0).
  var cumpl = Math.round(((w1+w2+w3+w4+w5+w6)/0.85)*100)/100; // 6 síes → 1.00

  // ── Nivel de Madurez (columna N del Excel) ──
  // 0.91–1.00 → OPTIMIZADO (5)
  // 0.71–0.90 → ADMINISTRADO (4)
  // 0.41–0.70 → DEFINIDO (3)
  // 0.21–0.40 → REPETIBLE (2)
  // 0.01–0.20 → INICIAL (1)
  // 0         → NO EXISTE (0)
  var madurez, valorMad, color, bgColor;
  if(cumpl>=0.91){ madurez='OPTIMIZADO';   valorMad=5; color='#15803D'; bgColor='#DCFCE7'; }
  else if(cumpl>=0.71){ madurez='ADMINISTRADO'; valorMad=4; color='#16A34A'; bgColor='#F0FDF4'; }
  else if(cumpl>=0.41){ madurez='DEFINIDO';     valorMad=3; color='#CA8A04'; bgColor='#FEFCE8'; }
  else if(cumpl>=0.21){ madurez='REPETIBLE';    valorMad=2; color='#EA580C'; bgColor='#FFF7ED'; }
  else if(cumpl>=0.01){ madurez='INICIAL';      valorMad=1; color='#DC2626'; bgColor='#FEF2F2'; }
  else                { madurez='NO EXISTE';    valorMad=0; color='#6B7280'; bgColor='#F3F4F6'; }

  // % de cumplimiento en escala 0-100
  var pct = Math.round(cumpl*100);
  return {pct:pct, nivelCumpl:pct+'%', madurez:madurez, valorMad:valorMad, color:color, bgColor:bgColor, cumplRaw:cumpl};
}

// ── Madurez de una TIPOLOGÍA completa (fila de totales del Excel, fila 16) ──
// = ROUND( AVERAGE( valorMad de cada control individual ), 1 )
// Luego se mapea con los mismos umbrales: ≥5→OPTIMIZADO, ≥4→ADMINISTRADO, etc.
// % cumplimiento = promedio / 5 × 100% (tabla Parámetros: valor/5)
window._calcMadurezTipologia = function(listaValores){
  // listaValores: array de valorMad (enteros 0-5, null=NO APLICA, se excluye)
  var validos = listaValores.filter(function(v){ return v!==null && !isNaN(v); });
  if(!validos.length) return {promedio:0,pct:0,madurez:'NO APLICA',color:'#6B7280',bgColor:'#F3F4F6'};
  var suma = validos.reduce(function(a,b){return a+b;},0);
  var avg  = Math.round(suma/validos.length*10)/10; // ROUND(AVERAGE, 1) exactamente como Excel
  var pct  = Math.round((avg/5)*100);
  var madurez,color,bgColor;
  if(avg===5)        { madurez='OPTIMIZADO';   color='#15803D'; bgColor='#DCFCE7'; }
  else if(avg>=4)    { madurez='ADMINISTRADO'; color='#16A34A'; bgColor='#F0FDF4'; }
  else if(avg>=3)    { madurez='DEFINIDO';     color='#CA8A04'; bgColor='#FEFCE8'; }
  else if(avg>=2)    { madurez='REPETIBLE';    color='#EA580C'; bgColor='#FFF7ED'; }
  else if(avg>=0.1)  { madurez='INICIAL';      color='#DC2626'; bgColor='#FEF2F2'; }
  else               { madurez='NO EXISTE';    color='#6B7280'; bgColor='#F3F4F6'; }
  return {promedio:avg, pct:pct, madurez:madurez, color:color, bgColor:bgColor};
};

function renderReportesAC(){
  var wrap=document.getElementById('cq-reportes-body'); if(!wrap) return;

  // Cargar datos persistidos antes de renderizar
  try{ window._lsLoad && window._lsLoad(); }catch(e){}
  // También leer de sgrt_terceros_db
  try{
    var _sv2=JSON.parse(localStorage.getItem('sgrt_terceros_db_shared')||'{}');
    if(Object.keys(_sv2).length) Object.assign(TERCEROS_DB, _sv2);
  }catch(e){}
  // Restaurar respuestas del cuestionario
  try{
    var _scr=JSON.parse(localStorage.getItem('sgrt_cuest_respuestas')||'{}');
    Object.keys(_scr).forEach(function(k){ if(!CUEST_RESPUESTAS[k]) CUEST_RESPUESTAS[k]=_scr[k]; });
  }catch(e){}

  var filTercero = window._rptFiltroNit || '';
  var filTip     = window._rptFiltroTip || '';

  // ── KPIs globales (SOLO si estado === Completado o Aprobado) ──────────────────────────────────
  var totalTerceros=0,totalControles=0,totalRespondidos=0,byTip={};
  var globalMadurezCount={OPTIMIZADO:0,ADMINISTRADO:0,DEFINIDO:0,REPETIBLE:0,INICIAL:0,'NO EXISTE':0,'NO APLICA':0};
  // ⭐ ITERAR SOBRE TERCEROS_DB EN VEZ DE CUEST_RESPUESTAS
  Object.keys(TERCEROS_DB||{}).forEach(function(nit){
    var t=TERCEROS_DB[nit]; if(!t) return;
    if(t.bloqueado) return;
    // ⭐ PERMITIR: Completado o Aprobado
    var estado = (t.estado || 'Sin iniciar');
    if(estado !== 'Completado' && !estado.toLowerCase().includes('aprob')) return;
    
    totalTerceros++;
    (t.dims||[]).forEach(function(d){
      var ctrls=window._ctrlsCuest?window._ctrlsCuest(nit,d.key):(CUESTIONARIO_CONTROLES[d.key]||[]);
      var resp=Object.keys((CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit][d.key])||{}).length;
      if(!byTip[d.key]) byTip[d.key]={nombre:window._nombreTipologia(d),total:0,respondidos:0,valoresMad:[],totalPct:0,madCount:{}};
      ctrls.forEach(function(c){
        var r=(CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit][d.key]&&CUEST_RESPUESTAS[nit][d.key][c.n])||{};
        var val=_calcCtrlValoracion(r);
        var a1=(r.a1||'');
        var estaRespondido = a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
        byTip[d.key].total++;
        if(estaRespondido){ byTip[d.key].respondidos++; totalRespondidos++; }
        // Acumular valorMad para promedio tipología (excluir NO APLICA)
        if(val.valorMad!==null) byTip[d.key].valoresMad.push(val.valorMad);
        byTip[d.key].totalPct+=val.pct;
        byTip[d.key].madCount[val.madurez]=(byTip[d.key].madCount[val.madurez]||0)+1;
        globalMadurezCount[val.madurez]=(globalMadurezCount[val.madurez]||0)+1;
      });
      totalControles+=ctrls.length;
    });
  });
  var pctG=totalControles>0?Math.round(totalRespondidos/totalControles*100):0;

  // ── KPI Cards (SOLO: Terceros evaluados y Nivel de Madurez Promedio) ─────────────────────────────────
  var html='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;">';
  var madurezPromedios = Object.values(byTip).map(function(t){ return t.valoresMad.reduce(function(a,b){return a+b;},0)/(t.valoresMad.length||1); });
  var madurezPromedio = Math.round((madurezPromedios.reduce(function(a,b){return a+b;},0)/(madurezPromedios.length||1))*100)/100;
  
  [{lbl:'Terceros Evaluados',val:totalTerceros,col:'var(--blue)',ico:'👥'},
   {lbl:'Nivel de Madurez Promedio',val:(madurezPromedio || 'N/A'),col:'var(--teal)',ico:'📊'}
  ].forEach(function(k){
    html+='<div style="background:white;border:1px solid var(--border);border-top:3px solid '+k.col+';border-radius:var(--r2);padding:14px 16px;position:relative;overflow:hidden;">'
      +'<div style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px;letter-spacing:.06em;">'+k.lbl+'</div>'
      +'<div style="font-family:Montserrat,sans-serif;font-size:28px;font-weight:800;color:'+k.col+';line-height:1;">'+k.val+'</div>'
      +'<div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:28px;opacity:.15;">'+k.ico+'</div></div>';
  });
  html+='</div>';
  
  // ─── NUEVA SECCIÓN: PROMEDIO POR CONTRATO ────────────────────────────
  var contratosPorPromedio = {};
  Object.keys(TERCEROS_DB||{}).forEach(function(nit){
    var t = TERCEROS_DB[nit];
    if(!t || !t.promPorContrato) return;
    Object.keys(t.promPorContrato).forEach(function(cnum){
      var pxc = t.promPorContrato[cnum];
      if(!contratosPorPromedio[cnum]){
        contratosPorPromedio[cnum] = {num:cnum, proms:[], zona:pxc.zona};
      }
      if(pxc.prom) contratosPorPromedio[cnum].proms.push(pxc.prom);
    });
  });
  
  var conProms = Object.values(contratosPorPromedio).map(function(c){
    return {num:c.num, promedio:c.proms.reduce(function(a,b){return a+b;},0)/c.proms.length, zona:c.zona};
  }).sort(function(a,b){return b.promedio - a.promedio;});
  
  if(conProms.length > 0){
    // Sección movida a Aprobación de Clasificación
  }
  
  
  var estadoCount = {
    'Sin iniciar': 0,
    'En progreso': 0,
    'Completado': 0
  };
  var totalTercerosTodos = 0;
  Object.keys(TERCEROS_DB||{}).forEach(function(nit){
    var t = TERCEROS_DB[nit];
    if(!t || t.bloqueado) return;
    totalTercerosTodos++;
    var est = (t.estado || 'Sin iniciar').toLowerCase();
    if(est.includes('completado')) estadoCount['Completado']++;
    else if(est.includes('progreso')) estadoCount['En progreso']++;
    else estadoCount['Sin iniciar']++;
  });
  var pctSinInic = totalTercerosTodos > 0 ? Math.round(estadoCount['Sin iniciar']/totalTercerosTodos*100) : 0;
  var pctEnProg  = totalTercerosTodos > 0 ? Math.round(estadoCount['En progreso']/totalTercerosTodos*100) : 0;
  var pctCompleto = totalTercerosTodos > 0 ? Math.round(estadoCount['Completado']/totalTercerosTodos*100) : 0;
  
  // ── TARJETAS DE DISTRIBUCIÓN POR ESTADO ──
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">';
  [
    {lbl:'Sin Iniciar',val:estadoCount['Sin iniciar'],pct:pctSinInic,col:'#dc2626',bg:'#fef2f2'},
    {lbl:'En Progreso',val:estadoCount['En progreso'],pct:pctEnProg,col:'#f97316',bg:'#fff7ed'},
    {lbl:'Completado',val:estadoCount['Completado'],pct:pctCompleto,col:'#16a34a',bg:'#f0fdf4'}
  ].forEach(function(k){
    html+='<div style="background:'+k.bg+';border:1px solid '+k.col+'44;border-radius:var(--r2);padding:12px 14px;text-align:center;">'
      +'<div style="font-size:10px;font-weight:700;color:'+k.col+';text-transform:uppercase;margin-bottom:6px;">'+k.lbl+'</div>'
      +'<div style="font-family:Montserrat,sans-serif;font-size:24px;font-weight:800;color:'+k.col+';line-height:1;">'+k.val+'</div>'
      +'<div style="font-size:12px;color:'+k.col+';font-weight:700;margin-top:4px;">'+k.pct+'%</div>'
      +'</div>';
  });
  html+='</div>';

  // ── ELIMINADA: Distribución de Madurez (no necesaria) ──

  // ── Cards por tercero ──────────────────────────────
  html+='<div style="margin-bottom:16px;">';
  html+='<div style="font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;color:var(--navy);margin-bottom:10px;">Progreso por Tercero</div>';
  // ── Filtro + listado compacto (escala a muchos terceros) ────────
  // Estado del filtro y de las filas expandidas (persiste entre re-renders)
  window._rptProgQ  = window._rptProgQ  || '';
  window._rptProgEst= window._rptProgEst|| '';
  window._rptProgExp= window._rptProgExp|| {};
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">'
    +'<input id="rpt-prog-buscar" type="text" placeholder="Buscar tercero por nombre o NIT..." value="'+String(window._rptProgQ).replace(/"/g,'&quot;')+'" oninput="window._rptProgFiltrar()" style="flex:1;min-width:200px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:inherit;">'
    +'<select id="rpt-prog-estado" onchange="window._rptProgFiltrar()" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:inherit;background:white;">'
    +'<option value="">Todos los estados</option>'
    +'<option value="completo"'+(window._rptProgEst==='completo'?' selected':'')+'>✅ Completo</option>'
    +'<option value="progreso"'+(window._rptProgEst==='progreso'?' selected':'')+'>🔄 En progreso</option>'
    +'<option value="pendiente"'+(window._rptProgEst==='pendiente'?' selected':'')+'>Sin iniciar</option>'
    +'</select></div>';
  var _qProg=(window._rptProgQ||'').toLowerCase();
  var _nMostrados=0,_nTotalProg=0;
  html+='<div style="display:flex;flex-direction:column;gap:8px;">';
  // ⭐ ITERAR SOBRE TERCEROS_DB EN VEZ DE CUEST_RESPUESTAS
  Object.keys(TERCEROS_DB||{}).forEach(function(nit){
    var t=TERCEROS_DB[nit]; if(!t) return;
    if(t.bloqueado) return;
    // ⭐ SOLO TERCEROS APROBADOS O COMPLETADOS
    var estado = (t.estado || 'Sin iniciar');
    if(estado !== 'Completado' && !estado.toLowerCase().includes('aprob')) return;
    
    _nTotalProg++;
    var dims=t.dims||[]; var tTotal=0,tResp=0;
    var todosValoresMad=[]; var madCountT={};
    dims.forEach(function(d){
      var ctrls=window._ctrlsCuest?window._ctrlsCuest(nit,d.key):(CUESTIONARIO_CONTROLES[d.key]||[]); tTotal+=ctrls.length;
      ctrls.forEach(function(c){
        var r=CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit][d.key]&&CUEST_RESPUESTAS[nit][d.key][c.n];
        var a1=(r&&r.a1)||'';
        var estaRespondido=a1==='Si'||a1==='No'||a1==='No Aplica'||a1==='Parcial';
        if(estaRespondido){
          tResp++;
          var val=_calcCtrlValoracion(r);
          if(val.valorMad!==null) todosValoresMad.push(val.valorMad);
          madCountT[val.madurez]=(madCountT[val.madurez]||0)+1;
        }
      });
    });
    var pct=tTotal>0?Math.round(tResp/tTotal*100):0;
    // Madurez total del tercero = promedio Excel de todos los valorMad
    var madTotal=window._calcMadurezTipologia(todosValoresMad);
    var barCol=pct>=80?'var(--green)':pct>=50?'var(--orange)':'var(--red)';
    var isFiltered=(filTercero===nit);
    var savedAt=CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit].__savedAt;
    var savedStr=savedAt?new Date(savedAt).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'}):'Sin guardar';
    // ── Aplicar filtro de búsqueda y estado ──
    var estadoT=pct===100?'completo':pct>0?'progreso':'pendiente';
    if(_qProg && (t.nombre||'').toLowerCase().indexOf(_qProg)===-1 && nit.toLowerCase().indexOf(_qProg)===-1) return;
    if(window._rptProgEst && estadoT!==window._rptProgEst) return;
    _nMostrados++;
    var safeN=nit.replace(/[^a-z0-9]/gi,'_');
    var abierto=!!window._rptProgExp[nit] || isFiltered;
    // ── Fila compacta: solo el avance; el detalle se abre con la flecha ──
    html+='<div style="background:white;border:'+(isFiltered?'2px solid var(--blue)':'1px solid var(--border)')+';border-radius:var(--r2);box-shadow:var(--shadow);overflow:hidden;">';
    html+='<div onclick="window._rptProgToggle(\''+nit+'\')" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;">';
    html+='<div style="width:38px;height:38px;border-radius:50%;background:'+barCol+';display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;color:white;flex-shrink:0;">'+pct+'%</div>';
    html+='<div style="flex:1;min-width:0;">'
      +'<div style="font-size:12.5px;font-weight:700;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+t.nombre+'</div>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-top:3px;">'
      +'<div style="flex:1;height:6px;background:var(--gray2);border-radius:4px;overflow:hidden;max-width:220px;"><div style="height:100%;width:'+pct+'%;background:'+barCol+';border-radius:4px;"></div></div>'
      +'<span style="font-size:10px;color:var(--muted);white-space:nowrap;">'+tResp+'/'+tTotal+'</span>'
      +'<span style="font-size:10px;color:var(--muted);white-space:nowrap;">'+dims.map(function(d){var key=d.key||''; return (window.SECCIONES_INFO&&window.SECCIONES_INFO[key])?window.SECCIONES_INFO[key].label:key;}).join(' · ')+'</span>'
      +'</div></div>';
    html+='<span class="chip '+(pct===100?'c-ok':pct>0?'c-rev':'c-pend')+'" style="font-size:10px;flex-shrink:0;">'+(pct===100?'Completo':pct>0?'En progreso':'Sin iniciar')+'</span>';
    html+='<span id="rpt-prog-arrow-'+safeN+'" style="font-size:12px;color:var(--muted);flex-shrink:0;">'+(abierto?'▲':'▼')+'</span>';
    html+='</div>';
    // ── Detalle expandible (tarjeta con resumen completo) ──
    html+='<div id="rpt-prog-det-'+safeN+'" style="display:'+(abierto?'block':'none')+';padding:10px 14px 14px;border-top:1px solid var(--gray2);">';
    html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;">';
    html+='<div style="text-align:center;padding:6px;background:var(--gray3);border-radius:6px;">'
      +'<div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:700;">Respondidos</div>'
      +'<div style="font-size:15px;font-weight:800;color:var(--navy);">'+tResp+'/'+tTotal+'</div></div>';
    html+='<div style="text-align:center;padding:6px;background:var(--gray3);border-radius:6px;">'
      +'<div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:700;">% Cumpl.</div>'
      +'<div style="font-size:15px;font-weight:800;color:'+(madTotal.pct>=80?'var(--green)':madTotal.pct>=50?'var(--orange)':'var(--red)')+';">'+madTotal.pct+'%</div></div>';
    html+='<div style="text-align:center;padding:6px;background:'+(madTotal.bgColor||'#F3F4F6')+';border-radius:6px;">'
      +'<div style="font-size:9px;color:var(--muted);text-transform:uppercase;font-weight:700;">Madurez</div>'
      +'<div style="font-size:10px;font-weight:800;color:'+(madTotal.color||'var(--muted)')+';">'+(madTotal.promedio!==undefined?madTotal.promedio+' — ':'')+madTotal.madurez+'</div></div>';
    html+='</div>';
    html+='<div style="font-size:10px;color:var(--muted);margin-bottom:8px;">🕐 '+savedStr+'</div>';
    // Detalle por tipología: nombre + puntaje clasificación + % AC
    if(dims.length){
      html+='<div style="margin-bottom:8px;"><div style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px;">Tipologías evaluadas</div>';
      dims.forEach(function(d){
        var dName=window._nombreTipologia(d);
        var dVal=parseFloat(d.val||0);
        var dColor=dVal>=4?'#dc3545':dVal>=3?'#fd7e14':dVal>=2?'#ffc107':'#28a745';
        var ctrls2=window._ctrlsCuest?window._ctrlsCuest(nit,d.key):(CUESTIONARIO_CONTROLES[d.key]||[]); var cResp=0;
        ctrls2.forEach(function(c){
          var r2=CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit][d.key]&&CUEST_RESPUESTAS[nit][d.key][c.n];
          if(r2&&r2.a1) cResp++;
        });
        var cPct=ctrls2.length>0?Math.round(cResp/ctrls2.length*100):0;
        html+='<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#fafafa;border:1px solid #eee;border-radius:4px;margin-bottom:3px;">'
          +'<span style="flex:1;font-size:10.5px;color:#374151;font-weight:600;">'+dName+'</span>'
          +'<span style="padding:1px 5px;border-radius:8px;font-size:9.5px;font-weight:700;color:white;background:'+dColor+';">'+dVal+'</span>'
          +'<span style="font-size:9.5px;color:#6c757d;white-space:nowrap;">AC: '+cPct+'%</span>'
          +'</div>';
      });
      html+='</div>';
    }
    // Informes subidos para este tercero — para irlos adjuntando progresivamente
    var informes = (window.INFORMES_DB && window.INFORMES_DB[nit]) || [];
    html+='<div style="margin-bottom:8px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
      +'<span style="font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;">📎 Informes ('+informes.length+')</span>'
      +'<label style="font-size:10px;color:#1e6bb8;cursor:pointer;font-weight:700;">+ Subir<input type="file" style="display:none;" onchange="subirInformeTercero(\''+nit+'\',this)" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"></label>'
      +'</div>';
    if(informes.length){
      html += informes.map(function(inf, ii){
        var fI = new Date(inf.fecha);
        var fechaStr = isNaN(fI.getTime())?'':fI.toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});
        return '<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#fafafa;border:1px solid #eee;border-radius:4px;margin-bottom:3px;">'
          +'<span style="font-size:13px;">📄</span>'
          +'<a href="'+inf.dataUrl+'" download="'+inf.name+'" style="flex:1;min-width:0;font-size:10.5px;color:#1e6bb8;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;">'+inf.name+'</a>'
          +'<span style="font-size:9px;color:#aaa;flex-shrink:0;">'+fechaStr+'</span>'
          +'<button onclick="eliminarInformeTercero(\''+nit+'\','+ii+')" style="flex-shrink:0;background:none;border:none;color:#dc3545;cursor:pointer;font-size:12px;" title="Eliminar">✕</button>'
          +'</div>';
      }).join('');
    } else {
      html += '<div style="font-size:10.5px;color:#bbb;font-style:italic;padding:4px 0;">Sin informes subidos aún</div>';
    }
    html += '</div>';
    if(isFiltered){
      html+='<button onclick="window._rptFiltroNit=\'\';renderReportesAC();" style="width:100%;padding:7px;background:var(--gray2);color:var(--navy);border:1px solid var(--border2);border-radius:var(--r);font-size:12px;font-weight:700;cursor:pointer;">✕ Quitar filtro</button>';
    } else {
      html+='<button onclick="rptFiltrarTercero(\''+nit+'\');" style="width:100%;padding:7px;background:var(--navy);color:white;border:none;border-radius:var(--r);font-size:12px;font-weight:700;cursor:pointer;">Ver detalle de valoración →</button>';
    }
    html+='</div>';
    html+='</div>';
  });
  if(!_nMostrados){
    html+='<div style="background:white;border:1px dashed var(--border);border-radius:var(--r2);padding:18px;text-align:center;color:var(--muted);font-size:12px;">'+(_nTotalProg?'Ningún tercero coincide con el filtro.':'Sin terceros con cuestionario aún.')+'</div>';
  }
  html+='</div></div>';

  // ── TABLA: Contratos Asociados (colapsable) ──────────────
  if(totalTerceros > 0){
    html+='<div class="card" style="margin-bottom:16px;">'
      +'<div class="card-hdr" onclick="var t=document.getElementById(\'rpt-contratos-tabla\');t.style.display=(t.style.display===\'none\'?\'block\':\'none\');this.querySelector(\'.rpt-chevron\').textContent=(t.style.display===\'none\'?\'▶\':\'▼\');return false;" style="cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;">'
      +'<h3 style="margin:0;">📋 Contratos Aprobados Asociados</h3>'
      +'<span class="rpt-chevron" style="font-size:14px;">▼</span>'
      +'</div>'
      +'<div class="card-body" id="rpt-contratos-tabla">'
      +'<div style="overflow-x:auto;">'
      +'<table style="width:100%;font-size:11px;border-collapse:collapse;">'
      +'<thead><tr style="background:var(--navy);color:white;">'
      +'<th style="padding:10px;text-align:left;border:1px solid #ddd;">NIT Tercero</th>'
      +'<th style="padding:10px;text-align:left;border:1px solid #ddd;">Nombre Tercero</th>'
      +'<th style="padding:10px;text-align:left;border:1px solid #ddd;">Contrato</th>'
      +'<th style="padding:10px;text-align:left;border:1px solid #ddd;">Objeto</th>'
      +'<th style="padding:10px;text-align:center;border:1px solid #ddd;">Valor (COP)</th>'
      +'</tr></thead>'
      +'<tbody>';
    var _contratosAgregados = {};
    Object.keys(TERCEROS_DB||{}).forEach(function(nit){
      var t = TERCEROS_DB[nit];
      if(!t) return;
      var estado = (t.estado || 'Sin iniciar');
      // ⭐ PERMITIR: Completado o Aprobado
      if(estado !== 'Completado' && !estado.toLowerCase().includes('aprob')) return;
      var cons = t.contratos || [];
      cons.forEach(function(c){
        var cKey = nit + '___' + (c.num||'');
        if(_contratosAgregados[cKey]) return; // Evitar duplicados
        _contratosAgregados[cKey] = true;
        var estadoLabel = (c.estado === 'Aprobado' ? '✅ Aprobado' : c.estado || '—');
        // Mostrar tipologías del tercero con NOMBRES COMPLETOS (sin abreviaciones)
        var tipologiasHtml = '';
        if(t.dims && t.dims.length){
          tipologiasHtml = t.dims.map(function(d){
            var key = d.key || '';
            var nom = (window.SECCIONES_INFO && window.SECCIONES_INFO[key]) ? window.SECCIONES_INFO[key].label : (d.nombre || key);
            return nom;
          }).join(', ');
        } else {
          tipologiasHtml = '—';
        }
        html+='<tr style="border-bottom:1px solid #eee;">'
          +'<td style="padding:8px 10px;border:1px solid #ddd;">'+nit+'</td>'
          +'<td style="padding:8px 10px;border:1px solid #ddd;"><strong>'+t.nombre+'</strong></td>'
          +'<td style="padding:8px 10px;border:1px solid #ddd;">'+( c.num||'s/n')+'</td>'
          +'<td style="padding:8px 10px;border:1px solid #ddd;font-size:10px;">'+( c.objeto||'—')+'</td>'
          +'<td style="padding:8px 10px;border:1px solid #ddd;text-align:right;">'+((c.valor>0)?'$ '+new Intl.NumberFormat('es-CO').format(c.valor):'—')+'</td>'
          +'</tr>';
      });
    });
    html+='</tbody></table></div>'
      +'</div></div>';
  }

  // ── (Eliminado a pedido) Bloque 'Resultados por Tipología — Nivel de
  //    Cumplimiento': el análisis se hace por TERCERO en el listado de
  //    'Progreso por Tercero' (buscador + filtro de estado + detalle). ──

  
  // Helper para filtrar contrato y actualizar contratoEval
  window.filterContratoReport = function(terceroNit, contratoNum){
    window._rptFiltroContrato = contratoNum;
    if(TERCEROS_DB[terceroNit]){
      TERCEROS_DB[terceroNit].contratoEval = contratoNum;
    }
    renderReportesAC();
  };
  // ── Tabla detallada con Valoración del Control ─────
  // Registro de observaciones para los botones "Ver detalle" (se
  // reinicia en cada render para que los índices siempre coincidan)
  window._obsDetalleReg = [];
  // Evidencias: la tarjeta SOLO aparece si hay archivos subidos
  // (sin evidencias no se muestra nada, para no estorbar).
  try{ if(window._rptEvidenciasFilas().length) html += window._rptEvidenciasCard(); }catch(e){}
  html+='<div id="rpt-tabla-wrap" class="card"><div class="card-hdr">'
    +'<h3>Valoración del Control — Detalle'+(filTercero&&TERCEROS_DB[filTercero]?' · '+TERCEROS_DB[filTercero].nombre:'')+'</h3>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">'
    +(filTercero?'<span style="padding:3px 10px;background:#EFF6FF;border:1px solid #93C5FD;border-radius:20px;font-size:11px;color:var(--blue);font-weight:600;">'+( TERCEROS_DB[filTercero]?TERCEROS_DB[filTercero].nombre:filTercero)+'</span>':'')
    // Filtro por CONTRATO — pestañas visibles cuando el tercero seleccionado tiene contratos
    +(function(){
      var t = filTercero ? (TERCEROS_DB[filTercero]||{}) : null;
      var cons = t && t.contratos ? t.contratos : [];
      if(!cons.length) return '';
      var sel = window._rptFiltroContrato||'';
      var btnBase = 'padding:4px 12px;border-radius:16px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;border:1px solid;';
      var btnOn   = btnBase+'background:#1e6bb8;color:white;border-color:#1e6bb8;';
      var btnOff  = btnBase+'background:white;color:#1e6bb8;border-color:#93C5FD;';
      var pestanas = '<button onclick="window._rptFiltroContrato=\'\';renderReportesAC()" style="'+(sel===''?btnOn:btnOff)+'">Todos</button>';
      cons.forEach(function(c,i){
        var num = c.num||'s/n';
        var lbl = 'Contrato '+(i+1);
        var esta = sel===num;
        var titulo = num+(c.objeto?' — '+c.objeto:'');
        pestanas += '<button onclick="window._rptFiltroContrato=\''+num.replace(/\'/g,"\\\\'")+'\')" title="'+titulo.replace(/"/g,'&quot;')+'" style="'+(esta?btnOn:btnOff)+'">'+lbl+' <span style="opacity:.75;font-weight:500;">('+num+')</span></button>';
      });
      return '<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;">'+pestanas+'</div>';
    })()
    +'<button class="btn btn-outline btn-xs" onclick="window._rptFiltroNit=\'\';window._rptFiltroTip=\'\';window._rptFiltroContrato=\'\';renderReportesAC()">Ver todos</button>'
    +'</div></div>'
    +'<div style="overflow-x:auto;max-height:600px;overflow-y:auto;">'
    +'<table style="width:100%;font-size:11.5px;border-collapse:collapse;">'
    +'<thead><tr style="background:var(--navy);color:white;position:sticky;top:0;z-index:1;">'
    +'<th style="padding:9px 10px;text-align:left;min-width:110px;">Tercero</th>'
    +'<th style="padding:9px 10px;text-align:left;min-width:90px;">Contrato</th>'
    +'<th style="padding:9px 10px;text-align:left;min-width:80px;">Tipología</th>'
    +'<th style="padding:9px 10px;text-align:left;min-width:180px;"># Control</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">1.¿Impl?</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">2.¿Doc?</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">3.¿Asig?</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">4.¿Divul?</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">5.¿Evid?</th>'
    +'<th style="padding:7px 8px;text-align:center;white-space:nowrap;">6.¿Mon?</th>'
    +'<th style="padding:7px 9px;text-align:center;min-width:70px;background:rgba(255,193,7,.25);">Nivel Cumpl.</th>'
    +'<th style="padding:7px 9px;text-align:center;min-width:90px;background:rgba(255,193,7,.25);">Nivel Madurez</th>'
    +'<th style="padding:7px 9px;text-align:center;min-width:60px;background:rgba(255,193,7,.25);">Val. Mad.</th>'
    +'<th style="padding:9px 10px;text-align:left;min-width:110px;">Observaciones</th>'
    +'</tr></thead><tbody>';
  var rowCount=0;
  Object.keys(CUEST_RESPUESTAS||{}).forEach(function(nit){
    if(nit.startsWith('__')) return;
    if(filTercero&&nit!==filTercero) return;
    // Filtro por contrato: si el tercero está en modo "por contrato",
    // solo mostrar los controles del contrato elegido (contratoEval).
    var filContrato = window._rptFiltroContrato || '';
    if(filContrato){
      var _t2 = TERCEROS_DB[nit]||{};
      if((_t2.contratoEval||'')!==filContrato) return;
    }
    var t=TERCEROS_DB[nit]; if(!t) return;
    (t.dims||[]).forEach(function(d){
      if(filTip&&d.key!==filTip) return;
      var ctrls=CUESTIONARIO_CONTROLES[d.key]||[];
      ctrls.forEach(function(c,ci){
        var resp=(CUEST_RESPUESTAS[nit]&&CUEST_RESPUESTAS[nit][d.key]&&CUEST_RESPUESTAS[nit][d.key][c.n])||{};
        var val=_calcCtrlValoracion(resp);
        var bg=rowCount%2===0?'white':'#FAFAFA';
        var cell=function(v){
          if(!v||v==='') return '<td style="padding:5px 8px;text-align:center;"><span style="color:#ccc;font-size:11px;">—</span></td>';
          var col=v==='Si'?'#16A34A':v==='No'?'#DC2626':v==='No Aplica'?'#9CA3AF':'#ccc';
          var bgc=v==='Si'?'#F0FDF4':v==='No'?'#FEF2F2':'#F9FAFB';
          var s=v==='Si'?'✓ Sí':v==='No'?'✗ No':v==='No Aplica'?'N/A':v;
          return '<td style="padding:5px 8px;text-align:center;"><span style="padding:2px 6px;border-radius:5px;background:'+bgc+';color:'+col+';font-weight:700;font-size:10px;white-space:nowrap;">'+s+'</span></td>';
        };
        // Celda de Nivel Cumplimiento Regulatorio
        var pctColor=val.pct>=80?'#16A34A':val.pct>=60?'#CA8A04':val.pct>=40?'#EA580C':val.pct>0?'#DC2626':'#9CA3AF';
        var pctBg=val.pct>=80?'#F0FDF4':val.pct>=60?'#FEFCE8':val.pct>=40?'#FFF7ED':val.pct>0?'#FEF2F2':'#F9FAFB';
        var nivelCumplCell='<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);">'
          +'<span style="padding:3px 7px;border-radius:10px;background:'+pctBg+';color:'+pctColor+';font-family:Montserrat,sans-serif;font-size:11.5px;font-weight:800;white-space:nowrap;">'+val.nivelCumpl+'</span>'
          +'<div style="height:3px;background:#E5E7EB;border-radius:2px;margin-top:3px;overflow:hidden;">'
          +'<div style="height:100%;width:'+val.pct+'%;background:'+pctColor+';border-radius:2px;"></div></div>'
          +'</td>';
        // Celda de Nivel Madurez
        var madCell='<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);">'
          +'<span style="padding:3px 7px;border-radius:10px;background:'+val.bgColor+';color:'+val.color+';font-size:10px;font-weight:700;white-space:nowrap;border:1px solid '+val.color+'44;">'+val.madurez+'</span>'
          +'</td>';
        // Celda Valoración del nivel de madurez (numérico)
        var valMadCell='<td style="padding:5px 8px;text-align:center;background:rgba(255,193,7,.07);">'
          +(val.valorMad>0?'<span style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:'+val.color+';">'+val.valorMad+'.0</span>':'<span style="color:#9CA3AF;">—</span>')
          +'</td>';
        html+='<tr style="background:'+bg+';border-bottom:1px solid #F3F4F6;">'
          +'<td style="padding:6px 10px;font-weight:600;font-size:11px;vertical-align:top;">'+(ci===0?'<span style="font-size:11.5px;color:var(--navy);">'+t.nombre+'</span>':'')+'</td>'
          +'<td style="padding:6px 8px;font-size:11px;vertical-align:top;">'+(function(){
            var cons = t.contratos || [];
            if(t.modoEval==='contrato' && t.contratoEval){
              var idx = cons.findIndex(function(c){ return c.num===t.contratoEval; });
              var etq = idx>=0 ? 'Contrato '+(idx+1) : t.contratoEval;
              return '<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-weight:700;background:#fef3c7;color:#78350f;border:1px solid #fde68a;white-space:nowrap;" title="'+t.contratoEval+'">'+etq+' ('+t.contratoEval+')</span>';
            }
            if(cons.length){
              return '<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-weight:700;background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;white-space:nowrap;">Todos los contratos</span>';
            }
            return '<span style="display:inline-block;padding:3px 8px;border-radius:6px;font-weight:700;background:#f3f4f6;color:#94a3b8;border:1px solid #e5e7eb;white-space:nowrap;">—</span>';
          })()+'</td>'
          +'<td style="padding:6px 8px;font-size:10.5px;color:var(--muted);vertical-align:top;max-width:140px;">'+(ci===0?'<span style="padding:2px 6px;background:#E8F0F8;color:var(--navy);border-radius:8px;font-weight:700;font-size:10px;display:inline-block;">'+window._nombreTipologia(d).toUpperCase()+'</span>':'')+'</td>'
          +'<td style="padding:6px 10px;max-width:200px;vertical-align:top;">'
          +'<div style="display:flex;align-items:flex-start;gap:5px;">'
          +'<span style="flex-shrink:0;font-size:9.5px;font-weight:700;background:var(--blue);color:white;padding:2px 6px;border-radius:8px;margin-top:1px;">#'+c.n+'</span>'
          +'<span style="font-size:11px;line-height:1.4;">'+(c.ctrl||c.req||'Control '+c.n)+'</span></div></td>'
          +cell(resp.a1)+cell(resp.a2)+cell(resp.a3)+cell(resp.a4)+cell(resp.a5)+cell(resp.a6)
          +nivelCumplCell+madCell+valMadCell
          +(function(){
            var obs=(resp.obs||'').toString().trim();
            // El botón "Ver detalle" va SIEMPRE: abre la ventana con el
            // control completo y sus observaciones (o "sin observaciones").
            window._obsDetalleReg = window._obsDetalleReg || [];
            var oIdx = window._obsDetalleReg.push({
              tercero: t.nombre||'', tip: window._nombreTipologia(d), ctrl: '#'+c.n+' '+(c.ctrl||c.req||''), obs: obs,
              contrato: (function(){
                if(t.modoEval==='contrato' && t.contratoEval){
                  var cons = t.contratos || [];
                  var idx = cons.findIndex(function(x){ return x.num===t.contratoEval; });
                  return (idx>=0 ? 'Contrato '+(idx+1)+' — ' : '')+'('+t.contratoEval+')';
                }
                var cons = t.contratos || [];
                if(cons.length) return 'Todos los contratos';
                return '—';
              })()
            }) - 1;
            var prev = obs ? (obs.length>40 ? obs.substring(0,40)+'…' : obs) : '';
            return '<td style="padding:5px 8px;font-size:10.5px;color:var(--muted);max-width:150px;">'
              +(prev?'<div style="font-style:italic;margin-bottom:3px;">'+prev+'</div>':'')
              +'<button onclick="window._verObsDetalle('+oIdx+')" style="padding:2px 8px;background:#e8f4ff;color:#1e6bb8;border:1px solid #93c5fd;border-radius:5px;font-size:9.5px;font-weight:700;cursor:pointer;font-family:inherit;">Ver detalle</button>'
              +'</td>';
          })()
          +'</tr>';
        rowCount++;
      });
    });
  });
  if(!rowCount) html+='<tr><td colspan="13" style="text-align:center;padding:24px;color:var(--muted);">Sin respuestas'+(filTercero?' para este tercero':'')+'. '+(filTercero?'<a href="#" onclick="window._rptFiltroNit=\'\';renderReportesAC();return false;">Ver todos →</a>':'Selecciona un tercero y responde su cuestionario para ver la valoración aquí.')+'</td></tr>';
  html+='</tbody></table></div></div>';
  wrap.innerHTML=html;
}

// ─── INFORMES POR TERCERO (Reportes AC) ───────────────────────
// Permite adjuntar informes/evidencias de avance progresivamente, sin
// esperar a tener el cuestionario 100% diligenciado.
window.subirInformeTercero = function(nit, inputEl){
  var file = inputEl.files && inputEl.files[0];
  if(!file) return;
  if(file.size > 4*1024*1024){
    showToast('El archivo es muy grande (máx. 4MB)','error',3000);
    inputEl.value='';
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e){
    window.INFORMES_DB = window.INFORMES_DB || {};
    if(!window.INFORMES_DB[nit]) window.INFORMES_DB[nit]=[];
    window.INFORMES_DB[nit].unshift({
      name: file.name, fecha: new Date().toISOString(),
      dataUrl: e.target.result, subidoPor: (window.currentUser||{}).name||'—'
    });
    try{ window._lsSave && window._lsSave(); }catch(err){}
    try{
      var t = TERCEROS_DB[nit];
      sendNotification('informe', 'Informe subido: '+file.name,
        (t&&t.nombre?t.nombre+' — ':'')+'Nuevo informe adjuntado',
        {'Tercero': (t&&t.nombre)||nit, 'Archivo': file.name});
    }catch(err){}
    showToast('📎 Informe "'+file.name+'" subido','success',2500);
    renderReportesAC();
  };
  reader.onerror = function(){ showToast('No se pudo leer el archivo','error',2500); };
  reader.readAsDataURL(file);
};
window.eliminarInformeTercero = function(nit, idx){
  if(!window.INFORMES_DB || !window.INFORMES_DB[nit]) return;
  window.INFORMES_DB[nit].splice(idx,1);
  try{ window._lsSave && window._lsSave(); }catch(e){}
  showToast('Informe eliminado','success',2000);
  renderReportesAC();
};

// ── Evidencias — lista de archivos estilo OneDrive ───────────────
// Muestra los Word, PDF, Excel e imágenes subidos en el cuestionario,
// con icono por tipo, tercero, control, fecha y visor al hacer clic.
window._evidReg = [];
window._rptEvidenciasFilas = function(){
  var filas=[];
  var db=window.TERCEROS_DB||{};
  // mapa nitKey (nit con _ ) → nombre del tercero
  var porKey={};
  Object.values(db).forEach(function(t){ if(t&&t.nit) porKey[String(t.nit).replace(/[^a-z0-9]/gi,'_')]=t.nombre||t.nit; });
  var EV = (typeof EVID_CUEST!=='undefined')?EVID_CUEST:{};
  Object.keys(EV).forEach(function(sk){
    var partes=sk.split('_');
    if(partes.length<3) return;
    var ctrlN=partes.pop(); var key=partes.pop(); var nitKey=partes.join('_');
    (EV[sk]||[]).forEach(function(ev){
      filas.push({ nombre:ev.name||'archivo', tipo:ev.type||'', size:ev.size||0,
        dataUrl:ev.dataUrl||'', fecha:ev.fecha||'',
        tercero: porKey[nitKey]||nitKey,
        ctx: (window._nombreTipologia?window._nombreTipologia({key:key}):key)+' · Control #'+ctrlN });
    });
  });
  return filas;
};
window._evidIcono = function(nombre, tipo){
  var ext=(nombre.split('.').pop()||'').toLowerCase();
  var m={ doc:['#185ABD','W'], docx:['#185ABD','W'], xls:['#107C41','X'], xlsx:['#107C41','X'],
    csv:['#107C41','X'], ppt:['#C43E1C','P'], pptx:['#C43E1C','P'], pdf:['#D93025','PDF'] };
  if(m[ext]) return m[ext];
  if((tipo||'').indexOf('image/')===0 || ['png','jpg','jpeg','gif','webp'].indexOf(ext)>=0) return ['#7C3AED','IMG'];
  return ['#6B7280', ext? ext.toUpperCase().substring(0,3) : 'DOC'];
};
window._rptEvidenciasCard = function(){
  var filas = window._rptEvidenciasFilas();
  window._evidReg = filas;
  var h='<div class="card"><div class="card-hdr"><h3>Evidencias</h3>'
    +'<div style="font-size:11px;color:var(--muted);">Documentos adjuntados en el cuestionario — clic en el nombre para ver o descargar</div></div>';
  if(!filas.length){
    h+='<div style="padding:18px;text-align:center;color:var(--muted);font-size:12px;">Sin evidencias adjuntadas aún. Se agregan desde el cuestionario con "Subir evidencia" en cada control.</div></div>';
    return h;
  }
  h+='<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">'
    +'<thead><tr style="border-bottom:1px solid var(--border2);color:#6c757d;text-align:left;">'
    +'<th style="padding:8px 10px;font-weight:600;">Nombre</th>'
    +'<th style="padding:8px 10px;font-weight:600;">Tercero</th>'
    +'<th style="padding:8px 10px;font-weight:600;">Control</th>'
    +'<th style="padding:8px 10px;font-weight:600;white-space:nowrap;">Modificado</th>'
    +'<th style="padding:8px 10px;font-weight:600;white-space:nowrap;">Tamaño</th>'
    +'</tr></thead><tbody>';
  filas.forEach(function(f, i){
    var ic=window._evidIcono(f.nombre, f.tipo);
    var fecha = f.fecha ? new Date(f.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : '—';
    var kb = f.size ? (f.size/1024>=1024 ? (f.size/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(f.size/1024))+' KB') : '—';
    h+='<tr style="border-bottom:1px solid #f1f3f5;" onmouseover="this.style.background=\'#f8f9fa\'" onmouseout="this.style.background=\'\'">'
      +'<td style="padding:7px 10px;"><div style="display:flex;align-items:center;gap:9px;">'
      +'<span style="width:26px;height:26px;border-radius:4px;background:'+ic[0]+';color:white;display:inline-flex;align-items:center;justify-content:center;font-size:'+(ic[1].length>1?'8px':'12px')+';font-weight:800;flex-shrink:0;">'+ic[1]+'</span>'
      +'<a href="javascript:void(0)" onclick="window._evidVer('+i+')" style="color:#1a3a5c;font-weight:600;text-decoration:none;">'+f.nombre+'</a>'
      +'</div></td>'
      +'<td style="padding:7px 10px;color:#374151;">'+f.tercero+'</td>'
      +'<td style="padding:7px 10px;color:#6c757d;font-size:11px;">'+f.ctx+'</td>'
      +'<td style="padding:7px 10px;color:#6c757d;white-space:nowrap;">'+fecha+'</td>'
      +'<td style="padding:7px 10px;color:#6c757d;white-space:nowrap;">'+kb+'</td>'
      +'</tr>';
  });
  h+='</tbody></table></div></div>';
  return h;
};
// ── Cargar una librería desde CDN una sola vez (para Word/Excel) ─
window._evidCargarLib = function(url, globalName){
  return new Promise(function(res, rej){
    if(window[globalName]) return res(window[globalName]);
    var existe = document.querySelector('script[data-lib="'+globalName+'"]');
    if(existe){ existe.addEventListener('load', function(){ res(window[globalName]); }); existe.addEventListener('error', rej); return; }
    var sc=document.createElement('script'); sc.src=url; sc.async=true; sc.dataset.lib=globalName;
    sc.onload=function(){ res(window[globalName]); };
    sc.onerror=function(){ rej(new Error('No se pudo cargar '+globalName+' desde CDN')); };
    document.head.appendChild(sc);
  });
};
// ── dataURL → ArrayBuffer (para pasar a mammoth/SheetJS) ─────────
window._evidDataUrlABuffer = function(dataUrl){
  var b64 = dataUrl.split(',')[1] || '';
  var bin = atob(b64); var len = bin.length;
  var ab = new ArrayBuffer(len); var v = new Uint8Array(ab);
  for(var i=0;i<len;i++) v[i]=bin.charCodeAt(i);
  return ab;
};
// Visor: imagen/PDF nativo, Word con mammoth.js, Excel con SheetJS, resto → descargar
window._evidVer = function(i){
  var f=(window._evidReg||[])[i]; if(!f||!f.dataUrl) return;
  var ext=(f.nombre.split('.').pop()||'').toLowerCase();
  var esImg=(f.tipo||'').indexOf('image/')===0||['png','jpg','jpeg','gif','webp'].indexOf(ext)>=0;
  var esPdf=ext==='pdf'||(f.tipo||'')==='application/pdf';
  var esWord=['doc','docx'].indexOf(ext)>=0;
  var esXls =['xls','xlsx','csv'].indexOf(ext)>=0;

  // Descargar directo: formatos que ningún visor local puede renderizar bien
  // (PowerPoint, ZIPs, .doc antiguo, etc.). Word/Excel/PDF/imagen sí se previsualizan.
  if(!esImg && !esPdf && !esWord && !esXls){
    var a=document.createElement('a'); a.href=f.dataUrl; a.download=f.nombre;
    document.body.appendChild(a); a.click(); a.remove();
    try{ showToast('Descargando '+f.nombre,'success',2000); }catch(e){}
    return;
  }

  var old=document.getElementById('modal-evid-ver'); if(old) old.remove();
  var ov=document.createElement('div');
  ov.id='modal-evid-ver';
  ov.style.cssText='position:fixed;inset:0;background:rgba(15,30,50,.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;';

  var contenido;
  if(esImg){
    contenido = '<div style="flex:1;overflow:auto;background:#525659;display:flex;align-items:center;justify-content:center;min-height:300px;">'
      +'<img src="'+f.dataUrl+'" style="max-width:100%;max-height:78vh;object-fit:contain;"></div>';
  } else if(esPdf){
    contenido = '<div style="flex:1;overflow:auto;background:#525659;display:flex;align-items:center;justify-content:center;min-height:300px;">'
      +'<iframe src="'+f.dataUrl+'" style="width:100%;height:78vh;border:none;background:white;"></iframe></div>';
  } else {
    // Word/Excel: contenedor con spinner mientras carga la librería y convierte
    contenido = '<div id="evid-vista" style="flex:1;overflow:auto;background:#f8f9fa;padding:0;min-height:400px;">'
      +'<div id="evid-loading" style="height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#6c757d;font-size:12.5px;">'
      +'<div style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#1a3a5c;border-radius:50%;animation:evidspin 0.9s linear infinite;"></div>'
      +'<div>Cargando visor…</div></div></div>'
      +'<style>@keyframes evidspin{to{transform:rotate(360deg);}}</style>';
  }

  ov.innerHTML='<div style="background:white;border-radius:10px;max-width:920px;width:100%;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.35);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #e5e7eb;">'
    +'<div style="font-size:13px;font-weight:700;color:#1a3a5c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+f.nombre+'</div>'
    +'<div style="display:flex;gap:8px;align-items:center;">'
    +'<a href="'+f.dataUrl+'" download="'+f.nombre+'" style="padding:5px 12px;background:#1a3a5c;color:white;border-radius:6px;font-size:11px;font-weight:700;text-decoration:none;">Descargar</a>'
    +'<button onclick="document.getElementById(\'modal-evid-ver\').remove()" style="background:none;border:none;font-size:16px;color:#6c757d;cursor:pointer;">✕</button>'
    +'</div></div>'
    + contenido
    +'</div>';
  ov.addEventListener('click',function(ev){ if(ev.target===ov) ov.remove(); });
  document.body.appendChild(ov);

  if(esWord){ window._evidRenderWord(f); }
  else if(esXls){ window._evidRenderXls(f); }
};

// ── Word (.docx) → HTML con mammoth.js (misma idea de Drive/OneDrive) ─
window._evidRenderWord = function(f){
  var vista = document.getElementById('evid-vista'); if(!vista) return;
  window._evidCargarLib('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js','mammoth')
    .then(function(m){
      var ab = window._evidDataUrlABuffer(f.dataUrl);
      return m.convertToHtml({arrayBuffer:ab});
    })
    .then(function(res){
      vista.innerHTML = '<div style="max-width:820px;margin:24px auto;padding:48px 60px;background:white;box-shadow:0 1px 3px rgba(0,0,0,.1);font-family:Calibri,Arial,sans-serif;font-size:14px;line-height:1.6;color:#222;">'
        + (res.value||'<i style="color:#9ca3af;">El documento está vacío o no se pudo convertir.</i>')
        + '</div>';
    })
    .catch(function(e){
      vista.innerHTML = '<div style="padding:36px;text-align:center;color:#6c757d;font-size:12.5px;">'
        +'<div style="font-weight:700;color:#1a3a5c;margin-bottom:6px;">No se pudo mostrar el documento</div>'
        +'<div>'+((e&&e.message)||'Formato no soportado por el visor local')+'. Usa el botón Descargar.</div></div>';
    });
};

// ── Excel (.xlsx/.xls/.csv) → tabla HTML con SheetJS ─────────────
window._evidRenderXls = function(f){
  var vista = document.getElementById('evid-vista'); if(!vista) return;
  window._evidCargarLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','XLSX')
    .then(function(XLSX){
      var wb = XLSX.read(window._evidDataUrlABuffer(f.dataUrl), {type:'array'});
      var tabs = wb.SheetNames.map(function(n,idx){
        return '<button data-sh="'+idx+'" onclick="window._evidXlsHoja('+idx+')" style="padding:5px 12px;background:'+(idx===0?'#1a3a5c':'#f1f3f5')+';color:'+(idx===0?'white':'#374151')+';border:none;border-bottom:2px solid '+(idx===0?'#1a3a5c':'transparent')+';font-size:11.5px;font-weight:'+(idx===0?'700':'500')+';cursor:pointer;font-family:inherit;">'+n+'</button>';
      }).join('');
      window._evidXlsWb = wb;
      vista.innerHTML = '<div style="border-bottom:1px solid #e5e7eb;background:white;padding:6px 12px 0;display:flex;gap:2px;overflow-x:auto;">'+tabs+'</div>'
        +'<div id="evid-xls-hoja" style="padding:16px 20px;background:white;overflow:auto;"></div>';
      window._evidXlsHoja(0);
    })
    .catch(function(e){
      vista.innerHTML = '<div style="padding:36px;text-align:center;color:#6c757d;font-size:12.5px;">'
        +'<div style="font-weight:700;color:#1a3a5c;margin-bottom:6px;">No se pudo mostrar la hoja</div>'
        +'<div>'+((e&&e.message)||'Formato no soportado')+'. Usa el botón Descargar.</div></div>';
    });
};
window._evidXlsHoja = function(idx){
  if(!window._evidXlsWb || !window.XLSX) return;
  var wb = window._evidXlsWb;
  var sh = wb.Sheets[wb.SheetNames[idx]];
  var html = window.XLSX.utils.sheet_to_html(sh, {editable:false});
  // Estilo tipo hoja de cálculo
  html = html.replace('<table', '<table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:12px;"')
             .replace(/<td/g, '<td style="border:1px solid #e5e7eb;padding:4px 8px;min-width:60px;"')
             .replace(/<tr>/g, '<tr style="background:#fff;">');
  var wrap = document.getElementById('evid-xls-hoja');
  if(wrap) wrap.innerHTML = html;
  // Activar la pestaña seleccionada
  document.querySelectorAll('#modal-evid-ver [data-sh]').forEach(function(b){
    var act = String(b.dataset.sh)===String(idx);
    b.style.background = act?'#1a3a5c':'#f1f3f5';
    b.style.color = act?'white':'#374151';
    b.style.borderBottomColor = act?'#1a3a5c':'transparent';
    b.style.fontWeight = act?'700':'500';
  });
};

// ── Modal "Ver detalle" de una observación del auditor ───────────
window._verObsDetalle = function(idx){
  var reg = (window._obsDetalleReg||[])[idx];
  if(!reg) return;
  var old=document.getElementById('modal-obs-detalle'); if(old) old.remove();
  var ov=document.createElement('div');
  ov.id='modal-obs-detalle';
  ov.style.cssText='position:fixed;inset:0;background:rgba(15,30,50,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
  var esc=function(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  ov.innerHTML='<div style="background:white;border-radius:12px;max-width:560px;width:100%;max-height:80vh;overflow-y:auto;padding:20px 22px;box-shadow:0 20px 50px rgba(0,0,0,.3);">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;">'
    +'<div style="font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;color:#1a3a5c;">Detalle del Control</div>'
    +'<button onclick="document.getElementById(\'modal-obs-detalle\').remove()" style="background:none;border:none;font-size:16px;color:#6c757d;cursor:pointer;">✕</button>'
    +'</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">'
    +'<span style="padding:3px 10px;background:#EFF6FF;border:1px solid #93C5FD;border-radius:12px;font-size:10.5px;color:#1e6bb8;font-weight:700;">🏢 '+esc(reg.tercero)+'</span>'
    +'<span style="padding:3px 10px;background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;font-size:10.5px;color:#78350f;font-weight:700;">📋 '+esc(reg.contrato)+'</span>'
    +'<span style="padding:3px 10px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;font-size:10.5px;color:#166534;font-weight:700;">'+esc(reg.tip)+'</span>'
    +'</div>'
    +'<div style="font-size:11.5px;font-weight:700;color:#374151;margin-bottom:10px;line-height:1.4;">'+esc(reg.ctrl)+'</div>'
    +'<div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 14px;font-size:12.5px;color:#374151;line-height:1.6;white-space:pre-wrap;">📝 <b>Observaciones:</b><br>'+(reg.obs?esc(reg.obs):'<i style=\'color:#9ca3af;\'>Sin observaciones registradas para este control.</i>')+'</div>'
    +'</div>';
  ov.addEventListener('click',function(ev){ if(ev.target===ov) ov.remove(); });
  document.body.appendChild(ov);
};

// ── Progreso por Tercero: expandir/colapsar detalle y filtrar ────
window._rptProgToggle = function(nit){
  window._rptProgExp = window._rptProgExp || {};
  window._rptProgExp[nit] = !window._rptProgExp[nit];
  var safeN = nit.replace(/[^a-z0-9]/gi,'_');
  var det = document.getElementById('rpt-prog-det-'+safeN);
  var ar  = document.getElementById('rpt-prog-arrow-'+safeN);
  if(det) det.style.display = window._rptProgExp[nit] ? 'block' : 'none';
  if(ar)  ar.textContent    = window._rptProgExp[nit] ? '▲' : '▼';
};
window._rptProgFiltrar = function(){
  var q = document.getElementById('rpt-prog-buscar');
  var e = document.getElementById('rpt-prog-estado');
  window._rptProgQ  = q ? q.value : '';
  window._rptProgEst= e ? e.value : '';
  clearTimeout(window._rptProgFiltroT);
  window._rptProgFiltroT = setTimeout(function(){
    renderReportesAC();
    // Restaurar el foco y el cursor al final para seguir escribiendo
    setTimeout(function(){
      var q2 = document.getElementById('rpt-prog-buscar');
      if(q2){ q2.focus(); var v=q2.value; q2.value=''; q2.value=v; }
    }, 30);
  }, 250);
};

function rptFiltrarTercero(nit){
  window._rptFiltroNit = nit;
  window._rptFiltroTip = '';
  renderReportesAC();
  setTimeout(function(){
    var t=document.getElementById('rpt-tabla-wrap');
    if(t) t.scrollIntoView({behavior:'smooth',block:'start'});
  },150);
}


// ════════════════════════════════════════════════════
// PERSONALIZAR CUESTIONARIO AC
// ════════════════════════════════════════════════════
var _persHiddenControls = {}; // { 'nit_key': [n1, n2, ...] }
window._persHiddenControls = _persHiddenControls; // compartido con _lsSave/_lsLoad y _ctrlsCuest

function togglePersonalizar(){
  var body = document.getElementById('personalizar-body');
  var arr  = document.getElementById('personalizar-arr');
  if(!body) return;
  var isOpen = body.style.display !== 'none' && body.style.display !== '';
  body.style.display = isOpen ? 'none' : 'block';
  if(arr) arr.textContent = isOpen ? '▼' : '▲';
  if(!isOpen) persCargarTipologia();
}

function persCargarTipologia(){
  var key   = (document.getElementById('pers-tip-sel') || {}).value || '';
  var wrap  = document.getElementById('pers-preguntas-wrap');
  var badge = document.getElementById('pers-count-badge');
  if(!wrap) return;
  if(!key){
    wrap.innerHTML = '<div style="color:var(--muted);font-size:12px;font-style:italic;padding:8px 0;">Selecciona una tipología para ver sus preguntas.</div>';
    if(badge) badge.textContent = '';
    return;
  }

  var nit  = (document.getElementById('q-tercero') || {}).value || '__global__';
  var hKey = nit + '_' + key;
  var hidden      = _persHiddenControls[hKey] || [];
  // Base = controles activos según la config global del Admin (Controles AC)
  var baseControls= window._getControlesConf ? window._getControlesConf(key) : (CUESTIONARIO_CONTROLES[key] || []);
  if(!window.CUEST_CTRL_CUSTOM) window.CUEST_CTRL_CUSTOM = {};
  var customControls = (CUEST_CTRL_CUSTOM[nit] && CUEST_CTRL_CUSTOM[nit][key]) || [];
  var totalVisible   = baseControls.filter(function(c){ return !hidden.includes(c.n); }).length + customControls.length;

  if(badge) badge.textContent = totalVisible + ' activa' + (totalVisible !== 1 ? 's' : '') + ' / ' + (baseControls.length + customControls.length) + ' total';

  var rows = '';

  // Base controls
  if(baseControls.length){
    rows += '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;padding:6px 0 4px;">Preguntas base (' + baseControls.length + ')</div>';
    baseControls.forEach(function(c){
      var isHidden = hidden.includes(c.n);
      rows += '<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 12px;background:' + (isHidden ? '#FFF1F1' : 'var(--gray3)') + ';border:1px solid ' + (isHidden ? '#FECACA' : 'var(--border)') + ';border-radius:var(--r);margin-bottom:4px;opacity:' + (isHidden ? '0.65' : '1') + ';">';
      rows += '<div style="flex:1;min-width:0;">';
      rows += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">';
      rows += '<span style="font-size:10px;font-weight:700;background:var(--blue);color:white;padding:1px 6px;border-radius:8px;">#' + c.n + '</span>';
      if(c.ctrl) rows += '<span style="font-size:10.5px;color:var(--muted);">' + c.ctrl + '</span>';
      if(isHidden) rows += '<span style="font-size:10px;color:var(--red);font-weight:700;background:#FEE2E2;padding:1px 6px;border-radius:6px;">OCULTA</span>';
      rows += '</div>';
      rows += '<div style="font-size:12px;color:var(--text);line-height:1.4;">' + (c.req || '') + '</div>';
      rows += '</div>';
      if(isHidden){
        rows += '<button data-key="' + key + '" data-n="' + c.n + '" class="_pers-restaurar" style="padding:4px 10px;background:#F0FDF4;border:1px solid #86EFAC;color:var(--green);border-radius:var(--r);font-size:11px;cursor:pointer;white-space:nowrap;font-weight:700;flex-shrink:0;">↩ Restaurar</button>';
      } else {
        rows += '<button data-key="' + key + '" data-n="' + c.n + '" class="_pers-ocultar" style="padding:4px 10px;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);border-radius:var(--r);font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0;">✕ Ocultar</button>';
      }
      rows += '</div>';
    });
  }

  // Custom controls
  if(customControls.length){
    rows += '<div style="font-size:11px;font-weight:700;color:var(--green);text-transform:uppercase;letter-spacing:.05em;padding:10px 0 4px;">Preguntas personalizadas (' + customControls.length + ')</div>';
    customControls.forEach(function(c, idx){
      rows += '<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 12px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:var(--r);margin-bottom:4px;">';
      rows += '<div style="flex:1;min-width:0;">';
      rows += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">';
      rows += '<span style="font-size:10px;font-weight:700;background:var(--green);color:white;padding:1px 6px;border-radius:8px;">P' + (idx+1) + '</span>';
      if(c.ctrl) rows += '<span style="font-size:10.5px;color:var(--muted);">' + c.ctrl + '</span>';
      rows += '</div>';
      rows += '<div style="font-size:12px;color:var(--text);line-height:1.4;">' + (c.req || '') + '</div>';
      rows += '</div>';
      rows += '<button data-key="' + key + '" data-idx="' + idx + '" class="_pers-quitar" style="padding:4px 10px;background:#FEF2F2;border:1px solid #FECACA;color:var(--red);border-radius:var(--r);font-size:11px;cursor:pointer;white-space:nowrap;font-weight:700;flex-shrink:0;">✕ Quitar</button>';
      rows += '</div>';
    });
  }

  if(!baseControls.length && !customControls.length){
    rows = '<div class="alert al-b" style="font-size:12px;">Sin preguntas base para esta tipología. Agrega una abajo.</div>';
  }

  wrap.innerHTML = rows;

  // Attach events via delegation
  wrap.querySelectorAll('._pers-ocultar').forEach(function(btn){
    btn.addEventListener('click', function(){
      var k = btn.getAttribute('data-key');
      var n = parseInt(btn.getAttribute('data-n'));
      var nit2 = (document.getElementById('q-tercero') || {}).value || '__global__';
      var hk = nit2 + '_' + k;
      if(!_persHiddenControls[hk]) _persHiddenControls[hk] = [];
      if(!_persHiddenControls[hk].includes(n)) _persHiddenControls[hk].push(n);
      persCargarTipologia();
      try{ window._lsSave && window._lsSave(); }catch(e){}
      try{ if((document.getElementById('q-tercero')||{}).value) cargarCuestionarioTercero(); }catch(e){}
      showToast('Pregunta #' + n + ' ocultada', 'success', 2000);
    });
  });
  wrap.querySelectorAll('._pers-restaurar').forEach(function(btn){
    btn.addEventListener('click', function(){
      var k = btn.getAttribute('data-key');
      var n = parseInt(btn.getAttribute('data-n'));
      var nit2 = (document.getElementById('q-tercero') || {}).value || '__global__';
      var hk = nit2 + '_' + k;
      if(_persHiddenControls[hk]) _persHiddenControls[hk] = _persHiddenControls[hk].filter(function(x){ return x !== n; });
      persCargarTipologia();
      try{ window._lsSave && window._lsSave(); }catch(e){}
      try{ if((document.getElementById('q-tercero')||{}).value) cargarCuestionarioTercero(); }catch(e){}
      showToast('Pregunta #' + n + ' restaurada', 'success', 2000);
    });
  });
  wrap.querySelectorAll('._pers-quitar').forEach(function(btn){
    btn.addEventListener('click', function(){
      var k   = btn.getAttribute('data-key');
      var idx2= parseInt(btn.getAttribute('data-idx'));
      var nit2= (document.getElementById('q-tercero') || {}).value || '__global__';
      if(!window.CUEST_CTRL_CUSTOM) window.CUEST_CTRL_CUSTOM = {};
      if(CUEST_CTRL_CUSTOM[nit2] && CUEST_CTRL_CUSTOM[nit2][k]){
        CUEST_CTRL_CUSTOM[nit2][k].splice(idx2, 1);
      }
      persCargarTipologia();
      try{ window._lsSave && window._lsSave(); }catch(e){}
      try{ if((document.getElementById('q-tercero')||{}).value) cargarCuestionarioTercero(); }catch(e){}
      showToast('Pregunta personalizada eliminada', 'success', 2000);
    });
  });
}

function persAgregarPregunta(){
  var key  = (document.getElementById('pers-tip-sel') || {}).value;
  var req  = ((document.getElementById('pers-new-req') || {}).value || '').trim();
  var doc  = ((document.getElementById('pers-new-doc') || {}).value || '').trim();
  var ctrl = ((document.getElementById('pers-new-ctrl') || {}).value || '').trim();
  if(!key){ showToast('Selecciona una tipología primero', 'error', 2000); return; }
  if(!req){ showToast('Escribe la pregunta del control', 'error', 2000); return; }
  var nit = (document.getElementById('q-tercero') || {}).value || '__global__';
  if(!window.CUEST_CTRL_CUSTOM) window.CUEST_CTRL_CUSTOM = {};
  if(!CUEST_CTRL_CUSTOM[nit]) CUEST_CTRL_CUSTOM[nit] = {};
  if(!CUEST_CTRL_CUSTOM[nit][key]) CUEST_CTRL_CUSTOM[nit][key] = [];
  var base = (CUESTIONARIO_CONTROLES[key] || []).length;
  var cust = CUEST_CTRL_CUSTOM[nit][key].length;
  CUEST_CTRL_CUSTOM[nit][key].push({ n: base + cust + 1, ctrl: ctrl || 'Control personalizado', req: req, doc: doc });
  ['pers-new-req','pers-new-doc','pers-new-ctrl'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  persCargarTipologia();
  try{ window._lsSave && window._lsSave(); }catch(e){}
  try{ if((document.getElementById('q-tercero')||{}).value) cargarCuestionarioTercero(); }catch(e){}
  showToast('Pregunta agregada a ' + key.toUpperCase(), 'success', 2000);
}

// ── PERSONALIZAR TABS ──────────────────────────────────────────
function persTab(tab){
  var tabs=['preguntas','valoracion'];
  tabs.forEach(function(t){
    var panel=document.getElementById('pers-panel-'+t);
    var btn=document.getElementById('pers-tab-'+t);
    if(panel) panel.style.display = t===tab ? 'block' : 'none';
    if(btn){
      if(t===tab){
        btn.style.background='white'; btn.style.color='var(--navy)'; btn.style.fontWeight='700';
        btn.style.boxShadow='0 1px 4px rgba(0,0,0,.1)';
      } else {
        btn.style.background='transparent'; btn.style.color='var(--muted)'; btn.style.fontWeight='600';
        btn.style.boxShadow='none';
      }
    }
  });
  if(tab==='valoracion') persRenderValoracion();
}

// ── UMBRALES Y NOMBRES PERSONALIZABLES ─────────────────────────
// Default thresholds: {nivel, label, minPct, color, bg, valor}
var PERS_UMBRALES_DEFAULT = [
  {nivel:'OPTIMIZADO',  minPct:100, valor:5, color:'#15803D', bg:'#DCFCE7'},
  {nivel:'GESTIONADO',  minPct:80,  valor:4, color:'#16A34A', bg:'#F0FDF4'},
  {nivel:'DEFINIDO',    minPct:60,  valor:3, color:'#CA8A04', bg:'#FEFCE8'},
  {nivel:'REPETIBLE',   minPct:40,  valor:2, color:'#EA580C', bg:'#FFF7ED'},
  {nivel:'INICIAL',     minPct:1,   valor:1, color:'#DC2626', bg:'#FEF2F2'},
  {nivel:'INEXISTENTE', minPct:0,   valor:0, color:'#6B7280', bg:'#F3F4F6'}
];
// Deep copy for user edits
var PERS_UMBRALES = JSON.parse(JSON.stringify(PERS_UMBRALES_DEFAULT));

var PERS_ATRIBS_DEFAULT = ['1.¿Implementado?','2.¿Documentado?','3.¿Asignado?','4.¿Divulgado?','5.¿Evidencia?','6.¿Monitoreado?'];
var PERS_ATRIBS = PERS_ATRIBS_DEFAULT.slice();

function persRenderValoracion(){
  _persRenderUmbrales();
  _persRenderPreview();
  _persRenderAtribs();
}

function _persRenderUmbrales(){
  var wrap=document.getElementById('pers-umbrales-wrap'); if(!wrap) return;
  var html='';
  PERS_UMBRALES.forEach(function(u,i){
    if(u.nivel==='INEXISTENTE') return; // always 0, not editable
    html+='<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:'+u.bg+';border:1px solid '+u.color+'44;border-radius:8px;">';
    html+='<span style="min-width:90px;font-size:11.5px;font-weight:800;color:'+u.color+';">'+u.nivel+'</span>';
    html+='<span style="font-size:11px;color:var(--muted);">≥</span>';
    html+='<input type="number" id="umb-pct-'+i+'" min="0" max="100" value="'+u.minPct+'" oninput="_persPreviewUpdate()"'
      +' style="width:64px;padding:5px 8px;border:1px solid '+u.color+'66;border-radius:6px;font-size:12.5px;font-weight:700;color:'+u.color+';text-align:center;font-family:inherit;">';
    html+='<span style="font-size:11px;color:var(--muted);">% &nbsp;→ Valor:</span>';
    html+='<input type="number" id="umb-val-'+i+'" min="0" max="5" value="'+u.valor+'" oninput="_persPreviewUpdate()"'
      +' style="width:52px;padding:5px 8px;border:1px solid '+u.color+'66;border-radius:6px;font-size:12.5px;font-weight:700;color:'+u.color+';text-align:center;font-family:inherit;">';
    html+='</div>';
  });
  wrap.innerHTML=html;
}

function _persPreviewUpdate(){
  // Rebuild PERS_UMBRALES from inputs (not saved yet, just preview)
  var tmpU=JSON.parse(JSON.stringify(PERS_UMBRALES));
  tmpU.forEach(function(u,i){
    if(u.nivel==='INEXISTENTE') return;
    var pEl=document.getElementById('umb-pct-'+i);
    var vEl=document.getElementById('umb-val-'+i);
    if(pEl) u.minPct=parseInt(pEl.value)||0;
    if(vEl) u.valor=parseFloat(vEl.value)||0;
  });
  _persRenderPreviewWith(tmpU);
}

function _persRenderPreview(){ _persRenderPreviewWith(PERS_UMBRALES); }

function _persRenderPreviewWith(umbrales){
  var wrap=document.getElementById('pers-preview-escala'); if(!wrap) return;
  // Show a row for each 20% band
  var bands=[0,17,33,50,67,83,100];
  var html='<div style="display:flex;flex-direction:column;gap:4px;">';
  bands.forEach(function(pct){
    var nivel='INEXISTENTE'; var color='#6B7280'; var bg='#F3F4F6'; var val=0;
    for(var i=0;i<umbrales.length;i++){
      if(pct>=umbrales[i].minPct){ nivel=umbrales[i].nivel; color=umbrales[i].color; bg=umbrales[i].bg; val=umbrales[i].valor; break; }
    }
    html+='<div style="display:flex;align-items:center;gap:10px;">';
    html+='<div style="width:48px;text-align:right;font-family:Montserrat,sans-serif;font-size:12px;font-weight:800;color:'+color+';">'+pct+'%</div>';
    html+='<div style="flex:1;height:8px;background:'+bg+';border:1px solid '+color+'44;border-radius:4px;overflow:hidden;">'
      +'<div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;"></div></div>';
    html+='<div style="min-width:90px;"><span style="padding:3px 8px;border-radius:10px;background:'+bg+';color:'+color+';font-size:10.5px;font-weight:700;border:1px solid '+color+'33;">'+nivel+'</span></div>';
    html+='<div style="font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;color:'+color+';min-width:28px;text-align:center;">'+(val>0?val+'.0':'—')+'</div>';
    html+='</div>';
  });
  html+='</div>';
  wrap.innerHTML=html;
}

function persGuardarUmbrales(){
  PERS_UMBRALES.forEach(function(u,i){
    if(u.nivel==='INEXISTENTE') return;
    var pEl=document.getElementById('umb-pct-'+i);
    var vEl=document.getElementById('umb-val-'+i);
    if(pEl) u.minPct=parseInt(pEl.value)||0;
    if(vEl) u.valor=parseFloat(vEl.value)||0;
  });
  // Sort descending by minPct
  PERS_UMBRALES.sort(function(a,b){ return b.minPct-a.minPct; });
  _persRenderUmbrales();
  _persRenderPreview();
  showToast('✅ Umbrales guardados — se aplicarán a todos los cálculos', 'success', 2500);
}

function persResetUmbrales(){
  PERS_UMBRALES = JSON.parse(JSON.stringify(PERS_UMBRALES_DEFAULT));
  _persRenderUmbrales();
  _persRenderPreview();
  showToast('Umbrales restaurados a valores estándar', 'info', 2000);
}

function _persRenderAtribs(){
  var wrap=document.getElementById('pers-atribs-wrap'); if(!wrap) return;
  var html='';
  PERS_ATRIBS.forEach(function(lbl,i){
    html+='<div>'
      +'<div style="font-size:10px;color:var(--muted);font-weight:700;margin-bottom:3px;text-transform:uppercase;">Atributo '+(i+1)+'</div>'
      +'<input type="text" id="pers-atrib-'+i+'" value="'+lbl+'"'
      +' style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:6px;font-size:12px;font-family:inherit;">'
      +'</div>';
  });
  wrap.innerHTML=html;
}

function persGuardarAtributos(){
  PERS_ATRIBS.forEach(function(_,i){
    var el=document.getElementById('pers-atrib-'+i);
    if(el && el.value.trim()) PERS_ATRIBS[i]=el.value.trim();
  });
  showToast('✅ Nombres de atributos guardados', 'success', 2000);
}

function persResetAtributos(){
  PERS_ATRIBS = PERS_ATRIBS_DEFAULT.slice();
  _persRenderAtribs();
  showToast('Atributos restaurados', 'info', 1500);
}



// ═══════════════════════════════════════════════════════════════════════════
// 📊 SISTEMA DE REPORTES POR FASE - "VER MIS RIESGOS"
// ═══════════════════════════════════════════════════════════════════════════
function generarReportePorFase(fase) {
  const db = window.TERCEROS_DB || {};
  const terceros = Object.values(db).filter(t => t && t.nit);
  
  let html = '';
  let titulo = '';
  let contenido = '';
  let color = '#1e6bb8';
  
  if (fase === 'clasificacion') {
    titulo = 'CLASIFICACIÓN DE TERCEROS';
    color = '#1e6bb8';
    
    const totalTerceros = terceros.length;
    const extremo = terceros.filter(t => t.clasificacion === 'EXTREMO').length;
    const alto = terceros.filter(t => t.clasificacion === 'ALTO').length;
    const bajo = terceros.filter(t => t.clasificacion === 'BAJO').length;
    
    contenido = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #EFF6FF; border-left: 4px solid #1e6bb8; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Total de Terceros</div>
          <div style="font-size: 24px; font-weight: 700; color: #1e6bb8;">${totalTerceros}</div>
        </div>
        <div style="background: #FEF3E0; border-left: 4px solid #fd7e14; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Riesgo Extremo</div>
          <div style="font-size: 24px; font-weight: 700; color: #fd7e14;">${extremo}</div>
        </div>
        <div style="background: #FFF5E6; border-left: 4px solid #ffc107; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Riesgo Alto</div>
          <div style="font-size: 24px; font-weight: 700; color: #ffc107;">${alto}</div>
        </div>
        <div style="background: #F0FDF4; border-left: 4px solid #28a745; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Riesgo Bajo</div>
          <div style="font-size: 24px; font-weight: 700; color: #28a745;">${bajo}</div>
        </div>
      </div>
      <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 8px;">Últimos Registros</div>
        <div style="max-height: 150px; overflow-y: auto; font-size: 11px;">
          ${terceros.slice(0, 5).map(t => `
            <div style="padding: 6px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">${t.nombre || '—'}</span>
              <span style="color: #666; font-size: 10px;">${t.nit}</span>
            </div>
          `).join('') || '<div style="color: #999; padding: 8px;">Sin registros</div>'}
        </div>
      </div>
    `;
  } 
  else if (fase === 'ambiente_control') {
    titulo = 'AMBIENTE DE CONTROL';
    color = '#17a2b8';
    
    const tercerosCuestionario = terceros.filter(t => t.cuestionario && Object.keys(t.cuestionario).length > 0).length;
    const completados = terceros.filter(t => t.cuestionarioCompleto === true).length;
    
    contenido = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #E7F3FF; border-left: 4px solid #17a2b8; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Evaluaciones Iniciadas</div>
          <div style="font-size: 24px; font-weight: 700; color: #17a2b8;">${tercerosCuestionario}</div>
        </div>
        <div style="background: #D1EDE4; border-left: 4px solid #00897b; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Completadas</div>
          <div style="font-size: 24px; font-weight: 700; color: #00897b;">${completados}</div>
        </div>
      </div>
      <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 8px;">Progreso General</div>
        <div style="width: 100%; height: 8px; background: #dee2e6; border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; background: #17a2b8; width: ${tercerosCuestionario > 0 ? (completados / tercerosCuestionario * 100) : 0}%; transition: width 0.3s;"></div>
        </div>
        <div style="font-size: 10px; color: #666; margin-top: 6px;">
          ${tercerosCuestionario} de ${terceros.length} terceros en evaluación
        </div>
      </div>
    `;
  }
  else if (fase === 'analisis_riesgos') {
    titulo = 'ANÁLISIS DE RIESGOS';
    color = '#dc3545';
    
    const riesgosIdentificados = terceros.filter(t => t.matriz && Object.keys(t.matriz).length > 0).length;
    const conPlanAccion = terceros.filter(t => t.seguimiento && Object.keys(t.seguimiento).length > 0).length;
    
    contenido = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #FEF2F2; border-left: 4px solid #dc3545; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Riesgos Identificados</div>
          <div style="font-size: 24px; font-weight: 700; color: #dc3545;">${riesgosIdentificados}</div>
        </div>
        <div style="background: #E8F5E9; border-left: 4px solid #28a745; padding: 12px; border-radius: 4px;">
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Con Plan de Acción</div>
          <div style="font-size: 24px; font-weight: 700; color: #28a745;">${conPlanAccion}</div>
        </div>
      </div>
      <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; margin-top: 12px;">
        <div style="font-size: 11px; font-weight: 700; color: #333; margin-bottom: 8px;">Estado de Seguimiento</div>
        <div style="font-size: 10px; color: #666; line-height: 1.6;">
          <div>✓ Riesgos analizados: <strong>${riesgosIdentificados}</strong></div>
          <div>✓ Acciones en curso: <strong>${conPlanAccion}</strong></div>
          <div>✓ Tasa de implementación: <strong>${riesgosIdentificados > 0 ? ((conPlanAccion / riesgosIdentificados * 100).toFixed(1)) : 0}%</strong></div>
        </div>
      </div>
    `;
  }
  
  html = `
    <div style="background: white; border-radius: 8px; padding: 16px; margin: 12px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid ${color};">
      <h4 style="color: ${color}; margin-bottom: 12px; font-weight: 700; font-size: 13px;">
        ${titulo}
      </h4>
      ${contenido}
    </div>
  `;
  
  return html;
}

function mostrarTabReportes(tab) {
  // Cambiar botones activos
  document.querySelectorAll('.tab-btn-reportes').forEach(btn => {
    if(btn.dataset.tab === tab) {
      btn.style.background = '#1e6bb8';
      btn.style.color = 'white';
    } else {
      btn.style.background = 'transparent';
      btn.style.color = '#6c757d';
    }
  });
  
  // Mostrar/ocultar contenidos
  document.querySelectorAll('.tab-contenido-reportes').forEach(div => {
    div.style.display = div.dataset.tab === tab ? 'block' : 'none';
  });
  
  // Si es gráficas, renderizar los charts
  if(tab === 'graficas') {
    setTimeout(renderizarGraficasReportes, 300);
  }
}

function renderizarGraficasReportes() {
  // USAR LOS DATOS EN MEMORIA (ya cargados por _lsLoad)
  const dbObj = window.TERCEROS_DB || {};
  const db = Object.values(dbObj); // Convertir objeto a array
  
  if(db.length === 0) {
    console.warn('⚠️ No hay terceros para renderizar gráficas');
    return;
  }
  
  // 1️⃣ GRÁFICA: Terceros por Nivel de Riesgo
  const riesgoCount = {
    'EXTREMO': 0,
    'ALTO': 0,
    'MEDIO': 0,
    'BAJO': 0
  };
  db.forEach(t => {
    const nivel = (t.nivel_riesgo || 'BAJO').toUpperCase();
    if(riesgoCount.hasOwnProperty(nivel)) riesgoCount[nivel]++;
    else riesgoCount['BAJO']++;
  });
  
  const ctx1 = document.getElementById('chart-riesgo-torta');
  if(ctx1 && typeof Chart !== 'undefined') {
    if(ctx1.chartInstance) ctx1.chartInstance.destroy();
    ctx1.chartInstance = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Extremo', 'Alto', 'Medio', 'Bajo'],
        datasets: [{
          data: [riesgoCount.EXTREMO, riesgoCount.ALTO, riesgoCount.MEDIO, riesgoCount.BAJO],
          backgroundColor: ['#d32f2f', '#f57c00', '#fbc02d', '#388e3c'],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
      }
    });
  }
  
  // 2️⃣ GRÁFICA: Estado de Evaluaciones
  let iniciadas = 0, completadas = 0;
  db.forEach(t => {
    if(t.evaluaciones && t.evaluaciones.length > 0) iniciadas++;
    if(t.evaluaciones && t.evaluaciones.filter(e => e.completada).length > 0) completadas++;
  });
  const pendientes = db.length - completadas;
  
  const ctx2 = document.getElementById('chart-evaluaciones-torta');
  if(ctx2 && typeof Chart !== 'undefined') {
    if(ctx2.chartInstance) ctx2.chartInstance.destroy();
    ctx2.chartInstance = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Completadas', 'Pendientes'],
        datasets: [{
          data: [completadas, pendientes],
          backgroundColor: ['#4caf50', '#ff9800'],
          borderColor: 'white',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
      }
    });
  }
  
  // 3️⃣ GRÁFICA: Tipologías Evaluadas
  const tipologiasCount = {};
  db.forEach(t => {
    if(t.evaluaciones) {
      t.evaluaciones.forEach(e => {
        const tip = e.tipologia || 'Sin Tipo';
        tipologiasCount[tip] = (tipologiasCount[tip] || 0) + 1;
      });
    }
  });
  
  const ctx3 = document.getElementById('chart-tipologias-torta');
  if(ctx3 && typeof Chart !== 'undefined') {
    if(ctx3.chartInstance) ctx3.chartInstance.destroy();
    ctx3.chartInstance = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: Object.keys(tipologiasCount),
        datasets: [{
          data: Object.values(tipologiasCount),
          backgroundColor: ['#1e6bb8', '#28a745', '#fd7e14', '#6f42c1', '#dc3545', '#17a2b8', '#6c757d', '#20c997'],
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } }
      }
    });
  }
}

function abrirMisRiesgosReport() {
  const rolActual = window.currentUser?.rol;
  if (!rolActual) {
    showToast('❌ Necesitas iniciar sesión', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'modal-mis-riesgos';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
    display: flex; align-items: center; justify-content: center; 
    z-index: 10000;
  `;
  
  let html = `
    <div style="background: white; border-radius: 10px; padding: 24px; max-width: 700px; 
                max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: #1a3a5c; font-weight: 700; margin: 0;">📊 Ver mis Reportes</h3>
        <button onclick="document.getElementById('modal-mis-riesgos').remove();" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6c757d;">
          ✕
        </button>
      </div>
      
      <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 16px; 
                  font-size: 12px; color: #2c3e50;">
        <strong>Rol actual:</strong> ${rolActual} | 
        <strong>Usuario:</strong> ${window.currentUser?.name || 'N/A'} |
        <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CO')}
      </div>
      
      <div style="display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid #dee2e6;">
        <button onclick="mostrarTabReportes('tabla')" class="tab-btn-reportes" data-tab="tabla"
                style="padding: 12px 20px; background: #1e6bb8; color: white; border: none; 
                        cursor: pointer; font-weight: 600; border-radius: 4px 4px 0 0;">
          📋 Reportes
        </button>
        <button onclick="mostrarTabReportes('graficas')" class="tab-btn-reportes" data-tab="graficas"
                style="padding: 12px 20px; background: transparent; color: #6c757d; border: none; 
                        cursor: pointer; font-weight: 600;">
          📊 Gráficas
        </button>
      </div>
      
      <div id="reportes-fases-container" class="tab-contenido-reportes" data-tab="tabla">
  `;
  
  // Agregar reportes por fase
  const fases = ['clasificacion', 'ambiente_control', 'analisis_riesgos'];
  fases.forEach(fase => {
    html += generarReportePorFase(fase);
  });
  
  html += `
      </div>
      
      <div id="reportes-graficas-container" class="tab-contenido-reportes" data-tab="graficas" style="display: none;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="text-align: center; background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="color: #1a3a5c; margin-bottom: 10px; font-size: 13px; font-weight: 700;">📊 Terceros por Nivel de Riesgo</h4>
            <div style="position: relative; height: 280px;">
              <canvas id="chart-riesgo-torta"></canvas>
            </div>
            <div style="margin-top: 15px; padding: 12px; background: #f0f7ff; border-radius: 6px; text-align: left; font-size: 11px; color: #333;">
              <strong style="color: #0066cc;">ℹ️ ¿Qué significa?</strong><br/>
              Esta gráfica muestra la distribución de terceros según su nivel de riesgo:
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><strong style="color: #d32f2f;">🔴 EXTREMO:</strong> Terceros de muy alto riesgo que requieren supervisión permanente</li>
                <li><strong style="color: #f57c00;">🟠 ALTO:</strong> Terceros con riesgo significativo, necesitan controles reforzados</li>
                <li><strong style="color: #fbc02d;">🟡 MEDIO:</strong> Terceros con riesgo moderado, supervisión periódica</li>
                <li><strong style="color: #388e3c;">🟢 BAJO:</strong> Terceros con bajo riesgo, controles estándar suficientes</li>
              </ul>
            </div>
          </div>
          <div style="text-align: center; background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="color: #1a3a5c; margin-bottom: 10px; font-size: 13px; font-weight: 700;">✅ Estado de Evaluaciones</h4>
            <div style="position: relative; height: 280px;">
              <canvas id="chart-evaluaciones-torta"></canvas>
            </div>
            <div style="margin-top: 15px; padding: 12px; background: #f0fff4; border-radius: 6px; text-align: left; font-size: 11px; color: #333;">
              <strong style="color: #00aa00;">ℹ️ ¿Qué significa?</strong><br/>
              Muestra el progreso en la evaluación de Ambiente de Control:
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li><strong style="color: #4caf50;">✅ COMPLETADAS:</strong> Terceros que ya finalizaron todas las evaluaciones de AC</li>
                <li><strong style="color: #ff9800;">⏳ PENDIENTES:</strong> Terceros que aún no han iniciado o completado sus evaluaciones</li>
              </ul>
              <strong>Meta:</strong> Lograr que el 100% de terceros evalúe su Ambiente de Control antes de diciembre.
            </div>
          </div>
          <div style="text-align: center; grid-column: 1/-1; background: white; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="color: #1a3a5c; margin-bottom: 8px; font-size: 13px; font-weight: 700;">🏷️ Tipologías Evaluadas</h4>
            <div style="position: relative; height: 140px; max-width: 300px; margin: 0 auto;">
              <canvas id="chart-tipologias-torta"></canvas>
            </div>
            <div style="margin-top: 8px; padding: 6px; background: #f5f0ff; border-radius: 6px; text-align: left; font-size: 8px; color: #333; max-width: 350px; margin-left: auto; margin-right: auto; line-height: 1.3;">
              <strong style="color: #6f42c1;">ℹ️ ¿Qué significa?</strong>
              <br/><strong>Financiera:</strong> Gestión de recursos y solidez financiera
              <br/><strong>Operacional:</strong> Procesos internos y operaciones diarias
              <br/><strong>Tecnología:</strong> Seguridad informática, ciberataques
              <br/><strong>Cumplimiento:</strong> SARLAFT, OFAC, normatividad
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #dee2e6;">
        <div style="display: flex; gap: 8px;">
          <button onclick="descargarReporteExcel()" 
                  style="padding: 10px 16px; background: #107c41; color: white; border: none; 
                          border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">
            📊 Descargar Excel
          </button>
          <button onclick="descargarReporteWord()" 
                  style="padding: 10px 16px; background: #2b5797; color: white; border: none; 
                          border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">
            📄 Descargar Word
          </button>
          <button onclick="document.getElementById('modal-mis-riesgos').remove();" 
                  style="padding: 10px 16px; background: #6c757d; color: white; border: none; 
                          border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

// ═════════════════════════════════════════════════════════════════════════════
// 📊 DESCARGAR RESUMEN EN EXCEL
// ═════════════════════════════════════════════════════════════════════════════

function descargarReporteExcel() {
  const db = window.TERCEROS_DB || {};
  const ahora = new Date();
  
  // Encabezados
  let csv = 'RESUMEN DE EVALUACION DE RIESGOS DE TERCEROS\n';
  csv += `Generado: ${ahora.toLocaleString('es-CO')}\n`;
  csv += `Usuario: ${window.currentUser?.name || 'N/A'}\n\n`;
  
  // TABLA 1: TERCEROS
  csv += 'TERCEROS EVALUADOS\n';
  csv += 'NIT,Nombre,Domicilio,Promedio,Nivel Riesgo,Supervisores,Contratos,Evaluaciones\n';
  
  Object.values(db).forEach(t => {
    csv += `"${t.nit}","${t.nombre}","${t.domicilio}",${(t.prom || 0).toFixed(2)},"${t.nivel_riesgo || 'N/A'}",${(t.supervisores || []).length},${(t.contratos || []).length},${(t.evaluaciones || []).length}\n`;
  });
  
  csv += '\n\nSUPERVISORES\n';
  csv += 'Tercero,Nombre Supervisor,Cargo,Proceso\n';
  
  Object.values(db).forEach(t => {
    (t.supervisores || []).forEach(s => {
      csv += `"${t.nombre}","${s.nombre}","${s.cargo}","${s.proceso}"\n`;
    });
  });
  
  csv += '\n\nCONTRATOS\n';
  csv += 'Tercero,Contrato,Objeto,Inicio,Fin,Estado,Valor\n';
  
  Object.values(db).forEach(t => {
    (t.contratos || []).forEach(c => {
      csv += `"${t.nombre}","${c.num}","${c.objeto}","${c.fini}","${c.ffin}","${c.estado}","${c.valor}"\n`;
    });
  });
  
  csv += '\n\nRESUMEN ESTADISTICO\n';
  const totalTerceros = Object.keys(db).length;
  const totalEvaluaciones = Object.values(db).reduce((sum, t) => sum + (t.evaluaciones || []).length, 0);
  const bajos = Object.values(db).filter(t => t.nivel_riesgo === 'BAJO').length;
  const medios = Object.values(db).filter(t => t.nivel_riesgo === 'MEDIO').length;
  
  csv += `Total Terceros,${totalTerceros}\n`;
  csv += `Total Evaluaciones,${totalEvaluaciones}\n`;
  csv += `Riesgo Bajo,${bajos}\n`;
  csv += `Riesgo Medio,${medios}\n`;
  
  // Descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Resumen_Riesgos_${ahora.getFullYear()}${String(ahora.getMonth()+1).padStart(2,'0')}${String(ahora.getDate()).padStart(2,'0')}.csv`;
  link.click();
  
  showToast('✅ Reporte Excel descargado','success',2000);
}

// ═════════════════════════════════════════════════════════════════════════════
// 📄 DESCARGAR RESUMEN EN WORD (HTML que se descarga como DOCX)
// ═════════════════════════════════════════════════════════════════════════════

function descargarReporteWord() {
  if(typeof window.odDlTodos==='function'){ window.odDlTodos(); return; }
  const db = window.TERCEROS_DB || {};
  const ahora = new Date();
  
  const htmlWord = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Resumen Riesgos de Terceros</title>
  <style>
    body { font-family: Calibri, Arial; margin: 40px; line-height: 1.5; }
    h1 { color: #1a3a5c; font-size: 24px; margin-bottom: 5px; }
    h2 { color: #2b5797; font-size: 16px; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #2b5797; padding-bottom: 5px; }
    .header { border-bottom: 3px solid #2b5797; padding-bottom: 15px; margin-bottom: 20px; }
    .info { font-size: 11px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #e7e6e6; border: 1px solid #999; padding: 8px; text-align: left; font-weight: bold; font-size: 11px; }
    td { border: 1px solid #ccc; padding: 8px; font-size: 11px; }
    tr:nth-child(even) { background: #f2f2f2; }
    .stats { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { border: 1px solid #2b5797; padding: 12px; text-align: center; }
    .stat-number { font-size: 20px; font-weight: bold; color: #2b5797; }
    .stat-label { font-size: 10px; color: #666; margin-top: 5px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 9px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Resumen de Evaluación de Riesgos de Terceros</h1>
    <p class="info">
      <strong>Generado:</strong> ${ahora.toLocaleString('es-CO')}<br/>
      <strong>Usuario:</strong> ${window.currentUser?.name || 'N/A'}<br/>
      <strong>Sistema:</strong> SGRT v10.0 - Infraestructuras Seguras S.A.S.
    </p>
  </div>
  
  <h2>📈 Indicadores Clave</h2>
  <div class="stats">
    <div class="stat-box">
      <div class="stat-number">${Object.keys(db).length}</div>
      <div class="stat-label">Total Terceros</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${Object.values(db).reduce((sum, t) => sum + (t.evaluaciones || []).length, 0)}</div>
      <div class="stat-label">Evaluaciones</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${Object.values(db).filter(t => t.nivel_riesgo === 'BAJO').length}</div>
      <div class="stat-label">Riesgo Bajo</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${Object.values(db).filter(t => t.nivel_riesgo === 'MEDIO').length}</div>
      <div class="stat-label">Riesgo Medio</div>
    </div>
  </div>
  
  <h2>👥 Terceros Evaluados</h2>
  <table>
    <tr>
      <th>NIT</th>
      <th>Nombre</th>
      <th>Promedio</th>
      <th>Riesgo</th>
      <th>Supervisores</th>
      <th>Contratos</th>
      <th>Evaluaciones</th>
    </tr>
    ${Object.values(db).map(t => `
    <tr>
      <td>${t.nit}</td>
      <td><strong>${t.nombre}</strong></td>
      <td>${(t.prom || 0).toFixed(2)}</td>
      <td><strong>${t.nivel_riesgo || 'N/A'}</strong></td>
      <td>${(t.supervisores || []).length}</td>
      <td>${(t.contratos || []).length}</td>
      <td>${(t.evaluaciones || []).length}</td>
    </tr>
    `).join('')}
  </table>
  
  <h2>🔍 Supervisores Asignados</h2>
  <table>
    <tr>
      <th>Tercero</th>
      <th>Supervisor</th>
      <th>Cargo</th>
      <th>Proceso</th>
    </tr>
    ${Object.values(db).flatMap(t => 
      (t.supervisores || []).map(s => `
      <tr>
        <td>${t.nombre}</td>
        <td><strong>${s.nombre}</strong></td>
        <td>${s.cargo}</td>
        <td>${s.proceso}</td>
      </tr>
      `)
    ).join('')}
  </table>
  
  <h2>📋 Contratos Activos</h2>
  <table>
    <tr>
      <th>Tercero</th>
      <th>Contrato</th>
      <th>Objeto</th>
      <th>Inicio</th>
      <th>Fin</th>
      <th>Estado</th>
    </tr>
    ${Object.values(db).flatMap(t =>
      (t.contratos || []).map(c => `
      <tr>
        <td>${t.nombre}</td>
        <td><strong>${c.num}</strong></td>
        <td>${c.objeto}</td>
        <td>${c.fini}</td>
        <td>${c.ffin}</td>
        <td>${c.estado}</td>
      </tr>
      `)
    ).join('')}
  </table>
  
  <div class="footer">
    <p><strong>SGRT v10.0</strong> | Sistema de Gestión de Riesgos de Terceros | Infraestructuras Seguras S.A.S.</p>
    <p>Este documento fue generado automáticamente. Para cambios o correcciones, contacte al área de Riesgos.</p>
  </div>
</body>
</html>`;
  
  // Convertir a Blob y descargar
  const blob = new Blob([htmlWord], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Resumen_Riesgos_${ahora.getFullYear()}${String(ahora.getMonth()+1).padStart(2,'0')}${String(ahora.getDate()).padStart(2,'0')}.doc`;
  link.click();
  
  showToast('✅ Reporte Word descargado','success',2000);
}

function exportarReporteMisRiesgos() {
  const rol = window.currentUser?.rol || 'desconocido';
  const datos = {
    fecha: new Date().toISOString(),
    usuario: window.currentUser?.name,
    rol: rol,
    reportes: REPORTES_POR_FASE
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_mis_riesgos_${rol}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Reporte descargado', 'success', 2000);
}
// ═══════════════════════════════════════════════════════════════════════════

// 🎯 TIPOLOGÍAS CORRECTAS DEL EXCEL - SINCRONIZACIÓN AUTOMÁTICA
window.TIPOLOGIAS_CORRECTAS = {
  "Operativo": {
    "5": "5 - El tercero opera directamente procesos misionales y es proveedor único de la organización",
    "4": "4 - El tercero parte soporta procesos misionales de la organización",
    "3": "3. El tercero soporta procesos de apoyo de la organización y es proveedor único",
    "2": "2 - El tercero soporta procesos de apoyo",
    "1": "1 - El tercero soporta procesos estratégicos y de evaluación"
  },
  "Continuidad de Negocio": {
    "5": "5 - Sin la participación del tercero no se puede prestar el servicio",
    "4": "4 - El servicio prestado por el tercero puede esperar desde 1 día hasta 2 días",
    "3": "3 - El servicio prestado por el tercero puede esperar desde 3 días hasta 4 días",
    "2": "2 - El servicio prestado por el tercero puede esperar desde 1 semana hasta 4 semanas",
    "1": "1 - El servicio prestado por el tercero puede esperar por más de 4 semanas"
  },
  "Seguridad de la Información": {
    "5": "5 - El tercero administra y procesa información clasificada o información reservada de clientes",
    "4": "4 - El tercero accede y/o almacena información clasificada o información reservada de negocio",
    "3": "3 - El tercero accede a información reservada",
    "2": "2 - El tercero accede a información clasificada",
    "1": "1 - El tercero accede a información de carácter público"
  },
  "Cumplimiento": {
    "5": "5 - El incumplimiento de requerimientos legales por parte de la tercera parte podría generar la intervención de un ente de control a la organización.",
    "4": "N/A",
    "3": "3 - El incumplimiento de requerimientos legales por parte de la tercera parte podría generar sanciones (administrativas o financieras) de un ente de control a la organización.",
    "2": "N/A",
    "1": "1 - El incumplimiento de requerimientos legales por parte de la tercera parte podría generar acciones preventivas o correctivas de un ente de control a la organización."
  },
  "Fraude y Corrupción": {
    "5": "5 - El proveedor desarrolla actividades core asociadas a los procesos misionales del negocio que pueden ser sujetas a hechos de corrupción o fraude",
    "4": "N/A",
    "3": "3 - El proveedor desarrolla actividades asociadas a los procesos de apoyo del negocio que pueden ser sujetas a hechos de corrupción o fraude",
    "2": "N/A",
    "1": "1 - El proveedor desarrolla actividades asociadas a los procesos estratégicos y de evaluación del negocio que pueden ser sujetas a hechos de corrupción o fraude"
  },
  "Lavado de Activos y Financiación al Terrorismo (LAFT)": {
    "5": "5 - El tercero representa un riesgo de contagio de LAFT para la organización y no está obligado a implementar controles de acuerdo con los lineamientos definidos en la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades.",
    "4": "N/A",
    "3": "3 - El tercero representa un riesgo de contagio de LAFT para la organización y está obligado a implementar controles de acuerdo con los lineamientos definidos en la Circular Externa 100-000016 de 2020 de la Superintendencia de Sociedades.",
    "2": "N/A",
    "1": "1 - El proveedor prestará el servicio a través de subcontratistas de los cuales no se tiene trazabilidad de sus antecedentes."
  }
};

function sincronizarTipologiasCorrectasEnUI() {
  window.TIPOLOGIAS_CORRECTAS_SINCRONIZADO = window.TIPOLOGIAS_CORRECTAS;
  localStorage.setItem('tipologias_correctas', JSON.stringify(window.TIPOLOGIAS_CORRECTAS));
  console.log('✅ TIPOLOGÍAS CORRECTAS SINCRONIZADAS EN UI');
}

// 🔄 ACTUALIZAR DESCRIPCIONES DE ESCALA EN LA UI
function obtenerDescripcionCorrectaTipologia(nombreTipologia, nivel) {
  if(!window.TIPOLOGIAS_CORRECTAS) return null;
  const tip = window.TIPOLOGIAS_CORRECTAS[nombreTipologia];
  if(tip) {
    return tip[String(nivel)] || tip[nivel] || null;
  }
  return null;
}

// 📝 INTERCEPTAR CAMBIOS DE TIPOLOGÍA PARA ACTUALIZAR ESCALA
function intercalarActualizacionEscalaCorrecta() {
  document.addEventListener('change', function(e) {
    if(e.target && e.target.id === 'cls-tip-tercero-sel') {
      // Cuando cambies la tipología, actualizar las descripciones
      const tipSeleccionada = e.target.value;
      if(tipSeleccionada && window.TIPOLOGIAS_CORRECTAS[tipSeleccionada]) {
        const descripciones = window.TIPOLOGIAS_CORRECTAS[tipSeleccionada];
        // Actualizar cada nivel en los inputs de escala
        for(let nivel = 1; nivel <= 5; nivel++) {
          const desc = descripciones[nivel];
          const elem = document.querySelector(`[data-nivel="${nivel}"][data-tipologia="${tipSeleccionada}"]`);
          if(elem) elem.textContent = desc;
        }
      }
    }
  }, true);
}

function cargarTodoDesdeLocalStorage() {
  try {
    const localDB = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}');
    if(Object.keys(localDB).length > 0) {
      window.TERCEROS_DB = localDB;
      console.log('✅ Base de datos cargada desde localStorage:', Object.keys(localDB).length, 'terceros');
      
      // Cargar también REPORTES_POR_FASE
      const reportes = JSON.parse(localStorage.getItem('sgrt_reportes_fases_auto') || '{}');
      if(Object.keys(reportes).length > 0) {
        window.REPORTES_POR_FASE = Object.assign(window.REPORTES_POR_FASE || {}, reportes);
        console.log('✅ Cuestionarios cargados desde localStorage');
      }
      
      // Renderizar tabla si existe
      if(typeof clsRender === 'function') {
        setTimeout(() => clsRender(), 300);
      }
    }
  } catch(e) {
    console.error('❌ Error cargando localStorage:', e);
  }
}

// 🔄 AUTOGUARDADO GLOBAL - CADA 2 SEGUNDOS
function autoguardarTodo() {
  try {
    // Guardar TERCEROS_DB
    if(window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length > 0) {
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
    }
    
    // Guardar CLS_DB (Clasificación)
    if(window.CLS_DB && Object.keys(window.CLS_DB).length > 0) {
      localStorage.setItem('sgrt_cls_db_auto', JSON.stringify(window.CLS_DB));
    }
    
    // Guardar REPORTES_POR_FASE
    if(window.REPORTES_POR_FASE && Object.keys(window.REPORTES_POR_FASE).length > 0) {
      localStorage.setItem('sgrt_reportes_fases_auto', JSON.stringify(window.REPORTES_POR_FASE));
    }
  } catch(e) {
    console.warn('⚠️ Error en autoguardado:', e);
  }
}

// Ejecutar autoguardado cada 2 segundos
window._AUTOSAVE_INTERVALO = setInterval(autoguardarTodo, 2000);

// 🔄 SINCRONIZACIÓN AUTOMÁTICA GLOBAL DE TERCEROS ENTRE ROLES
window.SINCRONIZACION_ACTIVA = true;

function sincronizarTercerosGlobal() {
  if(!window.SINCRONIZACION_ACTIVA) return;
  
  try {
    // 1️⃣ Cargar desde localStorage
    const localDB = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}');
    
    // 2️⃣ Si hay datos en localStorage y no están en window.TERCEROS_DB, cargarlos
    if(Object.keys(localDB).length > 0) {
      if(!window.TERCEROS_DB) window.TERCEROS_DB = {};
      
      // Fusionar: localStorage es la fuente de verdad
      Object.assign(window.TERCEROS_DB, localDB);
    }
    
    // 3️⃣ Si hay cambios en window.TERCEROS_DB, guardar a localStorage
    if(window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length > 0) {
      localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(window.TERCEROS_DB));
    }
  } catch(e) {
    console.warn('⚠️ Error en sincronización:', e);
  }
}

// Ejecutar sincronización cada 1 segundo
window._INTERVALO_SINCRO = setInterval(sincronizarTercerosGlobal, 1000);

function detenerSincronizacion() {
  window.SINCRONIZACION_ACTIVA = false;
  if(window._INTERVALO_SINCRO) clearInterval(window._INTERVALO_SINCRO);
}

function iniciarSincronizacion() {
  window.SINCRONIZACION_ACTIVA = true;
  if(!window._INTERVALO_SINCRO) {
    window._INTERVALO_SINCRO = setInterval(sincronizarTercerosGlobal, 1000);
  }
}

window.addEventListener('load', ()=>{
  // 🔄 CARGAR DATOS COMPLETOS CON INFORMES AUTOMÁTICOS
  setTimeout(function(){
    try{
      const dbActual = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}');
      if(!window.SGRT_DISABLE_AUTO_DEMO && (!dbActual || Object.keys(dbActual).length === 0)){
        console.log('🔄 Cargando datos completos con clasificación, cuestionarios y matriz...');
        
        const DATOS_COMPLETOS = {"860005080":{"nit":"860005080","nombre":"Banco Popular Colombia","domicilio":"Calle 60 #43-45, Medellín","supervisor":"Juan Carlos Pérez","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-15T00:00:00Z","clasificacion":"ALTO","supervisores":[{"nombre":"Juan Carlos Pérez","cargo":"Supervisor Senior","proceso":"Gestión Financiera","contratos_asociados":["CT-2024-BP-001","CT-2024-BP-003"]},{"nombre":"María Rodríguez","cargo":"Coordinadora","proceso":"Evaluación de Riesgos","contratos_asociados":["CT-2024-BP-002"]}],"contratos":[{"num":"CT-2024-BP-001","objeto":"Servicios de Crédito y Cobranza","fini":"2024-01-15","ffin":"2024-12-31","estado":"En Ejecucion","valor":"250000000","supervisor_asociado":"Juan Carlos Pérez","procesos":"Operaciones Financieras, Gestión de Crédito","observaciones":"Contrato crítico para operaciones"},{"num":"CT-2024-BP-002","objeto":"Auditoría de Riesgos Operacionales","fini":"2024-02-01","ffin":"2024-06-30","estado":"En Ejecucion","valor":"180000000","supervisor_asociado":"María Rodríguez","procesos":"Auditoría Interna, Control de Riesgos","observaciones":"Auditoría trimestral programada"},{"num":"CT-2024-BP-003","objeto":"Gestión de Cumplimiento Normativo","fini":"2024-03-01","ffin":"2024-12-31","estado":"Terminado","valor":"150000000","supervisor_asociado":"Juan Carlos Pérez","procesos":"Cumplimiento Regulatorio, LAFT","observaciones":"Finalizado exitosamente"}],"dims":[{"tipologia":"Operativo","nivel":4,"calificacion":4},{"tipologia":"Continuidad de Negocio","nivel":4,"calificacion":4},{"tipologia":"Seguridad de la Información","nivel":5,"calificacion":5},{"tipologia":"Cumplimiento","nivel":4,"calificacion":4},{"tipologia":"Fraude y Corrupción","nivel":3,"calificacion":3},{"tipologia":"LAFT","nivel":4,"calificacion":4}],"prom":4.0,"zona":"ALTO","evaluaciones":[{"id":"e1","tipologia":"Operativo","completada":true,"calificacion":4,"fecha_inicio":"2024-02-01","fecha_fin":"2024-02-15","respuestas":{"101":"Si","102":"Si","103":"Si"}},{"id":"e2","tipologia":"Cumplimiento","completada":true,"calificacion":4,"fecha_inicio":"2024-02-10","fecha_fin":"2024-02-25","respuestas":{"401":"Si","402":"Si"}},{"id":"e3","tipologia":"Seguridad de la Información","completada":true,"calificacion":5,"fecha_inicio":"2024-02-15","fecha_fin":"2024-03-01","respuestas":{"301":"Si","302":"Si","303":"Si"}}],"cuestionario":{"101":"Si","102":"Si","103":"Si","104":"Parcialmente","105":"Si"},"cuestionarioCompleto":true,"matriz":{"R001":"ALTO","R002":"ALTO","R003":"MODERADO"},"seguimiento":{"S001":"Implementar controles","S002":"Capacitación LAFT"},"nivel_riesgo":"ALTO"},"901226600":{"nit":"901226600","nombre":"Seguros Monterrey New York Life","domicilio":"Carrera 7 #156-85, Bogotá","supervisor":"María García López","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-10T00:00:00Z","clasificacion":"MEDIO","supervisores":[{"nombre":"María García López","cargo":"Jefe de Riesgos","proceso":"Evaluación de Pólizas","contratos_asociados":["CT-2024-SMN-001"]},{"nombre":"Carlos Mendez","cargo":"Especialista","proceso":"Análisis de Seguros","contratos_asociados":["CT-2024-SMN-002"]}],"contratos":[{"num":"CT-2024-SMN-001","objeto":"Pólizas de Seguros Complementarios","fini":"2024-01-01","ffin":"2024-12-31","estado":"En Ejecucion","valor":"320000000","supervisor_asociado":"María García López","procesos":"Seguros, Cobertura de Riesgos","observaciones":"Cobertura anual para pensionados"},{"num":"CT-2024-SMN-002","objeto":"Asesoría en Gestión de Siniestros","fini":"2024-02-15","ffin":"2024-08-15","estado":"En Ejecucion","valor":"95000000","supervisor_asociado":"Carlos Mendez","procesos":"Manejo de Siniestros, Indemnización","observaciones":"Servicio de asesoría técnica"}],"dims":[{"tipologia":"Operativo","nivel":3,"calificacion":3},{"tipologia":"Continuidad de Negocio","nivel":3,"calificacion":3},{"tipologia":"Seguridad de la Información","nivel":4,"calificacion":4},{"tipologia":"Cumplimiento","nivel":3,"calificacion":3},{"tipologia":"Fraude y Corrupción","nivel":2,"calificacion":2},{"tipologia":"LAFT","nivel":3,"calificacion":3}],"prom":3.0,"zona":"MEDIO","evaluaciones":[{"id":"e4","tipologia":"Cumplimiento","completada":true,"calificacion":3,"fecha_inicio":"2024-02-10","fecha_fin":"2024-02-25","respuestas":{"401":"Si","402":"Parcialmente"}},{"id":"e5","tipologia":"Operativo","completada":true,"calificacion":3,"fecha_inicio":"2024-02-20","fecha_fin":"2024-03-05","respuestas":{"101":"Si","102":"Parcialmente"}}],"cuestionario":{"101":"Si","102":"Parcialmente","103":"Si","104":"Parcialmente","105":"Si"},"cuestionarioCompleto":true,"matriz":{"R004":"MODERADO","R005":"MODERADO"},"seguimiento":{"S003":"Mejorar cobertura","S004":"Auditoría de procesos"},"nivel_riesgo":"MEDIO"},"830016840":{"nit":"830016840","nombre":"IBM Colombia","domicilio":"Calle 72 #13-45, Bogotá","supervisor":"Carlos Mendoza Flores","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-05T00:00:00Z","clasificacion":"EXTREMO","supervisores":[{"nombre":"Carlos Mendoza Flores","cargo":"Jefe de TI","proceso":"Infraestructura Tecnológica","contratos_asociados":["CT-2024-IBM-001"]},{"nombre":"Patricia González","cargo":"Especialista Seguridad","proceso":"Ciberseguridad","contratos_asociados":["CT-2024-IBM-002","CT-2024-IBM-003"]}],"contratos":[{"num":"CT-2024-IBM-001","objeto":"Servicios de Infraestructura y Cloud Computing","fini":"2024-01-10","ffin":"2025-01-09","estado":"En Ejecucion","valor":"500000000","supervisor_asociado":"Carlos Mendoza Flores","procesos":"Cloud, Infraestructura, Hosting","observaciones":"Servicio crítico de infraestructura"},{"num":"CT-2024-IBM-002","objeto":"Soporte Técnico 24/7","fini":"2024-01-10","ffin":"2025-01-09","estado":"En Ejecucion","valor":"280000000","supervisor_asociado":"Patricia González","procesos":"Soporte Técnico, Mantenimiento","observaciones":"SLA 99.9% uptime"},{"num":"CT-2024-IBM-003","objeto":"Evaluación de Seguridad Informática","fini":"2024-02-01","ffin":"2024-12-31","estado":"Terminado","valor":"150000000","supervisor_asociado":"Patricia González","procesos":"Ciberseguridad, Auditoría de Seguridad","observaciones":"Evaluación integral completada"}],"dims":[{"tipologia":"Operativo","nivel":5,"calificacion":5},{"tipologia":"Continuidad de Negocio","nivel":5,"calificacion":5},{"tipologia":"Seguridad de la Información","nivel":5,"calificacion":5},{"tipologia":"Cumplimiento","nivel":4,"calificacion":4},{"tipologia":"Fraude y Corrupción","nivel":4,"calificacion":4},{"tipologia":"LAFT","nivel":4,"calificacion":4}],"prom":4.5,"zona":"EXTREMO","evaluaciones":[{"id":"e6","tipologia":"Seguridad de la Información","completada":true,"calificacion":5,"fecha_inicio":"2024-02-05","fecha_fin":"2024-02-20","respuestas":{"301":"Si","302":"Si","303":"Si"}},{"id":"e7","tipologia":"Continuidad de Negocio","completada":true,"calificacion":5,"fecha_inicio":"2024-02-15","fecha_fin":"2024-03-01","respuestas":{"201":"Si","202":"Si"}},{"id":"e8","tipologia":"Operativo","completada":true,"calificacion":5,"fecha_inicio":"2024-02-25","fecha_fin":"2024-03-10","respuestas":{"101":"Si","102":"Si","103":"Si"}}],"cuestionario":{"101":"Si","102":"Si","103":"Si","104":"Si","105":"Si"},"cuestionarioCompleto":true,"matriz":{"R006":"EXTREMO","R007":"EXTREMO","R008":"ALTO"},"seguimiento":{"S005":"Fortalecer seguridad cloud","S006":"Plan de continuidad"},"nivel_riesgo":"EXTREMO"}};
        
        window.TERCEROS_DB = DATOS_COMPLETOS;
        localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(DATOS_COMPLETOS));
        console.log('✅ Datos completos cargados para AMBOS roles');
      }
    }catch(e){ console.error('Error cargando datos:', e); }
  }, 50);
  
  try{ cargarTodoDesdeLocalStorage(); }catch(e){ console.warn('cargarLS:',e); }
  try{ sincronizarTipologiasCorrectasEnUI(); }catch(e){ console.warn('tipologías:',e); }
  try{ intercalarActualizacionEscalaCorrecta(); }catch(e){ console.warn('escala:',e); }
  try{ iniciarSincronizacion(); }catch(e){ console.warn('sincro:',e); }
  try{ iniciarSincronizacionTiempoReal(); }catch(e){ console.warn('initSync:',e); }
  try{ cargarNotificacionesSistema(); }catch(e){ console.warn('loadNotif:',e); }
  try{ cargarReportesSistema(); }catch(e){ console.warn('loadReport:',e); }
  try{ initTercerosEnCuestionario(); }catch(e){ console.warn('initTerceros:',e); }
  try{ addQuitarButtons(); }catch(e){}
  try{ sincronizarSelectorCuestionario(); }catch(e){ console.warn('sincronizar:',e); }
  try{ fijarEntidadClasificacion(); }catch(e){}
  try{ renderMatriz(); }catch(e){ console.warn('renderMatriz:',e); }
  try{ renderSeguimiento(); }catch(e){ console.warn('renderSeguimiento:',e); }
  try{ calcClasif(); }catch(e){}
  try{ buildAllCuestionarios(); }catch(e){}
  try{ calcMatrizPromedios(); }catch(e){}
  try{ animateProgress(); }catch(e){}
  
  // 🎯 GENERAR INFORMES AUTOMÁTICOS DESPUÉS DE CARGAR TODO
  setTimeout(function(){
    try{
      if(window.TERCEROS_DB && Object.keys(window.TERCEROS_DB).length > 0){
        // Crear estructura de reportes por fase
        if(!window.REPORTES_POR_FASE) window.REPORTES_POR_FASE = {};
        
        const terceros = Object.values(window.TERCEROS_DB);
        const cuestionarios = [];
        
        // Generar cuestionarios de ambiente de control
        terceros.forEach(t => {
          if(t.cuestionarioCompleto){
            cuestionarios.push({
              nit: t.nit,
              tercero: t.nombre,
              tipologia: "Ambiente de Control",
              completada: true,
              estado: "COMPLETADO",
              fecha_inicio: new Date().toISOString().split('T')[0],
              fecha_fin: new Date().toISOString().split('T')[0],
              calificacion: t.prom || 4,
              respuestas: t.cuestionario || {},
              porcentaje: (t.prom || 4) * 25,
              observaciones: "Evaluación completada automáticamente"
            });
          }
        });
        
        window.REPORTES_POR_FASE['ambiente_control'] = cuestionarios;
        localStorage.setItem('sgrt_reportes_fases_auto', JSON.stringify(window.REPORTES_POR_FASE));
        console.log('✅ Informes automáticos generados:', cuestionarios.length);
      }
    }catch(e){
      console.error('Error generando informes:', e);
    }
  }, 300);
  
  // 🔄 CARGAR DATOS INICIALES SI ESTÁ VACÍO
  setTimeout(function(){
    try{
      const dbActual = JSON.parse(localStorage.getItem('sgrt_terceros_db_shared') || '{}');
      if(!window.SGRT_DISABLE_AUTO_DEMO && (!dbActual || Object.keys(dbActual).length === 0)){
        console.log('🔄 Base de datos vacía - Cargando datos iniciales...');
        // Insertar datos completos
        const DATOS_INICIALES = {
          "860005080": {"nit":"860005080","nombre":"Banco Popular Colombia","domicilio":"Calle 60 #43-45, Medellín","supervisor":"Juan Carlos Pérez","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-15T00:00:00Z","supervisores":[{"nombre":"Juan Carlos Pérez","cargo":"Supervisor Senior","proceso":"Gestión Financiera"},{"nombre":"María Rodríguez","cargo":"Coordinadora","proceso":"Evaluación de Riesgos"}],"contratos":[{"num":"CT-2024-BP-001","objeto":"Servicios de Crédito y Cobranza","fini":"2024-01-15","ffin":"2024-12-31","estado":"En Ejecucion","valor":"250000000","supervisor_asociado":"Juan Carlos Pérez","procesos":"Operaciones Financieras, Gestión de Crédito","observaciones":"Contrato crítico para operaciones"},{"num":"CT-2024-BP-002","objeto":"Auditoría de Riesgos Operacionales","fini":"2024-02-01","ffin":"2024-06-30","estado":"En Ejecucion","valor":"180000000","supervisor_asociado":"María Rodríguez","procesos":"Auditoría Interna, Control de Riesgos","observaciones":"Auditoría trimestral programada"},{"num":"CT-2024-BP-003","objeto":"Gestión de Cumplimiento Normativo","fini":"2024-03-01","ffin":"2024-12-31","estado":"Terminado","valor":"150000000","supervisor_asociado":"Juan Carlos Pérez","procesos":"Cumplimiento Regulatorio, LAFT","observaciones":"Finalizado exitosamente"}],"dims":[{"tipologia":"Operativo","nivel":4,"calificacion":4},{"tipologia":"Continuidad de Negocio","nivel":4,"calificacion":4},{"tipologia":"Seguridad de la Información","nivel":5,"calificacion":5},{"tipologia":"Cumplimiento","nivel":4,"calificacion":4},{"tipologia":"Fraude y Corrupción","nivel":3,"calificacion":3},{"tipologia":"LAFT","nivel":4,"calificacion":4}],"prom":4.0,"zona":"ALTO","evaluaciones":[{"id":"e1","tipologia":"Operativo","completada":true,"calificacion":4,"fecha_inicio":"2024-02-01","fecha_fin":"2024-02-15","respuestas":{"101":"Si","102":"Si","103":"Si"}},{"id":"e2","tipologia":"Cumplimiento","completada":true,"calificacion":4,"fecha_inicio":"2024-02-10","fecha_fin":"2024-02-25","respuestas":{"401":"Si","402":"Si"}},{"id":"e3","tipologia":"Seguridad de la Información","completada":true,"calificacion":5,"fecha_inicio":"2024-02-15","fecha_fin":"2024-03-01","respuestas":{"301":"Si","302":"Si","303":"Si"}}],"nivel_riesgo":"ALTO"},
          "901226600": {"nit":"901226600","nombre":"Seguros Monterrey New York Life","domicilio":"Carrera 7 #156-85, Bogotá","supervisor":"María García López","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-10T00:00:00Z","supervisores":[{"nombre":"María García López","cargo":"Jefe de Riesgos","proceso":"Evaluación de Pólizas"},{"nombre":"Carlos Mendez","cargo":"Especialista","proceso":"Análisis de Seguros"}],"contratos":[{"num":"CT-2024-SMN-001","objeto":"Pólizas de Seguros Complementarios","fini":"2024-01-01","ffin":"2024-12-31","estado":"En Ejecucion","valor":"320000000","supervisor_asociado":"María García López","procesos":"Seguros, Cobertura de Riesgos","observaciones":"Cobertura anual para pensionados"},{"num":"CT-2024-SMN-002","objeto":"Asesoría en Gestión de Siniestros","fini":"2024-02-15","ffin":"2024-08-15","estado":"En Ejecucion","valor":"95000000","supervisor_asociado":"Carlos Mendez","procesos":"Manejo de Siniestros, Indemnización","observaciones":"Servicio de asesoría técnica"}],"dims":[{"tipologia":"Operativo","nivel":3,"calificacion":3},{"tipologia":"Continuidad de Negocio","nivel":3,"calificacion":3},{"tipologia":"Seguridad de la Información","nivel":4,"calificacion":4},{"tipologia":"Cumplimiento","nivel":3,"calificacion":3},{"tipologia":"Fraude y Corrupción","nivel":2,"calificacion":2},{"tipologia":"LAFT","nivel":3,"calificacion":3}],"prom":3.0,"zona":"MEDIO","evaluaciones":[{"id":"e4","tipologia":"Cumplimiento","completada":true,"calificacion":3,"fecha_inicio":"2024-02-10","fecha_fin":"2024-02-25","respuestas":{"401":"Si","402":"Parcialmente"}},{"id":"e5","tipologia":"Operativo","completada":true,"calificacion":3,"fecha_inicio":"2024-02-20","fecha_fin":"2024-03-05","respuestas":{"101":"Si","102":"Parcialmente"}}],"nivel_riesgo":"MEDIO"},
          "830016840": {"nit":"830016840","nombre":"IBM Colombia","domicilio":"Calle 72 #13-45, Bogotá","supervisor":"Carlos Mendoza Flores","entidad":"colpensiones","estado":"Activo","fecha_creacion":"2024-01-05T00:00:00Z","supervisores":[{"nombre":"Carlos Mendoza Flores","cargo":"Jefe de TI","proceso":"Infraestructura Tecnológica"},{"nombre":"Patricia González","cargo":"Especialista Seguridad","proceso":"Ciberseguridad"}],"contratos":[{"num":"CT-2024-IBM-001","objeto":"Servicios de Infraestructura y Cloud Computing","fini":"2024-01-10","ffin":"2025-01-09","estado":"En Ejecucion","valor":"500000000","supervisor_asociado":"Carlos Mendoza Flores","procesos":"Cloud, Infraestructura, Hosting","observaciones":"Servicio crítico de infraestructura"},{"num":"CT-2024-IBM-002","objeto":"Soporte Técnico 24/7","fini":"2024-01-10","ffin":"2025-01-09","estado":"En Ejecucion","valor":"280000000","supervisor_asociado":"Patricia González","procesos":"Soporte Técnico, Mantenimiento","observaciones":"SLA 99.9% uptime"},{"num":"CT-2024-IBM-003","objeto":"Evaluación de Seguridad Informática","fini":"2024-02-01","ffin":"2024-12-31","estado":"Terminado","valor":"150000000","supervisor_asociado":"Patricia González","procesos":"Ciberseguridad, Auditoría de Seguridad","observaciones":"Evaluación integral completada"}],"dims":[{"tipologia":"Operativo","nivel":5,"calificacion":5},{"tipologia":"Continuidad de Negocio","nivel":5,"calificacion":5},{"tipologia":"Seguridad de la Información","nivel":5,"calificacion":5},{"tipologia":"Cumplimiento","nivel":4,"calificacion":4},{"tipologia":"Fraude y Corrupción","nivel":4,"calificacion":4},{"tipologia":"LAFT","nivel":4,"calificacion":4}],"prom":4.5,"zona":"EXTREMO","evaluaciones":[{"id":"e6","tipologia":"Seguridad de la Información","completada":true,"calificacion":5,"fecha_inicio":"2024-02-05","fecha_fin":"2024-02-20","respuestas":{"301":"Si","302":"Si","303":"Si"}},{"id":"e7","tipologia":"Continuidad de Negocio","completada":true,"calificacion":5,"fecha_inicio":"2024-02-15","fecha_fin":"2024-03-01","respuestas":{"201":"Si","202":"Si"}},{"id":"e8","tipologia":"Operativo","completada":true,"calificacion":5,"fecha_inicio":"2024-02-25","fecha_fin":"2024-03-10","respuestas":{"101":"Si","102":"Si","103":"Si"}}],"nivel_riesgo":"EXTREMO"}
        };
        
        window.TERCEROS_DB = DATOS_INICIALES;
        localStorage.setItem('sgrt_terceros_db_shared', JSON.stringify(DATOS_INICIALES));
        console.log('✅ 3 terceros cargados con datos completos en todas las fases');
        
        // 🎯 CARGAR CUESTIONARIOS COMPLETADOS
        setTimeout(function(){
          try{
            if(!window.REPORTES_POR_FASE) window.REPORTES_POR_FASE = {};
            
            // Cuestionarios respondidos para Banco Popular
            const cuest_BP = [
              {nit:"860005080",tipologia:"Operativo",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-01",fecha_fin:"2024-02-15",calificacion:4,respuestas:{"101":"Si","102":"Si","103":"Si","104":"Parcialmente","105":"Si","106":"Si","107":"No","108":"Si"},porcentaje:87,observaciones:"Procesos operacionales bien estructurados"},
              {nit:"860005080",tipologia:"Cumplimiento",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-10",fecha_fin:"2024-02-25",calificacion:4,respuestas:{"401":"Si","402":"Si","403":"Parcialmente","404":"Si","405":"Si","406":"Si","407":"Si","408":"Si"},porcentaje:90,observaciones:"Cumplimiento normativo adecuado"},
              {nit:"860005080",tipologia:"Seguridad de la Información",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-15",fecha_fin:"2024-03-01",calificacion:5,respuestas:{"301":"Si","302":"Si","303":"Si","304":"Si","305":"Si","306":"Si","307":"Si","308":"Si","309":"Si","310":"Si"},porcentaje:100,observaciones:"Excelentes controles de seguridad"},
              {nit:"860005080",tipologia:"LAFT",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-20",fecha_fin:"2024-03-05",calificacion:4,respuestas:{"501":"Si","502":"Si","503":"Si","504":"Parcialmente","505":"Si","506":"Si"},porcentaje:85,observaciones:"LAFT implementado correctamente"}
            ];
            
            // Cuestionarios respondidos para Seguros Monterrey
            const cuest_SMN = [
              {nit:"901226600",tipologia:"Cumplimiento",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-10",fecha_fin:"2024-02-25",calificacion:3,respuestas:{"401":"Si","402":"Parcialmente","403":"Parcialmente","404":"Si","405":"Si","406":"No","407":"Parcialmente","408":"Si"},porcentaje:70,observaciones:"Necesita mejorar en algunos controles"},
              {nit:"901226600",tipologia:"Operativo",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-20",fecha_fin:"2024-03-05",calificacion:3,respuestas:{"101":"Si","102":"Parcialmente","103":"Si","104":"Parcialmente","105":"Si","106":"No","107":"Parcialmente","108":"Si"},porcentaje:68,observaciones:"Procesos operacionales adecuados"},
              {nit:"901226600",tipologia:"Seguridad de la Información",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-03-01",fecha_fin:"2024-03-10",calificacion:4,respuestas:{"301":"Si","302":"Si","303":"Si","304":"Parcialmente","305":"Si","306":"Si","307":"Si","308":"Si","309":"No","310":"Si"},porcentaje:85,observaciones:"Seguridad en línea fortalecida"}
            ];
            
            // Cuestionarios respondidos para IBM
            const cuest_IBM = [
              {nit:"830016840",tipologia:"Seguridad de la Información",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-05",fecha_fin:"2024-02-20",calificacion:5,respuestas:{"301":"Si","302":"Si","303":"Si","304":"Si","305":"Si","306":"Si","307":"Si","308":"Si","309":"Si","310":"Si"},porcentaje:100,observaciones:"Seguridad de nivel empresarial"},
              {nit:"830016840",tipologia:"Continuidad de Negocio",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-15",fecha_fin:"2024-03-01",calificacion:5,respuestas:{"201":"Si","202":"Si","203":"Si","204":"Si","205":"Si","206":"Si","207":"Si","208":"Si","209":"Si"},porcentaje:100,observaciones:"Plan de continuidad de negocio excelente"},
              {nit:"830016840",tipologia:"Operativo",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-02-25",fecha_fin:"2024-03-10",calificacion:5,respuestas:{"101":"Si","102":"Si","103":"Si","104":"Si","105":"Si","106":"Si","107":"Si","108":"Si"},porcentaje:100,observaciones:"Operaciones de nivel superior"},
              {nit:"830016840",tipologia:"Cumplimiento",completada:true,estado:"COMPLETADO",fecha_inicio:"2024-03-05",fecha_fin:"2024-03-15",calificacion:4,respuestas:{"401":"Si","402":"Si","403":"Si","404":"Si","405":"Parcialmente","406":"Si","407":"Si","408":"Si"},porcentaje:95,observaciones:"Cumplimiento normativo superior"}
            ];
            
            // Guardar cuestionarios en REPORTES_POR_FASE
            window.REPORTES_POR_FASE['ambiente_control'] = [...cuest_BP, ...cuest_SMN, ...cuest_IBM];
            localStorage.setItem('sgrt_reportes_fases_auto', JSON.stringify(window.REPORTES_POR_FASE));
            
            console.log('✅ Cuestionarios cargados:', Object.keys(window.REPORTES_POR_FASE));
          }catch(e){
            console.error('Error cargando cuestionarios:', e);
          }
        }, 100);
        
        // Renderizar
        setTimeout(function(){
          try{ if(typeof clsRender === 'function') clsRender(); }catch(e){}
          try{ if(typeof clsInitDash === 'function') clsInitDash(); }catch(e){}
          try{ if(typeof renderizarGraficasReportes === 'function') renderizarGraficasReportes(); }catch(e){}
        }, 300);
      }
    }catch(e){
      console.error('Error en carga inicial:', e);
    }
  }, 800);
  
  // Pre-populate dashboard with static data before login
  try{
    const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    s('ms-ext',17);s('ms-alto',5);s('ms-med',5);s('ms-bajo',3);s('ms-total',30);
    s('matrix-count','30 riesgos registrados');
    s('dash-ext',17);s('dash-alto',5);s('dash-med',5);s('dash-bajo',3);
    s('kpi-extremos',17);s('kpi-total-riesgos',30);
  }catch(e){}
});

// ─── FORMATO VALOR CONTRATO ──────────────────────────
function formatValorContrato(input){
  // Remove everything except digits
  const raw = input.value.replace(/[^0-9]/g, '');
  if(!raw){ input.value=''; return; }
  // Format with dots as thousand separators (Colombian style)
  const num = parseInt(raw, 10);
  input.value = num.toLocaleString('es-CO');
  // Store raw numeric value in data attribute for saving
  input.dataset.raw = raw;
}

// ─── GUARDAR ACCIÓN SEGUIMIENTO ──────────────────────
function guardarAccionSeguimiento(){
  var riesgo=document.getElementById('ac-riesgo')?.value.trim()||'—';
  var tipo=document.getElementById('ac-tipo')?.value||'—';
  var accion=document.getElementById('ac-accion')?.value.trim();
  var resp=document.getElementById('ac-resp')?.value.trim()||'—';
  var fimpl=document.getElementById('ac-fimpl')?.value||'—';
  var fseg=document.getElementById('ac-fseg')?.value||'—';
  var desc=document.getElementById('ac-desc')?.value.trim()||'—';
  var estado=document.getElementById('ac-estado')?.value||'Pendiente';
  if(!accion){showToast('Escribe la acción de mejora','error',2000);return;}
  var chips={'Pendiente':'c-pend','En Progreso':'c-rev','Completado':'c-ok'};
  var tbody=document.getElementById('tbody-seguimiento');
  if(tbody){
    var tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+riesgo+'</b><br><span style="font-size:10px;color:#6B7280">'+tipo+'</span></td>'
      +'<td style="font-size:11px;">'+accion+'</td>'
      +'<td>'+resp+'</td><td>'+fimpl+'</td><td>'+fseg+'</td>'
      +'<td style="font-size:11px;">'+desc+'</td>'
      +'<td><span class="chip '+(chips[estado]||'c-pend')+'">'+estado+'</span></td>';
    tbody.appendChild(tr);
  }
  ['ac-riesgo','ac-accion','ac-resp','ac-desc'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  ['ac-fimpl','ac-fseg'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  closeM('m-accion');
  showToast('Acción guardada','success',2500);
}
