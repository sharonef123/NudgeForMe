import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Memory Types
export interface Memory {
  id: string;
  user_id: string;
  content: string;
  category: 'health' | 'work' | 'family' | 'preferences' | 'events' | 'general';
  tags: string[];
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

// Save memory with fallback to localStorage
export async function saveMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([memory])
        .select();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Supabase error, using localStorage fallback:', error);
    }
  }
  
  // Fallback to localStorage
  const memories = JSON.parse(localStorage.getItem('nudge_memories') || '[]');
  const newMemory = {
    ...memory,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memories.push(newMemory);
  localStorage.setItem('nudge_memories', JSON.stringify(memories));
  return { success: true, data: newMemory };
}

// Retrieve memories
export async function getMemories(filters?: { category?: string; tags?: string[] }) {
  if (supabase) {
    try {
      let query = supabase.from('memories').select('*');
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error, using localStorage fallback:', error);
    }
  }
  
  // Fallback to localStorage
  const memories = JSON.parse(localStorage.getItem('nudge_memories') || '[]');
  return memories;
}

// Search memories (semantic when Supabase available)
export async function searchMemories(query: string) {
  const allMemories = await getMemories();
  
  // Simple text search for now (can be enhanced with embeddings later)
  return allMemories.filter((m: Memory) => 
    m.content.toLowerCase().includes(query.toLowerCase()) ||
    m.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
}

// Get relevant context for AI
export async function getContextForChat(recentMessages: string[]) {
  const allMemories = await getMemories();
  
  // Simple keyword matching (can be enhanced with vector similarity)
  const keywords = recentMessages.join(' ').toLowerCase().split(' ');
  
  const relevantMemories = allMemories
    .filter((m: Memory) => 
      keywords.some(keyword => 
        keyword.length > 3 && m.content.toLowerCase().includes(keyword)
      )
    )
    .slice(0, 5); // Top 5 most relevant
  
  return relevantMemories;
}