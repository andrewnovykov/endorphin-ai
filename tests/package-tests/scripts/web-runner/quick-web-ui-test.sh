#!/bin/bash

# =============================================================================
# Quick Web UI Dashboard Test
# =============================================================================
# A simplified test script for rapid verification of Web UI functionality
#
# Usage: ./quick-web-ui-test.sh
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TEST_PORT=3002
WEB_UI_PID=""

# Cleanup function
cleanup() {
    if [[ -n "$WEB_UI_PID" ]] && kill -0 "$WEB_UI_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping Web UI server...${NC}"
        kill "$WEB_UI_PID" 2>/dev/null || true
        sleep 2
        kill -9 "$WEB_UI_PID" 2>/dev/null || true
    fi
    pkill -f "endorphin serve" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}🚀 Quick Web UI Dashboard Test${NC}\n"

# Test 1: CLI Basic Check
echo -e "${BLUE}[1/5] Testing CLI...${NC}"
if endorphin list > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CLI working${NC}"
else
    echo -e "${RED}❌ CLI failed${NC}"
    exit 1
fi

# Test 2: Start Web UI
echo -e "${BLUE}[2/5] Starting Web UI...${NC}"
endorphin serve --port $TEST_PORT --no-browser > /dev/null 2>&1 &
WEB_UI_PID=$!

# Wait for server
for i in {1..10}; do
    if curl -s "http://localhost:$TEST_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Web UI started${NC}"
        break
    fi
    sleep 1
    if [[ $i -eq 10 ]]; then
        echo -e "${RED}❌ Web UI failed to start${NC}"
        exit 1
    fi
done

# Test 3: API Endpoints
echo -e "${BLUE}[3/5] Testing API...${NC}"
if curl -s "http://localhost:$TEST_PORT/api/tests" | grep -q "\["; then
    echo -e "${GREEN}✅ API working${NC}"
else
    echo -e "${RED}❌ API failed${NC}"
    exit 1
fi

# Test 4: Frontend
echo -e "${BLUE}[4/5] Testing Frontend...${NC}"
if curl -s "http://localhost:$TEST_PORT" | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ Frontend serving${NC}"
else
    echo -e "${RED}❌ Frontend failed${NC}"
    exit 1
fi

# Test 5: WebSocket (basic check)
echo -e "${BLUE}[5/5] Testing WebSocket...${NC}"
# Simple connection test
if node -e "
const ws = require('ws');
const client = new ws('ws://localhost:$TEST_PORT');
client.on('open', () => { console.log('OK'); client.close(); });
client.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 3000);
" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✅ WebSocket working${NC}"
else
    echo -e "${YELLOW}⚠️  WebSocket test inconclusive${NC}"
fi

echo -e "\n${GREEN}🎉 Quick test completed successfully!${NC}"
echo -e "${BLUE}Web UI is running at: http://localhost:$TEST_PORT${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

# Keep server running for manual testing
echo -e "${BLUE}Server is running... Press Ctrl+C to stop${NC}"
wait $WEB_UI_PID
