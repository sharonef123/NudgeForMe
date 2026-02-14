import { motion } from 'framer-motion';
import { User, Sparkles, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  onSaveToDNA?: () => void;
}

export default function MessageBubble({ message, onSaveToDNA }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
          : 'bg-gradient-to-br from-emerald-500 to-blue-500'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'text-left' : 'text-right'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
            : 'glass-panel-light'
        }`}>
          <div className="prose prose-invert max-w-none text-right">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg glass-button text-xs flex items-center gap-1"
            title="העתק"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          {!isUser && onSaveToDNA && (
            <button
              onClick={onSaveToDNA}
              className="p-1.5 rounded-lg glass-button text-xs"
              title="שמור ל-DNA"
            >
              💾
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}