#!/bin/bash
# test-issues-demo.sh
# Demonstrates the two key issues: test discovery and shutdown handling

set -e

echo "🐛 Demonstrating Known Issues"
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from tmp/test-endorphin directory${NC}"
    exit 1
fi

echo -e "${PURPLE}=== Issue 1: Test Discovery Problem ===${NC}"
echo -e "${YELLOW}CLI discovers tests correctly:${NC}"
npx endorphin list | head -5

echo -e "\n${YELLOW}Starting Web UI server to test discovery...${NC}"
npx endorphin serve --port 3002 --no-browser > webui-issue-demo.log 2>&1 &
SERVER_PID=$!

# Wait for server
sleep 5

echo -e "${YELLOW}Web UI API test discovery:${NC}"
API_TESTS=$(curl -s "http://localhost:3002/api/tests")
echo "API Response: $API_TESTS"

if echo "$API_TESTS" | grep -q "USER-001"; then
    echo -e "${GREEN}✅ Web UI correctly finds user tests${NC}"
else
    echo -e "${RED}❌ Web UI does NOT find user tests${NC}"
    echo -e "${RED}   This is the TEST DISCOVERY ISSUE${NC}"
fi

echo -e "\n${PURPLE}=== Issue 2: Shutdown Handling Problem ===${NC}"
echo -e "${YELLOW}Testing graceful shutdown with SIGTERM...${NC}"

if kill -TERM $SERVER_PID 2>/dev/null; then
    echo -e "${BLUE}Sent SIGTERM to server (PID: $SERVER_PID)${NC}"
    
    # Wait and check if process terminates gracefully
    sleep 3
    if ps -p $SERVER_PID >/dev/null 2>&1; then
        echo -e "${RED}❌ Server did NOT shutdown gracefully${NC}"
        echo -e "${RED}   This is the SHUTDOWN HANDLING ISSUE${NC}"
        kill -9 $SERVER_PID 2>/dev/null || true
    else
        echo -e "${GREEN}✅ Server shutdown gracefully${NC}"
    fi
else
    echo -e "${RED}❌ Failed to send SIGTERM${NC}"
fi

echo -e "\n${BLUE}=== Issues Summary ===${NC}"
echo "1. 🔍 Test Discovery: Web UI server doesn't use user project working directory"
echo "2. 🛑 Shutdown Handling: CLI doesn't handle SIGINT/SIGTERM properly"
echo ""
echo -e "${YELLOW}Next: Implement fixes for both issues${NC}"
