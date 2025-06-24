#!/bin/bash

# Test Results Cleanup
# Clean old test results and logs

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
LOGS_DIR="$RESULTS_DIR/logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧹 Test Results Cleanup${NC}"
echo "========================="

# Check if results directory exists
if [ ! -d "$LOGS_DIR" ]; then
    echo -e "${YELLOW}No results directory found. Nothing to clean.${NC}"
    exit 0
fi

# Count current files
total_files=$(find "$LOGS_DIR" -type f | wc -l)
total_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)

echo ""
echo -e "${BLUE}📊 Current Results:${NC}"
echo "  Files: $total_files"
echo "  Size: $total_size"

if [ "$total_files" -eq 0 ]; then
    echo -e "${GREEN}✅ No files to clean.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🗂️ File Age Distribution:${NC}"

# Show files by age
echo "  Last 24 hours:"
recent_count=$(find "$LOGS_DIR" -type f -mtime -1 | wc -l)
echo "    $recent_count files"

echo "  1-7 days old:"
week_count=$(find "$LOGS_DIR" -type f -mtime +1 -mtime -7 | wc -l)
echo "    $week_count files"

echo "  7-30 days old:"
month_count=$(find "$LOGS_DIR" -type f -mtime +7 -mtime -30 | wc -l)
echo "    $month_count files"

echo "  Older than 30 days:"
old_count=$(find "$LOGS_DIR" -type f -mtime +30 | wc -l)
echo "    $old_count files"

# Interactive cleanup options
echo ""
echo -e "${BLUE}🎯 Cleanup Options:${NC}"
echo "  [1] Keep last 24 hours only"
echo "  [2] Keep last 7 days only"
echo "  [3] Keep last 30 days only"
echo "  [4] Remove files older than 30 days"
echo "  [5] Clean all results"
echo "  [6] Cancel"

echo ""
echo -e "${YELLOW}Select cleanup option (1-6):${NC}"
read -r choice

case $choice in
    1)
        echo -e "${YELLOW}🗑️ Removing files older than 24 hours...${NC}"
        files_to_remove=$(find "$LOGS_DIR" -type f -mtime +1)
        count=$(echo "$files_to_remove" | wc -l)
        if [ -n "$files_to_remove" ] && [ "$count" -gt 0 ]; then
            find "$LOGS_DIR" -type f -mtime +1 -delete
            echo -e "${GREEN}✅ Removed $count files${NC}"
        else
            echo -e "${GREEN}✅ No files to remove${NC}"
        fi
        ;;
    2)
        echo -e "${YELLOW}🗑️ Removing files older than 7 days...${NC}"
        files_to_remove=$(find "$LOGS_DIR" -type f -mtime +7)
        count=$(echo "$files_to_remove" | wc -l)
        if [ -n "$files_to_remove" ] && [ "$count" -gt 0 ]; then
            find "$LOGS_DIR" -type f -mtime +7 -delete
            echo -e "${GREEN}✅ Removed $count files${NC}"
        else
            echo -e "${GREEN}✅ No files to remove${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}🗑️ Removing files older than 30 days...${NC}"
        files_to_remove=$(find "$LOGS_DIR" -type f -mtime +30)
        count=$(echo "$files_to_remove" | wc -l)
        if [ -n "$files_to_remove" ] && [ "$count" -gt 0 ]; then
            find "$LOGS_DIR" -type f -mtime +30 -delete
            echo -e "${GREEN}✅ Removed $count files${NC}"
        else
            echo -e "${GREEN}✅ No files to remove${NC}"
        fi
        ;;
    4)
        echo -e "${YELLOW}🗑️ Removing files older than 30 days...${NC}"
        files_to_remove=$(find "$LOGS_DIR" -type f -mtime +30)
        count=$(echo "$files_to_remove" | wc -l)
        if [ -n "$files_to_remove" ] && [ "$count" -gt 0 ]; then
            find "$LOGS_DIR" -type f -mtime +30 -delete
            echo -e "${GREEN}✅ Removed $count files${NC}"
        else
            echo -e "${GREEN}✅ No files to remove${NC}"
        fi
        ;;
    5)
        echo -e "${RED}⚠️ This will remove ALL test results and logs.${NC}"
        echo -e "${YELLOW}Are you sure? (y/N):${NC}"
        read -r confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf "$RESULTS_DIR"
            mkdir -p "$LOGS_DIR"
            echo -e "${GREEN}✅ All results cleaned${NC}"
        else
            echo -e "${BLUE}ℹ️ Cleanup cancelled${NC}"
        fi
        ;;
    6)
        echo -e "${BLUE}ℹ️ Cleanup cancelled${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

# Show final status
if [ -d "$LOGS_DIR" ]; then
    final_files=$(find "$LOGS_DIR" -type f | wc -l)
    final_size=$(du -sh "$LOGS_DIR" 2>/dev/null | cut -f1)
    
    echo ""
    echo -e "${BLUE}📊 After Cleanup:${NC}"
    echo "  Files: $final_files"
    echo "  Size: $final_size"
fi

echo ""
echo -e "${GREEN}✅ Cleanup completed${NC}"
