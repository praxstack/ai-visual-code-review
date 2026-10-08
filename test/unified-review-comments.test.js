const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ReviewGenerator = require('../services/ReviewGenerator');

// Use the web client's own lineIdPrefix() from public/index.html, so the test breaks if
// client and server encodings drift apart.
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const clientFn = html.match(/function lineIdPrefix\(filename\) \{([\s\S]*?)\n\s*\}/);
// eslint-disable-next-line no-new-func
const clientLineIdPrefix = new Function('filename', clientFn[1]);
const lineIdFor = (file, chunk, line) => `${clientLineIdPrefix(file)}_${chunk}_${line}`;

// Export text from the first mention of `file` up to the first mention of `nextFile`.
function sectionFor(out, file, nextFile) {
  const start = out.indexOf(`\`${file}\``);
  const end = nextFile ? out.indexOf(`\`${nextFile}\``, start + 1) : out.length;
  return out.slice(start, end);
}

describe('unified review includes reviewer comments [AVCR-002]', () => {
  const origCwd = process.cwd();
  let dir;
  // Pairs that collided under the old lossy encoding: a-b.js/a_b.js, src/x.js/src_x.js.
  const files = ['a.js', 'data.js', 'index.js', 'src/index.js', 'a-b.js', 'a_b.js', 'src/x.js', 'src_x.js'];
  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avcr-ur-'));
    for (const f of files) {
      fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
      fs.writeFileSync(path.join(dir, f), `// ${f}\n`);
    }
    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });
    process.chdir(dir);
  });
  afterAll(() => {
    process.chdir(origCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const lineComments = Object.fromEntries(files.map(f => [lineIdFor(f, 0, 1), `LINE-${f}`]));

  test('file and line comments appear in AI_REVIEW.md', async () => {
    await ReviewGenerator.generateUnifiedReview({
      includedFiles: ['a.js'],
      comments: { 'a.js': 'FILE-COMMENT-MARKER' },
      lineComments: { [lineIdFor('a.js', 0, 1)]: 'LINE-COMMENT-MARKER' }
    });
    const out = fs.readFileSync(path.join(dir, 'AI_REVIEW.md'), 'utf8');
    expect(out).toContain('FILE-COMMENT-MARKER');
    expect(out).toContain('LINE-COMMENT-MARKER');
  });

  test('unified export puts each line comment under its own file only [review: MINOR-1]', async () => {
    await ReviewGenerator.generateUnifiedReview({ includedFiles: files, lineComments });
    const out = fs.readFileSync(path.join(dir, 'AI_REVIEW.md'), 'utf8');
    for (const f of files) {
      expect(out.split(`LINE-${f}\n`).length - 1).toBe(1);
    }
    files.forEach((f, i) => {
      const section = sectionFor(out, f, files[i + 1]);
      expect(section).toContain(`LINE-${f}\n`);
      for (const other of files.filter(x => x !== f)) {
        expect(section).not.toContain(`LINE-${other}\n`);
      }
    });
  });

  test('a comment on an excluded file does not leak into a same-looking included file [codex P2]', async () => {
    await ReviewGenerator.generateUnifiedReview({
      includedFiles: ['a_b.js'], excludedFiles: ['a-b.js'],
      lineComments: { [lineIdFor('a-b.js', 0, 1)]: 'EXCLUDED-SECRET' }
    });
    expect(fs.readFileSync(path.join(dir, 'AI_REVIEW.md'), 'utf8')).not.toContain('EXCLUDED-SECRET');
  });

  test('client and server agree on the lineId prefix', () => {
    for (const f of files.concat(['app/[id]/page.tsx', 'x$y{z}.txt', 'naïve.js'])) {
      expect(ReviewGenerator.lineIdPrefix(f)).toBe(clientLineIdPrefix(f));
      expect(ReviewGenerator.lineIdPrefix(f)).toMatch(/^[a-zA-Z0-9_]+$/);
    }
  });

  test('per-file export puts each line comment under its own file only [review: MINOR-1]', async () => {
    for (const f of files) {
      const content = await ReviewGenerator.generateFileContent(f, undefined, lineComments);
      expect(content).toContain(`LINE-${f}\n`);
      for (const other of files.filter(x => x !== f)) {
        expect(content).not.toContain(`LINE-${other}\n`);
      }
    }
  });
});
