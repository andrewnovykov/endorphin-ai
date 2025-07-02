/**
 * Content processor for page optimization
 */
import type { Page } from 'playwright';
import type { OptimizationContext, OptimizedContent, OptimizerStatistics } from '../types/optimization-types.js';
export type { OptimizationContext } from '../types/optimization-types.js';
/**
 * High-performance content processor
 */
export declare class ContentProcessor {
    private tokenEstimationCache;
    private selectorCache;
    private cleanupInterval?;
    constructor();
    /**
     * Extract and optimize page content for AI consumption
     */
    optimizePageContent(page: Page, context?: OptimizationContext): Promise<OptimizedContent>;
    /**
     * Extract content chunks from page using optimized selectors
     */
    private extractContentChunks;
    /**
     * Extract content chunk from a single element
     */
    private extractElementChunk;
    /**
     * Get processor statistics
     */
    getStatistics(): OptimizerStatistics;
    /**
     * Clear caches manually
     */
    clearCaches(): void;
    /**
     * Dispose of the processor and clean up resources
     */
    dispose(): void;
}
//# sourceMappingURL=content-processor.d.ts.map