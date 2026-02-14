import { useState, useEffect } from 'react';
import { Volume2, Mic, Zap } from 'lucide-react';

interface VoiceSettings {
  voiceGender: 'female' | 'male';
  voiceName: string;
  speechRate: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  volume: number; // 0 - 1
  tone: 'friendly' | 'professional' | 'tachles';
}

const STORAGE_KEY = 'nudge_voice_settings';

const VoicePersonalization = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    voiceGender: 'female',
    voiceName: '',
    speechRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    tone: 'tachles'
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // טען הגדרות מ-LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading voice settings:', error);
      }
    }
  }, []);

  // טען קולות זמינים
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // סנן רק קולות עבריים
      const hebrewVoices = voices.filter(voice => 
        voice.lang.startsWith('he') || voice.lang.startsWith('iw')
      );
      setAvailableVoices(hebrewVoices.length > 0 ? hebrewVoices : voices);
      
      // בחר קול ברירת מחדל
      if (!settings.voiceName && hebrewVoices.length > 0) {
        const femaleVoice = hebrewVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('woman')
        ) || hebrewVoices[0];
        
        setSettings(prev => ({
          ...prev,
          voiceName: femaleVoice.name
        }));
      }
    };

    loadVoices();
    
    // Safari דורש זמן להטעין קולות
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // שמור הגדרות
  const saveSettings = (newSettings: VoiceSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    console.log('💾 הגדרות קול נשמרו');
  };

  // בדיקת קול
  const testVoice = () => {
    setIsTesting(true);
    
    const testPhrases = {
      friendly: 'היי שרון! אני נאדג׳, העוזר האישי שלך. איך אני נשמע?',
      professional: 'שלום שרון. אני נאדג׳, העוזר הדיגיטלי שלך. נעים להכיר.',
      tachles: 'יאללה שרון, בוא נתחיל לעבוד! מה יש לנו להיום?'
    };

    const utterance = new SpeechSynthesisUtterance(testPhrases[settings.tone]);
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    const voice = availableVoices.find(v => v.name === settings.voiceName);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      setIsTesting(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const femaleVoices = availableVoices.filter(v => 
    !v.name.toLowerCase().includes('male') || 
    v.name.toLowerCase().includes('female')
  );

  const maleVoices = availableVoices.filter(v => 
    v.name.toLowerCase().includes('male') && 
    !v.name.toLowerCase().includes('female')
  );

  return (
    <div className="space-y-6 p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white">התאמה אישית של קול</h2>
      </div>

      {/* בחירת מגדר קול */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">מגדר הקול</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => saveSettings({ 
              ...settings, 
              voiceGender: 'female',
              voiceName: femaleVoices[0]?.name || ''
            })}
            className={`p-4 rounded-xl border-2 transition-all ${
              settings.voiceGender === 'female'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">👩</div>
              <div className="text-sm font-medium text-white">קול נשי</div>
            </div>
          </button>

          <button
            onClick={() => saveSettings({ 
              ...settings, 
              voiceGender: 'male',
              voiceName: maleVoices[0]?.name || ''
            })}
            className={`p-4 rounded-xl border-2 transition-all ${
              settings.voiceGender === 'male'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">👨</div>
              <div className="text-sm font-medium text-white">קול גברי</div>
            </div>
          </button>
        </div>
      </div>

      {/* בחירת קול ספציפי */}
      {availableVoices.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">קול ספציפי</label>
          <select
            value={settings.voiceName}
            onChange={(e) => saveSettings({ ...settings, voiceName: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
          >
            {(settings.voiceGender === 'female' ? femaleVoices : maleVoices).map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* מהירות דיבור */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-gray-300">מהירות דיבור</label>
          <span className="text-sm text-emerald-400">{settings.speechRate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.speechRate}
          onChange={(e) => saveSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>איטי</span>
          <span>מהיר</span>
        </div>
      </div>

      {/* גובה צליל */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-gray-300">גובה צליל</label>
          <span className="text-sm text-blue-400">{settings.pitch.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.pitch}
          onChange={(e) => saveSettings({ ...settings, pitch: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>נמוך</span>
          <span>גבוה</span>
        </div>
      </div>

      {/* עוצמת שמע */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-gray-300">עוצמת שמע</label>
          <span className="text-sm text-purple-400">{Math.round(settings.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.volume}
          onChange={(e) => saveSettings({ ...settings, volume: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* טון שיחה */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">טון השיחה</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'friendly', label: 'ידידותי', icon: '😊' },
            { value: 'professional', label: 'רשמי', icon: '💼' },
            { value: 'tachles', label: 'תכלס', icon: '🎯' }
          ].map(tone => (
            <button
              key={tone.value}
              onClick={() => saveSettings({ ...settings, tone: tone.value as any })}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.tone === tone.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className="text-xl mb-1">{tone.icon}</div>
              <div className="text-xs font-medium text-white">{tone.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* כפתור בדיקה */}
      <button
        onClick={testVoice}
        disabled={isTesting}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl font-bold text-white hover:from-emerald-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isTesting ? (
          <>
            <Zap className="w-5 h-5 animate-pulse" />
            <span>מדבר...</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>בדוק את הקול</span>
          </>
        )}
      </button>
    </div>
  );
};

export default VoicePersonalization;
export type { VoiceSettings };