// Service Worker for Offline-First PWA
// Version: 1.0.0

const CACHE_NAME = 'store-billing-v1';
const RUNTIME_CACHE = 'store-runtime-v1';

// Static assets to cache on install (CSS, JS, images, manifest)
const STATIC_ASSETS = [
  '/static/style.css',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

// Icons to cache (optional - will fail gracefully if not present)
const ICONS_TO_CACHE = [
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png'
];

// Core routes to cache (HTML pages)
const CORE_ROUTES = [
  '/',
  '/add-sale',
  '/customers',
  '/items',
  '/sales'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // Cache static assets first (required)
      return cache.addAll(STATIC_ASSETS).then(() => {
        // Try to cache icons (optional - will fail gracefully if icons don't exist)
        console.log('[Service Worker] Attempting to cache icons');
        return Promise.all(
          ICONS_TO_CACHE.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(err => {
              console.log(`[Service Worker] Icon not found (will be created later): ${url}`);
            })
          )
        ).then(() => {
          // Then cache core routes (HTML pages)
          console.log('[Service Worker] Caching core routes');
          return Promise.all(
            CORE_ROUTES.map(url => 
              fetch(url).then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              }).catch(err => {
                console.log(`[Service Worker] Failed to cache ${url}:`, err);
              })
            )
          );
        });
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - let them go to network (we handle offline in IndexedDB)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategy: Network First, fallback to Cache
  event.respondWith(
    fetch(request).then((response) => {
      // If network request succeeds, cache it and return
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        
        // Cache HTML pages and static assets
        if (request.destination === 'document' || 
            request.destination === 'style' || 
            request.destination === 'script' ||
            request.destination === 'image') {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        
        return response;
      }
      
      // If response is not OK, try cache
      return caches.match(request);
    }).catch(() => {
      // Network failed - try cache
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If no cache and it's a document request, return home page
        if (request.destination === 'document') {
          return caches.match('/');
        }
        
        // Return a basic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

// Background sync for offline sales
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncOfflineSales());
  }
});

// Function to sync offline sales (called from main thread)
async function syncOfflineSales() {
  // This will be called from the main app when online
  // The actual sync logic is in the main app's JavaScript
  console.log('[Service Worker] Syncing offline sales...');
  return Promise.resolve();
}

