/**
 * Content scoring utilities for optimization
 */
import type { ContentChunk, OptimizationContext } from '../types/optimization-types.js';
/**
 * Calculate relevance and priority scores for chunks
 */
export declare function calculateScores(chunks: ContentChunk[], context: OptimizationContext): void;
/**
 * Select optimal chunks based on token budget and scores
 */
export declare function selectOptimalChunks(chunks: ContentChunk[], context: OptimizationContext): ContentChunk[];
/**
 * Extract keywords from instruction text
 */
export declare function extractKeywords(instruction: string): string[];
/**
 * Extract action words from instruction
 */
export declare function extractActionWords(instruction: string): string[];
/**
 * Get task-specific relevance score
 */
export declare function getTaskTypeScore(chunk: ContentChunk, taskType: string): number;
/**
 * Calculate combined score for chunk selection
 */
export declare function calculateCombinedScore(chunk: ContentChunk, priorityTypes: ContentChunk['type'][]): number;
/**
 * Check if instruction contains action words
 */
export declare function isActionInstruction(instruction: string): boolean;
/**
 * Remove duplicate chunks based on similarity
 */
export declare function deduplicateChunks(chunks: ContentChunk[]): ContentChunk[];
//# sourceMappingURL=scoring-utils.d.ts.map