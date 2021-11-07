import appSettings, { reloadSettings } from './Settings';

interface Palette { 
    darkAccent: string, 
    lightAccent: string, 
    badAccent: string,
    darkBackground: string, 
    lightBackground: string, 
    text: string, 
    subText: string, 
    titlebar: string
}


const defaultDark: Palette = {
    darkAccent: '#1B48C4',
    lightAccent: '#216BEA',
    badAccent: '#FF282F',
    darkBackground: '#24232B',
    lightBackground: '#2F2F38',
    text: '#FFFFFF',
    subText: '#A0A0A0',
    titlebar: '#FFFFFF'
}
const mccDark: Palette = {
    darkAccent: '#02ADEE',
    lightAccent: '#54CBF7',
    badAccent: '#FF282F',
    darkBackground: defaultDark.darkBackground,
    lightBackground: defaultDark.lightBackground,
    text: defaultDark.text,
    subText: defaultDark.subText,
    titlebar: defaultDark.titlebar
}
const creeperMagnet: Palette = {
    darkAccent: '#006F1C',
    lightAccent: '#008721',
    badAccent: '#FF282F',
    darkBackground: defaultDark.darkBackground,
    lightBackground: defaultDark.lightBackground,
    text: defaultDark.text,
    subText: defaultDark.subText,
    titlebar: defaultDark.titlebar
}
const defaultLight: Palette = {
    darkAccent: '#1B48C4',
    lightAccent: '#216BEA',
    badAccent: '#DD0037',
    darkBackground: '#A0A0AF',
    lightBackground: '#D9D9E0',
    text: '#24232B',
    subText: '#2F2F38',
    titlebar: '#FFFFFF'
}
let curPalette: Palette = mccDark

export let registeredPalettes: { [key: string]: Palette } = {
    defaultDark: defaultDark,
    defaultLight: defaultLight,
    mccDark: mccDark,
    creeperMagnet: creeperMagnet
}


export function changePalette(name: string) {
    curPalette = registeredPalettes[name]
    appSettings.palette = name
    reloadSettings()
}

curPalette = registeredPalettes[appSettings.palette]

export default curPalette

