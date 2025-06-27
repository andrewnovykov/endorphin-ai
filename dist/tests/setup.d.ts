/**
 * Jest Setup File for Endorphin AI Framework Tests
 */
export {};
declare global {
    var mockBrowser: {
        newContext: jest.Mock;
        close: jest.Mock;
    };
    var mockFs: {
        existsSync: jest.Mock;
        readFileSync: jest.Mock;
        writeFileSync: jest.Mock;
        mkdirSync: jest.Mock;
    };
    var originalConsole: {
        log: typeof console.log;
        error: typeof console.error;
        warn: typeof console.warn;
        info: typeof console.info;
    };
}
//# sourceMappingURL=setup.d.ts.map