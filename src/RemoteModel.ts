import * as ssh from 'ssh2'
import { posix as path } from 'path'
import { RemoteNode } from './RemoteNode'
import { Config } from './Config'
import { Cache } from './Cache'

export class RemoteModel {
    private _conn: any
    private _sftp: any
    private _sshConfig: any
    private _config: Config
    private _cache: Cache

    constructor(sshConfig: any, config: Config, cache: Cache) {
        this._conn = null
        this._sftp = null
        this._sshConfig = sshConfig
        this._config = config
        this._cache = cache
    }

    private connect() : Thenable<any> {
        if (this._conn)
            return Promise.resolve(this._conn)
        return new Promise((c, e) => {
            let conn = new ssh.Client()
            conn.on('ready', () => {
                this._conn = conn
                c(conn)
            })
            conn.on('error', (err) => {
                e(err)
            })
            conn.connect(this._sshConfig)
        })
    }

    private loadSFTP() : Thenable<any> {
        if (this._sftp)
            return Promise.resolve(this._sftp)
        return new Promise((c, e) => {
            this._conn.sftp((err, sftp) => {
                if (err) {
                    e(err)
                } else {
                    this._sftp = sftp
                    c(sftp)
                }
            })
        })
    }

    private readDirectory(path: string) : Thenable<RemoteNode[]> {
        return new Promise((c, e) => {
            this._sftp.readdir(path, (err, list) => {
                if (err) {
                    e(err)
                    this._conn = null
                    this._sftp = null
                } else {
                    let nodeList = []
                    for (let d of list) {
                        let type: string = 'directory'
                        if (d.attrs.isFile())
                            type = 'file'
                        nodeList.push(new RemoteNode(path, d['filename'], type))
                    }
                    nodeList.sort((a: RemoteNode, b: RemoteNode) => {
                        if (a.isDirectory == b.isDirectory) {
                            if (a.name  < b.name) {
                                return -1
                            } else {
                                return 1
                            }
                        } else if (a.isDirectory) {
                            return -1
                        } else {
                            return 1
                        }
                    })
                    c(nodeList)
                }
            })
        })
    }

    private openFile(path: string) : Thenable<any> {
        return new Promise((c, e) => {
            this._sftp.open(path, 'r', (err, handle) => {
                if (err) {
                    this._conn = null
                    this._sftp = null
                    c(err)
                } else {
                    c(handle)
                }
            })
        })
    }

    private get _rootPath() : string {
        return path.join(this._config.rootPath, this._cache.get('tmp', 'remoteBasePath', ''))
    }

    public get roots() : Thenable<RemoteNode[]> {
        return this.connect().then(() => this.loadSFTP()).then(() => this.readDirectory(this._rootPath))
    }

    public getChildren(node: RemoteNode) : Thenable<RemoteNode[]> {
        if (node.type === 'file')
            return Promise.resolve([])
        return this.connect().then(() => this.loadSFTP()).then(() => this.readDirectory(node.path))
    }

    public getContent(filePath: string) : Thenable<Buffer> {
        return this.connect().then(() => this.loadSFTP()).then(sftp => {
            return new Promise((c, e) => {
                sftp.readFile(filePath, (err, data) => {
                    if (err) {
                        e(err)
                        this._conn = null
                        this._sftp = null
                    } else {
                        c(data)
                    }
                })
            })
        })
    }

    public setContent(filePath: string, data: Buffer, callback) : void {
        this.connect().then(() => this.loadSFTP()).then(sftp => {
            sftp.writeFile(filePath, data, callback)
        })
    }
}