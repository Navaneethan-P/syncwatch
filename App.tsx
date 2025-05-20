import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExpoRoot } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionContext';

export default function App() {
  const ctx = require.context('./app');
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionProvider>
            <ExpoRoot context={ctx} />
          </SessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}