import fs from 'node:fs';
const version=process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
 console.error('Aufruf: npm run set-version -- 0.1.1'); process.exit(1);
}
const cf='src-tauri/tauri.conf.json';
const c=JSON.parse(fs.readFileSync(cf,'utf8'));c.version=version;
fs.writeFileSync(cf,JSON.stringify(c,null,2)+'\n');
const pf='package.json';const p=JSON.parse(fs.readFileSync(pf,'utf8'));p.version=version;
fs.writeFileSync(pf,JSON.stringify(p,null,2)+'\n');
const cargo='src-tauri/Cargo.toml';
let t=fs.readFileSync(cargo,'utf8'); t=t.replace(/(\[package\][\s\S]*?\nversion = ")[^"]+("\n)/,`$1${version}$2`);
fs.writeFileSync(cargo,t);
console.log('Vortex Battles-Version gesetzt:',version);
