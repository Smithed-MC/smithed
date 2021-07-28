import React from 'react';
import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';

const AppContainer = styled.div`
  position: absolute;
  top: 25px;
  bottom: 0;
  width: 100%;
  display: flex;
`

function App() {
  return (
    <AppContainer>
      <Sidebar/>
    </AppContainer>
  );
}

export default App;
