# Deployment Guide for Endorphin AI

## Package Status
- ✅ **endorphin-ai v0.7.4** - Main framework package (WORKING)
- ✅ **create-endorphin-ai v0.7.4** - Project creator package (WORKING)

## ✅ v0.7.4 Success
**All CLI commands now work correctly after fixing ES module issues:**
- `npx endorphin-ai --version` ✅
- `npx endorphin-ai --help` ✅  
- `npx endorphin-ai init` ✅
- `npx create-endorphin-ai my-project` ✅

## Pre-Deployment Checklist

### 1. Build & Test
```bash
# Build the framework
npm run build

# Run tests
npm run test:unit

# Test installation locally
npm run test:install
```

### 2. Verify Binary Configuration
- ✅ `package.json` has correct bin configuration:
  ```json
  "bin": {
    "endorphin": "./dist/bin/endorphin.js",
    "endorphin-ai": "./dist/bin/endorphin.js"
  }
  ```
- ✅ Binary files have proper shebang: `#!/usr/bin/env node`
- ✅ Build script makes binaries executable: `chmod +x dist/bin/endorphin.js`

### 3. Package Files Verification
- ✅ `files` array includes all necessary files:
  ```json
  "files": [
    "dist/",
    "examples/",
    "scripts/",
    "README.md",
    "LICENSE.md",
    "MIGRATION-GUIDE.md"
  ]
  ```

## Deployment Steps

### Step 1: Publish Main Package
```bash
# Make sure you're logged in to npm
npm whoami

# Publish endorphin-ai
npm publish

# Test immediately after publish
npx endorphin-ai@latest --version
```

### Step 2: Publish Creator Package
```bash
cd create-endorphin-ai

# Publish create-endorphin-ai
npm publish

# Test immediately after publish
npx create-endorphin-ai@latest --help
```

### Step 3: End-to-End Verification
```bash
# Test the complete flow
npx create-endorphin-ai test-project
cd test-project
npx endorphin-ai --version
npx endorphin-ai init
```

## Post-Deployment Testing

### Test Commands for End Users

1. **Project Creation**:
   ```bash
   npx create-endorphin-ai my-tests
   cd my-tests
   ```

2. **Framework Commands**:
   ```bash
   npx endorphin-ai --version
   npx endorphin-ai --help
   npx endorphin-ai init
   npx endorphin-ai run test HEALTH-001
   ```

3. **Global Installation**:
   ```bash
   npm install -g endorphin-ai
   endorphin-ai --version
   ```

## Package Structure After Build

```
dist/
├── bin/
│   ├── endorphin.js           # Main CLI (executable)
│   └── cli-handlers.js        # CLI handlers
├── framework/
│   ├── index.js               # Main entry point
│   ├── core/                  # Core modules
│   ├── tools/                 # Browser tools
│   ├── reporters/             # Test reporters
│   ├── types/                 # TypeScript definitions
│   └── templates/             # HTML templates
└── examples/                  # Example files
```

## Troubleshooting

### Binary Not Executable
```bash
# Fix permissions after build
chmod +x dist/bin/endorphin.js
```

### Import Issues
```bash
# Ensure fix-imports script runs
node scripts/fix-imports.js
```

### npx Resolution Issues
- Ensure package is published with correct name
- Clear npx cache: `npx --clear-cache`
- Check package exists: `npm view endorphin-ai`

## Release Notes for v0.7.0

### New Features
- ✅ **Dual Command Support**: Both `npx endorphin` and `npx endorphin-ai` work
- ✅ **Project Creator**: `npx create-endorphin-ai` for one-command setup
- ✅ **TypeScript First**: Full TypeScript codebase with type safety
- ✅ **Resolved npm Conflicts**: Avoids conflict with existing "endorphin" package

### Installation Methods
1. **Quick Start**: `npx create-endorphin-ai my-tests`
2. **Manual Install**: `npm install --save-dev endorphin-ai`
3. **Global Install**: `npm install -g endorphin-ai`

### Breaking Changes
- None - Full backward compatibility maintained

## Success Criteria
- [ ] `npx endorphin-ai --version` returns version number
- [ ] `npx create-endorphin-ai test` creates working project
- [ ] Global installation works: `npm install -g endorphin-ai`
- [ ] End users can run tests without issues
- [ ] No npm resolution conflicts