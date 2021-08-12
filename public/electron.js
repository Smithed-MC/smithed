const { app, BrowserWindow, ipcRenderer, ipcMain, globalShortcut } = require('electron')
require('@electron/remote/main').initialize()

const path = require('path')

const isDev = require('electron-is-dev')
const execa = require('execa');
const { exec } = require('child_process');
const isRunning = require('is-running')

const fs = require('fs')

let win = null

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    frame: false,
    title: 'SMITHED'
  })

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  
  globalShortcut.register('Alt+CommandOrControl+N', () => {
    const settingsFolder = path.join(app.getPath('appData'), 'smithed')
    const fpath = path.join(settingsFolder, 'news.md')
    const raw = fs.readFileSync(fpath, {encoding:'utf8'})
    const lines = raw.split('\n')
  
    let meta = {}
    for(var i = 0; i < lines.length; i++) {
      if(lines[i].trim() == '#EndMeta')
        break;
      
      const colon = lines[i].indexOf(':')
      const start = lines[i].substring(0, colon)
      const arg = lines[i].substring(colon+1)
      
      meta[start.trim()] = arg.trim()
    }
    lines.splice(0, i+1)
  
    win.webContents.send('upload-news', meta['article'], {
      image: meta['image'],
      title: meta['title'],
      description: meta['description'],
      content: lines.join('\n')
    })
  })

  new HandleLauncher(win)
}


app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})



function fileExists(path) {
  try {
      if(fs.statSync(path).isFile()) {
          return true;
      } else {
          return false;
      }
  } catch {
      return false;
  }
}

function dirExists(path) {
  try {
      if(fs.statSync(path).isDirectory()) {
          return true;
      } else {
          return false;
      }
  } catch {
      return false;
  }
}



class HandleLauncher {
  launcher = null
  runningProfile = null
  window = null
  cachedSaves = []
  constructor(window) {
    this.window = window

    ipcMain.on('start-launcher', async (event, profile)=>{
      this.runningProfile = profile
      console.log(`--workdir ${profile.directory}`)
      this.launcher = exec(`"C:\\Program Files (x86)\\Minecraft Launcher\\MinecraftLauncher.exe" --workdir ${profile.directory}`)

      this.loop = setInterval(this.isRunning, 200)
    })

    ipcMain.on('stop-launcher', ()=>{
      this.launcher.kill()
    })
  }

  isRunning = () => {
    if(isRunning(this.launcher.pid)) {
      this.window.webContents.send('update-profile', this.runningProfile.name)

    }
    else {
      this.window.webContents.send('update-profile', '')
      this.runningProfile = null
      console.log('[Heartbeat] Game closed!')
      clearInterval(this.loop)
    }
  }
}
