const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

describe('server bind address [AVCR-005]', () => {
  const root = path.join(__dirname, '..');
  const probe = "process.env.NODE_ENV='test';console.log(require('./server').HOST)";

  test('defaults to loopback', () => {
    const env = { ...process.env }; delete env.HOST;
    expect(execFileSync('node', ['-e', probe], { cwd: root, env }).toString().trim()).toBe('127.0.0.1');
  });
  test('HOST env overrides', () => {
    const env = { ...process.env, HOST: '0.0.0.0' };
    expect(execFileSync('node', ['-e', probe], { cwd: root, env }).toString().trim()).toBe('0.0.0.0');
  });
  test('server passes HOST to listen and compose publishes loopback only', () => {
    expect(fs.readFileSync(path.join(root, 'server.js'), 'utf8')).toMatch(/app\.listen\(PORT, HOST/);
    const c = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf8');
    expect(c).not.toMatch(/- "3002:3002"/);
    expect(c).toMatch(/127\.0\.0\.1:3002:3002/);
  });
  // The server binds IPv4 only; "localhost" can resolve to ::1 first in node:18-alpine.
  test('Docker healthchecks probe 127.0.0.1, not localhost [review: MINOR-3]', () => {
    for (const f of ['Dockerfile', 'docker-compose.yml']) {
      const hc = fs.readFileSync(path.join(root, f), 'utf8').split('\n').filter(l => l.includes('/api/health'));
      expect(hc.length).toBeGreaterThan(0);
      hc.forEach(l => {
        expect(l).toContain('http://127.0.0.1:3002/api/health');
        expect(l).not.toContain('localhost');
      });
    }
  });
});
