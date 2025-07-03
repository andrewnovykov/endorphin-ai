/**
 * Token Usage Tracker for Endorphin AI
 * Tracks AI token usage and costs for test sessions with configurable pricing
 */
import { getModelPricing, mergePricingConfig, } from '../config/pricing-config.js';
export class TokenTracker {
    tokenUsage = [];
    currentModel = 'gpt-4o';
    pricingConfig;
    constructor(model = 'gpt-4o', customPricing) {
        this.currentModel = model;
        this.pricingConfig = mergePricingConfig(customPricing);
    }
    /**
     * Update pricing configuration
     * @param customPricing - New pricing configuration
     */
    updatePricingConfig(customPricing) {
        this.pricingConfig = mergePricingConfig(customPricing);
    }
    /**
     * Get current pricing configuration
     * @returns Current pricing configuration
     */
    getPricingConfig() {
        return { ...this.pricingConfig };
    }
    /**
     * Get pricing for a specific model
     * @param model - Model name
     * @returns Model pricing
     */
    getModelPricing(model) {
        const modelName = model || this.currentModel;
        return getModelPricing(modelName, this.pricingConfig);
    }
    /**
     * Record token usage from an AI interaction
     */
    recordUsage(promptTokens, responseTokens, model) {
        const usedModel = model || this.currentModel;
        const cost = this.calculateCost(promptTokens, responseTokens, usedModel);
        const usage = {
            promptTokens,
            responseTokens,
            totalTokens: promptTokens + responseTokens,
            cost,
            model: usedModel,
            timestamp: new Date().toISOString(),
        };
        this.tokenUsage.push(usage);
        return usage;
    }
    /**
     * Estimate token usage from text content
     */
    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for English
        // This is an approximation - actual tokenization varies
        return Math.ceil(text.length / 4);
    }
    /**
     * Calculate cost for token usage
     */
    calculateCost(promptTokens, responseTokens, model) {
        // Check if model exists in pricing config (exact or case-insensitive match)
        const hasExactMatch = this.pricingConfig[model];
        const hasInsensitiveMatch = !hasExactMatch &&
            Object.keys(this.pricingConfig).some((key) => key.toLowerCase() === model.toLowerCase());
        // Warn if using fallback pricing
        if (!hasExactMatch && !hasInsensitiveMatch) {
            console.warn(`⚠️ No pricing found for model: ${model}, using default pricing`);
        }
        const pricing = getModelPricing(model, this.pricingConfig);
        return this.calculateCostWithPricing(promptTokens, responseTokens, pricing);
    }
    /**
     * Calculate cost with specific pricing
     */
    calculateCostWithPricing(promptTokens, responseTokens, pricing) {
        const promptCost = (promptTokens / 1000) * pricing.input;
        const responseCost = (responseTokens / 1000) * pricing.output;
        return promptCost + responseCost;
    }
    /**
     * Get session summary
     */
    getSessionSummary() {
        if (this.tokenUsage.length === 0) {
            return {
                totalTokens: 0,
                totalCost: 0,
                aiCalls: 0,
                avgTokensPerCall: 0,
                model: this.currentModel,
            };
        }
        const totalTokens = this.tokenUsage.reduce((sum, usage) => sum + usage.totalTokens, 0);
        const totalCost = this.tokenUsage.reduce((sum, usage) => sum + usage.cost, 0);
        return {
            totalTokens,
            totalCost,
            aiCalls: this.tokenUsage.length,
            avgTokensPerCall: Math.round(totalTokens / this.tokenUsage.length),
            model: this.currentModel,
        };
    }
    /**
     * Get formatted cost string
     */
    getFormattedCost() {
        const summary = this.getSessionSummary();
        return `$${summary.totalCost.toFixed(4)}`;
    }
    /**
     * Get formatted summary string for console output
     */
    getFormattedSummary() {
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
            `   🤖 Model: ${summary.model}`,
        ].join('\n');
    }
    /**
     * Reset token tracking for new session
     */
    reset() {
        this.tokenUsage = [];
    }
    /**
     * Get all token usage records
     */
    getAllUsage() {
        return [...this.tokenUsage];
    }
    /**
     * Get supported models from pricing configuration
     */
    getSupportedModels() {
        return Object.keys(this.pricingConfig).filter((model) => model !== 'default');
    }
    /**
     * Check if a model is supported
     */
    isModelSupported(model) {
        return (this.getSupportedModels().includes(model) ||
            this.getSupportedModels().some((m) => m.toLowerCase() === model.toLowerCase()));
    }
    /**
     * Get detailed pricing information for debugging
     */
    getPricingInfo() {
        return {
            currentModel: this.currentModel,
            supportedModels: this.getSupportedModels(),
            pricing: this.getPricingConfig(),
            currentModelPricing: this.getModelPricing(),
        };
    }
}
//# sourceMappingURL=token-tracker.js.map