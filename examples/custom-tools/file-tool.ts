/**
 * Example Custom Tool - File Operations
 * This demonstrates how to create a custom tool for file operations
 */

import { tool } from '@langchain/core/tools';
import type { EnhancedBrowserTestFramework } from 'endorphin-ai';
import { existsSync, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { z } from 'zod';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * Creates a file reading tool
 * @param framework - Framework instance
 * @returns LangChain tool for reading files
 */
export function createReadFileTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: { path: string; encoding?: 'utf8' | 'base64' }) => {
      const { path, encoding = 'utf8' } = params;

      const stepDesc = `Read file: ${path}`;
      console.log(`📄 ${stepDesc}`);

      try {
        if (!existsSync(path)) {
          throw new Error(`File not found: ${path}`);
        }

        const content = await readFileAsync(path, encoding);

        framework.logTestStep(
          stepDesc,
          'read-file',
          params,
          `Successfully read file: ${path}`,
          true
        );

        return `File content:\n${content}`;
      } catch (error: any) {
        framework.logTestStep(stepDesc, 'read-file', params, error.message, false);
        throw error;
      }
    },
    {
      name: 'read-file',
      description: 'Read contents of a file',
      schema: z.object({
        path: z.string().describe('Path to the file to read'),
        encoding: z.enum(['utf8', 'base64']).optional().describe('File encoding'),
      }),
    }
  );
}

/**
 * Creates a file writing tool
 * @param framework - Framework instance
 * @returns LangChain tool for writing files
 */
export function createWriteFileTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: { path: string; content: string; encoding?: 'utf8' | 'base64' }) => {
      const { path, content, encoding = 'utf8' } = params;

      const stepDesc = `Write file: ${path}`;
      console.log(`✍️ ${stepDesc}`);

      try {
        await writeFileAsync(path, content, encoding);

        framework.logTestStep(
          stepDesc,
          'write-file',
          params,
          `Successfully wrote file: ${path}`,
          true
        );

        return `Successfully wrote ${content.length} characters to ${path}`;
      } catch (error: any) {
        framework.logTestStep(stepDesc, 'write-file', params, error.message, false);
        throw error;
      }
    },
    {
      name: 'write-file',
      description: 'Write content to a file',
      schema: z.object({
        path: z.string().describe('Path to the file to write'),
        content: z.string().describe('Content to write to the file'),
        encoding: z.enum(['utf8', 'base64']).optional().describe('File encoding'),
      }),
    }
  );
}
