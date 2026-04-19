const CACHE_NAME = 'namaz-chelyabinsk-v2'; // Версия кэша (меняй при глобальных обновлениях)

// Файлы, которые мы ОБЯЗАТЕЛЬНО сохраняем для офлайна
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// 1. Установка: Скачиваем файлы сразу
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Заставляем обновиться сразу
});

// 2. Активация: Удаляем старые версии
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); // Берем управление страницей сразу
});

// 3. Перехват запросов: Стратегия "Сеть первая, иначе Кэш"
self.addEventListener('fetch', (e) => {
  // Для HTML документов мы всегда хотим свежий контент, если есть сеть
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((networkResponse) => {
        // Если скачали успешно — обновляем кэш
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Если сети нет — берем из кэша
        return caches.match(e.request);
      })
    );
  } else {
    // Для картинок и прочего — тоже сначала сеть
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});