# Pre-Release Testing Workflow Demo

This document demonstrates the complete pre-release testing workflow for
Endorphin AI.

## Quick Start

### 1. Set up a pre-release test environment

```bash
# Build the project first
npm run build

# Set up local test environment
./tests/pre-release/scripts/setup-local-test.sh

# Or with custom directory
./tests/pre-release/scripts/setup-local-test.sh -d /tmp/my-endorphin-test
```

### 2. Manual testing workflow

```bash
# The setup script will provide you with a test directory
cd /tmp/endorphin-test-20250627-123456

# Test CLI commands
npx endorphin --help
npx endorphin --version
npx endorphin list

# Create additional test files if needed
cat > tests/custom-test.ts << 'EOF'
export const CUSTOM_TEST = {
  id: 'CUSTOM-001',
  name: 'Custom Test Example',
  description: 'A custom test for demonstration',
  priority: 'Medium',
  tags: ['demo', 'custom'],
  site: 'https://example.com',
  task: 'Navigate to the homepage and verify it loads'
};
EOF

# List tests again to see the new test
npx endorphin list

# Test report generation (will show "no results" message)
npx endorphin generate report
```

### 3. Run automated pre-release tests

```bash
# Run all pre-release tests
npm run test:pre-release

# Run specific test suites
npm test tests/pre-release/local-installation.test.ts
npm test tests/pre-release/cli-functionality.test.ts
npm test tests/pre-release/framework-integration.test.ts
npm test tests/pre-release/real-world-scenarios.test.ts
```

### 4. Clean up test environments

```bash
# Clean up temporary test directories
./tests/pre-release/scripts/cleanup-test.sh

# Clean up everything (with confirmation)
./tests/pre-release/scripts/cleanup-test.sh --all

# Force cleanup without confirmation
./tests/pre-release/scripts/cleanup-test.sh --force --all
```

## Pre-Release Testing Scenarios

### Scenario 1: Local Installation Validation

This scenario tests that the local development version can be installed and used
correctly:

```bash
# Create a test project
mkdir -p /tmp/test-local-install
cd /tmp/test-local-install

# Initialize npm project
npm init -y

# Install from local source
npm install /path/to/endorphin-ai

# Verify installation
npx endorphin --version
npx endorphin --help
```

### Scenario 2: CLI Functionality Testing

This scenario tests all CLI commands work with the local version:

```bash
# Initialize Endorphin project
npx endorphin init

# List available tests
npx endorphin list

# Test filtering
npx endorphin list --tag smoke
npx endorphin list --priority High

# Test error handling
npx endorphin run test NON_EXISTENT_TEST
```

### Scenario 3: Framework Integration Testing

This scenario tests that core framework features work correctly:

```bash
# Test configuration loading
node -e "
const { ConfigLoader } = require('endorphin-ai/framework/core/config-loader.js');
const loader = new ConfigLoader();
const config = loader.loadConfig();
console.log('Config loaded successfully:', !!config);
"

# Test reporter functionality
node -e "
const { HtmlReporter } = require('endorphin-ai/framework/reporters/html-reporter.js');
const reporter = new HtmlReporter('./test-results');
console.log('Reporter created successfully:', !!reporter);
"
```

### Scenario 4: Real-World Workflow Testing

This scenario tests complete end-to-end workflows:

```bash
# Complete project setup
npx endorphin init

# Create multiple test files
for i in {1..5}; do
cat > tests/test-$i.ts << EOF
export const TEST_$i = {
  id: 'TEST-$(printf "%03d" $i)',
  name: 'Test File $i',
  description: 'Generated test file $i',
  priority: 'Medium',
  tags: ['generated', 'batch'],
  site: 'https://example.com',
  task: 'Test scenario $i'
};
EOF
done

# Verify all tests are discovered
npx endorphin list
```

## Comparison with Post-Install Testing

| Aspect             | Pre-Release Testing                                | Post-Install Testing                       |
| ------------------ | -------------------------------------------------- | ------------------------------------------ |
| **Package Source** | Local development (`npm install /path/to/project`) | Published npm (`npm install endorphin-ai`) |
| **Purpose**        | Validate before publishing                         | Validate after publishing                  |
| **Environment**    | Development/staging                                | Production-like                            |
| **Speed**          | Faster (no network)                                | Slower (npm download)                      |
| **Use Case**       | Development workflow                               | Release validation                         |

## Best Practices

### 1. Always test before publishing

```bash
# Pre-release testing workflow
npm run build
npm run test:pre-release
./tests/pre-release/scripts/setup-local-test.sh
# Manual validation in test environment
./tests/pre-release/scripts/cleanup-test.sh
```

### 2. Test in isolated environments

- Use temporary directories for testing
- Don't pollute your development environment
- Clean up after testing

### 3. Validate all CLI commands

- Test help and version commands
- Test project initialization
- Test test discovery and listing
- Test error handling scenarios

### 4. Test cross-platform compatibility

```bash
# Test on different platforms
# macOS
./tests/pre-release/scripts/setup-local-test.sh

# Linux (if available)
docker run -it --rm -v $(pwd):/workspace node:18 bash
cd /workspace
./tests/pre-release/scripts/setup-local-test.sh
```

## Troubleshooting

### Common Issues

1. **TypeScript compilation errors**

   ```bash
   npm run build
   npm run type-check
   ```

2. **Test failures due to missing dependencies**

   ```bash
   npm install
   npm run build
   ```

3. **Permission errors in test directories**

   ```bash
   ./tests/pre-release/scripts/cleanup-test.sh --force
   sudo rm -rf /tmp/endorphin-test-*
   ```

4. **Stale test environments**
   ```bash
   ./tests/pre-release/scripts/cleanup-test.sh --all
   ```

### Debug Mode

Run scripts in verbose mode for debugging:

```bash
./tests/pre-release/scripts/setup-local-test.sh --verbose
./tests/pre-release/scripts/cleanup-test.sh --verbose
```

## Integration with CI/CD

Pre-release tests can be integrated into your development workflow:

```yaml
# .github/workflows/pre-release.yml
name: Pre-Release Testing
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  pre-release-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test:pre-release
```

## Next Steps

After successful pre-release testing:

1. **Publish to npm**

   ```bash
   npm version patch  # or minor/major
   npm publish
   ```

2. **Run post-install tests**

   ```bash
   npm run test:post-install
   ```

3. **Validate in production environment**
   - Test installation on clean systems
   - Validate user documentation
   - Check for any platform-specific issues
