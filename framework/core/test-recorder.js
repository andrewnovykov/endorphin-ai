import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interactive Test Recorder
 * Records user interactions and generates test files
 */
export class TestRecorder {
  constructor(framework, testData = {}) {
    this.framework = framework;
    this.testData = testData;
    this.steps = [];
    this.stepCounter = 0;
    this.recordingId = null;
    this.recordingPath = null;
    this.screenshotsPath = null;
    this.isRecording = false;
  }

  /**
   * Start recording session
   */
  async startRecording() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5) + 'Z';
    this.recordingId = `${this.testData.id || 'INTERACTIVE-TEST'}_${timestamp}`;
    
    // Create recording directories
    const rootPath = path.resolve(__dirname, '../../');
    this.recordingPath = path.join(rootPath, 'test-recorder', this.recordingId);
    this.screenshotsPath = path.join(this.recordingPath, 'screenshots');
    
    await fs.mkdir(this.recordingPath, { recursive: true });
    await fs.mkdir(this.screenshotsPath, { recursive: true });
    
    this.isRecording = true;
    this.stepCounter = 0;
    this.steps = [];
    
    console.log(`🎬 Recording started: ${this.recordingId}`);
    console.log(`📁 Recording path: ${this.recordingPath}`);
    
    return this.recordingId;
  }

  /**
   * Record a step with tool call and screenshot
   */
  async recordStep(prompt, toolName, toolParams, result) {
    if (!this.isRecording) return;
    
    this.stepCounter++;
    const stepId = `step-${this.stepCounter}`;
    
    // Take screenshot before and after action
    const screenshotBefore = await this.takeScreenshot(`${stepId}-before`);
    
    const step = {
      id: stepId,
      stepNumber: this.stepCounter,
      timestamp: new Date().toISOString(),
      prompt: prompt,
      tool: {
        name: toolName,
        params: toolParams
      },
      result: result,
      screenshots: {
        before: screenshotBefore
      }
    };
    
    // Take screenshot after action (with small delay)
    await this.framework.page.waitForTimeout(1000);
    const screenshotAfter = await this.takeScreenshot(`${stepId}-after`);
    step.screenshots.after = screenshotAfter;
    
    this.steps.push(step);
    
    // Log to console
    console.log(`\n📝 Step ${this.stepCounter}: ${prompt}`);
    console.log(`🔧 Tool: ${toolName}`);
    console.log(`📸 Screenshots: ${screenshotBefore}, ${screenshotAfter}`);
    
    // Show visual feedback in browser
    await this.showBrowserFeedback(stepId, prompt, toolName);
    
    return step;
  }

  /**
   * Take screenshot and save to recording folder
   */
  async takeScreenshot(filename) {
    try {
      const screenshotPath = path.join(this.screenshotsPath, `${filename}.png`);
      await this.framework.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      return `${filename}.png`;
    } catch (error) {
      console.log(`⚠️ Screenshot failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Show visual feedback in browser
   */
  async showBrowserFeedback(stepId, prompt, toolName) {
    try {
      await this.framework.page.evaluate((data) => {
        // Remove previous feedback
        const existing = document.querySelector('#test-recorder-feedback');
        if (existing) existing.remove();
        
        // Create feedback overlay
        const overlay = document.createElement('div');
        overlay.id = 'test-recorder-feedback';
        overlay.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        `;
        
        overlay.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">🎬 Recording Step ${data.stepId}</div>
          <div style="margin-bottom: 5px;"><strong>Action:</strong> ${data.prompt}</div>
          <div><strong>Tool:</strong> ${data.toolName}</div>
        `;
        
        // Add animation keyframes if not exists
        if (!document.querySelector('#recorder-styles')) {
          const style = document.createElement('style');
          style.id = 'recorder-styles';
          style.textContent = `
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => overlay.remove(), 300);
          }
        }, 3000);
        
      }, { stepId, prompt, toolName });
    } catch (error) {
      // Browser feedback is optional, don't fail if it doesn't work
    }
  }

  /**
   * Stop recording and generate test file
   */
  async stopRecording() {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    
    // Save session data
    const sessionData = {
      recordingId: this.recordingId,
      testData: this.testData,
      steps: this.steps,
      timestamp: new Date().toISOString(),
      totalSteps: this.stepCounter
    };
    
    // Save test session
    await fs.writeFile(
      path.join(this.recordingPath, 'test-session.json'),
      JSON.stringify(sessionData, null, 2)
    );
    
    // Generate summary
    const summary = {
      id: this.testData.id,
      name: this.testData.name,
      description: this.testData.description,
      site: this.testData.site,
      totalSteps: this.stepCounter,
      duration: new Date().toISOString(),
      recordingPath: this.recordingPath
    };
    
    await fs.writeFile(
      path.join(this.recordingPath, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Generate test file
    await this.generateTestFile();
    
    console.log(`\n✅ Recording completed: ${this.recordingId}`);
    console.log(`📁 Artifacts saved to: ${this.recordingPath}`);
    console.log(`🧪 Test file generated in tests/ folder`);
    
    return {
      recordingId: this.recordingId,
      recordingPath: this.recordingPath,
      steps: this.stepCounter,
      testData: this.testData
    };
  }

  /**
   * Generate test file in tests/ folder
   */
  async generateTestFile() {
    const testId = this.testData.id || 'QE-NEW';
    const filename = `${testId.toLowerCase()}-recorded-test.js`;
    const testPath = path.resolve(__dirname, '../../tests', filename);
    
    // Build task from recorded steps
    const taskSteps = this.steps.map(step => {
      const toolName = step.tool.name;
      const params = step.tool.params;
      
      switch (toolName) {
        case 'navigate':
          return `Navigate to ${params.url}.`;
        case 'click':
          return `Click on "${params.selector || 'element'}".`;
        case 'fill':
          return `Fill "${params.selector || 'field'}" with "${params.value}".`;
        case 'clearField':
          return `Clear field "${params.selector}".`;
        case 'wait':
          return `Wait ${params.time || 1000}ms.`;
        case 'screenshot':
          return `Take screenshot.`;
        default:
          return step.prompt;
      }
    }).join(' ');
    
    const testContent = `// ${testId}: ${this.testData.name}
// Description: ${this.testData.description}
// Priority: ${this.testData.priority || 'Medium'}
// Tags: ${(this.testData.tags || []).join(', ')}
// Generated by Test Recorder: ${this.recordingId}

export const ${testId.replace(/-/g, '')} = {
  "id": "${testId}",
  "name": "${this.testData.name}",
  "description": "${this.testData.description}",
  "priority": "${this.testData.priority || 'Medium'}",
  "tags": ${JSON.stringify(this.testData.tags || [], null, 4)},
  "site": "${this.testData.site}",
  "testData": ${JSON.stringify(this.testData.testData || {}, null, 4)},
  "task": "${taskSteps} STOP - test completed.",
  "recordingId": "${this.recordingId}",
  "recordedSteps": ${this.stepCounter}
};
`;
    
    await fs.writeFile(testPath, testContent);
    console.log(`📝 Test file created: ${filename}`);
    
    return testPath;
  }
}
