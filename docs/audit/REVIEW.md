# REVIEW - ai-visual-code-review, branch fix/audit-2026-10

Reviewer: independent (Opus), 2026-10-08. Separate fix worktree, HEAD `bd3ec1d`, merge-base with origin/main `c4d6472`. Read-only: no edits, commits or checkouts in the worktree. "Before" behaviour was tested in a throwaway worktree (removed afterwards). Branch `git status` was clean before and after every run.

> Note: this review is of the first three commits. MAJOR-1, MINOR-1 to MINOR-4 and N2 were addressed by later commits on PR #43 before merge.

## Verdict: request-changes

Two of the three commits do what they claim. The AVCR-001 fix is incomplete: paths are still passed to git as *glob* pathspecs, so the Next.js case named in the finding (`app/[id]/page.tsx`) still pulls other files' diffs into its section whenever a sibling path matches the character class. This is a one-line fix (`--literal-pathspecs` or a `:(literal)` prefix). The new unified-export comment code also puts line comments under the wrong files when one sanitized filename is a substring of another (`index.js` and `src/index.js`).

Counts: blocker 0, major 1, minor 4, nit 6.

## Per-commit verdicts

| commit | finding | verdict | summary |
|---|---|---|---|
| 022592b fix(git): pass pathspecs verbatim after -- | AVCR-001 | request-changes | Paths are no longer dropped, and arguments that start with `-` are safe. Glob and magic pathspec semantics are still active, so `[id]`, `*` and `?` names still match other files. The test fixture misses that case. |
| 4529da8 fix(export): include reviewer comments in unified review | AVCR-002 | approve-with-nits (minor) | Comments now reach AI_REVIEW.md. Line comments are matched with `includes()` on a substring, which leaks them across files. The logic is copied from the per-file generator, which has the same bug. |
| bd3ec1d fix(server): bind 127.0.0.1 by default, HOST env | AVCR-005 (partial) | approve-with-nits | Verified live that the server listens on 127.0.0.1 only and the LAN IP is refused. Docker/compose set HOST=0.0.0.0 and compose publishes on loopback. One unverified risk on Node 18 healthchecks. |

## Findings

### MAJOR-1: AVCR-001 not fixed at the root. Pathspecs are still interpreted as globs and magic
- Where: `services/GitService.js:36-48` (pass-through), `:85` (`getDiffForFile`), `server.js:415`.
- Evidence (probe in a temp repo with staged `app/[id]/page.tsx`, `app/i/page.tsx`, `app/d/page.tsx`, `a*b.txt`, `aXb.txt`):
  - Branch: `getDiffForFile('app/[id]/page.tsx')` returns the diffs of `app/[id]/page.tsx`, `app/i/page.tsx` and `app/d/page.tsx`. Base returned every staged file. Better, but the export section for `[id]` still contains the siblings' diffs.
  - `getDiffForFile('a*b.txt')` returns `a*b.txt` and `aXb.txt` on both base and branch.
  - Magic pathspecs are now reachable: `:(exclude)a.js` returns every file except a.js on the branch. On base, the old filter dropped it and every file was returned. A staged file whose name starts with `:` (for example `:!x`) gets magic treatment in the export. `/api/file-diff?file=:/` returns the whole staged diff (200; this is pre-existing, since `:` was never filtered).
  - Git matches a literal path first and then also applies wildmatch. That is why the fixer's fixture passes: none of its four names glob-match each other (`test/git-service-paths.test.js:10`).
- Suggested fix: make git treat paths literally. Use `git --literal-pathspecs diff --cached -- <file>` (a global option, so it goes before `diff` in `ALLOWED_COMMANDS`), or set `GIT_LITERAL_PATHSPECS=1` in the execFile env, or prefix each path arg with `:(literal)`. Add a sibling such as `app/i/page.tsx` and a `*`-named file to the test fixture. This also disables `:/` and `:(exclude)`.

### Option and argument injection (paths starting with `-`): no issue found
- Every path is passed after a literal `--` (`GitService.js:85`, `server.js:415`), and execFile uses argv with no shell. A probe of `getDiffForFile('--output=pwn.txt')` and `getDiffForFile('-p')` returned only those files' own diffs, and no output file was written. Live `/api/file-diff?file=--output%3Dpwn.txt` returned 400 (not staged) and created no file. NUL bytes and non-strings are now rejected outright instead of being silently dropped. All callers pass strings, so this is fine.
- The arguments before `--` keep the old character filter. No caller passes user data there (only `--name-status` at `server.js:347`). FIXES.md discloses this.

### MINOR-1: Line comments land under the wrong files in the unified export
- Where: `services/ReviewGenerator.js:179-180` (new), the same pattern as the existing `:275-276`.
- Evidence: the client lineId is `${file.replace(/[^a-zA-Z0-9]/g,'_')}_${chunk}_${line}` (`public/index.html:1456`). The filter is `lineId.includes(sanitized)`. In a probe export with `a.js`, `data.js`, `src/x.js` and `src_x.js`, the comment `data_js_0_1` appeared twice (under data.js and also under a.js), and `src_x_js_0_2` appeared twice (under `src/x.js` and `src_x.js`). The common real case is `index.js` together with `src/index.js`.
- Suggested fix: match `new RegExp('^' + escape(sanitized) + '_\\d+_\\d+$')`. Better still, have the client send `{file, line}` instead of an opaque id. Apply the same fix to the per-file generator.

### MINOR-2: The web view still rejects special-character paths, and FIXES.md does not say so
- Where: `services/diffService.js:136` (`dangerousChars` includes `( ) [ ] { } $`), used by `server.js:172` and `:226`.
- Evidence: live `GET /api/file-diff?file=app%2F%5Bid%5D%2Fpage.tsx` returns 400 "Invalid file path - potential security risk". File comments on such files are rejected by `validateExportRequest` (`server.js:226`). SETUP 5.1 / UNDERSTANDING 9.13 describe this as half of the user-visible bug. The "remains" column in FIXES.md for AVCR-001 does not mention it.
- Suggested fix: once pathspecs are literal (MAJOR-1), relax `isValidFilePath` to drop the shell-metacharacter class. Alternatively, record it in FIXES.md as remaining.

### MINOR-3: Docker healthcheck uses `localhost` but the server now binds IPv4 only (unverified)
- Where: `Dockerfile:51-52`, `docker-compose.yml:21`, with `ENV HOST=0.0.0.0` (`Dockerfile:57`).
- Before this change the server bound `::` (dual-stack), so `localhost` resolving to `::1` still connected. Now the bind is 0.0.0.0 only. On `node:18-alpine`, `dns.lookup` uses verbatim order and Node 18 has no default autoSelectFamily, so `http.get('http://localhost:3002')` can fail with ECONNREFUSED on `::1` if the container's loopback has IPv6, and the container would then be marked unhealthy. Not verified: the node:18-alpine image is not cached locally and I did not pull it. CI's `curl localhost` runs on the host and falls back between families, so it is fine.
- Suggested fix: use `http://127.0.0.1:3002/api/health` in both healthchecks, or default HOST to `::` in Docker.

### MINOR-4: The AVCR-001 test cannot detect the remaining bug
- `test/git-service-paths.test.js`: the fixture names never glob-match each other, so the test passes even though the bug in MAJOR-1 remains. Covered by the MAJOR-1 fix suggestion.

### Nits
- N1 `test/bind-host.test.js:18-22`: the third test regex-greps the source of server.js and docker-compose.yml. That checks implementation trivia, not behaviour. A real listen on port 0 that checks `server.address().address` would test the actual behaviour.
- N2 `test/unified-review-comments.test.js:23`: it uses lineId `a_js_line_1`, which is not the client format `a_js_<chunk>_<line>`, and it does not assert isolation between files (which would have caught MINOR-1).
- N3 `server.js:807`: `app.HOST = HOST` is attached to the Express app only so the test can read it.
- N4 `HOST` is not documented in README or `ai-review --help`, and the startup banner still prints `http://localhost:${PORT}` regardless of HOST.
- N5 Lint now reports 32 warnings, up from 31. The new one is `max-lines-per-function` on `generateUnifiedReview` (110 lines, limit 100).
- N6 FIXES.md says the safe run was "7 suites, 107/107". It was actually 8 suites (5 original + 3 new) with 107 tests.

### Default bind and Docker/compose consistency (focus area): consistent
- `server.js:16` sets `HOST = process.env.HOST || '127.0.0.1'`, and `app.listen(PORT, HOST, ...)` is at `:780`. Live check: `lsof` showed `node 127.0.0.1:39517`. `localhost` and `127.0.0.1` returned 200, and `http://<LAN IP>:39517` was refused. The server was stopped afterwards.
- `bin/ai-review.js start` spawns server.js with the inherited env, so HOST passes through, and it opens `http://localhost:port` (browsers fall back between families). The VS Code extension has no hard-coded host.
- Dockerfile `ENV HOST=0.0.0.0` is needed so container port publishing works. Compose sets HOST for both services. This is redundant for `production` but needed for the `dev` service (target `builder`, which has no ENV). Both compose services publish `127.0.0.1:3002:3002`. CI `docker run -p 3002:3002` still exposes all host interfaces, which is acceptable on a CI runner. The Docker image is still non-functional (no git, and compose `working_dir: /workspace` cannot find server.js). This is AVCR-004, and FIXES.md discloses it.
- FIXES.md correctly marks AVCR-005 as partial; the remaining remote-access item is an owner decision (details kept privately by the owner).

## Check results (Node v24.21.0, git 2.56.0)

| check | base c4d6472 | branch bd3ec1d |
|---|---|---|
| `npm run build` | exit 0 (placeholders) | exit 0 (placeholders) |
| `npm run lint` | exit 0, 0 errors, 31 warnings | exit 0, 0 errors, 32 warnings |
| safe jest (5 SETUP suites) | 5/5 suites, 99/99 | 5/5 suites, 99/99 |
| safe jest + 3 new suites | new suites: 7 of 8 tests fail (only `plain.txt` passes) | 8/8 suites, 107/107 |
| `npm test` (full) | not run (rewrites tracked files, per SETUP) | not run |
| `git status` after runs | n/a | clean |

New tests run against base: `git-service-paths` failed 3 of 4 (plain.txt passes), `unified-review-comments` failed 1 of 1, and `bind-host` failed 3 of 3. This confirms that each test fails without its fix.

## FIXES.md claims I could not confirm, or that are overstated
- AVCR-001 "fixed": overstated. Glob and magic pathspec semantics still mix in other files' diffs (MAJOR-1), and the web view still rejects these paths (MINOR-2).
- "Safe test command: 7 suites": it was 8 suites (N6). The 107/107 count is correct.
- AVCR-005 Docker behaviour: could not be verified end-to-end. The image is non-functional (AVCR-004), and the healthcheck risk in MINOR-3 is unverified.
- Everything else was confirmed: the tests fail before and pass after, compose publishes on loopback, and the default bind is 127.0.0.1.
