# Chakra UI v3 Migration Guide

This document outlines our approach to migrating the Indaba Care application from older versions of Chakra UI to version 3.

## Migration Strategy

1. **Use Basic Components First**
   - Simple components like `Box`, `Flex`, `Text`, and `Button` maintain compatibility
   - Use these as building blocks when possible instead of specialized components

2. **Adapter Components**
   - We've created adapter components in `src/components/adapters/` for complex components
   - These provide a consistent API while using Chakra UI v3 under the hood

3. **Component Replacements**
   
   | Old Component | New Approach |
   |---------------|--------------|
   | Tabs components | Use `Tab.tsx` adapters |
   | Card components | Use `Card.tsx` adapters |
   | FormControl | Use `Form.tsx` adapters |
   | useColorModeValue | Use static colors |
   | useToast | Use basic console logging until toast system is rebuilt |

## Adapter Components

### Tabs

The Tabs API has changed significantly. Use our adapter components:
```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/adapters/Tab';

// Example usage
<Tabs defaultValue="tab1" onChange={(value) => console.log(value)}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for Tab 1</TabsContent>
  <TabsContent value="tab2">Content for Tab 2</TabsContent>
</Tabs>
```

### Cards

Use our Card adapters for consistent card components:
```jsx
import { Card, CardHeader, CardBody, CardFooter } from '../components/adapters/Card';

// Example usage
<Card>
  <CardHeader>Card Title</CardHeader>
  <CardBody>Card content goes here</CardBody>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Forms

Form components have been simplified:
```jsx
import { 
  FormControl, 
  FormControlLabel, 
  FormControlError,
  InputGroup,
  InputLeftAddon 
} from '../components/adapters/Form';

// Example usage
<FormControl isInvalid={Boolean(error)}>
  <FormControlLabel>Email</FormControlLabel>
  <Input type="email" value={email} onChange={handleChange} />
  <FormControlError>{error}</FormControlError>
</FormControl>
```

## Common Pitfalls

1. **Component Props**:
   - `isLoading` is no longer supported on Button - use `disabled` with conditional text
   - `spacing` is replaced with `gap` on layout components
   - Many event handlers now use `on<Event>` rather than `<event>` pattern

2. **Styling**:
   - Use theme tokens directly instead of `useColorModeValue`
   - Prefer explicit colors (e.g., `gray.200`) over mode-specific values

3. **Component Structure**:
   - Some components that were available via additional imports are now part of the main package
   - Others have been removed completely and require custom implementations

## Next Steps

1. Continue migrating pages one at a time
2. Update component tests
3. Create additional adapters as needed
4. Replace console-based toast with a proper Toast implementation
