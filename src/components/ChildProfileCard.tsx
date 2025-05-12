import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
  Badge,
  Stack,
  Flex,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Child } from '../types';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

interface ChildProfileCardProps {
  child: Child;
  isDetailed?: boolean;
}

export default function ChildProfileCard({ child, isDetailed = false }: ChildProfileCardProps) {
  const router = useRouter();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  const formatSchedule = () => {
    if (!child.schedule) return 'No regular schedule';
    
    const days = child.schedule.regularDays.join(', ');
    const hours = child.schedule.regularHours 
      ? `${child.schedule.regularHours.start} - ${child.schedule.regularHours.end}` 
      : 'Flexible hours';
    
    return `${days}: ${hours}`;
  };

  return (
    <Card 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg" 
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ 
        boxShadow: 'md',
        transform: isDetailed ? 'none' : 'translateY(-2px)' 
      }}
      w="100%"
    >
      <CardHeader pb={isDetailed ? 4 : 2}>
        <Flex spacing="4">
          <Avatar 
            name={child.name} 
            size={isDetailed ? "lg" : "md"} 
            bg="blue.400" 
            color="white"
          />
          <Box ml={3} flex="1">
            <Heading size={isDetailed ? "md" : "sm"}>{child.name}</Heading>
            <Text color="gray.500" fontSize={isDetailed ? "md" : "sm"}>
              {calculateAge(child.dateOfBirth)} old
            </Text>
            {child.gender && (
              <Badge colorScheme="blue" mt={1}>
                {child.gender}
              </Badge>
            )}
          </Box>
        </Flex>
      </CardHeader>
      
      <CardBody py={isDetailed ? 4 : 2}>
        <Stack spacing={isDetailed ? 4 : 2}>
          {isDetailed && (
            <>
              <Box>
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Date of Birth
                </Text>
                <Text>{format(new Date(child.dateOfBirth), 'MMMM d, yyyy')}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold" fontSize="sm" mb={1}>
                  Schedule
                </Text>
                <Text>{formatSchedule()}</Text>
              </Box>
              
              {child.medicalInfo && (
                <Box>
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    Medical Information
                  </Text>
                  
                  {child.medicalInfo.allergies && child.medicalInfo.allergies.length > 0 && (
                    <Box mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="red.500">
                        Allergies:
                      </Text>
                      <Text fontSize="sm">{child.medicalInfo.allergies.join(', ')}</Text>
                    </Box>
                  )}
                  
                  {child.medicalInfo.conditions && child.medicalInfo.conditions.length > 0 && (
                    <Box mb={2}>
                      <Text fontSize="sm" fontWeight="medium" color="orange.500">
                        Medical Conditions:
                      </Text>
                      <Text fontSize="sm">{child.medicalInfo.conditions.join(', ')}</Text>
                    </Box>
                  )}
                  
                  {child.medicalInfo.medications && child.medicalInfo.medications.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" color="purple.500">
                        Medications:
                      </Text>
                      <Text fontSize="sm">{child.medicalInfo.medications.join(', ')}</Text>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
          
          {!isDetailed && (
            <>
              <Flex justify="space-between" fontSize="sm">
                <Text fontWeight="medium">Date of Birth:</Text>
                <Text>{format(new Date(child.dateOfBirth), 'MM/dd/yyyy')}</Text>
              </Flex>
              
              <Flex justify="space-between" fontSize="sm">
                <Text fontWeight="medium">Schedule:</Text>
                <Text noOfLines={1} maxW="60%">
                  {child.schedule ? `${child.schedule.regularDays.length} days/week` : 'Not set'}
                </Text>
              </Flex>
              
              {child.medicalInfo?.allergies && child.medicalInfo.allergies.length > 0 && (
                <Flex justify="space-between" fontSize="sm">
                  <Text fontWeight="medium" color="red.500">Allergies:</Text>
                  <Text noOfLines={1} maxW="60%">
                    {child.medicalInfo.allergies.join(', ')}
                  </Text>
                </Flex>
              )}
            </>
          )}
        </Stack>
      </CardBody>
      
      {!isDetailed && (
        <CardFooter pt={0}>
          <Button 
            variant="ghost" 
            colorScheme="blue" 
            size="sm"
            onClick={() => router.push(`/children/${child.id}`)}
          >
            View Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
