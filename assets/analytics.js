// Anonymous usage counts, sent to GoatCounter (goatcounter.com). Ported from Noodlit
// (www/src/analytics.js) so both apps count the same way.
//
// What gets sent: which page loaded, and the names of a few actions (a deck picked, a board
// cleared, Easy mode turned on, the info panel opened, the app installed). Never a playlist,
// song link, or anything typed. GoatCounter sets no cookies and keeps no profile: it tells
// visits apart with a short-lived hash, so nobody is followed around.
//
// It stays out of the way: nothing is sent while offline, on a preview or local copy, when a
// browser is being driven by a robot, or when "Anonymous usage counts" is off in the info
// panel. Every send is fire-and-forget, so a failure is silent and never touches the game.
//
// Setup: GOATCOUNTER_CODE is the name of the GoatCounter site (the "pairody" in
// pairody.goatcounter.com). Set it to '' to turn analytics off everywhere.
// The on/off choice is saved in localStorage under pairody.prefs as {"analytics": true|false},
// the same object welcome.js uses for its preference.
(function(){
  const GOATCOUNTER_CODE = 'pairody';
  const PREFS_KEY = 'pairody.prefs';

  // Only the live site counts; local copies and preview hosts just log to the console.
  const LIVE = /(^|\.)pairody\.app$/.test(location.hostname);

  function loadPrefs(){ try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function enabled(){ return loadPrefs().analytics !== false; }
  function setEnabled(on){
    try { const p = loadPrefs(); p.analytics = !!on; localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch(e){ /* private mode */ }
  }

  function allowed(){
    if (!GOATCOUNTER_CODE) return false;
    if (!enabled()) return false;
    if (navigator.webdriver) return false;
    if (navigator.onLine === false) return false;
    return true;
  }

  function send(params){
    if (!allowed()) return;
    if (!LIVE) { console.debug('[analytics]', params.e ? 'event' : 'view', params.p); return; }
    try {
      const q = new URLSearchParams(Object.assign({}, params, {
        s: [screen.width, screen.height, window.devicePixelRatio || 1].join(','),
        rnd: Math.random().toString(36).slice(2, 8),
      }));
      const url = 'https://' + GOATCOUNTER_CODE + '.goatcounter.com/count?' + q;
      if (navigator.sendBeacon && navigator.sendBeacon(url)) return;
      const img = new Image();
      img.onerror = () => {}; // offline or blocked: drop it quietly
      img.src = url;
    } catch(e){ /* never let counting break the game */ }
  }

  // An action: `name` is a short path-like id ("deck/animals"), `title` a readable label.
  function track(name, title){ send({ p: name, t: title || name, e: 'true' }); }

  window.PairodyAnalytics = { track, enabled, setEnabled };

  // One page view per load, tagged with how Pairody was opened (installed app or browser tab).
  const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  send({ p: location.pathname || '/', t: document.title, r: document.referrer });
  track(standalone ? 'launch/installed-app' : 'launch/browser', standalone ? 'Opened as installed app' : 'Opened in a browser');

  // Installed to the home screen (Chrome, Edge and Android; iOS doesn't say, so the launch
  // event above is how iOS installs show up).
  window.addEventListener('appinstalled', () => track('install', 'Installed the app'));

  // The "Anonymous usage counts" switch in the info panel (assets/info.js puts it there),
  // plus counts for opening the panel and tapping Send feedback.
  function wire(){
    const sw = document.querySelector('dialog.info input[name="analytics"]');
    if (sw && !sw.dataset.wired) {
      sw.dataset.wired = '1';
      sw.checked = enabled();
      sw.addEventListener('change', () => {
        if (!sw.checked) track('analytics/off', 'Turned off usage counts'); // last count before stopping
        setEnabled(sw.checked);
      });
    }
    const btn = document.querySelector('.info-btn');
    if (btn && !btn.dataset.counted) {
      btn.dataset.counted = '1';
      btn.addEventListener('click', () => { if (sw) sw.checked = enabled(); track('info/open', 'Info panel opened'); });
    }
    const fb = document.querySelector('dialog.info .info-feedback-btn');
    if (fb && !fb.dataset.counted) {
      fb.dataset.counted = '1';
      fb.addEventListener('click', () => track('feedback', 'Send feedback tapped'));
    }
  }
  // info.js is deferred too and loads first, so the panel exists by DOMContentLoaded.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
