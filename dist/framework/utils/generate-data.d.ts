/**
 * AI-powered data generation utility
 * Generates realistic test data based on schemas using OpenAI
 */
/**
 * Generate realistic test data using AI based on a schema
 * @param schema - The data schema (JSON Schema, TypeScript interface, or description)
 * @param context - Optional context to guide data generation
 * @returns Generated data matching the schema
 */
export declare function generateData(schema: any, context?: string): Promise<any>;
/**
 * Generate multiple data items based on a schema
 * @param schema - The data schema
 * @param count - Number of items to generate
 * @param context - Optional context for generation
 * @returns Array of generated data items
 */
export declare function generateDataArray(schema: any, count: number, context?: string): Promise<any[]>;
//# sourceMappingURL=generate-data.d.ts.map