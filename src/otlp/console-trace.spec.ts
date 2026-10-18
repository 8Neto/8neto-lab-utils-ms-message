import { api, logs, NodeSDK, tracing } from '@opentelemetry/sdk-node';
import { installConsoleTrace } from './console-trace.js';

it('exports console levels with async trace context and flushes pending logs on shutdown', async () => {
  const exporter = new logs.InMemoryLogRecordExporter();
  const sdk = new NodeSDK({
    autoDetectResources: false,
    logRecordProcessors: [
      new logs.BatchLogRecordProcessor({
        exporter,
        scheduledDelayMillis: 60_000,
      }),
    ],
    spanProcessors: [
      new tracing.SimpleSpanProcessor(new tracing.InMemorySpanExporter()),
    ],
    metricReaders: [],
  });
  const exported = vi.spyOn(exporter, 'export');
  const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
  const originals = methods.map((method) => console[method]);
  const outputs = methods.map((method) => {
    const output = vi.fn();
    console[method] = output;
    return output;
  });
  sdk.start();
  try {
    installConsoleTrace();
    installConsoleTrace();
    console.log('outside %d', 42);
    const traceIds: string[] = [];
    await Promise.all(
      [1, 2].map((i) =>
        api.trace
          .getTracer('test')
          .startActiveSpan(`request-${i}`, async (span) => {
            await new Promise((resolve) => setTimeout(resolve, i));
            traceIds.push(span.spanContext().traceId);
            console.info('request %d', i);
            span.end();
          }),
      ),
    );
    console.warn('warning');
    console.error(new Error('failure'));
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    console.debug(circular);
    expect(exported).not.toHaveBeenCalled();
    await sdk.shutdown();
    const records = exported.mock.calls.flatMap(([batch]) => batch);
    expect(records).toHaveLength(6);
    expect(records[0].body).toBe('outside 42');
    expect(records[0].spanContext).toBeUndefined();
    expect(
      records.slice(1, 3).map((record) => record.spanContext?.traceId),
    ).toEqual(traceIds);
    expect(new Set(traceIds).size).toBe(2);
    expect(records.map((record) => record.severityText)).toEqual([
      'INFO',
      'INFO',
      'INFO',
      'WARN',
      'ERROR',
      'DEBUG',
    ]);
    expect(records[4].attributes['exception.message']).toBe('failure');
    expect(records[5].body).toContain('[Circular');
    expect(outputs[0]).toHaveBeenCalledWith(
      '[trace_id=sin-traza] outside %d',
      42,
    );
  } finally {
    methods.forEach((method, i) => {
      console[method] = originals[i];
    });
    vi.restoreAllMocks();
  }
});
