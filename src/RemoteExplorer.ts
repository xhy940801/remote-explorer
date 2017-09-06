import * as vscode from 'vscode'
import * as path from 'path'
import { RemoteNode } from './RemoteNode'
import { Context } from './Context'


export class RemoteExplorer implements vscode.TreeDataProvider<RemoteNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<RemoteNode | undefined> = new vscode.EventEmitter<RemoteNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<RemoteNode | undefined> = this._onDidChangeTreeData.event;
    private _remoteModel = Context.defaultContext.remoteModel

    public refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: RemoteNode): vscode.TreeItem {
        let resourcePath = path.join(__filename, '..', '..', '..', 'resources')
        return {
            label: element.name,
            collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            command: element.isDirectory ? void 0 : {
                command: 'remoteExplorer.openResource',
                arguments: [ element ],
                title: 'Open Remote Resourse',
            },
            iconPath: {
                light: element.isDirectory ? path.join(resourcePath, 'light', 'folder.svg') : path.join(resourcePath, 'light', 'document.svg'),
                dark: element.isDirectory ? path.join(resourcePath, 'dark', 'folder.svg') : path.join(resourcePath, 'dark', 'document.svg')
            },
            contextValue: element.type
        }
    }

    public getChildren(element?: RemoteNode): Thenable<RemoteNode[]> {
        if (!element) {
            return this._remoteModel.roots
        }
        return this._remoteModel.getChildren(element)
    }
}
