import Dropdown, {Option} from 'components/Dropdown';
import GroupedFoldout from 'components/GroupedFoldout';
import RadioButton from 'components/RadioButton';
import { ColumnDiv, RowDiv, StyledInput, userData } from 'index';
import {asEnumerable} from 'linq-es5';
import { DataVersion, Version } from 'Pack';
import { versions } from 'process';
import React, { useEffect, useRef, useState } from 'react'
import Popup from 'reactjs-popup';
import { StyledButton, StyledLabel } from 'Shared';
import { InputField } from './Edit';
import * as semver from 'semver'
import { Dependency } from 'shared/Profile';
import Foldout from 'components/Foldout';

export default function VersionSettings(props: {versions: Version[]}) {
    const [versions, setVersion] = useState<Version[]>([])
    const [versionDisplays, setVersionDisplays] = useState<JSX.Element[]>([])
    let newVersionNumber = ''

    useEffect(() => {
        setVersion(props.versions)
    }, [props.versions])
    
    useEffect(() => {
        renderVersions()
    }, [versions])

    const renderVersions = () => {
        let versionDisplays: JSX.Element[] = []

        for (let v = 0; v < versions.length; v++) {
            let version = versions[v]
            console.log(version)
            const element = renderSpecificVersion(version, v)
            versionDisplays.push(element)
        }
        setVersionDisplays(versionDisplays)
    }

    let newDependency: Dependency = { id: '', version: '' }
    
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
                <li className='text-text' />
                <StyledLabel className='text-text' style={{ fontFamily: 'Inconsolata' }}>{s}</StyledLabel>
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
                            <StyledLabel className='text-text' style={{ width: '100%', fontFamily: 'Inconsolata', textAlign: 'right' }}>{version.dependencies[d].id}</StyledLabel>
                        </RowDiv>
                        <InputField style={{ width: '20%' }} text="Version Number" defaultValue={version.dependencies[d].version} onChange={(v: string) => { version.dependencies[d].version = v }} />
                        <div style={{ width: '40%' }}>
                            <StyledButton style={{ width: 28 }} onClick={() => {
                                version.dependencies.splice(d, 1)
                                renderVersions()
                            }}>-</StyledButton>
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


    
    function renderSpecificVersion(version: Version, v: number): JSX.Element {
        return <GroupedFoldout group="version" text={version.name} key={v} style={{ width: '98%', backgroundColor: 'transparent', border: `1px solid var(--subText)` }} defaultValue={false}>
            <RowDiv style={{ gap: 8, paddingBottom: 8 }}>
                <StyledButton style={{ width: '32px' }} hidden={!(v > 0)} onClick={() => {
                    let otherVersion = versions[v - 1];
                    versions[v] = otherVersion;
                    versions[v - 1] = version;
                    renderVersions()
                } }>⬆</StyledButton>
                <Popup trigger={<button className='bg-badAccent text-text w-[32px] h-[32px] text-[20px] hover:brightness-75 active:brightness-[60%]'>✖</button>}>
                    <ColumnDiv className='bg-darkBackground text-text border-2 border-lightAccent rounded-md p-2'>
                        <StyledLabel>Are you sure you want to delete <b>{version.name}</b>?</StyledLabel>
                        <StyledButton style={{ backgroundColor: 'var(--badAccent)' }} onClick={() => {
                            versions.splice(v, 1);
                            renderVersions()
                        } }>
                            Yes
                        </StyledButton>
                    </ColumnDiv>
                </Popup>
                <StyledButton style={{ width: '32px' }} hidden={!(v < versions.length - 1)} onClick={() => {
                    let otherVersion = versions[v + 1];
                    versions[v] = otherVersion;
                    versions[v + 1] = version;
                    renderVersions();
                } }>⬇</StyledButton>
            </RowDiv>
            <div>
                <RadioButton defaultValue={version.breaking} text="Breaking?" onChange={(v) => {
                    version.breaking = v;
                    renderVersions();
                } } />
            </div>
            <Foldout text="Downloads" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                <Dropdown placeholder="Add a download" onChange={(e) => {
                    if (version.downloads == null)
                        version.downloads = {};
                    if (version.downloads[e.toLowerCase()] == null) {
                        version.downloads[e.toLowerCase()] = "";
                        renderVersions();
                    }
                } }>
                    <Option value="Datapack" />
                    <Option value="Resourcepack" />
                </Dropdown>
                {renderDownloads(version)}
            </Foldout>
            <Foldout text="Supports" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                <ColumnDiv style={{ alignItems: 'left', width: '10%' }}>
                    {renderSupports(version)}
                </ColumnDiv>
                <Dropdown placeholder="Add/remove a version" onChange={(e) => {
                    if (!version.supports.includes(e)) {
                        version.supports.push(e);
                    } else {
                        version.supports.splice(version.supports.indexOf(e), 1);
                    }

                    version.supports = asEnumerable(version.supports)
                        .OrderBy(s => new DataVersion(s).major)
                        .ThenBy(s => new DataVersion(s).minor)
                        .ThenBy(s => new DataVersion(s).patch)
                        .ToArray();

                    renderVersions();
                } }>
                    {renderSupportsOptions()}
                </Dropdown>
            </Foldout>
            <Foldout text="Dependencies" defaultValue={false} style={{ width: '95%', backgroundColor: 'transparent' }}>
                <ColumnDiv style={{ alignItems: 'left', width: '100%' }}>
                    {renderDependencies(version)}
                </ColumnDiv>
                <RowDiv className='w-3/4 gap-2 items-baseline'>
                    <StyledInput placeholder="Id..." style={{ flex: '50%', width:'100%' }} onChange={(e) => { 
                        newDependency.id = e.target.value;     
                        
                    } } />
                    <StyledInput placeholder="Version..." style={{ flex: '25%' }} onChange={(e) => { newDependency.version = e.target.value; } } />
                    <StyledButton onClick={() => {
                        if (newDependency.id.length < 3)
                            return;
                        if (newDependency.version === '')
                            return;
                        if (version.dependencies == null)
                            version.dependencies = [];
                        if (!hasDependency(version)) {
                            version.dependencies.push({ id: newDependency.id, version: newDependency.version });

                            renderVersions();
                        }
                    } }>Add</StyledButton>
                </RowDiv>
            </Foldout>
        </GroupedFoldout>;
    }

    const versionNumberRef = useRef<HTMLInputElement>(null)

    return <div className='w-full gap-2 pt-2 flex flex-col items-center'>
        <div className='gap-2 items-baseline flex flex-row'>
            <StyledInput className='w-3/4' placeholder="Version Number..." ref={versionNumberRef}/>
            <StyledButton style={{ fontFamily: 'Disket-Bold', }} onClick={() => {
                if(versionNumberRef.current == null) return
                let verNumber: string | undefined = versionNumberRef.current?.value

                if (verNumber === undefined || verNumber === '')
                    return;
                if(!semver.valid(verNumber))
                    versionNumberRef.current.value = 'Not valid semver'
                

                if (versions.find((v) => v.name === verNumber) == null) {
                    versions.push(new Version(verNumber));
                    renderVersions()
                }
            }}>Add</StyledButton>
        </div>
        {versions.length > 0 && <label className='text-text'>Latest Version is {versions[versions.length - 1].name}</label>}
        {versionDisplays}
    </div>;
}