import React, { version } from 'react';
import styled from 'styled-components';
import { ColumnDiv, firebaseApp, RowDiv, userData } from '..';
import { Dependency, Display, Pack, PackHelper } from '../Pack';
import Browse, { PackEntry } from '../pages/Browse';
import Home, { Profile } from '../pages/Home';
import curPalette from '../Palette'
import {Header3} from '..'
import { fs, pathModule, settingsFolder } from '../Settings';
interface CreatePackDisplayProps {
    pack: Pack
}

interface CreatePackDisplayState {
}

const PackName = styled.label`
    font-family: Disket-Bold;
    color: ${curPalette.text};
    text-align: left;
    width: 100%;
    font-size: 18px;
`
const PackStats = styled.label`
    font-family: Inconsolata;
    color: ${curPalette.subText};
    text-align: left;
    width: auto;
    font-size: 12px;
    white-space: nowrap;
    vertical-align: middle;
`
const PackDescription = styled.label`
    font-family: Inconsolata;
    color: ${curPalette.text};
    text-align: left;
    width: 100%;
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: clip;
`

const PackAddButton = styled.button`
    border: none;
    color: ${curPalette.text};
    background-color: ${curPalette.lightAccent};
    font-family: Disket-Bold;
    font-size: 20px;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
    :disabled {
        filter: brightness(50%);
    }
`


class CreatePackDisplay extends React.Component {
    props: CreatePackDisplayProps
    state: CreatePackDisplayState
    constructor(props: CreatePackDisplayProps) {
        super(props)
        this.props = props
        this.state = {}
    }

    render() {
        return(
            <RowDiv style={{backgroundColor:curPalette.darkBackground, alignItems:'center', justifyContent:'left', padding: 8, gap: 8, width:320, height:64}}>
                <img style={{width:64,height:64}} src={this.props.pack.display != 'hidden' ? this.props.pack.display.icon : ''}/>
                <label style={{fontFamily:'Disket-Bold', color:curPalette.text}}>{this.props.pack.display != 'hidden' ? this.props.pack.display.name : this.props.pack.id}</label>
            </RowDiv>
        );
    }
}

export default CreatePackDisplay;
