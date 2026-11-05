// Structured logging utility for Supabase Edge Functions
//
// Provides consistent, structured logging with automatic PII redaction
// and log levels. Replaces raw console.log/error/warn/info calls.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  functionName?: string;
}

/**
 * Keys that should never appear in logs (PII, secrets, tokens).
 * Values for these keys are automatically redacted.
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'service_role_key',
  'serviceRoleKey',
  'anonKey',
  'authorization',
  'cookie',
  'session',
  'email',
  'phone',
  'full_name',
  'name',
  'address',
  'credit_card',
  'ssn',
  'secret',
  'key',
]);

/**
 * Redact sensitive values from an object (shallow).
 */
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    if (SENSITIVE_KEYS.has(keyLower)) {
      out[k] = '[REDACTED]';
    } else if (typeof v === 'string' && v.length > 200) {
      // Truncate long strings (e.g., base64 images, long HTML)
      out[k] = v.slice(0, 200) + '... [truncated]';
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Create a logger bound to a specific function name.
 */
export function createLogger(functionName: string) {
  return {
    debug(message: string, context?: Record<string, unknown>) {
      log('debug', functionName, message, context);
    },
    info(message: string, context?: Record<string, unknown>) {
      log('info', functionName, message, context);
    },
    warn(message: string, context?: Record<string, unknown>) {
      log('warn', functionName, message, context);
    },
    error(message: string, context?: Record<string, unknown> | Error) {
      if (context instanceof Error) {
        log('error', functionName, message, {
          error: context.message,
          stack: context.stack,
        });
      } else {
        log('error', functionName, message, context);
      }
    },
  };
}

/**
 * Core logging function.
 */
function log(
  level: LogLevel,
  functionName: string,
  message: string,
  context?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    functionName,
    context: context ? redactSensitive(context) : undefined,
  };

  // In Deno/Edge Functions, console methods map to the platform logger
  // which adds its own timestamp/level. We output structured JSON for
  // log aggregation (e.g., Supabase Logs, Datadog, etc.).
  const consoleMethod = level === 'debug' ? 'log' : level;
  console[consoleMethod](JSON.stringify(entry));
}

/**
 * Default logger for modules that don't need a specific function name.
 */
export const logger = createLogger('app');

/**
 * Helper to log HTTP request/response metadata safely.
 */
export function logHttpRequest(
  logger: ReturnType<typeof createLogger>,
  req: Request,
  extra?: Record<string, unknown>
) {
  const url = new URL(req.url);
  logger.info('HTTP request', {
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: {
      'user-agent': req.headers.get('user-agent'),
      'content-type': req.headers.get('content-type'),
      // Never log Authorization, Cookie, or x-forwarded-for
    },
    ...extra,
  });
}

/**
 * Helper to log HTTP response metadata safely.
 */
export function logHttpResponse(
  logger: ReturnType<typeof createLogger>,
  status: number,
  extra?: Record<string, unknown>
) {
  logger.info('HTTP response', { status, ...extra });
}

/**
 * Helper to log Supabase operations safely.
 */
export function logSupabaseOperation(
  logger: ReturnType<typeof createLogger>,
  operation: string,
  table: string,
  extra?: Record<string, unknown>
) {
  logger.debug(`Supabase ${operation}`, { table, ...extra });
}

/**
 * Helper to log email send attempts safely.
 */
export function logEmailSend(
  logger: ReturnType<typeof createLogger>,
  type: 'admin' | 'confirmation',
  toDomain: string, // only the domain part, not full email
  success: boolean,
  error?: string
) {
  if (success) {
    logger.info('Email sent', { type, toDomain });
  } else {
    logger.error(`Email send failed (${type})`, { type, toDomain, error: error?.slice(0, 200) });
  }
}