# Package Testing (End-User Perspective)

*Last Updated: June 24, 2025*

This directory contains **package tests** that verify Endorphin AI works correctly from an end-user perspective. These tests create real user projects and test the complete user workflow.

## 🎯 Purpose

Package tests ensure the **published package works correctly** for end users:
- ✅ Installation via npm works
- ✅ CLI commands function properly  
- ✅ Configuration loading works
- ✅ File isolation is maintained
- ✅ All user workflows are tested

**Coverage Goal: 100% user journey coverage**

## � Directory Structure

```
package-tests/
├── README.md                    # This file
├── run-all-tests.sh            # 🔥 Main test runner with logging
├── quick-test.sh               # Essential tests only (fast)
├── view-results.sh             # View test results and logs
├── cleanup-results.sh          # Clean old test results
├── scripts/                    # Test scripts organized by category
│   ├── core/                   # Core functionality tests
│   ├── cli/                    # CLI command tests
│   ├── recorder/               # Test recorder tests
│   ├── reporter/               # Reporter tests  
│   ├── web-runner/             # Web UI tests
│   └── utils/                  # Utility tests
├── results/                    # Test results and logs
│   ├── logs/                   # Individual test run logs
│   └── .gitignore              # Ignore log files
├── tmp/                        # Generated test projects
│   └── test-endorphin/         # User project for testing
└── package.json                # Package test dependencies
```

## � Available Scripts

| Script | Purpose |
|--------|---------|
| `setup-user-project.sh` | Create real user project environment |
| `quick-commands.sh` | Run essential package tests |
| `test-recorder-location.sh` | Verify file isolation (critical) |
| `test-web-ui.sh` | Test web interface |
| `test-init-command.sh` | Test project initialization |

## 💡 Usage Examples

```bash
# Create user project and test basic functionality
cd tests/package-tests
./bash-scripts/setup-user-project.sh
./bash-scripts/quick-commands.sh

# Test from user project directly
cd tmp/test-endorphin
npx endorphin --version
npx endorphin list
npx endorphin run test USER-001
```

---

**� For comprehensive testing documentation, see:** `doc/framework-development/testting/`
