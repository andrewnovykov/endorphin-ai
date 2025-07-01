/**
 * AI-powered data generation utility
 * Generates realistic test data based on schemas with token tracking
 */

import type { EnhancedBrowserTestFramework } from '../core/browser-framework';

/**
 * Generate realistic test data using AI based on a schema
 * @param framework - The framework instance with AI access
 * @param schema - The data schema (JSON Schema, TypeScript interface, or description)
 * @param context - Optional context to guide data generation
 * @returns Generated data matching the schema
 */
export async function generateData(
  framework: EnhancedBrowserTestFramework,
  schema: any,
  context?: string
): Promise<any> {
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
    // Access the private AI agent through the framework
    const aiAgent = (framework as any).ai;
    if (!aiAgent) {
      throw new Error('AI agent not available in framework');
    }

    // Log the data generation request
    framework.logTestStep(
      'Generating test data with AI',
      'generate-data',
      { schema: schemaString, hasContext: !!context }
    );

    // Track token usage start
    const tokenTracker = (framework as any).tokenTracker;
    const startTokens = tokenTracker ? tokenTracker.getTotalTokens() : 0;
    const startCost = tokenTracker ? tokenTracker.getTotalCost() : 0;

    // Generate the data
    const response = await aiAgent.generateText(prompt);
    
    // Track token usage end
    const endTokens = tokenTracker ? tokenTracker.getTotalTokens() : 0;
    const endCost = tokenTracker ? tokenTracker.getTotalCost() : 0;
    
    const tokensUsed = endTokens - startTokens;
    const costIncurred = endCost - startCost;
    
    // Log token usage
    if (tokensUsed > 0) {
      console.log(`🪙 Data generation used ${tokensUsed} tokens ($${costIncurred.toFixed(4)})`);
    }

    // Extract JSON from response
    let generatedData: any;
    
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        generatedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
      }
    } else {
      throw new Error('No valid JSON found in AI response');
    }

    // Log successful generation
    framework.logTestStep(
      'Test data generated successfully',
      'generate-data',
      { tokensUsed, cost: costIncurred },
      `Generated data for schema with ${Object.keys(generatedData).length} fields`
    );

    return generatedData;
  } catch (error: any) {
    console.error('❌ Data generation failed:', error.message);
    
    // Log the failure
    framework.logTestStep(
      'Data generation failed',
      'generate-data',
      { error: error.message },
      'Using fallback data',
      false
    );

    // Generate fallback data based on common patterns
    return generateFallbackData(schema);
  }
}

/**
 * Generate fallback data when AI generation fails
 * @param schema - The data schema
 * @returns Basic fallback data
 */
function generateFallbackData(schema: any): any {
  // If schema is a string, try to parse it
  if (typeof schema === 'string') {
    try {
      schema = JSON.parse(schema);
    } catch {
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
  const result: any = {};
  
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
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[key] = ['item1', 'item2', 'item3'];
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle nested objects
      result[key] = generateFallbackData(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Generate multiple data items based on a schema
 * @param framework - The framework instance
 * @param schema - The data schema
 * @param count - Number of items to generate
 * @param context - Optional context for generation
 * @returns Array of generated data items
 */
export async function generateDataArray(
  framework: EnhancedBrowserTestFramework,
  schema: any,
  count: number,
  context?: string
): Promise<any[]> {
  const results: any[] = [];
  
  const arrayContext = context 
    ? `${context}. Generate ${count} unique items.`
    : `Generate ${count} unique, diverse items.`;
  
  for (let i = 0; i < count; i++) {
    const itemContext = `${arrayContext} This is item ${i + 1} of ${count}.`;
    const data = await generateData(framework, schema, itemContext);
    results.push(data);
  }
  
  return results;
}