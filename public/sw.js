const CACHE_NAME = 'all-buzz-cleaning-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo/favicon.ico',
  '/logo/icons8-logo-ios-17-outlined-16.png',
  '/logo/icons8-logo-ios-17-outlined-32.png',
  '/logo/icons8-logo-ios-17-outlined-50.png',
  '/logo/icons8-logo-ios-17-outlined-57.png',
  '/logo/icons8-logo-ios-17-outlined-60.png',
  '/logo/icons8-logo-ios-17-outlined-70.png',
  '/logo/icons8-logo-ios-17-outlined-72.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(
          urlsToCache.map(async (url) => {
            try {
              const response = await fetch(url, { cache: 'no-store' });
              if (!response || !response.ok) return; // Skip failures
              await cache.put(url, response);
            } catch (e) {
              // Skip any asset that fails to fetch to avoid aborting install
              console.warn('Skipping cache of', url, e);
            }
          })
        );
      } catch (error) {
        console.error('Cache installation failed:', error);
      }
    })()
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Network-first for navigations to avoid cached redirects/pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        })
    );
    return;
  }

  // For other requests: cache-first fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline form submissions when connection is restored
  console.log('Background sync triggered');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo/icons8-logo-ios-17-outlined-72.png',
      badge: '/logo/icons8-logo-ios-17-outlined-32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
