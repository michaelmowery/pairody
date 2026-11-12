// Offline copy of Pairody, and the source of "Check for updates".
// VERSION is stamped by the deploy workflow (.github/workflows/pages.yml) on every deploy, so each
// deploy changes this file, the browser installs a fresh cache, and players see "New version ready".
// Don't edit the VERSION or SHELL lines by hand; PRs never bump versions. The same deploy step fills
// SHELL (the files saved for offline play) with every site file, so new files need no listing anywhere.
const VERSION = 'pairody-__BUILD__';
const SHELL = ['./', './index.html'];

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the browser's HTTP cache, so a new version never ships stale files.
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// "Check for updates" can ask a waiting worker to take over.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pairody-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Only Pairody's own files are served from the cache. Fonts, YouTube and anything else
// from another site go straight to the network as if there were no service worker.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Pages can carry a query string (youtube.html?list=...); match them to the cached page.
  const opts = e.request.mode === 'navigate' ? { ignoreSearch: true } : undefined;
  e.respondWith(
    caches.match(e.request, opts).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
