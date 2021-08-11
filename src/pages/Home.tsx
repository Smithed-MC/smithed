import React, { version } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseApp, Header1, Header2, Header3, TabButton, StyledInput, firebaseUser, userData } from '..';
import ProfileDisplay from '../components/ProfileDisplay';
import curPalette from '../Palette';
import Dropdown, {Option} from '../components/Dropdown';
import Foldout from '../components/Foldout';
import { fs, pathModule, settingsFolder } from '../Settings';
import { fileExists } from '../FSWrapper';
import { setupProfile } from '../ProfileHelper';
import RadioButton from '../components/RadioButton';
import { Dependency, Pack, packTest } from '../Pack'
const { ipcRenderer } = window.require('electron');


interface HomeState {
    tab: number,
    activeProfile: string,
}

const CreateButton = styled.button`
    width: 15.9%;
    font-family: Disket-Bold;
    border: none;
    background-color: ${curPalette.lightAccent};
    color: ${curPalette.text};
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
    padding: 8px;
    font-size: 20px;
`

export interface Profile {
    name: string,
    version: string,
    img?: string,
    packs?: Dependency[],
    directory?: string,
    author?: string
}

class Home extends React.Component {
    state : HomeState
    profileCreationInfo: Profile = {name: '', version:''}
    selectedMods: {[key:string]: any} = {}

    static instance: Home
    constructor(props: any) {
        super(props)
    
        this.state = {tab: 0, activeProfile:''}
        
        Home.instance = this

        ipcRenderer.on('update-profile', (event: any, profile: string) => {
            if((this.state.activeProfile != profile)) {
                this.setState({activeProfile: profile})
            }
        })
    }

    saveProfiles(profiles: Profile[]) {
        fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), JSON.stringify(profiles, null, 2))
    }

    getSelectedStyle(tab: number) : React.CSSProperties {
        if(this.state.tab == tab) {
            return {
                marginTop: 4,
                borderBottom: `4px solid ${curPalette.lightAccent}`
            }
        } else {
            return {}
        }
    }

    swapTab(tab: number) {
        if(tab != this.state.tab) {
            this.setState({tab: tab, emailValid:null, passwordValid: null, password2Valid: null})
            this.profileCreationInfo = {name: '', version: userData.versions[userData.versions.length - 1]}
        }
    }

    renderAddProfile() {
        function setFilter(e: React.MouseEvent, filter: string) {
            let d = e.target as HTMLDivElement
            if(d != null) {
                d.style.filter = filter
            }
        }
        return (
            <ColumnDiv style={{width:200, height:300, justifyContent:'center'}}>
                <ColumnDiv style={{width:150, height:150, backgroundColor:curPalette.darkBackground, justifyContent:'center'}}>
                    <label style={{textAlign:'center', fontSize:196, fontFamily:'Disket', color:curPalette.text, WebkitUserSelect: 'none'}}
                        onMouseOver={e=>setFilter(e, 'brightness(0.8)')}
                        onMouseLeave={e=>setFilter(e, 'brightness(1)')}
                        onMouseDown={e=>setFilter(e, 'brightness(0.6)')}
                        onMouseUp={e=>setFilter(e, 'brightness(1)')}
                        onClick={()=>{
                            this.swapTab(2)
                        }}
                    >+</label>
                </ColumnDiv>
            </ColumnDiv>
        )
    }

    renderMyProfiles() {
        let profileDisplays: JSX.Element[] = []

        for(let i = 0; i < userData.profiles.length; i++) {
            let p = userData.profiles[i]
            profileDisplays.push(
                <ProfileDisplay key={i} profile={p} active={p.name == this.state.activeProfile}/>
            )
        }

        return (
            <div style={{flexGrow:1, width:'99%',display:'inline-flex', overflowY:'auto', overflowX:'clip', flexWrap:'wrap', gap:8, padding:8, alignContent:'flex-start'}}>
                {profileDisplays}
                {this.renderAddProfile()}
            </div>
        );
    }
    renderTrendingProfiles() {
        return (
            <div></div>
        );
    }

    renderMain() {
        return(
            <div style={{width:'100%', height:'100%'}}>
                <div style={{backgroundColor:curPalette.darkBackground, width:'100%',height:'30px',marginTop:1, display:'flex', justifyContent:'space-evenly'}}>
                    <TabButton style={this.getSelectedStyle(0)} 
                        onClick={()=>{this.swapTab(0)}}
                    >My Profiles</TabButton>
                    <TabButton style={this.getSelectedStyle(1)}
                        onClick={()=>{this.swapTab(1)}}
                    >Trending Profiles</TabButton>
                </div>
                {this.state.tab == 0 && this.renderMyProfiles()}
                {this.state.tab == 1 && this.renderTrendingProfiles()}
            </div>
        )
    }

    renderVersions(versions: string[]) {
        let options: JSX.Element[] = []
        for(var i = versions.length - 1; i >= 0; i--)
            options.push(<Option value={versions[i]}/>)
        return options
    }

    renderMods() {
        const mods = ["carpet", "lithium", "sodium", "starlight"]
        const verison = this.profileCreationInfo.version.replaceAll('.','_')

        let options: JSX.Element[] = []
        if(userData.modsDict != null) {
            this.selectedMods = {fabric_api: userData.modsDict["fabric-api"][verison]}
            mods.map((val) => {
                const download = userData.modsDict[val][verison]
                if(download != null) {
                    options.push(<RadioButton key={val} text={`Add ${val[0].toUpperCase() + val.substring(1)}`} onChange={(value)=>{
                        if(value) {
                            this.selectedMods[val] = download
                        } else {
                            this.selectedMods[val] = null
                        }
                    }}/>)
                }
            })
        }

        return (
            <ColumnDiv style={{justifyContent:'left'}}>
                {options}
            </ColumnDiv>
        )
    }
    renderNewProfile() {
        return(
            <ColumnDiv style={{width:'100%', height:'100%', gap:6}}>
                <Header2>Create new profile</Header2>
                <StyledInput placeholder="Name" style={{width:'15%'}} onChange={(e)=>{
                    let v = (e.target as HTMLInputElement).value
                    this.profileCreationInfo.name = v
                }}/>
                <Dropdown placeholder="Pick a version" onChange={(v)=>{this.profileCreationInfo.version = v}} style={{width:'15.8%'}}>
                    {this.renderVersions(userData.versions)}
                </Dropdown>
                <CreateButton onClick={async () => {
                    if(firebaseUser == null) return;

                    let p = userData.profiles

                    let newProfile = {
                        name: this.profileCreationInfo.name,
                        version: this.profileCreationInfo.version,
                        author: (await (await firebaseApp.database().ref(`users/${firebaseUser.uid}/displayName`).get()).val()),
                        directory: pathModule.join(settingsFolder, `Instances/${this.profileCreationInfo.name}`)
                    }

                    await setupProfile(newProfile, this.selectedMods)
                    p.push(newProfile)
                    
                    this.saveProfiles(p)
                    this.setState({profiles: p})
                    this.swapTab(0)
                }}>Create</CreateButton>
                <Foldout text='Advanced Settings' style={{width:'15%'}}>
                    {this.renderMods()}
                </Foldout>
            </ColumnDiv>
        )
    }

    render() {

        return (
            <ColumnDiv style={{flexGrow:1}}>
                {this.state.tab != 2 && this.renderMain()}
                {this.state.tab == 2 && this.renderNewProfile()}
            </ColumnDiv>
        );
    }
}

export default Home;
