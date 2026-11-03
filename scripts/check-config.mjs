import fs from 'node:fs';
import path from 'node:path';
const cfg=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8'));
const src=fs.readFileSync('src/index.html','utf8');
const problems=[];
if (!cfg.plugins?.updater?.pubkey || cfg.plugins.updater.pubkey.includes('HIER_')) problems.push('Updater-Public-Key noch nicht eingerichtet');
if (!cfg.plugins?.updater?.endpoints?.[0] || cfg.plugins.updater.endpoints[0].includes('DEIN_')) problems.push('GitHub-Release-Adresse noch nicht eingerichtet');
if (!cfg.bundle?.createUpdaterArtifacts) problems.push('Update-Artefakte deaktiviert');
for (const token of ['leafling', 'nocturak', 'embrix', 'onlineConnect']) {
 if (!src.includes(token)) problems.push('Fehlender Spielinhalt: '+token);
}
if (!fs.existsSync('src/desktop-updater.js')) problems.push('Update-UI fehlt');
if (process.argv.includes('--structural')) {
 console.log('Strukturprüfung: ', problems.filter(x=>!x.includes('noch nicht eingerichtet')).length ? 'Fehler' : 'OK');
 process.exit(problems.filter(x=>!x.includes('noch nicht eingerichtet')).length ? 1 : 0);
}
if (problems.length) { console.error('Vor dem ersten Release erledigen:\n- '+problems.join('\n- ')); process.exit(1); }
console.log('✓ App- und Update-Konfiguration vollständig.');
