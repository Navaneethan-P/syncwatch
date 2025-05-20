import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Play, UserPlus, CirclePlus as PlusCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useSessions } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';
import SessionCard from '@/components/SessionCard';
import Button from '@/components/Button';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { sessions, createSession } = useSessions();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to create a viewing session.');
      return;
    }

    try {
      setLoading(true);
      await createSession();
      router.push('/watch');
    } catch (error) {
      Alert.alert('Error', 'Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to join a viewing session.');
      return;
    }
    
    router.push('/join');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Poppins-Bold' }]}>
          SyncWatch
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
          Watch movies together, miles apart
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button 
          onPress={handleCreateSession}
          style={{ backgroundColor: colors.primary }}
          loading={loading}
          icon={<PlusCircle size={20} color="#fff" />}
        >
          Create Session
        </Button>
        
        <Button 
          onPress={handleJoinSession}
          style={{ backgroundColor: colors.secondary, marginTop: 10 }}
          icon={<UserPlus size={20} color="#fff" />}
        >
          Join Session
        </Button>
      </View>

      <View style={styles.recentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          Recent Sessions
        </Text>
        
        <ScrollView style={styles.sessionsList}>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
                No recent sessions. Create or join a session to get started!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  recentContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  sessionsList: {
    flex: 1,
  },
  emptyState: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});