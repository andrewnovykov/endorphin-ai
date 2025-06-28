# Custom Tools Implementation Plan - Endorphin AI

_Created: June 22, 2025_ _Status: Planning Phase_

## 🎯 Overview

Implementation plan for adding custom tools capability to Endorphin AI
framework. This will allow users to create their own tools (functions in
typescript ) that integrate seamlessly with the AI agent for specialized testing
needs.

##Tool Example

```typescript
/**
 * Navigation Tools for Browser Automation
 * Provides LangChain tools for page navigation
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { EnhancedBrowserTestFramework } from '../core/browser-framework.js';

/**
 * Creates a navigation tool for the framework
 * @param framework - Framework instance
 * @returns LangChain tool for navigation
 */
export function createNavigationTool(framework: EnhancedBrowserTestFramework) {
  return tool(
    async (params: {
      location: string;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | undefined;
    }) => {
      const location = params.location;
      const waitUntil = params.waitUntil ?? 'domcontentloaded';

      const stepDesc = `Navigate to: ${location}`;
      console.log(`🌍 ${stepDesc}`);

      try {
        await framework.currentPage!.goto(location, {
          waitUntil,
          timeout: 60000,
        });
        await framework.takeStepScreenshot(`Page loaded: ${location}`);

        framework.logTestStep(
          stepDesc,
          'navigate',
          { location, waitUntil },
          `Successfully navigated to: ${location}`,
          true
        );
        return `Successfully navigated to: ${location}`;
      } catch (error: any) {
        framework.logTestStep(
          stepDesc,
          'navigate',
          { location, waitUntil },
          error.message,
          false
        );
        throw error;
      }
    },
    {
      name: 'navigate',
      description: 'Navigate to a URL with enhanced options.',
      schema: z.object({
        location: z.string().describe('URL to navigate to'),
        waitUntil: z
          .enum(['load', 'domcontentloaded', 'networkidle'])
          .optional(),
      }),
    }
  );
}
```

## 📋 Implementation Checklist

### Phase 1: Core Infrastructure 🏗️

#### 1.1 Configuration System Updates

- [ ] **Update config schema** - Add `customTools` array support in
      config-loader.js
  - [ ] Add validation for customTools paths
  - [ ] Support both directory and file paths
  - [ ] Add error handling for invalid paths
  - [ ] Update default config with customTools: []

- [ ] **Update configuration types** - Ensure proper TypeScript/JSDoc types
  - [ ] Add customTools property to config interface
  - [ ] Document expected format (string array of paths)

#### 1.2 Tool Discovery System

- [ ] **Create tool discovery module** -
      `framework/core/custom-tool-discovery.ts`
  - [ ] Directory scanning functionality
  - [ ] File import and validation
  - [ ] module loading with cache busting
  - [ ] Error handling for malformed tools
  - [ ] Recursive directory traversal

- [ ] **Tool validation system**
  - [ ] Validate tool function signature
  - [ ] Check required exports (createXxxTool functions)
  - [ ] Validate tool metadata (name, description, schema)
  - [ ] Check for name conflicts with built-in tools
  - [ ] Use zod schama for tool

#### 1.3 Tool Loading Integration

- [ ] **Update tools/index.js** - Integrate custom tools with built-in tools
  - [ ] Modify createAllTools function
  - [ ] Add custom tool loading logic
  - [ ] Merge custom and built-in tools
  - [ ] Handle tool initialization errors

- [ ] **Framework integration** - Update framework
  - [ ] Pass custom tools to AI agent
  - [ ] Ensure framework instance is available to custom tools
  - [ ] Add logging for custom tool loading
  - [ ] Log amount of avalible tools before run

### Phase 2: Tool Development Support 🔧

#### 2.1 Tool Template System

- [ ] **Create tool templates / Examples ** - `framework/templates/`
  - [ ] Basic tool template - UI Playwright
  - [ ] API tool template - API Playwright
  - [ ] File operation tool template - Plane TS

- [ ] **CLI command for tool creation** - `endorphin-ai create tool [name]`
  - [ ] Generate tool file from template / Example
  - [ ] Generate from scratch ()
  - [ ] Name and description and imports only in scafolded version

#### 2.2 Development Tools

- [ ] **Tool validation CLI** - `endorphin validate tools`
- [ ] Check tool syntax
- [ ] Validate exports
- [ ] Test tool loading
- [ ] Report conflicts or issues
- [ ] Tool documentation generator: Auto-generate docs from tool schemas

- [ ] **Tool listing CLI** - `endorphin list tools`
  - [ ] Show all available tools (built-in + custom)
  - [ ] Display tool descriptions
  - [ ] Show source (built-in vs custom file)
  - [ ] Mark any tools with issues

### Phase 3: Error Handling & Debugging 🐛

#### 3.1 Error Management

- [ ] **Custom tool error handling**
  - [ ] Graceful handling of tool loading failures
  - [ ] Detailed error messages for debugging
  - [ ] Fallback behavior when custom tools fail
  - [ ] Error logging and reporting

- [ ] **Runtime error handling**
  - [ ] Tool execution error catching
  - [ ] Error context preservation
  - [ ] Test step logging for custom tools
  - [ ] Recovery mechanisms

#### 3.2 Debug Support

- [ ] **Debug logging system**
  - [ ] Tool loading debug output
  - [ ] Custom tool execution tracing
  - [ ] Parameter validation logging
  - [ ] Performance metrics

- [ ] **Debug CLI flags**
  - [ ] `--debug-tools` flag for tool-specific debugging
  - [ ] Tool execution timing
  - [ ] Parameter inspection
  - [ ] Schema validation details

### Phase 4: Testing & Quality Assurance 🧪

#### 4.1 Framework Tests

- [ ] **Unit tests for custom tool system**
  - [ ] Tool discovery tests
  - [ ] Configuration loading tests
  - [ ] Tool validation tests
  - [ ] Error handling tests

- [ ] **Integration tests**
  - [ ] End-to-end custom tool loading
  - [ ] AI agent integration tests
  - [ ] Tool execution in test context
  - [ ] Multiple tool scenarios

#### 4.2 Example Tools & Tests

- [ ] **Create example custom tools**
  - [ ] Simple API tool
  - [ ] File manipulation tool
  - [ ] Environment variable tool

- [ ] **Example test files**
  - [ ] Tests that use custom tools
  - [ ] Mixed built-in and custom tool tests
  - [ ] Error scenario tests
  - [ ] Performance tests

### Phase 5: Documentation & Examples 📚

#### 5.1 Documentation Updates

- [ ] **Update main README** - Add custom tools section
- [ ] **Update User Setup Guide** - Include custom tools setup
- [ ] **Custom Tools Guide** - Already created, update with implementation
      details
- [ ] **Framework Architecture docs** - Document custom tool system

#### 5.2 Examples & Templates

- [ ] **Update examples directory**
  - [ ] Add example custom tools
  - [ ] Update sample tests to use custom tools
  - [ ] Add configuration examples

- [ ] **Create tutorial content**
  - [ ] Step-by-step custom tool creation
  - [ ] Common patterns and use cases
  - [ ] Best practices guide
  - [ ] Troubleshooting guide

## 🔧 Technical Implementation Details

### File Structure Changes

```
framework/
├── core/
│   ├── custom-tool-discovery.js  # NEW: Tool discovery and loading
│   ├── config-loader.js           # MODIFIED: Add customTools config
│   └── browser-framework.js       # MODIFIED: Integrate custom tools
├── templates/                     # NEW: Tool templates
│   ├── basic-tool.template.js
│   ├── api-tool.template.js
│   └── file-tool.template.js
└── tools/
    └── index.js                   # MODIFIED: Merge custom and built-in tools
```

### Configuration Schema

```typescript
// endorphin.config.ts
export default {
  // ...existing config
  customTools: [
    './tools', // Directory path
    './custom-tools', // Another directory
    './api-tools', // Individual file
  ],
};
```

### Tool Discovery Algorithm

1. **Parse Configuration**
   - Extract customTools array from config
   - Validate paths exist
   - Distinguish between files and directories

2. **Directory Scanning**
   - Recursively scan directories for .ts files
   - Filter for files with createXxxTool exports
   - Build file list for import

3. **Tool Loading**
   - Import each tool file
   - Extract tool creation functions
   - Validate function signatures
   - Create tool instances with framework context

4. **Integration**
   - Merge with built-in tools
   - Check for name and description conflicts
   - Register with AI agent
   - Log loading results

### Error Handling Strategy

```typescript
// Example error handling in tool discovery
try {
  const customToolModule = await import(toolPath);
  const toolFunctions = extractToolFunctions(customToolModule);

  for (const [name, func] of toolFunctions) {
    try {
      const tool = func(framework);
      validateTool(tool);
      tools.push(tool);
    } catch (toolError) {
      console.warn(
        `⚠️ Failed to load custom tool ${name}: ${toolError.message}`
      );
      // Continue loading other tools
    }
  }
} catch (moduleError) {
  console.error(
    `❌ Failed to load custom tool file ${toolPath}: ${moduleError.message}`
  );
  // Log but don't crash the framework
}
```

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests**
   - Tool discovery logic
   - Configuration parsing
   - Tool validation
   - Error handling

2. **Integration Tests**
   - Full tool loading pipeline
   - AI agent integration
   - Framework context access
   - Multi-tool scenarios

3. **End-to-End Tests**
   - Real custom tools in test execution
   - Performance with many custom tools
   - Error recovery scenarios
   - Cross-platform compatibility

### Test Files to Create

```
tests/
├── custom-tool-discovery.test.js    # Tool discovery logic
├── custom-tool-integration.test.js  # Framework integration
├── custom-tool-config.test.js       # Configuration handling
└── fixtures/
    └── custom-tools/
        ├── valid-tool.js             # Valid tool examples
        ├── invalid-tool.js           # Invalid tools for error testing
        └── test-tools/               # Directory of test tools
```

## 📅 Implementation Timeline

### Week 1: Core Infrastructure

- [ ] Configuration system updates
- [ ] Tool discovery module
- [ ] Basic integration with existing system

### Week 2: Tool Development Support

- [ ] CLI commands for tool management
- [ ] Template system
- [ ] Validation tools

### Week 3: Error Handling & Testing

- [ ] Comprehensive error handling
- [ ] Debug support
- [ ] Framework test suite

### Week 4: Documentation & Polish

- [ ] Documentation updates
- [ ] Example tools and tests
- [ ] Performance optimization
- [ ] Final testing and bug fixes

## 🔍 Key Implementation Files

### 1. `framework/core/custom-tool-discovery`

```typescript
// Main tool discovery and loading logic
export class CustomToolDiscovery {
  constructor(config, framework) {
    this.config = config;
    this.framework = framework;
    this.loadedTools = [];
  }

  async discoverAndLoadTools() {
    // Implementation details...
  }
}
```

### 2. Updated `framework/core/config-loader`

```typescript
// Add customTools validation
const configSchema = {
  // ...existing schema
  customTools: {
    type: 'array',
    items: { type: 'string' },
    default: [],
  },
};
```

### 3. Updated `framework/tools/index`

```typescript
export async function createAllTools(framework) {
  const builtInTools = [
    // ...existing built-in tools
  ];

  const customTools = await loadCustomTools(framework);

  return [...builtInTools, ...customTools];
}
```

## 🚨 Risk Mitigation

### Security Considerations

- [ ] **Path traversal protection** - Validate custom tool paths
- [ ] **Code execution safety** - Sandbox custom tool execution if needed
- [ ] **Input validation** - Ensure custom tools can't break framework

### Performance Considerations

- [ ] **Lazy loading** - Load custom tools only when needed
- [ ] **Caching** - Cache tool modules to avoid repeated imports
- [ ] **Error isolation** - Prevent custom tool errors from crashing tests

### Compatibility Considerations

- [ ] **Version compatibility** - Check custom tools work with framework version
- [ ] **Dependency management** - Handle custom tool dependencies
- [ ] **Breaking changes** - Plan migration path for tool API changes

## ✅ Acceptance Criteria

- [ ] Users can configure custom tools in endorphin.config.ts
- [ ] Framework automatically discovers and loads custom tools
- [ ] Custom tools work seamlessly with AI agent
- [ ] Error handling prevents custom tools from breaking framework
- [ ] CLI commands support custom tool management
- [ ] Comprehensive documentation and examples available
- [ ] All tests pass including custom tool scenarios
- [ ] Performance impact is minimal
- [ ] Security considerations are addressed

---

_This plan should be updated as implementation progresses and requirements are
refined._
