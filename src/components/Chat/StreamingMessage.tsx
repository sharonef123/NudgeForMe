import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StreamingMessageProps {
  stream: AsyncGenerator<string, void, unknown>;
  onComplete?: (fullText: string) => void;
}

const StreamingMessage = ({ stream, onComplete }: StreamingMessageProps) => {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let mounted = true;
    let fullText = '';

    const processStream = async () => {
      try {
        for await (const chunk of stream) {
          if (!mounted) break;
          fullText += chunk;
          setText(fullText);
        }
      } catch (error) {
        console.error('Streaming error:', error);
      } finally {
        if (mounted) {
          setIsStreaming(false);
          onComplete?.(fullText);
        }
      }
    };

    processStream();

    return () => {
      mounted = false;
    };
  }, [stream, onComplete]);

  return (
    <div className="space-y-2">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      
      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>מקליד...</span>
        </div>
      )}
    </div>
  );
};

export default StreamingMessage;