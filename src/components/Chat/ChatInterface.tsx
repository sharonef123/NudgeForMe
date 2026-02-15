import { useState, useRef, useEffect } from "react";
import { geminiService } from "../../services/geminiService";
import { useConversation } from "../../contexts/ConversationContext";
import { Send, Loader2, Mic, MicOff, Trash2, Copy, Check } from "lucide-react";

interface ChatInterfaceProps {
  isDarkMode?: boolean;
  pendingSuggestion?: string | null;
  onSuggestionUsed?: () => void;
}

const ChatInterface = ({ isDarkMode = true, pendingSuggestion, onSuggestionUsed }: ChatInterfaceProps) => {
  const { activeSession, addMessage, clearMessages } = useConversation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (pendingSuggestion) {
      send(pendingSuggestion);
      onSuggestionUsed?.();
    }
  }, [pendingSuggestion]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    addMessage({ role: "user", content: msg });
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await geminiService.chat(msg, history);
      addMessage({ role: "assistant", content: res });
    } catch (e: any) {
      addMessage({ role: "assistant", content: "שגיאה: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("הדפדפן לא תומך בזיהוי קול");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "he-IL";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => send(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const copyMsg = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickSuggestions = [
    "מה הסטטוס שלי מול ביטוח לאומי?",
    "בדוק היקף עבודה - כמה אני יכול לעבוד?",
    "מה לבשל הערב? (ללא דגים!)",
    "אני בחרדה עכשיו - עזור לי",
  ];

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b flex-shrink-0 ${
        isDarkMode ? "border-white/10" : "border-slate-200"
      }`}>
        <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          {messages.length} הודעות
          {activeSession?.title && messages.length > 0 && (
            <span className="mr-2 opacity-60">· {activeSession.title}</span>
          )}
        </span>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-3 h-3" />
            נקה
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                היי שרון!
              </h2>
              <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                אני Nudge — מערכת ההפעלה האישית שלך. במה אעזור היום?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className={`text-right text-sm p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"} group`}>
              <div className={`relative max-w-[80%] p-4 rounded-2xl border ${
                m.role === "user"
                  ? isDarkMode
                    ? "bg-emerald-500/20 border-emerald-500/30 text-white"
                    : "bg-emerald-50 border-emerald-200 text-slate-800"
                  : isDarkMode
                  ? "bg-indigo-500/20 border-indigo-500/30 text-white"
                  : "bg-indigo-50 border-indigo-200 text-slate-800"
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs text-slate-500">{formatTime(m.timestamp)}</span>
                  <button
                    onClick={() => copyMsg(m.id, m.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-white"
                  >
                    {copiedId === m.id
                      ? <Check className="w-3 h-3 text-emerald-400" />
                      : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-end">
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? "bg-indigo-500/20 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"
            }`}>
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm">Nudge חושב...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t flex-shrink-0 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="כתוב הודעה... (Enter לשליחה, Shift+Enter לשורה חדשה)"
            dir="rtl"
            rows={1}
            className={`flex-1 px-4 py-3 rounded-xl border resize-none outline-none transition-all text-sm ${
              isDarkMode
                ? "bg-white/10 border-white/20 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-white/15"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500 shadow-sm"
            }`}
          />
          <button
            onClick={toggleVoice}
            className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
              isListening
                ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                : isDarkMode
                ? "bg-white/10 border-white/20 text-slate-400 hover:text-white hover:bg-white/15"
                : "bg-white border-slate-300 text-slate-500 hover:text-slate-800 shadow-sm"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-white disabled:opacity-40 transition-all hover:scale-105 disabled:hover:scale-100 flex-shrink-0 shadow-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;