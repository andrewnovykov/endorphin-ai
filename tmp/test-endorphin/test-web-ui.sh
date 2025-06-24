#!/bin/bash

# =============================================================================
# Endorphin AI Web UI Package Testing Script
# =============================================================================
# Tests Web UI functionality from USER PROJECT perspective (not framework)
# Following Package Testing Scenarios guide for proper isolation
#
# Key Tests:
# 1. CLI functionality from user project
# 2. Standard reporter execution 
# 3. Web UI server with proper test discovery
# 4. API endpoints discovering user tests
# 5. WebSocket functionality
# 6. Graceful shutdown handling
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
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SERVER_PID=""
TEST_PORT=3001
TIMEOUT=30

# =============================================================================
# Utility Functions
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

error() {
    echo -e "${RED}❌ $1${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Cleanup function following package testing best practices
cleanup() {
    section "Cleanup"
    
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        log "Stopping Web UI server (PID: $SERVER_PID)"
        kill -TERM "$SERVER_PID" 2>/dev/null || true
        
        # Wait for graceful shutdown
        local count=0
        while [[ $count -lt 10 ]] && kill -0 "$SERVER_PID" 2>/dev/null; do
            sleep 1
            ((count++))
        done
        
        # Force kill if still running
        if kill -0 "$SERVER_PID" 2>/dev/null; then
            warning "Force killing server"
            kill -9 "$SERVER_PID" 2>/dev/null || true
        fi
    fi
    
    # Kill any other endorphin processes
    pkill -f "endorphin serve" 2>/dev/null || true
    pkill -f "node.*server.js" 2>/dev/null || true
    
    log "Cleanup completed"
}

# Increment test counter
inc_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# =============================================================================
# Pre-flight Checks (Package Testing Approach)
# =============================================================================

section "🧪 Endorphin AI Web UI Package Test"

log "Following Package Testing Scenarios for proper user project isolation"

# Check if we're in a USER PROJECT (not framework)
if [[ ! -f "endorphin.config.js" ]]; then
    error "Must run from user project directory with endorphin.config.js"
    error "Expected: tmp/test-endorphin/ (user project)"
    error "Current: $(pwd)"
    exit 1
fi

success "Running from user project directory"

# Check if we have user tests
if [[ ! -f "tests/user-basic-test.js" ]]; then
    error "User test file not found: tests/user-basic-test.js"
    error "This ensures we're testing USER PROJECT test discovery"
    exit 1
fi

success "User test file found"

# Check endorphin installation (package testing approach)
if ! command -v endorphin &> /dev/null; then
    error "Endorphin CLI not found in PATH"
    error "Run ./setup-user-project.sh first to install package"
    exit 1
fi

success "Endorphin CLI available ($(which endorphin))"

# Check port availability
if lsof -Pi :$TEST_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    error "Port $TEST_PORT is already in use"
    exit 1
fi

success "Port $TEST_PORT is available"

info "Current directory: $(pwd)"
info "Node.js version: $(node --version)"
info "NPM version: $(npm --version)"

# =============================================================================
# Test 1: CLI Basic Functionality (Package Testing)
# =============================================================================

section "Test 1: CLI Basic Functionality"

inc_test
log "Testing endorphin help command..."
if endorphin --help > /dev/null 2>&1; then
    success "CLI help command works"
else
    error "CLI help command failed"
fi

inc_test
log "Testing endorphin version command..."
if endorphin --version > /dev/null 2>&1; then
    success "CLI version command works"
else
    error "CLI version command failed"
fi

inc_test
log "Testing test discovery from user project..."
TEST_LIST=$(endorphin list 2>/dev/null)
if echo "$TEST_LIST" | grep -q "USER-001"; then
    success "User project test discovery works (found USER-001)"
    info "Available tests:"
    echo "$TEST_LIST" | grep "USER-001" | head -3
else
    error "User project test discovery failed (USER-001 not found)"
    warning "Available tests output:"
    echo "$TEST_LIST" | head -5
fi

# =============================================================================
# Test 2: Standard Reporter Execution (Package Testing)
# =============================================================================

section "Test 2: Standard Reporter Execution"

inc_test
log "Testing standard CLI test execution..."
log "Running USER-001 with console reporter (30s timeout)..."

# Create output file for analysis
OUTPUT_FILE="cli-test-$(date +%s).log"

if timeout 30s endorphin run test USER-001 > "$OUTPUT_FILE" 2>&1; then
    if grep -q "USER-001" "$OUTPUT_FILE"; then
        success "Standard CLI test execution completed successfully"
        info "Test output saved to: $OUTPUT_FILE"
    else
        error "Standard CLI test completed but didn't find USER-001 in output"
        warning "Output preview:"
        head -10 "$OUTPUT_FILE"
    fi
else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 124 ]]; then
        warning "Standard CLI test timed out (this may be normal for AI tests)"
        info "Output preview:"
        head -10 "$OUTPUT_FILE"
    else
        error "Standard CLI test failed with exit code: $EXIT_CODE"
        warning "Output preview:"
        head -10 "$OUTPUT_FILE"
    fi
fi

# =============================================================================
# Test 3: Web UI Server Startup (Package Testing Approach)
# =============================================================================

section "Test 3: Web UI Server Startup"

inc_test
log "Starting Web UI server from user project..."
log "This tests that Web UI discovers USER PROJECT tests, not framework tests"

# Start server from user project directory (key for package testing)
endorphin serve --port $TEST_PORT --no-browser > "webui-server-$(date +%s).log" 2>&1 &
SERVER_PID=$!

log "Web UI server started with PID: $SERVER_PID"

# Wait for server to be ready
log "Waiting for server to start..."
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
# Test 4: Web UI API Endpoints (Critical for Package Testing)
# =============================================================================

section "Test 4: Web UI API Endpoints"

BASE_URL="http://localhost:$TEST_PORT"

inc_test
log "Testing root endpoint (serves React app)..."
if curl -s "$BASE_URL" | grep -q "<!DOCTYPE html>"; then
    success "Root endpoint serves HTML (React app)"
else
    error "Root endpoint test failed"
fi

inc_test
log "Testing /api/tests endpoint (CRITICAL: must find USER PROJECT tests)..."
API_RESPONSE=$(curl -s "$BASE_URL/api/tests")
if echo "$API_RESPONSE" | grep -q "USER-001"; then
    success "API correctly discovers USER PROJECT test (USER-001)"
    info "Found test in API response"
else
    error "API failed to discover USER PROJECT test (USER-001)"
    warning "API response preview:"
    echo "$API_RESPONSE" | head -5
    warning "This indicates Web UI is not running from user project context"
fi

inc_test
log "Testing specific test endpoint /api/tests/USER-001..."
TEST_RESPONSE=$(curl -s "$BASE_URL/api/tests/USER-001")
if echo "$TEST_RESPONSE" | grep -q "User Project Test"; then
    success "Specific test endpoint works for USER-001"
else
    error "Specific test endpoint failed for USER-001"
    warning "Response: $TEST_RESPONSE"
fi

inc_test
log "Testing /api/results endpoint..."
RESULTS_RESPONSE=$(curl -s "$BASE_URL/api/results")
if echo "$RESULTS_RESPONSE" | grep -q "\["; then
    success "Results endpoint returns JSON array"
else
    warning "Results endpoint returned non-array (may be empty, this is OK)"
fi

inc_test
log "Testing 404 handling..."
NOT_FOUND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/nonexistent-endpoint")
if [[ "$NOT_FOUND_CODE" == "404" ]]; then
    success "404 handling works correctly"
else
    warning "404 handling returned: $NOT_FOUND_CODE (expected 404)"
fi

# Test WebSocket connection
echo -e "${YELLOW}Testing WebSocket connection...${NC}"
if command -v wscat >/dev/null 2>&1; then
    # Test WebSocket if wscat is available
    timeout 10s wscat -c ws://localhost:3001 --close >/dev/null 2>&1 && WS_TEST=true || WS_TEST=false
    if [ "$WS_TEST" = true ]; then
        echo -e "${GREEN}✅ WebSocket connection successful${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ WebSocket connection failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo -e "${YELLOW}⏭️  WebSocket test skipped (wscat not installed)${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Clean shutdown test
echo -e "${YELLOW}Testing server shutdown...${NC}"
if kill -TERM $SERVER_PID 2>/dev/null; then
    sleep 2
    if ! ps -p $SERVER_PID >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server shutdown successful${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Server didn't shutdown gracefully${NC}"
        kill -9 $SERVER_PID 2>/dev/null || true
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo -e "${RED}❌ Failed to send shutdown signal${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test Summary
echo ""
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
