VORTEX BATTLES – WINDOWS EXE MIT AUTOMATISCHEN UPDATES
========================================================

Diese ZIP ist ein FERTIG VORBEREITETES TAURI-PROJEKT, noch KEINE kompilierte .exe.
Im Projekt liegt das komplette Vortex-Battles-Spiel inkl. Leafling, Embrix, neuem Nocturak,
Online-1v1 und Grafikoptionen. Dein Cloudflare-Worker bleibt bestehen.

SO FUNKTIONIERT DER SPÄTERE UPDATE-ABLAUF:
1. Einmal Windows-Setup.exe installieren.
2. Die App prüft beim Start automatisch auf neue, signierte Versionen.
3. "Update installieren" klicken (nicht mitten im Online-Match).
4. Bei neuen Versionen lädt dein PC automatisch die aktualisierte App.
   Es ist kein erneutes ZIP-Installieren nötig.

VOR DEM ERSTEN BUILD (EINMALIG):
A) Auf Windows Node.js (hast du schon) und GitHub Desktop benutzen.
   Für GitHub Actions brauchst du KEIN Rust und KEINE C++ Build Tools auf DEINEM PC.
   Nur wenn du auf deinem eigenen PC eine EXE bauen/testen willst, installierst du Rust,
   Microsoft C++ Build Tools und ggf. WebView2.
B) Ein öffentliches GitHub-Repository erstellen und das Projekt dorthin hochladen.
   Achtung: Bei einem ÖFFENTLICHEN Repo kann jeder den Spielcode ansehen.
C) Im Projektordner PowerShell öffnen und "npm install" ausführen.
D) Signatur-Schlüssel NUR auf deinem PC erzeugen:
     New-Item -ItemType Directory -Force "$HOME\.tauri"
     npx tauri signer generate -w "$HOME\.tauri\vortex-battles.key"
   WICHTIG: Die .key ist GEHEIM! Sie darf nicht in die Projekt-ZIP oder ins Repo.
E) GitHub-Repository-Namen und deinen ÖFFENTLICHEN Schlüssel eintragen:
     node scripts/setup-project.mjs DEINNAME/DEINREPO "$HOME\.tauri\vortex-battles.key.pub"
F) GitHub Repository -> Settings -> Secrets and variables -> Actions:
     TAURI_SIGNING_PRIVATE_KEY: Inhalt deiner geheimen .key-Datei
     TAURI_SIGNING_PRIVATE_KEY_PASSWORD: dein Signatur-Passwort
G) src-tauri/tauri.conf.json muss deine GitHub-Adresse und den öffentlichen Schlüssel enthalten.

ERSTES WINDOWS-SETUP AUTOMATISCH BAUEN:
- Dateien per GitHub Desktop ins Repo hochladen (Commit + Push).
- GitHub -> Actions -> "Windows EXE und Updates veröffentlichen" -> Run workflow.
- Nach Erfolg GitHub -> Releases -> Vortex Battles v0.1.0 -> Setup-EXE herunterladen.
- Setup-EXE installieren. Beim Start der App wird nach Updates gesucht.

SPÄTERE UPDATES:
- Neue HTML mit einem einzigen Befehl übernehmen (der Updater bleibt drin):
     npm run replace-game -- "C:\Pfad\NeueVortexBattles.html"
- Die funktionierende Cloudflare-Serveradresse kannst du beibehalten.
- npm run set-version -- 0.1.1  (immer erhöhen)
- Mit GitHub Desktop Commit + Push.
- GitHub -> Actions -> "Windows EXE und Updates veröffentlichen" -> Run workflow.
- Installierte Apps zeigen die neue Version beim nächsten Start an.

LOKAL TESTEN AUF WINDOWS:
  npm install
  npm run desktop:dev

WICHTIGE HINWEISE:
- GitHub Actions baut die .exe auf Windows. Diese Linux-Umgebung kann keine getestete
  Windows-Setup.exe erzeugen.
- Die Update-Signatur (Tauri) ist NICHT dasselbe wie ein Windows-Code-Signing-Zertifikat.
  Ohne ein solches Zertifikat kann SmartScreen bei Download/Installation warnen.
- Für öffentliches Hosting von Updates muss das GitHub-Release erreichbar sein.
- Der Multiplayer-Worker bleibt auf Cloudflare; die neue App ersetzt NUR die Spielwebsite.
- Der Browser und die Windows-WebView2-Engine unterscheiden sich etwas; Multiplayer und
  Vollbild bitte nach dem ersten Build auf Windows testen.

Offizielle Anleitungen:
https://v2.tauri.app/start/prerequisites/
https://v2.tauri.app/plugin/updater/
https://v2.tauri.app/distribute/pipelines/github/
