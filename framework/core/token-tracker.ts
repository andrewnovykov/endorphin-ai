/**
 * Simple Token Usage Tracker for Endorphin AI
 * Tracks AI token usage and costs for test sessions
 */

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
  timestamp: string;
}

export interface TokenSessionSummary {
  totalTokens: number;
  totalCost: number;
  aiCalls: number;
  avgTokensPerCall: number;
  model: string;
}

export class TokenTracker {
  private tokenUsage: TokenUsage[] = [];
  private currentModel: string = 'gpt-4o';
  
  // OpenAI Pricing (as of 2024)
  private readonly modelPricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025, output: 0.01 },          // per 1K tokens
    'gpt-4': { input: 0.03, output: 0.06 },             // per 1K tokens  
    'gpt-4-turbo': { input: 0.01, output: 0.03 },       // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }, // per 1K tokens
  };

  constructor(model: string = 'gpt-4o') {
    this.currentModel = model;
  }

  /**
   * Record token usage from an AI interaction
   */
  recordUsage(promptTokens: number, responseTokens: number, model?: string): TokenUsage {
    const usedModel = model || this.currentModel;
    const cost = this.calculateCost(promptTokens, responseTokens, usedModel);
    
    const usage: TokenUsage = {
      promptTokens,
      responseTokens,
      totalTokens: promptTokens + responseTokens,
      cost,
      model: usedModel,
      timestamp: new Date().toISOString()
    };
    
    this.tokenUsage.push(usage);
    return usage;
  }

  /**
   * Estimate token usage from text content
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    // This is an approximation - actual tokenization varies
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost for token usage
   */
  private calculateCost(promptTokens: number, responseTokens: number, model: string): number {
    const pricing = this.modelPricing[model];
    if (!pricing) {
      console.warn(`⚠️ Unknown model pricing: ${model}, using gpt-4o rates`);
      return this.calculateCost(promptTokens, responseTokens, 'gpt-4o');
    }

    const promptCost = (promptTokens / 1000) * pricing.input;
    const responseCost = (responseTokens / 1000) * pricing.output;
    
    return promptCost + responseCost;
  }

  /**
   * Get session summary
   */
  getSessionSummary(): TokenSessionSummary {
    if (this.tokenUsage.length === 0) {
      return {
        totalTokens: 0,
        totalCost: 0,
        aiCalls: 0,
        avgTokensPerCall: 0,
        model: this.currentModel
      };
    }

    const totalTokens = this.tokenUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);
    const totalCost = this.tokenUsage.reduce((sum, usage) => sum + usage.cost, 0);
    
    return {
      totalTokens,
      totalCost,
      aiCalls: this.tokenUsage.length,
      avgTokensPerCall: Math.round(totalTokens / this.tokenUsage.length),
      model: this.currentModel
    };
  }

  /**
   * Get formatted cost string
   */
  getFormattedCost(): string {
    const summary = this.getSessionSummary();
    return `$${summary.totalCost.toFixed(4)}`;
  }

  /**
   * Get formatted summary string for console output
   */
  getFormattedSummary(): string {
    const summary = this.getSessionSummary();
    
    if (summary.aiCalls === 0) {
      return '🤖 No AI calls made yet';
    }

    return [
      `🤖 AI Usage Summary:`,
      `   💰 Total Cost: $${summary.totalCost.toFixed(4)}`,
      `   🔢 Total Tokens: ${summary.totalTokens.toLocaleString()}`,
      `   📞 AI Calls: ${summary.aiCalls}`,
      `   📊 Avg Tokens/Call: ${summary.avgTokensPerCall}`,
      `   🤖 Model: ${summary.model}`
    ].join('\n');
  }

  /**
   * Reset token tracking for new session
   */
  reset(): void {
    this.tokenUsage = [];
  }

  /**
   * Get all token usage records
   */
  getAllUsage(): TokenUsage[] {
    return [...this.tokenUsage];
  }
}