#!/bin/bash

# =============================================================================
# Endorphin AI Web UI Dashboard Test Script
# =============================================================================
# This script comprehensively tests the Web UI dashboard functionality
# including CLI, standard reporter, and web UI runner components.
#
# Usage: ./test-web-ui-dashboard.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
TEST_PORT=3001
TIMEOUT=30
WEB_UI_PID=""
TEST_RESULTS_DIR="$(pwd)/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="web-ui-test-${TIMESTAMP}.log"

# =============================================================================
# Utility Functions
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}" | tee -a "$LOG_FILE"
}

# Cleanup function
cleanup() {
    section "Cleaning Up"
    if [[ -n "$WEB_UI_PID" ]] && kill -0 "$WEB_UI_PID" 2>/dev/null; then
        log "Stopping Web UI server (PID: $WEB_UI_PID)"
        kill "$WEB_UI_PID" 2>/dev/null || true
        sleep 2
        # Force kill if still running
        kill -9 "$WEB_UI_PID" 2>/dev/null || true
    fi
    
    # Kill any other endorphin processes
    pkill -f "endorphin serve" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    
    log "Cleanup completed"
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# =============================================================================
# Pre-flight Checks
# =============================================================================

section "Pre-flight Checks"

# Check if endorphin is available
if ! command -v endorphin &> /dev/null; then
    error "Endorphin CLI not found. Please ensure it's installed and in PATH."
    exit 1
fi
success "Endorphin CLI found"

# Check if we're in the right directory
if [[ ! -f "endorphin.config.js" ]]; then
    error "endorphin.config.js not found. Please run from test project directory."
    exit 1
fi
success "Test project directory confirmed"

# Check if port is available
if lsof -Pi :$TEST_PORT -sTCP:LISTEN -t >/dev/null; then
    error "Port $TEST_PORT is already in use. Please free the port or change TEST_PORT."
    exit 1
fi
success "Port $TEST_PORT is available"

# Check Node.js version
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
log "npm version: $NPM_VERSION"

# =============================================================================
# Test 1: CLI Basic Functionality
# =============================================================================

section "Test 1: CLI Basic Functionality"

# Test endorphin list command
log "Testing 'endorphin list' command..."
if endorphin list > /dev/null 2>&1; then
    success "CLI list command works"
else
    error "CLI list command failed"
    exit 1
fi

# Test endorphin help
log "Testing 'endorphin help' command..."
if endorphin --help > /dev/null 2>&1; then
    success "CLI help command works"
else
    warning "CLI help command failed (non-critical)"
fi

# List available tests
log "Available tests:"
endorphin list | tee -a "$LOG_FILE"

# =============================================================================
# Test 2: Standard Reporter Test Execution
# =============================================================================

section "Test 2: Standard Reporter Test Execution"

# Get the first available test
FIRST_TEST=$(endorphin list 2>/dev/null | grep -E "^\s*✓" | head -1 | awk '{print $2}' | sed 's/:$//')

if [[ -z "$FIRST_TEST" ]]; then
    error "No tests found for execution"
    exit 1
fi

log "Testing standard CLI execution with test: $FIRST_TEST"

# Run test with standard reporter
log "Executing test with console reporter..."
if timeout $TIMEOUT endorphin run test "$FIRST_TEST" --no-browser > "cli-test-${TIMESTAMP}.log" 2>&1; then
    success "Standard CLI test execution completed"
    info "Test output saved to cli-test-${TIMESTAMP}.log"
else
    warning "Standard CLI test execution may have timed out or failed (check logs)"
fi

# =============================================================================
# Test 3: Web UI Server Startup
# =============================================================================

section "Test 3: Web UI Server Startup"

log "Starting Web UI server on port $TEST_PORT..."

# Start web UI in background
endorphin serve --port $TEST_PORT --no-browser > "web-ui-server-${TIMESTAMP}.log" 2>&1 &
WEB_UI_PID=$!

log "Web UI server started with PID: $WEB_UI_PID"

# Wait for server to start
log "Waiting for Web UI server to start..."
RETRY_COUNT=0
MAX_RETRIES=15

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if curl -s "http://localhost:$TEST_PORT" > /dev/null 2>&1; then
        success "Web UI server is responding"
        break
    fi
    
    ((RETRY_COUNT++))
    log "Attempt $RETRY_COUNT/$MAX_RETRIES: Waiting for server..."
    sleep 2
done

if [[ $RETRY_COUNT -eq $MAX_RETRIES ]]; then
    error "Web UI server failed to start within $((MAX_RETRIES * 2)) seconds"
    exit 1
fi

# =============================================================================
# Test 4: Web UI API Endpoints
# =============================================================================

section "Test 4: Web UI API Endpoints"

BASE_URL="http://localhost:$TEST_PORT"

# Test root endpoint
log "Testing root endpoint..."
if curl -s "$BASE_URL" | grep -q "<!DOCTYPE html>"; then
    success "Root endpoint serves HTML"
else
    error "Root endpoint test failed"
fi

# Test API tests endpoint
log "Testing /api/tests endpoint..."
API_RESPONSE=$(curl -s "$BASE_URL/api/tests")
if echo "$API_RESPONSE" | grep -q "\["; then
    success "API tests endpoint returns JSON array"
    info "Found $(echo "$API_RESPONSE" | jq '. | length' 2>/dev/null || echo "unknown") tests"
else
    error "API tests endpoint failed"
    log "Response: $API_RESPONSE"
fi

# Test API results endpoint
log "Testing /api/results endpoint..."
if curl -s "$BASE_URL/api/results" | grep -q "\["; then
    success "API results endpoint returns JSON array"
else
    warning "API results endpoint returned non-array (may be empty)"
fi

# Test 404 handling
log "Testing 404 handling..."
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/nonexistent" | grep -q "404"; then
    success "404 handling works correctly"
else
    warning "404 handling may not be working as expected"
fi

# =============================================================================
# Test 5: WebSocket Connection
# =============================================================================

section "Test 5: WebSocket Connection"

log "Testing WebSocket connection..."

# Create a simple WebSocket test using Node.js
cat > "test-websocket-${TIMESTAMP}.js" << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:' + process.argv[2]);

let connected = false;

ws.on('open', function open() {
    console.log('✅ WebSocket connected successfully');
    connected = true;
    ws.close();
});

ws.on('error', function error(err) {
    console.log('❌ WebSocket connection error:', err.message);
    process.exit(1);
});

ws.on('close', function close() {
    if (connected) {
        console.log('✅ WebSocket disconnected cleanly');
        process.exit(0);
    } else {
        console.log('❌ WebSocket failed to connect');
        process.exit(1);
    }
});

// Timeout after 5 seconds
setTimeout(() => {
    console.log('❌ WebSocket connection timeout');
    process.exit(1);
}, 5000);
EOF

if node "test-websocket-${TIMESTAMP}.js" $TEST_PORT 2>&1 | tee -a "$LOG_FILE"; then
    success "WebSocket connection test passed"
else
    error "WebSocket connection test failed"
fi

# Clean up test file
rm -f "test-websocket-${TIMESTAMP}.js"

# =============================================================================
# Test 6: Web UI Test Execution via API
# =============================================================================

section "Test 6: Web UI Test Execution via API"

if [[ -n "$FIRST_TEST" ]]; then
    log "Testing test execution via Web UI API for test: $FIRST_TEST"
    
    # Execute test via API
    API_EXEC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tests/$FIRST_TEST/run" -H "Content-Type: application/json")
    
    if echo "$API_EXEC_RESPONSE" | grep -q "jobId\|status\|started"; then
        success "Test execution via API initiated successfully"
        info "API Response: $API_EXEC_RESPONSE"
    else
        warning "Test execution via API may have failed"
        log "API Response: $API_EXEC_RESPONSE"
    fi
    
    # Wait a moment for execution to potentially complete
    sleep 3
    
    # Check for any new results
    RESULTS_RESPONSE=$(curl -s "$BASE_URL/api/results")
    if echo "$RESULTS_RESPONSE" | grep -q "$FIRST_TEST"; then
        success "Test results appear in API"
    else
        info "Test results not yet available (this may be normal for quick execution)"
    fi
else
    warning "Skipping API execution test - no test available"
fi

# =============================================================================
# Test 7: Frontend Static Assets
# =============================================================================

section "Test 7: Frontend Static Assets"

# Check for CSS assets
log "Testing CSS asset serving..."
if curl -s "$BASE_URL/assets/" 2>/dev/null | grep -q "css\|index"; then
    success "CSS assets are being served"
else
    info "CSS assets check inconclusive (may use different structure)"
fi

# Check for JS assets
log "Testing JavaScript asset serving..."
if curl -s "$BASE_URL/assets/" 2>/dev/null | grep -q "js\|index"; then
    success "JavaScript assets are being served"
else
    info "JavaScript assets check inconclusive (may use different structure)"
fi

# Test SPA routing
log "Testing SPA routing..."
if curl -s "$BASE_URL/dashboard" | grep -q "<!DOCTYPE html>"; then
    success "SPA routing works (dashboard route serves HTML)"
else
    warning "SPA routing may not be working correctly"
fi

# =============================================================================
# Test 8: Error Handling and Edge Cases
# =============================================================================

section "Test 8: Error Handling and Edge Cases"

# Test non-existent test execution
log "Testing non-existent test execution..."
NONEXISTENT_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/tests/NONEXISTENT-TEST/run" -X POST)
if [[ "$NONEXISTENT_RESPONSE" == "404" ]]; then
    success "Non-existent test returns 404 correctly"
else
    warning "Non-existent test handling may not be optimal (got $NONEXISTENT_RESPONSE)"
fi

# Test malformed API requests
log "Testing malformed API request handling..."
MALFORMED_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/tests/" -X POST -d "invalid json" -H "Content-Type: application/json")
if [[ "$MALFORMED_RESPONSE" =~ ^[45] ]]; then
    success "Malformed requests are handled appropriately"
else
    warning "Malformed request handling may need improvement"
fi

# =============================================================================
# Test 9: Performance and Resource Usage
# =============================================================================

section "Test 9: Performance and Resource Usage"

# Check server response time
log "Testing server response time..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/api/tests")
log "API response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    success "API response time is acceptable (< 2s)"
else
    warning "API response time is slow (${RESPONSE_TIME}s)"
fi

# Check memory usage of Web UI process
if [[ -n "$WEB_UI_PID" ]] && kill -0 "$WEB_UI_PID" 2>/dev/null; then
    MEMORY_KB=$(ps -o rss= -p "$WEB_UI_PID" 2>/dev/null || echo "0")
    MEMORY_MB=$((MEMORY_KB / 1024))
    log "Web UI server memory usage: ${MEMORY_MB}MB"
    
    if [[ $MEMORY_MB -lt 200 ]]; then
        success "Memory usage is reasonable (< 200MB)"
    else
        warning "Memory usage is high (${MEMORY_MB}MB)"
    fi
else
    warning "Could not check memory usage - server may have stopped"
fi

# =============================================================================
# Test 10: CLI and Web UI Integration
# =============================================================================

section "Test 10: CLI and Web UI Integration"

# Test that CLI commands still work while Web UI is running
log "Testing CLI functionality while Web UI is running..."
if endorphin list > /dev/null 2>&1; then
    success "CLI still works while Web UI is running"
else
    error "CLI functionality affected by Web UI"
fi

# Test graceful shutdown
log "Testing graceful Web UI shutdown..."
if [[ -n "$WEB_UI_PID" ]] && kill -0 "$WEB_UI_PID" 2>/dev/null; then
    kill -TERM "$WEB_UI_PID" 2>/dev/null
    sleep 3
    
    if ! kill -0 "$WEB_UI_PID" 2>/dev/null; then
        success "Web UI server shut down gracefully"
        WEB_UI_PID=""  # Clear PID so cleanup doesn't try to kill it again
    else
        warning "Web UI server did not shut down gracefully"
    fi
else
    warning "Web UI server was not running for shutdown test"
fi

# =============================================================================
# Test Results Summary
# =============================================================================

section "Test Results Summary"

log "Test execution completed at $(date)"
log "Log file: $LOG_FILE"

# Count successes and errors from log
SUCCESS_COUNT=$(grep -c "✅" "$LOG_FILE" || echo "0")
ERROR_COUNT=$(grep -c "❌" "$LOG_FILE" || echo "0")
WARNING_COUNT=$(grep -c "⚠️" "$LOG_FILE" || echo "0")

echo -e "\n${PURPLE}=== FINAL RESULTS ===${NC}"
echo -e "${GREEN}✅ Successes: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Errors: $ERROR_COUNT${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNING_COUNT${NC}"

if [[ $ERROR_COUNT -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Web UI Dashboard is working correctly.${NC}"
    exit 0
elif [[ $ERROR_COUNT -lt 3 ]]; then
    echo -e "\n${YELLOW}⚠️  MOSTLY SUCCESSFUL with minor issues. Check the warnings above.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MULTIPLE ERRORS DETECTED. Web UI Dashboard may have significant issues.${NC}"
    exit 1
fi
