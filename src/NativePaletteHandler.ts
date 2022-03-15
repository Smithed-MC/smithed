import appSettings, { reloadSettings, saveSettings } from "./Settings"
import { registeredPalettes, setPalette } from "./shared/Palette"

export function changePalette(name: string) {
    setPalette(registeredPalettes[name])
    appSettings.palette = name
    saveSettings()
}

setPalette(registeredPalettes[appSettings.palette])