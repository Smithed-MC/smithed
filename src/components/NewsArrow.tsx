import styled from 'styled-components';
import LeftArrow from '../icons/left_arrow.svg'


const Image = styled.img`
    filter: invert(100%);
    -webkit-user-select: none;
    -webkit-user-drag: none;
`

interface NewsArrowProps {
    onClick?: ()=>void
    transform?: string
}

function UpdateBrightness(e : EventTarget, b : number) {
    const i = e as HTMLImageElement
    i.style.filter = `invert(100%) brightness(${b-0.04})`
}

function NewsArrow(props: NewsArrowProps) {
  return (
    
    <Image src={LeftArrow} style={{width:'100px',transform:props.transform}} onMouseOver={(e)=>{
        UpdateBrightness(e.target, 0.85)
    }} onMouseLeave ={(e)=>{
        UpdateBrightness(e.target, 1)
    }} onMouseDown = {(e) => {
        UpdateBrightness(e.target, 0.5)
    }} onMouseUp = {(e) => {
        UpdateBrightness(e.target, 0.85)
    }} onClick={props.onClick}/>
    
  );
}

export default NewsArrow;
