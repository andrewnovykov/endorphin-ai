# TODO: Fix Test Recorder Implementation Checklist

*Created: June 22, 2025*
*Status: Ready for Implementation*
*Priority: High*

## 🎯 Overview
Step-by-step implementation checklist to fix the test recorder with proper browser integration, screenshot capture, artifact organization, and CLI integration.

## 📋 Phase 1: Critical Bug Fixes & Code Analysis ⚡

### 1.1 Immediate Bug Fixes
- [ ] **Fix duplicate `rl.close()` bug**
  - File: `framework/interactive/enhanced-interactive-recorder.js`
  - Location: Lines 217-218
  - Action: Remove duplicate `rl.close()` call in finally block
  - Expected: Clean exit without errors

- [ ] **Analyze current TestRecorder class**
  - File: `framework/core/test-recorder.js`
  - Action: Review existing implementation
  - Document: Current capabilities and missing features
  - Note: What needs to be enhanced vs rebuilt

- [ ] **Test current recorder functionality**
  - Command: `npm run test:record` (if exists)
  - Action: Document current behavior and issues
  - Identify: What works vs what's broken

### 1.2 Code Structure Review
- [ ] **Map current file dependencies**
  - Check: `enhanced-interactive-recorder.js` imports
  - Check: `test-recorder.js` dependencies
  - Verify: Framework integration points
  - Document: Current architecture issues

- [ ] **Review CLI integration**
  - File: `bin/endorphin.js`
  - Check: Existing test-recorder command routing
  - Verify: Current CLI argument handling
  - Document: What needs to be added/fixed

## 📋 Phase 2: Enhance TestRecorder Core Class 🔧

### 2.1 Update TestRecorder Constructor & Properties
- [ ] **Add missing properties to TestRecorder class**
  - File: `framework/core/test-recorder.js`
  - Add: `recordingId`, `recordingPath`, `steps`, `stepCounter`, `startTime`
  - Ensure: Proper initialization in constructor
  - Test: Constructor creates expected properties

### 2.2 Implement Recording Session Management
- [ ] **Create `startRecording()` method**
  - Generate: Unique recording ID with timestamp
  - Create: User directory structure `test-recorder/[recording-id]/`
  - Create: Steps subdirectory `test-recorder/[recording-id]/steps/`
  - Log: Recording session start information
  - Return: Recording ID for reference

- [ ] **Create `stopRecording()` method**
  - Calculate: Session duration
  - Generate: Session metadata object
  - Save: `session.json` with complete session info
  - Save: `steps.json` with all recorded steps
  - Generate: Test file in `tests/` folder
  - Copy: Generated test to recording folder
  - Return: Recording summary object

### 2.3 Implement Step Recording with Screenshots
- [ ] **Create enhanced `recordStep()` method**
  - Generate: Step folder with number and sanitized name
  - Capture: BEFORE screenshot (full page)
  - Store: Step metadata in `step-info.json`
  - Execute: Step action (handled by caller)
  - Wait: 500ms for DOM updates
  - Capture: AFTER screenshot (full page)
  - Add: Step to internal steps array
  - Log: Step completion message

- [ ] **Create `sanitizeFileName()` helper method**
  - Convert: To lowercase
  - Remove: Special characters except hyphens
  - Replace: Spaces with hyphens
  - Limit: To 30 characters max
  - Return: Clean filename string

### 2.4 Implement Test File Generation
- [ ] **Create `generateTestFile()` method**
  - Build: Natural language task from recorded steps
  - Create: Endorphin test object with all required fields
  - Add: "recorded" tag to tags array
  - Generate: Proper ES6 export format
  - Save: To `tests/recorded-[test-id].js`
  - Log: Success message with file location

## 📋 Phase 3: Fix Enhanced Interactive Recorder 🎬

### 3.1 Update Interactive Command Loop
- [ ] **Fix command processing logic**
  - File: `framework/interactive/enhanced-interactive-recorder.js`
  - Add: Support for "stop" command (in addition to "done")
  - Fix: Screenshot timing - capture BEFORE action execution
  - Improve: Error handling for failed commands
  - Ensure: Proper step recording for both success and failure

- [ ] **Update step execution flow**
  - Call: `recorder.recordStep()` BEFORE `framework.runTask()`
  - Execute: `framework.runTask()` for actual browser action
  - Update: Step result after successful execution
  - Handle: Failed executions with error recording

### 3.2 Improve User Experience
- [ ] **Enhance interactive prompts**
  - Add: Clear command examples
  - Show: Recording progress (step count)
  - Display: Current recording ID and path
  - Provide: Better error messages

- [ ] **Fix final cleanup**
  - Remove: Duplicate `rl.close()` call
  - Ensure: Browser cleanup happens
  - Verify: All files are saved before exit

## 📋 Phase 4: CLI Integration & Routing 🖥️

### 4.1 Update CLI Command Router
- [ ] **Add test-recorder command to CLI**
  - File: `bin/endorphin.js`
  - Add: Command detection for 'test-recorder'
  - Import: `runInteractiveRecorder` function
  - Route: To recorder when command matches
  - Exit: Properly after recorder completion

- [ ] **Test CLI integration**
  - Command: `npx endorphin run test-recorder`
  - Verify: Command routes to recorder
  - Check: Arguments are passed correctly
  - Ensure: Exit codes are proper

### 4.2 Update Package.json Scripts
- [ ] **Add/update npm scripts**
  - Add: `"test:record": "endorphin run test-recorder"`
  - Keep: Existing test scripts
  - Test: `npm run test:record` works
  - Document: All available scripts

## 📋 Phase 5: Testing & Validation 🧪

### 5.1 Create Test Cases
- [ ] **Unit tests for TestRecorder class**
  - File: `dev-tests/test-recorder.test.js` (create if missing)
  - Test: Constructor initialization
  - Test: `startRecording()` creates directories
  - Test: `recordStep()` captures screenshots
  - Test: `generateTestFile()` creates valid test
  - Test: `stopRecording()` saves all artifacts

- [ ] **Integration tests**
  - File: `dev-tests/test-recorder-integration.test.js` (create)
  - Test: Full recording session workflow
  - Test: CLI command integration
  - Test: Generated test can be executed
  - Test: Error handling scenarios

### 5.2 Manual Testing Scenarios
- [ ] **Basic recording workflow**
  - Start: Recorder with `npm run test:record`
  - Enter: Valid test data (ID, name, description, etc.)
  - Execute: 3-5 simple commands (navigate, click, type)
  - Stop: Recording with "done" command
  - Verify: All artifacts are created correctly

- [ ] **Generated test execution**
  - Run: Generated test with `npm run test:single [TEST-ID]`
  - Verify: Test executes successfully
  - Check: Same actions are performed
  - Confirm: Test results are recorded

### 5.3 Edge Case Testing
- [ ] **Error handling scenarios**
  - Test: Invalid commands during recording
  - Test: Browser crashes during recording
  - Test: Disk space issues for screenshots
  - Test: Invalid test data input
  - Verify: Graceful error handling

- [ ] **File system scenarios**
  - Test: Recording in different directories
  - Test: Permission issues
  - Test: Existing test-recorder folder
  - Test: Long test names and descriptions

## 📋 Phase 6: Documentation & Polish 📚

### 6.1 Update Documentation
- [ ] **Update README.md**
  - Add: Test recorder usage section
  - Include: Command examples
  - Show: Folder structure created
  - Explain: Generated test format

- [ ] **Update Framework Architecture docs**
  - File: `doc/dev/Framework-Architecture.md`
  - Add: TestRecorder class documentation
  - Include: Interactive recorder workflow
  - Document: CLI integration points

### 6.2 Code Quality
- [ ] **Add JSDoc comments**
  - File: `framework/core/test-recorder.js`
  - Document: All methods and parameters
  - Include: Usage examples
  - Add: Return value descriptions

- [ ] **Code formatting and linting**
  - Run: Code formatter on all modified files
  - Fix: Any linting issues
  - Ensure: Consistent code style
  - Verify: No console.log left in production code

## 📋 Phase 7: Final Integration & Deployment 🚀

### 7.1 End-to-End Testing
- [ ] **Complete workflow test**
  - Record: A complex test scenario (login + form filling)
  - Verify: All screenshots are captured
  - Check: Folder structure is correct
  - Run: Generated test successfully
  - Compare: Recorded vs replayed actions

- [ ] **Performance testing**
  - Test: Recording with many steps (10+)
  - Check: Screenshot capture timing
  - Verify: Memory usage is reasonable
  - Ensure: No performance degradation

### 7.2 Deployment Preparation
- [ ] **Version control**
  - Commit: All changes with clear messages
  - Tag: Version if this is a release
  - Update: CHANGELOG.md with new features
  - Push: To repository

- [ ] **User communication**
  - Update: User documentation
  - Create: Usage examples
  - Write: Release notes
  - Prepare: Migration guide if needed

## 📊 Acceptance Criteria

### ✅ Functional Requirements
- [ ] Browser opens and waits for user commands
- [ ] AI agent executes each step in browser successfully
- [ ] Before/after screenshots captured for every step
- [ ] All artifacts stored in user's `test-recorder/` folder
- [ ] Each step has individual folder with metadata
- [ ] Session file contains complete recording information
- [ ] Generated test file works with existing CLI commands
- [ ] "stop"/"done" command closes browser and finalizes recording
- [ ] Generated test runs like any other Endorphin test

### ✅ Technical Requirements
- [ ] No duplicate `rl.close()` calls or similar bugs
- [ ] Proper error handling for all failure scenarios
- [ ] Clean file/folder naming conventions
- [ ] Comprehensive step metadata in JSON format
- [ ] Screenshot timing works correctly (before/after)
- [ ] Generated test follows Endorphin format exactly
- [ ] CLI integration works with all expected commands

### ✅ Quality Requirements
- [ ] Unit test coverage > 80% for TestRecorder class
- [ ] Integration tests cover main workflows
- [ ] Manual testing passes all scenarios
- [ ] Documentation is complete and accurate
- [ ] Code follows project style guidelines
- [ ] Performance is acceptable for typical usage

## 🎯 Implementation Notes

### Directory Structure After Implementation
```
user-project/
├── test-recorder/                    # ✅ User recording artifacts
│   └── QE-015-1703234567890/        # ✅ Session folder
│       ├── session.json             # ✅ Session metadata
│       ├── steps.json               # ✅ All steps data
│       ├── generated-test.js        # ✅ Test copy
│       └── steps/                   # ✅ Individual steps
│           ├── 001-navigate/        # ✅ Step folder
│           │   ├── step-info.json   # ✅ Step metadata
│           │   ├── before.png       # ✅ Before screenshot
│           │   └── after.png        # ✅ After screenshot
│           └── 002-click-button/    # ✅ Next step
├── tests/                           # ✅ Generated tests
│   └── recorded-qe-015.js          # ✅ Runnable test
└── endorphin.config.js
```

### Key Commands After Implementation
```bash
# Start recording
npm run test:record

# Run generated test
npm run test:single QE-015

# List all tests (including recorded)
npm run test:list
```

---

**📅 Estimated Timeline: 1-2 weeks**
**🏃‍♂️ Can be completed incrementally - each phase builds on the previous**
**✅ Each checkbox can be tested independently**
