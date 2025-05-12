import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { setupSyncListeners } from '../lib/sync';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Dynamically import components to prevent SSR issues
const FeedbackButton = dynamic(() => import('../components/FeedbackButton'), {
  ssr: false,
});

const PWAManager = dynamic(() => import('../components/PWAManager'), {
  ssr: false,
});

// Create a custom theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f7fafc',
      100: '#e6f2ff',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: 'var(--font-inter), sans-serif',
    body: 'var(--font-inter), sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

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
  
  // Setup sync listeners when app loads
  useEffect(() => {
    setupSyncListeners();
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
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
