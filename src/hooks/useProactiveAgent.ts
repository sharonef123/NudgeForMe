import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NudgeMessage,
  NudgeConfig,
  getNudgeConfigs,
  shouldTriggerNudge,
  markNudgeTriggered,
  buildNudgePrompt,
} from '../services/proactiveService';

interface UseProactiveAgentReturn {
  currentNudge: NudgeMessage | null;
  triggerManualNudge: () => void;
  dismissNudge: () => void;
  configs: NudgeConfig[];
}

const CHECK_INTERVAL_MS = 60 * 1000; // בדיקה כל דקה

export function useProactiveAgent(): UseProactiveAgentReturn {
  const [currentNudge, setCurrentNudge] = useState<NudgeMessage | null>(null);
  const [configs, setConfigs] = useState<NudgeConfig[]>(getNudgeConfigs());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // בדיקת טריגרים
  const checkTriggers = useCallback(() => {
    const freshConfigs = getNudgeConfigs();
    setConfigs(freshConfigs);

    for (const config of freshConfigs) {
      if (shouldTriggerNudge(config)) {
        const nudge = buildNudgePrompt(config.type);
        setCurrentNudge(nudge);
        markNudgeTriggered(config.id);
        break; // הצג רק נודג' אחד בכל פעם
      }
    }
  }, []);

  // הפעלת interval
  useEffect(() => {
    // בדיקה ראשונית עם קצת delay (לא מיד בטעינה)
    const initialTimeout = setTimeout(() => {
      checkTriggers();
    }, 5000);

    // בדיקה כל דקה
    intervalRef.current = setInterval(checkTriggers, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkTriggers]);

  // טריגר ידני (כפתור "מה יש לי עכשיו?")
  const triggerManualNudge = useCallback(() => {
    const nudge = buildNudgePrompt('manual');
    setCurrentNudge(nudge);
  }, []);

  // סגירת נודג'
  const dismissNudge = useCallback(() => {
    setCurrentNudge(null);
  }, []);

  return {
    currentNudge,
    triggerManualNudge,
    dismissNudge,
    configs,
  };
}