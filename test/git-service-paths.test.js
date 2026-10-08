const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const GitService = require('../services/GitService');

describe('GitService special-character paths [AVCR-001]', () => {
  const origCwd = process.cwd();
  let dir;
  const names = ['app/[id]/page.tsx', 'a(b)/c.txt', 'x$y{z}.txt', 'plain.txt'];

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
});
