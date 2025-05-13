import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Image,
  Badge,
  Skeleton,
  Flex,
} from '@chakra-ui/react';
// Import components from their specific packages
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/card';
import { Stack } from '@chakra-ui/layout';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Select } from '@chakra-ui/select';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import { Tag, TagLeftIcon, TagLabel } from '@chakra-ui/tag';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceDB } from '../lib/db';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { Resource } from '../types';
import { useSync } from '../hooks/useSync';

// Categories for resources
const RESOURCE_CATEGORIES = [
  { id: 'child-development', name: 'Child Development' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'activities', name: 'Activities' },
  { id: 'health-safety', name: 'Health & Safety' },
  { id: 'education', name: 'Education' },
];

export default function ResourceHub() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { isOnline } = useSync();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const cardBackground = useColorModeValue('white', 'gray.700');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Function to fetch resources from Firestore when online
  const fetchResourcesFromFirestore = async (): Promise<Resource[]> => {
    if (!isOnline) return [];

    try {
      let q = query(
        collection(firestore, 'resources'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const resources: Resource[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Resource;
        resources.push({
          ...data,
          id: doc.id,
        });

        // Cache the resource in PouchDB for offline access
        resourceDB.put({
          ...data,
          _id: doc.id,
          // Add sync metadata
          _syncedAt: Date.now()
        }).catch(error => {
          // Ignore document update conflicts
          if (error.name !== 'conflict') {
            console.error('Error caching resource:', error);
          }
        });
      });

      return resources;
    } catch (error) {
      console.error('Error fetching resources from Firestore:', error);
      return [];
    }
  };

  // Query resources from PouchDB (offline first)
  const { data: resources, isLoading: isResourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      try {
        // First try to get from PouchDB
        const result = await resourceDB.allDocs({
          include_docs: true,
        });

        const offlineResources = result.rows
          .map((row) => row.doc as Resource)
          .filter(Boolean);

        // If we have offline resources or we're offline, use those
        if (offlineResources.length > 0 || !isOnline) {
          return offlineResources;
        }

        // Otherwise fetch from Firestore and cache
        return await fetchResourcesFromFirestore();
      } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
      }
    },
  });

  // Filter resources based on search query and category
  const filteredResources = React.useMemo(() => {
    if (!resources) return [];

    return resources.filter((resource) => {
      const matchesSearch = searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === '' || resource.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchQuery, filterCategory]);

  // Get resources for the active tab
  const getTabResources = (tabIndex: number) => {
    if (tabIndex === 0) return filteredResources;

    const categoryId = RESOURCE_CATEGORIES[tabIndex - 1]?.id;
    return filteredResources.filter(resource => resource.category === categoryId);
  };

  // Function to mark a resource as available offline
  const markResourceOfflineMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      try {
        // Get the latest version
        const doc = await resourceDB.get(resource.id);
        
        // Update the offline availability
        return await resourceDB.put({
          ...doc,
          isAvailableOffline: !doc.isAvailableOffline,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error updating resource offline status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const handleMarkOffline = async (resource: Resource) => {
    try {
      await markResourceOfflineMutation.mutateAsync(resource);
    } catch (error) {
      console.error('Failed to update offline status:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box py={5}>
          <Skeleton height="40px" width="300px" mb={5} />
          <Skeleton height="20px" width="500px" mb={10} />
          <Tabs>
            <Skeleton height="40px" mb={5} />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              <Skeleton height="300px" />
              <Skeleton height="300px" />
              <Skeleton height="300px" />
            </SimpleGrid>
          </Tabs>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={5}>
        <Heading as="h1" size="xl" mb={2}>
          Resource Hub
        </Heading>
        <Text color="gray.600" mb={6}>
          Access guides, activities, and educational resources for childcare
        </Text>

        {!isOnline && (
          <Alert status="info" mb={6}>
            <AlertIcon />
            You're currently offline. Only resources marked for offline use are available.
          </Alert>
        )}

        <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup maxW={{ base: '100%', md: '60%' }}>
            <InputLeftElement pointerEvents="none">
              <Box
                color="gray.400"
                role="img"
                aria-label="search"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="20px"
                  height="20px"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Box>
            </InputLeftElement>
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="All Categories"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            maxW={{ base: '100%', md: '40%' }}
          >
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Flex>

        <Tabs
          variant="soft-rounded"
          colorScheme="blue"
          onChange={setActiveTabIndex}
          index={activeTabIndex}
        >
          <TabList overflowX="auto" pb={4} css={{
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
            },
          }}>
            <Tab>All</Tab>
            {RESOURCE_CATEGORIES.map((category) => (
              <Tab key={category.id}>{category.name}</Tab>
            ))}
          </TabList>
          
          <TabPanels>
            {/* All Resources Tab */}
            <TabPanel p={0}>
              {isResourcesLoading ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  <Skeleton height="300px" />
                  <Skeleton height="300px" />
                  <Skeleton height="300px" />
                </SimpleGrid>
              ) : filteredResources.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {filteredResources.map((resource) => (
                    <ResourceCard 
                      key={resource.id} 
                      resource={resource}
                      onMarkOffline={handleMarkOffline}
                      isOffline={!isOnline}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text mb={4}>No resources found matching your criteria.</Text>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('');
                  }}>
                    Clear Filters
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Category Tabs */}
            {RESOURCE_CATEGORIES.map((category, index) => (
              <TabPanel key={category.id} p={0}>
                {isResourcesLoading ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                  </SimpleGrid>
                ) : getTabResources(index + 1).length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    {getTabResources(index + 1).map((resource) => (
                      <ResourceCard 
                        key={resource.id} 
                        resource={resource}
                        onMarkOffline={handleMarkOffline}
                        isOffline={!isOnline}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text>No resources found in this category.</Text>
                  </Box>
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Layout>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onMarkOffline: (resource: Resource) => void;
  isOffline: boolean;
}

function ResourceCard({ resource, onMarkOffline, isOffline }: ResourceCardProps) {
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.600');

  // Hide resource if we're offline and it's not available offline
  if (isOffline && !resource.isAvailableOffline) {
    return null;
  }

  // Function to get category name from id
  const getCategoryName = (categoryId: string) => {
    return RESOURCE_CATEGORIES.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  // Function to get icon based on resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'video':
        return '🎬';
      case 'checklist':
        return '✅';
      default:
        return '📚';
    }
  };

  return (
    <Card 
      bg={cardBg}
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: 'md',
        bg: cardHoverBg 
      }}
      transition="all 0.2s"
      overflow="hidden"
    >
      <Box position="relative">
        <Image
          src={resource.thumbnailUrl || `https://via.placeholder.com/500x300?text=${resource.title}`}
          alt={resource.title}
          height="150px"
          width="100%"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          bottom={2}
          right={2}
          colorScheme={resource.type === 'video' ? 'red' : resource.type === 'checklist' ? 'green' : 'blue'}
          px={2}
          py={1}
          borderRadius="md"
        >
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
        </Badge>
      </Box>

      <CardHeader pb={2}>
        <Flex justify="space-between" align="flex-start">
          <Heading size="md" title={resource.title}>
            <Text as="span" overflow="hidden" textOverflow="ellipsis" display="-webkit-box" style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{resource.title}</Text>
          </Heading>
          {resource.isAvailableOffline && (
            <Badge colorScheme="green" variant="outline">
              Offline
            </Badge>
          )}
        </Flex>
      </CardHeader>

      <CardBody py={2}>
        <Tag size="sm" colorScheme="blue" mb={3}>
          <TagLabel>{getCategoryName(resource.category)}</TagLabel>
        </Tag>
        <Text fontSize="sm" color="gray.600" overflow="hidden" textOverflow="ellipsis" display="-webkit-box" style={{ WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {resource.description}
        </Text>
      </CardBody>

      <CardFooter pt={0}>
        <Stack direction="row" gap={2} width="100%">
          <Button
            flex={1}
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={() => router.push(`/resource-hub/${resource.id}`)}
          >
            View {getResourceTypeIcon(resource.type)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkOffline(resource)}
            disabled={isOffline}
          >
            {resource.isAvailableOffline ? 'Remove Offline' : 'Save Offline'}
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
}
