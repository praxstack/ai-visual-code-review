const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { execFileSync } = require('child_process');
const app = require('../server');

// The web view must serve and accept comments on Next.js-style paths [review: MINOR-2].
describe('web view special-character paths', () => {
  const origCwd = process.cwd();
  let dir;
  const names = ['app/[id]/page.tsx', 'app/i/page.tsx', 'app/(group)/x.tsx', 'x$y{z}.txt'];

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avcr-web-'));
    for (const n of names) {
      fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true });
      fs.writeFileSync(path.join(dir, n), `content of ${n}\n`);
    }
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });
    process.chdir(dir);
  });
  beforeEach(() => app.resetRateLimit && app.resetRateLimit());
  afterAll(() => {
    process.chdir(origCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test.each(names)('GET /api/file-diff serves only %s', async (n) => {
    const res = await request(app).get('/api/file-diff').query({ file: n }).expect(200);
    expect(res.body.diff).toContain(`content of ${n}`);
    for (const other of names.filter(x => x !== n)) {
      expect(res.body.diff).not.toContain(`content of ${other}`);
    }
  });

  test('POST /api/export-for-ai accepts a file comment on app/[id]/page.tsx', async () => {
    await request(app)
      .post('/api/export-for-ai')
      .send({ comments: { 'app/[id]/page.tsx': 'BRACKET-COMMENT' }, lineComments: {}, excludedFiles: [] })
      .expect(200);
    expect(fs.readFileSync(path.join(dir, 'AI_REVIEW.md'), 'utf8')).toContain('BRACKET-COMMENT');
  });
});
