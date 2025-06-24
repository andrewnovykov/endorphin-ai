#!/bin/bash

echo "🔍 Debug Init Command - No Cleanup"
echo "=================================="

# Set script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="$SCRIPT_DIR/tmp"
TEST_PROJECT_DIR="$TMP_DIR/debug-init"

echo "📁 Test will create project in: $TEST_PROJECT_DIR"

# Store original directory
ORIGINAL_DIR=$(pwd)

# Clean up any existing test project
echo "🧹 Cleaning up any existing test project..."
rm -rf "$TEST_PROJECT_DIR"

# Create fresh directory for init testing
echo "📁 Creating fresh directory for init test..."
mkdir -p "$TEST_PROJECT_DIR"
cd "$TEST_PROJECT_DIR"

echo "📍 Current directory: $(pwd)"

# Initialize basic npm project
echo "📦 Initializing npm project..."
npm init -y > /dev/null 2>&1

# Install endorphin-ai package
echo "📥 Installing endorphin-ai package..."
REPO_ROOT="$SCRIPT_DIR/../.."
if npm install "$REPO_ROOT" > install.log 2>&1; then
  echo "✅ Package installed successfully"
else
  echo "❌ Failed to install endorphin-ai package"
  echo "📄 Install log:"
  cat install.log
  cd "$ORIGINAL_DIR"
  exit 1
fi

echo "🔍 Checking where endorphin-ai is installed..."
find node_modules -name "init-command.js" 2>/dev/null | head -5

echo "🔍 Checking package structure..."
ls -la node_modules/endorphin-ai/ 2>/dev/null || echo "No endorphin-ai in node_modules"

# Test init command
echo "🚀 Running: npx endorphin init"
npx endorphin init

echo "🔍 Checking current directory contents after init..."
ls -la

echo "📍 Staying in directory for manual inspection: $TEST_PROJECT_DIR"
echo "🔍 To debug, run: cd $TEST_PROJECT_DIR"

cd "$ORIGINAL_DIR"
