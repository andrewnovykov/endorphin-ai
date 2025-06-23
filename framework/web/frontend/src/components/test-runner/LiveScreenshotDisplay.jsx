import React, { useState, useEffect } from 'react';

/**
 * LiveScreenshotDisplay component shows real-time screenshots during test execution
 */
const LiveScreenshotDisplay = ({ currentScreenshot, jobId, isRunning }) => {
  const [screenshotHistory, setScreenshotHistory] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (currentScreenshot) {
      setScreenshotHistory(prev => [...prev, currentScreenshot]);
    }
  }, [currentScreenshot]);

  const openModal = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedScreenshot(null);
    setIsModalOpen(false);
  };

  const getScreenshotUrl = (filename) => {
    return `/api/screenshots/${jobId}/${filename}`;
  };

  const clearHistory = () => {
    setScreenshotHistory([]);
  };

  return (
    <div className="live-screenshot-display">
      <div className="screenshot-header">
        <h4>Live Screenshots</h4>
        <div className="screenshot-controls">
          {screenshotHistory.length > 0 && (
            <button 
              className="btn btn-sm btn-secondary"
              onClick={clearHistory}
              disabled={isRunning}
            >
              Clear History
            </button>
          )}
          <div className="screenshot-status">
            {isRunning ? (
              <span className="status running">🔄 Capturing...</span>
            ) : (
              <span className="status idle">📷 Ready</span>
            )}
          </div>
        </div>
      </div>

      {currentScreenshot ? (
        <div className="current-screenshot">
          <div className="screenshot-container">
            <img
              src={getScreenshotUrl(currentScreenshot.filename || currentScreenshot.name)}
              alt="Current screenshot"
              className="live-screenshot"
              onClick={() => openModal(currentScreenshot)}
            />
            <div className="screenshot-overlay">
              <span className="screenshot-zoom">🔍 Click to enlarge</span>
            </div>
          </div>
          <div className="screenshot-info">
            <span className="screenshot-step">
              {currentScreenshot.description || 'Latest screenshot'}
            </span>
            <span className="screenshot-time">
              {new Date(currentScreenshot.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="screenshot-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">📷</div>
            <p>
              {isRunning 
                ? 'Waiting for first screenshot...' 
                : 'Screenshots will appear here during test execution'
              }
            </p>
          </div>
        </div>
      )}

      {screenshotHistory.length > 1 && (
        <div className="screenshot-history">
          <h5>Recent Screenshots ({screenshotHistory.length})</h5>
          <div className="history-grid">
            {screenshotHistory.slice(-6).reverse().map((screenshot, index) => (
              <div 
                key={index} 
                className="history-item"
                onClick={() => openModal(screenshot)}
              >
                <img
                  src={getScreenshotUrl(screenshot.filename || screenshot.name)}
                  alt={`Screenshot ${index + 1}`}
                  className="history-thumbnail"
                />
                <div className="history-info">
                  <span className="history-time">
                    {new Date(screenshot.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for full-size screenshot viewing */}
      {isModalOpen && selectedScreenshot && (
        <div className="screenshot-modal" onClick={closeModal}>
          <div className="modal-backdrop" />
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>
                {selectedScreenshot.description || 'Screenshot'} 
                {selectedScreenshot.step && ` - Step ${selectedScreenshot.step}`}
              </h4>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <img
                src={getScreenshotUrl(selectedScreenshot.filename || selectedScreenshot.name)}
                alt="Screenshot"
                className="modal-screenshot"
              />
            </div>
            <div className="modal-footer">
              <div className="screenshot-details">
                <span>Captured: {new Date(selectedScreenshot.timestamp).toLocaleString()}</span>
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

export default LiveScreenshotDisplay;
