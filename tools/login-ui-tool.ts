/**
 * Login UI Tool
 * This tool demonstrates UI automation for login functionality
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

/**
 * Creates a Login UI automation tool
 * @param framework - Framework instance with browser access
 * @returns LangChain tool for login automation
 */
export function createLoginTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      email: string;
      password: string;
      loginLinkSelector?: string;
      emailSelector?: string;
      passwordSelector?: string;
      submitSelector?: string;
    }) => {
      const { 
        email, 
        password,
        loginLinkSelector = 'a.nav-link[href="#/login"]',
        emailSelector = 'input.form-control.form-control-lg[name="email"]',
        passwordSelector = 'input.form-control.form-control-lg[name="password"]',
        submitSelector = 'button.btn.btn-lg.btn-primary.pull-xs-right[data-cy="signin"]'
      } = params;
      
      if (!framework.currentPage) {
        throw new Error('No browser page available. Make sure a browser session is active.');
      }
      
      const page = framework.currentPage;
      
      try {
        framework.logTestStep('Starting login process', 'login-ui-tool');
        
        // Click login link
        await page.click(loginLinkSelector);
        await page.waitForTimeout(2000);
        
        framework.logTestStep('Filling login form', 'login-ui-tool');
        
        // Fill email field
        await page.locator(emailSelector).fill(email);
        
        // Fill password field  
        await page.locator(passwordSelector).fill(password);
        
        // Click sign in button
        await page.click(submitSelector);
        await page.waitForTimeout(3000);
        
        framework.logTestStep('Login completed successfully', 'login-ui-tool');
        return `✅ Login completed successfully for user: ${email}`;
        
      } catch (error: any) {
        framework.logTestStep(
          'Login failed',
          'login-ui-tool',
          params,
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'login-ui-tool',
      description: 'UI automation tool for login functionality with customizable selectors',
      schema: z.object({
        email: z.string().describe('Email address for login'),
        password: z.string().describe('Password for login'),
        loginLinkSelector: z.string().optional().describe('CSS selector for login link'),
        emailSelector: z.string().optional().describe('CSS selector for email input'),
        passwordSelector: z.string().optional().describe('CSS selector for password input'),
        submitSelector: z.string().optional().describe('CSS selector for submit button'),
      }),
    }
  );
}