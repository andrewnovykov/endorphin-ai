#!/bin/bash

echo "🎯 Testing Init Command"
echo "====================="

# Store original directory
ORIGINAL_DIR=$(pwd)

# Test 1: Fresh init in temporary directory
TEST_DIR="temp-init-test"
rm -rf $TEST_DIR
mkdir -p $TEST_DIR
cd $TEST_DIR

echo "📁 Created test directory: $TEST_DIR"

# Test init command
echo "🚀 Running: npx endorphin init"
npx endorphin init

# Verify files were created
echo "📋 Checking created files..."

FILES=(".env" "endorphin.config.js" "tests/sample-test.js" ".gitignore" "README-ENDORPHIN.md")
ALL_GOOD=true

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
    ALL_GOOD=false
  fi
done

# Check directories
DIRS=("tests" "test-results" "test-recorder")
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/"
  else
    echo "❌ Missing directory: $dir/"
    ALL_GOOD=false
  fi
done

# Test if example test is valid
echo "🧪 Validating example test..."
if node -e "import('./tests/sample-test.js')" 2>/dev/null; then
  echo "✅ Example test syntax valid"
else
  echo "❌ Example test has syntax errors"
  ALL_GOOD=false
fi

# Test if config is valid
echo "⚙️ Validating config file..."
if node -e "import('./endorphin.config.js')" 2>/dev/null; then
  echo "✅ Config file syntax valid"
else
  echo "❌ Config file has syntax errors"
  ALL_GOOD=false
fi

# Test CLI functionality
echo "🔧 Testing CLI commands..."
if npx endorphin --version >/dev/null 2>&1; then
  echo "✅ CLI version command works"
else
  echo "❌ CLI version command failed"
  ALL_GOOD=false
fi

if npx endorphin list >/dev/null 2>&1; then
  echo "✅ CLI list command works"
else
  echo "❌ CLI list command failed"
  ALL_GOOD=false
fi

# Test second init (should not overwrite)
echo "🔄 Testing second init (should not overwrite)..."
echo "existing config" > endorphin.config.js
npx endorphin init
if grep -q "existing config" endorphin.config.js; then
  echo "✅ Second init doesn't overwrite existing files"
else
  echo "❌ Second init overwrote existing files"
  ALL_GOOD=false
fi

# Cleanup
cd $ORIGINAL_DIR
rm -rf $TEST_DIR

if [ "$ALL_GOOD" = true ]; then
  echo "🎉 Init command test PASSED"
  exit 0
else
  echo "💥 Init command test FAILED"
  exit 1
fi
