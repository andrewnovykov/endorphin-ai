# Changelog

All notable changes to Endorphin AI.

---

## v1.1.0

### Added
- **Auto-inject page context** — Accessibility tree auto-injected before every AI decision with `[CHANGED]`/`[NEW]` markers
- **Vision verification** — AI-powered screenshot verification for all verify tools (supplement/primary modes)
- **Auto-highlight bounding box** — Red border on verified elements before screenshot capture
- **Sequential tool execution** — Custom sequential loop replacing parallel Promise.all to prevent race conditions
- **Fill tool reliability** — Explicit focus before fill, 2 retry fallbacks (pressSequentially, JS native value setter)
- **Gemini crash recovery** — Graceful handling of empty candidates from Gemini API
- **Validation Agent vision** — Screenshot + vision confirmation of test results with confidence scoring
- **Tool cleanup** — Removed redundant `getSimplePageContent` and `getDifferentialContent` (28 → 26 tools)
- **Recorder CLI** — `recorder create`, `add-step`, `generate`, `list`, `status` subcommands with JSON output
- **Claude Code skills** — `/write-test`, `/fix-test`, `/record-test` slash commands
- **Init command** — `endorphin init-claude-skill` scaffolds `.claude/commands/` and `.claude/CLAUDE.md`
- **Autonomous mode** — `pageState` (accessibility tree) and `errorDetails` in recorder CLI output
- **Autonomous `/write-test`** — Claude reads the page and auto-generates all test steps
- **Autonomous `/fix-test`** — Claude diagnoses failures and rewrites broken steps from page state
- **Tool reference** — 26 browser tools with prompt writing guide in CLAUDE.md template

### Fixed
- Bounding box screenshots use `fullPage: false` so highlights render correctly
- Vision API calls now appear in cost report with correct model name
- `navigate` and `navigateBack` capture screenshots on error

---

## v1.0.2 — 2026-02-14

### Added
- 12 new browser tools: hover, pressKey, selectOption, drag, navigateBack, scroll, fileUpload, evaluate, networkRequests, tabs, verifyListVisible, getElementInfo, resize
- Multi-provider AI support — AIProviderFactory auto-detects OpenAI or Gemini from model name
- `playground/`, `playground-m/`, `playground-m-google/` test environments

### Fixed
- Bug fixes from `fix-bug` branch (PR #18)

---

## v1.0.1 — 2026-02-14

### Added
- AI agent fleet architecture (`.claude/` commands and agents)
- CI/CD fixes and test stabilization
- Validation agent prompt extraction to separate file

### Fixed
- TypeScript and linting errors in AI provider and agent setup
- npm install timeout in package distribution tests

---

## v1.0.0 — Initial Release

### Added
- Natural language test execution via GPT-4o
- 14 built-in browser tools (navigate, click, fill, verify, screenshot, wait, etc.)
- Interactive test recorder
- HTML report generation with screenshots
- Console and performance reporters
- Token tracking and cost analysis
- Multi-user testing (up to 5 concurrent users)
- JIRA integration (test sync)
- CLI: `run`, `init`, `generate`, `list`, `cleanup` commands
- npm package distribution (`endorphin-ai`)
- CI/CD integration (GitHub Actions)
- Dependency injection architecture
- Centralized logging
