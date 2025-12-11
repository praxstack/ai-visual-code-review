/**
 * Security Middleware Module
 * Enterprise-grade security headers and CSP with nonce support (HI-010)
 */

const crypto = require('crypto');
const CONFIG = require('../config');

/**
 * Generate a cryptographically secure nonce for CSP
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Security headers middleware with CSP nonces (HI-010 fix)
 */
function securityHeaders(req, res, next) {
  // Generate unique nonce for this request
  const nonce = generateNonce();
  res.locals.cspNonce = nonce;

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HI-010: Replace unsafe-inline with nonce-based CSP
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // HTTPS enforcement header (CR-003)
  if (CONFIG.server.https.enabled || process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Request timeout
  req.setTimeout(CONFIG.server.requestTimeout, () => {
    res.status(408).json({ error: 'Request timeout' });
  });

  next();
}

/**
 * Request logging with security monitoring
 */
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${ip}`);

  // Security monitoring for suspicious patterns
  const isLocalhost = ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip?.startsWith('::ffff:127.0.0.1');

  if (!isLocalhost || process.env.NODE_ENV === 'production') {
    const suspiciousPatterns = [
      /\.\.\//,        // Path traversal
      /[;&|`$()]/,     // Command injection
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
}

module.exports = {
  securityHeaders,
  requestLogger,
  generateNonce
};
