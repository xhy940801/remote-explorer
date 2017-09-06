import { posix as path } from 'path'

export class RemoteNode {
    private _parent: string
    private _name: string
    private _type: string

    constructor(parent: string, name: string, type: string) {
        this._parent = parent;
        this._name = name;
        this._type = type;
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
}