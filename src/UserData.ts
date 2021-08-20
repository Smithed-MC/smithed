import { firebaseApp, setUserData, userData } from '.'
import { fileExists } from './FSWrapper'
import Profile from './pages/Home'
import { fs, pathModule, remote, settingsFolder } from './Settings'
import { PackEntry, PackDict } from './pages/Browse'
import { Pack } from './Pack'
import * as linq from 'linq-es5'

export async function getPack(pack: {added: number, owner: string}, id: string): Promise<Pack> {
    const userPacksRef = firebaseApp.database().ref(`users/${pack.owner}/packs`)
    const snapshot = await userPacksRef.get()
    const packs: Pack[] = snapshot.val()

    if(packs != null) {
        for(let i = 0; i < packs.length; i++) {
            if(packs[i].id === id.split(':')[1])
                return packs[i]
        }
    }
    return new Pack()
}

export async function collectUserData() {
    let newUserData = userData

    if(fileExists(pathModule.join(settingsFolder, 'profiles.json')))
        newUserData.profiles = JSON.parse(fs.readFileSync(pathModule.join(settingsFolder, 'profiles.json')))
    else
        fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), '[]')



    newUserData.modsDict = await ( await firebaseApp.database().ref('meta/mods').get()).val()
    newUserData.versions = await ( await firebaseApp.database().ref('versions').get()).val()

    firebaseApp.database().ref('packs').get().then(async (snapshot)=>{
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
                id: p,
                data: pack
            })
        }

        userData.packs = linq.asEnumerable(packs).OrderBy(p => p.added)
        remote.getCurrentWindow().webContents.send('update-displayed-packs')
    })

    if (newUserData.role === 'admin') {
        newUserData.discordWebhook = (await firebaseApp.database().ref('secret/webhook').get()).val()
    }
    
    setUserData(newUserData)
}