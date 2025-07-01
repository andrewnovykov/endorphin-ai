/**
 * Login UI Tool - Example Custom Tool
 * This tool handles login functionality using UI automation
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';

export function createLoginTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      email: string;
      password: string;
      loginUrl?: string;
      emailSelector?: string;
      passwordSelector?: string;
      submitSelector?: string;
    }) => {
      const page = framework.currentPage;
      if (!page) {
        throw new Error('No active page found');
      }

      try {
        // Navigate to login page if URL provided
        if (params.loginUrl) {
          await page.goto(params.loginUrl);
          framework.logTestStep(`Navigated to login page: ${params.loginUrl}`);
        }

        // Fill email field
        const emailSelector = params.emailSelector || 'input[type="email"], input[name*="email"], #email';
        await page.locator(emailSelector).fill(params.email);
        framework.logTestStep(`Filled email: ${params.email}`);

        // Fill password field  
        const passwordSelector = params.passwordSelector || 'input[type="password"], input[name*="password"], #password';
        await page.locator(passwordSelector).fill(params.password);
        framework.logTestStep('Filled password field');

        // Click submit button
        const submitSelector = params.submitSelector || 'button[type="submit"], input[type="submit"], button:has-text("Log"), button:has-text("Sign")';
        await page.locator(submitSelector).click();
        framework.logTestStep('Clicked login button');

        // Wait for navigation or success indicator
        await page.waitForTimeout(2000);

        // Take screenshot after login attempt
        await framework.takeStepScreenshot('After login attempt');

        return `Successfully attempted login with email: ${params.email}`;
      } catch (error: any) {
        framework.logTestStep(`Login failed: ${error.message}`, null, null, null, false);
        throw new Error(`Login failed: ${error.message}`);
      }
    },
    {
      name: 'login',
      description: 'Log into a website using email and password with customizable selectors',
      schema: z.object({
        email: z.string().describe('Email address to log in with'),
        password: z.string().describe('Password to log in with'),
        loginUrl: z.string().optional().describe('URL of the login page (optional)'),
        emailSelector: z.string().optional().describe('CSS selector for email field (optional)'),
        passwordSelector: z.string().optional().describe('CSS selector for password field (optional)'),
        submitSelector: z.string().optional().describe('CSS selector for submit button (optional)'),
      }),
    }
  );
}