import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // טען מ-localStorage
    const saved = localStorage.getItem('high_contrast');
    if (saved === 'true') {
      setIsHighContrast(true);
      applyHighContrast(true);
    }
  }, []);

  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      
      // הוסף CSS גלובלי
      const style = document.createElement('style');
      style.id = 'high-contrast-style';
      style.textContent = `
        .high-contrast {
          --bg-primary: #000000;
          --bg-secondary: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #e5e5e5;
          --border-color: #ffffff;
          --accent-color: #00ff00;
        }

        .high-contrast * {
          border-color: var(--border-color) !important;
        }

        .high-contrast .bg-slate-900,
        .high-contrast .bg-slate-800 {
          background-color: var(--bg-secondary) !important;
        }

        .high-contrast .text-white,
        .high-contrast .text-gray-100,
        .high-contrast .text-gray-200 {
          color: var(--text-primary) !important;
        }

        .high-contrast .text-gray-300,
        .high-contrast .text-gray-400 {
          color: var(--text-secondary) !important;
        }

        .high-contrast .text-emerald-400,
        .high-contrast .text-emerald-500 {
          color: var(--accent-color) !important;
        }

        .high-contrast button,
        .high-contrast input {
          border: 2px solid var(--border-color) !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.documentElement.classList.remove('high-contrast');
      const existingStyle = document.getElementById('high-contrast-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  };

  const toggleTheme = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    applyHighContrast(newValue);
    localStorage.setItem('high_contrast', String(newValue));
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-20 p-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-full hover:bg-slate-700 transition-all shadow-lg z-40"
      aria-label={isHighContrast ? 'כבה ניגודיות גבוהה' : 'הפעל ניגודיות גבוהה'}
      title={isHighContrast ? 'ניגודיות גבוהה פעילה' : 'הפעל ניגודיות גבוהה'}
    >
      {isHighContrast ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  );
};

export default ThemeToggle;