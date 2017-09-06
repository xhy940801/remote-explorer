import * as path from 'path'
import * as fs from 'fs'

export class Config {
    private _basePath : string
    private _data : Map<any, any>

    constructor(basePath: string) {
        this._basePath = basePath
        
        let realPath = path.join(this._basePath, 'config.json')
        if (!fs.existsSync(realPath)) {
            fs.writeFileSync(realPath, JSON.stringify({}))
        }

        this._data = JSON.parse(fs.readFileSync(realPath).toString('utf-8'))
    }

    public get sshConfig() : any {
        return this._data['sshConfig']
    }

    public get rootPath() : string {
        if (this._data['rootPath']) {
            return this._data['rootPath']
        }
        return './'
    }
}