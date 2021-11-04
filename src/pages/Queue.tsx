import React from 'react';
import '../font.css'
import { ColumnDiv, firebaseApp, StyledInput, RowDiv, userData } from '..';
import { Enumerable } from 'linq-es5/lib/enumerable';
import * as linq from 'linq-es5'
import { getPack } from '../UserData';
import GroupedFoldout from '../components/GroupedFoldout';
import curPalette from '../Palette';
import { PackDict, PackEntry, PackHelper } from '../Pack';
import Popup from 'reactjs-popup';
import { remote } from '../Settings';
import { StyledLabel, StyledButton } from '../Shared';
const {Webhook} = window.require('simple-discord-webhooks');

let reason = ''
function QueueEntry(props: any) {
    function pushWebhook() {
        const pack = props.data;
        const webhook = new Webhook(userData.discordWebhook);
        const date = new Date(Date.now());
        firebaseApp.database().ref(`users/${props.owner}/displayName`).get().then((snapshot) => {
            const authorName = snapshot.val();
            webhook.send('**A new pack has been approved!**', [{
                title: `\`\`${pack.display !== 'hidden' ? pack.display.name : pack.id}\`\` by \`\`${authorName}\`\``,
                type: "rich",
                timestamp: `${date.toISOString()}`,
                description: `${pack.display !== 'hidden' ? (
                    pack.display.description.length < 300 ? pack.display.description : pack.display.description.substring(0, 300) + '...'
                ) : 'No Description'}`,
                image: pack.display !== 'hidden' ? {
                    url: pack.display.icon,
                    width: 32,
                    height: 32
                } : null,
                color: 1788100,
                footer: {
                    text: `Approved by: ${userData.displayName}`
                }
            }]);
        });
    }

    return (
        <GroupedFoldout text={props.id} group="queue" style={{width:'95%'}}>
            <ColumnDiv style={{gap:8}}>
                {props.data.display !== 'hidden' && <ColumnDiv style={{gap: 8}}>
                    <StyledLabel style={{}}><b style={{fontSize:18}}>Description: </b> {props.data.display.description.length < 400 ? props.data.display.description : props.data.display.description.substring(0, 400) + '...'}</StyledLabel>
                    {props.data.display.webPage != null && <StyledButton style={{width: '196px'}} onClick={()=>{
                        remote.shell.openExternal(props.data.display.webPage)
                    }}>View Page</StyledButton>}
                </ColumnDiv>}
                <RowDiv style={{gap:8, marginTop:8}}>
                    <Popup trigger={
                        <StyledButton style={{backgroundColor:curPalette.lightBackground}} onClick={()=>{reason=''}}>
                            Reject
                        </StyledButton>} modal
                    >
                        <ColumnDiv style={{backgroundColor:curPalette.lightBackground, padding:16, border: `4px solid ${curPalette.darkAccent}`, borderRadius: 8}}>
                            <StyledInput placeholder="Reason for rejection..." style={{width:'384px'}} defaultValue={reason} onChange={(e) => {reason = e.target.value}}/>
                            <StyledButton onClick={()=> {
                                if(reason !== '') {
                                    PackHelper.removePackFromQueue(props.id, props.owner, reason)
                                }
                            }}>Confirm</StyledButton>
                        </ColumnDiv>
                    </Popup>

                    <StyledButton onClick={()=>{
                        PackHelper.movePackFromQueue(props.id, () => {
                            if(userData.discordWebhook != null) {
                                if(userData.discordWebhook != null) {
                                    pushWebhook();
                                }
                            }
                            
                        })
                    }}>Accept</StyledButton>
                </RowDiv>
            </ColumnDiv>
        </GroupedFoldout>
    )
}

class Queue extends React.Component {
    state: {[key: string]: any}
    static instance: Queue
    constructor(props: any) {
        super(props)
        this.state = {}
        Queue.instance = this
    }

    componentDidMount() {
        firebaseApp.database().ref('queue').on('value', (snap) => {
            this.renderQueue(snap)
        })
    }

    async getQueueAsList(snap: firebase.default.database.DataSnapshot): Promise<Enumerable<PackEntry>> {
        let queueDict: PackDict = snap.val()
        let queueList: PackEntry[] = []

        for(let id in queueDict) {
            queueList.push({
                owner: queueDict[id].owner,
                added: queueDict[id].added,
                id: id,
                data: await getPack(queueDict[id], id)
            })
        }

        return linq.asEnumerable(queueList)
    }

    async renderQueue(snap: firebase.default.database.DataSnapshot) {

        let packDisplays: JSX.Element[] = []
        
        let queue = await this.getQueueAsList(snap)

        let packs = queue.OrderBy(p => p.added)

        const length = packs.Count()

        for(let i = 0; i < length; i++) {
            let pack = packs.ElementAt(i)
            
            packDisplays.push(<QueueEntry id={pack.id} owner={pack.owner} key={pack.id} data={pack.data}/>)
        }


        this.setState({queue: packDisplays})
    }

    render() {
        return (
            <ColumnDiv style={{flexGrow:1, width:'100%'}}>
                <RowDiv style={{width:'100%', height:'100%', marginTop:16}}>
                    <ColumnDiv style={{flex:'25%'}}>
                    </ColumnDiv>
                    <div style={{flex:'50%'}}>
                        <ColumnDiv style={{display:'inline-flex',gap:8, overflowY:'auto', overflowX:'visible', width:'100%', height:'100%'}}>
                            {this.state.queue}
                        </ColumnDiv>
                    </div>
                    <div style={{flex:'25%'}}></div>
                </RowDiv>
            </ColumnDiv>
        );
    }
}


export default Queue;
