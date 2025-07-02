/**
 * Token Usage Tracker for Endorphin AI
 * Tracks AI token usage and costs for test sessions with configurable pricing
 */
import { ModelPricing, PricingConfig } from '../config/pricing-config';
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
export declare class TokenTracker {
    private tokenUsage;
    private currentModel;
    private pricingConfig;
    constructor(model?: string, customPricing?: PricingConfig);
    /**
     * Update pricing configuration
     * @param customPricing - New pricing configuration
     */
    updatePricingConfig(customPricing?: PricingConfig): void;
    /**
     * Get current pricing configuration
     * @returns Current pricing configuration
     */
    getPricingConfig(): PricingConfig;
    /**
     * Get pricing for a specific model
     * @param model - Model name
     * @returns Model pricing
     */
    getModelPricing(model?: string): ModelPricing;
    /**
     * Record token usage from an AI interaction
     */
    recordUsage(promptTokens: number, responseTokens: number, model?: string): TokenUsage;
    /**
     * Estimate token usage from text content
     */
    estimateTokens(text: string): number;
    /**
     * Calculate cost for token usage
     */
    private calculateCost;
    /**
     * Calculate cost with specific pricing
     */
    private calculateCostWithPricing;
    /**
     * Get session summary
     */
    getSessionSummary(): TokenSessionSummary;
    /**
     * Get formatted cost string
     */
    getFormattedCost(): string;
    /**
     * Get formatted summary string for console output
     */
    getFormattedSummary(): string;
    /**
     * Reset token tracking for new session
     */
    reset(): void;
    /**
     * Get all token usage records
     */
    getAllUsage(): TokenUsage[];
    /**
     * Get supported models from pricing configuration
     */
    getSupportedModels(): string[];
    /**
     * Check if a model is supported
     */
    isModelSupported(model: string): boolean;
    /**
     * Get detailed pricing information for debugging
     */
    getPricingInfo(): {
        currentModel: string;
        supportedModels: string[];
        pricing: PricingConfig;
        currentModelPricing: ModelPricing;
    };
}
//# sourceMappingURL=token-tracker.d.ts.map