const ALLOWED_ORIGINS = [
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Based on how the cors package handles an array of origins
// https://github.com/expressjs/cors/blob/master/lib/index.js
function isOriginAllowed(origin, allowedOrigin) {
  if (Array.isArray(allowedOrigin)) {
    for (var i = 0; i < allowedOrigin.length; ++i) {
      if (isOriginAllowed(origin, allowedOrigin[i])) {
        return true;
      }
    }
    return false;
  } else if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin;
  } else if (allowedOrigin instanceof RegExp) {
    return allowedOrigin.test(origin);
  } else {
    return !!allowedOrigin;
  }
}

const testCases = [
  { origin: 'http://localhost:3000', expected: true, description: 'Allowed origin' },
  { origin: 'http://malicious.com', expected: false, description: 'Disallowed origin' },
  { origin: undefined, expected: false, description: 'No origin (should be disallowed now)' },
  { origin: 'http://localhost:3002', expected: true, description: 'Allowed origin (self)' }
];

let allPassed = true;
testCases.forEach(testCase => {
  const result = isOriginAllowed(testCase.origin, ALLOWED_ORIGINS);
  if (result === testCase.expected) {
    console.log(`✅ PASS: ${testCase.description} - Origin: ${testCase.origin} - Result: ${result}`);
  } else {
    console.log(`❌ FAIL: ${testCase.description} - Origin: ${testCase.origin} - Expected: ${testCase.expected}, Got: ${result}`);
    allPassed = false;
  }
});

if (!allPassed) {
  process.exit(1);
}
