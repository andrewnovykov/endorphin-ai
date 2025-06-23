import React, { useState } from 'react';

/**
 * ScreenshotPanel component displays screenshots taken during test execution
 */
const ScreenshotPanel = ({ screenshots, jobId }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedScreenshot(null);
    setIsModalOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
  };

  const getScreenshotUrl = (filename) => {
    return `/api/screenshots/${jobId}/${filename}`;
  };

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="screenshot-panel-empty">
        <div className="empty-state">
          <div className="empty-icon">📷</div>
          <h3>No Screenshots Available</h3>
          <p>No screenshots were captured during this test execution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screenshot-panel">
      <div className="screenshot-header">
        <h3>Screenshots ({screenshots.length})</h3>
        <p>Click on any screenshot to view it in full size</p>
      </div>

      <div className="screenshot-grid">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="screenshot-item">
            <div 
              className="screenshot-thumbnail"
              onClick={() => openModal(screenshot)}
            >
              <img
                src={getScreenshotUrl(screenshot.filename || screenshot.name)}
                alt={screenshot.description || `Screenshot ${index + 1}`}
                loading="lazy"
              />
              <div className="screenshot-overlay">
                <span className="screenshot-zoom">🔍</span>
              </div>
            </div>
            <div className="screenshot-info">
              <div className="screenshot-title">
                {screenshot.description || `Screenshot ${index + 1}`}
              </div>
              <div className="screenshot-meta">
                <span className="screenshot-time">
                  {formatTimestamp(screenshot.timestamp)}
                </span>
                {screenshot.step && (
                  <span className="screenshot-step">
                    Step {screenshot.step}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size screenshot viewing */}
      {isModalOpen && selectedScreenshot && (
        <div className="screenshot-modal" onClick={closeModal}>
          <div className="modal-backdrop" />
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedScreenshot.description || 'Screenshot'}</h4>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <img
                src={getScreenshotUrl(selectedScreenshot.filename || selectedScreenshot.name)}
                alt={selectedScreenshot.description || 'Screenshot'}
                className="modal-screenshot"
              />
            </div>
            <div className="modal-footer">
              <div className="screenshot-details">
                <span>Taken: {formatTimestamp(selectedScreenshot.timestamp)}</span>
                {selectedScreenshot.step && (
                  <span>During step: {selectedScreenshot.step}</span>
                )}
                {selectedScreenshot.size && (
                  <span>Size: {selectedScreenshot.size}</span>
                )}
              </div>
              <div className="modal-actions">
                <a
                  href={getScreenshotUrl(selectedScreenshot.filename || selectedScreenshot.name)}
                  download={selectedScreenshot.filename || selectedScreenshot.name}
                  className="btn btn-secondary"
                >
                  Download
                </a>
                <button className="btn btn-primary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotPanel;
