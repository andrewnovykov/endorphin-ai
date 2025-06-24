# 📦 NPM Publishing Guide for Endorphin AI

## 🚀 How to Publish Your Package

### **Prerequisites** ✅

Your package configuration is **ready for publishing**:
- ✅ Package name: `endorphin-ai`
- ✅ Version: `0.1.0`
- ✅ Main entry point: `framework/index.js`
- ✅ CLI binary: `bin/endorphin.js`
- ✅ License: `AGPL-3.0-or-later`
- ✅ Files field configured
- ✅ Dependencies properly listed

---

## 📋 Step-by-Step Publishing Process

### **Step 1: NPM Account Setup**

```bash
# Check if you're logged in
npm whoami

# If not logged in, login with existing account
npm login

# Or create a new account
npm adduser
```

### **Step 2: Verify Package Name Availability**

```bash
# Check if package name is available
npm view endorphin-ai

# If package doesn't exist, you'll get an error (which is good!)
# If it exists, you may need to choose a different name
```

### **Step 3: Final Package Verification**

```bash
# Navigate to your project
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai

# Test package contents (dry run)
npm pack --dry-run

# Create actual package for inspection
npm pack

# Inspect package contents
tar -tzf endorphin-ai-0.1.0.tgz

# Clean up test package
rm endorphin-ai-0.1.0.tgz
```

### **Step 4: Pre-Publish Tests**

```bash
# Test local installation
npm install -g .

# Verify CLI works globally
endorphin-ai --help

# Test in a separate project (simulating user experience)
mkdir /tmp/test-endorphin-user && cd /tmp/test-endorphin-user

# Create user project structure
echo 'OPENAI_API_KEY=your_key_here' > .env
mkdir tests

# Create sample test file
cat > tests/sample-test.js << 'EOF'
export const SAMPLE_TEST = {
  id: "SAMPLE-001",
  name: "Sample Test", 
  description: "Test framework installation",
  priority: "High",
  tags: ["smoke"],
  site: "https://example.com/",
  task: "Navigate to https://example.com/ and take a screenshot."
};
EOF

# Test framework commands
endorphin-ai run test --help

# Clean up
cd ~ && rm -rf /tmp/test-endorphin-user
npm uninstall -g endorphin-ai
```

### **Step 5: Publish to NPM**

```bash
# Navigate back to your project
cd /Users/papapin777/Documents/CODE/AI/endorphin-ai

# Publish the package
npm publish

# For scoped packages (if needed)
# npm publish --access public
```

---

## 🔄 Alternative: Publish as Scoped Package

If the name `endorphin-ai` is taken, you can publish as a scoped package:

```json
{
  "name": "@andrewnovykov/endorphin-ai",
  "version": "0.1.0",
  // ... rest of package.json
}
```

Then publish with:
```bash
npm publish --access public
```

---

## 📊 Post-Publishing Steps

### **Verify Publication**

```bash
# Check your published package
npm view endorphin-ai

# Test installation from npm
npm install -g endorphin-ai
endorphin-ai --help

# Test in a new project
mkdir test-published && cd test-published
echo 'OPENAI_API_KEY=your_key_here' > .env
mkdir tests

# Create sample test
cat > tests/verify-test.js << 'EOF'
export const VERIFY_TEST = {
  id: "VERIFY-001",
  name: "Installation Verification", 
  description: "Verify endorphin-ai was installed correctly",
  priority: "High",
  tags: ["smoke"],
  site: "https://example.com/",
  task: "Navigate to https://example.com/ and take a screenshot."
};
EOF

# Run verification test
endorphin-ai run test VERIFY-001

# Clean up
cd .. && rm -rf test-published
```

### **Update Documentation**

1. Update README.md with installation instructions:
   ```markdown
   ## Installation
   ```bash
   npm install -g endorphin-ai
   ```
   
2. Add npm badge to README:
   ```markdown
   ![npm version](https://badge.fury.io/js/endorphin-ai.svg)
   ```

---

## 🔧 Common Issues & Solutions

### **Issue: Package name taken**
```bash
# Solution: Use scoped package
"name": "@your-username/endorphin-ai"
```

### **Issue: Permission denied**
```bash
# Solution: Login to npm
npm login
```

### **Issue: Files missing in package**
```bash
# Solution: Check .npmignore and package.json "files" field
npm pack --dry-run
```

### **Issue: CLI binary not working**
```bash
# Solution: Ensure bin/endorphin.js has executable permissions
chmod +x bin/endorphin.js
```

---

## 🎯 Quick Publish Commands

Once you're ready, these are the essential commands:

```bash
# 1. Login to npm
npm login

# 2. Verify package
npm pack --dry-run

# 3. Publish
npm publish

# 4. Verify
npm view endorphin-ai
```

---

## 📈 Version Management

For future updates:

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch && npm publish

# Minor version (0.1.0 -> 0.2.0)
npm version minor && npm publish

# Major version (0.1.0 -> 1.0.0)
npm version major && npm publish
```

---

## ✅ Your Package is Ready!

Your `endorphin-ai` package is **production-ready** and configured correctly for npm publication. Follow the steps above to make it available to the world! 🌍

**Package features users will get:**
- ✅ `npm install -g endorphin-ai`
- ✅ `endorphin` CLI command
- ✅ `import EndorphinAI from 'endorphin-ai'` API
- ✅ Complete browser automation testing framework
- ✅ AI-powered test generation and execution
