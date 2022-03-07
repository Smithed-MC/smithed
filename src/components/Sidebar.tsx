import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as NewsSvg } from '../icons/news.svg'
import { ReactComponent as HomeSvg } from '../icons/home.svg'
import { ReactComponent as BrowseSvg } from '../icons/browse.svg'
import { ReactComponent as CreateSvg } from '../icons/create.svg'
import { ReactComponent as DiscordSvg } from '../icons/discord.svg'
import { ReactComponent as SettingsSvg } from '../icons/settings.svg' 
import SidebarOption, {PageBasedSidebarOption} from './SidebarOption';
import { ReactComponent as SignOutSvg } from '../icons/sign_out.svg'
import { ReactComponent as QueueSvg } from '../icons/queue.svg'
import palette from '../shared/Palette';
import { Index, mainEvents, setFirebaseUser, userData } from '..';
import { matchPath, useHistory, useLocation } from 'react-router';
import { auth } from '../shared/ConfigureFirebase';

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 54px;
    height: 100wh;
    // border-right: 2px solid #5D5377;
    background-color: var(--darkBackground);
    margin-top:0px;
    padding: 15px 0px;
    align-items:center;
    gap: 16px;
    -webkit-user-drag: none;
`

interface SidebarProps {
  onClick: (p: string) => void 
}

function TabNavigator(props: any) {
  const history = useHistory();
  const location = useLocation();
  const pages = [
    '/app/news',
    '/app/home',
    '/app/browse',
    '/app/create',
    '/app/queue'
  ]

  const listener = ({key}: {key: string}) => {
    const match = (matchPath(location.pathname, {path:'/app/:page', exact:true}) || matchPath(location.pathname, {path:'/app/'}))

    if(!match?.isExact) return;

    if(key.match(/[0-9]/)) {
      const tab = Number.parseInt(key)
      
      if(match.url !== pages[tab - 1] && (tab !== 5 || userData.role === 'admin'))
        history.push(pages[tab - 1])
    } else if(key === 'ArrowUp' || key === 'ArrowDown') {

      const tab = pages.indexOf(match.url)

      if(tab !== -1 && key === 'ArrowUp') {
        history.push(pages[tab - 1 >= 0 ? tab - 1 : pages.length - 1])
      } else if(tab !== -1 && key === 'ArrowDown') {
        history.push(pages[tab + 1 < pages.length ? tab + 1 : 0])
      }
    }
  }

  useEffect(() => {
    mainEvents.addListener('key-press', listener)

    return () => {
      mainEvents.removeListener('key-press', listener)
    }
  })

  return (
    <span style={{display:'none'}}/>
  )
}

function Sidebar(props: SidebarProps) {
  const [sidebar, setSidebar] = useState((<div></div>));
  const history = useHistory();
  useEffect(() => {
    setSidebar((
      <div className={`flex flex-col items-center h-full py-[15px] px-[10px] gap-[16px] bg-darkBackground`}>
          <TabNavigator/>
          <PageBasedSidebarOption page='/app/news/' img={NewsSvg} hint='News' onClick={() => {props.onClick('news')}}/>
          <PageBasedSidebarOption page='/app/home/' img={HomeSvg} hint='Home' onClick={() => {props.onClick('home')}}/>
          <PageBasedSidebarOption page='/app/browse/' img={BrowseSvg} hint='Browse' onClick={() => {props.onClick('browse')}}/>
          <PageBasedSidebarOption page='/app/create/' img={CreateSvg} hint='Create' onClick={() => {props.onClick('create')}}/>
          {userData.role === 'admin' && <PageBasedSidebarOption page='/app/queue/' img={QueueSvg} hint='Queue' onClick={() => {props.onClick('queue')}}/>}
          <li style={{visibility: 'hidden', flexGrow: 1}}/>
          <SidebarOption img={DiscordSvg} hint='Join the Discord' onClick={()=>{
            window.require("electron").shell.openExternal('https://smithed.dev/discord')
          }}/>
          <PageBasedSidebarOption page='/app/settings/' img={SettingsSvg} hint='Settings' onClick={() => {props.onClick('settings')}}/>
          <SidebarOption img={SignOutSvg} hint='Sign Out' onClick={() => {auth.signOut(); setFirebaseUser(null); history.push(`/`)}}/>
      </div>
    ));
  }, [setSidebar, userData])

  
  return sidebar
}

export default Sidebar;
