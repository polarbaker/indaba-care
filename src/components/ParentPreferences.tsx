import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Textarea,
  Flex,
  IconButton,
  CloseButton,
  Stack,
  VStack,
  HStack,
  Switch
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
  
  // Use console.log for now as useToast is not available in current version
  const toast = (props: any) => {
    console.log('Toast:', props);
  };
  const queryClient = useQueryClient();
  const { performSync } = useSync();
  
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
      performSync();
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
    <Box as="form" p={6} boxShadow="md" borderWidth="1px" borderRadius="lg" bg="white">
      <Box pb={2}>
        <Heading size="md" mb={2}>Parent Preferences</Heading>
        <Text>Customize your experience and set important information for childcare providers.</Text>
      </Box>

      <Box pt={4}>
        <VStack gap={6} align="stretch">
          <Box>
            <Heading size="sm" mb={3}>Language & Communication</Heading>
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>Preferred Language</Text>
              <select
                value={preferences.languagePreference}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPreferences({
                  ...preferences,
                  languagePreference: e.target.value,
                })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', borderWidth: '1px' }}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="sw">Swahili</option>
                <option value="xh">Xhosa</option>
                <option value="af">Afrikaans</option>
              </select>
            </Box>
          </Box>
          
          <Box>
            <Heading size="sm" mb={3}>Notification Preferences</Heading>
            <Stack gap={3} mb={4}>
              <Box display="flex" alignItems="center">
                <Text mb="0">Email Notifications</Text>
                <Box as="label" display="flex" alignItems="center" ml={2}>
                  <input 
                    type="checkbox" 
                    checked={preferences.notificationPreferences.email}
                    onChange={() => handleToggleNotification('email')}
                    style={{ marginRight: '8px' }}
                  />
                  <Text fontSize="sm">Enable</Text>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Text mb="0">Push Notifications</Text>
                <Box as="label" display="flex" alignItems="center" ml={2}>
                  <input 
                    type="checkbox" 
                    checked={preferences.notificationPreferences.push}
                    onChange={() => handleToggleNotification('push')}
                    style={{ marginRight: '8px' }}
                  />
                  <Text fontSize="sm">Enable</Text>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Text mb="0">SMS Notifications</Text>
                <Box as="label" display="flex" alignItems="center" ml={2}>
                  <input 
                    type="checkbox" 
                    checked={preferences.notificationPreferences.sms}
                    onChange={() => handleToggleNotification('sms')}
                    style={{ marginRight: '8px' }}
                  />
                  <Text fontSize="sm">Enable</Text>
                </Box>
              </Box>
            </Stack>
          </Box>
          
          <Box height="1px" bg="gray.200" my={4} />
          
          <Box>
            <Heading size="sm" mb={3}>Emergency Contacts</Heading>
            
            {preferences.emergencyContacts.length > 0 ? (
              <VStack align="stretch" gap={3} mb={4}>
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
              <Stack gap={3}>
                <Box>
                  <Text fontSize="sm">Name</Text>
                  <Input
                    size="sm"
                    value={newContact.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewContact({
                      ...newContact,
                      name: e.target.value,
                    })}
                  />
                </Box>
                
                <Box>
                  <Text fontSize="sm">Relationship</Text>
                  <select
                    value={newContact.relationship}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewContact({
                      ...newContact,
                      relationship: e.target.value,
                    })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', borderWidth: '1px' }}
                  >
                    <option value="">Select a relationship</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </Box>
                
                <Box>
                  <Text fontSize="sm">Phone Number</Text>
                  <Input
                    size="sm"
                    value={newContact.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewContact({
                      ...newContact,
                      phone: e.target.value,
                    })}
                  />
                </Box>
                
                <Button size="sm" onClick={handleAddContact}>
                  Add Contact
                </Button>
              </Stack>
            </Box>
          </Box>
          
          <Box height="1px" bg="gray.200" my={4} />
          
          <Box>
            <Heading size="sm" mb={3}>Health Information</Heading>
            
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>Allergies</Text>
              <Flex flexWrap="wrap" mb={2}>
                {(preferences.allergies || []).map((allergy, index) => (
                  <Flex
                    key={index}
                    bg="red.500"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    m={1}
                    alignItems="center"
                  >
                    <Text fontSize="sm" mr={1}>{allergy}</Text>
                    <CloseButton size="sm" color="white" onClick={() => handleRemoveAllergy(allergy)} />
                  </Flex>
                ))}
              </Flex>
              <Flex>
                <Input
                  value={newAllergy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewAllergy(e.target.value)}
                  placeholder="Add an allergy"
                  mr={2}
                />
                <Button onClick={handleAddAllergy}>Add</Button>
              </Flex>
            </Box>
            
            <Box mb={4}>
              <Text fontWeight="bold" mb={1}>Dietary Restrictions</Text>
              <Flex flexWrap="wrap" mb={2}>
                {(preferences.dietaryRestrictions || []).map((restriction, index) => (
                  <Flex
                    key={index}
                    bg="orange.500"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    m={1}
                    alignItems="center"
                  >
                    <Text fontSize="sm" mr={1}>{restriction}</Text>
                    <CloseButton size="sm" color="white" onClick={() => handleRemoveDietaryRestriction(restriction)} />
                  </Flex>
                ))}
              </Flex>
              <Flex>
                <Input
                  value={newDietaryRestriction}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewDietaryRestriction(e.target.value)}
                  placeholder="Add a dietary restriction"
                  mr={2}
                />
                <Button onClick={handleAddDietaryRestriction}>Add</Button>
              </Flex>
            </Box>
          </Box>
          
          <Box height="1px" bg="gray.200" my={4} />
          
          <Box>
            <Text fontWeight="bold" mb={1}>Additional Notes</Text>
            <Textarea
              value={preferences.additionalNotes || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPreferences({
                ...preferences,
                additionalNotes: e.target.value,
              })}
              placeholder="Any additional information or special instructions..."
              rows={4}
            />
          </Box>
          
          <Button
            colorScheme="blue"
            onClick={handleSavePreferences}
            loading={updateFamilyMutation.isPending}
          >
            Save Preferences
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
