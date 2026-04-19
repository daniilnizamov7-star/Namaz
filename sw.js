// sw.js - Service Worker для PWA "Намаз Челябинск"
const CACHE_NAME = 'namaz-chelyabinsk-v6'; // Версия увеличена для сброса старого кэша
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keyList => Promise.all(keyList.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => caches.open(CACHE_NAME).then(c => { c.put(e.request, res.clone()); return res; })).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});

// Клик по уведомлению → открывает приложение
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsList => {
    for (const client of clientsList) if (client.url.includes('/')) return client.focus();
    return clients.openWindow('/');
  }));
});