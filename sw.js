// efko Wochenmeldung - Service Worker
const CACHE_NAME = 'efko-wochenmeldung-v1';
const ASSETS_TO_CACHE = [
  './',
  './efko Wochenmeldung.html',
  './efko_logo_app_4k_square.png',
  './manifest.json'
];

// Installation: Dateien cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network-first für API-Calls, Cache-first für Assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase und externe APIs immer vom Netzwerk laden
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Lokale Assets: Network-first mit Cache-Fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
