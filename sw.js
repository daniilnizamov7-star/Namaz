// sw.js - Service Worker для PWA "Намаз Челябинск"
const CACHE_NAME = 'namaz-chelyabinsk-v6'; // Версия обновлена
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => Promise.all(keyList.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((res) => caches.open(CACHE_NAME).then((cache) => { cache.put(e.request, res.clone()); return res; })).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
    if (clientsList.length) return clientsList[0].focus();
    return clients.openWindow('/');
  }));
});