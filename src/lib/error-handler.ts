/**
 * Error Handling Utilities
 *
 * Centralized error handling for consistent error messages and logging.
 * Integrates with the API client error types and provides user-friendly messages.
 *
 * @module error-handler
 */

import { AuthenticationError, RateLimitError, ApiError } from './api-client';
import { ERROR_MESSAGES } from './constants';
import { logger } from './logger';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  /** User-friendly error message */
  error: string;
  /** Error code for programmatic handling */
  code: string;
  /** Additional error details (optional) */
  details?: any;
  /** Suggested action for the user */
  action?: string;
}

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_FAILED = 'AUTH_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Permission errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FORBIDDEN = 'FORBIDDEN',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Handle API errors and convert them to user-friendly error responses
 *
 * @param error - The error to handle
 * @param fallbackMessage - Fallback message if error type is unknown
 * @returns Standardized error response
 *
 * @example
 * ```ts
 * try {
 *   await authenticatedFetch('/api/insights', { method: 'POST', body: data });
 * } catch (error) {
 *   const errorResponse = handleApiError(error, 'Failed to generate insights');
 *   toast({ variant: 'destructive', title: 'Error', description: errorResponse.error });
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  fallbackMessage: string = ERROR_MESSAGES.SERVER_ERROR
): ErrorResponse {
  // Authentication errors
  if (error instanceof AuthenticationError) {
    logger.warn('Authentication error', { error: error.message });
    return {
      error: ERROR_MESSAGES.AUTH_REQUIRED,
      code: ErrorCode.AUTH_REQUIRED,
      action: 'Please log in to continue',
    };
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    logger.warn('Rate limit exceeded', {
      retryAfter: error.retryAfter,
    });
    return {
      error: `${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED} Try again in ${error.retryAfter} seconds.`,
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      details: { retryAfter: error.retryAfter },
      action: `Please wait ${error.retryAfter} seconds before trying again`,
    };
  }

  // API errors with status codes
  if (error instanceof ApiError) {
    logger.error('API error', {
      status: error.status,
      message: error.message,
      details: error.details,
    });

    switch (error.status) {
      case 400:
        return {
          error: ERROR_MESSAGES.INVALID_INPUT,
          code: ErrorCode.INVALID_INPUT,
          details: error.details,
          action: 'Please check your input and try again',
        };

      case 401:
        return {
          error: ERROR_MESSAGES.AUTH_FAILED,
          code: ErrorCode.AUTH_FAILED,
          action: 'Please log in again',
        };

      case 403:
        return {
          error: ERROR_MESSAGES.PERMISSION_DENIED,
          code: ErrorCode.PERMISSION_DENIED,
          action: 'You do not have permission for this action',
        };

      case 404:
        return {
          error: ERROR_MESSAGES.NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
          action: 'The requested resource was not found',
        };

      case 409:
        return {
          error: 'This resource already exists',
          code: ErrorCode.ALREADY_EXISTS,
          details: error.details,
        };

      case 429:
        return {
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          details: error.details,
          action: 'Please wait before trying again',
        };

      case 503:
        return {
          error: 'Service temporarily unavailable',
          code: ErrorCode.SERVICE_UNAVAILABLE,
          action: 'Please try again in a few moments',
        };

      default:
        return {
          error: error.message || ERROR_MESSAGES.SERVER_ERROR,
          code: ErrorCode.SERVER_ERROR,
          details: error.details,
          action: 'Please try again',
        };
    }
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    logger.error('Network error', { error: error.message });
    return {
      error: ERROR_MESSAGES.NETWORK_ERROR,
      code: ErrorCode.NETWORK_ERROR,
      action: 'Please check your internet connection and try again',
    };
  }

  // Generic Error objects
  if (error instanceof Error) {
    logger.error('Generic error', {
      name: error.name,
      message: error.message,
    });
    return {
      error: error.message || fallbackMessage,
      code: ErrorCode.UNKNOWN_ERROR,
      details: error.name,
    };
  }

  // Unknown error types
  logger.error('Unknown error type', { error });
  return {
    error: fallbackMessage,
    code: ErrorCode.UNKNOWN_ERROR,
  };
}

/**
 * Handle form validation errors from Zod
 *
 * @param error - Zod validation error
 * @returns User-friendly validation error message
 */
export function handleValidationError(error: any): ErrorResponse {
  logger.warn('Validation error', { errors: error.errors });

  const firstError = error.errors?.[0];
  const message = firstError
    ? `${firstError.path.join('.')}: ${firstError.message}`
    : ERROR_MESSAGES.INVALID_INPUT;

  return {
    error: message,
    code: ErrorCode.VALIDATION_FAILED,
    details: error.errors,
    action: 'Please correct the highlighted fields',
  };
}

/**
 * Handle Firestore permission errors
 *
 * @param error - Firestore error
 * @returns User-friendly error message
 */
export function handleFirestoreError(error: any): ErrorResponse {
  logger.error('Firestore error', { error });

  if (error.code === 'permission-denied') {
    return {
      error: ERROR_MESSAGES.PERMISSION_DENIED,
      code: ErrorCode.PERMISSION_DENIED,
      action: 'Please ensure you are logged in with the correct account',
    };
  }

  if (error.code === 'not-found') {
    return {
      error: ERROR_MESSAGES.NOT_FOUND,
      code: ErrorCode.NOT_FOUND,
      action: 'The requested data could not be found',
    };
  }

  if (error.code === 'unavailable') {
    return {
      error: 'Database temporarily unavailable',
      code: ErrorCode.SERVICE_UNAVAILABLE,
      action: 'Please try again in a moment',
    };
  }

  return {
    error: error.message || ERROR_MESSAGES.SERVER_ERROR,
    code: ErrorCode.SERVER_ERROR,
    details: error.code,
  };
}

/**
 * Create a standardized error response
 *
 * Useful for creating custom error responses in API routes.
 *
 * @param message - Error message
 * @param code - Error code
 * @param details - Additional details
 * @returns Error response
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  details?: any
): ErrorResponse {
  return {
    error: message,
    code,
    details,
  };
}

/**
 * Check if an error is retriable
 *
 * Some errors are transient and the operation can be retried.
 *
 * @param error - The error to check
 * @returns true if the error is retriable
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Network errors and server errors are retriable
    return error.status >= 500 || error.status === 408;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network errors are retriable
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Result of the function
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => authenticatedFetch('/api/insights'),
 *   3,
 *   1000
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retriable
      if (!isRetriableError(error)) {
        throw error;
      }

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.info(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  logger.error(`All ${maxRetries} retry attempts failed`, { error: lastError });
  throw lastError;
}

/**
 * Wrap an async function with error handling
 *
 * Useful for wrapping event handlers and callbacks.
 *
 * @param fn - The async function to wrap
 * @param onError - Error handler callback
 * @returns Wrapped function
 *
 * @example
 * ```ts
 * const handleSubmit = withErrorHandling(
 *   async (data) => {
 *     await saveData(data);
 *   },
 *   (error) => {
 *     const errorResponse = handleApiError(error);
 *     toast({ variant: 'destructive', description: errorResponse.error });
 *   }
 * );
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  onError: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      onError(error);
    }
  }) as T;
}
