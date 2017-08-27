import * as vscode from 'vscode'
import * as fs from 'fs'
import { RemoteModel } from './RemoteModel'
import { FileMapping } from './FileMapping'

export function flushDocument(fileMapping: FileMapping, remoteModel: RemoteModel, doc: vscode.TextDocument) : void {
    let remotePath = fileMapping.getReverseLink(fileMapping.getRelativePath(doc.uri.fsPath))
    remoteModel.getContent(remotePath).then((content) => {
        let localPath = doc.uri.fsPath
        fs.writeFileSync(localPath, content)
    })
}