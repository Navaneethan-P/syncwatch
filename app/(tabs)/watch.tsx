import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import { useLocalSearchParams, router } from 'expo-router';
import { Play, Pause, SkipBack, SkipForward, Users } from 'lucide-react-native';
import md5 from 'md5';
import { useAuth } from '@/context/AuthContext';
import { useSessions } from '@/context/SessionContext';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/Button';

const { width, height } = Dimensions.get('window');

export default function WatchScreen() {
  const videoRef = useRef(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoHash, setVideoHash] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { activeSession, sendPlaybackCommand, joinSession } = useSessions();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.sessionId && isAuthenticated) {
      joinSession(params.sessionId);
    }
  }, [params.sessionId, isAuthenticated]);

  useEffect(() => {
    if (activeSession?.playbackCommands?.length > 0) {
      handleIncomingCommand(activeSession.playbackCommands[activeSession.playbackCommands.length - 1]);
    }
  }, [activeSession?.playbackCommands]);

  const handleIncomingCommand = async (command) => {
    if (!command || !videoRef.current) return;
    
    switch (command.action) {
      case 'play':
        if (videoRef.current) {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        }
        break;
      case 'pause':
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
        break;
      case 'seek':
        if (videoRef.current && command.position !== undefined) {
          await videoRef.current.setPositionAsync(command.position);
          setPosition(command.position);
        }
        break;
      default:
        break;
    }
  };

  const pickVideo = async () => {
    if (Platform.OS !== 'web' && (!mediaPermission || !mediaPermission.granted)) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Please grant media library access to select videos');
        return;
      }
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (Platform.OS === 'web') {
        // Web implementation
        setSelectedVideo({ uri: result.assets[0].uri });
        return;
      }
      
      // Calculate file hash for verification
      const fileUri = result.assets[0].uri;
      setLoading(true);
      
      // For large files, we might just hash the first MB as a compromise
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const hashSample = await FileSystem.readAsStringAsync(fileUri, { 
        length: Math.min(1024 * 1024, fileInfo.size), 
        position: 0 
      });
      
      const hash = md5(hashSample);
      setVideoHash(hash);
      setSelectedVideo({ uri: fileUri });
      
      if (activeSession) {
        sendPlaybackCommand({
          action: 'file_selected',
          hash: hash,
          fileName: result.assets[0].name,
          fileSize: fileInfo.size,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
        if (activeSession) {
          sendPlaybackCommand({ action: 'pause', position });
        }
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
        if (activeSession) {
          sendPlaybackCommand({ action: 'play', position });
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleSeek = async (forward = true) => {
    if (!videoRef.current) return;
    
    try {
      const seekAmount = 10000; // 10 seconds in milliseconds
      const newPosition = forward 
        ? Math.min(position + seekAmount, duration) 
        : Math.max(position - seekAmount, 0);
      
      await videoRef.current.setPositionAsync(newPosition);
      setPosition(newPosition);
      
      if (activeSession) {
        sendPlaybackCommand({ action: 'seek', position: newPosition });
      }
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    } else if (status.error) {
      console.error('Video error:', status.error);
      setError('Error playing video');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
          Sign In Required
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
          Please sign in to watch videos with friends
        </Text>
        <Button
          onPress={() => router.push('/settings')}
          style={{ backgroundColor: colors.primary, marginTop: 20 }}
        >
          Go to Settings
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>
          Processing video...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!selectedVideo ? (
        <View style={styles.selectContainer}>
          <Text style={[styles.title, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
            Select a Video
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
            Choose a local video file to watch together
          </Text>
          <Button
            onPress={pickVideo}
            style={{ backgroundColor: colors.primary, marginTop: 20 }}
            icon={<Play size={20} color="#fff" />}
          >
            Select Video
          </Button>
          
          {activeSession && (
            <View style={[styles.sessionInfo, { borderColor: colors.border }]}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.sessionText, { color: colors.text, fontFamily: 'Poppins-Medium' }]}>
                Session: {activeSession.id.substring(0, 8)}
              </Text>
              <Text style={[styles.sessionSubtext, { color: colors.textSecondary, fontFamily: 'Poppins-Regular' }]}>
                {activeSession.participants.length} participant(s)
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.playerContainer}>
          <View style={styles.videoContainer}>
            {Platform.OS !== 'web' ? (
              <Video
                ref={videoRef}
                source={selectedVideo}
                style={styles.video}
                resizeMode="contain"
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                useNativeControls={false}
              />
            ) : (
              <WebView
                source={{ uri: selectedVideo.uri }}
                style={styles.video}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            )}
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surface }]}
              onPress={() => handleSeek(false)}
            >
              <SkipBack size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPause}
            >
              {isPlaying ? (
                <Pause size={30} color="#fff" />
              ) : (
                <Play size={30} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.surface }]}
              onPress={() => handleSeek(true)}
            >
              <SkipForward size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {activeSession && (
            <View style={[styles.syncStatus, { backgroundColor: colors.surface }]}>
              <Users size={16} color={colors.primary} />
              <Text style={[styles.syncText, { color: colors.text }]}>
                {activeSession.participants.length} viewer(s) connected
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  sessionInfo: {
    marginTop: 30,
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  sessionText: {
    fontSize: 16,
    marginTop: 8,
  },
  sessionSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  playerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: width * 0.56,  // 16:9 aspect ratio
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  syncText: {
    marginLeft: 8,
    fontSize: 14,
  },
});