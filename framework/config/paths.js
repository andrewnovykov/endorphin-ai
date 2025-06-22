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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root directory (go up from framework/config/ to project root)
const projectRoot = path.resolve(__dirname, '..', '..');

export const PATHS = {
  // Project directories
  PROJECT_ROOT: projectRoot,
  TEST_RESULT_DIR: path.join(projectRoot, 'test-result'),
  TEST_RECORDER_DIR: path.join(projectRoot, 'test-recorder'),
  TESTS_DIR: path.join(projectRoot, 'tests'),
  
  // Framework directories
  FRAMEWORK_DIR: path.join(projectRoot, 'framework'),
  TOOLS_DIR: path.join(projectRoot, 'framework', 'tools'),
  CORE_DIR: path.join(projectRoot, 'framework', 'core'),
  CONFIG_DIR: path.join(projectRoot, 'framework', 'config'),
};

export default PATHS;
