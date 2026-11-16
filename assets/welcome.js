// "Early preview" welcome note, ported from Noodlit (www/src/welcome.js) so both apps behave alike.
// Shown on the first visit, and again the first time Pairody opens on a new version (the version
// is stamped at deploy, see assets/update.js) unless "Note after updates" is turned off in the
// info panel's Preferences. The update version adds a "new version" line and a pointer to that
// preference. Everything is remembered in localStorage on this device; if storage is blocked,
// the note simply shows again next time.
//   pairody.previewWelcomeSeen     "1" once the note has been dismissed (first visit done)
//   pairody.previewWelcomeVersion  the version the note was last dismissed on
//   pairody.prefs                  {"updateNote": true|false}
(function(){
  const KEY = 'pairody.previewWelcomeSeen';
  const VERSION_KEY = 'pairody.previewWelcomeVersion';
  const PREFS_KEY = 'pairody.prefs';

  function read(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function write(k, v){ try { localStorage.setItem(k, v); } catch(e){ /* private mode */ } }

  const prefs = {
    load(){ try { return Object.assign({ updateNote: true }, JSON.parse(read(PREFS_KEY) || '{}')); } catch(e){ return { updateNote: true }; } },
    get(k){ return prefs.load()[k]; },
    set(k, v){ const all = prefs.load(); all[k] = v; write(PREFS_KEY, JSON.stringify(all)); },
  };
  window.PairodyPrefs = prefs;

  const version = () => (window.PairodyUpdate && window.PairodyUpdate.version) || 'dev';
  function remember(){ write(KEY, '1'); write(VERSION_KEY, version()); }

  const HTML = `
<p class="info-tag"><span class="web-only">Early preview</span><span class="native-only">Free to play</span></p>
<h2 id="welcomeTitle">Welcome to Pairody</h2>
<p id="welcomeUpdate" class="welcome-update" hidden></p>
<div id="welcomeNews" class="welcome-news" hidden></div>
<p id="welcomeBody"><span class="web-only">Pairody is in early preview. It's free while we build it, new decks land often, and now and then something may wobble. Thanks for playing!</span><span class="native-only">Memory match, played by ear: pick a deck, tap two pads, and find the pairs. Pairody is free, with no ads and no accounts, and new decks arrive with updates.</span> Tap <b class="welcome-i">i</b> any time to see what's here.</p>
<p class="welcome-optout" hidden>Don't need this after every update? Turn it off in <button type="button" class="welcome-prefs">Preferences</button>.</p>
<form method="dialog" class="welcome-actions"><button type="button" class="btn welcome-demo" hidden>Show demo</button><button class="btn primary welcome-ok">Got it</button></form>`;

  // Preferences live in the info panel (assets/info.js puts the switch there).
  function wirePrefs(){
    const sw = document.querySelector('dialog.info input[name="updateNote"]');
    if (!sw || sw.dataset.wired) return sw;
    sw.dataset.wired = '1';
    sw.checked = !!prefs.get('updateNote');
    sw.addEventListener('change', () => prefs.set('updateNote', sw.checked));
    document.querySelector('.info-btn')?.addEventListener('click', () => { sw.checked = !!prefs.get('updateNote'); });
    return sw;
  }

  function openPrefs(){
    const btn = document.querySelector('.info-btn'), sw = wirePrefs();
    if (!btn || !sw) return;
    btn.click();
    const sec = document.getElementById('infoPrefs');
    sec?.scrollIntoView({ block: 'center' });
    sw.focus({ preventScroll: true });
    sec?.classList.add('flash');
    setTimeout(() => sec?.classList.remove('flash'), 1200);
  }

  function init(){
    wirePrefs();
    const firstVisit = read(KEY) !== '1';
    const newVersion = !firstVisit && read(VERSION_KEY) !== version();
    if (newVersion && !prefs.get('updateNote')) { remember(); return; } // off: note the version quietly
    if (!firstVisit && !newVersion) return;

    const dlg = document.createElement('dialog');
    dlg.className = 'info welcome';
    dlg.setAttribute('aria-labelledby', 'welcomeTitle');
    dlg.setAttribute('aria-describedby', 'welcomeBody');
    dlg.innerHTML = HTML;
    if (newVersion) {
      dlg.querySelector('#welcomeTitle').textContent = 'New version released';
      const line = dlg.querySelector('#welcomeUpdate');
      line.textContent = version() === 'dev' ? 'Pairody has been updated.' : `Pairody has been updated to version ${version()}.`;
      line.hidden = false;
      dlg.querySelector('.welcome-optout').hidden = false;
      dlg.setAttribute('aria-describedby', 'welcomeUpdate welcomeBody');
      // What's new since this device last saw the release notes (assets/notes.js), in place of the
      // generic preview blurb. A deploy with no new note just shows the blurb as before.
      const N = window.PairodyNotes, fresh = N ? N.unseen() : [];
      if (fresh.length) {
        const items = fresh.flatMap((n) => n.items).slice(0, 5);
        const news = dlg.querySelector('#welcomeNews');
        news.innerHTML = `<h3>${fresh.length === 1 ? fresh[0].title : "What's new"}</h3>`
          + `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
          + `<button type="button" class="welcome-notes">All release notes</button>`;
        news.hidden = false;
        dlg.querySelector('#welcomeBody').hidden = true;
        dlg.setAttribute('aria-describedby', 'welcomeUpdate welcomeNews');
        news.querySelector('.welcome-notes').addEventListener('click', () => { then = () => N.open('welcome'); dlg.close(); });
      }
    }
    document.body.appendChild(dlg);

    let then = null; // something to open once the note has closed (Preferences or release notes)
    // Got it, Escape, or a tap outside all close it, and closing is what marks it seen.
    dlg.addEventListener('close', () => { remember(); window.PairodyNotes?.markSeen(); dlg.remove(); if (then) then(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.welcome-prefs').addEventListener('click', () => { then = openPrefs; dlg.close(); });
    // Show demo (main game only): closes the note and starts the Demo for the selected deck.
    // It clicks the Demo button inside this tap, so the browser lets the sound play.
    const demoBtn = document.getElementById('demo'), showDemo = dlg.querySelector('.welcome-demo');
    if (demoBtn) {
      showDemo.hidden = false;
      showDemo.addEventListener('click', () => {
        dlg.close();
        window.PairodyAnalytics?.track('welcome/demo', 'Show demo tapped on the preview note');
        if (demoBtn.getAttribute('aria-pressed') !== 'true') demoBtn.click();
      });
    }

    // A beat after load, so the board shows first and the note feels like a greeting.
    // If another panel is already open, wait for it to close.
    function show(){
      if (document.querySelector('dialog[open]')) { setTimeout(show, 700); return; }
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      dlg.querySelector('.welcome-ok').focus({ preventScroll: true });
    }
    setTimeout(show, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
