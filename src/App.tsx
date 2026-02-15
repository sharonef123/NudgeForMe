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
      className={`flex flex-col font-heebo transition-colors duration-300 ${
        isDarkMode ? "bg-[#050507] text-white" : "bg-[#f8f9fa] text-slate-900"
      }`}
      style={{ height: "100dvh" }}
      dir="rtl"
    >
      {/* Mesh background */}
      {isDarkMode && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
              radial-gradient(at 50% 0%, hsla(225,39%,10%,1) 0, transparent 50%),
              radial-gradient(at 100% 0%, hsla(339,49%,10%,1) 0, transparent 50%),
              radial-gradient(at 50% 100%, hsla(240,30%,5%,1) 0, transparent 50%)
            `,
            zIndex: 0,
          }}
        />
      )}

      {/* Glow orbs */}
      {isDarkMode && (
        <>
          <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" style={{zIndex:0}} />
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" style={{zIndex:0}} />
        </>
      )}

      {/* Nudge notification */}
      <NudgeNotification
        nudge={currentNudge}
        onAccept={handleNudgeAccept}
        onDismiss={dismissNudge}
      />

      {/* Header — fixed height */}
      <div className="relative flex-shrink-0" style={{zIndex: 40}}>
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSessionsToggle={() => setShowSessions((p) => !p)}
          onGoogleToolsToggle={() => setShowGoogleTools((p) => !p)}
        />
      </div>

      {/* Body — fills remaining height */}
      <div className="flex flex-1 min-h-0 relative" style={{zIndex: 1}}>

        {/* Sessions sidebar */}
        {showSessions && (
          <div className={`flex-shrink-0 w-72 border-l overflow-y-auto ${
            isDarkMode ? "border-white/10 bg-slate-900/80" : "border-slate-200 bg-white/80"
          }`}>
            <SessionsList isDarkMode={isDarkMode} />
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Chat — flex-1 + overflow-y-auto כאן! */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatInterface
              isDarkMode={isDarkMode}
              pendingSuggestion={pendingSuggestion}
              onSuggestionUsed={() => setPendingSuggestion(null)}
            />
          </div>

          {/* Smart suggestions — bottom bar */}
          <div className="flex-shrink-0">
            <SmartSuggestions
              isDarkMode={isDarkMode}
              onSuggestionClick={(text) => setPendingSuggestion(text)}
              onManualNudge={triggerManualNudge}
            />
          </div>
        </div>

        {/* Google Tools panel */}
        {showGoogleTools && (
          <GoogleToolsPanel
            isDarkMode={isDarkMode}
            onClose={() => setShowGoogleTools(false)}
          />
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
    document.body.style.background = isDarkMode ? "#050507" : "#f8f9fa";
    document.body.style.color = isDarkMode ? "#ffffff" : "#0f172a";
  }, [isDarkMode]);

  return (
    <ConversationProvider>
      <AppInner isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </ConversationProvider>
  );
}

export default App;