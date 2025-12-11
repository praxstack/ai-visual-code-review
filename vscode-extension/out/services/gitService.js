"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitService = void 0;
const child_process_1 = require("child_process");
const path = require("path");
const vscode = require("vscode");
class GitService {
    constructor() {
        this.gitExtension = vscode.extensions.getExtension('vscode.git');
    }
    /**
     * Get VS Code's Git API
     */
    getGitAPI() {
        if (!this.gitExtension) {
            throw new Error('Git extension not found');
        }
        if (!this.gitExtension.isActive) {
            throw new Error('Git extension not active');
        }
        return this.gitExtension.exports.getAPI(1);
    }
    /**
     * Get the active Git repository
     */
    getRepository() {
        const git = this.getGitAPI();
        if (git.repositories.length === 0) {
            throw new Error('No Git repository found');
        }
        // Use the first repository (most common case)
        return git.repositories[0];
    }
    /**
     * Get all staged files using VS Code Git API
     */
    async getStagedFiles(workspaceRoot) {
        try {
            const repository = this.getRepository();
            // Get index changes (staged files)
            const indexChanges = repository.state.indexChanges || [];
            return indexChanges.map((change) => {
                // Convert VS Code's URI to relative path
                if (change.uri && change.uri.fsPath) {
                    const workspaceFolder = vscode.workspace.getWorkspaceFolder(change.uri);
                    if (workspaceFolder) {
                        return path.relative(workspaceFolder.uri.fsPath, change.uri.fsPath);
                    }
                    return change.uri.fsPath;
                }
                return change.resourceUri ?
                    path.relative(workspaceRoot || '', change.resourceUri.fsPath) :
                    '';
            }).filter((file) => file.length > 0);
        }
        catch (error) {
            console.error('Failed to get staged files via VS Code API, falling back to command line:', error);
            // Fallback to command line git
            try {
                const output = (0, child_process_1.execSync)('git diff --cached --name-only', {
                    cwd: workspaceRoot || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                    encoding: 'utf8'
                });
                return output.trim() ? output.trim().split('\n').filter(f => f.length > 0) : [];
            }
            catch (cmdError) {
                console.error('Command line fallback also failed:', cmdError);
                return [];
            }
        }
    }
    /**
     * Get diff statistics using Git command
     */
    async getDiffStats(workspaceRoot) {
        try {
            const output = (0, child_process_1.execSync)('git diff --cached --stat', {
                cwd: workspaceRoot,
                encoding: 'utf8'
            });
            return output.trim() || 'No changes';
        }
        catch (error) {
            console.error('Failed to get diff stats:', error);
            return 'Unable to get statistics';
        }
    }
    /**
     * Get diff for a specific file
     */
    async getFileDiff(workspaceRoot, filename) {
        try {
            const output = (0, child_process_1.execSync)(`git diff --cached -- "${filename}"`, {
                cwd: workspaceRoot,
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });
            return output;
        }
        catch (error) {
            console.error(`Failed to get diff for ${filename}:`, error);
            return '';
        }
    }
    /**
     * Get repository status information
     */
    async getRepositoryStatus(workspaceRoot) {
        try {
            const repository = this.getRepository();
            const stagedCount = repository.state.indexChanges?.length || 0;
            const unstagedCount = repository.state.workingTreeChanges?.length || 0;
            const branch = repository.state.HEAD?.name || 'unknown';
            return {
                stagedCount,
                unstagedCount,
                totalChanges: stagedCount + unstagedCount,
                branch
            };
        }
        catch (error) {
            console.error('Failed to get repository status via API, using fallback:', error);
            // Fallback to command line
            try {
                const stagedOutput = (0, child_process_1.execSync)('git diff --cached --name-only', {
                    cwd: workspaceRoot,
                    encoding: 'utf8'
                });
                const unstagedOutput = (0, child_process_1.execSync)('git diff --name-only', {
                    cwd: workspaceRoot,
                    encoding: 'utf8'
                });
                const branchOutput = (0, child_process_1.execSync)('git branch --show-current', {
                    cwd: workspaceRoot,
                    encoding: 'utf8'
                });
                const stagedFiles = stagedOutput.trim() ? stagedOutput.trim().split('\n').filter(f => f) : [];
                const unstagedFiles = unstagedOutput.trim() ? unstagedOutput.trim().split('\n').filter(f => f) : [];
                return {
                    stagedCount: stagedFiles.length,
                    unstagedCount: unstagedFiles.length,
                    totalChanges: stagedFiles.length + unstagedFiles.length,
                    branch: branchOutput.trim() || 'unknown'
                };
            }
            catch (cmdError) {
                return {
                    stagedCount: 0,
                    unstagedCount: 0,
                    totalChanges: 0,
                    branch: 'unknown'
                };
            }
        }
    }
    /**
     * Check if current workspace is a Git repository
     */
    isGitRepository(workspaceRoot) {
        try {
            (0, child_process_1.execSync)('git rev-parse --git-dir', {
                cwd: workspaceRoot,
                stdio: 'ignore'
            });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Watch for Git changes
     */
    onRepositoryChange(callback) {
        try {
            const repository = this.getRepository();
            // Watch for index changes (staged files)
            return repository.state.onDidChange(callback);
        }
        catch (error) {
            console.error('Failed to watch repository changes:', error);
            // Fallback: watch .git/index file
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                const gitIndexPath = path.join(workspaceFolder.uri.fsPath, '.git', 'index');
                const watcher = vscode.workspace.createFileSystemWatcher(gitIndexPath);
                watcher.onDidChange(callback);
                watcher.onDidCreate(callback);
                watcher.onDidDelete(callback);
                return watcher;
            }
            return new vscode.Disposable(() => { });
        }
    }
    /**
     * Validate file path (reuse from DiffService)
     */
    isValidFilePath(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            return false;
        }
        // Prevent directory traversal attacks
        if (filePath.includes('..') || filePath.startsWith('/') || filePath.includes('\\')) {
            return false;
        }
        // Prevent dangerous characters that could be used for command injection
        const dangerousChars = /[;&|`$(){}[\]<>]/;
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
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map