import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Spinner,
} from '@chakra-ui/react';

// Import components from their specific packages
import { useDisclosure } from '@chakra-ui/react';
import { Button, IconButton } from '@chakra-ui/button';
import { Stack, HStack, VStack } from '@chakra-ui/layout';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Select } from '@chakra-ui/select';
import { Textarea } from '@chakra-ui/react';
import { Tag } from '@chakra-ui/tag';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton 
} from '@chakra-ui/modal';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/table';
import { Card, CardHeader, CardBody } from '@chakra-ui/card';
import { useToast } from '@chakra-ui/toast';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyDB, childDB, nannyDB, sessionDB } from '../lib/db';
import { Family, Child, Nanny, Session } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isToday, isWithinInterval, parseISO } from 'date-fns';
import { useSync } from '../hooks/useSync';

// Calendar component for schedule visualization
function Calendar({ sessions, children, onSessionClick }: { 
  sessions: Session[], 
  children: Child[],
  onSessionClick: (session: Session) => void
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Calculate the end of the week (Sunday)
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  
  // Get all days of the current week
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd
  });

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Reset to current week
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Filter sessions for the current week
  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return isWithinInterval(sessionDate, {
      start: currentWeekStart,
      end: currentWeekEnd
    });
  });

  // Get child name by ID
  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? child.name : 'Unknown Child';
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Schedule Calendar</Heading>
        <HStack>
          <Button size="sm" onClick={goToPreviousWeek}>Previous</Button>
          <Button size="sm" onClick={goToCurrentWeek}>Today</Button>
          <Button size="sm" onClick={goToNextWeek}>Next</Button>
        </HStack>
      </Flex>

      <Text fontWeight="medium" mb={4}>
        {format(currentWeekStart, 'MMMM d')} - {format(currentWeekEnd, 'MMMM d, yyyy')}
      </Text>

      <SimpleGrid columns={7} gap={2} mb={6}>
        {daysOfWeek.map(day => (
          <Box
            key={day.toString()}
            borderWidth={1}
            borderRadius="md"
            p={2}
            textAlign="center"
            bg={isToday(day) ? 'blue.50' : 'white'}
            borderColor={isToday(day) ? 'blue.300' : 'gray.200'}
          >
            <Text fontWeight="bold" fontSize="sm">
              {format(day, 'EEE')}
            </Text>
            <Text fontSize="lg">{format(day, 'd')}</Text>
            
            <VStack gap={1} mt={2} align="stretch">
              {weekSessions
                .filter(session => {
                  const sessionDate = new Date(session.startTime);
                  return sessionDate.getDate() === day.getDate() &&
                         sessionDate.getMonth() === day.getMonth() &&
                         sessionDate.getFullYear() === day.getFullYear();
                })
                .map(session => (
                  <Box
                    key={session.id}
                    bg={session.isComplete ? 'green.100' : 'yellow.100'}
                    p={1}
                    borderRadius="sm"
                    fontSize="xs"
                    cursor="pointer"
                    onClick={() => onSessionClick(session)}
                    _hover={{ opacity: 0.8 }}
                  >
                    <Text fontWeight="bold" overflow="hidden" textOverflow="ellipsis" display="-webkit-box" style={{ WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{getChildName(session.childId)}</Text>
                    <Text>
                      {format(new Date(session.startTime), 'h:mm a')}
                      {session.endTime && ` - ${format(new Date(session.endTime), 'h:mm a')}`}
                    </Text>
                  </Box>
                ))}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

// Main Schedule component
export default function Schedule() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { performSync, isOnline } = useSync();
  const disclosure1 = useDisclosure();
  const isSessionModalOpen = disclosure1.open;
  const onSessionModalOpen = disclosure1.onOpen;
  const onSessionModalClose = disclosure1.onClose;
  
  const disclosure2 = useDisclosure();
  const isStartSessionModalOpen = disclosure2.open;
  const onStartSessionModalOpen = disclosure2.onOpen;
  const onStartSessionModalClose = disclosure2.onClose;
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [newSession, setNewSession] = useState({
    childId: '',
    notes: '',
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Query family data
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

  // Query children data
  const { data: children, isLoading: isChildrenLoading } = useQuery({
    queryKey: ['children', family?._id],
    queryFn: async () => {
      if (!family) return [];
      try {
        const result = await childDB.allDocs({
          include_docs: true,
          keys: family.children,
        });
        return result.rows.map(row => row.doc).filter(Boolean) as Child[];
      } catch (error) {
        console.error('Error fetching children:', error);
        return [];
      }
    },
    enabled: !!family && family.children.length > 0,
  });

  // Query sessions data
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['sessions', family?._id],
    queryFn: async () => {
      if (!family) return [];
      try {
        const result = await sessionDB.find({
          selector: {
            familyId: family.id,
            startTime: { $gt: 0 },
          },
          sort: [{ startTime: 'desc' }],
        });
        return result.docs as Session[];
      } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }
    },
    enabled: !!family,
  });

  // Check for any active (incomplete) session
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const activeSession = sessions.find(s => !s.isComplete);
      setActiveSessionId(activeSession ? activeSession.id : null);
    }
  }, [sessions]);

  // Mutation to start a new session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionData: Partial<Session>) => {
      if (!family) throw new Error('Family data is missing');
      
      const newSession: Session = {
        id: `session_${Date.now()}`,
        nannyId: user?.uid || '',
        childId: sessionData.childId || '',
        familyId: family.id,
        startTime: Date.now(),
        activities: [],
        notes: sessionData.notes || '',
        isComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await sessionDB.put({
        ...newSession,
        _id: newSession.id,
      });
      
      return newSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      performSync();
      toast({
        title: 'Session started',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to start session',
        description: String(error),
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Mutation to end an active session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const session = await sessionDB.get(sessionId);
      
      const updatedSession = {
        ...session,
        endTime: Date.now(),
        isComplete: true,
        updatedAt: Date.now(),
      };
      
      return await sessionDB.put(updatedSession);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      performSync();
      toast({
        title: 'Session ended',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to end session',
        description: String(error),
        status: 'error',
        duration: 5000,
      });
    },
  });

  // Mutation to update a session
  const updateSessionMutation = useMutation({
    mutationFn: async (session: Session) => {
      const existingSession = await sessionDB.get(session.id);
      
      return await sessionDB.put({
        ...existingSession,
        notes: session.notes,
        activities: session.activities,
        updatedAt: Date.now(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      performSync();
      toast({
        title: 'Session updated',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update session',
        description: String(error),
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleStartSession = async () => {
    if (!newSession.childId) {
      toast({
        title: 'Please select a child',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    try {
      await startSessionMutation.mutateAsync(newSession);
      setNewSession({
        childId: '',
        notes: '',
      });
      onStartSessionModalClose();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleEndSession = async () => {
    if (!activeSessionId) return;
    
    try {
      await endSessionMutation.mutateAsync(activeSessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const handleUpdateSession = async () => {
    if (!selectedSession) return;
    
    try {
      await updateSessionMutation.mutateAsync(selectedSession);
      onSessionModalClose();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleViewSession = (session: Session) => {
    setSelectedSession(session);
    onSessionModalOpen();
  };

  // Get child name by ID
  const getChildName = (childId: string) => {
    if (!children) return 'Unknown Child';
    const child = children.find(c => c.id === childId);
    return child ? child.name : 'Unknown Child';
  };

  if (loading || isFamilyLoading) {
    return (
      <Layout>
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={5}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" size="xl">
            Schedule & Hours
          </Heading>
          
          {activeSessionId ? (
            <Button
              colorScheme="red"
              onClick={handleEndSession}
              disabled={endSessionMutation.isPending}
              loadingText="Ending..."
            >
              End Shift
            </Button>
          ) : (
            <Button
              colorScheme="green"
              onClick={onStartSessionModalOpen}
              disabled={children && children.length === 0}
            >
              Start Shift
            </Button>
          )}
        </Flex>

        {activeSessionId && (
          <Card mb={6} borderWidth="2px" borderColor="green.300">
            <CardHeader bg="green.50" pb={2}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Active Session</Heading>
                <Badge colorScheme="green" fontSize="md" py={1} px={2}>
                  In Progress
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              {sessions && sessions.find(s => s.id === activeSessionId) && (
                <Stack gap={3}>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Child:</Text>
                    <Text>{getChildName(sessions.find(s => s.id === activeSessionId)!.childId)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Started:</Text>
                    <Text>
                      {format(new Date(sessions.find(s => s.id === activeSessionId)!.startTime), 'MMMM d, yyyy h:mm a')}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Duration:</Text>
                    <Text>
                      {formatDuration(Date.now() - sessions.find(s => s.id === activeSessionId)!.startTime)}
                    </Text>
                  </Flex>
                </Stack>
              )}
            </CardBody>
          </Card>
        )}

        {children && children.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text mb={4}>No children have been added yet.</Text>
            <Button colorScheme="blue" onClick={() => router.push('/children/add')}>
              Add a Child
            </Button>
          </Box>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} mb={8}>
              <Box>
                {isSessionsLoading || isChildrenLoading ? (
                  <Spinner />
                ) : (
                  <Calendar 
                    sessions={sessions || []} 
                    children={children || []}
                    onSessionClick={handleViewSession}
                  />
                )}
              </Box>
              
              <Box>
                <Card>
                  <CardHeader>
                    <Heading size="md">Recent Sessions</Heading>
                  </CardHeader>
                  <CardBody>
                    {isSessionsLoading ? (
                      <Spinner />
                    ) : sessions && sessions.length > 0 ? (
                      <TableContainer>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Date</Th>
                              <Th>Child</Th>
                              <Th>Start Time</Th>
                              <Th>End Time</Th>
                              <Th>Duration</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {sessions.filter(s => s.isComplete).length > 0 ? (
                              sessions
                                .filter(s => s.isComplete)
                                .map(session => (
                                  <Tr 
                                    key={session.id}
                                    cursor="pointer"
                                    onClick={() => handleViewSession(session)}
                                    _hover={{ bg: 'gray.50' }}
                                  >
                                    <Td>{format(new Date(session.startTime), 'MMM d, yyyy')}</Td>
                                    <Td>{getChildName(session.childId)}</Td>
                                    <Td>{format(new Date(session.startTime), 'h:mm a')}</Td>
                                    <Td>{session.endTime ? format(new Date(session.endTime), 'h:mm a') : '-'}</Td>
                                    <Td>
                                      {session.endTime
                                        ? formatDuration(session.endTime - session.startTime)
                                        : '-'}
                                    </Td>
                                  </Tr>
                                ))
                            ) : (
                              <Tr>
                                <Td colSpan={5} textAlign="center">
                                  No completed sessions found.
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Text textAlign="center">No sessions recorded yet.</Text>
                    )}
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </>
        )}
      </Box>

      {/* Start Session Modal */}
      <Modal isOpen={isStartSessionModalOpen} onClose={onStartSessionModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Session</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack gap={4}>
              <FormControl isRequired>
                <FormLabel>Select Child</FormLabel>
                <Select
                  placeholder="Select a child"
                  value={newSession.childId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewSession({
                    ...newSession,
                    childId: e.target.value,
                  })}
                >
                  {children && children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notes (optional)</FormLabel>
                <Textarea
                  value={newSession.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSession({
                    ...newSession,
                    notes: e.target.value,
                  })}
                  placeholder="Any initial notes about this session..."
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onStartSessionModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleStartSession}
              disabled={startSessionMutation.isPending}
              loadingText="Starting..."
            >
              Start Session
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View/Edit Session Modal */}
      <Modal isOpen={isSessionModalOpen} onClose={onSessionModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Session Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSession && (
              <Stack gap={5}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">{selectedSession && getChildName(selectedSession.childId)}</Heading>
                  <Badge colorScheme={selectedSession?.isComplete ? 'green' : 'yellow'} fontSize="md" py={1} px={2}>
                    {selectedSession?.isComplete ? 'Completed' : 'In Progress'}
                  </Badge>
                </Flex>

                <SimpleGrid columns={2} gap={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Date</Text>
                    <Text>{selectedSession?.startTime ? format(new Date(selectedSession.startTime), 'MMMM d, yyyy') : '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Duration</Text>
                    <Text>
                      {selectedSession?.isComplete && selectedSession?.endTime && selectedSession?.startTime
                        ? formatDuration(selectedSession.endTime - selectedSession.startTime)
                        : 'In progress'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Start Time</Text>
                    <Text>{selectedSession?.startTime ? format(new Date(selectedSession.startTime), 'h:mm a') : '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>End Time</Text>
                    <Text>
                      {selectedSession?.endTime
                        ? format(new Date(selectedSession.endTime), 'h:mm a')
                        : '-'}
                    </Text>
                  </Box>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={selectedSession?.notes || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      if (selectedSession) {
                        setSelectedSession({
                          ...selectedSession,
                          notes: e.target.value,
                        });
                      }
                    }}
                    readOnly={!!selectedSession?.isComplete}
                    placeholder="Add notes about this session..."
                  />
                </FormControl>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onSessionModalClose}>
              Close
            </Button>
            {selectedSession && !selectedSession?.isComplete && (
              <Button
                colorScheme="blue"
                onClick={handleUpdateSession}
                disabled={updateSessionMutation.isPending}
                loadingText="Updating..."
              >
                Update
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

// Helper function to format duration
function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  }
  
  return `${hours}h ${minutes}m`;
}
