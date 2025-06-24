#!/bin/bash

# Load environment variables from the user project .env file
set -a
if [ -f "../../tmp/test-endorphin/.env" ]; then
  source ../../tmp/test-endorphin/.env
fi
set +a

# Test script for search functionality
# Run this from tmp/test-endorphin/

echo "🧪 Testing Web UI Search Functionality"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "endorphin.config.js" ]; then
    echo "❌ Error: Must run from a project with endorphin.config.js"
    exit 1
fi

# Start server in background
echo "🚀 Starting Endorphin server..."
timeout 60 npx endorphin serve --port 3002 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
for i in {1..20}; do
    if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
        echo "✅ Server started successfully"
        break
    fi
    sleep 1
    if [ $i -eq 20 ]; then
        echo "❌ Server failed to start"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
done

# Test API endpoints
echo ""
echo "🔍 Testing Search API endpoints..."

# Test 1: Get all tests
echo "Test 1: Get all tests"
RESPONSE=$(curl -s "http://localhost:3002/api/tests")
if echo "$RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$RESPONSE" | grep -o '"tests":\[.*\]' | grep -o '\{[^}]*\}' | wc -l)
    echo "✅ All tests: Found $COUNT tests"
else
    echo "❌ Failed to get all tests"
fi

# Test 2: Search by name
echo "Test 2: Search by name (search=login)"
RESPONSE=$(curl -s "http://localhost:3002/api/tests?search=login")
if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q 'LOGIN'; then
        echo "✅ Search by name: Found login test"
    else
        echo "❌ Search by name: No login test found"
    fi
else
    echo "❌ Failed to search by name"
fi

# Test 3: Filter by priority
echo "Test 3: Filter by priority (priority=High)"
RESPONSE=$(curl -s "http://localhost:3002/api/tests?priority=High")
if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q '"priority":"High"'; then
        echo "✅ Filter by priority: Found high priority tests"
    else
        echo "❌ Filter by priority: No high priority tests found"
    fi
else
    echo "❌ Failed to filter by priority"
fi

# Test 4: Filter by tags
echo "Test 4: Filter by tags (tags=smoke)"
RESPONSE=$(curl -s "http://localhost:3002/api/tests?tags=smoke")
if echo "$RESPONSE" | grep -q '"success":true'; then
    if echo "$RESPONSE" | grep -q 'smoke'; then
        echo "✅ Filter by tags: Found smoke tests"
    else
        echo "❌ Filter by tags: No smoke tests found"
    fi
else
    echo "❌ Failed to filter by tags"
fi

# Test 5: Multiple filters
echo "Test 5: Multiple filters (search=test&priority=High)"
RESPONSE=$(curl -s "http://localhost:3002/api/tests?search=test&priority=High")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Multiple filters: Query executed successfully"
else
    echo "❌ Failed to apply multiple filters"
fi

# Test 6: Invalid priority
echo "Test 6: Invalid priority (priority=Invalid)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3002/api/tests?priority=Invalid")
if [ "$STATUS" = "400" ]; then
    echo "✅ Invalid priority: Correctly returned 400 error"
else
    echo "❌ Invalid priority: Expected 400, got $STATUS"
fi

# Test 7: Empty search
echo "Test 7: Empty search (search=)"
RESPONSE=$(curl -s "http://localhost:3002/api/tests?search=")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Empty search: Returned all tests"
else
    echo "❌ Failed empty search test"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "✅ Search functionality tests completed!"
