🔒 security(server): fix critical security vulnerabilities (Sprint 1)

## Problem
Multiple security vulnerabilities and bugs were identified in the code audit:
- CR-002: execSync bug in CLI using invalid `.catch()` on synchronous function
- CR-005: Path traversal bypass via `./..` pattern
- HI-004: No file path length validation (DoS risk)
- HI-005: CORS too permissive in development mode

## Solution

### CLI Fix (bin/ai-review.js)
- Replaced invalid `execSync().catch()` with proper `try-catch` block
- Browser auto-open feature now works correctly with proper error handling

### Security Hardening (server.js)
- **Enterprise-grade CORS**: Restricted to specific localhost origins instead of wildcard
- **Path traversal prevention**: Strict rejection of ANY `..` sequence in file paths
- **Path length validation**: Max 500 characters to prevent DoS
- **Windows path check**: Block absolute Windows paths (`C:\`)
- **Newline injection**: Block `\r\n` characters in paths
- **Path resolution check**: Verify resolved paths stay within working directory

## Impact
- Closes CR-002: CLI browser auto-open now works
- Closes CR-005: Path traversal attacks blocked
- Closes HI-004: Path length DoS prevented
- Closes HI-005: CORS properly restricted

## Security Improvements
```
Before: CORS origin = true (all origins)
After:  CORS origin = whitelist only (localhost:3000, localhost:3002)

Before: Path `./../../etc/passwd` would pass validation
After:  ANY path with `..` is rejected

Before: No path length limit
After:  Max 500 characters enforced
```

## Testing
All 3 test suites pass:
- test/server.test.js ✅
- test/diffService.test.js ✅
- test/spaces-in-paths.test.js ✅
