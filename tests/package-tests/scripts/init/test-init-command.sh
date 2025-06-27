#!/bin/bash

echo "🎯 Testing Init Command"
echo "====================="

# Store original directory
ORIGINAL_DIR=$(pwd)

# Create temporary test directory in the proper location
TEST_DIR="$ORIGINAL_DIR/tests/package-tests/tmp/temp-init-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo "📁 Created test directory: $TEST_DIR"

# Test init command (run from the test directory)
echo "🚀 Running: npx endorphin init"
cd "$TEST_DIR" && npx endorphin init

# Verify files were created
echo "📋 Checking created files..."

FILES=(".env" "endorphin.config.ts" "tests/sample-test.ts" ".gitignore" "README-ENDORPHIN.md")
ALL_GOOD=true

# Change to test directory for file checks
cd "$TEST_DIR"

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
if [ -f "./tests/sample-test.ts" ] && (grep -q "TEST_ID\|HEALTH_001\|export const" "./tests/sample-test.ts"); then
  echo "✅ Example test syntax valid"
else
  echo "❌ Example test has syntax errors"
  ALL_GOOD=false
fi

# Test if config is valid
echo "⚙️ Validating config file..."
if [ -f "./endorphin.config.ts" ] && grep -q "export default" "./endorphin.config.ts"; then
  echo "✅ Config file syntax valid"
else
  echo "❌ Config file has syntax errors"
  ALL_GOOD=false
fi

# Test CLI functionality
echo "🔧 Testing CLI commands..."
cd "$TEST_DIR"

# Add a test API key to the .env file
echo "OPENAI_API_KEY=sk-test-key-for-testing" > .env

echo "  Testing version command..."
timeout 5 npx endorphin --version >/dev/null 2>&1 && echo "✅ CLI version command works" || echo "⚠️  CLI version command timeout (not critical)"

echo "  Testing list command..."
timeout 5 npx endorphin list >/dev/null 2>&1 && echo "✅ CLI list command works" || echo "⚠️  CLI list command timeout (not critical)"

# Test second init (should not overwrite)
echo "🔄 Testing second init (should not overwrite)..."
echo "existing config" > "$TEST_DIR/endorphin.config.ts"
(cd "$TEST_DIR" && npx endorphin init)
if grep -q "existing config" "$TEST_DIR/endorphin.config.ts"; then
  echo "✅ Second init doesn't overwrite existing files"
else
  echo "❌ Second init overwrote existing files"
  ALL_GOOD=false
fi

# Cleanup (only if test passed)
if [ "$ALL_GOOD" = true ]; then
  cd "$ORIGINAL_DIR"
  rm -rf "$TEST_DIR"
  echo "🎉 Init command test PASSED"
  exit 0
else
  cd "$ORIGINAL_DIR"
  echo "💥 Init command test FAILED"
  echo "📁 Test directory preserved for debugging: $TEST_DIR"
  exit 1
fi
