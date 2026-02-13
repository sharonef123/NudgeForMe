import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { getAccessToken } from './GoogleAuth';

export default function CalendarWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&orderBy=startTime&singleEvents=true`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setEvents(data.items || []);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          האירועים הקרובים
        </h3>
        <button onClick={fetchEvents} className="text-xs text-indigo-500 hover:underline">
          רענן
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">טוען...</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500 italic">אין אירועים קרובים</p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map(event => (
            <div key={event.id} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm font-bold">{event.summary}</p>
              {event.start?.dateTime && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(event.start.dateTime).toLocaleString('he-IL')}
                </p>
              )}
              {event.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}