import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LanguageSelector from './LanguageSelector';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSync } from '../hooks/useSync';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, onToggle } = useDisclosure();
  const { user, signOut } = useAuthContext();
  const { isOnline, performSync, isSyncing } = useSync();
  const router = useRouter();
  const toast = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const { t } = useTranslation('common');

  // Check online status and show offline banner
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Failed to sign out',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSync = async () => {
    try {
      const result = await performSync();
      if (result.success) {
        toast({
          title: 'Sync completed',
          description: `Pushed ${result.pushed} items, pulled ${result.pulled} items`,
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'Sync failed',
          description: `Reason: ${result.reason}`,
          status: 'error',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Sync error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? (
                <Icon 
                  w={3} 
                  h={3} 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </Icon>
              ) : (
                <Icon 
                  w={5} 
                  h={5} 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </Icon>
              )
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Link
            as={NextLink}
            href="/dashboard"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            fontWeight="bold"
            fontSize="lg"
            color={useColorModeValue('gray.800', 'white')}
            _hover={{
              textDecoration: 'none',
            }}
          >
            {t('app.name')}
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {!isOnline && (
            <Badge colorScheme="red" variant="subtle" p={2} borderRadius="md">
              Offline Mode
            </Badge>
          )}
          
          {user ? (
            <>
              <Button
                size="sm"
                fontSize="sm"
                variant="ghost"
                onClick={handleSync}
                isLoading={isSyncing}
                loadingText={t('sync.syncing')}
                isDisabled={!isOnline}
              >
                {isOnline ? t('sync.syncData') : t('offline.offlineMode')}
              </Button>
              
              <Flex align="center" gap={4}>
                <LanguageSelector />
                
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <Avatar
                      size={'sm'}
                      src={user.photoURL || ''}
                      name={user.displayName || '?'}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={NextLink} href="/profile">
                      {t('navigation.profile')}
                    </MenuItem>
                    <MenuItem as={NextLink} href="/settings">
                      {t('navigation.settings')}
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleSignOut}>{t('navigation.signOut')}</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={4}>
                <LanguageSelector />
                
                <Button
                  as={NextLink}
                  fontSize={'sm'}
                  fontWeight={400}
                  variant={'link'}
                  href={'/login'}
                >
                  {t('auth.login')}
                </Button>
                <Button
                  as={NextLink}
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'blue.400'}
                  href={'/register'}
                  _hover={{
                    bg: 'blue.300',
                  }}
                >
                  {t('auth.register')}
                </Button>
              </Flex>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>

      <Container maxW="container.xl" py={5}>
        {children}
      </Container>

      {isOffline && (
        <Box className="offline-banner">
          📴 {t('offline.youreOffline')}
        </Box>
      )}
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={NextLink}
                p={2}
                href={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={NextLink}
      href={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('blue.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'blue.400' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'blue.400'} w={5} h={5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </Icon>
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={Icon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </Icon>
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link as={NextLink} key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Children',
    href: '/children',
  },
  {
    label: 'Schedule',
    href: '/schedule',
  },
  {
    label: 'Photos',
    href: '/photos',
  },
  {
    label: 'Resources',
    href: '/resource-hub',
  },
];
