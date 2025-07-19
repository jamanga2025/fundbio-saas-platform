"use client";

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registered:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              showUpdateNotification();
            }
          });
        }
      });
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload);
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = () => {
    // Show a notification that an update is available
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 text-center';
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <span>Nueva versión disponible</span>
        <button onclick="window.location.reload()" class="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm">
          Actualizar
        </button>
      </div>
    `;
    
    document.body.appendChild(updateBanner);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.parentNode.removeChild(updateBanner);
      }
    }, 10000);
  };

  return null; // This component doesn't render anything
}

// Hook for offline status
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};