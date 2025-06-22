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

import { EnhancedBrowserTestFramework } from '../index.js';

async function testModularFramework() {
  console.log('🧪 Testing Modular Framework...');
  
  const framework = new EnhancedBrowserTestFramework();
  
  try {
    // Initialize framework
    await framework.initialize();
    console.log('✅ Framework initialized successfully');
    
    // Test simple navigation
    const result = await framework.runTask(
      "Navigate to https://httpbin.org. Take a screenshot. Get simple page content to verify the site loaded. STOP - test completed.",
      "Modular Framework Test"
    );
    
    console.log('✅ Test completed:', result.status);
    console.log('📁 Results saved to:', result.sessionDir);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await framework.cleanup();
    console.log('🧹 Framework cleanup completed');
  }
}

// Run the test
testModularFramework().catch(console.error);
