/**
 * CLI-related types
 */
import type { ViewportSize } from './browser';
export interface CLIFlags {
    headless?: boolean;
    viewport?: ViewportSize;
    timeout?: number;
    parallel?: number;
    model?: string;
    environment?: string;
    baseUrl?: string;
    temperature?: number;
    maxRetries?: number;
    testsDirectory?: string;
    dataDirectory?: string;
}
//# sourceMappingURL=cli.d.ts.map