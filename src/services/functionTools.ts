// Function Tools עבור Gemini Function Calling

export interface JobScopeParams {
  hoursPerWeek: number;
  responsibilityLevel: number; // 0-100
  isManagement: boolean;
}

export interface BudgetParams {
  income: number;
  expenses: { category: string; amount: number }[];
  savingsGoal?: number;
}

export interface HealthParams {
  symptom: string;
  severity: number; // 1-10
  duration: string;
}

// ✅ 1. מחשבון היקף משרה (75% rule)
export function validateJobScope(params: JobScopeParams) {
  const { hoursPerWeek, responsibilityLevel, isManagement } = params;
  
  // חישוב scope
  let scope = (hoursPerWeek / 40) * 100;
  
  // תיקון לפי אחריות
  scope += (responsibilityLevel / 100) * 10;
  
  // תיקון לניהול
  if (isManagement) {
    scope += 5;
  }
  
  const maxScope = 75;
  const isValid = scope <= maxScope;
  const remaining = maxScope - scope;
  
  return {
    scope: Math.round(scope),
    isValid,
    remaining: isValid ? Math.round(remaining) : 0,
    warning: !isValid ? '⚠️ חריגה מ-75%! סיכון לקצבה!' : null,
    recommendation: isValid 
      ? `✅ בטוח! נשארו לך ${Math.round(remaining)}% עד הגבול`
      : `❌ צמצם ל-${Math.round(hoursPerWeek * (maxScope / scope))} שעות בשבוע`
  };
}

// ✅ 2. מחשבון תקציב משפחתי
export function calculateBudget(params: BudgetParams) {
  const { income, expenses, savingsGoal = 0 } = params;
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = income - totalExpenses;
  const savingsRate = (remaining / income) * 100;
  
  // קטגוריזציה של הוצאות
  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // המלצות
  const recommendations: string[] = [];
  
  if (remaining < 0) {
    recommendations.push('🚨 אתה במינוס! צריך לצמצם הוצאות');
  } else if (remaining < savingsGoal) {
    const gap = savingsGoal - remaining;
    recommendations.push(`⚠️ חסרים ${gap} ₪ ליעד החיסכון`);
  } else {
    recommendations.push(`✅ מצוין! חוסך ${remaining} ₪ החודש`);
  }
  
  // בדיקת הוצאות יתר
  Object.entries(byCategory).forEach(([category, amount]) => {
    const percentage = (amount / income) * 100;
    if (category === 'מזון' && percentage > 30) {
      recommendations.push(`⚠️ הוצאות מזון גבוהות (${Math.round(percentage)}%)`);
    }
    if (category === 'בילויים' && percentage > 15) {
      recommendations.push(`⚠️ הוצאות בילויים גבוהות (${Math.round(percentage)}%)`);
    }
  });
  
  return {
    income,
    totalExpenses: Math.round(totalExpenses),
    remaining: Math.round(remaining),
    savingsRate: Math.round(savingsRate),
    byCategory,
    recommendations,
    status: remaining >= savingsGoal ? 'good' : remaining > 0 ? 'warning' : 'critical'
  };
}

// ✅ 3. מעקב בריאות ותסמינים
export function analyzeHealthSymptom(params: HealthParams) {
  const { symptom, severity, duration } = params;
  
  const lowerSymptom = symptom.toLowerCase();
  
  // רשימת תסמינים קריטיים
  const criticalSymptoms = [
    'כאב בחזה',
    'קוצר נשימה',
    'שיתוק',
    'דימום',
    'אובדן הכרה'
  ];
  
  const isCritical = criticalSymptoms.some(s => lowerSymptom.includes(s));
  
  // ניתוח רמת דחיפות
  let urgency: 'low' | 'medium' | 'high' | 'critical';
  let action: string;
  
  if (isCritical || severity >= 8) {
    urgency = 'critical';
    action = '🚨 פנה מיידית למיון!';
  } else if (severity >= 6 || duration.includes('שבוע')) {
    urgency = 'high';
    action = '⚠️ קבע תור לרופא היום';
  } else if (severity >= 4) {
    urgency = 'medium';
    action = '📅 קבע תור לרופא בימים הקרובים';
  } else {
    urgency = 'low';
    action = '💊 נסה טיפול ביתי ועקוב';
  }
  
  // הערות נוספות
  const notes: string[] = [];
  
  if (lowerSymptom.includes('כאב')) {
    notes.push('תעד: מיקום, עוצמה, זמן התחלה');
  }
  
  if (duration.includes('חודש') || duration.includes('שבועות')) {
    notes.push('⚠️ תסמין ממושך - חשוב לבדוק');
  }
  
  // בהתחשב במצב הבריאותי של שרון
  notes.push('💡 תזכורת: נכות קיימת 96%, שמור תיעוד לביטוח לאומי');
  
  return {
    symptom,
    severity,
    duration,
    urgency,
    action,
    notes,
    shouldDocument: urgency !== 'low',
    tier: urgency === 'critical' ? 3 : urgency === 'high' ? 2 : 1
  };
}

// ✅ 4. מחשבון זמני תרופות
export function calculateMedicationSchedule(
  medications: { name: string; timesPerDay: number; withFood: boolean }[]
) {
  const schedule: Record<string, { time: string; meds: string[]; withFood: boolean }[]> = {};
  
  const times = {
    1: ['08:00'],
    2: ['08:00', '20:00'],
    3: ['08:00', '14:00', '20:00'],
    4: ['08:00', '12:00', '16:00', '20:00']
  };
  
  medications.forEach(med => {
    const medTimes = times[med.timesPerDay as keyof typeof times] || times[1];
    
    medTimes.forEach(time => {
      if (!schedule[time]) {
        schedule[time] = [];
      }
      
      const existing = schedule[time].find(s => s.withFood === med.withFood);
      if (existing) {
        existing.meds.push(med.name);
      } else {
        schedule[time].push({
          time,
          meds: [med.name],
          withFood: med.withFood
        });
      }
    });
  });
  
  return {
    schedule,
    reminders: Object.keys(schedule).sort(),
    summary: `${medications.length} תרופות, ${Object.keys(schedule).length} זמנים ביום`
  };
}

// הגדרות Function Declaration עבור Gemini API
export const functionDeclarations = [
  {
    name: 'validateJobScope',
    description: 'מחשב את היקף המשרה ובודק שלא חורג מ-75% (חובה לשמירת קצבת נכות)',
    parameters: {
      type: 'object',
      properties: {
        hoursPerWeek: {
          type: 'number',
          description: 'מספר שעות עבודה בשבוע'
        },
        responsibilityLevel: {
          type: 'number',
          description: 'רמת אחריות 0-100'
        },
        isManagement: {
          type: 'boolean',
          description: 'האם תפקיד ניהולי'
        }
      },
      required: ['hoursPerWeek', 'responsibilityLevel']
    }
  },
  {
    name: 'calculateBudget',
    description: 'מחשבון תקציב משפחתי עם המלצות',
    parameters: {
      type: 'object',
      properties: {
        income: {
          type: 'number',
          description: 'הכנסה חודשית'
        },
        expenses: {
          type: 'array',
          description: 'רשימת הוצאות',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              amount: { type: 'number' }
            }
          }
        },
        savingsGoal: {
          type: 'number',
          description: 'יעד חיסכון חודשי (אופציונלי)'
        }
      },
      required: ['income', 'expenses']
    }
  },
  {
    name: 'analyzeHealthSymptom',
    description: 'מנתח תסמין בריאותי וממליץ על פעולה',
    parameters: {
      type: 'object',
      properties: {
        symptom: {
          type: 'string',
          description: 'תיאור התסמין'
        },
        severity: {
          type: 'number',
          description: 'עוצמה 1-10'
        },
        duration: {
          type: 'string',
          description: 'משך זמן (למשל: יומיים, שבוע)'
        }
      },
      required: ['symptom', 'severity', 'duration']
    }
  }
];