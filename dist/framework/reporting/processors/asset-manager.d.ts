/**
 * Asset Manager
 * Handles static assets, screenshots, and cleanup operations for reports
 */
export interface CleanupResult {
    deletedReports: number;
    deletedScreenshots: number;
    freedSpace: number;
}
export interface AssetManagerConfig {
    reportsDir: string;
    screenshotsDir?: string;
    maxReportAge?: number;
    maxReportsPerTest?: number;
}
/**
 * Asset Manager
 * Manages static assets, screenshots, and cleanup for reports
 */
export declare class AssetManager {
    private config;
    constructor(config: AssetManagerConfig);
    /**
     * Copy static assets to reports directory
     */
    copyStaticAssets(templatesDir: string): void;
    /**
     * Copy screenshots from test results to reports directory
     */
    copyScreenshots(sessionDirs: string[]): number;
    /**
     * Clean up old report files
     */
    cleanupOldReports(maxAge?: number): CleanupResult;
    /**
     * Clean up orphaned screenshots that no longer have associated reports
     */
    private cleanupOrphanedScreenshots;
    /**
     * Clean up results keeping only the most recent per test
     */
    cleanupResults(keepPerTest?: number): CleanupResult;
    /**
     * Get all report files
     */
    private getReportFiles;
    /**
     * Group reports by test name
     */
    private groupReportsByTest;
    /**
     * Extract test name from report filename
     */
    private extractTestNameFromFilename;
    /**
     * Get asset statistics
     */
    getAssetStatistics(): {
        reportsCount: number;
        screenshotsCount: number;
        totalSize: number;
        oldestReport?: Date | undefined;
        newestReport?: Date | undefined;
    };
    /**
     * Verify asset integrity
     */
    verifyAssetIntegrity(): {
        missingAssets: string[];
        brokenLinks: string[];
        orphanedScreenshots: string[];
    };
}
//# sourceMappingURL=asset-manager.d.ts.map