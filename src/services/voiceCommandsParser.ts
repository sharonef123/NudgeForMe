// מנתח פקודות קוליות ל-actions מהירים

export interface VoiceCommand {
  command: string;
  action: string;
  params?: Record<string, any>;
  confidence: number;
}

interface CommandPattern {
  patterns: RegExp[];
  action: string;
  examples: string[];
}

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    patterns: [
      /הצג\s+(?:לי\s+)?(.+)/i,
      /תראה\s+(?:לי\s+)?(.+)/i,
      /מה\s+(?:ה)?מצב\s+(.+)/i
    ],
    action: 'SHOW',
    examples: ['הצג לי את התקציב', 'תראה לי את המשימות', 'מה המצב של הקצבה']
  },
  {
    patterns: [
      /תזכיר\s+(?:לי\s+)?(.+)/i,
      /(?:צריך|חייב)\s+לזכור\s+(.+)/i,
      /רשום\s+(?:לי\s+)?(.+)/i
    ],
    action: 'REMIND',
    examples: ['תזכיר לי לשלוח מייל', 'צריך לזכור לקנות חלב', 'רשום פגישה עם רופא']
  },
  {
    patterns: [
      /חשב\s+(?:לי\s+)?(.+)/i,
      /כמה\s+(?:זה\s+)?(.+)/i,
      /מה\s+(?:ה)?סכום\s+של\s+(.+)/i
    ],
    action: 'CALCULATE',
    examples: ['חשב לי 15% מ-10000', 'כמה זה 500 דולר בשקלים', 'מה הסכום של כל ההוצאות']
  },
  {
    patterns: [
      /(?:בדוק|תבדוק)\s+(?:את\s+)?(.+)/i,
      /(?:מה|איך)\s+(?:ה)?סטטוס\s+של\s+(.+)/i
    ],
    action: 'CHECK',
    examples: ['בדוק את היקף המשרה', 'מה הסטטוס של הקצבה', 'תבדוק את הזכויות שלי']
  },
  {
    patterns: [
      /(?:שלח|תשלח)\s+(.+)/i,
      /(?:כתוב|תכתוב)\s+(.+)/i
    ],
    action: 'SEND',
    examples: ['שלח מייל לביטוח לאומי', 'כתוב מכתב ערעור', 'תשלח הודעה לרופא']
  },
  {
    patterns: [
      /(?:תכנן|תארגן)\s+(.+)/i,
      /(?:צור|תצור)\s+תוכנית\s+ל(.+)/i
    ],
    action: 'PLAN',
    examples: ['תכנן את השבוע', 'תארגן את הארוחות', 'צור תוכנית לחודש']
  },
  {
    patterns: [
      /(?:חפש|תחפש)\s+(.+)/i,
      /(?:מצא|תמצא)\s+(.+)/i,
      /איפה\s+(.+)/i
    ],
    action: 'SEARCH',
    examples: ['חפש מידע על זכויות', 'מצא את המסמך', 'איפה המכתב מביטוח לאומי']
  },
  {
    patterns: [
      /היי\s+(?:נאדג׳?|nudge)/i,
      /שלום\s+(?:נאדג׳?|nudge)/i
    ],
    action: 'WAKE',
    examples: ['היי נאדג׳', 'שלום נאדג׳']
  },
  {
    patterns: [
      /(?:תפסיק|עצור|די)/i,
      /(?:שקט|חכה)/i
    ],
    action: 'STOP',
    examples: ['תפסיק', 'עצור', 'די', 'שקט']
  }
];

class VoiceCommandsParser {
  parse(text: string): VoiceCommand | null {
    const normalizedText = text.trim();
    
    // חפש התאמה לפטרנים
    for (const pattern of COMMAND_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = normalizedText.match(regex);
        if (match) {
          const params = match[1] ? { query: match[1].trim() } : {};
          
          return {
            command: normalizedText,
            action: pattern.action,
            params,
            confidence: this.calculateConfidence(normalizedText, pattern)
          };
        }
      }
    }
    
    // אם אין התאמה, זה שאלה חופשית
    return {
      command: normalizedText,
      action: 'CHAT',
      params: { message: normalizedText },
      confidence: 0.5
    };
  }

  private calculateConfidence(text: string, pattern: CommandPattern): number {
    // ככל שהטקסט יותר קצר ומדויק, הביטחון גבוה יותר
    const length = text.length;
    let confidence = 0.8;
    
    if (length > 100) confidence -= 0.2;
    else if (length > 50) confidence -= 0.1;
    
    // בדוק אם יש מילות מפתח חזקות
    const strongKeywords = ['תזכיר', 'חשב', 'בדוק', 'שלח'];
    const hasStrongKeyword = strongKeywords.some(kw => text.includes(kw));
    
    if (hasStrongKeyword) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  getSuggestions(action?: string): string[] {
    if (action) {
      const pattern = COMMAND_PATTERNS.find(p => p.action === action);
      return pattern?.examples || [];
    }
    
    // החזר דוגמאות מכל הקטגוריות
    return COMMAND_PATTERNS.flatMap(p => p.examples.slice(0, 1));
  }

  getAllActions(): string[] {
    return COMMAND_PATTERNS.map(p => p.action);
  }
}

export const voiceCommandsParser = new VoiceCommandsParser();