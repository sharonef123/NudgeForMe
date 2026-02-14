import { useEffect, useState } from 'react';
import { Send, Loader2, Brain } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { memoryService } from './services/memoryService';
import VoiceInput from './components/VoiceInput';

function App() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memCount, setMemCount] = useState(0);

  useEffect(() => {
    setMemCount(memoryService.getMemoryCount());
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);

    const res = await geminiService.chat(msg);
    setMessages(p => [...p, { role: 'assistant', content: res }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Nudge Me OS</h1>
          <p className="text-xl text-gray-300">העוזר של שרון</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white">{memCount} זיכרונות</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 h-[70vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4" dir="rtl">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-4xl mb-4">👋</p>
                  <p className="text-lg text-white">היי שרון! אני נאדג׳</p>
                  <p className="text-sm text-gray-400 mt-2">דברי או כתבי - אני זוכר הכל!</p>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      m.role === 'user'
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}
                  >
                    <p className="text-white">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && send()}
                placeholder="הקלידי או דברי..."
                dir="rtl"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white"
              />

              <VoiceInput onTranscript={send} disabled={loading} />

              <button
                onClick={() => send()}
                disabled={loading || !input}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
