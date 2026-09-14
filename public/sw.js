// Siira PWA Service Worker
// Provides offline support for the app shell.
//
// Auth routes (/auth/*) are NEVER intercepted: magic-link callbacks carry
// single-use codes and Set-Cookie redirects that must hit the network.

const CACHE_NAME = 'siira-v2';
const STATIC_ASSETS = [
  '/',
  '/talk',
  '/themes',
  '/words',
  '/manifest.webmanifest',
];

// Install - cache static assets (each asset independently so one failure
// doesn't fail the whole install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          fetch(url, { redirect: 'follow' })
            .then((response) => {
              if (response.ok) return cache.put(url, response);
              return Promise.resolve();
            })
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

function isAuthRequest(url) {
  return url.pathname.startsWith('/auth/');
}

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API routes and external requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;

  // NEVER intercept auth flows (magic-link callback, etc.): always go to
  // the network and never cache the result.
  if (isAuthRequest(url)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, update in background
        event.waitUntil(
          fetch(event.request, { redirect: 'follow' }).then((networkResponse) => {
            if (networkResponse && networkResponse.ok && !networkResponse.redirected) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone()).catch(() => {});
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network with redirect follow
      return fetch(event.request, { redirect: 'follow' }).then((networkResponse) => {
        if (networkResponse && networkResponse.ok && !networkResponse.redirected) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        // Re-throw so subresource requests fail normally instead of
        // resolving respondWith with undefined (which breaks the page).
        throw new Error('offline');
      });
    })
  );
});

// Handle push notifications (future)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New theme available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: data.url || '/talk',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Siira', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data || '/talk');
    })
  );
});
