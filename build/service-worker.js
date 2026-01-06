self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.resolve()
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});
