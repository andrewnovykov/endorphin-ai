/**
 * Page Snapshot System
 * Captures and manages page state snapshots for differential analysis
 */

import { Page } from 'playwright';

export interface PageSnapshot {
  id: string;
  timestamp: number;
  url: string;
  title: string;
  dom: DOMSnapshot;
  forms: FormSnapshot[];
  interactive: InteractiveSnapshot[];
  metadata: SnapshotMetadata;
}

export interface DOMSnapshot {
  elements: ElementSnapshot[];
  totalElements: number;
  visibleElements: number;
}

export interface ElementSnapshot {
  id: string;
  tagName: string;
  selector: string;
  textContent: string;
  attributes: Record<string, string>;
  isVisible: boolean;
  bounds: { x: number; y: number; width: number; height: number };
  hash: string; // For quick comparison
}

export interface FormSnapshot {
  selector: string;
  fields: FormFieldSnapshot[];
  isValid: boolean;
  submitButton?: string | undefined;
}

export interface FormFieldSnapshot {
  selector: string;
  type: string;
  value: string;
  placeholder: string;
  isRequired: boolean;
  isDisabled: boolean;
  validationMessage?: string | undefined;
}

export interface InteractiveSnapshot {
  selector: string;
  tagName: string;
  type: string;
  textContent: string;
  isEnabled: boolean;
  isVisible: boolean;
  href?: string | undefined;
}

export interface SnapshotMetadata {
  pageLoadState: string;
  networkIdle: boolean;
  scrollPosition: { x: number; y: number };
  viewportSize: { width: number; height: number };
  elementCounts: {
    total: number;
    interactive: number;
    forms: number;
    links: number;
    buttons: number;
    inputs: number;
  };
}

export interface PageDelta {
  snapshotId: string;
  previousSnapshotId: string;
  timestamp: number;
  changes: ChangeRecord[];
  summary: DeltaSummary;
}

export interface ChangeRecord {
  type: 'added' | 'removed' | 'modified' | 'moved';
  element: ElementSnapshot;
  previousState?: ElementSnapshot;
  description: string;
}

export interface DeltaSummary {
  totalChanges: number;
  addedElements: number;
  removedElements: number;
  modifiedElements: number;
  movedElements: number;
  affectedForms: number;
  affectedInteractive: number;
  significance: 'minor' | 'moderate' | 'major';
}

/**
 * Page Snapshot Manager
 * Handles creation, storage, and comparison of page snapshots
 */
export class PageSnapshotManager {
  private snapshots: Map<string, PageSnapshot> = new Map();
  private currentSnapshotId: string | null = null;
  private maxSnapshots: number = 10; // Keep last 10 snapshots

  /**
   * Create a new page snapshot
   */
  async createSnapshot(page: Page, id?: string): Promise<PageSnapshot> {
    const snapshotId = id || `snapshot_${Date.now()}`;
    
    try {
      const [title, url, viewport] = await Promise.all([
        page.title(),
        page.url(),
        page.viewportSize()
      ]);

      // Capture DOM elements with their states
      const domSnapshot = await this.captureDOMSnapshot(page);
      
      // Capture form states
      const forms = await this.captureFormSnapshots(page);
      
      // Capture interactive elements
      const interactive = await this.captureInteractiveSnapshots(page);
      
      // Capture metadata
      const metadata = await this.captureMetadata(page, viewport);

      const snapshot: PageSnapshot = {
        id: snapshotId,
        timestamp: Date.now(),
        url,
        title,
        dom: domSnapshot,
        forms,
        interactive,
        metadata
      };

      // Store snapshot
      this.snapshots.set(snapshotId, snapshot);
      this.currentSnapshotId = snapshotId;

      // Cleanup old snapshots
      this.cleanupOldSnapshots();

      return snapshot;
    } catch (error) {
      throw new Error(`Failed to create page snapshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Compare current page state with previous snapshot
   */
  async compareWithPrevious(page: Page): Promise<PageDelta | null> {
    if (!this.currentSnapshotId) {
      return null;
    }

    const previousSnapshot = this.snapshots.get(this.currentSnapshotId);
    if (!previousSnapshot) {
      return null;
    }

    // Create new snapshot for comparison
    const currentSnapshot = await this.createSnapshot(page);
    
    return this.compareSnapshots(previousSnapshot, currentSnapshot);
  }

  /**
   * Compare two snapshots and generate delta
   */
  compareSnapshots(previous: PageSnapshot, current: PageSnapshot): PageDelta {
    const changes: ChangeRecord[] = [];
    
    // Create lookup maps for efficient comparison
    const previousElements = new Map(previous.dom.elements.map(el => [el.selector, el]));
    const currentElements = new Map(current.dom.elements.map(el => [el.selector, el]));

    // Find added elements
    for (const [selector, element] of currentElements) {
      if (!previousElements.has(selector)) {
        changes.push({
          type: 'added',
          element,
          description: `Element added: ${element.tagName}${element.textContent ? ` with text "${element.textContent.slice(0, 50)}"` : ''}`
        });
      }
    }

    // Find removed elements
    for (const [selector, element] of previousElements) {
      if (!currentElements.has(selector)) {
        changes.push({
          type: 'removed',
          element,
          description: `Element removed: ${element.tagName}${element.textContent ? ` with text "${element.textContent.slice(0, 50)}"` : ''}`
        });
      }
    }

    // Find modified elements
    for (const [selector, currentElement] of currentElements) {
      const previousElement = previousElements.get(selector);
      if (previousElement && previousElement.hash !== currentElement.hash) {
        const changes_detail = this.getElementChanges(previousElement, currentElement);
        changes.push({
          type: 'modified',
          element: currentElement,
          previousState: previousElement,
          description: `Element modified: ${currentElement.tagName} - ${changes_detail}`
        });
      }
    }

    // Generate summary
    const summary: DeltaSummary = {
      totalChanges: changes.length,
      addedElements: changes.filter(c => c.type === 'added').length,
      removedElements: changes.filter(c => c.type === 'removed').length,
      modifiedElements: changes.filter(c => c.type === 'modified').length,
      movedElements: 0, // TODO: Implement move detection
      affectedForms: this.countAffectedForms(changes, previous.forms),
      affectedInteractive: this.countAffectedInteractive(changes, previous.interactive),
      significance: this.calculateSignificance(changes)
    };

    return {
      snapshotId: current.id,
      previousSnapshotId: previous.id,
      timestamp: current.timestamp,
      changes,
      summary
    };
  }

  /**
   * Get the current snapshot
   */
  getCurrentSnapshot(): PageSnapshot | null {
    if (!this.currentSnapshotId) {
      return null;
    }
    return this.snapshots.get(this.currentSnapshotId) || null;
  }

  /**
   * Get snapshot by ID
   */
  getSnapshot(id: string): PageSnapshot | null {
    return this.snapshots.get(id) || null;
  }

  /**
   * Format delta as human-readable text for AI consumption
   */
  formatDeltaForAI(delta: PageDelta): string {
    if (delta.changes.length === 0) {
      return 'No changes detected on the page.';
    }

    const lines: string[] = [
      `Page Changes Summary (${delta.changes.length} changes):`,
      ''
    ];

    // Group changes by type
    const grouped = {
      added: delta.changes.filter(c => c.type === 'added'),
      removed: delta.changes.filter(c => c.type === 'removed'),
      modified: delta.changes.filter(c => c.type === 'modified')
    };

    if (grouped.added.length > 0) {
      lines.push('New Elements:');
      grouped.added.forEach(change => {
        lines.push(`  + ${change.description}`);
      });
      lines.push('');
    }

    if (grouped.removed.length > 0) {
      lines.push('Removed Elements:');
      grouped.removed.forEach(change => {
        lines.push(`  - ${change.description}`);
      });
      lines.push('');
    }

    if (grouped.modified.length > 0) {
      lines.push('Modified Elements:');
      grouped.modified.forEach(change => {
        lines.push(`  ~ ${change.description}`);
      });
      lines.push('');
    }

    // Add significance assessment
    lines.push(`Change Significance: ${delta.summary.significance}`);
    if (delta.summary.affectedForms > 0) {
      lines.push(`Forms affected: ${delta.summary.affectedForms}`);
    }
    if (delta.summary.affectedInteractive > 0) {
      lines.push(`Interactive elements affected: ${delta.summary.affectedInteractive}`);
    }

    return lines.join('\n');
  }

  /**
   * Capture DOM snapshot with element details
   */
  private async captureDOMSnapshot(page: Page): Promise<DOMSnapshot> {
    const elements = await page.evaluate(() => {
      // Define selector generation function in browser context
      function generateSelector(element: Element): string {
        // Try ID first
        if (element.id) {
          return `#${element.id}`;
        }

        // Try data-testid
        const testId = element.getAttribute('data-testid');
        if (testId) {
          return `[data-testid="${testId}"]`;
        }

        // Try unique class combination
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            const classSelector = `.${classes.join('.')}`;
            const doc = element.ownerDocument || document;
            if (doc.querySelectorAll(classSelector).length === 1) {
              return classSelector;
            }
          }
        }

        // Fall back to tag + nth-child
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
          const index = siblings.indexOf(element);
          return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
        }

        return element.tagName.toLowerCase();
      }

      // Simple hash function in browser context
      function simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
      }

      return Array.from(document.querySelectorAll('*')).map((el, index) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && 
                          window.getComputedStyle(el).visibility !== 'hidden' &&
                          window.getComputedStyle(el).display !== 'none';

        const attributes: Record<string, string> = {};
        Array.from(el.attributes).forEach(attr => {
          attributes[attr.name] = attr.value;
        });

        const textContent = el.textContent?.trim() || '';
        const selector = generateSelector(el);
        
        // Create hash for quick comparison
        const hashData = `${el.tagName}|${textContent}|${JSON.stringify(attributes)}|${isVisible}`;
        const hash = simpleHash(hashData);

        return {
          id: `element_${index}`,
          tagName: el.tagName,
          selector,
          textContent: textContent.slice(0, 200), // Limit text length
          attributes,
          isVisible,
          bounds: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          hash
        };
      });
    });

    const visibleElements = elements.filter(el => el.isVisible).length;

    return {
      elements,
      totalElements: elements.length,
      visibleElements
    };
  }

  /**
   * Capture form snapshots
   */
  private async captureFormSnapshots(page: Page): Promise<FormSnapshot[]> {
    return await page.evaluate(() => {
      function generateSelector(element: Element): string {
        if (element.id) return `#${element.id}`;
        const testId = element.getAttribute('data-testid');
        if (testId) return `[data-testid="${testId}"]`;
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            const classSelector = `.${classes.join('.')}`;
            if (document.querySelectorAll(classSelector).length === 1) {
              return classSelector;
            }
          }
        }
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
          const index = siblings.indexOf(element);
          return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
        }
        return element.tagName.toLowerCase();
      }

      return Array.from(document.querySelectorAll('form')).map(form => {
        const fields = Array.from(form.querySelectorAll('input, select, textarea')).map(field => {
          const input = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          return {
            selector: generateSelector(input),
            type: input.type || input.tagName.toLowerCase(),
            value: input.value || '',
            placeholder: (input as HTMLInputElement).placeholder || '',
            isRequired: input.required,
            isDisabled: input.disabled,
            validationMessage: (input as HTMLInputElement).validationMessage || undefined as string | undefined
          };
        });

        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

        return {
          selector: generateSelector(form),
          fields,
          isValid: form.checkValidity(),
          submitButton: submitButton ? generateSelector(submitButton) : undefined as string | undefined
        };
      });
    });
  }

  /**
   * Capture interactive element snapshots
   */
  private async captureInteractiveSnapshots(page: Page): Promise<InteractiveSnapshot[]> {
    return await page.evaluate(() => {
      function generateSelector(element: Element): string {
        if (element.id) return `#${element.id}`;
        const testId = element.getAttribute('data-testid');
        if (testId) return `[data-testid="${testId}"]`;
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            const classSelector = `.${classes.join('.')}`;
            if (document.querySelectorAll(classSelector).length === 1) {
              return classSelector;
            }
          }
        }
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
          const index = siblings.indexOf(element);
          return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
        }
        return element.tagName.toLowerCase();
      }

      return Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick], [role="button"]')).map(el => {
        const isVisible = el.getBoundingClientRect().width > 0 && 
                         el.getBoundingClientRect().height > 0 &&
                         window.getComputedStyle(el).visibility !== 'hidden';

        return {
          selector: generateSelector(el),
          tagName: el.tagName,
          type: (el as HTMLInputElement).type || 'element',
          textContent: el.textContent?.trim() || '',
          isEnabled: !(el as HTMLButtonElement | HTMLInputElement).disabled,
          isVisible,
          href: (el as HTMLAnchorElement).href || undefined as string | undefined
        };
      });
    });
  }

  /**
   * Capture page metadata
   */
  private async captureMetadata(page: Page, viewport: any): Promise<SnapshotMetadata> {
    const [scrollPosition, elementCounts] = await Promise.all([
      page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })),
      page.evaluate(() => ({
        total: document.querySelectorAll('*').length,
        interactive: document.querySelectorAll('button, a, input, select, textarea').length,
        forms: document.querySelectorAll('form').length,
        links: document.querySelectorAll('a').length,
        buttons: document.querySelectorAll('button, input[type="button"], input[type="submit"]').length,
        inputs: document.querySelectorAll('input, select, textarea').length
      }))
    ]);

    return {
      pageLoadState: await page.evaluate(() => document.readyState),
      networkIdle: true, // Simplified for now
      scrollPosition,
      viewportSize: viewport,
      elementCounts
    };
  }

  /**
   * Generate a stable selector for an element
   */
  private generateSelector(element: Element): string {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try data-testid
    const testId = element.getAttribute('data-testid');
    if (testId) {
      return `[data-testid="${testId}"]`;
    }

    // Try unique class combination
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        const classSelector = `.${classes.join('.')}`;
        const doc = element.ownerDocument || document;
        if (doc.querySelectorAll(classSelector).length === 1) {
          return classSelector;
        }
      }
    }

    // Fall back to tag + nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
      const index = siblings.indexOf(element);
      return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Simple hash function for quick comparison
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Analyze element changes between states
   */
  private getElementChanges(previous: ElementSnapshot, current: ElementSnapshot): string {
    const changes: string[] = [];

    if (previous.textContent !== current.textContent) {
      changes.push(`text changed from "${previous.textContent.slice(0, 30)}" to "${current.textContent.slice(0, 30)}"`);
    }

    if (previous.isVisible !== current.isVisible) {
      changes.push(`visibility changed to ${current.isVisible ? 'visible' : 'hidden'}`);
    }

    // Check attribute changes
    const prevAttrs = Object.keys(previous.attributes);
    const currAttrs = Object.keys(current.attributes);
    
    for (const attr of currAttrs) {
      if (previous.attributes[attr] !== current.attributes[attr]) {
        changes.push(`${attr} attribute changed`);
      }
    }

    return changes.length > 0 ? changes.join(', ') : 'unknown changes';
  }

  /**
   * Count affected forms in changes
   */
  private countAffectedForms(changes: ChangeRecord[], forms: FormSnapshot[]): number {
    const affectedSelectors = new Set(changes.map(c => c.element.selector));
    return forms.filter(form => 
      affectedSelectors.has(form.selector) || 
      form.fields.some(field => affectedSelectors.has(field.selector))
    ).length;
  }

  /**
   * Count affected interactive elements in changes
   */
  private countAffectedInteractive(changes: ChangeRecord[], interactive: InteractiveSnapshot[]): number {
    const affectedSelectors = new Set(changes.map(c => c.element.selector));
    return interactive.filter(el => affectedSelectors.has(el.selector)).length;
  }

  /**
   * Calculate change significance
   */
  private calculateSignificance(changes: ChangeRecord[]): 'minor' | 'moderate' | 'major' {
    if (changes.length === 0) return 'minor';
    if (changes.length < 5) return 'minor';
    if (changes.length < 15) return 'moderate';
    return 'major';
  }

  /**
   * Cleanup old snapshots to manage memory
   */
  private cleanupOldSnapshots(): void {
    if (this.snapshots.size > this.maxSnapshots) {
      const sortedIds = Array.from(this.snapshots.keys())
        .sort((a, b) => {
          const snapshotA = this.snapshots.get(a)!;
          const snapshotB = this.snapshots.get(b)!;
          return snapshotB.timestamp - snapshotA.timestamp;
        });

      // Keep only the most recent maxSnapshots
      const toDelete = sortedIds.slice(this.maxSnapshots);
      toDelete.forEach(id => this.snapshots.delete(id));
    }
  }
}