import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  module?: string;
  tier?: 0 | 1 | 2 | 3;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  module?: string;
}

interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  createConversation: (title: string, module?: string) => string;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  clearAll: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const STORAGE_KEY = 'nudge_conversations';
const MAX_CONVERSATIONS = 50;

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(withDates);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }, [conversations]);

  const createConversation = (title: string, module?: string): string => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      module
    };

    setConversations(prev => {
      const limited = prev.length >= MAX_CONVERSATIONS ? prev.slice(1) : prev;
      return [...limited, newConv];
    });

    setActiveConversationId(newConv.id);
    console.log('רשמתי לעצמי: שיחה חדשה -', title);
    return newConv.id;
  };

  const addMessage = (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;

      const newMessage: Message = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };

      return {
        ...conv,
        messages: [...conv.messages, newMessage],
        updatedAt: new Date()
      };
    }));

    if (message.tier && message.tier >= 2) {
      console.log('רשמתי לעצמי (חשוב!):', message.content.substring(0, 50));
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const setActiveConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const clearAll = () => {
    if (window.confirm('למחוק את כל השיחות?')) {
      setConversations([]);
      setActiveConversationId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        createConversation,
        addMessage,
        deleteConversation,
        setActiveConversation,
        clearAll
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};