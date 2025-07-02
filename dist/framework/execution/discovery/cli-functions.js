/**
 * CLI Functions for Test Discovery
 * Standalone functions for CLI usage with discovery caching
 */
import { resolve } from 'path';
import { TestRunner } from '../runner/test-runner.js';
import { TestDiscoverer } from './test-discoverer.js';
// Standalone functions for CLI usage
let discoveryInstance = null;
/**
 * Check if we're running in test environment
 */
function isTestEnvironment() {
    return process.env.NODE_ENV === 'test';
}
/**
 * Check if quarantined tests should be run
 */
function shouldRunQuarantined() {
    return process.env.ENDORPHIN_RUN_QUARANTINED === 'true';
}
/**
 * Check if a test is quarantined (has 'quarantined' tag)
 */
function isTestQuarantined(test) {
    return test.tags && test.tags.includes('quarantined');
}
/**
 * Safe exit that doesn't break tests
 */
function safeExit(code) {
    if (isTestEnvironment()) {
        throw new Error(`process.exit called with code ${code}`);
    }
    else {
        process.exit(code);
    }
}
/**
 * Find a single test without full discovery (optimized for single test runs)
 */
async function findSingleTest(testId, config = null) {
    const testsDirectory = resolve(process.cwd(), config?.testsDirectory || 'tests');
    try {
        // Try to find the test file by common naming patterns
        const possibleFiles = [
            `${testId}.ts`,
            `${testId}.js`,
            `${testId.toLowerCase()}.ts`,
            `${testId.toLowerCase()}.js`,
        ];
        const { readdir } = await import('fs/promises');
        const files = await readdir(testsDirectory);
        // First try exact file matches
        for (const possibleFile of possibleFiles) {
            if (files.includes(possibleFile)) {
                console.log(`🔍 Loading test from: ${possibleFile}`);
                return await loadSingleTestFile(possibleFile, testsDirectory, testId);
            }
        }
        // If not found by filename, scan all test files for the testId
        console.log(`🔍 Scanning for test ID: ${testId}`);
        const testFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of testFiles) {
            const test = await loadSingleTestFile(file, testsDirectory, testId);
            if (test) {
                return test;
            }
        }
        return null;
    }
    catch (error) {
        console.error(`❌ Error searching for test ${testId}:`, error);
        return null;
    }
}
/**
 * Load a single test file and check if it contains the target test ID
 */
async function loadSingleTestFile(filename, testsDirectory, targetTestId) {
    try {
        const filePath = resolve(testsDirectory, filename);
        const { pathToFileURL } = await import('url');
        // Load the file
        const fileUrl = pathToFileURL(filePath).href;
        const module = await import(`${fileUrl}?t=${Date.now()}`);
        // Check default export
        if (module.default && isValidTestObject(module.default) && module.default.id === targetTestId) {
            console.log(`   ✓ Found ${targetTestId}: ${module.default.name}`);
            return {
                ...module.default,
                sourceFile: filename,
                exportName: 'default',
            };
        }
        // Check named exports
        for (const [exportName, exportValue] of Object.entries(module)) {
            if (exportName !== 'default' && isValidTestObject(exportValue) && exportValue.id === targetTestId) {
                console.log(`   ✓ Found ${targetTestId}: ${exportValue.name}`);
                return {
                    ...exportValue,
                    sourceFile: filename,
                    exportName,
                };
            }
        }
        return null;
    }
    catch (error) {
        // Silently skip files that can't be loaded when scanning
        return null;
    }
}
/**
 * Validate if an object is a test configuration
 */
function isValidTestObject(obj) {
    return (obj !== null &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        (typeof obj.task === 'string' ||
            typeof obj.task === 'function' ||
            typeof obj.execute === 'function'));
}
/**
 * Ensure discovery instance is created and tests are discovered
 */
async function ensureDiscovery(config = null) {
    const currentTestsDir = resolve(process.cwd(), config?.testsDirectory || 'tests');
    // Force new discovery if tests directory changed or in test environment
    if (!discoveryInstance || config || (isTestEnvironment() && discoveryInstance.testsDirectory !== currentTestsDir)) {
        const discoveryConfig = {
            testsDirectory: config?.testsDirectory || 'tests',
            enableTypeScript: true,
            maxConcurrency: 5,
        };
        discoveryInstance = new TestDiscoverer(discoveryConfig);
        discoveryInstance.testsDirectory = currentTestsDir;
        await discoveryInstance.discoverTests();
    }
    return discoveryInstance;
}
/**
 * Run a single test by ID
 */
export async function runSingleTestById(testId, config = null) {
    // For single test execution, try to find and load the specific test file first
    const test = await findSingleTest(testId, config);
    if (!test) {
        console.error(`❌ Test not found: ${testId}`);
        console.log('💡 Use "endorphin list" to see available tests');
        if (isTestEnvironment()) {
            return { success: false, message: `Test not found: ${testId}` };
        }
        safeExit(1);
    }
    // Check if test is quarantined
    if (isTestQuarantined(test) && !shouldRunQuarantined()) {
        console.log(`⚠️ Test ${testId} is quarantined and will be skipped`);
        console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
        if (isTestEnvironment()) {
            return { success: true, message: `Test ${testId} was skipped (quarantined)`, skipped: true };
        }
        return { success: true, message: `Test ${testId} was skipped (quarantined)`, skipped: true };
    }
    if (isTestEnvironment()) {
        return { success: true, test };
    }
    const runner = new TestRunner(config);
    return runner.runTests([test]);
}
/**
 * Run tests by tag
 */
export async function runTestsByTag(tag, config = null, options = {}) {
    const discovery = await ensureDiscovery(config);
    const allTests = discovery.getTestsByTag(tag);
    if (allTests.length === 0) {
        console.error(`❌ No tests found with tag: ${tag}`);
        console.log('💡 Use "endorphin list" to see available tests and tags');
        if (isTestEnvironment()) {
            return { success: false, message: `No tests found with tag: ${tag}` };
        }
        safeExit(1);
    }
    // Filter out quarantined tests unless explicitly enabled or searching for quarantined tag
    const testsToRun = allTests.filter((test) => {
        if (isTestQuarantined(test) && !shouldRunQuarantined() && tag !== 'quarantined') {
            console.log(`⚠️ Skipping quarantined test: ${test.id}`);
            return false;
        }
        return true;
    });
    if (testsToRun.length === 0) {
        console.log(`📝 All tests with tag "${tag}" are quarantined`);
        console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
        return { success: false, message: `All tests with tag '${tag}' are quarantined` };
    }
    console.log(`\n🎯 Found ${testsToRun.length} test(s) with tag: ${tag}`);
    testsToRun.forEach((test) => {
        console.log(`  📋 ${test.id}: ${test.name}`);
    });
    console.log('');
    if (isTestEnvironment()) {
        return { success: true, tests: testsToRun };
    }
    const runner = new TestRunner(config);
    const executionOptions = {
        parallel: (options.parallel || 1) > 1,
        workers: options.parallel || 1,
    };
    return runner.runTests(testsToRun, executionOptions);
}
/**
 * Run tests by priority
 */
export async function runTestsByPriority(priority, config = null, options = {}) {
    const discovery = await ensureDiscovery(config);
    const allTests = discovery.getTestsByPriority(priority);
    if (allTests.length === 0) {
        console.error(`❌ No tests found with priority: ${priority}`);
        console.log('💡 Available priorities: High, Medium, Low');
        if (isTestEnvironment()) {
            return { success: false, message: `No tests found with priority: ${priority}` };
        }
        safeExit(1);
    }
    // Filter out quarantined tests unless explicitly enabled
    const testsToRun = allTests.filter((test) => {
        if (isTestQuarantined(test) && !shouldRunQuarantined()) {
            console.log(`⚠️ Skipping quarantined test: ${test.id}`);
            return false;
        }
        return true;
    });
    if (testsToRun.length === 0) {
        console.log(`📝 All tests with priority "${priority}" are quarantined`);
        console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
        return { success: true, message: 'All tests were skipped (quarantined)' };
    }
    console.log(`\n🎯 Found ${testsToRun.length} test(s) with priority: ${priority}`);
    testsToRun.forEach((test) => {
        console.log(`  📋 ${test.id}: ${test.name}`);
    });
    console.log('');
    if (isTestEnvironment()) {
        return { success: true, tests: testsToRun };
    }
    const runner = new TestRunner(config);
    const executionOptions = {
        parallel: (options.parallel || 1) > 1,
        workers: options.parallel || 1,
    };
    return runner.runTests(testsToRun, executionOptions);
}
/**
 * Run all tests
 */
export async function runAllTests(config = null, options = {}) {
    const discovery = await ensureDiscovery(config);
    const allTests = discovery.getAllTests();
    if (allTests.length === 0) {
        console.error('❌ No tests found');
        if (isTestEnvironment()) {
            return { success: false, message: 'No tests found' };
        }
        safeExit(1);
    }
    // Filter out quarantined tests unless explicitly enabled
    const testsToRun = allTests.filter((test) => {
        if (isTestQuarantined(test) && !shouldRunQuarantined()) {
            console.log(`⚠️ Skipping quarantined test: ${test.id}`);
            return false;
        }
        return true;
    });
    if (testsToRun.length === 0) {
        console.log('📝 All tests are quarantined');
        console.log('💡 Set ENDORPHIN_RUN_QUARANTINED=true to run quarantined tests');
        return { success: false, message: 'All tests are quarantined' };
    }
    if (isTestEnvironment()) {
        return { success: true, tests: testsToRun };
    }
    const runner = new TestRunner(config);
    const executionOptions = {
        parallel: (options.parallel || 1) > 1,
        workers: options.parallel || 1,
    };
    return runner.runTests(testsToRun, executionOptions);
}
/**
 * List all available tests
 */
export async function listAllTests(config = null) {
    const discovery = await ensureDiscovery(config);
    discovery.listTests();
    return {
        success: true,
        total: discovery.getAllTests().length,
        message: 'Tests listed successfully',
    };
}
/**
 * Discover tests and return them as TestConfig array
 */
export async function discoverTests(config) {
    const discovery = await ensureDiscovery(config);
    return discovery.getAllTests().map((test) => {
        const config = {
            id: test.id,
            name: test.name,
            description: test.description,
            priority: test.priority,
            tags: test.tags,
            task: test.task,
        };
        // Only add optional properties if they exist
        if (test.url)
            config.url = test.url;
        if (test.site)
            config.site = test.site;
        if (test.testData)
            config.testData = test.testData;
        if (test.data)
            config.data = test.data;
        if (test.setup)
            config.setup = test.setup;
        return config;
    });
}
/**
 * Get discovery statistics
 */
export async function getDiscoveryStatistics(config = null) {
    const discovery = await ensureDiscovery(config);
    return discovery.getStatistics();
}
/**
 * Clear discovery cache
 */
export function clearDiscoveryCache() {
    discoveryInstance = null;
}
/**
 * Get current discovery instance (for testing)
 */
export function getCurrentDiscoveryInstance() {
    return discoveryInstance;
}
//# sourceMappingURL=cli-functions.js.map