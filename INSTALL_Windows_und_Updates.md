# Vortex Battles – Windows-EXE und automatische Updates

Diese ZIP enthält das vorbereitete Tauri-2-Projekt einschließlich der aktuellen Spielversion (Leafling, Embrix, neuer Nocturak, Multiplayer). Noch keine kompilierte EXE. Alle Befehle unten werden in **Windows PowerShell** im entpackten Projektordner ausgeführt.

## A. Einmalig einrichten

1. Kostenloses GitHub-Konto erstellen: https://github.com/signup
2. GitHub Desktop installieren und anmelden: https://desktop.github.com/
3. ZIP entpacken, z. B. unter `Dokumente\VortexBattles_Windows_App`.
4. Ordner im Explorer öffnen. In der Adressleiste `powershell` eingeben und Enter drücken. Es öffnet sich PowerShell direkt im Projektordner.
5. Node.js prüfen (falls noch nicht installiert: https://nodejs.org/):

```powershell
node -v
npm -v
```

6. Projekt-Abhängigkeiten installieren:

```powershell
npm install
```

7. Einmalig kostenlose Tauri-Update-Signatur erzeugen:

```powershell
New-Item -ItemType Directory -Force "$HOME\.tauri" | Out-Null
npx tauri signer generate -w "$HOME\.tauri\vortex-battles.key"
```

Ein starkes **Passwort** wählen und sicher aufbewahren. Es entstehen zwei Dateien außerhalb des Projektordners: `.key` (GEHEIM) und `.key.pub` (öffentlich). **Niemals den privaten Schlüssel in ein Repository stellen oder an andere weitergeben!** Bewahre Schlüssel und Passwort zusätzlich in einer sicheren Sicherung auf.

8. Eigenen GitHub-Namen anstelle von `DEINNAME` einsetzen und den öffentlichen Schlüssel in die App-Konfiguration übernehmen:

```powershell
node scripts/setup-project.mjs DEINNAME/vortex-battles-desktop "$HOME\.tauri\vortex-battles.key.pub"
npm run check-config
```

Als Erfolg erscheinen Häkchen sowie deine GitHub-Update-URL. Bezeichner und GitHub-Repositoryname müssen später **exakt** `DEINNAME/vortex-battles-desktop` ergeben.

## B. GitHub-Repository anlegen und Dateien hochladen

1. GitHub Desktop starten und anmelden.
2. `File → Add local repository... → Choose...` und den entpackten Ordner wählen.
3. Falls GitHub Desktop meldet, dass dort noch kein Repository existiert, `Create a repository here` wählen.
4. Oben `Publish repository` anklicken.
5. Name: `vortex-battles-desktop`. Für den kostenlosen, einfachsten öffentlichen Update-Endpunkt das Häkchen bei **Keep this code private** entfernen.
6. Veröffentlichen. **Achtung:** Im öffentlichen Repository ist der HTML-/JavaScript-Spielcode für alle einsehbar. Das ist für diese einfache Update-Variante erforderlich. Ein privates Spielprojekt erfordert ein anderes Update-Hosting-Konzept.

## C. Sichere GitHub-Secrets eintragen

1. Browser → GitHub → dein Repository → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.
2. `TAURI_SIGNING_PRIVATE_KEY` anlegen. Den **vollständigen Inhalt** deiner privaten `.key` als Wert einfügen. Datei zum Kopieren lokal öffnen:

```powershell
notepad "$HOME\.tauri\vortex-battles.key"
```

3. `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` als zweites Secret anlegen, mit dem Passwort von Schritt A7.
4. Prüfen, dass beide Secret-NAMEN unter `Actions` erscheinen, die Werte werden nicht mehr angezeigt.

**Nicht den privaten Schlüssel oder das Passwort im Chat senden.**

## D. Erste EXE erstellen

1. GitHub → Repository → `Actions`.
2. Links `Windows EXE und Updates veröffentlichen` wählen.
3. `Run workflow` → Branch `main` → `Run workflow`.
4. Nach erfolgreichem Durchlauf: Repository → `Releases` → Release `Vortex Battles v0.1.0` öffnen.
5. Unter Assets die Datei mit `setup.exe` am Ende herunterladen und auf Windows installieren.
6. Bei Windows-SmartScreen kann eine Warnung erscheinen, weil der Windows-Installer kein kostenpflichtiges Authenticode-/Publisher-Zertifikat hat. Nur aus deinem eigenen Release herunterladen und die Herkunft überprüfen.

Der Tauri-Updater ist anders als ein Windows-Code-Signing-Zertifikat: Er kontrolliert die Integrität der Update-Pakete und ist kostenlos. Die Apps prüfen beim Start auf Updates; die Installation wird per Knopf bestätigt. Dein bisheriger Cloudflare-Multiplayer-Worker läuft unverändert weiter.

## E. Jede spätere Version / jedes neue Monster

1. Neue vollständige HTML-Spielversion (beispielsweise aus einem neuen ChatGPT-Download) auf den PC laden.
2. Im Projektordner PowerShell öffnen und Spiel ersetzen:

```powershell
npm run replace-game -- "C:\Pfad\Zur\NeuenSpielversion.html"
```

3. Versionsnummer **erhöhen** (beim zweiten Release z. B. `0.1.1`):

```powershell
npm run set-version -- 0.1.1
npm run check-config
```

4. GitHub Desktop → neue Dateien `Commit to main` → `Push origin`.
5. GitHub → `Actions` → `Windows EXE und Updates veröffentlichen` → `Run workflow`.
6. Nach erfolgreicher Veröffentlichung erkennen bereits installierte Spiele die neue Version beim nächsten Start und bieten die Installation an. Kein manuelles ZIP-Austauschen nötig.

## Bei Problemen

- `npm` nicht erkannt: Node.js installieren, Terminal neu öffnen.
- `check-config` meldet Public Key/URL: `setup-project.mjs` mit korrektem Repositorynamen/`.key.pub` erneut ausführen.
- Action fehlgeschlagen: Fehlermeldung aus GitHub `Actions` → roter Durchlauf → fehlgeschlagener Schritt lesen; keine Secrets teilen.
- Keine Update-Meldung: Release muss veröffentlicht sein und `latest.json` enthalten; App-Version muss niedriger sein als das Release.
- Keine Netzwerkverbindung im Spiel: bisherige Cloudflare-Worker-Adresse im Online-Menü prüfen.
- Lokale Test-App: `npm run desktop:dev` benötigt zusätzlich Rust, Microsoft C++ Build Tools und ggf. WebView2 (siehe Tauri-Voraussetzungen).

Offizielle Quellen:
- https://v2.tauri.app/plugin/updater/
- https://v2.tauri.app/distribute/pipelines/github/
- https://v2.tauri.app/start/prerequisites/
