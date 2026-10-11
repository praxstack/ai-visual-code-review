# FIXES - ai-visual-code-review (branch fix/audit-2026-10)

P0/P1 kept findings: AVCR-001, AVCR-002, AVCR-005. (AVCR-017/018/019/029 are P1 but verdict duplicate, so skipped; 018 and 029 are merged into 005.)
Safe test command: 7 suites, 107/107 pass (not full npm test; worktree clean afterwards apart from the commits).

| id | status | commit | evidence | remains |
|---|---|---|---|---|
| AVCR-001 | fixed | see git log (fix(git)) | test/git-service-paths.test.js: 3 of 4 cases fail before, 4/4 pass after | Args before `--` still use the old char filter (no caller passes any). |
| AVCR-002 | fixed | see git log (fix(export)) | test/unified-review-comments.test.js fails before, passes after | "Files processed: undefined" in the page text (SETUP 5.3) not addressed; it is client-side and outside this finding. |
| AVCR-005 | partial | see git log (fix(server)) | test/bind-host.test.js: 3 fail before, 3 pass after | Remote-access hardening beyond the loopback default is an owner decision (details kept privately by the owner). Docker still unfixed per AVCR-006 (no git in image, working_dir). Default now 127.0.0.1; HOST=0.0.0.0 set in Dockerfile/compose; compose publishes 127.0.0.1:3002. |

Later review and Codex follow-ups on PR #43 (literal pathspecs, exact lineId matching, special-path web view, healthcheck host, own-key comment lookup, bind-address banner) are recorded in the PR itself.
