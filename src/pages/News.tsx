import React from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import '../font.css'
import Sidebar from '../components/NewsArrow';
import { Header1, Header2, Header3, MarkdownOptions } from '..';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import img from '../images/img.png'
import img2 from '../images/img2.png'
import img3 from '../images/img3.png'
import curPalette from '../Palette';
import LeftArrow from '../icons/left_arrow.svg'
import NewsArrow from '../components/NewsArrow';

const NewsContainer = styled.div`
    display: flex;
    align-items: top;
    flex-direction: row;
    width:100%;
    min-height: 40%;
    height: 60%;
    max-height: 70%;
    gap:16px;
    -webkit-user-drag: none;
    margin-right:4px;
    margin-left:4px;
`
const NewsSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`

const ArticleBody = styled.text`
    overflow-y: auto;
    width: 60%; 
    min-height: 30%; 
    text-align: left;
    color: ${curPalette.text};
    font-family: Consolas;
    background-color: ${curPalette.darkBackground};
    border-radius: 8px;
    -webkit-user-drag: none;
    margin-bottom: 12px;
    padding: 8px 16px;
`

const txt = `
Added:\n
<p style="color: #69D858;">
- Proper **1.18 category**\n
</p>
Removed:\n
<p style="color: #BA2A2A;">
- Removed old **1.18 Snapshots** category\n
</p>
<br/><br/><br/> This update was
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really
really really really really really really really really really really really really really really really really really really long
`

const NewsImg = styled.img`
    width: 100%;
    resise: none;
    imageRender: crisp-edges;
    overflow: hidden;
    background-color: ${curPalette.darkBackground};
    border-radius: 8px;
    border: 6px solid ${curPalette.darkBackground};
    maxHeight: 100%;
`


function News() {
  return (
    <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'-10px'}}>
        <Header1>Latest News</Header1>
        <NewsContainer>
            <NewsSection style={{flex:'25%', padding:'6px', marginLeft: 4}}>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                    <NewsArrow/>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center', marginTop:-75}}>
                        <Header2>Previous News</Header2>
                        <NewsImg src={img}/>
                    </div>
                </div>
            </NewsSection>
            <NewsSection style={{flex:'50%', padding:'6px'}}>
                <NewsImg src={img2}/>
            </NewsSection>
            <NewsSection style={{flex:'25%', padding:'6px', marginRight: 4}}>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center', marginTop:-75}}>
                        <Header2>Next News</Header2>
                        <NewsImg src={img3}/>
                    </div>
                    <NewsArrow transform='rotate(180deg)'/>
                </div>
            </NewsSection>

        </NewsContainer>
        <Header2>Updated to 1.18</Header2>
        <Header3 style={{marginTop:-20, color:curPalette.subText}}>hahahaha mountians</Header3>
        <Markdown options={MarkdownOptions(ArticleBody)}>
            {txt}
        </Markdown>
    </div>
  );
}

export default News;
