import { useState, useEffect } from 'react';
import { Settings, Volume2, Zap, User } from 'lucide-react';

interface VoiceSettings {
  voiceIndex: number;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

interface VoicePersonalizationProps {
  onSettingsChange: (settings: VoiceSettings) => void;
  onClose: () => void;
}

const VoicePersonalization = ({ onSettingsChange, onClose }: VoicePersonalizationProps) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    voiceIndex: 0,
    rate: 0.9,
    pitch: 1,
    volume: 1,
    autoSpeak: true,
  });

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('nudge-voice-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Filter Hebrew voices
      const hebrewVoices = voices.filter(v => v.lang.startsWith('he'));
      setAvailableVoices(hebrewVoices.length > 0 ? hebrewVoices : voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('nudge-voice-settings', JSON.stringify(newSettings));
    
    // Notify parent
    onSettingsChange(newSettings);
  };

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance('שלום! זה הקול שבחרת. איך זה נשמע?');
    
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

  const resetToDefaults = () => {
    const defaults: VoiceSettings = {
      voiceIndex: 0,
      rate: 0.9,
      pitch: 1,
      volume: 1,
      autoSpeak: true,
    };
    setSettings(defaults);
    localStorage.setItem('nudge-voice-settings', JSON.stringify(defaults));
    onSettingsChange(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-xl glass-panel rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">התאמת קול אישית</h2>
              <p className="text-sm text-gray-400">התאם את הקול לפי העדפתך</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-medium">
              <User className="w-5 h-5 text-purple-400" />
              בחירת קול
            </label>
            <select
              value={settings.voiceIndex}
              onChange={(e) => handleSettingChange('voiceIndex', parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              {availableVoices.map((voice, index) => (
                <option key={index} value={index} className="bg-slate-800">
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate (Speed) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-white font-medium">
                <Zap className="w-5 h-5 text-emerald-400" />
                מהירות דיבור
              </label>
              <span className="text-emerald-400 font-mono">{settings.rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-emerald-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>איטי</span>
              <span>רגיל</span>
              <span>מהיר</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-white font-medium">
                <Volume2 className="w-5 h-5 text-blue-400" />
                גובה צליל
              </label>
              <span className="text-blue-400 font-mono">{settings.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-blue-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>נמוך</span>
              <span>רגיל</span>
              <span>גבוה</span>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-white font-medium">
                <Volume2 className="w-5 h-5 text-orange-400" />
                עוצמת קול
              </label>
              <span className="text-orange-400 font-mono">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-orange-400"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>שקט</span>
              <span>בינוני</span>
              <span>חזק</span>
            </div>
          </div>

          {/* Auto-Speak Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-white font-medium">הקראה אוטומטית</p>
              <p className="text-sm text-gray-400">הקרא תשובות אוטומטית בלי לחיצה</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoSpeak', !settings.autoSpeak)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.autoSpeak ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.autoSpeak ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={testVoice}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            🔊 נסה את הקול
          </button>
          <button
            onClick={resetToDefaults}
            className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
          >
            איפוס
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePersonalization;