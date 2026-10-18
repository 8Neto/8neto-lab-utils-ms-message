# Logs OTLP

La telemetría se carga antes de Nest en `main.ts`. `console.log`, `info`,
`warn`, `error` y `debug` conservan su salida local y emiten registros OTLP.
Los registros incluyen fecha, severidad, `service.name` y el trace ID/span ID
del contexto activo. Sin un span activo se exportan sin IDs de traza.
Los objetos se formatean con `node:util.format`; los argumentos `Error`
también incluyen atributos `exception.*`.

Ejemplo de configuración para un Collector/Alloy con receptor OTLP HTTP:

```dotenv
GRAFANA_URL=http://localhost:4318
OTEL_LOGS_EXPORTER=otlp
OTEL_SERVICE_NAME=8neto-lab-utils-ms-message
```

`GRAFANA_URL` es la URL base de ingestión OTLP, no la URL del dashboard.
El endpoint de logs será `/v1/logs`. También se puede configurar
`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` con una URL completa independiente.
La autenticación se configura con `OTEL_EXPORTER_OTLP_HEADERS` o
`OTEL_EXPORTER_OTLP_LOGS_HEADERS`, según lo requerido por el receptor.
No guardar credenciales en el repositorio.

El SDK envía lotes y vacía los registros pendientes con `sdk.shutdown()`
desde el hook de cierre de Nest. `OTEL_LOGS_EXPORTER=none` desactiva el envío.
La captura cubre los métodos de consola indicados; no captura escrituras
directas a stdout/stderr ni todos los transportes de otros loggers.

El Collector debe tener un pipeline de logs que envíe a Loki, o se debe usar
el endpoint OTLP de Grafana Cloud. En Grafana Explore, seleccionar Loki y
buscar (con el mapeo predeterminado de atributos):

```logql
{service_name="8neto-lab-utils-ms-message"}
```

Documentación: [ingestión OTLP en Grafana](https://grafana.com/docs/opentelemetry/ingest/)
y [Collector con Loki](https://grafana.com/docs/loki/latest/send-data/otel/otel-collector-getting-started/).
