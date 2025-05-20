import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useSessions } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/Button';

export default function JoinSessionScreen() {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const { joinSession } = useSessions();

  const handleJoinSession = async () => {
    if (!sessionId.trim()) {
      Alert.alert('Error', 'Please enter a valid session ID');
      return;
    }

    try {
      setLoading(true);
      await joinSession(sessionId.trim());
      router.push({
        pathname: '/watch',
        params: { sessionId: sessionId.trim() }
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    router.replace('/settings');
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Poppins-Bold' }]}>
          Join a Session
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
          Enter the session ID provided by your friend to join their watching session.
        </Text>
        
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            }
          ]}
          placeholder="Enter session ID"
          placeholderTextColor={colors.textSecondary}
          value={sessionId}
          onChangeText={setSessionId}
          autoCapitalize="none"
        />
        
        <Button
          onPress={handleJoinSession}
          style={{ backgroundColor: colors.primary, marginTop: 20 }}
          loading={loading}
        >
          Join Session
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});