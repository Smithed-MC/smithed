import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import News from './pages/News';
import Home from './pages/Home';
import curPalette from './Palette';
import Settings from './pages/Settings';
import appSettings, { saveSettings } from './Settings';

const AppContainer = styled.div`
  position: absolute;
  top: 25px;
  bottom: 0;
  width: 100%;
  display: flex;
  overflow: clip;
  background-color: ${curPalette.lightBackground};
`

interface AppState {
  page: string
}

class App extends React.Component {
  state : AppState
  constructor(props: any) {
    super(props)
    this.state = {page:appSettings.leftOffPage}

  }

  changePage(p: string) {
    this.setState({page: p})
    appSettings.leftOffPage = p
    console.log(appSettings)
  } 

  render() {
    return (
      <AppContainer>
        <Sidebar onClick={(p: string) => {this.changePage(p)}}/>
        { this.state.page == 'news' ? <News/> : null}
        { this.state.page == 'home' ? <Home/> : null}
        { this.state.page == 'settings' ? <Settings/> : null}

      </AppContainer>
    );
  }
}


export default App;
