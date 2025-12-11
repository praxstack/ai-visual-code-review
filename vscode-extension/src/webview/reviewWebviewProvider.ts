/**
 * ReviewWebviewProvider - Webview provider for code review panel in VSCode
 * Enterprise-grade implementation for AI Visual Code Review
 */

import * as vscode from 'vscode';
import { DiffService } from '../services/diffService';
import { GitService } from '../services/gitService';

export class ReviewWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiCodeReviewWebview';

    private _view?: vscode.WebviewView;
    private _panel?: vscode.WebviewPanel;
    private context: vscode.ExtensionContext;
    private gitService: GitService;
    private diffService: DiffService;

    constructor(
        context: vscode.ExtensionContext,
        gitService: GitService,
        diffService: DiffService
    ) {
        this.context = context;
        this.gitService = gitService;
        this.diffService = diffService;
    }

    /**
     * Resolve webview view
     */
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });
    }

    /**
     * Create or show the review panel
     */
    async createOrShowPanel(): Promise<void> {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this._panel) {
            this._panel.reveal(column);
            return;
        }

        this._panel = vscode.window.createWebviewPanel(
            ReviewWebviewProvider.viewType,
            'AI Code Review',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this._panel.webview.html = await this.getFullPanelHtml();

        this._panel.onDidDispose(() => {
            this._panel = undefined;
        });

        this._panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });
    }

    /**
     * Handle messages from webview
     */
    private async handleMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'getStagedFiles':
                await this.sendStagedFiles();
                break;
            case 'getFileDiff':
                await this.sendFileDiff(message.file);
                break;
            case 'exportForAI':
                await this.exportForAI(message.comments, message.lineComments);
                break;
            case 'refresh':
                await this.refresh();
                break;
        }
    }

    /**
     * Send staged files to webview
     */
    private async sendStagedFiles(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        try {
            const files = await this.gitService.getStagedFiles(workspaceFolder.uri.fsPath);
            this.postMessage({ command: 'stagedFiles', files });
        } catch (error) {
            this.postMessage({ command: 'error', message: 'Failed to get staged files' });
        }
    }

    /**
     * Send file diff to webview
     */
    private async sendFileDiff(file: string): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return;
        }

        try {
            const diff = await this.gitService.getFileDiff(workspaceFolder.uri.fsPath, file);
            const parsedDiff = this.diffService.parseDiff(diff);
            this.postMessage({ command: 'fileDiff', file, diff, parsedDiff });
        } catch (error) {
            this.postMessage({ command: 'error', message: `Failed to get diff for ${file}` });
        }
    }

    /**
     * Export for AI review
     */
    private async exportForAI(comments: any, lineComments: any): Promise<void> {
        vscode.commands.executeCommand('aiCodeReview.exportForAI');
    }

    /**
     * Refresh the view
     */
    private async refresh(): Promise<void> {
        await this.sendStagedFiles();
    }

    /**
     * Post message to webview
     */
    private postMessage(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
        if (this._panel) {
            this._panel.webview.postMessage(message);
        }
    }

    /**
     * Get HTML content for sidebar webview
     */
    private getHtmlContent(webview: vscode.Webview): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Code Review</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 10px;
                        color: var(--vscode-foreground);
                    }
                    .file-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .file-item {
                        padding: 8px;
                        margin: 4px 0;
                        background: var(--vscode-list-hoverBackground);
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .file-item:hover {
                        background: var(--vscode-list-activeSelectionBackground);
                    }
                    .btn {
                        width: 100%;
                        padding: 8px;
                        margin: 8px 0;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .btn:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .empty {
                        text-align: center;
                        color: var(--vscode-descriptionForeground);
                        padding: 20px;
                    }
                </style>
            </head>
            <body>
                <h3>📁 Staged Files</h3>
                <div id="fileList" class="empty">Loading...</div>
                <button class="btn" onclick="refresh()">🔄 Refresh</button>
                <button class="btn" onclick="exportForAI()">📤 Export for AI</button>

                <script>
                    const vscode = acquireVsCodeApi();

                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    function exportForAI() {
                        vscode.postMessage({ command: 'exportForAI' });
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'stagedFiles':
                                renderFiles(message.files);
                                break;
                            case 'error':
                                showError(message.message);
                                break;
                        }
                    });

                    function renderFiles(files) {
                        const container = document.getElementById('fileList');
                        if (!files || files.length === 0) {
                            container.innerHTML = '<div class="empty">No staged files</div>';
                            return;
                        }

                        container.innerHTML = '<ul class="file-list">' +
                            files.map(f => '<li class="file-item">' + f + '</li>').join('') +
                            '</ul>';
                    }

                    function showError(message) {
                        const container = document.getElementById('fileList');
                        container.innerHTML = '<div class="empty" style="color: var(--vscode-errorForeground);">' + message + '</div>';
                    }

                    // Initial load
                    vscode.postMessage({ command: 'getStagedFiles' });
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Get full HTML for panel view
     */
    private async getFullPanelHtml(): Promise<string> {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Visual Code Review</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background: var(--vscode-editor-background);
                    }
                    h1 {
                        color: var(--vscode-foreground);
                        border-bottom: 1px solid var(--vscode-panel-border);
                        padding-bottom: 10px;
                    }
                    .info {
                        background: var(--vscode-textBlockQuote-background);
                        padding: 15px;
                        border-radius: 6px;
                        margin: 15px 0;
                    }
                    .btn {
                        padding: 10px 20px;
                        margin: 5px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .btn:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .btn-primary {
                        background: var(--vscode-button-prominentBackground, #238636);
                    }
                </style>
            </head>
            <body>
                <h1>🔍 AI Visual Code Review</h1>

                <div class="info">
                    <p>Welcome to AI Visual Code Review!</p>
                    <p>Stage your changes with <code>git add .</code> then export for AI analysis.</p>
                </div>

                <div id="actions">
                    <button class="btn btn-primary" onclick="exportForAI()">📤 Export for AI Review</button>
                    <button class="btn" onclick="refresh()">🔄 Refresh</button>
                </div>

                <div id="content">
                    <h3>📁 Staged Files</h3>
                    <div id="fileList">Loading...</div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();

                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }

                    function exportForAI() {
                        vscode.postMessage({ command: 'exportForAI' });
                    }

                    // Initial load
                    vscode.postMessage({ command: 'getStagedFiles' });
                </script>
            </body>
            </html>
        `;
    }
}
