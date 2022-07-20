import React from 'react';
import '../font.css'
import { ColumnDiv, StyledInput, RowDiv, userData } from '..';
import { Enumerable } from 'linq-es5/lib/enumerable';
import * as linq from 'linq-es5'
import { getPack } from '../UserData';
import GroupedFoldout from '../components/GroupedFoldout';
import palette from '../shared/Palette';
import { Pack, PackDict, PackEntry, PackHelper, Version } from '../Pack';
import Popup from 'reactjs-popup';
import { fs, pathModule, remote, settingsFolder } from '../Settings';
import { StyledLabel, StyledButton } from '../Shared';
import { database } from '../shared/ConfigureFirebase';
import * as zip from '@zip.js/zip.js'
import { dirExists } from 'FSWrapper';
import semver from 'semver'
import JSZip from 'jszip';

const { Webhook } = window.require('simple-discord-webhooks');

let reason = ''
function QueueEntry(props: { data: Pack, owner: string, id: string }) {
    function pushWebhook() {
        const pack = props.data;
        const webhook = new Webhook(userData.discordWebhook);
        const date = new Date(Date.now());
        database.ref(`users/${props.owner}/displayName`).get().then((snapshot) => {
            const authorName = snapshot.val();
            webhook.send('**A new pack has been approved!**', [{
                title: `\`\`${pack.display.name}\`\` by \`\`${authorName}\`\``,
                type: "rich",
                timestamp: `${date.toISOString()}`,
                description: `${pack.display.description !== '' ? (
                    pack.display.description.length < 300 ? pack.display.description : pack.display.description.substring(0, 300) + '...'
                ) : 'No Description'}`,
                image: pack.display.icon !== '' ? {
                    url: pack.display.icon,
                    width: 32,
                    height: 32
                } : null,
                color: 1788100,
                footer: {
                    text: `Approved by: ${userData.displayName}`
                },
                url: `https://smithed.dev/packs/${props.owner}/${props.id}`
            }]);
        });
    }

    return (
        <GroupedFoldout text={props.id} group="queue" style={{ width: '95%', backgroundColor: 'var(--darkBackground)' }}>
            <ColumnDiv style={{ gap: 8 }}>
                <ColumnDiv style={{ gap: 8 }}>
                    <StyledLabel style={{}}><b style={{ fontSize: 18 }}>Description: </b> {props.data.display.description.length < 400 ? props.data.display.description : props.data.display.description.substring(0, 400) + '...'}</StyledLabel>
                    <div className='flex flex-row gap-2 justify-center'>
                        <StyledButton onClick={async () => {
                            const ver = props.data.versions.sort((a, b) => semver.gt(a.name, b.name) ? 1 : -1).reverse()[0]
                            console.log(props.data.versions)
                            await downloadPackAndOpen(ver)
                        }} style={{ width: '128px' }}>Open</StyledButton>
                        {props.data.display.webPage !== '' && <StyledButton style={{ width: '128px' }} onClick={() => {
                            remote.shell.openExternal(props.data.display.webPage)
                        }}>View Page</StyledButton>}
                    </div>
                </ColumnDiv>
                <RowDiv style={{ gap: 8, marginTop: 8 }}>
                    <Popup trigger={
                        <StyledButton style={{ backgroundColor: 'var(--lightBackground)' }} onClick={() => { reason = '' }}>
                            Reject
                        </StyledButton>} modal
                    >
                        <ColumnDiv style={{ backgroundColor: 'var(--lightBackground)', padding: 16, border: `4px solid var(--darkAccent)`, borderRadius: 8 }}>
                            <StyledInput placeholder="Reason for rejection..." style={{ width: '384px' }} defaultValue={reason} onChange={(e) => { reason = e.target.value }} />
                            <StyledButton onClick={() => {
                                if (reason !== '') {
                                    PackHelper.removePackFromQueue(props.id, props.owner, reason)
                                }
                            }}>Confirm</StyledButton>
                        </ColumnDiv>
                    </Popup>

                    <StyledButton onClick={() => {
                        PackHelper.movePackFromQueue(props.id, () => {
                            if (userData.discordWebhook != null) {
                                if (userData.discordWebhook != null) {
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
    state: { [key: string]: any }
    static instance: Queue
    constructor(props: any) {
        super(props)
        this.state = {}
        Queue.instance = this
    }

    componentDidMount() {
        database.ref('queue').on('value', (snap) => {
            this.renderQueue(snap)
        })
    }

    async getQueueAsList(snap: firebase.default.database.DataSnapshot): Promise<Enumerable<PackEntry>> {
        let queueDict: PackDict = snap.val()
        let queueList: PackEntry[] = []

        for (let id in queueDict) {
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

        for (let i = 0; i < length; i++) {
            let pack = packs.ElementAt(i)

            packDisplays.push(<QueueEntry id={pack.id} owner={pack.owner} key={pack.id} data={pack.data} />)
        }


        this.setState({ queue: packDisplays })
    }

    render() {
        return (
            <ColumnDiv style={{ flexGrow: 1, width: '100%' }}>
                <RowDiv style={{ width: '100%', height: '100%', marginTop: 16 }}>
                    <ColumnDiv style={{ flex: '25%' }}>
                    </ColumnDiv>
                    <div style={{ flex: '50%' }}>
                        <ColumnDiv style={{ display: 'inline-flex', gap: 8, overflowY: 'auto', overflowX: 'visible', width: '100%', height: '100%' }}>
                            {this.state.queue}
                        </ColumnDiv>
                    </div>
                    <div style={{ flex: '25%' }}></div>
                </RowDiv>
            </ColumnDiv>
        );
    }
}

async function extractZip(tempZip: zip.ZipReader, tempFolder: string) {
    const entries = await tempZip.getEntries()
    console.log(entries)
    for (let e of entries) {
        let path = tempFolder

        for (let part of e.filename.split('/').slice(0, -1)) {
            if (!fs.existsSync(path)) fs.mkdirSync(path)
            path = pathModule.join(path, part)
        }
        path = pathModule.join(tempFolder, e.filename)

        if (e.directory) {
            console.log(e.filename)
            fs.mkdirSync(path)
            continue
        }
        const fileDataWriter = new zip.BlobWriter()
        if (e.getData === undefined) return
        await e.getData(fileDataWriter)

        try {
            fs.writeFileSync(path, Buffer.from(await fileDataWriter.getData().arrayBuffer()))
        } catch (e) {
            console.log(e)
        }
    }
}

function deleteAndCreate(path: string) {
    if (dirExists(path)) fs.rmdirSync(path, { recursive: true })
    fs.mkdirSync(path)
}

async function downloadPackAndOpen(ver: Version) {
    if (ver.downloads === undefined) return;

    const tempFolder = pathModule.join(settingsFolder, 'temp')
    deleteAndCreate(tempFolder)
    
    for(let type in ver.downloads) {
        const url = ver.downloads[type]
        if (url === undefined) return
        const extractTo = pathModule.join(tempFolder, type);
        deleteAndCreate(extractTo)
    
        const tempPath = pathModule.join(extractTo, 'temp.zip')
    
        const resp = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
        console.log(url)
        console.log(resp)
        if (!resp.ok) return
        console.log(await resp.text())
        const buffer = (await resp.arrayBuffer())
        fs.writeFileSync(tempPath, Buffer.from(buffer))
    
        const blob = new Blob([buffer])
        const tempZip = new zip.ZipReader(new zip.BlobReader(blob))
        await extractZip(tempZip, tempFolder)
    }    

    const exec = window.require('child_process').exec
    exec(`code ${tempFolder}`)
}

export default Queue;
