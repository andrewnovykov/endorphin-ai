# User Guide - Endorphin AI

_Last Updated: February 14, 2026 - v1.1.0_

Welcome to **Endorphin AI** - the TypeScript-first browser automation testing framework that uses AI agents to execute natural language test instructions. This guide collection will help you get started, write effective tests, and make the most of the framework.

> **For Contributors**: See [framework-development/](../framework-development/) for framework development documentation.

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
npx endorphin-ai init

# Initialize Claude Code integration (optional)
npx endorphin-ai init-claude-skill

# Run tests
npx endorphin-ai run test all

# Generate reports
npx endorphin-ai generate report
```

## 📚 Complete Guide Index

### 🏗️ Setup & Configuration

- **[Quick-Start.md](./Quick-Start.md)** - Get started in minutes
- **[Project-Setup-Guide.md](./Project-Setup-Guide.md)** - Complete project setup
- **[Environment-Variables-Guide.md](./Environment-Variables-Guide.md)** - Environment configuration
- **[Global-Setup-Guide.md](./Global-Setup-Guide.md)** - Run code before all tests
- **[JIRA-Integration-Guide.md](./JIRA-Integration-Guide.md)** - Sync tests from JIRA tickets

### ✍️ Writing Tests

- **[Test-Structure-Guide.md](./Test-Structure-Guide.md)** - v0.9 test structure with setup/data functions
- **[Test-Writing-Tips.md](./Test-Writing-Tips.md)** - **Enterprise & small app examples**
- **[Test-Recorder.md](./Test-Recorder.md)** - Interactive test creation
- **[Claude-Code-Integration.md](./Claude-Code-Integration.md)** - AI-assisted test creation with Claude Code
- **[Prompt-Guide.md](./Prompt-Guide.md)** - Advanced AI prompting techniques

### 📊 Reports & Analysis

- **[HTML-Reporter-Guide.md](./HTML-Reporter-Guide.md)** - Interactive reports with cost tracking

### 🔍 Vision & Verification

- **[Vision-Verification-Guide.md](./Vision-Verification-Guide.md)** - AI-powered screenshot verification setup and usage

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
4. [Claude-Code-Integration.md](./Claude-Code-Integration.md) - AI-assisted test creation
5. [Global-Setup-Guide.md](./Global-Setup-Guide.md) - Advanced configuration

**Estimated time**: 2-3 hours

### Advanced Path

**Goal**: Set up professional workflows and optimization

1. [Environment-Variables-Guide.md](./Environment-Variables-Guide.md) - Advanced configuration
2. [JIRA-Integration-Guide.md](./JIRA-Integration-Guide.md) - Sync tests from JIRA
3. [VSCode-Debugging-Guide.md](./VSCode-Debugging-Guide.md) - Development workflow
4. [CI-CD-Setup-Guide.md](./CI-CD-Setup-Guide.md) - Automated testing
5. **Performance optimization** and **cost management**

**Estimated time**: 5 hours

## 🔧 Common Workflows

### Creating Your First Test

```bash
# 1. Initialize project
npx endorphin-ai init

# 2. Write a simple test
# Edit tests/my-first-test.ts

# 3. Run the test
npx endorphin-ai run test my-first-test

# 4. View results
npx endorphin-ai generate report
```

### Recording Interactive Tests

```bash
# Start test recorder
npx endorphin-ai run test-recorder

# Follow prompts to record actions
# Test file automatically generated
```

### Using Claude Code Integration

```bash
# Initialize Claude Code integration
npx endorphin-ai init-claude-skill

# In Claude Code:
/write-test Create a login test
/fix-test HEALTH-001
/record-test
```

### Setting Up CI/CD

```bash
# 1. Create GitHub Actions workflow
# See: CI-CD-Setup-Guide.md

# 2. Add secrets (OPENAI_API_KEY)
# 3. Tests run automatically on push
```

### Syncing Tests from JIRA

```bash
# 1. Configure JIRA credentials in .env
# See: JIRA-Integration-Guide.md

# 2. Format JIRA tickets with @DATA and @STEPS
# 3. Sync and run JIRA tests
npx endorphin-ai run test --jira-sync TICKET-001
```

## 🆕 What's New in v1.1.0

### Claude Code Integration

AI-assisted test creation and repair:
- **`/write-test` skill** - Create tests by describing what to test
- **`/fix-test` skill** - Analyze and fix failing tests automatically
- **`/record-test` skill** - Launch interactive recorder from Claude Code
- **CLI API** - Programmable test recorder for automation
- **One-command setup** - `npx endorphin-ai init-claude-skill`

See **[Claude-Code-Integration.md](./Claude-Code-Integration.md)** for full details.

### Recorder CLI API

Five new commands for programmatic test creation:
```bash
npx endorphin-ai recorder create    # Create session
npx endorphin-ai recorder add-step  # Add step
npx endorphin-ai recorder generate  # Generate test
npx endorphin-ai recorder list      # List sessions
npx endorphin-ai recorder status    # Get status
```

---

## 🔙 What Was New in v1.0.2

### 28 Browser Automation Tools

Expanded from 12 to 28 tools covering:
- **Navigation**: navigate, navigateBack
- **Content Analysis**: getPageContent, getPageMetadata
- **Interaction**: click, fill, clear, hover, pressKey, selectOption, drag
- **Scroll**: scrollDown, scrollUp, scrollToElement
- **Verification**: verifyElement, verifyText, getElementInfo, verifyListVisible
- **Tabs**: newTab, switchTab, closeTab
- **Utilities**: wait, screenshot, resize
- **Advanced**: fileUpload, evaluate, interceptNetwork

### Multi-Provider AI Support

Choose between AI providers in your config:
```typescript
ai: {
  openai: { modelName: 'gpt-4o' },        // OpenAI
  // OR
  openai: { modelName: 'gemini-2.0-flash' }, // Google Gemini (auto-detected)
}
```

### Vision Verification

AI-powered screenshot verification for all verify tools:
- Auto-highlight bounding boxes on verified elements
- Multi-provider support (GPT-4o, Gemini)
- Two modes: `supplement` (augments DOM) or `primary` (overrides DOM)
- See **[Vision-Verification-Guide.md](./Vision-Verification-Guide.md)**

### Validation Agent with Vision

The validation agent now uses both text analysis AND screenshot confirmation:
- Takes final-state screenshots for visual confirmation
- Adjusts confidence scores based on vision agreement/disagreement
- Configurable via `ai.vision` in endorphin.config.ts

## 📖 Quick Reference

### Essential Commands

```bash
# Project Management
npx endorphin-ai init              # Initialize new project
npx endorphin-ai init-claude-skill # Initialize Claude Code integration
npx endorphin-ai list             # List available tests

# Test Execution
npx endorphin-ai run test TEST-ID  # Run specific test
npx endorphin-ai run test all      # Run all tests
npx endorphin-ai run test --tag smoke  # Run tests by tag
npx endorphin-ai run test --jira-sync TICKET-ID  # Sync and run JIRA test

# Test Creation (Interactive)
npx endorphin-ai run test-recorder # Interactive test recording

# Test Creation (CLI API)
npx endorphin-ai recorder create   # Create recording session
npx endorphin-ai recorder add-step # Add step to session
npx endorphin-ai recorder generate # Generate test file
npx endorphin-ai recorder list     # List all sessions
npx endorphin-ai recorder status   # Get session status

# Reporting
npx endorphin-ai generate report   # Generate HTML report
npx endorphin-ai list tools       # Show available tools
```

### Configuration Files

- **`endorphin.config.ts`** - Main configuration
- **`.env`** - Environment variables (OPENAI_API_KEY)
- **`global-setup.ts`** - Global setup code (optional)
- **`tests/`** - Your test files directory

### Environment Variables

```bash
# Required (one of these depending on provider)
OPENAI_API_KEY=your_api_key_here
GOOGLE_API_KEY=your_gemini_key_here

# Optional
HEADLESS=true                   # Run in headless mode
BASE_URL=https://myapp.com     # Override test URLs
ENDORPHIN_DEBUG=verbose        # Enable debug output

# JIRA Integration (optional)
JIRA_URL=https://company.atlassian.net
JIRA_EMAIL=user@company.com
JIRA_API_TOKEN=your_token_here
JIRA_PROJECT_ID=10001
JIRA_ISSUE_TYPE_ID=10013
JIRA_LABEL=ai-test-case
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

- **Current Version**: v1.1.0
- **Node.js**: v18.0.0+ required
- **TypeScript**: v5.8+ recommended
- **Browsers**: Chrome, Firefox, Safari (via Playwright)
- **AI Providers**: OpenAI (GPT-4o), Google Gemini (gemini-2.0-flash)
- **Claude Code**: Optional integration for AI-assisted test creation

---

**Ready to get started?** Begin with [Quick-Start.md](./Quick-Start.md) and start building AI-powered tests in minutes! 🚀

_This documentation is maintained by the Endorphin AI team. Found an issue or have suggestions? Open an issue on GitHub!_