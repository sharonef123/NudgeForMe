import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Volume2, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceConversationModeProps {
  onClose: () => void;
  onMessage: (text: string) => Promise<string>;
  isDarkMode: boolean;
}

const VoiceConversationMode: React.FC<VoiceConversationModeProps> = ({
  onClose,
  onMessage,
  isDarkMode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTranscript(transcript);
        
        if (event.results[0].isFinal) {
          handleUserSpeech(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserSpeech = async (text: string) => {
    setIsListening(false);
    setIsProcessing(true);
    
    try {
      const aiResponse = await onMessage(text);
      setResponse(aiResponse);
      speakResponse(aiResponse);
    } catch (error) {
      console.error('Error processing speech:', error);
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsProcessing(false);
      setTimeout(() => startListening(), 500);
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}
    >
      <button onClick={onClose} className={`absolute top-8 right-8 p-3 rounded-full ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
        <X className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center space-y-8 max-w-lg w-full">
        <div className="relative">
          <motion.button
            onClick={toggleListening}
            disabled={isSpeaking || isProcessing}
            className={`w-32 h-32 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : isSpeaking ? 'bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            animate={isListening || isSpeaking ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: isListening || isSpeaking ? Infinity : 0, duration: 1.5 }}
          >
            {isProcessing ? <Loader className="w-12 h-12 text-white animate-spin" /> : isSpeaking ? <Volume2 className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
          </motion.button>
        </div>

        <div className="text-center space-y-2">
          <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {isListening ? 'מאזין...' : isSpeaking ? 'מדבר...' : isProcessing ? 'מעבד...' : 'לחץ להתחלה'}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {transcript && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full p-6 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-lg'}`}>
              <p className="text-sm">{transcript}</p>
            </motion.div>
          )}
          {response && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full p-6 rounded-2xl ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <p className="text-sm">{response}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VoiceConversationMode;
