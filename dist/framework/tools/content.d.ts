/**
 * Content Tools for Browser Automation
 * Provides LangChain tools for page content analysis
 */
import type { EnhancedBrowserTestFramework } from '@core/browser-framework';
import { z } from 'zod';
/**
 * Creates a get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting page content
 */
export declare function createGetPageContentTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    includeTitle: z.ZodOptional<z.ZodBoolean>;
    maxLength: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    includeTitle?: boolean | undefined;
    maxLength?: number | undefined;
}, {
    includeTitle?: boolean | undefined;
    maxLength?: number | undefined;
}>>;
/**
 * Creates a simple get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting simple page content
 */
export declare function createGetSimplePageContentTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
//# sourceMappingURL=content.d.ts.map