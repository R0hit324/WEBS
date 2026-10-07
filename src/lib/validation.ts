/**
 * Validation Library for Matsya Shooting Sports Academy
 * Reusable validation functions for forms and API inputs
 */

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T> {
  required?: boolean;
  rules?: ValidationRule<T>[];
  sanitize?: (value: T) => T;
}

export interface ValidationSchema {
  [fieldName: string]: FieldValidation<unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, unknown>;
}

/**
 * Common validation rules
 */
export const rules = {
  required: (message = 'This field is required'): ValidationRule<unknown> => ({
    validate: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => typeof value === 'string' && value.trim().length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => typeof value === 'string' && value.trim().length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true; // Let required rule handle empty
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      return phoneRegex.test(value.trim());
    },
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule<string | number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Number(value));
    },
    message,
  }),

  integer: (message = 'Must be a whole number'): ValidationRule<string | number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return Number(value) <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value.trim());
    },
    message,
  }),

  oneOf: <T>(options: T[], message = 'Invalid selection'): ValidationRule<T> => ({
    validate: (value) => {
      if (value === '' || value === null || value === undefined) return true;
      return options.includes(value);
    },
    message,
  }),

  custom: <T>(validator: (value: T) => boolean, message: string): ValidationRule<T> => ({
    validate: validator,
    message,
  }),
};

/**
 * Sanitization functions
 */
export const sanitize = {
  trim: (value: string): string => value.trim(),
  lowercase: (value: string): string => value.toLowerCase(),
  uppercase: (value: string): string => value.toUpperCase(),
  stripHtml: (value: string): string => value.replace(/<[^>]*>/g, ''),
  escapeHtml: (value: string): string =>
    value
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;'),
  digitsOnly: (value: string): string => value.replace(/\D/g, ''),
  alphanumeric: (value: string): string => value.replace(/[^a-zA-Z0-9]/g, ''),
};

/**
 * Validate a single field
 */
export function validateField<T>(
  value: T,
  fieldName: string,
  validation: FieldValidation<T>
): { isValid: boolean; error: string | null; sanitizedValue: T } {
  // Check required
  if (validation.required) {
    const requiredRule = rules.required();
    if (!requiredRule.validate(value)) {
      return { isValid: false, error: requiredRule.message, sanitizedValue: value };
    }
  }

  // Skip other validations if value is empty and not required
  if (!validation.required && (value === null || value === undefined || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: true, error: null, sanitizedValue: value };
  }

  // Apply sanitization first
  let sanitizedValue = value;
  if (validation.sanitize) {
    sanitizedValue = validation.sanitize(value);
  }

  // Run validation rules
  if (validation.rules) {
    for (const rule of validation.rules) {
      if (!rule.validate(sanitizedValue)) {
        return { isValid: false, error: rule.message, sanitizedValue: value };
      }
    }
  }

  return { isValid: true, error: null, sanitizedValue };
}

/**
 * Validate an entire object against a schema
 */
export function validateData<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, unknown> = {};

  for (const [fieldName, validation] of Object.entries(schema)) {
    const value = data[fieldName];
    const result = validateField(value, fieldName, validation);

    if (!result.isValid) {
      errors[fieldName] = result.error!;
    }

    sanitizedData[fieldName] = result.sanitizedValue;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Pre-defined validation schemas for common forms
 */
export const schemas = {
  contactForm: {
    name: {
      required: true,
      rules: [rules.minLength(2), rules.maxLength(100)],
      sanitize: sanitize.trim,
    },
    phone: {
      required: true,
      rules: [rules.phone()],
      sanitize: sanitize.digitsOnly,
    },
    email: {
      required: true,
      rules: [rules.email()],
      sanitize: (v: string) => sanitize.trim(v).toLowerCase(),
    },
    subject: {
      required: false,
      rules: [rules.maxLength(100)],
      sanitize: sanitize.trim,
    },
    message: {
      required: true,
      rules: [rules.minLength(10), rules.maxLength(5000)],
      sanitize: sanitize.trim,
    },
  } satisfies ValidationSchema,

  registrationForm: {
    full_name: {
      required: true,
      rules: [rules.minLength(2), rules.maxLength(100)],
      sanitize: sanitize.trim,
    },
    age: {
      required: false,
      rules: [rules.integer(), rules.min(5), rules.max(100)],
    },
    phone: {
      required: true,
      rules: [rules.phone()],
      sanitize: sanitize.digitsOnly,
    },
    email: {
      required: true,
      rules: [rules.email()],
      sanitize: (v: string) => sanitize.trim(v).toLowerCase(),
    },
    city: {
      required: false,
      rules: [rules.maxLength(100)],
      sanitize: sanitize.trim,
    },
    interested_range: {
      required: false,
      rules: [rules.oneOf(['10m', '25m', '50m', ''])],
      sanitize: sanitize.trim,
    },
    experience_level: {
      required: false,
      rules: [rules.oneOf(['beginner', 'intermediate', 'advanced', 'competitive', ''])],
      sanitize: sanitize.trim,
    },
    message: {
      required: false,
      rules: [rules.maxLength(5000)],
      sanitize: sanitize.trim,
    },
  } satisfies ValidationSchema,
};

/**
 * Sanitize data for safe storage/display
 */
export function sanitizeForStorage<T extends Record<string, unknown>>(
  data: T,
  allowedFields: string[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  for (const field of allowedFields) {
    if (field in data && data[field] !== undefined) {
      let value = data[field];
      if (typeof value === 'string') {
        value = sanitize.stripHtml(value) as T[keyof T];
      }
      sanitized[field] = value;
    }
  }
  return sanitized;
}

/**
 * Create safe error response for API
 */
export function createApiError(code: string, message: string, details?: Record<string, unknown>) {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Safe error messages for public API responses
 */
export const safeErrorMessages = {
  validation_failed: 'Please check your input and try again.',
  unauthorized: 'Authentication required.',
  forbidden: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  server_error: 'An unexpected error occurred. Please try again later.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
  invalid_input: 'Invalid input provided.',
  database_error: 'A database error occurred. Please contact support.',
} as const;