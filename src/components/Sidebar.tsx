import React, { useEffect } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import NewsSvg from '../icons/news.svg'
import HomeSvg from '../icons/home.svg'
import BrowseSvg from '../icons/browse.svg'
import CreateSvg from '../icons/create.svg'
import DiscordSvg from '../icons/discord.svg'
import SettingsSvg from '../icons/settings.svg' 
import SidebarOption, {PageBasedSidebarOption} from './SidebarOption';
import SignOutSvg from '../icons/sign_out.svg'
import QueueSvg from '../icons/queue.svg'
import * as app from '../App';
import curPalette from '../Palette';
import { firebaseApp, Index, mainEvents, setFirebaseUser, userData } from '..';
import { matchPath, useHistory, useLocation, useRouteMatch } from 'react-router';

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
      
      if(match.url !== pages[tab - 1] && (tab != 5 || userData.role == 'admin'))
        history.push(pages[tab - 1])
    } else if(key == 'ArrowUp' || key == 'ArrowDown') {

      const tab = pages.indexOf(match.url)

      if(tab != -1 && key == 'ArrowUp') {
        history.push(pages[tab - 1 >= 0 ? tab - 1 : pages.length - 1])
      } else if(tab != -1 && key == 'ArrowDown') {
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

class Sidebar extends React.Component {
  props: SidebarProps
  state: {[key: string]: any}
  constructor(props: SidebarProps) {
    super(props)
    this.props = props
    this.state = {sidebar: (<div></div>)}
    const { ipcRenderer } = window.require('electron')

    ipcRenderer.on('user-data-changed', () => {
      this.renderSidebar()
    })
  }

  componentDidMount() {
    this.renderSidebar()
  }

  renderSidebar() {
    let sidebar = (
      <SidebarContainer>
          <TabNavigator/>
          <PageBasedSidebarOption page='/app/news/' img={NewsSvg} hint='News' onClick={() => {this.props.onClick('news')}}/>
          <PageBasedSidebarOption page='/app/home/' img={HomeSvg} hint='Home' onClick={() => {this.props.onClick('home')}}/>
          <PageBasedSidebarOption page='/app/browse/' img={BrowseSvg} hint='Browse' onClick={() => {this.props.onClick('browse')}}/>
          <PageBasedSidebarOption page='/app/create/' img={CreateSvg} hint='Create' onClick={() => {this.props.onClick('create')}}/>
          {userData.role === 'admin' && <PageBasedSidebarOption page='/app/queue/' img={QueueSvg} hint='Queue' onClick={() => {this.props.onClick('queue')}}/>}
          <li style={{visibility: 'hidden', flexGrow: 1}}/>
          <SidebarOption img={DiscordSvg} hint='Join the Discord' style={{height:44, width:44, marginLeft:-6, marginTop:-5}} onClick={()=>{
            window.require("electron").shell.openExternal('https://discord.gg/tDxtDHv2fS')
          }}/>
          <PageBasedSidebarOption page='/app/settings/' img={SettingsSvg} hint='Settings' onClick={() => {this.props.onClick('settings')}}/>
          <SidebarOption img={SignOutSvg} hint='Sign Out' onClick={() => {firebaseApp.auth().signOut(); setFirebaseUser(null); Index.changePage(`/`)}}/>
      </SidebarContainer>
    );
    this.setState({sidebar: sidebar})
  }

  render() {
    return this.state.sidebar
  }
}

export default Sidebar;
