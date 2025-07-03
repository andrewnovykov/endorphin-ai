/**
 * Token Pricing Configuration for AI Models
 * Prices are per 1,000 tokens (updated July 2025 based on actual usage data)
 */
/**
 * Default pricing configuration for popular AI models
 * Users can override this in their endorphin.config.ts
 */
export const DEFAULT_MODEL_PRICING = {
    // OpenAI Models (Updated based on actual usage data from June-July 2025)
    'gpt-4o': {
        input: 0.002187, // Actual: $0.002187 per 1K tokens (includes caching discount)
        output: 0.008747, // Actual: $0.008747 per 1K tokens
    },
    'gpt-4o-2024-08-06': {
        input: 0.002187, // Same as gpt-4o
        output: 0.008747,
    },
    'gpt-4o-mini': {
        input: 0.000066, // Proportionally adjusted from official $0.000075
        output: 0.000262, // Proportionally adjusted from official $0.0003
    },
    'gpt-4o-mini-2024-07-18': {
        input: 0.000066, // Same as gpt-4o-mini
        output: 0.000262,
    },
    'gpt-4': {
        input: 0.03,
        output: 0.06,
    },
    'gpt-4-turbo': {
        input: 0.01,
        output: 0.03,
    },
    'gpt-4-turbo-preview': {
        input: 0.01,
        output: 0.03,
    },
    'gpt-3.5-turbo': {
        input: 0.0005,
        output: 0.0015,
    },
    'gpt-3.5-turbo-16k': {
        input: 0.003,
        output: 0.004,
    },
    'gpt-3.5-turbo-instruct': {
        input: 0.0015,
        output: 0.002,
    },
    // Claude Models (Anthropic)
    'claude-3-opus': {
        input: 0.015,
        output: 0.075,
    },
    'claude-3-sonnet': {
        input: 0.003,
        output: 0.015,
    },
    'claude-3-haiku': {
        input: 0.00025,
        output: 0.00125,
    },
    'claude-3.5-sonnet': {
        input: 0.003,
        output: 0.015,
    },
    // Gemini Models (Google)
    'gemini-pro': {
        input: 0.0005,
        output: 0.0015,
    },
    'gemini-pro-vision': {
        input: 0.0005,
        output: 0.0015,
    },
    // Fallback for unknown models (use updated GPT-4o pricing)
    default: {
        input: 0.002187,
        output: 0.008747,
    },
};
/**
 * Validates pricing configuration format
 * @param pricing - Pricing configuration to validate
 * @returns Validation result with errors if any
 */
export function validatePricingConfig(pricing) {
    const errors = [];
    const warnings = [];
    // Check if pricing is an object
    if (!pricing || typeof pricing !== 'object') {
        errors.push('Pricing configuration must be an object');
        return { isValid: false, errors, warnings };
    }
    // Validate each model pricing
    for (const [modelName, modelPricing] of Object.entries(pricing)) {
        if (!modelName || typeof modelName !== 'string') {
            errors.push('Model names must be non-empty strings');
            continue;
        }
        if (!modelPricing || typeof modelPricing !== 'object') {
            errors.push(`Pricing for model "${modelName}" must be an object`);
            continue;
        }
        const pricing_obj = modelPricing;
        // Validate input price
        if (typeof pricing_obj.input !== 'number') {
            errors.push(`Input price for model "${modelName}" must be a number`);
        }
        else if (pricing_obj.input < 0) {
            errors.push(`Input price for model "${modelName}" must be non-negative`);
        }
        else if (pricing_obj.input > 1) {
            warnings.push(`Input price for model "${modelName}" seems high ($${pricing_obj.input} per 1K tokens)`);
        }
        // Validate output price
        if (typeof pricing_obj.output !== 'number') {
            errors.push(`Output price for model "${modelName}" must be a number`);
        }
        else if (pricing_obj.output < 0) {
            errors.push(`Output price for model "${modelName}" must be non-negative`);
        }
        else if (pricing_obj.output > 1) {
            warnings.push(`Output price for model "${modelName}" seems high ($${pricing_obj.output} per 1K tokens)`);
        }
        // Warn if output price is lower than input price (unusual)
        if (typeof pricing_obj.input === 'number' &&
            typeof pricing_obj.output === 'number' &&
            pricing_obj.output < pricing_obj.input) {
            warnings.push(`Output price for model "${modelName}" is lower than input price (unusual)`);
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Merges user pricing configuration with defaults
 * @param userPricing - User-provided pricing configuration
 * @returns Merged pricing configuration
 */
export function mergePricingConfig(userPricing) {
    if (!userPricing) {
        return { ...DEFAULT_MODEL_PRICING };
    }
    // Validate user pricing first
    const validation = validatePricingConfig(userPricing);
    if (!validation.isValid) {
        console.warn('⚠️ Invalid user pricing configuration, using defaults:', validation.errors);
        return { ...DEFAULT_MODEL_PRICING };
    }
    // Log warnings if any
    if (validation.warnings.length > 0) {
        console.warn('⚠️ Pricing configuration warnings:', validation.warnings);
    }
    // Merge user pricing with defaults (user takes precedence)
    return {
        ...DEFAULT_MODEL_PRICING,
        ...userPricing,
    };
}
/**
 * Gets pricing for a specific model with fallback
 * @param modelName - Name of the model
 * @param pricingConfig - Pricing configuration
 * @returns Model pricing or default pricing
 */
export function getModelPricing(modelName, pricingConfig) {
    // Try exact match first
    if (pricingConfig[modelName]) {
        return pricingConfig[modelName];
    }
    // Try case-insensitive match
    const lowerModelName = modelName.toLowerCase();
    const matchingKey = Object.keys(pricingConfig).find((key) => key.toLowerCase() === lowerModelName);
    if (matchingKey) {
        return pricingConfig[matchingKey];
    }
    // Use default fallback
    if (pricingConfig['default']) {
        return pricingConfig['default'];
    }
    // Ultimate fallback to GPT-4o pricing
    return DEFAULT_MODEL_PRICING['gpt-4o'];
}
//# sourceMappingURL=pricing-config.js.map