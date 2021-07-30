import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import './font.css';
import App from './App';
import Titlebar from './components/Titlebar';
import styled from 'styled-components';
import reportWebVitals from './reportWebVitals';
import { MarkdownToJSX } from 'markdown-to-jsx';
import curPalette, { changePalette } from './Palette';
import { render } from '@testing-library/react';

export const Header1 = styled.h1`
  font-family: Disket-Bold;
  color: ${curPalette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
`
export const Header2 = styled.h2`
  font-family: Disket-Bold;
  color: ${curPalette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
`
export const Header3 = styled.h3`
  font-family: Disket-Bold;
  color: ${curPalette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
`

export const MarkdownOptions = (wrapper? : React.ElementType<any>) : MarkdownToJSX.Options => {
  return {
      wrapper: wrapper, 
      forceWrapper: wrapper != null ? true : false,
      overrides: {
          h1: Header1,
          h2: Header2,
          h3: Header3
      }
  }
}



class Index extends React.Component {
  constructor(props: any) {
    super(props)
  }
  render() {

    return (
      <React.StrictMode>
        <Titlebar/>
        <App/>
      </React.StrictMode>
    )

  }
}

ReactDOM.render(
  <Index/>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
