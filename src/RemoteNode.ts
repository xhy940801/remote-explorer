import { posix as path } from 'path'
import { Stats } from 'fs'

export class RemoteNodeStat implements Stats {
    private _stat: any

    constructor(stat: any) {
        this._stat = stat
    }

    public dev = 0
    public ino = 0
    public get mode() : number { return this._stat.mode }
    public nlink = 0
    public get uid() : number { return this._stat.uid }
    public get gid() : number { return this._stat.gid }
    public rdev = 0
    public get size() : number { return this._stat.size }
    public blksize = 0
    public blocks = 0
    public get atime() : Date { return new Date(this._stat.atime) }
    public get mtime() : Date { return new Date(this._stat.mtime) }
    public ctime = null
    public birthtime = null

    public isFile() : boolean {
        return this._stat.isFile()
    }

    public isDirectory() : boolean {
        return this._stat.isDirectory()
    }
    
    public isBlockDevice() : boolean {
        return this._stat.isBlockDevice()
    }

    public isCharacterDevice() : boolean {
        return this._stat.isCharacterDevice()
    }

    public isSymbolicLink() : boolean {
        return this._stat.isSymbolicLink()
    }

    public isFIFO() : boolean {
        return this._stat.isFIFO()
    }
    
    public isSocket() : boolean {
        return this._stat.isSocket()
    }
}

export class RemoteNode {
    private _parent: string
    private _name: string
    private _type: string
    private _stat: Stats

    constructor(parent: string, name: string, type: string, stat: Stats) {
        this._parent = parent
        this._name = name
        this._type = type
        this._stat = stat
    }

    public get path() : string {
        return path.join(this._parent, this._name)
    }

    public get name(): string {
        return this._name
    }

    public get type(): string {
        return this._type
    }

    public get isDirectory() : boolean {
        return this._type === 'directory'
    }

    public get stat() : Stats {
        return this._stat
    }
}