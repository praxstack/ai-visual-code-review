# SETUP — ai-visual-code-review (macOS, verified 2026-10-02/04)

Repo: `praxstack/ai-visual-code-review`, HEAD `c4d6472`, Node v24.21.0. Plain Node/Express app, no env vars, no API keys, no AI calls. No Xcode needed.

## 1. Install
```
cd ai-visual-code-review
npm ci                                   # 443 pkgs
(cd vscode-extension && npm ci)          # optional, only for the VS Code extension
```

## 2. Build / lint
```
npm run build                            # two echo placeholders, exit 0, builds nothing
npm run lint                             # exit 0, 0 errors, 31 warnings (logs/lint.log)
(cd vscode-extension && npm run compile) # tsc exit 0
```

## 3. Tests
SAFE (use this one):
```
npx jest test/server.test.js test/diffService.test.js test/gitStatusParser.test.js \
  test/spaces-in-paths.test.js test/agent-skill-packs.test.js
# 5 suites, 99/99 pass, ~1.5 s (re-run 2026-10-04)
```
FULL `npm test` (6 suites, 109/109 pass, but 239 s) — DO NOT run it inside the repo. `test/link-agent-skills.test.js` runs `scripts/link-agent-skills.sh` with cwd = repo root and rewrites 20 tracked `.cursor/skills/*` symlinks plus `docs/cursor-skill-collisions.md` (diff saved in `logs/test-side-effect.patch`). Run it in a throwaway clone:
```
git clone <path-to-this-repo> /tmp/avcr-clone && cd /tmp/avcr-clone && npm ci && npm test
```
If you did run it in place: `git checkout -- .cursor docs/cursor-skill-collisions.md`.
Results: 0 failures, 0 skipped. The 109 pass was observed in a clone (`logs/npm-test.log`, `logs/jest-results.json`).

## 4. Run the app
Web UI (needs a git repo with STAGED changes as cwd):
```
cd /path/to/some/git/repo && git add -A
PORT=3002 node <repo>/server.js      # or: node .../bin/ai-review.js start
open http://localhost:3002
```
- Default port 3002 (env `PORT`). At audit time `PORT` was the only env var and there was no `HOST` setting; PR #43 makes the server bind `127.0.0.1` by default and adds a `HOST` env var.
- Verified with curl on 127.0.0.1 (logs/server-smoke.log): `/` 200 HTML, `/api/health`, `/api/summary`, `/api/staged-files`, `/api/file-diff?file=...` 200, unknown routes 404, `POST /api/log-comment`, `POST /api/export-for-ai` write a `code-reviews-<timestamp>/` dir.
- Startup banner prints "Open: http://localhost:3002" regardless of `PORT` (cosmetic).

CLI:
```
node bin/ai-review.js --version     # ai-visual-code-review v2.4.1
node bin/ai-review.js --help
cd <git repo with staged files> && node <repo>/bin/ai-review.js quick   # writes AI_REVIEW.md
```
Outside a git repo it exits 1 with a clear message (verified).

## 5. Known problems you will hit when testing
(Detail and repro in `UNDERSTANDING.md` section 9.)
1. Staged paths containing `( ) [ ] { } $` (Next.js `app/[id]/page.tsx`) make the export include the entire staged diff, and the web view rejects them with 400 (9.1, 9.13).
2. Web file rows render duplicated labels and diff inside the header; clicks misbehave (9.2).
3. Unified export drops all reviewer comments; page prints "Files processed: undefined" (9.3).
4. Diff lines beginning `--`/`++` vanish (9.8). CLI max-file-size limit is dead (9.10).
5. Rate limiter with `NODE_ENV=production` counts all requests against the export limit (9.9); dev mode hides it.
6. Docker: image has no `git`, compose `working_dir` is wrong, so it cannot work (9.6). Not built here.
7. `scripts/link-agent-skills.sh` / `install-agent-skills.sh` are written for throwaway cloud VMs and fail on macOS `/bin/bash` 3.2 (`declare -A`). Do not run them on a workstation.
8. VS Code extension compiles but is a stub (panel shows "Loading..." forever, 9.16).

## 6. Environment notes
- Required env vars: none. Optional: `PORT`, `NODE_ENV`.
- Tracked file count is 11,679 because ~10.5k are vendored agent-skill packs under `.claude/skills`, `.agents/skills`, `.cursor/skills` (section 2 of UNDERSTANDING.md); the product is ~170 files.
- Cleanup state: no processes of this audit left running. Repo working tree clean.
- Xcode: not applicable.
