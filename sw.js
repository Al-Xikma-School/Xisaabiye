// sw.js — Cache busted: version 2
const CACHE_NAME = 'xisaabiye-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: cache files
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate: delete OLD caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('SW: deleting old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        // Update cache with fresh response
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return networkResponse;
      })
      .catch(function() {
        // Offline fallback
        return caches.match(event.request);
      })
  );
});
