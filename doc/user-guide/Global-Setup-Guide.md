# Global Setup & Teardown Guide - Endorphin AI

_Last Updated: June 27, 2025 - v0.4.1+_

## 🎯 Overview

Global Setup and Teardown functionality allows you to run custom JavaScript code
before and after your entire test suite. This is essential for preparing test
environments, seeding databases, starting services, cleaning up resources, and
other operations that need to happen once per test run.

## 📋 Table of Contents

1. [Use Cases](#use-cases)
2. [File Structure](#file-structure)
3. [Setup Configuration](#setup-configuration)
4. [Setup File Format](#setup-file-format)
5. [Teardown File Format](#teardown-file-format)
6. [Advanced Examples](#advanced-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎪 Use Cases

### Common Setup Scenarios

- **Database Preparation**: Seed test data, create test schemas
- **Service Management**: Start mock servers, external dependencies
- **Environment Setup**: Set environment variables, configure test environment
- **Authentication**: Generate test tokens, setup test users
- **File System**: Create temporary directories, prepare test files
- **API Mocking**: Start mock servers for external APIs

### Common Teardown Scenarios

- **Resource Cleanup**: Stop services, close connections
- **Database Cleanup**: Clear test data, drop test schemas
- **File Cleanup**: Remove temporary files and directories
- **Report Generation**: Generate test reports, upload results
- **Notification**: Send test completion notifications
- **Environment Reset**: Restore original environment state

---

## 📁 File Structure

Create these files in your project root:

```
your-project/
├── global.setup.js        # Setup operations before all tests
├── global.teardown.js     # Teardown operations after all tests
├── endorphin.config.ts    # Configuration
├── tests/                 # Your test files
└── package.json
```

---

## ⚙️ Setup Configuration

Configure global setup/teardown in your `endorphin.config.ts`:

```javascript
export default {
  openaiApiKey: process.env.OPENAI_API_KEY,
  browser: {
    headless: false,
    slowMo: 500,
  },
  resultsDir: './test-results',

  // Global setup and teardown configuration
  globalSetup: './global.setup.js', // Path to setup file
  globalTeardown: './global.teardown.js', // Path to teardown file

  // Optional: Setup/teardown options
  setupOptions: {
    timeout: 30000, // Setup timeout in milliseconds
    retries: 1, // Number of retries if setup fails
    continueOnFailure: false, // Whether to run tests if setup fails
  },

  teardownOptions: {
    timeout: 15000, // Teardown timeout in milliseconds
    retries: 1, // Number of retries if teardown fails
    forceCleanup: true, // Run teardown even if tests failed
  },
};
```

### Alternative Configuration Options

#### Method 1: Simple Paths

```javascript
export default {
  // ... other config
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
};
```

#### Method 2: Array of Files

```javascript
export default {
  // ... other config
  globalSetup: [
    './setup/database.setup.js',
    './setup/services.setup.js',
    './setup/environment.setup.js',
  ],
  globalTeardown: [
    './teardown/cleanup.teardown.js',
    './teardown/reports.teardown.js',
  ],
};
```

#### Method 3: Detailed Configuration

```javascript
export default {
  // ... other config
  globalSetup: {
    files: ['./global.setup.js'],
    timeout: 60000,
    parallel: false,
    environment: 'test',
  },
};
```

---

## 🚀 Setup File Format

### Basic Setup File (`global.setup.js`)

```javascript
/**
 * Global setup - runs once before all tests
 * This file should export a default function that performs setup operations
 */

export default async function globalSetup() {
  console.log('🚀 Starting global setup...');

  try {
    // Your setup code here
    await setupDatabase();
    await startMockServices();
    await prepareTestEnvironment();

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error; // This will prevent tests from running
  }
}

/**
 * Setup database with test data
 */
async function setupDatabase() {
  console.log('📊 Setting up test database...');

  // Example: Database setup
  const database = await connectToDatabase(process.env.TEST_DB_URL);

  // Create test schema
  await database.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Seed test data
  await database.query(`
    INSERT INTO test_users (email, password) VALUES 
    ('test@example.com', 'hashed_password'),
    ('admin@example.com', 'admin_password')
    ON CONFLICT (email) DO NOTHING
  `);

  await database.close();
  console.log('✅ Database setup complete');
}

/**
 * Start mock services for testing
 */
async function startMockServices() {
  console.log('🔧 Starting mock services...');

  // Example: Start mock API server
  const express = require('express');
  const app = express();

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const server = app.listen(3001, () => {
    console.log('🟢 Mock API server started on port 3001');
  });

  // Store server reference for teardown
  global.mockServer = server;
}

/**
 * Prepare test environment
 */
async function prepareTestEnvironment() {
  console.log('🌍 Preparing test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.API_BASE_URL = 'http://localhost:3001';
  process.env.TEST_MODE = 'true';

  // Create temporary directories
  const fs = require('fs').promises;
  await fs.mkdir('./temp/test-uploads', { recursive: true });
  await fs.mkdir('./temp/test-downloads', { recursive: true });

  console.log('✅ Environment preparation complete');
}
```

### Advanced Setup with Multiple Services

```javascript
// global.setup.js
import { DatabaseManager } from './utils/database-manager.js';
import { MockServerManager } from './utils/mock-server-manager.js';
import { TestDataGenerator } from './utils/test-data-generator.js';

export default async function globalSetup() {
  console.log('🚀 Starting comprehensive global setup...');

  const setupStartTime = Date.now();

  try {
    // Initialize managers
    const dbManager = new DatabaseManager();
    const serverManager = new MockServerManager();
    const dataGenerator = new TestDataGenerator();

    // Setup in specific order
    await setupPhase1_Infrastructure(dbManager, serverManager);
    await setupPhase2_Data(dbManager, dataGenerator);
    await setupPhase3_Services(serverManager);
    await setupPhase4_Environment();

    const setupTime = Date.now() - setupStartTime;
    console.log(`✅ Global setup completed in ${setupTime}ms`);

    // Store setup info for tests and teardown
    global.testSetup = {
      dbManager,
      serverManager,
      startTime: setupStartTime,
      setupDuration: setupTime,
    };
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    await emergencyCleanup();
    throw error;
  }
}

async function setupPhase1_Infrastructure(dbManager, serverManager) {
  console.log('📊 Phase 1: Infrastructure setup...');

  // Initialize database
  await dbManager.initialize();
  await dbManager.createTestSchemas();

  // Prepare mock servers
  await serverManager.prepareServers();
}

async function setupPhase2_Data(dbManager, dataGenerator) {
  console.log('🗃️ Phase 2: Test data preparation...');

  // Generate and insert test data
  const testData = await dataGenerator.generateTestSuite();
  await dbManager.seedData(testData);
}

async function setupPhase3_Services(serverManager) {
  console.log('🔧 Phase 3: Service startup...');

  // Start all mock services
  await serverManager.startAllServices();

  // Health check all services
  await serverManager.healthCheck();
}

async function setupPhase4_Environment() {
  console.log('🌍 Phase 4: Environment configuration...');

  // Configure environment
  process.env.TEST_SUITE_ID = `test-${Date.now()}`;
  process.env.TEST_START_TIME = new Date().toISOString();

  // Prepare file system
  await prepareTestDirectories();
}

async function emergencyCleanup() {
  console.log('🧹 Performing emergency cleanup...');
  try {
    // Attempt to clean up any partial setup
    if (global.testSetup?.dbManager) {
      await global.testSetup.dbManager.cleanup();
    }
    if (global.testSetup?.serverManager) {
      await global.testSetup.serverManager.stopAll();
    }
  } catch (cleanupError) {
    console.error('⚠️ Emergency cleanup failed:', cleanupError.message);
  }
}
```

---

## 🔄 Teardown File Format

### Basic Teardown File (`global.teardown.js`)

```javascript
/**
 * Global teardown - runs once after all tests complete
 * This file should export a default function that performs cleanup operations
 */

export default async function globalTeardown() {
  console.log('🧹 Starting global teardown...');

  try {
    // Your teardown code here
    await cleanupDatabase();
    await stopMockServices();
    await cleanupTestEnvironment();
    await generateReports();

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('⚠️ Global teardown encountered errors:', error.message);
    // Don't throw - we want to complete as much cleanup as possible
  }
}

/**
 * Clean up test database
 */
async function cleanupDatabase() {
  console.log('🗄️ Cleaning up test database...');

  try {
    const database = await connectToDatabase(process.env.TEST_DB_URL);

    // Clean up test data
    await database.query("DELETE FROM test_users WHERE email LIKE 'test%'");

    // Drop test tables if needed
    await database.query('DROP TABLE IF EXISTS temp_test_data');

    await database.close();
    console.log('✅ Database cleanup complete');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  }
}

/**
 * Stop mock services
 */
async function stopMockServices() {
  console.log('🛑 Stopping mock services...');

  try {
    // Stop mock server if it exists
    if (global.mockServer) {
      await new Promise((resolve) => {
        global.mockServer.close(resolve);
      });
      console.log('🟢 Mock API server stopped');
    }
  } catch (error) {
    console.error('❌ Failed to stop mock services:', error.message);
  }
}

/**
 * Clean up test environment
 */
async function cleanupTestEnvironment() {
  console.log('🌍 Cleaning up test environment...');

  try {
    // Remove temporary directories
    const fs = require('fs').promises;
    await fs.rmdir('./temp', { recursive: true, force: true });

    // Reset environment variables
    delete process.env.TEST_MODE;
    delete process.env.TEST_SUITE_ID;

    console.log('✅ Environment cleanup complete');
  } catch (error) {
    console.error('❌ Environment cleanup failed:', error.message);
  }
}

/**
 * Generate test reports
 */
async function generateReports() {
  console.log('📊 Generating test reports...');

  try {
    const setupInfo = global.testSetup || {};
    const endTime = Date.now();
    const totalDuration = endTime - (setupInfo.startTime || endTime);

    const report = {
      testSuiteId: process.env.TEST_SUITE_ID,
      startTime: setupInfo.startTime,
      endTime: endTime,
      totalDuration: totalDuration,
      setupDuration: setupInfo.setupDuration,
      timestamp: new Date().toISOString(),
    };

    // Save report
    const fs = require('fs').promises;
    await fs.writeFile(
      './test-results/suite-summary.json',
      JSON.stringify(report, null, 2)
    );

    console.log('✅ Test reports generated');
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
  }
}
```

### Advanced Teardown with Error Recovery

```javascript
// global.teardown.js
export default async function globalTeardown() {
  console.log('🧹 Starting comprehensive global teardown...');

  const teardownErrors = [];

  // Run all teardown operations, collecting errors but not stopping
  await runTeardownOperation(
    'Database Cleanup',
    cleanupDatabase,
    teardownErrors
  );
  await runTeardownOperation(
    'Service Shutdown',
    stopAllServices,
    teardownErrors
  );
  await runTeardownOperation('File Cleanup', cleanupFiles, teardownErrors);
  await runTeardownOperation(
    'Report Generation',
    generateFinalReports,
    teardownErrors
  );
  await runTeardownOperation(
    'Notification Sending',
    sendNotifications,
    teardownErrors
  );

  // Report teardown summary
  if (teardownErrors.length === 0) {
    console.log('✅ Global teardown completed successfully');
  } else {
    console.warn(
      `⚠️ Global teardown completed with ${teardownErrors.length} errors:`
    );
    teardownErrors.forEach((error) => console.warn(`  - ${error}`));
  }
}

async function runTeardownOperation(name, operation, errorCollector) {
  try {
    console.log(`🔄 ${name}...`);
    await operation();
    console.log(`✅ ${name} complete`);
  } catch (error) {
    const errorMsg = `${name} failed: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    errorCollector.push(errorMsg);
  }
}

async function cleanupDatabase() {
  const setupInfo = global.testSetup;
  if (setupInfo?.dbManager) {
    await setupInfo.dbManager.cleanup();
    await setupInfo.dbManager.close();
  }
}

async function stopAllServices() {
  const setupInfo = global.testSetup;
  if (setupInfo?.serverManager) {
    await setupInfo.serverManager.stopAll();
  }
}

async function cleanupFiles() {
  const fs = require('fs').promises;

  // Clean up temporary files
  await fs.rmdir('./temp', { recursive: true, force: true });

  // Archive old test results
  const archiveDir = `./test-results/archive/${new Date().toISOString().split('T')[0]}`;
  await fs.mkdir(archiveDir, { recursive: true });
}

async function generateFinalReports() {
  // Generate comprehensive test suite report
  const report = {
    suiteId: process.env.TEST_SUITE_ID,
    duration: global.testSetup?.setupDuration || 0,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    // Add more reporting data as needed
  };

  const fs = require('fs').promises;
  await fs.writeFile(
    './test-results/final-report.json',
    JSON.stringify(report, null, 2)
  );
}

async function sendNotifications() {
  // Send completion notifications (Slack, email, etc.)
  if (process.env.SLACK_WEBHOOK_URL) {
    await sendSlackNotification({
      text: `Test suite ${process.env.TEST_SUITE_ID} completed`,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 🔧 Advanced Examples

### Database Setup with Multiple Environments

```javascript
// global.setup.js
import { Pool } from 'pg';

export default async function globalSetup() {
  const environment = process.env.NODE_ENV || 'test';

  switch (environment) {
    case 'test':
      await setupTestDatabase();
      break;
    case 'integration':
      await setupIntegrationDatabase();
      break;
    case 'e2e':
      await setupE2EDatabase();
      break;
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

async function setupTestDatabase() {
  console.log('🧪 Setting up test database...');

  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
    max: 5,
  });

  // Run migrations
  await runMigrations(pool);

  // Seed test data
  await seedTestData(pool);

  global.dbPool = pool;
}

async function runMigrations(pool) {
  const migrations = [
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    // Add more migrations as needed
  ];

  for (const migration of migrations) {
    await pool.query(migration);
  }
}
```

### Docker Service Management

```javascript
// global.setup.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🐳 Starting Docker services...');

  // Start required services using docker-compose
  await execAsync('docker-compose -f docker-compose.test.yml up -d');

  // Wait for services to be ready
  await waitForService('http://localhost:5432', 'PostgreSQL'); // Database
  await waitForService('http://localhost:6379', 'Redis'); // Cache
  await waitForService('http://localhost:9200', 'Elasticsearch'); // Search

  console.log('✅ All Docker services are ready');
}

async function waitForService(url, serviceName, maxAttempts = 30) {
  console.log(`⏳ Waiting for ${serviceName} to be ready...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(url);
      console.log(`✅ ${serviceName} is ready`);
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(
          `${serviceName} failed to start after ${maxAttempts} attempts`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
```

### API Key and Authentication Setup

```javascript
// global.setup.js
export default async function globalSetup() {
  console.log('🔐 Setting up authentication...');

  // Generate test API keys
  const testApiKey = await generateTestApiKey();
  const adminApiKey = await generateAdminApiKey();

  // Store for use in tests
  process.env.TEST_API_KEY = testApiKey;
  process.env.ADMIN_API_KEY = adminApiKey;

  // Setup test users
  await createTestUsers();

  console.log('✅ Authentication setup complete');
}

async function generateTestApiKey() {
  const response = await fetch('http://localhost:3000/api/test-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Suite Key',
      permissions: ['read', 'write'],
      expiresIn: '1h',
    }),
  });

  const data = await response.json();
  return data.apiKey;
}

async function createTestUsers() {
  const users = [
    { email: 'test@example.com', role: 'user' },
    { email: 'admin@example.com', role: 'admin' },
  ];

  for (const user of users) {
    await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  }
}
```

---

## 📝 Best Practices

### 1. Error Handling

```javascript
// ✅ Good: Comprehensive error handling
export default async function globalSetup() {
  try {
    await criticalSetup();
  } catch (error) {
    console.error('Critical setup failed:', error);
    await emergencyCleanup();
    throw error; // Prevent tests from running
  }

  try {
    await optionalSetup();
  } catch (error) {
    console.warn('Optional setup failed:', error.message);
    // Continue with tests
  }
}

// ❌ Avoid: No error handling
export default async function globalSetup() {
  await setup(); // If this fails, no cleanup happens
}
```

### 2. Resource Management

```javascript
// ✅ Good: Store resources for cleanup
export default async function globalSetup() {
  const server = await startMockServer();
  const dbConnection = await connectToDatabase();

  // Store for teardown
  global.testResources = {
    server,
    dbConnection,
    createdAt: Date.now()
  };
}

// ✅ Good: Clean up stored resources
export default async function globalTeardown() {
  const resources = global.testResources;
  if (resources) {
    await resources.server?.close();
    await resources.dbConnection?.close();
  }
}
```

### 3. Environment Isolation

```javascript
// ✅ Good: Environment-specific setup
export default async function globalSetup() {
  const env = process.env.NODE_ENV;

  if (env === 'test') {
    await setupTestEnvironment();
  } else if (env === 'ci') {
    await setupCIEnvironment();
  } else {
    throw new Error(`Unsupported environment: ${env}`);
  }
}
```

### 4. Logging and Monitoring

```javascript
// ✅ Good: Detailed logging
export default async function globalSetup() {
  const startTime = Date.now();
  console.log('🚀 Global setup started at', new Date().toISOString());

  await setupDatabase();
  console.log('📊 Database setup completed');

  await setupServices();
  console.log('🔧 Services setup completed');

  const duration = Date.now() - startTime;
  console.log(`✅ Global setup completed in ${duration}ms`);
}
```

### 5. Timeout Handling

```javascript
// ✅ Good: Implement timeouts
async function setupWithTimeout(operation, timeoutMs = 30000) {
  return Promise.race([
    operation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Setup timeout')), timeoutMs)
    ),
  ]);
}

export default async function globalSetup() {
  await setupWithTimeout(setupDatabase, 15000);
  await setupWithTimeout(startServices, 10000);
}
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Setup Timeout

**Problem**: Setup takes too long and times out

**Solutions**:

```javascript
// Increase timeout in config
export default {
  setupOptions: {
    timeout: 60000, // 60 seconds
  },
};

// Or implement custom timeout handling
async function robustSetup() {
  const operations = [
    () => setupDatabase(),
    () => startServices(),
    () => prepareData(),
  ];

  for (const operation of operations) {
    await setupWithTimeout(operation, 30000);
  }
}
```

#### 2. Setup Fails But Tests Still Run

**Problem**: Setup fails but framework continues with tests

**Solutions**:

```javascript
// Throw error to prevent test execution
export default async function globalSetup() {
  try {
    await criticalSetup();
  } catch (error) {
    console.error('Critical setup failed - aborting tests');
    throw error; // This prevents tests from running
  }
}
```

#### 3. Teardown Not Running

**Problem**: Teardown doesn't execute after test failures

**Solutions**:

```javascript
// Configure to always run teardown
export default {
  teardownOptions: {
    forceCleanup: true, // Run even if tests failed
  },
};
```

#### 4. Resource Conflicts

**Problem**: Multiple test runs conflict with each other

**Solutions**:

```javascript
// Use unique identifiers
export default async function globalSetup() {
  const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  process.env.TEST_SUITE_ID = testId;

  // Use unique database names, ports, etc.
  const dbName = `test_db_${testId}`;
  const port = 3000 + Math.floor(Math.random() * 1000);
}
```

### Debug Mode

Enable debug logging:

```bash
# Run with debug output
DEBUG=endorphin:setup npx endorphin run test all

# Or set debug in config
export default {
  debug: true,
  setupOptions: {
    verbose: true
  }
};
```

### Health Checks

Implement health checks in setup:

```javascript
async function healthCheck() {
  const checks = [
    { name: 'Database', check: () => checkDatabase() },
    { name: 'API Server', check: () => checkApiServer() },
    { name: 'File System', check: () => checkFileSystem() },
  ];

  for (const { name, check } of checks) {
    try {
      await check();
      console.log(`✅ ${name} health check passed`);
    } catch (error) {
      console.error(`❌ ${name} health check failed:`, error.message);
      throw error;
    }
  }
}
```

---

## 🔮 Feature Status

> **⚠️ Implementation Note**: Global Setup & Teardown feature is currently in
> planning phase. This guide serves as both documentation and specification for
> the upcoming implementation.

**Current Status**: Planning & Design Phase **Target Release**: Next minor
version **Implementation Tasks**:

- [ ] Configuration system updates
- [ ] Setup/teardown execution engine
- [ ] Error handling and timeout management
- [ ] Integration with test runner
- [ ] CLI support and debugging tools

---

_This guide will be updated as the Global Setup & Teardown feature is
implemented. Check back for the latest information and examples._
