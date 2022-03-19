import { useCallback, useEffect, useState } from 'react';
import '../font.css'
import { ColumnDiv, StyledInput, RowDiv, userData, Header2, mainEvents } from '..';
import PackDisplay from '../components/PackDisplay';
import { PackEntry, PackHelper } from '../Pack';
import Dropdown, { Option } from '../components/Dropdown';
import { Route, Switch } from 'react-router';
import PackView from './Browse/PackView';
import { asEnumerable } from 'linq-es5';
import TabButton from '../components/TabButton';
import Foldout from '../components/Foldout';
import RadioButton from '../components/RadioButton';
import Profile from 'shared/Profile';



export let selectedProfile: Profile = { name: '', version: '' }
export function setSelectedProfile(name: string) {
    selectedProfile = asEnumerable(userData.profiles).Where(p => p.name === name).FirstOrDefault()
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


function Browse(props: any) {
    const [tab, setTab] = useState(0)
    const [search, setSearch] = useState('')
    const [packs, setPacks] = useState([] as JSX.Element[])
    const [filters, setFilters] = useState([] as string[])
    let sort = (p: PackEntry) => -p.added

    const renderTabs = () => {
        return (
            <div className='bg-darkBackground' style={{paddingLeft:16, paddingRight: 16, borderRadius: 8, justifyContent:'center', display:'flex', gap: 16, marginTop: 8}}>
                    <TabButton onChange={()=>{
                    sort = (p: PackEntry) => {
                        if(p.updated !== undefined)
                            return -p.updated
                        else
                            return -p.added
                    }
                    renderPacks(sort)
                }} defaultValue={true} group="browse-sorting" name="updated">Updated</TabButton>
                <TabButton onChange={()=>{
                    sort = (p: PackEntry) => -p.added
                    renderPacks(sort)
                }} group="browse-sorting" name="new">New</TabButton>
                <TabButton onChange={()=>{
                    sort = (p: PackEntry) => p.downloads !== undefined ? -p.downloads : 0
                    renderPacks(sort)
                }} group="browse-sorting" name="trending">Downloads</TabButton>
            </div>
        )
    }

    const renderPacks = useCallback((sort: (p: PackEntry) => any) => {
        if(selectedProfile.name === '') {
            setPacks([<Header2>Select a profile to continue</Header2>])
            return;
        }

        let elements: JSX.Element[] = []

        function validatePack(p: PackEntry): boolean {
            const display = p.data.display;
            if (display.hidden) 
                return false

            if (!PackHelper.hasVersion(p.data, selectedProfile.version))
                return false;

            if (!display.name.toLowerCase().includes(search)) 
                return false

            if(filters.length > 0 && (!p.data.categories || p.data.categories.filter(c => filters.includes(c)).length == 0))
                return false
            return true
        }

        const packs = userData.packs.Where(validatePack).OrderBy(sort)

        if (packs.Count() === 0) {
            setPacks([<Header2>No packs found!</Header2>])
        } else {

            packs.ToArray().forEach((p) => {
                elements.push(<PackDisplay packEntry={p} />)
            })

            setPacks(elements)
        }
    }, [search, filters])

    
    const updatePacks = useCallback(() => {
        renderPacks(sort)
    }, [renderPacks])

    useEffect(() => {
        updatePacks()
        const onProfileChange = () => updatePacks()
        mainEvents.addListener('profile-changed', onProfileChange)

        return () => {
            mainEvents.removeListener('profile-changed', onProfileChange)
        }
    }, [updatePacks])

    useEffect(() => {
        updatePacks()
    }, [updatePacks])

    const generateCategoryFilters = () => {
        let elements: JSX.Element[] = []
        for(let c of packCategories) {
            elements.push(<RadioButton text={c} onChange={v => {
                let tempFilters = filters
                if(!v) {
                    tempFilters.splice(tempFilters.indexOf(c), 1)
                } else {
                    tempFilters.push(c)
                }
                setFilters(tempFilters)
                renderPacks(sort)
            }}/>)
            
        }
        return elements
    }

    function renderMain() {
        // TODO: Implement basic trending algorith and add back tabs
        return (
            <ColumnDiv style={{ flexGrow: 1, width: '100%' }}>
                {renderTabs()}
                <RowDiv style={{ width: '100%', height: '100%', marginTop: 16 }}>
                    <ColumnDiv style={{ flex: '25%' }}>
                        <Dropdown style={{ width: '78.5%' }} defaultValue={selectedProfile.name !== '' ? selectedProfile.name : undefined} reset={false} onChange={(v) => setSelectedProfile(v)} placeholder='Select a profile'>
                            {getProfiles()}
                        </Dropdown>
                        <StyledInput style={{ width: '75%' }} placeholder="Search..." onChange={(e) => {
                            let v = e.target.value
                            setSearch(v)
                        }} />
                        <Foldout style={{ width: '75%' }} text='Filters'>
                            <ColumnDiv style={{alignItems:'left', width:'100%'}}>
                                {generateCategoryFilters()}
                            </ColumnDiv>
                        </Foldout>
                    </ColumnDiv>
                    <div style={{ flex: '50%' }}>
                        <ColumnDiv style={{ display: 'inline-flex', gap: 8, overflowY: 'auto', overflowX: 'visible', width: '100%', height: '100%', }}>
                            {packs}
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
                <PackView/>
            </Route>
            <Route path="/app/browse">
                {renderMain()}
            </Route>
        </Switch>
    )

}



export default Browse;
