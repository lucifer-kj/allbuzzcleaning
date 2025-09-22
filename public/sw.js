const CACHE_NAME = 'all-buzz-cleaning-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/reviews',
  '/analytics',
  '/settings',
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
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
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
