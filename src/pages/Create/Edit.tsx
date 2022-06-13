import { useEffect, useState } from 'react';
import styled from 'styled-components';
import '../../font.css'
import { ColumnDiv, StyledInput, RowDiv } from '../..';
import { Pack, PackHelper } from '../../Pack';
import Dropdown, { Option } from '../../components/Dropdown';
import GroupedFoldout from '../../components/GroupedFoldout';
import { useHistory } from 'react-router';
import { StyledButton, StyledLabel } from '../../Shared';
import Popup from 'reactjs-popup';
import { packCategories } from '../Browse';
import { BooleanParam, StringParam, useQueryParam } from 'use-query-params';
import DisplaySettings from './DisplaySettings';
import VersionSettings from './VersionSettings';
import Foldout from 'components/Foldout';
import Analytics from './Analytics';

const mainFoldoutStyle = { width: '100%', backgroundColor: 'transparent', border: `4px solid var(--darkAccent)` }

export const AddButton = styled.button`
    border: none;
    color: var(--text);
    background-color: var(--lightAccent);
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

export function InputField(props: any) {
    return (
        <StyledInput placeholder={props.text} style={props.style ? props.style : { width: '75%' }} title={props.text} defaultValue={props.defaultValue !== '' ? props.defaultValue : null} disabled={props.disabled} onChange={(e) => {
            props.onChange(e.target.value)
        }} />
    )
}

export class PackWithMessages extends Pack {
    messages: string[] = []
}

function Edit(props: any) {
    const packs: PackWithMessages[] = props.packs ? props.packs : []
    const [packId, setPackId] = useQueryParam('id', StringParam)
    const [newPack, setNewPack] = useQueryParam('new', BooleanParam)
    const [pack, setPack] = useState<PackWithMessages>()
    const history = useHistory()

    useEffect(() => {
        if (newPack) {
            setPack(new PackWithMessages())
            generateSelectedCategories(new PackWithMessages())
            return
        }
        const p = packs.find(p => p.id === packId)
        if (p === undefined) {
            setPack(undefined)
            return
        }
        setPack(p)

    }, [newPack, packId])

    useEffect(() => {
        if(pack) generateSelectedCategories(pack)
    }, [pack])

    // console.log(packId)

    const [error, setError] = useState('')


    const generateSelectedCategories = (pack: PackWithMessages) => {
        setCategories(pack.categories.map(c => <label>{c}</label>))
    }
    const [categories, setCategories] = useState<JSX.Element[]>()

    if (pack === undefined) return (<h1>No pack</h1>)


    const validatePack = (): string => {
        if (pack.display.name === '')
            return 'You must specify a name'
        if (pack.display.description === '')
            return 'You must specify a description'

        if (pack.id.length < 3)
            return 'Pack Id must be atleast 3 characters'
        if (pack.id.match(/[`~!@#$%^&*()|+=?;:'",<>\{\}\[\]\\\/A-Z]/g))
            return 'Pack Id may only contain lowercase letters, numbers, _, -, and .'
        if (pack.versions == null || pack.versions.length === 0)
            return 'No versions have been specified'
        else {
            for (let v = 0; v < pack.versions.length; v++) {
                if (Object.keys(pack.versions[v].downloads).length === 0 || pack.versions[v].downloads === null)
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

    return (
        <div className='w-full flex justify-center overflow-y-scroll h-full'>
            <div className='flex flex-col w-full items-center gap-2 xl:w-1/2'>
                <input placeholder="Pack Id (ex. 'tcc')" defaultValue={pack.id} className='w-1/2 rounded-md p-2 bg-darkBackground placeholder:text-subText text-text font-inconsolata text-center' onChange={(e) => { pack.id = e.target.value }} disabled={!newPack} />
                {pack.messages != null && pack.messages.length > 0 &&
                    <GroupedFoldout group="mainGroup" text="Messages" style={mainFoldoutStyle} headerStyle={{ color: 'red' }} defaultValue={true}>
                        <StyledLabel id="messages" style={{ width: '100%' }}>{pack.messages.join('\n')}</StyledLabel>
                        <StyledButton onClick={(e) => {
                            PackHelper.resetMessages(pack.id)
                            const messages = document.getElementById('messages') as HTMLLabelElement
                            messages.hidden = true
                        }}>Clear</StyledButton>
                    </GroupedFoldout>}
                <Foldout text="Display" style={mainFoldoutStyle} defaultValue={false}>
                    <DisplaySettings pack={pack} />
                </Foldout>
                <Foldout text="Versions" style={mainFoldoutStyle} defaultValue={false}>
                    <VersionSettings versions={pack.versions} />
                </Foldout>
                <Foldout text="Search Information" style={mainFoldoutStyle} defaultValue={false}>
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
                        generateSelectedCategories(pack)


                        // TODO: Display which categories the pack is + add user keywords
                    }}>
                        {renderCategoryOptions()}
                    </Dropdown>
                </Foldout>
                <Foldout text="Analytics" style={mainFoldoutStyle} defaultValue={false}>
                    <Analytics pack={pack}/>
                </Foldout>
                {(error != null && error !== '') && <b style={{ fontFamily: 'Inconsolata', color: 'red' }}>{error}</b>}
                <RowDiv style={{ gap: 8, justifyContent: 'space-evenly', width: '10%' }}>

                    <Popup trigger={
                        <button className='bg-badAccent p-1 font-[Disket-Bold] text-text text-lg hover:brightness-75 active:brightness-[65%]' hidden={pack.id === ''}>
                            Delete
                        </button>}>

                        <ColumnDiv style={{ backgroundColor: 'var(--darkBackground)', padding: 8, borderRadius: 4, border: `2px solid var(--lightAccent)` }}>
                            <StyledLabel>Are you sure you want to delete <b>{pack.id}</b>?</StyledLabel>
                            <AddButton style={{ backgroundColor: 'var(--badAccent)' }} onClick={() => {
                                PackHelper.deletePack(pack, () => {
                                    history.push('/app/create')
                                })
                            }}>
                                Yes
                            </AddButton>
                        </ColumnDiv>
                    </Popup>
                    <button className='bg-lightAccent p-1 font-[Disket-Bold] text-text text-lg hover:brightness-75 active:brightness-[65%]' onClick={() => {
                        history.push('/app/create')
                    }}>Cancel</button>
                    <button className='bg-lightAccent p-1 font-[Disket-Bold] text-text text-lg hover:brightness-75 active:brightness-[65%]' onClick={() => {
                        const result = validatePack()

                        console.log(result)
                        if (result === '') {
                            PackHelper.createOrUpdatePack(pack, true).then(() => {
                                history.push('/app/create')
                            })
                        } else {
                            setError(result)
                        }
                    }}>Finish</button>
                </RowDiv>
            </div>
        </div>
    )
}

export default Edit