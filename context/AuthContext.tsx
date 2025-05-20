import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Mock user for native platforms
const MOCK_USER = {
  uid: 'mock-uid-123456',
  email: 'user@example.com',
  displayName: 'Demo User',
  photoURL: null,
  providerId: 'google.com',
} as FirebaseAuthTypes.User;

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (Platform.OS === 'web') {
      // For web, you can still use firebase/auth web SDK or your own method
      throw new Error('Web sign-in not implemented here.');
    } else {
      // For native, mock sign-in or implement real sign-in with Google / Apple
      setUser(MOCK_USER);
      await AsyncStorage.setItem('user', JSON.stringify(MOCK_USER));
    }
  };

  const signOut = async () => {
    if (Platform.OS === 'web') {
      throw new Error('Web sign-out not implemented here.');
    } else {
      await auth().signOut();
      setUser(null);
      await AsyncStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
