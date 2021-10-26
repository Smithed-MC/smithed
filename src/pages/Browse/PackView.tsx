import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { Route, RouteComponentProps, Switch, useParams, useRouteMatch, withRouter } from 'react-router'
import { ColumnDiv, firebaseApp, Header1, Header2, mainEvents, MarkdownOptions, RowDiv, StyledButton, StyledInput, StyledLabel, userData } from '../..'
import curPalette from '../../Palette'
import Markdown from 'markdown-to-jsx'
import Browse from '../Browse'
import Popup from 'reactjs-popup'
import Dropdown, { Option } from '../../components/Dropdown'
import { remote } from '../../Settings'
const {ipcRenderer} = window.require('electron') 

const ContentContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: top;
    width: 100%;
    height: 100%;
    gap: 8px;
    padding: 8px;
    overflow-y: scroll;
`

class Content extends React.Component {
    
    props: any
    state: any
    constructor(props: any) {
        super(props)

        this.state = {content: null}
    }

    openUrl(url: string) {
        remote.shell.openExternal(url)
    }

    componentDidMount() {
        userData.ref?.child('donation').on('value', (snapshot) => {
            this.setState({donation: snapshot.val()})
        }) 
    }

    renderSupport() {
        if(this.state.donation != null) {
            return (
                <ColumnDiv style={{backgroundColor: curPalette.darkBackground, padding: 8, borderRadius: 8, width: '90%'}}>
                    <Header2 style={{marginBottom: 4, marginTop: -2}}>Support the Creator</Header2>
                    <ColumnDiv style={{gap: 4, width: '40%'}}>
                        {this.state.donation["kofi"] != null && this.state.donation["kofi"] != '' && <StyledButton style={{backgroundColor:'#00B9FE', width: '100%', borderRadius: 4}} onClick={()=>
                            this.openUrl(`https://ko-fi.com/${this.state.donation['kofi']}`)
                        }>Kofi</StyledButton>}
                        {this.state.donation["patreon"] != null && this.state.donation["patreon"] != '' && <StyledButton style={{backgroundColor:'#F96854', width: '100%', borderRadius: 4}} onClick={()=>
                            this.openUrl(`https://patreon.com/${this.state.donation['patreon']}`)
                        }>Patreon</StyledButton>}
                        {this.state.donation["other"] != null && this.state.donation["other"] != '' && <StyledButton style={{backgroundColor:'#7DEF6B   ', width: '100%', borderRadius: 4}} onClick={()=>
                            this.openUrl(this.state.donation['other'])
                        }>Other</StyledButton>}
                    </ColumnDiv>
                </ColumnDiv>
            )
        }
    }

    render() {
        let {owner, id}: any = this.props.params

        let result = userData.packs.Where(p => {
            return p.id === `${owner}:${id}`
        })
    
        if(result.Count() === 0) {
            return (
                <ColumnDiv style={{width:'100%', height:'100%'}}>
                    <Header1>404</Header1>
                    <StyledLabel>The pack <b>'{owner}:{id}'</b> does not exist or has not been approved by staff!</StyledLabel>
                </ColumnDiv>
            )
        }
    
        const pack = result.First()

        if(pack.data.display !== 'hidden') {
            const webPage = pack.data.display.webPage

            if(this.state.content == null) {
                if(webPage != null && webPage !== '') {
                    fetch(pack.data.display.webPage).then((resp) => {
                        if(resp.status == 200) {
                            resp.text().then(v => {
                                this.setState({content: v})
                            })    
                        } else {
                            throw resp.status
                        }
                    }).catch((err)=>{
                        this.setState({content: `<center># ${err}</center>\nThis pack's full view page is invalid! Please contact the author!`})
                    })
                } else {
                    this.setState({content:'This pack does not have a full view page setup, please contact the author.'})
                }
            }
            
            return (
                <ContentContainer>
                    <ColumnDiv style={{flex:'25%'}}>
                        {this.renderSupport()}
                    </ColumnDiv>
                    <ColumnDiv style={{flex:'50%', gap:'8px'}}>
                        <RowDiv style={{width: '100%', gap: 8, justifyContent:'left'}}>
                            <img style={{width:64, height:64, border:`4px solid ${curPalette.darkAccent}`, borderRadius:8}} src={pack.data.display.icon}/>
                            <StyledLabel style={{fontFamily:'Disket-Bold', fontSize: 18, alignSelf:'center', width:'100%', WebkitUserSelect:'none'}}>{pack.data.display.name}</StyledLabel>
                        </RowDiv>
                        <div style={{width:'100%', backgroundColor: curPalette.darkAccent, height: '2px', borderRadius: 8}}></div>
                        <Markdown style={{width: '100%',color:curPalette.text, marginBottom: 8, fontFamily:'Inconsolata', padding: 8}} options={MarkdownOptions()}>
                            {this.state.content == null ? 'null' : this.state.content}
                        </Markdown>
                    </ColumnDiv>
                    <ColumnDiv style={{flex:'25%'}}>
                        <ColumnDiv style={{backgroundColor:curPalette.darkBackground, padding: 8, borderRadius: 8, width: '90%'}}>
                            <Dropdown defaultValue={Browse.instance.state.profile.name}>
                                {this.renderProfiles()}
                            </Dropdown>
                            <StyledButton>ADD</StyledButton>
                        </ColumnDiv>
                    </ColumnDiv>
                </ContentContainer>
            )
        } else {
            return (
                <ColumnDiv style={{width:'100%', height:'100%'}}>
                    <Header1>Error</Header1>
                    <StyledLabel>The pack <b>'{owner}:{id}'</b> has been marked as hidden</StyledLabel>
                </ColumnDiv>
            )
        }
    }
    renderProfiles() {
        let elements: JSX.Element[] = []
        for(let p of userData.profiles) {
            elements.push(
                <Option value={p.name}/>
            )
        }
        return elements;
    }
}

function ContentWithParams() {
    return (
        <Content params={useParams()}/>
    )
}

function PackView(props: RouteComponentProps) {
    const matchPage = useRouteMatch("/app/browse/view/:owner/:id")
    mainEvents.on('key-press', ({key}: {key: string}) => {
        if(key == 'Escape' && matchPage) {
            props.history.push('/app/browse')
        }
    })

    return(
        <Switch>
            <Route path="/app/browse/view/:owner/:id">
                <ContentWithParams/>
            </Route>
        </Switch>
    )
}


export default PackView