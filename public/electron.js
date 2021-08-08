const { app, BrowserWindow, ipcRenderer, ipcMain } = require('electron')
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

      this.cacheSaves()
    })

    ipcMain.on('stop-launcher', ()=>{
      this.launcher.kill()
    })
  }

  copyDatapacks(dest) {
    if(!dirExists(dest))
      fs.mkdirSync(dest)

    const datapacks = path.join(this.runningProfile.directory, 'datapacks')
    fs.readdirSync(datapacks).forEach(d => {
      fs.copyFile(path.join(datapacks, d), path.join(dest, d), ()=>{})
    })
  }

  cacheSaves() {
    const savesFolder = path.join(this.runningProfile.directory, 'saves')
    if(dirExists(savesFolder)) {
      fs.readdirSync(savesFolder).forEach(d => {this.cachedSaves.push(path.join(savesFolder, d))})

      this.cachedSaves.forEach(d => {
        this.copyDatapacks(path.join(d, 'datapacks'))
      })
    } else {
      fs.mkdirSync(path.join(this.runningProfile.directory, 'saves'))
    }
  }


  isRunning = () => {
    if(isRunning(this.launcher.pid)) {
      this.window.webContents.send('update-profile', this.runningProfile.name)

      const savesFolder = path.join(this.runningProfile.directory, 'saves')
      let tempSaves = fs.readdirSync(savesFolder)

      tempSaves = tempSaves.filter(val => !this.cachedSaves.includes(path.join(savesFolder, val)))
      if(tempSaves.length > 0) {
        tempSaves.forEach(d => {
          d = path.join(savesFolder, d)
          console.log(d)
          this.copyDatapacks(path.join(d, 'datapacks'))
          
          this.cachedSaves.push(d)
        })
      }
    }
    else {
      this.window.webContents.send('update-profile', '')
      this.runningProfile = null
      console.log('[Heartbeat] Game closed!')
      clearInterval(this.loop)
    }
  }
}
