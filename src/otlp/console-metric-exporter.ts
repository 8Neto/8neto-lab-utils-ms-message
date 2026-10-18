import { core, metrics } from '@opentelemetry/sdk-node';

export class ConsoleMetricExporter implements metrics.PushMetricExporter {
  export(
    resourceMetrics: metrics.ResourceMetrics,
    resultCallback: (result: core.ExportResult) => void,
  ): void {
    try {
      // console.log('[otel.metrics]', JSON.stringify(resourceMetrics));
      resultCallback({ code: core.ExportResultCode.SUCCESS });
    } catch (error) {
      resultCallback({
        code: core.ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async forceFlush(): Promise<void> {}
  async shutdown(): Promise<void> {}
}
