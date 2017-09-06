import * as path from 'path'
import * as fs from 'fs'

import { Config } from './Config'
import { Cache } from './Cache'
import { FileMapping } from './FileMapping'
import { RemoteModel } from './RemoteModel'

let globalContext: Context = null

export class Context {
    private _config : Config
    private _cache: Cache
    private _fileMapping: FileMapping
    private _remoteModel: RemoteModel
    
    constructor(basePath: string) {
        this._config = new Config(basePath)
        this._cache = new Cache(basePath)
        this._fileMapping = new FileMapping(basePath, this._cache)
        this._remoteModel = new RemoteModel(this._config.sshConfig, this._config, this._cache)
    }

    public get config() : Config {
        return this._config
    }

    public get cache() : Cache {
        return this._cache
    } 

    public get fileMapping() : FileMapping {
        return this._fileMapping
    }

    public get remoteModel() : RemoteModel {
        return this._remoteModel
    }

    public static get defaultContext() : Context {
        if (!globalContext) {
            throw SyntaxError('default context not init')
        }
        return globalContext
    }

    public static initDefaultContext(basePath: string) : void {
        globalContext = new Context(basePath)
    }
}