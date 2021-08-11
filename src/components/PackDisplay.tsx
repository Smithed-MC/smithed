import React, { version } from 'react';
import styled from 'styled-components';
import { ColumnDiv, firebaseApp, RowDiv, userData } from '..';
import { Dependency, Display, Pack, PackHelper } from '../Pack';
import Browse, { PackEntry } from '../pages/Browse';
import Home, { Profile } from '../pages/Home';
import curPalette from '../Palette'
import {Header3} from '..'
import { fs, pathModule, settingsFolder } from '../Settings';
interface PackDisplayProps {
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


class PackDisplay extends React.Component {
    props: PackDisplayProps
    state: PackDisplayState
    constructor(props: PackDisplayProps) {
        super(props)
        this.props = props
        this.state = {}
    }

    saveProfiles(profiles: Profile[]) {
        fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), JSON.stringify(profiles, null, 2))
    }

    profileContains(): boolean {
        if(Browse.instance.state.profile.packs != null) {
            for(let p of Browse.instance.state.profile.packs) {
                console.log(`${p.id} | ${this.props.packEntry.id}`)
                if(p.id == this.props.packEntry.id) 
                    return true
            }
        }
        return false
    }

    render() {
        const dateAdded = new Date(this.props.packEntry.added)
        const timeDiff = Math.floor(Math.abs(dateAdded.getTime() - Date.now()) / (1000 * 3600 * 24))

        const display: Display | 'hidden' = this.props.packEntry.data.display

        if(display == 'hidden') return

        const contained = this.profileContains()
        return (
            <div style={{width:'85%'}}>
                <RowDiv style={{backgroundColor:curPalette.darkBackground, width: '100%',padding:16, justifyContent:'left', gap:16, borderRadius:8}}>
                    <img style={{width:64, height: 64, backgroundColor:curPalette.darkAccent, WebkitUserSelect:'none'}} src={display.icon}/>
                    <ColumnDiv style={{alignItems:'left',width:'100%', justifyContent:'space-evenly'}}>
                        <RowDiv style={{alignItems:'left', width:'100%', justifyContent:'space-evenly'}}>
                            <PackName>{display.name}</PackName>
                            {!contained && <PackAddButton disabled={Browse.instance.state.profile.name == ''} onClick={()=>{
                                const packVersion = PackHelper.getLatestVersionForVersion(this.props.packEntry.data, Browse.instance.state.profile.version)

                                let temp: Dependency[] = []
                                let packs = Browse.instance.state.profile.packs != null ? Browse.instance.state.profile.packs : []

                                temp.push({id: this.props.packEntry.id, version: packVersion})
                                temp.concat(PackHelper.resolveDependencies(this.props.packEntry.data, packVersion))

                                temp.forEach(d => {
                                    if(!packs.includes(d)) {
                                        packs.push(d)
                                    }
                                })

                                Browse.instance.state.profile.packs = packs
                                
                                this.saveProfiles(userData.profiles)
                            }}>+</PackAddButton>}
                            {contained && <PackAddButton>-</PackAddButton>}
                        </RowDiv>
                        <RowDiv style={{justifySelf:'left', gap:32, width:'100%'}}>
                            <PackStats>{'100M Downloads'}</PackStats>
                            <PackStats>{`Updated ${timeDiff} day${timeDiff != 1 ? 's' : ''} ago`}</PackStats>
                            <PackStats>{`Added ${dateAdded.toLocaleDateString()}`}</PackStats>
                            <li style={{flexGrow:1, width:'100%', visibility:'hidden'}}/>
                        </RowDiv>
                        <div style={{width:'100%'}}>
                            <PackDescription>{display.description}</PackDescription>
                        </div>
                    </ColumnDiv>
                </RowDiv>
            </div>
        );
    }
}

export default PackDisplay;
