/**
 * Centralized Logging System
 * Provides structured logging with different levels and outputs
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 4] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
export class Logger {
    config;
    logBuffer = [];
    maxBufferSize = 1000;
    constructor(config = {}) {
        this.config = {
            level: LogLevel.INFO,
            enableConsole: true,
            enableFile: false,
            enableStructured: false,
            maxLogFileSize: 10 * 1024 * 1024, // 10MB
            ...config,
        };
    }
    debug(message, context, component) {
        this.log(LogLevel.DEBUG, message, context, undefined, component);
    }
    info(message, context, component) {
        this.log(LogLevel.INFO, message, context, undefined, component);
    }
    warn(message, context, component) {
        this.log(LogLevel.WARN, message, context, undefined, component);
    }
    error(message, error, context, component) {
        this.log(LogLevel.ERROR, message, context, error, component);
    }
    critical(message, error, context, component) {
        this.log(LogLevel.CRITICAL, message, context, error, component);
    }
    log(level, message, context, error, component) {
        if (level < this.config.level) {
            return; // Skip if below configured level
        }
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: context || {},
            error: error || undefined,
            component: component || this.config.component || undefined,
        };
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
    logToConsole(entry) {
        const timestamp = entry.timestamp.split('T')[1].split('.')[0];
        const component = entry.component ? `[${entry.component}]` : '';
        const levelStr = LogLevel[entry.level].padEnd(8);
        let message = `${timestamp} ${levelStr} ${component} ${entry.message}`;
        if (entry.context && Object.keys(entry.context).length > 0) {
            if (this.config.enableStructured) {
                message += ` ${JSON.stringify(entry.context)}`;
            }
            else {
                const contextStr = Object.entries(entry.context)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(' ');
                message += ` {${contextStr}}`;
            }
        }
        const consoleMethod = this.getConsoleMethod(entry.level);
        if (entry.error) {
            consoleMethod(message, entry.error);
        }
        else {
            consoleMethod(message);
        }
    }
    async logToFile(entry) {
        if (!this.config.logFilePath)
            return;
        try {
            const { promises: fs } = await import('node:fs');
            const logLine = this.config.enableStructured
                ? `${JSON.stringify(entry)}\n`
                : `${this.formatLogLine(entry)}\n`;
            await fs.appendFile(this.config.logFilePath, logLine);
        }
        catch (error) {
            // Fallback to console if file write fails
            console.error('Failed to write to log file:', error);
        }
    }
    formatLogLine(entry) {
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
    getConsoleMethod(level) {
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
    trimBuffer() {
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
        }
    }
    // Utility methods
    getRecentLogs(count = 50) {
        return this.logBuffer.slice(-count);
    }
    getLogsByLevel(level) {
        return this.logBuffer.filter((entry) => entry.level === level);
    }
    clearBuffer() {
        this.logBuffer = [];
    }
    setLevel(level) {
        this.config.level = level;
        this.info(`Log level changed to ${LogLevel[level]}`, { newLevel: level });
    }
    createChild(component) {
        const childComponent = this.config.component
            ? `${this.config.component}.${component}`
            : component;
        return new Logger({
            ...this.config,
            component: childComponent,
        });
    }
    // Performance logging helpers
    startTimer(label) {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.debug(`Timer: ${label}`, { duration: `${duration}ms` });
        };
    }
    logMemoryUsage(component) {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const memory = process.memoryUsage();
            this.debug('Memory usage', {
                heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
                external: `${Math.round(memory.external / 1024 / 1024)}MB`,
                rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
            }, component);
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
export const debug = (message, context, component) => globalLogger.debug(message, context, component);
export const info = (message, context, component) => globalLogger.info(message, context, component);
export const warn = (message, context, component) => globalLogger.warn(message, context, component);
export const error = (message, err, context, component) => globalLogger.error(message, err, context, component);
export const critical = (message, err, context, component) => globalLogger.critical(message, err, context, component);
//# sourceMappingURL=logger.js.map