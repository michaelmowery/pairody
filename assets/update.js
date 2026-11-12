// Pairody updates. Pairody is cached for offline play by sw.js, so a phone keeps the copy it
// already has until a new version takes over. This file:
//  - registers the service worker (bypassing the HTTP cache for sw.js itself),
//  - re-checks for a new version when the app comes back to the foreground,
//  - shows a small "New version ready" pill once a new version has taken over,
//  - powers "Check for updates" in the info panel (PairodyUpdate.check).
// The page never reloads on its own: that would wipe a board in progress.
// Ported from Noodlit's update.js so both apps behave the same way.
(function(){
  // Stamped at deploy time by .github/workflows/pages.yml (0.<deploy number>). Don't edit by hand.
  const STAMP = '__APP_VERSION__';
  const stamped = !STAMP.startsWith('__');
  const version = stamped ? STAMP : 'dev';
  // Only a stamped deploy gets a service worker: an unstamped sw.js would never change,
  // so it could keep players on an old copy forever.
  const supported = stamped && 'serviceWorker' in navigator && window.isSecureContext;
  const RECHECK_MS = 30 * 60 * 1000; // foreground re-check, at most this often
  const INSTALL_TIMEOUT_MS = 25000;

  let reg = null;
  let ready = false;          // a newer version is active; a reload will show it
  let lastCheck = Date.now(); // the browser checks on load, so count that as one
  const hadController = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  function reload(){ location.reload(); }

  if (supported) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then((r) => { reg = r; })
      .catch(() => { /* preview hosts may block this */ });

    // sw.js activates new versions straight away (skipWaiting + clients.claim), so a
    // controller change on a page that already had one means a new version took over.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || ready) return;
      ready = true;
      showPill();
    });

    // Phones keep a home-screen app alive in the background for days; look again when it returns.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible' || !reg) return;
      if (Date.now() - lastCheck < RECHECK_MS) return;
      lastCheck = Date.now();
      reg.update().catch(() => {});
    });
  } else if (!stamped && 'serviceWorker' in navigator) {
    // Not a stamped deploy (local copy, or the site went back to plain branch hosting):
    // drop any old worker so the browser just loads the live files.
    navigator.serviceWorker.getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {});
  }

  // Resolves to one of: 'ready' (new version installed, caller should reload),
  // 'current' (already up to date), 'offline' (couldn't reach the server),
  // 'unsupported' (no service worker here, e.g. a local copy).
  async function check() {
    if (!supported) return 'unsupported';
    if (ready) return 'ready';
    try {
      reg = reg || await navigator.serviceWorker.getRegistration();
      if (!reg) return 'unsupported';
      lastCheck = Date.now();
      await reg.update();
    } catch (e) {
      return 'offline';
    }
    if (ready) return 'ready';
    const incoming = reg.installing || reg.waiting;
    if (!incoming) return 'current';
    return (await settle(incoming)) ? 'ready' : 'offline';
  }

  // Wait for a new worker to finish installing and take over.
  function settle(worker) {
    return new Promise((resolve) => {
      const done = (ok) => { clearTimeout(timer); worker.removeEventListener('statechange', onState); resolve(ok); };
      const onState = () => {
        if (worker.state === 'activated') { ready = true; done(true); }
        else if (worker.state === 'redundant') done(false);
      };
      const timer = setTimeout(() => done(ready), INSTALL_TIMEOUT_MS);
      worker.addEventListener('statechange', onState);
      if (worker.state === 'installed') worker.postMessage({ type: 'skip-waiting' });
      onState();
    });
  }

  // The pill: quiet, bottom-centre, tap to refresh or dismiss.
  function showPill() {
    if (document.getElementById('update-pill')) return;
    const pill = document.createElement('div');
    pill.id = 'update-pill';
    pill.className = 'update-pill';
    pill.setAttribute('role', 'status');
    pill.innerHTML =
      '<button type="button" class="update-pill-go">New version ready <b>Refresh</b></button>' +
      '<button type="button" class="update-pill-x" aria-label="Not now">×</button>';
    pill.querySelector('.update-pill-go').addEventListener('click', reload);
    pill.querySelector('.update-pill-x').addEventListener('click', () => {
      pill.classList.add('leaving');
      setTimeout(() => pill.remove(), 200);
    });
    document.body.appendChild(pill);
  }

  window.PairodyUpdate = { version, supported, check, reload, isReady: () => ready };
})();
