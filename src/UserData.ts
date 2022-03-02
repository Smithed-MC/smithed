import { setUserData, userData } from '.'
import { fileExists } from './FSWrapper'
import { fs, pathModule, remote, settingsFolder } from './Settings'
import { Pack, PackDict, PackEntry, PackHelper, Version } from './Pack'
import * as linq from 'linq-es5'
import { database } from './shared/ConfigureFirebase'

export async function getPack(pack: {added: number, owner: string}, id: string): Promise<Pack> {
    const userPacksRef = database.ref(`users/${pack.owner}/packs`)
    const snapshot = await userPacksRef.get()
    const packs: {[key: string]: any}[] = snapshot.val()

    if(packs != null) {
        for(let i = 0; i < packs.length; i++) {
            if(packs[i].id === id.split(':')[1]) {
                return PackHelper.updatePackData(packs[i])
            }
        }
    }
    return new Pack()
}

async function getDownloadCount(id: string): Promise<number> {
    const downloads = await database.ref(`packs/${id}/downloads`).get()

    let total = 0
    downloads.forEach((c) => {
        total += c.numChildren()
    })
    return total;
}

async function queryPacks() {
    const snapshot = await database.ref('packs').get()
    const packDict: PackDict = snapshot.val()
    let packs: PackEntry[] = []
    let i = 0
    for(let p in packDict) {
        if(i % 20 === 0) {
            userData.packs = linq.asEnumerable(packs)
            remote.getCurrentWindow().webContents.send('update-displayed-packs')
        }
        i++
        const pack = await getPack(packDict[p], p)
        packs.push({
            owner: packDict[p].owner,
            added: packDict[p].added,
            updated: packDict[p].updated,
            downloads: await getDownloadCount(p),
            id: p,
            data: pack
        })
    }

    userData.packs = linq.asEnumerable(packs).OrderBy(p => p.added)
    remote.getCurrentWindow().webContents.send('update-displayed-packs')
}

export async function collectUserData() {
    let newUserData = userData

    if(fileExists(pathModule.join(settingsFolder, 'profiles.json')))
        newUserData.profiles = JSON.parse(fs.readFileSync(pathModule.join(settingsFolder, 'profiles.json')))
    else
        fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), '[]')



    newUserData.modsDict = await ( await database.ref('meta/mods').get()).val()
    newUserData.versions = await ( await database.ref('versions').get()).val()

    await queryPacks()

    if (newUserData.role === 'admin') {
        newUserData.discordWebhook = (await database.ref('secret/webhook').get()).val()
    }
    
    setUserData(newUserData)
}