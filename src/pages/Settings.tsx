import React from 'react';
import '../font.css'
import curPalette, { changePalette, registeredPalettes } from '../Palette';
import Dropdown, {Option} from '../components/Dropdown';
import appSettings, { saveSettings } from '../Settings';
import { Header1, Header3, RowDiv, StyledInput } from '..';
import styled from 'styled-components';

const SettingsButton = styled.button`
    height:32px;
    width:128px;
    color:${curPalette.text};
    background-color:${curPalette.lightAccent};
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
        this.state = {launcherPath: appSettings.launcher}
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
                <Header3 style={{marginTop:6}}>Palette:</Header3>
                <Dropdown onChange={(p)=>{changePalette(p)}}>
                    {final}
                </Dropdown>
            </RowDiv>
        )
    }
    render() {

        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <Header1>SETTINGS</Header1>
                {this.renderPalettes()}
                <StyledInput placeholder="" type="file" id="launcherInput" hidden onChange={(e) => {
                        if(e.target.files != null && e.target.files.length !== 0) {
                            const file: any = e.target.files[0]
                            appSettings.launcher = file.path
                            this.setState({launcherPath: file.path})
                            saveSettings()
                        }
                    }}/>
                <RowDiv style={{width:'33%'}}>
                    <StyledInput placeholder="Path..." style={{width:'100%'}} value={this.state.launcherPath} disabled/>
                    <SettingsButton onClick={()=>{
                        const input = document.getElementById("launcherInput")
                        if(input != null) { 
                            input.click()
                        }
                    }}>Browse</SettingsButton>
                </RowDiv>
            </div>
        );
    }
}

export default Settings;
