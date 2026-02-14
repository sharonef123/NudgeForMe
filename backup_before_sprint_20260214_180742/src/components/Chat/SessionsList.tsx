import { MessageSquare } from 'lucide-react';
const SessionsList = () => {
  return (
    <div className="glass-panel rounded-2xl p-4" dir="rtl">
      <h3 className="text-lg font-bold text-white mb-4">שיחות קודמות</h3>
      <div className="space-y-2">
        <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
          <MessageSquare className="w-4 h-4 text-emerald-400 inline ml-2" />
          <span className="text-white text-sm">שיחה 1</span>
        </div>
      </div>
    </div>
  );
};
export default SessionsList;