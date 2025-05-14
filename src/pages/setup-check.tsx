import React from 'react';
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
} from '@chakra-ui/react';

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
  
  const incrementCounter = () => {
    setTestCount(prev => prev + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(e.target.value);
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

      {/* Test Card 1: Basic Component Tests */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        boxShadow="md"
        mb={6}
      >
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

      {/* Result Section */}
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="green.50" 
        borderColor="green.200"
      >
        <Heading as="h2" size="lg" mb={4} color="green.700">
          Setup Verification Results
        </Heading>
        <VStack align="stretch" gap={3}>
          <Text>
            <Text as="span" fontWeight="bold">✅ Basic Components:</Text> If you can see this page with proper styling, basic Chakra UI components are working.
          </Text>
          <Text>
            <Text as="span" fontWeight="bold">✅ Interactivity:</Text> If the button counter and input field respond to your interactions, React state is working properly with Chakra.
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
            <Text>3. Explore additional Chakra UI v3 components as needed</Text>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default SetupCheckPage;
