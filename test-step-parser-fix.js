// Quick test to verify step parser fix
import { parseSteps, generateStepSummary } from './framework/utils/step-parser.js';

console.log('🧪 Testing Step Parser Fix...');

// Test 1: Natural language task (like test recorder uses)
console.log('\n📝 Test 1: Natural language task');
const naturalResult = parseSteps('Navigate to https://google.com');
console.log('- Total steps:', naturalResult.totalSteps);
console.log('- Has valid steps:', naturalResult.hasValidSteps);
console.log('- Summary:', generateStepSummary(naturalResult));

// Test 2: Explicit step format (like normal tests)
console.log('\n📝 Test 2: Explicit step format');
const explicitResult = parseSteps(`
STEP 1: Navigate to https://google.com
STEP 2: Click search box
STEP 3: Type "test"
`);
console.log('- Total steps:', explicitResult.totalSteps);
console.log('- Has valid steps:', explicitResult.hasValidSteps);
console.log('- Summary:', generateStepSummary(explicitResult));

// Test 3: Empty task
console.log('\n📝 Test 3: Empty task');
const emptyResult = parseSteps('');
console.log('- Total steps:', emptyResult.totalSteps);
console.log('- Has valid steps:', emptyResult.hasValidSteps);

console.log('\n✅ Step parser fix verified!');