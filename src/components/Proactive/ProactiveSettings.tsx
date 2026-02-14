import { useState, useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, Activity } from 'lucide-react';
import { proactiveEngine, ProactiveRule } from '../../services/proactiveEngine';

const ProactiveSettings = () => {
  const [rules, setRules] = useState<ProactiveRule[]>([]);
  const [stats, setStats] = useState(proactiveEngine.getStats());

  useEffect(() => {
    loadRules();
    
    // רענן כל דקה
    const interval = setInterval(() => {
      setStats(proactiveEngine.getStats());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRules = () => {
    setRules(proactiveEngine.getRules());
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    proactiveEngine.toggleRule(ruleId, enabled);
    loadRules();
    setStats(proactiveEngine.getStats());
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return { label: 'גבוהה', color: 'text-red-400' };
      case 2: return { label: 'בינונית', color: 'text-yellow-400' };
      default: return { label: 'נמוכה', color: 'text-blue-400' };
    }
  };

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50" style={{ direction: 'rtl' }}>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">הגדרות פרואקטיביות</h2>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="text-sm text-gray-400 mb-1">חוקים פעילים</div>
          <div className="text-2xl font-bold text-white">
            {stats.enabledRules}/{stats.totalRules}
          </div>
        </div>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="text-sm text-gray-400 mb-1">התראות</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalNotifications}
          </div>
        </div>
      </div>

      {/* סטטוס מנוע */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-slate-800 rounded-lg">
        <Activity className={`w-5 h-5 ${stats.isRunning ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
        <span className="text-sm text-gray-300">
          {stats.isRunning ? '🟢 המנוע רץ' : '🔴 המנוע מושבת'}
        </span>
      </div>

      {/* רשימת חוקים */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 mb-3">חוקים פרואקטיביים</h3>
        
        {rules.map(rule => {
          const priority = getPriorityLabel(rule.priority);
          
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                rule.enabled
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white">{rule.name}</h4>
                    <span className={`text-xs font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{rule.description}</p>
                  
                  {rule.lastTriggered && (
                    <div className="text-xs text-gray-500">
                      הופעל לאחרונה: {new Date(rule.lastTriggered).toLocaleString('he-IL')}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* הערה */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-gray-300">
          💡 <strong>טיפ:</strong> המנוע בודק את החוקים כל 5 דקות. כל חוק יכול להיות מופעל רק פעם אחת בתקופת ה-cooldown שלו.
        </p>
      </div>
    </div>
  );
};

export default ProactiveSettings;