import React, { version } from 'react';
import styled from 'styled-components';
import curPalette from '../Palette'
interface PackDisplayProps {
    name: string,
    version: string,
    author: string,
    img?: string
}

interface PackDisplayState {
    mouseOver:boolean
}

const PackDisplayDiv = styled.div`
    height:300px;
    width:200px;
    background-color: ${curPalette.darkBackground};
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const PackPlayButton = styled.button`
    width: 90%;
    height: 60%;
    font-family: Disket-Bold;
    font-size: 24px;
    margin-top: 12px;
    color: ${curPalette.text};
    border: none;
    background-color: ${curPalette.lightAccent};
`

const PackNameLabel = styled.label`
    width: 100%;
    text-align: 'left';
    color: ${curPalette.text};
    font-family: Consolas;
    font-size: 20px;
`

class PackDisplay extends React.Component {
    props: PackDisplayProps
    state: PackDisplayState
    constructor(props: PackDisplayProps) {
        super(props)
        this.props = props
        this.state = {mouseOver: false}
    }
    setMouseOver(value: boolean) {
        this.setState({mouseOver: value})
    }

    setButtonBrightness(e: React.MouseEvent, b: number) {
        (e.target as HTMLButtonElement).style.filter = `brightness(${b})`
    }

    render() {
        return (
            <PackDisplayDiv onMouseEnter={() => this.setMouseOver(true)} onMouseLeave={() => this.setMouseOver(false)}>
                <div style={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
                    <img style={{width:192,height:192,backgroundColor:curPalette.darkAccent}}/>
                    <label style={{width:'40%',position:'relative',textAlign:'center', top:-180, left:45, backgroundColor:'rgba(0.140625,0.13671875,0.16796875,0.25)', color:curPalette.text, fontFamily:'Consolas'}}>{this.props.version}</label>
                </div>
                <div style={{width:'90%', flexGrow:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {!this.state.mouseOver && 
                        <PackNameLabel>
                            <b>{this.props.name}</b>
                        </PackNameLabel>}
                    {!this.state.mouseOver &&
                        <PackNameLabel style={{color:curPalette.subText, fontSize:18}}>
                            {`by ${this.props.author}`}
                        </PackNameLabel>}
                    {this.state.mouseOver && <PackPlayButton 
                        onMouseEnter={e=>this.setButtonBrightness(e, 0.85)} 
                        onMouseDown={e=>this.setButtonBrightness(e, 0.65)} 
                        onMouseUp={e=>this.setButtonBrightness(e, 1)} 
                        onMouseLeave={e=>this.setButtonBrightness(e, 1)}>
                            PLAY
                        </PackPlayButton>}
                </div>
            </PackDisplayDiv>  
        );
    }
}

export default PackDisplay;
