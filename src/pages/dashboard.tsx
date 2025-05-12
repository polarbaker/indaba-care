import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Stack,
  Badge,
  IconButton,
  Skeleton,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
// Import specific Chakra UI components from their packages
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/card';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/stat';
import { Avatar } from '@chakra-ui/avatar';
import { useColorModeValue } from '@chakra-ui/color-mode';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { familyDB, childDB, sessionDB } from '../lib/db';
import { Family, Child, Session } from '../types';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const toast = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Query family data from PouchDB
  const { data: family, isLoading: isFamilyLoading } = useQuery({
    queryKey: ['family', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      try {
        return await familyDB.get(user.uid);
      } catch (error) {
        console.error('Error fetching family:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Query children data from PouchDB
  const { data: children, isLoading: isChildrenLoading } = useQuery({
    queryKey: ['children', family?._id],
    queryFn: async () => {
      if (!family) return [];
      try {
        const result = await childDB.allDocs({
          include_docs: true,
          keys: family.children,
        });
        return result.rows.map((row: any) => row.doc).filter(Boolean) as Child[];
      } catch (error) {
        console.error('Error fetching children:', error);
        return [];
      }
    },
    enabled: !!family && family.children.length > 0,
  });

  // Query recent sessions from PouchDB
  const { data: recentSessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['recent-sessions', family?._id],
    queryFn: async () => {
      if (!family) return [];
      try {
        const result = await sessionDB.find({
          selector: {
            familyId: family.id,
            startTime: { $gt: 0 },
          },
          sort: [{ startTime: 'desc' }],
          limit: 5,
        });
        return result.docs as Session[];
      } catch (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }
    },
    enabled: !!family,
  });

  if (loading || isFamilyLoading) {
    return (
      <Layout>
        <Box textAlign="center" py={10}>
          <Skeleton height="20px" width="200px" my={2} mx="auto" />
          <Skeleton height="15px" width="300px" my={2} mx="auto" />
          <SimpleGrid columns={{ base: 1, md: 3 }} mt={8} gap={8}>
            <Skeleton height="200px" />
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </SimpleGrid>
        </Box>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <Box mb={5}>
        <Heading as="h1" size="xl" mb={2}>
          Welcome, {family?.name || user.displayName || 'there'}!
        </Heading>
        <Text color="gray.600">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} mb={8} gap={8}>
        <Card>
          <CardHeader>
            <Box borderBottom="1px" borderColor="gray.200" my={3} />
            <Heading size="md">Children</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>{children?.length || 0}</StatNumber>
              <StatHelpText>
                {children?.length === 1 ? 'Child' : 'Children'} in your care
              </StatHelpText>
            </Stat>
          </CardBody>
          <CardFooter>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => router.push('/children')}
            >
              View All
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Box borderBottom="1px" borderColor="gray.200" my={3} />
            <Heading size="md">Today's Schedule</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>
                {recentSessions?.filter(
                  session =>
                    new Date(session.startTime).toDateString() ===
                    new Date().toDateString()
                ).length || 0}
              </StatNumber>
              <StatHelpText>Sessions scheduled for today</StatHelpText>
            </Stat>
          </CardBody>
          <CardFooter>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => router.push('/schedule')}
            >
              View Schedule
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Box borderBottom="1px" borderColor="gray.200" my={3} />
            <Heading size="md">Resource Hub</Heading>
          </CardHeader>
          <CardBody>
            <Text>Access parenting guides, activities, and educational resources.</Text>
          </CardBody>
          <CardFooter>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => router.push('/resource-hub')}
            >
              Explore Resources
            </Button>
          </CardFooter>
        </Card>
      </SimpleGrid>

      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h2" size="md">
            Your Children
          </Heading>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => router.push('/children/add')}
          >
            Add Child
          </Button>
        </Flex>

        {isChildrenLoading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </SimpleGrid>
        ) : children && children.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {children.map(child => (
              <Card key={child.id} variant="outline">
                <CardBody>
                  <Flex>
                    <Avatar
                      name={child.name}
                      size="md"
                      mr={3}
                      bg="blue.400"
                    />
                    <Box>
                      <Heading size="sm" mb={1}>{child.name}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        {calculateAge(child.dateOfBirth)} years old
                      </Text>
                      {child.schedule && (
                        <Badge colorScheme="green" mt={2} fontSize="xs">
                          {child.schedule.regularDays.length} days/week
                        </Badge>
                      )}
                    </Box>
                  </Flex>
                </CardBody>
                <CardFooter pt={0}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => router.push(`/children/${child.id}`)}
                  >
                    View Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={5}
            bg="gray.50"
            borderRadius="md"
            textAlign="center"
          >
            <Text mb={4}>No children added yet.</Text>
            <Button
              colorScheme="blue"
              onClick={() => router.push('/children/add')}
            >
              Add Your First Child
            </Button>
          </Box>
        )}
      </Box>

      <Box>
        <Heading as="h2" size="md" mb={4}>
          Recent Activity
        </Heading>

        {isSessionsLoading ? (
          <Stack gap={4}>
            <Skeleton height="60px" />
            <Skeleton height="60px" />
            <Skeleton height="60px" />
          </Stack>
        ) : recentSessions && recentSessions.length > 0 ? (
          <Stack gap={3}>
            {recentSessions.map(session => (
              <Box
                key={session.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor="gray.200"
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="medium">
                      {children?.find(c => c.id === session.childId)?.name || 'Child'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {format(new Date(session.startTime), 'MMM d, yyyy')} • 
                      {session.isComplete
                        ? ` ${format(new Date(session.startTime), 'h:mm a')} - ${format(
                            new Date(session.endTime || 0),
                            'h:mm a'
                          )}`
                        : ` Started at ${format(new Date(session.startTime), 'h:mm a')}`}
                    </Text>
                  </Box>
                  <Badge colorScheme={session.isComplete ? 'green' : 'orange'}>
                    {session.isComplete ? 'Completed' : 'In Progress'}
                  </Badge>
                </Flex>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            p={5}
            bg="gray.50"
            borderRadius="md"
            textAlign="center"
          >
            <Text>No recent activity to display.</Text>
          </Box>
        )}
      </Box>
    </Layout>
  );
}

// Helper function to calculate age from date of birth
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
