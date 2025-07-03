/**
 * Built-in Tools Command Handler
 * Displays all available built-in browser automation tools
 */

export interface BuiltinTool {
  name: string;
  description: string;
  category: string;
  parameters?: string[];
}

/**
 * Built-in tools registry
 * These are the 12 core browser automation tools available in Endorphin AI
 */
const BUILTIN_TOOLS: BuiltinTool[] = [
  // Navigation Tools (1)
  {
    name: 'navigate',
    description: 'Navigate to URLs and handle page routing',
    category: 'Navigation',
    parameters: ['url: string', 'options?: NavigationOptions']
  },

  // Content Analysis Tools (4)
  {
    name: 'getDifferentialContent',
    description: 'Get page content differences (most efficient for content analysis)',
    category: 'Content Analysis',
    parameters: ['selector?: string', 'optimization?: ContentOptimization']
  },
  {
    name: 'getPageContent',
    description: 'Get full page content with automatic optimization',
    category: 'Content Analysis', 
    parameters: ['selector?: string', 'includeHidden?: boolean']
  },
  {
    name: 'getSimplePageContent',
    description: 'Simple content extraction without optimization',
    category: 'Content Analysis',
    parameters: ['selector?: string']
  },
  {
    name: 'optimizeContent',
    description: 'Direct access to content optimization for large pages',
    category: 'Content Analysis',
    parameters: ['content: string', 'instruction: string']
  },

  // Interaction Tools (3)
  {
    name: 'click',
    description: 'Click on elements using various selectors (CSS, text, role)',
    category: 'Interaction',
    parameters: ['selector: string', 'strategy?: "css" | "text" | "role"', 'options?: ClickOptions']
  },
  {
    name: 'fill',
    description: 'Fill input fields with text',
    category: 'Interaction',
    parameters: ['selector: string', 'text: string', 'options?: FillOptions']
  },
  {
    name: 'clearField',
    description: 'Clear input field contents',
    category: 'Interaction',
    parameters: ['selector: string', 'options?: ClearOptions']
  },

  // Verification Tools (2)
  {
    name: 'verifyElement',
    description: 'Verify element state (visible, hidden, enabled, disabled, etc.)',
    category: 'Verification',
    parameters: ['selector: string', 'state: ElementState', 'timeout?: number']
  },
  {
    name: 'getElementInfo',
    description: 'Get detailed information about elements (text, attributes, properties)',
    category: 'Verification',
    parameters: ['selector: string', 'properties?: string[]']
  },

  // Utility Tools (2)
  {
    name: 'wait',
    description: 'Wait for specific conditions or time delays',
    category: 'Utilities',
    parameters: ['condition: WaitCondition | number', 'timeout?: number']
  },
  {
    name: 'screenshot',
    description: 'Take screenshots for test documentation and debugging',
    category: 'Utilities',
    parameters: ['description?: string', 'options?: ScreenshotOptions']
  }
];

/**
 * Handle list tools command - shows all built-in tools
 */
export function handleListToolsCommand(options: { verbose?: boolean } = {}): void {
  console.log('🛠️ Built-in Browser Automation Tools\n');

  // Group tools by category
  const categories = [...new Set(BUILTIN_TOOLS.map(tool => tool.category))];
  
  categories.forEach(category => {
    const categoryTools = BUILTIN_TOOLS.filter(tool => tool.category === category);
    const categoryIcon = getCategoryIcon(category);
    
    console.log(`${categoryIcon} ${category} (${categoryTools.length} tool${categoryTools.length === 1 ? '' : 's'})`);
    
    categoryTools.forEach(tool => {
      if (options.verbose) {
        console.log(`  ${tool.name.padEnd(20)} ${tool.description}`);
        if (tool.parameters) {
          console.log(`    Parameters: ${tool.parameters.join(', ')}`);
        }
        console.log('');
      } else {
        console.log(`  ${tool.name.padEnd(20)} ${tool.description}`);
      }
    });
    
    console.log('');
  });

  // Summary
  console.log(`📊 Total: ${BUILTIN_TOOLS.length} built-in tools available`);
  
  if (!options.verbose) {
    console.log('\n💡 Use --verbose flag for detailed tool parameters and usage information');
  }
  
  console.log('\n📖 Documentation: These tools are automatically available in all tests');
  console.log('   Example: await click("button[data-testid=\\"submit\\"]");');
}

/**
 * Get category icon for display
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Navigation': '📍',
    'Content Analysis': '📄', 
    'Interaction': '🖱️',
    'Verification': '✅',
    'Utilities': '⚙️'
  };
  
  return icons[category] || '🔧';
}

/**
 * Get tool count by category
 */
export function getToolStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  BUILTIN_TOOLS.forEach(tool => {
    stats[tool.category] = (stats[tool.category] || 0) + 1;
  });
  
  return stats;
}

/**
 * Get all built-in tools list (for programmatic access)
 */
export function getAllBuiltinTools(): BuiltinTool[] {
  return [...BUILTIN_TOOLS];
}

/**
 * Check if a tool exists
 */
export function isValidTool(toolName: string): boolean {
  return BUILTIN_TOOLS.some(tool => tool.name === toolName);
}