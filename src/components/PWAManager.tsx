import React, { useEffect, useState } from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';
import { registerSW } from 'workbox-window';

export default function PWAManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const toast = useToast();

  // Check online status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
      
      if (navigator.onLine) {
        toast({
          title: 'You are back online',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'You are offline',
          description: 'Data will be saved locally and synced when you reconnect',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [toast]);

  // Register service worker
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      (window as any).workbox !== undefined
    ) {
      const wb = registerSW({
        onInstalled: (event) => {
          console.log('Service Worker installed:', event);
        },
        onUpdateFound: () => {
          console.log('New Service Worker update found');
        },
        onUpdateReady: () => {
          console.log('Service Worker update ready');
          wb.messageSkipWaiting();
        },
        onSuccess: () => {
          console.log('Service Worker registration successful');
        },
      });
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom install button
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    
    if (choiceResult.outcome === 'accepted') {
      toast({
        title: 'Thank you for installing our app!',
        status: 'success',
        duration: 3000,
      });
    }
  };

  return (
    <>
      {isOffline && (
        <Box className="offline-banner">
          📴 You're offline. Changes will be saved locally and synced when you're back online.
        </Box>
      )}

      {showInstallPrompt && (
        <Box className="pwa-install-prompt">
          <Text fontWeight="bold" mb={2}>
            Install Indaba Care
          </Text>
          <Text mb={3} fontSize="sm">
            Install this app on your device for quick access even when offline.
          </Text>
          <Button size="sm" colorScheme="blue" onClick={handleInstallClick}>
            Install
          </Button>
        </Box>
      )}
    </>
  );
}
