import fs from 'node:fs';
import path from 'node:path';

// Vortex Battles Setup-Key-Fix v3: accepts the formats emitted by Tauri v2.
console.log('✓ Vortex Battles: Setup-Key-Fix v3 aktiv');
const repo = process.argv[2];
const pubfile = process.argv[3];
if (!repo || !pubfile || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
  console.error('Aufruf: node scripts/setup-project.mjs NAME/vortex-battles-desktop "PFAD_ZUR_KEY.PUB"');
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(pubfile, 'utf8').replace(/^\uFEFF/, '').trim().replace(/\r\n/g, '\n');
} catch {
  console.error('Die öffentliche .key.pub-Datei wurde nicht gefunden. Bitte den Pfad prüfen.');
  process.exit(1);
}

// Tauri's updater expects base64 of the complete two-line Minisign public key.
// Tauri's .pub file can already be in that form; retain it unchanged if so.
let publicText;
let encodedKey;
if (raw.startsWith('untrusted comment:')) {
  publicText = raw;
  encodedKey = Buffer.from(raw + '\n', 'utf8').toString('base64');
} else if (/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
  const bytes = Buffer.from(raw, 'base64');
  const decoded = bytes.toString('utf8').replace(/\r\n/g, '\n').trim();
  if (decoded.startsWith('untrusted comment:')) {
    publicText = decoded;
    encodedKey = raw;
  } else if (bytes.length === 42 && bytes[0] === 0x45 && bytes[1] === 0x64) {
    // Standalone Minisign key line (rare export variant).
    publicText = 'untrusted comment: minisign public key\n' + raw;
    encodedKey = Buffer.from(publicText + '\n', 'utf8').toString('base64');
  }
}

const parts = (publicText || '').split('\n');
const line = parts[1] || '';
const pubBytes = /^[A-Za-z0-9+/]+={0,2}$/.test(line) ? Buffer.from(line, 'base64') : Buffer.alloc(0);
if (!parts[0]?.startsWith('untrusted comment:') || pubBytes.length !== 42 || pubBytes[0] !== 0x45 || pubBytes[1] !== 0x64) {
  console.error('Die .key.pub-Datei enthält keinen erkennbaren Tauri-Minisign-Public-Key.');
  console.error('Bitte prüfen: Ist es wirklich die ÖFFENTLICHE Datei mit Endung .key.pub?');
  console.error('Sende keine privaten Schlüssel und kein Passwort an andere.');
  process.exit(1);
}

const filename = path.join('src-tauri', 'tauri.conf.json');
let config;
try {
  config = JSON.parse(fs.readFileSync(filename, 'utf8'));
} catch {
  console.error('Projektdatei src-tauri/tauri.conf.json nicht gefunden: PowerShell muss im Projektordner geöffnet sein.');
  process.exit(1);
}
config.plugins ??= {};
config.plugins.updater ??= {};
config.plugins.updater.pubkey = encodedKey;
config.plugins.updater.endpoints = [ `https://github.com/${repo}/releases/latest/download/latest.json` ];
fs.writeFileSync(filename, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log('✓ Öffentlicher Tauri-Schlüssel übernommen.');
console.log('✓ GitHub-Update-Adresse:', config.plugins.updater.endpoints[0]);
console.log('✓ Fertig. Jetzt: npm.cmd run check-config');
