// מערכת זיכרון חכמה עם "רשמתי לעצמי" אוטומטי

export interface Memory {
  id: string;
  fact: string;
  category: 'משפחה' | 'עבודה' | 'בריאות' | 'כלכלי' | 'כללי';
  tier: 0 | 1 | 2 | 3; // 0=Everyday, 1=Important, 2=Urgent, 3=Critical
  source: string;
  timestamp: Date;
  tags: string[];
}

const MEMORY_STORAGE_KEY = 'nudge_memories';
const MAX_MEMORIES = 500;

class MemoryService {
  private memories: Memory[] = [];

  constructor() {
    this.loadMemories();
  }

  private loadMemories() {
    try {
      const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memories = parsed.map((mem: any) => ({
          ...mem,
          timestamp: new Date(mem.timestamp)
        }));
        console.log(`🧠 טענתי ${this.memories.length} זיכרונות`);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }

  private saveMemories() {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memories));
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  }

  addMemory(
    fact: string,
    category: Memory['category'],
    tier: Memory['tier'],
    source: string,
    tags: string[] = []
  ): string {
    const memory: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fact,
      category,
      tier,
      source,
      timestamp: new Date(),
      tags
    };

    this.memories.unshift(memory);

    if (this.memories.length > MAX_MEMORIES) {
      this.memories = this.memories.slice(0, MAX_MEMORIES);
    }

    this.saveMemories();

    const emoji = tier >= 2 ? '🚨' : tier === 1 ? '⚠️' : '📝';
    console.log(`${emoji} רשמתי לעצמי (${category}): ${fact}`);

    return memory.id;
  }

  search(query: string): Memory[] {
    const lowerQuery = query.toLowerCase();
    return this.memories.filter(mem => 
      mem.fact.toLowerCase().includes(lowerQuery) ||
      mem.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      mem.category.includes(lowerQuery)
    );
  }

  getByCategory(category: Memory['category']): Memory[] {
    return this.memories.filter(mem => mem.category === category);
  }

  getByTier(tier: Memory['tier']): Memory[] {
    return this.memories.filter(mem => mem.tier === tier);
  }

  getRecent(count: number = 10): Memory[] {
    return this.memories.slice(0, count);
  }

  getCritical(): Memory[] {
    return this.memories.filter(mem => mem.tier >= 2);
  }

  deleteMemory(id: string) {
    this.memories = this.memories.filter(mem => mem.id !== id);
    this.saveMemories();
  }

  extractFactsFromText(text: string, source: string): string[] {
    const facts: string[] = [];

    // זיהוי תאריכים
    const datePatterns = [
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
      /(יום \w+)/g
    ];

    // זיהוי סכומים
    const moneyPatterns = [
      /(\d+[,.]?\d*\s*(?:שקל|ש"ח|₪))/g,
      /(\d+[,.]?\d*\s*(?:ILS|NIS))/gi
    ];

    // זיהוי מספרי טלפון
    const phonePattern = /(\d{2,3}[-\s]?\d{7})/g;

    // זיהוי מיילים
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemory(
            `תאריך חשוב: ${match}`,
            'כללי',
            1,
            source,
            ['תאריך']
          );
          facts.push(match);
        });
      }
    });

    moneyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemory(
            `סכום: ${match}`,
            'כלכלי',
            1,
            source,
            ['כסף', 'סכום']
          );
          facts.push(match);
        });
      }
    });

    const phones = text.match(phonePattern);
    if (phones) {
      phones.forEach(phone => {
        this.addMemory(
          `טלפון: ${phone}`,
          'כללי',
          0,
          source,
          ['טלפון', 'איש קשר']
        );
        facts.push(phone);
      });
    }

    const emails = text.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        this.addMemory(
          `מייל: ${email}`,
          'כללי',
          0,
          source,
          ['מייל', 'איש קשר']
        );
        facts.push(email);
      });
    }

    return facts;
  }

  cleanOldMemories() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const before = this.memories.length;
    this.memories = this.memories.filter(mem => {
      if (mem.tier >= 2) return true;
      return mem.timestamp > sixMonthsAgo;
    });

    const removed = before - this.memories.length;
    if (removed > 0) {
      this.saveMemories();
      console.log(`🧹 ניקיתי ${removed} זיכרונות ישנים`);
    }
  }

  exportMemories(): string {
    return JSON.stringify(this.memories, null, 2);
  }

  importMemories(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.memories = imported.map((mem: any) => ({
          ...mem,
          timestamp: new Date(mem.timestamp)
        }));
        this.saveMemories();
        console.log(`📥 ייבאתי ${this.memories.length} זיכרונות`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing memories:', error);
      return false;
    }
  }

  getStats() {
    return {
      total: this.memories.length,
      byCategory: {
        משפחה: this.getByCategory('משפחה').length,
        עבודה: this.getByCategory('עבודה').length,
        בריאות: this.getByCategory('בריאות').length,
        כלכלי: this.getByCategory('כלכלי').length,
        כללי: this.getByCategory('כללי').length
      },
      byTier: {
        everyday: this.getByTier(0).length,
        important: this.getByTier(1).length,
        urgent: this.getByTier(2).length,
        critical: this.getByTier(3).length
      },
      critical: this.getCritical().length
    };
  }
}

export const memoryService = new MemoryService();