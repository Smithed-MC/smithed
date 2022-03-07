import { changePalette } from "NativePaletteHandler"
import { setPalette } from "shared/Palette"
import { dirExists } from "./FSWrapper"

export const fs = window.require('fs')
export const remote = window.require('@electron/remote')
export const pathModule = window.require('path')
interface Settings {
    palette: string,
    leftOffPage: string,
    [key: string]: any
}


let platform = window.process.platform
let appSettings = {palette: 'defaultDark', leftOffPage: 'news', lastEmail:'', launcher: (
    platform === 'win32' ? 'C:\\Program Files (x86)\\Minecraft Launcher\\MinecraftLauncher.exe' : 
    platform === 'linux' ? '/opt/minecraft-launcher/minecraft-launcher' :
    platform === 'darwin'? 'Minecraft' : 'unknown'
)}

export const settingsFolder = pathModule.join(remote.app.getPath('appData'), 'smithed')
let appSettingsPath = pathModule.join(settingsFolder, 'app.settings')

if(!fs.statSync(settingsFolder).isDirectory()) {
    fs.mkdirSync(settingsFolder)
    if(!fs.statSync(appSettingsPath).isFile())
        saveSettings()
}

if(!dirExists(pathModule.join(settingsFolder, 'Instances'))) {
    try {
        fs.mkdirSync(pathModule.join(settingsFolder, 'Instances'))
    } catch {}
}

try {
    let data = fs.readFileSync(appSettingsPath)
    appSettings = JSON.parse(data)
} catch {}


export function saveSettings() {
    fs.writeFileSync(appSettingsPath, JSON.stringify(appSettings))
}

remote.app.on('before-quit', () => {
    saveSettings()
})

export function reloadSettings() {
    saveSettings()
    remote.getCurrentWindow().reload()
}

export default appSettings
