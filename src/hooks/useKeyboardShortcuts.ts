import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

// Default shortcuts for the app
export const defaultShortcuts: ShortcutConfig[] = [
  {
    key: '/',
    ctrl: true,
    callback: () => {
      // Open accessibility menu
      const event = new CustomEvent('nudge:open-accessibility');
      window.dispatchEvent(event);
    },
    description: 'פתח תפריט נגישות',
  },
  {
    key: 'k',
    ctrl: true,
    callback: () => {
      // Focus search/input
      const input = document.querySelector('textarea, input[type="text"]') as HTMLElement;
      input?.focus();
    },
    description: 'התמקד בחיפוש',
  },
  {
    key: 'm',
    ctrl: true,
    callback: () => {
      // Open voice mode
      const event = new CustomEvent('nudge:open-voice');
      window.dispatchEvent(event);
    },
    description: 'פתח מצב קולי',
  },
  {
    key: 'Escape',
    callback: () => {
      // Close active modal/dialog
      const event = new CustomEvent('nudge:close-modal');
      window.dispatchEvent(event);
    },
    description: 'סגור חלון פעיל',
  },
  {
    key: 'n',
    ctrl: true,
    callback: () => {
      // New conversation
      const event = new CustomEvent('nudge:new-conversation');
      window.dispatchEvent(event);
    },
    description: 'שיחה חדשה',
  },
  {
    key: 's',
    ctrl: true,
    callback: () => {
      // Open settings
      const event = new CustomEvent('nudge:open-settings');
      window.dispatchEvent(event);
    },
    description: 'פתח הגדרות',
  },
];

export default useKeyboardShortcuts;