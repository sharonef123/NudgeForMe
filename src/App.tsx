import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, MicOff, X, CheckCircle2, Clock, Trash2, Zap, 
  Calendar as CalendarIcon, Home, MessageSquare, Sparkles,
  Edit2, Plus, Brain, Search, User, Sun, Moon, Menu,
  Mail, HardDrive, FileText, Image as ImageIcon, BookOpen,
  Chrome, Headphones, Check, ListTodo, ArrowLeft, Loader2, Copy
} from "lucide-react";
import { ConversationProvider, useConversation } from "./contexts/ConversationContext";
import { geminiService } from "./services/geminiService";
import { useProactiveAgent } from "./hooks/useProactiveAgent";
import { NudgeMessage } from "./services/proactiveService";
import NudgeNotification from "./components/Notifications/NudgeNotification";
import "./index.css";

type TabId = "home" | "tasks" | "calendar" | "google_hub" | "dna";

interface Task {
  id: string;
  title: string;
  tier: number;
  deadline?: string;
  completed: boolean;
}

interface MemoryFact {
  id: string;
  fact: string;
  category: string;
  timestamp: number;
}

// ─── NavButton ────────────────────────────────────────────────
const NavButton = ({ active, onClick, icon, label, isDarkMode }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isDarkMode: boolean;
}) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all px-3 py-1.5 rounded-2xl ${active ? "text-indigo-500" : "text-slate-500"}`}>
    <div className={`p-2 rounded-xl transition-all ${active ? (isDarkMode ? "bg-indigo-500/10 shadow-[0_0_15px_rgba(79,70,229,0.2)] scale-110" : "bg-indigo-50 scale-110 shadow-sm") : ""}`}>
      {icon}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// ─── AppInner ─────────────────────────────────────────────────
function AppInner({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (v: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { currentNudge, triggerManualNudge, dismissNudge } = useProactiveAgent();
  const { sessions, activeSession, addMessage, createSession, setActiveSession } = useConversation();

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "פגישת עבודה - Point AI", tier: 2, deadline: new Date().toISOString().split("T")[0] + "T14:00", completed: false },
    { id: "2", title: "איסוף רותם מהגן", tier: 3, deadline: new Date().toISOString().split("T")[0] + "T16:00", completed: false },
    { id: "3", title: "סקירת פרויקט Nudge", tier: 1, completed: false },
    { id: "4", title: "קניית מתנה לחג", tier: 0, completed: false },
  ]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  // DNA
  const [dnaMemories, setDnaMemories] = useState<MemoryFact[]>([
    { id: "m1", fact: "לשרון ולנועם יש אלרגיה לדגים - אסור להזמין דגים בשום אופן.", category: "משפחה", timestamp: Date.now() },
    { id: "m2", fact: "מעדיף פגישות בוקר בין 9:00 ל-11:00.", category: "העדפות", timestamp: Date.now() },
    { id: "m3", fact: "פרויקט Nudge Me OS הוא בעדיפות עליונה החודש.", category: "עבודה", timestamp: Date.now() },
    { id: "m4", fact: "נכות 96% קבועה — מקסימום 75% משרה!", category: "עבודה", timestamp: Date.now() },
  ]);
  const dnaCategories = ["משפחה", "עבודה", "העדפות", "כללי"];

  // Calendar events
  const events = [
    { id: "e1", title: "טיפול שיניים", time: "09:00", color: "bg-rose-500" },
    { id: "e2", title: "צהריים עם נועם", time: "13:00", color: "bg-indigo-400" },
    { id: "e3", title: "Zoom - צוות פיתוח", time: "15:30", color: "bg-amber-400" },
  ];

  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (pendingSuggestion) {
      handleSend(pendingSuggestion);
      setPendingSuggestion(null);
    }
  }, [pendingSuggestion]);

  const handleNudgeAccept = useCallback((nudge: NudgeMessage) => {
    dismissNudge();
    setActiveTab("home");
    setPendingSuggestion(nudge.prompt);
  }, [dismissNudge]);

  const handleSend = async (text?: string) => {
    const msg = text || inputText.trim();
    if (!msg || isLoading) return;
    setInputText("");
    addMessage({ role: "user", content: msg });
    setIsLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await geminiService.chat(msg, history);
      addMessage({ role: "assistant", content: res });
    } catch (e: any) {
      addMessage({ role: "assistant", content: "שגיאה: " + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "he-IL"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => handleSend(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec; rec.start(); setIsListening(true);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 3: return "bg-rose-500";
      case 2: return "bg-orange-500";
      case 1: return "bg-indigo-500";
      default: return "bg-slate-400";
    }
  };

  const nowStr = new Date().toTimeString().split(" ")[0].slice(0, 5);
  const agendaItems = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = tasks.filter(t => !t.completed && (!t.deadline || t.deadline.startsWith(today))).map(t => ({
      id: t.id, title: t.title, time: t.deadline?.split("T")[1]?.slice(0,5) || "כל היום", type: "task", tier: t.tier
    }));
    const todayEvents = events.map(e => ({ id: e.id, title: e.title, time: e.time, type: "event", color: e.color }));
    const all = [...todayTasks, ...todayEvents].sort((a, b) => a.time === "כל היום" ? -1 : a.time.localeCompare(b.time));
    let foundNext = false;
    return all.map(item => {
      const isNext = !foundNext && item.time !== "כל היום" && item.time >= nowStr;
      if (isNext) foundNext = true;
      return { ...item, isUpcoming: isNext };
    });
  }, [tasks]);

  const googleTools = [
    { id: "calendar", label: "Calendar", icon: <CalendarIcon className="w-6 h-6" />, color: "bg-rose-500", desc: "קבע פגישה חדשה ביומן" },
    { id: "gmail", label: "Gmail", icon: <Mail className="w-6 h-6" />, color: "bg-blue-500", desc: "נסח מייל חדש" },
    { id: "docs", label: "Docs", icon: <FileText className="w-6 h-6" />, color: "bg-amber-500", desc: "צור מסמך חדש" },
    { id: "drive", label: "Drive", icon: <HardDrive className="w-6 h-6" />, color: "bg-emerald-500", desc: "חפש קבצים בדרייב" },
    { id: "photos", label: "Photos", icon: <ImageIcon className="w-6 h-6" />, color: "bg-cyan-500", desc: "חפש תמונות מהטיול האחרון" },
    { id: "notebook", label: "NotebookLM", icon: <BookOpen className="w-6 h-6" />, color: "bg-indigo-500", desc: "נתח את המחברת שלי" },
  ];

  const glass = isDarkMode ? "bg-white/[0.03] backdrop-blur-xl border-white/5" : "bg-white/80 backdrop-blur-xl border-slate-200";

  return (
    <div className={`flex flex-col font-heebo transition-colors duration-500 overflow-hidden ${isDarkMode ? "bg-[#050507] text-white" : "bg-[#f8f9fa] text-slate-900"}`}
      style={{ height: "100dvh" }} dir="rtl">

      {/* Nudge notification */}
      <NudgeNotification nudge={currentNudge} onAccept={handleNudgeAccept} onDismiss={dismissNudge} />

      {/* Mesh bg */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,10%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,10%,1) 0, transparent 50%)" }} />
      )}

      {/* Header */}
      <header className={`relative z-40 flex-shrink-0 px-4 py-3 flex justify-between items-center border-b ${isDarkMode ? "bg-[#050507]/80 border-white/5 backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl"}`}>
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-9 h-9 rounded-full overflow-hidden border shrink-0 ${isDarkMode ? "border-indigo-500/20" : "border-indigo-200"}`}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sharon&backgroundColor=b6e3f4" className="w-full h-full" />
          </div>
          <div className="text-right">
            <h2 className="text-xs font-black">שלום, שרון</h2>
            <p className={`text-[8px] font-bold uppercase tracking-widest ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>DNA SYNC: 100%</p>
          </div>
          <div className={`relative flex items-center rounded-xl px-3 py-1.5 border flex-1 mx-2 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
            <Search className="w-3.5 h-3.5 text-slate-500 ml-2" />
            <input type="text" placeholder="Search..." value={headerSearchQuery} onChange={e => setHeaderSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-full" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {activeTab !== "home" && (
            <button onClick={() => setActiveTab("home")} className={`p-2 rounded-xl transition-all ${isDarkMode ? "text-slate-400 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition-all ${isDarkMode ? "text-amber-400 hover:bg-white/10" : "text-indigo-600 hover:bg-slate-100"}`}>
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsHistoryOpen(true)} className={`p-2 rounded-xl transition-all ${isDarkMode ? "text-slate-400 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"}`}>
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto relative" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* HOME */}
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col px-4 pt-4 pb-32 space-y-4">

              {/* Chat box */}
              <div className={`rounded-[2rem] border flex flex-col overflow-hidden ${glass}`} style={{ height: "380px" }}>
                <div className={`px-4 py-2.5 border-b flex items-center justify-between ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Nudge Chat</span>
                  </div>
                  {isLoading && <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />}
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                      <MessageSquare className="w-8 h-8 mb-2" />
                      <p className="text-xs italic">מה הלו״ז שרון? דבר איתי תכלס.</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : isDarkMode ? "bg-white/5 border border-white/10 rounded-tl-none" : "bg-slate-100 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-end">
                      <div className={`px-4 py-2.5 rounded-2xl rounded-tl-none text-xs ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-slate-100"}`}>
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? "border-white/5" : "border-slate-100"}`}>
                  <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="כתוב משהו..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-500" />
                  <button onClick={toggleVoice} className={`p-2 rounded-xl transition-all ${isListening ? "text-red-400 animate-pulse" : "text-slate-500 hover:text-white"}`}>
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleSend()} disabled={!inputText.trim() || isLoading}
                    className={`p-2 rounded-xl transition-all ${inputText.trim() ? "bg-indigo-600 text-white shadow-lg" : "text-slate-600"}`}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Agenda */}
              <div className={`rounded-[2rem] p-5 border ${glass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black">אג׳נדה להיום</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {new Date().toLocaleDateString("he-IL", { day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="space-y-3 relative">
                  <div className={`absolute right-[6px] top-2 bottom-2 w-0.5 ${isDarkMode ? "bg-white/5" : "bg-slate-100"}`} />
                  {agendaItems.map(item => (
                    <div key={item.id} className="relative flex items-center gap-4 pr-5">
                      <div className={`absolute right-0 w-3 h-3 rounded-full border-2 z-10 ${
                        item.type === "task" ? `${getTierColor((item as any).tier)} border-white/20` : `${(item as any).color} border-white/20`
                      } ${item.isUpcoming ? "ring-4 ring-indigo-500/20" : ""}`} />
                      <span className={`text-[10px] font-bold min-w-[38px] ${item.isUpcoming ? "text-indigo-400" : "text-slate-500"}`}>{item.time}</span>
                      <div className={`flex-1 p-3 rounded-xl border transition-all ${
                        item.isUpcoming
                          ? (isDarkMode ? "bg-indigo-600/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-200")
                          : (isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")
                      }`}>
                        <p className={`text-xs font-bold ${item.isUpcoming ? "text-indigo-400" : ""}`}>{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proactive nudge card */}
              <div className={`rounded-[2rem] p-5 border relative overflow-hidden ${isDarkMode ? "bg-indigo-500/[0.04] border-indigo-500/10" : "bg-indigo-50 border-indigo-100"}`}>
                <div className="absolute top-0 left-0 p-5 opacity-5"><Zap className="w-20 h-20 text-indigo-400" /></div>
                <div className="flex items-center gap-2 mb-3 text-indigo-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Nudge Proactive</span>
                </div>
                <p className={`text-xs leading-relaxed font-bold mb-4 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                  לחץ ⚡ כדי לקבל סקירה מיידית של מה שיש לך עכשיו.
                </p>
                <div className="flex gap-2">
                  <button onClick={triggerManualNudge} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> מה יש לי עכשיו?
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* GOOGLE HUB */}
          {activeTab === "google_hub" && (
            <motion.div key="google_hub" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-4 py-4 pb-32 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-3xl font-black">Google Hub</h3>
                  <p className="text-slate-500 text-xs">ניהול מלא תכלס במערכות גוגל</p>
                </div>
                <Chrome className={`w-10 h-10 opacity-20 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {googleTools.map(tool => (
                  <motion.div key={tool.id} whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveTab("home"); setPendingSuggestion(tool.desc); }}
                    className={`rounded-[2rem] p-5 border flex flex-col gap-3 cursor-pointer ${glass}`}>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${tool.color} text-white shadow-lg`}>{tool.icon}</div>
                      <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">{tool.id}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm">{tool.label}</h4>
                      <p className="text-[10px] text-slate-500">{tool.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TASKS */}
          {activeTab === "tasks" && (
            <motion.div key="tasks" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-4 pb-32 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-3xl font-black">משימות</h3>
                  <p className="text-slate-500 text-xs">{tasks.filter(t => !t.completed).length} בטיפול תכלס</p>
                </div>
                <button onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                  className="w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform">
                  <Plus className={`w-5 h-5 transition-transform ${isQuickAddOpen ? "rotate-45" : ""}`} />
                </button>
              </div>
              {isQuickAddOpen && (
                <div className={`rounded-2xl p-3 border flex gap-2 ${glass}`}>
                  <input autoFocus value={quickTaskTitle} onChange={e => setQuickTaskTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (() => {
                      if (quickTaskTitle.trim()) { setTasks(p => [{ id: Date.now().toString(), title: quickTaskTitle, tier: 0, completed: false }, ...p]); }
                      setQuickTaskTitle(""); setIsQuickAddOpen(false);
                    })()}
                    placeholder="משימה חדשה..." className="flex-1 bg-transparent border-none outline-none text-sm" />
                  <button onClick={() => { if (quickTaskTitle.trim()) { setTasks(p => [{ id: Date.now().toString(), title: quickTaskTitle, tier: 0, completed: false }, ...p]); } setQuickTaskTitle(""); setIsQuickAddOpen(false); }}
                    className="p-2 bg-indigo-600 rounded-xl text-white"><Check className="w-4 h-4" /></button>
                </div>
              )}
              <div className="space-y-3">
                {tasks.map(task => (
                  <motion.div layout key={task.id} onClick={() => setTasks(p => p.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                    className={`rounded-[1.8rem] flex items-stretch border overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"}`}>
                    <div className={`w-1.5 shrink-0 ${getTierColor(task.tier)}`} />
                    <div className="flex-1 flex items-center gap-4 p-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-indigo-500/30"}`}>
                        {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm font-bold ${task.completed ? "line-through opacity-40" : ""}`}>{task.title}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CALENDAR */}
          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-4 pb-32 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-3xl font-black">יומן</h3>
                  <p className="text-slate-500 text-xs">{new Date().toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className={`rounded-[2rem] p-5 border ${glass}`}>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["א","ב","ג","ד","ה","ו","ש"].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-600">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      i + 1 === new Date().getDate() ? "bg-indigo-600 text-white shadow-lg" : isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-600"
                    }`}>{i + 1}</div>
                  ))}
                </div>
              </div>
              <div className={`rounded-[2rem] p-5 border space-y-3 ${glass}`}>
                <h4 className="text-sm font-black">אירועי היום</h4>
                {events.map(ev => (
                  <div key={ev.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
                    <div className={`w-2 h-2 rounded-full ${ev.color}`} />
                    <span className="text-xs font-bold">{ev.title}</span>
                    <span className="text-xs text-slate-500 mr-auto">{ev.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DNA */}
          {activeTab === "dna" && (
            <motion.div key="dna" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-4 py-4 pb-32 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-3xl font-black">DNA Memory</h3>
                  <p className="text-slate-500 text-xs">סנכרון קוגניטיבי פעיל</p>
                </div>
                <Brain className={`w-10 h-10 opacity-20 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              </div>
              {dnaCategories.map(cat => {
                const items = dnaMemories.filter(m => m.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h4 className={`px-1 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>{cat}</h4>
                    {items.map(mem => (
                      <div key={mem.id} className={`p-4 rounded-[1.8rem] border ${glass}`}>
                        <p className="text-xs font-medium leading-relaxed">{mem.fact}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-50 transition-colors ${isDarkMode ? "bg-[#050507]/80 border-white/5 backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl"}`}>
        <div className="flex justify-around items-center py-2 px-2 pb-safe">
          <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={<Home className="w-5 h-5" />} label="בית" isDarkMode={isDarkMode} />
          <NavButton active={isLiveVoiceMode} onClick={() => setIsLiveVoiceMode(true)} icon={<Headphones className="w-5 h-5" />} label="שיחה" isDarkMode={isDarkMode} />
          <NavButton active={activeTab === "tasks"} onClick={() => setActiveTab("tasks")} icon={<Zap className="w-5 h-5" />} label="משימות" isDarkMode={isDarkMode} />
          <NavButton active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} icon={<CalendarIcon className="w-5 h-5" />} label="יומן" isDarkMode={isDarkMode} />
          <NavButton active={activeTab === "google_hub"} onClick={() => setActiveTab("google_hub")} icon={<Chrome className="w-5 h-5" />} label="Google" isDarkMode={isDarkMode} />
          <NavButton active={activeTab === "dna"} onClick={() => setActiveTab("dna")} icon={<User className="w-5 h-5" />} label="DNA" isDarkMode={isDarkMode} />
        </div>
      </nav>

      {/* History drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed right-0 top-0 bottom-0 w-4/5 z-[101] shadow-2xl border-l flex flex-col p-5 space-y-4 ${isDarkMode ? "bg-[#0a0a0c] border-white/10" : "bg-white border-slate-200"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">היסטוריה</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <button onClick={() => { createSession(); setIsHistoryOpen(false); }}
                className="flex items-center justify-between bg-indigo-600 p-4 rounded-2xl text-white font-black shadow-lg active:scale-95 transition-all">
                <span>שיחה חדשה</span><Edit2 className="w-4 h-4" />
              </button>
              <div className="flex-1 overflow-y-auto space-y-2">
                {sessions.map(s => (
                  <button key={s.id} onClick={() => { setActiveSession(s.id); setIsHistoryOpen(false); }}
                    className={`w-full p-4 rounded-2xl text-right flex items-center justify-between border transition-all ${
                      s.id === activeSession?.id ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400" : isDarkMode ? "bg-white/3 border-transparent text-slate-400" : "bg-slate-50 border-transparent text-slate-600"
                    }`}>
                    <span className="truncate text-xs font-bold">{s.title}</span>
                    <MessageSquare className="w-3.5 h-3.5 opacity-30" />
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Voice overlay */}
      <AnimatePresence>
        {isLiveVoiceMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl p-10">
            <button onClick={() => setIsLiveVoiceMode(false)} className="absolute top-10 left-10 p-4 bg-white/5 rounded-full text-white"><X className="w-6 h-6" /></button>
            <div className="relative">
              <div className="w-56 h-56 rounded-full bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 animate-pulse">
                <Mic className="w-20 h-20 text-indigo-400" />
              </div>
              <div className="absolute -inset-6 rounded-full border border-indigo-500/10 animate-ping opacity-20" />
            </div>
            <div className="mt-12 text-center space-y-2">
              <h2 className="text-4xl font-black text-white">Synapse Live</h2>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">מאזין לך - תגיד מה שבא לך תכלס</p>
            </div>
            <button onClick={() => setIsLiveVoiceMode(false)} className="mt-16 w-full py-5 rounded-[2.5rem] bg-rose-600 text-white font-black text-xl shadow-xl active:scale-95 transition-all">סיים שיחה</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────
function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("nudge-dark-mode") !== "false");
  useEffect(() => {
    localStorage.setItem("nudge-dark-mode", String(isDarkMode));
    document.body.style.background = isDarkMode ? "#050507" : "#f8f9fa";
  }, [isDarkMode]);
  return (
    <ConversationProvider>
      <AppInner isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConversationProvider>
  );
}

export default App;