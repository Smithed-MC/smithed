import { firebaseApp, setUserData, userData } from ".";
import { dirExists } from "./FSWrapper";
import { PackHelper, PackEntry } from "./Pack";
import { Profile } from "./pages/Home";
import { fs, pathModule, settingsFolder } from "./Settings";

const download = window.require('download')
const { exec } = window.require('child_process')

const launcherProfile = {
    "clientToken": "",
    "launcherVersion": {
        "format": 21,
        "name": "",
        "profilesFormat": 2
    },
    "profiles": {
    },
    "settings": {
        "crashAssistance": true,
        "enableAdvanced": false,
        "enableAnalytics": true,
        "enableHistorical": false,
        "enableReleases": true,
        "enableSnapshots": false,
        "keepLauncherOpen": false,
        "profileSorting": "ByLastPlayed",
        "showGameLog": false,
        "showMenu": false,
        "soundOn": false
    }
}



export async function setupProfile(profile: Profile, selectedMods: { [key: string]: any }) {
    if (profile.directory != null && !dirExists(profile.directory)) {
        fs.mkdirSync(profile.directory)
        fs.mkdirSync(pathModule.join(profile.directory, 'datapacks'))
        fs.mkdirSync(pathModule.join(profile.directory, 'resourcepacks'))
        fs.mkdirSync(pathModule.join(profile.directory, 'mods'))

        fs.writeFileSync(pathModule.join(profile.directory, 'launcher_profiles.json'), JSON.stringify(launcherProfile))

        let url = (await firebaseApp.database().ref('meta/fabric-installer').get()).val()

        await download(url, pathModule.join(profile.directory, 'temp'), { filename: 'installer.jar' })

        let cmd = `java -jar "${pathModule.join(profile.directory, 'temp')}/installer.jar" client -mcversion ${profile.version} -downloadMinecraft -dir "${profile.directory}"`
        await exec(cmd, (error: any, stdout: string, stderr: any) => {
            fs.rmdirSync(pathModule.join(profile.directory, 'temp'), { recursive: true })
        })
        for (let m in selectedMods) {
            if (selectedMods[m] != null)
                await download(selectedMods[m], pathModule.join(profile.directory, 'mods'), { filename: m + '.jar' })
        }

		// let companion = (await firebaseApp.database().ref(`meta/mods/smithed/${profile.version.replaceAll('.','_')}`).get()).val()
		// await download(companion, pathModule.join(profile.directory, 'mods'), { filename: 'smithed_companion.jar' })
    }
}

export function addPackToProfile(profile: Profile, packEntry: PackEntry) {
    const packVersion = PackHelper.getLatestVersionForVersion(packEntry.data, profile.version)

    if(packVersion != null) {
        let packs = profile.packs != null ? profile.packs : []

        profile.packs = packs

        saveProfiles(userData.profiles)
    }
}

export async function saveProfiles(profiles: Profile[]) {
    fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), JSON.stringify(profiles, null, 2))
    
    let tempData = userData
    tempData.profiles = profiles
    setUserData(tempData)
}