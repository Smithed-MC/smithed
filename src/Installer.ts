import { WeldDatapackBuilder } from "./weld/datapack";
import DefaultResourcepackBuilder from "slimeball/out/resourcepack";
import JSZip from "jszip";
import { PackBuilder } from "slimeball/out/util";
import { firebaseApp } from ".";
import { fs, pathModule } from "./Settings";
import { Dependency } from "./Pack";
import latestSemver from "latest-semver";
import { Profile } from "./pages/Home";

let datapacks: [string, Buffer][] = []
let resourcepacks: [string, Buffer][] = []


async function getPackData(uid: string, id: string) {
    const ownerPacks = (await firebaseApp.database().ref(`users/${uid}/packs`).get()).val() as any[]

    for(let p of ownerPacks) {
        if(p.id === id) {
            return p;
        }
    }
    return null;
}

async function getLatestVersionNumber(pack: any): Promise<string|undefined> {
    let versions: string[] = []
    for(let v in pack.versions) {
        let tempV = v.replaceAll('_','.')
        versions.push('v'+tempV)
        
    }
    let version = latestSemver(versions)

    return version;
}
async function getVersionData(pack: any, version?: string): Promise<any> {
    var versionData
    if(version != null && version !== '' && pack.versions[version] != null) {
        versionData = pack.versions[version]
    } else {
        version = await getLatestVersionNumber(pack)
        if(version !== undefined) {
            versionData = pack.versions[version.replaceAll('.','_')]
        } else {
            throw new Error('Valid version could not be found!')
        }
    }
    return versionData
}

async function fetchFile(url: string): Promise<Buffer> {
    const buffer = (await (await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)).arrayBuffer())
    return buffer as Buffer;
}

async function downloadPack(entry: any, id: string, version?: string) {
    const pack = await getPackData(entry["owner"], id);
    

    const versionData = await getVersionData(pack, version)

    if(versionData != null) {
        if(versionData["downloads"] != null) {
            const {datapack, resourcepack}: {datapack: string, resourcepack: string} = versionData["downloads"]

            if(datapack !== undefined && datapack !== '') {
                const zip = await fetchFile(datapack)
                datapacks.push([id, zip])
            } 
            if(resourcepack !== undefined && resourcepack !== '') {
                const zip = await fetchFile(resourcepack)
                resourcepacks.push([id, zip])
            } 
        }

        if(versionData["dependencies"] != null && versionData["dependencies"].length > 0) {
            for(var d of versionData["dependencies"]) {
                console.log(d)
                const [owner, id] = d.id.split(':')
                const version = d.version
                await startDownload(owner, id, version)
            }
        }
    }
    console.log('done')
}


async function startDownload(owner: string, id: string, version?: string) {
    const dbEntry = (await firebaseApp.database().ref(`packs/${owner}:${id}`).get()).val()

    if(dbEntry != null) {
        await downloadPack(dbEntry, id, version)
    }
}

async function generateFinal(builder: PackBuilder, packs: [string, Buffer][], name: string, path: string) {
    await builder.loadBuffers(packs)
    await builder.build(async (r) => {
        
        fs.writeFileSync(pathModule.join(path, name), (await r.zip.generateAsync({type:'nodebuffer'})))
    })
}

export async function downloadAndMerge(profile: Profile) {
    datapacks = []
    resourcepacks = []

    if(profile.packs === undefined) return;

    for(let d of profile.packs) {
        const idParts = d.id.split(':')
        await startDownload(idParts[0], idParts[1], d.version)
    }

    if(datapacks.length > 0) {
        const jarLink = (await firebaseApp.database().ref(`meta/vanilla/${profile.version.replaceAll('.','_')}`).get()).val()
        const dpb = new WeldDatapackBuilder(await JSZip.loadAsync(await fetchFile(jarLink)))
        await generateFinal(dpb, datapacks, 'datapacks.zip', profile.directory + '/datapacks')
    }
    if(resourcepacks.length > 0) {
        const rpb = new DefaultResourcepackBuilder();
        await generateFinal(rpb, resourcepacks, 'resourcepacks.zip', profile.directory + '/resourcepacks')
    }

}
