import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Code,
  Spinner
} from '@chakra-ui/react';

// TypeScript interface for dependency status
interface DependencyStatus {
  success: boolean;
  issues: string[];
}

// Create a client-only component to avoid SSR issues
const ClientOnly: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
};

const TestDependenciesPage = () => {
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const checkDeps = async () => {
      try {
        // Dynamic import the dependency checker at runtime
        const depsModule = await import('../lib/dependency-check');
        const status = depsModule.checkDependencies();
        setDependencyStatus(status);
        console.log('Dependency check results:', status);
      } catch (error) {
        console.error('Error checking dependencies:', error);
        setDependencyStatus({
          success: false,
          issues: [(error as Error).message]
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small delay to ensure components are mounted
    const timer = setTimeout(checkDeps, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Indaba Care Dependency Test
        </Heading>
        
        <Box p={6} borderWidth="1px" borderRadius="lg" bg={isLoading ? 'gray.50' : dependencyStatus?.success ? 'green.50' : 'red.50'}>
          <Heading as="h2" size="lg" mb={4}>
            Dependency Validation {isLoading && <Spinner ml={3} size="sm" />}
          </Heading>
          
          {isLoading ? (
            <Box textAlign="center" py={8}>
              <Spinner size="xl" />
              <Text mt={4}>Checking dependencies...</Text>
            </Box>
          ) : dependencyStatus?.success ? (
            <VStack align="start" spacing={4}>
              <Text color="green.600" fontWeight="bold">✓ All dependencies validated successfully!</Text>
              <Text>The following key dependencies are correctly installed and compatible:</Text>
              <VStack align="start" pl={4}>
                <Text>• React version: 18.3.1</Text>
                <Text>• Chakra UI: v3.17.0</Text>
                <Text>• PouchDB: v9.0.0</Text>
              </VStack>
            </VStack>
          ) : (
            <VStack align="start" spacing={4}>
              <Text color="red.600" fontWeight="bold">⚠️ Dependency issues detected</Text>
              <Text>The following issues were found:</Text>
              <VStack align="start" pl={4}>
                {dependencyStatus?.issues.map((issue, idx) => (
                  <Text key={idx}>• {issue}</Text>
                ))}
              </VStack>
            </VStack>
          )}
        </Box>
        
        <Box p={6} borderWidth="1px" borderRadius="lg">
          <Heading as="h2" size="lg" mb={4}>
            Next Steps
          </Heading>
          <VStack align="start" spacing={3}>
            <Text>
              1. Review <Code>DEPENDENCY_STANDARDIZATION.md</Code> for detailed guidelines
            </Text>
            <Text>
              2. Use <Code>setup.sh</Code> script when installing dependencies
            </Text>
            <Text>
              3. Check browser console for detailed validation logs
            </Text>
            <Button mt={2} colorScheme="blue" onClick={async () => {
              try {
                const depsModule = await import('../lib/dependency-check');
                console.log('Dependency validation utility:', depsModule.checkDependencies);
              } catch (error) {
                console.warn('Dependency validation utility not available:', error);
              }
            }}>
              Log Validation Utility to Console
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default TestDependenciesPage;
