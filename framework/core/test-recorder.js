// Endorphin e2e AI test framework
// Copyright (C) 2025 Redstudio Agency

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.


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
    this.stepsPath = null;
    this.isRecording = false;
    this.startTime = null;
  }

  /**
   * Start recording session
   */
  async startRecording() {
    this.startTime = new Date();
    const timestamp = Date.now();
    this.recordingId = `${this.testData.id || 'REC'}-${timestamp}`;
    
    // Create recording directories in USER project (not framework)
    this.recordingPath = path.join(process.cwd(), 'test-recorder', this.recordingId);
    this.stepsPath = path.join(this.recordingPath, 'steps');
    
    await fs.mkdir(this.recordingPath, { recursive: true });
    await fs.mkdir(this.stepsPath, { recursive: true });
    
    this.isRecording = true;
    this.stepCounter = 0;
    this.steps = [];
    
    console.log('Recording session:', this.recordingId);
    console.log('Artifacts will be saved to:', this.recordingPath);
    
    return this.recordingId;
  }

  /**
   * Record a step with tool call and screenshot
   */
  async recordStep(description, type, data, result) {
    if (!this.isRecording) return;
    
    this.stepCounter++;
    const stepId = String(this.stepCounter).padStart(3, '0');
    const stepFolderName = `${stepId}-${this.sanitizeFileName(description)}`;
    const stepPath = path.join(this.stepsPath, stepFolderName);
    
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
    
    console.log(`Step ${this.stepCounter} recorded: ${description}`);
    
    // Show visual feedback in browser  
    await this.showBrowserFeedback(this.stepCounter, description, type);
    
    return stepInfo;
  }

  /**
   * Sanitize filename for step folders
   */
  sanitizeFileName(description) {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }

  /**
   * Show visual feedback in browser
   */
  async showBrowserFeedback(stepId, description, type) {
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
          <div style="font-weight: bold; margin-bottom: 8px;">Recording Step ${data.stepId}</div>
          <div style="margin-bottom: 5px;"><strong>Action:</strong> ${data.description}</div>
          <div><strong>Type:</strong> ${data.type}</div>
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
        
      }, { stepId, description, type });
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
    
    console.log('Recording completed:', this.recordingId);
    console.log('Artifacts saved to:', this.recordingPath);
    console.log('Test file generated in tests/ folder');
    
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
    
    // Ensure tests directory exists
    const testsDir = path.join(process.cwd(), 'tests');
    await fs.mkdir(testsDir, { recursive: true });
    
    const testPath = path.join(testsDir, filename);
    
    // Build task from recorded steps
    const taskSteps = this.steps.map(step => {
      // For now, use generic descriptions until we implement proper task building
      return step.description;
    }).join(' ');
    
    // Add "recorded" tag if not already present
    const tags = this.testData.tags || [];
    if (!tags.includes('recorded')) {
      tags.push('recorded');
    }
    
    const exportName = testId.replace(/-/g, '_');
    
    const testContent = `// ${testId}: ${this.testData.name}
// Description: ${this.testData.description}
// Priority: ${this.testData.priority || 'Medium'}
// Tags: ${tags.join(', ')}
// Generated by Test Recorder: ${this.recordingId}

export const ${exportName} = {
  "id": "${testId}",
  "name": "${this.testData.name}",
  "description": "${this.testData.description}",
  "priority": "${this.testData.priority || 'Medium'}",
  "tags": ${JSON.stringify(tags, null, 4)},
  "site": "${this.testData.site}",
  "testData": ${JSON.stringify(this.testData.testData || {}, null, 4)},
  "task": "${taskSteps} STOP - test completed.",
  "recordingId": "${this.recordingId}",
  "recordedSteps": ${this.stepCounter}
};
`;
    
    await fs.writeFile(testPath, testContent);
    console.log('Test file created:', filename);
    
    return testPath;
  }
}
