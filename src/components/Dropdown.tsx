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
    font-family: Consolas;
`;

const StyledOption = styled.option`
    background-color: ${curPalette.darkBackground};
    color: ${curPalette.text};
    border: none;
    font-family: Consolas;
`;


interface DropdownProps {
    onChange: (value: string)=>void,
    placeholder?: string,
    children?: any,
    style?: React.CSSProperties
}

class Dropdown extends React.Component {
    props: DropdownProps
    constructor(props: DropdownProps) {
        super(props)
        this.props = props
    }

    onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        let s = e.target as HTMLSelectElement
        this.props.onChange(s.value)
    }
    render() {
        return (
            <DropdownWrapper style={this.props.style != null ? this.props.style : {}}>
                <StyledSelect id="options" name="options" placeholder={this.props.placeholder} onChange={e=>this.onChange(e)} value=''>
                    {this.props.children}
                </StyledSelect>
            </DropdownWrapper>
        );
    }
}

export default Dropdown;

export function Option(props: any) {
    return (
      <StyledOption selected={props.selected}>
        {props.value}
      </StyledOption>
    );
  }