import { GoogleGenerativeAI } from '@google/generative-ai';
import { memoryService } from './memoryService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SHARON_DNA = `אתה נאדג' - העוזר של שרון.

חוקים:
1. אל תציע דגים - נועם שונא!
2. עבודה מעל 75% היקף = סכנה לקצבה!
3. דבר בעברית, טכלס ישראלי`;

export const geminiService = {
  async chat(userMessage: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const memories = memoryService.getRecentMemories(3);
      const context = memories.map(m => `${m.role}: ${m.content}`).join('\n');

      const prompt = `${SHARON_DNA}\n\nהיסטוריה:\n${context}\n\nשאלה:\n${userMessage}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      memoryService.saveMessage(userMessage, 'user');
      memoryService.saveMessage(response, 'assistant');

      return response;
    } catch (error: any) {
      return `שגיאה: ${error?.message || String(error)}`;
    }
  }
};
