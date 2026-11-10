import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await fs.readFile(path.join(root,'work/effects-20261105/accepted-manifest.json'),'utf8'));
let changed=0;
for(const item of manifest.files){
 let actual='MISSING';try{actual=crypto.createHash('sha256').update(await fs.readFile(path.join(root,item.path))).digest('hex')}catch{}
 if(actual!==item.sha256){changed++;console.log('CHANGED',item.path)}
}
console.log(changed?`${changed} file(s) differ from the accepted effects pass.`:`All ${manifest.files.length} checked files match the accepted effects pass.`);
process.exitCode=changed?1:0;
