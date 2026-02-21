/* ========================================
   Service Worker for Offline Support
   ======================================== */

const CACHE_NAME = 'yt-lemon-string-v1';
const RUNTIME_CACHE = 'yt-lemon-runtime-v1';

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/variables.css',
    '/css/styles.css',
    '/css/components.css',
    '/css/mobile.css',
    '/js/config.js',
    '/js/utils/helpers.js',
    '/js/utils/dom.js',
    '/js/utils/storage.js',
    '/js/api/backend.js',
    '/js/components/player.js',
    '/js/components/search.js',
    '/js/components/library.js',
    '/js/components/playlist.js',
    '/js/components/queue.js',
    '/js/app.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/assets/images/placeholder.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip backend API calls (always use network)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Cache-first strategy for static assets
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    // Not in cache, fetch from network and cache it
                    return fetch(request).then((networkResponse) => {
                        // Clone response to cache it
                        const responseToCache = networkResponse.clone();

                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    });
                })
                .catch((error) => {
                    console.error('[Service Worker] Fetch failed:', error);

                    // Return offline page for HTML requests
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                })
        );

        return;
    }

    // Network-first strategy for everything else
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone response to cache it
                const responseToCache = response.clone();

                caches.open(RUNTIME_CACHE)
                    .then((cache) => {
                        cache.put(request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request);
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline actions (optional feature)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-queue') {
        console.log('[Service Worker] Background sync triggered');
        // Handle background sync for queued actions
        event.waitUntil(syncQueuedActions());
    }
});

async function syncQueuedActions() {
    // Placeholder for syncing offline actions when back online
    console.log('[Service Worker] Syncing queued actions...');
}
