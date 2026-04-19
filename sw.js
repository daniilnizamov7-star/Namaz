// sw.js - Service Worker для PWA "Намаз Челябинск"
const CACHE_NAME = 'namaz-chelyabinsk-v5'; // <-- Версия обновлена для сброса старого кэша
// Файлы, которые мы кэшируем для работы без интернета
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];
// 1. УСТАНОВКА: Скачиваем и сохраняем файлы
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Кэширование файлов приложения...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Активируем новую версию сразу
});
// 2. АКТИВАЦИЯ: Удаляем старые версии кэша, чтобы не занимать память
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Удаление старого кэша:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // Берем управление страницей сразу
});
// 3. ОБРАБОТКА ЗАПРОСОВ: Сначала сеть, если нет — кэш
self.addEventListener('fetch', (e) => {
  // Для HTML-документов всегда пытаемся скачать свежее
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        // Если скачали успешно — обновляем кэш
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Если интернета нет — берем из кэша
        console.log('[ServiceWorker] Нет сети, используем кэш');
        return caches.match(e.request);
      })
    );
  }
  // Для остальных ресурсов (картинки, манифест)
  else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});

// === ОБРАБОТКА КЛИКА ПО УВЕДОМЛЕНИЮ (ДОБАВЛЕНО) ===
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('/')) return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});