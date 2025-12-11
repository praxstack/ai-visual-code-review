/**
 * Validation Utilities Module
 * Input validation and sanitization functions
 */

const path = require('path');
const DiffService = require('../../services/diffService');

/**
 * Validate file request parameter
 */
function validateFileRequest(file) {
  if (!file || typeof file !== 'string') {
    return { valid: false, error: 'File parameter is required and must be a string' };
  }

  // Path length validation (max 500 characters)
  if (file.length > 500) {
    return { valid: false, error: 'File path too long (max 500 characters)' };
  }

  // Enhanced security validation
  if (!DiffService.isValidFilePath(file)) {
    return { valid: false, error: 'Invalid file path - potential security risk' };
  }

  // Strict path traversal prevention
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

/**
 * Validate export request body
 */
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

/**
 * Sanitize string for logging
 */
function sanitizeForLog(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str.replace(/[^\w\-_./]/g, '').substring(0, maxLength);
}

module.exports = {
  validateFileRequest,
  validateExportRequest,
  sanitizeForLog
};
