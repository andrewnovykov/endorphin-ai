# HTML Reporter User Guide

The Endorphin AI HTML Reporter provides comprehensive, interactive test reports that help you analyze test execution results, identify patterns, and debug issues effectively.

## Overview

The HTML Reporter generates beautiful, responsive web-based reports from your test execution data. These reports include:

- **Interactive dashboards** with test statistics and success rates
- **Detailed test execution timelines** with step-by-step breakdowns
- **Screenshot galleries** for visual debugging
- **Search and filtering capabilities** for large test suites
- **Export functionality** for data analysis and sharing

## Quick Start

### Generating Reports

```bash
# Generate a full interactive HTML report
endorphin generate report

# Generate a lightweight summary report
endorphin generate report --summary

# Open the latest report in your browser
endorphin open report

# Open a specific report file
endorphin open report report-2025-06-22.html
```

### Report Types

#### Full Report
- Complete test statistics and trends
- Detailed execution timelines for each test
- Screenshot galleries with zoom functionality
- Interactive modals with step-by-step analysis
- Export and print capabilities

#### Summary Report
- Lightweight overview of recent test results
- Quick performance metrics
- Ideal for CI/CD dashboards
- Faster loading for large test suites

## Report Features

### 📊 Dashboard Overview

The main dashboard provides:

- **Summary Cards**: Total tests, runs, success/failure counts
- **Success Rate Progress Bar**: Visual representation of overall health
- **Test Statistics Table**: Performance breakdown by individual tests
- **Recent Results Table**: Latest test executions with quick actions

### 🔍 Search and Filtering

#### Search Functionality
- **Real-time search**: Type in the search box to filter tests instantly
- **Search by Test ID or Name**: Find specific tests quickly
- **Highlighted results**: Matching tests are visually highlighted
- **Auto-scroll**: Automatically scrolls to first matching result

#### Status Filtering
- **All Tests**: Show all test results (default)
- **Passed Only**: Filter to show only successful tests
- **Failed Only**: Filter to show only failed tests
- **Combined Filtering**: Use search and status filters together

#### Smart Results Display
```
Showing 5 of 25 tests matching "login" with status "failed"
```

### 🔍 Detailed Test Analysis

Click on any test result to view:

#### Test Information
- Test ID, name, and execution status
- Start/end times and duration
- Total number of steps executed
- Screenshot count

#### Step-by-Step Timeline
- Chronological execution flow
- Step descriptions and results
- Tool calls and arguments
- Success/failure indicators
- Execution timestamps

#### Screenshot Gallery
- Visual record of test execution
- Click to zoom and examine details
- Organized by execution sequence
- Supports multiple formats (PNG, JPG)

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search box |
| `Escape` | Clear search |
| `Ctrl/Cmd + 1` | Show all tests |
| `Ctrl/Cmd + 2` | Show passed tests only |
| `Ctrl/Cmd + 3` | Show failed tests only |
| `Ctrl/Cmd + E` | Export to JSON |
| `Ctrl/Cmd + P` | Print report |

### 📤 Export and Sharing

#### Export to JSON
- Complete test data in structured format
- Suitable for further analysis
- Includes all execution details and metadata

#### Print Reports
- Print-optimized layout
- Removes interactive elements
- Perfect for documentation and archiving

## Managing Reports

### Cleanup Commands

```bash
# Clean up old test results (keep 10 most recent per test)
endorphin cleanup results

# Keep only 5 most recent results per test
endorphin cleanup results 5

# Clean up old report files (older than 30 days)
endorphin cleanup reports

# Clean up report files older than 7 days
endorphin cleanup reports 7
```

### Report Organization

Reports are stored in:
```
test-results/
├── reports/
│   ├── report-2025-06-22.html      # Full reports
│   ├── summary-report.html         # Latest summary
│   ├── styles.css                  # Styling assets
│   ├── scripts.js                  # Interactive functionality
│   └── screenshots/                # Screenshot assets
└── TEST-001_2025-06-22T20-32-05/  # Raw test data
    ├── summary.json
    ├── test-session.json
    └── screenshots/
```

## Best Practices

### For Development Teams

1. **Regular Report Generation**: Generate reports after each test run
2. **Use Filters Effectively**: Focus on failed tests for debugging
3. **Leverage Search**: Find specific test patterns quickly
4. **Export for Analysis**: Use JSON export for trend analysis
5. **Clean Up Regularly**: Maintain storage efficiency with cleanup commands

### For CI/CD Integration

```bash
# In your CI pipeline
npm run test                    # Run your tests
endorphin generate report       # Generate HTML report
endorphin cleanup results 5    # Keep storage manageable

# Archive reports for later analysis
cp test-results/reports/report-*.html ./artifacts/
```

### For Test Analysis

1. **Start with Summary**: Use summary reports for quick overviews
2. **Drill Down on Failures**: Use failed filter to identify patterns
3. **Timeline Analysis**: Review step-by-step execution for debugging
4. **Screenshot Review**: Visual debugging of UI-related issues
5. **Export Data**: Use JSON export for custom analysis tools

## Troubleshooting

### Common Issues

#### No Reports Generated
```bash
# Check if test results exist
ls test-results/

# Generate report manually
endorphin generate report
```

#### Reports Not Opening
```bash
# Check report files exist
ls test-results/reports/

# Open specific report
endorphin open report report-2025-06-22.html
```

#### Search/Filter Not Working
- Ensure JavaScript is enabled in your browser
- Clear browser cache and reload
- Check browser console for errors

#### Missing Screenshots
- Verify screenshot directory exists: `test-results/reports/screenshots/`
- Check if screenshots were captured during test execution
- Ensure proper file permissions

### Performance Optimization

For large test suites:

1. **Use Summary Reports**: Faster loading for quick overviews
2. **Regular Cleanup**: Remove old results to improve performance
3. **Filter Early**: Use status filters to reduce data processing
4. **Export Subsets**: Export specific date ranges or test groups

## Advanced Usage

### Custom Styling

Reports use Bootstrap 5 with custom CSS. You can modify:
- `framework/templates/styles.css` for global styling
- Add custom CSS classes for specific elements
- Modify color schemes and branding

### Data Integration

Export JSON format includes:
```json
{
  "session": {
    "testId": "TEST-001",
    "testName": "Login Test",
    "status": "SUCCESS",
    "duration": 1500,
    "steps": [...]
  },
  "summary": {
    "totalSteps": 5,
    "successfulSteps": 5,
    "failedSteps": 0
  },
  "screenshots": ["step1.png", "step2.png"]
}
```

Use this data for:
- Custom dashboards
- Trend analysis
- Integration with other tools
- Automated reporting systems

## Support

For issues and questions:
- Check the [main README](../../README.md) for general setup
- Review [framework documentation](../framework-development/)
- Create issues on the project repository
- Consult the troubleshooting section above

---

*Happy testing with Endorphin AI! 🧪✨*
