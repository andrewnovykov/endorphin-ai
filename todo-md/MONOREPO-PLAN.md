# Endorphin AI Monorepo Structure Plan

## Current Issues
- Import path errors due to complex relative paths
- Monolithic framework structure
- Test failures due to missing file references

## Proposed Package Structure (inspired by Playwright)

```
packages/
├── core/                    # @endorphin-ai/core
│   ├── src/
│   │   ├── config/         # Configuration management
│   │   ├── discovery/      # Test discovery
│   │   └── types/          # TypeScript definitions
│   └── package.json
│
├── browser/                 # @endorphin-ai/browser  
│   ├── src/
│   │   ├── automation/     # Browser automation
│   │   ├── agents/         # AI agent setup
│   │   └── session/        # Test session management
│   └── package.json
│
├── recorder/                # @endorphin-ai/recorder
│   ├── src/
│   │   ├── interactive/    # Interactive test recorder
│   │   ├── generator/      # Test code generation
│   │   └── ui/            # Recording UI
│   └── package.json
│
├── runner/                  # @endorphin-ai/runner
│   ├── src/
│   │   ├── executor/       # Test execution
│   │   ├── parallel/       # Parallel execution
│   │   └── reporting/      # Test reporting
│   └── package.json
│
├── web-ui/                  # @endorphin-ai/web-ui
│   ├── src/
│   │   ├── server/         # Web server
│   │   ├── frontend/       # React frontend
│   │   └── api/           # REST API
│   └── package.json
│
├── tools/                   # @endorphin-ai/tools
│   ├── src/
│   │   ├── content/        # Content tools
│   │   ├── interaction/    # Interaction tools
│   │   ├── navigation/     # Navigation tools
│   │   └── verification/   # Verification tools
│   └── package.json
│
└── cli/                     # @endorphin-ai/cli (main package)
    ├── src/
    │   ├── commands/       # CLI commands
    │   ├── init/          # Project initialization
    │   └── bin/           # CLI binaries
    └── package.json
```

## Benefits
1. **Clear boundaries** - Each package has a single responsibility
2. **Better testing** - Each package can be tested independently  
3. **Improved imports** - Clean package-based imports instead of relative paths
4. **Easier maintenance** - Focused development and debugging
5. **Selective installation** - Users can install only needed packages

## Migration Strategy
1. **Phase 1** - Fix current import issues and add linting
2. **Phase 2** - Create package structure without breaking changes
3. **Phase 3** - Migrate code to packages while maintaining backward compatibility
4. **Phase 4** - Update imports and remove deprecated paths

## Example New Imports
```javascript
// Instead of: import { configLoader } from '../../../framework/core/config-loader.js'
import { configLoader } from '@endorphin-ai/core';

// Instead of: import { TestRecorder } from '../../interactive/enhanced-interactive-recorder.js'  
import { TestRecorder } from '@endorphin-ai/recorder';

// Instead of: import { BrowserFramework } from '../core/browser-framework.js'
import { BrowserFramework } from '@endorphin-ai/browser';
```

## Implementation Notes
- Use workspace configuration in package.json
- Maintain backward compatibility during transition
- Update all tests to use new import structure
- Create proper package.json for each package with correct exports
