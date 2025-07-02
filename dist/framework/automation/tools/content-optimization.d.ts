/**
 * Content Optimization Tools - Token-Aware Content Processing
 * Implements intelligent chunking and content selection to reduce token usage
 */
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from '../browser/browser-framework.js';
export interface ContentChunk {
    id: string;
    type: 'navigation' | 'form' | 'content' | 'interactive' | 'footer';
    selector: string;
    content: string;
    tokens: number;
    interactive: boolean;
    relevanceScore?: number;
    priorityScore?: number;
}
export interface PageSnapshot {
    url: string;
    timestamp: number;
    chunks: ContentChunk[];
    metadata: {
        title: string;
        totalElements: number;
        interactiveElements: number;
        estimatedFullPageTokens: number;
    };
}
export interface OptimizedContent {
    chunks: ContentChunk[];
    formattedContent: string;
    totalTokens: number;
    optimizationRate: number;
}
/**
 * Create optimized content tool
 */
export declare function createContentOptimizationTool(framework: EnhancedBrowserTestFramework): import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    instruction: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    instruction?: string | undefined;
}, {
    instruction?: string | undefined;
}>>;
//# sourceMappingURL=content-optimization.d.ts.map