// Endorphin e2eimport { EnhancedBrowserTestFramework } from './index.js';

// Re-export the framework for compatibility
export { EnhancedBrowserTestFramework };

// Export test discovery functions for CLI
export { 
  runSingleTestById,
  runTestsByTag, 
  runTestsByPriority,
  runAllTests,
  listAvailableTests
} from '../packages/core/src/discovery/test-discovery.js';ework
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

import { EnhancedBrowserTestFramework } from './index.js';

// Re-export the framework for compatibility
export { EnhancedBrowserTestFramework };

// Export test discovery functions for CLI
export { 
  runSingleTestById,
  runTestsByTag, 
  runTestsByPriority,
  runAllTests,
  listAllTests
} from './core/test-discovery.js';
