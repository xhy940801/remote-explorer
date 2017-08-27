'use strict'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { RemoteExplorer } from './RemoteExplorer'
import { RemoteNode } from './RemoteNode'
import { FileMapping } from './FileMapping'
import { defaultRemoteModel } from './Context'
import * as utils from './utils'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "remote-explorer" is now active!');

    const fileMapping = new FileMapping(vscode.workspace.workspaceFolders[0].uri.fsPath)
    const remoteExplorer = new RemoteExplorer()
    const remoteModel = defaultRemoteModel
    vscode.window.registerTreeDataProvider('remoteExplorer', remoteExplorer)
    vscode.commands.registerCommand('remoteExplorer.openResource', (node: RemoteNode) => {
        remoteModel.getContent(node.path).then((content) => {
            let localPath = fileMapping.getAbsolutePath(fileMapping.getLink(node.path))
            fs.writeFileSync(localPath, content)
            vscode.window.showTextDocument(vscode.Uri.file(localPath))
        })
    })
    vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => {
        utils.flushDocument(fileMapping, remoteModel, doc)
    })
    vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
        let remotePath = fileMapping.getReverseLink(fileMapping.getRelativePath(e.document.uri.fsPath))
        remoteModel.setContent(remotePath, new Buffer(e.document.getText()), (err) => {
            if (err)
                vscode.window.showErrorMessage('save remote file "' + remotePath + '" failed.');
            else
                vscode.window.showInformationMessage('save remote file "' + remotePath + '" success.');
        })
    })
    for (let doc of vscode.workspace.textDocuments) {
        if (doc.isDirty)
            continue
        utils.flushDocument(fileMapping, remoteModel, doc)
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}