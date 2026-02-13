import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async sendMessage(text: string, history: any[] = [], attachments?: any[]) {
    try {
      const startTime = performance.now();
      
      const result = await this.model.generateContent(text);
      const response = await result.response;
      const responseText = response.text();
      
      const endTime = performance.now();
      
      return {
        text: responseText,
        processingTime: Math.round(endTime - startTime),
      };
    } catch (error: any) {
      console.error('Gemini Error:', error);
      throw new Error(error.message || 'Failed to get response');
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;