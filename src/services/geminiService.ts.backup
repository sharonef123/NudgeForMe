import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Sharon's DNA - Hardcoded constraints
const SHARON_DNA = {
  name: 'Sharon Efroni',
  age: 45,
  disability: '96% permanent work injury',
  pension: 16938,
  maxJobScope: 0.75,
  language: 'Hebrew',
  kids: [
    { name: 'Noam', age: 16, hatesFish: true },
    { name: 'Kfir', age: 14 },
    { name: 'Rotem', age: 9 }
  ]
};

const SYSTEM_PROMPT = `אתה Nudge - מערכת הפעלה אישית מבוססת AI.

פרופיל משתמש - Sharon Efroni:
- גיל: 45 (נולדה 9 באוגוסט 1979)
- מצב: נכות צמיתה 96% מעבודה
- קצבה: ₪16,938 לחודש מביטוח לאומי
- כלל זהב: חובה להישאר מתחת ל-75% היקף משרה, אחרת מאבדת את כל הקצבה!
- ילדים: נועם (16, שונא דגים!), כפיר (14), רותם (9)
- שפה עיקרית: עברית
- סגנון: ישירה, "תכלס", ללא בולשיט

הנחיות תגובה:
1. תמיד בעברית
2. היה אמפתי אך ישיר
3. זכור את הכלל של 75% היקף משרה
4. אל תציע מתכונים/מסעדות עם דגים
5. שקול את המגבלות הפיזיות שלה
6. תכלס - ללא פטרונות`;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const sendMessage = async (
  message: string,
  conversationHistory: Message[] = []
): Promise<string> => {
  try {
    console.log('🚀 Sending to Gemini 2.5 Flash...');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    // Build conversation context
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'משתמש' : 'Nudge'}: ${msg.content}`)
      .join('\n\n');

    const fullPrompt = `${SYSTEM_PROMPT}

${context ? `היסטוריית שיחה:\n${context}\n\n` : ''}משתמש: ${message}

Nudge:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Got response from Gemini');
    return text;

  } catch (error: any) {
    console.error('❌ Gemini Error:', error);
    
    if (error.message?.includes('API_KEY')) {
      return '⚠️ שגיאה: API Key לא מוגדר. אנא הוסף VITE_GEMINI_API_KEY ל-.env';
    }
    
    if (error.message?.includes('quota')) {
      return '⚠️ חרגת ממכסת ה-API. נסה שוב מאוחר יותר.';
    }
    
    return `⚠️ שגיאה בתקשורת עם Gemini: ${error.message}`;
  }
};

// Job scope validator (75% rule)
export const validateJobScope = (hours: number, responsibility: number) => {
  const scope = (hours / 40) * (responsibility / 100);
  
  if (scope > SHARON_DNA.maxJobScope) {
    return {
      valid: false,
      warning: `⚠️ עבודה זו חורגת מ-${SHARON_DNA.maxJobScope * 100}% היקף - סיכון לקצבה!`,
      scope: Math.round(scope * 100)
    };
  }
  
  return {
    valid: true,
    scope: Math.round(scope * 100)
  };
};