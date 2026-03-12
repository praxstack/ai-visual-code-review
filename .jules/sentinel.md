## 2024-03-03 - [Fix Command Injection Vulnerabilities in Node.js Execution]
**Vulnerability:** Execution of dynamic arguments in `child_process.execSync` allowed arbitrary command injection.
**Learning:** `execSync` executes commands via the shell, which evaluates metacharacters (e.g., `;`, `|`, `&&`) and allows an attacker to execute arbitrary commands if input is not properly sanitized.
**Prevention:** Use `child_process.execFileSync` or `spawnSync` with an array of arguments to execute commands directly without a shell, which naturally prevents command injection since arguments are passed verbatim to the executable.
## 2026-03-12 - [Information Disclosure in Fallback Error Response]
**Vulnerability:** The server leaked its internal directory path (`process.cwd()`) to the client when rendering the fallback error page for missing `index.html`.
**Learning:** Returning internal system details like paths, even in simple fallback error pages intended for developers, poses a security risk in production environments as it provides attackers with structural information about the server host.
**Prevention:** Avoid returning internal state such as `process.cwd()`, stack traces, or environment details in responses sent to the client. Use generic error messages that guide users without leaking implementation specifics.
