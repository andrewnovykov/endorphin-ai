/**
 * Structured Response Types
 * Defines schemas for structured AI agent responses
 */
import { z } from 'zod';
/**
 * Step execution status enum
 */
export declare const StepStatus: z.ZodEnum<["starting", "in_progress", "completed", "failed", "retrying"]>;
export type StepStatusType = z.infer<typeof StepStatus>;
/**
 * Agent action types
 */
export declare const AgentAction: z.ZodEnum<["execute_step", "retry_step", "complete_test", "error"]>;
export type AgentActionType = z.infer<typeof AgentAction>;
/**
 * Step execution response schema
 */
export declare const StepExecutionResponse: z.ZodObject<{
    action: z.ZodEnum<["execute_step", "retry_step", "complete_test", "error"]>;
    stepNumber: z.ZodNumber;
    totalSteps: z.ZodNumber;
    stepDescription: z.ZodString;
    status: z.ZodEnum<["starting", "in_progress", "completed", "failed", "retrying"]>;
    message: z.ZodString;
    attemptNumber: z.ZodOptional<z.ZodNumber>;
    maxAttempts: z.ZodOptional<z.ZodNumber>;
    isComplete: z.ZodBoolean;
    toolCalls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    errorDetails: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    totalSteps: number;
    message: string;
    status: "failed" | "starting" | "in_progress" | "completed" | "retrying";
    action: "execute_step" | "retry_step" | "complete_test" | "error";
    stepNumber: number;
    stepDescription: string;
    isComplete: boolean;
    attemptNumber?: number | undefined;
    maxAttempts?: number | undefined;
    toolCalls?: string[] | undefined;
    errorDetails?: string | undefined;
}, {
    totalSteps: number;
    message: string;
    status: "failed" | "starting" | "in_progress" | "completed" | "retrying";
    action: "execute_step" | "retry_step" | "complete_test" | "error";
    stepNumber: number;
    stepDescription: string;
    isComplete: boolean;
    attemptNumber?: number | undefined;
    maxAttempts?: number | undefined;
    toolCalls?: string[] | undefined;
    errorDetails?: string | undefined;
}>;
export type StepExecutionResponseType = z.infer<typeof StepExecutionResponse>;
/**
 * Test completion response schema
 */
export declare const TestCompletionResponse: z.ZodObject<{
    action: z.ZodLiteral<"complete_test">;
    totalSteps: z.ZodNumber;
    completedSteps: z.ZodNumber;
    status: z.ZodEnum<["success", "failed"]>;
    message: z.ZodLiteral<"test completed successfully">;
    summary: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    totalSteps: number;
    message: "test completed successfully";
    status: "failed" | "success";
    action: "complete_test";
    completedSteps: number;
    summary: string;
    duration?: number | undefined;
    errors?: string[] | undefined;
}, {
    totalSteps: number;
    message: "test completed successfully";
    status: "failed" | "success";
    action: "complete_test";
    completedSteps: number;
    summary: string;
    duration?: number | undefined;
    errors?: string[] | undefined;
}>;
export type TestCompletionResponseType = z.infer<typeof TestCompletionResponse>;
/**
 * Union type for all possible structured responses
 */
export declare const StructuredResponse: z.ZodUnion<[z.ZodObject<{
    action: z.ZodEnum<["execute_step", "retry_step", "complete_test", "error"]>;
    stepNumber: z.ZodNumber;
    totalSteps: z.ZodNumber;
    stepDescription: z.ZodString;
    status: z.ZodEnum<["starting", "in_progress", "completed", "failed", "retrying"]>;
    message: z.ZodString;
    attemptNumber: z.ZodOptional<z.ZodNumber>;
    maxAttempts: z.ZodOptional<z.ZodNumber>;
    isComplete: z.ZodBoolean;
    toolCalls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    errorDetails: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    totalSteps: number;
    message: string;
    status: "failed" | "starting" | "in_progress" | "completed" | "retrying";
    action: "execute_step" | "retry_step" | "complete_test" | "error";
    stepNumber: number;
    stepDescription: string;
    isComplete: boolean;
    attemptNumber?: number | undefined;
    maxAttempts?: number | undefined;
    toolCalls?: string[] | undefined;
    errorDetails?: string | undefined;
}, {
    totalSteps: number;
    message: string;
    status: "failed" | "starting" | "in_progress" | "completed" | "retrying";
    action: "execute_step" | "retry_step" | "complete_test" | "error";
    stepNumber: number;
    stepDescription: string;
    isComplete: boolean;
    attemptNumber?: number | undefined;
    maxAttempts?: number | undefined;
    toolCalls?: string[] | undefined;
    errorDetails?: string | undefined;
}>, z.ZodObject<{
    action: z.ZodLiteral<"complete_test">;
    totalSteps: z.ZodNumber;
    completedSteps: z.ZodNumber;
    status: z.ZodEnum<["success", "failed"]>;
    message: z.ZodLiteral<"test completed successfully">;
    summary: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    totalSteps: number;
    message: "test completed successfully";
    status: "failed" | "success";
    action: "complete_test";
    completedSteps: number;
    summary: string;
    duration?: number | undefined;
    errors?: string[] | undefined;
}, {
    totalSteps: number;
    message: "test completed successfully";
    status: "failed" | "success";
    action: "complete_test";
    completedSteps: number;
    summary: string;
    duration?: number | undefined;
    errors?: string[] | undefined;
}>]>;
export type StructuredResponseType = z.infer<typeof StructuredResponse>;
/**
 * Format instructions for the AI agent
 */
export declare const STRUCTURED_FORMAT_INSTRUCTIONS = "\nYou must respond with a valid JSON object that matches one of these schemas:\n\nFOR STEP EXECUTION:\n{\n  \"action\": \"execute_step\" | \"retry_step\" | \"error\",\n  \"stepNumber\": number,\n  \"totalSteps\": number,\n  \"stepDescription\": \"description of current step\",\n  \"status\": \"starting\" | \"in_progress\" | \"completed\" | \"failed\" | \"retrying\",\n  \"message\": \"human readable message about step progress\",\n  \"attemptNumber\": number (optional, for retries),\n  \"maxAttempts\": number (optional, for retries),\n  \"isComplete\": boolean (true only if this is the final step),\n  \"toolCalls\": [\"tool1\", \"tool2\"] (optional),\n  \"errorDetails\": \"error description\" (optional)\n}\n\nFOR TEST COMPLETION (only after ALL steps are done):\n{\n  \"action\": \"complete_test\",\n  \"totalSteps\": number,\n  \"completedSteps\": number,\n  \"status\": \"success\" | \"failed\", \n  \"message\": \"test completed successfully\",\n  \"summary\": \"brief summary of test execution\",\n  \"duration\": number (optional),\n  \"errors\": [\"error1\", \"error2\"] (optional)\n}\n\nCRITICAL RULES:\n1. Always respond with valid JSON\n2. Use \"complete_test\" action ONLY after completing ALL steps\n3. Set \"isComplete\": true ONLY for the final step\n4. Include step progress in every response\n5. For retries, increment \"attemptNumber\"\n";
/**
 * Validate structured response
 * @param response - Response object to validate
 * @returns Validation result
 */
export declare function validateStructuredResponse(response: unknown): {
    isValid: boolean;
    data?: StructuredResponseType;
    error?: string;
};
/**
 * Create step execution response
 * @param params - Step execution parameters
 * @returns Structured step response
 */
export declare function createStepResponse(params: {
    stepNumber: number;
    totalSteps: number;
    stepDescription: string;
    status: StepStatusType;
    message: string;
    attemptNumber?: number;
    maxAttempts?: number;
    toolCalls?: string[];
    errorDetails?: string;
}): StepExecutionResponseType;
/**
 * Create test completion response
 * @param params - Test completion parameters
 * @returns Structured completion response
 */
export declare function createCompletionResponse(params: {
    totalSteps: number;
    completedSteps: number;
    status: 'success' | 'failed';
    summary: string;
    duration?: number;
    errors?: string[];
}): TestCompletionResponseType;
//# sourceMappingURL=structured-response.d.ts.map