# Token Optimization for Endorphin AI

## Overview

This document outlines strategies to dramatically reduce AI token usage while improving test accuracy through HTML chunking, differential snapshots, and smart validation. Current approach sends full page snapshots to LLM, which burns excessive tokens. New approach combines chunking, diff analysis, and targeted updates.

## Current Problem

### Token Usage Analysis
- **Full page snapshot**: 10,000-50,000 tokens per interaction
- **Typical test with 10 steps**: 100,000-500,000 tokens
- **Cost impact**: $0.50-$2.50 per test run
- **Accuracy issues**: LLM gets overwhelmed with irrelevant content

### Pain Points
1. Sending entire DOM even for small changes
2. No validation that actions were successful
3. Redundant information in consecutive snapshots
4. High latency due to large payloads
5. Context window limitations with large pages

## Proposed Solution Architecture

### 1. HTML Chunking Strategy

#### Intelligent Content Segmentation
```javascript
/**
 * Smart HTML Chunker for Endorphin AI
 * Breaks down page content into logical, manageable chunks
 */
export class HTMLChunker {
  constructor(options = {}) {
    this.maxChunkSize = options.maxChunkSize || 2000; // tokens
    this.overlapSize = options.overlapSize || 200; // tokens for context
    this.preserveStructure = options.preserveStructure || true;
  }

  chunkPage(html, url) {
    const parsed = this.parseHTML(html);
    const chunks = this.createSemanticChunks(parsed);
    
    return {
      url,
      timestamp: Date.now(),
      totalChunks: chunks.length,
      chunks: chunks.map((chunk, index) => ({
        id: `chunk-${index}`,
        content: chunk.html,
        metadata: {
          selector: chunk.selector,
          type: chunk.type,
          interactive: chunk.hasInteractiveElements,
          tokens: this.estimateTokens(chunk.html)
        }
      }))
    };
  }

  createSemanticChunks(parsed) {
    const chunks = [];
    
    // 1. Navigation/Header chunk
    const nav = this.extractSection(parsed, 'nav, header, .navbar, .header');
    if (nav) chunks.push({ type: 'navigation', ...nav });
    
    // 2. Main content chunks (by sections/articles)
    const mainSections = this.extractSections(parsed, 'main, section, article, .content');
    chunks.push(...mainSections.map(section => ({ type: 'content', ...section })));
    
    // 3. Form chunks (keep forms together)
    const forms = this.extractSections(parsed, 'form');
    chunks.push(...forms.map(form => ({ type: 'form', ...form })));
    
    // 4. Interactive elements chunk
    const interactive = this.extractInteractiveElements(parsed);
    if (interactive) chunks.push({ type: 'interactive', ...interactive });
    
    // 5. Footer chunk
    const footer = this.extractSection(parsed, 'footer, .footer');
    if (footer) chunks.push({ type: 'footer', ...footer });
    
    return this.optimizeChunks(chunks);
  }

  extractInteractiveElements(parsed) {
    const selectors = [
      'button', 'input', 'select', 'textarea', 'a[href]',
      '[onclick]', '[role="button"]', '.btn', '.button'
    ];
    
    const elements = [];
    selectors.forEach(selector => {
      const found = parsed.querySelectorAll(selector);
      elements.push(...Array.from(found));
    });
    
    if (elements.length === 0) return null;
    
    return {
      html: this.buildMinimalHTML(elements),
      selector: 'interactive-elements',
      hasInteractiveElements: true
    };
  }

  buildMinimalHTML(elements) {
    // Create minimal HTML with just the interactive elements and their context
    return elements.map(el => {
      const parent = el.closest('[data-testid], .container, section, div[class]') || el.parentElement;
      return {
        tag: el.tagName.toLowerCase(),
        attributes: this.getRelevantAttributes(el),
        text: el.textContent?.trim().substring(0, 100),
        selector: this.generateSelector(el),
        context: parent ? parent.tagName.toLowerCase() : null
      };
    });
  }

  estimateTokens(content) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }
}
```

### 2. Differential Snapshot System

#### Page State Management
```javascript
/**
 * Differential Snapshot Manager
 * Tracks page changes and sends only diffs to LLM
 */
export class DiffSnapshotManager {
  constructor() {
    this.previousState = null;
    this.actionHistory = [];
    this.differ = new SmartDiffer();
  }

  async captureState(page, actionContext = null) {
    const currentState = await this.extractPageState(page);
    
    if (!this.previousState) {
      // First capture - send full chunked content
      this.previousState = currentState;
      return {
        type: 'initial',
        chunks: currentState.chunks,
        metadata: currentState.metadata
      };
    }
    
    // Generate diff
    const diff = this.differ.compare(this.previousState, currentState);
    
    // Update state
    this.previousState = currentState;
    
    if (actionContext) {
      this.actionHistory.push({
        action: actionContext,
        timestamp: Date.now(),
        changes: diff.changes.length
      });
    }
    
    return {
      type: 'differential',
      changes: diff.changes,
      affectedChunks: diff.affectedChunks,
      validation: await this.validateLastAction(page, actionContext),
      metadata: {
        ...currentState.metadata,
        changesSummary: diff.summary
      }
    };
  }

  async extractPageState(page) {
    const html = await page.content();
    const url = page.url();
    const chunker = new HTMLChunker();
    
    return {
      url,
      chunks: chunker.chunkPage(html, url),
      metadata: {
        title: await page.title(),
        viewport: await page.viewportSize(),
        loadState: await page.evaluate(() => document.readyState),
        timestamp: Date.now()
      }
    };
  }

  async validateLastAction(page, actionContext) {
    if (!actionContext) return null;
    
    const validation = {};
    
    switch (actionContext.type) {
      case 'click':
        validation.clicked = await this.validateClick(page, actionContext);
        break;
      case 'fill':
        validation.filled = await this.validateFill(page, actionContext);
        break;
      case 'navigate':
        validation.navigated = await this.validateNavigation(page, actionContext);
        break;
    }
    
    return validation;
  }

  async validateFill(page, actionContext) {
    try {
      const element = page.locator(actionContext.selector);
      const currentValue = await element.inputValue();
      
      return {
        success: currentValue === actionContext.expectedValue,
        actualValue: currentValue,
        expectedValue: actionContext.expectedValue,
        selector: actionContext.selector
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        selector: actionContext.selector
      };
    }
  }

  async validateClick(page, actionContext) {
    try {
      // Check if click resulted in expected changes
      const checks = [];
      
      // URL change detection
      if (actionContext.expectedUrl) {
        checks.push({
          type: 'url',
          expected: actionContext.expectedUrl,
          actual: page.url(),
          success: page.url().includes(actionContext.expectedUrl)
        });
      }
      
      // Element visibility change
      if (actionContext.expectedVisible) {
        const isVisible = await page.locator(actionContext.expectedVisible).isVisible();
        checks.push({
          type: 'visibility',
          selector: actionContext.expectedVisible,
          success: isVisible
        });
      }
      
      // Element text change
      if (actionContext.expectedText) {
        const element = page.locator(actionContext.expectedText.selector);
        const text = await element.textContent();
        checks.push({
          type: 'text',
          expected: actionContext.expectedText.value,
          actual: text,
          success: text?.includes(actionContext.expectedText.value)
        });
      }
      
      return {
        success: checks.every(check => check.success),
        checks
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

#### Smart Differ Implementation
```javascript
/**
 * Smart HTML Differ
 * Identifies meaningful changes between page states
 */
export class SmartDiffer {
  constructor() {
    this.ignoredAttributes = ['style', 'class']; // Often change without meaning
    this.importantSelectors = [
      'input', 'select', 'textarea', 'button',
      '[data-testid]', '.error', '.success', '.alert'
    ];
  }

  compare(previousState, currentState) {
    const changes = [];
    const affectedChunks = new Set();
    
    // Compare chunks
    for (let i = 0; i < Math.max(previousState.chunks.length, currentState.chunks.length); i++) {
      const prevChunk = previousState.chunks[i];
      const currChunk = currentState.chunks[i];
      
      if (!prevChunk) {
        // New chunk added
        changes.push({
          type: 'added',
          chunkId: currChunk.id,
          content: currChunk.content
        });
        affectedChunks.add(currChunk.id);
      } else if (!currChunk) {
        // Chunk removed
        changes.push({
          type: 'removed',
          chunkId: prevChunk.id
        });
        affectedChunks.add(prevChunk.id);
      } else {
        // Compare chunk content
        const chunkDiff = this.compareChunks(prevChunk, currChunk);
        if (chunkDiff.hasChanges) {
          changes.push({
            type: 'modified',
            chunkId: currChunk.id,
            diff: chunkDiff
          });
          affectedChunks.add(currChunk.id);
        }
      }
    }
    
    return {
      changes,
      affectedChunks: Array.from(affectedChunks),
      summary: this.generateSummary(changes)
    };
  }

  compareChunks(prevChunk, currChunk) {
    // Use a library like 'diff' for detailed comparison
    const diff = this.createDetailedDiff(prevChunk.content, currChunk.content);
    
    return {
      hasChanges: diff.length > 0,
      changes: diff,
      importantChanges: diff.filter(change => this.isImportantChange(change))
    };
  }

  createDetailedDiff(prev, curr) {
    // Simplified diff - in real implementation, use library like 'diff'
    if (prev === curr) return [];
    
    return [{
      type: 'change',
      oldValue: this.truncateContent(prev),
      newValue: this.truncateContent(curr),
      importance: this.assessImportance(prev, curr)
    }];
  }

  isImportantChange(change) {
    // Determine if change is important for AI context
    const importantKeywords = [
      'error', 'success', 'invalid', 'required',
      'submit', 'loading', 'disabled', 'hidden'
    ];
    
    const content = (change.newValue || '').toLowerCase();
    return importantKeywords.some(keyword => content.includes(keyword));
  }

  generateSummary(changes) {
    return {
      totalChanges: changes.length,
      changeTypes: this.groupChangesByType(changes),
      hasImportantChanges: changes.some(c => c.diff?.importantChanges?.length > 0)
    };
  }

  truncateContent(content, maxLength = 500) {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}
```

### 3. Intelligent Context Building

#### Context-Aware Prompt Generation
```javascript
/**
 * Smart Context Builder
 * Builds minimal, focused prompts for LLM
 */
export class SmartContextBuilder {
  constructor() {
    this.tokenBudget = 8000; // Leave room for response
    this.priorityWeights = {
      'form': 1.0,
      'interactive': 0.8,
      'content': 0.6,
      'navigation': 0.4,
      'footer': 0.2
    };
  }

  buildPrompt(snapshotData, instruction, testContext) {
    if (snapshotData.type === 'initial') {
      return this.buildInitialPrompt(snapshotData, instruction, testContext);
    } else {
      return this.buildDifferentialPrompt(snapshotData, instruction, testContext);
    }
  }

  buildInitialPrompt(snapshotData, instruction, testContext) {
    const prioritizedChunks = this.prioritizeChunks(snapshotData.chunks, instruction);
    const selectedChunks = this.selectChunksWithinBudget(prioritizedChunks);
    
    return {
      system: this.getSystemPrompt(),
      user: [
        `Test Context: ${testContext.description}`,
        `Current Task: ${instruction}`,
        `Page URL: ${snapshotData.metadata?.url}`,
        `Page Title: ${snapshotData.metadata?.title}`,
        '',
        'Page Content (by sections):',
        ...selectedChunks.map(chunk => this.formatChunk(chunk)),
        '',
        'Please perform the requested action and provide the selector to use.'
      ].join('\n'),
      metadata: {
        chunksUsed: selectedChunks.length,
        totalChunks: snapshotData.chunks.length,
        estimatedTokens: this.estimatePromptTokens(selectedChunks)
      }
    };
  }

  buildDifferentialPrompt(snapshotData, instruction, testContext) {
    const validation = snapshotData.validation;
    const changes = snapshotData.changes;
    
    let prompt = [
      `Previous action validation: ${validation ? 'Success' : 'Failed'}`,
    ];
    
    if (validation) {
      prompt.push(`Validation details: ${JSON.stringify(validation, null, 2)}`);
    }
    
    if (changes.length > 0) {
      prompt.push('', 'Page changes detected:');
      changes.forEach(change => {
        prompt.push(`- ${change.type}: ${this.summarizeChange(change)}`);
      });
      
      // Include only affected chunks
      const affectedChunks = this.getAffectedChunks(snapshotData);
      if (affectedChunks.length > 0) {
        prompt.push('', 'Updated content:');
        affectedChunks.forEach(chunk => {
          prompt.push(this.formatChunk(chunk));
        });
      }
    } else {
      prompt.push('No significant changes detected.');
    }
    
    prompt.push('', `Next task: ${instruction}`);
    
    return {
      system: this.getSystemPrompt(),
      user: prompt.join('\n'),
      metadata: {
        changesIncluded: changes.length,
        validationIncluded: !!validation,
        estimatedTokens: this.estimatePromptTokens(prompt)
      }
    };
  }

  prioritizeChunks(chunks, instruction) {
    return chunks
      .map(chunk => ({
        ...chunk,
        relevanceScore: this.calculateRelevance(chunk, instruction),
        priorityScore: this.priorityWeights[chunk.metadata.type] || 0.5
      }))
      .sort((a, b) => (b.relevanceScore + b.priorityScore) - (a.relevanceScore + a.priorityScore));
  }

  calculateRelevance(chunk, instruction) {
    const keywords = this.extractKeywords(instruction);
    const chunkText = chunk.content.toLowerCase();
    
    let score = 0;
    keywords.forEach(keyword => {
      if (chunkText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    // Boost score for interactive elements when instruction involves action
    if (chunk.metadata.interactive && this.isActionInstruction(instruction)) {
      score += 2;
    }
    
    return score;
  }

  extractKeywords(instruction) {
    // Simple keyword extraction - could be enhanced with NLP
    const actionWords = ['click', 'fill', 'select', 'submit', 'navigate', 'type'];
    const words = instruction.toLowerCase().split(/\s+/);
    
    return words.filter(word => 
      word.length > 3 && !actionWords.includes(word)
    );
  }

  isActionInstruction(instruction) {
    const actionWords = ['click', 'fill', 'select', 'submit', 'type', 'choose'];
    return actionWords.some(action => 
      instruction.toLowerCase().includes(action)
    );
  }

  selectChunksWithinBudget(prioritizedChunks) {
    const selected = [];
    let currentTokens = 0;
    
    for (const chunk of prioritizedChunks) {
      const chunkTokens = chunk.metadata.tokens;
      if (currentTokens + chunkTokens <= this.tokenBudget) {
        selected.push(chunk);
        currentTokens += chunkTokens;
      } else {
        break;
      }
    }
    
    return selected;
  }

  formatChunk(chunk) {
    return [
      `## ${chunk.metadata.type.toUpperCase()} Section`,
      `Selector: ${chunk.metadata.selector}`,
      chunk.content,
      ''
    ].join('\n');
  }
}
```

### 4. Integration with Framework

#### Enhanced Browser Framework
```javascript
/**
 * Enhanced Browser Framework with Token Optimization
 */
export class TokenOptimizedBrowserFramework {
  constructor(options = {}) {
    this.snapshotManager = new DiffSnapshotManager();
    this.contextBuilder = new SmartContextBuilder();
    this.tokenTracker = new TokenUsageTracker();
  }

  async executeInstruction(page, instruction, testContext) {
    // Capture current state (initial or diff)
    const snapshotData = await this.snapshotManager.captureState(page);
    
    // Build optimized prompt
    const prompt = this.contextBuilder.buildPrompt(snapshotData, instruction, testContext);
    
    // Track token usage
    this.tokenTracker.recordPrompt(prompt.metadata.estimatedTokens);
    
    // Send to AI
    const response = await this.sendToAI(prompt);
    
    // Track response tokens
    this.tokenTracker.recordResponse(response.tokenCount);
    
    // Execute the AI's response
    const result = await this.executeAIResponse(page, response, instruction);
    
    // Validate the action
    if (result.success) {
      await this.snapshotManager.captureState(page, {
        type: result.actionType,
        selector: result.selector,
        expectedValue: result.expectedValue,
        instruction
      });
    }
    
    return {
      ...result,
      tokenUsage: this.tokenTracker.getLastUsage(),
      optimizationMetrics: {
        promptTokens: prompt.metadata.estimatedTokens,
        chunksUsed: prompt.metadata.chunksUsed,
        totalChunks: prompt.metadata.totalChunks
      }
    };
  }

  async executeAIResponse(page, response, originalInstruction) {
    try {
      const action = JSON.parse(response.content);
      
      switch (action.type) {
        case 'click':
          await page.locator(action.selector).click();
          return {
            success: true,
            actionType: 'click',
            selector: action.selector,
            message: `Clicked ${action.selector}`
          };
          
        case 'fill':
          await page.locator(action.selector).fill(action.value);
          return {
            success: true,
            actionType: 'fill',
            selector: action.selector,
            expectedValue: action.value,
            message: `Filled ${action.selector} with "${action.value}"`
          };
          
        case 'navigate':
          await page.goto(action.url);
          return {
            success: true,
            actionType: 'navigate',
            url: action.url,
            message: `Navigated to ${action.url}`
          };
          
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        instruction: originalInstruction
      };
    }
  }
}
```

### 5. Token Usage Tracking

#### Comprehensive Token Analytics
```javascript
/**
 * Token Usage Tracker and Analytics
 */
export class TokenUsageTracker {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
  }

  startSession(testId) {
    this.currentSession = {
      testId,
      startTime: Date.now(),
      endTime: null,
      interactions: [],
      totalPromptTokens: 0,
      totalResponseTokens: 0,
      totalCost: 0,
      optimizationMetrics: {
        chunksUsed: 0,
        chunksAvailable: 0,
        diffsGenerated: 0,
        validationsPerformed: 0
      }
    };
  }

  recordPrompt(tokens, metadata = {}) {
    if (!this.currentSession) return;
    
    this.currentSession.totalPromptTokens += tokens;
    this.currentSession.optimizationMetrics.chunksUsed += metadata.chunksUsed || 0;
    this.currentSession.optimizationMetrics.chunksAvailable += metadata.totalChunks || 0;
    
    this.currentSession.interactions.push({
      type: 'prompt',
      tokens,
      timestamp: Date.now(),
      metadata
    });
  }

  recordResponse(tokens, metadata = {}) {
    if (!this.currentSession) return;
    
    this.currentSession.totalResponseTokens += tokens;
    
    this.currentSession.interactions.push({
      type: 'response',
      tokens,
      timestamp: Date.now(),
      metadata
    });
  }

  endSession() {
    if (!this.currentSession) return null;
    
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.totalCost = this.calculateCost(this.currentSession);
    
    this.sessions.push(this.currentSession);
    const session = this.currentSession;
    this.currentSession = null;
    
    return session;
  }

  calculateCost(session) {
    // OpenAI pricing (as of 2024)
    const promptCostPer1K = 0.0015; // GPT-4
    const responseCostPer1K = 0.002;
    
    const promptCost = (session.totalPromptTokens / 1000) * promptCostPer1K;
    const responseCost = (session.totalResponseTokens / 1000) * responseCostPer1K;
    
    return promptCost + responseCost;
  }

  generateReport() {
    const totalSessions = this.sessions.length;
    const totalTokens = this.sessions.reduce((sum, s) => 
      sum + s.totalPromptTokens + s.totalResponseTokens, 0);
    const totalCost = this.sessions.reduce((sum, s) => sum + s.totalCost, 0);
    
    const avgTokensPerSession = totalTokens / totalSessions;
    const avgCostPerSession = totalCost / totalSessions;
    
    const optimizationEffectiveness = this.calculateOptimizationEffectiveness();
    
    return {
      summary: {
        totalSessions,
        totalTokens,
        totalCost: totalCost.toFixed(4),
        avgTokensPerSession: avgTokensPerSession.toFixed(0),
        avgCostPerSession: avgCostPerSession.toFixed(4)
      },
      optimization: optimizationEffectiveness,
      recommendations: this.generateRecommendations(optimizationEffectiveness),
      sessions: this.sessions
    };
  }

  calculateOptimizationEffectiveness() {
    const totalChunksAvailable = this.sessions.reduce((sum, s) => 
      sum + s.optimizationMetrics.chunksAvailable, 0);
    const totalChunksUsed = this.sessions.reduce((sum, s) => 
      sum + s.optimizationMetrics.chunksUsed, 0);
    
    const chunkReductionRate = totalChunksAvailable > 0 ? 
      1 - (totalChunksUsed / totalChunksAvailable) : 0;
    
    const estimatedTokenSavings = chunkReductionRate * 0.7; // Estimate
    
    return {
      chunkReductionRate: (chunkReductionRate * 100).toFixed(1) + '%',
      estimatedTokenSavings: (estimatedTokenSavings * 100).toFixed(1) + '%',
      diffsGenerated: this.sessions.reduce((sum, s) => 
        sum + s.optimizationMetrics.diffsGenerated, 0),
      validationsPerformed: this.sessions.reduce((sum, s) => 
        sum + s.optimizationMetrics.validationsPerformed, 0)
    };
  }

  generateRecommendations(optimization) {
    const recommendations = [];
    
    if (parseFloat(optimization.chunkReductionRate) < 50) {
      recommendations.push({
        type: 'chunking',
        message: 'Consider more aggressive chunking to reduce token usage',
        priority: 'high'
      });
    }
    
    if (parseFloat(optimization.estimatedTokenSavings) < 30) {
      recommendations.push({
        type: 'optimization',
        message: 'Diff algorithm could be more selective',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  getLastUsage() {
    if (!this.currentSession || this.currentSession.interactions.length === 0) {
      return null;
    }
    
    const lastPrompt = this.currentSession.interactions
      .reverse()
      .find(i => i.type === 'prompt');
    const lastResponse = this.currentSession.interactions
      .reverse()
      .find(i => i.type === 'response');
    
    return {
      promptTokens: lastPrompt?.tokens || 0,
      responseTokens: lastResponse?.tokens || 0,
      totalTokens: (lastPrompt?.tokens || 0) + (lastResponse?.tokens || 0)
    };
  }
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. **HTMLChunker Implementation**
   - Semantic content segmentation
   - Interactive element extraction
   - Token estimation
   - Chunk optimization

2. **DiffSnapshotManager Basic**
   - State capture and comparison
   - Simple diff generation
   - Basic validation framework

### Phase 2: Smart Diffing (Week 3-4)
1. **SmartDiffer Implementation**
   - Library integration (diff, fast-diff)
   - Importance assessment
   - Change summarization
   - Performance optimization

2. **Validation Enhancement**
   - Action-specific validation
   - Multi-layered confirmation
   - Error detection and reporting

### Phase 3: Context Optimization (Week 5-6)
1. **SmartContextBuilder**
   - Relevance scoring algorithms
   - Budget management
   - Prompt optimization
   - A/B testing framework

2. **Token Analytics**
   - Usage tracking and reporting
   - Cost analysis
   - Optimization recommendations
   - Performance monitoring

### Phase 4: Integration & Testing (Week 7-8)
1. **Framework Integration**
   - Backward compatibility
   - Configuration options
   - Performance testing
   - User documentation

2. **Validation & Optimization**
   - Real-world testing
   - Performance benchmarking
   - Token usage analysis
   - Accuracy measurement

## Expected Benefits

### Token Reduction
- **Current**: 100,000-500,000 tokens per test
- **Optimized**: 20,000-100,000 tokens per test
- **Savings**: 60-80% reduction
- **Cost Impact**: $0.10-$0.50 per test (vs $0.50-$2.50)

### Accuracy Improvements
- **Focused Context**: LLM sees only relevant content
- **Validation Feedback**: Confirms actions were successful
- **Error Recovery**: Retry with better context on failure
- **Consistency**: Repeatable results with less noise

### Performance Benefits
- **Faster Processing**: Smaller prompts = faster responses
- **Better Context**: More relevant information in context window
- **Incremental Updates**: Only process what changed
- **Memory Efficiency**: Reduced memory usage in CI/CD

## Configuration Options

### Framework Configuration (`endorphin.config.js`)
```javascript
export default {
  tokenOptimization: {
    enabled: true,
    chunking: {
      maxChunkSize: 2000,
      overlapSize: 200,
      preserveStructure: true
    },
    diffing: {
      enabled: true,
      ignoreAttributes: ['style', 'class'],
      importantSelectors: ['[data-testid]', '.error', '.success']
    },
    validation: {
      enabled: true,
      timeout: 5000,
      retryAttempts: 2
    },
    analytics: {
      enabled: true,
      reportPath: 'token-usage-report.json'
    }
  }
};
```

### Environment Variables
```bash
# Token optimization
ENDORPHIN_TOKEN_OPTIMIZATION=true
ENDORPHIN_MAX_CHUNK_SIZE=2000
ENDORPHIN_DIFF_ENABLED=true
ENDORPHIN_VALIDATION_ENABLED=true

# Analytics
ENDORPHIN_TRACK_TOKENS=true
ENDORPHIN_TOKEN_BUDGET=8000
```

## Monitoring & Analytics

### Token Usage Dashboard
```html
<!-- Token usage monitoring -->
<div class="token-dashboard">
  <div class="metric-card">
    <h3>Token Savings</h3>
    <div class="metric-value">68%</div>
    <div class="metric-trend">↓ 120K tokens saved</div>
  </div>
  
  <div class="metric-card">
    <h3>Cost Reduction</h3>
    <div class="metric-value">$1.20</div>
    <div class="metric-trend">↓ 65% vs baseline</div>
  </div>
  
  <div class="metric-card">
    <h3>Accuracy</h3>
    <div class="metric-value">94%</div>
    <div class="metric-trend">↑ 8% improvement</div>
  </div>
</div>
```

### CLI Reporting
```bash
$ endorphin analyze tokens

📊 Token Usage Analysis (Last 30 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Cost Savings
  Previous: $45.60 (3.2M tokens)
  Current:  $18.20 (1.1M tokens)
  Saved:    $27.40 (60% reduction)

🧩 Chunking Effectiveness
  Chunks used: 1,240 / 3,890 (32%)
  Avg reduction: 68% per test

🔄 Diff Efficiency
  Diffs generated: 890
  Avg change detection: 15%
  False positives: 3%

✅ Validation Success
  Actions validated: 1,450
  Success rate: 94%
  Auto-retries: 67
```

This comprehensive token optimization system will dramatically reduce costs while improving test accuracy and reliability. The phased implementation approach ensures minimal disruption to existing functionality while delivering immediate benefits.