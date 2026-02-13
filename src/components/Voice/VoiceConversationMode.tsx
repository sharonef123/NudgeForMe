import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import VoiceWaveform from './VoiceWaveform';
import VoiceFeedback, { FeedbackStatus } from './VoiceFeedback';

interface VoiceConversationModeProps {
  onClose: () => void;
  onMessage: (text: string) => Promise<string>;
  isDarkMode: boolean;
}

const VoiceConversationMode = ({ onClose, onMessage, isDarkMode }: VoiceConversationModeProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          handleVoiceInput(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus('error');
        setStatusMessage('שגיאה בזיהוי דיבור: ' + event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isListening, audioStream]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      setIsListening(true);
      setStatus('listening');
      setStatusMessage('מאזין...');
      setTranscript('');
      setResponse('');
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Microphone access denied:', error);
      setStatus('error');
      setStatusMessage('לא ניתן לגשת למיקרופון');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setStatus('idle');
    setStatusMessage('');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;

    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setStatus('processing');
    setStatusMessage('מעבד את השאלה...');

    try {
      const aiResponse = await onMessage(text);
      setResponse(aiResponse);
      
      setStatus('speaking');
      setStatusMessage('מדבר...');
      
      await speakResponse(aiResponse);
      
      setStatus('success');
      setStatusMessage('הושלם!');
      
      setTimeout(() => {
        if (!isListening) {
          startListening();
        }
      }, 2000);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setStatus('error');
      setStatusMessage('שגיאה בעיבוד השאלה');
      
      setTimeout(() => {
        if (!isListening) {
          startListening();
        }
      }, 3000);
    }
  };

  const speakResponse = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'he-IL';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          synthRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          synthRef.current = null;
          reject(event);
        };

        synthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis not supported');
        resolve();
      }
    });
  };

  const handleClose = () => {
    stopListening();
    if (synthRef.current) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
              <Mic className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">מצב שיחה קולי</h2>
              <p className="text-sm text-gray-400">דבר בחופשיות, אני מקשיב</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            aria-label="סגור"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Voice Waveform */}
          <VoiceWaveform
            isRecording={isListening}
            audioStream={audioStream}
            className="mb-4"
          />

          {/* Status Feedback */}
          <VoiceFeedback
            status={status}
            message={statusMessage}
          />

          {/* Transcript Display */}
          {transcript && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">אתה אמרת:</p>
              <p className="text-white">{transcript}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-400 mb-1">תשובה:</p>
              <p className="text-white whitespace-pre-wrap">{response}</p>
            </div>
          )}

          {/* Control Button */}
          <div className="flex justify-center pt-4">
            {!isListening ? (
              <button
                onClick={startListening}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                התחל שיחה
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2 animate-pulse"
              >
                <MicOff className="w-5 h-5" />
                עצור הקלטה
              </button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-400">
            <p>💡 טיפ: המערכת תמשיך להאזין אוטומטית אחרי כל תשובה</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConversationMode;