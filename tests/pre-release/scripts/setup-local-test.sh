#!/bin/bash

# Setup script for pre-release testing
# Creates a clean test environment and installs the local version of Endorphin AI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TEST_TEMP_DIR="/tmp/endorphin-pre-release-test"

echo -e "${BLUE}🧪 Endorphin AI Pre-Release Testing Setup${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print status messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Parse command line arguments
TEST_DIR_NAME="endorphin-test-$(date +%Y%m%d-%H%M%S)"
CUSTOM_DIR=""
SKIP_BUILD=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            CUSTOM_DIR="$2"
            shift 2
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -d, --dir DIR       Use custom test directory (default: /tmp/endorphin-test-TIMESTAMP)"
            echo "  -s, --skip-build    Skip TypeScript build step"
            echo "  -v, --verbose       Verbose output"
            echo "  -h, --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Default setup"
            echo "  $0 -d /tmp/my-test                   # Custom directory"
            echo "  $0 -s                                # Skip build step"
            echo "  $0 -v -d /tmp/my-test               # Verbose with custom dir"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Set test directory
if [[ -n "$CUSTOM_DIR" ]]; then
    TEST_DIR="$CUSTOM_DIR"
else
    TEST_DIR="$TEST_TEMP_DIR/$TEST_DIR_NAME"
fi

print_info "Project root: $PROJECT_ROOT"
print_info "Test directory: $TEST_DIR"

# Step 1: Verify we're in the right place
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    print_error "Cannot find package.json in project root: $PROJECT_ROOT"
    print_error "Please run this script from the Endorphin AI project directory"
    exit 1
fi

PACKAGE_NAME=$(jq -r '.name' "$PROJECT_ROOT/package.json")
if [[ "$PACKAGE_NAME" != "endorphin-ai" ]]; then
    print_error "This doesn't appear to be the Endorphin AI project (found: $PACKAGE_NAME)"
    exit 1
fi

print_status "Verified project root"

# Step 2: Build the project if not skipped
if [[ "$SKIP_BUILD" == "false" ]]; then
    print_info "Building TypeScript project..."
    cd "$PROJECT_ROOT"
    
    if [[ "$VERBOSE" == "true" ]]; then
        npm run build
    else
        npm run build > /dev/null 2>&1
    fi
    
    print_status "Project built successfully"
else
    print_warning "Skipping build step (--skip-build specified)"
fi

# Step 3: Create test directory
print_info "Creating test directory: $TEST_DIR"
mkdir -p "$TEST_DIR"

# Step 4: Initialize new npm project
print_info "Initializing npm project in test directory..."
cd "$TEST_DIR"

if [[ "$VERBOSE" == "true" ]]; then
    npm init -y
else
    npm init -y > /dev/null 2>&1
fi

print_status "Npm project initialized"

# Step 5: Install Endorphin AI from local source
print_info "Installing Endorphin AI from local source..."

if [[ "$VERBOSE" == "true" ]]; then
    npm install "$PROJECT_ROOT"
else
    npm install "$PROJECT_ROOT" > /dev/null 2>&1
fi

print_status "Endorphin AI installed from local source"

# Step 6: Verify installation
print_info "Verifying installation..."

# Check if the package was installed
if [[ ! -d "node_modules/endorphin-ai" ]]; then
    print_error "Installation failed - endorphin-ai not found in node_modules"
    exit 1
fi

# Check if CLI is available
if ! npx endorphin --version > /dev/null 2>&1; then
    print_error "CLI installation failed - endorphin command not available"
    exit 1
fi

CLI_VERSION=$(npx endorphin --version)
SOURCE_VERSION=$(jq -r '.version' "$PROJECT_ROOT/package.json")

if [[ "$CLI_VERSION" != "$SOURCE_VERSION" ]]; then
    print_warning "Version mismatch: CLI=$CLI_VERSION, Source=$SOURCE_VERSION"
else
    print_status "Version verified: $CLI_VERSION"
fi

# Step 7: Initialize Endorphin project
print_info "Initializing Endorphin project..."

if [[ "$VERBOSE" == "true" ]]; then
    npx endorphin init
else
    npx endorphin init > /dev/null 2>&1
fi

print_status "Endorphin project initialized"

# Step 8: Verify project structure
print_info "Verifying project structure..."

REQUIRED_FILES=(
    "endorphin.config.ts"
    ".env"
    "tests"
    "test-results"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -e "$file" ]]; then
        print_error "Missing required file/directory: $file"
        exit 1
    fi
done

print_status "Project structure verified"

# Step 9: Create test API key for validation
print_info "Setting up test environment..."

echo "OPENAI_API_KEY=test-key-for-pre-release-validation" >> .env
echo "NODE_ENV=development" >> .env

print_status "Test environment configured"

# Step 10: Run basic validation tests
print_info "Running basic validation tests..."

# Test help command
if ! npx endorphin --help > /dev/null 2>&1; then
    print_error "Help command failed"
    exit 1
fi

# Test list command
if ! npx endorphin list > /dev/null 2>&1; then
    print_error "List command failed"
    exit 1
fi

print_status "Basic validation tests passed"

# Step 11: Display summary
echo ""
echo -e "${GREEN}🎉 Pre-Release Test Environment Setup Complete!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo -e "${BLUE}Test Directory:${NC} $TEST_DIR"
echo -e "${BLUE}Package Version:${NC} $SOURCE_VERSION"
echo -e "${BLUE}Installation Source:${NC} $PROJECT_ROOT"
echo ""
echo -e "${BLUE}Available Commands:${NC}"
echo "  cd $TEST_DIR"
echo "  npx endorphin --help"
echo "  npx endorphin list"
echo "  npx endorphin init --help"
echo "  npx endorphin generate report"
echo ""
echo -e "${BLUE}Test Structure:${NC}"
echo "  📁 tests/          - Test files (.ts)"
echo "  📁 test-results/   - Test execution results"
echo "  📄 endorphin.config.ts - Configuration file"
echo "  📄 .env           - Environment variables"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. cd $TEST_DIR"
echo "  2. Create custom test files in tests/"
echo "  3. Run tests: npx endorphin run test [TEST-ID]"
echo "  4. Generate reports: npx endorphin generate report"
echo ""
echo -e "${YELLOW}Note:${NC} This test environment uses a dummy API key."
echo "      For actual test execution, set a real OPENAI_API_KEY in .env"
echo ""

# Step 12: Optionally change to test directory
if [[ -t 0 ]]; then  # Only prompt if running interactively
    read -p "Change to test directory now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        exec bash -c "cd '$TEST_DIR' && exec bash"
    fi
fi

print_status "Setup script completed successfully"
