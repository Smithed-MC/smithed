import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { Route, RouteComponentProps, Switch, useParams, withRouter } from 'react-router'
import { ColumnDiv, firebaseApp, Header1, Header2, MarkdownOptions, RowDiv, StyledButton, StyledInput, StyledLabel, userData } from '../..'
import curPalette from '../../Palette'
import Markdown from 'markdown-to-jsx'
import Browse from '../Browse'
import Popup from 'reactjs-popup'
import Dropdown, { Option } from '../../components/Dropdown'
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
                    <ColumnDiv style={{flex:'25%'}}></ColumnDiv>
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
                        <ColumnDiv style={{backgroundColor:curPalette.darkBackground, width:'100%'}}>
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

class PackView extends React.Component {
    props: RouteComponentProps
    constructor(props: RouteComponentProps) {
        super(props)
        this.props = props

    }

    componentDidMount() {
        ipcRenderer.on('user-data-changed', () => {
            this.forceUpdate()
        })
    }

    render() {
        return(
            <Switch>
                <Route path="/app/browse/view/:owner/:id">
                    <ContentWithParams/>
                </Route>
            </Switch>
        )
    }
}

export default PackView