import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, StyledInput, firebaseUser, userData, Header2 } from '..';
import ProfileDisplay from '../components/ProfileDisplay';
import palette from '../shared/Palette';
import Dropdown, { Option } from '../components/Dropdown';
import Foldout from '../components/Foldout';
import { pathModule, settingsFolder } from '../Settings';
import { saveProfiles, setupProfile } from '../ProfileHelper';
import RadioButton from '../components/RadioButton';
import { RouteComponentProps, Switch, Route } from 'react-router';
import { StyledButton, StyledLabel } from '../Shared';
import TabButton from '../components/TabButton';
import { setSelectedProfile } from './Browse';
import Popup from 'reactjs-popup';
import Profile, { Dependency } from 'shared/Profile';

const { ipcRenderer } = window.require('electron');


interface HomeState {
    tab: number,
    activeProfile: string,
    profileDisplays?: JSX.Element[],
    mods?: JSX.Element,
    error?: string
}

const CreateButton = styled.button`
    width: 15.9%;
    font-family: Disket-Bold;
    border: none;
    background-color: var(--lightAccent);
    color: var(--text);
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
    padding: 8px;
    font-size: 20px;
`
const ImportText = styled(StyledLabel)`
    color: var(--subText);
    cursor: pointer;
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`

class Home extends React.Component {
    state: HomeState
    profileCreationInfo: Profile = { name: '', version: '', setup: false }
    selectedMods: { [key: string]: any } = {}

    props: RouteComponentProps
    static instance: Home
    constructor(props: RouteComponentProps) {
        super(props)
        this.props = props
        this.state = { tab: 0, activeProfile: '' }

        Home.instance = this

        ipcRenderer.on('update-profile', (event: any, profile: string) => {
            if ((this.state.activeProfile !== profile)) {
                this.setState({ activeProfile: profile })
            }
        })

        ipcRenderer.on('user-data-changed', () => {
            this.buildProfileDisplays()
            this.renderMods()
        })
    }

    async checkForRunningProfile() {
        
        const info = await ipcRenderer.invoke('get-launcher-info')
        console.log(info)
        if(info.running)
            this.setState({activeProfile: info.profile})
    }

    componentDidMount() {
        this.buildProfileDisplays()

        this.checkForRunningProfile()
    }

    getSelectedStyle(tab: number): React.CSSProperties {
        if (this.state.tab === tab) {
            return {
                marginTop: 4,
                borderBottom: `4px solid ${palette.lightAccent}`
            }
        } else {
            return {}
        }
    }

    swapTab(url: string) {
        if (url !== this.props.match.url) {
            this.setState({ emailValid: null, passwordValid: null, password2Valid: null })
            this.profileCreationInfo = { name: '', version: userData.versions[userData.versions.length - 1] }
            this.props.history.push(url)
        }
    }

    renderAddProfile() {
        function setFilter(e: React.MouseEvent, filter: string) {
            let d = e.target as HTMLDivElement
            if (d != null) {
                d.style.filter = filter
            }
        }
        return (
            <ColumnDiv style={{ width: 200, height: 300, justifyContent: 'center' }}>
                <ColumnDiv style={{ width: 150, height: 150, backgroundColor: 'var(--darkBackground)', justifyContent: 'center' }}>
                    <StyledLabel style={{ textAlign: 'center', fontSize: 196, fontFamily: 'Disket', color: 'var(--text)', WebkitUserSelect: 'none' }}
                        onMouseOver={e => setFilter(e, 'brightness(0.8)')}
                        onMouseLeave={e => setFilter(e, 'brightness(1)')}
                        onMouseDown={e => setFilter(e, 'brightness(0.6)')}
                        onMouseUp={e => setFilter(e, 'brightness(1)')}
                        onClick={() => {
                            this.swapTab('/app/home/new_profile')
                        }}
                    >+</StyledLabel>
                </ColumnDiv>
            </ColumnDiv>
        )
    }

    buildProfileDisplays() {
        let profileDisplays: JSX.Element[] = []

        for (let i = 0; i < userData.profiles.length; i++) {
            let p = userData.profiles[i]
            profileDisplays.push(
                <ProfileDisplay key={i} profile={p} active={p.name === this.state.activeProfile} />
            )
        }

        this.setState({ profileDisplays: profileDisplays })
    }

    renderMyProfiles() {
        return (
            <div style={{ flexGrow: 1, width: '99%', display: 'inline-flex', overflowY: 'auto', overflowX: 'clip', flexWrap: 'wrap', gap: 8, padding: 8, alignContent: 'flex-start' }}>
                {this.state.profileDisplays}
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
        return (
            <div style={{ width: '100%', height: '100%' }}>
                {/* <div style={{ backgroundColor: 'var(--darkBackground)', width: '100%', height: '30px', marginTop: 1, display: 'flex', justifyContent: 'space-evenly' }}>
                    <TabButton group="home-tab" name="my-profiles" defaultValue={true}
                    // onChange={(n: string)=>{this.swapTab('/app/home/')}}
                    >My Profiles</TabButton>
                    <TabButton group="home-tab" name="trending"
                    // onChange={(n: string)=>{this.swapTab('/app/home/trending')}}
                    >Trending</TabButton>
                </div> */}
                <Switch>
                    <Route path='/app/home/trending'>{this.renderTrendingProfiles()}</Route>
                    <Route path='/app/home'>{this.renderMyProfiles()}</Route>
                </Switch>
            </div>
        )
    }

    renderVersions(versions: string[]) {
        let options: JSX.Element[] = []
        for (var i = versions.length - 1; i >= 0; i--)
            options.push(<Option value={versions[i]} />)
        return options
    }

    renderMods() {
        const mods = ["carpet", "lithium", "sodium", "starlight"]
        const version = this.profileCreationInfo.version.replaceAll('.', '_')

        if (version === '') return

        let options: JSX.Element[] = []
        if (userData.modsDict !== undefined) {
            this.selectedMods = { fabric_api: userData.modsDict["fabric-api"][version], smithed: userData.modsDict["smithed"][version] }
            mods.map((val, i, arr) => {
                const download = userData.modsDict[val][version]
                if (download != null) {
                    options.push(<RadioButton key={val} text={`Add ${val[0].toUpperCase() + val.substring(1)}`} onChange={(value) => {
                        if (value) {
                            this.selectedMods[val] = download
                        } else {
                            this.selectedMods[val] = null
                        }
                    }} />)
                }
                return val
            })
        }

        this.setState({
            mods: (
                <ColumnDiv style={{ justifyContent: 'left' }}>
                    {options}
                </ColumnDiv>
            )
        })
    }
    renderNewProfile() {
        return (
            <ColumnDiv style={{ width: '100%', height: '100%', gap: 6 }}>
                <Header2>Create new profile</Header2>
                <StyledInput placeholder="Name" style={{ width: '15%' }} onChange={(e) => {
                    let v = (e.target as HTMLInputElement).value
                    this.profileCreationInfo.name = v
                }} />
                <Dropdown reset={false} placeholder="Pick a version" onChange={(v) => { this.profileCreationInfo.version = v; this.renderMods() }} style={{ width: '15.8%' }}>
                    {this.renderVersions(userData.versions)}
                </Dropdown>
                <CreateButton onClick={async (e) => {
                    if (firebaseUser === null) return;
                    if (this.profileCreationInfo.version === '') {
                        this.setState({ error: "No version selected!" })
                        return;
                    }

                    let p = userData.profiles

                    if (p.findIndex(profile => profile.name === this.profileCreationInfo.name) !== -1) {
                        this.setState({ error: "Profile of that name exists!" })
                        return;
                    }

                    let newProfile = {
                        name: this.profileCreationInfo.name,
                        version: this.profileCreationInfo.version,
                        author: userData.displayName,
                        directory: pathModule.join(settingsFolder, `Instances/${this.profileCreationInfo.name}`)
                    }

                    setupProfile(newProfile, this.selectedMods).then(() => {
                        p.push(newProfile)

                        saveProfiles(p)
                        this.buildProfileDisplays()

                        setSelectedProfile(newProfile.name)
                        this.props.history.push(`/app/browse/`)
                    })

                    // Browse.instance.update()
                }}>Create</CreateButton>
                {this.state.error !== '' && <StyledLabel style={{ color: 'red' }}>{this.state.error}</StyledLabel>}
                <Foldout text='Advanced Settings' style={{ width: '15%' }}>
                    {this.state.mods}
                </Foldout>
                <Popup trigger={
                    <ImportText>Import from link</ImportText>
                }>
                    <ColumnDiv style={{backgroundColor: 'var(--lightBackground)', padding:16, border: `4px solid ${palette.darkAccent}`, borderRadius: 8, width:'100%'}}>
                        <StyledInput style={{width:'100%'}} placeholder='Share link...' id='home:import-link'/>
                        <StyledButton onClick={() => {
                            const link = (document.getElementById('home:import-link') as HTMLInputElement).value
                            const getParam = (param: string) => {
                                return decodeURIComponent(link.substring(link.indexOf(param + '=') + param.length + 1, link.indexOf('&', link.indexOf(param + '='))))
                            }

                            if(!link.startsWith('https://smithed.dev/download?')) return
                            let newProfile: Profile = {
                                name: getParam('name'),
                                version: getParam('version'),
                                author: getParam('author'),
                                directory: pathModule.join(settingsFolder, `Instances/${getParam('name')}`),
                                packs: (() => {
                                    let packs: Dependency[] = []
                                    const listOfPacks = link.substring(link.indexOf('&pack=') + 6).split('&pack=')
                                    for(let p of listOfPacks)
                                        packs.push({
                                            id: p.split('@')[0],
                                            version: decodeURIComponent(p.split('@')[1])
                                        })
                                    return packs
                                })()
                            }
                            console.log(newProfile)
                            let p = userData.profiles

                            if (p.findIndex(profile => profile.name === getParam('name')) !== -1) {
                                this.setState({ error: "Profile of that name exists!" })
                                return;
                            }
                            
                            setupProfile(newProfile, {}).then(() => {
                                p.push(newProfile)
        
                                saveProfiles(p)
                                this.buildProfileDisplays()
        
                                setSelectedProfile(newProfile.name)
                                this.props.history.push(`/app/home/`)
                            })
                        }}>
                            Import
                        </StyledButton>
                    </ColumnDiv>
                </Popup>
            </ColumnDiv>
        )
    }

    render() {

        return (
            <ColumnDiv style={{ flexGrow: 1 }}>
                <Switch>
                    <Route path='/app/home/new_profile'>{this.renderNewProfile()}</Route>
                    <Route path='/app/home'>{this.renderMain()}</Route>
                </Switch>
            </ColumnDiv>
        );
    }
}

export default Home;
