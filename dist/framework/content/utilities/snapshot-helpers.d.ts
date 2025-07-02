/**
 * Snapshot Utility Functions
 * Helper functions for snapshot operations
 */
import type { ElementSnapshot, PageSnapshot, SnapshotComparisonOptions } from '../types/snapshot-types.js';
/**
 * Generate a stable selector for an element in browser context
 */
export declare function generateElementSelector(element: Element): string;
/**
 * Simple hash function for quick comparison
 */
export declare function createElementHash(str: string): string;
/**
 * Create element hash data for comparison
 */
export declare function createElementHashData(element: {
    tagName: string;
    textContent: string;
    attributes: Record<string, string>;
    isVisible: boolean;
}): string;
/**
 * Extract important attributes from an element
 */
export declare function extractImportantAttributes(element: Element, maxLength?: number): Record<string, string>;
/**
 * Check if element is visible
 */
export declare function isElementVisible(element: Element): boolean;
/**
 * Get element bounds
 */
export declare function getElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * Compare two snapshots with options
 */
export declare function compareSnapshotsWithOptions(previous: PageSnapshot, current: PageSnapshot, options?: SnapshotComparisonOptions): {
    addedElements: ElementSnapshot[];
    removedElements: ElementSnapshot[];
    modifiedElements: Array<{
        current: ElementSnapshot;
        previous: ElementSnapshot;
    }>;
};
/**
 * Check if an element has changed based on comparison options
 */
export declare function hasElementChanged(previous: ElementSnapshot, current: ElementSnapshot, options?: SnapshotComparisonOptions): boolean;
/**
 * Filter snapshot elements based on criteria
 */
export declare function filterSnapshotElements(snapshot: PageSnapshot, filter: {
    includeInvisible?: boolean;
    tagNames?: string[];
    hasText?: boolean;
    hasAttributes?: string[];
    maxTextLength?: number;
}): ElementSnapshot[];
/**
 * Get snapshot statistics
 */
export declare function getSnapshotStatistics(snapshot: PageSnapshot): {
    totalElements: number;
    visibleElements: number;
    interactiveElements: number;
    formElements: number;
    textElements: number;
    imageElements: number;
    linkElements: number;
};
/**
 * Create a summary of snapshot changes
 */
export declare function createChangeSummary(addedElements: ElementSnapshot[], removedElements: ElementSnapshot[], modifiedElements: Array<{
    current: ElementSnapshot;
    previous: ElementSnapshot;
}>): string;
/**
 * Sanitize text content for storage
 */
export declare function sanitizeTextContent(text: string, maxLength?: number): string;
/**
 * Create element fingerprint for deduplication
 */
export declare function createElementFingerprint(element: ElementSnapshot): string;
//# sourceMappingURL=snapshot-helpers.d.ts.map