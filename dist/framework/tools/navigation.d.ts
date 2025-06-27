/**
 * Navigation Tools for Browser Automation
 * Provides LangChain tools for page navigation
 */
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../core/browser-framework.js';
/**
 * Creates a navigation tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for navigation
 */
export declare function createNavigationTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    location: z.ZodString;
    waitUntil: z.ZodOptional<z.ZodEnum<["load", "domcontentloaded", "networkidle"]>>;
}, "strip", z.ZodTypeAny, {
    location: string;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | undefined;
}, {
    location: string;
    waitUntil?: "load" | "domcontentloaded" | "networkidle" | undefined;
}>>;
//# sourceMappingURL=navigation.d.ts.map