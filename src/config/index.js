/**
 * Configuration Module
 * Centralized configuration management for AI Visual Code Review
 */

const PORT = process.env.PORT || 3002;

const CONFIG = {
  server: {
    port: PORT,
    requestTimeout: 30000,
    maxRequestSize: '10mb',
    // CR-003: HTTPS Configuration
    https: {
      enabled: process.env.HTTPS_ENABLED === 'true',
      keyPath: process.env.HTTPS_KEY_PATH || './certs/key.pem',
      certPath: process.env.HTTPS_CERT_PATH || './certs/cert.pem'
    }
  },
  git: {
    timeout: 15000,
    maxFileSize: 10000,
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    exportMax: 10 // 10 exports per window
  },
  security: {
    allowedOrigins: [
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3002',
      'https://127.0.0.1:3002'
    ]
  },
  cache: {
    maxSize: 100,
    ttlMs: 300000 // 5 minutes
  }
};

module.exports = CONFIG;
