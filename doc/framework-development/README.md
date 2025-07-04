# Framework Development Documentation

_Last Updated: July 4, 2025 - v0.9.0_

This directory contains comprehensive documentation for **Endorphin AI framework development**, contribution, and maintenance. These guides are for developers working on the framework itself, not end users.

> **For End Users**: See [doc/user-guide/](../user-guide/) for user documentation.

## 📋 Documentation Index

### 🚀 Getting Started

- **[Contributing-Guide.md](./Contributing-Guide.md)** - Complete guide for new contributors (start here!)
- **[Development-Environment-Setup-Guide.md](./Development-Environment-Setup-Guide.md)** - Complete environment setup for contributors
- **[Development-Guide.md](./Development-Guide.md)** - Development workflow and practices  
- **[Maintainers-Guide.md](./Maintainers-Guide.md)** - Comprehensive guide for maintainers

### 🏗️ Architecture & Design

- **[Framework-Architecture.md](./Framework-Architecture.md)** - Framework design, components, and data flow

### 🧪 Testing

- **[Testing-Guide.md](./Testing-Guide.md)** - Main testing overview and hub
- **[Development-Testing-Guide.md](./Development-Testing-Guide.md)** - Automated Jest testing during development
- **[Package-Testing-Guide.md](./Package-Testing-Guide.md)** - Manual tarball testing before publishing
- **[Post-Install-Testing-Guide.md](./Post-Install-Testing-Guide.md)** - Published npm package validation

### 🔧 Tools & Debugging

- **[VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md)** - VS Code setup and debugging techniques

### 🚀 Deployment & CI/CD

- **[CI-CD-Guide.md](./CI-CD-Guide.md)** - Continuous integration and deployment
- **[NPM-Publishing-Guide.md](./NPM-Publishing-Guide.md)** - Step-by-step npm publishing process

## 🎯 Quick Navigation by Role

### New Contributors

1. [Contributing-Guide.md](./Contributing-Guide.md) - **Start here!** Complete contribution workflow
2. [Development-Environment-Setup-Guide.md](./Development-Environment-Setup-Guide.md) - Set up your development environment
3. [Development-Guide.md](./Development-Guide.md) - Learn the development workflow
4. [Framework-Architecture.md](./Framework-Architecture.md) - Understand the framework design
5. [Testing-Guide.md](./Testing-Guide.md) - Learn the testing approach

### Framework Maintainers

1. [Maintainers-Guide.md](./Maintainers-Guide.md) - Comprehensive maintainer documentation
2. [NPM-Publishing-Guide.md](./NPM-Publishing-Guide.md) - Publishing process
3. [CI-CD-Guide.md](./CI-CD-Guide.md) - CI/CD pipeline management

### Quality Assurance

1. [Testing-Guide.md](./Testing-Guide.md) - Complete testing overview
2. [Development-Testing-Guide.md](./Development-Testing-Guide.md) - Development testing
3. [Package-Testing-Guide.md](./Package-Testing-Guide.md) - Package validation
4. [Post-Install-Testing-Guide.md](./Post-Install-Testing-Guide.md) - Published package testing

## 📚 Framework Overview

**Endorphin AI** is a TypeScript-first browser automation testing framework that uses AI agents to execute natural language test instructions.

### Key Technologies

- **TypeScript** → **JavaScript** (development → production)
- **Playwright** for browser automation
- **OpenAI GPT-4o** for AI-powered testing
- **LangChain** for AI agent management
- **Jest** for automated testing
- **Node.js** runtime environment

### Framework Structure

```
endorphin-ai/
├── framework/                 # Core framework source (TypeScript)
├── bin/                      # CLI entry points
├── dev-tests/                # Framework testing infrastructure
├── dist/                     # Compiled JavaScript output
├── examples/                 # User template files
└── doc/                      # Documentation
    ├── user-guide/           # End-user documentation
    └── framework-development/ # This directory
```

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Set up environment (first time)
# See: Development-Environment-Setup-Guide.md

# 2. Start development
npm run build:watch          # Watch TypeScript compilation
npm run test:watch           # Watch tests

# 3. Make changes
# Edit framework/ files
# Write/update tests in dev-tests/

# 4. Validate changes
npm run type-check           # TypeScript validation
npm run lint                 # Code quality
npm test                     # Development tests
npm run test:package         # Package integration tests
```

### Before Publishing

```bash
# See: NPM-Publishing-Guide.md for complete process
npm run build
npm test
cd dev-tests/package-tests && ./run-all-tests.sh
npm version patch|minor|major
npm publish
```

## 🧪 Testing Strategy

The framework uses a multi-tier testing approach:

1. **Development Tests** (`dev-tests/development/`) - Jest tests for TypeScript source
2. **Package Tests** (`dev-tests/package-tests/`) - Manual tarball testing with bash scripts
3. **Post-Install Tests** - Published npm package validation

See [Testing-Guide.md](./Testing-Guide.md) for complete details.

## 📖 Version Information

- **Current Version**: v0.9.0
- **Node.js Support**: v18.0.0+
- **TypeScript Version**: v5.8+
- **Target Environment**: Node.js (ESM modules)

## 🤝 Contributing

**New to the project?** Start with our comprehensive [Contributing-Guide.md](./Contributing-Guide.md) which covers:

1. **🔍 Finding issues** to work on
2. **🍴 Forking** the repository  
3. **🏗️ Setting up** development environment
4. **💻 Making changes** and following best practices
5. **✅ Testing** your contributions
6. **📤 Creating** pull requests
7. **🎉 Getting** your changes merged

**Quick workflow**:
1. **Read**: [Contributing-Guide.md](./Contributing-Guide.md) - Complete contribution process
2. **Setup**: [Development-Environment-Setup-Guide.md](./Development-Environment-Setup-Guide.md) - Environment setup
3. **Code**: [Development-Guide.md](./Development-Guide.md) - Development practices
4. **Test**: [Testing-Guide.md](./Testing-Guide.md) - Testing approach
5. **Debug**: [VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md) - Debugging techniques

## 🔗 External Resources

- **Repository**: https://github.com/andrewnovykov/endorphin-ai
- **npm Package**: https://www.npmjs.com/package/endorphin-ai
- **Documentation**: This directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

_This documentation is maintained by the Endorphin AI development team. For questions or improvements, please open an issue or pull request._