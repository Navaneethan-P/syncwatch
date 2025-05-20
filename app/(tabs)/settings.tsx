import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LogOut, Moon, Sun, User, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/Button';

export default function SettingsScreen() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (error) {
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
    } catch (error) {
      Alert.alert('Sign Out Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          Account
        </Text>
        
        {isAuthenticated && user ? (
          <View style={[styles.userInfo, { backgroundColor: colors.surface }]}>
            <View style={styles.avatar}>
              <User size={24} color={colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
                {user.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
                {user.email}
              </Text>
            </View>
            <Button
              onPress={handleSignOut}
              style={{ backgroundColor: colors.error }}
              loading={loading}
              icon={<LogOut size={16} color="#fff" />}
              small
            >
              Sign Out
            </Button>
          </View>
        ) : (
          <View style={[styles.signInContainer, { borderColor: colors.border }]}>
            <Text style={[styles.signInText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
              Sign in to create and join watching sessions
            </Text>
            <Button
              onPress={handleSignIn}
              style={{ backgroundColor: colors.primary, marginTop: 15 }}
              loading={loading}
            >
              Sign in with Google
            </Button>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          Appearance
        </Text>
        
        <View style={[styles.option, { backgroundColor: colors.surface }]}>
          <View style={styles.optionInfo}>
            {theme === 'dark' ? (
              <Moon size={24} color={colors.text} />
            ) : (
              <Sun size={24} color={colors.text} />
            )}
            <Text style={[styles.optionText, { color: colors.text, fontFamily: 'Poppins-Regular' }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          About
        </Text>
        
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface }]}>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionText, { color: colors.text, fontFamily: 'Poppins-Regular' }]}>
              Privacy Policy
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface }]}>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionText, { color: colors.text, fontFamily: 'Poppins-Regular' }]}>
              Terms of Service
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={[styles.versionInfo, { backgroundColor: colors.surface }]}>
          <Text style={[styles.versionText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
            SyncWatch v1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  signInContainer: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  versionInfo: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
  },
});