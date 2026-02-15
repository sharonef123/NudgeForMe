import { useState, useEffect } from "react";
import { Mail, RefreshCw, LogIn, Star } from "lucide-react";
import { getAccessToken, signInGoogle } from "./GoogleAuth";

interface GmailMessage {
  id: string;
  snippet: string;
  payload?: {
    headers: { name: string; value: string }[];
  };
}

interface GmailWidgetProps {
  isDarkMode?: boolean;
}

const GmailWidget = ({ isDarkMode = true }: GmailWidgetProps) => {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!getAccessToken());
    if (getAccessToken()) fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const listRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX&labelIds=UNREAD",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!listRes.ok) throw new Error("שגיאה בטעינת מיילים");
      const listData = await listRes.json();
      const messages = listData.messages || [];

      const details = await Promise.all(
        messages.slice(0, 5).map((m: any) =>
          fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then((r) => r.json())
        )
      );
      setEmails(details);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await signInGoogle();
      setIsConnected(true);
      fetchEmails();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const getHeader = (email: GmailMessage, name: string) => {
    return email.payload?.headers?.find((h) => h.name === name)?.value || "";
  };

  const base = isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800";

  if (!isConnected) {
    return (
      <div className={`rounded-xl border p-4 ${base}`} dir="rtl">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold">Gmail</span>
        </div>
        <p className={`text-xs mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          חבר את Gmail כדי לראות מיילים חשובים
        </p>
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all"
        >
          <LogIn className="w-3 h-3" />
          התחבר עם Google
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${base}`} dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold">Gmail</span>
          {emails.length > 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
              {emails.length}
            </span>
          )}
        </div>
        <button onClick={fetchEmails} className="text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {emails.length === 0 && !loading ? (
        <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>אין מיילים חדשים</p>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div key={email.id} className={`p-2 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="flex items-start gap-1">
                <Star className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{getHeader(email, "Subject") || "ללא נושא"}</p>
                  <p className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {getHeader(email, "From").split("<")[0].trim()}
                  </p>
                  <p className={`text-xs mt-0.5 line-clamp-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    {email.snippet}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GmailWidget;