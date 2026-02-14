// מנוע פרואקטיבי - Nudge יוזם פעולות!

import { memoryService } from './memoryService';

export interface ProactiveRule {
  id: string;
  name: string;
  description: string;
  condition: () => boolean;
  action: () => void;
  priority: 1 | 2 | 3; // 1=low, 2=medium, 3=high
  enabled: boolean;
  lastTriggered?: Date;
  cooldown?: number; // דקות
}

export interface ProactiveNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'reminder';
  timestamp: Date;
  action?: {
    label: string;
    callback: () => void;
  };
}

class ProactiveEngine {
  private rules: ProactiveRule[] = [];
  private notifications: ProactiveNotification[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // ✅ 1. תזכורת יום עם הילדים
    this.addRule({
      id: 'kids_day_reminder',
      name: 'תזכורת יום עם הילדים',
      description: 'מזכיר ביום רביעי שיש את הילדים',
      condition: () => {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        // יום רביעי (3) בשעה 7-9 בבוקר
        return day === 3 && hour >= 7 && hour < 9;
      },
      action: () => {
        this.notify({
          title: '👨‍👧‍👦 היום יום עם הילדים!',
          message: 'היום יום רביעי - נועם, כפיר ורותם איתך היום. זכור: נועם שונא דגים! 🐟❌',
          type: 'reminder'
        });
      },
      priority: 2,
      enabled: true,
      cooldown: 1440 // פעם ביום
    });

    // ✅ 2. בדיקת 75% rule
    this.addRule({
      id: 'job_scope_warning',
      name: 'אזהרת חריגה מ-75%',
      description: 'מזהיר אם מתקרבים ל-75% היקף משרה',
      condition: () => {
        // בדוק אם יש זיכרון של שעות עבודה
        const workMemories = memoryService.search('שעות עבודה');
        if (workMemories.length === 0) return false;
        
        // לוגיקה פשוטה - בדוק אם יש התראה על scope גבוה
        const recentWork = workMemories.filter(m => {
          const daysSince = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince < 7; // שבוע אחרון
        });
        
        return recentWork.length > 3; // הרבה פעילות עבודה
      },
      action: () => {
        this.notify({
          title: '⚠️ שים לב להיקף המשרה!',
          message: 'נראה שאתה עובד הרבה השבוע. זכור: מקסימום 75% כדי לשמור על הקצבה!',
          type: 'warning',
          action: {
            label: 'בדוק היקף',
            callback: () => console.log('פתיחת מחשבון היקף משרה')
          }
        });
      },
      priority: 3,
      enabled: true,
      cooldown: 10080 // פעם בשבוע
    });

    // ✅ 3. תזכורת ביטוח לאומי
    this.addRule({
      id: 'bituach_leumi_reminder',
      name: 'תזכורת ביטוח לאומי',
      description: 'מזכיר בתחילת חודש לעדכן ביטוח לאומי',
      condition: () => {
        const now = new Date();
        const day = now.getDate();
        const hour = now.getHours();
        // ה-5 בחודש בשעה 9-11 בבוקר
        return day === 5 && hour >= 9 && hour < 11;
      },
      action: () => {
        this.notify({
          title: '📋 תזכורת: ביטוח לאומי',
          message: 'תחילת חודש! זמן טוב לעדכן את ביטוח לאומי על הכנסות ולבדוק זכויות.',
          type: 'reminder',
          action: {
            label: 'פתח אתר ביטוח לאומי',
            callback: () => window.open('https://www.btl.gov.il', '_blank')
          }
        });
      },
      priority: 2,
      enabled: true,
      cooldown: 43200 // פעם בחודש
    });

    // ✅ 4. תכנון ארוחות לשבוע
    this.addRule({
      id: 'meal_planning',
      name: 'תזכורת תכנון ארוחות',
      description: 'מציע לתכנן ארוחות לשבוע בימי ראשון',
      condition: () => {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        // יום ראשון (0) בשעה 10-12
        return day === 0 && hour >= 10 && hour < 12;
      },
      action: () => {
        this.notify({
          title: '🍳 בוא נתכנן את השבוע!',
          message: 'יום ראשון זמן מצוין לתכנן ארוחות לשבוע. רוצה עזרה? (זכור: בלי דגים! 🐟❌)',
          type: 'info',
          action: {
            label: 'תכנן ארוחות',
            callback: () => console.log('פתיחת מודול THE CHEF')
          }
        });
      },
      priority: 1,
      enabled: true,
      cooldown: 10080 // פעם בשבוע
    });

    // ✅ 5. זיהוי חרדה מהודעות
    this.addRule({
      id: 'anxiety_detection',
      name: 'זיהוי חרדה',
      description: 'מזהה סימנים של חרדה ומציע תמיכה',
      condition: () => {
        // חפש זיכרונות אחרונים עם מילות מפתח של חרדה
        const anxietyKeywords = ['לחוץ', 'מודאג', 'חרד', 'פחד', 'דאגה'];
        const recentMessages = memoryService.getRecent(10);
        
        return recentMessages.some(mem => 
          anxietyKeywords.some(kw => mem.fact.includes(kw))
        );
      },
      action: () => {
        this.notify({
          title: '🫂 אני כאן בשבילך',
          message: 'נראה שאתה קצת מתוח. רוצה לדבר על זה? אני כאן לעזור.',
          type: 'info',
          action: {
            label: 'בוא נדבר',
            callback: () => console.log('פתיחת מודול THE ANCHOR')
          }
        });
      },
      priority: 2,
      enabled: true,
      cooldown: 360 // פעם ב-6 שעות
    });

    // ✅ 6. תזכורת תרופות (דוגמה)
    this.addRule({
      id: 'medication_reminder',
      name: 'תזכורת תרופות',
      description: 'תזכורת לקחת תרופות בזמן',
      condition: () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        // 08:00, 14:00, 20:00
        return (hour === 8 || hour === 14 || hour === 20) && minute < 15;
      },
      action: () => {
        this.notify({
          title: '💊 זמן תרופות!',
          message: 'תזכורת: זמן לקחת את התרופות. לא לשכוח!',
          type: 'reminder'
        });
      },
      priority: 3,
      enabled: false, // כבוי כברירת מחדל - משתמש יפעיל
      cooldown: 360 // פעם ב-6 שעות
    });

    console.log(`🤖 ProactiveEngine: ${this.rules.length} חוקים נטענו`);
  }

  addRule(rule: Omit<ProactiveRule, 'lastTriggered'>) {
    this.rules.push(rule as ProactiveRule);
  }

  private canTrigger(rule: ProactiveRule): boolean {
    if (!rule.enabled) return false;
    
    // בדוק cooldown
    if (rule.lastTriggered && rule.cooldown) {
      const minutesSince = (Date.now() - rule.lastTriggered.getTime()) / (1000 * 60);
      if (minutesSince < rule.cooldown) {
        return false;
      }
    }
    
    return true;
  }

  private checkRules() {
    const triggeredRules = this.rules
      .filter(rule => this.canTrigger(rule))
      .filter(rule => {
        try {
          return rule.condition();
        } catch (error) {
          console.error(`Error in rule ${rule.id}:`, error);
          return false;
        }
      })
      .sort((a, b) => b.priority - a.priority); // priority גבוה ראשון

    triggeredRules.forEach(rule => {
      console.log(`🔔 Triggering rule: ${rule.name}`);
      rule.action();
      rule.lastTriggered = new Date();
    });
  }

  private notify(notification: Omit<ProactiveNotification, 'id' | 'timestamp'>) {
    const fullNotification: ProactiveNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.notifications.unshift(fullNotification);

    // הגבל ל-50 התראות אחרונות
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // שמור ב-memory service
    memoryService.addMemory(
      `התראה פרואקטיבית: ${notification.title}`,
      'כללי',
      notification.type === 'critical' ? 3 : notification.type === 'warning' ? 2 : 1,
      'ProactiveEngine',
      ['התראה', 'פרואקטיבי']
    );

    // Emit event למי שמאזין
    window.dispatchEvent(new CustomEvent('nudge-notification', { 
      detail: fullNotification 
    }));

    console.log(`🔔 ${notification.title}: ${notification.message}`);
  }

  start() {
    if (this.isRunning) {
      console.warn('⚠️ ProactiveEngine כבר רץ');
      return;
    }

    console.log('🚀 ProactiveEngine מתחיל...');
    this.isRunning = true;

    // בדיקה ראשונית
    this.checkRules();

    // בדוק כל 5 דקות
    this.checkInterval = setInterval(() => {
      this.checkRules();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 ProactiveEngine נעצר');
  }

  getNotifications(count: number = 10): ProactiveNotification[] {
    return this.notifications.slice(0, count);
  }

  clearNotifications() {
    this.notifications = [];
  }

  toggleRule(ruleId: string, enabled: boolean) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`${enabled ? '✅' : '⏸️'} Rule ${rule.name} ${enabled ? 'הופעל' : 'הושבת'}`);
    }
  }

  getRules(): ProactiveRule[] {
    return this.rules;
  }

  getStats() {
    return {
      totalRules: this.rules.length,
      enabledRules: this.rules.filter(r => r.enabled).length,
      totalNotifications: this.notifications.length,
      criticalNotifications: this.notifications.filter(n => n.type === 'critical').length,
      isRunning: this.isRunning
    };
  }
}

export const proactiveEngine = new ProactiveEngine();