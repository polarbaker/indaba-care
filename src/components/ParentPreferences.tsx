import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  Textarea,
  Flex,
  Divider,
  useToast,
  Card,
  CardHeader,
  CardBody,
  FormErrorMessage,
  Select,
  IconButton,
  VStack,
  HStack,
  CloseButton,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyDB } from '../lib/db';
import { Family, ParentPreferences } from '../types';
import { useSync } from '../hooks/useSync';

interface ParentPreferencesProps {
  family: Family;
}

export default function ParentPreferencesForm({ family }: ParentPreferencesProps) {
  const [preferences, setPreferences] = useState<ParentPreferences>(family.preferences);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const { performPush } = useSync();
  
  // Update the local state when the family changes
  useEffect(() => {
    setPreferences(family.preferences);
  }, [family]);
  
  const updateFamilyMutation = useMutation({
    mutationFn: async (updatedFamily: Family) => {
      try {
        const existingFamily = await familyDB.get(updatedFamily.id);
        return await familyDB.put({
          ...existingFamily,
          preferences: updatedFamily.preferences,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error updating family preferences:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', family.id] });
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved locally',
        status: 'success',
        duration: 3000,
      });
      // Attempt to sync with the server
      performPush('families');
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: `Error: ${error}`,
        status: 'error',
        duration: 5000,
      });
    },
  });
  
  const handleSavePreferences = async () => {
    try {
      await updateFamilyMutation.mutateAsync({
        ...family,
        preferences: preferences,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };
  
  const handleToggleNotification = (type: 'email' | 'push' | 'sms') => {
    setPreferences({
      ...preferences,
      notificationPreferences: {
        ...preferences.notificationPreferences,
        [type]: !preferences.notificationPreferences[type],
      },
    });
  };
  
  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    
    setPreferences({
      ...preferences,
      emergencyContacts: [
        ...preferences.emergencyContacts,
        { ...newContact },
      ],
    });
    
    setNewContact({ name: '', relationship: '', phone: '' });
  };
  
  const handleRemoveContact = (index: number) => {
    const updatedContacts = [...preferences.emergencyContacts];
    updatedContacts.splice(index, 1);
    
    setPreferences({
      ...preferences,
      emergencyContacts: updatedContacts,
    });
  };
  
  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    
    const allergies = preferences.allergies || [];
    
    if (!allergies.includes(newAllergy)) {
      setPreferences({
        ...preferences,
        allergies: [...allergies, newAllergy],
      });
    }
    
    setNewAllergy('');
  };
  
  const handleRemoveAllergy = (allergy: string) => {
    const allergies = preferences.allergies || [];
    
    setPreferences({
      ...preferences,
      allergies: allergies.filter(a => a !== allergy),
    });
  };
  
  const handleAddDietaryRestriction = () => {
    if (!newDietaryRestriction.trim()) return;
    
    const dietaryRestrictions = preferences.dietaryRestrictions || [];
    
    if (!dietaryRestrictions.includes(newDietaryRestriction)) {
      setPreferences({
        ...preferences,
        dietaryRestrictions: [...dietaryRestrictions, newDietaryRestriction],
      });
    }
    
    setNewDietaryRestriction('');
  };
  
  const handleRemoveDietaryRestriction = (restriction: string) => {
    const dietaryRestrictions = preferences.dietaryRestrictions || [];
    
    setPreferences({
      ...preferences,
      dietaryRestrictions: dietaryRestrictions.filter(r => r !== restriction),
    });
  };
  
  return (
    <Card variant="outline" mb={8}>
      <CardHeader pb={2}>
        <Heading size="md">Parent Preferences</Heading>
        <Text color="gray.600" fontSize="sm">
          Customize your settings and preferences for childcare
        </Text>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="sm" mb={3}>Language & Communication</Heading>
            <FormControl mb={4}>
              <FormLabel>Preferred Language</FormLabel>
              <Select
                value={preferences.languagePreference}
                onChange={(e) => setPreferences({
                  ...preferences,
                  languagePreference: e.target.value,
                })}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="sw">Swahili</option>
                <option value="xh">Xhosa</option>
                <option value="af">Afrikaans</option>
              </Select>
            </FormControl>
            
            <Heading size="sm" mb={3}>Notification Preferences</Heading>
            <Stack spacing={3} mb={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Email Notifications</FormLabel>
                <Switch
                  isChecked={preferences.notificationPreferences.email}
                  onChange={() => handleToggleNotification('email')}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Push Notifications</FormLabel>
                <Switch
                  isChecked={preferences.notificationPreferences.push}
                  onChange={() => handleToggleNotification('push')}
                  colorScheme="blue"
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">SMS Notifications</FormLabel>
                <Switch
                  isChecked={preferences.notificationPreferences.sms}
                  onChange={() => handleToggleNotification('sms')}
                  colorScheme="blue"
                />
              </FormControl>
            </Stack>
          </Box>
          
          <Divider />
          
          <Box>
            <Heading size="sm" mb={3}>Emergency Contacts</Heading>
            
            {preferences.emergencyContacts.length > 0 ? (
              <VStack align="stretch" spacing={3} mb={4}>
                {preferences.emergencyContacts.map((contact, index) => (
                  <Box
                    key={index}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    position="relative"
                  >
                    <CloseButton
                      size="sm"
                      position="absolute"
                      right="8px"
                      top="8px"
                      onClick={() => handleRemoveContact(index)}
                    />
                    <Text fontWeight="medium">{contact.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {contact.relationship} • {contact.phone}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" mb={4}>No emergency contacts added yet.</Text>
            )}
            
            <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Heading size="xs" mb={3}>Add Emergency Contact</Heading>
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Name</FormLabel>
                  <Input
                    size="sm"
                    value={newContact.name}
                    onChange={(e) => setNewContact({
                      ...newContact,
                      name: e.target.value,
                    })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm">Relationship</FormLabel>
                  <Input
                    size="sm"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({
                      ...newContact,
                      relationship: e.target.value,
                    })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm">Phone Number</FormLabel>
                  <Input
                    size="sm"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({
                      ...newContact,
                      phone: e.target.value,
                    })}
                  />
                </FormControl>
                
                <Button size="sm" onClick={handleAddContact}>
                  Add Contact
                </Button>
              </Stack>
            </Box>
          </Box>
          
          <Divider />
          
          <Box>
            <Heading size="sm" mb={3}>Health Information</Heading>
            
            <FormControl mb={4}>
              <FormLabel>Allergies</FormLabel>
              <Flex flexWrap="wrap" mb={2}>
                {(preferences.allergies || []).map((allergy, index) => (
                  <Tag
                    key={index}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="red"
                    m={1}
                  >
                    <TagLabel>{allergy}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveAllergy(allergy)} />
                  </Tag>
                ))}
              </Flex>
              <Flex>
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add an allergy"
                  mr={2}
                />
                <Button onClick={handleAddAllergy}>Add</Button>
              </Flex>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Dietary Restrictions</FormLabel>
              <Flex flexWrap="wrap" mb={2}>
                {(preferences.dietaryRestrictions || []).map((restriction, index) => (
                  <Tag
                    key={index}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="orange"
                    m={1}
                  >
                    <TagLabel>{restriction}</TagLabel>
                    <TagCloseButton onClick={() => handleRemoveDietaryRestriction(restriction)} />
                  </Tag>
                ))}
              </Flex>
              <Flex>
                <Input
                  value={newDietaryRestriction}
                  onChange={(e) => setNewDietaryRestriction(e.target.value)}
                  placeholder="Add a dietary restriction"
                  mr={2}
                />
                <Button onClick={handleAddDietaryRestriction}>Add</Button>
              </Flex>
            </FormControl>
          </Box>
          
          <Divider />
          
          <Box>
            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                value={preferences.additionalNotes || ''}
                onChange={(e) => setPreferences({
                  ...preferences,
                  additionalNotes: e.target.value,
                })}
                placeholder="Any additional information or special instructions..."
                rows={4}
              />
            </FormControl>
          </Box>
          
          <Button
            colorScheme="blue"
            onClick={handleSavePreferences}
            isLoading={updateFamilyMutation.isPending}
            loadingText="Saving..."
          >
            Save Preferences
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
