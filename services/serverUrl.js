// Bind to loopback by default; the server is unauthenticated. Set HOST=0.0.0.0 (e.g. in Docker) to expose it.
const DEFAULT_HOST = '127.0.0.1';

/**
 * The address server.js binds to.
 * @param {Object} env - process.env
 * @returns {string}
 */
function resolveHost(env) {
  return env.HOST || DEFAULT_HOST;
}

/**
 * URL a local browser should open for a server bound to `host`. Wildcard binds have no
 * address of their own, so they map to loopback; a concrete address is used as is.
 * @param {string} host
 * @param {number|string} port
 * @returns {string}
 */
function browseUrl(host, port) {
  let h = String(host || DEFAULT_HOST).replace(/^\[(.*)\]$/, '$1');
  if (h === '0.0.0.0') h = '127.0.0.1';
  else if (h === '::') h = 'localhost';
  return `http://${h.includes(':') ? `[${h}]` : h}:${port}`;
}

module.exports = { DEFAULT_HOST, resolveHost, browseUrl };
