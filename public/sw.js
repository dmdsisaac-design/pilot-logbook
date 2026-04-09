// This is a placeholder service worker.
// vite-plugin-pwa will generate the production service worker via Workbox.
// This file exists for development/fallback purposes.

const CACHE_NAME = 'pilot-logbook-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
