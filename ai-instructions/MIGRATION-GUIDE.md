# 🔄 Migration Guide - Endorphin AI v0.1.0

This guide helps you migrate from the legacy format to the new modern Endorphin AI framework structure.

## 📊 What's New

### ✅ New Features
- **Configuration System** - `endorphin.config.js` for project-wide settings
- **Modern Test Format** - Playwright-style async/await functions
- **CLI Integration** - Enhanced command-line interface with configuration support
- **Type Safety** - Better IntelliSense and error handling
- **Test Discovery** - Automatic test file discovery and execution
- **Environment Support** - Multiple environment configurations

### 🔄 Breaking Changes
- Test format changed from `task` strings to `async execute()` functions
- Configuration moved from individual test files to `endorphin.config.js`
- CLI command structure updated
- Test data loading simplified

---

## 🏗️ File Structure Changes

### Old Structure
```
your-project/
├── tests/
│   ├── QE-001-login.js         # Old format with task strings
│   └── QE-002-navigation.js
└── .env                        # Only environment variables
```

### New Structure
```
your-project/
├── tests/
│   ├── QE-001-login.js         # New format with execute() functions
│   └── QE-002-navigation.js
├── data/
│   ├── users.json              # Centralized test data
│   └── products.json
├── endorphin.config.js         # Project configuration
└── .env                        # Environment variables
```

---

## 🔧 Test Format Migration

### Old Format (Legacy)
```javascript
export const QE001 = {
  id: "QE-001",
  name: "Basic Login Test",
  description: "Test login functionality", 
  priority: "High",
  tags: ["authentication", "login"],
  site: "https://example.com/",
  testData: {
    email: "test@example.com",
    password: "password123"
  },
  task: `Navigate to https://example.com/.
  Click on "Log In" button.
  Fill email field with "test@example.com".
  Fill password field with "password123".
  Click "Sign In" button.
  Verify login was successful.`
};
```

### New Format (Modern)
```javascript
export default {
  id: "QE-001",
  name: "Basic Login Test",
  description: "Test login functionality",
  priority: "High", 
  tags: ["authentication", "login"],
  category: "Authentication",
  data: "users.json",                    // Reference to data file
  
  async execute(context) {               // New: async function
    const { page, data, expect } = context;
    
    // Navigate to login page
    await page.goto('https://example.com/');
    
    // Perform login actions
    await page.click('text="Log In"');
    await page.fill('#email', data.validUser.email);
    await page.fill('#password', data.validUser.password);
    await page.click('text="Sign In"');
    
    // Verify result
    await expect(page.locator('.dashboard')).toBeVisible();
  }
};
```

---

## ⚙️ Configuration Migration

### Old Method (Per Test)
```javascript
// Configuration was scattered across test files
export const QE001 = {
  // ... test config in every file
  site: "https://example.com/",
  testData: { /* data here */ },
  // ... 
};
```

### New Method (Centralized)
```javascript
// endorphin.config.js
export default {
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 }
  },
  
  execution: {
    timeout: 30000,
    screenshots: true,
    testsDirectory: './tests',
    dataDirectory: './data'
  },
  
  environments: {
    staging: {
      baseUrl: 'https://staging.example.com'
    },
    production: {
      baseUrl: 'https://example.com'
    }
  }
};
```

---

## 🔄 Step-by-Step Migration

### Step 1: Update Project Structure
```bash
# Create new directories
mkdir data
mkdir -p .endorphin/screenshots

# Move test data to data directory
# (Create data/users.json, data/products.json, etc.)
```

### Step 2: Create Configuration File
```bash
# Copy example configuration
cp node_modules/endorphin-ai/examples/endorphin.config.js ./
```

### Step 3: Update Test Files

**Before:**
```javascript
export const QE001 = {
  id: "QE-001",
  task: "Navigate to https://example.com/. Click login. Fill form."
};
```

**After:**
```javascript
export default {
  id: "QE-001",
  async execute(context) {
    const { page } = context;
    await page.goto('https://example.com/');
    await page.click('text="Login"');
    // ... rest of test logic
  }
};
```

### Step 4: Update CLI Commands

**Before:**
```bash
npm run enhanced:QE-001
npm run enhanced:auth
```

**After:**
```bash
endorphin run test QE-001
endorphin run test --tag auth
```

### Step 5: Update Data Loading

**Before:**
```javascript
// Data embedded in test files
testData: {
  email: "test@example.com",
  password: "password123"
}
```

**After:**
```javascript
// data/users.json
{
  "validUser": {
    "email": "test@example.com", 
    "password": "password123"
  }
}

// In test file
async execute(context) {
  const { data } = context;
  await page.fill('#email', data.validUser.email);
}
```

---

## 🛠️ Migration Tools

### Automated Migration Script
We provide a migration script to help convert your tests:

```bash
# Install latest version
npm install -g endorphin-ai@latest

# Run migration tool (coming soon)
endorphin-ai migrate --from legacy --to modern
```

### Manual Migration Checklist

- [ ] Create `endorphin.config.js` configuration file
- [ ] Create `data/` directory with JSON test data files
- [ ] Update test files to use `async execute()` format
- [ ] Replace `task` strings with Playwright actions
- [ ] Update CLI commands in package.json scripts
- [ ] Test migrated files with `endorphin run test`

---

## 🆘 Getting Help

### Common Migration Issues

**Issue: Tests not found**
```bash
# Solution: Check testsDirectory in config
endorphin run test --debug
```

**Issue: Data not loading**
```bash
# Solution: Verify data file paths and JSON format
# data/users.json should contain valid JSON
```

**Issue: CLI commands changed**
```bash
# Old: npm run enhanced:QE-001
# New: endorphin run test QE-001
```

### Support Resources
- 📖 [Full Documentation](README.md)
- 💬 [GitHub Issues](https://github.com/andrewnovykov/endorphin-ai/issues)
- 📧 [Email Support](mailto:iam@andrewnovykov.com)

---

## 🎯 Benefits After Migration

- ✅ **Better Type Safety** - IntelliSense and error detection
- ✅ **Cleaner Code** - Separation of concerns
- ✅ **Environment Support** - Easy switching between staging/production
- ✅ **Centralized Configuration** - One place for all settings
- ✅ **Modern Async/Await** - Standard JavaScript patterns
- ✅ **Enhanced CLI** - Better command-line experience
- ✅ **Test Discovery** - Automatic test detection and execution

The migration provides a more maintainable, scalable, and professional testing framework that follows modern JavaScript and testing best practices.
