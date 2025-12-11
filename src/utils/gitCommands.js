/**
 * Git Commands Utilities Module
 * Secure git command execution
 */

const { execFile } = require('child_process');
const CONFIG = require('../config');

// Allowed git commands (whitelist approach)
const ALLOWED_GIT_COMMANDS = {
  'diff-cached': ['git', 'diff', '--cached'],
  'diff-cached-names': ['git', 'diff', '--cached', '--name-only'],
  'diff-cached-stat': ['git', 'diff', '--cached', '--stat'],
  'status-porcelain': ['git', 'status', '--porcelain']
};

/**
 * Execute git command securely using whitelist
 * @param {string} commandType - Type of git command
 * @param {Array} args - Additional arguments
 * @returns {Promise<string>} Command output
 */
async function executeGitCommand(commandType, args = []) {
  return new Promise((resolve, reject) => {
    const baseCommand = ALLOWED_GIT_COMMANDS[commandType];
    if (!baseCommand) {
      return reject(new Error(`Invalid git command type: ${commandType}`));
    }

    // Sanitize and validate arguments
    const sanitizedArgs = args.filter(arg => {
      if (typeof arg !== 'string') return false;
      // Prevent command injection patterns
      if (/[;&|`$(){}[\]\\]/.test(arg)) return false;
      // Prevent path traversal (allow relative paths within repo)
      if (arg.includes('..') && !arg.startsWith('./')) return false;
      return true;
    });

    const gitCommand = baseCommand[0];
    const gitArgs = [...baseCommand.slice(1), ...sanitizedArgs];

    execFile(gitCommand, gitArgs, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      timeout: CONFIG.git.timeout,
      maxBuffer: CONFIG.git.maxBuffer
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Git command failed: ${gitCommand} ${gitArgs.join(' ')}`, stderr);
        reject(new Error(`Git operation failed: ${error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  executeGitCommand,
  ALLOWED_GIT_COMMANDS
};
