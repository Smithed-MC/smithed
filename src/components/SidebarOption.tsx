import React from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import NewsSvg from '../icons/news.svg'
import HomeSvg from '../icons/home.svg'
import BrowseSvg from '../icons/browse.svg'
import CreateSvg from '../icons/create.svg'
import colorize from 'css-colorize'
import curPalette from '../Palette';


const filter = colorize.colorize(curPalette.lightAccent).filter.replace('filter: ','').replace(';','')

const WhiteImage = styled.img`
    height: 32px;
    width: 32px;
    // filter: invert(47%) sepia(99%) saturate(5318%) hue-rotate(211deg) brightness(96%) contrast(91%);
    filter: ${filter};
    -webkit-user-select: none;
    -webkit-user-drag: none;
    :hover {
        filter: ${filter} brightness(80%);
    }
    :active {
        filter: ${filter} brightness(70%);
    }
`

interface SidebarOptionProps {
    img: string
    hint: string
    onClick?: ()=>void
    style?: React.CSSProperties
}

function UpdateBrightness(e : EventTarget, b : number) {
    const i = e as HTMLImageElement
    i.style.filter = `${filter} brightness(${b-0.04})`
}


function SidebarOption(props: SidebarOptionProps) {
  return (
    <div style={{height:32, width:32}}>
        <WhiteImage src={props.img} title={props.hint} style={props.style} onClick={()=>{
            if(props.onClick != null)
                props.onClick()
        }}/>
    </div>
  );
}
// onMouseOver={(e)=>{
//     UpdateBrightness(e.target, 0.85)
// }} onMouseLeave ={(e)=>{
//     UpdateBrightness(e.target, 1)
// }} onMouseDown = {(e) => {
//     UpdateBrightness(e.target, 0.5)
//     if(props.onClick != null)
//         props.onClick()
// }} onMouseUp = {(e) => {
//     UpdateBrightness(e.target, 0.85)
// }}
export default SidebarOption;
