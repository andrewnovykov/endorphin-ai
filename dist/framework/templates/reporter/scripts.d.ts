/**
 * Endorphin AI Test Report JavaScript
 * Handles interactive functionality for the HTML report
 */
export class TestReportViewer {
    testData: any[];
    currentTestIndex: any;
    /**
     * Initialize the report viewer
     */
    init(): void;
    /**
     * Load test data from the embedded JSON
     */
    loadTestData(): void;
    /**
     * Attach event listeners to interactive elements
     */
    attachEventListeners(): void;
    currentFilter: string | null | undefined;
    /**
     * Show detailed test information in modal
     */
    showTestDetails(resultIndex: any): void;
    /**
     * Update a modal field with content
     */
    updateModalField(fieldId: any, value: any, isHtml?: boolean): void;
    /**
     * Populate setup and data generation results
     */
    populateSetupAndDataResults(session: any): void;
    /**
     * Populate the steps timeline
     */
    populateStepsTimeline(steps: any): void;
    /**
     * Create a step element for the timeline
     */
    createStepElement(step: any, index: any): HTMLDivElement;
    /**
     * Populate the screenshots gallery
     */
    populateScreenshotsGallery(result: any): void;
    /**
     * Create a screenshot element for the gallery
     */
    createScreenshotElement(screenshot: any, resultDir: any, index: any): HTMLDivElement;
    /**
     * Show a screenshot in the screenshot modal
     */
    showScreenshot(screenshotPath: any, screenshotName: any): void;
    /**
     * Format status with appropriate styling
     */
    formatStatus(status: any): string;
    /**
     * Format datetime for display
     */
    formatDateTime(dateTimeString: any): any;
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text: any): string;
    /**
     * Animate cards on page load
     */
    animateCards(): void;
    /**
     * Animate timeline items when modal is shown
     */
    animateTimeline(): void;
    /**
     * Filter table rows based on search input and status filter
     */
    filterResults(searchTerm?: string, statusFilter?: string): void;
    /**
     * Update the search results information display
     */
    updateSearchResultsInfo(visibleCount: any, totalCount: any, searchTerm: any, statusFilter: any): void;
    /**
     * Export report data to JSON
     */
    exportToJson(): void;
    /**
     * Print the report
     */
    printReport(): void;
}
export class ReportUtils {
    /**
     * Copy text to clipboard
     */
    static copyToClipboard(text: any): void;
    /**
     * Show a toast notification
     */
    static showToast(message: any, type?: string): void;
    /**
     * Format file size for display
     */
    static formatFileSize(bytes: any): string;
    /**
     * Generate a random color for charts/visualizations
     */
    static generateColor(index: any): string;
}
/**
 * Global function to show test details by sessionId
 * Called by View Details buttons in the report
 */
export function showTestDetails(sessionId: any): void;
//# sourceMappingURL=scripts.d.ts.map