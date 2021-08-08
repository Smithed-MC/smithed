import { fs } from "./Settings";

export function fileExists(path: string) : boolean {
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

export function dirExists(path: string) : boolean {
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

