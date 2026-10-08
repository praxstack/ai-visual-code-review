const fs = require('fs');
const path = require('path');
const net = require('net');
const { execFileSync, spawn } = require('child_process');
const { browseUrl } = require('../services/serverUrl');

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

  test('browser URL follows the bind address [codex: Open the configured bind address]', () => {
    expect(browseUrl('192.168.1.10', 3002)).toBe('http://192.168.1.10:3002');
    expect(browseUrl('127.0.0.1', 3002)).toBe('http://127.0.0.1:3002');
    expect(browseUrl('0.0.0.0', 3002)).toBe('http://127.0.0.1:3002');
    expect(browseUrl('::', 3002)).toBe('http://localhost:3002');
    expect(browseUrl('::1', 3002)).toBe('http://[::1]:3002');
    expect(browseUrl('[fe80::1]', 3002)).toBe('http://[fe80::1]:3002');
    expect(browseUrl(undefined, 3002)).toBe('http://127.0.0.1:3002');
  });

  test('startup banner shows the configured bind address', async () => {
    const port = await new Promise((resolve, reject) => {
      const s = net.createServer().once('error', reject);
      s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
    });
    const env = { ...process.env, NODE_ENV: 'development', HOST: '127.0.0.1', PORT: String(port) };
    const child = spawn('node', ['server.js'], { cwd: root, env });
    try {
      const out = await new Promise((resolve, reject) => {
        let buf = '';
        const timer = setTimeout(() => reject(new Error(`no banner: ${buf}`)), 10000);
        child.stdout.on('data', d => {
          buf += d;
          if (buf.includes('2. Open:')) { clearTimeout(timer); resolve(buf); }
        });
        child.once('exit', code => { clearTimeout(timer); reject(new Error(`exited ${code}: ${buf}`)); });
      });
      expect(out).toContain(`Server running at: http://127.0.0.1:${port}`);
      expect(out).toContain(`2. Open: http://127.0.0.1:${port}`);
      expect(out).not.toContain('localhost:');
    } finally {
      child.kill('SIGTERM');
    }
  });
});
