import React from 'react';
import styled from 'styled-components';
import '../font.css'
import curPalette, { changePalette, registeredPalettes } from '../Palette';

class Settings extends React.Component {
    constructor(props: any) {
        super(props)
    }
    renderPalettes() {
        let final = []

        for(let p in registeredPalettes) {
            final.push(<button onClick={()=>changePalette(p)}>{p}</button>)
        }

        return(
            <div>
                {final}
            </div>
        )
    }
    render() {
        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <label style={{color:curPalette.text}}>SETTINGS</label>
                {this.renderPalettes()}
            </div>
        );
    }
}

export default Settings;
