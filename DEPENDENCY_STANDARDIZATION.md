# Dependency Standardization Guide

<div align="center">
  <img src="https://github.com/user-attachments/assets/d75f0c32-f1ef-4be3-9ced-092ca45ea324" alt="Indaba Care Logo" width="200"/>
</div>

## 🚀 Quick Start for New Developers

We've created a setup script to make installation easy. Simply run:

```bash
# Clone the repository
git clone https://github.com/polarbaker/indaba-care.git
cd indaba-care

# Run the setup script
./setup.sh

# Start the development server
npm run dev
```

## Chakra UI Version Management

### Previous Issue

The Indaba Care project was experiencing build and runtime compatibility issues due to mixed Chakra UI versions:

- Main package `@chakra-ui/react` was at version 3.x
- Individual component packages were at different versions (mix of v2.x and v3.x)
- Some components might have been referencing pre-release versions

These inconsistencies caused:

1. Build failures in different environments
2. React 18 compatibility issues
3. Inconsistent component behavior
4. Difficulty for new team members to get a working development environment

### Solution Implemented

We standardized all Chakra UI packages using a consistent versioning strategy:

1. **Maintain v3.x for Main Components**
   - Kept `@chakra-ui/react` at version 3.17.0
   - Kept `@chakra-ui/theme` at version 3.4.6

2. **Force Consistency Using Resolutions**
   - Added package.json resolutions to enforce consistent versions
   - All sub-dependencies are forced to compatible versions
   
3. **Simplified Import Strategy**
   - Use only the main package for importing components

## 📝 For Developers: Component Usage Guide

### How to Import Components

Always import components from the main package:

```jsx
// ✅ CORRECT WAY
import { 
  Button, 
  Drawer, 
  Modal, 
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react'

// ❌ INCORRECT - Don't do this
// import { Button } from '@chakra-ui/button'
// import { Drawer } from '@chakra-ui/drawer'
```

### Chakra UI v3 API Changes

Chakra UI v3 introduces several API changes from v2. Here are the key differences to be aware of:

1. **VStack/HStack Changes**:
   - Use `gap` instead of `spacing` for controlling space between elements
   ```jsx
   // ✅ Correct in v3
   <VStack gap={4}>
     <Box>Item 1</Box>
     <Box>Item 2</Box>
   </VStack>
   
   // ❌ Incorrect in v3
   <VStack spacing={4}>
     <Box>Item 1</Box>
     <Box>Item 2</Box>
   </VStack>
   ```

2. **useDisclosure Hook**:
   - Returns `open` instead of `isOpen`
   ```jsx
   // ✅ Correct in v3
   const { open, onOpen, onClose } = useDisclosure();
   
   // ❌ Incorrect in v3
   const { isOpen, onOpen, onClose } = useDisclosure();
   ```

3. **Tabs Component**:
   - Use `TabsList` instead of `TabList`
   - Use `TabsTrigger` instead of `Tab`
   - Use `TabsContent` instead of `TabPanel`
   ```jsx
   // ✅ Correct in v3
   <Tabs>
     <TabsList>
       <TabsTrigger>Tab 1</TabsTrigger>
       <TabsTrigger>Tab 2</TabsTrigger>
     </TabsList>
     <TabsContent>Content 1</TabsContent>
     <TabsContent>Content 2</TabsContent>
   </Tabs>
   ```

### Example Component Usage

```jsx
// A simple form with Chakra UI v3 components
function SimpleForm() {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack gap={4} align="stretch">
        <Box>
          <Text as="label" fontWeight="medium">Name</Text>
          <Input placeholder="Enter your name" mt={1} />
        </Box>
        
        <Box>
          <Text as="label" fontWeight="medium">Email</Text>
          <Input type="email" placeholder="Enter your email" mt={1} />
        </Box>
        
        <Button colorScheme="blue">Submit</Button>
      </VStack>
    </Box>
  )
}
```

## 🔧 Maintaining the Project

### React Version Conflicts

The project uses React 18.3.1, but some testing packages (like @testing-library/react-hooks) have peer dependencies on older React versions. We handle this by:

1. Using `--legacy-peer-deps` flag with npm install
2. Using package resolutions to enforce consistent versions
3. Runtime validation to catch any dependency issues

### PouchDB and Firebase Integration

The offline-first architecture relies on PouchDB (v9.0.0) working correctly with Firebase. These dependencies must remain compatible:

- **PouchDB**: Used for local storage and offline data management
- **Firebase**: Provides the backend services and synchronization

Testing both online and offline workflows is essential when upgrading either of these dependencies.

This is why the setup script includes the `--legacy-peer-deps` flag. If you encounter dependency errors when installing, **do not downgrade React**. Instead, use the provided setup script or run:

```bash
npm install --legacy-peer-deps
```

### When Updating Packages

1. Always update the main `@chakra-ui/react` package first
2. Update the resolutions field in package.json to match
3. Run the setup script again:

```bash
./setup.sh
```

## ❓ Troubleshooting Common Issues

### "Module not found" Errors

```
Error: Cannot find module '@chakra-ui/drawer' or its corresponding type declarations.
```

**Solution**: Update your imports to use the main package:
```jsx
// Change this:
import { Drawer } from '@chakra-ui/drawer'

// To this:
import { Drawer } from '@chakra-ui/react'
```

### Version Conflict Errors

```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Solution**: This often indicates a React version conflict. Run the setup script to ensure consistent dependencies:
```bash
./setup.sh
```

### Compilation Errors

```
TypeError: Cannot read properties of undefined (reading 'useToast')
```

**Solution**: This often happens with mixed Chakra versions. Make sure you're importing from the main package and run the setup script:
```bash
./setup.sh
```

## ✅ Verification Process

After updating dependencies, verify your installation with these steps:

1. Run the setup script: `./setup.sh`
2. Run the standalone dependency check: `node verify-dependencies.js`
3. Build the project: `npm run build`
4. Start the development server: `npm run dev`
5. Navigate to http://localhost:3000

### Standalone Dependency Verification

We've created a simple yet powerful verification script that can be run directly from the command line:

```bash
node verify-dependencies.js
```

This script provides a comprehensive report that:

- Verifies React 18.3.x is correctly installed
- Confirms Chakra UI components are available and using v3 compatible APIs
- Validates PouchDB installation
- Provides troubleshooting information if any issues are found

### Automated Runtime Dependency Validation

In addition to the standalone script, the project includes automated dependency validation that runs when the app starts:

1. A utility in `src/lib/dependency-check.ts` verifies critical dependencies at runtime
2. It checks React version, Chakra UI, and PouchDB compatibility
3. Any issues are logged to the console with clear error messages

This dual approach ensures dependency issues are caught early, whether during development setup or at runtime.

---

<div align="right">
  <em>Last updated: May 14, 2025</em>
</div>

## 📊 Dependency Monitoring

### Integration with CI/CD

Our CI/CD pipeline includes dependency validation as part of the build process:

1. Automated tests verify that all components render correctly
2. The setup-check.tsx page serves as both a manual check and automated test
3. Build failures will occur if critical dependencies are incompatible

### Updating Dependencies Safely

Follow this process when updating any dependencies:

1. Create a branch specifically for the dependency update
2. Run the setup script after updating package.json
3. Test thoroughly using the setup verification page
4. Check for console warnings from the dependency validation utility
5. Run the test suite: `npm test`
6. Merge only after all checks pass