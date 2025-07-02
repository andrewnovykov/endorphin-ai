/**
 * Test Discoverer
 * Discovers and loads tests from user's tests/ directory
 */

import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import type { TestConfig } from '../../types/index.js';
import type {
  DiscoveredTest,
  DiscoveryConfig,
  TestDiscoveryResult,
  TestFileResult,
} from './discovery-types.js';

/**
 * Check if we're running in test environment
 */
function _isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Check if a test is quarantined (has 'quarantined' tag)
 */
function isTestQuarantined(test: DiscoveredTest): boolean {
  return test.tags && test.tags.includes('quarantined');
}

/**
 * Test Discovery class for finding and loading test files
 */
export class TestDiscoverer {
  private tests: Map<string, DiscoveredTest> = new Map();
  private config: DiscoveryConfig;
  public testsDirectory: string;

  constructor(config: DiscoveryConfig = {}) {
    this.config = {
      testsDirectory: 'tests',
      includePatterns: ['**/*.js', '**/*.mjs', '**/*.ts'],
      excludePatterns: ['**/*.test.js', '**/*.test.ts', '**/node_modules/**'],
      maxConcurrency: 5,
      enableTypeScript: true,
      ...config,
    };
    this.testsDirectory = resolve(process.cwd(), this.config.testsDirectory!);
  }

  /**
   * Discover and load all test files from configured tests directory
   */
  async discoverTests(): Promise<TestDiscoveryResult> {
    const startTime = Date.now();
    const errors: Array<{ file: string; error: string }> = [];
    let totalFiles = 0;

    try {
      // Use only the configured tests directory
      const searchDirectories = [
        this.testsDirectory
      ];

      const allTestFiles: { file: string, directory: string }[] = [];

      // Search in configured directories
      for (const directory of searchDirectories) {
        try {
          await stat(directory);
          console.log(`🔍 Discovering tests in: ${directory}`);
          
          const files = await readdir(directory);
          const testFiles = files.filter((file) => this.isTestFile(file));
          
          testFiles.forEach(file => {
            allTestFiles.push({ file, directory });
          });
          
          console.log(`📋 Found ${testFiles.length} test file(s) in ${directory}:`);
          testFiles.forEach(file => console.log(`   📄 ${file}`));
        } catch {
          console.log(`📁 Directory not found: ${directory}`);
        }
      }

      totalFiles = allTestFiles.length;

      if (allTestFiles.length === 0) {
        console.log(`📝 No test files found in ${this.testsDirectory} directory`);
        console.log('💡 Add .js, .mjs, or .ts files with exported test objects');
        return {
          tests: this.tests,
          totalTests: 0,
          totalFiles: 0,
          errors: [],
          duration: Date.now() - startTime,
        };
      }

      console.log(`📋 Found ${allTestFiles.length} test file(s) total`);

      // Load files concurrently with limited concurrency
      const results = await this.loadTestFilesConcurrentlyFromMultipleDirs(allTestFiles);

      // Collect errors
      results.forEach((result) => {
        if (!result.success && result.error) {
          errors.push({ file: result.filename, error: result.error });
        }
      });

      console.log(`✅ Loaded ${this.tests.size} test(s) total\n`);

      return {
        tests: this.tests,
        totalTests: this.tests.size,
        totalFiles,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error discovering tests:', message);

      return {
        tests: this.tests,
        totalTests: 0,
        totalFiles,
        errors: [{ file: 'discovery', error: message }],
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Load test files concurrently with limited concurrency
   */
  private async loadTestFilesConcurrently(testFiles: string[]): Promise<TestFileResult[]> {
    const results: TestFileResult[] = [];
    const maxConcurrency = this.config.maxConcurrency || 5;

    for (let i = 0; i < testFiles.length; i += maxConcurrency) {
      const batch = testFiles.slice(i, i + maxConcurrency);
      const batchPromises = batch.map((file) => this.loadTestFileWithResult(file));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            filename: batch[index],
            tests: [],
            success: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
        }
      });
    }

    return results;
  }

  /**
   * Load test files from multiple directories concurrently with limited concurrency
   */
  private async loadTestFilesConcurrentlyFromMultipleDirs(testFiles: { file: string, directory: string }[]): Promise<TestFileResult[]> {
    const results: TestFileResult[] = [];
    const maxConcurrency = this.config.maxConcurrency || 5;

    for (let i = 0; i < testFiles.length; i += maxConcurrency) {
      const batch = testFiles.slice(i, i + maxConcurrency);
      const batchPromises = batch.map((fileInfo) => this.loadTestFileWithResultFromDir(fileInfo.file, fileInfo.directory));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            filename: batch[index].file,
            tests: [],
            success: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
        }
      });
    }

    return results;
  }

  /**
   * Load a specific test file and return result
   */
  private async loadTestFileWithResult(filename: string): Promise<TestFileResult> {
    try {
      console.log(`   📄 ${filename}`);
      const tests = await this.loadTestFile(filename);
      return {
        filename,
        tests,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error loading ${filename}:`, message);
      return {
        filename,
        tests: [],
        success: false,
        error: message,
      };
    }
  }

  /**
   * Load a specific test file from a specific directory and return result
   */
  private async loadTestFileWithResultFromDir(filename: string, directory: string): Promise<TestFileResult> {
    try {
      console.log(`   📄 ${filename} (from ${directory})`);
      const tests = await this.loadTestFileFromDir(filename, directory);
      return {
        filename,
        tests,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error loading ${filename}:`, message);
      return {
        filename,
        tests: [],
        success: false,
        error: message,
      };
    }
  }

  /**
   * Load a specific test file and extract test objects
   */
  async loadTestFile(filename: string): Promise<DiscoveredTest[]> {
    const filePath = join(this.testsDirectory, filename);
    const testsFound: DiscoveredTest[] = [];

    // Handle TypeScript files by checking if tsx is available and using it
    if (filename.endsWith('.ts') && this.config.enableTypeScript) {
      await this.loadTypeScriptFile(filePath, filename, testsFound);
    } else {
      await this.loadJavaScriptFile(filePath, filename, testsFound);
    }

    return testsFound;
  }

  /**
   * Load a specific test file from a specific directory and extract test objects
   */
  async loadTestFileFromDir(filename: string, directory: string): Promise<DiscoveredTest[]> {
    const filePath = join(directory, filename);
    const testsFound: DiscoveredTest[] = [];

    // Handle TypeScript files by checking if tsx is available and using it
    if (filename.endsWith('.ts') && this.config.enableTypeScript) {
      await this.loadTypeScriptFile(filePath, filename, testsFound);
    } else {
      await this.loadJavaScriptFile(filePath, filename, testsFound);
    }

    return testsFound;
  }

  /**
   * Load JavaScript file using dynamic import
   */
  private async loadJavaScriptFile(
    filePath: string,
    filename: string,
    testsFound: DiscoveredTest[]
  ): Promise<void> {
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(`${fileUrl}?t=${Date.now()}`);
    this.extractTestsFromModule(module, filename, testsFound);
  }

  /**
   * Load TypeScript file using tsx or dynamic compilation
   */
  private async loadTypeScriptFile(
    filePath: string,
    filename: string,
    testsFound: DiscoveredTest[]
  ): Promise<void> {
    try {
      // Try to register tsx loader if not already registered
      if (typeof (globalThis as any).__tsx_registered === 'undefined') {
        try {
          // Try to dynamically import tsx
          const { register } = await import('tsx/esm/api');
          register();
          (globalThis as any).__tsx_registered = true;
        } catch {
          // If tsx is not available, fallback to JavaScript compilation
          console.warn(`⚠️ TypeScript loader not available, attempting to load as JavaScript`);
          const jsFilePath = filePath.replace('.ts', '.js');
          if (await this.fileExists(jsFilePath)) {
            return this.loadJavaScriptFile(jsFilePath, filename.replace('.ts', '.js'), testsFound);
          } else {
            throw new Error(
              `TypeScript file cannot be loaded: ${filename}. Please install tsx or compile to JavaScript.`
            );
          }
        }
      }

      // Now load the TypeScript file
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(`${fileUrl}?t=${Date.now()}`);
      this.extractTestsFromModule(module, filename, testsFound);
    } catch (error) {
      throw new Error(`Failed to load TypeScript file ${filename}: ${error}`);
    }
  }

  /**
   * Extract test objects from loaded module
   */
  private extractTestsFromModule(
    module: any,
    filename: string,
    testsFound: DiscoveredTest[]
  ): void {
    // Check default export first
    if (module.default && this.isValidTest(module.default)) {
      const test = module.default as TestConfig;
      const discoveredTest: DiscoveredTest = {
        ...test,
        sourceFile: filename,
        exportName: 'default',
      };

      this.tests.set(test.id, discoveredTest);
      testsFound.push(discoveredTest);
      console.log(`   ✓ ${test.id}: ${test.name}`);
    }

    // Check named exports
    for (const [exportName, exportValue] of Object.entries(module)) {
      if (exportName !== 'default' && this.isValidTest(exportValue)) {
        const test = exportValue as TestConfig;
        const discoveredTest: DiscoveredTest = {
          ...test,
          sourceFile: filename,
          exportName,
        };

        this.tests.set(test.id, discoveredTest);
        testsFound.push(discoveredTest);
        console.log(`   ✓ ${test.id}: ${test.name}`);
      }
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await import('fs').then((fs) => fs.promises.access(filePath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a file is a test file based on patterns
   */
  private isTestFile(filename: string): boolean {
    // Check exclude patterns first
    if (this.config.excludePatterns) {
      for (const pattern of this.config.excludePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return false;
        }
      }
    }

    // Check include patterns
    if (this.config.includePatterns) {
      for (const pattern of this.config.includePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return true;
        }
      }
    }

    // Default: check common test file extensions
    return filename.endsWith('.js') || filename.endsWith('.mjs') || filename.endsWith('.ts');
  }

  /**
   * Simple pattern matching (supports * wildcard)
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    }
    return filename.includes(pattern);
  }

  /**
   * Validate if an object is a valid test
   */
  private isValidTest(obj: unknown): obj is TestConfig {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      typeof (obj as any).id === 'string' &&
      typeof (obj as any).name === 'string' &&
      (typeof (obj as any).task === 'string' || typeof (obj as any).execute === 'function')
    );
  }

  /**
   * Get test by ID
   */
  getTest(id: string): DiscoveredTest | undefined {
    return this.tests.get(id);
  }

  /**
   * Get all tests
   */
  getAllTests(): DiscoveredTest[] {
    return Array.from(this.tests.values());
  }

  /**
   * Get tests by tag
   */
  getTestsByTag(tag: string): DiscoveredTest[] {
    return this.getAllTests().filter((test) => test.tags && test.tags.includes(tag));
  }

  /**
   * Get tests by priority
   */
  getTestsByPriority(priority: string): DiscoveredTest[] {
    return this.getAllTests().filter((test) => test.priority === priority);
  }

  /**
   * Get non-quarantined tests
   */
  getNonQuarantinedTests(): DiscoveredTest[] {
    return this.getAllTests().filter((test) => !isTestQuarantined(test));
  }

  /**
   * Get quarantined tests
   */
  getQuarantinedTests(): DiscoveredTest[] {
    return this.getAllTests().filter((test) => isTestQuarantined(test));
  }

  /**
   * Filter tests based on criteria
   */
  filterTests(criteria: {
    tags?: string[];
    priority?: string[];
    excludeTags?: string[];
    pattern?: string;
    includeQuarantined?: boolean;
  }): DiscoveredTest[] {
    let tests = this.getAllTests();

    // Filter by quarantine status
    if (!criteria.includeQuarantined) {
      tests = tests.filter((test) => !isTestQuarantined(test));
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      tests = tests.filter(
        (test) => test.tags && criteria.tags!.some((tag) => test.tags!.includes(tag))
      );
    }

    // Exclude by tags
    if (criteria.excludeTags && criteria.excludeTags.length > 0) {
      tests = tests.filter(
        (test) => !test.tags || !criteria.excludeTags!.some((tag) => test.tags!.includes(tag))
      );
    }

    // Filter by priority
    if (criteria.priority && criteria.priority.length > 0) {
      tests = tests.filter((test) => criteria.priority!.includes(test.priority));
    }

    // Filter by name/id pattern
    if (criteria.pattern) {
      const pattern = criteria.pattern.toLowerCase();
      tests = tests.filter(
        (test) =>
          test.id.toLowerCase().includes(pattern) || test.name.toLowerCase().includes(pattern)
      );
    }

    return tests;
  }

  /**
   * List all available tests
   */
  listTests(): void {
    const tests = this.getAllTests();

    if (tests.length === 0) {
      console.log('📝 No tests found');
      console.log('💡 Create test files in the tests/ directory');
      return;
    }

    console.log('\n📋 Available Tests:');
    console.log('══════════════════════════════════════');

    const grouped: Record<string, DiscoveredTest[]> = {};
    tests.forEach((test) => {
      const priority = test.priority || 'Unknown';
      if (!grouped[priority]) grouped[priority] = [];
      grouped[priority].push(test);
    });

    for (const [priority, priorityTests] of Object.entries(grouped)) {
      console.log(`\n🎯 ${priority} Priority:`);
      priorityTests.forEach((test) => {
        const tags = test.tags ? `[${test.tags.join(', ')}]` : '';
        const quarantineIndicator = isTestQuarantined(test) ? ' ⚠️ QUARANTINED' : '';
        console.log(`  ${test.id}: ${test.name} ${tags}${quarantineIndicator}`);
        console.log(`    📄 File: ${test.sourceFile}`);
        if (test.description) {
          console.log(`    📝 ${test.description}`);
        }
      });
    }

    // Show quarantine summary
    const totalTests = tests.length;
    const quarantinedTests = tests.filter((test) => isTestQuarantined(test));
    if (quarantinedTests.length > 0) {
      console.log(`\n⚠️ ${quarantinedTests.length} of ${totalTests} test(s) are quarantined`);
      console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
    }
    console.log('');
  }

  /**
   * Clear all discovered tests
   */
  clear(): void {
    this.tests.clear();
  }

  /**
   * Get discovery statistics
   */
  getStatistics() {
    const tests = this.getAllTests();
    const quarantinedTests = tests.filter((test) => isTestQuarantined(test));

    const priorities = tests.reduce(
      (acc, test) => {
        const priority = test.priority || 'Unknown';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const tags = tests.reduce(
      (acc, test) => {
        if (test.tags) {
          test.tags.forEach((tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalTests: tests.length,
      quarantinedTests: quarantinedTests.length,
      activeTests: tests.length - quarantinedTests.length,
      priorities,
      tags,
      testsDirectory: this.testsDirectory,
    };
  }
}
