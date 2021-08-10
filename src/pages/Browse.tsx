import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseApp, Header1, Header2, Header3, TabButton, StyledInput, firebaseUser, RowDiv, userData } from '..';
import curPalette from '../Palette';
import * as linq from 'linq-es5'
import { Enumerable } from 'linq-es5/lib/enumerable';
import PackDisplay from '../components/PackDisplay';
import { Pack, PackHelper } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import Home, { Profile } from './Home';

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

class Browse extends React.Component {
    state: BrowseState
    static instance: Browse
    constructor(props: any) {
        super(props)
        this.state = {tab: 0, search: '', profile: {name:'',version:''}}
        Browse.instance = this

        const { ipcRenderer } = window.require('electron')
        ipcRenderer.on('update-displayed-packs', (e: any)=>{
            this.renderPacks()
        })
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
        }
    }

    renderTabs() {
        return (
            <div style={{backgroundColor:curPalette.darkBackground, width:'100%',height:'30px',marginTop:1, display:'flex', justifyContent:'space-evenly'}}>
                <TabButton style={this.getSelectedStyle(0)} 
                    onClick={()=>{this.swapTab(0)}}
                >New</TabButton>
                <TabButton style={this.getSelectedStyle(1)}
                    onClick={()=>{this.swapTab(1)}}
                >Trending</TabButton>
                <TabButton style={this.getSelectedStyle(2)}
                    onClick={()=>{this.swapTab(2)}}
                >Featured</TabButton>
            </div>
        )
    }

    renderPacks() {
        let packDisplays: JSX.Element[] = []
        
        let packs = userData.packs.Where(p => p.data.display != 'hidden' ? this.state.search != '' ? p.data.display.name.toLowerCase().includes(this.state.search) : true : true)

        if(this.state.profile.version != '') {
            packs = packs.Where(p => {
                if(p.data == null) return false
                return PackHelper.hasVersion(p.data, this.state.profile.version)
            })
        }

        const length = packs.Count()

        for(let i = 0; i < length && i < 20; i++) {
            let pack = packs.ElementAt(i)
            
            packDisplays.push(<PackDisplay key={i} packEntry={pack}/>)
        }

        return packDisplays
    }

    getProfiles() {
        const profiles = userData.profiles

        let profileOptions: JSX.Element[] = []

        profiles.forEach(p => {
            profileOptions.push(<Option key={p.name} value={p.name}/>)
        })

        return profileOptions
    }

    render() {
        return (
            <ColumnDiv style={{flexGrow:1, width:'100%'}}>
                {this.renderTabs()}
                <RowDiv style={{width:'100%', height:'100%', marginTop:16}}>
                    <ColumnDiv style={{flex:'25%'}}>
                        <Dropdown style={{width:'78.5%'}} onChange={(v)=>{
                            userData.profiles.forEach(p => {
                                if(p.name == v) {
                                    this.setState({profile: p})
                                    return
                                }
                            })
                        }} placeholder='Select a profile'>
                            {this.getProfiles()}
                        </Dropdown>
                        <StyledInput style={{width:'75%'}} placeholder="Search..." onChange={(e)=>{
                            let v = e.target.value
                            this.setState({search:v.toLowerCase()})
                        }}/>
                    </ColumnDiv>
                    <div style={{flex:'50%'}}>
                        <ColumnDiv style={{display:'inline-flex',gap:8, overflowY:'auto', overflowX:'visible', width:'100%', height:'100%',}}>
                            {this.renderPacks()}
                        </ColumnDiv>
                    </div>
                    <div style={{flex:'25%'}}></div>
                </RowDiv>
                
            </ColumnDiv>
        );
    }
}

export default Browse;
