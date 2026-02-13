import { useState } from 'react';
import { Calendar, Mail, HardDrive, FileText, Home as HomeIcon, Book, Image, X, ArrowLeft, RotateCw, ExternalLink } from 'lucide-react';

export default function GoogleToolsMenu({ isDarkMode }) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);

  const tools = [
    { id: 'calendar', name: 'יומן', icon: Calendar, url: 'https://calendar.google.com/calendar/u/0/r', color: 'text-blue-500' },
    { id: 'gmail', name: 'Gmail', icon: Mail, url: 'https://mail.google.com/mail/u/0/', color: 'text-red-500' },
    { id: 'drive', name: 'Drive', icon: HardDrive, url: 'https://drive.google.com/drive/my-drive', color: 'text-yellow-500' },
    { id: 'docs', name: 'Docs', icon: FileText, url: 'https://docs.google.com/document/u/0/', color: 'text-blue-400' },
    { id: 'home', name: 'Google Home', icon: HomeIcon, url: 'https://home.google.com/welcome/', color: 'text-orange-500' },
    { id: 'notebook', name: 'NotebookLM', icon: Book, url: 'https://notebooklm.google.com/', color: 'text-purple-500' },
    { id: 'photos', name: 'Photos', icon: Image, url: 'https://photos.google.com/', color: 'text-pink-500' },
  ];

  const openTool = (tool) => {
    setActiveTool(tool);
    setShowPicker(false);
  };

  const closeBrowser = () => {
    setActiveTool(null);
    setIframeKey(prev => prev + 1);
  };

  const reloadPage = () => {
    setIframeKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    if (activeTool) {
      window.open(activeTool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Grid Button in Header */}
      <button
        onClick={() => setShowPicker(true)}
        className={`p-2.5 rounded-xl glass transition-all ${
          isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="כלי Google"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/>
        </svg>
      </button>

      {/* Tool Picker Modal */}
      {showPicker && !activeTool && (
        <div 
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowPicker(false)}
        >
          <div 
            className={`w-full max-w-2xl rounded-3xl p-8 border shadow-2xl ${
              isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Google Workspace</h2>
              <button 
                onClick={() => setShowPicker(false)} 
                className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => openTool(tool)}
                    className={`p-6 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${tool.color}`} />
                    <p className="text-sm font-bold text-center">{tool.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen In-App Browser */}
      {activeTool && (
        <div className="fixed inset-0 z-[999] flex flex-col bg-black">
          
          {/* Navigation Bar */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDarkMode 
              ? 'bg-slate-900/95 border-white/10' 
              : 'bg-white/95 border-slate-200'
          }`}>
            
            {/* Left: Back & Home */}
            <div className="flex items-center gap-2">
              <button
                onClick={closeBrowser}
                className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
                title="חזור לאפליקציה"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-bold hidden md:inline">חזור</span>
              </button>

              <button
                onClick={() => { closeBrowser(); setShowPicker(true); }}
                className={`p-2.5 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-slate-400' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="חזור לתפריט ראשי"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Tool Info */}
            <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
              {(() => {
                const Icon = activeTool.icon;
                return <Icon className={`w-5 h-5 ${activeTool.color}`} />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{activeTool.name}</p>
                <p className="text-xs text-slate-500 truncate">{activeTool.url}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={reloadPage}
                className={`p-2.5 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-slate-400' 
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="רענן דף"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={openInNewTab}
                className={`p-2.5 rounded-xl transition-all ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-slate-400' 
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="פתח בטאב חדש"
              >
                <ExternalLink className="w-5 h-5" />
              </button>

              <button
                onClick={closeBrowser}
                className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-500 transition-all"
                title="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* iframe Content */}
          <div className="flex-1 relative bg-white">
            <iframe
              key={iframeKey}
              src={activeTool.url}
              className="w-full h-full border-none"
              allow="camera; microphone; geolocation; clipboard-read; clipboard-write"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
              title={activeTool.name}
            />
            
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center pointer-events-none opacity-0 transition-opacity">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}