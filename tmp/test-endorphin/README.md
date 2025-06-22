# Endorphin AI User Project Test Environment

This directory simulates a real user project to test the Endorphin AI package from the user's perspective.

## 🎯 Purpose

Test that:
- ✅ Package installs correctly from local repository
- ✅ Test recorder creates files in USER project (not framework)
- ✅ All CLI commands work from user project perspective
- ✅ Environment variables are properly inherited
- ✅ Configuration works as expected

## 🚀 Quick Start

### 1. Setup the Environment
```bash
./setup-user-project.sh
```

### 2. Test the Test Recorder Location
```bash
./test-recorder.sh
```

### 3. Test Running Tests
```bash
./run-test.sh USER-001
```

### 4. Use Quick Commands
```bash
./quick-commands.sh
```

## 📋 Available Scripts

| Script | Purpose |
|--------|---------|
| `setup-user-project.sh` | Initialize/reset the user project environment |
| `test-recorder.sh` | Verify test recorder creates files in correct location |
| `run-test.sh <test-id>` | Run a specific test |
| `quick-commands.sh` | Convenient shortcuts for all operations |

## 🧪 Test Scenarios

### Scenario 1: Package Installation
```bash
./quick-commands.sh setup
./quick-commands.sh status
```

### Scenario 2: Test Discovery
```bash
./quick-commands.sh list
```

### Scenario 3: Test Recording
```bash
./quick-commands.sh recorder
# Check that files are created in ./test-recorder/ (not framework)
```

### Scenario 4: Test Execution
```bash
./quick-commands.sh run USER-001
```

### Scenario 5: File Location Verification
```bash
./quick-commands.sh test-location
```

## 📁 Expected Directory Structure

After running tests, you should see:

```
tmp/test-endorphin/               # User project (THIS directory)
├── .env                          # Environment variables (copied from main repo)
├── endorphin.config.js           # User configuration
├── package.json                  # User project manifest
├── node_modules/
│   └── endorphin-ai/             # Installed package
├── tests/                        # User's test files
│   └── user-basic-test.js
├── test-recorder/                # ✅ Recording artifacts (USER project)
│   └── REC-[timestamp]/
│       ├── test-session.json
│       ├── summary.json
│       └── steps/
└── test-results/                 # Test execution results

../../test-recorder/              # Framework directory
                                  # ✅ Should remain EMPTY
```

## 🔍 Verification Points

### ✅ Success Indicators
- [ ] Package installs without errors
- [ ] `npx endorphin --version` works
- [ ] `npx endorphin list` discovers tests
- [ ] Test recorder creates `./test-recorder/` in USER project
- [ ] Framework `test-recorder/` directory remains empty
- [ ] Generated tests appear in `./tests/` directory
- [ ] Environment variables work correctly

### ❌ Failure Indicators
- [ ] Package fails to install
- [ ] CLI commands don't work
- [ ] Test recorder creates files in framework directory
- [ ] Missing environment variables
- [ ] Configuration not loaded properly

## 🔧 Environment Setup

The setup script automatically:
1. Creates a fresh npm project
2. Installs endorphin-ai from local repository
3. Copies `.env` from main repo (including OPENAI_API_KEY)
4. Creates user configuration file
5. Sets up convenient npm scripts
6. Creates sample test files

## 💡 Usage Tips

### Quick Commands Examples
```bash
# Setup everything
./quick-commands.sh setup

# List all available tests
./quick-commands.sh list

# Run specific test
./quick-commands.sh run USER-001

# Start test recorder
./quick-commands.sh recorder

# Check project status
./quick-commands.sh status

# Clean up generated files
./quick-commands.sh clean
```

### Manual Testing
```bash
# Test CLI directly
npx endorphin --version
npx endorphin list
npx endorphin run test USER-001
npx endorphin run test-recorder

# Check file locations
ls -la test-recorder/           # Should have recordings
ls -la ../../test-recorder/     # Should be empty
```

## 🐛 Troubleshooting

### "Package not found"
```bash
# Reinstall from local repository
npm install ../../
```

### "API key not set"
```bash
# Check environment variables
cat .env
# Copy from main repo if needed
cp ../../.env .env
```

### "Test recorder files in wrong location"
```bash
# Run verification script
./test-recorder.sh
```

### "Tests not discovered"
```bash
# Check test format
cat tests/user-basic-test.js
# Verify exports are correct
```

---

This test environment ensures that the Endorphin AI package works correctly from a user's perspective and that all files are created in the appropriate locations.
