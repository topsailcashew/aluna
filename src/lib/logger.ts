/**
 * Structured Logging Utility
 *
 * Provides centralized logging with consistent formatting and optional
 * integration with error tracking services (Sentry, LogRocket, etc.).
 *
 * @module logger
 */

/**
 * Log level enum
 */
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: unknown;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Enable console output */
  enableConsole: boolean;
  /** Enable sending to external service */
  enableExternal: boolean;
  /** Include stack traces for errors */
  includeStackTrace: boolean;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableExternal: process.env.NODE_ENV === 'production',
  includeStackTrace: process.env.NODE_ENV !== 'production',
};

/**
 * Current logger configuration
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * Log level priorities for comparison
 */
const LOG_LEVEL_PRIORITY = {
  [LogLevel.ERROR]: 4,
  [LogLevel.WARN]: 3,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 1,
};

/**
 * Check if a log level should be output based on config
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, error } = entry;

  let output = `[${level}] ${timestamp} - ${message}`;

  if (context && Object.keys(context).length > 0) {
    output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
  }

  if (error && config.includeStackTrace) {
    if (error instanceof Error) {
      output += `\n  Error: ${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`;
      }
    } else {
      output += `\n  Error: ${JSON.stringify(error)}`;
    }
  }

  return output;
}

/**
 * Send log to external service (Sentry, LogRocket, etc.)
 *
 * Implement this function to integrate with your error tracking service.
 */
function sendToExternalService(entry: LogEntry): void {
  // TODO: Integrate with Sentry or other error tracking service
  // Example with Sentry:
  // if (entry.level === LogLevel.ERROR && entry.error) {
  //   Sentry.captureException(entry.error, {
  //     extra: { ...entry.context, message: entry.message },
  //   });
  // }
}

/**
 * Core logging function
 */
function log(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error,
  };

  // Console output
  if (config.enableConsole) {
    const formatted = formatLogEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
    }
  }

  // External service
  if (config.enableExternal) {
    sendToExternalService(entry);
  }
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Log an error message
   *
   * Use for errors that require attention and may affect user experience.
   *
   * @param message - Error message
   * @param context - Additional context
   *
   * @example
   * ```ts
   * logger.error('Failed to save check-in', {
   *   userId: user.uid,
   *   error: error.message
   * });
   * ```
   */
  error(message: string, context?: { error?: unknown } & Record<string, any>): void {
    const { error, ...restContext } = context || {};
    log(LogLevel.ERROR, message, restContext, error);
  },

  /**
   * Log a warning message
   *
   * Use for recoverable issues or deprecation warnings.
   *
   * @param message - Warning message
   * @param context - Additional context
   *
   * @example
   * ```ts
   * logger.warn('Rate limit approaching', {
   *   userId: user.uid,
   *   requestCount: 45,
   *   limit: 50
   * });
   * ```
   */
  warn(message: string, context?: Record<string, any>): void {
    log(LogLevel.WARN, message, context);
  },

  /**
   * Log an informational message
   *
   * Use for significant application events.
   *
   * @param message - Info message
   * @param context - Additional context
   *
   * @example
   * ```ts
   * logger.info('User completed check-in', {
   *   userId: user.uid,
   *   duration: 120
   * });
   * ```
   */
  info(message: string, context?: Record<string, any>): void {
    log(LogLevel.INFO, message, context);
  },

  /**
   * Log a debug message
   *
   * Use for detailed diagnostic information (only in development).
   *
   * @param message - Debug message
   * @param context - Additional context
   *
   * @example
   * ```ts
   * logger.debug('Firestore query executed', {
   *   collection: 'wellnessEntries',
   *   filters: { date: '>' + startDate },
   *   resultCount: 42
   * });
   * ```
   */
  debug(message: string, context?: Record<string, any>): void {
    log(LogLevel.DEBUG, message, context);
  },

  /**
   * Configure the logger
   *
   * @param newConfig - Partial configuration to merge with defaults
   *
   * @example
   * ```ts
   * logger.configure({
   *   minLevel: LogLevel.ERROR,
   *   enableConsole: false
   * });
   * ```
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    config = { ...config, ...newConfig };
  },

  /**
   * Reset logger configuration to defaults
   */
  reset(): void {
    config = { ...defaultConfig };
  },

  /**
   * Create a child logger with default context
   *
   * Useful for adding consistent context to all logs from a module.
   *
   * @param defaultContext - Context to include in all logs
   * @returns Child logger instance
   *
   * @example
   * ```ts
   * const checkInLogger = logger.child({ module: 'check-in' });
   * checkInLogger.info('Form submitted'); // Includes module: 'check-in'
   * ```
   */
  child(defaultContext: Record<string, any>) {
    return {
      error(message: string, context?: Record<string, any> & { error?: unknown }): void {
        logger.error(message, { ...defaultContext, ...context });
      },
      warn(message: string, context?: Record<string, any>): void {
        logger.warn(message, { ...defaultContext, ...context });
      },
      info(message: string, context?: Record<string, any>): void {
        logger.info(message, { ...defaultContext, ...context });
      },
      debug(message: string, context?: Record<string, any>): void {
        logger.debug(message, { ...defaultContext, ...context });
      },
    };
  },

  /**
   * Log performance metrics
   *
   * @param operation - Operation name
   * @param duration - Duration in milliseconds
   * @param context - Additional context
   *
   * @example
   * ```ts
   * const start = performance.now();
   * await loadData();
   * logger.performance('loadData', performance.now() - start, {
   *   itemCount: data.length
   * });
   * ```
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    log(LogLevel.INFO, `Performance: ${operation}`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`,
      operation,
    });
  },
};

/**
 * Helper to measure and log function execution time
 *
 * @param name - Function name
 * @param fn - Function to measure
 * @returns Result of the function
 *
 * @example
 * ```ts
 * const result = await measurePerformance('fetchInsights', async () => {
 *   return await generateInsights(entries);
 * });
 * ```
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${name} failed after ${duration.toFixed(2)}ms`, { error });
    throw error;
  }
}

/**
 * Create a performance timer
 *
 * @param name - Timer name
 * @returns Timer object with stop method
 *
 * @example
 * ```ts
 * const timer = createTimer('dataProcessing');
 * // ... do work ...
 * timer.stop({ itemsProcessed: 100 });
 * ```
 */
export function createTimer(name: string) {
  const start = performance.now();

  return {
    /** Stop the timer and log the duration */
    stop(context?: Record<string, any>): void {
      const duration = performance.now() - start;
      logger.performance(name, duration, context);
    },

    /** Get elapsed time without stopping */
    elapsed(): number {
      return performance.now() - start;
    },
  };
}

/**
 * Log API request/response for debugging
 *
 * @param method - HTTP method
 * @param url - Request URL
 * @param status - Response status
 * @param duration - Request duration in milliseconds
 * @param context - Additional context
 */
export function logApiCall(
  method: string,
  url: string,
  status: number,
  duration: number,
  context?: Record<string, any>
): void {
  const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.DEBUG;

  log(level, `API ${method} ${url}`, {
    ...context,
    method,
    url,
    status,
    duration: `${duration.toFixed(2)}ms`,
  });
}
