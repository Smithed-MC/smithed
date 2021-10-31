import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseApp, TabButton, StyledInput, firebaseUser, RowDiv, userData } from '..';
import curPalette from '../Palette';
import * as linq from 'linq-es5'
import { Enumerable } from 'linq-es5/lib/enumerable';
import PackDisplay from '../components/PackDisplay';
import { Dependency, Pack, PackHelper } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import Home, { Profile } from './Home';
import { Route, RouteComponentProps, Switch, useLocation, withRouter } from 'react-router';
import PackView from './Browse/PackView';
import { fs, pathModule, settingsFolder } from '../Settings';
import { URLSearchParams } from 'url';

export interface PackDict {
    [key: string]: {
        added: number,
        owner: string
    }
}

export interface PackEntry {
    added: number,
    owner: string,
    id: string,
    data: Pack
}

interface BrowseState {
    tab: number,

    search: string,
    profile: Profile
}

interface BrowseProps extends RouteComponentProps {
    query: {[key: string]: any}
}

class Browse extends React.Component {
    state: BrowseState
    props: BrowseProps
    static instance: Browse
    constructor(props: BrowseProps) {
        super(props)
        this.props = props
        this.state = { tab: 0, search: '', profile: { name: '', version: '' } }
        Browse.instance = this        

        const { ipcRenderer } = window.require('electron')
        ipcRenderer.on('update-displayed-packs', (e: any) => {
            this.renderPacks()
        })
    }

    getSelectedStyle(tab: number): React.CSSProperties {
        if (this.state.tab === tab) {
            return {
                marginTop: 4,
                borderBottom: `4px solid ${curPalette.lightAccent}`
            }
        } else {
            return {}
        }
    }

    swapTab(tab: number) {
        if (tab !== this.state.tab) {
            this.setState({ tab: tab, emailValid: null, passwordValid: null, password2Valid: null })
        }
    }

    renderTabs() {
        return (
            <div style={{ backgroundColor: curPalette.darkBackground, width: '100%', height: '30px', marginTop: 1, display: 'flex', justifyContent: 'space-evenly' }}>
                <TabButton style={this.getSelectedStyle(0)}
                    onClick={() => { this.swapTab(0) }}
                >New</TabButton>
                <TabButton style={this.getSelectedStyle(1)}
                    onClick={() => { this.swapTab(1) }}
                >Trending</TabButton>
                <TabButton style={this.getSelectedStyle(2)}
                    onClick={() => { this.swapTab(2) }}
                >Featured</TabButton>
            </div>
        )
    }

    renderPacks() {
        let packDisplays: JSX.Element[] = []

        let packs = userData.packs.Where(p => p.data.display !== 'hidden' ? this.state.search !== '' ? p.data.display.name.toLowerCase().includes(this.state.search) : true : true)

        if (this.state.profile.version !== '') {
            packs = packs.Where(p => {
                if (p.data === null) return false
                return PackHelper.hasVersion(p.data, this.state.profile.version)
            })
        }

        const length = packs.Count()

        for (let i = 0; i < length && i < 20; i++) {
            let pack = packs.ElementAt(i)
            if (pack.data.display != 'hidden')
                packDisplays.push(<PackDisplay key={i} packEntry={pack} />)
        }

        return packDisplays
    }

    getProfiles() {
        const profiles = userData.profiles

        let profileOptions: JSX.Element[] = []

        profiles.forEach(p => {
            profileOptions.push(<Option key={p.name} value={p.name} />)
        })

        return profileOptions
    }



    static saveProfiles(profiles: Profile[]) {
        fs.writeFileSync(pathModule.join(settingsFolder, 'profiles.json'), JSON.stringify(profiles, null, 2))
    }

    static addPackToProfile(packEntry: PackEntry) {
        const packVersion = PackHelper.getLatestVersionForVersion(packEntry.data, Browse.instance.state.profile.version)
        console.log(packVersion)

        let temp: Dependency[] = []
        let packs = Browse.instance.state.profile.packs != null ? Browse.instance.state.profile.packs : []

        temp.push({ id: packEntry.id, version: packVersion })
        temp.concat(PackHelper.resolveDependencies(packEntry.data, packVersion))

        temp.forEach(d => {
            if (!packs.includes(d)) {
                packs.push(d)
            }
        })

        Browse.instance.state.profile.packs = packs

        Browse.saveProfiles(userData.profiles)
    }

    update() {
        if(this.props.query["selected"] != undefined) {
            this.setState({profile: userData.profiles.find(p => p.name === this.props.query["selected"])})
        }
    }

    renderMain() {
        return (
            <ColumnDiv style={{ flexGrow: 1, width: '100%' }}>
                {this.renderTabs()}
                <RowDiv style={{ width: '100%', height: '100%', marginTop: 16 }}>
                    <ColumnDiv style={{ flex: '25%' }}>
                        <Dropdown style={{ width: '78.5%' }} defaultValue={this.props.query["selected"]} onChange={(v) => {
                            userData.profiles.forEach(p => {
                                if (p.name === v) {
                                    this.setState({ profile: p })
                                    return
                                }
                            })
                        }} placeholder='Select a profile'>
                            {this.getProfiles()}
                        </Dropdown>
                        <StyledInput style={{ width: '75%' }} placeholder="Search..." onChange={(e) => {
                            let v = e.target.value
                            this.setState({ search: v.toLowerCase() })
                        }} />
                    </ColumnDiv>
                    <div style={{ flex: '50%' }}>
                        <ColumnDiv style={{ display: 'inline-flex', gap: 8, overflowY: 'auto', overflowX: 'visible', width: '100%', height: '100%', }}>
                            {this.renderPacks()}
                        </ColumnDiv>
                    </div>
                    <div style={{ flex: '25%' }}></div>
                </RowDiv>

            </ColumnDiv>
        );
    }

    render() {
        return (
            <Switch>
                <Route path="/app/browse/view/*">
                    {withRouter(PackView)}
                </Route>
                <Route path="/app/browse">
                    {this.renderMain()}
                </Route>
            </Switch>
        )
    }
}

const useQuery = () => {
    const search = useLocation().search
    
    let query: {[key: string]: any} = {}
    search.split('?').forEach(v => {
        const data = v.split('=')
        query[data[0]] = data[1]
    })

    return query
}

const BrowseRouter = withRouter(Browse)

export function BrowseWithQuery() {
    let query = useQuery();
    return (
        <BrowseRouter query={query}/>
    );
}


export default Browse;
