#!/bin/bash

# Quick Test Runner
# Run essential tests quickly for CI or pre-commit checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Running Essential Package Tests (Quick Mode)"
echo "=============================================="

# Run main test runner with core tests only (most essential)
"$SCRIPT_DIR/run-all-tests.sh" --category core

echo ""
echo "✅ Quick tests completed!"
echo ""
echo "For full test suite, run: ./run-all-tests.sh"
