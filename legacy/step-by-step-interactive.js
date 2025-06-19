#!/usr/bin/env node

// Step-by-Step Interactive Test Builder
import { EnhancedBrowserTestFramework } from './enhanced-test-framework.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

class StepByStepInteractiveBuilder {
  constructor() {
    this.framework = null;
    this.testSteps = [];
    this.testMetadata = {};
    this.currentStep = 0;
    this.testData = {};
  }

  async initialize() {
    this.framework = new EnhancedBrowserTestFramework();
    await this.framework.initialize();
    await this.framework.enableInteractiveMode(); // Enable recording for step-by-step mode
  }

  async collectTestMetadata() {
    console.log('\n🎯 Step-by-Step Interactive Test Builder');
    console.log('═'.repeat(50));
    console.log('First, let\'s set up your test metadata:\n');

    // Get next QE number
    const nextQENumber = await this.getNextQENumber();
    
    this.testMetadata.id = await askQuestion(`Test ID (default: QE-${nextQENumber.toString().padStart(3, '0')}): `) || `QE-${nextQENumber.toString().padStart(3, '0')}`;
    this.testMetadata.name = await askQuestion('Test Name: ');
    this.testMetadata.description = await askQuestion('Test Description: ');
    this.testMetadata.priority = await askQuestion('Priority (High/Medium/Low, default: Medium): ') || 'Medium';
    this.testMetadata.site = await askQuestion('Starting URL: ');
    
    // Tags
    const tagsInput = await askQuestion('Tags (comma-separated, e.g., login,authentication): ');
    this.testMetadata.tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Test data
    const needsTestData = await askQuestion('Do you need test data (email, password, etc.)? (y/n): ');
    if (needsTestData.toLowerCase() === 'y' || needsTestData.toLowerCase() === 'yes') {
      console.log('\nEnter test data (press Enter to skip a field):');
      this.testData.uid = `test_user_${this.testMetadata.id.toLowerCase().replace('-', '_')}`;
      this.testData.email = await askQuestion('Email: ');
      this.testData.password = await askQuestion('Password: ');
      this.testData.firstName = await askQuestion('First Name: ');
      this.testData.lastName = await askQuestion('Last Name: ');
      
      // Remove empty fields
      Object.keys(this.testData).forEach(key => {
        if (!this.testData[key]) delete this.testData[key];
      });
    }

    console.log('\n📋 Test Metadata Collected:');
    console.log(`ID: ${this.testMetadata.id}`);
    console.log(`Name: ${this.testMetadata.name}`);
    console.log(`Description: ${this.testMetadata.description}`);
    console.log(`Priority: ${this.testMetadata.priority}`);
    console.log(`Site: ${this.testMetadata.site}`);
    console.log(`Tags: ${this.testMetadata.tags.join(', ')}`);
    if (Object.keys(this.testData).length > 0) {
      console.log(`Test Data: ${JSON.stringify(this.testData, null, 2)}`);
    }
  }

  async getNextQENumber() {
    const testsDir = path.join(process.cwd(), 'tests');
    if (!fs.existsSync(testsDir)) return 1;
    
    const files = fs.readdirSync(testsDir);
    const qeNumbers = files
      .filter(file => file.startsWith('QE-') && file.endsWith('.js'))
      .map(file => {
        const match = file.match(/QE-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    return qeNumbers.length > 0 ? Math.max(...qeNumbers) + 1 : 1;
  }

  async runStepByStepMode() {
    console.log('\n🚀 Starting Step-by-Step Test Execution');
    console.log('═'.repeat(50));
    console.log('Give me one instruction at a time. I\'ll execute it and wait for your next step.');
    console.log('Type "done" when you\'ve completed all test steps.');
    console.log('Type "help" to see available commands.');
    console.log('\nAvailable tools:');
    console.log('• navigate - Go to a URL');
    console.log('• click - Click any element');
    console.log('• fill - Fill input fields');
    console.log('• wait - Wait for time or elements');
    console.log('• screenshot - Take screenshots');
    console.log('• verify - Verify elements exist');
    console.log('• getPageContent - Get page content');
    console.log('\n💡 Example: "Navigate to https://example.com"');
    console.log('💡 Example: "Click the Login button"');
    console.log('💡 Example: "Fill email field with test@example.com"');

    // Initial navigation if site is provided
    if (this.testMetadata.site) {
      console.log(`\n🌍 Auto-navigating to: ${this.testMetadata.site}`);
      await this.executeStep(`Navigate to ${this.testMetadata.site}`);
    }

    while (true) {
      this.currentStep++;
      console.log(`\n📝 Step ${this.currentStep}:`);
      
      const instruction = await askQuestion('Your instruction (or "done" to finish): ');
      
      if (instruction.toLowerCase() === 'done') {
        console.log('\n✅ Test steps completed!');
        break;
      }
      
      if (instruction.toLowerCase() === 'help') {
        this.showHelp();
        this.currentStep--; // Don't count help as a step
        continue;
      }

      if (instruction.toLowerCase() === 'screenshot') {
        await this.executeStep('Take a screenshot for documentation');
        continue;
      }

      if (instruction.trim() === '') {
        console.log('⚠️ Please provide an instruction');
        this.currentStep--;
        continue;
      }

      await this.executeStep(instruction);
    }
  }

  showHelp() {
    console.log('\n🛠️ Available Commands:');
    console.log('━'.repeat(40));
    console.log('Navigation:');
    console.log('  "Navigate to https://example.com"');
    console.log('  "Go to https://example.com/login"');
    console.log('');
    console.log('Clicking:');
    console.log('  "Click the Login button"');
    console.log('  "Click on Sign Up"');
    console.log('  "Click submit"');
    console.log('');
    console.log('Filling Forms:');
    console.log('  "Fill email field with test@example.com"');
    console.log('  "Fill password field with mypassword"');
    console.log('  "Type Hello World in the search box"');
    console.log('');
    console.log('Waiting:');
    console.log('  "Wait 3 seconds"');
    console.log('  "Wait for login form to appear"');
    console.log('');
    console.log('Verification:');
    console.log('  "Verify login was successful"');
    console.log('  "Check if dashboard is visible"');
    console.log('  "Verify page title contains Welcome"');
    console.log('');
    console.log('Documentation:');
    console.log('  "screenshot" - Take a screenshot');
    console.log('  "get page content" - Analyze current page');
    console.log('');
    console.log('Special:');
    console.log('  "done" - Finish test and generate file');
    console.log('  "help" - Show this help');
  }

  async executeStep(instruction) {
    console.log(`\n⚡ Executing: ${instruction}`);
    
    try {
      // Create a simple task with stop condition
      const task = `${instruction}. STOP - step completed.`;
      
      // Record the step
      this.testSteps.push({
        stepNumber: this.currentStep,
        instruction: instruction,
        timestamp: new Date().toISOString()
      });

      // Create a temporary test for this step
      const stepTest = {
        id: `STEP-${this.currentStep}`,
        name: `Step ${this.currentStep}: ${instruction}`,
        description: `Interactive step: ${instruction}`,
        priority: 'Medium',
        tags: ['interactive', 'step-by-step'],
        site: this.testMetadata.site || '',
        testData: this.testData,
        task: task
      };

      const result = await this.framework.runSingleTest(stepTest);
      
      if (result.success) {
        console.log(`✅ Step ${this.currentStep} completed successfully!`);
        if (result.session && result.session.steps.length > 0) {
          const lastStep = result.session.steps[result.session.steps.length - 1];
          if (lastStep.result) {
            console.log(`📊 Result: ${lastStep.result}`);
          }
        }
      } else {
        console.log(`❌ Step ${this.currentStep} failed: ${result.error}`);
        const retry = await askQuestion('Would you like to retry this step? (y/n): ');
        if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
          this.currentStep--; // Reset step counter for retry
          this.testSteps.pop(); // Remove failed step
          await this.executeStep(instruction);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error executing step: ${error.message}`);
      const retry = await askQuestion('Would you like to retry this step? (y/n): ');
      if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
        this.currentStep--;
        this.testSteps.pop();
        await this.executeStep(instruction);
      }
    }
  }

  async generateTestFile() {
    console.log('\n📝 Generating Test File...');
    
    // Create the task description from all steps
    const taskDescription = this.testSteps
      .map(step => step.instruction)
      .join('. ') + '. STOP - test completed.';

    // Create the test object
    const testObject = {
      id: this.testMetadata.id,
      name: this.testMetadata.name,
      description: this.testMetadata.description,
      priority: this.testMetadata.priority,
      tags: this.testMetadata.tags,
      site: this.testMetadata.site,
      ...(Object.keys(this.testData).length > 0 && { testData: this.testData }),
      task: taskDescription
    };

    // Generate the export name (e.g., QE001 from QE-001)
    const exportName = this.testMetadata.id.replace(/[^A-Z0-9]/g, '');

    // Create the file content
    const fileContent = `// ${this.testMetadata.id}: ${this.testMetadata.name}
// Description: ${this.testMetadata.description}
// Priority: ${this.testMetadata.priority}
// Tags: ${this.testMetadata.tags.join(', ')}

export const ${exportName} = ${JSON.stringify(testObject, null, 2)};`;

    // Save to tests directory
    const testsDir = path.join(process.cwd(), 'tests');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    const filename = `${this.testMetadata.id.toLowerCase()}-${this.testMetadata.name.toLowerCase().replace(/\s+/g, '-')}-test.js`;
    const filepath = path.join(testsDir, filename);
    
    fs.writeFileSync(filepath, fileContent);

    console.log('\n🎉 Test File Generated Successfully!');
    console.log('═'.repeat(50));
    console.log(`📁 File: tests/${filename}`);
    console.log(`🆔 Test ID: ${this.testMetadata.id}`);
    console.log(`📝 Name: ${this.testMetadata.name}`);
    console.log(`🔢 Total Steps: ${this.testSteps.length}`);
    console.log('\n📋 Generated Test Steps:');
    this.testSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.instruction}`);
    });

    console.log('\n🚀 You can now run this test with:');
    console.log(`   npm run enhanced:test -- --test ${this.testMetadata.id}`);
    console.log(`   node enhanced-test-framework.js --test ${this.testMetadata.id}`);

    return filepath;
  }

  async cleanup() {
    if (this.framework) {
      await this.framework.close();
    }
    rl.close();
  }
}

async function main() {
  const builder = new StepByStepInteractiveBuilder();
  
  try {
    await builder.initialize();
    await builder.collectTestMetadata();
    await builder.runStepByStepMode();
    await builder.generateTestFile();
    
  } catch (error) {
    console.error('❌ Error in step-by-step mode:', error.message);
  } finally {
    await builder.cleanup();
  }
}

main().catch(console.error);
