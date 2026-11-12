// Offline copy of Pairody, and the source of "Check for updates".
// VERSION is stamped by the deploy workflow (.github/workflows/pages.yml) on every deploy, so each
// deploy changes this file, the browser installs a fresh cache, and players see "New version ready".
// Don't edit the VERSION line by hand; PRs never bump versions. New files must be added to SHELL.
const VERSION = 'pairody-__BUILD__';
const SHELL = [
  './',
  './index.html',
  './youtube.html',
  './manifest.webmanifest',
  './favicon.ico',
  './apple-touch-icon.png',
  './assets/pairody.css',
  './assets/best.js',
  './assets/info.js',
  './assets/update.js',
  './assets/analytics.js',
  './assets/logo-light.svg',
  './assets/logo-dark.svg',
  './assets/mark.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './sounds/animals/cat.mp3',
  './sounds/animals/dog.mp3',
  './sounds/animals/duck.mp3',
  './sounds/animals/frog.mp3',
  './sounds/animals/owl.mp3',
  './sounds/animals/rooster.mp3',
  './sounds/animals/sheep.mp3',
  './sounds/animals/songbird.mp3',
];

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
