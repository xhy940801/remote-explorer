import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { Cache } from './Cache'

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
    private _cache : Cache

    constructor(basePath: string, cache: Cache) {
        this._basePath = basePath;
        this._cache = cache
    }

    private get _curTempFolder() : string {
        return this._cache.get('tmp.file', 'curTempFolder')
    }

    private set _curTempFolder(dst: string) {
        this._cache.set('tmp.file', 'curTempFolder', dst)
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

    public getLink(src: string) : string {
        let dst = this._cache.get('tmp.file.map', src)
        if (dst) {
            return dst
        }
        this.checkTempFolder()
        while (true) {
            let dstPath = path.join(this._basePath, this._curTempFolder, path.basename(src))
            if (!fs.existsSync(dstPath)) {
                let dst = path.join(this._curTempFolder, path.basename(src))
                fs.writeFileSync(dstPath, '')
                this._cache.set('tmp.file.map', src, dst)
                this._cache.set('tmp.file.reverseMap', dst, src)
                this._cache.flush()
                return dst
            }
            this.createNewTempFolder()
        }
    }

    public setFileMTime(src: string, mtime: Number) : void {
        this._cache.set('tmp.file.info', src, mtime)
        this._cache.flush()
    }

    public getFileMTime(src: string) : Number {
        return this._cache.get('tmp.file.info', src)
    }

    public getReverseLink(src: string) : string {
        return this._cache.get('tmp.file.reverseMap', src)
    }

    public getAbsolutePath(src: string) : string {
        return path.join(this._basePath, src)
    }

    public getRelativePath(src: string) : string {
        return path.relative(this._basePath, src)
    }
}