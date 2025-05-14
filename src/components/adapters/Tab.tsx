import React from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';

// Tab container component
export const Tabs = ({ 
  children, 
  defaultValue, 
  onChange,
  ...rest 
}: { 
  children: React.ReactNode; 
  defaultValue?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}) => {
  const [value, setValue] = React.useState(defaultValue || '');

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Box className="chakra-tabs" {...rest}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange: handleChange,
          });
        }
        return child;
      })}
    </Box>
  );
};

// Tab list component
export const TabsList = ({ 
  children,
  ...rest 
}: { 
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <Flex 
      className="chakra-tabs__tablist"
      borderBottomWidth="1px"
      borderColor="gray.200"
      mb={4}
      {...rest}
    >
      {children}
    </Flex>
  );
};

// Tab trigger component
export const TabsTrigger = ({ 
  children, 
  value,
  onValueChange,
  ...rest 
}: { 
  children: React.ReactNode; 
  value: string; 
  onValueChange?: (value: string) => void;
  [key: string]: any;
}) => {
  const isSelected = onValueChange && value === rest.value;
  
  return (
    <Button
      className="chakra-tabs__tab"
      onClick={() => onValueChange && onValueChange(value)}
      position="relative"
      borderRadius="0"
      borderBottomWidth="2px"
      borderBottomColor={isSelected ? "blue.500" : "transparent"}
      color={isSelected ? "blue.500" : "gray.600"}
      fontWeight={isSelected ? "bold" : "normal"}
      variant="ghost"
      px={4}
      py={2}
      _hover={{
        color: "blue.400",
        bg: "gray.50"
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

// Tab content container
export const TabsContent = ({ 
  children,
  value: tabValue,
  ...rest 
}: { 
  children: React.ReactNode;
  value: string;
  [key: string]: any;
}) => {
  // Only render if this tab is selected
  const isSelected = rest.value === tabValue;
  
  if (!isSelected) return null;
  
  return (
    <Box 
      className="chakra-tabs__tabpanel"
      mt={2}
      {...rest}
    >
      {children}
    </Box>
  );
};
