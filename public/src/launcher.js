const { ipcMain, ipcRenderer } = require('electron')
const execa = require('execa');
const { exec, execFile, spawn } = require('child_process');
const isRunning = require('is-running')
const { dirExists, fileExists, persistentPath } = require('./helper')
const fs = require('fs');
const path = require('path');

const launcherInfo = path.join(persistentPath, '.launcher')

class HandleLauncher {
    launcher = null
    runningProfile = null
    window = null
    cachedSaves = []
    constructor(window) {
        this.window = window
        this.resumeLauncherTracking()

        ipcMain.on('start-launcher',this.startLauncher)
        ipcMain.on('stop-launcher', this.closeLauncher)
        ipcMain.handle('get-launcher-info', () => {
            return {profile: this.runningProfile, running: this.launcher != null && isRunning(this.launcher)}
        })
    }

    writeLauncherInfo = (pid, profile) => {
        fs.writeFileSync(launcherInfo, JSON.stringify({
            pid: pid,
            profile: profile
        }))
    }

    resumeLauncherTracking = () => {
        if(!fileExists(launcherInfo)) return
        const data = JSON.parse(fs.readFileSync(launcherInfo))

        console.log(data)
        if(data.pid != null && data.pid != 0 && isRunning(data.pid)) {
            this.trackLauncher(data.pid, data.profile)
            console.log('resuming tracking')
        }

    }

    getStartCommand = (platform, launcherPath) => {
        let cmd =
        platform == 'win32' ? `"${launcherPath}"` :
            platform == 'linux' ? `${launcherPath}` :
                platform == 'darwin' ? `open -a ${launcherPath}` : `./${launcherPath}`
        return cmd
    } 

    trackLauncher = (pid, profile) => {
        this.launcher = pid
        this.runningProfile = profile

        this.writeLauncherInfo(pid, profile)
        this.loop = setInterval(this.isRunning, 200)
    }

    startLauncher = async (event, profile, launcherPath) => {
        const platform = process.platform

        if (!fileExists(launcherPath) && platform !== 'darwin') {
            window.webContents.send('invalid-launcher')
        } else {
            if (platform === 'darwin') {
                var pid = spawn('open', ['-a', 'Minecraft', '--args', '--workdir', profile.directory]).pid
            } else {
                const cmd = this.getStartCommand(platform, launcherPath)
                var pid = spawn(launcherPath, ['--workdir', profile.directory], {detached: true}).pid

                
            }

            this.trackLauncher(pid, profile)
        }

    }



    closeLauncher = () => {
        if(this.launcher != null && this.launcher != 0 && isRunning(this.launcher))
            process.kill(this.launcher, 1)
        this.launcher = null

        this.window.webContents.send('update-profile', '')
        this.runningProfile = null

        this.writeLauncherInfo(null, null)

        console.log('[Heartbeat] Game closed!')
        clearInterval(this.loop)
    }

    isRunning = () => {
        if (isRunning(this.launcher) && this.runningProfile != null) {
            this.window.webContents.send('update-profile', this.runningProfile.name)
        }
        else {
            this.closeLauncher()
        }
    }
}

module.exports = { HandleLauncher }