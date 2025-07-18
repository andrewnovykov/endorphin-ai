/**
 * User utilities for multi-user test support
 */

import type { Page } from 'playwright';
import { AsyncLocalStorage } from 'async_hooks';

// Use AsyncLocalStorage for thread-safe context isolation
const browserManagerStorage = new AsyncLocalStorage<any>();

/**
 * Set the current browser manager instance for the current execution context
 * This is called internally by the framework
 */
export function setBrowserManager(browserManager: any): void {
  // Set the browser manager in the current async context
  browserManagerStorage.enterWith(browserManager);
}

/**
 * Get the current browser manager instance for the current execution context
 * Used internally by the framework
 */
export function getCurrentBrowserManager(): any | null {
  return browserManagerStorage.getStore() || null;
}

/**
 * Run a function with a specific browser manager context
 * This ensures the browser manager is isolated to this execution context
 */
export function runWithBrowserManager<T>(browserManager: any, fn: () => T | Promise<T>): T | Promise<T> {
  return browserManagerStorage.run(browserManager, fn);
}

/**
 * Get page for a specific user
 * This function can be used in test setup and task functions
 */
export function getPage(userId: string): Page {
  const browserManager = getCurrentBrowserManager();
  if (!browserManager) {
    throw new Error('Browser manager not initialized. This function can only be used during test execution.');
  }

  if (!browserManager.isMultiUserMode()) {
    throw new Error('Multi-user mode is not active. Use getPage() only in multi-user tests.');
  }

  return browserManager.getUserPage(userId);
}

/**
 * Get current user ID (if any)
 */
export function getCurrentUserId(): string | null {
  const browserManager = getCurrentBrowserManager();
  if (!browserManager) {
    return null;
  }

  return browserManager.getCurrentUserId();
}

/**
 * Get all user IDs in current test
 */
export function getUserIds(): string[] {
  const browserManager = getCurrentBrowserManager();
  if (!browserManager) {
    return [];
  }

  return browserManager.getUserIds();
}

/**
 * Check if multi-user mode is active
 */
export function isMultiUserMode(): boolean {
  const browserManager = getCurrentBrowserManager();
  if (!browserManager) {
    return false;
  }

  return browserManager.isMultiUserMode();
}