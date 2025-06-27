/**
 * Interaction Tools for Browser Automation
 * Provides LangChain tools for element interaction (click, fill, clear)
 */
import type { EnhancedBrowserTestFramework } from '@core/browser-framework';
import { z } from 'zod';
/**
 * Creates a click tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for clicking elements
 */
export declare function createClickTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    selector: z.ZodString;
    strategy: z.ZodOptional<z.ZodEnum<["css", "text", "exact-text", "role", "placeholder", "label", "title", "alt"]>>;
    timeout: z.ZodOptional<z.ZodNumber>;
    force: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    selector: string;
    timeout?: number | undefined;
    force?: boolean | undefined;
    strategy?: "text" | "css" | "role" | "exact-text" | "placeholder" | "label" | "title" | "alt" | undefined;
}, {
    selector: string;
    timeout?: number | undefined;
    force?: boolean | undefined;
    strategy?: "text" | "css" | "role" | "exact-text" | "placeholder" | "label" | "title" | "alt" | undefined;
}>>;
/**
 * Creates a fill tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for filling input fields
 */
export declare function createFillTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    selector: z.ZodString;
    value: z.ZodString;
    strategy: z.ZodOptional<z.ZodEnum<["fill", "type"]>>;
    clearFirst: z.ZodOptional<z.ZodBoolean>;
    pressEnter: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    selector: string;
    value: string;
    strategy?: "fill" | "type" | undefined;
    clearFirst?: boolean | undefined;
    pressEnter?: boolean | undefined;
}, {
    selector: string;
    value: string;
    strategy?: "fill" | "type" | undefined;
    clearFirst?: boolean | undefined;
    pressEnter?: boolean | undefined;
}>>;
/**
 * Creates a clear field tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for clearing input fields
 */
export declare function createClearFieldTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    selector: z.ZodString;
}, "strip", z.ZodTypeAny, {
    selector: string;
}, {
    selector: string;
}>>;
//# sourceMappingURL=interaction.d.ts.map