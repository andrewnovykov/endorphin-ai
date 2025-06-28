/**
 * JSONPlaceholder API Tool
 * This tool demonstrates API testing with a real public service
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

/**
 * Creates a JSONPlaceholder API testing tool
 * @param framework - Framework instance
 * @returns LangChain tool for testing JSONPlaceholder API
 */
export function createJsonPlaceholderApiTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      endpoint: string;
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
    }) => {
      const { endpoint, method = 'GET', data } = params;
      const baseUrl = 'https://jsonplaceholder.typicode.com';
      const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
      
      const stepDesc = `API ${method} request to: ${endpoint}`;
      console.log(`🌐 ${stepDesc}`);
      
      try {
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
          requestOptions.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();
        
        const result = {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        };
        
        framework.logTestStep(
          stepDesc,
          'jsonplaceholder-api',
          params,
          `API response: ${response.status} ${response.statusText}`,
          response.ok
        );
        
        if (response.ok) {
          return `✅ ${method} ${endpoint} succeeded (${response.status}): ${JSON.stringify(responseData, null, 2)}`;
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'jsonplaceholder-api',
          params,
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'jsonplaceholder-api',
      description: 'Make API requests to JSONPlaceholder test service (posts, users, comments, etc.)',
      schema: z.object({
        endpoint: z.string().describe('API endpoint (e.g., /posts/1, /users, /comments)'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method (default: GET)'),
        data: z.any().optional().describe('Request body data for POST/PUT requests'),
      }),
    }
  );
}