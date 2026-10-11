# Graph Report - ai-visual-code-review  (2026-10-03)

## Corpus Check
- 105 files · ~136,025 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 6, .example 1)

## Summary
- 1828 nodes · 2011 edges · 166 communities (149 shown, 17 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4d6472b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- GitStatusParser
- GitService
- AI Visual Code Review - Technical Context
- api-client.py
- Contributing to AI Visual Code Review
- 05-09-consolidated-audit-report.md
- 🎯 Unified Export System - Complete Guide
- Agent skill packs
- Final Test Results - Pre-Deployment Validation
- middleware/index.js
- 🏗️ PHASE 3: Architectural Review - Analysis Report
- 🔍 QA & Sr SDE Review - AI Visual Code Review v2.3.1
- Plan 008: Remove dead GET cache middleware
- [2.2.0] - 2025-10-19
- 🟠 HIGH SEVERITY ISSUES (18)
- 📚 PHASE 2: Documentation Deep-Dive - Analysis Report
- Agent Skills
- contributes
- .generateUnifiedReview
- Progress - AI Visual Code Review
- AI Visual Code Review - System Patterns & Architecture
- Security Policy
- Test Results - Unified Export System
- 🔄 Upgrading AI Visual Code Review from v1.0.3 to v1.0.4+
- server.js
- 🗂️ Complete File Inventory
- ✅ Test Suite
- vscode-extension/package.json
- AI Visual Code Review - Architecture Documentation
- export-ai-review.js
- TWITTER_LAUNCH_THREADS.md
- 5.1 Functional Requirements
- AI Visual Code Review - Project Brief
- 📋 NPM Scripts Analysis & Fixes for ai-visual-code-review
- scripts
- Plan 004: Keep one lockfile and align `engines` with CI
- link-agent-skills.sh
- package.json
- Plan 001: Route `server.js` validation through `src/utils`
- Plan 006: Repair duplicated file-header markup in the review page
- [2.1.0] - 2025-10-14
- Plan 003: Upgrade Express to the patched 4.x for the path-to-regexp advisory
- install-agent-skills.sh
- [2.3.0] - 2025-12-12
- ai-review.js
- Active Context - AI Visual Code Review
- link-agent-skills.test.js
- agent-skill-packs.test.js
- Changelog
- 3.1 Bundle Generator Service
- [2.0.0] - 2024-10-10
- ReviewGenerator.js
- run-tests.js
- gen-skills-index.js
- 🚀 Complete Setup Guide
- compilerOptions
- Comprehensive Test Scenarios - Pre-Deployment
- bug_report.md
- scripts
- Test Categories
- Business Requirements Document (BRD)
- Business Requirements Document (BRD)
- feature_request.md
- 🔍 AI Visual Code Review v2.0
- 🎯 Advanced Usage
- 🔧 Troubleshooting
- devDependencies
- Issue tracker: GitHub
- 4.1 Functional Requirements
- High-Level Design (HLD)
- PULL_REQUEST_TEMPLATE.md
- Plan 009: Drive CLI export listing through the Git working-tree module
- Detailed Workflow
- ✨ New Features
- A. CLI Argument Testing
- C. File Type Handling
- Domain Docs
- 4.2 Non-Functional Requirements
- devDependencies
- link-praxstack-skills.sh
- Common Issues
- Publishing to NPM
- B. Pattern Matching Edge Cases
- D. Error Scenarios
- F. Performance Testing
- Test Execution Plan
- 10. Success Metrics
- 17. Appendix
- 8. Implementation Phases
- 🛠️ Development & Testing
- 📈 Examples
- sample-component.tsx
- 🌐 Remote Repository Usage
- 🚀 Migration Notes
- E. Integration Testing
- G. Cross-Platform Compatibility
- H. Output Validation
- I. Security Testing
- 10. Success Metrics
- 1. Executive Summary
- 3. Current State Analysis
- 5. User Stories
- 6. Business Rules
- 7. Assumptions and Constraints
- 9. Implementation Phases
- 11. Risks and Mitigation
- 12. Go-To-Market Strategy
- 13. Compliance and Legal
- 14. Dependencies and Prerequisites
- 1. Executive Summary
- 2. Market Analysis
- 3. Stakeholders
- 6. User Stories
- 7. Technical Architecture Overview
- 9. Business Rules
- 10. Deployment & Distribution
- 11. Testing Strategy
- 1. System Overview
- 5. Technology Stack
- 6. Security Architecture
- 7. Performance Considerations
- sentinel.md
- ✨ Core Features
- 📋 Usage
- 🚀 Quick Start
- 🚀 **What's New in v2.0**
- server.test.js
- install-agent-browser.sh
- install-cursor-native-stack.sh
- quick-ai-review.sh
- vendor-praxstack-extras.sh
- ⚙️ CI/CD Integration
- 🐳 Docker Deployment
- test_cors_logic.js
- 11. Risks and Mitigation
- 14. Appendix
- 2. Stakeholders
- 12. Monitoring & Metrics
- 13. Future Enhancements
- 4. Data Model
- 8. Error Handling
- 9. Integration Points
- palette.md
- dependencies
- repository
- 🐛 Troubleshooting
- 🔧 Configuration
- 🤝 Contributing
- 📊 Export Formats
- galleryBanner
- repository
- CLAUDE.md
- triage-labels.md
- praxstack-skill-collisions.md
- install.sh
- bin
- bugs
- engines
- setup-github.sh
- bugs
- dependencies
- engines

## God Nodes (most connected - your core abstractions)
1. `Agent Skills` - 28 edges
2. `GitStatusParser` - 23 edges
3. `GitService` - 19 edges
4. `Business Requirements Document (BRD)` - 19 edges
5. `scripts` - 17 edges
6. `ReviewWebviewProvider` - 16 edges
7. `Comprehensive Test Scenarios - Pre-Deployment` - 16 edges
8. `🔍 AI Visual Code Review v2.0` - 16 edges
9. `Business Requirements Document (BRD)` - 16 edges
10. `High-Level Design (HLD)` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Step 1: Characterization test that fails on current code` --references--> `main()`  [INFERRED]
  plans/005-pass-comments-into-unified-export.md → test/api-client.py
- `Current state` --references--> `isTooLarge()`  [INFERRED]
  plans/009-cli-export-through-gitservice.md → scripts/export-ai-review.js
- `2024-05-18 - O(K) Cache Eviction using Map Insertion Order` --references--> `cacheMiddleware()`  [INFERRED]
  .Jules/bolt.md → server.js
- `Step 1: Delete the dead cache block` --references--> `cacheMiddleware()`  [INFERRED]
  plans/008-remove-dead-cache-middleware.md → server.js
- `Scope` --references--> `ReviewGenerator`  [INFERRED]
  plans/009-cli-export-through-gitservice.md → services/ReviewGenerator.js

## Import Cycles
- None detected.

## Communities (166 total, 17 thin omitted)

### Community 0 - "GitStatusParser"
Cohesion: 0.06
Nodes (35): Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 002: Drop unused `server.js` imports and fail CI lint on error, Scope, Status (+27 more)

### Community 1 - "GitService"
Cohesion: 0.07
Nodes (16): { execFile }, path, activate(), exportForAICommand(), openReviewCommand(), quickReviewCommand(), setupAutoRefresh(), updateStatusBar() (+8 more)

### Community 2 - "AI Visual Code Review - Technical Context"
Cohesion: 0.05
Nodes (42): **Advantages of Current Stack**, AI Visual Code Review - Technical Context, 🏗️ **Architecture Decisions**, **Async Operations**, **Backend Technologies**, **Binary Executables**, **Caching Strategy**, **CLI Implementation** (+34 more)

### Community 3 - "api-client.py"
Cohesion: 0.05
Nodes (17): 2026 high-signal layers, Agent skills, Domain docs, Issue tracker, Methodology XOR (one conductor per task), Prax's skills-and-personas, Project quick reference, Triage labels (+9 more)

### Community 4 - "Contributing to AI Visual Code Review"
Cohesion: 0.05
Nodes (39): 1. Correction, 2. Warning, 3. Temporary Ban, 4. Permanent Ban, Attribution, Contributor Covenant Code of Conduct, Enforcement, Enforcement Guidelines (+31 more)

### Community 5 - "05-09-consolidated-audit-report.md"
Cohesion: 0.05
Nodes (40): Accessibility Assessment (WCAG 2.1 AA), Accessibility Issues Found, All Issues Summary, ✅ AUDIT ITERATION 1 - COMPLETE, Backend Missing Tests, By Phase, Critical Security Issues, Current Test Coverage (+32 more)

### Community 6 - "🎯 Unified Export System - Complete Guide"
Cohesion: 0.05
Nodes (40): 1. Always Stage Changes First, 1. CLI Flow, 1. Review Specific Package in Monorepo, 2. Review Only Tests, 2. Use Specific Patterns for Large Repos, 2. Web Interface Flow, 3. DiffService Processing, 3. Exclude Generated Files by Default (+32 more)

### Community 7 - "Agent skill packs"
Cohesion: 0.06
Nodes (31): agent-browser CLI, Agent skill packs, Also credible, not vendored here, Awesome Copilot, Graphify, How to add another pack, MCP governance (Serena + Context7 only), Microsoft subset (+23 more)

### Community 8 - "Final Test Results - Pre-Deployment Validation"
Cohesion: 0.05
Nodes (37): 1. Server Startup, 1. ✅ Syntax Error (Backslash Escaping), 2. ✅ Pattern Matching, 2. Web Interface Loading, 3. Repository Detection, 3. ✅ Zero-Directory Glob, 4. ✅ Deleted File Handling, 4. File Selection (+29 more)

### Community 9 - "middleware/index.js"
Cohesion: 0.08
Nodes (28): Step 4: Optional delete of unused `src/utils/gitCommands.js`, CONFIG, { createRateLimit, resetRateLimit, generalRateLimit, exportRateLimit }, { securityHeaders, requestLogger, generateNonce }, CONFIG, createRateLimit(), exportRateLimit, generalRateLimit (+20 more)

### Community 10 - "🏗️ PHASE 3: Architectural Review - Analysis Report"
Cohesion: 0.06
Nodes (34): 1. Server Layer (`server.js` - 1,114 lines), 2. Services Layer, 3. CLI Layer (`bin/ai-review.js` - 189 lines), 4. Frontend Layer (`public/index.html` - 1,667 lines), 5. VSCode Extension (`vscode-extension/` - 552 lines TS), 📊 Architecture Quality Scores, 🎯 Architecture Recommendations, 📋 Architecture Review Summary (+26 more)

### Community 11 - "🔍 QA & Sr SDE Review - AI Visual Code Review v2.3.1"
Cohesion: 0.06
Nodes (33): Advanced Features, 🏗️ Architecture Review, Best Practices Compliance, ✅ Certification, 📝 Code Quality Assessment, Code Smells Identified, 📋 Complete Feature Matrix, Core Features (+25 more)

### Community 12 - "Plan 008: Remove dead GET cache middleware"
Cohesion: 0.07
Nodes (27): 2024-05-18 - O(K) Cache Eviction using Map Insertion Order, 2026-03-04 - Parallelize independent Git CLI commands, 2026-03-05 - Parallelize independent Git CLI operations in API endpoints, Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes (+19 more)

### Community 13 - "[2.2.0] - 2025-10-19"
Cohesion: 0.06
Nodes (33): [2.2.0] - 2025-10-19, Algorithmic Efficiency, API Enhancements, Breaking Changes, Clean Architecture, Comprehensive Documentation, 🎯 Comprehensive Git Status Handling System, Comprehensive Status Support (+25 more)

### Community 14 - "🟠 HIGH SEVERITY ISSUES (18)"
Cohesion: 0.06
Nodes (31): By Category, By Severity, Code Duplication, 📊 Code Quality Metrics, Complexity Analysis, CR-001: VSCode Extension Missing Required Files, CR-002: execSync with .catch() - Invalid JavaScript, CR-003: No HTTPS/TLS Support in Production (+23 more)

### Community 15 - "📚 PHASE 2: Documentation Deep-Dive - Analysis Report"
Cohesion: 0.06
Nodes (30): 1. README.md Analysis, 2. SECURITY.md Analysis, 3. HLD-UI-Export-Bundle.md Analysis, 4. BRD-VSCode-Extension.md Analysis, 5. Memory Bank Analysis, Critical Issues (Require Immediate Attention), Critical Missing Documents, 🔍 Documentation Analysis by Category (+22 more)

### Community 16 - "Agent Skills"
Cohesion: 0.07
Nodes (29): Addy Osmani — Agent Skills, agent-browser, agent-deep-research, Agent Skills, Anthropic example skills (subset), Awesome Copilot (toolbox shelf), AWS agent toolkit, Cloudflare skills (+21 more)

### Community 17 - "contributes"
Cohesion: 0.07
Nodes (29): default, description, type, default, description, type, default, description (+21 more)

### Community 18 - ".generateUnifiedReview"
Cohesion: 0.13
Nodes (21): 2024-05-18 - Optimize asynchronous file operations and child processes in `services/ReviewGenerator.js`, Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 005: Pass reviewer comments into unified AI review export, Scope (+13 more)

### Community 19 - "Progress - AI Visual Code Review"
Cohesion: 0.08
Nodes (25): Architecture, Audit & Planning, Current Version: 2.3.0, Deferred to Future Releases, Deployment Checklist, Docker, GitHub, Known Issues / Tech Debt (+17 more)

### Community 20 - "AI Visual Code Review - System Patterns & Architecture"
Cohesion: 0.08
Nodes (25): AI Visual Code Review - System Patterns & Architecture, **CLI Interface Pattern**, **Client-Side State Pattern**, 🔧 **Configuration Patterns**, 🏗️ **Core Architecture Pattern**, 📊 **Data Flow Patterns**, **Defense in Depth Pattern**, **Development vs Production Pattern** (+17 more)

### Community 21 - "Security Policy"
Cohesion: 0.08
Nodes (26): Automated Testing, Before Deployment, CI/CD Security Integration, Code Review Security Focus, Command Injection Prevention, Environment Variables, Input Validation & Sanitization, Manual Security Testing (+18 more)

### Community 22 - "Test Results - Unified Export System"
Cohesion: 0.08
Nodes (23): 1. ✅ Syntax Error (Backslash Escaping), 2. ✅ Pattern Matching Broken, 3. ✅ Zero-Directory Glob Pattern, 4. ✅ Deleted File Handling, Additional Testing (Optional), Bugs Fixed, Code Quality, Conclusion (+15 more)

### Community 23 - "🔄 Upgrading AI Visual Code Review from v1.0.3 to v1.0.4+"
Cohesion: 0.08
Nodes (23): 🚨 **Breaking Changes**, **CI/CD Pipeline Updates:**, **🔧 CLI Improvements**, **Docker Updates:**, 📦 **For Team/Organization Updates**, **Issue: Command not found after update**, **Issue: Old version still showing**, **Issue: Permission errors** (+15 more)

### Community 24 - "server.js"
Cohesion: 0.09
Nodes (16): ALLOWED_ORIGINS, app, CONFIG, cors, DiffService, { execFile }, exportRateLimit, express (+8 more)

### Community 25 - "🗂️ Complete File Inventory"
Cohesion: 0.09
Nodes (22): Areas for Improvement, 🗂️ Complete File Inventory, 📁 Configuration Files, 📦 Dependencies Analysis, 📁 Design Documents (docs/), Development Dependencies, 📁 Documentation Files, 📈 Executive Summary (+14 more)

### Community 26 - "✅ Test Suite"
Cohesion: 0.09
Nodes (21): 🎯 Critical Tests, 🔬 Detailed Output Format Test, 📝 Manual Verification Steps, 📊 Output Verification Checklist, 🚀 Pre-Deployment Checklist, 📋 Pre-Deployment Testing Checklist, 🎉 Success Criteria Summary, Test 10: Error Handling (+13 more)

### Community 27 - "vscode-extension/package.json"
Cohesion: 0.10
Nodes (20): simple-git, @types/node, @types/vscode, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, vsce, activationEvents, categories (+12 more)

### Community 28 - "AI Visual Code Review - Architecture Documentation"
Cohesion: 0.10
Nodes (19): 1. Single HTML File (public/index.html), 2. execFile over exec, 3. Whitelist Git Commands, 4. Modular src/ Structure, AI Visual Code Review - Architecture Documentation, Allowed Git Commands (Whitelist), 📡 API Endpoints, 🔄 Data Flow (+11 more)

### Community 29 - "export-ai-review.js"
Cohesion: 0.11
Nodes (19): Scope, STOP conditions, args, config, DEFAULT_EXCLUDES, deletedFiles, DiffService, excludedFiles (+11 more)

### Community 30 - "TWITTER_LAUNCH_THREADS.md"
Cohesion: 0.10
Nodes (19): 🚀 AI Visual Code Review - Twitter Launch Threads, CodeReview #AI #Developer #OpenSource, CodeReview #AI #NPM #OpenSource #Developer, CodeReview #Features #Developer, Developer #Setup #CodeReview, 🤝 Engagement Tactics, 🏷️ Hashtag Strategy, 🎯 Posting Strategy (+11 more)

### Community 31 - "5.1 Functional Requirements"
Cohesion: 0.11
Nodes (18): 5.1 Functional Requirements, 5.2 Non-Functional Requirements, 5. Business Requirements, FR10: Bundle Export (Future), FR1: Extension Installation & Activation, FR2: Review Panel Integration, FR3: Diff Viewing, FR4: Inline Commenting (+10 more)

### Community 32 - "AI Visual Code Review - Project Brief"
Cohesion: 0.11
Nodes (17): **1. GitHub-Like Experience**, **2. AI-Optimized Exports**, **3. Enterprise Security**, **4. Developer Experience**, AI Visual Code Review - Project Brief, 🏆 **Competitive Advantages**, 🎯 **Core Purpose**, 📋 **Current Status** (+9 more)

### Community 33 - "📋 NPM Scripts Analysis & Fixes for ai-visual-code-review"
Cohesion: 0.11
Nodes (17): Broken Commands ❌ (Arguments Not Passed), ✅ Commands Status, ✅ Conclusion, Current Implementation (BROKEN), 🐛 Diff Formatting Issue, 📝 File to Fix in ai-visual-code-review Package, 🔍 Issue Identified, 📋 NPM Scripts Analysis & Fixes for ai-visual-code-review (+9 more)

### Community 34 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, build:css, build:js, dev, generate:certs, lint, lint:fix (+9 more)

### Community 35 - "Plan 004: Keep one lockfile and align `engines` with CI"
Cohesion: 0.12
Nodes (16): Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 004: Keep one lockfile and align `engines` with CI, Scope, Status (+8 more)

### Community 36 - "link-agent-skills.sh"
Cohesion: 0.22
Nodes (15): gstack_skill_name(), install_cursor_mcp(), install_cursor_rules(), install_pstack_models(), link_abs_or_skip(), link_cursor_skills(), link_gstack_cursor_skills(), link_packs() (+7 more)

### Community 37 - "package.json"
Cohesion: 0.12
Nodes (15): author, description, files, homepage, eslint, typescript, keywords, license (+7 more)

### Community 38 - "Plan 001: Route `server.js` validation through `src/utils`"
Cohesion: 0.12
Nodes (15): Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 001: Route `server.js` validation through `src/utils`, Scope, Status (+7 more)

### Community 39 - "Plan 006: Repair duplicated file-header markup in the review page"
Cohesion: 0.12
Nodes (15): Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 006: Repair duplicated file-header markup in the review page, Scope, Status (+7 more)

### Community 40 - "[2.1.0] - 2025-10-14"
Cohesion: 0.13
Nodes (15): [2.1.0] - 2025-10-14, 🐛 Bug Fixes, Critical Fixes, 🎯 Cross-Platform Export System, Deleted File Handling, 📚 Documentation, Enhanced Pattern Matching, ✨ Features (+7 more)

### Community 41 - "Plan 003: Upgrade Express to the patched 4.x for the path-to-regexp advisory"
Cohesion: 0.13
Nodes (14): Commands you will need, Current state, Done criteria, Git workflow, Maintenance notes, Plan 003: Upgrade Express to the patched 4.x for the path-to-regexp advisory, Scope, Status (+6 more)

### Community 42 - "install-agent-skills.sh"
Cohesion: 0.29
Nodes (14): assert_github_slug(), clone_repo(), copy_gstack_runtime(), copy_pack_license(), copy_root_skill_bundle(), copy_skill_files(), extract_pack(), extract_spec_kit() (+6 more)

### Community 43 - "[2.3.0] - 2025-12-12"
Cohesion: 0.14
Nodes (14): [2.3.0] - 2025-12-12, 📊 Audit Results, Breaking Changes, Code Quality, 🐛 Critical Bug Fixes, Files Added (15+ new files), High Priority Fixes (HI-001 to HI-015), Migration Guide v2.2.x → v2.3.0 (+6 more)

### Community 44 - "ai-review.js"
Cohesion: 0.18
Nodes (9): args, checkGitRepo(), fs, path, quickReview(), { spawn, execFileSync }, startServer(), VERSION (+1 more)

### Community 45 - "Active Context - AI Visual Code Review"
Cohesion: 0.15
Nodes (12): Active Context - AI Visual Code Review, Active Files Modified, Core Changes, Current State (December 2025), Key Decisions Made, New Modules, Next Steps, Open Questions (+4 more)

### Community 46 - "link-agent-skills.test.js"
Cohesion: 0.17
Nodes (8): { execFileSync }, fs, os, PACK, path, PROJECT_SKILLS, ROOT, SCRIPT

### Community 47 - "agent-skill-packs.test.js"
Cohesion: 0.17
Nodes (7): fs, MICROSOFT_SUBSET, PACKS, path, PSTACK_SLUGS, ROOT, SPECKIT_COMMANDS

### Community 48 - "Changelog"
Cohesion: 0.18
Nodes (11): [1.0.0] - 2024-09-15, API Compatibility, Changelog, Features, For Developers, For Users, Initial Release, Migration Guide v2.1.x → v2.2.0 (+3 more)

### Community 49 - "3.1 Bundle Generator Service"
Cohesion: 0.18
Nodes (11): 3.1.1 Data Collection Module, 3.1.2 Template Engine, 3.1.3 Data Embedding Module, 3.1.4 Optimization Module, 3.1 Bundle Generator Service, 3.2.1 Application Bootstrap, 3.2.2 State Management, 3.2.3 UI Components (+3 more)

### Community 50 - "[2.0.0] - 2024-10-10"
Cohesion: 0.20
Nodes (10): [2.0.0] - 2024-10-10, API Changes, Breaking Changes, 🛠️ Developer Experience, 📚 Documentation, 🚀 Major Release - Production Ready, ⚡ Performance, 🔒 Security (+2 more)

### Community 51 - "ReviewGenerator.js"
Cohesion: 0.20
Nodes (6): DiffService, fs, GitService, GitStatusParser, path, DiffService

### Community 52 - "run-tests.js"
Cohesion: 0.20
Nodes (8): binContent, { execSync }, exportContent, exportScript, fs, path, result, results

### Community 53 - "gen-skills-index.js"
Cohesion: 0.20
Nodes (6): fs, OUT, PACK_META, path, ROOT, SKILLS_DIR

### Community 54 - "🚀 Complete Setup Guide"
Cohesion: 0.20
Nodes (10): 🚀 Complete Setup Guide, 🏠 Local Installation, Option 1: Clone and Install (Recommended for Development), Option 2: Direct NPM Installation, Option 3: Local Development Setup, Prerequisites, Quick Check, 📞 Support & Community (+2 more)

### Community 55 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, lib, module, outDir, rootDir, sourceMap, strict, target (+1 more)

### Community 56 - "Comprehensive Test Scenarios - Pre-Deployment"
Cohesion: 0.22
Nodes (8): Automated Test Execution, Comprehensive Test Scenarios - Pre-Deployment, J1. Old Functionality Still Works, J2. Backward Compatibility, J. Regression Testing, Results, Test Data Setup, Test Results Summary

### Community 57 - "bug_report.md"
Cohesion: 0.22
Nodes (8): ❌ Actual Behavior, 📝 Additional Context, 🐛 Bug Description, 🖥️ Environment, ✅ Expected Behavior, 📄 Logs, 📸 Screenshots, 📋 Steps to Reproduce

### Community 58 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, compile, lint, package, pretest, publish, test, vscode:prepublish (+1 more)

### Community 59 - "Test Categories"
Cohesion: 0.25
Nodes (8): A. CLI Argument Testing, B. Pattern Matching Edge Cases, C. File Type Handling, D. Error Scenarios, E. Integration Testing, F. Performance Testing, G. Cross-Platform Compatibility, Test Categories

### Community 60 - "Business Requirements Document (BRD)"
Cohesion: 0.25
Nodes (7): 12.1 Data Privacy, 12.2 Open Source License, 12. Compliance and Legal, 13. Approval, 8. Out of Scope, Business Requirements Document (BRD), Standalone HTML Bundle Export for Human Code Review

### Community 61 - "Business Requirements Document (BRD)"
Cohesion: 0.25
Nodes (7): 15. Out of Scope (Future Versions), 16. Approval and Sign-off, 4.1 Existing Solution Analysis, 4.2 VS Code Extension Ecosystem, 4. Current State Analysis, Business Requirements Document (BRD), VS Code Extension for AI Visual Code Review

### Community 62 - "feature_request.md"
Cohesion: 0.25
Nodes (7): ✅ Acceptance Criteria, 📝 Additional Context, 🔄 Alternatives Considered, 🚀 Feature Description, 📸 Mockups/Examples, 💡 Problem Statement, 📋 Proposed Solution

### Community 63 - "🔍 AI Visual Code Review v2.0"
Cohesion: 0.25
Nodes (8): 🙏 Acknowledgments, 🤖 AI Integration Guide, 🔍 AI Visual Code Review v2.0, 📄 License, Multi-Layer Security Protection, Optimal Prompts, 🔒 Security Features, Supported Frameworks

### Community 64 - "🎯 Advanced Usage"
Cohesion: 0.25
Nodes (8): 🎯 Advanced Usage, Custom Port and Options, File Filtering, Git Hooks, Include/Exclude Patterns, Integration with Editors, Size Management, VS Code Tasks

### Community 65 - "🔧 Troubleshooting"
Cohesion: 0.25
Nodes (8): Firewall/Proxy, Getting Help, Large Repositories, Memory Issues, Network Issues, Performance Issues, Reporting Issues, 🔧 Troubleshooting

### Community 66 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, eslint, @types/node, @types/vscode, typescript, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, vsce

### Community 67 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 68 - "4.1 Functional Requirements"
Cohesion: 0.29
Nodes (7): 4.1 Functional Requirements, FR1: Bundle Generation, FR2: Interactive Review Interface, FR3: Comment Management, FR4: Comment Export, FR5: Review Metadata, FR6: Browser Compatibility

### Community 69 - "High-Level Design (HLD)"
Cohesion: 0.29
Nodes (6): 2.1 Architecture Diagram, 2.2 Component Interaction Flow, 2. System Architecture, Document Control, High-Level Design (HLD), Standalone HTML Bundle Export for Human Code Review

### Community 70 - "PULL_REQUEST_TEMPLATE.md"
Cohesion: 0.29
Nodes (6): 📝 Additional Notes, ✅ Checklist, 📋 Description, 🔗 Related Issue, 📸 Screenshots (if applicable), 🔄 Type of Change

### Community 71 - "Plan 009: Drive CLI export listing through the Git working-tree module"
Cohesion: 0.29
Nodes (6): Commands you will need, Done criteria, Git workflow, Maintenance notes, Plan 009: Drive CLI export listing through the Git working-tree module, Status

### Community 72 - "Detailed Workflow"
Cohesion: 0.29
Nodes (7): Detailed Workflow, Quick Start (5 minutes), Step 1: Project Preparation, Step 2: Start Review Server, Step 3: Review Process, Step 4: Quick Export (Alternative), 📁 Using in Any Repository

### Community 73 - "✨ New Features"
Cohesion: 0.33
Nodes (6): Developer Experience, DevOps & CI/CD, Documentation, Enterprise Architecture, ✨ New Features, VSCode Extension

### Community 74 - "A. CLI Argument Testing"
Cohesion: 0.33
Nodes (6): A1. Basic Commands, A2. Include Patterns, A3. Exclude Patterns, A4. Size Limits, A5. Combined Arguments, A. CLI Argument Testing

### Community 75 - "C. File Type Handling"
Cohesion: 0.33
Nodes (6): C1. JavaScript Files, C2. TypeScript Files, C3. JSON Files, C4. Markdown Files, C5. Other File Types, C. File Type Handling

### Community 76 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 77 - "4.2 Non-Functional Requirements"
Cohesion: 0.33
Nodes (6): 4.2 Non-Functional Requirements, 4. Business Requirements, NFR1: Performance, NFR2: Usability, NFR3: Security, NFR4: Maintainability

### Community 78 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, eslint, jest, nodemon, supertest, typescript

### Community 79 - "link-praxstack-skills.sh"
Cohesion: 0.60
Nodes (5): link_abs_or_skip(), relpath_from_cursor_skills(), link-praxstack-skills.sh script, skill_frontmatter_name(), valid_skill_slug()

### Community 80 - "Common Issues"
Cohesion: 0.33
Nodes (6): Common Issues, Issue: "Command not found: ai-review", Issue: "No staged changes found", Issue: "Not a git repository", Issue: "Permission denied", Issue: "Port 3002 already in use"

### Community 81 - "Publishing to NPM"
Cohesion: 0.33
Nodes (6): 📦 NPM Publishing & Distribution, Private Registry Publishing, Publishing to NPM, Step 1: Prepare for Publishing, Step 2: Publish to NPM, Step 3: Create Distribution Scripts

### Community 82 - "B. Pattern Matching Edge Cases"
Cohesion: 0.40
Nodes (5): B1. Glob Patterns, B2. Extension Patterns, B3. Directory Patterns, B4. Complex Patterns, B. Pattern Matching Edge Cases

### Community 83 - "D. Error Scenarios"
Cohesion: 0.40
Nodes (5): D1. Git Repository Errors, D2. File Access Errors, D3. Invalid Arguments, D4. Process Errors, D. Error Scenarios

### Community 84 - "F. Performance Testing"
Cohesion: 0.40
Nodes (5): F1. Small Projects, F2. Medium Projects, F3. Large Projects, F4. Large Files, F. Performance Testing

### Community 85 - "Test Execution Plan"
Cohesion: 0.40
Nodes (5): Phase 1: Critical Tests (Automated), Phase 2: Edge Cases (Automated), Phase 3: Manual Testing (User), Phase 4: Performance & Security (Automated), Test Execution Plan

### Community 86 - "10. Success Metrics"
Cohesion: 0.40
Nodes (5): 10.1 Adoption Metrics, 10.2 Engagement Metrics, 10.3 Quality Metrics, 10.4 Business Metrics, 10. Success Metrics

### Community 87 - "17. Appendix"
Cohesion: 0.40
Nodes (5): 17.1 VS Code Extension API References, 17.2 Competitive Analysis Links, 17.3 Market Research Data, 17.4 Glossary, 17. Appendix

### Community 88 - "8. Implementation Phases"
Cohesion: 0.40
Nodes (5): 8. Implementation Phases, Phase 1: MVP (Weeks 1-3) - Core Review Features, Phase 2: Enhanced Features (Weeks 4-5) - Commenting, Phase 3: Bundle Export (Week 6) - HTML Export, Phase 4: Polish & Release (Weeks 7-8)

### Community 89 - "🛠️ Development & Testing"
Cohesion: 0.40
Nodes (5): 🛠️ Development & Testing, Enhanced API Endpoints, Local Development, Project Structure, Testing Suite

### Community 90 - "📈 Examples"
Cohesion: 0.40
Nodes (5): 📈 Examples, Full-stack Project, Node.js API Project, Python Project, React/TypeScript Project

### Community 92 - "🌐 Remote Repository Usage"
Cohesion: 0.40
Nodes (5): 🌐 Remote Repository Usage, Scenario 1: Team Member Installation, Scenario 2: Project-Specific Installation, Scenario 3: Shared Configuration, Scenario 4: Git Hooks Integration

### Community 95 - "🚀 Migration Notes"
Cohesion: 0.50
Nodes (4): CLI Usage Changes (Optional), For Windows Users, From v2.0.0 to v2.1.0, 🚀 Migration Notes

### Community 96 - "E. Integration Testing"
Cohesion: 0.50
Nodes (4): E1. CLI to Script Flow, E2. DiffService Integration, E3. File System Integration, E. Integration Testing

### Community 97 - "G. Cross-Platform Compatibility"
Cohesion: 0.50
Nodes (4): G1. macOS (Current Platform), G2. Linux (Test if possible), G3. Windows (Test if possible), G. Cross-Platform Compatibility

### Community 98 - "H. Output Validation"
Cohesion: 0.50
Nodes (4): H1. AI_REVIEW.md Content, H2. Console Output, H3. Exit Codes, H. Output Validation

### Community 99 - "I. Security Testing"
Cohesion: 0.50
Nodes (4): I1. Command Injection, I2. Path Traversal, I3. Input Validation, I. Security Testing

### Community 100 - "10. Success Metrics"
Cohesion: 0.50
Nodes (4): 10.1 Adoption Metrics, 10.2 Performance Metrics, 10.3 Quality Metrics, 10. Success Metrics

### Community 101 - "1. Executive Summary"
Cohesion: 0.50
Nodes (4): 1.1 Purpose, 1.2 Business Objectives, 1.3 Success Criteria, 1. Executive Summary

### Community 102 - "3. Current State Analysis"
Cohesion: 0.50
Nodes (4): 3.1 Current Capabilities, 3.2 Current Limitations, 3.3 Gap Analysis, 3. Current State Analysis

### Community 103 - "5. User Stories"
Cohesion: 0.50
Nodes (4): 5.1 High Priority, 5.2 Medium Priority, 5.3 Low Priority, 5. User Stories

### Community 104 - "6. Business Rules"
Cohesion: 0.50
Nodes (4): 6.1 Bundle Generation Rules, 6.2 Comment Rules, 6.3 Security Rules, 6. Business Rules

### Community 105 - "7. Assumptions and Constraints"
Cohesion: 0.50
Nodes (4): 7.1 Assumptions, 7.2 Constraints, 7.3 Dependencies, 7. Assumptions and Constraints

### Community 106 - "9. Implementation Phases"
Cohesion: 0.50
Nodes (4): 9. Implementation Phases, Phase 1: MVP (Weeks 1-2), Phase 2: Enhanced (Weeks 3-4), Phase 3: Polish (Week 5)

### Community 107 - "11. Risks and Mitigation"
Cohesion: 0.50
Nodes (4): 11.1 Technical Risks, 11.2 Business Risks, 11.3 Market Risks, 11. Risks and Mitigation

### Community 108 - "12. Go-To-Market Strategy"
Cohesion: 0.50
Nodes (4): 12.1 Launch Plan, 12.2 Marketing Channels, 12.3 Positioning, 12. Go-To-Market Strategy

### Community 109 - "13. Compliance and Legal"
Cohesion: 0.50
Nodes (4): 13.1 VS Code Marketplace Compliance, 13.2 Data Privacy, 13.3 Open Source License, 13. Compliance and Legal

### Community 110 - "14. Dependencies and Prerequisites"
Cohesion: 0.50
Nodes (4): 14.1 Technical Dependencies, 14.2 Development Dependencies, 14.3 Marketplace Requirements, 14. Dependencies and Prerequisites

### Community 111 - "1. Executive Summary"
Cohesion: 0.50
Nodes (4): 1.1 Purpose, 1.2 Business Objectives, 1.3 Success Criteria, 1. Executive Summary

### Community 112 - "2. Market Analysis"
Cohesion: 0.50
Nodes (4): 2.1 Market Size, 2.2 Competitive Landscape, 2.3 Market Opportunity, 2. Market Analysis

### Community 113 - "3. Stakeholders"
Cohesion: 0.50
Nodes (4): 3.1 Primary Stakeholders, 3.2 Secondary Stakeholders, 3.3 Internal Stakeholders, 3. Stakeholders

### Community 114 - "6. User Stories"
Cohesion: 0.50
Nodes (4): 6.1 High Priority, 6.2 Medium Priority, 6.3 Low Priority, 6. User Stories

### Community 115 - "7. Technical Architecture Overview"
Cohesion: 0.50
Nodes (4): 7.1 Extension Structure, 7.2 Core Components, 7.3 Data Flow, 7. Technical Architecture Overview

### Community 116 - "9. Business Rules"
Cohesion: 0.50
Nodes (4): 9.1 Extension Behavior, 9.2 Comment Management, 9.3 Export Behavior, 9. Business Rules

### Community 117 - "10. Deployment & Distribution"
Cohesion: 0.50
Nodes (4): 10.1 File Structure, 10.2 Distribution Methods, 10.3 Usage Instructions, 10. Deployment & Distribution

### Community 118 - "11. Testing Strategy"
Cohesion: 0.50
Nodes (4): 11.1 Bundle Generation Tests, 11.2 Browser Compatibility Tests, 11.3 Functional Tests, 11. Testing Strategy

### Community 119 - "1. System Overview"
Cohesion: 0.50
Nodes (4): 1.1 Purpose, 1.2 Design Goals, 1.3 Design Principles, 1. System Overview

### Community 120 - "5. Technology Stack"
Cohesion: 0.50
Nodes (4): 5.1 Bundle Generation (Node.js), 5.2 Frontend (Browser), 5.3 Performance Optimizations, 5. Technology Stack

### Community 121 - "6. Security Architecture"
Cohesion: 0.50
Nodes (4): 6.1 Content Security Policy, 6.2 XSS Prevention, 6.3 Data Validation, 6. Security Architecture

### Community 122 - "7. Performance Considerations"
Cohesion: 0.50
Nodes (4): 7.1 Bundle Size Optimization, 7.2 Runtime Performance, 7.3 Memory Management, 7. Performance Considerations

### Community 123 - "sentinel.md"
Cohesion: 0.50
Nodes (3): 2024-03-03 - [Fix Command Injection Vulnerabilities in Node.js Execution], 2024-03-04 - [Fix DOM XSS in Frontend Template Interpolation], 2024-10-18 - [Fix DOM-based XSS in Visual Review Interface]

### Community 124 - "✨ Core Features"
Cohesion: 0.50
Nodes (4): AI Integration, ✨ Core Features, Developer Experience, Visual Review Interface

### Community 125 - "📋 Usage"
Cohesion: 0.50
Nodes (4): Basic Workflow, CLI Commands, Quick Script Usage, 📋 Usage

### Community 126 - "🚀 Quick Start"
Cohesion: 0.50
Nodes (4): Option 1: One-line Installation, Option 2: NPM Installation (when published), Option 3: Manual Setup, 🚀 Quick Start

### Community 127 - "🚀 **What's New in v2.0**"
Cohesion: 0.50
Nodes (4): ⚡ **Performance Enhanced**, 🔒 **Security Hardened**, 🎨 **UX Improvements**, 🚀 **What's New in v2.0**

### Community 128 - "server.test.js"
Cohesion: 0.50
Nodes (3): supertest, app, request

### Community 129 - "install-agent-browser.sh"
Cohesion: 0.67
Nodes (3): install_cli(), PATH, install-agent-browser.sh script

### Community 130 - "install-cursor-native-stack.sh"
Cohesion: 0.67
Nodes (3): PATH, install-cursor-native-stack.sh script, try()

### Community 131 - "quick-ai-review.sh"
Cohesion: 0.83
Nodes (3): is_too_large(), quick-ai-review.sh script, should_process_file()

### Community 132 - "vendor-praxstack-extras.sh"
Cohesion: 0.83
Nodes (3): copy_skill_files(), copy_teach_pro_max_slim(), vendor-praxstack-extras.sh script

### Community 133 - "⚙️ CI/CD Integration"
Cohesion: 0.50
Nodes (4): ⚙️ CI/CD Integration, GitHub Actions, GitLab CI, Jenkins Pipeline

### Community 134 - "🐳 Docker Deployment"
Cohesion: 0.50
Nodes (4): Docker Compose, 🐳 Docker Deployment, Dockerfile, Kubernetes Deployment

### Community 135 - "test_cors_logic.js"
Cohesion: 0.50
Nodes (3): ALLOWED_ORIGINS, isOriginAllowed(), testCases

### Community 136 - "11. Risks and Mitigation"
Cohesion: 0.67
Nodes (3): 11.1 Technical Risks, 11.2 Business Risks, 11. Risks and Mitigation

### Community 137 - "14. Appendix"
Cohesion: 0.67
Nodes (3): 14.1 Glossary, 14.2 References, 14. Appendix

### Community 138 - "2. Stakeholders"
Cohesion: 0.67
Nodes (3): 2.1 Primary Stakeholders, 2.2 Secondary Stakeholders, 2. Stakeholders

### Community 139 - "12. Monitoring & Metrics"
Cohesion: 0.67
Nodes (3): 12.1 Generation Metrics, 12.2 Usage Metrics (Optional, Opt-In), 12. Monitoring & Metrics

### Community 140 - "13. Future Enhancements"
Cohesion: 0.67
Nodes (3): 13.1 Phase 2 Features, 13.2 Phase 3 Features, 13. Future Enhancements

### Community 141 - "4. Data Model"
Cohesion: 0.67
Nodes (3): 4.1 Embedded Review Data Structure, 4.2 Comment Data Structure, 4. Data Model

### Community 142 - "8. Error Handling"
Cohesion: 0.67
Nodes (3): 8.1 Generation Errors, 8.2 Runtime Errors, 8. Error Handling

### Community 143 - "9. Integration Points"
Cohesion: 0.67
Nodes (3): 9.1 CLI Integration, 9.2 Web Interface Integration, 9. Integration Points

### Community 145 - "dependencies"
Cohesion: 0.67
Nodes (3): dependencies, cors, express

### Community 146 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

### Community 147 - "🐛 Troubleshooting"
Cohesion: 0.67
Nodes (3): Common Issues, Performance Issues, 🐛 Troubleshooting

### Community 148 - "🔧 Configuration"
Cohesion: 0.67
Nodes (3): 🔧 Configuration, Environment Variables, Project Configuration

### Community 149 - "🤝 Contributing"
Cohesion: 0.67
Nodes (3): 🤝 Contributing, Development Setup, Reporting Issues

### Community 150 - "📊 Export Formats"
Cohesion: 0.67
Nodes (3): 📊 Export Formats, Individual File Reviews, Unified Review (`AI_REVIEW.md`)

### Community 151 - "galleryBanner"
Cohesion: 0.67
Nodes (3): galleryBanner, color, theme

### Community 152 - "repository"
Cohesion: 0.67
Nodes (3): repository, type, url

## Knowledge Gaps
- **1171 isolated node(s):** `{ spawn, execFileSync }`, `path`, `fs`, `VERSION`, `args` (+1166 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1265 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `api-client.py` to `.generateUnifiedReview`, `export-ai-review.js`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `STOP conditions` connect `export-ai-review.js` to `api-client.py`, `Plan 009: Drive CLI export listing through the Git working-tree module`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `isTooLarge()` connect `export-ai-review.js` to `ai-review.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `GitStatusParser` (e.g. with `Current state` and `Step 1: Trim `server.js` requires`) actually correct?**
  _`GitStatusParser` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ spawn, execFileSync }`, `path`, `fs` to the rest of the system?**
  _1171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GitStatusParser` be split into smaller, more focused modules?**
  _Cohesion score 0.05727644652250146 - nodes in this community are weakly interconnected._
- **Should `GitService` be split into smaller, more focused modules?**
  _Cohesion score 0.07138047138047138 - nodes in this community are weakly interconnected._