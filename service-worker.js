const CACHE_NAME = 'budget-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages
});

// Fetch event: serve cached content, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Serve from cache if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).catch(() => {
        // Optional: offline fallback page
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
