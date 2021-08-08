const fs = require('fs')

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

