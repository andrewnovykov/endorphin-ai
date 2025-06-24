#!/bin/bash

# Setup User Project Test Environment
# This script creates a clean user project environment to test Endorphin AI package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
USER_PROJECT_DIR="$SCRIPT_DIR/../tmp/test-endorphin"

echo "🚀 Setting up Endorphin AI User Project Test Environment"
echo "========================================================"
echo "📍 Repository root: $REPO_ROOT"
echo "📁 User project: $USER_PROJECT_DIR"

# Create user project directory
echo "📁 Creating user project directory..."
mkdir -p "$USER_PROJECT_DIR"
cd "$USER_PROJECT_DIR"

# Initialize npm project
echo "📦 Initializing npm project..."
npm init -y > /dev/null 2>&1

# Set up as ES module
npm pkg set type="module"

# Install endorphin-ai from local repository
echo "📥 Installing endorphin-ai from local repository..."
npm install "$REPO_ROOT" > /dev/null 2>&1

# Create user configuration
echo "⚙️ Creating user configuration..."
cat > endorphin.config.js << 'EOF'
export default {
  browser: {
    headless: false,  // Keep browser visible during recording
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
    slowMo: 500  // Slow down actions for better visibility
  },
  
  results: {
    directory: "./test-results",
    keepHistory: 10,
    format: ["json", "html"],
    screenshots: true,
    recordVideo: false
  },
  
  ai: {
    model: "gpt-4o",
    maxRetries: 3,
    temperature: 0.1
  },
  
  recorder: {
    outputDirectory: "./test-recorder",
    screenshotFormat: "png",
    stepDelay: 1000
  }
};
EOF

# Copy environment variables from main repo
echo "🔑 Copying environment variables from main repository..."
if [ -f "$REPO_ROOT/.env" ]; then
  cp "$REPO_ROOT/.env" ".env"
  echo "✅ Environment variables copied from main repo"
else
  echo "⚠️ No .env file found in main repo, creating basic one..."
  cat > .env << 'EOF'
# Copy your OpenAI API key here
OPENAI_API_KEY=your_key_here

# Base URL for test recordings
BASE_URL=https://qafromla.herokuapp.com/

# Browser settings
HEADLESS=false
ENDORPHIN_HEADLESS=false
EOF
fi

# Create tests directory
echo "📝 Creating tests directory..."
mkdir -p tests

# Create a basic test file
echo "📄 Creating basic test file..."
cat > tests/user-basic-test.js << 'EOF'
export const USER_BASIC_TEST = {
  id: "USER-001",
  name: "User Project Basic Test",
  description: "Test basic functionality from user project perspective",
  priority: "High",
  tags: ["user-test", "basic", "smoke"],
  site: "https://qafromla.herokuapp.com/",
  testData: {},
  task: "Navigate to the QA From LA website and verify it loads successfully. Check that the page title contains 'QA From LA' and look for the main heading."
};
EOF

# Create package.json scripts for convenience
echo "🔧 Adding convenience scripts to package.json..."
npm pkg set scripts.test:e2e="endorphin run test all"
npm pkg set scripts.test:smoke="endorphin run test --tag smoke"
npm pkg set scripts.test:list="endorphin list"
npm pkg set scripts.test:recorder="endorphin run test-recorder"

echo ""
echo "✅ User project setup complete!"
echo ""
echo "📋 Directory structure:"
ls -la

echo ""
echo "🎯 Next steps:"
echo "1. cd tmp/test-endorphin"
echo "2. Run: ./test-recorder.sh (to test recorder)"
echo "3. Run: ./run-test.sh USER-001 (to run test)"
echo "4. Run: npx endorphin list (to see available tests)"

echo ""
echo "📁 Project location: $USER_PROJECT_DIR"
