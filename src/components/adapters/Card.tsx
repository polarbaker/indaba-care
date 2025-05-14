import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

// Card component - replacement for Card
export const Card = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      bg="white"
      {...rest}
    >
      {children}
    </Box>
  );
};

// CardHeader component
export const CardHeader = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      p={4}
      borderBottomWidth="1px"
      borderColor="gray.200"
      {...rest}
    >
      {children}
    </Box>
  );
};

// CardTitle component
export const CardTitle = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Heading
      size="md"
      fontWeight="semibold"
      {...rest}
    >
      {children}
    </Heading>
  );
};

// CardDescription component
export const CardDescription = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Text
      color="gray.600"
      fontSize="sm"
      mt={1}
      {...rest}
    >
      {children}
    </Text>
  );
};

// CardBody component
export const CardBody = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      p={4}
      {...rest}
    >
      {children}
    </Box>
  );
};

// CardFooter component
export const CardFooter = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      p={4}
      borderTopWidth="1px"
      borderColor="gray.200"
      {...rest}
    >
      {children}
    </Box>
  );
};
