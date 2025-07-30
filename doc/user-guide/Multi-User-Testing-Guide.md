# Multi-User Testing Guide

Endorphin AI supports multi-user testing, allowing you to run tests with multiple browser sessions simultaneously. This is useful for testing collaborative features, user interactions, or scenarios that require multiple users to be active at the same time.

## Overview

Multi-user tests use the `users` array and `tasks` function instead of the single `task` field. The framework automatically detects multi-user tests and creates separate browser sessions for each user.

## Basic Multi-User Test Structure

```typescript
import type { TestCase, getPage } from 'endorphin-ai';

export const MULTI_USER_TEST: TestCase = {
  id: 'MULTI-001',
  name: 'Multi-User Test',
  description: 'Test with multiple users',
  priority: 'High',
  tags: ['multi-user'],

  // Define users (max 5 users per test)
  users: ['user-1', 'user-2'],

  // Multi-user tasks function
  tasks: async (data, setupData, users) => {
    return {
      'user-1': 'STEP 1: Login as user-1...',
      'user-2': 'STEP 1: Login as user-2...',
    };
  },
};
```

## Key Features

### 1. Automatic Detection
- Framework automatically detects tests with `users` array and `tasks` function
- No CLI changes needed - use existing `npx endorphin-ai run test TEST-001` command
- Backward compatible with single-user tests

### 2. Multiple Browser Sessions
- Each user gets their own browser context and page
- Sessions run in parallel for better performance
- Maximum 5 users per test to prevent resource exhaustion

### 3. User-Specific Tasks
- `tasks` function returns user-specific task instructions
- Each user can have different workflows
- Tasks run simultaneously across all users

## Using the `getPage()` Function

You can access specific user pages in setup and task functions:

```typescript
import { getPage } from 'endorphin-ai';

export const ADVANCED_MULTI_USER_TEST: TestCase = {
  users: ['admin', 'user'],
  
  setup: async () => {
    // Access user pages directly in setup
    const adminPage = getPage('admin');
    const userPage = getPage('user');
    
    // Perform setup actions on specific pages
    await adminPage.goto('https://example.com/admin');
    await userPage.goto('https://example.com/user');
    
    return { setupComplete: true };
  },

  tasks: async (data, setupData, users) => {
    return {
      'admin': 'Perform admin tasks...',
      'user': 'Perform user tasks...',
    };
  },
};
```

## Available Utility Functions

```typescript
import { 
  getPage, 
  getCurrentUserId, 
  getUserIds, 
  isMultiUserMode 
} from 'endorphin-ai';

// Get page for specific user
const userPage = getPage('user-1');

// Get current user ID (if any)
const currentUser = getCurrentUserId();

// Get all user IDs in current test
const allUsers = getUserIds();

// Check if multi-user mode is active
const isMultiUser = isMultiUserMode();
```

## Data Generation for Multi-User Tests

```typescript
export const MULTI_USER_DATA_TEST: TestCase = {
  users: ['buyer', 'seller'],
  
  data: async () => {
    return {
      users: {
        buyer: {
          email: 'buyer@example.com',
          name: 'John Buyer',
        },
        seller: {
          email: 'seller@example.com',
          name: 'Jane Seller',
        },
      },
      product: {
        name: 'Test Product',
        price: 99.99,
      },
    };
  },

  tasks: async (data, setupData, users) => {
    return {
      buyer: `
        STEP 1: Login as ${data.users.buyer.email}
        STEP 2: Search for ${data.product.name}
        STEP 3: Add to cart
      `,
      seller: `
        STEP 1: Login as ${data.users.seller.email}
        STEP 2: List ${data.product.name} for $${data.product.price}
        STEP 3: Wait for purchase
      `,
    };
  },
};
```

## Test Results and Reporting

Multi-user tests generate detailed reports showing:
- Overall test success/failure
- Per-user results and status
- Individual user task execution details
- Combined token usage and cost tracking
- User-specific screenshots and logs

## Best Practices

### 1. User Naming
- Use descriptive user names: `'admin'`, `'customer'`, `'moderator'`
- Keep names short and clear
- Avoid special characters

### 2. Task Design
- Make tasks independent when possible
- Use setup function for common initialization
- Consider user interaction timing

### 3. Data Management
- Structure data by user in the `data` function
- Use user IDs as keys for user-specific data
- Share common data across users

### 4. Error Handling
- Test fails if any user fails
- Individual user errors are tracked
- Use descriptive error messages

## Example: E-commerce Multi-User Test

```typescript
export const ECOMMERCE_MULTI_USER: TestCase = {
  id: 'ECOM-001',
  name: 'E-commerce Multi-User Test',
  description: 'Test buyer and seller interaction',
  priority: 'High',
  tags: ['e-commerce', 'multi-user'],

  users: ['buyer', 'seller'],

  setup: async () => {
    return {
      baseUrl: 'https://marketplace.example.com',
      testProduct: 'Test Widget',
    };
  },

  data: async () => {
    return {
      buyer: {
        email: 'buyer@test.com',
        name: 'Test Buyer',
      },
      seller: {
        email: 'seller@test.com',
        name: 'Test Seller',
      },
    };
  },

  tasks: async (data, setupData, users) => {
    return {
      buyer: `
        STEP 1: Navigate to ${setupData.baseUrl}
        STEP 2: Login as ${data.buyer.email}
        STEP 3: Search for "${setupData.testProduct}"
        STEP 4: Add first result to cart
        STEP 5: Proceed to checkout
        STEP 6: Complete purchase
      `,
      seller: `
        STEP 1: Navigate to ${setupData.baseUrl}
        STEP 2: Login as ${data.seller.email}
        STEP 3: Go to seller dashboard
        STEP 4: Check for new orders
        STEP 5: Process any pending orders
      `,
    };
  },
};
```

## Migration from Single-User Tests

Converting single-user tests to multi-user:

```typescript
// Before (single-user)
export const SINGLE_USER_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Single User Test',
  task: 'Login and perform actions',
};

// After (multi-user)
export const MULTI_USER_TEST: TestCase = {
  id: 'TEST-001',
  name: 'Multi User Test',
  users: ['user-1'],
  tasks: async (data, setupData, users) => ({
    'user-1': 'Login and perform actions',
  }),
};
```

## Limitations

- Maximum 5 users per test
- All users must complete successfully for test to pass
- Browser resources scale with number of users
- Parallel execution may affect system performance

## Troubleshooting

### Common Issues

1. **"User page not found"**
   - Ensure user ID exists in `users` array
   - Check that multi-user mode is properly initialized

2. **"No task found for user"**
   - Verify `tasks` function returns tasks for all users
   - Check user ID spelling matches exactly

3. **Resource exhaustion**
   - Reduce number of users
   - Increase system resources
   - Consider running users sequentially instead of parallel

### Debug Tips

```typescript
// Check multi-user mode status
console.log('Multi-user mode:', isMultiUserMode());
console.log('Available users:', getUserIds());

// Verify user pages are accessible
users.forEach(userId => {
  try {
    const page = getPage(userId);
    console.log(`User ${userId} page:`, page.url());
  } catch (error) {
    console.error(`Error accessing ${userId}:`, error);
  }
});
```

## Advanced Usage

### Sequential User Execution

If you need users to execute sequentially instead of parallel:

```typescript
tasks: async (data, setupData, users) => {
  // Custom logic for sequential execution
  return {
    'user-1': 'STEP 1: Setup data for user-2...',
    'user-2': 'STEP 1: Wait for user-1, then proceed...',
  };
},
```

### User Synchronization

For tests requiring user synchronization, use shared state:

```typescript
setup: async () => {
  return {
    sharedState: {
      ready: false,
      data: null,
    },
  };
},
```

This guide covers the essential aspects of multi-user testing with Endorphin AI. The framework handles the complexity of managing multiple browser sessions while providing a simple API for defining user-specific workflows.