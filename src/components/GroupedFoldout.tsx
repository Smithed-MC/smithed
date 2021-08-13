import Foldout, { FoldoutProps } from "./Foldout";

import events from 'events'

interface GroupedFoldoutProps extends FoldoutProps {
    group: string
}

class GroupedFoldout extends Foldout {
    static eventEmitter = new events.EventEmitter()
    props: GroupedFoldoutProps
    constructor(props: GroupedFoldoutProps) {
        super(props as FoldoutProps)
        this.props = props

        GroupedFoldout.eventEmitter.on(`${this.props.group}-off`, () => {
            this.setState({open:false})
        })
    }

    onClick = () => {
        if(this.props.disabled) return; 
        if(this.state.open === false)
            GroupedFoldout.eventEmitter.emit(`${this.props.group}-off`)
        this.setState({open: !this.state.open})
    }
}
export default GroupedFoldout