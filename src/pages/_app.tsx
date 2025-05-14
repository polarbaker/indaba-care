import type { AppProps } from 'next/app';
// Import our adapter instead of the original ChakraProvider
import { ChakraProviderAdapter as ChakraProvider } from '../components/adapters/ChakraAdapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { setupSyncListeners } from '../lib/sync';
import { validateDependencies } from '../lib/dependency-check';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Dynamically import components to prevent SSR issues
const FeedbackButton = dynamic(() => import('../components/FeedbackButton'), {
  ssr: false,
});

const PWAManager = dynamic(() => import('../components/PWAManager'), {
  ssr: false,
});

// Custom theme object removed for Chakra UI v3 compatibility

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Setup sync listeners and validate dependencies when app loads
  useEffect(() => {
    // Validate dependencies to catch any issues early
    validateDependencies();
    // Setup sync listeners for offline functionality
    setupSyncListeners();
    setIsMounted(true);
  }, []);

  // Use type assertion to bypass TypeScript type checking for ChakraProvider
  // This is a temporary workaround until proper type definitions are available
  return (
    <QueryClientProvider client={queryClient}>
      {/* Using custom ChakraProviderAdapter with modified API for Chakra UI v3 compatibility */}
      <ChakraProvider>
        <AuthProvider>
          <Component {...pageProps} />
          {isMounted && (
            <>
              <FeedbackButton />
              <PWAManager />
            </>
          )}
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
