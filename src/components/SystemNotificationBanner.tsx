import React, { useEffect, useState } from 'react';
import { Box, CloseButton } from '@chakra-ui/react';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/alert';
import { Collapse } from '@chakra-ui/transition';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { useTranslation } from 'next-i18next';

interface SystemNotificationProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message: string;
  isClosable?: boolean;
  autoClose?: boolean;
  duration?: number; // in milliseconds
  position?: 'top' | 'bottom';
}

export default function SystemNotificationBanner({
  type = 'info',
  title,
  message,
  isClosable = true,
  autoClose = false,
  duration = 5000,
  position = 'top'
}: SystemNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation('common');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoClose && isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, duration, isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <Collapse in={isVisible} animateOpacity>
      <Box
        position="fixed"
        left={0}
        right={0}
        zIndex={1000}
        {...(position === 'top' ? { top: 0 } : { bottom: 0 })}
      >
        <Alert 
          status={type}
          variant="solid"
          borderRadius={0}
          py={3}
          boxShadow="md"
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <AlertIcon />
          {title && <AlertTitle mr={2}>{title}</AlertTitle>}
          <AlertDescription>{message}</AlertDescription>
          {isClosable && (
            <CloseButton 
              position="absolute" 
              right="8px" 
              top="8px" 
              onClick={() => setIsVisible(false)}
            />
          )}
        </Alert>
      </Box>
    </Collapse>
  );
}
