/**
 * Deep cloning utilities for test objects
 */

/**
 * Deep clone an object to ensure complete isolation
 * Handles nested objects, arrays, dates, and functions
 */
export function cloneDeep<T>(obj: T): T {
  // Handle null and primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  // Handle Arrays
  if (obj instanceof Array) {
    const arrCopy = [] as any[];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = cloneDeep(obj[i]);
    }
    return arrCopy as any;
  }

  // Handle Functions (preserve them as-is, don't clone)
  if (typeof obj === 'function') {
    return obj;
  }

  // Handle Objects
  if (obj instanceof Object) {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = cloneDeep((obj as any)[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Clone a test object, preserving functions but cloning data structures
 */
export function cloneTestObject<T extends Record<string, any>>(test: T): T {
  const cloned = {} as T;

  for (const key in test) {
    if (Object.prototype.hasOwnProperty.call(test, key)) {
      const value = test[key];
      
      // Preserve functions as-is (like setup, data, task, tasks)
      if (typeof value === 'function') {
        cloned[key] = value;
      } else {
        // Deep clone everything else
        cloned[key] = cloneDeep(value);
      }
    }
  }

  return cloned;
}