## 2024-03-03 - [Fix Command Injection Vulnerabilities in Node.js Execution]
**Vulnerability:** Execution of dynamic arguments in `child_process.execSync` allowed arbitrary command injection.
**Learning:** `execSync` executes commands via the shell, which evaluates metacharacters (e.g., `;`, `|`, `&&`) and allows an attacker to execute arbitrary commands if input is not properly sanitized.
**Prevention:** Use `child_process.execFileSync` or `spawnSync` with an array of arguments to execute commands directly without a shell, which naturally prevents command injection since arguments are passed verbatim to the executable.

## 2024-10-18 - [Fix DOM-based XSS in Visual Review Interface]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `public/index.html` via unescaped git output.
**Learning:** Even in a local development tool, rendering raw output from commands like `git diff` into the DOM is dangerous because a cloned repository could contain files with malicious names (e.g., `<script>...</script>`). This allows an attacker to execute arbitrary scripts in the reviewer's browser.
**Prevention:** Always wrap dynamic external data, including file names and error messages, in `escapeHtml()` before interpolating them into `.innerHTML`. Ensure correct JS string and HTML attribute escaping (like replacing quotes) if the variables are rendered inside inline JS handlers or tag attributes.