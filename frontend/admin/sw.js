const CACHE_NAME = 'ae-admin-shell-v1';
const SHELL_ASSETS = [
  '/admin/dashboard.html',
  '/assets/css/style.css',
  '/assets/css/admin.css',
  '/assets/js/admin.js',
  '/assets/images/icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API/auth traffic; always keep admin data live and protected.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate' && url.origin === self.location.origin && url.pathname.startsWith('/admin/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/admin/dashboard.html'))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
