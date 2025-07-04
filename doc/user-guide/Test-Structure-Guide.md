# Test Structure Guide

Learn how to write tests that Endorphin AI understands perfectly.

## 📝 Basic Test Structure

Every test needs these required fields:

```typescript
import type { TestCase } from 'endorphin-ai';

export const MY_TEST: TestCase = {
  id: 'TEST-001',           // Unique identifier
  name: 'My Test Name',     // Human-readable name
  description: 'What this test does',
  priority: 'High',         // High, Medium, or Low
  tags: ['login', 'auth'],  // Categories for organization
  task: 'What to test'      // Your test instructions
};
```

## 🎯 Writing Test Instructions

### Simple Format
Perfect for straightforward tests:

```typescript
task: 'Go to google.com and search for "AI testing"'
```

### Step-by-Step Format
Great for complex workflows:

```typescript
task: `
  1. Navigate to example.com
  2. Click "Login" button
  3. Enter email: test@example.com
  4. Enter password: password123
  5. Click "Submit"
  6. Verify dashboard appears
`
```

### Natural Language Format
Write like you're explaining to a person:

```typescript
task: `
  Go to the shopping site and add a laptop to the cart.
  Then proceed to checkout but don't complete the purchase.
  Make sure the cart total is displayed correctly.
`
```

## 🔄 Dynamic Tests

### Using Setup Functions
Prepare your test environment:

```typescript
export const DYNAMIC_TEST: TestCase = {
  id: 'DYN-001',
  name: 'Dynamic Test',
  description: 'Test with setup',
  priority: 'High',
  tags: ['dynamic'],
  
  setup: async () => {
    // Run before the test
    const testId = Date.now();
    return {
      baseUrl: 'https://myapp.com',
      testId: testId,
      testEmail: `test_${testId}@example.com`
    };
  },
  
  task: async (data, setupData) => {
    return `
      Navigate to ${setupData.baseUrl}
      Create account with email: ${setupData.testEmail}
      Verify account creation success
    `;
  }
};
```

### Using Data Functions
Generate test data on the fly:

```typescript
export const DATA_TEST: TestCase = {
  id: 'DATA-001',
  name: 'Data Generation Test',
  description: 'Test with generated data',
  priority: 'Medium',
  tags: ['data'],
  
  data: async () => {
    // Generate fresh data for each run
    return {
      username: `user_${Math.random().toString(36).substring(7)}`,
      productCount: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date().toISOString()
    };
  },
  
  task: async (data) => {
    return `
      Register new user: ${data.username}
      Add ${data.productCount} items to cart
      Verify cart shows ${data.productCount} items
    `;
  }
};
```

### Combining Setup and Data
Use both for maximum flexibility:

```typescript
export const COMPLETE_TEST: TestCase = {
  id: 'FULL-001',
  name: 'Complete Test Example',
  description: 'Uses all features',
  priority: 'High',
  tags: ['complete', 'example'],
  
  setup: async () => {
    // Configure environment
    return {
      environment: process.env.TEST_ENV || 'staging',
      baseUrl: process.env.TEST_ENV === 'prod' 
        ? 'https://prod.example.com' 
        : 'https://staging.example.com'
    };
  },
  
  data: async () => {
    // Generate test data
    return {
      user: {
        email: `test_${Date.now()}@example.com`,
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      },
      product: 'Laptop',
      quantity: 2
    };
  },
  
  task: async (data, setupData) => {
    return `
      Testing on ${setupData.environment} environment:
      
      1. Go to ${setupData.baseUrl}
      2. Register new user:
         - Email: ${data.user.email}
         - Password: ${data.user.password}
         - Name: ${data.user.firstName} ${data.user.lastName}
      3. Search for "${data.product}"
      4. Add ${data.quantity} items to cart
      5. Verify cart total is correct
      6. Log out
    `;
  }
};
```

## 📁 File Organization

### Naming Convention
```
tests/
├── LOGIN-001.ts      // Authentication tests
├── CART-001.ts       // Shopping cart tests
├── SEARCH-001.ts     // Search functionality
└── CHECKOUT-001.ts   // Checkout process
```

### Test ID Patterns
- `LOGIN-001`, `LOGIN-002` - Login tests
- `API-001`, `API-002` - API tests
- `E2E-001`, `E2E-002` - End-to-end tests
- `SMOKE-001` - Smoke tests
- `REG-001` - Regression tests

## 💡 Best Practices

### 1. Clear Instructions
```typescript
// ❌ Too vague
task: 'Test login'

// ✅ Clear and specific
task: 'Go to login page, enter valid credentials, verify redirect to dashboard'
```

### 2. Use Specific Selectors
```typescript
// ❌ Ambiguous
task: 'Click the button'

// ✅ Specific
task: 'Click the "Submit Order" button'
```

### 3. Add Verifications
```typescript
task: `
  1. Add item to cart
  2. Verify "Item added" message appears  // ✅ Good!
  3. Go to cart
  4. Verify item is in cart              // ✅ Good!
  5. Verify price is $99.99              // ✅ Good!
`
```

### 4. Handle Dynamic Content
```typescript
data: async () => ({
  timestamp: new Date().getTime(),
  uniqueEmail: `test_${new Date().getTime()}@example.com`
})
```

## 🔧 Advanced Patterns

### Conditional Logic
```typescript
task: async (data, setupData) => {
  const steps = [
    'Navigate to homepage',
    'Click "Account"'
  ];
  
  if (setupData.environment === 'staging') {
    steps.push('Accept test environment warning');
  }
  
  steps.push('Enter credentials and login');
  
  return steps.join('\n');
}
```

### Data-Driven Testing
```typescript
// Test multiple scenarios
const scenarios = [
  { product: 'Laptop', minPrice: 500 },
  { product: 'Phone', minPrice: 200 },
  { product: 'Tablet', minPrice: 300 }
];

export const SEARCH_TEST: TestCase = {
  id: 'SEARCH-001',
  name: 'Product Search Test',
  description: 'Test search with price filters',
  priority: 'Medium',
  tags: ['search', 'filters'],
  
  data: async () => {
    // Pick random scenario
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  },
  
  task: async (data) => {
    return `
      Search for "${data.product}"
      Set minimum price to $${data.minPrice}
      Verify all results are above $${data.minPrice}
    `;
  }
};
```

## 🚫 Common Mistakes

### 1. Missing Waits
```typescript
// ❌ May fail due to timing
task: `
  Click "Load More"
  Verify 20 items shown
`

// ✅ Better
task: `
  Click "Load More"
  Wait 2 seconds for items to load
  Verify 20 items shown
`
```

### 2. Hardcoded Data
```typescript
// ❌ Will fail on second run
task: 'Register user john@example.com'

// ✅ Always works
data: async () => ({ 
  email: `john_${Date.now()}@example.com` 
})
```

### 3. No Verification
```typescript
// ❌ Doesn't verify success
task: 'Submit the form'

// ✅ Verifies the action worked
task: `
  Submit the form
  Verify "Success" message appears
  Verify form is cleared
`
```

## 📚 More Examples

Find complete test examples in the `tests/` folder:
- `HEALTH-001.ts` - Basic navigation test
- `HEALTH-002.ts` - Login test with data generation
- `SAMPLE-001.ts` - Simple search test

---

Ready to write amazing tests? Start with the [Quick Start Guide](Quick-Start.md)!