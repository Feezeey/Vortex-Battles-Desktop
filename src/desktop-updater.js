import { isTauri } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// This file is bundled by Vite. The online game itself is not modified by the updater.
if (isTauri()) {
  const style = document.createElement('style');
  style.textContent = `
    #vb-desktop-updater { position:fixed; right:18px; bottom:18px; z-index:2147483000;
      width:min(340px,calc(100vw - 36px)); padding:16px; box-sizing:border-box;
      background:linear-gradient(135deg,#102337,#192544); border:1px solid #6a85a5;
      color:#f3f7ff; border-radius:14px; box-shadow:0 14px 32px #0009;
      font:14px/1.45 system-ui,Segoe UI,sans-serif; }
    #vb-desktop-updater[hidden] {display:none !important}
    #vb-desktop-updater strong{display:block;font-size:16px;margin-bottom:6px}
    #vb-desktop-updater p{margin:5px 0 12px;white-space:pre-line}
    #vb-desktop-updater .vb-actions{display:flex;gap:8px;flex-wrap:wrap}
    #vb-desktop-updater button{padding:9px 12px;border-radius:8px;cursor:pointer;background:#28354c;
      color:#fff;border:1px solid #8195b8;font:inherit}
    #vb-desktop-updater button:first-child{background:#40b979;color:#071c15;border-color:#86ffc1;font-weight:700}
    #vb-desktop-updater button:disabled{opacity:.5;cursor:default}
    #vb-update-trigger{position:fixed;right:15px;bottom:15px;z-index:2147482999;
      font:12px system-ui,Segoe UI,sans-serif;color:#eef6fc;background:#182d41e8;
      border:1px solid #507c93;border-radius:8px;padding:8px 10px;cursor:pointer}
    #vb-update-trigger[hidden]{display:none!important}
    #vb-update-progress{height:6px;border-radius:8px;background:#28394e;overflow:hidden;margin:10px 0}
    #vb-update-progress > div{height:100%;background:#58e4a3;width:0%;transition:width .15s}
  `;
  document.head.append(style);

  const trigger = document.createElement('button');
  trigger.id = 'vb-update-trigger';
  trigger.textContent = '↻ Update prüfen';
  trigger.hidden = true;
  const panel = document.createElement('section');
  panel.id = 'vb-desktop-updater';
  panel.hidden = true;
  panel.setAttribute('aria-label','Vortex Battles – Updates');
  panel.innerHTML = `<strong id="vb-update-title">Updates</strong>
    <p id="vb-update-detail">Prüfe auf Updates…</p>
    <div id="vb-update-progress" hidden><div id="vb-update-progress-fill"></div></div>
    <div class="vb-actions">
      <button type="button" id="vb-update-main">Jetzt installieren</button>
      <button type="button" id="vb-update-later">Später</button>
    </div>`;
  document.body.append(trigger, panel);
  const title = panel.querySelector('#vb-update-title');
  const detail = panel.querySelector('#vb-update-detail');
  const primary = panel.querySelector('#vb-update-main');
  const later = panel.querySelector('#vb-update-later');
  const progress = panel.querySelector('#vb-update-progress');
  const bar = panel.querySelector('#vb-update-progress-fill');
  let pending = null, checking = false, installing = false;
  const show = (heading, info) => {
    title.textContent = heading;
    detail.textContent = info;
    panel.hidden = false;
  };
  const messageForError = e => String(e?.message || e || 'Unbekannter Fehler').slice(0, 260);

  async function checkForUpdate(manual=false) {
    if (checking || installing) return;
    checking = true;
    primary.hidden = true;
    progress.hidden = true;
    if (manual) show('Update-Prüfung', 'Suche nach einer neuen Version…');
    try {
      const update = await check({ timeout: 12000 });
      if (update) {
        pending = update;
        show('Update v' + update.version + ' verfügbar',
          (update.body || 'Eine neue Version von Vortex Battles ist da!') + '\nInstallieren am besten vor dem nächsten Online-Match.');
        primary.textContent = 'Update installieren';
        primary.hidden = false;
        trigger.textContent = '⬆ Update verfügbar';
      } else {
        pending = null;
        trigger.textContent = '✓ Aktuell';
        if (manual) show('Alles aktuell', 'Du hast bereits die neueste Version.');
      }
    } catch (error) {
      // For private/unpublished GitHub releases check() may return an HTTP error.
      if (manual) show('Updateprüfung fehlgeschlagen', messageForError(error));
      console.warn('[Vortex Updater]', error);
    } finally { checking = false; }
  }

  primary.onclick = async () => {
    if (!pending || installing) return;
    installing = true;
    primary.disabled = true;
    later.disabled = true;
    progress.hidden = false;
    show('Update wird installiert', 'Bitte Spiel nicht schließen. Auf Windows beendet der Installer die App möglicherweise kurz.');
    let transferred=0, total=0;
    try {
      await pending.downloadAndInstall(event => {
        if (event.event === 'Started') {
          total = Number(event.data.contentLength) || 0;
          transferred = 0;
        } else if (event.event === 'Progress') {
          transferred += Number(event.data.chunkLength) || 0;
        } else if (event.event === 'Finished') {
          bar.style.width = '100%';
        }
        if (total > 0) {
          bar.style.width = Math.min(99,Math.round(100*transferred/total))+'%';
          detail.textContent = 'Download: '+Math.round(100*transferred/total)+' %';
        }
      });
      show('Update erfolgreich', 'Vortex Battles startet neu.');
      await relaunch();
    } catch (error) {
      show('Update fehlgeschlagen', messageForError(error));
      console.error('[Vortex Updater]', error);
    } finally { installing = false; primary.disabled=false; later.disabled=false; }
  };
  later.onclick = () => { if (!installing) panel.hidden = true; };
  trigger.onclick = () => { if (!panel.hidden) {panel.hidden = true;} else if (pending) {
    primary.hidden=false;
    show('Update v'+pending.version+' verfügbar','Du kannst das Update jetzt installieren.');
  } else { checkForUpdate(true); } };
  // Only check at startup, don't force an installer restart during an active online battle.
  trigger.hidden = false;
  setTimeout(() => checkForUpdate(false), 1800);
}
