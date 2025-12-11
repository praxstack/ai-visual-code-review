📝 docs(oss): add comprehensive OSS files and release v2.3.0

## Summary
Complete open source project infrastructure for professional npm release.

## New Files Added (17 files)

### Documentation
- `ARCHITECTURE.md` - System architecture with diagrams
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Contributor Covenant v2.1
- `CHANGELOG.md` - Updated for v2.3.0 release

### DevOps & CI/CD
- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Local dev and production services
- `.github/workflows/ci.yml` - Node 18/20 matrix, Docker tests
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`

### Configuration
- `.editorconfig` - IDE consistency
- `.env.example` - Environment configuration template
- `.prettierrc` - Code formatting rules
- `jest.config.js` - Test configuration

### Package Updates
- `package.json` - Version 2.3.0, cleaned Jest config

## Release Highlights (v2.3.0)

### Security
- 4 critical vulnerabilities fixed
- 11 high-priority issues resolved
- Enterprise-grade architecture

### Architecture
- Modular `src/` structure (config, middleware, utils)
- VSCode extension TypeScript files
- Build process with npm scripts

### DevOps
- Docker support with health checks
- GitHub Actions CI/CD
- ESLint + Prettier configuration

## Testing
- All 30 tests pass ✅
- CLI verified working ✅
- Server verified working ✅

## npm Publish Ready
- Version: 2.3.0
- All files included in package
- prepublishOnly script runs tests
