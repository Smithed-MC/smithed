import { firebaseApp, firebaseUser, userData } from "."
import { fs } from "./Settings"


export class Meta {
    versionTemplate: string = 'x.x.x'
}

export class Display {
    name: string = ''
    icon: string = ''
    description: string = ''
}

export interface Dependency {
    id: string
    version: string
}

export class Version {
    breaking: boolean = true
    supports: string[] = []
    downloads: {[key: string]: string} = {}
    dependencies: Dependency[] = []

    constructor(breaking?: boolean, supports?: string[], downloads?: {[key: string]: string}, dependencies?: Dependency[]) {
        this.breaking = breaking != null ? breaking : true
        this.supports = supports ? supports : []
        this.downloads = downloads ? downloads : {}
        this.dependencies = dependencies ? dependencies : []
    }
}

export class Pack {
    public meta: Meta = new Meta()
    public display: Display | 'hidden' = new Display()
    public id: string = ''
    public versions: {[key:string]: Version} = {}


    constructor(meta?: Meta, display?: Display | 'hidden', id?: string, versions?: {[key: string]: Version}) {
        if(meta != null)
            this.meta = meta
        if(display != null)
            this.display = display
        if(id != null)
            this.id = id
        if(versions != null)
            this.versions = versions
    }

    hasVersion(version: string): boolean {
        for(let v in this.versions) {
            this.versions[v].supports.forEach(s => {
                if(s === version) {
                    return true
                }
            })
        }
        return false
    }
}

export class DataVersion {
    major: number | 'x' = 'x'
    minor: number | 'x' = 'x'
    patch: number | 'x' = 'x'

    constructor(version: string) {
        let temp = version.split('.')
        
        let parts: (number | 'x')[] = []
        temp.forEach(p => {
            if(p === 'x')
                parts.push(p)
            else
                parts.push(Number.parseInt(p))
        })

        this.major = parts[0] != null ? parts[0] : 'x'
        this.minor = parts[1] != null ? parts[1] : 'x'
        this.patch = parts[2] != null ? parts[2] : 'x'
    }

    equal(b: DataVersion): boolean {
        if (this.major === b.major && this.minor === b.minor) {
            if(this.patch === b.patch) return true
            else if(this.patch === 'x' || b.patch === 'x') return true
        }
        return false
    }

    parse(s: string) {
        try {
            let dv = new DataVersion(s)
        } catch {

        }
    }
}

export class PackHelper {
    static toFirebaseValid(pack: Pack): Pack {
        let tempVersions: {[key:string]: Version} = {}
        for(let v in pack.versions) {
            tempVersions[v.replaceAll('.', '_')] = pack.versions[v]
        }
        return new Pack(pack.meta, pack.display, pack.id, tempVersions)
    }

    static createOrUpdatePack(pack: Pack, addToQueue?: boolean, callback?: ()=>void) {
        pack = this.toFirebaseValid(pack)
        const userPacks = firebaseApp.database().ref(`users/${userData.uid}/packs`)
        userPacks.get().then((snapshot) => {
            const val = snapshot.val()
            let packs: Pack[] = val != null ? val : []
            
            for(var i = 0; i < packs.length; i++) {
                if(packs[i].id === pack.id) {
                    userPacks.child(i.toString()).set(pack)
                    return;
                }
            }
            userPacks.child((i).toString()).set(pack)
            if(addToQueue)
                PackHelper.addPackToQueue(pack)

            if(callback != undefined)
                callback()
        })
    }

    static addPackToQueue(pack: Pack) {
        pack = this.toFirebaseValid(pack)
        const queue = firebaseApp.database().ref(`queue`)
        const id = `${userData.displayName.toLowerCase()}:${pack.id}`
        queue.child(id).get().then((snapshot)=>{
            if(snapshot.val() === null) {
                queue.child(id).set({
                    owner: userData.uid,
                    added: Date.now()
                })
            }
        })
    }

    static movePackFromQueue(pack: Pack) {
        pack = this.toFirebaseValid(pack)
        const id = `${userData.displayName.toLowerCase()}:${pack.id}`
        const queueRef = firebaseApp.database().ref(`queue/${id}`)
        const packRef = firebaseApp.database().ref(`packs/${id}`)

        queueRef.get().then((snapshot)=>{
            let val = snapshot.val()
            if(val != null) {
                queueRef.set(null)
                val.added = Date.now()
                packRef.set(val)
            }
        })
    }
    static hasVersion(pack: Pack, version: string): boolean {
        const versionData = new DataVersion(version)

        for(let v in pack.versions) {
            for(let s of pack.versions[v].supports) {
                if(versionData.equal(new DataVersion(s))) {
                    return true
                }
            }
        }
        return false
    }

    static getLatestVersionForVersion(pack: Pack, version: string): string {
        const versionData = new DataVersion(version)

        for(let v in pack.versions) {
            for(let s of pack.versions[v].supports) {
                if(versionData.equal(new DataVersion(s))) {
                    return v
                }
            }
        }
        return ''
    }

    static resolveSubDependencies(id: string, version: string): Dependency[] {
        id = id.split('@')[0]
        const result = userData.packs.Where(p => p.id === id)

        if(result.Count() === 0) {
            let pack = result.ElementAt(0)
            let dependencies = pack.data.versions[version].dependencies
            if(dependencies === null) return []

            dependencies.forEach(e => {
                dependencies.concat(this.resolveSubDependencies(e.id, e.version))
            })
        
            return dependencies;
        }
        return []
    }
    static resolveDependencies(pack: Pack, version: string): Dependency[] {
        let dependencies = pack.versions[version].dependencies

        if(dependencies === null) return []

        dependencies.forEach(e => {
            dependencies.concat(this.resolveSubDependencies(e.id, e.version))
        })

        return dependencies;
    }
} 


export function packTest() {
    const json = fs.readFileSync('B:/Projects/Web/smithed/other/example_pack.json')
    const data = JSON.parse(json)
    const pack: Pack = Object.assign(new Pack(), data)
    
    PackHelper.createOrUpdatePack(pack)
    PackHelper.addPackToQueue(pack)
    PackHelper.movePackFromQueue(pack)
}