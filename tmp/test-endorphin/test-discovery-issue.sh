#!/bin/bash

# Quick test to demonstrate Web UI test discovery issue
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_PORT=3003
SERVER_PID=""

cleanup() {
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping server...${NC}"
        kill -TERM "$SERVER_PID" 2>/dev/null || true
        sleep 2
        kill -9 "$SERVER_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

echo -e "${BLUE}🔍 Testing Web UI Test Discovery Issue${NC}"
echo -e "${YELLOW}Current directory: $(pwd)${NC}"
echo -e "${YELLOW}Expected to find USER-001 test${NC}"

# Verify we have the test locally
echo -e "\n${BLUE}1. Verifying local test discovery (CLI):${NC}"
if endorphin list | grep -q "USER-001"; then
    echo -e "${GREEN}✅ CLI correctly finds USER-001 from user project${NC}"
else
    echo -e "${RED}❌ CLI doesn't find USER-001${NC}"
    exit 1
fi

# Start Web UI server
echo -e "\n${BLUE}2. Starting Web UI server from user project:${NC}"
endorphin serve --port $TEST_PORT --no-browser > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server
echo -e "${YELLOW}Waiting for server to start...${NC}"
for i in {1..10}; do
    if curl -s "http://localhost:$TEST_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server started${NC}"
        break
    fi
    sleep 1
    if [[ $i -eq 10 ]]; then
        echo -e "${RED}❌ Server failed to start${NC}"
        exit 1
    fi
done

# Test API test discovery
echo -e "\n${BLUE}3. Testing Web UI API test discovery:${NC}"
API_RESPONSE=$(curl -s "http://localhost:$TEST_PORT/api/tests")
echo -e "${YELLOW}API Response:${NC}"
echo "$API_RESPONSE" | jq . 2>/dev/null || echo "$API_RESPONSE"

if echo "$API_RESPONSE" | grep -q "USER-001"; then
    echo -e "${GREEN}✅ Web UI API correctly finds USER-001${NC}"
else
    echo -e "${RED}❌ Web UI API does NOT find USER-001${NC}"
    echo -e "${YELLOW}This confirms the test discovery issue!${NC}"
    echo -e "${YELLOW}Web UI is running from framework directory, not user project${NC}"
fi

echo -e "\n${BLUE}Test completed. Press Ctrl+C to stop server.${NC}"
sleep 5
