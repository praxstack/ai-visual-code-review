const GitStatusParser = require('../services/gitStatusParser');

describe('GitStatusParser', () => {
  describe('parse', () => {
    test('should parse "M " (staged modified) correctly', () => {
      const result = GitStatusParser.parse('M ');
      expect(result.statusCode).toBe('M ');
      expect(result.indexStatus).toBe('M');
      expect(result.workingStatus).toBe(' ');
      expect(result.primaryAction).toBe('modified');
      expect(result.priority).toBe(5);
      expect(result.label).toBe('Modified');
      expect(result.isModified).toBe(true);
    });

    test('should parse " M" (unstaged modified) correctly', () => {
      const result = GitStatusParser.parse(' M');
      expect(result.statusCode).toBe(' M');
      expect(result.indexStatus).toBe(' ');
      expect(result.workingStatus).toBe('M');
      expect(result.primaryAction).toBe('modified');
      expect(result.label).toBe('Modified');
    });

    test('should parse "AD" (added in index, deleted in working tree) correctly', () => {
      const result = GitStatusParser.parse('AD');
      expect(result.statusCode).toBe('AD');
      expect(result.primaryAction).toBe('deleted'); // 'D' has weight 10, 'A' has weight 8
      expect(result.label).toBe('Added→Deleted');
      expect(result.isAdded).toBe(true);
      expect(result.isDeleted).toBe(true);
    });

    test('should handle single character status code by padding with space', () => {
      const result = GitStatusParser.parse('M');
      expect(result.statusCode).toBe('M ');
      expect(result.indexStatus).toBe('M');
      expect(result.workingStatus).toBe(' ');
    });

    test('should parse "UU" (conflict) correctly', () => {
      const result = GitStatusParser.parse('UU');
      expect(result.primaryAction).toBe('conflict');
      expect(result.hasConflict).toBe(true);
    });

    test('should parse "??" (untracked) correctly', () => {
      const result = GitStatusParser.parse('??');
      expect(result.primaryAction).toBe('untracked');
      expect(result.label).toBe('Untracked');
    });
  });

  describe('determinePrimaryAction', () => {
    test('should pick the status with higher priority', () => {
      // D (10) vs M (5)
      const action = GitStatusParser.determinePrimaryAction('D', 'M');
      expect(action.action).toBe('deleted');

      // M (5) vs A (8)
      const action2 = GitStatusParser.determinePrimaryAction('M', 'A');
      expect(action2.action).toBe('added');
    });

    test('should return index status if priorities are equal', () => {
      const action = GitStatusParser.determinePrimaryAction('M', 'M');
      expect(action.action).toBe('modified');
    });
  });

  describe('generateLabel', () => {
    test('should combine different statuses with an arrow', () => {
      expect(GitStatusParser.generateLabel('A', 'M')).toBe('Added→Modified');
      expect(GitStatusParser.generateLabel('R', 'D')).toBe('Renamed→Deleted');
    });

    test('should return single status label if statuses are the same or one is empty', () => {
      expect(GitStatusParser.generateLabel('M', ' ')).toBe('Modified');
      expect(GitStatusParser.generateLabel(' ', 'M')).toBe('Modified');
      expect(GitStatusParser.generateLabel('M', 'M')).toBe('Modified');
    });

    test('should return "Modified" as default for unknown/empty combos', () => {
      expect(GitStatusParser.generateLabel(' ', ' ')).toBe('Modified');
    });
  });

  describe('generateDescription', () => {
    test('should describe both staged and working changes', () => {
      expect(GitStatusParser.generateDescription('A', 'M')).toBe('Staged: Added, Working: Modified');
    });

    test('should describe only staged change if working is empty', () => {
      expect(GitStatusParser.generateDescription('M', ' ')).toBe('Staged: Modified');
    });

    test('should describe only working change if staged is empty', () => {
      expect(GitStatusParser.generateDescription(' ', 'D')).toBe('Working: Deleted');
    });

    test('should return "No changes" if both are empty', () => {
      expect(GitStatusParser.generateDescription(' ', ' ')).toBe('No changes');
    });
  });

  describe('Boolean check methods', () => {
    test('isDeleted should detect D anywhere', () => {
      expect(GitStatusParser.isDeleted('D ')).toBe(true);
      expect(GitStatusParser.isDeleted(' D')).toBe(true);
      expect(GitStatusParser.isDeleted('AD')).toBe(true);
      expect(GitStatusParser.isDeleted('M ')).toBe(false);
    });

    test('isAdded should detect A or C in index', () => {
      expect(GitStatusParser.isAdded('A ')).toBe(true);
      expect(GitStatusParser.isAdded('C ')).toBe(true);
      expect(GitStatusParser.isAdded(' M')).toBe(false);
      expect(GitStatusParser.isAdded('MA')).toBe(false); // Only index A/C counts for isAdded
    });

    test('isModified should detect M or R anywhere', () => {
      expect(GitStatusParser.isModified('M ')).toBe(true);
      expect(GitStatusParser.isModified(' M')).toBe(true);
      expect(GitStatusParser.isModified('R ')).toBe(true);
      expect(GitStatusParser.isModified(' R')).toBe(true);
      expect(GitStatusParser.isModified('A ')).toBe(false);
    });

    test('hasConflict should detect U anywhere', () => {
      expect(GitStatusParser.hasConflict('UU')).toBe(true);
      expect(GitStatusParser.hasConflict('AA')).toBe(false);
    });
  });

  describe('getBadgeClass', () => {
    test('should return correct CSS classes', () => {
      expect(GitStatusParser.getBadgeClass('D ')).toBe('deleted');
      expect(GitStatusParser.getBadgeClass('UU')).toBe('conflict');
      expect(GitStatusParser.getBadgeClass('A ')).toBe('added');
      expect(GitStatusParser.getBadgeClass('M ')).toBe('modified');
      expect(GitStatusParser.getBadgeClass('??')).toBe('modified'); // default
    });
  });

  describe('getMarkdownHeader', () => {
    test('should format markdown header correctly', () => {
      expect(GitStatusParser.getMarkdownHeader('D ', 'file.js')).toBe('### 🗑️ `file.js` **[DELETED]**');
      expect(GitStatusParser.getMarkdownHeader('A ', 'file.js')).toBe('### ✨ `file.js` **[ADDED]**');
      expect(GitStatusParser.getMarkdownHeader('UU', 'file.js')).toBe('### ⚠️ `file.js` **[CONFLICT]**');
      expect(GitStatusParser.getMarkdownHeader('R ', 'file.js')).toBe('### 🔄 `file.js` **[RENAMED]**');
      expect(GitStatusParser.getMarkdownHeader('C ', 'file.js')).toBe('### 📋 `file.js` **[COPIED]**');
      expect(GitStatusParser.getMarkdownHeader('M ', 'file.js')).toBe('### 📄 `file.js`');
    });
  });

  describe('getStatusMessage', () => {
    test('should return appropriate status messages', () => {
      expect(GitStatusParser.getStatusMessage('D ')).toContain('DELETED FILE');
      expect(GitStatusParser.getStatusMessage('A ')).toContain('NEW FILE');
      expect(GitStatusParser.getStatusMessage('UU')).toContain('CONFLICT');
      expect(GitStatusParser.getStatusMessage('R ')).toContain('RENAMED');
      expect(GitStatusParser.getStatusMessage('C ')).toContain('COPIED');
      expect(GitStatusParser.getStatusMessage('M ')).toBeNull();
    });
  });

  describe('isValidStatus', () => {
    test('should return true for valid 2-char codes', () => {
      expect(GitStatusParser.isValidStatus('M ')).toBe(true);
      expect(GitStatusParser.isValidStatus('??')).toBe(true);
      expect(GitStatusParser.isValidStatus('AD')).toBe(true);
    });

    test('should return false for invalid codes', () => {
      expect(GitStatusParser.isValidStatus('XX')).toBe(false);
      expect(GitStatusParser.isValidStatus('M')).toBe(false);
      expect(GitStatusParser.isValidStatus(null)).toBe(false);
      expect(GitStatusParser.isValidStatus('')).toBe(false);
    });
  });

  describe('getAllPossibleStatuses', () => {
    test('should return 64 combinations', () => {
      const statuses = GitStatusParser.getAllPossibleStatuses();
      expect(statuses).toHaveLength(64);
      expect(statuses).toContain('M ');
      expect(statuses).toContain('AD');
      expect(statuses).toContain('??');
    });
  });
});
