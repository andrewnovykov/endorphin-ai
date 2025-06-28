/**
 * CLI Command Handlers
 * Separated command handlers to reduce complexity in main CLI file
 */
/**
 * Handle help and version commands
 */
export function handleHelpAndVersion(args, packageInfo, showHelp) {
    if (args.length === 0 ||
        args.includes('--help') ||
        args.includes('-h') ||
        args.includes('help')) {
        showHelp();
        process.exit(0);
    }
    if (args.includes('--version') || args.includes('-v')) {
        console.log(`Endorphin AI v${packageInfo.version}`);
        process.exit(0);
    }
}
/**
 * Handle list command
 */
export async function handleListCommand(config) {
    console.log('📋 Available Tests:');
    const { listAllTests } = await import('../framework/core/test-discovery.js');
    await listAllTests(config);
    process.exit(0);
}
/**
 * Handle init command
 */
export async function handleInitCommand() {
    console.log('🎯 Initializing Endorphin AI project...');
    const { initProject } = await import('../framework/cli/init-command.js');
    await initProject(process.cwd());
    process.exit(0);
}
/**
 * Handle test recorder command
 */
export async function handleTestRecorderCommand(config) {
    console.log('🎬 Starting Interactive Test Recorder...');
    const { runInteractiveRecorder } = await import('../framework/test-recorder/interactive-recorder.js');
    await runInteractiveRecorder(config);
    process.exit(0);
}
/**
 * Handle test by tag
 */
export async function handleTestByTag(args, config) {
    const tagIndex = args.indexOf('--tag');
    const tag = args[tagIndex + 1];
    if (!tag) {
        console.error('❌ Error: Please specify a tag value');
        process.exit(1);
    }
    console.log(`🏷️ Running tests with tag: ${tag}`);
    const { runTestsByTag } = await import('../framework/core/test-discovery.js');
    await runTestsByTag(tag, config);
    process.exit(0);
}
/**
 * Handle test by priority
 */
export async function handleTestByPriority(args, config) {
    const priorityIndex = args.indexOf('--priority');
    const priority = args[priorityIndex + 1];
    if (!priority) {
        console.error('❌ Error: Please specify a priority value');
        process.exit(1);
    }
    console.log(`🎯 Running tests with priority: ${priority}`);
    const { runTestsByPriority } = await import('../framework/core/test-discovery.js');
    await runTestsByPriority(priority, config);
    process.exit(0);
}
/**
 * Handle test command with different options
 */
export async function handleTestCommand(args, target, config) {
    if (args.includes('--tag')) {
        return handleTestByTag(args, config);
    }
    if (args.includes('--priority')) {
        return handleTestByPriority(args, config);
    }
    if (target === 'all') {
        console.log('🚀 Running all tests...');
        const { runAllTests } = await import('../framework/core/test-discovery.js');
        await runAllTests(config);
        process.exit(0);
    }
    if (target) {
        console.log(`🧪 Running test: ${target}`);
        const { runSingleTestById } = await import('../framework/core/test-discovery.js');
        await runSingleTestById(target, config);
        process.exit(0);
    }
    console.error('❌ Error: Please specify a test ID or "all" (e.g., endorphin run test QE-001)');
    process.exit(1);
}
/**
 * Handle generate command
 */
export async function handleGenerateCommand(subcommand, args) {
    if (subcommand === 'report') {
        console.log('📊 Generating HTML test report...');
        const { HtmlReporter } = await import('../framework/reporters/html-reporter.js');
        const reporter = new HtmlReporter();
        const options = {};
        const fileIndex = args.indexOf('--file');
        if (fileIndex !== -1 && args[fileIndex + 1]) {
            options.filename = args[fileIndex + 1];
        }
        const reportPath = await reporter.generateReport(options);
        if (args.includes('--summary')) {
            console.log(`✅ Summary report generated: ${reportPath}`);
        }
        else {
            console.log(`🌐 Open report: ${reportPath}`);
        }
        process.exit(0);
    }
    console.error(`❌ Unknown generate command: ${subcommand}`);
    console.log('Use "endorphin help" for usage information');
    process.exit(1);
}
/**
 * Handle open command
 */
export async function handleOpenCommand(subcommand, target) {
    if (subcommand === 'report') {
        console.log('🌐 Opening latest test report...');
        const { HtmlReporter } = await import('../framework/reporters/html-reporter.js');
        const reporter = new HtmlReporter();
        const reportPath = target ?? null;
        await reporter.openReport(reportPath);
        process.exit(0);
    }
    console.error(`❌ Unknown open command: ${subcommand}`);
    console.log('Use "endorphin help" for usage information');
    process.exit(1);
}
//# sourceMappingURL=cli-handlers.js.map