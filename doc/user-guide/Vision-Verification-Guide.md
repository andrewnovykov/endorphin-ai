_Last Updated: February 14, 2026 - v1.0.2_
# Vision Verification Guide

AI-powered screenshot verification that confirms test results visually.

## 🎯 What is Vision Verification?

Vision verification adds a second layer of confidence to your test assertions. When enabled, after a standard DOM-based verification passes, the system:

1. Takes a screenshot of the page
2. Highlights the verified element with a red bounding box
3. Sends the screenshot to an AI vision model
4. Asks: "Is this element actually visible on the page?"

This catches cases where an element exists in the DOM but is not truly visible to a user -- hidden behind overlays, clipped by overflow, rendered off-screen, or styled with zero opacity.

## 🚀 Quick Setup

Add the `vision` block to your `endorphin.config.ts`:

```typescript
// endorphin.config.ts
export default {
  ai: {
    model: 'gpt-4o',        // main test agent model
    temperature: 0.1,
    vision: {
      enabled: true,
      model: 'gpt-4o',      // vision model (can differ from main model)
      mode: 'supplement',    // 'supplement' or 'primary'
      temperature: 0.1,
      maxTokens: 1000,
    }
  }
}
```

That's it! Vision verification will now run automatically after every verification tool call.

## ⚙️ Vision Modes

### Supplement Mode (Default)

```typescript
vision: {
  enabled: true,
  mode: 'supplement',
}
```

The DOM verification result is the primary source of truth. The vision result is appended as an informational note. Use this when you trust DOM verification but want extra confidence.

**Example output:**
```
PASS: Element "Submit" is visible on the page.
[Vision Note] Confirmed: "Submit" button is visible in the center of the form.
```

### Primary Mode

```typescript
vision: {
  enabled: true,
  mode: 'primary',
}
```

The vision result **overrides** the DOM verification result. Use this when DOM verification is unreliable -- for example, when elements are visually hidden but still present in the DOM.

**Example output:**
```
DOM: PASS - Element found in DOM.
Vision: FAIL - Element is not visually visible (covered by modal overlay).
Final Result: FAIL
```

### When to Choose Each Mode

| Scenario | Recommended Mode |
|----------|-----------------|
| Standard web app testing | `supplement` |
| Testing visual UI changes (styling, layout) | `primary` |
| Elements hidden by CSS (opacity, visibility, z-index) | `primary` |
| Extra confidence for critical assertions | `supplement` |
| Debugging false positives from DOM checks | `primary` |

## 🔧 Which Tools Support Vision?

Vision verification runs automatically on all verification tools:

| Tool | What It Verifies |
|------|-----------------|
| `verifyElement` | Element visibility and state (exists, visible, enabled, etc.) |
| `verifyTextContent` | Specific text content appears on the page |
| `verifyTitle` | Page title matches expected value |
| `verifyListVisible` | Multiple items are visible on the page |

No changes are needed in your test instructions. If vision is enabled in your config, it activates automatically whenever the AI agent calls a verification tool.

## 🎨 Auto-Highlight Bounding Boxes

When vision is enabled, a **1px red bounding box** is automatically drawn around the verified element before the screenshot is taken. This helps the vision model locate and focus on the correct element.

### How It Works

- **CSS selectors** (from `verifyElement`): The framework calls `highlightElement()`, which uses `getBoundingClientRect()` to position a red border around the matched element.
- **Text content** (from `verifyTextContent`, `verifyListVisible`): The framework calls `highlightText()`, which uses a `TreeWalker` to find matching text nodes and draws a bounding box around them.
- **Cleanup**: Highlights are automatically removed after the screenshot is captured. They never appear in subsequent screenshots or affect your page layout.

### Example

When verifying a "Submit" button, the screenshot sent to the vision model looks like this:

```
+------------------------------------------+
|                                          |
|   [ Username ]                           |
|   [ Password ]                           |
|                                          |
|   +--[red border]--+                     |
|   |    Submit      |                     |
|   +----------------+                     |
|                                          |
+------------------------------------------+
```

The red bounding box tells the vision model exactly which element to evaluate.

## 🔌 Provider Support

Vision works with any AI provider that supports image analysis.

### Supported Models

| Provider | Models | Notes |
|----------|--------|-------|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini` | Recommended for vision tasks |
| **Google Gemini** | `gemini-2.0-flash`, `gemini-1.5-pro` | Good balance of speed and accuracy |

### Mixed Provider Setup

You can use a different model for vision than your main test agent. This is useful when one provider is better at image analysis while another is more cost-effective for test execution:

```typescript
// endorphin.config.ts
export default {
  ai: {
    model: 'gemini-2.0-flash',  // main agent uses Gemini (fast, cheap)
    vision: {
      enabled: true,
      model: 'gpt-4o',          // vision uses OpenAI (strong image analysis)
    }
  }
}
```

Make sure the appropriate API key is set in your `.env` file for each provider you use:

```bash
# .env
OPENAI_API_KEY=sk-proj-abc123...
GOOGLE_API_KEY=AIza...
```

## 📖 VisionConfig Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable or disable vision verification |
| `model` | `string` | `'gpt-4o'` | AI model used for vision analysis |
| `temperature` | `number` | `0.1` | Model temperature (lower = more deterministic) |
| `maxTokens` | `number` | `1000` | Maximum response tokens from the vision model |
| `mode` | `'supplement'` \| `'primary'` | `'supplement'` | How the vision result is used relative to DOM verification |

### Minimal Config

The simplest configuration to enable vision with all defaults:

```typescript
export default {
  ai: {
    model: 'gpt-4o',
    vision: {
      enabled: true,
    }
  }
}
```

This uses `gpt-4o` for vision, `supplement` mode, temperature `0.1`, and up to `1000` tokens per response.

## 💡 When to Use Vision Verification

### Good Use Cases

- **Visual UI testing**: Confirming styling, layout, or visibility changes that DOM checks alone cannot catch.
- **Hidden element detection**: Catching elements that exist in the DOM but are covered by overlays, modals, or z-index stacking.
- **Critical assertions**: Adding a second verification layer for high-priority test steps where false positives are unacceptable.
- **Debugging mysterious passes**: When a test passes but the page looks wrong visually, vision verification can expose the discrepancy.

### When You Might Skip It

- **Simple functional tests**: If you are only checking that a page navigates correctly or an API responds, vision adds overhead without much benefit.
- **High-volume test suites**: Running vision on hundreds of assertions adds cost and time. Consider enabling it selectively for critical flows.
- **Non-visual checks**: Verifying page titles, URLs, or hidden form values does not benefit from screenshot analysis.

## 💰 Cost Considerations

Each vision verification check incurs additional AI costs:

| Cost Component | Approximate Tokens |
|---------------|-------------------|
| Screenshot encoding (image input) | 300-1000 tokens |
| Vision model response | 100-500 tokens |
| **Total per check** | **~500-1500 tokens** |

### Tips to Manage Costs

1. **Use `supplement` mode** for non-critical tests -- it adds confidence without changing test outcomes.
2. **Enable vision selectively** -- you do not need it on every test. Focus on critical user flows.
3. **Use a cheaper vision model** -- `gpt-4o-mini` or `gemini-2.0-flash` cost less per token while still providing reliable image analysis.
4. **Monitor costs in reports** -- the HTML reporter shows token usage per step, including vision checks. See the [HTML Reporter Guide](HTML-Reporter-Guide.md) for details.

## 🚨 Troubleshooting

### "Vision verification not running"

**Problem:** You enabled vision but verification results do not include vision notes.

**Solution:** Check your configuration:
```typescript
// Make sure vision is inside the ai block
export default {
  ai: {
    vision: {
      enabled: true,  // Must be explicitly true
    }
  }
}
```

### "OPENAI_API_KEY required" or authentication errors

**Problem:** The vision model cannot authenticate with the AI provider.

**Solution:** The vision model defaults to `gpt-4o`, which requires an OpenAI API key. Make sure the correct key is set:
```bash
# .env
OPENAI_API_KEY=sk-proj-your-key-here

# If using Gemini for vision:
GOOGLE_API_KEY=AIza-your-key-here
```

### Bounding box not visible in screenshot

**Problem:** The red highlight does not appear around the element.

**Possible causes:**
- The element is off-screen (scrolled out of view). The framework scrolls to the element before highlighting, but edge cases can occur with sticky headers or complex layouts.
- The element has zero width or height. Elements with `display: none` or zero dimensions cannot be highlighted.
- The element is inside an iframe. Cross-origin iframes may block highlight injection.

### Vision says element is not visible but DOM says it is

This is exactly the scenario vision verification is designed for. The element exists in the DOM but is not actually visible to a user. Common causes:
- Element is behind a modal or overlay (`z-index` stacking)
- Element is clipped by `overflow: hidden` on a parent
- Element has `opacity: 0` or `visibility: hidden`
- Element is positioned off-screen with negative margins

If this is expected behavior, switch to `supplement` mode so the DOM result takes precedence. If you want to catch these issues, use `primary` mode.

## 🧪 Example: Full Test with Vision

Here is a complete test that benefits from vision verification:

```typescript
// tests/VISUAL-001.ts
import type { TestCase } from 'endorphin-ai';

export const VISUAL_001: TestCase = {
  id: 'VISUAL-001',
  name: 'Login Form Visibility',
  description: 'Verify login form elements are truly visible to users',
  priority: 'High',
  tags: ['visual', 'login'],

  task: async () => {
    return `
      Navigate to the login page
      Verify the username input field is visible
      Verify the password input field is visible
      Verify the "Sign In" button is visible and enabled
      Verify the "Forgot Password?" link is visible
    `;
  }
};
```

With vision enabled in `endorphin.config.ts`, each `Verify` step will:
1. Run the standard DOM-based check
2. Take a screenshot with the element highlighted
3. Send the screenshot to the vision model for confirmation
4. Include the vision result in the test report

## 📚 Next Steps

- [Environment Variables Guide](Environment-Variables-Guide.md) -- Set up API keys for vision providers
- [HTML Reporter Guide](HTML-Reporter-Guide.md) -- View vision results in test reports
- [Test Writing Tips](Test-Writing-Tips.md) -- Write better verification instructions
- [Project Setup Guide](Project-Setup-Guide.md) -- Full configuration reference

---

Vision verification adds a human-like "eyes on the page" check to your automated tests. Start with `supplement` mode on your most important test flows, and expand from there!
