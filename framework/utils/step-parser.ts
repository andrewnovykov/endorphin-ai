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
 * @param taskDescription - The full task description containing numbered steps
 * @returns Parsed step information including total count
 */
export function parseSteps(taskDescription: string): StepParseResult {
  // Regex to match "STEP X:" patterns (case insensitive)
  const stepPattern = /STEP\s+(\d+)\s*:\s*([^\n\r]+)/gi;
  const matches = Array.from(taskDescription.matchAll(stepPattern));
  
  const steps: ParsedStep[] = [];
  
  matches.forEach(match => {
    const stepNumber = parseInt(match[1], 10);
    const description = match[2].trim();
    const fullText = match[0].trim();
    
    steps.push({
      stepNumber,
      description,
      fullText
    });
  });
  
  // Sort steps by number to ensure correct order
  steps.sort((a, b) => a.stepNumber - b.stepNumber);
  
  const totalSteps = steps.length;
  const hasValidSteps = totalSteps > 0;
  
  // Validate step sequence (should be continuous: 1, 2, 3, etc.)
  const expectedSequence = hasValidSteps && steps.every((step, index) => step.stepNumber === index + 1);
  
  if (hasValidSteps && !expectedSequence) {
    console.warn('⚠️ Step sequence is not continuous:', steps.map(s => s.stepNumber));
  }
  
  return {
    totalSteps,
    steps,
    hasValidSteps: hasValidSteps && expectedSequence
  };
}

/**
 * Generate step summary for logging
 * @param parseResult - Result from parseSteps
 * @returns Formatted step summary
 */
export function generateStepSummary(parseResult: StepParseResult): string {
  if (!parseResult.hasValidSteps) {
    return 'No valid steps found in task description';
  }
  
  const { totalSteps, steps } = parseResult;
  let summary = `Found ${totalSteps} steps:\n`;
  
  steps.forEach(step => {
    summary += `  ${step.stepNumber}. ${step.description}\n`;
  });
  
  return summary.trim();
}

/**
 * Check if a step number is the final step
 * @param stepNumber - Current step number
 * @param totalSteps - Total number of steps
 * @returns True if this is the final step
 */
export function isFinalStep(stepNumber: number, totalSteps: number): boolean {
  return stepNumber === totalSteps;
}

/**
 * Generate dynamic completion message based on step count
 * @param totalSteps - Total number of steps in the test
 * @returns Completion message for the final step
 */
export function generateCompletionMessage(totalSteps: number): string {
  return `After completing the FINAL step (step ${totalSteps}), you MUST say EXACTLY: "test completed successfully"`;
}

/**
 * Generate step progress message
 * @param currentStep - Current step number
 * @param totalSteps - Total number of steps
 * @param description - Step description
 * @returns Formatted progress message
 */
export function generateStepProgress(currentStep: number, totalSteps: number, description: string): string {
  return `Starting STEP ${currentStep} of ${totalSteps}: ${description}`;
}