import { changePalette } from "NativePaletteHandler"
import { addPalette, Palette, registeredPalettes, setPalette } from "shared/Palette"
import { dirExists, fileExists } from "./FSWrapper"

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
let palettesPath = pathModule.join(settingsFolder, 'palettes.json')

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
console.log(palettesPath)

interface PaletteDefinitions {
    [key: string]: PaletteDefinition
}

interface PaletteDefinition extends Palette {
    extend?: string
}

if(fs.statSync(palettesPath).isFile()) {
    const palettes: PaletteDefinitions = JSON.parse(fs.readFileSync(palettesPath))
    console.log(palettes)
    for(let p in palettes) {
        let palette = palettes[p]
        console.log(palette)
        if(palette.extend !== undefined && registeredPalettes[palette.extend]) {
            palette = Object.create(registeredPalettes[palette.extend])
            for(let key in palettes[p])
                palette[key] = palettes[p][key]
        }
        addPalette(p, palette)
    }
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
