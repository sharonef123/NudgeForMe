interface Memory {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

class MemoryService {
  private STORAGE_KEY = 'nudge-memories';

  saveMessage(content: string, role: 'user' | 'assistant') {
    const memories = this.getAllMemories();
    memories.unshift({
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    });

    if (memories.length > 100) memories.length = 100;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
  }

  getAllMemories(): Memory[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getRecentMemories(count: number = 5): Memory[] {
    return this.getAllMemories().slice(0, count);
  }

  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getMemoryCount(): number {
    return this.getAllMemories().length;
  }
}

export const memoryService = new MemoryService();
export type { Memory };
