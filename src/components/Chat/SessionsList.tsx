import { Clock, Trash2, MessageSquare, Mic } from 'lucide-react';
import { useConversation } from '../../contexts/ConversationContext';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface SessionsListProps {
  onSelectSession: (sessionId: string) => void;
  onClose: () => void;
}

const SessionsList = ({ onSelectSession, onClose }: SessionsListProps) => {
  const { sessions, currentSession, deleteSession, createNewSession } = useConversation();

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: he });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">שיחות שמורות</h2>
          <button
            onClick={createNewSession}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg transition-all"
          >
            + שיחה חדשה
          </button>
        </div>

        {/* Sessions List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין שיחות שמורות</p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  currentSession?.id === session.id
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate mb-1">
                      {session.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{session.messages.length}</span>
                      </div>
                      
                      {session.metadata?.voiceInteractions && session.metadata.voiceInteractions > 0 && (
                        <div className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          <span>{session.metadata.voiceInteractions}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                      </div>
                    </div>
                    
                    {session.messages.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2 truncate">
                        {session.messages[session.messages.length - 1].content}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('למחוק את השיחה?')) {
                        deleteSession(session.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="מחק שיחה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionsList;