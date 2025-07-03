/**
 * Differential Content Tool
 * Uses page snapshots to provide AI with only the changes since last interaction
 */
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
/**
 * Create differential page content tool that provides AI with only page changes
 */
export declare function createDifferentialContentTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    instruction: z.ZodString;
    forceFullSnapshot: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    instruction: string;
    forceFullSnapshot?: boolean | undefined;
}, {
    instruction: string;
    forceFullSnapshot?: boolean | undefined;
}>>;
//# sourceMappingURL=differential-content.d.ts.map