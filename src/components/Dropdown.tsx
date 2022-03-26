import React from 'react';
import styled from 'styled-components';
import palette from '../shared/Palette'

const DropdownWrapper = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
`;
// const StyledSelect = styled.select`
//     height: 100%;
//     width: 100%;
//     padding: 8px;
//     margin-bottom: 1rem;
//     background-color: var(--darkBackground);
//     border: none;
//     color: var(--text);
//     border-radius: 8px;
//     font-family: Inconsolata;
// `;

const StyledOption = styled.option`
    background-color: var(--darkBackground);
    color: var(--text);
    border: none;
    font-family: Inconsolata;
`;


interface DropdownProps {
    onChange?: (value: string) => void,
    placeholder?: string,
    children?: any,
    style?: React.CSSProperties,
    optionsStyle?: React.CSSProperties,
    id?: string,
    disabled?: boolean,
    noarrow?: boolean,
    defaultValue?: string,
    reset?: boolean,
    className?: string,
}

class Dropdown extends React.Component {
    props: DropdownProps
    value?: string
    constructor(props: DropdownProps) {
        super(props)
        this.props = props
    }

    onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        let s = e.target as HTMLSelectElement
        if (this.props.onChange != null)
            this.props.onChange(s.value)
        this.value = s.value
    }
    render() {
        let style = this.props.style != null ? this.props.style : {}
        if (this.props.noarrow)
            style.appearance = 'none'

        return (
            <select className={this.props.className} id="options" name="options" defaultValue={this.props.defaultValue != null ? this.props.defaultValue : "null"} style={style} onChange={e => {
                this.onChange(e)
                if (this.props.reset != undefined && this.props.reset === false) return
                if (this.props.placeholder == null)
                    e.target.selectedIndex = -1
                else
                    e.target.selectedIndex = 0
            }} disabled={this.props.disabled}>
                {this.props.placeholder != null && <Option value='null' disabled hidden>{this.props.placeholder}</Option>}
                {this.props.children}
            </select>
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