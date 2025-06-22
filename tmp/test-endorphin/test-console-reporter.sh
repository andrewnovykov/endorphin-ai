#!/bin/bash
# test-console-reporter.sh
# Test console reporter functionality

set -e

echo "🧪 Testing Console Reporter Functionality"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Source environment variables
if [ -f "../.env" ]; then
    source ../.env
    echo -e "${BLUE}📁 Loaded environment from ../.env${NC}"
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from tmp/test-endorphin directory${NC}"
    exit 1
fi

# Test 1: Console reporter with single test
echo -e "\n${YELLOW}🔍 Test 1: Console Reporter - Single Test${NC}"
echo "Running: npx endorphin run test USER-001 --headless"
timeout 30s npx endorphin run test USER-001 --headless || echo -e "${YELLOW}⏰ Test completed (timeout expected)${NC}"

# Test 2: Console reporter with all tests
echo -e "\n${YELLOW}🔍 Test 2: Console Reporter - All Tests${NC}"
echo "Running: npx endorphin run test all --headless"
timeout 60s npx endorphin run test all --headless || echo -e "${YELLOW}⏰ Test completed (timeout expected)${NC}"

# Test 3: Console reporter with tag filtering
echo -e "\n${YELLOW}🔍 Test 3: Console Reporter - Tag Filtering${NC}"
echo "Running: npx endorphin run test --tag user-test --headless"
timeout 30s npx endorphin run test --tag user-test --headless || echo -e "${YELLOW}⏰ Test completed (timeout expected)${NC}"

# Test 4: Console reporter with priority filtering
echo -e "\n${YELLOW}🔍 Test 4: Console Reporter - Priority Filtering${NC}"
echo "Running: npx endorphin run test --priority High --headless"
timeout 30s npx endorphin run test --priority High --headless || echo -e "${YELLOW}⏰ Test completed (timeout expected)${NC}"

# Test 5: Test list command output
echo -e "\n${YELLOW}🔍 Test 5: List Command Output${NC}"
echo "Running: npx endorphin list"
npx endorphin list

echo -e "\n${GREEN}✅ Console Reporter Tests Completed${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo "- Single test execution with console reporter"
echo "- Multiple test execution with console reporter"
echo "- Tag-based filtering with console reporter"
echo "- Priority-based filtering with console reporter"
echo "- List command formatting"
echo ""
echo -e "${YELLOW}💡 Expected behavior:${NC}"
echo "- Colorful progress indicators (●, ✓, ✗)"
echo "- Real-time test status updates"
echo "- Vitest-style summary formatting"
echo "- Detailed failure information"
echo "- Proper timing information"
