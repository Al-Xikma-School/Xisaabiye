// XISAABIYE Service Worker v2
const CACHE_NAME = 'xisaabiye-v2';
const BASE_PATH = '/Xisaabiye';

const ASSETS_TO_CACHE = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icon-72x72.png',
  BASE_PATH + '/icon-96x96.png',
  BASE_PATH + '/icon-144x144.png',
  BASE_PATH + '/icon-192x192.png',
  BASE_PATH + '/icon-512x512.png',
];

// ── Install: cache shell ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.warn('Cache addAll failed:', err))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network first, fallback to cache ──
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Skip non-GET and external APIs (Firebase, fonts, etc.)
  if (e.request.method !== 'GET') return;
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('gstatic.com') ||
    url.includes('googleapis.com') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('fonts.googleapis.com')
  ) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache fresh copy
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(e.request)
          .then(cached => cached || caches.match(BASE_PATH + '/index.html'));
      })
  );
});
