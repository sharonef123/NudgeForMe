import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, Trash2, Search, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

const SessionsList = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      title: 'ביטוח לאומי - בירור מצב',
      lastMessage: 'תודה על המידע!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      messageCount: 12,
    },
    {
      id: '2',
      title: 'חישוב שעות עבודה',
      lastMessage: 'אתה יכול לעבוד עוד 18 שעות השבוע',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      messageCount: 8,
    },
    {
      id: '3',
      title: 'צרכי הילדים לבית הספר',
      lastMessage: 'הכנתי רשימה מסודרת',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      messageCount: 15,
    },
  ]);

  const filteredSessions = sessions.filter(session =>
    session.title.includes(searchQuery) || session.lastMessage.includes(searchQuery)
  );

  const groupSessions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      today: filteredSessions.filter(s => s.timestamp >= today),
      yesterday: filteredSessions.filter(s => s.timestamp >= yesterday && s.timestamp < today),
      thisWeek: filteredSessions.filter(s => s.timestamp >= weekAgo && s.timestamp < yesterday),
      older: filteredSessions.filter(s => s.timestamp < weekAgo),
    };
  };

  const grouped = groupSessions();

  const SessionItem = ({ session }: { session: Session }) => (
    <button
      className="w-full group relative overflow-hidden p-4 rounded-xl bg-white/5 border border-white/10 
               hover:bg-white/10 hover:border-white/20 transition-all text-right"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate mb-1">
            {session.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mb-2">
            {session.lastMessage}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>
              {formatDistanceToNow(session.timestamp, { locale: he, addSuffix: true })}
            </span>
            <span>•</span>
            <span>{session.messageCount} הודעות</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            // Delete session
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/20"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </button>
  );

  return (
    <div className="glass-panel rounded-2xl p-4 h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{t('sessions.title')}</h3>
        <button className="p-2 rounded-xl hover:bg-white/10 text-emerald-400 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חפש שיחות..."
          className="w-full pr-10 pl-4 py-2 rounded-xl bg-white/5 border border-white/10 
                   text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {grouped.today.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">{t('sessions.today')}</h4>
            <div className="space-y-2">
              {grouped.today.map(session => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {grouped.yesterday.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">{t('sessions.yesterday')}</h4>
            <div className="space-y-2">
              {grouped.yesterday.map(session => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {grouped.thisWeek.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">{t('sessions.thisWeek')}</h4>
            <div className="space-y-2">
              {grouped.thisWeek.map(session => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {grouped.older.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">{t('sessions.older')}</h4>
            <div className="space-y-2">
              {grouped.older.map(session => (
                <SessionItem key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{t('sessions.noSessions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsList;