# Performance Monitoring Implementation Plan

> **Version**: 1.0  
> **Date**: January 17, 2025  
> **Status**: Planning Phase  
> **Category**: Core Framework Feature

## Executive Summary

This document outlines the implementation plan for adding comprehensive page load time tracking and performance monitoring to Endorphin AI tests. The feature focuses on providing insights and analytics rather than test failures, ensuring that performance data enhances debugging and optimization without impacting test reliability.

### Key Principles
- **Zero test failures**: Performance metrics are for insights only, never cause test failures
- **Optional overhead**: Can be completely disabled with `ENDORPHIN_PERFORMANCE=off`
- **Visual insights**: Screenshots and metrics for every unique page visited
- **CI-friendly**: Enabled by default but configurable for different environments

## Goals & Benefits

### Primary Goals
1. **Performance Insights**: Track page load times across test runs
2. **Visual Documentation**: Screenshot every unique page with performance data
3. **Trend Monitoring**: Identify performance regressions over time
4. **Multi-user Analysis**: Compare load times between concurrent users
5. **Debugging Aid**: Help identify slow pages in test workflows

### Benefits
- **Proactive monitoring**: Catch performance issues before they impact users
- **Data-driven optimization**: Make informed decisions about page performance
- **Historical analysis**: Track performance trends across test executions
- **User experience focus**: Real-world performance metrics
- **Zero impact**: Optional feature with minimal overhead

## Technical Requirements

### Environment Control
```bash
# Enable performance tracking (default)
ENDORPHIN_PERFORMANCE=on

# Disable performance tracking (zero overhead)
ENDORPHIN_PERFORMANCE=off
```

### Performance Metrics Collection
- **DOM Content Loaded**: Time until DOM is fully loaded
- **Network Idle**: Time until network requests settle
- **Full Load**: Complete page load time
- **First Paint**: Time to first visual render
- **First Contentful Paint**: Time to first meaningful content
- **Largest Contentful Paint**: Time to largest content element

### Data Storage Requirements
- **Unique page tracking**: Deduplicate by URL
- **Screenshot storage**: One screenshot per unique page
- **Session integration**: Include performance data in test session JSON
- **Report integration**: Display in HTML reports Performance tab

## Implementation Phases

### Phase 1: Data Collection Enhancement (Week 1-2)
**Scope**: Enhance navigation tool to collect performance metrics

**Tasks**:
- [ ] Modify `framework/automation/tools/navigation.ts` to collect timing data
- [ ] Add performance metric collection using Playwright's Performance API
- [ ] Implement Web Vitals extraction (LCP, FID, CLS)
- [ ] Add resource loading analysis
- [ ] Create performance data structures in `framework/types/test.ts`

**Deliverables**:
- Enhanced navigation tool with performance tracking
- New TypeScript interfaces for performance data
- Performance metric collection utilities

### Phase 2: Session Storage Integration (Week 2-3)
**Scope**: Store performance data in test sessions

**Tasks**:
- [ ] Extend `TestSession` interface to include performance data
- [ ] Modify session manager to handle performance tracking
- [ ] Implement page deduplication logic (unique URL tracking)
- [ ] Add screenshot association with performance data
- [ ] Update test session JSON serialization

**Deliverables**:
- Updated session management with performance data
- Page deduplication and screenshot association
- Enhanced test session JSON structure

### Phase 3: HTML Report Performance Tab (Week 3-4)
**Scope**: Add Performance tab to HTML reports

**Tasks**:
- [ ] Add third tab to `framework/templates/reporter/report-template.html`
- [ ] Create performance summary cards (total pages, avg load time, etc.)
- [ ] Implement page list with screenshot thumbnails
- [ ] Add performance metrics display for each page
- [ ] Update `framework/templates/reporter/scripts.js` for tab functionality

**Deliverables**:
- New Performance tab in HTML reports
- Visual page performance cards
- Interactive performance data display

### Phase 4: Visual Design & Screenshots (Week 4-5)
**Scope**: Polish visual design and screenshot integration

**Tasks**:
- [ ] Design performance indicator badges (Good/Fair/Poor)
- [ ] Implement screenshot modal popups
- [ ] Add performance trend visualization
- [ ] Create responsive design for performance cards
- [ ] Style performance metrics with color coding

**Deliverables**:
- Polished visual design for performance tab
- Screenshot integration with modal viewing
- Performance indicators and trend visualization

### Phase 5: Multi-user Performance Features (Week 5-6)
**Scope**: Advanced features for multi-user test performance analysis

**Tasks**:
- [ ] Add user-specific performance tracking
- [ ] Implement performance comparison between users
- [ ] Add concurrent user load time analysis
- [ ] Create multi-user performance summary
- [ ] Add performance insights and recommendations

**Deliverables**:
- Multi-user performance comparison features
- Advanced analytics and insights
- Complete performance monitoring system

## Data Structures

### Core Interfaces

```typescript
interface PagePerformanceEntry {
  url: string;
  visitCount: number;
  timestamp: string;
  metrics: PerformanceMetrics;
  screenshot: string;
  userId?: string; // For multi-user tests
}

interface PerformanceMetrics {
  domContentLoaded: number;      // ms
  networkIdle: number;           // ms
  fullLoad: number;              // ms
  firstPaint: number;            // ms
  firstContentfulPaint: number;  // ms
  largestContentfulPaint: number;// ms
}

interface TestSessionPerformance {
  pages: PagePerformanceEntry[];
  totalNavigations: number;
  averageLoadTime: number;
  slowestPage: {
    url: string;
    time: number;
  };
}
```

### Session Integration

```typescript
interface TestSession {
  // ... existing fields
  performance?: TestSessionPerformance; // Optional - only if tracking enabled
}
```

## UI/UX Design

### Performance Tab Layout

```
┌─────────────────────────────────────────────────┐
│ [Steps] [Agent History] [Performance] ←New Tab │
├─────────────────────────────────────────────────┤
│ Performance Summary Cards                       │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│ │ Total │ │ Avg   │ │Slowest│ │ Nav   │       │
│ │ Pages │ │ Load  │ │ Page  │ │ Count │       │
│ └───────┘ └───────┘ └───────┘ └───────┘       │
├─────────────────────────────────────────────────┤
│ Pages List                                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ ┌─────────┐ example.com/login               │ │
│ │ │ [thumb] │ DOM: 850ms  Load: 1450ms       │ │
│ │ │ [shot]  │ FCP: 750ms  Visits: 2x        │ │
│ │ └─────────┘ [Good] Last: 10:30:00          │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ ┌─────────┐ example.com/dashboard          │ │
│ │ │ [thumb] │ DOM: 1200ms Load: 2100ms       │ │
│ │ │ [shot]  │ FCP: 900ms  Visits: 1x        │ │
│ │ └─────────┘ [Fair] Last: 10:32:15          │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Page Performance Cards

```html
<div class="card mb-3">
  <div class="row g-0">
    <div class="col-md-4">
      <!-- Screenshot thumbnail -->
      <img src="{{screenshot}}" class="img-fluid rounded-start performance-screenshot" 
           alt="{{url}}" onclick="showScreenshotModal('{{screenshot}}')">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h6 class="card-title">{{url}}</h6>
        <div class="row">
          <div class="col-6">
            <small class="text-muted">DOM Content Loaded</small>
            <div class="fw-bold">{{domContentLoaded}}ms</div>
          </div>
          <div class="col-6">
            <small class="text-muted">Full Load</small>
            <div class="fw-bold">{{fullLoad}}ms</div>
          </div>
          <div class="col-6 mt-2">
            <small class="text-muted">First Paint</small>
            <div class="fw-bold">{{firstPaint}}ms</div>
          </div>
          <div class="col-6 mt-2">
            <small class="text-muted">Visit Count</small>
            <div class="fw-bold">{{visitCount}}x</div>
          </div>
        </div>
        <div class="mt-2">
          <span class="badge bg-{{performanceColor}}">{{performanceRating}}</span>
          <small class="text-muted ms-2">Last visited: {{lastVisit}}</small>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Technical Implementation

### Navigation Tool Enhancement

```typescript
// framework/automation/tools/navigation.ts
export function createNavigationTool(framework: any) {
  return tool(
    async (params: {
      location: string;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    }) => {
      const location = params.location;
      const waitUntil = params.waitUntil ?? 'domcontentloaded';
      
      // Check if performance tracking is enabled
      const performanceEnabled = process.env.ENDORPHIN_PERFORMANCE !== 'off';
      
      let performanceData = null;
      
      if (performanceEnabled) {
        // Collect performance metrics
        const startTime = Date.now();
        
        await framework.currentPage!.goto(location, { waitUntil, timeout: 60000 });
        
        // Extract performance metrics
        performanceData = await framework.currentPage!.evaluate(() => {
          const timing = performance.timing;
          const paintEntries = performance.getEntriesByType('paint');
          
          return {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            fullLoad: timing.loadEventEnd - timing.navigationStart,
            firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
            networkIdle: Date.now() - startTime // Approximate
          };
        });
        
        // Take screenshot for performance tracking
        const screenshot = await framework.takeStepScreenshot(`Page loaded: ${location}`);
        
        // Store performance data in session
        framework.logPerformanceData(location, performanceData, screenshot);
      } else {
        // Normal navigation without performance tracking
        await framework.currentPage!.goto(location, { waitUntil, timeout: 60000 });
        await framework.takeStepScreenshot(`Page loaded: ${location}`);
      }
      
      framework.logTestStep(
        `Navigate to: ${location}`,
        'navigate',
        { location, waitUntil, performanceTracking: performanceEnabled },
        `Successfully navigated to: ${location}`,
        true
      );
      
      return `Successfully navigated to: ${location}`;
    },
    // ... tool schema
  );
}
```

### Browser Manager Performance Integration

```typescript
// framework/automation/browser/browser-manager.ts
export class BrowserManager {
  // ... existing methods
  
  /**
   * Navigate with performance tracking
   */
  async navigateToUrl(
    url: string,
    options?: { 
      timeout?: number; 
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
      trackPerformance?: boolean;
    }
  ): Promise<PerformanceMetrics | null> {
    const page = this.getPage();
    const timeout = options?.timeout || this.config.browser.timeout;
    const waitUntil = options?.waitUntil || 'domcontentloaded';
    const trackPerformance = options?.trackPerformance ?? (process.env.ENDORPHIN_PERFORMANCE !== 'off');

    this.logger.info(`Navigating to ${url}`, { timeout, waitUntil, trackPerformance });

    try {
      if (trackPerformance) {
        const startTime = Date.now();
        await page.goto(url, { timeout, waitUntil });
        
        // Extract detailed performance metrics
        const performanceMetrics = await this.extractPerformanceMetrics(startTime);
        this.logger.debug('Performance metrics collected', performanceMetrics);
        
        return performanceMetrics;
      } else {
        await page.goto(url, { timeout, waitUntil });
        return null;
      }
    } catch (error: any) {
      this.logger.error('Navigation failed', error, { url, timeout, waitUntil });
      throw error;
    }
  }
  
  private async extractPerformanceMetrics(startTime: number): Promise<PerformanceMetrics> {
    return await this.getPage().evaluate((navigationStart) => {
      const timing = performance.timing;
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        networkIdle: Date.now() - navigationStart,
        fullLoad: timing.loadEventEnd - timing.navigationStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0
      };
    }, startTime);
  }
}
```

## Configuration Options

### Environment Variables

```bash
# Performance tracking control
ENDORPHIN_PERFORMANCE=on|off         # Default: on

# Performance thresholds (optional)
ENDORPHIN_PERF_THRESHOLD_GOOD=2000   # Good: < 2 seconds
ENDORPHIN_PERF_THRESHOLD_FAIR=5000   # Fair: 2-5 seconds
                                     # Poor: > 5 seconds

# Screenshot options (optional)
ENDORPHIN_PERF_SCREENSHOTS=true      # Take screenshots for performance tracking
```

### Configuration File Options

```typescript
// endorphin.config.ts
export default {
  performance: {
    enabled: process.env.ENDORPHIN_PERFORMANCE !== 'off',
    collectWebVitals: true,
    screenshotPages: true,
    trackResources: true,
    thresholds: {
      good: 2000,    // < 2s = Good
      fair: 5000,    // 2-5s = Fair
                     // > 5s = Poor
    }
  }
}
```

## Timeline & Milestones

### Sprint 1: Foundation (Week 1-2)
- [ ] Performance data collection
- [ ] TypeScript interfaces
- [ ] Basic navigation tool enhancement

### Sprint 2: Storage (Week 2-3)
- [ ] Session integration
- [ ] Page deduplication
- [ ] Screenshot association

### Sprint 3: UI/UX (Week 3-4)
- [ ] HTML report Performance tab
- [ ] Basic performance display
- [ ] Tab functionality

### Sprint 4: Polish (Week 4-5)
- [ ] Visual design refinements
- [ ] Screenshot modals
- [ ] Performance indicators

### Sprint 5: Advanced Features (Week 5-6)
- [ ] Multi-user performance
- [ ] Performance insights
- [ ] Final testing and documentation

## Success Criteria

### Must Have
- [ ] Performance data collection with zero test failures
- [ ] Environment variable control (`ENDORPHIN_PERFORMANCE=off`)
- [ ] Performance tab in HTML reports
- [ ] Screenshot integration for each unique page
- [ ] Page performance metrics display

### Should Have
- [ ] Performance trend visualization
- [ ] Multi-user performance comparison
- [ ] Performance threshold configuration
- [ ] Export functionality for performance data

### Could Have
- [ ] Performance regression detection
- [ ] Automated performance insights
- [ ] Integration with external monitoring tools
- [ ] Historical performance database

## Risks & Mitigation

### Risk: Performance Overhead
**Mitigation**: Optional feature with environment variable control, minimal impact when enabled

### Risk: Screenshot Storage Size
**Mitigation**: Compress screenshots, implement cleanup policies, configurable screenshot options

### Risk: Browser Compatibility
**Mitigation**: Use standard Performance API, graceful degradation for unsupported features

### Risk: CI/CD Integration
**Mitigation**: Default enabled but configurable, minimal storage impact, no test failures

## Conclusion

This implementation plan provides a comprehensive approach to adding performance monitoring to Endorphin AI while maintaining the framework's core principles of reliability and ease of use. The phased approach ensures incremental delivery of value while minimizing risks and maintaining backward compatibility.

The performance monitoring feature will enhance the framework's debugging capabilities and provide valuable insights into application performance without impacting test execution reliability.