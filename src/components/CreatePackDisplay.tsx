import React from 'react';
import { RowDiv,} from '..';
import { Pack } from '../Pack';
import palette from '../shared/Palette'
import Hidden from '../icons/hidden.svg'
import colorize from 'css-colorize'
import { StyledLabel,} from '../Shared';

interface CreatePackDisplayProps {
    pack: Pack,
    onClick?: ()=>void
}

interface CreatePackDisplayState {
}


class CreatePackDisplay extends React.Component {
    props: CreatePackDisplayProps
    state: CreatePackDisplayState
    constructor(props: CreatePackDisplayProps) {
        super(props)
        this.props = props
        this.state = {}
    }

    render() {
        return(
            <RowDiv className='bg-darkBackground rounded-lg hover:brightness-90 active:brightness-75' style={{alignItems:'center', justifyContent:'left', padding: 8, gap: 8, width:320, height:84}} onClick={this.props.onClick}>
                <img style={{width:64,height:64, WebkitUserSelect:'none'}} src={this.props.pack.display.icon !== '' ? this.props.pack.display.icon : Hidden} alt="Pack icon"/>
                <StyledLabel className={`text-${this.props.pack.messages != null && this.props.pack.messages.length > 0 ? 'red-500' : 'text'}`} style={{WebkitUserSelect:'none',fontFamily:'Disket-Bold'}}>{this.props.pack.display.name}</StyledLabel>
            </RowDiv>
        );
    }
}

export default CreatePackDisplay;
