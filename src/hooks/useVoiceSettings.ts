import { useState, useEffect } from 'react';

interface VoiceSettings {
  voiceIndex: number;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceIndex: 0,
  rate: 0.9,
  pitch: 1,
  volume: 1,
  autoSpeak: true,
};

export const useVoiceSettings = () => {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('nudge-voice-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoices = voices.filter(v => v.lang.startsWith('he'));
      setAvailableVoices(hebrewVoices.length > 0 ? hebrewVoices : voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('nudge-voice-settings', JSON.stringify(updated));
  };

  const speak = (text: string) => {
    if (!settings.autoSpeak) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (availableVoices[settings.voiceIndex]) {
      utterance.voice = availableVoices[settings.voiceIndex];
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'he-IL';

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  return {
    settings,
    availableVoices,
    updateSettings,
    speak,
    stopSpeaking,
  };
};