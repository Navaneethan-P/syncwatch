import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

interface Participant {
  id: string;
  displayName?: string;
}

interface PlaybackCommand {
  action: string;
  position?: number;
  fileName?: string;
  hash?: string;
  fileSize?: number;
  timestamp?: number;
}

interface Session {
  id: string;
  createdAt: number;
  createdBy: string;
  participants: string[];
  playbackCommands: PlaybackCommand[];
  lastMovie?: string;
}

interface SessionContextType {
  sessions: Session[];
  activeSession: Session | null;
  createSession: () => Promise<Session>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  sendPlaybackCommand: (command: PlaybackCommand) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  sessions: [],
  activeSession: null,
  createSession: async () => ({ id: '', createdAt: 0, createdBy: '', participants: [], playbackCommands: [] }),
  joinSession: async () => {},
  leaveSession: async () => {},
  sendPlaybackCommand: async () => {},
});

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize sessions from storage
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const storedSessions = await AsyncStorage.getItem('sessions');
        const storedActiveSession = await AsyncStorage.getItem('activeSession');
        
        if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
        }
        
        if (storedActiveSession) {
          setActiveSession(JSON.parse(storedActiveSession));
        }
      } catch (error) {
        console.error('Failed to load sessions', error);
      }
    };

    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  // Save sessions to storage whenever they change
  useEffect(() => {
    const saveSessions = async () => {
      try {
        await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
      } catch (error) {
        console.error('Failed to save sessions', error);
      }
    };

    if (sessions.length > 0) {
      saveSessions();
    }
  }, [sessions]);

  // Save active session to storage whenever it changes
  useEffect(() => {
    const saveActiveSession = async () => {
      try {
        if (activeSession) {
          await AsyncStorage.setItem('activeSession', JSON.stringify(activeSession));
        } else {
          await AsyncStorage.removeItem('activeSession');
        }
      } catch (error) {
        console.error('Failed to save active session', error);
      }
    };

    saveActiveSession();
  }, [activeSession]);

  const createSession = async (): Promise<Session> => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be signed in to create a session');
    }

    const sessionId = uuidv4();
    const newSession: Session = {
      id: sessionId,
      createdAt: Date.now(),
      createdBy: user.uid,
      participants: [user.uid],
      playbackCommands: [],
    };

    setSessions((prevSessions) => [...prevSessions, newSession]);
    setActiveSession(newSession);
    
    return newSession;
  };

  const joinSession = async (sessionId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('You must be signed in to join a session');
    }

    // In a real app, this would communicate with a backend
    // For demonstration, we'll simulate joining an existing session or create a new one
    
    let session = sessions.find((s) => s.id === sessionId);
    
    if (!session) {
      // In a real app, we would verify the session exists on a server
      // For demo, we'll create a mock session if it doesn't exist locally
      session = {
        id: sessionId,
        createdAt: Date.now(),
        createdBy: 'remote-user', // Assume created by someone else
        participants: ['remote-user', user.uid],
        playbackCommands: [],
      };
      
      setSessions((prevSessions) => [...prevSessions, session as Session]);
    } else {
      // Add current user to participants if not already there
      if (!session.participants.includes(user.uid)) {
        const updatedSession = {
          ...session,
          participants: [...session.participants, user.uid],
        };
        
        setSessions((prevSessions) =>
          prevSessions.map((s) => (s.id === sessionId ? updatedSession : s))
        );
        
        session = updatedSession;
      }
    }
    
    setActiveSession(session);
  };

  const leaveSession = async (): Promise<void> => {
    if (!activeSession || !user) return;

    // Update the session to remove the user
    const updatedSession = {
      ...activeSession,
      participants: activeSession.participants.filter((id) => id !== user.uid),
    };

    // If there are still participants, update the session
    if (updatedSession.participants.length > 0) {
      setSessions((prevSessions) =>
        prevSessions.map((s) => (s.id === activeSession.id ? updatedSession : s))
      );
    } 
    // If no participants left, remove the session
    else {
      setSessions((prevSessions) => 
        prevSessions.filter((s) => s.id !== activeSession.id)
      );
    }

    setActiveSession(null);
  };

  const sendPlaybackCommand = async (command: PlaybackCommand): Promise<void> => {
    if (!activeSession) {
      throw new Error('No active session');
    }

    // Add timestamp to command
    const timestampedCommand = {
      ...command,
      timestamp: Date.now(),
    };

    // Update active session with new command
    const updatedSession = {
      ...activeSession,
      playbackCommands: [...activeSession.playbackCommands, timestampedCommand],
    };

    // If this is a file selection command, also update the last movie
    if (command.action === 'file_selected' && command.fileName) {
      updatedSession.lastMovie = command.fileName;
    }

    // Update sessions state
    setSessions((prevSessions) =>
      prevSessions.map((s) => (s.id === activeSession.id ? updatedSession : s))
    );

    // Update active session
    setActiveSession(updatedSession);

    // In a real app, this would send the command to a server
    // For now, we're just updating local state
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSession,
        createSession,
        joinSession,
        leaveSession,
        sendPlaybackCommand,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => useContext(SessionContext);