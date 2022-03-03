import React from 'react';
import '../font.css'
import palette, { registeredPalettes } from '../shared/Palette.js';
import Dropdown, {Option} from '../components/Dropdown';
import appSettings, { saveSettings } from '../Settings';
import { Header1, RowDiv, StyledInput, userData } from '..';
import styled from 'styled-components';
import GroupedFoldout from '../components/GroupedFoldout';
import { StyledLabel } from '../Shared';
import { changePalette } from '../NativePaletteHandler';

const SettingsButton = styled.button`
    height:32px;
    width:128px;
    color:${palette.text};
    background-color:${palette.lightAccent};
    font-size:20px;
    border: none;
    font-family: Disket-Bold;
    -webkit-user-select: none;
    
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`

class Settings extends React.Component {
    state : {[key: string]: any} = {}
    constructor(props: any) {
        super(props)
        this.state = {launcherPath: appSettings.launcher, donation: {kofi: '', patreon: '', other: ''}}
    }

    componentDidMount() {
        
        userData.ref?.child('donation').get().then((snapshot) => {
            const donations = snapshot.val() != null ? snapshot.val() : {kofi:'',patreon:'',other:''}

            if(donations["kofi"] == null) donations["kofi"] = ""
            if(donations["patreon"] == null) donations["patreon"] = ""
            if(donations["other"] == null) donations["other"] = ""

            this.setState({donation: donations})
            console.table(snapshot.val())
        })
    }

    renderPalettes() {
        let final = []
        for(let p in registeredPalettes) {
            if(p === appSettings.palette)
                final.unshift(<Option key={p} value={p}/>)
            else
                final.push(<Option key={p} value={p}/>)
        }

        return(
            <RowDiv style={{justifyContent:'bottom'}}>
                <StyledLabel style={{marginTop:6}}>Palette:</StyledLabel>
                <Dropdown onChange={(p)=>{changePalette(p)}}>
                    {final}
                </Dropdown>
            </RowDiv>
        )
    }
    render() {

        const updateDonation = (path: string, value: string) => {
            userData.ref?.child(`donation/${path}`).set(value)
        }
        const platform = process.platform;

        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <Header1>App Options</Header1>
                {/* {this.renderPalettes()} */}
                <StyledInput placeholder="" type="file" id="launcherInput" hidden onChange={(e) => {
                        if(e.target.files != null && e.target.files.length !== 0) {
                            const file: any = e.target.files[0]
                            appSettings.launcher = file.path
                            this.setState({launcherPath: file.path})
                            saveSettings()
                        }
                    }}/>
                {platform !== 'darwin' && <div className='flex flex-row items-baseline gap-2 w-[33%]'>
                    <StyledInput placeholder="Path..." style={{width:'100%'}} value={this.state.launcherPath} disabled/>
                    <SettingsButton onClick={()=>{
                        const input = document.getElementById("launcherInput")
                        if(input != null) { 
                            input.click()
                        }
                    }}>Browse</SettingsButton>
                </div>}
                <Header1>Account Options</Header1>
                <GroupedFoldout text='Donations' group='Account Options' style={{width:'33%', backgroundColor:'transparent'}}>
                    <StyledLabel>Kofi</StyledLabel>
                    <StyledInput placeholder="Kofi Username..." defaultValue={this.state.donation["kofi"]} style={{width:'100%'}} onChange={(e) => updateDonation('kofi', e.target.value)}/>
                    <StyledLabel>Patreon</StyledLabel>
                    <StyledInput placeholder="Patreon Username..." defaultValue={this.state.donation["patreon"]} style={{width:'100%'}} onChange={(e) => updateDonation('patreon', e.target.value)}/>
                    <StyledLabel>Other Link</StyledLabel>
                    <StyledInput placeholder="Other Link..." defaultValue={this.state.donation["other"]} style={{width:'100%'}} onChange={(e) => updateDonation('other', e.target.value)}/>
                </GroupedFoldout>
            </div>
        );
    }
}

export default Settings;
