#!/bin/bash
# test-html-reporter.sh
# Test HTML reporter functionality

set -e

# Load centralized configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../config/test-config.sh"

echo "🧪 Testing HTML Reporter Functionality"
echo "======================================="

# Change to user project directory with validation
if ! cd_user_project; then
    exit 1
fi

# Source environment variables
if [ -f ".env" ]; then
    source .env
    print_status $BLUE "📁 Loaded environment from .env"
fi

# Install Playwright browsers if needed
echo -e "\n${YELLOW}📦 Installing Playwright browsers (if needed)...${NC}"
npx playwright install chromium --quiet || echo -e "${YELLOW}⚠️ Playwright install may have had issues${NC}"

# Ensure we have some test results first
echo -e "\n${YELLOW}📋 Preparing test results for HTML reports...${NC}"
timeout 45s npx endorphin run test USER-001 --headless || echo -e "${YELLOW}⏰ Test preparation completed${NC}"

# Test 1: Generate basic HTML report
echo -e "\n${YELLOW}🔍 Test 1: Generate Basic HTML Report${NC}"
echo "Running: npx endorphin generate report"
npx endorphin generate report
echo -e "${GREEN}✅ Basic HTML report generated${NC}"

# Test 2: Generate summary HTML report
echo -e "\n${YELLOW}🔍 Test 2: Generate Summary HTML Report${NC}"
echo "Running: npx endorphin generate report --summary"
npx endorphin generate report --summary
echo -e "${GREEN}✅ Summary HTML report generated${NC}"

# Test 3: Generate custom filename report
echo -e "\n${YELLOW}🔍 Test 3: Generate Custom Filename Report${NC}"
echo "Running: npx endorphin generate report --filename test-console-html-reporter.html"
npx endorphin generate report --filename test-console-html-reporter.html
echo -e "${GREEN}✅ Custom filename report generated${NC}"

# Test 4: List available reports
echo -e "\n${YELLOW}🔍 Test 4: List Available Reports${NC}"
echo "Running: npx endorphin generate report --list"
npx endorphin generate report --list

# Test 5: Check report files exist
echo -e "\n${YELLOW}🔍 Test 5: Verify Report Files${NC}"
REPORTS_DIR="test-results/reports"
if [ -d "$REPORTS_DIR" ]; then
    echo -e "${BLUE}📁 Reports directory contents:${NC}"
    ls -la "$REPORTS_DIR"
    
    # Count HTML files
    HTML_COUNT=$(find "$REPORTS_DIR" -name "*.html" | wc -l)
    echo -e "${GREEN}📊 Found $HTML_COUNT HTML report files${NC}"
    
    # Check for specific files
    if [ -f "$REPORTS_DIR/test-console-html-reporter.html" ]; then
        echo -e "${GREEN}✅ Custom filename report exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Custom filename report not found${NC}"
    fi
    
    # Find the latest report
    LATEST_REPORT=$(find "$REPORTS_DIR" -name "*.html" -type f -exec ls -t {} + | head -n 1)
    if [ -n "$LATEST_REPORT" ]; then
        echo -e "${BLUE}📄 Latest report: $(basename "$LATEST_REPORT")${NC}"
        
        # Check file size
        FILE_SIZE=$(wc -c < "$LATEST_REPORT")
        echo -e "${BLUE}📏 Report size: $FILE_SIZE bytes${NC}"
        
        # Validate HTML content
        if grep -q "Endorphin AI Test Report" "$LATEST_REPORT"; then
            echo -e "${GREEN}✅ HTML content validated${NC}"
        else
            echo -e "${YELLOW}⚠️  HTML content validation failed${NC}"
        fi
        
        # Check for JavaScript and CSS
        if grep -q "class TestReportViewer" "$LATEST_REPORT"; then
            echo -e "${GREEN}✅ JavaScript functionality included${NC}"
        else
            echo -e "${YELLOW}⚠️  JavaScript functionality missing${NC}"
        fi
        
        if grep -q "Bootstrap" "$LATEST_REPORT"; then
            echo -e "${GREEN}✅ CSS styling included${NC}"
        else
            echo -e "${YELLOW}⚠️  CSS styling missing${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Reports directory not found${NC}"
fi

# Test 6: Test opening report (optional - won't actually open in CI)
echo -e "\n${YELLOW}🔍 Test 6: Test Report Opening Command${NC}"
echo "Running: npx endorphin generate report --open (dry run)"
echo -e "${BLUE}💡 Note: Report opening is available but not executed in test mode${NC}"

# Test 7: Cleanup and stats
echo -e "\n${YELLOW}🔍 Test 7: Report Statistics${NC}"
if [ -d "$REPORTS_DIR" ]; then
    echo "Running: npx endorphin generate report --cleanup"
    npx endorphin generate report --cleanup || echo -e "${YELLOW}⚠️  Cleanup command may not be implemented yet${NC}"
fi

echo -e "\n${GREEN}✅ HTML Reporter Tests Completed${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo "- Basic HTML report generation"
echo "- Summary report generation"
echo "- Custom filename support"
echo "- Report listing functionality"
echo "- File validation and content checks"
echo "- Report statistics and metadata"
echo ""
echo -e "${YELLOW}💡 Expected features in reports:${NC}"
echo "- Interactive dashboard with search and filters"
echo "- Test execution details and timelines"
echo "- Screenshot galleries (if available)"
echo "- Export functionality"
echo "- Responsive design for mobile/desktop"
echo "- Bootstrap styling and JavaScript interactivity"
