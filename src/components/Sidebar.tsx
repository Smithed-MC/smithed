import React from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import NewsSvg from '../icons/news.svg'
import HomeSvg from '../icons/home.svg'
import BrowseSvg from '../icons/browse.svg'
import CreateSvg from '../icons/create.svg'
import DiscordSvg from '../icons/discord.svg'
import SettingsSvg from '../icons/settings.svg' 
import SidebarOption from './SidebarOption';
import * as app from '../App';
import curPalette from '../Palette';

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 32px;
    height: 100wh;
    // border-right: 2px solid #5D5377;
    background-color: ${curPalette.darkBackground};
    margin-top:0px;
    padding: 15px 10px;
    align-items:center;
    gap: 16px;
    -webkit-user-drag: none;
`

interface SidebarProps {
  onClick: (p: string) => void 
}

function Sidebar(props: SidebarProps) {
  return (
    <SidebarContainer>
        <SidebarOption img={NewsSvg} hint='News' onClick={() => {props.onClick('news')}}/>
        <SidebarOption img={HomeSvg} hint='Home' onClick={() => {props.onClick('home')}}/>
        <SidebarOption img={BrowseSvg} hint='Browse' onClick={() => {props.onClick('browse')}}/>
        <SidebarOption img={CreateSvg} hint='Create' onClick={() => {props.onClick('create')}}/>
        <li style={{visibility: 'hidden', flexGrow: 1}}/>
        <SidebarOption img={SettingsSvg} hint='Settings' onClick={() => {props.onClick('settings')}}/>
        <SidebarOption img={DiscordSvg} hint='Join the Discord' style={{height:48, width:48, marginLeft:-7.75, marginTop:-3}} onClick={()=>{
          window.require("electron").shell.openExternal('https://discord.gg/tDxtDHv2fS')
        }}/>
    </SidebarContainer>
  );
}

export default Sidebar;
