import { dirExists } from "./FSWrapper"

export const fs = window.require('fs')
export const remote = window.require('@electron/remote')
export const pathModule = window.require('path')
interface Settings {
    palette: string,
    leftOffPage: string,
    [key: string]: any
}


let appSettings = {palette: 'defaultDark', leftOffPage: 'news'}

export const settingsFolder = pathModule.join(remote.app.getPath('appData'), 'smithed')
let appSettingsPath = pathModule.join(settingsFolder, 'app.settings')
console.log('Settings at: ' +  + appSettingsPath)

if(!fs.statSync(settingsFolder).isDirectory()) {
    fs.mkdirSync(settingsFolder)
    if(!fs.statSync(appSettingsPath).isFile())
        saveSettings()
}

if(!dirExists(pathModule.join(settingsFolder, 'Instances')))
    fs.mkdirSync(pathModule.join(settingsFolder, 'Instances'))

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
