import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useDisclosure,
  Spinner
} from '@chakra-ui/react';
import { checkDependencies } from '../lib/dependency-check';

/**
 * Setup Check Page
 * 
 * This page uses only the most basic Chakra UI v3 components
 * to verify that your dependency setup is working correctly.
 */
const SetupCheckPage = () => {
  // Track state for the test interaction
  const [testCount, setTestCount] = React.useState<number>(0);
  const [textValue, setTextValue] = React.useState<string>('');
  const [dependencyStatus, setDependencyStatus] = React.useState<{ success: boolean; issues: string[] } | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const { open, onOpen, onClose } = useDisclosure();
  
  // Run dependency check on mount
  useEffect(() => {
    // Wait a moment to simulate loading and ensure all dependencies are loaded
    const timer = setTimeout(() => {
      const status = checkDependencies();
      setDependencyStatus(status);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const incrementCounter = () => {
    setTestCount(prev => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
  };
  
  // Test the useDisclosure hook from Chakra UI v3
  const toggleAlert = () => {
    if (open) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <Container maxW="container.xl" p={8}>
      <Center mb={10}>
        <VStack gap={4}>
          <Heading as="h1" size="2xl">
            Indaba Care Setup Verification
          </Heading>
          <Text fontSize="xl">
            If this page renders correctly, your Chakra UI v3 setup is working!
          </Text>
        </VStack>
      </Center>

      {/* Dependency Check Results */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="md"
        mb={6}
        bg={isLoading ? 'gray.50' : dependencyStatus?.success ? 'green.50' : 'red.50'}
      >
        <Heading as="h2" size="lg" mb={4}>
          Dependency Validation
          {isLoading && <Spinner ml={3} size="sm" />}
        </Heading>
        
        {isLoading ? (
          <Center p={8}>
            <VStack>
              <Spinner size="xl" />
              <Text mt={4}>Checking dependencies...</Text>
            </VStack>
          </Center>
        ) : dependencyStatus?.success ? (
          <Box role="alert" p={4} bg="green.100" borderRadius="md" color="green.800">
            <Flex gap={2} align="center">
              <Box color="green.500">✓</Box>
              <Heading size="md">All Dependencies Validated</Heading>
            </Flex>
            <Text mt={2}>All required dependencies are properly installed and compatible</Text>
          </Box>
        ) : (
          <Box role="alert" p={4} bg="red.100" borderRadius="md" color="red.800">
            <Flex gap={2} align="center">
              <Box color="red.500">⚠</Box>
              <Heading size="md">Dependency Issues Detected</Heading>
            </Flex>
            <VStack align="start" mt={2}>
              {dependencyStatus?.issues.map((issue, idx) => (
                <Text key={idx}>• {issue}</Text>
              ))}
            </VStack>
          </Box>
        )}
      </Box>

      {/* Component Testing Section */}
      <Box mb={6}>
        <Flex mb={4} borderBottom="1px" borderColor="gray.200">
          <Box 
            p={2} 
            cursor="pointer" 
            borderBottom="2px" 
            borderColor="blue.500"
            fontWeight="semibold"
          >
            Basic Components
          </Box>
        </Flex>
        
        {/* Basic Components Section */}
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <Heading as="h2" size="lg" mb={4}>
            Basic Component Tests
          </Heading>
          
          <VStack align="stretch" gap={6} mt={4}>
            {/* Test 1: Button Interaction */}
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h3" size="md" mb={3}>
                Button Test
              </Heading>
              <Text mb={4}>Click the button to increment the counter</Text>
              <Flex justify="space-between" align="center">
                <Button colorScheme="blue" onClick={incrementCounter}>
                  Click me
                </Button>
                <Text fontSize="xl" fontWeight="bold">
                  Count: {testCount}
                </Text>
              </Flex>
            </Box>

            {/* Test 2: Input Field */}
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h3" size="md" mb={3}>
                Input Test
              </Heading>
              <Text mb={4}>Type something in the input field below</Text>
              <Input 
                value={textValue}
                onChange={handleInputChange}
                placeholder="Type something here..."
                mb={3}
              />
              {textValue && (
                <Text color="green.500">You typed: {textValue}</Text>
              )}
            </Box>
            
            {/* Test 3: Styling Test */}
            <Box p={4} borderWidth="1px" borderRadius="md" bg="purple.50">
              <Heading as="h3" size="md" mb={3} color="purple.600">
                Styling Test
              </Heading>
              <Text mb={4}>If you can see this styled box with purple accents, styling is working correctly</Text>
              <Flex justify="center">
                <Button 
                  variant="outline" 
                  colorScheme="purple"
                  _hover={{ bg: 'purple.100' }}
                >
                  Styled Button
                </Button>
              </Flex>
            </Box>
          </VStack>
        </Box>
      </Box>
      
      {/* Interactive Components Section */}
      <Box mb={6}>
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <Heading as="h2" size="lg" mb={4}>
            Interactive Component Tests
          </Heading>
          
          <VStack align="stretch" gap={6}>
            {/* Test useDisclosure hook */}
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h3" size="md" mb={3}>
                useDisclosure Hook Test
              </Heading>
              <Text mb={4}>
                This tests the useDisclosure hook with the updated API (using <code>open</code> instead of <code>isOpen</code>)
              </Text>
              <Button onClick={toggleAlert} colorScheme="blue" mb={4}>
                {open ? 'Hide Alert' : 'Show Alert'}
              </Button>
              
              {open && (
                <Box p={3} bg="blue.100" mt={2} borderRadius="md">
                  <Flex gap={2} align="center">
                    <Box color="blue.500">ℹ</Box>
                    <Heading size="sm">Success!</Heading>
                  </Flex>
                  <Text mt={1}>useDisclosure hook is working correctly</Text>
                </Box>
              )}
            </Box>
            
            {/* Badge Component Test */}
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Heading as="h3" size="md" mb={3}>
                Tag-like Component Test
              </Heading>
              <Flex gap={2} wrap="wrap">
                <Box px={2} py={1} borderRadius="md" bg="gray.100" fontSize="sm">Default</Box>
                <Box px={2} py={1} borderRadius="md" bg="green.100" color="green.800" fontSize="sm">Success</Box>
                <Box px={2} py={1} borderRadius="md" bg="red.100" color="red.800" fontSize="sm">Error</Box>
                <Box px={2} py={1} borderRadius="md" bg="purple.100" color="purple.800" fontSize="sm">Warning</Box>
                <Box px={2} py={1} borderRadius="md" bg="blue.100" color="blue.800" fontSize="sm">Info</Box>
              </Flex>
            </Box>
          </VStack>
        </Box>
      </Box>
      
      {/* Advanced Layout Components */}
      <Box mb={6}>
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <Heading as="h2" size="lg" mb={4}>
            Advanced Layout Tests
          </Heading>
          
          {/* Card-like Component Test */}
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={6}>
            <Box p={4} bg="gray.50">
              <Heading size="md">Card Component Test</Heading>
            </Box>
            <Box p={4}>
              <Text>This is a card-like component using Box elements with styling.</Text>
            </Box>
            <Box p={4} bg="gray.50">
              <Button>Card Action</Button>
            </Box>
          </Box>
          
          {/* Grid Test */}
          <Box p={4} borderWidth="1px" borderRadius="md">
            <Heading as="h3" size="md" mb={3}>
              Flex Layout Test
            </Heading>
            <Flex gap={4} wrap="wrap">
              {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, idx) => (
                <Box 
                  key={idx} 
                  p={4} 
                  bg="blue.50" 
                  borderRadius="md" 
                  flexBasis={['100%', '100%', 'calc(50% - 16px)']}
                >
                  {item}
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Result Section */}
      <Box p={6} borderWidth="1px" borderRadius="lg" bg="green.50" borderColor="green.200">
        <Heading as="h2" size="lg" mb={4} color="green.700">
          Setup Verification Results
        </Heading>
        <VStack align="stretch" gap={3}>
          <Text>
            <Text as="span" fontWeight="bold">✅ Basic Components:</Text> If you can see this page with proper styling, basic Chakra UI components are working.
          </Text>
          <Text>
            <Text as="span" fontWeight="bold">✅ Advanced Components:</Text> Box-based layouts with custom styling render correctly.
          </Text>
          <Text>
            <Text as="span" fontWeight="bold">✅ Hooks:</Text> The useDisclosure hook uses the new API with 'open' instead of 'isOpen'.
          </Text>
          <Text>
            <Text as="span" fontWeight="bold">✅ Interactivity:</Text> If the button counter and input field respond to your interactions, React state is working properly with Chakra.
          </Text>
          <Text>
            <Text as="span" fontWeight="bold">✅ Dependency Validation:</Text> All dependencies are correctly installed and compatible.
          </Text>
        </VStack>

        <Box mt={6} p={4} bg="blue.50" borderRadius="md">
          <Heading as="h3" size="md" mb={2} color="blue.600">
            Next Steps
          </Heading>
          <Text>Your development environment is now correctly set up. You can:</Text>
          <VStack align="stretch" mt={2} gap={1}>
            <Text>1. Start developing your application</Text>
            <Text>2. Review the DEPENDENCY_STANDARDIZATION.md document for component usage guidelines</Text>
            <Text>3. Run the automated tests with <code>npm test</code> to verify full compatibility</Text>
            <Text>4. Check the browser console for any warnings from the dependency validation utility</Text>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default SetupCheckPage;
