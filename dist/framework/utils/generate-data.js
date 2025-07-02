/**
 * AI-powered data generation utility
 * Generates realistic test data based on schemas using OpenAI
 */
import { ChatOpenAI } from '@langchain/openai';
import { AGENT_CONFIG } from '../ai/config/agent-config.js';
import { TokenTracker } from '../core/token-tracker.js';
/**
 * Generate realistic test data using AI based on a schema
 * @param schema - The data schema (JSON Schema, TypeScript interface, or description)
 * @param context - Optional context to guide data generation
 * @returns Generated data matching the schema
 */
export async function generateData(schema, context) {
    const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2);
    // Build the prompt
    let prompt = `Generate realistic test data that matches the following schema:\n\n${schemaString}`;
    if (context) {
        prompt += `\n\nAdditional context: ${context}`;
    }
    prompt += `\n\nRequirements:
- Generate realistic, diverse data that exactly matches the schema
- Use appropriate data types (strings, numbers, booleans, arrays, objects)
- For strings: use realistic values, not placeholders
- For numbers: use reasonable values within expected ranges
- For dates: use ISO format or as specified
- Return ONLY valid JSON that matches the schema structure
- Do not include any explanation or markdown formatting`;
    try {
        // Check if OpenAI API key is available
        if (!AGENT_CONFIG.openai.apiKey) {
            console.warn('⚠️ OpenAI API key not found, using fallback data generation');
            return generateFallbackData(schema);
        }
        // Create token tracker for data generation
        const tokenTracker = new TokenTracker(AGENT_CONFIG.openai.modelName);
        // Estimate prompt tokens
        const estimatedPromptTokens = tokenTracker.estimateTokens(prompt);
        // Create OpenAI client
        const model = new ChatOpenAI({
            openAIApiKey: AGENT_CONFIG.openai.apiKey,
            modelName: AGENT_CONFIG.openai.modelName,
            temperature: 0.3, // Low temperature for consistent data generation
        });
        console.log(`🤖 Generating test data with AI (estimated: ${estimatedPromptTokens} tokens)...`);
        const startTime = Date.now();
        // Generate the data using OpenAI
        const response = await model.invoke(prompt);
        const content = response.content?.toString() || '';
        const duration = Date.now() - startTime;
        // Estimate response tokens
        const estimatedResponseTokens = tokenTracker.estimateTokens(content);
        // Record token usage
        const tokenUsage = tokenTracker.recordUsage(estimatedPromptTokens, estimatedResponseTokens, AGENT_CONFIG.openai.modelName);
        // Extract JSON from response
        let generatedData;
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                generatedData = JSON.parse(jsonMatch[0]);
            }
            catch {
                console.warn('⚠️ Failed to parse AI response as JSON, using fallback');
                return generateFallbackData(schema);
            }
        }
        else {
            console.warn('⚠️ No valid JSON found in AI response, using fallback');
            return generateFallbackData(schema);
        }
        // Log token usage and cost
        console.log(`✅ Data generated: ${tokenUsage.totalTokens} tokens ($${tokenUsage.cost.toFixed(4)}) in ${duration}ms`);
        console.log(`📊 Token breakdown: ${tokenUsage.promptTokens} prompt + ${tokenUsage.responseTokens} response`);
        return generatedData;
    }
    catch (error) {
        console.warn(`⚠️ Data generation failed: ${error.message}, using fallback`);
        return generateFallbackData(schema);
    }
}
/**
 * Generate fallback data when AI generation fails
 * @param schema - The data schema
 * @returns Basic fallback data
 */
function generateFallbackData(schema) {
    // If schema is a string, try to parse it
    if (typeof schema === 'string') {
        try {
            schema = JSON.parse(schema);
        }
        catch {
            // If parsing fails, return generic data
            return {
                id: 1,
                name: 'Test Item',
                description: 'Fallback test data',
                created: new Date().toISOString(),
            };
        }
    }
    // Generate basic data based on schema structure
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
        if (typeof value === 'string') {
            // Handle type hints
            switch (value.toLowerCase()) {
                case 'string':
                    result[key] = `Test ${key}`;
                    break;
                case 'number':
                    result[key] = Math.floor(Math.random() * 100);
                    break;
                case 'boolean':
                    result[key] = Math.random() > 0.5;
                    break;
                case 'date':
                    result[key] = new Date().toISOString();
                    break;
                default:
                    result[key] = value; // Use the value as-is
            }
        }
        else if (Array.isArray(value)) {
            // Handle arrays
            result[key] = ['item1', 'item2', 'item3'];
        }
        else if (typeof value === 'object' && value !== null) {
            // Recursively handle nested objects
            result[key] = generateFallbackData(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Generate multiple data items based on a schema
 * @param schema - The data schema
 * @param count - Number of items to generate
 * @param context - Optional context for generation
 * @returns Array of generated data items
 */
export async function generateDataArray(schema, count, context) {
    const results = [];
    const arrayStartTime = Date.now();
    const arrayContext = context
        ? `${context}. Generate ${count} unique items.`
        : `Generate ${count} unique, diverse items.`;
    console.log(`🤖 Generating ${count} data items with AI...`);
    for (let i = 0; i < count; i++) {
        const itemContext = `${arrayContext} This is item ${i + 1} of ${count}.`;
        const data = await generateData(schema, itemContext);
        results.push(data);
    }
    const totalDuration = Date.now() - arrayStartTime;
    console.log(`✅ Generated ${count} data items in ${totalDuration}ms`);
    return results;
}
//# sourceMappingURL=generate-data.js.map