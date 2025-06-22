// Endorphin e2e AI test framework>
// Copyright (C)  2025 Redstudio Agency

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

// Test AI Agent with Improved Context and Tools
import { EnhancedBrowserTestFramework } from './framework/index.js';

async function testImprovedAIAgent() {
  console.log('🧪 Testing Improved AI Agent with Better Context');
  
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    // Initialize framework
    console.log('\n🚀 Initializing framework...');
    await framework.initialize();
    
    // Navigate to the test site first
    console.log('\n🌐 Navigating to test site...');
    await framework.tools.navigate({ url: 'https://qafromla.herokuapp.com/' });
    
    // Test AI agent with click command
    console.log('\n🧪 Test: AI Agent Click Command');
    const result = await framework.runTask(
      'Click on "Log In" button',
      'AI Agent Click Test'
    );
    
    console.log('✅ Click test result:', result.status);
    console.log('📊 Result details:', result.result);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await framework.cleanup();
  }
}

testImprovedAIAgent().catch(console.error);
