/**
 * Shared utilities for pre-release tests
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Get the current package version from package.json
 */
export function getPackageVersion(): string {
  const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  return packageJson.version;
}

/**
 * Get the tarball filename for the current version
 */
export function getTarballName(): string {
  return `endorphin-ai-${getPackageVersion()}.tgz`;
}

/**
 * Get the full path to the tarball
 */
export function getTarballPath(): string {
  return path.join(PROJECT_ROOT, getTarballName());
}

/**
 * Ensure tarball exists, create it if needed
 */
export function ensureTarball(): string {
  const tarballPath = getTarballPath();
  
  if (!fs.existsSync(tarballPath)) {
    // Create tarball if it doesn't exist
    execSync('npm pack', { cwd: PROJECT_ROOT, stdio: 'pipe' });
  }
  
  return tarballPath;
}

/**
 * Install endorphin-ai from tarball in a test project
 */
export function installFromTarball(testProjectPath: string): void {
  const tarballPath = ensureTarball();
  execSync(`npm install "${tarballPath}"`, {
    cwd: testProjectPath,
    stdio: 'pipe',
  });
}

/**
 * Initialize a test project with npm and install endorphin-ai
 */
export function setupTestProject(testProjectPath: string): void {
  // Ensure directory exists
  fs.mkdirSync(testProjectPath, { recursive: true });
  
  // Initialize npm project
  execSync('npm init -y', {
    cwd: testProjectPath,
    stdio: 'pipe',
  });
  
  // Install endorphin-ai from tarball
  installFromTarball(testProjectPath);
}

/**
 * Execute endorphin CLI command with fallback methods
 */
export function runEndorphinCommand(args: string[], options: { cwd: string; timeout?: number; expectError?: boolean } = { cwd: process.cwd() }): string {
  const { cwd, timeout = 30000, expectError = false } = options;
  
  const execOptions = {
    cwd,
    encoding: 'utf8' as const,
    timeout,
    stdio: expectError ? 'pipe' as const : undefined,
  };
  
  // Try npx endorphin first
  try {
    return execSync(`npx endorphin ${args.join(' ')}`, execOptions);
  } catch (error) {
    // If we expect an error, re-throw it
    if (expectError) {
      throw error;
    }
    
    // Fallback to direct node execution
    try {
      return execSync(`node node_modules/endorphin-ai/dist/bin/endorphin.js ${args.join(' ')}`, execOptions);
    } catch (fallbackError) {
      // If both fail, try with npx endorphin-ai
      return execSync(`npx endorphin-ai ${args.join(' ')}`, execOptions);
    }
  }
}