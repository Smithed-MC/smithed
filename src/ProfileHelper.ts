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

const options = `
version:2730
autoJump:true
autoSuggestions:true
chatColors:true
chatLinks:true
chatLinksPrompt:true
enableVsync:true
entityShadows:true
forceUnicodeFont:false
discrete_mouse_scroll:false
invertYMouse:false
realmsNotifications:true
reducedDebugInfo:false
snooperEnabled:true
showSubtitles:false
touchscreen:false
fullscreen:false
bobView:true
toggleCrouch:false
toggleSprint:false
darkMojangStudiosBackground:false
mouseSensitivity:0.5
fov:0.0
screenEffectScale:1.0
fovEffectScale:1.0
gamma:0.0
renderDistance:12
entityDistanceScaling:1.0
guiScale:0
particles:0
maxFps:120
difficulty:2
graphicsMode:1
ao:2
biomeBlendRadius:2
renderClouds:true
resourcePacks:["vanilla","Fabric Mods","file/resourcepacks.zip"]
incompatibleResourcePacks:[]
lastServer:
lang:en_us
chatVisibility:0
chatOpacity:1.0
chatLineSpacing:0.0
textBackgroundOpacity:0.5
backgroundForChatOnly:true
hideServerAddress:false
advancedItemTooltips:false
pauseOnLostFocus:true
overrideWidth:0
overrideHeight:0
heldItemTooltips:true
chatHeightFocused:1.0
chatDelay:0.0
chatHeightUnfocused:0.44366195797920227
chatScale:1.0
chatWidth:1.0
mipmapLevels:4
useNativeTransport:true
mainHand:right
attackIndicator:1
narrator:0
tutorialStep:none
mouseWheelSensitivity:1.0
rawMouseInput:true
glDebugVerbosity:1
skipMultiplayerWarning:false
hideMatchedNames:true
joinedFirstServer:false
hideBundleTutorial:false
syncChunkWrites:true
key_key.attack:key.mouse.left
key_key.use:key.mouse.right
key_key.forward:key.keyboard.w
key_key.left:key.keyboard.a
key_key.back:key.keyboard.s
key_key.right:key.keyboard.d
key_key.jump:key.keyboard.space
key_key.sneak:key.keyboard.left.shift
key_key.sprint:key.keyboard.left.control
key_key.drop:key.keyboard.q
key_key.inventory:key.keyboard.e
key_key.chat:key.keyboard.t
key_key.playerlist:key.keyboard.tab
key_key.pickItem:key.mouse.middle
key_key.command:key.keyboard.slash
key_key.socialInteractions:key.keyboard.p
key_key.screenshot:key.keyboard.f2
key_key.togglePerspective:key.keyboard.f5
key_key.smoothCamera:key.keyboard.unknown
key_key.fullscreen:key.keyboard.f11
key_key.spectatorOutlines:key.keyboard.unknown
key_key.swapOffhand:key.keyboard.f
key_key.saveToolbarActivator:key.keyboard.c
key_key.loadToolbarActivator:key.keyboard.x
key_key.advancements:key.keyboard.l
key_key.hotbar.1:key.keyboard.1
key_key.hotbar.2:key.keyboard.2
key_key.hotbar.3:key.keyboard.3
key_key.hotbar.4:key.keyboard.4
key_key.hotbar.5:key.keyboard.5
key_key.hotbar.6:key.keyboard.6
key_key.hotbar.7:key.keyboard.7
key_key.hotbar.8:key.keyboard.8
key_key.hotbar.9:key.keyboard.9
soundCategory_master:1.0
soundCategory_music:1.0
soundCategory_record:1.0
soundCategory_weather:1.0
soundCategory_block:1.0
soundCategory_hostile:1.0
soundCategory_neutral:1.0
soundCategory_player:1.0
soundCategory_ambient:1.0
soundCategory_voice:1.0
modelPart_cape:true
modelPart_jacket:true
modelPart_left_sleeve:true
modelPart_right_sleeve:true
modelPart_left_pants_leg:true
modelPart_right_pants_leg:true
modelPart_hat:true
`


export async function setupProfile(profile: Profile, selectedMods: { [key: string]: any }) {
    if (profile.directory != null && !dirExists(profile.directory)) {
        fs.mkdirSync(profile.directory)
        fs.mkdirSync(pathModule.join(profile.directory, 'datapacks'))
        fs.mkdirSync(pathModule.join(profile.directory, 'resourcepacks'))
        fs.mkdirSync(pathModule.join(profile.directory, 'mods'))

        fs.writeFileSync(pathModule.join(profile.directory, 'launcher_profiles.json'), JSON.stringify(launcherProfile))
        fs.writeFileSync(pathModule.join(profile.directory, 'options.txt'), options)

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

export function profileContainsPack(profile: Profile, id: string) {
    if(profile.packs !== undefined) {
        for(let p of profile.packs) {
            if(p.id === id) return true;       
        }
    }
    return false;
}

export function addPackToProfile(profile: Profile, packEntry: PackEntry) {
    const packVersion = PackHelper.getLatestVersionForVersion(packEntry.data, profile.version)
    
    if(packVersion != null) {
        let packs = profile.packs != null ? profile.packs : []
  
        packs.push({id:packEntry.id, version: packVersion.replaceAll('_', '.')}) 

        profile.packs = packs
        profile.setup = false;
        saveProfiles(userData.profiles)
    }
}

export function removePackToProfile(profile: Profile, packEntry: PackEntry) {
    let packs = profile.packs != null ? profile.packs : []

    for(let p of packs) {
        if(p.id === packEntry.id) {
            packs = packs.splice(packs.indexOf(p), 1);
            break;
        }
    }

    profile.packs = packs
    profile.setup = false;
    saveProfiles(userData.profiles)

}

export async function saveProfiles(profiles: Profile[]) {
    fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), JSON.stringify(profiles, null, 2))
    
    let tempData = userData
    tempData.profiles = profiles
    setUserData(tempData)
}