/**
 * Diff Service - Handles Git diff parsing and formatting
 * Extracted from main server for better maintainability and testing
 */

class DiffService {
  /**
   * Parse Git diff output into structured format
   * @param {string} diff - Raw git diff output
   * @returns {Object} Parsed diff with chunks and line information
   */
  static parseDiff(diff) {
    if (!diff || typeof diff !== 'string') {
      return { chunks: [] };
    }

    const lines = diff.split('\n');
    const chunks = [];
    let currentChunk = null;
    let oldLineNum = 0;
    let newLineNum = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse chunk header: @@ -oldStart,oldCount +newStart,newCount @@
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLineNum = parseInt(match[1]);
          newLineNum = parseInt(match[2]);
          currentChunk = {
            header: line,
            lines: []
          };
          chunks.push(currentChunk);
        }
      } else if (currentChunk && !line.startsWith('---') && !line.startsWith('+++')) {
        let type = 'context';
        let oldNum = null;
        let newNum = null;

        if (line.startsWith('+')) {
          type = 'added';
          newNum = newLineNum++;
        } else if (line.startsWith('-')) {
          type = 'removed';
          oldNum = oldLineNum++;
        } else {
          type = 'context';
          oldNum = oldLineNum++;
          newNum = newLineNum++;
        }

        currentChunk.lines.push({
          type,
          content: line,
          oldLineNum: oldNum,
          newLineNum: newNum
        });
      }
    }

    return { chunks };
  }

  /**
   * Format parsed diff with enhanced line numbers for markdown export
   * @param {Object} parsedDiff - Parsed diff structure
   * @returns {string} Formatted diff string with line numbers
   */
  static formatEnhancedDiff(parsedDiff) {
    if (!parsedDiff || !parsedDiff.chunks || parsedDiff.chunks.length === 0) {
      return '';
    }

    let formatted = '';

    parsedDiff.chunks.forEach(chunk => {
      formatted += `${chunk.header}\n`;

      chunk.lines.forEach(line => {
        const oldNum = line.oldLineNum ? String(line.oldLineNum).padStart(3, ' ') : '   ';
        const newNum = line.newLineNum ? String(line.newLineNum).padStart(3, ' ') : '   ';

        if (line.type === 'added') {
          formatted += `    ${newNum} +${line.content.substring(1)}\n`;
        } else if (line.type === 'removed') {
          formatted += `${oldNum}     -${line.content.substring(1)}\n`;
        } else {
          formatted += `${oldNum} ${newNum}  ${line.content.substring(1)}\n`;
        }
      });
    });

    return formatted;
  }

  /**
   * Generate complete diff section for AI review export
   * @param {string} diff - Raw git diff
   * @returns {string} Complete markdown diff section
   */
  static generateEnhancedDiffMarkdown(diff) {
    try {
      const parsedDiff = this.parseDiff(diff);
      const enhancedDiff = this.formatEnhancedDiff(parsedDiff);

      if (enhancedDiff) {
        return `\`\`\`diff\n${enhancedDiff}\n\`\`\`\n\n`;
      } else {
        // Fallback to standard diff if parsing fails
        return `\`\`\`diff\n${diff}\n\`\`\`\n\n`;
      }
    } catch (error) {
      console.error('Error formatting diff:', error);
      // Safe fallback to standard diff
      return `\`\`\`diff\n${diff}\n\`\`\`\n\n`;
    }
  }

  /**
   * Validate file path for security
   * @param {string} filePath - File path to validate
   * @returns {boolean} True if path is safe
   */
  static isValidFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    // Prevent directory traversal attacks
    if (filePath.includes('..') || filePath.startsWith('/') || filePath.includes('\\')) {
      return false;
    }

    // Prevent dangerous characters that could be used for command injection
    const dangerousChars = /[;&|`$(){}[\]<>'"]/;
    if (dangerousChars.test(filePath)) {
      return false;
    }

    // Prevent access to hidden files and sensitive directories
    const sensitivePatterns = ['.env', '.git/', 'node_modules/', '.ssh/', '.aws/'];
    if (sensitivePatterns.some(pattern => filePath.includes(pattern))) {
      return false;
    }

    // Additional checks for script tags and other XSS attempts
    if (filePath.toLowerCase().includes('<script>')) {
      return false;
    }

    return true;
  }
}

module.exports = DiffService;
