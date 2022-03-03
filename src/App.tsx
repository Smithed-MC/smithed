import React from 'react';
import './App.css';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import News from './pages/News';
import Home from './pages/Home';
import palette from './shared/Palette.js'
import Settings from './pages/Settings';
import appSettings from './Settings';
import Browse from './pages/Browse';
import Create from './pages/Create';
import Queue from './pages/Queue';
import { Route, Switch, useHistory, withRouter } from 'react-router'
import { Index } from '.';

const AppContainer = styled.div`
  position: absolute;
  top: 25px;
  bottom: 0;
  width: 100%;
  display: flex;
  overflow: clip;
  background-color: ${palette.lightBackground};
`

interface AppState {
  page: string
}

function App(props: any) {
  const history = useHistory()


  return (
    <AppContainer>
      <Sidebar onClick={(p: string) => { history.push(`/app/${p}`) }} />
      <Switch>
        <Route path='/app/home' component={withRouter(Home)} />
        <Route path='/app/browse' component={Browse} />
        <Route path='/app/create' component={Create} />
        <Route path='/app/settings' component={Settings} />
        <Route path='/app/queue' component={Queue} />
        <Route path='/app/news' component={News} />
        <Route exact path='/app/' component={News} />
      </Switch>
    </AppContainer>
  );

}


export default App;
