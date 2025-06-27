/**
 * Verification Tools for Browser Automation
 * Provides LangChain tools for element verification and information
 */
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../core/browser-framework.js';
/**
 * Creates a verify element tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for verifying elements
 */
export declare function createVerifyElementTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    selector: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<["visible", "hidden", "attached", "detached"]>>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    selector: string;
    timeout?: number | undefined;
    state?: "attached" | "detached" | "visible" | "hidden" | undefined;
}, {
    selector: string;
    timeout?: number | undefined;
    state?: "attached" | "detached" | "visible" | "hidden" | undefined;
}>>;
/**
 * Creates a get element info tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting element information
 */
export declare function createGetElementInfoTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    selector: z.ZodString;
}, "strip", z.ZodTypeAny, {
    selector: string;
}, {
    selector: string;
}>>;
//# sourceMappingURL=verification.d.ts.map