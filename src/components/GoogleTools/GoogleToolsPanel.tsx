import { useState, useEffect } from "react";
import { X, Calendar, Mail, LogOut } from "lucide-react";
import CalendarWidget from "./CalendarWidget";
import GmailWidget from "./GmailWidget";
import { initGoogleAuth, signOutGoogle, isSignedIn } from "./GoogleAuth";

interface GoogleToolsPanelProps {
  isDarkMode?: boolean;
  onClose: () => void;
}

const GoogleToolsPanel = ({ isDarkMode = true, onClose }: GoogleToolsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "gmail">("calendar");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    initGoogleAuth().then(() => {
      setConnected(isSignedIn());
    });
  }, []);

  const handleSignOut = () => {
    signOutGoogle();
    setConnected(false);
  };

  const bg = isDarkMode
    ? "bg-slate-900/95 border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-80 rounded-2xl border shadow-2xl overflow-hidden ${bg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
          <h3 className="font-bold text-sm">כלי Google</h3>
          <div className="flex items-center gap-2">
            {connected && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                התנתק
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
              activeTab === "calendar"
                ? "text-blue-400 border-b-2 border-blue-400"
                : isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            לוח שנה
          </button>
          <button
            onClick={() => setActiveTab("gmail")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
              activeTab === "gmail"
                ? "text-red-400 border-b-2 border-red-400"
                : isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Gmail
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === "calendar" && <CalendarWidget isDarkMode={isDarkMode} />}
          {activeTab === "gmail" && <GmailWidget isDarkMode={isDarkMode} />}
        </div>
      </div>
    </div>
  );
};

export default GoogleToolsPanel;