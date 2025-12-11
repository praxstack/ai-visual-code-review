/**
 * StagedFilesProvider - Tree data provider for staged files in VSCode sidebar
 * Enterprise-grade implementation for AI Visual Code Review
 */

import * as vscode from 'vscode';
import { GitService } from '../services/gitService';

export interface StagedFileItem extends vscode.TreeItem {
    filePath: string;
    status: string;
}

export class StagedFilesProvider implements vscode.TreeDataProvider<StagedFileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<StagedFileItem | undefined | null | void> =
        new vscode.EventEmitter<StagedFileItem | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<StagedFileItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    private gitService: GitService;

    constructor(gitService: GitService) {
        this.gitService = gitService;
    }

    /**
     * Refresh the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Get tree item for display
     */
    getTreeItem(element: StagedFileItem): vscode.TreeItem {
        return element;
    }

    /**
     * Get children (staged files)
     */
    async getChildren(element?: StagedFileItem): Promise<StagedFileItem[]> {
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
        } catch (error) {
            console.error('Failed to get staged files:', error);
            return [];
        }
    }

    /**
     * Create a tree item for a staged file
     */
    private createFileItem(filePath: string): StagedFileItem {
        const fileName = filePath.split('/').pop() || filePath;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

        const item: StagedFileItem = {
            label: fileName,
            description: filePath !== fileName ? filePath.substring(0, filePath.lastIndexOf('/')) : '',
            tooltip: filePath,
            filePath: filePath,
            status: 'M', // Default to modified
            iconPath: this.getFileIcon(fileExt),
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            command: {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(
                    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/' + filePath
                )]
            }
        };

        return item;
    }

    /**
     * Get appropriate icon for file type
     */
    private getFileIcon(ext: string): vscode.ThemeIcon {
        const iconMap: { [key: string]: string } = {
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
