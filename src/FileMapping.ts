import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

function translateFileName(src: string) : string {
    let dst = ''
    for (let i = 0; i < src.length; ++i) {
        if (src[i] == '/')
            dst += '-'
        else if (src[i] == '+')
            dst += '_'
        else
            dst += src[i]
    }
    return dst
}

export class FileMapping {
    private _basePath : string
    private _map  = {}
    private _reverseMap = {}
    private _curTempFolder : string

    constructor(basePath : string) {
        this._basePath = basePath;
        this.sync()
    }

    private createNewTempFolder() : void {
        while (true) {
            let newFolder = translateFileName(crypto.randomBytes(16).toString('base64'))
            let newFolderPath = path.join(this._basePath, newFolder)
            if (!fs.existsSync(newFolderPath)) {
                fs.mkdirSync(newFolderPath)
                this._curTempFolder = newFolder
                return
            }
        }
    }

    private checkTempFolder() : void {
        if (!this._curTempFolder) {
            this.createNewTempFolder()
            return
        }
        let folderPath = path.join(this._basePath, this._curTempFolder)
        if (!fs.existsSync(folderPath)) {
            this.createNewTempFolder()
            return
        }

        if (!fs.statSync(folderPath).isDirectory()) {
            this.createNewTempFolder()
            return
        }
        if (fs.readdirSync(folderPath).length > 100) {
            this.createNewTempFolder()
            return
        }
    }

    private sync() : void {
        let mapFilePath = path.join(this._basePath, '.filemap.json')
        if (!fs.existsSync(mapFilePath)) {
            fs.writeFileSync(mapFilePath, JSON.stringify({
                map: {},
                reverseMap: {}
            }))
        }

        let data = JSON.parse(fs.readFileSync(mapFilePath).toString('utf-8'))
        if (!data['map'])
            this._map = {}
        else
            this._map = data['map']

        if (!data['reverseMap'])
            this._reverseMap = {}
        else
            this._reverseMap = data['reverseMap']

        if (data['curTempFolder'])
            this._curTempFolder = data['curTempFolder']

    }

    private flush() : void {
        let mapFilePath = path.join(this._basePath, '.filemap.json')
        let data = {
            map: this._map,
            reverseMap: this._reverseMap
        }

        fs.writeFileSync(mapFilePath, JSON.stringify(data))
    }

    public getLink(src : string) : string {
        if (this._map[src])
            return this._map[src]
        this.checkTempFolder()
        while (true) {
            let dstPath = path.join(this._basePath, this._curTempFolder, path.basename(src))
            if (!fs.existsSync(dstPath)) {
                let dst = path.join(this._curTempFolder, path.basename(src))
                fs.writeFileSync(dstPath, '')
                this._map[src] = dst
                this._reverseMap[dst] = src
                this.flush()
                return dst
            }
            this.createNewTempFolder()
        }
    }

    public getReverseLink(src: string) : string {
        return this._reverseMap[src]
    }

    public getAbsolutePath(src: string) : string {
        return path.join(this._basePath, src)
    }

    public getRelativePath(src: string) : string {
        return path.relative(this._basePath, src)
    }
}