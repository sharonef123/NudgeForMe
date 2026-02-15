import { useState, useEffect } from "react";
import { X, Calendar, Mail, LogOut, LogIn, User, Loader2 } from "lucide-react";
import CalendarWidget from "./CalendarWidget";
import GmailWidget from "./GmailWidget";
import {
  initGoogleAuth,
  signInGoogle,
  signOutGoogle,
  isSignedIn,
  fetchGoogleUser,
  GoogleUser,
} from "./GoogleAuth";

interface GoogleToolsPanelProps {
  isDarkMode?: boolean;
  onClose: () => void;
}

const GoogleToolsPanel = ({ isDarkMode = true, onClose }: GoogleToolsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "gmail">("calendar");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const signedIn = isSignedIn();
      setConnected(signedIn);
      if (signedIn) {
        fetchGoogleUser().then(setUser);
      }
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInGoogle();
      setConnected(true);
      const u = await fetchGoogleUser();
      setUser(u);
    } catch (err) {
      setError(typeof err === "string" ? err : "התחברות נכשלה — בדוק Google Cloud Console");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOutGoogle();
    setConnected(false);
    setUser(null);
  };

  const bg = isDarkMode
    ? "bg-slate-900/95 border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-900";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-80 rounded-2xl border shadow-2xl overflow-hidden ${bg}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-white/10" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm">כלי Google</h3>
              {user && (
                <p className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {connected && (
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="התנתק"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Not connected state */}
        {!connected ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <h4 className="font-semibold mb-1">התחבר ל-Google</h4>
            <p className="text-xs text-slate-400 mb-4">גישה ל-Calendar ו-Gmail</p>

            {error && (
              <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-right">
                {error}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                text-white text-sm font-semibold transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "מתחבר..." : "התחבר עם Google"}
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={`flex border-b ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
              {(["calendar", "gmail"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                    activeTab === tab
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : isDarkMode
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab === "calendar" ? <Calendar className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  {tab === "calendar" ? "לוח שנה" : "Gmail"}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {activeTab === "calendar" ? (
                <CalendarWidget isDarkMode={isDarkMode} />
              ) : (
                <GmailWidget isDarkMode={isDarkMode} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleToolsPanel;