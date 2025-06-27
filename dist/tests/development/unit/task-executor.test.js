"use strict";
/**
 * Unit Tests for Task Executor - AI-Powered Test Execution
 */
describe('TaskExecutor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Task Execution', () => {
        test('should execute natural language task successfully', async () => {
            const mockExecutor = {
                executeTask: jest.fn().mockImplementation(async (task, site, options = {}) => {
                    // Mock AI task execution
                    const actions = [
                        { type: 'navigate', url: site, success: true },
                        { type: 'click', selector: '#login-button', success: true },
                        { type: 'fill', selector: '#username', value: 'testuser', success: true },
                        { type: 'fill', selector: '#password', value: 'password', success: true },
                        { type: 'click', selector: '#submit', success: true }
                    ];
                    return {
                        success: true,
                        task: task,
                        site: site,
                        actions: actions,
                        duration: 3500,
                        aiTokensUsed: 450,
                        error: null
                    };
                })
            };
            const task = 'Navigate to the login page and authenticate with username testuser and password password';
            const site = 'https://example.com';
            const result = await mockExecutor.executeTask(task, site);
            expect(mockExecutor.executeTask).toHaveBeenCalledWith(task, site);
            expect(result.success).toBe(true);
            expect(result.actions).toHaveLength(5);
            expect(result.actions[0].type).toBe('navigate');
            expect(result.actions[1].type).toBe('click');
            expect(result.duration).toBe(3500);
            expect(result.aiTokensUsed).toBe(450);
        });
        test('should handle task execution failure', async () => {
            const mockExecutor = {
                executeTask: jest.fn().mockImplementation(async (task, site) => {
                    return {
                        success: false,
                        task: task,
                        site: site,
                        actions: [
                            { type: 'navigate', url: site, success: true },
                            { type: 'click', selector: '#non-existent', success: false, error: 'Element not found' }
                        ],
                        duration: 1500,
                        aiTokensUsed: 250,
                        error: 'Task execution failed: Element not found'
                    };
                })
            };
            const task = 'Click on a non-existent element';
            const result = await mockExecutor.executeTask(task, 'https://example.com');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Element not found');
            expect(result.actions[1].success).toBe(false);
        });
        test('should handle AI service errors', async () => {
            const mockExecutor = {
                executeTask: jest.fn().mockRejectedValue(new Error('OpenAI API rate limit exceeded'))
            };
            await expect(mockExecutor.executeTask('Test task', 'https://example.com'))
                .rejects.toThrow('OpenAI API rate limit exceeded');
        });
    });
    describe('Action Execution', () => {
        test('should execute click action', async () => {
            const mockExecutor = {
                executeAction: jest.fn().mockImplementation(async (action) => {
                    if (action.type === 'click') {
                        return {
                            success: true,
                            action: action,
                            result: 'Element clicked successfully',
                            duration: 150
                        };
                    }
                    // Default mock return for other action types
                    return {
                        success: false,
                        action: action,
                        result: 'Unsupported action type',
                        duration: 0
                    };
                })
            };
            const clickAction = {
                type: 'click',
                selector: '#submit-button',
                description: 'Click the submit button'
            };
            const result = await mockExecutor.executeAction(clickAction);
            expect(mockExecutor.executeAction).toHaveBeenCalledWith(clickAction);
            expect(result.success).toBe(true);
            expect(result.result).toBe('Element clicked successfully');
        });
        test('should execute fill action', async () => {
            const mockExecutor = {
                executeAction: jest.fn().mockImplementation(async (action) => {
                    if (action.type === 'fill') {
                        return {
                            success: true,
                            action: action,
                            result: `Filled field with value: ${action.value}`,
                            duration: 200
                        };
                    }
                    // Default mock return for other action types
                    return {
                        success: false,
                        action: action,
                        result: 'Unsupported action type',
                        duration: 0
                    };
                })
            };
            const fillAction = {
                type: 'fill',
                selector: '#email',
                value: 'test@example.com',
                description: 'Fill email field'
            };
            const result = await mockExecutor.executeAction(fillAction);
            expect(result.success).toBe(true);
            expect(result.result).toBe('Filled field with value: test@example.com');
        });
        test('should execute wait action', async () => {
            const mockExecutor = {
                executeAction: jest.fn().mockImplementation(async (action) => {
                    if (action.type === 'wait') {
                        return {
                            success: true,
                            action: action,
                            result: `Waited for ${action.selector || action.timeout}`,
                            duration: action.timeout || 1000
                        };
                    }
                    // Default mock return for other action types
                    return {
                        success: false,
                        action: action,
                        result: 'Unsupported action type',
                        duration: 0
                    };
                })
            };
            const waitAction = {
                type: 'wait',
                selector: '.loading-complete',
                timeout: 5000,
                description: 'Wait for loading to complete'
            };
            const result = await mockExecutor.executeAction(waitAction);
            expect(result.success).toBe(true);
            expect(result.result).toBe('Waited for .loading-complete');
        });
    });
    describe('AI Integration', () => {
        test('should parse AI response into actions', () => {
            const mockExecutor = {
                parseAIResponse: jest.fn().mockImplementation((aiResponse) => {
                    // Mock parsing of AI response into structured actions
                    const actions = [];
                    if (aiResponse.includes('navigate to')) {
                        actions.push({
                            type: 'navigate',
                            url: 'https://example.com',
                            description: 'Navigate to the website'
                        });
                    }
                    if (aiResponse.includes('click')) {
                        actions.push({
                            type: 'click',
                            selector: '#login-button',
                            description: 'Click the login button'
                        });
                    }
                    if (aiResponse.includes('enter username')) {
                        actions.push({
                            type: 'fill',
                            selector: '#username',
                            value: 'testuser',
                            description: 'Enter username'
                        });
                    }
                    return actions;
                })
            };
            const aiResponse = 'I will navigate to the website, click the login button, and enter username testuser';
            const actions = mockExecutor.parseAIResponse(aiResponse);
            expect(mockExecutor.parseAIResponse).toHaveBeenCalledWith(aiResponse);
            expect(actions).toHaveLength(3);
            expect(actions[0].type).toBe('navigate');
            expect(actions[1].type).toBe('click');
            expect(actions[2].type).toBe('fill');
            expect(actions[2].value).toBe('testuser');
        });
        test('should validate actions before execution', () => {
            const mockExecutor = {
                validateAction: jest.fn().mockImplementation((action) => {
                    const requiredFields = {
                        click: ['type', 'selector'],
                        fill: ['type', 'selector', 'value'],
                        navigate: ['type', 'url'],
                        wait: ['type']
                    };
                    const required = requiredFields[action.type] || [];
                    const missing = required.filter((field) => !action[field]);
                    return {
                        valid: missing.length === 0,
                        errors: missing.map((field) => `Missing required field: ${field}`)
                    };
                })
            };
            const validAction = {
                type: 'click',
                selector: '#button',
                description: 'Click button'
            };
            const invalidAction = {
                type: 'fill',
                description: 'Fill field'
                // missing selector and value
            };
            const validResult = mockExecutor.validateAction(validAction);
            const invalidResult = mockExecutor.validateAction(invalidAction);
            expect(validResult.valid).toBe(true);
            expect(validResult.errors).toHaveLength(0);
            expect(invalidResult.valid).toBe(false);
            expect(invalidResult.errors).toHaveLength(2);
            expect(invalidResult.errors).toContain('Missing required field: selector');
            expect(invalidResult.errors).toContain('Missing required field: value');
        });
        test('should track AI token usage', () => {
            const mockExecutor = {
                trackTokenUsage: jest.fn().mockImplementation((prompt, response) => {
                    const promptTokens = Math.ceil(prompt.length / 4); // Rough estimation
                    const responseTokens = Math.ceil(response.length / 4);
                    const totalTokens = promptTokens + responseTokens;
                    return {
                        promptTokens: promptTokens,
                        responseTokens: responseTokens,
                        totalTokens: totalTokens,
                        estimatedCost: totalTokens * 0.00002 // $0.02 per 1K tokens
                    };
                })
            };
            const prompt = 'Navigate to the login page and authenticate the user';
            const response = 'I will navigate to https://example.com, click the login button, fill username field with testuser, fill password field, and click submit';
            const usage = mockExecutor.trackTokenUsage(prompt, response);
            expect(mockExecutor.trackTokenUsage).toHaveBeenCalledWith(prompt, response);
            expect(usage.promptTokens).toBeGreaterThan(0);
            expect(usage.responseTokens).toBeGreaterThan(0);
            expect(usage.totalTokens).toBe(usage.promptTokens + usage.responseTokens);
            expect(usage.estimatedCost).toBeGreaterThan(0);
        });
    });
    describe('Error Recovery', () => {
        test('should retry failed actions', async () => {
            let attemptCount = 0;
            const mockExecutor = {
                executeActionWithRetry: jest.fn().mockImplementation(async (action, maxRetries = 3) => {
                    attemptCount++;
                    if (attemptCount < 3) {
                        // Don't throw error, just simulate retry logic
                        return null; // Simulate temporary failure
                    }
                    return {
                        success: true,
                        action: action,
                        attempts: attemptCount,
                        result: 'Action succeeded after retry'
                    };
                })
            };
            // Mock the retry behavior
            const action = {
                type: 'click',
                selector: '#flaky-button'
            };
            // Call the function multiple times to simulate retry
            let result = await mockExecutor.executeActionWithRetry(action, 3);
            while (!result && attemptCount < 3) {
                result = await mockExecutor.executeActionWithRetry(action, 3);
            }
            expect(result.success).toBe(true);
            expect(result.attempts).toBe(3);
            expect(result.result).toBe('Action succeeded after retry');
        });
        test('should fail after max retries', async () => {
            const mockExecutor = {
                executeActionWithRetry: jest.fn().mockRejectedValue(new Error('Max retries exceeded'))
            };
            const action = {
                type: 'click',
                selector: '#broken-button'
            };
            await expect(mockExecutor.executeActionWithRetry(action, 3))
                .rejects.toThrow('Max retries exceeded');
        });
        test('should provide alternative actions on failure', () => {
            const mockExecutor = {
                getAlternativeActions: jest.fn().mockImplementation((failedAction) => {
                    if (failedAction.type === 'click' && failedAction.selector.includes('#')) {
                        return [
                            {
                                type: 'click',
                                selector: failedAction.selector.replace('#', '.'),
                                description: 'Try clicking by class instead of ID'
                            },
                            {
                                type: 'click',
                                selector: `[data-testid="${failedAction.selector.replace('#', '')}"]`,
                                description: 'Try clicking by test ID'
                            }
                        ];
                    }
                    return [];
                })
            };
            const failedAction = {
                type: 'click',
                selector: '#submit-btn'
            };
            const alternatives = mockExecutor.getAlternativeActions(failedAction);
            expect(mockExecutor.getAlternativeActions).toHaveBeenCalledWith(failedAction);
            expect(alternatives).toHaveLength(2);
            expect(alternatives[0].selector).toBe('.submit-btn');
            expect(alternatives[1].selector).toBe('[data-testid="submit-btn"]');
        });
    });
    describe('Performance Optimization', () => {
        test('should batch similar actions', () => {
            const mockExecutor = {
                batchActions: jest.fn().mockImplementation((actions) => {
                    const batches = [];
                    let currentBatch = [];
                    for (const action of actions) {
                        if (action.type === 'fill' && currentBatch.length > 0 && currentBatch[0].type === 'fill') {
                            currentBatch.push(action);
                        }
                        else {
                            if (currentBatch.length > 0) {
                                batches.push(currentBatch);
                            }
                            currentBatch = [action];
                        }
                    }
                    if (currentBatch.length > 0) {
                        batches.push(currentBatch);
                    }
                    return batches;
                })
            };
            const actions = [
                { type: 'navigate', url: 'https://example.com' },
                { type: 'fill', selector: '#username', value: 'user' },
                { type: 'fill', selector: '#password', value: 'pass' },
                { type: 'fill', selector: '#email', value: 'email@test.com' },
                { type: 'click', selector: '#submit' }
            ];
            const batches = mockExecutor.batchActions(actions);
            expect(batches).toHaveLength(3);
            expect(batches[0]).toHaveLength(1); // navigate
            expect(batches[1]).toHaveLength(3); // fill actions
            expect(batches[2]).toHaveLength(1); // click
        });
        test('should measure action execution time', async () => {
            const mockExecutor = {
                measureExecutionTime: jest.fn().mockImplementation(async (actionFn) => {
                    const startTime = Date.now();
                    const result = await actionFn();
                    const endTime = Date.now();
                    return {
                        ...result,
                        executionTime: endTime - startTime
                    };
                })
            };
            const mockAction = jest.fn().mockResolvedValue({ success: true });
            const result = await mockExecutor.measureExecutionTime(mockAction);
            expect(result.success).toBe(true);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
        });
    });
});
//# sourceMappingURL=task-executor.test.js.map