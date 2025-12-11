♻️ refactor(architecture): add modular source structure (HI-001 Phase 1)

## Problem
HI-001: server.js was a monolithic 1000+ line file making maintenance difficult

## Solution
Created modular `src/` directory structure following enterprise patterns:

### New Directory Structure
```
src/
├── config/
│   └── index.js         # Centralized configuration (HTTPS, rate limits, etc.)
├── middleware/
│   ├── index.js         # Middleware exports
│   ├── security.js      # Security headers, CSP with nonces (HI-010)
│   └── rateLimit.js     # Rate limiting with atomic operations
└── utils/
    ├── index.js         # Utility exports
    ├── validation.js    # Input validation functions
    └── gitCommands.js   # Secure git command execution
```

### Key Improvements
1. **Config Module** - All configuration in one place with HTTPS support (CR-003)
2. **Security Middleware** - CSP with nonce generation (HI-010 fix)
3. **Rate Limit Middleware** - Extracted with test reset function
4. **Validation Utils** - Reusable validation functions
5. **Git Commands Utils** - Secure command execution with whitelist

### HI-010 CSP Nonce Implementation
```javascript
// Before: unsafe-inline
"script-src 'self' 'unsafe-inline'"

// After: nonce-based
"script-src 'self' 'nonce-${nonce}'"
```

### CR-003 HTTPS Configuration Ready
```javascript
server: {
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true',
    keyPath: process.env.HTTPS_KEY_PATH || './certs/key.pem',
    certPath: process.env.HTTPS_CERT_PATH || './certs/cert.pem'
  }
}
```

## Impact
- Partial HI-001: Modular structure created (server.js refactor in Phase 2)
- HI-010: CSP nonce support ready for use
- CR-003: HTTPS configuration ready
- Foundation for easier testing and maintenance

## Testing
All 30 tests pass ✅
