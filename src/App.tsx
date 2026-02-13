import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n/config';

// Context
import { ConversationProvider } from './contexts/ConversationContext';

// Components
import VoiceConversationMode from './components/Voice/VoiceConversationMode';
import MultiModalInput from './components/Input/MultiModalInput';
import SmartSuggestions from './components/Chat/SmartSuggestions';
import SessionsList from './components/Chat/SessionsList';
import QuickActions from './components/QuickActions/QuickActions';
import PerformanceMonitor from './components/Performance/PerformanceMonitor';
import OfflineMode, { useOnlineStatus } from './components/Offline/OfflineMode';
import NotificationSystem from './components/Notifications/NotificationSystem';
import LanguageSwitcher from './components/Language/LanguageSwitcher';

// Lazy loaded components
import { lazy } from 'react';
const VoicePersonalization = lazy(() => import('./components/Voice/VoicePersonalization'));
const AccessibilityFeatures = lazy(() => import('./components/Accessibility/AccessibilityFeatures'));
const ThemeCustomizer = lazy(() => import('./components/Theme/ThemeCustomizer'));

// Hooks
import { useKeyboardShortcuts, defaultShortcuts } from './hooks/useKeyboardShortcuts';
import { useVoiceSettings } from './hooks/useVoiceSettings';

// Services
import geminiService from './services/geminiService';

// Icons
import { Settings, Mic, MessageSquare, Sparkles, Menu, X } from 'lucide-react';
function App() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const { speak } = useVoiceSettings();

  // UI State
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Messages
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    ...defaultShortcuts,
    {
      key: '/',
      ctrl: true,
      callback: () => setShowAccessibility(true),
      description: t('shortcuts.openAccessibility'),
    },
  ]);

  // Custom event listeners
  useEffect(() => {
    const handleOpenAccessibility = () => setShowAccessibility(true);
    const handleOpenVoice = () => setShowVoiceMode(true);
    const handleOpenSettings = () => setShowSettings(true);
    const handleCloseModal = () => {
      setShowVoiceMode(false);
      setShowSettings(false);
      setShowAccessibility(false);
      setShowVoiceSettings(false);
      setShowThemes(false);
    };

    window.addEventListener('nudge:open-accessibility', handleOpenAccessibility);
    window.addEventListener('nudge:open-voice', handleOpenVoice);
    window.addEventListener('nudge:open-settings', handleOpenSettings);
    window.addEventListener('nudge:close-modal', handleCloseModal);

    return () => {
      window.removeEventListener('nudge:open-accessibility', handleOpenAccessibility);
      window.removeEventListener('nudge:open-voice', handleOpenVoice);
      window.removeEventListener('nudge:open-settings', handleOpenSettings);
      window.removeEventListener('nudge:close-modal', handleCloseModal);
    };
  }, []);
  const handleSendMessage = async (text: string, attachments?: any[]) => {
    if (!text.trim() && !attachments?.length) return;

    setIsLoading(true);

    const userMessage = {
      role: 'user' as const,
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await geminiService.sendMessage(text, messages, attachments);
      
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      speak(response.text);
      window.notify?.success(t('common.success'), `${response.processingTime}ms`);
    } catch (error: any) {
      console.error('Error:', error);
      window.notify?.error(t('common.error'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSendMessage(text);
  };

  const handleQuickAction = (actionId: string) => {
    const actions: Record<string, string> = {
      'check-insurance': t('suggestions.insurance'),
      'meetings': t('suggestions.meetings'),
      'work-hours': t('suggestions.workHours'),
      'kids': t('suggestions.kids'),
      'reminders': t('nudge.reminders'),
      'favorites': 'הצג מועדפים',
    };

    const message = actions[actionId];
    if (message) {
      handleSendMessage(message);
    }
  };
  return (
    <ConversationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NotificationSystem />
        <PerformanceMonitor showDetails={false} />
        <OfflineMode isOnline={isOnline} />

        <header className="glass-panel border-b border-white/10 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t('common.appName')}</h1>
                <p className="text-xs text-gray-400">{t('nudge.greeting')}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowVoiceMode(true)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="md:hidden border-t border-white/10 p-4 space-y-2">
              <button
                onClick={() => { setShowSessions(!showSessions); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white"
              >
                <MessageSquare className="w-5 h-5" />
                {t('sessions.title')}
              </button>
              <button
                onClick={() => { setShowVoiceMode(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white"
              >
                <Mic className="w-5 h-5" />
                {t('voice.voiceMode')}
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white"
              >
                <Settings className="w-5 h-5" />
                {t('common.settings')}
              </button>
            </div>
          )}
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {showSessions && (
              <div className="lg:col-span-1">
                <SessionsList />
              </div>
            )}

            <div className={showSessions ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="space-y-6">
                <QuickActions onActionClick={handleQuickAction} />

                {messages.length === 0 && (
                  <SmartSuggestions onSuggestionClick={handleSuggestionClick} />
                )}

                {messages.length > 0 && (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white'
                              : 'glass-panel text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-2 opacity-70">
                            {msg.timestamp.toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="glass-panel p-4 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <div className="animate-bounce">💭</div>
                            <span className="text-white">{t('chat.thinking')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="glass-panel p-6 rounded-2xl sticky bottom-4">
                  <MultiModalInput
                    onSendMessage={handleSendMessage}
                    onVoiceClick={() => setShowVoiceMode(true)}
                    disabled={isLoading || !isOnline}
                    placeholder={t('chat.placeholder')}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
          </div>
        }>
          {showVoiceMode && (
            <VoiceConversationMode
              onClose={() => setShowVoiceMode(false)}
              onMessage={handleSendMessage}
            />
          )}

          {showVoiceSettings && (
            <VoicePersonalization
              onSettingsChange={() => {}}
              onClose={() => setShowVoiceSettings(false)}
            />
          )}

          {showAccessibility && (
            <AccessibilityFeatures
              onSettingsChange={() => {}}
              onClose={() => setShowAccessibility(false)}
            />
          )}

          {showThemes && (
            <ThemeCustomizer onClose={() => setShowThemes(false)} />
          )}
        </Suspense>

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
            <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{t('common.settings')}</h2>
                  <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <button
                  onClick={() => { setShowSettings(false); setShowThemes(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  {t('settings.theme')}
                </button>

                <button
                  onClick={() => { setShowSettings(false); setShowVoiceSettings(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right"
                >
                  <Mic className="w-5 h-5 text-emerald-400" />
                  {t('settings.voice')}
                </button>

                <button
                  onClick={() => { setShowSettings(false); setShowAccessibility(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right"
                >
                  <Settings className="w-5 h-5 text-blue-400" />
                  {t('settings.accessibility')}
                </button>
              </div>

              <div className="p-6 border-t border-white/10 text-center text-sm text-gray-400">
                {t('settings.version')} 1.0.0
              </div>
            </div>
          </div>
        )}
      </div>
    </ConversationProvider>
  );
}

export default App;