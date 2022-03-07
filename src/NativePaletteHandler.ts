import appSettings, { reloadSettings } from "./Settings"
import { registeredPalettes, setPalette } from "./shared/Palette"

export function changePalette(name: string) {
    setPalette(registeredPalettes[name])
    appSettings.palette = name
    // reloadSettings()
}

setPalette(registeredPalettes[appSettings.palette])