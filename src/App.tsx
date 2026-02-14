import { useState } from 'react';
import Header from './components/Layout/Header';
import ChatInterface from './components/Chat/ChatInterface';
import './index.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-500 overflow-hidden font-heebo ${
      isDarkMode ? 'bg-[#050507] text-white' : 'bg-[#f8f9fa] text-slate-900'
    }`} dir="rtl">
      {/* Header */}
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Chat Interface */}
        <div className="relative z-10 h-full">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

export default App;