# Dependency Standardization Guide

<div align="center">
  <img src="https://github.com/user-attachments/assets/d75f0c32-f1ef-4be3-9ced-092ca45ea324" alt="Indaba Care Logo" width="200"/>
</div>

## Chakra UI Version Standardization

### Previous Issue

The Indaba Care project was experiencing build and runtime compatibility issues due to mixed Chakra UI versions:

- Main package `@chakra-ui/react` was at version 3.x
- Individual component packages were at version 2.x
- Some components might have been referencing pre-release versions (like 1.0.0-next.X)

These inconsistencies caused:

1. Build failures in certain environments
2. React 18 compatibility issues
3. Inconsistent component behavior
4. Difficulty for new team members to get a working development environment

### Solution Implemented

We standardized all Chakra UI packages to consistent version 2.x, which has the following benefits:

1. Compatible with React 18
2. Stable and well-documented API
3. Consistent component behavior
4. Improved build reliability across environments

### Changes Made

1. **Reduced Individual Component Dependencies**
   - Removed all individual component packages (@chakra-ui/button, @chakra-ui/modal, etc.)
   - Rely on the main @chakra-ui/react package which includes all components

2. **Version Standardization**
   - Updated @chakra-ui/react to version 2.8.2
   - Updated @chakra-ui/icons to version 2.1.1
   - Maintained consistent versions for system and theme packages

3. **Added Resolution Strategy**
   - Added package.json resolutions to enforce consistent versions
   - Prevents npm/yarn from installing conflicting versions

### How to Maintain Going Forward

#### When Adding New Chakra UI Components

```jsx
// CORRECT: Import from main package
import { Button, Drawer, Modal } from '@chakra-ui/react'

// INCORRECT: Don't import from individual packages
// import { Button } from '@chakra-ui/button'
```

#### When Updating Packages

1. Always update the main `@chakra-ui/react` package first
2. Update the resolutions field in package.json to match
3. Run a clean install:

```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json yarn.lock

# Reinstall with the new standardized versions
npm install
# or 
yarn install
```

## Troubleshooting

If you encounter build errors related to Chakra UI:

1. Check for any new individual Chakra UI packages that might have been added
2. Ensure the resolutions field in package.json is up to date
3. Perform a clean install as described above

---

<div align="right">
  <em>Last updated: May 14, 2025</em>
</div>