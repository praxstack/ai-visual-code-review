const DiffService = require('../services/diffService');

describe('DiffService', () => {
  describe('parseDiff', () => {
    test('should handle empty diff', () => {
      const result = DiffService.parseDiff('');
      expect(result).toEqual({ chunks: [] });
    });

    test('should handle null/undefined diff', () => {
      expect(DiffService.parseDiff(null)).toEqual({ chunks: [] });
      expect(DiffService.parseDiff(undefined)).toEqual({ chunks: [] });
    });

    test('should parse simple diff correctly', () => {
      const diff = `@@ -1,3 +1,3 @@
 line1
-old line
+new line
 line3`;

      const result = DiffService.parseDiff(diff);

      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].header).toBe('@@ -1,3 +1,3 @@');
      expect(result.chunks[0].lines).toHaveLength(4);

      // Check line types
      expect(result.chunks[0].lines[0].type).toBe('context');
      expect(result.chunks[0].lines[1].type).toBe('removed');
      expect(result.chunks[0].lines[2].type).toBe('added');
      expect(result.chunks[0].lines[3].type).toBe('context');
    });

    test('should handle multiple chunks', () => {
      const diff = `@@ -1,2 +1,2 @@
-old1
+new1
@@ -5,2 +5,2 @@
-old2
+new2`;

      const result = DiffService.parseDiff(diff);
      expect(result.chunks).toHaveLength(2);
    });

    test('should calculate line numbers correctly', () => {
      const diff = `@@ -10,4 +10,4 @@
 context
-removed
+added
 context`;

      const result = DiffService.parseDiff(diff);
      const lines = result.chunks[0].lines;

      expect(lines[0].oldLineNum).toBe(10);
      expect(lines[0].newLineNum).toBe(10);
      expect(lines[1].oldLineNum).toBe(11);
      expect(lines[1].newLineNum).toBe(null);
      expect(lines[2].oldLineNum).toBe(null);
      expect(lines[2].newLineNum).toBe(11);
    });
  });

  describe('formatEnhancedDiff', () => {
    test('should handle empty parsed diff', () => {
      const result = DiffService.formatEnhancedDiff({ chunks: [] });
      expect(result).toBe('');
    });

    test('should format diff with line numbers', () => {
      const parsedDiff = {
        chunks: [{
          header: '@@ -1,3 +1,3 @@',
          lines: [
            { type: 'context', content: ' line1', oldLineNum: 1, newLineNum: 1 },
            { type: 'removed', content: '-old line', oldLineNum: 2, newLineNum: null },
            { type: 'added', content: '+new line', oldLineNum: null, newLineNum: 2 }
          ]
        }]
      };

      const result = DiffService.formatEnhancedDiff(parsedDiff);

      expect(result).toContain('@@ -1,3 +1,3 @@');
      expect(result).toContain('  1   1  line1');
      expect(result).toContain('  2     -old line');
      expect(result).toContain('      2 +new line');
    });
  });

  describe('generateEnhancedDiffMarkdown', () => {
    test('should wrap diff in markdown code block', () => {
      const diff = '@@ -1,1 +1,1 @@\n-old\n+new';
      const result = DiffService.generateEnhancedDiffMarkdown(diff);

      expect(result).toMatch(/^```diff\n/);
      expect(result).toMatch(/\n```\n\n$/);
    });

    test('should handle parsing errors gracefully', () => {
      const invalidDiff = 'not a valid diff';
      const result = DiffService.generateEnhancedDiffMarkdown(invalidDiff);

      expect(result).toContain('```diff\n');
      expect(result).toContain(invalidDiff);
      expect(result).toContain('\n```\n\n');
    });
  });

  describe('isValidFilePath', () => {
    test('should accept valid file paths', () => {
      const validPaths = [
        'src/index.js',
        'components/Header.tsx',
        'utils.js',
        'folder/subfolder/file.json',
        'test-file.ts',
        'file_name.js',
        'file.name.js'
      ];

      validPaths.forEach(path => {
        expect(DiffService.isValidFilePath(path)).toBe(true);
      });
    });

    test('should reject invalid file paths', () => {
      const invalidPaths = [
        null,
        undefined,
        '',
        123,
        '../../../etc/passwd',
        '/etc/passwd',
        '..\\windows\\system32',
        'file\\..\\..',
        '.env',
        '.git/config',
        'node_modules/package/index.js',
        '.ssh/id_rsa',
        '.aws/credentials'
      ];

      invalidPaths.forEach(path => {
        expect(DiffService.isValidFilePath(path)).toBe(false);
      });
    });

    test('should reject paths with dangerous characters', () => {
      const dangerousPaths = [
        'file;rm -rf /',
        'file|cat /etc/passwd',
        'file`whoami`',
        'file&&rm -rf /',
        'file||echo hack',
        'file<script>alert(1)</script>'
      ];

      dangerousPaths.forEach(path => {
        expect(DiffService.isValidFilePath(path)).toBe(false);
      });
    });

    test('should accept bracket, paren, brace and dollar paths [review: MINOR-2]', () => {
      ['app/[id]/page.tsx', 'app/(marketing)/page.tsx', 'x$y{z}.txt', 'file$(whoami)'].forEach(p => {
        expect(DiffService.isValidFilePath(p)).toBe(true);
      });
    });

    test('should reject git magic pathspecs [AVCR-001]', () => {
      [':/', ':!src/index.js', ':^src/index.js', ':(exclude)src/index.js', ':(glob)**', ':'].forEach(p => {
        expect(DiffService.isValidFilePath(p)).toBe(false);
      });
      expect(DiffService.isValidFilePath('src/a:b.js')).toBe(true);
    });
  });
});
