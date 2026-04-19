const CACHE_NAME = 'namaz-chelyabinsk-v4'; // <-- Изменено с v3 на v4
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => 
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        return caches.open(CACHE_NAME).then(c => {
          c.put(e.request, res.clone());
          return res;
        });
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});