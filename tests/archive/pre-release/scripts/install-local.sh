#!/bin/bash

# Install from local script for pre-release testing
# Installs Endorphin AI from the local development source

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

echo -e "${BLUE}📦 Endorphin AI Local Installation${NC}"
echo -e "${BLUE}==================================${NC}"

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
TARGET_DIR="$(pwd)"
FORCE_REINSTALL=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            TARGET_DIR="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_REINSTALL=true
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
            echo "  -d, --dir DIR       Target directory for installation (default: current directory)"
            echo "  -f, --force         Force reinstallation even if already installed"
            echo "  -v, --verbose       Verbose output"
            echo "  -h, --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Install in current directory"
            echo "  $0 -d /path/to/project               # Install in specific directory"
            echo "  $0 -f                                # Force reinstall"
            echo "  $0 -v -d /tmp/test                   # Verbose installation in custom directory"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

print_info "Installing from: $PROJECT_ROOT"
print_info "Installing to: $TARGET_DIR"

# Step 1: Verify source project
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    print_error "Cannot find package.json in source project: $PROJECT_ROOT"
    exit 1
fi

PACKAGE_NAME=$(jq -r '.name' "$PROJECT_ROOT/package.json" 2>/dev/null || echo "unknown")
if [[ "$PACKAGE_NAME" != "endorphin-ai" ]]; then
    print_error "This doesn't appear to be the Endorphin AI project (found: $PACKAGE_NAME)"
    exit 1
fi

SOURCE_VERSION=$(jq -r '.version' "$PROJECT_ROOT/package.json")
print_status "Source project verified (version: $SOURCE_VERSION)"

# Step 2: Verify target directory
if [[ ! -d "$TARGET_DIR" ]]; then
    print_error "Target directory does not exist: $TARGET_DIR"
    exit 1
fi

cd "$TARGET_DIR"

# Check if it's a valid npm project
if [[ ! -f "package.json" ]]; then
    print_warning "No package.json found in target directory"
    print_info "Initializing npm project..."
    
    if [[ "$VERBOSE" == "true" ]]; then
        npm init -y
    else
        npm init -y > /dev/null 2>&1
    fi
    
    print_status "Npm project initialized"
fi

# Step 3: Check if already installed
if [[ -d "node_modules/endorphin-ai" && "$FORCE_REINSTALL" == "false" ]]; then
    INSTALLED_VERSION=$(jq -r '.version' "node_modules/endorphin-ai/package.json" 2>/dev/null || echo "unknown")
    
    print_warning "Endorphin AI is already installed (version: $INSTALLED_VERSION)"
    print_info "Use --force to reinstall"
    
    if [[ "$INSTALLED_VERSION" == "$SOURCE_VERSION" ]]; then
        print_status "Versions match - no action needed"
        exit 0
    else
        print_warning "Version mismatch detected"
        print_info "Installed: $INSTALLED_VERSION, Source: $SOURCE_VERSION"
        print_info "Consider using --force to update"
        exit 0
    fi
fi

# Step 4: Remove existing installation if force reinstall
if [[ "$FORCE_REINSTALL" == "true" && -d "node_modules/endorphin-ai" ]]; then
    print_info "Removing existing installation..."
    rm -rf "node_modules/endorphin-ai"
    
    # Also remove from package.json if present
    if command -v jq >/dev/null 2>&1; then
        if jq -e '.dependencies."endorphin-ai"' package.json >/dev/null 2>&1; then
            print_info "Removing from package.json..."
            jq 'del(.dependencies."endorphin-ai")' package.json > package.json.tmp && mv package.json.tmp package.json
        fi
    fi
    
    print_status "Existing installation removed"
fi

# Step 5: Install from local source
print_info "Installing Endorphin AI from local source..."

if [[ "$VERBOSE" == "true" ]]; then
    npm install "$PROJECT_ROOT"
else
    npm install "$PROJECT_ROOT" > /dev/null 2>&1
fi

print_status "Installation completed"

# Step 6: Verify installation
print_info "Verifying installation..."

# Check if the package was installed
if [[ ! -d "node_modules/endorphin-ai" ]]; then
    print_error "Installation failed - endorphin-ai not found in node_modules"
    exit 1
fi

# Check installed version
INSTALLED_VERSION=$(jq -r '.version' "node_modules/endorphin-ai/package.json" 2>/dev/null || echo "unknown")
if [[ "$INSTALLED_VERSION" != "$SOURCE_VERSION" ]]; then
    print_warning "Version mismatch after installation"
    print_warning "Expected: $SOURCE_VERSION, Got: $INSTALLED_VERSION"
fi

# Check if CLI is available
if ! npx endorphin --version > /dev/null 2>&1; then
    print_error "CLI installation failed - endorphin command not available"
    exit 1
fi

CLI_VERSION=$(npx endorphin --version 2>/dev/null || echo "unknown")
print_status "CLI verified (version: $CLI_VERSION)"

# Step 7: Verify core files
print_info "Verifying core files..."

REQUIRED_FILES=(
    "node_modules/endorphin-ai/package.json"
    "node_modules/endorphin-ai/bin/endorphin.js"
    "node_modules/endorphin-ai/framework/index.js"
    "node_modules/endorphin-ai/framework/core/config-loader.js"
    "node_modules/endorphin-ai/framework/reporters/html-reporter.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Missing required file: $file"
        exit 1
    fi
done

print_status "Core files verified"

# Step 8: Test basic functionality
print_info "Testing basic functionality..."

# Test help command
if ! npx endorphin --help > /dev/null 2>&1; then
    print_error "Help command failed"
    exit 1
fi

# Test version command
if ! npx endorphin --version > /dev/null 2>&1; then
    print_error "Version command failed"
    exit 1
fi

print_status "Basic functionality verified"

# Step 9: Display summary
echo ""
echo -e "${GREEN}🎉 Local Installation Complete!${NC}"
echo -e "${GREEN}===============================${NC}"
echo ""
echo -e "${BLUE}Installation Details:${NC}"
echo "  📦 Package: endorphin-ai"
echo "  📍 Source: $PROJECT_ROOT"
echo "  📂 Target: $TARGET_DIR"
echo "  🏷️  Version: $SOURCE_VERSION"
echo ""
echo -e "${BLUE}Available Commands:${NC}"
echo "  npx endorphin --help        # Show help"
echo "  npx endorphin --version     # Show version"
echo "  npx endorphin init          # Initialize project"
echo "  npx endorphin list          # List tests"
echo "  npx endorphin run test ID   # Run specific test"
echo "  npx endorphin generate report # Generate HTML report"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. npx endorphin init       # Initialize Endorphin project"
echo "  2. Create test files in tests/ directory"
echo "  3. Configure .env with OPENAI_API_KEY"
echo "  4. Run tests and generate reports"
echo ""

print_status "Installation script completed successfully"
