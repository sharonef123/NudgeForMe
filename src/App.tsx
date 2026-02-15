import { useState, useEffect, useCallback } from "react";
import { ConversationProvider } from "./contexts/ConversationContext";
import ChatInterface from "./components/Chat/ChatInterface";
import Header from "./components/Layout/Header";
import SessionsList from "./components/Chat/SessionsList";
import SmartSuggestions from "./components/Chat/SmartSuggestions";
import GoogleToolsPanel from "./components/GoogleTools/GoogleToolsPanel";
import NudgeNotification from "./components/Notifications/NudgeNotification";
import { useProactiveAgent } from "./hooks/useProactiveAgent";
import { NudgeMessage } from "./services/proactiveService";
import "./index.css";

function AppInner({ isDarkMode, setIsDarkMode }: {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}) {
  const [showSessions, setShowSessions] = useState(false);
  const [showGoogleTools, setShowGoogleTools] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);

  const { currentNudge, triggerManualNudge, dismissNudge } = useProactiveAgent();

  const handleNudgeAccept = useCallback((nudge: NudgeMessage) => {
    dismissNudge();
    setShowSessions(false);
    setShowGoogleTools(false);
    setPendingSuggestion(nudge.prompt);
  }, [dismissNudge]);

  return (
    <div
      className={`flex flex-col h-screen w-full overflow-hidden font-heebo transition-colors duration-300 ${
        isDarkMode ? "bg-[#050507] text-white" : "bg-[#f8f9fa] text-slate-900"
      }`}
      dir="rtl"
    >
      <NudgeNotification
        nudge={currentNudge}
        onAccept={handleNudgeAccept}
        onDismiss={dismissNudge}
      />

      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSessionsToggle={() => setShowSessions((p) => !p)}
        onGoogleToolsToggle={() => setShowGoogleTools((p) => !p)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {isDarkMode && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 pointer-events-none" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {showSessions && (
          <div className="relative z-10 w-72 flex-shrink-0 border-l border-white/10">
            <SessionsList isDarkMode={isDarkMode} />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              isDarkMode={isDarkMode}
              pendingSuggestion={pendingSuggestion}
              onSuggestionUsed={() => setPendingSuggestion(null)}
            />
          </div>
          <SmartSuggestions
            isDarkMode={isDarkMode}
            onSuggestionClick={(text) => setPendingSuggestion(text)}
            onManualNudge={triggerManualNudge}
          />
        </div>

        {showGoogleTools && (
          <div className="relative z-10 w-80 flex-shrink-0 border-r border-white/10">
            <GoogleToolsPanel isDarkMode={isDarkMode} onClose={() => setShowGoogleTools(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("nudge-dark-mode") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("nudge-dark-mode", String(isDarkMode));
    if (isDarkMode) {
      document.body.style.background = "#050507";
      document.body.style.color = "#ffffff";
    } else {
      document.body.style.background = "#f8f9fa";
      document.body.style.color = "#0f172a";
    }
  }, [isDarkMode]);

  return (
    <ConversationProvider>
      <AppInner isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConversationProvider>
  );
}

export default App;