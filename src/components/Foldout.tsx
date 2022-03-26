import React from 'react';
import styled from 'styled-components';
import palette from '../shared/Palette'
import { ColumnDiv } from '..';
import { StyledLabel } from '../Shared';

export interface FoldoutProps {
    text: string,
    style?: React.CSSProperties,
    headerStyle?: React.CSSProperties
    children?: any,
    defaultValue?: boolean
    disabled?: boolean
    className?: string
}

const FoldoutContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    -webkit-user-drag: none;
    // background-color: var(--darkBackground);
    padding: 8px; 
    border-radius: 8px;
`

export const FoldoutHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    -webkit-user-drag: none;

    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(65%);
    }
`


class Foldout extends React.Component {
    public state: {open: boolean}
    props: FoldoutProps
    constructor(props: FoldoutProps) {
        super(props)
        this.props = props
        this.state = {open: this.props.defaultValue ? this.props.defaultValue : false}
    }

    renderChildren() {
        return [
                <hr style={{width:'100%', marginTop: 4, marginBottom: 4}} className='border-inherit border-2 rounded-md'/>,
                this.props.children
        ]
    }

    onClick = () => {
        if(this.props.disabled) return; 
        this.setState({open: !this.state.open})
    }

    render() {
        let triangle: React.CSSProperties = {
            width: 0,
            height: 0,
            borderLeftWidth: 5,
            borderRightWidth: 5,
            borderBottomWidth: 10,
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: 'transparent',
            marginBottom: this.state.open ? -2 : 2,
            transform: this.state.open ? 'rotate(180deg)' : '',

        }

        return (
            <FoldoutContainer style={this.props.style ? this.props.style : {}} className={this.props.className}>
                <div className='flex flex-row w-full items-center justify-center gap-2 hover:brightness-75 active:brightness-[65%]' onClick={this.onClick}>
                    <div className='flex flex-grow'/>
                    <StyledLabel style={this.props.headerStyle} className='select-none cursor-pointer justify-self-center'>{this.props.text}</StyledLabel>
                    <div className='flex flex-grow items-center'>
                        <div style={triangle} className='border-b-text justify-self-end'/>
                    </div>
                </div>
                {this.state.open && this.renderChildren()}
            </FoldoutContainer>
        );
    }
}

export default Foldout;
