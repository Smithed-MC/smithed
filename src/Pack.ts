import { firebaseApp, userData } from "."
import { fs } from "./Settings"


export class Meta {
    versionTemplate: string = 'x.x.x'
}

export class Display {
    hidden: boolean = false
    name: string = ''
    icon: string = ''
    description: string = ''
    webPage: string = ''
}

export interface Dependency {
    id: string
    version: string
}

export interface PackDict {
    [key: string]: {
        added: number,
        owner: string,
        updated?: number
    }
}

export interface PackEntry {
    added: number,
    updated?: number,
    downloads?: number,
    owner: string,
    id: string,
    data: Pack
}


export class Version {
    name: string = ""
    breaking: boolean = true
    supports: string[] = []
    downloads: { [key: string]: string } = {}
    dependencies: Dependency[] = []

    constructor(name: string, breaking?: boolean, supports?: string[], downloads?: { [key: string]: string }, dependencies?: Dependency[]) {
        this.breaking = breaking != null ? breaking : true
        this.supports = supports ? supports : []
        this.downloads = downloads ? downloads : {}
        this.dependencies = dependencies ? dependencies : []
        this.name = name;
    }
}

export class Pack {
    public meta: Meta = new Meta()
    public display: Display = new Display()
    public messages: string[] = []
    public id: string = ''
    public versions: Version[] = [];


    constructor(meta?: Meta, display?: Display, id?: string, versions?: Version[]) {
        if (meta != null)
            this.meta = meta
        if (display != null)
            this.display = display
        if (id != null)
            this.id = id
        if (versions != null)
            this.versions = versions
    }

    hasVersion(version: string): boolean {
        for (let v in this.versions) {
            this.versions[v].supports.forEach(s => {
                if (s === version) {
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
            if (p === 'x')
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
            if (this.patch === b.patch) return true
            else if (this.patch === 'x' || b.patch === 'x') return true
        }
        return false
    }

    parse(s: string) {
        try {
            // let dv = new DataVersion(s)
        } catch {

        }
    }
}

export const SafeDisplayName = /(\s+|\[|\]|{|}|\||\\|"|%|~|#|<|>|\?)/g

export class PackHelper {
    static toFirebaseValid(pack: Pack): Pack {
        let tempVersions: Version[] = []
        for (let v = 0; v < pack.versions.length; v++) {
            tempVersions.push(pack.versions[v])
        }
        return new Pack(pack.meta, pack.display, pack.id, tempVersions)
    }

    static displayNameToID(displayName: string): string {
        return displayName.toLowerCase().replaceAll(' ', '-').replaceAll(SafeDisplayName, '')
    }

    private static addToQueueIfNot(pack: Pack) {
        const id = `${this.displayNameToID(userData.displayName)}:${pack.id}`
        firebaseApp.database().ref(`queue/${id}`).get().then((snapshot) => {
            const val = snapshot.val()
            if (val == null)
                PackHelper.addPackToQueue(pack)
        })
    }

    static deletePack(pack: Pack, callback?: () => void) {
        pack = this.toFirebaseValid(pack)
        const packsRef = firebaseApp.database().ref(`packs/${PackHelper.displayNameToID(userData.displayName)}:${pack.id}`)

        packsRef.get().then((snap) => {
            if (snap.exists()) {
                packsRef.remove();
            }
            else {
                const queueRef = firebaseApp.database().ref(`queue/${PackHelper.displayNameToID(userData.displayName)}:${pack.id}`)
                queueRef.remove();
            }

            const userPacks = firebaseApp.database().ref(`users/${userData.uid}/packs`)

            userPacks.get().then((snap => {
                const packs: Pack[] = snap.val();

                packs.splice(packs.findIndex(p => p.id === pack.id), 1)

                userPacks.set(packs).then(() => {
                    if (callback != null)
                        callback();
                })
            }))
        })
    }

    static createOrUpdatePack(pack: Pack, addToQueue?: boolean, callback?: () => void) {
        pack = this.toFirebaseValid(pack)

        const packsRef = firebaseApp.database().ref(`packs/${PackHelper.displayNameToID(userData.displayName)}:${pack.id}`)

        packsRef.get().then((snap) => {
            if (userData.ref != null) {

                const userPacks = userData.ref?.child(`packs`)

                userPacks.get().then((snapshot) => {
                    const val = snapshot.val()
                    let packs: Pack[] = val != null ? val : []

                    for (var i = 0; i < packs.length; i++) {
                        if (packs[i].id === pack.id) {
                            userPacks.child(i.toString()).set(pack)

                            if (packs[i].versions !== pack.versions)
                                packsRef.child('updated').set(Date.now())

                            if (!snap.exists())
                                this.addToQueueIfNot(pack)
                            return;
                        }
                    }

                    userPacks.child((i).toString()).set(pack)
                    if (!snap.exists())
                        this.addToQueueIfNot(pack)

                    if (callback !== undefined)
                        callback()
                })
            }
        })
    }

    static resetMessages(pack: string) {
        const userPacks = firebaseApp.database().ref(`users/${userData.uid}/packs`)
        userPacks.get().then((snapshot) => {
            const val = snapshot.val()
            let packs: Pack[] = val != null ? val : []

            for (var i = 0; i < packs.length; i++) {
                if (packs[i].id === pack) {
                    userPacks.child(i.toString() + '/messages').set(null)
                    return;
                }
            }
        })
    }

    static addPackToQueue(pack: Pack) {
        pack = this.toFirebaseValid(pack)
        const queue = firebaseApp.database().ref(`queue`)
        const id = `${userData.displayName.toLowerCase()}:${pack.id}`
        queue.child(id).get().then((snapshot) => {
            if (snapshot.val() === null) {
                queue.child(id).set({
                    owner: userData.uid,
                    added: Date.now()
                })
            }
        })
    }

    static movePackFromQueue(pack: Pack | string, callback?: () => void) {
        const id = typeof pack == 'string' ? pack : `${this.displayNameToID(userData.displayName)}:${pack.id}`
        const queueRef = firebaseApp.database().ref(`queue/${id}`)
        const packRef = firebaseApp.database().ref(`packs/${id}`)

        queueRef.get().then((snapshot) => {
            let val = snapshot.val()
            if (val != null) {
                queueRef.set(null).then(() => {
                    val.added = Date.now()
                    packRef.set(val).then(() => {
                        if (callback != null)
                            callback()
                    })
                })
            }
        })
    }

    static removePackFromQueue(id: string, owner: string, reason: string, callback?: () => void) {
        const queueRef = firebaseApp.database().ref(`queue/${id}`)
        const usersPacksRef = firebaseApp.database().ref(`users/${owner}/packs/`)

        usersPacksRef.get().then((snapshot) => {
            const packs: Pack[] = snapshot.val()

            for (let i = 0; i < packs.length; i++) {
                if (packs[i].id === id.split(':')[1]) {
                    queueRef.set(null)
                    usersPacksRef.child(`${i}/messages`).get().then((snapshot) => {
                        let messages: string[] = snapshot.val()
                        if (messages == null) messages = []
                        messages.unshift(reason)

                        usersPacksRef.child(`${i}/messages`).set(messages).then(() => {
                            if (callback != null)
                                callback()
                        })
                    })
                }
            }
        })
    }

    static hasVersion(pack: Pack, version: string): boolean {
        const versionData = new DataVersion(version)

        for (let v = 0; v < pack.versions.length; v++) {
            for (let s of pack.versions[v].supports) {
                if (pack.versions[v].supports.includes(version)) return true;
            }
        }
        return false
    }

    static getLatestVersionForVersion(pack: Pack, version: string): string {
        const versionData = new DataVersion(version)

        for (let v = pack.versions.length - 1; v >= 0; v--) {
            for (let s of pack.versions[v].supports) {
                if (versionData.equal(new DataVersion(s))) {
                    return pack.versions[v].name
                }
            }
        }
        return ''
    }

    static resolveSubDependencies(id: string, version: string): Dependency[] {
        id = id.split('@')[0]
        const result = userData.packs.Where(p => p.id === id)

        if (result.Count() === 0) {
            let pack = result.ElementAt(0)
            let pVersion = pack.data.versions.find((v) => v.name === version)
            if (pVersion != null) {
                let dependencies = pVersion.dependencies
                if (dependencies === null) return []

                dependencies.forEach(e => {
                    dependencies.concat(this.resolveSubDependencies(e.id, e.version))
                })

                return dependencies;
            }
        }
        return []
    }
    static resolveDependencies(pack: Pack, version: string): Dependency[] {
        let pVersion = pack.versions.find((v) => v.name === version)
        if (pVersion != null) {
            let dependencies = pVersion.dependencies

            if (dependencies == null) return []

            dependencies.forEach(e => {
                dependencies.concat(this.resolveSubDependencies(e.id, e.version))
            })

            return dependencies;
        }
        return [];
    }
    static updatePackData(pack: any): Pack {
        if(pack.versions instanceof Array) {
            return pack as Pack;
        } else {
            let versions: {[key: string]: Version} = pack.versions
            let newVersions: Version[] = []
            for(let v in versions) {
                let version = versions[v];

                version.name = v.replaceAll('_', '.');
                newVersions.push(version);
            }
            pack.versions = newVersions;
            return pack as Pack;
        }
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