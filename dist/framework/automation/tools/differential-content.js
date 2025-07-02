/**
 * Differential Content Tool
 * Uses page snapshots to provide AI with only the changes since last interaction
 */
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PageSnapshotManager } from '../../managers/content/snapshot-manager.js';
const DifferentialContentSchema = z.object({
    instruction: z.string().describe('The instruction or action being performed'),
    forceFullSnapshot: z
        .boolean()
        .optional()
        .describe('Force a full snapshot instead of differential'),
});
/**
 * Create differential page content tool that provides AI with only page changes
 */
export function createDifferentialContentTool(framework) {
    // Initialize snapshot manager
    const snapshotManager = new PageSnapshotManager();
    let initialized = false;
    return tool(async ({ instruction, forceFullSnapshot = false }) => {
        try {
            const page = framework.currentPage;
            if (!page) {
                return { error: 'No page available for content analysis' };
            }
            framework.logTestStep('differential-content-start', 'differential-content', { instruction, forceFullSnapshot }, 'Analyzing page changes for AI context', true);
            // If not initialized or force full snapshot, create initial snapshot
            if (!initialized || forceFullSnapshot) {
                const initialSnapshot = await snapshotManager.createSnapshot(page, 'initial');
                initialized = true;
                const fullContent = generateFullPageContent(page, initialSnapshot);
                framework.logTestStep('differential-content-initial', 'differential-content', {
                    elements: initialSnapshot.dom.totalElements,
                    forms: initialSnapshot.forms.length,
                    interactive: initialSnapshot.interactive.length,
                }, 'Created initial page snapshot', true);
                return {
                    type: 'full',
                    content: fullContent,
                    metadata: {
                        snapshotId: initialSnapshot.id,
                        totalElements: initialSnapshot.dom.totalElements,
                        interactiveElements: initialSnapshot.interactive.length,
                        forms: initialSnapshot.forms.length,
                        timestamp: initialSnapshot.timestamp,
                    },
                };
            }
            // Compare with previous state to get changes
            const delta = await snapshotManager.compareWithPrevious(page);
            if (!delta) {
                // Fallback to full snapshot if comparison fails
                const snapshot = await snapshotManager.createSnapshot(page);
                const fullContent = generateFullPageContent(page, snapshot);
                return {
                    type: 'full',
                    content: fullContent,
                    metadata: {
                        snapshotId: snapshot.id,
                        totalElements: snapshot.dom.totalElements,
                        interactiveElements: snapshot.interactive.length,
                        forms: snapshot.forms.length,
                        timestamp: snapshot.timestamp,
                        reason: 'Comparison failed, providing full content',
                    },
                };
            }
            // If no significant changes, provide minimal context
            if (delta.changes.length === 0) {
                const currentSnapshot = snapshotManager.getCurrentSnapshot();
                framework.logTestStep('differential-content-no-changes', 'differential-content', { deltaId: delta.snapshotId }, 'No page changes detected', true);
                return {
                    type: 'no-changes',
                    content: `No changes detected on the page since last interaction.\n\nCurrent page: ${currentSnapshot?.title || 'Unknown'}\nURL: ${currentSnapshot?.url || 'Unknown'}`,
                    metadata: {
                        snapshotId: delta.snapshotId,
                        previousSnapshotId: delta.previousSnapshotId,
                        changes: 0,
                        timestamp: delta.timestamp,
                    },
                };
            }
            // Generate differential content focusing on changes
            const differentialContent = generateDifferentialContent(page, delta, snapshotManager);
            const tokenSavings = await estimateTokenSavings(page, differentialContent);
            framework.logTestStep('differential-content-complete', 'differential-content', {
                changes: delta.changes.length,
                significance: delta.summary.significance,
                tokenSavings: tokenSavings.savings,
            }, `Provided differential content: ${delta.changes.length} changes (${delta.summary.significance} significance)`, true);
            return {
                type: 'differential',
                content: differentialContent,
                metadata: {
                    snapshotId: delta.snapshotId,
                    previousSnapshotId: delta.previousSnapshotId,
                    changes: delta.changes.length,
                    significance: delta.summary.significance,
                    affectedForms: delta.summary.affectedForms,
                    affectedInteractive: delta.summary.affectedInteractive,
                    timestamp: delta.timestamp,
                    tokenSavings,
                },
            };
        }
        catch (error) {
            framework.logTestStep('differential-content-error', 'differential-content', { error: error.message }, `Differential content analysis failed: ${error.message}`, false);
            return {
                error: `Failed to analyze page changes: ${error.message}`,
            };
        }
    }, {
        name: 'differential_page_content',
        description: 'Get page content with focus on changes since last interaction. Provides differential updates to minimize token usage while maintaining context.',
        schema: DifferentialContentSchema,
    });
}
/**
 * Generate full page content for initial snapshot
 */
function generateFullPageContent(page, snapshot) {
    const sections = [
        `Page: ${snapshot.title}`,
        `URL: ${snapshot.url}`,
        `Timestamp: ${new Date(snapshot.timestamp).toISOString()}`,
        '',
    ];
    // Add page structure overview
    sections.push('Page Structure:');
    sections.push(`- Total elements: ${snapshot.dom.totalElements}`);
    sections.push(`- Visible elements: ${snapshot.dom.visibleElements}`);
    sections.push(`- Interactive elements: ${snapshot.interactive.length}`);
    sections.push(`- Forms: ${snapshot.forms.length}`);
    sections.push('');
    // Add interactive elements
    if (snapshot.interactive.length > 0) {
        sections.push('Interactive Elements:');
        snapshot.interactive.forEach((element, index) => {
            if (element.isVisible && element.isEnabled) {
                const text = element.textContent ? ` "${element.textContent.slice(0, 50)}"` : '';
                sections.push(`${index + 1}. ${element.tagName}${text} (${element.selector})`);
            }
        });
        sections.push('');
    }
    // Add forms
    if (snapshot.forms.length > 0) {
        sections.push('Forms:');
        snapshot.forms.forEach((form, formIndex) => {
            sections.push(`Form ${formIndex + 1}: ${form.selector}`);
            form.fields.forEach((field, fieldIndex) => {
                const value = field.value ? ` [value: "${field.value}"]` : '';
                const required = field.isRequired ? ' [required]' : '';
                const disabled = field.isDisabled ? ' [disabled]' : '';
                sections.push(`  ${fieldIndex + 1}. ${field.type}: ${field.selector}${value}${required}${disabled}`);
            });
            sections.push('');
        });
    }
    // Add key visible content
    const visibleElements = snapshot.dom.elements
        .filter((el) => el.isVisible && el.textContent.length > 10)
        .slice(0, 20); // Limit to avoid token bloat
    if (visibleElements.length > 0) {
        sections.push('Key Visible Content:');
        visibleElements.forEach((element, index) => {
            sections.push(`${index + 1}. ${element.tagName}: ${element.textContent.slice(0, 100)}`);
        });
    }
    return sections.join('\n');
}
/**
 * Generate content focused on page changes
 */
function generateDifferentialContent(page, delta, snapshotManager) {
    const sections = ['Page Changes Detected:', ''];
    // Add change summary
    sections.push(`Changes Summary:`);
    sections.push(`- Total changes: ${delta.changes.length}`);
    sections.push(`- Added elements: ${delta.summary.addedElements}`);
    sections.push(`- Removed elements: ${delta.summary.removedElements}`);
    sections.push(`- Modified elements: ${delta.summary.modifiedElements}`);
    sections.push(`- Significance: ${delta.summary.significance}`);
    sections.push('');
    // Group and describe changes
    const addedChanges = delta.changes.filter((c) => c.type === 'added');
    const removedChanges = delta.changes.filter((c) => c.type === 'removed');
    const modifiedChanges = delta.changes.filter((c) => c.type === 'modified');
    if (addedChanges.length > 0) {
        sections.push('🆕 New Elements:');
        addedChanges.forEach((change, index) => {
            sections.push(`${index + 1}. ${change.description}`);
            if (change.element.textContent) {
                sections.push(`   Text: "${change.element.textContent.slice(0, 100)}"`);
            }
            sections.push(`   Selector: ${change.element.selector}`);
        });
        sections.push('');
    }
    if (removedChanges.length > 0) {
        sections.push('🗑️ Removed Elements:');
        removedChanges.forEach((change, index) => {
            sections.push(`${index + 1}. ${change.description}`);
        });
        sections.push('');
    }
    if (modifiedChanges.length > 0) {
        sections.push('✏️ Modified Elements:');
        modifiedChanges.forEach((change, index) => {
            sections.push(`${index + 1}. ${change.description}`);
            if (change.previousState && change.element.textContent !== change.previousState.textContent) {
                sections.push(`   Previous: "${change.previousState.textContent.slice(0, 50)}"`);
                sections.push(`   Current: "${change.element.textContent.slice(0, 50)}"`);
            }
            sections.push(`   Selector: ${change.element.selector}`);
        });
        sections.push('');
    }
    // Add context from current state if needed
    const currentSnapshot = snapshotManager.getCurrentSnapshot();
    if (currentSnapshot &&
        (delta.summary.affectedForms > 0 || delta.summary.affectedInteractive > 0)) {
        sections.push('Current State Context:');
        if (delta.summary.affectedForms > 0) {
            sections.push('Forms affected by changes:');
            currentSnapshot.forms.forEach((form, index) => {
                const affectedFields = form.fields.filter((field) => delta.changes.some((change) => change.element.selector === field.selector));
                if (affectedFields.length > 0) {
                    sections.push(`  Form ${index + 1}: ${form.selector}`);
                    affectedFields.forEach((field) => {
                        sections.push(`    - ${field.type}: ${field.selector} = "${field.value}"`);
                    });
                }
            });
        }
        if (delta.summary.affectedInteractive > 0) {
            sections.push('Interactive elements affected:');
            currentSnapshot.interactive.forEach((element, index) => {
                if (delta.changes.some((change) => change.element.selector === element.selector)) {
                    sections.push(`  ${index + 1}. ${element.tagName}: ${element.textContent} (${element.isEnabled ? 'enabled' : 'disabled'})`);
                }
            });
        }
    }
    return sections.join('\n');
}
/**
 * Estimate token savings from differential approach
 */
async function estimateTokenSavings(page, differentialContent) {
    // Rough token estimation (1 token ≈ 3.5 characters)
    const differentialTokens = Math.ceil(differentialContent.length / 3.5);
    // Estimate full page tokens
    const fullPageContent = await page.content();
    const estimatedFullPageTokens = Math.ceil(fullPageContent.length / 3.5);
    const savings = estimatedFullPageTokens - differentialTokens;
    const savingsPercentage = (savings / estimatedFullPageTokens) * 100;
    return {
        differentialTokens,
        estimatedFullPageTokens,
        savings,
        savingsPercentage,
    };
}
//# sourceMappingURL=differential-content.js.map