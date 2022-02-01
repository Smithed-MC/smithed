import DefaultDatapackBuilder from 'slimeball/out/datapack'
import DefaultResourcepackBuilder from 'slimeball/out/resourcepack';
import * as fs from 'fs';
import * as path from 'path';
import { BuildResult } from 'slimeball/out/util';
import download from 'download';
import JSZip from 'jszip';
import { Insert, Merge, Rule } from './rules';
import { MetaData } from './metadata';
import { WeldDatapackBuilder } from './datapack';

// function testDatapacks() {
//     const versionUrl = 'https://launcher.mojang.com/v1/objects/8d9b65467c7913fcf6f5b2e729d44a1e00fde150/client.jar' // 1.17.1

//     download(versionUrl, 'temp/', { filename: "version.jar" }).then((buffer: Buffer) => {
//         const jar = new JSZip();
//         jar.loadAsync(buffer).then(() => {
//             const ddb = new WeldDatapackBuilder(jar);
//             const folderPath = 'packs/dp'

//             let buffers: [string, Buffer][] = []
//             fs.readdirSync(folderPath).forEach(v => {
//                 if (path.extname(v) === '.zip') {
//                     let buffer = fs.readFileSync(path.join(folderPath, v))
//                     buffers.push([v, buffer]);
//                 }
//             })

//             ddb.loadBuffers(buffers).then(() => {
//                 ddb.build((result: BuildResult) => {
//                     result.zip.generateAsync({ type: "arraybuffer" }).then(v => {
//                         fs.writeFileSync('datapack.zip', Buffer.from(v));
//                         console.log('Datapack Conflicts: ' + result.conflicts)
//                     })
//                 })
//             })
//         })
//     })
// }
