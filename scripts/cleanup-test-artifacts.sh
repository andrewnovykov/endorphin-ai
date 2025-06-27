#!/bin/bash

# Cleanup Test Artifacts Script
# Removes test contamination from main project root

echo "🧹 Cleaning up test artifacts from main project root..."

# Change to project root
cd "$(dirname "$0")/.."

# List of files/folders that should NOT be in main root
ARTIFACTS=(
    "endorphin.config.js"
    "endorphin.config.ts" 
    "test-results"
    "test-recorder"
    "endorphin-ai-*.tgz"
    ".env"
)

# Remove artifacts if they exist
for artifact in "${ARTIFACTS[@]}"; do
    if [ -e "$artifact" ]; then
        echo "🗑️  Removing: $artifact"
        rm -rf "$artifact"
    fi
done

# Clean up any node_modules that shouldn't be there (except the main one)
# Only remove if it looks like a test installation
if [ -f "node_modules/endorphin-ai/package.json" ] && [ ! -f "node_modules/.installed-by-main" ]; then
    echo "🗑️  Removing test node_modules installation"
    rm -rf node_modules
    # Reinstall main dependencies
    echo "📦 Reinstalling main dependencies..."
    npm install
    # Mark as main installation
    touch node_modules/.installed-by-main
fi

# Clean up tmp directories but preserve structure
echo "🧹 Cleaning tmp directories..."
if [ -d "tmp" ]; then
    find tmp -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find tmp -name "test-results" -type d -exec rm -rf {} + 2>/dev/null || true
    find tmp -name "test-recorder" -type d -exec rm -rf {} + 2>/dev/null || true
    find tmp -name "*.tgz" -type f -delete 2>/dev/null || true
fi

# Clean up manual test artifacts
if [ -d "tests/manual-test" ]; then
    echo "🧹 Cleaning manual test artifacts..."
    rm -rf tests/manual-test/node_modules
    rm -rf tests/manual-test/test-results
    rm -rf tests/manual-test/test-recorder
    rm -f tests/manual-test/endorphin.config.*
    rm -f tests/manual-test/.env
    rm -f tests/manual-test/package-lock.json
fi

echo "✅ Cleanup complete!"
echo ""
echo "📋 Preserved important directories:"
echo "   - dist/ (compiled output)"
echo "   - examples/ (user templates)"
echo "   - tmp/ (structure preserved, artifacts removed)"
echo "   - tests/ (test suites)"
echo ""
echo "🚀 Project is clean and ready for development/testing"