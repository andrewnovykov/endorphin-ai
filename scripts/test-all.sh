#!/bin/bash

# Complete Test Verification Script
# Ensures both framework and package tests meet quality standards

set -e

echo "🧪 Endorphin AI - Complete Test Verification"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the root of the endorphin-ai project"
    exit 1
fi

# Phase 1: Framework Tests (90% Coverage Goal)
echo "📊 Phase 1: Framework Testing (90% Coverage Goal)"
echo "------------------------------------------------"

echo "🔍 Running framework tests with coverage..."
npm run test:coverage

echo ""
echo "✅ Checking coverage threshold (90%)..."
npm run test:coverage:check

echo ""
echo "📋 Framework tests completed successfully!"
echo ""

# Phase 2: Package Tests (User Journey Coverage)
echo "📦 Phase 2: Package Testing (End-to-End)"
echo "----------------------------------------"

cd tests/package-tests

echo "🛠️  Setting up isolated user environment..."
./setup-user-project.sh

echo ""
echo "🧪 Testing CLI commands..."
./test-cli-commands.sh

echo ""
echo "🔒 Testing file isolation (CRITICAL)..."
./test-recorder-location.sh

echo ""
echo "📊 Testing console reporter..."
./test-console-reporter.sh

echo ""
echo "📝 Testing HTML reporter..."
./test-html-reporter.sh

echo ""
echo "🧹 Cleaning up test environment..."
rm -rf tmp/

cd ../..

echo ""
echo "✅ Package tests completed successfully!"
echo ""

# Summary
echo "📋 Test Verification Summary"
echo "============================"
echo "✅ Framework Tests: PASSED (90% coverage goal)"
echo "✅ Package Tests: PASSED (100% user journey coverage)"
echo "✅ File Isolation: VERIFIED (no framework contamination)"
echo "✅ CLI Functionality: VERIFIED"
echo "✅ Reporting Systems: VERIFIED"
echo ""
echo "🎉 All tests passed! Framework is ready for release."
echo ""

# Optional: Display coverage summary
echo "📊 Coverage Summary"
echo "=================="
echo "Target: 90% across all metrics"
echo ""
echo "View detailed coverage report:"
echo "open tests/framework-tests/coverage/index.html"
echo ""
