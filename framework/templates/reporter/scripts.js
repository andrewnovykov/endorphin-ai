/**
 * Endorphin AI Test Report JavaScript
 * Handles interactive functionality for the HTML report
 */

class TestReportViewer {
  constructor() {
    this.testData = [];
    this.currentTestIndex = null;
    this.init();
  }

  /**
   * Initialize the report viewer
   */
  init() {
    this.loadTestData();
    this.attachEventListeners();
    this.animateCards();
  }

  /**
   * Load test data from the embedded JSON
   */
  loadTestData() {
    try {
      const testDataElement = document.getElementById('test-data');
      if (testDataElement && testDataElement.textContent) {
        this.testData = JSON.parse(testDataElement.textContent);
        console.log('Loaded test data:', this.testData.length, 'results');
      }
    } catch (error) {
      console.error('Failed to load test data:', error);
      this.testData = [];
    }
  }

  /**
   * Attach event listeners to interactive elements
   */
  attachEventListeners() {
    // View details buttons
    document.querySelectorAll('.view-details-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const resultIndex = parseInt(btn.getAttribute('data-result-index'));
        this.showTestDetails(resultIndex);
      });
    });

    // Test result rows (clickable)
    document.querySelectorAll('.test-result-row').forEach((row) => {
      row.addEventListener('click', () => {
        const resultIndex = parseInt(row.getAttribute('data-result-index'));
        this.showTestDetails(resultIndex);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('test-search');
    const clearSearchBtn = document.getElementById('clear-search');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterResults(e.target.value, this.currentFilter);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.filterResults('', this.currentFilter);
        searchInput.focus();
      });
    }

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Remove active class from all filter buttons
        document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        this.currentFilter = filter;
        const searchTerm = searchInput ? searchInput.value : '';
        this.filterResults(searchTerm, filter);
      });
    });

    // Export and print buttons
    const exportBtn = document.getElementById('export-json');
    const printBtn = document.getElementById('print-report');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToJson();
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printReport();
      });
    }

    // Modal events
    const testDetailsModal = document.getElementById('testDetailsModal');
    if (testDetailsModal) {
      testDetailsModal.addEventListener('shown.bs.modal', () => {
        this.animateTimeline();
      });
      
      // Ensure backdrop is properly cleaned up when modal is hidden
      testDetailsModal.addEventListener('hidden.bs.modal', () => {
        // Remove any lingering modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
          backdrop.remove();
        });
        // Ensure body scroll is restored
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
      });
    }
    
    // Handle screenshot modal backdrop cleanup
    const screenshotModal = document.getElementById('screenshotModal');
    if (screenshotModal) {
      screenshotModal.addEventListener('hidden.bs.modal', () => {
        // Remove any lingering modal backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
          backdrop.remove();
        });
        // Ensure body scroll is restored
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
      });
    }

    // Screenshot click events will be attached dynamically

    // Initialize filter state
    this.currentFilter = 'all';
  }

  /**
   * Show detailed test information in modal
   */
  showTestDetails(resultIndex) {
    if (!this.testData[resultIndex]) {
      console.error('Test result not found:', resultIndex);
      return;
    }

    this.currentTestIndex = resultIndex;
    const result = this.testData[resultIndex];
    const session = result.session;
    const summary = result.summary;

    // Populate modal fields
    this.updateModalField('modal-test-id', session.testId);
    this.updateModalField('modal-test-name', session.testName);
    this.updateModalField('modal-status', this.formatStatus(session.status), true); // true for HTML
    this.updateModalField('modal-duration', `${session.duration || 0}ms`);
    this.updateModalField('modal-start-time', this.formatDateTime(session.startTime));
    this.updateModalField('modal-end-time', this.formatDateTime(session.endTime));
    this.updateModalField('modal-total-steps', session.steps ? session.steps.length : 0);
    this.updateModalField('modal-screenshots', result.screenshots ? result.screenshots.length : 0);
    
    // Populate token usage fields
    const tokenSummary = session.tokenSummary || summary.tokenSummary || {};
    this.updateModalField('modal-total-tokens', (tokenSummary.totalTokens || 0).toLocaleString());
    this.updateModalField('modal-total-cost', `$${(tokenSummary.totalCost || 0).toFixed(4)}`);
    this.updateModalField('modal-ai-calls', tokenSummary.aiCalls || 0);
    this.updateModalField('modal-model', tokenSummary.model || 'N/A');

    // Populate test conclusion
    const conclusion = session.conclusion || session.finalResult || 'No conclusion available';
    this.updateModalField('modal-conclusion', conclusion);

    // Populate setup and data generation results
    this.populateSetupAndDataResults(session);

    // Populate steps timeline
    this.populateStepsTimeline(session.steps || []);

    // Populate screenshots gallery
    this.populateScreenshotsGallery(result);

    // Show modal
    const modalElement = document.getElementById('testDetailsModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }

  /**
   * Update a modal field with content
   */
  updateModalField(fieldId, value, isHtml = false) {
    const element = document.getElementById(fieldId);
    if (element) {
      if (isHtml) {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    }
  }

  /**
   * Populate setup and data generation results
   */
  populateSetupAndDataResults(session) {
    const setupDataSection = document.getElementById('setup-data-section');
    const hasSetup = session.setupResult;
    const hasDataGeneration = session.dataGenerationResult;
    
    // Show or hide the entire section
    if (hasSetup || hasDataGeneration) {
      setupDataSection.style.display = 'block';
    } else {
      setupDataSection.style.display = 'none';
      return;
    }

    // Populate setup results
    if (hasSetup) {
      const setup = session.setupResult;
      this.updateModalField('modal-setup-status', this.formatStatus(setup.success ? 'SUCCESS' : 'FAILED'), true);
      this.updateModalField('modal-setup-time', `${setup.executionTime || 0}ms`);
      this.updateModalField('modal-setup-has-data', setup.data ? 'Yes' : 'No');
      
      // Show/hide error row
      const errorRow = document.getElementById('modal-setup-error-row');
      if (!setup.success && setup.error) {
        errorRow.style.display = 'table-row';
        this.updateModalField('modal-setup-error', setup.error.message || setup.error);
      } else {
        errorRow.style.display = 'none';
      }

      // Show/hide setup data viewer
      const dataViewer = document.getElementById('setup-data-viewer');
      const dataContent = document.getElementById('setup-data-content');
      if (setup.data) {
        dataViewer.style.display = 'block';
        dataContent.textContent = JSON.stringify(setup.data, null, 2);
      } else {
        dataViewer.style.display = 'none';
      }
    }

    // Populate data generation results
    if (hasDataGeneration) {
      const dataGen = session.dataGenerationResult;
      this.updateModalField('modal-data-status', this.formatStatus(dataGen.success ? 'SUCCESS' : 'FAILED'), true);
      this.updateModalField('modal-data-time', `${dataGen.executionTime || 0}ms`);
      this.updateModalField('modal-data-tokens', dataGen.tokenUsage ? dataGen.tokenUsage.totalTokens.toLocaleString() : 'N/A');
      this.updateModalField('modal-data-cost', dataGen.tokenUsage ? `$${dataGen.tokenUsage.cost.toFixed(4)}` : 'N/A');
      
      // Show/hide error row
      const errorRow = document.getElementById('modal-data-error-row');
      if (!dataGen.success && dataGen.error) {
        errorRow.style.display = 'table-row';
        this.updateModalField('modal-data-error', dataGen.error.message || dataGen.error);
      } else {
        errorRow.style.display = 'none';
      }

      // Show/hide generated data viewer
      const dataViewer = document.getElementById('generated-data-viewer');
      const dataContent = document.getElementById('generated-data-content');
      if (dataGen.data) {
        dataViewer.style.display = 'block';
        dataContent.textContent = JSON.stringify(dataGen.data, null, 2);
      } else {
        dataViewer.style.display = 'none';
      }
    }
  }

  /**
   * Populate the steps timeline
   */
  populateStepsTimeline(steps) {
    const timeline = document.getElementById('steps-timeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    if (!steps || steps.length === 0) {
      timeline.innerHTML = '<div class="text-muted text-center">No steps recorded</div>';
      return;
    }

    steps.forEach((step, index) => {
      const stepElement = this.createStepElement(step, index);
      timeline.appendChild(stepElement);
    });
  }

  /**
   * Create a step element for the timeline
   */
  createStepElement(step, index) {
    const stepDiv = document.createElement('div');
    stepDiv.className = `timeline-item ${step.status.toLowerCase()}`;

    const statusClass = step.status === 'SUCCESS' ? 'status-success' : 'status-failure';

    stepDiv.innerHTML = `
      <div class="timeline-content">
        <div class="timeline-header">
          <span class="timeline-step-number">Step ${step.stepNumber}</span>
          <span class="timeline-timestamp">${this.formatDateTime(step.timestamp)}</span>
        </div>
        <div class="timeline-description">
          ${this.escapeHtml(step.description)}
        </div>
        ${
          step.result
            ? `
          <div class="timeline-result">
            <strong>Result:</strong> ${this.escapeHtml(step.result)}
          </div>
        `
            : ''
        }
        ${
          step.toolName
            ? `
          <div class="timeline-tool-call">
            <strong>Tool:</strong> ${this.escapeHtml(step.toolName)}
            ${step.toolArgs ? `<br><strong>Args:</strong> ${this.escapeHtml(JSON.stringify(step.toolArgs, null, 2))}` : ''}
          </div>
        `
            : ''
        }
        ${
          step.screenshots && step.screenshots.length > 0
            ? `
          <div class="mt-2">
            <small class="text-muted">Screenshots (${step.screenshots.length}):</small>
            <div class="step-screenshots mt-1" data-step-number="${step.stepNumber}">
              <!-- Screenshots will be added dynamically -->
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;

    // Add step screenshots after creating the element
    if (step.screenshots && step.screenshots.length > 0) {
      const screenshotsContainer = stepDiv.querySelector('.step-screenshots');
      if (screenshotsContainer) {
        step.screenshots.forEach((screenshot, idx) => {
          const imgPath =
            typeof screenshot === 'object' && screenshot.filepath
              ? screenshot.filepath
              : `screenshots/${screenshot}`;
          const imgName =
            typeof screenshot === 'object' && screenshot.filename
              ? screenshot.filename
              : screenshot;
          const imgDesc =
            typeof screenshot === 'object' && screenshot.description
              ? screenshot.description
              : `Screenshot ${idx + 1}`;

          const img = document.createElement('img');
          img.src = imgPath;
          img.alt = imgDesc;
          img.title = imgDesc;
          img.className = 'step-screenshot-thumb me-2 mb-1';
          img.style.cssText =
            'max-width: 100px; max-height: 60px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;';

          img.addEventListener('click', () => {
            this.showScreenshot(imgPath, imgName);
          });

          screenshotsContainer.appendChild(img);
        });
      }
    }

    return stepDiv;
  }

  /**
   * Populate the screenshots gallery
   */
  populateScreenshotsGallery(result) {
    const gallery = document.getElementById('screenshots-gallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    if (!result.screenshots || result.screenshots.length === 0) {
      gallery.innerHTML =
        '<div class="col-12 text-muted text-center">No screenshots available</div>';
      return;
    }

    result.screenshots.forEach((screenshot, index) => {
      const screenshotElement = this.createScreenshotElement(screenshot, result.resultDir, index);
      gallery.appendChild(screenshotElement);
    });
  }

  /**
   * Create a screenshot element for the gallery
   */
  createScreenshotElement(screenshot, resultDir, index) {
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-4 col-6 mb-3';

    const screenshotPath = `screenshots/${screenshot}`;

    col.innerHTML = `
      <div class="card">
        <img src="${screenshotPath}" 
             class="card-img-top screenshot-thumbnail" 
             alt="Screenshot ${index + 1}"
             data-screenshot="${screenshotPath}"
             data-screenshot-name="${this.escapeHtml(screenshot)}">
        <div class="card-body p-2">
          <small class="text-muted">${this.escapeHtml(screenshot)}</small>
        </div>
      </div>
    `;

    // Add click event to thumbnail
    const thumbnail = col.querySelector('.screenshot-thumbnail');
    thumbnail.addEventListener('click', () => {
      this.showScreenshot(screenshotPath, screenshot);
    });

    return col;
  }

  /**
   * Show a screenshot in the screenshot modal
   */
  showScreenshot(screenshotPath, screenshotName) {
    const viewer = document.getElementById('screenshot-viewer');
    const info = document.getElementById('screenshot-info');

    if (viewer) {
      viewer.src = screenshotPath;
      viewer.alt = screenshotName;
    }

    if (info) {
      info.textContent = screenshotName;
    }

    const modalElement = document.getElementById('screenshotModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }

  /**
   * Format status with appropriate styling
   */
  formatStatus(status) {
    const statusClass = status === 'SUCCESS' ? 'badge bg-success' : 'badge bg-danger';
    const statusIcon = status === 'SUCCESS' ? '✓' : '✗';
    return `<span class="${statusClass}">${statusIcon} ${status}</span>`;
  }

  /**
   * Format datetime for display
   */
  formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';

    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch (error) {
      return dateTimeString;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Animate cards on page load
   */
  animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }

  /**
   * Animate timeline items when modal is shown
   */
  animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('slide-in');
      }, index * 150);
    });
  }

  /**
   * Filter table rows based on search input and status filter
   */
  filterResults(searchTerm = '', statusFilter = 'all') {
    const rows = document.querySelectorAll('.test-result-row');
    const lowerSearchTerm = searchTerm.toLowerCase();
    let visibleCount = 0;
    const totalCount = rows.length;

    rows.forEach((row) => {
      const testId = row.querySelector('strong').textContent.toLowerCase();
      const testName = row.querySelector('.text-muted').textContent.toLowerCase();
      const statusElement = row.querySelector('.badge');
      const status = statusElement ? statusElement.textContent.trim() : '';

      // Check search term match
      const searchMatch =
        !searchTerm || testId.includes(lowerSearchTerm) || testName.includes(lowerSearchTerm);

      // Check status filter match
      let statusMatch = true;
      if (statusFilter === 'passed') {
        statusMatch = status.includes('Passed');
      } else if (statusFilter === 'failed') {
        statusMatch = status.includes('Failed');
      }

      const shouldShow = searchMatch && statusMatch;
      row.style.display = shouldShow ? '' : 'none';

      // Add highlight class for search matches
      if (shouldShow && searchTerm) {
        row.classList.add('highlight');
      } else {
        row.classList.remove('highlight');
      }

      if (shouldShow) visibleCount++;
    });

    // Update search results info
    this.updateSearchResultsInfo(visibleCount, totalCount, searchTerm, statusFilter);

    // Scroll to first visible result if searching
    if (searchTerm && visibleCount > 0) {
      const firstVisibleRow = document.querySelector(
        '.test-result-row[style=""], .test-result-row:not([style*="none"])'
      );
      if (firstVisibleRow) {
        firstVisibleRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  /**
   * Update the search results information display
   */
  updateSearchResultsInfo(visibleCount, totalCount, searchTerm, statusFilter) {
    const infoElement = document.getElementById('search-results-info');
    if (!infoElement) return;

    let message = '';

    if (searchTerm && statusFilter !== 'all') {
      message = `Showing ${visibleCount} of ${totalCount} tests matching "${searchTerm}" with status "${statusFilter}"`;
    } else if (searchTerm) {
      message = `Showing ${visibleCount} of ${totalCount} tests matching "${searchTerm}"`;
    } else if (statusFilter !== 'all') {
      message = `Showing ${visibleCount} of ${totalCount} ${statusFilter} tests`;
    } else {
      message = `Showing all ${totalCount} test results`;
    }

    infoElement.textContent = message;

    // Add highlight class if filtering is active
    if (searchTerm || statusFilter !== 'all') {
      infoElement.classList.add('text-primary');
      infoElement.classList.remove('text-muted');
    } else {
      infoElement.classList.add('text-muted');
      infoElement.classList.remove('text-primary');
    }
  }

  /**
   * Export report data to JSON
   */
  exportToJson() {
    const dataStr = JSON.stringify(this.testData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `endorphin-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Print the report
   */
  printReport() {
    window.print();
  }
}

// Utility functions for additional features
class ReportUtils {
  /**
   * Copy text to clipboard
   */
  static copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          ReportUtils.showToast('Copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy:', err);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        ReportUtils.showToast('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  }

  /**
   * Show a toast notification
   */
  static showToast(message, type = 'success') {
    // Create toast element if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }

    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Generate a random color for charts/visualizations
   */
  static generateColor(index) {
    const colors = [
      '#0066cc',
      '#28a745',
      '#dc3545',
      '#ffc107',
      '#17a2b8',
      '#6f42c1',
      '#e83e8c',
      '#fd7e14',
      '#20c997',
      '#6c757d',
    ];
    return colors[index % colors.length];
  }
}

// Initialize the report viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.reportViewer = new TestReportViewer();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      window.reportViewer.exportToJson();
    }

    // Ctrl/Cmd + P to print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.reportViewer.printReport();
    }

    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.getElementById('test-search');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('test-search');
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        window.reportViewer.filterResults('', window.reportViewer.currentFilter);
      }
    }

    // Number keys to select filters (1=All, 2=Passed, 3=Failed)
    if (e.key >= '1' && e.key <= '3' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const filterButtons = document.querySelectorAll('[data-filter]');
      const index = parseInt(e.key) - 1;
      if (filterButtons[index]) {
        filterButtons[index].click();
      }
    }
  });
});

/**
 * Global function to show test details by sessionId
 * Called by View Details buttons in the report
 */
function showTestDetails(sessionId) {
  if (window.reportViewer && window.reportViewer.testData) {
    // Find the test result index by sessionId
    const index = window.reportViewer.testData.findIndex(
      result => result.session?.sessionId === sessionId || result.summary?.sessionId === sessionId
    );
    
    if (index !== -1) {
      window.reportViewer.showTestDetails(index);
    } else {
      console.error('Test result not found for sessionId:', sessionId);
      alert(`Test details not found for session: ${sessionId}`);
    }
  } else {
    console.error('Report viewer not initialized');
  }
}

// Make function available globally
window.showTestDetails = showTestDetails;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestReportViewer, ReportUtils, showTestDetails };
}
