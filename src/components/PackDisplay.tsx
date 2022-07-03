import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ColumnDiv, mainEvents, RowDiv } from '..';
import { Display, PackEntry, PackHelper } from '../Pack';
import palette from '../shared/Palette'
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
    color: var(--text);
    text-align: left;
    width: 100%;
    font-size: 18px;
    -webkit-user-select: none;
    white-space: nowrap;
    overflow: hidden;
    display: table-cell;
    text-overflow: ellipsis;
    vertical-align: text-bottom;
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
    color: var(--subText);
    text-align: left;
    width: auto;
    font-size: 12px;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
`
const PackDescription = styled.label`
    font-family: Inconsolata;
    color: var(--text);
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
    color: var(--text);
    font-family: Disket-Bold;
    font-size: 20px;
    width: 30px;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    margin-top: 4px;
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

const formatDownloads = (count: number) => {
    if (count < 1000) return `${count}`
    else if (count < 1000000) return `${Math.floor(count / 1000)}K`
    else return `${Math.floor(count / 1000000)}M`
}

function PackDisplay(props: PackDisplayProps) {
    const profileContains: () => boolean = () => {
        if (selectedProfile.packs != null) {
            for (let p of selectedProfile.packs) {
                if (p.id === props.packEntry.id)
                    return true
            }
        }
        return false
    }
    const [valid, setValid] = useState(PackHelper.hasVersion(props.packEntry.data, selectedProfile.version))
    const [contained, setContained] = useState(profileContains())

    useEffect(() => {
        setContained(profileContains())
        setValid(PackHelper.hasVersion(props.packEntry.data, selectedProfile.version))
    }, [])

    mainEvents.on('profile-changed', () => {
        setContained(profileContains())
        setValid(PackHelper.hasVersion(props.packEntry.data, selectedProfile.version))
    })

    const dateAdded = new Date(props.packEntry.updated !== undefined ? props.packEntry.updated : props.packEntry.added)
    const timeDiff = Math.floor(Math.abs(dateAdded.getTime() - Date.now()) / (1000 * 3600 * 24))

    const display: Display = props.packEntry.data.display

    return (
        <div id={props.packEntry.id} style={{ width: '85%' }}>
            <div className='flex bg-darkBackground w-full h-[96px] p-4 justify-left rounded-xl gap-4'>
                <img style={{ width: 64, height: 64, WebkitUserSelect: 'none' }} src={display.icon} alt="Pack Icon" title={props.packEntry.id} />
                <ColumnDiv style={{ alignItems: 'left', width: '100%', justifyContent: 'space-evenly' }}>
                    <RowDiv style={{ alignItems: 'bottom', justifyContent: 'space-between', gap: 4, width: '100%' }}>
                        <div style={{ display: 'table', tableLayout: 'fixed', width: '100%' }}>
                            <PackName onClick={() => {
                                const id = props.packEntry.id.split(':')
                                const link = `/app/browse/view/${id[0]}/${id[1]}`
                                props.history.push(link)
                            }}>{display.name}</PackName>
                        </div>
                        {!valid && <div className='relative right-0 bg-red'>
                            <PackAddButton className='bg-lightAccent brightness-50' disabled title={selectedProfile.version === '' ? 
                            'Select a profile to add!' : 'This pack is not compatible with your version of the game'}>+</PackAddButton>     
                        </div>}
                        {valid &&
                            <div className='relative right-0 bg-red'>
                                {!contained && <PackAddButton className='bg-lightAccent' disabled={selectedProfile.name === ''} onClick={() => {
                                    setContained(true)
                                    addPackToProfile(selectedProfile, props.packEntry)
                                }}>+</PackAddButton>}
                                {contained && <PackAddButton className='bg-badAccent' onClick={() => {
                                    setContained(false)
                                    removePackFromProfile(selectedProfile, props.packEntry);
                                }}>-</PackAddButton>}
                            </div>
                        }
                    </RowDiv>
                    <RowDiv style={{ justifySelf: 'left', gap: 32, width: '100%' }} className='mt-[-8px]'>
                        <PackStats>{`${formatDownloads(props.packEntry.downloads !== undefined ? props.packEntry.downloads : 0)} Download${props.packEntry.downloads !== 1 ? 's' : ''}`}</PackStats>
                        <PackStats>{`Updated ${timeDiff} day${timeDiff !== 1 ? 's' : ''} ago`}</PackStats>
                        <PackStats>{`Added ${dateAdded.toLocaleDateString()}`}</PackStats>
                        <li style={{ flexGrow: 1, width: '100%', visibility: 'hidden' }} />
                    </RowDiv>
                    <div style={{ width: '100%' }} className='mt-[-4px]'>
                        <PackDescription>{display.description}</PackDescription>
                    </div>
                </ColumnDiv>
            </div>
        </div>
    );

}

export default withRouter(PackDisplay);
