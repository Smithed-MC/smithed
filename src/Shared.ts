import styled from 'styled-components'
import palette from './shared/Palette'

export const StyledLabel = styled.label`
  	color: var(--text);
	font-family: Inconsolata;
`

export const StyledButton = styled.button`
    height:32px;
    width:128px;
    color: var(--text);
    background-color: var(--lightAccent);
    font-size:20px;
    border: none;
    font-family: Disket-Bold;
    -webkit-user-select: none;
    cursor: pointer;
    
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`
export const ButtonLabel = styled(StyledLabel)`
    cursor: pointer;
    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`