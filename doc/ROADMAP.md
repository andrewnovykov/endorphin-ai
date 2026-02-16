# Endorphin AI — Roadmap

**Last Updated:** 2026-02-14
**Current Version:** 1.0.2
**Next Release:** v1.1.0

---

## v1.0.0 — Foundation ✅

- ✅ Natural language test execution
- ✅ 14 built-in browser tools (navigate, click, fill, verify, screenshot, wait, etc.)
- ✅ Multi-provider AI (OpenAI GPT-4o, Google Gemini)
- ✅ Multi-user testing (up to 5 concurrent users)
- ✅ HTML/Console/Performance reporters
- ✅ Token tracking and cost analysis
- ✅ JIRA integration (test sync)
- ✅ Interactive test recorder
- ✅ npm package distribution
- ✅ CI/CD integration (GitHub Actions)
- ✅ Dependency injection architecture
- ✅ Centralized logging

---

## v1.0.2 — Reliability & Expansion ✅

### Browser Tools Expansion (14 → 28 tools, later cleaned to 26) ✅
- ✅ **Interaction tools**: hover, pressKey, selectOption, drag ([PRD](../prd/browser-tools-expansion.md))
- ✅ **Navigation**: navigateBack
- ✅ **Scroll**: scroll tool with element/page targeting
- ✅ **File Upload**: fileUpload tool
- ✅ **Evaluate**: JavaScript evaluation on page
- ✅ **Network**: network request inspection
- ✅ **Tabs**: browser tab management
- ✅ **Verification**: verifyListVisible, getElementInfo
- ✅ **Utilities**: resize tool

### Multi-Provider AI Support ✅
- ✅ AIProviderFactory with auto-detection by model name ([PRD](../prd/multi-provider-support.md))
- ✅ OpenAI provider (gpt-4o, gpt-4o-mini, gpt-4, gpt-3.5-turbo)
- ✅ Gemini provider (gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash)
- ✅ All agents use AIProviderFactory: agent-setup, validation-agent, recommendations-agent, generate-data
- ✅ Provider-aware config validation (OpenAI key vs Google key error messages)
- ✅ Graceful Gemini empty-candidates handling in agent loop

### Testing Infrastructure ✅
- ✅ `playground/` — Tests published npm package (`endorphin-ai@^1.0.2`)
- ✅ `playground-m/` — Tests local source via tarball (`npm pack`)
- ✅ `playground-m-google/` — Tests local source with Google Gemini config

---

## v1.1.0 — Intelligence, Vision & Claude Code 🚧

### Auto-Inject Page Context ✅
- ✅ Accessibility tree auto-injected before every `model.invoke()` call ([PRD](../prd/auto-inject-page-context.md))
- ✅ Full tree + `[CHANGED]`/`[NEW]` markers for small pages
- ✅ Interactive summary + diff for large pages (>3000 chars)
- ✅ YAML snapshot persistence in `.endorphin-tmp/` with auto-cleanup
- ✅ Hash-based skip when no page changes detected
- ✅ Security layers: schema validation + text sanitization

### Sequential Tool Execution ✅
- ✅ Replaced LangChain ToolNode (Promise.all parallel) with custom sequential for...of loop ([PRD](../prd/sequential-tool-execution.md))
- ✅ Prevents race conditions when AI returns multiple fill/click calls

### Fill Tool Reliability ✅
- ✅ Explicit focus (scrollIntoView + click + 50ms settle) before fill ([PRD](../prd/fill-tool-reliability.md))
- ✅ Retry fallback 1: triple-clear + pressSequentially (character-by-character)
- ✅ Retry fallback 2: JS native value setter (bypasses React/Angular controlled inputs)
- ✅ Field type detection (email, password) with multi-selector strategies

### Vision Verification System ✅
- ✅ AI-powered screenshot verification for verify tools ([PRD](../prd/vision-verification.md))
- ✅ Multi-provider support (OpenAI GPT-4o + Google Gemini)
- ✅ Two modes: `supplement` (vision augments DOM result) and `primary` (vision overrides DOM)
- ✅ VisionConfig in endorphin.config.ts (`ai.vision.enabled`, `ai.vision.model`, `ai.vision.mode`)
- ✅ Integrated into ALL verify tools: verifyElement, verifyTextContent, verifyTitle, verifyListVisible

### Auto-Highlight Bounding Box ✅
- ✅ 1px red bounding box overlay drawn on verified elements before screenshot capture
- ✅ `highlightElement()` for CSS selectors, `highlightText()` for text content
- ✅ Applied in ALL verify tools (verifyElement, getElementInfo, verifyTextContent, verifyListVisible)
- ✅ Highlights removed after screenshot

### Validation Agent Vision ✅
- ✅ Validation Agent uses screenshots + vision to confirm test results ([PRD](../prd/validation-agent-vision.md))
- ✅ Screenshot capture at test completion for visual confirmation
- ✅ Vision model analyzes screenshot to confirm "was element actually visible?"
- ✅ Combined text + vision confidence scoring (+0.1 agree, -0.2 disagree)

### Screenshot & Cost Fixes ✅
- ✅ Verification tool screenshots use `fullPage: false` so `position: fixed` red highlights render correctly
- ✅ `takeStepScreenshot()` chain accepts configurable `fullPage` parameter (test-helpers → browser-engine → browser-framework)
- ✅ Added `VisionVerifier.getModelName()` for correct model attribution in cost reports
- ✅ Fixed `validation-agent.ts` — was passing provider name instead of model name
- ✅ Added `trackAICall()` to `verification.ts:runVisionCheck()` — vision costs now appear in report
- ✅ `navigate` and `navigateBack` tools now capture screenshots on error

### Tool Cleanup ✅
- ✅ Removed `getSimplePageContent`, `getDifferentialContent` (redundant since auto-inject page context) ([PRD](../prd/tool-cleanup-page-content.md))
- ✅ Evaluated `getPageContent` — kept for raw HTML edge cases (CSS classes, data attributes, IDs)
- ✅ Updated system context prompt, CLI tool listing (15 → 25 tools), and tool count (28 → 26)
- ✅ Deleted `differential-content.ts`; kept `PageSnapshotManager` (active dependencies)

### Claude Code Integration ✅
- ✅ Non-interactive CLI commands for test recorder ([PRD](../prd/claude-code-integration.md))
- ✅ `endorphin recorder create` — Create recording session programmatically
- ✅ `endorphin recorder add-step` — Add and execute steps via CLI
- ✅ `endorphin recorder generate` — Generate test file from session
- ✅ `endorphin recorder list` — List all recording sessions
- ✅ `endorphin recorder status` — Get session status
- ✅ JSON-based session persistence (`session-state.json`)
- ✅ JSON-only stdout for programmatic consumption
- ✅ `/write-test`, `/fix-test`, `/record-test` Claude Code skills
- ✅ `endorphin init-claude-skill` — Scaffold Claude Code integration
- ✅ Backward compatible — existing interactive mode unchanged

### Autonomous Claude Code ✅
- ✅ Enriched CLI output with page state (accessibility tree in `recorder create` and `recorder add-step`) ([PRD](../prd/autonomous-claude-code.md))
- ✅ Structured error details on failure (`errorDetails.failedAction`, `errorDetails.reason`, `errorDetails.availableElements`)
- ✅ Tool reference in `.claude/CLAUDE.md` template (26 tools + prompt writing guide)
- ✅ Autonomous `/write-test` skill — auto-generates steps from page state, handles failures
- ✅ Autonomous `/fix-test` skill — auto-diagnoses test failures, rewrites broken steps using page state
- ✅ Compact accessibility tree serialization (< 2000 chars, interactive elements only for large pages)

### Documentation ✅
- ✅ User guide: `user-guide/Vision-Verification-Guide.md`
- ✅ User guide: `user-guide/Claude-Code-Integration.md`
- ✅ 8 PRDs created for all implemented features
- ✅ Design doc: `design/claude-code-integration-architecture.md`

---

## v1.2.0 — Intelligence & Reliability 🔮

### Smart Retry & Self-Healing — P1 🔮
- 🔮 Automatic retry with alternative selectors when element not found
- 🔮 AI-powered selector healing based on page context changes
- 🔮 Configurable retry strategies per tool

### Advanced Reporting — P2 🔮
- 🔮 Vision verification results in HTML report (screenshots + confidence)
- 🔮 Bounding box overlays visible in report screenshots
- 🔮 Token cost breakdown by provider (OpenAI vs Gemini comparison)

### Claude Provider — P2 🔮
- 🔮 Anthropic Claude as third AI provider option
- 🔮 Claude provider in AIProviderFactory

---

## v2.0.0 — Enterprise & Scale 🔮

### Parallel Test Execution — P1 🔮
- 🔮 Run multiple test files concurrently
- 🔮 Worker-based isolation per test

### Custom Tool SDK — P2 🔮
- 🔮 Public API for creating custom browser tools
- 🔮 Tool marketplace / community tools

### Visual Regression Testing — P2 🔮
- 🔮 Baseline screenshot comparison
- 🔮 Pixel-diff with tolerance thresholds
- 🔮 AI-powered visual change detection

---

## Sprint History

| Sprint | Target | Status | Features | Dates |
|--------|--------|--------|----------|-------|
| v1.0.0 | v1.0.0 | ✅ Closed | Foundation (14 features) | — |
| v1.0.2 | v1.0.2 | ✅ Closed | Reliability & Expansion (8 features) | 2026-02-13 → 2026-02-14 |
| v1.1.0 | v1.1.0 | 🚧 In Progress | Intelligence, Vision & Claude Code | 2026-02-14 |

---

## Legend

- ✅ Done — Shipped
- 🚧 In Progress — Active sprint
- 📋 Planned — Scheduled for upcoming sprint
- 🔮 Future — Backlog, not yet scheduled
