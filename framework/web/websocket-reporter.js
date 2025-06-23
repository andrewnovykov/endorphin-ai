/**
 * WebSocket Reporter for Endorphin AI
 * Extends ConsoleReporter to broadcast test events to connected clients
 */
import { ConsoleReporter } from '../core/console-reporter.js';

export class WebSocketReporter extends ConsoleReporter {
  constructor(wss) {
    super();
    this.wss = wss;
  }

  broadcast(message) {
    if (!this.wss || !this.wss.clients) return;
    
    try {
      // Handle circular references and other JSON serialization issues
      const data = JSON.stringify(message, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Handle circular references
          if (this._seenObjects && this._seenObjects.has(value)) {
            return '[Circular Reference]';
          }
          if (!this._seenObjects) this._seenObjects = new WeakSet();
          this._seenObjects.add(value);
        }
        return value;
      });
      
      // Reset seen objects for next call
      this._seenObjects = null;
      
      this.wss.clients.forEach(client => {
        try {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(data);
          }
        } catch (error) {
          console.error('WebSocket send error:', error);
        }
      });
    } catch (error) {
      console.error('WebSocket broadcast error:', error);
    }
  }

  // Override parent methods to add WebSocket broadcasting
  startTest(testId, testName) {
    // Call parent method for console output
    super.startTest(testId, testName);
    
    // Broadcast to WebSocket clients
    this.broadcast({
      type: 'test-start',
      test: { id: testId, name: testName },
      timestamp: new Date().toISOString()
    });
  }

  completeTest(testId, testName, status, duration = 0, error = null) {
    // Call parent method for console output
    super.completeTest(testId, testName, status, duration, error);
    
    // Broadcast to WebSocket clients
    this.broadcast({
      type: 'test-complete',
      result: { testId, testName, status, duration, error },
      timestamp: new Date().toISOString()
    });
  }

  reportError(testId, error) {
    // Call parent method for console output
    super.reportError(testId, error);
    
    // Broadcast to WebSocket clients
    this.broadcast({
      type: 'test-error',
      error: { testId, message: error.message, stack: error.stack },
      timestamp: new Date().toISOString()
    });
  }

  // Additional methods for WebSocket-specific events
  onTestStart(test) {
    this.startTest(test.id, test.name);
  }

  onTestStep(step) {
    // Broadcast step information (no parent method for this)
    this.broadcast({
      type: 'test-step',
      step: step,
      timestamp: new Date().toISOString()
    });
  }

  onTestComplete(result) {
    this.completeTest(result.testId, result.testName, result.status, result.duration, result.error);
  }

  onTestError(error) {
    this.reportError(error.testId || this.currentTestId, error);
  }

  onTestScreenshot(screenshotInfo) {
    // Broadcast screenshot information (no parent method for this)
    this.broadcast({
      type: 'test-screenshot',
      screenshot: screenshotInfo,
      timestamp: new Date().toISOString()
    });
  }
}
