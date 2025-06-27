/**
 * Version Helper for Post-Install Tests
 * Loads the specific version from .env file for version-pinned testing
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Loads the VERSION from the .env file in the post-install test directory
 * @returns The version string specified in .env
 */
export async function getTestVersion(): Promise<string> {
  const envPath = path.join(__dirname, '.env');

  try {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const versionMatch = envContent.match(/^VERSION=(.+)$/m);

    if (!versionMatch || !versionMatch[1]) {
      throw new Error('VERSION not found in .env file');
    }

    const version = versionMatch[1].trim();
    console.log(`Using Endorphin AI version ${version} for post-install tests`);
    return version;
  } catch (error) {
    console.error('Failed to load version from .env:', error);
    throw new Error('Could not determine test version from .env file');
  }
}

/**
 * Creates NPX command arguments for running a specific version of endorphin
 * @param version The version to install and run
 * @param command The endorphin command to run
 * @returns Array of arguments for npx command
 */
export function createVersionedCommand(version: string, command: string[]): string[] {
  return [`endorphin-ai@${version}`, ...command];
}

/**
 * Verifies a specific version of endorphin is available on npm
 * This checks npm registry without installing anything
 */
export async function verifyVersionExists(version: string): Promise<void> {
  const { spawn } = await import('child_process');

  return new Promise((resolve, reject) => {
    console.log(`Verifying endorphin-ai@${version} exists on npm registry...`);

    const child = spawn('npm', ['view', `endorphin-ai@${version}`, 'version'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0 && stdout.trim() === version) {
        console.log(`Confirmed endorphin-ai@${version} exists on npm registry`);
        resolve();
      } else {
        console.error('Failed to verify endorphin version:', stderr);
        reject(new Error(`Version endorphin-ai@${version} not found on npm registry: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
