const request = require('supertest');
const app = require('../server');

describe('AI Visual Code Review Server', () => {
  beforeEach(() => {
    // Reset rate limiting before each test
    if (app.resetRateLimit) {
      app.resetRateLimit();
    }
    // Set NODE_ENV to test to ensure proper test behavior
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Clean up after each test
    if (app.resetRateLimit) {
      app.resetRateLimit();
    }
  });
  describe('Health Check', () => {
    test('GET /api/health should return server status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('stagedCount');
      expect(response.body).toHaveProperty('unstagedCount');
      expect(response.body).toHaveProperty('totalChanges');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Summary Endpoint', () => {
    test('GET /api/summary should return change statistics', async () => {
      const response = await request(app)
        .get('/api/summary')
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('generated');
    });
  });

  describe('Staged Files', () => {
    test('GET /api/staged-files should return file list', async () => {
      const response = await request(app)
        .get('/api/staged-files')
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });

  describe('File Diff', () => {
    test('GET /api/file-diff should require file parameter', async () => {
      const response = await request(app)
        .get('/api/file-diff')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/file-diff should reject invalid file paths', async () => {
      const maliciousFiles = [
        '../../../etc/passwd',
        '/etc/passwd',
        'file<script>alert(1)</script>',
        'file|rm -rf /',
        'file;cat /etc/passwd',
        ':/',
        ':!README.md',
        ':(exclude)README.md'
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .get('/api/file-diff')
          .query({ file })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('Comment Logging', () => {
    test('POST /api/log-comment should validate required fields', async () => {
      const response = await request(app)
        .post('/api/log-comment')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    test('POST /api/log-comment should accept valid comment', async () => {
      const response = await request(app)
        .post('/api/log-comment')
        .send({
          type: 'file_comment',
          file: 'test.js',
          comment: 'This is a test comment'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('POST /api/log-comment should sanitize input', async () => {
      const response = await request(app)
        .post('/api/log-comment')
        .send({
          type: 'file_comment<script>alert(1)</script>',
          file: '../../../etc/passwd',
          comment: 'x'.repeat(1000) // Very long comment
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Export for AI', () => {
    test('POST /api/export-for-ai should validate request body', async () => {
      const response = await request(app)
        .post('/api/export-for-ai')
        .send({
          comments: 'invalid_type', // Should be object
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/export-for-ai should handle large payloads', async () => {
      const largeComments = {};
      for (let i = 0; i < 200; i++) {
        largeComments[`file${i}.js`] = 'x'.repeat(1000);
      }

      const response = await request(app)
        .post('/api/export-for-ai')
        .send({
          comments: largeComments
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/export-for-ai should accept valid request', async () => {
      const response = await request(app)
        .post('/api/export-for-ai')
        .send({
          comments: {
            'test.js': 'Test comment'
          },
          lineComments: {
            'test_js_1_1': 'Line comment'
          },
          excludedFiles: ['package-lock.json']
        });

      // Should return 400 if no staged files, or 200 if files exist
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Individual Export', () => {
    test('POST /api/export-individual-reviews should validate request', async () => {
      const response = await request(app)
        .post('/api/export-individual-reviews')
        .send({
          comments: 'invalid', // Should be object
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    test('Should apply rate limits to export endpoints', async () => {
      // Reset rate limit first
      if (app.resetRateLimit) {
        app.resetRateLimit();
      }

      const promises = [];

      // Send 15 requests quickly (more than the limit of 10)
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/export-for-ai')
            .send({})
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    test('Should set security headers on all responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['content-security-policy']).toContain('default-src \'self\'');
    });
  });

  describe('Error Handling', () => {
    test('Should handle non-existent endpoints gracefully', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    test('Should not expose internal errors in production', async () => {
      // Set NODE_ENV to production for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/file-diff')
        .query({ file: 'non-existent-file.js' });

      // Should return 400 for invalid files
      expect(response.status).toBe(400);
      expect(response.body.error).not.toContain('Internal server error');

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });
});
