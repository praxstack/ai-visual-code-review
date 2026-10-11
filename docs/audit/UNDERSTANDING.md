# UNDERSTANDING — ai-visual-code-review

Audit date: 2026-10-02. Repo: GitHub `praxstack/ai-visual-code-review`, PUBLIC, default branch `main`, HEAD `c4d6472`, working tree clean before and after this pass).

Everything below was re-derived from the repo in this pass. Leftovers from the interrupted earlier run were not trusted; where I re-ran something the command is given. Line numbers refer to HEAD `c4d6472`.

---

## 1. What it is

A local developer tool that turns **staged git changes** into (a) a GitHub-style dark web UI for reading diffs and attaching comments, and (b) a markdown file (`AI_REVIEW.md`, or one file per source file) meant to be pasted into ChatGPT/Claude for review. There is no AI call anywhere in the code: "AI integration" means "generates markdown plus a checklist for you to hand to an AI".

Three front ends share one small service layer:

| Front end | Entry | State |
|---|---|---|
| Web UI + JSON API | `server.js` (Express 4), `public/index.html` | Works, with serious UI and export defects (section 9) |
| CLI | `bin/ai-review.js` → `scripts/export-ai-review.js` | Works, with defects on special paths and size limits |
| VS Code extension | `vscode-extension/` (TypeScript) | Compiles; functionally a stub |

Published on npm as `ai-visual-code-review` (`latest` = 2.4.1, published 2025-12-15). `main` is 40 app-code commits ahead of that publish, including the security fixes.

Maturity: small working prototype with heavy "enterprise-grade / production-ready" marketing in the docs. Real application code is about 3,000 lines of JS plus a 1,756-line single-file web page and about 1,150 lines of TypeScript.

## 2. Why the repo has 11,679 tracked files

`git ls-files | wc -l` = 11,679. Only about 170 belong to the product.

| Path | Tracked files | Bytes | What it is |
|---|---|---|---|
| `.claude/skills/` | 5,267 | 50.3 MB | 26 vendored third-party agent-skill packs |
| `.agents/skills/` | 5,267 | 50.3 MB | Byte-identical second copy (`diff -rq` differs only in `README.md`) |
| `.cursor/skills/` | 976 | small | 970 relative symlinks into `.claude/skills` (mode 120000) |
| `.cursor/agents`, `.claude/agents`, `.codex/agents` | 21 | small | 7 persona files × 3 harnesses |
| everything else | ~148 | ~2.4 MB | the product, docs, plans |

Total tracked payload is about 103 MB; 99% is vendored agent tooling added in August 2026 (PRs #35–#42). It contains 710 `.py`, 298 `.mjs`, 144 `.sh` third-party scripts, twice. Only `spec-kit` is pinned to a tag (`scripts/install-agent-skills.sh` `SPECKIT_TAG="v1.0.1"`); every other pack is cloned from the upstream default branch with `git clone --depth 1` and no commit SHA is recorded anywhere (0 forty-hex strings in `docs/agent-skills.md`, `docs/agent-skill-packs.md`, `.claude/skills/README.md`).

Other things committed that should not be: `AI_REVIEW_QUICK.md` (196 KB) and `AI_REVIEW_WEB.md` (241 KB) — generated output from 2025-10-11; `vscode-extension/out/` (compiled JS); `vscode-extension/ai-visual-code-review-1.0.0.vsix` (321 KB, stale); `test-output.txt`; `test_cors_logic.js`; both `package-lock.json` and `pnpm-lock.yaml` at root and in `vscode-extension/`.

The npm package is not polluted by this: `package.json` `files` whitelists `bin/ public/ services/ scripts/ src/ server.js README.md LICENSE` (the published 2.4.1 tarball contains exactly those).

## 3. Documents: authoritative vs historical

| Document | Status | Notes |
|---|---|---|
| `plans/README.md` + `plans/001…009` | **Authoritative backlog** (2026-08-29) | Nine plans, all `TODO`. Accurate against HEAD; I re-verified 002, 003, 004, 005, 006, 008 |
| `AGENTS.md` | Authoritative for agent workflow | Mostly about skill packs. References `CONTEXT.md` and `docs/adr/` which do not exist |
| `CLAUDE.md`, `.claude/CLAUDE.md`, `.cursor/rules/*.mdc` | Current, tooling-only | graphify / context7 / pstack model routing |
| `openspec/config.yaml` | Current but empty | No specs or changes exist; `openspec/changes/` and `openspec/specs/` are gitignored |
| `docs/agent-skill-packs.md`, `docs/agent-skills.md`, `docs/mcp.md`, `docs/graphify.md`, `docs/openspec.md`, `docs/agents/*` | Current, tooling-only | Not about the product |
| `docs/cursor-skill-collisions.md`, `docs/praxstack-skill-collisions.md` | Generated | Rewritten every time the linker runs (and by `npm test`) |
| `ARCHITECTURE.md` | Stale (v2.3.0, Dec 2025) | Describes `src/` as live; it is dead code |
| `README.md` | Stale ("v2.0") | Wrong repo URL, missing files, undocumented/nonexistent features |
| `CHANGELOG.md` | Stale | Stops at 2.3.0; package is 2.4.1; nothing for 2.3.1, 2.4.0, 2.4.1 or the 2026 work |
| `SECURITY.md`, `SETUP.md`, `CONTRIBUTING.md`, `UNIFIED_EXPORT_GUIDE.md` | Stale | Document env vars and scripts that do not exist |
| `UPDATE_GUIDE.md` | Historical | "v1.0.3 → v1.0.4" |
| `memory-bank/*` | Historical (Dec 2025) | Says "30/30 tests", "all critical issues resolved" |
| `docs/BRD-*.md`, `docs/HLD-UI-Export-Bundle.md` | Draft / Design, never built | HTML bundle export has zero code; extension BRD phases 2–4 not started |
| `docs/07-validation/QA_REVIEW_v2.3.1.md` | Historical self-certification | "88% production ready", "DevOps 95%" — not supported by the code |
| `star-team-audit/` | Historical (Dec 2025 audit, 138 issues) | Source of the CR-/HI- ids used in CHANGELOG |
| `TEST_PLAN.md`, `TEST_RESULTS.md`, `FINAL_TEST_RESULTS.md`, `COMPREHENSIVE_TEST_SCENARIOS.md`, `NPM_SCRIPTS_ANALYSIS.md`, `TWITTER_LAUNCH_THREADS.md`, `.clinerules`, `.jules/*`, `.Jules/palette.md` | Historical | Oct 2025 launch material and bot journals |

## 4. Architecture

```
 browser (public/index.html, vanilla JS, inline script)      CLI (bin/ai-review.js)
        │ fetch /api/*                                              │ spawn / execFileSync
        ▼                                                           ▼
 server.js (Express 4.21.2, cors)  ───────────────►  scripts/export-ai-review.js
        │                                                           │
        ├── services/GitService.js      allowlisted `git` via execFile, cwd = process.cwd()
        ├── services/diffService.js     unified-diff parser + markdown formatter + path validator
        ├── services/gitStatusParser.js status code → label/icon/markdown header
        └── services/ReviewGenerator.js writes AI_REVIEW.md or code-reviews-<ts>/*.md into cwd

 src/config, src/middleware, src/utils   ← never required by anything (dead copy of server.js internals)

 vscode-extension/ (separate package)    ← own TS copies of gitService/diffService, no shared code
```

The server always operates on `process.cwd()`: you run `ai-review` inside the repo you want reviewed, and the tool's own install dir only supplies `public/` and code.

### Module map

| Path | Lines | Role |
|---|---|---|
| `server.js` | 803 | Whole HTTP app: CORS allow-list, JSON body, request logger, static, security headers, in-memory rate limiter, inline validators, 7 API routes, dead cache middleware, `app.listen` |
| `bin/ai-review.js` | 242 | CLI arg parsing; `start/serve/s` spawns `node server.js`; `quick/q` runs the export script; `--open` launches a browser |
| `scripts/export-ai-review.js` | 319 | CLI export: include/exclude glob matching, (dead) size limit, calls `ReviewGenerator` |
| `scripts/quick-ai-review.sh` | 383 | Legacy bash exporter (still shipped) |
| `services/GitService.js` | 111 | Singleton; 5 allowlisted git commands; argument filter; helpers `getStagedFiles/getDiffForFile/getDiffStats/getFileStatuses` |
| `services/diffService.js` | 156 | `parseDiff`, `formatEnhancedDiff`, `generateEnhancedDiffMarkdown`, `isValidFilePath` |
| `services/gitStatusParser.js` | 251 | Status parsing/labels |
| `services/ReviewGenerator.js` | 356 | `generateUnifiedReview`, `generateSplitReviews`, `generateFileContent`, checklist template |
| `src/**` | 458 | Dead: config, nonce-CSP middleware, rate limiter, validators, git wrapper — `grep -rn "require('./src\|require('../src"` finds nothing |
| `public/index.html` | 1,756 | CSS (lines 7–625), markup, one inline script (711–1754): `AppState`, loaders, accordion, comment modal, exports |
| `vscode-extension/src/*` | 1,157 | `extension.ts` (commands, status bar, export), `gitService.ts`, `diffService.ts`, `stagedFilesProvider.ts`, `reviewWebviewProvider.ts` |
| `scripts/install-agent-skills.sh`, `link-agent-skills.sh`, `link-praxstack-skills.sh`, `vendor-praxstack-extras.sh`, `gen-skills-index.js`, `install-cursor-native-stack.sh`, `install-agent-browser.sh` | 1,567 | Agent-tooling vendoring and Cursor Cloud boot, unrelated to the product |
| `test/*.test.js` | 6 suites | See section 7 |
| `run-tests.js`, `test/api-client.py`, `test/utils.js`, `test/sample-component.tsx`, `test/config.json` | — | Legacy runner and fixtures, not part of `npm test` |

### Entry points

- `npm start` / `node server.js` → `app.listen(PORT)` (default 3002).
- `ai-review [start|serve|s] [--port N] [--open]`, `ai-review quick|q [--include … --exclude … --max-size N --no-size-limit --split --output-dir D]`, `ai-review -v|-h`.
- `node scripts/export-ai-review.js …`, `./scripts/quick-ai-review.sh …`.
- VS Code commands `aiCodeReview.openReview | exportForAI | quickReview | refreshFiles`.
- `.cursor/environment.json` install hook: `npm ci && bash scripts/install-cursor-native-stack.sh`.

### HTTP API (all in `server.js`)

| Route | Behaviour |
|---|---|
| `GET /` | `public/index.html`, served by `express.static` (line 137) |
| `GET /api/health` | staged/unstaged counts, `cwd`, hard-coded `version: '1.0.0'` (line 320) |
| `GET /api/summary` | `git diff --cached --stat` |
| `GET /api/staged-files` | names, `fileStatuses` (from `--name-status`), unstaged deletions |
| `GET /api/file-diff?file=` | validates path, returns raw diff + parsed chunks |
| `POST /api/log-comment` | logs a sanitized line to stdout; stores nothing |
| `POST /api/export-for-ai` | writes `AI_REVIEW.md` into cwd |
| `POST /api/export-individual-reviews` | writes `code-reviews-<timestamp>/review-*.md` + `00_SUMMARY.md` into cwd |

### Main user flow (web)

1. `git add …` in the target repo, run `ai-review`.
2. Page loads `/api/health`, `/api/summary`, `/api/staged-files`; re-polls health every 30 s.
3. Click a file row → `/api/file-diff` → rendered diff; per-line comment button and file comment button open one shared modal.
4. Comments live in page memory only (`AppState.fileComments`, `AppState.lineComments`).
5. "Export for AI Review" POSTs comments + unchecked files; server writes the markdown.

## 5. Data, state, persistence, external services

- **No database, no config file, no keychain, no cookies, no localStorage** (`grep localStorage public/index.html` → none). Comments are lost on reload; README's "persistence" is not implemented.
- Server memory: `rateLimitStore` (Map ip → timestamps, never pruned for idle IPs), `requestCache` (dead).
- Files written: `AI_REVIEW.md` and `code-reviews-*/` in the reviewed repo's cwd (both gitignored in this repo, not in the user's).
- Inputs read: only `git` output for the cwd. Environment variables actually read: `PORT`, `NODE_ENV` (plus `HTTPS_*` in dead `src/config`). No `dotenv`; `.env.example` is decorative.
- External services at runtime: none. No telemetry, no network calls. Build/tooling time: npm registry; GitHub (skill vendoring); `curl | bash` installers for bun and uv, `npm i -g @fission-ai/openspec@latest`, `agent-browser`; MCP servers `npx -y @upstash/context7-mcp` and `uvx --from git+https://github.com/oraios/serena` (all unpinned) in `.cursor/mcp.json`. CI uploads to Codecov.
- No secrets required. No API keys anywhere in the product.

## 6. Build, run, test

| Purpose | Command | Result in this pass |
|---|---|---|
| Install | `npm ci` | `node_modules` present and valid (express 4.21.2, jest 29.7.0) |
| Run | `npm start` or `node bin/ai-review.js` | Starts; binds all interfaces by default (section 9.7). I ran it only with a preload that forces 127.0.0.1, on ports 39417/39418, and stopped it |
| Tests | `npm test` (jest) | 5 non-mutating suites: **99/99 pass in 2.3 s** (`npx jest test/server.test.js test/diffService.test.js test/gitStatusParser.test.js test/spaces-in-paths.test.js test/agent-skill-packs.test.js`). The sixth, `test/link-agent-skills.test.js`, was not run in the repo because it rewrites tracked files (section 9.11) |
| Lint | `npm run lint` | exit 0, 31 warnings, 0 errors |
| Build | `npm run build` | Two `echo` placeholders; nothing is built |
| Extension | `cd vscode-extension && npm ci && npm run compile` | `tsc` exit 0; compiled JS identical to tracked `out/` (only source maps differ) |
| Prod audit | `npm audit --omit=dev` | 2 high, 2 moderate (express ← body-parser / path-to-regexp / qs) |
| Docker | `docker build .` / `docker compose up` | Image has no `git`; see 9.6 |

## 7. Tests

| Suite | Tests what | Value |
|---|---|---|
| `server.test.js` | Route shapes, validator rejections, headers on `/api/health`, 429 on 15 parallel exports | Shallow: never stages a file, never checks export content; "accept valid request" accepts 200 or 400 |
| `diffService.test.js` | Parser happy paths, `isValidFilePath` | No `---`/`+++` content lines, no "\ No newline", no binary, no rename |
| `gitStatusParser.test.js` | Status table | Fine |
| `spaces-in-paths.test.js` | One real `execFile`, one `expect(true).toBe(true)` | Near zero |
| `agent-skill-packs.test.js` | Asserts vendored packs/docs exist | Tests the vendoring, not the product |
| `link-agent-skills.test.js` | Runs the linker twice with a temp `HOME` | Mutates tracked files; ~70 s per linker run |

No test covers `ReviewGenerator` output, `scripts/export-ai-review.js` pattern matching, `bin/ai-review.js`, the web page, or the extension. `jest.config.js` has coverage thresholds commented out.

## 8. Git and GitHub

- 125 commits. Authors: Prax Lannister 71, google-labs-jules[bot] 29, Cursor Agent 22, cursor[bot] 3.
- Cadence: Oct 2025 (15), Dec 2025 (12), **Mar 2026 (69 — bot PR storm: Sentinel/Bolt/Palette)**, Jun 2026 (3), Aug 2026 (26 — skill vendoring). No product change since March 2026 other than the `bee70fd` syntax repair in August.
- Tags: `v1.0.1`, `v1.0.2`, `v2.1.1` only. No GitHub releases. No tag for 2.2.0–2.4.1.
- Open issues: 0. Open PRs: 0. 42 PRs total (36 merged, 6 closed).
- CI: last 15 runs all green; latest main run `33323864552` (2026-08-30): test 18.x, test 20.x, build, docker all pass. Annotations show the lint warnings and a Node 20 action deprecation.
- Remote branches with commits not in `main` (all stale, none has an open PR):

| Branch | Ahead | Content |
|---|---|---|
| `sentinel-fix-info-disclosure-…` | 1 | Removes `process.cwd()` from the fallback HTML in `server.js` — small real fix, unmerged |
| `sentinel-security-fixes-…` | 1 | `bin/ai-review.js` + `index.html` (superseded by main) |
| `jules-bolt-perf-rate-limit-…` | 1 | Tweaks dead `src/middleware/rateLimit.js` + a 771-line AGENTS.md |
| `palette-keyboard-hints-…`, `palette-ux-improvements-…`, `palette/accessible-file-headers-…` | 1 each | More edits to the file-header markup |
| `add-agent-instructions-…`, `jules-add-agent-instructions-…` | 1 each | Agent instruction docs |
| `prax/vendor-skill-packs-3d82` | 12 | Squash-merged as #38 |
| `prax/setup-pstack-cursor-models-3d82` | 2 | PR #37 closed |

- Repo URL drift: `package.json`, README, CLI help, extension manifest, npm metadata all point at `PrakharMNNIT/ai-visual-code-review` (GitHub currently redirects it to `praxstack/…`).

### CI workflow (`.github/workflows/ci.yml`)

- `test` (Node 18.x, 20.x): `npm ci`; lint with `continue-on-error: true`; `npm test`; coverage with `continue-on-error`; `codecov/codecov-action@v3` non-blocking.
- `build`: `npm run build` (two echoes), then compiles the extension.
- `docker` (main only): builds the image, runs it, `curl -f /api/health`. This passes even though the container cannot run git, because `/api/health` uses `Promise.allSettled` and always returns 200.
- No publish/release job; `prepublishOnly: npm test` is the only gate.

## 9. Concrete problems found while reading (all re-verified unless marked)

Reproduction repo: a scratch git repo with staged `app/(marketing)/page.tsx` (A), `app/[id]/page.tsx` (M), `config/.env` (A), `docs/notes.md` (M, removes a line `-- dashes line`), `src/big.txt` (A, 12,000 lines), `src/it's.js` (A), a rename, a delete, `src/util.js` (M).

### 9.1 Paths containing `( ) [ ] { } $` get the whole staged diff
`services/GitService.js:34-41` silently filters out any argument matching `/[;&|`$(){}[\]\\]/`. `getDiffForFile('app/[id]/page.tsx')` therefore runs `git diff --cached --` with no path and returns every staged file's diff. Reproduced: the `(marketing)` section of `AI_REVIEW.md` contained 8 hunks (the file has 1) and the export was 24k lines; `src/big.txt`, which I had excluded, appeared twice. Both the CLI and the web export are affected. `plans/README.md` lists this under "considered and rejected" because `/api/file-diff` validates first, but the export paths do not validate.

### 9.2 Web page file rows are merge debris
`public/index.html:1201-1262` opens four nested `<div class="file-header">` per file with duplicated attributes and both string-built (`toggleFile('${file}', …)`, unescaped) and data-attribute handlers. Observed in a real browser against the sample repo: each path label is rendered twice per row; the diff is rendered inside the header (290 px wide in a 984 px row); a real click on diff text collapses the diff; clicking the header of an already loaded file does not collapse it (even number of handlers fire). `diff-line` rows carry two comment buttons each (lines 1472-1473). This is plan 006, still TODO. ESLint ignores this file and no test loads it.

### 9.3 Unified export drops all reviewer comments
`server.js:619-624` calls `generateUnifiedReview({ includedFiles, excludedFiles })`; `comments`/`lineComments` are validated, counted and reported back (`commentsIncluded`, line 632) but never written. Reproduced: response `commentsIncluded: 1`, `grep -c COMMENT-MARKER AI_REVIEW.md` → 0. Plan 005, TODO. The page then prints "Files processed: undefined" because it reads `data.filesProcessed` (`index.html:1578`), which the server does not send.

### 9.4 (security item)
Security-related; details kept privately by the owner.

### 9.5 Committed `.vsix` is a stale pre-fix build
Security-related; details kept privately by the owner.

### 9.6 Docker deployment cannot work
`docker run --rm node:18-alpine which git` → not found (verified). `Dockerfile` never installs git, so every git call fails and the app shows "no staged files". `docker-compose.yml` additionally sets `working_dir: /workspace` with the default `CMD ["node","server.js"]`, so it runs `/workspace/server.js` (only exists when reviewing this repo itself), and mounts the workspace `:ro`, so exports cannot be written. CI's docker job is green only because the health route cannot fail.

### 9.7 Network exposure and response headers
Security-related; details kept privately by the owner.

### 9.8 Diff parser loses lines
`services/diffService.js:36` skips any line inside a hunk that starts with `---` or `+++`. A removed line whose content starts with `--` (SQL comment, markdown rule, YAML separator, CLI flag) or an added line starting with `++` (`++i;`) vanishes from both the web view and the export, and following line numbers shift. Reproduced with `-- dashes line`: export shows 3 context lines and a phantom 4th. `\ No newline at end of file` and the trailing empty split element are also counted as context lines.

### 9.9 Export rate limiter shares one bucket with all traffic
`createRateLimit` instances (lines 156 and 543) share `rateLimitStore` keyed only by IP. With `NODE_ENV=production` (the Docker default) the export limit of 10 is compared against every request from that IP. Reproduced: 10 GETs then the first export → `429 {"current":10,"limit":10}`. The page's own 30 s health poll alone keeps the bucket above 10 forever. In the default dev mode localhost is exempt, which hides it.

### 9.10 CLI size limit is dead
`scripts/export-ai-review.js:20-27` never sets `config.maxFileSize`; line 236 compares `lineCount > undefined`. Reproduced: 12,000-line file exported, "Too large: 0", although help says "default: 10000". The legacy bash script does set `MAX_FILE_SIZE=10000`.

### 9.11 `npm test` rewrites tracked files and takes minutes
`test/link-agent-skills.test.js:11-16` runs `scripts/link-agent-skills.sh` with `cwd: ROOT`; the script prunes and recreates `.cursor/skills/*` symlinks and rewrites `docs/cursor-skill-collisions.md`. `find` order differs by filesystem, so on macOS collision winners change. Reproduced in a scratch clone: 21 tracked files modified (20 symlinks + the collisions doc), 71 s per run (the test runs it three times). The earlier interrupted run hit exactly this.

### 9.12 Agent-skill linker script and `$HOME`
Security-related; details kept privately by the owner.

### 9.13 Selection/validation breaks on ordinary paths
`DiffService.isValidFilePath` (`diffService.js:131-144`) rejects `[ ] ( ) { } $ ' "` and any path containing the substrings `.env`, `.git/`, `node_modules/`. Reproduced: `/api/file-diff?file=app/[id]/page.tsx` → 400 "potential security risk" (the UI shows nothing for Next.js route files); unchecking such a file makes both exports fail with 400 "Invalid excluded file entries". `mail.envelope.ts` would be rejected for containing `.env`.

### 9.14 Sensitive files in exports
Security-related; details kept privately by the owner.

### 9.15 Smaller verified defects
- Renames: `/api/staged-files` keys `fileStatuses` by the old name (`server.js:362` takes the 2nd tab field of `R100\told\tnew`), so the renamed file shows "Modified".
- `ReviewGenerator.js:103-104,246`: every export says `**Project:** AI Visual Code Review` and "v2.0" regardless of the repo being reviewed.
- `ReviewGenerator.js:261`: line comments are matched to files by substring of the sanitized name, so `a.js` picks up comments for `src/a.js`.
- `export-ai-review.js:191`: regex `/\/?\\*?$/` does not strip `/*`, so `--exclude "dist/*"` only excludes direct children.
- `public/index.html:6`: `<title>` is "Visual Code Review - SDE2 PrepOps" (another project's name) until JS replaces it.
- `server.js:502-504`: cache middleware registered after the routes it should wrap — never runs (plan 008).
- `server.js:4-9`: five unused imports (plan 002).

### 9.16 VS Code extension is a stub
`reviewWebviewProvider.ts:339-352`: the main panel posts `getStagedFiles` but has no `message` listener, so it shows "Loading..." forever. `extension.ts:27` registers a webview view id `aiCodeReviewWebview` that `package.json` never contributes; the activity-bar container has no views. No diff view, no comments; `exportForAI(comments, lineComments)` ignores its arguments. `simple-git` is a declared but unused dependency; settings `maxFileSize`, `excludePatterns`, `showLineNumbers` are never read; `npm test` points at a nonexistent `out/test/runTest.js`.

## 10. Roadmap vs reality

Spot-checks of "done" claims (CHANGELOG 2.0–2.3, `memory-bank/progress.md`, README):

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | HI-001 "Monolithic server.js split into modular structure" | False | `src/` is never required; `server.js` still 803 lines with its own copies |
| 2 | HI-010 "CSP nonce" | Not active | Live CSP is `'unsafe-inline'` (`server.js:145`); the HTML page gets no CSP |
| 3 | CR-003 "HTTPS configuration ready" | Not wired | Only in dead `src/config`; `server.js` has no `https`; `generate:certs` output is unused |
| 4 | HI-005 "CORS restricted to localhost" | True | `server.js:119-131` |
| 5 | HI-004 "Path length validation" | True | `server.js:165` |
| 6 | CR-002 "execSync vulnerability fixed" | True on `main`; see private notes | 9.4 |
| 7 | CR-001 "VSCode extension missing TypeScript files" | True (compiles) | but 9.16 |
| 8 | HI-003 "Duplicate AppState consolidated" | Partial | "Backward compatibility aliases" and separate `let current*` globals remain (`index.html:777-786`); `AppState.addDiff` unused |
| 9 | HI-015 "Duplicate saveComment consolidated" | True | one definition, line 1356 |
| 10 | "Request caching with TTL for GET endpoints" (2.0.0) | Dead | 9.15 |
| 11 | "Rate limiting 50/15 min, 10 exports/15 min" | Buggy | 9.9; skipped entirely for localhost in dev |
| 12 | "Security headers on all responses" | See private notes | 9.7 |
| 13 | "Line-by-line commenting with … persistence" | False | no storage of any kind |
| 14 | "Comments included in export" | False for unified, true for split | 9.3 |
| 15 | "`--max-size` default 10000" | False | 9.10 |
| 16 | "Blue Renamed badge" | False in web | 9.15 |
| 17 | "Docker support with health checks" | Non-functional | 9.6 |
| 18 | `npm run test:security` (README, SECURITY, SETUP) | Missing | not in `package.json` |
| 19 | `.ai-review.json`, `GIT_DIFF_CONTEXT`, `GIT_DIFF_ALGORITHM`, `RATE_LIMIT_*`, `CORS_ORIGINS`, `MAX_REQUEST_SIZE`, `GIT_TIMEOUT` | Not implemented | only `PORT` and `NODE_ENV` are read |
| 20 | "ADDED 20+ new npm scripts" | False | 16 scripts, 2 are echo placeholders |
| 21 | "Comprehensive tests for GitStatusParser" | True | `test/gitStatusParser.test.js` |
| 22 | README project tree (`public/review.html`) | Stale | file is `public/index.html` |

Declared roadmap: CHANGELOG "v2.3.0 planned: HTML bundle export, VSCode extension, submodule/LFS support, performance dashboard" and "v3.0.0: real-time collaboration, WebSocket, AI analysis integration, enterprise auth"; memory-bank "v2.4.0: full CSP nonce injection, route splitting". None of it exists. Version 2.4.1 shipped with none of the 2.4.0 items. The only live, accurate plan of record is `plans/` (9 items, 0 done).

Version strings disagree: `package.json` 2.4.1; `/api/health` 1.0.0; exports "v2.0"; README "v2.0"; Dockerfile label 2.3.0; ARCHITECTURE 2.3.0; extension 1.0.0.

## 11. Risk areas for the bug hunt

1. **Path handling end to end** — `GitService.execute` arg filter, `isValidFilePath`, the string-built handlers in `index.html`, quoting of non-ASCII names by `git diff --name-only` (no `-z`), renames, paths with spaces in `status --porcelain` parsing (`substring(3)`).
2. **`DiffService.parseDiff`** — `---`/`+++` content, "\ No newline", binary diffs, mode-only changes, renames with edits, line number 0 treated as falsy in `formatEnhancedDiff`.
3. **`public/index.html` accordion and comment modal** — nested headers, duplicate ids, `currentLineId` not reset when a file comment follows a cancelled line comment, comments keyed by sanitized ids that collide (`a/b.js` vs `a_b.js`).
4. **Export correctness** — comments dropped, excluded files leaking, markdown fence breakage when a diff contains ``` , hard-coded project name, concurrent `Promise.all` over hundreds of git processes.
5. **Network exposure** — details kept privately by the owner.
6. **CLI pattern matching** — `matchPattern` directory/extension/glob branches, `--include` plus default excludes interaction.
7. **Release/distribution** — published artifacts lag behind `main`; no changelog; no release automation.
8. **Agent-tooling scripts** — tests that mutate the tree, bash 4 requirement; other items details kept privately by the owner.
9. **VS Code extension** — single-repo assumption (`repositories[0]`), status bar computed once, stub webviews.
