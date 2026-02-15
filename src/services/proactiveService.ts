// Proactive Notifications Service — Nudge Me OS
// מנוע הנדג' שמתחיל שיחות לפי זמן והקשר

export interface NudgeConfig {
  id: string;
  type: 'morning' | 'evening' | 'midday' | 'manual' | 'reminder';
  triggerHour: number;
  triggerMinute: number;
  enabled: boolean;
  lastTriggered?: string; // ISO date
}

export interface NudgeMessage {
  id: string;
  type: NudgeConfig['type'];
  prompt: string;
  title: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
}

// ברירת מחדל של הנודג'ים
const DEFAULT_NUDGE_CONFIGS: NudgeConfig[] = [
  {
    id: 'morning',
    type: 'morning',
    triggerHour: 7,
    triggerMinute: 0,
    enabled: true,
  },
  {
    id: 'evening',
    type: 'evening',
    triggerHour: 17,
    triggerMinute: 0,
    enabled: true,
  },
  {
    id: 'midday',
    type: 'midday',
    triggerHour: 12,
    triggerMinute: 30,
    enabled: true,
  },
];

// הודעות הנדג' לפי סוג
export function buildNudgePrompt(type: NudgeConfig['type']): NudgeMessage {
  const now = new Date();
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayName = dayNames[now.getDay()];
  const dateStr = now.toLocaleDateString('he-IL');

  switch (type) {
    case 'morning':
      return {
        id: `morning-${Date.now()}`,
        type: 'morning',
        emoji: '🌅',
        title: 'בוקר טוב שרון!',
        priority: 'high',
        prompt: `אתה מתחיל שיחת בוקר יזומה עם שרון. היום ${dayName}, ${dateStr}.
        
פתח בברכת בוקר חמה וטבעית, ואז:
1. שאל איך הוא מרגיש הבוקר (בקצרה, לא סקר)
2. הזכר שיש יום שלם עם אפשרויות
3. הצע לסקור מה יש לו היום (פגישות/משימות)
4. שאל אם הוא רוצה עזרה בתכנון הבוקר

כתוב בעברית, בסגנון חם ואנושי, מקסימום 3 שורות. לא יותר מדי!`,
      };

    case 'evening':
      return {
        id: `evening-${Date.now()}`,
        type: 'evening',
        emoji: '🌆',
        title: 'סיכום ערב',
        priority: 'medium',
        prompt: `אתה מתחיל שיחת ערב יזומה עם שרון. השעה 17:00.
        
פתח בצורה חמה ושאל:
1. איך היה היום
2. הצע הצעת ארוחה לערב (חובה: ללא דגים! אפשר: פסטה, שניצל, בשר, פיצה, סושי ללא דגים)
3. שאל אם יש משהו שצריך להכין למחר
4. הזכר שהוא עשה עבודה טובה היום (תמיד!)

כתוב בעברית, קצר ונחמד.`,
      };

    case 'midday':
      return {
        id: `midday-${Date.now()}`,
        type: 'midday',
        emoji: '☀️',
        title: 'עדכון צהריים',
        priority: 'low',
        prompt: `אתה מתחיל עדכון צהריים עם שרון. השעה 12:30.

בדוק בקצרה:
1. איך מתקדם הבוקר
2. הזכר לאכול משהו אם לא אכל
3. אם הוא עמוס — הזכר שמקסימום 75% משרה!
4. הצע הפסקה קצרה אם צריך

קצר! מקסימום 2-3 שורות.`,
      };

    case 'manual':
      return {
        id: `manual-${Date.now()}`,
        type: 'manual',
        emoji: '🎯',
        title: 'מה יש לי עכשיו?',
        priority: 'high',
        prompt: `שרון לחץ על "מה יש לי עכשיו?" — הוא רוצה סקירה מיידית.

תן לו:
1. מה השעה ומה אמור לקרות עכשיו
2. הזכרות לגבי משימות חשובות של היום
3. בדוק אם יש משהו שצריך טיפול מיידי
4. הצע את הצעד הבא

ישיר ועסקי — שרון רוצה מידע, לא שיחת חולין.`,
      };

    case 'reminder':
      return {
        id: `reminder-${Date.now()}`,
        type: 'reminder',
        emoji: '⏰',
        title: 'תזכורת',
        priority: 'medium',
        prompt: `אתה שולח תזכורת לשרון.

ציין את התזכורת בצורה ברורה ושאל אם הוא צריך עזרה.`,
      };

    default:
      return {
        id: `nudge-${Date.now()}`,
        type: 'manual',
        emoji: '💬',
        title: 'נודג\' חדש',
        priority: 'low',
        prompt: 'שלום שרון! יש משהו שאני יכול לעזור בו?',
      };
  }
}

// ניהול הגדרות בlocalStorage
export function getNudgeConfigs(): NudgeConfig[] {
  try {
    const stored = localStorage.getItem('nudge_configs');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading nudge configs:', e);
  }
  return DEFAULT_NUDGE_CONFIGS;
}

export function saveNudgeConfigs(configs: NudgeConfig[]): void {
  try {
    localStorage.setItem('nudge_configs', JSON.stringify(configs));
  } catch (e) {
    console.error('Error saving nudge configs:', e);
  }
}

// בדיקה האם נודג' צריך להיות מופעל
export function shouldTriggerNudge(config: NudgeConfig): boolean {
  if (!config.enabled) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // בדוק אם השעה תואמת (חלון של 2 דקות)
  if (currentHour !== config.triggerHour) return false;
  if (Math.abs(currentMinute - config.triggerMinute) > 2) return false;

  // בדוק שלא הופעל כבר היום
  if (config.lastTriggered) {
    const lastDate = new Date(config.lastTriggered);
    const today = new Date();
    if (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    ) {
      return false;
    }
  }

  return true;
}

// עדכון זמן הפעלה אחרון
export function markNudgeTriggered(configId: string): void {
  const configs = getNudgeConfigs();
  const updated = configs.map(c =>
    c.id === configId ? { ...c, lastTriggered: new Date().toISOString() } : c
  );
  saveNudgeConfigs(updated);
}