/**
 * Token Pricing Configuration for AI Models
 * Prices are per 1,000 tokens (as of 2024)
 */
export interface ModelPricing {
    input: number;
    output: number;
}
export interface PricingConfig {
    [modelName: string]: ModelPricing;
}
/**
 * Default pricing configuration for popular AI models
 * Users can override this in their endorphin.config.ts
 */
export declare const DEFAULT_MODEL_PRICING: PricingConfig;
/**
 * Validates pricing configuration format
 * @param pricing - Pricing configuration to validate
 * @returns Validation result with errors if any
 */
export declare function validatePricingConfig(pricing: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Merges user pricing configuration with defaults
 * @param userPricing - User-provided pricing configuration
 * @returns Merged pricing configuration
 */
export declare function mergePricingConfig(userPricing?: PricingConfig): PricingConfig;
/**
 * Gets pricing for a specific model with fallback
 * @param modelName - Name of the model
 * @param pricingConfig - Pricing configuration
 * @returns Model pricing or default pricing
 */
export declare function getModelPricing(modelName: string, pricingConfig: PricingConfig): ModelPricing;
//# sourceMappingURL=pricing-config.d.ts.map