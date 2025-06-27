#!/bin/bash

# Cleanup script for pre-release testing
# Removes temporary test environments and cleans up resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Endorphin AI Pre-Release Test Cleanup${NC}"
echo -e "${BLUE}========================================${NC}"

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
CLEANUP_ALL=false
CLEANUP_TEMP=true
CLEANUP_LOCAL=false
TARGET_DIR=""
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--all)
            CLEANUP_ALL=true
            CLEANUP_TEMP=true
            CLEANUP_LOCAL=true
            shift
            ;;
        -t|--temp-only)
            CLEANUP_TEMP=true
            CLEANUP_LOCAL=false
            shift
            ;;
        -l|--local-only)
            CLEANUP_TEMP=false
            CLEANUP_LOCAL=true
            shift
            ;;
        -d|--dir)
            TARGET_DIR="$2"
            CLEANUP_TEMP=false
            CLEANUP_LOCAL=true
            shift 2
            ;;
        -f|--force)
            FORCE=true
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
            echo "  -a, --all           Clean up all temporary and local test directories"
            echo "  -t, --temp-only     Clean up only temporary directories (default)"
            echo "  -l, --local-only    Clean up only local test installations"
            echo "  -d, --dir DIR       Clean up specific directory"
            echo "  -f, --force         Force cleanup without confirmation"
            echo "  -v, --verbose       Verbose output"
            echo "  -h, --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Clean temp directories"
            echo "  $0 -a                                # Clean everything"
            echo "  $0 -d /tmp/my-test                   # Clean specific directory"
            echo "  $0 -f -a                            # Force clean everything"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Function to clean up directory
cleanup_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ ! -d "$dir" ]]; then
        print_info "$description does not exist: $dir"
        return 0
    fi
    
    print_info "Cleaning up $description: $dir"
    
    if [[ "$FORCE" == "false" ]]; then
        echo -n "Delete $dir? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_info "Skipped: $dir"
            return 0
        fi
    fi
    
    if [[ "$VERBOSE" == "true" ]]; then
        rm -rf "$dir"
    else
        rm -rf "$dir" 2>/dev/null || true
    fi
    
    if [[ ! -d "$dir" ]]; then
        print_status "Removed: $dir"
    else
        print_warning "Could not fully remove: $dir"
    fi
}

# Function to find and clean test directories
find_and_clean_test_dirs() {
    local base_dir="$1"
    local pattern="$2"
    local description="$3"
    
    if [[ ! -d "$base_dir" ]]; then
        print_info "$description base directory does not exist: $base_dir"
        return 0
    fi
    
    print_info "Searching for $description in: $base_dir"
    
    # Find directories matching the pattern
    local dirs=()
    while IFS= read -r -d '' dir; do
        dirs+=("$dir")
    done < <(find "$base_dir" -maxdepth 2 -type d -name "$pattern" -print0 2>/dev/null || true)
    
    if [[ ${#dirs[@]} -eq 0 ]]; then
        print_info "No $description found"
        return 0
    fi
    
    print_info "Found ${#dirs[@]} $description"
    
    for dir in "${dirs[@]}"; do
        cleanup_directory "$dir" "$description"
    done
}

# Main cleanup logic
echo ""
print_info "Starting cleanup process..."

# Clean up specific directory if provided
if [[ -n "$TARGET_DIR" ]]; then
    cleanup_directory "$TARGET_DIR" "specified directory"
fi

# Clean up temporary directories
if [[ "$CLEANUP_TEMP" == "true" ]]; then
    print_info "Cleaning up temporary test directories..."
    
    # Common temporary directory patterns
    find_and_clean_test_dirs "/tmp" "endorphin-*" "temporary Endorphin directories"
    find_and_clean_test_dirs "/tmp" "*endorphin-test*" "temporary test directories"
    
    # Clean up our specific temp patterns
    TEMP_PATTERNS=(
        "/tmp/endorphin-pre-release-test"
        "/tmp/endorphin-test-*"
        "/tmp/endorphin-local-test-*"
    )
    
    for pattern in "${TEMP_PATTERNS[@]}"; do
        # Use shell expansion for patterns with wildcards
        if [[ "$pattern" == *"*"* ]]; then
            for dir in $pattern; do
                if [[ -d "$dir" ]]; then
                    cleanup_directory "$dir" "temporary directory"
                fi
            done
        else
            cleanup_directory "$pattern" "temporary directory"
        fi
    done
fi

# Clean up local test installations
if [[ "$CLEANUP_LOCAL" == "true" ]]; then
    print_info "Cleaning up local test installations..."
    
    # Look for test directories in common locations
    LOCAL_PATTERNS=(
        "$HOME/tmp/endorphin-*"
        "$HOME/Desktop/endorphin-test*"
        "$HOME/Documents/endorphin-test*"
    )
    
    for pattern in "${LOCAL_PATTERNS[@]}"; do
        for dir in $pattern; do
            if [[ -d "$dir" ]]; then
                cleanup_directory "$dir" "local test directory"
            fi
        done
    done
fi

# Clean up npm cache if requested
if [[ "$CLEANUP_ALL" == "true" ]]; then
    print_info "Cleaning npm cache..."
    
    if command -v npm >/dev/null 2>&1; then
        if [[ "$VERBOSE" == "true" ]]; then
            npm cache clean --force
        else
            npm cache clean --force > /dev/null 2>&1 || true
        fi
        print_status "Npm cache cleaned"
    else
        print_warning "npm not found, skipping cache cleanup"
    fi
fi

# Display process information cleanup
print_info "Checking for any running Endorphin processes..."

ENDORPHIN_PROCESSES=$(pgrep -f "endorphin" 2>/dev/null || true)
if [[ -n "$ENDORPHIN_PROCESSES" ]]; then
    print_warning "Found running Endorphin processes:"
    ps -p $ENDORPHIN_PROCESSES 2>/dev/null || true
    
    if [[ "$FORCE" == "true" ]]; then
        print_info "Terminating processes..."
        kill -TERM $ENDORPHIN_PROCESSES 2>/dev/null || true
        sleep 2
        kill -KILL $ENDORPHIN_PROCESSES 2>/dev/null || true
        print_status "Processes terminated"
    else
        print_warning "Use --force to terminate these processes"
    fi
else
    print_status "No running Endorphin processes found"
fi

# Clean up browser processes if they exist
print_info "Checking for orphaned browser processes..."

BROWSER_PROCESSES=$(pgrep -f "chromium|chrome|firefox" 2>/dev/null | head -5 || true)
if [[ -n "$BROWSER_PROCESSES" ]]; then
    print_info "Found browser processes (showing first 5):"
    ps -p $BROWSER_PROCESSES 2>/dev/null || true
    print_info "Consider manually closing unnecessary browser instances"
else
    print_status "No concerning browser processes found"
fi

# Display summary
echo ""
echo -e "${GREEN}🎉 Cleanup Process Complete!${NC}"
echo -e "${GREEN}============================${NC}"
echo ""

# Show disk space freed (approximate)
if command -v du >/dev/null 2>&1; then
    print_info "Checking remaining temporary files..."
    TEMP_SIZE=$(du -sh /tmp/*endorphin* 2>/dev/null | awk '{sum+=$1} END {print sum "K"}' || echo "0K")
    if [[ "$TEMP_SIZE" != "0K" ]]; then
        print_warning "Remaining temporary files: $TEMP_SIZE"
    else
        print_status "All temporary files cleaned"
    fi
fi

echo -e "${BLUE}Cleanup Summary:${NC}"
echo "  🗑️  Temporary directories: $([ "$CLEANUP_TEMP" == "true" ] && echo "Cleaned" || echo "Skipped")"
echo "  📁 Local test directories: $([ "$CLEANUP_LOCAL" == "true" ] && echo "Cleaned" || echo "Skipped")"
echo "  🔄 Npm cache: $([ "$CLEANUP_ALL" == "true" ] && echo "Cleaned" || echo "Skipped")"
echo ""
echo -e "${BLUE}To create a new test environment:${NC}"
echo "  ./tests/pre-release/scripts/setup-local-test.sh"
echo ""

print_status "Cleanup script completed successfully"
