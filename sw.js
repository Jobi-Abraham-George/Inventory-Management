const CACHE_NAME = 'invotraq-v1.0.0';
const urlsToCache = [
  '/Inventory-Management/',
  '/Inventory-Management/index.html',
  '/Inventory-Management/manifest.json',
  '/Inventory-Management/icons/icon-192x192.png',
  '/Inventory-Management/icons/icon-512x512.png',
  // Add more static assets as needed
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch((error) => {
        console.log('Fetch failed:', error);
        // Return offline page or cached content
        if (event.request.mode === 'navigate') {
          return caches.match('/Inventory-Management/index.html');
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'inventory-sync') {
    event.waitUntil(
      // Sync inventory data when back online
      syncInventoryData()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New inventory notification',
    icon: '/Inventory-Management/icons/icon-192x192.png',
    badge: '/Inventory-Management/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Inventory',
        icon: '/Inventory-Management/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/Inventory-Management/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('InvoTraq', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/Inventory-Management/')
    );
  }
});

// Sync function for inventory data
async function syncInventoryData() {
  try {
    // This would sync offline changes when back online
    console.log('Syncing inventory data...');
    // Implementation would depend on your backend API
  } catch (error) {
    console.error('Sync failed:', error);
  }
}