'use client'

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, refresh the page
                    if (confirm('New version available! Refresh to update?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or banner
      showInstallPromotion();
    });

    function showInstallPromotion() {
      // Create install banner
      const installBanner = document.createElement('div');
      installBanner.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        ">
          <span>📱 Install ShiftTracker for quick access</span>
          <div>
            <button id="install-btn" style="
              background: white;
              color: #3b82f6;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              margin-right: 10px;
              font-weight: 600;
              cursor: pointer;
            ">Install</button>
            <button id="dismiss-btn" style="
              background: transparent;
              color: white;
              border: 1px solid white;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
            ">Later</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(installBanner);
      
      // Install button click
      document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
        }
        installBanner.remove();
      });
      
      // Dismiss button click
      document.getElementById('dismiss-btn')?.addEventListener('click', () => {
        installBanner.remove();
      });
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (document.body.contains(installBanner)) {
          installBanner.remove();
        }
      }, 10000);
    }

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });

  }, []);

  return null; // This component doesn't render anything
}
