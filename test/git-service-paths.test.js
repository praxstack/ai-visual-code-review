const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const GitService = require('../services/GitService');

describe('GitService special-character paths [AVCR-001]', () => {
  const origCwd = process.cwd();
  let dir;
  // Siblings are chosen so that, read as globs, one name matches another:
  // "app/[id]/page.tsx" globs app/i/page.tsx and app/d/page.tsx; "a*b.txt" and "a?b.txt" glob aXb.txt.
  const names = [
    'app/[id]/page.tsx', 'app/i/page.tsx', 'app/d/page.tsx',
    'a*b.txt', 'a?b.txt', 'aXb.txt',
    'a(b)/c.txt', 'x$y{z}.txt', 'plain.txt'
  ];

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avcr-gs-'));
    const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'pipe' });
    git('init', '-q');
    for (const n of names) {
      fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true });
      fs.writeFileSync(path.join(dir, n), `content of ${n}\n`);
    }
    git('add', '-A');
    process.chdir(dir);
  });
  afterAll(() => {
    process.chdir(origCwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test.each(names)('getDiffForFile returns only the diff for %s', async (n) => {
    const diff = await GitService.getDiffForFile(n);
    expect(diff).toContain(`content of ${n}`);
    for (const other of names.filter(x => x !== n)) {
      expect(diff).not.toContain(`content of ${other}`);
    }
  });

  test.each([':/', ':(exclude)plain.txt', ':!plain.txt', ':^plain.txt', ':(glob)*'])(
    'magic pathspec %s is rejected', async (spec) => {
      await expect(GitService.getDiffForFile(spec)).rejects.toThrow(/Magic pathspecs/);
      await expect(GitService.execute('diff-cached', ['--', spec])).rejects.toThrow(/Magic pathspecs/);
    });

  test('a path that is not staged returns an empty diff, not other files', async () => {
    expect(await GitService.getDiffForFile('app/[x]/page.tsx')).toBe('');
    expect(await GitService.getDiffForFile('a*')).toBe('');
  });
});
