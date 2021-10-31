import React, { version } from 'react';
import styled from 'styled-components';
import { RowDiv } from '..';
import curPalette from '../Palette'
import { StyledLabel } from '../Shared';


interface RadioButtonProps {
    onChange?: (value: boolean)=>void,
    text: string,
    defaultValue?: boolean;
    children?: any,
    style?: React.CSSProperties
}

interface RadioButtonState {
    toggled: boolean
}

const RadioButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap:8px;
    align-items: center;
    -webkit-user-drag: none;
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`

const Box = styled.button`
    background-color: ${curPalette.text};
    width: 16px;
    height: 16px;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

class RadioButton extends React.Component {
    props: RadioButtonProps
    state: RadioButtonState
    constructor(props: RadioButtonProps) {
        super(props)
        this.props = props
        this.state = {toggled: this.props.defaultValue ? this.props.defaultValue : false}
    }


    render() {
        return (
            <RadioButtonContainer style={this.props.style != null ? this.props.style : {}} onClick={()=>{
                this.setState({toggled:!this.state.toggled})
                if(this.props.onChange != null)
                    this.props.onChange(!this.state.toggled)
            }}>
                <Box>
                    {this.state.toggled && <div style={{width:12, height:12, backgroundColor:curPalette.lightAccent}}></div>}
                </Box>
                <StyledLabel style={{color:curPalette.text,fontFamily:'Inconsolata', textAlign:'left', width:'100%', WebkitUserSelect:'none'}}>{this.props.text}</StyledLabel>
            </RadioButtonContainer>
        );
    }
}

export default RadioButton;
