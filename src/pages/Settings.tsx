import React from 'react';
import styled from 'styled-components';
import '../font.css'
import curPalette, { changePalette, registeredPalettes } from '../Palette';
import Dropdown, {Option} from '../components/Dropdown';
import appSettings from '../Settings';
import { Header1, Header3, RowDiv } from '..';
class Settings extends React.Component {
    constructor(props: any) {
        super(props)
    }
    renderPalettes() {
        let final = []

        for(let p in registeredPalettes) {
            if(p == appSettings.palette)
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
            </div>
        );
    }
}

export default Settings;
