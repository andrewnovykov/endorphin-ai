#!/bin/bash
# quick-fix-test.sh
# Quick test to verify both fixes work

set -e

echo "🔧 Quick Fix Validation Test"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must be run from tmp/test-endorphin directory${NC}"
    exit 1
fi

echo -e "${BLUE}=== Test 1: CLI Test Discovery ===${NC}"
CLI_OUTPUT=$(npx endorphin list 2>&1)
if echo "$CLI_OUTPUT" | grep -q "USER-001"; then
    echo -e "${GREEN}✅ CLI correctly discovers USER-001${NC}"
else
    echo -e "${RED}❌ CLI failed to discover USER-001${NC}"
    echo "Output: $CLI_OUTPUT"
    exit 1
fi

echo -e "\n${BLUE}=== Test 2: Web UI Test Discovery ===${NC}"
echo -e "${YELLOW}Starting server (10s timeout)...${NC}"

# Start server in background
npx endorphin serve --port 3003 --no-browser > webui-test.log 2>&1 &
SERVER_PID=$!

# Wait for server startup
sleep 4

# Test API
echo -e "${YELLOW}Testing Web UI API...${NC}"
API_RESPONSE=$(curl -s "http://localhost:3003/api/tests" 2>/dev/null || echo "ERROR")

if echo "$API_RESPONSE" | grep -q "USER-001"; then
    echo -e "${GREEN}✅ Web UI API correctly discovers USER-001${NC}"
    TEST_DISCOVERY_FIXED=true
else
    echo -e "${RED}❌ Web UI API failed to discover USER-001${NC}"
    echo "API Response: $API_RESPONSE"
    TEST_DISCOVERY_FIXED=false
fi

echo -e "\n${BLUE}=== Test 3: Graceful Shutdown ===${NC}"
echo -e "${YELLOW}Testing SIGTERM shutdown...${NC}"

if kill -TERM $SERVER_PID 2>/dev/null; then
    echo -e "${BLUE}Sent SIGTERM to server (PID: $SERVER_PID)${NC}"
    
    # Wait up to 5 seconds for graceful shutdown
    for i in {1..5}; do
        if ! ps -p $SERVER_PID >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Server shutdown gracefully in ${i} seconds${NC}"
            SHUTDOWN_FIXED=true
            break
        fi
        sleep 1
    done
    
    # Check if still running
    if ps -p $SERVER_PID >/dev/null 2>&1; then
        echo -e "${RED}❌ Server did NOT shutdown gracefully${NC}"
        kill -9 $SERVER_PID 2>/dev/null || true
        SHUTDOWN_FIXED=false
    fi
else
    echo -e "${RED}❌ Failed to send SIGTERM${NC}"
    SHUTDOWN_FIXED=false
fi

echo -e "\n${BLUE}=== RESULTS SUMMARY ===${NC}"
echo -e "1. CLI Test Discovery: ${GREEN}✅ Working${NC}"

if [ "$TEST_DISCOVERY_FIXED" = true ]; then
    echo -e "2. Web UI Test Discovery: ${GREEN}✅ FIXED${NC}"
else
    echo -e "2. Web UI Test Discovery: ${RED}❌ Still broken${NC}"
fi

if [ "$SHUTDOWN_FIXED" = true ]; then
    echo -e "3. Graceful Shutdown: ${GREEN}✅ FIXED${NC}"
else
    echo -e "3. Graceful Shutdown: ${RED}❌ Still broken${NC}"
fi

if [ "$TEST_DISCOVERY_FIXED" = true ] && [ "$SHUTDOWN_FIXED" = true ]; then
    echo -e "\n${GREEN}🎉 Both issues have been FIXED!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some issues remain${NC}"
    exit 1
fi
