#!/bin/bash

# Endorphin AI Package Test Runner
# Comprehensive test runner for all package tests with logging

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"
RESULTS_DIR="$SCRIPT_DIR/results"
LOGS_DIR="$RESULTS_DIR/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
MAIN_LOG="$LOGS_DIR/test-run-$TIMESTAMP.log"
SUMMARY_LOG="$LOGS_DIR/summary-$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Ensure results directory exists
mkdir -p "$LOGS_DIR"

# Initialize log files
echo "Endorphin AI Package Test Run - $TIMESTAMP" > "$MAIN_LOG"
echo "=================================================" >> "$MAIN_LOG"
echo "" >> "$MAIN_LOG"

echo "Test Summary - $TIMESTAMP" > "$SUMMARY_LOG"
echo "=========================" >> "$SUMMARY_LOG"
echo "" >> "$SUMMARY_LOG"

# Logging function
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    echo "[$timestamp] [$level] $message" >> "$MAIN_LOG"
    
    case "$level" in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "HEADER")
            echo -e "${PURPLE}$message${NC}"
            ;;
    esac
}

# Test execution function
run_test_script() {
    local script_path="$1"
    local test_name="$2"
    local category="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log_message "INFO" "Starting test: $test_name ($category)"
    
    # Create individual test log
    local test_log="$LOGS_DIR/test-${category}-${test_name//\//_}-$TIMESTAMP.log"
    
    if [ -f "$script_path" ] && [ -x "$script_path" ]; then
        # Run the test script
        if "$script_path" > "$test_log" 2>&1; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
            log_message "SUCCESS" "Test passed: $test_name"
            echo "✅ PASS - $test_name" >> "$SUMMARY_LOG"
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
            log_message "ERROR" "Test failed: $test_name"
            echo "❌ FAIL - $test_name" >> "$SUMMARY_LOG"
            
            # Show last few lines of error
            echo "Last 10 lines of output:" >> "$MAIN_LOG"
            tail -10 "$test_log" >> "$MAIN_LOG"
            echo "" >> "$MAIN_LOG"
        fi
    else
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
        log_message "WARNING" "Test script not found or not executable: $script_path"
        echo "⏭️ SKIP - $test_name (script not found)" >> "$SUMMARY_LOG"
    fi
    
    echo "" >> "$MAIN_LOG"
}

# Print header
clear
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 Endorphin AI Package Test Runner            ║"
echo "║                                                              ║"
echo "║  Running comprehensive package tests with result logging     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

log_message "HEADER" "🚀 Starting Endorphin AI Package Test Suite"
log_message "INFO" "Test run timestamp: $TIMESTAMP"
log_message "INFO" "Main log: $MAIN_LOG"
log_message "INFO" "Summary log: $SUMMARY_LOG"

# Parse command line arguments
CATEGORY_FILTER=""
VERBOSE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --category)
            CATEGORY_FILTER="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --category CATEGORY  Run only tests from specified category"
            echo "                      (core, cli, recorder, reporter, web-runner, utils)"
            echo "  --verbose           Show detailed output"
            echo "  --dry-run           Show what would be run without executing"
            echo "  --help              Show this help message"
            echo ""
            echo "Available categories:"
            echo "  core        - Core functionality tests"
            echo "  cli         - CLI command tests"
            echo "  recorder    - Test recorder tests"
            echo "  reporter    - Reporter tests"
            echo "  web-runner  - Web UI runner tests"
            echo "  utils       - Utility and setup tests"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$CATEGORY_FILTER" != "" ]; then
    log_message "INFO" "Category filter: $CATEGORY_FILTER"
fi

if [ "$DRY_RUN" = true ]; then
    log_message "INFO" "DRY RUN MODE - No tests will be executed"
fi

echo ""
log_message "HEADER" "🧪 Test Categories and Scripts:"

# Define test categories and their scripts
# Using a different approach for macOS bash compatibility

get_core_tests() {
    # Setup must run first, then other core tests
    echo "core/setup-user-project.sh:Setup User Project
core/run-test.sh:Run Basic Test  
core/test-discovery-issue.sh:Test Discovery
core/test-search-api.sh:Search API Test"
}

get_cli_tests() {
    echo "cli/test-init-command.sh:Init Command
cli/quick-commands.sh:Quick Commands"
}

get_recorder_tests() {
    echo "recorder/test-recorder.sh:Test Recorder
recorder/test-recorder-location.sh:Recorder Location"
}

get_reporter_tests() {
    echo "reporter/test-console-reporter.sh:Console Reporter
reporter/test-html-reporter.sh:HTML Reporter
reporter/test-all-reporters.sh:All Reporters"
}

get_web_runner_tests() {
    echo "web-runner/test-web-ui.sh:Web UI
web-runner/test-web-ui-dashboard.sh:Web UI Dashboard
web-runner/test-execution-api.sh:Execution API
web-runner/quick-web-ui-test.sh:Quick Web UI"
}

get_utils_tests() {
    echo "utils/quick-fix-test.sh:Quick Fix Test"
}

# Get tests for a category
get_tests_for_category() {
    local category="$1"
    case "$category" in
        "core")
            get_core_tests
            ;;
        "cli")
            get_cli_tests
            ;;
        "recorder")
            get_recorder_tests
            ;;
        "reporter") 
            get_reporter_tests
            ;;
        "web-runner")
            get_web_runner_tests
            ;;
        "utils")
            get_utils_tests
            ;;
        *)
            echo ""
            ;;
    esac
}

# Run tests by category
categories="core cli recorder reporter web-runner utils"

# Always ensure setup runs first - this is a critical dependency
echo ""
log_message "HEADER" "🔧 Ensuring Setup Dependencies"

setup_script="$SCRIPTS_DIR/core/setup-user-project.sh"
setup_ran=false

# Check if we need to run setup
if [ ! -d "$SCRIPTS_DIR/../tmp/test-endorphin" ]; then
    log_message "INFO" "User project not found - setup required"
    setup_needed=true
elif [ "$CATEGORY_FILTER" = "core" ] || [ "$CATEGORY_FILTER" = "" ]; then
    log_message "INFO" "Running core tests or all tests - setup will be included"
    setup_needed=true
else
    log_message "INFO" "User project exists and not running core tests - checking if setup needed"
    # Even if filtering, run setup if the project seems incomplete
    if [ ! -f "$SCRIPTS_DIR/../tmp/test-endorphin/package.json" ]; then
        log_message "WARNING" "User project incomplete - forcing setup"
        setup_needed=true
    else
        setup_needed=false
    fi
fi

# Run setup first if needed
if [ "$setup_needed" = true ]; then
    echo ""
    log_message "HEADER" "🏗️ Running Essential Setup (Required Dependency)"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo "Would run: $setup_script (Setup User Project - REQUIRED FIRST)"
        TOTAL_TESTS=$((TOTAL_TESTS + 1))
        setup_ran=true
    else
        log_message "INFO" "Running setup as prerequisite for other tests"
        run_test_script "$setup_script" "Setup User Project" "setup"
        setup_ran=true
    fi
else
    setup_ran=false
fi

for category in $categories; do
    # Skip if category filter is set and doesn't match
    if [ "$CATEGORY_FILTER" != "" ] && [ "$CATEGORY_FILTER" != "$category" ]; then
        continue
    fi
    
    echo ""
    log_message "HEADER" "📂 Running $category tests"
    echo ""
    
    # Get tests for this category
    category_tests=$(get_tests_for_category "$category")
    
    # Parse tests for this category
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            script_file=$(echo "$line" | cut -d':' -f1 | xargs)
            test_name=$(echo "$line" | cut -d':' -f2 | xargs)
            
            if [ -n "$script_file" ] && [ -n "$test_name" ]; then
                script_path="$SCRIPTS_DIR/$script_file"
                
                # Skip setup if we already ran it as a dependency
                if [ "$script_file" = "core/setup-user-project.sh" ] && [ "$setup_ran" = true ]; then
                    log_message "INFO" "Skipping setup - already ran as dependency"
                    continue
                fi
                
                if [ "$DRY_RUN" = true ]; then
                    echo "Would run: $script_path ($test_name)"
                    TOTAL_TESTS=$((TOTAL_TESTS + 1))
                else
                    run_test_script "$script_path" "$test_name" "$category"
                fi
            fi
        fi
    done <<< "$category_tests"
done

# Generate final summary
echo ""
log_message "HEADER" "📊 Test Run Summary"

if [ "$DRY_RUN" = false ]; then
    echo "Total Tests: $TOTAL_TESTS" >> "$SUMMARY_LOG"
    echo "Passed: $PASSED_TESTS" >> "$SUMMARY_LOG"
    echo "Failed: $FAILED_TESTS" >> "$SUMMARY_LOG"
    echo "Skipped: $SKIPPED_TESTS" >> "$SUMMARY_LOG"
    echo "" >> "$SUMMARY_LOG"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo "Overall Result: SUCCESS" >> "$SUMMARY_LOG"
        log_message "SUCCESS" "All tests passed! 🎉"
    else
        echo "Overall Result: FAILURE" >> "$SUMMARY_LOG"
        log_message "ERROR" "Some tests failed. Check logs for details."
    fi
    
    log_message "INFO" "📊 Results Summary:"
    log_message "INFO" "  Total Tests: $TOTAL_TESTS"
    log_message "INFO" "  Passed: $PASSED_TESTS"
    log_message "INFO" "  Failed: $FAILED_TESTS"
    log_message "INFO" "  Skipped: $SKIPPED_TESTS"
    
    echo ""
    log_message "INFO" "📄 Log files saved to:"
    log_message "INFO" "  Main log: $MAIN_LOG"
    log_message "INFO" "  Summary: $SUMMARY_LOG"
    log_message "INFO" "  Individual test logs: $LOGS_DIR/"
else
    log_message "INFO" "DRY RUN - Would execute $TOTAL_TESTS tests"
fi

echo ""

# Exit with appropriate code
if [ "$DRY_RUN" = false ] && [ $FAILED_TESTS -gt 0 ]; then
    exit 1
else
    exit 0
fi
