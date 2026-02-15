import { useConversation } from "../../contexts/ConversationContext";
import { MessageSquare, Plus, Trash2, Clock } from "lucide-react";

interface SessionsListProps {
  isDarkMode?: boolean;
}

const SessionsList = ({ isDarkMode = true }: SessionsListProps) => {
  const { sessions, activeSessionId, createSession, deleteSession, setActiveSession } = useConversation();

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "עכשיו";
    if (mins < 60) return `לפני ${mins} דק'`;
    if (hours < 24) return `לפני ${hours} שע'`;
    return `לפני ${days} ימים`;
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className={`flex items-center justify-between p-4 border-b ${
        isDarkMode ? "border-white/10" : "border-slate-200"
      }`}>
        <h3 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>שיחות</h3>
        <button
          onClick={createSession}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all"
        >
          <Plus className="w-3 h-3" />
          חדשה
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">אין שיחות עדיין</p>
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveSession(s.id)}
              onKeyDown={(e) => e.key === "Enter" && setActiveSession(s.id)}
              className={`w-full text-right p-3 rounded-xl border transition-all group cursor-pointer ${
                s.id === activeSessionId
                  ? isDarkMode
                    ? "bg-emerald-500/20 border-emerald-500/30"
                    : "bg-emerald-50 border-emerald-200"
                  : isDarkMode
                  ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {s.title}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}>
                    {s.messages.length} הודעות
                  </p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    isDarkMode ? "text-slate-600" : "text-slate-400"
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatTime(s.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
                  aria-label="מחק שיחה"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionsList;