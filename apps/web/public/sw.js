// Agomoni PWA Service Worker
const CACHE_NAME = 'agomoni-static-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/durga-eye.svg',
];

const isLocalhost = Boolean(
  self.location.hostname === 'localhost' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

self.addEventListener('install', (event) => {
  if (isLocalhost) {
    // Immediately unregister on localhost to avoid caching dev server assets
    self.registration.unregister();
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (isLocalhost) {
    return; // Never intercept or cache anything during localhost development
  }
  const url = new URL(event.request.url);

  // SECURITY RULE: Never cache sensitive API calls, chats, or payments
  if (
    url.pathname.startsWith('/api/v1/chat') ||
    url.pathname.startsWith('/api/v1/payments') ||
    url.pathname.startsWith('/api/v1/dating') ||
    url.pathname.startsWith('/api/v1/emergency/contacts') ||
    url.pathname.startsWith('/socket.io')
  ) {
    return; // Pass through to network directly without caching
  }

  // Network-first with cache fallback for HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Cache-first for images, fonts, and static assets
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
