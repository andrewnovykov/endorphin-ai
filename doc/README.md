# Documentation Overview

_Last Updated: July 4, 2025 - v0.9.0_

This directory contains comprehensive documentation for the Endorphin AI framework, organized for different audiences.

## 📚 Documentation Structure

### 👥 For Users ([user-guide/](user-guide/))
- **[Quick Start Guide](user-guide/Quick-Start.md)** - Get started in minutes
- **[Project Setup Guide](user-guide/Project-Setup-Guide.md)** - Complete project setup instructions
- **[Test Structure Guide](user-guide/Test-Structure-Guide.md)** - Learn v0.9 test structure with setup/data functions
- **[Test Writing Tips](user-guide/Test-Writing-Tips.md)** - Enterprise & small app examples
- **[Prompt Guide](user-guide/Prompt-Guide.md)** - Advanced AI prompting techniques
- **[HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)** - Interactive reports with cost tracking
- **[Test Recorder Guide](user-guide/Test-Recorder.md)** - Recording test workflows interactively
- **[Environment Variables Guide](user-guide/Environment-Variables-Guide.md)** - Configure your environment
- **[Global Setup Guide](user-guide/Global-Setup-Guide.md)** - Run setup code before tests
- **[VS Code Debugging Guide](user-guide/VSCode-Debugging-Guide.md)** - Debug tests in VS Code
- **[CI/CD Setup Guide](user-guide/CI-CD-Setup-Guide.md)** - GitHub Actions integration

### 🔧 For Developers & Contributors ([framework-development/](framework-development/))
- **[Framework Architecture](framework-development/Framework-Architecture.md)** - Technical architecture overview
- **[Development Guide](framework-development/Development-Guide.md)** - Framework development workflow
- **[Contributing Guide](framework-development/Contributing-Guide.md)** - Contribution process (fork → develop → PR)
- **[Development Environment Setup](framework-development/Development-Environment-Setup-Guide.md)** - Complete dev environment setup
- **[Testing Guide](framework-development/Testing-Guide.md)** - Multi-tier testing strategy overview
- **[Development Testing Guide](framework-development/Development-Testing-Guide.md)** - Jest automated testing
- **[Package Testing Guide](framework-development/Package-Testing-Guide.md)** - Manual tarball testing
- **[Post-Install Testing Guide](framework-development/Post-Install-Testing-Guide.md)** - NPM package validation
- **[NPM Publishing Guide](framework-development/NPM-Publishing-Guide.md)** - Step-by-step publishing process
- **[CI/CD Guide](framework-development/CI-CD-Guide.md)** - Framework CI/CD pipeline
- **[Maintainers Guide](framework-development/Maintainers-Guide.md)** - Framework maintenance
- **[VS Code Debugging Guide](framework-development/VSCode-Debugging-Guide.md)** - Development debugging setup

### For AI Assistants
- **[CLAUDE.md](../CLAUDE.md)** - AI assistant development instructions

## 🎯 Quick Navigation

### I want to...

#### Use Endorphin AI
→ Start with [Quick Start Guide](user-guide/Quick-Start.md)

#### Set up my first project
→ Follow [Project Setup Guide](user-guide/Project-Setup-Guide.md)

#### Write better tests
→ Read [Test Structure Guide](user-guide/Test-Structure-Guide.md) and [Test Writing Tips](user-guide/Test-Writing-Tips.md)

#### Understand test reports
→ Read [HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)

#### Record test workflows
→ Check [Test Recorder Guide](user-guide/Test-Recorder.md)

#### Understand the architecture
→ Review [Framework Architecture](framework-development/Framework-Architecture.md)

#### Contribute to development
→ Start with [Contributing Guide](framework-development/Contributing-Guide.md) and [CLAUDE.md](../CLAUDE.md)

#### Release a new version
→ Follow [NPM Publishing Guide](framework-development/NPM-Publishing-Guide.md)

#### Debug framework issues
→ Use [VS Code Debugging Guide](framework-development/VSCode-Debugging-Guide.md)

#### Debug user tests
→ Use [VS Code Debugging Guide](user-guide/VSCode-Debugging-Guide.md)

## 🆕 What's New in v0.9.0

### Major Improvements
- **🔧 Smart Test Structure**: New async `setup` and `data` functions for dynamic test preparation
- **📝 Complete Documentation Rewrite**: User-friendly guides with enterprise & small app examples
- **🎯 Simplified Setup**: Easier project initialization and configuration
- **🖼️ Enhanced HTML Reports**: Interactive reports with cost tracking and AI decision history
- **🔍 Comprehensive Testing Examples**: Real-world patterns for all application types
- **🚀 CI/CD Integration**: Ready-to-use GitHub Actions workflows
- **🐛 Professional Debugging**: VS Code integration with debug object access

### Key Features
- **TypeScript-first development** with JavaScript distribution
- **Interactive HTML reports** with full functionality
- **Test recorder** for creating tests by demonstration
- **Global setup** for environment preparation
- **Cross-platform compatibility** (Windows, macOS, Linux)
- **Multi-browser support** via Playwright
- **AI-powered test execution** with OpenAI integration

## 📋 Version Information

- **Current Version**: v0.9.0
- **Node.js Support**: 18.x, 20.x, 22.x
- **Platform Support**: Windows, macOS, Linux
- **TypeScript Version**: 5.8+

## 🔗 External Resources

- **[Main Repository](https://github.com/andrewnovykov/endorphin-ai)** - Source code and issues
- **[NPM Package](https://www.npmjs.com/package/endorphin-ai)** - Published package
- **[Playwright Documentation](https://playwright.dev/)** - Browser automation
- **[OpenAI API](https://platform.openai.com/docs)** - AI integration
- **[LangChain Documentation](https://langchain.readthedocs.io/)** - AI tool framework

## 🎯 Documentation Standards

### For Contributors
When updating documentation:

1. **Keep it current** - Update version numbers and dates
2. **Be user-focused** - Write for your audience (user vs developer)
3. **Include examples** - Show, don't just tell
4. **Test instructions** - Verify all commands work
5. **Cross-reference** - Link to related documentation

### File Naming
- Use kebab-case for filenames
- Include version numbers for release-specific guides
- Group by audience (user-guide/, framework-development/)

### Content Structure
- Start with overview and purpose
- Include quick examples
- Provide detailed explanations
- End with troubleshooting and next steps

## 🚀 Getting Started

### For New Users
1. Read [Quick Start Guide](user-guide/Quick-Start.md)
2. Follow [Project Setup Guide](user-guide/Project-Setup-Guide.md)
3. Learn test writing with [Test Structure Guide](user-guide/Test-Structure-Guide.md)
4. Try the HTML reporter with [HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)

### For New Contributors
1. Read [Contributing Guide](framework-development/Contributing-Guide.md) for the complete workflow
2. Set up environment with [Development Environment Setup Guide](framework-development/Development-Environment-Setup-Guide.md)
3. Review [Framework Architecture](framework-development/Framework-Architecture.md)
4. Study [Development Guide](framework-development/Development-Guide.md)
5. Read [CLAUDE.md](../CLAUDE.md) for AI assistant guidelines

### For New Maintainers
1. Understand [Maintainers Guide](framework-development/Maintainers-Guide.md)
2. Learn [NPM Publishing Guide](framework-development/NPM-Publishing-Guide.md)
3. Review [Testing Guide](framework-development/Testing-Guide.md) and all testing strategies

---

**Happy testing with Endorphin AI! 🧪✨**

_For questions or improvements, please create an issue in the main repository._