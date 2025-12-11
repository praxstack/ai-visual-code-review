✅ fix(vscode): add missing TypeScript files for VSCode extension (CR-001)

## Problem
VSCode extension was incomplete with missing TypeScript files that were imported but not created:
- `services/diffService.ts` - Referenced but not implemented
- `providers/stagedFilesProvider.ts` - Tree data provider missing
- `webview/reviewWebviewProvider.ts` - Webview panel missing
- `gitService.ts` had TypeScript type error (implicit any)

## Solution

### New Files Created
1. **diffService.ts** - Complete diff parsing service
   - `parseDiff()` - Parse git diff into structured chunks
   - `formatEnhancedDiff()` - Format with line numbers
   - `generateEnhancedDiffMarkdown()` - Export ready markdown

2. **stagedFilesProvider.ts** - Tree view provider
   - Implements `TreeDataProvider<StagedFileItem>`
   - Shows staged files in VSCode sidebar
   - File type icons based on extension
   - Refresh capability

3. **reviewWebviewProvider.ts** - Webview panel provider
   - Implements `WebviewViewProvider`
   - Full panel view for code review
   - Sidebar view for quick access
   - Message handling for VSCode commands

### Type Fix
- Fixed implicit `any` type in `gitService.ts` filter callback
- Added proper `(file: string)` type annotation

## Impact
- Closes CR-001: VSCode extension now compiles successfully
- Extension ready for testing in VSCode
- All 30 unit tests still pass

## Testing
- VSCode Extension: `npm run compile` ✅
- Main Project: `npm test` (30/30 pass) ✅
- CLI: `node bin/ai-review.js --help` ✅
