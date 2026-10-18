import { api } from '@opentelemetry/sdk-node';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { format } from 'node:util';

let installed = false;
let emitting = false;

const levels = {
  log: ['INFO', SeverityNumber.INFO],
  info: ['INFO', SeverityNumber.INFO],
  warn: ['WARN', SeverityNumber.WARN],
  error: ['ERROR', SeverityNumber.ERROR],
  debug: ['DEBUG', SeverityNumber.DEBUG],
} as const;

export function installConsoleTrace(): void {
  if (installed) return;

  const logger = logs.getLogger('console');
  for (const method of Object.keys(levels) as (keyof typeof levels)[]) {
    const originalLog = console[method].bind(console);
    console[method] = (...args: unknown[]): void => {
      const spanContext = api.trace.getActiveSpan()?.spanContext();
      const traceId =
        spanContext && api.isSpanContextValid(spanContext)
          ? spanContext.traceId
          : 'sin-traza';
      const prefix = `[trace_id=${traceId}]`;

      // Keep the first string as the format string for %s, %d, %o, etc.
      if (typeof args[0] === 'string') {
        originalLog(`${prefix} ${args[0]}`, ...args.slice(1));
      } else {
        originalLog(prefix, ...args);
      }

      // Exporter diagnostics must not recursively generate more log records.
      if (emitting) return;
      emitting = true;
      try {
        const error = args.find((arg): arg is Error => arg instanceof Error);
        logger.emit({
          context: api.context.active(),
          timestamp: new Date(),
          severityText: levels[method][0],
          severityNumber: levels[method][1],
          body: format(...args),
          attributes: error
            ? {
                'exception.type': error.name,
                'exception.message': error.message,
                'exception.stacktrace': error.stack ?? '',
              }
            : undefined,
        });
      } catch {
        // Logging failures must not interrupt application code.
      } finally {
        emitting = false;
      }
    };
  }

  installed = true;
}
