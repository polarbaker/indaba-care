import { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link,
  Flex,
  Image,
  InputGroup,
  InputRightElement,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuthContext } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { Family } from '../types';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { signUp, signInWithGoogle } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const userCredential = await signUp(email, password);
      
      // Create a new family record for the user
      const familyId = userCredential.uid;
      const newFamily: Family = {
        id: familyId,
        name: familyName,
        email: email,
        preferences: {
          languagePreference: 'en',
          notificationPreferences: {
            email: true,
            push: false,
            sms: false,
          },
          emergencyContacts: [],
        },
        children: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Add the family to Firestore
      await setDoc(doc(firestore, 'families', familyId), newFamily);
      
      toast({
        title: 'Account created successfully',
        status: 'success',
        duration: 3000,
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      
      // Check if this is a new user by trying to get their family record
      try {
        const familyRef = doc(firestore, 'families', userCredential.uid);
        
        // If no error is thrown, the family exists, redirect to dashboard
        // If an error is thrown, we need to create a new family record
        
        // Create a new family record for the user
        const newFamily: Family = {
          id: userCredential.uid,
          name: userCredential.displayName || 'Family',
          email: userCredential.email || '',
          preferences: {
            languagePreference: 'en',
            notificationPreferences: {
              email: true,
              push: false,
              sms: false,
            },
            emergencyContacts: [],
          },
          children: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        // Add the family to Firestore
        await setDoc(doc(firestore, 'families', userCredential.uid), newFamily);
      } catch (error) {
        // Family already exists, do nothing
      }
      
      toast({
        title: 'Registration successful',
        status: 'success',
        duration: 2000,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Google registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg" 
        bg="white"
      >
        <Flex direction="column" align="center" mb={8}>
          <Image
            src="/logo.png"
            alt="Indaba Care Logo"
            height="80px"
            fallbackSrc="https://via.placeholder.com/150x80?text=Indaba+Care"
            mb={2}
          />
          <Heading size="lg" textAlign="center">Create your account</Heading>
          <Text color="gray.600">Join Indaba Care today</Text>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="familyName" isRequired>
              <FormLabel>Family Name</FormLabel>
              <Input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </FormControl>
            
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormControl>

            <FormControl id="password" isRequired isInvalid={!!passwordError}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            </FormControl>

            <FormControl id="confirmPassword" isRequired isInvalid={!!passwordError}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            </FormControl>

            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText="Creating account..."
              mt={6}
            >
              Sign up
            </Button>

            <Divider my={6} />

            <Button
              w="full"
              variant="outline"
              leftIcon={
                <Image
                  src="/google-icon.png"
                  alt="Google Icon"
                  width="18px"
                  height="18px"
                  fallbackSrc="https://via.placeholder.com/18?text=G"
                />
              }
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
              loadingText="Signing up with Google..."
            >
              Sign up with Google
            </Button>
            
            <Box textAlign="center" mt={4}>
              <Text display="inline">Already have an account? </Text>
              <Link as={NextLink} href="/login" color="blue.500">
                Log in
              </Link>
            </Box>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
