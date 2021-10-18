import React, { version } from 'react';
import styled from 'styled-components';
import { ColumnDiv, firebaseApp, RowDiv, userData } from '..';
import { Dependency, Display, Pack, PackHelper } from '../Pack';
import Browse, { PackEntry } from '../pages/Browse';
import Home, { Profile } from '../pages/Home';
import curPalette from '../Palette'
import {Header3} from '..'
import { fs, pathModule, settingsFolder } from '../Settings';
import { RouteComponentProps, withRouter } from 'react-router';
interface PackDisplayProps extends RouteComponentProps {
    packEntry: PackEntry
}

interface PackDisplayState {
}

const PackName = styled.label`
    font-family: Disket-Bold;
    color: ${curPalette.text};
    text-align: left;
    width: 100%;
    font-size: 18px;
    -webkit-user-select: none;
    white-space: nowrap;
    overflow: hidden;
    display: table-cell;
    text-overflow: ellipsis;

    :hover {
        filter: brightness(85%);
        text-decoration: underline;
    }
    :active {
        filter: brightness(75%);
    }
`
const PackStats = styled.label`
    font-family: Inconsolata;
    color: ${curPalette.subText};
    text-align: left;
    width: auto;
    font-size: 12px;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
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


class PackDisplay extends React.Component {
    props: PackDisplayProps
    state: PackDisplayState
    constructor(props: PackDisplayProps) {
        super(props)
        this.props = props
        this.state = {}
    }


    profileContains(): boolean {
        if(Browse.instance.state.profile.packs != null) {
            for(let p of Browse.instance.state.profile.packs) {
                console.log(`${p.id} | ${this.props.packEntry.id}`)
                if(p.id === this.props.packEntry.id) 
                    return true
            }
        }
        return false
    }

    render() {
        const dateAdded = new Date(this.props.packEntry.added)
        const timeDiff = Math.floor(Math.abs(dateAdded.getTime() - Date.now()) / (1000 * 3600 * 24))

        const display: Display | 'hidden' = this.props.packEntry.data.display

        if(display === 'hidden') return

        const contained = this.profileContains()
        return (
            <div style={{width:'85%'}}>
                <RowDiv style={{backgroundColor:curPalette.darkBackground, width: '100%', height:64, padding:16, justifyContent:'left', gap:16, borderRadius:8}}>
                    <img style={{width:64, height: 64, backgroundColor:curPalette.darkAccent, WebkitUserSelect:'none'}} src={display.icon}/>
                    <ColumnDiv style={{alignItems:'left',width:'100%', justifyContent:'space-evenly'}}>
                        <RowDiv style={{alignItems:'left', width:'inherit', justifyContent:'space-between', gap:4}}>
                            <div style={{display:'table',tableLayout:'fixed', width:'100%'}}>
                                <PackName onClick={()=>{
                                    const id = this.props.packEntry.id.split(':')
                                    const link = `/app/browse/view/${id[0]}/${id[1]}`
                                    this.props.history.push(link)
                                }}>{display.name}</PackName>
                            </div>
                            {!contained && <PackAddButton disabled={Browse.instance.state.profile.name === ''} onClick={()=>{
                                Browse.addPackToProfile(this.props.packEntry)
                            }}>+</PackAddButton>}
                            {contained && <PackAddButton>-</PackAddButton>}
                        </RowDiv>
                        <RowDiv style={{justifySelf:'left', gap:32, width:'100%'}}>
                            <PackStats>{'100M Downloads'}</PackStats>
                            <PackStats>{`Updated ${timeDiff} day${timeDiff !== 1 ? 's' : ''} ago`}</PackStats>
                            <PackStats>{`Added ${dateAdded.toLocaleDateString()}`}</PackStats>
                            <li style={{flexGrow:1, width:'100%', visibility:'hidden'}}/>
                        </RowDiv>
                        <div style={{width:'100%'}}>
                            <PackDescription>{display.description.length < 70 ? display.description : display.description.substring(0, 70) + '...'}</PackDescription>
                        </div>
                    </ColumnDiv>
                </RowDiv>
            </div>
        );
    }
}

export default withRouter(PackDisplay);
