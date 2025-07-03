/**
 * Content Tools for Browser Automation
 * Provides LangChain tools for page content analysis
 */
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createContentOptimizationTool } from './content-optimization.js';
/**
 * Creates a get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting page content
 */
export function createGetPageContentTool(framework) {
    const optimizationTool = createContentOptimizationTool(framework);
    return tool(async (params) => {
        const includeTitle = params.includeTitle ?? true;
        const stepDesc = 'Get optimized page content for analysis';
        console.log(`📄 ${stepDesc} (with automatic token optimization)`);
        try {
            // Try optimized content first
            const optimizedResult = await optimizationTool.invoke({
                instruction: framework.currentInstruction || '',
            });
            if (optimizedResult && !optimizedResult.error) {
                let content = '';
                if (includeTitle) {
                    const title = await framework.currentPage.title();
                    const url = framework.currentPage.url();
                    content += `Page Title: ${title}\nURL: ${url}\n\n`;
                }
                content += optimizedResult.content;
                framework.logTestStep(stepDesc, 'getPageContent', {
                    includeTitle,
                    optimization: optimizedResult.metadata,
                    tokenSavings: optimizedResult.metadata?.estimatedSavings || 0,
                }, `Retrieved optimized content: ${optimizedResult.metadata?.tokensUsed || 0} tokens (saved ${optimizedResult.metadata?.estimatedSavings || 0})`, true);
                return content;
            }
            // Fallback to original method if optimization fails
            const maxLength = params.maxLength ?? 8000;
            let content = '';
            if (includeTitle) {
                const title = await framework.currentPage.title();
                const url = framework.currentPage.url();
                content += `Page Title: ${title}\nURL: ${url}\n\n`;
            }
            const htmlContent = await framework.currentPage.content();
            const truncatedContent = htmlContent.length > maxLength
                ? `${htmlContent.substring(0, maxLength)}\n... (truncated for brevity)`
                : htmlContent;
            content += truncatedContent;
            framework.logTestStep(stepDesc, 'getPageContent', { includeTitle, maxLength, fallback: true }, `Retrieved ${content.length} characters (fallback mode)`, true);
            return content;
        }
        catch (error) {
            framework.logTestStep(stepDesc, 'getPageContent', { includeTitle, error: error.message }, error.message, false);
            throw error;
        }
    }, {
        name: 'getPageContent',
        description: 'Get intelligently optimized page content for analysis. Automatically reduces tokens by focusing on interactive elements and relevant content.',
        schema: z.object({
            includeTitle: z.boolean().optional(),
            maxLength: z.number().optional(),
        }),
    });
}
/**
 * Creates a simple get page content tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for getting simple page content
 */
export function createGetSimplePageContentTool(framework) {
    return tool(async () => {
        console.log('📄 Getting page content');
        const content = await framework.currentPage.content();
        framework.logTestStep('Get simple page content', 'getSimplePageContent', {}, `Retrieved ${content.length} characters`, true);
        return content;
    }, {
        name: 'getSimplePageContent',
        description: 'Get the current HTML content of the page to analyze its structure.',
        schema: z.object({}),
    });
}
//# sourceMappingURL=content.js.map