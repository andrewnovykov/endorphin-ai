# User Guide - Endorphin AI

_Last Updated: July 4, 2025 - v0.9.0_

Welcome to **Endorphin AI** - the TypeScript-first browser automation testing framework that uses AI agents to execute natural language test instructions. This guide collection will help you get started, write effective tests, and make the most of the framework.

> **For Contributors**: See [doc/framework-development/](../framework-development/) for framework development documentation.

## 🚀 Getting Started

### New to Endorphin AI?

**Start here** for your journey with AI-powered testing:

1. **[Quick-Start.md](./Quick-Start.md)** - Get up and running in minutes
2. **[Project-Setup-Guide.md](./Project-Setup-Guide.md)** - Set up your first project
3. **[Test-Structure-Guide.md](./Test-Structure-Guide.md)** - Learn the v0.9 test structure
4. **[Test-Writing-Tips.md](./Test-Writing-Tips.md)** - Write better tests

### Quick Reference

```bash
# Install Endorphin AI
npm install endorphin-ai

# Initialize project
npx endorphin init

# Run tests
npx endorphin run test all

# Generate reports
npx endorphin generate report
```

## 📚 Complete Guide Index

### 🏗️ Setup & Configuration

- **[Quick-Start.md](./Quick-Start.md)** - Get started in minutes
- **[Project-Setup-Guide.md](./Project-Setup-Guide.md)** - Complete project setup
- **[Environment-Variables-Guide.md](./Environment-Variables-Guide.md)** - Environment configuration
- **[Global-Setup-Guide.md](./Global-Setup-Guide.md)** - Run code before all tests

### ✍️ Writing Tests

- **[Test-Structure-Guide.md](./Test-Structure-Guide.md)** - v0.9 test structure with setup/data functions
- **[Test-Writing-Tips.md](./Test-Writing-Tips.md)** - **Enterprise & small app examples**
- **[Test-Recorder.md](./Test-Recorder.md)** - Interactive test creation
- **[Prompt-Guide.md](./Prompt-Guide.md)** - Advanced AI prompting techniques

### 📊 Reports & Analysis

- **[HTML-Reporter-Guide.md](./HTML-Reporter-Guide.md)** - Interactive reports with cost tracking

### 🛠️ Development Tools

- **[VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md)** - VS Code debugging setup

### 🚀 Deployment & CI/CD

- **[CI-CD-Setup-Guide.md](./CI-CD-Setup-Guide.md)** - GitHub Actions integration

## 🎯 Learning Paths

### Beginner Path

**Goal**: Create and run your first AI-powered test

1. [Quick-Start.md](./Quick-Start.md) - Install and basic setup
2. [Project-Setup-Guide.md](./Project-Setup-Guide.md) - Create your project
3. [Test-Writing-Tips.md](./Test-Writing-Tips.md) - **See enterprise & small app examples**
4. [HTML-Reporter-Guide.md](./HTML-Reporter-Guide.md) - View your results

**Estimated time**: 30 minutes

### Intermediate Path

**Goal**: Master test structure and AI prompting

1. [Test-Structure-Guide.md](./Test-Structure-Guide.md) - Learn smart test structure
2. [Prompt-Guide.md](./Prompt-Guide.md) - Advanced AI prompting
3. [Test-Recorder.md](./Test-Recorder.md) - Interactive test creation
4. [Global-Setup-Guide.md](./Global-Setup-Guide.md) - Advanced configuration

**Estimated time**: 2 hours

### Advanced Path

**Goal**: Set up professional workflows and optimization

1. [Environment-Variables-Guide.md](./Environment-Variables-Guide.md) - Advanced configuration
2. [VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md) - Development workflow
3. [CI-CD-Setup-Guide.md](./CI-CD-Setup-Guide.md) - Automated testing
4. **Performance optimization** and **cost management**

**Estimated time**: 4 hours

## 🔧 Common Workflows

### Creating Your First Test

```bash
# 1. Initialize project
npx endorphin init

# 2. Write a simple test
# Edit tests/my-first-test.ts

# 3. Run the test
npx endorphin run test my-first-test

# 4. View results
npx endorphin generate report
```

### Recording Interactive Tests

```bash
# Start test recorder
npx endorphin run test-recorder

# Follow prompts to record actions
# Test file automatically generated
```

### Setting Up CI/CD

```bash
# 1. Create GitHub Actions workflow
# See: CI-CD-Setup-Guide.md

# 2. Add secrets (OPENAI_API_KEY)
# 3. Tests run automatically on push
```

## 🆕 What's New in v0.9.0

### Smart Test Structure

New async functions for dynamic tests:

```typescript
export const SMART_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Smart Test',
  description: 'Test with setup and data',
  priority: 'High',
  tags: ['smart'],
  
  setup: async () => ({
    baseUrl: process.env.TEST_URL || 'https://example.com',
    timestamp: new Date().toISOString()
  }),
  
  data: async () => ({
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!'
  }),
  
  task: async (data, setupData) => `
    Navigate to ${setupData.baseUrl}/login
    Fill email with ${data.email}
    Fill password with ${data.password}
    Click Submit
    Verify welcome message
  `
};
```

### Enhanced HTML Reports

- **💰 Cost tracking** per test and step
- **🧠 AI decision history** showing agent reasoning
- **📊 Token usage analysis** with pricing breakdown
- **🔍 Interactive filtering** and search

### Built-in Tools System

12 comprehensive browser automation tools:
- **Navigation**: URL handling and routing
- **Content Analysis**: Page content extraction and optimization
- **Interaction**: Click, fill, clear operations
- **Verification**: Element validation and information
- **Utilities**: Wait, screenshot, and helpers

## 📖 Quick Reference

### Essential Commands

```bash
# Project Management
npx endorphin init              # Initialize new project
npx endorphin list             # List available tests

# Test Execution
npx endorphin run test TEST-ID  # Run specific test
npx endorphin run test all      # Run all tests
npx endorphin run test --tag smoke  # Run tests by tag

# Test Creation
npx endorphin run test-recorder # Interactive test recording

# Reporting
npx endorphin generate report   # Generate HTML report
npx endorphin list tools       # Show available tools
```

### Configuration Files

- **`endorphin.config.ts`** - Main configuration
- **`.env`** - Environment variables (OPENAI_API_KEY)
- **`global-setup.ts`** - Global setup code (optional)
- **`tests/`** - Your test files directory

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_api_key_here

# Optional
HEADLESS=true                   # Run in headless mode
BASE_URL=https://myapp.com     # Override test URLs
ENDORPHIN_DEBUG=verbose        # Enable debug output
```

## 🆘 Need Help?

### Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not found" | Set `OPENAI_API_KEY` in `.env` file |
| "Command not found" | Run `npm install endorphin-ai` |
| Tests failing | Check `HEADLESS=false` for visual debugging |
| Slow performance | Review [HTML-Reporter-Guide.md](./HTML-Reporter-Guide.md) for cost optimization |

### Getting Support

1. **Check the guides** - Most questions are answered here
2. **GitHub Issues** - Report bugs or request features
3. **GitHub Discussions** - Community help and questions
4. **Examples** - Check the `examples/` directory in your project

## 🔗 Related Resources

- **Framework Development**: [doc/framework-development/](../framework-development/) - For contributors
- **GitHub Repository**: https://github.com/andrewnovykov/endorphin-ai
- **npm Package**: https://www.npmjs.com/package/endorphin-ai

## 📋 Version Compatibility

- **Current Version**: v0.9.0
- **Node.js**: v18.0.0+ required
- **TypeScript**: v5.8+ recommended  
- **Browsers**: Chrome, Firefox, Safari (via Playwright)

---

**Ready to get started?** Begin with [Quick-Start.md](./Quick-Start.md) and start building AI-powered tests in minutes! 🚀

_This documentation is maintained by the Endorphin AI team. Found an issue or have suggestions? Open an issue on GitHub!_