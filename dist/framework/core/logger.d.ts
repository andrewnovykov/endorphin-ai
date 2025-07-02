/**
 * Centralized Logging System
 * Provides structured logging with different levels and outputs
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
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
    maxLogFileSize?: number;
    component?: string;
}
export declare class Logger {
    private config;
    private logBuffer;
    private maxBufferSize;
    constructor(config?: Partial<LoggerConfig>);
    debug(message: string, context?: Record<string, any>, component?: string): void;
    info(message: string, context?: Record<string, any>, component?: string): void;
    warn(message: string, context?: Record<string, any>, component?: string): void;
    error(message: string, error?: Error, context?: Record<string, any>, component?: string): void;
    critical(message: string, error?: Error, context?: Record<string, any>, component?: string): void;
    private log;
    private logToConsole;
    private logToFile;
    private formatLogLine;
    private getConsoleMethod;
    private trimBuffer;
    getRecentLogs(count?: number): LogEntry[];
    getLogsByLevel(level: LogLevel): LogEntry[];
    clearBuffer(): void;
    setLevel(level: LogLevel): void;
    createChild(component: string): Logger;
    startTimer(label: string): () => void;
    logMemoryUsage(component?: string): void;
}
export declare const globalLogger: Logger;
export declare const debug: (message: string, context?: Record<string, any>, component?: string) => void;
export declare const info: (message: string, context?: Record<string, any>, component?: string) => void;
export declare const warn: (message: string, context?: Record<string, any>, component?: string) => void;
export declare const error: (message: string, err?: Error, context?: Record<string, any>, component?: string) => void;
export declare const critical: (message: string, err?: Error, context?: Record<string, any>, component?: string) => void;
//# sourceMappingURL=logger.d.ts.map