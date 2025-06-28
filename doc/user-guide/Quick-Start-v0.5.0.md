# Quick Start Guide - v0.5.0

_Updated: June 28, 2025_

## 🚀 What's New in v0.5.0

Endorphin AI v0.5.0 brings significant improvements to the HTML reporter and TypeScript integration. Here's what's changed and how to get the most out of the new features.

## ✨ Key Improvements

### 🖼️ Enhanced HTML Reports
- **Screenshots now display as actual images** instead of text
- **Interactive thumbnail galleries** with click-to-zoom
- **Fixed filter functionality** for All/Passed/Failed tests
- **Real-time search** by test ID and name
- **Improved mobile experience** with responsive design

### 🔧 Better TypeScript Support
- **TestCase type now available** for test recorder integration
- **Complete type safety** across all framework components
- **Improved development experience** with better IntelliSense

## 📋 Quick Setup

### 1. Update Your Installation
```bash
# If using npm
npm install endorphin-ai@latest

# If developing locally
git pull origin develop
npm install
npm run build
```

### 2. Verify Installation
```bash
# Check version
endorphin --version

# Run health check
endorphin run test HEALTH-001

# Generate report to test new features
endorphin generate report
```

### 3. View Your First Interactive Report
```bash
# Generate and open report
endorphin generate report
endorphin open report

# Or open manually
open test-results/reports/report-$(date +%Y-%m-%d).html
```

## 🎯 New HTML Reporter Features

### Screenshot Viewing
- **Click any screenshot** to view full-size
- **Thumbnails in test steps** show actual images
- **Gallery view** for all test screenshots
- **Zoom and pan** in modal viewer

### Advanced Filtering
```
1. Use the search box to find specific tests
2. Click All/Passed/Failed tabs to filter by status
3. Combine search + filters for precise results
4. Results update in real-time as you type
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + F` | Focus search box |
| `Escape` | Clear search |
| `Ctrl/Cmd + 1` | Show all tests |
| `Ctrl/Cmd + 2` | Show passed only |
| `Ctrl/Cmd + 3` | Show failed only |
| `Ctrl/Cmd + E` | Export to JSON |
| `Ctrl/Cmd + P` | Print report |

## 🛠️ For Developers

### Using TestCase Type
```typescript
import { TestCase } from 'endorphin-ai';

const testCase: TestCase = {
  testId: 'LOGIN-001',
  testName: 'User Login Test',
  description: 'Test user authentication flow',
  recordingId: 'optional-recording-id',
  recordedSteps: 5
};
```

### Generating Reports Programmatically
```typescript
import { HtmlReporter } from 'endorphin-ai';

const reporter = new HtmlReporter('./test-results');
const reportPath = await reporter.generateReport({
  filename: 'my-custom-report.html'
});
console.log(`Report generated: ${reportPath}`);
```

## 📁 File Structure Update

Your test results directory now looks like this:
```
test-results/
├── reports/
│   ├── report-2025-06-28.html      # Interactive HTML reports
│   ├── assets/                     # CSS and JavaScript assets
│   │   ├── styles.css
│   │   └── scripts.js
│   └── screenshots/                # Screenshot copies for reports
└── YOUR-TEST_2025-06-28T00-17-57/  # Raw test data
    ├── test-session.json
    └── screenshots/                # Original screenshots
```

## 🔧 Troubleshooting

### Report Not Interactive
```bash
# Check if assets exist
ls test-results/reports/assets/

# Regenerate report
endorphin generate report --force
```

### Screenshots Not Showing
```bash
# Check screenshot directory
ls test-results/reports/screenshots/

# Check browser console for 404 errors
# Open report and press F12 to view console
```

### Filters Not Working
- Ensure JavaScript is enabled
- Clear browser cache and reload
- Check for JavaScript errors in console

## 🎉 Quick Demo

Try this workflow to see all new features:

```bash
# 1. Run a test that will generate screenshots
endorphin run test HEALTH-001

# 2. Generate interactive report
endorphin generate report

# 3. Open and explore
endorphin open report
```

In the report:
1. **Try the search** - type "HEALTH" to filter
2. **Use status filters** - click "Passed" tab
3. **View test details** - click "View Details" button
4. **Explore screenshots** - click any thumbnail to zoom
5. **Test keyboard shortcuts** - press Ctrl+F to search

## 📚 Additional Resources

- **[Full HTML Reporter Guide](HTML-Reporter-Guide.md)** - Complete feature documentation
- **[Framework Architecture](../framework-development/Framework-Architecture.md)** - Technical details
- **[CLAUDE.md](../../CLAUDE.md)** - For AI assistant development

## 🐛 Known Issues

### Minor Issues
- Some ESLint warnings remain (non-critical)
- Large test suites (100+ tests) may load slowly
- Very old browsers may not support all features

### Workarounds
- Use latest Chrome/Firefox/Safari for best experience
- For large suites, use status filters to reduce data
- Export to JSON for custom analysis of large datasets

## 🚀 What's Coming Next

- Enhanced test recorder integration
- PDF export functionality
- Advanced filtering options
- Performance monitoring features

---

**Welcome to Endorphin AI v0.5.0!** The enhanced HTML reporter and improved TypeScript support make test analysis more powerful and developer-friendly than ever.