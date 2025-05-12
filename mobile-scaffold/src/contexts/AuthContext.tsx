import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';

// Firebase configuration - use environment variables in production
const firebaseConfig = {
  // These will be replaced with environment variables in a production environment
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Store user data in local storage for offline access
        try {
          await AsyncStorage.setItem('user', JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          }));
        } catch (error) {
          console.error('Error storing user data:', error);
        }
      } else {
        // Clear user data from local storage
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user data:', error);
        }
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    // Try to restore user from AsyncStorage if offline
    const restoreUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData && !user) {
          // This is just for UI purposes when offline
          // Actual authentication will be checked when online
          const parsedUser = JSON.parse(userData);
          console.log('Restored user from storage:', parsedUser);
          // Note: this doesn't actually authenticate the user with Firebase
          // It just provides some user data for UI when offline
        }
      } catch (error) {
        console.error('Error restoring user data:', error);
      }
    };

    restoreUser();

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await updateProfile(user, { displayName, photoURL });
      // Force refresh the user object
      setUser({ ...user });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
