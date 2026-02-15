import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationContextType {
  sessions: Session[];
  activeSessionId: string | null;
  activeSession: Session | null;
  createSession: () => Session;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

const STORAGE_KEY = "nudge_sessions_v2";

const loadSessions = (): Session[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveSessions = (sessions: Session[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
};

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const loaded = loadSessions();
    if (loaded.length === 0) {
      const first: Session = {
        id: "session_" + Date.now(),
        title: "שיחה ראשונה",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSessions([first]);
      return [first];
    }
    return loaded;
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const loaded = loadSessions();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const createSession = useCallback((): Session => {
    const newSession: Session = {
      id: "session_" + Date.now(),
      title: "שיחה חדשה",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId(newSession.id);
    return newSession;
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId((prev) => {
      if (prev === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return prev;
    });
  }, [sessions]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
    };

    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const newMessages = [...s.messages, newMsg];
        const title = s.messages.length === 0 && msg.role === "user"
          ? msg.content.slice(0, 40) + (msg.content.length > 40 ? "..." : "")
          : s.title;
        return {
          ...s,
          messages: newMessages,
          title,
          updatedAt: new Date().toISOString(),
        };
      });
      saveSessions(updated);
      return updated;
    });
  }, [activeSessionId]);

  const clearMessages = useCallback(() => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [], updatedAt: new Date().toISOString() } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [activeSessionId]);

  return (
    <ConversationContext.Provider value={{
      sessions,
      activeSessionId,
      activeSession,
      createSession,
      deleteSession,
      setActiveSession: setActiveSessionId,
      addMessage,
      clearMessages,
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error("useConversation must be inside ConversationProvider");
  return ctx;
};