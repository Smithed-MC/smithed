import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import './font.css';
import App from './App';
import Titlebar from './components/Titlebar';
import styled from 'styled-components';
import reportWebVitals from './reportWebVitals';
import { MarkdownToJSX } from 'markdown-to-jsx';
import palette from './shared/Palette.js';
import Login from './pages/Login';
import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import { remote } from './Settings';
import { Profile } from './pages/Home';
import { collectUserData } from './UserData';
import { Enumerable } from 'linq-es5/lib/enumerable';
import { asEnumerable } from 'linq-es5';
import Download from './pages/Download';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import { HashRouter } from 'react-router-dom';
import EventEmitter from 'events';
import { PackEntry } from './Pack';
import { database, firebaseApp } from './shared/ConfigureFirebase';


const { ipcRenderer } = window.require('electron');

let startPage: 'login' | 'app' | 'update' = 'login'


let ignoreStateChange = false
export function setIgnoreStateChange(val: boolean) { ignoreStateChange = val }
firebaseApp.auth().onAuthStateChanged((user) => {
	if (user != null && !ignoreStateChange) {
		console.log(user)
		setFirebaseUser(user)
		collectUserData()
		remote.getCurrentWindow().webContents.send('user-data-changed')
	}
})


export let firebaseUser: firebase.User | null
export async function setFirebaseUser(user: firebase.User | null) {
	firebaseUser = user
	if (firebaseUser != null) {
		const data = await (await (database.ref(`users/${firebaseUser.uid}`).get())).val()
		if (data != null) {
			userData.displayName = data.displayName
			userData.role = data.role
			userData.uid = firebaseUser.uid
		}
	}
}

interface UserData {
	uid: string,
	displayName: string,
	role: string
	profiles: Profile[],
	packs: Enumerable<PackEntry>,
	modsDict: { [key: string]: { [key: string]: string } }
	versions: string[],
	discordWebhook?: string,
	ref?: firebase.database.Reference
}

export let userData: UserData = { uid: '', displayName: '', role: '', profiles: [], modsDict: {}, versions: [], packs: asEnumerable([]) }
export function setUserData(data: UserData) {
	userData = data
	userData.ref = database.ref(`/users/${userData.uid}`)

	remote.getCurrentWindow().webContents.send('user-data-changed')
}


export const Header1 = styled.h1`
  font-family: Disket-Bold;
  color: ${palette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
  font-size: 2.25rem;
`
export const Header2 = styled.h2`
  font-family: Disket-Bold;
  color: ${palette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
  font-size: 1.875rem;
`
export const Header3 = styled.h3`
  font-family: Disket-Bold;
  color: ${palette.text}; 
  -webkit-user-drag: none;
  -webkit-user-select: none;
  font-size: 1.25rem;
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
    background-color: ${palette.darkBackground};
    border: none;
    color: ${palette.text};
    border-radius: 8px;
    font-family: Inconsolata;
    &::placeholder {
        color: ${palette.subText};
		-webkit-user-select: none;
    }
    :disabled {
      color: ${palette.subText};
      -webkit-user-select: none;
    }
`

interface IndexState {
	versionFound: string
}

export const mainEvents = new EventEmitter()


export class Index extends React.Component {
	static instance: Index
	state: IndexState
	props: RouteComponentProps
	returnPage: string = '/app'
	constructor(props: RouteComponentProps) {
		super(props)
		this.props = props
		this.state = { versionFound: '' }
		Index.instance = this

		ipcRenderer.on('go-to-page', (e: any, path: string) => {
			console.log(path);
			if (firebase.auth().currentUser != null) {
				this.props.history.push(path);
			} else {
				this.returnPage = path;
			}
		})
	}


	componentDidMount() {
		document.addEventListener('keydown', event => {
			if (!event.repeat)
				mainEvents.emit('key-press', event)
		});
	}

	goToDownload(version: string) {
		this.setState({ versionFound: version })
		this.props.history.push('/update')
	}

	render() {
		console.log(this.props.location)
		return (
			<React.StrictMode>
				<Titlebar />
				<Switch>
					<Route exact path='/' component={Login} />
					<Route path='/app' component={App} />
					<Route path='/update'>
						<Download version={this.state.versionFound} />
					</Route>
				</Switch>
			</React.StrictMode>
		)

	}
}

const IndexWithRouter = withRouter(Index)

ReactDOM.render(
	<HashRouter>
		<IndexWithRouter />
	</HashRouter>
	,
	document.getElementById('root')
);

ipcRenderer.on('upload-news', (e: any, article: any, data: any) => {
	database.ref(`news/${article}`).set(data)
})
ipcRenderer.on('message', (e: any, message: string) => {
	console.log(message)
})
ipcRenderer.on('update-found', (e: any, version: string) => {
	Index.instance.goToDownload(version)
})

remote.app.on('web-contents-created', (event: any, contents: any) => {
	contents.on('will-navigate', (event: any, navigationUrl: string) => {
		event.preventDefault();
		const parsedUrl = new URL(navigationUrl)
		if (["https:", "http:", "smithed:"].includes(parsedUrl.protocol)) {
			remote.shell.openExternal(navigationUrl)
		}
	})
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
