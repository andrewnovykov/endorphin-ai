/**
 * Step Parser Utility
 * Parses task descriptions to extract step information dynamically
 */
export interface ParsedStep {
    stepNumber: number;
    description: string;
    fullText: string;
}
export interface StepParseResult {
    totalSteps: number;
    steps: ParsedStep[];
    hasValidSteps: boolean;
}
/**
 * Parse task description to extract numbered steps dynamically
 * @param taskDescription - The full task description containing numbered steps or natural language
 * @returns Parsed step information including total count
 */
export declare function parseSteps(taskDescription: string): StepParseResult;
/**
 * Generate step summary for logging
 * @param parseResult - Result from parseSteps
 * @returns Formatted step summary
 */
export declare function generateStepSummary(parseResult: StepParseResult): string;
/**
 * Check if a step number is the final step
 * @param stepNumber - Current step number
 * @param totalSteps - Total number of steps
 * @returns True if this is the final step
 */
export declare function isFinalStep(stepNumber: number, totalSteps: number): boolean;
/**
 * Generate dynamic completion message based on step count
 * @param totalSteps - Total number of steps in the test
 * @returns Completion message for the final step
 */
export declare function generateCompletionMessage(totalSteps: number): string;
/**
 * Generate step progress message
 * @param currentStep - Current step number
 * @param totalSteps - Total number of steps
 * @param description - Step description
 * @returns Formatted progress message
 */
export declare function generateStepProgress(currentStep: number, totalSteps: number, description: string): string;
//# sourceMappingURL=step-parser.d.ts.map