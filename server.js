#!/usr/bin/env node

const express = require('express');
const { exec, execFile } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const cors = require('cors');
const DiffService = require('./services/diffService');
const GitStatusParser = require('./services/gitStatusParser');

const app = express();
const PORT = process.env.PORT || 3002;

// Configuration
const CONFIG = {
  server: {
    port: PORT,
    requestTimeout: 30000,
    maxRequestSize: '10mb'
  },
  git: {
    timeout: 15000,
    maxFileSize: 10000
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    exportMax: 10 // 10 exports per window
  }
};

// Rate limiting
const rateLimitStore = new Map();

const createRateLimit = (maxRequests, windowMs) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Skip rate limiting for localhost during development, but not during testing
    const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip?.startsWith('::ffff:127.0.0.1');
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTesting = process.env.NODE_ENV === 'test';

    if (isLocalhost && isDevelopment && !isTesting) {
      return next();
    }

    const key = ip;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    // Clean old requests
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      console.warn(`🚫 Rate limit exceeded for ${ip}: ${validRequests.length}/${maxRequests} requests in ${windowMs / 1000}s`);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000),
        current: validRequests.length,
        limit: maxRequests,
        windowSeconds: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    next();
  };
};

// Enhanced request logging with security monitoring
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${ip}`);

  // Security monitoring for suspicious patterns (exclude localhost/development)
  const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip?.startsWith('::ffff:127.0.0.1');

  if (!isLocalhost || process.env.NODE_ENV === 'production') {
    const suspiciousPatterns = [
      /\.\.\//,        // Path traversal (more specific)
      /[;&|`$()]/,     // Command injection characters
      /<script[^>]*>/i, // XSS script tags
      /javascript:/i,   // JavaScript protocol
      /data:text\/html/i, // Data URI XSS
      /vbscript:/i     // VBScript protocol
    ];

    const userAgent = req.get('User-Agent') || '';
    const queryString = JSON.stringify(req.query);
    const fullUrl = req.path + (req.query ? '?' + new URLSearchParams(req.query).toString() : '');

    const suspiciousFound = suspiciousPatterns.some(pattern =>
      pattern.test(fullUrl) ||
      pattern.test(queryString) ||
      pattern.test(userAgent)
    );

    if (suspiciousFound) {
      console.warn(`🚨 SECURITY ALERT - Suspicious request from ${ip}: ${req.method} ${fullUrl}`);
      console.warn(`   User-Agent: ${userAgent}`);
      console.warn(`   Query: ${queryString}`);
    }
  }

  next();
};

// Middleware - Enterprise-grade CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation'), false);
    },
  credentials: false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({
  limit: CONFIG.server.maxRequestSize,
  strict: true
}));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");

  // Add request timeout
  req.setTimeout(CONFIG.server.requestTimeout, () => {
    res.status(408).json({ error: 'Request timeout' });
  });

  next();
});

// Rate limiting middleware
app.use(createRateLimit(CONFIG.rateLimit.max, CONFIG.rateLimit.windowMs));

// Secure Git command execution
const ALLOWED_GIT_COMMANDS = {
  'diff-cached': ['git', 'diff', '--cached'],
  'diff-cached-names': ['git', 'diff', '--cached', '--name-only'],
  'diff-cached-stat': ['git', 'diff', '--cached', '--stat'],
  'status-porcelain': ['git', 'status', '--porcelain']
};

async function executeGitCommand(commandType, args = []) {
  return new Promise((resolve, reject) => {
    const baseCommand = ALLOWED_GIT_COMMANDS[commandType];
    if (!baseCommand) {
      return reject(new Error(`Invalid git command type: ${commandType}`));
    }

    // Sanitize and validate arguments
    const sanitizedArgs = args.filter(arg => {
      if (typeof arg !== 'string') return false;
      // Prevent command injection patterns
      if (/[;&|`$(){}[\]\\]/.test(arg)) return false;
      // Prevent path traversal (allow relative paths within repo)
      if (arg.includes('..') && !arg.startsWith('./')) return false;
      return true;
    });

    // Use execFile for proper argument handling (supports spaces in paths)
    const gitCommand = baseCommand[0]; // 'git'
    const gitArgs = [...baseCommand.slice(1), ...sanitizedArgs];

    // For logging purposes only
    const commandDisplay = [gitCommand, ...gitArgs].join(' ');

    execFile(gitCommand, gitArgs, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      timeout: CONFIG.git.timeout,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Git command failed: ${commandDisplay}`, stderr);
        reject(new Error(`Git operation failed: ${error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

// Enhanced input validation with comprehensive security checks
function validateFileRequest(file) {
  if (!file || typeof file !== 'string') {
    return { valid: false, error: 'File parameter is required and must be a string' };
  }

  // HI-004: Path length validation (max 500 characters)
  if (file.length > 500) {
    return { valid: false, error: 'File path too long (max 500 characters)' };
  }

  // Enhanced security validation
  if (!DiffService.isValidFilePath(file)) {
    return { valid: false, error: 'Invalid file path - potential security risk' };
  }

  // CR-005: Strict path traversal prevention - reject ANY ".." sequence
  if (file.includes('..')) {
    return { valid: false, error: 'Path traversal not allowed' };
  }

  // Additional checks for suspicious patterns
  const suspiciousPatterns = [
    /\x00/,           // Null bytes
    /[<>"|*?]/,       // Dangerous file characters
    /^\//,            // Absolute paths
    /^[a-zA-Z]:\\/,   // Windows absolute paths
    /[\r\n]/,         // Newline injection
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file))) {
    return { valid: false, error: 'File path contains invalid characters' };
  }

  // Verify the resolved path stays within working directory
  const resolvedPath = path.resolve(process.cwd(), file);
  if (!resolvedPath.startsWith(process.cwd())) {
    return { valid: false, error: 'File path escapes working directory' };
  }

  return { valid: true };
}

function validateExportRequest(body) {
  const { comments, lineComments, excludedFiles } = body || {};

  // Validate request size
  const bodySize = JSON.stringify(body).length;
  if (bodySize > 5 * 1024 * 1024) { // 5MB limit
    return { valid: false, error: 'Request payload too large' };
  }

  // Validate comments object with size limits
  if (comments) {
    if (typeof comments !== 'object' || Array.isArray(comments)) {
      return { valid: false, error: 'Comments must be an object' };
    }

    const commentCount = Object.keys(comments).length;
    if (commentCount > 100) {
      return { valid: false, error: 'Too many file comments (max 100)' };
    }

    // Validate individual comments
    for (const [file, comment] of Object.entries(comments)) {
      if (typeof comment !== 'string' || comment.length > 10000) {
        return { valid: false, error: 'Comment too long (max 10,000 characters)' };
      }
    }
  }

  // Validate lineComments object
  if (lineComments) {
    if (typeof lineComments !== 'object' || Array.isArray(lineComments)) {
      return { valid: false, error: 'Line comments must be an object' };
    }

    if (Object.keys(lineComments).length > 500) {
      return { valid: false, error: 'Too many line comments (max 500)' };
    }
  }

  // Validate excludedFiles array
  if (excludedFiles) {
    if (!Array.isArray(excludedFiles)) {
      return { valid: false, error: 'Excluded files must be an array' };
    }

    if (excludedFiles.length > 1000) {
      return { valid: false, error: 'Too many excluded files (max 1000)' };
    }

    if (!excludedFiles.every(f => typeof f === 'string' && f.length < 500)) {
      return { valid: false, error: 'Invalid excluded file entries' };
    }
  }

  return { valid: true };
}

// Enhanced error handling
function handleAsyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error(`API Error in ${req.path}:`, error);

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const errorMessage = isDevelopment ? error.message : 'Internal server error';

      res.status(500).json({
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
  };
}

// API Routes with async operations and better error handling
app.get('/api/health', handleAsyncRoute(async (req, res) => {
  let stagedCount = 0;
  let unstagedCount = 0;

  try {
    const stagedFiles = await executeGitCommand('diff-cached-names');
    stagedCount = stagedFiles.trim() ? stagedFiles.trim().split('\n').filter(f => f.length > 0).length : 0;
  } catch (error) {
    console.warn('Failed to get staged files count:', error.message);
  }

  try {
    const unstagedFiles = await executeGitCommand('status-porcelain');
    const unstagedLines = unstagedFiles.trim().split('\n').filter(line =>
      line.length > 0 && (line.startsWith(' M') || line.startsWith('??'))
    );
    unstagedCount = unstagedLines.length;
  } catch (error) {
    console.warn('Failed to get unstaged files count:', error.message);
  }

  const totalChanges = stagedCount + unstagedCount;

  res.json({
    status: 'healthy',
    stagedCount,
    unstagedCount,
    totalChanges,
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    version: '1.0.0'
  });
}));

app.get('/api/summary', handleAsyncRoute(async (req, res) => {
  try {
    const stats = await executeGitCommand('diff-cached-stat');
    res.json({
      stats: stats.trim(),
      generated: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to get diff stats:', error.message);
    res.json({
      stats: '',
      error: 'No staged changes found'
    });
  }
}));

app.get('/api/staged-files', handleAsyncRoute(async (req, res) => {
  try {
    const output = await executeGitCommand('diff-cached-names');
    const files = output.trim() ? output.trim().split('\n').filter(f => f.length > 0) : [];

    // Get file statuses to determine if files are deleted
    let fileStatuses = {};
    try {
      const statusOutput = await executeGitCommand('diff-cached', ['--name-status']);
      const statusLines = statusOutput.trim().split('\n').filter(line => line.length > 0);
      statusLines.forEach(line => {
        const [status, filename] = line.split('\t');
        if (filename) {
          fileStatuses[filename] = status;
        }
      });
    } catch (error) {
      // Ignore error, fileStatuses will remain empty
    }

    // Check for unstaged deleted files
    let deletedFiles = [];
    try {
      const deletedOutput = await executeGitCommand('status-porcelain');
      const deletedLines = deletedOutput.trim().split('\n').filter(line =>
        line.length > 0 && (line.startsWith(' D') || line.startsWith('AD'))
      );
      deletedFiles = deletedLines.map(line => line.substring(line.startsWith('AD') ? 3 : 3));
    } catch (error) {
      // Ignore error, deletedFiles will remain empty
    }

    res.json({
      files,
      count: files.length,
      fileStatuses,
      deletedFiles,
      deletedCount: deletedFiles.length,
      timestamp: new Date().toISOString(),
      hasUnstagedDeletions: deletedFiles.length > 0
    });
  } catch (error) {
    console.warn('Failed to get staged files:', error.message);
    res.json({
      files: [],
      count: 0,
      fileStatuses: {},
      deletedFiles: [],
      deletedCount: 0,
      error: 'No staged files found'
    });
  }
}));

app.get('/api/file-diff', handleAsyncRoute(async (req, res) => {
  const { file } = req.query;
  const validation = validateFileRequest(file);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const diff = await executeGitCommand('diff-cached', ['--', file]);

    // If no diff content, the file doesn't exist or has no changes
    if (!diff || diff.trim().length === 0) {
      return res.status(400).json({
        error: 'File not found in staged changes',
        file,
        timestamp: new Date().toISOString()
      });
    }

    const parsedDiff = DiffService.parseDiff(diff);

    res.json({
      diff,
      parsedDiff,
      file,
      timestamp: new Date().toISOString(),
      size: diff.length
    });
  } catch (error) {
    console.error(`Error getting diff for file ${file}:`, error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const errorMessage = isDevelopment ? error.message : 'File not found or inaccessible';

    res.status(400).json({
      error: errorMessage,
      file,
      timestamp: new Date().toISOString()
    });
  }
}));

// Simple request caching
const requestCache = new Map();

function getCacheKey(req) {
  return `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
}

function cacheMiddleware(ttlSeconds = 30) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = getCacheKey(req);
    const cached = requestCache.get(key);

    if (cached && (Date.now() - cached.timestamp) < (ttlSeconds * 1000)) {
      console.log(`💨 Cache hit: ${key}`);
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode === 200) {
        requestCache.set(key, {
          data,
          timestamp: Date.now()
        });

        // Clean old cache entries periodically
        if (requestCache.size > 100) {
          const now = Date.now();
          for (const [k, v] of requestCache.entries()) {
            if (now - v.timestamp > 300000) { // 5 minutes
              requestCache.delete(k);
            }
          }
        }
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

// Apply caching to GET routes
app.use('/api/health', cacheMiddleware(10));
app.use('/api/summary', cacheMiddleware(30));
app.use('/api/staged-files', cacheMiddleware(15));

app.post('/api/log-comment', handleAsyncRoute(async (req, res) => {
  const { type, file, lineNumber, comment } = req.body;

  // Validate input
  if (!type || !file || !comment) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, file, and comment are required',
      timestamp: new Date().toISOString()
    });
  }

  // Additional validation
  if (typeof type !== 'string' || typeof file !== 'string' || typeof comment !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid field types: all fields must be strings',
      timestamp: new Date().toISOString()
    });
  }

  // Sanitize and limit log content
  const sanitizedFile = file.replace(/[^\w\-_./]/g, '').substring(0, 100);
  const sanitizedComment = comment.substring(0, 200);
  const sanitizedType = type.replace(/[^\w\-_]/g, '').substring(0, 20);

  console.log(`💬 ${sanitizedType}: ${sanitizedFile}${lineNumber ? ` Line ${lineNumber}` : ''}: "${sanitizedComment}"`);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    logged: true
  });
}));

// Export rate limiting - more restrictive
const exportRateLimit = createRateLimit(CONFIG.rateLimit.exportMax, CONFIG.rateLimit.windowMs);

app.post('/api/export-for-ai', exportRateLimit, handleAsyncRoute(async (req, res) => {
  // Validate request body
  const validation = validateExportRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
      timestamp: new Date().toISOString()
    });
  }

  const { comments = {}, lineComments = {}, excludedFiles = [] } = req.body;

  console.log('🚀 Export for AI Review request received');
  console.log('📋 Excluded files:', excludedFiles.length);
  console.log('💬 File comments:', Object.keys(comments).length);
  console.log('🔍 Line comments:', Object.keys(lineComments).length);

  try {
    // Get all staged files with async operation
    const stagedOutput = await executeGitCommand('diff-cached-names');
    const stagedFiles = stagedOutput.trim() ?
      stagedOutput.trim().split('\n').filter(f => f.length > 0) : [];

    // Check for unstaged deleted files
    let deletedFiles = [];
    try {
      const deletedOutput = await executeGitCommand('status-porcelain');
      const deletedLines = deletedOutput.trim().split('\n').filter(line =>
        line.length > 0 && line.startsWith(' D')
      );
      deletedFiles = deletedLines.map(line => line.substring(3));
    } catch (error) {
      // Ignore error, deletedFiles will remain empty
    }

    console.log('📁 All staged files:', stagedFiles.length);
    if (deletedFiles.length > 0) {
      console.log(`ℹ️  Note: ${deletedFiles.length} unstaged deleted file(s) found`);
    }

    if (stagedFiles.length === 0 && deletedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No staged files found. Please run "git add ." first.',
        timestamp: new Date().toISOString()
      });
    } else if (stagedFiles.length === 0 && deletedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Found ${deletedFiles.length} deleted file(s) but they are not staged. Use "git add -A" to stage all changes including deletions.`,
        deletedFiles: deletedFiles,
        suggestion: 'Run "git add -A" to stage all changes, then try again.',
        timestamp: new Date().toISOString()
      });
    }

    // Filter out excluded files
    const includedFiles = stagedFiles.filter(file => {
      const isExcluded = excludedFiles && excludedFiles.includes(file);
      if (isExcluded) {
        console.log(`⏭️  Excluding: ${file}`);
      }
      return !isExcluded;
    });

    console.log('✅ Files to include:', includedFiles.length);
    console.log('📊 Excluded count:', stagedFiles.length - includedFiles.length);

    // Generate AI review content
    const timestamp = new Date().toLocaleString();
    let content = `# 🔍 Code Review - ${timestamp}

**Project:** AI Visual Code Review
**Generated by:** AI Visual Code Review v1.0.0

## 📊 Change Summary

\`\`\`
${await executeGitCommand('diff-cached-stat')}
\`\`\`

## 📝 Files Changed (${includedFiles.length}/${stagedFiles.length} selected)

`;

    if (excludedFiles && excludedFiles.length > 0) {
      content += `### ⏭️ Excluded Files
The following files were excluded from this review:
${excludedFiles.map(f => `- \`${f}\``).join('\n')}

`;
    }

    let processedCount = 0;
    const errors = [];

    // Process each included file with better error handling
    for (const file of includedFiles) {
      try {
        console.log(`✅ Processing: ${file}`);

        // Get file status using GitStatusParser
        let fileStatus = 'M '; // default to Modified
        try {
          const statusOutput = await executeGitCommand('diff-cached', ['--name-status']);
          const statusLines = statusOutput.trim().split('\n');
          for (const line of statusLines) {
            const [status, filename] = line.split('\t');
            if (filename === file) {
              fileStatus = status;
              break;
            }
          }
        } catch (error) {
          // Ignore error, use defaults
        }

        // Parse status using comprehensive GitStatusParser
        const statusInfo = GitStatusParser.parse(fileStatus);

        // Add appropriate header using parser
        content += `\n${GitStatusParser.getMarkdownHeader(fileStatus, file)}\n\n`;

        // Add status message if needed
        const statusMessage = GitStatusParser.getStatusMessage(fileStatus);
        if (statusMessage) {
          content += `${statusMessage}\n\n`;
        }

        // Add file type context with enhanced detection (only if not deleted)
        if (!statusInfo.isDeleted) {
          const ext = path.extname(file).toLowerCase();
          const fileTypeMap = {
            '.tsx': '**Type:** TypeScript React Component ⚛️\n\n',
            '.ts': '**Type:** TypeScript Source File 📘\n\n',
            '.js': '**Type:** JavaScript Source File 🟨\n\n',
            '.jsx': '**Type:** React Component (JavaScript) ⚛️\n\n',
            '.json': '**Type:** Configuration/Data File 📋\n\n',
            '.md': '**Type:** Documentation 📖\n\n',
            '.css': '**Type:** Stylesheet 🎨\n\n',
            '.scss': '**Type:** Sass Stylesheet 🎨\n\n',
            '.html': '**Type:** HTML Template 🌐\n\n',
            '.py': '**Type:** Python Script 🐍\n\n',
            '.sh': '**Type:** Shell Script 💻\n\n'
          };
          content += fileTypeMap[ext] || '**Type:** Source File 📄\n\n';
        }

        // Add file comment if exists
        if (comments && comments[file]) {
          content += `**💭 Review Comment:**\n${comments[file]}\n\n`;
        }

        // Get diff - handle all file status types
        try {
          const diff = await executeGitCommand('diff-cached', ['--', file]);
          content += DiffService.generateEnhancedDiffMarkdown(diff);
        } catch (diffError) {
          // For deleted files, this is expected - they don't have diff content
          if (statusInfo.isDeleted) {
            console.log(`ℹ️  File ${file} is deleted - no diff content to show`);
            content += `**Note:** This file was completely removed and has no diff content to display.\n\n`;
          } else {
            throw diffError;
          }
        }

        processedCount++;
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errors.push(file);
        content += `**❌ Error:** Could not load diff for \`${file}\` - ${error.message}\n\n`;
      }
    }

    // Add line comments section if any exist
    if (lineComments && Object.keys(lineComments).length > 0) {
      content += `## 🔍 Line-by-Line Comments

`;
      Object.entries(lineComments).forEach(([lineId, comment]) => {
        content += `- **${lineId}:** ${comment}\n`;
      });
      content += '\n';
    }

    // Enhanced review checklist
    content += `---

## 🤖 AI Review Checklist

Please review these changes for:

### 🔍 Code Quality
- [ ] **Linting Compliance**: No unused imports/variables, proper formatting
- [ ] **Type Safety**: Proper typing throughout (TypeScript/JSDoc)
- [ ] **Best Practices**: Framework-specific conventions and patterns
- [ ] **Performance**: Efficient algorithms, proper memoization
- [ ] **Documentation**: Clear comments and function descriptions

### 🐛 Potential Issues
- [ ] **Runtime Errors**: Type mismatches, null/undefined handling
- [ ] **Logic Bugs**: Incorrect calculations, edge cases
- [ ] **Memory Leaks**: Cleanup in lifecycle methods, event listeners
- [ ] **Error Handling**: Proper try-catch blocks, user feedback
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen readers

### 🔒 Security & Data
- [ ] **Input Validation**: Sanitization, XSS prevention, SQL injection
- [ ] **Authentication**: Proper access controls and permissions
- [ ] **Privacy**: No sensitive data exposure in logs/client
- [ ] **Dependencies**: Updated packages, vulnerability checks

### 📱 UX/UI
- [ ] **Responsive Design**: Mobile/desktop/tablet compatibility
- [ ] **Loading States**: Proper feedback during async operations
- [ ] **Error Messages**: User-friendly error handling and recovery
- [ ] **Performance**: Fast loading, smooth animations

### 💡 Suggestions & Improvements
Please provide specific feedback on:
1. Code organization and structure improvements
2. Performance optimization opportunities
3. Security considerations and hardening
4. Testing coverage and strategies
5. Documentation and maintainability

---
*Generated by AI Visual Code Review v1.0.0*
*Files processed: ${processedCount}/${includedFiles.length} | Errors: ${errors.length} | Generated: ${new Date().toISOString()}*
`;

    // Ensure directory exists and write file
    const filePath = path.join(process.cwd(), 'AI_REVIEW.md');
    writeFileSync(filePath, content, 'utf8');

    console.log('✅ AI_REVIEW.md generated successfully');
    console.log(`📊 Final stats: ${processedCount} files processed, ${excludedFiles?.length || 0} excluded, ${errors.length} errors`);

    res.json({
      success: true,
      file: 'AI_REVIEW.md',
      filesProcessed: processedCount,
      totalFiles: stagedFiles.length,
      excludedCount: excludedFiles?.length || 0,
      excludedFiles: excludedFiles || [],
      errors: errors,
      timestamp: new Date().toISOString(),
      contentLength: content.length
    });

  } catch (error) {
    console.error('❌ Export for AI failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI review',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}));

// Individual file export endpoint with async operations
app.post('/api/export-individual-reviews', exportRateLimit, handleAsyncRoute(async (req, res) => {
  // Validate request body
  const validation = validateExportRequest(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
      timestamp: new Date().toISOString()
    });
  }

  const { comments = {}, lineComments = {}, excludedFiles = [] } = req.body;

  console.log('📁 Individual Export request received');
  console.log('📋 Excluded files:', excludedFiles.length);
  console.log('💬 File comments:', Object.keys(comments).length);

  try {
    // Get all staged files with async operation
    const stagedOutput = await executeGitCommand('diff-cached-names');
    const stagedFiles = stagedOutput.trim() ?
      stagedOutput.trim().split('\n').filter(f => f.length > 0) : [];

    // Check for unstaged deleted files
    let deletedFiles = [];
    try {
      const deletedOutput = await executeGitCommand('status-porcelain');
      const deletedLines = deletedOutput.trim().split('\n').filter(line =>
        line.length > 0 && line.startsWith(' D')
      );
      deletedFiles = deletedLines.map(line => line.substring(3));
    } catch (error) {
      // Ignore error, deletedFiles will remain empty
    }

    if (stagedFiles.length === 0 && deletedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No staged files found. Please run "git add ." first.',
        timestamp: new Date().toISOString()
      });
    } else if (stagedFiles.length === 0 && deletedFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Found ${deletedFiles.length} deleted file(s) but they are not staged. Use "git add -A" to stage all changes including deletions.`,
        deletedFiles: deletedFiles,
        suggestion: 'Run "git add -A" to stage all changes, then try again.',
        timestamp: new Date().toISOString()
      });
    }

    // Filter out excluded files
    const includedFiles = stagedFiles.filter(file => {
      const isExcluded = excludedFiles && excludedFiles.includes(file);
      if (isExcluded) {
        console.log(`⏭️  Excluding: ${file}`);
      }
      return !isExcluded;
    });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const reviewDir = `code-reviews-${timestamp}`;

    // Create directory
    const reviewPath = path.join(process.cwd(), reviewDir);
    try {
      mkdirSync(reviewPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw new Error(`Failed to create review directory: ${error.message}`);
      }
    }

    let filesCreated = 0;
    const errors = [];

    // Create individual review file for each included file
    for (const file of includedFiles) {
      try {
        const safeName = file.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const reviewFileName = `review-${safeName}.md`;
        const reviewFilePath = path.join(reviewPath, reviewFileName);

        // Enhanced file type detection
        const ext = path.extname(file).toLowerCase();
        const fileTypeMap = {
          '.tsx': 'TypeScript React Component ⚛️',
          '.ts': 'TypeScript Source File 📘',
          '.js': 'JavaScript Source File 🟨',
          '.jsx': 'React Component (JavaScript) ⚛️',
          '.json': 'Configuration/Data File 📋',
          '.md': 'Documentation 📖',
          '.css': 'Stylesheet 🎨',
          '.scss': 'Sass Stylesheet 🎨',
          '.html': 'HTML Template 🌐',
          '.py': 'Python Script 🐍',
          '.sh': 'Shell Script 💻'
        };

        let content = `# 📄 Code Review: \`${file}\`

**Generated:** ${new Date().toLocaleString()}
**Project:** AI Visual Code Review
**Review Type:** Individual File Analysis

## 📊 File Information

**Type:** ${fileTypeMap[ext] || 'Source File 📄'}
**Path:** \`${file}\`
**Extension:** ${ext || 'None'}

`;

        // Add file comment if exists
        if (comments && comments[file]) {
          content += `## 💭 Review Comment

${comments[file]}

`;
        }

        // Add line comments if exist for this file
        const fileLineComments = Object.entries(lineComments || {})
          .filter(([lineId]) => lineId.includes(file.replace(/[^a-zA-Z0-9]/g, '_')));

        if (fileLineComments.length > 0) {
          content += `## 🔍 Line Comments

`;
          fileLineComments.forEach(([lineId, comment]) => {
            content += `- **${lineId}:** ${comment}\n`;
          });
          content += '\n';
        }

        // Add diff with enhanced line numbers using DiffService
        try {
          const diff = await executeGitCommand('diff-cached', ['--', file]);
          content += `## 📝 Changes

`;
          content += DiffService.generateEnhancedDiffMarkdown(diff);
        } catch (error) {
          console.error(`Error loading diff for ${file}:`, error);
          errors.push(file);
          content += `## ❌ Error

Could not load diff for \`${file}\`: ${error.message}

`;
        }

        // Enhanced review template
        content += `## 🤖 Comprehensive Review Checklist

### ✅ Code Quality & Standards
- [ ] **Syntax & Formatting**: Consistent indentation, proper spacing
- [ ] **Naming Conventions**: Clear, descriptive variable/function names
- [ ] **Code Structure**: Logical organization, appropriate function size
- [ ] **Documentation**: Clear comments explaining complex logic
- [ ] **Type Safety**: Proper typing (if applicable)

### 🔍 Logic & Functionality
- [ ] **Algorithm Correctness**: Logic implements requirements correctly
- [ ] **Edge Case Handling**: Boundary conditions properly addressed
- [ ] **Error Handling**: Appropriate try-catch blocks and error messages
- [ ] **Performance**: Efficient algorithms, no unnecessary loops
- [ ] **Memory Management**: Proper cleanup, no memory leaks

### 🐛 Potential Issues & Bugs
- [ ] **Runtime Errors**: No null/undefined dereferencing
- [ ] **Type Mismatches**: Consistent data types throughout
- [ ] **Race Conditions**: Proper async/await handling
- [ ] **Resource Leaks**: Event listeners, timers properly cleaned up
- [ ] **Off-by-one Errors**: Array/loop bounds correctly handled

### 🔒 Security Considerations
- [ ] **Input Validation**: User inputs properly sanitized
- [ ] **XSS Prevention**: No unsafe HTML injection
- [ ] **Authentication**: Proper access controls if applicable
- [ ] **Data Exposure**: No sensitive information in logs/client
- [ ] **Dependency Security**: No known vulnerable packages

### 📱 User Experience & Accessibility
- [ ] **Responsive Design**: Works on different screen sizes
- [ ] **Loading States**: Proper feedback during operations
- [ ] **Error Messages**: User-friendly error communication
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **Performance**: Fast loading, smooth interactions

### 💡 Improvement Suggestions

#### Code Organization
- [ ] Consider extracting complex logic into separate functions
- [ ] Evaluate if constants should be moved to configuration
- [ ] Check for code duplication opportunities

#### Performance Optimizations
- [ ] Identify opportunities for memoization
- [ ] Consider lazy loading for heavy operations
- [ ] Evaluate database query efficiency (if applicable)

#### Testing Recommendations
- [ ] Unit tests for core functionality
- [ ] Integration tests for API endpoints
- [ ] Edge case testing scenarios

#### Documentation Needs
- [ ] API documentation updates
- [ ] Code comments for complex algorithms
- [ ] README updates if public interfaces changed

### 📝 Review Notes
*Add your specific feedback, suggestions, and observations here:*

---
*Individual file review generated by AI Visual Code Review v1.0.0*
*Generated: ${new Date().toISOString()}*
`;

        writeFileSync(reviewFilePath, content, 'utf8');
        filesCreated++;
        console.log(`✅ Created: ${reviewFileName}`);

      } catch (error) {
        console.error(`❌ Error creating review for ${file}:`, error);
        errors.push(file);
      }
    }

    console.log(`📊 Individual review stats: ${filesCreated} files created, ${errors.length} errors`);

    res.json({
      success: true,
      directory: reviewDir,
      filesCreated,
      totalFiles: stagedFiles.length,
      includedFiles: includedFiles.length,
      excludedCount: excludedFiles?.length || 0,
      commentsIncluded: Object.keys(comments || {}).length,
      lineCommentsIncluded: Object.keys(lineComments || {}).length,
      errors: errors,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Individual export failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create individual reviews',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}));

// Serve the main review interface
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  if (existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.send(`
      <h1>AI Visual Code Review</h1>
      <p>Server is running but interface files are missing.</p>
      <p>Current directory: ${process.cwd()}</p>
      <p>Please ensure the public/index.html file exists.</p>
    `);
  }
});

// 404 handler for non-existent routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('🔍 AI Visual Code Review Server');
    console.log('===============================');
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('   GET  /                     - Visual review interface');
    console.log('   GET  /api/health          - Repository status');
    console.log('   GET  /api/summary         - Change statistics');
    console.log('   GET  /api/staged-files    - List of staged files');
    console.log('   POST /api/export-for-ai   - Generate AI review');
    console.log('');
    console.log('💡 Usage:');
    console.log('   1. Stage changes: git add .');
    console.log('   2. Open: http://localhost:3002');
    console.log('   3. Review and export for AI analysis');
    console.log('');
  });
}

// Add a function to reset rate limiting for tests
app.resetRateLimit = () => {
  rateLimitStore.clear();
};

module.exports = app;
