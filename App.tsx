import { useEffect, useState } from 'react';
import { Send, Loader2, Brain, Trash2 } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { memoryService } from './services/memoryService';
import VoiceInput from './components/VoiceInput';

function App() {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    setMemoryCount(memoryService.getMemoryCount());
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);
    
    try {
      const response = await geminiService.chat(messageText);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `שגיאה: ${error.message}` 
      }]);
    }
    setIsLoading(false);
  };

  const clearMemory = () => {
    if (confirm('למחוק את כל הזיכרון?')) {
      memoryService.clearAll();
      setMemoryCount(0);
      alert('הזיכרון נמחק!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Nudge Me OS</h1>
          <p className="text-xl text-gray-300">העוזר האישי של שרון</p>
          
          {/* Memory Counter */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white text-sm">{memoryCount} זיכרונות</span>
            </div>
            
            {memoryCount > 0 && (
              <button
                onClick={clearMemory}
                className="px-4 py-2 bg-red-500/20 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                מחק זיכרון
              </button>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 h-[calc(100vh-240px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4" dir="rtl">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-5xl mb-4">👋</div>
                  <p className="text-lg font-semibold mb-2">היי שרון! אני נאדג׳</p>
                  <p className="text-sm">שאלי אותי כל דבר - אני זוכר הכל! 🧠</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}>
                    <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-slate-800/50 p-4 rounded-2xl">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="הקלידי הודעה או דברי..."
                disabled={isLoading}
                dir="rtl"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
              
              <VoiceInput 
                onTranscript={(text) => handleSend(text)}
                disabled={isLoading}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
