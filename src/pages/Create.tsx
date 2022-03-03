import { useEffect, useState } from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, StyledInput, RowDiv, userData } from '..';
import palette from '../shared/Palette';
import * as linq from 'linq-es5'
import { DataVersion, Dependency, Pack, PackHelper, Version } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import CreatePackDisplay from '../components/CreatePackDisplay';
import RadioButton from '../components/RadioButton';
import GroupedFoldout from '../components/GroupedFoldout';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { StyledButton, StyledLabel } from '../Shared';
import Popup from 'reactjs-popup';
import { packCategories } from './Browse';
import { database } from '../shared/ConfigureFirebase';


interface CreateState {

    [key: string]: any
}

const AddDiv = styled.div`
    width: 84px;
    height: 84px;
    padding: 8px;
    -webkit-user-select: none;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background-color: ${palette.darkBackground};

    :hover {
        filter: brightness(90%);
    }
    :active {
        filter: brightness(80%);
    }
`
const AddButton = styled.button`
    border: none;
    color: ${palette.text};
    background-color: ${palette.lightAccent};
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
        <StyledInput placeholder={props.text} style={props.style ? props.style : { width: '75%' }} title={props.text} defaultValue={props.defaultValue !== '' ? props.defaultValue : null} disabled={props.disabled} onChange={(e) => {
            props.onChange(e.target.value)
        }} />
    )
}

class PackWithMessages extends Pack {
    messages: string[] = []
}


const mainFoldoutStyle = { width: '40%', backgroundColor: 'transparent', border: `1px solid ${palette.subText}` }
function Create(props: RouteComponentProps) {

    const [page, setPage] = useState(0)
    const [packs, setPacks] = useState([] as PackWithMessages[])
    const [pack, setPack] = useState(new PackWithMessages())
    const [versions, setVersions] = useState([] as JSX.Element[])
    const [newFlag, setNewFlag] = useState(false)
    const [error, setError] = useState('')

    const generateSelectedCategories = () => {
        if (pack && pack.categories) {
            let elements: JSX.Element[] = []
            for (let c of pack.categories) {
                elements.push(<StyledLabel>{c}</StyledLabel>)
            }
            return elements
        } else {
            return []
        }
    }
    const [categories, setCategories] = useState(generateSelectedCategories())

    let newVersionNumber: string = ''

    let newDependency: Dependency = { id: '', version: '' }

    useEffect(() => {
        renderVersions()
        updatePacks()
    }, [])

    const updatePacks = () => {
        database.ref(`users/${userData.uid}/packs`).get().then(snapshot => {
            let databasePack: any[] = snapshot.val()
            try {
                let packs: PackWithMessages[] = []
                for (let p = 0; p < databasePack.length; p++)
                    packs.push(PackHelper.updatePackData(databasePack[p]) as PackWithMessages)

                setPacks(packs)
            } catch {
                console.log('failed to load packs')
            }
        })
    }


    const swapToAddPage = (pack?: Pack) => {
        setNewFlag(pack ? false : true)
        setPack(pack ? pack : new PackWithMessages())

        setCategories(generateSelectedCategories())

        props.history.push('/app/create/new_pack')
        renderVersions()

    }

    const renderUsersPacks = () => {
        let elements: JSX.Element[] = []

        if (packs != null && packs.length > 0) {
            for (let p of packs) {
                if (p === null) continue;

                elements.push(<CreatePackDisplay pack={p} onClick={() => {
                    swapToAddPage(p)
                }} />)
            }
        }

        elements.push(<AddDiv onClick={() => {
            swapToAddPage()
        }}>
            <StyledLabel style={{ color: palette.text, fontSize: 96, textAlign: 'center', fontFamily: 'Disket-Bold' }}>+</StyledLabel>
        </AddDiv>)
        return elements
    }

    const renderDownloads = (version: Version) => {
        let elements: JSX.Element[] = []
        for (let d in version.downloads) {
            elements.push(
                <InputField key={d} defaultValue={version.downloads[d] !== '' ? version.downloads[d] : null} text={d[0].toUpperCase() + d.substring(1) + ' URL...'} onChange={(v: string) => { version.downloads[d] = v }} />
            )
        }
        return elements
    }

    const renderSupportsOptions = () => {
        let elements: JSX.Element[] = []

        for (let v of userData.versions) {
            elements.push(<Option value={v} />)
        }

        return elements
    }
    const renderSupports = (version: Version) => {
        let elements: JSX.Element[] = []

        for (let s of version.supports) {
            elements.push(<RowDiv style={{ justifyContent: 'left', width: '100%' }}>
                <li style={{ color: palette.text }} />
                <StyledLabel style={{ color: palette.text, fontFamily: 'Inconsolata' }}>{s}</StyledLabel>
            </RowDiv>)
        }

        return elements
    }
    const renderDependencies = (version: Version) => {
        let elements: JSX.Element[] = []

        if (version.dependencies != null) {
            for (let d = 0; d < version.dependencies.length; d++) {
                elements.push(
                    <RowDiv style={{ justifyContent: 'center', width: '100%', gap: 8 }}>
                        <RowDiv style={{ width: '40%', height: 28, alignItems: 'center', overflowX: 'hidden' }}>
                            <StyledLabel style={{ width: '100%', color: palette.text, fontFamily: 'Inconsolata', textAlign: 'right' }}>{version.dependencies[d].id}</StyledLabel>
                        </RowDiv>
                        <InputField style={{ width: '20%' }} text="Version Number" defaultValue={version.dependencies[d].version} onChange={(v: string) => { version.dependencies[d].version = v }} />
                        <div style={{ width: '40%' }}>
                            <AddButton style={{ width: 28 }} onClick={() => {
                                version.dependencies.splice(d, 1)
                                renderVersions()
                            }}>-</AddButton>
                        </div>
                    </RowDiv>)
            }
        }

        return elements
    }

    const hasDependency = (version: Version) => {
        for (let d of version.dependencies) {
            if (d.id === newDependency.id)
                return true
        }
        return false
    }

    const renderVersions = () => {
        let elements: JSX.Element[] = []

        for (let v = 0; v < pack.versions.length; v++) {
            let version = pack.versions[v]
            elements.push(<GroupedFoldout group="version" text={version.name} key={v} style={{ width: '98%', backgroundColor: 'transparent', border: `1px solid ${palette.subText}` }} defaultValue={false}>
                <RowDiv style={{ gap: 8, paddingBottom: 8 }}>
                    <StyledButton style={{ width: '32px' }} hidden={!(v > 0)} onClick={() => {
                        let otherVersion = pack.versions[v - 1]
                        pack.versions[v] = otherVersion
                        pack.versions[v - 1] = version
                        renderVersions();
                    }}>⬆</StyledButton>
                    <Popup trigger={
                        <StyledButton style={{ width: '32px', backgroundColor: palette.badAccent }}>✖</StyledButton>
                    }>
                        <ColumnDiv style={{ backgroundColor: palette.darkBackground, padding: 8, borderRadius: 4, border: `2px solid ${palette.lightAccent}` }}>
                            <StyledLabel>Are you sure you want to delete <b>{version.name}</b>?</StyledLabel>
                            <AddButton style={{ backgroundColor: palette.badAccent }} onClick={() => {
                                pack.versions.splice(v, 1)
                                renderVersions()
                            }}>
                                Yes
                            </AddButton>
                        </ColumnDiv>
                    </Popup>
                    <StyledButton style={{ width: '32px' }} hidden={!(v < pack.versions.length - 1)} onClick={() => {
                        let otherVersion = pack.versions[v + 1]
                        pack.versions[v] = otherVersion
                        pack.versions[v + 1] = version
                        renderVersions();
                    }}>⬇</StyledButton>
                </RowDiv>
                <div>
                    <RadioButton defaultValue={version.breaking} text="Breaking?" onChange={(v) => {
                        version.breaking = v
                        renderVersions()
                    }} />
                </div>
                <GroupedFoldout group={v.toString()} text="Downloads" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                    <Dropdown placeholder="Add a download" onChange={(e) => {
                        if (version.downloads == null)
                            version.downloads = {}
                        if (version.downloads[e.toLowerCase()] == null) {
                            version.downloads[e.toLowerCase()] = ""
                            renderVersions()
                        }
                    }}>
                        <Option value="Datapack" />
                        <Option value="Resourcepack" />
                    </Dropdown>
                    {renderDownloads(version)}
                </GroupedFoldout>
                <GroupedFoldout group={v.toString()} text="Supports" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                    <ColumnDiv style={{ alignItems: 'left', width: '10%' }}>
                        {renderSupports(version)}
                    </ColumnDiv>
                    <Dropdown placeholder="Add/remove a version" onChange={(e) => {
                        if (!version.supports.includes(e)) {
                            version.supports.push(e)
                        } else {
                            version.supports.splice(version.supports.indexOf(e), 1)
                        }

                        version.supports = linq.asEnumerable(version.supports)
                            .OrderBy(s => new DataVersion(s).major)
                            .ThenBy(s => new DataVersion(s).minor)
                            .ThenBy(s => new DataVersion(s).patch)
                            .ToArray()

                        renderVersions()
                    }}>
                        {renderSupportsOptions()}
                    </Dropdown>
                </GroupedFoldout>
                <GroupedFoldout group={v.toString()} text="Dependencies" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                    <ColumnDiv style={{ alignItems: 'left', width: '100%' }}>
                        {renderDependencies(version)}
                    </ColumnDiv>
                    <RowDiv style={{ width: '75%', gap: 8 }}>
                        <InputField text="Id..." style={{ width: '25%' }} onChange={(v: string) => { newDependency.id = v }} />
                        <InputField text="Version..." style={{ width: '15%' }} onChange={(v: string) => { newDependency.version = v }} />
                        <AddButton onClick={() => {
                            if (newDependency.id.length < 3) return;
                            if (newDependency.version === '') return;
                            if (version.dependencies == null) version.dependencies = []
                            if (!hasDependency(version)) {
                                version.dependencies.push({ id: newDependency.id, version: newDependency.version })

                                renderVersions()
                            }
                        }}>Add</AddButton>
                    </RowDiv>
                </GroupedFoldout>
            </GroupedFoldout >)
        }
        setVersions(elements)
    }

    const validatePack = (): string => {
        if (pack.display.name === '')
            return 'You must specify a name'
        if (pack.display.description === '')
            return 'You must specify a description'

        if (pack.id.length < 3)
            return 'Pack Id must be atleast 3 characters'
        if (pack.versions == null || pack.versions.length === 0)
            return 'No versions have been specified'
        else {
            for (let v = 0; v < pack.versions.length; v++) {
                if (pack.versions[v].downloads === {} || pack.versions[v].downloads === null)
                    return `No downloads have been added to version ${v}`
                if (pack.versions[v].supports.length === 0)
                    return `Version ${v} must support atleast 1 game version!`
            }
        }

        return ''
    }

    const renderCategoryOptions = () => {
        let options: JSX.Element[] = []
        for (let c of packCategories) {
            options.push(<Option value={c} />)
        }
        return options
    }
    // TODO: Split groupedfoldouts into their own files to make this nicer, might not work but oh well
    const renderNewPack = () => {
        if (pack.categories.length != categories.length)
            setCategories(generateSelectedCategories())

        return (
            <ColumnDiv style={{ width: '100%', alignItems: 'left', gap: 8 }}>
                <InputField text="Pack Id (ex. 'tcc')" defaultValue={pack.id} style={{ width: '15%', marginBottom: 3 }} onChange={(v: string) => { pack.id = v }} disabled={!newFlag} />
                {pack.messages != null && pack.messages.length > 0 &&
                    <GroupedFoldout group="mainGroup" text="Messages" style={mainFoldoutStyle} headerStyle={{ color: 'red' }} defaultValue={true}>
                        <StyledLabel id="messages" style={{ width: '100%' }}>{pack.messages.join('\n')}</StyledLabel>
                        <StyledButton onClick={(e) => {
                            PackHelper.resetMessages(pack.id)
                            const messages = document.getElementById('messages') as HTMLLabelElement
                            messages.hidden = true
                        }}>Clear</StyledButton>
                    </GroupedFoldout>}
                <GroupedFoldout group="mainGroup" text="Display" style={mainFoldoutStyle} defaultValue={false}>
                    <ColumnDiv style={{ width: '100%', alignItems: '', gap: 8 }}>
                        <div>
                            <RadioButton text="Hidden?" defaultValue={pack.display.hidden} onChange={(value) => {
                                pack.display.hidden = value
                            }} />
                        </div>
                        <ColumnDiv style={{ width: '100%', gap: 8 }}>
                            <InputField text='* Name...' defaultValue={pack.display.name} onChange={(v: string) => {
                                pack.display.name = v
                            }} />
                            <InputField text='Icon URL...' defaultValue={pack.display.icon} onChange={(v: string) => {
                                pack.display.icon = v
                            }} />
                            <InputField text='* Description...' defaultValue={pack.display.description} onChange={(v: string) => {
                                pack.display.description = v
                            }} />
                            <InputField text='Full View Markdown URL...' defaultValue={pack.display.webPage} onChange={(v: string) => {
                                pack.display.webPage = v
                            }} />
                        </ColumnDiv>

                    </ColumnDiv>
                </GroupedFoldout>
                <GroupedFoldout group="mainGroup" text="Versions" style={mainFoldoutStyle} defaultValue={false}>
                    <ColumnDiv style={{ width: '100%', alignItems: '', gap: 8 }}>
                        <RowDiv style={{ gap: 8 }}>
                            <InputField text="Version Number..." onChange={(v: string) => { newVersionNumber = v }} />
                            <AddButton style={{ fontFamily: 'Disket-Bold', }} onClick={() => {

                                if (newVersionNumber === '') return
                                newVersionNumber = newVersionNumber

                                if (pack.versions == null)
                                    pack.versions = []
                                if (pack.versions.find((v) => v.name === newVersionNumber) == null) {
                                    pack.versions.push(new Version(newVersionNumber))
                                    renderVersions()
                                }
                            }}>Add</AddButton>
                        </RowDiv>
                        {versions}
                    </ColumnDiv>
                </GroupedFoldout>
                <GroupedFoldout group="mainGroup" text="Search Information" style={mainFoldoutStyle} defaultValue={false}>
                    <ColumnDiv style={{ gap: 4, marginBottom: 4 }}>
                        {categories}
                    </ColumnDiv>
                    <Dropdown style={{ width: '33%' }} placeholder='Add/remove a category' onChange={(e) => {
                        if (!pack.categories) {
                            pack.categories = [e]
                        }
                        else if (!pack.categories.includes(e)) {
                            pack.categories.push(e)
                        } else {
                            pack.categories.splice(pack.categories.indexOf(e), 1)
                        }
                        setCategories(generateSelectedCategories())


                        // TODO: Display which categories the pack is + add user keywords
                    }}>
                        {renderCategoryOptions()}
                    </Dropdown>
                </GroupedFoldout>
                {(error != null && error !== '') && <b style={{ fontFamily: 'Inconsolata', color: 'red' }}>{error}</b>}
                <RowDiv style={{ gap: 8, justifyContent: 'space-evenly', width: '10%' }}>

                    <Popup trigger={
                        <AddButton style={{ backgroundColor: palette.badAccent }} hidden={pack.id === ''}>
                            Delete
                        </AddButton>}>

                        <ColumnDiv style={{ backgroundColor: palette.darkBackground, padding: 8, borderRadius: 4, border: `2px solid ${palette.lightAccent}` }}>
                            <StyledLabel>Are you sure you want to delete <b>{pack.id}</b>?</StyledLabel>
                            <AddButton style={{ backgroundColor: palette.badAccent }} onClick={() => {
                                PackHelper.deletePack(pack, () => {
                                    updatePacks()
                                    props.history.push('/app/create')
                                })
                            }}>
                                Yes
                            </AddButton>
                        </ColumnDiv>
                    </Popup>
                    <AddButton onClick={() => {
                        updatePacks()
                        props.history.push('/app/create')
                    }}>Cancel</AddButton>
                    <AddButton onClick={() => {
                        const result = validatePack()
                        updatePacks()

                        console.log(result)
                        if (result === '') {
                            PackHelper.createOrUpdatePack(pack, true, () => {
                                updatePacks()
                            })
                            props.history.push('/app/create')
                        } else {
                            setError(result)
                        }
                    }}>Finish</AddButton>
                </RowDiv>
            </ColumnDiv>
        )
    }



    return (
        <ColumnDiv style={{ width: '100%', height: '100%', padding: 16 }}>
            <RowDiv style={{ display: 'inline-flex', height: '100%', width: '100%', flexWrap: 'wrap', justifyContent: 'left', gap: 12, alignContent: 'flex-start' }}>
                <Switch>
                    <Route path='/app/create/new_pack'>{renderNewPack()}</Route>
                    <Route path={props.match.path}>{renderUsersPacks()}</Route>
                </Switch>
            </RowDiv>
        </ColumnDiv>
    );

}

export default withRouter(Create);
