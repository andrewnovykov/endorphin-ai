/**
 * Centralized Logging System
 * Provides structured logging with different levels and outputs
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  component?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logFilePath?: string;
  enableStructured: boolean;
  maxLogFileSize?: number; // in bytes
  component?: string;
}

export class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableStructured: false,
      maxLogFileSize: 10 * 1024 * 1024, // 10MB
      ...config,
    };
  }

  debug(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.DEBUG, message, context, undefined, component);
  }

  info(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.INFO, message, context, undefined, component);
  }

  warn(message: string, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.WARN, message, context, undefined, component);
  }

  error(message: string, error?: Error, context?: Record<string, any>, component?: string): void {
    this.log(LogLevel.ERROR, message, context, error, component);
  }

  critical(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    component?: string
  ): void {
    this.log(LogLevel.CRITICAL, message, context, error, component);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    component?: string
  ): void {
    if (level < this.config.level) {
      return; // Skip if below configured level
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
      error: error || undefined,
      component: component || this.config.component || undefined,
    } as LogEntry;

    // Add to buffer
    this.logBuffer.push(entry);
    this.trimBuffer();

    // Output to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Output to file
    if (this.config.enableFile && this.config.logFilePath) {
      this.logToFile(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.split('T')[1].split('.')[0];
    const component = entry.component ? `[${entry.component}]` : '';
    const levelStr = LogLevel[entry.level].padEnd(8);

    let message = `${timestamp} ${levelStr} ${component} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      if (this.config.enableStructured) {
        message += ` ${JSON.stringify(entry.context)}`;
      } else {
        const contextStr = Object.entries(entry.context)
          .map(([k, v]) => `${k}=${v}`)
          .join(' ');
        message += ` {${contextStr}}`;
      }
    }

    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.error) {
      consoleMethod(message, entry.error);
    } else {
      consoleMethod(message);
    }
  }

  private async logToFile(entry: LogEntry): Promise<void> {
    if (!this.config.logFilePath) return;

    try {
      const { promises: fs } = await import('node:fs');
      const logLine = this.config.enableStructured
        ? `${JSON.stringify(entry)  }\n`
        : `${this.formatLogLine(entry)  }\n`;

      await fs.appendFile(this.config.logFilePath, logLine);
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
    }
  }

  private formatLogLine(entry: LogEntry): string {
    const parts = [
      entry.timestamp,
      LogLevel[entry.level],
      entry.component || 'SYSTEM',
      entry.message,
    ];

    if (entry.context) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      parts.push(`ERROR: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`STACK: ${entry.error.stack}`);
      }
    }

    return parts.join(' | ');
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private trimBuffer(): void {
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  // Utility methods
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logBuffer.filter((entry) => entry.level === level);
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(`Log level changed to ${LogLevel[level]}`, { newLevel: level });
  }

  createChild(component: string): Logger {
    const childComponent = this.config.component
      ? `${this.config.component}.${component}`
      : component;
    return new Logger({
      ...this.config,
      component: childComponent,
    });
  }

  // Performance logging helpers
  startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Timer: ${label}`, { duration: `${duration}ms` });
    };
  }

  logMemoryUsage(component?: string): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      this.debug(
        'Memory usage',
        {
          heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memory.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
        },
        component
      );
    }
  }
}

// Global logger instance
export const globalLogger = new Logger({
  level: process.env.NODE_ENV === 'test' ? LogLevel.WARN : LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  component: 'FRAMEWORK',
});

// Convenience functions
export const debug = (message: string, context?: Record<string, any>, component?: string) =>
  globalLogger.debug(message, context, component);

export const info = (message: string, context?: Record<string, any>, component?: string) =>
  globalLogger.info(message, context, component);

export const warn = (message: string, context?: Record<string, any>, component?: string) =>
  globalLogger.warn(message, context, component);

export const error = (
  message: string,
  err?: Error,
  context?: Record<string, any>,
  component?: string
) => globalLogger.error(message, err, context, component);

export const critical = (
  message: string,
  err?: Error,
  context?: Record<string, any>,
  component?: string
) => globalLogger.critical(message, err, context, component);
