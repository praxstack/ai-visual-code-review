# AI Visual Code Review - Architecture Documentation

## 📋 Overview

AI Visual Code Review is a visual code review tool that integrates with Git repositories and provides AI-optimized exports for code analysis with ChatGPT/Claude.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Web Browser   │  │   CLI Tool      │  │ VSCode Extension│  │
│  │   (index.html)  │  │  (ai-review)    │  │    (TypeScript) │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Express.js Server                        ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐││
│  │  │ Security│  │  Rate   │  │  CORS   │  │   Validation    │││
│  │  │ Headers │  │ Limiting│  │ Policy  │  │   Middleware    │││
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘││
│  └───────┼───────────┼───────────┼────────────────┼──────────┘│
└──────────┼───────────┼───────────┼────────────────┼───────────┘
           │           │           │                │
           ▼           ▼           ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   DiffService   │  │ GitStatusParser │  │   Git Commands  │  │
│  │   (Parsing)     │  │   (Status Map)  │  │   (execFile)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Git Repository │  │  File System    │  │   Memory Cache  │  │
│  │   (Local Git)   │  │  (AI_REVIEW.md) │  │   (Request)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
ai-visual-code-review/
├── bin/                    # CLI entry point
│   └── ai-review.js        # Main CLI script
├── public/                 # Frontend static files
│   └── index.html          # Single-page web interface
├── services/               # Business logic
│   ├── diffService.js      # Diff parsing and formatting
│   └── gitStatusParser.js  # Git status code mapping
├── src/                    # Modular source code
│   ├── config/             # Configuration management
│   │   └── index.js        # Centralized config
│   ├── middleware/         # Express middleware
│   │   ├── index.js        # Exports
│   │   ├── security.js     # Security headers, CSP
│   │   └── rateLimit.js    # Rate limiting
│   └── utils/              # Utility functions
│       ├── index.js        # Exports
│       ├── validation.js   # Input validation
│       └── gitCommands.js  # Secure git execution
├── scripts/                # Standalone scripts
│   ├── export-ai-review.js # Quick export script
│   └── quick-ai-review.sh  # Shell wrapper
├── test/                   # Test files
│   ├── server.test.js      # API tests
│   ├── diffService.test.js # Service tests
│   └── spaces-in-paths.test.js
├── vscode-extension/       # VSCode extension
│   └── src/
│       ├── extension.ts    # Extension entry
│       ├── services/       # TypeScript services
│       ├── providers/      # Tree view providers
│       └── webview/        # Webview panels
├── server.js               # Main Express server
├── package.json            # NPM package config
└── README.md               # Documentation
```

## 🔒 Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────┐
│           Layer 1: Input Validation          │
│  • Path traversal prevention                 │
│  • Command injection blocking                │
│  • File path length limits                   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Layer 2: Rate Limiting             │
│  • 50 requests per 15 minutes               │
│  • 10 exports per 15 minutes                │
│  • IP-based tracking                        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Layer 3: Security Headers          │
│  • Content-Security-Policy                  │
│  • X-Frame-Options: DENY                    │
│  • X-Content-Type-Options: nosniff          │
│  • Strict-Transport-Security (HTTPS)        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Layer 4: Git Command Security      │
│  • Whitelist-only commands                  │
│  • execFile (not exec) for argument safety  │
│  • Timeout limits                           │
└─────────────────────────────────────────────┘
```

### Allowed Git Commands (Whitelist)

| Command Key | Git Command |
|-------------|-------------|
| `diff-cached` | `git diff --cached` |
| `diff-cached-names` | `git diff --cached --name-only` |
| `diff-cached-stat` | `git diff --cached --stat` |
| `status-porcelain` | `git status --porcelain` |

## 🔄 Data Flow

### Export Flow

```
1. User clicks "Export for AI Review"
           │
           ▼
2. Frontend sends POST /api/export-for-ai
   { comments, lineComments, excludedFiles }
           │
           ▼
3. Server validates request body
           │
           ▼
4. executeGitCommand('diff-cached-names')
   → Get list of staged files
           │
           ▼
5. For each included file:
   executeGitCommand('diff-cached', ['--', file])
   → Parse diff with DiffService
           │
           ▼
6. Generate AI_REVIEW.md with:
   • Change summary
   • Enhanced diffs with line numbers
   • Review checklist
           │
           ▼
7. Write file to working directory
           │
           ▼
8. Return success response to client
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Web interface |
| GET | `/api/health` | Health check + repo status |
| GET | `/api/summary` | Change statistics |
| GET | `/api/staged-files` | List staged files |
| GET | `/api/file-diff` | Get diff for specific file |
| POST | `/api/log-comment` | Log comment activity |
| POST | `/api/export-for-ai` | Generate AI_REVIEW.md |
| POST | `/api/export-individual-reviews` | Generate per-file reviews |

## 🎯 Design Decisions

### 1. Single HTML File (public/index.html)

**Rationale:** Simplicity for a local development tool. No build process required for frontend modifications.

**Trade-offs:**
- ✅ Zero frontend build setup
- ✅ Easy to understand and modify
- ❌ Limited to vanilla JavaScript
- ❌ No component reusability

### 2. execFile over exec

**Rationale:** Security. execFile properly escapes arguments, preventing command injection attacks.

```javascript
// ❌ Vulnerable
exec(`git diff --cached -- ${file}`)

// ✅ Secure
execFile('git', ['diff', '--cached', '--', file])
```

### 3. Whitelist Git Commands

**Rationale:** Only allow specific git commands to prevent arbitrary command execution.

### 4. Modular src/ Structure

**Rationale:** Prepare for future scalability while keeping backward compatibility with existing server.js.

## 🚀 Future Architecture Plans

### Phase 1: TypeScript Migration
- Convert services/ to TypeScript
- Add type definitions for API responses
- Share types with VSCode extension

### Phase 2: Build Process
- Add Vite or esbuild for frontend
- CSS preprocessing (Tailwind/PostCSS)
- Code splitting for large diffs

### Phase 3: Plugin Architecture
- Support for custom export formats
- Pluggable AI providers
- Custom review templates

---

*Last updated: December 2025*
*Version: 2.3.0*
