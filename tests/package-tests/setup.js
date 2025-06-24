/**
 * Setup for package tests
 */

import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.VITEST = 'true';
});

afterAll(() => {
  // Cleanup
});
