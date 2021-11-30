import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Route, RouteComponentProps, Switch, useParams, useRouteMatch } from 'react-router'
import { ColumnDiv, firebaseApp, Header1, Header2, mainEvents, MarkdownOptions, RowDiv, userData } from '../..'
import curPalette from '../../Palette'
import Markdown from 'markdown-to-jsx'
import { selectedProfile, setSelectedProfile } from '../Browse'
import Dropdown, { Option } from '../../components/Dropdown'
import { remote } from '../../Settings'
import { StyledLabel, StyledButton } from '../../Shared';
import { PackEntry } from '../../Pack'

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

function Content(props: any) {
    const [pack, setPack] = useState({} as PackEntry)
    const [donation, setDonation] = useState({} as { [key: string]: any })
    const [content, setContent] = useState('')
    const params = useParams()
    function openUrl(url: string) {
        remote.shell.openExternal(url)
    }

    useEffect(() => {
        let { owner, id }: any = params

        let result = userData.packs.Where(p => {
            return p.id === `${owner}:${id}`
        })

        if (result.Count() !== 0 && pack !== result.First()) {
            setPack(result.First())
        }
    }, [params, pack])


    useEffect(() => {
        getDonations(pack)
        getContent(pack)
    }, [pack])


    function renderSupport() {
        if (donation != null) {
            return (
                <ColumnDiv style={{ backgroundColor: curPalette.darkBackground, padding: 8, borderRadius: 8, width: '90%' }}>
                    <Header2 style={{ margin:0, textAlign:'center' }}>Support the Creator</Header2>
                    <hr style={{width:'100%'}}/>
                    <ColumnDiv style={{ gap: 4, width: '40%' }}>
                        {donation["kofi"] != null && donation["kofi"] !== '' && <StyledButton style={{ backgroundColor: '#00B9FE', width: '100%', borderRadius: 4 }} onClick={() =>
                            openUrl(`https://ko-fi.com/${donation['kofi']}`)
                        }>Kofi</StyledButton>}
                        {donation["patreon"] != null && donation["patreon"] !== '' && <StyledButton style={{ backgroundColor: '#F96854', width: '100%', borderRadius: 4 }} onClick={() =>
                            openUrl(`https://patreon.com/${donation['patreon']}`)
                        }>Patreon</StyledButton>}
                        {donation["other"] != null && donation["other"] !== '' && <StyledButton style={{ backgroundColor: '#7DEF6B   ', width: '100%', borderRadius: 4 }} onClick={() =>
                            openUrl(donation['other'])
                        }>Other</StyledButton>}
                    </ColumnDiv>
                </ColumnDiv>
            )
        }
    }

    function getContent(pack: PackEntry) {
        if (pack.data !== undefined) {
            const webPage = pack.data.display.webPage

            if (webPage != null && webPage !== '') {
                fetch(pack.data.display.webPage, { cache: "no-store" }).then((resp) => {
                    if (resp.status === 200) {
                        resp.text().then(v => {
                            setContent(v)
                        })
                    } else {
                        throw resp.status
                    }
                }).catch((err) => {
                    setContent(`<center># ${err}</center>\nThis pack's full view page is invalid! Please contact the author!`)
                })
            } else {
                setContent('This pack does not have a full view page setup, please contact the author.')
            }
        }
    }

    function getDonations(pack: PackEntry) {
        firebaseApp.database().ref(`users/${pack.owner}/donation`).get().then((snapshot) => {
            setDonation(snapshot.val())
        })
    }

    function renderProfiles() {
        let elements: JSX.Element[] = []
        for (let p of userData.profiles) {
            elements.push(
                <Option value={p.name} />
            )
        }
        return elements;
    }


    if (pack !== undefined && pack.data !== undefined) {
        // TODO: Setup cross page profile selection
        return (
            <ContentContainer>
                <ColumnDiv style={{ flex: '25%' }}>
                    {renderSupport()}
                </ColumnDiv>
                <ColumnDiv style={{ flex: '50%', gap: '8px' }}>
                    <RowDiv style={{ width: '100%', gap: 8, justifyContent: 'left' }}>
                        <img style={{ width: 64, height: 64, border: `4px solid ${curPalette.darkAccent}`, borderRadius: 8 }} src={pack.data.display.icon} alt="Pack Icon"/>
                        <StyledLabel style={{ fontFamily: 'Disket-Bold', fontSize: 18, alignSelf: 'center', width: '100%', WebkitUserSelect: 'none' }}>{pack.data.display.name}</StyledLabel>
                    </RowDiv>
                    <div style={{ width: '100%', backgroundColor: curPalette.darkAccent, height: '2px', borderRadius: 8 }}></div>
                    <Markdown style={{ width: '100%', color: curPalette.text, marginBottom: 8, fontFamily: 'Inconsolata', padding: 8 }} options={MarkdownOptions()}>
                        {content == null ? 'null' : content}
                    </Markdown>
                </ColumnDiv>
                <ColumnDiv style={{ flex: '25%' }}>
                    <ColumnDiv style={{ backgroundColor: curPalette.darkBackground, padding: 8, borderRadius: 8, width: '90%' }}>
                        <Dropdown defaultValue={selectedProfile.name !== '' ? selectedProfile.name : undefined} placeholder='Select a profile' onChange={v=>setSelectedProfile(v)}>
                            {renderProfiles()}
                        </Dropdown>
                        <StyledButton>ADD</StyledButton>
                    </ColumnDiv>
                </ColumnDiv>
            </ContentContainer>
        )
    } else {
        return (
            <ColumnDiv style={{ width: '100%', height: '100%' }}>
                <Header1>Error</Header1>
                <StyledLabel>The pack <b>'{pack.id}'</b> has been marked as hidden</StyledLabel>
            </ColumnDiv>
        )
    }
}



function PackView(props: RouteComponentProps) {
    const matchPage = useRouteMatch("/app/browse/view/:owner/:id")

    useEffect(()=>{
        const onKeyPress = ({ key }: { key: string }) => {
            if (key === 'Escape' && matchPage) {
                props.history.replace('/app/browse')
                
            }
        }

        mainEvents.addListener('key-press', onKeyPress)
        return () => {
            mainEvents.removeListener('key-press', onKeyPress)
        }
    }, [matchPage, props.history])


    return (
        <Switch>
            <Route path="/app/browse/view/:owner/:id">
                <Content />
            </Route>
        </Switch>
    )
}


export default PackView