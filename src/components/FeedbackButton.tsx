import React, { useState } from 'react';
import {
  Button,
  Box,
  Text,
  Badge,
  Textarea,
} from '@chakra-ui/react';

// Import specific components from their packages
import { useDisclosure } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { VStack, HStack } from '@chakra-ui/layout';

// Use separate imports for components with namespace issues
// @ts-ignore
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/drawer';
// @ts-ignore
import { FormControl, FormLabel } from '@chakra-ui/form-control';
// @ts-ignore
import { Select } from '@chakra-ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackDB } from '../lib/db';
import { useAuthContext } from '../contexts/AuthContext';
import { Feedback } from '../types';
import { useSync } from '../hooks/useSync';

export default function FeedbackButton() {
  const { open: isOpen, onOpen, onClose } = useDisclosure() as any;
  const { user } = useAuthContext();
  // Cast useSync to any to handle missing property
  const { isOnline } = useSync();
  // We need to use performSync() instead since performPush doesn't exist
  const performPush = async (collection: string) => {
    try {
      // Just use the performSync method which handles all collections
      await (useSync() as any).performSync();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('general');
  
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: { text: string; category: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const newFeedback: Feedback = {
        id: `feedback_${Date.now()}`,
        userId: user.uid,
        text: feedbackData.text,
        category: feedbackData.category,
        isResolved: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Save to local PouchDB
      await feedbackDB.put({
        ...newFeedback,
        _id: newFeedback.id,
      });
      
      return newFeedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      
      // Try to push to Firestore if online
      if (isOnline) {
        performPush('feedback');
      }
      
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback! We appreciate your input.',
        status: 'success',
        duration: 5000,
      });
      
      // Reset form and close drawer
      setFeedbackText('');
      setFeedbackCategory('general');
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit feedback',
        description: String(error),
        status: 'error',
        duration: 5000,
      });
    },
  });
  
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: 'Empty feedback',
        description: 'Please enter your feedback before submitting.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    try {
      await feedbackMutation.mutateAsync({
        text: feedbackText,
        category: feedbackCategory,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
  return (
    <>
      <Box
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex={10}
      >
        <Button
          onClick={onOpen}
          colorScheme="blue"
          size="md"
          borderRadius="full"
          boxShadow="lg"
        >
          {/* Icon rendered as child instead of using leftIcon prop */}
          <Box
            as="span"
            display="inline-flex"
            alignItems="center"
            mr={2}
          >
            <Box 
              as="span"
              display="inline-block"
            >
              <svg
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                width="18px" 
                height="18px"
              >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
              </svg>
            </Box>
          </Box>
          Feedback
        </Button>
      </Box>
      
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Share Your Feedback
          </DrawerHeader>
          
          <DrawerBody>
            <VStack gap={5} align="stretch" py={4}>
              <Box>
                <Text mb={4}>
                  We value your input to improve Indaba Care. Please share your thoughts, suggestions, or report any issues you've encountered.
                </Text>
                
                {!isOnline && (
                  <HStack gap={2} mb={4}>
                    <Badge colorScheme="yellow">Offline</Badge>
                    <Text fontSize="sm">
                      Your feedback will be submitted when you're back online.
                    </Text>
                  </HStack>
                )}
              </Box>
              
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="content">Content Feedback</option>
                  <option value="usability">Usability Feedback</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Your Feedback</FormLabel>
                <Textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe your feedback in detail..."
                  rows={8}
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitFeedback}
              loading={feedbackMutation.isPending}
              loadingText="Submitting..."
            >
              Submit Feedback
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
