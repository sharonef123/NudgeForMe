import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Settings, Mic, MessageSquare, Menu, X, Send } from 'lucide-react';

// Components
import NotificationSystem from './components/Notifications/NotificationSystem';
import PerformanceMonitor from './components/Performance/PerformanceMonitor';
import OfflineMode, { useOnlineStatus } from './components/Offline/OfflineMode';
import LanguageSwitcher from './components/Language/LanguageSwitcher';
import SmartSuggestions from './components/Chat/SmartSuggestions';
import QuickActions from './components/QuickActions/QuickActions';
import SessionsList from './components/Chat/SessionsList';
import VoiceConversationMode from './components/Voice/VoiceConversationMode';
import VoicePersonalization from './components/Voice/VoicePersonalization';
import AccessibilityFeatures from './components/Accessibility/AccessibilityFeatures';
import ThemeCustomizer from './components/Theme/ThemeCustomizer';

function App() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  
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
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: inputText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant' as const,
        content: 'שלום! אני Nudge, העוזר האישי שלך. איך אוכל לעזור לך היום?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Systems */}
      <NotificationSystem />
      <PerformanceMonitor showDetails={false} />
      <OfflineMode isOnline={isOnline} />

      {/* Header */}
      <header className="glass-panel border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Nudge Me OS</h1>
                <p className="text-xs text-gray-400">שלום! אני Nudge, העוזר האישי שלך</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="שיחות קודמות"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowVoiceMode(true)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="מצב קולי"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="הגדרות"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Sessions */}
          {showSessions && (
            <div className="lg:col-span-1 animate-slide-in-left">
              <SessionsList />
            </div>
          )}

          {/* Main Chat Area */}
          <div className={showSessions ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="animate-fade-in">
                <QuickActions onActionClick={(id) => console.log('Action:', id)} />
              </div>

              {/* Smart Suggestions or Messages */}
              {messages.length === 0 ? (
                <div className="animate-fade-in">
                  <SmartSuggestions onSuggestionClick={handleSuggestionClick} />
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-6 min-h-[400px]" dir="rtl">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={
                          'flex ' + (msg.role === 'user' ? 'justify-end' : 'justify-start')
                        }
                      >
                        <div
                          className={
                            'max-w-[80%] p-4 rounded-2xl ' +
                            (msg.role === 'user'
                              ? 'bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-lg'
                              : 'glass-panel text-white border border-white/10')
                          }
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
                        <div className="glass-panel p-4 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="animate-bounce">💭</div>
                            <span className="text-white">חושב...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="glass-panel rounded-2xl p-6 sticky bottom-4 shadow-2xl" dir="rtl">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="שאל אותי משהו..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={() => setShowVoiceMode(true)}
                    className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-emerald-400 transition-colors"
                    title="מצב קולי"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Enter לשליחה • Shift+Enter לשורה חדשה
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showVoiceMode && (
        <VoiceConversationMode
          onClose={() => setShowVoiceMode(false)}
          onMessage={(text) => setInputText(text)}
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">הגדרות</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowThemes(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right transition-colors"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                ערכות נושא
              </button>

              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowVoiceSettings(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right transition-colors"
              >
                <Mic className="w-5 h-5 text-emerald-400" />
                הגדרות קול
              </button>

              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowAccessibility(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white text-right transition-colors"
              >
                <Settings className="w-5 h-5 text-blue-400" />
                נגישות
              </button>
            </div>

            <div className="p-6 border-t border-white/10 text-center text-sm text-gray-400">
              גרסה 1.0.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;