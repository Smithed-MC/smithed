import React, { version } from 'react';
import styled from 'styled-components';
import { RowDiv } from '..';
import Home, {Profile} from '../pages/Home';
import curPalette from '../Palette'
import appSettings from '../Settings';
import Dropdown, { Option } from './Dropdown';

const { ipcRenderer } = window.require('electron');
const execa = window.require('execa')
interface ProfileDisplayProps {
    profile: Profile,
    active: boolean
}

interface ProfileDisplayState {
    mouseOver:boolean
}

const ProfileDisplayDiv = styled.div`
    height:300px;
    width:200px;
    background-color: ${curPalette.darkBackground};
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ProfilePlayButton = styled.button`
    width: 90%;
    height: 60%;
    font-family: Disket-Bold;
    font-size: 24px;
    color: ${curPalette.text};
    border: none;
    background-color: ${curPalette.lightAccent};
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
    :disabled {
        filter: brightness(50%);
    }
`

const ProfileNameLabel = styled.label`
    width: 100%;
    text-align: 'left';
    color: ${curPalette.text};
    font-family: Inconsolata;
    font-size: 20px;
    -webkit-user-select: none;
`

class ProfileDisplay extends React.Component {
    props: ProfileDisplayProps
    state: ProfileDisplayState
    constructor(props: ProfileDisplayProps) {
        super(props)
        this.props = props
        this.state = {mouseOver: false}

        ipcRenderer.on('invalid-launcher', ()=> {
            alert('Unable to find your Minecraft Launcher, please fix it in \'Settings\'')
        })
    }
    setMouseOver(value: boolean) {
        this.setState({mouseOver: value})
    }

    render() {
        return (
            <ProfileDisplayDiv onMouseEnter={() => this.setMouseOver(true)} onMouseLeave={() => this.setMouseOver(false)}>
                <div style={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
                    <img style={{width:192,height:192,backgroundColor:curPalette.darkAccent}} src={this.props.profile.img}/>
                    <label style={{width:'40%',position:'relative',textAlign:'center', top:-180, left:45, backgroundColor:'rgba(0.140625,0.13671875,0.16796875,0.25)', color:curPalette.text, fontFamily:'Inconsolata', WebkitUserSelect: 'none'}}>{this.props.profile.version}</label>
                </div>
                <div style={{width:'90%', flexGrow:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {!this.state.mouseOver && 
                        <ProfileNameLabel>
                            <b>{this.props.profile.name}</b>
                        </ProfileNameLabel>}
                    {!this.state.mouseOver &&
                        <ProfileNameLabel style={{color:curPalette.subText, fontSize:18}}>
                            {`by ${this.props.profile.author}`}
                        </ProfileNameLabel>}

                    <Dropdown style={{display:'none'}} id="context-menu">
                        <Option value="Edit"/>
                    </Dropdown>
                    {this.state.mouseOver && 
                        <RowDiv style={{width:'100%', height:'100%', gap:4, alignItems:'center',marginTop:-4}}>
                            <ProfilePlayButton onClick={async (e)=>{
                                console.log(e)
                                if(Home.instance.state.activeProfile === '')
                                    ipcRenderer.send('start-launcher', this.props.profile, appSettings.launcher)

                                Home.instance.renderMyProfiles()
                            }} disabled={Home.instance.state.activeProfile !== ''}>
                                {this.props.active ? 'RUNNING' : 'PLAY'}
                            </ProfilePlayButton>
                        </RowDiv>}
                </div>
            </ProfileDisplayDiv>  
        );
    }
}

export default ProfileDisplay;
