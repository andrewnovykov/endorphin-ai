_Last Updated: July 4, 2025 - v0.9.0_
# HTML Reporter Guide

Beautiful, interactive test reports that make debugging easy.

## 🎯 What are HTML Reports?

After running tests, Endorphin AI creates interactive web reports showing:
- ✅ Which tests passed or failed
- 📸 Screenshots of every step
- 🔍 Detailed execution logs
- 📊 Success rates and statistics

## 🚀 Quick Start

### Generate a Report

Run tests first:
```bash
npx endorphin run test HEALTH-001
```

Then generate the report:
```bash
npx endorphin generate report
```

Open it:
```bash
npx endorphin open report
```

That's it! Your report opens in the browser.

## 📋 Report Features

### Dashboard View
When you open a report, you'll see:
- **Summary Cards**: Total tests, passes, failures
- **Success Rate**: Visual progress bar
- **Test List**: All your test results

### Interactive Features

#### 🔍 Search Tests
Type in the search box to find tests instantly:
- Search by test ID (e.g., "LOGIN-001")
- Search by test name (e.g., "login")
- Results update as you type

#### 📊 Filter by Status
Click the tabs to filter:
- **All**: Show everything
- **Passed**: Only successful tests
- **Failed**: Only failed tests

#### 📸 View Screenshots
Click any screenshot to:
- See full-size image
- Zoom in/out
- Navigate between screenshots
- Close with Escape key

### Test Details
Click "View Details" on any test to see:
- Step-by-step execution
- Timing for each step
- Screenshots at each step
- Error messages (if failed)

### 💰 Cost & Token Tracking
Each test shows detailed AI usage information:
- **Total cost** - How much the test cost to run
- **Token usage** - Input and output tokens consumed
- **AI model used** - Which OpenAI model processed the test
- **Cost per step** - Breakdown of expenses by test step
- **Session totals** - Aggregate costs for the entire test run

### 🧠 AI Decision History
See exactly how the AI analyzed and executed your test:
- **Agent thinking** - What the AI was considering at each step
- **Decision process** - Why the AI chose specific actions
- **Tool selection** - Which browser tools were used and why
- **Error recovery** - How the AI handled and fixed issues
- **Context awareness** - How previous steps influenced decisions

### 📋 Detailed Step Information
For each test step, view:
- **Action taken** - What the AI did (click, fill, verify, etc.)
- **Target elements** - Which page elements were interacted with
- **Tool arguments** - Parameters passed to automation tools
- **Execution time** - How long each step took
- **Token cost** - AI processing cost for that specific step
- **Before/after screenshots** - Visual proof of what happened

## ⌨️ Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `Ctrl+F` / `Cmd+F` | Focus search |
| `Escape` | Clear search or close modal |
| `Ctrl+1` / `Cmd+1` | Show all tests |
| `Ctrl+2` / `Cmd+2` | Show passed only |
| `Ctrl+3` / `Cmd+3` | Show failed only |
| `Ctrl+E` / `Cmd+E` | Export to JSON |

## 📁 Where Reports are Saved

```
test-results/
├── reports/
│   ├── report-2025-01-04.html    # Today's report
│   ├── screenshots/               # Images for the report
│   └── assets/                    # Styles and scripts
└── HEALTH-001_2025-01-04/         # Raw test data
```

## 💡 Tips & Tricks

### Debug Failed Tests
1. Filter by "Failed" to focus on problems
2. Click "View Details" on a failed test
3. Look for the red error step
4. Check the screenshot before failure
5. **Review AI thinking** - See what the AI was considering when it failed
6. **Check tool selection** - Verify the AI used the right automation tools

### Monitor Test Costs
1. **Track spending** - See total cost for each test run
2. **Optimize expensive tests** - Find tests that use too many tokens
3. **Compare costs** - See which tests are most/least expensive
4. **Budget planning** - Use cost data for project planning

### Understand AI Behavior
1. **Review decision history** - Learn how the AI solves problems
2. **Improve test instructions** - See where the AI gets confused
3. **Debug complex flows** - Follow the AI's reasoning process
4. **Share insights** - Export decision data for team analysis

### Share Reports
Reports are self-contained HTML files. You can:
- Email them to teammates
- Upload to shared drives
- View them anywhere

### Export Data
Press `Ctrl+E` to export test data as JSON for:
- Custom analysis
- Integration with other tools
- Historical tracking

## 🧹 Manage Reports

### Clean Up Old Reports
```bash
# Remove reports older than 30 days
npx endorphin cleanup reports

# Keep only last 7 days
npx endorphin cleanup reports 7
```

### Clean Up Test Results
```bash
# Keep only 10 most recent results per test
npx endorphin cleanup results

# Keep only 5 most recent
npx endorphin cleanup results 5
```

## 🎨 Report Customization

### Change Report Name
```bash
npx endorphin generate report --filename my-custom-report.html
```

### Multiple Reports
Generate different reports for different purposes:
```bash
# Smoke test report
npx endorphin generate report --filename smoke-tests.html

# Full regression report  
npx endorphin generate report --filename regression.html
```

## 🚨 Troubleshooting

### "No test results found"
Run some tests first:
```bash
npx endorphin run test HEALTH-001
```

### Screenshots Not Loading
- Check `test-results/reports/screenshots/` folder exists
- Ensure browser allows local file access
- Try opening report from a web server

### Report Won't Open
- Check file exists in `test-results/reports/`
- Use full path if needed
- Try different browser

## 🏢 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: npx endorphin run all

- name: Generate Report
  run: npx endorphin generate report
  
- name: Upload Report
  uses: actions/upload-artifact@v2
  with:
    name: test-report
    path: test-results/reports/report-*.html
```

### GitLab CI Example
```yaml
test:
  script:
    - npx endorphin run all
    - npx endorphin generate report
  artifacts:
    paths:
      - test-results/reports/
    expire_in: 1 week
```

## 📚 Next Steps

- [Write Better Tests](Test-Structure-Guide.md)
- [Configure Your Project](Project-Setup-Guide.md)
- [Test Writing Tips](Test-Writing-Tips.md)

---

Reports help you understand what happened in your tests. Use them to debug failures and track progress!