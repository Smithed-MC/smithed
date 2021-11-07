import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ColumnDiv, RowDiv } from '..';
import { Display, PackEntry } from '../Pack';
import curPalette from '../Palette'
import { RouteComponentProps, withRouter } from 'react-router';
import { selectedProfile } from '../pages/Browse';
import { addPackToProfile, removePackToProfile as removePackFromProfile } from '../ProfileHelper';

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
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
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


function PackDisplay(props: PackDisplayProps) {
    const profileContains: ()=>boolean = () => {
        if(selectedProfile.packs != null) {
            for(let p of selectedProfile.packs) {
                if(p.id === props.packEntry.id) 
                    return true
            }
        }
        return false
    }
    const [contained, setContained] = useState(profileContains())

    useEffect(()=>{
        setContained(profileContains())
    })


    const dateAdded = new Date(props.packEntry.updated !== undefined ? props.packEntry.updated : props.packEntry.added)
    const timeDiff = Math.floor(Math.abs(dateAdded.getTime() - Date.now()) / (1000 * 3600 * 24))

    const display: Display | 'hidden' = props.packEntry.data.display

    if(display === 'hidden') return (<div></div>)



    return (
        <div style={{width:'85%'}}>
            <RowDiv style={{backgroundColor:curPalette.darkBackground, width: '100%', height:64, padding:16, justifyContent:'left', gap:16, borderRadius:8}}>
                <img style={{width:64, height: 64, WebkitUserSelect:'none'}} src={display.icon} alt="Pack Icon"/>
                <ColumnDiv style={{alignItems:'left',width:'100%', justifyContent:'space-evenly'}}>
                    <RowDiv style={{alignItems:'left', width:'inherit', justifyContent:'space-between', gap:4}}>
                        <div style={{display:'table',tableLayout:'fixed', width:'100%'}}>
                            <PackName onClick={()=>{
                                const id = props.packEntry.id.split(':')
                                const link = `/app/browse/view/${id[0]}/${id[1]}`
                                props.history.push(link)
                            }}>{display.name}</PackName>
                        </div>
                        {!contained && <PackAddButton disabled={selectedProfile.name === ''} onClick={()=>{
                            setContained(true)
                            addPackToProfile(selectedProfile, props.packEntry)
                        }}>+</PackAddButton>}
                        {contained && <PackAddButton style={{backgroundColor:curPalette.badAccent}} onClick={()=>{
                            setContained(false)
                            removePackFromProfile(selectedProfile, props.packEntry);
                        }}>-</PackAddButton>}
                    </RowDiv>
                    <RowDiv style={{justifySelf:'left', gap:32, width:'100%'}}>
                        <PackStats>{'100M Downloads'}</PackStats>
                        <PackStats>{`Updated ${timeDiff} day${timeDiff !== 1 ? 's' : ''} ago`}</PackStats>
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

export default withRouter(PackDisplay);
