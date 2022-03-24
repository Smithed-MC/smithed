import React, { SVGProps } from 'react';
import styled from 'styled-components';
import colorize from 'css-colorize'
import palette from '../shared/Palette';
import { useRouteMatch } from 'react-router';


const filter = colorize.colorize(palette.lightAccent).filter.replace('filter: ', '').replace(';', '')

const ColoredSvg = styled.img`
    height: 32px;
    width: 32px;
    // filter: invert(47%) sepia(99%) saturate(5318%) hue-rotate(211deg) brightness(96%) contrast(91%);
    -webkit-user-select: none;
    -webkit-user-drag: none;
    :hover {
        filter: brightness(80%);
    }
    :active {
        filter: brightness(70%);
    }
`

interface SidebarOptionProps {
    img: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>
    hint: string
    onClick?: () => void
    style?: React.CSSProperties
}


interface GroupedSidebarOptionProps extends SidebarOptionProps {
    page: string
}


function SidebarOption(props: SidebarOptionProps) {
    return (
        <div style={{ height: 32, width: 32 }}>
            <props.img title={props.hint} style={props.style} className={`fill-lightAccent hover:brightness-75 active:brightness-50 h-[32px] w-[32px] cursor-pointer`} fill='none' stroke='0' onClick={() => {
                if (props.onClick != null)
                    props.onClick()
            }} />
        </div>
    );
}

export function PageBasedSidebarOption(props: GroupedSidebarOptionProps) {
    const match = useRouteMatch(props.page)
    let style = props.style;

    return (
        <div style={{ height: 32, width: 32 }}>
            <props.img title={props.hint} style={style} className={(match ? 'fill-text' : `fill-lightAccent hover:brightness-75 active:brightness-50`) + ' cursor-pointer'} fill='none' stroke='0' onClick={() => {
                if (props.onClick != null)
                    props.onClick()
            }} />
        </div>
    );
}

export default SidebarOption;
