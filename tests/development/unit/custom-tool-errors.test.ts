/**
 * Unit tests for custom tool error handling system
 */

import {
  CustomToolError,
  ToolDiscoveryError,
  ToolLoadError,
  ToolValidationError,
  ToolExecutionError,
  ToolConflictError,
  CustomToolErrorHandler,
} from '../../../framework/core/custom-tool-errors';

describe('Custom Tool Error System', () => {
  beforeEach(() => {
    CustomToolErrorHandler.resetErrorCounts();
  });

  describe('CustomToolError', () => {
    it('should create basic custom tool error', () => {
      const error = new CustomToolError('Test error', 'TEST_ERROR', { test: true });
      
      expect(error.name).toBe('CustomToolError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.context).toEqual({ test: true });
    });

    it('should work without context', () => {
      const error = new CustomToolError('Test error', 'TEST_ERROR');
      
      expect(error.context).toBeUndefined();
    });
  });

  describe('Specific Error Types', () => {
    it('should create ToolDiscoveryError', () => {
      const error = new ToolDiscoveryError('Discovery failed', { path: '/test' });
      
      expect(error.name).toBe('ToolDiscoveryError');
      expect(error.code).toBe('TOOL_DISCOVERY_ERROR');
      expect(error.context?.path).toBe('/test');
    });

    it('should create ToolLoadError', () => {
      const error = new ToolLoadError('Load failed', { file: 'test.ts' });
      
      expect(error.name).toBe('ToolLoadError');
      expect(error.code).toBe('TOOL_LOAD_ERROR');
      expect(error.context?.file).toBe('test.ts');
    });

    it('should create ToolValidationError', () => {
      const error = new ToolValidationError('Validation failed', { tool: 'test-tool' });
      
      expect(error.name).toBe('ToolValidationError');
      expect(error.code).toBe('TOOL_VALIDATION_ERROR');
      expect(error.context?.tool).toBe('test-tool');
    });

    it('should create ToolExecutionError', () => {
      const error = new ToolExecutionError('Execution failed', { action: 'test' });
      
      expect(error.name).toBe('ToolExecutionError');
      expect(error.code).toBe('TOOL_EXECUTION_ERROR');
      expect(error.context?.action).toBe('test');
    });

    it('should create ToolConflictError', () => {
      const error = new ToolConflictError('Conflict detected', { name: 'duplicate' });
      
      expect(error.name).toBe('ToolConflictError');
      expect(error.code).toBe('TOOL_CONFLICT_ERROR');
      expect(error.context?.name).toBe('duplicate');
    });
  });

  describe('CustomToolErrorHandler', () => {
    describe('handleError', () => {
      it('should convert generic Error to ToolLoadError for module errors', () => {
        const originalError = new TypeError('Cannot resolve module');
        const context = { toolPath: '/test/tool.ts' };
        
        const handled = CustomToolErrorHandler.handleError(originalError, context);
        
        expect(handled).toBeInstanceOf(ToolLoadError);
        expect(handled.message).toContain('Module loading failed');
        expect(handled.context?.toolPath).toBe('/test/tool.ts');
        expect(handled.context?.originalError).toBe('TypeError');
      });

      it('should convert generic Error to ToolValidationError for validation errors', () => {
        const originalError = new Error('validation failed');
        const context = { toolName: 'test-tool' };
        
        const handled = CustomToolErrorHandler.handleError(originalError, context);
        
        expect(handled).toBeInstanceOf(ToolValidationError);
        expect(handled.message).toContain('Tool validation failed');
        expect(handled.context?.toolName).toBe('test-tool');
      });

      it('should return CustomToolError unchanged', () => {
        const originalError = new ToolConflictError('Name conflict', { name: 'test' });
        
        const handled = CustomToolErrorHandler.handleError(originalError);
        
        expect(handled).toBe(originalError);
      });

      it('should increment error counts', () => {
        const error = new Error('Test error');
        const context = { toolPath: '/test/tool.ts' };
        
        CustomToolErrorHandler.handleError(error, context);
        CustomToolErrorHandler.handleError(error, context);
        
        const stats = CustomToolErrorHandler.getErrorStatistics();
        expect(stats['Error:/test/tool.ts']).toBe(2);
      });
    });

    describe('shouldRetry', () => {
      it('should allow retry for ToolLoadError', () => {
        const error = new ToolLoadError('Load failed', { retryCount: 1 });
        
        expect(CustomToolErrorHandler.shouldRetry(error)).toBe(true);
      });

      it('should allow retry for ToolDiscoveryError', () => {
        const error = new ToolDiscoveryError('Discovery failed', { retryCount: 1 });
        
        expect(CustomToolErrorHandler.shouldRetry(error)).toBe(true);
      });

      it('should not allow retry for ToolValidationError', () => {
        const error = new ToolValidationError('Validation failed', { retryCount: 1 });
        
        expect(CustomToolErrorHandler.shouldRetry(error)).toBe(false);
      });

      it('should not allow retry for ToolConflictError', () => {
        const error = new ToolConflictError('Conflict', { retryCount: 1 });
        
        expect(CustomToolErrorHandler.shouldRetry(error)).toBe(false);
      });

      it('should not allow retry after max retries', () => {
        const error = new ToolLoadError('Load failed', { retryCount: 3 });
        
        expect(CustomToolErrorHandler.shouldRetry(error)).toBe(false);
      });
    });

    describe('Error Classification', () => {
      it('should classify module errors correctly', () => {
        const errors = [
          new TypeError('Cannot import module'),
          new SyntaxError('Unexpected token'),
          new ReferenceError('Module not found'),
          new Error('Cannot resolve module'),
          new Error('Module not found'),
        ];

        for (const error of errors) {
          const handled = CustomToolErrorHandler.handleError(error);
          expect(handled).toBeInstanceOf(ToolLoadError);
        }
      });

      it('should classify validation errors correctly', () => {
        const errors = [
          new Error('validation failed'),
          new Error('schema error'),
          new Error('Invalid tool structure'),
        ];

        for (const error of errors) {
          const handled = CustomToolErrorHandler.handleError(error);
          expect(handled).toBeInstanceOf(ToolValidationError);
        }
      });

      it('should classify runtime errors correctly', () => {
        const errors = [
          new Error('execution failed'),
          new Error('runtime error'),
          new TypeError('Cannot call method'),
        ];

        for (const error of errors) {
          const handled = CustomToolErrorHandler.handleError(error);
          expect(handled).toBeInstanceOf(ToolExecutionError);
        }
      });
    });

    describe('Statistics and Management', () => {
      it('should provide error statistics', () => {
        const error1 = new Error('Test 1');
        const error2 = new Error('Test 2');
        
        CustomToolErrorHandler.handleError(error1, { toolPath: '/test1.ts' });
        CustomToolErrorHandler.handleError(error2, { toolPath: '/test2.ts' });
        CustomToolErrorHandler.handleError(error1, { toolPath: '/test1.ts' });
        
        const stats = CustomToolErrorHandler.getErrorStatistics();
        expect(stats['Error:/test1.ts']).toBe(2);
        expect(stats['Error:/test2.ts']).toBe(1);
      });

      it('should reset error counts', () => {
        const error = new Error('Test');
        CustomToolErrorHandler.handleError(error, { toolPath: '/test.ts' });
        
        expect(Object.keys(CustomToolErrorHandler.getErrorStatistics())).toHaveLength(1);
        
        CustomToolErrorHandler.resetErrorCounts();
        
        expect(Object.keys(CustomToolErrorHandler.getErrorStatistics())).toHaveLength(0);
      });
    });
  });
});