// Lightweight no-op observability helpers without external deps
export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (context) {
    // eslint-disable-next-line no-console
    console.error('Exception captured', { error, context });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('Exception captured', error);
}

export function withSpan<T>(name: string, _op: string, fn: (span: { end: () => void }) => T) {
  const span = { end: () => void 0 };
  try {
    return fn(span);
  } finally {
    span.end();
  }
}

export const logger = console;


