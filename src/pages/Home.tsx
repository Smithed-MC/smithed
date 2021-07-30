import React from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import '../font.css'
import { Header1, Header2, Header3, MarkdownOptions } from '..';
import PackDisplay from '../components/PackDisplay';
import curPalette from '../Palette';
const TabButton = styled.button`
    font-family: Disket-Bold;
    color: ${curPalette.text};
    background: none;
    border: none;
    font-size: 16px;
`

interface HomeState {
    tab: number
}



class Home extends React.Component {
    state : HomeState
    constructor(props: any) {
        super(props)
        this.state = {tab: 0} 
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

    renderMyPacks() {
        return (
            <div style={{flexGrow:1, width:'99%',display:'inline-flex', overflowY:'auto', overflowX:'clip', flexWrap:'wrap', gap:8, padding:8}}>
                <PackDisplay name='TCC + Worldgen' version='1.17.1' author='Anon'></PackDisplay>
                <PackDisplay name='Literally just TCC' version='1.17.1' author='Anon'></PackDisplay>
            </div>
        );
    }
    renderTrendingPacks() {
        return (
            <div></div>
        );
    }

    render() {

        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{backgroundColor:curPalette.darkBackground, width:'100%',height:'30px',marginTop:1, display:'flex', justifyContent:'space-evenly'}}>
                    <TabButton style={this.getSelectedStyle(0)} 
                        onClick={()=>{this.setState({tab:0})}}
                    >My Packs</TabButton>
                    <TabButton style={this.getSelectedStyle(1)}
                        onClick={()=>{this.setState({tab:1})}}
                    >Trending Packs</TabButton>
                </div>
                {this.state.tab == 0 && this.renderMyPacks()}
                {this.state.tab == 1 && this.renderTrendingPacks()}
            </div>
        );
    }
}

export default Home;
