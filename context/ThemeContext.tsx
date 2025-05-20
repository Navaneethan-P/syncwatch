import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ColorScheme;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

const lightColors: ColorScheme = {
  primary: '#2563EB',
  secondary: '#0EA5E9',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

const darkColors: ColorScheme = {
  primary: '#3B82F6',
  secondary: '#0EA5E9',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme() as Theme;
  const [theme, setTheme] = useState<Theme>(deviceTheme || 'dark');
  const [colors, setColors] = useState<ColorScheme>(
    theme === 'light' ? lightColors : darkColors
  );

  useEffect(() => {
    // Load saved theme from storage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme !== null) {
          setTheme(savedTheme as Theme);
          setColors(savedTheme === 'light' ? lightColors : darkColors);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setColors(newTheme === 'light' ? lightColors : darkColors);
    
    try {
      await AsyncStorage.setItem('userTheme', newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);