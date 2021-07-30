import ReactDOM from 'react-dom';
import React from 'react';
import appSettings, { reloadSettings } from './Settings';

class Palette {
    darkAccent : string
    lightAccent : string
    darkBackground : string
    lightBackground : string
    text : string
    subText : string
    titlebar : string
    constructor(colors : {darkAccent: string, lightAccent: string, darkBackground: string, lightBackground: string, text: string, subText: string, titlebar: string}) {
        this.darkAccent = colors.darkAccent
        this.lightAccent = colors.lightAccent
        this.darkBackground = colors.darkBackground
        this.lightBackground = colors.lightBackground
        this.text = colors.text
        this.subText = colors.subText
        this.titlebar = colors.titlebar
    }
}


const defaultDark = new Palette({
    darkAccent: '#1B48C4',
    lightAccent: '#216BEA',
    darkBackground: '#24232B',
    lightBackground: '#2F2F38',
    text: '#FFFFFF',
    subText: '#A0A0A0',
    titlebar: '#FFFFFF'
})
const mccDark = new Palette({
    darkAccent: '#02ADEE',
    lightAccent: '#54CBF7',
    darkBackground: defaultDark.darkBackground,
    lightBackground: defaultDark.lightBackground,
    text: defaultDark.text,
    subText: defaultDark.subText,
    titlebar: defaultDark.titlebar
})
const defaultLight = new Palette({
    darkAccent: '#1B48C4',
    lightAccent: '#216BEA',
    darkBackground: '#A0A0AF',
    lightBackground: '#D9D9E0',
    text: '#24232B',
    subText: '#2F2F38',
    titlebar: '#FFFFFF'
})
let curPalette: Palette = mccDark

let registeredPalettes : {[key:string]: Palette} = {
    defaultDark: defaultDark,
    defaultLight: defaultLight,
    mccDark: mccDark
}


const remote = window.require('@electron/remote')

export function changePalette(name: string) {
    curPalette = registeredPalettes[name]
    appSettings.palette = name
    reloadSettings()
}

curPalette = registeredPalettes[appSettings.palette]

export default curPalette

