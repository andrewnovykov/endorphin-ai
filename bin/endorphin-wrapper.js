#!/usr/bin/env node

/**
 * Endorphin AI CLI Entry Point
 * This file loads and executes the TypeScript CLI implementation
 */

// Import and run the TypeScript CLI
const { main } = await import('./endorphin.ts');
await main();
