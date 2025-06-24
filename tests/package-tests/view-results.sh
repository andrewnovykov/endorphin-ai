#!/bin/bash

# Test Results Viewer
# Display recent test results and logs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
LOGS_DIR="$RESULTS_DIR/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}📊 Endorphin AI Package Test Results Viewer${NC}"
echo "============================================="

# Check if results directory exists
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${YELLOW}⚠️ No test results found. Run ./run-all-tests.sh first.${NC}"
    exit 0
fi

# List recent test runs
echo ""
echo -e "${BLUE}🕒 Recent Test Runs:${NC}"
echo ""

# Find and sort log files by date
recent_runs=$(find "$LOGS_DIR" -name "summary-*.log" -type f | sort -r | head -10)

if [ -z "$recent_runs" ]; then
    echo -e "${YELLOW}No test run summaries found.${NC}"
    exit 0
fi

# Display recent runs
count=1
declare -a run_files
declare -a run_timestamps

while IFS= read -r logfile; do
    if [ -f "$logfile" ]; then
        # Extract timestamp from filename
        timestamp=$(basename "$logfile" | sed 's/summary-\(.*\)\.log/\1/')
        formatted_timestamp=$(echo "$timestamp" | sed 's/_/ /' | sed 's/-/:/g')
        
        run_files[$count]="$logfile"
        run_timestamps[$count]="$timestamp"
        
        echo -e "${PURPLE}[$count]${NC} $formatted_timestamp"
        
        # Show quick summary from the file
        if grep -q "Overall Result:" "$logfile"; then
            result=$(grep "Overall Result:" "$logfile" | cut -d':' -f2 | xargs)
            if [ "$result" = "SUCCESS" ]; then
                echo -e "    ${GREEN}✅ $result${NC}"
            else
                echo -e "    ${RED}❌ $result${NC}"
            fi
        fi
        
        # Show test counts
        if grep -q "Total Tests:" "$logfile"; then
            total=$(grep "Total Tests:" "$logfile" | cut -d':' -f2 | xargs)
            passed=$(grep "Passed:" "$logfile" | cut -d':' -f2 | xargs)
            failed=$(grep "Failed:" "$logfile" | cut -d':' -f2 | xargs)
            echo "    Tests: $total total, $passed passed, $failed failed"
        fi
        echo ""
        
        count=$((count + 1))
        if [ $count -gt 10 ]; then
            break
        fi
    fi
done <<< "$recent_runs"

# Interactive selection
echo ""
echo -e "${BLUE}Select a test run to view details (1-$((count-1))), or press Enter to exit:${NC}"
read -r selection

if [ -n "$selection" ] && [ "$selection" -ge 1 ] && [ "$selection" -lt "$count" ]; then
    selected_timestamp="${run_timestamps[$selection]}"
    summary_file="${run_files[$selection]}"
    main_log="$LOGS_DIR/test-run-$selected_timestamp.log"
    
    echo ""
    echo -e "${CYAN}📄 Test Run Details - $selected_timestamp${NC}"
    echo "=================================================="
    
    # Show summary
    if [ -f "$summary_file" ]; then
        echo ""
        echo -e "${BLUE}📋 Summary:${NC}"
        cat "$summary_file"
    fi
    
    # Show main log excerpt
    if [ -f "$main_log" ]; then
        echo ""
        echo -e "${BLUE}📝 Main Log (last 50 lines):${NC}"
        echo "----------------------------------------"
        tail -50 "$main_log"
    fi
    
    # Show individual test logs
    echo ""
    echo -e "${BLUE}📁 Individual Test Logs:${NC}"
    individual_logs=$(find "$LOGS_DIR" -name "test-*-$selected_timestamp.log" -type f | sort)
    
    if [ -n "$individual_logs" ]; then
        while IFS= read -r logfile; do
            if [ -f "$logfile" ]; then
                test_name=$(basename "$logfile" | sed "s/test-\(.*\)-$selected_timestamp\.log/\1/")
                echo "  📄 $test_name: $logfile"
            fi
        done <<< "$individual_logs"
        
        echo ""
        echo -e "${YELLOW}💡 To view individual test log: cat $LOGS_DIR/test-CATEGORY-TESTNAME-$selected_timestamp.log${NC}"
    else
        echo "  No individual test logs found for this run."
    fi
    
else
    echo "Exiting..."
fi

echo ""
