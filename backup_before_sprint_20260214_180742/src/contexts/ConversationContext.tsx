import { createContext, useContext, ReactNode } from 'react';

interface ConversationContextType {}

const ConversationContext = createContext<ConversationContextType>({});

export const useConversation = () => useContext(ConversationContext);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ConversationContext.Provider value={{}}>
      {children}
    </ConversationContext.Provider>
  );
};