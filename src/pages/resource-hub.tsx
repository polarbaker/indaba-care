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
  Stack,
  Input,
  InputGroup,
} from '@chakra-ui/react';
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
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              <Skeleton height="300px" />
              <Skeleton height="300px" />
              <Skeleton height="300px" />
            </SimpleGrid>
          </Box>
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
          <Box p={4} mb={6} bg="blue.50" color="blue.800" borderRadius="md">
            You're currently offline. Only resources marked for offline use are available.
          </Box>
        )}

        <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box position="relative" maxW={{ base: '100%', md: '60%' }}>
            <Box
              position="absolute"
              left="10px"
              top="50%"
              transform="translateY(-50%)"
              color="gray.400"
              role="img"
              aria-label="search"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={2}
              pointerEvents="none"
            >
              🔍
            </Box>
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              pl={8}
            />
          </Box>

          <Box
            maxW={{ base: '100%', md: '40%' }}
          >
            <select
              value={filterCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
              style={{ 
                padding: '8px',
                borderRadius: '4px',
                borderWidth: '1px',
                width: '100%'
              }}
            >
            <option value="">All Categories</option>
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
            </select>
          </Box>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('');
            }}
          >
            Clear Filters
          </Button>
        </Flex>

        {/* Custom tab interface */}
        <Box>
          {/* Tab buttons */}
          <Flex overflowX="auto" pb={4}>
            <Button
              mr={2}
              variant={activeTabIndex === 0 ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => setActiveTabIndex(0)}
            >
              All
            </Button>
            
            {RESOURCE_CATEGORIES.map((category, index) => (
              <Button
                key={category.id}
                mr={2}
                variant={activeTabIndex === index + 1 ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => setActiveTabIndex(index + 1)}
              >
                {category.name}
              </Button>
            ))}
          </Flex>
          
          {/* Tab content */}
          <Box pt={4}>
            {/* All Resources Tab */}
            {activeTabIndex === 0 && (
              <Box>
                {isResourcesLoading ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                    <Skeleton height="300px" />
                  </SimpleGrid>
                ) : filteredResources.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                    {filteredResources.map((resource) => (
                      <ResourceCardWrapper 
                        key={resource.id} 
                        resource={resource} 
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text mb={4}>No resources found matching your criteria.</Text>
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('');
                        setActiveTabIndex(0);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Category Tabs */}
            {RESOURCE_CATEGORIES.map((category, index) => (
              activeTabIndex === index + 1 && (
                <Box key={category.id}>
                  {isResourcesLoading ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                      <Skeleton height="300px" />
                      <Skeleton height="300px" />
                      <Skeleton height="300px" />
                    </SimpleGrid>
                  ) : getTabResources(index + 1).length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                      {getTabResources(index + 1).map((resource) => (
                        <ResourceCardWrapper 
                          key={resource.id} 
                          resource={resource}
                        />
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text>No resources found in this category.</Text>
                    </Box>
                  )}
                </Box>
              )
            ))}
          </Box>
        </Box>
      </Box>
    </Layout>
  // Regular export statement properly formatted
  );
}

interface ResourceCardProps {
  resource: Resource;
  onMarkOffline: (resource: Resource) => void;
  isOffline: boolean;
}

// Simple wrapper component for the resource card
function ResourceCardWrapper({ resource }: { resource: Resource }) {
  const { isOnline } = useSync();
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Image
        src={resource.thumbnailUrl || `https://via.placeholder.com/500x300?text=${resource.title}`}
        alt={resource.title}
        height="150px"
        width="100%"
        objectFit="cover"
      />
      <Box p={4}>
        <Heading size="md" mb={2}>{resource.title}</Heading>
        <Text mb={3} overflow="hidden" textOverflow="ellipsis" display="-webkit-box" style={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{resource.description}</Text>
        <Flex justify="space-between">
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => {}}
          >
            View Details
          </Button>
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
            >
              {resource.isAvailableOffline ? "Remove Offline" : "Save Offline"}
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

function ResourceCard({ resource, onMarkOffline, isOffline }: ResourceCardProps) {
  const router = useRouter();

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
    <Box 
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: 'md',
        bg: 'gray.50' 
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

      <Box p={4} pb={2}>
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
      </Box>

      <Box px={4} py={2}>
        <Box 
          display="inline-block" 
          bg="blue.100" 
          color="blue.700" 
          px={2} 
          py={1} 
          borderRadius="md" 
          fontSize="sm" 
          mb={3}
        >
          {getCategoryName(resource.category)}
        </Box>
        <Text fontSize="sm" color="gray.600" overflow="hidden" textOverflow="ellipsis" display="-webkit-box" style={{ WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {resource.description}
        </Text>
      </Box>

      <Box p={4} pt={0}>
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
      </Box>
    </Box>
  );
}
