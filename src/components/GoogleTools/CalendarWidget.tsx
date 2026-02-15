import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, RefreshCw, LogIn } from "lucide-react";
import { getAccessToken, signInGoogle } from "./GoogleAuth";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
}

interface CalendarWidgetProps {
  isDarkMode?: boolean;
}

const CalendarWidget = ({ isDarkMode = true }: CalendarWidgetProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(!!getAccessToken());
    if (getAccessToken()) fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const weekLater = new Date(Date.now() + 7 * 86400000).toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${weekLater}&orderBy=startTime&singleEvents=true&maxResults=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("שגיאה בטעינת אירועים");
      const data = await res.json();
      setEvents(data.items || []);
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
      fetchEvents();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const formatTime = (event: CalendarEvent) => {
    const dt = event.start.dateTime || event.start.date;
    if (!dt) return "";
    const d = new Date(dt);
    if (event.start.date) return d.toLocaleDateString("he-IL");
    return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (event: CalendarEvent) => {
    const dt = event.start.dateTime || event.start.date;
    if (!dt) return "";
    const d = new Date(dt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "היום";
    if (d.toDateString() === tomorrow.toDateString()) return "מחר";
    return d.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "numeric" });
  };

  const base = isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800";

  if (!isConnected) {
    return (
      <div className={`rounded-xl border p-4 ${base}`} dir="rtl">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold">Google Calendar</span>
        </div>
        <p className={`text-xs mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          חבר את הלוח שנה כדי לראות אירועים
        </p>
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition-all"
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
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold">לוח שנה</span>
        </div>
        <button onClick={fetchEvents} className="text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      {events.length === 0 && !loading ? (
        <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>אין אירועים השבוע</p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className={`p-2 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <p className="text-xs font-medium truncate">{event.summary}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-400">{formatDay(event)}</span>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{formatTime(event)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs truncate max-w-[80px]">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;