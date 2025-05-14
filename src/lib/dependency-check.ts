import { version as reactVersion } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

/**
 * Utility to check critical dependencies at runtime
 * Helps detect compatibility issues before they cause runtime errors
 */
export function checkDependencies(): { success: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check React version
  const requiredReactVersion = '18.3.0';
  if (!reactVersion.startsWith('18.3')) {
    issues.push(`React version mismatch: Expected ${requiredReactVersion}, got ${reactVersion}`);
  }

  // Check Chakra UI
  try {
    if (!ChakraProvider) {
      issues.push('Chakra UI Provider not found');
    }
  } catch (error) {
    issues.push(`Chakra UI error: ${(error as Error).message}`);
  }

  // Check PouchDB - only in browser context
  if (typeof window !== 'undefined') {
    try {
      // Safely try to check for PouchDB
      let PouchDB;
      try {
        // Try to dynamically require PouchDB to avoid SSR issues
        PouchDB = require('pouchdb-browser');
      } catch (importError) {
        // If direct require fails, check if it's already in window (global scope)
        PouchDB = (window as any).PouchDB;
      }
      
      if (!PouchDB) {
        issues.push('PouchDB not available');
      } else {
        // Log success but don't create an actual instance to avoid side effects
        console.log('✓ PouchDB is available');
      }
    } catch (error) {
      issues.push(`PouchDB error: ${(error as Error).message}`);
    }
  }

  return {
    success: issues.length === 0,
    issues
  };
}

/**
 * Check and log dependency issues before starting the app
 * Call this in _app.tsx before rendering
 */
export function validateDependencies(): void {
  if (typeof window !== 'undefined') {
    const { success, issues } = checkDependencies();
    
    if (!success) {
      console.warn('⚠️ Dependency validation failed:');
      issues.forEach(issue => console.warn(`- ${issue}`));
      
      // Optionally log to monitoring service or display a user message
    } else {
      console.log('✅ All dependencies validated successfully');
    }
  }
}
