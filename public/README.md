# SGRT — Proyecto modular

Esta versión separa la estructura HTML, los estilos CSS y la lógica JavaScript en archivos independientes. Se conserva el orden de carga de la aplicación para mantener las dependencias entre funciones globales y los botones definidos en el HTML.

## Estructura

```text
SGRT_MODULAR/
├── index.html
├── README.md
├── CAMBIOS_RONDA_ADMIN_COLPENSIONES.md
├── css/
│   └── styles.css
└── js/
    ├── 01-reportes.js
    ├── 02-core.js
    ├── 03-entidades.js
    ├── 04-clasificacion.js
    ├── 05-controles.js
    ├── 06-aprobacion.js
    ├── 07-dashboard-admin.js
    ├── 08-fixes-aplicacion.js
    ├── 09-tipologias.js
    ├── 10-repositorio-evidencias.js
    ├── 11-usuarios.js
    ├── 12-sincronizacion-azure.js
    ├── 13-inicializacion.js
    ├── 14-auto-refresh.js
    ├── 15-datos-simulados.js
    ├── 16-importacion-csv.js
    ├── 17-asistente-virtual.js
    ├── 18-fix-evaluador.js
    ├── 19-cierre-graficas.js
    ├── 20-superadmin-iseguras.js
    ├── 21-admin-colpensiones-importacion.js
    ├── 22-persistencia-clasificacion.js
    ├── 23-saneamiento-registro-inicial.js
    └── 24-fix-flujo-integral.js
```

## Uso

Conserva la estructura de carpetas y abre `index.html` desde la raíz del proyecto. Las rutas relativas del HTML esperan encontrar los estilos en `css/styles.css` y los módulos en `js/`.

La aplicación conserva las librerías externas ya previstas por el proyecto, incluyendo EmailJS y Chart.js, y carga los módulos propios secuencialmente mediante etiquetas `<script src="...">` en `index.html`. Los módulos 21–24 se cargan al final. El módulo 23 ya no elimina registros: solo desactiva la precarga automática de demos. El módulo 24 unifica el flujo Registro → Clasificación → Aprobación → Ambiente de Control/Evaluador y la sincronización del estado extendido.

## Alcance de la ronda actual

El Administrador de Riesgos queda restringido a **Colpensiones**. Sus registros, incluidos los creados por el Evaluador de Colpensiones, se leen de la tabla compartida y alimentan Registro, clasificación, Ambiente de Control, análisis, seguimiento, evidencias, informes y Power BI. La comparación de Colpensiones, Ecopetrol y Bancolombia continúa exclusivamente en ISeguras/Superadministrador.

En Registro de Terceros se conserva el alta individual y se añade **Importar terceros** para archivos CSV, Excel y PDF textual, siempre con previsualización y confirmación explícita. Los PDF escaneados requieren OCR/backend seguro; la SPA no expone API keys ni afirma que lea imágenes como texto.

El paquete **ya no fuerza IBM como único registro**. Se conservan todos los terceros reales creados por registro individual o importación. Los datos demo automáticos quedan desactivados. ISeguras/Superadministrador puede sincronizar y borrar terceros; cuando la API está disponible, el estado extendido también se persiste en Azure SQL.

## Corrección aplicada

El archivo original contenía una etiqueta `<script>` incrustada dentro de un comentario JavaScript abierto. Durante la modularización se cerró ese comentario y se convirtió el fix del evaluador en el módulo independiente `js/18-fix-evaluador.js`, evitando que el último bloque quedara con sintaxis inválida.
