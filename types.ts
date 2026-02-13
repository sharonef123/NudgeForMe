
export enum Wing {
  SHARK = 'SHARK',     // Tasks & Execution
  ANCHOR = 'ANCHOR',   // Emotional Wellbeing
  CTO = 'CTO',         // Logic & Systems
  CHEF = 'CHEF',       // Food & Logistics
  ARCHIVIST = 'ARCHIVIST' // Memory & Documents
}

export enum TaskTier {
  TIER0 = 0, // Everyday
  TIER1 = 1, // Important
  TIER2 = 2, // High Priority
  TIER3 = 3  // Critical
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  wing?: Wing;
  groundingSources?: GroundingSource[];
  isThinking?: boolean;
}

export interface Topic {
  id: string;
  label: string;
  color?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isFavorite: boolean;
  topicId?: string;
  updatedAt: number;
}

export interface MemoryFact {
  id: string;
  fact: string;
  timestamp: number;
  category: string;
}

export interface Task {
  id: string;
  title: string;
  tier: TaskTier;
  deadline?: string;
  completed: boolean;
}

export interface UserDNA {
  name: string;
  memories: MemoryFact[];
  preferences: {
    noFish: boolean;
    language: string;
  };
}
