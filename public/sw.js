// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

self.addEventListener('fetch', (event) => {
  // Simple fetch passthrough – you can extend this to cache assets later
  event.respondWith(fetch(event.request));
});