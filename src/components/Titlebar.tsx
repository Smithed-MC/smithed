import '../font.css';
import styled from 'styled-components';
import curPalette from '../Palette';
import { remote, saveSettings } from '../Settings';
import { StyledLabel } from '../Shared';


const remoteModule = window.require('@electron/remote')
const TopbarContainer = styled.div`
  -webkit-app-region: drag;
  height:25;
  width:'100wh';
  background-color: ${curPalette.darkAccent};
`
const ActionButtonSpan = styled.span`
  -webkit-app-region: no-drag;
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: center;
`
const ActionButton = styled.button`
	border: none;
	background: none;
	color: ${curPalette.titlebar};
	font-size: 14px;
	text-align: left;
	vertical-align: center;
	-webkit-user-select: none;
	:hover {
		filter: brightness(85%);
	}
	:active {
		filter: brightness(75%);
	}
`

const CircleButton = styled.div`
	height: 12px;
	width: 12px;  
	font-size: 0;
	font-weight: bold;
	border-radius: 50%;
	border: none;
	background-color: ${curPalette.titlebar};
	color: white;
	text-align: center;
	cursor: pointer;

	:hover {
		filter: brightness(85%);
	}
	:active {
		filter: brightness(75%);
	}
`


function closeWindow() {
	saveSettings()
	remoteModule.app.quit()
}

function minimizeWindow() {
	remoteModule.getCurrentWindow().minimize()
}
function maximizeWindow() {
	const win = remoteModule.getCurrentWindow()
	if (win.isMaximized())
		win.unmaximize()
	else
		win.maximize()
}

function WindowsContent() {
	return (
		<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
			<StyledLabel style={{ padding: '3px', fontSize: '14px', fontFamily: 'Disket-Bold', color: curPalette.titlebar, textAlign: 'left', WebkitUserSelect: 'none', verticalAlign: 'center' }}>
				Smithed <StyledLabel style={{color:curPalette.subText, fontSize:12}}>v{remote.app.getVersion()}</StyledLabel>
			</StyledLabel>
			<li style={{ visibility: 'hidden', flexGrow: 1 }}></li>
			<ActionButtonSpan>
				<ActionButton style={{marginTop:-3}}
					onClick={minimizeWindow}
				>–</ActionButton>
				<ActionButton
					onClick={maximizeWindow}
				>☐</ActionButton>
				<ActionButton
					onClick={closeWindow}
				>⨉</ActionButton>
			</ActionButtonSpan>
		</div>
	)
}
function MacOSContent() {
	return (
		<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingLeft:6 }}>
			<ActionButtonSpan style={{gap:'4px', width:'50px',justifyContent:'left', zIndex: 1}}>
				<CircleButton style={{backgroundColor:'#EB6B63'}}
					onClick={closeWindow}
				/>
				<CircleButton style={{backgroundColor:'#F4BD59'}}
					onClick={minimizeWindow}
				/>
				<CircleButton style={{backgroundColor:'#65C35A'}}
					onClick={maximizeWindow}
				/>
			</ActionButtonSpan>
			<StyledLabel style={{ marginLeft:50, width:'100%', padding: '3px', fontSize: '14px', fontFamily: 'Disket-Bold', color: curPalette.titlebar, textAlign: 'center', verticalAlign: 'center' }}>
				Smithed
			</StyledLabel>
			<StyledLabel style={{color:curPalette.subText, fontSize:12, fontFamily: 'Disket-Bold', width:'100px', textAlign: 'right', alignSelf:'center', verticalAlign: 'center', WebkitUserSelect: 'none', marginRight: 6}}>
				v{remote.app.getVersion()}
			</StyledLabel>
		</div>
	)
}

function Titlebar() {
	return (
		<TopbarContainer>
			{window.process.platform === 'darwin' && MacOSContent()}
			{window.process.platform !== 'darwin' && WindowsContent()}
			<div style={{ height: 5, backgroundColor: curPalette.lightAccent }}></div>
		</TopbarContainer>
	)
}

export default Titlebar