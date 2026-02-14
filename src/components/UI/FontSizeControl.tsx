import { useState, useEffect } from 'react';
import { Type, Plus, Minus } from 'lucide-react';

const FontSizeControl = () => {
  const [fontSize, setFontSize] = useState(16);
  const MIN_SIZE = 14;
  const MAX_SIZE = 24;

  useEffect(() => {
    const saved = localStorage.getItem('font_size');
    if (saved) {
      const size = parseInt(saved);
      setFontSize(size);
      applyFontSize(size);
    }
  }, []);

  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}px`;
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, fontSize + delta));
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('font_size', String(newSize));
  };

  const resetFontSize = () => {
    setFontSize(16);
    applyFontSize(16);
    localStorage.setItem('font_size', '16');
  };

  return (
    <div className="fixed top-20 right-4 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl p-3 shadow-lg z-40">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-gray-400" />
        
        <button
          onClick={() => changeFontSize(-2)}
          disabled={fontSize <= MIN_SIZE}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="הקטן גופן"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={resetFontSize}
          className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
          aria-label="אפס גודל גופן"
        >
          {fontSize}
        </button>

        <button
          onClick={() => changeFontSize(2)}
          disabled={fontSize >= MAX_SIZE}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="הגדל גופן"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default FontSizeControl;