const VoiceConversationMode = ({ onClose, onMessage }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" dir="rtl">
      <div className="glass-panel rounded-3xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">🎤 מצב קולי</h2>
        <p className="text-gray-400 mb-6">לחץ על המיקרופון להתחלה</p>
        <button onClick={onClose} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
          סגור
        </button>
      </div>
    </div>
  );
};
export default VoiceConversationMode;