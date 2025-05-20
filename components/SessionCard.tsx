import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Clock, Users, Film } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface SessionProps {
  session: {
    id: string;
    createdAt: number;
    participants: string[];
    title?: string;
    lastMovie?: string;
  };
}

const SessionCard: React.FC<SessionProps> = ({ session }) => {
  const { colors } = useTheme();
  
  const handlePress = () => {
    router.push({
      pathname: '/watch',
      params: { sessionId: session.id }
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          {session.title || `Session ${session.id.substring(0, 8)}`}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
            {formatDistanceToNow(session.createdAt)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
            {session.participants.length} {session.participants.length === 1 ? 'viewer' : 'viewers'}
          </Text>
        </View>

        {session.lastMovie && (
          <View style={styles.detailItem}>
            <Film size={16} color={colors.textSecondary} />
            <Text 
              style={[styles.detailText, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {session.lastMovie}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.joinButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.joinButtonText, { color: '#FFFFFF', fontFamily: 'Poppins-Medium' }]}>
          Resume
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 14,
  },
});

export default SessionCard;