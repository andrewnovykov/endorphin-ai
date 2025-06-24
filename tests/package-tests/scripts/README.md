# Package Test Scripts

This directory contains organized test scripts for package testing by category.

## 📁 Directory Structure

```
scripts/
├── core/           # Core functionality tests
├── cli/            # CLI command tests  
├── recorder/       # Test recorder tests
├── reporter/       # Reporter output tests
├── web-runner/     # Web UI and API tests
└── utils/          # Utility and edge case tests
```

## 🚀 Usage

### Run via Main Test Runner (Recommended)
```bash
# From package-tests directory
./run-all-tests.sh                    # Run all tests
./run-all-tests.sh --category core    # Run specific category
./quick-test.sh                       # Run essential tests only
```

### Run Individual Scripts
```bash
# Core tests
./scripts/core/setup-user-project.sh
./scripts/core/run-test.sh

# CLI tests  
./scripts/cli/test-init-command.sh
./scripts/cli/quick-commands.sh

# Recorder tests (CRITICAL)
./scripts/recorder/test-recorder-location.sh

# And so on...
```

## 📊 Categories

### 🔧 Core (`core/`)
- Essential package functionality
- User project setup and basic operations
- Test discovery and search

### 🖥️ CLI (`cli/`) 
- Command line interface testing
- Project initialization
- Error handling

### 🎬 Recorder (`recorder/`)
- Test recorder functionality
- **CRITICAL**: File isolation testing

### 📋 Reporter (`reporter/`)
- Console output formatting
- HTML report generation
- All reporter types

### 🌐 Web Runner (`web-runner/`)
- Web UI testing
- API endpoint testing
- Dashboard functionality

### 🛠️ Utils (`utils/`)
- Utility functions
- Edge case testing
- Quick fixes and patches

## 📝 Script Requirements

All scripts should:
- ✅ Be executable (`chmod +x`)
- ✅ Start with `#!/bin/bash`
- ✅ Use `set -e` for error handling  
- ✅ Include descriptive output with emojis
- ✅ Clean up any temporary files/directories
- ✅ Exit with appropriate status codes

## 🔄 Adding New Tests

1. Choose appropriate category directory
2. Create script with descriptive name
3. Make executable: `chmod +x script-name.sh`
4. Add to main test runner in `../run-all-tests.sh`
5. Test with dry-run: `../run-all-tests.sh --category CATEGORY --dry-run`
