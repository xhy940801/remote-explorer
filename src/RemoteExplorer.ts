import * as vscode from 'vscode'
import * as path from 'path'
import { RemoteNode } from './RemoteNode'
import { RemoteModel } from './RemoteModel'


export class RemoteExplorer implements vscode.TreeDataProvider<RemoteNode> {
    private _remoteModel : RemoteModel = new RemoteModel()

    getTreeItem(element: RemoteNode): vscode.TreeItem {
        let resourcePath = path.join(__filename, '..', '..', '..', 'resources')
        return {
            label: element.name,
            collapsibleState: element.isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
            command: element.isDirectory ? void 0 : {
                command: 'remoteExplorer.openResource',
                arguments: [ element.path ],
                title: 'Open Remote Resourse',
            },
            iconPath: {
                light: element.isDirectory ? path.join(resourcePath, 'light', 'folder.svg') : path.join(resourcePath, 'light', 'document.svg'),
                dark: element.isDirectory ? path.join(resourcePath, 'dark', 'folder.svg') : path.join(resourcePath, 'dark', 'document.svg')
            }
        }
    }

    getChildren(element?: RemoteNode): Thenable<RemoteNode[]> {
        if (!element) {
            return this._remoteModel.roots
        }
        return this._remoteModel.getChildren(element)
    }
}
