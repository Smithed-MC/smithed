import React from 'react';
import logo from './logo.svg';
import styled from 'styled-components';

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 100wh;
    border-right: 2px solid #5D5377;
    padding: 10px;
`

function Sidebar() {
  return (
    <SidebarContainer>
        <text>
            poop
        </text>
    </SidebarContainer>
  );
}

export default Sidebar;
