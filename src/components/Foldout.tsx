import React from 'react';
import styled from 'styled-components';
import curPalette from '../Palette'
import { ColumnDiv, RowDiv } from '..';

export interface FoldoutProps {
    text: string,
    style?: React.CSSProperties,
    children?: any,
    defaultValue?: boolean
    disabled?: boolean
}

const FoldoutContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    -webkit-user-drag: none;
    background-color: ${curPalette.darkBackground};
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
        return (
            <ColumnDiv style={{width:'100%'}}>
                <hr style={{width:'100%', marginTop:-1, borderColor: curPalette.subText}}/>
                {this.props.children}
            </ColumnDiv>
        )
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
            borderBottomColor: curPalette.text,
            marginBottom: this.state.open ? -2 : 2,
            transform: this.state.open ? 'rotate(180deg)' : ''
        }

        return (
            <FoldoutContainer style={this.props.style ? this.props.style : {}}>
                <FoldoutHeader style={{alignItems:'center', gap:8}} onClick={this.onClick}>
                    <label style={{color:curPalette.text, fontFamily:'Inconsolata', WebkitUserSelect:'none'}}>{this.props.text}</label>
                    <div style={triangle}/>
                </FoldoutHeader>
                {this.state.open && this.renderChildren()}
            </FoldoutContainer>
        );
    }
}

export default Foldout;
