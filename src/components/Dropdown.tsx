import React, { version } from 'react';
import styled from 'styled-components';
import curPalette from '../Palette'

const DropdownWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
`;
const StyledSelect = styled.select`
    height: 100%;
    width: 100%;
    padding: 8px;
    margin-bottom: 1rem;
    background-color: ${curPalette.darkBackground};
    border: none;
    color: ${curPalette.text};
    border-radius: 8px;
    font-family: Inconsolata;
`;

const StyledOption = styled.option`
    background-color: ${curPalette.darkBackground};
    color: ${curPalette.text};
    border: none;
    font-family: Inconsolata;
`;


interface DropdownProps {
    onChange?: (value: string)=>void,
    placeholder?: string,
    children?: any,
    style?: React.CSSProperties,
    optionsStyle?: React.CSSProperties,
    id?: string,
    disabled?: boolean,
    noarrow?: boolean,
    defaultValue?: string
}

class Dropdown extends React.Component {
    props: DropdownProps
    constructor(props: DropdownProps) {
        super(props)
        this.props = props
    }

    onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        let s = e.target as HTMLSelectElement
        if(this.props.onChange != null)
            this.props.onChange(s.value)
    }
    render() {
        let style = this.props.optionsStyle != null ? this.props.optionsStyle : {}
        if(this.props.noarrow)
            style.appearance = 'none'
        
        return (
            <DropdownWrapper style={this.props.style != null ? this.props.style : {}} id={this.props.id}>
                <StyledSelect id="options" name="options" defaultValue={this.props.defaultValue != null ? this.props.defaultValue : "null"} style={style} onChange={e=>{
                    this.onChange(e)
                }} disabled={this.props.disabled}>
                    {this.props.placeholder != null && <Option value='null' disabled hidden>{this.props.placeholder}</Option>}
                    {this.props.children}
                </StyledSelect>
            </DropdownWrapper>
        );
    }
}

export default Dropdown;

export function Option(props: any) {
    return (
      <StyledOption selected={props.selected} value={props.value} hidden={props.hidden} disabled={props.disabled}>
        {props.children != null ? props.children : props.value}
      </StyledOption>
    );
  }