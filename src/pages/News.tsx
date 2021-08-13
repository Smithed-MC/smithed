import React from 'react';
import styled from 'styled-components';
import '../font.css'
import { firebaseApp, Header1, Header2, Header3, MarkdownOptions } from '..';
import Markdown from 'markdown-to-jsx';
import curPalette from '../Palette';
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
    font-family: Inconsolata;
    background-color: ${curPalette.darkBackground};
    border-radius: 8px;
    -webkit-user-drag: none;
    margin-bottom: 12px;
    padding: 8px 16px;
`


const NewsImg = styled.img`
    width: 100%;
    resise: none;
    imageRender: crisp-edges;
    overflow: hidden;
    background-color: ${curPalette.darkBackground};
    border-radius: 8px;
    border: 6px solid ${curPalette.darkBackground};
    minHeight: 56%;
    maxHeight: 100%;
    -webkit-user-select: none;
    -webkit-user-drag: none;
`

interface Article{ 
    title: string,
    content: string,
    description: string,
    image: string
}

class News extends React.Component {
    articlesLocation
    state: {current: number, articles: Article[]}
    constructor(props: any) {
        super(props)
        this.articlesLocation = firebaseApp.database().ref('/news/')

        this.articlesLocation.get().then((snapshot) => {
            let articles: Article[] = snapshot.val()
            this.setState({current: (articles.length - 1), articles: articles})
        })
        this.state = {current: 0, articles: []}
    }

    renderPrevious(prevArticle: Article | null) {
        if(prevArticle === null) {
            return(
                <NewsSection style={{flex:'25%', padding:'6px', marginLeft: 4}}></NewsSection>
            )
        }
        return(
            <NewsSection style={{flex:'25%', width:'25%', padding:'6px', marginLeft: 4}}>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                    <NewsArrow onClick={()=>{
                        let c = this.state.current - 1
                        if(c >= 0) {
                            this.setState({current: c})
                        }
                    }}/>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center', marginTop:-75}}>
                        <Header2>Previous</Header2>
                        <NewsImg src={prevArticle.image}/>
                    </div>
                </div>
            </NewsSection>
        )
    }
    renderNext(nextArticle: Article | null) {
        if(nextArticle === null) {
            return(
                <NewsSection style={{flex:'25%', padding:'6px', marginRight: 4}}></NewsSection>
            )
        }
        return (
            <NewsSection style={{flex:'25%', padding:'6px', marginRight: 4}}>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center', marginTop:-75}}>
                        <Header2>Next</Header2>
                        <NewsImg src={nextArticle.image}/>
                    </div>
                    <NewsArrow transform='rotate(180deg)' onClick={()=>{
                        let c = this.state.current + 1
                        if(c < this.state.articles.length) {
                            this.setState({current: c})
                        }
                    }}/>
                </div>
            </NewsSection>
        )
    }
    render() {
        if(this.state.articles.length < 1) return (<div></div>)

        let prevArticle = this.state.current - 1 >= 0 ? this.state.articles[this.state.current - 1] : null
        let curArticle = this.state.articles[this.state.current] 
        let nextArticle = this.state.current + 1 < this.state.articles.length ? this.state.articles[this.state.current + 1] : null

        return (
            <div style={{flexGrow:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'-10px'}}>
                <Header1>{this.state.current === this.state.articles.length-1 ? 'Latest News' : 'Older News'}</Header1>
                <NewsContainer>
                    {this.renderPrevious(prevArticle)}
                    <NewsSection style={{flex:'50%', padding:'6px'}}>
                        <NewsImg src={curArticle.image}/>
                    </NewsSection>
                    {this.renderNext(nextArticle)}
                </NewsContainer>
                <Header2>{curArticle.title}</Header2>
                <Header3 style={{marginTop:-20, color:curPalette.subText}}>{curArticle.description}</Header3>
                <Markdown options={MarkdownOptions(ArticleBody)}>
                    {curArticle.content}
                </Markdown>
            </div>
        );
    }
}

export default News;
