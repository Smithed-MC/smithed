import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseApp, Header1, Header2, Header3, TabButton, StyledInput, firebaseUser, RowDiv, userData } from '..';
import curPalette from '../Palette';
import * as linq from 'linq-es5'
import { Enumerable } from 'linq-es5/lib/enumerable';
import PackDisplay from '../components/PackDisplay';
import { Display, Pack, PackHelper, Version } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import Home, { Profile } from './Home';
import CreatePackDisplay from '../components/CreatePackDisplay';
import Foldout from '../components/Foldout';
import RadioButton from '../components/RadioButton';


interface CreateState {
    page: number,
    packs: Pack[],
    pack: Pack,
    [key: string]: any
}

const AddDiv = styled.div`
    width: 64px;
    height: 64px;
    padding: 8px;
    -webkit-user-select: none;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background-color: ${curPalette.darkBackground};

    :hover {
        filter: brightness(90%);
    }
    :active {
        filter: brightness(80%);
    }
`
const AddButton = styled.button`
    border: none;
    color: ${curPalette.text};
    background-color: ${curPalette.lightAccent};
    font-family: Disket-Bold;
    font-size: 18px;
    height: 28px;
    -webkit-user-select: none;
    -webkit-user-drag: none;
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


function InputField(props: any) {
    return (                    
        <StyledInput placeholder={props.text} style={{width:'75%'}} title={props.text} defaultValue={props.defaultValue} onChange={(e)=>{
            props.onChange(e.target.value)
        }}/>
    )
}


class Create extends React.Component {
    state: CreateState
    static instance: Create
    selectedPack: number = -1
    newVersionNumber: string = ''
    constructor(props: any) {
        super(props)
        this.state = {page: 1, packs:[], pack: new Pack()}

        firebaseApp.database().ref(`users/${userData.uid}/packs`).get().then(snapshot=>{
            this.setState({packs: snapshot.val()})
        })

        Create.instance = this
    }


    renderUsersPacks() {
        let elements: JSX.Element[] = []

        for(let p of this.state.packs) {
            elements.push(<CreatePackDisplay pack={p}/>)
        }

        elements.push(<AddDiv onClick={()=>{
            this.selectedPack = -1
            this.state.pack = new Pack()
            this.setState({page:1})
        }}>
            <label style={{color:curPalette.text,fontSize:96,textAlign:'center',fontFamily:'Disket-Bold'}}>+</label>
        </AddDiv>)
        return elements
    }

    renderDownloads(version: Version) {
        let elements: JSX.Element[] = []
        for(let d in version.downloads) {
            elements.push(
                <ColumnDiv style={{width:'100%'}}>
                    <label style={{fontFamily:'Inconsolata', color:curPalette.text}}>{d}</label>
                    <InputField key={d} defaultValue={version.downloads[d] != '' ? version.downloads[d] : null} placeholder={d} onChange={(v: string) => {version.downloads[d] = v}}/>
                </ColumnDiv>
            )
        }
        return elements
    }

    renderVersions() {
        let elements: JSX.Element[] = []
        for(let v in this.state.pack.versions) {
            let version = this.state.pack.versions[v]
            elements.push(<Foldout text={v.replaceAll('_','.')} key={v} style={{width:'98%', backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={true}>
                <RadioButton defaultValue={version.breaking} text="Breaking?" onChange={(v)=>{
                    version.breaking = v
                    this.renderVersions()
                }}/>
                <Foldout text="Downloads" defaultValue={true} style={{width:'95%', backgroundColor:'transparent'}}>         
                    <Dropdown placeholder="Add a download" onChange={(e)=> {
                        if(version.downloads[e.toLowerCase()] == null) {
                            version.downloads[e.toLowerCase()] = ""
                            this.renderVersions()
                        }
                        console.log(version)
                    }}>
                        <Option value="Datapack"/>
                        <Option value="Resourcepack"/>
                    </Dropdown>
                    {this.renderDownloads(version)}
                </Foldout>
            </Foldout>)
        }
        this.setState({versions: elements})
    }

    renderNewPack() {
        if(this.state.pack.display == 'hidden') this.state.displayHidden = true

        return (
            <ColumnDiv style={{width:'100%', alignItems:'left', gap: 8}}>
                <Foldout text="Display" style={{width:'40%',backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={true}>
                    <ColumnDiv style={{width:'100%', alignItems:'', gap: 8}}>                    
                        <RadioButton text="Hidden?" defaultValue={this.state.displayHidden} onChange={(value)=>{
                            if(value) this.state.pack.display = 'hidden'
                            else this.state.pack.display = new Display()

                            this.setState({displayHidden: value})
                        }}/>
                        {!this.state.displayHidden && this.state.pack.display != 'hidden' && <ColumnDiv style={{width:'100%', gap:8}}>
                                <InputField text='Name' defaultValue={this.state.pack.display.name} onChange={(v: string)=>{
                                    if(this.state.pack.display != 'hidden') 
                                        this.state.pack.display.name = v
                                }}/>
                                <InputField text='Icon' defaultValue={this.state.pack.display.name} onChange={(v: string)=>{
                                    if(this.state.pack.display != 'hidden') 
                                        this.state.pack.display.name = v
                                }}/>
                                <InputField text='Description' defaultValue={this.state.pack.display.name} onChange={(v: string)=>{
                                    if(this.state.pack.display != 'hidden') 
                                        this.state.pack.display.name = v
                                }}/>
                            </ColumnDiv>
                        }
                    </ColumnDiv>
                </Foldout>
                <Foldout text="Versions" style={{width:'40%',backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={true}>
                    <ColumnDiv style={{width:'100%', alignItems:'', gap: 8}}>                    
                        <RowDiv style={{gap: 8}}>
                            <InputField text="Version Number" onChange={(v: string)=>{this.newVersionNumber = v.replaceAll('.','_')}}/>
                            <AddButton style={{fontFamily:'Disket-Bold',}} onClick={()=>{
                                if(this.state.pack.versions[this.newVersionNumber] == null) {
                                    this.state.pack.versions[this.newVersionNumber] = new Version()
                                    this.renderVersions()
                                }
                            }}>Add</AddButton>
                        </RowDiv>
                        {this.state.versions}
                    </ColumnDiv>
                </Foldout>

            </ColumnDiv>
        )
    }


    render() {
        return (
            <ColumnDiv style={{width:'100%', height:'100%', padding: 16}}>
                <RowDiv style={{display:'inline-flex', height: '100%', width:'100%', flexWrap:'wrap', justifyContent:'left', gap:12, alignContent:'flex-start'}}>
                    {this.state.page == 0 && this.renderUsersPacks()}
                    {this.state.page == 1 && this.renderNewPack()}
                </RowDiv>
            </ColumnDiv>
        );
    }
}

export default Create;
