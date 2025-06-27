declare namespace _default {
    let preset: string;
    let extensionsToTreatAsEsm: string[];
    let testEnvironment: string;
    let testMatch: string[];
    let collectCoverage: boolean;
    let coverageDirectory: string;
    let coverageReporters: string[];
    let collectCoverageFrom: string[];
    namespace coverageThreshold {
        namespace global {
            let branches: number;
            let functions: number;
            let lines: number;
            let statements: number;
        }
    }
    let moduleNameMapper: {
        '^@/(.*)$': string;
        '^@core/(.*)$': string;
        '^@tools/(.*)$': string;
        '^@config/(.*)$': string;
        '^@types/(.*)$': string;
        '^@runner/(.*)$': string;
        '^@reporters/(.*)$': string;
    };
    let setupFilesAfterEnv: string[];
    let transform: {
        '^.+\\.ts$': (string | {
            useESM: boolean;
            tsconfig: string;
        })[];
    };
    let testTimeout: number;
    let verbose: boolean;
    let clearMocks: boolean;
    let restoreMocks: boolean;
    let testPathIgnorePatterns: string[];
}
export default _default;
//# sourceMappingURL=jest.config-legacy.d.ts.map