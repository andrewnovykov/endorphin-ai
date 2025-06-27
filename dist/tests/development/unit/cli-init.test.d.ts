/**
 * Unit Tests for CLI Init Command - Project Initialization
 */
/**
 * Interface for mock file system methods
 */
interface MockFs {
    existsSync: jest.Mock<any, any>;
    mkdirSync: jest.Mock<any, any>;
    writeFileSync: jest.Mock<any, any>;
    readFileSync: jest.Mock<any, any>;
    copyFileSync: jest.Mock<any, any>;
}
/**
 * Interface for mock path methods
 */
interface MockPath {
    join: jest.Mock<any, any>;
    resolve: jest.Mock<any, any>;
}
/**
 * Interface for project structure
 */
interface ProjectStructure {
    directories: string[];
    files: string[];
}
/**
 * Interface for initProject result
 */
interface InitProjectResult {
    success: boolean;
    projectPath: string;
    projectName: string;
    structure: ProjectStructure;
    message: string;
    warning?: string;
    error?: string;
    suggestion?: string;
}
/**
 * Interface for sample test file
 */
interface SampleTestFile {
    fileName: string;
    content: string;
}
/**
 * Interface for createSampleTests result
 */
interface CreateSampleTestsResult {
    success: boolean;
    samplesCreated: number;
    files: string[];
}
/**
 * Interface for config generation result
 */
interface GenerateConfigResult {
    config: Record<string, any>;
    configString: string;
}
/**
 * Interface for config validation result
 */
interface ValidateConfigResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Interface for project template
 */
interface ProjectTemplate {
    name: string;
    description: string;
    files: string[];
}
/**
 * Interface for template initialization result
 */
interface InitFromTemplateResult {
    success: boolean;
    template: string;
    filesCreated: number;
    directoriesCreated: number;
}
/**
 * Interface for interactive setup result
 */
interface InteractiveSetupResult {
    success: boolean;
    inputs: Record<string, any>;
    configGenerated: boolean;
    samplesCreated: boolean;
}
/**
 * Interface for prompt user answers
 */
interface PromptUserAnswers {
    [key: string]: any;
}
/**
 * Interface for project name validation result
 */
interface ValidateProjectNameResult {
    valid: boolean;
    errors: string[];
}
//# sourceMappingURL=cli-init.test.d.ts.map