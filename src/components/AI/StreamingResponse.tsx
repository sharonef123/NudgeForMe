import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface StreamingResponseProps {
  text: string;
  isStreaming: boolean;
  onComplete?: () => void;
  className?: string;
}

const StreamingResponse = ({ 
  text, 
  isStreaming, 
  onComplete,
  className = '' 
}: StreamingResponseProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStreaming && text) {
      // אם לא streaming, הצג הכל מיד
      setDisplayedText(text);
      setCurrentIndex(text.length);
      return;
    }

    if (isStreaming && currentIndex < text.length) {
      // אפקט טיפוגרפיה - תו אחרי תו
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= text.length) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            if (onComplete) {
              onComplete();
            }
          }
          return next;
        });
      }, 20); // 20ms בין כל תו = קריאה טבעית

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [text, isStreaming, currentIndex, onComplete]);

  useEffect(() => {
    setDisplayedText(text.substring(0, currentIndex));
  }, [currentIndex, text]);

  return (
    <div className={`relative ${className}`}>
      {/* התוכן */}
      <div className="prose prose-invert max-w-none">
        <div 
          className="whitespace-pre-wrap text-gray-100 leading-relaxed"
          style={{ direction: 'rtl' }}
        >
          {displayedText}
        </div>
      </div>

      {/* Cursor מהבהב בזמן streaming */}
      {isStreaming && currentIndex < text.length && (
        <span className="inline-block w-1 h-5 bg-emerald-400 animate-pulse ml-1" />
      )}

      {/* אינדיקטור טעינה */}
      {isStreaming && text.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">מכין תשובה...</span>
        </div>
      )}
    </div>
  );
};

export default StreamingResponse;