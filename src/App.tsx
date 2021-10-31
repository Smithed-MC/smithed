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
import Browse, { BrowseWithQuery } from './pages/Browse';
import Create from './pages/Create';
import Queue from './pages/Queue';
import {Route, Switch, withRouter} from 'react-router'
import { HashRouter } from 'react-router-dom';
import { Index } from '.';

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
  props: any
  constructor(props: any) {
    super(props)
    this.state = {page:appSettings.leftOffPage}
  }

  changePage(p: string) {
    Index.changePage(`/app/${p}`)
    // this.setState({page: p})
    // appSettings.leftOffPage = p
  } 

  render() {
    return (
      <AppContainer>
        <Sidebar onClick={(p: string) => {this.changePage(p)}}/>
        <Switch>
          <Route path='/app/home' component={withRouter(Home)}/>
          <Route path='/app/browse' component={BrowseWithQuery}/>
          <Route path='/app/create' component={Create}/>
          <Route path='/app/settings' component={Settings}/>
          <Route path='/app/queue' component={Queue}/>
          <Route path='/app/news' component={News}/>
          <Route exact path='/app/' component={News}/>
        </Switch>
      </AppContainer>
    );
  }
}


export default App;
