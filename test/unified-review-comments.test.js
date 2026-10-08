const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ReviewGenerator = require('../services/ReviewGenerator');

describe('unified review includes reviewer comments [AVCR-002]', () => {
  const origCwd = process.cwd();
  let dir;
  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avcr-ur-'));
    fs.writeFileSync(path.join(dir, 'a.js'), 'const a = 1;\n');
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });
    process.chdir(dir);
  });
  afterAll(() => {
    process.chdir(origCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('file and line comments appear in AI_REVIEW.md', async () => {
    const lineId = `${'a.js'.replace(/[^a-zA-Z0-9]/g, '_')}_line_1`;
    await ReviewGenerator.generateUnifiedReview({
      includedFiles: ['a.js'],
      comments: { 'a.js': 'FILE-COMMENT-MARKER' },
      lineComments: { [lineId]: 'LINE-COMMENT-MARKER' }
    });
    const out = fs.readFileSync(path.join(dir, 'AI_REVIEW.md'), 'utf8');
    expect(out).toContain('FILE-COMMENT-MARKER');
    expect(out).toContain('LINE-COMMENT-MARKER');
  });
});
