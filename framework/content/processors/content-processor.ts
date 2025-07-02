/**
 * Content processor for page optimization
 */

import type { Page } from 'playwright';
import type {
  ContentChunk,
  ExtractionStrategy,
  OptimizationContext,
  OptimizedContent,
  OptimizerStatistics,
} from '../types/optimization-types.js';

// Re-export for backward compatibility
export type { OptimizationContext } from '../types/optimization-types.js';
import { estimateTokens, formatForAI } from '../utils/formatting-utils';
import { calculateScores, deduplicateChunks, selectOptimalChunks } from '../utils/scoring-utils';

// Simple console logging to avoid circular dependencies
const log = {
  info: (msg: string, data?: any) => console.log(`[ContentProcessor] ${msg}`, data || ''),
  debug: (msg: string, data?: any) => console.debug(`[ContentProcessor] ${msg}`, data || ''),
  warn: (msg: string, data?: any) => console.warn(`[ContentProcessor] ${msg}`, data || ''),
  error: (msg: string, error?: any) => console.error(`[ContentProcessor] ${msg}`, error || ''),
};

/**
 * High-performance content processor
 */
export class ContentProcessor {
  private tokenEstimationCache = new Map<string, number>();
  private selectorCache = new Map<string, string[]>();
  private cleanupInterval?: NodeJS.Timeout | undefined;

  constructor() {
    // Clear caches periodically to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      if (this.tokenEstimationCache.size > 1000) {
        this.tokenEstimationCache.clear();
      }
      if (this.selectorCache.size > 100) {
        this.selectorCache.clear();
      }
    }, 300000); // 5 minutes
  }

  /**
   * Extract and optimize page content for AI consumption
   */
  async optimizePageContent(
    page: Page,
    context: OptimizationContext = {}
  ): Promise<OptimizedContent> {
    const startTime = Date.now();

    log.debug('Starting content optimization', {
      instruction: context.instruction,
      taskType: context.taskType,
      maxTokens: context.maxTokens,
    });

    try {
      // Step 1: Extract all content chunks in parallel
      const chunks = await this.extractContentChunks(page);

      // Step 2: Calculate relevance and priority scores
      calculateScores(chunks, context);

      // Step 3: Select optimal chunks based on token budget
      const selectedChunks = selectOptimalChunks(chunks, context);

      // Step 4: Format for AI consumption
      const formattedContent = formatForAI(selectedChunks, context);

      const totalTokens = selectedChunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
      const originalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
      const optimizationTime = Date.now() - startTime;

      const result: OptimizedContent = {
        chunks: selectedChunks,
        formattedContent,
        totalTokens,
        compressionRatio: originalTokens > 0 ? totalTokens / originalTokens : 1,
        metadata: {
          originalElements: chunks.length,
          selectedElements: selectedChunks.length,
          discardedElements: chunks.length - selectedChunks.length,
          optimizationTime,
        },
      };

      log.info('Content optimization completed', {
        originalElements: result.metadata.originalElements,
        selectedElements: result.metadata.selectedElements,
        compressionRatio: result.compressionRatio.toFixed(2),
        optimizationTime: result.metadata.optimizationTime,
      });

      return result;
    } catch (error: any) {
      log.error('Content optimization failed', error);
      throw error;
    }
  }

  /**
   * Extract content chunks from page using optimized selectors
   */
  private async extractContentChunks(page: Page): Promise<ContentChunk[]> {
    const chunks: ContentChunk[] = [];

    // Define extraction strategies for different content types
    const extractionStrategies: ExtractionStrategy[] = [
      {
        type: 'navigation',
        selectors: ['nav', '[role="navigation"]', '.navbar', '.nav', '.menu'],
        priority: 0.9,
      },
      {
        type: 'form',
        selectors: ['form', '[role="form"]', '.form'],
        priority: 0.95,
      },
      {
        type: 'interactive',
        selectors: [
          'button',
          'input',
          'select',
          'textarea',
          'a[href]',
          '[role="button"]',
          '[onclick]',
          '.btn',
          '.button',
          '[data-testid]',
          '[aria-label]',
        ],
        priority: 0.9,
      },
      {
        type: 'header',
        selectors: ['header', '[role="banner"]', '.header', 'h1', 'h2'],
        priority: 0.7,
      },
      {
        type: 'content',
        selectors: ['main', '[role="main"]', '.content', '.main', 'article', 'section'],
        priority: 0.6,
      },
      {
        type: 'sidebar',
        selectors: ['aside', '[role="complementary"]', '.sidebar', '.aside'],
        priority: 0.4,
      },
      {
        type: 'footer',
        selectors: ['footer', '[role="contentinfo"]', '.footer'],
        priority: 0.3,
      },
    ];

    // Extract chunks in parallel for better performance
    const extractionPromises = extractionStrategies.map(async (strategy) => {
      const strategyChunks: ContentChunk[] = [];

      for (const selector of strategy.selectors) {
        try {
          const elements = await page.$$(selector);

          for (let i = 0; i < Math.min(elements.length, 20); i++) {
            // Limit per selector
            const element = elements[i];
            const chunk = await this.extractElementChunk(element, strategy.type, selector, i);

            if (chunk && chunk.content.length > 10) {
              // Filter out empty content
              chunk.priorityScore = strategy.priority;
              strategyChunks.push(chunk);
            }
          }
        } catch (error) {
          // Log but continue with other selectors
          log.debug(`Failed to extract from selector ${selector}`, error);
        }
      }

      return strategyChunks;
    });

    const results = await Promise.all(extractionPromises);
    chunks.push(...results.flat());

    // Remove duplicates based on content similarity
    return deduplicateChunks(chunks);
  }

  /**
   * Extract content chunk from a single element
   */
  private async extractElementChunk(
    element: any,
    type: ContentChunk['type'],
    selector: string,
    index: number
  ): Promise<ContentChunk | null> {
    try {
      const data = await element.evaluate((el: Element, _idx: number) => {
        // Get bounding box for positioning
        const rect = el.getBoundingClientRect();

        // Extract content with context
        const clone = el.cloneNode(true) as Element;
        clone.querySelectorAll('script, style, noscript, .hidden').forEach((s) => s.remove());

        const text = clone.textContent?.trim() || '';
        if (text.length < 5) return null; // Skip empty/minimal content

        // Get element attributes for better context
        const tagName = el.tagName.toLowerCase();
        const id = el.id;
        const className = el.className;
        const role = el.getAttribute('role');
        const testId = el.getAttribute('data-testid');
        const ariaLabel = el.getAttribute('aria-label');
        const placeholder = el.getAttribute('placeholder');
        const href = el.getAttribute('href');
        const inputType = el.getAttribute('type');

        // Build rich content description
        let content = text;
        let context = '';

        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          context += `${tagName}`;
          if (inputType) context += `[type="${inputType}"]`;
          if (placeholder) context += ` placeholder="${placeholder}"`;
          if (id) context += ` id="${id}"`;
          if (testId) context += ` data-testid="${testId}"`;
          content = context + (text ? ` - ${text}` : '');
        } else if (tagName === 'button') {
          context = `button`;
          if (id) context += ` id="${id}"`;
          if (testId) context += ` data-testid="${testId}"`;
          if (ariaLabel) context += ` aria-label="${ariaLabel}"`;
          content = `${context} - ${text}`;
        } else if (tagName === 'a') {
          context = `link`;
          if (href) context += ` href="${href}"`;
          content = `${context} - ${text}`;
        }

        // Check if element is interactive
        const interactiveTags = ['button', 'input', 'select', 'textarea', 'a'];
        const hasInteractiveAttributes =
          el.hasAttribute('onclick') ||
          (el.hasAttribute('role') && el.getAttribute('role') === 'button');
        const isInteractive = interactiveTags.includes(tagName) || hasInteractiveAttributes;

        return {
          content,
          context,
          position: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          interactive: isInteractive,
          attributes: {
            id,
            className,
            role,
            testId,
            ariaLabel,
            href,
            type: inputType,
            placeholder,
          },
        };
      }, index);

      if (!data || !data.content) return null;

      const chunk: ContentChunk = {
        id: `${type}-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${index}`,
        type,
        selector,
        content: data.content,
        tokens: estimateTokens(data.content, this.tokenEstimationCache),
        interactive: data.interactive,
        relevanceScore: 0, // Will be calculated later
        priorityScore: 0, // Will be set based on type
        position: data.position,
        context: data.context,
      };

      return chunk;
    } catch {
      return null;
    }
  }

  /**
   * Get processor statistics
   */
  getStatistics(): OptimizerStatistics {
    return {
      tokenEstimationCacheSize: this.tokenEstimationCache.size,
      selectorCacheSize: this.selectorCache.size,
    };
  }

  /**
   * Clear caches manually
   */
  clearCaches(): void {
    this.tokenEstimationCache.clear();
    this.selectorCache.clear();
  }

  /**
   * Dispose of the processor and clean up resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = undefined;
    this.clearCaches();
  }
}
