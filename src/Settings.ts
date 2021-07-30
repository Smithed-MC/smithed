const fs = window.require('fs')
const remote = window.require('@electron/remote')
const pathModule = window.require('path')
interface Settings {
    palette: string,
    leftOffPage: string,
    [key: string]: any
}


let appSettings = {palette: 'defaultDark', leftOffPage: 'news'}

let settingsFolder = pathModule.join(remote.app.getPath('appData'), 'smithed')
let appSettingsPath = pathModule.join(settingsFolder, 'app.settings')
console.log('Settings at: ' +  + appSettingsPath)

if(!fs.statSync(settingsFolder).isDirectory()) {
    fs.mkdirSync(settingsFolder)
    if(!fs.statSync(appSettingsPath).isFile())
        saveSettings()
}


try {
    let data = fs.readFileSync(appSettingsPath)
    appSettings = JSON.parse(data)
} catch {}

export default appSettings

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