/**
 * Page Snapshot Manager
 * Handles creation, storage, and comparison of page snapshots
 */
import { Page } from 'playwright';
import type { PageDelta, PageSnapshot, SnapshotCaptureOptions } from '../../content/types/snapshot-types.js';
import { type OptimizationContext } from '../../content/processors/content-processor.js';
export declare class PageSnapshotManager {
    private snapshots;
    private currentSnapshotId;
    private previousSnapshotId;
    private currentUrl;
    private maxSnapshots;
    private maxTextLength;
    private elementCache;
    private contentOptimizer;
    /**
     * Create optimized content for AI consumption
     */
    createOptimizedSnapshot(page: Page, context?: OptimizationContext, _id?: string): Promise<string>;
    /**
     * Create a new page snapshot
     */
    createSnapshot(page: Page, url?: string): Promise<string>;
    /**
     * Create a full page snapshot with all details
     */
    createFullSnapshot(page: Page, id?: string, options?: SnapshotCaptureOptions): Promise<PageSnapshot>;
    /**
     * Compare current page state with previous snapshot
     */
    compareWithPrevious(page: Page): Promise<PageDelta | null>;
    /**
     * Compare two snapshots and generate delta
     */
    compareSnapshots(previous: PageSnapshot, current: PageSnapshot): PageDelta;
    /**
     * Get current snapshot
     */
    getCurrentSnapshot(): PageSnapshot | null;
    /**
     * Get snapshot by ID
     */
    getSnapshot(id: string): PageSnapshot | null;
    /**
     * Get all snapshots
     */
    getAllSnapshots(): PageSnapshot[];
    /**
     * Clear all snapshots to free memory
     */
    clearAll(): void;
    /**
     * Get memory usage estimate
     */
    getMemoryUsage(): {
        snapshotCount: number;
        estimatedSizeMB: number;
        currentUrl: string | null;
    };
    /**
     * Check if page URL has changed and clear snapshots if needed
     */
    checkUrlChange(page: Page): Promise<boolean>;
    /**
     * Force garbage collection of snapshots (for testing/debugging)
     */
    forceCleanup(): void;
    private captureDOMSnapshot;
    private captureFormSnapshots;
    private captureInteractiveSnapshots;
    private captureMetadata;
    private getElementChanges;
    private countAffectedForms;
    private countAffectedInteractive;
    private calculateSignificance;
    private cleanupOldSnapshots;
}
//# sourceMappingURL=snapshot-manager.d.ts.map