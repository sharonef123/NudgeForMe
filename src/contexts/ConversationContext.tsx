import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    audioUsed?: boolean;
    processingTime?: number;
    tokens?: number;
  };
}

export interface ConversationSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalMessages: number;
    voiceInteractions: number;
    avgResponseTime: number;
  };
}

interface ConversationContextType {
  // Current session
  currentSession: ConversationSession | null;
  
  // All sessions
  sessions: ConversationSession[];
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  createNewSession: (title?: string) => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearCurrentSession: () => void;
  
  // Context preservation
  getRecentContext: (messageCount?: number) => Message[];
  getSessionSummary: () => string;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const STORAGE_KEY = 'nudge-conversations';
const MAX_SESSIONS = 50;
const MAX_MESSAGES_PER_SESSION = 100;

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const sessionsWithDates = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
        
        // Load most recent session
        if (sessionsWithDates.length > 0) {
          setCurrentSession(sessionsWithDates[0]);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    } else {
      // Create initial session if none exists
      createNewSession('שיחה ראשונה');
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createNewSession = (title?: string) => {
    const newSession: ConversationSession = {
      id: generateId(),
      title: title || `שיחה ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalMessages: 0,
        voiceInteractions: 0,
        avgResponseTime: 0
      }
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      // Keep only MAX_SESSIONS
      return updated.slice(0, MAX_SESSIONS);
    });
    
    setCurrentSession(newSession);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentSession) {
      createNewSession();
      return;
    }

    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    };

    const updatedSession: ConversationSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage].slice(-MAX_MESSAGES_PER_SESSION),
      updatedAt: new Date(),
      metadata: {
        ...currentSession.metadata,
        totalMessages: (currentSession.metadata?.totalMessages || 0) + 1,
        voiceInteractions: (currentSession.metadata?.voiceInteractions || 0) + 
          (message.metadata?.audioUsed ? 1 : 0)
      }
    };

    // Auto-generate title from first user message if still default
    if (updatedSession.messages.length === 1 && 
        updatedSession.title.startsWith('שיחה') &&
        newMessage.role === 'user') {
      updatedSession.title = newMessage.content.slice(0, 50) + 
        (newMessage.content.length > 50 ? '...' : '');
    }

    setCurrentSession(updatedSession);
    
    setSessions(prev => 
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSession?.id === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSession(remaining[0] || null);
      
      if (remaining.length === 0) {
        createNewSession();
      }
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, title } : s)
    );
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title } : null);
    }
  };

  const clearCurrentSession = () => {
    if (currentSession) {
      const clearedSession: ConversationSession = {
        ...currentSession,
        messages: [],
        updatedAt: new Date()
      };
      
      setCurrentSession(clearedSession);
      setSessions(prev =>
        prev.map(s => s.id === clearedSession.id ? clearedSession : s)
      );
    }
  };

  const getRecentContext = (messageCount: number = 10): Message[] => {
    if (!currentSession) return [];
    return currentSession.messages.slice(-messageCount);
  };

  const getSessionSummary = (): string => {
    if (!currentSession || currentSession.messages.length === 0) {
      return 'שיחה חדשה';
    }

    const { messages, metadata } = currentSession;
    const duration = new Date().getTime() - currentSession.createdAt.getTime();
    const durationMinutes = Math.floor(duration / 60000);

    return `
שיחה עם ${messages.length} הודעות
${metadata?.voiceInteractions || 0} אינטראקציות קוליות
משך: ${durationMinutes} דקות
    `.trim();
  };

  const value: ConversationContextType = {
    currentSession,
    sessions,
    addMessage,
    createNewSession,
    loadSession,
    deleteSession,
    updateSessionTitle,
    clearCurrentSession,
    getRecentContext,
    getSessionSummary
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};