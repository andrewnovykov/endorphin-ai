/**
 * Utility Tools for Browser Automation
 * Provides LangChain tools for utilities (wait, screenshot)
 */
import type { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
import { z } from 'zod';
/**
 * Creates a wait tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for waiting
 */
export declare function createWaitTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    milliseconds: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
    selector: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["visible", "hidden", "attached", "detached"]>>;
}, "strip", z.ZodTypeAny, {
    selector?: string | undefined;
    reason?: string | undefined;
    state?: "hidden" | "visible" | "attached" | "detached" | undefined;
    milliseconds?: number | undefined;
}, {
    selector?: string | undefined;
    reason?: string | undefined;
    state?: "hidden" | "visible" | "attached" | "detached" | undefined;
    milliseconds?: number | undefined;
}>>;
/**
 * Creates a screenshot tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for taking screenshots
 */
export declare function createScreenshotTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    selector: z.ZodOptional<z.ZodString>;
    fullPage: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    selector?: string | undefined;
    name?: string | undefined;
    fullPage?: boolean | undefined;
}, {
    selector?: string | undefined;
    name?: string | undefined;
    fullPage?: boolean | undefined;
}>>;
//# sourceMappingURL=utilities.d.ts.map