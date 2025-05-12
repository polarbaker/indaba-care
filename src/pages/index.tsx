import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Container,
  Stack,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuthContext } from '../contexts/AuthContext';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import type { GetStaticProps } from 'next';

export default function Home() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { t } = useTranslation('common');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  const handleGetStarted = () => {
    router.push('/register');
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box>
      <Box as="header" py={4} px={8} bg={bgColor} borderBottom="1px" borderColor="gray.200">
        <Flex align="center" justify="space-between" maxW="container.xl" mx="auto">
          <Heading as="h1" size="md" color="blue.500">
            {t('app.name')}
          </Heading>
          
          <Stack direction="row" spacing={4}>
            <Button 
              variant="ghost" 
              colorScheme="blue" 
              onClick={handleLogin}
            >
              {t('auth.login')}
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleGetStarted}
            >
              {t('auth.register')}
            </Button>
          </Stack>
        </Flex>
      </Box>
      
      <Box as="main">
        <Container maxW="container.xl" py={20}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={12}
          >
            <Box maxW={{ base: '100%', md: '50%' }}>
              <Heading
                as="h2"
                size="2xl"
                mb={6}
                color={headingColor}
                lineHeight="1.2"
              >
                Childcare Management with Offline Capabilities
              </Heading>
              
              <Text fontSize="xl" mb={8} color={textColor}>
                Indaba Care helps parents and caregivers manage childcare activities efficiently,
                even without internet access. Track schedules, share photos, access resources,
                and more—all with a seamless offline-first experience.
              </Text>
              
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button 
                  size="lg" 
                  colorScheme="blue" 
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  colorScheme="blue"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
            
            <Box 
              maxW={{ base: '100%', md: '45%' }} 
              borderRadius="xl" 
              overflow="hidden"
              boxShadow="xl"
            >
              <Image
                src="/hero-image.png"
                alt="Indaba Care App Screenshot"
                fallbackSrc="https://via.placeholder.com/600x400?text=Indaba+Care"
              />
            </Box>
          </Flex>
          
          <Box mt={20}>
            <Heading as="h3" size="lg" mb={12} textAlign="center">
              Key Features
            </Heading>
            
            <Stack 
              direction={{ base: 'column', md: 'row' }}
              spacing={8}
              justify="center"
              wrap="wrap"
            >
              <FeatureCard 
                title="Works Offline"
                description="Continue using the app without internet. Data syncs automatically when you're back online."
                icon="🌐"
              />
              <FeatureCard 
                title="Child Profiles"
                description="Create detailed profiles with medical info, schedules, and preferences."
                icon="👶"
              />
              <FeatureCard 
                title="Photo Sharing"
                description="Capture and share special moments securely with family members."
                icon="📷"
              />
              <FeatureCard 
                title="Schedule Tracking"
                description="Manage nanny hours and childcare sessions efficiently."
                icon="📅"
              />
            </Stack>
          </Box>
        </Container>
      </Box>
      
      <Box as="footer" py={12} bg="gray.50" borderTop="1px" borderColor="gray.200">
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'flex-start' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Box mb={{ base: 6, md: 0 }}>
              <Heading as="h3" size="md" color="blue.500" mb={2}>
                {t('app.name')}
              </Heading>
              <Text color="gray.600" fontSize="sm">
                &copy; {new Date().getFullYear()} Indaba Care. All rights reserved.
              </Text>
            </Box>
            
            <Stack 
              direction={{ base: 'column', sm: 'row' }}
              spacing={{ base: 4, sm: 8 }}
              align={{ base: 'center', sm: 'flex-start' }}
            >
              <Stack spacing={2}>
                <Text fontWeight="bold" mb={1}>Product</Text>
                <Text color="gray.600" fontSize="sm">Features</Text>
                <Text color="gray.600" fontSize="sm">Security</Text>
                <Text color="gray.600" fontSize="sm">Privacy</Text>
              </Stack>
              
              <Stack spacing={2}>
                <Text fontWeight="bold" mb={1}>Support</Text>
                <Text color="gray.600" fontSize="sm">Help Center</Text>
                <Text color="gray.600" fontSize="sm">Contact Us</Text>
                <Text color="gray.600" fontSize="sm">FAQs</Text>
              </Stack>
              
              <Stack spacing={2}>
                <Text fontWeight="bold" mb={1}>Company</Text>
                <Text color="gray.600" fontSize="sm">About Us</Text>
                <Text color="gray.600" fontSize="sm">Careers</Text>
                <Text color="gray.600" fontSize="sm">Blog</Text>
              </Stack>
            </Stack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      flex="1"
      minW={{ base: '100%', md: '250px' }}
      maxW={{ base: '100%', md: '300px' }}
      textAlign="center"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
    >
      <Text fontSize="4xl" mb={4}>
        {icon}
      </Text>
      <Heading as="h4" size="md" mb={3}>
        {title}
      </Heading>
      <Text color="gray.600">
        {description}
      </Text>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};
