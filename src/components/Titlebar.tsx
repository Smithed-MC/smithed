import React from 'react';
import ReactDOM from 'react-dom';
import '../font.css';
import styled, {css} from 'styled-components';

const fs = window.require('fs')
const pathModule = window.require('path')
const remoteModule = window.require('@electron/remote')
const TopbarContainer = styled.div`
  -webkit-app-region: drag;
  height:25;
  width:'100wh';
  background-color: #1B48C4;
` 
const ActionButtonSpan = styled.span`
  -webkit-app-region: no-drag;
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: center;
` 
const ActionButton = styled.button`
  border: none;
  background: none;
  font-family: Disket-Bold;
  color: #FFFFFF;
  font-size: 14px;
  text-align: left;
  vertical-align: center;
`


function closeWindow() {
    remoteModule.app.exit()
    console.log('ran')
  }
  
  function minimizeWindow() {
    remoteModule.getCurrentWindow().minimize()
  }
  function maximizeWindow() {
    const win = remoteModule.getCurrentWindow()
    if(win.isMaximized())
      win.unmaximize()
    else
      win.maximize()
  }
  

function Titlebar() {
    return (
        <TopbarContainer>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around'}}>
                <text style={{padding:'3px', fontSize:'12px', fontFamily:'Disket-Bold', color:'#FFFFFF', textAlign:'left', verticalAlign:'center'}}>
                    Smithed
                </text>
                <li style={{visibility: 'hidden', flexGrow: 1}}></li>
                <ActionButtonSpan>
                    <ActionButton 
                        onClick={e=>minimizeWindow()}
                    >-</ActionButton>
                    <ActionButton 
                        onClick={maximizeWindow}
                    >⯀</ActionButton>
                    <ActionButton 
                        onClick={closeWindow}
                    >X</ActionButton>
                </ActionButtonSpan>
            </div>
            <div style={{height:5, backgroundColor:'#206AEA'}}></div>
        </TopbarContainer>
    )
}

export default Titlebar