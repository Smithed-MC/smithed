import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseApp, StyledInput, RowDiv, userData } from '..';
import curPalette from '../Palette';
import * as linq from 'linq-es5'
import { DataVersion, Dependency, Display, Pack, PackHelper, Version } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import CreatePackDisplay from '../components/CreatePackDisplay';
import RadioButton from '../components/RadioButton';
import GroupedFoldout from '../components/GroupedFoldout';


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
        <StyledInput placeholder={props.text} style={props.style ? props.style : {width:'75%'}} title={props.text} defaultValue={props.defaultValue !== '' ? props.defaultValue : null} disabled={props.disabled} onChange={(e)=>{
            props.onChange(e.target.value)
        }}/>
    )
}


class Create extends React.Component {
    state: CreateState
    static instance: Create
    selectedPack: number = -1
    newVersionNumber: string = ''
    
    newDependency: Dependency = {id:'', version:''}

    constructor(props: any) {
        super(props)
        this.state = {page: 0, packs:[], pack: new Pack(), new: true}
        Create.instance = this
    }

    componentDidMount() {
        this.renderVersions()
        this.updatePacks()
    }
    updatePacks() {
        firebaseApp.database().ref(`users/${userData.uid}/packs`).get().then(snapshot=>{
            let packs: Pack[] = snapshot.val()
            console.log(packs)
            this.setState({packs: packs})
        })
    }

    swapToAddPage(pack?: Pack) {
        this.setState({page:1, new: pack ? false : true, pack: pack ? pack : new Pack(), displayHidden: this.state.pack.display === 'hidden'}, () => {
            this.renderVersions()
        })
    }

    renderUsersPacks() {
        let elements: JSX.Element[] = []

        if(this.state.packs != null && this.state.packs.length > 0) {
            for(let p of this.state.packs) {
                if(p === null) continue;

                elements.push(<CreatePackDisplay pack={p} onClick={()=>{
                    this.swapToAddPage(p)
                }}/>)
            }
        }

        elements.push(<AddDiv onClick={()=>{
            this.swapToAddPage()
        }}>
            <label style={{color:curPalette.text,fontSize:96,textAlign:'center',fontFamily:'Disket-Bold'}}>+</label>
        </AddDiv>)
        return elements
    }

    renderDownloads(version: Version) {
        let elements: JSX.Element[] = []
        for(let d in version.downloads) {
            elements.push(
                <InputField key={d} defaultValue={version.downloads[d] !== '' ? version.downloads[d] : null} text={d[0].toUpperCase() + d.substring(1) + ' URL...'} onChange={(v: string) => {version.downloads[d] = v}}/>
            )
        }
        return elements
    }

    renderSupportsOptions() {
        let elements: JSX.Element[] = []

        for(let v of userData.versions) {
            elements.push(<Option value={v}/>)
        }

        return elements
    }
    renderSupports(version: Version) {
        let elements: JSX.Element[] = []

        for(let s of version.supports) {
            elements.push(<RowDiv style={{justifyContent:'left', width:'100%'}}>
                <li style={{color:curPalette.text}}/>
                <label style={{color:curPalette.text, fontFamily:'Inconsolata'}}>{s}</label>
            </RowDiv>)
        }

        return elements
    }
    renderDependencies(version: Version) {
        let elements: JSX.Element[] = []

        if(version.dependencies != null) {
            for(let d = 0; d < version.dependencies.length; d++) {
                elements.push(
                <RowDiv style={{justifyContent:'center', width:'100%', gap:8}}>
                    <RowDiv style={{width:'40%', height:28,alignItems:'center', overflowX:'hidden'}}>
                        <label style={{width:'100%', color:curPalette.text, fontFamily:'Inconsolata', textAlign:'right'}}>{version.dependencies[d].id}</label>
                    </RowDiv>
                    <InputField style={{width:'20%'}} text="Version Number" defaultValue={version.dependencies[d].version} onChange={(v: string) => {version.dependencies[d].version = v}}/>
                    <div style={{width:'40%'}}>
                        <AddButton style={{width:28}} onClick={()=>{
                            version.dependencies.splice(d, 1)
                            this.renderVersions()
                        }}>-</AddButton>
                    </div>
                </RowDiv>)
            }
        }

        return elements
    }

    hasDependency(version: Version) {
        for(let d of version.dependencies) {
            if(d.id === this.newDependency.id)
                return true
        }
        return false
    }

    renderVersions() {
        let elements: JSX.Element[] = []
        for(let v in this.state.pack.versions) {
            let version = this.state.pack.versions[v]
            elements.push(<GroupedFoldout group="version" text={v.replaceAll('_','.')} key={v} style={{width:'98%', backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={false}>
                <RadioButton defaultValue={version.breaking} text="Breaking?" onChange={(v)=>{
                    version.breaking = v
                    this.renderVersions()
                }}/>
                <GroupedFoldout group={v} text="Downloads" defaultValue={false} style={{width:'95%', backgroundColor:'transparent'}}>         
                    <Dropdown placeholder="Add a download" onChange={(e)=> {
                        if(version.downloads == null)
                            version.downloads = {}
                        if(version.downloads[e.toLowerCase()] == null) {
                            version.downloads[e.toLowerCase()] = ""
                            this.renderVersions()
                        }
                    }}>
                        <Option value="Datapack"/>
                        <Option value="Resourcepack"/>
                    </Dropdown>
                    {this.renderDownloads(version)}
                </GroupedFoldout>
                <GroupedFoldout group={v} text="Supports" defaultValue={false} style={{width:'95%', backgroundColor:'transparent'}}>         
                    <ColumnDiv style={{alignItems:'left', width:'10%'}}>
                        {this.renderSupports(version)}
                    </ColumnDiv>
                    <Dropdown placeholder="Add/remove a version" onChange={(e)=> {
                        if(!version.supports.includes(e)) {
                            version.supports.push(e)
                        } else {
                            version.supports.splice(version.supports.indexOf(e), 1)
                        }

                        version.supports = linq.asEnumerable(version.supports)
                            .OrderBy(s => new DataVersion(s).major)
                             .ThenBy(s => new DataVersion(s).minor)
                             .ThenBy(s => new DataVersion(s).patch)
                             .ToArray()

                        this.renderVersions()
                    }}>
                        {this.renderSupportsOptions()}
                    </Dropdown>
                </GroupedFoldout>
                <GroupedFoldout group={v} text="Dependencies" defaultValue={false} style={{width:'95%', backgroundColor:'transparent'}}>         
                    <ColumnDiv style={{alignItems:'left', width:'100%'}}>
                        {this.renderDependencies(version)}
                    </ColumnDiv>
                    <RowDiv style={{width:'75%', gap: 8}}>
                        <InputField text="Id..." style={{width:'25%'}} onChange={(v:string)=>{this.newDependency.id = v}}/>
                        <InputField text="Version..." style={{width:'15%'}} onChange={(v:string)=>{this.newDependency.version = v}}/>
                        <AddButton onClick={()=>{
                            if(this.newDependency.id.length < 3) return;
                            if(this.newDependency.version === '') return;
                            if(!this.hasDependency(version)) {
                                version.dependencies.push({id: this.newDependency.id, version: this.newDependency.version})
                                
                                this.renderVersions()
                            }
                        }}>Add</AddButton>
                    </RowDiv>
                </GroupedFoldout>
            </GroupedFoldout>)
        }
        this.setState({versions: elements})
    }

    validatePack(): string {
        const pack = this.state.pack
        if(pack.display !== 'hidden') {
            if(pack.display.name === '')
                return 'Pack is not hidden, you must specify a name'
            if(pack.display.icon === '')
                return 'Pack is not hidden, you must specify an icon'
            if(pack.display.description === '')
                return 'Pack is not hidden, you must specify a description'
        }
        if(pack.id.length < 3)
            return 'Pack Id must be atleast 3 characters'
        if(pack.versions == null || pack.versions === {})
            return 'No versions have been specified'
        else {
            for(let v in pack.versions) {
                if(pack.versions[v].downloads === {} || pack.versions[v].downloads === null)
                    return `No downloads have been added to version ${v}`
                if(pack.versions[v].supports.length === 0)
                    return `Version ${v} must support atleast 1 game version!`
            }
        }
            
        return ''
    }

    renderNewPack() {
        return (
            <ColumnDiv style={{width:'100%', alignItems:'left', gap: 8}}>
                <InputField text="Pack Id (ex. 'tcc')" defaultValue={this.state.pack.id} style={{width:'15%', marginBottom:3}} onChange={(v: string)=>{this.state.pack.id=v}} disabled={!this.state.new}/>
                <GroupedFoldout group="mainGroup" text="Display" style={{width:'40%',backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={false}>
                    <ColumnDiv style={{width:'100%', alignItems:'', gap: 8}}>                    
                        <RadioButton text="Hidden?" defaultValue={this.state.pack.display === 'hidden'} onChange={(value)=>{
                            if(value) this.state.pack.display = 'hidden'
                            else this.state.pack.display = new Display()

                            this.setState({displayHidden: value})
                        }}/>
                        {!this.state.displayHidden && this.state.pack.display !== 'hidden' && <ColumnDiv style={{width:'100%', gap:8}}>
                                <InputField text='Name...' defaultValue={this.state.pack.display.name} onChange={(v: string)=>{
                                    if(this.state.pack.display !== 'hidden') 
                                        this.state.pack.display.name = v
                                }}/>
                                <InputField text='Icon URL...' defaultValue={this.state.pack.display.icon} onChange={(v: string)=>{
                                    if(this.state.pack.display !== 'hidden') 
                                        this.state.pack.display.icon = v
                                }}/>
                                <InputField text='Description...' defaultValue={this.state.pack.display.description} onChange={(v: string)=>{
                                    if(this.state.pack.display !== 'hidden') 
                                        this.state.pack.display.description = v
                                }}/>
                            </ColumnDiv>
                        }
                    </ColumnDiv>
                </GroupedFoldout>
                <GroupedFoldout group="mainGroup" text="Versions" style={{width:'40%',backgroundColor:'transparent',border:`1px solid ${curPalette.subText}`}} defaultValue={false}>
                    <ColumnDiv style={{width:'100%', alignItems:'', gap: 8}}>                    
                        <RowDiv style={{gap: 8}}>
                            <InputField text="Version Number..." onChange={(v: string)=>{this.newVersionNumber = v.replaceAll('.','_')}}/>
                            <AddButton style={{fontFamily:'Disket-Bold',}} onClick={()=>{

                                if(this.newVersionNumber === '') return
                                this.newVersionNumber = this.newVersionNumber.replaceAll('.','_')

                                if(this.state.pack.versions == null)
                                    this.state.pack.versions = {}
                                if(this.state.pack.versions[this.newVersionNumber] == null) {
                                    this.state.pack.versions[this.newVersionNumber] = new Version()
                                    this.renderVersions()
                                }
                            }}>Add</AddButton>
                        </RowDiv>
                        {this.state.versions}
                    </ColumnDiv>
                </GroupedFoldout>
                {(this.state.error != null && this.state.error !== '') && <b style={{fontFamily:'Inconsolata', color:'red'}}>{this.state.error}</b>}
                <RowDiv style={{gap:8,justifyContent:'space-evenly',width:'10%'}}>
                    <AddButton onClick={()=>{
                        this.setState({page: 0})
                    }}>Cancel</AddButton>
                    <AddButton onClick={()=>{
                        const result = this.validatePack()

                        if(result === '') {
                            PackHelper.createOrUpdatePack(this.state.pack, true, () => {
                                this.updatePacks()
                            })
                            this.setState({page: 0})
                        } else {
                            this.setState({error: result})
                        }
                    }}>Finish</AddButton>
                </RowDiv>
            </ColumnDiv>
        )
    }


    render() {
        return (
            <ColumnDiv style={{width:'100%', height:'100%', padding: 16}}>
                <RowDiv style={{display:'inline-flex', height: '100%', width:'100%', flexWrap:'wrap', justifyContent:'left', gap:12, alignContent:'flex-start'}}>
                    {this.state.page === 0 && this.renderUsersPacks()}
                    {this.state.page === 1 && this.renderNewPack()}
                </RowDiv>
            </ColumnDiv>
        );
    }
}

export default Create;
