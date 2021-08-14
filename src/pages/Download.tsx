import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseUser, Header1, Header2, RowDiv, setFirebaseUser, setIgnoreStateChange, TabButton } from '..';
import curPalette from '../Palette';
import { remote } from '../Settings';

const { ipcRenderer } = window.require('electron');


const DownloadContainer = styled.div`
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    display: flex;
    overflow: clip;
    background-color: ${curPalette.lightBackground};
    align-items: center;
    flex-direction: column;
`

const DownloadButton = styled.button`
    height:32px;
    width:128px;
    color:${curPalette.text};
    background-color:${curPalette.lightAccent};
    font-size:20px;
    border: none;
    font-family: Disket-Bold;

    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`

interface DownloadProps {
    version: string
}

class Download extends React.Component {
    state: {[key:string]: any}
    email: string = ''
    password: string = ''
    password2: string = ''
    displayName: string = ''
    props: DownloadProps
    constructor(props: DownloadProps) {
        super(props)
        this.props = props
        this.state = {tab:0,page:'main',progress:0}

        ipcRenderer.on('download-progress', (e: any, percent: any)=>{
            this.setState({progress: percent})
        })
    }

    renderOptions() {
        return(
            <ColumnDiv>
                <Header1>An update was found!</Header1>
                <Header2 style={{color:curPalette.subText, marginTop:-20}}>Version: {this.props.version}</Header2>
                <RowDiv style={{gap:4}}>
                    <DownloadButton onClick={()=>{
                        remote.getCurrentWindow().quit()
                    }}>Exit</DownloadButton>
                    <DownloadButton onClick={()=>{
                        ipcRenderer.send('download-update')
                        this.setState({tab:1})
                    }}>Update</DownloadButton>
                </RowDiv>
            </ColumnDiv>
        )
    }

    renderProgress() {
        return (
            <ColumnDiv>
                <Header1>Downloading</Header1>
                <Header2 style={{color:curPalette.subText, marginTop:-20}}>Progress: {this.state.progress}/100%</Header2>
                {this.state.progress === 100 && <DownloadButton onClick={()=>{
                    ipcRenderer.send('install-update')
                }}>
                        Install
                    </DownloadButton>}
            </ColumnDiv>
        )
    }

    render() {
        return (
            <DownloadContainer>
                {this.state.tab === 0 && this.renderOptions()}
                {this.state.tab === 1 && this.renderProgress()}
            </DownloadContainer>
        );
    }
}

export default Download;
