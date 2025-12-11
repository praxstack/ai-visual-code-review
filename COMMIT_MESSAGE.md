♻️ refactor(frontend): fix duplicate state management and saveComment (Sprint 1)

## Problem
The frontend code had architectural issues identified in the code audit:
- HI-003: Duplicate state management (global variables AND state object)
- HI-015: saveComment function defined twice causing unpredictable behavior

## Solution

### State Management Fix (HI-003)
- Created centralized `AppState` object as single source of truth
- Added proper methods: `addDiff()`, `getDiff()`, `getParsedDiff()`, `hasDiff()`, `clear()`
- Maintained backward compatibility aliases for gradual migration
- Memory management integrated into AppState

### saveComment Fix (HI-015)
- Consolidated duplicate saveComment functions into single unified implementation
- Handles both file-level and line-level comments correctly
- Single code path for comment persistence

## Code Changes
```javascript
// Before: Duplicate state declarations
let allDiffs = {};           // Global
const state = {
  allDiffs: new Map(),       // Duplicate!
};

// After: Single source of truth
const AppState = {
  allDiffs: {},
  // Methods for cache management
  addDiff(file, diff, parsedDiff) { ... }
};
// Backward compatibility aliases
const allDiffs = AppState.allDiffs;
```

## Impact
- Closes HI-003: No more state desync issues
- Closes HI-015: Predictable comment saving behavior
- Improved maintainability and debugging
- Foundation for future TypeScript migration

## Testing
All 30 tests pass:
- test/server.test.js ✅
- test/diffService.test.js ✅
- test/spaces-in-paths.test.js ✅
