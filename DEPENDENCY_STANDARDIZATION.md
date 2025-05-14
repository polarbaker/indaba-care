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

### Example Component Usage

```jsx
// A simple form with Chakra UI components
function SimpleForm() {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <FormControl mb={4}>
        <FormLabel>Name</FormLabel>
        <Input placeholder="Enter your name" />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Email</FormLabel>
        <Input type="email" placeholder="Enter your email" />
      </FormControl>
      
      <Button colorScheme="blue">Submit</Button>
    </Box>
  )
}
```

## 🔧 Maintaining the Project

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
2. Build the project: `npm run build`
3. Start the development server: `npm run dev`
4. Navigate to http://localhost:3000
5. Check the console for any errors

---

<div align="right">
  <em>Last updated: May 14, 2025</em>
</div>