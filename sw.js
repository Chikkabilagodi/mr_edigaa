self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy to ensure API calls work, with simple fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("You are offline. Arohi needs an internet connection to chat.");
    })
  );
});