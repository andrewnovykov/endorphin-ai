/**
 * CLI commands for custom tool management
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../core/config-loader.js';
import { CustomToolDiscovery } from '../core/custom-tool-discovery.js';
import { CustomToolErrorHandler } from '../core/custom-tool-errors.js';
import { createContentOptimizationTool } from '../automation/tools/content-optimization.js';
import { createGetPageContentTool, createGetSimplePageContentTool } from '../automation/tools/content.js';
import { createDifferentialContentTool } from '../automation/tools/differential-content.js';
import { createClearFieldTool, createClickTool, createFillTool } from '../automation/tools/interaction.js';
import { createNavigationTool } from '../automation/tools/navigation.js';
import { createScreenshotTool, createWaitTool } from '../automation/tools/utilities.js';
import { createGetElementInfoTool, createVerifyElementTool } from '../automation/tools/verification.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Get metadata for all built-in tools by creating mock instances
 * This ensures we always have accurate, up-to-date tool information
 */
function getBuiltInToolsMetadata() {
    // Create a minimal mock framework for tool metadata extraction
    const mockFramework = {
        frameworkConfig: {},
        currentPage: null,
        logTestStep: () => { },
        takeStepScreenshot: () => Promise.resolve(null),
    };
    try {
        // Create all built-in tools and extract their metadata
        const toolCreators = [
            createNavigationTool,
            createDifferentialContentTool,
            createGetPageContentTool,
            createGetSimplePageContentTool,
            createContentOptimizationTool,
            createClickTool,
            createFillTool,
            createClearFieldTool,
            createVerifyElementTool,
            createGetElementInfoTool,
            createWaitTool,
            createScreenshotTool,
        ];
        return toolCreators
            .map((creator) => {
            try {
                const tool = creator(mockFramework);
                return {
                    name: tool.name,
                    description: tool.description,
                };
            }
            catch {
                // Fallback for any tools that can't be created without full framework
                return {
                    name: 'unknown',
                    description: 'Tool metadata unavailable',
                };
            }
        })
            .filter((tool) => tool.name !== 'unknown');
    }
    catch {
        // Fallback to minimal hardcoded list if dynamic extraction fails
        return [
            { name: 'navigate', description: 'Navigate to a URL' },
            { name: 'click', description: 'Click on an element' },
            { name: 'fill', description: 'Fill in a form field' },
            { name: 'clearField', description: 'Clear a form field' },
            { name: 'getPageContent', description: 'Get page content with optimization' },
            { name: 'getSimplePageContent', description: 'Get simple page content' },
            { name: 'differential_page_content', description: 'Get page changes since last snapshot' },
            { name: 'getOptimizedContent', description: 'Optimize content for AI processing' },
            { name: 'verifyElement', description: 'Verify element exists and matches criteria' },
            { name: 'getElementInfo', description: 'Get information about an element' },
            { name: 'wait', description: 'Wait for a specified duration' },
            { name: 'screenshot', description: 'Take a screenshot' },
        ];
    }
}
const TOOL_TEMPLATES = [
    {
        name: 'basic',
        path: 'framework/templates/tools/basic-tool.template.txt',
        description: 'Basic tool template with UI automation structure',
    },
    {
        name: 'ui',
        path: 'framework/templates/tools/ui-tool.template.txt',
        description: 'Advanced UI automation tool template with comprehensive examples',
    },
];
/**
 * Handle create tool command
 */
export function handleCreateToolCommand(toolName, options) {
    console.log(`🛠️ Creating new custom tool: ${toolName}`);
    // Validate tool name
    if (!toolName || !/^[a-zA-Z][a-zA-Z0-9-]*$/.test(toolName)) {
        console.error('❌ Invalid tool name. Use alphanumeric characters and hyphens only.');
        process.exit(1);
    }
    // Select template
    const templateName = options.template || 'basic';
    const template = TOOL_TEMPLATES.find((t) => t.name === templateName);
    if (!template) {
        console.error(`❌ Unknown template: ${templateName}`);
        console.log('Available templates:', TOOL_TEMPLATES.map((t) => t.name).join(', '));
        process.exit(1);
    }
    // Determine output path
    const outputDir = options.path || './custom-tools';
    const outputFile = join(outputDir, `${toolName}.ts`);
    // Create directory if needed
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    }
    // Check if file already exists
    if (existsSync(outputFile)) {
        console.error(`❌ Tool already exists: ${outputFile}`);
        process.exit(1);
    }
    // Read template - try multiple paths for different environments
    let templateContent;
    const possiblePaths = [
        join(process.cwd(), 'node_modules/endorphin-ai/dist', template.path), // npm installed
        join(process.cwd(), '..', 'dist', template.path), // relative from test dir
        join(__dirname, '..', '..', template.path), // from framework/cli directory
        join(process.cwd(), 'dist', template.path), // from project root
    ];
    let templatePath = null;
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            templatePath = path;
            break;
        }
    }
    if (!templatePath) {
        console.error(`❌ Template not found. Tried paths:`);
        possiblePaths.forEach((path) => console.error(`   - ${path}`));
        process.exit(1);
    }
    try {
        templateContent = readFileSync(templatePath, 'utf8');
    }
    catch (error) {
        console.error(`❌ Failed to read template: ${error}`);
        process.exit(1);
    }
    // Transform tool name to various cases
    const toolNameKebab = toolName
        .toLowerCase()
        .replace(/([A-Z])/g, '-$1')
        .replace(/^-/, '');
    const toolNamePascal = toolName.charAt(0).toUpperCase() +
        toolName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    // Replace template variables
    const toolContent = templateContent
        .replace(/\{\{TOOL_NAME\}\}/g, toolName)
        .replace(/\{\{TOOL_NAME_KEBAB\}\}/g, toolNameKebab)
        .replace(/\{\{TOOL_NAME_PASCAL\}\}/g, toolNamePascal)
        .replace(/\{\{TOOL_DESCRIPTION\}\}/g, `${toolNamePascal} Tool`)
        .replace(/\{\{TOOL_PURPOSE\}\}/g, toolName.replace(/-/g, ' '))
        .replace(/\{\{TOOL_ACTION_DESCRIPTION\}\}/g, `Perform ${toolName.replace(/-/g, ' ')}`)
        .replace(/\{\{TOOL_SHORT_DESCRIPTION\}\}/g, `Performs ${toolName.replace(/-/g, ' ')} operations`)
        .replace(/\{\{TOOL_EMOJI\}\}/g, '🔧');
    // Write tool file
    try {
        writeFileSync(outputFile, toolContent);
        console.log(`✅ Created tool: ${outputFile}`);
        console.log(`\n📝 Next steps:`);
        console.log(`1. Edit ${outputFile} to implement your tool logic`);
        console.log(`2. Add '${outputDir}' to customTools in your endorphin.config.ts`);
        console.log(`3. Run 'endorphin validate tools' to check your tool`);
    }
    catch (error) {
        console.error(`❌ Failed to write tool file: ${error}`);
        process.exit(1);
    }
}
/**
 * Handle validate tools command with comprehensive error reporting
 */
export async function handleValidateToolsCommand() {
    console.log('🔍 Validating custom tools...\n');
    try {
        // Load configuration
        const config = await getConfig({ validateAI: false });
        if (!config.customTools || config.customTools.length === 0) {
            console.log('ℹ️ No custom tools configured in endorphin.config.ts');
            console.log('💡 Add customTools: ["./tools"] to your config to get started');
            return;
        }
        // Create mock framework for validation
        const mockFramework = {
            config,
            logTestStep: () => { },
            takeStepScreenshot: () => Promise.resolve(null),
            currentPage: null,
        };
        // Use tool discovery to validate
        const discovery = new CustomToolDiscovery(config, mockFramework);
        const tools = await discovery.discoverAndLoadTools();
        const result = discovery.getLoadResult();
        const { statistics, errors } = result;
        console.log(`\n📊 Validation Summary:`);
        console.log(`   Configured paths: ${statistics.totalPaths}`);
        console.log(`   Files scanned: ${statistics.scannedFiles}`);
        console.log(`   Tools loaded: ${statistics.loadedTools}`);
        console.log(`   Failed loads: ${statistics.failedLoads}`);
        console.log(`   Validation errors: ${statistics.validationErrors}`);
        console.log(`   Name conflicts: ${statistics.conflicts}`);
        console.log(`   Total errors: ${statistics.totalErrors}`);
        // Display successful tools
        if (statistics.loadedTools > 0) {
            console.log(`\n✅ Successfully loaded tools:`);
            for (const tool of tools) {
                console.log(`   - ${tool.name}: ${tool.description}`);
            }
        }
        // Display errors in detail
        if (errors.length > 0) {
            console.log(`\n❌ Validation Errors:`);
            const errorsByType = errors.reduce((acc, error) => {
                if (!acc[error.code])
                    acc[error.code] = [];
                acc[error.code].push(error);
                return acc;
            }, {});
            for (const [errorCode, errorList] of Object.entries(errorsByType)) {
                console.log(`\n   ${errorCode} (${errorList.length} errors):`);
                for (const error of errorList) {
                    console.log(`     - ${error.message}`);
                    if (error.context?.filePath) {
                        console.log(`       File: ${error.context.filePath}`);
                    }
                    if (error.context?.functionName) {
                        console.log(`       Function: ${error.context.functionName}`);
                    }
                }
            }
            console.log(`\n💡 Fix these errors and run validation again.`);
            process.exit(1);
        }
        else if (statistics.loadedTools > 0) {
            console.log(`\n✅ All ${statistics.loadedTools} custom tools validated successfully!`);
        }
        else {
            console.log(`\n⚠️ No valid custom tools found`);
            console.log('💡 Make sure your tool files export functions with names like "createMyTool"');
            process.exit(1);
        }
    }
    catch (error) {
        const toolError = CustomToolErrorHandler.handleError(error, {
            phase: 'validation-command',
        });
        console.error(`❌ Validation failed: ${toolError.message}`);
        if (toolError.context) {
            console.error('Context:', JSON.stringify(toolError.context, null, 2));
        }
        process.exit(1);
    }
}
/**
 * Handle list tools command with error handling
 */
export async function handleListToolsCommand(options) {
    console.log('📋 Available Tools\n');
    try {
        // Load configuration
        const config = await getConfig({ validateAI: false });
        // List built-in tools
        console.log('🔧 Built-in Tools:');
        const builtInTools = getBuiltInToolsMetadata();
        for (const tool of builtInTools) {
            console.log(`   - ${tool.name}: ${tool.description}`);
        }
        // List custom tools if configured
        if (config.customTools && config.customTools.length > 0) {
            console.log('\n🔧 Custom Tools:');
            // Create mock framework
            const mockFramework = {
                config,
                logTestStep: () => { },
                takeStepScreenshot: () => Promise.resolve(null),
                currentPage: null,
            };
            const discovery = new CustomToolDiscovery(config, mockFramework);
            const customTools = await discovery.discoverAndLoadTools();
            const result = discovery.getLoadResult();
            if (customTools.length > 0) {
                for (const tool of customTools) {
                    console.log(`   - ${tool.name}: ${tool.description}`);
                    if (options.verbose && tool.schema) {
                        console.log(`     Schema: ${JSON.stringify(tool.schema, null, 2)}`);
                    }
                }
                if (options.verbose) {
                    console.log(`\n📊 Custom Tools Statistics:`);
                    console.log(`   Total paths: ${result.statistics.totalPaths}`);
                    console.log(`   Files scanned: ${result.statistics.scannedFiles}`);
                    console.log(`   Tools loaded: ${result.statistics.loadedTools}`);
                    if (result.statistics.totalErrors > 0) {
                        console.log(`   Errors: ${result.statistics.totalErrors}`);
                    }
                }
            }
            else {
                console.log('   (No valid custom tools found)');
                if (result.errors.length > 0 && options.verbose) {
                    console.log(`\n   ⚠️ Errors encountered:`);
                    for (const error of result.errors.slice(0, 3)) {
                        // Show first 3 errors
                        console.log(`     - ${error.message}`);
                    }
                    if (result.errors.length > 3) {
                        console.log(`     ... and ${result.errors.length - 3} more errors`);
                    }
                    console.log(`     Run 'endorphin validate tools' for full error details`);
                }
            }
            if (options.verbose) {
                console.log('\n📁 Custom tool paths:');
                for (const path of config.customTools) {
                    console.log(`   - ${path}`);
                }
            }
        }
        else {
            console.log('\n🔧 Custom Tools: (none configured)');
            console.log('💡 Add customTools: ["./tools"] to your endorphin.config.ts');
        }
        console.log('\n💡 Commands:');
        console.log('   - endorphin create tool <name>  Create a new custom tool');
        console.log('   - endorphin validate tools      Validate all custom tools');
        console.log('   - endorphin list tools --verbose Show detailed information');
    }
    catch (error) {
        const toolError = CustomToolErrorHandler.handleError(error, {
            phase: 'list-command',
        });
        console.error(`❌ Failed to list tools: ${toolError.message}`);
        if (toolError.context && options.verbose) {
            console.error('Context:', JSON.stringify(toolError.context, null, 2));
        }
        process.exit(1);
    }
}
//# sourceMappingURL=tool-commands.js.map