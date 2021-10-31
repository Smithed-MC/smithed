import React from 'react';
import styled from 'styled-components';
import { RowDiv,} from '..';
import { Pack } from '../Pack';
import curPalette from '../Palette'
import Hidden from '../icons/hidden.svg'
import colorize from 'css-colorize'
import { StyledLabel,} from '../Shared';

interface CreatePackDisplayProps {
    pack: Pack,
    onClick?: ()=>void
}

interface CreatePackDisplayState {
}

const PackName = styled.label`
    font-family: Disket-Bold;
    color: ${curPalette.text};
    text-align: left;
    width: 100%;
    font-size: 18px;
`
const PackStats = styled.label`
    font-family: Inconsolata;
    color: ${curPalette.subText};
    text-align: left;
    width: auto;
    font-size: 12px;
    white-space: nowrap;
    vertical-align: middle;
`
const PackDescription = styled.label`
    font-family: Inconsolata;
    color: ${curPalette.text};
    text-align: left;
    width: 100%;
    font-size: 16px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: clip;
`

const PackAddButton = styled.button`
    border: none;
    color: ${curPalette.text};
    background-color: ${curPalette.lightAccent};
    font-family: Disket-Bold;
    font-size: 20px;
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

const filter = colorize.colorize(curPalette.lightAccent).filter.replace('filter: ','').replace(';','')


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
            <RowDiv style={{backgroundColor:curPalette.darkBackground, alignItems:'center', justifyContent:'left', padding: 8, gap: 8, width:320, height:64}} onClick={this.props.onClick}>
                <img style={{width:64,height:64, WebkitUserSelect:'none', filter: this.props.pack.display === 'hidden' ? filter : ''}} src={this.props.pack.display !== 'hidden' ? this.props.pack.display.icon : Hidden}/>
                <StyledLabel style={{WebkitUserSelect:'none',fontFamily:'Disket-Bold', color: this.props.pack.messages != null && this.props.pack.messages.length > 0 ? 'red' : curPalette.text}}>{this.props.pack.display !== 'hidden' ? this.props.pack.display.name : this.props.pack.id}</StyledLabel>
            </RowDiv>
        );
    }
}

export default CreatePackDisplay;
