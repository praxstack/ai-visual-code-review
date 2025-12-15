#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3002;

// Get version from package.json
function getVersion() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    return 'unknown';
  }
}

const VERSION = getVersion();

function showVersion() {
  console.log(`ai-visual-code-review v${VERSION}`);
}

function showHelp() {
  console.log(`
🔍 AI Visual Code Review v${VERSION}

Visual code review tool with AI integration for any Git repository.

Usage: ai-review [command] [options]

Commands:
  start, serve, s     Start the visual review server (default)
  quick, q            Generate AI_REVIEW.md from staged changes
  help, h             Show this help message

Global Options:
  --version, -v       Show version number
  --help, -h          Show this help message

Start Options:
  --port, -p <port>   Server port (default: 3002)
  --open, -o          Open browser automatically after starting

Quick Options:
  --include <pattern> Include only files matching pattern (glob/wildcard)
  --exclude <pattern> Exclude files matching pattern (glob/wildcard)
  --split             Generate individual review files per source file
  --output-dir <dir>  Directory for split reviews (default: timestamped)

Examples:
  ai-review                       Start visual review server on port 3002
  ai-review start                 Same as above
  ai-review start -p 3003         Start server on port 3003
  ai-review start -o              Start and open browser
  ai-review quick                 Generate AI_REVIEW.md from staged files
  ai-review quick --split         Generate individual reviews in code-reviews-YYYY...
  ai-review quick --split --output-dir my-reviews
  ai-review quick --exclude "*.md" "dist/*"  Exclude markdown and dist files
  ai-review -v                    Show version
  ai-review --help                Show this help

Workflow:
  1. Stage your changes: git add .
  2. Start the server:   ai-review start
  3. Open browser:       http://localhost:3002
  4. Review and export for ChatGPT/Claude

Repository: https://github.com/PrakharMNNIT/ai-visual-code-review
npm:        https://www.npmjs.com/package/ai-visual-code-review
  `);
}

function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ Error: Not a git repository');
    console.log('💡 Please run this command inside a git repository');
    console.log('   Initialize with: git init');
    return false;
  }
}

function startServer(port = PORT, openBrowser = false) {
  console.log('🔍 Starting AI Visual Code Review Server...');
  console.log(`📁 Working directory: ${process.cwd()}`);

  if (!checkGitRepo()) {
    process.exit(1);
  }

  const serverPath = path.join(__dirname, '..', 'server.js');

  // Set environment variable for port
  process.env.PORT = port;

  // Start the server
  const serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: { ...process.env, PORT: port }
  });

  // Open browser if requested
  if (openBrowser) {
    setTimeout(() => {
      const url = `http://localhost:${port}`;
      console.log(`\n🌐 Opening browser: ${url}`);

      const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
      try {
        execSync(`${start} ${url}`, { stdio: 'ignore' });
      } catch (error) {
        console.log('💡 Could not open browser automatically');
        console.log('   Please open manually:', url);
      }
    }, 2000);
  }

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down AI Visual Code Review Server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
    process.exit(code);
  });
}

function quickReview(additionalArgs = []) {
  console.log('📝 Generating quick AI review...');

  if (!checkGitRepo()) {
    process.exit(1);
  }

  const scriptPath = path.join(__dirname, '..', 'scripts', 'export-ai-review.js');

  try {
    // Build command with arguments
    const argsString = additionalArgs.join(' ');
    const command = argsString
      ? `node "${scriptPath}" ${argsString}`
      : `node "${scriptPath}"`;

    console.log(`🔍 Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.error('❌ Quick review generation failed');
    console.error(error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let command = args.length === 0 ? 'start' : args[0]; // Default to 'start' if no args
let port = PORT;
let openBrowser = false;

// Handle --version/-v first (highest priority)
if (args.includes('--version') || args.includes('-v') || args.includes('-V')) {
  showVersion();
  process.exit(0);
}

// Handle --help/-h (second priority)
if (args.includes('--help') || args.includes('-h') || args.includes('help') || args.includes('h')) {
  showHelp();
  process.exit(0);
}

// If first arg is not a known command, treat as 'start'
if (args.length > 0 && !['start', 'serve', 's', 'quick', 'q', 'version', 'v'].includes(args[0])) {
  command = 'start';
}

// Determine command first
let commandIndex = 0;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (['start', 'serve', 's', 'quick', 'q', 'version', 'v'].includes(arg)) {
    command = arg;
    commandIndex = i;
    break;
  }
}

// Handle version command (without dashes)
if (['version', 'v'].includes(command)) {
  showVersion();
  process.exit(0);
}

if (['start', 'serve', 's'].includes(command)) {
  // Parse start command options
  for (let i = commandIndex + 1; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--port':
      case '-p':
        if (i + 1 < args.length) {
          port = parseInt(args[i + 1]);
          i++; // Skip next argument
          if (isNaN(port) || port < 1 || port > 65535) {
            console.error('❌ Invalid port number');
            process.exit(1);
          }
        }
        break;

      case '--open':
      case '-o':
        openBrowser = true;
        break;

      default:
        if (arg.startsWith('-')) {
          console.error(`❌ Unknown option for start command: ${arg}`);
          console.log('💡 Use --help for usage information');
          process.exit(1);
        }
        break;
    }
  }

  startServer(port, openBrowser);

} else if (['quick', 'q'].includes(command)) {
  // Pass all remaining arguments to quick review
  const quickArgs = args.slice(commandIndex + 1);
  quickReview(quickArgs);

} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('💡 Use --help for usage information');
  process.exit(1);
}
