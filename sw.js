const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/offline.html',
  '/about.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.error('Failed to cache resources during install:', err);
      });
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event listener
self.addEventListener('fetch', event => {
  console.log('Fetch event for:', event.request.url);

  event.respondWith(
    caches.match(event.request).then(response => {
      console.log('Cache hit:', response ? 'Yes' : 'No', event.request.url);

      // Return cached response or try to fetch from the network
      return response || fetch(event.request).catch(() => {
        console.warn('Fetch failed; returning offline page.');

        // Return cached offline page if fetch fails
        return caches.match('/offline.html').catch(() => {
          console.error('Offline page not available.');
          return new Response('Offline page not found.');
        });
      });
    })
  );
});
