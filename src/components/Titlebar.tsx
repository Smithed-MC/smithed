import '../font.css';
import styled from 'styled-components';
import palette from '../shared/Palette.js';
import { remote, saveSettings } from '../Settings';
import { StyledLabel } from '../Shared';


const remoteModule = window.require('@electron/remote')
const TopbarContainer = styled.div`
  -webkit-app-region: drag;	
  height:25;
  width:'100wh';
  background-color: ${palette.darkAccent};
`
const ActionButtonSpan = styled.span`
  -webkit-app-region: no-drag;
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: center;
`
const ActionButton = styled.button`
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
	background-color: ${palette.titlebar};
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
		<div className='flex flex-row justify-around px-1 items-center h-[22px]'>
			<label className='p-[3px] text-xs font-[Disket-Bold] text-titlebar text-left select-none'>
				Smithed <label className='font-[Inconsolata] text-xs text-subText'>v{remote.app.getVersion()}</label>
			</label>
			<li style={{ visibility: 'hidden', flexGrow: 1  }}></li>
			<div className='flex justify-evenly items-center webkit-no-drag gap-4'>
				<button className={`mt-[-2px] text-titlebar text-left text-l select-none cursor-pointer hover:opacity-75 active:opacity-50`}
					onClick={minimizeWindow}
				>–</button>
				<button className={`text-titlebar text-left text-l select-none cursor-pointer hover:opacity-75 active:opacity-50`}
					onClick={maximizeWindow}
				>☐</button>
				<button className={`text-titlebar text-left text-l select-none cursor-pointer hover:opacity-75 active:opacity-50`}
					onClick={closeWindow}
				>⨉</button>
			</div>
		</div>
	)
}
function MacOSContent() {
	return (
		<div className='flex flex-row justify-around px-1 items-center h-[22px]'>
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
			<StyledLabel style={{ marginLeft:50, width:'100%', padding: '3px', fontSize: '14px', fontFamily: 'Disket-Bold', color: palette.titlebar, textAlign: 'center', verticalAlign: 'center' }}>
				Smithed
			</StyledLabel>
			<StyledLabel style={{color:palette.subText, fontSize:12, fontFamily: 'Disket-Bold', width:'100px', textAlign: 'right', alignSelf:'center', verticalAlign: 'center', WebkitUserSelect: 'none'}}>
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
			<div style={{ height: 5, backgroundColor: palette.lightAccent }}></div>
		</TopbarContainer>
	)
}

export default Titlebar