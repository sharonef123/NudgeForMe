import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, X, Radio, Pause } from 'lucide-react';

interface VoiceConversationModeProps {
  onClose: () => void;
  onMessage: (text: string) => void;
}

const VoiceConversationMode = ({ onClose, onMessage }: VoiceConversationModeProps) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState<'inactive' | 'listening' | 'processing' | 'speaking'>('inactive');
  
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL';

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setTranscript(text);

        if (event.results[last].isFinal) {
          setStatus('processing');
          onMessage(text);
          setTimeout(() => {
            setTranscript('');
            setStatus('listening');
          }, 1000);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setStatus('listening');
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    } else {
      window.notify?.error(t('errors.voiceNotSupported'));
    }

    return () => {
      recognitionRef.current?.stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening, onMessage, t]);

  // Audio Visualization
  useEffect(() => {
    if (isListening) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;

          const updateVolume = () => {
            if (!analyserRef.current) return;
            
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVolume(average);
            
            animationRef.current = requestAnimationFrame(updateVolume);
          };

          updateVolume();
        })
        .catch(err => {
          console.error('Microphone access error:', err);
          window.notify?.error(t('errors.voicePermission'));
        });
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, t]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('inactive');
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus('listening');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'from-emerald-500 to-green-500';
      case 'processing': return 'from-blue-500 to-cyan-500';
      case 'speaking': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return t('voice.listening');
      case 'processing': return t('voice.processing');
      case 'speaking': return t('voice.speaking');
      default: return t('voice.inactive');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" dir="rtl">
      <div className="w-full max-w-2xl glass-panel rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={\p-3 rounded-xl bg-gradient-to-br \\}>
                {status === 'listening' ? (
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                ) : status === 'speaking' ? (
                  <Volume2 className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('voice.voiceMode')}</h2>
                <p className="text-sm text-gray-400">{getStatusText()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="relative p-12 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          {/* Wave Visualization */}
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const height = isListening ? Math.max(20, (volume / 2) * Math.sin(i * 0.5) + volume) : 20;
              return (
                <div
                  key={i}
                  className={\w-1 rounded-full bg-gradient-to-t \ transition-all duration-150\}
                  style={{
                    height: \\px\,
                    opacity: isListening ? 0.8 : 0.3,
                  }}
                />
              );
            })}
          </div>

          {/* Pulsing Circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={\w-64 h-64 rounded-full bg-gradient-to-br \ opacity-20 blur-3xl \\} />
          </div>
        </div>

        {/* Transcript */}
        <div className="p-6 min-h-[120px] bg-slate-900/50">
          {transcript ? (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white text-lg text-center">{transcript}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                {isListening ? '🎤 מאזין...' : 'לחץ על המיקרופון להתחלה'}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-white/10 flex items-center justify-center gap-4">
          <button
            onClick={toggleListening}
            className={\elative p-8 rounded-full bg-gradient-to-br \ shadow-2xl hover:scale-110 transition-transform\}
          >
            {isListening ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
            
            {/* Pulse Animation */}
            {isListening && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 text-center">
              💡 טיפ: דבר בבירור ובקצב רגיל לתוצאות מיטביות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceConversationMode;