#!/bin/bash

# Quick Development Setup Test
echo "🧪 Testing Endorphin AI Development Setup"
echo "========================================"

cd "$(dirname "$0")"

echo "📦 Checking Node.js and npm..."
node --version
npm --version

echo ""
echo "🔍 Checking installed dev dependencies..."
echo "ESLint: $(npx eslint --version 2>/dev/null || echo 'Not found')"
echo "Prettier: $(npx prettier --version 2>/dev/null || echo 'Not found')"

echo ""
echo "🎯 Testing format:check (should show files that need formatting)..."
npm run format:check 2>&1 | head -5

echo ""
echo "🎯 Testing a simple format fix..."
echo 'const test    =     "hello world"  ;' > temp-test.js
echo "Before formatting:"
cat temp-test.js
npx prettier --write temp-test.js
echo "After formatting:"
cat temp-test.js
rm temp-test.js

echo ""
echo "✅ Development setup test completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Install VS Code extensions: npm run quality:fix"
echo "2. Format all files: npm run format"
echo "3. Fix linting issues: npm run lint:fix"
echo "4. Run tests: npm run test:all"
