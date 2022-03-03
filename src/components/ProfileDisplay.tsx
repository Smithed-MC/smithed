import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { RowDiv, userData } from '..';
import Home, { Profile } from '../pages/Home';
import palette from '../shared/Palette'
import { saveProfiles } from '../ProfileHelper';
import appSettings, { fs, pathModule } from '../Settings';
import ContextMenu from './ContextMenu';
import Dropdown, { Option } from './Dropdown';
import { StyledLabel, StyledButton } from '../Shared';
import { useHistory } from 'react-router';
import { setSelectedProfile } from '../pages/Browse';
import PackDownloader from '../shared/PackDownload';
import { Dependency } from '../Pack';


const { ipcRenderer } = window.require('electron');
interface ProfileDisplayProps {
    profile: Profile,
    active: boolean
}

interface ProfileDisplayState {
    mouseOver: boolean,
    editMenu: boolean
}

const ProfileDisplayDiv = styled.div`
    height:300px;
    width:210px;
    background-color: ${palette.darkBackground};
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ProfilePlayButton = styled.button`
    width: 90%;
    height: 60%;
    font-family: Disket-Bold;
    font-size: 24px;
    color: ${palette.text};
    border: none;
    background-color: ${palette.lightAccent};
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
    color: ${palette.text};
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
                {props.profile.img !== undefined && <img style={{ width: 192, height: 192, backgroundColor: palette.darkAccent }} src={props.profile.img} alt="Profile Icon" />}
                {props.profile.img === undefined && <div style={{ width: 192, height: 192, backgroundColor: palette.darkAccent }} />}
                <StyledLabel style={{ width: '40%', position: 'relative', textAlign: 'center', top: -180, left: 45, backgroundColor: 'rgba(0.140625,0.13671875,0.16796875,0.25)', color: palette.text, fontFamily: 'Inconsolata', WebkitUserSelect: 'none' }}>{props.profile.version}</StyledLabel>
            </div>
            <div style={{ width: '90%', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!mouseOver &&
                    <ProfileNameLabel>
                        <b>{props.profile.name}</b>
                    </ProfileNameLabel>}
                {!mouseOver &&
                    <ProfileNameLabel style={{ color: palette.subText, fontSize: 18 }}>
                        {`by ${props.profile.author}`}
                    </ProfileNameLabel>}

                <Dropdown style={{ display: 'none' }} id="context-menu">
                    <Option value="Edit" />
                </Dropdown>
                {mouseOver &&
                    <RowDiv style={{ width: '100%', height: '100%', gap: 4, alignItems: 'center', marginTop: -4 }}>
                        <ProfilePlayButton onClick={async (e) => {

                            if (Home.instance.state.activeProfile === '') {
                                if (props.profile.setup === undefined || !props.profile.setup) {
                                    if (props.profile.packs !== undefined) {
                                        setDownloading(true)
                                        let packs: {id:string,owner:string,version?:string}[] = []
                                        for(let p of props.profile.packs) {
                                            packs.push({id: p.id.split(':')[1], owner: p.id.split(':')[0], version: p.version })
                                        }
                                        await (new PackDownloader((m)=>console.log(m), props.profile.version)).downloadAndMerge(packs, (dpBlob, rpBlob, packIds)=>{
                                            fs.writeFileSync(pathModule.join(props.profile.directory, 'datapacks/datapacks.zip', dpBlob[1]))
                                            fs.writeFileSync(pathModule.join(props.profile.directory, 'resourcepacks/resourcepacks.zip', rpBlob[1]))
                                        })
                                        setDownloading(false)
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

            <ContextMenu id={props.profile.name} style={{ backgroundColor: palette.lightBackground, border: `4px solid ${palette.lightAccent}`, borderRadius: 8, padding: 8, gap: 4, width: 152, flexDirection: 'column' }} offsetX={74} offsetY={40}>
                <StyledButton style={{ backgroundColor: palette.darkBackground }} onClick={() => {
                    setSelectedProfile(props.profile.name)
                    history.push('/app/browse/')
                }}>Edit</StyledButton>
                <StyledButton style={{backgroundColor: palette.darkBackground}} onClick={async () => {
                    if(props.profile.packs === undefined) {
                        alert('No packs in this profile!')
                        return
                    }
                    let link = `https://smithed.dev/download?version=${props.profile.version}&name=${encodeURIComponent(props.profile.name)}&author=${encodeURIComponent(props.profile.author ? props.profile.author : 'Unknown')}`
                    for(let p of props.profile.packs) {
                        link += `&pack=${p.id}@${encodeURIComponent(p.version)}`
                    }
                    await navigator.clipboard.writeText(link)
                    
                    alert('Copied link to clipboard!\nSend it your friends!')
                }}>Export</StyledButton>
                <StyledButton style={{ backgroundColor: palette.darkBackground, color: 'red' }} onClick={() => {
                    const idx = userData.profiles.indexOf(props.profile)
                    const p = userData.profiles.splice(idx, 1)[0]

                    saveProfiles(userData.profiles)
                    Home.instance.buildProfileDisplays()

                    ContextMenu.closeMenu(props.profile.name)

                    fs.rmdirSync(p.directory, {
                        recursive: true
                    })

                }}>Delete</StyledButton>
            </ContextMenu>
        </ProfileDisplayDiv>
    );

}

export default ProfileDisplay;
