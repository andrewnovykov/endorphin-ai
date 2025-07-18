# HTML Reporter and Performance Reporter Fixes

## Phase 1: HTML Reporter Core Issues (High Priority)

### 1.1 Modal View Details Functionality
- [ ] Fix modal opening but showing no information (was working in previous template)
- [ ] Ensure test details modal populates with:
  - Test ID and name
  - Status and duration
  - Steps timeline
  - Agent history
  - Screenshots
  - Token usage and cost information
  - Setup and data generation results

### 1.2 Search Functionality
- [ ] Fix search input not working (`#test-search`)
- [ ] Ensure search works for:
  - Test ID matching
  - Test name matching
  - Case-insensitive search
  - Real-time filtering

### 1.3 Filter Tabs
- [ ] Fix filter buttons not working:
  - All Tests (default active)
  - Passed tests
  - Failed tests
  - Flaky tests
  - Skipped tests
- [ ] Ensure proper visual feedback (active state)
- [ ] Update result count display

### 1.4 Test Result Display Issues
- [ ] Fix duplicate test entries for retry attempts
- [ ] Combine attempts properly (show 1 test with 2 attempts, not 2 tests with 1 attempt each)
- [ ] Example fix: `HEALTH-002` showing 3 separate entries should show as 1 entry with 3 attempts

### 1.5 Skipped Tests
- [ ] Fix skipped tests not showing up in report
- [ ] Ensure skipped tests appear in:
  - Overview table
  - Skipped tests tab
  - Filter functionality

### 1.6 UI/UX Improvements
- [ ] Remove "Hide Details" button (not needed)
- [ ] Fix sorting by name and test ID not working
- [ ] Ensure proper test result table functionality

## Phase 2: Performance Reporter Issues (Medium Priority)

### 2.1 Test Count Accuracy
- [ ] Fix test executed quantity showing incorrect numbers
- [ ] Ensure performance report shows actual number of tests executed

### 2.2 Chart Separation
- [ ] Create separate charts for CPU and Memory (currently combined)
- [ ] Implement:
  - Dedicated CPU usage chart
  - Dedicated Memory usage chart
  - Timeline-based visualization

### 2.3 Per-Test Performance Table
- [ ] Create sortable table showing CPU and memory for every test
- [ ] Include columns:
  - Test ID
  - Test Name
  - Duration
  - CPU Usage (user/system/percentage)
  - Memory Usage (start/peak/used)
  - Attempts count
- [ ] Add sorting functionality for all columns

### 2.4 Performance Data Integration
- [ ] Ensure performance metrics are properly collected from test sessions
- [ ] Fix aggregation of performance data per test
- [ ] Handle multiple attempts correctly in performance tracking

## Phase 3: Code Quality and Testing (Critical)

### 3.1 Code Quality Checks
- [ ] Run ESLint and fix all errors
- [ ] Run TypeScript type checking and fix all errors
- [ ] Ensure no compilation warnings

### 3.2 Test Suite Validation
- [ ] Run full test suite and ensure all tests pass
- [ ] Fix any failing tests related to HTML reporter changes
- [ ] Validate performance reporter functionality

### 3.3 Integration Testing
- [ ] Test with actual test execution
- [ ] Validate HTML report generation
- [ ] Validate performance report generation
- [ ] Test with retry scenarios
- [ ] Test with skipped tests

## Phase 4: Documentation and Cleanup (Low Priority)

### 4.1 Documentation Updates
- [ ] Update HTML reporter documentation
- [ ] Update performance reporter documentation
- [ ] Update troubleshooting guide

### 4.2 Code Cleanup
- [ ] Remove unused code
- [ ] Optimize performance
- [ ] Add proper error handling

## Implementation Strategy

1. **Phase 1 (Current Focus)**: Fix critical HTML reporter issues
2. **Phase 2**: Address performance reporter problems
3. **Phase 3**: Ensure code quality and testing
4. **Phase 4**: Documentation and cleanup

## Success Criteria

- [ ] View details modal shows complete test information
- [ ] Search functionality works for all test attributes
- [ ] Filter tabs work correctly and show proper counts
- [ ] Test attempts are combined properly (no duplicates)
- [ ] Skipped tests appear in reports
- [ ] Performance report shows correct test count
- [ ] CPU and memory charts are separated
- [ ] Per-test performance table with sorting
- [ ] All ESLint and TypeScript checks pass
- [ ] All tests pass and are green