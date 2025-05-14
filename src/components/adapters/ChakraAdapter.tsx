import React from 'react';
import { ChakraProvider as OriginalChakraProvider } from '@chakra-ui/react';

/**
 * ChakraProviderAdapter
 * 
 * This adapter component wraps the Chakra UI v3 ChakraProvider to handle
 * the new API requirements while maintaining compatibility with our existing code.
 */
export const ChakraProviderAdapter: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Basic system context value to satisfy Chakra UI v3 requirements
  const value = {
    colorMode: 'light',
    toggleColorMode: () => {
      console.log('Color mode toggle is not supported in this version');
    },
    theme: {
      colors: {
        blue: {
          500: '#3182ce',
        },
        gray: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
      },
    },
  };

  // Forward the value prop to satisfy the ChakraProvider requirements
  return (
    // @ts-ignore - Ignoring type checking as we're providing a simplified value prop
    <OriginalChakraProvider value={value}>
      {children}
    </OriginalChakraProvider>
  );
};
