/**
 * Content formatting utilities for AI consumption
 */
import type { ContentChunk, OptimizationContext } from '../types/optimization-types.js';
/**
 * Format selected chunks for AI consumption
 */
export declare function formatForAI(chunks: ContentChunk[], _context: OptimizationContext): string;
/**
 * Estimate token count for content using cached calculation
 */
export declare function estimateTokens(content: string, cache?: Map<string, number>): number;
/**
 * Clean HTML content for better readability
 */
export declare function cleanContent(content: string): string;
/**
 * Extract context information from element
 */
export declare function extractContext(element: any): string;
//# sourceMappingURL=formatting-utils.d.ts.map