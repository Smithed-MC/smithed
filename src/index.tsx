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
import Login from './pages/Login';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { fs, pathModule, remote, settingsFolder } from './Settings';
import { fileExists } from './FSWrapper';
import { Profile } from './pages/Home';
import { collectUserData } from './UserData';
import { PackEntry } from './pages/Browse';
import { Enumerable } from 'linq-es5/lib/enumerable';
import { asEnumerable } from 'linq-es5';
const { ipcRenderer } = window.require('electron');

export const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDX-vLCBhO8StKAxnpvQ2EW8lz3kzYn4Qk",
  authDomain: "mc-smithed.firebaseapp.com",
  projectId: "mc-smithed",
  storageBucket: "mc-smithed.appspot.com",
  messagingSenderId: "574184244682",
  appId: "1:574184244682:web:498d168c09b39e4f0d7b33",
  measurementId: "G-40SRKC35Z0"
})

firebaseApp.auth().setPersistence('session')

let startPage: 'login' | 'app' = 'login'


let ignoreStateChange = false
export function setIgnoreStateChange(val: boolean) {ignoreStateChange = val}
firebaseApp.auth().onAuthStateChanged((user)=>{
  if(user != null && !ignoreStateChange) {
    setFirebaseUser(user)
    collectUserData()
    Index.instance.setState({page: 'app'})
  }
})


export let firebaseUser: firebase.User | null
export async function setFirebaseUser(user: firebase.User | null) {
  firebaseUser = user
  if(firebaseUser != null) {
    const data = await (await (firebaseApp.database().ref(`users/${firebaseUser.uid}`).get())).val()
    userData.displayName = data.displayName
    userData.role = data.role
    userData.uid = firebaseUser.uid
  }
}

interface UserData {
  uid: string,
  displayName: string,
  role: string
  profiles: Profile[],
  packs: Enumerable<PackEntry>,
  modsDict: {[key: string]: {[key: string]: string}}
  versions: string[]
}

export let userData: UserData = {uid:'',displayName:'',role:'',profiles:[], modsDict: {}, versions: [], packs: asEnumerable([])}
export function setUserData(data: UserData) {
  userData = data
}


export const TabButton = styled.button`
  font-family: Disket-Bold;
  color: ${curPalette.text};
  background: none;
  border: none;
  font-size: 16px;
  -webkit-user-select: none;
  
  :hover {
    filter: brightness(85%);
  }
  :active {
    filter: brightness(75%);
  }
`

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

export const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-user-drag: none;
`
export const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  -webkit-user-drag: none;
`

export const StyledInput = styled.input`
    padding: 8px;
    margin-bottom: 1rem;
    background-color: ${curPalette.darkBackground};
    border: none;
    color: ${curPalette.text};
    border-radius: 8px;
    font-family: Inconsolata;
    &::placeholder {
        color: ${curPalette.subText}
    }
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


interface IndexState {
  page: 'login' | 'app',
  refresh: number
}

export class Index extends React.Component {
  static instance : Index
  state : IndexState
  constructor(props: any) {
    super(props)
    this.state = {page: startPage, refresh: 0}
    Index.instance = this
  }
  
  render() {

    return (
      <React.StrictMode>
        <Titlebar/>
        {this.state.page == 'login' && <Login onSuccess={()=>{
          collectUserData()
          this.setState({page: 'app'})
        }}/>}
        {this.state.page == 'app' && <App/>}
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
