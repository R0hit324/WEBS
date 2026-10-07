/**
 * Error Handling Library for Matsya Shooting Sports Academy
 * Consistent error handling across the application
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INVALID_INPUT';

export interface AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: Record<string, unknown>;
  isOperational: boolean;
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Base application error class
 */
export class AppErrorClass extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppErrorClass);
    }
  }
}

/**
 * Predefined error constructors
 */
export const Errors = {
  validation: (message: string, details?: Record<string, unknown>) =>
    new AppErrorClass('VALIDATION_ERROR', message, 400, details),

  unauthorized: (message = 'Authentication required') =>
    new AppErrorClass('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Access denied') =>
    new AppErrorClass('FORBIDDEN', message, 403),

  notFound: (resource = 'Resource', details?: Record<string, unknown>) =>
    new AppErrorClass('NOT_FOUND', `${resource} not found`, 404, details),

  conflict: (message: string, details?: Record<string, unknown>) =>
    new AppErrorClass('CONFLICT', message, 409, details),

  rateLimited: (message = 'Too many requests. Please try again later.', retryAfter?: number) =>
    new AppErrorClass('RATE_LIMITED', message, 429, { retryAfter }),

  internal: (message = 'An unexpected error occurred', details?: Record<string, unknown>) =>
    new AppErrorClass('INTERNAL_ERROR', message, 500, details),

  database: (message = 'Database operation failed', details?: Record<string, unknown>) =>
    new AppErrorClass('DATABASE_ERROR', message, 500, details),

  storage: (message = 'Storage operation failed', details?: Record<string, unknown>) =>
    new AppErrorClass('STORAGE_ERROR', message, 500, details),

  externalService: (service: string, message?: string, details?: Record<string, unknown>) =>
    new AppErrorClass('EXTERNAL_SERVICE_ERROR', message || `${service} service unavailable`, 502, {
      service,
      ...details,
    }),

  invalidInput: (message: string, details?: Record<string, unknown>) =>
    new AppErrorClass('INVALID_INPUT', message, 400, details),
};

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppErrorClass;
}

/**
 * Check if an error is operational (expected) vs programming error
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };
  }

  // Unknown/programming error - don't leak details
  console.error('Unexpected error:', error);
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  };
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (isAppError(error)) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      timestamp: error.timestamp,
      details: error.details,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Async wrapper that catches errors and returns standardized result
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export async function tryCatch<T>(
  promise: Promise<T>,
  errorMap?: (error: unknown) => AppError
): Promise<Result<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    const mappedError = errorMap ? errorMap(error) : (isAppError(error) ? error : Errors.internal());
    return { success: false, error: mappedError };
  }
}

/**
 * Synchronous version of tryCatch
 */
export function tryCatchSync<T>(
  fn: () => T,
  errorMap?: (error: unknown) => AppError
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const mappedError = errorMap ? errorMap(error) : (isAppError(error) ? error : Errors.internal());
    return { success: false, error: mappedError };
  }
}

/**
 * Handle errors in Express-style middleware
 */
export function errorHandler(error: unknown, _req: unknown, res: { status: (code: number) => { json: (data: ErrorResponse) => void } }, _next: unknown) {
  const formatted = formatErrorResponse(error);

  const statusCode = isAppError(error) ? error.statusCode : 500;

  res.status(statusCode).json(formatted);
}

/**
 * Async handler wrapper for route handlers
 */
export function asyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T
): T {
  return ((...args: unknown[]) => {
    Promise.resolve(fn(...args)).catch(args[args.length - 1]);
  }) as T;
}