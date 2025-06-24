#!/bin/bash

# Test Recorder Location Verification Script
# This script tests that the test recorder creates files in the USER project, not framework

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
USER_PROJECT_DIR="$SCRIPT_DIR"

echo "🎬 Testing Test Recorder File Location"
echo "======================================"
echo "📍 Framework root: $REPO_ROOT"
echo "📁 User project: $USER_PROJECT_DIR"
echo "⏰ Current time: $(date)"

# Ensure we're in the user project directory
cd "$USER_PROJECT_DIR"

echo ""
echo "📋 Initial state:"
echo "User project contents:"
ls -la
echo ""
echo "Framework test-recorder contents:"
ls -la "$REPO_ROOT/test-recorder/" 2>/dev/null || echo "(Directory empty or doesn't exist)"

# Clear any existing recordings
echo ""
echo "🧹 Cleaning up previous recordings..."
rm -rf test-recorder/ 2>/dev/null || true
rm -rf "$REPO_ROOT/test-recorder/"* 2>/dev/null || true

echo ""
echo "🎬 Starting test recorder simulation..."
echo "This will create a test recording session and check where files are created."

# Create input simulation file
cat > /tmp/recorder_input.txt << 'EOF'
TEST-REC-001
Test Recorder Location Test
Verify that test recorder creates files in user project not framework
High
location,test,verification
https://qafromla.herokuapp.com/
done
EOF

echo "📝 Test data prepared:"
echo "- Test ID: TEST-REC-001"
echo "- Test Name: Test Recorder Location Test"
echo "- Site: https://qafromla.herokuapp.com/"

# Run test recorder with simulated input (with timeout to prevent hanging)
echo ""
echo "🚀 Launching test recorder..."
timeout 60 npx endorphin run test-recorder < /tmp/recorder_input.txt &
RECORDER_PID=$!

# Wait for the recorder to start and potentially create directories
sleep 10

# Check if recorder is still running
if kill -0 $RECORDER_PID 2>/dev/null; then
  echo "⏳ Test recorder is running..."
  sleep 5
  
  # Kill the recorder gracefully
  echo "🛑 Stopping test recorder..."
  kill $RECORDER_PID 2>/dev/null || true
  wait $RECORDER_PID 2>/dev/null || true
else
  echo "✅ Test recorder completed"
fi

# Cleanup input file
rm -f /tmp/recorder_input.txt

echo ""
echo "🔍 VERIFICATION RESULTS:"
echo "========================"

# Check user project for test-recorder directory
if [ -d "test-recorder" ]; then
  echo "✅ SUCCESS: test-recorder directory created in USER project"
  echo "📂 User project test-recorder contents:"
  find test-recorder -type f 2>/dev/null | head -10 || echo "   (No files found)"
  
  # Count files/directories
  RECORDING_DIRS=$(find test-recorder -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
  if [ $RECORDING_DIRS -gt 0 ]; then
    echo "📊 Found $RECORDING_DIRS recording session(s)"
    
    # Show structure of first recording
    FIRST_RECORDING=$(find test-recorder -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -1)
    if [ -n "$FIRST_RECORDING" ]; then
      echo "📁 Structure of recording session:"
      tree "$FIRST_RECORDING" 2>/dev/null || ls -la "$FIRST_RECORDING"
    fi
  fi
else
  echo "❌ FAIL: test-recorder directory NOT created in user project"
fi

# Check framework directory for unwanted files
if [ -d "$REPO_ROOT/test-recorder" ] && [ "$(ls -A $REPO_ROOT/test-recorder 2>/dev/null)" ]; then
  echo "❌ WARNING: Files found in FRAMEWORK test-recorder directory!"
  echo "📂 Framework test-recorder contents:"
  ls -la "$REPO_ROOT/test-recorder/"
  echo "🚨 This indicates files are being created in the wrong location!"
else
  echo "✅ SUCCESS: No unwanted files in framework test-recorder directory"
fi

# Check if tests directory was updated
echo ""
echo "📝 Test file generation:"
if [ -f "tests/test-rec-001-recorded-test.js" ]; then
  echo "✅ SUCCESS: Generated test file found in user tests directory"
  echo "📄 Generated test file: tests/test-rec-001-recorded-test.js"
else
  echo "⚠️ INFO: No generated test file found (may be expected if recorder was interrupted)"
  echo "📂 Current tests directory:"
  ls -la tests/ 2>/dev/null || echo "   (No tests directory)"
fi

echo ""
echo "🎯 SUMMARY:"
echo "==========="
echo "User project directory: $USER_PROJECT_DIR"
echo "Framework directory: $REPO_ROOT"

if [ -d "test-recorder" ]; then
  echo "✅ Test recorder correctly creates files in USER project"
else
  echo "❌ Test recorder did NOT create files in user project"
fi

if [ -d "$REPO_ROOT/test-recorder" ] && [ "$(ls -A $REPO_ROOT/test-recorder 2>/dev/null)" ]; then
  echo "❌ Test recorder incorrectly created files in FRAMEWORK"
else
  echo "✅ Test recorder did NOT pollute framework directory"
fi

echo ""
echo "🔧 To test manually:"
echo "npx endorphin run test-recorder"
