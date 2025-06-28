/**
 * Content Optimization Tools - Token-Aware Content Processing
 * Implements intelligent chunking and content selection to reduce token usage
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { Page } from 'playwright';
import type { EnhancedBrowserTestFramework } from '../core/browser-framework.js';

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

const contentOptimizationSchema = z.object({
  instruction: z.string().optional().describe('The current task instruction to optimize content for'),
});

/**
 * Estimate token count for content (rough approximation)
 */
function estimateTokens(content: string): number {
  if (!content) return 0;
  // More accurate estimation: ~4 characters per token for English
  // Add some buffer for HTML structure
  return Math.ceil(content.length / 3.5);
}

/**
 * Extract content from page sections
 */
async function extractSectionContent(page: Page, selector: string): Promise<string | null> {
  try {
    const elements = await page.$$(selector);
    if (elements.length === 0) return null;
    
    const contents = await Promise.all(
      elements.map(el => el.evaluate(element => {
        // Get text content but preserve structure
        const clone = element.cloneNode(true) as Element;
        
        // Remove script and style elements
        clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
        
        // Get meaningful text and attributes
        const text = clone.textContent?.trim() || '';
        const tagName = element.tagName.toLowerCase();
        const id = element.id;
        const className = element.className;
        const role = element.getAttribute('role');
        const testId = element.getAttribute('data-testid');
        
        let result = text;
        if (id) result += ` [id="${id}"]`;
        if (testId) result += ` [data-testid="${testId}"]`;
        if (role) result += ` [role="${role}"]`;
        if (className && tagName !== 'div') result += ` [class="${className}"]`;
        
        return result;
      }))
    );
    
    return contents.filter(content => content.length > 10).join('\n');
  } catch (error) {
    return null;
  }
}

/**
 * Check if section contains interactive elements
 */
async function containsInteractiveElements(page: Page, selector: string): Promise<boolean> {
  try {
    const interactiveSelectors = [
      'button', 'input', 'select', 'textarea', 'a[href]',
      '[onclick]', '[role="button"]', '.btn', '.button'
    ];
    
    for (const interactiveSelector of interactiveSelectors) {
      const count = await page.$$eval(
        `${selector} ${interactiveSelector}`,
        elements => elements.length
      );
      if (count > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Extract interactive elements with context
 */
async function extractInteractiveElementsContent(page: Page, selector: string): Promise<string> {
  try {
    const elements = await page.$$(selector);
    if (elements.length === 0) return '';
    
    const elementData = await Promise.all(
      elements.slice(0, 20).map(async (el) => { // Limit to first 20 elements
        return el.evaluate(element => {
          const tag = element.tagName.toLowerCase();
          const type = element.getAttribute('type') || '';
          const placeholder = element.getAttribute('placeholder') || '';
          const value = (element as HTMLInputElement).value || '';
          const text = element.textContent?.trim() || '';
          const id = element.id || '';
          const testId = element.getAttribute('data-testid') || '';
          const className = element.className || '';
          const disabled = element.hasAttribute('disabled');
          const href = element.getAttribute('href') || '';
          
          let description = `${tag}`;
          if (type) description += `[type="${type}"]`;
          if (id) description += `[id="${id}"]`;
          if (testId) description += `[data-testid="${testId}"]`;
          if (placeholder) description += ` placeholder="${placeholder}"`;
          if (text && text.length < 50) description += ` text="${text}"`;
          if (value && value.length < 30) description += ` value="${value}"`;
          if (href && href.length < 50) description += ` href="${href}"`;
          if (disabled) description += ' [disabled]';
          if (className && className.length < 50) description += ` class="${className}"`;
          
          return description;
        });
      })
    );
    
    return elementData.join('\n');
  } catch {
    return '';
  }
}

/**
 * Create optimized page snapshot with intelligent chunking
 */
async function createPageSnapshot(page: Page, options: any): Promise<PageSnapshot> {
  const url = page.url();
  const title = await page.title().catch(() => 'Unknown');
  
  const chunks: ContentChunk[] = [];
  
  // 1. Navigation chunk (high priority for orientation)
  const navContent = await extractSectionContent(page, 'nav, header, .navbar, [role="navigation"], .header');
  if (navContent && navContent.length > 20) {
    chunks.push({
      id: 'nav-chunk',
      type: 'navigation',
      selector: 'nav, header',
      content: navContent.substring(0, 1000), // Limit length
      tokens: estimateTokens(navContent),
      interactive: await containsInteractiveElements(page, 'nav, header, .navbar')
    });
  }
  
  // 2. Form chunks (keep forms together - highest priority for interactions)
  try {
    const forms = await page.$$('form');
    for (let i = 0; i < Math.min(forms.length, 5); i++) { // Limit to 5 forms
      const formContent = await forms[i].evaluate(form => {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea, button'));
        return inputs.map(input => {
          const tag = input.tagName.toLowerCase();
          const type = input.getAttribute('type') || '';
          const name = input.getAttribute('name') || '';
          const id = input.id || '';
          const placeholder = input.getAttribute('placeholder') || '';
          const label = form.querySelector(`label[for="${id}"]`)?.textContent?.trim() || '';
          
          let desc = `${tag}`;
          if (type) desc += `[type="${type}"]`;
          if (name) desc += `[name="${name}"]`;
          if (id) desc += `[id="${id}"]`;
          if (placeholder) desc += ` placeholder="${placeholder}"`;
          if (label) desc += ` label="${label}"`;
          
          return desc;
        }).join('\n');
      });
      
      if (formContent) {
        chunks.push({
          id: `form-chunk-${i}`,
          type: 'form',
          selector: `form:nth-of-type(${i + 1})`,
          content: formContent,
          tokens: estimateTokens(formContent),
          interactive: true
        });
      }
    }
  } catch (error) {
    // Forms extraction failed, continue
  }
  
  // 3. Interactive elements chunk (buttons, links, etc.)
  const interactiveSelectors = [
    'button:not(form button)', // Exclude form buttons (already captured)
    'a[href]',
    '[role="button"]',
    '.btn:not(form .btn)',
    '.button:not(form .button)',
    '[onclick]'
  ];
  
  for (const selector of interactiveSelectors) {
    const content = await extractInteractiveElementsContent(page, selector);
    if (content) {
      chunks.push({
        id: `interactive-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`,
        type: 'interactive',
        selector,
        content,
        tokens: estimateTokens(content),
        interactive: true
      });
    }
  }
  
  // 4. Main content chunks (split by sections)
  const contentSelectors = [
    'main',
    '[role="main"]',
    '.main-content',
    '.content',
    'article',
    'section:not(nav section):not(header section):not(footer section)'
  ];
  
  for (const selector of contentSelectors) {
    const content = await extractSectionContent(page, selector);
    if (content && content.length > 50) {
      // Split large content into smaller chunks
      const maxChunkSize = 1500;
      if (content.length > maxChunkSize) {
        const sentences = content.split(/[.!?]+/);
        let currentChunk = '';
        let chunkIndex = 0;
        
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
            chunks.push({
              id: `content-${selector.replace(/[^a-zA-Z0-9]/g, '-')}-${chunkIndex}`,
              type: 'content',
              selector: `${selector}:nth-of-type(${chunkIndex + 1})`,
              content: currentChunk.trim(),
              tokens: estimateTokens(currentChunk),
              interactive: await containsInteractiveElements(page, selector)
            });
            currentChunk = sentence;
            chunkIndex++;
          } else {
            currentChunk += sentence + '.';
          }
        }
        
        if (currentChunk.trim()) {
          chunks.push({
            id: `content-${selector.replace(/[^a-zA-Z0-9]/g, '-')}-${chunkIndex}`,
            type: 'content',
            selector: `${selector}:nth-of-type(${chunkIndex + 1})`,
            content: currentChunk.trim(),
            tokens: estimateTokens(currentChunk),
            interactive: await containsInteractiveElements(page, selector)
          });
        }
      } else {
        chunks.push({
          id: `content-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`,
          type: 'content',
          selector,
          content: content.substring(0, 2000), // Limit content size
          tokens: estimateTokens(content),
          interactive: await containsInteractiveElements(page, selector)
        });
      }
      break; // Only process first matching content selector
    }
  }
  
  // 5. Footer chunk (lowest priority)
  const footerContent = await extractSectionContent(page, 'footer, .footer');
  if (footerContent && footerContent.length > 20) {
    chunks.push({
      id: 'footer-chunk',
      type: 'footer',
      selector: 'footer',
      content: footerContent.substring(0, 500), // Limit footer content
      tokens: estimateTokens(footerContent),
      interactive: await containsInteractiveElements(page, 'footer, .footer')
    });
  }
  
  // Calculate metadata
  const totalElements = await page.$$eval('*', elements => elements.length).catch(() => 0);
  const interactiveElements = await page.$$eval(
    'button, input, select, textarea, a[href], [onclick], [role="button"]',
    elements => elements.length
  ).catch(() => 0);
  
  const estimatedFullPageTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
  
  return {
    url,
    timestamp: Date.now(),
    chunks,
    metadata: {
      title,
      totalElements,
      interactiveElements,
      estimatedFullPageTokens
    }
  };
}

/**
 * Select optimal chunks - automatically optimized for efficiency
 */
async function selectOptimalChunks(snapshot: PageSnapshot, instruction?: string): Promise<OptimizedContent> {
  // Priority weights for different chunk types
  const priorityWeights = {
    form: 1.0,
    interactive: 0.8,
    navigation: 0.4,
    content: 0.6,
    footer: 0.2
  };
  
  // Calculate relevance scores based on instruction
  let chunks = snapshot.chunks.map(chunk => ({
    ...chunk,
    priorityScore: priorityWeights[chunk.type] || 0.5,
    relevanceScore: instruction ? calculateRelevanceScore(chunk, instruction) : 0
  }));
  
  // Sort by combined priority and relevance score
  chunks = chunks.sort((a, b) => {
    const scoreA = a.priorityScore + a.relevanceScore;
    const scoreB = b.priorityScore + b.relevanceScore;
    return scoreB - scoreA;
  });
  
  // Select only the most relevant chunks (automatic optimization)
  const selectedChunks: ContentChunk[] = [];
  let totalTokens = 0;
  
  // Always include forms (highest priority for actions)
  const formChunks = chunks.filter(c => c.type === 'form');
  selectedChunks.push(...formChunks);
  totalTokens += formChunks.reduce((sum, c) => sum + c.tokens, 0);
  
  // Add interactive elements if instruction suggests actions
  if (instruction && isActionInstruction(instruction)) {
    const interactiveChunks = chunks.filter(c => c.type === 'interactive' && c.relevanceScore! > 0);
    selectedChunks.push(...interactiveChunks.slice(0, 3)); // Limit to top 3
    totalTokens += interactiveChunks.slice(0, 3).reduce((sum, c) => sum + c.tokens, 0);
  }
  
  // Add navigation for orientation
  const navChunks = chunks.filter(c => c.type === 'navigation');
  if (navChunks.length > 0) {
    selectedChunks.push(navChunks[0]);
    totalTokens += navChunks[0].tokens;
  }
  
  // Add most relevant content chunks (limit to 2)
  const contentChunks = chunks.filter(c => c.type === 'content').slice(0, 2);
  selectedChunks.push(...contentChunks);
  totalTokens += contentChunks.reduce((sum, c) => sum + c.tokens, 0);
  
  // Format content for AI consumption
  const formattedContent = formatChunksForAI(selectedChunks);
  
  return {
    chunks: selectedChunks,
    formattedContent,
    totalTokens,
    optimizationRate: totalTokens / snapshot.metadata.estimatedFullPageTokens
  };
}

/**
 * Calculate relevance score based on instruction keywords
 */
function calculateRelevanceScore(chunk: ContentChunk, instruction: string): number {
  const keywords = extractKeywords(instruction);
  const chunkText = chunk.content.toLowerCase();
  
  let score = 0;
  keywords.forEach(keyword => {
    if (chunkText.includes(keyword.toLowerCase())) {
      score += 1;
    }
  });
  
  // Boost score for interactive elements when instruction involves actions
  if (chunk.interactive && isActionInstruction(instruction)) {
    score += 2;
  }
  
  return score;
}

/**
 * Extract keywords from instruction
 */
function extractKeywords(instruction: string): string[] {
  const actionWords = ['click', 'fill', 'select', 'submit', 'navigate', 'type', 'choose', 'enter'];
  const words = instruction.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 3 && !actionWords.includes(word));
}

/**
 * Check if instruction involves actions
 */
function isActionInstruction(instruction: string): boolean {
  const actionWords = ['click', 'fill', 'select', 'submit', 'type', 'choose', 'enter'];
  return actionWords.some(action => instruction.toLowerCase().includes(action));
}

/**
 * Format chunks for AI consumption
 */
function formatChunksForAI(chunks: ContentChunk[]): string {
  const sections = chunks.map(chunk => {
    return [
      `## ${chunk.type.toUpperCase()} Section (${chunk.id})`,
      `Selector: ${chunk.selector}`,
      `Interactive: ${chunk.interactive ? 'Yes' : 'No'}`,
      `Content:`,
      chunk.content,
      ''
    ].join('\n');
  });
  
  return sections.join('\n');
}

/**
 * Create optimized content tool
 */
export function createContentOptimizationTool(framework: EnhancedBrowserTestFramework) {
  return tool(async ({ instruction }) => {
    try {
      const page = (framework as any).page;
      if (!page) {
        return { error: 'No page available for content optimization' };
      }
      
      framework.logTestStep('content-optimization-start', 'content-optimization', {
        instruction
      }, 'Starting intelligent content optimization', true);
      
      // Create page snapshot with intelligent chunking
      const snapshot = await createPageSnapshot(page, {});
      
      // Select optimal chunks automatically
      const optimizedContent = await selectOptimalChunks(snapshot, instruction);
      
      // Store snapshot for potential differential analysis
      (framework as any).lastPageSnapshot = snapshot;
      
      const optimizationMetrics = {
        totalChunks: snapshot.chunks.length,
        selectedChunks: optimizedContent.chunks.length,
        tokensUsed: optimizedContent.totalTokens,
        originalTokens: snapshot.metadata.estimatedFullPageTokens,
        optimization: `${((1 - optimizedContent.optimizationRate) * 100).toFixed(1)}% reduction`,
        estimatedSavings: snapshot.metadata.estimatedFullPageTokens - optimizedContent.totalTokens
      };
      
      framework.logTestStep('content-optimization-complete', 'content-optimization', optimizationMetrics, 
        `Optimized content: ${optimizationMetrics.selectedChunks}/${optimizationMetrics.totalChunks} chunks, ${optimizationMetrics.tokensUsed} tokens`, true);
      
      return {
        content: optimizedContent.formattedContent,
        metadata: {
          ...optimizationMetrics,
          snapshot: {
            url: snapshot.url,
            title: snapshot.metadata.title,
            totalElements: snapshot.metadata.totalElements,
            interactiveElements: snapshot.metadata.interactiveElements
          }
        }
      };
      
    } catch (error: any) {
      framework.logTestStep('content-optimization-error', 'content-optimization', { error: error.message }, 
        `Content optimization failed: ${error.message}`, false);
      
      // Fallback to basic page content
      try {
        const page = (framework as any).page;
        const content = await page?.content() || '';
        const truncated = content.substring(0, 8000); // Basic fallback limit
        return {
          content: truncated,
          metadata: {
            fallback: true,
            tokensUsed: estimateTokens(truncated),
            error: error.message
          }
        };
      } catch {
        return { error: `Content optimization failed: ${error.message}` };
      }
    }
  }, {
    name: 'getOptimizedContent',
    description: 'Get intelligently optimized page content that dramatically reduces tokens by focusing only on interactive elements and relevant content for the task.',
    schema: contentOptimizationSchema,
  });
}