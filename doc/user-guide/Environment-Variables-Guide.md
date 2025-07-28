_Last Updated: July 4, 2025 - v0.9.0_
# Environment Variables Guide

Configure Endorphin AI with these simple environment variables.

## 🚀 Quick Setup

1. Create a `.env` file in your project root:
```bash
OPENAI_API_KEY=your_key_here
```

That's it! You're ready to go.

## 📋 Available Variables

### OPENAI_API_KEY (Required)
Your OpenAI API key for AI-powered testing.

```bash
OPENAI_API_KEY=sk-proj-abc123...
```

**How to get one:**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new key
3. Copy and paste it here

### HEADLESS (Optional)
Run browser with or without UI.

```bash
HEADLESS=false  # See the browser (good for debugging)
HEADLESS=true   # No browser window (good for CI/CD)
```

Default: `true`

### BASE_URL (Optional)
Default website for your tests.

```bash
BASE_URL=https://myapp.com
```

Default: `https://qafromla.herokuapp.com/`

### JIRA Integration (Optional)

Configure JIRA integration to sync tests from tickets:

```bash
# JIRA Connection
JIRA_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your_api_token_here

# JIRA Project Settings
JIRA_PROJECT_ID=10001
JIRA_ISSUE_TYPE_ID=10013
JIRA_LABEL=ai-test-case
```

**Setup instructions**: See [JIRA Integration Guide](./JIRA-Integration-Guide.md)

## 💡 Example Configurations

### Local Development
Perfect for writing and debugging tests:

```bash
# See what's happening
OPENAI_API_KEY=sk-proj-abc123...
HEADLESS=false
BASE_URL=http://localhost:3000
```

### CI/CD Pipeline
Fast and efficient for automated testing:

```bash
# Run silently in background
OPENAI_API_KEY=sk-proj-abc123...
HEADLESS=true
BASE_URL=https://staging.myapp.com
```

### Production Testing
Test your live environment:

```bash
OPENAI_API_KEY=sk-proj-abc123...
HEADLESS=true
BASE_URL=https://myapp.com
```

### JIRA Integration Enabled
Sync tests from JIRA tickets:

```bash
# Core settings
OPENAI_API_KEY=sk-proj-abc123...
HEADLESS=true
BASE_URL=https://myapp.com

# JIRA integration
JIRA_URL=https://company.atlassian.net
JIRA_EMAIL=tester@company.com
JIRA_API_TOKEN=ATBBxyz789...
JIRA_PROJECT_ID=10001
JIRA_ISSUE_TYPE_ID=10013
JIRA_LABEL=ai-test-case
```

## 🔧 Using Environment Variables in Tests

### Access in Test Files
```typescript
export const MY_TEST: TestCase = {
  id: 'ENV-001',
  name: 'Environment Test',
  description: 'Uses environment variables',
  priority: 'High',
  tags: ['env'],
  
  setup: async () => {
    return {
      // Use BASE_URL or fallback
      baseUrl: process.env.BASE_URL || 'https://example.com'
    };
  },
  
  task: async (data, setupData) => {
    return `Navigate to ${setupData.baseUrl}`;
  }
};
```

### Multiple Environments
Create different `.env` files:

```bash
# .env.dev
BASE_URL=http://localhost:3000

# .env.staging  
BASE_URL=https://staging.myapp.com

# .env.prod
BASE_URL=https://myapp.com
```

Load the right one:
```bash
# Use staging environment
cp .env.staging .env
npx endorphin run test
```

## 🚨 Common Issues

### "Missing OpenAI API Key"
**Problem:** Test fails with API key error.

**Solution:** Make sure your `.env` file:
- Is in the project root (same folder as package.json)
- Has the correct key name: `OPENAI_API_KEY`
- Contains a valid key starting with `sk-`

### "Browser Not Found"
**Problem:** Playwright can't find browser.

**Solution:** Install browsers:
```bash
npx playwright install chromium
```

### "Cannot See Browser"
**Problem:** Browser runs but you can't see it.

**Solution:** Set `HEADLESS=false` in your `.env` file.

## 🛡️ Security Tips

### Keep Your API Key Safe
- Never commit `.env` to git
- Add `.env` to `.gitignore`
- Use environment secrets in CI/CD

### Example .gitignore
```
# Environment variables
.env
.env.local
.env.*.local

# Test results
test-results/
```

### CI/CD Setup
Instead of `.env` files, use secrets:

**GitHub Actions:**
```yaml
- name: Run Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: npx endorphin run all
```

**GitLab CI:**
```yaml
test:
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY
  script:
    - npx endorphin run all
```

## 📚 Next Steps

- [Write Your First Test](Test-Structure-Guide.md)
- [Configure Your Project](Project-Setup-Guide.md)
- [View Test Reports](HTML-Reporter-Guide.md)

---

Need help? The defaults work great for most cases. Just add your OpenAI key and start testing!