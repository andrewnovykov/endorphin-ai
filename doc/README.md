# Documentation Overview

_Last Updated: February 14, 2026 - v1.1.0_

This directory contains documentation for the Endorphin AI framework.

## For Users ([user-guide/](user-guide/))

- **[Quick Start Guide](user-guide/Quick-Start.md)** - Get started in minutes
- **[Project Setup Guide](user-guide/Project-Setup-Guide.md)** - Complete project setup instructions
- **[Test Structure Guide](user-guide/Test-Structure-Guide.md)** - Learn test structure with setup/data functions
- **[Test Writing Tips](user-guide/Test-Writing-Tips.md)** - Enterprise & small app examples
- **[Prompt Guide](user-guide/Prompt-Guide.md)** - Advanced AI prompting techniques
- **[HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)** - Interactive reports with cost tracking
- **[Test Recorder Guide](user-guide/Test-Recorder.md)** - Recording test workflows interactively
- **[Claude Code Integration](user-guide/Claude-Code-Integration.md)** - AI-assisted test creation and repair
- **[Vision Verification Guide](user-guide/Vision-Verification-Guide.md)** - AI-powered screenshot verification
- **[Environment Variables Guide](user-guide/Environment-Variables-Guide.md)** - Configure your environment
- **[Global Setup Guide](user-guide/Global-Setup-Guide.md)** - Run setup code before tests
- **[Multi-User Testing Guide](user-guide/Multi-User-Testing-Guide.md)** - Test with multiple browser sessions
- **[CI/CD Setup Guide](user-guide/CI-CD-Setup-Guide.md)** - GitHub Actions integration
- **[VS Code Debugging Guide](user-guide/VSCode-Debugging-Guide.md)** - Debug tests in VS Code
- **[JIRA Integration Guide](user-guide/JIRA-Integration-Guide.md)** - Sync tests with JIRA

## Quick Navigation

### I want to...

#### Use Endorphin AI
Start with [Quick Start Guide](user-guide/Quick-Start.md)

#### Set up my first project
Follow [Project Setup Guide](user-guide/Project-Setup-Guide.md)

#### Write better tests
Read [Test Structure Guide](user-guide/Test-Structure-Guide.md) and [Test Writing Tips](user-guide/Test-Writing-Tips.md)

#### Use Claude Code to write tests
Read [Claude Code Integration](user-guide/Claude-Code-Integration.md)

#### Understand test reports
Read [HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)

#### Record test workflows
Check [Test Recorder Guide](user-guide/Test-Recorder.md)

#### Debug user tests
Use [VS Code Debugging Guide](user-guide/VSCode-Debugging-Guide.md)

## What's New in v1.1.0

### Intelligence
- **Auto-inject page context** - Accessibility tree auto-injected before every AI decision
- **Sequential tool execution** - Reliable sequential execution preventing race conditions
- **Fill tool reliability** - 3-tier retry strategy for form input
- **Gemini crash recovery** - Graceful handling of empty candidates from Gemini API
- **Tool cleanup** - Removed redundant tools (28 to 26)

### Vision
- **Vision verification** - AI-powered screenshot verification for all verify tools
- **Auto-highlight bounding box** - Red border on verified elements before screenshot
- **Validation Agent vision** - Test result validation with screenshot confirmation

### Claude Code Integration
- **Recorder CLI** - Programmatic test recording via CLI commands
- **Claude Code skills** - `/write-test`, `/fix-test`, `/record-test` slash commands
- **Autonomous mode** - Claude reads the page and auto-generates test steps

### Bug Fixes
- Bounding box screenshots render correctly with viewport-only capture
- Vision API calls appear in cost report with correct model name
- Navigation tools capture screenshots on error

## Version Information

- **Current Version**: v1.1.0
- **Node.js Support**: 18.x, 20.x, 22.x
- **Platform Support**: Windows, macOS, Linux
- **TypeScript Version**: 5.8+

## External Resources

- **[GitHub Repository](https://github.com/endorphin-ai/endorphin-ai)** - Source code and issues
- **[NPM Package](https://www.npmjs.com/package/endorphin-ai)** - Published package
- **[Playwright Documentation](https://playwright.dev/)** - Browser automation
- **[OpenAI API](https://platform.openai.com/docs)** - AI integration
- **[LangChain Documentation](https://langchain.readthedocs.io/)** - AI tool framework

## Getting Started

1. Read [Quick Start Guide](user-guide/Quick-Start.md)
2. Follow [Project Setup Guide](user-guide/Project-Setup-Guide.md)
3. Learn test writing with [Test Structure Guide](user-guide/Test-Structure-Guide.md)
4. Try the HTML reporter with [HTML Reporter Guide](user-guide/HTML-Reporter-Guide.md)

---

_For questions or improvements, please create an issue in the repository._
