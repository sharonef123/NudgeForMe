import { useState } from 'react';
import { Brain, Check, X, Tag } from 'lucide-react';
import { saveMemory } from '../services/memoryService';

export default function DNAButton({ message, messageId }) {
  const [saved, setSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');

  const categories = [
    { id: 'health', label: 'בריאות', icon: '❤️', color: 'bg-rose-500' },
    { id: 'work', label: 'עבודה', icon: '💼', color: 'bg-blue-500' },
    { id: 'family', label: 'משפחה', icon: '👨‍👩‍👧‍👦', color: 'bg-purple-500' },
    { id: 'preferences', label: 'העדפות', icon: '⭐', color: 'bg-yellow-500' },
    { id: 'events', label: 'אירועים', icon: '📅', color: 'bg-indigo-500' },
    { id: 'general', label: 'כללי', icon: '📝', color: 'bg-slate-500' }
  ];

  const quickTags = ['חשוב', 'דחוף', 'מעקב', 'תזכורת', 'רעיון'];

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    try {
      await saveMemory({
        user_id: 'sharon_efroni',
        content: message,
        category,
        tags
      });
      
      setSaved(true);
      setShowModal(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save memory:', error);
      alert('שגיאה בשמירה');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 rounded-lg transition-all shrink-0 ${
          saved 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
        }`}
        title="שמור ל-DNA"
      >
        {saved ? <Check className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                שמור לזיכרון DNA
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
              {message}
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">קטגוריה</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      category === cat.id 
                        ? `${cat.color} text-white` 
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="ml-1">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">תגיות</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {quickTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      tags.includes(tag)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="תגית מותאמת..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Tag className="w-4 h-4 text-purple-400" />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.filter(t => !quickTags.includes(t)).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs flex items-center gap-1">
                      {tag}
                      <button onClick={() => toggleTag(tag)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              💾 שמור לזיכרון
            </button>
          </div>
        </div>
      )}
    </>
  );
}