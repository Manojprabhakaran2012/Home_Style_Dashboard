// Service Worker with offline support for HomeStyle Erode PWA

const CACHE_NAME = 'homestyleerode-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on SW install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - precache important assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
  );
  // Activate new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Ensure SW takes control of clients right away
  self.clients.claim();
});

// Fetch event - network-first strategy with offline fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For HTML pages: network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response for the cache
          const responseToCache = response.clone();
          
          // Add the response to cache for later offline use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // If fetch fails, try to get from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response or offline page
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // For other assets (images, css, js): cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response or fetch from network
        return cachedResponse || fetch(event.request)
          .then(response => {
            // Clone the response for the cache
            const responseToCache = response.clone();
            
            // Add the response to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // Special handling for image requests
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
              // Return a placeholder image or offline message
              return new Response('Image is not available offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            }
            throw error;
          });
      })
  );
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});