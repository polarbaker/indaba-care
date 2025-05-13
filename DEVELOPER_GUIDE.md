# Indaba Care Developer Guide

This guide is designed specifically for junior developers joining the Indaba Care project. It provides detailed information about the codebase, testing framework, and development workflows.

## Getting Started with the Test Suite

The Indaba Care application has a comprehensive test suite using Jest and React Testing Library. This section will help you understand how to work with and extend these tests.

### Testing Architecture

The test suite is organized as follows:

```
tests/
├── __mocks__/               # Global mocks for external dependencies
│   ├── db.js                # Mock for our PouchDB database
│   └── pouchdb-browser.js   # Mock for PouchDB library
├── components/              # Tests for React components 
├── contexts/                # Tests for React contexts
├── hooks/                   # Tests for custom hooks
└── jest.setup.js            # Global test setup
```

### Important Testing Concepts

#### 1. Mocking External Dependencies

The application uses external dependencies like Firebase and PouchDB that need to be mocked for tests:

- **Firebase Mocks**: We mock Firebase Auth, Firestore, and Storage services
- **PouchDB Mocks**: We mock PouchDB methods like `allDocs`, `put`, `get`, and `sync`
- **Browser APIs**: We mock browser APIs like `navigator.onLine` for testing offline functionality

Example of how we mock the online status:

```typescript
const mockNavigator = { onLine: true };
Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Later in a test:
mockNavigator.onLine = false; // Set offline for a specific test
```

#### 2. Testing Components

When testing components:

- Use `render` from React Testing Library
- Query elements using accessible methods (like `getByRole`, `getByText`)
- Use `fireEvent` or `userEvent` to simulate user interactions
- Make assertions about the resulting DOM

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackButton } from '../../src/components/FeedbackButton';

it('should open the feedback modal when clicked', () => {
  render(<FeedbackButton />);
  const button = screen.getByRole('button', { name: /feedback/i });
  
  fireEvent.click(button);
  
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

#### 3. Testing Hooks

For testing hooks:

- Use `renderHook` from `@testing-library/react-hooks`
- Access the hook's returned values via `result.current`
- Use `act` to perform updates

Example:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSync } from '../../src/hooks/useSync';

it('should perform sync when online', async () => {
  const { result } = renderHook(() => useSync());
  
  let syncResult;
  await act(async () => {
    syncResult = await result.current.performSync();
  });
  
  expect(syncResult.success).toBe(true);
});
```

#### 4. Testing in Different States

When testing an offline-first application, it's important to test in various states:

- **Online vs Offline**: Test functionality in both states
- **Authenticated vs Unauthenticated**: Test with and without a user
- **Error States**: Test how the application handles errors
- **Loading States**: Test what users see during data loading

### Common Testing Patterns

#### Setup and Teardown

Use `beforeEach` to set up your test environment and `afterEach` to clean up:

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    // Reset mocks, set up test environment
    jest.clearAllMocks();
    mockNavigator.onLine = true;
  });
  
  // Your tests...
});
```

#### Spy on Functions

Use `jest.spyOn` to track function calls:

```typescript
const syncSpy = jest.spyOn(syncModule, 'syncData');
// Perform some action
expect(syncSpy).toHaveBeenCalledWith(expectedArgs);
```

### Debugging Tests

If a test is failing:

1. **Use console.log**: Add `console.log` statements to see variable values
2. **Debug with screen.debug()**: Use `screen.debug()` to see the current DOM state
3. **Isolate the test**: Run only that test with `npm test -- -t 'test name'`
4. **Check mocks**: Make sure your mocks are correctly set up

## Adding New Tests

When implementing new features, follow this workflow:

1. Write failing tests that define the expected behavior
2. Implement the feature until the tests pass
3. Refactor your code while keeping tests passing

Remember to test both happy paths and edge cases!

## Common Testing Gotchas

- **Async Testing**: Remember to use `async/await` with `act` for async operations
- **State Updates**: Wrap state updates in `act` to ensure React updates the component properly
- **Mocking Modules**: Make sure to mock modules before importing the component that uses them
- **Component Dependencies**: Mock child components if they're not relevant to the test

## Further Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Kent C. Dodds' Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
