import { useState, useEffect } from 'react';
import { Mail, Star } from 'lucide-react';
import { getAccessToken } from './GoogleAuth';

export default function GmailWidget() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setEmails(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Mail className="w-4 h-4 text-red-500" />
          הודעות אחרונות
        </h3>
        <button onClick={fetchEmails} className="text-xs text-indigo-500 hover:underline">
          רענן
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">טוען...</p>
      ) : emails.length === 0 ? (
        <p className="text-xs text-slate-500 italic">אין הודעות חדשות</p>
      ) : (
        <div className="space-y-2">
          {emails.map(email => (
            <div key={email.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm font-bold">הודעה חדשה</p>
              <p className="text-xs text-slate-500 mt-1">{email.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}