import { useCallback, useEffect, useState } from 'react';
import '../font.css'
import { ColumnDiv, StyledInput, RowDiv, userData, Header2, mainEvents } from '..';
import PackDisplay from '../components/PackDisplay';
import { Pack, PackEntry, PackHelper } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import { Route, Switch } from 'react-router';
import PackView from './Browse/PackView';
import { asEnumerable } from 'linq-es5';
import TabButton from '../components/TabButton';
import Foldout from '../components/Foldout';
import RadioButton from '../components/RadioButton';
import Profile from 'shared/Profile';
import { OrderedEnumerable } from 'linq-es5/lib/enumerable';



export let selectedProfile: Profile = { name: '', version: '' }
export function setSelectedProfile(name: string) {
    selectedProfile = userData.profiles.filter(p => p.name == name)[0]
    mainEvents.emit('profile-changed')
}

export const packCategories = [
    'Extensive',
    'Lightweight',
    'QoL',
    'Vanilla+',
    'Tech',
    'Magic',
    'Library',
    'Exploration',
    'World Overhaul',
    'No Resource Pack'
]

const getProfiles = () => {
    let elements: JSX.Element[] = []
    for (let p of userData.profiles)
        elements.push(<Option value={p.name} />)
    return elements;
}

const sorts: {[key: string]: (p: PackEntry) => number} = {
    'updated': function updatedSort(p: PackEntry) {
        if (p.updated !== undefined)
            return -p.updated
        else
            return -p.added
    },
    'new': function newSort(p: PackEntry) {
        return -p.added
    },
    'downloads': function downloadsSort(p: PackEntry) {
        return p.downloads !== undefined ? -p.downloads : 0
    }
}

function Browse(props: any) {
    const [search, setSearch] = useState('')
    const [hideUnsupported, setHideUnsupported] = useState(false)
    const [packs, setPacks] = useState<PackEntry[] | undefined>()
    const [filters, setFilters] = useState<string[]>([])
    const [sort, setSort] = useState<string>('updated')

    const renderTabs = () => {
        return (
            <div className='bg-darkBackground' style={{ paddingLeft: 16, paddingRight: 16, borderRadius: 8, justifyContent: 'center', display: 'flex', gap: 16, marginTop: 8 }}>
                <TabButton onChange={() => {
                    setSort('updated')
                }} defaultValue={true} group="browse-sorting" name="updated">Updated</TabButton>
                <TabButton onChange={() => {
                    setSort('new')
                }} group="browse-sorting" name="new">New</TabButton>
                <TabButton onChange={() => {
                    setSort('downloads')
                }} group="browse-sorting" name="downloads">Downloads</TabButton>
            </div>
        )
    }

    const processPacks = useCallback(() => {
        if (selectedProfile.name === '') {
            selectedProfile.version = ''
        }
        function validatePack(p: PackEntry): boolean {
            const display = p.data.display;
            if (display.hidden || p.owner === undefined || p.added === undefined || display.name === '')
                return false

            if (hideUnsupported && !PackHelper.hasVersion(p.data, selectedProfile.version))
                return false

            if (!display.name.toLowerCase().includes(search))
                return false

            if (filters.length > 0 && (!p.data.categories || p.data.categories.filter(c => filters.includes(c)).length != filters.length))
                return false
            return true
        }
        console.log('processPacks')

        const packs = userData.packs.Where(validatePack).OrderBy(sorts[sort])

        if (packs.Count() === 0) {
            setPacks(undefined)
        } else {
            console.log(packs.ToArray())
            setPacks(packs.ToArray())
        }
    }, [[setPacks]])

    useEffect(() => {
        processPacks()
    }, [search, filters, hideUnsupported, sort, selectedProfile])

    const generateCategoryFilters = () => {
        let elements: JSX.Element[] = []
        for (let c of packCategories) {
            elements.push(<RadioButton text={c} onChange={v => {
                let tempFilters = filters
                if (!v) {
                    tempFilters.splice(tempFilters.indexOf(c), 1)
                } else {
                    tempFilters.push(c)
                }
                console.log(tempFilters)
                setFilters(tempFilters)
                processPacks()
            }} />)

        }
        return elements
    }

    function renderMain() {
        // TODO: Implement basic trending algorith and add back tabs
        return (
            <ColumnDiv style={{ flexGrow: 1, width: '100%' }}>
                {renderTabs()}
                <RowDiv style={{ width: '100%', height: '100%', marginTop: 16 }}>
                    <ColumnDiv className='flex-[25%] gap-2'>
                        <Dropdown className='w-3/4' defaultValue={selectedProfile.name !== '' ? selectedProfile.name : undefined} reset={false} onChange={(v) => {setSelectedProfile(v); processPacks()}} placeholder='Select a profile'>
                            {getProfiles()}
                        </Dropdown>
                        <input className='w-3/4' placeholder="Search..." onChange={(e) => {
                            let v = e.target.value
                            setSearch(v)
                        }} />
                        <div className='w-3/4 p-2'>
                            <RadioButton text='Hide Unsupported?' onChange={setHideUnsupported} />
                        </div>
                        <Foldout style={{ width: '75%' }} text='Filters' defaultValue={true}>
                            <ColumnDiv style={{ alignItems: 'left', width: '100%' }}>
                                {generateCategoryFilters()}
                            </ColumnDiv>
                        </Foldout>
                    </ColumnDiv>
                    <div style={{ flex: '50%' }}>
                        <ColumnDiv style={{ display: 'inline-flex', gap: 8, overflowY: 'auto', overflowX: 'visible', width: '100%', height: '100%', paddingBottom: 64 }}>
                            {packs !== undefined && packs.map(p => {
                                return (<PackDisplay key={p.id} packEntry={p} />)
                            })}
                        </ColumnDiv>
                    </div>
                    <div style={{ flex: '25%' }}></div>
                </RowDiv>

            </ColumnDiv>
        );
    }


    return (
        <Switch>
            <Route path="/app/browse/view/:owner/:id">
                <PackView />
            </Route>
            <Route path="/app/browse">
                {renderMain()}
            </Route>
        </Switch>
    )

}



export default Browse;
