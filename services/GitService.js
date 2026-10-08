const { execFile } = require('child_process');

class GitService {
  constructor() {
    this.ALLOWED_COMMANDS = {
      'diff-cached': ['git', 'diff', '--cached'],
      'diff-cached-names': ['git', 'diff', '--cached', '--name-only'],
      'diff-cached-stat': ['git', 'diff', '--cached', '--stat'],
      'status-porcelain': ['git', 'status', '--porcelain'],
      'diff-name-status': ['git', 'diff', '--cached', '--name-status']
    };

    // Configuration defaults
    this.config = {
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    };
  }

  /**
   * Execute a secure git command
   * @param {string} commandType - Key from ALLOWED_COMMANDS
   * @param {string[]} args - Additional arguments
   * @returns {Promise<string>} Command stdout
   */
  async execute(commandType, args = []) {
    return new Promise((resolve, reject) => {
      const baseCommand = this.ALLOWED_COMMANDS[commandType];
      if (!baseCommand) {
        return reject(new Error(`Invalid git command type: ${commandType}`));
      }

      // execFile passes argv directly (no shell), so shell metacharacters are inert.
      // Everything after a literal "--" is a pathspec and must be passed verbatim;
      // only options before "--" are restricted.
      const sepIndex = args.indexOf('--');
      const optionArgs = sepIndex === -1 ? args : args.slice(0, sepIndex);
      const pathArgs = sepIndex === -1 ? [] : args.slice(sepIndex + 1);

      if (![...optionArgs, ...pathArgs].every(arg => typeof arg === 'string' && !arg.includes('\0'))) {
        return reject(new Error('Invalid git argument'));
      }
      const sanitizedOptions = optionArgs.filter(arg => {
        if (/[;&|`$(){}[\]\\]/.test(arg)) return false;
        if (arg.includes('..') && !arg.startsWith('./')) return false;
        return true;
      });
      const sanitizedArgs = sepIndex === -1 ? sanitizedOptions : [...sanitizedOptions, '--', ...pathArgs];

      const gitCommand = baseCommand[0];
      const gitArgs = [...baseCommand.slice(1), ...sanitizedArgs];
      const commandDisplay = [gitCommand, ...gitArgs].join(' ');

      execFile(gitCommand, gitArgs, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        timeout: this.config.timeout,
        maxBuffer: this.config.maxBuffer
      }, (error, stdout, stderr) => {
        if (error) {
          // console.error(`Git command failed: ${commandDisplay}`, stderr); // Optional: enable for debug
          reject(new Error(`Git operation failed: ${error.message}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Get list of staged files
   * @returns {Promise<string[]>}
   */
  async getStagedFiles() {
    const output = await this.execute('diff-cached-names');
    return output.trim() ? output.trim().split('\n').filter(f => f.length > 0) : [];
  }

  /**
   * Get diff for specific file
   * @param {string} file
   * @returns {Promise<string>}
   */
  async getDiffForFile(file) {
    return this.execute('diff-cached', ['--', file]);
  }

  /**
   * Get repo status stats
   * @returns {Promise<string>}
   */
  async getDiffStats() {
    return this.execute('diff-cached-stat');
  }

  /**
   * Get file statuses (M, A, D, etc)
   * @returns {Promise<Object>} Map of filename -> status
   */
  async getFileStatuses() {
    const output = await this.execute('diff-name-status');
    const statusLines = output.trim().split('\n').filter(line => line.length > 0);
    const statuses = {};

    statusLines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const status = parts[0];
        const filename = parts[1];
        statuses[filename] = status;
      }
    });

    return statuses;
  }
}

module.exports = new GitService();
