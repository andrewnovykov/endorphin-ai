/**
 * Validation Agent for Test Result Analysis
 * 
 * A specialized agent that analyzes test execution conversations
 * to determine if tests passed or failed based on the execution history
 */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { AGENT_CONFIG } from './config/agent-config.js';
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
export class ValidationAgent {
  private model: ChatOpenAI;
  private tokenTracker: TokenTracker | undefined;

  constructor(tokenTracker?: TokenTracker) {
    this.tokenTracker = tokenTracker;
    if (!AGENT_CONFIG.openai.apiKey) {
      throw new Error('OpenAI API key is required for validation agent');
    }
    
    this.model = new ChatOpenAI({
      openAIApiKey: AGENT_CONFIG.openai.apiKey,
      modelName: 'gpt-4o',
      temperature: 0.1, // Low temperature for consistent analysis
    });
  }

  /**
   * Analyze test execution messages to determine result
   */
  async analyzeTestExecution(
    messages: BaseMessage[],
    testTask: string
  ): Promise<ValidationResult> {
    const systemPrompt = `You are a test result validator. Your job is to analyze a test execution conversation and determine if the test passed or failed.

Test Task: ${testTask}

Rules:
1. A test PASSES if ALL required steps were completed successfully, regardless of the verification method used
2. Accept multiple forms of verification:
   - Direct tool results: "Element X is visible on the page"
   - Content analysis: "The username 'Andrew' is visible on the page as an image with alt text"
   - Page content inspection: Agent confirms element presence through getElementInfo, getPageContent, etc.
3. A test FAILS only if:
   - Required steps could not be completed
   - Agent explicitly states verification failed
   - Agent gets stuck in infinite loops
   - Critical errors prevent completion
4. Do NOT fail tests when:
   - Agent uses alternative verification methods that achieve the same goal
   - Tool timeouts occur but agent finds the element through other means
   - Agent adapts and succeeds using different approaches
5. Focus on the OUTCOME, not the specific method used

Provide a JSON response with:
{
  "status": "SUCCESS" or "FAILED",
  "conclusion": "A clear, concise summary of what happened",
  "confidence": 0.0 to 1.0,
  "reasoning": "Your analysis of why the test passed or failed"
}`;

    // Extract relevant execution history
    const executionHistory = this.formatExecutionHistory(messages);

    const prompt = `Analyze this test execution and determine if it passed or failed:

${executionHistory}

Remember: The test task was: ${testTask}

Provide your analysis in the specified JSON format.`;

    try {
      // Track token usage if tracker is available
      const systemMessage = new SystemMessage(systemPrompt);
      const humanMessage = new HumanMessage(prompt);
      
      // Estimate token usage before making the call
      if (this.tokenTracker) {
        const promptTokens = this.tokenTracker.estimateTokens(systemPrompt + prompt);
        console.log(`🧠 Validation Agent: Estimated ${promptTokens} input tokens`);
      }
      
      const response = await this.model.invoke([
        systemMessage,
        humanMessage,
      ]);

      const content = response.content as string;
      
      // Record actual token usage if available in response metadata
      if (this.tokenTracker && response.usage_metadata) {
        const usage = response.usage_metadata;
        const tokenUsage = this.tokenTracker.recordUsage(
          usage.input_tokens || 0,
          usage.output_tokens || 0,
          'gpt-4o'
        );
        console.log(`💰 Validation Agent used ${tokenUsage.totalTokens} tokens ($${tokenUsage.cost.toFixed(4)})`);
      } else if (this.tokenTracker) {
        // Fallback: estimate tokens if usage metadata not available
        const promptTokens = this.tokenTracker.estimateTokens(systemPrompt + prompt);
        const responseTokens = this.tokenTracker.estimateTokens(content);
        const tokenUsage = this.tokenTracker.recordUsage(promptTokens, responseTokens, 'gpt-4o');
        console.log(`💰 Validation Agent used ~${tokenUsage.totalTokens} tokens ($${tokenUsage.cost.toFixed(4)}) [estimated]`);
      }
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]) as ValidationResult;
        console.log(`🔍 Validation Agent Analysis:`, result);
        return result;
      }

      // Fallback if JSON parsing fails
      return {
        status: 'FAILED',
        conclusion: 'Unable to parse validation result',
        confidence: 0,
        reasoning: 'JSON parsing failed',
      };
    } catch (error) {
      console.error('Validation agent error:', error);
      return {
        status: 'FAILED',
        conclusion: 'Validation agent encountered an error',
        confidence: 0,
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Format execution history for analysis
   */
  private formatExecutionHistory(messages: BaseMessage[]): string {
    return messages
      .slice(-20) // Last 20 messages for context
      .map((msg, idx) => {
        const role = msg._getType() === 'human' ? 'USER' : 'AGENT';
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        
        // Include tool calls if present
        const toolCalls = (msg as any).tool_calls;
        if (toolCalls?.length) {
          const tools = toolCalls
            .map((tc: any) => `[TOOL: ${tc.name}(${JSON.stringify(tc.args)})]`)
            .join(', ');
          return `${idx + 1}. ${role}: ${content}\n   ${tools}`;
        }
        
        return `${idx + 1}. ${role}: ${content}`;
      })
      .join('\n\n');
  }

  /**
   * Quick validation based on patterns (faster, less accurate)
   */
  quickValidate(messages: BaseMessage[]): ValidationResult {
    const lastMessages = messages.slice(-5);
    const content = lastMessages
      .map(m => (typeof m.content === 'string' ? m.content : ''))
      .join(' ')
      .toLowerCase();

    // Check for success patterns
    const successPatterns = [
      'all steps completed successfully',
      'test passed',
      'verification successful',
      'login was successful',
      'element.*is visible',
      'username.*is visible',
      'therefore.*login was successful',
      'successfully.*verified',
      'found.*username',
      'andrew.*is visible',
      'maximus.*is visible',
    ];

    const failurePatterns = [
      'test failed',
      'verification failed',
      'element not found',
      'timeout exceeded',
      'unable to complete',
      'error occurred',
    ];

    const hasSuccess = successPatterns.some(p => new RegExp(p).test(content));
    const hasFailure = failurePatterns.some(p => new RegExp(p).test(content));

    if (hasSuccess && !hasFailure) {
      return {
        status: 'SUCCESS',
        conclusion: 'Test completed successfully based on pattern matching',
        confidence: 0.7,
        reasoning: 'Success patterns detected without failure indicators',
      };
    }

    return {
      status: 'FAILED',
      conclusion: 'Test failed or outcome unclear',
      confidence: 0.6,
      reasoning: hasFailure ? 'Failure patterns detected' : 'No clear success indicators found',
    };
  }
}