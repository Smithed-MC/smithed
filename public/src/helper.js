const fs = require('fs')
const {app} = require('electron')
const path = require('path')
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

const persistentPath = path.join(app.getPath('appData'),'smithed')

module.exports = {fileExists, dirExists, persistentPath}