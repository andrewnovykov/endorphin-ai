/**
 * Validation Agent for Test Result Analysis
 *
 * A specialized agent that analyzes test execution conversations
 * to determine if tests passed or failed based on the execution history
 */
import { BaseMessage } from '@langchain/core/messages';
import type { TokenTracker } from '../core/token-tracker.js';
export interface ValidationResult {
    status: 'SUCCESS' | 'FAILED';
    conclusion: string;
    confidence: number;
    reasoning: string;
}
/**
 * Validation Agent - Analyzes test execution to determine pass/fail
 */
export declare class ValidationAgent {
    private model;
    private tokenTracker;
    constructor(tokenTracker?: TokenTracker);
    /**
     * Analyze test execution messages to determine result
     */
    analyzeTestExecution(messages: BaseMessage[], testTask: string): Promise<ValidationResult>;
    /**
     * Format execution history for analysis
     */
    private formatExecutionHistory;
    /**
     * Quick validation based on patterns (faster, less accurate)
     */
    quickValidate(messages: BaseMessage[]): ValidationResult;
}
//# sourceMappingURL=validation-agent.d.ts.map