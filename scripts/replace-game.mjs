import fs from 'node:fs';
import path from 'node:path';
const input=process.argv[2];
if (!input || !fs.existsSync(input)) {
  console.error('Aufruf: npm run replace-game -- "C:\\Pfad\\VortexNeueVersion.html"');
  process.exit(1);
}
let html=fs.readFileSync(input,'utf8');
if (!html.includes('</body>') || !html.includes('onlineConnect') || !html.includes('nocturak')) {
 console.error('Das sieht nicht wie eine vollständige Vortex-Battles-HTML aus. Abbruch.'); process.exit(1);
}
if (!html.includes('desktop-updater.js')) {
 html=html.replace('</body>', '<script type="module" src="/desktop-updater.js"></script>\n</body>');
}
html=html.replace("localStorage.getItem(ONLINE_SERVER_KEY)||''", "localStorage.getItem(ONLINE_SERVER_KEY)||'https://vortex-battles-online.vortex-battles-online.workers.dev'");
const out=path.join('src','index.html');
fs.writeFileSync(out,html,'utf8');
console.log('✓ Spielversion ersetzt. Desktop-Updater und Cloudflare-Standardadresse bleiben erhalten.');
console.log('Nächster Schritt: npm run set-version -- 0.1.1 (mit jeweils neuer Versionsnummer)');
