import React, { useState } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import NewsSvg from '../icons/news.svg'
import HomeSvg from '../icons/home.svg'
import BrowseSvg from '../icons/browse.svg'
import CreateSvg from '../icons/create.svg'
import colorize from 'css-colorize'
import curPalette from '../Palette';
import { useHistory, useRouteMatch } from 'react-router';
import { EventEmitter } from 'events';


const filter = colorize.colorize(curPalette.lightAccent).filter.replace('filter: ','').replace(';','')

const ColoredSvg = styled.img`
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


interface GroupedSidebarOptionProps extends SidebarOptionProps {
   page: string
}


function SidebarOption(props: SidebarOptionProps) {
  return (
    <div style={{height:32, width:32}}>
        <ColoredSvg src={props.img} title={props.hint} style={props.style} onClick={()=>{
            if(props.onClick != null)
                props.onClick()
        }}/>
    </div>
  );
}

export function PageBasedSidebarOption(props: GroupedSidebarOptionProps) {
    const match = useRouteMatch(props.page)

    let style = props.style;
    if(match) {
        if(style == null) style = {}
        const filter = colorize.colorize(curPalette.text).filter.replace('filter: ','').replace(';','')
        style.filter = filter
    }
 
    return (
      <div style={{height:32, width:32}}>
          <ColoredSvg src={props.img} title={props.hint} style={style} onClick={()=>{
              if(props.onClick != null)
                  props.onClick()
          }}/>
      </div>
    );
  }

export default SidebarOption;
