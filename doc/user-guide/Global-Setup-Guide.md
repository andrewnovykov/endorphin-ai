# Global Setup Guide

Run custom code before all your tests start.

## 🎯 What is Global Setup?

Global setup lets you prepare your test environment once before any tests run. Perfect for:
- Starting test servers
- Setting up test databases
- Preparing test data
- Configuring environment variables

## 📦 Quick Setup

1. Create a `global-setup.js` file in your project root:

```javascript
export default async function globalSetup() {
  console.log('🚀 Preparing test environment...');
  
  // Your setup code here
  process.env.TEST_MODE = 'true';
  
  console.log('✅ Setup complete!');
}
```

2. Tell Endorphin to use it in `endorphin.config.ts`:

```typescript
export default {
  globalSetup: './global-setup.js'
};
```

That's it! Your setup will run before tests start.

## 💡 Common Examples

### Start a Test Server

```javascript
// global-setup.js
import express from 'express';

let server;

export default async function globalSetup() {
  console.log('🚀 Starting test server...');
  
  const app = express();
  
  // Simple test endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Start server
  server = app.listen(3001);
  
  // Save for tests to use
  process.env.TEST_API_URL = 'http://localhost:3001';
  
  console.log('✅ Test server ready on port 3001');
  
  // Store server reference (optional)
  global.__testServer = server;
}
```

### Set Up Test Data

```javascript
// global-setup.js
export default async function globalSetup() {
  console.log('📊 Preparing test data...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.TEST_USER_EMAIL = 'test@example.com';
  process.env.TEST_USER_PASSWORD = 'TestPass123!';
  
  // Generate unique test ID
  process.env.TEST_RUN_ID = `test-${Date.now()}`;
  
  console.log('✅ Test data ready');
}
```

### Database Setup

```javascript
// global-setup.js
import { createConnection } from 'your-db-library';

export default async function globalSetup() {
  console.log('🗄️ Setting up test database...');
  
  // Connect to database
  const db = await createConnection({
    host: 'localhost',
    database: 'test_db',
    user: 'test_user',
    password: 'test_pass'
  });
  
  // Create test tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  // Insert test data
  await db.query(`
    INSERT INTO test_users (email) 
    VALUES ('test@example.com')
  `);
  
  await db.close();
  console.log('✅ Database ready');
}
```

## 🔧 Advanced Usage

### Handle Errors

```javascript
export default async function globalSetup() {
  try {
    console.log('🚀 Starting setup...');
    
    await riskySetupOperation();
    
    console.log('✅ Setup successful');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error; // This stops tests from running
  }
}
```

### Multiple Setup Steps

```javascript
export default async function globalSetup() {
  console.log('🚀 Running setup steps...');
  
  // Step 1: Environment
  await setupEnvironment();
  console.log('  ✅ Environment ready');
  
  // Step 2: Services
  await startServices();
  console.log('  ✅ Services started');
  
  // Step 3: Data
  await prepareTestData();
  console.log('  ✅ Test data ready');
  
  console.log('✅ All setup complete!');
}

async function setupEnvironment() {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
}

async function startServices() {
  // Start your services
}

async function prepareTestData() {
  // Prepare test data
}
```

### Conditional Setup

```javascript
export default async function globalSetup() {
  const environment = process.env.TEST_ENV || 'local';
  
  console.log(`🚀 Setting up for ${environment} environment...`);
  
  switch (environment) {
    case 'local':
      await setupLocal();
      break;
    case 'ci':
      await setupCI();
      break;
    case 'staging':
      await setupStaging();
      break;
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
  
  console.log('✅ Setup complete');
}
```

## 📝 Using Setup Data in Tests

Access environment variables set during setup:

```typescript
// tests/my-test.ts
import type { TestCase } from 'endorphin-ai';

export const API_TEST: TestCase = {
  id: 'API-001',
  name: 'API Health Check',
  description: 'Check API is running',
  priority: 'High',
  tags: ['api'],
  
  setup: async () => {
    return {
      // Use data from global setup
      apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
      testUser: process.env.TEST_USER_EMAIL
    };
  },
  
  task: async (data, setupData) => {
    return `
      Navigate to ${setupData.apiUrl}/health
      Verify response shows "ok" status
    `;
  }
};
```

## ⚠️ Important Notes

### No Teardown Yet
Global teardown is not implemented yet. To clean up:
- Use process event handlers
- Run cleanup scripts separately
- Let CI/CD handle cleanup

### File Format
- Must be JavaScript (.js) or TypeScript (.ts)
- Must export a default function
- Function can be async

### Timing
- Runs once before all tests
- If setup fails, tests won't run
- No timeout limit (be reasonable!)

## 🚨 Troubleshooting

### "Global setup file not found"
Make sure:
- File path in config is correct
- File exists in project root
- Path uses forward slashes (/)

### "Must export a default function"
Your setup file needs:
```javascript
// ✅ Correct
export default async function globalSetup() {
  // setup code
}

// ❌ Wrong - named export
export function setup() {
  // setup code
}
```

### Setup Runs But Tests Don't See Changes
- Environment variables should work
- Global variables might not persist
- Use files or external storage for complex data

## 💡 Tips

1. **Keep it Simple**: Don't overcomplicate setup
2. **Log Progress**: Help debug when things go wrong
3. **Handle Errors**: Fail gracefully with clear messages
4. **Fast Setup**: Don't slow down test starts

## 📚 Next Steps

- [Write Tests](Test-Structure-Guide.md)
- [Configure Project](User-Setup-Guide.md)
- [Environment Variables](Environment-Variables-Guide.md)

---

Need help? Keep your global setup focused on what all tests need. Test-specific setup belongs in the test itself!