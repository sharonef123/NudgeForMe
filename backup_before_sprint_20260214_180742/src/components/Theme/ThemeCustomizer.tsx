const ThemeCustomizer = ({ onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" dir="rtl">
      <div className="glass-panel rounded-3xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">🎨 ערכות נושא</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="h-20 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          <div className="h-20 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div className="h-20 rounded-xl bg-gradient-to-r from-orange-500 to-red-500"></div>
        </div>
        <button onClick={onClose} className="w-full px-6 py-3 rounded-xl bg-purple-500 text-white">
          סגור
        </button>
      </div>
    </div>
  );
};
export default ThemeCustomizer;