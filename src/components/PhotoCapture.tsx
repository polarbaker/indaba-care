import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import { Flex } from '@chakra-ui/layout';
import { Text } from '@chakra-ui/layout';
import { Image } from '@chakra-ui/image';
import { Input } from '@chakra-ui/input';
import { Spinner } from '@chakra-ui/spinner';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { IconButton } from '@chakra-ui/button';
import { Stack, AspectRatio } from '@chakra-ui/layout';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/toast';
import { useAuthContext } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { photoDB } from '../lib/db';
import { useSync } from '../hooks/useSync';
import { Photo } from '../types';
import { format } from 'date-fns';

interface PhotoCaptureProps {
  childId: string;
  onPhotoTaken?: (photoId: string) => void;
}

export default function PhotoCapture({ childId, onPhotoTaken }: PhotoCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caption, setCaption] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { user } = useAuthContext();
  const toast = useToast();
  const router = useRouter();
  const { isOnline, performSync } = useSync();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Clean up media stream when component unmounts
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image as data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  };

  const discardPhoto = () => {
    setCapturedImage(null);
    setCaption('');
    startCamera();
  };

  const savePhoto = async () => {
    if (!capturedImage || !user || !childId) return;
    
    setIsProcessing(true);
    
    try {
      // Create a unique ID for the photo
      const photoId = uuidv4();
      const timestamp = Date.now();
      
      // Create photo object
      const photo: Photo = {
        id: photoId,
        childId,
        caption: caption.trim() || `Photo taken on ${format(new Date(), 'MMM d, yyyy')}`,
        takenAt: timestamp,
        localUri: capturedImage,
        isUploaded: false,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Save to local database
      await photoDB.put({
        _id: photoId,
        ...photo
      });
      
      // If online, attempt to sync immediately
      if (isOnline) {
        performSync();
      }
      
      toast({
        title: 'Photo Saved',
        description: isOnline 
          ? 'Photo has been saved and will be synced with the cloud.'
          : 'Photo has been saved locally and will sync when you are online.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Call callback if provided
      if (onPhotoTaken) {
        onPhotoTaken(photoId);
      }
      
      // Reset state
      setCapturedImage(null);
      setCaption('');
      setIsCameraActive(false);
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to save photo. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={bgColor}
    >
      <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Text fontWeight="bold">
          {capturedImage ? 'Review Photo' : 'Take a Photo'}
        </Text>
      </Box>

      <Box position="relative">
        {!isCameraActive && !capturedImage ? (
          <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            p={10} 
            minH="300px"
          >
            <Text mb={4} color="gray.500" textAlign="center">
              Capture a photo to keep track of activities and moments
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={startCamera}
            >
              <Flex alignItems="center" gap={2}>
                <Box as="span" role="img" aria-label="camera">
                  📷
                </Box>
                Start Camera
              </Flex>
            </Button>
          </Flex>
        ) : null}

        {isCameraActive && (
          <AspectRatio ratio={4/3}>
            <Box position="relative">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Flex 
                position="absolute"
                bottom={4}
                left={0}
                right={0}
                justify="center"
              >
                <IconButton
                  aria-label="Capture Photo"
                  icon={<span role="img" aria-label="camera">📸</span>}
                  isRound
                  size="lg"
                  colorScheme="blue"

                  onClick={capturePhoto}
                />
              </Flex>
              <Box position="absolute" top={2} right={2}>
                <IconButton
                  aria-label="Close Camera"
                  icon={<span role="img" aria-label="close">✖️</span>}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={stopCamera}
                />
              </Box>
            </Box>
          </AspectRatio>
        )}

        {capturedImage && (
          <Box>
            <AspectRatio ratio={4/3}>
              <Image 
                src={capturedImage} 
                alt="Captured photo" 
                objectFit="cover"
              />
            </AspectRatio>
            <Box p={4}>
              <FormControl mb={4}>
                <FormLabel>Caption</FormLabel>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption to this photo"
                />
              </FormControl>
              <Stack direction="row" spacing={4} justifyContent="flex-end">
                <Button
                  variant="outline"
                  onClick={discardPhoto}
                  isDisabled={isProcessing}
                >
                  Discard
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={savePhoto}
                  isDisabled={isProcessing}
                >
                  Save Photo
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>

      {/* Hidden canvas for image processing */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
      />
    </Box>
  );
}
