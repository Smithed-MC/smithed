import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, Header1, Header2, RowDiv } from '..';
import palette from '../shared/Palette.js';
import { remote } from '../Settings';

const { ipcRenderer } = window.require('electron');


const DownloadContainer = styled.div`
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    display: flex;
    overflow: clip;
    background-color: ${palette.lightBackground};
    align-items: center;
    flex-direction: column;
`

const DownloadButton = styled.button`
    height:32px;
    width:128px;
    color:${palette.text};
    background-color:${palette.lightAccent};
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
                <Header2 style={{color:palette.subText, marginTop:-20}}>Version: {this.props.version}</Header2>
                <RowDiv style={{gap:4}}>
                    <DownloadButton onClick={()=>{
                        remote.app.quit()
                    }}>Exit</DownloadButton>
                    <DownloadButton onClick={()=>{
                        ipcRenderer.send('download-update')
                        if(window.process.platform !== 'darwin')
                            this.setState({tab:1})
                    }}>Update</DownloadButton>
                </RowDiv>
            </ColumnDiv>
        )
    }

    renderProgress() {
        return (
            <ColumnDiv>
                {this.state.progress !== 100 && <Header1>Downloading Update...</Header1>}
                {this.state.progress === 100 && 
                    <ColumnDiv>
                        <Header1>Download Complete!</Header1>
                        <DownloadButton onClick={()=>{
                            ipcRenderer.send('install-update')
                        }}>
                            Install
                        </DownloadButton>
                    </ColumnDiv>}
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
