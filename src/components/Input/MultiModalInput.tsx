import { useState, useRef, ChangeEvent } from 'react';
import { Send, Mic, Image as ImageIcon, Paperclip, X, Loader2 } from 'lucide-react';

interface MultiModalInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => Promise<void>;
  onVoiceClick: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  url: string;
  file: File;
}

const MultiModalInput = ({ 
  onSendMessage, 
  onVoiceClick, 
  disabled = false,
  placeholder = 'שאל אותי משהו...'
}: MultiModalInputProps) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() && attachments.length === 0) return;
    if (disabled || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`הקובץ ${file.name} גדול מדי (מקסימום 10MB)`);
          continue;
        }

        // Validate image type
        if (type === 'image' && !file.type.startsWith('image/')) {
          alert(`${file.name} אינו קובץ תמונה תקין`);
          continue;
        }

        // Create object URL
        const url = URL.createObjectURL(file);

        const attachment: Attachment = {
          id: `${Date.now()}-${i}`,
          type,
          name: file.name,
          size: file.size,
          url,
          file
        };

        newAttachments.push(attachment);
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('שגיאה בהעלאת קבצים');
    } finally {
      setIsUploading(false);
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg">
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{attachment.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
              </div>

              <button
                onClick={() => removeAttachment(attachment.id)}
                className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="הסר קובץ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 border border-white/20 
                       text-white placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />

            {/* Attachment Buttons */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e, 'image')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled || isUploading || isSending}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-emerald-400 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="צרף תמונה"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e, 'file')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading || isSending}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-emerald-400 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="צרף קובץ"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Button */}
          <button
            type="button"
            onClick={onVoiceClick}
            disabled={disabled || isSending}
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                     border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30
                     text-purple-400 hover:text-purple-300
                     transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="הקלטה קולית"
          >
            <Mic className="w-6 h-6" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || disabled || isSending}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 
                     hover:from-emerald-600 hover:to-blue-600
                     text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="שלח"
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Loading indicator */}
        {isUploading && (
          <div className="absolute top-full mt-2 right-0 flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>מעלה קבצים...</span>
          </div>
        )}
      </form>

      {/* Hints */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <span>Enter לשליחה • Shift+Enter לשורה חדשה • מקסימום 10MB לקובץ</span>
      </div>
    </div>
  );
};

export default MultiModalInput;