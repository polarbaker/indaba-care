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

  // Check PouchDB
  try {
    // We dynamic import PouchDB in the db.ts file, so we just check if it throws an error
    const PouchDB = typeof window !== 'undefined' ? require('pouchdb-browser') : null;
    if (!PouchDB && typeof window !== 'undefined') {
      issues.push('PouchDB not available');
    }
  } catch (error) {
    issues.push(`PouchDB error: ${(error as Error).message}`);
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
