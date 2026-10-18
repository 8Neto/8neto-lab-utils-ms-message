import { api } from '@opentelemetry/sdk-node';

let installed = false;

export function installConsoleTrace(): void {
  if (installed) return;

  const originalLog = console.log.bind(console);
  console.log = (...args: unknown[]): void => {
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
  };

  installed = true;
}
