import styled from 'styled-components';
import { ReactComponent as LeftArrow} from '../icons/left_arrow.svg'


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
    <div>
        <LeftArrow className={`fill-text hover:opacity-75 active:opacity-50 h-[100px] w-[100px]`} fill='none' stroke='0' style={{width:100,transform:props.transform}} 
        onClick={props.onClick}/>
    </div>
  );
}

export default NewsArrow;
