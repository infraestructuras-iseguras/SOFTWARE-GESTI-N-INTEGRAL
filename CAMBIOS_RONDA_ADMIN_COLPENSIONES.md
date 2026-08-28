# SGRT — Cambios de la ronda Administrador de Riesgos / Colpensiones

## Alcance de la implementación

Esta ronda conserva el diseño modular, los colores, los menús, las fórmulas de riesgo y los roles existentes. El cambio operativo se aplica únicamente al rol **Administrador de Riesgos**, identificado en la demo por `admin_riesgos` y la entidad `colpensiones`.

El Administrador de Riesgos consulta el conjunto compartido de terceros de Colpensiones. Esto permite que los registros creados por el Evaluador de Colpensiones y por el Administrador aparezcan en la misma tabla y alimenten el mismo flujo de clasificación, Ambiente de Control, análisis de riesgos, seguimiento, documentación, informes y Power BI. **Ecopetrol y Bancolombia no forman parte del alcance de este rol.** La comparación entre clientes continúa reservada para ISeguras/Superadministrador.

## Registro individual y alcance fijo

El registro individual conserva su formulario original. En el contexto del Administrador, la organización queda fijada en Colpensiones para evitar que un alta operativa se asigne accidentalmente a otra entidad. El formulario mantiene los campos de NIT, nombre del tercero, domicilio, contratos y supervisores.

Los contratos aceptan número, fechas de inicio y fin, objeto, estado, valor, procesos soportados y observaciones. Los supervisores aceptan nombre, cargo, proceso de supervisión y contrato asociado. Las estructuras importadas se normalizan al mismo modelo de contratos y supervisores que usa el formulario individual.

## Importación asistida

En la parte superior de **Registro de Terceros / Clasificación** se añadió el botón discreto **Importar terceros**. No sustituye el registro individual. El usuario puede seleccionar uno o varios archivos y debe revisar la tabla antes de presionar **Confirmar importación válida**.

| Fuente | Tratamiento local | Resultado |
|---|---|---|
| CSV | Lectura de encabezados y filas con mapeo flexible de nombres | Previsualización y validación antes de guardar |
| XLSX/XLS | Lectura mediante SheetJS cuando la librería está disponible | Primera hoja convertida a filas y previsualizada |
| PDF textual | Lectura de texto seleccionable con PDF.js y etiquetas conocidas | Extracción de campos autorizados y revisión manual |
| PDF escaneado | No se presenta como OCR/IA real en esta SPA | Requiere OCR/backend seguro autorizado |

La importación solo considera estos campos: organización/cliente, NIT, nombre del tercero, domicilio, número de contrato, inicio, fin, objeto, estado, valor, procesos, observaciones, nombre del supervisor, cargo, proceso de supervisión y contrato asociado. No se importan contraseñas, tokens, claves, datos fuera del registro de terceros ni configuraciones internas.

Antes de guardar, el sistema muestra el estado de cada fila, NIT, tercero, domicilio, contratos, supervisores y observaciones. Las filas sin NIT o sin nombre quedan observadas o rechazadas; los duplicados por NIT se omiten y la confirmación es explícita. Los registros importados se marcan como locales/demostrativos cuando corresponde y no se sincronizan automáticamente con Azure.

## Datos demo integrales

El botón **Completar demo local** solo está disponible para el Administrador y crea registros únicos de Colpensiones sin sobrescribir los terceros existentes. Los demos incluyen información general, contratos, supervisores asociados, clasificación, respuestas de Ambiente de Control, filas de matriz de riesgo, seguimiento y documentos de evidencia locales. Se marcan con `demo: true` y `sincronizado: false`.

La demostración se guarda en las estructuras locales ya utilizadas por SGRT, incluyendo la tabla compartida de terceros, respuestas del cuestionario, matriz de riesgos y repositorio documental local. Su propósito es permitir la comprobación punta a punta en un entorno de prueba; no representa información contractual real.

## Reportes y Power BI del Administrador

Los reportes operativos del Administrador se construyen con un snapshot restringido a Colpensiones. Los KPI, la distribución por exposición, los riesgos, la tabla de detalle y las exportaciones CSV/JSON/HTML no deben incorporar registros de Ecopetrol ni de Bancolombia. El asistente explica también esta separación.

El dashboard multiempresa de ISeguras no se modifica. Allí se mantienen las tres entidades demo, el consolidado global, el repositorio por empresa y la generación final de informe Word y presentación ejecutiva PowerPoint.

## Asistente virtual

El asistente actualizado explica el flujo de importación, los campos autorizados, la confirmación previa, la lectura de PDF textual y la limitación de PDF escaneado. También documenta el alcance exclusivo de Colpensiones para el Administrador, la ubicación de Power BI y la diferencia entre respaldo local y conexión remota.

No se expone ninguna API key de IA en el navegador. La lectura remota de Azure no se ejecuta por defecto en la SPA local: una conexión productiva debe configurarse desde un backend/despliegue autorizado. Cuando Azure no está disponible, el sistema conserva el respaldo local y no afirma que la conexión esté activa.

## Validación ejecutada

Se ejecutó `node --check` sobre los 21 módulos JavaScript y se verificó la referencia de `js/21-admin-colpensiones-importacion.js` al final de `index.html`. En navegador se comprobó el inicio de sesión del Administrador, el panel de Colpensiones, Reportes/Power BI, importación CSV y extracción PDF textual con previsualización.

También se verificó que el Evaluador conserva su menú sin Dashboard ni Seguimiento y que comparte registros de Colpensiones. Finalmente, ISeguras conservó Dashboard, tres entidades, comparación global y los botones de informe consolidado Word y ejecutivo PowerPoint.

## Entrega y despliegue

Para actualizar una instalación estática, se recomienda reemplazar la carpeta completa por el paquete de esta ronda. Es importante conservar el directorio `js/` completo porque el nuevo módulo 21 se carga desde `index.html`. En un despliegue real, se deben configurar las variables y el backend documentados en el manual técnico general; esta entrega no afirma una migración productiva a Azure.
