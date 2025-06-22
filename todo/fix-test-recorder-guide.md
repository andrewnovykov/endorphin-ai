# Fix Test Recorder Implementation Guide - Endorphin AI

*Created: June 22, 2025*
*Updated: June 22, 2025*
*Status: Implementation Ready*

## 🎯 Overview

This guide details the test recorder implementation that opens a browser, waits for user prompts, executes steps via AI agent, captures screenshots, organizes artifacts in user's `test-recorder/` folder, and generates runnable test files.

## 🔍 Current Implementation Analysis

### Existing Code Review: `enhanced-interactive-recorder.js`
✅ **Working Components:**
- Interactive prompt collection system
- Test data gathering (ID, name, description, priority, tags)
- Browser initialization via EnhancedBrowserTestFramework
- AI agent integration for command execution
- Basic recording session management

❌ **Issues to Fix:**
- Duplicate `rl.close()` call (line 218)
- Missing detailed step-by-step folder structure
- No before/after screenshot capture per step
- Recording artifacts go to framework instead of user directory
- Generated test file location needs clarification
- No proper session file with all steps

## 📋 Implementation Requirements

### Core Workflow
1. **Start Recorder** → Open browser, wait for commands
2. **Execute Prompt** → AI agent executes step in browser
3. **Capture Evidence** → Screenshots before/after each step
4. **Organize Artifacts** → Store in user's `test-recorder/` folder
5. **Generate Test File** → Create runnable test in `tests/` folder
6. **Stop Command** → Close browser, finalize recording
7. **Run Generated Test** → Test works like any other Endorphin test

### Folder Structure Requirements
```
user-project/
├── test-recorder/                    # User's recording artifacts
│   └── [recording-id]/              # Each recording session
│       ├── session.json             # Complete session metadata
│       ├── steps.json               # All recorded steps
│       ├── generated-test.js        # Copy of generated test
│       └── steps/                   # Individual step folders
│           ├── 001-navigate/        # Step 1
│           │   ├── step-info.json   # Step metadata
│           │   ├── before.png       # Screenshot before action
│           │   └── after.png        # Screenshot after action
│           ├── 002-click-login/     # Step 2
│           │   ├── step-info.json
│           │   ├── before.png
│           │   └── after.png
│           └── 003-fill-form/       # Step 3
│               ├── step-info.json
│               ├── before.png
│               └── after.png
├── tests/                           # Generated runnable tests
│   └── recorded-[test-id].js        # Final test file
└── endorphin.config.js
```

## 🔧 Implementation Plan

### Phase 1: Fix Current Issues

#### 1.1 Fix Duplicate Close Bug
**File: `framework/interactive/enhanced-interactive-recorder.js`**

```javascript
// Fix lines 217-218
} finally {
  await framework.cleanup();
  rl.close();
  // Remove duplicate: rl.close();
}
```

#### 1.2 Enhance TestRecorder Class
**File: `framework/core/test-recorder.js`**

```javascript
import fs from 'fs/promises';
import path from 'path';

export class TestRecorder {
  constructor(framework, testData) {
    this.framework = framework;
    this.testData = testData;
    this.recordingId = null;
    this.recordingPath = null;
    this.steps = [];
    this.stepCounter = 0;
    this.startTime = null;
  }

  async startRecording() {
    this.startTime = new Date();
    this.recordingId = `${this.testData.id || 'REC'}-${Date.now()}`;
    
    // Create recording directory in USER project (not framework)
    this.recordingPath = path.join(process.cwd(), 'test-recorder', this.recordingId);
    await fs.mkdir(this.recordingPath, { recursive: true });
    await fs.mkdir(path.join(this.recordingPath, 'steps'), { recursive: true });
    
    console.log(`📁 Recording session: ${this.recordingId}`);
    console.log(`📂 Artifacts will be saved to: ${this.recordingPath}`);
    
    return this.recordingId;
  }

  async recordStep(description, type, data, result) {
    this.stepCounter++;
    const stepId = String(this.stepCounter).padStart(3, '0');
    const stepFolderName = `${stepId}-${this.sanitizeFileName(description)}`;
    const stepPath = path.join(this.recordingPath, 'steps', stepFolderName);
    
    // Create step folder
    await fs.mkdir(stepPath, { recursive: true });
    
    // Take BEFORE screenshot
    const beforeScreenshot = path.join(stepPath, 'before.png');
    await this.framework.page.screenshot({ path: beforeScreenshot, fullPage: true });
    
    // Record step info
    const stepInfo = {
      stepNumber: this.stepCounter,
      description,
      type,
      timestamp: new Date().toISOString(),
      data,
      result,
      beforeScreenshot: 'before.png',
      afterScreenshot: 'after.png'
    };
    
    // Execute step is handled by caller, we just document it
    
    // Take AFTER screenshot (small delay to ensure DOM updates)
    await new Promise(resolve => setTimeout(resolve, 500));
    const afterScreenshot = path.join(stepPath, 'after.png');
    await this.framework.page.screenshot({ path: afterScreenshot, fullPage: true });
    
    // Save step info
    await fs.writeFile(
      path.join(stepPath, 'step-info.json'),
      JSON.stringify(stepInfo, null, 2)
    );
    
    // Add to steps array
    this.steps.push({
      ...stepInfo,
      stepFolder: stepFolderName
    });
    
    console.log(`📸 Step ${this.stepCounter} recorded: ${description}`);
    
    return stepInfo;
  }

  async stopRecording() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    // Generate session metadata
    const sessionData = {
      recordingId: this.recordingId,
      testData: this.testData,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration,
      totalSteps: this.steps.length,
      status: 'completed'
    };
    
    // Save session.json
    await fs.writeFile(
      path.join(this.recordingPath, 'session.json'),
      JSON.stringify(sessionData, null, 2)
    );
    
    // Save steps.json
    await fs.writeFile(
      path.join(this.recordingPath, 'steps.json'),
      JSON.stringify(this.steps, null, 2)
    );
    
    // Generate test file
    const testFile = await this.generateTestFile();
    
    // Copy generated test to recording folder
    const testContent = await fs.readFile(testFile);
    await fs.writeFile(
      path.join(this.recordingPath, 'generated-test.js'),
      testContent
    );
    
    return {
      recordingId: this.recordingId,
      recordingPath: this.recordingPath,
      steps: this.steps.length,
      duration,
      testFile
    };
  }

  async generateTestFile() {
    // Generate natural language task from recorded steps
    const task = this.steps.map(step => step.description).join(', then ');
    
    // Create test object
    const testObject = {
      id: this.testData.id,
      name: this.testData.name,
      description: this.testData.description,
      priority: this.testData.priority,
      tags: [...(this.testData.tags || []), 'recorded'],
      site: this.testData.site,
      testData: this.testData.testData,
      task: task
    };
    
    // Generate test file content
    const testContent = `// Auto-generated test from recording: ${this.recordingId}
// Generated on: ${new Date().toISOString()}
// Recording location: ${this.recordingPath}

export const ${this.testData.id.replace(/[^A-Z0-9]/g, '_')} = ${JSON.stringify(testObject, null, 2)};
`;
    
    // Save to tests folder
    const testsDir = path.join(process.cwd(), 'tests');
    await fs.mkdir(testsDir, { recursive: true });
    
    const testFileName = `recorded-${this.testData.id.toLowerCase()}.js`;
    const testFilePath = path.join(testsDir, testFileName);
    
    await fs.writeFile(testFilePath, testContent);
    
    console.log(`✅ Test file generated: tests/${testFileName}`);
    
    return testFilePath;
  }

  sanitizeFileName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }
}
```

### Phase 2: Enhanced Interactive Recorder

#### 2.1 Update Enhanced Interactive Recorder
**File: `framework/interactive/enhanced-interactive-recorder.js`**

```javascript
// Update the interactive command loop section
while (true) {
  const prompt = await askQuestion('🎬 Next step: ');
  
  if (prompt.toLowerCase() === 'done' || prompt.toLowerCase() === 'stop') {
    console.log('\n🛑 Stopping recording...');
    break;
  }
  
  if (!prompt.trim()) {
    console.log('⚠️ Please enter a command or "done"/"stop" to finish.');
    continue;
  }
  
  try {
    // Record step BEFORE execution (captures "before" screenshot)
    console.log(`\n🤖 Processing: "${prompt}"`);
    
    // This will capture the BEFORE screenshot
    const stepPromise = recorder.recordStep(
      prompt,
      'ai-agent',
      { command: prompt },
      'In progress...'
    );
    
    // Execute the command using the framework's AI agent
    const result = await framework.runTask(prompt, `Interactive-Step-${Date.now()}`);
    
    // Complete the step recording (captures AFTER screenshot)
    await stepPromise;
    
    console.log(`✅ Step completed: ${result.result || 'Success'}`);
    
  } catch (error) {
    console.log(`❌ Error executing command: ${error.message}`);
    
    // Still record the failed attempt
    await recorder.recordStep(
      prompt,
      'error',
      { error: error.message },
      `Error: ${error.message}`
    );
  }
}
```

#### 2.2 Fix Final Cleanup
```javascript
} finally {
  await framework.cleanup();
  rl.close();
  // Remove duplicate rl.close()
}
```

### Phase 3: CLI Integration

#### 3.1 Update CLI Router
**File: `bin/endorphin.js`**

```javascript
// Add test recorder command handling
if (command === 'test-recorder' || args.includes('test-recorder')) {
  const { runInteractiveRecorder } = await import('../framework/interactive/enhanced-interactive-recorder.js');
  await runInteractiveRecorder();
  process.exit(0);
}
```

#### 3.2 Package.json Scripts
```json
{
  "scripts": {
    "test:record": "endorphin run test-recorder",
    "test": "endorphin run test all",
    "test:single": "endorphin run test"
  }
}
```

## 🎯 Usage Workflow

### Step 1: Start Recording
```bash
# Using npm script
npm run test:record

# Using CLI directly
npx endorphin run test-recorder
```

### Step 2: Interactive Session
```
🎬 Interactive Test Recorder
═══════════════════════════════════════════════════════
Record browser interactions step by step!

📋 Test Data Collection
═══════════════════════════════════════════════════════
Test ID (e.g., QE-012): QE-015
Test Name: User Registration Flow
Test Description: Test complete user registration process
Priority (High/Medium/Low) [Medium]: High
Tags (comma-separated): registration, signup, forms
Site URL [https://qafromla.herokuapp.com/]: https://myapp.com

🚀 Initializing browser...
🌐 Navigating to: https://myapp.com
📁 Recording session: QE-015-1703234567890
📂 Artifacts will be saved to: ./test-recorder/QE-015-1703234567890

💬 Ready for interactive commands!
Type your commands or "done" to finish recording.

🎬 Next step: click on register button
🤖 Processing: "click on register button"
📸 Step 1 recorded: click on register button
✅ Step completed: Successfully clicked register button

🎬 Next step: fill in email field with test@example.com
🤖 Processing: "fill in email field with test@example.com"
📸 Step 2 recorded: fill in email field with test@example.com
✅ Step completed: Email entered successfully

🎬 Next step: done
🛑 Stopping recording...
```

### Step 3: Generated Artifacts

#### Recording Folder Structure
```
test-recorder/
└── QE-015-1703234567890/
    ├── session.json              # Session metadata
    ├── steps.json                # All steps data
    ├── generated-test.js          # Copy of generated test
    └── steps/
        ├── 001-navigate-to-site/
        │   ├── step-info.json     # Step details
        │   ├── before.png         # Screenshot before action
        │   └── after.png          # Screenshot after action
        ├── 002-click-on-register-button/
        │   ├── step-info.json
        │   ├── before.png
        │   └── after.png
        └── 003-fill-in-email-field/
            ├── step-info.json
            ├── before.png
            └── after.png
```

#### Generated Test File
```javascript
// tests/recorded-qe-015.js
export const QE_015 = {
  id: "QE-015",
  name: "User Registration Flow",
  description: "Test complete user registration process",
  priority: "High",
  tags: ["registration", "signup", "forms", "recorded"],
  site: "https://myapp.com",
  testData: {
    email: "test@example.com"
  },
  task: "Navigate to https://myapp.com, then click on register button, then fill in email field with test@example.com"
};
```

### Step 4: Run Generated Test
```bash
# Run the generated test like any other test
npm run test:single QE-015

# Or using CLI
npx endorphin run test QE-015
```

## 📊 Artifact Files Structure

### session.json
```json
{
  "recordingId": "QE-015-1703234567890",
  "testData": {
    "id": "QE-015",
    "name": "User Registration Flow",
    "description": "Test complete user registration process",
    "priority": "High",
    "tags": ["registration", "signup", "forms"],
    "site": "https://myapp.com",
    "testData": {}
  },
  "startTime": "2025-06-22T10:30:00.000Z",
  "endTime": "2025-06-22T10:35:00.000Z",
  "duration": 300000,
  "totalSteps": 3,
  "status": "completed"
}
```

### steps.json
```json
[
  {
    "stepNumber": 1,
    "description": "Navigate to https://myapp.com",
    "type": "navigate",
    "timestamp": "2025-06-22T10:30:15.000Z",
    "data": { "url": "https://myapp.com" },
    "result": "Navigation completed",
    "beforeScreenshot": "before.png",
    "afterScreenshot": "after.png",
    "stepFolder": "001-navigate-to-site"
  },
  {
    "stepNumber": 2,
    "description": "click on register button",
    "type": "ai-agent",
    "timestamp": "2025-06-22T10:32:00.000Z",
    "data": { "command": "click on register button" },
    "result": "Successfully clicked register button",
    "beforeScreenshot": "before.png",
    "afterScreenshot": "after.png",
    "stepFolder": "002-click-on-register-button"
  }
]
```

### step-info.json (per step)
```json
{
  "stepNumber": 2,
  "description": "click on register button",
  "type": "ai-agent",
  "timestamp": "2025-06-22T10:32:00.000Z",
  "data": {
    "command": "click on register button"
  },
  "result": "Successfully clicked register button",
  "beforeScreenshot": "before.png",
  "afterScreenshot": "after.png"
}
```

## ✅ Validation Checklist

### Functional Requirements
- [ ] Browser opens and waits for commands
- [ ] AI agent executes each step successfully
- [ ] Before/after screenshots captured for each step
- [ ] Artifacts stored in user's `test-recorder/` folder
- [ ] Each step has its own folder with metadata
- [ ] Session file contains complete recording info
- [ ] Generated test file works with existing CLI
- [ ] "stop"/"done" command closes browser properly
- [ ] Generated test runs like other Endorphin tests

### Technical Requirements
- [ ] No duplicate `rl.close()` calls
- [ ] Proper error handling for failed steps
- [ ] Clean file/folder naming conventions
- [ ] Comprehensive step metadata
- [ ] Screenshot timing works correctly
- [ ] Generated test follows Endorphin format
- [ ] CLI integration works properly

### User Experience
- [ ] Clear prompts and feedback
- [ ] Progress indicators during recording
- [ ] Comprehensive artifact organization
- [ ] Easy test execution after recording
- [ ] Helpful error messages

## 🚀 Implementation Timeline

### Week 1: Core Fixes
- Fix duplicate `rl.close()` bug
- Enhance TestRecorder class with proper folder structure
- Implement before/after screenshot capture

### Week 2: Artifact Organization
- Implement user directory artifact storage
- Create comprehensive step metadata system
- Enhance test file generation

### Week 3: Integration & Testing
- Update CLI integration
- Add comprehensive error handling
- Test complete workflow end-to-end

### Week 4: Polish & Documentation
- User experience improvements
- Documentation updates
- Final testing and validation

This implementation will provide a complete, production-ready test recorder that captures every step with full visual documentation and generates runnable tests that integrate seamlessly with the existing Endorphin AI framework.
