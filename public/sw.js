// Service Worker for FundBio Dashboard
const CACHE_NAME = 'fundbio-dashboard-v1';
const STATIC_CACHE_NAME = 'fundbio-static-v1';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/signin',
  '/manifest.json',
  '/favicon.ico',
  // Add critical CSS and JS files
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
  // Leaflet CSS and JS
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
];

// API routes to cache
const API_CACHE_ROUTES = [
  '/api/indicadores-estrategicos',
  '/api/indicadores-generales',
  '/api/indicadores-seguimiento',
  '/api/proyectos',
  '/api/user/current'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache;
      })
    ])
  );
  
  // Force activation
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    event.respondWith(handleDataRequest(request));
  }
});

// Handle GET requests
async function handleGetRequest(request) {
  const url = new URL(request.url);
  
  // Static assets - cache first
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.includes('/favicon.ico') ||
      url.pathname.includes('/manifest.json')) {
    return cacheFirst(request, STATIC_CACHE_NAME);
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    return networkFirst(request, CACHE_NAME);
  }
  
  // HTML pages - network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    return networkFirst(request, CACHE_NAME);
  }
  
  // Images and other assets - cache first
  if (request.headers.get('accept')?.includes('image/')) {
    return cacheFirst(request, CACHE_NAME);
  }
  
  // Default to network first
  return networkFirst(request, CACHE_NAME);
}

// Handle data modification requests
async function handleDataRequest(request) {
  try {
    const response = await fetch(request);
    
    // If successful, invalidate related cache entries
    if (response.ok) {
      await invalidateCache(request.url);
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: Data request failed:', error);
    
    // Return a custom offline response for failed data requests
    return new Response(
      JSON.stringify({
        error: 'Request failed - you appear to be offline',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Ignore background update errors
      });
      
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache first failed:', error);
    return new Response('Offline - content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(
        createOfflinePage(),
        {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    return new Response('Offline - content not available', { status: 503 });
  }
}

// Invalidate cache entries
async function invalidateCache(url) {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  // Remove related cache entries
  const urlObj = new URL(url);
  const promises = keys
    .filter(request => {
      const requestUrl = new URL(request.url);
      return requestUrl.pathname.startsWith(urlObj.pathname.split('/').slice(0, -1).join('/'));
    })
    .map(request => cache.delete(request));
  
  await Promise.all(promises);
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sin conexión - FundBio Dashboard</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 1rem;
        }
        p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: #2563eb;
        }
        .icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          opacity: 0.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25A9.75 9.75 0 1 0 12 21.75 9.75 9.75 0 0 0 12 2.25Z" />
        </svg>
        <h1>Sin conexión</h1>
        <p>No hay conexión a internet. Algunas funciones pueden no estar disponibles.</p>
        <button onclick="window.location.reload()">Reintentar</button>
      </div>
    </body>
    </html>
  `;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle queued actions when back online
  console.log('Service Worker: Performing background sync');
  
  // This could sync queued data modifications, etc.
  // For now, just clear expired cache entries
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  // Remove entries older than 24 hours
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  const promises = keys.map(async (request) => {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          return cache.delete(request);
        }
      }
    }
  });
  
  await Promise.all(promises);
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación del dashboard',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FundBio Dashboard', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/dashboard')
  );
});