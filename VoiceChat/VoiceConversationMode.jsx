import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, X, Pause, Play } from 'lucide-react';
import { generateTTS } from '../geminiService';

export default function VoiceConversationMode({ onClose, onMessage, isDarkMode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleSendVoiceMessage(finalTranscript);
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
      audioSourceRef.current?.stop();
    };
  }, []);

  const handleSendVoiceMessage = async (text) => {
    setIsListening(false);
    recognitionRef.current?.stop();

    // Send to chat
    const aiResponse = await onMessage(text);
    setResponse(aiResponse);

    // Generate and play TTS
    const audioData = await generateTTS(aiResponse);
    if (audioData) {
      playAudio(audioData);
    }
  };

  const playAudio = async (base64Audio) => {
    setIsSpeaking(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        arrayBuffer[i] = audioData.charCodeAt(i);
      }

      const audioBuffer = await decodeAudioData(arrayBuffer.buffer, audioContextRef.current);
      
      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBuffer;
      audioSourceRef.current.connect(audioContextRef.current.destination);
      
      audioSourceRef.current.onended = () => {
        setIsSpeaking(false);
        // Auto-restart listening
        if (!isPaused) {
          startListening();
        }
      };
      
      audioSourceRef.current.start(0);
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    recognitionRef.current?.start();
  };

  const togglePause = () => {
    if (isPaused) {
      startListening();
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setIsPaused(!isPaused);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-10 ${
      isDarkMode ? 'bg-slate-950/95' : 'bg-white/95'
    } backdrop-blur-3xl`}>
      
      <button 
        onClick={onClose}
        className="absolute top-10 left-10 p-4 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl font-black tracking-tight">
          Synapse Voice
        </h1>

        {/* Voice Visualizer */}
        <div className="relative flex items-center justify-center">
          <div className={`w-60 h-60 rounded-full flex items-center justify-center border-4 transition-all ${
            isListening 
              ? 'bg-red-500/10 border-red-500/20 animate-pulse' 
              : isSpeaking 
              ? 'bg-purple-500/10 border-purple-500/20 animate-pulse'
              : 'bg-indigo-500/10 border-indigo-500/20'
          }`}>
            {isSpeaking ? (
              <Volume2 className="w-24 h-24 text-purple-400 animate-bounce" />
            ) : isListening ? (
              <Mic className="w-24 h-24 text-red-400" />
            ) : (
              <Mic className="w-24 h-24 text-indigo-400 opacity-50" />
            )}
          </div>

          {/* Animated rings */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 -m-6 rounded-full border border-indigo-500/10 animate-ping" />
              <div className="absolute inset-0 -m-12 rounded-full border border-indigo-500/5 animate-ping" style={{animationDelay: '0.5s'}} />
            </>
          )}
        </div>

        {/* Status & Transcript */}
        <div className="space-y-4">
          <p className={`text-sm font-bold uppercase tracking-widest ${
            isListening ? 'text-red-400 animate-pulse' : isSpeaking ? 'text-purple-400' : 'text-slate-500'
          }`}>
            {isListening ? '🎤 מקשיב...' : isSpeaking ? '🔊 מדבר...' : isPaused ? '⏸️ מושהה' : '👋 מוכן לשיחה'}
          </p>

          {transcript && (
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-lg font-medium">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-slate-400">תשובה:</p>
              <p className="text-lg font-medium mt-2">{response}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePause}
            className={`p-6 rounded-full transition-all ${
              isPaused 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-slate-700 hover:bg-slate-600'
            } text-white shadow-2xl`}
          >
            {isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />}
          </button>

          {!isListening && !isSpeaking && !isPaused && (
            <button
              onClick={startListening}
              className="p-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-2xl hover:shadow-red-500/50 text-white transition-all"
            >
              <Mic className="w-10 h-10" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 italic">
          דבר בחופשיות - אני מקשיב ומגיב בקול
        </p>
      </div>
    </div>
  );
}

async function decodeAudioData(arrayBuffer, audioContext, sampleRate = 24000, numChannels = 1) {
  const dataView = new DataView(arrayBuffer);
  const frameCount = dataView.byteLength / 2 / numChannels;
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      const int16 = dataView.getInt16((i * numChannels + channel) * 2, true);
      channelData[i] = int16 / 32768.0;
    }
  }
  return buffer;
}