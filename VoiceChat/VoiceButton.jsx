import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

export default function VoiceButton({ onTranscript, onSpeaking }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInterimTranscript('');
          onTranscript(final);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    } else {
      setError('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (onSpeaking) {
      onSpeaking(setIsSpeaking);
    }
  }, [onSpeaking]);

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        disabled={isSpeaking}
        className={`p-4 rounded-full transition-all duration-300 relative ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
            : isSpeaking
            ? 'bg-purple-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:shadow-lg hover:shadow-emerald-500/50'
        }`}
        title={isListening ? 'מקליט...' : isSpeaking ? 'מדבר...' : 'לחץ לדבר'}
      >
        {isSpeaking ? (
          <Volume2 className="w-6 h-6 text-white animate-bounce" />
        ) : isListening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-white" />
        )}
        
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Live Transcription Tooltip */}
      {interimTranscript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          {interimTranscript}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded text-xs whitespace-nowrap shadow-xl">
          {error === 'not-allowed' ? 'נדרשת הרשאת מיקרופון' : 'שגיאה בזיהוי קול'}
        </div>
      )}
    </div>
  );
}