# Post-Install Testing

Post-install testing validates the Endorphin AI framework after it has been
**published to npm**. These tests ensure that users can successfully install and
use the published package.

## Known Issues

### Version 0.4.1 Published Package Bug

**Issue**: Version 0.4.1 published to npm contains a critical bug where the CLI
binary has a hardcoded path that only works from the original development
environment.

**Symptoms**:

```bash
$ npx endorphin-ai@0.4.1 --version
Error: ENOENT: no such file or directory, open '/Users/papapin777/Documents/CODE/AI/package.json'
```

**Root Cause**: The `bin/endorphin.ts` file in the published package uses a
hardcoded relative path that doesn't resolve correctly when installed via npm.

**Workaround**: The post-install tests for version 0.4.1 skip `--version`
commands and use `--help` instead to test basic functionality.

**Resolution**: This will be fixed in version 0.4.2 by properly resolving
package.json paths relative to the installed package location.

## Overview

Post-install tests download and test the framework from the **published npm
package** (`npm install endorphin-ai`), simulating the real user experience
after the package is live on npm.

## Key Differences from Pre-Release Tests

| Test Type        | Package Source                                     | Purpose                                        | When to Run                        |
| ---------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| **Pre-Release**  | Local path (`npm install /path/to/endorphin-ai`)   | Validate current development before publishing | Before release, during development |
| **Post-Install** | Published npm package (`npm install endorphin-ai`) | Validate published package works correctly     | After publishing to npm            |

## Test Structure

```
tests/post-install/
├── readme.md                    # This file
├── package-installation.test.ts # Test npm package installation
├── end-user-scenarios.test.ts   # Test real user workflows
├── interactive-cli.test.ts      # Test interactive CLI features
├── e2e-scenarios.test.ts        # Complete end-to-end scenarios
└── tmp/                         # Temporary test directories
```

## Running Post-Install Tests

### Prerequisites

- Package must be published to npm
- Tests run against the live npm package
- Requires internet connection

# Test CLI functionality

```bash
npx endorphin --help npx endorphin init npx endorphin list npx endorphin test
HEALTH-001 npx endorphin test-recorder npx endorphin generate report npx
endorphin open report
```

### Automated Testing

```bash
# Run all post-install tests
npm run test:post-install

# Run specific post-install test suites
npm test tests/post-install/package-installation.test.ts
npm test tests/post-install/end-user-scenarios.test.ts
```

### Manual Testing

```bash
# Install from npm (published package)
cd /tmp/test-project
npm install endorphin-ai

# Test CLI functionality
npx endorphin --help
npx endorphin init
npx endorphin list
```

## Test Scenarios

### 1. Package Installation from npm

- Install framework from published npm package
- Verify all dependencies are correctly included
- Check CLI commands are available
- Validate TypeScript definitions

### 2. End-User Workflows

- Complete project setup from scratch
- User experience validation
- Documentation accuracy testing
- Error message clarity

### 3. Interactive CLI Features

- Test user prompts and input handling
- Configuration setup workflows
- Help system and documentation
- Cross-platform compatibility

### 4. Complete E2E Scenarios

- Full project lifecycle testing
- Real-world usage patterns
- Performance under normal usage
- Integration with common tools

## Environment Setup

Post-install tests create isolated environments and install from npm:

```bash
# Create test directory
mkdir -p /tmp/endorphin-post-install-test
cd /tmp/endorphin-post-install-test

# Install from npm (published package)
npm init -y
npm install endorphin-ai

# Test functionality
npx endorphin init
npx endorphin list
```

## Validation Checklist

After each npm publish, post-install tests should verify:

- [ ] Package installs from npm without errors
- [ ] All CLI commands work correctly
- [ ] TypeScript declarations are available
- [ ] Framework initializes properly
- [ ] Test discovery finds test files
- [ ] Configuration loading works
- [ ] Browser automation functions
- [ ] AI integration responds correctly
- [ ] Reports generate successfully
- [ ] Error handling is robust
- [ ] Documentation matches reality
- [ ] Version numbers are correct

## CI/CD Integration

Post-install tests should run after successful npm publish:

```yaml
# Example GitHub Actions workflow
name: Post-Install Testing
on:
  release:
    types: [published]

jobs:
  post-install-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Wait for npm propagation
        run: sleep 60 # Allow time for npm to propagate
      - name: Test published package
        run: |
          mkdir -p /tmp/test-install
          cd /tmp/test-install
          npm init -y
          npm install endorphin-ai
          npx endorphin --help
```

## Troubleshooting

### Common Issues

1. **Package Not Found on npm**
   - Verify package was successfully published
   - Check npm registry status
   - Wait for npm propagation (can take minutes)

2. **Version Mismatch**
   - Ensure published version matches expected
   - Check npm cache: `npm cache clean --force`
   - Verify package.json version

3. **Missing Files in Published Package**
   - Check `.npmignore` and `files` field in package.json
   - Verify build process completed successfully
   - Test packaging locally: `npm pack`

4. **Installation Failures**
   - Check dependency compatibility
   - Verify node version requirements
   - Test in clean environment

## Best Practices

1. **Real Environment**: Always test in clean, isolated environments
2. **Version Verification**: Confirm installed version matches published version
3. **User Perspective**: Test from the end-user's point of view
4. **Documentation**: Validate all documentation is accurate
5. **Cleanup**: Clean up test environments after testing

## Related Documentation

- [Pre-Release Testing](../pre-release/readme.md) - Testing local development
  version
- [Development Testing](../development/) - Unit and integration tests
- [Package Testing](../package-tests/) - Package-specific tests
- [Test Architecture](../TEST-ARCHITECTURE.md) - Overall testing strategy
