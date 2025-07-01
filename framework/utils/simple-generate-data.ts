/**
 * Simple data generation utility for test definitions
 * Provides predictable test data based on schema patterns
 */

/**
 * Generate test data based on a simple schema
 * @param schema - Schema definition (object with field types or example data)
 * @returns Generated test data matching the schema
 */
export function generateData(schema: any): any {
  if (typeof schema === 'object' && schema !== null) {
    const result: any = {};
    
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'string') {
        // Handle type hints or example values
        switch (value.toLowerCase()) {
          case 'email':
            result[key] = 'demo@example.com';
            break;
          case 'password':
            result[key] = 'demopassword123';
            break;
          case 'username':
            result[key] = 'DemoUser';
            break;
          case 'firstname':
          case 'first_name':
            result[key] = 'Demo';
            break;
          case 'lastname':
          case 'last_name':
            result[key] = 'User';
            break;
          case 'phone':
            result[key] = '+1-555-0123';
            break;
          case 'string':
            result[key] = `Test ${key}`;
            break;
          case 'number':
            result[key] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'boolean':
            result[key] = Math.random() > 0.5;
            break;
          case 'date':
            result[key] = new Date().toISOString().split('T')[0];
            break;
          case 'url':
            result[key] = 'https://example.com';
            break;
          default:
            // If it's already a value, use it
            result[key] = value;
        }
      } else if (typeof value === 'number') {
        result[key] = value;
      } else if (typeof value === 'boolean') {
        result[key] = value;
      } else if (Array.isArray(value)) {
        result[key] = value.length > 0 ? [generateData(value[0])] : [];
      } else if (typeof value === 'object' && value !== null) {
        // Recursively handle nested objects
        result[key] = generateData(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  // If schema is not an object, return a default user data
  return {
    email: 'demo@example.com',
    password: 'demopassword123',
    username: 'DemoUser',
    firstName: 'Demo',
    lastName: 'User'
  };
}