import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../../src/contexts/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Mock the Firebase auth functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Initialize with no user
    return jest.fn(); // Return unsubscribe function
  }),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Test component that uses the AuthContext
const TestComponent = () => {
  const { user, signIn, signUp, signOut: authSignOut, loading } = useAuthContext();
  
  const handleSignIn = async () => {
    try {
      await signIn('test@example.com', 'password123');
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSignUp = async () => {
    try {
      // Removed third parameter as signUp only expects email and password
      await signUp('test@example.com', 'password123');
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error(error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as: ${user.email}` : 'Not logged in'}
      </div>
      <button onClick={handleSignIn} data-testid="sign-in">Sign In</button>
      <button onClick={handleSignUp} data-testid="sign-up">Sign Up</button>
      <button onClick={handleSignOut} data-testid="sign-out">Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides authentication state and methods', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially not logged in
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    
    // Test sign in
    const mockUser = { email: 'test@example.com', uid: '123' };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
    });
    
    fireEvent.click(screen.getByTestId('sign-in'));
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
    
    // Test sign up
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { ...mockUser, updateProfile: jest.fn() },
    });
    
    fireEvent.click(screen.getByTestId('sign-up'));
    
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
    
    // Test sign out
    fireEvent.click(screen.getByTestId('sign-out'));
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });
  
  test('handles sign in errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('sign-in'));
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
  
  test('handles sign up errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(new Error('Email already in use'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByTestId('sign-up'));
    
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
});
