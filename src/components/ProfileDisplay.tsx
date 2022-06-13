import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { RowDiv, userData } from '..';
import Home from '../pages/Home';
import { saveProfiles } from '../ProfileHelper';
import appSettings, { fs, pathModule, remote } from '../Settings';
import ContextMenu from './ContextMenu';
import Dropdown, { Option } from './Dropdown';
import { StyledLabel } from '../Shared';
import { useHistory } from 'react-router';
import { setSelectedProfile } from '../pages/Browse';
import Profile from 'shared/Profile';
import * as zip from '@zip.js/zip.js'
import { disableSidebar } from './Sidebar';

const { ipcRenderer } = window.require('electron');
interface ProfileDisplayProps {
    profile: Profile,
    active: boolean
}

const ProfileDisplayDiv = styled.div`
    height:300px;
    width:210px;
    background-color: var(--darkBackground);
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 8px;
`

const ProfilePlayButton = styled.button`
    width: 90%;
    height: 60%;
    font-family: Disket-Bold;
    font-size: 24px;
    border: none;
    background-color: var(--lightAccent);
    color: var(--text);
    border-radius: 4px;
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

const ProfileNameLabel = styled.label`
    width: 100%;
    text-align: 'left';
    color: var(--text);
    font-family: Inconsolata;
    font-size: 20px;
    -webkit-user-select: none;
`

function ProfileDisplay(props: ProfileDisplayProps) {
    const [mouseOver, setMouseOver] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const history = useHistory();
    useEffect(() => {
        ipcRenderer.on('invalid-launcher', () => {
            alert('Unable to find your Minecraft Launcher, please fix it in \'Settings\'')
        })
    }, [])




    return (
        <ProfileDisplayDiv onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {props.profile.img !== undefined && <img className='bg-darkAccent rounded-md' style={{ width: 192, height: 192 }} src={props.profile.img} alt="Profile Icon" />}
                {props.profile.img === undefined && <div className='bg-darkAccent rounded-md' style={{ width: 192, height: 192 }} />}
                <StyledLabel style={{ width: '40%', position: 'relative', textAlign: 'center', top: -180, left: 45, backgroundColor: 'rgba(0.140625,0.13671875,0.16796875,0.25)', fontFamily: 'Inconsolata', WebkitUserSelect: 'none', color: 'var(--titlebar)' }}>{props.profile.version}</StyledLabel>
            </div>
            <div style={{ width: '90%', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!mouseOver &&
                    <ProfileNameLabel>
                        <b>{props.profile.name}</b>
                    </ProfileNameLabel>}
                {!mouseOver &&
                    <ProfileNameLabel className='text-subText' style={{ fontSize: 18 }}>
                        {`by ${props.profile.author}`}
                    </ProfileNameLabel>}

                <Dropdown style={{ display: 'none' }} id="context-menu">
                    <Option value="Edit" />
                </Dropdown>
                {mouseOver &&
                    <RowDiv style={{ width: '100%', height: '100%', gap: 4, alignItems: 'center', marginTop: -4 }}>
                        <ProfilePlayButton onClick={async (e) => {
                            if (e.altKey) return

                            if (Home.instance.state.activeProfile === '') {
                                if (props.profile.setup === undefined || !props.profile.setup) {
                                    if (props.profile.packs !== undefined) {
                                        setDownloading(true)
                                        // disableSidebar(true)

                                        const baseUrl = 'https://smithed.dev'// 'http://vps-fb6d39ae.vps.ovh.us'
                                        const url = `${baseUrl}/api/download?version=${props.profile.version}&` + props.profile.packs.map(p => {
                                            return 'pack=' + p.id + '@' + p.version
                                        }).join('&')

                                        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
                                        const packsBuf = await (response).blob()

                                        const packsZip = new zip.ZipReader(new zip.BlobReader(packsBuf))

                                        const entries = await packsZip.getEntries()
                                        for (let e of entries) {
                                            if (e.getData === undefined) continue;

                                            const data: Blob = (await e.getData(new zip.BlobWriter()))
                                            const buffer: Buffer = Buffer.from(await data.arrayBuffer())

                                            if (e.filename.includes('datapack'))
                                                fs.writeFileSync(pathModule.join(props.profile.directory, 'datapacks/datapacks.zip'), buffer)
                                            else if (e.filename.includes('resourcepack'))
                                                fs.writeFileSync(pathModule.join(props.profile.directory, 'resourcepacks/resourcepacks.zip'), buffer)
                                        }

                                        // disableSidebar(false)
                                        setDownloading(false)
                                        props.profile.setup = true;
                                        saveProfiles(userData.profiles)
                                    }
                                }
                                ipcRenderer.send('start-launcher', props.profile, appSettings.launcher)

                            }
                            Home.instance.renderMyProfiles()
                        }} disabled={Home.instance.state.activeProfile !== '' || downloading} onMouseDownCapture={(e) => {
                            if (e.button === 2)
                                ContextMenu.openMenu(props.profile.name, e.clientX, e.clientY)
                        }}>
                            {props.active ? 'RUNNING' : 'PLAY'}
                        </ProfilePlayButton>
                    </RowDiv>}
            </div>

            <ContextMenu id={props.profile.name} className='bg-lightBackground border-4 border-lightAccent' style={{ borderRadius: 8, padding: 8, gap: 4, width: 152, flexDirection: 'column' }} offsetX={74} offsetY={40}>
                <button className='bg-darkBackground text-text font-[Disket-Bold] text-[20px] hover:brightness-75 active:brightness-60' onClick={() => {
                    remote.shell.openExternal(props.profile.directory)
                }}>Open</button>
                <button className='bg-darkBackground text-text font-[Disket-Bold] text-[20px] hover:brightness-75 active:brightness-60' onClick={() => {
                    setSelectedProfile(props.profile.name)
                    history.push('/app/browse/')
                }}>Edit</button>
                <button className='bg-darkBackground text-text font-[Disket-Bold] text-[20px] hover:brightness-75 active:brightness-60' onClick={async () => {
                    if (props.profile.packs === undefined) {
                        alert('No packs in this profile!')
                        return
                    }
                    let link = `https://smithed.dev/download?version=${props.profile.version}&name=${encodeURIComponent(props.profile.name)}&author=${encodeURIComponent(props.profile.author ? props.profile.author : 'Unknown')}`
                    for (let p of props.profile.packs) {
                        link += `&pack=${p.id}@${encodeURIComponent(p.version)}`
                    }
                    await navigator.clipboard.writeText(link)

                    alert('Copied link to clipboard!\nSend it your friends!')
                }}>Export</button>
                <button className='bg-darkBackground text-badAccent font-[Disket-Bold] text-[20px] hover:brightness-75 active:brightness-60' onClick={() => {
                    const idx = userData.profiles.indexOf(props.profile)
                    const p = userData.profiles.splice(idx, 1)[0]

                    saveProfiles(userData.profiles)
                    Home.instance.buildProfileDisplays()

                    ContextMenu.closeMenu(props.profile.name)

                    fs.rmdirSync(p.directory, {
                        recursive: true
                    })

                }}>Delete</button>
            </ContextMenu>
        </ProfileDisplayDiv>
    );

}

export default ProfileDisplay;
