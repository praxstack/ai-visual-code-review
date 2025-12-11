/**
 * Rate Limiting Middleware Module
 * Thread-safe rate limiting with atomic operations
 */

const CONFIG = require('../config');

// Rate limiting store
const rateLimitStore = new Map();

/**
 * Create rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
function createRateLimit(maxRequests, windowMs) {
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
    // Clean old requests atomically
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
}

/**
 * Reset rate limiting (for testing)
 */
function resetRateLimit() {
  rateLimitStore.clear();
}

/**
 * Get rate limit store size (for monitoring)
 */
function getRateLimitStoreSize() {
  return rateLimitStore.size;
}

// Export rate limiters with default config
const generalRateLimit = createRateLimit(CONFIG.rateLimit.max, CONFIG.rateLimit.windowMs);
const exportRateLimit = createRateLimit(CONFIG.rateLimit.exportMax, CONFIG.rateLimit.windowMs);

module.exports = {
  createRateLimit,
  resetRateLimit,
  getRateLimitStoreSize,
  generalRateLimit,
  exportRateLimit
};
