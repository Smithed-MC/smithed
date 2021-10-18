import React from 'react'

import events from 'events'
import { RowDiv } from '..'

class ContextMenu extends React.Component {
    static eventEmitter = new events.EventEmitter()
    props: {style?: React.CSSProperties, [key: string]: any}
    state: {open: boolean, x: number, y: number}
    constructor(props: any) {
        super(props)
        this.props = props
        this.state = {open: false, x: 0, y: 0}
        ContextMenu.eventEmitter.on('open-context-menu', this.onOpenMenu)
        ContextMenu.eventEmitter.on('close-context-menu', this.onCloseMenu)
    }

    onOpenMenu = (id: string, x: number, y: number) => {
        if(id === this.props.id) {
            this.setState({open: true, x: x, y: y})
        }
    }

    closeMenu = () => {
        this.setState({open: false, x: 0, y: 0})
    }

    onCloseMenu = (id: string) => {
        if(id === this.props.id) {
            this.closeMenu()
        }
    }

    static openMenu = (id: string, x: number, y: number) => {
        ContextMenu.eventEmitter.emit('open-context-menu', id, x, y)
    }

    static closeMenu = (id: string) => {
        ContextMenu.eventEmitter.emit('close-context-menu', id)
    }

    render() {
        let style: React.CSSProperties = this.props.style != null ? this.props.style : {}
        style.position = 'absolute'
        style.display = this.state.open ? 'flex' : 'none'
        style.top = this.state.y - this.props.offsetY
        style.left = this.state.x - this.props.offsetX
        return (    
            <RowDiv style={style} onMouseLeave={()=>{this.closeMenu()}}>
                {this.props.children}
            </RowDiv>
        )
    }
}
export default ContextMenu