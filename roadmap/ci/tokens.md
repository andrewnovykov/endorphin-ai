# Token Optimization for Endorphin AI TypeScript Framework

## Overview

This document outlines a comprehensive strategy to dramatically reduce AI token usage while improving test accuracy through intelligent content processing, differential state tracking, and smart context building. The approach leverages the modern TypeScript framework architecture with type-safe implementations and modular tool integration.

## Current Problem Analysis

### Token Usage Baseline
- **Full page snapshot**: 10,000-50,000 tokens per interaction
- **Typical test with 10 steps**: 100,000-500,000 tokens
- **Cost impact**: $0.50-$2.50 per test run (GPT-4)
- **Accuracy issues**: LLM overwhelmed with irrelevant content

### Framework-Specific Pain Points
1. Content tools send entire page content (up to 8000 chars)
2. No state persistence between AI interactions
3. Redundant information in consecutive tool calls
4. High latency due to large prompts
5. Context window limitations with complex pages

## Solution Architecture for TypeScript Framework

### 1. Intelligent Content Tools

#### Enhanced Content Tool with Token Optimization
```typescript
// framework/tools/content-optimization.ts
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export interface ContentChunk {
  id: string;
  type: 'navigation' | 'form' | 'content' | 'interactive' | 'footer';
  selector: string;
  content: string;
  tokens: number;
  interactive: boolean;
  relevanceScore?: number;
}

export interface PageSnapshot {
  url: string;
  timestamp: number;
  chunks: ContentChunk[];
  metadata: {
    title: string;
    totalElements: number;
    interactiveElements: number;
  };
}

const contentOptimizationSchema = z.object({
  maxTokens: z.number().default(4000),
  focusSelectors: z.array(z.string()).optional(),
  excludeSelectors: z.array(z.string()).optional(),
  prioritize: z.enum(['forms', 'interactive', 'content']).default('interactive'),
});

export function createContentOptimizationTool(framework: EnhancedBrowserTestFramework) {
  return tool(async ({ maxTokens, focusSelectors, excludeSelectors, prioritize }) => {
    try {
      const page = framework.getPage();
      
      // Intelligent content chunking
      const snapshot = await createPageSnapshot(page, {
        maxTokens,
        focusSelectors,
        excludeSelectors,
        prioritize
      });
      
      // Store snapshot for differential analysis
      framework.storePageSnapshot(snapshot);
      
      const optimizedContent = await selectOptimalChunks(snapshot, maxTokens);
      
      framework.logTestStep('content-optimization', {
        totalChunks: snapshot.chunks.length,
        selectedChunks: optimizedContent.chunks.length,
        tokenBudget: maxTokens,
        tokensUsed: optimizedContent.totalTokens,
        optimization: `${((1 - optimizedContent.totalTokens / estimateFullPageTokens(snapshot)) * 100).toFixed(1)}% reduction`
      });
      
      return {
        content: optimizedContent.formattedContent,
        metadata: {
          chunks: optimizedContent.chunks.length,
          totalTokens: optimizedContent.totalTokens,
          optimizationRate: optimizedContent.totalTokens / estimateFullPageTokens(snapshot)
        }
      };
      
    } catch (error) {
      framework.logTestStep('content-optimization-error', { error: error.message });
      return { error: `Content optimization failed: ${error.message}` };
    }
  }, {
    name: 'getOptimizedContent',
    description: 'Get intelligently chunked and optimized page content within token budget',
    schema: contentOptimizationSchema,
  });
}

async function createPageSnapshot(page: Page, options: any): Promise<PageSnapshot> {
  const html = await page.content();
  const url = page.url();
  const title = await page.title();
  
  // Parse and chunk content semantically
  const chunks: ContentChunk[] = [];
  
  // Navigation chunk
  const navContent = await extractSectionContent(page, 'nav, header, .navbar, [role="navigation"]');
  if (navContent) {
    chunks.push({
      id: 'nav-chunk',
      type: 'navigation',
      selector: 'nav, header',
      content: navContent,
      tokens: estimateTokens(navContent),
      interactive: await containsInteractiveElements(page, 'nav, header')
    });
  }
  
  // Form chunks (keep forms together)
  const forms = await page.$$('form');
  for (let i = 0; i < forms.length; i++) {
    const formContent = await forms[i].innerHTML();
    chunks.push({
      id: `form-chunk-${i}`,
      type: 'form',
      selector: `form:nth-of-type(${i + 1})`,
      content: formContent,
      tokens: estimateTokens(formContent),
      interactive: true
    });
  }
  
  // Interactive elements chunk
  const interactiveSelectors = [
    'button', 'input', 'select', 'textarea', 'a[href]',
    '[onclick]', '[role="button"]', '.btn', '.button'
  ];
  
  for (const selector of interactiveSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      const content = await extractInteractiveElementsContent(page, selector);
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
  
  // Main content chunks
  const mainSections = await page.$$('main, section, article, .content, [role="main"]');
  for (let i = 0; i < mainSections.length; i++) {
    const sectionContent = await mainSections[i].textContent();
    if (sectionContent && sectionContent.trim().length > 50) {
      chunks.push({
        id: `content-chunk-${i}`,
        type: 'content',
        selector: `main:nth-of-type(${i + 1}), section:nth-of-type(${i + 1})`,
        content: sectionContent.trim().substring(0, 2000),
        tokens: estimateTokens(sectionContent),
        interactive: await containsInteractiveElements(page, `main:nth-of-type(${i + 1}), section:nth-of-type(${i + 1})`)
      });
    }
  }
  
  return {
    url,
    timestamp: Date.now(),
    chunks,
    metadata: {
      title,
      totalElements: await page.$$eval('*', elements => elements.length),
      interactiveElements: await page.$$eval(interactiveSelectors.join(','), elements => elements.length)
    }
  };
}
```

### 2. Differential State Management

#### State Tracking and Diff Analysis
```typescript
// framework/core/state-manager.ts
export interface FrameworkState {
  currentSnapshot?: PageSnapshot;
  previousSnapshot?: PageSnapshot;
  actionHistory: ActionRecord[];
  tokenUsage: TokenUsageTracker;
}

export interface ActionRecord {
  id: string;
  timestamp: number;
  type: 'click' | 'fill' | 'navigate' | 'select';
  selector: string;
  parameters: Record<string, any>;
  validation?: ActionValidation;
  tokenCost: number;
}

export interface ActionValidation {
  success: boolean;
  checks: ValidationCheck[];
  reason?: string;
}

export interface ValidationCheck {
  type: 'url' | 'element' | 'text' | 'attribute';
  selector?: string;
  expected: any;
  actual: any;
  success: boolean;
}

export class FrameworkStateManager {
  private state: FrameworkState;
  
  constructor() {
    this.state = {
      actionHistory: [],
      tokenUsage: new TokenUsageTracker()
    };
  }
  
  async captureSnapshot(page: Page, actionContext?: ActionRecord): Promise<SnapshotResult> {
    const newSnapshot = await createPageSnapshot(page, {});
    
    if (!this.state.currentSnapshot) {
      // First snapshot - return full content
      this.state.currentSnapshot = newSnapshot;
      return {
        type: 'initial',
        snapshot: newSnapshot,
        changes: [],
        tokenEstimate: estimateFullPageTokens(newSnapshot)
      };
    }
    
    // Generate differential analysis
    const diff = await this.generateDiff(this.state.currentSnapshot, newSnapshot);
    
    // Update state
    this.state.previousSnapshot = this.state.currentSnapshot;
    this.state.currentSnapshot = newSnapshot;
    
    if (actionContext) {
      // Validate the last action
      const validation = await this.validateAction(page, actionContext);
      actionContext.validation = validation;
      this.state.actionHistory.push(actionContext);
    }
    
    return {
      type: 'differential',
      snapshot: newSnapshot,
      changes: diff.changes,
      affectedChunks: diff.affectedChunks,
      validation: actionContext?.validation,
      tokenEstimate: diff.estimatedTokens
    };
  }
  
  private async generateDiff(previous: PageSnapshot, current: PageSnapshot): Promise<DiffResult> {
    const changes: ContentChange[] = [];
    const affectedChunks: string[] = [];
    
    // Compare chunks by ID and type
    const previousChunkMap = new Map(previous.chunks.map(c => [c.id, c]));
    const currentChunkMap = new Map(current.chunks.map(c => [c.id, c]));
    
    // Find added chunks
    for (const [id, chunk] of currentChunkMap) {
      if (!previousChunkMap.has(id)) {
        changes.push({
          type: 'added',
          chunkId: id,
          content: chunk.content,
          importance: calculateChangeImportance(chunk)
        });
        affectedChunks.push(id);
      }
    }
    
    // Find removed chunks
    for (const [id, chunk] of previousChunkMap) {
      if (!currentChunkMap.has(id)) {
        changes.push({
          type: 'removed',
          chunkId: id,
          importance: calculateChangeImportance(chunk)
        });
        affectedChunks.push(id);
      }
    }
    
    // Find modified chunks
    for (const [id, currentChunk] of currentChunkMap) {
      const previousChunk = previousChunkMap.get(id);
      if (previousChunk && previousChunk.content !== currentChunk.content) {
        const contentDiff = generateContentDiff(previousChunk.content, currentChunk.content);
        changes.push({
          type: 'modified',
          chunkId: id,
          diff: contentDiff,
          importance: calculateChangeImportance(currentChunk, contentDiff)
        });
        affectedChunks.push(id);
      }
    }
    
    return {
      changes,
      affectedChunks,
      estimatedTokens: calculateDiffTokens(changes),
      summary: {
        totalChanges: changes.length,
        importantChanges: changes.filter(c => c.importance > 0.7).length,
        hasUrlChange: previous.url !== current.url
      }
    };
  }
  
  private async validateAction(page: Page, action: ActionRecord): Promise<ActionValidation> {
    const checks: ValidationCheck[] = [];
    
    switch (action.type) {
      case 'fill':
        try {
          const element = page.locator(action.selector);
          const actualValue = await element.inputValue();
          checks.push({
            type: 'element',
            selector: action.selector,
            expected: action.parameters.value,
            actual: actualValue,
            success: actualValue === action.parameters.value
          });
        } catch (error) {
          checks.push({
            type: 'element',
            selector: action.selector,
            expected: action.parameters.value,
            actual: null,
            success: false
          });
        }
        break;
        
      case 'click':
        // Validate click by checking for expected changes
        if (action.parameters.expectedUrl) {
          checks.push({
            type: 'url',
            expected: action.parameters.expectedUrl,
            actual: page.url(),
            success: page.url().includes(action.parameters.expectedUrl)
          });
        }
        
        if (action.parameters.expectedElement) {
          try {
            const isVisible = await page.locator(action.parameters.expectedElement).isVisible();
            checks.push({
              type: 'element',
              selector: action.parameters.expectedElement,
              expected: true,
              actual: isVisible,
              success: isVisible
            });
          } catch {
            checks.push({
              type: 'element',
              selector: action.parameters.expectedElement,
              expected: true,
              actual: false,
              success: false
            });
          }
        }
        break;
    }
    
    return {
      success: checks.every(check => check.success),
      checks,
      reason: checks.every(check => check.success) ? 'All validations passed' : 'Some validations failed'
    };
  }
}
```

### 3. Smart Context Building

#### Token-Aware Prompt Generation
```typescript
// framework/tools/smart-context.ts
export interface ContextBuildOptions {
  tokenBudget: number;
  instruction: string;
  testContext: any;
  priorityWeights: Record<string, number>;
}

export class SmartContextBuilder {
  private readonly defaultTokenBudget = 6000; // Leave room for response
  private readonly priorityWeights = {
    form: 1.0,
    interactive: 0.8,
    content: 0.6,
    navigation: 0.4,
    footer: 0.2
  };
  
  buildContext(snapshotResult: SnapshotResult, options: ContextBuildOptions): ContextResult {
    if (snapshotResult.type === 'initial') {
      return this.buildInitialContext(snapshotResult, options);
    } else {
      return this.buildDifferentialContext(snapshotResult, options);
    }
  }
  
  private buildInitialContext(result: SnapshotResult, options: ContextBuildOptions): ContextResult {
    const prioritizedChunks = this.prioritizeChunks(result.snapshot.chunks, options.instruction);
    const selectedChunks = this.selectChunksWithinBudget(prioritizedChunks, options.tokenBudget);
    
    const context = [
      `# Page Analysis`,
      `URL: ${result.snapshot.url}`,
      `Title: ${result.snapshot.metadata.title}`,
      `Task: ${options.instruction}`,
      '',
      '## Available Content:',
      ...selectedChunks.map(chunk => this.formatChunkForContext(chunk)),
      '',
      'Please analyze the page and determine the best action to complete the task.'
    ].join('\n');
    
    return {
      context,
      tokenEstimate: estimateTokens(context),
      metadata: {
        type: 'initial',
        chunksUsed: selectedChunks.length,
        totalChunks: result.snapshot.chunks.length,
        optimization: 1 - (selectedChunks.length / result.snapshot.chunks.length)
      }
    };
  }
  
  private buildDifferentialContext(result: SnapshotResult, options: ContextBuildOptions): ContextResult {
    const contextParts = [`# Page State Update`];
    
    // Add validation results
    if (result.validation) {
      contextParts.push(`Previous action: ${result.validation.success ? 'SUCCESS' : 'FAILED'}`);
      if (!result.validation.success) {
        contextParts.push(`Reason: ${result.validation.reason}`);
        contextParts.push('Validation details:');
        result.validation.checks.forEach(check => {
          contextParts.push(`- ${check.type}: expected "${check.expected}", got "${check.actual}"`);
        });
      }
      contextParts.push('');
    }
    
    // Add change summary
    if (result.changes.length > 0) {
      contextParts.push('## Changes Detected:');
      result.changes.forEach(change => {
        contextParts.push(`- ${change.type}: ${this.summarizeChange(change)}`);
      });
      
      // Include only affected content
      const affectedChunks = this.getAffectedChunks(result.snapshot, result.affectedChunks);
      if (affectedChunks.length > 0) {
        contextParts.push('', '## Updated Content:');
        affectedChunks.forEach(chunk => {
          contextParts.push(this.formatChunkForContext(chunk));
        });
      }
    } else {
      contextParts.push('No significant changes detected.');
    }
    
    contextParts.push('', `Next task: ${options.instruction}`);
    
    const context = contextParts.join('\n');
    
    return {
      context,
      tokenEstimate: estimateTokens(context),
      metadata: {
        type: 'differential',
        changesIncluded: result.changes.length,
        validationIncluded: !!result.validation,
        optimization: result.tokenEstimate / this.defaultTokenBudget
      }
    };
  }
  
  private prioritizeChunks(chunks: ContentChunk[], instruction: string): ContentChunk[] {
    return chunks
      .map(chunk => ({
        ...chunk,
        relevanceScore: this.calculateRelevance(chunk, instruction),
        priorityScore: this.priorityWeights[chunk.type] || 0.5
      }))
      .sort((a, b) => (b.relevanceScore + b.priorityScore) - (a.relevanceScore + a.priorityScore));
  }
  
  private calculateRelevance(chunk: ContentChunk, instruction: string): number {
    const keywords = this.extractKeywords(instruction);
    const chunkText = chunk.content.toLowerCase();
    
    let score = 0;
    keywords.forEach(keyword => {
      if (chunkText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    // Boost interactive elements for action instructions
    if (chunk.interactive && this.isActionInstruction(instruction)) {
      score += 2;
    }
    
    return score;
  }
  
  private extractKeywords(instruction: string): string[] {
    const actionWords = ['click', 'fill', 'select', 'submit', 'navigate', 'type', 'choose'];
    const words = instruction.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 3 && !actionWords.includes(word));
  }
  
  private isActionInstruction(instruction: string): boolean {
    const actionWords = ['click', 'fill', 'select', 'submit', 'type', 'choose'];
    return actionWords.some(action => instruction.toLowerCase().includes(action));
  }
}
```

### 4. Framework Integration

#### Enhanced Browser Framework with Token Optimization
```typescript
// framework/core/browser-framework.ts - Extend existing class
export class EnhancedBrowserTestFramework {
  private stateManager: FrameworkStateManager;
  private contextBuilder: SmartContextBuilder;
  private tokenTracker: TokenUsageTracker;
  
  constructor(config: FrameworkConfig) {
    // ... existing constructor code ...
    
    // Initialize token optimization components
    this.stateManager = new FrameworkStateManager();
    this.contextBuilder = new SmartContextBuilder();
    this.tokenTracker = new TokenUsageTracker();
    
    // Add token optimization tools if enabled
    if (config.token?.optimization !== false) {
      this.tools.push(createContentOptimizationTool(this));
      this.tools.push(createTokenAnalyticsTool(this));
    }
  }
  
  async executeInstructionWithOptimization(instruction: string): Promise<ExecutionResult> {
    const page = this.getPage();
    
    // Capture optimized page state
    const snapshotResult = await this.stateManager.captureSnapshot(page);
    
    // Build token-optimized context
    const contextResult = this.contextBuilder.buildContext(snapshotResult, {
      tokenBudget: this.config.token?.budget || 6000,
      instruction,
      testContext: this.currentSession,
      priorityWeights: this.config.token?.priorityWeights || {}
    });
    
    // Track token usage
    this.tokenTracker.recordPrompt(contextResult.tokenEstimate);
    
    // Execute with AI agent
    const response = await this.agent.invoke({
      messages: [{
        role: 'user',
        content: contextResult.context
      }]
    });
    
    // Track response tokens
    this.tokenTracker.recordResponse(response.tokenCount || estimateTokens(response.content));
    
    // Log optimization metrics
    this.logTestStep('token-optimization', {
      instruction,
      promptTokens: contextResult.tokenEstimate,
      responseTokens: response.tokenCount,
      optimization: contextResult.metadata.optimization,
      type: contextResult.metadata.type
    });
    
    return {
      success: true,
      response: response.content,
      tokenUsage: this.tokenTracker.getLastUsage(),
      optimization: contextResult.metadata
    };
  }
  
  storePageSnapshot(snapshot: PageSnapshot): void {
    this.stateManager.setCurrentSnapshot(snapshot);
  }
  
  getTokenUsage(): TokenUsageReport {
    return this.tokenTracker.generateReport();
  }
}
```

### 5. Configuration Integration

#### TypeScript Configuration Extensions
```typescript
// framework/types/config.ts - Extend existing interfaces
export interface TokenConfig {
  enabled?: boolean;
  budget?: number;
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo';
  optimization?: 'aggressive' | 'balanced' | 'conservative';
  tracking?: boolean;
  chunking?: {
    maxChunkSize?: number;
    overlapSize?: number;
    preserveStructure?: boolean;
  };
  validation?: {
    enabled?: boolean;
    timeout?: number;
    retryAttempts?: number;
  };
  priorityWeights?: Record<string, number>;
}

export interface FrameworkConfig {
  // ... existing config properties ...
  token?: TokenConfig;
}

// Default configuration
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  enabled: true,
  budget: 6000,
  model: 'gpt-4-turbo',
  optimization: 'balanced',
  tracking: true,
  chunking: {
    maxChunkSize: 2000,
    overlapSize: 200,
    preserveStructure: true
  },
  validation: {
    enabled: true,
    timeout: 5000,
    retryAttempts: 2
  },
  priorityWeights: {
    form: 1.0,
    interactive: 0.8,
    content: 0.6,
    navigation: 0.4,
    footer: 0.2
  }
};
```

### 6. CLI Integration

#### Command Line Support
```typescript
// bin/endorphin.ts - Add token-related flags
const FLAG_PARSERS: Record<string, (nextArg: string) => Partial<FrameworkConfig>> = {
  // ... existing flags ...
  '--token-budget': (nextArg) => ({ 
    token: { budget: parseInt(nextArg) } 
  }),
  '--token-optimization': (nextArg) => ({ 
    token: { optimization: nextArg as 'aggressive' | 'balanced' | 'conservative' } 
  }),
  '--token-tracking': () => ({ 
    token: { tracking: true } 
  }),
  '--disable-token-optimization': () => ({ 
    token: { enabled: false } 
  }),
};

// Add new CLI commands
if (command === 'analyze' && subcommand === 'tokens') {
  await analyzeTokenUsage(config);
}

async function analyzeTokenUsage(config: FrameworkConfig): Promise<void> {
  const framework = new EnhancedBrowserTestFramework(config);
  const report = framework.getTokenUsage();
  
  console.log('📊 Token Usage Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`💰 Total Cost: $${report.totalCost.toFixed(4)}`);
  console.log(`📈 Total Tokens: ${report.totalTokens.toLocaleString()}`);
  console.log(`⚡ Optimization: ${report.optimizationRate.toFixed(1)}% reduction`);
  console.log(`🧩 Avg Chunks Used: ${report.avgChunksUsed}/${report.avgChunksAvailable}`);
}
```

### 7. HTML Reporter Integration

#### Token Metrics in Reports
```typescript
// framework/reporters/html-reporter.ts - Extend existing reporter
interface EnhancedTestStep extends TestStep {
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
    optimization: number;
  };
}

// Add token analytics to report data
const tokenAnalytics = {
  totalTokens: session.steps.reduce((sum, step) => 
    sum + (step.tokenUsage?.totalTokens || 0), 0
  ),
  totalCost: session.steps.reduce((sum, step) => 
    sum + calculateStepCost(step.tokenUsage), 0
  ),
  optimizationSavings: session.steps.reduce((sum, step) => 
    sum + (step.tokenUsage?.optimization || 0), 0
  ) / session.steps.length
};

// Include in report template data
const reportData = {
  // ... existing data ...
  tokenAnalytics,
  steps: session.steps.map(step => ({
    ...step,
    tokenMetrics: step.tokenUsage
  }))
};
```

## Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
1. **State Management Foundation**
   - Implement `FrameworkStateManager` with snapshot capture
   - Add differential analysis capabilities
   - Create action validation framework

2. **Content Optimization Tools**
   - Implement intelligent content chunking
   - Create token-aware content selection
   - Add relevance scoring algorithms

### Phase 2: Smart Context Building (Weeks 3-4)
1. **Context Builder Implementation**
   - Build prompt optimization logic
   - Implement token budget management
   - Create instruction-aware content prioritization

2. **Framework Integration**
   - Extend `EnhancedBrowserTestFramework` with token optimization
   - Add configuration support
   - Implement tool registration

### Phase 3: Analytics and Validation (Weeks 5-6)
1. **Token Usage Tracking**
   - Implement comprehensive token analytics
   - Add cost calculation and reporting
   - Create optimization recommendations

2. **Action Validation System**
   - Build validation checks for each action type
   - Add retry logic for failed validations
   - Implement feedback loops

### Phase 4: CLI and Reporting (Weeks 7-8)
1. **CLI Integration**
   - Add token-related command line flags
   - Implement token analysis commands
   - Create budget monitoring

2. **Enhanced Reporting**
   - Add token metrics to HTML reports
   - Create token usage visualizations
   - Implement cost tracking dashboards

## Expected Benefits

### Token Reduction
- **Baseline**: 100,000-500,000 tokens per test
- **Optimized**: 15,000-75,000 tokens per test
- **Savings**: 70-85% reduction
- **Cost Impact**: $0.08-$0.38 per test (vs $0.50-$2.50)

### Accuracy Improvements
- **Focused Context**: AI receives only relevant page content
- **Validation Feedback**: Action success confirmation and retry logic
- **State Awareness**: Differential updates prevent information loss
- **Instruction Relevance**: Content prioritized by task relevance

### Performance Benefits
- **Faster Processing**: Smaller prompts reduce AI response time
- **Better Context Utilization**: More relevant information in token budget
- **Memory Efficiency**: Reduced memory usage in test execution
- **Scalability**: Cost-effective testing at scale

## Configuration Examples

### Basic Configuration
```typescript
// endorphin.config.ts
export default {
  token: {
    enabled: true,
    budget: 4000,
    optimization: 'balanced'
  }
} as FrameworkConfig;
```

### Advanced Configuration
```typescript
// endorphin.config.ts
export default {
  token: {
    enabled: true,
    budget: 6000,
    model: 'gpt-4-turbo',
    optimization: 'aggressive',
    tracking: true,
    chunking: {
      maxChunkSize: 1500,
      overlapSize: 150,
      preserveStructure: true
    },
    validation: {
      enabled: true,
      timeout: 3000,
      retryAttempts: 3
    },
    priorityWeights: {
      form: 1.0,
      interactive: 0.9,
      content: 0.5,
      navigation: 0.3,
      footer: 0.1
    }
  }
} as FrameworkConfig;
```

### Environment Variables
```bash
# Token optimization
ENDORPHIN_TOKEN_BUDGET=6000
ENDORPHIN_TOKEN_OPTIMIZATION=aggressive
ENDORPHIN_TOKEN_TRACKING=true
```

This comprehensive token optimization system integrates seamlessly with the existing TypeScript framework architecture while providing dramatic cost savings and accuracy improvements. The modular design ensures backward compatibility and allows for gradual adoption of optimization features.