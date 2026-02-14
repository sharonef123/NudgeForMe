import { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { Send, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await geminiService.chat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ שגיאה: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 touch-manipulation">
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4" style={{ direction: 'rtl' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-lg">היי! אני נאדג׳, העוזר האישי שלך</p>
              <p className="text-sm mt-2">שאל אותי כל דבר!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                <p className="text-white whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-slate-700/50">
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="הקלד הודעה..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-base bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            style={{ direction: 'rtl' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 sm:px-6 sm:py-3 min-w-[60px] bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:from-emerald-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
