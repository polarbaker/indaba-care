import React from 'react';
import { Box, Text, Input, Flex } from '@chakra-ui/react';

// FormControl component - replacement for FormControl
export const FormControl = ({ 
  children, 
  isInvalid,
  isRequired,
  ...rest 
}: { 
  children: React.ReactNode; 
  isInvalid?: boolean;
  isRequired?: boolean;
  [key: string]: any;
}) => {
  return (
    <Box
      role="group"
      mb={4}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isInvalid,
            isRequired,
          });
        }
        return child;
      })}
    </Box>
  );
};

// FormLabel component - compatible wrapper for FormLabel
export const FormControlLabel = ({ 
  children, 
  isRequired,
  ...rest 
}: { 
  children: React.ReactNode; 
  isRequired?: boolean;
  [key: string]: any;
}) => {
  return (
    <Flex alignItems="center">
      <Text
        as="label"
        mb={1}
        fontWeight="medium"
        {...rest}
      >
        {children}
      </Text>
      {isRequired && (
        <Text color="red.500" ml={1}>*</Text>
      )}
    </Flex>
  );
};

// FormErrorMessage component
export const FormControlError = ({ 
  children, 
  isInvalid,
  ...rest 
}: { 
  children: React.ReactNode; 
  isInvalid?: boolean;
  [key: string]: any;
}) => {
  if (!isInvalid) return null;
  
  return (
    <Text
      color="red.500"
      fontSize="sm"
      mt={1}
      {...rest}
    >
      {children}
    </Text>
  );
};

// FormHelperText wrapper
export const FormControlHelperText = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Text
      fontSize="sm"
      color="gray.500"
      mt={1}
      {...rest}
    >
      {children}
    </Text>
  );
};

// InputGroup component
export const InputGroup = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      position="relative"
      {...rest}
    >
      {children}
    </Box>
  );
};

// InputLeftAddon component
export const InputLeftAddon = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      position="absolute"
      left={0}
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      ml={3}
      color="gray.500"
      pointerEvents="none"
      {...rest}
    >
      {children}
    </Box>
  );
};

// InputRightAddon component
export const InputRightAddon = ({ 
  children, 
  ...rest 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) => {
  return (
    <Box
      position="absolute"
      right={0}
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      mr={3}
      color="gray.500"
      {...rest}
    >
      {children}
    </Box>
  );
};

// Select component wrapper
export const Select = ({ 
  children,
  placeholder,
  ...rest 
}: { 
  children: React.ReactNode;
  placeholder?: string;
  [key: string]: any;
}) => {
  return (
    <Box position="relative">
      <Box
        as="select"
        w="100%"
        h="40px"
        px={3}
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        _hover={{ borderColor: "gray.300" }}
        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </Box>
      <Box
        position="absolute"
        right={3}
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
      >
        ▼
      </Box>
    </Box>
  );
};
