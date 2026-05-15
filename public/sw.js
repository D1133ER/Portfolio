/* ─────────────────────────────────────────────────────────────────────────────
 * Nischal Portfolio — Service Worker
 * Strategy:
 *   • API routes  → network-only (always fresh)
 *   • Everything  → cache-first, fallback to network, cache on response
 * ────────────────────────────────────────────────────────────────────────────*/

const CACHE_NAME    = 'nischal-portfolio-v1';
const OFFLINE_URL   = '/';

/** Assets pre-cached on SW install */
const PRECACHE = [
  '/',
  '/nischal-bhandari-cv.pdf',
  '/avatar.jpg',
  '/wallpapers/gurucool-logic-imagination.png',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // API routes — always hit the network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    return;
  }

  // Everything else — cache-first, update in background
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });

      return cached ?? networkFetch.catch(() =>
        caches.match(OFFLINE_URL) ??
        new Response('Offline — open the portfolio online to continue.', { status: 503 }),
      );
    }),
  );
});
