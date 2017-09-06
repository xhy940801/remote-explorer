import * as path from 'path'
import * as fs from 'fs'

export class Cache {
    private _basePath : string
    private _data : Map<any, any>

    constructor(basePath: string) {
        this._basePath = basePath
        this.sync()
    }

    public sync() : void {
        let realPath = path.join(this._basePath, 'cache.json')
        if (!fs.existsSync(realPath)) {
            fs.writeFileSync(realPath, JSON.stringify({}))
        }

        this._data = JSON.parse(fs.readFileSync(realPath).toString('utf-8'))
    }

    public flush() : void {
        let realPath = path.join(this._basePath, 'cache.json')

        fs.writeFileSync(realPath, JSON.stringify(this._data))
    }

    public set(prefix: string, key: string, value: any) : void {
        let data = this._data
        for (let v of prefix.split('.')) {
            if (!data[v]) {
                data[v] = {}
            }
            data = data[v]
        }
        data[key] = value
        this.flush()
    }

    public get(prefix: string, key: string, defaultVal?: any) : any {
        let data = this._data
        for (let v of prefix.split('.')) {
            if (!data[v]) {
                return defaultVal
            }
            data = data[v]
        }
        if (data[key] === undefined) {
            return defaultVal
        }
        return data[key]
    }
}