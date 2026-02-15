import { useState, useEffect } from "react";
import { Moon, Sun, History, Sparkles, Chrome, Download } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  onSessionsToggle: () => void;
  onGoogleToolsToggle: () => void;
}

const Header = ({ isDarkMode, setIsDarkMode, onSessionsToggle, onGoogleToolsToggle }: HeaderProps) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  const btnBase = isDarkMode
    ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
    : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm";

  return (
    <header className={`flex items-center justify-between px-6 py-3 border-b backdrop-blur-xl flex-shrink-0 z-30 transition-colors duration-300 ${
      isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white/90 border-slate-200 shadow-sm"
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className={`text-lg font-bold leading-none ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Nudge Me OS
          </h1>
          <p className={`text-xs leading-none mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            העוזר האישי של שרון
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {installPrompt && !isInstalled && (
          <button
            onClick={handleInstall}
            title="התקן אפליקציה"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-xs font-medium"
          >
            <Download className="w-4 h-4" />
            התקן
          </button>
        )}

        <button onClick={onGoogleToolsToggle} title="כלי Google"
          className={`p-2 rounded-xl border transition-all hover:scale-105 ${btnBase}`}>
          <Chrome className="w-5 h-5" />
        </button>

        <button onClick={onSessionsToggle} title="היסטוריית שיחות"
          className={`p-2 rounded-xl border transition-all hover:scale-105 ${btnBase}`}>
          <History className="w-5 h-5" />
        </button>

        <button onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "מצב בהיר" : "מצב כהה"}
          className={`p-2 rounded-xl border transition-all hover:scale-105 ${btnBase}`}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;