import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Stack,
  Card,
  CardBody,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  AspectRatio,
  IconButton,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Center,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { useAuthContext } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyDB, childDB, photoDB } from '../lib/db';
import { Family, Child, Photo } from '../types';
import { format } from 'date-fns';
import { capturePhoto, uploadQueuedPhotos } from '../lib/photo-upload';
import { useSync } from '../hooks/useSync';

export default function Photos() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOnline, performPush } = useSync();
  const { isOpen: isCaptureModalOpen, onOpen: onCaptureModalOpen, onClose: onCaptureModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // Query photos data
  const { data: photos, isLoading: isPhotosLoading } = useQuery({
    queryKey: ['photos', family?._id],
    queryFn: async () => {
      if (!family) return [];
      try {
        // Get all photos for all children in the family
        const allPhotos: Photo[] = [];
        
        if (children && children.length > 0) {
          for (const child of children) {
            const result = await photoDB.find({
              selector: {
                childId: child.id,
              },
              sort: [{ takenAt: 'desc' }],
            });
            
            if (result.docs.length > 0) {
              allPhotos.push(...result.docs as Photo[]);
            }
          }
        }
        
        // Sort by date, newest first
        return allPhotos.sort((a, b) => b.takenAt - a.takenAt);
      } catch (error) {
        console.error('Error fetching photos:', error);
        return [];
      }
    },
    enabled: !!family && !!children,
  });

  // Try to upload queued photos when online
  useEffect(() => {
    if (isOnline && photos && photos.length > 0) {
      const unuploadedPhotosCount = photos.filter(p => !p.isUploaded).length;
      
      if (unuploadedPhotosCount > 0) {
        uploadQueuedPhotos().then(count => {
          if (count > 0) {
            toast({
              title: 'Photos uploaded',
              description: `${count} photos have been uploaded to the cloud.`,
              status: 'success',
              duration: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
          }
        });
      }
    }
  }, [isOnline, photos, queryClient, toast]);

  // Mutation to capture and save a photo
  const capturePhotoMutation = useMutation({
    mutationFn: async ({ childId, dataURI, caption }: { childId: string; dataURI: string; caption: string }) => {
      return await capturePhoto(childId, dataURI, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      
      toast({
        title: 'Photo saved',
        description: 'Photo has been saved and will be uploaded when online.',
        status: 'success',
        duration: 3000,
      });
      
      // Try to push to Firestore if online
      if (isOnline) {
        performPush('photos');
        uploadQueuedPhotos();
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to save photo',
        description: String(error),
        status: 'error',
        duration: 5000,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleCapturePhoto = async () => {
    if (!selectedChild || !imagePreview) {
      toast({
        title: 'Missing information',
        description: 'Please select a child and upload an image.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    try {
      await capturePhotoMutation.mutateAsync({
        childId: selectedChild,
        dataURI: imagePreview,
        caption,
      });
      
      // Reset form
      setSelectedChild('');
      setCaption('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onCaptureModalClose();
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    onViewModalOpen();
  };

  // Filter photos by child if childId is specified in URL
  const filteredPhotos = React.useMemo(() => {
    if (!photos) return [];
    const childId = router.query.childId as string;
    
    if (childId) {
      return photos.filter(photo => photo.childId === childId);
    }
    
    return photos;
  }, [photos, router.query.childId]);

  // Get child name by ID
  const getChildName = (childId: string) => {
    if (!children) return 'Unknown Child';
    const child = children.find(c => c.id === childId);
    return child ? child.name : 'Unknown Child';
  };

  if (loading || isFamilyLoading) {
    return (
      <Layout>
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={5}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h1" size="xl">
              Photo Gallery
            </Heading>
            <Text color="gray.600">
              Capture and share special moments
            </Text>
          </Box>
          
          <Button
            colorScheme="blue"
            onClick={onCaptureModalOpen}
            isDisabled={children && children.length === 0}
          >
            Upload Photo
          </Button>
        </Flex>

        {!isOnline && (
          <Alert status="info" mb={6}>
            <AlertIcon />
            You're currently offline. Photos will be stored locally and uploaded when you're back online.
          </Alert>
        )}

        {children && children.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text mb={4}>No children have been added yet. Add a child to start capturing photos.</Text>
            <Button colorScheme="blue" onClick={() => router.push('/children/add')}>
              Add a Child
            </Button>
          </Box>
        ) : isPhotosLoading ? (
          <Center py={10}>
            <Spinner size="xl" />
          </Center>
        ) : filteredPhotos.length === 0 ? (
          <Box p={8} textAlign="center" borderWidth={1} borderRadius="lg">
            <Text mb={4}>No photos have been added yet.</Text>
            <Button colorScheme="blue" onClick={onCaptureModalOpen}>
              Upload Your First Photo
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredPhotos.map(photo => (
              <Card
                key={photo.id}
                overflow="hidden"
                variant="outline"
                cursor="pointer"
                onClick={() => handleViewPhoto(photo)}
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.02)', shadow: 'md' }}
              >
                <AspectRatio ratio={4/3}>
                  <Image
                    src={photo.storageUri || photo.localUri}
                    alt={photo.caption || 'Child photo'}
                    objectFit="cover"
                  />
                </AspectRatio>
                
                <CardBody py={3}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                      {getChildName(photo.childId)}
                    </Text>
                    
                    <Badge
                      colorScheme={photo.isUploaded ? 'green' : 'yellow'}
                      fontSize="xs"
                    >
                      {photo.isUploaded ? 'Synced' : 'Local'}
                    </Badge>
                  </Flex>
                  
                  <Text fontSize="xs" color="gray.500">
                    {format(new Date(photo.takenAt), 'MMM d, yyyy')}
                  </Text>
                  
                  {photo.caption && (
                    <Text fontSize="sm" mt={1} noOfLines={2}>
                      {photo.caption}
                    </Text>
                  )}
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Capture Photo Modal */}
      <Modal isOpen={isCaptureModalOpen} onClose={onCaptureModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Select Child</FormLabel>
                <Select
                  placeholder="Select a child"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                >
                  {children && children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Upload Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  p={1}
                />
              </FormControl>

              {imagePreview && (
                <Box mt={2} mb={2}>
                  <AspectRatio ratio={4/3} maxW="400px" mx="auto">
                    <Image 
                      src={imagePreview}
                      alt="Preview"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  </AspectRatio>
                </Box>
              )}

              <FormControl>
                <FormLabel>Caption (optional)</FormLabel>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption to this photo..."
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onCaptureModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCapturePhoto}
              isLoading={capturePhotoMutation.isPending}
              loadingText="Saving..."
              isDisabled={!imagePreview || !selectedChild}
            >
              Save Photo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Photo Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Photo Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPhoto && (
              <Stack spacing={4}>
                <Box>
                  <AspectRatio ratio={4/3} maxW="100%" mx="auto">
                    <Image
                      src={selectedPhoto.storageUri || selectedPhoto.localUri}
                      alt={selectedPhoto.caption || 'Child photo'}
                      objectFit="contain"
                      borderRadius="md"
                    />
                  </AspectRatio>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Child</Text>
                    <Text>{getChildName(selectedPhoto.childId)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Date</Text>
                    <Text>{format(new Date(selectedPhoto.takenAt), 'MMMM d, yyyy')}</Text>
                  </Box>
                </SimpleGrid>
                
                {selectedPhoto.caption && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Caption</Text>
                    <Text>{selectedPhoto.caption}</Text>
                  </Box>
                )}
                
                <Flex align="center" justify="flex-end">
                  <Badge
                    colorScheme={selectedPhoto.isUploaded ? 'green' : 'yellow'}
                    p={2}
                    borderRadius="md"
                  >
                    {selectedPhoto.isUploaded ? 'Synced to Cloud' : 'Stored Locally'}
                  </Badge>
                </Flex>
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
