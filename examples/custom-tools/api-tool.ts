/**
 * Example Custom Tool - API Testing
 * This demonstrates how to create a custom tool for API testing
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

/**
 * Creates an API testing tool
 * @param framework - Framework instance
 * @returns LangChain tool for API testing
 */
export function createApiTestTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      body?: any;
    }) => {
      const { url, method, headers, body } = params;
      
      const stepDesc = `API ${method} request to: ${url}`;
      console.log(`🌐 ${stepDesc}`);
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        
        const data = await response.json();
        
        framework.logTestStep(
          stepDesc,
          'api-test',
          params,
          `API response: ${response.status} ${response.statusText}`,
          response.ok
        );
        
        return `API ${method} ${url} returned ${response.status}: ${JSON.stringify(data, null, 2)}`;
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'api-test',
          params,
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'api-test',
      description: 'Make API requests and validate responses',
      schema: z.object({
        url: z.string().describe('The API endpoint URL'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).describe('HTTP method'),
        headers: z.record(z.string()).optional().describe('Request headers'),
        body: z.any().optional().describe('Request body for POST/PUT'),
      }),
    }
  );
}