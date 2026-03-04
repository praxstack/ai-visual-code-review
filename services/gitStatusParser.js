/**
 * Git Status Parser - Comprehensive handling of all git file status combinations
 * Handles the two-character git status format: [index][working-tree]
 */

class GitStatusParser {

  // Priority-based status mapping for determining primary action
  static statusPriorities = {
    'D': { weight: 10, action: 'deleted', icon: '🗑️', color: 'red' },
    'U': { weight: 9, action: 'conflict', icon: '⚠️', color: 'yellow' },
    'A': { weight: 8, action: 'added', icon: '✨', color: 'green' },
    'R': { weight: 7, action: 'renamed', icon: '🔄', color: 'blue' },
    'C': { weight: 6, action: 'copied', icon: '📋', color: 'green' },
    'M': { weight: 5, action: 'modified', icon: '📝', color: 'orange' },
    '?': { weight: 3, action: 'untracked', icon: '❓', color: 'gray' },
    ' ': { weight: 1, action: 'unchanged', icon: '', color: 'gray' }
  };

  // Human-readable action names
  static actionNames = {
    'M': 'Modified',
    'A': 'Added',
    'D': 'Deleted',
    'R': 'Renamed',
    'C': 'Copied',
    'U': 'Conflict',
    '?': 'Untracked',
    ' ': ''
  };

  /**
   * Parse a git status code into comprehensive display information
   * @param {string} statusCode - Two-character git status (e.g., 'AD', 'M ', ' M')
   * @returns {object} Display information with icon, badge, label, etc.
   */
  static parse(statusCode) {
    // Normalize status code to 2 characters
    const normalizedStatus = (`${statusCode  }  `).slice(0, 2);
    const indexStatus = normalizedStatus[0];
    const workingStatus = normalizedStatus[1];

    // Determine primary action based on priority
    const primaryAction = this.determinePrimaryAction(indexStatus, workingStatus);
    const label = this.generateLabel(indexStatus, workingStatus);
    const description = this.generateDescription(indexStatus, workingStatus);

    return {
      statusCode: normalizedStatus,
      indexStatus,
      workingStatus,
      primaryAction: primaryAction.action,
      icon: primaryAction.icon,
      color: primaryAction.color,
      label,
      description,
      isDeleted: this.isDeleted(normalizedStatus),
      isAdded: this.isAdded(normalizedStatus),
      isModified: this.isModified(normalizedStatus),
      hasConflict: this.hasConflict(normalizedStatus),
      priority: primaryAction.weight
    };
  }

  /**
   * Determine primary action based on priority system
   */
  static determinePrimaryAction(indexStatus, workingStatus) {
    const indexPriority = this.statusPriorities[indexStatus] || this.statusPriorities[' '];
    const workingPriority = this.statusPriorities[workingStatus] || this.statusPriorities[' '];

    // Return the higher priority action
    return indexPriority.weight >= workingPriority.weight ? indexPriority : workingPriority;
  }

  /**
   * Generate human-readable label from status codes
   */
  static generateLabel(indexStatus, workingStatus) {
    const stages = [];

    // Add index stage if present
    if (indexStatus !== ' ' && this.actionNames[indexStatus]) {
      stages.push(this.actionNames[indexStatus]);
    }

    // Add working tree stage if different and present
    if (workingStatus !== ' ' && workingStatus !== indexStatus && this.actionNames[workingStatus]) {
      if (stages.length > 0) {
        stages.push('→', this.actionNames[workingStatus]);
      } else {
        stages.push(this.actionNames[workingStatus]);
      }
    }

    return stages.length > 0 ? stages.join('') : 'Modified';
  }

  /**
   * Generate detailed description for tooltips/documentation
   */
  static generateDescription(indexStatus, workingStatus) {
    const descriptions = [];

    if (indexStatus !== ' ') {
      descriptions.push(`Staged: ${this.actionNames[indexStatus]}`);
    }

    if (workingStatus !== ' ') {
      descriptions.push(`Working: ${this.actionNames[workingStatus]}`);
    }

    return descriptions.join(', ') || 'No changes';
  }

  /**
   * Check if file should be treated as deleted
   */
  static isDeleted(statusCode) {
    return statusCode.includes('D');
  }

  /**
   * Check if file should be treated as added
   */
  static isAdded(statusCode) {
    return statusCode[0] === 'A' || statusCode[0] === 'C';
  }

  /**
   * Check if file is modified
   */
  static isModified(statusCode) {
    return statusCode.includes('M') || statusCode.includes('R');
  }

  /**
   * Check if file has conflicts
   */
  static hasConflict(statusCode) {
    return statusCode.includes('U');
  }

  /**
   * Get badge class for CSS styling
   */
  static getBadgeClass(statusCode) {
    const parsed = this.parse(statusCode);

    if (parsed.isDeleted) return 'deleted';
    if (parsed.hasConflict) return 'conflict';
    if (parsed.isAdded) return 'added';
    if (parsed.isModified) return 'modified';

    return 'modified'; // default
  }

  /**
   * Get markdown header emoji and text for file sections
   */
  static getMarkdownHeader(statusCode, filename) {
    const parsed = this.parse(statusCode);

    if (parsed.primaryAction === 'deleted') {
      return `### 🗑️ \`${filename}\` **[DELETED]**`;
    } else if (parsed.primaryAction === 'conflict') {
      return `### ⚠️ \`${filename}\` **[CONFLICT]**`;
    } else if (parsed.primaryAction === 'added') {
      return `### ✨ \`${filename}\` **[ADDED]**`;
    } else if (parsed.primaryAction === 'renamed') {
      return `### 🔄 \`${filename}\` **[RENAMED]**`;
    } else if (parsed.primaryAction === 'copied') {
      return `### 📋 \`${filename}\` **[COPIED]**`;
    } else {
      return `### 📄 \`${filename}\``;
    }
  }

  /**
   * Get status message for markdown
   */
  static getStatusMessage(statusCode) {
    const parsed = this.parse(statusCode);

    if (parsed.primaryAction === 'deleted') {
      return '**Status:** 🚨 **DELETED FILE** - This file has been completely removed';
    } else if (parsed.primaryAction === 'conflict') {
      return '**Status:** ⚠️ **CONFLICT** - This file has merge conflicts that need resolution';
    } else if (parsed.primaryAction === 'added') {
      return '**Status:** ✅ **NEW FILE** - This file has been newly created';
    } else if (parsed.primaryAction === 'renamed') {
      return '**Status:** 🔄 **RENAMED** - This file has been renamed or moved';
    } else if (parsed.primaryAction === 'copied') {
      return '**Status:** 📋 **COPIED** - This file has been copied from another file';
    } else {
      return null; // No special status message needed
    }
  }

  /**
   * Validate if a status code is recognized
   */
  static isValidStatus(statusCode) {
    if (!statusCode || statusCode.length !== 2) return false;

    const validChars = ['M', 'A', 'D', 'R', 'C', 'U', '?', ' '];
    return validChars.includes(statusCode[0]) && validChars.includes(statusCode[1]);
  }

  /**
   * Get all possible status combinations (for testing)
   */
  static getAllPossibleStatuses() {
    const chars = ['M', 'A', 'D', 'R', 'C', 'U', '?', ' '];
    const combinations = [];

    for (const index of chars) {
      for (const working of chars) {
        combinations.push(index + working);
      }
    }

    return combinations;
  }

  /**
   * Test the parser with common scenarios
   */
  static runTests() {
    const testCases = [
      { status: 'M ', expected: 'Modified (staged)' },
      { status: ' M', expected: 'Modified (working)' },
      { status: 'A ', expected: 'Added' },
      { status: 'D ', expected: 'Deleted' },
      { status: 'AD', expected: 'Added→Deleted' },
      { status: 'AM', expected: 'Added→Modified' },
      { status: 'MD', expected: 'Modified→Deleted' },
      { status: 'RM', expected: 'Renamed→Modified' },
      { status: 'UU', expected: 'Conflict' },
      { status: '??', expected: 'Untracked' }
    ];

    console.log('🧪 GitStatusParser Test Results:');
    testCases.forEach(test => {
      const result = this.parse(test.status);
      console.log(`${test.status} → ${result.label} (${result.description})`);
    });
  }
}

module.exports = GitStatusParser;
