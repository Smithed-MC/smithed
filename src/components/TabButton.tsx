import EventEmitter from 'events'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import palette from '../shared/Palette'

const UnselectedTabButton = styled.button`
font-family: Disket-Bold;
color: var(--text);
background: none;
border: none;
font-size: 16px;
-webkit-user-select: none;
cursor: pointer;

:hover {
  filter: brightness(85%);
}
:active {
  filter: brightness(75%);
}
`

const SelectedTabButton = styled(UnselectedTabButton)`
    margin-top: 4px;
    border-bottom: 4px solid var(--lightAccent);
`


interface TabButtonProps {
    group: string
    name: string
    [key: string]: any
}

const events = new EventEmitter()

function TabButton(props: TabButtonProps) {
    const [selected, setSelected] = useState(props.defaultValue)

    useEffect(() => {
        const onClick = (group: string) => {
            if (group === props.group)
                setSelected(false)
        }

        events.addListener('button-clicked', onClick)
        return () => {
            events.removeListener('button-clicked', onClick)
        }
    }, [setSelected, props.group])

    if(selected) {
        return (<SelectedTabButton style={props.style}>{props.children}</SelectedTabButton>)
    }

    return (
        <UnselectedTabButton onClick={() => {
            events.emit('button-clicked', props.group)
            if(props.onChange !== undefined) {
                props.onChange(props.name)
            }
            setSelected(true)
        }}
            style={props.style}>{props.children}
        </UnselectedTabButton>
    )
}

export default TabButton;