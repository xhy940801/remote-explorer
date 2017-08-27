import * as fs from 'fs'
import * as path from 'path'
import { RemoteNode } from './RemoteNode'

export class RemoteModel {
    public get roots() : Thenable<RemoteNode[]> {
        let files = fs.readdirSync('E:\\')
        let nodes = []
        for (let i = 0; i < files.length; ++i) {
            if (files[i] === 'System Volume Information')
                continue
            let type = "file"
            if (fs.statSync(path.join('E:\\', files[i])).isDirectory())
                type = "directory"
            nodes.push(
                new RemoteNode('', files[i], type)
            )
        }
        return Promise.resolve(nodes)
    }

    public getChildren(node: RemoteNode) : Thenable<RemoteNode[]> {
        if (node.type === 'file')
            return Promise.resolve([])
        let directory = path.join('E:\\', node.path)
        let files = fs.readdirSync(directory)
        let nodes = []
        for (let i = 0; i < files.length; ++i) {
            let type = "file"
            if (fs.statSync(path.join(directory, files[i])).isDirectory())
                type = "directory"
            nodes.push(
                new RemoteNode(node.path, files[i], type)
            )
        }
        return Promise.resolve(nodes)
    }

    public getContent(filePath: string) : Thenable<string> {
        return Promise.resolve(fs.readFileSync(path.join('E:\\', filePath)).toString());
    }

    public setContent(filePath: string, data: Buffer, callback) : void {
        fs.writeFile(path.join('E:\\', filePath), data, callback)
    }
}