# Development Environment Setup Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

This guide provides comprehensive instructions for setting up a development environment for **Endorphin AI framework development**. This is for contributors and maintainers, not end users.

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows (with WSL)
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 5GB free space for dependencies and build artifacts

### Required Accounts

- **GitHub Account**: For repository access and contributions
- **OpenAI Account**: For API key (testing AI features)
- **npm Account**: For publishing (maintainers only)

## Initial Setup

### 1. Clone Repository

```bash
# Clone the framework repository
git clone https://github.com/andrewnovykov/endorphin-ai.git
cd endorphin-ai

# Verify you're on the correct branch
git branch
git checkout develop  # Main development branch
```

### 2. Node.js Environment

#### Using Node Version Manager (Recommended)

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify versions
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x or higher
```

#### Direct Installation

```bash
# Verify Node.js version
node --version  # Must be v18.0.0+

# If older version, download from https://nodejs.org/
# Or use package manager:

# macOS (Homebrew)
brew install node@20

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows (Chocolatey)
choco install nodejs
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 4. Environment Configuration

#### Create Environment File

```bash
# Create .env file for development
cat > .env << 'EOF'
# Development environment
NODE_ENV=development

# OpenAI API (for testing AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Debug settings
ENDORPHIN_DEBUG=verbose
DEBUG=endorphin:*

# Browser settings (for framework testing)
HEADLESS=false
DEVTOOLS=true

# Base URL for testing
BASE_URL=https://example.com
EOF
```

#### API Key Setup

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key

2. **Update .env file**:
   ```bash
   # Replace placeholder with actual key
   sed -i 's/your_openai_api_key_here/sk-your-actual-key/' .env
   ```

### 5. Build and Verify Setup

```bash
# Build TypeScript to JavaScript
npm run build

# Verify build output
ls -la dist/bin/endorphin.js      # Should exist
ls -la dist/framework/index.js    # Should exist

# Run development tests
npm test

# Verify CLI works
./dist/bin/endorphin.js --version
```

## Development Tools Setup

### 1. VS Code Configuration

#### Install VS Code

```bash
# macOS (Homebrew)
brew install --cask visual-studio-code

# Ubuntu/Debian
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code

# Windows
# Download from https://code.visualstudio.com/
```

#### Install Recommended Extensions

```bash
# Open project in VS Code
code .

# Install extensions (VS Code will prompt automatically)
# Or install manually:
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension orta.vscode-jest
code --install-extension ms-vscode.vscode-node-extension-pack
```

#### Configure VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.sourceFileMap": {
    "../framework/*": "./framework/*"
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-src-file"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": false,
    "**/.git": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### 2. Git Configuration

```bash
# Configure Git (if not done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up pre-commit hooks (optional)
npm install --save-dev husky
npx husky add .husky/pre-commit "npm test"
```

### 3. Browser Setup for Testing

```bash
# Install Playwright browsers
npx playwright install

# Verify browser installation
npx playwright --version
```

## Development Workflow Setup

### 1. Build Scripts

```bash
# Watch mode for development
npm run build:watch

# Clean build
npm run build:clean

# Type checking only
npm run type-check
```

### 2. Testing Setup

```bash
# Run all tests
npm test

# Watch mode for tests
npm run test:watch

# Coverage reports
npm run test:coverage

# Package testing
npm run test:package
```

### 3. Quality Tools

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Combined quality check
npm run quality
npm run quality:fix
```

## Framework Development Structure

### Directory Overview

```
endorphin-ai/
├── framework/                 # Core framework source (TypeScript)
│   ├── index.ts              # Main framework entry
│   ├── core/                 # Framework components
│   ├── cli/                  # CLI command handlers
│   ├── tools/                # Browser automation tools
│   ├── types/                # TypeScript definitions
│   └── reporters/            # Report generation
├── bin/                      # CLI entry points (TypeScript)
├── dev-tests/                # Framework testing
│   ├── development/          # Jest tests
│   └── package-tests/        # Bash integration tests
├── dist/                     # Compiled JavaScript output
├── examples/                 # User template files
└── doc/                      # Documentation
```

### Key Configuration Files

- **`package.json`** - Project configuration and scripts
- **`tsconfig.json`** - TypeScript compilation settings
- **`jest.config.js`** - Testing configuration
- **`eslint.config.js`** - Code quality rules
- **`.env`** - Environment variables (local development)

## Development Commands

### Daily Development

```bash
# Start development with watch mode
npm run build:watch

# In another terminal, run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- dev-tests/development/unit/config-loader.test.ts

# Test CLI locally
npx tsx bin/endorphin.ts --version
npx tsx bin/endorphin.ts run test HEALTH-001
```

### Before Committing

```bash
# Quality checks
npm run type-check
npm run lint
npm run test
npm run build

# Package testing
cd dev-tests/package-tests && ./run-all-tests.sh
```

## Troubleshooting

### Common Issues

#### Node.js Version Conflicts

```bash
# Check current version
node --version

# Switch to correct version
nvm use 20

# Set as default
nvm alias default 20
```

#### Permission Errors

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use nvm to avoid global installs
nvm use 20
```

#### Build Failures

```bash
# Clean and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build:clean
```

#### Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Reset test environment
rm -rf dev-tests/package-tests/results
npm test
```

#### TypeScript Errors

```bash
# Restart TypeScript service in VS Code
# Command palette: "TypeScript: Restart TS Server"

# Check tsconfig.json
npm run type-check
```

### Environment Verification

```bash
# Verify complete setup
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Git: $(git --version)"
echo "OpenAI API Key: ${OPENAI_API_KEY:0:8}..."

# Test framework build
npm run build && echo "✅ Build successful"

# Test CLI
./dist/bin/endorphin.js --version && echo "✅ CLI working"

# Test development tests
npm test && echo "✅ Tests passing"

# Test package integration
cd dev-tests/package-tests && ./run-all-tests.sh && echo "✅ Package tests passing"
```

## Performance Optimization

### Development Performance

```bash
# Use incremental builds
npm run build:watch

# Limit Jest workers for memory
npm test -- --maxWorkers=2

# Use SSD for better I/O performance
# Move project to SSD if on HDD
```

### Memory Management

```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=8192"

# Clear build cache periodically
rm -rf dist/ .tsbuildinfo
```

## Advanced Setup

### Multiple Node.js Versions

```bash
# Test with multiple Node.js versions
nvm install 18 && nvm use 18 && npm test
nvm install 20 && nvm use 20 && npm test
nvm install 22 && nvm use 22 && npm test
```

### Docker Development Environment

```dockerfile
# Dockerfile.dev
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build framework
RUN npm run build

# Expose port for debugging
EXPOSE 9229

CMD ["npm", "test"]
```

```bash
# Build and run development container
docker build -f Dockerfile.dev -t endorphin-dev .
docker run -v $(pwd):/app -p 9229:9229 endorphin-dev
```

### Remote Development

```bash
# SSH into remote machine
ssh user@remote-server

# Clone and setup on remote
git clone https://github.com/andrewnovykov/endorphin-ai.git
cd endorphin-ai
npm install
npm run build

# Use VS Code Remote SSH extension
# Or use remote port forwarding for debugging
ssh -L 9229:localhost:9229 user@remote-server
```

## Related Documentation

- 📖 [Development-Guide.md](./Development-Guide.md) - Development workflow and practices
- 📖 [VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md) - Debugging setup and techniques
- 📖 [Testing-Guide.md](./Testing-Guide.md) - Complete testing overview
- 📖 [Framework-Architecture.md](./Framework-Architecture.md) - Framework design and structure
- 📖 [Maintainers-Guide.md](./Maintainers-Guide.md) - Comprehensive maintainer documentation

This setup guide ensures you have a robust development environment for contributing to Endorphin AI! 🚀