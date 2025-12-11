/**
 * DiffService - Handles Git diff parsing and formatting for VSCode extension
 * Enterprise-grade implementation for AI Visual Code Review
 */

export interface DiffChunk {
    header: string;
    lines: DiffLine[];
}

export interface DiffLine {
    type: 'added' | 'removed' | 'context';
    content: string;
    oldLineNum: number | null;
    newLineNum: number | null;
}

export interface ParsedDiff {
    chunks: DiffChunk[];
}

export class DiffService {
    /**
     * Parse Git diff output into structured format
     * @param diff - Raw git diff output
     * @returns Parsed diff with chunks and line information
     */
    parseDiff(diff: string): ParsedDiff {
        if (!diff || typeof diff !== 'string') {
            return { chunks: [] };
        }

        const lines = diff.split('\n');
        const chunks: DiffChunk[] = [];
        let currentChunk: DiffChunk | null = null;
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
                let type: 'added' | 'removed' | 'context' = 'context';
                let oldNum: number | null = null;
                let newNum: number | null = null;

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
     * @param parsedDiff - Parsed diff structure
     * @returns Formatted diff string with line numbers
     */
    formatEnhancedDiff(parsedDiff: ParsedDiff): string {
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
     * @param diff - Raw git diff
     * @returns Complete markdown diff section
     */
    generateEnhancedDiffMarkdown(diff: string): string {
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
}
