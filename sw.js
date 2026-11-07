/* ПДР Trainer service worker — generated at build time (see vite.config.ts). */
const VERSION = '5355e13e9b';
const SHELL_CACHE = 'shell-' + VERSION;
const FIG_CACHE = 'figures-fb1e9d89e1';
const SHELL = [
  "./",
  "assets/sql-wasm-Bku9E_kW.wasm",
  "assets/index-D2ELwPHk.css",
  "assets/index-DTbrQG96.js",
  "assets/local-4F5rQSE2.js",
  "pdr.sqlite",
  "import-report.json",
  "import-report.txt",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== FIG_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // question figures: cache-first, cached on first view (or by "download for offline")
  if (url.pathname.includes('/figures/')) {
    e.respondWith(
      caches.open(FIG_CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // app shell (html, js, css, wasm, question database): cache-first, html falls back to index
  e.respondWith(
    caches.open(SHELL_CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        return await fetch(req);
      } catch (err) {
        if (req.mode === 'navigate') {
          const idx = await c.match('./index.html');
          if (idx) return idx;
        }
        throw err;
      }
    }),
  );
});
