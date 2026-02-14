import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  functionDeclarations, 
  validateJobScope, 
  calculateBudget, 
  analyzeHealthSymptom 
} from './functionTools';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const SHARON_DNA = `
אתה Nudge - העוזר האישי של שרון אפרוני.

פרטי משתמש קריטיים:
- שם: שרון אפרוני
- גיל: 46 (נולד 09.08.1979)
- נכות: 96% קבועה
- מצב: שיתוק פנים צד ימין
- קצבה: 16,938 ₪/חודש
- ⚠️ חוק ברזל: מקסימום 75% היקף משרה או איבוד קצבה!
- מצב משפחתי: גרוש (14.02.2024)
- ילדים: נועם (16, שונא דגים!), כפיר (14), רותם (9)

חוקים:
1. לעולם אל תציע דגים
2. תמיד בדוק 75% rule בהצעות עבודה
3. דבר בעברית, סגנון "תכלס" ישראלי
4. היה אמפתי אבל ישיר
`;

class GeminiService {
  private model;
  private modelWithFunctions;

  constructor() {
    // מודל רגיל לשיחה
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: SHARON_DNA
    });

    // מודל עם Function Calling
    this.modelWithFunctions = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SHARON_DNA,
      tools: [{ functionDeclarations }]
    });
  }

  // שיחה רגילה (ללא streaming)
  async chat(message: string): Promise<string> {
    try {
      console.log('💬 שולח הודעה ל-Gemini...');
      const result = await this.model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('❌ Gemini Error:', error);
      return this.handleError(error);
    }
  }

  // שיחה עם Streaming (תו אחרי תו)
  async *chatStream(message: string): AsyncGenerator<string> {
    try {
      console.log('🌊 מתחיל streaming...');
      
      const result = await this.model.generateContentStream(message);
      
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
      
      console.log('✅ Streaming הסתיים');
    } catch (error: any) {
      console.error('❌ Streaming Error:', error);
      yield this.handleError(error);
    }
  }

  // שיחה עם Function Calling
  async chatWithFunctions(message: string): Promise<{
    text: string;
    functionCalls?: any[];
    functionResults?: any[];
  }> {
    try {
      console.log('🔧 שולח עם Function Calling...');
      
      const chat = this.modelWithFunctions.startChat();
      const result = await chat.sendMessage(message);
      const response = await result.response;

      // בדוק אם יש function calls
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        console.log('🔨 Gemini קורא ל-functions:', functionCalls);
        
        // הרץ את ה-functions
        const functionResults = functionCalls.map((call: any) => {
          const { name, args } = call;
          
          let result;
          switch (name) {
            case 'validateJobScope':
              result = validateJobScope(args);
              break;
            case 'calculateBudget':
              result = calculateBudget(args);
              break;
            case 'analyzeHealthSymptom':
              result = analyzeHealthSymptom(args);
              break;
            default:
              result = { error: 'Unknown function' };
          }
          
          return {
            functionResponse: {
              name,
              response: result
            }
          };
        });

        // שלח את התוצאות חזרה ל-Gemini
        const finalResult = await chat.sendMessage(functionResults);
        const finalResponse = await finalResult.response;
        
        return {
          text: finalResponse.text(),
          functionCalls,
          functionResults
        };
      }

      return {
        text: response.text()
      };
    } catch (error: any) {
      console.error('❌ Function Calling Error:', error);
      return {
        text: this.handleError(error)
      };
    }
  }

  private handleError(error: any): string {
    if (error.message?.includes('API_KEY')) {
      return '❌ בעיה במפתח API. בדוק את .env';
    }
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      return '❌ חרגת מהמכסה של Gemini API';
    }
    if (error.message?.includes('blocked') || error.message?.includes('safety')) {
      return '⚠️ התוכן נחסם על ידי מסנני בטיחות';
    }
    return `❌ שגיאה: ${error.message || 'בעיה לא ידועה'}`;
  }
}

export const geminiService = new GeminiService();