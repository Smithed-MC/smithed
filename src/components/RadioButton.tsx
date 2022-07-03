import React from 'react';
import styled from 'styled-components';
import palette from '../shared/Palette'
import { StyledLabel } from '../Shared';


interface RadioButtonProps {
    onChange?: (value: boolean)=>void,
    text: string,
    defaultValue?: boolean;
    children?: any,
    style?: React.CSSProperties,
    [key: string]: any
}

interface RadioButtonState {
    toggled: boolean
}

const Checkbox = styled.input`
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
            <StyledLabel style={{width:'100%', WebkitUserSelect: 'none'}}><Checkbox type='checkbox' onChange={(v) => {
                if(!this.props.onChange) return
                this.props.onChange((v.target as HTMLInputElement).checked)
            }}/> {this.props.text}</StyledLabel>
            // <RadioButtonContainer style={this.props.style != null ? this.props.style : {}} onClick={()=>{
            //     this.setState({toggled:!this.state.toggled})
            //     if(this.props.onChange != null)
            //         this.props.onChange(!this.state.toggled)
            // }}>
            //     <Box>
            //         {this.state.toggled && <div style={{width:12, height:12, backgroundColor: 'var(--lightAccent)'}}></div>}
            //     </Box>
            //     <StyledLabel style={{color: 'var(--text)',fontFamily:'Inconsolata', textAlign:'left', width:'100%', WebkitUserSelect:'none'}}>{this.props.text}</StyledLabel>
            // </RadioButtonContainer>
        );
    }
}

export default RadioButton;
