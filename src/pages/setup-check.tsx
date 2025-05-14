import React from 'react';
import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

const SetupCheckPage = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  
  const showToast = () => {
    toast({
      title: 'Toast Test',
      description: 'This is a test toast notification',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="xl" mb={2}>
          Indaba Care Setup Verification
        </Heading>
        <Text fontSize="lg" color="gray.500">
          If all components below render correctly, your Chakra UI setup is working!
        </Text>
      </Box>

      <Flex 
        direction="column"
        p={5}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="md"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        mb={8}
      >
        <Heading as="h2" size="md" mb={4}>
          Test 1: Basic Components
        </Heading>
        
        <Stack spacing={4} mb={6}>
          <Button colorScheme="blue" onClick={showToast}>
            Test Toast Notification
          </Button>
          
          <Button colorScheme="teal" onClick={toggleColorMode}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </Stack>

        <FormControl mb={4}>
          <FormLabel>Test Input Field</FormLabel>
          <Input placeholder="This is a test input field" />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Test Select Field</FormLabel>
          <Select placeholder="Select an option">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Test Textarea</FormLabel>
          <Textarea placeholder="This is a test textarea" />
        </FormControl>
      </Flex>

      <Flex 
        direction="column"
        p={5}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="md"
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        mb={8}
      >
        <Heading as="h2" size="md" mb={4}>
          Test 2: Complex Components
        </Heading>

        <Tabs variant="enclosed" mb={6}>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Text>If you can see this, the Tabs component is working!</Text>
            </TabPanel>
            <TabPanel>
              <Text>This is the content for the second tab</Text>
            </TabPanel>
            <TabPanel>
              <Text>This is the content for the third tab</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Stack direction="row" spacing={4}>
          <Button colorScheme="purple" onClick={onModalOpen}>
            Open Test Modal
          </Button>
          <Button colorScheme="green" onClick={onDrawerOpen}>
            Open Test Drawer
          </Button>
        </Stack>
      </Flex>

      {/* Test Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Test Modal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>If you can see this modal, the Modal component is working correctly!</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Test Drawer */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Test Drawer</DrawerHeader>
          <DrawerBody>
            <Text>If you can see this drawer, the Drawer component is working correctly!</Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box 
        mt={10} 
        p={5} 
        borderWidth={1} 
        borderRadius="lg" 
        borderColor="green.400"
        bg="green.50"
        color="green.800"
      >
        <Heading as="h3" size="md" mb={2}>
          Setup Verification Result
        </Heading>
        <Text>If all components above rendered without errors and you can interact with them, your Chakra UI setup is working correctly! You can now proceed with development.</Text>
        <Text mt={4} fontWeight="bold">If you see any errors:</Text>
        <Text>1. Check the browser console for error messages</Text>
        <Text>2. Run the setup script again: <code>./setup.sh</code></Text>
        <Text>3. Refer to the <code>DEPENDENCY_STANDARDIZATION.md</code> for troubleshooting</Text>
      </Box>
    </Container>
  );
};

export default SetupCheckPage;
