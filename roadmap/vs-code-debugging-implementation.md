# VS Code Debugging Implementation Plan

## Overview
This document provides detailed implementation tracking for VS Code debugging enhancements, quarantine functionality, and tool exposure features. Each section includes specific tasks with checkboxes for progress tracking.

## Status Legend
- ✅ Completed
- 🚧 In Progress  
- ⏳ Pending
- ❌ Blocked

---

## 1. Complete Test-Level Setup Implementation

### 1.1 SessionManager Enhancement
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Implement SessionManager.updateSessionSetup() method**
  - [ ] Add method signature with TestSetupResult parameter
  - [ ] Store setup result in current session
  - [ ] Update session metadata with setup information
  - [ ] Handle error cases and validation
  - [ ] Add logging for setup result tracking

- [ ] **Update TestSession interface**
  - [ ] Add `setupResult?: TestSetupResult` property
  - [ ] Update session creation to initialize setup tracking
  - [ ] Ensure backward compatibility with existing sessions

#### Technical Specification:
```typescript
// framework/core/session-manager.ts
async updateSessionSetup(setupResult: TestSetupResult): Promise<void> {
  if (!this.currentSession) {
    throw new Error('No active session to update setup result');
  }
  
  this.currentSession.setupResult = setupResult;
  
  // Update session metadata
  this.currentSession.metadata = {
    ...this.currentSession.metadata,
    hasSetup: true,
    setupSuccess: setupResult.success,
    setupExecutionTime: setupResult.executionTime
  };
}
```

#### Testing Requirements:
- [ ] Unit tests for updateSessionSetup method
- [ ] Integration tests with test framework execution
- [ ] Error handling tests for invalid session states

---

## 2. Implement Async Data Generation Pattern

### 2.1 TestCase Interface Updates
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Update TestCase interface for async data generation**
  - [ ] Change `data?: any` to `data?: () => Promise<any>`
  - [ ] Add type definitions for data generation function
  - [ ] Ensure backward compatibility with static data
  - [ ] Update TypeScript exports

- [ ] **Add data generation result tracking**
  - [ ] Create DataGenerationResult interface
  - [ ] Track execution time and token usage
  - [ ] Store generated data in session
  - [ ] Add error handling for data generation failures

#### Technical Specification:
```typescript
// framework/types/test.ts
export type TestDataFunction = () => Promise<any>;

export interface TestCase extends TestConfig {
  data?: TestDataFunction | any; // Support both async function and static data
  setup?: TestSetupFunction;
  recordingId?: string;
  recordedSteps?: number;
}

export interface DataGenerationResult {
  success: boolean;
  data?: any;
  error?: Error;
  executionTime: number;
  tokenUsage?: TokenUsage;
}
```

### 2.2 Test Framework Integration
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Modify test execution to handle async data generation**
  - [ ] Check if data is a function or static value
  - [ ] Execute async data generation before test
  - [ ] Track token usage during data generation
  - [ ] Store data generation result in session
  - [ ] Handle data generation failures

- [ ] **Update example tests**
  - [ ] Convert existing data examples to async pattern
  - [ ] Create comprehensive examples showing data usage
  - [ ] Update documentation and guides

#### Implementation Location:
- File: `framework/core/test-framework.ts`
- Method: `executeTest()` - add data generation before instruction execution

---

## 3. Enhanced HTML Reporting

### 3.1 Report Template Updates
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Add setup section to test details modal**
  - [ ] Update report-template.html with setup display
  - [ ] Show setup execution time and result
  - [ ] Display setup data if available
  - [ ] Add setup error information for failures

- [ ] **Add data generation section**
  - [ ] Display generated data in structured format
  - [ ] Show token usage for data generation
  - [ ] Include data generation execution time
  - [ ] Add expandable/collapsible data viewer

- [ ] **Update timeline to include setup and data steps**
  - [ ] Add setup step at beginning of timeline
  - [ ] Add data generation step after setup
  - [ ] Show token usage breakdown by step type
  - [ ] Enhance visual representation

#### Files to Modify:
- `framework/templates/reporter/report-template.html`
- `framework/templates/reporter/scripts.js`
- `framework/templates/reporter/styles.css`
- `framework/reporters/html-reporter.ts`

### 3.2 JavaScript Enhancements
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Update TestReportViewer class**
  - [ ] Add setup result display logic
  - [ ] Add data generation result display
  - [ ] Enhance modal population with new data
  - [ ] Add token usage breakdown visualization

---

## 4. VS Code Debugging Enhancement

### 4.1 Global Debug Object
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Create debug object initialization**
  - [ ] Check for ENDORPHIN_DEBUG environment variable
  - [ ] Initialize global.endorphinDebug object
  - [ ] Populate with framework instance references
  - [ ] Add test session access utilities

- [ ] **Expose test session data**
  - [ ] Current test session information
  - [ ] Setup results and data
  - [ ] Test execution state
  - [ ] Framework configuration

#### Technical Specification:
```typescript
// framework/core/debug-manager.ts
interface EndorphinDebugObject {
  framework: TestFramework;
  session: TestSession | null;
  config: FrameworkConfig;
  tools: LangChainTool[];
  customTools: LangChainTool[];
  utils: {
    getSessionData: () => any;
    getSetupResult: () => TestSetupResult | null;
    getDataGenerationResult: () => DataGenerationResult | null;
    inspectTools: () => ToolInfo[];
    clearSession: () => void;
  };
}

declare global {
  var endorphinDebug: EndorphinDebugObject | undefined;
}
```

### 4.2 VS Code Launch Configuration
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Update .vscode/launch.json**
  - [ ] Add ENDORPHIN_DEBUG=true to environment variables
  - [ ] Create dedicated debug configuration
  - [ ] Add debugging-specific arguments
  - [ ] Document debugging setup process

#### Example Configuration:
```json
{
  "name": "Debug Endorphin CLI with Debug Mode",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/bin/endorphin.js",
  "args": ["run", "test", "${input:testId}"],
  "console": "integratedTerminal",
  "cwd": "${workspaceFolder}/examples",
  "env": {
    "NODE_ENV": "development",
    "ENDORPHIN_DEBUG": "true"
  },
  "skipFiles": ["<node_internals>/**"]
}
```

---

## 5. Quarantine Functionality

### 5.1 Test Discovery Enhancement
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Add quarantine detection in TestDiscovery class**
  - [ ] Check for 'quarantined' tag in test tags array
  - [ ] Skip quarantined tests during discovery
  - [ ] Log quarantined tests for reporting
  - [ ] Add configuration option to run quarantined tests

- [ ] **Update test execution logic**
  - [ ] Skip quarantined tests in all execution methods
  - [ ] Report quarantined tests as skipped
  - [ ] Add CLI option to include quarantined tests
  - [ ] Update test filtering methods

#### Implementation Location:
- File: `framework/core/test-discovery.ts`
- Methods: `runSingleTestById`, `runAllTests`, `runTestsByTag`, `runTestsByPriority`

### 5.2 Reporting Integration
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Add quarantine status to HTML reports**
  - [ ] Display quarantined tests in separate section
  - [ ] Show quarantine reason if provided
  - [ ] Add filter option for quarantined tests
  - [ ] Update test count statistics

- [ ] **Update console reporting**
  - [ ] Log quarantined tests during discovery
  - [ ] Include quarantine count in final summary
  - [ ] Add warning indicators for quarantined tests

---

## 6. Tool Exposure in Debug Mode

### 6.1 Tool Discovery and Registry
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Discover all framework tools**
  - [ ] Access ToolManager's tool registry
  - [ ] Enumerate built-in framework tools
  - [ ] Extract tool metadata and schemas
  - [ ] Create tool inspection utilities

- [ ] **Load custom user tools**
  - [ ] Access custom tool discovery results
  - [ ] Include user-defined tools in registry
  - [ ] Handle tool loading errors gracefully
  - [ ] Provide tool validation status

#### Technical Specification:
```typescript
// framework/core/debug-manager.ts
interface ToolInfo {
  name: string;
  description: string;
  type: 'framework' | 'custom';
  schema: any;
  isLoaded: boolean;
  error?: string;
}

function getAllAvailableTools(): ToolInfo[] {
  const frameworkTools = toolManager.getTools();
  const customTools = customToolDiscovery.getDiscoveredTools();
  
  return [
    ...frameworkTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      type: 'framework' as const,
      schema: tool.schema,
      isLoaded: true
    })),
    ...customTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      type: 'custom' as const,
      schema: tool.schema,
      isLoaded: tool.loadSuccess,
      error: tool.error
    }))
  ];
}
```

### 6.2 Debug Object Enhancement
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Add tool registry to debug object**
  - [ ] Expose complete tool list
  - [ ] Add tool inspection methods
  - [ ] Provide tool execution utilities
  - [ ] Include tool performance metrics

---

## 7. Documentation and Examples

### 7.1 Documentation Updates
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Update README.md**
  - [ ] Add debugging features section
  - [ ] Document ENDORPHIN_DEBUG usage
  - [ ] Include setup function examples
  - [ ] Add quarantine functionality documentation

- [ ] **Create debugging guide**
  - [ ] VS Code setup instructions
  - [ ] Debug object usage examples
  - [ ] Common debugging scenarios
  - [ ] Troubleshooting guide

### 7.2 Example Updates
**Status**: ⏳ Pending

#### Tasks:
- [ ] **Update example tests**
  - [ ] Convert to async data generation pattern
  - [ ] Add setup function examples
  - [ ] Include quarantine examples
  - [ ] Add debugging demonstrations

---

## Implementation Timeline

### Week 1: Core Infrastructure
- [ ] Complete SessionManager.updateSessionSetup()
- [ ] Implement async data generation pattern
- [ ] Update TestCase interface and types

### Week 2: Debugging Features
- [ ] Create global debug object
- [ ] Implement tool exposure
- [ ] Update VS Code configuration

### Week 3: Quarantine and Reporting
- [ ] Implement quarantine functionality
- [ ] Enhance HTML reporting
- [ ] Add setup/data display

### Week 4: Documentation and Testing
- [ ] Update documentation
- [ ] Create comprehensive tests
- [ ] Update examples and guides

---

## Testing Strategy

### Unit Tests
- [ ] SessionManager.updateSessionSetup()
- [ ] Async data generation execution
- [ ] Quarantine detection logic
- [ ] Debug object initialization

### Integration Tests
- [ ] Full test execution with setup and data
- [ ] HTML report generation with new features
- [ ] VS Code debugging workflow
- [ ] Quarantine functionality end-to-end

### Manual Testing
- [ ] VS Code debugging experience
- [ ] HTML report interactivity
- [ ] Debug object usage in console
- [ ] Tool inspection and usage

---

## Success Criteria

### Functionality
- [ ] All setup functions execute correctly with error handling
- [ ] Async data generation works with token tracking
- [ ] HTML reports display setup and data information
- [ ] VS Code debugging provides accessible framework state
- [ ] Quarantined tests are properly skipped and reported
- [ ] All tools are exposed and inspectable in debug mode

### Performance
- [ ] No significant impact on test execution time
- [ ] Debug mode overhead is minimal when not enabled
- [ ] HTML reports load quickly with additional data

### Developer Experience
- [ ] Easy access to test session data in VS Code
- [ ] Clear visibility of setup and data generation results
- [ ] Intuitive quarantine workflow
- [ ] Comprehensive tool inspection capabilities

---

## Notes and Considerations

### Backward Compatibility
- All changes must maintain compatibility with existing tests
- Static data should continue to work alongside async functions
- Existing configuration should remain valid

### Error Handling
- Graceful degradation when debug features are not available
- Clear error messages for setup and data generation failures
- Proper cleanup of resources in all scenarios

### Security
- Debug mode should only be enabled in development environments
- Sensitive data should not be exposed in debug objects
- Tool access should be controlled and monitored

---

*Last Updated: 2025-07-01*
*Status: Implementation in progress*