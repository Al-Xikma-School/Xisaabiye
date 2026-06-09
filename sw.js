// sw.js — v3 : Custom offline page
const CACHE_NAME = 'xisaabiye-v3';
const FILES_TO_CACHE = ['./', './index.html', './manifest.json'];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="so">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Xiriirka waa go'ay</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Segoe UI', sans-serif;
    text-align: center;
    padding: 24px;
  }
  .icon { font-size: 72px; margin-bottom: 24px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #f8fafc; }
  p  { font-size: 15px; color: #94a3b8; margin-bottom: 32px; line-height: 1.6; }
  .btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn:hover { background: #2563eb; }
  .hint { margin-top: 20px; font-size: 13px; color: #475569; }
</style>
</head>
<body>
  <div class="icon">📡</div>
  <h1>Xiriirka waa go'ay</h1>
  <p>Internet-ka ama serverka waa go'ay.<br>Fadlan xiriirka hubi oo dib u isku day.</p>
  <button class="btn" onclick="location.reload()">🔄 Dib u Isku Day</button>
  <p class="hint">Hadduu internet-ku shaqaynayo, dhowr ilbiriqsi sug.</p>
</body>
</html>`;

// Install
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// Activate — delete old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, custom offline page on error
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Hadduu 500 ama server error yahay, offline page soo celi
        if (!response.ok && response.status >= 500) {
          return new Response(OFFLINE_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
        // Cache-ka cusboonaysii
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(function() {
        // Network gabi ahaan ma helo — cache ka eeg
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Hadduu cache-ku maqan yahay, offline page soo celi
          return new Response(OFFLINE_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        });
      })
  );
});
