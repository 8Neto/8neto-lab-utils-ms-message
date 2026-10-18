import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { metrics, NodeSDK } from '@opentelemetry/sdk-node';
import { GRAFANA_URL } from '../config/index.js';
import { ConsoleMetricExporter } from './index.js';

// This module must load before Nest, Express and the HTTP client.
process.env.OTEL_SERVICE_NAME ??= '8neto-lab-utils-ms-message';
process.env.OTEL_EXPORTER_OTLP_PROTOCOL ??= 'http/protobuf';
process.env.OTEL_LOGS_EXPORTER ??= 'none';

// GRAFANA_URL is the OTLP HTTP base URL, not the Grafana dashboard URL.
if (GRAFANA_URL?.trim()) {
  const endpoint = GRAFANA_URL.trim().replace(/\/+$/, '');
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = endpoint;
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = `${endpoint}/v1/traces`;
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = `${endpoint}/v1/metrics`;
  process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = `${endpoint}/v1/logs`;
  process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
  process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/protobuf';
  process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL = 'http/protobuf';
}

const sdk = new NodeSDK({
  metricReaders: [
    new metrics.PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
    new metrics.PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
    }),
  ],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});
sdk.start();

export const telemetryLifecycle = {
  async onApplicationShutdown(): Promise<void> {
    await sdk.shutdown();
  },
};
