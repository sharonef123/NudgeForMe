import { useState, useCallback } from 'react';

export const useVoiceSettings = () => {
  const [isAutoSpeak, setIsAutoSpeak] = useState(false);

  const speak = useCallback((text: string) => {
    if (!isAutoSpeak) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      window.speechSynthesis.speak(utterance);
    }
  }, [isAutoSpeak]);

  return { speak, isAutoSpeak, setIsAutoSpeak };
};