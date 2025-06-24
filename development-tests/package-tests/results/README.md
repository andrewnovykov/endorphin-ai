# Package Test Results

This directory contains the results of package-level tests for Endorphin AI. Each test session creates a timestamped folder with comprehensive logs and reports.

## Directory Structure

```
results/
├── README.md                          # This file
└── YYYYMMDD_HHMMSS/                   # Test session folder
    ├── session_info.txt               # Session metadata and summary
    ├── test_results.csv               # Test results in CSV format
    ├── test_report.html               # HTML report (open in browser)
    ├── Environment_Setup.log          # Individual test logs
    ├── Test_Recorder_Functionality.log
    ├── Basic_Test_Execution.log
    └── ... (one log file per test)
```

## Session Folder Contents

### `session_info.txt`
Contains session metadata including:
- Session ID and timestamps
- Environment information (Node.js, npm versions, OS)
- Repository and test environment paths
- Final test summary and success rate

### `test_results.csv`
Structured data with columns:
- Result (PASS/FAIL)
- Test_Name
- Duration_Seconds
- Log_File

### `test_report.html`
Interactive HTML report with:
- Visual summary dashboard
- Test results grid with status indicators
- Links to individual test logs
- Session information
- Responsive design for mobile and desktop

### Individual Test Logs
Each test creates a detailed log file containing:
- Test metadata (name, description, script path)
- Complete output from test execution
- Start/end timestamps and duration
- Pass/fail status

## Viewing Results

### Quick View
```bash
# View latest session summary
cat results/*/session_info.txt | tail -20

# List all sessions
ls -la results/

# View test results as CSV
cat results/YYYYMMDD_HHMMSS/test_results.csv
```

### HTML Report
Open the HTML report in your browser:
```bash
open results/YYYYMMDD_HHMMSS/test_report.html
```

### Individual Test Logs
```bash
# View specific test log
cat results/YYYYMMDD_HHMMSS/Environment_Setup.log

# View failed tests only
grep "FAIL" results/YYYYMMDD_HHMMSS/test_results.csv
```

## Cleanup

Old test results can be cleaned up manually:
```bash
# Remove sessions older than 7 days
find results/ -name "2*" -type d -mtime +7 -exec rm -rf {} \;

# Keep only last 5 sessions
ls -t results/ | tail -n +6 | xargs -I {} rm -rf results/{}
```

## Integration

The test runner automatically:
1. Creates a new session folder with timestamp
2. Captures all test output to individual log files
3. Tracks test timing and results
4. Generates both CSV and HTML reports
5. Provides immediate feedback with error previews

This logging system helps with:
- **Debugging**: Complete test output preserved
- **Monitoring**: Track test success rates over time
- **Documentation**: Generate reports for stakeholders
- **CI/CD**: Machine-readable CSV format for automation
- **Analysis**: Identify patterns in test failures
