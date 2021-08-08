import React, { version } from 'react';
import styled from 'styled-components';
import { RowDiv } from '..';
import curPalette from '../Palette'


interface RadioButtonProps {
    onChange?: (value: boolean)=>void,
    value: string,
    children?: any,
    style?: React.CSSProperties
}

interface RadioButtonState {
    toggled: boolean
}

const RadioButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    -webkit-user-drag: none;
    gap:8px;
    alignItems: center;
    width:100%;
    flex-grow: 1;
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
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`

class RadioButton extends React.Component {
    props: RadioButtonProps
    state: RadioButtonState
    constructor(props: RadioButtonProps) {
        super(props)
        this.props = props
        this.state = {toggled: false}
    }


    render() {
        return (
            <RadioButtonContainer style={this.props.style != null ? this.props.style : {}}>
                <Box onClick={()=>{
                    this.setState({toggled:!this.state.toggled})
                    if(this.props.onChange != null)
                        this.props.onChange(!this.state.toggled)
                }}>
                    {this.state.toggled && <div style={{width:12, height:12, backgroundColor:curPalette.lightAccent}}></div>}
                </Box>
                <label style={{color:curPalette.text,fontFamily:'Consolas', textAlign:'left', width:'100%'}}>{this.props.value}</label>
            </RadioButtonContainer>
        );
    }
}

export default RadioButton;
