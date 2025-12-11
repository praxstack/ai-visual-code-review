"use strict";
/**
 * StagedFilesProvider - Tree data provider for staged files in VSCode sidebar
 * Enterprise-grade implementation for AI Visual Code Review
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagedFilesProvider = void 0;
const vscode = require("vscode");
class StagedFilesProvider {
    constructor(gitService) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.gitService = gitService;
    }
    /**
     * Refresh the tree view
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * Get tree item for display
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Get children (staged files)
     */
    async getChildren(element) {
        if (element) {
            // No nested children for files
            return [];
        }
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }
        try {
            const stagedFiles = await this.gitService.getStagedFiles(workspaceFolder.uri.fsPath);
            return stagedFiles.map(file => this.createFileItem(file));
        }
        catch (error) {
            console.error('Failed to get staged files:', error);
            return [];
        }
    }
    /**
     * Create a tree item for a staged file
     */
    createFileItem(filePath) {
        const fileName = filePath.split('/').pop() || filePath;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        const item = {
            label: fileName,
            description: filePath !== fileName ? filePath.substring(0, filePath.lastIndexOf('/')) : '',
            tooltip: filePath,
            filePath: filePath,
            status: 'M',
            iconPath: this.getFileIcon(fileExt),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/' + filePath)]
            }
        };
        return item;
    }
    /**
     * Get appropriate icon for file type
     */
    getFileIcon(ext) {
        const iconMap = {
            '.ts': 'symbol-class',
            '.tsx': 'symbol-class',
            '.js': 'symbol-method',
            '.jsx': 'symbol-method',
            '.json': 'symbol-object',
            '.md': 'book',
            '.css': 'symbol-color',
            '.scss': 'symbol-color',
            '.html': 'globe',
            '.py': 'symbol-namespace',
            '.sh': 'terminal'
        };
        const iconName = iconMap[ext] || 'file';
        return new vscode.ThemeIcon(iconName);
    }
}
exports.StagedFilesProvider = StagedFilesProvider;
//# sourceMappingURL=stagedFilesProvider.js.map