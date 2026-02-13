import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Play, RotateCcw, X, Sliders } from 'lucide-react';

interface VoicePersonalizationProps {
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

const VoicePersonalization = ({ onSettingsChange, onClose }: VoicePersonalizationProps) => {
  const { t } = useTranslation();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [autoSpeak, setAutoSpeak] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const hebrewVoices = availableVoices.filter(v => v.lang.startsWith('he'));
      setVoices(hebrewVoices.length > 0 ? hebrewVoices : availableVoices);
      if (hebrewVoices.length > 0) {
        setSelectedVoice(hebrewVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance('שלום! זה קול הבדיקה שלי');
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    window.speechSynthesis.speak(utterance);
  };

  const resetSettings = () => {
    setRate(1.0);
    setPitch(1.0);
    setVolume(1.0);
    setAutoSpeak(false);
  };

  const saveSettings = () => {
    onSettingsChange({ selectedVoice, rate, pitch, volume, autoSpeak });
    window.notify?.success('הגדרות נשמרו', 'העדפות הקול שלך עודכנו');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" dir="rtl">
      <div className="w-full max-w-2xl glass-panel rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('voiceSettings.title')}</h2>
                <p className="text-sm text-gray-400">{t('voiceSettings.subtitle')}</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              {t('voiceSettings.selectVoice')}
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
                       outline-none focus:border-purple-500/50 transition-colors"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name} className="bg-slate-800">
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">
                {t('voiceSettings.rate')}
              </label>
              <span className="text-sm text-gray-400">{rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                       [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('voiceSettings.slow')}</span>
              <span>{t('voiceSettings.normal')}</span>
              <span>{t('voiceSettings.fast')}</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">
                {t('voiceSettings.pitch')}
              </label>
              <span className="text-sm text-gray-400">{pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                       [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-pink-500 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('voiceSettings.low')}</span>
              <span>{t('voiceSettings.medium')}</span>
              <span>{t('voiceSettings.high')}</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">
                {t('voiceSettings.volume')}
              </label>
              <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                       [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('voiceSettings.quiet')}</span>
              <span>{t('voiceSettings.loud')}</span>
            </div>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-medium text-white">{t('voiceSettings.autoSpeak')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('voiceSettings.autoSpeakDesc')}</p>
            </div>
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={'relative w-14 h-7 rounded-full transition-colors ' + 
                        (autoSpeak ? 'bg-emerald-500' : 'bg-gray-600')}
            >
              <div
                className={'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ' + 
                          (autoSpeak ? 'translate-x-8' : 'translate-x-1')}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={testVoice}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                     bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg 
                     hover:shadow-blue-500/50 text-white font-medium transition-all"
          >
            <Play className="w-5 h-5" />
            {t('voiceSettings.testVoice')}
          </button>

          <button
            onClick={resetSettings}
            className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={t('voiceSettings.reset')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={saveSettings}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 
                     hover:shadow-lg hover:shadow-emerald-500/50 text-white font-medium transition-all"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePersonalization;