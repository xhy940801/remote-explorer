'use strict'
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { RemoteExplorer } from './RemoteExplorer'
import { RemoteNode } from './RemoteNode'
import { FileMapping } from './FileMapping'
import { Context } from './Context'
import * as utils from './utils'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "remote-explorer" is now active!');

    Context.initDefaultContext(vscode.workspace.workspaceFolders[0].uri.fsPath)
    const remoteExplorer = new RemoteExplorer()
    vscode.window.registerTreeDataProvider('remoteExplorer', remoteExplorer)
    vscode.commands.registerCommand('remoteExplorer.openResource', (node: RemoteNode) => {
        Context.defaultContext.remoteModel.getContent(node.path).then((content) => {
            let localPath = Context.defaultContext.fileMapping.getAbsolutePath(Context.defaultContext.fileMapping.getLink(node.path))
            Context.defaultContext.fileMapping.setFileMTime(node.path, node.stat.mtime.getTime())
            fs.writeFileSync(localPath, content)
            vscode.window.showTextDocument(vscode.Uri.file(localPath))
        })
    })
    vscode.commands.registerCommand('remoteExplorer.setAsRoot', (node: RemoteNode) => {
        Context.defaultContext.cache.set('tmp', 'remoteBasePath', node.path)
        remoteExplorer.refresh()
    })
    vscode.commands.registerCommand('remoteExplorer.resetRoot', () => {
        Context.defaultContext.cache.set('tmp', 'remoteBasePath', '')
        remoteExplorer.refresh()
    })
    vscode.commands.registerCommand('remoteExplorer.setParentAsRoot', () => {
        let basePath = Context.defaultContext.cache.get('tmp', 'remoteBasePath')
        if (!basePath) {
            vscode.window.showErrorMessage('go to parent folder failed. current path is base path')
        } else {
            Context.defaultContext.cache.set('tmp', 'remoteBasePath', path.posix.dirname(basePath))
            remoteExplorer.refresh()
        }
    })
    vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => {
        utils.flushDocument(Context.defaultContext.fileMapping, Context.defaultContext.remoteModel, doc)
    })
    vscode.workspace.onWillSaveTextDocument((e: vscode.TextDocumentWillSaveEvent) => {
        let remotePath = Context.defaultContext.fileMapping.getReverseLink(Context.defaultContext.fileMapping.getRelativePath(e.document.uri.fsPath))
        Context.defaultContext.remoteModel.getStats(remotePath)
        .then(stats => {
            if (stats.mtime.getTime() != Context.defaultContext.fileMapping.getFileMTime(remotePath)) {
                throw new SyntaxError('file of server has beed modified')
            }
        })
        .then(() => Context.defaultContext.remoteModel.setContent(remotePath, new Buffer(e.document.getText())))
        .then(c => {
            utils.flushDocument(Context.defaultContext.fileMapping, Context.defaultContext.remoteModel, e.document)
        }, e => {
            vscode.window.showErrorMessage('save remote file "' + remotePath + '" failed because of ' + e)
            throw new SyntaxError(e)
        })
    })
    for (let doc of vscode.workspace.textDocuments) {
        if (doc.isDirty)
            continue
        utils.flushDocument(Context.defaultContext.fileMapping, Context.defaultContext.remoteModel, doc)
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}