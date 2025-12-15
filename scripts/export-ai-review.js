#!/usr/bin/env node

/**
 * Unified AI Review Export Script
 * Generates AI_REVIEW.md with consistent formatting for CLI and Web interface
 * Supports include/exclude file patterns
 */

const { execSync } = require('child_process');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

// Import DiffService for consistent formatting
const DiffService = require('../services/diffService');
const GitStatusParser = require('../services/gitStatusParser');
const ReviewGenerator = require('../services/ReviewGenerator');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  includeFiles: [],
  excludeFiles: [],
  skipLargeFiles: true,
  includeOnlyMode: false,
  splitMode: false,
  outputDir: 'AI_REVIEWS'
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  switch (arg) {
    case '--include':
      config.includeOnlyMode = true;
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.includeFiles.push(args[i]);
        i++;
      }
      i--;
      break;

    case '--exclude':
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        config.excludeFiles.push(args[i]);
        i++;
      }
      i--;
      break;

    case '--max-size':
      config.maxFileSize = parseInt(args[i + 1]);
      i++;
      break;

    case '--no-size-limit':
      config.skipLargeFiles = false;
      break;

    case '--split':
      config.splitMode = true;
      break;

    case '--output-dir':
      config.outputDir = args[i + 1];
      i++;
      break;

    case '-h':
    case '--help':
      console.log(`
🔍 AI Review Export Script

Usage: node export-ai-review.js [options]

Options:
  --include FILES...  ONLY include specific files (space-separated globs)
  --exclude FILES...  Exclude specific files (space-separated globs)
  --max-size LINES    Skip files larger than LINES (default: 10000)
  --no-size-limit     Include all files regardless of size
  --split             Generate individual review files per source file
  --output-dir DIR    Directory for split reviews (default: auto-timestamped)
  -h, --help          Show this help

Examples:
  node export-ai-review.js
  node export-ai-review.js --include "src/**/*.ts"
  node export-ai-review.js --exclude "*.log" ".env" "dist/**/*"
  node export-ai-review.js --no-size-limit
  node export-ai-review.js --split
  node export-ai-review.js --split --output-dir "my-reviews"
      `);
      process.exit(0);
  }
}

// Default excludes (minimal - user has full control)
const DEFAULT_EXCLUDES = [
  '.env',
  '.env.local',
  '.env.production',
  'node_modules/',
  '*.log',
  '.git/',
  'dist/',
  'build/'
];

console.log('🔍 AI Review Export');
console.log('===================');

// Check if we're in a git repository
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: Not a git repository');
  console.error('💡 Please run this command inside a git repository');
  process.exit(1);
}

// Check if there are staged changes or unstaged deletions
let stagedFiles = [];
let deletedFiles = [];

try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  stagedFiles = output.trim() ? output.trim().split('\n').filter(f => f.length > 0) : [];
} catch (error) {
  console.error('❌ Error getting staged files:', error.message);
  process.exit(1);
}

try {
  const deletedOutput = execSync('git ls-files --deleted', { encoding: 'utf-8' });
  deletedFiles = deletedOutput.trim() ? deletedOutput.trim().split('\n').filter(f => f.length > 0) : [];
} catch (error) {
  // Ignore error, deletedFiles will remain empty
}

if (stagedFiles.length === 0 && deletedFiles.length === 0) {
  console.error('⚠️  No staged changes found');
  console.error('💡 Run \'git add .\' to stage changes, then try again');
  process.exit(1);
} else if (stagedFiles.length === 0 && deletedFiles.length > 0) {
  console.error(`⚠️  Found ${deletedFiles.length} deleted file(s) but they are not staged`);
  console.error('💡 To include deleted files in review:');
  console.error('   • Stage all changes: git add -A');
  console.error('   • Or stage specific deleted files: git rm <filename>');
  console.error('   • Then try again');
  process.exit(1);
} else {
  console.log(`✅ Found ${stagedFiles.length} staged files`);
  if (deletedFiles.length > 0) {
    console.log(`ℹ️  Note: ${deletedFiles.length} unstaged deleted file(s) will not be included`);
  }
}

// Function to check if file should be processed
function shouldProcessFile(file) {
  // Include-only mode: only process files in includeFiles
  if (config.includeOnlyMode) {
    for (const pattern of config.includeFiles) {
      if (matchPattern(file, pattern)) {
        return true;
      }
    }
    return false;
  }

  // Exclude mode: process all files except excluded ones
  const allExcludes = [...DEFAULT_EXCLUDES, ...config.excludeFiles];

  for (const pattern of allExcludes) {
    if (matchPattern(file, pattern)) {
      return false;
    }
  }

  return true;
}

// Simple pattern matching
function matchPattern(file, pattern) {
  // Exact match
  if (file === pattern) return true;

  // Directory exclusion: "node_modules/" or "node_modules/*"
  if (pattern.endsWith('/') || pattern.endsWith('/*')) {
    const dir = pattern.replace(/\/?\\*?$/, '');
    if (file.startsWith(dir + '/')) return true;
  }

  // Extension pattern: "*.log"
  if (pattern.startsWith('*.')) {
    const ext = pattern.substring(1);
    if (file.endsWith(ext)) return true;
  }

  // Glob-like pattern: "src/**/*.ts" or "scripts/**/*.js"
  if (pattern.includes('**')) {
    // Convert glob pattern to regex
    // scripts/**/*.js -> ^scripts\/(.*\/)?[^/]*\.js$
    // ** means "zero or more directories", so **/ becomes (.*\/)?
    let regexPattern = pattern
      .replace(/\*\*\//g, '__DOUBLESTARSLASH__')  // Placeholder for **/
      .replace(/\./g, '\\.')  // Escape dots
      .replace(/\//g, '\\/')  // Escape forward slashes
      .replace(/\*/g, '[^/]*')  // * matches any characters except /
      .replace(/__DOUBLESTARSLASH__/g, '(.*\\/)?');  // **/ means zero or more dirs
    const regex = new RegExp('^' + regexPattern + '$');
    if (regex.test(file)) return true;
  }

  // Simple wildcard: "src/*.ts"
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\//g, '\\/')
      .replace(/\*/g, '[^/]*');
    const regex = new RegExp('^' + regexPattern + '$');
    if (regex.test(file)) return true;
  }

  return false;
}

// Function to check file size
function isTooLarge(file) {
  if (!config.skipLargeFiles) return false;

  try {
    const content = execSync(`git show :${file}`, { encoding: 'utf-8' });
    const lineCount = content.split('\n').length;
    return lineCount > config.maxFileSize;
  } catch (error) {
    return false;
  }
}

// Filter files
const includedFiles = [];
const excludedFiles = [];
const largeFiles = [];

for (const file of stagedFiles) {
  if (!shouldProcessFile(file)) {
    excludedFiles.push(file);
    console.log(`⏭️  Skipping: ${file} (excluded)`);
  } else if (isTooLarge(file)) {
    largeFiles.push(file);
    console.log(`⏭️  Skipping: ${file} (too large)`);
  } else {
    includedFiles.push(file);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Included: ${includedFiles.length} files`);
console.log(`   Excluded: ${excludedFiles.length} files`);
console.log(`   Too large: ${largeFiles.length} files`);

if (includedFiles.length === 0) {
  console.error('\n❌ No files to process after filtering');
  process.exit(1);
}

// Generate AI review content
if (config.splitMode) {
  const outDirName = config.outputDir === 'AI_REVIEWS' ? undefined : config.outputDir; // undefined triggers timestamp default in service
  console.log(`\nmode: ✂️  Split Mode`);
  if (outDirName) console.log(`Output: ${outDirName}/`);
  else console.log(`Output: [Auto-Timestamped Directory]`);

  (async () => {
    try {
      const result = await ReviewGenerator.generateSplitReviews({
        includedFiles,
        outputDir: outDirName
      });
      console.log(`\n✅ Generated split reviews in: ${result.directory}/`);
      console.log(`📊 Stats: ${result.filesCreated} generated, ${result.errors.length} errors`);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error generating reviews:', error.message);
      process.exit(1);
    }
  })();

} else {
  // UNIFIED MODE: Generate single AI_REVIEW.md
  (async () => {
    try {
      console.log('\n📝 Generating AI_REVIEW.md...\n');

      const result = await ReviewGenerator.generateUnifiedReview({
        includedFiles,
        excludedFiles,
        largeFiles
      });

      console.log(`\n✅ Generated: ${result.file}`);
      console.log(`📊 Stats: ${result.filesProcessed} files processed, ${excludedFiles.length} excluded, ${result.errors.length} errors`);
      console.log(`📄 File size: ${result.contentLength} characters\n`);

      console.log('🎯 Next steps:');
      console.log('1. Review AI_REVIEW.md');
      console.log('2. Ask ChatGPT/Claude: "Please review AI_REVIEW.md"');
      console.log('3. Make any suggested changes');
      console.log('4. Commit: git commit -m "Your message"\n');

      process.exit(0);
    } catch (error) {
      console.error('❌ Error generating review:', error.message);
      process.exit(1);
    }
  })();
}
