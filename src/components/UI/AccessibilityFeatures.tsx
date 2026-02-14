import { useEffect } from 'react';

// הוסף ARIA labels ושיפורי נגישות גלובליים
const AccessibilityFeatures = () => {
  useEffect(() => {
    // הוסף ARIA landmarks אוטומטיים
    const applyAriaLabels = () => {
      // Main content
      const mainContent = document.querySelector('main');
      if (mainContent && !mainContent.getAttribute('role')) {
        mainContent.setAttribute('role', 'main');
        mainContent.setAttribute('aria-label', 'תוכן ראשי');
      }

      // Navigation
      const nav = document.querySelector('nav');
      if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'ניווט ראשי');
      }

      // Buttons without labels
      const buttons = document.querySelectorAll('button:not([aria-label])');
      buttons.forEach(btn => {
        const text = btn.textContent?.trim();
        if (text) {
          btn.setAttribute('aria-label', text);
        }
      });

      // Input fields
      const inputs = document.querySelectorAll('input:not([aria-label])');
      inputs.forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        }
      });
    };

    applyAriaLabels();

    // הרץ שוב אחרי שהדום משתנה
    const observer = new MutationObserver(applyAriaLabels);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Focus management
    const handleFocusVisible = () => {
      document.body.classList.add('keyboard-navigation');
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    window.addEventListener('keydown', handleFocusVisible);
    window.addEventListener('mousedown', handleMouseDown);

    // הוסף CSS גלובלי לנגישות
    const style = document.createElement('style');
    style.textContent = `
      /* Focus indicators רק בניווט מקלדת */
      body:not(.keyboard-navigation) *:focus {
        outline: none;
      }

      body.keyboard-navigation *:focus {
        outline: 2px solid #10b981;
        outline-offset: 2px;
        border-radius: 4px;
      }

      /* שיפור קריאות לגודל טקסט גדול */
      @media (min-width: 1024px) {
        .text-lg { font-size: 1.25rem; }
      }

      /* הבהרה hover */
      button:hover, 
      a:hover {
        filter: brightness(1.1);
      }

      /* אנימציות reduced motion */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* Skip to content link */
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #10b981;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 100;
      }

      .skip-to-content:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('keydown', handleFocusVisible);
      window.removeEventListener('mousedown', handleMouseDown);
      document.head.removeChild(style);
    };
  }, []);

  // Skip to content link
  return (
    <a 
      href="#main-content" 
      className="skip-to-content"
      style={{ 
        position: 'absolute',
        top: '-40px',
        right: '0',
        zIndex: 100 
      }}
    >
      דלג לתוכן הראשי
    </a>
  );
};

export default AccessibilityFeatures;