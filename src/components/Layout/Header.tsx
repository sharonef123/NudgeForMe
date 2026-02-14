import { Moon, Sun, Menu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  onMenuClick?: () => void;
}

export default function Header({ isDarkMode, setIsDarkMode, onMenuClick }: HeaderProps) {
  return (
    <header className="px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b safe-pt z-40 bg-[#05050780] border-white/5">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3 flex-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center glow-emerald">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-xl font-black text-gradient-primary">
            Nudge Me OS
          </h1>
          <p className="text-xs text-emerald-400 font-medium">
            AI Life Operating System
          </p>
        </motion.div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-xl glass-button transition-all"
          title={isDarkMode ? 'מצב בהיר' : 'מצב כהה'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
        </motion.button>

        {/* Menu Button (Mobile) */}
        {onMenuClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="p-2.5 rounded-xl glass-button transition-all md:hidden"
            title="תפריט"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </header>
  );
}