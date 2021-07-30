import React from 'react';
import styled from 'styled-components';
import '../font.css'
import curPalette, { changePalette } from '../Palette';

class Settings extends React.Component {
    constructor(props: any) {
        super(props)
    }

    render() {
        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <label style={{color:curPalette.text}}>SETTINGS</label>
                <button onClick={()=>changePalette('defaultDark')}>dark</button>
                <button onClick={()=>changePalette('defaultLight')}>light</button>
                <button onClick={()=>changePalette('mccDark')}>mcc dark</button>

            </div>
        );
    }
}

export default Settings;
