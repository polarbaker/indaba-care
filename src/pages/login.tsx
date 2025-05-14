import { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Input, 
  Text, 
  Link, 
  Flex, 
  Image, 
  IconButton,
  Stack,
} from '@chakra-ui/react';

// Custom Divider component
const Divider = (props: any) => (
  <Box height="1px" bg="gray.200" my={6} {...props} />
);

// Import adapter components
import { FormControl, FormControlLabel as FormLabel, InputGroup, InputRightAddon as InputRightElement } from '../components/adapters/Form';
import { useAuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuthContext();
  const router = useRouter();
  // Simple toast implementation
  const toast = (props: any) => {
    console.log('Toast:', props);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Show toast message
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 2000,
      });
      router.push('/dashboard');
    } catch (error: any) {
      // Show toast message
      toast({
        title: 'Login failed',
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
      await signInWithGoogle();
      // Show toast message
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 2000,
      });
      router.push('/dashboard');
    } catch (error: any) {
      // Show toast message
      toast({
        title: 'Google login failed',
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
            // fallbackSrc prop removed
            mb={2}
          />
          <Heading size="lg" textAlign="center">Welcome back</Heading>
          <Text color="gray.600">Log in to your account</Text>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </FormControl>

            <Stack gap={10}>
              <Box textAlign="right">
                <Link as={NextLink} href="/forgot-password" color="blue.500">
                  Forgot password?
                </Link>
              </Box>
              <Button
                colorScheme="blue"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </Stack>

            <Divider my={6} />

            <Button
              w="full"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing in with Google...' : (
                <Flex alignItems="center" gap={2}>
                  <Image
                    src="/google-icon.png"
                    alt="Google Icon"
                    width="18px"
                    height="18px"
                  />
                  <Text>Continue with Google</Text>
                </Flex>
              )}
            </Button>
            
            <Box textAlign="center" mt={4}>
              <Text display="inline">Don't have an account? </Text>
              <Link as={NextLink} href="/register" color="blue.500">
                Sign up
              </Link>
            </Box>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
